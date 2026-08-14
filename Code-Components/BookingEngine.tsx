// BookingEngine — a single-file Framer code component.
//
// A generic multi-step form / booking engine that drops into any Framer project.
// Combines:
//   - A 1–10 step pipeline engine with per-step/per-field authoring (no hardcoded copy)
//   - Native Cal.com v2 API integration (availability + booking submission)
//   - Inlined, adapted copies of ChoiceGroup and DateAndTime (Framer code components
//     cannot import other local files). The inlined copies preserve the existing
//     focus-visible styling, keyboard interaction, and responsive layout, and add
//     two additive controlled-prop hooks so the engine can drive/restore their
//     state (Section 9.1, 9.2 of the build plan).
//
// The validation engine is the explicit fix for the "invalid step can advance" bug:
// `handleContinue()` runs `validateStep()` synchronously and only calls
// `setCurrentIndex(i + 1)` inside the `if (valid)` branch. There is no code path
// where an invalid step advances.

import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget, useIsStaticRenderer } from "framer"
import {
    motion,
    AnimatePresence,
    usePresence,
    useReducedMotion,
    type Transition,
} from "framer-motion"

// =============================================================================
// Shared color/time utilities (merged from the two inlined sources, deduped)
// =============================================================================

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function parseColorToRgb(
    color: string
): { r: number; g: number; b: number } | null {
    const trimmed = (color || "").trim()
    if (!trimmed) return null
    const hex = trimmed.replace("#", "")
    if (hex.length === 3 || hex.length === 6) {
        const normalized =
            hex.length === 3
                ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
                : hex
        const r = parseInt(normalized.slice(0, 2), 16)
        const g = parseInt(normalized.slice(2, 4), 16)
        const b = parseInt(normalized.slice(4, 6), 16)
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null
        return { r, g, b }
    }
    const rgbMatch = /^rgba?\((.*)\)$/i.exec(trimmed)
    if (!rgbMatch) return null
    const inner = rgbMatch[1].trim()
    const channelsPart = inner.split("/")[0].trim()
    const tokens = channelsPart.replace(/,/g, " ").split(/\s+/).filter(Boolean)
    if (tokens.length < 3) return null
    const parseChannel = (token: string): number | null => {
        const value = token.trim()
        if (value.endsWith("%")) {
            const p = parseFloat(value.slice(0, -1))
            if (Number.isNaN(p)) return null
            return clamp((p / 100) * 255, 0, 255)
        }
        const parsed = parseFloat(value)
        if (Number.isNaN(parsed)) return null
        return clamp(parsed, 0, 255)
    }
    const r = parseChannel(tokens[0])
    const g = parseChannel(tokens[1])
    const b = parseChannel(tokens[2])
    if (r === null || g === null || b === null) return null
    return { r, g, b }
}

function getReadableTextColor(background: string): string {
    const parsed = parseColorToRgb(background)
    if (!parsed) return "#FFFFFF"
    const luminance =
        (0.299 * parsed.r + 0.587 * parsed.g + 0.114 * parsed.b) / 255
    return luminance > 0.6 ? "#000000" : "#FFFFFF"
}

function withAlpha(color: string, alpha: number): string {
    const safeAlpha = clamp(alpha, 0, 1)
    const parsed = parseColorToRgb(color)
    if (parsed) {
        return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${safeAlpha})`
    }
    return `color-mix(in srgb, ${color} ${safeAlpha * 100}%, transparent)`
}

// T5-L8 fix: date formatting should follow the page's declared language
// (<html lang>), not the browser's default locale - they can differ (e.g. a
// German site visited from a browser set to English). Falls back to the
// browser default when the page declares no lang.
function pageLocale(): string | undefined {
    return typeof document !== "undefined"
        ? document.documentElement.lang || undefined
        : undefined
}

function parseTimeToMinutes(value: string): number {
    const match = /^(\d{1,2}):(\d{2})$/.exec((value || "").trim())
    if (!match) return 9 * 60
    const h = clamp(parseInt(match[1], 10), 0, 23)
    const m = clamp(parseInt(match[2], 10), 0, 59)
    return h * 60 + m
}

function minutesTo24h(minutes: number): string {
    const safe = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
    const h = Math.floor(safe / 60)
    const m = safe % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function formatTimeLabel(minutes: number, mode: "12h" | "24h"): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (mode === "24h")
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    const suffix = h >= 12 ? "PM" : "AM"
    const hh = h % 12 === 0 ? 12 : h % 12
    return `${hh}:${String(m).padStart(2, "0")} ${suffix}`
}

function isSameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

// CC-13 fix: `Date.getHours()`/`getMinutes()` always read the BROWSER's
// local timezone, not any timezone the visitor picked in the UI. Cal.com is
// queried with an explicit `timeZone` param, but the returned slot `start`
// values are absolute instants (ISO strings) — turning those into "minutes
// since midnight" must reference the same timezone the visitor selected, or
// a visitor in New York viewing "Asia/Tokyo" would see Tokyo slots labeled
// with New York clock times, and slots near midnight UTC could sort into
// the wrong calendar day. `Intl.DateTimeFormat` with an explicit `timeZone`
// gives the correct wall-clock hour/minute for that zone regardless of
// where the browser itself is running.
function getMinutesInTimeZone(date: Date, timeZone: string): number {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        }).formatToParts(date)
        const hourPart = parts.find((p) => p.type === "hour")?.value
        const minutePart = parts.find((p) => p.type === "minute")?.value
        const h = Number(hourPart)
        const m = Number(minutePart)
        if (Number.isNaN(h) || Number.isNaN(m)) {
            return date.getHours() * 60 + date.getMinutes()
        }
        // hourCycle "h23" can still format midnight as "24" on some engines;
        // normalize into a 0–1439 minutes-since-midnight range.
        return ((h % 24) * 60 + m) % 1440
    } catch {
        // Invalid/unsupported timeZone string — fall back to local time
        // rather than throwing.
        return date.getHours() * 60 + date.getMinutes()
    }
}

// CC-13 completion: the calendar-day bucketing (which slots belong to which
// date) must use the same timezone as the slot labels. `isSameDay` below
// reads browser-local Y/M/D, so a slot near midnight UTC can be labeled with
// the visitor's selected timezone's date but bucketed into the browser's
// date. This returns a canonical Y-M-D key for an instant in a given zone
// (zero-padded, so it is interchangeable with itself but NOT with the
// 0-based unpadded key in `dateKeyOf`'s local fallback).
function getDateKeyInTimeZone(date: Date, timeZone: string): string {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(date)
        const y = parts.find((p) => p.type === "year")?.value
        const m = parts.find((p) => p.type === "month")?.value
        const d = parts.find((p) => p.type === "day")?.value
        if (y && m && d) return `${y}-${m}-${d}`
    } catch {
        // Invalid/unsupported timeZone string — fall back to local time.
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}`
}

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// =============================================================================
// Inlined ChoiceGroup — adapted with `controlledValue` (Section 9.1)
// =============================================================================
// Source: ChoiceGroup.tsx. Only addition: an optional `controlledValue` prop.
// When provided, the parent owns the selected value and the component becomes
// a controlled input — required for sessionStorage restore and "Try Again"
// data preservation. When omitted, behavior is identical to the original
// (uncontrolled, seeded by `defaultValue`).

interface ChoiceOption {
    label: string
    glyph?: string
    // T10-L4 fix: cards/radio options can carry an image and a description
    // (parallel per-field arrays in the panel, see optionImages/
    // optionDescriptions on FieldConfig).
    image?: string
    description?: string
}

interface ChoiceGroupInlineProps {
    label: string
    inputName: string
    defaultValue: string
    variant: "cards" | "segmented" | "pills" | "radio"
    optionsText: string
    /** Direct options array — takes precedence over optionsText and avoids
     *  the comma-round-trip split bug (fix #22). */
    options?: ChoiceOption[]
    accentColor: string
    textColor: string
    mutedTextColor: string
    backgroundColor: string
    borderColor: string
    radius: number | string
    fontSize: number
    focusColor: string
    controlledValue?: string
    /** a11y: marks the group as invalid (fix #16). */
    ariaInvalid?: boolean
    /** a11y: id of an element describing the error (fix #16). */
    ariaDescribedBy?: string
    onChange?: (value: string) => void
}

function getInitialSelection(
    options: ChoiceOption[],
    defaultValue: string
): string {
    if (options.length === 0) return ""
    const match = options.find((option) => option.label === defaultValue)
    return match ? match.label : options[0].label
}

// T9-L2 fix: weekday labels derive from the locale like the month header,
// rotated to start on firstDayOfWeek. Module-level so every instance of
// DateAndTimeInline shares one implementation (the per-instance memo
// below only caches the firstDayOfWeek result).
function buildWeekdayLabels(firstDayOfWeek: number): string[] {
    const base = new Date(2023, 0, 1) // a known Sunday
    const labels: string[] = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(base)
        d.setDate(base.getDate() + ((firstDayOfWeek + i) % 7))
        labels.push(d.toLocaleDateString(pageLocale(), { weekday: "short" }))
    }
    return labels
}

function parseOptionsText(optionsText: string): ChoiceOption[] {
    return (optionsText || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .map((entry) => {
            const parts = entry.split(/\s+/)
            const first = parts[0] || ""
            if (parts.length > 1 && /^[^A-Za-z0-9]+$/u.test(first)) {
                return {
                    glyph: first,
                    label: parts.slice(1).join(" ").trim(),
                }
            }
            return { label: entry }
        })
        .filter((option) => option.label.length > 0)
}

const ChoiceGroupInline = React.memo(function ChoiceGroupInline(props: ChoiceGroupInlineProps) {
    const {
        label,
        inputName,
        defaultValue,
        variant,
        optionsText,
        options: directOptions,
        accentColor,
        textColor,
        mutedTextColor,
        backgroundColor,
        borderColor,
        radius,
        fontSize,
        focusColor,
        controlledValue,
        ariaInvalid,
        ariaDescribedBy,
        onChange,
    } = props

    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([])

    // Fix #22: prefer a direct options array (no comma round-trip) when provided.
    const parsedOptions = React.useMemo(
        () => directOptions || parseOptionsText(optionsText),
        [directOptions, optionsText]
    )

    const [measuredWidth, setMeasuredWidth] = React.useState<number>(320)
    const [internalSelected, setInternalSelected] = React.useState<string>(() =>
        getInitialSelection(parsedOptions, defaultValue)
    )
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null)
    const [isKeyboardModality, setIsKeyboardModality] = React.useState(false)
    const firedInitialRef = React.useRef(false)

    // Controlled-vs-uncontrolled source of truth.
    const selected =
        controlledValue !== undefined ? controlledValue : internalSelected

    React.useEffect(() => {
        // Only re-seed internal state when uncontrolled.
        if (controlledValue !== undefined) return
        const next = getInitialSelection(parsedOptions, defaultValue)
        React.startTransition(() => setInternalSelected(next))
    }, [defaultValue, parsedOptions, controlledValue])

    // T6-M3 fix: while controlled, `internalSelected` is not the source of
    // truth, so it silently went stale — if the parent later returned to
    // uncontrolled (controlledValue back to undefined), the component
    // resumed from a bogus seed instead of the last controlled selection.
    // Keep it in lockstep with the latest controlled value so an
    // uncontrolled fallback (or a remount reusing these refs) is correct.
    React.useEffect(() => {
        if (controlledValue === undefined) return
        if (parsedOptions.length === 0) return
        const next = getInitialSelection(parsedOptions, controlledValue)
        React.startTransition(() => setInternalSelected(next))
    }, [controlledValue, parsedOptions])

// T6-L2 fix: the one-shot mount onChange must re-fire when the author
// edits the options (parsedOptions identity changes) - otherwise the
// parent's value keeps the stale first option forever in uncontrolled
// mode. Declared BEFORE the mount effect so the reset lands first and
// the one-shot effect below observes the fresh flag.
React.useEffect(() => {
    if (parsedOptions.length > 0) {
        firedInitialRef.current = false
    }
}, [parsedOptions])

// Fix #1: when uncontrolled, fire onChange once on mount so the parent's
// `values[field.id]` matches the visually-highlighted first option. Without
// this, a required choice field shows an option highlighted but fails
// validation because the parent never received the value.
    React.useEffect(() => {
        if (firedInitialRef.current) return
        if (controlledValue !== undefined) return
        if (parsedOptions.length === 0) return
        firedInitialRef.current = true
        onChange?.(internalSelected)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsedOptions, controlledValue])

React.useLayoutEffect(() => {
    if (
        typeof window !== "undefined" &&
        typeof ResizeObserver !== "undefined"
    ) {
        if (!rootRef.current) return
        const observer = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect?.width
            if (typeof width === "number") {
                React.startTransition(() => setMeasuredWidth(width))
            }
        })
        observer.observe(rootRef.current)
        return () => observer.disconnect()
    }
}, [])

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const onKeyDown = (event: KeyboardEvent) => {
                if (event.metaKey || event.altKey || event.ctrlKey) return
                React.startTransition(() => setIsKeyboardModality(true))
            }
            const onPointer = () => {
                React.startTransition(() => setIsKeyboardModality(false))
            }
            window.addEventListener("keydown", onKeyDown)
            window.addEventListener("mousedown", onPointer)
            window.addEventListener("pointerdown", onPointer)
            window.addEventListener("touchstart", onPointer, { passive: true })
            return () => {
                window.removeEventListener("keydown", onKeyDown)
                window.removeEventListener("mousedown", onPointer)
                window.removeEventListener("pointerdown", onPointer)
                window.removeEventListener("touchstart", onPointer)
            }
        }
    }, [])

    const selectedTextColor = React.useMemo(
        () => getReadableTextColor(accentColor),
        [accentColor]
    )
    const focusInset = React.useMemo(
        () => `inset 0 0 0 2px ${focusColor}`,
        [focusColor]
    )
    const compact = measuredWidth < COMPACT_BREAKPOINT
    const effectiveFontSize = Math.max(14, fontSize)
    const columns = React.useMemo(() => {
        if (measuredWidth >= CHOICE_COLUMNS_BREAKPOINT_WIDE) return 5
        if (measuredWidth >= CHOICE_COLUMNS_BREAKPOINT_MEDIUM) return 3
        return 2
    }, [measuredWidth])

    const selectOption = React.useCallback(
        (value: string) => {
            if (controlledValue === undefined) {
                React.startTransition(() => setInternalSelected(value))
            }
            onChange?.(value)
        },
        [onChange, controlledValue]
    )

    const moveFocus = React.useCallback(
        (currentIndex: number, delta: number) => {
            const count = parsedOptions.length
            if (count === 0) return
            const nextIndex = (currentIndex + delta + count) % count
            const next = parsedOptions[nextIndex]
            if (!next) return
            buttonRefs.current[nextIndex]?.focus()
            React.startTransition(() => setFocusedIndex(nextIndex))
            selectOption(next.label)
        },
        [parsedOptions, selectOption]
    )

    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault()
                moveFocus(index, 1)
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault()
                moveFocus(index, -1)
            } else if (event.key === "Home") {
                event.preventDefault()
                buttonRefs.current[0]?.focus()
                const first = parsedOptions[0]
                if (first) selectOption(first.label)
            } else if (event.key === "End") {
                event.preventDefault()
                const lastIndex = parsedOptions.length - 1
                if (lastIndex >= 0) {
                    buttonRefs.current[lastIndex]?.focus()
                    const last = parsedOptions[lastIndex]
                    if (last) selectOption(last.label)
                }
            }
        },
        [moveFocus, parsedOptions, selectOption]
    )

    const groupCommonStyle: React.CSSProperties = {
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "inherit",
    }

    const renderOptionButton = (
        option: ChoiceOption,
        index: number,
        extraStyle: React.CSSProperties = {},
        labelExtraStyle: React.CSSProperties = {}
    ) => {
        const isSelected = option.label === selected
        const isHovered = hoveredIndex === index
        const isFocused = focusedIndex === index
        // T10-L4 fix: images/descriptions render on cards (and radio rows);
        // pills/segmented stay compact text-only.
        const showMedia = variant === "cards" || variant === "radio"
        return (
            <button
                key={option.label}
                ref={(node) => {
                    buttonRefs.current[index] = node
                }}
type="button"
                        role="radio"
                        aria-checked={isSelected}
                        // T4-M6 fix: the option buttons previously carried
                        // no invalid/describedby hints of their own - only
                        // the radiogroup container did - so screen readers
                        // focusing an option never heard the error
                        // association. Propagate both to each button.
                        aria-invalid={ariaInvalid || undefined}
                        aria-describedby={ariaDescribedBy}
                        // Fix #17: roving tabindex — only the selected (or first)
                // option is tabbable; Arrow keys move focus between options.
                tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
                onClick={() => selectOption(option.label)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onMouseEnter={() =>
                    React.startTransition(() => setHoveredIndex(index))
                }
                onMouseLeave={() =>
                    React.startTransition(() => setHoveredIndex(null))
                }
                onFocus={() =>
                    React.startTransition(() => setFocusedIndex(index))
                }
                onBlur={() =>
                    React.startTransition(() => setFocusedIndex(null))
                }
                style={{
                    minHeight: TOUCH_TARGET_MIN,
                    borderRadius: radius,
                    border: `1px solid ${isSelected || isHovered ? accentColor : borderColor}`,
                    background: isSelected ? accentColor : backgroundColor,
                    color: isSelected ? selectedTextColor : textColor,
                    cursor: "pointer",
                    outline: "none",
                    boxShadow:
                        isKeyboardModality && isFocused
                            ? focusInset
                            : isSelected
                              ? `inset 0 0 0 1px ${accentColor}`
                              : "none",
                    fontFamily: "inherit",
                    fontSize: effectiveFontSize,
                    lineHeight: 1.2,
                    overflow: "hidden",
                    transition:
                        "border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease",
                    ...extraStyle,
                }}
            >
                {/* T10-L3 fix: radio rows get a real radio-circle indicator
                    so they stop being visually indistinguishable from
                    cards — the row fills with the accent color and the
                    circle carries the filled-dot state. */}
                {variant === "radio" ? (
                    <span
                        aria-hidden="true"
                        style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${
                                isSelected ? selectedTextColor : borderColor
                            }`,
                            background: "transparent",
                            boxSizing: "border-box",
                            flexShrink: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {isSelected ? (
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: selectedTextColor,
                                }}
                            />
                        ) : null}
                    </span>
                ) : null}
                {showMedia && option.image ? (
                    <img
                        src={option.image}
                        alt=""
                        aria-hidden="true"
                        style={{
                            display: "block",
                            maxWidth: "100%",
                            maxHeight: 48,
                            objectFit: "contain",
                            borderRadius: radius,
                            margin: "0 auto 6px",
                        }}
                    />
                ) : null}
                {variant !== "radio" && option.glyph ? (
                    <span
                        style={{
                            display: "block",
                            fontSize: effectiveFontSize + 6,
                            lineHeight: 1.1,
                            marginBottom: 4,
                        }}
                    >
                        {option.glyph}
                    </span>
                ) : null}
                {variant === "radio" ? (
                    <span
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            minWidth: 0,
                            flex: 1,
                        }}
                    >
                        <span
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                                minWidth: 0,
                                maxWidth: "100%",
                            }}
                        >
                            {option.label}
                        </span>
                        {showMedia && option.description ? (
                            <span
                                style={{
                                    display: "block",
                                    fontSize: effectiveFontSize - 2,
                                    color: isSelected
                                        ? selectedTextColor
                                        : mutedTextColor,
                                    marginTop: 2,
                                    fontWeight: 400,
                                    lineHeight: 1.35,
                                    whiteSpace: "normal",
                                    textAlign: "left",
                                }}
                            >
                                {option.description}
                            </span>
                        ) : null}
                    </span>
                ) : (
                    <span
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                            minWidth: 0,
                            ...labelExtraStyle,
                        }}
                    >
                        {option.label}
                    </span>
                )}
                {variant === "cards" && showMedia && option.description ? (
                    <span
                        style={{
                            display: "block",
                            fontSize: effectiveFontSize - 2,
                            color: isSelected
                                ? selectedTextColor
                                : mutedTextColor,
                            marginTop: 4,
                            fontWeight: 400,
                            lineHeight: 1.35,
                            whiteSpace: "normal",
                            textAlign: "center",
                        }}
                    >
                        {option.description}
                    </span>
                ) : null}
            </button>
        )
    }

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "auto",
                boxSizing: "border-box",
                fontFamily: "inherit",
                minWidth: 0,
            }}
        >
            <input type="hidden" name={inputName} value={selected} />
            {label ? (
                <div
                    style={{
                        fontSize: Math.max(11, effectiveFontSize - 2),
                        color: mutedTextColor,
                        marginBottom: 8,
                        fontFamily: "inherit",
                    }}
                >
                    {label}
                </div>
            ) : null}
            {variant === "cards" ? (
                <div
                    role="radiogroup"
                    aria-label={label || inputName || "Choice group"}
                    aria-invalid={ariaInvalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    style={{
                        ...groupCommonStyle,
                        display: "grid",
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                        gap: compact ? 6 : 8,
                        minWidth: 0,
                    }}
                >
                    {parsedOptions.map((option, index) =>
                        renderOptionButton(option, index, {
                            padding: compact ? "10px 6px" : "10px 8px",
                            textAlign: "center",
                        })
                    )}
                </div>
            ) : null}
            {variant === "segmented" ? (
                <div
                    role="radiogroup"
                    aria-label={label || inputName || "Choice group"}
                    aria-invalid={ariaInvalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    className="be-scrollbar-none"
                    style={{
                        ...groupCommonStyle,
                        display: "flex",
                        border: `1px solid ${borderColor}`,
                        borderRadius: radius,
                        // T10-L2 fix: 5+ options used to crush their labels
                        // into ellipsis on narrow screens — the group never
                        // scrolled. Now the row scrolls horizontally and the
                        // buttons keep their natural (non-truncated) label
                        // width; the scrollbar is hidden so the control still
                        // reads as a single segmented bar.
                        overflowX: "auto",
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                        minWidth: 0,
                    }}
                >
                    {parsedOptions.map((option, index) =>
                        renderOptionButton(option, index, {
                            flex: "1 0 auto",
                            borderRadius: 0,
                            border: "none",
                            borderRight:
                                index < parsedOptions.length - 1
                                    ? `1px solid ${option.label === selected ? accentColor : borderColor}`
                                    : "none",
                            padding: compact ? "10px 6px" : "10px 8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            minWidth: 0,
                        }, {
                            // T10-L2 fix: keep the full label in the scroll
                            // row — truncation only returned when it wrapped.
                            overflow: "visible",
                            textOverflow: "clip",
                            whiteSpace: "nowrap",
                        })
                    )}
                </div>
            ) : null}
            {variant === "radio" ? (
                <div
                    role="radiogroup"
                    aria-label={label || inputName || "Choice group"}
                    aria-invalid={ariaInvalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    style={{
                        ...groupCommonStyle,
                        display: "flex",
                        flexDirection: "column",
                        gap: compact ? 6 : 8,
                        minWidth: 0,
                    }}
                >
                    {parsedOptions.map((option, index) =>
                        renderOptionButton(option, index, {
                            width: "100%",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                            gap: 10,
                            textAlign: "left",
                            padding: "10px 14px",
                            flexShrink: 0,
                        })
                    )}
                </div>
            ) : null}
            {variant === "pills" ? (
                <div
                    role="radiogroup"
                    aria-label={label || inputName || "Choice group"}
                    aria-invalid={ariaInvalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    style={{
                        ...groupCommonStyle,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: compact ? 6 : 8,
                        minWidth: 0,
                    }}
                >
                    {parsedOptions.map((option, index) =>
                        renderOptionButton(option, index, {
                            padding: compact ? "10px 10px" : "10px 12px",
                            borderRadius: 999,
                            flex:
                                measuredWidth < PILLS_SINGLE_COLUMN_BREAKPOINT
                                    ? "1 1 calc(50% - 4px)"
                                    : "0 0 auto",
                            minWidth:
                                measuredWidth < PILLS_SINGLE_COLUMN_BREAKPOINT
                                    ? "calc(50% - 4px)"
                                    : "auto",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                        })
                    )}
                </div>
            ) : null}
        </div>
    )
})
// =============================================================================
// T9-M1/T9-M6 fix: the 42-cell calendar grid used to define 6 inline
// handlers per cell (252 closures per render) and lived in the same scope as
// the time grid, so clicking a time slot re-rendered every cell. Both cells
// and the whole date-picker grid are now extracted as memoized components:
// hover/focus/time-selection only re-render what actually changed.
// =============================================================================

interface CalendarCellProps {
    date: Date
    dateKey: string
    isUnavailable: boolean
    isSelected: boolean
    isToday: boolean
    isTodayHighlighted: boolean
    isRingHover: boolean
    isFocus: boolean
    tabIndex: number
    firstDayOfWeek: number
    isKeyboardModality: boolean
    locale?: string
    accentColor: string
    borderColor: string
    subtleFill: string
    textColor: string
    selectedAccentText: string
    mutedSoftText: string
    focusInset: string
    onSelect: (date: Date) => void
    onMoveFocus: (date: Date) => void
    onGoToNextMonth: () => void
    onGoToPreviousMonth: () => void
    onHoverChange: (dateKey: string | null) => void
    onFocusChange: (dateKey: string | null) => void
}

const CalendarCell = React.memo(function CalendarCell({
    date,
    dateKey,
    isUnavailable,
    isSelected,
    isToday,
    isTodayHighlighted,
    isRingHover,
    isFocus,
    tabIndex,
    firstDayOfWeek,
    isKeyboardModality,
    locale,
    accentColor,
    borderColor,
    subtleFill,
    textColor,
    selectedAccentText,
    mutedSoftText,
    focusInset,
    onSelect,
    onMoveFocus,
    onGoToNextMonth,
    onGoToPreviousMonth,
    onHoverChange,
    onFocusChange,
}: CalendarCellProps) {
    return (
        <button
            type="button"
            role="gridcell"
            disabled={isUnavailable}
            aria-disabled={isUnavailable}
            aria-selected={isSelected}
            aria-label={
                date.toLocaleDateString(locale, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }) + (isToday ? " (Today)" : "")
            }
            data-date-key={dateKey}
            tabIndex={isUnavailable ? -1 : tabIndex}
            onMouseEnter={() => {
                if (!isUnavailable)
                    React.startTransition(() => onHoverChange(dateKey))
            }}
            onMouseLeave={() => {
                if (!isUnavailable)
                    React.startTransition(() => onHoverChange(null))
            }}
            onFocus={() =>
                React.startTransition(() => onFocusChange(`date-${dateKey}`))
            }
            onBlur={() => React.startTransition(() => onFocusChange(null))}
            onClick={() => onSelect(date)}
            onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                    e.preventDefault()
                    const target = new Date(date)
                    target.setDate(date.getDate() + 1)
                    onMoveFocus(target)
                } else if (e.key === "ArrowLeft") {
                    e.preventDefault()
                    const target = new Date(date)
                    target.setDate(date.getDate() - 1)
                    onMoveFocus(target)
                } else if (e.key === "ArrowDown") {
                    e.preventDefault()
                    const target = new Date(date)
                    target.setDate(date.getDate() + 7)
                    onMoveFocus(target)
                } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    const target = new Date(date)
                    target.setDate(date.getDate() - 7)
                    onMoveFocus(target)
                } else if (e.key === "Home") {
                    e.preventDefault()
                    const offset =
                        (date.getDay() - firstDayOfWeek + 7) % 7
                    const target = new Date(date)
                    target.setDate(date.getDate() - offset)
                    onMoveFocus(target)
                } else if (e.key === "End") {
                    e.preventDefault()
                    const offset =
                        (date.getDay() - firstDayOfWeek + 7) % 7
                    const target = new Date(date)
                    target.setDate(date.getDate() + (6 - offset))
                    onMoveFocus(target)
                } else if (e.key === "PageDown") {
                    e.preventDefault()
                    onGoToNextMonth()
                } else if (e.key === "PageUp") {
                    e.preventDefault()
                    onGoToPreviousMonth()
                }
            }}
            style={{
                minHeight: TOUCH_TARGET_MIN,
                minWidth: TOUCH_TARGET_MIN,
                borderRadius: 6,
                border: `1px solid ${isUnavailable ? "transparent" : borderColor}`,
                background:
                    isSelected || isTodayHighlighted
                        ? accentColor
                        : isUnavailable
                          ? "transparent"
                          : subtleFill,
                color:
                    isSelected || isTodayHighlighted
                        ? selectedAccentText
                        : isUnavailable
                          ? mutedSoftText
                          : textColor,
                cursor: isUnavailable ? "default" : "pointer",
                fontSize: 14,
                transition:
                    "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, color 0.16s ease",
                boxShadow:
                    isKeyboardModality && isFocus
                        ? isSelected || isTodayHighlighted
                            ? `inset 0 0 0 2px ${selectedAccentText}, inset 0 0 0 4px ${accentColor}`
                            : focusInset
                        : isSelected || isTodayHighlighted
                          ? `inset 0 0 0 1px ${accentColor}`
                          : isRingHover
                            ? `inset 0 0 0 1px ${accentColor}`
                            : "none",
                fontWeight: isTodayHighlighted && !isSelected ? 700 : 400,
            }}
        >
            {date.getDate()}
        </button>
    )
})

interface CalendarGridProps {
    monthName: string
    yearLabel: string
    prevMonthLabel: string
    nextMonthLabel: string
    canGoPrev: boolean
    canGoNext: boolean
    weekdayLabels: string[]
    cells: Date[]
    visibleMonth: Date
    selectedDate: Date | null
    today: Date
    hoveredDateKey: string | null
    focusedKey: string | null
    isKeyboardModality: boolean
    isNarrow: boolean
    firstDayOfWeek: number
    dateKeyOf: (date: Date) => string
    hasAvailability: (date: Date) => boolean
    dateTabIndexByKey: Map<string, number>
    locale?: string
    accentColor: string
    borderColor: string
    subtleFill: string
    textColor: string
    selectedAccentText: string
    mutedSoftText: string
    mutedText: string
    focusInset: string
    onPrevMonth: () => void
    onNextMonth: () => void
    onSelectDate: (date: Date) => void
    onMoveFocus: (date: Date) => void
    onHoverChange: (dateKey: string | null) => void
    onFocusChange: (dateKey: string | null) => void
}

const CalendarGrid = React.memo(function CalendarGrid({
    monthName,
    yearLabel,
    prevMonthLabel,
    nextMonthLabel,
    canGoPrev,
    canGoNext,
    weekdayLabels,
    cells,
    visibleMonth,
    selectedDate,
    today,
    hoveredDateKey,
    focusedKey,
    isKeyboardModality,
    isNarrow,
    firstDayOfWeek,
    dateKeyOf,
    hasAvailability,
    dateTabIndexByKey,
    locale,
    accentColor,
    borderColor,
    subtleFill,
    textColor,
    selectedAccentText,
    mutedSoftText,
    mutedText,
    focusInset,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
    onMoveFocus,
    onHoverChange,
    onFocusChange,
}: CalendarGridProps) {
    const rows: React.ReactNode[] = []
    for (let r = 0; r < CALENDAR_WEEKS_TO_RENDER; r++) {
        rows.push(
            <div
                role="row"
                key={`row-${r}`}
                style={{ display: "contents" }}
            >
                {cells.slice(r * 7, r * 7 + 7).map((date) => {
                    const dateKey = dateKeyOf(date)
                    const isInMonth =
                        date.getMonth() === visibleMonth.getMonth()
                    const isPast =
                        startOfDay(date).getTime() < today.getTime()
                    const isUnavailable =
                        !isInMonth ||
                        isPast ||
                        !hasAvailability(date)
                    const isSelected = isSameDay(selectedDate, date)
                    const isToday = isSameDay(today, date)
                    const isTodayHighlighted = isToday
                    const isRingHover =
                        hoveredDateKey === dateKey &&
                        !isUnavailable &&
                        !isSelected &&
                        !isTodayHighlighted
                    const isFocus = focusedKey === `date-${dateKey}`
                    return (
                        <CalendarCell
                            key={dateKey}
                            date={date}
                            dateKey={dateKey}
                            isUnavailable={isUnavailable}
                            isSelected={isSelected}
                            isToday={isToday}
                            isTodayHighlighted={isTodayHighlighted}
                            isRingHover={isRingHover}
                            isFocus={isFocus}
                            tabIndex={
                                dateTabIndexByKey.get(dateKey) ?? 0
                            }
                            firstDayOfWeek={firstDayOfWeek}
                            isKeyboardModality={isKeyboardModality}
                            locale={locale}
                            accentColor={accentColor}
                            borderColor={borderColor}
                            subtleFill={subtleFill}
                            textColor={textColor}
                            selectedAccentText={selectedAccentText}
                            mutedSoftText={mutedSoftText}
                            focusInset={focusInset}
                            onSelect={onSelectDate}
                            onMoveFocus={onMoveFocus}
                            onGoToNextMonth={onNextMonth}
                            onGoToPreviousMonth={onPrevMonth}
                            onHoverChange={onHoverChange}
                            onFocusChange={onFocusChange}
                        />
                    )
                })}
            </div>
        )
    }
    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    gap: 8,
                }}
            >
                <div style={{ display: "flex", alignItems: "baseline" }}>
                    <h3
                        style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: 16,
                        }}
                    >
                        {monthName}
                        <span
                            style={{
                                marginLeft: 6,
                                color: mutedText,
                                fontSize: 16,
                                fontWeight: 500,
                            }}
                        >
                            {yearLabel}
                        </span>
                    </h3>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 24,
                    }}
                >
                    <button
                        type="button"
                        aria-label={`Previous month, ${prevMonthLabel}`}
                        onClick={() => onPrevMonth()}
                        disabled={!canGoPrev}
                        tabIndex={0}
                        style={{
                            appearance: "none",
                            background: "transparent",
                            color: canGoPrev ? textColor : mutedSoftText,
                            border: "none",
                            borderRadius: 6,
                            width: TOUCH_TARGET_MIN,
                            height: TOUCH_TARGET_MIN,
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: canGoPrev ? "pointer" : "not-allowed",
                            opacity: canGoPrev ? 1 : 0.55,
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M9.75 3.25L5 8l4.75 4.75"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <button
                        type="button"
                        aria-label={`Next month, ${nextMonthLabel}`}
                        onClick={() => onNextMonth()}
                        disabled={!canGoNext}
                        tabIndex={0}
                        style={{
                            appearance: "none",
                            background: "transparent",
                            color: canGoNext ? textColor : mutedSoftText,
                            border: "none",
                            borderRadius: 6,
                            width: TOUCH_TARGET_MIN,
                            height: TOUCH_TARGET_MIN,
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: canGoNext ? "pointer" : "not-allowed",
                            opacity: canGoNext ? 1 : 0.55,
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M6.25 3.25L11 8l-4.75 4.75"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div
                aria-live="polite"
                style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                }}
            >
                {monthName} {yearLabel}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(44px, 1fr))",
                    gap: 6,
                    marginBottom: 8,
                }}
            >
                {weekdayLabels.map((label) => (
                    <div
                        key={label}
                        style={{
                            textAlign: "center",
                            fontSize: 12,
                            opacity: 0.65,
                            color: mutedText,
                            padding: "4px 0",
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div
                role="grid"
                aria-label={`${monthName} ${yearLabel}`}
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(44px, 1fr))",
                    gap: isNarrow ? 4 : 6,
                }}
            >
                {rows}
            </div>
        </>
    )
})


// =============================================================================
// Inlined DateAndTime — adapted with `initialDate`/`initialTime`/`availableTimes`
// (Section 9.1, 9.2)
// =============================================================================
// Source: DateAndTime.tsx. Additive changes:
//   - `initialDate?: Date | null` and `initialTime?: string | null` seed and
//     re-sync the date/time state from the parent (enables retry preservation).
//   - `availableTimes?: Array<{ value: string; label: string }>` overrides the
//     internally generated time grid. When provided, the calendar shows real
//     Cal.com availability. When omitted, falls back to the existing
//     startTime/endTime/interval arithmetic unchanged.
//   - `confirmationMode` is hardcoded to "External Button" — the engine owns
//     the Book button and reads `onSelectionReady` to set `values[SELECTED_SLOT_KEY]`.

const SELECTED_SLOT_KEY = "__selectedSlot" as const

interface BookingPayload {
    date: Date
    time24h: string
    timeLabel: string
    /** Optional Cal.com slot end (ISO string) - used for ICS DTEND. */
    end?: string
}

// T7-H1 / T7-M5 fix: the form's central state is no longer Record<string,
// any> - field values are strings/booleans, and `__selectedSlot` is a typed
// top-level member instead of a magic string read through unchecked casts.
type BookingValues = Record<string, string | boolean | undefined> & {
    [SELECTED_SLOT_KEY]?: BookingPayload
}

// T7-M3 fix: the time picker (format toggle + slot list) is now its own
// memoized component. DateAndTimeInline re-renders it only when
// time-related props change (format, hover, selection, slot data), so
// calendar interaction no longer rebuilds the slot list, and vice versa.
interface TimeSlotListProps {
    isNarrow: boolean
    activeTimeFormat: "12h" | "24h"
    setActiveTimeFormat: (format: "12h" | "24h") => void
    onTimeFormatChange?: (format: "12h" | "24h") => void
    focusedKey: string | null
    setFocusedKey: (key: string | null) => void
    isKeyboardModality: boolean
    prefersReducedMotion: boolean
    accentColor: string
    softerFill: string
    subtleBorder: string
    borderColor: string
    textColor: string
    selectedAccentText: string
    mutedText: string
    mutedSoftText: string
    focusInset: string
    loadingLabel: string
    dtInstanceId: string
    slotsLoading: boolean
    selectedDate: Date | null
    showTimesWithoutDate: boolean
    timeOptions: Array<{
        value: string
        label: string
        end?: string
        minutes: number
    }>
    availableTimes:
        | Array<{
              value: string
              label: string
              end?: string
              minutes: number
          }>
        | undefined
    selectedTime: string | null
    hoveredTime: string | null
    setHoveredTime: (time: string | null) => void
    onSelectTime: (value: string) => void
    isTimeElapsed: (time: { value: string; minutes: number }) => boolean
}

const TimeSlotList = React.memo(function TimeSlotList(props: TimeSlotListProps) {
    const {
        isNarrow,
        activeTimeFormat,
        setActiveTimeFormat,
        onTimeFormatChange,
        focusedKey,
        setFocusedKey,
        isKeyboardModality,
        prefersReducedMotion,
        accentColor,
        softerFill,
        subtleBorder,
        borderColor,
        textColor,
        selectedAccentText,
        mutedText,
        mutedSoftText,
        focusInset,
        loadingLabel,
        dtInstanceId,
        slotsLoading,
        selectedDate,
        showTimesWithoutDate,
        timeOptions,
        availableTimes,
        selectedTime,
        hoveredTime,
        setHoveredTime,
        onSelectTime,
        isTimeElapsed,
    } = props
    return (
                <aside
                    aria-label="Time slots"
                    style={{
                        width: isNarrow ? "100%" : 220,
                        minWidth: 0,
                        borderLeft: isNarrow ? "none" : subtleBorder,
                        borderTop: isNarrow ? subtleBorder : "none",
                        padding: isNarrow ? "10px 12px 12px" : 12,
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: isNarrow ? 8 : 10,
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            background: softerFill,
                            border: subtleBorder,
                            borderRadius: 999,
                            overflow: "hidden",
                            width: "100%",
                            padding: 3,
                            minHeight: TOUCH_TARGET_MIN,
                            boxSizing: "border-box",
                            gap: 2,
                        }}
                    >
                        <motion.div
                            animate={{
                                left: activeTimeFormat === "12h" ? 3 : "50%",
                            }}
                            transition={
                                prefersReducedMotion
                                    ? INSTANT_TRANSITION
                                    : TIME_TOGGLE_TRANSITION
                            }
                            style={{
                                position: "absolute",
                                top: 3,
                                bottom: 3,
                                width: "calc(50% - 6px)",
                                borderRadius: 999,
                                background: accentColor,
                                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
                                pointerEvents: "none",
                            }}
                        />
                        {(["12h", "24h"] as Array<"12h" | "24h">).map(
                            (format) => {
                                const active = activeTimeFormat === format
                                const isFocus =
                                    focusedKey === `format-${format}`
                                return (
                                    <button
                                        key={format}
                                        type="button"
                                        // M10 fix: this is a two-way toggle
                                        // (12h vs 24h) with no ARIA state at
                                        // all previously — a screen reader
                                        // had no way to know which format
                                        // was currently active.
                                        aria-pressed={active}
                                        tabIndex={0}
                                        onClick={() =>
                                            React.startTransition(() => {
                                                setActiveTimeFormat(format)
                                                onTimeFormatChange?.(format)
                                            })
                                        }
                                        onFocus={() =>
                                            React.startTransition(() =>
                                                setFocusedKey(
                                                    `format-${format}`
                                                )
                                            )
                                        }
                                        onBlur={() =>
                                            React.startTransition(() =>
                                                setFocusedKey(null)
                                            )
                                        }
                    style={{
                        flex: 1,
                        // T5-L1 fix: 38px was under the 44x44px minimum
                        // touch-target size.
                        minHeight: TOUCH_TARGET_MIN,
                                            border: "none",
                                            borderRadius: 999,
                                            background: "transparent",
                                            color: active
                                                ? selectedAccentText
                                                : textColor,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            transition:
                                                "color 0.18s ease, box-shadow 0.18s ease",
                                            boxShadow:
                                                isKeyboardModality && isFocus
                                                    ? focusInset
                                                    : "none",
                                            position: "relative",
                                            zIndex: 1,
                                        }}
                                    >
                                        {format}
                                    </button>
                                )
                            }
                        )}
                    </div>

                    <div
                        className={`be-dt-scroll-${dtInstanceId}`}
                        style={{
                            overflowY: "auto",
                            maxHeight: 220,
                            minWidth: 0,
                            // Requirement 4: hide the scrollbar across
                            // Firefox (scrollbarWidth) and older Edge/IE
                            // (msOverflowStyle) while keeping the list
                            // scrollable. WebKit/Blink (Chrome, Safari) need
                            // the ::-webkit-scrollbar rule below instead —
                            // there's no inline-style equivalent for it.
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {/* Fix #18: when no date is picked (and the engine asked
                            us to hide times until a date is chosen), show a
                            hint instead of dumping all month slots. */}
                        {slotsLoading ? (
                            <div
                                role="status"
                                aria-live="polite"
                                style={{
                                    padding: "16px 8px",
                                    textAlign: "center",
                                    color: mutedText,
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                }}
                            >
                                {loadingLabel}
                            </div>
                        ) : !selectedDate && !showTimesWithoutDate ? (
                            <div
                                style={{
                                    padding: "16px 8px",
                                    textAlign: "center",
                                    color: mutedText,
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                }}
                                // T5-H8 completion: dynamic availability
                                // hints need announcing; previously silent.
                                role="status"
                                aria-live="polite"
                            >
                                Pick a date to see times
                            </div>
                        ) : timeOptions.length === 0 &&
                          availableTimes === undefined ? (
                            // L3 fix: only show this fallback "No available
                            // times" empty-state when the parent ISN'T
                            // driving this from Cal.com. In Cal.com mode
                            // (availableTimes !== undefined), the parent's
                            // own outer banner — copy.noTimesLabel — already
                            // owns the "no slots for this day" messaging,
                            // so duplicating it here would stack two
                            // "no times" panels on top of each other.
                            // This branch now only fires in genuine demo
                            // mode, where the synthetic grid happened to
                            // produce zero slots (e.g. startTime>endTime).
                            <div
                                style={{
                                    padding: "16px 8px",
                                    textAlign: "center",
                                    color: mutedText,
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                }}
                                // Same T5-H8 fix: "no availability" is a
                                // status change screen readers must hear.
                                role="status"
                                aria-live="polite"
                            >
                                No available times
                            </div>
                        ) : timeOptions.length === 0 ? (
                            // Cal.com mode with zero slots for this day —
                            // the parent's outer banner handles the message;
                            // render an empty spacer here to avoid the L3
                            // duplicate-panel layout.
                            <div style={{ padding: "8px 0" }} />
                        ) : (
<div
                        style={{
                            display: "grid",
                            // M8 fix: was a single `1fr` column, so
                            // any day with more than a handful of
                            // slots turned into a long scroll inside
                            // an already-short (220px) sidebar. Two
                            // columns roughly halves that.
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                            gap: isNarrow ? 6 : 8,
                            minWidth: 0,
                        }}
                        // T5-H3 fix: the time buttons were presented as
                        // plain buttons (aria-pressed), and T5-M1: every
                        // button was tabbable with no arrow-key navigation.
                        // The list is now a proper single-tab radio group
                        // with roving tabindex and arrow keys, matching the
                        // date grid's keyboard model.
                        role="radiogroup"
                        aria-label="Available times"
                        onKeyDown={(e) => {
                            const keys = [
                                "ArrowRight",
                                "ArrowDown",
                                "ArrowLeft",
                                "ArrowUp",
                            ]
                            if (!keys.includes(e.key)) return
                            e.preventDefault()
                            const buttons = Array.from(
                                e.currentTarget.querySelectorAll<HTMLButtonElement>(
                                    "button[role='radio']"
                                )
                            )
                            if (!buttons.length) return
                            const idx = selectedTime
                                ? Math.max(
                                      0,
                                      timeOptions.findIndex(
                                          (t) => t.value === selectedTime
                                      )
                                  )
                                : 0
                            const move =
                                e.key === "ArrowRight" || e.key === "ArrowDown"
                                    ? 1
                                    : -1
                            const next =
                                (idx + move + buttons.length) % buttons.length
                            const target = buttons[next]
                            if (target && !target.disabled) {
                                target.focus()
                                onSelectTime(timeOptions[next].value)
                            }
                        }}
                    >
                                {timeOptions.map((time) => {
                                    const selected = selectedTime === time.value
                                    // H3 fix: an elapsed slot is shown but
                                    // disabled, the same treatment past
                                    // calendar dates already get, rather
                                    // than staying fully clickable.
                                    const elapsed = isTimeElapsed(time)
                                    const isHover =
                                        hoveredTime === time.value &&
                                        !selected &&
                                        !elapsed
                                    const isFocus =
                                        focusedKey === `time-${time.value}`
                                    return (
<button
                        key={time.value}
                        type="button"
                        // T5-H3 fix (continued): each slot is now a radio in
                        // the group above, and T5-M1: only the currently
                        // selected slot stays tabbable - arrows move it.
                        role="radio"
                        aria-checked={selected}
                        disabled={elapsed}
                        aria-disabled={elapsed}
                        tabIndex={elapsed ? -1 : selected ? 0 : -1}
                                            onMouseEnter={() => {
                                                if (elapsed) return
                                                React.startTransition(() =>
                                                    setHoveredTime(time.value)
                                                )
                                            }}
                                            onMouseLeave={() =>
                                                React.startTransition(() =>
                                                    setHoveredTime(null)
                                                )
                                            }
                                            onFocus={() =>
                                                React.startTransition(() =>
                                                    setFocusedKey(
                                                        `time-${time.value}`
                                                    )
                                                )
                                            }
                                            onBlur={() =>
                                                React.startTransition(() =>
                                                    setFocusedKey(null)
                                                )
                                            }
onClick={() => {
                            if (elapsed) return
                            onSelectTime(time.value)
                        }}
                                            style={{
                                                minHeight: TOUCH_TARGET_MIN,
                                                border: `1px solid ${isHover ? accentColor : borderColor}`,
                                                borderRadius: 6,
                                                padding: isNarrow
                                                    ? "10px 10px"
                                                    : "10px 12px",
                                                background: selected
                                                    ? accentColor
                                                    : "transparent",
                                                color: elapsed
                                                    ? mutedSoftText
                                                    : selected
                                                      ? selectedAccentText
                                                      : textColor,
                                                fontSize: 14,
                                                cursor: elapsed
                                                    ? "not-allowed"
                                                    : "pointer",
                                                opacity: elapsed ? 0.5 : 1,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                transition:
                                                    "border-color 0.16s ease, background-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease",
                                                boxShadow:
                                                    isKeyboardModality &&
                                                    isFocus
                                                        ? focusInset
                                                        : selected
                                                          ? `inset 0 0 0 1px ${accentColor}`
                                                          : "none",
                                            }}
                                        >
                                            {time.label}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </aside>
    )
})

// T7-M3 fix: keyboard-modality detection (focus rings only when the user is
// actually using a keyboard) moved out of DateAndTimeInline into its own
// hook — the window listeners and the state they feed were pure
// bookkeeping unrelated to the component's own rendering.
function useKeyboardModality(): boolean {
    const [isKeyboardModality, setIsKeyboardModality] = React.useState(false)
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const onKeyDown = (event: KeyboardEvent) => {
                if (event.metaKey || event.altKey || event.ctrlKey) return
                React.startTransition(() => setIsKeyboardModality(true))
            }
            const onPointer = () => {
                React.startTransition(() => setIsKeyboardModality(false))
            }
            window.addEventListener("keydown", onKeyDown)
            window.addEventListener("mousedown", onPointer)
            window.addEventListener("pointerdown", onPointer)
            window.addEventListener("touchstart", onPointer, { passive: true })
            return () => {
                window.removeEventListener("keydown", onKeyDown)
                window.removeEventListener("mousedown", onPointer)
                window.removeEventListener("pointerdown", onPointer)
                window.removeEventListener("touchstart", onPointer)
            }
        }
    }, [])
    return isKeyboardModality
}

// T7-M3 fix: all calendar-navigation state (visible month, grid cells,
// T7-M3 fix: all calendar-navigation state (visible month, grid cells,
// prev/next boundaries and labels, focus-restore after month changes, and
// the empty-month auto-advance) moved out of DateAndTimeInline into its own
// hook. The component keeps only what it uses directly for rendering and
// selection, so a month change no longer re-renders the time picker or the
// derived color tokens.
interface UseCalendarNavigationOptions {
    initialVisibleMonth?: Date | null
    today: Date
    rootRef: React.RefObject<HTMLDivElement | null>
    onMonthChange?: (monthStart: Date) => void
    availableDates?: Set<string>
    slotsLoading?: boolean
}

function useCalendarNavigation(options: UseCalendarNavigationOptions): {
    visibleMonth: Date
    setVisibleMonth: React.Dispatch<React.SetStateAction<Date>>
    calendarCells: Date[]
    firstDayOfWeek: number
    weekdayLabels: string[]
    monthName: string
    yearLabel: string
    canGoPrev: boolean
    canGoNext: boolean
    goToPreviousMonth: (focusAfter?: boolean) => void
    goToNextMonth: (focusAfter?: boolean) => void
    prevMonthLabel: string
    nextMonthLabel: string
} {
    const {
        initialVisibleMonth,
        today,
        rootRef,
        onMonthChange,
        availableDates,
        slotsLoading,
    } = options

    // Fix #19: seed visibleMonth from the parent so navigation survives remounts.
    const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => {
        if (initialVisibleMonth) return initialVisibleMonth
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })

// T6-M2 fix: visibleMonth was seeded from initialVisibleMonth only in the
// lazy initializer - a LATE prop change (e.g. the parent restoring state
// after the widget already mounted) never reached the calendar. Mirror the
// initialDate/initialTime sync pattern above.
React.useEffect(() => {
    if (initialVisibleMonth) {
        React.startTransition(() => setVisibleMonth(initialVisibleMonth))
    }
}, [initialVisibleMonth])

    const monthName = React.useMemo(
        () => visibleMonth.toLocaleDateString(pageLocale(), { month: "long" }),
        [visibleMonth]
    )
    const yearLabel = React.useMemo(
        () => String(visibleMonth.getFullYear()),
        [visibleMonth]
    )

    // M7 fix: first day of the week was hardcoded to Sunday. Most of the
    // world (and most Cal.com hosts) uses Monday. `Intl.Locale.weekInfo` is
    // the standard way to ask the runtime what the visitor's own locale
    // expects; it's a newer API (not yet universal), so this degrades to
    // Sunday — the previous, always-safe behavior — wherever it's missing.
    const firstDayOfWeek = React.useMemo(() => {
        try {
            const localeTag =
                (typeof navigator !== "undefined" && navigator.language) ||
                "en-US"
            const locale = new (Intl as any).Locale(localeTag)
            const info = locale.getWeekInfo
                ? locale.getWeekInfo()
                : locale.weekInfo
            if (info && typeof info.firstDay === "number") {
                // Intl's weekInfo.firstDay is 1 (Mon) – 7 (Sun); this file's
                // Date-based math uses JS's native 0 (Sun) – 6 (Sat).
                return info.firstDay % 7
            }
        } catch {
            // Unsupported in this browser/environment — fall back to Sunday.
        }
        return 0
    }, [])

    // M8 fix: weekday labels were hardcoded English strings even though the
    // month/year header above was already localized via `toLocaleDateString`
    // — inconsistent. Derive them the same way, off a known Sunday
    // (2023-01-01), rotated to start on `firstDayOfWeek`.
    const weekdayLabels = React.useMemo(
        () => buildWeekdayLabels(firstDayOfWeek),
        [firstDayOfWeek]
    )

    const calendarCells = React.useMemo(() => {
        const firstOfMonth = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            1
        )
        const start = new Date(firstOfMonth)
        const offset = (firstOfMonth.getDay() - firstDayOfWeek + 7) % 7
        start.setDate(firstOfMonth.getDate() - offset)
        const cells: Date[] = []
        for (let i = 0; i < CALENDAR_WEEKS_TO_RENDER * 7; i++) {
            const next = new Date(start)
            next.setDate(start.getDate() + i)
            cells.push(next)
        }
        return cells
    }, [visibleMonth, firstDayOfWeek])

    const currentMonthStart = React.useMemo(
        () => new Date(today.getFullYear(), today.getMonth(), 1),
        [today]
    )

    // M5 fix: next-month navigation had no cap, so a visitor (or a stray
    // rapid-click / auto-advance loop, see M11 below) could page arbitrarily
    // far into the future. Cap it at a year out — comfortably beyond any
    // realistic booking horizon.
    const MAX_MONTHS_AHEAD = 12
    const maxMonthStart = React.useMemo(
        () =>
            new Date(
                currentMonthStart.getFullYear(),
                currentMonthStart.getMonth() + MAX_MONTHS_AHEAD,
                1
            ),
        [currentMonthStart]
    )

    // H5 fix: Page Up/Down (and, harmlessly, the prev/next month buttons)
    // used to leave focus stranded after a month change — the previously
    // focused date button unmounts with the old grid and nothing takes its
    // place as the focus target. Flag that the next month render should
    // re-focus the grid's "active" cell (tabIndex 1 — see
    // `dateTabIndexByKey`) once it exists.
    const pendingMonthFocusRef = React.useRef(false)

    // L4 fix: both of these now use the functional `setState` updater form,
    // reading the *actual* latest committed month rather than whatever
    // `visibleMonth` happened to be captured in this render's closure. The
    // old version closed over `visibleMonth` from render time, so firing
    // this twice in quick succession (e.g. two fast clicks before the
    // re-render they scheduled had committed) both calls saw the same stale
    // starting month and only ever advanced by one month total.
    const goToPreviousMonth = React.useCallback(
        (focusAfter?: boolean) => {
            if (focusAfter) pendingMonthFocusRef.current = true
            setVisibleMonth((prev) => {
                if (prev.getTime() <= currentMonthStart.getTime()) return prev
                return new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
            })
        },
        [currentMonthStart]
    )

    const goToNextMonth = React.useCallback(
        (focusAfter?: boolean) => {
            if (focusAfter) pendingMonthFocusRef.current = true
            setVisibleMonth((prev) => {
                if (prev.getTime() >= maxMonthStart.getTime()) return prev
                return new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
            })
        },
        [maxMonthStart]
    )

    // Notify the parent on every visible-month change (including the
    // initial one, so the engine fetches slots for the starting month) from
    // a single place, rather than duplicating the call inside both
    // navigation functions above.
    React.useEffect(() => {
        onMonthChange?.(visibleMonth)
    }, [visibleMonth, onMonthChange])

    // H5 fix (continued): once the new month has actually rendered, focus
    // its "active" cell if a Page Up/Down triggered this change.
    React.useEffect(() => {
        if (!pendingMonthFocusRef.current) return
        pendingMonthFocusRef.current = false
        requestAnimationFrame(() => {
            rootRef.current
                ?.querySelector<HTMLElement>('[tabindex="1"]')
                ?.focus()
        })
    }, [visibleMonth])

    // M11 fix: previously the calendar always opened on the current
    // calendar month even when it had zero bookable slots, leaving the
    // visitor staring at an all-disabled grid until they manually paged
    // forward. Once we know (via `availableDates`, M6) that the visible
    // month is fully empty, auto-advance — capped at a few months so a
    // permanently-misconfigured event type doesn't page forever.
    const autoAdvancedMonthsRef = React.useRef(0)
    React.useEffect(() => {
        if (!availableDates) return // demo/fallback mode — nothing to check
        if (slotsLoading) return // don't judge an in-flight fetch as "empty"
        if (availableDates.size > 0) return
        if (autoAdvancedMonthsRef.current >= 3) return
        autoAdvancedMonthsRef.current += 1
        goToNextMonth()
    }, [availableDates, slotsLoading, goToNextMonth])

    const canGoPrev = visibleMonth.getTime() > currentMonthStart.getTime()
    const canGoNext = visibleMonth.getTime() < maxMonthStart.getTime()
    // L6 fix: nav button aria-labels used to just say "Previous/Next month"
    // with no indication of *which* month that'd land on.
    const prevMonthLabel = React.useMemo(() => {
        const d = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() - 1,
            1
        )
        return d.toLocaleDateString(pageLocale(), {
            month: "long",
            year: "numeric",
        })
    }, [visibleMonth])
    const nextMonthLabel = React.useMemo(() => {
        const d = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() + 1,
            1
        )
        return d.toLocaleDateString(pageLocale(), {
            month: "long",
            year: "numeric",
        })
    }, [visibleMonth])

    return {
        visibleMonth,
        setVisibleMonth,
        calendarCells,
        firstDayOfWeek,
        weekdayLabels,
        monthName,
        yearLabel,
        canGoPrev,
        canGoNext,
        goToPreviousMonth,
        goToNextMonth,
        prevMonthLabel,
        nextMonthLabel,
    }
}

// T7-M3 fix: the time-picker state (slot options, 12h/24h format, hover,
// elapsed-slot ticking, selection) moved into its own hook. DateAndTimeInline
// now only owns calendar/selection state and composition.
interface UseTimeGridOptions {
    initialTime?: string | null
    timeFormat: "12h" | "24h"
    availableTimes?: Array<{
        value: string
        label: string
        end?: string
        minutes: number
    }>
    startTime: string
    endTime: string
    interval: number
    selectedDate: Date | null
    today: Date
}

function useTimeGrid(options: UseTimeGridOptions): {
    selectedTime: string | null
    setSelectedTime: React.Dispatch<React.SetStateAction<string | null>>
    activeTimeFormat: "12h" | "24h"
    setActiveTimeFormat: React.Dispatch<React.SetStateAction<"12h" | "24h">>
    hoveredTime: string | null
    setHoveredTime: React.Dispatch<React.SetStateAction<string | null>>
    timeOptions: Array<{
        value: string
        label: string
        end?: string
        minutes: number
    }>
    isTimeElapsed: (time: { value: string; minutes: number }) => boolean
    handleTimeSelect: (time: string) => void
} {
    const {
        initialTime,
        timeFormat,
        availableTimes,
        startTime,
        endTime,
        interval,
        selectedDate,
        today,
    } = options

    const [selectedTime, setSelectedTime] = React.useState<string | null>(
        () => initialTime ?? null
    )
    const [activeTimeFormat, setActiveTimeFormat] = React.useState<
        "12h" | "24h"
    >(timeFormat)
    const [hoveredTime, setHoveredTime] = React.useState<string | null>(null)

    React.useEffect(() => {
        React.startTransition(() => setActiveTimeFormat(timeFormat))
    }, [timeFormat])

    // T9-M10 fix: this prop->state sync effect only writes when the
    // incoming value is genuinely different. The click path already updates
    // local state, so an unconditional write just re-rendered the whole
    // widget with identical state.
    React.useEffect(() => {
        if (initialTime !== undefined) {
            React.startTransition(() =>
                setSelectedTime((prev) =>
                    prev === initialTime ? prev : initialTime
                )
            )
        }
    }, [initialTime])

    // Section 9.2: when `availableTimes` is provided, use it directly (real
    // Cal.com availability). Otherwise, fall back to the original
    // startTime/endTime/interval grid generation.
    // Fix #10: re-format Cal.com slot labels using the active 12h/24h toggle
    // (previously hardcoded to 12h).
    // CC-2 fix: gate on `!== undefined`, not `.length > 0`. The caller passes
    // a real (possibly empty) array whenever Cal.com is configured — even
    // while a fetch is loading or a day genuinely has zero slots. Falling
    // through to the demo grid in that case rendered 17 fake, unbookable
    // times on top of real Cal.com data. `undefined` is now the only signal
    // that no real integration is driving this at all (i.e. genuine demo
    // mode), which is the only time the synthetic grid should appear.
    const timeOptions = React.useMemo(() => {
        if (availableTimes !== undefined) {
            return availableTimes.map((timeOption) => ({
                value: timeOption.value,
                end: timeOption.end,
                label: formatTimeLabel(timeOption.minutes, activeTimeFormat),
                minutes: timeOption.minutes,
            }))
        }
        const startMin = parseTimeToMinutes(startTime)
        const endMin = parseTimeToMinutes(endTime)
        const step = clamp(interval, 15, 60)
        const list: Array<{
            value: string
            label: string
            end?: string
            minutes: number
        }> = []
        if (endMin < startMin) return list
        for (let mins = startMin; mins <= endMin; mins += step) {
            list.push({
                value: minutesTo24h(mins),
                label: formatTimeLabel(mins, activeTimeFormat),
                minutes: mins,
            })
        }
        return list
    }, [availableTimes, startTime, endTime, interval, activeTimeFormat])

    // H3 fix: previously nothing checked whether a time slot had already
    // passed — a visitor viewing today's schedule late in the day could
    // still tap a 9am slot that elapsed hours ago (Cal.com would reject the
    // booking, but only after they'd filled in the rest of the form).
    // Ticks once a minute, which is plenty granular for greying out a slot
    // list without re-rendering on every second.
    const [now, setNow] = React.useState<Date>(() => new Date())
    React.useEffect(() => {
        if (typeof window === "undefined") return
        const id = window.setInterval(() => setNow(new Date()), 60000)
        return () => window.clearInterval(id)
    }, [])
    const isTimeElapsed = React.useCallback(
        (time: { value: string; minutes: number }) => {
            if (!selectedDate) return false
            if (!isSameDay(selectedDate, today)) return false
            // Real Cal.com slots carry a full ISO datetime in `value`; the
            // synthetic demo grid carries a bare "HH:MM" 24h string instead
            // (see `timeOptions` above) — reconstruct that one's moment
            // from `selectedDate` + its `minutes`-since-midnight.
            const slotMoment = time.value.includes("T")
                ? new Date(time.value)
                : (() => {
                      const d = new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth(),
                          selectedDate.getDate()
                      )
                      d.setMinutes(time.minutes)
                      return d
                  })()
            return slotMoment.getTime() <= now.getTime()
        },
        [selectedDate, today, now]
    )

    const handleTimeSelect = React.useCallback((time: string) => {
        React.startTransition(() => setSelectedTime(time))
    }, [])

    return {
        selectedTime,
        setSelectedTime,
        activeTimeFormat,
        setActiveTimeFormat,
        hoveredTime,
        setHoveredTime,
        timeOptions,
        isTimeElapsed,
        handleTimeSelect,
    }
}
interface DateAndTimeInlineProps {
    accentColor: string
    backgroundColor: string
    textColor: string
    borderColor: string
    radius: number | string
    startTime: string
    endTime: string
    interval: number
    timeFormat: "12h" | "24h"
    focusColor: string
    initialDate?: Date | null
    initialTime?: string | null
    /** Fix #19: parent-controlled visible month so navigation survives remounts. */
    initialVisibleMonth?: Date | null
    availableTimes?: Array<{
        value: string
        label: string
        end?: string
        minutes: number
    }>
    /** M6/M11 fix: the full set of calendar days (in the visitor's chosen
     *  timezone, keyed the same way as the grid's own `dateKey`) that have
     *  at least one open Cal.com slot anywhere in the currently-fetched
     *  month. `undefined` means "no real integration" (demo/fallback grid,
     *  matching `availableTimes`'s own undefined convention) — every
     *  in-month, non-past date stays selectable. When provided, days not in
     *  the set are shown disabled even if they're otherwise a normal future
     *  weekday. */
    availableDates?: Set<string>
    /** M11: while true, this component won't auto-advance past a fully
     *  empty month — we don't yet know whether it's genuinely empty or the
     *  fetch just hasn't resolved. */
    slotsLoading?: boolean
    /** CC-13 completion: the timezone slot labels are displayed in. Grid
     *  date keys and slot availability marks are derived through this zone
     *  so a slot's calendar day always matches its label's day. When
     *  omitted, falls back to browser-local keys (demo mode). */
    timeZone?: string
    /** Copy shown in the time panel while Cal.com availability is loading. */
    loadingLabel?: string
    onSelectionReady?: (payload?: BookingPayload) => void
    onDateChange?: (date: Date) => void
    onMonthChange?: (monthStart: Date) => void
    onTimeFormatChange?: (format: "12h" | "24h") => void
    /** Requirement 4: the engine now always passes `true` here so the time
     *  slot list/picker is visible by default, without requiring the user
     *  to pick a date first. Kept as a prop (rather than hardcoded inside
     *  this component) so the "pick a date to see times" fallback path
     *  below remains available if ever needed again. */
    showTimesWithoutDate?: boolean
}

const DateAndTimeInline = React.memo(function DateAndTimeInline(props: DateAndTimeInlineProps) {
    const {
        accentColor,
        backgroundColor,
        textColor,
        borderColor,
        radius,
        startTime,
        endTime,
        interval,
        timeFormat,
        focusColor,
        initialDate,
        initialTime,
        initialVisibleMonth,
        availableTimes,
        availableDates,
        slotsLoading = false,
        loadingLabel = "Loading availability…",
        timeZone,
        onSelectionReady,
        onDateChange,
        onMonthChange,
        onTimeFormatChange,
        showTimesWithoutDate = false,
    } = props

    // M4 fix: `today` used to be memoized once with `[]` deps, so a booking
    // page left open past midnight kept treating yesterday as "today" —
    // showing the wrong date highlighted and letting a now-past date be
    // selected. Recompute at each local midnight instead, so a long-lived
    // session self-corrects without a page refresh.
    const [today, setToday] = React.useState<Date>(() =>
        startOfDay(new Date())
    )
    React.useEffect(() => {
        if (typeof window === "undefined") return
        let timeoutId: number
        const scheduleNext = () => {
            const now = new Date()
            // A few seconds past midnight, not exactly at it, so we're never
            // racing the clock rollover itself.
            const nextMidnight = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1,
                0,
                0,
                5
            )
            timeoutId = window.setTimeout(() => {
                setToday(startOfDay(new Date()))
                scheduleNext()
            }, nextMidnight.getTime() - now.getTime())
        }
        scheduleNext()
        return () => window.clearTimeout(timeoutId)
    }, [])
    // Requirement 4: scoped id for this DateAndTimeInline instance's own
    // <style> block (hiding the time-list scrollbar needs a real CSS rule
    // for ::-webkit-scrollbar — inline styles can't target pseudo-elements).
    // Mirrors the same `React.useId()`-based scoping pattern the parent
    // BookingEngine component uses for its own namespaced CSS.
    const dtInstanceId = React.useId()
// T5-M8 fix: reduce-motion support for the 12h/24h slider.
const prefersReducedMotion = useReducedMotion()

    const [measuredWidth, setMeasuredWidth] = React.useState<number>(560)
    const rootRef = React.useRef<HTMLDivElement | null>(null)

    const {
        visibleMonth,
        setVisibleMonth,
        calendarCells,
        firstDayOfWeek,
        weekdayLabels,
        monthName,
        yearLabel,
        canGoPrev,
        canGoNext,
        goToPreviousMonth,
        goToNextMonth,
        prevMonthLabel,
        nextMonthLabel,
    } = useCalendarNavigation({
        initialVisibleMonth,
        today,
        rootRef,
        onMonthChange,
        availableDates,
        slotsLoading,
    })
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(
        () => initialDate ?? null
    )
    const {
        selectedTime,
        setSelectedTime,
        activeTimeFormat,
        setActiveTimeFormat,
        hoveredTime,
        setHoveredTime,
        timeOptions,
        isTimeElapsed,
        handleTimeSelect,
    } = useTimeGrid({
        initialTime,
        timeFormat,
        availableTimes,
        startTime,
        endTime,
        interval,
        selectedDate,
        today,
    })

    const [hoveredDateKey, setHoveredDateKey] = React.useState<string | null>(
        null
    )

    const [focusedKey, setFocusedKey] = React.useState<string | null>(null)
    const isKeyboardModality = useKeyboardModality()
    const lastReadyKeyRef = React.useRef<string>("")

React.useLayoutEffect(() => {
    if (
        typeof window !== "undefined" &&
        typeof ResizeObserver !== "undefined"
    ) {
        if (!rootRef.current) return
        const observer = new ResizeObserver((entries) => {
            const nextWidth = entries[0]?.contentRect?.width
            if (typeof nextWidth === "number") {
                React.startTransition(() => setMeasuredWidth(nextWidth))
            }
        })
        observer.observe(rootRef.current)
        return () => observer.disconnect()
    }
}, [])



    // T9-M10 fix: these prop->state sync effects only write when the
    // incoming value is genuinely different. The click path already
    // updates local state, so an unconditional write just re-rendered
    // the whole widget with identical state.
    React.useEffect(() => {
        if (initialDate !== undefined) {
            React.startTransition(() =>
                setSelectedDate((prev) =>
                    prev && isSameDay(prev, initialDate) ? prev : initialDate
                )
            )
        }
    }, [initialDate])




    const isNarrow = measuredWidth < COMPACT_BREAKPOINT
    const selectedAccentText = React.useMemo(
        () => getReadableTextColor(accentColor),
        [accentColor]
    )
    const mutedText = React.useMemo(
        () => withAlpha(textColor, 0.6),
        [textColor]
    )
    const mutedSoftText = React.useMemo(
        () => withAlpha(textColor, 0.42),
        [textColor]
    )
    const subtleFill = React.useMemo(
        () => withAlpha(textColor, 0.08),
        [textColor]
    )
    const softerFill = React.useMemo(
        () => withAlpha(textColor, 0.05),
        [textColor]
    )
    const subtleBorder = React.useMemo(
        () => `1px solid ${borderColor}`,
        [borderColor]
    )
    const focusInset = React.useMemo(
        () => `inset 0 0 0 2px ${focusColor}`,
        [focusColor]
    )












    // L5 fix (shared helper): a single, locale-independent key format used
    // everywhere a date needs to be looked up (grid cells, tabIndex map,
    // keyboard-navigation focus targets). CC-13 completion: when a timezone
    // is supplied, keys are computed in that zone (slot labels are too), so
    // availability marks land on the day the visitor sees on the label. Grid
    // cells are local-midnight instants, which map to the same calendar day
    // in any zone for realistic offsets — only the *slot instants* actually
    // shift.
    const dateKeyOf = React.useCallback(
        (date: Date) =>
            timeZone
                ? getDateKeyInTimeZone(date, timeZone)
                : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        [timeZone]
    )

    // M6 fix: previously any in-month, non-past date was selectable
    // regardless of whether Cal.com actually had open slots that day —
    // clicking through to an empty day was a dead end. `availableDates`
    // (populated by the parent from the whole month's fetched slots, not
    // just the selected day's) lets a day be marked unavailable the same
    // way a past/out-of-month day already is. `undefined` preserves the old
    // behavior for the no-Cal.com-config demo grid.
    const hasKnownAvailability = React.useCallback(
        (date: Date) => !availableDates || availableDates.has(dateKeyOf(date)),
        [availableDates, dateKeyOf]
    )

    const firstAvailableDate = React.useMemo(() => {
        for (const date of calendarCells) {
            const isInMonth = date.getMonth() === visibleMonth.getMonth()
            const isPast = startOfDay(date).getTime() < today.getTime()
            if (isInMonth && !isPast && hasKnownAvailability(date))
                return date
        }
        return null
    }, [calendarCells, visibleMonth, today, hasKnownAvailability])
    // H1 fix: this used to be `selectedDate ?? firstAvailableDate` with no
    // check that `selectedDate` was actually inside the currently *visible*
    // month. If a visitor picked a date, then paged to a different month,
    // every cell in that month's grid would fail to match
    // `selectedOrFirstDateKey` — so nothing ever got `tabIndex=1` there, and
    // Tab landed on an arbitrary cell (whatever the loop below happened to
    // number `2`) instead of a sensible "active" one. Now it only trusts
    // `selectedDate` as the active cell when it's actually within
    // `visibleMonth`; otherwise it falls back to the first available date
    // of *this* month, same as when nothing is selected yet.
    const selectedOrFirstDateKey = React.useMemo(() => {
        if (
            selectedDate &&
            selectedDate.getFullYear() === visibleMonth.getFullYear() &&
            selectedDate.getMonth() === visibleMonth.getMonth()
        ) {
            return dateKeyOf(selectedDate)
        }
        if (firstAvailableDate) {
            return dateKeyOf(firstAvailableDate)
        }
        return null
    }, [selectedDate, firstAvailableDate, visibleMonth, dateKeyOf])

    // Requirement 5: sequential Tab order across every available date, with
    // the currently active/highlighted date (`selectedOrFirstDateKey`)
    // landed on first. Native Tab order visits every element with a
    // positive `tabIndex` (ascending) before falling through to elements
    // with `tabIndex={0}` in DOM order — so the highlighted date gets 1,
    // every other available date gets 2, 3, 4, … in calendar (reading)
    // order, and everything after the grid (the 12h/24h toggle, time
    // slots, timezone selector, Continue button) keeps its ordinary
    // `tabIndex={0}` and is only reached once every date has been tabbed
    // through.
    //
    // Tradeoff worth flagging: positive `tabIndex` is a document-global
    // order, not a local one — so if a Calendar step's custom fields are
    // authored *before* the Calendar Widget marker, those fields' own
    // (ordinary `tabIndex={0}`) inputs will actually be reached AFTER all
    // the numbered date cells, even though they render earlier on screen.
    // This is the standard, well-known caveat of positive tabIndex; it's
    // the explicit behavior asked for here (sequential Tab through every
    // date), so it's accepted rather than worked around.
    const dateTabIndexByKey = React.useMemo(() => {
        const map = new Map<string, number>()
        if (!selectedOrFirstDateKey) return map
        let next = 2
        for (const date of calendarCells) {
            const isInMonth = date.getMonth() === visibleMonth.getMonth()
            const isPast = startOfDay(date).getTime() < today.getTime()
            if (!isInMonth || isPast || !hasKnownAvailability(date)) continue
            const dateKey = dateKeyOf(date)
            if (dateKey === selectedOrFirstDateKey) {
                map.set(dateKey, 1)
            } else {
                map.set(dateKey, next)
                next += 1
            }
        }
        return map
    }, [
        calendarCells,
        visibleMonth,
        today,
        selectedOrFirstDateKey,
        hasKnownAvailability,
        dateKeyOf,
    ])

    const getPayload = React.useCallback(
        (date: Date, time: string): BookingPayload => {
            // If the time value is an ISO string (real Cal.com slot), parse it
            // to derive a label. Otherwise it's a "HH:MM" 24h string from the
            // fallback grid.
            const isIso = /^\d{4}-\d{2}-\d{2}T/.test(time)
            if (isIso) {
                // Capture the slot end (if available) for ICS DTEND (fix #11).
                const matched = availableTimes?.find((candidate) => candidate.value === time)
                // CC-13 fix: `matched.minutes` was already computed upstream
                // (in `useCalcomSlots`) using the visitor's selected
                // timeZone. Recomputing here via `new Date(time).getHours()`
                // instead threw that away and used the BROWSER's local zone,
                // so the label a visitor saw during selection could disagree
                // with the label shown for the same slot elsewhere (and with
                // itself, in a different browser). Prefer the already-correct
                // value; only fall back to a local-time read for the rare
                // case where this exact ISO string isn't in `availableTimes`
                // (e.g. this component used standalone, without the engine's
                // Cal.com wiring).
                const d = new Date(time)
                const minutes =
                    matched?.minutes ?? d.getHours() * 60 + d.getMinutes()
                return {
                    date,
                    time24h: time,
                    timeLabel: formatTimeLabel(minutes, activeTimeFormat),
                    end: matched?.end,
                }
            }
            return {
                date,
                time24h: time,
                timeLabel: formatTimeLabel(
                    parseTimeToMinutes(time),
                    activeTimeFormat
                ),
            }
        },
        [activeTimeFormat, availableTimes]
    )















    const handleDateSelect = React.useCallback(
        (date: Date) => {
            if (startOfDay(date).getTime() < today.getTime()) return
            React.startTransition(() => {
                setSelectedDate(date)
                // CC-1 fix: a previously-picked time belongs to the OLD date.
                // Without this, selecting a new date while a time from the
                // prior date is still set lets the onSelectionReady effect
                // below pair the new date with the stale time and submit a
                // booking for the wrong day.
                setSelectedTime(null)
            })
            if (onDateChange) onDateChange(date)
        },
        [onDateChange, today]
    )



    // H2/H3/M12 fix: a single helper for every keyboard move (arrows,
    // Home, End) that used to be duplicated per-key with inconsistent
    // guards — Home checked for past dates, End didn't (H3/M12); arrow keys
    // checked for past dates but not month boundaries, so ArrowRight/Down
    // from the grid's last row/cell could "select" a disabled spillover
    // date from the adjacent month that's only rendered for calendar
    // layout, not actually part of the visible month (H2). This now:
    //   - guards past dates and days with no known Cal.com availability the
    //     same way for every key (both are already rendered `disabled`),
    //   - if the target lands in a different month, switches the visible
    //     month to it (the same continuous cross-month arrow navigation
    //     most date pickers give keyboard users) instead of either
    //     silently selecting a disabled cell or refusing to move at all,
    //   - focuses the target cell via the stable `data-date-key` lookup
//     (L5) instead of a locale-dependent `aria-label` string match.
// T5-L5 fix: this only MOVES focus now - the old version also called
// handleDateSelect(), so every arrow press committed a selection and
// refetched Cal.com slots for the new day (selection-follows-focus).
// Selection happens only on Enter/Space/click via the cell's native
// onClick.
const moveFocus = React.useCallback(
        (target: Date) => {
            if (startOfDay(target).getTime() < today.getTime()) return
            if (!hasKnownAvailability(target)) return
            const inVisibleMonth =
                target.getFullYear() === visibleMonth.getFullYear() &&
                target.getMonth() === visibleMonth.getMonth()
            if (!inVisibleMonth) {
                const monthStart = new Date(
                    target.getFullYear(),
                    target.getMonth(),
                    1
                )
            React.startTransition(() => setVisibleMonth(monthStart))
        }
        const key = dateKeyOf(target)
            requestAnimationFrame(() => {
                rootRef.current
                    ?.querySelector<HTMLElement>(`[data-date-key="${key}"]`)
                    ?.focus()
            })
    },
    [today, hasKnownAvailability, visibleMonth, dateKeyOf]
)

    // Section 9.3: confirmationMode is "External Button" — fire onSelectionReady
    // once both date and time are chosen. Do NOT auto-advance or show an
    // internal Book button. The engine's own handleContinue() reads from this.
    // Also fire `onSelectionReady(undefined)` when the selection becomes
    // incomplete so the parent clears the stale slot (fixes stale-slot bug).
    React.useEffect(() => {
        if (!selectedDate || !selectedTime) {
            if (lastReadyKeyRef.current !== "") {
                lastReadyKeyRef.current = ""
                onSelectionReady?.(undefined)
            }
            return
        }
        // The same selected slot needs to be re-published when the visitor
        // switches 12h/24h; otherwise the review and confirmation screens
        // retain the label captured at the original selection time.
        // M7 fix: the key and getPayload both read activeTimeFormat, so it
        // must be in the dep array — previously it was omitted, the effect
        // never re-ran on a 12h↔24h toggle, and the parent kept showing the
        // original timeLabel forever (the frozen-at-selection bug).
        const key = `${selectedDate.getTime()}-${selectedTime}-${activeTimeFormat}`
        if (key === lastReadyKeyRef.current) return
        lastReadyKeyRef.current = key
        onSelectionReady?.(getPayload(selectedDate, selectedTime))
    }, [selectedDate, selectedTime, activeTimeFormat, onSelectionReady, getPayload])



    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "auto",
                minHeight: 300,
                borderRadius: radius,
                background: backgroundColor,
                color: textColor,
                border: subtleBorder,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                fontFamily: "inherit",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: isNarrow ? "column" : "row",
                    minHeight: 0,
                    flex: 1,
                }}
            >
                <section
                    aria-label="Date picker"
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: isNarrow ? "12px 12px 10px" : "16px",
                        boxSizing: "border-box",
                    }}
                >
                    <CalendarGrid
                        monthName={monthName}
                        yearLabel={yearLabel}
                        prevMonthLabel={prevMonthLabel}
                        nextMonthLabel={nextMonthLabel}
                        canGoPrev={canGoPrev}
                        canGoNext={canGoNext}
                        weekdayLabels={weekdayLabels}
                        cells={calendarCells}
                        visibleMonth={visibleMonth}
                        selectedDate={selectedDate}
                        today={today}
                        hoveredDateKey={hoveredDateKey}
                        focusedKey={focusedKey}
                        isKeyboardModality={isKeyboardModality}
                        isNarrow={isNarrow}
                        firstDayOfWeek={firstDayOfWeek}
                        dateKeyOf={dateKeyOf}
                        hasAvailability={hasKnownAvailability}
                        dateTabIndexByKey={dateTabIndexByKey}
                        locale={pageLocale()}
                        accentColor={accentColor}
                        borderColor={borderColor}
                        subtleFill={subtleFill}
                        textColor={textColor}
                        selectedAccentText={selectedAccentText}
                        mutedSoftText={mutedSoftText}
                        mutedText={mutedText}
                        focusInset={focusInset}
                        onPrevMonth={goToPreviousMonth}
                        onNextMonth={goToNextMonth}
                        onSelectDate={handleDateSelect}
                        onMoveFocus={moveFocus}
                        onHoverChange={setHoveredDateKey}
                        onFocusChange={setFocusedKey}
                    />
                </section>

                <TimeSlotList
                    isNarrow={isNarrow}
                    activeTimeFormat={activeTimeFormat}
                    setActiveTimeFormat={setActiveTimeFormat}
                    onTimeFormatChange={onTimeFormatChange}
                    focusedKey={focusedKey}
                    setFocusedKey={setFocusedKey}
                    isKeyboardModality={isKeyboardModality}
                    prefersReducedMotion={prefersReducedMotion}
                    accentColor={accentColor}
                    softerFill={softerFill}
                    subtleBorder={subtleBorder}
                    borderColor={borderColor}
                    textColor={textColor}
                    selectedAccentText={selectedAccentText}
                    mutedText={mutedText}
                    mutedSoftText={mutedSoftText}
                    focusInset={focusInset}
                    loadingLabel={loadingLabel}
                    dtInstanceId={dtInstanceId}
                    slotsLoading={slotsLoading}
                    selectedDate={selectedDate}
                    showTimesWithoutDate={showTimesWithoutDate}
                    timeOptions={timeOptions}
                    availableTimes={availableTimes}
                    selectedTime={selectedTime}
                    hoveredTime={hoveredTime}
                    setHoveredTime={setHoveredTime}
                    onSelectTime={handleTimeSelect}
                    isTimeElapsed={isTimeElapsed}
                />
            </div>

            {/* Requirement 4: hide the time-list scrollbar in WebKit/Blink
                (Chrome, Safari, Edge) — there's no inline-style equivalent
                for ::-webkit-scrollbar, so this needs a real CSS rule,
                scoped to this instance via `dtInstanceId`. Firefox and
                legacy Edge/IE are handled via the inline `scrollbarWidth`/
                `msOverflowStyle` styles on the container itself above. */}
            <style>{`
.be-dt-scroll-${dtInstanceId}::-webkit-scrollbar { display: none; }
`}</style>
        </div>
    )
})

// =============================================================================
// BookingEngine — types and constants
// =============================================================================

type StepType = "form" | "datetime" | "review"
type FieldType =
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "select"
    | "segmented"
    | "pills"
    | "cards"
    | "checkbox"
    | "radio"
    // Requirement 3: a placeholder "field" that marks where the calendar/
    // time picker renders within a Calendar step's Fields array, so authors
    // can drag it above or below their custom fields. It carries no value,
    // is never validated, and has no editable label/placeholder/etc.
    | "calendar-widget"
type FlowStatus = "in-progress" | "submitting" | "success" | "error"
type ColorMode = "light" | "dark" | "auto"

// T6-H4 fix: flowStatus is a tiny state machine. The guarded setter
// (transitionFlowStatus) rejects impossible transitions - e.g. a future
// edit doing `transitionFlowStatus("submitting")` from `success` would be
// a no-op with a console warning instead of silently corrupting the flow.
const FLOW_STATUS_TRANSITIONS: Record<FlowStatus, Array<FlowStatus>> = {
    "in-progress": ["submitting", "success", "error"],
    submitting: ["success", "error"],
    success: ["in-progress"],
    error: ["in-progress"],
}

// CC-12 fix: this is the shape Framer's `ControlType.Font` actually resolves
// to at runtime (verified against how the runtime code below reads it —
// fontFamily/fontSize/fontWeight/fontStyle/letterSpacing/lineHeight). All
// fields optional since Framer only includes the ones the font control's
// `controls` list opts into, and the runtime already defends every read with
// `?.` + a fallback.
interface FramerFont {
    fontFamily?: string
    fontSize?: number
    fontWeight?: number | string
    fontStyle?: string
    letterSpacing?: number | string
    lineHeight?: number | string
}

interface FieldConfig {
    id?: string
    label: string
    fieldType: FieldType
    placeholder?: string
    required: boolean
    options?: Array<string>
    // T10-L4 fix: parallel per-option image URLs and descriptions, aligned
    // by index with `options`. Empty arrays keep the plain text-only cards.
    optionImages?: Array<string>
    optionDescriptions?: Array<string>
    // T10-M4 fix: optional per-field input length cap. 0/undefined means
    // "use the built-in default for this field type" (see effectiveMaxLength).
    maxLength?: number
    width: "full" | "half"
    isPrimaryName?: boolean
    // T3-M8 fix: optional Cal.com custom-field id. When set, the field's
    // value is sent in `bookingFieldsResponses` on the booking POST instead
    // of only ever appearing inside the free-text notes.
    calFieldId?: string
    // T4-M4 fix: per-field validation overrides (restored - these used to
    // exist, then were flattened away). `validationRule` forces the rule
    // used for this field regardless of its type; `minLength` overrides the
    // default for min-length rules; `customRegex` feeds "custom-regex".
    validationRule?:
        | "type"
        | "none"
        | "email"
        | "phone"
        | "min-length"
        | "custom-regex"
    minLength?: number
    customRegex?: string
}

interface StepConfig {
    id?: string
    enabled: boolean
    stepType: StepType
    title: string
    subtitle?: string
    fields: FieldConfig[]
    layout: "single-column" | "two-column"
}

// Reverted: each step slot is once again a single Object control (the
// step's "submenu") that owns everything about that step — including its
// own `stepType` — rather than splitting `stepType` out into a separate
// top-level sibling control. T7-M7 fix: the `StepSlotDetails` alias was
// a pure synonym for `StepConfig`, so it's gone - the slots are plain `StepConfig`s.

// T7-L4 fix: the flat props interface is split into three concern-grouped
// interfaces - style, copy, config - composed by BookingEngineProps. The
// Framer properties panel is untouched: control definitions still read the
// same flat prop names; only the type surface is organized.

// ===== Style & layout =====
interface BookingEngineStyleProps {
    style?: React.CSSProperties
    styles: {
        // Theme (formerly the top-level "Color Mode") - first entry in Styles.
        theme: ColorMode
        accentColor: string
        backgroundColor: string
        surfaceColor: string
        textPrimaryColor: string
        textSecondaryColor: string
        borderColor: string
        errorColor: string
        successColor: string
        borderRadius: string
    }
    font: FramerFont
    // Animation
    transition: Transition
}

// ===== Copy =====
interface BookingEngineCopyProps {
    // Navigation & action button copy, grouped into one control (see
    // Requirement 5) the same way `styles`/`font`/`copy` are grouped below.
    buttonLabels: {
        continueLabel: string
        backLabel: string
        finalActionLabel: string
    }
    // Copy (fix #20: configurable terminal-state strings)
    copy: {
        successTitle: string
        successSubtitle: string
        addToCalendarLabel: string
        restartLabel: string
        errorTitle: string
        errorSubtitle: string
        retryLabel: string
        loadingAvailabilityLabel: string
        noTimesLabel: string
        emptyReviewLabel: string
        reviewIntroLabel: string
        submittingLabel: string
        // T3-L3 fix: optional support-contact path on the error screen -
        // empty value hides the link, so existing instances are unaffected.
        supportContactLabel: string
        supportContactValue: string
        // T3-I3 fix: explicit marker that the success screen's time is shown
        // in the visitor's own (selected) timezone.
        timeZoneLabel: string
        // T3-M3 fix: calendar-event summary text instead of the bare
        // literal "Booking".
        icsSummaryLabel: string
        // T10-H4 fix: the remaining hardcoded visitor-facing strings are
        // exposed too. Empty values fall back to the built-in defaults.
        stepCounterTemplate: string
        timeZoneSelectLabel: string
        detectedTimeZonePrefix: string
        availabilityErrorLabel: string
        dateLabel: string
        timeLabel: string
        // T10-H5 fix: extra calendar-provider deep links on the success
        // screen, alongside the .ics download.
        googleCalendarLabel: string
        outlookCalendarLabel: string
        // T10-M2 fix: optional privacy note rendered under the form when PII
        // fields are present. Empty value hides the notice entirely.
        privacyNotice: string
        // T10-L1 fix: explanation of the required-field marker. Rendered
        // whenever at least one field in the flow is required.
        requiredFieldsHint: string
        // T10-L6 fix: label of the "return to home" link shown on the success
        // screen. Rendered only when `returnHomeUrl` is configured.
        returnHomeLabel: string
    }
    // T4-H3 fix: validation error messages, configurable per instance.
    // Missing keys fall back to the validator's built-in defaults.
    validation: {
        requiredFieldError?: string
        emailError?: string
        phoneError?: string
        minLengthError?: string
        pickDateTimeError?: string
        pastTimeError?: string
        customRegexError?: string
        invalidRegexError?: string
        minLength?: number
    }
}

// ===== Config =====
// Flow content - FIXED SLOTS, not a single dynamic Array control.
//
// SAFETY RULE #1 (no shared array references): every step slot's `fields`
// default must be its own separately-declared array literal. Two slots
// must never point at the same array object in memory - Framer's panel
// uses reference identity to detect what changed, and an aliased default
// makes edits to one step silently show up on (and corrupt) another.
//
// SAFETY RULE #2 (no hidden-on-Array): a `hidden` predicate must never
// be attached to an Array control (e.g. the per-step `fields` list).
// Only scalar controls (String/Number/Boolean/Enum) - and, as used below
// for the step slots themselves, plain Object controls hidden by a
// top-level sibling Number - are safe to conditionally hide. It's
// specifically an Array control re-evaluating `hidden` on every
// keystroke of its own contents that caused the flaky open/instant-close
// panel bug: the panel couldn't hold a stable open state for a control
// that might vanish out from under the very edit being made inside it.
//
// Scoped exception: the per-field `options` Array (inside each step's
// `fields` list) DOES use `hidden`, keyed off that same field's own
// `fieldType`. This exact pattern shipped in the original version of
// this component with no reported instability - unlike `fields` before,
// it was never implicated in the flaky-panel bug - so it's kept as a
// narrow, deliberate exception rather than folded into the blanket rule.
// If Options-menu flakiness ever surfaces, this is the first place to
// revert.
//
// See the addPropertyControls block near the bottom of this file for
// where these two rules (and the one exception) are actually applied.
interface BookingEngineConfigProps {
    stepCount: number
    step1: StepConfig
    step2: StepConfig
    step3: StepConfig
    step4: StepConfig
    step5: StepConfig
    step6: StepConfig
    step7: StepConfig
    step8: StepConfig
    step9: StepConfig
    step10: StepConfig
    // Progress bar - grouped object control (Visible + Step Count Text
    // Position + Show Text Content + Bar Style).
    progressBar: {
        visible: boolean
        stepCountPosition: "top" | "bottom"
        showTextContent: boolean
        barStyle: "solid" | "dashed"
    }
    // Cal.com
    //
    // CC-4 (KNOWN SECURITY LIMITATION - not fixed in this file, documented
    // instead): this API key is bundled into the published site's client JS
    // and sent as a plain `Authorization: Bearer` header from the browser
    // (see `submitCalcomBooking` and `useCalcomSlots` below). Anyone who
    // opens DevTools -> Network on the published site can read this token and
    // replay it directly against api.cal.com - full read/write access to the
    // Cal.com account, not just this component's booking flow.
    //
    // This is inherent to how a single-file, backend-less Framer code
    // component works: there's nowhere server-side to hold the key. A real
    // fix requires infrastructure this file can't provide on its own -
    // proxying every Cal.com call through a server-side endpoint (a Framer
    // backend function, or any serverless function you control) that injects
    // the key itself, so it never ships to the browser. Until such a proxy
    // exists, treat this key as effectively public: use a Cal.com API key
    // scoped as narrowly as Cal.com allows (ideally to just this one event
    // type), and be prepared to rotate it.
    calApiKey: string
    calEventTypeId: string
    defaultTimeFormat: "12h" | "24h"
    // T10-L6 fix: destination for the success screen's "Done" link. Empty
    // value hides the link entirely.
    returnHomeUrl: string
    // T10-M1 fix: analytics hook. The component fires a small set of events
    // with serializable payloads - `step_complete`, `booking_submitted`,
    // `booking_success`, `booking_error` - through this callback. No
    // property control: wire it from a code override (e.g. window.dataLayer
    // or a segment/posthog SDK call). Errors thrown by the callback are
    // caught and logged, never allowed to break the booking flow.
    onAnalytics?: (eventName: string, payload?: Record<string, unknown>) => void
}

interface BookingEngineProps
    extends BookingEngineStyleProps,
        BookingEngineConfigProps,
        BookingEngineCopyProps {}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/

// T7-M6 fix: named constants for repeated magic numbers (touch targets,
// compact breakpoint, calendar grid size, progress bar height, icon sizes).
const TOUCH_TARGET_MIN = 44
const COMPACT_BREAKPOINT = 768
const CALENDAR_WEEKS_TO_RENDER = 6
const PROGRESS_BAR_HEIGHT = 4
const CHECKMARK_ICON_SIZE = 64
const ERROR_ICON_SIZE = 40
// T7-M6 completion (5th pass): the remaining layout breakpoints are named.
const CHOICE_COLUMNS_BREAKPOINT_WIDE = 560
const CHOICE_COLUMNS_BREAKPOINT_MEDIUM = 380
const PILLS_SINGLE_COLUMN_BREAKPOINT = 420
// T9-M2/T9-M11 fix: animation configs hoisted to module level so the
// progress bar and the 12h/24h toggle never allocate new transition/
// animate objects per render.
const PROGRESS_BAR_TRANSITION = { type: "spring", stiffness: 300, damping: 30 } as const
const TIME_TOGGLE_TRANSITION = { type: "spring", stiffness: 400, damping: 32, mass: 0.6 } as const
const INSTANT_TRANSITION = { duration: 0 } as const
// T8-L3 fix: hoisted field-type lists - hidden() callbacks run on every
// properties-panel render, so the arrays are allocated once at module load
// instead of fresh on every callback invocation.
const CHOICE_FIELD_TYPES = ["select", "segmented", "pills", "cards", "radio"]
const TEXT_FIELD_TYPES = ["text", "textarea"]
// T7-H8 fix: default ICS meeting duration when the Cal.com slot lacks an end.
const DEFAULT_MEETING_DURATION_MS = 30 * 60 * 1000

const DEFAULT_DARK_THEME = {
    // T5-H11 fix: the "#0099FF" accent has poor contrast against both
    // light surfaces (white labels/copy on it compute to ~2.75:1) and the
    // dark theme. "#0066BB" keeps the same blue family at ~5.7:1 with the
    // always-white selected text (getReadableTextColor stays white).
    accentColor: "#0066BB",
    backgroundColor: "#0F1115",
    surfaceColor: "#1A1D23",
    textPrimaryColor: "#FFFFFF",
    textSecondaryColor: "#9CA3AF",
    borderColor: "#2A2D34",
    errorColor: "#F87171",
    successColor: "#16A34A",
}

const COMMON_TIMEZONES = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Africa/Cairo",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney",
    "UTC",
]

// Fixed-slot defaults. Each `stepN` / `stepNType` property control below
// declares its `defaultValue` directly, inline, using these factories — kept
// as (a) the runtime fallback for a slot that somehow comes back undefined,
// and (b) the single source of truth for each step "persona" this component
// ships with. Every call returns a BRAND NEW object/array — never a shared
// reference — which is what Safety Rule #1 requires. Do not hoist any of
// these into a shared constant and reuse it across slots.
//
// Internal `stepType` values are unchanged ("form" / "datetime") — only the
// user-facing label was renamed to "Calendar" (Requirement 2). Keeping the
// stored value as "datetime" means this is a pure display-label rename with
// zero risk to the `stepType === "datetime"` checks used throughout the
// runtime logic below.
function makeDefaultFormStep(): StepConfig {
    return {
        enabled: true,
        stepType: "form",
        title: "Your Details",
        subtitle:
            "Tell us a bit about yourself so we can prepare for your booking.",
        layout: "single-column",
        fields: [
            {
                label: "Full Name",
                fieldType: "text",
                placeholder: "Jane Doe",
                required: true,
                isPrimaryName: true,
                width: "full",
            },
            {
                label: "Email",
                fieldType: "email",
                placeholder: "jane@example.com",
                required: true,
                width: "full",
            },
            {
                label: "Phone",
                fieldType: "phone",
                placeholder: "+1 (555) 555-5555",
                required: false,
                width: "full",
            },
        ],
    }
}

function makeDefaultCalendarStep(): StepConfig {
    return {
        enabled: true,
        stepType: "datetime",
        title: "Pick a Time",
        subtitle: "Choose a date and time that works for you.",
        layout: "single-column",
        // Requirement 3: the calendar/time picker now renders in-place at
        // wherever this "Calendar Widget" marker sits in the Fields array,
        // rather than always fixed above/below custom fields. It ships here
        // as the only default entry so it's easy to find and drag; any new
        // field the author adds via the Array control's "+" gets appended
        // after it (see makeStepControl's fields.control comment), which is
        // exactly the "defaults to below the Calendar Widget" behavior
        // Requirement 3 asks for.
        fields: [
            {
                label: "Calendar",
                fieldType: "calendar-widget",
                required: false,
                width: "full",
            },
        ],
    }
}

function makeDefaultBlankFormStep(n: number): StepConfig {
    return {
        enabled: true,
        stepType: "form",
        title: `Step ${n}`,
        subtitle: "",
        layout: "single-column",
        // T8-M4 fix: seed one starter field so a freshly-added form step never
        // renders empty (the canvas-only emptyStepWarnings guard used to trip
        // on every step beyond step 1). Still its own fresh array, never a
        // reference shared with step1's fields (Safety Rule #1).
        fields: [
            {
                label: "Notes",
                fieldType: "textarea",
                placeholder: "Anything we should know?",
                required: false,
                width: "full",
            },
        ],
    }
}

// Runtime fallback only (should not normally be reached — each stepN control
// always has its own defaultValue). Rebuilt fresh on every call, per Safety
// Rule #1. "Review" is no longer one of the shipped default personas
// (Requirement 2 — it isn't a selectable step type any more), so slot 3
// onward all fall back to a blank form step.
function getRuntimeFallbackStep(index: number): StepConfig {
    if (index === 0) return makeDefaultFormStep()
    if (index === 1) return makeDefaultCalendarStep()
    return makeDefaultBlankFormStep(index + 1)
}

function detectTimezone(): string {
    if (typeof window === "undefined" || typeof Intl === "undefined")
        return "UTC"
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    } catch {
        return "UTC"
    }
}

// =============================================================================
// Pipeline / Schema normalization
// =============================================================================
// Framer's Array control does not give items stable IDs. We assign deterministic
// IDs at render time so `values` and `errors` keys stay stable across re-renders
// for the same authored config. (Reordering steps/fields will change IDs, but
// values aren't meaningfully persisted across schema edits anyway.)

interface NormalizedField extends FieldConfig {
    id: string
}

interface NormalizedStep extends Omit<StepConfig, "fields"> {
    id: string
    fields: NormalizedField[]
}

function normalizeSteps(steps: StepConfig[]): NormalizedStep[] {
    return (steps || [])
        .map((step, stepIdx) => ({
            ...step,
            id: step.id || `step-${stepIdx}`,
            enabled: step.enabled !== false,
            stepType: step.stepType || "form",
            title: step.title || `Step ${stepIdx + 1}`,
            subtitle: step.subtitle || "",
            layout: step.layout || "single-column",
            fields: (step.fields || []).map((field, fieldIdx) => ({
                ...field,
                id: field.id || `step-${stepIdx}-field-${fieldIdx}`,
                required: field.required !== false ? true : false,
                fieldType: field.fieldType || "text",
                width: field.width || "full",
                options: field.options || [],
            })),
        }))
        // T10-M9 fix: a form step with zero fields renders as dead air on
        // the published site (title + Continue, nothing to fill in). Drop it
        // from the pipeline entirely; the canvas-only warning (see
        // emptyStepWarnings) still tells the author why their step vanished.
        .filter(
            (step) =>
                !(step.stepType === "form" && step.fields.length === 0)
        )
}

// =============================================================================
// Validation engine
// =============================================================================
// `handleContinue()` runs `validateStep()` synchronously and only advances the
// index inside the `if (valid)` branch. There is no code path where an invalid
// step advances. Error state is derived from `errors[field.id]`, persists until
// the field becomes valid, and only shows for fields already marked `touched`.
//
// There is no longer an author-facing `Validation` control. Validation rules
// are now inferred automatically from the field's `fieldType`:
//   - "email"            → standard email-format check
//   - "phone"             → numeric/phone digit-pattern check
//   - "text" / "textarea" → minimum length of 3 characters
//   - anything else (choice types, checkbox) → required-only
// Field-level errors are only ever computed inside `validateStep`, which is
// only ever called from `handleContinue` — see Requirement 3: validation
// must never trigger or display while the user is still typing.

const MIN_TEXT_LENGTH = 3

// T4-H3 fix: validation messages are author-configurable via the Copy panel
// (validation.*) instead of hard-coded in the validator; the validator
// takes a read-only slice and falls back to these shipped defaults.
type ValidationCopy = {
    requiredFieldError: string
    emailError: string
    phoneError: string
    minLengthError: string
    pickDateTimeError: string
    pastTimeError: string
    customRegexError: string
    invalidRegexError: string
    minLength: number
}

const DEFAULT_VALIDATION_COPY: ValidationCopy = {
    requiredFieldError: "This field is required",
    emailError: "Enter a valid email address",
    phoneError: "Enter a valid phone number",
    minLengthError: "Must be at least 3 characters",
    pickDateTimeError: "Please pick a date and time",
    pastTimeError: "Please pick a future time",
    customRegexError: "This value doesn't match the required format",
    invalidRegexError: "This field's custom regex pattern is invalid",
    minLength: MIN_TEXT_LENGTH,
}

function validateField(
    field: NormalizedField,
    value: string | boolean | undefined,
    validationCopy?: ValidationCopy
): string | null {
    const vc = validationCopy ?? DEFAULT_VALIDATION_COPY
    // The Calendar Widget "field" is just a drag-and-drop placeholder that
    // marks where the calendar/time picker renders in the fields list — it
    // has no value of its own and is never validated (its own error, "Please
    // pick a date and time", is tracked separately via __selectedSlot).
    if (field.fieldType === "calendar-widget") return null
    // Fix #9: required checkbox treats value===false as empty.
    if (field.fieldType === "checkbox" && field.required && value !== true) {
        return vc.requiredFieldError
    }
    // T4-H1 fix: whitespace-only strings count as empty - a value of nine
    // spaces used to clear both the required check and the min-length check.
    // T7-H2 fix: value is now string | boolean | undefined - the dead
    // Array.isArray branch (and the impossible null comparison) are gone.
    const isEmpty =
        value === undefined ||
        value === "" ||
        value === false ||
        (typeof value === "string" && value.trim() === "")
    if (field.required && isEmpty) {
        return vc.requiredFieldError
    }
    if (isEmpty) return null
    const str = String(value)
    // T4-M4 fix: per-field rules (validationRule / minLength / customRegex)
    // override the type-derived checks below.
    const explicitRule =
        field.validationRule && field.validationRule !== "type"
            ? field.validationRule
            : undefined
    if (explicitRule === "none") return null
    if (explicitRule === "email") {
        if (!EMAIL_REGEX.test(str.trim())) return vc.emailError
        return null
    }
    if (explicitRule === "phone") {
        return validatePhone(str, vc)
    }
    if (explicitRule === "custom-regex") {
        if (!field.customRegex) return vc.invalidRegexError
        try {
            const re = new RegExp(field.customRegex)
            if (!re.test(str)) return vc.customRegexError
        } catch {
            return vc.invalidRegexError
        }
        return null
    }
    const minLength = field.minLength ?? vc.minLength
    if (explicitRule === "min-length") {
        if (str.trim().length < minLength) return vc.minLengthError
        return null
    }
    if (field.fieldType === "email" && !EMAIL_REGEX.test(str.trim())) {
        return vc.emailError
    }
    if (field.fieldType === "phone") {
        return validatePhone(str, vc)
    }
    if (
        (field.fieldType === "text" || field.fieldType === "textarea") &&
        str.trim().length < minLength
    ) {
        return vc.minLengthError
    }
    return null
}

// Shared phone rule (T4-M3 fix): the loose format regex alone accepted
// "12345" - a plausible-looking string is not a phone number. Require at
// least 7 digits so short, unusable values fail clearly.
function validatePhone(str: string, vc: ValidationCopy): string | null {
    if (!PHONE_REGEX.test(str)) return vc.phoneError
    const digits = str.replace(/\D/g, "").length
    if (digits < 7) return vc.phoneError
    return null
}

function validateStep(
    step: NormalizedStep,
    values: BookingValues,
    validationCopy?: ValidationCopy
): { valid: boolean; errors: Record<string, string | null> } {
    const vc = validationCopy ?? DEFAULT_VALIDATION_COPY
    // Fix #5: datetime step now returns a real error message when no slot is
    // picked, so the user sees "Please pick a date and time" instead of a
    // silent block. Calendar steps can also carry custom fields now - those
    // are validated exactly like fields on a Form step.
    if (step.stepType === "datetime") {
        const errors: Record<string, string | null> = {}
        for (const field of step.fields) {
            errors[field.id] = validateField(field, values[field.id], validationCopy)
        }
        const slot = values[SELECTED_SLOT_KEY]
        if (!slot) {
            errors[SELECTED_SLOT_KEY] = vc.pickDateTimeError
        } else {
            // T4-L3 fix: a slot whose start time has already passed (stale
            // page, back-navigation, timezone flips) was accepted as-is -
            // the booking could be created in the past. Reject past starts.
            const startMs = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(
                slot.time24h
            )
                ? new Date(slot.time24h).getTime()
                : slot.date.getTime()
            if (!Number.isNaN(startMs) && startMs <= Date.now()) {
                errors[SELECTED_SLOT_KEY] = vc.pastTimeError
            }
        }
        const valid = Object.values(errors).every((error) => error === null)
        return { valid, errors }
    }
    if (step.stepType === "review") {
        return { valid: true, errors: {} }
    }
    const errors: Record<string, string | null> = {}
    for (const field of step.fields) {
        errors[field.id] = validateField(field, values[field.id], validationCopy)
    }
    const valid = Object.values(errors).every((error) => error === null)
    return { valid, errors }
}

function touchAllFieldsIn(
    step: NormalizedStep,
    prev: Record<string, boolean>
): Record<string, boolean> {
    const next = { ...prev }
    if (step.stepType === "form" || step.stepType === "datetime") {
        for (const field of step.fields) next[field.id] = true
    }
    if (step.stepType === "datetime") next[SELECTED_SLOT_KEY] = true
    return next
}

// =============================================================================
// Cal.com v2 API controller
// =============================================================================
// Implements:
//   - GET /v2/slots?eventTypeId=&start=&end=&timeZone=
//   - POST /v2/bookings
// All responses are parsed defensively — the engine degrades to "no slots" or
// a friendly error message rather than throwing on unexpected shapes.

interface CalSlot {
    start: string
    end: string
}

// T7-H4 fix: runtime type guard - replaces the unsafe `as CalSlot[]` cast
// on the flattened Cal.com response. The old truthiness filter only checked
// `s && s.start`; this verifies the shape.
function isCalSlot(s: unknown): s is CalSlot {
    return (
        typeof s === "object" &&
        s !== null &&
        typeof (s as CalSlot).start === "string" &&
        typeof (s as CalSlot).end === "string"
    )
}

interface UseCalcomSlotsResult {
    slots: Array<{
        value: string
        label: string
        end?: string
        minutes: number
    }>
    loading: boolean
    error: string | null
    // T3-H4 fix: lets callers force a fresh fetch (retry after a failed
    // submission, error-banner retry) instead of being stuck with whatever
    // was fetched on step entry.
    refetch: () => void
}

// Shared cache key: month (local Y/M) + the timezone the fetch used, since
// slot data is timezone-dependent. T3-H4 fix: hoisted so `refetch` can clear
// the exact same key the fetch effect reads.
function monthCacheKey(monthStart: Date, timeZone: string): string {
    return `${monthStart.getFullYear()}-${monthStart.getMonth()}|${timeZone}`
}

// CC-15 fix: shared timeout for both Cal.com calls. 18s comfortably covers a
// slow-but-working connection while still recovering a stranded visitor well
// before they'd give up and leave.
const FETCH_TIMEOUT_MS = 18000

function useCalcomSlots(
    apiKey: string,
    eventTypeId: string,
    monthStart: Date | null,
    timeZone: string,
    // T10-H4 fix: fallback message when Cal.com reports no useful error
    // detail; the call site passes copy.availabilityErrorLabel.
    fallbackErrorLabel?: string
): UseCalcomSlotsResult {
    const [slots, setSlots] = React.useState<
        Array<{ value: string; label: string; end?: string; minutes: number }>
    >([])
    // CC-3/T2-C3 fix: was `false`, so the first painted frame after mount
    // showed the empty/previous state instead of the loading banner — the
    // fetch effect only set `loading=true` after the first paint. Initialize
    // to `true` and let the no-op branches below (no config / canvas / no
    // month) settle it to `false` synchronously in the same effect.
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    // M2 fix: every month navigation re-fetched from scratch, even for a
    // month already loaded once this session (e.g. paging back and forth
    // between two months). A plain ref-backed cache, keyed by month + the
    // timezone it was fetched for (results differ by timezone), avoids
    // redundant round-trips without needing any extra state plumbing.
    const cacheRef = React.useRef<
        Map<
            string,
            Array<{
                value: string
                label: string
                end?: string
                minutes: number
            }>
        >
    >(new Map())
    // T3-H4 fix: see UseCalcomSlotsResult.refetch — a bump re-runs the fetch
    // effect below exactly as if the month had changed.
    const [refreshNonce, setRefreshNonce] = React.useState(0)
    const refetch = React.useCallback(() => {
        if (!monthStart) return
        cacheRef.current.delete(monthCacheKey(monthStart, timeZone))
        setRefreshNonce((count) => count + 1)
    }, [monthStart, timeZone])

    React.useEffect(() => {
        if (!apiKey || !eventTypeId || !monthStart) {
            setLoading(false)
            return
        }
        if (typeof window === "undefined") {
            setLoading(false)
            return
        }
        if (RenderTarget.current() === RenderTarget.canvas) {
            setLoading(false)
            return
        }

        const monthKey = monthCacheKey(monthStart, timeZone)
        const cached = cacheRef.current.get(monthKey)
        if (cached) {
            setSlots(cached)
            setLoading(false)
            setError(null)
            return
        }

        let cancelled = false
        // T3-I6 fix: a 500/502/503 from Cal.com used to drop straight into
        // the same error screen as a real failure — a transient server
        // outage became visitor friction that needed a manual retry. Retry
        // 5xx responses up to twice with exponential backoff (1s, then 3s)
        // before surfacing the error. Track the backoff timers so unmount
        // clears them like the rest of this effect's in-flight work.
        const backoffTimers: number[] = []
        const start = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth(),
            1
        )
        const end = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth() + 1,
            0,
            23,
            59,
            59
        )
        const startStr = start.toISOString()
        const endStr = end.toISOString()
        const url = `https://api.cal.com/v2/slots?eventTypeId=${encodeURIComponent(
            eventTypeId
        )}&start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(
            endStr
        )}&timeZone=${encodeURIComponent(timeZone)}`

        setLoading(true)
        setError(null)
        // H5 fix: the previous month's slots stayed in state while the new
        // month's fetch was in flight, so a visitor could see (and click)
        // times that belong to whatever month they just navigated away
        // from, briefly indistinguishable from real availability for the
        // new month.
        setSlots([])

        // CC-15 fix: neither the fetch itself nor a cancelled request was
        // ever actually aborted before — the `cancelled` flag only stopped
        // React state updates from a stale response, it didn't stop the
        // network request or free up a hung connection. Without a timeout, a
        // stalled connection left `loading=true` forever with no way for the
        // visitor to recover. The AbortController now does double duty: it
        // aborts on a 18s timeout AND on effect cleanup (e.g. rapid month
        // navigation queuing a new fetch), so an old in-flight request is
        // actually cancelled instead of just ignored.
        const controller = new AbortController()
        const timeoutId = window.setTimeout(
            () => controller.abort(),
            FETCH_TIMEOUT_MS
        )

        const attempt = (triesLeft: number) => {
        fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "cal-api-version": "2024-09-04",
            },
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) {
                    // M9 fix: every non-2xx response (401/403/404/500/...)
                    // used to collapse into the same generic
                    // `Error("HTTP ${status}")` → the same opaque catch-all
                    // string for the visitor. Attach the status so the
                    // catch handler below can give a specific, actionable
                    // message per status class instead.
                    const err = new Error(`HTTP ${res.status}`) as Error & {
                        status?: number
                    }
                    err.status = res.status
                    throw err
                }
                const json = await res.json()
                if (cancelled) return
                // Cal.com v2 typically returns { data: { slots: { 'YYYY-MM-DD': [{start,end}, ...] } } }
                // but we accept several shapes defensively.
                let rawSlots: CalSlot[] = []
                if (Array.isArray(json?.data)) {
                    rawSlots = json.data
                } else if (
                    json?.data?.slots &&
                    typeof json.data.slots === "object"
                ) {
                    rawSlots = Object.values(
                        json.data.slots
                    )
                        .flat()
                        .filter(isCalSlot)
                } else if (Array.isArray(json?.slots)) {
                    rawSlots = json.slots
                } else if (Array.isArray(json)) {
                    rawSlots = json
                }
                const mapped = rawSlots
                    .filter(isCalSlot)
                    .map((slot) => {
                        const d = new Date(slot.start)
                        // CC-13 fix: was `d.getHours()`, which reads the
                        // BROWSER's local zone. Use the zone the visitor
                        // actually selected (the same `timeZone` this fetch
                        // was requested with) so labels and day-bucketing
                        // match what was asked for.
                        const minutes = getMinutesInTimeZone(d, timeZone)
                        return {
                            value: slot.start,
                            // Store raw minutes; the DateAndTimeInline
                            // component formats the label using the active
                            // 12h/24h toggle (fixes #10).
                            label: formatTimeLabel(minutes, "12h"),
                            end: slot.end,
                            minutes,
                        }
                    })
                    .sort((a, b) => (a.value < b.value ? -1 : 1))
                if (cancelled) return
                cacheRef.current.set(monthKey, mapped)
                setSlots(mapped)
                setLoading(false)
            })
            .catch((err) => {
                if (cancelled) return
                const timedOut = err?.name === "AbortError"
                const status: number | undefined = err?.status
                // T3-I6 fix (continued): real server-side outages (5xx —
                // not auth, not client errors) get up to two retries with
                // backoff before the error screen; the existing per-status
                // messaging below then only runs after retries are spent.
                if (
                    !timedOut &&
                    typeof status === "number" &&
                    status >= 500 &&
                    triesLeft > 0
                ) {
                    const backoffMs = triesLeft === 2 ? 1000 : 3000
                    backoffTimers.push(
                        window.setTimeout(() => attempt(triesLeft - 1), backoffMs)
                    )
                    return
                }
                // M9 fix (continued): specific messages for the response
                // classes a visitor (or the site owner debugging a bad API
                // key) can actually act on, instead of one shared string.
                let message: string
                if (timedOut) {
                    message = "Loading availability timed out. Please try again."
                } else if (status === 401 || status === 403) {
                    message =
                        "The booking service rejected our credentials. Please contact the site owner."
                } else if (status === 404) {
                    message =
                        "This booking form isn't configured correctly (event type not found). Please contact the site owner."
                } else if (status === 429) {
                    // T2-M9 fix: rate limiting previously fell through to the
                    // generic `err.message` ("HTTP 429") — visitors couldn't
                    // tell a temporary quota block from a real outage.
                    message =
                        "Too many requests right now. Please wait a moment and try again."
                } else if (status && status >= 500) {
                    message =
                        "The booking service is temporarily unavailable. Please try again shortly."
                } else {
                    message = err?.message || fallbackErrorLabel || "Failed to load availability"
                }
                setError(message)
                setSlots([])
                setLoading(false)
            })
            .finally(() => {
                window.clearTimeout(timeoutId)
            })
        }
        attempt(2)

        return () => {
            cancelled = true
            controller.abort()
            window.clearTimeout(timeoutId)
            backoffTimers.forEach((id) => window.clearTimeout(id))
        }
    }, [apiKey, eventTypeId, monthStart, timeZone, refreshNonce])

    return { slots, loading, error, refetch }
}

interface SubmitBookingResult {
    success: boolean
    error: string | null
    bookingUid?: string
    // T3-M2 fix: machine-readable Cal.com error code, when the response
    // carries one — lets the caller branch on codes instead of guessing
    // from message substrings.
    errorCode?: string
}

// CC-11 fix: what actually gets kept in state and handed to SuccessScreen.
// Previously the full Cal.com response was captured into state and then
// immediately discarded (`void bookingResult`) — no booking reference ever
// reached the visitor. `uid` is the one field this component can reliably
// compute (see `submitCalcomBooking`'s defensive `json?.data?.uid || ...`
// fallback chain); `manageUrl` is Cal.com's public booking page for that
// uid, which is where Cal.com's own hosted flow exposes reschedule/cancel —
// safer to link to than to guess at reschedule/cancel field names in a
// response shape that Cal.com hasn't documented consistently across API
// versions.
interface BookingConfirmation {
    uid: string | null
    manageUrl: string | null
}

async function submitCalcomBooking(params: {
    apiKey: string
    eventTypeId: string
    slotStart: string
    name: string
    email: string
    timeZone: string
    notes: string
    // T3-H2 fix: same key must be reused across retries of one submission.
    idempotencyKey?: string
    // T3-M8 fix: author-mapped custom field values.
    bookingFieldsResponses?: Record<string, string>
    // T6-L7 fix: optional external signal - the caller (BookingEngine)
    // aborts it on unmount so an in-flight POST dies with the component.
    externalSignal?: AbortSignal
}): Promise<SubmitBookingResult> {
    const {
        apiKey,
        eventTypeId,
        slotStart,
        name,
        email,
        timeZone,
        notes,
        idempotencyKey,
        bookingFieldsResponses,
        externalSignal,
    } = params
    // H4 fix: `Number(eventTypeId)` silently produced `NaN` for any
    // non-purely-numeric event type ID (e.g. a slug), and `JSON.stringify`
    // serializes `NaN` as `null` — so the request body sent
    // `"eventTypeId":null` with no error at all, and Cal.com's rejection of
    // that came back as an opaque "Booking failed" for the visitor. Fail
    // fast with a clear, actionable message instead of ever building that
    // malformed payload.
    const parsedEventTypeId = Number(eventTypeId)
    if (!eventTypeId || !Number.isFinite(parsedEventTypeId)) {
        return {
            success: false,
            error: "This booking form isn't configured correctly (invalid Event Type ID). Please contact the site owner.",
        }
    }
    // T3-M5 fix: gate the slot time at the door — the demo grid's "HH:MM"
    // times must never reach the API (they'd POST a malformed `start` and
    // fail opaquely, or worse book against a garbage timestamp). Same guard
    // also lives in handleSubmitBooking, so this is defense in depth.
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotStart)) {
        return {
            success: false,
            error: "The selected time is invalid. Please go back and pick a time slot again.",
            errorCode: "INVALID_SLOT_START",
        }
    }
    // CC-15 fix: no timeout previously — a stalled connection left
    // `flowStatus="submitting"` forever with no recovery path for the
    // visitor.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    // T6-L7 fix: bridge the caller's unmount abort into the same
    // controller as the timeout so either one cancels the POST.
    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort()
        } else {
            externalSignal.addEventListener(
                "abort",
                () => controller.abort(),
                { once: true }
            )
        }
    }
    try {
        const res = await fetch("https://api.cal.com/v2/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "cal-api-version": "2024-09-04",
                // T3-H2 fix: Cal.com rejects duplicate bookings that carry
                // the same idempotency key — replayed by a retry of the
                // same submission, a double-POST therefore can't create two
                // appointments for the same slot.
                ...(idempotencyKey
                    ? { "X-Idempotency-Key": idempotencyKey }
                    : {}),
            },
            body: JSON.stringify({
                eventTypeId: parsedEventTypeId,
                start: slotStart,
                attendee: {
                    name,
                    email,
                    timeZone,
                    // T3-L2 fix: was hardcoded "en" — every Cal.com attendee
                    // was mechanically booked as English-speaking even when
                    // the visitor's browser was set to another language.
                    // Detect the visitor's own language (primary subtag
                    // only); fallback stays "en".
                    language:
                        (typeof navigator !== "undefined" &&
                            navigator.language?.slice(0, 2)) ||
                        "en",
                },
                metadata: {},
                notes,
                ...(bookingFieldsResponses &&
                Object.keys(bookingFieldsResponses).length
                    ? { bookingFieldsResponses }
                    : {}),
            }),
            signal: controller.signal,
        })
        const json = await res.json()
        if (!res.ok) {
            const msg =
                json?.error?.message ||
                json?.message ||
                json?.error ||
                `Booking failed (HTTP ${res.status})`
            // T3-M2 fix: carry Cal.com's machine-readable code through so
            // mapCalcomError can branch on it before falling back to
            // substring matching.
            const code =
                json?.error?.code || json?.code || json?.error?.errorCode
            return { success: false, error: String(msg), errorCode: code }
        }
        // T3-M6 fix: a 2xx status with an empty/null body used to sail
        // through as success — the visitor got a confirmation screen for a
        // booking there's no record of. An empty body is not a confirmation;
        // fail with copy that tells them what to check.
        if (
            !json ||
            (typeof json === "object" && Object.keys(json).length === 0)
        ) {
            return {
                success: false,
                error: "We couldn't confirm your booking. Please check your email for a confirmation before trying again.",
                errorCode: "EMPTY_RESPONSE",
            }
        }
        // T3-M1 fix: was `json?.data?.uid || json?.data?.id || json?.uid ||
        // json?.id` — some v2 response shapes nest the booking object one
        // level deeper ({ data: { booking: { uid } } }), which left
        // bookingUid undefined (and the confirmation screen without a
        // reference number) for bookings that actually succeeded.
        const uid =
            json?.data?.booking?.uid ||
            json?.data?.uid ||
            json?.data?.id ||
            json?.uid ||
            json?.id
        return { success: true, error: null, bookingUid: uid }
    // T7-M10 fix: catch was `err: any` - now unknown, narrowed to an Error
    // (with Cal.com's optional code/errorCode extras) before reading.
    } catch (err: unknown) {
        const errObj =
            err instanceof Error
                ? (err as Error & { code?: string; errorCode?: string })
                : null
        const timedOut = errObj?.name === "AbortError"
        return {
            success: false,
            // T3-H2 fix: route non-timeout network errors through the same
            // mapper as API errors so a failed POST during connectivity
            // trouble gets a useful, actionable message instead of one
            // catch-all string.
            error: timedOut
                ? "The booking service took too long to respond. Please try again."
                : mapCalcomError(
                      errObj?.message || "",
                      errObj?.code || errObj?.errorCode
                  ),
            errorCode: timedOut
                ? "TIMEOUT"
                : errObj?.code || errObj?.errorCode || "",
        }
    } finally {
        clearTimeout(timeoutId)
    }
}

function mapCalcomError(message: string, code?: string): string {
    // T3-M2 fix: when Cal.com sends a machine-readable error code, branch on
    // it FIRST — substring matching against human messages is fragile and
    // has already broken once as Cal.com reworded its copy. Unknown codes
    // fall through to the heuristics below.
    switch ((code || "").toUpperCase()) {
        case "UNAUTHORIZED":
        case "INVALID_API_KEY":
        case "API_KEY_INVALID":
            return "The booking service rejected our credentials. Please contact the site owner."
        case "MAXIMUM_NUMBER_OF_BOOKINGS":
        case "BOOKING_LIMIT":
        case "NO_AVAILABILITY":
        case "SLOT_NOT_AVAILABLE":
        case "BOOKING_NOT_FOUND":
            return "That time was just taken by someone else. Please pick another slot."
        case "INVALID_EMAIL_ADDRESS":
        case "INVALID_EMAIL":
            return "Please check the email address and try again."
        default:
            break
    }
    const m = (message || "").toLowerCase()
    if (m.includes("already") && m.includes("booked"))
        return "That time was just taken by someone else. Please pick another slot."
    if (m.includes("outside") || m.includes("availability"))
        return "That time is no longer available. Please pick another slot."
    if (m.includes("invalid") && m.includes("email"))
        return "Please check the email address and try again."
    if (m.includes("unauthorized") || m.includes("api key"))
        return "The booking service rejected our credentials. Please contact the site owner."
    if (m.includes("network") || m.includes("fetch"))
        return "We couldn't reach the booking service. Please check your connection and try again."
    return "Something went wrong while submitting your booking. Please try again."
}

// T3-H2 fix: client-generated idempotency key for the booking POST — one per
// selected slot (see handleSubmitBooking / handleSlotReady), reused across
// retries so a retried POST can't double-book.
function makeIdempotencyKey(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID()
    }
    return `bk-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// =============================================================================
// Engine helpers
// =============================================================================

// T7-M11 fix: findNameField/findEmailField were 95% duplicated iteration
// loops (and disagreed on fallback heuristics). One generic helper + two
// one-line callers now.
function findField(
    steps: NormalizedStep[],
    predicate: (field: NormalizedField) => boolean
): NormalizedField | null {
    for (const step of steps) {
        if (step.stepType !== "form") continue
        for (const field of step.fields) {
            if (predicate(field)) return field
        }
    }
    return null
}

function findNameField(steps: NormalizedStep[]): NormalizedField | null {
    const primary = findField(steps, (field) => field.isPrimaryName === true)
    if (primary) return primary
    // Fallback heuristic: field id/label contains "name" as a whole word.
    // T3-L8 fix: plain /name/i matched "filename", "username", "Surname" —
    // any field whose label merely contained the letters n-a-m-e — and
    // silently hijacked the wrong field as the booker's name. \b anchors the
    // match to a word boundary.
    return findField(
        steps,
        (field) =>
            /\bname\b/i.test(field.label) || /\bname\b/i.test(field.id)
    )
}

function findEmailField(steps: NormalizedStep[]): NormalizedField | null {
    const typed = findField(steps, (field) => field.fieldType === "email")
    if (typed) return typed
    // T3-I7 fix: forms authored with only a text field (label "Email" /
    // "E-mail" / "Your email") had no email field, so Cal.com's attendee
    // email fell back to a magic string and the booking succeeded with a
    // wrong/no recipient. Heuristic: any not-yet-matched field whose label
    // or id looks like an email/contact field.
    return findField(steps, (field) => {
        if (field.fieldType !== "text") return false
        const hay = `${field.label} ${field.id}`.toLowerCase()
        return /\b(email|e-mail|mail|contact)\b/.test(hay)
    })
}

// T3-I8 fix: the configurable success title/subtitle (successTitle /
// successSubtitle copy keys) supported no placeholders, so "Thanks, {name}!"
// rendered literally. Now `{name}` (the visitor's name field value — or the
// email field when the form collects no separate name) and `{date}` (the
// booked date, formatted like the confirmation's detail card) are replaced
// at render time; unknown tokens pass through unchanged.
function replaceCopyTokens(
    text: string,
    steps: NormalizedStep[],
    values: BookingValues
): string {
    if (typeof text !== "string" || !text.includes("{")) return text
    const formFields =
        steps.flatMap((step) => (step.stepType === "form" ? step.fields : [])) || []
    const nameField =
        formFields.find((field) => field.isPrimaryName) || findEmailField(steps)
    const name = nameField
        ? String(values[nameField.id] ?? "").trim()
        : ""
    const slot = values[SELECTED_SLOT_KEY]
    const date = slot
        ? slot.date.toLocaleDateString(pageLocale(), {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : ""
    return text
        .replace(/\{name\}/g, name)
        .replace(/\{date\}/g, date)
}

// T5-H2 fix: autocomplete hinting was entirely absent, so the browser's
// address-bar data (name, email, phone) was never offered even though the
// form collects exactly those. Map fields to the HTML autofill tokens by
// type and label; unknown fields return undefined (no hint).
function autocompleteToken(field: NormalizedField): string | undefined {
    const label = `${field.label} ${field.id}`.toLowerCase()
    if (field.fieldType === "email") return "email"
    if (field.fieldType === "phone") return "tel"
    if (field.isPrimaryName) return "name"
    if (/\b(email|e-mail|mail)\b/.test(label)) return "email"
    if (/\b(phone|tel|mobile|cell)\b/.test(label)) return "tel"
    if (/\b(first|given)\b/.test(label)) return "given-name"
    if (/\b(last|family|surname)\b/.test(label)) return "family-name"
    if (/\bname\b/.test(label)) return "name"
    return undefined
}

// T3-M8 fix: fields the author mapped to a Cal.com custom field id
// (FieldConfig.calFieldId) are sent via the booking POST's
// `bookingFieldsResponses` map — previously custom fields only ever lived
// inside the free-text `notes` string, so Cal.com's own booking-custom-fields
// UI stayed empty no matter what the form asked.
function buildBookingFieldsResponses(
    steps: NormalizedStep[],
    values: BookingValues
): Record<string, string> {
    const out: Record<string, string> = {}
    for (const step of steps) {
        if (step.stepType !== "form" && step.stepType !== "datetime") continue
        for (const field of step.fields) {
            if (!field.calFieldId) continue
            const value = values[field.id]
            if (value === undefined || value === "") continue
            out[field.calFieldId] = String(value)
        }
    }
    return out
}

function buildNotesPayload(
    steps: NormalizedStep[],
    values: BookingValues
): string {
    // T3-L5 fix: the primary-name and email fields used to be included here
    // AND in the `attendee` object — so every booking's notes carried the
    // visitor's name and email twice.
    // T3-L6 fix: notes were formatted as Markdown ("## heading" /
    // "- **label**: value"), which Cal.com's notes field stores verbatim as
    // plain text — bookings kept literal "##" and "**" in them.
    const lines: string[] = []
    for (const step of steps) {
        // Calendar steps can carry custom fields too - include them in notes.
        if (step.stepType !== "form" && step.stepType !== "datetime") continue
        if (!step.fields.length) continue
        const stepLines: string[] = []
        for (const field of step.fields) {
            if (field.isPrimaryName || field.fieldType === "email") continue
            const value = values[field.id]
            if (value === undefined || value === "") continue
            stepLines.push(`${field.label}: ${String(value)}`)
        }
        if (!stepLines.length) continue
        lines.push(step.title)
        lines.push(...stepLines)
        lines.push("")
    }
    if (values[SELECTED_SLOT_KEY]) {
        const slot = values[SELECTED_SLOT_KEY]
        const dateStr = slot.date.toLocaleDateString(pageLocale(), {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        lines.push("Selected Time")
        lines.push(`Date: ${dateStr}`)
        lines.push(`Time: ${slot.timeLabel}`)
    }
    return lines.join("\n").trim()
}

function buildIcsDataUri(
    slot: BookingPayload,
    description?: string,
    summary?: string
): string {
    const toIcsDate = (d: Date) =>
        d
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}Z$/, "Z")
    // Fix #4: use the actual Cal.com slot start (ISO) when available, instead
    // of slot.date (which is midnight of the picked calendar day). Fall back
    // to combining slot.date with the HH:MM time for the demo grid.
    let startDate: Date
    let endDate: Date
    const isIso = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
    if (isIso) {
        startDate = new Date(slot.time24h)
        // Fix #11: use the real Cal.com slot end if we captured it.
        endDate = slot.end
            ? new Date(slot.end)
            : new Date(startDate.getTime() + DEFAULT_MEETING_DURATION_MS)
    } else {
        // Demo grid: combine the picked date with the HH:MM time string.
        const mins = parseTimeToMinutes(slot.time24h)
        startDate = new Date(slot.date)
        startDate.setHours(Math.floor(mins / 60), mins % 60, 0, 0)
        endDate = new Date(startDate.getTime() + DEFAULT_MEETING_DURATION_MS)
    }
    const start = toIcsDate(startDate)
    const end = toIcsDate(endDate)
    // T3-M4 fix: the UID was `startDate.getTime()@booking-engine` — a raw
    // epoch isn't unique across bookings for the same slot time, and RFC
    // 5545 (5.8.4) requires a globally-unique identifier. A random UUID is.
    const uid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}@booking-engine`
    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BookingEngine//Framer//EN",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        // T3-M3 fix: was "SUMMARY:Booking" and nothing else. STATUS:
        // CONFIRMED + SEQUENCE:0 are the RFC 5545 way to mark a confirmed
        // event, and DESCRIPTION carries the collected booking answers
        // instead of throwing them away. LOCATION/ORGANIZER have no data
        // source in this component's config surface, so they stay omitted
        // until one exists.
        `SUMMARY:${(summary || "Booking").replace(/(\r|\n)/g, " ")}`,
        ...(description
            ? [
                  `DESCRIPTION:${description
                      .replace(/\r?\n/g, "\\n")
                      .slice(0, 500)}`,
              ]
            : []),
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n")
    if (typeof window === "undefined") return ""
    try {
        // T3-I4 fix: `btoa(unescape(encodeURIComponent(ics)))` relied on the
        // deprecated `unescape` (ECMAScript Annex B, slated for removal).
        // Encode the string's UTF-8 bytes via TextEncoder and assemble the
        // binary string manually — same result, no deprecated API.
        const bytes = new TextEncoder().encode(ics)
        let binary = ""
        for (const byte of bytes) binary += String.fromCharCode(byte)
        return `data:text/calendar;charset=utf-8;base64,${btoa(binary)}`
    } catch {
        return ""
    }
}

function formatStepCounter(
    template: string,
    current: number,
    total: number
): string {
    return (template || "Step {current} of {total}")
        .replace(/\{current\}/g, String(current))
        .replace(/\{total\}/g, String(total))
}

// T10-M4 fix: per-field length caps. An authored `maxLength` wins; otherwise
// a sane default per input type. The caps only exist to stop unbounded input —
// they never block a restored session value from rendering.
function effectiveMaxLength(field: Pick<NormalizedField, "fieldType" | "maxLength">): number {
    if (field.maxLength && field.maxLength > 0) return field.maxLength
    switch (field.fieldType) {
        case "email":
            return 254
        case "phone":
            return 40
        case "textarea":
            return 1000
        case "text":
        default:
            return 250
    }
}

// T10-H5 fix: Google Calendar / Outlook deep links generated from the booked
// slot, complementing the .ics download. Times are UTC-compact (YYYYMMDDTHHMMSSZ)
// as those providers require; duration comes from the Cal.com slot end or the
// default meeting length when the slot has none.
function buildCalendarDeepLink(
    provider: "google" | "outlook",
    slot: BookingPayload,
    summary: string,
    description?: string
): string {
    const start = new Date(slot.time24h)
    if (Number.isNaN(start.getTime())) return ""
    const endMs =
        slot.end && !Number.isNaN(new Date(slot.end).getTime())
            ? new Date(slot.end).getTime()
            : start.getTime() + DEFAULT_MEETING_DURATION_MS
    const end = new Date(endMs)
    const toCompact = (d: Date) =>
        d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
    const text = encodeURIComponent(summary)
    const details = encodeURIComponent(description || "")
    if (provider === "google") {
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${toCompact(start)}/${toCompact(end)}&details=${details}`
    }
    return `https://outlook.live.com/calendar/0/action/compose?subject=${text}&startdt=${toCompact(start)}&enddt=${toCompact(end)}&body=${details}`
}

// =============================================================================
// The component
// =============================================================================

/**
 * BookingEngine
 *
 * A generic, configurable multi-step form/booking engine with optional Cal.com
 * v2 integration. Drops into any Framer project with zero configuration.
 *
 * @framerIntrinsicWidth 850
 * @framerIntrinsicHeight 600
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 *
 * @framerDisableUnlink
 */
// T7-I3 fix: @framerDisableUnlink above - prevents editors from
// accidentally unlink-detaching this code component into a divergent copy.
// T5-M3 fix: AnimatePresence keeps the exiting step mounted during the
// popLayout fade, and the old motion.div stayed fully present in the
// accessibility tree - screen-reader users could re-read, and even tab
// into, the step that is visually gone. usePresence() flips to false the
// moment the step starts exiting, so the wrapper is hidden from assistive
// tech immediately (focus has already moved to the new step's heading).
function AnimatedStepContent(props: {
    transition: Transition
    children: React.ReactNode
}) {
    const [isPresent] = usePresence()
    // T8-H1 fix: on the canvas and in exports there is nothing to animate -
    // skip framer-motion entirely so every properties-panel edit stops
    // triggering layout measurement + spring runs.
    const isStatic = useIsStaticRenderer()
    if (isStatic) {
        return <div style={{ position: "relative" }}>{props.children}</div>
    }
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={props.transition}
            style={{ position: "relative" }}
            aria-hidden={isPresent ? undefined : true}
        >
            {props.children}
        </motion.div>
    )
}


function useBookingEngineState(props: BookingEngineProps) {
    const {
        style,
        stepCount,
        step1,
        step2,
        step3,
        step4,
        step5,
        step6,
        step7,
        step8,
        step9,
        step10,
        buttonLabels,
        progressBar,
        styles,
        font,
        transition,
        copy,
        calApiKey,
        calEventTypeId,
        defaultTimeFormat,
        returnHomeUrl,
        onAnalytics,
        validation,
    } = props

    // T4-H3 fix: author-configurable validation messages (Copy panel →
    // Validation), threaded into validateField/validateStep. Defaults mirror
    // the previously hard-coded strings, so existing instances are
    // unaffected until an author changes them.
    const validationCopy: ValidationCopy = React.useMemo(() => {
        const validationMessages = validation
        return {
            requiredFieldError:
                validationMessages?.requiredFieldError ?? DEFAULT_VALIDATION_COPY.requiredFieldError,
            emailError: validationMessages?.emailError ?? DEFAULT_VALIDATION_COPY.emailError,
            phoneError: validationMessages?.phoneError ?? DEFAULT_VALIDATION_COPY.phoneError,
            minLengthError:
                validationMessages?.minLengthError ?? DEFAULT_VALIDATION_COPY.minLengthError,
            pickDateTimeError:
                validationMessages?.pickDateTimeError ?? DEFAULT_VALIDATION_COPY.pickDateTimeError,
            pastTimeError:
                validationMessages?.pastTimeError ?? DEFAULT_VALIDATION_COPY.pastTimeError,
            customRegexError:
                validationMessages?.customRegexError ?? DEFAULT_VALIDATION_COPY.customRegexError,
            invalidRegexError:
                validationMessages?.invalidRegexError ?? DEFAULT_VALIDATION_COPY.invalidRegexError,
            minLength: validationMessages?.minLength ?? DEFAULT_VALIDATION_COPY.minLength,
        }
    }, [copy])

    // Destructure style tokens from the grouped Styles object.
    const {
        theme: themeSetting,
        accentColor,
        backgroundColor,
        surfaceColor,
        textPrimaryColor,
        textSecondaryColor,
        borderColor,
        errorColor,
        successColor,
        borderRadius,
    } = styles
    // Defensive fallback for instances created before the prop moved.
    const colorMode: ColorMode = themeSetting || "light"
    // Progress bar settings (grouped object control). Defaults keep
    // previous instances behaving exactly as before.
    const progressVisible = progressBar?.visible !== false
    const stepCountPosition: "top" | "bottom" =
        progressBar?.stepCountPosition === "bottom" ? "bottom" : "top"
    const progressShowTextContent = progressBar?.showTextContent !== false
    const progressBarStyle: "solid" | "dashed" =
        progressBar?.barStyle === "dashed" ? "dashed" : "solid"

    // Destructure copy from the grouped Buttons object (Requirement 5).
    const { continueLabel, backLabel, finalActionLabel } = buttonLabels

    // Persist state is always on (not exposed to the editor). Auto-generate a
    // stable instance ID per component instance via React's useId() so multiple
    // BookingEngine components on the same page don't collide in sessionStorage.
    const persistState = true
    const reactInstanceId = React.useId()

// T5-M8 fix: honor the visitor's prefers-reduced-motion setting - the
// step fades/glides, the progress-bar spring, and the toggle slider all
// collapse to instant when motion is reduced.
const prefersReducedMotion = useReducedMotion()

// Resolve the Framer transition for step-to-step animation. Falls back to a
// smooth default if the editor hasn't customized it.
const stepTransition =
    transition ||
    (prefersReducedMotion
        ? ({ type: "tween", duration: 0 } as const)
        : ({ type: "tween", ease: "easeInOut", duration: 0.3 } as const))

    // Resolve colorMode → effective palette. "auto" uses the dark palette only
    // when the visitor's OS reports prefers-color-scheme: dark. Default is light.
    // T10-M6 fix: the state initialized to `false`, so the FIRST paint in auto
    // mode was always light and flipped to dark after the mount effect ran -
    // a light-then-dark flash on every page load. Read matchMedia once
    // synchronously in the lazy initializer so the first render is already
    // correct.
    const [systemDark, setSystemDark] = React.useState<boolean>(() => {
        if (
            typeof window === "undefined" ||
            typeof window.matchMedia !== "function"
        )
            return false
        try {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
        } catch {
            return false
        }
    })
    React.useEffect(() => {
        if (
            typeof window === "undefined" ||
            typeof window.matchMedia !== "function"
        )
            return
        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const update = () => setSystemDark(mq.matches)
        update()
        try {
            mq.addEventListener("change", update)
            return () => mq.removeEventListener("change", update)
        } catch {
            mq.addListener(update)
            return () => mq.removeListener(update)
        }
    }, [])

    // Fix #25: memoize the theme object so child components wrapped in
    // React.memo don't re-render on every parent render.
    const theme = React.useMemo(() => {
        const useDarkLocal =
            colorMode === "dark" || (colorMode === "auto" && systemDark)
        return useDarkLocal
            ? {
                  accentColor,
                  backgroundColor:
                      backgroundColor === "#FFFFFF"
                          ? DEFAULT_DARK_THEME.backgroundColor
                          : backgroundColor,
                  surfaceColor:
                      surfaceColor === "#F7F8FA"
                          ? DEFAULT_DARK_THEME.surfaceColor
                          : surfaceColor,
                  textPrimaryColor:
                      textPrimaryColor === "#111827"
                          ? DEFAULT_DARK_THEME.textPrimaryColor
                          : textPrimaryColor,
                  textSecondaryColor:
                      textSecondaryColor === "#6B7280"
                          ? DEFAULT_DARK_THEME.textSecondaryColor
                          : textSecondaryColor,
                  borderColor:
                      borderColor === "#E5E7EB"
                          ? DEFAULT_DARK_THEME.borderColor
                          : borderColor,
                  errorColor,
                  successColor,
              }
            : {
                  accentColor,
                  backgroundColor,
                  surfaceColor,
                  textPrimaryColor,
                  textSecondaryColor,
                  borderColor,
                  errorColor,
                  successColor,
              }
    }, [
        colorMode,
        systemDark,
        accentColor,
        backgroundColor,
        surfaceColor,
        textPrimaryColor,
        textSecondaryColor,
        borderColor,
        errorColor,
        successColor,
    ])

    // Assemble the active steps from the ten fixed slots, in order, truncated
    // to `stepCount`. Fixed slots (rather than one dynamic Array control) are
    // what make the panel stable — see Safety Rules #1 and #2 above the
    // `BookingEngineProps` interface for why. Each slot is once again a
    // single, self-contained `StepConfig` (its `stepType` lives inside the
    // slot's own submenu again), so no merging is needed here.
    const effectiveStepsConfig = React.useMemo(() => {
        const slots: Array<StepConfig | undefined> = [
            step1,
            step2,
            step3,
            step4,
            step5,
            step6,
            step7,
            step8,
            step9,
            step10,
        ]
        const clampedCount = clamp(Math.round(stepCount ?? 2), 1, 10)
        return slots.slice(0, clampedCount).map((slot, idx) => {
            const fallback = getRuntimeFallbackStep(idx)
            return slot || fallback
        })
    }, [
        stepCount,
        step1,
        step2,
        step3,
        step4,
        step5,
        step6,
        step7,
        step8,
        step9,
        step10,
    ])

    // Normalize the authored schema into stable IDs.
    const normalizedSteps = React.useMemo(
        () => normalizeSteps(effectiveStepsConfig),
        [effectiveStepsConfig]
    )

    // Pipeline: only enabled steps participate, in panel/array order (drag to
    // reorder in the Properties Panel).
    const activeSteps = React.useMemo(
        () => normalizedSteps.filter((step) => step.enabled),
        [normalizedSteps]
    )
    const totalActive = activeSteps.length

    const [currentIndex, setCurrentIndex] = useStateGuarded(0, totalActive)
    // CC-8 fix: `useStateGuarded` only re-clamps when its setter is called —
    // it does not retroactively clamp the already-committed state when
    // `totalActive` shrinks on its own (e.g. an author disables a step
    // while a visitor is mid-flow). The correction effect below fixes this
    // on the NEXT commit, but the render that happens before that effect
    // runs would otherwise read `activeSteps[currentIndex]` as `undefined`
    // and crash on `currentStep.title`. This is defense-in-depth: clamp for
    // this render too, not just in the effect.
    const safeCurrentIndex = Math.min(
        currentIndex,
        Math.max(0, totalActive - 1)
    )
    const currentStep = activeSteps[safeCurrentIndex]
    const isFirst = safeCurrentIndex === 0
    const isLast = safeCurrentIndex === totalActive - 1

    // Form state.
    const [values, setValues] = React.useState<BookingValues>({})
    const [errors, setErrors] = React.useState<Record<string, string | null>>(
        {}
    )
    const [touched, setTouched] = React.useState<Record<string, boolean>>({})
    const [flowStatus, setFlowStatus] =
        React.useState<FlowStatus>("in-progress")
    const [submitError, setSubmitError] = React.useState<string | null>(null)
    const [bookingResult, setBookingResult] =
        React.useState<BookingConfirmation | null>(null)

    // Date/time tracking for the datetime step.
    // T6-L9 fix: the booked slot lives in exactly ONE place -
    // `values[SELECTED_SLOT_KEY]`. The parent's date is DERIVED from it,
    // falling back to the transient day the visitor is browsing (the
    // calendar can't wait for a full slot: picking a date must show that
    // day's times before a time is chosen). Everything downstream
    // (slotsForSelectedDate, the "no times" banner, the initialDate seed)
    // reads this derived value, so there is no second source of truth to
    // drift. The child's own selectedDate/selectedTime are local UI state.
    const [pickedDate, setPickedDate] = React.useState<Date | null>(null)
    const selectedDate =
        pickedDate ??
        (values[SELECTED_SLOT_KEY]?.date as Date | null) ??
        null
    const [visibleMonth, setVisibleMonth] = React.useState<Date | null>(null)
    const [timeZone, setTimeZone] = React.useState<string>(() =>
        detectTimezone()
    )
    // Task 2 M6 fix: this was purely local state inside `DateAndTimeInline`
    // before, which meant it reset back to the hardcoded "12h" default
    // every time the visitor stepped away from the datetime step and back
    // (each step's content unmounts on navigation), and obviously never
    // survived a page refresh either. Lifted up alongside `timeZone`, which
    // already got this treatment, so both choices persist the same way.
    const [timeFormat, setTimeFormat] = React.useState<"12h" | "24h">(
        () => (defaultTimeFormat === "24h" ? "24h" : "12h")
    )

    // Persisted-state restore. Always on; auto-generated instance ID.
    const sessionKey = React.useMemo(
        () => `booking-engine:${reactInstanceId}`,
        [reactInstanceId]
    )
    React.useEffect(() => {
        if (!persistState) return
        if (typeof window === "undefined") return
        try {
        const raw = window.sessionStorage.getItem(sessionKey)
        if (!raw) return
        // T6-L10 fix: restore every ISO date-time string back into a real
        // Date on parse, not just `__selectedSlot.date` (which the block
        // below still re-checks as a belt-and-suspenders guard). The reviver
        // keys on the property name "date" so the slot's `time24h` ISO string
        // (used verbatim for the Cal.com POST) is never converted.
        const parsed = JSON.parse(raw, (key, value) => {
            if (
                key === "date" &&
                typeof value === "string" &&
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
            ) {
                return new Date(value)
            }
            return value
        })
            if (parsed && typeof parsed === "object") {
                const restoredValues = parsed.values || {}
                // Fix #3: re-hydrate __selectedSlot.date from ISO string to
                // a real Date object so downstream Date methods don't throw.
                if (
                    restoredValues[SELECTED_SLOT_KEY] &&
                    restoredValues[SELECTED_SLOT_KEY].date &&
                    !(restoredValues[SELECTED_SLOT_KEY].date instanceof Date)
                ) {
                    try {
                        restoredValues[SELECTED_SLOT_KEY].date = new Date(
                            restoredValues[SELECTED_SLOT_KEY].date
                        )
                    } catch {
                        restoredValues[SELECTED_SLOT_KEY] = undefined
                    }
                }
                setValues(restoredValues)
                if (restoredValues[SELECTED_SLOT_KEY]) {
                    const slot = restoredValues[SELECTED_SLOT_KEY]
                    if (slot.date) {
                        const restoredDate = new Date(slot.date)
                        setPickedDate(restoredDate)
                        // M3 fix: only `selectedDate` was restored — the
                        // calendar itself defaults to *today's* month
                        // whenever `visibleMonth` is null, so a visitor who
                        // picked a date next month, then refreshed, came
                        // back to see this month's grid with nothing
                        // visibly selected (their actual selection was just
                        // scrolled off-screen). Restore the month the
                        // selected date is actually in too.
                        setVisibleMonth(
                            new Date(
                                restoredDate.getFullYear(),
                                restoredDate.getMonth(),
                                1
                            )
                        )
                    }
                }
                // Task 2 M6 fix: restore the visitor's chosen timezone and
                // 12h/24h format alongside their other in-progress answers,
                // rather than silently reverting to the detected timezone
                // and the "12h" default on refresh.
                if (
                    typeof parsed.timeZone === "string" &&
                    parsed.timeZone
                ) {
                    setTimeZone(parsed.timeZone)
                }
                if (
                    parsed.timeFormat === "12h" ||
                    parsed.timeFormat === "24h"
                ) {
                    setTimeFormat(parsed.timeFormat)
                }
                // T6-H2 fix: restore the step the visitor was on. Clamped by
                // the `useLayoutEffect` below if the author shrank the step
                // count since the session was saved.
                if (
                    typeof parsed.currentIndex === "number" &&
                    Number.isFinite(parsed.currentIndex) &&
                    parsed.currentIndex >= 0
                ) {
            setCurrentIndex(parsed.currentIndex)
        }
    }
    } catch (err) {
        // T6-L6 fix: previously silent - a corrupt/oversized saved session
        // must not quietly kill the restore path with zero trace.
        console.warn(
            "BookingEngine: failed to restore saved progress.",
            err
        )
    }
}, [persistState, sessionKey])

// Persist on every change while in-progress.
// T6-M1 fix: the write used to run synchronously on EVERY keystroke
// (JSON.stringify + sessionStorage.setItem per character). Debounce by
// 300ms so a typing burst serializes once, after the pause.
const persistTimerRef = React.useRef<number | null>(null)
// T7-H6 fix: the 0ms focus timers are stored here so they can be cancelled
// on unmount - previously they were fire-and-forget and could run against
// a detached DOM node.
const focusTimerRef = React.useRef<number | null>(null)
React.useEffect(() => {
    if (!persistState) return
    if (typeof window === "undefined") return
    if (flowStatus === "success") {
        if (persistTimerRef.current !== null) {
            window.clearTimeout(persistTimerRef.current)
            persistTimerRef.current = null
        }
        try {
            window.sessionStorage.removeItem(sessionKey)
        } catch (err) {
            console.warn(
                "BookingEngine: failed to clear saved progress.",
                err
            )
        }
        return
    }
    if (persistTimerRef.current !== null) {
        window.clearTimeout(persistTimerRef.current)
    }
    persistTimerRef.current = window.setTimeout(() => {
        persistTimerRef.current = null
        try {
            window.sessionStorage.setItem(
                sessionKey,
                JSON.stringify({
                    values,
                    [SELECTED_SLOT_KEY]: values[SELECTED_SLOT_KEY],
                    timeZone,
                    timeFormat,
                    // T6-H2 fix: currentIndex was never persisted, so a
                    // refresh mid-flow silently dropped the visitor back to
                    // step 0 (the layout effect below re-clamps the restored
                    // value if the author changed the step count meanwhile).
                    currentIndex: safeCurrentIndex,
                })
            )
        } catch (err) {
            // T6-L6 fix: a quota-exceeded write (5MB typical) used to be
            // silently swallowed - the visitor believed progress was being
            // saved while nothing was. At minimum, log it so the failure is
            // observable; the visitor's in-memory flow is unaffected.
            console.warn(
                "BookingEngine: failed to save progress (storage full?).",
                err
            )
        }
    }, 300)
    return () => {
        if (persistTimerRef.current !== null) {
            window.clearTimeout(persistTimerRef.current)
            persistTimerRef.current = null
        }
        if (focusTimerRef.current !== null) {
            window.clearTimeout(focusTimerRef.current)
            focusTimerRef.current = null
        }
    }
}, [persistState, sessionKey, values, flowStatus, timeZone, timeFormat, safeCurrentIndex])

    // Reset currentIndex if it ever exceeds the active pipeline length
    // (e.g. when author disables steps while a user is mid-flow).
    // CC-8 fix: useLayoutEffect instead of useEffect so the correction
    // commits before the browser paints, closing the window during which a
    // stale currentIndex could be visible (the `safeCurrentIndex` clamp
    // above still covers the very first render, before any effect runs).
    React.useLayoutEffect(() => {
        if (currentIndex >= totalActive && totalActive > 0) {
            React.startTransition(() =>
                setCurrentIndex(Math.max(0, totalActive - 1))
            )
        } else if (totalActive === 0) {
            React.startTransition(() => setCurrentIndex(0))
        }
    }, [currentIndex, totalActive])

    // Cal.com slots — fetched when a datatetime step is present in the flow
    // and config is present. T2-M4 fix: was gated on `datetimeStepActive`,
    // so entering (and later re-entering) the datetime step flipped the
    // effect dep, re-running the fetch effect even though the month never
    // changed. Gating on the *static* `hasDatetimeStep` keeps the dep stable
    // for the whole flow (the per-month cache absorbs an otherwise-eager
    // fetch for a datetime step that comes later in the flow).
    const hasDatetimeStep =
        activeSteps.some((step) => step.stepType === "datetime") ?? false
    const hasCalConfig = Boolean(calApiKey && calEventTypeId)
    const {
        slots,
        loading: slotsLoading,
        error: slotsError,
        // T3-H4 fix: retry path refetches availability (see handleRetry).
        refetch: slotsRefetch,
    } = useCalcomSlots(
        hasCalConfig ? calApiKey : "",
        hasCalConfig ? calEventTypeId : "",
        hasDatetimeStep ? visibleMonth : null,
        timeZone,
        copy?.availabilityErrorLabel
    )

    // Task 1 M6 fix (completion): `hasKnownAvailability`/`availableDates`
    // were added to `DateAndTimeInline` and its keyboard-navigation logic,
    // but the parent never actually computed or passed the prop down — so
    // days with zero Cal.com slots stayed fully clickable in practice. Build
    // the set here, keyed the same way `DateAndTimeInline`'s own
    // `dateKeyOf` keys its grid cells, from the *unfiltered* month's slots
    // (not `slotsForSelectedDate`, which only covers the currently picked
    // day). `undefined` while there's no Cal.com config, so the no-config
    // demo grid keeps every date selectable.
    const availableDates = React.useMemo(() => {
        if (!hasCalConfig) return undefined
        const set = new Set<string>()
        for (const slot of slots) {
            const d = new Date(slot.value)
            if (Number.isNaN(d.getTime())) continue
            // CC-13 completion: was browser-local Y/M/D, so near-midnight
            // slots bucketed into the wrong calendar day whenever the
            // selected timezone differed from the browser's. Use the same
            // zone the labels were computed in.
            set.add(getDateKeyInTimeZone(d, timeZone))
        }
        return set
    }, [hasCalConfig, slots, timeZone])

    // Filter slots to the selected date (if a date is picked).
    const slotsForSelectedDate = React.useMemo(() => {
        if (!selectedDate) return slots
        const selectedKey = getDateKeyInTimeZone(selectedDate, timeZone)
        return slots.filter((slot) => {
            try {
                const d = new Date(slot.value)
                // CC-13 completion: was `isSameDay` (browser-local) — same
                // near-midnight misbucket. Compare calendar days in the
                // visitor's selected timezone instead.
                return getDateKeyInTimeZone(d, timeZone) === selectedKey
            } catch {
                return false
            }
        })
    }, [slots, selectedDate, timeZone])

    // CC-10 fix: `canProceed` was dead code (never read anywhere) that ran
    // a full `validateStep()` on every keystroke because `values` was a
    // dependency — directly contradicting this file's own rule that
    // validation must never run while typing (see handleFieldChange above).
    // Deleted rather than kept "just in case": if step-gating on validity is
    // ever wanted, it should be recomputed where it's used, not sit here
    // silently paying a per-keystroke cost for nothing.

    // Guardrail warning (canvas-only): datetime step without name+email somewhere.
    const needsNameEmailGuardrail = React.useMemo(() => {
        if (!activeSteps.some((step) => step.stepType === "datetime")) return false
        return !findNameField(activeSteps) || !findEmailField(activeSteps)
    }, [activeSteps])

    // Canvas-only empty-step warnings. Detects:
    //   - A form step with zero fields (T10-M9: skipped on the published site)
    //   - A choice-type field (select/segmented/pills/cards/radio) with zero options
    const emptyStepWarnings = React.useMemo(() => {
        const warnings: string[] = []
        // T10-M9: normalizedSteps (not activeSteps) — empty form steps are
        // filtered out of the pipeline, so the author warning must read the
        // pre-filter list or it would never fire.
        for (const step of normalizedSteps) {
            if (step.stepType === "form" && step.fields.length === 0) {
                warnings.push(
                    `Step "${step.title}" has no fields and is skipped on the published site. Add at least one field in the Fields property.`
                )
            }
        }
        for (const step of activeSteps) {
            if (step.stepType === "form" || step.stepType === "datetime") {
                for (const field of step.fields) {
                    const isChoiceType = [
                        "select",
                        "segmented",
                        "pills",
                        "cards",
                        "radio",
                    ].includes(field.fieldType)
                    if (
                        isChoiceType &&
                        (!field.options || field.options.length === 0)
                    ) {
                        warnings.push(
                            `Field "${field.label}" in step "${step.title}" has no options. Add at least one option.`
                        )
                    }
                }
            }
        }
        return warnings
    }, [normalizedSteps, activeSteps])

    // T10-L1 fix: is there at least one required field anywhere in the flow?
    // When yes, a hint line explains what the asterisk means.
    const hasRequiredFields = React.useMemo(
        () =>
            activeSteps.some(
                (step) =>
                    (step.stepType === "form" ||
                        step.stepType === "datetime") &&
                    step.fields.some((field) => field.required)
            ),
        [activeSteps]
    )

    // T10-M1 fix: analytics emitter. A throwing author callback must never
    // break the booking flow, so everything is try/caught.
    const emitAnalytics = React.useCallback(
        (eventName: string, payload?: Record<string, unknown>) => {
            if (typeof onAnalytics !== "function") return
            try {
                onAnalytics(eventName, payload)
            } catch (err) {
                console.warn(
                    `BookingEngine: analytics callback threw for "${eventName}".`,
                    err
                )
            }
        },
        [onAnalytics]
    )

    // ===== handlers =====

    // Fix #12: ref-based double-submit guard. The flowStatus check alone has a
    // race window between the first click and React's re-render; this ref closes it.
    const submittingRef = React.useRef(false)
    // T3-H2 fix: one idempotency key per selected slot, generated on first
    // submit and REUSED across retries of the same submission — see
    // handleSubmitBooking / handleSlotReady / makeIdempotencyKey.
    const idempotencyKeyRef = React.useRef<string | null>(null)

// T6-M8 fix: focusFirstInvalidField only READS values (to look up the
// current value while deciding which field to focus). Putting `values`
// in its deps made it - and every handler that depends on it
// (handleContinue) - rebuild on every keystroke. A ref holds the latest
// values without forcing recreation.
const valuesRef = React.useRef(values)
React.useEffect(() => {
    valuesRef.current = values
}, [values])

// T6-L7 fix: abort the in-flight booking POST and release the
// double-submit guard when the component unmounts mid-submit (React 18
// silently no-ops the state updates, but the fetch itself would keep
// running - a network leak and a stuck "submitting" ref).
const abortControllerRef = React.useRef<AbortController | null>(null)
React.useEffect(() => {
    return () => {
        submittingRef.current = false
        abortControllerRef.current?.abort()
        abortControllerRef.current = null
    }
}, [])

    // CC-6 fix: focus management on step transitions. Screen-reader users
    // otherwise get no signal a step changed — focus silently stays on the
    // (now stale) Continue button. Move focus to the new step's heading on
    // every transition, but not on first mount (that would steal focus from
    // the page on initial load, which is its own accessibility anti-pattern).
    const stepTitleRef = React.useRef<HTMLHeadingElement | null>(null)
    const hasMountedStepRef = React.useRef(false)
    React.useEffect(() => {
        if (!hasMountedStepRef.current) {
            hasMountedStepRef.current = true
            return
        }
        stepTitleRef.current?.focus()
    }, [safeCurrentIndex])

    // Requirement 3: validation must never trigger or display dynamically
    // while the user is typing — only `handleContinue` (on "Continue"/final
    // action click) is allowed to compute and surface field errors. So this
    // handler only ever updates `values`; it deliberately does not touch
    // `errors` or `touched`.
const handleFieldChange = React.useCallback(
    (fieldId: string, value: string | boolean | undefined) => {
        setValues((prev) => ({ ...prev, [fieldId]: value }))
        // T4-M1 fix: previous behavior only (re)validated on Continue, so a
        // visitor who fixed what the error described kept seeing a stale
        // error until the next submit attempt. Re-validate the single
        // touched field immediately so errors clear (or appear) live.
        const field = activeSteps
            .find((step) => step.stepType === "form" || step.stepType === "datetime")
            ?.fields.find((candidate) => candidate.id === fieldId)
        if (!field) return
        const err = validateField(field, value, validationCopy)
        setErrors((prev) => ({ ...prev, [fieldId]: err }))
    },
    [activeSteps, validationCopy]
)

// T6-H4 fix: guarded flowStatus setter - see FLOW_STATUS_TRANSITIONS.
const transitionFlowStatus = React.useCallback((next: FlowStatus) => {
    setFlowStatus((prev) => {
        if (next === prev) return prev
        if (!FLOW_STATUS_TRANSITIONS[prev]?.includes(next)) {
            console.warn(
                `BookingEngine: blocked flowStatus transition ${prev} -> ${next}`
            )
            return prev
        }
        return next
    })
}, [])

const focusFirstInvalidField = React.useCallback(
        (step: NormalizedStep) => {
            if (typeof document === "undefined") return
            // Calendar steps can carry custom fields too - only Review has none.
            if (step.stepType === "review") return
            for (const field of step.fields) {
                const err = validateField(field, valuesRef.current[field.id], validationCopy)
                if (err) {
                    const wrapper = document.querySelector<HTMLElement>(
                        `[data-field-id="${field.id}"]`
                    )
                    // T4-M5 fix: the wrapper div isn't focusable, so calling
                    // `focus()` on it silently did nothing (visible for
                    // choice/radio groups) and keyboard focus never reached
                    // the invalid control. Focus the first real focusable
                    // control inside the wrapper instead.
                    const focusable = wrapper?.querySelector<HTMLElement>(
                        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
                    )
const target = focusable ?? wrapper
                    if (target) {
                        try {
                            target.focus()
                            target.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            })
                        } catch {
                            /* ignore */
                        }
                        break
                    }
                }
        }
    },
    [validationCopy]
)

const handleSubmitBooking = React.useCallback(async () => {
        // Fix #6: never fire a real POST from inside the Framer canvas.
        if (RenderTarget.current() === RenderTarget.canvas) return
        // Fix #12: double-submit guard.
        if (submittingRef.current) return
        submittingRef.current = true

        const nameField = findNameField(activeSteps)
        const emailField = findEmailField(activeSteps)
        const slot = values[SELECTED_SLOT_KEY]

        // T3-M7 fix: the old single "required information is missing" line
        // blamed the visitor in BOTH failure modes below — but a missing
        // name/email FIELD is an author-configuration bug nobody can fix
        // from the visitor side, while a missing slot is a plain visitor
        // flow issue. Two distinct paths, two honest messages.
        if (!slot) {
            setSubmitError(
                "Please go back and pick a time slot before continuing."
            )
            transitionFlowStatus("error")
            submittingRef.current = false
            emitAnalytics("booking_error", {
                reason: "missing-slot",
                message: "Please go back and pick a time slot before continuing.",
            })
            return
        }
        if (!nameField || !emailField) {
            setSubmitError(
                "This booking form isn't fully configured: it's missing a name or email field. Please contact the site owner."
            )
            transitionFlowStatus("error")
            submittingRef.current = false
            emitAnalytics("booking_error", {
                reason: "missing-name-email-field",
                message:
                    "This booking form isn't fully configured: it's missing a name or email field. Please contact the site owner.",
            })
            return
        }

        // T3-M5 fix: never POST a non-ISO slot time (the demo grid's
        // "HH:MM" values). Fail visibly instead of sending garbage to
        // Cal.com — submitCalcomBooking re-checks too.
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h)) {
            setSubmitError(
                "The selected time is invalid. Please go back and pick a time slot again."
            )
            transitionFlowStatus("error")
            submittingRef.current = false
            emitAnalytics("booking_error", {
                reason: "invalid-slot-time",
                message:
                    "The selected time is invalid. Please go back and pick a time slot again.",
            })
            return
        }

        const name = String(values[nameField.id] || "")
        const email = String(values[emailField.id] || "")
        const notes = buildNotesPayload(activeSteps, values)
        const bookingFieldsResponses = buildBookingFieldsResponses(
            activeSteps,
            values
        )

        transitionFlowStatus("submitting")
        setSubmitError(null)
        // T10-M1 fix: the attempt itself (POST about to start) - distinct
        // from success/error, so funnel analytics can count submissions
        // attempted vs completed.
        emitAnalytics("booking_submitted", {
            slotStart: slot.time24h,
            calEventTypeId,
        })

        // T3-H2 fix: generate the idempotency key ONCE per selected slot and
        // keep it across retries — a retried POST after a network blip then
        // can't create a duplicate booking. Cleared on success and whenever
        // a different slot is picked (handleSlotReady).
        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = makeIdempotencyKey()
        }

        // T6-L7 fix: hand the unmount-abort signal to the POST so it dies
        // with this component instead of leaking.
        abortControllerRef.current = new AbortController()

        const result = await submitCalcomBooking({
            apiKey: calApiKey,
            eventTypeId: calEventTypeId,
            slotStart: slot.time24h,
            name,
            email,
            timeZone,
            notes,
            bookingFieldsResponses,
            idempotencyKey: idempotencyKeyRef.current,
            externalSignal: abortControllerRef.current.signal,
        })
        abortControllerRef.current = null

        if (result.success) {
            // T3-H2: this submission is done — a future booking (or retry
            // for a new slot) starts with a fresh key.
            idempotencyKeyRef.current = null
            // CC-11 fix: surface the booking reference instead of discarding
            // the response. `manageUrl` uses Cal.com's own public booking
            // page (which is where Cal.com itself exposes reschedule/cancel)
            // rather than guessing at reschedule/cancel field names.
            setBookingResult({
                uid: result.bookingUid || null,
                manageUrl: result.bookingUid
                    ? `https://cal.com/booking/${result.bookingUid}`
                    : null,
            })
            transitionFlowStatus("success")
            emitAnalytics("booking_success", {
                bookingUid: result.bookingUid || null,
            })
        } else {
            // T3-M2 fix: pass the machine-readable error code through.
            const errorMessage = mapCalcomError(
                result.error || "Unknown error",
                result.errorCode
            )
            setSubmitError(errorMessage)
            transitionFlowStatus("error")
            emitAnalytics("booking_error", {
                reason: "submit-failed",
                errorCode: result.errorCode || null,
                message: errorMessage,
            })
        }
        submittingRef.current = false
    }, [activeSteps, values, calApiKey, calEventTypeId, timeZone, validationCopy, emitAnalytics])

    const handleContinue = React.useCallback(() => {
        if (!currentStep) return
        if (flowStatus === "submitting") return

        // Fix #21: when the user clicks the final action on a review step,
        // re-validate ALL prior form steps. If any is invalid, jump back to
        // the first invalid step and touch its fields so errors show.
        if (isLast && currentStep.stepType === "review") {
            const firstInvalidIdx = activeSteps.findIndex(
                (s) => !validateStep(s, values, validationCopy).valid
            )
            if (firstInvalidIdx >= 0 && firstInvalidIdx !== currentIndex) {
                const invalidStep = activeSteps[firstInvalidIdx]
                setErrors((prev) => ({
                    ...prev,
                    ...validateStep(invalidStep, values, validationCopy).errors,
                }))
                setTouched((prev) => touchAllFieldsIn(invalidStep, prev))
                setCurrentIndex(firstInvalidIdx)
                focusTimerRef.current = window.setTimeout(() => focusFirstInvalidField(invalidStep), 0)
                return
            }
        }

        const { valid, errors: stepErrors } = validateStep(currentStep, values, validationCopy)
        setErrors((prev) => ({ ...prev, ...stepErrors }))
        setTouched((prev) => touchAllFieldsIn(currentStep, prev))

        // ===== THE FIX =====
        // Nothing below this line runs on an invalid step.
        if (!valid) {
            // Focus the first invalid field for accessibility (Section 11).
            // Defer to next tick so the just-set error state has rendered.
            focusTimerRef.current = window.setTimeout(() => focusFirstInvalidField(currentStep), 0)
            return
        }

        if (isLast) {
            // Terminal action — submit a Cal.com booking if a datetime step is in
            // the pipeline, otherwise just show the success screen.
            const hasDatetime = activeSteps.some(
                (step) => step.stepType === "datetime"
            )
            if (hasDatetime && hasCalConfig) {
                handleSubmitBooking()
            } else if (hasDatetime && !hasCalConfig) {
                // CC-3 fix: on the published site, a datetime step with no
                // Cal.com credentials must NOT silently "succeed" — that
                // leaves a visitor believing they booked an appointment the
                // clinic has no record of. The canvas-only setup banner
                // already warns the author about this; on a real visit we
                // stop hard instead of faking a confirmation. (On canvas
                // itself, RenderTarget guards elsewhere keep this harmless.)
                const noConfigMessage =
                    "Booking is currently unavailable. Please call us directly to schedule your appointment."
                setSubmitError(noConfigMessage)
                transitionFlowStatus("error")
                emitAnalytics("booking_error", {
                    reason: "missing-cal-config",
                    message: noConfigMessage,
                })
            } else {
                transitionFlowStatus("success")
                emitAnalytics("booking_success", { bookingUid: null })
            }
            return
        }

        // T10-M1 fix: announce step completion as the visitor advances.
        emitAnalytics("step_complete", {
            stepIndex: safeCurrentIndex,
            stepNumber: safeCurrentIndex + 1,
            totalSteps: totalActive,
            stepTitle: currentStep.title,
            stepType: currentStep.stepType,
        })
        React.startTransition(() => {
            setCurrentIndex((i) => Math.min(i + 1, totalActive - 1))
        })
    }, [
        currentStep,
        values,
        flowStatus,
        isLast,
        totalActive,
        activeSteps,
        currentIndex,
        safeCurrentIndex,
        hasCalConfig,
        focusFirstInvalidField,
        handleSubmitBooking,
        setSubmitError,
        transitionFlowStatus,
        emitAnalytics,
    ])

    const handleBack = React.useCallback(() => {
        if (isFirst) return
        React.startTransition(() => {
            setCurrentIndex((i) => Math.max(0, i - 1))
        })
    }, [isFirst])

    // T10-H1 fix: review-step Edit links jump straight to the owning step.
    // Guards against a stale stepIndex (e.g. steps changed after submit),
    // and clears the in-flight submit state if one is running.
    const handleJumpToStep = React.useCallback(
        (stepIndex: number) => {
            if (stepIndex < 0 || stepIndex >= activeSteps.length) return
            if (flowStatus === "submitting") {
                setSubmitError(null)
                idempotencyKeyRef.current = null
            }
            setFlowStatus("in-progress")
            React.startTransition(() => setCurrentIndex(stepIndex))
        },
        [activeSteps.length, flowStatus]
    )

    const handleRetry = React.useCallback(() => {
        // T3-H3/H4 fix: when the failure was the slot itself (taken by
        // someone else / availability lapsed), retrying in place re-submits
        // the identical stale slot — a wasted POST at best, an endless
        // retry loop at worst. Take the visitor back to the calendar, drop
        // the stale slot, and force a fresh availability fetch (the cache
        // would otherwise keep serving the old data, see useCalcomSlots' T3-H4
        // refetch) so they pick what's actually free.
        const msg = submitError || ""
        const slotTaken =
            msg.includes("just taken") || msg.includes("no longer available")
        if (slotTaken) {
            const dtIdx = activeSteps.findIndex(
                (step) => step.stepType === "datetime"
            )
            if (dtIdx >= 0) {
                setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: undefined }))
                setPickedDate(null)
                idempotencyKeyRef.current = null
                React.startTransition(() => setCurrentIndex(dtIdx))
                slotsRefetch()
            }
        }
        // Critical: do NOT clear `values`. The user re-picks only what they want to change.
        transitionFlowStatus("in-progress")
        setSubmitError(null)
        // T6-L1 fix: a stale confirmation from an earlier booking must not
        // survive a retry - handleRestart cleared it, handleRetry didn't.
        setBookingResult(null)
        submittingRef.current = false
    }, [submitError, activeSteps, slotsRefetch])

    const handleRestart = React.useCallback(() => {
        setValues({})
        setErrors({})
        setTouched({})
        setPickedDate(null)
        setVisibleMonth(null)
        setSubmitError(null)
        setBookingResult(null)
        setCurrentIndex(0)
        transitionFlowStatus("in-progress")
        submittingRef.current = false
        if (typeof window !== "undefined" && persistState) {
            try {
                window.sessionStorage.removeItem(sessionKey)
            } catch (err) {
                console.warn(
                    "BookingEngine: failed to clear saved progress on restart.",
                    err
                )
            }
        }
    }, [persistState, sessionKey])

    const handleSlotReady = React.useCallback((payload?: BookingPayload) => {
        if (!payload) {
            setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: undefined }))
            // T3-H2: slot cleared — the old idempotency key no longer
            // describes this submission; start fresh on the next pick.
            idempotencyKeyRef.current = null
            return
        }
        setValues((prev) =>
            ({ ...prev, [SELECTED_SLOT_KEY]: payload } as BookingValues)
        )
        // T3-H2: a *different* slot is a different booking — the previous
        // slot's retry key must never be reused for it.
        idempotencyKeyRef.current = null
        // Live-clear the error once a slot is chosen.
        setTouched((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: true }))
        setErrors((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: null }))
    }, [])

    // T6-H3 fix: inline arrows recreated these callbacks every render,
// defeating the memoization of the inlined child components.
// T6-L9 fix: the calendar's transient day goes to `pickedDate`; the
// booked slot itself stays canonical in `values[SELECTED_SLOT_KEY]`.
const handleInlineDateChange = React.useCallback(
    (d: Date) => setPickedDate(d),
    []
)
const handleInlineMonthChange = React.useCallback(
    (m: Date) => setVisibleMonth(m),
    []
)
const handleInlineTimeZoneChange = React.useCallback(
    (tz: string) => setTimeZone(tz),
    []
)

// ===== render =====

    // T9-M7 fix: the render target is static for a component's lifetime;
    // compute once instead of reading it on every render.
    const isCanvas = React.useMemo(
        () => RenderTarget.current() === RenderTarget.canvas,
        []
    )
    const fontStack: React.CSSProperties = {
        fontFamily: font?.fontFamily || "Inter, system-ui, sans-serif",
        fontSize: font?.fontSize || 15,
        lineHeight: font?.lineHeight || 1.4,
        letterSpacing: font?.letterSpacing || 0,
        fontWeight: font?.fontWeight || 400,
        fontStyle: font?.fontStyle || "normal",
    }

    // Setup guard: no Cal.com credentials configured. Rendered as an inline
    // banner above the working flow (NOT a replacement) so the editor can still
    // see and interact with the component on the canvas.
    const needsCalSetup = hasDatetimeStep && !hasCalConfig

    // ---- 1. Empty pipeline guard (canvas-only) ----

    // ---- 4. Active step render ----
    const progressPct =
        totalActive > 0 ? ((safeCurrentIndex + 1) / totalActive) * 100 : 0
    const completePct = Math.round(progressPct)
    const counterText = formatStepCounter(
        copy.stepCounterTemplate,
        safeCurrentIndex + 1,
        totalActive
    )

    // Determine the primary button label. On a single-step flow, "Continue"
    // becomes the final action.
    const primaryLabel =
        totalActive === 1 || isLast ? finalActionLabel : continueLabel
    const isSubmitting = flowStatus === "submitting"
    // T9-M11 fix: the animate target was an inline object literal - a new
    // reference every render forced framer-motion to re-evaluate the
    // animation target on each keystroke. Memoized on the only thing
    // that changes it.
    const progressAnimate = React.useMemo(
        () => ({ width: `${progressPct}%` }),
        [progressPct]
    )

    return {
        abortControllerRef,
        accentColor,
        activeSteps,
        availableDates,
        backgroundColor,
        backLabel,
        bookingResult,
        borderColor,
        borderRadius,
        buttonLabels,
        calApiKey,
        calEventTypeId,
        colorMode,
        completePct,
        continueLabel,
        copy,
        counterText,
        currentIndex,
        currentStep,
        defaultTimeFormat,
        effectiveStepsConfig,
        emptyStepWarnings,
        errorColor,
        errors,
        finalActionLabel,
        flowStatus,
        focusFirstInvalidField,
        focusTimerRef,
        font,
        fontStack,
        handleBack,
        handleContinue,
        handleFieldChange,
        handleInlineDateChange,
        handleInlineMonthChange,
        handleInlineTimeZoneChange,
        handleJumpToStep,
        handleRestart,
        handleRetry,
        handleSlotReady,
        handleSubmitBooking,
        hasCalConfig,
        hasDatetimeStep,
        hasMountedStepRef,
        idempotencyKeyRef,
        isCanvas,
        isFirst,
        isLast,
        isSubmitting,
        needsCalSetup,
        needsNameEmailGuardrail,
        normalizedSteps,
        persistState,
        persistTimerRef,
        pickedDate,
        prefersReducedMotion,
        primaryLabel,
        progressAnimate,
        progressBar,
        progressBarStyle,
        progressPct,
        progressShowTextContent,
        progressVisible,
        reactInstanceId,
        safeCurrentIndex,
        selectedDate,
        sessionKey,
        setBookingResult,
        setCurrentIndex,
        setErrors,
        setFlowStatus,
        setPickedDate,
        setSubmitError,
        setSystemDark,
        setTimeFormat,
        setTimeZone,
        setTouched,
        setValues,
        setVisibleMonth,
        slots,
        slotsError,
        slotsForSelectedDate,
        slotsLoading,
        slotsRefetch,
        step1,
        step10,
        step2,
        step3,
        step4,
        step5,
        step6,
        step7,
        step8,
        step9,
        stepCount,
        stepCountPosition,
        stepTitleRef,
        stepTransition,
        style,
        styles,
        submitError,
        submittingRef,
        successColor,
        surfaceColor,
        systemDark,
        textPrimaryColor,
        textSecondaryColor,
        theme,
        themeSetting,
        timeFormat,
        timeZone,
        totalActive,
        touched,
        transition,
        transitionFlowStatus,
        validationCopy,
        values,
        valuesRef,
        visibleMonth,
        returnHomeUrl,
        hasRequiredFields
    }
}

export default function BookingEngine(props: BookingEngineProps) {
    const {
        abortControllerRef,
        accentColor,
        activeSteps,
        availableDates,
        backgroundColor,
        backLabel,
        bookingResult,
        borderColor,
        borderRadius,
        buttonLabels,
        calApiKey,
        calEventTypeId,
        colorMode,
        completePct,
        continueLabel,
        copy,
        counterText,
        currentIndex,
        currentStep,
        defaultTimeFormat,
        effectiveStepsConfig,
        emptyStepWarnings,
        errorColor,
        errors,
        finalActionLabel,
        flowStatus,
        focusFirstInvalidField,
        focusTimerRef,
        font,
        fontStack,
        handleBack,
        handleContinue,
        handleFieldChange,
        handleInlineDateChange,
        handleInlineMonthChange,
        handleInlineTimeZoneChange,
        handleJumpToStep,
        handleRestart,
        handleRetry,
        handleSlotReady,
        handleSubmitBooking,
        hasCalConfig,
        hasDatetimeStep,
        hasMountedStepRef,
        idempotencyKeyRef,
        isCanvas,
        isFirst,
        isLast,
        isSubmitting,
        needsCalSetup,
        needsNameEmailGuardrail,
        normalizedSteps,
        persistState,
        persistTimerRef,
        pickedDate,
        prefersReducedMotion,
        primaryLabel,
        progressAnimate,
        progressBar,
        progressBarStyle,
        progressPct,
        progressShowTextContent,
        progressVisible,
        reactInstanceId,
        safeCurrentIndex,
        selectedDate,
        sessionKey,
        setBookingResult,
        setCurrentIndex,
        setErrors,
        setFlowStatus,
        setPickedDate,
        setSubmitError,
        setSystemDark,
        setTimeFormat,
        setTimeZone,
        setTouched,
        setValues,
        setVisibleMonth,
        slots,
        slotsError,
        slotsForSelectedDate,
        slotsLoading,
        slotsRefetch,
        step1,
        step10,
        step2,
        step3,
        step4,
        step5,
        step6,
        step7,
        step8,
        step9,
        stepCount,
        stepCountPosition,
        stepTitleRef,
        stepTransition,
        style,
        styles,
        submitError,
        submittingRef,
        successColor,
        surfaceColor,
        systemDark,
        textPrimaryColor,
        textSecondaryColor,
        theme,
        themeSetting,
        timeFormat,
        timeZone,
        totalActive,
        touched,
        transition,
        transitionFlowStatus,
        validationCopy,
        values,
        valuesRef,
        visibleMonth,
        returnHomeUrl,
        hasRequiredFields
    } = useBookingEngineState(props)

    if (totalActive === 0) {
        // On the published site, rendering nothing is cleaner than an error
        // message. On canvas, show the notice so the editor knows what's wrong.
        if (!isCanvas) return null
        return (
            <RootShell style={style} fontStack={fontStack}>
                <div
                    style={{
                        padding: 24,
                        color: theme.textPrimaryColor,
                        fontSize: 14,
                        lineHeight: 1.5,
                    }}
                >
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            marginBottom: 8,
                        }}
                    >
                        No active steps
                    </div>
                    <div style={{ color: theme.textSecondaryColor }}>
                        Enable at least one step in the Steps property to
                        display the booking flow.
                    </div>
                </div>
            </RootShell>
        )
    }

    // ---- 3. Terminal states (outside the step count) ----
    if (flowStatus === "success") {
        return (
            <RootShell style={style} fontStack={fontStack}>
                <SuccessScreen
                    steps={activeSteps}
                    values={values}
                    bookingResult={bookingResult}
                    accentColor={theme.accentColor}
                    textPrimaryColor={theme.textPrimaryColor}
                    textSecondaryColor={theme.textSecondaryColor}
                    surfaceColor={theme.surfaceColor}
                    borderColor={theme.borderColor}
                    successColor={theme.successColor}
                    borderRadius={borderRadius}
                    onRestart={handleRestart}
                    successTitle={copy.successTitle}
                    successSubtitle={copy.successSubtitle}
                    addToCalendarLabel={copy.addToCalendarLabel}
                    restartLabel={copy.restartLabel}
                    timeZone={timeZone}
                    timeZoneLabel={copy.timeZoneLabel}
                    icsSummaryLabel={copy.icsSummaryLabel}
                    dateLabel={copy.dateLabel || "Date"}
                    timeLabel={copy.timeLabel || "Time"}
                    googleCalendarLabel={copy.googleCalendarLabel}
                    outlookCalendarLabel={copy.outlookCalendarLabel}
                    returnHomeLabel={copy.returnHomeLabel}
                    returnHomeUrl={returnHomeUrl}
                />
            </RootShell>
        )
    }
    if (flowStatus === "error") {
        return (
            <RootShell style={style} fontStack={fontStack}>
                <ErrorScreen
                    message={
                        submitError ||
                        "Something went wrong while submitting your booking."
                    }
                    errorColor={theme.errorColor}
                    textPrimaryColor={theme.textPrimaryColor}
                    textSecondaryColor={theme.textSecondaryColor}
                    surfaceColor={theme.surfaceColor}
                    borderColor={theme.borderColor}
                    borderRadius={borderRadius}
                    accentColor={theme.accentColor}
                    onRetry={handleRetry}
                    errorTitle={copy.errorTitle}
                    errorSubtitle={copy.errorSubtitle}
                    retryLabel={copy.retryLabel}
                    supportContactLabel={copy.supportContactLabel}
                    supportContactValue={copy.supportContactValue}
                />
            </RootShell>
        )
    }
    return (
        <RootShell style={style} fontStack={fontStack}>
            {/* Cal.com setup notice — canvas-only. Never shown in preview or
                on the published site. The flow below remains fully interactive
                in all render targets; the date/time step falls back to a
                generated demo grid when credentials are missing. */}
            {isCanvas && needsCalSetup ? (
                <div
                    style={{
                        padding: "10px 14px",
                        marginBottom: 12,
                        borderRadius: borderRadius,
                        background: withAlpha(theme.accentColor, 0.08),
                        border: `1px solid ${withAlpha(theme.accentColor, 0.3)}`,
                        color: theme.textPrimaryColor,
                        fontSize: 12,
                        lineHeight: 1.4,
                    }}
                >
                    <strong style={{ color: theme.accentColor }}>
                        Connect Cal.com
                    </strong>{" "}
                    to enable real availability and booking submission. Add your
                    API key and Event Type ID in the properties panel. Until
                    then, the date/time step shows a demo grid and the final
                    "Book Now" button will skip the network call.
                </div>
            ) : null}

            {/* Canvas-only guardrail for missing name/email fields. */}
            {isCanvas && needsNameEmailGuardrail ? (
                <div
                    style={{
                        padding: "10px 14px",
                        marginBottom: 12,
                        borderRadius: borderRadius,
                        background: withAlpha(theme.errorColor, 0.1),
                        color: theme.errorColor,
                        fontSize: 12,
                        lineHeight: 1.4,
                    }}
                >
                    Cal.com requires a name and email field somewhere in this
                    flow. Add a required text field (and tick "Primary Name")
                    and an email-typed field to enable booking submission.
                </div>
            ) : null}

            {/* Canvas-only warnings for empty steps / empty choice options. */}
            {isCanvas && emptyStepWarnings.length > 0
                ? emptyStepWarnings.map((msg, idx) => (
                      <div
                          key={msg}
                          style={{
                              padding: "10px 14px",
                              marginBottom: 8,
                              borderRadius: borderRadius,
                              background: withAlpha(theme.errorColor, 0.1),
                              color: theme.errorColor,
                              fontSize: 12,
                              lineHeight: 1.4,
                          }}
                      >
                          {msg}
                      </div>
                  ))
                : null}

            {totalActive > 1 && (progressVisible || progressShowTextContent) ? (
                <div style={{ marginBottom: 16 }}>
                    {progressShowTextContent && stepCountPosition === "top" ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: progressVisible ? 8 : 0,
                                color: theme.textSecondaryColor,
                                fontSize: 12,
                                fontWeight: 500,
                                letterSpacing: 0.2,
                            }}
                            // T5-H8 completion: step progress is a status
                            // change screen readers never heard.
                            role="status"
                            aria-live="polite"
                        >
                            <span>{counterText}</span>
                            <span>{completePct}% complete</span>
                        </div>
                    ) : null}
                    {/* Requirement 1: Bar Style. "Solid" is the original
                        single continuous fill; "Dashed" divides the track
                        into `totalActive`-many equal-width segments (one per
                        step) with a visible gap, filling segments up through
                        the current step.
                        T10-M7 fix: both bars were aria-hidden — the visual
                        progress was invisible to screen readers even though
                        the text counter announced percentages. Both now carry
                        proper progressbar semantics; only the purely
                        decorative inner pieces stay aria-hidden. */}
                    {progressVisible && progressBarStyle === "dashed" ? (
                        <div
                            style={{
                                display: "flex",
                                gap: 4,
                                width: "100%",
                            }}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={completePct}
                            aria-label="Booking progress"
                        >
                            {Array.from({ length: totalActive }).map((_, i) => (
                                <div
                                    key={i}
                                    aria-hidden="true"
                                    style={{
                                        flex: 1,
                                        height: PROGRESS_BAR_HEIGHT,
                                        borderRadius: 999,
                                        background:
                                            i <= safeCurrentIndex
                                                ? theme.accentColor
                                                : theme.surfaceColor,
                                        transition:
                                            "background-color 0.25s ease",
                                    }}
                                />
                            ))}
                        </div>
                    ) : progressVisible ? (
                        <div
                            style={{
                                width: "100%",
                                height: PROGRESS_BAR_HEIGHT,
                                background: theme.surfaceColor,
                                borderRadius: 999,
                                overflow: "hidden",
                            }}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={completePct}
                            aria-label="Booking progress"
                        >
                    <motion.div
                        initial={false}
                        animate={progressAnimate}
                        transition={
                            prefersReducedMotion
                                ? INSTANT_TRANSITION
                                : PROGRESS_BAR_TRANSITION
                        }
                                style={{
                                    height: "100%",
                                    background: theme.accentColor,
                                    borderRadius: 999,
                                }}
                                aria-hidden="true"
                            />
                        </div>
                    ) : null}
                    {progressShowTextContent &&
                    stepCountPosition === "bottom" ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: progressVisible ? 8 : 0,
                                color: theme.textSecondaryColor,
                                fontSize: 12,
                                fontWeight: 500,
                                letterSpacing: 0.2,
                            }}
                            // Same T5-H8 fix as the top counter: announce
                            // step progress to screen readers.
                            role="status"
                            aria-live="polite"
                        >
                            <span>{counterText}</span>
                            <span>{completePct}% complete</span>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {/* Step content with smooth transition between steps.
                AnimatePresence mode="popLayout" keeps the old step mounted
                (absolutely positioned) while the new step enters, preventing
                the container from collapsing to 0 height between steps (fix #14). */}
                <form
                    // T5-L6 fix: give the form an accessible name so screen
                    // readers can distinguish it from other forms on a page.
                    aria-label="Booking form"
                    onSubmit={(e) => {
                    e.preventDefault()
                    handleContinue()
                }}
                        style={{
                            position: "relative",
                            minHeight: 200,
                            // T10-H2 fix: the footer nav is sticky, so the
                            // step content needs room so the last fields
                            // never hide behind it while scrolling.
                            paddingBottom: 84,
                        }}
                    >
<AnimatePresence mode="popLayout" initial={false}>
                        <AnimatedStepContent
                            key={safeCurrentIndex}
                            transition={stepTransition}
                        >
                            <h2
                                ref={stepTitleRef}
                                tabIndex={-1}
                                style={{
                                    color: theme.textPrimaryColor,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    marginBottom: 4,
                                    lineHeight: 1.2,
                                    marginTop: 0,
                                    outline: "none",
                                }}
                            >
                                {currentStep.title}
                            </h2>
                            {currentStep.subtitle ? (
                                <div
                                    style={{
                                        color: theme.textSecondaryColor,
                                        fontSize: 14,
                                        marginBottom: 16,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {currentStep.subtitle}
                                </div>
                            ) : null}
                            <StepBody
                                step={currentStep}
                                steps={activeSteps}
                                values={values}
                                errors={errors}
                                touched={touched}
                                theme={theme}
                                borderRadius={borderRadius}
                                hasCalConfig={hasCalConfig}
                                slotsLoading={slotsLoading}
                                slotsError={slotsError}
                                slotsForSelectedDate={slotsForSelectedDate}
                                availableDates={availableDates}
                                selectedDate={selectedDate}
                                visibleMonth={visibleMonth}
                                timeZone={timeZone}
                                timeFormat={timeFormat}
                                copy={copy}
                                onFieldChange={handleFieldChange}
                                onSlotReady={handleSlotReady}
                                onDateChange={handleInlineDateChange}
                                onMonthChange={handleInlineMonthChange}
                        onTimeZoneChange={handleInlineTimeZoneChange}
                        onTimeFormatChange={(fmt) => setTimeFormat(fmt)}
                        onJumpToStep={handleJumpToStep}
                        onRetrySlots={slotsRefetch}
                                hideDemoWhenUnconfigured={
                                    !isCanvas && needsCalSetup
                                }
                            />
                        </AnimatedStepContent>
                    </AnimatePresence>
            </form>

            {/* T10-M2/T10-L1 fix: a one-line explanation of the required
                marker plus the author-configured privacy notice (if any),
                sitting under the fields where the visitor looks for
                reassurance before submitting. Both render only when they
                have something to say. */}
            {hasRequiredFields || (copy.privacyNotice || "").trim() ? (
                <div
                    style={{
                        marginTop: 12,
                        fontSize: 12,
                        color: theme.textSecondaryColor,
                        lineHeight: 1.5,
                    }}
                >
                    {hasRequiredFields ? (
                        <div>
                            {copy.requiredFieldsHint || "Fields marked * are required"}
                        </div>
                    ) : null}
                    {(copy.privacyNotice || "").trim() ? (
                        <div style={{ marginTop: hasRequiredFields ? 4 : 0 }}>
                            {copy.privacyNotice}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {/* Footer nav */}
            {/* T10-H2 fix: sticky so Back/Continue stay reachable on long
                steps instead of scrolling out of view; background matches
                the root so content never shows through. */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 24,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    position: "sticky",
                    bottom: 0,
                    zIndex: 10,
                    background: theme.backgroundColor,
                    paddingTop: 12,
                    paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
                }}
            >
                {!isFirst ? (
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        style={{
                            minHeight: TOUCH_TARGET_MIN,
                            padding: "10px 18px",
                            borderRadius: borderRadius,
                            border: `1px solid ${theme.borderColor}`,
                            background: "transparent",
                            color: theme.textPrimaryColor,
                            fontFamily: "inherit",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            opacity: isSubmitting ? 0.5 : 1,
                            transition: "opacity 0.15s ease",
                        }}
                    >
                        {backLabel}
                    </button>
                ) : null}
                <button
                    // T5-L7 fix: this was type="button", so pressing Enter
                    // inside a text field never submitted the form - the
                    // onSubmit handler was dead code for every multi-field
                    // step. It's the form's submit button now.
                    type="submit"
                    onClick={handleContinue}
                    disabled={isSubmitting}
                    style={{
                        minHeight: TOUCH_TARGET_MIN,
                        padding: "10px 22px",
                        borderRadius: borderRadius,
                        border: "none",
                        background: theme.accentColor,
                        color: getReadableTextColor(theme.accentColor),
                        fontFamily: "inherit",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.7 : 1,
                        transition: "opacity 0.15s ease",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <span
                                style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    border: `2px solid ${getReadableTextColor(theme.accentColor)}`,
                                    borderTopColor: "transparent",
                                    display: "inline-block",
                                    animation: prefersReducedMotion
                                ? "none"
                                : `be-spin-${reactInstanceId} 0.8s linear infinite`,
                                }}
                            />
                            {copy.submittingLabel}
                        </>
                    ) : (
                        primaryLabel
                    )}
                </button>
            </div>

            {/* Fix #7: focus-visible ring for form inputs + namespaced spinner keyframes.
                CC-5 fix: this used to target `.be-input-${reactInstanceId}`,
                but every input actually renders with the plain `be-input`
                class — so the rule never matched and no field ever showed a
                keyboard focus ring. Selector now matches the real class. */}
            <style>{`
.be-input { outline: none; }
.be-input:focus-visible {
    outline: 2px solid ${theme.accentColor};
    outline-offset: 1px;
}
/* T10-L2 fix: hide the scrollbar on the horizontally scrollable segmented
   control (WebKit/Blink; Firefox/Edge are handled inline via
   scrollbarWidth/msOverflowStyle on the element itself). */
.be-scrollbar-none::-webkit-scrollbar { display: none; }
@keyframes be-spin-${reactInstanceId} { to { transform: rotate(360deg); } }
@media (max-width: 768px) { .be-form-grid { grid-template-columns: 1fr !important; } }
`}</style>
        </RootShell>
    )
}

// =============================================================================
// useStateGuarded — keeps `currentIndex` within [0, max)
// =============================================================================

function useStateGuarded(
    initial: number,
    max: number
): [number, (next: number | ((prev: number) => number)) => void] {
    const [state, setState] = React.useState<number>(() =>
        max > 0 ? Math.min(initial, max - 1) : 0
    )
    const setter = React.useCallback(
        (next: number | ((prev: number) => number)) => {
            setState((prev) => {
                const resolved =
                    typeof next === "function"
                        ? (next as (p: number) => number)(prev)
                        : next
                if (max > 0) return Math.max(0, Math.min(resolved, max - 1))
                return 0
            })
        },
        [max]
    )
    return [state, setter]
}

// =============================================================================
// RootShell — the relative-positioned root container required by Framer
// =============================================================================

const RootShell = React.memo(function RootShell(props: {
    style?: React.CSSProperties
    fontStack: React.CSSProperties
    children?: React.ReactNode
}) {
    // Deliberately NO background, borderRadius, or border on the root — the
    // editor controls those via Framer's native properties panel (or by
    // wrapping the component in a Framer frame). Inner elements (inputs,
    // buttons, date picker, banners) still use the theme tokens.
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "auto",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                ...props.fontStack,
                ...props.style,
            }}
        >
            {props.children}
        </div>
    )
})

// =============================================================================
// StepBody — renders the active step's fields
// =============================================================================

interface StepBodyProps {
    step: NormalizedStep
    /** Fix #2: full pipeline so ReviewStepBody can derive real field labels. */
    steps: NormalizedStep[]
    values: BookingValues
    errors: Record<string, string | null>
    touched: Record<string, boolean>
    theme: {
        accentColor: string
        backgroundColor: string
        surfaceColor: string
        textPrimaryColor: string
        textSecondaryColor: string
        borderColor: string
        errorColor: string
        successColor: string
    }
    borderRadius: string
    hasCalConfig: boolean
    slotsLoading: boolean
    /** Fix #13: surface Cal.com fetch errors as an inline banner. */
    slotsError: string | null
    slotsForSelectedDate: Array<{
        value: string
        label: string
        end?: string
        minutes: number
    }>
    /** Undefined keeps the no-Cal.com demo calendar fully selectable. */
    availableDates: Set<string> | undefined
    selectedDate: Date | null
    /** Fix #19: parent-controlled visible month. */
    visibleMonth: Date | null
    timeZone: string
    /** Task 2 M6 fix: lifted alongside `timeZone` so the visitor's 12h/24h
     *  choice survives step navigation and session restore instead of
     *  quietly resetting to "12h" every time `DateAndTimeInline` remounts. */
    timeFormat: "12h" | "24h"
    /** CC-3 completion: on the published site (not canvas), a datetime step
     *  with no Cal.com credentials must not render the fake demo grid —
     *  StepBody shows a hard unavailable notice instead. */
    hideDemoWhenUnconfigured: boolean
    /** Fix #20: configurable copy. */
    copy: BookingEngineProps["copy"]
    onFieldChange: (fieldId: string, value: string | boolean | undefined) => void
    onSlotReady: (payload?: BookingPayload) => void
    onDateChange: (d: Date) => void
    onMonthChange: (m: Date) => void
    onTimeZoneChange: (tz: string) => void
    onTimeFormatChange: (fmt: "12h" | "24h") => void
    /** T10-H1 fix: review-step Edit links jump back to a given step. */
    onJumpToStep: (stepIndex: number) => void
    /** T10-M8 fix: re-fetch availability from the error banner. */
    onRetrySlots: () => void
}

const StepBody = React.memo(function StepBody(props: StepBodyProps) {
    const {
        step,
        steps,
        values,
        errors,
        touched,
        theme,
        borderRadius,
        hasCalConfig,
        slotsLoading,
        slotsError,
        slotsForSelectedDate,
        availableDates,
        selectedDate,
        visibleMonth,
        timeZone,
        timeFormat,
        copy,
        onFieldChange,
        onSlotReady,
        onDateChange,
        onMonthChange,
        onTimeZoneChange,
        onTimeFormatChange,
        onJumpToStep,
        onRetrySlots,
        hideDemoWhenUnconfigured,
    } = props

    // Task 2 M5 fix: `detectTimezone()` (an `Intl.DateTimeFormat` call) was
    // previously invoked inside an IIFE in the middle of JSX, so it re-ran
    // on every single render of this component — not just when the
    // timezone selector was actually shown. Memoized with `[]` deps since
    // the visitor's system timezone won't change over the life of the page.
    const detectedTimeZone = React.useMemo(() => detectTimezone(), [])

    // Shared renderer for user-authored fields. Form steps use it directly;
    // Calendar steps render it above the calendar widget so any fields
    // authored on a Calendar step behave exactly like Form-step fields.
    const renderFormFields = () => {
        const isTwoCol = step.layout === "two-column"
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isTwoCol ? "1fr 1fr" : "1fr",
                    gap: 12,
                }}
                className={`be-form-grid`}
            >
                {step.fields.map((field) => (
                    <FieldRenderer
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        error={touched[field.id] ? errors[field.id] : null}
                        theme={theme}
                        borderRadius={borderRadius}
                        isTwoCol={isTwoCol}
                        onFieldChange={onFieldChange}
                    />
                ))}
            </div>
        )
    }

    // --- Review step: summarize prior values (fix #2: use real field labels) ---
    if (step.stepType === "review") {
        return (
                        <ReviewStepBody
                            step={step}
                            steps={steps}
                            values={values}
                            theme={theme}
                            borderRadius={borderRadius}
                            copy={copy}
                            onJumpToStep={onJumpToStep}
                        />
        )
    }

    // --- Datetime step ---
    if (step.stepType === "datetime") {
        const slotError =
            touched[SELECTED_SLOT_KEY] && errors[SELECTED_SLOT_KEY]
                ? errors[SELECTED_SLOT_KEY]
                : null
        const isTwoCol = step.layout === "two-column"

        // Requirement 3: everything that used to be permanently pinned
        // "above" the custom fields — the Cal.com error/no-times messages,
        // the calendar/time picker (including its loading state), its inline error,
        // and the timezone selector — is now a single unit that renders
        // wherever the "Calendar Widget" marker sits in `step.fields`, so
        // dragging that marker in the Fields array actually moves the whole
        // calendar block up or down relative to any custom fields.
        const calendarBlock = (
            <div style={{ gridColumn: "1 / -1" }}>
                {/* Fix #13: surface Cal.com fetch errors as an inline banner.
                    T10-M8 fix: the banner used to be message-only with no way
                    forward except leaving the step — the visitor was stuck if
                    the outage outlasted the auto-retries. Inline retry
                    re-fetches (refetch clears the month cache, so a genuinely
                    new response can land). */}
                {hasCalConfig && slotsError ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                            padding: "10px 14px",
                            marginBottom: 12,
                            borderRadius: borderRadius,
                            background: withAlpha(theme.errorColor, 0.08),
                            border: `1px solid ${withAlpha(theme.errorColor, 0.3)}`,
                            color: theme.errorColor,
                            fontSize: 12,
                            lineHeight: 1.4,
                        }}
                        role="alert"
                    >
                        <span style={{ flex: "1 1 0", minWidth: 0 }}>
                            {slotsError}
                        </span>
                        <button
                            type="button"
                            onClick={onRetrySlots}
                            style={{
                                minHeight: TOUCH_TARGET_MIN,
                                padding: "6px 14px",
                                borderRadius: borderRadius,
                                border: `1px solid ${theme.errorColor}`,
                                background: "transparent",
                                color: theme.errorColor,
                                fontFamily: "inherit",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                flexShrink: 0,
                            }}
                        >
                            {copy.retryLabel}
                        </button>
                    </div>
                ) : null}
                {hasCalConfig &&
                !slotsLoading &&
                !slotsError &&
                slotsForSelectedDate.length === 0 &&
                selectedDate ? (
                    <div
                        style={{
                            padding: "10px 14px",
                            marginBottom: 12,
                            borderRadius: borderRadius,
                            background: withAlpha(
                                theme.textSecondaryColor,
                                0.08
                            ),
                            color: theme.textSecondaryColor,
                            fontSize: 12,
                        }}
                        // T5-H8 completion: the engine-level "no times"
                        // banner was a silent div, same as the in-widget
                        // ones — announce when a chosen day has no slots.
                        role="status"
                        aria-live="polite"
                    >
                        {copy.noTimesLabel}
                    </div>
                ) : null}
                <div
                    style={
                        slotError
                            ? {
                                  borderRadius: borderRadius,
                                  border: `1px solid ${theme.errorColor}`,
                                  padding: 4,
                              }
                            : undefined
                    }
                >
                    {/* CC-3 completion: on the published site (never demo),
                        a datetime step without Cal.com credentials must not
                        present a fake bookable grid. The final-action branch
                        already hard-errors; replace the interactive widget
                        with a dead-ended notice so visitors can't even pick
                        a fake slot. The demo grid stays for canvas editing. */}
                    {hideDemoWhenUnconfigured ? (
                        <div
                            role="alert"
                            style={{
                                padding: "14px 16px",
                                margin: "4px 0",
                                borderRadius: borderRadius,
                                background: withAlpha(
                                    theme.errorColor,
                                    0.08
                                ),
                                border: `1px solid ${withAlpha(
                                    theme.errorColor,
                                    0.3
                                )}`,
                                color: theme.textPrimaryColor,
                                fontSize: 14,
                                lineHeight: 1.5,
                            }}
                        >
                            <strong style={{ color: theme.errorColor }}>
                                Booking is currently unavailable
                            </strong>
                            <div style={{ marginTop: 4 }}>
                                Please call us to schedule your appointment.
                            </div>
                        </div>
                    ) : (
                        <DateAndTimeInline
                        accentColor={theme.accentColor}
                        backgroundColor={theme.backgroundColor}
                        textColor={theme.textPrimaryColor}
                        borderColor={theme.borderColor}
                        radius={borderRadius}
                        startTime="09:00"
                        endTime="17:00"
                        interval={30}
                        timeFormat={timeFormat}
                        focusColor={theme.accentColor}
                        initialDate={selectedDate}
                        initialTime={
                            values[SELECTED_SLOT_KEY]
                                ? values[SELECTED_SLOT_KEY]
                                      .time24h
                                : null
                        }
                        initialVisibleMonth={visibleMonth}
                        availableTimes={
                            hasCalConfig ? slotsForSelectedDate : undefined
                        }
                        availableDates={availableDates}
                        slotsLoading={slotsLoading}
                        loadingLabel={copy.loadingAvailabilityLabel}
                        onSelectionReady={onSlotReady}
                        onDateChange={onDateChange}
                        onMonthChange={onMonthChange}
                        onTimeFormatChange={onTimeFormatChange}
                        timeZone={timeZone}
                        showTimesWithoutDate
                    />
                    )}
                </div>
                {slotError ? (
                    <div
                        style={{
                            marginTop: 6,
                            color: theme.errorColor,
                            fontSize: 12,
                        }}
                        role="alert"
                    >
                        {slotError}
                    </div>
                ) : null}
                {/* Timezone selector */}
<div style={{ marginTop: 12 }}>
                        <label
                            // T5-H6 fix: the select had no accessible name
                            // (no htmlFor/id wiring, no aria-label), so
                            // screen readers announced an unnamed dropdown.
                            htmlFor="be-timezone-select"
                            style={{
                                display: "block",
                                fontSize: 12,
                                color: theme.textSecondaryColor,
                                marginBottom: 4,
                            }}
                        >
                            {copy.timeZoneSelectLabel || "Time zone"}
                        </label>
                        <select
                            id="be-timezone-select"
                            value={timeZone}
                        onChange={(e) => onTimeZoneChange(e.target.value)}
                        style={{
                            width: "100%",
                            minHeight: TOUCH_TARGET_MIN,
                            padding: "10px 12px",
                            borderRadius: borderRadius,
                            border: `1px solid ${theme.borderColor}`,
                            background: theme.surfaceColor,
                            color: theme.textPrimaryColor,
                            fontFamily: "inherit",
                            fontSize: 14,
                            cursor: "pointer",
                        }}
                    >
                        <option value={detectedTimeZone}>
                            {copy.detectedTimeZonePrefix || "Detected: "}
                            {detectedTimeZone}
                        </option>
                        {COMMON_TIMEZONES.filter(
                            (tz) => tz !== detectedTimeZone
                        ).map((tz) => (
                            <option key={tz} value={tz}>
                                {tz}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        )

        const hasCalendarMarker = step.fields.some(
            (candidate) => candidate.fieldType === "calendar-widget"
        )

        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isTwoCol ? "1fr 1fr" : "1fr",
                    gap: 12,
                }}
                className={`be-form-grid`}
            >
                {step.fields.map((field) =>
                    field.fieldType === "calendar-widget" ? (
                        <React.Fragment key={field.id}>
                            {calendarBlock}
                        </React.Fragment>
                    ) : (
                        <FieldRenderer
                            key={field.id}
                            field={field}
                            value={values[field.id]}
                            error={touched[field.id] ? errors[field.id] : null}
                            theme={theme}
                            borderRadius={borderRadius}
                            isTwoCol={isTwoCol}
                            onFieldChange={onFieldChange}
                        />
                    )
                )}
                {/* Backward compatibility: an existing Calendar step saved
                    before the Calendar Widget marker existed won't have one
                    in its `fields` array. Fall back to rendering the
                    calendar at the end rather than dropping it entirely. */}
                {!hasCalendarMarker ? calendarBlock : null}
            </div>
        )
    }

    // --- Form step ---
    return renderFormFields()
})

// =============================================================================
// ReviewStepBody — auto-summarizes prior steps
// =============================================================================

const ReviewStepBody = React.memo(function ReviewStepBody(props: {
    step: NormalizedStep
    steps: NormalizedStep[]
    values: BookingValues
    theme: StepBodyProps["theme"]
    borderRadius: string
    copy: BookingEngineProps["copy"]
    // T10-H1 fix: Edit link per entry jumps straight back to the step that
    // owns the field/slot, instead of forcing Back-Back-Back.
    onJumpToStep?: (stepIndex: number) => void
}) {
    const { step, steps, values, theme, borderRadius, copy, onJumpToStep } = props
    // Fix #2: derive labels from field metadata across ALL form steps, not
    // from the raw `values` keys (which are normalized IDs like "step-0-field-0").
    const entries: Array<{
        id?: string
        label: string
        value: string
        stepIndex: number
    }> = []
    let datetimeStepIndex = -1
    steps.forEach((stepEntry, stepIdx) => {
        if (
            stepEntry.stepType !== "form" &&
            stepEntry.stepType !== "datetime"
        )
            return
        if (stepEntry.stepType === "datetime" && datetimeStepIndex === -1) {
            datetimeStepIndex = stepIdx
        }
        for (const field of stepEntry.fields) {
            const value = values[field.id]
            if (value === undefined || value === "") continue
            entries.push({
                id: field.id,
                label: field.label,
                value: String(value),
                stepIndex: stepIdx,
            })
        }
    })
    if (values[SELECTED_SLOT_KEY]) {
        const slot = values[SELECTED_SLOT_KEY]
        const dateStr = slot.date.toLocaleDateString(pageLocale(), {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        // T10-H4 fix: "Date"/"Time" row labels come from copy.
        entries.push({
            label: copy.dateLabel || "Date",
            value: dateStr,
            stepIndex: datetimeStepIndex,
        })
        entries.push({
            label: copy.timeLabel || "Time",
            value: slot.timeLabel,
            stepIndex: datetimeStepIndex,
        })
    }

    return (
        <div>
            <div
                style={{
                    fontSize: 14,
                    color: theme.textSecondaryColor,
                    marginBottom: 12,
                    lineHeight: 1.5,
                }}
            >
                {copy.reviewIntroLabel}
            </div>
            <div
                style={{
                    borderRadius: borderRadius,
                    border: `1px solid ${theme.borderColor}`,
                    background: theme.surfaceColor,
                    overflow: "hidden",
                }}
            >
                {entries.length === 0 ? (
                    <div
                        style={{
                            padding: 16,
                            color: theme.textSecondaryColor,
                            fontSize: 13,
                        }}
                    >
                        {copy.emptyReviewLabel}
                    </div>
                ) : (
                    entries.map((entry, idx) => (
                        <div
                            key={entry.id || entry.label + idx}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px 16px",
                                borderBottom:
                                    idx < entries.length - 1
                                        ? `1px solid ${theme.borderColor}`
                                        : "none",
                                fontSize: 14,
                            }}
                        >
                            <span
                                style={{
                                    color: theme.textSecondaryColor,
                                    marginRight: 12,
                                }}
                            >
                                {entry.label}
                            </span>
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <span
                                    style={{
                                        color: theme.textPrimaryColor,
                                        fontWeight: 500,
                                        textAlign: "right",
                                        maxWidth: "60%",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {entry.value}
                                </span>
                                {/* T10-H1 fix: jump straight back to the step
                                    that produced this entry. */}
                                {onJumpToStep && entry.stepIndex >= 0 ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onJumpToStep(entry.stepIndex)
                                        }
                                        style={{
                                            border: "none",
                                            background: "none",
                                            padding: 0,
                                            color: theme.accentColor,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        Edit
                                    </button>
                                ) : null}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
})

// =============================================================================
// FieldRenderer — switch on field.type
// =============================================================================

interface FieldRendererProps {
    field: NormalizedField
    value: string | boolean | undefined
    error: string | null
    theme: StepBodyProps["theme"]
    borderRadius: string
    isTwoCol: boolean
    onFieldChange: (fieldId: string, value: string | boolean | undefined) => void
}

const FieldRenderer = React.memo(function FieldRenderer(props: FieldRendererProps) {
    const { field, value, error, theme, borderRadius, isTwoCol, onFieldChange } =
        props

    // T10-M5 fix: auto-resize the textarea to its content. Hooks live at
    // the top (not inside the switch) so a fieldType change in the editor
    // never shifts the hook order.
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    React.useEffect(() => {
        if (field.fieldType !== "textarea") return
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${Math.max(96, el.scrollHeight)}px`
    }, [value, field.fieldType])

    const maxLen = effectiveMaxLength(field)
    const currentLen = String(value ?? "").length

    const labelEl = (
        <label
            htmlFor={`be-field-${field.id}`}
            style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: theme.textPrimaryColor,
                marginBottom: 6,
            }}
        >
            {field.label}
            {field.required ? (
                <span style={{ color: theme.errorColor, marginLeft: 2 }}>
                    *
                </span>
            ) : null}
        </label>
    )

    const errorEl = error ? (
        <div
            id={`be-error-${field.id}`}
            style={{
                marginTop: 4,
                color: theme.errorColor,
                fontSize: 12,
            }}
            role="alert"
        >
            {error}
        </div>
    ) : null

    const containerStyle: React.CSSProperties = {
        gridColumn: field.width === "half" && isTwoCol ? "span 1" : "span 2",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
    }

    // Fix #7: keep `outline: none` for mouse focus, but the CSS class adds
    // a `:focus-visible` ring for keyboard users (defined in the parent render).
    const inputBaseStyle: React.CSSProperties = {
        width: "100%",
        minHeight: TOUCH_TARGET_MIN,
        padding: "10px 14px",
        borderRadius: borderRadius,
        border: `1px solid ${error ? theme.errorColor : theme.borderColor}`,
        background: theme.surfaceColor,
        color: theme.textPrimaryColor,
        fontFamily: "inherit",
        fontSize: 14,
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.15s ease",
    }

    switch (field.fieldType) {
        case "calendar-widget":
            // Marker-only "field": the actual calendar/time picker UI is
            // rendered by the parent (see StepBody's field/calendar map for
            // datetime steps) at the exact position this entry occupies in
            // the array. If it's ever encountered outside a datetime step
            // (e.g. a step's type was switched after adding it), render
            // nothing rather than a confusing stray text input.
            return null
        case "textarea":
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    <textarea
                        id={`be-field-${field.id}`}
                        className={`be-input`}
                        value={typeof value === "string" ? value : ""}
                        placeholder={field.placeholder || ""}
                        required={field.required}
                        // T10-M4/T10-M5 fix: cap input length; also lets the
                        // counter below show a real ceiling.
                        maxLength={maxLen}
                        onChange={(e) => onFieldChange(field.id, e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? `be-error-${field.id}` : undefined
                        }
                        rows={4}
                        ref={textareaRef}
                        style={{
                            ...inputBaseStyle,
                            minHeight: 96,
                            resize: "vertical",
                            fontFamily: "inherit",
                        }}
                    />
                    {/* T10-M5 fix: live character count so visitors know how
                        much room is left before the cap bites. */}
                    <div
                        style={{
                            marginTop: 4,
                            textAlign: "right",
                            fontSize: 11,
                            color: theme.textSecondaryColor,
                        }}
                    >
                        {currentLen}/{maxLen}
                    </div>
                    {errorEl}
                </div>
            )
        case "select":
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    {/* Requirement 4: a visible dropdown-arrow indicator on the
                        far right of the input, since `appearance: "none"`
                        below removes the browser's native one. */}
                    <div style={{ position: "relative" }}>
                        <select
                            id={`be-field-${field.id}`}
                            className={`be-input`}
                            value={typeof value === "string" ? value : ""}
                            required={field.required}
                            onChange={(e) => onFieldChange(field.id, e.target.value)}
                            aria-invalid={!!error}
                            aria-describedby={
                                error ? `be-error-${field.id}` : undefined
                            }
                            style={{
                                ...inputBaseStyle,
                                cursor: "pointer",
                                appearance: "none",
                                paddingRight: 36,
                            }}
                        >
                            <option value="" disabled={field.required}>
                                {field.placeholder || "Select an option…"}
                            </option>
                            {/* T7-M1 fix: options are always strings (the property control is
                                ControlType.String) - the object branch was dead, and
                                (opt as any).label was the file's last "as any". */}
                            {(field.options || []).map((opt) => {
                                const label = opt
                                return (
                                    <option key={label} value={label}>
                                        {label}
                                    </option>
                                )
                            })}
                        </select>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                            }}
                        >
                            <path
                                d="M4 6L8 10L12 6"
                                stroke={theme.textSecondaryColor}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    {errorEl}
                </div>
            )
        case "segmented":
        case "pills":
        case "cards":
        case "radio": {
            // Fix #22: pass options as a direct array (no comma round-trip).
            // T7-M1 fix: options are strings - the object branch was dead.
            // T10-L4 fix: zip the parallel image/description arrays in by
            // index so cards/radio can render media without changing the
            // stored options shape.
            const opts: ChoiceOption[] = (field.options || []).map(
                (opt, idx) => ({
                    label: opt,
                    image: field.optionImages?.[idx] || undefined,
                    description:
                        field.optionDescriptions?.[idx] || undefined,
                })
            )
            const variant =
                field.fieldType === "pills"
                    ? "pills"
                    : field.fieldType === "segmented"
                      ? "segmented"
                      : field.fieldType === "radio"
                        ? "radio"
                        : "cards"
            return (
                <div
                    style={{
                        ...containerStyle,
                        border: error
                            ? `1px solid ${theme.errorColor}`
                            : "none",
                        borderRadius: error ? borderRadius : 0,
                        padding: error ? 6 : 0,
                    }}
                    data-field-id={field.id}
                >
                    {labelEl}
                    <ChoiceGroupInline
                        // CC-7 fix: this was passed as "", so the
                        // radiogroup's accessible name fell through to
                        // `inputName` — the internal field ID (e.g.
                        // "step-0-field-0"), which is what screen readers
                        // announced instead of the field's actual label.
                        label={field.label}
                        inputName={field.id}
                        defaultValue={opts[0]?.label || ""}
                        variant={variant}
                        optionsText=""
                        options={opts}
                        accentColor={theme.accentColor}
                        textColor={theme.textPrimaryColor}
                        mutedTextColor={theme.textSecondaryColor}
                        backgroundColor={theme.surfaceColor}
                        borderColor={theme.borderColor}
                        radius={borderRadius}
                        fontSize={14}
                        focusColor={theme.accentColor}
                        controlledValue={
                            typeof value === "string" ? value : undefined
                        }
                        ariaInvalid={!!error}
                        ariaDescribedBy={
                            error ? `be-error-${field.id}` : undefined
                        }
                        onChange={(value) => onFieldChange(field.id, value)}
                    />
                    {errorEl}
                </div>
            )
        }
        case "checkbox": {
            const checked = Boolean(value)
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            cursor: "pointer",
                            fontSize: 14,
                            color: theme.textPrimaryColor,
                            lineHeight: 1.4,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            required={field.required}
                            onChange={(e) => onFieldChange(field.id, e.target.checked)}
                            aria-invalid={!!error}
                            // Fix #16: associate the error with the checkbox.
                            aria-describedby={
                                error ? `be-error-${field.id}` : undefined
                            }
                            style={{
                                marginTop: 2,
                                width: 18,
                                height: 18,
                                accentColor: theme.accentColor,
                                cursor: "pointer",
                            }}
                        />
                        <span>
                            {field.label}
                            {field.required ? (
                                <span
                                    style={{
                                        color: theme.errorColor,
                                        marginLeft: 2,
                                    }}
                                >
                                    *
                                </span>
                            ) : null}
                        </span>
                    </label>
                    {errorEl}
                </div>
            )
        }
        case "email":
        case "phone":
        case "text":
        default:
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    <input
                        id={`be-field-${field.id}`}
                        className={`be-input`}
                        type={
                            field.fieldType === "email"
                                ? "email"
                                : field.fieldType === "phone"
                                  ? "tel"
                                  : "text"
                        }
                        value={typeof value === "string" ? value : ""}
                        placeholder={field.placeholder || ""}
                        // T5-H1 fix: fields were never marked `required`, so
                        // native form semantics (and the browser's built-in
                        // validation UX) never saw the field as required.
                        required={field.required}
                        // T5-H2 fix: no autocomplete hints at all - the
                        // browser's address bar remembers the visitor's
                        // details, but the form never asked for them.
                        autoComplete={autocompleteToken(field)}
                        // T10-M4 fix: unbounded input — cap by the per-field
                        // setting or the type's built-in default.
                        maxLength={maxLen}
                        onChange={(e) => onFieldChange(field.id, e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? `be-error-${field.id}` : undefined
                        }
                        style={inputBaseStyle}
                    />
                    {errorEl}
                </div>
            )
    }
})

// =============================================================================
// SuccessScreen — confirmation summary + .ics download
// =============================================================================

const SuccessScreen = React.memo(function SuccessScreen(props: {
    steps: NormalizedStep[]
    values: BookingValues
    bookingResult: BookingConfirmation | null
    accentColor: string
    textPrimaryColor: string
    textSecondaryColor: string
    surfaceColor: string
    borderColor: string
    successColor: string
    borderRadius: string
    onRestart: () => void
    successTitle: string
    successSubtitle: string
    addToCalendarLabel: string
    restartLabel: string
    // T3-I3 fix: the timezone the visitor booked in (selected TZ, not
    // browser TZ) plus the label copy that marks the time as "their" time.
    timeZone: string
    timeZoneLabel: string
    // T3-M3 fix: configurable calendar-event summary.
    icsSummaryLabel: string
    // T10-H4 fix: summary row labels for the booked date and time.
    dateLabel: string
    timeLabel: string
    // T10-H5 fix: labels of the Google Calendar / Outlook deep-link buttons.
    googleCalendarLabel: string
    outlookCalendarLabel: string
    // T10-L6 fix: "return to home" link. `returnHomeUrl` empty → hidden.
    returnHomeLabel: string
    returnHomeUrl: string
}) {
    const {
        steps,
        values,
        bookingResult,
        accentColor,
        textPrimaryColor,
        textSecondaryColor,
        surfaceColor,
        borderColor,
        successColor,
        borderRadius,
        onRestart,
        successTitle,
        successSubtitle,
        addToCalendarLabel,
        restartLabel,
        timeZone,
        timeZoneLabel,
        icsSummaryLabel,
        dateLabel,
        timeLabel,
        googleCalendarLabel,
        outlookCalendarLabel,
        returnHomeLabel,
        returnHomeUrl,
    } = props

    // CC-6 fix: this screen replaces the whole step flow, so screen-reader
    // users need to be told something happened and where to listen. Focus
    // the heading on mount and mark the region as an assertive status so
    // it's announced even though focus (not just DOM insertion) moved here.
    const headingRef = React.useRef<HTMLHeadingElement | null>(null)
    React.useEffect(() => {
        headingRef.current?.focus()
    }, [])

    // Build a label/value summary from every form step's fields.
    const entries: Array<{ id?: string; label: string; value: string }> = []
    for (const stepEntry of steps) {
        if (stepEntry.stepType !== "form" && stepEntry.stepType !== "datetime") continue
        for (const field of stepEntry.fields) {
            const value = values[field.id]
            if (value === undefined || value === "") continue
            entries.push({ id: field.id, label: field.label, value: String(value) })
        }
    }
    if (values[SELECTED_SLOT_KEY]) {
        const slot = values[SELECTED_SLOT_KEY]
        // T3-I3 fix: the date/time were formatted in the BROWSER's zone
        // while the slot itself was booked in the visitor-selected zone —
        // anyone whose browser zone differs (travel, VPN, wrong system
        // clock) saw a confirmation that silently disagreed with the actual
        // booking time. Format in the selected zone and label the time as
        // the visitor's own.
        const tzOpts = timeZone ? { timeZone } : undefined
        const dateStr = slot.date.toLocaleDateString(pageLocale(), {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            ...tzOpts,
        })
        entries.push({ label: dateLabel, value: dateStr })
        entries.push({
            label: timeLabel,
            value: timeZoneLabel
                ? `${slot.timeLabel} (${timeZoneLabel})`
                : slot.timeLabel,
        })
    }

    // T3-M3 fix: the .ics DESCRIPTION carries the collected answers (minus
    // the internal "Selected Time" section) instead of nothing; the SUMMARY
    // uses the author-configurable label.
    const icsDescription = React.useMemo(() => {
        const raw = buildNotesPayload(steps, values)
        const cut = raw.indexOf("Selected Time")
        return cut > 0 ? raw.slice(0, cut).trim() : raw
    }, [steps, values])
    const icsDateStamp = (() => {
        if (!values[SELECTED_SLOT_KEY]) return ""
        const slot = values[SELECTED_SLOT_KEY]
        const iso = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
            ? slot.time24h
            : slot.date.toISOString()
        return iso.slice(0, 10)
    })()

    const icsUri = values[SELECTED_SLOT_KEY]
        ? buildIcsDataUri(
              values[SELECTED_SLOT_KEY],
              icsDescription || undefined,
              icsSummaryLabel
          )
        : ""

    // T10-H5 fix: Google/Outlook deep links need a real UTC instant — the
    // demo grid's "HH:MM" times have no date, so gate both links on the
    // same ISO check the submit path uses.
    const slot = values[SELECTED_SLOT_KEY] as BookingPayload | undefined
    const hasIsoSlotTime =
        !!slot && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h)
    const googleCalUri =
        hasIsoSlotTime && slot
            ? buildCalendarDeepLink(
                  "google",
                  slot,
                  icsSummaryLabel,
                  icsDescription || undefined
              )
            : ""
    const outlookCalUri =
        hasIsoSlotTime && slot
            ? buildCalendarDeepLink(
                  "outlook",
                  slot,
                  icsSummaryLabel,
                  icsDescription || undefined
              )
            : ""

    // CC-11 fix: surface the booking reference, when one was returned.
    if (bookingResult?.uid) {
        entries.push({ label: "Confirmation #", value: bookingResult.uid })
    }

    return (
        <div role="status" aria-live="assertive">
            {/* Circle with checkmark — centered, on top */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 16,
                }}
            >
                        <div
                            style={{
                                width: CHECKMARK_ICON_SIZE,
                                height: CHECKMARK_ICON_SIZE,
                                borderRadius: "50%",
                                background: successColor,
                                // T5-M7 fix: the checkmark used a hardcoded
                                // white stroke - on a light success green
                                // (e.g. #22C55E) that's a ~2.3:1 contrast,
                                // invisible for low-vision users. Pick the
                                // readable ink per the ACTUAL success color
                                // so custom colors stay legible too.
                                color: getReadableTextColor(successColor),
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            </div>

            {/* Title — centered, under the circle */}
            <h2
                ref={headingRef}
                tabIndex={-1}
                style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: textPrimaryColor,
                    lineHeight: 1.2,
                    textAlign: "center",
                    marginBottom: 4,
                    marginTop: 0,
                    outline: "none",
                }}
            >
                {replaceCopyTokens(successTitle, steps, values)}
            </h2>

            {/* Subtitle — smaller, centered, under the title */}
            <div
                style={{
                    fontSize: 14,
                    color: textSecondaryColor,
                    textAlign: "center",
                    marginBottom: 24,
                    lineHeight: 1.5,
                }}
            >
                {replaceCopyTokens(successSubtitle, steps, values)}
            </div>

            {/* Info card — collected booking details */}
            <div
                style={{
                    borderRadius: borderRadius,
                    border: `1px solid ${borderColor}`,
                    background: surfaceColor,
                    overflow: "hidden",
                    marginBottom: 16,
                }}
            >
                {entries.map((entry, idx) => (
                    <div
                        key={entry.id || entry.label + idx}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            borderBottom:
                                idx < entries.length - 1
                                    ? `1px solid ${borderColor}`
                                    : "none",
                            fontSize: 14,
                        }}
                    >
                        <span
                            style={{
                                color: textSecondaryColor,
                                marginRight: 12,
                            }}
                        >
                            {entry.label}
                        </span>
                        <span
                            style={{
                                color: textPrimaryColor,
                                fontWeight: 500,
                                textAlign: "right",
                                maxWidth: "60%",
                                wordBreak: "break-word",
                            }}
                        >
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                {icsUri ? (
                    <a
                        href={icsUri}
                        // T3-L7 fix: every download used the same static
                        // "booking.ics" filename, so importing several
                        // bookings made later downloads silently overwrite
                        // earlier ones in the Downloads folder. Date-stamp
                        // the filename instead.
                        download={`booking-${icsDateStamp}.ics`}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: TOUCH_TARGET_MIN,
                            padding: "10px 18px",
                            borderRadius: borderRadius,
                            border: `1px solid ${accentColor}`,
                            background: "transparent",
                            color: accentColor,
                            fontFamily: "inherit",
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        {addToCalendarLabel}
                    </a>
                ) : null}
                {/* T10-H5 fix: browser-side calendar deep links alongside
                    the .ics download — one click opens the visitor's Google
                    Calendar or Outlook compose with the booking pre-filled. */}
                {googleCalUri ? (
                    <a
                        href={googleCalUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: TOUCH_TARGET_MIN,
                            padding: "10px 18px",
                            borderRadius: borderRadius,
                            border: `1px solid ${accentColor}`,
                            background: "transparent",
                            color: accentColor,
                            fontFamily: "inherit",
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        {googleCalendarLabel}
                    </a>
                ) : null}
                {outlookCalUri ? (
                    <a
                        href={outlookCalUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: TOUCH_TARGET_MIN,
                            padding: "10px 18px",
                            borderRadius: borderRadius,
                            border: `1px solid ${accentColor}`,
                            background: "transparent",
                            color: accentColor,
                            fontFamily: "inherit",
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        {outlookCalendarLabel}
                    </a>
                ) : null}
                {bookingResult?.manageUrl ? (
                    <a
                        href={bookingResult.manageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: TOUCH_TARGET_MIN,
                            padding: "10px 18px",
                            borderRadius: borderRadius,
                            border: `1px solid ${borderColor}`,
                            background: "transparent",
                            color: textSecondaryColor,
                            fontFamily: "inherit",
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        Reschedule or cancel
                    </a>
                ) : null}
                <button
                    type="button"
                    onClick={onRestart}
                    style={{
                        minHeight: TOUCH_TARGET_MIN,
                        padding: "10px 18px",
                        borderRadius: borderRadius,
                        border: "none",
                        background: accentColor,
                        color: getReadableTextColor(accentColor),
                        fontFamily: "inherit",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    {restartLabel}
                </button>
                {/* T10-L6 fix: optional "return to home / done" link — only
                    rendered when the author configured a destination URL. */}
                {returnHomeUrl ? (
                    <a
                        href={returnHomeUrl}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: TOUCH_TARGET_MIN,
                            padding: "10px 18px",
                            borderRadius: borderRadius,
                            border: `1px solid ${borderColor}`,
                            background: "transparent",
                            color: textSecondaryColor,
                            fontFamily: "inherit",
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        {returnHomeLabel || "Done"}
                    </a>
                ) : null}
            </div>
        </div>
    )
})

// =============================================================================
// ErrorScreen — friendly, non-technical message + Try Again (preserves values)
// =============================================================================

// T3-L3 fix: turn the author-supplied support-contact string into a usable
// link — bare email → mailto:, phone-like → tel:, explicit URL → as-is,
// anything else stays a plain (non-linked) string.
function supportContactHref(
    value: string
): { href: string; external: boolean } {
    const trimmed = (value || "").trim()
    if (/^https?:\/\//i.test(trimmed)) return { href: trimmed, external: true }
    if (/[^@\s]+@[^@\s]+\.[^@\s]+/.test(trimmed))
        return { href: `mailto:${trimmed}`, external: false }
    if (/^[+]?[\d\s().-]{5,}$/.test(trimmed))
        return {
            href: `tel:${trimmed.replace(/[^\d+]/g, "")}`,
            external: false,
        }
    return { href: trimmed, external: false }
}

const ErrorScreen = React.memo(function ErrorScreen(props: {
    message: string
    errorColor: string
    textPrimaryColor: string
    textSecondaryColor: string
    surfaceColor: string
    borderColor: string
    borderRadius: string
    accentColor: string
    onRetry: () => void
    errorTitle: string
    errorSubtitle: string
    retryLabel: string
    // T3-L3 fix: optional support-contact path (empty value → hidden).
    supportContactLabel: string
    supportContactValue: string
}) {
    const {
        message,
        errorColor,
        textPrimaryColor,
        textSecondaryColor,
        surfaceColor,
        borderColor,
        borderRadius,
        accentColor,
        onRetry,
        errorTitle,
        errorSubtitle,
        retryLabel,
        supportContactLabel,
        supportContactValue,
    } = props

    // CC-6 fix: same reasoning as SuccessScreen — this replaces the whole
    // flow, so focus needs to move here and the region needs to announce
    // itself, or screen-reader users are simply stranded.
    const headingRef = React.useRef<HTMLHeadingElement | null>(null)
    React.useEffect(() => {
        headingRef.current?.focus()
    }, [])

    return (
        <div role="alert" aria-live="assertive">
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                <div
                    style={{
                        width: ERROR_ICON_SIZE,
                        height: ERROR_ICON_SIZE,
                        borderRadius: "50%",
                        background: withAlpha(errorColor, 0.15),
                        color: errorColor,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                >
                    !
                </div>
                <div>
                    <h2
                        ref={headingRef}
                        tabIndex={-1}
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: textPrimaryColor,
                            lineHeight: 1.2,
                            marginTop: 0,
                            marginBottom: 0,
                            outline: "none",
                        }}
                    >
                        {errorTitle}
                    </h2>
                    <div
                        style={{
                            fontSize: 13,
                            color: textSecondaryColor,
                            marginTop: 2,
                        }}
                    >
                        {errorSubtitle}
                    </div>
                </div>
            </div>
            <div
                style={{
                    padding: "14px 16px",
                    borderRadius: borderRadius,
                    background: withAlpha(errorColor, 0.08),
                    border: `1px solid ${withAlpha(errorColor, 0.3)}`,
                    color: textPrimaryColor,
                    fontSize: 14,
                    lineHeight: 1.5,
                    marginBottom: 16,
                }}
            >
                {message}
            </div>
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <button
                    type="button"
                    onClick={onRetry}
                    style={{
                        minHeight: TOUCH_TARGET_MIN,
                        padding: "10px 22px",
                        borderRadius: borderRadius,
                        border: "none",
                        background: accentColor,
                        color: getReadableTextColor(accentColor),
                        fontFamily: "inherit",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    {retryLabel}
                </button>
                {/* T3-L3 fix: an escalation path for persistent errors —
                    previously the screen offered Retry and literally nothing
                    else. Rendered only when the author configured contact
                    details. */}
                {supportContactValue ? (
                    <a
                        href={supportContactHref(supportContactValue).href}
                        {...(supportContactHref(supportContactValue).external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: TOUCH_TARGET_MIN,
                            padding: "10px 22px",
                            borderRadius: borderRadius,
                            border: `1px solid ${borderColor}`,
                            background: "transparent",
                            color: textSecondaryColor,
                            fontFamily: "inherit",
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        {supportContactLabel}
                    </a>
                ) : null}
            </div>
        </div>
    )
})

BookingEngine.displayName = "BookingEngine"

// =============================================================================
// Property Controls — full no-code editor surface
// =============================================================================
// FIXED SLOTS (step1…step10), not a single dynamic Array control. This is a
// deliberate revert back to the version that was actually stable, after two
// designs that both broke the panel:
//
// 1. A single `stepsConfig` Array-of-Object control, with per-item `fields`
//    defaults embedded in the outer array's own `defaultValue` — Framer does
//    not reliably seed a nested Array control's values from a parent array's
//    per-item defaultValue on first insert. Title/subtitle/stepType (simple
//    scalars) seeded fine; the nested `fields` array landed empty.
// 2. The same Array control, but with the nested `fields` Array given its own
//    `defaultValue` AND a `hidden` predicate (`hidden: p => p.stepType !==
//    "form"`) so it wouldn't show for non-form steps. That fixed the seeding,
//    but conditionally hiding a composite Array control re-evaluates on every
//    keystroke and made the whole panel flash open-then-instantly-closed —
//    and because that `fields` array's default was ALSO the exact same array
//    reference reused across every step slot (one shared `DEFAULT_FIELD_SET`
//    constant), editing one step's fields visibly mutated another step's.
//
// The fix is both structural rules below, applied together — either one
// alone was not enough:
//
// SAFETY RULE #1 — every step slot, and every per-slot default array, is its
// own independently-created object/array (see `makeDefault*Step()` above).
// Nothing is ever hoisted into one shared constant and reused by reference.
//
// SAFETY RULE #2 — no `hidden` predicate is ever attached to the per-step
// `fields` Array control. `hidden` is only used on plain scalar controls
// (String/Number/Boolean/Enum) and, for the step slots themselves further
// down, on an Object control hidden by a top-level sibling Number
// (`stepCount`) — that combination is the ordinary, well-supported case.
// `fields` stays visible for every step type — a minor panel-clutter
// tradeoff, and a fair one for a panel that actually stays open.
// (The per-field `options` Array below is a narrow, deliberate exception to
// this rule — see the comment on it for why.)
//
// Reverted back to a single Object control per step slot ("Step 1", "Step
// 2", …): the main properties panel shows exactly one row per step, and
// everything about that step — including its `Step Type` (Form/Calendar)
// toggle — lives inside that single submenu alongside Title, Subtitle, and
// Fields. There is no longer a separate top-level `stepNType` sibling
// control. `stepType` is a plain scalar inside the Object control's
// `controls`, so this doesn't touch Safety Rule #2 either.
//
// One more consequence of fixed slots: step reordering is no longer
// drag-and-drop in the panel (that required the dynamic Array control). Step
// order is now simply slot order (Step 1, Step 2, …), controlled by
// `stepCount`.

// T7-H3 fix: hidden() callbacks used p: any, so a typo like p?.fieldTpye
// compiled silently. Field-item controls read the field's own props; the
// step-slot and progress-bar controls read their owning objects - each is
// typed to exactly what it accesses.
type FieldControlProps = Partial<FieldConfig>
type StepSlotControlProps = Pick<BookingEngineProps, "stepCount">
type ProgressBarControlProps = Pick<BookingEngineProps["progressBar"], "showTextContent">

function makeFieldObjectControls() {
    return {
        label: {
            type: ControlType.String,
            title: "Label",
            defaultValue: "Field Label",
            // Requirement 3: Calendar Widget is an uneditable placeholder —
            // hide every config option except the Type selector itself.
            hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
        },
        fieldType: {
            type: ControlType.Enum,
            title: "Type",
            options: [
                "text",
                "email",
                "phone",
                "textarea",
                "select",
                "segmented",
                "pills",
                "cards",
                "checkbox",
                "radio",
                "calendar-widget",
            ],
            optionTitles: [
                "Text",
                "Email",
                "Phone",
                "Textarea",
                "Select",
                "Segmented",
                "Pills",
                "Cards",
                "Checkbox",
                "Radio",
                "Calendar Widget",
            ],
            defaultValue: "text",
        },
        placeholder: {
            type: ControlType.String,
            title: "Placeholder",
            defaultValue: "",
            hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
        },
        required: {
            type: ControlType.Boolean,
            title: "Required",
            defaultValue: false,
            hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
        },
// T4-M4 fix: the explicit "Validation" dropdown (and its Min Length /
// Regex Pattern sub-controls) used to exist, then was flattened away -
// validation became inferred from fieldType only, so authors could no
// longer force "email format" on a text field or attach a custom pattern.
// Restored below (all scalars, safe under Safety Rule #2); the default
// `type` keeps the previous inferred behavior for existing instances.
validationRule: {
                    type: ControlType.Enum,
                    title: "Validation",
                    options: [
                        "type",
                        "none",
                        "email",
                        "phone",
                        "min-length",
                        "custom-regex",
                    ],
                    optionTitles: [
                        "By field type",
                        "None",
                        "Email",
                        "Phone",
                        "Min length",
                        "Custom regex",
                    ],
                    defaultValue: "type",
                    hidden: (p: FieldControlProps) =>
                        p?.fieldType === "calendar-widget" ||
                        p?.fieldType === "checkbox" ||
                        p?.fieldType === "select" ||
                        p?.fieldType === "segmented" ||
                        p?.fieldType === "pills" ||
                        p?.fieldType === "cards" ||
                        p?.fieldType === "radio",
                },
                minLength: {
                    type: ControlType.Number,
                    title: "Minimum Length",
                    defaultValue: 3,
                    min: 1,
                    max: 100,
                    step: 1,
                    hidden: (p: FieldControlProps) =>
                        (p?.validationRule ?? "type") !== "min-length" &&
                        !TEXT_FIELD_TYPES.includes(p?.fieldType || ""),
                },
                customRegex: {
                    type: ControlType.String,
                    title: "Regex Pattern",
                    defaultValue: "",
                    placeholder: "e.g. ^[A-Z]{2}\\d{4}$",
                    hidden: (p: FieldControlProps) =>
                        (p?.validationRule ?? "type") !== "custom-regex",
                },
                // Requirement 4: only show Options for field types that actually use
        // choices. This IS an Array control conditionally hidden by a
        // sibling (`fieldType`) — a narrow, deliberate exception to Safety
        // Rule #2. Unlike `fields` (hidden by sibling `stepType`, which
        // caused the flaky-panel bug), this exact pattern shipped in the
        // original version of this component with no reported instability.
        // If Options-menu flakiness ever turns up, revert this `hidden` first.
        options: {
            type: ControlType.Array,
            title: "Options",
            maxCount: 12,
            // T7-M8/T8-M1/T8-M2 fix: explicit defaults - an Array control
            // without defaultValue starts as [], so switching a field to a
            // choice type immediately tripped the empty-options warning.
            defaultValue: ["Option 1"],
            control: {
                type: ControlType.String,
                defaultValue: "Option",
            },
            hidden: (p: FieldControlProps) =>
                !CHOICE_FIELD_TYPES.includes(
                    p?.fieldType || ""
                ),
        },
        // Scalar — safe to conditionally hide (Safety Rule #2).
        isPrimaryName: {
            type: ControlType.Boolean,
            title: "Primary Name",
            defaultValue: false,
            // T8-L1 fix: removed deprecated enabledTitle/disabledTitle.
            hidden: (p: FieldControlProps) => p?.fieldType !== "text",
        },
        // T10-M4 fix: optional per-field input cap. 0 means "use the
        // built-in default for this field type".
        maxLength: {
            type: ControlType.Number,
            title: "Max Length",
            defaultValue: 0,
            min: 0,
            max: 2000,
            step: 1,
            hidden: (p: FieldControlProps) =>
                p?.fieldType !== "text" &&
                p?.fieldType !== "email" &&
                p?.fieldType !== "phone" &&
                p?.fieldType !== "textarea",
        },
        // T10-L4 fix: parallel image/description arrays for choice options,
        // aligned by index with `options`. Same narrow exception to Safety
        // Rule #2 as `options` itself (Array hidden by sibling fieldType).
        optionImages: {
            type: ControlType.Array,
            title: "Option Images",
            maxCount: 12,
            defaultValue: [],
            control: {
                type: ControlType.String,
                defaultValue: "",
                placeholder: "https://… image URL",
            },
            hidden: (p: FieldControlProps) =>
                !CHOICE_FIELD_TYPES.includes(p?.fieldType || ""),
        },
        optionDescriptions: {
            type: ControlType.Array,
            title: "Option Descriptions",
            maxCount: 12,
            defaultValue: [],
            control: {
                type: ControlType.String,
                defaultValue: "",
            },
            hidden: (p: FieldControlProps) =>
                !CHOICE_FIELD_TYPES.includes(p?.fieldType || ""),
        },
        width: {
            type: ControlType.Enum,
            title: "Width",
            options: ["full", "half"],
            optionTitles: ["Full", "Half"],
            defaultValue: "full",
            displaySegmentedControl: true,
            hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
        },
        // T3-M8 fix: a scalar String control (safe under Safety Rule #2).
        // When filled in, this field's answer also goes to Cal.com's
        // bookingFieldsResponses — see buildBookingFieldsResponses.
        calFieldId: {
            type: ControlType.String,
            title: "Cal.com Field ID",
            defaultValue: "",
            placeholder: "e.g. customWish",
            hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
        },
    }
}

// The type selector shown directly in the main panel list, outside any
// submenu (Requirement 1). It's a plain top-level Enum control, hidden by
// the sibling `stepCount` Number — the ordinary, well-supported pattern.
// The stored value is unchanged ("form" / "datetime" / "review"); only the
// "datetime" option *label* reads "Calendar" now (Requirement 2), and
// "review" is back in the choices (T7-L3/T10-C2 fix - ReviewStepBody was
// dead code while the editor could not author one).
// T8-I2 fix: slotIndex was declared but never referenced - dropped.
function makeStepTypeControl(defaultType: StepType) {
    return {
        type: ControlType.Enum,
        title: "Step Type",
        options: ["form", "datetime", "review"],
        optionTitles: ["Form", "Calendar", "Review"],
        defaultValue: defaultType,
        displaySegmentedControl: true,
    }
}

// Reverted single submenu control per step (Requirement 1): everything
// about the step — including its `Step Type` (Form/Calendar) toggle — lives
// inside ONE Object control titled "Step 1", "Step 2", etc. The main
// properties panel therefore shows exactly one row per step, which opens
// into this full submenu. `defaults` must be a freshly constructed
// StepConfig (see `makeDefault*Step()`), never a shared reference (Safety
// Rule #1). Hidden by the `stepCount` sibling Number control.
function makeStepControl(slotIndex: number, defaults: StepConfig) {
    return {
        type: ControlType.Object,
        title: `Step ${slotIndex + 1}`,
        // T8-L4 fix: explicit top-level defaultValue - Framer composes the
        // effective default from nested controls' defaults, but the contract
        // is now stated instead of implicit.
        defaultValue: defaults,
        hidden: (p: StepSlotControlProps) => (p?.stepCount ?? 2) <= slotIndex,
        controls: {
            // Visible is the first control in the step submenu.
            enabled: {
                type: ControlType.Boolean,
                title: "Visible",
                defaultValue: defaults.enabled,
            },
            // Step Type sits directly below Visible.
            stepType: makeStepTypeControl(defaults.stepType),
            title: {
                type: ControlType.String,
                title: "Title",
                defaultValue: defaults.title,
            },
            // Requirement 2: multi-line input with a default/minimum height
            // of 100px. `displayTextArea` is the only mechanism Framer's
            // String control exposes for a multi-line editor — there is no
            // documented per-control `minHeight`/`rows` property, so this is
            // the closest the public property-controls API gets to that
            // spec; the panel's own textarea sizing isn't independently
            // overridable from here.
            subtitle: {
                type: ControlType.String,
                title: "Subtitle",
                defaultValue: defaults.subtitle || "",
                displayTextArea: true,
            },
            layout: {
                type: ControlType.Enum,
                title: "Layout",
                options: ["single-column", "two-column"],
                optionTitles: ["Single", "Two-Column"],
                defaultValue: defaults.layout,
                displaySegmentedControl: true,
            },
            // Array control — per Safety Rule #2, never conditionally hidden
            // (not even based on this step's own type). Always visible.
            // Requirement 3: for a Calendar step, this list also contains a
            // "Calendar Widget" marker entry (see makeDefaultCalendarStep)
            // that the author can drag above/below their custom fields —
            // StepBody renders the actual calendar/time picker at that exact
            // position. New items added via the Array control's "+" are
            // always appended at the end, so as long as the Calendar Widget
            // marker ships as the step's first/only default entry, anything
            // an author adds lands after it (i.e. below it) by default.
            fields: {
                type: ControlType.Array,
                title: "Fields",
                // T7-M9 fix: brief caps steps at 10 - the per-step fields list
                // allowed 12.
                maxCount: 10,
                // Own defaultValue, unique to this slot (Safety Rule #1) —
                // only Step 1's default carries Full Name/Email/Phone.
                defaultValue: defaults.fields,
                control: {
                    type: ControlType.Object,
                    controls: makeFieldObjectControls(),
                },
            },
        },
    }
}

addPropertyControls(BookingEngine, {
    stepCount: {
        type: ControlType.Number,
        title: "Steps",
        defaultValue: 2,
        min: 1,
        max: 10,
        step: 1,
        displayStepper: true,
    },
    step1: makeStepControl(0, makeDefaultFormStep()),
    step2: makeStepControl(1, makeDefaultCalendarStep()),
    step3: makeStepControl(2, makeDefaultBlankFormStep(3)),
    step4: makeStepControl(3, makeDefaultBlankFormStep(4)),
    step5: makeStepControl(4, makeDefaultBlankFormStep(5)),
    step6: makeStepControl(5, makeDefaultBlankFormStep(6)),
    step7: makeStepControl(6, makeDefaultBlankFormStep(7)),
    step8: makeStepControl(7, makeDefaultBlankFormStep(8)),
    step9: makeStepControl(8, makeDefaultBlankFormStep(9)),
    step10: makeStepControl(9, makeDefaultBlankFormStep(10)),

    // ----- Flow copy (Requirement 5: grouped, like Styles/Font/Copy) -----
    buttonLabels: {
        type: ControlType.Object,
        title: "Buttons",
        icon: "object",
        buttonTitle: "Buttons",
        controls: {
            continueLabel: {
                type: ControlType.String,
                title: "Continue",
                defaultValue: "Continue",
            },
            backLabel: {
                type: ControlType.String,
                title: "Back",
                defaultValue: "Back",
            },
            finalActionLabel: {
                type: ControlType.String,
                title: "Final Action",
                defaultValue: "Book Now",
            },
        },
    },

    // ----- Progress Bar (grouped, like Buttons/Styles) -----
    progressBar: {
        type: ControlType.Object,
        title: "Progress Bar",
        icon: "object",
        buttonTitle: "Progress Bar",
        controls: {
            visible: {
                type: ControlType.Boolean,
                title: "Visible",
                defaultValue: true,
            },
            // Requirement 1: independent of `visible` above (which hides the
            // whole progress row) — this only toggles the "Step X of Y" /
            // "N% complete" text, leaving the bar/dashes itself alone.
            showTextContent: {
                type: ControlType.Boolean,
                title: "Show Text Content",
                defaultValue: true,
            },
            stepCountPosition: {
                type: ControlType.Enum,
                title: "Step Count Text Position",
                options: ["top", "bottom"],
                optionTitles: ["Top", "Bottom"],
                defaultValue: "top",
                displaySegmentedControl: true,
                // Scalar hidden by a sibling scalar — ordinary, safe pattern.
                hidden: (p: ProgressBarControlProps) => p?.showTextContent === false,
            },
            // Requirement 1: Solid (single continuous line, the original
            // look) vs Dashed (segmented into `totalActive`-many equal-width
            // pieces with a visible gap — a modern segmented indicator).
            barStyle: {
                type: ControlType.Enum,
                title: "Bar Style",
                options: ["solid", "dashed"],
                optionTitles: ["Solid", "Dashed"],
                defaultValue: "solid",
                displaySegmentedControl: true,
            },
        },
    },
    // ----- Styles ("Theme" is the first item inside this submenu) -----
    styles: {
        type: ControlType.Object,
        title: "Styles",
        icon: "color",
        buttonTitle: "Styles",
        controls: {
            theme: {
                type: ControlType.Enum,
                title: "Theme",
                options: ["light", "dark", "auto"],
                optionTitles: ["Light", "Dark", "Auto"],
                defaultValue: "light",
                displaySegmentedControl: true,
            },
accentColor: {
                    type: ControlType.Color,
                    title: "Accent",
                    // T5-H11 fix: "#0099FF" fails contrast (~2.75:1 with the
                    // white text it always pairs with); "#0066BB" keeps the
                    // hue at ~5.7:1. Existing instances keep their values.
                    defaultValue: "#0066BB",
                },
            backgroundColor: {
                type: ControlType.Color,
                title: "Background",
                defaultValue: "#FFFFFF",
            },
            surfaceColor: {
                type: ControlType.Color,
                title: "Surface",
                defaultValue: "#F7F8FA",
            },
            textPrimaryColor: {
                type: ControlType.Color,
                title: "Text Primary",
                defaultValue: "#111827",
            },
            textSecondaryColor: {
                type: ControlType.Color,
                title: "Text Secondary",
                defaultValue: "#6B7280",
            },
            borderColor: {
                type: ControlType.Color,
                title: "Border",
                defaultValue: "#E5E7EB",
            },
errorColor: {
                    type: ControlType.Color,
                    title: "Error",
                    // T5-H10 fix: "#EF4444" is a 4.03:1 contrast against
                    // white - under the 4.5:1 target for the small error
                    // text it renders. "#DC2626" reaches 4.5:1+ while
                    // staying the same red family.
                    defaultValue: "#DC2626",
                },
        successColor: {
            type: ControlType.Color,
            title: "Success",
            // T5-M7 fix: "#22C55E" with the white checkmark was a ~2.3:1
            // contrast. "#15803D" (green-700) reaches 4.79:1 - the
            // checkmark itself also adapts via getReadableTextColor.
            defaultValue: "#15803D",
        },
            borderRadius: {
                type: ControlType.BorderRadius,
                title: "Radius",
                defaultValue: "12px",
            },
        },
    },
    font: {
        type: ControlType.Font,
        title: "Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "15px",
            variant: "Regular",
            letterSpacing: "0em",
            lineHeight: "1.4em",
            textAlign: "left",
        },
    },

    // ----- Animation -----
    transition: {
        type: ControlType.Transition,
        title: "Step Transition",
        defaultValue: { type: "tween", ease: "easeInOut", duration: 0.3 },
    },

    // ----- Copy (configurable terminal-state strings) -----
    copy: {
        type: ControlType.Object,
        title: "Copy",
        icon: "object",
        buttonTitle: "Copy",
        controls: {
            successTitle: {
                type: ControlType.String,
                title: "Success Title",
                defaultValue: "Booking confirmed",
            },
            successSubtitle: {
                type: ControlType.String,
                title: "Success Subtitle",
                // this component never sends email itself — that
                // was only ever true on the real Cal.com success path, and
                // even then only because Cal.com sends it, not this
                // component. The old default text made a promise this
                // component can't keep on pure-form flows or when Cal.com
                // isn't configured, silently converting a missing
                // integration into deception.
                defaultValue: "Your booking is confirmed.",
                displayTextArea: true,
            },
            addToCalendarLabel: {
                type: ControlType.String,
                title: "Add to Calendar",
                defaultValue: "Add to calendar",
            },
            restartLabel: {
                type: ControlType.String,
                title: "Restart",
                defaultValue: "Book another",
            },
            errorTitle: {
                type: ControlType.String,
                title: "Error Title",
                defaultValue: "Booking didn't go through",
            },
            errorSubtitle: {
                type: ControlType.String,
                title: "Error Subtitle",
                defaultValue: "Your details are saved — try again in a moment.",
                displayTextArea: true,
            },
            retryLabel: {
                type: ControlType.String,
                title: "Retry",
                defaultValue: "Try again",
            },
            loadingAvailabilityLabel: {
                type: ControlType.String,
                title: "Loading Availability",
                defaultValue: "Loading availability…",
            },
            noTimesLabel: {
                type: ControlType.String,
                title: "No Times",
                defaultValue:
                    "No available times on the selected date. Try another day.",
                displayTextArea: true,
            },
            emptyReviewLabel: {
                type: ControlType.String,
                title: "Empty Review",
                defaultValue:
                    "Nothing to review yet — go back and fill in the previous steps.",
                displayTextArea: true,
            },
            reviewIntroLabel: {
                type: ControlType.String,
                title: "Review Intro",
                defaultValue:
                    "Please review your details before confirming. Use the Back button to edit any previous step.",
                displayTextArea: true,
            },
            submittingLabel: {
                type: ControlType.String,
                title: "Submitting",
                defaultValue: "Submitting…",
            },
            supportContactLabel: {
                type: ControlType.String,
                title: "Support Contact Label",
                defaultValue: "Contact support",
            },
            supportContactValue: {
                type: ControlType.String,
                title: "Support Contact",
                defaultValue: "",
                placeholder: "email@clinic.com, +1 555 0100, or https://…",
            },
            timeZoneLabel: {
                type: ControlType.String,
                title: "Time Zone Label",
                defaultValue: "your time",
            },
            icsSummaryLabel: {
                type: ControlType.String,
                title: "Calendar Summary",
                defaultValue: "Appointment",
            },
            // T10-H4 fix: remaining strings surfaced in the Copy panel.
            // Empty values fall back to the component's built-in defaults.
            stepCounterTemplate: {
                type: ControlType.String,
                title: "Step Counter",
                defaultValue: "Step {current} of {total}",
            },
            timeZoneSelectLabel: {
                type: ControlType.String,
                title: "Time Zone Select",
                defaultValue: "Time zone",
            },
            detectedTimeZonePrefix: {
                type: ControlType.String,
                title: "Detected Time Zone Prefix",
                defaultValue: "Detected: ",
            },
            availabilityErrorLabel: {
                type: ControlType.String,
                title: "Availability Error",
                defaultValue: "Failed to load availability",
            },
            dateLabel: {
                type: ControlType.String,
                title: "Date",
                defaultValue: "Date",
            },
            timeLabel: {
                type: ControlType.String,
                title: "Time",
                defaultValue: "Time",
            },
            // T10-H5 fix: deep-link button labels on the success screen.
            googleCalendarLabel: {
                type: ControlType.String,
                title: "Google Calendar Button",
                defaultValue: "Add to Google Calendar",
            },
            outlookCalendarLabel: {
                type: ControlType.String,
                title: "Outlook Button",
                defaultValue: "Add to Outlook",
            },
            // T10-M2 fix: optional privacy note under the form. Empty hides it.
            privacyNotice: {
                type: ControlType.String,
                title: "Privacy Notice",
                defaultValue: "",
                placeholder: "e.g. We only use your details to confirm your booking.",
                displayTextArea: true,
            },
            // T10-L1 fix: explanation of the required-field asterisk.
            requiredFieldsHint: {
                type: ControlType.String,
                title: "Required Fields Hint",
                defaultValue: "Fields marked * are required",
            },
            // T10-L6 fix: label of the success-screen "Done" link.
            returnHomeLabel: {
                type: ControlType.String,
                title: "Return Home Label",
                defaultValue: "Done",
            },
            // T4-H3 fix: validation messages are editable here instead
                // of hard-coded inside the validator.
                validation: {
                    type: ControlType.Object,
                    title: "Validation Messages",
                    icon: "object",
                    buttonTitle: "Validation Messages",
                    controls: {
                        requiredFieldError: {
                            type: ControlType.String,
                            title: "Required Field",
                            defaultValue: "This field is required",
                        },
                        emailError: {
                            type: ControlType.String,
                            title: "Invalid Email",
                            defaultValue: "Enter a valid email address",
                        },
                        phoneError: {
                            type: ControlType.String,
                            title: "Invalid Phone",
                            defaultValue: "Enter a valid phone number",
                        },
                        minLengthError: {
                            type: ControlType.String,
                            title: "Too Short",
                            defaultValue: "Must be at least 3 characters",
                        },
                        pickDateTimeError: {
                            type: ControlType.String,
                            title: "No Time Picked",
                            defaultValue: "Please pick a date and time",
                        },
                        pastTimeError: {
                            type: ControlType.String,
                            title: "Past Time",
                            defaultValue: "Please pick a future time",
                        },
                        customRegexError: {
                            type: ControlType.String,
                            title: "Custom Regex Mismatch",
                            defaultValue:
                                "This value doesn't match the required format",
                        },
                        invalidRegexError: {
                            type: ControlType.String,
                            title: "Invalid Custom Regex",
                            defaultValue:
                                "This field's custom regex pattern is invalid",
                        },
                        minLength: {
                            type: ControlType.Number,
                            title: "Min Length",
                            defaultValue: 3,
                            min: 1,
                            max: 100,
                            step: 1,
                        },
                    },
                },
            },
        },

    // ----- Cal.com -----
    calApiKey: {
        type: ControlType.String,
        title: "Cal.com API Key",
        defaultValue: "",
        obscured: true,
    },
    calEventTypeId: {
        type: ControlType.String,
        title: "Cal.com Event ID",
        defaultValue: "",
    },
    defaultTimeFormat: {
        type: ControlType.Enum,
        title: "Initial Time Format",
        options: ["12h", "24h"],
        optionTitles: ["12-hour", "24-hour"],
        defaultValue: "12h",
        displaySegmentedControl: true,
    },
    // T10-L6 fix: destination of the success-screen "Done" link. Empty hides it.
    returnHomeUrl: {
        type: ControlType.String,
        title: "Return Home URL",
        defaultValue: "",
        placeholder: "https://your-site.com",
    },
})

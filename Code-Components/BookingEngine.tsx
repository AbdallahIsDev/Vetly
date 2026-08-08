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
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { motion, AnimatePresence } from "framer-motion"

// =============================================================================
// Shared color/time utilities (merged from the two inlined sources, deduped)
// =============================================================================

function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n))
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
        const v = parseFloat(value)
        if (Number.isNaN(v)) return null
        return clamp(v, 0, 255)
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

function isSameDay(a: Date | null, b: Date): boolean {
    if (!a) return false
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
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
}

interface ChoiceGroupInlineProps {
    label: string
    inputName: string
    defaultValue: string
    variant: "cards" | "segmented" | "pills"
    optionsText: string
    /** Direct options array — takes precedence over optionsText and avoids
     *  the comma-round-trip split bug (fix #22). */
    options?: ChoiceOption[]
    accentColor: string
    textColor: string
    mutedTextColor: string
    backgroundColor: string
    borderColor: string
    radius: number
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

function ChoiceGroupInline(props: ChoiceGroupInlineProps) {
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

    React.useEffect(() => {
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
    const compact = measuredWidth < 768
    const effectiveFontSize = Math.max(14, fontSize)
    const columns = React.useMemo(() => {
        if (measuredWidth >= 560) return 5
        if (measuredWidth >= 380) return 3
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
        extraStyle: React.CSSProperties = {}
    ) => {
        const isSelected = option.label === selected
        const isHovered = hoveredIndex === index
        const isFocused = focusedIndex === index
        return (
            <button
                key={`${option.label}-${index}`}
                ref={(node) => {
                    buttonRefs.current[index] = node
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
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
                    minHeight: 44,
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
                {option.glyph ? (
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
                <span
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        minWidth: 0,
                    }}
                >
                    {option.label}
                </span>
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
                    style={{
                        ...groupCommonStyle,
                        display: "flex",
                        border: `1px solid ${borderColor}`,
                        borderRadius: radius,
                        overflow: "hidden",
                        minWidth: 0,
                    }}
                >
                    {parsedOptions.map((option, index) =>
                        renderOptionButton(option, index, {
                            flex: 1,
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
                                measuredWidth < 420
                                    ? "1 1 calc(50% - 4px)"
                                    : "0 0 auto",
                            minWidth:
                                measuredWidth < 420
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
}

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
//     the Book button and reads `onSelectionReady` to set `values.__selectedSlot`.

interface BookingPayload {
    date: Date
    time24h: string
    timeLabel: string
    /** Optional Cal.com slot end (ISO string) — used for ICS DTEND. */
    end?: string
}

interface DateAndTimeInlineProps {
    accentColor: string
    backgroundColor: string
    textColor: string
    borderColor: string
    radius: number
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
    onSelectionReady?: (payload?: BookingPayload) => void
    onDateChange?: (date: Date) => void
    onMonthChange?: (monthStart: Date) => void
    /** Requirement 4: the engine now always passes `true` here so the time
     *  slot list/picker is visible by default, without requiring the user
     *  to pick a date first. Kept as a prop (rather than hardcoded inside
     *  this component) so the "pick a date to see times" fallback path
     *  below remains available if ever needed again. */
    showTimesWithoutDate?: boolean
}

function DateAndTimeInline(props: DateAndTimeInlineProps) {
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
        onSelectionReady,
        onDateChange,
        onMonthChange,
        showTimesWithoutDate = false,
    } = props

    const today = React.useMemo(() => startOfDay(new Date()), [])
    const currentMonthStart = React.useMemo(
        () => new Date(today.getFullYear(), today.getMonth(), 1),
        [today]
    )
    // Fix #19: seed visibleMonth from the parent so navigation survives remounts.
    const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => {
        if (initialVisibleMonth) return initialVisibleMonth
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(
        () => initialDate ?? null
    )
    const [selectedTime, setSelectedTime] = React.useState<string | null>(
        () => initialTime ?? null
    )
    const [activeTimeFormat, setActiveTimeFormat] = React.useState<
        "12h" | "24h"
    >(timeFormat)
    const [hoveredDateKey, setHoveredDateKey] = React.useState<string | null>(
        null
    )
    const [hoveredTime, setHoveredTime] = React.useState<string | null>(null)
    const [focusedKey, setFocusedKey] = React.useState<string | null>(null)
    const [isKeyboardModality, setIsKeyboardModality] = React.useState(false)
    const [measuredWidth, setMeasuredWidth] = React.useState<number>(560)
    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const lastReadyKeyRef = React.useRef<string>("")

    React.useEffect(() => {
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

    React.useEffect(() => {
        React.startTransition(() => setActiveTimeFormat(timeFormat))
    }, [timeFormat])

    // Re-sync from parent when initialDate/initialTime change (e.g. retry restore).
    React.useEffect(() => {
        if (initialDate !== undefined) {
            React.startTransition(() => setSelectedDate(initialDate))
        }
    }, [initialDate])
    React.useEffect(() => {
        if (initialTime !== undefined) {
            React.startTransition(() => setSelectedTime(initialTime))
        }
    }, [initialTime])

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

    const isNarrow = measuredWidth < 768
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

    const monthName = React.useMemo(
        () => visibleMonth.toLocaleDateString(undefined, { month: "long" }),
        [visibleMonth]
    )
    const yearLabel = React.useMemo(
        () => String(visibleMonth.getFullYear()),
        [visibleMonth]
    )

    const weekdayLabels = React.useMemo(
        () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        []
    )
    const calendarCells = React.useMemo(() => {
        const firstOfMonth = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            1
        )
        const start = new Date(firstOfMonth)
        start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay())
        const cells: Date[] = []
        for (let i = 0; i < 42; i++) {
            const next = new Date(start)
            next.setDate(start.getDate() + i)
            cells.push(next)
        }
        return cells
    }, [visibleMonth])

    // Section 9.2: when `availableTimes` is provided, use it directly (real
    // Cal.com availability). Otherwise, fall back to the original
    // startTime/endTime/interval grid generation.
    // Fix #10: re-format Cal.com slot labels using the active 12h/24h toggle
    // (previously hardcoded to 12h).
    const timeOptions = React.useMemo(() => {
        if (availableTimes && availableTimes.length > 0) {
            return availableTimes.map((t) => ({
                value: t.value,
                end: t.end,
                label: formatTimeLabel(t.minutes, activeTimeFormat),
                minutes: t.minutes,
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

    const firstAvailableDate = React.useMemo(() => {
        for (const date of calendarCells) {
            const isInMonth = date.getMonth() === visibleMonth.getMonth()
            const isPast = startOfDay(date).getTime() < today.getTime()
            if (isInMonth && !isPast) return date
        }
        return null
    }, [calendarCells, visibleMonth, today])
    const selectedOrFirstDateKey = React.useMemo(() => {
        if (selectedDate)
            return `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
        if (firstAvailableDate) {
            return `${firstAvailableDate.getFullYear()}-${firstAvailableDate.getMonth()}-${firstAvailableDate.getDate()}`
        }
        return null
    }, [selectedDate, firstAvailableDate])

    const getPayload = React.useCallback(
        (date: Date, time: string): BookingPayload => {
            // If the time value is an ISO string (real Cal.com slot), parse it
            // to derive a label. Otherwise it's a "HH:MM" 24h string from the
            // fallback grid.
            const isIso = /^\d{4}-\d{2}-\d{2}T/.test(time)
            if (isIso) {
                const d = new Date(time)
                const minutes = d.getHours() * 60 + d.getMinutes()
                // Capture the slot end (if available) for ICS DTEND (fix #11).
                const matched = availableTimes?.find((t) => t.value === time)
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

    const goToPreviousMonth = React.useCallback(() => {
        const canGoPrev = visibleMonth.getTime() > currentMonthStart.getTime()
        if (!canGoPrev) return
        const next = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() - 1,
            1
        )
        React.startTransition(() => setVisibleMonth(next))
        onMonthChange?.(next)
    }, [visibleMonth, currentMonthStart, onMonthChange])

    const goToNextMonth = React.useCallback(() => {
        const next = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() + 1,
            1
        )
        React.startTransition(() => setVisibleMonth(next))
        onMonthChange?.(next)
    }, [visibleMonth, onMonthChange])

    // Fire onMonthChange on initial mount so the engine can fetch slots for the
    // initially-visible month (the engine uses visibleMonth to key the fetch).
    React.useEffect(() => {
        onMonthChange?.(visibleMonth)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDateSelect = React.useCallback(
        (date: Date) => {
            if (startOfDay(date).getTime() < today.getTime()) return
            React.startTransition(() => setSelectedDate(date))
            if (onDateChange) onDateChange(date)
        },
        [onDateChange, today]
    )

    const handleTimeSelect = React.useCallback((time: string) => {
        React.startTransition(() => setSelectedTime(time))
    }, [])

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
        const key = `${selectedDate.getTime()}-${selectedTime}`
        if (key === lastReadyKeyRef.current) return
        lastReadyKeyRef.current = key
        onSelectionReady?.(getPayload(selectedDate, selectedTime))
    }, [selectedDate, selectedTime, onSelectionReady, getPayload])

    const canGoPrev = visibleMonth.getTime() > currentMonthStart.getTime()

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
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            gap: 8,
                        }}
                    >
                        <div
                            style={{ display: "flex", alignItems: "baseline" }}
                        >
                            <span style={{ fontWeight: 700, fontSize: 16 }}>
                                {monthName}
                            </span>
                            <span
                                style={{
                                    marginLeft: 6,
                                    color: mutedText,
                                    fontSize: 16,
                                }}
                            >
                                {yearLabel}
                            </span>
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
                                aria-label="Previous month"
                                onClick={goToPreviousMonth}
                                disabled={!canGoPrev}
                                tabIndex={0}
                                style={{
                                    appearance: "none",
                                    background: "transparent",
                                    color: canGoPrev
                                        ? textColor
                                        : mutedSoftText,
                                    border: "none",
                                    borderRadius: 6,
                                    width: isNarrow ? 44 : 28,
                                    height: isNarrow ? 44 : 28,
                                    padding: 0,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: canGoPrev
                                        ? "pointer"
                                        : "not-allowed",
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
                                aria-label="Next month"
                                onClick={goToNextMonth}
                                tabIndex={0}
                                style={{
                                    appearance: "none",
                                    background: "transparent",
                                    color: textColor,
                                    border: "none",
                                    borderRadius: 6,
                                    width: isNarrow ? 44 : 28,
                                    height: isNarrow ? 44 : 28,
                                    padding: 0,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
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
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
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
                        aria-label="Calendar"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                            gap: isNarrow ? 4 : 6,
                        }}
                    >
                        {calendarCells.map((date, index) => {
                            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
                            const isInMonth =
                                date.getMonth() === visibleMonth.getMonth()
                            const isPast =
                                startOfDay(date).getTime() < today.getTime()
                            const isUnavailable = !isInMonth || isPast
                            const isSelected = isSameDay(selectedDate, date)
                            const isToday = isSameDay(today, date)
                            // Requirement 4: today only keeps its special
                            // highlight while nothing else has been picked
                            // yet. As soon as any date is selected, today
                            // reverts to the standard available-date look
                            // (unless today itself is the selected date, in
                            // which case `isSelected` already covers it).
                            const isTodayHighlighted = isToday && !selectedDate
                            const isRingHover =
                                hoveredDateKey === dateKey &&
                                !isUnavailable &&
                                !isSelected &&
                                !isTodayHighlighted
                            const isFocus = focusedKey === `date-${dateKey}`
                            return (
                                <button
                                    key={`${date.toISOString()}-${index}`}
                                    type="button"
                                    role="gridcell"
                                    disabled={isUnavailable}
                                    aria-disabled={isUnavailable}
                                    aria-pressed={isSelected}
                                    aria-label={date.toLocaleDateString(
                                        undefined,
                                        {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                    tabIndex={
                                        isUnavailable
                                            ? -1
                                            : dateKey === selectedOrFirstDateKey
                                              ? 0
                                              : -1
                                    }
                                    onMouseEnter={() => {
                                        if (!isUnavailable)
                                            React.startTransition(() =>
                                                setHoveredDateKey(dateKey)
                                            )
                                    }}
                                    onMouseLeave={() => {
                                        if (!isUnavailable)
                                            React.startTransition(() =>
                                                setHoveredDateKey(null)
                                            )
                                    }}
                                    onFocus={() =>
                                        React.startTransition(() =>
                                            setFocusedKey(`date-${dateKey}`)
                                        )
                                    }
                                    onBlur={() =>
                                        React.startTransition(() =>
                                            setFocusedKey(null)
                                        )
                                    }
                                    onClick={() => handleDateSelect(date)}
                                    onKeyDown={(e) => {
                                        // Fix #8: keyboard arrow-key navigation
                                        // across the calendar grid. Arrow keys
                                        // move by 1 day / 1 week; Home/End
                                        // jump to start/end of the week;
                                        // PageUp/Down switch months.
                                        let delta = 0
                                        if (e.key === "ArrowRight") delta = 1
                                        else if (e.key === "ArrowLeft")
                                            delta = -1
                                        else if (e.key === "ArrowDown")
                                            delta = 7
                                        else if (e.key === "ArrowUp") delta = -7
                                        else if (e.key === "Home") {
                                            e.preventDefault()
                                            const target = new Date(date)
                                            target.setDate(
                                                date.getDate() - date.getDay()
                                            )
                                            if (
                                                startOfDay(target).getTime() >=
                                                today.getTime()
                                            ) {
                                                handleDateSelect(target)
                                                const tk = `${target.getFullYear()}-${target.getMonth()}-${target.getDate()}`
                                                requestAnimationFrame(() => {
                                                    const el =
                                                        rootRef.current?.querySelector<HTMLElement>(
                                                            `[aria-label="${target.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}"]`
                                                        )
                                                    el?.focus()
                                                    void tk
                                                })
                                            }
                                            return
                                        } else if (e.key === "End") {
                                            e.preventDefault()
                                            const target = new Date(date)
                                            target.setDate(
                                                date.getDate() +
                                                    (6 - date.getDay())
                                            )
                                            handleDateSelect(target)
                                            requestAnimationFrame(() => {
                                                const el =
                                                    rootRef.current?.querySelector<HTMLElement>(
                                                        `[aria-label="${target.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}"]`
                                                    )
                                                el?.focus()
                                            })
                                            return
                                        } else if (e.key === "PageDown") {
                                            e.preventDefault()
                                            goToNextMonth()
                                            return
                                        } else if (e.key === "PageUp") {
                                            e.preventDefault()
                                            goToPreviousMonth()
                                            return
                                        } else {
                                            return
                                        }
                                        e.preventDefault()
                                        const target = new Date(date)
                                        target.setDate(date.getDate() + delta)
                                        if (
                                            startOfDay(target).getTime() <
                                            today.getTime()
                                        )
                                            return
                                        handleDateSelect(target)
                                        requestAnimationFrame(() => {
                                            const el =
                                                rootRef.current?.querySelector<HTMLElement>(
                                                    `[aria-label="${target.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}"]`
                                                )
                                            el?.focus()
                                        })
                                    }}
                                    style={{
                                        minHeight: 44,
                                        borderRadius: 6,
                                        border: `1px solid ${isUnavailable ? "transparent" : borderColor}`,
                                        // Requirement 4: today gets a solid
                                        // accent fill (like a selected date)
                                        // until another date is chosen, at
                                        // which point it reverts to the
                                        // standard available-date fill and
                                        // the newly selected date gets the
                                        // solid accent fill instead.
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
                                        cursor: isUnavailable
                                            ? "default"
                                            : "pointer",
                                        fontSize: 14,
                                        transition:
                                            "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, color 0.16s ease",
                                        boxShadow:
                                            isKeyboardModality && isFocus
                                                ? focusInset
                                                : isSelected ||
                                                    isTodayHighlighted
                                                  ? `inset 0 0 0 1px ${accentColor}`
                                                  : isRingHover
                                                    ? `inset 0 0 0 1px ${accentColor}`
                                                    : "none",
                                        fontWeight:
                                            isTodayHighlighted && !isSelected
                                                ? 700
                                                : 400,
                                    }}
                                >
                                    {date.getDate()}
                                </button>
                            )
                        })}
                    </div>
                </section>

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
                            minHeight: 44,
                            boxSizing: "border-box",
                            gap: 2,
                        }}
                    >
                        <motion.div
                            animate={{
                                left: activeTimeFormat === "12h" ? 3 : "50%",
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 32,
                                mass: 0.6,
                            }}
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
                                        tabIndex={0}
                                        onClick={() =>
                                            React.startTransition(() =>
                                                setActiveTimeFormat(format)
                                            )
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
                                            minHeight: 38,
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
                        style={{
                            overflowY: "auto",
                            maxHeight: 220,
                            minWidth: 0,
                        }}
                    >
                        {/* Fix #18: when no date is picked (and the engine asked
                            us to hide times until a date is chosen), show a
                            hint instead of dumping all month slots. */}
                        {!selectedDate && !showTimesWithoutDate ? (
                            <div
                                style={{
                                    padding: "16px 8px",
                                    textAlign: "center",
                                    color: mutedText,
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                }}
                            >
                                Pick a date to see times
                            </div>
                        ) : timeOptions.length === 0 ? (
                            <div
                                style={{
                                    padding: "16px 8px",
                                    textAlign: "center",
                                    color: mutedText,
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                }}
                            >
                                No available times
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr",
                                    gap: isNarrow ? 6 : 8,
                                    minWidth: 0,
                                }}
                            >
                                {timeOptions.map((time) => {
                                    const selected = selectedTime === time.value
                                    const isHover =
                                        hoveredTime === time.value && !selected
                                    const isFocus =
                                        focusedKey === `time-${time.value}`
                                    return (
                                        <button
                                            key={time.value}
                                            type="button"
                                            tabIndex={0}
                                            onMouseEnter={() =>
                                                React.startTransition(() =>
                                                    setHoveredTime(time.value)
                                                )
                                            }
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
                                            onClick={() =>
                                                handleTimeSelect(time.value)
                                            }
                                            aria-pressed={selected}
                                            style={{
                                                minHeight: 44,
                                                border: `1px solid ${isHover ? accentColor : borderColor}`,
                                                borderRadius: 6,
                                                padding: isNarrow
                                                    ? "10px 10px"
                                                    : "10px 12px",
                                                background: selected
                                                    ? accentColor
                                                    : "transparent",
                                                color: selected
                                                    ? selectedAccentText
                                                    : textColor,
                                                fontSize: 14,
                                                cursor: "pointer",
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
            </div>
        </div>
    )
}

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
type FlowStatus = "in-progress" | "submitting" | "success" | "error"
type ColorMode = "light" | "dark" | "auto"

interface FieldConfig {
    id?: string
    label: string
    fieldType: FieldType
    placeholder?: string
    required: boolean
    options?: Array<string>
    width: "full" | "half"
    isPrimaryName?: boolean
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
// top-level sibling control. `StepSlotDetails` is simply the full
// `StepConfig` for a slot.
type StepSlotDetails = StepConfig

interface BookingEngineProps {
    style?: React.CSSProperties
    width?: number
    height?: number
    // Flow content — FIXED SLOTS, not a single dynamic Array control.
    //
    // SAFETY RULE #1 (no shared array references): every step slot's `fields`
    // default must be its own separately-declared array literal. Two slots
    // must never point at the same array object in memory — Framer's panel
    // uses reference identity to detect what changed, and an aliased default
    // makes edits to one step silently show up on (and corrupt) another.
    //
    // SAFETY RULE #2 (no hidden-on-Array): a `hidden` predicate must never
    // be attached to an Array control (e.g. the per-step `fields` list).
    // Only scalar controls (String/Number/Boolean/Enum) — and, as used below
    // for the step slots themselves, plain Object controls hidden by a
    // top-level sibling Number — are safe to conditionally hide. It's
    // specifically an Array control re-evaluating `hidden` on every
    // keystroke of its own contents that caused the flaky open/instant-close
    // panel bug: the panel couldn't hold a stable open state for a control
    // that might vanish out from under the very edit being made inside it.
    //
    // Scoped exception: the per-field `options` Array (inside each step's
    // `fields` list) DOES use `hidden`, keyed off that same field's own
    // `fieldType`. This exact pattern shipped in the original version of
    // this component with no reported instability — unlike `fields` before,
    // it was never implicated in the flaky-panel bug — so it's kept as a
    // narrow, deliberate exception rather than folded into the blanket rule.
    // If Options-menu flakiness ever surfaces, this is the first place to
    // revert.
    //
    // See the addPropertyControls block near the bottom of this file for
    // where these two rules (and the one exception) are actually applied.
    stepCount: number
    step1: StepSlotDetails
    step2: StepSlotDetails
    step3: StepSlotDetails
    step4: StepSlotDetails
    step5: StepSlotDetails
    step6: StepSlotDetails
    step7: StepSlotDetails
    step8: StepSlotDetails
    step9: StepSlotDetails
    step10: StepSlotDetails
    // Navigation & action button copy, grouped into one control (see
    // Requirement 5) the same way `styles`/`font`/`copy` are grouped below.
    buttonLabels: {
        continueLabel: string
        backLabel: string
        finalActionLabel: string
    }
    // Progress
    showProgressBar: boolean
    // Theme
    colorMode: ColorMode
    styles: {
        accentColor: string
        backgroundColor: string
        surfaceColor: string
        textPrimaryColor: string
        textSecondaryColor: string
        borderColor: string
        errorColor: string
        successColor: string
        borderRadius: number
    }
    font: any
    // Animation
    transition: any
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
    }
    // Cal.com
    calApiKey: string
    calEventTypeId: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/

const DEFAULT_DARK_THEME = {
    accentColor: "#0099FF",
    backgroundColor: "#0F1115",
    surfaceColor: "#1A1D23",
    textPrimaryColor: "#FFFFFF",
    textSecondaryColor: "#9CA3AF",
    borderColor: "#2A2D34",
    errorColor: "#F87171",
    successColor: "#34D399",
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
        fields: [],
    }
}

function makeDefaultBlankFormStep(n: number): StepConfig {
    return {
        enabled: true,
        stepType: "form",
        title: `Step ${n}`,
        subtitle: "",
        layout: "single-column",
        // Intentionally empty — the Full Name / Email / Phone starter fields
        // belong to Step 1 only (see Safety Rule #1: this is its own fresh
        // `[]`, never a reference shared with step1's fields array).
        fields: [],
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
    return (steps || []).map((step, stepIdx) => ({
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

function validateField(field: NormalizedField, value: any): string | null {
    // Fix #9: required checkbox treats value===false as empty.
    if (field.fieldType === "checkbox" && field.required && value !== true) {
        return "This field is required"
    }
    const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        value === false ||
        (Array.isArray(value) && value.length === 0)
    if (field.required && isEmpty) {
        return "This field is required"
    }
    if (isEmpty) return null
    const str = String(value)
    if (field.fieldType === "email" && !EMAIL_REGEX.test(str)) {
        return "Enter a valid email address"
    }
    if (field.fieldType === "phone" && !PHONE_REGEX.test(str)) {
        return "Enter a valid phone number"
    }
    if (
        (field.fieldType === "text" || field.fieldType === "textarea") &&
        str.length < MIN_TEXT_LENGTH
    ) {
        return `Must be at least ${MIN_TEXT_LENGTH} characters`
    }
    return null
}

function validateStep(
    step: NormalizedStep,
    values: Record<string, any>
): { valid: boolean; errors: Record<string, string | null> } {
    // Fix #5: datetime step now returns a real error message when no slot is
    // picked, so the user sees "Please pick a date and time" instead of a
    // silent block.
    if (step.stepType === "datetime") {
        const invalid = !values.__selectedSlot
        return {
            valid: !invalid,
            errors: invalid
                ? { __selectedSlot: "Please pick a date and time" }
                : {},
        }
    }
    if (step.stepType === "review") {
        return { valid: true, errors: {} }
    }
    const errors: Record<string, string | null> = {}
    for (const f of step.fields) {
        errors[f.id] = validateField(f, values[f.id])
    }
    const valid = Object.values(errors).every((e) => e === null)
    return { valid, errors }
}

function touchAllFieldsIn(
    step: NormalizedStep,
    prev: Record<string, boolean>
): Record<string, boolean> {
    const next = { ...prev }
    if (step.stepType === "form") {
        for (const f of step.fields) next[f.id] = true
    }
    if (step.stepType === "datetime") next.__selectedSlot = true
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

interface UseCalcomSlotsResult {
    slots: Array<{
        value: string
        label: string
        end?: string
        minutes: number
    }>
    loading: boolean
    error: string | null
}

function useCalcomSlots(
    apiKey: string,
    eventTypeId: string,
    monthStart: Date | null,
    timeZone: string
): UseCalcomSlotsResult {
    const [slots, setSlots] = React.useState<
        Array<{ value: string; label: string; end?: string; minutes: number }>
    >([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!apiKey || !eventTypeId || !monthStart) return
        if (typeof window === "undefined") return
        if (RenderTarget.current() === RenderTarget.canvas) return

        let cancelled = false
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

        fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "cal-api-version": "2024-09-04",
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
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
                    ).flat() as CalSlot[]
                } else if (Array.isArray(json?.slots)) {
                    rawSlots = json.slots
                } else if (Array.isArray(json)) {
                    rawSlots = json
                }
                const mapped = rawSlots
                    .filter((s) => s && s.start)
                    .map((s) => {
                        const d = new Date(s.start)
                        const minutes = d.getHours() * 60 + d.getMinutes()
                        return {
                            value: s.start,
                            // Store raw minutes; the DateAndTimeInline
                            // component formats the label using the active
                            // 12h/24h toggle (fixes #10).
                            label: formatTimeLabel(minutes, "12h"),
                            end: s.end,
                            minutes,
                        }
                    })
                    .sort((a, b) => (a.value < b.value ? -1 : 1))
                if (cancelled) return
                setSlots(mapped)
                setLoading(false)
            })
            .catch((err) => {
                if (cancelled) return
                setError(err?.message || "Failed to load availability")
                setSlots([])
                setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [apiKey, eventTypeId, monthStart, timeZone])

    return { slots, loading, error }
}

interface SubmitBookingResult {
    success: boolean
    error: string | null
    bookingUid?: string
    booking?: any
}

async function submitCalcomBooking(params: {
    apiKey: string
    eventTypeId: string
    slotStart: string
    name: string
    email: string
    timeZone: string
    notes: string
}): Promise<SubmitBookingResult> {
    const { apiKey, eventTypeId, slotStart, name, email, timeZone, notes } =
        params
    try {
        const res = await fetch("https://api.cal.com/v2/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "cal-api-version": "2024-09-04",
            },
            body: JSON.stringify({
                eventTypeId: Number(eventTypeId),
                start: slotStart,
                attendee: {
                    name,
                    email,
                    timeZone,
                    language: "en",
                },
                metadata: {},
                notes,
            }),
        })
        const json = await res.json()
        if (!res.ok) {
            const msg =
                json?.error?.message ||
                json?.message ||
                json?.error ||
                `Booking failed (HTTP ${res.status})`
            return { success: false, error: String(msg), booking: json }
        }
        const uid = json?.data?.uid || json?.data?.id || json?.uid || json?.id
        return { success: true, error: null, bookingUid: uid, booking: json }
    } catch (err: any) {
        return {
            success: false,
            error: "We couldn't reach the booking service. Please check your connection and try again.",
        }
    }
}

function mapCalcomError(message: string): string {
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

// =============================================================================
// Engine helpers
// =============================================================================

function findNameField(steps: NormalizedStep[]): NormalizedField | null {
    for (const s of steps) {
        if (s.stepType !== "form") continue
        for (const f of s.fields) {
            if (f.isPrimaryName) return f
        }
    }
    // Fallback heuristic: field id/label contains "name"
    for (const s of steps) {
        if (s.stepType !== "form") continue
        for (const f of s.fields) {
            if (/name/i.test(f.label) || /name/i.test(f.id)) return f
        }
    }
    return null
}

function findEmailField(steps: NormalizedStep[]): NormalizedField | null {
    for (const s of steps) {
        if (s.stepType !== "form") continue
        for (const f of s.fields) {
            if (f.fieldType === "email") return f
        }
    }
    return null
}

function buildNotesPayload(
    steps: NormalizedStep[],
    values: Record<string, any>
): string {
    const lines: string[] = []
    for (const s of steps) {
        if (s.stepType !== "form") continue
        if (!s.fields.length) continue
        lines.push(`## ${s.title}`)
        for (const f of s.fields) {
            const v = values[f.id]
            if (v === undefined || v === null || v === "") continue
            lines.push(`- **${f.label}**: ${String(v)}`)
        }
        lines.push("")
    }
    if (values.__selectedSlot) {
        const slot = values.__selectedSlot as BookingPayload
        const dateStr = slot.date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        lines.push(`## Selected Time`)
        lines.push(`- **Date**: ${dateStr}`)
        lines.push(`- **Time**: ${slot.timeLabel}`)
    }
    return lines.join("\n").trim()
}

function buildIcsDataUri(slot: BookingPayload): string {
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
            : new Date(startDate.getTime() + 30 * 60 * 1000)
    } else {
        // Demo grid: combine the picked date with the HH:MM time string.
        const mins = parseTimeToMinutes(slot.time24h)
        startDate = new Date(slot.date)
        startDate.setHours(Math.floor(mins / 60), mins % 60, 0, 0)
        endDate = new Date(startDate.getTime() + 30 * 60 * 1000)
    }
    const start = toIcsDate(startDate)
    const end = toIcsDate(endDate)
    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BookingEngine//Framer//EN",
        "BEGIN:VEVENT",
        `UID:${startDate.getTime()}@booking-engine`,
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        "SUMMARY:Booking",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n")
    if (typeof window === "undefined") return ""
    try {
        const base64 = btoa(unescape(encodeURIComponent(ics)))
        return `data:text/calendar;charset=utf-8;base64,${base64}`
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
 */
export default function BookingEngine(props: BookingEngineProps) {
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
        showProgressBar,
        colorMode,
        styles,
        font,
        transition,
        copy,
        calApiKey,
        calEventTypeId,
    } = props

    // Destructure style tokens from the grouped Styles object.
    const {
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

    // Destructure copy from the grouped Buttons object (Requirement 5).
    const { continueLabel, backLabel, finalActionLabel } = buttonLabels

    // Persist state is always on (not exposed to the editor). Auto-generate a
    // stable instance ID per component instance via React's useId() so multiple
    // BookingEngine components on the same page don't collide in sessionStorage.
    const persistState = true
    const reactInstanceId = React.useId()

    // Resolve the Framer transition for step-to-step animation. Falls back to a
    // smooth default if the editor hasn't customized it.
    const stepTransition =
        transition ||
        ({ type: "tween", ease: "easeInOut", duration: 0.3 } as const)

    // Resolve colorMode → effective palette. "auto" uses the dark palette only
    // when the visitor's OS reports prefers-color-scheme: dark. Default is light.
    const [systemDark, setSystemDark] = React.useState(false)
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
        const slots: Array<StepSlotDetails | undefined> = [
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
        () => normalizedSteps.filter((s) => s.enabled),
        [normalizedSteps]
    )
    const totalActive = activeSteps.length

    const [currentIndex, setCurrentIndex] = useStateGuarded(0, totalActive)
    const currentStep = activeSteps[currentIndex]
    const isFirst = currentIndex === 0
    const isLast = currentIndex === totalActive - 1

    // Form state.
    const [values, setValues] = React.useState<Record<string, any>>({})
    const [errors, setErrors] = React.useState<Record<string, string | null>>(
        {}
    )
    const [touched, setTouched] = React.useState<Record<string, boolean>>({})
    const [flowStatus, setFlowStatus] =
        React.useState<FlowStatus>("in-progress")
    const [submitError, setSubmitError] = React.useState<string | null>(null)
    const [bookingResult, setBookingResult] = React.useState<any>(null)

    // Date/time tracking for the datetime step.
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
    const [visibleMonth, setVisibleMonth] = React.useState<Date | null>(null)
    const [timeZone, setTimeZone] = React.useState<string>(() =>
        detectTimezone()
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
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === "object") {
                const restoredValues = parsed.values || {}
                // Fix #3: re-hydrate __selectedSlot.date from ISO string to
                // a real Date object so downstream Date methods don't throw.
                if (
                    restoredValues.__selectedSlot &&
                    restoredValues.__selectedSlot.date &&
                    !(restoredValues.__selectedSlot.date instanceof Date)
                ) {
                    try {
                        restoredValues.__selectedSlot.date = new Date(
                            restoredValues.__selectedSlot.date
                        )
                    } catch {
                        restoredValues.__selectedSlot = undefined
                    }
                }
                setValues(restoredValues)
                if (restoredValues.__selectedSlot) {
                    const slot = restoredValues.__selectedSlot
                    if (slot.date) {
                        setSelectedDate(new Date(slot.date))
                    }
                }
            }
        } catch {
            /* ignore */
        }
    }, [persistState, sessionKey])

    // Persist on every change while in-progress.
    React.useEffect(() => {
        if (!persistState) return
        if (typeof window === "undefined") return
        if (flowStatus === "success") {
            try {
                window.sessionStorage.removeItem(sessionKey)
            } catch {
                /* ignore */
            }
            return
        }
        try {
            window.sessionStorage.setItem(
                sessionKey,
                JSON.stringify({
                    values,
                    __selectedSlot: values.__selectedSlot,
                })
            )
        } catch {
            /* ignore */
        }
    }, [persistState, sessionKey, values, flowStatus])

    // Reset currentIndex if it ever exceeds the active pipeline length
    // (e.g. when author disables steps while a user is mid-flow).
    React.useEffect(() => {
        if (currentIndex >= totalActive && totalActive > 0) {
            React.startTransition(() =>
                setCurrentIndex(Math.max(0, totalActive - 1))
            )
        } else if (totalActive === 0) {
            React.startTransition(() => setCurrentIndex(0))
        }
    }, [currentIndex, totalActive])

    // Cal.com slots — fetched when a datetime step is active and config is present.
    const datetimeStepActive =
        currentStep && currentStep.stepType === "datetime"
    const hasCalConfig = Boolean(calApiKey && calEventTypeId)
    const {
        slots,
        loading: slotsLoading,
        error: slotsError,
    } = useCalcomSlots(
        hasCalConfig ? calApiKey : "",
        hasCalConfig ? calEventTypeId : "",
        datetimeStepActive ? visibleMonth : null,
        timeZone
    )

    // Filter slots to the selected date (if a date is picked).
    const slotsForSelectedDate = React.useMemo(() => {
        if (!selectedDate) return slots
        return slots.filter((s) => {
            try {
                const d = new Date(s.value)
                return isSameDay(selectedDate, d)
            } catch {
                return false
            }
        })
    }, [slots, selectedDate])

    // Derived: can the user proceed on the current step?
    const canProceed = React.useMemo(() => {
        if (!currentStep) return false
        return validateStep(currentStep, values).valid
    }, [currentStep, values])

    // Guardrail warning (canvas-only): datetime step without name+email somewhere.
    const needsNameEmailGuardrail = React.useMemo(() => {
        if (!activeSteps.some((s) => s.stepType === "datetime")) return false
        return !findNameField(activeSteps) || !findEmailField(activeSteps)
    }, [activeSteps])

    // Canvas-only empty-step warnings. Detects:
    //   - A form step with zero fields
    //   - A choice-type field (select/segmented/pills/cards/radio) with zero options
    const emptyStepWarnings = React.useMemo(() => {
        const warnings: string[] = []
        for (const step of activeSteps) {
            if (step.stepType === "form" && step.fields.length === 0) {
                warnings.push(
                    `Step "${step.title}" has no fields. Add at least one field in the Fields property.`
                )
            }
            if (step.stepType === "form") {
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
    }, [activeSteps])

    // ===== handlers =====

    // Fix #12: ref-based double-submit guard. The flowStatus check alone has a
    // race window between the first click and React's re-render; this ref closes it.
    const submittingRef = React.useRef(false)

    // Requirement 3: validation must never trigger or display dynamically
    // while the user is typing — only `handleContinue` (on "Continue"/final
    // action click) is allowed to compute and surface field errors. So this
    // handler only ever updates `values`; it deliberately does not touch
    // `errors` or `touched`.
    const handleFieldChange = React.useCallback(
        (fieldId: string, value: any) => {
            setValues((prev) => ({ ...prev, [fieldId]: value }))
        },
        []
    )

    const focusFirstInvalidField = React.useCallback(
        (step: NormalizedStep) => {
            if (typeof document === "undefined") return
            if (step.stepType !== "form") return
            for (const f of step.fields) {
                const err = validateField(f, values[f.id])
                if (err) {
                    const el = document.querySelector<HTMLElement>(
                        `[data-field-id="${f.id}"]`
                    )
                    if (el) {
                        try {
                            el.focus()
                            el.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            })
                        } catch {
                            /* ignore */
                        }
                    }
                    break
                }
            }
        },
        [values]
    )

    const handleSubmitBooking = React.useCallback(async () => {
        // Fix #6: never fire a real POST from inside the Framer canvas.
        if (RenderTarget.current() === RenderTarget.canvas) return
        // Fix #12: double-submit guard.
        if (submittingRef.current) return
        submittingRef.current = true

        const nameField = findNameField(activeSteps)
        const emailField = findEmailField(activeSteps)
        const slot = values.__selectedSlot as BookingPayload | undefined

        if (!nameField || !emailField || !slot) {
            setSubmitError(
                "We couldn't submit your booking because required information is missing."
            )
            setFlowStatus("error")
            submittingRef.current = false
            return
        }

        const name = String(values[nameField.id] || "")
        const email = String(values[emailField.id] || "")
        const notes = buildNotesPayload(activeSteps, values)

        setFlowStatus("submitting")
        setSubmitError(null)

        const result = await submitCalcomBooking({
            apiKey: calApiKey,
            eventTypeId: calEventTypeId,
            slotStart: slot.time24h,
            name,
            email,
            timeZone,
            notes,
        })

        if (result.success) {
            setBookingResult(result.booking)
            setFlowStatus("success")
        } else {
            setSubmitError(mapCalcomError(result.error || "Unknown error"))
            setFlowStatus("error")
        }
        submittingRef.current = false
    }, [activeSteps, values, calApiKey, calEventTypeId, timeZone])

    const handleContinue = React.useCallback(() => {
        if (!currentStep) return
        if (flowStatus === "submitting") return

        // Fix #21: when the user clicks the final action on a review step,
        // re-validate ALL prior form steps. If any is invalid, jump back to
        // the first invalid step and touch its fields so errors show.
        if (isLast && currentStep.stepType === "review") {
            const firstInvalidIdx = activeSteps.findIndex(
                (s) => !validateStep(s, values).valid
            )
            if (firstInvalidIdx >= 0 && firstInvalidIdx !== currentIndex) {
                const invalidStep = activeSteps[firstInvalidIdx]
                setErrors((prev) => ({
                    ...prev,
                    ...validateStep(invalidStep, values).errors,
                }))
                setTouched((prev) => touchAllFieldsIn(invalidStep, prev))
                setCurrentIndex(firstInvalidIdx)
                setTimeout(() => focusFirstInvalidField(invalidStep), 0)
                return
            }
        }

        const { valid, errors: stepErrors } = validateStep(currentStep, values)
        setErrors((prev) => ({ ...prev, ...stepErrors }))
        setTouched((prev) => touchAllFieldsIn(currentStep, prev))

        // ===== THE FIX =====
        // Nothing below this line runs on an invalid step.
        if (!valid) {
            // Focus the first invalid field for accessibility (Section 11).
            // Defer to next tick so the just-set error state has rendered.
            setTimeout(() => focusFirstInvalidField(currentStep), 0)
            return
        }

        if (isLast) {
            // Terminal action — submit a Cal.com booking if a datetime step is in
            // the pipeline, otherwise just show the success screen.
            const hasDatetime = activeSteps.some(
                (s) => s.stepType === "datetime"
            )
            if (hasDatetime && hasCalConfig) {
                handleSubmitBooking()
            } else {
                setFlowStatus("success")
            }
            return
        }

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
        hasCalConfig,
        focusFirstInvalidField,
        handleSubmitBooking,
    ])

    const handleBack = React.useCallback(() => {
        if (isFirst) return
        React.startTransition(() => {
            setCurrentIndex((i) => Math.max(0, i - 1))
        })
    }, [isFirst])

    const handleRetry = React.useCallback(() => {
        // Critical: do NOT clear `values`. The user re-picks only what they want to change.
        setFlowStatus("in-progress")
        setSubmitError(null)
        submittingRef.current = false
    }, [])

    const handleRestart = React.useCallback(() => {
        setValues({})
        setErrors({})
        setTouched({})
        setSelectedDate(null)
        setVisibleMonth(null)
        setSubmitError(null)
        setBookingResult(null)
        setCurrentIndex(0)
        setFlowStatus("in-progress")
        submittingRef.current = false
        if (typeof window !== "undefined" && persistState) {
            try {
                window.sessionStorage.removeItem(sessionKey)
            } catch {
                /* ignore */
            }
        }
    }, [persistState, sessionKey])

    const handleSlotReady = React.useCallback((payload?: BookingPayload) => {
        if (!payload) {
            setValues((prev) => ({ ...prev, __selectedSlot: undefined }))
            return
        }
        setValues((prev) => ({ ...prev, __selectedSlot: payload }))
        // Live-clear the error once a slot is chosen.
        setTouched((prev) => ({ ...prev, __selectedSlot: true }))
        setErrors((prev) => ({ ...prev, __selectedSlot: null }))
    }, [])

    // ===== render =====

    const isCanvas = RenderTarget.current() === RenderTarget.canvas
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
    const hasDatetimeStep = activeSteps.some((s) => s.stepType === "datetime")
    const needsCalSetup = hasDatetimeStep && !hasCalConfig

    // ---- 1. Empty pipeline guard (canvas-only) ----
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
                />
            </RootShell>
        )
    }

    // ---- 4. Active step render ----
    const progressPct =
        totalActive > 0 ? ((currentIndex + 1) / totalActive) * 100 : 0
    const counterText = formatStepCounter(
        "Step {current} of {total}",
        currentIndex + 1,
        totalActive
    )

    // Determine the primary button label. On a single-step flow, "Continue"
    // becomes the final action.
    const primaryLabel =
        totalActive === 1 || isLast ? finalActionLabel : continueLabel
    const isSubmitting = flowStatus === "submitting"

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
                          key={`warn-${idx}`}
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

            {showProgressBar && totalActive > 1 ? (
                <div
                    style={{
                        width: "100%",
                        height: 4,
                        background: theme.surfaceColor,
                        borderRadius: 999,
                        overflow: "hidden",
                        marginBottom: 16,
                    }}
                    aria-hidden="true"
                >
                    <motion.div
                        initial={false}
                        animate={{ width: `${progressPct}%` }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        style={{
                            height: "100%",
                            background: theme.accentColor,
                            borderRadius: 999,
                        }}
                    />
                </div>
            ) : null}

            {/* Step content with smooth transition between steps.
                AnimatePresence mode="popLayout" keeps the old step mounted
                (absolutely positioned) while the new step enters, preventing
                the container from collapsing to 0 height between steps (fix #14). */}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleContinue()
                }}
                style={{ position: "relative", minHeight: 200 }}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={currentIndex}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={stepTransition}
                        style={{ position: "relative" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 4,
                                color: theme.textSecondaryColor,
                                fontSize: 12,
                                fontWeight: 500,
                                letterSpacing: 0.2,
                            }}
                        >
                            <span>{counterText}</span>
                        </div>

                        <div
                            style={{
                                color: theme.textPrimaryColor,
                                fontSize: 22,
                                fontWeight: 700,
                                marginBottom: 4,
                                lineHeight: 1.2,
                            }}
                        >
                            {currentStep.title}
                        </div>
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
                            selectedDate={selectedDate}
                            visibleMonth={visibleMonth}
                            timeZone={timeZone}
                            copy={copy}
                            onFieldChange={handleFieldChange}
                            onSlotReady={handleSlotReady}
                            onDateChange={(d) => setSelectedDate(d)}
                            onMonthChange={(m) => setVisibleMonth(m)}
                            onTimeZoneChange={(tz) => setTimeZone(tz)}
                        />
                    </motion.div>
                </AnimatePresence>
            </form>

            {/* Footer nav */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 24,
                    alignItems: "center",
                    justifyContent: "flex-end",
                }}
            >
                {!isFirst ? (
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        style={{
                            minHeight: 44,
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
                    type="button"
                    onClick={handleContinue}
                    disabled={isSubmitting}
                    style={{
                        minHeight: 44,
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
                                    animation: `be-spin-${reactInstanceId} 0.8s linear infinite`,
                                }}
                            />
                            {copy.submittingLabel}
                        </>
                    ) : (
                        primaryLabel
                    )}
                </button>
            </div>

            {/* Fix #7: focus-visible ring for form inputs + namespaced spinner keyframes. */}
            <style>{`
.be-input-${reactInstanceId} { outline: none; }
.be-input-${reactInstanceId}:focus-visible {
    outline: 2px solid ${theme.accentColor};
    outline-offset: 1px;
}
@keyframes be-spin-${reactInstanceId} { to { transform: rotate(360deg); } }
@media (max-width: 768px) { .be-form-grid-${reactInstanceId} { grid-template-columns: 1fr !important; } }
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

function RootShell(props: {
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
}

// =============================================================================
// StepBody — renders the active step's fields
// =============================================================================

interface StepBodyProps {
    step: NormalizedStep
    /** Fix #2: full pipeline so ReviewStepBody can derive real field labels. */
    steps: NormalizedStep[]
    values: Record<string, any>
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
    borderRadius: number
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
    selectedDate: Date | null
    /** Fix #19: parent-controlled visible month. */
    visibleMonth: Date | null
    timeZone: string
    /** Fix #20: configurable copy. */
    copy: BookingEngineProps["copy"]
    onFieldChange: (fieldId: string, value: any) => void
    onSlotReady: (payload?: BookingPayload) => void
    onDateChange: (d: Date) => void
    onMonthChange: (m: Date) => void
    onTimeZoneChange: (tz: string) => void
}

function StepBody(props: StepBodyProps) {
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
        selectedDate,
        visibleMonth,
        timeZone,
        copy,
        onFieldChange,
        onSlotReady,
        onDateChange,
        onMonthChange,
        onTimeZoneChange,
    } = props

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
            />
        )
    }

    // --- Datetime step ---
    if (step.stepType === "datetime") {
        const slotError =
            touched.__selectedSlot && errors.__selectedSlot
                ? errors.__selectedSlot
                : null
        return (
            <div>
                {/* Fix #13: surface Cal.com fetch errors as an inline banner. */}
                {hasCalConfig && slotsError ? (
                    <div
                        style={{
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
                        We couldn't load availability. Please try again later.
                    </div>
                ) : null}
                {hasCalConfig && slotsLoading ? (
                    <div
                        style={{
                            padding: 24,
                            textAlign: "center",
                            color: theme.textSecondaryColor,
                            fontSize: 13,
                            borderRadius: borderRadius,
                            background: theme.surfaceColor,
                            border: `1px solid ${theme.borderColor}`,
                            marginBottom: 12,
                        }}
                    >
                        {copy.loadingAvailabilityLabel}
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
                    <DateAndTimeInline
                        accentColor={theme.accentColor}
                        backgroundColor={theme.backgroundColor}
                        textColor={theme.textPrimaryColor}
                        borderColor={theme.borderColor}
                        radius={borderRadius}
                        startTime="09:00"
                        endTime="17:00"
                        interval={30}
                        timeFormat="12h"
                        focusColor={theme.accentColor}
                        initialDate={selectedDate}
                        initialTime={
                            values.__selectedSlot
                                ? (values.__selectedSlot as BookingPayload)
                                      .time24h
                                : null
                        }
                        initialVisibleMonth={visibleMonth}
                        availableTimes={
                            hasCalConfig ? slotsForSelectedDate : undefined
                        }
                        onSelectionReady={onSlotReady}
                        onDateChange={onDateChange}
                        onMonthChange={onMonthChange}
                        showTimesWithoutDate
                    />
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
                        style={{
                            display: "block",
                            fontSize: 12,
                            color: theme.textSecondaryColor,
                            marginBottom: 4,
                        }}
                    >
                        Time zone
                    </label>
                    <select
                        value={timeZone}
                        onChange={(e) => onTimeZoneChange(e.target.value)}
                        style={{
                            width: "100%",
                            minHeight: 44,
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
                        {(() => {
                            const detected = detectTimezone()
                            return (
                                <>
                                    <option value={detected}>
                                        Detected: {detected}
                                    </option>
                                    {COMMON_TIMEZONES.filter(
                                        (tz) => tz !== detected
                                    ).map((tz) => (
                                        <option key={tz} value={tz}>
                                            {tz}
                                        </option>
                                    ))}
                                </>
                            )
                        })()}
                    </select>
                </div>
            </div>
        )
    }

    // --- Form step ---
    const isTwoCol = step.layout === "two-column"
    const formGridClass = `be-form-grid`
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: isTwoCol ? "1fr 1fr" : "1fr",
                gap: 12,
            }}
            className={formGridClass}
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
                    onChange={(v) => onFieldChange(field.id, v)}
                />
            ))}
        </div>
    )
}

// =============================================================================
// ReviewStepBody — auto-summarizes prior steps
// =============================================================================

function ReviewStepBody(props: {
    step: NormalizedStep
    steps: NormalizedStep[]
    values: Record<string, any>
    theme: StepBodyProps["theme"]
    borderRadius: number
    copy: BookingEngineProps["copy"]
}) {
    const { step, steps, values, theme, borderRadius, copy } = props
    // Fix #2: derive labels from field metadata across ALL form steps, not
    // from the raw `values` keys (which are normalized IDs like "step-0-field-0").
    const entries: Array<{ label: string; value: string }> = []
    for (const s of steps) {
        if (s.stepType !== "form") continue
        for (const f of s.fields) {
            const v = values[f.id]
            if (v === undefined || v === null || v === "") continue
            entries.push({ label: f.label, value: String(v) })
        }
    }
    if (values.__selectedSlot) {
        const slot = values.__selectedSlot as BookingPayload
        const dateStr = slot.date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        entries.push({ label: "Date", value: dateStr })
        entries.push({ label: "Time", value: slot.timeLabel })
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
                            key={entry.label + idx}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
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
                                    color: theme.textPrimaryColor,
                                    fontWeight: 500,
                                    textAlign: "right",
                                    maxWidth: "60%",
                                    wordBreak: "break-word",
                                }}
                            >
                                {entry.value}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

// =============================================================================
// FieldRenderer — switch on field.type
// =============================================================================

interface FieldRendererProps {
    key?: any
    field: NormalizedField
    value: any
    error: string | null
    theme: StepBodyProps["theme"]
    borderRadius: number
    isTwoCol: boolean
    onChange: (value: any) => void
}

function FieldRenderer(props: FieldRendererProps) {
    const { field, value, error, theme, borderRadius, isTwoCol, onChange } =
        props

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
        minHeight: 44,
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
        case "textarea":
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    <textarea
                        id={`be-field-${field.id}`}
                        className={`be-input`}
                        value={value ?? ""}
                        placeholder={field.placeholder || ""}
                        onChange={(e) => onChange(e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? `be-error-${field.id}` : undefined
                        }
                        rows={4}
                        style={{
                            ...inputBaseStyle,
                            minHeight: 96,
                            resize: "vertical",
                            fontFamily: "inherit",
                        }}
                    />
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
                            value={value ?? ""}
                            onChange={(e) => onChange(e.target.value)}
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
                            {(field.options || []).map((opt) => {
                                const label =
                                    typeof opt === "string"
                                        ? opt
                                        : (opt as any).label
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
            const opts: ChoiceOption[] = (field.options || []).map(
                (opt: any, i: number) =>
                    typeof opt === "string"
                        ? { label: opt }
                        : { label: opt?.label || `Option ${i + 1}` }
            )
            const variant =
                field.fieldType === "pills"
                    ? "pills"
                    : field.fieldType === "segmented"
                      ? "segmented"
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
                        label=""
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
                        controlledValue={value ?? undefined}
                        ariaInvalid={!!error}
                        ariaDescribedBy={
                            error ? `be-error-${field.id}` : undefined
                        }
                        onChange={onChange}
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
                            onChange={(e) => onChange(e.target.checked)}
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
                        value={value ?? ""}
                        placeholder={field.placeholder || ""}
                        onChange={(e) => onChange(e.target.value)}
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
}

// =============================================================================
// SuccessScreen — confirmation summary + .ics download
// =============================================================================

function SuccessScreen(props: {
    steps: NormalizedStep[]
    values: Record<string, any>
    bookingResult: any
    accentColor: string
    textPrimaryColor: string
    textSecondaryColor: string
    surfaceColor: string
    borderColor: string
    successColor: string
    borderRadius: number
    onRestart: () => void
    successTitle: string
    successSubtitle: string
    addToCalendarLabel: string
    restartLabel: string
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
    } = props
    void bookingResult

    // Build a label/value summary from every form step's fields.
    const entries: Array<{ label: string; value: string }> = []
    for (const s of steps) {
        if (s.stepType !== "form") continue
        for (const f of s.fields) {
            const v = values[f.id]
            if (v === undefined || v === null || v === "") continue
            entries.push({ label: f.label, value: String(v) })
        }
    }
    if (values.__selectedSlot) {
        const slot = values.__selectedSlot as BookingPayload
        const dateStr = slot.date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        entries.push({ label: "Date", value: dateStr })
        entries.push({ label: "Time", value: slot.timeLabel })
    }

    const icsUri = values.__selectedSlot
        ? buildIcsDataUri(values.__selectedSlot as BookingPayload)
        : ""

    return (
        <div>
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
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: successColor,
                        color: "#FFFFFF",
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
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: textPrimaryColor,
                    lineHeight: 1.2,
                    textAlign: "center",
                    marginBottom: 4,
                }}
            >
                {successTitle}
            </div>

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
                {successSubtitle}
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
                        key={entry.label + idx}
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
                        download="booking.ics"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: 44,
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
                <button
                    type="button"
                    onClick={onRestart}
                    style={{
                        minHeight: 44,
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
            </div>
        </div>
    )
}

// =============================================================================
// ErrorScreen — friendly, non-technical message + Try Again (preserves values)
// =============================================================================

function ErrorScreen(props: {
    message: string
    errorColor: string
    textPrimaryColor: string
    textSecondaryColor: string
    surfaceColor: string
    borderColor: string
    borderRadius: number
    accentColor: string
    onRetry: () => void
    errorTitle: string
    errorSubtitle: string
    retryLabel: string
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
    } = props
    void surfaceColor
    void borderColor
    return (
        <div>
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
                        width: 40,
                        height: 40,
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
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: textPrimaryColor,
                            lineHeight: 1.2,
                        }}
                    >
                        {errorTitle}
                    </div>
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
            <button
                type="button"
                onClick={onRetry}
                style={{
                    minHeight: 44,
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
        </div>
    )
}

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

function makeFieldObjectControls() {
    return {
        label: {
            type: ControlType.String,
            title: "Label",
            defaultValue: "Field Label",
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
            ],
            defaultValue: "text",
        },
        placeholder: {
            type: ControlType.String,
            title: "Placeholder",
            defaultValue: "",
        },
        required: {
            type: ControlType.Boolean,
            title: "Required",
            defaultValue: false,
        },
        // Requirement 3: the explicit "Validation" dropdown (and its
        // Min Length / Regex Pattern sub-controls) has been removed entirely.
        // Validation is now inferred automatically from `fieldType` — see
        // `validateField()` above — and only ever evaluated on Continue.
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
            maxCount: 20,
            control: { type: ControlType.String },
            hidden: (p: any) =>
                !["select", "segmented", "pills", "cards", "radio"].includes(
                    p?.fieldType
                ),
        },
        // Scalar — safe to conditionally hide (Safety Rule #2).
        isPrimaryName: {
            type: ControlType.Boolean,
            title: "Primary Name",
            defaultValue: false,
            enabledTitle: "Yes",
            disabledTitle: "No",
            hidden: (p: any) => p?.fieldType !== "text",
        },
        width: {
            type: ControlType.Enum,
            title: "Width",
            options: ["full", "half"],
            optionTitles: ["Full", "Half"],
            defaultValue: "full",
            displaySegmentedControl: true,
        },
    }
}

// The type selector shown directly in the main panel list, outside any
// submenu (Requirement 1). It's a plain top-level Enum control, hidden by
// the sibling `stepCount` Number — the ordinary, well-supported pattern.
// The stored value is unchanged ("form" / "datetime"); only the "datetime"
// option's *label* reads "Calendar" now (Requirement 2), and "review" has
// been dropped from the choices entirely (also Requirement 2).
function makeStepTypeControl(slotIndex: number, defaultType: StepType) {
    return {
        type: ControlType.Enum,
        title: "Step Type",
        options: ["form", "datetime"],
        optionTitles: ["Form", "Calendar"],
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
        hidden: (p: any) => (p?.stepCount ?? 2) <= slotIndex,
        controls: {
            // Internal Step Type control — moved back inside the submenu,
            // alongside Title/Subtitle/Fields, rather than living as a
            // separate top-level control on the main panel.
            stepType: makeStepTypeControl(slotIndex, defaults.stepType),
            enabled: {
                type: ControlType.Boolean,
                title: "Visible",
                defaultValue: defaults.enabled,
                enabledTitle: "Yes",
                disabledTitle: "No",
            },
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
            // (not even based on this step's own type). Always visible;
            // functionally inert for a Calendar step since `.fields` is only
            // ever read when `stepType === "form"`.
            fields: {
                type: ControlType.Array,
                title: "Fields",
                maxCount: 12,
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

    // ----- Progress -----
    showProgressBar: {
        type: ControlType.Boolean,
        title: "Progress Bar",
        defaultValue: true,
    },

    // ----- Theme -----
    colorMode: {
        type: ControlType.Enum,
        title: "Color Mode",
        options: ["light", "dark", "auto"],
        optionTitles: ["Light", "Dark", "Auto"],
        defaultValue: "light",
        displaySegmentedControl: true,
    },
    styles: {
        type: ControlType.Object,
        title: "Styles",
        icon: "color",
        buttonTitle: "Styles",
        controls: {
            accentColor: {
                type: ControlType.Color,
                title: "Accent",
                defaultValue: "#0099FF",
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
                defaultValue: "#EF4444",
            },
            successColor: {
                type: ControlType.Color,
                title: "Success",
                defaultValue: "#22C55E",
            },
            borderRadius: {
                type: ControlType.Number,
                title: "Radius",
                defaultValue: 12,
                min: 0,
                max: 32,
                step: 1,
                unit: "px",
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

    // ----- Copy (fix #20: configurable terminal-state strings) -----
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
                defaultValue: "We've sent a confirmation to your email.",
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
})

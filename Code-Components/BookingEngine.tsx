import { addPropertyControls, ControlType, RenderTarget, useIsStaticRenderer } from "framer"
import {
    AnimatePresence,
    MotionConfig,
    motion,
    type TargetAndTransition,
    type Transition,
    useReducedMotion,
    type Variants,
} from "framer-motion"
import * as React from "react"
import * as ReactDOM from "react-dom"

declare global {
    interface Window {
        __BE_STEP_DEBUG__?: boolean
    }
}

type ThemeToken =
    | "accentColor"
    | "accentForegroundColor"
    | "surfaceColor"
    | "textPrimaryColor"
    | "textSecondaryColor"
    | "borderColor"
    | "errorColor"
    | "successColor"
type Theme = Record<ThemeToken, string>

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

const NAMED_COLORS: Record<string, string> = {
    aliceblue: "#F0F8FF",
    antiquewhite: "#FAEBD7",
    aqua: "#00FFFF",
    aquamarine: "#7FFFD4",
    azure: "#F0FFFF",
    beige: "#F5F5DC",
    bisque: "#FFE4C4",
    black: "#000000",
    blanchedalmond: "#FFEBCD",
    blue: "#0000FF",
    blueviolet: "#8A2BE2",
    brown: "#A52A2A",
    burlywood: "#DEB887",
    cadetblue: "#5F9EA0",
    chartreuse: "#7FFF00",
    chocolate: "#D2691E",
    coral: "#FF7F50",
    cornflowerblue: "#6495ED",
    cornsilk: "#FFF8DC",
    crimson: "#DC143C",
    cyan: "#00FFFF",
    darkblue: "#00008B",
    darkcyan: "#008B8B",
    darkgoldenrod: "#B8860B",
    darkgray: "#A9A9A9",
    darkgreen: "#006400",
    darkgrey: "#A9A9A9",
    darkkhaki: "#BDB76B",
    darkmagenta: "#8B008B",
    darkolivegreen: "#556B2F",
    darkorange: "#FF8C00",
    darkorchid: "#9932CC",
    darkred: "#8B0000",
    darksalmon: "#E9967A",
    darkseagreen: "#8FBC8F",
    darkslateblue: "#483D8B",
    darkslategray: "#2F4F4F",
    darkslategrey: "#2F4F4F",
    darkturquoise: "#00CED1",
    darkviolet: "#9400D3",
    deeppink: "#FF1493",
    deepskyblue: "#00BFFF",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1E90FF",
    firebrick: "#B22222",
    floralwhite: "#FFFAF0",
    forestgreen: "#228B22",
    fuchsia: "#FF00FF",
    gainsboro: "#DCDCDC",
    ghostwhite: "#F8F8FF",
    gold: "#FFD700",
    goldenrod: "#DAA520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#ADFF2F",
    grey: "#808080",
    honeydew: "#F0FFF0",
    hotpink: "#FF69B4",
    indianred: "#CD5C5C",
    indigo: "#4B0082",
    ivory: "#FFFFF0",
    khaki: "#F0E68C",
    lavender: "#E6E6FA",
    lavenderblush: "#FFF0F5",
    lawngreen: "#7CFC00",
    lemonchiffon: "#FFFACD",
    lightblue: "#ADD8E6",
    lightcoral: "#F08080",
    lightcyan: "#E0FFFF",
    lightgoldenrodyellow: "#FAFAD2",
    lightgray: "#D3D3D3",
    lightgreen: "#90EE90",
    lightgrey: "#D3D3D3",
    lightpink: "#FFB6C1",
    lightsalmon: "#FFA07A",
    lightseagreen: "#20B2AA",
    lightskyblue: "#87CEFA",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#B0C4DE",
    lightyellow: "#FFFFE0",
    lime: "#00FF00",
    limegreen: "#32CD32",
    linen: "#FAF0E6",
    magenta: "#FF00FF",
    maroon: "#800000",
    mediumaquamarine: "#66CDAA",
    mediumblue: "#0000CD",
    mediumorchid: "#BA55D3",
    mediumpurple: "#9370DB",
    mediumseagreen: "#3CB371",
    mediumslateblue: "#7B68EE",
    mediumspringgreen: "#00FA9A",
    mediumturquoise: "#48D1CC",
    mediumvioletred: "#C71585",
    midnightblue: "#191970",
    mintcream: "#F5FFFA",
    mistyrose: "#FFE4E1",
    moccasin: "#FFE4B5",
    navajowhite: "#FFDEAD",
    navy: "#000080",
    oldlace: "#FDF5E6",
    olive: "#808000",
    olivedrab: "#6B8E23",
    orange: "#FFA500",
    orangered: "#FF4500",
    orchid: "#DA70D6",
    palegoldenrod: "#EEE8AA",
    palegreen: "#98FB98",
    paleturquoise: "#AFEEEE",
    palevioletred: "#DB7093",
    papayawhip: "#FFEFD5",
    peachpuff: "#FFDAB9",
    peru: "#CD853F",
    pink: "#FFC0CB",
    plum: "#DDA0DD",
    powderblue: "#B0E0E6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#FF0000",
    rosybrown: "#BC8F8F",
    royalblue: "#4169E1",
    saddlebrown: "#8B4513",
    salmon: "#FA8072",
    sandybrown: "#F4A460",
    seagreen: "#2E8B57",
    seashell: "#FFF5EE",
    sienna: "#A0522D",
    silver: "#C0C0C0",
    skyblue: "#87CEEB",
    slateblue: "#6A5ACD",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#FFFAFA",
    springgreen: "#00FF7F",
    steelblue: "#4682B4",
    tan: "#D2B48C",
    teal: "#008080",
    thistle: "#D8BFD8",
    tomato: "#FF6347",
    turquoise: "#40E0D0",
    violet: "#EE82EE",
    wheat: "#F5DEB3",
    white: "#FFFFFF",
    whitesmoke: "#F5F5F5",
    yellow: "#FFFF00",
    yellowgreen: "#9ACD32",
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

type ParsedRgba = { r: number; g: number; b: number; a: number } | null
const PARSE_COLOR_CACHE = new Map<string, ParsedRgba>()
function parseColorToRgba(color: string): ParsedRgba {
    const trimmed = (color || "").trim().toLowerCase()
    const cached = PARSE_COLOR_CACHE.get(trimmed)
    if (cached !== undefined || PARSE_COLOR_CACHE.has(trimmed)) {
        return cached ?? null
    }
    if (PARSE_COLOR_CACHE.size >= 1000) PARSE_COLOR_CACHE.clear()
    const parsed = parseColorToRgbaUncached(trimmed)
    PARSE_COLOR_CACHE.set(trimmed, parsed)
    return parsed
}
function parseColorToRgbaUncached(color: string): ParsedRgba {
    const trimmed = (color || "").trim().toLowerCase()
    if (!trimmed) return null
    if (trimmed === "transparent") return { r: 0, g: 0, b: 0, a: 0 }
    if (trimmed === "currentcolor") return { r: 0, g: 0, b: 0, a: 0 }

    const hex = trimmed.replace(/^#/, "")
    if (/^[0-9a-f]+$/.test(hex) && [3, 4, 6, 8].includes(hex.length)) {
        let normalized = hex
        if (hex.length === 3 || hex.length === 4) {
            normalized = hex
                .split("")
                .map((ch) => ch + ch)
                .join("")
        }
        const r = parseInt(normalized.slice(0, 2), 16)
        const g = parseInt(normalized.slice(2, 4), 16)
        const b = parseInt(normalized.slice(4, 6), 16)
        const aHex = normalized.slice(6, 8)
        const a = aHex ? parseInt(aHex, 16) / 255 : 1
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null
        return { r, g, b, a }
    }

    if (NAMED_COLORS[trimmed]) {
        const named = parseColorToRgba(NAMED_COLORS[trimmed])
        if (!named) return null
        return { ...named, a: 1 }
    }

    const hslMatch = /^hsla?\((.*)\)$/i.exec(trimmed)
    if (hslMatch) {
        const inner = hslMatch[1].trim()
        const [huePart, satLumAlpha] = inner.split("/")
        const tokens = (huePart || "").replace(/,/g, " ").split(/\s+/).filter(Boolean)
        if (tokens.length < 3) return null
        let hue = parseFloat(tokens[0])
        if (Number.isNaN(hue)) return null
        if (tokens[0].endsWith("grad")) {
            hue = (hue * 360) / 400
        } else if (tokens[0].endsWith("rad")) {
            hue = (hue * 180) / Math.PI
        } else if (tokens[0].endsWith("turn")) {
            hue = hue * 360
        }
        const parsePct = (token: string): number | null => {
            const value = parseFloat(token)
            if (Number.isNaN(value)) return null
            return value / 100
        }
        const s = parsePct(tokens[1])
        const l = parsePct(tokens[2])
        if (s === null || l === null) return null
        let a = 1
        const alphaToken = (satLumAlpha?.trim() || tokens[3] || "").trim()
        if (alphaToken) {
            if (alphaToken.endsWith("%")) {
                a = parseFloat(alphaToken) / 100
            } else {
                a = parseFloat(alphaToken)
            }
            if (Number.isNaN(a)) a = 1
        }
        a = clamp(a, 0, 1)
        const h = (((hue % 360) + 360) % 360) / 360
        const sC = clamp(s, 0, 1)
        const lC = clamp(l, 0, 1)
        if (sC === 0) {
            const v = Math.round(lC * 255)
            return { r: v, g: v, b: v, a }
        }
        const hue2rgb = (p: number, q: number, t: number): number => {
            let tn = t
            if (tn < 0) tn += 1
            if (tn > 1) tn -= 1
            if (tn < 1 / 6) return p + (q - p) * 6 * tn
            if (tn < 1 / 2) return q
            if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6
            return p
        }
        const q = lC < 0.5 ? lC * (1 + sC) : lC + sC - lC * sC
        const p = 2 * lC - q
        return {
            r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
            g: Math.round(hue2rgb(p, q, h) * 255),
            b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
            a,
        }
    }

    const rgbMatch = /^rgba?\((.*)\)$/i.exec(trimmed)
    if (!rgbMatch) return null
    const inner = rgbMatch[1].trim()
    const [channelsPart, alphaPart] = inner.split("/")
    const tokens = (channelsPart || "").replace(/,/g, " ").split(/\s+/).filter(Boolean)
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
    let a = 1
    const alphaToken = (alphaPart?.trim() || tokens[3] || "").trim()
    if (alphaToken) {
        if (alphaToken.endsWith("%")) {
            a = parseFloat(alphaToken) / 100
        } else {
            a = parseFloat(alphaToken)
        }
        if (Number.isNaN(a)) a = 1
    }
    a = clamp(a, 0, 1)
    return { r, g, b, a }
}

const TEXT_ON_ACCENT = "#FFFFFF"

const SUPPORTS_COLOR_MIX =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("color", "color-mix(in srgb, red, blue)")

function withAlpha(color: string, alpha: number, background?: string): string {
    const safeAlpha = clamp(alpha, 0, 1)
    const parsed = parseColorToRgba(color)
    if (parsed) {
        const effectiveAlpha = clamp(parsed.a * safeAlpha, 0, 1)
        if (background) {
            const bg = parseColorToRgba(background)
            if (bg && effectiveAlpha > 0) {
                const mix = (c: number, b: number) =>
                    Math.round(c * effectiveAlpha + b * (1 - effectiveAlpha))
                return `rgb(${mix(parsed.r, bg.r)}, ${mix(parsed.g, bg.g)}, ${mix(parsed.b, bg.b)})`
            }
            if (bg) return `rgb(${bg.r}, ${bg.g}, ${bg.b})`
        }
        if (effectiveAlpha >= 1) {
            return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`
        }
        return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${effectiveAlpha})`
    }
    if (!SUPPORTS_COLOR_MIX) return color
    return `color-mix(in srgb, ${color} ${safeAlpha * 100}%, transparent)`
}

function pageLocale(): string | undefined {
    return typeof document !== "undefined" ? document.documentElement.lang || undefined : undefined
}

const DEFAULT_COPY_CONFIRMATION_ID_LABEL = "Confirmation ID"
const DEFAULT_COPY_RESCHEDULE_OR_CANCEL_LABEL = "Manage"
const DEFAULT_COPY_PICK_DATE_TO_SEE_TIMES_LABEL = "Pick a date to see times"
const DEFAULT_COPY_NO_TIMES_FALLBACK_LABEL = "No available times"
const DEFAULT_COPY_STEP_PROGRESS_TEMPLATE = "{pct}% complete"
const DEFAULT_COPY_UNKNOWN_ERROR_LABEL = "Unknown error"
const DEFAULT_COPY_SUBMIT_ERROR_FALLBACK =
    "Something went wrong while submitting your booking. Please try again."
const DEFAULT_COPY_AM_LABEL = "AM"
const DEFAULT_COPY_PM_LABEL = "PM"
const DEFAULT_COPY_HOUR_SUFFIX = "hr"
const DEFAULT_COPY_MINUTE_SUFFIX = "min"
const DEFAULT_COPY_ICS_PRODID = "//BookingEngine//Framer//EN"
const DEFAULT_COPY_ICS_SUMMARY_FALLBACK = "Booking"
const DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL = "Selected Time"
const DEFAULT_COPY_NOTES_DATE_PREFIX = "Date: "
const DEFAULT_COPY_NOTES_TIME_PREFIX = "Time: "
const DEFAULT_COPY_STEP_COUNTER_TEMPLATE = "Step {current} of {total}"
const DEFAULT_COPY_SUCCESS_TITLE = "Booked Successfully"
const DEFAULT_COPY_SUCCESS_SUBTITLE =
    "Your appointment details are below, add them to your calendar."
const DEFAULT_COPY_ERROR_TITLE = "Something went wrong while processing your booking"
const DEFAULT_COPY_ERROR_SUBTITLE = "Your details are saved, try again in a moment."
const DEFAULT_COPY_TIMEFORMAT_LABEL = "Time format"
const DEFAULT_COPY_LOADING_LABEL = "Loading availability…"
const DEFAULT_COPY_NO_TIMES_LABEL = "No available times on the selected date. Try another day."
const DEFAULT_COPY_BOOKING_LABEL = "Booking…"
const DEFAULT_COPY_DATE_LABEL = "Date"
const DEFAULT_COPY_TIME_LABEL = "Time"
const DEFAULT_COPY_RETRY_LABEL = "Try again"
const DEFAULT_DEMO_START_TIME = "09:00"
const DEFAULT_DEMO_END_TIME = "17:00"
const DEFAULT_DEMO_INTERVAL = 30
const DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE = "{counter}, {percent}% complete"
const DEFAULT_CONFIRM_BOOK_ANOTHER_LABEL = "Book another"
const DEFAULT_CONFIRM_ADD_TO_CALENDAR_LABEL = "Add to Calendar"
const CALENDAR_MENU_GOOGLE_LABEL = "Google Calendar"
const CALENDAR_MENU_OFFICE_LABEL = "Microsoft Office"
const CALENDAR_MENU_OUTLOOK_LABEL = "Microsoft Outlook"
const CALENDAR_MENU_OTHER_LABEL = "Other"
const DEFAULT_FONT_FAMILY = "Inter, system-ui, sans-serif"
const DEFAULT_ARIA_CHOICE_GROUP_LABEL = "Choice group"
const DEFAULT_ARIA_TIME_SLOTS_LABEL = "Time slots"
const DEFAULT_ARIA_AVAILABLE_TIMES_LABEL = "Available times"
const DEFAULT_ARIA_DATE_PICKER_LABEL = "Date picker"
const DEFAULT_ARIA_BOOKING_PROGRESS_LABEL = "Booking progress"
const DEFAULT_ARIA_BOOKING_FORM_LABEL = "Booking form"
const DEFAULT_ARIA_PREVIOUS_MONTH_TEMPLATE = "Previous month, {month}"
const DEFAULT_ARIA_NEXT_MONTH_TEMPLATE = "Next month, {month}"
const DEFAULT_ARIA_LABELS = {
    choiceGroup: DEFAULT_ARIA_CHOICE_GROUP_LABEL,
    timeSlots: DEFAULT_ARIA_TIME_SLOTS_LABEL,
    availableTimes: DEFAULT_ARIA_AVAILABLE_TIMES_LABEL,
    datePicker: DEFAULT_ARIA_DATE_PICKER_LABEL,
    bookingProgress: DEFAULT_ARIA_BOOKING_PROGRESS_LABEL,
    bookingForm: DEFAULT_ARIA_BOOKING_FORM_LABEL,
    previousMonthTemplate: DEFAULT_ARIA_PREVIOUS_MONTH_TEMPLATE,
    nextMonthTemplate: DEFAULT_ARIA_NEXT_MONTH_TEMPLATE,
}

interface ErrorCopy {
    credentialError: string
    timeTakenError: string
    invalidEmailError: string
    timeNoLongerAvailableError: string
    networkError: string
    submitTimeoutError: string
    malformedResponseError: string
    badRequestError: string
    attendeeContactError: string
    emptyResponseError: string
    httpStatusTemplate: string
    slotsTimeoutError: string
    slotsNotFoundError: string
    slotsRateLimitTemplate: string
    slotsRateLimitGenericError: string
    slotsUnavailableError: string
    slotsFallbackError: string
    offlineError: string
    missingSlotError: string
    misconfiguredFormError: string
    invalidSlotTimeError: string
    unavailableTitle: string
    unavailableBody: string
    unavailableMessage: string
}
const ERROR_COPY_DEFAULTS: ErrorCopy = {
    credentialError: "The booking service rejected our credentials. Please contact the site owner.",
    timeTakenError: "That time was just taken by someone else. Please pick another slot.",
    invalidEmailError: "Please check the email address and try again.",
    timeNoLongerAvailableError: "That time is no longer available. Please pick another slot.",
    networkError:
        "We couldn't reach the booking service. Please check your connection and try again.",
    submitTimeoutError: "The booking service took too long to respond. Please try again.",
    malformedResponseError:
        "The booking service returned an unusable response. Please try again later, or contact the site owner if the problem persists.",
    badRequestError:
        "The booking service rejected the request details. Please go back, check your answers, and try again.",
    attendeeContactError:
        "Your booking needs your name and an email address to be confirmed. Please go back, complete the contact details, and try again.",
    emptyResponseError:
        "We couldn't confirm your booking. Please check your email for a confirmation before trying again.",
    httpStatusTemplate: "Booking failed (HTTP {status})",
    slotsTimeoutError: "Loading availability timed out. Please try again.",
    slotsNotFoundError:
        "This booking form isn't configured correctly (event type not found). Please contact the site owner.",
    slotsRateLimitTemplate:
        "The booking service is rate-limiting requests. Please wait {seconds} seconds and try again.",
    slotsRateLimitGenericError: "Too many requests right now. Please wait a moment and try again.",
    slotsUnavailableError:
        "The booking service is temporarily unavailable. Please try again shortly.",
    slotsFallbackError: "Failed to load availability",
    offlineError: "You appear to be offline. Please check your connection and try again.",
    missingSlotError: "Please go back and pick a time slot before continuing.",
    misconfiguredFormError:
        "This booking form isn't fully configured: it's missing a name or email field. Please contact the site owner.",
    invalidSlotTimeError:
        "The selected time is invalid. Please go back and pick a time slot again.",
    unavailableTitle: "Booking is currently unavailable",
    unavailableBody: "Please call us to schedule your appointment.",
    unavailableMessage:
        "Booking is currently unavailable. Please call us directly to schedule your appointment.",
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

function formatTimeLabel(
    minutes: number,
    mode: "12h" | "24h",
    amLabel: string = DEFAULT_COPY_AM_LABEL,
    pmLabel: string = DEFAULT_COPY_PM_LABEL
): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (mode === "24h") return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    const suffix = h >= 12 ? pmLabel : amLabel
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

const dtfCache = new Map<string, Intl.DateTimeFormat>()
function getCachedDateTimeFormat(
    locale: string | undefined,
    options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
    const key = `${locale ?? ""}|${JSON.stringify(options)}`
    let dtf = dtfCache.get(key)
    if (!dtf) {
        if (dtfCache.size >= 50) dtfCache.clear()
        dtf = new Intl.DateTimeFormat(locale ?? undefined, options)
        dtfCache.set(key, dtf)
    }
    return dtf
}

function buildFutureAwareAvailableDates(
    slots: Array<{ value: string }>,
    timeZone: string,
    nowMs: number | null
): Set<string> {
    const set = new Set<string>()
    for (const slot of slots) {
        if (nowMs !== null) {
            const start = new Date(slot.value).getTime()
            if (!Number.isFinite(start) || start <= nowMs) continue
        }
        const key = slotDateKeyInTimeZone(slot.value, timeZone)
        if (key) set.add(key)
    }
    return set
}

const slotDateKeyCache = new Map<string, string>()
function slotDateKeyInTimeZone(value: string, timeZone: string): string {
    const key = `${timeZone}|${value}`
    const hit = slotDateKeyCache.get(key)
    if (hit !== undefined) return hit
    if (slotDateKeyCache.size >= 2000) slotDateKeyCache.clear()
    const d = new Date(value)
    const computed = Number.isNaN(d.getTime()) ? "" : getDateKeyInTimeZone(d, timeZone)
    slotDateKeyCache.set(key, computed)
    return computed
}

function getMinutesInTimeZone(date: Date, timeZone: string): number {
    try {
        const parts = getCachedDateTimeFormat("en-US", {
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
        return ((h % 24) * 60 + m) % 1440
    } catch {
        return date.getHours() * 60 + date.getMinutes()
    }
}

function getLocalDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}`
}
function getDateKeyInTimeZone(date: Date, timeZone: string): string {
    try {
        const parts = getCachedDateTimeFormat("en-US", {
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
    return getLocalDateKey(date)
}

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function getTodayInTimeZone(timeZone: string | undefined): Date {
    const tz = timeZone || ""
    const tzKey = getDateKeyInTimeZone(new Date(), tz)
    const parts = tzKey.split("-").map(Number)
    const y = parts[0] ?? 1970
    const m = parts[1] ?? 1
    const d = parts[2] ?? 1
    let candidate = new Date(y, m - 1, d)
    for (let i = 0; i < 3; i++) {
        const candidateKey = getDateKeyInTimeZone(candidate, tz)
        if (candidateKey === tzKey) break
        const day = candidate.getDate()
        candidate =
            candidateKey < tzKey
                ? new Date(candidate.getFullYear(), candidate.getMonth(), day + 1)
                : new Date(candidate.getFullYear(), candidate.getMonth(), day - 1)
    }
    return candidate
}

function parseRadiusNumber(value: string | number | undefined): number {
    const raw = typeof value === "number" ? value : parseFloat(String(value ?? ""))
    return Number.isFinite(raw) ? raw : 0
}

function innerRadiusValue(value: string | number | undefined, inset: number): string {
    return `${Math.max(0, parseRadiusNumber(value) - inset)}px`
}

function fontPixelSize(value: string | number | undefined): number | undefined {
    if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : undefined
    if (typeof value === "string") {
        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
    }
    return undefined
}

function resolveFieldBorder(
    fs: FieldStyleOverrides | undefined,
    fieldType?: FieldType
): { width: number; style: string; color: string | undefined } {
    const eff = fieldType ? getFieldStylesEffectiveDefaults(fieldType) : null
    const defWidth = eff?.borderWidth ?? FIELD_STYLES_BORDER_WIDTH
    const defColor = eff?.borderColor ?? FIELD_STYLES_BORDER_COLOR
    const b = fs?.border
    const compoundSet =
        b != null &&
        (b.borderWidth != null ||
            b.borderColor != null ||
            b.borderStyle != null ||
            b.borderTopWidth != null ||
            b.borderRightWidth != null ||
            b.borderBottomWidth != null ||
            b.borderLeftWidth != null)
    if (compoundSet && b) {
        // Explicit 0 is a real answer: all-zero sides resolve to width 0
        // instead of falling back to the default width.
        const sides = [
            b.borderTopWidth,
            b.borderRightWidth,
            b.borderBottomWidth,
            b.borderLeftWidth,
        ].filter((v): v is number => typeof v === "number")
        const width = sides.length ? Math.max(...sides) : (b.borderWidth ?? defWidth)
        return { width, style: b.borderStyle || "solid", color: b.borderColor ?? defColor }
    }
    return {
        width: fs?.borderWidth ?? defWidth,
        style: "solid",
        color: fs?.borderColor ?? defColor,
    }
}

function resolveFieldRadius(
    fs: FieldStyleOverrides | undefined,
    themeRadius: string | number,
    fieldType?: FieldType
): string {
    if (typeof fs?.radius === "string" && fs.radius.trim()) return fs.radius
    if (typeof fs?.radius === "number") return `${fs.radius}px`
    // Untouched fields track the global Radius token (buttons already do) — except
    // types with a distinctive native shape (pills, checkbox box), which keep it.
    if (fieldType) {
        const effRadius = getFieldStylesEffectiveDefaults(fieldType).radius
        if (effRadius !== FIELD_STYLES_FIELD_RADIUS) return effRadius
    }
    return typeof themeRadius === "number" ? `${themeRadius}px` : themeRadius
}

function resolveFieldPadding(fs: FieldStyleOverrides | undefined, fieldType?: FieldType): string {
    if (typeof fs?.padding === "string" && fs.padding.trim()) return fs.padding
    if (fs?.paddingY != null || fs?.paddingX != null) {
        return `${fs?.paddingY ?? 10}px ${fs?.paddingX ?? 14}px`
    }
    if (fieldType) return getFieldStylesEffectiveDefaults(fieldType).padding
    return FIELD_STYLES_INPUT_PADDING
}

const STYLE_OVERRIDE_COLOR_KEYS: Array<keyof FieldStyleOverrides> = [
    "labelColor",
    "textColor",
    "placeholderColor",
    "backgroundColor",
    "focusBorderColor",
    "selectedBackgroundColor",
    "selectedTextColor",
    "selectedBorderColor",
    "accentColor",
    "borderColor",
]
function normalizeStyleOverrides(
    fs: FieldStyleOverrides | undefined
): FieldStyleOverrides | undefined {
    if (!fs) return fs
    let out: FieldStyleOverrides | null = null
    for (const key of STYLE_OVERRIDE_COLOR_KEYS) {
        if (fs[key] === "") {
            out ??= { ...fs }
            delete out[key]
        }
    }
    const nestedSelected = (fs as Record<string, unknown>).selected
    if (typeof nestedSelected === "object" && nestedSelected !== null) {
        const normalized = normalizeStyleOverrides(nestedSelected as FieldStyleOverrides)
        if (normalized !== nestedSelected) {
            out ??= { ...fs }
            out.selected = normalized
        }
    }
    return out ?? fs
}

function mergeStyleOverrides(
    base: FieldStyleOverrides | undefined,
    over: FieldStyleOverrides | undefined
): FieldStyleOverrides | undefined {
    if (!base) return over
    if (!over) return base
    const out: FieldStyleOverrides = { ...base }
    const record = out as Record<string, unknown>
    for (const key of Object.keys(over)) {
        const value: unknown = (over as Record<string, unknown>)[key]
        if (value !== undefined) record[key] = value
    }
    return out
}

/** Horizontal padding (px) from a resolved CSS padding string — used by the
 *  select variant, which reserves chevron room past the content padding. */
function paddingHorizontalFrom(padding: string): number {
    const parts = padding
        .trim()
        .split(/\s+/)
        .map((p) => Number.parseFloat(p))
    if (!parts.length || !Number.isFinite(parts[0])) return 14
    return parts.length >= 2 && Number.isFinite(parts[1]) ? parts[1] : parts[0]
}

/** Vertical/horizontal axes (px) from a resolved CSS padding string — used by
 *  choice options, whose paddings are applied per-axis inline. */
function paddingAxesFrom(padding: string): { y: number; x: number } | null {
    const parts = padding
        .trim()
        .split(/\s+/)
        .map((p) => Number.parseFloat(p))
    if (!parts.length || !Number.isFinite(parts[0])) return null
    if (parts.length === 1) return { y: parts[0], x: parts[0] }
    const y = parts[0]
    const x = Number.isFinite(parts[1]) ? parts[1] : y
    return { y, x }
}

// SECTION-SPACING (BE-075/BE-078): author rhythm for the three vertical
// zone gaps. Defaults reproduce the shipped look (16 / 16 / 36).
const SECTION_SPACING_DEFAULTS = { progress: 32, heading: 32, footer: 32 } as const
const SECTION_SPACING_MIN = 0
const SECTION_SPACING_MAX = 64
function clampSectionSpacing(raw: unknown, fallback: number): number {
    const n = typeof raw === "number" ? raw : Number(raw)
    if (!Number.isFinite(n)) return fallback
    return Math.max(SECTION_SPACING_MIN, Math.min(SECTION_SPACING_MAX, Math.round(n)))
}

const DEFAULT_CALENDAR_SURFACE_BACKGROUND = "#FFFFFF"

const DERIVED_SECONDARY_TEXT_ALPHA = 0.62
const DERIVED_SUCCESS_COLOR = "#15803D"
const FIXED_ERROR_COLOR = "#DC2626"

const FIELD_STYLES_INPUT_PADDING = "14px"
const FIELD_STYLES_SELECT_PADDING = "14px"
const FIELD_STYLES_CARDS_PADDING = "10px 8px 10px 8px"
const FIELD_STYLES_PILLS_PADDING = "5px 12px 5px 12px"
const FIELD_STYLES_SEGMENTED_PADDING = "11px 10px 11px 10px"
const FIELD_STYLES_SPACING = 6
const FIELD_STYLES_CHECK_SIZE = 18
const FIELD_STYLES_FIELD_RADIUS = "12px"
const FIELD_STYLES_CARDS_RADIUS = "12px"
const FIELD_STYLES_PILLS_RADIUS = "999px"
const FIELD_STYLES_SEGMENTED_RADIUS = "12px"
const FIELD_STYLES_BORDER_WIDTH = 1
const FIELD_STYLES_BORDER_COLOR = "#E2E2E2"

function getFieldStylesEffectiveDefaults(fieldType: FieldType): {
    padding: string
    radius: string
    borderWidth: number
    borderColor: string
    minHeight: number
    spacing: number
} {
    switch (fieldType) {
        case "cards":
            return {
                padding: FIELD_STYLES_CARDS_PADDING,
                radius: FIELD_STYLES_CARDS_RADIUS,
                borderWidth: FIELD_STYLES_BORDER_WIDTH,
                borderColor: FIELD_STYLES_BORDER_COLOR,
                minHeight: TOUCH_TARGET_MIN,
                spacing: FIELD_STYLES_SPACING,
            }
        case "pills":
            return {
                padding: FIELD_STYLES_PILLS_PADDING,
                radius: FIELD_STYLES_PILLS_RADIUS,
                borderWidth: FIELD_STYLES_BORDER_WIDTH,
                borderColor: FIELD_STYLES_BORDER_COLOR,
                minHeight: TOUCH_TARGET_MIN,
                spacing: FIELD_STYLES_SPACING,
            }
        case "segmented":
            return {
                padding: FIELD_STYLES_SEGMENTED_PADDING,
                radius: FIELD_STYLES_SEGMENTED_RADIUS,
                borderWidth: FIELD_STYLES_BORDER_WIDTH,
                borderColor: FIELD_STYLES_BORDER_COLOR,
                minHeight: TOUCH_TARGET_MIN,
                spacing: FIELD_STYLES_SPACING,
            }
        case "select":
            return {
                padding: FIELD_STYLES_SELECT_PADDING,
                radius: FIELD_STYLES_FIELD_RADIUS,
                borderWidth: FIELD_STYLES_BORDER_WIDTH,
                borderColor: FIELD_STYLES_BORDER_COLOR,
                minHeight: TOUCH_TARGET_MIN,
                spacing: FIELD_STYLES_SPACING,
            }
        case "checkbox":
            return {
                padding: "0px",
                radius: "4px",
                borderWidth: FIELD_STYLES_BORDER_WIDTH,
                borderColor: FIELD_STYLES_BORDER_COLOR,
                minHeight: FIELD_STYLES_CHECK_SIZE,
                spacing: FIELD_STYLES_SPACING,
            }
        case "calendar-widget":
            return {
                padding: "0px",
                radius: FIELD_STYLES_FIELD_RADIUS,
                borderWidth: 0,
                borderColor: FIELD_STYLES_BORDER_COLOR,
                minHeight: 0,
                spacing: FIELD_STYLES_SPACING,
            }
        default:
            return {
                padding: FIELD_STYLES_INPUT_PADDING,
                radius: FIELD_STYLES_FIELD_RADIUS,
                borderWidth: FIELD_STYLES_BORDER_WIDTH,
                borderColor: FIELD_STYLES_BORDER_COLOR,
                minHeight: TOUCH_TARGET_MIN,
                spacing: FIELD_STYLES_SPACING,
            }
    }
}

function Skeleton({
    width = "100%",
    height = 12,
    borderRadius = 6,
    background,
    style,
}: {
    width?: number | string
    height?: number | string
    borderRadius?: number | string
    background: string
    style?: React.CSSProperties
}) {
    return (
        <div
            aria-hidden="true"
            className="be-skeleton"
            style={{
                width,
                height,
                borderRadius,
                background,
                flexShrink: 0,
                boxSizing: "border-box",
                ...style,
            }}
        />
    )
}

// SEGMENTED-MOTION (BE-090): tree-wide thumb motion prefs for the shared
// SegmentedControl (12h/24h toggle + segmented choice variant). Context — not
// props — so both consumers stay in sync without drilling through calendar and
// field layers that otherwise don't care. Tree-scoped per provider, so sibling
// engines with different settings stay isolated (rule 94). Clamped once at
// the single resolution site; the component only reads.
const SEGMENTED_MOTION_LIMITS = {
    stiffness: { min: 50, max: 1000, fallback: 400 },
    damping: { min: 5, max: 100, fallback: 38 },
} as const
const SegmentedMotionContext = React.createContext<{
    stiffness: number
    damping: number
}>({
    stiffness: SEGMENTED_MOTION_LIMITS.stiffness.fallback,
    damping: SEGMENTED_MOTION_LIMITS.damping.fallback,
})
function clampSegmentedMotion(
    raw: unknown,
    limit: { min: number; max: number; fallback: number }
): number {
    if (typeof raw !== "number" || !Number.isFinite(raw)) return limit.fallback
    return Math.min(limit.max, Math.max(limit.min, raw))
}

interface SegmentedControlProps {
    options: Array<{ label: string; value: string }>
    value: string
    onChange: (value: string) => void
    borderRadius: string | number
    textColor: string
    mutedTextColor: string
    backgroundColor: string
    borderColor: string
    ariaLabel?: string
    disabled?: boolean
    trackBackground?: string
    thumbBorderColor?: string
    optionPaddingX?: number
    optionFont?: FramerFont
    trackShadow?: string
    // Selected-state surface (BE-073): when set, the thumb + active option follow
    // the Selected Styles subgroup; unset keys inherit the option's own look.
    selectedRadius?: number | string
    selectedPaddingY?: number
    selectedPaddingX?: number
    selectedFont?: FramerFont
    selectedShadow?: string
    selectedBorderWidth?: number
    selectedBorderStyle?: string
}

const SegmentedControl = React.memo(function SegmentedControl(props: SegmentedControlProps) {
    const {
        options,
        value,
        onChange,
        borderRadius,
        textColor,
        mutedTextColor,
        backgroundColor,
        borderColor,
        ariaLabel,
        disabled,
        trackBackground,
        thumbBorderColor,
        optionPaddingX,
        optionFont,
        trackShadow,
        selectedRadius,
        selectedPaddingY,
        selectedPaddingX,
        selectedFont,
        selectedShadow,
        selectedBorderWidth,
        selectedBorderStyle,
    } = props
    const isStaticRender = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion() ?? false
    const segmentedMotion = React.useContext(SegmentedMotionContext)
    const count = options.length
    const selectedIndex = Math.max(
        0,
        options.findIndex((o) => o.value === value)
    )
    const segmentInnerRadius = innerRadiusValue(borderRadius, 3)
    // Selected thumb surface: inset follows selected padding (default 3px), width
    // math tracks it so alignment never drifts; unset keys inherit option look.
    const thumbPadY = selectedPaddingY ?? 3
    const thumbPadX = selectedPaddingX ?? 3
    const thumbWidth =
        count > 0 ? `calc((100% - ${thumbPadX * 2}px) / ${count})` : "calc(50% - 3px)"
    const thumbRadius = selectedRadius ?? segmentInnerRadius
    const thumbBorderWidth = selectedBorderWidth ?? 1
    const thumbBorderStyle = selectedBorderStyle ?? "solid"
    const effectiveTrackBackground = trackBackground ?? withAlpha(borderColor, 0.14)
    const thumbBorder = thumbBorderColor ?? borderColor
    const thumbShadow =
        selectedShadow && !isNoShadowValue(selectedShadow)
            ? selectedShadow
            : "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)"
    const segmentFontSize =
        optionFont?.fontSize != null ? (fontPixelSize(optionFont.fontSize) ?? 13) : 13
    const activeFontStyle: React.CSSProperties = selectedFont
        ? {
              ...(selectedFont.fontFamily ? { fontFamily: selectedFont.fontFamily } : {}),
              ...(selectedFont.fontSize != null
                  ? { fontSize: fontPixelSize(selectedFont.fontSize) ?? segmentFontSize }
                  : {}),
              ...(selectedFont.fontWeight != null ? { fontWeight: selectedFont.fontWeight } : {}),
              ...(selectedFont.fontStyle ? { fontStyle: selectedFont.fontStyle } : {}),
              ...(selectedFont.letterSpacing != null
                  ? { letterSpacing: selectedFont.letterSpacing }
                  : {}),
              ...(selectedFont.lineHeight != null ? { lineHeight: selectedFont.lineHeight } : {}),
          }
        : {}
    const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([])
    return (
        <fieldset
            aria-label={ariaLabel}
            style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
                background: effectiveTrackBackground,
                border: `1px solid ${borderColor}`,
                borderRadius: borderRadius,
                overflow: "hidden",
                padding: 3,
                margin: 0,
                minWidth: 0,
                gap: 0,
                boxSizing: "border-box",
                ...shadowStyle(trackShadow),
            }}
        >
            {isStaticRender ? (
                <div
                    style={{
                        position: "absolute",
                        top: thumbPadY,
                        bottom: thumbPadY,
                        left: thumbPadX,
                        width: thumbWidth,
                        transform: `translateX(${selectedIndex * 100}%)`,
                        borderRadius: thumbRadius,
                        background: backgroundColor,
                        border: `${Math.max(thumbBorderWidth, 0)}px ${thumbBorderStyle} ${thumbBorder}`,
                        boxShadow: thumbShadow,
                        pointerEvents: "none",
                    }}
                />
            ) : (
                <motion.div
                    initial={false}
                    animate={{ x: `${selectedIndex * 100}%` }}
                    transition={
                        prefersReducedMotion
                            ? { duration: 0 }
                            : {
                                  type: "spring",
                                  stiffness: segmentedMotion.stiffness,
                                  damping: segmentedMotion.damping,
                              }
                    }
                    style={{
                        position: "absolute",
                        top: thumbPadY,
                        bottom: thumbPadY,
                        left: thumbPadX,
                        width: thumbWidth,
                        borderRadius: thumbRadius,
                        background: backgroundColor,
                        border: `${Math.max(thumbBorderWidth, 0)}px ${thumbBorderStyle} ${thumbBorder}`,
                        boxShadow: thumbShadow,
                        pointerEvents: "none",
                    }}
                />
            )}
            {options.map((opt, idx) => {
                const active = opt.value === value
                return (
                    <button
                        key={`${opt.value}-${idx}`}
                        ref={(node) => {
                            buttonRefs.current[idx] = node
                        }}
                        type="button"
                        aria-pressed={active}
                        disabled={disabled}
                        onClick={() => !disabled && onChange(opt.value)}
                        onKeyDown={(e) => {
                            let targetIdx: number | null = null
                            if (e.key === "ArrowRight") targetIdx = (idx + 1) % count
                            else if (e.key === "ArrowLeft") targetIdx = (idx - 1 + count) % count
                            else if (e.key === "Home") targetIdx = 0
                            else if (e.key === "End") targetIdx = count - 1
                            if (targetIdx !== null) {
                                e.preventDefault()
                                buttonRefs.current[targetIdx]?.focus()
                            }
                        }}
                        style={{
                            position: "relative",
                            zIndex: 1,
                            width: "100%",
                            minHeight: BUTTON_MIN_HEIGHT,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding:
                                active && (selectedPaddingY != null || selectedPaddingX != null)
                                    ? `${selectedPaddingY ?? 0}px ${selectedPaddingX ?? optionPaddingX ?? 8}px`
                                    : `0 ${optionPaddingX ?? 8}px`,
                            border: "none",
                            borderRadius: segmentInnerRadius,
                            background: "transparent",
                            color: active ? textColor : mutedTextColor,
                            cursor: disabled ? "not-allowed" : "pointer",
                            fontFamily: optionFont?.fontFamily ?? "inherit",
                            fontSize: segmentFontSize,
                            fontWeight: 500,
                            ...(optionFont?.letterSpacing != null
                                ? { letterSpacing: optionFont.letterSpacing }
                                : {}),
                            ...(optionFont?.lineHeight != null
                                ? { lineHeight: optionFont.lineHeight }
                                : {}),
                            ...(active ? activeFontStyle : {}),
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {opt.label}
                    </button>
                )
            })}
        </fieldset>
    )
})

if (typeof window !== "undefined") {
    ;(window as unknown as Record<string, unknown>).__BE_SEGMENTED_SHARED__ = true
}

interface OptionImageSource {
    src?: string
    srcSet?: string
    alt?: string
}

function optionImageSrc(image: string | OptionImageSource | undefined): string | undefined {
    if (typeof image === "string") return image || undefined
    return image?.src || undefined
}

interface ChoiceOption {
    label: string
    value?: string
    glyph?: string
    image?: string | OptionImageSource
    description?: string
    disabled?: boolean
}

function optionValue(option: ChoiceOption): string {
    return option.value ?? option.label
}

interface ChoiceGroupInlineProps {
    label: string
    inputName: string
    variant: "cards" | "segmented" | "pills" | "radio"
    optionsText: string
    /** Direct options array — takes precedence over optionsText and avoids
     *  the comma-round-trip split bug (fix #22). */
    options?: ChoiceOption[]
    accentColor: string
    accentForegroundColor?: string
    textColor: string
    mutedTextColor: string
    backgroundColor: string
    borderColor: string
    radius: number | string
    fontSize: number
    controlledValue?: string
    /** a11y: marks the group as invalid (fix #16). */
    ariaInvalid?: boolean
    /** a11y: id of an element describing the error (fix #16). */
    ariaDescribedBy?: string
    /** a11y: accessible name for the radiogroup when `label` is absent
     *  (threaded from FieldRenderer's fixed ARIA constants). */
    choiceGroupAriaLabel?: string
    showLabel?: boolean
    required?: boolean
    isSubmitting?: boolean
    onChange?: (value: string) => void
    selectedBackgroundColor?: string
    selectedTextColor?: string
    selectedBorderColor?: string
    selectedBorderWidth?: number
    selectedBorderStyle?: string
    selectedRadius?: number | string
    selectedPaddingY?: number
    selectedPaddingX?: number
    selectedFont?: FramerFont
    selectedShadow?: string
    optionHoverBorderColor?: string
    optionBorderWidth?: number
    optionRadius?: number | string
    optionPaddingY?: number
    optionPaddingX?: number
    optionMinHeight?: number
    optionFont?: FramerFont
    optionShadow?: string
    trackBackground?: string
    /** CARDS-GRID (BE-053): true = auto-fit tracks so options share the
     *  full row (Width Full); false = auto-fill fixed tracks (Width Fit). */
    fillRow?: boolean
}

function getFirstNonEmptyOption(options: ChoiceOption[]): string {
    if (options.length === 0) return ""
    const fallback = options.find((option) => option.label.length > 0)
    return fallback ? optionValue(fallback) : ""
}

function buildWeekdayLabels(firstDayOfWeek: number): string[] {
    const base = new Date(2023, 0, 1) // a known Sunday
    const labels: string[] = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(base)
        d.setDate(base.getDate() + ((firstDayOfWeek + i) % 7))
        labels.push(getCachedDateTimeFormat(pageLocale(), { weekday: "short" }).format(d))
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
        variant,
        optionsText,
        options: directOptions,
        accentColor,
        accentForegroundColor,
        textColor,
        mutedTextColor,
        backgroundColor,
        borderColor,
        radius,
        fontSize,
        controlledValue,
        ariaInvalid,
        ariaDescribedBy,
        choiceGroupAriaLabel,
        required,
        onChange,
        isSubmitting = false,
        showLabel = true,
        selectedBackgroundColor,
        selectedTextColor: selectedTextColorOverride,
        selectedBorderColor,
        selectedBorderWidth,
        selectedBorderStyle,
        selectedRadius,
        selectedPaddingY,
        selectedPaddingX,
        selectedFont,
        selectedShadow,
        optionHoverBorderColor,
        optionBorderWidth,
        optionRadius,
        optionPaddingY,
        optionPaddingX,
        optionMinHeight,
        optionFont,
        optionShadow,
        trackBackground,
        fillRow = false,
    } = props

    const reducedMotion = useReducedMotion() ?? false

    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([])

    const parsedOptions = React.useMemo(
        () => directOptions || parseOptionsText(optionsText),
        [directOptions, optionsText]
    )

    const [measuredWidth, setMeasuredWidth] = React.useState<number>(320)
    const beInteractive = useBeInteractive()
    const [internalSelected, setInternalSelected] = React.useState<string>(() =>
        controlledValue !== undefined &&
        parsedOptions.some((option) => optionValue(option) === controlledValue)
            ? controlledValue
            : getFirstNonEmptyOption(parsedOptions)
    )
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null)
    const firedInitialRef = React.useRef(false)
    const lastUserPickRef = React.useRef<string | null>(null)

    const selected =
        controlledValue !== undefined
            ? parsedOptions.some((option) => optionValue(option) === controlledValue)
                ? controlledValue
                : parsedOptions[0]
                  ? optionValue(parsedOptions[0])
                  : controlledValue
            : internalSelected
    const formValue = controlledValue !== undefined ? controlledValue : internalSelected
    const tabbableOptionIndex = (() => {
        const selIdx = parsedOptions.findIndex((o) => optionValue(o) === selected && !o.disabled)
        if (selIdx >= 0) return selIdx
        return parsedOptions.findIndex((o) => !o.disabled)
    })()

    React.useEffect(() => {
        if (controlledValue !== undefined) return
        const next = getFirstNonEmptyOption(parsedOptions)
        React.startTransition(() => setInternalSelected(next))
    }, [parsedOptions, controlledValue])

    React.useEffect(() => {
        if (controlledValue === undefined) return
        if (parsedOptions.length === 0) return
        const next = parsedOptions.some((option) => optionValue(option) === controlledValue)
            ? controlledValue
            : getFirstNonEmptyOption(parsedOptions)
        if (next === internalSelected) return
        React.startTransition(() => setInternalSelected(next))
    }, [controlledValue, parsedOptions, internalSelected])

    React.useEffect(() => {
        if (controlledValue === undefined) return
        if (lastUserPickRef.current === controlledValue) {
            lastUserPickRef.current = null
            return
        }
        const idx = parsedOptions.findIndex((option) => optionValue(option) === controlledValue)
        if (idx < 0 && parsedOptions.length === 0) return
        const focusIdx = idx >= 0 ? idx : 0
        const focusRaf = requestAnimationFrame(() => {
            buttonRefs.current[focusIdx]?.focus()
        })
        return () => cancelAnimationFrame(focusRaf)
    }, [controlledValue, parsedOptions])

    React.useEffect(() => {
        let focusRaf = 0
        if (focusedIndex !== null && focusedIndex >= parsedOptions.length) {
            const clamped = Math.max(0, parsedOptions.length - 1)
            if (parsedOptions.length === 0) {
                setFocusedIndex(null)
            } else {
                setFocusedIndex(clamped)
                focusRaf = requestAnimationFrame(() => {
                    buttonRefs.current[clamped]?.focus()
                })
            }
        }
        if (hoveredIndex !== null && hoveredIndex >= parsedOptions.length) {
            setHoveredIndex(null)
        }
        return () => {
            if (focusRaf) cancelAnimationFrame(focusRaf)
        }
    }, [parsedOptions, focusedIndex, hoveredIndex])

    React.useEffect(() => {
        if (parsedOptions.length > 0) {
            firedInitialRef.current = false
        }
    }, [parsedOptions])

    React.useEffect(() => {
        if (!beInteractive) return
        if (firedInitialRef.current) return
        if (controlledValue !== undefined) return
        if (parsedOptions.length === 0) return
        firedInitialRef.current = true
        onChange?.(
            controlledValue !== undefined &&
                parsedOptions.some((option) => optionValue(option) === controlledValue)
                ? controlledValue
                : getFirstNonEmptyOption(parsedOptions)
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [beInteractive, parsedOptions, controlledValue])

    useIsomorphicLayoutEffect(() => {
        if (!beInteractive) return
        if (typeof window !== "undefined" && typeof ResizeObserver !== "undefined") {
            if (!rootRef.current) return
            const initialWidth = rootRef.current.clientWidth
            if (initialWidth > 0) {
                React.startTransition(() => setMeasuredWidth(initialWidth))
            }
            const observer = new ResizeObserver((entries) => {
                const width = entries[0]?.contentRect?.width
                if (typeof width === "number") {
                    React.startTransition(() => setMeasuredWidth(width))
                }
            })
            observer.observe(rootRef.current)
            return () => observer.disconnect()
        }
    }, [beInteractive])

    const selectedTextColor = selectedTextColorOverride ?? accentForegroundColor ?? TEXT_ON_ACCENT
    const selectedSurface = selectedBackgroundColor ?? accentColor
    const selectedRing = selectedBorderColor ?? accentColor
    const hoverRing = optionHoverBorderColor ?? selectedRing
    const optionBorder = optionBorderWidth ?? 1
    // SELECTED-STYLES (BE-024): full-vocabulary overrides apply to the
    // selected option only; unset keys keep the option's own look.
    const selectedFontExtraStyle: React.CSSProperties = {
        ...(selectedFont?.fontFamily ? { fontFamily: selectedFont.fontFamily } : {}),
        ...(selectedFont?.fontWeight != null ? { fontWeight: selectedFont.fontWeight } : {}),
        ...(selectedFont?.fontStyle ? { fontStyle: selectedFont.fontStyle } : {}),
        ...(selectedFont?.letterSpacing != null
            ? { letterSpacing: selectedFont.letterSpacing }
            : {}),
        ...(selectedFont?.lineHeight != null ? { lineHeight: selectedFont.lineHeight } : {}),
    }
    const compact = measuredWidth < COMPACT_BREAKPOINT
    const effectiveFontSize =
        optionFont?.fontSize != null
            ? (fontPixelSize(optionFont.fontSize) ?? Math.max(14, fontSize))
            : Math.max(14, fontSize)
    const optionFontExtraStyle: React.CSSProperties = {
        ...(optionFont?.fontFamily ? { fontFamily: optionFont.fontFamily } : {}),
        ...(optionFont?.fontWeight != null ? { fontWeight: optionFont.fontWeight } : {}),
        ...(optionFont?.fontStyle ? { fontStyle: optionFont.fontStyle } : {}),
        ...(optionFont?.letterSpacing != null ? { letterSpacing: optionFont.letterSpacing } : {}),
        ...(optionFont?.lineHeight != null ? { lineHeight: optionFont.lineHeight } : {}),
    }

    const selectOption = React.useCallback(
        (option: ChoiceOption) => {
            if (isSubmitting) return
            if (option.disabled) return
            const value = optionValue(option)
            lastUserPickRef.current = value
            if (controlledValue === undefined) {
                React.startTransition(() => setInternalSelected(value))
            }
            onChange?.(value)
        },
        [onChange, controlledValue, isSubmitting]
    )

    const moveFocus = React.useCallback(
        (currentIndex: number, delta: number) => {
            const count = parsedOptions.length
            if (count === 0) return
            for (let step = 1; step <= count; step += 1) {
                const nextIndex = (currentIndex + delta * step + count * step) % count
                const next = parsedOptions[nextIndex]
                if (!next || next.disabled) continue
                buttonRefs.current[nextIndex]?.focus()
                React.startTransition(() => setFocusedIndex(nextIndex))
                selectOption(next)
                return
            }
        },
        [parsedOptions, selectOption]
    )

    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
            if (event.key === " ") {
                event.preventDefault()
                return
            }
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
                if (first) selectOption(first)
            } else if (event.key === "End") {
                event.preventDefault()
                const lastIndex = parsedOptions.length - 1
                if (lastIndex >= 0) {
                    buttonRefs.current[lastIndex]?.focus()
                    const last = parsedOptions[lastIndex]
                    if (last) selectOption(last)
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

    const selectedIndex = selected
        ? parsedOptions.findIndex((o) => optionValue(o) === selected)
        : -1

    const selectedStyleOverride: React.CSSProperties = {
        ...(selectedRadius != null ? { borderRadius: selectedRadius } : {}),
        ...(selectedPaddingY != null || selectedPaddingX != null
            ? {
                  padding: `${selectedPaddingY ?? 10}px ${selectedPaddingX ?? 14}px`,
              }
            : {}),
        ...(selectedBorderWidth != null
            ? {
                  border: `${Math.max(selectedBorderWidth, 0)}px ${selectedBorderStyle ?? "solid"} ${selectedRing}`,
              }
            : {}),
        ...(selectedFont?.fontSize != null
            ? { fontSize: fontPixelSize(selectedFont.fontSize) ?? effectiveFontSize }
            : {}),
        ...selectedFontExtraStyle,
        ...(!isNoShadowValue(selectedShadow) && selectedShadow
            ? {
                  boxShadow: [`inset 0 0 0 1px ${selectedRing}`, selectedShadow].join(", "),
              }
            : {}),
    }

    const renderOptionButton = (
        option: ChoiceOption,
        index: number,
        extraStyle: React.CSSProperties = {},
        labelExtraStyle: React.CSSProperties = {}
    ) => {
        const isHovered = hoveredIndex === index
        const isSelected = selectedIndex === index
        const showMedia = variant === "cards" || variant === "radio"
        return (
            /* biome-ignore lint/a11y/useSemanticElements: intentional custom radio
               button — a native <input type="radio"> cannot carry the
               card/pill/segmented visual system. The full radiogroup contract
               (roving tabindex, arrow-key navigation, aria-checked) is
               implemented below, so SR/keyboard behavior is equivalent. */
            <button
                key={`${option.label}-${index}`}
                ref={(node) => {
                    buttonRefs.current[index] = node
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isSubmitting}
                aria-disabled={option.disabled || undefined}
                aria-invalid={ariaInvalid || undefined}
                aria-describedby={ariaDescribedBy}
                tabIndex={index === tabbableOptionIndex ? 0 : -1}
                onClick={() => selectOption(option)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onMouseEnter={() => React.startTransition(() => setHoveredIndex(index))}
                onMouseLeave={() => React.startTransition(() => setHoveredIndex(null))}
                onFocus={() => React.startTransition(() => setFocusedIndex(index))}
                onBlur={() => React.startTransition(() => setFocusedIndex(null))}
                style={{
                    minHeight: optionMinHeight ?? 23,
                    minWidth: TOUCH_TARGET_MIN,
                    borderRadius: optionRadius ?? radius,
                    border: `${optionBorder}px solid ${
                        isSelected ? selectedRing : isHovered ? hoverRing : borderColor
                    }`,
                    background: isSelected ? selectedSurface : backgroundColor,
                    color: option.disabled
                        ? mutedTextColor
                        : isSelected
                          ? selectedTextColor
                          : textColor,
                    cursor: isSubmitting || option.disabled ? "not-allowed" : "pointer",
                    opacity: isSubmitting || option.disabled ? 0.5 : 1,
                    boxShadow:
                        [
                            // The selected ring follows the selected border width: an
                            // explicit 0 removes the outline entirely (it is visually
                            // indistinguishable from a border); unset keeps today's ring.
                            isSelected && selectedBorderWidth !== 0
                                ? `inset 0 0 0 1px ${selectedRing}`
                                : null,
                            !isNoShadowValue(optionShadow) && optionShadow ? optionShadow : null,
                        ]
                            .filter(Boolean)
                            .join(", ") || "none",
                    fontFamily: optionFont?.fontFamily ?? "inherit",
                    fontSize: effectiveFontSize,
                    lineHeight: 1.2,
                    ...optionFontExtraStyle,
                    overflow: "hidden",
                    transition: reducedMotion
                        ? "none"
                        : "border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease",
                    ...extraStyle,
                    ...(isSelected ? selectedStyleOverride : {}),
                }}
            >
                {variant === "radio" ? (
                    <span
                        aria-hidden="true"
                        style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${isSelected ? selectedTextColor : borderColor}`,
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
                {showMedia && option.image && optionImageSrc(option.image) ? (
                    <img
                        src={optionImageSrc(option.image)}
                        srcSet={typeof option.image === "object" ? option.image.srcSet : undefined}
                        alt={
                            typeof option.image === "object" && option.image.alt
                                ? option.image.alt
                                : ""
                        }
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
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
                        aria-hidden="true"
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
                                whiteSpace: "normal",
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
                                    color: isSelected ? selectedTextColor : mutedTextColor,
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
                            whiteSpace: variant === "pills" ? "nowrap" : "normal",
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
                            color: isSelected ? selectedTextColor : mutedTextColor,
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
            <input type="hidden" name={inputName} value={formValue} aria-hidden="true" />
            {label && showLabel ? (
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
            {parsedOptions.length === 0 ? (
                <div
                    style={{
                        padding: "12px 14px",
                        borderRadius: radius,
                        border: `1px dashed ${borderColor}`,
                        color: mutedTextColor,
                        fontSize: 13,
                        fontFamily: "inherit",
                    }}
                >
                    {choiceGroupAriaLabel}
                </div>
            ) : null}
            {variant === "cards" ? (
                <div
                    role="radiogroup"
                    aria-label={label || choiceGroupAriaLabel || inputName}
                    aria-invalid={ariaInvalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    aria-required={required || undefined}
                    style={{
                        ...groupCommonStyle,
                        display: "grid",
                        gridTemplateColumns: fillRow
                            ? `repeat(auto-fit, minmax(${CARDS_GRID_MIN_TRACK_PX}px, 1fr))`
                            : `repeat(auto-fill, minmax(${CARDS_GRID_MIN_TRACK_PX}px, 1fr))`,
                        gap: compact ? 6 : 8,
                        minWidth: 0,
                    }}
                >
                    {parsedOptions.map((option, index) =>
                        renderOptionButton(option, index, {
                            padding: `${optionPaddingY ?? 10}px ${optionPaddingX ?? (compact ? 6 : 8)}px`,
                            textAlign: "center",
                            minWidth: 0,
                        })
                    )}
                </div>
            ) : null}
            {variant === "segmented" ? (
                <SegmentedControl
                    options={parsedOptions.map((o) => ({ label: o.label, value: optionValue(o) }))}
                    value={selected}
                    onChange={(val) => {
                        const opt = parsedOptions.find((o) => optionValue(o) === val)
                        if (opt) selectOption(opt)
                    }}
                    borderRadius={optionRadius ?? 16}
                    textColor={selectedTextColor}
                    mutedTextColor={textColor}
                    backgroundColor={selectedSurface}
                    trackBackground={trackBackground}
                    thumbBorderColor={selectedRing}
                    optionPaddingX={optionPaddingX}
                    optionFont={optionFont}
                    trackShadow={optionShadow}
                    borderColor={borderColor}
                    selectedRadius={selectedRadius}
                    selectedPaddingY={selectedPaddingY}
                    selectedPaddingX={selectedPaddingX}
                    selectedFont={selectedFont}
                    selectedShadow={selectedShadow}
                    selectedBorderWidth={selectedBorderWidth}
                    selectedBorderStyle={selectedBorderStyle}
                    ariaLabel={label || choiceGroupAriaLabel || inputName}
                    disabled={isSubmitting}
                />
            ) : null}
            {variant === "radio" ? (
                <div
                    role="radiogroup"
                    aria-label={label || choiceGroupAriaLabel || inputName}
                    aria-invalid={ariaInvalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    aria-required={required || undefined}
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
                            padding: `${optionPaddingY ?? 10}px ${optionPaddingX ?? 14}px`,
                            flexShrink: 0,
                        })
                    )}
                </div>
            ) : null}
            {variant === "pills" ? (
                <div
                    role="radiogroup"
                    aria-label={label || choiceGroupAriaLabel || inputName}
                    aria-invalid={ariaInvalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    aria-required={required || undefined}
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
                            padding: `${optionPaddingY ?? 10}px ${optionPaddingX ?? (compact ? 10 : 12)}px`,
                            borderRadius: optionRadius ?? 999,
                            flex:
                                measuredWidth < PILLS_TWO_PER_ROW_BREAKPOINT
                                    ? "1 1 calc(50% - 4px)"
                                    : "0 1 auto",
                            minWidth:
                                measuredWidth < PILLS_TWO_PER_ROW_BREAKPOINT
                                    ? "calc(50% - 4px)"
                                    : 60,
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

interface CalendarCellProps {
    date: Date
    dateKey: string
    isUnavailable: boolean
    isSelected: boolean
    isToday: boolean
    isRingHover: boolean
    isActive: boolean
    firstDayOfWeek: number
    locale?: string
    isNarrow: boolean
    timeZone?: string
    accentColor: string
    borderColor: string
    subtleFill: string
    textColor: string
    selectedAccentText: string
    mutedSoftText: string
    tileFont?: FramerFont
    borderRadius: string | number
    onSelect: (date: Date) => void
    onMoveFocus: (date: Date) => void
    onGoToNextMonth: (focusAfter?: boolean) => void
    onGoToPreviousMonth: (focusAfter?: boolean) => void
    onHoverChange: (dateKey: string | null) => void
    onFocusChange: (dateKey: string | null) => void
}

const CalendarCell = React.memo(function CalendarCell({
    date,
    dateKey,
    isUnavailable,
    isSelected,
    isToday,
    isRingHover,
    isActive,
    firstDayOfWeek,
    locale,
    isNarrow,
    timeZone,
    accentColor,
    borderColor,
    subtleFill,
    textColor,
    selectedAccentText,
    mutedSoftText,
    tileFont,
    borderRadius,
    onSelect,
    onMoveFocus,
    onGoToNextMonth,
    onGoToPreviousMonth,
    onHoverChange,
    onFocusChange,
}: CalendarCellProps) {
    const reducedMotion = useReducedMotion() ?? false
    return (
        /* biome-ignore lint/a11y/useSemanticElements lint/a11y/useFocusableInteractive: CSS-grid datepicker cell, roving tabindex (rules 63/64); native td cannot do display:grid. */
        <div
            role="gridcell"
            aria-selected={isSelected}
            aria-current={isToday ? "date" : undefined}
            style={{
                minHeight: TOUCH_TARGET_MIN,
                minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN,
            }}
        >
            <button
                type="button"
                disabled={isUnavailable}
                tabIndex={isUnavailable || !isActive ? -1 : 0}
                data-date-key={dateKey}
                data-be-active-date={!isUnavailable && isActive ? "true" : undefined}
                aria-label={
                    getCachedDateTimeFormat(locale, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        ...(isValidTimeZone(timeZone) ? { timeZone } : {}),
                    }).format(date) + (isToday ? " (Today)" : "")
                }
                onMouseEnter={() => {
                    if (!isUnavailable) React.startTransition(() => onHoverChange(dateKey))
                }}
                onMouseLeave={() => {
                    if (!isUnavailable) React.startTransition(() => onHoverChange(null))
                }}
                onFocus={() => React.startTransition(() => onFocusChange(`date-${dateKey}`))}
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
                        const offset = (date.getDay() - firstDayOfWeek + 7) % 7
                        const target = new Date(date)
                        target.setDate(date.getDate() - offset)
                        onMoveFocus(target)
                    } else if (e.key === "End") {
                        e.preventDefault()
                        const offset = (date.getDay() - firstDayOfWeek + 7) % 7
                        const target = new Date(date)
                        target.setDate(date.getDate() + (6 - offset))
                        onMoveFocus(target)
                    } else if (e.key === "PageDown") {
                        e.preventDefault()
                        onGoToNextMonth(true)
                    } else if (e.key === "PageUp") {
                        e.preventDefault()
                        onGoToPreviousMonth(true)
                    }
                }}
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius,
                    border: `1px solid ${isUnavailable ? "transparent" : borderColor}`,
                    background: isSelected
                        ? accentColor
                        : isUnavailable
                          ? "transparent"
                          : subtleFill,
                    color: isSelected
                        ? selectedAccentText
                        : isUnavailable
                          ? mutedSoftText
                          : textColor,
                    cursor: isUnavailable ? "default" : "pointer",
                    fontFamily: tileFont?.fontFamily ?? "inherit",
                    fontSize: fontPixelSize(tileFont?.fontSize) ?? 14,
                    ...(tileFont?.lineHeight != null ? { lineHeight: tileFont.lineHeight } : {}),
                    transition: reducedMotion
                        ? "none"
                        : "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, color 0.16s ease",
                    boxShadow:
                        isSelected || isRingHover ? `inset 0 0 0 2px ${accentColor}` : "none",
                    fontWeight: 500,
                }}
            >
                <span
                    style={{
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {Number(getDateKeyInTimeZone(date, timeZone || "").slice(-2))}
                    {isToday && !isSelected ? (
                        <span
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                bottom: 3,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "currentColor",
                                pointerEvents: "none",
                            }}
                        />
                    ) : null}
                </span>
            </button>
        </div>
    )
})

interface CalendarGridProps {
    instanceId: string
    monthName: string
    yearLabel: string
    prevMonthLabel: string
    nextMonthLabel: string
    previousMonthAriaTemplate: string
    nextMonthAriaTemplate: string
    canGoPrev: boolean
    canGoNext: boolean
    weekdayLabels: string[]
    cells: Date[]
    visibleMonth: Date
    selectedDate: Date | null
    today: Date
    clockReady: boolean
    slotsLoading: boolean
    hoveredDateKey: string | null
    isNarrow: boolean
    firstDayOfWeek: number
    dateKeyOf: (date: Date) => string
    hasAvailability: (date: Date) => boolean
    activeDateKey: string | null
    locale?: string
    timeZone?: string
    accentColor: string
    borderColor: string
    subtleFill: string
    textColor: string
    selectedAccentText: string
    mutedSoftText: string
    mutedText: string
    tileFont?: FramerFont
    borderRadius: string | number
    onPrevMonth: (focusAfter?: boolean) => void
    onNextMonth: (focusAfter?: boolean) => void
    onSelectDate: (date: Date) => void
    onMoveFocus: (date: Date) => void
    onHoverChange: (dateKey: string | null) => void
    onFocusChange: (dateKey: string | null) => void
}

const CalendarGrid = React.memo(function CalendarGrid({
    instanceId,
    monthName,
    yearLabel,
    prevMonthLabel,
    nextMonthLabel,
    previousMonthAriaTemplate,
    nextMonthAriaTemplate,
    canGoPrev,
    canGoNext,
    weekdayLabels,
    cells,
    visibleMonth,
    selectedDate,
    today,
    clockReady,
    slotsLoading,
    hoveredDateKey,
    isNarrow,
    firstDayOfWeek,
    dateKeyOf,
    hasAvailability,
    activeDateKey,
    locale,
    timeZone,
    accentColor,
    borderColor,
    subtleFill,
    textColor,
    selectedAccentText,
    mutedSoftText,
    mutedText,
    tileFont,
    borderRadius,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
    onMoveFocus,
    onHoverChange,
    onFocusChange,
}: CalendarGridProps) {
    const gridLabelId = instanceId
        ? `${instanceId}-be-calendar-grid-label`
        : "be-calendar-grid-label"
    const [hoveredNav, setHoveredNav] = React.useState<"prev" | "next" | null>(null)
    const rows: React.ReactNode[] = []
    const weeksToRender = weeksInMonthView(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth(),
        firstDayOfWeek
    )
    if (!clockReady || slotsLoading) {
        for (let r = 0; r < weeksToRender; r++) {
            rows.push(
                <div key={`skeleton-row-${r}`} style={{ display: "contents" }}>
                    {Array.from({ length: 7 }).map((_, c) => (
                        <div
                            aria-hidden="true"
                            key={`skeleton-${r}-${c}`}
                            style={{
                                minHeight: TOUCH_TARGET_MIN,
                                minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN,
                                borderRadius,
                                background: subtleFill,
                            }}
                        />
                    ))}
                </div>
            )
        }
    } else {
        for (let r = 0; r < weeksToRender; r++) {
            rows.push(
                /* biome-ignore lint/a11y/useFocusableInteractive: row is a structural
                       grouping only (display: contents) — focus lives on the cells
                       via the roving-tabindex contract; making the row tabbable would
                       add a dead stop. */
                // biome-ignore lint/a11y/useSemanticElements: see CSS-grid calendar note above.
                <div role="row" key={`row-${r}`} style={{ display: "contents" }}>
                    {cells.slice(r * 7, r * 7 + 7).map((date) => {
                        const dateKey = dateKeyOf(date)
                        const isInMonth = date.getMonth() === visibleMonth.getMonth()
                        if (!isInMonth) {
                            return (
                                /* biome-ignore lint/a11y/useFocusableInteractive lint/a11y/useSemanticElements: blank out-of-month cell — aria-hidden, never operable (rule 149). */
                                <div
                                    key={`empty-${dateKey}`}
                                    role="gridcell"
                                    aria-hidden="true"
                                    style={{
                                        minHeight: TOUCH_TARGET_MIN,
                                        minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN,
                                    }}
                                />
                            )
                        }
                        const isPast = startOfDay(date).getTime() < today.getTime()
                        const isUnavailable = isPast || !hasAvailability(date)
                        const isSelected = isSameDay(selectedDate, date)
                        const isToday = isSameDay(today, date)
                        const isActive =
                            activeDateKey !== null && dateKey === activeDateKey && !isUnavailable
                        const isRingHover =
                            hoveredDateKey === dateKey && !isUnavailable && !isSelected
                        return (
                            <CalendarCell
                                key={dateKey}
                                date={date}
                                dateKey={dateKey}
                                isUnavailable={isUnavailable}
                                isSelected={isSelected}
                                isToday={isToday}
                                isRingHover={isRingHover}
                                isActive={isActive}
                                firstDayOfWeek={firstDayOfWeek}
                                locale={locale}
                                isNarrow={isNarrow}
                                timeZone={timeZone}
                                accentColor={accentColor}
                                borderColor={borderColor}
                                subtleFill={subtleFill}
                                textColor={textColor}
                                selectedAccentText={selectedAccentText}
                                mutedSoftText={mutedSoftText}
                                tileFont={tileFont}
                                borderRadius={borderRadius}
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
                        id={gridLabelId}
                        tabIndex={activeDateKey ? -1 : 0}
                        data-be-month-heading
                        style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: 16,
                        }}
                    >
                        <output aria-live="polite" aria-atomic="true">
                            {clockReady ? (
                                monthName
                            ) : (
                                <span
                                    aria-hidden="true"
                                    style={{
                                        display: "inline-block",
                                        width: 96,
                                        height: 14,
                                        borderRadius: 6,
                                        background: subtleFill,
                                        verticalAlign: "middle",
                                    }}
                                />
                            )}
                            <span
                                style={{
                                    marginLeft: 6,
                                    color: mutedText,
                                    fontSize: 16,
                                    fontWeight: 500,
                                }}
                            >
                                {clockReady ? (
                                    yearLabel
                                ) : (
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            display: "inline-block",
                                            width: 52,
                                            height: 12,
                                            borderRadius: 6,
                                            background: subtleFill,
                                            verticalAlign: "middle",
                                        }}
                                    />
                                )}
                            </span>
                        </output>
                    </h3>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <button
                        type="button"
                        aria-label={previousMonthAriaTemplate.replace("{month}", prevMonthLabel)}
                        onClick={() => onPrevMonth()}
                        onMouseEnter={() => canGoPrev && setHoveredNav("prev")}
                        onMouseLeave={() => setHoveredNav((v) => (v === "prev" ? null : v))}
                        disabled={!canGoPrev}
                        style={{
                            appearance: "none",
                            background:
                                hoveredNav === "prev" && canGoPrev ? borderColor : "transparent",
                            color: canGoPrev ? mutedText : mutedSoftText,
                            border: "none",
                            borderRadius,
                            width: "auto",
                            height: "auto",
                            padding: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: canGoPrev ? "pointer" : "not-allowed",
                            opacity: canGoPrev ? 0.8 : 0.4,
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
                        aria-label={nextMonthAriaTemplate.replace("{month}", nextMonthLabel)}
                        onClick={() => onNextMonth()}
                        onMouseEnter={() => canGoNext && setHoveredNav("next")}
                        onMouseLeave={() => setHoveredNav((v) => (v === "next" ? null : v))}
                        disabled={!canGoNext}
                        style={{
                            appearance: "none",
                            background:
                                hoveredNav === "next" && canGoNext ? borderColor : "transparent",
                            color: canGoNext ? mutedText : mutedSoftText,
                            border: "none",
                            borderRadius,
                            width: "auto",
                            height: "auto",
                            padding: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: canGoNext ? "pointer" : "not-allowed",
                            opacity: canGoNext ? 0.8 : 0.4,
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

            {/* biome-ignore lint/a11y/useSemanticElements: CSS-grid calendar with the
               W3C grid role pattern — native <table> markup cannot host the
               display:grid / display:contents layout this component uses. */}
            <div
                role="grid"
                aria-labelledby={gridLabelId}
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: isNarrow ? 4 : 6,
                }}
            >
                {/* biome-ignore lint/a11y/useFocusableInteractive lint/a11y/useSemanticElements: structural
                   header row (display: contents) inside the CSS-grid calendar — no focus or
                   native <table> markup belongs here. */}
                <div role="row" style={{ display: "contents" }}>
                    {weekdayLabels.map((label) => (
                        /* biome-ignore lint/a11y/useSemanticElements lint/a11y/useFocusableInteractive: CSS-grid
                           header cell — a weekday label, not a native <th> or a control. */
                        <div
                            role="columnheader"
                            key={label}
                            style={{
                                textAlign: "center",
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: textColor,
                                opacity: 0.82,
                                padding: "4px 0",
                                marginBottom: 8,
                            }}
                        >
                            {label.toUpperCase()}
                        </div>
                    ))}
                </div>
                {rows}
            </div>
        </>
    )
})

const SELECTED_SLOT_KEY = "__selectedSlot" as const

interface BookingPayload {
    date: Date
    time24h: string
    timeLabel: string
    /** Optional Cal.com slot end (ISO string) - used for ICS DTEND. */
    end?: string
}

type BookingValues = Record<string, string | boolean | Array<string> | undefined> & {
    [SELECTED_SLOT_KEY]?: BookingPayload
}

function isFieldValue(v: unknown): v is string | boolean | Array<string> | undefined {
    return (
        v === undefined ||
        typeof v === "string" ||
        typeof v === "boolean" ||
        (Array.isArray(v) && v.every((item) => typeof item === "string"))
    )
}

type RestoredBookingPayload = Omit<BookingPayload, "date"> & {
    date: string | Date
}
function isBookingPayload(v: unknown): v is RestoredBookingPayload {
    if (typeof v !== "object" || v === null) return false
    const o = v as Record<string, unknown>
    const rawDate = o.date
    const dateOk =
        (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) ||
        (typeof rawDate === "string" && rawDate.length > 0)
    return (
        dateOk &&
        typeof o.time24h === "string" &&
        o.time24h.length > 0 &&
        typeof o.timeLabel === "string" &&
        o.timeLabel.length > 0 &&
        (o.end === undefined || (typeof o.end === "string" && o.end.length > 0))
    )
}

interface TimeSlotListProps {
    isNarrow: boolean
    activeTimeFormat: "12h" | "24h"
    setActiveTimeFormat: (format: "12h" | "24h") => void
    onTimeFormatChange?: (format: "12h" | "24h") => void
    focusedKey: string | null
    setFocusedKey: (key: string | null) => void
    prefersReducedMotion: boolean
    accentColor: string
    softerFill: string
    subtleBorder: string
    borderColor: string
    textColor: string
    selectedAccentText: string
    selectedSurface?: string
    selectedText?: string
    mutedText: string
    mutedSoftText: string
    backgroundColor: string
    loadingLabel: string
    slotsLoading: boolean
    selectionPending?: boolean
    selectedDate: Date | null
    /** W2-51: the default/active date when nothing is selected yet (today) —
     *  keeps the time header populated on first entry. */
    fallbackDate: Date
    clockReady: boolean
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
    borderRadius: string | number
    pickDateToSeeTimesLabel: string
    noTimesFallbackLabel: string
    timeSlotsAriaLabel: string
    availableTimesAriaLabel: string
    /** W1-10-A1 fix: marks the slot radiogroup as required. The datetime
     *  step always requires a picked slot, so callers pass `true`. */
    required?: boolean
    timeZone?: string
    slotDateLabel?: string
    slotError?: string | null
    slotErrorId?: string
}

const TimeSlotButton = React.memo(function TimeSlotButton(props: {
    value: string
    label: string
    selected: boolean
    elapsed: boolean
    hovered: boolean
    isNarrow: boolean
    accentColor: string
    borderColor: string
    mutedSoftText: string
    textColor: string
    selectedSurface: string
    selectedText: string
    radius: string | number
    onSelect: (value: string) => void
    setHoveredTime: (time: string | null) => void
    setFocusedKey: (key: string | null) => void
    isInitialFocus: boolean
    /** W1-10-A13 fix: chosen timezone for the aria-label (see
     *  TimeSlotListProps.timeZone). */
    timeZone?: string
    slotDateLabel?: string
}) {
    const {
        value,
        label,
        selected,
        elapsed,
        hovered,
        isNarrow,
        accentColor,
        borderColor,
        mutedSoftText,
        textColor,
        selectedSurface,
        selectedText,
        radius,
        onSelect,
        setHoveredTime,
        setFocusedKey,
        isInitialFocus,
        timeZone,
        slotDateLabel,
    } = props
    const reducedMotion = useReducedMotion() ?? false
    return (
        /* biome-ignore lint/a11y/useSemanticElements: intentional custom radio
           button — a native <input type="radio"> cannot host the styled slot
           pill, hover/selected states, and roving-tabindex contract (T5-H3/T5-M1). */
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={[label, slotDateLabel, timeZone].filter(Boolean).join(", ")}
            disabled={elapsed}
            tabIndex={elapsed ? -1 : selected ? 0 : isInitialFocus ? 0 : -1}
            onMouseEnter={() => {
                if (elapsed) return
                React.startTransition(() => setHoveredTime(value))
            }}
            onMouseLeave={() => React.startTransition(() => setHoveredTime(null))}
            onFocus={() => React.startTransition(() => setFocusedKey(`time-${value}`))}
            onBlur={() => React.startTransition(() => setFocusedKey(null))}
            onClick={() => {
                if (elapsed) return
                onSelect(value)
            }}
            style={{
                height: 36,
                minHeight: 36,
                border: `1px solid ${hovered ? accentColor : borderColor}`,
                borderRadius: radius,
                padding: isNarrow ? "0 10px" : "0 12px",
                background: selected ? selectedSurface : "transparent",
                color: elapsed
                    ? mutedSoftText
                    : selected
                      ? selectedText
                      : withAlpha(textColor, 0.75),
                fontSize: 14,
                fontWeight: 600,
                cursor: elapsed ? "not-allowed" : "pointer",
                opacity: elapsed ? 0.5 : 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: reducedMotion
                    ? "none"
                    : "border-color 0.16s ease, background-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease",
                boxShadow: selected ? `inset 0 0 0 1px ${selectedSurface}` : "none",
            }}
        >
            {label}
        </button>
    )
})

const TimeSlotList = React.memo(function TimeSlotList(props: TimeSlotListProps) {
    const {
        isNarrow,
        activeTimeFormat,
        setActiveTimeFormat,
        onTimeFormatChange,
        focusedKey,
        setFocusedKey,
        accentColor,
        softerFill,
        subtleBorder,
        borderColor,
        textColor,
        selectedAccentText,
        selectedSurface = accentColor,
        selectedText = selectedAccentText,
        mutedText,
        mutedSoftText,
        backgroundColor,
        loadingLabel,
        slotsLoading,
        selectionPending = false,
        selectedDate,
        fallbackDate,
        clockReady,
        showTimesWithoutDate,
        timeOptions,
        availableTimes,
        selectedTime,
        hoveredTime,
        setHoveredTime,
        onSelectTime,
        isTimeElapsed,
        borderRadius,
        pickDateToSeeTimesLabel,
        noTimesFallbackLabel,
        timeSlotsAriaLabel,
        availableTimesAriaLabel,
        required,
        timeZone,
        slotError,
        slotErrorId,
    } = props
    const firstNonElapsedIndex = React.useMemo(
        () => timeOptions.findIndex((time) => !isTimeElapsed(time)),
        [timeOptions, isTimeElapsed]
    )
    const scrollerRef = React.useRef<HTMLDivElement | null>(null)
    const [scrollerOverflows, setScrollerOverflows] = React.useState(false)
    React.useEffect(() => {
        const el = scrollerRef.current
        if (!el) return
        const measure = () => {
            setScrollerOverflows(el.scrollHeight > el.clientHeight + 1)
        }
        measure()
        window.addEventListener("resize", measure)
        return () => window.removeEventListener("resize", measure)
    }, [timeOptions, isNarrow])
    const slotGridRef = React.useRef<HTMLDivElement | null>(null)
    const slotDateLabel = React.useMemo(
        () =>
            selectedDate
                ? // TZ-HEADER fix: SR date in the visitor zone too (was
                  getCachedDateTimeFormat(pageLocale(), {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      ...(isValidTimeZone(timeZone) ? { timeZone } : {}),
                  }).format(selectedDate)
                : "",
        [selectedDate, timeZone]
    )
    React.useEffect(() => {
        const prefix = "time-"
        if (!focusedKey?.startsWith(prefix)) return
        const value = focusedKey.slice(prefix.length)
        const focusedIdx = timeOptions.findIndex((o) => o.value === value)
        if (focusedIdx < 0 || !isTimeElapsed(timeOptions[focusedIdx])) return
        const liveButtons = Array.from(
            slotGridRef.current?.querySelectorAll<HTMLButtonElement>(
                "button[role='radio']:not([disabled])"
            ) ?? []
        )
        for (let i = 1; i <= timeOptions.length; i++) {
            const candidate = timeOptions[(focusedIdx + i) % timeOptions.length]
            if (!candidate || isTimeElapsed(candidate)) continue
            const target = liveButtons.find((b) =>
                (b.getAttribute("aria-label") ?? "").startsWith(candidate.label)
            )
            if (target) {
                target.focus()
                setFocusedKey(`time-${candidate.value}`)
                return
            }
        }
        setFocusedKey(null)
    }, [focusedKey, timeOptions, isTimeElapsed, setFocusedKey])
    return (
        <aside
            aria-label={timeSlotsAriaLabel}
            style={{
                width: isNarrow ? "100%" : undefined,
                minWidth: 0,
                borderLeft: isNarrow ? "none" : subtleBorder,
                borderTop: isNarrow ? subtleBorder : "none",
                padding: "16px 16px 0 16px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                <div
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: textColor,
                        whiteSpace: "nowrap",
                    }}
                >
                    {!clockReady || selectionPending ? (
                        <span
                            aria-hidden="true"
                            style={{
                                display: "inline-block",
                                width: 84,
                                height: 14,
                                borderRadius: 6,
                                background: softerFill,
                                verticalAlign: "middle",
                            }}
                        />
                    ) : (
                        <>
                            {(() => {
                                const d = selectedDate ?? fallbackDate
                                const tzOpt = isValidTimeZone(timeZone) ? { timeZone } : undefined
                                const w = getCachedDateTimeFormat(pageLocale(), {
                                    weekday: "short",
                                    ...tzOpt,
                                }).format(d)
                                return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                            })()}
                            <span
                                style={{
                                    marginLeft: 6,
                                    fontSize: 16,
                                    fontWeight: 500,
                                    color: mutedText,
                                }}
                            >
                                {Number(
                                    getDateKeyInTimeZone(
                                        selectedDate ?? fallbackDate,
                                        timeZone || ""
                                    ).slice(-2)
                                )}
                                {(() => {
                                    const d = Number(
                                        getDateKeyInTimeZone(
                                            selectedDate ?? fallbackDate,
                                            timeZone || ""
                                        ).slice(-2)
                                    )
                                    if (d >= 11 && d <= 13) return "th"
                                    switch (d % 10) {
                                        case 1:
                                            return "st"
                                        case 2:
                                            return "nd"
                                        case 3:
                                            return "rd"
        default:
                                            return "th"
                                    }
                                })()}
                            </span>
                        </>
                    )}
                </div>
                <SegmentedControl
                    options={[
                        { label: "12h", value: "12h" },
                        { label: "24h", value: "24h" },
                    ]}
                    value={activeTimeFormat}
                    onChange={(val) => {
                        const format = val as "12h" | "24h"
                        React.startTransition(() => {
                            setActiveTimeFormat(format)
                            onTimeFormatChange?.(format)
                        })
                    }}
                    borderRadius={borderRadius}
                    textColor={textColor}
                    mutedTextColor={mutedText}
                    backgroundColor={backgroundColor}
                    borderColor={borderColor}
                    ariaLabel={DEFAULT_COPY_TIMEFORMAT_LABEL}
                />
            </div>

            <div
                style={
                    isNarrow
                        ? { minWidth: 0 }
                        : { flex: 1, minHeight: 0, position: "relative", minWidth: 0 }
                }
            >
                {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: scroller is role=region exactly when labelled (conditional pair) — static analysis cannot narrow the ternary. */}
                <div
                    className="be-dt-scroll"
                    ref={scrollerRef}
                    tabIndex={scrollerOverflows ? 0 : undefined}
                    role={scrollerOverflows ? "region" : undefined}
                    aria-label={scrollerOverflows ? availableTimesAriaLabel : undefined}
                    style={
                        isNarrow
                            ? {
                                  minWidth: 0,
                                  maxHeight: "40vh",
                                  overflowY: "auto",
                                  overscrollBehavior: "contain",
                                  paddingBottom: 16,
                              }
                            : {
                                  position: "absolute",
                                  inset: 0,
                                  overflowY: "auto",
                                  minWidth: 0,
                                  paddingBottom: 16,
                              }
                    }
                >
                    {slotsLoading || selectionPending ? (
                        <output
                            aria-live="polite"
                            aria-atomic="true"
                            style={{
                                display: "block",
                                padding: "16px 8px",
                                boxSizing: "border-box",
                            }}
                        >
                            <span
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
                                {loadingLabel}
                            </span>
                            <div
                                aria-hidden="true"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                {Array.from({ length: TIME_SLOT_SKELETON_COUNT }, (_, i) => (
                                    <Skeleton
                                        key={`be-slot-skeleton-${i}`}
                                        height={36}
                                        borderRadius={borderRadius}
                                        background={withAlpha(borderColor, 0.5)}
                                    />
                                ))}
                            </div>
                        </output>
                    ) : !selectedDate && !showTimesWithoutDate ? (
                        <div
                            style={{
                                padding: "16px 8px",
                                textAlign: "center",
                                color: mutedText,
                                fontSize: 13,
                                fontFamily: "inherit",
                            }}
                            // W1-10-A14: static guidance, never a live region (rule 103).
                        >
                            {pickDateToSeeTimesLabel}
                        </div>
                    ) : timeOptions.length === 0 && availableTimes === undefined ? (
                        <output
                            style={{
                                display: "block",
                                padding: "16px 8px",
                                textAlign: "center",
                                color: mutedText,
                                fontSize: 13,
                                fontFamily: "inherit",
                            }}
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {noTimesFallbackLabel}
                        </output>
                    ) : timeOptions.length === 0 ? (
                        <div style={{ padding: "8px 0" }} />
                    ) : (
                        <div
                            ref={slotGridRef}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "minmax(0, 1fr)",
                                gap: isNarrow ? 6 : 8,
                                minWidth: 0,
                            }}
                            role="radiogroup"
                            aria-label={availableTimesAriaLabel}
                            aria-required={required || undefined}
                            aria-invalid={slotError ? true : undefined}
                            aria-describedby={slotError ? slotErrorId : undefined}
                            onKeyDown={(e) => {
                                if (e.key === " ") {
                                    e.preventDefault()
                                    return
                                }
                                const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"]
                                if (e.key === "Home" || e.key === "End") {
                                    e.preventDefault()
                                    const liveButtons = Array.from(
                                        e.currentTarget.querySelectorAll<HTMLButtonElement>(
                                            "button[role='radio']:not([disabled])"
                                        )
                                    )
                                    if (!liveButtons.length) return
                                    const target =
                                        e.key === "Home"
                                            ? liveButtons[0]
                                            : liveButtons[liveButtons.length - 1]
                                    if (!target) return
                                    target.focus()
                                    const allButtons = Array.from(
                                        e.currentTarget.querySelectorAll<HTMLButtonElement>(
                                            "button[role='radio']"
                                        )
                                    )
                                    const targetIndex = allButtons.indexOf(target)
                                    const opt = timeOptions[targetIndex]
                                    if (opt) onSelectTime(opt.value)
                                    return
                                }
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
                                          timeOptions.findIndex((t) => t.value === selectedTime)
                                      )
                                    : 0
                                const move =
                                    e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1
                                const next = (idx + move + buttons.length) % buttons.length
                                const target = buttons[next]
                                if (target && !target.disabled) {
                                    target.focus()
                                    onSelectTime(timeOptions[next].value)
                                }
                            }}
                        >
                            {timeOptions.map((time, index) => {
                                const selected = selectedTime === time.value
                                const elapsed = isTimeElapsed(time)
                                const isHover = hoveredTime === time.value && !selected && !elapsed
                                return (
                                    <TimeSlotButton
                                        key={time.value}
                                        value={time.value}
                                        label={time.label}
                                        selected={selected}
                                        elapsed={elapsed}
                                        hovered={isHover}
                                        isNarrow={isNarrow}
                                        accentColor={accentColor}
                                        borderColor={borderColor}
                                        mutedSoftText={mutedSoftText}
                                        textColor={textColor}
                                        selectedSurface={selectedSurface}
                                        selectedText={selectedText}
                                        onSelect={onSelectTime}
                                        radius={borderRadius}
                                        setHoveredTime={setHoveredTime}
                                        setFocusedKey={setFocusedKey}
                                        isInitialFocus={
                                            selectedTime === null && firstNonElapsedIndex === index
                                        }
                                        timeZone={timeZone}
                                        slotDateLabel={slotDateLabel}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
})

interface UseCalendarNavigationOptions {
    initialVisibleMonth?: Date | null
    today: Date
    rootRef: React.RefObject<HTMLDivElement | null>
    onMonthChange?: (monthStart: Date) => void
    availableDates?: Set<string>
    slotsLoading?: boolean
    timeZone?: string
    clockReady: boolean
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
    /** W1-09-DT-08 fix: the 12-month booking horizon (see return). */
    maxMonthStart: Date
    /** W1-09-NEW-03 fix: cross-month arrow focus handoff (see refs above). */
    pendingMonthFocusRef: { current: boolean }
    pendingMonthFocusTargetRef: { current: string | null }
} {
    const {
        initialVisibleMonth,
        today,
        rootRef,
        onMonthChange,
        availableDates,
        slotsLoading,
        timeZone,
        clockReady,
    } = options

    const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => {
        if (initialVisibleMonth) return initialVisibleMonth
        return new Date(today.getFullYear(), today.getMonth(), 1)
    })

    const childMonthChangeRef = React.useRef(false)
    React.useEffect(() => {
        if (!initialVisibleMonth) return
        if (childMonthChangeRef.current) {
            childMonthChangeRef.current = false
            return
        }
        const incoming = new Date(
            initialVisibleMonth.getFullYear(),
            initialVisibleMonth.getMonth(),
            1
        )
        const current = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
        if (incoming.getTime() === current.getTime()) return
        React.startTransition(() => setVisibleMonth(incoming))
    }, [initialVisibleMonth, visibleMonth])

    const visibleMonthKey = React.useMemo(
        () => getDateKeyInTimeZone(visibleMonth, timeZone || ""),
        [visibleMonth, timeZone]
    )
    const monthName = React.useMemo(() => {
        const m = Number(visibleMonthKey.slice(5, 7))
        if (!Number.isFinite(m) || m < 1 || m > 12) {
            return getCachedDateTimeFormat(pageLocale(), { month: "long" }).format(visibleMonth)
        }
        return getCachedDateTimeFormat(pageLocale(), { month: "long" }).format(
            new Date(2000, m - 1, 1)
        )
    }, [visibleMonthKey, visibleMonth])
    const yearLabel = React.useMemo(() => {
        const y = Number(visibleMonthKey.slice(0, 4))
        return Number.isFinite(y) && y > 0 ? String(y) : String(visibleMonth.getFullYear())
    }, [visibleMonthKey, visibleMonth])

    const firstDayOfWeek = React.useMemo(() => {
        try {
            const localeTag = pageLocale() || "en-US"
            const locale = new (
                Intl as unknown as {
                    Locale: new (
                        tag: string
                    ) => {
                        getWeekInfo?: () => { firstDay?: number }
                        weekInfo?: { firstDay?: number }
                    }
                }
            ).Locale(localeTag)
            const info = locale.getWeekInfo ? locale.getWeekInfo() : locale.weekInfo
            if (info && typeof info.firstDay === "number") {
                return info.firstDay % 7
            }
        } catch {
            // Unsupported in this browser/environment — fall back to Sunday.
        }
        return 0
    }, [])

    const weekdayLabels = React.useMemo(() => buildWeekdayLabels(firstDayOfWeek), [firstDayOfWeek])

    const calendarCells = React.useMemo(() => {
        const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
        const start = new Date(firstOfMonth)
        const offset = (firstOfMonth.getDay() - firstDayOfWeek + 7) % 7
        start.setDate(firstOfMonth.getDate() - offset)
        const cells: Date[] = []
        const weeks = weeksInMonthView(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            firstDayOfWeek
        )
        for (let i = 0; i < weeks * 7; i++) {
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

    const pendingMonthFocusRef = React.useRef(false)
    const pendingMonthFocusTargetRef = React.useRef<string | null>(null)

    const goToPreviousMonth = React.useCallback(
        (focusAfter?: boolean) => {
            if (focusAfter) pendingMonthFocusRef.current = true
            React.startTransition(() => {
                setVisibleMonth((prev) => {
                    if (prev.getTime() <= currentMonthStart.getTime()) return prev
                    childMonthChangeRef.current = true
                    return new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                })
            })
        },
        [currentMonthStart]
    )

    const goToNextMonth = React.useCallback(
        (focusAfter?: boolean) => {
            if (focusAfter) pendingMonthFocusRef.current = true
            React.startTransition(() => {
                setVisibleMonth((prev) => {
                    if (prev.getTime() >= maxMonthStart.getTime()) return prev
                    childMonthChangeRef.current = true
                    return new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                })
            })
        },
        [maxMonthStart]
    )

    React.useEffect(() => {
        if (!clockReady) return
        onMonthChange?.(visibleMonth)
    }, [clockReady, visibleMonth, onMonthChange])

    React.useEffect(() => {
        if (!pendingMonthFocusRef.current) return
        pendingMonthFocusRef.current = false
        const targetKey = pendingMonthFocusTargetRef.current
        pendingMonthFocusTargetRef.current = null
        const focusRaf = requestAnimationFrame(() => {
            if (targetKey) {
                rootRef.current
                    ?.querySelector<HTMLElement>(`[data-date-key="${targetKey}"]`)
                    ?.focus()
                return
            }
            const activeCell = rootRef.current?.querySelector<HTMLElement>(
                '[data-be-active-date="true"]'
            )
            if (activeCell) {
                activeCell.focus()
                return
            }
            rootRef.current?.querySelector<HTMLElement>("[data-be-month-heading]")?.focus()
        })
        return () => cancelAnimationFrame(focusRaf)
    }, [visibleMonth])

    const autoAdvancedMonthsRef = React.useRef(0)
    React.useEffect(() => {
        if (!clockReady) return
        if (!availableDates) return // demo/fallback mode - nothing to check
        if (slotsLoading) return // don't judge an in-flight fetch as "empty"
        // In-month only: fetched out-of-month days must not pin a fully-booked month.
        // (Inline date-key check — hasKnownAvailability is declared further below.)
        const inMonthHasAvailability = calendarCells.some((date) => {
            if (date.getMonth() !== visibleMonth.getMonth()) return false
            if (startOfDay(date).getTime() < today.getTime()) return false
            const key = timeZone ? getDateKeyInTimeZone(date, timeZone) : getLocalDateKey(date)
            return availableDates.has(key)
        })
        if (inMonthHasAvailability) return
        if (autoAdvancedMonthsRef.current >= 3) return
        if (visibleMonth.getTime() === currentMonthStart.getTime()) return
        autoAdvancedMonthsRef.current += 1
        goToNextMonth()
    }, [
        clockReady,
        availableDates,
        slotsLoading,
        goToNextMonth,
        visibleMonth,
        currentMonthStart,
        calendarCells,
        timeZone,
        today,
    ])

    const canGoPrev = visibleMonth.getTime() > currentMonthStart.getTime()
    const canGoNext = visibleMonth.getTime() < maxMonthStart.getTime()
    const prevMonthLabel = React.useMemo(() => {
        const d = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
        return getCachedDateTimeFormat(pageLocale(), {
            month: "long",
            year: "numeric",
        }).format(d)
    }, [visibleMonth])
    const nextMonthLabel = React.useMemo(() => {
        const d = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
        return getCachedDateTimeFormat(pageLocale(), {
            month: "long",
            year: "numeric",
        }).format(d)
    }, [visibleMonth])

    const setVisibleMonthFromCalendar = React.useCallback(
        (month: Date | ((prev: Date) => Date)) => {
            setVisibleMonth((prev) => {
                const next = typeof month === "function" ? month(prev) : (month as Date)
                if (next.getTime() === prev.getTime()) return prev
                childMonthChangeRef.current = true
                return next
            })
        },
        []
    )

    return {
        visibleMonth,
        setVisibleMonth: setVisibleMonthFromCalendar,
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
        maxMonthStart,
        pendingMonthFocusRef,
        pendingMonthFocusTargetRef,
    }
}

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
    amLabel?: string
    pmLabel?: string
    /** W1-07-F3 fix: the visitor's chosen timezone, used to disambiguate
     *  DST collision rows ("01:00 AM (EDT)" vs "01:00 AM (EST)"). */
    timeZone?: string
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
        amLabel,
        pmLabel,
        timeZone,
    } = options

    const [selectedTime, setSelectedTime] = React.useState<string | null>(() => initialTime ?? null)
    const [activeTimeFormat, setActiveTimeFormat] = React.useState<"12h" | "24h">(timeFormat)
    const [hoveredTime, setHoveredTime] = React.useState<string | null>(null)

    React.useEffect(() => {
        React.startTransition(() => setActiveTimeFormat(timeFormat))
    }, [timeFormat])

    React.useEffect(() => {
        if (initialTime !== undefined) {
            React.startTransition(() =>
                setSelectedTime((prev) => (prev === initialTime ? prev : initialTime))
            )
        }
    }, [initialTime])

    const timeOptions = React.useMemo(() => {
        if (availableTimes !== undefined) {
            const seenMinutes = new Set<string>()
            const deduped: typeof availableTimes = []
            for (const t of availableTimes) {
                const endMinutes =
                    t.end && timeZone && !Number.isNaN(new Date(t.end).getTime())
                        ? getMinutesInTimeZone(new Date(t.end), timeZone)
                        : null
                const key = `${t.minutes}|${endMinutes ?? ""}`
                if (!seenMinutes.has(key)) {
                    seenMinutes.add(key)
                    deduped.push(t)
                }
            }
            const source = deduped.length ? deduped : availableTimes
            return source.map((timeOption) => ({
                value: timeOption.value,
                end: timeOption.end,
                label: formatTimeLabel(timeOption.minutes, activeTimeFormat, amLabel, pmLabel),
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
                label: formatTimeLabel(mins, activeTimeFormat, amLabel, pmLabel),
                minutes: mins,
            })
        }
        return list
    }, [availableTimes, startTime, endTime, interval, activeTimeFormat, amLabel, pmLabel, timeZone])

    const [now, setNow] = React.useState<Date | null>(null)
    const beInteractive = useBeInteractive()
    useIsomorphicLayoutEffect(() => {
        if (!beInteractive) return
        setNow(new Date())
        const id = window.setInterval(() => setNow(new Date()), 30000)
        return () => window.clearInterval(id)
    }, [beInteractive])
    const isTimeElapsed = React.useCallback(
        (time: { value: string; minutes: number }) => {
            if (!now) return false
            if (!selectedDate) return false
            if (!isSameDay(selectedDate, today)) return false
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

const CalEventInfoPanel = React.memo(function CalEventInfoPanel(props: {
    meta: CalEventMeta
    fallbackDurationMinutes?: number
    accentColor: string
    textPrimaryColor: string
    textSecondaryColor: string
    borderColor: string
    borderRadius: number | string
    hourSuffix?: string
    minuteSuffix?: string
}) {
    const {
        meta,
        fallbackDurationMinutes,
        accentColor,
        textPrimaryColor,
        textSecondaryColor,
        borderColor,
        hourSuffix = DEFAULT_COPY_HOUR_SUFFIX,
        minuteSuffix = DEFAULT_COPY_MINUTE_SUFFIX,
    } = props
    const durationMinutes =
        typeof meta.durationMinutes === "number" && meta.durationMinutes > 0
            ? meta.durationMinutes
            : typeof fallbackDurationMinutes === "number" && fallbackDurationMinutes > 0
              ? fallbackDurationMinutes
              : undefined
    const initial = meta.organizerName?.trim().charAt(0).toUpperCase()
    return (
        <div style={{ fontSize: 14, lineHeight: 1.45 }}>
            {(meta.avatarUrl || initial) && meta.organizerName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {meta.avatarUrl ? (
                        <img
                            src={meta.avatarUrl}
                            alt=""
                            width={32}
                            height={32}
                            loading="lazy"
                            decoding="async"
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                objectFit: "cover",
                                flexShrink: 0,
                            }}
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: withAlpha(accentColor, 0.14),
                                color: accentColor,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 14,
                                flexShrink: 0,
                            }}
                        >
                            {initial}
                        </div>
                    )}
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: textPrimaryColor,
                            minWidth: 0,
                            overflowWrap: "anywhere",
                        }}
                    >
                        {meta.organizerName}
                    </div>
                </div>
            ) : null}
            {meta.title ? (
                <div
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: textPrimaryColor,
                        marginTop: meta.organizerName ? 10 : 0,
                        lineHeight: 1.35,
                        maxWidth: "22ch",
                    }}
                >
                    {meta.title}
                </div>
            ) : null}
            {durationMinutes ? (
                <div
                    style={{
                        marginTop: meta.title || meta.organizerName ? 8 : 0,
                        color: textSecondaryColor,
                        fontSize: 16,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            width: 20,
                            height: 20,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative aria-hidden clock icon, adjacent text is the single name. */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                        </svg>
                    </span>
                    <span>
                        {durationMinutes % 60 === 0
                            ? `${durationMinutes / 60} ${hourSuffix}`
                            : `${durationMinutes} ${minuteSuffix}`}
                    </span>
                </div>
            ) : null}
            {meta.locationLabel ? (
                <div
                    style={{
                        marginTop: 6,
                        color: textSecondaryColor,
                        fontSize: 16,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 7,
                        overflowWrap: "anywhere",
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            width: 20,
                            height: 20,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 2,
                        }}
                    >
                        {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative aria-hidden pin icon — adjacent text is the single name. */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </span>
                    <span>{meta.locationLabel}</span>
                </div>
            ) : null}
            {meta.description ? (
                <div
                    style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: `1px solid ${withAlpha(borderColor, 0.7)}`,
                        color: textSecondaryColor,
                        fontSize: 13,
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {meta.description}
                </div>
            ) : null}
        </div>
    )
})

interface DateAndTimeInlineProps {
    accentColor: string
    accentForegroundColor?: string
    slotSelectedSurface?: string
    slotSelectedText?: string
    calendarStyles?: FieldStyleOverrides
    textColor: string
    borderColor: string
    radius: number | string
    startTime: string
    endTime: string
    interval: number
    timeFormat: "12h" | "24h"
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
    availableDates?: Set<string>
    slotsLoading?: boolean
    availabilitySettled?: boolean
    /** INSTANCE-ISOLATION: per-engine id for DOM ids (gridLabelId, field ids). */
    instanceId?: string
    timeZone?: string
    /** Copy shown in the time panel while Cal.com availability is loading. */
    loadingLabel?: string
    onSelectionReady?: (payload?: BookingPayload) => void
    onDateChange?: (date: Date) => void
    onMonthChange?: (monthStart: Date) => void
    onTimeFormatChange?: (format: "12h" | "24h") => void
    showTimesWithoutDate?: boolean
    pickDateToSeeTimesLabel: string
    noTimesFallbackLabel: string
    timeSlotsAriaLabel: string
    availableTimesAriaLabel: string
    datePickerAriaLabel: string
    amLabel: string
    pmLabel: string
    previousMonthAriaTemplate: string
    nextMonthAriaTemplate: string
    required?: boolean
    slotError?: string | null
    slotErrorId?: string
    eventMeta?: CalEventMeta | null
    eventMetaStatus?: CalEventMetaStatus
    /** CAL-EVENT-META: author Default Meeting Duration (minutes) — only used
     *  when Cal.com itself returns no reliable event length. */
    eventMetaFallbackDurationMinutes?: number
    calEventMetaUnavailableCopy?: string
    hourSuffix?: string
    minuteSuffix?: string
}

const DateAndTimeInline = React.memo(function DateAndTimeInline(props: DateAndTimeInlineProps) {
    const {
        instanceId = "",
        accentColor,
        accentForegroundColor = TEXT_ON_ACCENT,
        slotSelectedSurface,
        slotSelectedText,
        calendarStyles,
        textColor,
        borderColor,
        radius,
        startTime,
        endTime,
        interval,
        timeFormat,
        initialDate,
        initialTime,
        initialVisibleMonth,
        availableTimes,
        availableDates,
        slotsLoading = false,
        availabilitySettled = true,
        loadingLabel = "Loading availability…",
        timeZone,
        onSelectionReady,
        onDateChange,
        onMonthChange,
        onTimeFormatChange,
        showTimesWithoutDate = false,
        pickDateToSeeTimesLabel,
        noTimesFallbackLabel,
        timeSlotsAriaLabel,
        availableTimesAriaLabel,
        datePickerAriaLabel,
        amLabel,
        pmLabel,
        previousMonthAriaTemplate,
        nextMonthAriaTemplate,
        required,
        slotError,
        slotErrorId,
        eventMeta,
        eventMetaStatus = "disabled",
        eventMetaFallbackDurationMinutes,
        calEventMetaUnavailableCopy = CAL_META_UNAVAILABLE_COPY,
        hourSuffix = DEFAULT_COPY_HOUR_SUFFIX,
        minuteSuffix = DEFAULT_COPY_MINUTE_SUFFIX,
    } = props

    const [clockReady, setClockReady] = React.useState(false)
    const [today, setToday] = React.useState<Date>(() => HYDRATION_PLACEHOLDER_TODAY)
    const beInteractive = useBeInteractive()
    useIsomorphicLayoutEffect(() => {
        if (!beInteractive) return
        setClockReady(true)
        setToday(getTodayInTimeZone(timeZone))
    }, [beInteractive, timeZone])
    React.useEffect(() => {
        if (!clockReady || typeof window === "undefined") return
        let intervalId: number
        let timeoutId: number
        const checkRollover = () => {
            const newToday = getTodayInTimeZone(timeZone)
            setToday((prev) => (isSameDay(prev, newToday) ? prev : newToday))
        }
        const now = Date.now()
        const delayToNextTick = 30000 - (now % 30000)
        timeoutId = window.setTimeout(() => {
            checkRollover()
            intervalId = window.setInterval(checkRollover, 30000)
        }, delayToNextTick)
        return () => {
            window.clearTimeout(timeoutId)
            if (intervalId) window.clearInterval(intervalId)
        }
    }, [timeZone, clockReady])
    const prefersReducedMotion = useReducedMotion() ?? false

    const [measuredWidth, setMeasuredWidth] = React.useState<number>(560)
    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const focusRafRef = React.useRef(0)
    const pendingSlotListFocusRef = React.useRef(false)
    React.useEffect(() => {
        return () => {
            if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current)
        }
    }, [])

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
        maxMonthStart,
        pendingMonthFocusRef,
        pendingMonthFocusTargetRef,
    } = useCalendarNavigation({
        initialVisibleMonth,
        today,
        rootRef,
        onMonthChange,
        availableDates,
        slotsLoading,
        timeZone,
        clockReady,
    })
    const selfSeededMonthRef = React.useRef(!initialVisibleMonth)
    useIsomorphicLayoutEffect(() => {
        if (!clockReady) return
        if (!selfSeededMonthRef.current) return
        selfSeededMonthRef.current = false
        setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    }, [clockReady, today, setVisibleMonth])
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(
        () => initialDate ?? HYDRATION_PLACEHOLDER_TODAY
    )
    const placeholderSelectedRef = React.useRef(!initialDate)
    const [initialSelectionPending, setInitialSelectionPending] = React.useState(!initialDate)
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
        amLabel,
        pmLabel,
        timeZone,
    })

    const handleSlotSelect = React.useCallback(
        (time: string) => {
            handleTimeSelect(time)
        },
        [handleTimeSelect]
    )

    const [hoveredDateKey, setHoveredDateKey] = React.useState<string | null>(null)

    const [focusedKey, setFocusedKey] = React.useState<string | null>(null)
    const lastReadyKeyRef = React.useRef<string>("")

    useIsomorphicLayoutEffect(() => {
        if (!beInteractive) return
        if (typeof window !== "undefined" && typeof ResizeObserver !== "undefined") {
            if (!rootRef.current) return
            const initialWidth = rootRef.current.clientWidth
            if (initialWidth > 0) {
                React.startTransition(() => setMeasuredWidth(initialWidth))
            }
            const observer = new ResizeObserver((entries) => {
                const nextWidth = entries[0]?.contentRect?.width
                if (typeof nextWidth === "number") {
                    React.startTransition(() => setMeasuredWidth(nextWidth))
                }
            })
            observer.observe(rootRef.current)
            return () => observer.disconnect()
        }
    }, [beInteractive])

    React.useEffect(() => {
        if (!initialDate) return
        placeholderSelectedRef.current = false
        setInitialSelectionPending(false)
        React.startTransition(() =>
            setSelectedDate((prev) => (prev && isSameDay(prev, initialDate) ? prev : initialDate))
        )
    }, [initialDate])

    const isNarrow = measuredWidth < COMPACT_BREAKPOINT
    const selectedAccentText = accentForegroundColor
    const normalizedCalendarStyles = normalizeStyleOverrides(calendarStyles)
    const surfaceBackground =
        normalizedCalendarStyles?.backgroundColor ?? DEFAULT_CALENDAR_SURFACE_BACKGROUND
    const surfaceRadiusRaw = resolveFieldRadius(
        normalizedCalendarStyles,
        radius,
        "calendar-widget" as FieldType
    )
    // RADIUS 0-24 (rule 60 parity): the Number control enforces it in the panel;
    // the runtime clamps programmatic values the same way.
    const surfaceRadius = (() => {
        const n = Number.parseFloat(surfaceRadiusRaw)
        if (!Number.isFinite(n)) return surfaceRadiusRaw
        const clamped = Math.max(0, Math.min(24, n))
        return surfaceRadiusRaw.trim().endsWith("%") ? `${clamped}%` : `${clamped}px`
    })()
    const resolvedTextColor = normalizedCalendarStyles?.textColor || textColor
    const tileBorder = normalizedCalendarStyles?.border
    const tileBorderWidth = typeof tileBorder?.borderWidth === "number" ? tileBorder.borderWidth : 1
    const mutedText = React.useMemo(() => withAlpha(resolvedTextColor, 0.6), [resolvedTextColor])
    const mutedSoftText = React.useMemo(
        () => withAlpha(resolvedTextColor, 0.42),
        [resolvedTextColor]
    )
    const subtleFill = React.useMemo(() => withAlpha(resolvedTextColor, 0.08), [resolvedTextColor])
    const softerFill = React.useMemo(() => withAlpha(resolvedTextColor, 0.05), [resolvedTextColor])
    const subtleBorder = React.useMemo(() => `1px solid ${borderColor}`, [borderColor])
    const surfaceBorder = !tileBorder
        ? subtleBorder
        : tileBorderWidth > 0
          ? `${tileBorderWidth}px ${tileBorder?.borderStyle || "solid"} ${tileBorder?.borderColor || borderColor}`
          : "none"
    const surfacePadding =
        typeof normalizedCalendarStyles?.padding === "string" &&
        normalizedCalendarStyles.padding.trim()
            ? normalizedCalendarStyles.padding
            : undefined

    const dateKeyOf = React.useCallback(
        (date: Date) => (timeZone ? getDateKeyInTimeZone(date, timeZone) : getLocalDateKey(date)),
        [timeZone]
    )

    const hasKnownAvailability = React.useCallback(
        (date: Date) => !availableDates || availableDates.has(dateKeyOf(date)),
        [availableDates, dateKeyOf]
    )

    const firstAvailableDate = React.useMemo(() => {
        for (const date of calendarCells) {
            const isInMonth = date.getMonth() === visibleMonth.getMonth()
            const isPast = startOfDay(date).getTime() < today.getTime()
            if (isInMonth && !isPast && hasKnownAvailability(date)) return date
        }
        return null
    }, [calendarCells, visibleMonth, today, hasKnownAvailability])
    const selectedOrFirstDateKey = React.useMemo(() => {
        if (
            selectedDate &&
            selectedDate.getFullYear() === visibleMonth.getFullYear() &&
            selectedDate.getMonth() === visibleMonth.getMonth() &&
            hasKnownAvailability(selectedDate)
        ) {
            return dateKeyOf(selectedDate)
        }
        if (firstAvailableDate) {
            return dateKeyOf(firstAvailableDate)
        }
        return null
    }, [selectedDate, firstAvailableDate, visibleMonth, dateKeyOf, hasKnownAvailability])

    const activeDateKey = selectedOrFirstDateKey

    const selectionUnresolved =
        initialSelectionPending && availableDates !== undefined && !availabilitySettled

    useIsomorphicLayoutEffect(() => {
        if (!clockReady) return
        if (!placeholderSelectedRef.current) return
        if (today.getFullYear() === 2024 && today.getMonth() === 0 && today.getDate() === 1) return
        const isCalcom = availableDates !== undefined
        const availabilityKnown = availabilitySettled
        if (isCalcom && !availabilityKnown) return
        const todayAvailable = hasKnownAvailability(today)
        const defaultDate = todayAvailable ? today : firstAvailableDate
        if (defaultDate) {
            placeholderSelectedRef.current = false
            setInitialSelectionPending(false)
            React.startTransition(() => {
                setSelectedDate(defaultDate)
                onDateChange?.(defaultDate)
            })
        } else if (isCalcom && availabilityKnown) {
            setSelectedDate(null)
        }
    }, [
        clockReady,
        today,
        hasKnownAvailability,
        firstAvailableDate,
        availableDates,
        slotsLoading,
        availabilitySettled,
        onDateChange,
    ])

    useIsomorphicLayoutEffect(() => {
        if (!clockReady) return
        if (placeholderSelectedRef.current) return
        if (!selectedDate) return
        const isCalcom = availableDates !== undefined
        if (isCalcom && !availabilitySettled) return
        const past = startOfDay(selectedDate).getTime() < today.getTime()
        const unavailable = isCalcom && !hasKnownAvailability(selectedDate)
        if (!past && !unavailable) return
        const todayAvailable = hasKnownAvailability(today)
        const fallback = todayAvailable ? today : firstAvailableDate
        React.startTransition(() => {
            setSelectedTime(null)
            if (fallback) {
                setSelectedDate(fallback)
                onDateChange?.(fallback)
            } else {
                setSelectedDate(null)
            }
        })
    }, [
        clockReady,
        selectedDate,
        today,
        availableDates,
        slotsLoading,
        availabilitySettled,
        hasKnownAvailability,
        firstAvailableDate,
        onDateChange,
    ])

    const getPayload = React.useCallback(
        (date: Date, time: string): BookingPayload => {
            const isIso = /^\d{4}-\d{2}-\d{2}T/.test(time)
            if (isIso) {
                const matched = availableTimes?.find((candidate) => candidate.value === time)
                const d = new Date(time)
                const minutes =
                    matched?.minutes ??
                    (isValidTimeZone(timeZone)
                        ? getMinutesInTimeZone(d, timeZone)
                        : d.getHours() * 60 + d.getMinutes())
                return {
                    date,
                    time24h: time,
                    timeLabel: formatTimeLabel(minutes, activeTimeFormat, amLabel, pmLabel),
                    end: matched?.end,
                }
            }
            return {
                date,
                time24h: time,
                timeLabel: formatTimeLabel(
                    parseTimeToMinutes(time),
                    activeTimeFormat,
                    amLabel,
                    pmLabel
                ),
            }
        },
        [activeTimeFormat, availableTimes, amLabel, pmLabel, timeZone]
    )

    const handleDateSelect = React.useCallback(
        (date: Date) => {
            if (startOfDay(date).getTime() < today.getTime()) return
            placeholderSelectedRef.current = false
            setInitialSelectionPending(false)
            React.startTransition(() => {
                setSelectedDate(date)
                if (
                    date.getFullYear() !== visibleMonth.getFullYear() ||
                    date.getMonth() !== visibleMonth.getMonth()
                ) {
                    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
                }
                setSelectedTime(null)
            })
            if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current)
            focusRafRef.current = requestAnimationFrame(() => {
                rootRef.current
                    ?.querySelector<HTMLButtonElement>("button[role='radio']:not([disabled])")
                    ?.focus()
            })
            pendingSlotListFocusRef.current = true
            if (onDateChange) onDateChange(date)
        },
        [onDateChange, today, visibleMonth, setVisibleMonth]
    )

    React.useEffect(() => {
        if (!pendingSlotListFocusRef.current) return
        if (slotsLoading) return
        if (timeOptions.length === 0) {
            pendingSlotListFocusRef.current = false
            return
        }
        pendingSlotListFocusRef.current = false
        if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current)
        focusRafRef.current = requestAnimationFrame(() => {
            rootRef.current
                ?.querySelector<HTMLButtonElement>("button[role='radio']:not([disabled])")
                ?.focus()
        })
    }, [slotsLoading, timeOptions])

    const hasKnownAvailabilityRef = React.useRef(hasKnownAvailability)
    hasKnownAvailabilityRef.current = hasKnownAvailability

    const moveFocus = React.useCallback(
        (target: Date) => {
            if (startOfDay(target).getTime() < today.getTime()) return
            if (startOfDay(target).getTime() > maxMonthStart.getTime()) return
            if (!hasKnownAvailabilityRef.current(target)) return
            const inVisibleMonth =
                target.getFullYear() === visibleMonth.getFullYear() &&
                target.getMonth() === visibleMonth.getMonth()
            if (!inVisibleMonth) {
                const monthStart = new Date(target.getFullYear(), target.getMonth(), 1)
                pendingMonthFocusRef.current = true
                pendingMonthFocusTargetRef.current = dateKeyOf(target)
                React.startTransition(() => setVisibleMonth(monthStart))
                return
            }
            const key = dateKeyOf(target)
            if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current)
            focusRafRef.current = requestAnimationFrame(() => {
                rootRef.current?.querySelector<HTMLElement>(`[data-date-key="${key}"]`)?.focus()
            })
        },
        [today, visibleMonth, dateKeyOf, maxMonthStart]
    )

    React.useEffect(() => {
        if (!selectedDate || !selectedTime) {
            if (lastReadyKeyRef.current !== "") {
                lastReadyKeyRef.current = ""
                onSelectionReady?.(undefined)
            }
            return
        }
        const key = `${selectedDate.getTime()}-${selectedTime}-${activeTimeFormat}`
        if (key === lastReadyKeyRef.current) return
        lastReadyKeyRef.current = key
        onSelectionReady?.(getPayload(selectedDate, selectedTime))
    }, [selectedDate, selectedTime, activeTimeFormat, onSelectionReady, getPayload])
    const gridFocusRestoreRef = React.useRef(false)
    React.useEffect(() => {
        if (typeof document === "undefined") return
        if (slotsLoading) {
            const ae = document.activeElement
            gridFocusRestoreRef.current = !!ae && !!rootRef.current?.contains(ae)
        } else if (gridFocusRestoreRef.current) {
            gridFocusRestoreRef.current = false
            const ae = document.activeElement
            if (!ae || ae === document.body) {
                const el = rootRef.current?.querySelector(
                    '[data-be-active-date="true"]'
                ) as HTMLElement | null
                el?.focus?.()
            }
        }
    }, [slotsLoading])

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "auto",
                minHeight: 300,
                borderRadius: surfaceRadius,
                background: surfaceBackground,
                ...(surfacePadding ? { padding: surfacePadding } : {}),
                ...shadowStyle(normalizedCalendarStyles?.shadow),
                color: resolvedTextColor,
                border: surfaceBorder,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                fontFamily: "inherit",
            }}
        >
            <div
                style={
                    isNarrow
                        ? {
                              display: "flex",
                              flexDirection: "column",
                              minHeight: 0,
                              flex: 1,
                          }
                        : {
                              display: "grid",
                              minHeight: 0,
                              flex: 1,
                              gridTemplateColumns:
                                  eventMetaStatus !== "disabled"
                                      ? "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)"
                                      : "minmax(0, 2fr) minmax(0, 1fr)",
                          }
                }
            >
                {eventMetaStatus !== "disabled" ? (
                    <section
                        aria-label={
                            eventMetaStatus === "ready" && eventMeta
                                ? eventMeta.organizerName || eventMeta.title
                                : CAL_META_LOADING_ARIA
                        }
                        aria-busy={eventMetaStatus === "loading" || undefined}
                        style={{
                            width: isNarrow ? "100%" : undefined,
                            minWidth: 0,
                            boxSizing: "border-box",
                            padding: isNarrow ? "12px 16px 14px" : "16px",
                            borderBottom: isNarrow
                                ? `1px solid ${withAlpha(borderColor, 0.6)}`
                                : undefined,
                            borderRight: isNarrow
                                ? undefined
                                : `1px solid ${withAlpha(borderColor, 0.6)}`,
                            minHeight: isNarrow ? undefined : 176,
                        }}
                    >
                        {eventMetaStatus === "ready" && eventMeta ? (
                            <CalEventInfoPanel
                                meta={eventMeta}
                                fallbackDurationMinutes={eventMetaFallbackDurationMinutes}
                                accentColor={accentColor}
                                textPrimaryColor={resolvedTextColor}
                                textSecondaryColor={mutedText}
                                borderColor={borderColor}
                                borderRadius={radius}
                                hourSuffix={hourSuffix}
                                minuteSuffix={minuteSuffix}
                            />
                        ) : eventMetaStatus === "failed" ? (
                            <div
                                style={{
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    color: mutedText,
                                }}
                            >
                                {calEventMetaUnavailableCopy}
                            </div>
                        ) : (
                            <div
                                aria-hidden="true"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <Skeleton
                                        width={40}
                                        height={40}
                                        borderRadius="50%"
                                        background={withAlpha(borderColor, 0.5)}
                                    />
                                    <Skeleton
                                        width="60%"
                                        height={14}
                                        borderRadius={7}
                                        background={withAlpha(borderColor, 0.5)}
                                    />
                                </div>
                                <Skeleton
                                    width="85%"
                                    height={18}
                                    borderRadius={7}
                                    background={withAlpha(borderColor, 0.5)}
                                />
                                <Skeleton
                                    width="45%"
                                    height={13}
                                    borderRadius={7}
                                    background={withAlpha(borderColor, 0.5)}
                                />
                                <Skeleton
                                    width="70%"
                                    height={13}
                                    borderRadius={7}
                                    background={withAlpha(borderColor, 0.5)}
                                />
                            </div>
                        )}
                    </section>
                ) : null}
                <section
                    aria-label={datePickerAriaLabel}
                    style={{
                        minWidth: 0,
                        padding: isNarrow ? "12px 12px 10px" : "16px",
                        boxSizing: "border-box",
                    }}
                >
                    <CalendarGrid
                        instanceId={instanceId || ""}
                        monthName={monthName}
                        yearLabel={yearLabel}
                        prevMonthLabel={prevMonthLabel}
                        nextMonthLabel={nextMonthLabel}
                        previousMonthAriaTemplate={previousMonthAriaTemplate}
                        nextMonthAriaTemplate={nextMonthAriaTemplate}
                        canGoPrev={canGoPrev}
                        canGoNext={canGoNext}
                        weekdayLabels={weekdayLabels}
                        cells={calendarCells}
                        visibleMonth={visibleMonth}
                        selectedDate={selectionUnresolved ? null : selectedDate}
                        today={today}
                        clockReady={clockReady}
                        slotsLoading={slotsLoading}
                        hoveredDateKey={hoveredDateKey}
                        isNarrow={isNarrow}
                        firstDayOfWeek={firstDayOfWeek}
                        dateKeyOf={dateKeyOf}
                        hasAvailability={hasKnownAvailability}
                        activeDateKey={activeDateKey}
                        locale={pageLocale()}
                        timeZone={timeZone}
                        accentColor={accentColor}
                        borderColor={borderColor}
                        subtleFill={subtleFill}
                        textColor={resolvedTextColor}
                        selectedAccentText={selectedAccentText}
                        mutedSoftText={mutedSoftText}
                        mutedText={mutedText}
                        tileFont={normalizedCalendarStyles?.font}
                        borderRadius={String(radius)}
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
                    prefersReducedMotion={prefersReducedMotion}
                    accentColor={accentColor}
                    softerFill={softerFill}
                    subtleBorder={subtleBorder}
                    borderColor={borderColor}
                    textColor={resolvedTextColor}
                    selectedAccentText={selectedAccentText}
                    selectedSurface={slotSelectedSurface}
                    selectedText={slotSelectedText}
                    mutedText={mutedText}
                    mutedSoftText={mutedSoftText}
                    backgroundColor={surfaceBackground}
                    borderRadius={String(radius)}
                    loadingLabel={loadingLabel}
                    slotsLoading={slotsLoading}
                    selectionPending={selectionUnresolved}
                    selectedDate={selectedDate}
                    fallbackDate={today}
                    clockReady={clockReady}
                    showTimesWithoutDate={showTimesWithoutDate}
                    pickDateToSeeTimesLabel={pickDateToSeeTimesLabel}
                    noTimesFallbackLabel={noTimesFallbackLabel}
                    timeSlotsAriaLabel={timeSlotsAriaLabel}
                    availableTimesAriaLabel={availableTimesAriaLabel}
                    timeOptions={timeOptions}
                    availableTimes={availableTimes}
                    selectedTime={selectedTime}
                    hoveredTime={hoveredTime}
                    setHoveredTime={setHoveredTime}
                    onSelectTime={handleSlotSelect}
                    isTimeElapsed={isTimeElapsed}
                    required={required}
                    timeZone={timeZone}
                    slotError={slotError}
                    slotErrorId={slotErrorId}
                />
            </div>
        </div>
    )
})

type StepType = "form" | "datetime"
type FieldType =
    | "text"
    | "email"
    | "phone"
    | "number"
    | "url"
    | "textarea"
    | "select"
    | "multiselect"
    | "segmented"
    | "pills"
    | "cards"
    | "checkbox"
    | "checkboxgroup"
    | "radio"
    // SYSTEM-CALENDAR: legacy marker type kept only as stored-value defense.
    | "calendar-widget"
type FlowStatus = "in-progress" | "submitting" | "success" | "error"

const FLOW_STATUS_TRANSITIONS: Record<FlowStatus, Array<FlowStatus>> = {
    "in-progress": ["submitting", "success", "error"],
    submitting: ["success", "error"],
    success: ["in-progress"],
    error: ["in-progress"],
}

interface FramerFont {
    fontFamily?: string
    fontSize?: number
    fontWeight?: number | string
    fontStyle?: string
    letterSpacing?: number | string
    lineHeight?: number | string
}

interface FramerBorderStyle {
    borderWidth?: number
    borderTopWidth?: number
    borderRightWidth?: number
    borderBottomWidth?: number
    borderLeftWidth?: number
    borderStyle?: string
    borderColor?: string
}

interface FieldStyleOverrides {
    font?: FramerFont
    labelFont?: FramerFont
    labelColor?: string
    textColor?: string
    placeholderColor?: string
    backgroundColor?: string
    border?: FramerBorderStyle
    borderColor?: string
    borderWidth?: number
    radius?: number | string
    padding?: string
    paddingY?: number
    paddingX?: number
    focusBorderColor?: string
    minHeight?: number
    spacing?: number
    selectedBackgroundColor?: string
    selectedTextColor?: string
    selectedBorderColor?: string
    selected?: FieldStyleOverrides
    accentColor?: string
    checkSize?: number
    shadow?: string
}

interface FieldConfig {
    id?: string
    label: string
    fieldType: FieldType
    placeholder?: string
    required: boolean
    options?: Array<string>
    optionValues?: Array<string>
    optionImages?: Array<string | OptionImageSource>
    optionDescriptions?: Array<string>
    maxLength?: number
    rows?: number
    width: "full" | "half"
    isPrimaryName?: boolean
    calFieldId?: string
    checkSize?: number
    validationRule?: "type" | "none" | "email" | "phone" | "min-length" | "custom-regex"
    minLength?: number
    customRegex?: string
    regexPreviewInput?: string
    styles?: FieldStyleOverrides
    choiceStyles?: FieldStyleOverrides
    segmentedStyles?: FieldStyleOverrides
    pillsStyles?: FieldStyleOverrides
    cardsStyles?: FieldStyleOverrides
    radioStyles?: FieldStyleOverrides
    checkStyles?: FieldStyleOverrides
    calendarStyles?: FieldStyleOverrides
}

interface StepConfig {
    id?: string
    enabled: boolean
    showHeader?: boolean
    stepType: StepType
    title: string
    subtitle?: string
    fields: FieldConfig[]
    layout: "single-column" | "two-column"
    alignment?: "left" | "center" | "right"
}

interface BookingEngineStyleProps {
    style?: React.CSSProperties
    styles: {
        // BE-118: the three header rows live in the Header subgroup now;
        // the flat keys stay as readable legacy carriers (rule-116 contract).
        header?: {
            contentAlignment?: "left" | "center" | "right"
            font?: FramerFont
            headingFont?: FramerFont
        }
        contentAlignment?: "left" | "center" | "right"
        accentColor: string
        accentForegroundColor: string
        surfaceColor: string
        textPrimaryColor: string
        borderColor: string
        borderRadius: string | number
        gap?: number
        progressGap?: number
        headingGap?: number
        footerGap?: number
        font?: FramerFont
        headingFont?: FramerFont
        fieldStyles?: FieldStyleOverrides
    }
    font: FramerFont
    headingFont?: FramerFont
    fieldStyles?: FieldStyleOverrides
    typography?: {
        font?: FramerFont
        headingFont?: FramerFont
    }
    transitionSettings?: {
        transition?: Transition
        variant?: "fadeRise" | "blurScale" | "slide" | "zoom" | "verticalSlide" | "blurSlide"
        thumbStiffness?: number
        thumbDamping?: number
    }
    transition: Transition
    transitionVariant?: "fadeRise" | "blurScale" | "slide" | "zoom" | "verticalSlide" | "blurSlide"
}

interface ButtonInteractionState {
    transition?: Transition
    scale?: number
    opacity?: number
    textColor?: string
    backgroundColor?: string
    border?: FramerBorderStyle
    shadow?: string
}
interface ButtonStyleGroup {
    text?: string
    textColor?: string
    backgroundColor?: string
    border?: {
        borderWidth?: number
        borderColor?: string
        borderStyle?: string
        borderTopWidth?: number
        borderRightWidth?: number
        borderBottomWidth?: number
        borderLeftWidth?: number
    }
    radius?: string | number
    padding?: string
    font?: FramerFont
    shadow?: string
    hover?: ButtonInteractionState
    pressed?: ButtonInteractionState
}
interface BookingEngineCopyProps {
    buttonLabels: {
        primaryButtonStyles?: ButtonStyleGroup
        secondaryButtonStyles?: ButtonStyleGroup
        calendarLinkStyles?: ButtonStyleGroup
        buttonTexts?: {
            continueLabel?: string
            backLabel?: string
            finalActionLabel?: string
            manageLinkLabel?: string
        }
        continueButton?: ButtonStyleGroup
        backButton?: ButtonStyleGroup
        finalActionButton?: ButtonStyleGroup
        continueLabel?: string
        backLabel?: string
        finalActionLabel?: string
        buttonsLayout?: {
            groupNavButtons?: boolean
            groupedNavAlignment?: "left" | "center" | "right"
            buttonOrder?: "backFirst" | "primaryFirst"
            buttonWidth?: "fit" | "fill"
        }
        groupNavButtons?: boolean
        groupedNavAlignment?: "left" | "center" | "right"
        buttonOrder?: "backFirst" | "primaryFirst"
        buttonWidth?: "fit" | "fill"
        bookAnotherButton?: ButtonStyleGroup
        addToCalendarButton?: ButtonStyleGroup
        retryButton?: ButtonStyleGroup
    }
    copy: {
        // BE-083 nested groups (new canonical path).
        success?: {
            successTitle?: string
            successSubtitle?: string
        }
        failure?: {
            errorTitle?: string
            errorSubtitle?: string
            unknownErrorLabel?: string
            errorFallbackMessage?: string
        }
        // Legacy flat carriers (pre-grouping canvases).
        successTitle?: string
        successSubtitle?: string
        errorTitle?: string
        errorSubtitle?: string
        stepCounterTemplate?: string
        rescheduleOrCancelLabel?: string
        stepProgressLabel?: string
        stepAnnouncementTemplate?: string
        unknownErrorLabel?: string
        errorFallbackMessage?: string
        calEventMetaUnavailableCopy: string
        errorCopy: ErrorCopy
        validation?: Partial<ValidationCopy>
    }
    validation?: Partial<ValidationCopy>
}

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
    calendar?: {
        title: string
        subtitle?: string
        surface?: FieldStyleOverrides
    }
    progressBar: {
        barVisible?: boolean
        visible?: boolean
        barStyle: "solid" | "dashed"
        showText?: boolean
        showTextContent?: boolean
        progressText?: "top" | "bottom"
        stepCountPosition?: "top" | "bottom"
        content?: {
            stepCounterTemplate?: string
            stepProgressLabel?: string
            stepAnnouncementTemplate?: string
        }
    }
    header?: {
        alignment?: "left" | "center" | "right"
        contentAlignment?: "left" | "center" | "right"
        terminalAlignment?: "left" | "center" | "right"
    }
    calApiKey: string
    calEventTypeId: string
    calApiBaseUrl?: string
    advanced?: {
        instanceId?: string
        calApiBaseUrl?: string
        copy?: BookingEngineProps["copy"]
    }
    instanceId?: string
    onAnalytics?: (eventName: string, payload?: Record<string, unknown>) => void
}

interface BookingEngineProps
    extends BookingEngineStyleProps,
        BookingEngineConfigProps,
        BookingEngineCopyProps {}

const EMAIL_REGEX = /^[^\s@]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/
const PHONE_REGEX = /^\+?[(]?\d{1,4}[)]?(?:[-\s.]?[(]?\d{1,4}[)]?){2,5}[-\s.]?\d{1,9}$/

const TOUCH_TARGET_MIN = 44
const BUTTON_MIN_HEIGHT = 32
const FORM_CONTENT_MIN_HEIGHT = 320
const COMPACT_BREAKPOINT = 768
function weeksInMonthView(year: number, month: number, firstDayOfWeek: number): number {
    const offset = (new Date(year, month, 1).getDay() - firstDayOfWeek + 7) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Math.ceil((offset + daysInMonth) / 7)
}
const TIME_SLOT_SKELETON_COUNT = 8
const PROGRESS_BAR_HEIGHT = 4
// BE-042: terminal marks are fixed 48px circles with 24px glyphs.
const CHECKMARK_ICON_SIZE = 48
const ERROR_ICON_SIZE = 48
// CARDS-GRID (BE-053): pure-CSS track sizing — no JS width measurement,
// so the first paint is already the final layout (no reload flash).
const CARDS_GRID_MIN_TRACK_PX = 160
const PILLS_TWO_PER_ROW_BREAKPOINT = 420
const PROGRESS_BAR_TRANSITION = {
    type: "spring",
    stiffness: 300,
    damping: 30,
} as const
const INSTANT_TRANSITION = { duration: 0 } as const
const CHOICE_FIELD_TYPES = ["select", "segmented", "pills", "cards", "radio"]
// BE-055/BE-056: multi-pick types store string arrays (Option A). They share the
// Options/Values authoring rows but never the first-option seed.
const MULTI_PICK_TYPES = ["multiselect", "checkboxgroup"]
const DEFAULT_MEETING_DURATION_MS = 30 * 60 * 1000
const DEFAULT_CAL_API_BASE_URL = "https://api.cal.com"
const DEFAULT_CAL_API_VERSION = "2024-09-04"
const CAL_BOOKING_API_VERSION = "2024-08-13"
const DEFAULT_ICS_FILENAME = "Booking Appointment.ics"
const DEFAULT_ICS_UID_DOMAIN = "@booking-engine"

function makeDefaultFormStep(): StepConfig {
    return {
        enabled: true,
        stepType: "form",
        title: "Your Details",
        subtitle: "Tell us a bit about yourself so we can prepare for your booking.",
        layout: "single-column",
        fields: [
            {
                label: "Full Name",
                fieldType: "text",
                placeholder: "Jane Smith",
                required: true,
                isPrimaryName: true,
                width: "full",
            },
            {
                label: "Email",
                fieldType: "email",
                placeholder: "jane.smith@example.com",
                required: true,
                width: "full",
            },
            {
                label: "Phone",
                fieldType: "phone",
                placeholder: "+1 (555) 123-4567",
                required: false,
                width: "full",
            },
        ],
    }
}

function makeDefaultNotesFormStep(n: number): StepConfig {
    return {
        enabled: true,
        stepType: "form",
        title: `Step ${n}`,
        subtitle: "",
        layout: "single-column",
        fields: [
            {
                label: "Notes",
                fieldType: "textarea",
                placeholder: "Anything we should know before your appointment?",
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
        fields: [
            {
                label: "Field Label",
                fieldType: "text",
                // BE-099: no placeholder key — a fresh blank field is
                // never-set, so the per-type default shows in preview.
                required: false,
                width: "full",
            },
        ],
    }
}

function getRuntimeFallbackStep(index: number): StepConfig {
    if (index === 0) return makeDefaultFormStep()
    if (index === 1) return makeDefaultNotesFormStep(index + 1)
    return makeDefaultBlankFormStep(index + 1)
}

function detectTimezone(): string {
    if (typeof window === "undefined" || typeof Intl === "undefined") return "UTC"
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    } catch {
        return "UTC"
    }
}

function useCoarsePointer(): boolean {
    const [coarse, setCoarse] = React.useState<boolean>(false)
    const beInteractive = useBeInteractive()
    React.useEffect(() => {
        if (!beInteractive) return
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
        try {
            setCoarse(window.matchMedia("(pointer: coarse)").matches)
        } catch {}
    }, [beInteractive])
    return coarse
}

let hydrationSafeIdCounter = 0
function useHydrationSafeId(prefix: string): string {
    const [id, setId] = React.useState<string>("")
    const beInteractive = useBeInteractive()
    React.useEffect(() => {
        if (!beInteractive) return
        hydrationSafeIdCounter += 1
        setId(`${prefix}-${hydrationSafeIdCounter}`)
    }, [prefix, beInteractive])
    return id
}

function isValidTimeZone(tz: string | null | undefined): tz is string {
    if (!tz) return false
    try {
        Intl.DateTimeFormat("en", { timeZone: tz })
        return true
    } catch {
        return false
    }
}

interface NormalizedField extends FieldConfig {
    id: string
    /** BE-052: runtime-computed marker for later duplicate Primary-Name
     *  flags (first-wins); drives the canvas-only escalation notice. */
    duplicatePrimaryName?: boolean
}

interface NormalizedStep extends Omit<StepConfig, "fields"> {
    id: string
    fields: NormalizedField[]
}

interface FilteredFieldOptions {
    options: Array<string>
    optionValues?: Array<string>
    optionImages?: Array<string | OptionImageSource>
    optionDescriptions?: Array<string>
}

function filterEmptyOptions(field: {
    options?: Array<string>
    optionValues?: Array<string>
    optionImages?: Array<string | OptionImageSource>
    optionDescriptions?: Array<string>
}): FilteredFieldOptions {
    const rawOptions = Array.isArray(field.options) ? field.options : []
    const keepIdx: Array<number> = []
    const options: Array<string> = []
    rawOptions.forEach((opt, i) => {
        if (typeof opt === "string" && opt.trim().length > 0) {
            keepIdx.push(i)
            options.push(opt)
        }
    })
    function pick<T>(arr: Array<T> | undefined): Array<T> | undefined {
        return Array.isArray(arr) ? keepIdx.map((i) => arr[i]) : arr
    }
    return {
        options,
        optionValues: pick(field.optionValues),
        optionImages: pick(field.optionImages),
        optionDescriptions: pick(field.optionDescriptions),
    }
}

function isStepAlignment(value: unknown): value is "left" | "center" | "right" {
    return value === "left" || value === "center" || value === "right"
}

// A Primary-Name flag counts only on text fields. Framer keeps a stored flag when
// the author flips a field's type away from text (the row hides, so it can never
// be unset) — treating it as live would false-positive duplicates, steal the
// attendee-name source, and drop the field from the payload. Stored value is kept
// so flipping back to text revives the author's original intent.
function isNameFlagged(field: { isPrimaryName?: boolean; fieldType?: string }): boolean {
    return field.isPrimaryName === true && field.fieldType === "text"
}

// BE-039: designations imply mandatory. Primary-Name and Email-typed
// fields are always required (the attendee name + contact the Cal.com
// booking needs); with no designation, the label-matched identity field
// is forced instead. Identity resolution is first-wins.
function applyMandatoryIdentityFields(steps: NormalizedStep[]): NormalizedStep[] {
    const allFields = steps.flatMap((step) => step.fields)
    const forcedIds = new Set<string>()
    const firstPrimary = allFields.find((field) => isNameFlagged(field))
    if (firstPrimary) forcedIds.add(firstPrimary.id)
    const firstEmail = allFields.find((field) => field.fieldType === "email")
    if (firstEmail) forcedIds.add(firstEmail.id)
    if (!allFields.some((field) => isNameFlagged(field))) {
        const fallbackName = findNameField(steps)
        if (fallbackName) forcedIds.add(fallbackName.id)
    }
    if (!allFields.some((field) => field.fieldType === "email")) {
        const fallbackContact = findEmailField(steps)
        if (fallbackContact) forcedIds.add(fallbackContact.id)
    }
    // BE-052: later Primary-Name flags are duplicates (first-wins runtime);
    // marked so the canvas can escalate at the exact field site.
    const duplicatePrimaryIds = new Set(
        allFields
            .filter(
                (field) =>
                    isNameFlagged(field) &&
                    firstPrimary !== undefined &&
                    field.id !== firstPrimary.id
            )
            .map((field) => field.id)
    )
    if (forcedIds.size === 0 && duplicatePrimaryIds.size === 0) return steps
    return steps.map((step) => ({
        ...step,
        fields: step.fields.map((field) => {
            let next = field
            if (forcedIds.has(field.id)) next = { ...next, required: true }
            if (duplicatePrimaryIds.has(field.id)) next = { ...next, duplicatePrimaryName: true }
            return next
        }),
    }))
}

function resurrectNameField(steps: NormalizedStep[]): NormalizedStep[] {
    if (steps.some((step) => step.fields.some((field) => isNameFlagged(field)))) return steps
    if (findNameField(steps)) return steps
    const nameField: NormalizedField = {
        id: "auto-name-field",
        label: "Full Name",
        fieldType: "text",
        required: true,
        isPrimaryName: true,
        width: "full",
        validationRule: "type",
        minLength: undefined,
        maxLength: 0,
        customRegex: undefined,
        regexPreviewInput: undefined,
    }
    if (steps.length === 0) {
        return [
            {
                id: "step-auto-name",
                enabled: true,
                showHeader: true,
                stepType: "form",
                title: "Your details",
                subtitle: "",
                layout: "single-column",
                fields: [nameField],
            },
        ]
    }
    const [first, ...rest] = steps
    return [{ ...first, fields: [nameField, ...first.fields] }, ...rest]
}

function normalizeSteps(steps: StepConfig[]): NormalizedStep[] {
    return applyMandatoryIdentityFields(
        resurrectNameField(
            (steps || [])
                .map((step, stepIdx) => ({
                ...step,
                id: `step-${stepIdx}`,
                enabled: step.enabled !== false,
                showHeader: step.showHeader !== false,
                stepType: step.stepType || "form",
                title: step.title || `Step ${stepIdx + 1}`,
                subtitle: step.subtitle || "",
                layout: step.layout || "single-column",
                fields: (step.fields || []).map((field, fieldIdx) => ({
                    ...field,
                    id: `step-${stepIdx}-field-${fieldIdx}`,
                    required: field.required === true,
                    fieldType: field.fieldType || "text",
                    width: field.width || "full",
                    ...filterEmptyOptions(field),
                    validationRule: "type" as const,
                    minLength: undefined,
                    maxLength: 0,
                    customRegex: undefined,
                    regexPreviewInput: undefined,
                })),
            }))
            .filter((step) => !(step.stepType === "form" && step.fields.length === 0))
            .filter((step) => (step.stepType as string) !== "review")
        )
    )
}

interface CalendarStageConfig {
    title: string
    subtitle: string
    surface?: FieldStyleOverrides
}
const SYSTEM_CALENDAR_ID = "system-calendar"
// Cal.com system slugs that must never auto-inject, even when visible (BE-068):
// rescheduleReason belongs to the reschedule flow only; guests (Multiple Emails)
// has no engine counterpart by design and empty matches the official default.
const SYSTEM_EXCLUDED_CAL_SLUGS: ReadonlySet<string> = new Set(["reschedulereason", "guests"])
const MAX_SYSTEM_STAGES = 2
const DEFAULT_CALENDAR_TITLE = "Pick a Time"
const DEFAULT_CALENDAR_SUBTITLE = "Choose a date and time that works for you."
function migrateLegacyCalendar(slots: StepConfig[]): {
    steps: StepConfig[]
    calendar: CalendarStageConfig
} {
    const datetimeSlots = (slots || []).filter(
        (slot) => slot && (slot.stepType as string) === "datetime"
    )
    const src = datetimeSlots.length > 0 ? datetimeSlots[0] : undefined
    const srcMarkers = (src?.fields || []).filter(
        (field) => field && field.fieldType === "calendar-widget"
    )
    const configuredMarker = srcMarkers.find((marker) => marker.calendarStyles !== undefined)
    const calendar: CalendarStageConfig = {
        title: src?.title || DEFAULT_CALENDAR_TITLE,
        subtitle: src && src.subtitle !== undefined ? src.subtitle : DEFAULT_CALENDAR_SUBTITLE,
        surface: configuredMarker
            ? configuredMarker.calendarStyles
            : srcMarkers.length > 0
              ? srcMarkers[0].calendarStyles
              : undefined,
    }
    const steps = (slots || []).map((slot) => {
        const fields = (slot?.fields || []).filter(
            (field) => field && field.fieldType !== "calendar-widget"
        )
        if (!slot || (slot.stepType as string) !== "datetime") {
            return slot ? { ...slot, fields } : slot
        }
        return {
            ...slot,
            stepType: "form" as const,
            fields,
        }
    })
    return { steps, calendar }
}

const MIN_TEXT_LENGTH = 3

type ValidationCopy = {
    requiredFieldError: string
    emailError: string
    phoneError: string
    numberError: string
    urlError: string
    minLengthError: string
    maxLengthError: string
    pickDateTimeError: string
    pastTimeError: string
    minLength: number
}

const DEFAULT_VALIDATION_COPY: ValidationCopy = {
    requiredFieldError: "This field is required",
    emailError: "Enter a valid email address",
    phoneError: "Enter a valid phone number",
    numberError: "Enter a valid number",
    urlError: "Enter a valid URL",
    minLengthError: "Must be at least 3 characters",
    maxLengthError: "Must be at most {max} characters",
    pickDateTimeError: "Please pick a date and time",
    pastTimeError: "Please pick a future time",
    minLength: MIN_TEXT_LENGTH,
}

function validateField(
    field: NormalizedField,
    value: string | boolean | Array<string> | undefined,
    validationCopy?: ValidationCopy
): string | null {
    const vc = validationCopy ?? DEFAULT_VALIDATION_COPY
    if (field.fieldType === "calendar-widget") return null
    if (field.fieldType === "checkbox" && field.required && value !== true) {
        return vc.requiredFieldError
    }
    const isEmpty =
        value === undefined ||
        value === "" ||
        value === false ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "")
    if (field.required && isEmpty) {
        return vc.requiredFieldError
    }
    if (isEmpty) return null
    const str = String(value)
    if (
        field.fieldType === "text" ||
        field.fieldType === "email" ||
        field.fieldType === "phone" ||
        field.fieldType === "number" ||
        field.fieldType === "url" ||
        field.fieldType === "textarea"
    ) {
        const maxLen = effectiveMaxLength(field)
        if (str.length > maxLen) {
            return vc.maxLengthError.replace("{max}", String(maxLen))
        }
    }
    const minLength = field.minLength ?? vc.minLength
    if (field.fieldType === "email" && !EMAIL_REGEX.test(str.trim())) {
        return vc.emailError
    }
    if (field.fieldType === "phone") {
        return validatePhone(str, vc)
    }
    if (field.fieldType === "number") {
        return isValidNumberInput(str) ? null : vc.numberError
    }
    if (field.fieldType === "url") {
        return isValidUrlInput(str) ? null : vc.urlError
    }
    if (
        field.required &&
        (field.fieldType === "text" || field.fieldType === "textarea") &&
        Array.from(str.trim()).length < minLength
    ) {
        return vc.minLengthError
    }
    return null
}

function validatePhone(str: string, vc: ValidationCopy): string | null {
    const trimmed = str.trim()
    if (!PHONE_REGEX.test(trimmed)) return vc.phoneError
    const withoutPairs = trimmed.replace(/\([^()]*\)/g, " ")
    if (/[()]/.test(withoutPairs)) {
        return vc.phoneError
    }
    const digits = trimmed.replace(/\D/g, "").length
    if (digits < 7) return vc.phoneError
    return null
}

const PHONE_DISALLOWED_CHARS = /[^0-9+()\-. ]/g
function sanitizePhoneInput(value: string): string {
    return value.replace(PHONE_DISALLOWED_CHARS, "")
}

// BE-092: number fields accept digits and a single leading minus only.
// Letters, the decimal point, and every other symbol are stripped at the
// write point so they never appear (rule 97 phone precedent). The PLUS SIGN
// IS NOT RECOGNIZED AT ALL — stripped like a letter (author order, BE-100):
// Cal.com ignores it completely, and a phone-number use belongs to the phone
// type, never number. A repeat or interior minus is swallowed (the key simply
// does not register): "-1" + "-" stays "-1", so "-1" + "1" is "-11".
// BE-100: Cal.com's exact blur cleanup — a leading "+" is dropped and
// everything from the first remaining "+" is cut ("+1" → "1", "1+5" → "1").
// Typing can never produce "+" (stripped at write), so this fires for legacy
// or pasted values; minus is never touched on blur.
const NUMBER_DISALLOWED_CHARS = /[^0-9-]/g
function sanitizeNumberInput(value: string): string {
    const clean = value.replace(NUMBER_DISALLOWED_CHARS, "")
    if (!clean) return ""
    const collapsed = clean.replace(/-{2,}/g, "-")
    if (!collapsed.startsWith("-")) return collapsed.replace(/-/g, "")
    return `-${collapsed.slice(1).replace(/-/g, "")}`
}
function normalizeNumberOnBlur(value: string): string {
    let s = value || ""
    if (s.startsWith("+")) s = s.slice(1)
    const cut = s.indexOf("+")
    return cut >= 0 ? s.slice(0, cut) : s
}

function isValidNumberInput(str: string): boolean {
    const t = str.trim().replace(/\s/g, "")
    if (!t) return false
    return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(t)
}

function isValidUrlInput(str: string): boolean {
    const t = str.trim()
    if (!t || /\s/.test(t)) return false
    const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(t) ? t : `https://${t}`
    try {
        const u = new URL(withScheme)
        return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".")
    } catch {
        return false
    }
}

function validateStep(
    step: NormalizedStep,
    values: BookingValues,
    validationCopy?: ValidationCopy
): { valid: boolean; errors: Record<string, string | null> } {
    const vc = validationCopy ?? DEFAULT_VALIDATION_COPY
    if (step.stepType === "datetime") {
        const errors: Record<string, string | null> = {}
        for (const field of step.fields) {
            errors[field.id] = validateField(field, values[field.id], validationCopy)
        }
        const slot = values[SELECTED_SLOT_KEY]
        if (!slot) {
            errors[SELECTED_SLOT_KEY] = vc.pickDateTimeError
        } else {
            const slotDateMs =
                slot.date instanceof Date && !Number.isNaN(slot.date.getTime())
                    ? slot.date.getTime()
                    : Number.NaN
            const isIsoSlot = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h)
            let startMs: number
            if (isIsoSlot) {
                startMs = new Date(slot.time24h).getTime()
            } else if (!Number.isNaN(slotDateMs)) {
                const d = new Date(
                    slot.date.getFullYear(),
                    slot.date.getMonth(),
                    slot.date.getDate()
                )
                d.setMinutes(parseTimeToMinutes(slot.time24h))
                startMs = d.getTime()
            } else {
                startMs = Number.NaN
            }
            if (Number.isNaN(startMs)) {
                errors[SELECTED_SLOT_KEY] = vc.pickDateTimeError
            } else if (startMs <= Date.now()) {
                errors[SELECTED_SLOT_KEY] = vc.pastTimeError
            }
        }
        const valid = Object.values(errors).every((error) => error === null)
        return { valid, errors }
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

function clearedStepErrors(
    prev: Record<string, string | null>,
    step: NormalizedStep
): Record<string, string | null> {
    const ids: Array<string> = step.fields.map((field) => field.id)
    if (step.stepType === "datetime") ids.push(SELECTED_SLOT_KEY)
    let dirty = false
    for (const id of ids) {
        if (prev[id] !== undefined && prev[id] !== null) {
            dirty = true
            break
        }
    }
    if (!dirty) return prev
    const next = { ...prev }
    for (const id of ids) next[id] = null
    return next
}

interface CalSlot {
    start: string
    end?: string
}

function normalizeCalSlot(s: unknown): CalSlot | null {
    if (typeof s !== "object" || s === null) return null
    const raw = s as { start?: unknown; time?: unknown; end?: unknown }
    const start = typeof raw.start === "string" ? raw.start : raw.time
    if (typeof start !== "string" || start.length === 0) return null
    if (raw.end !== undefined && typeof raw.end !== "string") return null
    return {
        start,
        ...(typeof raw.end === "string" && raw.end.length > 0 ? { end: raw.end } : {}),
    }
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
    refetch: () => void
    settledKey: string | null
}

function monthCacheKey(
    monthStart: Date,
    timeZone: string,
    apiKey: string,
    eventTypeId: string,
    apiBase: string
): string {
    return `${getDateKeyInTimeZone(monthStart, timeZone || "").slice(0, 7)}|${timeZone}|${apiKey}|${eventTypeId}|${apiBase}`
}

const FETCH_TIMEOUT_MS = 18000

const CAL_RATE_LIMIT_MEMORY_MS = 90 * 1000
let lastCalRateLimitAt = 0
function noteCalRateLimit(): void {
    lastCalRateLimitAt = Date.now()
}
function recentCalRateLimit(): boolean {
    return lastCalRateLimitAt > 0 && Date.now() - lastCalRateLimitAt < CAL_RATE_LIMIT_MEMORY_MS
}

let BE_INTERACTIVE = false
const BE_INTERACTIVE_LISTENERS = new Set<() => void>()

function beSetInteractive(): void {
    if (BE_INTERACTIVE) return
    BE_INTERACTIVE = true
    for (const listener of Array.from(BE_INTERACTIVE_LISTENERS)) {
        try {
            listener()
        } catch {}
    }
}

const BE_INTERACTION_EVENTS: Array<keyof WindowEventMap> = [
    "pointermove",
    "pointerdown",
    "keydown",
    "touchstart",
    "wheel",
]

if (typeof window !== "undefined") {
    if (RenderTarget.current() === RenderTarget.canvas) {
        beSetInteractive()
    } else {
        for (const type of BE_INTERACTION_EVENTS) {
            window.addEventListener(type, beSetInteractive, {
                once: true,
                capture: true,
                passive: true,
            })
        }
    }
}

function useBeInteractive(): boolean {
    const [interactive, setInteractive] = React.useState(BE_INTERACTIVE)
    React.useEffect(() => {
        if (BE_INTERACTIVE) {
            setInteractive(true)
            return
        }
        const listener = () => setInteractive(true)
        BE_INTERACTIVE_LISTENERS.add(listener)
        return () => {
            BE_INTERACTIVE_LISTENERS.delete(listener)
        }
    }, [])
    return interactive
}

const calSlotsCache = new Map<
    string,
    {
        slots: Array<{
            value: string
            label: string
            end?: string
            minutes: number
        }>
        fetchedAt: number
    }
>()

interface CalSlotsOutcome {
    error: string | null
}
const calSlotsInflight = new Map<string, Promise<CalSlotsOutcome>>()

const SLOTS_CACHE_TTL_MS = 5 * 60 * 1000

class HttpFetchError extends Error {
    status?: number
    retryAfterSeconds?: number
    constructor(message: string, status?: number, retryAfterSeconds?: number) {
        super(message)
        this.name = "HttpFetchError"
        this.status = status
        this.retryAfterSeconds = retryAfterSeconds
    }
}

function useCalcomSlots(
    apiKey: string,
    eventTypeId: string,
    monthStart: Date | null,
    timeZone: string,
    fallbackErrorLabel?: string,
    errorCopy?: Partial<ErrorCopy>,
    timeoutMs?: number,
    apiBaseUrl?: string,
    apiVersion?: string,
    cacheTtlMs?: number
): UseCalcomSlotsResult {
    const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopy || {}) }
    const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "")
    const apiVer = apiVersion || DEFAULT_CAL_API_VERSION
    const cacheTtl =
        typeof cacheTtlMs === "number" && cacheTtlMs >= 0 ? cacheTtlMs : SLOTS_CACHE_TTL_MS
    const isStaticRender = useIsStaticRenderer()
    const beInteractive = useBeInteractive()
    const [slots, setSlots] = React.useState<
        Array<{ value: string; label: string; end?: string; minutes: number }>
    >([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [settledKey, setSettledKey] = React.useState<string | null>(null)
    const cacheRef =
        React.useRef<
            Map<
                string,
                {
                    slots: Array<{
                        value: string
                        label: string
                        end?: string
                        minutes: number
                    }>
                    fetchedAt: number
                }
            >
        >(calSlotsCache)
    const [refreshNonce, setRefreshNonce] = React.useState(0)
    const refetch = React.useCallback(() => {
        if (!monthStart) return
        cacheRef.current.delete(monthCacheKey(monthStart, timeZone, apiKey, eventTypeId, apiBase))
        setRefreshNonce((count) => count + 1)
    }, [monthStart, timeZone, apiKey, eventTypeId, apiBase])

    React.useEffect(() => {
        cacheRef.current.clear()
    }, [apiKey, eventTypeId, timeZone, apiBase])

    React.useEffect(() => {
        if (!beInteractive) return
        if (!apiKey || !eventTypeId || !monthStart) {
            setLoading(false)
            return
        }
        if (typeof window === "undefined") {
            setLoading(false)
            return
        }
        if (isStaticRender) {
            setLoading(false)
            return
        }

        const monthKey = monthCacheKey(monthStart, timeZone, apiKey, eventTypeId, apiBase)
        const cached = cacheRef.current.get(monthKey)
        if (cached && Date.now() - cached.fetchedAt < cacheTtl) {
            setSlots(cached.slots)
            setLoading(false)
            setError(null)
            setSettledKey(monthKey)
            return
        }
        const inflight = calSlotsInflight.get(monthKey)
        if (inflight) {
            setLoading(true)
            setError(null)
            inflight.then((outcome) => {
                if (cancelled) return
                const fresh = cacheRef.current.get(monthKey)
                if (fresh) {
                    setSlots(fresh.slots)
                    setError(null)
                } else if (outcome.error) {
                    setError(outcome.error)
                    setSlots([])
                }
                setLoading(false)
                setSettledKey(monthKey)
            })
            return () => {
                cancelled = true
            }
        }

        let cancelled = false
        let resolveInflight!: (outcome: CalSlotsOutcome) => void
        const inflightPromise = new Promise<CalSlotsOutcome>((resolve) => {
            resolveInflight = resolve
        })
        calSlotsInflight.set(monthKey, inflightPromise)
        const settleInflight = (outcome: CalSlotsOutcome): void => {
            if (calSlotsInflight.get(monthKey) === inflightPromise) {
                calSlotsInflight.delete(monthKey)
            }
            resolveInflight(outcome)
        }
        const backoffTimers: number[] = []
        const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
        start.setDate(start.getDate() - 15)
        const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59)
        end.setDate(end.getDate() + 15)
        const startStr = start.toISOString()
        const endStr = end.toISOString()
        const url = `${apiBase}/v2/slots?eventTypeId=${encodeURIComponent(
            eventTypeId
        )}&start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(
            endStr
        )}&timeZone=${encodeURIComponent(timeZone)}&format=range`

        setLoading(true)
        setError(null)
        setSettledKey(null)
        setSlots([])

        const controller = new AbortController()
        const timeoutMsValue = timeoutMs ?? FETCH_TIMEOUT_MS

        const attempt = (triesLeft: number) => {
            if (typeof navigator !== "undefined" && navigator.onLine === false) {
                setError(copy.offlineError)
                setSlots([])
                setLoading(false)
                setSettledKey(monthKey)
                return
            }
            const attemptTimeoutId = window.setTimeout(() => controller.abort(), timeoutMsValue)
            fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "cal-api-version": apiVer,
                },
                signal: controller.signal,
            })
                .then(async (res) => {
                    if (!res.ok) {
                        let retryAfterSeconds: number | undefined
                        const retryAfter = res.headers.get("retry-after")
                        if (retryAfter) {
                            const asSeconds = Number(retryAfter)
                            if (Number.isFinite(asSeconds) && asSeconds > 0) {
                                retryAfterSeconds = asSeconds
                            } else {
                                const asDate = new Date(retryAfter).getTime()
                                if (Number.isFinite(asDate)) {
                                    retryAfterSeconds = Math.max(
                                        0,
                                        Math.ceil((asDate - Date.now()) / 1000)
                                    )
                                }
                            }
                        }
                        throw new HttpFetchError(
                            `HTTP ${res.status}`,
                            res.status,
                            retryAfterSeconds
                        )
                    }
                    const json = await readJson<
                        | { data?: unknown[] }
                        | {
                              data?: {
                                  slots?: Record<string, unknown[]>
                              }
                          }
                        | { slots?: unknown[] }
                        | unknown[]
                    >(res)
                    if (cancelled) return
                    let rawSlots: unknown[] = []
                    if (json && typeof json === "object" && !Array.isArray(json)) {
                        const body = json as { data?: unknown; slots?: unknown }
                        const data = body.data
                        if (Array.isArray(data)) {
                            rawSlots = data
                        } else if (data && typeof data === "object") {
                            const slots = (data as { slots?: unknown }).slots
                            if (slots && typeof slots === "object") {
                                rawSlots = Object.values(slots).flat()
                            } else {
                                rawSlots = Object.values(data).flat()
                            }
                        } else if (Array.isArray(body.slots)) {
                            rawSlots = body.slots
                        }
                    } else if (Array.isArray(json)) {
                        rawSlots = json
                    }
                    const mapped = rawSlots
                        .map(normalizeCalSlot)
                        .filter((slot): slot is CalSlot => slot !== null)
                        .map((slot) => {
                            const d = new Date(slot.start)
                            const minutes = getMinutesInTimeZone(d, timeZone)
                            return {
                                value: slot.start,
                                label: formatTimeLabel(minutes, "12h"),
                                end: slot.end,
                                minutes,
                            }
                        })
                        .filter((slot) => !Number.isNaN(slot.minutes))
                        .sort((a, b) => (a.value < b.value ? -1 : 1))
                    cacheRef.current.set(monthKey, {
                        slots: mapped,
                        fetchedAt: Date.now(),
                    })
                    settleInflight({ error: null })
                    if (cancelled) return
                    setSlots(mapped)
                    setLoading(false)
                    setSettledKey(monthKey)
                })
                .catch((err: unknown) => {
                    const httpErr = err instanceof HttpFetchError ? err : null
                    const plainErr = err instanceof Error ? err : null
                    const timedOut = plainErr?.name === "AbortError"
                    const status = httpErr?.status
                    if (
                        !cancelled &&
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
                    let message: string
                    if (timedOut) {
                        message = copy.slotsTimeoutError
                    } else if (status === 401 || status === 403) {
                        message = copy.credentialError
                    } else if (status === 404) {
                        message = copy.slotsNotFoundError
                    } else if (status === 429) {
                        noteCalRateLimit()
                        const waitSeconds =
                            typeof httpErr?.retryAfterSeconds === "number"
                                ? httpErr.retryAfterSeconds
                                : undefined
                        message =
                            waitSeconds !== undefined && waitSeconds > 0
                                ? copy.slotsRateLimitTemplate.replace(
                                      "{seconds}",
                                      String(Math.min(waitSeconds, 90))
                                  )
                                : copy.slotsRateLimitGenericError
                    } else if (status && status >= 500) {
                        message = copy.slotsUnavailableError
                    } else {
                        message =
                            plainErr?.message === MALFORMED_JSON_ERROR
                                ? copy.slotsFallbackError
                                : plainErr instanceof TypeError || plainErr?.name === "TypeError"
                                  ? recentCalRateLimit()
                                      ? copy.slotsRateLimitGenericError
                                      : copy.networkError
                                  : fallbackErrorLabel || copy.slotsFallbackError
                    }
                    setError(message)
                    settleInflight({ error: message })
                    if (cancelled) return
                    setSlots([])
                    setLoading(false)
                    setSettledKey(monthKey)
                })
                .finally(() => {
                    window.clearTimeout(attemptTimeoutId)
                })
        }
        attempt(2)

        return () => {
            cancelled = true
            controller.abort()
            if (calSlotsInflight.get(monthKey) === inflightPromise) {
                settleInflight({ error: null })
            }
            backoffTimers.forEach((id) => {
                window.clearTimeout(id)
            })
        }
    }, [
        apiKey,
        eventTypeId,
        monthStart,
        timeZone,
        refreshNonce,
        beInteractive,
        fallbackErrorLabel,
        errorCopy,
        timeoutMs,
        apiBase,
        apiVer,
        cacheTtl,
    ])

    return { slots, loading, error, refetch, settledKey }
}

const CAL_EVENT_TYPE_API_VERSION = "2024-06-14"
const CAL_META_LOADING_ARIA = "Loading meeting details"
const CAL_META_UNAVAILABLE_COPY = "Meeting details are temporarily unavailable."
const HYDRATION_PLACEHOLDER_TODAY = new Date(2024, 0, 1)
const EVENT_META_CACHE_TTL_MS = SLOTS_CACHE_TTL_MS

/** Normalized, all-optional metadata model the UI renders from. */
interface CalEventMeta {
    title?: string
    description?: string
    durationMinutes?: number
    multipleLengths?: number[]
    locationLabel?: string
    organizerName?: string
    avatarUrl?: string
}

const CAL_INTEGRATION_LABELS: Record<string, string> = {
    "cal-video": "Cal Video",
    "google-meet": "Google Meet",
    zoom: "Zoom",
    "whereby-video": "Whereby",
    "webex-video": "Webex",
    jitsi: "Jitsi",
    "office365-video": "Teams",
    "microsoft-teams-video": "Teams",
    "discord-video": "Discord",
    "facetime-video": "FaceTime",
    "signal-video": "Signal",
    "skype-video": "Skype",
    "telegram-video": "Telegram",
    "whatsapp-video": "WhatsApp",
}

function normalizeCalLocationLabel(raw: unknown): string | undefined {
    if (typeof raw !== "object" || raw === null) return undefined
    const loc = raw as {
        type?: unknown
        address?: unknown
        link?: unknown
        phone?: unknown
        integration?: unknown
    }
    const asString = (v: unknown): string | undefined =>
        typeof v === "string" && v.trim() ? v.trim() : undefined
    switch (loc.type) {
        case "address":
            return asString(loc.address)
        case "link":
            return asString(loc.link)
        case "phone":
            return asString(loc.phone)
        case "integration": {
            const key = typeof loc.integration === "string" ? loc.integration : ""
            return CAL_INTEGRATION_LABELS[key]
        }
        default:
            return undefined
    }
}

function normalizeCalEventMeta(data: unknown): CalEventMeta | null {
    if (typeof data !== "object" || data === null) return null
    const d = data as Record<string, unknown>
    const meta: CalEventMeta = {}
    const asString = (v: unknown): string | undefined =>
        typeof v === "string" && v.trim() ? v.trim() : undefined

    meta.title = asString(d.title)
    meta.description = asString(d.description)
    if (
        typeof d.lengthInMinutes === "number" &&
        Number.isFinite(d.lengthInMinutes) &&
        d.lengthInMinutes > 0
    ) {
        meta.durationMinutes = d.lengthInMinutes
    }
    if (typeof d.metadata === "object" && d.metadata !== null) {
        const raw = (d.metadata as Record<string, unknown>).multipleLengths
        if (Array.isArray(raw)) {
            const lengths = raw.filter(
                (v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0
            )
            if (lengths.length) meta.multipleLengths = lengths.slice(0, 20)
        }
    }
    if (Array.isArray(d.locations)) {
        for (const loc of d.locations) {
            const label = normalizeCalLocationLabel(loc)
            if (label) {
                meta.locationLabel = label
                break
            }
        }
    }

    const team =
        typeof d.team === "object" && d.team !== null ? (d.team as Record<string, unknown>) : null
    if (team) {
        meta.organizerName = asString(team.name)
        meta.avatarUrl = asString(team.logoUrl)
    }
    if (!meta.organizerName || !meta.avatarUrl) {
        const hosts = Array.isArray(d.hosts) ? d.hosts : null
        const users = Array.isArray(d.users) ? d.users : null
        let person: Record<string, unknown> | null = null
        if (hosts?.length) {
            for (const h of hosts) {
                if (
                    typeof h === "object" &&
                    h !== null &&
                    (h as Record<string, unknown>).mandatory === true
                ) {
                    person = h as Record<string, unknown>
                    break
                }
            }
            if (!person && typeof hosts[0] === "object" && hosts[0] !== null) {
                person = hosts[0] as Record<string, unknown>
            }
        }
        if (!person && users && users.length) {
            const ownerId = typeof d.ownerId === "number" ? d.ownerId : undefined
            for (const u of users) {
                if (
                    typeof u === "object" &&
                    u !== null &&
                    ownerId !== undefined &&
                    (u as Record<string, unknown>).id === ownerId
                ) {
                    person = u as Record<string, unknown>
                    break
                }
            }
            if (!person && typeof users[0] === "object" && users[0] !== null) {
                person = users[0] as Record<string, unknown>
            }
        }
        if (person) {
            if (!meta.organizerName) meta.organizerName = asString(person.name)
            if (!meta.avatarUrl) meta.avatarUrl = asString(person.avatarUrl)
        }
    }

    return Object.keys(meta).length ? meta : null
}

interface CalBookingField {
    slug: string
    label: string
    type: string
    required: boolean
    hidden: boolean
    isDefault: boolean
    placeholder?: string
    options?: string[]
    // BE-061: Cal.com name-question variant, captured verbatim from the
    // event-type response ("fullName" default, "firstAndLastName" split).
    // Anything else normalizes to undefined — never guessed.
    variant?: "fullName" | "firstAndLastName"
}

function normalizeCalBookingFields(data: unknown): CalBookingField[] {
    if (typeof data !== "object" || data === null) return []
    const d = data as Record<string, unknown>
    const rawFields = Array.isArray(d.bookingFields) ? d.bookingFields : []
    const out: CalBookingField[] = []
    for (const raw of rawFields) {
        if (typeof raw !== "object" || raw === null) continue
        const f = raw as Record<string, unknown>
        const slug = typeof f.slug === "string" ? f.slug.trim() : ""
        if (!slug) continue
        const label = typeof f.label === "string" && f.label.trim() ? f.label.trim() : slug
        const type = typeof f.type === "string" ? f.type : "text"
        const required = f.required === true
        const hidden = f.hidden === true
        const isDefault = f.isDefault === true
        const placeholder = typeof f.placeholder === "string" ? f.placeholder : undefined
        // BE-061: capture the name variant verbatim (documented Cal.com
        // vocabulary: "fullName" | "firstAndLastName"). Unknown values stay
        // undefined — the payload path treats every non-split variant as one
        // full-name string, which Cal.com converts server-side (documented
        // prefill/conversion parity: "John Johny Janardan" → firstName "John",
        // lastName "John Janardan"; attendee.name is always a plain string in
        // the v2 bookings contract, so no second input and no shape change).
        const rawVariant = f.variant
        const variant =
            rawVariant === "fullName" || rawVariant === "firstAndLastName"
                ? rawVariant
                : undefined
        let options: string[] | undefined
        const rawOptions =
            (f as { options?: unknown; variants?: unknown }).options ??
            (f as { variants?: unknown }).variants
        if (Array.isArray(rawOptions)) {
            const parsed = rawOptions
                .map((o) => {
                    if (typeof o === "string") return o.trim()
                    if (typeof o === "object" && o !== null) {
                        const ro = o as Record<string, unknown>
                        if (typeof ro.label === "string" && ro.label.trim()) return ro.label.trim()
                        if (typeof ro.value === "string" && ro.value.trim()) return ro.value.trim()
                        if (typeof ro.option === "string" && ro.option.trim())
                            return ro.option.trim()
                    }
                    return ""
                })
                .filter((v) => v.length > 0)
            if (parsed.length) options = parsed
        }
        out.push({ slug, label, type, required, hidden, isDefault, placeholder, options, variant })
    }
    return out
}

function calTypeToFieldType(calType: string): FieldType {
    switch ((calType || "").toLowerCase()) {
        case "phone":
            return "phone"
        case "email":
            return "email"
        case "number":
            return "number"
        case "url":
            return "url"
        case "textarea":
        case "multilinetext":
            return "textarea"
        default:
            if (["multiselect"].includes((calType || "").toLowerCase())) {
                return "multiselect"
            }
            if (["checkboxgroup"].includes((calType || "").toLowerCase())) {
                return "checkboxgroup"
            }
            if (
                ["select", "radio", "radiogroup", "selectgroup"].includes(
                    (calType || "").toLowerCase()
                )
            ) {
                return "select"
            }
            if (["boolean", "checkbox"].includes((calType || "").toLowerCase())) {
                return "checkbox"
            }
            return "text"
    }
}

async function fetchCalEventTypeMeta(params: {
    apiKey: string
    eventTypeId: string
    apiBaseUrl?: string
    timeoutMs?: number
}): Promise<{ meta: CalEventMeta | null; bookingFields: CalBookingField[] }> {
    const { apiKey, eventTypeId, apiBaseUrl, timeoutMs } = params
    const parsedId = Number(eventTypeId)
    if (!apiKey || !eventTypeId || !Number.isFinite(parsedId))
        return { meta: null, bookingFields: [] }
    const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "")
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs ?? FETCH_TIMEOUT_MS)
    try {
        const res = await fetch(
            `${apiBase}/v2/event-types/${encodeURIComponent(String(parsedId))}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "cal-api-version": CAL_EVENT_TYPE_API_VERSION,
                },
                signal: controller.signal,
            }
        )
        if (!res.ok) return { meta: null, bookingFields: [] }
        const json = (await res.json().catch(() => null)) as unknown
        if (typeof json !== "object" || json === null) return { meta: null, bookingFields: [] }
        const data = (json as { data?: unknown }).data
        return { meta: normalizeCalEventMeta(data), bookingFields: normalizeCalBookingFields(data) }
    } catch {
        return { meta: null, bookingFields: [] }
    } finally {
        clearTimeout(timeoutId)
    }
}

const calEventMetaCache = new Map<
    string,
    { meta: CalEventMeta | null; bookingFields: CalBookingField[]; fetchedAt: number }
>()

type CalEventMetaStatus = "disabled" | "loading" | "ready" | "failed"

function useCalcomEventMeta(params: {
    enabled: boolean
    apiKey: string
    eventTypeId: string
    apiBaseUrl?: string
}): { status: CalEventMetaStatus; meta: CalEventMeta | null; bookingFields: CalBookingField[] } {
    const { enabled, apiKey, eventTypeId, apiBaseUrl } = params
    const [status, setStatus] = React.useState<CalEventMetaStatus>(() =>
        apiKey && eventTypeId ? "loading" : "disabled"
    )
    const [meta, setMeta] = React.useState<CalEventMeta | null>(null)
    const [bookingFields, setBookingFields] = React.useState<CalBookingField[]>([])
    const cacheKey = `${(apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "")}|${apiKey}|${eventTypeId}`
    React.useEffect(() => {
        if (!apiKey || !eventTypeId) {
            setStatus("disabled")
            setBookingFields([])
            return
        }
        if (!enabled) {
            return
        }
        const cached = calEventMetaCache.get(cacheKey)
        if (cached && Date.now() - cached.fetchedAt < EVENT_META_CACHE_TTL_MS) {
            setMeta(cached.meta)
            setBookingFields(cached.bookingFields || [])
            setStatus(cached.meta || cached.bookingFields.length ? "ready" : "failed")
            return
        }
        setStatus("loading")
        let cancelled = false
        fetchCalEventTypeMeta({ apiKey, eventTypeId, apiBaseUrl })
            .then((res) => {
                if (cancelled) return
                const hasData =
                    res.meta !== null || (res.bookingFields && res.bookingFields.length > 0)
                if (hasData) {
                    calEventMetaCache.set(cacheKey, {
                        meta: res.meta,
                        bookingFields: res.bookingFields,
                        fetchedAt: Date.now(),
                    })
                    setMeta(res.meta)
                    setBookingFields(res.bookingFields)
                    setStatus("ready")
                } else {
                    setMeta(null)
                    setBookingFields([])
                    setStatus("failed")
                }
            })
            .catch(() => {
                if (cancelled) return
                setMeta(null)
                setBookingFields([])
                setStatus("failed")
            })
        return () => {
            cancelled = true
        }
    }, [enabled, apiKey, eventTypeId, cacheKey, apiBaseUrl])
    return { status, meta, bookingFields }
}

interface SubmitBookingResult {
    success: boolean
    error: string | null
    bookingUid?: string
    rescheduleUrl?: string
    cancelUrl?: string
    errorCode?: string
    alreadyMapped?: boolean
    httpStatus?: number
}

interface BookingConfirmation {
    uid: string | null
    manageUrl: string | null
    rescheduleUrl: string | null
    cancelUrl: string | null
}

async function submitCalcomBooking(params: {
    apiKey: string
    eventTypeId: string
    slotStart: string
    slotEnd?: string
    allowLengthInMinutes?: boolean
    name: string
    email: string
    timeZone: string
    idempotencyKey?: string
    bookingFieldsResponses?: Record<string, string | Array<string>>
    externalSignal?: AbortSignal
    errorCopy?: Partial<ErrorCopy>
    timeoutMs?: number
    apiBaseUrl?: string
}): Promise<SubmitBookingResult> {
    const {
        apiKey,
        eventTypeId,
        slotStart,
        slotEnd,
        allowLengthInMinutes,
        name,
        email,
        timeZone,
        bookingFieldsResponses,
        externalSignal,
        errorCopy: errorCopyParam,
        timeoutMs,
        apiBaseUrl,
    } = params
    const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopyParam || {}) }
    const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "")
    const apiVer = CAL_BOOKING_API_VERSION
    const parsedEventTypeId = Number(eventTypeId)
    if (!eventTypeId || !Number.isFinite(parsedEventTypeId)) {
        return {
            success: false,
            error: copy.misconfiguredFormError,
        }
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotStart)) {
        return {
            success: false,
            error: copy.invalidSlotTimeError,
            errorCode: "INVALID_SLOT_START",
        }
    }
    const controller = new AbortController()
    const timeoutMsValue = timeoutMs ?? FETCH_TIMEOUT_MS
    const timeoutId = setTimeout(() => controller.abort(), timeoutMsValue)
    let externalAbortHandler: (() => void) | null = null
    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort()
        } else {
            externalAbortHandler = () => controller.abort()
            externalSignal.addEventListener("abort", externalAbortHandler, {
                once: true,
            })
        }
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
        console.warn("[BookingEngine] booking aborted: browser offline.")
        return {
            success: false,
            error: copy.offlineError,
            errorCode: "OFFLINE",
        }
    }
    try {
        const res = await fetch(`${apiBase}/v2/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "cal-api-version": apiVer,
                // CORS-BLOCK: X-Idempotency-Key triggers a failing preflight — never sent (see AGENTS.md).
            },
            body: JSON.stringify({
                eventTypeId: parsedEventTypeId,
                start: slotStart,
                ...(() => {
                    if (
                        !allowLengthInMinutes ||
                        !slotEnd ||
                        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotEnd)
                    ) {
                        return {}
                    }
                    const mins = Math.round(
                        (new Date(slotEnd).getTime() - new Date(slotStart).getTime()) / 60000
                    )
                    return Number.isFinite(mins) && mins >= 1 ? { lengthInMinutes: mins } : {}
                })(),
                attendee: {
                    name,
                    // BE-062: an empty email is omitted, never sent as "".
                    // Reachable only when the Cal email question is hidden
                    // (validation forces a non-empty email otherwise).
                    ...(email.trim() ? { email } : {}),
                    timeZone,
                    language:
                        (typeof navigator !== "undefined" && navigator.language?.slice(0, 2)) ||
                        "en",
                },
                metadata: {},
                ...(bookingFieldsResponses && Object.keys(bookingFieldsResponses).length
                    ? { bookingFieldsResponses }
                    : {}),
            }),
            signal: controller.signal,
        })
        interface CalcomSubmitResponseJson {
            data?: {
                booking?: { uid?: string; rescheduleUrl?: string; cancelUrl?: string }
                uid?: string
                id?: string
                rescheduleUrl?: string
                cancelUrl?: string
            }
            uid?: string
            id?: string
            rescheduleUrl?: string
            cancelUrl?: string
            error?: {
                message?: string
                code?: string
                errorCode?: string
            }
            message?: string
            code?: string
        }
        let json: CalcomSubmitResponseJson | null = null
        let bodyWasMalformed = false
        {
            const rawText = await res.text()
            if (rawText.trim()) {
                try {
                    json = JSON.parse(rawText) as CalcomSubmitResponseJson | null
                } catch {
                    json = null
                    bodyWasMalformed = true
                }
            }
        }
        if (!res.ok) {
            const apiError = json?.error?.message || json?.message || json?.error
            const code = json?.error?.code || json?.code || json?.error?.errorCode
            let retryAfterSeconds: number | undefined
            if (res.status === 429) {
                const retryAfter = res.headers.get("retry-after")
                if (retryAfter) {
                    const asSeconds = Number(retryAfter)
                    if (Number.isFinite(asSeconds) && asSeconds > 0) {
                        retryAfterSeconds = asSeconds
                    } else {
                        const asDate = new Date(retryAfter).getTime()
                        if (Number.isFinite(asDate)) {
                            retryAfterSeconds = Math.max(0, Math.ceil((asDate - Date.now()) / 1000))
                        }
                    }
                }
                if (retryAfterSeconds && retryAfterSeconds > 0) {
                    noteCalRateLimit()
                    console.error("[BookingEngine] booking:failure", {
                        endpoint: "POST /v2/bookings",
                        httpStatus: res.status,
                        category: "rate-limit",
                        errorCode: code || "RATE_LIMIT_EXCEEDED",
                        retryAfterSeconds,
                        calcomMessage: typeof apiError === "string" ? apiError : undefined,
                    })
                    return {
                        success: false,
                        error: copy.slotsRateLimitTemplate.replace(
                            "{seconds}",
                            String(Math.min(retryAfterSeconds, 90))
                        ),
                        errorCode: code || "RATE_LIMIT_EXCEEDED",
                        httpStatus: res.status,
                        alreadyMapped: true,
                    }
                }
            }
            if (apiError) {
                console.error("[BookingEngine] booking:failure", {
                    endpoint: "POST /v2/bookings",
                    httpStatus: res.status,
                    category:
                        res.status === 429
                            ? "rate-limit"
                            : res.status >= 500
                              ? "server"
                              : res.status === 401 || res.status === 403
                                ? "credentials"
                                : "calcom-validation",
                    errorCode: code || undefined,
                    calcomMessage: String(apiError),
                })
                if (res.status === 429) {
                    noteCalRateLimit()
                }
                return {
                    success: false,
                    error: String(apiError),
                    errorCode: code,
                    httpStatus: res.status,
                }
            }
            if (res.status === 429) {
                noteCalRateLimit()
            }
            console.error("[BookingEngine] booking:failure", {
                endpoint: "POST /v2/bookings",
                httpStatus: res.status,
                category:
                    res.status === 429
                        ? "rate-limit"
                        : res.status >= 500
                          ? "server"
                          : res.status === 401 || res.status === 403
                            ? "credentials"
                            : "calcom-validation",
                errorCode: code || undefined,
                calcomMessage: null,
            })
            return {
                success: false,
                error: copy.httpStatusTemplate.replace("{status}", String(res.status)),
                errorCode: code,
                httpStatus: res.status,
                alreadyMapped: true,
            }
        }
        if (
            bodyWasMalformed ||
            !json ||
            (typeof json === "object" && Object.keys(json).length === 0)
        ) {
            return {
                success: false,
                error: bodyWasMalformed ? copy.malformedResponseError : copy.emptyResponseError,
                errorCode: bodyWasMalformed ? MALFORMED_JSON_ERROR : "EMPTY_RESPONSE",
                alreadyMapped: true,
            }
        }
        const uid =
            json?.data?.booking?.uid || json?.data?.uid || json?.data?.id || json?.uid || json?.id
        if (!uid) {
            return {
                success: false,
                error: copy.emptyResponseError,
                errorCode: "NO_UID_IN_SUCCESS_RESPONSE",
                httpStatus: res.status,
                alreadyMapped: true,
            }
        }
        const rescheduleUrl =
            json?.data?.booking?.rescheduleUrl || json?.data?.rescheduleUrl || json?.rescheduleUrl
        const cancelUrl = json?.data?.booking?.cancelUrl || json?.data?.cancelUrl || json?.cancelUrl
        return {
            success: true,
            error: null,
            bookingUid: uid,
            ...(rescheduleUrl ? { rescheduleUrl } : {}),
            ...(cancelUrl ? { cancelUrl } : {}),
        }
    } catch (err: unknown) {
        const errObj =
            err instanceof Error ? (err as Error & { code?: string; errorCode?: string }) : null
        const timedOut = errObj?.name === "AbortError"
        const malformed = errObj?.message === MALFORMED_JSON_ERROR
        const opaqueAfterRateLimit =
            !timedOut &&
            !malformed &&
            (errObj instanceof TypeError || errObj?.name === "TypeError") &&
            recentCalRateLimit()
        const mappedError = timedOut
            ? copy.submitTimeoutError
            : malformed
              ? copy.malformedResponseError
              : opaqueAfterRateLimit
                ? copy.slotsRateLimitGenericError
                : mapCalcomError(errObj?.message || "", errObj?.code || errObj?.errorCode, copy)
        console.error("[BookingEngine] booking:failure", {
            endpoint: "POST /v2/bookings",
            category: timedOut
                ? "timeout"
                : malformed
                  ? "malformed-response"
                  : opaqueAfterRateLimit
                    ? "rate-limit"
                    : "network",
            errorCode: timedOut
                ? "TIMEOUT"
                : malformed
                  ? MALFORMED_JSON_ERROR
                  : opaqueAfterRateLimit
                    ? "RATE_LIMIT_EXCEEDED"
                    : errObj?.code || errObj?.errorCode || undefined,
            rawError: errObj?.message,
            recentRateLimit: recentCalRateLimit(),
        })
        return {
            success: false,
            error: mappedError,
            errorCode: timedOut
                ? "TIMEOUT"
                : malformed
                  ? MALFORMED_JSON_ERROR
                  : opaqueAfterRateLimit
                    ? "RATE_LIMIT_EXCEEDED"
                    : errObj?.code || errObj?.errorCode || "",
            alreadyMapped: true,
        }
    } finally {
        clearTimeout(timeoutId)
        if (externalAbortHandler && externalSignal) {
            externalSignal.removeEventListener("abort", externalAbortHandler)
            externalAbortHandler = null
        }
    }
}

function mapCalcomError(
    message: string,
    code?: string,
    errorCopy?: Partial<ErrorCopy>,
    fallback: string = DEFAULT_COPY_SUBMIT_ERROR_FALLBACK,
    status?: number
): string {
    const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopy || {}) }
    const m = (message || "").toLowerCase()
    // BE-040: attendee/contact failures render actionable copy, never raw
    // API text (message shapes: "Attendee must have at least one contact
    // method (email or phone number)", "attendee property is wrong").
    if (
        m.includes("contact method") ||
        (m.includes("attendee") &&
            (m.includes("email") || m.includes("phone") || m.includes("name")))
    ) {
        return copy.attendeeContactError
    }
    switch ((code || "").toUpperCase()) {
        case "UNAUTHORIZED":
        case "INVALID_API_KEY":
        case "API_KEY_INVALID":
            return copy.credentialError
        case "MAXIMUM_NUMBER_OF_BOOKINGS":
        case "BOOKING_LIMIT":
        case "NO_AVAILABILITY":
        case "SLOT_NOT_AVAILABLE":
        case "BOOKING_NOT_FOUND":
            return copy.timeTakenError
        case "INVALID_EMAIL_ADDRESS":
        case "INVALID_EMAIL":
            return copy.invalidEmailError
        case "RATE_LIMIT_EXCEEDED":
        case "RATE_LIMIT":
        case "TOO_MANY_REQUESTS":
            return copy.slotsRateLimitGenericError
        case "INTERNAL_ERROR":
        case "SERVER_ERROR":
        case "INTERNAL_SERVER_ERROR":
            return copy.slotsUnavailableError
        case "BAD_REQUEST":
        case "VALIDATION_ERROR":
        case "INVALID_REQUEST":
            return copy.badRequestError
        default:
            break
    }
    if (m.includes("already") && m.includes("booked")) return copy.timeTakenError
    if (m.includes("outside") || m.includes("availability")) return copy.timeNoLongerAvailableError
    if (m.includes("invalid") && m.includes("email")) return copy.invalidEmailError
    if (m.includes("unauthorized") || m.includes("api key")) return copy.credentialError
    if (m.includes("rate limit") || m.includes("too many requests"))
        return copy.slotsRateLimitGenericError
    if (m.includes("internal") || m.includes("server error")) return copy.slotsUnavailableError
    if (m.includes("network") || m.includes("fetch")) return copy.networkError
    if (status === 401 || status === 403) return copy.credentialError
    if (status === 429) return copy.slotsRateLimitGenericError
    if (status !== undefined && status >= 500) return copy.slotsUnavailableError
    if (status === 404) return copy.slotsNotFoundError
    if (status === 409) return copy.timeTakenError
    if (status !== undefined && status >= 400 && status < 500) {
        return copy.badRequestError
    }
    return fallback
}

function makeIdempotencyKey(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID()
    }
    return `bk-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const MALFORMED_JSON_ERROR = "MALFORMED_JSON_RESPONSE"

async function readJson<T extends Record<string, unknown> | unknown[]>(res: Response): Promise<T> {
    try {
        return (await res.json()) as T
    } catch {
        throw new Error(MALFORMED_JSON_ERROR)
    }
}

function findField(
    steps: NormalizedStep[],
    predicate: (field: NormalizedField) => boolean
): NormalizedField | null {
    for (const step of steps) {
        for (const field of step.fields) {
            if (predicate(field)) return field
        }
    }
    return null
}

function findNameField(steps: NormalizedStep[]): NormalizedField | null {
    const primary = findField(steps, (field) => isNameFlagged(field))
    if (primary) return primary
    return findField(steps, (field) => /\bname\b/i.test(field.label) || /\bname\b/i.test(field.id))
}

function findEmailField(steps: NormalizedStep[]): NormalizedField | null {
    const typed = findField(steps, (field) => field.fieldType === "email")
    if (typed) return typed
    return findField(steps, (field) => {
        if (field.fieldType !== "text") return false
        const hay = `${field.label} ${field.id}`.toLowerCase()
        return /\b(email|e-mail|mail|contact)\b/.test(hay)
    })
}

function replaceCopyTokens(
    text: string,
    steps: NormalizedStep[],
    values: BookingValues,
    timeZone?: string
): string {
    if (typeof text !== "string" || !text.includes("{")) return text
    const formFields = steps.flatMap((step) => step.fields) || []
    const nameField = formFields.find((field) => isNameFlagged(field)) || findEmailField(steps)
    const name = nameField ? String(values[nameField.id] ?? "").trim() : ""
    const slot = values[SELECTED_SLOT_KEY]
    const tzOpts = isValidTimeZone(timeZone) ? { timeZone } : undefined
    const dateOpts: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        ...tzOpts,
    }
    const date = slot
        ? /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
            ? getCachedDateTimeFormat(pageLocale(), dateOpts).format(new Date(slot.time24h))
            : getCachedDateTimeFormat(pageLocale(), dateOpts).format(slot.date)
        : ""
    return text.replace(/\{name\}/g, name).replace(/\{date\}/g, date)
}

function autocompleteToken(field: NormalizedField): string | undefined {
    const label = `${field.label} ${field.id}`.toLowerCase()
    if (field.fieldType === "email") return "email"
    if (field.fieldType === "phone") return "tel"
    if (field.fieldType === "text" && field.isPrimaryName) return "name"
    if (/\b(postal|zip)\b/.test(label)) return "postal-code"
    if (/\b(country|nation)\b/.test(label)) return "country"
    if (/\baddress\b[^,;]*\b(1|one|line)\b|\bstreet\b|\baddress line 1\b/.test(label))
        return "street-address"
    if (/\baddress\b[^,;]*\b(2|two)\b|\bapt\b|\bapartment\b|\bsuite\b|\bunit\b/.test(label))
        return "address-line2"
    if (/\b(state|province|region)\b/.test(label)) return "address-level1"
    if (/\b(city|town)\b/.test(label)) return "address-level2"
    if (/\borganization\b|\borganisation\b|\bcompany\b|\bemployer\b/.test(label))
        return "organization"
    if (/\btitle\b|\bjob title\b|\bposition\b|\bdepartment\b/.test(label))
        return "organization-title"
    if (/\b(email|e-mail|mail)\b/.test(label)) return "email"
    if (/\b(phone|tel|mobile|cell)\b/.test(label)) return "tel"
    if (/\b(first|given)\b/.test(label)) return "given-name"
    if (/\b(last|family|surname)\b/.test(label)) return "family-name"
    if (/\bname\b/.test(label)) return "name"
    return undefined
}

function slugifyLabel(label: string): string {
    return (label || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-")
}
function isEmptyPayloadValue(value: unknown): boolean {
    if (value === undefined || value === "" || value === false) return true
    if (Array.isArray(value)) return value.length === 0
    return typeof value === "string" && value.trim() === ""
}

function buildBookingFieldsResponses(
    steps: NormalizedStep[],
    values: BookingValues
): Record<string, string | Array<string>> {
    const out: Record<string, string | Array<string>> = {}
    for (const step of steps) {
        if (step.stepType !== "form" && step.stepType !== "datetime") continue
        for (const field of step.fields) {
            const value = values[field.id]
            if (isEmptyPayloadValue(value)) continue
            let key = (field.calFieldId || "").trim()
            if (!key) {
                if (
                    isNameFlagged(field) ||
                    field.fieldType === "email" ||
                    field.fieldType === "calendar-widget"
                )
                    continue
                key = slugifyLabel(field.label) || field.id
                if (!key) continue
            }
            // BE-055/BE-056: multi-pick fields submit the raw string array — Cal.com
            // expects a list for multiselect/checkbox-group kinds, never joined text.
            out[key] =
                field.fieldType === "phone"
                    ? sanitizePhoneInput(String(value))
                    : Array.isArray(value)
                      ? [...value]
                      : String(value)
        }
    }
    return out
}

function buildNotesPayload(
    steps: NormalizedStep[],
    values: BookingValues,
    timeZone?: string
): string {
    const lines: string[] = []
    for (const step of steps) {
        if (step.stepType !== "form" && step.stepType !== "datetime") continue
        if (!step.fields.length) continue
        const stepLines: string[] = []
        for (const field of step.fields) {
            if (isNameFlagged(field) || field.fieldType === "email") continue
            const value = values[field.id]
            if (isEmptyPayloadValue(value)) continue
            const shown =
                field.fieldType === "phone"
                    ? sanitizePhoneInput(String(value))
                    : Array.isArray(value)
                      ? value.join(", ")
                      : String(value)
            stepLines.push(`${field.label}: ${shown}`)
        }
        if (!stepLines.length) continue
        lines.push(step.title)
        lines.push(...stepLines)
        lines.push("")
    }
    if (values[SELECTED_SLOT_KEY]) {
        const slot = values[SELECTED_SLOT_KEY]
        const tzOpts = isValidTimeZone(timeZone) ? { timeZone } : undefined
        const dateOpts: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            ...tzOpts,
        }
        const dateStr = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
            ? getCachedDateTimeFormat(pageLocale(), dateOpts).format(new Date(slot.time24h))
            : getCachedDateTimeFormat(pageLocale(), dateOpts).format(slot.date)
        lines.push(DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL)
        lines.push(`${DEFAULT_COPY_NOTES_DATE_PREFIX}${dateStr}`)
        lines.push(`${DEFAULT_COPY_NOTES_TIME_PREFIX}${slot.timeLabel}`)
    }
    return lines.join("\n").trim()
}

function escapeIcsText(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n")
}

function foldIcsLines(lines: string[]): string {
    const encoder = new TextEncoder()
    const foldOne = (line: string): string => {
        if (encoder.encode(line).length <= 75) return line
        const chunks: string[] = []
        let remaining = line
        while (encoder.encode(remaining).length > 75) {
            let cut = 0
            let octets = 0
            while (cut < remaining.length && octets < 75) {
                const cp = remaining.codePointAt(cut)
                if (cp === undefined) break
                const size = cp > 0xffff ? 4 : cp > 0x7ff ? 3 : cp > 0x7f ? 2 : 1
                if (octets + size > 75) break
                octets += size
                cut += cp > 0xffff ? 2 : 1
            }
            chunks.push(remaining.slice(0, cut))
            remaining = remaining.slice(cut)
        }
        chunks.push(remaining)
        return chunks.join("\r\n ")
    }
    return lines.map(foldOne).join("\r\n")
}

function buildIcsDataUri(
    slot: BookingPayload,
    description?: string,
    summary?: string,
    prodid: string = DEFAULT_COPY_ICS_PRODID,
    summaryFallback: string = DEFAULT_COPY_ICS_SUMMARY_FALLBACK,
    meetingDurationMs: number = DEFAULT_MEETING_DURATION_MS,
    uidDomain: string = DEFAULT_ICS_UID_DOMAIN,
    location?: string,
    uid?: string
): string {
    const toIcsDate = (d: Date) =>
        d
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}Z$/, "Z")
    let startDate: Date
    let endDate: Date
    const isIso = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
    if (isIso) {
        startDate = new Date(slot.time24h)
        const slotEnd = slot.end ? new Date(slot.end) : null
        endDate =
            slotEnd && !Number.isNaN(slotEnd.getTime())
                ? slotEnd
                : new Date(startDate.getTime() + meetingDurationMs)
        if (Number.isNaN(startDate.getTime())) {
            startDate = new Date()
        }
        if (Number.isNaN(endDate.getTime())) {
            endDate = new Date(startDate.getTime() + meetingDurationMs)
        }
    } else {
        const mins = parseTimeToMinutes(slot.time24h)
        startDate = new Date(slot.date)
        startDate.setHours(Math.floor(mins / 60), mins % 60, 0, 0)
        endDate = new Date(startDate.getTime() + meetingDurationMs)
    }
    const start = toIcsDate(startDate)
    const end = toIcsDate(endDate)
    const resolvedUid =
        uid?.trim() ||
        (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}${uidDomain}`)
    const ics = foldIcsLines([
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        `PRODID:-//${prodid}`,
        "BEGIN:VEVENT",
        `UID:${resolvedUid}`,
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeIcsText(summary || summaryFallback)}`,
        ...(description ? [`DESCRIPTION:${escapeIcsText(description.slice(0, 500))}`] : []),
        ...(location?.trim() ? [`LOCATION:${escapeIcsText(location.trim())}`] : []),
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
        "END:VCALENDAR",
    ])
    if (typeof window === "undefined") return ""
    try {
        const bytes = new TextEncoder().encode(ics)
        let binary = ""
        for (const byte of bytes) binary += String.fromCharCode(byte)
        return `data:text/calendar;charset=utf-8;base64,${btoa(binary)}`
    } catch {
        return ""
    }
}

function formatStepCounter(template: string, current: number, total: number): string {
    return (template || DEFAULT_COPY_STEP_COUNTER_TEMPLATE)
        .replace(/\{current\}/g, String(current))
        .replace(/\{total\}/g, String(total))
}

function effectiveMaxLength(field: Pick<NormalizedField, "fieldType">): number {
    switch (field.fieldType) {
        case "email":
            return 254
        case "phone":
            return 40
        case "textarea":
            return 1000
        default:
            return 250
    }
}

function buildCalendarDeepLink(
    provider: "google" | "office" | "outlook",
    slot: BookingPayload,
    summary: string,
    description?: string,
    meetingDurationMs: number = DEFAULT_MEETING_DURATION_MS
): string {
    const start = new Date(slot.time24h)
    if (Number.isNaN(start.getTime())) return ""
    const endMs =
        slot.end && !Number.isNaN(new Date(slot.end).getTime())
            ? new Date(slot.end).getTime()
            : start.getTime() + meetingDurationMs
    const end = new Date(endMs)
    const toCompact = (d: Date) =>
        d
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "")
    const toExtended = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z")
    const text = encodeURIComponent(summary)
    const details = encodeURIComponent(description || "")
    if (provider === "google") {
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${toCompact(start)}/${toCompact(end)}&details=${details}`
    }
    const host = provider === "office" ? "outlook.office.com" : "outlook.live.com"
    return `https://${host}/calendar/0/action/compose?subject=${text}&startdt=${toExtended(start)}&enddt=${toExtended(end)}&body=${details}`
}

// @framerDisableUnlink prevents unlinking the component (annotations on
// BookingEngine itself, above its export).
type TransitionVariantId =
    | "fadeRise"
    | "blurScale"
    | "slide"
    | "zoom"
    | "verticalSlide"
    | "blurSlide"

const TRANSITION_VARIANT_DEFS: Record<
    TransitionVariantId,
    {
        variants: Variants
        transition: Transition
        useDirection?: boolean
    }
> = {
    fadeRise: {
        variants: {
            active: { opacity: 1, y: 0 },
            inactive: { opacity: 0, y: 8 },
        },
        transition: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] } as Transition,
    },
    blurScale: {
        variants: {
            active: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
            inactive: { opacity: 0, scale: 0.95, y: 0, filter: "blur(4px)" },
        },
        transition: { type: "spring", stiffness: 320, damping: 28, mass: 0.9 } as Transition,
    },
    slide: {
        variants: {
            active: { opacity: 1, x: 0, y: 0 },
            inactive: (custom: number) => ({
                opacity: 0,
                x: custom > 0 ? -20 : 20,
                y: 0,
            }),
        },
        transition: { type: "spring", stiffness: 380, damping: 30 } as Transition,
        useDirection: true,
    },
    zoom: {
        variants: {
            active: { opacity: 1, scale: 1 },
            inactive: { opacity: 0, scale: 0.92 },
        },
        transition: { type: "spring", stiffness: 360, damping: 26 } as Transition,
    },
    verticalSlide: {
        variants: {
            active: { opacity: 1, y: 0 },
            inactive: (custom: number) => ({
                opacity: 0,
                y: custom > 0 ? -24 : 24,
            }),
        },
        transition: { type: "spring", stiffness: 340, damping: 30 } as Transition,
        useDirection: true,
    },
    blurSlide: {
        variants: {
            active: { opacity: 1, x: 0, filter: "blur(0px)" },
            inactive: (custom: number) => ({
                opacity: 0,
                x: custom > 0 ? -20 : 20,
                filter: "blur(4px)",
            }),
        },
        transition: { type: "spring", stiffness: 360, damping: 30 } as Transition,
        useDirection: true,
    },
}

class BeErrorBoundary extends React.Component<
    { stepKey: string; children: React.ReactNode },
    { failed: boolean }
> {
    state = { failed: false }
    static getDerivedStateFromError(): { failed: boolean } {
        return { failed: true }
    }
    componentDidUpdate(prevProps: { stepKey: string }): void {
        if (prevProps.stepKey !== this.props.stepKey && this.state.failed) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ failed: false })
        }
    }
    render(): React.ReactNode {
        if (this.state.failed) return null
        return this.props.children
    }
}

function StepVisibilityWrapper(props: {
    isActive: boolean
    baseTransition: Transition
    children: React.ReactNode
    stepIndex: number
    activeIndex: number
    variant: TransitionVariantId
    direction: number
}) {
    const reducedMotion = useReducedMotion() ?? false
    const isStatic = useIsStaticRenderer()
    const def = TRANSITION_VARIANT_DEFS[props.variant]
    const stepNodeRef = React.useRef<HTMLDivElement | null>(null)
    useIsomorphicLayoutEffect(() => {
        stepNodeRef.current?.toggleAttribute("inert", !props.isActive)
    })
    const resolvedTransition = React.useMemo(() => {
        if (reducedMotion) return INSTANT_TRANSITION
        const base = props.baseTransition as unknown as { duration?: number }
        const d =
            typeof base?.duration === "number" && Number.isFinite(base.duration)
                ? base.duration
                : undefined
        if (d !== undefined) return { ...def.transition, duration: d } as Transition
        return def.transition
    }, [def.transition, props.baseTransition, reducedMotion])
    if (isStatic) {
        return (
            <div
                ref={stepNodeRef}
                style={{
                    position: props.isActive ? "relative" : "absolute",
                    top: props.isActive ? undefined : 0,
                    left: 0,
                    width: "100%",
                    pointerEvents: props.isActive ? "auto" : "none",
                    opacity: props.isActive ? 1 : 0,
                }}
                aria-hidden={props.isActive ? undefined : true}
            >
                {props.children}
            </div>
        )
    }
    return (
        <motion.div
            ref={stepNodeRef}
            variants={def.variants}
            custom={def.useDirection ? props.direction : undefined}
            initial={false}
            animate={props.isActive ? "active" : "inactive"}
            transition={resolvedTransition}
            style={{
                position: props.isActive ? "relative" : "absolute",
                top: props.isActive ? undefined : 0,
                left: 0,
                width: "100%",
                pointerEvents: props.isActive ? "auto" : "none",
            }}
            aria-hidden={props.isActive ? undefined : true}
            data-step-index={props.stepIndex}
            data-active-index={props.activeIndex}
            data-is-active={props.isActive ? "1" : "0"}
            data-transition-variant={props.variant}
            onAnimationComplete={() => {
                if (typeof window !== "undefined" && window.__BE_STEP_DEBUG__) {
                    const el = document.querySelector(
                        `[data-step-index="${props.stepIndex}"]`
                    ) as HTMLElement | null
                    const cs = el ? getComputedStyle(el) : null
                    console.debug(
                        `[BE StepVisibility] variant=${props.variant} step=${props.stepIndex} active=${props.activeIndex} isActive=${props.isActive} position=${cs?.position ?? (props.isActive ? "relative" : "absolute")} opacity=${cs?.opacity ?? (props.isActive ? "1" : "0")} pointerEvents=${cs?.pointerEvents ?? (props.isActive ? "auto" : "none")}`
                    )
                }
            }}
        >
            {props.children}
        </motion.div>
    )
}

type InSessionFormSnapshot = {
    values: BookingValues
    currentIndex: number
    timeFormat: "12h" | "24h"
    live: boolean
}
const inSessionFormSnapshots = new Map<string, InSessionFormSnapshot>()

const LEGACY_SESSION_KEY = "booking-engine:session"
const PERSIST_INSTANCE_PREFIX = "booking-engine:instance:"
const PERSIST_CONFIG_PREFIX = "booking-engine:cfg:"

const beMountedPersistenceKeys = new Map<string, number>()
const beCollisionWarnedKeys = new Set<string>()
let beLegacyMigrated = false

function stableStringify(value: unknown, depth = 0): string {
    if (value === null || value === undefined) return "null"
    const t = typeof value
    if (t === "number" || t === "boolean") return JSON.stringify(value)
    if (t === "string") return JSON.stringify((value as string).slice(0, 2000))
    if (t !== "object") return "null"
    if (depth > 8) return "null"
    if (Array.isArray(value)) {
        return `[${(value as unknown[])
            .slice(0, 200)
            .map((v) => stableStringify(v, depth + 1))
            .join(",")}]`
    }
    const entries = Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined && typeof v !== "function" && typeof v !== "symbol")
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .slice(0, 200)
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v, depth + 1)}`).join(",")}}`
}

function fnv1a(str: string, seed: number): string {
    let h = seed >>> 0
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return (h >>> 0).toString(16).padStart(8, "0")
}

function fingerprintEngineConfig(
    stepCount: number,
    steps: StepConfig[],
    calEventTypeId: unknown
): string {
    const shape = {
        n: stepCount,
        e: String(calEventTypeId ?? ""),
        steps: steps.map((s) => ({
            t: s.stepType,
            on: s.enabled !== false,
            ti: s.title,
            st: s.subtitle ?? "",
            l: s.layout,
            f: (s.fields || []).map((f) => ({
                lb: f.label,
                ft: f.fieldType,
                rq: !!f.required,
                ph: f.placeholder ?? "",
                op: f.options ?? [],
                ov: f.optionValues ?? [],
                cf: f.calFieldId ?? "",
                pn: !!f.isPrimaryName,
                w: f.width,
            })),
        })),
    }
    const s = stableStringify(shape)
    return `${fnv1a(s, 2166136261)}${fnv1a(s, 424242)}`.slice(0, 12)
}

function slugifyInstanceId(raw: unknown): string {
    return String(raw ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64)
}

interface PersistenceIdentity {
    key: string
    via: "instance-id" | "config-fingerprint"
}

function resolvePersistenceKey(instanceId: unknown, fingerprint: string): PersistenceIdentity {
    const slug = slugifyInstanceId(instanceId)
    if (slug) return { key: `${PERSIST_INSTANCE_PREFIX}${slug}`, via: "instance-id" }
    return { key: `${PERSIST_CONFIG_PREFIX}${fingerprint}`, via: "config-fingerprint" }
}

function useBookingEngineState(
    props: BookingEngineProps,
    engineRootRef?: React.RefObject<HTMLDivElement | null>
) {
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
        typography,
        transitionSettings,
        calApiKey,
        calEventTypeId,
        onAnalytics,
        advanced,
        calendar,
        header,
        fieldStyles,
    } = props

    const transition = transitionSettings?.transition ?? props.transition
    const transitionVariant = transitionSettings?.variant ?? props.transitionVariant

    // BE-090: segmented-thumb motion prefs (Transition submenu controls),
    // clamped once here; the memoized object keeps context identity stable so
    // typing never re-renders the segmented controls.
    const thumbStiffness = clampSegmentedMotion(
        transitionSettings?.thumbStiffness,
        SEGMENTED_MOTION_LIMITS.stiffness
    )
    const thumbDamping = clampSegmentedMotion(
        transitionSettings?.thumbDamping,
        SEGMENTED_MOTION_LIMITS.damping
    )
    const segmentedMotion = React.useMemo(
        () => ({ stiffness: thumbStiffness, damping: thumbDamping }),
        [thumbStiffness, thumbDamping]
    )

    const font = styles.header?.font ?? styles.font ?? typography?.font ?? props.font
    const headingFont =
        styles.header?.headingFont ?? styles.headingFont ?? typography?.headingFont ?? props.headingFont

    const instanceIdProp = advanced?.instanceId ?? props.instanceId ?? ""

    // BE-083: screen-grouped copy with the flat keys as readable legacy
    // carriers - one resolution site, ?? chains (never ||).
    const rawCopy = advanced?.copy ?? props.copy
    const copy = {
        ...rawCopy,
        successTitle:
            rawCopy?.success?.successTitle ??
            rawCopy?.successTitle ??
            DEFAULT_COPY_SUCCESS_TITLE,
        successSubtitle:
            rawCopy?.success?.successSubtitle ??
            rawCopy?.successSubtitle ??
            DEFAULT_COPY_SUCCESS_SUBTITLE,
        errorTitle:
            rawCopy?.failure?.errorTitle ??
            rawCopy?.errorTitle ??
            DEFAULT_COPY_ERROR_TITLE,
        errorSubtitle:
            rawCopy?.failure?.errorSubtitle ??
            rawCopy?.errorSubtitle ??
            DEFAULT_COPY_ERROR_SUBTITLE,
        unknownErrorLabel:
            rawCopy?.failure?.unknownErrorLabel ??
            rawCopy?.unknownErrorLabel ??
            DEFAULT_COPY_UNKNOWN_ERROR_LABEL,
        errorFallbackMessage:
            rawCopy?.failure?.errorFallbackMessage ??
            rawCopy?.errorFallbackMessage ??
            DEFAULT_COPY_SUBMIT_ERROR_FALLBACK,
        stepCounterTemplate:
            progressBar?.content?.stepCounterTemplate ??
            rawCopy?.stepCounterTemplate ??
            DEFAULT_COPY_STEP_COUNTER_TEMPLATE,
        stepProgressLabel:
            progressBar?.content?.stepProgressLabel ??
            rawCopy?.stepProgressLabel ??
            DEFAULT_COPY_STEP_PROGRESS_TEMPLATE,
        stepAnnouncementTemplate:
            progressBar?.content?.stepAnnouncementTemplate ??
            rawCopy?.stepAnnouncementTemplate ??
            DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE,
        rescheduleOrCancelLabel:
            buttonLabels?.buttonTexts?.manageLinkLabel ??
            rawCopy?.rescheduleOrCancelLabel ??
            DEFAULT_COPY_RESCHEDULE_OR_CANCEL_LABEL,
    }

    const validation = copy?.validation ?? props.validation

    const validationCopy: ValidationCopy = React.useMemo(() => {
        const validationMessages = validation
        return {
            requiredFieldError:
                validationMessages?.requiredFieldError ??
                DEFAULT_VALIDATION_COPY.requiredFieldError,
            emailError: validationMessages?.emailError ?? DEFAULT_VALIDATION_COPY.emailError,
            phoneError: validationMessages?.phoneError ?? DEFAULT_VALIDATION_COPY.phoneError,
            numberError: validationMessages?.numberError ?? DEFAULT_VALIDATION_COPY.numberError,
            urlError: validationMessages?.urlError ?? DEFAULT_VALIDATION_COPY.urlError,
            minLengthError:
                validationMessages?.minLengthError ?? DEFAULT_VALIDATION_COPY.minLengthError,
            maxLengthError:
                validationMessages?.maxLengthError ?? DEFAULT_VALIDATION_COPY.maxLengthError,
            pickDateTimeError:
                validationMessages?.pickDateTimeError ?? DEFAULT_VALIDATION_COPY.pickDateTimeError,
            pastTimeError:
                validationMessages?.pastTimeError ?? DEFAULT_VALIDATION_COPY.pastTimeError,
            minLength: DEFAULT_VALIDATION_COPY.minLength,
        }
    }, [validation])

    const {
        accentColor,
        accentForegroundColor,
        surfaceColor,
        textPrimaryColor,
        borderColor,
        borderRadius,
    } = styles
    const textSecondaryColor = withAlpha(textPrimaryColor, DERIVED_SECONDARY_TEXT_ALPHA)
    const successColor = DERIVED_SUCCESS_COLOR
    const errorColor = FIXED_ERROR_COLOR
    const sanitizedRadiusValue = React.useMemo(() => {
        const raw =
            typeof borderRadius === "number"
                ? borderRadius
                : parseInt(String(borderRadius ?? "12"), 10)
        const n = Number.isFinite(raw) ? raw : 12
        return Math.max(0, Math.min(24, Math.round(n)))
    }, [borderRadius])
    const sanitizedRadius = `${sanitizedRadiusValue}px`
    const fieldGap = React.useMemo(() => {
        const raw = Number(styles?.gap)
        const n = Number.isFinite(raw) ? raw : 24
        return Math.max(0, Math.min(48, Math.round(n)))
    }, [styles?.gap])
    // SECTION-SPACING (BE-075): three clamped zone gaps resolved once —
    // vertical rhythm for progress→form, header→fields, fields→nav.
    // Pure functions of props, so hydration stays byte-identical.
    const sectionSpacing = React.useMemo(
        () => ({
            progress: clampSectionSpacing(styles?.progressGap, SECTION_SPACING_DEFAULTS.progress),
            heading: clampSectionSpacing(styles?.headingGap, SECTION_SPACING_DEFAULTS.heading),
            footer: clampSectionSpacing(styles?.footerGap, SECTION_SPACING_DEFAULTS.footer),
        }),
        [styles?.progressGap, styles?.headingGap, styles?.footerGap]
    )
    const progressVisible = (progressBar?.barVisible ?? progressBar?.visible) !== false
    const stepCountPosition: "top" | "bottom" =
        (progressBar?.progressText ?? progressBar?.stepCountPosition) === "bottom"
            ? "bottom"
            : "top"
    const progressShowTextContent =
        (progressBar?.showText ?? progressBar?.showTextContent) !== false
    const progressBarStyle: "solid" | "dashed" =
        progressBar?.barStyle === "solid" ? "solid" : "dashed"

    const layoutSrc = buttonLabels.buttonsLayout ?? {}
    const groupNavButtons = layoutSrc.groupNavButtons ?? buttonLabels.groupNavButtons
    const groupedNavAlignment = layoutSrc.groupedNavAlignment ?? buttonLabels.groupedNavAlignment
    const buttonOrderValue = layoutSrc.buttonOrder ?? buttonLabels.buttonOrder
    const buttonWidthValue = layoutSrc.buttonWidth ?? buttonLabels.buttonWidth
    const bl = buttonLabels ?? {}
    const buttonTexts = bl.buttonTexts ?? {}
    const continueLabel = resolveButtonText(
        buttonTexts.continueLabel,
        bl.continueButton?.text,
        bl.continueLabel,
        "Continue"
    )
    const backLabel = resolveButtonText(
        buttonTexts.backLabel,
        bl.backButton?.text,
        bl.backLabel,
        "Back"
    )
    const finalActionLabel = resolveButtonText(
        buttonTexts.finalActionLabel,
        bl.finalActionButton?.text,
        bl.finalActionLabel,
        "Book Now"
    )
    const bookAnotherLabel = DEFAULT_CONFIRM_BOOK_ANOTHER_LABEL
    const addToCalendarButtonLabel = DEFAULT_CONFIRM_ADD_TO_CALENDAR_LABEL
    // BUTTON-TEXTS (BE-038): Cancel/Retry are fixed constants — no
    // control, no interface key, no legacy carrier.
    const retryLabel = DEFAULT_COPY_RETRY_LABEL

    const persistState = true
    const reactInstanceId = useHydrationSafeId("be-engine")
    const isStaticRender = useIsStaticRenderer()

    const errorCopy = React.useMemo(
        () => ({ ...ERROR_COPY_DEFAULTS, ...(copy?.errorCopy || {}) }),
        [copy?.errorCopy]
    )
    const calApiBaseUrl = (
        advanced?.calApiBaseUrl ??
        props.calApiBaseUrl ??
        DEFAULT_CAL_API_BASE_URL
    ).replace(/\/+$/, "")

    const prefersReducedMotion = useReducedMotion() ?? false

    const stepTransition: Transition = prefersReducedMotion
        ? ({ type: "tween", duration: 0 } as const)
        : transition || ({ type: "tween", ease: [0.44, 0, 0.56, 1], duration: 0.4 } as const)

    const allowedTransitionVariants: TransitionVariantId[] = [
        "fadeRise",
        "blurScale",
        "slide",
        "zoom",
        "verticalSlide",
        "blurSlide",
    ]
    const rawVariant = (transitionVariant ?? "blurScale") as string
    const resolvedTransitionVariant: TransitionVariantId = (
        allowedTransitionVariants as string[]
    ).includes(rawVariant)
        ? (rawVariant as TransitionVariantId)
        : "blurScale"
    // Footer primary-label swap (Continue/Book Now) reuses the step transition's
    // variant SHAPE (blur/scale/fade per the author's type choice) but on a fixed
    // quick timing: waiting out a full step-length exit+enter left the button
    // empty for ~2s. Sync-crossfaded in a grid stack (both labels share one cell,
    // container sized by the widest), so nothing jumps and nothing blanks.
    const footerLabelTransition = React.useMemo(() => {
        if (prefersReducedMotion) return INSTANT_TRANSITION
        return { type: "tween", duration: 0.16, ease: "easeOut" } as Transition
    }, [prefersReducedMotion])

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const vv = (
            window as unknown as {
                visualViewport?: {
                    addEventListener(type: string, listener: () => void): void
                    removeEventListener(type: string, listener: () => void): void
                }
            }
        ).visualViewport
        if (!vv || typeof vv.addEventListener !== "function") return
        let raf = 0
        const onResize = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                if (typeof document === "undefined") return
                const el = document.activeElement
                if (
                    !el ||
                    (el.tagName !== "INPUT" &&
                        el.tagName !== "TEXTAREA" &&
                        el.tagName !== "SELECT") ||
                    !el.closest("form")
                )
                    return
                try {
                    el.scrollIntoView({ block: "nearest" })
                } catch {
                    /* ignore */
                }
            })
        }
        vv.addEventListener("resize", onResize)
        return () => {
            cancelAnimationFrame(raf)
            vv.removeEventListener("resize", onResize)
        }
    }, [])

    const theme = React.useMemo<Theme & { borderRadius: string }>(
        () => ({
            accentColor,
            accentForegroundColor,
            surfaceColor,
            textPrimaryColor,
            textSecondaryColor,
            borderColor,
            errorColor,
            successColor,
            borderRadius: sanitizedRadius,
        }),
        [
            accentColor,
            accentForegroundColor,
            surfaceColor,
            textPrimaryColor,
            borderColor,
            sanitizedRadius,
        ]
    )

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
        const clampedCount = clamp(Math.round(stepCount ?? 1), 1, 10)
        return slots.slice(0, clampedCount).map((slot, idx) => {
            const fallback = getRuntimeFallbackStep(idx)
            return slot || fallback
        })
    }, [stepCount, step1, step2, step3, step4, step5, step6, step7, step8, step9, step10])

    const legacyCalendar = React.useMemo(
        () => migrateLegacyCalendar(effectiveStepsConfig),
        [effectiveStepsConfig]
    )
    const legacyHeaderAlignment: "left" | "center" | "right" | undefined =
        header && isStepAlignment(header.alignment) ? header.alignment : undefined
    const normalizedSteps = React.useMemo(
        () =>
            normalizeSteps(
                legacyCalendar.steps.map((step) =>
                    isStepAlignment(step.alignment)
                        ? step
                        : { ...step, alignment: legacyHeaderAlignment }
                )
            ),
        [legacyCalendar, legacyHeaderAlignment]
    )

    const baseActiveSteps = React.useMemo(
        () => normalizedSteps.filter((step) => step.enabled),
        [normalizedSteps]
    )
    const baseTotalActive = baseActiveSteps.length

    const [currentIndex, setCurrentIndex] = useStateGuarded(0, baseTotalActive + MAX_SYSTEM_STAGES)
    const baseSafeCurrentIndex = Math.min(currentIndex, Math.max(0, baseTotalActive - 1))

    const pinnedStepIdRef = React.useRef<string | null>(null)
    const lastActiveStepsKeyRef = React.useRef<string>(
        baseActiveSteps.map((step) => step.id).join("|")
    )
    React.useEffect(() => {
        pinnedStepIdRef.current = baseActiveSteps[baseSafeCurrentIndex]?.id ?? null
    }, [baseSafeCurrentIndex, baseActiveSteps])
    const baseActiveStepsKey = baseActiveSteps.map((step) => step.id).join("|")
    if (baseActiveStepsKey !== lastActiveStepsKeyRef.current) {
        lastActiveStepsKeyRef.current = baseActiveStepsKey
        const pinnedIndex = pinnedStepIdRef.current
            ? baseActiveSteps.findIndex((step) => step.id === pinnedStepIdRef.current)
            : -1
        const remapped =
            pinnedIndex !== -1 ? pinnedIndex : Math.min(baseSafeCurrentIndex, baseTotalActive - 1)
        if (remapped !== currentIndex) {
            setCurrentIndex(remapped)
        }
    }

    const [values, setValues] = React.useState<BookingValues>({})
    const [errors, setErrors] = React.useState<Record<string, string | null>>({})
    const [touched, setTouched] = React.useState<Record<string, boolean>>({})
    const [flowStatus, setFlowStatus] = React.useState<FlowStatus>("in-progress")
    const [submitError, setSubmitError] = React.useState<string | null>(null)
    const [bookingResult, setBookingResult] = React.useState<BookingConfirmation | null>(null)

    const [pickedDate, setPickedDate] = React.useState<Date | null>(null)
    const selectedDate = pickedDate ?? values[SELECTED_SLOT_KEY]?.date ?? null
    const [visibleMonth, setVisibleMonth] = React.useState<Date | null>(null)
    const [timeZone, setTimeZone] = React.useState<string>("UTC")
    const beInteractiveForTz = useBeInteractive()
    const beInteractiveForRestore = useBeInteractive()
    React.useEffect(() => {
        if (!beInteractiveForTz) return
        setTimeZone((prev) => (prev === "UTC" ? detectTimezone() : prev))
        // Mid-session zone change (travel, VPN, sleep/wake): re-detect when the
        // tab becomes visible again. No-op when the zone is unchanged.
        const onVisible = () => {
            if (typeof document === "undefined" || document.visibilityState !== "visible") return
            const fresh = detectTimezone()
            setTimeZone((prev) => (prev === fresh ? prev : fresh))
        }
        document.addEventListener("visibilitychange", onVisible)
        return () => document.removeEventListener("visibilitychange", onVisible)
    }, [beInteractiveForTz])
    const [timeFormat, setTimeFormat] = React.useState<"12h" | "24h">("12h")

    const persistenceFingerprint = React.useMemo(
        () =>
            fingerprintEngineConfig(
                stepCount,
                [step1, step2, step3, step4, step5, step6, step7, step8, step9, step10].slice(
                    0,
                    Math.max(0, Math.min(10, Math.floor(stepCount || 0)))
                ),
                calEventTypeId
            ),
        [
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
            calEventTypeId,
        ]
    )
    const persistenceIdentity = React.useMemo(
        () => resolvePersistenceKey(instanceIdProp, persistenceFingerprint),
        [instanceIdProp, persistenceFingerprint]
    )
    const persistenceKey = persistenceIdentity.key
    const instanceKeyRef = React.useRef<string>(persistenceKey)
    useIsomorphicLayoutEffect(() => {
        instanceKeyRef.current = persistenceKey
        const claimed = (beMountedPersistenceKeys.get(persistenceKey) ?? 0) + 1
        beMountedPersistenceKeys.set(persistenceKey, claimed)
        if (claimed > 1 && !beCollisionWarnedKeys.has(persistenceKey)) {
            beCollisionWarnedKeys.add(persistenceKey)
            console.warn(
                `[BE persist] COLLISION key=${persistenceKey} is claimed by ${claimed} mounted engines — ` +
                    `they share one saved session. Set a unique "Instance ID" on each Booking Engine sharing this page.`
            )
        }
        const snap = inSessionFormSnapshots.get(instanceKeyRef.current)
        if (snap) {
            setValues({ ...snap.values })
            setCurrentIndex(Math.min(snap.currentIndex, baseTotalActive))
            setTimeFormat(snap.timeFormat)
            const snapSlot = snap.values[SELECTED_SLOT_KEY]
            if (snapSlot && typeof snapSlot === "object" && "date" in snapSlot) {
                const d = (snapSlot as { date?: unknown }).date
                if (d instanceof Date && !Number.isNaN(d.getTime())) {
                    setPickedDate(d)
                    setVisibleMonth(new Date(d.getFullYear(), d.getMonth(), 1))
                }
            }
        }
        return () => {
            const left = (beMountedPersistenceKeys.get(persistenceKey) ?? 1) - 1
            if (left <= 0) beMountedPersistenceKeys.delete(persistenceKey)
            else beMountedPersistenceKeys.set(persistenceKey, left)
        }
        // Render-computed identity only; the seed reads the map once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [persistenceKey, baseTotalActive])

    React.useEffect(() => {
        inSessionFormSnapshots.set(instanceKeyRef.current, {
            values,
            currentIndex,
            timeFormat,
            live: beInteractiveForRestore,
        })
    }, [values, currentIndex, timeFormat, beInteractiveForRestore])

    const PERSIST_SCHEMA_VERSION = 1
    const loadFocusSuppressedRef = React.useRef(false)
    // P1/P2 restore plumbing: a step id saved alongside the index (see persist
    // below), consumed by the pinned-id remap when the pipeline settles.
    const restoredStepIdRef = React.useRef<string | null>(null)
    const currentEffectiveStepIdRef = React.useRef<string | null>(null)
    // Armed when a slot is restored from storage; consumed once the pipeline
    // settles (validated below) or when the visitor makes their own pick.
    const restoredSlotPendingRef = React.useRef(false)
    useIsomorphicLayoutEffect(() => {
        if (!persistState) return
        if (typeof window === "undefined") return
        if (isStaticRender) return
        if (!beInteractiveForRestore) {
            // Returning visitor: this instance's own storage payload proves a live
            // session (the prerender capture always has empty storage, so this can
            // never flip there). Flip pre-paint and fall through to the restore.
            let hasOwnPayload = false
            try {
                hasOwnPayload =
                    window.sessionStorage.getItem(instanceKeyRef.current) != null ||
                    window.sessionStorage.getItem(LEGACY_SESSION_KEY) != null
            } catch {
                hasOwnPayload = false
            }
            if (!hasOwnPayload) return
            beSetInteractive()
        }
        if (inSessionFormSnapshots.get(instanceKeyRef.current)?.live) return
        try {
            let raw = window.sessionStorage.getItem(instanceKeyRef.current)
            let migratedLegacy = false
            if (!raw && !beLegacyMigrated) {
                let roots = 0
                try {
                    roots = document.querySelectorAll("[data-be-engine-root]").length
                } catch {
                    roots = 0
                }
                if (roots <= 1) {
                    const legacyRaw = window.sessionStorage.getItem(LEGACY_SESSION_KEY)
                    if (legacyRaw) {
                        raw = legacyRaw
                        migratedLegacy = true
                        beLegacyMigrated = true
                    }
                }
            }
            if (!raw) return
            const parsed = JSON.parse(raw) as {
                v?: unknown
                values?: Record<string, unknown>
                timeZone?: unknown
                timeFormat?: unknown
                currentIndex?: unknown
                stepId?: unknown
            }
            if (parsed && typeof parsed === "object") {
                if (parsed.v !== PERSIST_SCHEMA_VERSION) {
                    console.warn(
                        "BookingEngine: purging saved progress with an unknown schema version."
                    )
                    try {
                        window.sessionStorage.removeItem(instanceKeyRef.current)
                    } catch {
                        // non-fatal
                    }
                    return
                }
                const restoredValues = parsed.values || {}
                const rawSlot = restoredValues[SELECTED_SLOT_KEY]
                if (rawSlot !== undefined && !isBookingPayload(rawSlot)) {
                    restoredValues[SELECTED_SLOT_KEY] = undefined
                }
                const restoredSlot = isBookingPayload(rawSlot) ? rawSlot : undefined
                if (restoredSlot && !(restoredSlot.date instanceof Date)) {
                    try {
                        const rehydratedDate = new Date(
                            typeof restoredSlot.date === "string" ? restoredSlot.date : ""
                        )
                        restoredSlot.date = rehydratedDate
                        if (Number.isNaN(rehydratedDate.getTime())) {
                            restoredValues[SELECTED_SLOT_KEY] = undefined
                        }
                    } catch {
                        restoredValues[SELECTED_SLOT_KEY] = undefined
                    }
                }
                const restoredEntries = Object.entries(restoredValues).filter(
                    ([key, value]) => key === SELECTED_SLOT_KEY || isFieldValue(value)
                )
                const filteredValues = Object.fromEntries(restoredEntries) as BookingValues
                setValues((prev) => ({
                    ...prev,
                    ...filteredValues,
                }))
                if (restoredSlot) {
                    const slot = restoredSlot
                    if (slot.date) {
                        const restoredDate =
                            slot.date instanceof Date ? slot.date : new Date(String(slot.date))
                        setPickedDate(restoredDate)
                        setVisibleMonth(
                            new Date(restoredDate.getFullYear(), restoredDate.getMonth(), 1)
                        )
                        restoredSlotPendingRef.current = true
                    }
                }
                if (parsed.timeFormat === "12h" || parsed.timeFormat === "24h") {
                    setTimeFormat(parsed.timeFormat)
                }
                if (
                    typeof parsed.currentIndex === "number" &&
                    Number.isFinite(parsed.currentIndex) &&
                    parsed.currentIndex >= 0
                ) {
                    const savedStepId =
                        typeof parsed.stepId === "string" && parsed.stepId ? parsed.stepId : null
                    if (savedStepId) restoredStepIdRef.current = savedStepId
                    // Reseed by id when the saved step is identifiable in the current
                    // pipeline (base steps + system calendar; an auto-injected step is
                    // unknown pre-paint and resolves later via the pinned-id remap).
                    const restoreIds = [...baseActiveSteps.map((s) => s.id), SYSTEM_CALENDAR_ID]
                    const idIndex = savedStepId ? restoreIds.indexOf(savedStepId) : -1
                    let restoredIndex =
                        idIndex !== -1
                            ? idIndex
                            : Math.min(parsed.currentIndex, baseActiveSteps.length)
                    for (let i = 0; i < restoredIndex; i++) {
                        const prior = baseActiveSteps[i]
                        if (prior && !validateStep(prior, filteredValues, validationCopy).valid) {
                            restoredIndex = i
                            break
                        }
                    }
                    if (restoredIndex > 0) {
                        loadFocusSuppressedRef.current = true
                    }
                    setCurrentIndex(restoredIndex)
                    if (migratedLegacy) {
                        try {
                            window.sessionStorage.removeItem(LEGACY_SESSION_KEY)
                        } catch {}
                    }
                }
            }
        } catch (err: unknown) {
            console.warn("BookingEngine: failed to restore saved progress.", err)
            try {
                window.sessionStorage.removeItem(instanceKeyRef.current)
            } catch {
                console.warn("BookingEngine: failed to purge corrupt saved progress.")
            }
        }
    }, [persistState, isStaticRender, persistenceKey, beInteractiveForRestore])

    const persistTimerRef = React.useRef<number | null>(null)
    const focusTimerRef = React.useRef<number | null>(null)
    const scheduleFocusTimer = React.useCallback((fn: () => void) => {
        if (focusTimerRef.current !== null) {
            window.clearTimeout(focusTimerRef.current)
        }
        focusTimerRef.current = window.setTimeout(fn, 0)
    }, [])
    React.useEffect(() => {
        if (!persistState) return
        if (typeof window === "undefined") return
        if (isStaticRender) return
        if (!beInteractiveForRestore) return
        if (flowStatus === "success") {
            if (persistTimerRef.current !== null) {
                window.clearTimeout(persistTimerRef.current)
                persistTimerRef.current = null
            }
            try {
                window.sessionStorage.removeItem(instanceKeyRef.current)
            } catch (err: unknown) {
                console.warn("BookingEngine: failed to clear saved progress.", err)
            }
            return
        }
        if (persistTimerRef.current !== null) {
            window.clearTimeout(persistTimerRef.current)
        }
        persistTimerRef.current = window.setTimeout(() => {
            persistTimerRef.current = null
            const hasAnything =
                currentIndex > 0 ||
                Object.values(values).some((v) => v !== undefined && v !== null && v !== "")
            if (!hasAnything) return
            try {
                window.sessionStorage.setItem(
                    instanceKeyRef.current,
                    JSON.stringify({
                        v: PERSIST_SCHEMA_VERSION,
                        values,
                        timeFormat,
                        currentIndex,
                        stepId: currentEffectiveStepIdRef.current,
                        fp: persistenceFingerprint,
                    })
                )
            } catch (err: unknown) {
                console.warn("BookingEngine: failed to save progress (storage full?).", err)
            }
        }, 300)
        return () => {
            if (persistTimerRef.current !== null) {
                window.clearTimeout(persistTimerRef.current)
                persistTimerRef.current = null
            }
        }
    }, [
        persistState,
        values,
        flowStatus,
        timeFormat,
        currentIndex,
        isStaticRender,
        beInteractiveForRestore,
        persistenceFingerprint,
    ])

    React.useEffect(() => {
        return () => {
            if (focusTimerRef.current !== null) {
                window.clearTimeout(focusTimerRef.current)
                focusTimerRef.current = null
            }
        }
    }, [])

    useIsomorphicLayoutEffect(() => {
        if (
            currentIndex >= baseTotalActive + MAX_SYSTEM_STAGES &&
            baseTotalActive + MAX_SYSTEM_STAGES > 0
        ) {
            setCurrentIndex(Math.max(0, baseTotalActive + MAX_SYSTEM_STAGES - 1))
        } else if (baseTotalActive === 0) {
            setCurrentIndex(0)
        }
    }, [currentIndex, baseTotalActive])

    const hasDatetimeStep = true
    const hasCalConfig = Boolean(calApiKey && calEventTypeId)
    const [reachedDatetimeStep, setReachedDatetimeStep] = React.useState(false)
    const {
        slots,
        loading: slotsLoading,
        error: slotsError,
        refetch: slotsRefetch,
        settledKey: slotsSettledKey,
    } = useCalcomSlots(
        hasCalConfig ? calApiKey : "",
        hasCalConfig ? calEventTypeId : "",
        hasDatetimeStep && reachedDatetimeStep ? visibleMonth : null,
        timeZone,
        undefined,
        errorCopy,
        FETCH_TIMEOUT_MS,
        calApiBaseUrl,
        DEFAULT_CAL_API_VERSION,
        SLOTS_CACHE_TTL_MS
    )

    const beInteractiveForMeta = useBeInteractive()
    const {
        status: calEventMetaStatus,
        meta: calEventMeta,
        bookingFields: calBookingFields,
    } = useCalcomEventMeta({
        enabled: hasCalConfig && hasDatetimeStep && beInteractiveForMeta,
        apiKey: calApiKey,
        eventTypeId: calEventTypeId,
        apiBaseUrl: calApiBaseUrl,
    })

    const meetingDurationMs = React.useMemo(() => {
        const minutes = calEventMeta?.durationMinutes
        if (typeof minutes === "number" && Number.isFinite(minutes) && minutes > 0) {
            return Math.round(minutes) * 60 * 1000
        }
        return DEFAULT_MEETING_DURATION_MS
    }, [calEventMeta])

    const [availabilityNowMs, setAvailabilityNowMs] = React.useState<number | null>(null)
    const beInteractiveForNow = useBeInteractive()
    useIsomorphicLayoutEffect(() => {
        if (typeof window === "undefined") return
        if (isStaticRender) return
        if (!beInteractiveForNow) return
        setAvailabilityNowMs(Date.now())
        const id = window.setInterval(() => setAvailabilityNowMs(Date.now()), 30000)
        return () => window.clearInterval(id)
    }, [isStaticRender, beInteractiveForNow])
    // Midnight rollover: a pick that is now a past day is cleared so a stale
    // selection can never linger with a highlight (submit guard is backstop).
    const todayKeyForRollover =
        availabilityNowMs != null && isValidTimeZone(timeZone)
            ? getDateKeyInTimeZone(new Date(availabilityNowMs), timeZone)
            : ""
    React.useEffect(() => {
        if (!todayKeyForRollover) return
        const slot = valuesRef.current[SELECTED_SLOT_KEY]
        const picked = pickedDate ?? (slot && slot.date instanceof Date ? slot.date : null)
        if (!picked) return
        let pickedKey = ""
        try {
            pickedKey = getDateKeyInTimeZone(picked, timeZone)
        } catch {
            return
        }
        if (pickedKey && pickedKey < todayKeyForRollover) {
            valuesRef.current = { ...valuesRef.current, [SELECTED_SLOT_KEY]: undefined }
            setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: undefined }))
            setPickedDate(null)
            idempotencyKeyRef.current = null
        }
    }, [todayKeyForRollover, pickedDate, timeZone])
    const availableDates = React.useMemo(() => {
        if (!hasCalConfig) return undefined
        return buildFutureAwareAvailableDates(slots, timeZone, availabilityNowMs)
    }, [hasCalConfig, slots, timeZone, availabilityNowMs])

    const slotsWindowKey = React.useMemo(() => {
        if (!hasCalConfig || !visibleMonth) return null
        return monthCacheKey(visibleMonth, timeZone, calApiKey, calEventTypeId, calApiBaseUrl)
    }, [hasCalConfig, visibleMonth, timeZone, calApiKey, calEventTypeId, calApiBaseUrl])
    const availabilitySettled = React.useMemo(() => {
        if (!hasCalConfig) return true
        if (!hasDatetimeStep || !reachedDatetimeStep) return true
        if (!slotsWindowKey) return false
        return slotsSettledKey === slotsWindowKey
    }, [hasCalConfig, hasDatetimeStep, reachedDatetimeStep, slotsWindowKey, slotsSettledKey])
    // Restored-slot revalidation: once the pipeline settles, a restored pick that is
    // no longer bookable (day gone from availability, or exact time gone from slots)
    // is cleared so the visitor can't submit a stale slot. One-shot; any manual pick,
    // date change, or validated Continue disarms it first (see handlers below).
    React.useEffect(() => {
        if (!restoredSlotPendingRef.current) return
        if (!availabilitySettled) return
        restoredSlotPendingRef.current = false
        if (!hasCalConfig) return
        const slot = valuesRef.current[SELECTED_SLOT_KEY]
        if (!slot || !isBookingPayload(slot) || !(slot.date instanceof Date)) return
        let dayOk = false
        let timeOk = false
        try {
            dayOk = !!availableDates?.has(getDateKeyInTimeZone(slot.date, timeZone))
            timeOk = slots.some((s) => s.value === slot.time24h)
        } catch {
            return
        }
        if (!dayOk || !timeOk) {
            valuesRef.current = { ...valuesRef.current, [SELECTED_SLOT_KEY]: undefined }
            setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: undefined }))
            setPickedDate(null)
            idempotencyKeyRef.current = null
        }
    }, [availabilitySettled, hasCalConfig, availableDates, slots, timeZone])

    const slotsForSelectedDate = React.useMemo(() => {
        if (!selectedDate) return slots
        const selectedKey = getDateKeyInTimeZone(selectedDate, timeZone)
        return slots.filter((slot) => {
            return slotDateKeyInTimeZone(slot.value, timeZone) === selectedKey
        })
    }, [slots, selectedDate, timeZone])

    const isCanvas = React.useMemo(() => RenderTarget.current() === RenderTarget.canvas, [])

    // BE-064 (option A): Cal.com is the single source of truth. Every visible
    // Cal.com field with no engine match is auto-injected — required AND optional.
    // Dashboard-disabled fields arrive as `hidden` (the toggle IS the hidden flag —
    // verified against the dashboard badges) and are never injected, exactly like
    // the official Cal.com component, which does not render them either.
    // Cal.com system slugs that must never auto-inject, even when visible:
    // - rescheduleReason belongs to the reschedule flow only; a fresh booking
    //   has nothing to reschedule, and the official component does not ask it.
    // - guests (Multiple Emails) has no engine counterpart by design (BE-059
    //   decision: single-attendee identity); empty matches the official default.
    // An author who really wants either covers it manually (label/calFieldId) and
    // it flows through the normal coverage path above - nothing is blocked.
    const missingCalFields = React.useMemo(() => {
        if (!calBookingFields || calBookingFields.length === 0) return []
        if (!hasCalConfig) return []
        if (!hasDatetimeStep) return []
        const covered = new Set<string>()
        for (const step of baseActiveSteps) {
            for (const field of step.fields) {
                const calId = (field.calFieldId || "").trim().toLowerCase()
                if (calId) covered.add(calId)
                const auto = slugifyLabel(field.label || "").toLowerCase()
                if (auto) covered.add(auto)
                if (field.isPrimaryName && field.fieldType === "text") {
                    covered.add("name")
                    covered.add("fullname")
                }
                if (field.fieldType === "email") covered.add("email")
            }
        }
        return calBookingFields.filter(
            (f) =>
                !f.hidden &&
                !SYSTEM_EXCLUDED_CAL_SLUGS.has(f.slug.toLowerCase()) &&
                !covered.has(f.slug.toLowerCase())
        )
    }, [calBookingFields, baseActiveSteps, hasCalConfig, hasDatetimeStep])

    // BE-062: Cal.com email can be toggled off (Hidden) per event. When the
    // event metadata positively shows the Cal email question hidden, the
    // engine's first email field becomes optional — never hidden (the author
    // configured it visibly). Absent/failed metadata resolves to false (fail
    // closed: today's forced-required stands, never blocks — rule 38).
    const calEmailHidden = React.useMemo(() => {
        if (!hasCalConfig || !hasDatetimeStep) return false
        return (calBookingFields || []).some(
            (f) =>
                f.hidden === true &&
                (f.slug.toLowerCase() === "email" ||
                    (f.isDefault && f.type.toLowerCase() === "email"))
        )
    }, [calBookingFields, hasCalConfig, hasDatetimeStep])

    const effectiveActiveSteps = React.useMemo(() => {
        if (missingCalFields.length === 0 && !calEmailHidden) return baseActiveSteps
        if (isCanvas) return baseActiveSteps
        let steps = baseActiveSteps
        if (calEmailHidden) {
            let relaxed = false
            steps = baseActiveSteps.map((step) => ({
                ...step,
                fields: step.fields.map((field) => {
                    if (!relaxed && field.fieldType === "email") {
                        relaxed = true
                        return { ...field, required: false }
                    }
                    return field
                }),
            }))
        }
        if (missingCalFields.length === 0) return steps
        const autoFields: NormalizedField[] = missingCalFields.map((f) => {
            const calKind = (f.type || "").toLowerCase()
            const hasOptions = !!f.options && f.options.length > 0
            let fieldType = calTypeToFieldType(f.type)
            if (fieldType === "select" && !hasOptions) {
                fieldType = "text"
            }
            return {
                id: `auto-cal-${f.slug}`,
                label: f.label || f.slug,
                // BE-099: Cal-provided placeholder only — absent stays
                // undefined so the per-type default shows.
                ...(f.placeholder ? { placeholder: f.placeholder } : {}),
                required: f.required,
                fieldType,
                width: "full" as const,
                options: f.options ? [...f.options] : [],
                calFieldId: f.slug,
                isPrimaryName: false,
                ...(fieldType === "text" && calKind !== "text" ? { minLength: 1 } : {}),
            }
        }) as NormalizedField[]
        const autoStep: NormalizedStep = {
            id: "auto-cal-required",
            enabled: true,
            stepType: "form",
            title: "Additional Details",
            subtitle: "Please provide the following details to complete your booking.",
            layout: "single-column",
            fields: autoFields,
        }
        return [...steps, autoStep]
    }, [baseActiveSteps, missingCalFields, isCanvas, calEmailHidden])

    const calendarStageConfig: CalendarStageConfig = React.useMemo(() => {
        if (calendar) {
            return {
                title: calendar.title || DEFAULT_CALENDAR_TITLE,
                subtitle:
                    calendar.subtitle !== undefined ? calendar.subtitle : DEFAULT_CALENDAR_SUBTITLE,
                surface: calendar.surface,
            }
        }
        return legacyCalendar.calendar
    }, [calendar, legacyCalendar])
    const calendarStage: NormalizedStep = React.useMemo(
        () => ({
            id: SYSTEM_CALENDAR_ID,
            enabled: true,
            stepType: "datetime",
            title: calendarStageConfig.title,
            subtitle: calendarStageConfig.subtitle,
            layout: "single-column",
            fields: [],
        }),
        [calendarStageConfig]
    )

    const activeSteps = React.useMemo(
        () => [...effectiveActiveSteps, calendarStage],
        [effectiveActiveSteps, calendarStage]
    )
    const totalActive = activeSteps.length
    const safeCurrentIndex = Math.min(currentIndex, Math.max(0, totalActive - 1))
    const currentStep: NormalizedStep | undefined =
        safeCurrentIndex >= 0 && safeCurrentIndex < activeSteps.length
            ? activeSteps[safeCurrentIndex]
            : undefined
    const isFirst = safeCurrentIndex === 0
    const isLast = safeCurrentIndex === totalActive - 1

    React.useEffect(() => {
        if (reachedDatetimeStep) return
        const step = activeSteps[safeCurrentIndex]
        if (step && step.stepType === "datetime") {
            setReachedDatetimeStep(true)
        }
    }, [activeSteps, safeCurrentIndex, reachedDatetimeStep])

    // BE-116: field ids are positional (step-0-field-1), so a field-type
    // change orphans the stored value (select seed "Option 1" lingering in a
    // field that is now text). The first render with a new type treats the
    // field as brand-new: drop its value + error, keep everything else. The
    // placeholder lives in config and is never touched — it survives type
    // changes by design. First-seen ids only seed the map (fresh loads must
    // never wipe restored autosave — rules 7/13); remounts with equal types
    // are no-ops (rule 74).
    const prevFieldTypesRef = React.useRef<Record<string, string>>({})
    useIsomorphicLayoutEffect(() => {
        const prev = prevFieldTypesRef.current
        const next: Record<string, string> = {}
        const changed: string[] = []
        for (const step of effectiveActiveSteps) {
            for (const field of step.fields || []) {
                next[field.id] = field.fieldType
                if (prev[field.id] !== undefined && prev[field.id] !== field.fieldType) {
                    changed.push(field.id)
                }
            }
        }
        prevFieldTypesRef.current = next
        if (changed.length === 0) return
        const current = valuesRef.current || {}
        const stale = changed.filter((id) => !isEmptyPayloadValue(current[id]))
        if (stale.length === 0) return
        setValues((prevValues) => {
            const nextValues = { ...prevValues }
            for (const id of stale) delete nextValues[id]
            return nextValues
        })
        setErrors((prevErrors) => {
            const nextErrors = { ...prevErrors }
            for (const id of stale) delete nextErrors[id]
            return nextErrors
        })
    }, [effectiveActiveSteps])

    useIsomorphicLayoutEffect(() => {
        if (currentIndex >= totalActive && totalActive > 0) {
            setCurrentIndex(Math.max(0, totalActive - 1))
        }
    }, [currentIndex, totalActive])

    const lastEffectiveStepsKeyRef = React.useRef<string>(activeSteps.map((s) => s.id).join("|"))
    const effectivePinnedIdRef = React.useRef<string | null>(null)
    React.useEffect(() => {
        if (restoredStepIdRef.current) {
            effectivePinnedIdRef.current = restoredStepIdRef.current
            restoredStepIdRef.current = null
        } else {
            effectivePinnedIdRef.current = activeSteps[safeCurrentIndex]?.id ?? null
        }
        currentEffectiveStepIdRef.current = activeSteps[safeCurrentIndex]?.id ?? null
    }, [safeCurrentIndex, activeSteps])
    const effectiveStepsKey = activeSteps.map((s) => s.id).join("|")
    if (effectiveStepsKey !== lastEffectiveStepsKeyRef.current) {
        lastEffectiveStepsKeyRef.current = effectiveStepsKey
        const restoredId = restoredStepIdRef.current
        const wantedId = restoredId ?? effectivePinnedIdRef.current
        const pinnedIdx = wantedId ? activeSteps.findIndex((s) => s.id === wantedId) : -1
        const remappedEff =
            pinnedIdx !== -1 ? pinnedIdx : Math.min(safeCurrentIndex, totalActive - 1)
        if (restoredId && pinnedIdx !== -1) restoredStepIdRef.current = null
        if (remappedEff !== currentIndex) {
            setCurrentIndex(remappedEff)
        }
    }

    const needsNameEmailGuardrail = React.useMemo(() => {
        if (!isCanvas) return false
        return !findNameField(baseActiveSteps) || !findEmailField(baseActiveSteps)
    }, [baseActiveSteps, isCanvas])

    const emptyStepWarnings = React.useMemo(() => {
        if (!isCanvas) return []
        const warnings: string[] = []
        for (const step of normalizedSteps) {
            if (step.stepType === "form" && step.fields.length === 0) {
                warnings.push(
                    `Step "${step.title}" has no fields and is skipped on the published site. Add at least one field in the Fields property.`
                )
            }
        }
        for (const step of baseActiveSteps) {
            if (step.stepType === "form" || step.stepType === "datetime") {
                for (const field of step.fields) {
                    const isChoiceType = [
                        "select",
                        "segmented",
                        "pills",
                        "cards",
                        "radio",
                    ].includes(field.fieldType)
                    if (isChoiceType && (!field.options || field.options.length === 0)) {
                        warnings.push(
                            `Field "${field.label}" in step "${step.title}" has no options. Add at least one option.`
                        )
                    }
                }
            }
        }
        if (missingCalFields.length > 0) {
            const labels = missingCalFields
                .map((f) => `"${f.label} (${f.slug})"${f.required ? "" : " (optional)"}`)
                .join(", ")
            warnings.push(
                `Cal.com event has ${missingCalFields.length === 1 ? "a field" : "fields"} your Engine has no matching field for: ${labels}. Add ${missingCalFields.length === 1 ? "a field" : "fields"} with ${missingCalFields.length === 1 ? "that label" : "those labels"} (or matching Cal Field IDs) to style and position ${missingCalFields.length === 1 ? "it" : "them"} yourself, or remove ${missingCalFields.length === 1 ? "it" : "them"} in Cal.com. Visitors will see ${missingCalFields.length === 1 ? "it" : "them"} as an auto-generated Additional Details step before the calendar (required state honored as configured).`
            )
        }
        ;(effectiveStepsConfig || []).forEach((step, stepIdx) => {
            const n = stepIdx + 1
            if (step.showHeader === false) return
            const hasTitle = Boolean(step.title && String(step.title).trim())
            const hasSubtitle = Boolean(step.subtitle && String(step.subtitle).trim())
            if (!hasTitle) {
                warnings.push(
                    hasSubtitle
                        ? `Step ${n} has no title, so visitors see the generic heading "Step ${n}". Add a title in the step's properties.`
                        : `Step ${n} has no title or subtitle, so visitors see a bare generic heading. Add them in the step's properties.`
                )
            }
        })
        // BE-039: identity designation warnings (canvas-only).
        const identityFields = baseActiveSteps.flatMap((step) => step.fields)
        const flaggedNames = identityFields.filter((field) => isNameFlagged(field))
        const typedEmails = identityFields.filter((field) => field.fieldType === "email")
        if (flaggedNames.length > 1) {
            warnings.push(
                `Multiple fields are marked "Name" (${flaggedNames
                    .map((f) => `"${f.label}"`)
                    .join(
                        ", "
                    )}). The first is used as the booking attendee name; keep exactly one to avoid confusion.`
            )
        }
        if (typedEmails.length > 1) {
            warnings.push(
                `Multiple Email fields found (${typedEmails
                    .map((f) => `"${f.label}"`)
                    .join(
                        ", "
                    )}). Only the first is the booking contact identity${
                    calEmailHidden
                        ? " (optional while the Cal.com email question is hidden)"
                        : " and is always required (its Required off is ignored)"
                }; later Email fields use their own Required setting.`
            )
        }
        const rawFirstEmail = (effectiveStepsConfig || [])
            .flatMap((step) => step.fields || [])
            .find((field) => field.fieldType === "email")
        if (rawFirstEmail && rawFirstEmail.required === false && !calEmailHidden) {
            warnings.push(
                `The first Email field ("${rawFirstEmail.label || "Email"}") has Required off, but it stays required as the booking contact identity — the toggle is ignored. Later Email fields obey their own Required setting.`
            )
        }
        if (flaggedNames.length === 0) {
            const fallbackName = findNameField(baseActiveSteps)
            if (fallbackName) {
                warnings.push(
                    `No field is marked "Name", so "${fallbackName.label}" is used as the booking attendee name (matched by label) and is always required. Mark it "Name" to make this explicit.`
                )
            }
        }
        if (typedEmails.length === 0) {
            const fallbackContact = findEmailField(baseActiveSteps)
            if (fallbackContact) {
                warnings.push(
                    `No Email-type field exists, so "${fallbackContact.label}" is used as the booking contact email (matched by label) and is always required. Change its type to Email to make this explicit.`
                )
            }
        }
        if (
            baseActiveSteps.some((step) =>
                step.fields.some((field) => field.id === "auto-name-field")
            )
        ) {
            warnings.push(
                `A "Full Name" field was restored automatically - Cal.com bookings cannot exist without an attendee name. Add your own text field and mark it "Name" to customize it.`
            )
        }
        return warnings
    }, [
        normalizedSteps,
        baseActiveSteps,
        activeSteps,
        isCanvas,
        effectiveStepsConfig,
        calApiKey,
        calEventTypeId,
        missingCalFields,
        calEmailHidden,
    ])

    const emitAnalytics = React.useCallback(
        (eventName: string, payload?: Record<string, unknown>) => {
            if (typeof onAnalytics !== "function") return
            try {
                onAnalytics(eventName, payload)
            } catch (err: unknown) {
                console.warn(`BookingEngine: analytics callback threw for "${eventName}".`, err)
            }
        },
        [onAnalytics]
    )

    const submittingRef = React.useRef(false)
    const navigatingRef = React.useRef(false)
    const idempotencyKeyRef = React.useRef<string | null>(null)
    const submitErrorCodeRef = React.useRef<string | null>(null)

    const valuesRef = React.useRef(values)
    React.useEffect(() => {
        valuesRef.current = values
    }, [values])

    React.useEffect(() => {
        navigatingRef.current = false
    }, [safeCurrentIndex])

    const abortControllerRef = React.useRef<AbortController | null>(null)
    const cancelRequestedRef = React.useRef(false)
    const submitSeqRef = React.useRef(0)
    React.useEffect(() => {
        return () => {
            submittingRef.current = false
            abortControllerRef.current?.abort()
            abortControllerRef.current = null
        }
    }, [])

    const stepTitleRef = React.useRef<HTMLHeadingElement | null>(null)
    const focusStepTitle = React.useCallback(() => {
        const el = stepTitleRef.current
        if (!el) return
        try {
            el.focus({ preventScroll: true })
            el.scrollIntoView({ block: "nearest" })
        } catch {}
    }, [])
    const submitButtonRef = React.useRef<HTMLButtonElement | null>(null)
    const hasMountedStepRef = React.useRef(false)
    // No programmatic step focus before the visitor's first real input: Chromium
    // paints :focus-visible on focused elements when the page never delivered an
    // input event, which drew a ring around the heading on every load until the
    // first click. The interaction gate latches on real pointer/key input only,
    // so Continue/Back/keys flows still announce exactly as before.
    const beInteractiveForFocus = useBeInteractive()
    React.useEffect(() => {
        if (!hasMountedStepRef.current) {
            hasMountedStepRef.current = true
            return
        }
        if (loadFocusSuppressedRef.current) return
        if (!beInteractiveForFocus) return
        focusStepTitle()
    }, [safeCurrentIndex, focusStepTitle, beInteractiveForFocus])

    const handleFieldChange = React.useCallback(
        (fieldId: string, value: string | boolean | Array<string> | undefined) => {
            let field: NormalizedField | undefined
            for (const step of activeSteps) {
                if (step.stepType === "form" || step.stepType === "datetime") {
                    field = step.fields.find((candidate) => candidate.id === fieldId)
                    if (field) break
                }
            }
            const nextValue = value
            valuesRef.current = { ...valuesRef.current, [fieldId]: nextValue }
            const liveKey = instanceKeyRef.current
            const liveSnap = inSessionFormSnapshots.get(liveKey)
            inSessionFormSnapshots.set(liveKey, {
                values: valuesRef.current,
                currentIndex: liveSnap?.currentIndex ?? 0,
                timeFormat: liveSnap?.timeFormat ?? "12h",
                live: true,
            })
            setValues((prev) => ({ ...prev, [fieldId]: nextValue }))
            if (!field) return
            setErrors((prev) => {
                if (!prev[fieldId]) return prev
                const err = validateField(field, nextValue, validationCopy)
                if (err === prev[fieldId]) return prev
                return { ...prev, [fieldId]: err }
            })
        },
        [activeSteps, validationCopy]
    )

    const handleTimeFormatChange = React.useCallback((format: "12h" | "24h") => {
        setTimeFormat(format)
    }, [])

    const transitionFlowStatus = React.useCallback((next: FlowStatus) => {
        setFlowStatus((prev) => {
            if (next === prev) return prev
            if (!FLOW_STATUS_TRANSITIONS[prev]?.includes(next)) {
                console.warn(`BookingEngine: blocked flowStatus transition ${prev} -> ${next}`)
                return prev
            }
            return next
        })
    }, [])

    const focusFirstInvalidField = React.useCallback(
        (step: NormalizedStep) => {
            if (typeof document === "undefined") return
            if ((step.stepType as string) === "review") return
            for (const field of step.fields) {
                const err = validateField(field, valuesRef.current[field.id], validationCopy)
                if (err) {
                    const wrapper = engineRootRef?.current?.querySelector<HTMLElement>(
                        `[data-field-id="${field.id}"]`
                    )
                    const focusable = wrapper?.querySelector<HTMLElement>(
                        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
                    )
                    const target = focusable ?? wrapper
                    if (target) {
                        try {
                            target.focus({ preventScroll: true })
                            target.scrollIntoView({ behavior: "smooth", block: "nearest" })
                        } catch {}
                        break
                    }
                }
            }
        },
        [validationCopy]
    )

    const handleSubmitBooking = React.useCallback(async () => {
        if (isStaticRender) return
        if (submittingRef.current) return
        submittingRef.current = true

        const nameField = findNameField(activeSteps)
        const emailField = findEmailField(activeSteps)
        const slot = valuesRef.current[SELECTED_SLOT_KEY]

        if (!slot) {
            setSubmitError(errorCopy.missingSlotError)
            transitionFlowStatus("error")
            submittingRef.current = false
            emitAnalytics("booking_error", {
                reason: "missing-slot",
                message: errorCopy.missingSlotError,
            })
            return
        }
        if (!nameField || !emailField) {
            setSubmitError(errorCopy.misconfiguredFormError)
            transitionFlowStatus("error")
            submittingRef.current = false
            emitAnalytics("booking_error", {
                reason: "missing-name-email-field",
                message: errorCopy.misconfiguredFormError,
            })
            return
        }

        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h)) {
            setSubmitError(errorCopy.invalidSlotTimeError)
            transitionFlowStatus("error")
            submittingRef.current = false
            emitAnalytics("booking_error", {
                reason: "invalid-slot-time",
                message: errorCopy.invalidSlotTimeError,
            })
            return
        }

        const name = String(valuesRef.current[nameField.id] || "")
        const email = String(valuesRef.current[emailField.id] || "")
        const bookingFieldsResponses = buildBookingFieldsResponses(activeSteps, valuesRef.current)

        transitionFlowStatus("submitting")
        setSubmitError(null)
        scheduleFocusTimer(() => {
            submitButtonRef.current?.focus()
        })
        emitAnalytics("booking_submitted", {
            slotStart: slot.time24h,
            calEventTypeId,
        })

        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = makeIdempotencyKey()
        }

        abortControllerRef.current = new AbortController()
        const submitSeq = ++submitSeqRef.current

        const result = await submitCalcomBooking({
            apiKey: calApiKey,
            eventTypeId: calEventTypeId,
            slotStart: slot.time24h,
            slotEnd: slot.end,
            allowLengthInMinutes: (calEventMeta?.multipleLengths?.length ?? 0) > 1,
            name,
            email,
            timeZone,
            bookingFieldsResponses,
            idempotencyKey: idempotencyKeyRef.current,
            externalSignal: abortControllerRef.current.signal,
            errorCopy,
            timeoutMs: FETCH_TIMEOUT_MS,
            apiBaseUrl: calApiBaseUrl,
        })
        abortControllerRef.current = null

        if (cancelRequestedRef.current) {
            cancelRequestedRef.current = false
            submittingRef.current = false
            if (submitSeqRef.current === submitSeq) {
                transitionFlowStatus("in-progress")
            }
            return
        }

        if (result.success) {
            idempotencyKeyRef.current = null
            setBookingResult({
                uid: result.bookingUid || null,
                manageUrl: result.bookingUid
                    ? `https://cal.com/booking/${encodeURIComponent(result.bookingUid)}`
                    : null,
                rescheduleUrl: result.rescheduleUrl || null,
                cancelUrl: result.cancelUrl || null,
            })
            transitionFlowStatus("success")
            emitAnalytics("booking_success", {
                bookingUid: result.bookingUid || null,
            })
            slotsRefetch()
        } else {
            const errorMessage = result.alreadyMapped
                ? result.error || copy.errorFallbackMessage
                : mapCalcomError(
                      result.error || copy.unknownErrorLabel,
                      result.errorCode,
                      errorCopy,
                      copy.errorFallbackMessage,
                      result.httpStatus
                  )
            setSubmitError(errorMessage)
            submitErrorCodeRef.current =
                result.errorCode ||
                (typeof result.httpStatus === "number" ? `HTTP_${result.httpStatus}` : null)
            transitionFlowStatus("error")
            emitAnalytics("booking_error", {
                reason: "submit-failed",
                errorCode: result.errorCode || null,
                message: errorMessage,
            })
        }
        submittingRef.current = false
    }, [
        activeSteps,
        calApiKey,
        calEventTypeId,
        timeZone,
        validationCopy,
        emitAnalytics,
        errorCopy,
        calApiBaseUrl,
        copy,
        transitionFlowStatus,
        scheduleFocusTimer,
        isStaticRender,
    ])

    const handleContinue = React.useCallback(() => {
        if (!currentStep) return
        if (flowStatus === "submitting") return

        const { valid, errors: stepErrors } = validateStep(
            currentStep,
            valuesRef.current,
            validationCopy
        )
        setErrors((prev) => ({ ...prev, ...stepErrors }))
        setTouched((prev) => touchAllFieldsIn(currentStep, prev))

        if (!valid) {
            scheduleFocusTimer(() => focusFirstInvalidField(currentStep))
            return
        }
        restoredSlotPendingRef.current = false

        if (isLast) {
            const hasDatetime = activeSteps.some((step) => step.stepType === "datetime")
            if (hasDatetime && hasCalConfig) {
                handleSubmitBooking()
            } else if (hasDatetime && !hasCalConfig) {
                const noConfigMessage = errorCopy.unavailableMessage
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

        if (navigatingRef.current) return
        navigatingRef.current = true
        emitAnalytics("step_complete", {
            stepIndex: safeCurrentIndex,
            stepNumber: safeCurrentIndex + 1,
            totalSteps: totalActive,
            stepTitle: currentStep.title,
            stepType: currentStep.stepType,
        })
        const destStep = activeSteps[Math.min(safeCurrentIndex + 1, totalActive - 1)]
        if (destStep) setErrors((prev) => clearedStepErrors(prev, destStep))
        loadFocusSuppressedRef.current = false
        setCurrentIndex((i) => Math.min(i + 1, totalActive - 1))
    }, [
        currentStep,
        flowStatus,
        isLast,
        totalActive,
        activeSteps,
        safeCurrentIndex,
        hasCalConfig,
        validationCopy,
        focusFirstInvalidField,
        handleSubmitBooking,
        scheduleFocusTimer,
        setSubmitError,
        transitionFlowStatus,
        emitAnalytics,
        errorCopy,
    ])

    const handleBack = React.useCallback(() => {
        if (isFirst) return
        if (navigatingRef.current) return
        navigatingRef.current = true
        const destStep = activeSteps[Math.max(0, safeCurrentIndex - 1)]
        if (destStep) setErrors((prev) => clearedStepErrors(prev, destStep))
        loadFocusSuppressedRef.current = false
        setCurrentIndex((i) => Math.max(0, i - 1))
    }, [isFirst, activeSteps, safeCurrentIndex])

    const handleJumpToStep = React.useCallback(
        (stepIndex: number) => {
            if (stepIndex < 0 || stepIndex >= activeSteps.length) return
            if (stepIndex >= safeCurrentIndex) return
            if (navigatingRef.current) return
            navigatingRef.current = true
            if (flowStatus === "submitting") {
                setSubmitError(null)
                idempotencyKeyRef.current = null
                cancelRequestedRef.current = true
                abortControllerRef.current?.abort()
                abortControllerRef.current = null
                submittingRef.current = false
            }
            transitionFlowStatus("in-progress")
            const destStep = activeSteps[stepIndex]
            if (destStep) setErrors((prev) => clearedStepErrors(prev, destStep))
            loadFocusSuppressedRef.current = false
            setCurrentIndex(stepIndex)
        },
        [activeSteps, flowStatus, transitionFlowStatus, safeCurrentIndex]
    )

    const handleRetry = React.useCallback(() => {
        const code = (submitErrorCodeRef.current || "").toUpperCase()
        const msg = submitError || ""
        const slotTaken =
            code.includes("SLOT_NOT_AVAILABLE") ||
            code.includes("BOOKING_LIMIT") ||
            code.includes("MAXIMUM_NUMBER_OF_BOOKINGS") ||
            code.includes("HTTP_409") ||
            msg.includes("just taken") ||
            msg.includes("no longer available")
        submitErrorCodeRef.current = null
        if (slotTaken) {
            const dtIdx = activeSteps.findIndex((step) => step.stepType === "datetime")
            if (dtIdx >= 0) {
                valuesRef.current = {
                    ...valuesRef.current,
                    [SELECTED_SLOT_KEY]: undefined,
                }
                setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: undefined }))
                setPickedDate(null)
                idempotencyKeyRef.current = null
                loadFocusSuppressedRef.current = false
                setCurrentIndex(dtIdx)
                slotsRefetch()
            }
        }
        transitionFlowStatus("in-progress")
        setSubmitError(null)
        setBookingResult(null)
        submittingRef.current = false
        scheduleFocusTimer(() => {
            focusStepTitle()
        })
    }, [
        submitError,
        activeSteps,
        slotsRefetch,
        scheduleFocusTimer,
        transitionFlowStatus,
        focusStepTitle,
    ])

    const handleRestart = React.useCallback(() => {
        if (isStaticRender) return
        valuesRef.current = {}
        setValues({})
        setErrors({})
        setTouched({})
        setPickedDate(null)
        setVisibleMonth(null)
        setSubmitError(null)
        setBookingResult(null)
        loadFocusSuppressedRef.current = false
        setCurrentIndex(0)
        transitionFlowStatus("in-progress")
        submittingRef.current = false
        idempotencyKeyRef.current = null
        if (typeof window !== "undefined" && persistState) {
            try {
                window.sessionStorage.removeItem(instanceKeyRef.current)
            } catch (err: unknown) {
                console.warn("BookingEngine: failed to clear saved progress on restart.", err)
            }
        }
    }, [persistState, transitionFlowStatus, isStaticRender])

    const handleSlotReady = React.useCallback(
        (payload?: BookingPayload) => {
            if (!payload) {
                valuesRef.current = {
                    ...valuesRef.current,
                    [SELECTED_SLOT_KEY]: undefined,
                }
                setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: undefined }))
                idempotencyKeyRef.current = null
                return
            }
            valuesRef.current = {
                ...valuesRef.current,
                [SELECTED_SLOT_KEY]: payload,
            } as BookingValues
            setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: payload }) as BookingValues)
            idempotencyKeyRef.current = null
            restoredSlotPendingRef.current = false
            setTouched((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: true }))
            setErrors((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: null }))
            scheduleFocusTimer(() => {
                submitButtonRef.current?.focus()
            })
        },
        [scheduleFocusTimer]
    )

    const handleInlineDateChange = React.useCallback((d: Date) => {
        restoredSlotPendingRef.current = false
        setPickedDate(d)
    }, [])
    const handleInlineMonthChange = React.useCallback((m: Date) => setVisibleMonth(m), [])

    const fontStack: React.CSSProperties = React.useMemo(
        () => ({
            fontFamily: font?.fontFamily ?? DEFAULT_FONT_FAMILY,
            fontSize: font?.fontSize ?? 15,
            lineHeight: font?.lineHeight ?? 1.4,
            letterSpacing: font?.letterSpacing ?? 0,
            fontWeight: font?.fontWeight ?? 400,
            fontStyle: font?.fontStyle ?? "normal",
        }),
        [font]
    )
    const bodySubtitleSize = fontPixelSize(font?.fontSize) ?? 14
    const bodySubtitleLineHeight = font?.lineHeight ?? 1.5

    const needsCalSetup = hasDatetimeStep && !hasCalConfig

    const progressPct = totalActive > 0 ? ((safeCurrentIndex + 1) / totalActive) * 100 : 0
    const completePct = Math.round(progressPct)
    const counterText = formatStepCounter(
        copy.stepCounterTemplate,
        safeCurrentIndex + 1,
        totalActive
    )
    const stepAnnouncementText = currentStep
        ? (copy.stepAnnouncementTemplate ?? DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE)
              .replace("{counter}", counterText)
              .replace("{percent}", String(completePct))
              .replace("{title}", currentStep.title)
        : ""
    const announcedStepRef = React.useRef(safeCurrentIndex)
    const [stepAnnouncement, setStepAnnouncement] = React.useState("")
    useIsomorphicLayoutEffect(() => {
        if (announcedStepRef.current === safeCurrentIndex) return
        announcedStepRef.current = safeCurrentIndex
        setStepAnnouncement(stepAnnouncementText)
    }, [safeCurrentIndex, stepAnnouncementText])

    const primaryLabel = totalActive === 1 || isLast ? finalActionLabel : continueLabel
    const isFinalPrimary = totalActive === 1 || isLast
    const isSubmitting = flowStatus === "submitting"
    const navGrouped = groupNavButtons === true
    const navJustify: "flex-start" | "center" | "flex-end" | "space-between" = navGrouped
        ? groupedNavAlignment === "left"
            ? "flex-start"
            : groupedNavAlignment === "center"
              ? "center"
              : "flex-end"
        : isFirst
          ? "flex-end"
          : "space-between"
    const terminalActionJustify: "flex-start" | "center" | "flex-end" | undefined = navGrouped
        ? groupedNavAlignment === "left"
            ? "flex-start"
            : groupedNavAlignment === "center"
              ? "center"
              : "flex-end"
        : undefined
    const contentAlignmentRaw =
        styles?.header?.contentAlignment ??
        styles?.contentAlignment ??
        header?.contentAlignment ??
        header?.terminalAlignment
    const terminalAlignment: "left" | "center" | "right" = isStepAlignment(contentAlignmentRaw)
        ? contentAlignmentRaw
        : "left"
    const globalFieldStyles = React.useMemo(
        () => normalizeStyleOverrides(styles.fieldStyles ?? fieldStyles),
        [styles.fieldStyles, fieldStyles]
    )
    const primaryFirst = buttonOrderValue === "primaryFirst"
    const navFill = buttonWidthValue === "fill"
    const progressAnimate = React.useMemo(() => ({ scaleX: progressPct / 100 }), [progressPct])

    return {
        accentColor,
        activeSteps,
        availableDates,
        availabilitySettled,
        backLabel,
        bookingResult,
        borderColor,
        borderRadius,
        sanitizedRadius,
        buttonLabels,
        calApiKey,
        calEventTypeId,
        fieldGap,
        sectionSpacing,
        globalFieldStyles,
        completePct,
        continueLabel,
        copy,
        counterText,
        currentIndex,
        currentStep,
        effectiveStepsConfig,
        emptyStepWarnings,
        errorColor,
        errors,
        finalActionLabel,
        flowStatus,
        focusFirstInvalidField,
        focusTimerRef,
        font,
        headingFont,
        fontStack,
        bodySubtitleSize,
        bodySubtitleLineHeight,
        handleBack,
        handleContinue,
        handleFieldChange,
        handleInlineDateChange,
        handleInlineMonthChange,
        handleJumpToStep,
        handleRestart,
        handleRetry,
        handleSlotReady,
        handleSubmitBooking,
        handleTimeFormatChange,
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
        persistTimerRef,
        pickedDate,
        prefersReducedMotion,
        primaryLabel,
        isFinalPrimary,
        navGrouped,
        progressAnimate,
        progressBar,
        progressBarStyle,
        progressPct,
        progressShowTextContent,
        progressVisible,
        reactInstanceId,
        safeCurrentIndex,
        selectedDate,
        instanceKeyRef,
        setBookingResult,
        setCurrentIndex,
        setErrors,
        setFlowStatus,
        setPickedDate,
        setSubmitError,
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
        stepAnnouncement,
        stepTitleRef,
        submitButtonRef,
        stepTransition,
        resolvedTransitionVariant,
        footerLabelTransition,
        segmentedMotion,
        navJustify,
        terminalActionJustify,
        terminalAlignment,
        primaryFirst,
        navFill,
        style,
        styles,
        submitError,
        submittingRef,
        successColor,
        surfaceColor,
        textPrimaryColor,
        textSecondaryColor,
        theme,
        timeFormat,
        timeZone,
        totalActive,
        touched,
        transition,
        transitionVariant,
        transitionFlowStatus,
        validationCopy,
        values,
        valuesRef,
        visibleMonth,
        bookAnotherLabel,
        addToCalendarButtonLabel,
        retryLabel,
        errorCopy,
        calApiBaseUrl,
        meetingDurationMs,
        calendarStageConfig,
        calEventMeta,
        calEventMetaStatus,
    }
}

/**
 * BookingEngine
 *
 * A generic, configurable multi-step form/booking engine with optional Cal.com
 * v2 integration. Drops into any Framer project with zero configuration.
 *
 * @framerIntrinsicWidth 850
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 *
 * @framerDisableUnlink
 */
export default function BookingEngine(props: BookingEngineProps) {
    const engineRootRef = React.useRef<HTMLDivElement | null>(null)
    const formRef = React.useRef<HTMLFormElement | null>(null)
    // Smooth step-height transitions: the form animates its explicit height toward
    // the active step's measured height (null = natural height, the pre-mount and
    // prerender state, so hydration stays byte-identical).
    const [formHeight, setFormHeight] = React.useState<number | null>(null)
    const {
        activeSteps,
        availableDates,
        availabilitySettled,
        backLabel,
        bookingResult,
        borderRadius,
        sanitizedRadius,
        fieldGap,
        sectionSpacing,
        globalFieldStyles,
        buttonLabels,
        completePct,
        copy,
        counterText,
        emptyStepWarnings,
        errors,
        flowStatus,
        fontStack,
        headingFont,
        bodySubtitleSize,
        bodySubtitleLineHeight,
        handleBack,
        handleContinue,
        handleFieldChange,
        handleInlineDateChange,
        handleInlineMonthChange,
        handleJumpToStep,
        handleRestart,
        handleRetry,
        handleSlotReady,
        handleTimeFormatChange,
        hasCalConfig,
        isCanvas,
        isFirst,
        isSubmitting,
        needsCalSetup,
        needsNameEmailGuardrail,
        prefersReducedMotion,
        primaryLabel,
        isFinalPrimary,
        navJustify,
        terminalActionJustify,
        terminalAlignment,
        primaryFirst,
        navFill,
        progressAnimate,
        progressBarStyle,
        progressPct,
        progressShowTextContent,
        progressVisible,
        reactInstanceId,
        safeCurrentIndex,
        selectedDate,
        slotsError,
        slotsForSelectedDate,
        slotsLoading,
        slotsRefetch,
        stepCountPosition,
        stepAnnouncement,
        stepTitleRef,
        submitButtonRef,
        stepTransition,
        resolvedTransitionVariant,
        footerLabelTransition,
        segmentedMotion,
        style,
        submitError,
        theme,
        timeFormat,
        timeZone,
        totalActive,
        touched,
        values,
        visibleMonth,
        bookAnotherLabel,
        addToCalendarButtonLabel,
        retryLabel,
        errorCopy,
        meetingDurationMs,
        calendarStageConfig,
        calEventMeta,
        calEventMetaStatus,
    } = useBookingEngineState(props, engineRootRef)

    const blGroups = buttonLabels ?? {}
    const primarySharedSet = blGroups.primaryButtonStyles
    const secondarySharedSet = blGroups.secondaryButtonStyles
    const calendarLinkSharedSet = blGroups.calendarLinkStyles
    const ghostButtonRole: ButtonRoleDefaults = {
        background: "#FFFFFF",
        color: theme.textSecondaryColor,
        borderWidth: 1,
        borderColor: "transparent",
        padding: "10px 16px 10px 16px",
    }
    const primaryButtonRole: ButtonRoleDefaults = {
        background: theme.accentColor,
        color: theme.accentForegroundColor,
        borderWidth: 0,
        borderColor: theme.borderColor,
        padding: "10px 16px 10px 16px",
    }
    const backButtonGroup = mergeButtonStyleGroups(secondarySharedSet, blGroups.backButton)
    const backButtonStyle = resolveButtonStyle(backButtonGroup, ghostButtonRole, borderRadius)
    const primaryGroup = mergeButtonStyleGroups(
        primarySharedSet,
        isFinalPrimary ? blGroups.finalActionButton : blGroups.continueButton
    )
    const primaryButtonStyle = resolveButtonStyle(primaryGroup, primaryButtonRole, borderRadius)
    const addToCalendarButtonGroup = mergeButtonStyleGroups(
        calendarLinkSharedSet,
        blGroups.addToCalendarButton
    )
    const bookAnotherButtonGroup = mergeButtonStyleGroups(
        primarySharedSet,
        blGroups.bookAnotherButton
    )
    const bookAnotherButtonStyle = resolveButtonStyle(
        bookAnotherButtonGroup,
        { ...primaryButtonRole, padding: "10px 16px 10px 16px" },
        borderRadius
    )
    const retryButtonGroup = mergeButtonStyleGroups(primarySharedSet, blGroups.retryButton)
    const retryButtonStyle = resolveButtonStyle(retryButtonGroup, primaryButtonRole, borderRadius)
    const rescheduleLinkButtonStyle = resolveButtonStyle(
        secondarySharedSet,
        { ...ghostButtonRole, color: theme.textSecondaryColor },
        borderRadius
    )
    const slotPrimarySurface =
        typeof primaryButtonStyle.background === "string"
            ? primaryButtonStyle.background
            : theme.accentColor
    const slotPrimaryText =
        typeof primaryButtonStyle.color === "string"
            ? primaryButtonStyle.color
            : theme.accentForegroundColor
    const backIx = useButtonInteraction()
    const primaryIx = useButtonInteraction()
    const animateIx = !prefersReducedMotion

    const isStaticRender = useIsStaticRenderer()

    // BE-051: ARIA labels are fixed internal constants, never controls.
    const ariaLabels = DEFAULT_ARIA_LABELS

    const prevDiagnosticIndexRef = React.useRef<number>(safeCurrentIndex)
    React.useEffect(() => {
        const prev = prevDiagnosticIndexRef.current
        const direction =
            safeCurrentIndex > prev ? "forward" : safeCurrentIndex < prev ? "back" : "initial"
        prevDiagnosticIndexRef.current = safeCurrentIndex
        if (typeof window === "undefined") return
        const w = window
        if (!w.__BE_STEP_DEBUG__) return
        console.debug(
            `[BE Diagnostic] navigation: ${prev} → ${safeCurrentIndex} direction=${direction} total=${totalActive}`
        )
        activeSteps.forEach((step, idx) => {
            const isActive = idx === safeCurrentIndex
            console.debug(
                `[BE Diagnostic] expected step=${idx} id=${step.id} isActive=${isActive} position=${isActive ? "relative" : "absolute"} opacity=${isActive ? 1 : 0} pointerEvents=${isActive ? "auto" : "none"} direction=${direction}`
            )
        })
        let outerRaf = 0
        let innerRaf = 0
        outerRaf = requestAnimationFrame(() => {
            innerRaf = requestAnimationFrame(() => {
                if (!w.__BE_STEP_DEBUG__) return
                let mismatch = false
                activeSteps.forEach((_, idx) => {
                    const el = document.querySelector(
                        `[data-step-index="${idx}"]`
                    ) as HTMLElement | null
                    if (!el) {
                        console.warn(`[BE Diagnostic] missing DOM for step ${idx}`)
                        return
                    }
                    const cs = getComputedStyle(el)
                    const expectedOpacity = idx === safeCurrentIndex ? "1" : "0"
                    const expectedPosition = idx === safeCurrentIndex ? "relative" : "absolute"
                    const expectedPointer = idx === safeCurrentIndex ? "auto" : "none"
                    const ok =
                        cs.opacity === expectedOpacity &&
                        cs.position === expectedPosition &&
                        cs.pointerEvents === expectedPointer
                    console.debug(
                        `[BE Diagnostic] DOM step=${idx} computed position=${cs.position} opacity=${cs.opacity} pointerEvents=${cs.pointerEvents} expected ${expectedPosition}/${expectedOpacity}/${expectedPointer} ${ok ? "OK" : "MISMATCH"}`
                    )
                    if (!ok) {
                        mismatch = true
                        console.error(
                            `[BE Diagnostic] MISMATCH step=${idx} active=${safeCurrentIndex} expected opacity ${expectedOpacity} got ${cs.opacity} — deterministic invariant violated`
                        )
                    }
                })
                if (!mismatch) {
                    console.debug(`[BE Diagnostic] invariant OK for active=${safeCurrentIndex}`)
                }
            })
        })
        return () => {
            cancelAnimationFrame(outerRaf)
            cancelAnimationFrame(innerRaf)
        }
    }, [safeCurrentIndex, activeSteps, totalActive])

    const prevNavDirectionRef = React.useRef<number>(safeCurrentIndex)
    const navDirection =
        safeCurrentIndex > prevNavDirectionRef.current
            ? 1
            : safeCurrentIndex < prevNavDirectionRef.current
              ? -1
              : 0
    React.useEffect(() => {
        prevNavDirectionRef.current = safeCurrentIndex
    }, [safeCurrentIndex])
    const measureActiveStepHeight = React.useCallback(() => {
        const form = formRef.current
        if (!form || typeof window === "undefined") return
        const active = form.querySelector<HTMLElement>(`[data-step-index="${safeCurrentIndex}"]`)
        const h = active ? active.offsetHeight : 0
        const next = Math.max(h, FORM_CONTENT_MIN_HEIGHT)
        setFormHeight((prev) => (prev === next ? prev : next))
    }, [safeCurrentIndex])
    useIsomorphicLayoutEffect(() => {
        // Canvas favors natural fit over animation: the Framer frame sizes the
        // instance from content height, and an explicit pixel height fights it
        // (new fields clip under a stale frame). Published site keeps animating.
        if (isCanvas) {
            setFormHeight(null)
            return
        }
        measureActiveStepHeight()
        if (typeof window === "undefined" || typeof ResizeObserver === "undefined") return
        const active = formRef.current?.querySelector<HTMLElement>(
            `[data-step-index="${safeCurrentIndex}"]`
        )
        if (!active) return
        const observer = new ResizeObserver(() => measureActiveStepHeight())
        observer.observe(active)
        return () => observer.disconnect()
    }, [measureActiveStepHeight, safeCurrentIndex, isCanvas])

    if (totalActive === 0) {
        if (!isCanvas) return null
        return (
            <RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
                <output
                    aria-live="polite"
                    aria-atomic="true"
                    style={{
                        display: "block",
                        padding: 24,
                        color: theme.textPrimaryColor,
                        fontSize: 14,
                        lineHeight: 1.5,
                        borderRadius: theme.borderRadius,
                        border: `1px solid ${withAlpha(theme.errorColor, 0.3)}`,
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
                        Enable at least one step in the Steps property to display the booking flow.
                    </div>
                </output>
            </RootShell>
        )
    }

    if (flowStatus === "success") {
        return (
            <RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
                <SuccessScreen
                    steps={activeSteps}
                    values={values}
                    bookingResult={bookingResult}
                    accentColor={theme.accentColor}
                    accentForegroundColor={theme.accentForegroundColor}
                    textPrimaryColor={theme.textPrimaryColor}
                    textSecondaryColor={theme.textSecondaryColor}
                    surfaceColor={theme.surfaceColor}
                    borderColor={theme.borderColor}
                    successColor={theme.successColor}
                    borderRadius={borderRadius}
                    onRestart={handleRestart}
                    successTitle={copy.successTitle}
                    successSubtitle={copy.successSubtitle}
                    headingFont={headingFont}
                    terminalAlignment={terminalAlignment}
                    bodySubtitleSize={bodySubtitleSize}
                    bodySubtitleLineHeight={bodySubtitleLineHeight}
                    addToCalendarLabel={addToCalendarButtonLabel}
                    bookAnotherLabel={bookAnotherLabel}
                    actionJustify={terminalActionJustify}
                    bookAnotherStyle={bookAnotherButtonStyle}
                    rescheduleLinkStyle={rescheduleLinkButtonStyle}
                    calendarLinkSet={calendarLinkSharedSet}
                    addToCalendarHover={addToCalendarButtonGroup?.hover}
                    addToCalendarPressed={addToCalendarButtonGroup?.pressed}
                    bookAnotherHover={bookAnotherButtonGroup?.hover}
                    bookAnotherPressed={bookAnotherButtonGroup?.pressed}
                    animateInteractions={animateIx}
                    timeZone={timeZone}
                    eventTitle={calEventMeta?.title}
                    eventLocation={calEventMeta?.locationLabel}
                    rescheduleOrCancelLabel={copy.rescheduleOrCancelLabel}
                    meetingDurationMs={meetingDurationMs}
                    transitionVariant={resolvedTransitionVariant}
                    baseTransition={stepTransition}
                />
            </RootShell>
        )
    }
    if (flowStatus === "error") {
        return (
            <RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
                <ErrorScreen
                    message={submitError || copy.errorFallbackMessage}
                    errorColor={theme.errorColor}
                    textPrimaryColor={theme.textPrimaryColor}
                    textSecondaryColor={theme.textSecondaryColor}
                    borderRadius={borderRadius}
                    onRetry={handleRetry}
                    errorTitle={copy.errorTitle}
                    errorSubtitle={copy.errorSubtitle}
                    headingFont={headingFont}
                    terminalAlignment={terminalAlignment}
                    bodySubtitleSize={bodySubtitleSize}
                    bodySubtitleLineHeight={bodySubtitleLineHeight}
                    retryLabel={retryLabel}
                    retryStyle={retryButtonStyle}
                    retryHover={retryButtonGroup?.hover}
                    retryPressed={retryButtonGroup?.pressed}
                    retryAnimate={animateIx}
                    actionJustify={terminalActionJustify}
                />
            </RootShell>
        )
    }
    const backButtonEl = !isFirst ? (
        <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            {...backIx.bind}
            style={{
                minHeight: BUTTON_MIN_HEIGHT,
                ...applyButtonInteraction(
                    backButtonStyle,
                    // Ghost default hover (author Hover wins when opened): the transparent
                    // base border takes the border token and muted text goes solid.
                    (backButtonGroup?.hover ?? {
                        textColor: theme.textPrimaryColor,
                        border: {
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: theme.borderColor,
                        },
                    }) as ButtonInteractionState,
                    backButtonGroup?.pressed,
                    backIx,
                    animateIx
                ),
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.5 : 1,
                ...(navFill ? { flex: "1 1 0", minWidth: 0 } : {}),
            }}
        >
            {backLabel}
        </button>
    ) : null
    const primaryGroupEl = (
        <div
            style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "flex-end",
                ...(navFill ? { flex: "1 1 0", minWidth: 0 } : {}),
            }}
        >
            <button
                form={reactInstanceId ? `be-booking-form-${reactInstanceId}` : "be-booking-form"}
                type="submit"
                disabled={isSubmitting}
                ref={submitButtonRef}
                {...primaryIx.bind}
                aria-busy={isSubmitting ? true : undefined}
                style={{
                    minHeight: BUTTON_MIN_HEIGHT,
                    ...applyButtonInteraction(
                        primaryButtonStyle,
                        primaryGroup?.hover,
                        primaryGroup?.pressed,
                        primaryIx,
                        animateIx
                    ),
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    ...(navFill ? { flex: "1 1 0", minWidth: 0 } : {}),
                }}
            >
                {isSubmitting ? (
                    <>
                        <span
                            aria-hidden="true"
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                border: `2px solid ${primaryButtonStyle.color}`,
                                borderTopColor: "transparent",
                                display: "inline-block",
                                animation: prefersReducedMotion
                                    ? "none"
                                    : "be-spin 0.8s linear infinite",
                            }}
                        />
                        {DEFAULT_COPY_BOOKING_LABEL}
                    </>
                ) : (
                    <span style={{ display: "grid" }}>
                        <AnimatePresence initial={false}>
                            <motion.span
                                key={primaryLabel}
                                initial="inactive"
                                animate="active"
                                exit="inactive"
                                variants={
                                    TRANSITION_VARIANT_DEFS[resolvedTransitionVariant].variants
                                }
                                transition={footerLabelTransition}
                                custom={
                                    TRANSITION_VARIANT_DEFS[resolvedTransitionVariant].useDirection
                                        ? navDirection
                                        : undefined
                                }
                                style={{
                                    gridArea: "1 / 1",
                                    display: "inline-block",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {primaryLabel}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                )}
            </button>
        </div>
    )
    return (
        <RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
            {/* SEGMENTED-MOTION (BE-090): tree-wide thumb motion prefs. */}
            <SegmentedMotionContext.Provider value={segmentedMotion}>
            <output
                aria-live="polite"
                aria-atomic="true"
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
                {stepAnnouncement}
            </output>
            {isCanvas && needsCalSetup ? (
                <output
                    aria-live="polite"
                    aria-atomic="true"
                    style={{
                        display: "block",
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
                    <strong style={{ color: theme.accentColor }}>Connect Cal.com</strong> to enable
                    real availability and booking submission. Add your API key and Event Type ID in
                    the properties panel. Until then, the date/time step shows a demo grid and the
                    final "Book Now" button will skip the network call.
                </output>
            ) : null}

            {/* Canvas-only guardrail for missing name/email fields. */}
            {isCanvas && needsNameEmailGuardrail ? (
                <output
                    aria-live="polite"
                    aria-atomic="true"
                    style={{
                        display: "block",
                        padding: "10px 14px",
                        marginBottom: 12,
                        borderRadius: borderRadius,
                        background: withAlpha(theme.errorColor, 0.1),
                        border: `1px solid ${withAlpha(theme.errorColor, 0.3)}`,
                        color: theme.errorColor,
                        fontSize: 12,
                        lineHeight: 1.4,
                    }}
                >
                    Cal.com requires a name and email field somewhere in this flow. Add a required
                    text field (and tick "Name") and an email-typed field to enable booking
                    submission.
                </output>
            ) : null}

            {/* Canvas-only warnings for empty steps / empty choice options. */}
            {isCanvas && emptyStepWarnings.length > 0
                ? emptyStepWarnings.map((msg) => (
                      <output
                          key={msg}
                          aria-live="polite"
                          aria-atomic="true"
                          style={{
                              display: "block",
                              padding: "10px 14px",
                              marginBottom: 8,
                              borderRadius: borderRadius,
                              background: withAlpha(theme.errorColor, 0.1),
                              border: `1px solid ${withAlpha(theme.errorColor, 0.3)}`,
                              color: theme.errorColor,
                              fontSize: 12,
                              lineHeight: 1.4,
                          }}
                      >
                          {msg}
                      </output>
                  ))
                : null}

            {totalActive > 1 && (progressVisible || progressShowTextContent) ? (
                <div style={{ marginBottom: sectionSpacing.progress }}>
                    {progressShowTextContent && stepCountPosition === "top" ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                rowGap: 2,
                                marginBottom: progressVisible ? 8 : 0,
                                color: theme.textSecondaryColor,
                                fontSize: 12,
                                fontWeight: 500,
                                letterSpacing: 0.2,
                            }}
                            aria-hidden="true"
                        >
                            <span>{counterText}</span>
                            <span>
                                {copy.stepProgressLabel.replace("{pct}", String(completePct))}
                            </span>
                        </div>
                    ) : null}
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
                            aria-valuetext={`${completePct}%`}
                            aria-label={ariaLabels.bookingProgress}
                        >
                            {Array.from({ length: totalActive }).map((_, i) => (
                                <div
                                    key={i}
                                    aria-hidden="true"
                                    style={{
                                        flex: 1,
                                        height: PROGRESS_BAR_HEIGHT,
                                        borderRadius: sanitizedRadius,
                                        background:
                                            i <= safeCurrentIndex
                                                ? theme.accentColor
                                                : theme.surfaceColor,
                                        transition: prefersReducedMotion
                                            ? "none"
                                            : "background-color 0.25s ease",
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
                                borderRadius: sanitizedRadius,
                                overflow: "hidden",
                            }}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={completePct}
                            aria-valuetext={`${completePct}%`}
                            aria-label={ariaLabels.bookingProgress}
                        >
                            {isStaticRender ? (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        background: theme.accentColor,
                                        borderRadius: sanitizedRadius,
                                        transform: `scaleX(${progressPct / 100})`,
                                        transformOrigin: "left center",
                                    }}
                                    aria-hidden="true"
                                />
                            ) : (
                                <motion.div
                                    initial={false}
                                    animate={progressAnimate}
                                    transition={
                                        prefersReducedMotion
                                            ? INSTANT_TRANSITION
                                            : PROGRESS_BAR_TRANSITION
                                    }
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        background: theme.accentColor,
                                        borderRadius: sanitizedRadius,
                                        transformOrigin: "left center",
                                    }}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    ) : null}
                    {progressShowTextContent && stepCountPosition === "bottom" ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                rowGap: 2,
                                marginTop: progressVisible ? 8 : 0,
                                color: theme.textSecondaryColor,
                                fontSize: 12,
                                fontWeight: 500,
                                letterSpacing: 0.2,
                            }}
                            aria-hidden="true"
                        >
                            <span>{counterText}</span>
                            <span>
                                {copy.stepProgressLabel.replace("{pct}", String(completePct))}
                            </span>
                        </div>
                    ) : null}
                </div>
            ) : null}

            <motion.form
                aria-label={ariaLabels.bookingForm}
                id={reactInstanceId ? `be-booking-form-${reactInstanceId}` : "be-booking-form"}
                noValidate
                className="be-form-scope"
                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault()
                    handleContinue()
                }}
                ref={formRef}
                initial={false}
                animate={{ height: formHeight ?? "auto" }}
                transition={stepTransition}
                style={{
                    position: "relative",
                    minHeight: FORM_CONTENT_MIN_HEIGHT,
                    // SHADOW-CLIP (BE-026): paint-only clip with a
                    // 24px outer margin — field shadows render whole
                    // while transitioning steps stay bounded.
                    clipPath: "inset(-24px)",
                }}
            >
                {activeSteps.map((step, idx) => {
                    const isActive = idx === safeCurrentIndex
                    return (
                        <StepVisibilityWrapper
                            key={step.id}
                            isActive={isActive}
                            stepIndex={idx}
                            activeIndex={safeCurrentIndex}
                            baseTransition={stepTransition}
                            variant={resolvedTransitionVariant}
                            direction={navDirection}
                        >
                            <BeErrorBoundary stepKey={step.id}>
                                {step.showHeader === false ? null : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 4,
                                            marginBottom: sectionSpacing.heading,
                                        }}
                                    >
                                        <h2
                                            ref={isActive ? stepTitleRef : null}
                                            tabIndex={-1}
                                            className="be-focus-target"
                                            style={{
                                                color: theme.textPrimaryColor,
                                                ...(isStepAlignment(step.alignment)
                                                    ? { textAlign: step.alignment }
                                                    : { textAlign: terminalAlignment }),
                                                fontFamily: headingFont?.fontFamily ?? "inherit",
                                                fontSize:
                                                    fontPixelSize(headingFont?.fontSize) ?? 22,
                                                fontWeight: headingFont?.fontWeight ?? 700,
                                                ...(headingFont?.fontStyle
                                                    ? { fontStyle: headingFont.fontStyle }
                                                    : {}),
                                                ...(headingFont?.letterSpacing != null
                                                    ? { letterSpacing: headingFont.letterSpacing }
                                                    : {}),
                                                ...(headingFont?.lineHeight != null
                                                    ? { lineHeight: headingFont.lineHeight }
                                                    : { lineHeight: 1.2 }),
                                                marginBottom: 0,
                                                marginTop: 0,
                                                scrollMarginTop: 72,
                                            }}
                                        >
                                            {step.title}
                                        </h2>
                                        {step.subtitle ? (
                                            <div
                                                style={{
                                                    color: theme.textSecondaryColor,
                                                    fontSize: bodySubtitleSize,
                                                    marginBottom: 0,
                                                    lineHeight: bodySubtitleLineHeight,
                                                    ...(isStepAlignment(step.alignment)
                                                        ? { textAlign: step.alignment }
                                                        : { textAlign: terminalAlignment }),
                                                }}
                                            >
                                                {step.subtitle}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                                <StepBody
                                    step={step}
                                    steps={activeSteps}
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    theme={theme}
                                    borderRadius={sanitizedRadius}
                                    slotSelectedSurface={slotPrimarySurface}
                                    slotSelectedText={slotPrimaryText}
                                    fieldGap={fieldGap}
                                    globalFieldStyles={globalFieldStyles}
                                    hasCalConfig={hasCalConfig}
                                    slotsLoading={slotsLoading}
                                    availabilitySettled={availabilitySettled}
                                    slotsError={slotsError}
                                    slotsForSelectedDate={slotsForSelectedDate}
                                    availableDates={availableDates}
                                    selectedDate={selectedDate}
                                    visibleMonth={visibleMonth}
                                    timeZone={timeZone}
                                    timeFormat={timeFormat}
                                    calendarSurface={calendarStageConfig.surface}
                                    copy={copy}
                                    ariaLabels={ariaLabels}
                                    errorCopy={errorCopy}
                                    instanceId={reactInstanceId}
                                    onFieldChange={handleFieldChange}
                                    onSlotReady={handleSlotReady}
                                    onDateChange={handleInlineDateChange}
                                    onMonthChange={handleInlineMonthChange}
                                    onTimeFormatChange={handleTimeFormatChange}
                                    onJumpToStep={handleJumpToStep}
                                    onRetrySlots={slotsRefetch}
                                    retryLabel={retryLabel}
                                    hideDemoWhenUnconfigured={!isCanvas && needsCalSetup}
                                    isSubmitting={isSubmitting}
                                    eventMeta={calEventMeta}
                                    eventMetaStatus={calEventMetaStatus}
                                    eventMetaFallbackDurationMinutes={Math.round(
                                        meetingDurationMs / 60000
                                    )}
                                />
                            </BeErrorBoundary>
                        </StepVisibilityWrapper>
                    )
                })}
            </motion.form>

            {/* Footer nav (BE-078): marginTop owns fields-to-nav distance
            (36 default); sticky + safe-area bottom pin the row. */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginTop: sectionSpacing.footer,
                    alignItems: "center",
                    justifyContent: navJustify,
                    flexWrap: "wrap",
                    position: "sticky",
                    bottom: 0,
                    zIndex: 10,
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }}
            >
                {primaryFirst ? (
                    <>
                        {primaryGroupEl}
                        {backButtonEl}
                    </>
                ) : (
                    <>
                        {backButtonEl}
                        {primaryGroupEl}
                    </>
                )}
            </div>

            <style suppressHydrationWarning>{`
.be-input { outline: none; }

.be-input:focus-visible {
    box-shadow: inset 0 0 0 2px var(--be-focus-color, ${theme.accentColor});
}
.be-input.be-input-invalid:focus-visible {
    box-shadow: inset 0 0 0 2px ${theme.errorColor};
}

.be-motion-root.be-pointer-active .be-input:focus-visible {
    box-shadow: none;
}
.be-motion-root.be-pointer-active .be-input.be-input-invalid:focus-visible {
    box-shadow: none;
}

.be-input[style*="--be-ph-color"]::placeholder {
    color: var(--be-ph-color);
}
.be-input[style*="--be-ph-color"]::-webkit-input-placeholder {
    color: var(--be-ph-color);
}

.be-motion-root :is(button, a):focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

.be-scrollbar-none::-webkit-scrollbar { display: none; }

.be-motion-root :is(button, a, [role="button"], [role="radio"], [role="checkbox"], select) {
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
}

.be-motion-root input::placeholder,
.be-motion-root textarea::placeholder {
    color: ${withAlpha(theme.textPrimaryColor, 0.6, theme.surfaceColor)};
    opacity: 1;
}
`}</style>
            </SegmentedMotionContext.Provider>
        </RootShell>
    )
}

function useStateGuarded(
    initial: number,
    max: number
): [number, (next: number | ((prev: number) => number)) => void] {
    const [state, setState] = React.useState<number>(() =>
        max > 0 ? Math.min(initial, max - 1) : 0
    )
    const maxRef = React.useRef(max)
    React.useEffect(() => {
        maxRef.current = max
    }, [max])
    React.useEffect(() => {
        const ceiling = maxRef.current
        if (ceiling > 0 && state >= ceiling) {
            setState(Math.max(0, ceiling - 1))
        }
    }, [state, max])
    const setter = React.useCallback((next: number | ((prev: number) => number)) => {
        setState((prev) => {
            const resolved =
                typeof next === "function" ? (next as (p: number) => number)(prev) : next
            const ceiling = maxRef.current
            if (ceiling > 0) return Math.max(0, Math.min(resolved, ceiling - 1))
            return 0
        })
    }, [])
    return [state, setter]
}

const RootShell = React.memo(function RootShell(props: {
    style?: React.CSSProperties
    fontStack: React.CSSProperties
    children?: React.ReactNode
    rootRef?: React.Ref<HTMLDivElement>
}) {
    const [pointerActive, setPointerActive] = React.useState(false)
    React.useEffect(() => {
        const root = shellRef.current
        if (!root) return
        const onPointerDown = () => setPointerActive(true)
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab" || e.key?.startsWith("Arrow")) {
                setPointerActive(false)
            }
        }
        root.addEventListener("pointerdown", onPointerDown, true)
        root.addEventListener("keydown", onKeyDown, true)
        return () => {
            root.removeEventListener("pointerdown", onPointerDown, true)
            root.removeEventListener("keydown", onKeyDown, true)
        }
    }, [])

    const shellRef = React.useRef<HTMLDivElement | null>(null)
    const setRootRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            shellRef.current = node
            if (typeof props.rootRef === "function") {
                props.rootRef(node)
            } else if (props.rootRef) {
                ;(props.rootRef as { current: HTMLDivElement | null }).current = node
            }
        },
        [props.rootRef]
    )

    return (
        <MotionConfig reducedMotion="user">
            <div
                className={pointerActive ? "be-motion-root be-pointer-active" : "be-motion-root"}
                ref={setRootRef}
                data-be-engine-root=""
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
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
            <style suppressHydrationWarning>{`
@media (prefers-reduced-motion: reduce) {
    .be-motion-root, .be-motion-root * {
        animation-duration: 0.001s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001s !important;
    }
}

.be-dt-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.be-dt-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }

.be-select-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.be-select-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }
/* PHONE-GROUP (BE-108): focus ring around the whole joined box, colored by
 * the inline --be-group-ring var (error-aware). Same pointer-active
 * convention as .be-input: mouse focus stays ring-free. */
.be-phone-group:focus-within { box-shadow: inset 0 0 0 2px var(--be-group-ring); }
.be-motion-root.be-pointer-active .be-phone-group:focus-within { box-shadow: none; }
/* FIELD-GRID (BE-102): the step field grid is container-responsive — the form
 * is the query container, so columns follow the embed width with no JS
 * measurement pass (the old measured-width state painted single-column first
 * and snapped: the reported rows flash). 768px mirrors COMPACT_BREAKPOINT.
 * Markup is width-independent (data-two-col derives from field config), so
 * server, prerender, and first client paint are byte-identical. */
.be-form-scope { container-type: inline-size; }
.be-form-grid { grid-template-columns: 1fr; }
@container (min-width: 768px) {
    .be-form-grid[data-two-col="true"] { grid-template-columns: 1fr 1fr; }
}
.be-skeleton { animation: be-skeleton-pulse 1.6s ease-in-out infinite; }
@keyframes be-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
@media (prefers-reduced-motion: reduce) { .be-skeleton { animation: none; } }
@keyframes be-spin { to { transform: rotate(360deg); } }
`}</style>
        </MotionConfig>
    )
})

interface StepBodyProps {
    step: NormalizedStep
    steps: NormalizedStep[]
    values: BookingValues
    errors: Record<string, string | null>
    touched: Record<string, boolean>
    theme: Theme
    borderRadius: string | number
    slotSelectedSurface?: string
    slotSelectedText?: string
    fieldGap: number
    globalFieldStyles?: FieldStyleOverrides
    hasCalConfig: boolean
    slotsLoading: boolean
    availabilitySettled?: boolean
    slotsError: string | null
    slotsForSelectedDate: Array<{
        value: string
        label: string
        end?: string
        minutes: number
    }>
    availableDates: Set<string> | undefined
    selectedDate: Date | null
    visibleMonth: Date | null
    timeZone: string
    timeFormat: "12h" | "24h"
    hideDemoWhenUnconfigured: boolean
    calendarSurface?: FieldStyleOverrides
    copy: BookingEngineProps["copy"]
    ariaLabels: typeof DEFAULT_ARIA_LABELS
    errorCopy: ErrorCopy
    instanceId: string
    onFieldChange: (fieldId: string, value: string | boolean | Array<string> | undefined) => void
    onSlotReady: (payload?: BookingPayload) => void
    onDateChange: (d: Date) => void
    onMonthChange: (m: Date) => void
    onTimeFormatChange: (fmt: "12h" | "24h") => void
    /** T10-H1 fix: review-step Edit links jump back to a given step. */
    onJumpToStep: (stepIndex: number) => void
    /** T10-M8 fix: re-fetch availability from the error banner. */
    onRetrySlots: () => void
    /** ERROR-RETRY-BUTTON: resolved Retry label (Buttons group, legacy
     *  Copy fallback) so the slots inline-retry matches the error screen. */
    retryLabel: string
    isSubmitting?: boolean
    eventMeta?: CalEventMeta | null
    eventMetaStatus?: CalEventMetaStatus
    eventMetaFallbackDurationMinutes?: number
}

const STEP_BODY_FLOW_MAPS = ["values", "errors", "touched"] as const

function areStepBodyPropsEqual(prev: StepBodyProps, next: StepBodyProps): boolean {
    if (prev.step !== next.step) return false

    const isReviewStep = (prev.step.stepType as string) === "review"
    const ownKeys: string[] = prev.step.fields.map((field) => field.id)
    if (prev.step.stepType === "datetime") ownKeys.push(SELECTED_SLOT_KEY)

    for (const key of Object.keys(prev) as Array<keyof StepBodyProps & string>) {
        if ((STEP_BODY_FLOW_MAPS as readonly string[]).includes(key)) continue
        if (key === "step") continue
        if (prev[key] !== next[key]) return false
    }

    if (isReviewStep) {
        return (
            prev.values === next.values &&
            prev.errors === next.errors &&
            prev.touched === next.touched
        )
    }
    for (const mapKey of STEP_BODY_FLOW_MAPS) {
        const p = prev[mapKey] as Record<string, unknown>
        const n = next[mapKey] as Record<string, unknown>
        for (const k of ownKeys) {
            if (p[k] !== n[k]) return false
        }
    }
    return true
}

const StepBody = React.memo(function StepBody(props: StepBodyProps) {
    const {
        step,
        values,
        errors,
        touched,
        theme,
        borderRadius,
        slotSelectedSurface,
        slotSelectedText,
        fieldGap,
        globalFieldStyles,
        hasCalConfig,
        slotsLoading,
        slotsError,
        slotsForSelectedDate,
        availableDates,
        availabilitySettled,
        selectedDate,
        visibleMonth,
        timeZone,
        timeFormat,
        copy,
        ariaLabels,
        onFieldChange,
        onSlotReady,
        onDateChange,
        onMonthChange,
        onTimeFormatChange,
        onRetrySlots,
        retryLabel,
        hideDemoWhenUnconfigured,
        calendarSurface,
        errorCopy,
        instanceId = "",
        isSubmitting = false,
        eventMeta,
        eventMetaStatus,
        eventMetaFallbackDurationMinutes,
    } = props

    const slotErrorId = `${instanceId ? `${instanceId}-` : ""}be-slot-error`

    const slotErrorBannerRef = React.useRef<HTMLDivElement | null>(null)
    const prevSlotErrorRef = React.useRef<string | null>(null)
    React.useEffect(() => {
        const err =
            touched[SELECTED_SLOT_KEY] && errors[SELECTED_SLOT_KEY]
                ? errors[SELECTED_SLOT_KEY]
                : null
        const prev = prevSlotErrorRef.current
        prevSlotErrorRef.current = err
        if (err && !prev && slotErrorBannerRef.current) {
            slotErrorBannerRef.current.focus()
        }
    }, [touched, errors])

    const renderFormFields = () => {
        // BE-082/BE-102: the grid derives from field widths - any Half field
        // marks the step two-column; the column switch itself lives in CSS
        // (.be-form-grid + container query), so the first paint is already
        // correct and never snaps.
        return (
            <div
                style={{
                    display: "grid",
                    gap: fieldGap,
                }}
                className={`be-form-grid`}
                data-two-col={step.fields.some((field) => field.width === "half") || undefined}
            >
                {step.fields.map((field) => (
                    <FieldRenderer
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        error={touched[field.id] ? errors[field.id] : null}
                        theme={theme}
                        borderRadius={borderRadius}
                        onFieldChange={onFieldChange}
                        choiceGroupAriaLabel={ariaLabels.choiceGroup}
                        isSubmitting={isSubmitting}
                        instanceId={instanceId}
                        globalFieldStyles={globalFieldStyles}
                    />
                ))}
            </div>
        )
    }

    if (step.stepType === "datetime") {
        const slotError =
            touched[SELECTED_SLOT_KEY] && errors[SELECTED_SLOT_KEY]
                ? errors[SELECTED_SLOT_KEY]
                : null

        const calendarBlock = (
            <div style={{ gridColumn: "1 / -1" }}>
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
                        <span style={{ flex: "1 1 0", minWidth: 0 }}>{slotsError}</span>
                        <button
                            type="button"
                            onClick={onRetrySlots}
                            style={{
                                minHeight: BUTTON_MIN_HEIGHT,
                                padding: "6px 14px",
                                borderRadius: borderRadius,
                                border: `1px solid ${theme.errorColor}`,
                                background: "transparent",
                                color: theme.errorColor,
                                fontFamily: "inherit",
                                fontSize: 12,
                                fontWeight: 400,
                                cursor: "pointer",
                                flexShrink: 0,
                            }}
                        >
                            {retryLabel}
                        </button>
                    </div>
                ) : null}
                {hasCalConfig &&
                !slotsLoading &&
                !slotsError &&
                slotsForSelectedDate.length === 0 &&
                selectedDate ? (
                    <output
                        style={{
                            display: "block",
                            padding: "10px 14px",
                            marginBottom: 12,
                            borderRadius: borderRadius,
                            background: withAlpha(theme.textSecondaryColor, 0.08),
                            color: theme.textSecondaryColor,
                            fontSize: 12,
                        }}
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {DEFAULT_COPY_NO_TIMES_LABEL}
                    </output>
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
                    {hideDemoWhenUnconfigured ? (
                        <output
                            aria-live="polite"
                            aria-atomic="true"
                            style={{
                                display: "block",
                                padding: "14px 16px",
                                margin: "4px 0",
                                borderRadius: borderRadius,
                                background: withAlpha(theme.textSecondaryColor, 0.08),
                                border: `1px solid ${withAlpha(theme.borderColor, 0.6)}`,
                                color: theme.textPrimaryColor,
                                fontSize: 14,
                                lineHeight: 1.5,
                            }}
                        >
                            <strong>{errorCopy.unavailableTitle}</strong>
                            <div style={{ marginTop: 4 }}>
                                <span style={{ color: theme.textSecondaryColor }}>
                                    {errorCopy.unavailableBody}
                                </span>
                            </div>
                        </output>
                    ) : (
                        <DateAndTimeInline
                            instanceId={instanceId}
                            accentColor={theme.accentColor}
                            accentForegroundColor={theme.accentForegroundColor}
                            slotSelectedSurface={slotSelectedSurface}
                            slotSelectedText={slotSelectedText}
                            calendarStyles={calendarSurface}
                            textColor={theme.textPrimaryColor}
                            borderColor={theme.borderColor}
                            radius={borderRadius}
                            startTime={DEFAULT_DEMO_START_TIME}
                            endTime={DEFAULT_DEMO_END_TIME}
                            interval={DEFAULT_DEMO_INTERVAL}
                            timeFormat={timeFormat}
                            initialDate={selectedDate}
                            initialTime={
                                values[SELECTED_SLOT_KEY] ? values[SELECTED_SLOT_KEY].time24h : null
                            }
                            initialVisibleMonth={visibleMonth}
                            availableTimes={hasCalConfig ? slotsForSelectedDate : undefined}
                            availableDates={availableDates}
                            slotsLoading={slotsLoading}
                            availabilitySettled={availabilitySettled}
                            loadingLabel={DEFAULT_COPY_LOADING_LABEL}
                            onSelectionReady={onSlotReady}
                            onDateChange={onDateChange}
                            onMonthChange={onMonthChange}
                            onTimeFormatChange={onTimeFormatChange}
                            timeZone={timeZone}
                            showTimesWithoutDate
                            pickDateToSeeTimesLabel={DEFAULT_COPY_PICK_DATE_TO_SEE_TIMES_LABEL}
                            noTimesFallbackLabel={DEFAULT_COPY_NO_TIMES_FALLBACK_LABEL}
                            timeSlotsAriaLabel={ariaLabels.timeSlots}
                            availableTimesAriaLabel={ariaLabels.availableTimes}
                            datePickerAriaLabel={ariaLabels.datePicker}
                            required
                            amLabel={DEFAULT_COPY_AM_LABEL}
                            pmLabel={DEFAULT_COPY_PM_LABEL}
                            previousMonthAriaTemplate={ariaLabels.previousMonthTemplate}
                            nextMonthAriaTemplate={ariaLabels.nextMonthTemplate}
                            slotError={slotError}
                            slotErrorId={slotErrorId}
                            eventMeta={eventMeta}
                            eventMetaStatus={eventMetaStatus}
                            eventMetaFallbackDurationMinutes={eventMetaFallbackDurationMinutes}
                            calEventMetaUnavailableCopy={copy.calEventMetaUnavailableCopy}
                            hourSuffix={DEFAULT_COPY_HOUR_SUFFIX}
                            minuteSuffix={DEFAULT_COPY_MINUTE_SUFFIX}
                        />
                    )}
                </div>
                {slotError ? (
                    <div
                        ref={slotErrorBannerRef}
                        id={slotErrorId}
                        tabIndex={-1}
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
            </div>
        )

        return (
            <div
                style={{
                    display: "grid",
                    gap: fieldGap,
                }}
                className={`be-form-grid`}
                data-two-col={step.fields.some((field) => field.width === "half") || undefined}
            >
                {calendarBlock}
                {step.fields
                    .filter((field) => field.fieldType !== "calendar-widget")
                    .map((field) => (
                        <FieldRenderer
                            key={field.id}
                            field={field}
                            value={values[field.id]}
                            error={touched[field.id] ? errors[field.id] : null}
                            theme={theme}
                            borderRadius={borderRadius}
                            onFieldChange={onFieldChange}
                            choiceGroupAriaLabel={ariaLabels.choiceGroup}
                            isSubmitting={isSubmitting}
                            instanceId={instanceId}
                            globalFieldStyles={globalFieldStyles}
                        />
                    ))}
            </div>
        )
    }

    return renderFormFields()
}, areStepBodyPropsEqual)

// PHONE-COUNTRY (BE-063): [ISO-3166, English name, ITU dial code]. The dial
// code owns the "+" prefix; the stored value is always full-international.
type PhoneCountryTuple = [iso: string, name: string, dial: string]
const PHONE_COUNTRIES: PhoneCountryTuple[] = [
    ["AF", "Afghanistan", "93"],
    ["AL", "Albania", "355"],
    ["DZ", "Algeria", "213"],
    ["AS", "American Samoa", "1684"],
    ["AD", "Andorra", "376"],
    ["AO", "Angola", "244"],
    ["AI", "Anguilla", "1264"],
    ["AG", "Antigua and Barbuda", "1268"],
    ["AR", "Argentina", "54"],
    ["AM", "Armenia", "374"],
    ["AW", "Aruba", "297"],
    ["AU", "Australia", "61"],
    ["AT", "Austria", "43"],
    ["AZ", "Azerbaijan", "994"],
    ["BS", "Bahamas", "1242"],
    ["BH", "Bahrain", "973"],
    ["BD", "Bangladesh", "880"],
    ["BB", "Barbados", "1246"],
    ["BY", "Belarus", "375"],
    ["BE", "Belgium", "32"],
    ["BZ", "Belize", "501"],
    ["BJ", "Benin", "229"],
    ["BM", "Bermuda", "1441"],
    ["BT", "Bhutan", "975"],
    ["BO", "Bolivia", "591"],
    ["BA", "Bosnia and Herzegovina", "387"],
    ["BW", "Botswana", "267"],
    ["BR", "Brazil", "55"],
    ["IO", "British Indian Ocean Territory", "246"],
    ["VG", "British Virgin Islands", "1284"],
    ["BN", "Brunei", "673"],
    ["BG", "Bulgaria", "359"],
    ["BF", "Burkina Faso", "226"],
    ["BI", "Burundi", "257"],
    ["KH", "Cambodia", "855"],
    ["CM", "Cameroon", "237"],
    ["CA", "Canada", "1"],
    ["CV", "Cape Verde", "238"],
    ["KY", "Cayman Islands", "1345"],
    ["CF", "Central African Republic", "236"],
    ["TD", "Chad", "235"],
    ["CL", "Chile", "56"],
    ["CN", "China", "86"],
    ["CX", "Christmas Island", "61"],
    ["CC", "Cocos Islands", "61"],
    ["CO", "Colombia", "57"],
    ["KM", "Comoros", "269"],
    ["CG", "Congo", "242"],
    ["CD", "Congo (DRC)", "243"],
    ["CK", "Cook Islands", "682"],
    ["CR", "Costa Rica", "506"],
    ["CI", "Côte d'Ivoire", "225"],
    ["HR", "Croatia", "385"],
    ["CU", "Cuba", "53"],
    ["CW", "Curaçao", "599"],
    ["CY", "Cyprus", "357"],
    ["CZ", "Czechia", "420"],
    ["DK", "Denmark", "45"],
    ["DJ", "Djibouti", "253"],
    ["DM", "Dominica", "1767"],
    ["DO", "Dominican Republic", "1809"],
    ["EC", "Ecuador", "593"],
    ["EG", "Egypt", "20"],
    ["SV", "El Salvador", "503"],
    ["GQ", "Equatorial Guinea", "240"],
    ["ER", "Eritrea", "291"],
    ["EE", "Estonia", "372"],
    ["SZ", "Eswatini", "268"],
    ["ET", "Ethiopia", "251"],
    ["FK", "Falkland Islands", "500"],
    ["FO", "Faroe Islands", "298"],
    ["FJ", "Fiji", "679"],
    ["FI", "Finland", "358"],
    ["FR", "France", "33"],
    ["GF", "French Guiana", "594"],
    ["PF", "French Polynesia", "689"],
    ["GA", "Gabon", "241"],
    ["GM", "Gambia", "220"],
    ["GE", "Georgia", "995"],
    ["DE", "Germany", "49"],
    ["GH", "Ghana", "233"],
    ["GI", "Gibraltar", "350"],
    ["GR", "Greece", "30"],
    ["GL", "Greenland", "299"],
    ["GD", "Grenada", "1473"],
    ["GP", "Guadeloupe", "590"],
    ["GU", "Guam", "1671"],
    ["GT", "Guatemala", "502"],
    ["GG", "Guernsey", "44"],
    ["GN", "Guinea", "224"],
    ["GW", "Guinea-Bissau", "245"],
    ["GY", "Guyana", "592"],
    ["HT", "Haiti", "509"],
    ["HN", "Honduras", "504"],
    ["HK", "Hong Kong", "852"],
    ["HU", "Hungary", "36"],
    ["IS", "Iceland", "354"],
    ["IN", "India", "91"],
    ["ID", "Indonesia", "62"],
    ["IR", "Iran", "98"],
    ["IQ", "Iraq", "964"],
    ["IE", "Ireland", "353"],
    ["IM", "Isle of Man", "44"],
    ["IL", "Israel", "972"],
    ["IT", "Italy", "39"],
    ["JM", "Jamaica", "1876"],
    ["JP", "Japan", "81"],
    ["JE", "Jersey", "44"],
    ["JO", "Jordan", "962"],
    ["KZ", "Kazakhstan", "7"],
    ["KE", "Kenya", "254"],
    ["KI", "Kiribati", "686"],
    ["XK", "Kosovo", "383"],
    ["KW", "Kuwait", "965"],
    ["KG", "Kyrgyzstan", "996"],
    ["LA", "Laos", "856"],
    ["LV", "Latvia", "371"],
    ["LB", "Lebanon", "961"],
    ["LS", "Lesotho", "266"],
    ["LR", "Liberia", "231"],
    ["LY", "Libya", "218"],
    ["LI", "Liechtenstein", "423"],
    ["LT", "Lithuania", "370"],
    ["LU", "Luxembourg", "352"],
    ["MO", "Macao", "853"],
    ["MG", "Madagascar", "261"],
    ["MW", "Malawi", "265"],
    ["MY", "Malaysia", "60"],
    ["MV", "Maldives", "960"],
    ["ML", "Mali", "223"],
    ["MT", "Malta", "356"],
    ["MH", "Marshall Islands", "692"],
    ["MQ", "Martinique", "596"],
    ["MR", "Mauritania", "222"],
    ["MU", "Mauritius", "230"],
    ["YT", "Mayotte", "262"],
    ["MX", "Mexico", "52"],
    ["FM", "Micronesia", "691"],
    ["MD", "Moldova", "373"],
    ["MC", "Monaco", "377"],
    ["MN", "Mongolia", "976"],
    ["ME", "Montenegro", "382"],
    ["MS", "Montserrat", "1664"],
    ["MA", "Morocco", "212"],
    ["MZ", "Mozambique", "258"],
    ["MM", "Myanmar", "95"],
    ["NA", "Namibia", "264"],
    ["NR", "Nauru", "674"],
    ["NP", "Nepal", "977"],
    ["NL", "Netherlands", "31"],
    ["NC", "New Caledonia", "687"],
    ["NZ", "New Zealand", "64"],
    ["NI", "Nicaragua", "505"],
    ["NE", "Niger", "227"],
    ["NG", "Nigeria", "234"],
    ["NU", "Niue", "683"],
    ["NF", "Norfolk Island", "672"],
    ["KP", "North Korea", "850"],
    ["MK", "North Macedonia", "389"],
    ["MP", "Northern Mariana Islands", "1670"],
    ["NO", "Norway", "47"],
    ["OM", "Oman", "968"],
    ["PK", "Pakistan", "92"],
    ["PW", "Palau", "680"],
    ["PS", "Palestine", "970"],
    ["PA", "Panama", "507"],
    ["PG", "Papua New Guinea", "675"],
    ["PY", "Paraguay", "595"],
    ["PE", "Peru", "51"],
    ["PH", "Philippines", "63"],
    ["PL", "Poland", "48"],
    ["PT", "Portugal", "351"],
    ["PR", "Puerto Rico", "1787"],
    ["QA", "Qatar", "974"],
    ["RE", "Réunion", "262"],
    ["RO", "Romania", "40"],
    ["RU", "Russia", "7"],
    ["RW", "Rwanda", "250"],
    ["BL", "Saint Barthélemy", "590"],
    ["SH", "Saint Helena", "290"],
    ["KN", "Saint Kitts and Nevis", "1869"],
    ["LC", "Saint Lucia", "1758"],
    ["MF", "Saint Martin", "590"],
    ["PM", "Saint Pierre and Miquelon", "508"],
    ["VC", "Saint Vincent and the Grenadines", "1784"],
    ["WS", "Samoa", "685"],
    ["SM", "San Marino", "378"],
    ["ST", "São Tomé and Príncipe", "239"],
    ["SA", "Saudi Arabia", "966"],
    ["SN", "Senegal", "221"],
    ["RS", "Serbia", "381"],
    ["SC", "Seychelles", "248"],
    ["SL", "Sierra Leone", "232"],
    ["SG", "Singapore", "65"],
    ["SX", "Sint Maarten", "1721"],
    ["SK", "Slovakia", "421"],
    ["SI", "Slovenia", "386"],
    ["SB", "Solomon Islands", "677"],
    ["SO", "Somalia", "252"],
    ["ZA", "South Africa", "27"],
    ["GS", "South Georgia", "500"],
    ["KR", "South Korea", "82"],
    ["SS", "South Sudan", "211"],
    ["ES", "Spain", "34"],
    ["LK", "Sri Lanka", "94"],
    ["SD", "Sudan", "249"],
    ["SR", "Suriname", "597"],
    ["SJ", "Svalbard", "47"],
    ["SE", "Sweden", "46"],
    ["CH", "Switzerland", "41"],
    ["SY", "Syria", "963"],
    ["TW", "Taiwan", "886"],
    ["TJ", "Tajikistan", "992"],
    ["TZ", "Tanzania", "255"],
    ["TH", "Thailand", "66"],
    ["TL", "Timor-Leste", "670"],
    ["TG", "Togo", "228"],
    ["TK", "Tokelau", "690"],
    ["TO", "Tonga", "676"],
    ["TT", "Trinidad and Tobago", "1868"],
    ["TN", "Tunisia", "216"],
    ["TR", "Türkiye", "90"],
    ["TM", "Turkmenistan", "993"],
    ["TC", "Turks and Caicos", "1649"],
    ["TV", "Tuvalu", "688"],
    ["VI", "US Virgin Islands", "1340"],
    ["UG", "Uganda", "256"],
    ["UA", "Ukraine", "380"],
    ["AE", "United Arab Emirates", "971"],
    ["GB", "United Kingdom", "44"],
    ["US", "United States", "1"],
    ["UY", "Uruguay", "598"],
    ["UZ", "Uzbekistan", "998"],
    ["VU", "Vanuatu", "678"],
    ["VA", "Vatican City", "379"],
    ["VE", "Venezuela", "58"],
    ["VN", "Vietnam", "84"],
    ["WF", "Wallis and Futuna", "681"],
    ["EH", "Western Sahara", "212"],
    ["YE", "Yemen", "967"],
    ["ZM", "Zambia", "260"],
    ["ZW", "Zimbabwe", "263"],
    ["AX", "Åland", "358"],
]
function phoneCountryByIso(iso: string): PhoneCountryTuple | undefined {
    const upper = (iso || "").toUpperCase()
    return PHONE_COUNTRIES.find((c) => c[0] === upper)
}
// BE-087: flags render as real images, not emoji — Windows has no flag-emoji
// font and shows the bare letter pair instead (the reported "DZ" box). Images
// come from the flagcdn CDN as SVG (BE-088 — vector, no retina set needed);
// offline/unknown iso fails closed to a fixed-size two-letter badge, so the
// slot geometry never shifts.
function PhoneFlag(props: { iso: string }) {
    const { iso } = props
    const [failed, setFailed] = React.useState(false)
    const upper = (iso || "").toUpperCase()
    const known = /^[A-Z]{2}$/.test(upper) && phoneCountryByIso(upper) !== undefined
    const showImg = known && !failed
    return (
        <span
            aria-hidden="true"
            style={{
                width: 22,
                height: 16,
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(128, 128, 128, 0.18)",
                flexShrink: 0,
            }}
        >
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1 }}>
                {upper.slice(0, 2)}
            </span>
            {showImg ? (
                <img
                    src={`https://flagcdn.com/${upper.toLowerCase()}.svg`}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    onError={() => setFailed(true)}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            ) : null}
        </span>
    )
}
// BE-063: canonical representative per shared dial code, so parsing a stored
// number with a foreign fallback iso still lands a deterministic flag
// (+1 → US, +7 → RU, +44 → GB). Manual re-pick always wins afterwards.
const PHONE_DIAL_CANONICAL_ISO: Record<string, string> = { "1": "US", "7": "RU", "44": "GB" }
// BE-063: deterministic pre-paint default (rule 42 — pure constant both
// sides). Locale detection lands in a gated layout effect, never the first
// markup, so there is no flag flash and no hydration mismatch.
const PHONE_COUNTRY_DEFAULT_ISO = "US"
// BE-088: IANA-zone → country second signal for detection. Locale stays
// first (an explicit locale region always wins); the timezone only resolves
// the ambiguous cases — English-browser visitors abroad (en-US + Africa/Cairo
// → EG) and region-less locales. No IP geolocation, fully offline.
const PHONE_TIMEZONE_TO_ISO: Record<string, string> = {
    "Africa/Cairo": "EG",
    "Africa/Lagos": "NG",
    "Africa/Nairobi": "KE",
    "Africa/Johannesburg": "ZA",
    "Africa/Casablanca": "MA",
    "Africa/Algiers": "DZ",
    "Africa/Tunis": "TN",
    "Africa/Accra": "GH",
    "Africa/Addis_Ababa": "ET",
    "Africa/Khartoum": "SD",
    "Africa/Tripoli": "LY",
    "Africa/Dakar": "SN",
    "Africa/Abidjan": "CI",
    "Africa/Luanda": "AO",
    "Africa/Dar_es_Salaam": "TZ",
    "Africa/Kampala": "UG",
    "Africa/Kigali": "RW",
    "Africa/Windhoek": "NA",
    "Africa/Maputo": "MZ",
    "Africa/Harare": "ZW",
    "Africa/Lusaka": "ZM",
    "America/New_York": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Los_Angeles": "US",
    "America/Anchorage": "US",
    "Pacific/Honolulu": "US",
    "America/Toronto": "CA",
    "America/Vancouver": "CA",
    "America/Winnipeg": "CA",
    "America/Halifax": "CA",
    "America/St_Johns": "CA",
    "America/Mexico_City": "MX",
    "America/Cancun": "MX",
    "America/Guatemala": "GT",
    "America/Panama": "PA",
    "America/Bogota": "CO",
    "America/Lima": "PE",
    "America/Santiago": "CL",
    "America/Argentina/Buenos_Aires": "AR",
    "America/Sao_Paulo": "BR",
    "America/Montevideo": "UY",
    "America/Asuncion": "PY",
    "America/La_Paz": "BO",
    "America/Caracas": "VE",
    "America/Guyana": "GY",
    "America/Paramaribo": "SR",
    "America/Cayenne": "GF",
    "America/Puerto_Rico": "PR",
    "America/Santo_Domingo": "DO",
    "America/Havana": "CU",
    "America/Jamaica": "JM",
    "America/Port_of_Spain": "TT",
    "America/Barbados": "BB",
    "America/Nassau": "BS",
    "America/Belize": "BZ",
    "America/Tegucigalpa": "HN",
    "America/Managua": "NI",
    "America/El_Salvador": "SV",
    "America/Costa_Rica": "CR",
    "America/Nuuk": "GL",
    "America/Miquelon": "PM",
    "Atlantic/Bermuda": "BM",
    "Atlantic/Azores": "PT",
    "Europe/London": "GB",
    "Europe/Dublin": "IE",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "Europe/Rome": "IT",
    "Europe/Madrid": "ES",
    "Europe/Amsterdam": "NL",
    "Europe/Brussels": "BE",
    "Europe/Zurich": "CH",
    "Europe/Vienna": "AT",
    "Europe/Stockholm": "SE",
    "Europe/Oslo": "NO",
    "Europe/Copenhagen": "DK",
    "Europe/Helsinki": "FI",
    "Europe/Warsaw": "PL",
    "Europe/Prague": "CZ",
    "Europe/Budapest": "HU",
    "Europe/Bucharest": "RO",
    "Europe/Athens": "GR",
    "Europe/Istanbul": "TR",
    "Europe/Moscow": "RU",
    "Europe/Kyiv": "UA",
    "Europe/Kiev": "UA",
    "Europe/Minsk": "BY",
    "Europe/Riga": "LV",
    "Europe/Tallinn": "EE",
    "Europe/Vilnius": "LT",
    "Europe/Lisbon": "PT",
    "Atlantic/Reykjavik": "IS",
    "Europe/Luxembourg": "LU",
    "Europe/Monaco": "MC",
    "Europe/Malta": "MT",
    "Asia/Nicosia": "CY",
    "Europe/Tirane": "AL",
    "Europe/Skopje": "MK",
    "Europe/Sofia": "BG",
    "Europe/Belgrade": "RS",
    "Europe/Zagreb": "HR",
    "Europe/Sarajevo": "BA",
    "Europe/Podgorica": "ME",
    "Europe/Chisinau": "MD",
    "Asia/Dubai": "AE",
    "Asia/Riyadh": "SA",
    "Asia/Qatar": "QA",
    "Asia/Kuwait": "KW",
    "Asia/Bahrain": "BH",
    "Asia/Muscat": "OM",
    "Asia/Amman": "JO",
    "Asia/Beirut": "LB",
    "Asia/Damascus": "SY",
    "Asia/Jerusalem": "IL",
    "Asia/Gaza": "PS",
    "Asia/Hebron": "PS",
    "Asia/Baghdad": "IQ",
    "Asia/Tehran": "IR",
    "Asia/Yerevan": "AM",
    "Asia/Baku": "AZ",
    "Asia/Tbilisi": "GE",
    "Asia/Karachi": "PK",
    "Asia/Kolkata": "IN",
    "Asia/Calcutta": "IN",
    "Asia/Dhaka": "BD",
    "Asia/Colombo": "LK",
    "Asia/Kathmandu": "NP",
    "Asia/Almaty": "KZ",
    "Asia/Tashkent": "UZ",
    "Asia/Bishkek": "KG",
    "Asia/Dushanbe": "TJ",
    "Asia/Ashgabat": "TM",
    "Asia/Bangkok": "TH",
    "Asia/Jakarta": "ID",
    "Asia/Kuala_Lumpur": "MY",
    "Asia/Singapore": "SG",
    "Asia/Manila": "PH",
    "Asia/Hong_Kong": "HK",
    "Asia/Shanghai": "CN",
    "Asia/Taipei": "TW",
    "Asia/Seoul": "KR",
    "Asia/Tokyo": "JP",
    "Asia/Ulaanbaatar": "MN",
    "Asia/Yangon": "MM",
    "Asia/Phnom_Penh": "KH",
    "Asia/Vientiane": "LA",
    "Asia/Ho_Chi_Minh": "VN",
    "Asia/Dili": "TL",
    "Asia/Macau": "MO",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",
    "Australia/Brisbane": "AU",
    "Australia/Perth": "AU",
    "Australia/Adelaide": "AU",
    "Australia/Darwin": "AU",
    "Australia/Hobart": "AU",
    "Pacific/Auckland": "NZ",
    "Pacific/Fiji": "FJ",
    "Pacific/Guam": "GU",
    "Pacific/Port_Moresby": "PG",
    "Pacific/Noumea": "NC",
    "Pacific/Tahiti": "PF",
    "Pacific/Apia": "WS",
    "Pacific/Tongatapu": "TO",
    "Pacific/Tarawa": "KI",
    "Pacific/Majuro": "MH",
}
function detectPhoneCountryIso(): string {
    let localeIso = ""
    if (typeof navigator !== "undefined") {
        const lang = typeof navigator.language === "string" ? navigator.language : ""
        const region = (lang.split(/[-_]/)[1] || "").toUpperCase()
        if (region && phoneCountryByIso(region)) localeIso = region
    }
    let tzIso = ""
    try {
        const zone =
            typeof Intl !== "undefined"
                ? Intl.DateTimeFormat().resolvedOptions().timeZone || ""
                : ""
        const hit = PHONE_TIMEZONE_TO_ISO[zone]
        if (hit && phoneCountryByIso(hit)) tzIso = hit
    } catch {
        tzIso = ""
    }
    // Explicit non-default locale wins; the timezone resolves the ambiguous
    // remainder (default-locale visitors abroad, region-less locales).
    if (localeIso && localeIso !== PHONE_COUNTRY_DEFAULT_ISO) return localeIso
    if (tzIso) return tzIso
    if (localeIso) return localeIso
    return PHONE_COUNTRY_DEFAULT_ISO
}
// BE-104: E.164 caps any international number at 15 digits — no real phone
// number is ever longer, so keystrokes past 15 digits never appear (a hard
// write-point limit, never a validation message). Formatting the visitor
// typed is preserved; only the digit budget is enforced.
// BE-110: max national-significant digits per country, extracted from
// libphonenumber metadata (max over possibleLengths: general + every type —
// erring loose, never tight — audited: no lengths live outside int arrays).
// Missing entries fall back to the E.164 ceiling in the budget helper.
const PHONE_MAX_NATIONAL: Record<string, number> = {
    AF: 9, AL: 9, DZ: 9, AS: 10, AD: 9, AO: 9, AI: 10, AG: 10, AR: 11, AM: 8,
    AW: 7, AU: 12, AT: 13, AZ: 9, BS: 10, BH: 8, BD: 10, BB: 10, BY: 11, BE: 9,
    BZ: 11, BJ: 10, BM: 10, BT: 8, BO: 9, BA: 9, BW: 10, BR: 11, IO: 7, VG: 10,
    BN: 7, BG: 12, BF: 8, BI: 8, KH: 10, CM: 9, CA: 10, CV: 7, KY: 10, CF: 8,
    TD: 8, CL: 11, CN: 12, CX: 12, CC: 12, CO: 11, KM: 7, CG: 9, CD: 10, CK: 5,
    CR: 10, CI: 10, HR: 9, CU: 10, CW: 8, CY: 8, CZ: 12, DK: 8, DJ: 8, DM: 10,
    DO: 10, EC: 11, EG: 10, SV: 11, GQ: 9, ER: 7, EE: 10, SZ: 9, ET: 9, FK: 5,
    FO: 6, FJ: 11, FI: 12, FR: 9, GF: 9, PF: 9, GA: 8, GM: 9, GE: 9, DE: 15,
    GH: 9, GI: 8, GR: 12, GL: 6, GD: 10, GP: 9, GU: 10, GT: 11, GG: 10, GN: 9,
    GW: 9, GY: 7, HT: 8, HN: 11, HK: 11, HU: 9, IS: 9, IN: 13, ID: 16, IR: 10,
    IQ: 10, IE: 10, IM: 10, IL: 12, IT: 12, JM: 10, JP: 16, JE: 10, JO: 9,
    KZ: 14, KE: 10, KI: 8, XK: 12, KW: 8, KG: 10, LA: 10, LV: 8, LB: 8, LS: 8,
    LR: 9, LY: 9, LI: 9, LT: 8, LU: 11, MO: 8, MG: 9, MW: 9, MY: 10, MV: 10,
    ML: 8, MT: 8, MH: 7, MQ: 9, MR: 8, MU: 10, YT: 9, MX: 10, FM: 7, MD: 8,
    MC: 9, MN: 10, ME: 9, MS: 10, MA: 9, MZ: 9, MM: 10, NA: 9, NR: 7, NP: 11,
    NL: 11, NC: 6, NZ: 10, NI: 8, NE: 8, NG: 14, NU: 7, NF: 6, KP: 10, MK: 8,
    MP: 10, NO: 8, OM: 9, PK: 12, PW: 7, PS: 10, PA: 11, PG: 8, PY: 11, PE: 9,
    PH: 13, PL: 10, PT: 9, PR: 10, QA: 11, RE: 9, RO: 9, RU: 14, RW: 9, BL: 9,
    SH: 5, KN: 10, LC: 10, MF: 9, PM: 9, VC: 10, WS: 10, SM: 10, ST: 7, SA: 10,
    SN: 9, RS: 12, SC: 7, SL: 8, SG: 11, SX: 10, SK: 9, SI: 8, SB: 7, SO: 9,
    ZA: 10, KR: 14, SS: 9, ES: 9, LK: 9, SD: 9, SR: 7, SJ: 8, SE: 12,
    CH: 12, SY: 9, TW: 11, TJ: 9, TZ: 9, TH: 13, TL: 8, TG: 8, TK: 7, TO: 7,
    TT: 10, TN: 8, TR: 13, TM: 8, TC: 10, TV: 7, VI: 10, UG: 9, UA: 10, AE: 12,
    GB: 10, US: 10, UY: 13, UZ: 9, VU: 7, VA: 12, VE: 10, VN: 10, WF: 9, EH: 9,
    YE: 9, ZM: 9, ZW: 10, AX: 12,
}
function phoneNationalBudget(iso: string, dial: string): number {
    const meta = PHONE_MAX_NATIONAL[(iso || "").toUpperCase()]
    const e164 = 15 - dial.length
    return typeof meta === "number" ? Math.min(meta, e164) : e164
}
function truncatePhoneNational(clean: string, maxDigits: number): string {
    let seen = 0
    let out = ""
    for (const ch of clean) {
        if (/\d/.test(ch)) {
            if (seen >= maxDigits) continue
            seen++
        }
        out += ch
    }
    return out
}
// BE-063: split a stored full-international value ("+201012345678") into its
// country + national parts. Legacy national-only values (no "+") keep the
// fallback country. The current country wins ties on shared dial codes
// (+1 US/CA/…, +7 RU/KZ, +44 GB/GG/IM/JE) so typing never flips the flag.
function splitStoredPhone(stored: string, fallbackIso: string): { iso: string; national: string } {
    const text = (stored || "").trim()
    if (!text) return { iso: fallbackIso, national: "" }
    const digits = text.replace(/\D/g, "")
    if (text.startsWith("+")) {
        const prefer = phoneCountryByIso(fallbackIso)
        if (prefer && digits.startsWith(prefer[2]) && digits.length > prefer[2].length) {
            return { iso: prefer[0], national: digits.slice(prefer[2].length) }
        }
        for (let len = 4; len >= 1; len--) {
            const prefix = digits.slice(0, len)
            if (!prefix) continue
            const canonical = PHONE_DIAL_CANONICAL_ISO[prefix]
            const hit =
                (canonical && phoneCountryByIso(canonical)) ||
                PHONE_COUNTRIES.find((c) => c[2] === prefix)
            if (hit && digits.length > len) {
                return { iso: hit[0], national: digits.slice(len) }
            }
        }
    }
    return { iso: fallbackIso, national: digits }
}

interface FieldRendererProps {
    field: NormalizedField
    value: string | boolean | Array<string> | undefined
    error: string | null
    theme: StepBodyProps["theme"]
    borderRadius: string | number
    onFieldChange: (fieldId: string, value: string | boolean | Array<string> | undefined) => void
    choiceGroupAriaLabel: string
    isSubmitting?: boolean
    globalFieldStyles?: FieldStyleOverrides
    instanceId: string
}

function FieldErrorMessage({
    domId,
    message,
    color,
}: {
    domId: string
    message: string
    color: string
}) {
    const announcedRef = React.useRef(false)
    const firstAppearance = !announcedRef.current
    React.useEffect(() => {
        announcedRef.current = true
    }, [])
    return (
        <div
            id={domId}
            style={{
                color,
                fontSize: 12,
            }}
            role={firstAppearance ? "alert" : "status"}
        >
            {message}
        </div>
    )
}

const SELECT_MENU_MAX_PX = 320
const SELECT_MENU_VIEWPORT_RATIO = 0.4
const SELECT_MENU_Z_INDEX = 999999

interface SelectMenuPlacement {
    left: number
    top: number
    width: number
    maxHeight: number
}

interface SelectMenuFont {
    fontFamily: string
    fontSize: string
    fontWeight: string
    fontStyle: string
    letterSpacing: string
    lineHeight: string
}

interface MultiSelectFieldControlProps {
    field: NormalizedField
    opts: ChoiceOption[]
    value: string | boolean | Array<string> | undefined
    hasError: boolean
    isSubmitting: boolean
    onFieldChange: (fieldId: string, value: string | boolean | Array<string> | undefined) => void
    fs: FieldStyleOverrides | undefined
    inputBaseStyle: React.CSSProperties
    fsInputFontSize: number
    fsPadding: string
    fsRadius: string
    fsBorder: { width: number; style: string; color: string | undefined }
    theme: Theme
    fieldDomId: string
    errorDomId: string
    reducedMotion: boolean
}

// BE-055: multi-pick combobox. Same trigger + portaled listbox mechanics as the
// single select (rule 134), but options toggle in place, the menu stays open,
// the closed box renders chips, and there is intentionally no first-option seed.
const MultiSelectFieldControl = React.memo(function MultiSelectFieldControl(
    props: MultiSelectFieldControlProps
) {
    const {
        field,
        opts,
        value,
        hasError,
        isSubmitting,
        onFieldChange,
        fs,
        inputBaseStyle,
        fsInputFontSize,
        fsPadding,
        fsRadius,
        fsBorder,
        theme,
        fieldDomId,
        errorDomId,
        reducedMotion,
    } = props

    const triggerRef = React.useRef<HTMLDivElement | null>(null)
    const menuRef = React.useRef<HTMLUListElement | null>(null)
    const [open, setOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)
    const [menuRect, setMenuRect] = React.useState<SelectMenuPlacement | null>(null)
    const [menuFont, setMenuFont] = React.useState<SelectMenuFont | null>(null)

    const listboxDomId = `${fieldDomId}-multiselect-listbox`

    const picked: Array<string> = Array.isArray(value) ? value : []
    const pickedSet = React.useMemo(() => new Set(picked), [picked])
    const pickedOptions = opts.filter((o) => pickedSet.has(optionValue(o)))

    const padAxes = paddingAxesFrom(fsPadding) ?? { y: 14, x: 14 }
    const rowEstimate = padAxes.y * 2 + Math.round(Math.max(fsInputFontSize, 13) * 1.25) + 2
    const computePlacement = React.useCallback((): SelectMenuPlacement | null => {
        const el = triggerRef.current
        if (!el || typeof window === "undefined") return null
        const r = el.getBoundingClientRect()
        const viewportH = window.innerHeight || 0
        const cap = Math.min(viewportH * SELECT_MENU_VIEWPORT_RATIO, SELECT_MENU_MAX_PX)
        const est = Math.min(Math.max(opts.length, 1) * rowEstimate + 8, cap)
        const spaceBelow = viewportH - r.bottom - 8
        const spaceAbove = r.top - 8
        const openBelow = spaceBelow >= Math.min(est, 160) || spaceBelow >= spaceAbove
        const maxH = Math.max(120, Math.min(cap, openBelow ? spaceBelow : spaceAbove))
        return {
            left: r.left,
            top: openBelow ? r.bottom + 4 : Math.max(8, r.top - est - 4),
            width: r.width,
            maxHeight: maxH,
        }
    }, [opts.length, rowEstimate])

    const updatePlacement = React.useCallback(() => {
        const next = computePlacement()
        if (!next) return
        setMenuRect((prev) => {
            if (
                prev &&
                prev.left === next.left &&
                prev.top === next.top &&
                prev.width === next.width &&
                prev.maxHeight === next.maxHeight
            )
                return prev
            return next
        })
    }, [computePlacement])

    const openMenu = React.useCallback(
        (focus?: "start" | "end") => {
            if (opts.length === 0) return
            const el = triggerRef.current
            const placement = computePlacement()
            if (!el || !placement) return
            let font: SelectMenuFont | null = null
            if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
                const cs = window.getComputedStyle(el)
                font = {
                    fontFamily: cs.fontFamily,
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    fontStyle: cs.fontStyle,
                    letterSpacing: cs.letterSpacing,
                    lineHeight: cs.lineHeight,
                }
            }
            setMenuFont(font)
            setMenuRect(placement)
            const firstPicked = opts.findIndex((o) => pickedSet.has(optionValue(o)))
            setActiveIndex(
                focus === "end" ? Math.max(0, opts.length - 1) : firstPicked >= 0 ? firstPicked : 0
            )
            setOpen(true)
        },
        [opts, pickedSet, computePlacement]
    )

    const toggleOption = React.useCallback(
        (index: number) => {
            const opt = opts[index]
            if (!opt || opt.disabled) return
            const v = optionValue(opt)
            const next = pickedSet.has(v) ? picked.filter((item) => item !== v) : [...picked, v]
            onFieldChange(field.id, next)
        },
        [opts, picked, pickedSet, field.id, onFieldChange]
    )

    const removePicked = React.useCallback(
        (v: string) => {
            onFieldChange(
                field.id,
                picked.filter((item) => item !== v)
            )
        },
        [picked, field.id, onFieldChange]
    )

    React.useEffect(() => {
        if (isSubmitting) setOpen(false)
    }, [isSubmitting])

    React.useEffect(() => {
        if (!open) return
        if (typeof document === "undefined") return
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null
            if (!target) return
            if (triggerRef.current?.contains(target)) return
            if (menuRef.current?.contains(target)) return
            setOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open])

    React.useEffect(() => {
        if (!open) return
        if (typeof window === "undefined") return
        let raf = 0
        const reposition = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                updatePlacement()
            })
        }
        window.addEventListener("scroll", reposition, true)
        window.addEventListener("resize", reposition)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", reposition, true)
            window.removeEventListener("resize", reposition)
        }
    }, [open, updatePlacement])

    const clampedActive = opts.length === 0 ? 0 : Math.min(activeIndex, opts.length - 1)

    const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isSubmitting) return
        switch (event.key) {
            case "Escape":
                if (open) {
                    event.preventDefault()
                    setOpen(false)
                }
                return
            case " ":
            case "Enter":
                event.preventDefault()
                if (open) toggleOption(clampedActive)
                else openMenu()
                return
            case "ArrowDown":
                event.preventDefault()
                if (!open) {
                    openMenu("start")
                    return
                }
                if (opts.length === 0) return
                setActiveIndex((prev) => {
                    const next = (Math.min(prev, opts.length - 1) + 1) % opts.length
                    return next
                })
                return
            case "ArrowUp":
                event.preventDefault()
                if (!open) {
                    openMenu("end")
                    return
                }
                if (opts.length === 0) return
                setActiveIndex((prev) => {
                    const cur = Math.min(prev, opts.length - 1)
                    const next = cur - 1 < 0 ? opts.length - 1 : cur - 1
                    return next
                })
                return
            case "Home":
                if (open && opts.length > 0) {
                    event.preventDefault()
                    setActiveIndex(0)
                }
                return
            case "End":
                if (open && opts.length > 0) {
                    event.preventDefault()
                    setActiveIndex(opts.length - 1)
                }
                return
            default:
                return
        }
    }

    const menuRowRadius = Math.max(0, Number.parseFloat(fsRadius) - 4)
    const menuRowRadiusValue = Number.isFinite(menuRowRadius) ? menuRowRadius : 0
    // BE-114: multiselect rows never take the full accent surface — the ONLY
    // selected indicator is the accent-colored check; the row itself keeps
    // the hover wash (selected or hovered alike). Single-select rows and
    // choice options still consume the full Selected Styles (rule 158).
    // (selectedRowText survives below for the chips only: light text on the
    // accent chip surface — unchanged by design.)
    const selectedRowText =
        fs?.selected?.textColor ??
        fs?.selectedTextColor ??
        theme.accentForegroundColor ??
        TEXT_ON_ACCENT
    const selectedRowSurface =
        fs?.selected?.backgroundColor ?? fs?.selectedBackgroundColor ?? theme.accentColor
    const optionTextColor = fs?.textColor ?? theme.textPrimaryColor
    const hoverRowWash = withAlpha(optionTextColor, 0.06)

    const menuSurfaceStyle: React.CSSProperties = {
        position: "fixed",
        left: menuRect?.left,
        top: menuRect?.top,
        width: menuRect?.width,
        maxHeight: menuRect?.maxHeight,
        margin: 0,
        padding: 4,
        boxSizing: "border-box",
        listStyle: "none",
        overflowY: "auto",
        overscrollBehavior: "contain",
        zIndex: SELECT_MENU_Z_INDEX,
        background: fs?.backgroundColor ?? theme.surfaceColor,
        border: `${fsBorder.width}px ${fsBorder.style} ${fsBorder.color ?? theme.borderColor}`,
        borderRadius: fsRadius,
        color: optionTextColor,
        ...(menuFont ?? {}),
        ...shadowStyle(fs?.shadow),
    }

    const renderRow = (option: ChoiceOption, index: number) => {
        const isSelected = pickedSet.has(optionValue(option))
        const isActiveRow = index === clampedActive
        return (
            // biome-ignore lint/a11y/useFocusableInteractive: ARIA multiselect option — focus stays on the trigger via aria-activedescendant, options toggle on pointerdown (rules 134/162).
            <li
                key={`${option.label}-${index}`}
                id={`${listboxDomId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onPointerDown={(event) => {
                    event.preventDefault()
                    toggleOption(index)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                    padding: fsPadding,
                    borderRadius: menuRowRadiusValue,
                    margin: 0,
                    listStyle: "none",
                    cursor: option.disabled ? "not-allowed" : "pointer",
                    color: option.disabled
                        ? theme.textSecondaryColor
                        : optionTextColor,
                    background:
                        !option.disabled && isActiveRow
                            ? hoverRowWash
                            : "transparent",
                    opacity: option.disabled ? 0.5 : 1,
                    transition: reducedMotion
                        ? "none"
                        : "background-color 0.12s ease, color 0.12s ease",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <span
                    aria-hidden="true"
                    style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSelected ? selectedRowSurface : "transparent",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                            d="M3 8.5l3.5 3.5L13 4.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
                {option.label}
            </li>
        )
    }

    const inputName = field.calFieldId || field.id
    const placeholder = field.placeholder || ""

    return (
        <div style={{ position: "relative" }}>
            {picked.map((v) => (
                <input key={v} type="hidden" name={inputName} value={v} aria-hidden="true" />
            ))}
            <div
                ref={triggerRef}
                id={fieldDomId}
                role="combobox"
                tabIndex={isSubmitting ? -1 : 0}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={open ? listboxDomId : undefined}
                aria-activedescendant={
                    open && opts.length > 0 ? `${listboxDomId}-option-${clampedActive}` : undefined
                }
                aria-label={field.label}
                aria-required={field.required || undefined}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorDomId : undefined}
                aria-disabled={isSubmitting || undefined}
                className={hasError ? "be-input be-input-invalid" : "be-input"}
                onClick={() => {
                    if (isSubmitting) return
                    if (open) setOpen(false)
                    else openMenu()
                }}
                onKeyDown={handleTriggerKeyDown}
                onBlur={() => {
                    if (open) setOpen(false)
                }}
                style={{
                    ...inputBaseStyle,
                    textAlign: "start",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.5 : 1,
                    paddingRight: paddingHorizontalFrom(fsPadding) + 22,
                    // BE-117: pin the exact inputBaseStyle line-height rule —
                    // inputs compute their own `normal`, divs inherit the
                    // root's computed px value (measured 38px vs 43px).
                    lineHeight: fs?.font?.lineHeight ?? "normal",
                    color:
                        picked.length === 0 && fs?.placeholderColor
                            ? fs.placeholderColor
                            : (fs?.textColor ?? theme.textPrimaryColor),
                    touchAction: "manipulation",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 6,
                    ...(fs?.focusBorderColor
                        ? ({ "--be-focus-color": fs.focusBorderColor } as React.CSSProperties)
                        : {}),
                }}
            >
                {pickedOptions.length === 0 ? (
                    // BE-112/BE-115: nbsp strut + the REAL placeholder color
                    // (opacity 0.7 on text color washed out wrong) — same
                    // expression real input placeholders resolve to.
                    <span
                        style={{
                            color:
                                fs?.placeholderColor ??
                                withAlpha(theme.textPrimaryColor, 0.6, theme.surfaceColor),
                        }}
                    >
                        {placeholder || " "}
                    </span>
                ) : (
                    pickedOptions.map((o) => {
                        const v = optionValue(o)
                        return (
                            <span
                                key={v}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "4px 4px 4px 8px",
                                    borderRadius: menuRowRadiusValue,
                                    background: selectedRowSurface,
                                    color: selectedRowText,
                                    fontSize: 13,
                                    lineHeight: 1.4,
                                    maxWidth: "100%",
                                }}
                            >
                                <span
                                    style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {o.label}
                                </span>
                                <button
                                    type="button"
                                    aria-label={`Remove ${o.label}`}
                                    disabled={isSubmitting}
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        removePicked(v)
                                    }}
                                    onPointerDown={(event) => {
                                        event.stopPropagation()
                                    }}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 18,
                                        height: 18,
                                        padding: 0,
                                        margin: 0,
                                        border: "none",
                                        borderRadius: "50%",
                                        background: "transparent",
                                        color: "inherit",
                                        cursor: isSubmitting ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {/* BE-114: author-supplied lucide X paths,
                                        verbatim — replaces the text glyph. */}
                                    <svg
                                        aria-hidden="true"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ display: "block", flexShrink: 0 }}
                                    >
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </span>
                        )
                    })
                )}
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
                        transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
                        pointerEvents: "none",
                        transition: reducedMotion ? "none" : "transform 0.15s ease",
                    }}
                >
                    <path
                        d="M4 6L8 10L12 6"
                        stroke={fs?.textColor ?? theme.textSecondaryColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            {open && menuRect && typeof document !== "undefined"
                ? // Dual @types/react copies in the editor disagree on the
                  (ReactDOM.createPortal(
                      <ul
                          ref={menuRef}
                          id={listboxDomId}
                          role="listbox"
                          aria-multiselectable="true"
                          aria-label={field.label}
                          className="be-select-scroll"
                          tabIndex={-1}
                          style={menuSurfaceStyle}
                      >
                          {opts.map(renderRow)}
                      </ul>,
                      document.body
                  ) as unknown as React.ReactNode)
                : null}
        </div>
    )
})

interface SelectFieldControlProps {
    field: NormalizedField
    opts: ChoiceOption[]
    value: string | boolean | undefined
    hasError: boolean
    isSubmitting: boolean
    onFieldChange: (fieldId: string, value: string | boolean | undefined) => void
    fs: FieldStyleOverrides | undefined
    inputBaseStyle: React.CSSProperties
    fsInputFontSize: number
    fsPadding: string
    fsRadius: string
    fsBorder: { width: number; style: string; color: string | undefined }
    theme: Theme
    fieldDomId: string
    errorDomId: string
    reducedMotion: boolean
}

const SelectFieldControl = React.memo(function SelectFieldControl(props: SelectFieldControlProps) {
    const {
        field,
        opts,
        value,
        hasError,
        isSubmitting,
        onFieldChange,
        fs,
        inputBaseStyle,
        fsInputFontSize,
        fsPadding,
        fsRadius,
        fsBorder,
        theme,
        fieldDomId,
        errorDomId,
        reducedMotion,
    } = props

    const beInteractive = useBeInteractive()
    const triggerRef = React.useRef<HTMLDivElement | null>(null)
    const menuRef = React.useRef<HTMLUListElement | null>(null)
    const [open, setOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)
    const [menuRect, setMenuRect] = React.useState<SelectMenuPlacement | null>(null)
    const [menuFont, setMenuFont] = React.useState<SelectMenuFont | null>(null)

    const listboxDomId = `${fieldDomId}-listbox`

    const storedValue = typeof value === "string" ? value : ""
    const matchedOption = opts.find((o) => optionValue(o) === storedValue)
    const displayValue = matchedOption
        ? storedValue
        : opts.length > 0
          ? getFirstNonEmptyOption(opts)
          : storedValue
    const selectedOption = opts.find((o) => optionValue(o) === displayValue)

    React.useEffect(() => {
        if (!beInteractive) return
        if (opts.length === 0) return
        if (storedValue !== "") return
        const seed = getFirstNonEmptyOption(opts)
        if (!seed) return
        onFieldChange(field.id, seed)
    }, [beInteractive, opts, storedValue, field.id, onFieldChange])

    const padAxes = paddingAxesFrom(fsPadding) ?? { y: 14, x: 14 }
    const rowEstimate = padAxes.y * 2 + Math.round(Math.max(fsInputFontSize, 13) * 1.25) + 2
    const computePlacement = React.useCallback((): SelectMenuPlacement | null => {
        const el = triggerRef.current
        if (!el || typeof window === "undefined") return null
        const r = el.getBoundingClientRect()
        const viewportH = window.innerHeight || 0
        const cap = Math.min(viewportH * SELECT_MENU_VIEWPORT_RATIO, SELECT_MENU_MAX_PX)
        const est = Math.min(Math.max(opts.length, 1) * rowEstimate + 8, cap)
        const spaceBelow = viewportH - r.bottom - 8
        const spaceAbove = r.top - 8
        const openBelow = spaceBelow >= Math.min(est, 160) || spaceBelow >= spaceAbove
        const maxH = Math.max(120, Math.min(cap, openBelow ? spaceBelow : spaceAbove))
        return {
            left: r.left,
            top: openBelow ? r.bottom + 4 : Math.max(8, r.top - est - 4),
            width: r.width,
            maxHeight: maxH,
        }
    }, [opts.length, rowEstimate])

    const updatePlacement = React.useCallback(() => {
        const next = computePlacement()
        if (!next) return
        setMenuRect((prev) => {
            if (
                prev &&
                prev.left === next.left &&
                prev.top === next.top &&
                prev.width === next.width &&
                prev.maxHeight === next.maxHeight
            )
                return prev
            return next
        })
    }, [computePlacement])

    const openMenu = React.useCallback(
        (focus?: "start" | "end") => {
            if (opts.length === 0) return
            const el = triggerRef.current
            const placement = computePlacement()
            if (!el || !placement) return
            let font: SelectMenuFont | null = null
            if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
                const cs = window.getComputedStyle(el)
                font = {
                    fontFamily: cs.fontFamily,
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    fontStyle: cs.fontStyle,
                    letterSpacing: cs.letterSpacing,
                    lineHeight: cs.lineHeight,
                }
            }
            setMenuFont(font)
            setMenuRect(placement)
            const selectedIdx = opts.findIndex((o) => optionValue(o) === displayValue)
            setActiveIndex(
                focus === "end" ? Math.max(0, opts.length - 1) : selectedIdx >= 0 ? selectedIdx : 0
            )
            setOpen(true)
        },
        [opts, displayValue, computePlacement]
    )

    const commitOption = React.useCallback(
        (index: number) => {
            const opt = opts[index]
            if (!opt || opt.disabled) return
            onFieldChange(field.id, optionValue(opt))
            setOpen(false)
        },
        [opts, field.id, onFieldChange]
    )

    React.useEffect(() => {
        if (isSubmitting) setOpen(false)
    }, [isSubmitting])

    React.useEffect(() => {
        if (!open) return
        if (typeof document === "undefined") return
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null
            if (!target) return
            if (triggerRef.current?.contains(target)) return
            if (menuRef.current?.contains(target)) return
            setOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open])

    React.useEffect(() => {
        if (!open) return
        if (typeof window === "undefined") return
        let raf = 0
        const reposition = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                updatePlacement()
            })
        }
        window.addEventListener("scroll", reposition, true)
        window.addEventListener("resize", reposition)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", reposition, true)
            window.removeEventListener("resize", reposition)
        }
    }, [open, updatePlacement])

    const clampedActive = opts.length === 0 ? 0 : Math.min(activeIndex, opts.length - 1)

    const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isSubmitting) return
        switch (event.key) {
            case "Escape":
                if (open) {
                    event.preventDefault()
                    setOpen(false)
                }
                return
            case " ":
            case "Enter":
                event.preventDefault()
                if (open) commitOption(clampedActive)
                else openMenu()
                return
            case "ArrowDown":
                event.preventDefault()
                if (!open) {
                    openMenu("start")
                    return
                }
                if (opts.length === 0) return
                setActiveIndex((prev) => {
                    const next = (Math.min(prev, opts.length - 1) + 1) % opts.length
                    return next
                })
                return
            case "ArrowUp":
                event.preventDefault()
                if (!open) {
                    openMenu("end")
                    return
                }
                if (opts.length === 0) return
                setActiveIndex((prev) => {
                    const cur = Math.min(prev, opts.length - 1)
                    const next = cur - 1 < 0 ? opts.length - 1 : cur - 1
                    return next
                })
                return
            case "Home":
                if (open && opts.length > 0) {
                    event.preventDefault()
                    setActiveIndex(0)
                }
                return
            case "End":
                if (open && opts.length > 0) {
                    event.preventDefault()
                    setActiveIndex(opts.length - 1)
                }
                return
            default:
                return
        }
    }

    const menuRowRadius = Math.max(0, Number.parseFloat(fsRadius) - 4)
    const menuRowRadiusValue = Number.isFinite(menuRowRadius) ? menuRowRadius : 0
    // SELECTED-STYLES (BE-024): nested subgroup first, flat legacy keys
    // keep winning for stored canvases, engine defaults last.
    const selectedRowText =
        fs?.selected?.textColor ??
        fs?.selectedTextColor ??
        theme.accentForegroundColor ??
        TEXT_ON_ACCENT
    const selectedRowSurface =
        fs?.selected?.backgroundColor ?? fs?.selectedBackgroundColor ?? theme.accentColor
    const optionTextColor = fs?.textColor ?? theme.textPrimaryColor
    const hoverRowWash = withAlpha(optionTextColor, 0.06)

    const menuSurfaceStyle: React.CSSProperties = {
        position: "fixed",
        left: menuRect?.left,
        top: menuRect?.top,
        width: menuRect?.width,
        maxHeight: menuRect?.maxHeight,
        margin: 0,
        padding: 4,
        boxSizing: "border-box",
        listStyle: "none",
        overflowY: "auto",
        overscrollBehavior: "contain",
        zIndex: SELECT_MENU_Z_INDEX,
        background: fs?.backgroundColor ?? theme.surfaceColor,
        border: `${fsBorder.width}px ${fsBorder.style} ${fsBorder.color ?? theme.borderColor}`,
        borderRadius: fsRadius,
        color: optionTextColor,
        ...(menuFont ?? {}),
        ...shadowStyle(fs?.shadow),
    }

    const renderRow = (option: ChoiceOption, index: number) => {
        const isSelected = optionValue(option) === displayValue
        const isActiveRow = index === clampedActive
        return (
            // biome-ignore lint/a11y/useFocusableInteractive: ARIA listbox option — focus stays on the trigger via aria-activedescendant, options commit on pointerdown (rules 134/162).
            <li
                key={`${option.label}-${index}`}
                id={`${listboxDomId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onPointerDown={(event) => {
                    event.preventDefault()
                    commitOption(index)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                    padding: fsPadding,
                    borderRadius: menuRowRadiusValue,
                    margin: 0,
                    listStyle: "none",
                    cursor: option.disabled ? "not-allowed" : "pointer",
                    color: option.disabled
                        ? theme.textSecondaryColor
                        : isSelected
                          ? selectedRowText
                          : optionTextColor,
                    background: isSelected
                        ? selectedRowSurface
                        : isActiveRow
                          ? hoverRowWash
                          : "transparent",
                    opacity: option.disabled ? 0.5 : 1,
                    transition: reducedMotion
                        ? "none"
                        : "background-color 0.12s ease, color 0.12s ease",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {option.label}
            </li>
        )
    }

    return (
        <div style={{ position: "relative" }}>
            <input
                type="hidden"
                name={field.calFieldId || field.id}
                value={storedValue}
                aria-hidden="true"
            />
            <div
                ref={triggerRef}
                id={fieldDomId}
                role="combobox"
                tabIndex={isSubmitting ? -1 : 0}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={open ? listboxDomId : undefined}
                aria-activedescendant={
                    open && opts.length > 0 ? `${listboxDomId}-option-${clampedActive}` : undefined
                }
                aria-label={field.label}
                aria-required={field.required || undefined}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorDomId : undefined}
                aria-disabled={isSubmitting || undefined}
                className={hasError ? "be-input be-input-invalid" : "be-input"}
                onClick={() => {
                    if (isSubmitting) return
                    if (open) setOpen(false)
                    else openMenu()
                }}
                onKeyDown={handleTriggerKeyDown}
                onBlur={() => {
                    if (open) setOpen(false)
                }}
                style={{
                    ...inputBaseStyle,
                    textAlign: "start",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.5 : 1,
                    paddingRight: paddingHorizontalFrom(fsPadding) + 22,
                    // BE-117: pin the exact inputBaseStyle line-height rule —
                    // inputs compute their own `normal`, divs inherit the
                    // root's computed px value (measured 38px vs 43px).
                    lineHeight: fs?.font?.lineHeight ?? "normal",
                    color:
                        !displayValue && fs?.placeholderColor
                            ? fs.placeholderColor
                            : (fs?.textColor ?? theme.textPrimaryColor),
                    touchAction: "manipulation",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                    ...(fs?.focusBorderColor
                        ? ({ "--be-focus-color": fs.focusBorderColor } as React.CSSProperties)
                        : {}),
                }}
            >
                {/* BE-112: nbsp strut when no option exists to display (NOT a
                    placeholder feature — rule 133 stands; an empty closed box
                    has no line box and collapses to the 23px floor). */}
                {selectedOption?.label ?? " "}
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
                        transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
                        pointerEvents: "none",
                        transition: reducedMotion ? "none" : "transform 0.15s ease",
                    }}
                >
                    <path
                        d="M4 6L8 10L12 6"
                        stroke={fs?.textColor ?? theme.textSecondaryColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            {open && menuRect && typeof document !== "undefined"
                ? // Dual @types/react copies in the editor disagree on the
                  (ReactDOM.createPortal(
                      <ul
                          ref={menuRef}
                          id={listboxDomId}
                          role="listbox"
                          aria-label={field.label}
                          className="be-select-scroll"
                          tabIndex={-1}
                          style={menuSurfaceStyle}
                      >
                          {opts.map(renderRow)}
                      </ul>,
                      document.body
                  ) as unknown as React.ReactNode)
                : null}
        </div>
    )
})

// PHONE-FIELD (BE-063): country button + national-number input. The stored
// value is always full-international ("+201012345678"); the "+" prefix is
// owned by the country button, never typed. First render is the deterministic
// US default on both sides (rule 42); restore/detection land pre-paint.
interface PhoneFieldControlProps {
    field: NormalizedField
    value: string | boolean | Array<string> | undefined
    hasError: boolean
    isSubmitting: boolean
    onFieldChange: (fieldId: string, value: string | boolean | Array<string> | undefined) => void
    fs: FieldStyleOverrides | undefined
    inputBaseStyle: React.CSSProperties
    fsInputFontSize: number
    fsPadding: string
    fsRadius: string
    fsBorder: { width: number; style: string; color: string | undefined }
    theme: Theme
    fieldDomId: string
    errorDomId: string
    reducedMotion: boolean
}
const PhoneFieldControl = React.memo(function PhoneFieldControl(props: PhoneFieldControlProps) {
    const {
        field,
        value,
        hasError,
        isSubmitting,
        onFieldChange,
        fs,
        inputBaseStyle,
        fsInputFontSize,
        fsPadding,
        fsRadius,
        fsBorder,
        theme,
        fieldDomId,
        errorDomId,
        reducedMotion,
    } = props

    const beInteractive = useBeInteractive()
    const buttonRef = React.useRef<HTMLButtonElement | null>(null)
    // BE-086: the close-root is the whole dialog (search + list). Rooting it
    // on the list alone treated search-box/padding presses as outside clicks
    // and closed the menu mid-interaction.
    const menuRef = React.useRef<HTMLDivElement | null>(null)
    const searchRef = React.useRef<HTMLInputElement | null>(null)
    const [iso, setIso] = React.useState(PHONE_COUNTRY_DEFAULT_ISO)
    const [national, setNational] = React.useState("")
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [activeIndex, setActiveIndex] = React.useState(0)
    const [menuRect, setMenuRect] = React.useState<SelectMenuPlacement | null>(null)
    const lastComposedRef = React.useRef<string | null>(null)
    const settledRef = React.useRef(false)
    const nationalRef = React.useRef<HTMLInputElement | null>(null)
    const dialEditRef = React.useRef<HTMLInputElement | null>(null)
    // BE-105: dial-edit mode — typing "+" first opens country-code entry in
    // the middle slot (Cal.com parity). Null = normal display.
    const [dialEdit, setDialEdit] = React.useState<string | null>(null)

    const full = typeof value === "string" ? value : ""
    const country =
        phoneCountryByIso(iso) ??
        phoneCountryByIso(PHONE_COUNTRY_DEFAULT_ISO) ?? ["US", "United States", "1"]

    // Adopt external value changes (autosave restore, reset). Skips echoes of
    // our own emits so typing never fights the parse.
    useIsomorphicLayoutEffect(() => {
        if (full === lastComposedRef.current) return
        lastComposedRef.current = full
        if (!full) {
            setNational("")
            return
        }
        const parsed = splitStoredPhone(full, iso)
        setIso((prev) => (prev === parsed.iso ? prev : parsed.iso))
        setNational(parsed.national)
        settledRef.current = true
    }, [full, iso])

    // One-shot locale detection for fresh empty fields — gated (rule 109):
    // the prerender must never commit a detected country.
    useIsomorphicLayoutEffect(() => {
        if (!beInteractive || settledRef.current) return
        if (full !== "") return
        settledRef.current = true
        const detected = detectPhoneCountryIso()
        setIso((prev) => (prev === detected ? prev : detected))
    }, [beInteractive, full])

    const emitNational = React.useCallback(
        (nextNational: string) => {
            // BE-105/BE-111: a bare "+" replaces everything (empty box or
            // select-all) — clear the number and open dial-edit mode instead
            // of entering the number (Cal.com parity: typing "+" means "I
            // want another country's code"). Anything longer keeps the
            // normal path, so pasting "+20..." still fills digits directly.
            if (dialEdit === null && nextNational === "+") {
                setNational("")
                settledRef.current = true
                lastComposedRef.current = ""
                onFieldChange(field.id, "")
                setDialEdit("+")
                return
            }
            if (dialEdit !== null) setDialEdit(null)
            // BE-063 + rule 97: letters/symbols stripped at the write point;
            // the "+" prefix belongs to the country button, never the box.
            // BE-104: hard E.164 budget — 15 digits TOTAL international, so
            // the national box gets 15 minus the dial length (US +1 → 14,
            // Egypt +20 → 13). Over-budget keystrokes vanish; no real number
            // on earth exceeds the budget, so nothing legitimate is ever cut.
            const clean = truncatePhoneNational(
                sanitizePhoneInput(nextNational).replace(/\+/g, ""),
                phoneNationalBudget(country[0], country[2])
            )
            const digits = clean.replace(/\D/g, "")
            const nextFull = digits ? `+${country[2]}${digits}` : ""
            setNational(clean)
            settledRef.current = true
            lastComposedRef.current = nextFull
            onFieldChange(field.id, nextFull)
        },
        [country, field.id, onFieldChange, dialEdit]
    )

    // BE-105: dial-edit typing — digits accumulate after the "+", an exact
    // dial match selects that country and jumps back to the number box
    // (flag updates, focus follows). Clearing everything exits the mode.
    const onDialEditChange = (raw: string) => {
        const cleaned = raw.replace(/\D/g, "").slice(0, 4)
        if (!cleaned) {
            setDialEdit(null)
            return
        }
        setDialEdit(`+${cleaned}`)
        const canonical = PHONE_DIAL_CANONICAL_ISO[cleaned]
        const hit =
            (canonical && phoneCountryByIso(canonical)) ||
            PHONE_COUNTRIES.find((c) => c[2] === cleaned)
        if (!hit) return
        settledRef.current = true
        setIso(hit[0])
        setDialEdit(null)
        const digits = national.replace(/\D/g, "")
        const nextFull = digits ? `+${hit[2]}${digits}` : ""
        lastComposedRef.current = nextFull
        onFieldChange(field.id, nextFull)
        nationalRef.current?.focus()
    }

    const exitDialEditToNational = () => {
        setDialEdit(null)
        nationalRef.current?.focus()
    }

    // Typing continues in the middle slot (Cal.com parity) — same pattern as
    // the country-search autofocus on menu open.
    React.useEffect(() => {
        if (dialEdit !== null) dialEditRef.current?.focus()
    }, [dialEdit !== null])

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return PHONE_COUNTRIES
        return PHONE_COUNTRIES.filter(
            (c) =>
                c[1].toLowerCase().includes(q) ||
                c[0].toLowerCase().includes(q) ||
                c[2].includes(q.replace(/\D/g, "") || "§")
        )
    }, [query])

    const padAxes = paddingAxesFrom(fsPadding) ?? { y: 14, x: 14 }
    const rowEstimate = padAxes.y * 2 + Math.round(Math.max(fsInputFontSize, 13) * 1.25) + 2
    const computePlacement = React.useCallback((): SelectMenuPlacement | null => {
        const el = buttonRef.current
        if (!el || typeof window === "undefined") return null
        const r = el.getBoundingClientRect()
        const viewportH = window.innerHeight || 0
        const cap = Math.min(viewportH * SELECT_MENU_VIEWPORT_RATIO, SELECT_MENU_MAX_PX)
        const est = Math.min(Math.max(filtered.length, 1) * rowEstimate + 48, cap)
        const spaceBelow = viewportH - r.bottom - 8
        const spaceAbove = r.top - 8
        const openBelow = spaceBelow >= Math.min(est, 160) || spaceBelow >= spaceAbove
        const maxH = Math.max(120, Math.min(cap, openBelow ? spaceBelow : spaceAbove))
        return {
            left: Math.max(8, Math.min(r.left, window.innerWidth - Math.max(r.width, 248) - 8)),
            top: openBelow ? r.bottom + 4 : Math.max(8, r.top - est - 4),
            width: Math.max(r.width, 248),
            maxHeight: maxH,
        }
    }, [filtered.length, rowEstimate])

    const openMenu = React.useCallback(() => {
        if (isSubmitting) return
        // BE-105: opening the dropdown abandons an in-progress dial edit.
        setDialEdit(null)
        const placement = computePlacement()
        if (!placement) return
        setQuery("")
        setMenuRect(placement)
        const selectedIdx = filtered.findIndex((c) => c[0] === iso)
        setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0)
        setOpen(true)
    }, [computePlacement, filtered, iso, isSubmitting])

    const closeMenu = React.useCallback(() => {
        setOpen(false)
        setQuery("")
        buttonRef.current?.focus()
    }, [])

    const commitCountry = React.useCallback(
        (index: number) => {
            const picked = filtered[index]
            if (!picked) return
            settledRef.current = true
            setIso(picked[0])
            const digits = national.replace(/\D/g, "")
            const nextFull = digits ? `+${picked[2]}${digits}` : ""
            lastComposedRef.current = nextFull
            onFieldChange(field.id, nextFull)
            setOpen(false)
            setQuery("")
            buttonRef.current?.focus()
        },
        [filtered, national, field.id, onFieldChange]
    )

    React.useEffect(() => {
        if (isSubmitting) setOpen(false)
    }, [isSubmitting])

    React.useEffect(() => {
        if (!open) return
        if (typeof document === "undefined") return
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null
            if (!target) return
            if (buttonRef.current?.contains(target)) return
            if (menuRef.current?.contains(target)) return
            setOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open])

    React.useEffect(() => {
        if (!open) return
        if (typeof window === "undefined") return
        let raf = 0
        const reposition = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const next = computePlacement()
                if (!next) return
                setMenuRect((prev) => {
                    if (
                        prev &&
                        prev.left === next.left &&
                        prev.top === next.top &&
                        prev.width === next.width &&
                        prev.maxHeight === next.maxHeight
                    )
                        return prev
                    return next
                })
            })
        }
        window.addEventListener("scroll", reposition, true)
        window.addEventListener("resize", reposition)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", reposition, true)
            window.removeEventListener("resize", reposition)
        }
    }, [open, computePlacement])

    React.useEffect(() => {
        if (open) searchRef.current?.focus()
    }, [open])

    const clampedActive = filtered.length === 0 ? 0 : Math.min(activeIndex, filtered.length - 1)

    const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (isSubmitting) return
        if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
            event.preventDefault()
            if (!open) openMenu()
        } else if (event.key === "Escape" && open) {
            event.preventDefault()
            setOpen(false)
        }
    }

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "Escape":
                event.preventDefault()
                closeMenu()
                return
            case "Enter":
                event.preventDefault()
                if (filtered.length > 0) commitCountry(clampedActive)
                return
            case "ArrowDown":
                event.preventDefault()
                if (filtered.length > 0) {
                    setActiveIndex(
                        (prev) => (Math.min(prev, filtered.length - 1) + 1) % filtered.length
                    )
                }
                return
            case "ArrowUp":
                event.preventDefault()
                if (filtered.length > 0) {
                    setActiveIndex((prev) => {
                        const cur = Math.min(prev, filtered.length - 1)
                        return cur - 1 < 0 ? filtered.length - 1 : cur - 1
                    })
                }
                return
            case "Home":
                event.preventDefault()
                setActiveIndex(0)
                return
            case "End":
                event.preventDefault()
                if (filtered.length > 0) setActiveIndex(filtered.length - 1)
                return
            default:
                return
        }
    }

    const menuRowRadius = Math.max(0, Number.parseFloat(fsRadius) - 4)
    const menuRowRadiusValue = Number.isFinite(menuRowRadius) ? menuRowRadius : 0
    const selectedRowText =
        fs?.selected?.textColor ??
        fs?.selectedTextColor ??
        theme.accentForegroundColor ??
        TEXT_ON_ACCENT
    const selectedRowSurface =
        fs?.selected?.backgroundColor ?? fs?.selectedBackgroundColor ?? theme.accentColor
    const optionTextColor = fs?.textColor ?? theme.textPrimaryColor

    const menuSurfaceStyle: React.CSSProperties = {
        position: "fixed",
        left: menuRect?.left,
        top: menuRect?.top,
        width: menuRect?.width,
        maxHeight: menuRect?.maxHeight,
        margin: 0,
        padding: 4,
        boxSizing: "border-box",
        overflowY: "auto",
        overscrollBehavior: "contain",
        zIndex: SELECT_MENU_Z_INDEX,
        background: fs?.backgroundColor ?? theme.surfaceColor,
        border: `${fsBorder.width}px ${fsBorder.style} ${fsBorder.color ?? theme.borderColor}`,
        borderRadius: fsRadius,
        color: optionTextColor,
        ...shadowStyle(fs?.shadow),
    }

    const listboxDomId = `${fieldDomId}-country`

    return (
        <div>
            {/* BE-086: reui-style split input — flag-only trigger joined flush
                to the number box (no gap, shared border, split radii). */}
            <div style={{ display: "flex", minWidth: 0 }}>
                <button
                    ref={buttonRef}
                    type="button"
                    style={{
                        ...inputBaseStyle,
                        // BE-103: the trigger keeps the FULL shared border
                        // (exactly like the select trigger — no side
                        // overrides at all, so no shorthand/longhand reset
                        // trap can ever resurrect or kill an edge). The seam
                        // divider is the trigger's own opaque right edge;
                        // the input tucks 1px beneath it.
                        width: "auto",
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        paddingTop: padAxes.y,
                        paddingBottom: padAxes.y,
                        // BE-121: left follows the shared horizontal padding
                        // like every other field; right stays fixed so the
                        // seam divider never drifts from the dial slot.
                        paddingLeft: padAxes.x,
                        paddingRight: 8,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.5 : 1,
                        color: theme.textSecondaryColor,
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={listboxDomId}
                    aria-label={`${field.label} country code`}
                    title={country[1]}
                    disabled={isSubmitting}
                    onClick={() => (open ? setOpen(false) : openMenu())}
                    onKeyDown={handleButtonKeyDown}
                >
                    {/* BE-111: globe while no code is recognized (dial-edit
                        mode) INSTEAD of the flag — author-supplied lucide
                        paths, verbatim. */}
                    {dialEdit !== null ? (
                        // BE-113: same fixed 22×16 slot as the flag — a 16px
                        // globe swapping in used to shrink the trigger.
                        <span
                            aria-hidden="true"
                            style={{
                                width: 22,
                                height: 16,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <svg
                                aria-hidden="true"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ display: "block", flexShrink: 0 }}
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                <path d="M2 12h20" />
                            </svg>
                        </span>
                    ) : (
                        <PhoneFlag key={country[0]} iso={country[0]} />
                    )}
                    {/* BE-089: unfold-more affordance (author-supplied paths,
                        both chevrons filled solid — the source file's upper
                        chevron was stroke-only). Muted, fixed size: no layout
                        shift, purely a clickable signal. */}
                    <svg
                        aria-hidden="true"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ display: "block", flexShrink: 0 }}
                    >
                        <path d="M10.3483 10H13.6517C15.6822 10 16.6974 10 16.9501 9.39139C17.2028 8.78277 16.4849 8.06648 15.0491 6.63391L13.3974 4.9859L13.3974 4.9859C12.7387 4.32863 12.4093 4 12 4C11.5907 4 11.2613 4.32864 10.6026 4.9859L8.95091 6.63391L8.95091 6.63391C7.51513 8.06649 6.79724 8.78277 7.0499 9.39139C7.30256 10 8.31781 10 10.3483 10Z" />
                        <path d="M10.3483 14H13.6517C15.6822 14 16.6974 14 16.9501 14.6086C17.2028 15.2172 16.4849 15.9335 15.0491 17.3661L13.3974 19.0141C12.7387 19.6714 12.4093 20 12 20C11.5907 20 11.2613 19.6714 10.6026 19.0141L8.95091 17.3661C7.51513 15.9335 6.79724 15.2172 7.0499 14.6086C7.30256 14 8.31781 14 10.3483 14Z" />
                    </svg>
                </button>
                {/* BE-105: middle slot — the selected dial as muted plain text
                    (Cal.com parity: not a placeholder), or the dial-edit box
                    while the visitor types a "+"-led code. */}
                {/* BE-108: the span + input live inside ONE bordered group —
                    the group owns the border (longhands only, no left edge),
                    the input itself is borderless. Single divider forever,
                    and the span stretches to the full row height. */}
                <div
                    className="be-phone-group"
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        alignItems: "stretch",
                        background: fs?.backgroundColor ?? theme.surfaceColor,
                        borderWidth: fsBorder.width,
                        borderStyle: fsBorder.style,
                        borderColor: hasError
                            ? theme.errorColor
                            : (fsBorder.color ?? theme.borderColor),
                        borderLeftWidth: 0,
                        borderTopRightRadius: fsRadius,
                        borderBottomRightRadius: fsRadius,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        boxSizing: "border-box",
                        ...shadowStyle(fs?.shadow),
                        // BE-108: focus color for the :focus-within group
                        // ring (constant CSS selector below) — the only
                        // dynamic half; no focus JS anywhere on this control.
                        ...({
                            "--be-group-ring": hasError
                                ? theme.errorColor
                                : (fs?.focusBorderColor ?? theme.accentColor),
                        } as React.CSSProperties),
                    }}
                >
                {dialEdit !== null ? (
                    <input
                        ref={dialEditRef}
                        aria-label="Country calling code"
                        type="text"
                        inputMode="tel"
                        value={dialEdit}
                        onChange={(e) => onDialEditChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                e.preventDefault()
                                exitDialEditToNational()
                            }
                        }}
                        onBlur={() => setDialEdit(null)}
                        disabled={isSubmitting}
                        style={{
                            alignSelf: "stretch",
                            textAlign: "center",
                            flexShrink: 0,
                            // BE-106/BE-108: same fixed slot as display mode.
                            width: "3.5em",
                            boxSizing: "border-box",
                            border: 0,
                            background: "transparent",
                            outline: "none",
                            padding: 0,
                            color: theme.textSecondaryColor,
                            fontSize: fsInputFontSize,
                            fontFamily: fs?.font?.fontFamily ?? "inherit",
                        }}
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        style={{
                            alignSelf: "stretch",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            // BE-106/BE-108: fixed slot, centered, no padding.
                            width: "3.5em",
                            boxSizing: "border-box",
                            color: theme.textSecondaryColor,
                            fontSize: fsInputFontSize,
                            fontFamily: fs?.font?.fontFamily ?? "inherit",
                        }}
                    >
                        +{country[2]}
                    </span>
                )}
                <input
                    ref={nationalRef}
                    id={fieldDomId}
                    className={hasError ? "be-input be-input-invalid" : "be-input"}
                    type="tel"
                    inputMode="tel"
                    style={{
                        ...inputBaseStyle,
                        flex: 1,
                        minWidth: 0,
                        // BE-109: the group owns the ONLY border — this input
                        // must never paint one. `border: undefined` drops the
                        // shared shorthand (whose error-time color flip used
                        // to resurrect a width, the BE-103 trap mirrored), and
                        // the lone constant borderWidth: 0 can never be reset
                        // by anything. Phone-only exception: every other
                        // field type keeps its own input border + radius.
                        border: undefined,
                        borderWidth: 0,
                        background: "transparent",
                        boxShadow: "none",
                        // BE-120: shared padding everywhere except the left —
                        // the typed digits sit flush against the dial slot.
                        paddingLeft: 0,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                    }}
                    value={national}
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    autoComplete="tel"
                    disabled={isSubmitting}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? errorDomId : undefined}
                    onChange={(e) => emitNational(e.target.value)}
                />
                </div>
                <input type="hidden" name={field.calFieldId || field.id} value={full} />
            </div>
            {open && typeof document !== "undefined"
                ? (ReactDOM.createPortal(
                      <div
                          ref={menuRef}
                          role="dialog"
                          aria-label={`${field.label} country code`}
                          style={{
                              ...menuSurfaceStyle,
                              padding: 4,
                              display: "flex",
                              flexDirection: "column",
                              overflow: "hidden",
                          }}
                      >
                          {/* BE-088: plain search row — icon + borderless input, no
                              box-in-box. Autofocus stays (typing works on
                              open); no visible ring (no be-input class). */}
                          <div
                              style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "8px 10px",
                                  flexShrink: 0,
                                  color: theme.textSecondaryColor,
                              }}
                          >
                              <svg
                                  aria-hidden="true"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  style={{ flexShrink: 0, display: "block" }}
                              >
                                  <circle cx="11" cy="11" r="7" />
                                  <path d="m20 20-3.5-3.5" />
                              </svg>
                              <input
                                  ref={searchRef}
                                  type="text"
                                  role="combobox"
                                  aria-expanded="true"
                                  aria-controls={listboxDomId}
                                  aria-activedescendant={
                                      filtered.length > 0
                                          ? `${listboxDomId}-option-${clampedActive}`
                                          : undefined
                                  }
                                  aria-label="Search countries"
                                  style={{
                                      flex: 1,
                                      minWidth: 0,
                                      border: 0,
                                      background: "transparent",
                                      color: optionTextColor,
                                      fontSize: fsInputFontSize,
                                      outline: "none",
                                      padding: 0,
                                  }}
                                  value={query}
                                  placeholder="Search countries"
                                  onChange={(e) => {
                                      setQuery(e.target.value)
                                      setActiveIndex(0)
                                  }}
                                  onKeyDown={handleSearchKeyDown}
                              />
                          </div>
                          <div
                              aria-hidden="true"
                              style={{
                                  height: 1,
                                  flexShrink: 0,
                                  background: theme.borderColor,
                                  margin: "4px 0",
                              }}
                          />
                          {filtered.length === 0 ? (
                              <div
                                  style={{
                                      padding: "10px 14px",
                                      fontSize: fsInputFontSize,
                                      color: theme.textSecondaryColor,
                                  }}
                              >
                                  No country found.
                              </div>
                          ) : (
                              <ul
                                  id={listboxDomId}
                                  role="listbox"
                                  tabIndex={-1}
                                  className="be-select-scroll"
                                  style={{
                                      margin: 0,
                                      padding: 0,
                                      listStyle: "none",
                                      flex: 1,
                                      minHeight: 0,
                                      overflowY: "auto",
                                      overscrollBehavior: "contain",
                                  }}
                              >
                                  {filtered.map((c, index) => {
                                      const isSelected = c[0] === iso
                                      const isActiveRow = index === clampedActive
                                      return (
                                          // biome-ignore lint/a11y/useFocusableInteractive: ARIA listbox option — focus stays in the search box via aria-activedescendant, options commit on pointerdown (rules 134/162).
                                          <li
                                              key={c[0]}
                                              id={`${listboxDomId}-option-${index}`}
                                              role="option"
                                              aria-selected={isSelected}
                                              onPointerDown={(event) => {
                                                  event.preventDefault()
                                                  commitCountry(index)
                                              }}
                                              onMouseEnter={() => setActiveIndex(index)}
                                              style={{
                                                  padding: fsPadding,
                                                  borderRadius: menuRowRadiusValue,
                                                  margin: 0,
                                                  listStyle: "none",
                                                  cursor: "pointer",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 8,
                                                  color: isSelected
                                                      ? selectedRowText
                                                      : optionTextColor,
                                                  background: isSelected
                                                      ? selectedRowSurface
                                                      : isActiveRow
                                                        ? withAlpha(optionTextColor, 0.06)
                                                        : "transparent",
                                                  transition: reducedMotion
                                                      ? "none"
                                                      : "background-color 0.15s ease",
                                              }}
                                          >
                                              <PhoneFlag key={c[0]} iso={c[0]} />
                                              <span style={{ flex: 1, minWidth: 0 }}>{c[1]}</span>
                                              <span
                                                  style={{
                                                      color: isSelected
                                                          ? selectedRowText
                                                          : theme.textSecondaryColor,
                                                  }}
                                              >
                                                  +{c[2]}
                                              </span>
                                          </li>
                                      )
                                  })}
                              </ul>
                          )}
                      </div>,
                      document.body
                  ) as unknown as React.ReactNode)
                : null}
        </div>
    )
})

const FieldRenderer = React.memo(function FieldRenderer(props: FieldRendererProps) {
    const {
        field,
        value,
        error,
        theme,
        borderRadius,
        onFieldChange,
        choiceGroupAriaLabel,
        isSubmitting = false,
        instanceId = "",
        globalFieldStyles,
    } = props

    const domIdPrefix = instanceId ? `${instanceId}-` : ""
    const fieldDomId = `${domIdPrefix}be-field-${field.id}`
    const errorDomId = `${domIdPrefix}be-error-${field.id}`

    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    useIsomorphicLayoutEffect(() => {
        if (field.fieldType !== "textarea") return
        const el = textareaRef.current
        if (!el) return
        const current = el.clientHeight
        const needed = Math.max(96, el.scrollHeight)
        if (needed > current) {
            el.style.height = `${needed}px`
        } else if (needed < current) {
            el.style.height = "auto"
            el.style.height = `${Math.max(96, el.scrollHeight)}px`
        }
    }, [value, field.fieldType])

    const opts: ChoiceOption[] = React.useMemo(
        () =>
            (field.options || []).map((opt, idx) => ({
                label: opt,
                value: field.optionValues?.[idx] ?? undefined,
                image: field.optionImages?.[idx] || undefined,
                description: field.optionDescriptions?.[idx] || undefined,
            })),
        [field.options, field.optionValues, field.optionImages, field.optionDescriptions]
    )
    const handleChoiceChange = React.useCallback(
        (value: string) => onFieldChange(field.id, value),
        [field.id, onFieldChange]
    )

    const isChoiceFieldType =
        CHOICE_FIELD_TYPES.includes(field.fieldType) || MULTI_PICK_TYPES.includes(field.fieldType)

    const variantStyles: FieldStyleOverrides | undefined =
        field.fieldType === "segmented"
            ? field.segmentedStyles
            : field.fieldType === "pills"
              ? field.pillsStyles
              : field.fieldType === "cards"
                ? field.cardsStyles
                : field.fieldType === "radio"
                  ? field.radioStyles
                  : undefined
    const fieldStyleOverrides: FieldStyleOverrides | undefined =
        field.fieldType === "checkbox" || field.fieldType === "checkboxgroup"
            ? field.checkStyles
            : field.fieldType === "select" || field.fieldType === "multiselect"
              ? field.choiceStyles
              : field.fieldType === "segmented" ||
                  field.fieldType === "pills" ||
                  field.fieldType === "cards" ||
                  field.fieldType === "radio"
                ? mergeStyleOverrides(field.choiceStyles, variantStyles)
                : field.styles
    const fs = mergeStyleOverrides(globalFieldStyles, normalizeStyleOverrides(fieldStyleOverrides))
    // SELECTED-STYLES (BE-024): nested subgroup first, flat legacy keys
    // keep winning for stored canvases, engine defaults last.
    const fsSelected = normalizeStyleOverrides(fs?.selected)
    const fsSelectedPaddingAxes = paddingAxesFrom(fsSelected?.padding ?? "")
    const firstSetColor = (...values: Array<string | undefined>): string | undefined => {
        for (const value of values) {
            if (typeof value === "string" && value.trim()) return value
        }
        return undefined
    }
    const fsSelectedBg = firstSetColor(fsSelected?.backgroundColor, fs?.selectedBackgroundColor)
    const fsSelectedText = firstSetColor(fsSelected?.textColor, fs?.selectedTextColor)
    const fsSelectedBorderColor = firstSetColor(
        fsSelected?.borderColor,
        fsSelected?.border?.borderColor,
        fs?.selectedBorderColor
    )
    const fsSelectedShadow = fsSelected?.shadow
    const fsOptionMuted = fs?.textColor ? withAlpha(fs.textColor, 0.6) : theme.textSecondaryColor

    const labelTextStyle: React.CSSProperties = {
        display: "block",
        fontSize: fontPixelSize(fs?.labelFont?.fontSize) ?? 13,
        fontWeight: fs?.labelFont?.fontWeight ?? 500,
        ...(fs?.labelFont?.fontFamily ? { fontFamily: fs.labelFont.fontFamily } : {}),
        ...(fs?.labelFont?.fontStyle ? { fontStyle: fs.labelFont.fontStyle } : {}),
        ...(fs?.labelFont?.letterSpacing != null
            ? { letterSpacing: fs.labelFont.letterSpacing }
            : {}),
        lineHeight: fs?.labelFont?.lineHeight ?? 1.6,
        color: fs?.labelColor ?? theme.textPrimaryColor,
    }
    const labelEl = isChoiceFieldType ? (
        <div style={labelTextStyle}>{field.label}</div>
    ) : (
        <label htmlFor={fieldDomId} style={labelTextStyle}>
            {field.label}
        </label>
    )

    const errorEl = error ? (
        <FieldErrorMessage domId={errorDomId} message={error} color={theme.errorColor} />
    ) : null

    // BE-052: canvas-only escalation for duplicate Primary-Name flags —
    // rendered at the exact field site, spaced by the column gap.
    const duplicatePrimaryNotice =
        field.duplicatePrimaryName && RenderTarget.current() === RenderTarget.canvas ? (
            <output
                style={{
                    display: "block",
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: theme.errorColor,
                }}
            >
                Duplicate "Name" — only the first flagged field is used as the booking
                attendee name. Remove this flag.
            </output>
        ) : null

    const containerStyle: React.CSSProperties = {
        // BE-091/BE-102: spans are config-only and width-agnostic — span 1 in
        // a single-track grid still fills the whole row, so no measurement is
        // ever needed here. Textarea always spans both tracks.
        gridColumn:
            field.fieldType === "textarea" || field.width !== "half" ? "span 2" : "span 1",
        display: "flex",
        flexDirection: "column",
        gap: fs?.spacing ?? 6,
        minWidth: 0,
    }

    const isCoarsePointer = useCoarsePointer()
    const inputFontSize = isCoarsePointer ? 16 : 14

    const reducedMotion = useReducedMotion() ?? false

    const fsFontSize = fontPixelSize(fs?.font?.fontSize)
    const fsInputFontSize = isCoarsePointer
        ? Math.max(16, fsFontSize ?? inputFontSize)
        : (fsFontSize ?? inputFontSize)
    const fsBorder = resolveFieldBorder(fs, field.fieldType)
    const fsRadius = resolveFieldRadius(fs, borderRadius, field.fieldType)
    const fsPadding = resolveFieldPadding(fs, field.fieldType)
    const inputBaseStyle: React.CSSProperties = {
        width: "100%",
        minHeight: fs?.minHeight ?? 23,
        padding: fsPadding,
        borderRadius: fsRadius,
        border: `${fsBorder.width}px ${fsBorder.style} ${
            error ? theme.errorColor : (fsBorder.color ?? theme.borderColor)
        }`,
        background: fs?.backgroundColor ?? theme.surfaceColor,
        color: fs?.textColor ?? theme.textPrimaryColor,
        fontFamily: fs?.font?.fontFamily ?? "inherit",
        fontSize: fsInputFontSize,
        ...(fs?.font?.fontWeight != null ? { fontWeight: fs.font.fontWeight } : {}),
        ...(fs?.font?.fontStyle ? { fontStyle: fs.font.fontStyle } : {}),
        ...(fs?.font?.letterSpacing != null ? { letterSpacing: fs.font.letterSpacing } : {}),
        ...(fs?.font?.lineHeight != null ? { lineHeight: fs.font.lineHeight } : {}),
        boxSizing: "border-box",
        ...(fs?.placeholderColor
            ? ({ "--be-ph-color": fs.placeholderColor } as React.CSSProperties)
            : {}),
        ...(fs?.focusBorderColor
            ? ({ "--be-focus-color": fs.focusBorderColor } as React.CSSProperties)
            : {}),
        ...shadowStyle(fs?.shadow),
        transition: reducedMotion ? "none" : "border-color 0.15s ease, box-shadow 0.15s ease",
    }

    switch (field.fieldType) {
        case "calendar-widget":
            return null
        case "textarea":
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    <textarea
                        id={fieldDomId}
                        name={field.calFieldId || field.id}
                        className={error ? "be-input be-input-invalid" : "be-input"}
                        value={typeof value === "string" ? value : ""}
                        placeholder={field.placeholder || ""}
                        required={field.required}
                        autoComplete={autocompleteToken(field)}
                        disabled={isSubmitting}
                        onChange={(e) => onFieldChange(field.id, e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorDomId : undefined}
                        rows={typeof field.rows === "number" && field.rows > 0 ? field.rows : 4}
                        ref={textareaRef}
                        style={{
                            ...inputBaseStyle,
                            minHeight: fs?.minHeight ?? 23,
                            resize: "vertical",
                            fontFamily: fs?.font?.fontFamily ?? "inherit",
                        }}
                    />
                    {errorEl}
                </div>
            )
        case "select":
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    <SelectFieldControl
                        field={field}
                        opts={opts}
                        value={
                            typeof value === "string" || typeof value === "boolean"
                                ? value
                                : undefined
                        }
                        hasError={!!error}
                        isSubmitting={isSubmitting}
                        onFieldChange={onFieldChange}
                        fs={fs}
                        inputBaseStyle={inputBaseStyle}
                        fsInputFontSize={fsInputFontSize}
                        fsPadding={fsPadding}
                        fsRadius={fsRadius}
                        fsBorder={fsBorder}
                        theme={theme}
                        fieldDomId={fieldDomId}
                        errorDomId={errorDomId}
                        reducedMotion={reducedMotion}
                    />
                    {errorEl}
                </div>
            )
        case "multiselect":
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    <MultiSelectFieldControl
                        field={field}
                        opts={opts}
                        value={value}
                        hasError={!!error}
                        isSubmitting={isSubmitting}
                        onFieldChange={onFieldChange}
                        fs={fs}
                        inputBaseStyle={inputBaseStyle}
                        fsInputFontSize={fsInputFontSize}
                        fsPadding={fsPadding}
                        fsRadius={fsRadius}
                        fsBorder={fsBorder}
                        theme={theme}
                        fieldDomId={fieldDomId}
                        errorDomId={errorDomId}
                        reducedMotion={reducedMotion}
                    />
                    {errorEl}
                </div>
            )
        case "segmented":
        case "pills":
        case "cards":
        case "radio": {
            const variant =
                field.fieldType === "pills"
                    ? "pills"
                    : field.fieldType === "segmented"
                      ? "segmented"
                      : field.fieldType === "radio"
                        ? "radio"
                        : "cards"
            const fsPaddingAxes = fs?.padding ? paddingAxesFrom(fs.padding) : null
            const fsAuthorRadius =
                typeof fs?.radius === "string" || typeof fs?.radius === "number"
                    ? resolveFieldRadius(fs, borderRadius, field.fieldType)
                    : undefined
            const fsAuthorBorderWidth = fs?.border ? fsBorder.width : fs?.borderWidth
            return (
                <div
                    style={{
                        ...containerStyle,
                        border: error ? `1px solid ${theme.errorColor}` : "none",
                        borderRadius: error ? borderRadius : 0,
                        padding: error ? 6 : 0,
                    }}
                    data-field-id={field.id}
                >
                    {labelEl}
                    <ChoiceGroupInline
                        label={field.label}
                        showLabel={false}
                        inputName={field.id}
                        variant={variant}
                        optionsText=""
                        options={opts}
                        accentColor={theme.accentColor}
                        accentForegroundColor={theme.accentForegroundColor}
                        textColor={fs?.textColor ?? theme.textPrimaryColor}
                        mutedTextColor={fsOptionMuted}
                        backgroundColor={fs?.backgroundColor ?? theme.surfaceColor}
                        borderColor={fsBorder.color ?? theme.borderColor}
                        radius={resolveFieldRadius(fs, borderRadius, field.fieldType)}
                        fontSize={fontPixelSize(fs?.font?.fontSize) ?? 14}
                        selectedBackgroundColor={fsSelectedBg}
                        selectedTextColor={fsSelectedText}
                        selectedBorderColor={fsSelectedBorderColor}
                        selectedBorderWidth={fsSelected?.border?.borderWidth}
                        selectedBorderStyle={fsSelected?.border?.borderStyle}
                        selectedRadius={fsSelected?.radius}
                        selectedPaddingY={fsSelectedPaddingAxes?.y}
                        selectedPaddingX={fsSelectedPaddingAxes?.x}
                        selectedFont={fsSelected?.font}
                        selectedShadow={fsSelectedShadow}
                        optionHoverBorderColor={fsSelectedBorderColor ?? fsSelectedBg}
                        optionBorderWidth={fsAuthorBorderWidth}
                        optionRadius={fsAuthorRadius}
                        optionPaddingY={fsPaddingAxes?.y ?? fs?.paddingY}
                        optionPaddingX={fsPaddingAxes?.x ?? fs?.paddingX}
                        optionMinHeight={fs?.minHeight}
                        optionFont={fs?.font}
                        optionShadow={fs?.shadow}
                        trackBackground={fs?.backgroundColor}
                        fillRow={field.width !== "half"}
                        controlledValue={typeof value === "string" ? value : undefined}
                        ariaInvalid={!!error}
                        ariaDescribedBy={error ? errorDomId : undefined}
                        onChange={handleChoiceChange}
                        choiceGroupAriaLabel={choiceGroupAriaLabel}
                        required={field.required}
                        isSubmitting={isSubmitting}
                    />
                    {errorEl}
                </div>
            )
        }
        case "checkbox": {
            const checked = Boolean(value)
            const checkAccent = fs?.accentColor ?? theme.accentColor
            // CHECK-SIZE (BE-025): field-level control first, legacy
            // carriers keep winning for stored canvases.
            const checkSize = field.checkSize ?? fs?.checkSize ?? FIELD_STYLES_CHECK_SIZE
            const checkLabelStyle: React.CSSProperties = {
                fontSize: fontPixelSize(fs?.labelFont?.fontSize) ?? 14,
                fontWeight: fs?.labelFont?.fontWeight ?? 400,
                ...(fs?.labelFont?.fontFamily ? { fontFamily: fs.labelFont.fontFamily } : {}),
                ...(fs?.labelFont?.fontStyle ? { fontStyle: fs.labelFont.fontStyle } : {}),
                ...(fs?.labelFont?.letterSpacing != null
                    ? { letterSpacing: fs.labelFont.letterSpacing }
                    : {}),
                ...(fs?.labelFont?.lineHeight != null
                    ? { lineHeight: fs.labelFont.lineHeight }
                    : {}),
                color: fs?.labelColor ?? theme.textPrimaryColor,
            }
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            cursor: "pointer",
                            lineHeight: 1.4,
                            ...checkLabelStyle,
                            minHeight: TOUCH_TARGET_MIN,
                            opacity: isSubmitting ? 0.5 : 1,
                            ...(isSubmitting ? { cursor: "not-allowed" } : {}),
                        }}
                    >
                        <input
                            type="checkbox"
                            name={field.calFieldId || field.id}
                            checked={checked}
                            required={field.required}
                            disabled={isSubmitting}
                            onChange={(e) => onFieldChange(field.id, e.target.checked)}
                            aria-invalid={!!error}
                            aria-describedby={error ? errorDomId : undefined}
                            style={{
                                marginTop: 2,
                                width: checkSize,
                                height: checkSize,
                                accentColor: checkAccent,
                                cursor: "pointer",
                                ...shadowStyle(fs?.shadow),
                            }}
                        />
                        <span>{field.label}</span>
                    </label>
                    {errorEl}
                </div>
            )
        }
        case "checkboxgroup": {
            // BE-056: native checkbox list (one input per option). Values are a
            // string array; single `checkbox` stays boolean forever.
            const picked: Array<string> = Array.isArray(value) ? [...new Set(value)] : []
            const pickedSet = new Set(picked)
            const checkAccent = fs?.accentColor ?? theme.accentColor
            const checkSize = field.checkSize ?? fs?.checkSize ?? FIELD_STYLES_CHECK_SIZE
            const checkLabelStyle: React.CSSProperties = {
                fontSize: fontPixelSize(fs?.labelFont?.fontSize) ?? 14,
                fontWeight: fs?.labelFont?.fontWeight ?? 400,
                ...(fs?.labelFont?.fontFamily ? { fontFamily: fs.labelFont.fontFamily } : {}),
                ...(fs?.labelFont?.fontStyle ? { fontStyle: fs.labelFont.fontStyle } : {}),
                ...(fs?.labelFont?.letterSpacing != null
                    ? { letterSpacing: fs.labelFont.letterSpacing }
                    : {}),
                color: fs?.labelColor ?? theme.textPrimaryColor,
            }
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    <fieldset
                        aria-label={field.label}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorDomId : undefined}
                        disabled={isSubmitting || undefined}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            border: 0,
                            margin: 0,
                            padding: 0,
                            minWidth: 0,
                        }}
                    >
                        {opts.map((opt, idx) => {
                            const v = optionValue(opt)
                            const checked = pickedSet.has(v)
                            return (
                                <label
                                    key={`${v}-${idx}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 10,
                                        cursor: isSubmitting ? "not-allowed" : "pointer",
                                        lineHeight: 1.4,
                                        ...checkLabelStyle,
                                        minHeight: TOUCH_TARGET_MIN,
                                        opacity: isSubmitting ? 0.5 : 1,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        name={field.calFieldId || field.id}
                                        value={v}
                                        checked={checked}
                                        disabled={isSubmitting}
                                        onChange={() => {
                                            const next = checked
                                                ? picked.filter((item) => item !== v)
                                                : [...picked, v]
                                            onFieldChange(field.id, next)
                                        }}
                                        style={{
                                            marginTop: 2,
                                            width: checkSize,
                                            height: checkSize,
                                            accentColor: checkAccent,
                                            cursor: isSubmitting ? "not-allowed" : "pointer",
                                            ...shadowStyle(fs?.shadow),
                                        }}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            )
                        })}
                    </fieldset>
                    {errorEl}
                </div>
            )
        }
        case "phone":
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    {duplicatePrimaryNotice}
                    <PhoneFieldControl
                        field={field}
                        value={
                            typeof value === "string" || typeof value === "boolean"
                                ? value
                                : undefined
                        }
                        hasError={!!error}
                        isSubmitting={isSubmitting}
                        onFieldChange={onFieldChange}
                        fs={fs}
                        inputBaseStyle={inputBaseStyle}
                        fsInputFontSize={fsInputFontSize}
                        fsPadding={fsPadding}
                        fsRadius={fsRadius}
                        fsBorder={fsBorder}
                        theme={theme}
                        fieldDomId={fieldDomId}
                        errorDomId={errorDomId}
                        reducedMotion={reducedMotion}
                    />
                    {errorEl}
                </div>
            )
        default:
            return (
                <div style={containerStyle} data-field-id={field.id}>
                    {labelEl}
                    {duplicatePrimaryNotice}
                    <input
                        id={fieldDomId}
                        name={field.calFieldId || field.id}
                        className={error ? "be-input be-input-invalid" : "be-input"}
                        type={
                            field.fieldType === "email"
                                ? "email"
                                : field.fieldType === "url"
                                  ? "url"
                                  : "text"
                        }
                        inputMode={
                            field.fieldType === "email"
                                ? "email"
                                : field.fieldType === "number"
                                  ? "decimal"
                                  : field.fieldType === "url"
                                    ? "url"
                                    : undefined
                        }
                        value={typeof value === "string" ? value : ""}
                        placeholder={field.placeholder || ""}
                        required={field.required}
                        autoComplete={autocompleteToken(field)}
                        disabled={isSubmitting}
                        onChange={(e) =>
                            onFieldChange(
                                field.id,
                                field.fieldType === "number"
                                    ? sanitizeNumberInput(e.target.value)
                                    : e.target.value
                            )
                        }
                        onBlur={
                            field.fieldType === "number"
                                ? (e) => {
                                      // BE-100: Cal.com's blur cleanup for
                                      // legacy/pasted plus signs (typing can
                                      // never produce one). Value-only; the
                                      // error surface follows the normal flow.
                                      const next = normalizeNumberOnBlur(e.target.value)
                                      if (next !== e.target.value) {
                                          onFieldChange(field.id, next)
                                      }
                                  }
                                : undefined
                        }
                        aria-invalid={!!error}
                        aria-describedby={error ? errorDomId : undefined}
                        style={inputBaseStyle}
                    />
                    {errorEl}
                </div>
            )
    }
})

const CALENDAR_MENU_MIN_WIDTH = 224
const CALENDAR_MENU_Z_INDEX = SELECT_MENU_Z_INDEX

interface CalendarExportOption {
    id: "google" | "office" | "outlook" | "other" | "manage"
    label: string
    href: string
    download?: string
}

function CalendarProviderIcon(props: { id: CalendarExportOption["id"] }) {
    const { id } = props
    const common = {
        width: 20,
        height: 20,
        viewBox: "0 0 20 20",
        "aria-hidden": true,
        focusable: "false" as const,
        style: { flexShrink: 0, display: "block" as const },
    }
    if (id === "google") {
        return (
            /* biome-ignore lint/a11y/noSvgWithoutTitle: decorative aria-hidden brand mark — the menu row label is the single name. */
            <svg {...common} width={20} height={20} viewBox="0 0 192 192" fill="none">
                <path
                    fill="#bbe2ff"
                    d="M32 36.8C32 20.894 44.894 8 60.8 8h70.4C147.106 8 160 20.894 160 36.8v30.4c0 15.906-12.894 28.8-28.8 28.8H60.8C44.894 96 32 83.106 32 67.2z"
                />
                <path
                    fill="#3c90ff"
                    d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z"
                />
                <mask
                    id="gcal-a"
                    width="154"
                    height="152"
                    x="19"
                    y="20"
                    maskUnits="userSpaceOnUse"
                    style={{ maskType: "alpha" }}
                >
                    <path
                        fill="#3c90ff"
                        d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z"
                    />
                </mask>
                <g mask="url(#gcal-a)">
                    <path
                        fill="url(#gcal-b)"
                        d="M0 0h166v76H0z"
                        transform="matrix(1 0 0 -1 13 172)"
                    />
                </g>
                <mask
                    id="gcal-c"
                    width="154"
                    height="152"
                    x="19"
                    y="20"
                    maskUnits="userSpaceOnUse"
                    style={{ maskType: "alpha" }}
                >
                    <path
                        fill="#3186ff"
                        d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z"
                    />
                </mask>
                <g mask="url(#gcal-c)">
                    <path
                        fill="url(#gcal-d)"
                        d="M32 27.2C32 16.596 40.596 8 51.2 8h89.6c10.604 0 19.2 8.596 19.2 19.2V96H32z"
                        filter="url(#gcal-e)"
                    />
                </g>
                <path
                    fill="#fff"
                    d="M75.353 133.336q-6.282 0-10.777-2.043t-7.61-5.465q-3.065-3.474-4.342-6.793T51.603 115a2.07 2.07 0 0 1 1.021-1.124l5.67-2.247q.714-.357 1.43-.102.714.204 1.685 2.349 1.022 2.145 2.86 4.546a14.3 14.3 0 0 0 4.495 3.728q2.606 1.328 6.435 1.328 6.18 0 9.807-3.575 3.677-3.575 3.677-9.091 0-5.976-3.882-9.194-3.881-3.269-10.266-3.269h-5.362a1.9 1.9 0 0 1-1.328-.51q-.51-.562-.511-1.277v-5.465q0-.767.51-1.277a1.82 1.82 0 0 1 1.329-.562h4.647q5.721 0 9.194-3.116t3.473-8.07q0-4.902-3.116-7.916t-8.58-3.014q-3.065 0-5.312 1.022a11.5 11.5 0 0 0-3.882 2.86 22.7 22.7 0 0 0-2.809 3.78q-1.174 1.941-1.89 2.145-.714.153-1.379-.255l-5.363-2.605q-.664-.358-.868-1.124t1.226-3.575q1.481-2.86 4.494-5.823a21 21 0 0 1 7.049-4.597q4.035-1.635 9.398-1.634 9.96 0 15.782 5.26 5.823 5.21 5.823 13.791 0 5.925-2.86 10.266-2.81 4.34-7.968 6.13v.204q6.231 1.838 9.806 6.741 3.627 4.853 3.626 11.594 0 9.654-6.742 15.834-6.74 6.18-17.57 6.18zm51.25-1.175q-.868 0-1.533-.664a2.25 2.25 0 0 1-.612-1.583V73.118l-11.492 8.274q-.614.46-1.431.307a1.96 1.96 0 0 1-1.225-.766l-3.32-4.7a1.98 1.98 0 0 1-.358-1.43q.153-.816.817-1.276l20.379-14.557q.256-.204.562-.306.307-.153.715-.153h4.291q.868 0 1.379.613.562.56.562 1.43v69.36q0 .92-.664 1.583a2 2 0 0 1-1.533.664z"
                />
                <defs>
                    <linearGradient
                        id="gcal-b"
                        x1="83"
                        x2="83"
                        y1="76"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#4fa0ff" />
                        <stop offset="1" stopColor="#3186ff" />
                    </linearGradient>
                    <linearGradient
                        id="gcal-d"
                        x1="89.06"
                        x2="89.06"
                        y1="21.75"
                        y2="96.39"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#a9a8ff" />
                        <stop offset=".8" stopColor="#3c90ff" />
                    </linearGradient>
                    <filter
                        id="gcal-e"
                        width="152"
                        height="112"
                        x="20"
                        y="-4"
                        colorInterpolationFilters="sRGB"
                        filterUnits="userSpaceOnUse"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                        <feGaussianBlur
                            result="effect1_foregroundBlur_37330_7673"
                            stdDeviation="6"
                        />
                    </filter>
                </defs>
            </svg>
        )
    }
    if (id === "office") {
        return (
            /* biome-ignore lint/a11y/noSvgWithoutTitle: decorative aria-hidden brand mark — the menu row label is the single name. */
            <svg {...common} width={20} height={20} viewBox="0 0 78.799 96">
                <defs>
                    <linearGradient
                        id="msof-a"
                        gradientUnits="userSpaceOnUse"
                        x1="16.942"
                        x2="85.671"
                        y1="83.36"
                        y2="89.583"
                    >
                        <stop offset="0" stopColor="#f32b44" />
                        <stop offset=".6" stopColor="#a4070a" />
                    </linearGradient>
                    <linearGradient id="msof-b">
                        <stop offset="0" stopOpacity=".4" />
                        <stop offset="1" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient
                        id="msof-c"
                        gradientUnits="userSpaceOnUse"
                        x1="63.515"
                        x2="33.003"
                        href="#msof-b"
                        y1="87.298"
                        y2="84.535"
                    />
                    <linearGradient
                        id="msof-d"
                        gradientUnits="userSpaceOnUse"
                        x1="44.738"
                        x2="-5.901"
                        y1="-3.312"
                        y2="71.527"
                    >
                        <stop offset="0" stopColor="#800600" />
                        <stop offset=".6" stopColor="#c72127" />
                        <stop offset=".728" stopColor="#c13959" />
                        <stop offset=".847" stopColor="#bc4b81" />
                        <stop offset=".942" stopColor="#b95799" />
                        <stop offset="1" stopColor="#b85ba2" />
                    </linearGradient>
                    <linearGradient
                        id="msof-e"
                        gradientUnits="userSpaceOnUse"
                        x1="45.823"
                        x2="35.099"
                        href="#msof-b"
                        y1="-4.81"
                        y2="11.039"
                    />
                    <linearGradient
                        id="msof-f"
                        gradientUnits="userSpaceOnUse"
                        x1="61.486"
                        x2="61.486"
                        y1="-4.887"
                        y2="88.781"
                    >
                        <stop offset="0" stopColor="#ffb900" />
                        <stop offset=".166" stopColor="#ef8400" />
                        <stop offset=".313" stopColor="#e25c01" />
                        <stop offset=".429" stopColor="#db4401" />
                        <stop offset=".5" stopColor="#d83b01" />
                    </linearGradient>
                </defs>
                <path
                    d="m19.143 75.558c-2.724 0-4.945 2.121-4.945 4.753 0 1.789 1.031 3.322 2.565 4.14l19.118 10.246a10.11 10.11 0 0 0 4.969 1.303c1.164 0 2.275-.204 3.306-.562l6.531-1.814v-18.091c.027.025-31.519.025-31.545.025z"
                    fill="url(#msof-a)"
                />
                <path
                    d="m19.143 75.558c-2.724 0-4.945 2.121-4.945 4.753 0 1.789 1.031 3.322 2.565 4.14l19.118 10.246a10.11 10.11 0 0 0 4.969 1.303c1.164 0 2.275-.204 3.306-.562l6.531-1.814v-18.091c.027.025-31.519.025-31.545.025z"
                    fill="url(#msof-c)"
                />
                <path
                    d="m43.736.383a9.968 9.968 0 0 0 -2.777-.383c-1.56 0-3.12.307-4.522 1.022-.29.128-31.096 16.864-31.096 16.864-.423.205-.82.46-1.19.716-.052.025-.079.051-.132.077-.238.178-.45.357-.687.536-.106.077-.212.18-.291.256-.132.127-.265.255-.37.383-.37.383-1.005 1.2-1.005 1.2a9.15 9.15 0 0 0 -1.666 5.291v44.46c0 2.633 2.221 4.754 4.945 4.754.687 0 1.322-.128 1.904-.384l8.805-4.778c1.586-.766 2.856-2.07 3.517-3.68.158-.332.29-.74.37-1.15.026-.102.053-.23.053-.332 0-.05.026-.127.026-.178.027-.18.053-.384.053-.562 0-.154.027-.282.027-.435v-23.662-7.385c0-2.07.925-3.935 2.38-5.238 0 0-.688.613 0 0 .687-.613 1.586-1.15 2.644-1.507 1.057-.384 26.072-9.122 26.072-9.122v-14.744z"
                    fill="url(#msof-d)"
                />
                <path
                    d="m43.736.383a9.968 9.968 0 0 0 -2.777-.383c-1.56 0-3.12.307-4.522 1.022-.29.128-31.096 16.864-31.096 16.864-.423.205-.82.46-1.19.716-.052.025-.079.051-.132.077-.238.178-.45.357-.687.536-.106.077-.212.18-.291.256-.132.127-.265.255-.37.383-.37.383-1.005 1.2-1.005 1.2a9.15 9.15 0 0 0 -1.666 5.291v44.46c0 2.633 2.221 4.754 4.945 4.754.687 0 1.322-.128 1.904-.384l8.805-4.778c1.586-.766 2.856-2.07 3.517-3.68.158-.332.29-.74.37-1.15.026-.102.053-.23.053-.332 0-.05.026-.127.026-.178.027-.18.053-.384.053-.562 0-.154.027-.282.027-.435v-23.662-7.385c0-2.07.925-3.935 2.38-5.238 0 0-.688.613 0 0 .687-.613 1.586-1.15 2.644-1.507 1.057-.384 26.072-9.122 26.072-9.122v-14.744z"
                    fill="url(#msof-e)"
                />
                <path
                    d="m71.898 8.35-27.738-7.843c4.019 1.508 6.53 4.906 6.53 9.046 0 0-.025 75.2 0 77.014.027 4.088-2.67 7.589-6.53 8.892.846-.23 27.738-7.717 27.738-7.717 3.992-1.226 6.875-4.804 6.875-9.07v-61.252c.026-4.24-2.883-7.844-6.875-9.07z"
                    fill="url(#msof-f)"
                />
            </svg>
        )
    }
    if (id === "outlook") {
        return (
            /* biome-ignore lint/a11y/noSvgWithoutTitle: decorative aria-hidden brand mark — the menu row label is the single name. */
            <svg {...common} width={20} height={20} viewBox="60 90.4 570.02 539.67">
                <defs>
                    <linearGradient
                        id="msol-a"
                        x1="9.989"
                        x2="30.932"
                        y1="22.365"
                        y2="9.375"
                        gradientTransform="scale(15)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0" stopColor="#20a7fa" stopOpacity="1" />
                        <stop offset=".4" stopColor="#3bd5ff" stopOpacity="1" />
                        <stop offset="1" stopColor="#c4b0ff" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient
                        id="msol-b"
                        x1="17.197"
                        x2="28.856"
                        y1="26.794"
                        y2="8.126"
                        gradientTransform="scale(15)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0" stopColor="#165ad9" stopOpacity="1" />
                        <stop offset=".501" stopColor="#1880e5" stopOpacity="1" />
                        <stop offset="1" stopColor="#8587ff" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient
                        id="msol-c"
                        x1="25.701"
                        x2="12.756"
                        y1="27.048"
                        y2="16.501"
                        gradientTransform="scale(15)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset=".237" stopColor="#448aff" stopOpacity="0" />
                        <stop offset=".792" stopColor="#0032b1" stopOpacity=".2" />
                    </linearGradient>
                    <linearGradient
                        id="msol-d"
                        x1="24.053"
                        x2="44.51"
                        y1="31.11"
                        y2="18.018"
                        gradientTransform="scale(15)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0" stopColor="#1a43a6" stopOpacity="1" />
                        <stop offset=".492" stopColor="#2052cb" stopOpacity="1" />
                        <stop offset="1" stopColor="#5f20cb" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient
                        id="msol-e"
                        x1="29.828"
                        x2="17.397"
                        y1="30.327"
                        y2="19.571"
                        gradientTransform="scale(15)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0" stopColor="#0045b9" stopOpacity="0" />
                        <stop offset=".67" stopColor="#0d1f69" stopOpacity=".2" />
                    </linearGradient>
                    <linearGradient
                        id="msol-g"
                        x1="41.998"
                        x2="23.852"
                        y1="29.943"
                        y2="29.943"
                        gradientTransform="scale(15)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0" stopColor="#4dc4ff" stopOpacity="1" />
                        <stop offset=".196" stopColor="#0fafff" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient
                        id="msol-k"
                        x1="3.458"
                        x2="20.929"
                        y1="37.872"
                        y2="37.86"
                        gradientTransform="scale(15)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset=".206" stopColor="#6ce0ff" stopOpacity="1" />
                        <stop offset=".535" stopColor="#50d5ff" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient
                        id="msol-f"
                        cx="0"
                        cy="0"
                        r="1"
                        fx="0"
                        fy="0"
                        gradientTransform="matrix(0 -405.04051 438.393 0 360.027 102.268)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset=".568" stopColor="#275ff0" stopOpacity="0" />
                        <stop offset=".992" stopColor="#002177" stopOpacity="1" />
                    </radialGradient>
                    <radialGradient
                        id="msol-h"
                        cx="0"
                        cy="0"
                        r="1"
                        fx="0"
                        fy="0"
                        gradientTransform="scale(173.58) rotate(-45 5.168 -1.292)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset=".259" stopColor="#0060d1" stopOpacity=".4" />
                        <stop offset=".908" stopColor="#0383f1" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient
                        id="msol-i"
                        cx="0"
                        cy="0"
                        r="1"
                        fx="0"
                        fy="0"
                        gradientTransform="matrix(357.40702 -468.44593 423.59457 323.18709 159.471 697.08)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset=".732" stopColor="#f4a7f7" stopOpacity="0" />
                        <stop offset="1" stopColor="#f4a7f7" stopOpacity=".501961" />
                    </radialGradient>
                    <radialGradient
                        id="msol-j"
                        cx="0"
                        cy="0"
                        r="1"
                        fx="0"
                        fy="0"
                        gradientTransform="matrix(-170.86087 259.7254 -674.01813 -443.40415 278.562 412.979)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0" stopColor="#49deff" stopOpacity="1" />
                        <stop offset=".724" stopColor="#29c3ff" stopOpacity="1" />
                    </radialGradient>
                    <radialGradient
                        id="msol-l"
                        cx="0"
                        cy="0"
                        r="1"
                        fx="0"
                        fy="0"
                        gradientTransform="rotate(46.924 -378.504 245.25) scale(315.927)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset=".039" stopColor="#0091ff" stopOpacity="1" />
                        <stop offset=".919" stopColor="#183dad" stopOpacity="1" />
                    </radialGradient>
                    <radialGradient
                        id="msol-m"
                        cx="0"
                        cy="0"
                        r="1"
                        fx="0"
                        fy="0"
                        gradientTransform="matrix(0 168 -193.782 0 180 491.159)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset=".558" stopColor="#0fa5f7" stopOpacity="0" />
                        <stop offset="1" stopColor="#74c6ff" stopOpacity=".501961" />
                    </radialGradient>
                </defs>
                <path
                    d="m463.984 140.145-344.347 218.27-29.614-46.72v-40.257a43.26 43.26 0 0 1 19.72-36.293L309.91 105.258c30.496-19.79 69.777-19.793 100.277-.008Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-a)"
                />
                <path
                    d="M407.102 103.34a91.293 91.293 0 0 1 3.082 1.914l156.214 101.332-387.336 245.52-59.437-93.77L403.895 177.8c26.925-17.102 28.105-55.57 3.207-74.461Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-b)"
                />
                <path
                    d="M407.102 103.34a91.293 91.293 0 0 1 3.082 1.914l156.214 101.332-387.336 245.52-59.437-93.77L403.895 177.8c26.925-17.102 28.105-55.57 3.207-74.461Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-c)"
                />
                <path
                    d="M333.602 498.988 179.066 452.11 507.63 243.836c27.672-17.54 27.601-57.938-.133-75.379l-1.48-.93 4.261 2.649 99.996 64.867a43.263 43.263 0 0 1 19.723 36.3v38.962Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-d)"
                />
                <path
                    d="M333.602 498.988 179.066 452.11 507.63 243.836c27.672-17.54 27.601-57.938-.133-75.379l-1.48-.93 4.261 2.649 99.996 64.867a43.263 43.263 0 0 1 19.723 36.3v38.962Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-e)"
                />
                <path
                    d="M410.188 105.25c-30.5-19.785-69.782-19.781-100.282.008L109.742 235.145a43.26 43.26 0 0 0-19.719 36.292v1.97a44.479 44.479 0 0 0 20.735 36.16l248.887 156.91L609.16 309.805a44.468 44.468 0 0 0 20.824-37.664v38.168l.008-38.965c0-14.66-7.426-28.32-19.722-36.301Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-f)"
                />
                <path
                    d="M315.77 630.05h220.449c51.777 0 93.75-41.972 93.75-93.75V272.14c0 15.301-7.864 29.528-20.82 37.665l-327.907 205.89a60.712 60.712 0 0 0-28.422 51.414c.004 34.762 28.184 62.942 62.95 62.942Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-g)"
                />
                <path
                    d="M315.77 630.05h220.449c51.777 0 93.75-41.972 93.75-93.75V272.14c0 15.301-7.864 29.528-20.82 37.665l-327.907 205.89a60.712 60.712 0 0 0-28.422 51.414c.004 34.762 28.184 62.942 62.95 62.942Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-h)"
                />
                <path
                    d="M315.77 630.05h220.449c51.777 0 93.75-41.972 93.75-93.75V272.14c0 15.301-7.864 29.528-20.82 37.665l-327.907 205.89a60.712 60.712 0 0 0-28.422 51.414c.004 34.762 28.184 62.942 62.95 62.942Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-i)"
                />
                <path
                    d="M405.402 630.035H183.738c-51.777 0-93.75-41.972-93.75-93.75v-264.34a44.473 44.473 0 0 0 20.754 37.621l327.582 206.52a61.737 61.737 0 0 1 28.809 52.226c-.004 34.09-27.64 61.723-61.73 61.723Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-j)"
                />
                <path
                    d="M405.402 630.035H183.738c-51.777 0-93.75-41.972-93.75-93.75v-264.34a44.473 44.473 0 0 0 20.754 37.621l327.582 206.52a61.737 61.737 0 0 1 28.809 52.226c-.004 34.09-27.64 61.723-61.73 61.723Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-k)"
                />
                <path
                    d="M108.75 345h142.5c26.926 0 48.75 21.824 48.75 48.75v142.5c0 26.926-21.824 48.75-48.75 48.75h-142.5C81.824 585 60 563.176 60 536.25v-142.5C60 366.824 81.824 345 108.75 345Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-l)"
                />
                <path
                    d="M108.75 345h142.5c26.926 0 48.75 21.824 48.75 48.75v142.5c0 26.926-21.824 48.75-48.75 48.75h-142.5C81.824 585 60 563.176 60 536.25v-142.5C60 366.824 81.824 345 108.75 345Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="url(#msol-m)"
                />
                <path
                    d="M179.387 534c-19.848 0-36.137-6.21-48.875-18.625-12.739-12.414-19.11-28.617-19.11-48.605 0-21.11 6.465-38.18 19.395-51.22C143.73 402.517 160.66 396 181.594 396c19.781 0 35.879 6.238 48.297 18.715 12.484 12.476 18.726 28.93 18.726 49.351 0 20.985-6.469 37.899-19.398 50.75C216.352 527.606 199.742 534 179.387 534Zm.574-26.352c10.816 0 19.523-3.695 26.117-11.082 6.594-7.386 9.89-17.664 9.89-30.824 0-13.719-3.202-24.394-9.6-32.031-6.403-7.637-14.95-11.453-25.638-11.453-11.011 0-19.878 3.941-26.597 11.824-6.723 7.824-10.082 18.191-10.082 31.102 0 13.101 3.36 23.468 10.082 31.101 6.719 7.574 15.328 11.363 25.828 11.363Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="#fff"
                    fillOpacity={1}
                />
                <path
                    d="M179.332 535.848c-19.77 0-36-6.375-48.691-19.13-12.688-12.753-19.036-29.398-19.036-49.929 0-21.684 6.442-39.219 19.325-52.61 12.882-13.394 29.75-20.09 50.601-20.09 19.703 0 35.742 6.411 48.114 19.227 12.437 12.82 18.652 29.72 18.652 50.7 0 21.55-6.442 38.93-19.32 52.129-12.82 13.136-29.368 19.703-49.645 19.703Zm.57-27.067c10.778 0 19.453-3.797 26.02-11.383 6.57-7.59 9.851-18.144 9.851-31.664 0-14.093-3.187-25.058-9.562-32.902-6.379-7.844-14.89-11.766-25.54-11.766-10.972 0-19.804 4.047-26.5 12.149-6.694 8.031-10.042 18.683-10.042 31.945 0 13.457 3.348 24.106 10.043 31.95 6.695 7.78 15.273 11.671 25.73 11.671Zm0 0"
                    stroke="none"
                    fillRule="nonzero"
                    fill="#fff"
                    fillOpacity={1}
                />
            </svg>
        )
    }
    if (id === "manage") {
        return (
            /* biome-ignore lint/a11y/noSvgWithoutTitle: decorative aria-hidden glyph — the menu row label is the single name. */
            <svg {...common} width={20} height={20} viewBox="0 0 20 20" fill="none">
                <path
                    d="M8 4H4v12h12v-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 4h4v4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M16 4l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            </svg>
        )
    }
    return (
        /* biome-ignore lint/a11y/noSvgWithoutTitle: decorative aria-hidden fallback glyph — adjacent text is the single name. */
        <svg {...common}>
            <rect
                x="2"
                y="4.5"
                width="16"
                height="13.5"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M2 8.25h16M6.5 3v3M13.5 3v3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M10 10.2v4.6M8.1 13l1.9 1.9 1.9-1.9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    )
}

interface CalendarExportMenuProps {
    triggerLabel: string
    triggerStyle: React.CSSProperties
    triggerHover?: ButtonInteractionState
    triggerPressed?: ButtonInteractionState
    animateInteractions: boolean
    options: CalendarExportOption[]
    calendarLinkSet: ButtonStyleGroup | undefined
    surfaceColor: string
    textPrimaryColor: string
    textSecondaryColor: string
    borderColor: string
    borderRadius: string | number
    reducedMotion: boolean
}

const CalendarExportMenu = React.memo(function CalendarExportMenu(props: CalendarExportMenuProps) {
    const {
        triggerLabel,
        triggerStyle,
        triggerHover,
        triggerPressed,
        animateInteractions,
        options,
        calendarLinkSet,
        surfaceColor,
        textPrimaryColor,
        textSecondaryColor,
        borderColor,
        borderRadius,
        reducedMotion,
    } = props

    const triggerRef = React.useRef<HTMLButtonElement | null>(null)
    const menuRef = React.useRef<HTMLDivElement | null>(null)
    const itemRefs = React.useRef<Array<HTMLAnchorElement | null>>([])
    const [open, setOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)
    const [menuRect, setMenuRect] = React.useState<{
        left: number
        top: number
    } | null>(null)
    const ix = useButtonInteraction()

    const computePlacement = React.useCallback(() => {
        const el = triggerRef.current
        if (!el || typeof window === "undefined") return null
        const r = el.getBoundingClientRect()
        const viewportW = window.innerWidth || 0
        const viewportH = window.innerHeight || 0
        const width = Math.max(r.width, CALENDAR_MENU_MIN_WIDTH)
        const left = Math.min(Math.max(8, r.left), Math.max(8, viewportW - width - 8))
        const est = options.length * 44 + 8
        const spaceBelow = viewportH - r.bottom - 8
        const openBelow = spaceBelow >= est || spaceBelow >= r.top - 8
        const top = openBelow ? r.bottom + 4 : Math.max(8, r.top - est - 4)
        return { left, top }
    }, [options.length])

    const updatePlacement = React.useCallback(() => {
        const next = computePlacement()
        if (!next) return
        setMenuRect((prev) =>
            prev && prev.left === next.left && prev.top === next.top ? prev : next
        )
    }, [computePlacement])

    const closeMenu = React.useCallback((refocus: boolean) => {
        setOpen(false)
        if (refocus) {
            requestAnimationFrame(() => {
                triggerRef.current?.focus()
            })
        }
    }, [])

    const openMenu = React.useCallback(
        (focus?: "start" | "end") => {
            const placement = computePlacement()
            if (!placement) return
            setMenuRect(placement)
            setActiveIndex(focus === "end" ? Math.max(0, options.length - 1) : 0)
            setOpen(true)
        },
        [computePlacement, options.length]
    )

    React.useEffect(() => {
        if (!open) return
        if (typeof document === "undefined") return
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null
            if (!target) return
            if (triggerRef.current?.contains(target)) return
            if (menuRef.current?.contains(target)) return
            setOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open])

    React.useEffect(() => {
        if (!open) return
        if (typeof window === "undefined") return
        let raf = 0
        const reposition = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                updatePlacement()
            })
        }
        window.addEventListener("scroll", reposition, true)
        window.addEventListener("resize", reposition)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", reposition, true)
            window.removeEventListener("resize", reposition)
        }
    }, [open, updatePlacement])

    const focusItem = (index: number) => {
        const count = options.length
        if (count === 0) return
        const next = index < 0 ? count - 1 : index >= count ? 0 : index
        setActiveIndex(next)
        itemRefs.current[next]?.focus()
    }

    const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        switch (event.key) {
            case "Escape":
                if (open) {
                    event.preventDefault()
                    closeMenu(false)
                }
                return
            case " ":
            case "Enter":
                event.preventDefault()
                if (open) closeMenu(false)
                else openMenu()
                return
            case "ArrowDown":
                event.preventDefault()
                if (!open) openMenu("start")
                else focusItem(activeIndex + 1)
                return
            case "ArrowUp":
                event.preventDefault()
                if (!open) openMenu("end")
                else focusItem(activeIndex - 1)
                return
            case "Home":
                if (open) {
                    event.preventDefault()
                    focusItem(0)
                }
                return
            case "End":
                if (open) {
                    event.preventDefault()
                    focusItem(options.length - 1)
                }
                return
            default:
                return
        }
    }

    const menuRowRadius = Math.max(0, parseRadiusNumber(borderRadius) - 4)
    const optionTextColor = calendarLinkSet?.textColor ?? textPrimaryColor
    const hoverRowWash = withAlpha(optionTextColor, 0.06)

    const menuSurfaceStyle: React.CSSProperties = {
        position: "fixed",
        left: menuRect?.left,
        top: menuRect?.top,
        minWidth: CALENDAR_MENU_MIN_WIDTH,
        margin: 0,
        padding: 4,
        boxSizing: "border-box",
        zIndex: CALENDAR_MENU_Z_INDEX,
        background: surfaceColor,
        border: `1px solid ${calendarLinkSet?.border?.borderColor ?? borderColor}`,
        borderRadius: borderRadius,
        ...shadowStyle(calendarLinkSet?.shadow),
    }

    return (
        <div style={{ position: "relative", display: "inline-flex" }}>
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                {...ix.bind}
                onClick={() => {
                    if (open) closeMenu(false)
                    else openMenu()
                }}
                onKeyDown={handleTriggerKeyDown}
                style={{
                    minHeight: BUTTON_MIN_HEIGHT,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    ...applyButtonInteraction(
                        triggerStyle,
                        triggerHover,
                        triggerPressed,
                        ix,
                        animateInteractions
                    ),
                    cursor: "pointer",
                }}
            >
                {triggerLabel}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{
                        transform: open ? "rotate(180deg)" : "none",
                        transition: reducedMotion ? "none" : "transform 0.15s ease",
                    }}
                >
                    <path
                        d="M4 6L8 10L12 6"
                        stroke={
                            typeof triggerStyle.color === "string"
                                ? triggerStyle.color
                                : textSecondaryColor
                        }
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {open && menuRect && typeof document !== "undefined"
                ? (ReactDOM.createPortal(
                      <div
                          ref={menuRef}
                          role="menu"
                          aria-label={triggerLabel}
                          style={menuSurfaceStyle}
                          onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                  event.preventDefault()
                                  closeMenu(true)
                              } else if (event.key === "ArrowDown") {
                                  event.preventDefault()
                                  focusItem(activeIndex + 1)
                              } else if (event.key === "ArrowUp") {
                                  event.preventDefault()
                                  focusItem(activeIndex - 1)
                              } else if (event.key === "Home") {
                                  event.preventDefault()
                                  focusItem(0)
                              } else if (event.key === "End") {
                                  event.preventDefault()
                                  focusItem(options.length - 1)
                              } else if (event.key === "Tab") {
                                  closeMenu(false)
                              }
                          }}
                      >
                          {options.map((option, index) => {
                              const isActiveRow = index === activeIndex
                              return (
                                  <a
                                      key={option.id}
                                      ref={(node) => {
                                          itemRefs.current[index] = node
                                      }}
                                      role="menuitem"
                                      href={option.href}
                                      target={option.id === "other" ? undefined : "_blank"}
                                      rel={
                                          option.id === "other" ? undefined : "noopener noreferrer"
                                      }
                                      download={option.download}
                                      onClick={() => {
                                          setOpen(false)
                                      }}
                                      onMouseEnter={() => setActiveIndex(index)}
                                      onFocus={() => setActiveIndex(index)}
                                      style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 10,
                                          padding: "10px 14px",
                                          borderRadius: menuRowRadius,
                                          color: optionTextColor,
                                          textDecoration: "none",
                                          cursor: "pointer",
                                          background: isActiveRow ? hoverRowWash : "transparent",
                                          transition: reducedMotion
                                              ? "none"
                                              : "background-color 0.12s ease",
                                          touchAction: "manipulation",
                                          userSelect: "none",
                                          WebkitUserSelect: "none",
                                          WebkitTapHighlightColor: "transparent",
                                          fontFamily:
                                              calendarLinkSet?.font?.fontFamily ?? "inherit",
                                          fontSize:
                                              fontPixelSize(calendarLinkSet?.font?.fontSize) ?? 14,
                                          ...(calendarLinkSet?.font?.fontWeight != null
                                              ? { fontWeight: calendarLinkSet.font.fontWeight }
                                              : {}),
                                      }}
                                  >
                                      <CalendarProviderIcon id={option.id} />
                                      <span>{option.label}</span>
                                  </a>
                              )
                          })}
                      </div>,
                      document.body
                  ) as unknown as React.ReactNode)
                : null}
        </div>
    )
})

const SuccessScreen = React.memo(function SuccessScreen(props: {
    steps: NormalizedStep[]
    values: BookingValues
    bookingResult: BookingConfirmation | null
    accentColor: string
    accentForegroundColor: string
    textPrimaryColor: string
    textSecondaryColor: string
    surfaceColor: string
    borderColor: string
    successColor: string
    borderRadius: string | number
    onRestart: () => void
    successTitle: string
    successSubtitle: string
    headingFont?: FramerFont
    terminalAlignment: "left" | "center" | "right"
    actionJustify?: "flex-start" | "center" | "flex-end"
    bodySubtitleSize: number
    bodySubtitleLineHeight: number | string
    addToCalendarLabel: string
    bookAnotherLabel: string
    bookAnotherStyle: React.CSSProperties
    rescheduleLinkStyle: React.CSSProperties
    calendarLinkSet: ButtonStyleGroup | undefined
    addToCalendarHover?: ButtonInteractionState
    addToCalendarPressed?: ButtonInteractionState
    bookAnotherHover?: ButtonInteractionState
    bookAnotherPressed?: ButtonInteractionState
    animateInteractions: boolean
    transitionVariant: TransitionVariantId
    baseTransition: Transition
    timeZone: string
    eventTitle?: string
    eventLocation?: string
    rescheduleOrCancelLabel: string
    meetingDurationMs: number
}) {
    const {
        steps,
        values,
        bookingResult,
        textPrimaryColor,
        textSecondaryColor,
        surfaceColor,
        borderColor,
        successColor,
        borderRadius,
        onRestart,
        successTitle,
        successSubtitle,
        headingFont,
        terminalAlignment,
        actionJustify,
        bodySubtitleSize,
        bodySubtitleLineHeight,
        addToCalendarLabel,
        bookAnotherLabel,
        bookAnotherStyle,
        rescheduleLinkStyle,
        calendarLinkSet,
        addToCalendarHover,
        addToCalendarPressed,
        bookAnotherHover,
        bookAnotherPressed,
        animateInteractions,
        transitionVariant,
        baseTransition,
        timeZone,
        eventTitle,
        eventLocation,
        rescheduleOrCancelLabel,
        meetingDurationMs,
    } = props

    const headingRef = React.useRef<HTMLHeadingElement | null>(null)
    React.useEffect(() => {
        headingRef.current?.focus()
    }, [])
    const bookAnotherIx = useButtonInteraction()

    const isStaticRender = useIsStaticRenderer()
    const reducedMotion = useReducedMotion() ?? false
    const variantDef = TRANSITION_VARIANT_DEFS[transitionVariant]
    const circleHidden = React.useMemo(() => {
        const raw: unknown = variantDef.variants.inactive
        const resolved = typeof raw === "function" ? (raw as (c: number) => unknown)(1) : raw
        return resolved as Variants
    }, [variantDef])
    const circleShown = (() => {
        const raw: unknown = variantDef.variants.active
        const resolved = typeof raw === "function" ? (raw as (c: number) => unknown)(1) : raw
        return resolved as TargetAndTransition
    })()
    const circleTransition = React.useMemo(() => {
        if (reducedMotion || isStaticRender) return INSTANT_TRANSITION
        const base = baseTransition as unknown as { duration?: number }
        const d =
            typeof base?.duration === "number" && Number.isFinite(base.duration)
                ? base.duration
                : undefined
        if (d !== undefined) return { ...variantDef.transition, duration: d } as Transition
        return variantDef.transition
    }, [baseTransition, isStaticRender, reducedMotion, variantDef])
    const animateCheck = !isStaticRender && !reducedMotion

    const entries: Array<{ id?: string; label: string; value: string }> = React.useMemo(() => {
        const list: Array<{ id?: string; label: string; value: string }> = []
        for (const stepEntry of steps) {
            if (stepEntry.stepType !== "form" && stepEntry.stepType !== "datetime") continue
            for (const field of stepEntry.fields) {
                const value = values[field.id]
                if (isEmptyPayloadValue(value)) continue
                list.push({
                    id: field.id,
                    label: field.label,
                    value: Array.isArray(value) ? value.join(", ") : String(value),
                })
            }
        }
        if (values[SELECTED_SLOT_KEY]) {
            const slot = values[SELECTED_SLOT_KEY]
            const tzOpts = timeZone ? { timeZone } : undefined
            let dateStr: string
            try {
                const slotDate = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
                    ? new Date(slot.time24h)
                    : slot.date
                dateStr = getCachedDateTimeFormat(pageLocale(), {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    ...tzOpts,
                }).format(slotDate)
            } catch {
                dateStr = getCachedDateTimeFormat(pageLocale(), {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }).format(slot.date)
            }
            list.push({ id: "__be_date", label: DEFAULT_COPY_DATE_LABEL, value: dateStr })
            list.push({
                id: "__be_time",
                label: DEFAULT_COPY_TIME_LABEL,
                value: slot.timeLabel,
            })
        }
        const confirmationEntry = bookingResult?.uid
            ? {
                  id: "__be_confirmation",
                  label: DEFAULT_COPY_CONFIRMATION_ID_LABEL,
                  value: bookingResult.uid,
              }
            : undefined
        // SUCCESS-ORDER (BE-034): Name, Email, Date, Time lead;
        // remaining values keep entry order; Confirmation ID stays last.
        const nameField = findNameField(steps)
        const emailField = findEmailField(steps)
        const nameEntry = nameField?.id
            ? list.find((entry) => entry.id === nameField.id)
            : undefined
        const emailEntry =
            emailField?.id && emailField.id !== nameField?.id
                ? list.find((entry) => entry.id === emailField.id)
                : undefined
        const dateEntry = list.find((entry) => entry.id === "__be_date")
        const timeEntry = list.find((entry) => entry.id === "__be_time")
        const lead = [nameEntry, emailEntry, dateEntry, timeEntry].filter(
            (entry): entry is { id?: string; label: string; value: string } => Boolean(entry)
        )
        const rest = list.filter(
            (entry) =>
                entry !== nameEntry &&
                entry !== emailEntry &&
                entry !== dateEntry &&
                entry !== timeEntry
        )
        return confirmationEntry ? [...lead, ...rest, confirmationEntry] : [...lead, ...rest]
    }, [steps, values, timeZone, bookingResult?.uid])

    const icsDescription = React.useMemo(() => {
        const raw = buildNotesPayload(steps, values, timeZone)
        const cut = raw.indexOf(DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL)
        return cut > 0 ? raw.slice(0, cut).trim() : raw
    }, [steps, values, timeZone])

    // EXPORT-TITLE (BE-079): the Cal.com event title verbatim — no suffix
    // is ever appended; no-title metadata failure keeps the ICS fallback.
    const calendarExportTitle = eventTitle?.trim() || DEFAULT_COPY_ICS_SUMMARY_FALLBACK

    const icsUri = React.useMemo(
        () =>
            values[SELECTED_SLOT_KEY]
                ? buildIcsDataUri(
                      values[SELECTED_SLOT_KEY],
                      icsDescription || undefined,
                      calendarExportTitle,
                      undefined,
                      undefined,
                      meetingDurationMs,
                      typeof eventLocation === "string" ? eventLocation : "",
                      bookingResult?.uid ?? undefined
                  )
                : "",
        [
            values,
            icsDescription,
            calendarExportTitle,
            meetingDurationMs,
            eventLocation,
            bookingResult,
        ]
    )

    const slot = isBookingPayload(values[SELECTED_SLOT_KEY])
        ? (values[SELECTED_SLOT_KEY] as BookingPayload)
        : undefined
    const hasIsoSlotTime = !!slot && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h)
    const googleCalUri =
        hasIsoSlotTime && slot
            ? buildCalendarDeepLink(
                  "google",
                  slot,
                  calendarExportTitle,
                  icsDescription || undefined,
                  meetingDurationMs
              )
            : ""
    const officeCalUri =
        hasIsoSlotTime && slot
            ? buildCalendarDeepLink(
                  "office",
                  slot,
                  calendarExportTitle,
                  icsDescription || undefined,
                  meetingDurationMs
              )
            : ""
    const outlookCalUri =
        hasIsoSlotTime && slot
            ? buildCalendarDeepLink(
                  "outlook",
                  slot,
                  calendarExportTitle,
                  icsDescription || undefined,
                  meetingDurationMs
              )
            : ""
    const apiHref = bookingResult?.rescheduleUrl || bookingResult?.cancelUrl || ""
    // API-provided URLs are never trusted blindly — only http(s) destinations render,
    // otherwise fall back to the same-origin manage URL constructed from the UID.
    const manageHref = /^https?:\/\//i.test(apiHref) ? apiHref : (bookingResult?.manageUrl ?? "")

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    flexDirection:
                        terminalAlignment === "center"
                            ? "column"
                            : terminalAlignment === "right"
                              ? "row-reverse"
                              : "row",
                    alignItems: "center",
                    justifyContent:
                        terminalAlignment === "left"
                            ? "flex-start"
                            : terminalAlignment === "right"
                              ? "flex-end"
                              : "center",
                    gap: terminalAlignment === "center" ? 0 : 16,
                    textAlign: terminalAlignment,
                    marginBottom: 16,
                }}
            >
                <motion.div
                    initial={isStaticRender ? false : reducedMotion ? { opacity: 0 } : circleHidden}
                    animate={isStaticRender || reducedMotion ? { opacity: 1 } : circleShown}
                    transition={reducedMotion ? { duration: 0.15 } : circleTransition}
                >
                    <div
                        style={{
                            // BE-043: layered concentric circles (failure-mark
                            // rhythm — faint halo ring, stronger inner wash,
                            // glyph in the state color).
                            width: CHECKMARK_ICON_SIZE,
                            height: CHECKMARK_ICON_SIZE,
                            borderRadius: "50%",
                            background: withAlpha(successColor, 0.12),
                            boxShadow: `0 0 0 8px ${withAlpha(successColor, 0.06)}`,
                            color: successColor,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                        aria-hidden="true"
                    >
                        <svg
                            width={Math.round(CHECKMARK_ICON_SIZE / 2)}
                            height={Math.round(CHECKMARK_ICON_SIZE / 2)}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            role="presentation"
                        >
                            {animateCheck ? (
                                <motion.path
                                    d="M4 12 9 17 20 6"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        delay: 0.3,
                                        duration: 0.45,
                                        ease: "easeOut",
                                    }}
                                />
                            ) : (
                                <path d="M4 12 9 17 20 6" />
                            )}
                        </svg>
                    </div>
                </motion.div>
                <div>
                    {/* Title */}
                    <h2
                        ref={headingRef}
                        tabIndex={-1}
                        className="be-focus-target"
                        style={{
                            fontFamily: headingFont?.fontFamily ?? "inherit",
                            fontSize: fontPixelSize(headingFont?.fontSize) ?? 22,
                            fontWeight: headingFont?.fontWeight ?? 700,
                            ...(headingFont?.fontStyle ? { fontStyle: headingFont.fontStyle } : {}),
                            ...(headingFont?.letterSpacing != null
                                ? { letterSpacing: headingFont.letterSpacing }
                                : {}),
                            lineHeight: headingFont?.lineHeight ?? 1.2,
                            color: textPrimaryColor,
                            textAlign: terminalAlignment,
                            marginBottom: 4,
                            marginTop: 0,
                            // FINAL-43 fix: outline:none removed (see .be-focus-target).
                        }}
                    >
                        {replaceCopyTokens(successTitle, steps, values, timeZone)}
                    </h2>

                    {/* Subtitle */}
                    <div
                        style={{
                            fontSize: bodySubtitleSize,
                            color: textSecondaryColor,
                            textAlign: terminalAlignment,
                            marginBottom: 24,
                            lineHeight: bodySubtitleLineHeight,
                        }}
                    >
                        {replaceCopyTokens(successSubtitle, steps, values, timeZone)}
                    </div>
                </div>
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
                                idx < entries.length - 1 ? `1px solid ${borderColor}` : "none",
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
                    justifyContent: actionJustify ?? "flex-end",
                }}
            >
                {icsUri || manageHref ? (
                    <CalendarExportMenu
                        triggerLabel={addToCalendarLabel}
                        triggerStyle={rescheduleLinkStyle}
                        triggerHover={addToCalendarHover}
                        triggerPressed={addToCalendarPressed}
                        animateInteractions={animateInteractions}
                        options={[
                            ...(googleCalUri
                                ? [
                                      {
                                          id: "google" as const,
                                          label: CALENDAR_MENU_GOOGLE_LABEL,
                                          href: googleCalUri,
                                      },
                                  ]
                                : []),
                            ...(officeCalUri
                                ? [
                                      {
                                          id: "office" as const,
                                          label: CALENDAR_MENU_OFFICE_LABEL,
                                          href: officeCalUri,
                                      },
                                  ]
                                : []),
                            ...(outlookCalUri
                                ? [
                                      {
                                          id: "outlook" as const,
                                          label: CALENDAR_MENU_OUTLOOK_LABEL,
                                          href: outlookCalUri,
                                      },
                                  ]
                                : []),
                            ...(icsUri
                                ? [
                                      {
                                          id: "other" as const,
                                          label: CALENDAR_MENU_OTHER_LABEL,
                                          href: icsUri,
                                          download: DEFAULT_ICS_FILENAME,
                                      },
                                  ]
                                : []),
                            ...(manageHref
                                ? [
                                      {
                                          id: "manage" as const,
                                          label: rescheduleOrCancelLabel,
                                          href: manageHref,
                                      },
                                  ]
                                : []),
                        ]}
                        calendarLinkSet={calendarLinkSet}
                        surfaceColor={surfaceColor}
                        textPrimaryColor={textPrimaryColor}
                        textSecondaryColor={textSecondaryColor}
                        borderColor={borderColor}
                        borderRadius={borderRadius}
                        reducedMotion={!!reducedMotion}
                    />
                ) : null}
                <button
                    type="button"
                    onClick={onRestart}
                    {...bookAnotherIx.bind}
                    style={{
                        minHeight: BUTTON_MIN_HEIGHT,
                        ...applyButtonInteraction(
                            bookAnotherStyle,
                            bookAnotherHover,
                            bookAnotherPressed,
                            bookAnotherIx,
                            animateInteractions
                        ),
                        cursor: "pointer",
                    }}
                >
                    {bookAnotherLabel}
                </button>
            </div>
        </div>
    )
})

const ErrorScreen = React.memo(function ErrorScreen(props: {
    message: string
    errorColor: string
    textPrimaryColor: string
    textSecondaryColor: string
    borderRadius: string | number
    onRetry: () => void
    errorTitle: string
    errorSubtitle: string
    headingFont?: FramerFont
    terminalAlignment: "left" | "center" | "right"
    actionJustify?: "flex-start" | "center" | "flex-end"
    bodySubtitleSize: number
    bodySubtitleLineHeight: number | string
    retryLabel: string
    retryStyle: React.CSSProperties
    retryHover?: ButtonInteractionState
    retryPressed?: ButtonInteractionState
    retryAnimate: boolean
}) {
    const {
        message,
        errorColor,
        textPrimaryColor,
        textSecondaryColor,
        borderRadius,
        onRetry,
        errorTitle,
        errorSubtitle,
        headingFont,
        terminalAlignment,
        actionJustify,
        bodySubtitleSize,
        bodySubtitleLineHeight,
        retryLabel,
        retryStyle,
        retryHover,
        retryPressed,
        retryAnimate,
    } = props

    const headingRef = React.useRef<HTMLHeadingElement | null>(null)
    React.useEffect(() => {
        headingRef.current?.focus()
    }, [])
    const retryIx = useButtonInteraction()

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                        terminalAlignment === "left"
                            ? "flex-start"
                            : terminalAlignment === "right"
                              ? "flex-end"
                              : "center",
                    justifyContent: "center",
                    textAlign: terminalAlignment,
                    minHeight: 320,
                    padding: "24px 16px",
                    boxSizing: "border-box",
                    textWrap: "balance",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection:
                            terminalAlignment === "center"
                                ? "column"
                                : terminalAlignment === "right"
                                  ? "row-reverse"
                                  : "row",
                        alignItems: "center",
                        gap: terminalAlignment === "center" ? 6 : 16,
                        marginBottom: 16,
                        maxWidth: 520,
                    }}
                >
                    <div
                        style={{
                            width: ERROR_ICON_SIZE,
                            height: ERROR_ICON_SIZE,
                            borderRadius: "50%",
                            background: withAlpha(errorColor, 0.12),
                            boxShadow: `0 0 0 8px ${withAlpha(errorColor, 0.06)}`,
                            color: errorColor,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: Math.round(ERROR_ICON_SIZE / 2),
                            fontWeight: 700,
                            flexShrink: 0,
                            marginBottom: terminalAlignment === "center" ? 10 : 0,
                        }}
                        aria-hidden="true"
                    >
                        !
                    </div>
                    <div>
                        <h2
                            ref={headingRef}
                            tabIndex={-1}
                            className="be-focus-target"
                            style={{
                                fontFamily: headingFont?.fontFamily ?? "inherit",
                                fontSize: fontPixelSize(headingFont?.fontSize) ?? 22,
                                fontWeight: headingFont?.fontWeight ?? 700,
                                ...(headingFont?.fontStyle
                                    ? { fontStyle: headingFont.fontStyle }
                                    : {}),
                                ...(headingFont?.letterSpacing != null
                                    ? { letterSpacing: headingFont.letterSpacing }
                                    : {}),
                                lineHeight: headingFont?.lineHeight ?? 1.2,
                                color: textPrimaryColor,
                                marginTop: 0,
                                marginBottom: 0,
                                // FINAL-43 fix: outline:none removed (see .be-focus-target).
                            }}
                        >
                            {errorTitle}
                        </h2>
                        <div
                            style={{
                                fontSize: bodySubtitleSize,
                                color: textSecondaryColor,
                                marginTop: 6,
                                lineHeight: bodySubtitleLineHeight,
                            }}
                        >
                            {errorSubtitle}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        padding: "14px 18px",
                        borderRadius: borderRadius,
                        background: withAlpha(errorColor, 0.08),
                        border: `1px solid ${withAlpha(errorColor, 0.3)}`,
                        color: textPrimaryColor,
                        fontSize: 14,
                        lineHeight: 1.5,
                        marginBottom: 20,
                        width: "100%",
                        maxWidth: 520,
                        boxSizing: "border-box",
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
                        justifyContent: actionJustify ?? "center",
                    }}
                >
                    <button
                        type="button"
                        onClick={onRetry}
                        {...retryIx.bind}
                        style={{
                            minHeight: BUTTON_MIN_HEIGHT,
                            ...applyButtonInteraction(
                                retryStyle,
                                retryHover,
                                retryPressed,
                                retryIx,
                                retryAnimate
                            ),
                            cursor: "pointer",
                        }}
                    >
                        {retryLabel}
                    </button>
                </div>
            </div>
        </div>
    )
})

BookingEngine.displayName = "BookingEngine"

type FieldControlProps = Partial<FieldConfig>
type StepSlotControlProps = Partial<Pick<BookingEngineProps, "stepCount">> &
    Partial<Pick<StepConfig, "enabled" | "showHeader">>
type ProgressBarControlProps = Pick<
    BookingEngineProps["progressBar"],
    "showText" | "showTextContent" | "barVisible" | "visible"
>
type ButtonsLayoutControlProps = {
    groupNavButtons?: boolean
    buttonWidth?: "fit" | "fill"
}

function fieldStylesColorControl(title: string) {
    return { type: ct(ControlType.Color), title, optional: true }
}
function fieldStylesNumberControl(title: string, min: number, max: number, defaultValue: number) {
    return {
        type: ct(ControlType.Number),
        title,
        optional: true,
        min,
        max,
        step: 1,
        unit: "px",
        defaultValue,
    }
}
function fieldStylesFontControl(
    title: string,
    defaultValue?: {
        fontSize: string
        variant: "Regular" | "Medium" | "Semibold"
        lineHeight?: string | number
    }
) {
    return {
        type: ct(ControlType.Font),
        title,
        controls: "extended" as const,
        defaultFontType: "sans-serif" as const,
        ...(defaultValue ? { defaultValue } : {}),
    }
}
function fieldStylesBorderControl(
    defaultValue: {
        borderWidth?: number
        borderStyle?: "solid" | "dashed" | "dotted" | "double"
        borderColor?: string
    } = {
        borderWidth: FIELD_STYLES_BORDER_WIDTH,
        borderStyle: "solid",
        borderColor: FIELD_STYLES_BORDER_COLOR,
    }
) {
    return {
        type: ct(ControlType.Border),
        title: "Border",
        optional: true,
        defaultValue,
    }
}
function fieldStylesRadiusControl(defaultValue: string = FIELD_STYLES_FIELD_RADIUS) {
    return {
        type: ct(ControlType.BorderRadius),
        title: "Radius",
        optional: true,
        defaultValue,
    }
}
function fieldStylesPaddingControl(defaultValue: string = FIELD_STYLES_INPUT_PADDING) {
    return {
        type: ct(ControlType.Padding),
        title: "Padding",
        optional: true,
        defaultValue,
    }
}
const NO_SHADOW_VALUE = "0px 0px 0px 0px rgba(0,0,0,0)"
function isNoShadowValue(value: string | undefined): boolean {
    if (!value) return true
    const n = value.replace(/\s+/g, "").toLowerCase()
    return n === "" || n === "none" || n === NO_SHADOW_VALUE.replace(/\s+/g, "").toLowerCase()
}
function fieldStylesShadowControl(title: string = "Shadow") {
    return {
        type: ct(ControlType.BoxShadow),
        title,
        defaultValue: NO_SHADOW_VALUE,
    }
}
function shadowStyle(shadow: string | undefined): React.CSSProperties {
    return !isNoShadowValue(shadow) && shadow && shadow.trim() ? { boxShadow: shadow } : {}
}

function makeInputFieldStylesControls() {
    const eff = getFieldStylesEffectiveDefaults("text")
    return {
        labelFont: fieldStylesFontControl("Label Font", {
            fontSize: "13px",
            variant: "Medium",
            lineHeight: 1.6,
        }),
        font: fieldStylesFontControl("Field Font", {
            fontSize: "14px",
            variant: "Regular",
        }),
        labelColor: fieldStylesColorControl("Label Color"),
        textColor: fieldStylesColorControl("Field Color"),
        placeholderColor: fieldStylesColorControl("Placeholder Color"),
        backgroundColor: fieldStylesColorControl("Fill"),
        radius: fieldStylesRadiusControl(),
        padding: fieldStylesPaddingControl(),
        border: fieldStylesBorderControl(),
        focusBorderColor: fieldStylesColorControl("Focus Border"),
        spacing: fieldStylesNumberControl("Gap", 0, 24, eff.spacing),
    }
}

function makeSelectedStylesControls() {
    // SELECTED-STYLES (BE-024): one full-vocabulary subgroup for the
    // selected/active state of choice fields. Colors stay default-free so
    // they track the live theme tokens (accent / accent foreground).
    return {
        font: fieldStylesFontControl("Font", {
            fontSize: "14px",
            variant: "Regular",
        }),
        textColor: fieldStylesColorControl("Color"),
        backgroundColor: fieldStylesColorControl("Fill"),
        radius: fieldStylesRadiusControl(FIELD_STYLES_FIELD_RADIUS),
        padding: fieldStylesPaddingControl(FIELD_STYLES_SELECT_PADDING),
        border: fieldStylesBorderControl({
            borderWidth: FIELD_STYLES_BORDER_WIDTH,
            borderStyle: "solid",
            borderColor: "#222222",
        }),
        shadow: fieldStylesShadowControl(),
    }
}

function makeGlobalFieldStylesControls() {
    // STYLES-ORDER: Shadows closes the set (BE-023) — after the
    // Selected/Check rows, not with the base rows.
    return {
        ...makeInputFieldStylesControls(),
        selected: {
            type: ct(ControlType.Object),
            title: "Selected Styles",
            buttonTitle: "Selected Styles",
            icon: "effect" as const,
            optional: true,
            controls: makeSelectedStylesControls(),
        },
        accentColor: fieldStylesColorControl("Check Accent"),
        shadow: fieldStylesShadowControl("Shadows"),
    }
}

function makeCalendarStylesStylesControls() {
    const eff = getFieldStylesEffectiveDefaults("calendar-widget")
    return {
        font: fieldStylesFontControl("Field Font", {
            fontSize: "14px",
            variant: "Regular",
        }),
        textColor: fieldStylesColorControl("Field Color"),
        backgroundColor: fieldStylesColorControl("Fill"),
        radius: {
            type: ct(ControlType.Number),
            title: "Radius",
            optional: true,
            defaultValue: 12,
            min: 0,
            max: 24,
            step: 1,
            unit: "px",
            displayStepper: true,
        },
        padding: fieldStylesPaddingControl(eff.padding),
        border: fieldStylesBorderControl({
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: FIELD_STYLES_BORDER_COLOR,
        }),
        shadow: fieldStylesShadowControl("Shadows"),
    }
}

function makeButtonInteractionControls(borderDefaultColor: string) {
    return {
        transition: {
            type: ct(ControlType.Transition),
            title: "Transition",
            defaultValue: {
                type: "tween" as const,
                duration: 0.15,
                ease: "easeOut" as const,
            },
        },
        scale: {
            type: ct(ControlType.Number),
            title: "Scale",
            defaultValue: 1,
            min: 0.5,
            max: 1.5,
            step: 0.01,
        },
        opacity: {
            type: ct(ControlType.Number),
            title: "Opacity",
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.01,
        },
        textColor: fieldStylesColorControl("Text Color"),
        backgroundColor: fieldStylesColorControl("Background"),
        border: {
            type: ct(ControlType.Border),
            title: "Border",
            optional: true,
            description: "0 keeps the button's normal border — set 1 or more to override it here.",
            defaultValue: {
                borderWidth: 0,
                borderStyle: "solid" as const,
                borderColor: borderDefaultColor,
            },
        },
        shadow: fieldStylesShadowControl(),
    }
}
function makeSharedButtonStylesControls(defaults: {
    padding: string
    borderWidth: number
    borderColor: string
}) {
    return {
        font: fieldStylesFontControl("Font", {
            fontSize: "14px",
            variant: "Semibold",
        }),
        textColor: fieldStylesColorControl("Color"),
        backgroundColor: fieldStylesColorControl("Fill"),
        radius: fieldStylesRadiusControl("12px"),
        padding: fieldStylesPaddingControl(defaults.padding),
        border: fieldStylesBorderControl({
            borderWidth: defaults.borderWidth,
            borderStyle: "solid",
            borderColor: defaults.borderColor,
        }),
        shadow: fieldStylesShadowControl(),
        hover: {
            type: ct(ControlType.Object),
            title: "Hover",
            buttonTitle: "Hover",
            icon: "interaction" as const,
            optional: true,
            controls: makeButtonInteractionControls(defaults.borderColor),
        },
        pressed: {
            type: ct(ControlType.Object),
            title: "Pressed",
            buttonTitle: "Pressed",
            icon: "interaction" as const,
            optional: true,
            controls: makeButtonInteractionControls(defaults.borderColor),
        },
    }
}

interface ButtonRoleDefaults {
    background: string
    color: string
    borderWidth: number
    borderColor: string
    padding: string
}

function resolveButtonStyle(
    group: ButtonStyleGroup | undefined,
    role: ButtonRoleDefaults,
    radiusToken: string | number
): React.CSSProperties {
    const font = group?.font
    const width = group?.border?.borderWidth ?? role.borderWidth
    const style = group?.border?.borderStyle || "solid"
    const bColor = group?.border?.borderColor || role.borderColor
    return {
        background: group?.backgroundColor || role.background,
        color: group?.textColor || role.color,
        border: width > 0 ? `${width}px ${style} ${bColor}` : "none",
        borderRadius:
            typeof group?.radius === "string" && group.radius.trim()
                ? group.radius
                : typeof group?.radius === "number"
                  ? `${group.radius}px`
                  : typeof radiusToken === "number"
                    ? `${radiusToken}px`
                    : radiusToken,
        padding:
            typeof group?.padding === "string" && group.padding.trim()
                ? group.padding
                : role.padding,
        fontFamily: font?.fontFamily ?? "inherit",
        fontSize: fontPixelSize(font?.fontSize) ?? 14,
        fontWeight: font?.fontWeight ?? 600,
        ...(font?.fontStyle ? { fontStyle: font.fontStyle } : {}),
        ...(font?.letterSpacing != null ? { letterSpacing: font.letterSpacing } : {}),
        ...(font?.lineHeight != null ? { lineHeight: font.lineHeight } : {}),
        ...shadowStyle(group?.shadow),
    }
}

function mergeButtonStyleGroups(
    base: ButtonStyleGroup | undefined,
    over: ButtonStyleGroup | undefined
): ButtonStyleGroup | undefined {
    if (!base) return over
    if (!over) return base
    const out: ButtonStyleGroup = { ...base }
    const rec = out as Record<string, unknown>
    for (const key of Object.keys(over)) {
        const value = (over as Record<string, unknown>)[key]
        if (value === undefined) continue
        if (key === "border" || key === "hover" || key === "pressed" || key === "font") {
            const baseObj = (rec[key] ?? {}) as Record<string, unknown>
            rec[key] = { ...baseObj, ...(value as Record<string, unknown>) }
        } else {
            rec[key] = value
        }
    }
    return out
}

const INTERACTION_ANIMATED_PROPS = [
    "background-color",
    "border-color",
    "box-shadow",
    "color",
    "opacity",
    "transform",
]
function splitBorderParts(border: string): [string, string, string] | null {
    const m = /^(\S+)\s+(\S+)\s+(.+)$/.exec(border.trim())
    return m ? [m[1], m[2], m[3]] : null
}
function cssEaseName(name: string): string {
    switch (name) {
        case "linear":
        case "ease":
        case "ease-in":
        case "ease-out":
        case "ease-in-out":
            return name
        case "easeIn":
            return "ease-in"
        case "easeOut":
            return "ease-out"
        case "easeInOut":
            return "ease-in-out"
        default:
            return "ease"
    }
}
function interactionTransition(t: Transition | undefined, animate: boolean): string {
    if (!animate) return "none"
    let duration = 0.15
    let ease = "ease"
    let delay = 0
    if (t) {
        const tt = t as { duration?: unknown; delay?: unknown; ease?: unknown }
        if (typeof tt.duration === "number" && Number.isFinite(tt.duration)) {
            duration = clamp(tt.duration, 0, 5)
        }
        if (typeof tt.delay === "number" && Number.isFinite(tt.delay)) {
            delay = clamp(tt.delay, 0, 5)
        }
        const e = tt.ease
        if (typeof e === "string") {
            ease = cssEaseName(e)
        } else if (Array.isArray(e) && e.length === 4 && e.every((n) => typeof n === "number")) {
            ease = `cubic-bezier(${(e as number[]).join(", ")})`
        }
    }
    return INTERACTION_ANIMATED_PROPS.map((p) => `${p} ${duration}s ${ease} ${delay}s`).join(", ")
}
function applyButtonInteraction(
    base: React.CSSProperties,
    hover: ButtonInteractionState | undefined,
    pressed: ButtonInteractionState | undefined,
    state: { hovered: boolean; pressed: boolean },
    animate: boolean
): React.CSSProperties {
    const st = state.pressed ? pressed : state.hovered ? hover : undefined
    const t = state.pressed ? (pressed?.transition ?? hover?.transition) : hover?.transition
    const out: React.CSSProperties = { ...base }
    if (st) {
        if (st.backgroundColor) out.background = st.backgroundColor
        if (st.textColor) out.color = st.textColor
        const hb = st.border
        const hbWidth = hb?.borderWidth ?? 0
        if (hb && hbWidth > 0) {
            const baseParts = typeof base.border === "string" ? splitBorderParts(base.border) : null
            const baseColor = typeof base.color === "string" && base.color ? base.color : null
            out.border = `${hbWidth}px ${hb.borderStyle || (baseParts ? baseParts[1] : "solid")} ${hb.borderColor || (baseParts ? baseParts[2] : null) || baseColor || "currentColor"}`
        }
        if (st.opacity != null) out.opacity = st.opacity
        if (st.scale != null && st.scale !== 1) {
            out.transform = `scale(${st.scale})`
        }
        Object.assign(out, shadowStyle(st.shadow))
    }
    out.transition = interactionTransition(t, animate)
    return out
}

function useButtonInteraction() {
    const [hovered, setHovered] = React.useState(false)
    const [pressed, setPressed] = React.useState(false)
    return {
        hovered,
        pressed,
        bind: {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => {
                setHovered(false)
                setPressed(false)
            },
            onMouseDown: () => setPressed(true),
            onMouseUp: () => setPressed(false),
        },
    }
}

function resolveButtonText(...candidates: Array<string | undefined>): string {
    for (const candidate of candidates) {
        if (candidate) return candidate
    }
    return ""
}

function makeFieldObjectControls() {
    return {
        label: {
            type: ct(ControlType.String),
            title: "Label",
            defaultValue: "Field Label",
            hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
        },
        fieldType: {
            type: ct(ControlType.Enum),
            title: "Type",
            options: [
                "text",
                "email",
                "phone",
                "number",
                "url",
                "textarea",
                "select",
                "multiselect",
                "segmented",
                "pills",
                "cards",
                "checkbox",
                "checkboxgroup",
                "radio",
            ],
            optionTitles: [
                "Text",
                "Email",
                "Phone",
                "Number",
                "URL",
                "Textarea",
                "Select",
                "Multi Select",
                "Segmented",
                "Pills",
                "Cards",
                "Checkbox",
                "Checkbox Group",
                "Radio",
            ],
            defaultValue: "text",
        },
        placeholder: {
            type: ct(ControlType.String),
            title: "Placeholder",
            // BE-099: intentionally NO defaultValue — a never-set placeholder
            // stays undefined (type default shows) while a cleared one stores
            // "" (renders nothing). A "" default would fuse the two states.
            hidden: (p: FieldControlProps) =>
                p?.fieldType === "calendar-widget" ||
                p?.fieldType === "checkbox" ||
                p?.fieldType === "checkboxgroup" ||
                CHOICE_FIELD_TYPES.includes(p?.fieldType || ""),
        },
        required: {
            type: ct(ControlType.Boolean),
            title: "Required",
            defaultValue: false,
            hidden: (p: FieldControlProps) =>
                // BE-039/BE-046: flagged TEXT names are always required - no toggle.
                // (A stale flag on a non-text field is inert - text-only by design.)
                // Email fields keep their Required row (only the FIRST email
                // is forced; later emails obey their own toggle - a per-item
                // hidden() cannot see siblings to hide first-only).
                (p?.isPrimaryName === true && p?.fieldType === "text") ||
                p?.fieldType === "calendar-widget",
        },
        options: {
            type: ct(ControlType.Array),
            title: "Options",
            maxCount: 12,
            defaultValue: ["Option 1", "Option 2"],
            control: {
                type: ct(ControlType.String),
                defaultValue: "Option",
            },
            hidden: (p: FieldControlProps) =>
                p?.fieldType === "calendar-widget" ||
                p?.fieldType === "checkbox" ||
                p?.fieldType === "checkboxgroup" ||
                !(
                    CHOICE_FIELD_TYPES.includes(p?.fieldType || "") ||
                    p?.fieldType === "multiselect"
                ),
        },
        isPrimaryName: {
            type: ct(ControlType.Boolean),
            title: "Name",
            defaultValue: false,
            hidden: (p: FieldControlProps) => p?.fieldType !== "text",
        },
        optionValues: {
            type: ct(ControlType.Array),
            title: "Option Values",
            maxCount: 12,
            defaultValue: [],
            control: {
                type: ct(ControlType.String),
                defaultValue: "",
                placeholder: "Custom value (blank uses the label)",
            },
            hidden: (p: FieldControlProps) =>
                !CHOICE_FIELD_TYPES.includes(p?.fieldType || "") &&
                !MULTI_PICK_TYPES.includes(p?.fieldType || ""),
        },
        optionImages: {
            type: ct(ControlType.Array),
            title: "Option Images",
            maxCount: 12,
            defaultValue: [],
            control: {
                type: ct(ControlType.ResponsiveImage),
            },
            hidden: (p: FieldControlProps) => p?.fieldType !== "cards" && p?.fieldType !== "radio",
        },
        optionDescriptions: {
            type: ct(ControlType.Array),
            title: "Option Descriptions",
            maxCount: 12,
            defaultValue: [],
            control: {
                type: ct(ControlType.String),
                defaultValue: "",
            },
            hidden: (p: FieldControlProps) => p?.fieldType !== "cards" && p?.fieldType !== "radio",
        },
        width: {
            type: ct(ControlType.Enum),
            title: "Width",
            options: ["full", "half"],
            optionTitles: ["Fill", "Half"],
            defaultValue: "full",
            displaySegmentedControl: true,
            // BE-091: textarea is always full width (a tall half-width box
            // next to a short field breaks the row) — no control, no choice.
            hidden: (p: FieldControlProps) =>
                p?.fieldType === "calendar-widget" || p?.fieldType === "textarea",
        },
        checkSize: {
            type: ct(ControlType.Number),
            title: "Check Size",
            min: 12,
            max: 32,
            step: 1,
            unit: "px",
            defaultValue: FIELD_STYLES_CHECK_SIZE,
            hidden: (p: FieldControlProps) =>
                p?.fieldType !== "checkbox" && p?.fieldType !== "checkboxgroup",
        },
        calFieldId: {
            type: ct(ControlType.String),
            title: "Cal Field ID",
            defaultValue: "",
            placeholder: "e.g. pet-name",
            hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
        },
    }
}

// Preserves the specific ControlType member through object-literal inference
// (plain `type: ControlType.X` widens to the whole enum and fails assignability).
function ct<T extends ControlType>(t: T): T {
    return t
}

function makeStepControl(slotIndex: number, defaults: StepConfig) {
    return {
        type: ct(ControlType.Object),
        title: `Step ${slotIndex + 1}`,
        defaultValue: defaults,
        hidden: (p: StepSlotControlProps) => (p?.stepCount ?? 1) <= slotIndex,
        controls: {
            enabled: {
                type: ct(ControlType.Boolean),
                title: "Visible",
                defaultValue: defaults.enabled,
            },
            showHeader: {
                type: ct(ControlType.Boolean),
                title: "Header",
                enabledTitle: "Show",
                disabledTitle: "Hide",
                defaultValue: true,
            },
            title: {
                type: ct(ControlType.String),
                title: "Title",
                defaultValue: defaults.title,
                hidden: (p: StepSlotControlProps) => p?.showHeader === false,
            },
            subtitle: {
                type: ct(ControlType.String),
                title: "Subtitle",
                defaultValue: defaults.subtitle || "",
                displayTextArea: true,
                hidden: (p: StepSlotControlProps) => p?.showHeader === false,
            },
            fields: {
                type: ct(ControlType.Array),
                title: "Fields",
                maxCount: 10,
                defaultValue: defaults.fields,
                control: {
                    type: ct(ControlType.Object),
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
        defaultValue: 1,
        min: 1,
        max: 10,
        step: 1,
        displayStepper: true,
    },
    step1: makeStepControl(0, makeDefaultFormStep()),
    step2: makeStepControl(1, makeDefaultNotesFormStep(2)),
    step3: makeStepControl(2, makeDefaultBlankFormStep(3)),
    step4: makeStepControl(3, makeDefaultBlankFormStep(4)),
    step5: makeStepControl(4, makeDefaultBlankFormStep(5)),
    step6: makeStepControl(5, makeDefaultBlankFormStep(6)),
    step7: makeStepControl(6, makeDefaultBlankFormStep(7)),
    step8: makeStepControl(7, makeDefaultBlankFormStep(8)),
    step9: makeStepControl(8, makeDefaultBlankFormStep(9)),
    step10: makeStepControl(9, makeDefaultBlankFormStep(10)),

    calendar: {
        type: ControlType.Object,
        title: "Calendar",
        icon: "object",
        buttonTitle: "Calendar",
        controls: {
            title: {
                type: ControlType.String,
                title: "Title",
                defaultValue: DEFAULT_CALENDAR_TITLE,
            },
            subtitle: {
                type: ControlType.String,
                title: "Subtitle",
                defaultValue: DEFAULT_CALENDAR_SUBTITLE,
                displayTextArea: true,
            },
            surface: {
                type: ControlType.Object,
                title: "Styles",
                buttonTitle: "Styles",
                icon: "color",
                optional: true,
                controls: makeCalendarStylesStylesControls(),
            },
        },
    },
    styles: {
        type: ControlType.Object,
        title: "Styles",
        icon: "color",
        buttonTitle: "Styles",
        controls: {
            // BE-118: Text Align + Head Font + Body Font are one
            // Header item opening a submenu (same rows/values, new nesting).
            header: {
                type: ControlType.Object,
                title: "Header",
                buttonTitle: "Header",
                controls: {
                    contentAlignment: {
                        type: ControlType.Enum,
                        title: "Text Align",
                        options: ["left", "center", "right"],
                        optionTitles: ["Left", "Center", "Right"],
                        defaultValue: "left",
                        displaySegmentedControl: true,
                    },
                    headingFont: {
                        type: ControlType.Font,
                        title: "Head Font",
                        controls: "extended",
                        defaultFontType: "sans-serif",
                        defaultValue: {
                            fontSize: "22px",
                            variant: "Bold",
                            letterSpacing: "0em",
                            lineHeight: "1.2em",
                            textAlign: "left",
                        },
                    },
                    font: {
                        type: ControlType.Font,
                        title: "Body Font",
                        controls: "extended",
                        defaultFontType: "sans-serif",
                        defaultValue: {
                            fontSize: "14px",
                            variant: "Regular",
                            letterSpacing: "0em",
                            lineHeight: "1.5em",
                            textAlign: "left",
                        },
                    },
                },
            },
            fieldStyles: {
                type: ControlType.Object,
                title: "Field Styles",
                buttonTitle: "Field Styles",
                icon: "effect",
                optional: true,
                controls: makeGlobalFieldStylesControls(),
            },
            accentColor: {
                type: ControlType.Color,
                title: "Accent",
                defaultValue: "#222222",
            },
            accentForegroundColor: {
                type: ControlType.Color,
                title: "Primary Foreground",
                defaultValue: "#FFFFFF",
            },
            surfaceColor: {
                type: ControlType.Color,
                title: "Surface",
                defaultValue: "#F7F8FA",
            },
            textPrimaryColor: {
                type: ControlType.Color,
                title: "Text",
                defaultValue: "#222222",
            },
            borderColor: {
                type: ControlType.Color,
                title: "Border",
                defaultValue: FIELD_STYLES_BORDER_COLOR,
            },
            borderRadius: {
                type: ControlType.Number,
                title: "Radius",
                defaultValue: 12,
                min: 0,
                max: 24,
                step: 1,
                unit: "px",
                displayStepper: true,
            },
            gap: {
                type: ControlType.Number,
                title: "Gap",
                defaultValue: 24,
                min: 0,
                max: 48,
                step: 1,
                unit: "px",
                displayStepper: true,
            },
            progressGap: {
                type: ControlType.Number,
                title: "Progress Gap",
                defaultValue: SECTION_SPACING_DEFAULTS.progress,
                min: SECTION_SPACING_MIN,
                max: SECTION_SPACING_MAX,
                step: 1,
                unit: "px",
                displayStepper: true,
            },
            headingGap: {
                type: ControlType.Number,
                title: "Heading Gap",
                defaultValue: SECTION_SPACING_DEFAULTS.heading,
                min: SECTION_SPACING_MIN,
                max: SECTION_SPACING_MAX,
                step: 1,
                unit: "px",
                displayStepper: true,
            },
            footerGap: {
                type: ControlType.Number,
                title: "Footer Gap",
                defaultValue: SECTION_SPACING_DEFAULTS.footer,
                min: SECTION_SPACING_MIN,
                max: SECTION_SPACING_MAX,
                step: 1,
                unit: "px",
                displayStepper: true,
            },
        },
    },
    buttonLabels: {
        type: ControlType.Object,
        title: "Buttons",
        icon: "object",
        buttonTitle: "Buttons",
        controls: {
            buttonsLayout: {
                type: ControlType.Object,
                title: "Layout",
                buttonTitle: "Layout",
                icon: "object",
                controls: {
                    groupNavButtons: {
                        type: ControlType.Boolean,
                        title: "Layout",
                        defaultValue: false,
                        enabledTitle: "Grouped",
                        disabledTitle: "Split",
                        hidden: (p: ButtonsLayoutControlProps) => p?.buttonWidth === "fill",
                    },
                    groupedNavAlignment: {
                        type: ControlType.Enum,
                        title: "Align",
                        options: ["left", "center", "right"],
                        optionTitles: ["Left", "Center", "Right"],
                        defaultValue: "right",
                        displaySegmentedControl: true,
                        hidden: (p: ButtonsLayoutControlProps) => p?.groupNavButtons !== true,
                    },
                    buttonOrder: {
                        type: ControlType.Enum,
                        title: "Back Position",
                        options: ["backFirst", "primaryFirst"],
                        optionTitles: ["Left", "Right"],
                        defaultValue: "backFirst",
                        displaySegmentedControl: true,
                    },
                    buttonWidth: {
                        type: ControlType.Enum,
                        title: "Width",
                        options: ["fit", "fill"],
                        optionTitles: ["Fit", "Fill"],
                        defaultValue: "fit",
                        displaySegmentedControl: true,
                    },
                },
            },
            primaryButtonStyles: {
                type: ControlType.Object,
                title: "Primary Buttons",
                buttonTitle: "Primary Buttons",
                icon: "effect",
                optional: true,
                controls: makeSharedButtonStylesControls({
                    padding: "10px 16px 10px 16px",
                    borderWidth: 0,
                    borderColor: FIELD_STYLES_BORDER_COLOR,
                }),
            },
            secondaryButtonStyles: {
                type: ControlType.Object,
                title: "Secondary Buttons",
                buttonTitle: "Secondary Buttons",
                icon: "effect",
                optional: true,
                controls: makeSharedButtonStylesControls({
                    padding: "10px 16px 10px 16px",
                    borderWidth: 1,
                    borderColor: FIELD_STYLES_BORDER_COLOR,
                }),
            },
            calendarLinkStyles: {
                type: ControlType.Object,
                title: "Calendar Links",
                buttonTitle: "Calendar Links",
                icon: "effect",
                optional: true,
                controls: makeSharedButtonStylesControls({
                    padding: "10px 18px 10px 18px",
                    borderWidth: 1,
                    borderColor: "#222222",
                }),
            },
            // BUTTON-TEXTS (BE-027/BE-038): one submenu for the three
            // editable labels. Every other label is a constant, not a row.
            buttonTexts: {
                type: ControlType.Object,
                title: "Button Texts",
                buttonTitle: "Button Texts",
                icon: "object",
                optional: true,
                controls: {
                    continueLabel: {
                        type: ControlType.String,
                        title: "Next Step",
                        defaultValue: "Continue",
                    },
                    backLabel: {
                        type: ControlType.String,
                        title: "Back Step",
                        defaultValue: "Back",
                    },
                    finalActionLabel: {
                        type: ControlType.String,
                        title: "Final Action",
                        defaultValue: "Book Now",
                    },
                    // BE-083: the Manage menu-item label moved here from Copy.
                    manageLinkLabel: {
                        type: ControlType.String,
                        title: "Manage Link",
                        defaultValue: DEFAULT_COPY_RESCHEDULE_OR_CANCEL_LABEL,
                    },
                },
            },
            // BUTTON-GROUPS-REMOVED (BE-027/BE-028): per-button
            // Text-only groups are gone; stored objects remain
            // readable as legacy style carriers (rule 142).
        },
    },
    progressBar: {
        type: ControlType.Object,
        title: "Progress",
        icon: "object",
        buttonTitle: "Progress",
        controls: {
            barVisible: {
                type: ControlType.Boolean,
                title: "Bar Visible",
                defaultValue: true,
            },
            barStyle: {
                type: ControlType.Enum,
                title: "Bar Style",
                options: ["solid", "dashed"],
                optionTitles: ["Solid", "Dashed"],
                defaultValue: "dashed",
                displaySegmentedControl: true,
                hidden: (p: ProgressBarControlProps) => (p?.barVisible ?? p?.visible) === false,
            },
            showText: {
                type: ControlType.Boolean,
                title: "Show Text",
                defaultValue: true,
            },
            progressText: {
                type: ControlType.Enum,
                title: "Progress Text",
                options: ["top", "bottom"],
                optionTitles: ["Top", "Bottom"],
                defaultValue: "top",
                displaySegmentedControl: true,
                hidden: (p: ProgressBarControlProps) =>
                    (p?.showText ?? p?.showTextContent) === false ||
                    (p?.barVisible ?? p?.visible) === false,
            },
            // BE-083: progress copy moved here from Copy (grouped with its control).
            content: {
                type: ControlType.Object,
                title: "Content",
                icon: "object",
                buttonTitle: "Content",
                optional: true,
                controls: {
                    stepCounterTemplate: {
                        type: ControlType.String,
                        title: "Step Counter",
                        defaultValue: "Step {current} of {total}",
                    },
                    stepProgressLabel: {
                        type: ControlType.String,
                        title: "Step Progress",
                        defaultValue: DEFAULT_COPY_STEP_PROGRESS_TEMPLATE,
                    },
                    stepAnnouncementTemplate: {
                        type: ControlType.String,
                        title: "Step Announcement Template",
                        defaultValue: DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE,
                        displayTextArea: true,
                    },
                },
            },
        },
    },
    transitionSettings: {
        type: ControlType.Object,
        title: "Transition",
        icon: "object",
        buttonTitle: "Transition",
        controls: {
            transition: {
                type: ControlType.Transition,
                title: "Transition",
                defaultValue: {
                    type: "tween",
                    ease: [0.44, 0, 0.56, 1],
                    duration: 0.4,
                },
            },
            variant: {
                type: ControlType.Enum,
                title: "Transition Type",
                options: ["fadeRise", "blurScale", "slide", "zoom", "verticalSlide", "blurSlide"],
                optionTitles: [
                    "Fade Rise",
                    "Blur Scale",
                    "Slide",
                    "Zoom",
                    "Vertical Slide",
                    "Blur Slide",
                ],
                defaultValue: "blurScale",
            },
            thumbStiffness: {
                type: ControlType.Number,
                title: "Thumb Stiffness",
                defaultValue: 400,
                min: 50,
                max: 1000,
                step: 10,
                displayStepper: true,
                description: "Slide speed of the segmented thumb — higher is snappier.",
            },
            thumbDamping: {
                type: ControlType.Number,
                title: "Thumb Damping",
                defaultValue: 38,
                min: 5,
                max: 100,
                step: 1,
                displayStepper: true,
                description: "Calmness of the segmented thumb — higher means less overshoot and bounce.",
            },
        },
    },
    calApiKey: {
        type: ControlType.String,
        title: "Cal.com API Key",
        defaultValue: "",
        obscured: true,
        placeholder: "Paste a key from Cal.com Settings → Developer",
    },
    calEventTypeId: {
        type: ControlType.String,
        title: "Cal.com Event ID",
        defaultValue: "",
        placeholder: "The number in your event type URL",
    },
    advanced: {
        type: ControlType.Object,
        title: "Advanced",
        icon: "object",
        buttonTitle: "Advanced",
        controls: {
            copy: {
                type: ControlType.Object,
                title: "Copy",
                icon: "object",
                buttonTitle: "Copy",
                controls: {
                    success: {
                        type: ControlType.Object,
                        title: "Success Screen",
                        icon: "object",
                        buttonTitle: "Success Screen",
                        optional: true,
                        controls: {
                            successTitle: {
                                type: ControlType.String,
                                title: "Success Title",
                                defaultValue: "Booked Successfully",
                            },
                            successSubtitle: {
                                type: ControlType.String,
                                title: "Success Subtitle",
                                defaultValue:
                                    "Your appointment details are below, add them to your calendar.",
                                displayTextArea: true,
                            },
                        },
                    },
                    failure: {
                        type: ControlType.Object,
                        title: "Error Screen",
                        icon: "object",
                        buttonTitle: "Error Screen",
                        optional: true,
                        controls: {
                            errorTitle: {
                                type: ControlType.String,
                                title: "Error Title",
                                defaultValue: "Something went wrong while processing your booking",
                            },
                            errorSubtitle: {
                                type: ControlType.String,
                                title: "Error Subtitle",
                                defaultValue: "Your details are saved, try again in a moment.",
                                displayTextArea: true,
                            },
                            unknownErrorLabel: {
                                type: ControlType.String,
                                title: "Unknown Error",
                                defaultValue: DEFAULT_COPY_UNKNOWN_ERROR_LABEL,
                            },
                            errorFallbackMessage: {
                                type: ControlType.String,
                                title: "Submit Error Fallback",
                                defaultValue: DEFAULT_COPY_SUBMIT_ERROR_FALLBACK,
                                displayTextArea: true,
                            },
                        },
                    },
                    calEventMetaUnavailableCopy: {
                        type: ControlType.String,
                        title: "Event Info Unavailable",
                        defaultValue: CAL_META_UNAVAILABLE_COPY,
                    },
                    errorCopy: {
                        type: ControlType.Object,
                        title: "Booking Error Messages",
                        icon: "object",
                        buttonTitle: "Booking Error Messages",
                        controls: {
                            credentialError: {
                                type: ControlType.String,
                                title: "Credentials Rejected",
                                defaultValue: ERROR_COPY_DEFAULTS.credentialError,
                            },
                            timeTakenError: {
                                type: ControlType.String,
                                title: "Slot Just Taken",
                                defaultValue: ERROR_COPY_DEFAULTS.timeTakenError,
                            },
                            invalidEmailError: {
                                type: ControlType.String,
                                title: "Invalid Email",
                                defaultValue: ERROR_COPY_DEFAULTS.invalidEmailError,
                            },
                            timeNoLongerAvailableError: {
                                type: ControlType.String,
                                title: "Time No Longer Available",
                                defaultValue: ERROR_COPY_DEFAULTS.timeNoLongerAvailableError,
                            },
                            networkError: {
                                type: ControlType.String,
                                title: "Network / Connection",
                                defaultValue: ERROR_COPY_DEFAULTS.networkError,
                            },
                            submitTimeoutError: {
                                type: ControlType.String,
                                title: "Submit Timed Out",
                                defaultValue: ERROR_COPY_DEFAULTS.submitTimeoutError,
                            },
                            malformedResponseError: {
                                type: ControlType.String,
                                title: "Unusable Response",
                                defaultValue: ERROR_COPY_DEFAULTS.malformedResponseError,
                            },
                            badRequestError: {
                                type: ControlType.String,
                                title: "Request Rejected (400)",
                                defaultValue: ERROR_COPY_DEFAULTS.badRequestError,
                            },
                            attendeeContactError: {
                                type: ControlType.String,
                                title: "Missing Contact Details",
                                defaultValue: ERROR_COPY_DEFAULTS.attendeeContactError,
                            },
                            emptyResponseError: {
                                type: ControlType.String,
                                title: "Empty Confirmation",
                                defaultValue: ERROR_COPY_DEFAULTS.emptyResponseError,
                            },
                            httpStatusTemplate: {
                                type: ControlType.String,
                                title: "HTTP Error Template",
                                placeholder: "Include {status} where the HTTP code should appear",
                                defaultValue: ERROR_COPY_DEFAULTS.httpStatusTemplate,
                            },
                            slotsTimeoutError: {
                                type: ControlType.String,
                                title: "Availability Timed Out",
                                defaultValue: ERROR_COPY_DEFAULTS.slotsTimeoutError,
                            },
                            slotsNotFoundError: {
                                type: ControlType.String,
                                title: "Event Type Not Found",
                                defaultValue: ERROR_COPY_DEFAULTS.slotsNotFoundError,
                            },
                            slotsRateLimitTemplate: {
                                type: ControlType.String,
                                title: "Rate Limited Template",
                                placeholder: "Include {seconds} where the wait time should appear",
                                defaultValue: ERROR_COPY_DEFAULTS.slotsRateLimitTemplate,
                            },
                            slotsRateLimitGenericError: {
                                type: ControlType.String,
                                title: "Rate Limited (No Wait)",
                                defaultValue: ERROR_COPY_DEFAULTS.slotsRateLimitGenericError,
                            },
                            slotsUnavailableError: {
                                type: ControlType.String,
                                title: "Service Unavailable",
                                defaultValue: ERROR_COPY_DEFAULTS.slotsUnavailableError,
                            },
                            slotsFallbackError: {
                                type: ControlType.String,
                                title: "Availability Load Failed",
                                defaultValue: ERROR_COPY_DEFAULTS.slotsFallbackError,
                            },
                            offlineError: {
                                type: ControlType.String,
                                title: "Offline Check",
                                defaultValue: ERROR_COPY_DEFAULTS.offlineError,
                            },
                            missingSlotError: {
                                type: ControlType.String,
                                title: "No Slot Selected",
                                defaultValue: ERROR_COPY_DEFAULTS.missingSlotError,
                            },
                            misconfiguredFormError: {
                                type: ControlType.String,
                                title: "Form Misconfigured",
                                defaultValue: ERROR_COPY_DEFAULTS.misconfiguredFormError,
                            },
                            invalidSlotTimeError: {
                                type: ControlType.String,
                                title: "Invalid Slot Time",
                                defaultValue: ERROR_COPY_DEFAULTS.invalidSlotTimeError,
                            },
                            unavailableTitle: {
                                type: ControlType.String,
                                title: "Unavailable Title",
                                defaultValue: ERROR_COPY_DEFAULTS.unavailableTitle,
                            },
                            unavailableBody: {
                                type: ControlType.String,
                                title: "Unavailable Body",
                                defaultValue: ERROR_COPY_DEFAULTS.unavailableBody,
                            },
                            unavailableMessage: {
                                type: ControlType.String,
                                title: "Unavailable (No Credentials)",
                                defaultValue: ERROR_COPY_DEFAULTS.unavailableMessage,
                            },
                        },
                    },
                    validation: {
                        type: ControlType.Object,
                        title: "Validation Messages",
                        icon: "object",
                        buttonTitle: "Validation Messages",
                        controls: {
                            requiredFieldError: {
                                type: ControlType.String,
                                title: "Required Field",
                                defaultValue: DEFAULT_VALIDATION_COPY.requiredFieldError,
                            },
                            emailError: {
                                type: ControlType.String,
                                title: "Invalid Email",
                                defaultValue: DEFAULT_VALIDATION_COPY.emailError,
                            },
                            phoneError: {
                                type: ControlType.String,
                                title: "Invalid Phone",
                                defaultValue: DEFAULT_VALIDATION_COPY.phoneError,
                            },
                            numberError: {
                                type: ControlType.String,
                                title: "Invalid Number",
                                defaultValue: DEFAULT_VALIDATION_COPY.numberError,
                            },
                            urlError: {
                                type: ControlType.String,
                                title: "Invalid URL",
                                defaultValue: DEFAULT_VALIDATION_COPY.urlError,
                            },
                            minLengthError: {
                                type: ControlType.String,
                                title: "Too Short",
                                defaultValue: DEFAULT_VALIDATION_COPY.minLengthError,
                            },
                            maxLengthError: {
                                type: ControlType.String,
                                title: "Too Long",
                                defaultValue: DEFAULT_VALIDATION_COPY.maxLengthError,
                            },
                            pickDateTimeError: {
                                type: ControlType.String,
                                title: "No Time Picked",
                                defaultValue: DEFAULT_VALIDATION_COPY.pickDateTimeError,
                            },
                            pastTimeError: {
                                type: ControlType.String,
                                title: "Past Time",
                                defaultValue: DEFAULT_VALIDATION_COPY.pastTimeError,
                            },
                        },
                    },
                },
            },
            calApiBaseUrl: {
                type: ControlType.String,
                title: "Cal.com API Base URL",
                defaultValue: DEFAULT_CAL_API_BASE_URL,
            },
            instanceId: {
                type: ControlType.String,
                title: "Instance ID",
                placeholder: "e.g. main-booking",
                description:
                    "Use a unique ID when multiple identical Booking share a page.",
                defaultValue: "",
            },
        },
    },
})

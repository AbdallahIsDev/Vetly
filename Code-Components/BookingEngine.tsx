
import {
	addPropertyControls,
	ControlType,
	RenderTarget,
	useIsStaticRenderer,
} from "framer";
import {
	motion,
	MotionConfig,
	useReducedMotion,
	type Transition,
	type Variants,
} from "framer-motion";
import * as React from "react";
import * as ReactDOM from "react-dom";

declare global {
	interface Window {
		__BE_STEP_DEBUG__?: boolean;
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
	| "successColor";
type Theme = Record<ThemeToken, string>;

const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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
};

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

type ParsedRgba = { r: number; g: number; b: number; a: number } | null;
const PARSE_COLOR_CACHE = new Map<string, ParsedRgba>();
function parseColorToRgba(color: string): ParsedRgba {
	const trimmed = (color || "").trim().toLowerCase();
	const cached = PARSE_COLOR_CACHE.get(trimmed);
	if (cached !== undefined || PARSE_COLOR_CACHE.has(trimmed)) {
		return cached ?? null;
	}
	if (PARSE_COLOR_CACHE.size >= 1000) PARSE_COLOR_CACHE.clear();
	const parsed = parseColorToRgbaUncached(trimmed);
	PARSE_COLOR_CACHE.set(trimmed, parsed);
	return parsed;
}
function parseColorToRgbaUncached(color: string): ParsedRgba {
	const trimmed = (color || "").trim().toLowerCase();
	if (!trimmed) return null;
	if (trimmed === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
	if (trimmed === "currentcolor") return { r: 0, g: 0, b: 0, a: 0 };

	const hex = trimmed.replace(/^#/, "");
	if (/^[0-9a-f]+$/.test(hex) && [3, 4, 6, 8].includes(hex.length)) {
		let normalized = hex;
		if (hex.length === 3 || hex.length === 4) {
			normalized = hex
				.split("")
				.map((ch) => ch + ch)
				.join("");
		}
		const r = parseInt(normalized.slice(0, 2), 16);
		const g = parseInt(normalized.slice(2, 4), 16);
		const b = parseInt(normalized.slice(4, 6), 16);
		const aHex = normalized.slice(6, 8);
		const a = aHex ? parseInt(aHex, 16) / 255 : 1;
		if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
		return { r, g, b, a };
	}

	if (NAMED_COLORS[trimmed]) {
		const named = parseColorToRgba(NAMED_COLORS[trimmed]);
		if (!named) return null;
		return { ...named, a: 1 };
	}

	const hslMatch = /^hsla?\((.*)\)$/i.exec(trimmed);
	if (hslMatch) {
		const inner = hslMatch[1].trim();
		const [huePart, satLumAlpha] = inner.split("/");
		const tokens = (huePart || "")
			.replace(/,/g, " ")
			.split(/\s+/)
			.filter(Boolean);
		if (tokens.length < 3) return null;
		let hue = parseFloat(tokens[0]);
		if (Number.isNaN(hue)) return null;
		if (tokens[0].endsWith("grad")) {
			hue = (hue * 360) / 400;
		} else if (tokens[0].endsWith("rad")) {
			hue = (hue * 180) / Math.PI;
		} else if (tokens[0].endsWith("turn")) {
			hue = hue * 360;
		}
		const parsePct = (token: string): number | null => {
			const value = parseFloat(token);
			if (Number.isNaN(value)) return null;
			return value / 100;
		};
		const s = parsePct(tokens[1]);
		const l = parsePct(tokens[2]);
		if (s === null || l === null) return null;
		let a = 1;
		const alphaToken = (satLumAlpha?.trim() || tokens[3] || "").trim();
		if (alphaToken) {
			if (alphaToken.endsWith("%")) {
				a = parseFloat(alphaToken) / 100;
			} else {
				a = parseFloat(alphaToken);
			}
			if (Number.isNaN(a)) a = 1;
		}
		a = clamp(a, 0, 1);
		const h = (((hue % 360) + 360) % 360) / 360;
		const sC = clamp(s, 0, 1);
		const lC = clamp(l, 0, 1);
		if (sC === 0) {
			const v = Math.round(lC * 255);
			return { r: v, g: v, b: v, a };
		}
		const hue2rgb = (p: number, q: number, t: number): number => {
			let tn = t;
			if (tn < 0) tn += 1;
			if (tn > 1) tn -= 1;
			if (tn < 1 / 6) return p + (q - p) * 6 * tn;
			if (tn < 1 / 2) return q;
			if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
			return p;
		};
		const q = lC < 0.5 ? lC * (1 + sC) : lC + sC - lC * sC;
		const p = 2 * lC - q;
		return {
			r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
			g: Math.round(hue2rgb(p, q, h) * 255),
			b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
			a,
		};
	}

	const rgbMatch = /^rgba?\((.*)\)$/i.exec(trimmed);
	if (!rgbMatch) return null;
	const inner = rgbMatch[1].trim();
	const [channelsPart, alphaPart] = inner.split("/");
	const tokens = (channelsPart || "")
		.replace(/,/g, " ")
		.split(/\s+/)
		.filter(Boolean);
	if (tokens.length < 3) return null;
	const parseChannel = (token: string): number | null => {
		const value = token.trim();
		if (value.endsWith("%")) {
			const p = parseFloat(value.slice(0, -1));
			if (Number.isNaN(p)) return null;
			return clamp((p / 100) * 255, 0, 255);
		}
		const parsed = parseFloat(value);
		if (Number.isNaN(parsed)) return null;
		return clamp(parsed, 0, 255);
	};
	const r = parseChannel(tokens[0]);
	const g = parseChannel(tokens[1]);
	const b = parseChannel(tokens[2]);
	if (r === null || g === null || b === null) return null;
	let a = 1;
	const alphaToken = (alphaPart?.trim() || tokens[3] || "").trim();
	if (alphaToken) {
		if (alphaToken.endsWith("%")) {
			a = parseFloat(alphaToken) / 100;
		} else {
			a = parseFloat(alphaToken);
		}
		if (Number.isNaN(a)) a = 1;
	}
	a = clamp(a, 0, 1);
	return { r, g, b, a };
}

const TEXT_ON_ACCENT = "#FFFFFF";

const SUPPORTS_COLOR_MIX =
	typeof CSS !== "undefined" &&
	typeof CSS.supports === "function" &&
	CSS.supports("color", "color-mix(in srgb, red, blue)");

function withAlpha(color: string, alpha: number, background?: string): string {
	const safeAlpha = clamp(alpha, 0, 1);
	const parsed = parseColorToRgba(color);
	if (parsed) {
		const effectiveAlpha = clamp(parsed.a * safeAlpha, 0, 1);
		if (background) {
			const bg = parseColorToRgba(background);
			if (bg && effectiveAlpha > 0) {
				const mix = (c: number, b: number) =>
					Math.round(c * effectiveAlpha + b * (1 - effectiveAlpha));
				return `rgb(${mix(parsed.r, bg.r)}, ${mix(parsed.g, bg.g)}, ${mix(
					parsed.b,
					bg.b,
				)})`;
			}
			if (bg) return `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
		}
		if (effectiveAlpha >= 1) {
			return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`;
		}
		return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${effectiveAlpha})`;
	}
	if (!SUPPORTS_COLOR_MIX) return color;
	return `color-mix(in srgb, ${color} ${safeAlpha * 100}%, transparent)`;
}

function pageLocale(): string | undefined {
	return typeof document !== "undefined"
		? document.documentElement.lang || undefined
		: undefined;
}

const DEFAULT_COPY_CONFIRMATION_NUMBER_LABEL = "Confirmation #";
const DEFAULT_COPY_RESCHEDULE_OR_CANCEL_LABEL = "Reschedule or cancel";
const DEFAULT_COPY_PICK_DATE_TO_SEE_TIMES_LABEL = "Pick a date to see times";
const DEFAULT_COPY_NO_TIMES_FALLBACK_LABEL = "No available times";
const DEFAULT_COPY_STEP_PROGRESS_TEMPLATE = "{pct}% complete";
const DEFAULT_COPY_UNKNOWN_ERROR_LABEL = "Unknown error";
const DEFAULT_COPY_SUBMIT_ERROR_FALLBACK =
	"Something went wrong while submitting your booking. Please try again.";
const DEFAULT_COPY_AM_LABEL = "AM";
const DEFAULT_COPY_PM_LABEL = "PM";
const DEFAULT_COPY_HOUR_SUFFIX = "hr";
const DEFAULT_COPY_MINUTE_SUFFIX = "min";
const DEFAULT_COPY_ICS_PRODID = "//BookingEngine//Framer//EN";
const DEFAULT_COPY_ICS_SUMMARY_FALLBACK = "Booking";
const DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL = "Selected Time";
const DEFAULT_COPY_NOTES_DATE_PREFIX = "Date: ";
const DEFAULT_COPY_NOTES_TIME_PREFIX = "Time: ";
const DEFAULT_COPY_STEP_COUNTER_TEMPLATE = "Step {current} of {total}";
const DEFAULT_COPY_TIMEFORMAT_LABEL = "Time format";
const DEFAULT_COPY_LOADING_LABEL = "Loading availability…";
const DEFAULT_COPY_NO_TIMES_LABEL =
	"No available times on the selected date. Try another day.";
const DEFAULT_COPY_BOOKING_LABEL = "Booking…";
const DEFAULT_COPY_DATE_LABEL = "Date";
const DEFAULT_COPY_TIME_LABEL = "Time";
const DEFAULT_COPY_RETRY_LABEL = "Try again";
const DEFAULT_DEMO_START_TIME = "09:00";
const DEFAULT_DEMO_END_TIME = "17:00";
const DEFAULT_DEMO_INTERVAL = 30;
const DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE =
	"{counter}, {percent}% complete";
const DEFAULT_COPY_RETURN_HOME_LABEL = "Done";
const DEFAULT_CONFIRM_BOOK_ANOTHER_LABEL = "Book another";
const DEFAULT_CONFIRM_ADD_TO_CALENDAR_LABEL = "Add to Calendar";
const DEFAULT_CONFIRM_HOME_URL = "/";
const DEFAULT_FONT_FAMILY = "Inter, system-ui, sans-serif";
const DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL = "Cancel";
const DEFAULT_ARIA_CHOICE_GROUP_LABEL = "Choice group";
const DEFAULT_ARIA_TIME_SLOTS_LABEL = "Time slots";
const DEFAULT_ARIA_AVAILABLE_TIMES_LABEL = "Available times";
const DEFAULT_ARIA_DATE_PICKER_LABEL = "Date picker";
const DEFAULT_ARIA_BOOKING_PROGRESS_LABEL = "Booking progress";
const DEFAULT_ARIA_BOOKING_FORM_LABEL = "Booking form";
const DEFAULT_ARIA_PREVIOUS_MONTH_TEMPLATE = "Previous month, {month}";
const DEFAULT_ARIA_NEXT_MONTH_TEMPLATE = "Next month, {month}";
const DEFAULT_ARIA_LABELS = {
	choiceGroup: DEFAULT_ARIA_CHOICE_GROUP_LABEL,
	timeSlots: DEFAULT_ARIA_TIME_SLOTS_LABEL,
	availableTimes: DEFAULT_ARIA_AVAILABLE_TIMES_LABEL,
	datePicker: DEFAULT_ARIA_DATE_PICKER_LABEL,
	bookingProgress: DEFAULT_ARIA_BOOKING_PROGRESS_LABEL,
	bookingForm: DEFAULT_ARIA_BOOKING_FORM_LABEL,
	previousMonthTemplate: DEFAULT_ARIA_PREVIOUS_MONTH_TEMPLATE,
	nextMonthTemplate: DEFAULT_ARIA_NEXT_MONTH_TEMPLATE,
};

interface ErrorCopy {
	credentialError: string;
	timeTakenError: string;
	invalidEmailError: string;
	timeNoLongerAvailableError: string;
	networkError: string;
	submitTimeoutError: string;
	malformedResponseError: string;
	badRequestError: string;
	emptyResponseError: string;
	httpStatusTemplate: string;
	slotsTimeoutError: string;
	slotsNotFoundError: string;
	slotsRateLimitTemplate: string;
	slotsRateLimitGenericError: string;
	slotsUnavailableError: string;
	slotsFallbackError: string;
	offlineError: string;
	missingSlotError: string;
	misconfiguredFormError: string;
	invalidSlotTimeError: string;
	unavailableTitle: string;
	unavailableBody: string;
	unavailableMessage: string;
}
const ERROR_COPY_DEFAULTS: ErrorCopy = {
	credentialError:
		"The booking service rejected our credentials. Please contact the site owner.",
	timeTakenError:
		"That time was just taken by someone else. Please pick another slot.",
	invalidEmailError: "Please check the email address and try again.",
	timeNoLongerAvailableError:
		"That time is no longer available. Please pick another slot.",
	networkError:
		"We couldn't reach the booking service. Please check your connection and try again.",
	submitTimeoutError:
		"The booking service took too long to respond. Please try again.",
	malformedResponseError:
		"The booking service returned an unusable response. Please try again later, or contact the site owner if the problem persists.",
	badRequestError:
		"The booking service rejected the request details. Please go back, check your answers, and try again.",
	emptyResponseError:
		"We couldn't confirm your booking. Please check your email for a confirmation before trying again.",
	httpStatusTemplate: "Booking failed (HTTP {status})",
	slotsTimeoutError: "Loading availability timed out. Please try again.",
	slotsNotFoundError:
		"This booking form isn't configured correctly (event type not found). Please contact the site owner.",
	slotsRateLimitTemplate:
		"The booking service is rate-limiting requests. Please wait {seconds} seconds and try again.",
	slotsRateLimitGenericError:
		"Too many requests right now. Please wait a moment and try again.",
	slotsUnavailableError:
		"The booking service is temporarily unavailable. Please try again shortly.",
	slotsFallbackError: "Failed to load availability",
	offlineError:
		"You appear to be offline. Please check your connection and try again.",
	missingSlotError: "Please go back and pick a time slot before continuing.",
	misconfiguredFormError:
		"This booking form isn't fully configured: it's missing a name or email field. Please contact the site owner.",
	invalidSlotTimeError:
		"The selected time is invalid. Please go back and pick a time slot again.",
	unavailableTitle: "Booking is currently unavailable",
	unavailableBody: "Please call us to schedule your appointment.",
	unavailableMessage:
		"Booking is currently unavailable. Please call us directly to schedule your appointment.",
};

function parseTimeToMinutes(value: string): number {
	const match = /^(\d{1,2}):(\d{2})$/.exec((value || "").trim());
	if (!match) return 9 * 60;
	const h = clamp(parseInt(match[1], 10), 0, 23);
	const m = clamp(parseInt(match[2], 10), 0, 59);
	return h * 60 + m;
}

function minutesTo24h(minutes: number): string {
	const safe = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
	const h = Math.floor(safe / 60);
	const m = safe % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTimeLabel(
	minutes: number,
	mode: "12h" | "24h",
	amLabel: string = DEFAULT_COPY_AM_LABEL,
	pmLabel: string = DEFAULT_COPY_PM_LABEL,
): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (mode === "24h")
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
	const suffix = h >= 12 ? pmLabel : amLabel;
	const hh = h % 12 === 0 ? 12 : h % 12;
	return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

function isSameDay(a: Date | null, b: Date | null): boolean {
	if (!a || !b) return false;
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function getCachedDateTimeFormat(
	locale: string | undefined,
	options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
	const key = `${locale ?? ""}|${JSON.stringify(options)}`;
	let dtf = dtfCache.get(key);
	if (!dtf) {
		if (dtfCache.size >= 50) dtfCache.clear();
		dtf = new Intl.DateTimeFormat(locale ?? undefined, options);
		dtfCache.set(key, dtf);
	}
	return dtf;
}

function buildFutureAwareAvailableDates(
	slots: Array<{ value: string }>,
	timeZone: string,
	nowMs: number | null,
): Set<string> {
	const set = new Set<string>();
	for (const slot of slots) {
		if (nowMs !== null) {
			const start = new Date(slot.value).getTime();
			if (!Number.isFinite(start) || start <= nowMs) continue;
		}
		const key = slotDateKeyInTimeZone(slot.value, timeZone);
		if (key) set.add(key);
	}
	return set;
}

const slotDateKeyCache = new Map<string, string>();
function slotDateKeyInTimeZone(value: string, timeZone: string): string {
	const key = `${timeZone}|${value}`;
	const hit = slotDateKeyCache.get(key);
	if (hit !== undefined) return hit;
	if (slotDateKeyCache.size >= 2000) slotDateKeyCache.clear();
	const d = new Date(value);
	const computed = Number.isNaN(d.getTime())
		? ""
		: getDateKeyInTimeZone(d, timeZone);
	slotDateKeyCache.set(key, computed);
	return computed;
}

function getMinutesInTimeZone(date: Date, timeZone: string): number {
	try {
		const parts = getCachedDateTimeFormat("en-US", {
			timeZone,
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23",
		}).formatToParts(date);
		const hourPart = parts.find((p) => p.type === "hour")?.value;
		const minutePart = parts.find((p) => p.type === "minute")?.value;
		const h = Number(hourPart);
		const m = Number(minutePart);
		if (Number.isNaN(h) || Number.isNaN(m)) {
			return date.getHours() * 60 + date.getMinutes();
		}
		return ((h % 24) * 60 + m) % 1440;
	} catch {
		return date.getHours() * 60 + date.getMinutes();
	}
}

function getLocalDateKey(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
		2,
		"0",
	)}-${String(date.getDate()).padStart(2, "0")}`;
}
function getDateKeyInTimeZone(date: Date, timeZone: string): string {
	try {
		const parts = getCachedDateTimeFormat("en-US", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).formatToParts(date);
		const y = parts.find((p) => p.type === "year")?.value;
		const m = parts.find((p) => p.type === "month")?.value;
		const d = parts.find((p) => p.type === "day")?.value;
		if (y && m && d) return `${y}-${m}-${d}`;
	} catch {
		// Invalid/unsupported timeZone string — fall back to local time.
	}
	return getLocalDateKey(date);
}

function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getTodayInTimeZone(timeZone: string | undefined): Date {
	const tz = timeZone || "";
	const tzKey = getDateKeyInTimeZone(new Date(), tz);
	const parts = tzKey.split("-").map(Number);
	const y = parts[0] ?? 1970;
	const m = parts[1] ?? 1;
	const d = parts[2] ?? 1;
	let candidate = new Date(y, m - 1, d);
	for (let i = 0; i < 3; i++) {
		const candidateKey = getDateKeyInTimeZone(candidate, tz);
		if (candidateKey === tzKey) break;
		const day = candidate.getDate();
		candidate =
			candidateKey < tzKey
				? new Date(candidate.getFullYear(), candidate.getMonth(), day + 1)
				: new Date(candidate.getFullYear(), candidate.getMonth(), day - 1);
	}
	return candidate;
}

function parseRadiusNumber(value: string | number | undefined): number {
	const raw = typeof value === "number" ? value : parseFloat(String(value ?? ""));
	return Number.isFinite(raw) ? raw : 0;
}

function innerRadiusValue(
	value: string | number | undefined,
	inset: number,
): string {
	return `${Math.max(0, parseRadiusNumber(value) - inset)}px`;
}

function fontPixelSize(value: string | number | undefined): number | undefined {
	if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : undefined;
	if (typeof value === "string") {
		const parsed = Number.parseFloat(value);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
	}
	return undefined;
}

function resolveFieldBorder(
	fs: FieldStyleOverrides | undefined,
	fieldType?: FieldType,
): { width: number; style: string; color: string | undefined } {
	const eff = fieldType ? getFieldStylesEffectiveDefaults(fieldType) : null;
	const defWidth = eff?.borderWidth ?? FIELD_STYLES_BORDER_WIDTH;
	const defColor = eff?.borderColor ?? FIELD_STYLES_BORDER_COLOR;
	const b = fs?.border;
	const compoundSet =
		b != null &&
		(b.borderWidth != null ||
			b.borderColor != null ||
			b.borderStyle != null ||
			b.borderTopWidth != null ||
			b.borderRightWidth != null ||
			b.borderBottomWidth != null ||
			b.borderLeftWidth != null);
	if (compoundSet && b) {
		const sides = [
			b.borderTopWidth,
			b.borderRightWidth,
			b.borderBottomWidth,
			b.borderLeftWidth,
		].filter((v): v is number => typeof v === "number" && v > 0);
		const width = sides.length ? Math.max(...sides) : (b.borderWidth ?? defWidth);
		return { width, style: b.borderStyle || "solid", color: b.borderColor ?? defColor };
	}
	return { width: fs?.borderWidth ?? defWidth, style: "solid", color: fs?.borderColor ?? defColor };
}

function resolveFieldRadius(
	fs: FieldStyleOverrides | undefined,
	themeRadius: string | number,
	fieldType?: FieldType,
): string {
	if (typeof fs?.radius === "string" && fs.radius.trim()) return fs.radius;
	if (typeof fs?.radius === "number") return `${fs.radius}px`;
	if (fieldType) return getFieldStylesEffectiveDefaults(fieldType).radius;
	return typeof themeRadius === "number" ? `${themeRadius}px` : themeRadius;
}

function resolveFieldPadding(
	fs: FieldStyleOverrides | undefined,
	fieldType?: FieldType,
): string {
	if (typeof fs?.padding === "string" && fs.padding.trim()) return fs.padding;
	if (fs?.paddingY != null || fs?.paddingX != null) {
		return `${fs?.paddingY ?? 10}px ${fs?.paddingX ?? 14}px`;
	}
	if (fieldType) return getFieldStylesEffectiveDefaults(fieldType).padding;
	return FIELD_STYLES_INPUT_PADDING;
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
];
function normalizeStyleOverrides(
	fs: FieldStyleOverrides | undefined,
): FieldStyleOverrides | undefined {
	if (!fs) return fs;
	let out: FieldStyleOverrides | null = null;
	for (const key of STYLE_OVERRIDE_COLOR_KEYS) {
		if (fs[key] === "") {
			out ??= { ...fs };
			delete out[key];
		}
	}
	return out ?? fs;
}

function mergeStyleOverrides(
	base: FieldStyleOverrides | undefined,
	over: FieldStyleOverrides | undefined,
): FieldStyleOverrides | undefined {
	if (!base) return over;
	if (!over) return base;
	const out: FieldStyleOverrides = { ...base };
	const record = out as Record<string, unknown>;
	for (const key of Object.keys(over)) {
		const value: unknown = (over as Record<string, unknown>)[key];
		if (value !== undefined) record[key] = value;
	}
	return out;
}

/** Horizontal padding (px) from a resolved CSS padding string — used by the
 *  select variant, which reserves chevron room past the content padding. */
function paddingHorizontalFrom(padding: string): number {
	const parts = padding.trim().split(/\s+/).map((p) => Number.parseFloat(p));
	if (!parts.length || !Number.isFinite(parts[0])) return 14;
	return parts.length >= 2 && Number.isFinite(parts[1]) ? parts[1] : parts[0];
}

/** Vertical/horizontal axes (px) from a resolved CSS padding string — used by
 *  choice options, whose paddings are applied per-axis inline. */
function paddingAxesFrom(padding: string): { y: number; x: number } | null {
	const parts = padding.trim().split(/\s+/).map((p) => Number.parseFloat(p));
	if (!parts.length || !Number.isFinite(parts[0])) return null;
	if (parts.length === 1) return { y: parts[0], x: parts[0] };
	const y = parts[0];
	const x = Number.isFinite(parts[1]) ? parts[1] : y;
	return { y, x };
}

const DEFAULT_CALENDAR_SURFACE_BACKGROUND = "#FFFFFF";

const DERIVED_SECONDARY_TEXT_ALPHA = 0.62;
const DERIVED_SUCCESS_COLOR = "#15803D";
const FIXED_ERROR_COLOR = "#DC2626";

const FIELD_STYLES_INPUT_PADDING = "14px";
const FIELD_STYLES_SELECT_PADDING = "14px";
const FIELD_STYLES_CARDS_PADDING = "10px 8px 10px 8px";
const FIELD_STYLES_CARDS_COMPACT_PADDING = "10px 6px 10px 6px";
const FIELD_STYLES_PILLS_PADDING = "10px 12px 10px 12px";
const FIELD_STYLES_PILLS_COMPACT_PADDING = "10px 10px 10px 10px";
const FIELD_STYLES_SEGMENTED_PADDING = "11px 10px 11px 10px";
const FIELD_STYLES_SEGMENTED_COMPACT_PADDING = "10px 6px 10px 6px";
const FIELD_STYLES_SPACING = 6;
const FIELD_STYLES_CHECK_SIZE = 18;
const FIELD_STYLES_FIELD_RADIUS = "12px";
const FIELD_STYLES_CARDS_RADIUS = "12px";
const FIELD_STYLES_PILLS_RADIUS = "999px";
const FIELD_STYLES_SEGMENTED_RADIUS = "12px";
const FIELD_STYLES_BORDER_WIDTH = 1;
const FIELD_STYLES_BORDER_COLOR = "#E5E7EB";

function getFieldStylesEffectiveDefaults(fieldType: FieldType): {
	padding: string;
	radius: string;
	borderWidth: number;
	borderColor: string;
	minHeight: number;
	spacing: number;
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
			};
		case "pills":
			return {
				padding: FIELD_STYLES_PILLS_PADDING,
				radius: FIELD_STYLES_PILLS_RADIUS,
				borderWidth: FIELD_STYLES_BORDER_WIDTH,
				borderColor: FIELD_STYLES_BORDER_COLOR,
				minHeight: TOUCH_TARGET_MIN,
				spacing: FIELD_STYLES_SPACING,
			};
		case "segmented":
			return {
				padding: FIELD_STYLES_SEGMENTED_PADDING,
				radius: FIELD_STYLES_SEGMENTED_RADIUS,
				borderWidth: FIELD_STYLES_BORDER_WIDTH,
				borderColor: FIELD_STYLES_BORDER_COLOR,
				minHeight: TOUCH_TARGET_MIN,
				spacing: FIELD_STYLES_SPACING,
			};
		case "select":
			return {
				padding: FIELD_STYLES_SELECT_PADDING,
				radius: FIELD_STYLES_FIELD_RADIUS,
				borderWidth: FIELD_STYLES_BORDER_WIDTH,
				borderColor: FIELD_STYLES_BORDER_COLOR,
				minHeight: TOUCH_TARGET_MIN,
				spacing: FIELD_STYLES_SPACING,
			};
		case "checkbox":
			return {
				padding: "0px",
				radius: "4px",
				borderWidth: FIELD_STYLES_BORDER_WIDTH,
				borderColor: FIELD_STYLES_BORDER_COLOR,
				minHeight: FIELD_STYLES_CHECK_SIZE,
				spacing: FIELD_STYLES_SPACING,
			};
		case "calendar-widget":
			return {
				padding: "0px",
				radius: FIELD_STYLES_FIELD_RADIUS,
				borderWidth: 0,
				borderColor: FIELD_STYLES_BORDER_COLOR,
				minHeight: 0,
				spacing: FIELD_STYLES_SPACING,
			};
		default:
			return {
				padding: FIELD_STYLES_INPUT_PADDING,
				radius: FIELD_STYLES_FIELD_RADIUS,
				borderWidth: FIELD_STYLES_BORDER_WIDTH,
				borderColor: FIELD_STYLES_BORDER_COLOR,
				minHeight: TOUCH_TARGET_MIN,
				spacing: FIELD_STYLES_SPACING,
			};
	}
}

function Skeleton({
	width = "100%",
	height = 12,
	borderRadius = 6,
	background,
	style,
}: {
	width?: number | string;
	height?: number | string;
	borderRadius?: number | string;
	background: string;
	style?: React.CSSProperties;
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
	);
}

interface SegmentedControlProps {
	options: Array<{ label: string; value: string }>;
	value: string;
	onChange: (value: string) => void;
	borderRadius: string | number;
	textColor: string;
	mutedTextColor: string;
	backgroundColor: string;
	borderColor: string;
	ariaLabel?: string;
	disabled?: boolean;
	trackBackground?: string;
	thumbBorderColor?: string;
	optionPaddingX?: number;
	optionFont?: FramerFont;
	trackShadow?: string;
}

const SegmentedControl = React.memo(function SegmentedControl(props: SegmentedControlProps) {
	const { options, value, onChange, borderRadius, textColor, mutedTextColor, backgroundColor, borderColor, ariaLabel, disabled, trackBackground, thumbBorderColor, optionPaddingX, optionFont, trackShadow } = props;
	const isStaticRender = useIsStaticRenderer();
	const prefersReducedMotion = useReducedMotion();
	const count = options.length;
	const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
	const segmentInnerRadius = innerRadiusValue(borderRadius, 3);
	const thumbWidth = count > 0 ? `calc((100% - 6px) / ${count})` : "calc(50% - 3px)";
	const effectiveTrackBackground = trackBackground ?? withAlpha(borderColor, 0.14);
	const thumbBorder = thumbBorderColor ?? borderColor;
	const segmentFontSize =
		optionFont?.fontSize != null
			? fontPixelSize(optionFont.fontSize) ?? 13
			: 13;
	const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
	return (
		<div
			role="group"
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
				gap: 0,
				minHeight: 32,
				boxSizing: "border-box",
				...shadowStyle(trackShadow),
			}}
		>
			{isStaticRender ? (
				<div
					style={{
						position: "absolute",
						top: 3,
						bottom: 3,
						left: 3,
						width: thumbWidth,
						transform: `translateX(${selectedIndex * 100}%)`,
						borderRadius: segmentInnerRadius,
						background: backgroundColor,
						border: `1px solid ${thumbBorder}`,
						boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
						pointerEvents: "none",
					}}
				/>
			) : (
				<motion.div
					initial={false}
					animate={{ x: `${selectedIndex * 100}%` }}
					transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
					style={{
						position: "absolute",
						top: 3,
						bottom: 3,
						left: 3,
						width: thumbWidth,
						borderRadius: segmentInnerRadius,
						background: backgroundColor,
						border: `1px solid ${thumbBorder}`,
						boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
						pointerEvents: "none",
					}}
				/>
			)}
			{options.map((opt, idx) => {
				const active = opt.value === value;
				return (
					<button
						key={`${opt.value}-${idx}`}
						ref={(node) => {
							buttonRefs.current[idx] = node;
						}}
						type="button"
						aria-pressed={active}
						disabled={disabled}
						onClick={() => !disabled && onChange(opt.value)}
						onKeyDown={(e) => {
							let targetIdx: number | null = null;
							if (e.key === "ArrowRight") targetIdx = (idx + 1) % count;
							else if (e.key === "ArrowLeft") targetIdx = (idx - 1 + count) % count;
							else if (e.key === "Home") targetIdx = 0;
							else if (e.key === "End") targetIdx = count - 1;
							if (targetIdx !== null) {
								e.preventDefault();
								buttonRefs.current[targetIdx]?.focus();
							}
						}}
						style={{
							position: "relative",
							zIndex: 1,
							width: "100%",
							padding: `0 ${optionPaddingX ?? 8}px`,
							border: "none",
							borderRadius: segmentInnerRadius,
							background: "transparent",
							color: active ? textColor : mutedTextColor,
							cursor: disabled ? "not-allowed" : "pointer",
							fontFamily: optionFont?.fontFamily ?? "inherit",
							fontSize: segmentFontSize,
							fontWeight: 600,
							...(optionFont?.letterSpacing != null
								? { letterSpacing: optionFont.letterSpacing }
								: {}),
							...(optionFont?.lineHeight != null
								? { lineHeight: optionFont.lineHeight }
								: {}),
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
});

if (typeof window !== "undefined") {
	((window as unknown) as Record<string, unknown>).__BE_SEGMENTED_SHARED__ = true;
}

interface OptionImageSource {
	src?: string;
	srcSet?: string;
	alt?: string;
}

function optionImageSrc(image: string | OptionImageSource | undefined): string | undefined {
	if (typeof image === "string") return image || undefined;
	return image?.src || undefined;
}

interface ChoiceOption {
	label: string;
	value?: string;
	glyph?: string;
	image?: string | OptionImageSource;
	description?: string;
	disabled?: boolean;
}

function optionValue(option: ChoiceOption): string {
	return option.value ?? option.label;
}

interface ChoiceGroupInlineProps {
	label: string;
	inputName: string;
	defaultValue: string;
	variant: "cards" | "segmented" | "pills" | "radio";
	optionsText: string;
	/** Direct options array — takes precedence over optionsText and avoids
	 *  the comma-round-trip split bug (fix #22). */
	options?: ChoiceOption[];
	accentColor: string;
	accentForegroundColor?: string;
	textColor: string;
	mutedTextColor: string;
	backgroundColor: string;
	borderColor: string;
	radius: number | string;
	fontSize: number;
	controlledValue?: string;
	/** a11y: marks the group as invalid (fix #16). */
	ariaInvalid?: boolean;
	/** a11y: id of an element describing the error (fix #16). */
	ariaDescribedBy?: string;
	/** a11y: accessible name for the radiogroup when `label` is absent
	 *  (threaded from FieldRenderer's copy.aria.choiceGroup). */
	choiceGroupAriaLabel?: string;
	showLabel?: boolean;
	required?: boolean;
	isSubmitting?: boolean;
	onChange?: (value: string) => void;
	selectedBackgroundColor?: string;
	selectedTextColor?: string;
	selectedBorderColor?: string;
	optionHoverBorderColor?: string;
	optionBorderWidth?: number;
	optionRadius?: number | string;
	optionPaddingY?: number;
	optionPaddingX?: number;
	optionMinHeight?: number;
	optionFont?: FramerFont;
	optionShadow?: string;
	trackBackground?: string;
}

function getInitialSelection(
	options: ChoiceOption[],
	defaultValue: string,
): string {
	if (options.length === 0) return "";
	const match = options.find((option) => optionValue(option) === defaultValue);
	if (match) return optionValue(match);
	const fallback = options.find((option) => option.label.length > 0);
	return fallback ? optionValue(fallback) : "";
}

function buildWeekdayLabels(firstDayOfWeek: number): string[] {
	const base = new Date(2023, 0, 1); // a known Sunday
	const labels: string[] = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(base);
		d.setDate(base.getDate() + ((firstDayOfWeek + i) % 7));
		labels.push(
			getCachedDateTimeFormat(pageLocale(), { weekday: "short" }).format(d),
		);
	}
	return labels;
}

function parseOptionsText(optionsText: string): ChoiceOption[] {
	return (optionsText || "")
		.split(",")
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0)
		.map((entry) => {
			const parts = entry.split(/\s+/);
			const first = parts[0] || "";
			if (parts.length > 1 && /^[^A-Za-z0-9]+$/u.test(first)) {
				return {
					glyph: first,
					label: parts.slice(1).join(" ").trim(),
				};
			}
			return { label: entry };
		})
		.filter((option) => option.label.length > 0);
}

const ChoiceGroupInline = React.memo(function ChoiceGroupInline(
	props: ChoiceGroupInlineProps,
) {
	const {
		label,
		inputName,
		defaultValue,
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
		optionHoverBorderColor,
		optionBorderWidth,
		optionRadius,
		optionPaddingY,
		optionPaddingX,
		optionMinHeight,
		optionFont,
		optionShadow,
		trackBackground,
	} = props;

	const reducedMotion = useReducedMotion();

	const rootRef = React.useRef<HTMLDivElement | null>(null);
	const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

	const parsedOptions = React.useMemo(
		() => directOptions || parseOptionsText(optionsText),
		[directOptions, optionsText],
	);

	const [measuredWidth, setMeasuredWidth] = React.useState<number>(320);
	const beInteractive = useBeInteractive();
	const [internalSelected, setInternalSelected] = React.useState<string>(() =>
		controlledValue !== undefined ? getInitialSelection(parsedOptions, controlledValue) : getInitialSelection(parsedOptions, defaultValue),
	);
	const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
	const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
	const firedInitialRef = React.useRef(false);
	const lastUserPickRef = React.useRef<string | null>(null);

	const selected =
		controlledValue !== undefined
			? parsedOptions.some((option) => optionValue(option) === controlledValue)
				? controlledValue
				: parsedOptions[0]
					? optionValue(parsedOptions[0])
					: controlledValue
			: internalSelected;
	const formValue =
		controlledValue !== undefined ? controlledValue : internalSelected;
	const tabbableOptionIndex = (() => {
		const selIdx = parsedOptions.findIndex(
			(o) => optionValue(o) === selected && !o.disabled,
		);
		if (selIdx >= 0) return selIdx;
		return parsedOptions.findIndex((o) => !o.disabled);
	})();

	React.useEffect(() => {
		if (controlledValue !== undefined) return;
		const next = controlledValue !== undefined ? getInitialSelection(parsedOptions, controlledValue) : getInitialSelection(parsedOptions, defaultValue);
		React.startTransition(() => setInternalSelected(next));
	}, [defaultValue, parsedOptions, controlledValue]);

	React.useEffect(() => {
		if (controlledValue === undefined) return;
		if (parsedOptions.length === 0) return;
		const next = getInitialSelection(parsedOptions, controlledValue);
		if (next === internalSelected) return;
		React.startTransition(() => setInternalSelected(next));
	}, [controlledValue, parsedOptions, internalSelected]);

	React.useEffect(() => {
		if (controlledValue === undefined) return;
		if (lastUserPickRef.current === controlledValue) {
			lastUserPickRef.current = null;
			return;
		}
		const idx = parsedOptions.findIndex(
			(option) => optionValue(option) === controlledValue,
		);
		if (idx < 0 && parsedOptions.length === 0) return;
		const focusIdx = idx >= 0 ? idx : 0;
		const focusRaf = requestAnimationFrame(() => {
			buttonRefs.current[focusIdx]?.focus();
		});
		return () => cancelAnimationFrame(focusRaf);
	}, [controlledValue, parsedOptions]);

	React.useEffect(() => {
		let focusRaf = 0;
		if (focusedIndex !== null && focusedIndex >= parsedOptions.length) {
			const clamped = Math.max(0, parsedOptions.length - 1);
			if (parsedOptions.length === 0) {
				setFocusedIndex(null);
			} else {
				setFocusedIndex(clamped);
				focusRaf = requestAnimationFrame(() => {
					buttonRefs.current[clamped]?.focus();
				});
			}
		}
		if (hoveredIndex !== null && hoveredIndex >= parsedOptions.length) {
			setHoveredIndex(null);
		}
		return () => {
			if (focusRaf) cancelAnimationFrame(focusRaf);
		};
	}, [parsedOptions, focusedIndex, hoveredIndex]);

	React.useEffect(() => {
		if (parsedOptions.length > 0) {
			firedInitialRef.current = false;
		}
	}, [parsedOptions]);

	React.useEffect(() => {
		if (!beInteractive) return;
		if (firedInitialRef.current) return;
		if (controlledValue !== undefined) return;
		if (parsedOptions.length === 0) return;
		firedInitialRef.current = true;
		onChange?.(controlledValue !== undefined ? getInitialSelection(parsedOptions, controlledValue) : getInitialSelection(parsedOptions, defaultValue));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [beInteractive, parsedOptions, controlledValue, defaultValue]);

	useIsomorphicLayoutEffect(() => {
		if (!beInteractive) return;
		if (
			typeof window !== "undefined" &&
			typeof ResizeObserver !== "undefined"
		) {
			if (!rootRef.current) return;
			const initialWidth = rootRef.current.clientWidth;
			if (initialWidth > 0) {
				React.startTransition(() => setMeasuredWidth(initialWidth));
			}
			const observer = new ResizeObserver((entries) => {
				const width = entries[0]?.contentRect?.width;
				if (typeof width === "number") {
					React.startTransition(() => setMeasuredWidth(width));
				}
			});
			observer.observe(rootRef.current);
			return () => observer.disconnect();
		}
	}, [beInteractive]);

	const selectedTextColor = selectedTextColorOverride ?? accentForegroundColor ?? TEXT_ON_ACCENT;
	const selectedSurface = selectedBackgroundColor ?? accentColor;
	const selectedRing = selectedBorderColor ?? accentColor;
	const hoverRing = optionHoverBorderColor ?? selectedRing;
	const optionBorder = optionBorderWidth ?? 1;
	const compact = measuredWidth < COMPACT_BREAKPOINT;
	const effectiveFontSize =
		optionFont?.fontSize != null
			? fontPixelSize(optionFont.fontSize) ?? Math.max(14, fontSize)
			: Math.max(14, fontSize);
	const optionFontExtraStyle: React.CSSProperties = {
		...(optionFont?.fontFamily ? { fontFamily: optionFont.fontFamily } : {}),
		...(optionFont?.fontWeight != null ? { fontWeight: optionFont.fontWeight } : {}),
		...(optionFont?.fontStyle ? { fontStyle: optionFont.fontStyle } : {}),
		...(optionFont?.letterSpacing != null
			? { letterSpacing: optionFont.letterSpacing }
			: {}),
		...(optionFont?.lineHeight != null ? { lineHeight: optionFont.lineHeight } : {}),
	};
	const columns = React.useMemo(() => {
		if (measuredWidth >= CHOICE_COLUMNS_BREAKPOINT_WIDE) return 5;
		if (measuredWidth >= CHOICE_COLUMNS_BREAKPOINT_MEDIUM) return 3;
		return 2;
	}, [measuredWidth]);

	const selectOption = React.useCallback(
		(option: ChoiceOption) => {
			if (isSubmitting) return;
			if (option.disabled) return;
			const value = optionValue(option);
			lastUserPickRef.current = value;
			if (controlledValue === undefined) {
				React.startTransition(() => setInternalSelected(value));
			}
			onChange?.(value);
		},
		[onChange, controlledValue, isSubmitting],
	);

	const moveFocus = React.useCallback(
		(currentIndex: number, delta: number) => {
			const count = parsedOptions.length;
			if (count === 0) return;
			for (let step = 1; step <= count; step += 1) {
				const nextIndex = (currentIndex + delta * step + count * step) % count;
				const next = parsedOptions[nextIndex];
				if (!next || next.disabled) continue;
				buttonRefs.current[nextIndex]?.focus();
				React.startTransition(() => setFocusedIndex(nextIndex));
				selectOption(next);
				return;
			}
		},
		[parsedOptions, selectOption],
	);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
			if (event.key === " ") {
				event.preventDefault();
				return;
			}
			if (event.key === "ArrowRight" || event.key === "ArrowDown") {
				event.preventDefault();
				moveFocus(index, 1);
			} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
				event.preventDefault();
				moveFocus(index, -1);
			} else if (event.key === "Home") {
				event.preventDefault();
				buttonRefs.current[0]?.focus();
				const first = parsedOptions[0];
				if (first) selectOption(first);
			} else if (event.key === "End") {
				event.preventDefault();
				const lastIndex = parsedOptions.length - 1;
				if (lastIndex >= 0) {
					buttonRefs.current[lastIndex]?.focus();
					const last = parsedOptions[lastIndex];
					if (last) selectOption(last);
				}
			}
		},
		[moveFocus, parsedOptions, selectOption],
	);

	const groupCommonStyle: React.CSSProperties = {
		width: "100%",
		boxSizing: "border-box",
		fontFamily: "inherit",
	};

	const selectedIndex = selected
		? parsedOptions.findIndex((o) => optionValue(o) === selected)
		: -1;

	const renderOptionButton = (
		option: ChoiceOption,
		index: number,
		extraStyle: React.CSSProperties = {},
		labelExtraStyle: React.CSSProperties = {},
	) => {
		const isHovered = hoveredIndex === index;
		const isSelected = selectedIndex === index;
		const showMedia = variant === "cards" || variant === "radio";
		return (
			/* biome-ignore lint/a11y/useSemanticElements: intentional custom radio
	       button — a native <input type="radio"> cannot carry the
	       card/pill/segmented visual system. The full radiogroup contract
	       (roving tabindex, arrow-key navigation, aria-checked) is
	       implemented below, so SR/keyboard behavior is equivalent. */
			<button
				key={`${option.label}-${index}`}
				ref={(node) => {
					buttonRefs.current[index] = node;
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
					border: `${optionBorder}px solid ${isSelected ? selectedRing : isHovered ? hoverRing : borderColor
						}`,
					background: isSelected ? selectedSurface : backgroundColor,
					color: option.disabled
						? mutedTextColor
						: isSelected
							? selectedTextColor
							: textColor,
					cursor:
						isSubmitting || option.disabled ? "not-allowed" : "pointer",
					opacity: isSubmitting || option.disabled ? 0.5 : 1,
					boxShadow: [
						isSelected ? `inset 0 0 0 1px ${selectedRing}` : null,
						!isNoShadowValue(optionShadow) && optionShadow
							? optionShadow
							: null,
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
				}}
			>
				{variant === "radio" ? (
					<span
						aria-hidden="true"
						style={{
							width: 18,
							height: 18,
							borderRadius: "50%",
							border: `2px solid ${isSelected ? selectedTextColor : borderColor
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
				{showMedia && option.image && optionImageSrc(option.image) ? (
					<img
						src={optionImageSrc(option.image)}
						srcSet={
							typeof option.image === "object" ? option.image.srcSet : undefined
						}
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
		);
	};

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
			<input
				type="hidden"
				name={inputName}
				value={formValue}
				aria-hidden="true"
			/>
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
						gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
						gap: compact ? 6 : 8,
						minWidth: 0,
					}}
				>
					{parsedOptions.map((option, index) =>
						renderOptionButton(option, index, {
							padding: `${optionPaddingY ?? 10}px ${optionPaddingX ?? (compact ? 6 : 8)}px`,
							textAlign: "center",
							minWidth: 0,
						}),
					)}
				</div>
			) : null}
			{variant === "segmented" ? (
				<SegmentedControl
					options={parsedOptions.map((o) => ({ label: o.label, value: optionValue(o) }))}
					value={selected}
					onChange={(val) => {
						const opt = parsedOptions.find((o) => optionValue(o) === val);
						if (opt) selectOption(opt);
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
						}),
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
						}),
					)}
				</div>
			) : null}
		</div>
	);
});

interface CalendarCellProps {
	date: Date;
	dateKey: string;
	isUnavailable: boolean;
	isSelected: boolean;
	isToday: boolean;
	isRingHover: boolean;
	isActive: boolean;
	firstDayOfWeek: number;
	locale?: string;
	isNarrow: boolean;
	timeZone?: string;
	accentColor: string;
	borderColor: string;
	subtleFill: string;
	textColor: string;
	selectedAccentText: string;
	mutedSoftText: string;
	tileFont?: FramerFont;
	borderRadius: string | number;
	onSelect: (date: Date) => void;
	onMoveFocus: (date: Date) => void;
	onGoToNextMonth: (focusAfter?: boolean) => void;
	onGoToPreviousMonth: (focusAfter?: boolean) => void;
	onHoverChange: (dateKey: string | null) => void;
	onFocusChange: (dateKey: string | null) => void;
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
	const reducedMotion = useReducedMotion();
	return (
		/* biome-ignore lint/a11y/useSemanticElements: CSS-grid calendar cell — the
	   W3C datepicker pattern (grid/row/gridcell + roving tabindex) is the
	   contract here; a native <td> cannot participate in the display:grid
	   layout this component renders. */
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
					if (!isUnavailable) React.startTransition(() => onHoverChange(dateKey));
				}}
				onMouseLeave={() => {
					if (!isUnavailable) React.startTransition(() => onHoverChange(null));
				}}
				onFocus={() =>
					React.startTransition(() => onFocusChange(`date-${dateKey}`))
				}
				onBlur={() => React.startTransition(() => onFocusChange(null))}
				onClick={() => onSelect(date)}
				onKeyDown={(e) => {
					if (e.key === "ArrowRight") {
						e.preventDefault();
						const target = new Date(date);
						target.setDate(date.getDate() + 1);
						onMoveFocus(target);
					} else if (e.key === "ArrowLeft") {
						e.preventDefault();
						const target = new Date(date);
						target.setDate(date.getDate() - 1);
						onMoveFocus(target);
					} else if (e.key === "ArrowDown") {
						e.preventDefault();
						const target = new Date(date);
						target.setDate(date.getDate() + 7);
						onMoveFocus(target);
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						const target = new Date(date);
						target.setDate(date.getDate() - 7);
						onMoveFocus(target);
					} else if (e.key === "Home") {
						e.preventDefault();
						const offset = (date.getDay() - firstDayOfWeek + 7) % 7;
						const target = new Date(date);
						target.setDate(date.getDate() - offset);
						onMoveFocus(target);
					} else if (e.key === "End") {
						e.preventDefault();
						const offset = (date.getDay() - firstDayOfWeek + 7) % 7;
						const target = new Date(date);
						target.setDate(date.getDate() + (6 - offset));
						onMoveFocus(target);
					} else if (e.key === "PageDown") {
						e.preventDefault();
						onGoToNextMonth(true);
					} else if (e.key === "PageUp") {
						e.preventDefault();
						onGoToPreviousMonth(true);
					}
				}}
				style={{
					position: "relative",
					width: "100%",
					height: "100%",
					borderRadius,
					border: `1px solid ${isUnavailable ? "transparent" : borderColor}`,
					background: isSelected ? accentColor : isUnavailable ? "transparent" : subtleFill,
					color: isSelected ? selectedAccentText : isUnavailable ? mutedSoftText : textColor,
					cursor: isUnavailable ? "default" : "pointer",
					fontFamily: tileFont?.fontFamily ?? "inherit",
					fontSize: fontPixelSize(tileFont?.fontSize) ?? 14,
					...(tileFont?.lineHeight != null ? { lineHeight: tileFont.lineHeight } : {}),
					transition: reducedMotion
						? "none"
						: "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, color 0.16s ease",
					boxShadow:
						isSelected || isRingHover
							? `inset 0 0 0 2px ${accentColor}`
							: "none",
					fontWeight: 500,
				}}

			>
				<span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
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
	);
});

interface CalendarGridProps {
	instanceId: string;
	monthName: string;
	yearLabel: string;
	prevMonthLabel: string;
	nextMonthLabel: string;
	previousMonthAriaTemplate: string;
	nextMonthAriaTemplate: string;
	canGoPrev: boolean;
	canGoNext: boolean;
	weekdayLabels: string[];
	cells: Date[];
	visibleMonth: Date;
	selectedDate: Date | null;
	today: Date;
	clockReady: boolean;
	slotsLoading: boolean;
	hoveredDateKey: string | null;
	isNarrow: boolean;
	firstDayOfWeek: number;
	dateKeyOf: (date: Date) => string;
	hasAvailability: (date: Date) => boolean;
	activeDateKey: string | null;
	locale?: string;
	timeZone?: string;
	accentColor: string;
	borderColor: string;
	subtleFill: string;
	textColor: string;
	selectedAccentText: string;
	mutedSoftText: string;
	mutedText: string;
	tileFont?: FramerFont;
	borderRadius: string | number;
	onPrevMonth: (focusAfter?: boolean) => void;
	onNextMonth: (focusAfter?: boolean) => void;
	onSelectDate: (date: Date) => void;
	onMoveFocus: (date: Date) => void;
	onHoverChange: (dateKey: string | null) => void;
	onFocusChange: (dateKey: string | null) => void;
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
	const gridLabelId = instanceId ? `${instanceId}-be-calendar-grid-label` : "be-calendar-grid-label";
	const [hoveredNav, setHoveredNav] = React.useState<"prev" | "next" | null>(null);
	const rows: React.ReactNode[] = [];
	const weeksToRender = weeksInMonthView(
		visibleMonth.getFullYear(),
		visibleMonth.getMonth(),
		firstDayOfWeek,
	);
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
				</div>,
			);
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
						const dateKey = dateKeyOf(date);
						const isInMonth = date.getMonth() === visibleMonth.getMonth();
						if (!isInMonth) {
							return (
								<div
									key={`empty-${dateKey}`}
									role="gridcell"
									aria-hidden="true"
									style={{
										minHeight: TOUCH_TARGET_MIN,
										minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN,
									}}
								/>
							);
						}
						const isPast = startOfDay(date).getTime() < today.getTime();
						const isUnavailable = isPast || !hasAvailability(date);
						const isSelected = isSameDay(selectedDate, date);
						const isToday = isSameDay(today, date);
						const isActive =
							activeDateKey !== null &&
							dateKey === activeDateKey &&
							!isUnavailable;
						const isRingHover =
							hoveredDateKey === dateKey &&
							!isUnavailable &&
							!isSelected;
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
						);
					})}
				</div>,
			);
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
						tabIndex={-1}
						data-be-month-heading
						style={{
							margin: 0,
							fontWeight: 700,
							fontSize: 16,
						}}
					>
						{/* biome-ignore lint/a11y/useSemanticElements: intentional
                            polite status region (W1-10-OBS-2) — the visible
                            month/year header announces the month change; an
                            <output> would change the element's semantics. */}
						<span role="status" aria-live="polite" aria-atomic="true">
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
						</span>
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
						aria-label={previousMonthAriaTemplate.replace(
							"{month}",
							prevMonthLabel,
						)}
						onClick={() => onPrevMonth()}
						onMouseEnter={() => canGoPrev && setHoveredNav("prev")}
						onMouseLeave={() => setHoveredNav((v) => (v === "prev" ? null : v))}
						disabled={!canGoPrev}
						style={{
							appearance: "none",
							background: hoveredNav === "prev" && canGoPrev ? borderColor : "transparent",
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
						aria-label={nextMonthAriaTemplate.replace(
							"{month}",
							nextMonthLabel,
						)}
						onClick={() => onNextMonth()}
						onMouseEnter={() => canGoNext && setHoveredNav("next")}
						onMouseLeave={() => setHoveredNav((v) => (v === "next" ? null : v))}
						disabled={!canGoNext}
						style={{
							appearance: "none",
							background: hoveredNav === "next" && canGoNext ? borderColor : "transparent",
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
	);
});

const SELECTED_SLOT_KEY = "__selectedSlot" as const;

interface BookingPayload {
	date: Date;
	time24h: string;
	timeLabel: string;
	/** Optional Cal.com slot end (ISO string) - used for ICS DTEND. */
	end?: string;
}

type BookingValues = Record<string, string | boolean | undefined> & {
	[SELECTED_SLOT_KEY]?: BookingPayload;
};

function isFieldValue(v: unknown): v is string | boolean | undefined {
	return v === undefined || typeof v === "string" || typeof v === "boolean";
}

type RestoredBookingPayload = Omit<BookingPayload, "date"> & {
	date: string | Date;
};
function isBookingPayload(v: unknown): v is RestoredBookingPayload {
	if (typeof v !== "object" || v === null) return false;
	const o = v as Record<string, unknown>;
	const rawDate = o.date;
	const dateOk =
		(rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) ||
		(typeof rawDate === "string" && rawDate.length > 0);
	return (
		dateOk &&
		typeof o.time24h === "string" &&
		o.time24h.length > 0 &&
		typeof o.timeLabel === "string" &&
		o.timeLabel.length > 0 &&
		(o.end === undefined || (typeof o.end === "string" && o.end.length > 0))
	);
}

interface TimeSlotListProps {
	isNarrow: boolean;
	activeTimeFormat: "12h" | "24h";
	setActiveTimeFormat: (format: "12h" | "24h") => void;
	onTimeFormatChange?: (format: "12h" | "24h") => void;
	focusedKey: string | null;
	setFocusedKey: (key: string | null) => void;
	prefersReducedMotion: boolean;
	accentColor: string;
	softerFill: string;
	subtleBorder: string;
	borderColor: string;
	textColor: string;
	selectedAccentText: string;
	selectedSurface?: string;
	selectedText?: string;
	mutedText: string;
	mutedSoftText: string;
	backgroundColor: string;
	loadingLabel: string;
	slotsLoading: boolean;
	selectionPending?: boolean;
	selectedDate: Date | null;
	/** W2-51: the default/active date when nothing is selected yet (today) —
	 *  keeps the time header populated on first entry. */
	fallbackDate: Date;
	clockReady: boolean;
	showTimesWithoutDate: boolean;
	timeOptions: Array<{
		value: string;
		label: string;
		end?: string;
		minutes: number;
	}>;
	availableTimes:
	| Array<{
		value: string;
		label: string;
		end?: string;
		minutes: number;
	}>
	| undefined;
	selectedTime: string | null;
	hoveredTime: string | null;
	setHoveredTime: (time: string | null) => void;
	onSelectTime: (value: string) => void;
	isTimeElapsed: (time: { value: string; minutes: number }) => boolean;
	borderRadius: string | number;
	pickDateToSeeTimesLabel: string;
	noTimesFallbackLabel: string;
	timeSlotsAriaLabel: string;
	availableTimesAriaLabel: string;
	/** W1-10-A1 fix: marks the slot radiogroup as required. The datetime
	 *  step always requires a picked slot, so callers pass `true`. */
	required?: boolean;
	timeZone?: string;
	slotDateLabel?: string;
	slotError?: string | null;
	slotErrorId?: string;
	timeFormatLabel: string;
}

const TimeSlotButton = React.memo(function TimeSlotButton(props: {
	value: string;
	label: string;
	selected: boolean;
	elapsed: boolean;
	hovered: boolean;
	isNarrow: boolean;
	accentColor: string;
	borderColor: string;
	mutedSoftText: string;
	textColor: string;
	selectedSurface: string;
	selectedText: string;
	radius: string | number;
	onSelect: (value: string) => void;
	setHoveredTime: (time: string | null) => void;
	setFocusedKey: (key: string | null) => void;
	isInitialFocus: boolean;
	/** W1-10-A13 fix: chosen timezone for the aria-label (see
	 *  TimeSlotListProps.timeZone). */
	timeZone?: string;
	slotDateLabel?: string;
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
	} = props;
	const reducedMotion = useReducedMotion();
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
				if (elapsed) return;
				React.startTransition(() => setHoveredTime(value));
			}}
			onMouseLeave={() => React.startTransition(() => setHoveredTime(null))}
			onFocus={() =>
				React.startTransition(() => setFocusedKey(`time-${value}`))
			}
			onBlur={() => React.startTransition(() => setFocusedKey(null))}
			onClick={() => {
				if (elapsed) return;
				onSelect(value);
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
				boxShadow: selected
					? `inset 0 0 0 1px ${selectedSurface}`
					: "none",
			}}
		>
			{label}
		</button>
	);
});

const TimeSlotList = React.memo(function TimeSlotList(
	props: TimeSlotListProps,
) {
	const isStaticRender = useIsStaticRenderer();
	const {
		isNarrow,
		activeTimeFormat,
		setActiveTimeFormat,
		onTimeFormatChange,
		focusedKey,
		setFocusedKey,
		prefersReducedMotion,
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
		timeFormatLabel,
	} = props;
	const segmentInnerRadius = innerRadiusValue(borderRadius, 3);
	const firstNonElapsedIndex = React.useMemo(
		() => timeOptions.findIndex((time) => !isTimeElapsed(time)),
		[timeOptions, isTimeElapsed],
	);
	const scrollerRef = React.useRef<HTMLDivElement | null>(null);
	const [scrollerOverflows, setScrollerOverflows] = React.useState(false);
	React.useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;
		const measure = () => {
			setScrollerOverflows(el.scrollHeight > el.clientHeight + 1);
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [timeOptions, isNarrow]);
	React.useEffect(() => {
		if (timeOptions.length > 50) {
			console.warn(
				`[BookingEngine] ${timeOptions.length} time slots rendered without virtualization — performance may degrade. Consider a larger slot interval.`,
			);
		}
	}, [timeOptions]);
	const slotGridRef = React.useRef<HTMLDivElement | null>(null);
	const formatButtonRefs = React.useRef<
		Record<"12h" | "24h", HTMLButtonElement | null>
	>({ "12h": null, "24h": null });
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
		[selectedDate, timeZone],
	);
	React.useEffect(() => {
		const prefix = "time-";
		if (!focusedKey?.startsWith(prefix)) return;
		const value = focusedKey.slice(prefix.length);
		const focusedIdx = timeOptions.findIndex((o) => o.value === value);
		if (focusedIdx < 0 || !isTimeElapsed(timeOptions[focusedIdx])) return;
		const liveButtons = Array.from(
			slotGridRef.current?.querySelectorAll<HTMLButtonElement>(
				"button[role='radio']:not([disabled])",
			) ?? [],
		);
		for (let i = 1; i <= timeOptions.length; i++) {
			const candidate = timeOptions[(focusedIdx + i) % timeOptions.length];
			if (!candidate || isTimeElapsed(candidate)) continue;
			const target = liveButtons.find((b) =>
				(b.getAttribute("aria-label") ?? "").startsWith(candidate.label),
			);
			if (target) {
				target.focus();
				setFocusedKey(`time-${candidate.value}`);
				return;
			}
		}
		setFocusedKey(null);
	}, [focusedKey, timeOptions, isTimeElapsed, setFocusedKey]);
	return (
		<aside
			aria-label={timeSlotsAriaLabel}
			style={{
				width: isNarrow ? "100%" : undefined,
				minWidth: 0,
				borderLeft: isNarrow ? "none" : subtleBorder,
				borderTop: isNarrow ? subtleBorder : "none",
				padding: isNarrow ? "10px 16px 16px 16px" : "16px 16px 0 16px",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				gap: 12,
			}}
		>
			<div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
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
								const d = selectedDate ?? fallbackDate;
								const tzOpt = isValidTimeZone(timeZone)
									? { timeZone }
									: undefined;
								const w = getCachedDateTimeFormat(pageLocale(), {
									weekday: "short",
									...tzOpt,
								}).format(d);
								return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
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
										timeZone || "",
									).slice(-2),
								)}
								{(() => {
									const d = Number(
										getDateKeyInTimeZone(
											selectedDate ?? fallbackDate,
											timeZone || "",
										).slice(-2),
									);
									if (d >= 11 && d <= 13) return "th";
									switch (d % 10) {
										case 1:
											return "st";
										case 2:
											return "nd";
										case 3:
											return "rd";
										default:
											return "th";
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
						const format = val as "12h" | "24h";
						React.startTransition(() => {
							setActiveTimeFormat(format);
							onTimeFormatChange?.(format);
						});
					}}
					borderRadius={borderRadius}
					textColor={textColor}
					mutedTextColor={mutedText}
					backgroundColor={backgroundColor}
					borderColor={borderColor}
					ariaLabel={timeFormatLabel}
				/>
			</div>

			<div
				style={
					isNarrow
						? { minWidth: 0 }
						: { flex: 1, minHeight: 0, position: "relative", minWidth: 0 }
				}
			>
				<div
					className="be-dt-scroll"
					ref={scrollerRef}
					tabIndex={scrollerOverflows ? 0 : undefined}
					aria-label={scrollerOverflows ? availableTimesAriaLabel : undefined}
					style={
						isNarrow
							? {
								minWidth: 0,
								maxHeight: "40vh",
								overflowY: "auto",
								overscrollBehavior: "contain",
							}
							: {
								position: "absolute",
								inset: 0,
								overflowY: "auto",
								minWidth: 0,
							}
					}
				>
					{slotsLoading || selectionPending ? (
						/* biome-ignore lint/a11y/useSemanticElements: intentional polite
				       live region (T5-H8) — announces slot loading; <output> is not
				       a standalone status message and would change inline layout. */
						<div
							role="status"
							aria-live="polite"
							aria-atomic="true"
							style={{
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
						// W1-10-A14: static guidance, never a live region (rule 103).
						>
							{pickDateToSeeTimesLabel}
						</div>
					) : timeOptions.length === 0 && availableTimes === undefined ? (
						/* biome-ignore lint/a11y/useSemanticElements: intentional
				       polite live region (T5-H8) — <output> is not a standalone
				       status message and would change inline layout here. */
						<div
							style={{
								padding: "16px 8px",
								textAlign: "center",
								color: mutedText,
								fontSize: 13,
								fontFamily: "inherit",
							}}
							role="status"
							aria-live="polite"
							aria-atomic="true"
						>
							{noTimesFallbackLabel}
						</div>
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
									e.preventDefault();
									return;
								}
								const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
								if (e.key === "Home" || e.key === "End") {
									e.preventDefault();
									const liveButtons = Array.from(
										e.currentTarget.querySelectorAll<HTMLButtonElement>(
											"button[role='radio']:not([disabled])",
										),
									);
									if (!liveButtons.length) return;
									const target =
										e.key === "Home"
											? liveButtons[0]
											: liveButtons[liveButtons.length - 1];
									if (!target) return;
									target.focus();
									const allButtons = Array.from(
										e.currentTarget.querySelectorAll<HTMLButtonElement>(
											"button[role='radio']",
										),
									);
									const targetIndex = allButtons.indexOf(target);
									const opt = timeOptions[targetIndex];
									if (opt) onSelectTime(opt.value);
									return;
								}
								if (!keys.includes(e.key)) return;
								e.preventDefault();
								const buttons = Array.from(
									e.currentTarget.querySelectorAll<HTMLButtonElement>(
										"button[role='radio']",
									),
								);
								if (!buttons.length) return;
								const idx = selectedTime
									? Math.max(
										0,
										timeOptions.findIndex((t) => t.value === selectedTime),
									)
									: 0;
								const move =
									e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
								const next = (idx + move + buttons.length) % buttons.length;
								const target = buttons[next];
								if (target && !target.disabled) {
									target.focus();
									onSelectTime(timeOptions[next].value);
								}
							}}
						>
							{timeOptions.map((time, index) => {
								const selected = selectedTime === time.value;
								const elapsed = isTimeElapsed(time);
								const isHover =
									hoveredTime === time.value && !selected && !elapsed;
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
								);
							})}
						</div>
					)}
				</div>
			</div>
		</aside>
	);
});

interface UseCalendarNavigationOptions {
	initialVisibleMonth?: Date | null;
	today: Date;
	rootRef: React.RefObject<HTMLDivElement | null>;
	onMonthChange?: (monthStart: Date) => void;
	availableDates?: Set<string>;
	slotsLoading?: boolean;
	timeZone?: string;
	clockReady: boolean;
}

function useCalendarNavigation(options: UseCalendarNavigationOptions): {
	visibleMonth: Date;
	setVisibleMonth: React.Dispatch<React.SetStateAction<Date>>;
	calendarCells: Date[];
	firstDayOfWeek: number;
	weekdayLabels: string[];
	monthName: string;
	yearLabel: string;
	canGoPrev: boolean;
	canGoNext: boolean;
	goToPreviousMonth: (focusAfter?: boolean) => void;
	goToNextMonth: (focusAfter?: boolean) => void;
	prevMonthLabel: string;
	nextMonthLabel: string;
	/** W1-09-DT-08 fix: the 12-month booking horizon (see return). */
	maxMonthStart: Date;
	/** W1-09-NEW-03 fix: cross-month arrow focus handoff (see refs above). */
	pendingMonthFocusRef: { current: boolean };
	pendingMonthFocusTargetRef: { current: string | null };
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
	} = options;

	const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => {
		if (initialVisibleMonth) return initialVisibleMonth;
		return new Date(today.getFullYear(), today.getMonth(), 1);
	});

	const childMonthChangeRef = React.useRef(false);
	React.useEffect(() => {
		if (!initialVisibleMonth) return;
		if (childMonthChangeRef.current) {
			childMonthChangeRef.current = false;
			return;
		}
		const incoming = new Date(
			initialVisibleMonth.getFullYear(),
			initialVisibleMonth.getMonth(),
			1,
		);
		const current = new Date(
			visibleMonth.getFullYear(),
			visibleMonth.getMonth(),
			1,
		);
		if (incoming.getTime() === current.getTime()) return;
		React.startTransition(() => setVisibleMonth(incoming));
	}, [initialVisibleMonth, visibleMonth]);

	const visibleMonthKey = React.useMemo(
		() => getDateKeyInTimeZone(visibleMonth, timeZone || ""),
		[visibleMonth, timeZone],
	);
	const monthName = React.useMemo(() => {
		const m = Number(visibleMonthKey.slice(5, 7));
		if (!Number.isFinite(m) || m < 1 || m > 12) {
			return getCachedDateTimeFormat(pageLocale(), { month: "long" }).format(
				visibleMonth,
			);
		}
		return getCachedDateTimeFormat(pageLocale(), { month: "long" }).format(
			new Date(2000, m - 1, 1),
		);
	}, [visibleMonthKey, visibleMonth]);
	const yearLabel = React.useMemo(() => {
		const y = Number(visibleMonthKey.slice(0, 4));
		return Number.isFinite(y) && y > 0
			? String(y)
			: String(visibleMonth.getFullYear());
	}, [visibleMonthKey, visibleMonth]);

	const firstDayOfWeek = React.useMemo(() => {
		try {
			const localeTag = pageLocale() || "en-US";
			const locale = new (
				Intl as unknown as {
					Locale: new (
						tag: string,
					) => {
						getWeekInfo?: () => { firstDay?: number };
						weekInfo?: { firstDay?: number };
					};
				}
			).Locale(localeTag);
			const info = locale.getWeekInfo ? locale.getWeekInfo() : locale.weekInfo;
			if (info && typeof info.firstDay === "number") {
				return info.firstDay % 7;
			}
		} catch {
			// Unsupported in this browser/environment — fall back to Sunday.
		}
		return 0;
	}, []);

	const weekdayLabels = React.useMemo(
		() => buildWeekdayLabels(firstDayOfWeek),
		[firstDayOfWeek],
	);

	const calendarCells = React.useMemo(() => {
		const firstOfMonth = new Date(
			visibleMonth.getFullYear(),
			visibleMonth.getMonth(),
			1,
		);
		const start = new Date(firstOfMonth);
		const offset = (firstOfMonth.getDay() - firstDayOfWeek + 7) % 7;
		start.setDate(firstOfMonth.getDate() - offset);
		const cells: Date[] = [];
		const weeks = weeksInMonthView(
			visibleMonth.getFullYear(),
			visibleMonth.getMonth(),
			firstDayOfWeek,
		);
		for (let i = 0; i < weeks * 7; i++) {
			const next = new Date(start);
			next.setDate(start.getDate() + i);
			cells.push(next);
		}
		return cells;
	}, [visibleMonth, firstDayOfWeek]);

	const currentMonthStart = React.useMemo(
		() => new Date(today.getFullYear(), today.getMonth(), 1),
		[today],
	);

	const MAX_MONTHS_AHEAD = 12;
	const maxMonthStart = React.useMemo(
		() =>
			new Date(
				currentMonthStart.getFullYear(),
				currentMonthStart.getMonth() + MAX_MONTHS_AHEAD,
				1,
			),
		[currentMonthStart],
	);

	const pendingMonthFocusRef = React.useRef(false);
	const pendingMonthFocusTargetRef = React.useRef<string | null>(null);

	const goToPreviousMonth = React.useCallback(
		(focusAfter?: boolean) => {
			if (focusAfter) pendingMonthFocusRef.current = true;
			React.startTransition(() => {
				setVisibleMonth((prev) => {
					if (prev.getTime() <= currentMonthStart.getTime()) return prev;
					childMonthChangeRef.current = true;
					return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
				});
			});
		},
		[currentMonthStart],
	);

	const goToNextMonth = React.useCallback(
		(focusAfter?: boolean) => {
			if (focusAfter) pendingMonthFocusRef.current = true;
			React.startTransition(() => {
				setVisibleMonth((prev) => {
					if (prev.getTime() >= maxMonthStart.getTime()) return prev;
					childMonthChangeRef.current = true;
					return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
				});
			});
		},
		[maxMonthStart],
	);

	React.useEffect(() => {
		if (!clockReady) return;
		onMonthChange?.(visibleMonth);
	}, [clockReady, visibleMonth, onMonthChange]);

	React.useEffect(() => {
		if (!pendingMonthFocusRef.current) return;
		pendingMonthFocusRef.current = false;
		const targetKey = pendingMonthFocusTargetRef.current;
		pendingMonthFocusTargetRef.current = null;
		const focusRaf = requestAnimationFrame(() => {
			if (targetKey) {
				rootRef.current
					?.querySelector<HTMLElement>(`[data-date-key="${targetKey}"]`)
					?.focus();
				return;
			}
			const activeCell =
				rootRef.current?.querySelector<HTMLElement>(
					'[data-be-active-date="true"]',
				);
			if (activeCell) {
				activeCell.focus();
				return;
			}
			rootRef.current
				?.querySelector<HTMLElement>("[data-be-month-heading]")
				?.focus();
		});
		return () => cancelAnimationFrame(focusRaf);
	}, [visibleMonth]);

	const autoAdvancedMonthsRef = React.useRef(0);
	React.useEffect(() => {
		if (!clockReady) return;
		if (!availableDates) return; // demo/fallback mode — nothing to check
		if (slotsLoading) return; // don't judge an in-flight fetch as "empty"
		if (availableDates.size > 0) return;
		if (autoAdvancedMonthsRef.current >= 3) return;
		if (visibleMonth.getTime() === currentMonthStart.getTime()) return;
		autoAdvancedMonthsRef.current += 1;
		goToNextMonth();
	}, [clockReady, availableDates, slotsLoading, goToNextMonth, visibleMonth, currentMonthStart]);

	const canGoPrev = visibleMonth.getTime() > currentMonthStart.getTime();
	const canGoNext = visibleMonth.getTime() < maxMonthStart.getTime();
	const prevMonthLabel = React.useMemo(() => {
		const d = new Date(
			visibleMonth.getFullYear(),
			visibleMonth.getMonth() - 1,
			1,
		);
		return getCachedDateTimeFormat(pageLocale(), {
			month: "long",
			year: "numeric",
		}).format(d);
	}, [visibleMonth]);
	const nextMonthLabel = React.useMemo(() => {
		const d = new Date(
			visibleMonth.getFullYear(),
			visibleMonth.getMonth() + 1,
			1,
		);
		return getCachedDateTimeFormat(pageLocale(), {
			month: "long",
			year: "numeric",
		}).format(d);
	}, [visibleMonth]);

	const setVisibleMonthFromCalendar = React.useCallback(
		(month: Date | ((prev: Date) => Date)) => {
			setVisibleMonth((prev) => {
				const next =
					typeof month === "function" ? month(prev) : (month as Date);
				if (next.getTime() === prev.getTime()) return prev;
				childMonthChangeRef.current = true;
				return next;
			});
		},
		[],
	);

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
	};
}

interface UseTimeGridOptions {
	initialTime?: string | null;
	timeFormat: "12h" | "24h";
	availableTimes?: Array<{
		value: string;
		label: string;
		end?: string;
		minutes: number;
	}>;
	startTime: string;
	endTime: string;
	interval: number;
	selectedDate: Date | null;
	today: Date;
	amLabel?: string;
	pmLabel?: string;
	/** W1-07-F3 fix: the visitor's chosen timezone, used to disambiguate
	 *  DST collision rows ("01:00 AM (EDT)" vs "01:00 AM (EST)"). */
	timeZone?: string;
}

function useTimeGrid(options: UseTimeGridOptions): {
	selectedTime: string | null;
	setSelectedTime: React.Dispatch<React.SetStateAction<string | null>>;
	activeTimeFormat: "12h" | "24h";
	setActiveTimeFormat: React.Dispatch<React.SetStateAction<"12h" | "24h">>;
	hoveredTime: string | null;
	setHoveredTime: React.Dispatch<React.SetStateAction<string | null>>;
	timeOptions: Array<{
		value: string;
		label: string;
		end?: string;
		minutes: number;
	}>;
	isTimeElapsed: (time: { value: string; minutes: number }) => boolean;
	handleTimeSelect: (time: string) => void;
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
	} = options;

	const [selectedTime, setSelectedTime] = React.useState<string | null>(
		() => initialTime ?? null,
	);
	const [activeTimeFormat, setActiveTimeFormat] = React.useState<"12h" | "24h">(
		timeFormat,
	);
	const [hoveredTime, setHoveredTime] = React.useState<string | null>(null);

	React.useEffect(() => {
		React.startTransition(() => setActiveTimeFormat(timeFormat));
	}, [timeFormat]);

	React.useEffect(() => {
		if (initialTime !== undefined) {
			React.startTransition(() =>
				setSelectedTime((prev) => (prev === initialTime ? prev : initialTime)),
			);
		}
	}, [initialTime]);

	const timeOptions = React.useMemo(() => {
		if (availableTimes !== undefined) {
			const seenMinutes = new Set<string>();
			const deduped: typeof availableTimes = [];
			for (const t of availableTimes) {
				const endMinutes =
					t.end && timeZone && !Number.isNaN(new Date(t.end).getTime())
						? getMinutesInTimeZone(new Date(t.end), timeZone)
						: null;
				const key = `${t.minutes}|${endMinutes ?? ""}`;
				if (!seenMinutes.has(key)) {
					seenMinutes.add(key);
					deduped.push(t);
				}
			}
			const source = deduped.length ? deduped : availableTimes;
			return source.map((timeOption) => ({
				value: timeOption.value,
				end: timeOption.end,
				label: formatTimeLabel(
					timeOption.minutes,
					activeTimeFormat,
					amLabel,
					pmLabel,
				),
				minutes: timeOption.minutes,
			}));
		}
		const startMin = parseTimeToMinutes(startTime);
		const endMin = parseTimeToMinutes(endTime);
		const step = clamp(interval, 15, 60);
		const list: Array<{
			value: string;
			label: string;
			end?: string;
			minutes: number;
		}> = [];
		if (endMin < startMin) return list;
		for (let mins = startMin; mins <= endMin; mins += step) {
			list.push({
				value: minutesTo24h(mins),
				label: formatTimeLabel(mins, activeTimeFormat, amLabel, pmLabel),
				minutes: mins,
			});
		}
		return list;
	}, [
		availableTimes,
		startTime,
		endTime,
		interval,
		activeTimeFormat,
		amLabel,
		pmLabel,
		timeZone,
	]);

	const [now, setNow] = React.useState<Date | null>(null);
	const beInteractive = useBeInteractive();
	useIsomorphicLayoutEffect(() => {
		if (!beInteractive) return;
		setNow(new Date());
		const id = window.setInterval(() => setNow(new Date()), 30000);
		return () => window.clearInterval(id);
	}, [beInteractive]);
	const isTimeElapsed = React.useCallback(
		(time: { value: string; minutes: number }) => {
			if (!now) return false;
			if (!selectedDate) return false;
			if (!isSameDay(selectedDate, today)) return false;
			const slotMoment = time.value.includes("T")
				? new Date(time.value)
				: (() => {
					const d = new Date(
						selectedDate.getFullYear(),
						selectedDate.getMonth(),
						selectedDate.getDate(),
					);
					d.setMinutes(time.minutes);
					return d;
				})();
			return slotMoment.getTime() <= now.getTime();
		},
		[selectedDate, today, now],
	);

	const handleTimeSelect = React.useCallback((time: string) => {
		React.startTransition(() => setSelectedTime(time));
	}, []);

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
	};
}

const CalEventInfoPanel = React.memo(function CalEventInfoPanel(props: {
	meta: CalEventMeta;
	fallbackDurationMinutes?: number;
	accentColor: string;
	textPrimaryColor: string;
	textSecondaryColor: string;
	borderColor: string;
	borderRadius: number | string;
	hourSuffix?: string;
	minuteSuffix?: string;
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
	} = props;
	const durationMinutes =
		typeof meta.durationMinutes === "number" && meta.durationMinutes > 0
			? meta.durationMinutes
			: typeof fallbackDurationMinutes === "number" &&
				fallbackDurationMinutes > 0
				? fallbackDurationMinutes
				: undefined;
	const initial = meta.organizerName?.trim().charAt(0).toUpperCase();
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
					<span aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
					<span aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
	);
});

interface DateAndTimeInlineProps {
	accentColor: string;
	accentForegroundColor?: string;
	slotSelectedSurface?: string;
	slotSelectedText?: string;
	calendarStyles?: FieldStyleOverrides;
	textColor: string;
	borderColor: string;
	radius: number | string;
	startTime: string;
	endTime: string;
	interval: number;
	timeFormat: "12h" | "24h";
	initialDate?: Date | null;
	initialTime?: string | null;
	/** Fix #19: parent-controlled visible month so navigation survives remounts. */
	initialVisibleMonth?: Date | null;
	availableTimes?: Array<{
		value: string;
		label: string;
		end?: string;
		minutes: number;
	}>;
	availableDates?: Set<string>;
	slotsLoading?: boolean;
	availabilitySettled?: boolean;
	/** INSTANCE-ISOLATION: per-engine id for DOM ids (gridLabelId, field ids). */
	instanceId?: string;
	timeZone?: string;
	/** Copy shown in the time panel while Cal.com availability is loading. */
	loadingLabel?: string;
	onSelectionReady?: (payload?: BookingPayload) => void;
	onDateChange?: (date: Date) => void;
	onMonthChange?: (monthStart: Date) => void;
	onTimeFormatChange?: (format: "12h" | "24h") => void;
	showTimesWithoutDate?: boolean;
	pickDateToSeeTimesLabel: string;
	noTimesFallbackLabel: string;
	timeSlotsAriaLabel: string;
	availableTimesAriaLabel: string;
	datePickerAriaLabel: string;
	amLabel: string;
	pmLabel: string;
	previousMonthAriaTemplate: string;
	nextMonthAriaTemplate: string;
	required?: boolean;
	slotError?: string | null;
	slotErrorId?: string;
	timeFormatLabel: string;
	eventMeta?: CalEventMeta | null;
	eventMetaStatus?: CalEventMetaStatus;
	/** CAL-EVENT-META: author Default Meeting Duration (minutes) — only used
	 *  when Cal.com itself returns no reliable event length. */
	eventMetaFallbackDurationMinutes?: number;
	calEventMetaLoadingAria?: string;
	calEventMetaUnavailableCopy?: string;
	hourSuffix?: string;
	minuteSuffix?: string;
}

const DateAndTimeInline = React.memo(function DateAndTimeInline(
	props: DateAndTimeInlineProps,
) {
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
		timeFormatLabel,
		eventMeta,
		eventMetaStatus = "disabled",
		eventMetaFallbackDurationMinutes,
		calEventMetaLoadingAria = CAL_META_LOADING_ARIA,
		calEventMetaUnavailableCopy = CAL_META_UNAVAILABLE_COPY,
		hourSuffix = DEFAULT_COPY_HOUR_SUFFIX,
		minuteSuffix = DEFAULT_COPY_MINUTE_SUFFIX,
	} = props;

	const [clockReady, setClockReady] = React.useState(false);
	const [today, setToday] = React.useState<Date>(() => HYDRATION_PLACEHOLDER_TODAY);
	const beInteractive = useBeInteractive();
	useIsomorphicLayoutEffect(() => {
		if (!beInteractive) return;
		setClockReady(true);
		setToday(getTodayInTimeZone(timeZone));
	}, [beInteractive, timeZone]);
	React.useEffect(() => {
		if (!clockReady || typeof window === "undefined") return;
		let intervalId: number;
		let timeoutId: number;
		const checkRollover = () => {
			const newToday = getTodayInTimeZone(timeZone);
			setToday((prev) => (isSameDay(prev, newToday) ? prev : newToday));
		};
		const now = Date.now();
		const delayToNextTick = 30000 - (now % 30000);
		timeoutId = window.setTimeout(() => {
			checkRollover();
			intervalId = window.setInterval(checkRollover, 30000);
		}, delayToNextTick);
		return () => {
			window.clearTimeout(timeoutId);
			if (intervalId) window.clearInterval(intervalId);
		};
	}, [timeZone, clockReady]);
	const prefersReducedMotion = useReducedMotion();

	const [measuredWidth, setMeasuredWidth] = React.useState<number>(560);
	const rootRef = React.useRef<HTMLDivElement | null>(null);
	const focusRafRef = React.useRef(0);
	const pendingSlotListFocusRef = React.useRef(false);
	React.useEffect(() => {
		return () => {
			if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current);
		};
	}, []);

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
	});
	const selfSeededMonthRef = React.useRef(!initialVisibleMonth);
	useIsomorphicLayoutEffect(() => {
		if (!clockReady) return;
		if (!selfSeededMonthRef.current) return;
		selfSeededMonthRef.current = false;
		setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
	}, [clockReady, today, setVisibleMonth]);
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(
		() => initialDate ?? HYDRATION_PLACEHOLDER_TODAY,
	);
	const placeholderSelectedRef = React.useRef(!initialDate);
	const [initialSelectionPending, setInitialSelectionPending] =
		React.useState(!initialDate);
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
	});

	const handleSlotSelect = React.useCallback(
		(time: string) => {
			handleTimeSelect(time);
		},
		[handleTimeSelect],
	);

	const [hoveredDateKey, setHoveredDateKey] = React.useState<string | null>(
		null,
	);

	const [focusedKey, setFocusedKey] = React.useState<string | null>(null);
	const lastReadyKeyRef = React.useRef<string>("");

	useIsomorphicLayoutEffect(() => {
		if (!beInteractive) return;
		if (
			typeof window !== "undefined" &&
			typeof ResizeObserver !== "undefined"
		) {
			if (!rootRef.current) return;
			const initialWidth = rootRef.current.clientWidth;
			if (initialWidth > 0) {
				React.startTransition(() => setMeasuredWidth(initialWidth));
			}
			const observer = new ResizeObserver((entries) => {
				const nextWidth = entries[0]?.contentRect?.width;
				if (typeof nextWidth === "number") {
					React.startTransition(() => setMeasuredWidth(nextWidth));
				}
			});
			observer.observe(rootRef.current);
			return () => observer.disconnect();
		}
	}, [beInteractive]);

	React.useEffect(() => {
		if (!initialDate) return;
		placeholderSelectedRef.current = false;
		setInitialSelectionPending(false);
		React.startTransition(() =>
			setSelectedDate((prev) =>
				prev && isSameDay(prev, initialDate) ? prev : initialDate,
			),
		);
	}, [initialDate]);

	const isNarrow = measuredWidth < COMPACT_BREAKPOINT;
	const selectedAccentText = accentForegroundColor;
	const normalizedCalendarStyles = normalizeStyleOverrides(calendarStyles);
	const surfaceBackground =
		normalizedCalendarStyles?.backgroundColor ?? DEFAULT_CALENDAR_SURFACE_BACKGROUND;
	const surfaceRadius = resolveFieldRadius(normalizedCalendarStyles, radius, "calendar-widget" as FieldType);
	const resolvedTextColor = normalizedCalendarStyles?.textColor || textColor;
	const tileBorder = normalizedCalendarStyles?.border;
	const tileBorderWidth =
		typeof tileBorder?.borderWidth === "number" ? tileBorder.borderWidth : 1;
	const mutedText = React.useMemo(() => withAlpha(resolvedTextColor, 0.6), [resolvedTextColor]);
	const mutedSoftText = React.useMemo(
		() => withAlpha(resolvedTextColor, 0.42),
		[resolvedTextColor],
	);
	const subtleFill = React.useMemo(
		() => withAlpha(resolvedTextColor, 0.08),
		[resolvedTextColor],
	);
	const softerFill = React.useMemo(
		() => withAlpha(resolvedTextColor, 0.05),
		[resolvedTextColor],
	);
	const subtleBorder = React.useMemo(
		() => `1px solid ${borderColor}`,
		[borderColor],
	);
	const surfaceBorder = !tileBorder
		? subtleBorder
		: tileBorderWidth > 0
			? `${tileBorderWidth}px ${tileBorder?.borderStyle || "solid"} ${tileBorder?.borderColor || borderColor}`
			: "none";
	const surfacePadding =
		typeof normalizedCalendarStyles?.padding === "string" && normalizedCalendarStyles.padding.trim()
			? normalizedCalendarStyles.padding
			: undefined;

	const dateKeyOf = React.useCallback(
		(date: Date) =>
			timeZone ? getDateKeyInTimeZone(date, timeZone) : getLocalDateKey(date),
		[timeZone],
	);

	const hasKnownAvailability = React.useCallback(
		(date: Date) => !availableDates || availableDates.has(dateKeyOf(date)),
		[availableDates, dateKeyOf],
	);

	const firstAvailableDate = React.useMemo(() => {
		for (const date of calendarCells) {
			const isInMonth = date.getMonth() === visibleMonth.getMonth();
			const isPast = startOfDay(date).getTime() < today.getTime();
			if (isInMonth && !isPast && hasKnownAvailability(date)) return date;
		}
		return null;
	}, [calendarCells, visibleMonth, today, hasKnownAvailability]);
	const selectedOrFirstDateKey = React.useMemo(() => {
		if (
			selectedDate &&
			selectedDate.getFullYear() === visibleMonth.getFullYear() &&
			selectedDate.getMonth() === visibleMonth.getMonth() &&
			hasKnownAvailability(selectedDate)
		) {
			return dateKeyOf(selectedDate);
		}
		if (firstAvailableDate) {
			return dateKeyOf(firstAvailableDate);
		}
		return null;
	}, [
		selectedDate,
		firstAvailableDate,
		visibleMonth,
		dateKeyOf,
		hasKnownAvailability,
	]);

	const activeDateKey = selectedOrFirstDateKey;

	const selectionUnresolved =
		initialSelectionPending &&
		availableDates !== undefined &&
		!availabilitySettled;

	useIsomorphicLayoutEffect(() => {
		if (!clockReady) return;
		if (!placeholderSelectedRef.current) return;
		if (today.getFullYear() === 2024 && today.getMonth() === 0 && today.getDate() === 1) return;
		const isCalcom = availableDates !== undefined;
		const availabilityKnown = availabilitySettled;
		if (isCalcom && !availabilityKnown) return;
		const todayAvailable = hasKnownAvailability(today);
		const defaultDate = todayAvailable ? today : firstAvailableDate;
		if (defaultDate) {
			placeholderSelectedRef.current = false;
			setInitialSelectionPending(false);
			React.startTransition(() => {
				setSelectedDate(defaultDate);
				onDateChange?.(defaultDate);
			});
		} else if (isCalcom && availabilityKnown) {
			setSelectedDate(null);
		}
	}, [clockReady, today, hasKnownAvailability, firstAvailableDate, availableDates, slotsLoading, availabilitySettled, onDateChange]);

	useIsomorphicLayoutEffect(() => {
		if (!clockReady) return;
		if (placeholderSelectedRef.current) return;
		if (!selectedDate) return;
		const isCalcom = availableDates !== undefined;
		if (isCalcom && !availabilitySettled) return;
		const past = startOfDay(selectedDate).getTime() < today.getTime();
		const unavailable = isCalcom && !hasKnownAvailability(selectedDate);
		if (!past && !unavailable) return;
		const todayAvailable = hasKnownAvailability(today);
		const fallback = todayAvailable ? today : firstAvailableDate;
		React.startTransition(() => {
			setSelectedTime(null);
			if (fallback) {
				setSelectedDate(fallback);
				onDateChange?.(fallback);
			} else {
				setSelectedDate(null);
			}
		});
	}, [clockReady, selectedDate, today, availableDates, slotsLoading, availabilitySettled, hasKnownAvailability, firstAvailableDate, onDateChange]);

	const getPayload = React.useCallback(
		(date: Date, time: string): BookingPayload => {
			const isIso = /^\d{4}-\d{2}-\d{2}T/.test(time);
			if (isIso) {
				const matched = availableTimes?.find(
					(candidate) => candidate.value === time,
				);
				const d = new Date(time);
				const minutes = matched?.minutes ?? d.getHours() * 60 + d.getMinutes();
				return {
					date,
					time24h: time,
					timeLabel: formatTimeLabel(
						minutes,
						activeTimeFormat,
						amLabel,
						pmLabel,
					),
					end: matched?.end,
				};
			}
			return {
				date,
				time24h: time,
				timeLabel: formatTimeLabel(
					parseTimeToMinutes(time),
					activeTimeFormat,
					amLabel,
					pmLabel,
				),
			};
		},
		[activeTimeFormat, availableTimes, amLabel, pmLabel],
	);

	const handleDateSelect = React.useCallback(
		(date: Date) => {
			if (startOfDay(date).getTime() < today.getTime()) return;
			placeholderSelectedRef.current = false;
			setInitialSelectionPending(false);
			React.startTransition(() => {
				setSelectedDate(date);
				if (
					date.getFullYear() !== visibleMonth.getFullYear() ||
					date.getMonth() !== visibleMonth.getMonth()
				) {
					setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
				}
				setSelectedTime(null);
			});
			if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current);
			focusRafRef.current = requestAnimationFrame(() => {
				rootRef.current
					?.querySelector<HTMLButtonElement>(
						"button[role='radio']:not([disabled])",
					)
					?.focus();
			});
			pendingSlotListFocusRef.current = true;
			if (onDateChange) onDateChange(date);
		},
		[onDateChange, today, visibleMonth, setVisibleMonth],
	);

	React.useEffect(() => {
		if (!pendingSlotListFocusRef.current) return;
		if (slotsLoading) return;
		if (timeOptions.length === 0) {
			pendingSlotListFocusRef.current = false;
			return;
		}
		pendingSlotListFocusRef.current = false;
		if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current);
		focusRafRef.current = requestAnimationFrame(() => {
			rootRef.current
				?.querySelector<HTMLButtonElement>(
					"button[role='radio']:not([disabled])",
				)
				?.focus();
		});
	}, [slotsLoading, timeOptions]);

	const hasKnownAvailabilityRef = React.useRef(hasKnownAvailability);
	hasKnownAvailabilityRef.current = hasKnownAvailability;

	const moveFocus = React.useCallback(
		(target: Date) => {
			if (startOfDay(target).getTime() < today.getTime()) return;
			if (startOfDay(target).getTime() > maxMonthStart.getTime()) return;
			if (!hasKnownAvailabilityRef.current(target)) return;
			const inVisibleMonth =
				target.getFullYear() === visibleMonth.getFullYear() &&
				target.getMonth() === visibleMonth.getMonth();
			if (!inVisibleMonth) {
				const monthStart = new Date(target.getFullYear(), target.getMonth(), 1);
				pendingMonthFocusRef.current = true;
				pendingMonthFocusTargetRef.current = dateKeyOf(target);
				React.startTransition(() => setVisibleMonth(monthStart));
				return;
			}
			const key = dateKeyOf(target);
			if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current);
			focusRafRef.current = requestAnimationFrame(() => {
				rootRef.current
					?.querySelector<HTMLElement>(`[data-date-key="${key}"]`)
					?.focus();
			});
		},
		[today, visibleMonth, dateKeyOf, maxMonthStart],
	);

	React.useEffect(() => {
		if (!selectedDate || !selectedTime) {
			if (lastReadyKeyRef.current !== "") {
				lastReadyKeyRef.current = "";
				onSelectionReady?.(undefined);
			}
			return;
		}
		const key = `${selectedDate.getTime()}-${selectedTime}-${activeTimeFormat}`;
		if (key === lastReadyKeyRef.current) return;
		lastReadyKeyRef.current = key;
		onSelectionReady?.(getPayload(selectedDate, selectedTime));
	}, [
		selectedDate,
		selectedTime,
		activeTimeFormat,
		onSelectionReady,
		getPayload,
	]);
	const gridFocusRestoreRef = React.useRef(false);
	React.useEffect(() => {
		if (typeof document === "undefined") return;
		if (slotsLoading) {
			const ae = document.activeElement;
			gridFocusRestoreRef.current =
				!!ae && !!rootRef.current?.contains(ae);
		} else if (gridFocusRestoreRef.current) {
			gridFocusRestoreRef.current = false;
			const ae = document.activeElement;
			if (!ae || ae === document.body) {
				const el = rootRef.current?.querySelector(
					'[data-be-active-date="true"]',
				) as HTMLElement | null;
				el?.focus?.();
			}
		}
	}, [slotsLoading]);

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
								: calEventMetaLoadingAria
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
					timeFormatLabel={timeFormatLabel}
				/>
			</div>
		</div>
	);
});

type StepType = "form" | "datetime";
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
	// SYSTEM-CALENDAR: legacy marker type kept only as stored-value defense.
	| "calendar-widget";
type FlowStatus = "in-progress" | "submitting" | "success" | "error";

const FLOW_STATUS_TRANSITIONS: Record<FlowStatus, Array<FlowStatus>> = {
	"in-progress": ["submitting", "success", "error"],
	submitting: ["success", "error"],
	success: ["in-progress"],
	error: ["in-progress"],
};

interface FramerFont {
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: number | string;
	fontStyle?: string;
	letterSpacing?: number | string;
	lineHeight?: number | string;
}

interface FramerBorderStyle {
	borderWidth?: number;
	borderTopWidth?: number;
	borderRightWidth?: number;
	borderBottomWidth?: number;
	borderLeftWidth?: number;
	borderStyle?: string;
	borderColor?: string;
}

interface FieldStyleOverrides {
	font?: FramerFont;
	labelFont?: FramerFont;
	labelColor?: string;
	textColor?: string;
	placeholderColor?: string;
	backgroundColor?: string;
	border?: FramerBorderStyle;
	borderColor?: string;
	borderWidth?: number;
	radius?: number | string;
	padding?: string;
	paddingY?: number;
	paddingX?: number;
	focusBorderColor?: string;
	minHeight?: number;
	spacing?: number;
	selectedBackgroundColor?: string;
	selectedTextColor?: string;
	selectedBorderColor?: string;
	accentColor?: string;
	checkSize?: number;
	shadow?: string;
}

interface FieldConfig {
	id?: string;
	label: string;
	fieldType: FieldType;
	placeholder?: string;
	required: boolean;
	options?: Array<string>;
	optionValues?: Array<string>;
	optionImages?: Array<string | OptionImageSource>;
	optionDescriptions?: Array<string>;
	defaultOption?: string;
	maxLength?: number;
	rows?: number;
	width: "full" | "half";
	isPrimaryName?: boolean;
	calFieldId?: string;
	validationRule?:
	| "type"
	| "none"
	| "email"
	| "phone"
	| "min-length"
	| "custom-regex";
	minLength?: number;
	customRegex?: string;
	regexPreviewInput?: string;
	styles?: FieldStyleOverrides;
	choiceStyles?: FieldStyleOverrides;
	segmentedStyles?: FieldStyleOverrides;
	pillsStyles?: FieldStyleOverrides;
	cardsStyles?: FieldStyleOverrides;
	radioStyles?: FieldStyleOverrides;
	checkStyles?: FieldStyleOverrides;
	calendarStyles?: FieldStyleOverrides;
}

interface StepConfig {
	id?: string;
	enabled: boolean;
	stepType: StepType;
	title: string;
	subtitle?: string;
	fields: FieldConfig[];
	layout: "single-column" | "two-column";
	alignment?: "left" | "center" | "right";
}

interface BookingEngineStyleProps {
	style?: React.CSSProperties;
	styles: {
		accentColor: string;
		accentForegroundColor: string;
		surfaceColor: string;
		textPrimaryColor: string;
		borderColor: string;
		borderRadius: string | number;
		gap?: number;
		density?: "compact" | "comfortable" | "spacious";
		font?: FramerFont;
		headingFont?: FramerFont;
		fieldStyles?: FieldStyleOverrides;
	};
	font: FramerFont;
	headingFont?: FramerFont;
	fieldStyles?: FieldStyleOverrides;
	typography?: {
		font?: FramerFont;
		headingFont?: FramerFont;
	};
	transitionSettings?: {
		transition?: Transition;
		variant?: "fadeRise" | "blurScale" | "slide" | "zoom" | "verticalSlide" | "blurSlide";
	};
	transition: Transition;
	transitionVariant?:
	| "fadeRise"
	| "blurScale"
	| "slide"
	| "zoom"
	| "verticalSlide"
	| "blurSlide";
}

interface ButtonInteractionState {
	transition?: Transition;
	scale?: number;
	opacity?: number;
	textColor?: string;
	backgroundColor?: string;
	border?: FramerBorderStyle;
	shadow?: string;
}
interface ButtonStyleGroup {
	text?: string;
	textColor?: string;
	backgroundColor?: string;
	border?: {
		borderWidth?: number;
		borderColor?: string;
		borderStyle?: string;
		borderTopWidth?: number;
		borderRightWidth?: number;
		borderBottomWidth?: number;
		borderLeftWidth?: number;
	};
	radius?: string | number;
	padding?: string;
	font?: FramerFont;
	shadow?: string;
	hover?: ButtonInteractionState;
	pressed?: ButtonInteractionState;
}
interface BookingEngineCopyProps {
	buttonLabels: {
		primaryButtonStyles?: ButtonStyleGroup;
		secondaryButtonStyles?: ButtonStyleGroup;
		calendarLinkStyles?: ButtonStyleGroup;
		continueButton?: ButtonStyleGroup;
		backButton?: ButtonStyleGroup;
		finalActionButton?: ButtonStyleGroup;
		cancelButton?: ButtonStyleGroup;
		continueLabel?: string;
		backLabel?: string;
		finalActionLabel?: string;
		cancelSubmitLabel?: string;
		buttonsLayout?: {
			groupNavButtons?: boolean;
			groupedNavAlignment?: "left" | "center" | "right";
			buttonOrder?: "backFirst" | "primaryFirst";
			buttonWidth?: "fit" | "fill";
		};
		groupNavButtons?: boolean;
		groupedNavAlignment?: "left" | "center" | "right";
		buttonOrder?: "backFirst" | "primaryFirst";
		buttonWidth?: "fit" | "fill";
		doneButton?: ButtonStyleGroup;
		bookAnotherButton?: ButtonStyleGroup;
		addToCalendarButton?: ButtonStyleGroup;
		googleCalendarButton?: ButtonStyleGroup;
		outlookCalendarButton?: ButtonStyleGroup;
		doneLabel?: string;
		bookAnotherLabel?: string;
		addToCalendarLabel?: string;
		retryButton?: ButtonStyleGroup;
	};
	copy: {
		successTitle: string;
		successSubtitle: string;
		errorTitle: string;
		errorSubtitle: string;
		retryLabel?: string;
		icsSummaryLabel: string;
		stepCounterTemplate: string;
		timeFormatLabel: string;
		googleCalendarLabel?: string;
		outlookCalendarLabel?: string;
		confirmationNumberLabel: string;
		rescheduleOrCancelLabel: string;
		stepProgressLabel: string;
		stepAnnouncementTemplate: string;
		unknownErrorLabel: string;
		errorFallbackMessage: string;
		icsLocationLabel: string;
		calEventMetaLoadingAria: string;
		calEventMetaUnavailableCopy: string;
		notesSelectedTimeLabel: string;
		notesDatePrefix: string;
		notesTimePrefix: string;
		aria: {
			choiceGroup: string;
			timeSlots: string;
			availableTimes: string;
			datePicker: string;
			bookingProgress: string;
			bookingForm: string;
			previousMonthTemplate: string;
			nextMonthTemplate: string;
		};
		errorCopy: ErrorCopy;
		validation?: Partial<ValidationCopy>;
	};
	validation?: Partial<ValidationCopy>;
}

interface BookingEngineConfigProps {
	stepCount: number;
	step1: StepConfig;
	step2: StepConfig;
	step3: StepConfig;
	step4: StepConfig;
	step5: StepConfig;
	step6: StepConfig;
	step7: StepConfig;
	step8: StepConfig;
	step9: StepConfig;
	step10: StepConfig;
	calendar?: {
		title: string;
		subtitle?: string;
		surface?: FieldStyleOverrides;
	};
	progressBar: {
		barVisible?: boolean;
		visible?: boolean;
		barStyle: "solid" | "dashed";
		showText?: boolean;
		showTextContent?: boolean;
		progressText?: "top" | "bottom";
		stepCountPosition?: "top" | "bottom";
	};
	header?: {
		alignment?: "left" | "center" | "right";
		contentAlignment?: "left" | "center" | "right";
		terminalAlignment?: "left" | "center" | "right";
		iconSize?: number;
	};
	terminal?: {
		iconSize?: number;
	};
	calApiKey: string;
	calEventTypeId: string;
	calApiBaseUrl?: string;
	advanced?: {
		instanceId?: string;
		calApiBaseUrl?: string;
	};
	instanceId?: string;
	onAnalytics?: (eventName: string, payload?: Record<string, unknown>) => void;
}

interface BookingEngineProps
	extends BookingEngineStyleProps,
	BookingEngineConfigProps,
	BookingEngineCopyProps { }

const EMAIL_REGEX =
	/^[^\s@]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
const PHONE_REGEX =
	/^\+?[(]?\d{1,4}[)]?(?:[-\s.]?[(]?\d{1,4}[)]?){2,5}[-\s.]?\d{1,9}$/;

const TOUCH_TARGET_MIN = 44;
const COMPACT_BREAKPOINT = 768;
const DENSITY_RATIOS: Record<"compact" | "comfortable" | "spacious", number> = {
	compact: 0.75,
	comfortable: 1,
	spacious: 1.25,
};
function scaleDensity(px: number, ratio: number): number {
	return Math.round(px * ratio);
}
function weeksInMonthView(year: number, month: number, firstDayOfWeek: number): number {
	const offset = (new Date(year, month, 1).getDay() - firstDayOfWeek + 7) % 7;
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	return Math.ceil((offset + daysInMonth) / 7);
}
const TIME_SLOT_SKELETON_COUNT = 8;
const PROGRESS_BAR_HEIGHT = 4;
const CHECKMARK_ICON_SIZE = 64;
const ERROR_ICON_SIZE = 40;
const CHOICE_COLUMNS_BREAKPOINT_WIDE = 560;
const CHOICE_COLUMNS_BREAKPOINT_MEDIUM = 380;
const PILLS_TWO_PER_ROW_BREAKPOINT = 420;
const PROGRESS_BAR_TRANSITION = {
	type: "spring",
	stiffness: 300,
	damping: 30,
} as const;
const TIME_TOGGLE_TRANSITION = {
	type: "spring",
	stiffness: 400,
	damping: 32,
	mass: 0.6,
} as const;
const INSTANT_TRANSITION = { duration: 0 } as const;
const CHOICE_FIELD_TYPES = ["select", "segmented", "pills", "cards", "radio"];
const TEXT_FIELD_TYPES = ["text", "textarea"];
const DEFAULT_MEETING_DURATION_MS = 30 * 60 * 1000;
const DEFAULT_CAL_API_BASE_URL = "https://api.cal.com";
const DEFAULT_CAL_API_VERSION = "2024-09-04";
const CAL_BOOKING_API_VERSION = "2024-08-13";
const DEFAULT_ICS_FILENAME = "Booking Appointment.ics";
const DEFAULT_ICS_UID_DOMAIN = "@booking-engine";

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
	};
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
	};
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
				placeholder: "",
				required: false,
				width: "full",
			},
		],
	};
}

function getRuntimeFallbackStep(index: number): StepConfig {
	if (index === 0) return makeDefaultFormStep();
	if (index === 1) return makeDefaultNotesFormStep(index + 1);
	return makeDefaultBlankFormStep(index + 1);
}

function detectTimezone(): string {
	if (typeof window === "undefined" || typeof Intl === "undefined")
		return "UTC";
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
}

function useCoarsePointer(): boolean {
	const [coarse, setCoarse] = React.useState<boolean>(false);
	const beInteractive = useBeInteractive();
	React.useEffect(() => {
		if (!beInteractive) return;
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		)
			return;
		try {
			setCoarse(window.matchMedia("(pointer: coarse)").matches);
		} catch {
		}
	}, [beInteractive]);
	return coarse;
}

let hydrationSafeIdCounter = 0;
function useHydrationSafeId(prefix: string): string {
	const [id, setId] = React.useState<string>("");
	const beInteractive = useBeInteractive();
	React.useEffect(() => {
		if (!beInteractive) return;
		hydrationSafeIdCounter += 1;
		setId(`${prefix}-${hydrationSafeIdCounter}`);
	}, [prefix, beInteractive]);
	return id;
}

function isValidTimeZone(tz: string | null | undefined): tz is string {
	if (!tz) return false;
	try {
		Intl.DateTimeFormat("en", { timeZone: tz });
		return true;
	} catch {
		return false;
	}
}

interface NormalizedField extends FieldConfig {
	id: string;
}

interface NormalizedStep extends Omit<StepConfig, "fields"> {
	id: string;
	fields: NormalizedField[];
}

interface FilteredFieldOptions {
	options: Array<string>;
	optionValues?: Array<string>;
	optionImages?: Array<string | OptionImageSource>;
	optionDescriptions?: Array<string>;
}

function filterEmptyOptions(field: {
	options?: Array<string>;
	optionValues?: Array<string>;
	optionImages?: Array<string | OptionImageSource>;
	optionDescriptions?: Array<string>;
}): FilteredFieldOptions {
	const rawOptions = Array.isArray(field.options) ? field.options : [];
	const keepIdx: Array<number> = [];
	const options: Array<string> = [];
	rawOptions.forEach((opt, i) => {
		if (typeof opt === "string" && opt.trim().length > 0) {
			keepIdx.push(i);
			options.push(opt);
		}
	});
	function pick<T>(arr: Array<T> | undefined): Array<T> | undefined {
		return Array.isArray(arr) ? keepIdx.map((i) => arr[i]) : arr;
	}
	return {
		options,
		optionValues: pick(field.optionValues),
		optionImages: pick(field.optionImages),
		optionDescriptions: pick(field.optionDescriptions),
	};
}

function isStepAlignment(
	value: unknown,
): value is "left" | "center" | "right" {
	return value === "left" || value === "center" || value === "right";
}

function normalizeSteps(steps: StepConfig[]): NormalizedStep[] {
	return (
		(steps || [])
			.map((step, stepIdx) => ({
				...step,
				id: `step-${stepIdx}`,
				enabled: step.enabled !== false,
				stepType: step.stepType || "form",
				title: step.title || `Step ${stepIdx + 1}`,
				subtitle: step.subtitle || "",
				layout: step.layout || "single-column",
				fields: (step.fields || []).map((field, fieldIdx) => ({
					...field,
					id: `step-${stepIdx}-field-${fieldIdx}`,
					required: field.required !== false,
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
	);
}

interface CalendarStageConfig {
	title: string;
	subtitle: string;
	surface?: FieldStyleOverrides;
}
const SYSTEM_CALENDAR_ID = "system-calendar";
const MAX_SYSTEM_STAGES = 2;
const DEFAULT_CALENDAR_TITLE = "Pick a Time";
const DEFAULT_CALENDAR_SUBTITLE = "Choose a date and time that works for you.";
function migrateLegacyCalendar(slots: StepConfig[]): {
	steps: StepConfig[];
	calendar: CalendarStageConfig;
} {
	const datetimeSlots = (slots || []).filter(
		(slot) => slot && (slot.stepType as string) === "datetime",
	);
	const src = datetimeSlots.length > 0 ? datetimeSlots[0] : undefined;
	const srcMarkers = (src?.fields || []).filter(
		(field) => field && field.fieldType === "calendar-widget",
	);
	const configuredMarker = srcMarkers.find(
		(marker) => marker.calendarStyles !== undefined,
	);
	const calendar: CalendarStageConfig = {
		title: (src && src.title) || DEFAULT_CALENDAR_TITLE,
		subtitle:
			src && src.subtitle !== undefined
				? src.subtitle
				: DEFAULT_CALENDAR_SUBTITLE,
		surface: configuredMarker
			? configuredMarker.calendarStyles
			: srcMarkers.length > 0
				? srcMarkers[0].calendarStyles
				: undefined,
	};
	const steps = (slots || []).map((slot) => {
		const fields = (slot?.fields || []).filter(
			(field) => field && field.fieldType !== "calendar-widget",
		);
		if (!slot || (slot.stepType as string) !== "datetime") {
			return slot ? { ...slot, fields } : slot;
		}
		return {
			...slot,
			stepType: "form" as const,
			fields,
		};
	});
	return { steps, calendar };
}

const MIN_TEXT_LENGTH = 3;

type ValidationCopy = {
	requiredFieldError: string;
	emailError: string;
	phoneError: string;
	minLengthError: string;
	maxLengthError: string;
	pickDateTimeError: string;
	pastTimeError: string;
	minLength: number;
};

const DEFAULT_VALIDATION_COPY: ValidationCopy = {
	requiredFieldError: "This field is required",
	emailError: "Enter a valid email address",
	phoneError: "Enter a valid phone number",
	minLengthError: "Must be at least 3 characters",
	maxLengthError: "Must be at most {max} characters",
	pickDateTimeError: "Please pick a date and time",
	pastTimeError: "Please pick a future time",
	minLength: MIN_TEXT_LENGTH,
};

function validateField(
	field: NormalizedField,
	value: string | boolean | undefined,
	validationCopy?: ValidationCopy,
): string | null {
	const vc = validationCopy ?? DEFAULT_VALIDATION_COPY;
	if (field.fieldType === "calendar-widget") return null;
	if (field.fieldType === "checkbox" && field.required && value !== true) {
		return vc.requiredFieldError;
	}
	const isEmpty =
		value === undefined ||
		value === "" ||
		value === false ||
		(typeof value === "string" && value.trim() === "");
	if (field.required && isEmpty) {
		return vc.requiredFieldError;
	}
	if (isEmpty) return null;
	const str = String(value);
	if (
		field.fieldType === "text" ||
		field.fieldType === "email" ||
		field.fieldType === "phone" ||
		field.fieldType === "textarea"
	) {
		const maxLen = effectiveMaxLength(field);
		if (str.length > maxLen) {
			return vc.maxLengthError.replace("{max}", String(maxLen));
		}
	}
	const minLength = field.minLength ?? vc.minLength;
	if (field.fieldType === "email" && !EMAIL_REGEX.test(str.trim())) {
		return vc.emailError;
	}
	if (field.fieldType === "phone") {
		return validatePhone(str, vc);
	}
	if (
		field.required &&
		(field.fieldType === "text" || field.fieldType === "textarea") &&
		Array.from(str.trim()).length < minLength
	) {
		return vc.minLengthError;
	}
	return null;
}

function validatePhone(str: string, vc: ValidationCopy): string | null {
	const trimmed = str.trim();
	if (!PHONE_REGEX.test(trimmed)) return vc.phoneError;
	const withoutPairs = trimmed.replace(/\([^()]*\)/g, " ");
	if (/[()]/.test(withoutPairs)) {
		return vc.phoneError;
	}
	const digits = trimmed.replace(/\D/g, "").length;
	if (digits < 7) return vc.phoneError;
	return null;
}

const PHONE_DISALLOWED_CHARS = /[^0-9+()\-. ]/g;
function sanitizePhoneInput(value: string): string {
	return value.replace(PHONE_DISALLOWED_CHARS, "");
}

function validateStep(
	step: NormalizedStep,
	values: BookingValues,
	validationCopy?: ValidationCopy,
): { valid: boolean; errors: Record<string, string | null> } {
	const vc = validationCopy ?? DEFAULT_VALIDATION_COPY;
	if (step.stepType === "datetime") {
		const errors: Record<string, string | null> = {};
		for (const field of step.fields) {
			errors[field.id] = validateField(field, values[field.id], validationCopy);
		}
		const slot = values[SELECTED_SLOT_KEY];
		if (!slot) {
			errors[SELECTED_SLOT_KEY] = vc.pickDateTimeError;
		} else {
			const slotDateMs =
				slot.date instanceof Date && !Number.isNaN(slot.date.getTime())
					? slot.date.getTime()
					: Number.NaN;
			const isIsoSlot = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h);
			let startMs: number;
			if (isIsoSlot) {
				startMs = new Date(slot.time24h).getTime();
			} else if (!Number.isNaN(slotDateMs)) {
				const d = new Date(
					slot.date.getFullYear(),
					slot.date.getMonth(),
					slot.date.getDate(),
				);
				d.setMinutes(parseTimeToMinutes(slot.time24h));
				startMs = d.getTime();
			} else {
				startMs = Number.NaN;
			}
			if (Number.isNaN(startMs)) {
				errors[SELECTED_SLOT_KEY] = vc.pickDateTimeError;
			} else if (startMs <= Date.now()) {
				errors[SELECTED_SLOT_KEY] = vc.pastTimeError;
			}
		}
		const valid = Object.values(errors).every((error) => error === null);
		return { valid, errors };
	}
	const errors: Record<string, string | null> = {};
	for (const field of step.fields) {
		errors[field.id] = validateField(field, values[field.id], validationCopy);
	}
	const valid = Object.values(errors).every((error) => error === null);
	return { valid, errors };
}

function touchAllFieldsIn(
	step: NormalizedStep,
	prev: Record<string, boolean>,
): Record<string, boolean> {
	const next = { ...prev };
	if (step.stepType === "form" || step.stepType === "datetime") {
		for (const field of step.fields) next[field.id] = true;
	}
	if (step.stepType === "datetime") next[SELECTED_SLOT_KEY] = true;
	return next;
}

function clearedStepErrors(
	prev: Record<string, string | null>,
	step: NormalizedStep,
): Record<string, string | null> {
	const ids: Array<string> = step.fields.map((field) => field.id);
	if (step.stepType === "datetime") ids.push(SELECTED_SLOT_KEY);
	let dirty = false;
	for (const id of ids) {
		if (prev[id] !== undefined && prev[id] !== null) {
			dirty = true;
			break;
		}
	}
	if (!dirty) return prev;
	const next = { ...prev };
	for (const id of ids) next[id] = null;
	return next;
}

interface CalSlot {
	start: string;
	end?: string;
}

function normalizeCalSlot(s: unknown): CalSlot | null {
	if (typeof s !== "object" || s === null) return null;
	const raw = s as { start?: unknown; time?: unknown; end?: unknown };
	const start = typeof raw.start === "string" ? raw.start : raw.time;
	if (typeof start !== "string" || start.length === 0) return null;
	if (raw.end !== undefined && typeof raw.end !== "string") return null;
	return {
		start,
		...(typeof raw.end === "string" && raw.end.length > 0
			? { end: raw.end }
			: {}),
	};
}

interface UseCalcomSlotsResult {
	slots: Array<{
		value: string;
		label: string;
		end?: string;
		minutes: number;
	}>;
	loading: boolean;
	error: string | null;
	refetch: () => void;
	settledKey: string | null;
}

function monthCacheKey(
	monthStart: Date,
	timeZone: string,
	apiKey: string,
	eventTypeId: string,
	apiBase: string,
): string {
	return `${getDateKeyInTimeZone(monthStart, timeZone || "").slice(0, 7)}|${timeZone}|${apiKey}|${eventTypeId}|${apiBase}`;
}

const FETCH_TIMEOUT_MS = 18000;

const CAL_RATE_LIMIT_MEMORY_MS = 90 * 1000;
let lastCalRateLimitAt = 0;
function noteCalRateLimit(): void {
	lastCalRateLimitAt = Date.now();
}
function recentCalRateLimit(): boolean {
	return (
		lastCalRateLimitAt > 0 &&
		Date.now() - lastCalRateLimitAt < CAL_RATE_LIMIT_MEMORY_MS
	);
}

let BE_INTERACTIVE = false;
const BE_INTERACTIVE_LISTENERS = new Set<() => void>();

function beSetInteractive(): void {
	if (BE_INTERACTIVE) return;
	BE_INTERACTIVE = true;
	for (const listener of Array.from(BE_INTERACTIVE_LISTENERS)) {
		try {
			listener();
		} catch {
		}
	}
}

const BE_INTERACTION_EVENTS: Array<
	keyof WindowEventMap
> = ["pointermove", "pointerdown", "keydown", "touchstart", "wheel"];

if (typeof window !== "undefined") {
	if (RenderTarget.current() === RenderTarget.canvas) {
		beSetInteractive();
	} else {
		for (const type of BE_INTERACTION_EVENTS) {
			window.addEventListener(type, beSetInteractive, {
				once: true,
				capture: true,
				passive: true,
			});
		}
	}
}

function useBeInteractive(): boolean {
	const [interactive, setInteractive] = React.useState(BE_INTERACTIVE);
	React.useEffect(() => {
		if (BE_INTERACTIVE) {
			setInteractive(true);
			return;
		}
		const listener = () => setInteractive(true);
		BE_INTERACTIVE_LISTENERS.add(listener);
		return () => {
			BE_INTERACTIVE_LISTENERS.delete(listener);
		};
	}, []);
	return interactive;
}

const calSlotsCache = new Map<
	string,
	{
		slots: Array<{
			value: string;
			label: string;
			end?: string;
			minutes: number;
		}>;
		fetchedAt: number;
	}
>();

interface CalSlotsOutcome {
	error: string | null;
}
const calSlotsInflight = new Map<string, Promise<CalSlotsOutcome>>();

const SLOTS_CACHE_TTL_MS = 5 * 60 * 1000;

class HttpFetchError extends Error {
	status?: number;
	retryAfterSeconds?: number;
	constructor(message: string, status?: number, retryAfterSeconds?: number) {
		super(message);
		this.name = "HttpFetchError";
		this.status = status;
		this.retryAfterSeconds = retryAfterSeconds;
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
	cacheTtlMs?: number,
): UseCalcomSlotsResult {
	const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopy || {}) };
	const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "");
	const apiVer = apiVersion || DEFAULT_CAL_API_VERSION;
	const cacheTtl =
		typeof cacheTtlMs === "number" && cacheTtlMs >= 0
			? cacheTtlMs
			: SLOTS_CACHE_TTL_MS;
	const isStaticRender = useIsStaticRenderer();
	const beInteractive = useBeInteractive();
	const [slots, setSlots] = React.useState<
		Array<{ value: string; label: string; end?: string; minutes: number }>
	>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [settledKey, setSettledKey] = React.useState<string | null>(null);
	const cacheRef = React.useRef<
		Map<
			string,
			{
				slots: Array<{
					value: string;
					label: string;
					end?: string;
					minutes: number;
				}>;
				fetchedAt: number;
			}
		>
	>(calSlotsCache);
	const [refreshNonce, setRefreshNonce] = React.useState(0);
	const refetch = React.useCallback(() => {
		if (!monthStart) return;
		cacheRef.current.delete(
			monthCacheKey(monthStart, timeZone, apiKey, eventTypeId, apiBase),
		);
		setRefreshNonce((count) => count + 1);
	}, [monthStart, timeZone, apiKey, eventTypeId, apiBase]);

	React.useEffect(() => {
		cacheRef.current.clear();
	}, [apiKey, eventTypeId, timeZone, apiBase]);

	React.useEffect(() => {
		if (!beInteractive) return;
		if (!apiKey || !eventTypeId || !monthStart) {
			setLoading(false);
			return;
		}
		if (typeof window === "undefined") {
			setLoading(false);
			return;
		}
		if (isStaticRender) {
			setLoading(false);
			return;
		}

		const monthKey = monthCacheKey(
			monthStart,
			timeZone,
			apiKey,
			eventTypeId,
			apiBase,
		);
		const cached = cacheRef.current.get(monthKey);
		if (cached && Date.now() - cached.fetchedAt < cacheTtl) {
			setSlots(cached.slots);
			setLoading(false);
			setError(null);
			setSettledKey(monthKey);
			return;
		}
		const inflight = calSlotsInflight.get(monthKey);
		if (inflight) {
			setLoading(true);
			setError(null);
			inflight.then((outcome) => {
				if (cancelled) return;
				const fresh = cacheRef.current.get(monthKey);
				if (fresh) {
					setSlots(fresh.slots);
					setError(null);
				} else if (outcome.error) {
					setError(outcome.error);
					setSlots([]);
				}
				setLoading(false);
				setSettledKey(monthKey);
			});
			return () => {
				cancelled = true;
			};
		}

		let cancelled = false;
		let resolveInflight!: (outcome: CalSlotsOutcome) => void;
		const inflightPromise = new Promise<CalSlotsOutcome>((resolve) => {
			resolveInflight = resolve;
		});
		calSlotsInflight.set(monthKey, inflightPromise);
		const settleInflight = (outcome: CalSlotsOutcome): void => {
			if (calSlotsInflight.get(monthKey) === inflightPromise) {
				calSlotsInflight.delete(monthKey);
			}
			resolveInflight(outcome);
		};
		const backoffTimers: number[] = [];
		const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
		start.setDate(start.getDate() - 15);
		const end = new Date(
			monthStart.getFullYear(),
			monthStart.getMonth() + 1,
			0,
			23,
			59,
			59,
		);
		end.setDate(end.getDate() + 15);
		const startStr = start.toISOString();
		const endStr = end.toISOString();
		const url = `${apiBase}/v2/slots?eventTypeId=${encodeURIComponent(
			eventTypeId,
		)}&start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(
			endStr,
		)}&timeZone=${encodeURIComponent(timeZone)}&format=range`;

		setLoading(true);
		setError(null);
		setSettledKey(null);
		setSlots([]);

		const controller = new AbortController();
		const timeoutMsValue = timeoutMs ?? FETCH_TIMEOUT_MS;

		const attempt = (triesLeft: number) => {
			if (typeof navigator !== "undefined" && navigator.onLine === false) {
				setError(copy.offlineError);
				setSlots([]);
				setLoading(false);
				setSettledKey(monthKey);
				return;
			}
			const attemptTimeoutId = window.setTimeout(
				() => controller.abort(),
				timeoutMsValue,
			);
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
						let retryAfterSeconds: number | undefined;
						const retryAfter = res.headers.get("retry-after");
						if (retryAfter) {
							const asSeconds = Number(retryAfter);
							if (Number.isFinite(asSeconds) && asSeconds > 0) {
								retryAfterSeconds = asSeconds;
							} else {
								const asDate = new Date(retryAfter).getTime();
								if (Number.isFinite(asDate)) {
									retryAfterSeconds = Math.max(
										0,
										Math.ceil((asDate - Date.now()) / 1000),
									);
								}
							}
						}
						throw new HttpFetchError(
							`HTTP ${res.status}`,
							res.status,
							retryAfterSeconds,
						);
					}
					const json = await readJson<
						| { data?: unknown[] }
						| {
							data?: {
								slots?: Record<string, unknown[]>;
							};
						}
						| { slots?: unknown[] }
						| unknown[]
					>(res);
					if (cancelled) return;
					let rawSlots: unknown[] = [];
					if (json && typeof json === "object" && !Array.isArray(json)) {
						const body = json as { data?: unknown; slots?: unknown };
						const data = body.data;
						if (Array.isArray(data)) {
							rawSlots = data;
						} else if (data && typeof data === "object") {
							const slots = (data as { slots?: unknown }).slots;
							if (slots && typeof slots === "object") {
								rawSlots = Object.values(slots).flat();
							} else {
								rawSlots = Object.values(data).flat();
							}
						} else if (Array.isArray(body.slots)) {
							rawSlots = body.slots;
						}
					} else if (Array.isArray(json)) {
						rawSlots = json;
					}
					const mapped = rawSlots
						.map(normalizeCalSlot)
						.filter((slot): slot is CalSlot => slot !== null)
						.map((slot) => {
							const d = new Date(slot.start);
							const minutes = getMinutesInTimeZone(d, timeZone);
							return {
								value: slot.start,
								label: formatTimeLabel(minutes, "12h"),
								end: slot.end,
								minutes,
							};
						})
						.filter((slot) => !Number.isNaN(slot.minutes))
						.sort((a, b) => (a.value < b.value ? -1 : 1));
					cacheRef.current.set(monthKey, {
						slots: mapped,
						fetchedAt: Date.now(),
					});
					settleInflight({ error: null });
					if (cancelled) return;
					setSlots(mapped);
					setLoading(false);
					setSettledKey(monthKey);
				})
				.catch((err: unknown) => {
					const httpErr = err instanceof HttpFetchError ? err : null;
					const plainErr = err instanceof Error ? err : null;
					const timedOut = plainErr?.name === "AbortError";
					const status = httpErr?.status;
					if (
						!cancelled &&
						!timedOut &&
						typeof status === "number" &&
						status >= 500 &&
						triesLeft > 0
					) {
						const backoffMs = triesLeft === 2 ? 1000 : 3000;
						backoffTimers.push(
							window.setTimeout(() => attempt(triesLeft - 1), backoffMs),
						);
						return;
					}
					let message: string;
					if (timedOut) {
						message = copy.slotsTimeoutError;
					} else if (status === 401 || status === 403) {
						message = copy.credentialError;
					} else if (status === 404) {
						message = copy.slotsNotFoundError;
					} else if (status === 429) {
						noteCalRateLimit();
						const waitSeconds =
							typeof httpErr?.retryAfterSeconds === "number"
								? httpErr.retryAfterSeconds
								: undefined;
						message =
							waitSeconds !== undefined && waitSeconds > 0
								? copy.slotsRateLimitTemplate.replace(
									"{seconds}",
									String(Math.min(waitSeconds, 90)),
								)
								: copy.slotsRateLimitGenericError;
					} else if (status && status >= 500) {
						message = copy.slotsUnavailableError;
					} else {
						message =
							plainErr?.message === MALFORMED_JSON_ERROR
								? copy.slotsFallbackError
								: plainErr instanceof TypeError ||
									plainErr?.name === "TypeError" ?
									recentCalRateLimit()
										? copy.slotsRateLimitGenericError
										: copy.networkError
									: fallbackErrorLabel || copy.slotsFallbackError;
					}
					setError(message);
					settleInflight({ error: message });
					if (cancelled) return;
					setSlots([]);
					setLoading(false);
					setSettledKey(monthKey);
				})
				.finally(() => {
					window.clearTimeout(attemptTimeoutId);
				});
		};
		attempt(2);

		return () => {
			cancelled = true;
			controller.abort();
			if (calSlotsInflight.get(monthKey) === inflightPromise) {
				settleInflight({ error: null });
			}
			backoffTimers.forEach((id) => {
				window.clearTimeout(id);
			});
		};
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
	]);

	return { slots, loading, error, refetch, settledKey };
}

const CAL_EVENT_TYPE_API_VERSION = "2024-06-14";
const CAL_META_LOADING_ARIA = "Loading meeting details";
const CAL_META_UNAVAILABLE_COPY = "Meeting details are temporarily unavailable.";
const HYDRATION_PLACEHOLDER_TODAY = new Date(2024, 0, 1);
const EVENT_META_CACHE_TTL_MS = SLOTS_CACHE_TTL_MS;

/** Normalized, all-optional metadata model the UI renders from. */
interface CalEventMeta {
	title?: string;
	description?: string;
	durationMinutes?: number;
	multipleLengths?: number[];
	locationLabel?: string;
	organizerName?: string;
	avatarUrl?: string;
}

const CAL_INTEGRATION_LABELS: Record<string, string> = {
	"cal-video": "Cal Video",
	"google-meet": "Google Meet",
	zoom: "Zoom",
	"whereby-video": "Whereby",
	"webex-video": "Webex",
	"jitsi": "Jitsi",
	"office365-video": "Teams",
	"microsoft-teams-video": "Teams",
	"discord-video": "Discord",
	"facetime-video": "FaceTime",
	"signal-video": "Signal",
	"skype-video": "Skype",
	"telegram-video": "Telegram",
	"whatsapp-video": "WhatsApp",
};

function normalizeCalLocationLabel(raw: unknown): string | undefined {
	if (typeof raw !== "object" || raw === null) return undefined;
	const loc = raw as {
		type?: unknown;
		address?: unknown;
		link?: unknown;
		phone?: unknown;
		integration?: unknown;
	};
	const asString = (v: unknown): string | undefined =>
		typeof v === "string" && v.trim() ? v.trim() : undefined;
	switch (loc.type) {
		case "address":
			return asString(loc.address);
		case "link":
			return asString(loc.link);
		case "phone":
			return asString(loc.phone);
		case "integration": {
			const key = typeof loc.integration === "string" ? loc.integration : "";
			return CAL_INTEGRATION_LABELS[key];
		}
		default:
			return undefined;
	}
}

function normalizeCalEventMeta(data: unknown): CalEventMeta | null {
	if (typeof data !== "object" || data === null) return null;
	const d = data as Record<string, unknown>;
	const meta: CalEventMeta = {};
	const asString = (v: unknown): string | undefined =>
		typeof v === "string" && v.trim() ? v.trim() : undefined;

	meta.title = asString(d.title);
	meta.description = asString(d.description);
	if (
		typeof d.lengthInMinutes === "number" &&
		Number.isFinite(d.lengthInMinutes) &&
		d.lengthInMinutes > 0
	) {
		meta.durationMinutes = d.lengthInMinutes;
	}
	if (typeof d.metadata === "object" && d.metadata !== null) {
		const raw = (d.metadata as Record<string, unknown>).multipleLengths;
		if (Array.isArray(raw)) {
			const lengths = raw.filter(
				(v): v is number =>
					typeof v === "number" && Number.isFinite(v) && v > 0,
			);
			if (lengths.length) meta.multipleLengths = lengths.slice(0, 20);
		}
	}
	if (Array.isArray(d.locations)) {
		for (const loc of d.locations) {
			const label = normalizeCalLocationLabel(loc);
			if (label) {
				meta.locationLabel = label;
				break;
			}
		}
	}

	const team =
		typeof d.team === "object" && d.team !== null
			? (d.team as Record<string, unknown>)
			: null;
	if (team) {
		meta.organizerName = asString(team.name);
		meta.avatarUrl = asString(team.logoUrl);
	}
	if (!meta.organizerName || !meta.avatarUrl) {
		const hosts = Array.isArray(d.hosts) ? d.hosts : null;
		const users = Array.isArray(d.users) ? d.users : null;
		let person: Record<string, unknown> | null = null;
		if (hosts && hosts.length) {
			for (const h of hosts) {
				if (
					typeof h === "object" &&
					h !== null &&
					(h as Record<string, unknown>).mandatory === true
				) {
					person = h as Record<string, unknown>;
					break;
				}
			}
			if (!person && typeof hosts[0] === "object" && hosts[0] !== null) {
				person = hosts[0] as Record<string, unknown>;
			}
		}
		if (!person && users && users.length) {
			const ownerId = typeof d.ownerId === "number" ? d.ownerId : undefined;
			for (const u of users) {
				if (
					typeof u === "object" &&
					u !== null &&
					ownerId !== undefined &&
					(u as Record<string, unknown>).id === ownerId
				) {
					person = u as Record<string, unknown>;
					break;
				}
			}
			if (!person && typeof users[0] === "object" && users[0] !== null) {
				person = users[0] as Record<string, unknown>;
			}
		}
		if (person) {
			if (!meta.organizerName) meta.organizerName = asString(person.name);
			if (!meta.avatarUrl) meta.avatarUrl = asString(person.avatarUrl);
		}
	}

	return Object.keys(meta).length ? meta : null;
}

interface CalBookingField {
	slug: string;
	label: string;
	type: string;
	required: boolean;
	hidden: boolean;
	isDefault: boolean;
	placeholder?: string;
	options?: string[];
}

function normalizeCalBookingFields(data: unknown): CalBookingField[] {
	if (typeof data !== "object" || data === null) return [];
	const d = data as Record<string, unknown>;
	const rawFields = Array.isArray(d.bookingFields) ? d.bookingFields : [];
	const out: CalBookingField[] = [];
	for (const raw of rawFields) {
		if (typeof raw !== "object" || raw === null) continue;
		const f = raw as Record<string, unknown>;
		const slug = typeof f.slug === "string" ? f.slug.trim() : "";
		if (!slug) continue;
		const label = typeof f.label === "string" && f.label.trim() ? f.label.trim() : slug;
		const type = typeof f.type === "string" ? f.type : "text";
		const required = f.required === true;
		const hidden = f.hidden === true;
		const isDefault = f.isDefault === true;
		const placeholder = typeof f.placeholder === "string" ? f.placeholder : undefined;
		let options: string[] | undefined;
		const rawOptions = (f as { options?: unknown; variants?: unknown }).options ?? (f as { variants?: unknown }).variants;
		if (Array.isArray(rawOptions)) {
			const parsed = rawOptions
				.map((o) => {
					if (typeof o === "string") return o.trim();
					if (typeof o === "object" && o !== null) {
						const ro = o as Record<string, unknown>;
						if (typeof ro.label === "string" && ro.label.trim()) return ro.label.trim();
						if (typeof ro.value === "string" && ro.value.trim()) return ro.value.trim();
						if (typeof ro.option === "string" && ro.option.trim()) return ro.option.trim();
					}
					return "";
				})
				.filter((v) => v.length > 0);
			if (parsed.length) options = parsed;
		}
		out.push({ slug, label, type, required, hidden, isDefault, placeholder, options });
	}
	return out;
}

function calTypeToFieldType(calType: string): FieldType {
	switch ((calType || "").toLowerCase()) {
		case "phone":
			return "phone";
		case "email":
			return "email";
		case "textarea":
		case "multilinetext":
			return "textarea";
		case "text":
		case "url":
		case "number":
		default:
			if (["select", "multiselect", "radio", "radiogroup", "checkboxgroup", "selectgroup"].includes((calType || "").toLowerCase())) {
				return "select";
			}
			if (["boolean", "checkbox"].includes((calType || "").toLowerCase())) {
				return "checkbox";
			}
			return "text";
	}
}

async function fetchCalEventTypeMeta(params: {
	apiKey: string;
	eventTypeId: string;
	apiBaseUrl?: string;
	timeoutMs?: number;
}): Promise<{ meta: CalEventMeta | null; bookingFields: CalBookingField[] }> {
	const { apiKey, eventTypeId, apiBaseUrl, timeoutMs } = params;
	const parsedId = Number(eventTypeId);
	if (!apiKey || !eventTypeId || !Number.isFinite(parsedId)) return { meta: null, bookingFields: [] };
	const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "");
	const controller = new AbortController();
	const timeoutId = setTimeout(
		() => controller.abort(),
		timeoutMs ?? FETCH_TIMEOUT_MS,
	);
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
			},
		);
		if (!res.ok) return { meta: null, bookingFields: [] };
		const json = (await res.json().catch(() => null)) as unknown;
		if (typeof json !== "object" || json === null) return { meta: null, bookingFields: [] };
		const data = (json as { data?: unknown }).data;
		return { meta: normalizeCalEventMeta(data), bookingFields: normalizeCalBookingFields(data) };
	} catch {
		return { meta: null, bookingFields: [] };
	} finally {
		clearTimeout(timeoutId);
	}
}

const calEventMetaCache = new Map<
	string,
	{ meta: CalEventMeta | null; bookingFields: CalBookingField[]; fetchedAt: number }
>();

type CalEventMetaStatus = "disabled" | "loading" | "ready" | "failed";

function useCalcomEventMeta(params: {
	enabled: boolean;
	apiKey: string;
	eventTypeId: string;
	apiBaseUrl?: string;
}): { status: CalEventMetaStatus; meta: CalEventMeta | null; bookingFields: CalBookingField[] } {
	const { enabled, apiKey, eventTypeId, apiBaseUrl } = params;
	const [status, setStatus] = React.useState<CalEventMetaStatus>(() =>
		apiKey && eventTypeId ? "loading" : "disabled",
	);
	const [meta, setMeta] = React.useState<CalEventMeta | null>(null);
	const [bookingFields, setBookingFields] = React.useState<CalBookingField[]>([]);
	const cacheKey = `${(apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "")}|${apiKey}|${eventTypeId}`;
	React.useEffect(() => {
		if (!apiKey || !eventTypeId) {
			setStatus("disabled");
			setBookingFields([]);
			return;
		}
		if (!enabled) {
			return;
		}
		const cached = calEventMetaCache.get(cacheKey);
		if (cached && Date.now() - cached.fetchedAt < EVENT_META_CACHE_TTL_MS) {
			setMeta(cached.meta);
			setBookingFields(cached.bookingFields || []);
			setStatus(cached.meta || cached.bookingFields.length ? "ready" : "failed");
			return;
		}
		setStatus("loading");
		let cancelled = false;
		fetchCalEventTypeMeta({ apiKey, eventTypeId, apiBaseUrl }).then((res) => {
			if (cancelled) return;
			const hasData = res.meta !== null || (res.bookingFields && res.bookingFields.length > 0);
			if (hasData) {
				calEventMetaCache.set(cacheKey, { meta: res.meta, bookingFields: res.bookingFields, fetchedAt: Date.now() });
				setMeta(res.meta);
				setBookingFields(res.bookingFields);
				setStatus("ready");
			} else {
				setMeta(null);
				setBookingFields([]);
				setStatus("failed");
			}
		})
			.catch(() => {
				if (cancelled) return;
				setMeta(null);
				setBookingFields([]);
				setStatus("failed");
			});
		return () => {
			cancelled = true;
		};
	}, [enabled, apiKey, eventTypeId, cacheKey, apiBaseUrl]);
	return { status, meta, bookingFields };
}

interface SubmitBookingResult {
	success: boolean;
	error: string | null;
	bookingUid?: string;
	rescheduleUrl?: string;
	cancelUrl?: string;
	errorCode?: string;
	alreadyMapped?: boolean;
	httpStatus?: number;
}

interface BookingConfirmation {
	uid: string | null;
	manageUrl: string | null;
	rescheduleUrl: string | null;
	cancelUrl: string | null;
}

async function submitCalcomBooking(params: {
	apiKey: string;
	eventTypeId: string;
	slotStart: string;
	slotEnd?: string;
	allowLengthInMinutes?: boolean;
	name: string;
	email: string;
	timeZone: string;
	idempotencyKey?: string;
	bookingFieldsResponses?: Record<string, string>;
	externalSignal?: AbortSignal;
	errorCopy?: Partial<ErrorCopy>;
	timeoutMs?: number;
	apiBaseUrl?: string;
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
		idempotencyKey,
		bookingFieldsResponses,
		externalSignal,
		errorCopy: errorCopyParam,
		timeoutMs,
		apiBaseUrl,
	} = params;
	const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopyParam || {}) };
	const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "");
	const apiVer = CAL_BOOKING_API_VERSION;
	const parsedEventTypeId = Number(eventTypeId);
	if (!eventTypeId || !Number.isFinite(parsedEventTypeId)) {
		return {
			success: false,
			error: copy.misconfiguredFormError,
		};
	}
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotStart)) {
		return {
			success: false,
			error: copy.invalidSlotTimeError,
			errorCode: "INVALID_SLOT_START",
		};
	}
	const controller = new AbortController();
	const timeoutMsValue = timeoutMs ?? FETCH_TIMEOUT_MS;
	const timeoutId = setTimeout(() => controller.abort(), timeoutMsValue);
	let externalAbortHandler: (() => void) | null = null;
	if (externalSignal) {
		if (externalSignal.aborted) {
			controller.abort();
		} else {
			externalAbortHandler = () => controller.abort();
			externalSignal.addEventListener("abort", externalAbortHandler, {
				once: true,
			});
		}
	}
	if (typeof navigator !== "undefined" && navigator.onLine === false) {
		console.warn("[BookingEngine] booking aborted: browser offline.");
		return {
			success: false,
			error: copy.offlineError,
			errorCode: "OFFLINE",
		};
	}
	const payloadPreview = {
		eventTypeId: parsedEventTypeId,
		start: slotStart,
		hasEnd: Boolean(
			slotEnd && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotEnd),
		),
		attendeeKeys: ["name", "email", "timeZone", "language"],
		bookingFieldsResponseKeys: bookingFieldsResponses
			? Object.keys(bookingFieldsResponses)
			: [],
	};
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
						return {};
					}
					const mins = Math.round(
						(new Date(slotEnd).getTime() - new Date(slotStart).getTime()) /
						60000,
					);
					return Number.isFinite(mins) && mins >= 1
						? { lengthInMinutes: mins }
						: {};
				})(),
				attendee: {
					name,
					email,
					timeZone,
					language:
						(typeof navigator !== "undefined" &&
							navigator.language?.slice(0, 2)) ||
						"en",
				},
				metadata: {},
				...(bookingFieldsResponses && Object.keys(bookingFieldsResponses).length
					? { bookingFieldsResponses }
					: {}),
			}),
			signal: controller.signal,
		});
		interface CalcomSubmitResponseJson {
			data?: {
				booking?: { uid?: string; rescheduleUrl?: string; cancelUrl?: string };
				uid?: string;
				id?: string;
				rescheduleUrl?: string;
				cancelUrl?: string;
			};
			uid?: string;
			id?: string;
			rescheduleUrl?: string;
			cancelUrl?: string;
			error?: {
				message?: string;
				code?: string;
				errorCode?: string;
			};
			message?: string;
			code?: string;
		}
		let json: CalcomSubmitResponseJson | null = null;
		let bodyWasMalformed = false;
		{
			const rawText = await res.text();
			if (rawText.trim()) {
				try {
					json = JSON.parse(rawText) as CalcomSubmitResponseJson | null;
				} catch {
					json = null;
					bodyWasMalformed = true;
				}
			}
		}
		if (!res.ok) {
			const apiError = json?.error?.message || json?.message || json?.error;
			const code = json?.error?.code || json?.code || json?.error?.errorCode;
			let retryAfterSeconds: number | undefined;
			if (res.status === 429) {
				const retryAfter = res.headers.get("retry-after");
				if (retryAfter) {
					const asSeconds = Number(retryAfter);
					if (Number.isFinite(asSeconds) && asSeconds > 0) {
						retryAfterSeconds = asSeconds;
					} else {
						const asDate = new Date(retryAfter).getTime();
						if (Number.isFinite(asDate)) {
							retryAfterSeconds = Math.max(
								0,
								Math.ceil((asDate - Date.now()) / 1000),
							);
						}
					}
				}
				if (retryAfterSeconds && retryAfterSeconds > 0) {
					noteCalRateLimit();
					console.error("[BookingEngine] booking:failure", {
						endpoint: "POST /v2/bookings",
						httpStatus: res.status,
						category: "rate-limit",
						errorCode: code || "RATE_LIMIT_EXCEEDED",
						retryAfterSeconds,
						calcomMessage:
							typeof apiError === "string" ? apiError : undefined,
					});
					return {
						success: false,
						error: copy.slotsRateLimitTemplate.replace(
							"{seconds}",
							String(Math.min(retryAfterSeconds, 90)),
						),
						errorCode: code || "RATE_LIMIT_EXCEEDED",
						httpStatus: res.status,
						alreadyMapped: true,
					};
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
				});
				if (res.status === 429) {
					noteCalRateLimit();
				}
				return {
					success: false,
					error: String(apiError),
					errorCode: code,
					httpStatus: res.status,
				};
			}
			if (res.status === 429) {
				noteCalRateLimit();
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
			});
			return {
				success: false,
				error: copy.httpStatusTemplate.replace("{status}", String(res.status)),
				errorCode: code,
				httpStatus: res.status,
				alreadyMapped: true,
			};
		}
		if (
			bodyWasMalformed ||
			!json ||
			(typeof json === "object" && Object.keys(json).length === 0)
		) {
			return {
				success: false,
				error: bodyWasMalformed
					? copy.malformedResponseError
					: copy.emptyResponseError,
				errorCode: bodyWasMalformed ? MALFORMED_JSON_ERROR : "EMPTY_RESPONSE",
				alreadyMapped: true,
			};
		}
		const uid =
			json?.data?.booking?.uid ||
			json?.data?.uid ||
			json?.data?.id ||
			json?.uid ||
			json?.id;
		if (!uid) {
			return {
				success: false,
				error: copy.emptyResponseError,
				errorCode: "NO_UID_IN_SUCCESS_RESPONSE",
				httpStatus: res.status,
				alreadyMapped: true,
			};
		}
		const rescheduleUrl =
			json?.data?.booking?.rescheduleUrl ||
			json?.data?.rescheduleUrl ||
			json?.rescheduleUrl;
		const cancelUrl =
			json?.data?.booking?.cancelUrl ||
			json?.data?.cancelUrl ||
			json?.cancelUrl;
		return {
			success: true,
			error: null,
			bookingUid: uid,
			...(rescheduleUrl ? { rescheduleUrl } : {}),
			...(cancelUrl ? { cancelUrl } : {}),
		};
	} catch (err: unknown) {
		const errObj =
			err instanceof Error
				? (err as Error & { code?: string; errorCode?: string })
				: null;
		const timedOut = errObj?.name === "AbortError";
		const malformed = errObj?.message === MALFORMED_JSON_ERROR;
		const opaqueAfterRateLimit =
			!timedOut &&
			!malformed &&
			(errObj instanceof TypeError || errObj?.name === "TypeError") &&
			recentCalRateLimit();
		const mappedError = timedOut
			? copy.submitTimeoutError
			: malformed
				? copy.malformedResponseError
				: opaqueAfterRateLimit
					? copy.slotsRateLimitGenericError
					: mapCalcomError(
						errObj?.message || "",
						errObj?.code || errObj?.errorCode,
						copy,
					);
		console.error("[BookingEngine] booking:failure", {
			endpoint: "POST /v2/bookings",
			category: timedOut
				? "timeout"
				: malformed
					? "malformed-response"
					: opaqueAfterRateLimit
						? "rate-limit"
						: "network",
			errorCode:
				timedOut
					? "TIMEOUT"
					: malformed
						? MALFORMED_JSON_ERROR
						: opaqueAfterRateLimit
							? "RATE_LIMIT_EXCEEDED"
							: errObj?.code || errObj?.errorCode || undefined,
			rawError: errObj?.message,
			recentRateLimit: recentCalRateLimit(),
		});
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
		};
	} finally {
		clearTimeout(timeoutId);
		if (externalAbortHandler && externalSignal) {
			externalSignal.removeEventListener("abort", externalAbortHandler);
			externalAbortHandler = null;
		}
	}
}

function mapCalcomError(
	message: string,
	code?: string,
	errorCopy?: Partial<ErrorCopy>,
	fallback: string = DEFAULT_COPY_SUBMIT_ERROR_FALLBACK,
	status?: number,
): string {
	const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopy || {}) };
	switch ((code || "").toUpperCase()) {
		case "UNAUTHORIZED":
		case "INVALID_API_KEY":
		case "API_KEY_INVALID":
			return copy.credentialError;
		case "MAXIMUM_NUMBER_OF_BOOKINGS":
		case "BOOKING_LIMIT":
		case "NO_AVAILABILITY":
		case "SLOT_NOT_AVAILABLE":
		case "BOOKING_NOT_FOUND":
			return copy.timeTakenError;
		case "INVALID_EMAIL_ADDRESS":
		case "INVALID_EMAIL":
			return copy.invalidEmailError;
		case "RATE_LIMIT_EXCEEDED":
		case "RATE_LIMIT":
		case "TOO_MANY_REQUESTS":
			return copy.slotsRateLimitGenericError;
		case "INTERNAL_ERROR":
		case "SERVER_ERROR":
		case "INTERNAL_SERVER_ERROR":
			return copy.slotsUnavailableError;
		case "BAD_REQUEST":
		case "VALIDATION_ERROR":
		case "INVALID_REQUEST":
			return copy.badRequestError;
		default:
			break;
	}
	const m = (message || "").toLowerCase();
	if (m.includes("already") && m.includes("booked")) return copy.timeTakenError;
	if (m.includes("outside") || m.includes("availability"))
		return copy.timeNoLongerAvailableError;
	if (m.includes("invalid") && m.includes("email"))
		return copy.invalidEmailError;
	if (m.includes("unauthorized") || m.includes("api key"))
		return copy.credentialError;
	if (m.includes("rate limit") || m.includes("too many requests"))
		return copy.slotsRateLimitGenericError;
	if (m.includes("internal") || m.includes("server error"))
		return copy.slotsUnavailableError;
	if (m.includes("network") || m.includes("fetch")) return copy.networkError;
	if (status === 401 || status === 403) return copy.credentialError;
	if (status === 429) return copy.slotsRateLimitGenericError;
	if (status !== undefined && status >= 500) return copy.slotsUnavailableError;
	if (status === 404) return copy.slotsNotFoundError;
	if (status === 409) return copy.timeTakenError;
	if (status !== undefined && status >= 400 && status < 500) {
		return copy.badRequestError;
	}
	return fallback;
}

function makeIdempotencyKey(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `bk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const MALFORMED_JSON_ERROR = "MALFORMED_JSON_RESPONSE";

async function readJson<
	T extends Record<string, unknown> | unknown[],
>(res: Response): Promise<T> {
	try {
		return (await res.json()) as T;
	} catch {
		throw new Error(MALFORMED_JSON_ERROR);
	}
}

function findField(
	steps: NormalizedStep[],
	predicate: (field: NormalizedField) => boolean,
): NormalizedField | null {
	for (const step of steps) {
		for (const field of step.fields) {
			if (predicate(field)) return field;
		}
	}
	return null;
}

function findNameField(steps: NormalizedStep[]): NormalizedField | null {
	const primary = findField(steps, (field) => field.isPrimaryName === true);
	if (primary) return primary;
	return findField(
		steps,
		(field) => /\bname\b/i.test(field.label) || /\bname\b/i.test(field.id),
	);
}

function findEmailField(steps: NormalizedStep[]): NormalizedField | null {
	const typed = findField(steps, (field) => field.fieldType === "email");
	if (typed) return typed;
	return findField(steps, (field) => {
		if (field.fieldType !== "text") return false;
		const hay = `${field.label} ${field.id}`.toLowerCase();
		return /\b(email|e-mail|mail|contact)\b/.test(hay);
	});
}

function replaceCopyTokens(
	text: string,
	steps: NormalizedStep[],
	values: BookingValues,
	timeZone?: string,
): string {
	if (typeof text !== "string" || !text.includes("{")) return text;
	const formFields = steps.flatMap((step) => step.fields) || [];
	const nameField =
		formFields.find((field) => field.isPrimaryName) || findEmailField(steps);
	const name = nameField ? String(values[nameField.id] ?? "").trim() : "";
	const slot = values[SELECTED_SLOT_KEY];
	const tzOpts = isValidTimeZone(timeZone) ? { timeZone } : undefined;
	const dateOpts: Intl.DateTimeFormatOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		...tzOpts,
	};
	const date = slot
		? /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
			? getCachedDateTimeFormat(pageLocale(), dateOpts).format(
				new Date(slot.time24h),
			)
			: getCachedDateTimeFormat(pageLocale(), dateOpts).format(slot.date)
		: "";
	return text.replace(/\{name\}/g, name).replace(/\{date\}/g, date);
}

function autocompleteToken(field: NormalizedField): string | undefined {
	const label = `${field.label} ${field.id}`.toLowerCase();
	if (field.fieldType === "email") return "email";
	if (field.fieldType === "phone") return "tel";
	if (field.isPrimaryName) return "name";
	if (/\b(postal|zip)\b/.test(label)) return "postal-code";
	if (/\b(country|nation)\b/.test(label)) return "country";
	if (/\baddress\b[^,;]*\b(1|one|line)\b|\bstreet\b|\baddress line 1\b/.test(label))
		return "street-address";
	if (/\baddress\b[^,;]*\b(2|two)\b|\bapt\b|\bapartment\b|\bsuite\b|\bunit\b/.test(label))
		return "address-line2";
	if (/\b(state|province|region)\b/.test(label)) return "address-level1";
	if (/\b(city|town)\b/.test(label)) return "address-level2";
	if (/\borganization\b|\borganisation\b|\bcompany\b|\bemployer\b/.test(label))
		return "organization";
	if (/\btitle\b|\bjob title\b|\bposition\b|\bdepartment\b/.test(label))
		return "organization-title";
	if (/\b(email|e-mail|mail)\b/.test(label)) return "email";
	if (/\b(phone|tel|mobile|cell)\b/.test(label)) return "tel";
	if (/\b(first|given)\b/.test(label)) return "given-name";
	if (/\b(last|family|surname)\b/.test(label)) return "family-name";
	if (/\bname\b/.test(label)) return "name";
	return undefined;
}

function slugifyLabel(label: string): string {
	return (label || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-+/g, "-");
}
function isEmptyPayloadValue(value: unknown): boolean {
	if (value === undefined || value === "" || value === false) return true;
	return typeof value === "string" && value.trim() === "";
}

function buildBookingFieldsResponses(
	steps: NormalizedStep[],
	values: BookingValues,
): Record<string, string> {
	const out: Record<string, string> = {};
	for (const step of steps) {
		if (step.stepType !== "form" && step.stepType !== "datetime") continue;
		for (const field of step.fields) {
			const value = values[field.id];
			if (isEmptyPayloadValue(value)) continue;
			let key = (field.calFieldId || "").trim();
			if (!key) {
				if (field.isPrimaryName || field.fieldType === "email" || field.fieldType === "calendar-widget") continue;
				key = slugifyLabel(field.label) || field.id;
				if (!key) continue;
			}
			out[key] =
				field.fieldType === "phone"
					? sanitizePhoneInput(String(value))
					: String(value);
		}
	}
	return out;
}

function buildNotesPayload(
	steps: NormalizedStep[],
	values: BookingValues,
	selectedTimeLabel: string = DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL,
	datePrefix: string = DEFAULT_COPY_NOTES_DATE_PREFIX,
	timePrefix: string = DEFAULT_COPY_NOTES_TIME_PREFIX,
	timeZone?: string,
): string {
	const lines: string[] = [];
	for (const step of steps) {
		if (step.stepType !== "form" && step.stepType !== "datetime") continue;
		if (!step.fields.length) continue;
		const stepLines: string[] = [];
		for (const field of step.fields) {
			if (field.isPrimaryName || field.fieldType === "email") continue;
			const value = values[field.id];
			if (isEmptyPayloadValue(value)) continue;
			const shown =
				field.fieldType === "phone"
					? sanitizePhoneInput(String(value))
					: String(value);
			stepLines.push(`${field.label}: ${shown}`);
		}
		if (!stepLines.length) continue;
		lines.push(step.title);
		lines.push(...stepLines);
		lines.push("");
	}
	if (values[SELECTED_SLOT_KEY]) {
		const slot = values[SELECTED_SLOT_KEY];
		const tzOpts = isValidTimeZone(timeZone) ? { timeZone } : undefined;
		const dateOpts: Intl.DateTimeFormatOptions = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			...tzOpts,
		};
		const dateStr = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
			? getCachedDateTimeFormat(pageLocale(), dateOpts).format(
				new Date(slot.time24h),
			)
			: getCachedDateTimeFormat(pageLocale(), dateOpts).format(slot.date);
		lines.push(selectedTimeLabel);
		lines.push(`${datePrefix}${dateStr}`);
		lines.push(`${timePrefix}${slot.timeLabel}`);
	}
	return lines.join("\n").trim();
}

function escapeIcsText(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\r?\n/g, "\\n");
}

function foldIcsLines(lines: string[]): string {
	const encoder = new TextEncoder();
	const foldOne = (line: string): string => {
		if (encoder.encode(line).length <= 75) return line;
		const chunks: string[] = [];
		let remaining = line;
		while (encoder.encode(remaining).length > 75) {
			let cut = 0;
			let octets = 0;
			while (cut < remaining.length && octets < 75) {
				const cp = remaining.codePointAt(cut);
				if (cp === undefined) break;
				const size = cp > 0xffff ? 4 : cp > 0x7ff ? 3 : cp > 0x7f ? 2 : 1;
				if (octets + size > 75) break;
				octets += size;
				cut += cp > 0xffff ? 2 : 1;
			}
			chunks.push(remaining.slice(0, cut));
			remaining = remaining.slice(cut);
		}
		chunks.push(remaining);
		return chunks.join("\r\n ");
	};
	return lines.map(foldOne).join("\r\n");
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
	uid?: string,
): string {
	const toIcsDate = (d: Date) =>
		d
			.toISOString()
			.replace(/[-:]/g, "")
			.replace(/\.\d{3}Z$/, "Z");
	let startDate: Date;
	let endDate: Date;
	const isIso = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h);
	if (isIso) {
		startDate = new Date(slot.time24h);
		const slotEnd = slot.end ? new Date(slot.end) : null;
		endDate =
			slotEnd && !Number.isNaN(slotEnd.getTime())
				? slotEnd
				: new Date(startDate.getTime() + meetingDurationMs);
		if (Number.isNaN(startDate.getTime())) {
			startDate = new Date();
		}
		if (Number.isNaN(endDate.getTime())) {
			endDate = new Date(startDate.getTime() + meetingDurationMs);
		}
	} else {
		const mins = parseTimeToMinutes(slot.time24h);
		startDate = new Date(slot.date);
		startDate.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
		endDate = new Date(startDate.getTime() + meetingDurationMs);
	}
	const start = toIcsDate(startDate);
	const end = toIcsDate(endDate);
	const resolvedUid =
		(uid && uid.trim()) ||
		(typeof crypto !== "undefined" && "randomUUID" in crypto
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random().toString(36).slice(2)}${uidDomain}`);
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
		...(description
			? [`DESCRIPTION:${escapeIcsText(description.slice(0, 500))}`]
			: []),
		...(location && location.trim()
			? [`LOCATION:${escapeIcsText(location.trim())}`]
			: []),
		"STATUS:CONFIRMED",
		"SEQUENCE:0",
		"END:VEVENT",
		"END:VCALENDAR",
	]);
	if (typeof window === "undefined") return "";
	try {
		const bytes = new TextEncoder().encode(ics);
		let binary = "";
		for (const byte of bytes) binary += String.fromCharCode(byte);
		return `data:text/calendar;charset=utf-8;base64,${btoa(binary)}`;
	} catch {
		return "";
	}
}

function formatStepCounter(
	template: string,
	current: number,
	total: number,
): string {
	return (template || DEFAULT_COPY_STEP_COUNTER_TEMPLATE)
		.replace(/\{current\}/g, String(current))
		.replace(/\{total\}/g, String(total));
}

function effectiveMaxLength(
	field: Pick<NormalizedField, "fieldType">,
): number {
	switch (field.fieldType) {
		case "email":
			return 254;
		case "phone":
			return 40;
		case "textarea":
			return 1000;
		default:
			return 250;
	}
}

function buildCalendarDeepLink(
	provider: "google" | "outlook",
	slot: BookingPayload,
	summary: string,
	description?: string,
	meetingDurationMs: number = DEFAULT_MEETING_DURATION_MS,
): string {
	const start = new Date(slot.time24h);
	if (Number.isNaN(start.getTime())) return "";
	const endMs =
		slot.end && !Number.isNaN(new Date(slot.end).getTime())
			? new Date(slot.end).getTime()
			: start.getTime() + meetingDurationMs;
	const end = new Date(endMs);
	const toCompact = (d: Date) =>
		d
			.toISOString()
			.replace(/[-:]/g, "")
			.replace(/\.\d{3}/, "");
	const toExtended = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
	const text = encodeURIComponent(summary);
	const details = encodeURIComponent(description || "");
	if (provider === "google") {
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${toCompact(start)}/${toCompact(end)}&details=${details}`;
	}
	return `https://outlook.live.com/calendar/0/action/compose?subject=${text}&startdt=${toExtended(start)}&enddt=${toExtended(end)}&body=${details}`;
}

// @framerDisableUnlink prevents unlinking the component (annotations on
// BookingEngine itself, above its export).
type TransitionVariantId =
	| "fadeRise"
	| "blurScale"
	| "slide"
	| "zoom"
	| "verticalSlide"
	| "blurSlide";

const TRANSITION_VARIANT_DEFS: Record<
	TransitionVariantId,
	{
		variants: Variants;
		transition: Transition;
		useDirection?: boolean;
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
};

class BeErrorBoundary extends React.Component<
	{ stepKey: string; children: React.ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };
	static getDerivedStateFromError(): { failed: boolean } {
		return { failed: true };
	}
	componentDidUpdate(prevProps: { stepKey: string }): void {
		if (prevProps.stepKey !== this.props.stepKey && this.state.failed) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({ failed: false });
		}
	}
	render(): React.ReactNode {
		if (this.state.failed) return null;
		return this.props.children;
	}
}

function StepVisibilityWrapper(props: {
	isActive: boolean;
	baseTransition: Transition;
	children: React.ReactNode;
	stepIndex: number;
	activeIndex: number;
	variant: TransitionVariantId;
	direction: number;
}) {
	const reducedMotion = useReducedMotion();
	const isStatic = useIsStaticRenderer();
	const def = TRANSITION_VARIANT_DEFS[props.variant];
	const stepNodeRef = React.useRef<HTMLDivElement | null>(null);
	useIsomorphicLayoutEffect(() => {
		stepNodeRef.current?.toggleAttribute("inert", !props.isActive);
	});
	const resolvedTransition = React.useMemo(() => {
		if (reducedMotion) return INSTANT_TRANSITION;
		const base = props.baseTransition as unknown as { duration?: number };
		const d = typeof base?.duration === "number" && Number.isFinite(base.duration) ? base.duration : undefined;
		if (d !== undefined) return { ...def.transition, duration: d } as Transition;
		return def.transition;
	}, [def.transition, props.baseTransition, reducedMotion]);
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
		);
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
				if (
					typeof window !== "undefined" &&
					window.__BE_STEP_DEBUG__
				) {
					const el = document.querySelector(
						`[data-step-index="${props.stepIndex}"]`,
					) as HTMLElement | null;
					const cs = el ? getComputedStyle(el) : null;
					console.debug(
						`[BE StepVisibility] variant=${props.variant} step=${props.stepIndex} active=${props.activeIndex} isActive=${props.isActive} position=${cs?.position ?? (props.isActive ? "relative" : "absolute")} opacity=${cs?.opacity ?? (props.isActive ? "1" : "0")} pointerEvents=${cs?.pointerEvents ?? (props.isActive ? "auto" : "none")}`,
					);
				}
			}}
		>
			{props.children}
		</motion.div>
	);
}

type InSessionFormSnapshot = {
	values: BookingValues;
	currentIndex: number;
	timeFormat: "12h" | "24h";
	live: boolean;
};
const inSessionFormSnapshots = new Map<string, InSessionFormSnapshot>();

const LEGACY_SESSION_KEY = "booking-engine:session";
const PERSIST_INSTANCE_PREFIX = "booking-engine:instance:";
const PERSIST_CONFIG_PREFIX = "booking-engine:cfg:";

const beMountedPersistenceKeys = new Map<string, number>();
const beCollisionWarnedKeys = new Set<string>();
let beLegacyMigrated = false;

function stableStringify(value: unknown, depth = 0): string {
	if (value === null || value === undefined) return "null";
	const t = typeof value;
	if (t === "number" || t === "boolean") return JSON.stringify(value);
	if (t === "string") return JSON.stringify((value as string).slice(0, 2000));
	if (t !== "object") return "null";
	if (depth > 8) return "null";
	if (Array.isArray(value)) {
		return `[${(value as unknown[]).slice(0, 200).map((v) => stableStringify(v, depth + 1)).join(",")}]`;
	}
	const entries = Object.entries(value as Record<string, unknown>)
		.filter(([, v]) => v !== undefined && typeof v !== "function" && typeof v !== "symbol")
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
		.slice(0, 200);
	return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v, depth + 1)}`).join(",")}}`;
}

function fnv1a(str: string, seed: number): string {
	let h = seed >>> 0;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0).toString(16).padStart(8, "0");
}

function fingerprintEngineConfig(
	stepCount: number,
	steps: StepConfig[],
	calEventTypeId: unknown,
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
				do: f.defaultOption ?? "",
				w: f.width,
			})),
		})),
	};
	const s = stableStringify(shape);
	return `${fnv1a(s, 2166136261)}${fnv1a(s, 424242)}`.slice(0, 12);
}

function slugifyInstanceId(raw: unknown): string {
	return String(raw ?? "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 64);
}

interface PersistenceIdentity {
	key: string;
	via: "instance-id" | "config-fingerprint";
}

function resolvePersistenceKey(
	instanceId: unknown,
	fingerprint: string,
): PersistenceIdentity {
	const slug = slugifyInstanceId(instanceId);
	if (slug) return { key: `${PERSIST_INSTANCE_PREFIX}${slug}`, via: "instance-id" };
	return { key: `${PERSIST_CONFIG_PREFIX}${fingerprint}`, via: "config-fingerprint" };
}

function useBookingEngineState(
	props: BookingEngineProps,
	engineRootRef?: React.RefObject<HTMLDivElement | null>,
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
		copy,
		calApiKey,
		calEventTypeId,
		onAnalytics,
		advanced,
		calendar,
		header,
		terminal,
		fieldStyles,
	} = props;

	const transition = transitionSettings?.transition ?? props.transition;
	const transitionVariant = transitionSettings?.variant ?? props.transitionVariant;

	const font = styles.font ?? typography?.font ?? props.font;
	const headingFont = styles.headingFont ?? typography?.headingFont ?? props.headingFont;

	const instanceIdProp = advanced?.instanceId ?? props.instanceId ?? "";

	const validation = copy?.validation ?? props.validation;

	const validationCopy: ValidationCopy = React.useMemo(() => {
		const validationMessages = validation;
		return {
			requiredFieldError:
				validationMessages?.requiredFieldError ??
				DEFAULT_VALIDATION_COPY.requiredFieldError,
			emailError:
				validationMessages?.emailError ?? DEFAULT_VALIDATION_COPY.emailError,
			phoneError:
				validationMessages?.phoneError ?? DEFAULT_VALIDATION_COPY.phoneError,
			minLengthError:
				validationMessages?.minLengthError ??
				DEFAULT_VALIDATION_COPY.minLengthError,
			maxLengthError:
				validationMessages?.maxLengthError ??
				DEFAULT_VALIDATION_COPY.maxLengthError,
			pickDateTimeError:
				validationMessages?.pickDateTimeError ??
				DEFAULT_VALIDATION_COPY.pickDateTimeError,
			pastTimeError:
				validationMessages?.pastTimeError ??
				DEFAULT_VALIDATION_COPY.pastTimeError,
			minLength: DEFAULT_VALIDATION_COPY.minLength,
		};
	}, [validation]);

	const {
		accentColor,
		accentForegroundColor,
		surfaceColor,
		textPrimaryColor,
		borderColor,
		borderRadius,
	} = styles;
	const textSecondaryColor = withAlpha(
		textPrimaryColor,
		DERIVED_SECONDARY_TEXT_ALPHA,
	);
	const successColor = DERIVED_SUCCESS_COLOR;
	const errorColor = FIXED_ERROR_COLOR;
	const sanitizedRadiusValue = React.useMemo(() => {
		const raw =
			typeof borderRadius === "number"
				? borderRadius
				: parseInt(String(borderRadius ?? "12"), 10);
		const n = Number.isFinite(raw) ? raw : 12;
		return Math.max(0, Math.min(24, Math.round(n)));
	}, [borderRadius]);
	const sanitizedRadius = `${sanitizedRadiusValue}px`;
	const densityRatio = DENSITY_RATIOS[styles?.density ?? "comfortable"] ?? 1;
	const fieldGap = React.useMemo(() => {
		const raw = Number(styles?.gap);
		const n = Number.isFinite(raw) ? raw : 16;
		const clamped = Math.max(0, Math.min(32, Math.round(n)));
		return Math.round(clamped * densityRatio);
	}, [styles?.gap, densityRatio]);
	const progressVisible = (progressBar?.barVisible ?? progressBar?.visible) !== false;
	const stepCountPosition: "top" | "bottom" =
		(progressBar?.progressText ?? progressBar?.stepCountPosition) === "bottom" ? "bottom" : "top";
	const progressShowTextContent = (progressBar?.showText ?? progressBar?.showTextContent) !== false;
	const progressBarStyle: "solid" | "dashed" =
		progressBar?.barStyle === "solid" ? "solid" : "dashed";

	const layoutSrc = buttonLabels.buttonsLayout ?? {};
	const groupNavButtons =
		layoutSrc.groupNavButtons ?? buttonLabels.groupNavButtons;
	const groupedNavAlignment =
		layoutSrc.groupedNavAlignment ?? buttonLabels.groupedNavAlignment;
	const buttonOrderValue =
		layoutSrc.buttonOrder ?? buttonLabels.buttonOrder;
	const buttonWidthValue =
		layoutSrc.buttonWidth ?? buttonLabels.buttonWidth;
	const bl = buttonLabels ?? {};
	const continueLabel = resolveButtonText(bl.continueButton?.text, bl.continueLabel, "Continue");
	const backLabel = resolveButtonText(bl.backButton?.text, bl.backLabel, "Back");
	const finalActionLabel = resolveButtonText(bl.finalActionButton?.text, bl.finalActionLabel, "Book Now");
	const doneLabel = resolveButtonText(bl.doneButton?.text, bl.doneLabel, DEFAULT_COPY_RETURN_HOME_LABEL);
	const bookAnotherLabel = resolveButtonText(
		bl.bookAnotherButton?.text,
		bl.bookAnotherLabel,
		DEFAULT_CONFIRM_BOOK_ANOTHER_LABEL,
	);
	const addToCalendarButtonLabel = resolveButtonText(
		bl.addToCalendarButton?.text,
		bl.addToCalendarLabel,
		DEFAULT_CONFIRM_ADD_TO_CALENDAR_LABEL,
	);
	const googleCalendarButtonLabel = resolveButtonText(
		bl.googleCalendarButton?.text,
		copy?.googleCalendarLabel,
		"Add to Google Calendar",
	);
	const outlookCalendarButtonLabel = resolveButtonText(
		bl.outlookCalendarButton?.text,
		copy?.outlookCalendarLabel,
		"Add to Outlook",
	);
	const retryLabel = resolveButtonText(
		bl.retryButton?.text,
		copy?.retryLabel,
		DEFAULT_COPY_RETRY_LABEL,
	);

	const persistState = true;
	const reactInstanceId = useHydrationSafeId("be-engine");
	const isStaticRender = useIsStaticRenderer();

	const errorCopy = React.useMemo(
		() => ({ ...ERROR_COPY_DEFAULTS, ...(copy?.errorCopy || {}) }),
		[copy?.errorCopy],
	);
	const calApiBaseUrl = (
		advanced?.calApiBaseUrl ?? props.calApiBaseUrl ?? DEFAULT_CAL_API_BASE_URL
	).replace(/\/+$/, "");

	const prefersReducedMotion = useReducedMotion();

	const stepTransition: Transition = prefersReducedMotion
		? ({ type: "tween", duration: 0 } as const)
		: transition ||
		({ type: "tween", ease: [0.44, 0, 0.56, 1], duration: 0.4 } as const);

	const allowedTransitionVariants: TransitionVariantId[] = [
		"fadeRise",
		"blurScale",
		"slide",
		"zoom",
		"verticalSlide",
		"blurSlide",
	];
	const rawVariant = (transitionVariant ?? "blurScale") as string;
	const resolvedTransitionVariant: TransitionVariantId = (
		allowedTransitionVariants as string[]
	).includes(rawVariant)
		? (rawVariant as TransitionVariantId)
		: "blurScale";

	React.useEffect(() => {
		if (typeof window === "undefined") return;
		const vv = (
			window as unknown as {
				visualViewport?: {
					addEventListener(type: string, listener: () => void): void;
					removeEventListener(type: string, listener: () => void): void;
				};
			}
		).visualViewport;
		if (!vv || typeof vv.addEventListener !== "function") return;
		let raf = 0;
		const onResize = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				if (typeof document === "undefined") return;
				const el = document.activeElement;
				if (
					!el ||
					(el.tagName !== "INPUT" &&
						el.tagName !== "TEXTAREA" &&
						el.tagName !== "SELECT") ||
					!el.closest("form")
				)
					return;
				try {
					el.scrollIntoView({ block: "nearest" });
				} catch {
					/* ignore */
				}
			});
		};
		vv.addEventListener("resize", onResize);
		return () => {
			cancelAnimationFrame(raf);
			vv.removeEventListener("resize", onResize);
		};
	}, []);

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
		],
	);

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
		];
		const clampedCount = clamp(Math.round(stepCount ?? 1), 1, 10);
		return slots.slice(0, clampedCount).map((slot, idx) => {
			const fallback = getRuntimeFallbackStep(idx);
			return slot || fallback;
		});
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
	]);

	const legacyCalendar = React.useMemo(
		() => migrateLegacyCalendar(effectiveStepsConfig),
		[effectiveStepsConfig],
	);
	const legacyHeaderAlignment: "left" | "center" | "right" | undefined =
		header && isStepAlignment(header.alignment) ? header.alignment : undefined;
	const normalizedSteps = React.useMemo(
		() =>
			normalizeSteps(
				legacyCalendar.steps.map((step) =>
					isStepAlignment(step.alignment)
						? step
						: { ...step, alignment: legacyHeaderAlignment },
				),
			),
		[legacyCalendar, legacyHeaderAlignment],
	);

	const baseActiveSteps = React.useMemo(
		() => normalizedSteps.filter((step) => step.enabled),
		[normalizedSteps],
	);
	const baseTotalActive = baseActiveSteps.length;

	const [currentIndex, setCurrentIndex] = useStateGuarded(
		0,
		baseTotalActive + MAX_SYSTEM_STAGES,
	);
	const baseSafeCurrentIndex = Math.min(currentIndex, Math.max(0, baseTotalActive - 1));

	const pinnedStepIdRef = React.useRef<string | null>(null);
	const lastActiveStepsKeyRef = React.useRef<string>(
		baseActiveSteps.map((step) => step.id).join("|"),
	);
	React.useEffect(() => {
		pinnedStepIdRef.current = baseActiveSteps[baseSafeCurrentIndex]?.id ?? null;
	}, [baseSafeCurrentIndex, baseActiveSteps]);
	const baseActiveStepsKey = baseActiveSteps.map((step) => step.id).join("|");
	if (baseActiveStepsKey !== lastActiveStepsKeyRef.current) {
		lastActiveStepsKeyRef.current = baseActiveStepsKey;
		const pinnedIndex = pinnedStepIdRef.current
			? baseActiveSteps.findIndex((step) => step.id === pinnedStepIdRef.current)
			: -1;
		const remapped =
			pinnedIndex !== -1
				? pinnedIndex
				: Math.min(baseSafeCurrentIndex, baseTotalActive - 1);
		if (remapped !== currentIndex) {
			setCurrentIndex(remapped);
		}
	}

	const [values, setValues] = React.useState<BookingValues>({});
	const [errors, setErrors] = React.useState<Record<string, string | null>>({});
	const [touched, setTouched] = React.useState<Record<string, boolean>>({});
	const [flowStatus, setFlowStatus] = React.useState<FlowStatus>("in-progress");
	const [submitError, setSubmitError] = React.useState<string | null>(null);
	const [bookingResult, setBookingResult] =
		React.useState<BookingConfirmation | null>(null);

	const [pickedDate, setPickedDate] = React.useState<Date | null>(null);
	const selectedDate = pickedDate ?? values[SELECTED_SLOT_KEY]?.date ?? null;
	const [visibleMonth, setVisibleMonth] = React.useState<Date | null>(null);
	const [timeZone, setTimeZone] = React.useState<string>("UTC");
	const beInteractiveForTz = useBeInteractive();
	const beInteractiveForRestore = useBeInteractive();
	React.useEffect(() => {
		if (!beInteractiveForTz) return;
		setTimeZone((prev) => (prev === "UTC" ? detectTimezone() : prev));
	}, [beInteractiveForTz]);
	const [timeFormat, setTimeFormat] = React.useState<"12h" | "24h">("12h");

	const persistenceFingerprint = React.useMemo(
		() =>
			fingerprintEngineConfig(
				stepCount,
				[step1, step2, step3, step4, step5, step6, step7, step8, step9, step10].slice(
					0,
					Math.max(0, Math.min(10, Math.floor(stepCount || 0))),
				),
				calEventTypeId,
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
		],
	);
	const persistenceIdentity = React.useMemo(
		() => resolvePersistenceKey(instanceIdProp, persistenceFingerprint),
		[instanceIdProp, persistenceFingerprint],
	);
	const persistenceKey = persistenceIdentity.key;
	const instanceKeyRef = React.useRef<string>(persistenceKey);
	useIsomorphicLayoutEffect(() => {
		instanceKeyRef.current = persistenceKey;
		const claimed = (beMountedPersistenceKeys.get(persistenceKey) ?? 0) + 1;
		beMountedPersistenceKeys.set(persistenceKey, claimed);
		if (claimed > 1 && !beCollisionWarnedKeys.has(persistenceKey)) {
			beCollisionWarnedKeys.add(persistenceKey);
			console.warn(
				`[BE persist] COLLISION key=${persistenceKey} is claimed by ${claimed} mounted engines — ` +
				`they share one saved session. Set a unique "Instance ID" on each Booking Engine sharing this page.`,
			);
		}
		const snap = inSessionFormSnapshots.get(instanceKeyRef.current);
		if (snap) {
			setValues({ ...snap.values });
			setCurrentIndex(Math.min(snap.currentIndex, baseTotalActive));
			setTimeFormat(snap.timeFormat);
			const snapSlot = snap.values[SELECTED_SLOT_KEY];
			if (snapSlot && typeof snapSlot === "object" && "date" in snapSlot) {
				const d = (snapSlot as { date?: unknown }).date;
				if (d instanceof Date && !Number.isNaN(d.getTime())) {
					setPickedDate(d);
					setVisibleMonth(new Date(d.getFullYear(), d.getMonth(), 1));
				}
			}
		}
		return () => {
			const left = (beMountedPersistenceKeys.get(persistenceKey) ?? 1) - 1;
			if (left <= 0) beMountedPersistenceKeys.delete(persistenceKey);
			else beMountedPersistenceKeys.set(persistenceKey, left);
		};
		// Render-computed identity only; the seed reads the map once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [persistenceKey, baseTotalActive]);

	React.useEffect(() => {
		inSessionFormSnapshots.set(instanceKeyRef.current, {
			values,
			currentIndex,
			timeFormat,
			live: beInteractiveForRestore,
		});
	}, [values, currentIndex, timeFormat, beInteractiveForRestore]);

	const PERSIST_SCHEMA_VERSION = 1;
	const loadFocusSuppressedRef = React.useRef(false);
	useIsomorphicLayoutEffect(() => {
		if (!persistState) return;
		if (typeof window === "undefined") return;
		if (isStaticRender) return;
		if (!beInteractiveForRestore) return;
		if (inSessionFormSnapshots.get(instanceKeyRef.current)?.live) return;
		try {
			let raw = window.sessionStorage.getItem(instanceKeyRef.current);
			let migratedLegacy = false;
			if (!raw && !beLegacyMigrated) {
				let roots = 0;
				try {
					roots = document.querySelectorAll("[data-be-engine-root]").length;
				} catch {
					roots = 0;
				}
				if (roots <= 1) {
					const legacyRaw = window.sessionStorage.getItem(LEGACY_SESSION_KEY);
					if (legacyRaw) {
						raw = legacyRaw;
						migratedLegacy = true;
						beLegacyMigrated = true;
					}
				}
			}
			if (!raw) return;
			const parsed = JSON.parse(raw) as {
				v?: unknown;
				values?: Record<string, unknown>;
				timeZone?: unknown;
				timeFormat?: unknown;
				currentIndex?: unknown;
			};
			if (parsed && typeof parsed === "object") {
				if (parsed.v !== PERSIST_SCHEMA_VERSION) {
					console.warn(
						"BookingEngine: purging saved progress with an unknown schema version.",
					);
					try {
						window.sessionStorage.removeItem(instanceKeyRef.current);
					} catch {
						// non-fatal
					}
					return;
				}
				const restoredValues = parsed.values || {};
				const rawSlot = restoredValues[SELECTED_SLOT_KEY];
				if (rawSlot !== undefined && !isBookingPayload(rawSlot)) {
					restoredValues[SELECTED_SLOT_KEY] = undefined;
				}
				const restoredSlot = isBookingPayload(rawSlot) ? rawSlot : undefined;
				if (restoredSlot && !(restoredSlot.date instanceof Date)) {
					try {
						const rehydratedDate = new Date(
							typeof restoredSlot.date === "string" ? restoredSlot.date : "",
						);
						restoredSlot.date = rehydratedDate;
						if (Number.isNaN(rehydratedDate.getTime())) {
							restoredValues[SELECTED_SLOT_KEY] = undefined;
						}
					} catch {
						restoredValues[SELECTED_SLOT_KEY] = undefined;
					}
				}
				const restoredEntries = Object.entries(restoredValues).filter(
					([key, value]) => key === SELECTED_SLOT_KEY || isFieldValue(value),
				);
				const filteredValues = Object.fromEntries(
					restoredEntries,
				) as BookingValues;
				setValues((prev) => ({
					...prev,
					...filteredValues,
				}));
				if (restoredSlot) {
					const slot = restoredSlot;
					if (slot.date) {
						const restoredDate =
							slot.date instanceof Date
								? slot.date
								: new Date(String(slot.date));
						setPickedDate(restoredDate);
						setVisibleMonth(
							new Date(restoredDate.getFullYear(), restoredDate.getMonth(), 1),
						);
					}
				}
				if (parsed.timeFormat === "12h" || parsed.timeFormat === "24h") {
					setTimeFormat(parsed.timeFormat);
				}
				if (
					typeof parsed.currentIndex === "number" &&
					Number.isFinite(parsed.currentIndex) &&
					parsed.currentIndex >= 0
				) {
					let restoredIndex = Math.min(parsed.currentIndex, baseActiveSteps.length);
					for (let i = 0; i < restoredIndex; i++) {
						const prior = baseActiveSteps[i];
						if (
							prior &&
							!validateStep(prior, filteredValues, validationCopy)
								.valid
						) {
							restoredIndex = i;
							break;
						}
					}
					if (restoredIndex > 0) {
						loadFocusSuppressedRef.current = true;
					}
					setCurrentIndex(restoredIndex);
					if (migratedLegacy) {
						try {
							window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
						} catch {
						}
					}
				}
			}
		} catch (err: unknown) {
			console.warn("BookingEngine: failed to restore saved progress.", err);
			try {
				window.sessionStorage.removeItem(instanceKeyRef.current);
			} catch {
				console.warn("BookingEngine: failed to purge corrupt saved progress.");
			}
		}
	}, [persistState, isStaticRender, persistenceKey, beInteractiveForRestore]);

	const persistTimerRef = React.useRef<number | null>(null);
	const focusTimerRef = React.useRef<number | null>(null);
	const scheduleFocusTimer = React.useCallback((fn: () => void) => {
		if (focusTimerRef.current !== null) {
			window.clearTimeout(focusTimerRef.current);
		}
		focusTimerRef.current = window.setTimeout(fn, 0);
	}, []);
	React.useEffect(() => {
		if (!persistState) return;
		if (typeof window === "undefined") return;
		if (isStaticRender) return;
		if (!beInteractiveForRestore) return;
		if (flowStatus === "success") {
			if (persistTimerRef.current !== null) {
				window.clearTimeout(persistTimerRef.current);
				persistTimerRef.current = null;
			}
			try {
				window.sessionStorage.removeItem(instanceKeyRef.current);
			} catch (err: unknown) {
				console.warn("BookingEngine: failed to clear saved progress.", err);
			}
			return;
		}
		if (persistTimerRef.current !== null) {
			window.clearTimeout(persistTimerRef.current);
		}
		persistTimerRef.current = window.setTimeout(() => {
			persistTimerRef.current = null;
			const hasAnything =
				currentIndex > 0 ||
				Object.values(values).some(
					(v) => v !== undefined && v !== null && v !== "",
				);
			if (!hasAnything) return;
			try {
				window.sessionStorage.setItem(
					instanceKeyRef.current,
					JSON.stringify({
						v: PERSIST_SCHEMA_VERSION,
						values,
						timeFormat,
						currentIndex,
						fp: persistenceFingerprint,
					}),
				);
			} catch (err: unknown) {
				console.warn(
					"BookingEngine: failed to save progress (storage full?).",
					err,
				);
			}
		}, 300);
		return () => {
			if (persistTimerRef.current !== null) {
				window.clearTimeout(persistTimerRef.current);
				persistTimerRef.current = null;
			}
		};
	}, [
		persistState,
		values,
		flowStatus,
		timeFormat,
		currentIndex,
		isStaticRender,
		beInteractiveForRestore,
		persistenceFingerprint,
	]);

	React.useEffect(() => {
		return () => {
			if (focusTimerRef.current !== null) {
				window.clearTimeout(focusTimerRef.current);
				focusTimerRef.current = null;
			}
		};
	}, []);

	useIsomorphicLayoutEffect(() => {
		if (currentIndex >= baseTotalActive + MAX_SYSTEM_STAGES && baseTotalActive + MAX_SYSTEM_STAGES > 0) {
			setCurrentIndex(Math.max(0, baseTotalActive + MAX_SYSTEM_STAGES - 1));
		} else if (baseTotalActive === 0) {
			setCurrentIndex(0);
		}
	}, [currentIndex, baseTotalActive]);

	const hasDatetimeStep = true;
	const hasCalConfig = Boolean(calApiKey && calEventTypeId);
	const [reachedDatetimeStep, setReachedDatetimeStep] =
		React.useState(false);
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
		SLOTS_CACHE_TTL_MS,
	);

	const beInteractiveForMeta = useBeInteractive();
	const { status: calEventMetaStatus, meta: calEventMeta, bookingFields: calBookingFields } = useCalcomEventMeta({
		enabled: hasCalConfig && hasDatetimeStep && beInteractiveForMeta,
		apiKey: calApiKey,
		eventTypeId: calEventTypeId,
		apiBaseUrl: calApiBaseUrl,
	});

	const meetingDurationMs = React.useMemo(() => {
		const minutes = calEventMeta?.durationMinutes;
		if (typeof minutes === "number" && Number.isFinite(minutes) && minutes > 0) {
			return Math.round(minutes) * 60 * 1000;
		}
		return DEFAULT_MEETING_DURATION_MS;
	}, [calEventMeta]);

	const [availabilityNowMs, setAvailabilityNowMs] = React.useState<
		number | null
	>(null);
	const beInteractiveForNow = useBeInteractive();
	useIsomorphicLayoutEffect(() => {
		if (typeof window === "undefined") return;
		if (isStaticRender) return;
		if (!beInteractiveForNow) return;
		setAvailabilityNowMs(Date.now());
		const id = window.setInterval(
			() => setAvailabilityNowMs(Date.now()),
			30000,
		);
		return () => window.clearInterval(id);
	}, [isStaticRender, beInteractiveForNow]);
	const availableDates = React.useMemo(() => {
		if (!hasCalConfig) return undefined;
		return buildFutureAwareAvailableDates(slots, timeZone, availabilityNowMs);
	}, [hasCalConfig, slots, timeZone, availabilityNowMs]);

	const slotsWindowKey = React.useMemo(() => {
		if (!hasCalConfig || !visibleMonth) return null;
		return monthCacheKey(
			visibleMonth,
			timeZone,
			calApiKey,
			calEventTypeId,
			calApiBaseUrl,
		);
	}, [
		hasCalConfig,
		visibleMonth,
		timeZone,
		calApiKey,
		calEventTypeId,
		calApiBaseUrl,
	]);
	const availabilitySettled = React.useMemo(() => {
		if (!hasCalConfig) return true;
		if (!hasDatetimeStep || !reachedDatetimeStep) return true;
		if (!slotsWindowKey) return false;
		return slotsSettledKey === slotsWindowKey;
	}, [
		hasCalConfig,
		hasDatetimeStep,
		reachedDatetimeStep,
		slotsWindowKey,
		slotsSettledKey,
	]);

	const slotsForSelectedDate = React.useMemo(() => {
		if (!selectedDate) return slots;
		const selectedKey = getDateKeyInTimeZone(selectedDate, timeZone);
		return slots.filter((slot) => {
			return slotDateKeyInTimeZone(slot.value, timeZone) === selectedKey;
		});
	}, [slots, selectedDate, timeZone]);

	const isCanvas = React.useMemo(
		() => RenderTarget.current() === RenderTarget.canvas,
		[],
	);

	const missingRequiredCalFields = React.useMemo(() => {
		if (!calBookingFields || calBookingFields.length === 0) return [];
		if (!hasCalConfig) return [];
		if (!hasDatetimeStep) return [];
		const covered = new Set<string>();
		for (const step of baseActiveSteps) {
			for (const field of step.fields) {
				const calId = (field.calFieldId || "").trim().toLowerCase();
				if (calId) covered.add(calId);
				const auto = slugifyLabel(field.label || "").toLowerCase();
				if (auto) covered.add(auto);
				if (field.isPrimaryName) {
					covered.add("name");
					covered.add("fullname");
				}
				if (field.fieldType === "email") covered.add("email");
			}
		}
		return calBookingFields.filter((f) => f.required && !f.hidden && !covered.has(f.slug.toLowerCase()));
	}, [calBookingFields, baseActiveSteps, hasCalConfig, hasDatetimeStep]);

	const effectiveActiveSteps = React.useMemo(() => {
		if (missingRequiredCalFields.length === 0) return baseActiveSteps;
		if (isCanvas) return baseActiveSteps;
		const autoFields: NormalizedField[] = missingRequiredCalFields.map((f) => {
			const calKind = (f.type || "").toLowerCase();
			const hasOptions = !!f.options && f.options.length > 0;
			let fieldType = calTypeToFieldType(f.type);
			if (fieldType === "select" && !hasOptions) {
				fieldType = "text";
			}
			return {
				id: `auto-cal-${f.slug}`,
				label: f.label || f.slug,
				placeholder: f.placeholder || "",
				required: true,
				fieldType,
				width: "full" as const,
				options: f.options ? [...f.options] : [],
				calFieldId: f.slug,
				isPrimaryName: false,
				...(fieldType === "text" && calKind !== "text"
					? { minLength: 1 }
					: {}),
			};
		}) as NormalizedField[];
		const autoStep: NormalizedStep = {
			id: "auto-cal-required",
			enabled: true,
			stepType: "form",
			title: "Additional Details",
			subtitle: "Please provide the following details to complete your booking.",
			layout: "single-column",
			fields: autoFields,
		};
		return [...baseActiveSteps, autoStep];
	}, [baseActiveSteps, missingRequiredCalFields, isCanvas]);

	const calendarStageConfig: CalendarStageConfig = React.useMemo(() => {
		if (calendar) {
			return {
				title: calendar.title || DEFAULT_CALENDAR_TITLE,
				subtitle:
					calendar.subtitle !== undefined
						? calendar.subtitle
						: DEFAULT_CALENDAR_SUBTITLE,
				surface: calendar.surface,
			};
		}
		return legacyCalendar.calendar;
	}, [calendar, legacyCalendar]);
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
		[calendarStageConfig],
	);

	const activeSteps = React.useMemo(
		() => [...effectiveActiveSteps, calendarStage],
		[effectiveActiveSteps, calendarStage],
	);
	const totalActive = activeSteps.length;
	const safeCurrentIndex = Math.min(currentIndex, Math.max(0, totalActive - 1));
	const currentStep: NormalizedStep | undefined =
		safeCurrentIndex >= 0 && safeCurrentIndex < activeSteps.length ? activeSteps[safeCurrentIndex] : undefined;
	const isFirst = safeCurrentIndex === 0;
	const isLast = safeCurrentIndex === totalActive - 1;

	React.useEffect(() => {
		if (reachedDatetimeStep) return;
		const step = activeSteps[safeCurrentIndex];
		if (step && step.stepType === "datetime") {
			setReachedDatetimeStep(true);
		}
	}, [activeSteps, safeCurrentIndex, reachedDatetimeStep]);

	useIsomorphicLayoutEffect(() => {
		if (currentIndex >= totalActive && totalActive > 0) {
			setCurrentIndex(Math.max(0, totalActive - 1));
		}
	}, [currentIndex, totalActive]);

	const lastEffectiveStepsKeyRef = React.useRef<string>(activeSteps.map((s) => s.id).join("|"));
	const effectivePinnedIdRef = React.useRef<string | null>(null);
	React.useEffect(() => {
		effectivePinnedIdRef.current = activeSteps[safeCurrentIndex]?.id ?? null;
	}, [safeCurrentIndex, activeSteps]);
	const effectiveStepsKey = activeSteps.map((s) => s.id).join("|");
	if (effectiveStepsKey !== lastEffectiveStepsKeyRef.current) {
		lastEffectiveStepsKeyRef.current = effectiveStepsKey;
		const pinnedIdx = effectivePinnedIdRef.current ? activeSteps.findIndex((s) => s.id === effectivePinnedIdRef.current) : -1;
		const remappedEff = pinnedIdx !== -1 ? pinnedIdx : Math.min(safeCurrentIndex, totalActive - 1);
		if (remappedEff !== currentIndex) {
			setCurrentIndex(remappedEff);
		}
	}

	const needsNameEmailGuardrail = React.useMemo(() => {
		if (!isCanvas) return false;
		return !findNameField(baseActiveSteps) || !findEmailField(baseActiveSteps);
	}, [baseActiveSteps, isCanvas]);

	const emptyStepWarnings = React.useMemo(() => {
		if (!isCanvas) return [];
		const warnings: string[] = [];
		for (const step of normalizedSteps) {
			if (step.stepType === "form" && step.fields.length === 0) {
				warnings.push(
					`Step "${step.title}" has no fields and is skipped on the published site. Add at least one field in the Fields property.`,
				);
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
					].includes(field.fieldType);
					if (isChoiceType && (!field.options || field.options.length === 0)) {
						warnings.push(
							`Field "${field.label}" in step "${step.title}" has no options. Add at least one option.`,
						);
					}
				}
			}
		}
		if (missingRequiredCalFields.length > 0) {
			const labels = missingRequiredCalFields.map((f) => `"${f.label} (${f.slug})"`).join(", ");
			warnings.push(
				`Cal.com event requires ${missingRequiredCalFields.length === 1 ? "a field" : "fields"} your Engine has no matching field for: ${labels}. Add ${missingRequiredCalFields.length === 1 ? "a field" : "fields"} with ${missingRequiredCalFields.length === 1 ? "that label" : "those labels"} (or matching Cal Field IDs) or make ${missingRequiredCalFields.length === 1 ? "it" : "them"} optional in Cal.com. Visitors will see ${missingRequiredCalFields.length === 1 ? "it" : "them"} as an auto-generated Additional Details step before the calendar.`,
			);
		}
		(effectiveStepsConfig || []).forEach((step, stepIdx) => {
			const n = stepIdx + 1;
			const hasTitle = Boolean(step.title && String(step.title).trim());
			const hasSubtitle = Boolean(step.subtitle && String(step.subtitle).trim());
			if (!hasTitle) {
				warnings.push(
					hasSubtitle
						? `Step ${n} has no title, so visitors see the generic heading "Step ${n}". Add a title in the step's properties.`
						: `Step ${n} has no title or subtitle, so visitors see a bare generic heading. Add them in the step's properties.`,
				);
			}
		});
		return warnings;
	}, [
		normalizedSteps,
		baseActiveSteps,
		activeSteps,
		isCanvas,
		effectiveStepsConfig,
		calApiKey,
		calEventTypeId,
		missingRequiredCalFields,
	]);

	const emitAnalytics = React.useCallback(
		(eventName: string, payload?: Record<string, unknown>) => {
			if (typeof onAnalytics !== "function") return;
			try {
				onAnalytics(eventName, payload);
			} catch (err: unknown) {
				console.warn(
					`BookingEngine: analytics callback threw for "${eventName}".`,
					err,
				);
			}
		},
		[onAnalytics],
	);

	const submittingRef = React.useRef(false);
	const navigatingRef = React.useRef(false);
	const idempotencyKeyRef = React.useRef<string | null>(null);
	const submitErrorCodeRef = React.useRef<string | null>(null);

	const valuesRef = React.useRef(values);
	React.useEffect(() => {
		valuesRef.current = values;
	}, [values]);

	React.useEffect(() => {
		navigatingRef.current = false;
	}, [safeCurrentIndex]);

	const abortControllerRef = React.useRef<AbortController | null>(null);
	const cancelRequestedRef = React.useRef(false);
	const submitSeqRef = React.useRef(0);
	React.useEffect(() => {
		return () => {
			submittingRef.current = false;
			abortControllerRef.current?.abort();
			abortControllerRef.current = null;
		};
	}, []);

	const stepTitleRef = React.useRef<HTMLHeadingElement | null>(null);
	const focusStepTitle = React.useCallback(() => {
		const el = stepTitleRef.current;
		if (!el) return;
		try {
			el.focus({ preventScroll: true });
			el.scrollIntoView({ block: "nearest" });
		} catch {
		}
	}, []);
	const submitButtonRef = React.useRef<HTMLButtonElement | null>(null);
	const hasMountedStepRef = React.useRef(false);
	React.useEffect(() => {
		if (!hasMountedStepRef.current) {
			hasMountedStepRef.current = true;
			return;
		}
		if (loadFocusSuppressedRef.current) return;
		focusStepTitle();
	}, [safeCurrentIndex, focusStepTitle]);

	const handleFieldChange = React.useCallback(
		(fieldId: string, value: string | boolean | undefined) => {
			let field: NormalizedField | undefined;
			for (const step of activeSteps) {
				if (step.stepType === "form" || step.stepType === "datetime") {
					field = step.fields.find((candidate) => candidate.id === fieldId);
					if (field) break;
				}
			}
			const nextValue = value;
			valuesRef.current = { ...valuesRef.current, [fieldId]: nextValue };
			const liveKey = instanceKeyRef.current;
			const liveSnap = inSessionFormSnapshots.get(liveKey);
			inSessionFormSnapshots.set(liveKey, {
				values: valuesRef.current,
				currentIndex: liveSnap?.currentIndex ?? 0,
				timeFormat: liveSnap?.timeFormat ?? "12h",
				live: true,
			});
			setValues((prev) => ({ ...prev, [fieldId]: nextValue }));
			if (!field) return;
			setErrors((prev) => {
				if (!prev[fieldId]) return prev;
				const err = validateField(field, nextValue, validationCopy);
				if (err === prev[fieldId]) return prev;
				return { ...prev, [fieldId]: err };
			});
		},
		[activeSteps, validationCopy],
	);

	const handleTimeFormatChange = React.useCallback((format: "12h" | "24h") => {
		setTimeFormat(format);
	}, []);

	const transitionFlowStatus = React.useCallback((next: FlowStatus) => {
		setFlowStatus((prev) => {
			if (next === prev) return prev;
			if (!FLOW_STATUS_TRANSITIONS[prev]?.includes(next)) {
				console.warn(
					`BookingEngine: blocked flowStatus transition ${prev} -> ${next}`,
				);
				return prev;
			}
			return next;
		});
	}, []);

	const focusFirstInvalidField = React.useCallback(
		(step: NormalizedStep) => {
			if (typeof document === "undefined") return;
			if ((step.stepType as string) === "review") return;
			for (const field of step.fields) {
				const err = validateField(
					field,
					valuesRef.current[field.id],
					validationCopy,
				);
				if (err) {
					const wrapper = engineRootRef?.current?.querySelector<HTMLElement>(
						`[data-field-id="${field.id}"]`,
					);
					const focusable = wrapper?.querySelector<HTMLElement>(
						'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
					);
					const target = focusable ?? wrapper;
					if (target) {
						try {
							target.focus({ preventScroll: true });
							target.scrollIntoView({ behavior: "smooth", block: "nearest" });
						} catch {
						}
						break;
					}
				}
			}
		},
		[validationCopy],
	);

	const handleSubmitBooking = React.useCallback(async () => {
		if (isStaticRender) return;
		if (submittingRef.current) return;
		submittingRef.current = true;

		const nameField = findNameField(activeSteps);
		const emailField = findEmailField(activeSteps);
		const slot = valuesRef.current[SELECTED_SLOT_KEY];

		if (!slot) {
			setSubmitError(errorCopy.missingSlotError);
			transitionFlowStatus("error");
			submittingRef.current = false;
			emitAnalytics("booking_error", {
				reason: "missing-slot",
				message: errorCopy.missingSlotError,
			});
			return;
		}
		if (!nameField || !emailField) {
			setSubmitError(errorCopy.misconfiguredFormError);
			transitionFlowStatus("error");
			submittingRef.current = false;
			emitAnalytics("booking_error", {
				reason: "missing-name-email-field",
				message: errorCopy.misconfiguredFormError,
			});
			return;
		}

		if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h)) {
			setSubmitError(errorCopy.invalidSlotTimeError);
			transitionFlowStatus("error");
			submittingRef.current = false;
			emitAnalytics("booking_error", {
				reason: "invalid-slot-time",
				message: errorCopy.invalidSlotTimeError,
			});
			return;
		}

		const name = String(valuesRef.current[nameField.id] || "");
		const email = String(valuesRef.current[emailField.id] || "");
		const bookingFieldsResponses = buildBookingFieldsResponses(
			activeSteps,
			valuesRef.current,
		);

		transitionFlowStatus("submitting");
		setSubmitError(null);
		scheduleFocusTimer(() => {
			submitButtonRef.current?.focus();
		});
		emitAnalytics("booking_submitted", {
			slotStart: slot.time24h,
			calEventTypeId,
		});

		if (!idempotencyKeyRef.current) {
			idempotencyKeyRef.current = makeIdempotencyKey();
		}

		abortControllerRef.current = new AbortController();
		const submitSeq = ++submitSeqRef.current;

		const result = await submitCalcomBooking({
			apiKey: calApiKey,
			eventTypeId: calEventTypeId,
			slotStart: slot.time24h,
			slotEnd: slot.end,
			allowLengthInMinutes:
				(calEventMeta?.multipleLengths?.length ?? 0) > 1,
			name,
			email,
			timeZone,
			bookingFieldsResponses,
			idempotencyKey: idempotencyKeyRef.current,
			externalSignal: abortControllerRef.current.signal,
			errorCopy,
			timeoutMs: FETCH_TIMEOUT_MS,
			apiBaseUrl: calApiBaseUrl,
		});
		abortControllerRef.current = null;

		if (cancelRequestedRef.current) {
			cancelRequestedRef.current = false;
			submittingRef.current = false;
			if (submitSeqRef.current === submitSeq) {
				transitionFlowStatus("in-progress");
			}
			return;
		}

		if (result.success) {
			idempotencyKeyRef.current = null;
			setBookingResult({
				uid: result.bookingUid || null,
				manageUrl: result.bookingUid
					? `https://cal.com/booking/${result.bookingUid}`
					: null,
				rescheduleUrl: result.rescheduleUrl || null,
				cancelUrl: result.cancelUrl || null,
			});
			transitionFlowStatus("success");
			emitAnalytics("booking_success", {
				bookingUid: result.bookingUid || null,
			});
			slotsRefetch();
		} else {
			const errorMessage = result.alreadyMapped
				? (result.error || copy.errorFallbackMessage)
				: mapCalcomError(
					result.error || copy.unknownErrorLabel,
					result.errorCode,
					errorCopy,
					copy.errorFallbackMessage,
					result.httpStatus,
				);
			setSubmitError(errorMessage);
			submitErrorCodeRef.current =
				result.errorCode ||
				(typeof result.httpStatus === "number"
					? `HTTP_${result.httpStatus}`
					: null);
			transitionFlowStatus("error");
			emitAnalytics("booking_error", {
				reason: "submit-failed",
				errorCode: result.errorCode || null,
				message: errorMessage,
			});
		}
		submittingRef.current = false;
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
	]);

	const handleContinue = React.useCallback(() => {
		if (!currentStep) return;
		if (flowStatus === "submitting") return;

		const { valid, errors: stepErrors } = validateStep(
			currentStep,
			valuesRef.current,
			validationCopy,
		);
		setErrors((prev) => ({ ...prev, ...stepErrors }));
		setTouched((prev) => touchAllFieldsIn(currentStep, prev));

		if (!valid) {
			scheduleFocusTimer(() => focusFirstInvalidField(currentStep));
			return;
		}

		if (isLast) {
			const hasDatetime = activeSteps.some(
				(step) => step.stepType === "datetime",
			);
			if (hasDatetime && hasCalConfig) {
				handleSubmitBooking();
			} else if (hasDatetime && !hasCalConfig) {
				const noConfigMessage = errorCopy.unavailableMessage;
				setSubmitError(noConfigMessage);
				transitionFlowStatus("error");
				emitAnalytics("booking_error", {
					reason: "missing-cal-config",
					message: noConfigMessage,
				});
			} else {
				transitionFlowStatus("success");
				emitAnalytics("booking_success", { bookingUid: null });
			}
			return;
		}

		if (navigatingRef.current) return;
		navigatingRef.current = true;
		emitAnalytics("step_complete", {
			stepIndex: safeCurrentIndex,
			stepNumber: safeCurrentIndex + 1,
			totalSteps: totalActive,
			stepTitle: currentStep.title,
			stepType: currentStep.stepType,
		});
		const destStep = activeSteps[Math.min(safeCurrentIndex + 1, totalActive - 1)];
		if (destStep) setErrors((prev) => clearedStepErrors(prev, destStep));
		loadFocusSuppressedRef.current = false;
		setCurrentIndex((i) => Math.min(i + 1, totalActive - 1));
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
	]);

	const handleBack = React.useCallback(() => {
		if (isFirst) return;
		if (navigatingRef.current) return;
		navigatingRef.current = true;
		const destStep = activeSteps[Math.max(0, safeCurrentIndex - 1)];
		if (destStep) setErrors((prev) => clearedStepErrors(prev, destStep));
		loadFocusSuppressedRef.current = false;
		setCurrentIndex((i) => Math.max(0, i - 1));
	}, [isFirst, activeSteps, safeCurrentIndex]);

	const handleJumpToStep = React.useCallback(
		(stepIndex: number) => {
			if (stepIndex < 0 || stepIndex >= activeSteps.length) return;
			if (stepIndex >= safeCurrentIndex) return;
			if (navigatingRef.current) return;
			navigatingRef.current = true;
			if (flowStatus === "submitting") {
				setSubmitError(null);
				idempotencyKeyRef.current = null;
				cancelRequestedRef.current = true;
				abortControllerRef.current?.abort();
				abortControllerRef.current = null;
				submittingRef.current = false;
			}
			transitionFlowStatus("in-progress");
			const destStep = activeSteps[stepIndex];
			if (destStep) setErrors((prev) => clearedStepErrors(prev, destStep));
			loadFocusSuppressedRef.current = false;
			setCurrentIndex(stepIndex);
		},
		[activeSteps, flowStatus, transitionFlowStatus, safeCurrentIndex],
	);

	const handleRetry = React.useCallback(() => {
		const code = (submitErrorCodeRef.current || "").toUpperCase();
		const msg = submitError || "";
		const slotTaken =
			code.includes("SLOT_NOT_AVAILABLE") ||
			code.includes("BOOKING_LIMIT") ||
			code.includes("MAXIMUM_NUMBER_OF_BOOKINGS") ||
			code.includes("HTTP_409") ||
			msg.includes("just taken") ||
			msg.includes("no longer available");
		submitErrorCodeRef.current = null;
		if (slotTaken) {
			const dtIdx = activeSteps.findIndex(
				(step) => step.stepType === "datetime",
			);
			if (dtIdx >= 0) {
				valuesRef.current = {
					...valuesRef.current,
					[SELECTED_SLOT_KEY]: undefined,
				};
				setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: undefined }));
				setPickedDate(null);
				idempotencyKeyRef.current = null;
				loadFocusSuppressedRef.current = false;
				setCurrentIndex(dtIdx);
				slotsRefetch();
			}
		}
		transitionFlowStatus("in-progress");
		setSubmitError(null);
		setBookingResult(null);
		submittingRef.current = false;
		scheduleFocusTimer(() => {
			focusStepTitle();
		});
	}, [submitError, activeSteps, slotsRefetch, scheduleFocusTimer, transitionFlowStatus, focusStepTitle]);

	const handleCancelSubmit = React.useCallback(() => {
		if (flowStatus !== "submitting") return;
		cancelRequestedRef.current = true;
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
		submittingRef.current = false;
		idempotencyKeyRef.current = null;
		setSubmitError(null);
		transitionFlowStatus("in-progress");
		loadFocusSuppressedRef.current = false;
		scheduleFocusTimer(() => {
			focusStepTitle();
		});
	}, [flowStatus, scheduleFocusTimer, transitionFlowStatus, focusStepTitle]);

	React.useEffect(() => {
		if (flowStatus !== "submitting") return;
		if (typeof window === "undefined") return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			const target = event.target as Element | null;
			if (
				target &&
				typeof target.closest === "function" &&
				engineRootRef?.current
			) {
				const owner = target.closest("[data-be-engine-root]");
				if (owner && owner !== engineRootRef.current) return;
			}
			handleCancelSubmit();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [flowStatus, handleCancelSubmit]);

	const handleRestart = React.useCallback(() => {
		if (isStaticRender) return;
		valuesRef.current = {};
		setValues({});
		setErrors({});
		setTouched({});
		setPickedDate(null);
		setVisibleMonth(null);
		setSubmitError(null);
		setBookingResult(null);
		loadFocusSuppressedRef.current = false;
		setCurrentIndex(0);
		transitionFlowStatus("in-progress");
		submittingRef.current = false;
		idempotencyKeyRef.current = null;
		if (typeof window !== "undefined" && persistState) {
			try {
				window.sessionStorage.removeItem(instanceKeyRef.current);
			} catch (err: unknown) {
				console.warn(
					"BookingEngine: failed to clear saved progress on restart.",
					err,
				);
			}
		}
	}, [persistState, transitionFlowStatus, isStaticRender]);

	const handleSlotReady = React.useCallback((payload?: BookingPayload) => {
		if (!payload) {
			valuesRef.current = {
				...valuesRef.current,
				[SELECTED_SLOT_KEY]: undefined,
			};
			setValues((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: undefined }));
			idempotencyKeyRef.current = null;
			return;
		}
		valuesRef.current = {
			...valuesRef.current,
			[SELECTED_SLOT_KEY]: payload,
		} as BookingValues;
		setValues(
			(prev) => ({ ...prev, [SELECTED_SLOT_KEY]: payload }) as BookingValues,
		);
		idempotencyKeyRef.current = null;
		setTouched((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: true }));
		setErrors((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: null }));
		scheduleFocusTimer(() => {
			submitButtonRef.current?.focus();
		});
	}, [scheduleFocusTimer]);

	const handleInlineDateChange = React.useCallback(
		(d: Date) => setPickedDate(d),
		[],
	);
	const handleInlineMonthChange = React.useCallback(
		(m: Date) => setVisibleMonth(m),
		[],
	);

	const fontStack: React.CSSProperties = React.useMemo(
		() => ({
			fontFamily: font?.fontFamily ?? DEFAULT_FONT_FAMILY,
			fontSize: font?.fontSize ?? 15,
			lineHeight: font?.lineHeight ?? 1.4,
			letterSpacing: font?.letterSpacing ?? 0,
			fontWeight: font?.fontWeight ?? 400,
			fontStyle: font?.fontStyle ?? "normal",
		}),
		[font],
	);
	const bodySubtitleSize = fontPixelSize(font?.fontSize) ?? 14;
	const bodySubtitleLineHeight = font?.lineHeight ?? 1.5;

	const needsCalSetup = hasDatetimeStep && !hasCalConfig;

	const progressPct =
		totalActive > 0 ? ((safeCurrentIndex + 1) / totalActive) * 100 : 0;
	const completePct = Math.round(progressPct);
	const counterText = formatStepCounter(
		copy.stepCounterTemplate,
		safeCurrentIndex + 1,
		totalActive,
	);
	const stepAnnouncementText = currentStep
		? (copy.stepAnnouncementTemplate ?? DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE)
			.replace("{counter}", counterText)
			.replace("{percent}", String(completePct))
			.replace("{title}", currentStep.title)
		: "";
	const announcedStepRef = React.useRef(safeCurrentIndex);
	const [stepAnnouncement, setStepAnnouncement] = React.useState("");
	useIsomorphicLayoutEffect(() => {
		if (announcedStepRef.current === safeCurrentIndex) return;
		announcedStepRef.current = safeCurrentIndex;
		setStepAnnouncement(stepAnnouncementText);
	}, [safeCurrentIndex, stepAnnouncementText]);

	const primaryLabel =
		totalActive === 1 || isLast ? finalActionLabel : continueLabel;
	const isFinalPrimary = totalActive === 1 || isLast;
	const isSubmitting = flowStatus === "submitting";
	const navGrouped = groupNavButtons === true;
	const navJustify: "flex-start" | "center" | "flex-end" | "space-between" =
		navGrouped
			? groupedNavAlignment === "left"
				? "flex-start"
				: groupedNavAlignment === "center"
					? "center"
					: "flex-end"
			: isFirst
				? "flex-end"
				: "space-between";
	const contentAlignmentRaw =
		header?.contentAlignment ?? header?.terminalAlignment;
	const terminalAlignment: "left" | "center" | "right" = isStepAlignment(
		contentAlignmentRaw,
	)
		? contentAlignmentRaw
		: "left";
	const terminalJustify: "flex-start" | "center" | "flex-end" =
		terminalAlignment === "left"
			? "flex-start"
			: terminalAlignment === "right"
				? "flex-end"
				: "center";
	const terminalIconSize = terminal?.iconSize ?? header?.iconSize;
	const globalFieldStyles = React.useMemo(
		() => normalizeStyleOverrides(styles.fieldStyles ?? fieldStyles),
		[styles.fieldStyles, fieldStyles],
	);
	const primaryFirst = buttonOrderValue === "primaryFirst";
	const navFill = buttonWidthValue === "fill";
	const progressAnimate = React.useMemo(
		() => ({ scaleX: progressPct / 100 }),
		[progressPct],
	);

	return {
		abortControllerRef,
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
		densityRatio,
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
		handleCancelSubmit,
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
		navJustify,
		terminalAlignment,
		terminalJustify,
		terminalIconSize,
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
		doneLabel,
		bookAnotherLabel,
		addToCalendarButtonLabel,
		googleCalendarButtonLabel,
		outlookCalendarButtonLabel,
		retryLabel,
		errorCopy,
		calApiBaseUrl,
		meetingDurationMs,
		calendarStageConfig,
		calEventMeta,
		calEventMetaStatus,
	};
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
	const engineRootRef = React.useRef<HTMLDivElement | null>(null);
	const {
		activeSteps,
		availableDates,
		availabilitySettled,
		backLabel,
		bookingResult,
		borderRadius,
		sanitizedRadius,
		fieldGap,
		densityRatio,
		globalFieldStyles,
		buttonLabels,
		completePct,
		copy,
		counterText,
		currentStep,
		emptyStepWarnings,
		errors,
		flowStatus,
		fontStack,
		headingFont,
		bodySubtitleSize,
		bodySubtitleLineHeight,
		handleBack,
		handleCancelSubmit,
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
		navGrouped,
		navJustify,
		terminalAlignment,
		terminalJustify,
		terminalIconSize,
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
		style,
		submitError,
		theme,
		timeFormat,
		timeZone,
		totalActive,
		touched,
		values,
		visibleMonth,
		doneLabel,
		bookAnotherLabel,
		addToCalendarButtonLabel,
		googleCalendarButtonLabel,
		outlookCalendarButtonLabel,
		retryLabel,
		errorCopy,
		meetingDurationMs,
		calendarStageConfig,
		calEventMeta,
		calEventMetaStatus,
	} = useBookingEngineState(props, engineRootRef);

	const cancelSubmitLabel = resolveButtonText(
		buttonLabels?.cancelButton?.text,
		buttonLabels?.cancelSubmitLabel,
		DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL,
	);

	const blGroups = buttonLabels ?? {};
	const primarySharedSet = blGroups.primaryButtonStyles;
	const secondarySharedSet = blGroups.secondaryButtonStyles;
	const calendarLinkSharedSet = blGroups.calendarLinkStyles;
	const ghostButtonRole: ButtonRoleDefaults = {
		background: "transparent",
		color: theme.textPrimaryColor,
		borderWidth: 1,
		borderColor: theme.borderColor,
		padding: "10px 18px 10px 18px",
	};
	const primaryButtonRole: ButtonRoleDefaults = {
		background: theme.accentColor,
		color: theme.accentForegroundColor,
		borderWidth: 0,
		borderColor: theme.borderColor,
		padding: "10px 22px 10px 22px",
	};
	const accentOutlineRole: ButtonRoleDefaults = {
		background: "transparent",
		color: theme.accentColor,
		borderWidth: 1,
		borderColor: theme.accentColor,
		padding: "10px 18px 10px 18px",
	};
	const backButtonGroup = mergeButtonStyleGroups(secondarySharedSet, blGroups.backButton);
	const backButtonStyle = resolveButtonStyle(backButtonGroup, ghostButtonRole, borderRadius);
	const cancelButtonGroup = mergeButtonStyleGroups(secondarySharedSet, blGroups.cancelButton);
	const cancelButtonStyle = resolveButtonStyle(cancelButtonGroup, ghostButtonRole, borderRadius);
	const primaryGroup = mergeButtonStyleGroups(
		primarySharedSet,
		isFinalPrimary ? blGroups.finalActionButton : blGroups.continueButton,
	);
	const primaryButtonStyle = resolveButtonStyle(
		primaryGroup,
		primaryButtonRole,
		borderRadius,
	);
	const addToCalendarButtonGroup = mergeButtonStyleGroups(
		calendarLinkSharedSet,
		blGroups.addToCalendarButton,
	);
	const addToCalendarButtonStyle = resolveButtonStyle(
		addToCalendarButtonGroup,
		accentOutlineRole,
		borderRadius,
	);
	const doneButtonGroup = mergeButtonStyleGroups(secondarySharedSet, blGroups.doneButton);
	const doneButtonStyle = resolveButtonStyle(
		doneButtonGroup,
		{ ...ghostButtonRole, color: theme.textSecondaryColor },
		borderRadius,
	);
	const bookAnotherButtonGroup = mergeButtonStyleGroups(
		primarySharedSet,
		blGroups.bookAnotherButton,
	);
	const bookAnotherButtonStyle = resolveButtonStyle(
		bookAnotherButtonGroup,
		{ ...primaryButtonRole, padding: "10px 18px 10px 18px" },
		borderRadius,
	);
	const retryButtonGroup = mergeButtonStyleGroups(primarySharedSet, blGroups.retryButton);
	const retryButtonStyle = resolveButtonStyle(
		retryButtonGroup,
		primaryButtonRole,
		borderRadius,
	);
	const rescheduleLinkButtonStyle = resolveButtonStyle(
		secondarySharedSet,
		{ ...ghostButtonRole, color: theme.textSecondaryColor },
		borderRadius,
	);
	const googleCalendarButtonGroup = mergeButtonStyleGroups(
		calendarLinkSharedSet,
		blGroups.googleCalendarButton,
	);
	const googleCalendarButtonStyle = resolveButtonStyle(
		googleCalendarButtonGroup,
		accentOutlineRole,
		borderRadius,
	);
	const outlookCalendarButtonGroup = mergeButtonStyleGroups(
		calendarLinkSharedSet,
		blGroups.outlookCalendarButton,
	);
	const outlookCalendarButtonStyle = resolveButtonStyle(
		outlookCalendarButtonGroup,
		accentOutlineRole,
		borderRadius,
	);
	const slotPrimarySurface =
		typeof primaryButtonStyle.background === "string"
			? primaryButtonStyle.background
			: theme.accentColor;
	const slotPrimaryText =
		typeof primaryButtonStyle.color === "string"
			? primaryButtonStyle.color
			: theme.accentForegroundColor;
	const backIx = useButtonInteraction();
	const cancelIx = useButtonInteraction();
	const primaryIx = useButtonInteraction();
	const retryIx = useButtonInteraction();
	const animateIx = !prefersReducedMotion;

	const [engineWidth, setEngineWidth] = React.useState<number>(320);
	const beInteractiveForWidth = useBeInteractive();
	React.useEffect(() => {
		if (!beInteractiveForWidth) return;
		const node = engineRootRef.current;
		if (!node || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				React.startTransition(() => {
					setEngineWidth(entry.contentRect.width);
				});
			}
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, [beInteractiveForWidth]);

	const isStaticRender = useIsStaticRenderer();

	const ariaLabels = React.useMemo(
		() => ({ ...DEFAULT_ARIA_LABELS, ...(copy.aria || {}) }),
		[copy.aria],
	);

	const prevDiagnosticIndexRef = React.useRef<number>(safeCurrentIndex);
	React.useEffect(() => {
		const prev = prevDiagnosticIndexRef.current;
		const direction =
			safeCurrentIndex > prev
				? "forward"
				: safeCurrentIndex < prev
					? "back"
					: "initial";
		prevDiagnosticIndexRef.current = safeCurrentIndex;
		if (typeof window === "undefined") return;
		const w = window;
		if (!w.__BE_STEP_DEBUG__) return;
		console.debug(
			`[BE Diagnostic] navigation: ${prev} → ${safeCurrentIndex} direction=${direction} total=${totalActive}`,
		);
		activeSteps.forEach((step, idx) => {
			const isActive = idx === safeCurrentIndex;
			console.debug(
				`[BE Diagnostic] expected step=${idx} id=${step.id} isActive=${isActive} position=${isActive ? "relative" : "absolute"} opacity=${isActive ? 1 : 0} pointerEvents=${isActive ? "auto" : "none"} direction=${direction}`,
			);
		});
		let outerRaf = 0;
		let innerRaf = 0;
		outerRaf = requestAnimationFrame(() => {
			innerRaf = requestAnimationFrame(() => {
				if (!w.__BE_STEP_DEBUG__) return;
				let mismatch = false;
				activeSteps.forEach((_, idx) => {
					const el = document.querySelector(
						`[data-step-index="${idx}"]`,
					) as HTMLElement | null;
					if (!el) {
						console.warn(`[BE Diagnostic] missing DOM for step ${idx}`);
						return;
					}
					const cs = getComputedStyle(el);
					const expectedOpacity = idx === safeCurrentIndex ? "1" : "0";
					const expectedPosition = idx === safeCurrentIndex ? "relative" : "absolute";
					const expectedPointer = idx === safeCurrentIndex ? "auto" : "none";
					const ok =
						cs.opacity === expectedOpacity &&
						cs.position === expectedPosition &&
						cs.pointerEvents === expectedPointer;
					console.debug(
						`[BE Diagnostic] DOM step=${idx} computed position=${cs.position} opacity=${cs.opacity} pointerEvents=${cs.pointerEvents} expected ${expectedPosition}/${expectedOpacity}/${expectedPointer} ${ok ? "OK" : "MISMATCH"}`,
					);
					if (!ok) {
						mismatch = true;
						console.error(
							`[BE Diagnostic] MISMATCH step=${idx} active=${safeCurrentIndex} expected opacity ${expectedOpacity} got ${cs.opacity} — deterministic invariant violated`,
						);
					}
				});
				if (!mismatch) {
					console.debug(`[BE Diagnostic] invariant OK for active=${safeCurrentIndex}`);
				}
			});
		});
		return () => {
			cancelAnimationFrame(outerRaf);
			cancelAnimationFrame(innerRaf);
		};
	}, [safeCurrentIndex, activeSteps, totalActive]);

	const prevNavDirectionRef = React.useRef<number>(safeCurrentIndex);
	const navDirection =
		safeCurrentIndex > prevNavDirectionRef.current
			? 1
			: safeCurrentIndex < prevNavDirectionRef.current
				? -1
				: 0;
	React.useEffect(() => {
		prevNavDirectionRef.current = safeCurrentIndex;
	}, [safeCurrentIndex]);

	if (totalActive === 0) {
		if (!isCanvas) return null;
		return (
			<RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
				{/* biome-ignore lint/a11y/useSemanticElements: intentional
                    polite status region (W1-13-N1) — the canvas-only
                    empty-pipeline notice announces on mount; an <output>
                    would change the element's semantics. */}
				<div
					role="status"
					aria-live="polite"
					aria-atomic="true"
					style={{
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
						Enable at least one step in the Steps property to display the
						booking flow.
					</div>
				</div>
			</RootShell>
		);
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
					iconSize={terminalIconSize}
					densityRatio={densityRatio}
					bodySubtitleSize={bodySubtitleSize}
					bodySubtitleLineHeight={bodySubtitleLineHeight}
					addToCalendarLabel={addToCalendarButtonLabel}
					bookAnotherLabel={bookAnotherLabel}
					doneLabel={doneLabel}
					addToCalendarStyle={addToCalendarButtonStyle}
					bookAnotherStyle={bookAnotherButtonStyle}
					doneStyle={doneButtonStyle}
					googleCalendarStyle={googleCalendarButtonStyle}
					outlookCalendarStyle={outlookCalendarButtonStyle}
					rescheduleLinkStyle={rescheduleLinkButtonStyle}
					addToCalendarHover={addToCalendarButtonGroup?.hover}
					addToCalendarPressed={addToCalendarButtonGroup?.pressed}
					googleCalendarHover={googleCalendarButtonGroup?.hover}
					googleCalendarPressed={googleCalendarButtonGroup?.pressed}
					outlookCalendarHover={outlookCalendarButtonGroup?.hover}
					outlookCalendarPressed={outlookCalendarButtonGroup?.pressed}
					doneHover={doneButtonGroup?.hover}
					donePressed={doneButtonGroup?.pressed}
					bookAnotherHover={bookAnotherButtonGroup?.hover}
					bookAnotherPressed={bookAnotherButtonGroup?.pressed}
					animateInteractions={animateIx}
					timeZone={timeZone}
					icsSummaryLabel={copy.icsSummaryLabel}
					googleCalendarLabel={googleCalendarButtonLabel}
					outlookCalendarLabel={outlookCalendarButtonLabel}
					confirmationNumberLabel={copy.confirmationNumberLabel}
					rescheduleOrCancelLabel={copy.rescheduleOrCancelLabel}
					notesSelectedTimeLabel={copy.notesSelectedTimeLabel}
					notesDatePrefix={copy.notesDatePrefix}
					notesTimePrefix={copy.notesTimePrefix}
					icsLocationLabel={copy.icsLocationLabel}
					meetingDurationMs={meetingDurationMs}
					transitionVariant={resolvedTransitionVariant}
					baseTransition={stepTransition}
				/>
			</RootShell>
		);
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
					iconSize={terminalIconSize}
					densityRatio={densityRatio}
					bodySubtitleSize={bodySubtitleSize}
					bodySubtitleLineHeight={bodySubtitleLineHeight}
					retryLabel={retryLabel}
					retryStyle={retryButtonStyle}
					retryHover={retryButtonGroup?.hover}
					retryPressed={retryButtonGroup?.pressed}
					retryAnimate={animateIx}
				/>
			</RootShell>
		);
	}
	const backButtonEl = !isFirst ? (
		<button
			type="button"
			onClick={handleBack}
			disabled={isSubmitting}
			{...backIx.bind}
			style={{
				minHeight: TOUCH_TARGET_MIN,
				...applyButtonInteraction(
					backButtonStyle,
					backButtonGroup?.hover,
					backButtonGroup?.pressed,
					backIx,
					animateIx,
				),
				cursor: isSubmitting ? "not-allowed" : "pointer",
				opacity: isSubmitting ? 0.5 : 1,
				...(navFill ? { flex: "1 1 0", minWidth: 0 } : {}),
			}}
		>
			{backLabel}
		</button>
	) : null;
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
			{isSubmitting ? (
				<button
					type="button"
					onClick={handleCancelSubmit}
					{...cancelIx.bind}
					style={{
						minHeight: TOUCH_TARGET_MIN,
						...applyButtonInteraction(
							cancelButtonStyle,
							cancelButtonGroup?.hover,
							cancelButtonGroup?.pressed,
							cancelIx,
							animateIx,
						),
						cursor: "pointer",
					}}
				>
					{cancelSubmitLabel}
				</button>
			) : null}
			<button
				form={reactInstanceId ? `be-booking-form-${reactInstanceId}` : "be-booking-form"}
				type="submit"
				disabled={isSubmitting}
				ref={submitButtonRef}
				{...primaryIx.bind}
				aria-busy={isSubmitting ? true : undefined}
				style={{
					minHeight: TOUCH_TARGET_MIN,
					...applyButtonInteraction(
						primaryButtonStyle,
						primaryGroup?.hover,
						primaryGroup?.pressed,
						primaryIx,
						animateIx,
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
					primaryLabel
				)}
			</button>
		</div>
	);
	return (
		<RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
			<a
				href={`#be-skip-end-${reactInstanceId}`}
				className="be-skip-link"
			>
				Skip to end of booking
			</a>
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
				/* biome-ignore lint/a11y/useSemanticElements: intentional
		    polite banner live region (W1-13-F-13-9). */
				<div
					role="status"
					aria-live="polite"
					aria-atomic="true"
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
					<strong style={{ color: theme.accentColor }}>Connect Cal.com</strong>{" "}
					to enable real availability and booking submission. Add your API key
					and Event Type ID in the properties panel. Until then, the date/time
					step shows a demo grid and the final "Book Now" button will skip the
					network call.
				</div>
			) : null}

			{/* Canvas-only guardrail for missing name/email fields. */}
			{isCanvas && needsNameEmailGuardrail ? (
				/* biome-ignore lint/a11y/useSemanticElements: intentional
		    polite banner live region (W1-13-F-13-9). */
				<div
					role="status"
					aria-live="polite"
					aria-atomic="true"
					style={{
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
					Cal.com requires a name and email field somewhere in this flow. Add a
					required text field (and tick "Primary Name") and an email-typed field
					to enable booking submission.
				</div>
			) : null}

			{/* Canvas-only warnings for empty steps / empty choice options. */}
			{isCanvas && emptyStepWarnings.length > 0
				? emptyStepWarnings.map((msg) => (
					/* biome-ignore lint/a11y/useSemanticElements: intentional
		  polite status region (W1-13-F-13-9) — each warning
		  announces on mount. */
					<div
						key={msg}
						role="status"
						aria-live="polite"
						aria-atomic="true"
						style={{
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
					</div>
				))
				: null}

			{totalActive > 1 && (progressVisible || progressShowTextContent) ? (
				<div style={{ marginBottom: scaleDensity(16, densityRatio) }}>
					{progressShowTextContent && stepCountPosition === "top" ? (
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								flexWrap: "wrap",
								rowGap: 2,
								marginBottom: progressVisible
									? scaleDensity(8, densityRatio)
									: 0,
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

			<form
				aria-label={ariaLabels.bookingForm}
				id={reactInstanceId ? `be-booking-form-${reactInstanceId}` : "be-booking-form"}
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					handleContinue();
				}}
				style={{
					position: "relative",
					minHeight: 320,
					overflow: "hidden",
				}}
			>
				{activeSteps.map((step, idx) => {
					const isActive = idx === safeCurrentIndex;
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
										fontSize: fontPixelSize(headingFont?.fontSize) ?? 22,
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
										marginBottom: scaleDensity(4, densityRatio),
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
											marginBottom: scaleDensity(16, densityRatio),
											lineHeight: bodySubtitleLineHeight,
											...(isStepAlignment(step.alignment)
												? { textAlign: step.alignment }
												: { textAlign: terminalAlignment }),
										}}
									>
										{step.subtitle}
									</div>
								) : null}
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
									engineWidth={engineWidth}
									isSubmitting={isSubmitting}
									eventMeta={calEventMeta}
									eventMetaStatus={calEventMetaStatus}
									eventMetaFallbackDurationMinutes={Math.round(
										meetingDurationMs / 60000,
									)}
								/>
							</BeErrorBoundary>
						</StepVisibilityWrapper>
					);
				})}
			</form>

			{/* Footer nav */}
			<div
				style={{
					display: "flex",
					gap: scaleDensity(8, densityRatio),
					marginTop: scaleDensity(24, densityRatio),
					alignItems: "center",
					justifyContent: navJustify,
					flexWrap: "wrap",
					position: "sticky",
					bottom: 0,
					zIndex: 10,
					paddingTop: scaleDensity(12, densityRatio),
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

			<div
				id={`be-skip-end-${reactInstanceId}`}
				tabIndex={-1}
				style={{ position: "relative" }}
			/>

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

.be-dt-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.be-dt-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }

.be-select-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.be-select-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }
.be-skeleton { animation: be-skeleton-pulse 1.6s ease-in-out infinite; }
@keyframes be-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
@media (prefers-reduced-motion: reduce) { .be-skeleton { animation: none; } }
@keyframes be-spin { to { transform: rotate(360deg); } }
`}</style>
		</RootShell>
	);
}

function useStateGuarded(
	initial: number,
	max: number,
): [number, (next: number | ((prev: number) => number)) => void] {
	const [state, setState] = React.useState<number>(() =>
		max > 0 ? Math.min(initial, max - 1) : 0,
	);
	const maxRef = React.useRef(max);
	React.useEffect(() => {
		maxRef.current = max;
	}, [max]);
	React.useEffect(() => {
		const ceiling = maxRef.current;
		if (ceiling > 0 && state >= ceiling) {
			setState(Math.max(0, ceiling - 1));
		}
	}, [state, max]);
	const setter = React.useCallback(
		(next: number | ((prev: number) => number)) => {
			setState((prev) => {
				const resolved =
					typeof next === "function"
						? (next as (p: number) => number)(prev)
						: next;
				const ceiling = maxRef.current;
				if (ceiling > 0) return Math.max(0, Math.min(resolved, ceiling - 1));
				return 0;
			});
		},
		[],
	);
	return [state, setter];
}

const RootShell = React.memo(function RootShell(props: {
	style?: React.CSSProperties;
	fontStack: React.CSSProperties;
	children?: React.ReactNode;
	rootRef?: React.Ref<HTMLDivElement>;
}) {
	const [pointerActive, setPointerActive] = React.useState(false);
	React.useEffect(() => {
		const root = shellRef.current;
		if (!root) return;
		const onPointerDown = () => setPointerActive(true);
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Tab" || e.key?.startsWith("Arrow")) {
				setPointerActive(false);
			}
		};
		root.addEventListener("pointerdown", onPointerDown, true);
		root.addEventListener("keydown", onKeyDown, true);
		return () => {
			root.removeEventListener("pointerdown", onPointerDown, true);
			root.removeEventListener("keydown", onKeyDown, true);
		};
	}, []);

	const shellRef = React.useRef<HTMLDivElement | null>(null);
	const setRootRef = React.useCallback(
		(node: HTMLDivElement | null) => {
			shellRef.current = node;
			if (typeof props.rootRef === "function") {
				props.rootRef(node);
			} else if (props.rootRef) {
				(props.rootRef as { current: HTMLDivElement | null }).current =
					node;
			}
		},
		[props.rootRef],
	);

	return (
		<MotionConfig reducedMotion="user">
			<div
				className={
					pointerActive
						? "be-motion-root be-pointer-active"
						: "be-motion-root"
				}
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

.be-skip-link {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 1000;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 600;
    color: inherit;
    background: transparent;
    text-decoration: underline;
}
.be-skip-link:focus {
    left: 8px;
    top: 8px;
}

.be-focus-target:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
`}</style>
		</MotionConfig>
	);
});

interface StepBodyProps {
	step: NormalizedStep;
	steps: NormalizedStep[];
	values: BookingValues;
	errors: Record<string, string | null>;
	touched: Record<string, boolean>;
	theme: Theme;
	borderRadius: string | number;
	slotSelectedSurface?: string;
	slotSelectedText?: string;
	fieldGap: number;
	globalFieldStyles?: FieldStyleOverrides;
	hasCalConfig: boolean;
	slotsLoading: boolean;
	availabilitySettled?: boolean;
	slotsError: string | null;
	slotsForSelectedDate: Array<{
		value: string;
		label: string;
		end?: string;
		minutes: number;
	}>;
	availableDates: Set<string> | undefined;
	selectedDate: Date | null;
	visibleMonth: Date | null;
	timeZone: string;
	timeFormat: "12h" | "24h";
	hideDemoWhenUnconfigured: boolean;
	calendarSurface?: FieldStyleOverrides;
	copy: BookingEngineProps["copy"];
	ariaLabels: typeof DEFAULT_ARIA_LABELS;
	errorCopy: ErrorCopy;
	instanceId: string;
	onFieldChange: (fieldId: string, value: string | boolean | undefined) => void;
	onSlotReady: (payload?: BookingPayload) => void;
	onDateChange: (d: Date) => void;
	onMonthChange: (m: Date) => void;
	onTimeFormatChange: (fmt: "12h" | "24h") => void;
	/** T10-H1 fix: review-step Edit links jump back to a given step. */
	onJumpToStep: (stepIndex: number) => void;
	/** T10-M8 fix: re-fetch availability from the error banner. */
	onRetrySlots: () => void;
	/** ERROR-RETRY-BUTTON: resolved Retry label (Buttons group, legacy
	 *  Copy fallback) so the slots inline-retry matches the error screen. */
	retryLabel: string;
	engineWidth: number;
	isSubmitting?: boolean;
	eventMeta?: CalEventMeta | null;
	eventMetaStatus?: CalEventMetaStatus;
	eventMetaFallbackDurationMinutes?: number;
}

const STEP_BODY_FLOW_MAPS = ["values", "errors", "touched"] as const;

function areStepBodyPropsEqual(
	prev: StepBodyProps,
	next: StepBodyProps,
): boolean {
	if (prev.step !== next.step) return false;

	const isReviewStep = (prev.step.stepType as string) === "review";
	const ownKeys: string[] = prev.step.fields.map((field) => field.id);
	if (prev.step.stepType === "datetime") ownKeys.push(SELECTED_SLOT_KEY);

	for (const key of Object.keys(prev) as Array<keyof StepBodyProps & string>) {
		if ((STEP_BODY_FLOW_MAPS as readonly string[]).includes(key)) continue;
		if (key === "step") continue;
		if (prev[key] !== next[key]) return false;
	}

	if (isReviewStep) {
		return (
			prev.values === next.values &&
			prev.errors === next.errors &&
			prev.touched === next.touched
		);
	}
	for (const mapKey of STEP_BODY_FLOW_MAPS) {
		const p = prev[mapKey] as Record<string, unknown>;
		const n = next[mapKey] as Record<string, unknown>;
		for (const k of ownKeys) {
			if (p[k] !== n[k]) return false;
		}
	}
	return true;
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
		onJumpToStep,
		onRetrySlots,
		retryLabel,
		hideDemoWhenUnconfigured,
		calendarSurface,
		errorCopy,
		instanceId = "",
		engineWidth,
		isSubmitting = false,
		eventMeta,
		eventMetaStatus,
		eventMetaFallbackDurationMinutes,
	} = props;

	const slotErrorId = `${instanceId ? `${instanceId}-` : ""}be-slot-error`;

	const slotErrorBannerRef = React.useRef<HTMLDivElement | null>(null);
	const prevSlotErrorRef = React.useRef<string | null>(null);
	React.useEffect(() => {
		const err =
			touched[SELECTED_SLOT_KEY] && errors[SELECTED_SLOT_KEY]
				? errors[SELECTED_SLOT_KEY]
				: null;
		const prev = prevSlotErrorRef.current;
		prevSlotErrorRef.current = err;
		if (err && !prev && slotErrorBannerRef.current) {
			slotErrorBannerRef.current.focus();
		}
	}, [touched, errors]);

	const renderFormFields = () => {
		const isTwoCol =
			step.layout === "two-column" && engineWidth >= COMPACT_BREAKPOINT;
		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: isTwoCol ? "1fr 1fr" : "1fr",
					gap: fieldGap,
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
						choiceGroupAriaLabel={ariaLabels.choiceGroup}
						isSubmitting={isSubmitting}
						instanceId={instanceId}
						globalFieldStyles={globalFieldStyles}
					/>
				))}
			</div>
		);
	};

	if (step.stepType === "datetime") {
		const slotError =
			touched[SELECTED_SLOT_KEY] && errors[SELECTED_SLOT_KEY]
				? errors[SELECTED_SLOT_KEY]
				: null;
		const isTwoCol =
			step.layout === "two-column" && engineWidth >= COMPACT_BREAKPOINT;

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
							{retryLabel}
						</button>
					</div>
				) : null}
				{hasCalConfig &&
					!slotsLoading &&
					!slotsError &&
					slotsForSelectedDate.length === 0 &&
					selectedDate ? (
					/* biome-ignore lint/a11y/useSemanticElements: intentional
			polite status region (T5-H8 engine-level "no times" banner). */
					<div
						style={{
							padding: "10px 14px",
							marginBottom: 12,
							borderRadius: borderRadius,
							background: withAlpha(theme.textSecondaryColor, 0.08),
							color: theme.textSecondaryColor,
							fontSize: 12,
						}}
						role="status"
						aria-live="polite"
						aria-atomic="true"
					>
						{DEFAULT_COPY_NO_TIMES_LABEL}
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
					{hideDemoWhenUnconfigured ? (
						<div
							role="status"
							aria-live="polite"
							aria-atomic="true"
							style={{
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
						</div>
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
								values[SELECTED_SLOT_KEY]
									? values[SELECTED_SLOT_KEY].time24h
									: null
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
							timeFormatLabel={
								copy.timeFormatLabel ?? DEFAULT_COPY_TIMEFORMAT_LABEL
							}
							eventMeta={eventMeta}
							eventMetaStatus={eventMetaStatus}
							eventMetaFallbackDurationMinutes={
								eventMetaFallbackDurationMinutes
							}
							calEventMetaLoadingAria={copy.calEventMetaLoadingAria}
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
		);

		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: isTwoCol ? "1fr 1fr" : "1fr",
					gap: fieldGap,
				}}
				className={`be-form-grid`}
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
							isTwoCol={isTwoCol}
							onFieldChange={onFieldChange}
							choiceGroupAriaLabel={ariaLabels.choiceGroup}
							isSubmitting={isSubmitting}
							instanceId={instanceId}
							globalFieldStyles={globalFieldStyles}
						/>
					))}
			</div>
		);
	}

	return renderFormFields();
}, areStepBodyPropsEqual);

interface FieldRendererProps {
	field: NormalizedField;
	value: string | boolean | undefined;
	error: string | null;
	theme: StepBodyProps["theme"];
	borderRadius: string | number;
	isTwoCol: boolean;
	onFieldChange: (fieldId: string, value: string | boolean | undefined) => void;
	choiceGroupAriaLabel: string;
	isSubmitting?: boolean;
	globalFieldStyles?: FieldStyleOverrides;
	instanceId: string;
}

function FieldErrorMessage({
	domId,
	message,
	color,
}: {
	domId: string;
	message: string;
	color: string;
}) {
	const announcedRef = React.useRef(false);
	const firstAppearance = !announcedRef.current;
	React.useEffect(() => {
		announcedRef.current = true;
	}, []);
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
	);
}

const SELECT_MENU_MAX_PX = 320;
const SELECT_MENU_VIEWPORT_RATIO = 0.4;
const SELECT_MENU_Z_INDEX = 999999;

interface SelectMenuPlacement {
	left: number;
	top: number;
	width: number;
	maxHeight: number;
}

interface SelectMenuFont {
	fontFamily: string;
	fontSize: string;
	fontWeight: string;
	fontStyle: string;
	letterSpacing: string;
	lineHeight: string;
}

interface SelectFieldControlProps {
	field: NormalizedField;
	opts: ChoiceOption[];
	value: string | boolean | undefined;
	hasError: boolean;
	isSubmitting: boolean;
	onFieldChange: (fieldId: string, value: string | boolean | undefined) => void;
	fs: FieldStyleOverrides | undefined;
	inputBaseStyle: React.CSSProperties;
	fsInputFontSize: number;
	fsPadding: string;
	fsRadius: string;
	fsBorder: { width: number; style: string; color: string | undefined };
	theme: Theme;
	fieldDomId: string;
	errorDomId: string;
	reducedMotion: boolean;
}

const SelectFieldControl = React.memo(function SelectFieldControl(
	props: SelectFieldControlProps,
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
	} = props;

	const beInteractive = useBeInteractive();
	const triggerRef = React.useRef<HTMLDivElement | null>(null);
	const menuRef = React.useRef<HTMLUListElement | null>(null);
	const [open, setOpen] = React.useState(false);
	const [activeIndex, setActiveIndex] = React.useState(0);
	const [menuRect, setMenuRect] = React.useState<SelectMenuPlacement | null>(null);
	const [menuFont, setMenuFont] = React.useState<SelectMenuFont | null>(null);

	const listboxDomId = `${fieldDomId}-listbox`;

	const storedValue = typeof value === "string" ? value : "";
	const matchedOption = opts.find((o) => optionValue(o) === storedValue);
	const displayValue = matchedOption
		? storedValue
		: opts.length > 0
			? getInitialSelection(opts, field.defaultOption || "")
			: storedValue;
	const selectedOption = opts.find((o) => optionValue(o) === displayValue);

	React.useEffect(() => {
		if (!beInteractive) return;
		if (opts.length === 0) return;
		if (storedValue !== "") return;
		const seed = getInitialSelection(opts, field.defaultOption || "");
		if (!seed) return;
		onFieldChange(field.id, seed);
	}, [beInteractive, opts, storedValue, field.id, field.defaultOption, onFieldChange]);

	const padAxes = paddingAxesFrom(fsPadding) ?? { y: 14, x: 14 };
	const rowEstimate =
		padAxes.y * 2 + Math.round(Math.max(fsInputFontSize, 13) * 1.25) + 2;
	const computePlacement = React.useCallback((): SelectMenuPlacement | null => {
		const el = triggerRef.current;
		if (!el || typeof window === "undefined") return null;
		const r = el.getBoundingClientRect();
		const viewportH = window.innerHeight || 0;
		const cap = Math.min(viewportH * SELECT_MENU_VIEWPORT_RATIO, SELECT_MENU_MAX_PX);
		const est = Math.min(Math.max(opts.length, 1) * rowEstimate + 8, cap);
		const spaceBelow = viewportH - r.bottom - 8;
		const spaceAbove = r.top - 8;
		const openBelow =
			spaceBelow >= Math.min(est, 160) || spaceBelow >= spaceAbove;
		const maxH = Math.max(
			120,
			Math.min(cap, openBelow ? spaceBelow : spaceAbove),
		);
		return {
			left: r.left,
			top: openBelow ? r.bottom + 4 : Math.max(8, r.top - est - 4),
			width: r.width,
			maxHeight: maxH,
		};
	}, [opts.length, rowEstimate]);

	const updatePlacement = React.useCallback(() => {
		const next = computePlacement();
		if (!next) return;
		setMenuRect((prev) => {
			if (
				prev &&
				prev.left === next.left &&
				prev.top === next.top &&
				prev.width === next.width &&
				prev.maxHeight === next.maxHeight
			)
				return prev;
			return next;
		});
	}, [computePlacement]);

	const openMenu = React.useCallback(
		(focus?: "start" | "end") => {
			if (opts.length === 0) return;
			const el = triggerRef.current;
			const placement = computePlacement();
			if (!el || !placement) return;
			let font: SelectMenuFont | null = null;
			if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
				const cs = window.getComputedStyle(el);
				font = {
					fontFamily: cs.fontFamily,
					fontSize: cs.fontSize,
					fontWeight: cs.fontWeight,
					fontStyle: cs.fontStyle,
					letterSpacing: cs.letterSpacing,
					lineHeight: cs.lineHeight,
				};
			}
			setMenuFont(font);
			setMenuRect(placement);
			const selectedIdx = opts.findIndex((o) => optionValue(o) === displayValue);
			setActiveIndex(
				focus === "end"
					? Math.max(0, opts.length - 1)
					: selectedIdx >= 0
						? selectedIdx
						: 0,
			);
			setOpen(true);
		},
		[opts, displayValue, computePlacement],
	);

	const commitOption = React.useCallback(
		(index: number) => {
			const opt = opts[index];
			if (!opt || opt.disabled) return;
			onFieldChange(field.id, optionValue(opt));
			setOpen(false);
		},
		[opts, field.id, onFieldChange],
	);

	React.useEffect(() => {
		if (isSubmitting) setOpen(false);
	}, [isSubmitting]);

	React.useEffect(() => {
		if (!open) return;
		if (typeof document === "undefined") return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (!target) return;
			if (triggerRef.current?.contains(target)) return;
			if (menuRef.current?.contains(target)) return;
			setOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [open]);

	React.useEffect(() => {
		if (!open) return;
		if (typeof window === "undefined") return;
		let raf = 0;
		const reposition = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				updatePlacement();
			});
		};
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [open, updatePlacement]);

	const clampedActive =
		opts.length === 0 ? 0 : Math.min(activeIndex, opts.length - 1);

	const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (isSubmitting) return;
		switch (event.key) {
			case "Escape":
				if (open) {
					event.preventDefault();
					setOpen(false);
				}
				return;
			case " ":
			case "Enter":
				event.preventDefault();
				if (open) commitOption(clampedActive);
				else openMenu();
				return;
			case "ArrowDown":
				event.preventDefault();
				if (!open) {
					openMenu("start");
					return;
				}
				if (opts.length === 0) return;
				setActiveIndex((prev) => {
					const next = (Math.min(prev, opts.length - 1) + 1) % opts.length;
					return next;
				});
				return;
			case "ArrowUp":
				event.preventDefault();
				if (!open) {
					openMenu("end");
					return;
				}
				if (opts.length === 0) return;
				setActiveIndex((prev) => {
					const cur = Math.min(prev, opts.length - 1);
					const next = cur - 1 < 0 ? opts.length - 1 : cur - 1;
					return next;
				});
				return;
			case "Home":
				if (open && opts.length > 0) {
					event.preventDefault();
					setActiveIndex(0);
				}
				return;
			case "End":
				if (open && opts.length > 0) {
					event.preventDefault();
					setActiveIndex(opts.length - 1);
				}
				return;
			default:
				return;
		}
	};

	const menuRowRadius = Math.max(0, Number.parseFloat(fsRadius) - 4);
	const menuRowRadiusValue = Number.isFinite(menuRowRadius) ? menuRowRadius : 0;
	const selectedRowText = fs?.selectedTextColor ?? theme.accentForegroundColor ?? TEXT_ON_ACCENT;
	const selectedRowSurface = fs?.selectedBackgroundColor ?? theme.accentColor;
	const optionTextColor = fs?.textColor ?? theme.textPrimaryColor;
	const hoverRowWash = withAlpha(optionTextColor, 0.06);

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
	};

	const renderRow = (option: ChoiceOption, index: number) => {
		const isSelected = optionValue(option) === displayValue;
		const isActiveRow = index === clampedActive;
		return (
			// biome-ignore lint/a11y/useSemanticElements: ARIA listbox
			<li
				key={`${option.label}-${index}`}
				id={`${listboxDomId}-option-${index}`}
				role="option"
				aria-selected={isSelected}
				aria-disabled={option.disabled || undefined}
				onPointerDown={(event) => {
					event.preventDefault();
					commitOption(index);
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
		);
	};

	return (
		<div style={{ position: "relative" }}>
			<input
				type="hidden"
				name={field.calFieldId || field.id}
				value={storedValue}
				aria-hidden="true"
			/>
			{/* biome-ignore lint/a11y/useSemanticElements: ARIA combobox
                            pattern on a non-editable trigger — a native <select> would
                            render the unstylable browser popup (BE-003); the full
                            combobox/listbox contract is implemented here. */}
			<div
				ref={triggerRef}
				id={fieldDomId}
				role="combobox"
				tabIndex={isSubmitting ? -1 : 0}
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-controls={open ? listboxDomId : undefined}
				aria-activedescendant={
					open && opts.length > 0
						? `${listboxDomId}-option-${clampedActive}`
						: undefined
				}
				aria-label={field.label}
				aria-required={field.required || undefined}
				aria-invalid={hasError || undefined}
				aria-describedby={hasError ? errorDomId : undefined}
				aria-disabled={isSubmitting || undefined}
				className={hasError ? "be-input be-input-invalid" : "be-input"}
				onClick={() => {
					if (isSubmitting) return;
					if (open) setOpen(false);
					else openMenu();
				}}
				onKeyDown={handleTriggerKeyDown}
				onBlur={() => {
					if (open) setOpen(false);
				}}
				style={{
					...inputBaseStyle,
					textAlign: "start",
					cursor: isSubmitting ? "not-allowed" : "pointer",
					opacity: isSubmitting ? 0.5 : 1,
					paddingRight: paddingHorizontalFrom(fsPadding) + 22,
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
				{selectedOption?.label ?? ""}
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
						transform: open
							? "translateY(-50%) rotate(180deg)"
							: "translateY(-50%)",
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
					document.body,
				) as unknown as React.ReactNode)
				: null}
		</div>
	);
});

const FieldRenderer = React.memo(function FieldRenderer(
	props: FieldRendererProps,
) {
	const {
		field,
		value,
		error,
		theme,
		borderRadius,
		isTwoCol,
		onFieldChange,
		choiceGroupAriaLabel,
		isSubmitting = false,
		instanceId = "",
		globalFieldStyles,
	} = props;

	const domIdPrefix = instanceId ? `${instanceId}-` : "";
	const fieldDomId = `${domIdPrefix}be-field-${field.id}`;
	const errorDomId = `${domIdPrefix}be-error-${field.id}`;

	const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
	useIsomorphicLayoutEffect(() => {
		if (field.fieldType !== "textarea") return;
		const el = textareaRef.current;
		if (!el) return;
		const current = el.clientHeight;
		const needed = Math.max(96, el.scrollHeight);
		if (needed > current) {
			el.style.height = `${needed}px`;
		} else if (needed < current) {
			el.style.height = "auto";
			el.style.height = `${Math.max(96, el.scrollHeight)}px`;
		}
	}, [value, field.fieldType]);

	const opts: ChoiceOption[] = React.useMemo(
		() =>
			(field.options || []).map((opt, idx) => ({
				label: opt,
				value: field.optionValues?.[idx] ?? undefined,
				image: field.optionImages?.[idx] || undefined,
				description: field.optionDescriptions?.[idx] || undefined,
			})),
		[field.options, field.optionValues, field.optionImages, field.optionDescriptions],
	);
	const handleChoiceChange = React.useCallback(
		(value: string) => onFieldChange(field.id, value),
		[field.id, onFieldChange],
	);

	const isChoiceFieldType = CHOICE_FIELD_TYPES.includes(field.fieldType);

	const variantStyles: FieldStyleOverrides | undefined =
		field.fieldType === "segmented"
			? field.segmentedStyles
			: field.fieldType === "pills"
				? field.pillsStyles
				: field.fieldType === "cards"
					? field.cardsStyles
					: field.fieldType === "radio"
						? field.radioStyles
						: undefined;
	const fieldStyleOverrides: FieldStyleOverrides | undefined =
		field.fieldType === "checkbox"
			? field.checkStyles
			: field.fieldType === "select"
				? field.choiceStyles
				: field.fieldType === "segmented" ||
					field.fieldType === "pills" ||
					field.fieldType === "cards" ||
					field.fieldType === "radio"
					? mergeStyleOverrides(field.choiceStyles, variantStyles)
					: field.styles;
	const fs = mergeStyleOverrides(
		globalFieldStyles,
		normalizeStyleOverrides(fieldStyleOverrides),
	);
	const fsOptionMuted = fs?.textColor
		? withAlpha(fs.textColor, 0.6)
		: theme.textSecondaryColor;

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
	};
	const labelEl = isChoiceFieldType ? (
		<div style={labelTextStyle}>{field.label}</div>
	) : (
		<label htmlFor={fieldDomId} style={labelTextStyle}>
			{field.label}
		</label>
	);

	const errorEl = error ? (
		<FieldErrorMessage domId={errorDomId} message={error} color={theme.errorColor} />
	) : null;

	const containerStyle: React.CSSProperties = {
		gridColumn: field.width === "half" && isTwoCol ? "span 1" : "span 2",
		display: "flex",
		flexDirection: "column",
		gap: fs?.spacing ?? 6,
		minWidth: 0,
	};

	const isCoarsePointer = useCoarsePointer();
	const inputFontSize = isCoarsePointer ? 16 : 14;

	const reducedMotion = useReducedMotion();

	const fsFontSize = fontPixelSize(fs?.font?.fontSize);
	const fsInputFontSize = isCoarsePointer
		? Math.max(16, fsFontSize ?? inputFontSize)
		: (fsFontSize ?? inputFontSize);
	const fsBorder = resolveFieldBorder(fs, field.fieldType);
	const fsRadius = resolveFieldRadius(fs, borderRadius, field.fieldType);
	const fsPadding = resolveFieldPadding(fs, field.fieldType);
	const inputBaseStyle: React.CSSProperties = {
		width: "100%",
		minHeight: fs?.minHeight ?? 23,
		padding: fsPadding,
		borderRadius: fsRadius,
		border: `${fsBorder.width}px ${fsBorder.style} ${error ? theme.errorColor : (fsBorder.color ?? theme.borderColor)
			}`,
		background: fs?.backgroundColor ?? theme.surfaceColor,
		color: fs?.textColor ?? theme.textPrimaryColor,
		fontFamily: fs?.font?.fontFamily ?? "inherit",
		fontSize: fsInputFontSize,
		...(fs?.font?.fontWeight != null ? { fontWeight: fs.font.fontWeight } : {}),
		...(fs?.font?.fontStyle ? { fontStyle: fs.font.fontStyle } : {}),
		...(fs?.font?.letterSpacing != null
			? { letterSpacing: fs.font.letterSpacing }
			: {}),
		...(fs?.font?.lineHeight != null ? { lineHeight: fs.font.lineHeight } : {}),
		boxSizing: "border-box",
		...(fs?.placeholderColor
			? ({ "--be-ph-color": fs.placeholderColor } as React.CSSProperties)
			: {}),
		...(fs?.focusBorderColor
			? ({ "--be-focus-color": fs.focusBorderColor } as React.CSSProperties)
			: {}),
		...shadowStyle(fs?.shadow),
		transition: reducedMotion
			? "none"
			: "border-color 0.15s ease, box-shadow 0.15s ease",
	};

	switch (field.fieldType) {
		case "calendar-widget":
			return null;
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
						aria-describedby={
							error ? errorDomId : undefined
						}
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
			);
		case "select":
			return (
				<div style={containerStyle} data-field-id={field.id}>
					{labelEl}
					<SelectFieldControl
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
			);
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
							: "cards";
			const fsPaddingAxes = fs?.padding
				? paddingAxesFrom(fs.padding)
				: null;
			const fsAuthorRadius =
				typeof fs?.radius === "string" || typeof fs?.radius === "number"
					? resolveFieldRadius(fs, borderRadius, field.fieldType)
					: undefined;
			const fsAuthorBorderWidth = fs?.border
				? fsBorder.width
				: fs?.borderWidth;
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
						defaultValue={field.defaultOption || opts[0]?.label || ""}
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
						selectedBackgroundColor={fs?.selectedBackgroundColor}
						selectedTextColor={fs?.selectedTextColor}
						selectedBorderColor={fs?.selectedBorderColor}
						optionHoverBorderColor={
							fs?.selectedBorderColor ?? fs?.selectedBackgroundColor
						}
						optionBorderWidth={fsAuthorBorderWidth}
						optionRadius={fsAuthorRadius}
						optionPaddingY={fsPaddingAxes?.y ?? fs?.paddingY}
						optionPaddingX={fsPaddingAxes?.x ?? fs?.paddingX}
						optionMinHeight={fs?.minHeight}
						optionFont={fs?.font}
						optionShadow={fs?.shadow}
						trackBackground={fs?.backgroundColor}
						controlledValue={typeof value === "string" ? value : undefined}
						ariaInvalid={!!error}
						ariaDescribedBy={
							error ? errorDomId : undefined
						}
						onChange={handleChoiceChange}
						choiceGroupAriaLabel={choiceGroupAriaLabel}
						required={field.required}
						isSubmitting={isSubmitting}
					/>
					{errorEl}
				</div>
			);
		}
		case "checkbox": {
			const checked = Boolean(value);
			const checkAccent = fs?.accentColor ?? theme.accentColor;
			const checkSize = fs?.checkSize ?? 18;
			const checkLabelStyle: React.CSSProperties = {
				fontSize: fontPixelSize(fs?.labelFont?.fontSize) ?? 14,
				fontWeight: fs?.labelFont?.fontWeight ?? 400,
				...(fs?.labelFont?.fontFamily
					? { fontFamily: fs.labelFont.fontFamily }
					: {}),
				...(fs?.labelFont?.fontStyle
					? { fontStyle: fs.labelFont.fontStyle }
					: {}),
				...(fs?.labelFont?.letterSpacing != null
					? { letterSpacing: fs.labelFont.letterSpacing }
					: {}),
				...(fs?.labelFont?.lineHeight != null
					? { lineHeight: fs.labelFont.lineHeight }
					: {}),
				color: fs?.labelColor ?? theme.textPrimaryColor,
			};
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
							aria-describedby={
								error ? errorDomId : undefined
							}
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
			);
		}
		default:
			return (
				<div style={containerStyle} data-field-id={field.id}>
					{labelEl}
					<input
						id={fieldDomId}
						name={field.calFieldId || field.id}
						className={error ? "be-input be-input-invalid" : "be-input"}
						type={
							field.fieldType === "email"
								? "email"
								: field.fieldType === "phone"
									? "tel"
									: "text"
						}
						inputMode={
							field.fieldType === "email"
								? "email"
								: field.fieldType === "phone"
									? "tel"
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
								field.fieldType === "phone"
									? sanitizePhoneInput(e.target.value)
									: e.target.value,
							)
						}
						aria-invalid={!!error}
						aria-describedby={
							error ? errorDomId : undefined
						}
						style={inputBaseStyle}
					/>
					{errorEl}
				</div>
			);
	}
});

const SuccessScreen = React.memo(function SuccessScreen(props: {
	steps: NormalizedStep[];
	values: BookingValues;
	bookingResult: BookingConfirmation | null;
	accentColor: string;
	accentForegroundColor: string;
	textPrimaryColor: string;
	textSecondaryColor: string;
	surfaceColor: string;
	borderColor: string;
	successColor: string;
	borderRadius: string | number;
	onRestart: () => void;
	successTitle: string;
	successSubtitle: string;
	headingFont?: FramerFont;
	terminalAlignment: "left" | "center" | "right";
	bodySubtitleSize: number;
	bodySubtitleLineHeight: number | string;
	iconSize?: number;
	densityRatio: number;
	addToCalendarLabel: string;
	bookAnotherLabel: string;
	doneLabel: string;
	addToCalendarStyle: React.CSSProperties;
	bookAnotherStyle: React.CSSProperties;
	doneStyle: React.CSSProperties;
	googleCalendarStyle: React.CSSProperties;
	outlookCalendarStyle: React.CSSProperties;
	rescheduleLinkStyle: React.CSSProperties;
	addToCalendarHover?: ButtonInteractionState;
	addToCalendarPressed?: ButtonInteractionState;
	googleCalendarHover?: ButtonInteractionState;
	googleCalendarPressed?: ButtonInteractionState;
	outlookCalendarHover?: ButtonInteractionState;
	outlookCalendarPressed?: ButtonInteractionState;
	doneHover?: ButtonInteractionState;
	donePressed?: ButtonInteractionState;
	bookAnotherHover?: ButtonInteractionState;
	bookAnotherPressed?: ButtonInteractionState;
	animateInteractions: boolean;
	transitionVariant: TransitionVariantId;
	baseTransition: Transition;
	timeZone: string;
	icsSummaryLabel: string;
	googleCalendarLabel: string;
	outlookCalendarLabel: string;
	confirmationNumberLabel: string;
	rescheduleOrCancelLabel: string;
	notesSelectedTimeLabel: string;
	notesDatePrefix: string;
	notesTimePrefix: string;
	icsLocationLabel?: string;
	meetingDurationMs: number;
}) {
	const {
		steps,
		values,
		bookingResult,
		accentColor,
		accentForegroundColor,
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
		iconSize,
		densityRatio,
		bodySubtitleSize,
		bodySubtitleLineHeight,
		addToCalendarLabel,
		bookAnotherLabel,
		doneLabel,
		addToCalendarStyle,
		bookAnotherStyle,
		doneStyle,
		googleCalendarStyle,
		outlookCalendarStyle,
		rescheduleLinkStyle,
		addToCalendarHover,
		addToCalendarPressed,
		googleCalendarHover,
		googleCalendarPressed,
		outlookCalendarHover,
		outlookCalendarPressed,
		doneHover,
		donePressed,
		bookAnotherHover,
		bookAnotherPressed,
		animateInteractions,
		transitionVariant,
		baseTransition,
		timeZone,
		icsSummaryLabel,
		googleCalendarLabel,
		outlookCalendarLabel,
		confirmationNumberLabel,
		rescheduleOrCancelLabel,
		notesSelectedTimeLabel,
		notesDatePrefix,
		notesTimePrefix,
		icsLocationLabel,
		meetingDurationMs,
	} = props;

	const headingRef = React.useRef<HTMLHeadingElement | null>(null);
	React.useEffect(() => {
		headingRef.current?.focus();
	}, []);
	const icsIx = useButtonInteraction();
	const googleIx = useButtonInteraction();
	const outlookIx = useButtonInteraction();
	const doneIx = useButtonInteraction();
	const bookAnotherIx = useButtonInteraction();

	const isStaticRender = useIsStaticRenderer();
	const reducedMotion = useReducedMotion();
	const variantDef = TRANSITION_VARIANT_DEFS[transitionVariant];
	const circleHidden = React.useMemo(() => {
		const raw: unknown = variantDef.variants.inactive;
		const resolved =
			typeof raw === "function" ? (raw as (c: number) => unknown)(1) : raw;
		return resolved as Variants;
	}, [variantDef]);
	const circleShown = variantDef.variants.active;
	const circleTransition = React.useMemo(() => {
		if (reducedMotion || isStaticRender) return INSTANT_TRANSITION;
		const base = baseTransition as unknown as { duration?: number };
		const d =
			typeof base?.duration === "number" && Number.isFinite(base.duration)
				? base.duration
				: undefined;
		if (d !== undefined)
			return { ...variantDef.transition, duration: d } as Transition;
		return variantDef.transition;
	}, [baseTransition, isStaticRender, reducedMotion, variantDef]);
	const animateCheck = !isStaticRender && !reducedMotion;

	const entries: Array<{ id?: string; label: string; value: string }> =
		React.useMemo(() => {
			const list: Array<{ id?: string; label: string; value: string }> = [];
			for (const stepEntry of steps) {
				if (
					stepEntry.stepType !== "form" &&
					stepEntry.stepType !== "datetime"
				)
					continue;
				for (const field of stepEntry.fields) {
					const value = values[field.id];
					if (isEmptyPayloadValue(value)) continue;
					list.push({
						id: field.id,
						label: field.label,
						value: String(value),
					});
				}
			}
			if (values[SELECTED_SLOT_KEY]) {
				const slot = values[SELECTED_SLOT_KEY];
				const tzOpts = timeZone ? { timeZone } : undefined;
				let dateStr: string;
				try {
					const slotDate = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
						? new Date(slot.time24h)
						: slot.date;
					dateStr = getCachedDateTimeFormat(pageLocale(), {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
						...tzOpts,
					}).format(slotDate);
				} catch {
					dateStr = getCachedDateTimeFormat(pageLocale(), {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					}).format(slot.date);
				}
				list.push({ label: DEFAULT_COPY_DATE_LABEL, value: dateStr });
				list.push({
					label: DEFAULT_COPY_TIME_LABEL,
					value: slot.timeLabel,
				});
			}
			if (bookingResult?.uid) {
				list.push({
					label: confirmationNumberLabel,
					value: bookingResult.uid,
				});
			}
			return list;
		}, [steps, values, timeZone, bookingResult?.uid, confirmationNumberLabel]);

	const icsDescription = React.useMemo(() => {
		const raw = buildNotesPayload(
			steps,
			values,
			notesSelectedTimeLabel,
			notesDatePrefix,
			notesTimePrefix,
			timeZone,
		);
		const cut = raw.indexOf(notesSelectedTimeLabel);
		return cut > 0 ? raw.slice(0, cut).trim() : raw;
	}, [steps, values, notesSelectedTimeLabel, notesDatePrefix, notesTimePrefix, timeZone]);

	const icsUri = React.useMemo(
		() =>
			values[SELECTED_SLOT_KEY]
				? buildIcsDataUri(
					values[SELECTED_SLOT_KEY],
					icsDescription || undefined,
					icsSummaryLabel,
					undefined,
					undefined,
					meetingDurationMs,
					typeof icsLocationLabel === "string" ? icsLocationLabel : "",
					bookingResult?.uid ?? undefined,
				)
				: "",
		[
			values,
			icsDescription,
			icsSummaryLabel,
			meetingDurationMs,
			icsLocationLabel,
			bookingResult,
		],
	);

	const slot = isBookingPayload(values[SELECTED_SLOT_KEY])
		? (values[SELECTED_SLOT_KEY] as BookingPayload)
		: undefined;
	const hasIsoSlotTime =
		!!slot && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h);
	const googleCalUri =
		hasIsoSlotTime && slot
			? buildCalendarDeepLink(
				"google",
				slot,
				icsSummaryLabel,
				icsDescription || undefined,
				meetingDurationMs,
			)
			: "";
	const outlookCalUri =
		hasIsoSlotTime && slot
			? buildCalendarDeepLink(
				"outlook",
				slot,
				icsSummaryLabel,
				icsDescription || undefined,
				meetingDurationMs,
			)
			: "";

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent:
						terminalAlignment === "left"
							? "flex-start"
							: terminalAlignment === "right"
								? "flex-end"
								: "center",
					marginBottom: scaleDensity(16, densityRatio),
				}}
			>
				<motion.div
					initial={
						isStaticRender
							? false
							: reducedMotion
								? { opacity: 0 }
								: circleHidden
					}
					animate={
						isStaticRender || reducedMotion ? { opacity: 1 } : circleShown
					}
					transition={reducedMotion ? { duration: 0.15 } : circleTransition}
				>
					<div
						style={{
							width: iconSize ?? CHECKMARK_ICON_SIZE,
							height: iconSize ?? CHECKMARK_ICON_SIZE,
							borderRadius: "50%",
							background: successColor,
							color: TEXT_ON_ACCENT,
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
						aria-hidden="true"
					>
						<svg
							width={Math.round((iconSize ?? CHECKMARK_ICON_SIZE) / 2)}
							height={Math.round((iconSize ?? CHECKMARK_ICON_SIZE) / 2)}
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
			</div>

			{/* Title — centered, under the circle */}
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
					textAlign: terminalAlignment,
					marginBottom: scaleDensity(4, densityRatio),
					marginTop: 0,
					// FINAL-43 fix: outline:none removed (see .be-focus-target).
				}}
			>
				{replaceCopyTokens(successTitle, steps, values, timeZone)}
			</h2>

			{/* Subtitle — smaller, under the title (alignment follows) */}
			<div
				style={{
					fontSize: bodySubtitleSize,
					color: textSecondaryColor,
					textAlign: terminalAlignment,
					marginBottom: scaleDensity(24, densityRatio),
					lineHeight: bodySubtitleLineHeight,
				}}
			>
				{replaceCopyTokens(successSubtitle, steps, values, timeZone)}
			</div>

			{/* Info card — collected booking details */}
			<div
				style={{
					borderRadius: borderRadius,
					border: `1px solid ${borderColor}`,
					background: surfaceColor,
					overflow: "hidden",
					marginBottom: scaleDensity(16, densityRatio),
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
					gap: scaleDensity(8, densityRatio),
					flexWrap: "wrap",
					alignItems: "center",
					justifyContent: "flex-end",
				}}
			>
				{icsUri ? (
					<a
						href={icsUri}
						download={DEFAULT_ICS_FILENAME}
						{...icsIx.bind}
						style={{
							display: "inline-flex",
							alignItems: "center",
							minHeight: TOUCH_TARGET_MIN,
							...applyButtonInteraction(
								addToCalendarStyle,
								addToCalendarHover,
								addToCalendarPressed,
								icsIx,
								animateInteractions,
							),
							textDecoration: "none",
							cursor: "pointer",
						}}
					>
						{addToCalendarLabel}
					</a>
				) : null}
				{googleCalUri ? (
					<a
						href={googleCalUri}
						target="_blank"
						rel="noopener noreferrer"
						{...googleIx.bind}
						style={{
							display: "inline-flex",
							alignItems: "center",
							minHeight: TOUCH_TARGET_MIN,
							...applyButtonInteraction(
								googleCalendarStyle,
								googleCalendarHover,
								googleCalendarPressed,
								googleIx,
								animateInteractions,
							),
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
						{...outlookIx.bind}
						style={{
							display: "inline-flex",
							alignItems: "center",
							minHeight: TOUCH_TARGET_MIN,
							...applyButtonInteraction(
								outlookCalendarStyle,
								outlookCalendarHover,
								outlookCalendarPressed,
								outlookIx,
								animateInteractions,
							),
							textDecoration: "none",
							cursor: "pointer",
						}}
					>
						{outlookCalendarLabel}
					</a>
				) : null}
				{bookingResult?.manageUrl ? (
					<a
						href={
							bookingResult.rescheduleUrl ||
							bookingResult.cancelUrl ||
							bookingResult.manageUrl
						}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							display: "inline-flex",
							alignItems: "center",
							minHeight: TOUCH_TARGET_MIN,
							...rescheduleLinkStyle,
							textDecoration: "none",
							cursor: "pointer",
						}}
					>
						{rescheduleOrCancelLabel}
					</a>
				) : null}

				<a
					href={DEFAULT_CONFIRM_HOME_URL}
					{...doneIx.bind}
					style={{
						display: "inline-flex",
						alignItems: "center",
						minHeight: TOUCH_TARGET_MIN,
						...applyButtonInteraction(
							doneStyle,
							doneHover,
							donePressed,
							doneIx,
							animateInteractions,
						),
						textDecoration: "none",
						cursor: "pointer",
					}}
				>
					{doneLabel}
				</a>
				<button
					type="button"
					onClick={onRestart}
					{...bookAnotherIx.bind}
					style={{
						minHeight: TOUCH_TARGET_MIN,
						...applyButtonInteraction(
							bookAnotherStyle,
							bookAnotherHover,
							bookAnotherPressed,
							bookAnotherIx,
							animateInteractions,
						),
						cursor: "pointer",
					}}
				>
					{bookAnotherLabel}
				</button>
			</div>
		</div>
	);
});

const ErrorScreen = React.memo(function ErrorScreen(props: {
	message: string;
	errorColor: string;
	textPrimaryColor: string;
	textSecondaryColor: string;
	borderRadius: string | number;
	onRetry: () => void;
	errorTitle: string;
	errorSubtitle: string;
	headingFont?: FramerFont;
	terminalAlignment: "left" | "center" | "right";
	bodySubtitleSize: number;
	bodySubtitleLineHeight: number | string;
	iconSize?: number;
	densityRatio: number;
	retryLabel: string;
	retryStyle: React.CSSProperties;
	retryHover?: ButtonInteractionState;
	retryPressed?: ButtonInteractionState;
	retryAnimate: boolean;
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
		iconSize,
		densityRatio,
		bodySubtitleSize,
		bodySubtitleLineHeight,
		retryLabel,
		retryStyle,
		retryHover,
		retryPressed,
		retryAnimate,
	} = props;

	const headingRef = React.useRef<HTMLHeadingElement | null>(null);
	React.useEffect(() => {
		headingRef.current?.focus();
	}, []);
	const retryIx = useButtonInteraction();

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
				}}
			>
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
						gap: 6,
						marginBottom: scaleDensity(16, densityRatio),
						maxWidth: 520,
					}}
				>
					<div
						style={{
							width: iconSize ?? ERROR_ICON_SIZE,
							height: iconSize ?? ERROR_ICON_SIZE,
							borderRadius: "50%",
							background: withAlpha(errorColor, 0.12),
							boxShadow: `0 0 0 8px ${withAlpha(errorColor, 0.06)}`,
							color: errorColor,
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: Math.round((iconSize ?? ERROR_ICON_SIZE) * 0.6),
							fontWeight: 700,
							flexShrink: 0,
							marginBottom: 10,
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
						marginBottom: scaleDensity(20, densityRatio),
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
						gap: scaleDensity(8, densityRatio),
						flexWrap: "wrap",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<button
						type="button"
						onClick={onRetry}
						{...retryIx.bind}
						style={{
							minHeight: TOUCH_TARGET_MIN,
							...applyButtonInteraction(
								retryStyle,
								retryHover,
								retryPressed,
								retryIx,
								retryAnimate,
							),
							cursor: "pointer",
						}}
					>
						{retryLabel}
					</button>
				</div>
			</div>
		</div>
	);
});

BookingEngine.displayName = "BookingEngine";

type FieldControlProps = Partial<FieldConfig>;
type StepSlotControlProps = Pick<BookingEngineProps, "stepCount">;
type ProgressBarControlProps = Pick<
	BookingEngineProps["progressBar"],
	"showText" | "showTextContent" | "barVisible" | "visible"
>;
type ButtonsLayoutControlProps = {
	groupNavButtons?: boolean;
	buttonWidth?: "fit" | "fill";
};

function fieldStylesColorControl(title: string) {
	return { type: ControlType.Color, title, optional: true };
}
function fieldStylesNumberControl(
	title: string,
	min: number,
	max: number,
	defaultValue: number,
) {
	return {
		type: ControlType.Number,
		title,
		optional: true,
		min,
		max,
		step: 1,
		unit: "px",
		defaultValue,
	};
}
function fieldStylesFontControl(
	title: string,
	defaultValue?: {
		fontSize: string;
		variant: "Regular" | "Medium" | "Semibold";
		lineHeight?: string | number;
	},
) {
	return {
		type: ControlType.Font,
		title,
		controls: "extended" as const,
		defaultFontType: "sans-serif" as const,
		...(defaultValue ? { defaultValue } : {}),
	};
}
function fieldStylesBorderControl(
	defaultValue: {
		borderWidth?: number;
		borderStyle?: string;
		borderColor?: string;
	} = {
			borderWidth: FIELD_STYLES_BORDER_WIDTH,
			borderStyle: "solid",
			borderColor: FIELD_STYLES_BORDER_COLOR,
		},
) {
	return {
		type: ControlType.Border,
		title: "Border",
		optional: true,
		defaultValue,
	};
}
function fieldStylesRadiusControl(defaultValue: string = FIELD_STYLES_FIELD_RADIUS) {
	return {
		type: ControlType.BorderRadius,
		title: "Radius",
		optional: true,
		defaultValue,
	};
}
function fieldStylesPaddingControl(defaultValue: string = FIELD_STYLES_INPUT_PADDING) {
	return {
		type: ControlType.Padding,
		title: "Padding",
		optional: true,
		defaultValue,
	};
}
const NO_SHADOW_VALUE = "0px 0px 0px 0px rgba(0,0,0,0)";
function isNoShadowValue(value: string | undefined): boolean {
	if (!value) return true;
	const n = value.replace(/\s+/g, "").toLowerCase();
	return (
		n === "" ||
		n === "none" ||
		n === NO_SHADOW_VALUE.replace(/\s+/g, "").toLowerCase()
	);
}
function fieldStylesShadowControl(title: string = "Shadow") {
	return {
		type: ControlType.BoxShadow,
		title,
		defaultValue: NO_SHADOW_VALUE,
	};
}
function shadowStyle(shadow: string | undefined): React.CSSProperties {
	return !isNoShadowValue(shadow) && shadow && shadow.trim()
		? { boxShadow: shadow }
		: {};
}

function makeInputFieldStylesControls() {
	const eff = getFieldStylesEffectiveDefaults("text");
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
	};
}

function makeGlobalFieldStylesControls() {
	const checkEff = getFieldStylesEffectiveDefaults("checkbox");
	// STYLES-ORDER: Shadows closes the set (BE-023) — after the
	// Selected/Check rows, not with the base rows.
	return {
		...makeInputFieldStylesControls(),
		selectedBackgroundColor: fieldStylesColorControl("Selected BG"),
		selectedTextColor: fieldStylesColorControl("Selected Text"),
		selectedBorderColor: fieldStylesColorControl("Selected Border"),
		accentColor: fieldStylesColorControl("Check Accent"),
		checkSize: fieldStylesNumberControl("Check Size", 12, 32, checkEff.minHeight),
		shadow: fieldStylesShadowControl("Shadows"),
	};
}

function makeCalendarStylesStylesControls() {
	const eff = getFieldStylesEffectiveDefaults("calendar-widget");
	return {
		font: fieldStylesFontControl("Field Font", {
			fontSize: "14px",
			variant: "Regular",
		}),
		textColor: fieldStylesColorControl("Field Color"),
		backgroundColor: fieldStylesColorControl("Fill"),
		radius: fieldStylesRadiusControl(eff.radius),
		padding: fieldStylesPaddingControl(eff.padding),
		border: fieldStylesBorderControl({
			borderWidth: 1,
			borderStyle: "solid",
			borderColor: FIELD_STYLES_BORDER_COLOR,
		}),
		shadow: fieldStylesShadowControl("Shadows"),
	};
}

function makeButtonInteractionControls(borderDefaultColor: string) {
	return {
		transition: {
			type: ControlType.Transition,
			title: "Transition",
			defaultValue: {
				type: "tween",
				duration: 0.15,
				ease: "easeOut",
			} as Transition,
		},
		scale: {
			type: ControlType.Number,
			title: "Scale",
			defaultValue: 1,
			min: 0.5,
			max: 1.5,
			step: 0.01,
		},
		opacity: {
			type: ControlType.Number,
			title: "Opacity",
			defaultValue: 1,
			min: 0,
			max: 1,
			step: 0.01,
		},
		textColor: fieldStylesColorControl("Text Color"),
		backgroundColor: fieldStylesColorControl("Background"),
		border: {
			type: ControlType.Border,
			title: "Border",
			optional: true,
			description:
				"0 keeps the button's normal border — set 1 or more to override it here.",
			defaultValue: {
				borderWidth: 0,
				borderStyle: "solid",
				borderColor: borderDefaultColor,
			},
		},
		shadow: fieldStylesShadowControl(),
	};
}
function makeSharedButtonStylesControls(defaults: {
	padding: string;
	borderWidth: number;
	borderColor: string;
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
			type: ControlType.Object,
			title: "Hover",
			buttonTitle: "Hover",
			icon: "interaction",
			optional: true,
			controls: makeButtonInteractionControls(defaults.borderColor),
		},
		pressed: {
			type: ControlType.Object,
			title: "Pressed",
			buttonTitle: "Pressed",
			icon: "interaction",
			optional: true,
			controls: makeButtonInteractionControls(defaults.borderColor),
		},
	};
}
function makeButtonTextControls(text: string) {
	return {
		text: {
			type: ControlType.String,
			title: "Text",
			defaultValue: text,
		},
	};
}

interface ButtonRoleDefaults {
	background: string;
	color: string;
	borderWidth: number;
	borderColor: string;
	padding: string;
}

function resolveButtonStyle(
	group: ButtonStyleGroup | undefined,
	role: ButtonRoleDefaults,
	radiusToken: string | number,
): React.CSSProperties {
	const font = group?.font;
	const width = group?.border?.borderWidth ?? role.borderWidth;
	const style = group?.border?.borderStyle || "solid";
	const bColor = group?.border?.borderColor || role.borderColor;
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
		...(font?.letterSpacing != null
			? { letterSpacing: font.letterSpacing }
			: {}),
		...(font?.lineHeight != null ? { lineHeight: font.lineHeight } : {}),
		...shadowStyle(group?.shadow),
	};
}

function mergeButtonStyleGroups(
	base: ButtonStyleGroup | undefined,
	over: ButtonStyleGroup | undefined,
): ButtonStyleGroup | undefined {
	if (!base) return over;
	if (!over) return base;
	const out: ButtonStyleGroup = { ...base };
	const rec = out as Record<string, unknown>;
	for (const key of Object.keys(over)) {
		const value = (over as Record<string, unknown>)[key];
		if (value === undefined) continue;
		if (key === "border" || key === "hover" || key === "pressed" || key === "font") {
			const baseObj = (rec[key] ?? {}) as Record<string, unknown>;
			rec[key] = { ...baseObj, ...(value as Record<string, unknown>) };
		} else {
			rec[key] = value;
		}
	}
	return out;
}

const INTERACTION_ANIMATED_PROPS = [
	"background-color",
	"border-color",
	"box-shadow",
	"color",
	"opacity",
	"transform",
];
function splitBorderParts(border: string): [string, string, string] | null {
	const m = /^(\S+)\s+(\S+)\s+(.+)$/.exec(border.trim());
	return m ? [m[1], m[2], m[3]] : null;
}
function cssEaseName(name: string): string {
	switch (name) {
		case "linear":
		case "ease":
		case "ease-in":
		case "ease-out":
		case "ease-in-out":
			return name;
		case "easeIn":
			return "ease-in";
		case "easeOut":
			return "ease-out";
		case "easeInOut":
			return "ease-in-out";
		default:
			return "ease";
	}
}
function interactionTransition(
	t: Transition | undefined,
	animate: boolean,
): string {
	if (!animate) return "none";
	let duration = 0.15;
	let ease = "ease";
	let delay = 0;
	if (t) {
		if (typeof t.duration === "number" && Number.isFinite(t.duration)) {
			duration = clamp(t.duration, 0, 5);
		}
		const d = (t as { delay?: unknown }).delay;
		if (typeof d === "number" && Number.isFinite(d)) {
			delay = clamp(d, 0, 5);
		}
		const e = t.ease;
		if (typeof e === "string") {
			ease = cssEaseName(e);
		} else if (
			Array.isArray(e) &&
			e.length === 4 &&
			e.every((n) => typeof n === "number")
		) {
			ease = `cubic-bezier(${(e as number[]).join(", ")})`;
		}
	}
	return INTERACTION_ANIMATED_PROPS.map(
		(p) => `${p} ${duration}s ${ease} ${delay}s`,
	).join(", ");
}
function applyButtonInteraction(
	base: React.CSSProperties,
	hover: ButtonInteractionState | undefined,
	pressed: ButtonInteractionState | undefined,
	state: { hovered: boolean; pressed: boolean },
	animate: boolean,
): React.CSSProperties {
	const st = state.pressed ? pressed : state.hovered ? hover : undefined;
	const t = state.pressed
		? (pressed?.transition ?? hover?.transition)
		: hover?.transition;
	const out: React.CSSProperties = { ...base };
	if (st) {
		if (st.backgroundColor) out.background = st.backgroundColor;
		if (st.textColor) out.color = st.textColor;
		const hb = st.border;
		const hbWidth = hb?.borderWidth ?? 0;
		if (hb && hbWidth > 0) {
			const baseParts =
				typeof base.border === "string" ? splitBorderParts(base.border) : null;
			const baseColor =
				typeof base.color === "string" && base.color ? base.color : null;
			out.border = `${hbWidth}px ${hb.borderStyle || (baseParts ? baseParts[1] : "solid")} ${hb.borderColor || (baseParts ? baseParts[2] : null) || baseColor || "currentColor"}`;
		}
		if (st.opacity != null) out.opacity = st.opacity;
		if (st.scale != null && st.scale !== 1) {
			out.transform = `scale(${st.scale})`;
		}
		Object.assign(out, shadowStyle(st.shadow));
	}
	out.transition = interactionTransition(t, animate);
	return out;
}

function useButtonInteraction() {
	const [hovered, setHovered] = React.useState(false);
	const [pressed, setPressed] = React.useState(false);
	return {
		hovered,
		pressed,
		bind: {
			onMouseEnter: () => setHovered(true),
			onMouseLeave: () => {
				setHovered(false);
				setPressed(false);
			},
			onMouseDown: () => setPressed(true),
			onMouseUp: () => setPressed(false),
		},
	};
}

function resolveButtonText(
	groupText: string | undefined,
	legacyLabel: string | undefined,
	fallback: string,
): string {
	return groupText || legacyLabel || fallback;
}

function makeFieldObjectControls() {
	return {
		label: {
			type: ControlType.String,
			title: "Label",
			defaultValue: "Field Label",
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
			hidden: (p: FieldControlProps) =>
				p?.fieldType === "calendar-widget" ||
				CHOICE_FIELD_TYPES.includes(p?.fieldType || "") ||
				p?.fieldType === "checkbox",
		},
		required: {
			type: ControlType.Boolean,
			title: "Required",
			defaultValue: false,
			hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
		},
		options: {
			type: ControlType.Array,
			title: "Options",
			maxCount: 12,
			defaultValue: ["Option 1", "Option 2"],
			control: {
				type: ControlType.String,
				defaultValue: "Option",
			},
			hidden: (p: FieldControlProps) =>
				p?.fieldType === "calendar-widget" ||
				p?.fieldType === "checkbox" ||
				!CHOICE_FIELD_TYPES.includes(p?.fieldType || ""),
		},
		defaultOption: {
			type: ControlType.String,
			title: "Default Selected",
			defaultValue: "",
			placeholder: "Empty = first option",
			description:
				"Pre-selected option. Must match an option label or value; empty keeps the first option.",
			hidden: (p: FieldControlProps) =>
				!CHOICE_FIELD_TYPES.includes(p?.fieldType || ""),
		},
		isPrimaryName: {
			type: ControlType.Boolean,
			title: "Primary Name",
			defaultValue: false,
			hidden: (p: FieldControlProps) => p?.fieldType !== "text",
		},
		optionValues: {
			type: ControlType.Array,
			title: "Option Values",
			maxCount: 12,
			defaultValue: [],
			control: {
				type: ControlType.String,
				defaultValue: "",
				placeholder: "Custom value (blank uses the label)",
			},
			hidden: (p: FieldControlProps) =>
				!CHOICE_FIELD_TYPES.includes(p?.fieldType || ""),
		},
		optionImages: {
			type: ControlType.Array,
			title: "Option Images",
			maxCount: 12,
			defaultValue: [],
			control: {
				type: ControlType.ResponsiveImage,
			},
			hidden: (p: FieldControlProps) =>
				p?.fieldType !== "cards" && p?.fieldType !== "radio",
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
				p?.fieldType !== "cards" && p?.fieldType !== "radio",
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
		calFieldId: {
			type: ControlType.String,
			title: "Cal Field ID",
			defaultValue: "",
			placeholder: "e.g. pet-name",
			hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
		},
	};
}

function makeStepControl(slotIndex: number, defaults: StepConfig) {
	return {
		type: ControlType.Object,
		title: `Step ${slotIndex + 1}`,
		defaultValue: defaults,
		hidden: (p: StepSlotControlProps) => (p?.stepCount ?? 1) <= slotIndex,
		controls: {
			enabled: {
				type: ControlType.Boolean,
				title: "Visible",
				defaultValue: defaults.enabled,
			},
			title: {
				type: ControlType.String,
				title: "Title",
				defaultValue: defaults.title,
			},
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
			fields: {
				type: ControlType.Array,
				title: "Fields",
				maxCount: 10,
				defaultValue: defaults.fields,
				control: {
					type: ControlType.Object,
					controls: makeFieldObjectControls(),
				},
			},
		},
	};
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
				controls: makeCalendarStylesStylesControls(),
			},
		},
	},

	header: {
		type: ControlType.Object,
		title: "Content",
		icon: "object",
		buttonTitle: "Content",
		controls: {
			contentAlignment: {
				type: ControlType.Enum,
				title: "Content Alignment",
				options: ["left", "center", "right"],
				optionTitles: ["Left", "Center", "Right"],
				defaultValue: "left",
				displaySegmentedControl: true,
			},
		},
	},

	terminal: {
		type: ControlType.Object,
		title: "Terminal",
		icon: "object",
		buttonTitle: "Terminal",
		optional: true,
		controls: {
			iconSize: {
				type: ControlType.Number,
				title: "Icon Size",
				min: 24,
				max: 96,
				step: 1,
				unit: "px",
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
				title: "Buttons Layout",
				buttonTitle: "Buttons Layout",
				icon: "object",
				controls: {
					groupNavButtons: {
						type: ControlType.Boolean,
						title: "Layout",
						defaultValue: false,
						enabledTitle: "Grouped",
						disabledTitle: "Split",
						hidden: (p: ButtonsLayoutControlProps) =>
							p?.buttonWidth === "fill",
					},
					groupedNavAlignment: {
						type: ControlType.Enum,
						title: "Buttons Alignment",
						options: ["left", "center", "right"],
						optionTitles: ["Left", "Center", "Right"],
						defaultValue: "right",
						displaySegmentedControl: true,
						hidden: (p: ButtonsLayoutControlProps) =>
							p?.groupNavButtons !== true,
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
					padding: "10px 22px 10px 22px",
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
					padding: "10px 18px 10px 18px",
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
					borderColor: "#0066BB",
				}),
			},
			continueButton: {
				type: ControlType.Object,
				title: "Continue",
				buttonTitle: "Continue",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls("Continue"),
			},
			backButton: {
				type: ControlType.Object,
				title: "Back",
				buttonTitle: "Back",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls("Back"),
			},
			finalActionButton: {
				type: ControlType.Object,
				title: "Final Action",
				buttonTitle: "Final Action",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls("Book Now"),
			},
			cancelButton: {
				type: ControlType.Object,
				title: "Cancel",
				buttonTitle: "Cancel",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls(DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL),
			},
			doneButton: {
				type: ControlType.Object,
				title: "Done",
				buttonTitle: "Done",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls(DEFAULT_COPY_RETURN_HOME_LABEL),
			},
			bookAnotherButton: {
				type: ControlType.Object,
				title: "Book Another",
				buttonTitle: "Book Another",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls(DEFAULT_CONFIRM_BOOK_ANOTHER_LABEL),
			},
			addToCalendarButton: {
				type: ControlType.Object,
				title: "Add to Calendar",
				buttonTitle: "Add to Calendar",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls(DEFAULT_CONFIRM_ADD_TO_CALENDAR_LABEL),
			},
			googleCalendarButton: {
				type: ControlType.Object,
				title: "Google Calendar",
				buttonTitle: "Google Calendar",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls("Add to Google Calendar"),
			},
			outlookCalendarButton: {
				type: ControlType.Object,
				title: "Outlook",
				buttonTitle: "Outlook",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls("Add to Outlook"),
			},
			retryButton: {
				type: ControlType.Object,
				title: "Retry",
				buttonTitle: "Retry",
				icon: "object",
				optional: true,
				controls: makeButtonTextControls(DEFAULT_COPY_RETRY_LABEL),
			},
			// HOME-URL-REMOVED: no destination control — "Done" always
			// navigates to the website root (DEFAULT_CONFIRM_HOME_URL).
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
				hidden: (p: ProgressBarControlProps) =>
					(p?.barVisible ?? p?.visible) === false,
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
		},
	},
	styles: {
		type: ControlType.Object,
		title: "Styles",
		icon: "color",
		buttonTitle: "Styles",
		controls: {
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
				defaultValue: "#0066BB",
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
				defaultValue: "#111827",
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
				defaultValue: 16,
				min: 0,
				max: 32,
				step: 1,
				unit: "px",
				displayStepper: true,
			},
			density: {
				type: ControlType.Enum,
				title: "Density",
				options: ["compact", "comfortable", "spacious"],
				optionTitles: ["Compact", "Comfortable", "Spacious"],
				defaultValue: "comfortable",
				displaySegmentedControl: true,
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
				optionTitles: ["Fade Rise", "Blur Scale", "Slide", "Zoom", "Vertical Slide", "Blur Slide"],
				defaultValue: "blurScale",
			},
		},
	},

	copy: {
		type: ControlType.Object,
		title: "Copy",
		icon: "object",
		buttonTitle: "Copy",
		controls: {
			successTitle: {
				type: ControlType.String,
				title: "Success Title",
				defaultValue: "Booked Successfully",
			},
			successSubtitle: {
				type: ControlType.String,
				title: "Success Subtitle",
				defaultValue: "Your appointment has been confirmed, Details are below.",
				displayTextArea: true,
			},
			errorTitle: {
				type: ControlType.String,
				title: "Error Title",
				defaultValue: "Something went wrong while processing your booking",
			},
			errorSubtitle: {
				type: ControlType.String,
				title: "Error Subtitle",
				defaultValue: "Your details are saved — try again in a moment.",
				displayTextArea: true,
			},
			icsSummaryLabel: {
				type: ControlType.String,
				title: "Calendar Summary",
				defaultValue: "Appointment",
			},
			stepCounterTemplate: {
				type: ControlType.String,
				title: "Step Counter",
				defaultValue: "Step {current} of {total}",
			},
			timeFormatLabel: {
				type: ControlType.String,
				title: "Time Format Toggle Label",
				defaultValue: DEFAULT_COPY_TIMEFORMAT_LABEL,
			},
			confirmationNumberLabel: {
				type: ControlType.String,
				title: "Confirmation Number",
				defaultValue: DEFAULT_COPY_CONFIRMATION_NUMBER_LABEL,
			},
			rescheduleOrCancelLabel: {
				type: ControlType.String,
				title: "Reschedule / Cancel Link",
				defaultValue: DEFAULT_COPY_RESCHEDULE_OR_CANCEL_LABEL,
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
			icsLocationLabel: {
				type: ControlType.String,
				title: "ICS Location",
				defaultValue: "",
			},
			calEventMetaLoadingAria: {
				type: ControlType.String,
				title: "Event Info Loading (aria)",
				defaultValue: CAL_META_LOADING_ARIA,
			},
			calEventMetaUnavailableCopy: {
				type: ControlType.String,
				title: "Event Info Unavailable",
				defaultValue: CAL_META_UNAVAILABLE_COPY,
			},
			notesSelectedTimeLabel: {
				type: ControlType.String,
				title: "Notes Time Section",
				defaultValue: DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL,
			},
			notesDatePrefix: {
				type: ControlType.String,
				title: "Notes Date Prefix",
				defaultValue: DEFAULT_COPY_NOTES_DATE_PREFIX,
			},
			notesTimePrefix: {
				type: ControlType.String,
				title: "Notes Time Prefix",
				defaultValue: DEFAULT_COPY_NOTES_TIME_PREFIX,
			},
			aria: {
				type: ControlType.Object,
				title: "Accessibility Labels",
				icon: "object",
				buttonTitle: "Accessibility Labels",
				controls: {
					choiceGroup: {
						type: ControlType.String,
						title: "Choice Group",
						defaultValue: DEFAULT_ARIA_CHOICE_GROUP_LABEL,
					},
					timeSlots: {
						type: ControlType.String,
						title: "Time Slots",
						defaultValue: DEFAULT_ARIA_TIME_SLOTS_LABEL,
					},
					availableTimes: {
						type: ControlType.String,
						title: "Available Times",
						defaultValue: DEFAULT_ARIA_AVAILABLE_TIMES_LABEL,
					},
					datePicker: {
						type: ControlType.String,
						title: "Date Picker",
						defaultValue: DEFAULT_ARIA_DATE_PICKER_LABEL,
					},
					bookingProgress: {
						type: ControlType.String,
						title: "Booking Progress",
						defaultValue: DEFAULT_ARIA_BOOKING_PROGRESS_LABEL,
					},
					bookingForm: {
						type: ControlType.String,
						title: "Booking Form",
						defaultValue: DEFAULT_ARIA_BOOKING_FORM_LABEL,
					},
					previousMonthTemplate: {
						type: ControlType.String,
						title: "Previous Month Nav",
						defaultValue: DEFAULT_ARIA_PREVIOUS_MONTH_TEMPLATE,
					},
					nextMonthTemplate: {
						type: ControlType.String,
						title: "Next Month Nav",
						defaultValue: DEFAULT_ARIA_NEXT_MONTH_TEMPLATE,
					},
				},
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
					// VALIDATION-REMOVED (rule 100): no custom pattern or min-length controls.
				},
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
					"Use a unique ID when multiple identical Booking Engines share a page.",
				defaultValue: "",
			},
		},
	},
});

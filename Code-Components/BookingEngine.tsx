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

// FINAL-64 fix: one typed declaration replaces the repeated
// `as unknown as { __BE_STEP_DEBUG__ ... }` casts at every diagnostic
// call site. Bundler-safe: type-only, zero runtime emission, and the
// single-file Framer constraint is untouched.
declare global {
	interface Window {
		__BE_STEP_DEBUG__?: boolean;
		// BE-DIAG: set to false to silence the scoped booking diagnostics.
		__BE_DIAG__?: boolean;
	}
}

// FINAL-65 fix: the color token set is now ONE named type instead of a
// duplicated inline shape at every consumption site. Compile-time only.
// COLOR-SYSTEM (rule 90): Accent / Primary Foreground / Surface / Text
// Primary / Border are authored (five Styles controls); Text Secondary and
// Success are derived at fixed design ratios and Error is the fixed
// internal red — all remain SEMANTIC tokens for the ~40 consumers. There is
// no Background token: the root is transparent and the calendar owns its
// surface (CAL-BG-OWNERSHIP).
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

// W1-14-N3 fix: `React.useLayoutEffect` emits the "does nothing on the
// server" warning during SSR, and four of this file's six sites had no
// explicit `typeof window` guard. Module is evaluated once at import time,
// so this is a stable one-shot SSR probe (never re-evaluates per render).
const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// =============================================================================
// Shared color/time utilities (merged from the two inlined sources, deduped)
// =============================================================================

// W1-17-F-17-2 fix: the colour parser used to accept only 3/6-char hex and
// rgb()/rgba() — 8-char hex, 4-char hex, named colours, and hsl()/hsla()
// all fell through to null (and callers then silently assumed white or
// fell back to color-mix). The full parser below handles every CSS colour
// syntax Framer's color control can emit; alpha is captured and returned
// alongside the channels (F-17-7 needs it to blend onto a background).

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

// F-17-2 fix: full CSS colour parser — hex 3/4/6/8-digit, named colours,
// rgb()/rgba() (comma or modern space+slash syntax, plain or % channels)
// and hsl()/hsla() (comma or space+slash syntax, deg/rad/turn hues).
// Returns null only for genuinely unparseable input, and carries the
// effective alpha channel (default 1) so callers can composite.
// FINAL-72 fix: memoized wrapper — the same accent/surface/border strings
// were re-parsed on every render for every withAlpha call. Bounded Map so
// pathological dynamic inputs can't grow it without limit.
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
	// W1-17-N1-new fix: "transparent" is a spec-valid CSS colour the old
	// fall-through returned null for (callers treated null as "invalid").
	// Map it to fully-opaque-black-with-zero-alpha.
	// FINAL-74 fix: comment corrected — BOTH special inputs return the same
	// {r:0,g:0,b:0,a:0} shape; callers canNOT distinguish transparent from
	// currentColor from here, only "zero-alpha black" from "invalid/null".
	if (trimmed === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
	// W1-17-N2-new fix: currentColor resolves against context and is
	// never known statically; it gets zero-alpha black like transparent.
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
		// FINAL-71 fix: "grad" must be tested BEFORE "rad" — every grad
		// value ends in "rad" ("100grad".endsWith("rad") is true), so the
		// original order sent gradians down the radian path (dead branch).
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
		// W1-17-F17-N1 fix: legacy comma syntax `hsla(H,S%,L%,A)` has no
		// slash — the alpha lands in tokens[3] and was silently dropped
		// (contract: "comma or modern space+slash syntax", see F-17-2
		// comment above).
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
		// hsl → rgb (standard algorithm)
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
	// W1-17-F17-N1 fix: legacy comma syntax `rgba(R,G,B,A)` has no slash —
	// the alpha lands in tokens[3] and was silently dropped.
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

// Fixed foreground used on accent/success-filled surfaces (selected choice
// options, the submit button, the success checkmark, and the restart/retry
// buttons). Deliberately a constant: the component never derives a text
// colour from the configured background — it renders exactly the colours
// the author configures, nothing more.
const TEXT_ON_ACCENT = "#FFFFFF";

// FINAL-73 fix: one-time feature detection for the color-mix() fallback
// path in withAlpha (module scope — evaluated once per page).
const SUPPORTS_COLOR_MIX =
	typeof CSS !== "undefined" &&
	typeof CSS.supports === "function" &&
	CSS.supports("color", "color-mix(in srgb, red, blue)");

// W1-17-F-17-7 fix: old withAlpha replaced the alpha channel outright and
// DROPPED any alpha already carried by the input colour (an 8-digit hex or
// rgba/hsla input parsed as opaque). Now: effective alpha = colourAlpha ×
// requested, and when the caller knows its backdrop it can pass `background`
// to get a SOLID pre-blended colour instead of a translucent one (browsers
// then can't double-dip the alpha elsewhere).
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
	// FINAL-73 fix: color-mix() needs Safari ≥16.2 / Chrome ≥111 / Firefox
	// ≥113. On older engines the expression is an invalid value (treated as
	// no declaration); returning the author's literal colour degrades to
	// "no alpha blend" instead of "colour vanishes".
	if (!SUPPORTS_COLOR_MIX) return color;
	return `color-mix(in srgb, ${color} ${safeAlpha * 100}%, transparent)`;
}

// T5-L8 fix: date formatting should follow the page's declared language
// (<html lang>), not the browser's default locale - they can differ (e.g. a
// German site visited from a browser set to English). Falls back to the
// browser default when the page declares no lang.
// LOCALE-REMOVED: the author-set `locale` Property Control (FINAL-12) was
// removed: there is no locale override. Module function (not React state)
// because pageLocale() is read from 22 call sites across nested helpers
// and pure functions that have no access to props.
function pageLocale(): string | undefined {
	return typeof document !== "undefined"
		? document.documentElement.lang || undefined
		: undefined;
}

// W1-02-F24 fix: the copy-panel defaults below are the SAME constants the
// runtime fallbacks use, so re-wording one side can no longer drift from
// the other. Bundle 14 (W1-02-F9–F23) wired every remaining visitor-facing
// string through these.
const DEFAULT_COPY_CONFIRMATION_NUMBER_LABEL = "Confirmation #";
const DEFAULT_COPY_RESCHEDULE_OR_CANCEL_LABEL = "Reschedule or cancel";
const DEFAULT_COPY_EDIT_LABEL = "Edit";
const DEFAULT_COPY_PICK_DATE_TO_SEE_TIMES_LABEL = "Pick a date to see times";
const DEFAULT_COPY_NO_TIMES_FALLBACK_LABEL = "No available times";
const DEFAULT_COPY_SELECT_OPTION_LABEL = "Choose an option…";
const DEFAULT_COPY_STEP_PROGRESS_TEMPLATE = "{pct}% complete";
const DEFAULT_COPY_UNKNOWN_ERROR_LABEL = "Unknown error";
const DEFAULT_COPY_SUBMIT_ERROR_FALLBACK =
	"Something went wrong while submitting your booking. Please try again.";
const DEFAULT_COPY_AM_LABEL = "AM";
const DEFAULT_COPY_PM_LABEL = "PM";
// FINAL-09 fix: localisable duration suffixes for the event-info panel.
const DEFAULT_COPY_HOUR_SUFFIX = "hr";
const DEFAULT_COPY_MINUTE_SUFFIX = "min";
const DEFAULT_COPY_ICS_PRODID = "//BookingEngine//Framer//EN";
const DEFAULT_COPY_ICS_SUMMARY_FALLBACK = "Booking";
const DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL = "Selected Time";
const DEFAULT_COPY_NOTES_DATE_PREFIX = "Date: ";
const DEFAULT_COPY_NOTES_TIME_PREFIX = "Time: ";
const DEFAULT_COPY_STEP_COUNTER_TEMPLATE = "Step {current} of {total}";
// W1-10-N3 fix: group label for the 12h/24h time-format toggle.
const DEFAULT_COPY_TIMEFORMAT_LABEL = "Time format";
const DEFAULT_DEMO_START_TIME = "09:00";
const DEFAULT_DEMO_END_TIME = "17:00";
const DEFAULT_DEMO_INTERVAL = 30;
// W1-02-F4 fix: sr-only step announcement — was a hardcoded
// "{counter}, {percent}% complete — {title}" that diverged from the
// localized visible progress label. Placeholders: {counter}, {percent},
// {title}.
// A11Y-ANNOUNCE: the step change ALSO moves focus to the step heading,
// which announces the title — so the default template carries counter +
// percent only (announcing the title twice). {title} is still replaced
// for author-customized templates that keep it.
const DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE =
	"{counter}, {percent}% complete";
// W1-02-F5 fix: the success-screen "Done" link and the font-stack fallback
// were inline literals; now shared constants the schema and runtime share.
const DEFAULT_COPY_RETURN_HOME_LABEL = "Done";
// CONFIRM-ACTIONS: confirmation-state button labels moved into the Buttons
// group. These constants are the control defaults AND the runtime fallbacks
// for instances saved before the controls existed.
const DEFAULT_CONFIRM_BOOK_ANOTHER_LABEL = "Book another";
const DEFAULT_CONFIRM_ADD_TO_CALENDAR_LABEL = "Add to Calendar";
// HOME-URL-REMOVED: fixed destination of the "Done" action — website root.
// No control exposes it (author direction); the success screen never
// auto-redirects (see AGENTS.md).
const DEFAULT_CONFIRM_HOME_URL = "/";
const DEFAULT_FONT_FAMILY = "Inter, system-ui, sans-serif";
// SYN-03 fix: the in-flight POST cancel button used a hardcoded literal —
// the only footer button not driven by buttonLabels.
const DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL = "Cancel";
// Accessibility names (catalogued under F9–F16). Month-nav templates keep a
// {month} placeholder that the calendar fills with the real month name.
const DEFAULT_ARIA_CHOICE_GROUP_LABEL = "Choice group";
const DEFAULT_ARIA_TIME_SLOTS_LABEL = "Time slots";
const DEFAULT_ARIA_AVAILABLE_TIMES_LABEL = "Available times";
const DEFAULT_ARIA_DATE_PICKER_LABEL = "Date picker";
const DEFAULT_ARIA_BOOKING_PROGRESS_LABEL = "Booking progress";
const DEFAULT_ARIA_BOOKING_FORM_LABEL = "Booking form";
const DEFAULT_ARIA_PREVIOUS_MONTH_TEMPLATE = "Previous month, {month}";
const DEFAULT_ARIA_NEXT_MONTH_TEMPLATE = "Next month, {month}";
// W1-02-F9 fix: saved instances created before the `copy.aria` group
// existed have no nested object — merge over these defaults so old
// canvases don't crash on `copy.aria.timeSlots`.
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

// W1-02-F4 through F-8 fix (bundle 17): every visitor-facing Cal.com error
// string lives in ONE typed defaults object. The engine merges
// `copy.errorCopy` over it (old canvases lack the nested group), the panel
// uses it as defaultValue, and the five surfaces (mapCalcomError rules, the
// slots-fetch ladder, the booking-POST failures, the submit guardrails, and
// the unconfigured notice) read through a shared ErrorCopy instead of
// hardcoded literals. {status}/{seconds} placeholders are swapped by the
// call sites.
interface ErrorCopy {
	credentialError: string;
	timeTakenError: string;
	invalidEmailError: string;
	timeNoLongerAvailableError: string;
	networkError: string;
	submitTimeoutError: string;
	// W1-06-F-06-1 fix: distinct copy for a response body that fails JSON
	// parsing (HTML error page, proxy junk, truncated chunk) — the
	// MALFORMED_JSON_ERROR sentinel must never reach the visitor verbatim.
	malformedResponseError: string;
	// W1-06-F-06-3 fix: dedicated copy for 400-class machine-readable
	// codes (BAD_REQUEST / VALIDATION_ERROR) — the visitor's own answers
	// were rejected, so tell them to check and retry.
	badRequestError: string;
	emptyResponseError: string;
	httpStatusTemplate: string;
	slotsTimeoutError: string;
	slotsNotFoundError: string;
	slotsRateLimitTemplate: string;
	slotsRateLimitGenericError: string;
	slotsUnavailableError: string;
	slotsFallbackError: string;
	// W2-25-F10 fix: proactive offline check — both fetch paths surface
	// this instead of wasting a doomed request on a dead connection.
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

// W1-16-N1 fix: `Intl.DateTimeFormat` construction is NOT cached by modern
// engines (V8 removed its internal string-keyed cache ~2020) and every
// construction does genuinely per-call work. The tz-aware helpers below are
// on the hot path — `getMinutesInTimeZone`/`getDateKeyInTimeZone` run once
// per slot on every Cal.com fetch settle (dozens–hundreds of times) and
// per-cell on every CalendarGrid render (~42–84 invocations) — so they
// allocated a fresh formatter every call. This keyed cache reuses one
// instance per (locale, options) shape. The set of distinct shapes is tiny
// and bounded by the timezones the author exposes (≤ a handful in practice),
// so the map stays small (~1–4 KB) with no eviction needed.
const dtfCache = new Map<string, Intl.DateTimeFormat>();
function getCachedDateTimeFormat(
	locale: string,
	options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
	const key = `${locale}|${JSON.stringify(options)}`;
	let dtf = dtfCache.get(key);
	if (!dtf) {
		dtf = new Intl.DateTimeFormat(locale, options);
		dtfCache.set(key, dtf);
	}
	return dtf;
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
		// hourCycle "h23" can still format midnight as "24" on some engines;
		// normalize into a 0–1439 minutes-since-midnight range.
		return ((h % 24) * 60 + m) % 1440;
	} catch {
		// Invalid/unsupported timeZone string — fall back to local time
		// rather than throwing.
		return date.getHours() * 60 + date.getMinutes();
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
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
		2,
		"0",
	)}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// W1-09-DT-TzToday fix: "today" must be the current date IN THE VISITOR'S
// CHOSEN TIMEZONE, not the browser's local date — a browser far ahead of /
// behind the chosen zone otherwise treats tz-locally-today slots as
// elapsed/past and paints the wrong calendar day as "today" (cascades into
// isTimeElapsed, isToday and the past-date guards).
//
// W1-09-NEW-01 fix: the previous version returned a local-midnight Date whose
// LOCAL y/m/d equaled the visitor-tz date. But calendar cells are
// local-midnight Dates whose *visitor-tz date* (getDateKeyInTimeZone) is their
// grid identity — with the browser ≠ the visitor tz, the two coordinate
// systems disagree by up to 26h (Kiritimati UTC+14 vs Baker UTC-12), so
// isSameDay(today, cell) marked the wrong cell "today" and every
// startOfDay(cell) < today past-guard inherited the off-by-one. Now `today`
// is the local-midnight instant whose visitor-tz key EQUALS today's
// visitor-tz key — i.e. it lives in exactly the same coordinate system as
// the grid cells, so isSameDay/startOfDay comparisons (CalendarGrid
// isToday/isPast, isTimeElapsed, moveFocus / handleDateSelect past-guards,
// firstAvailableDate, activeDateKey) are all correct for any
// browser/visitor tz pair.
function getTodayInTimeZone(timeZone: string | undefined): Date {
	const tz = timeZone || "";
	const tzKey = getDateKeyInTimeZone(new Date(), tz);
	const parts = tzKey.split("-").map(Number);
	const y = parts[0] ?? 1970;
	const m = parts[1] ?? 1;
	const d = parts[2] ?? 1;
	// Candidate starts at the local-midnight of the tz date's y/m/d; the
	// loop nudges it (±1 day) until its visitor-tz key matches tzKey. The
	// worst-case drift between two real-world zones is 26h, so this
	// converges within 2 iterations; the guard caps it at 3.
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

// CAL-ADJ-INDICATOR: single shared source for the adjacent-month indicator in
// BOTH directions (leading previous-month cells AND trailing next-month
// cells). Returns the compact uppercase month abbreviation ONLY for the
// first RENDERED date of an adjacent month (grid index 0, the first cell
// after a month boundary, or the first non-placeholder cell after skipping
// same-month empty leading blanks); null everywhere else, so in-month dates
// never carry it. Callers gate on eligibility themselves: already-selected
// dates must not show it.
function getAdjacentMonthAbbreviation(
	cells: Date[],
	index: number,
	isPlaceholder: (date: Date) => boolean,
): string | null {
	const date = cells[index];
	if (!date) return null;
	let i = index - 1;
	while (
		i >= 0 &&
		cells[i] &&
		cells[i].getMonth() === date.getMonth() &&
		isPlaceholder(cells[i])
	) {
		i -= 1;
	}
	const prev = i >= 0 ? cells[i] : undefined;
	if (prev && prev.getMonth() === date.getMonth()) return null;
	return date
		.toLocaleDateString(pageLocale(), { month: "short" })
		.toUpperCase();
}

// RADIUS-INNER: numeric px value of the shared Radius token (the engine
// sanitizes to "0px".."24px" strings; parse defensively).
function parseRadiusNumber(value: string | number | undefined): number {
	const raw = typeof value === "number" ? value : parseFloat(String(value ?? ""));
	return Number.isFinite(raw) ? raw : 0;
}

// RADIUS-INNER: geometric rule — a surface inset by a known padding inside an
// outer radius must derive its own radius as outerRadius − inset (never
// negative). Used by the 12h/24h segmented control (3px outer padding).
function innerRadiusValue(
	value: string | number | undefined,
	inset: number,
): string {
	return `${Math.max(0, parseRadiusNumber(value) - inset)}px`;
}

// FIELD-STYLES helper: Framer's Font control emits fontSize as a number OR a
// CSS string ("14px"). Returns the numeric pixel size, or undefined when the
// key is unset so callers can fall back to their own defaults per key.
// Non-positive sizes also resolve to undefined: a 0px font is never an
// intentional style, and treating it as unset keeps activation-time
// materialization from blanking text.
function fontPixelSize(value: string | number | undefined): number | undefined {
	if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : undefined;
	if (typeof value === "string") {
		const parsed = Number.parseFloat(value);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
	}
	return undefined;
}

// =============================================================================
// FIELD-STYLES (native compound controls): resolvers for the new Border /
// BorderRadius / Padding control values. Every resolver keeps the LEGACY
// scalar keys working (instances saved before the compound controls existed)
// and falls back to the engine theme when nothing is set — untouched fields
// keep rendering byte-identically to the pre-compound default look.
// =============================================================================

/** Resolve the effective border (width / style / color) from the NEW compound
 *  Border control value, falling back to the LEGACY borderWidth/borderColor
 *  scalars. `color` is undefined when the author left it untouched — the call
 *  site then applies the engine theme (or the error color, which always wins
 *  for visibility). */
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

/** Resolve the effective radius: NEW compound BorderRadius string ("12px" or
 *  four per-corner values) wins, the LEGACY number (px) comes next, and the
 *  engine theme radius is the untouched default (theme token may be a number
 *  or a CSS string). Per-type fallback uses getFieldStylesEffectiveDefaults. */
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

/** Resolve the effective padding: NEW compound Padding string ("10px 14px",
 *  CSS shorthand order) wins, the LEGACY vertical/horizontal number pair
 *  comes next, then the per-type effective default (STYLES-INIT-EFFECTIVE:
 *  same constant the Styles control's defaultValue uses, now per field type). */
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

// FIELD-STYLES (override layer): normalize + merge helpers. One reusable
// mechanism for every field type, not per-type hacks.
//
// normalizeStyleOverrides strips values that can never be a real explicit
// choice, so Framer activation-time materialization can never sneak one
// past the theme fallbacks: empty-string colors ("" paints nothing, so
// every consumer's ?? fallback is the honest render). Real values pass
// through untouched, including explicit 0 and "0px" for padding, radius,
// border width, and spacing, which stay live overrides through the ??
// and typeof resolvers. Non-positive font sizes are already unset by
// fontPixelSize above.
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

// Legacy merge: variant-specific Styles keys (segmentedStyles and friends)
// take precedence per property over the shared legacy choiceStyles object,
// so instances saved before the per-variant split keep every override live.
// Granularity is per property: only keys set on the variant object win; the
// rest keep inheriting from the legacy object, then from the engine theme.
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

// CAL-BG-OWNERSHIP: the calendar surface's own default background. The
// Calendar Widget owns its background through the marker field's Styles
// submenu (`calendarStyles.backgroundColor`); the global Background token no
// longer reaches the calendar. An UNCONFIGURED calendar keeps rendering the
// exact look it always had in the default theme (white), so opening its
// Styles submenu never changes its appearance, and a customized value
// replaces this default only when the author actually sets one. The
// navigation/footer wrapper stays transparent regardless (FOOTER-TRANSPARENT).
const DEFAULT_CALENDAR_SURFACE_BACKGROUND = "#FFFFFF";

// COLOR-SYSTEM (AGENTS.md rules 1-3/70/71 + rule 90): the author-facing
// palette is FIVE independent controls (Accent, Primary Foreground, Surface,
// Text, Border). The removed controls are handled internally:
//   - Text Secondary = Text at a fixed 0.62 alpha via withAlpha (composites
//     onto whatever surface it lands on).
//   - Success = one fixed internal green (pure positive-validation marker).
//   - Error = one fixed internal red (validation/booking-critical states;
//     semantic meaning should not be re-branded per control).
// The ratios and fixed colors are FIXED DESIGN DEFAULTS chosen by the
// component — never contrast calculations, never validation, never
// auto-correction (rules 1-3). There is NO Background control: the engine
// root is deliberately transparent (the Framer frame provides the page
// background) and the calendar owns its own surface (CAL-BG-OWNERSHIP), so
// a Background control had no honest purpose — its removal is what keeps
// every exposed color's semantic mapping exact (rule 90).
const DERIVED_SECONDARY_TEXT_ALPHA = 0.62;
const DERIVED_SUCCESS_COLOR = "#15803D";
const FIXED_ERROR_COLOR = "#DC2626";

// STYLES-INIT-EFFECTIVE (rule 90, refining rule 87): the per-field Styles
// controls MUST carry defaultValue(s) equal to the field's effective default
// for that control set. Framer materializes untouched nested controls as
// zero/empty values the moment the author activates the optional Styles
// object — a defaultValue-free control therefore snaps the field to 0
// padding / 0 radius on activation (the original STYLES-INIT bug). With
// effective-default defaults, the materialized object renders IDENTICALLY
// to the inherit path, so activating Styles never changes the appearance,
// the panel shows the field's real defaults (16px shows 16px), and only an
// author-entered value becomes an override. Explicit 0 stays 0: the runtime
// resolvers distinguish set/unset with `??` and typeof checks — never
// falsy `||` checks (an explicit 0, "0px", or empty color is applied as
// entered). These constants are the SINGLE source of truth shared by the
// resolvers below and the control factories (one reusable mechanism, not
// per-field hacks).
// PADDING-FOUR-VALUE fix: the geometry above is the historical two-value
// shorthand written out longhand (top right bottom left — identical box).
// Framer's Padding control drops two-value defaultValues to 0 on
// activation (single-value Radius and Number defaults materialize fine),
// so a text field snapped 10/14 → 0 the moment Styles was enabled. The
// four-value form materializes correctly; the runtime parsers
// (paddingHorizontalFrom/paddingAxesFrom) read parts[0]/parts[1], which
// are unchanged, so unconfigured rendering is byte-identical.
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
// Matches the shipped shared Radius default (rule 60) and the authored
// Border control default below, so a materialized field value equals the
// inherit look under default authoring.
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

// =============================================================================
// Shared SegmentedControl — single moving-thumb implementation for all
// segmented controls (Calendar Time Format 12h/24h and BookingEngine
// segmented choice variant). Uses an absolutely positioned thumb that
// animates via transform, supporting arbitrary option counts.
// =============================================================================
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
	// FIELD-STYLES: optional per-field overrides (choice segmented variant).
	// Undefined keeps the engine-default look; the 12h/24h toggle never
	// passes them. Segment labels stay font-weight 600 in every state
	// (shared-thumb rule, AGENTS.md rule 80).
	trackBackground?: string;
	thumbBorderColor?: string;
	optionPaddingX?: number;
	optionFont?: FramerFont;
	/** DECOR: track shadow/blur (segmented choice variant). */
	trackShadow?: string;
	trackBlur?: number;
}

const SegmentedControl = React.memo(function SegmentedControl(props: SegmentedControlProps) {
	const { options, value, onChange, borderRadius, textColor, mutedTextColor, backgroundColor, borderColor, ariaLabel, disabled, trackBackground, thumbBorderColor, optionPaddingX, optionFont, trackShadow, trackBlur } = props;
	const isStaticRender = useIsStaticRenderer();
	const prefersReducedMotion = useReducedMotion();
	const count = options.length;
	const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
	const segmentInnerRadius = innerRadiusValue(borderRadius, 3);
	const thumbWidth = count > 0 ? `calc((100% - 6px) / ${count})` : "calc(50% - 3px)";
	// FIELD-STYLES: the track normally derives from the border color; an
	// explicit per-field Background override replaces it verbatim.
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
				// DECOR: track shadow/blur only when configured.
				...shadowStyle(trackShadow),
				...backdropStyle(trackBlur),
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
						key={opt.value}
						ref={(node) => {
							buttonRefs.current[idx] = node;
						}}
						type="button"
						aria-pressed={active}
						disabled={disabled}
						onClick={() => !disabled && onChange(opt.value)}
						onKeyDown={(e) => {
							// A11Y-KEYS: arrows/Home/End move FOCUS only —
							// they never commit (selection-follows-focus is
							// a radiogroup/tablist contract, not a group of
							// presses). Commit happens via Enter/Space
							// (native button activation) or click.
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
							// Shared-thumb rule: 600 in active AND inactive
							// states — never weight-switched (AGENTS.md rule 80).
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

// =============================================================================
// Inlined ChoiceGroup — adapted with `controlledValue` (Section 9.1)
// =============================================================================
// Source: ChoiceGroup.tsx. Only addition: an optional `controlledValue` prop.
// When provided, the parent owns the selected value and the component becomes
// a controlled input — required for sessionStorage restore and "Try Again"
// data preservation. When omitted, behavior is identical to the original
// (uncontrolled, seeded by `defaultValue`).

interface ChoiceOption {
	label: string;
	// W1-08-F-08-06 fix: a distinct value lets authors disambiguate
	// duplicate labels ("Apple" twice) — the round-trip selection now
	// matches on value (or the label when absent). Defaults to `label`
	// when unspecified, so single-label configs behave exactly as before.
	value?: string;
	glyph?: string;
	// T10-L4 fix: cards/radio options can carry an image and a description
	// (parallel per-field arrays in the panel, see optionImages/
	// optionDescriptions on FieldConfig).
	image?: string;
	description?: string;
	// FINAL-50 fix: per-option disabled support (runtime + code-override
	// surface; the fixed panel schema doesn't author it). Disabled options
	// render greyed with aria-disabled, are skipped by roving-focus moves,
	// and reject selection.
	disabled?: boolean;
}

// W1-08-F-08-06 fix: resolves an option's round-trip value — its explicit
// `value` when authored, else the label.
function optionValue(option: ChoiceOption): string {
	return option.value !== undefined && option.value.length > 0
		? option.value
		: option.label;
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
	// PRIMARY-FOREGROUND: semantic On-Primary for selected options rendered
	// on the Primary surface. Falls back to the legacy constant.
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
	/** W1-08-CG-04 fix: the CC-7 pass-through of the real field label
	 *  (which fixed the harmful accessible name) also materialized the
	 *  in-component VISIBLE label, duplicating the label already rendered
	 *  above the field by FieldRenderer's labelEl. `showLabel={false}`
	 *  suppresses that duplicate copy; the radiogroup aria-name is
	 *  unaffected. */
	showLabel?: boolean;
	/** W1-10-A1 fix: marks the radiogroup container (and every option
	 *  button) as required, mirroring the native-input required semantics.
	 *  W1-10-A16: the option buttons previously never saw it. */
	required?: boolean;
	/** W1-20-N1 fix: while the engine is POSTing, every option button and
	 *  keyboard path is frozen — an edit made after the payload snapshot
	 *  would land in React state but NOT in the in-flight request, and
	 *  silently vanish on success. */
	isSubmitting?: boolean;
	onChange?: (value: string) => void;
	// FIELD-STYLES: optional per-field overrides (AGENTS.md rule 83).
	// Undefined values keep the existing engine-theme look exactly; only
	// keys the author set in the field's Styles submenu take effect.
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
	/** DECOR: option shadow/blur layers (pills/cards/radio buttons and
	 *  the segmented track). Undefined/“none”/0 = untouched. */
	optionShadow?: string;
	optionBlur?: number;
	/** Segmented variant only: track surface override (thumb uses
	 *  selectedBackgroundColor via backgroundColor). */
	trackBackground?: string;
}

function getInitialSelection(
	options: ChoiceOption[],
	defaultValue: string,
): string {
	if (options.length === 0) return "";
	// W1-08-F-08-06 fix: match on value-or-label so a `value`-keyed option
	// is honored by the seed (label stays the fallback for configs that
	// don't set `value`).
	const match = options.find((option) => optionValue(option) === defaultValue);
	if (match) return optionValue(match);
	// W2-39-M8 fix: an empty-label option must never auto-win the initial
	// selection just by being first — a required choice field would start
	// "answered" with "" and skip validation entirely. Skip empty labels;
	// only fall back to a real option.
	const fallback = options.find((option) => option.label.length > 0);
	return fallback ? optionValue(fallback) : "";
}

// T9-L2 fix: weekday labels derive from the locale like the month header,
// rotated to start on firstDayOfWeek. Module-level so every instance of
// DateAndTimeInline shares one implementation (the per-instance memo
// below only caches the firstDayOfWeek result).
function buildWeekdayLabels(firstDayOfWeek: number): string[] {
	const base = new Date(2023, 0, 1); // a known Sunday
	const labels: string[] = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(base);
		d.setDate(base.getDate() + ((firstDayOfWeek + i) % 7));
		labels.push(d.toLocaleDateString(pageLocale(), { weekday: "short" }));
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
		// FIELD-STYLES: per-field overrides (undefined = engine default).
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
		optionBlur,
		trackBackground,
	} = props;

	// W1-18-F1 fix: choice option hover/selection CSS transitions gated on
	// prefers-reduced-motion.
	const reducedMotion = useReducedMotion();

	const rootRef = React.useRef<HTMLDivElement | null>(null);
	const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

	// Fix #22: prefer a direct options array (no comma round-trip) when provided.
	const parsedOptions = React.useMemo(
		() => directOptions || parseOptionsText(optionsText),
		[directOptions, optionsText],
	);

	const [measuredWidth, setMeasuredWidth] = React.useState<number>(320);
	// PRERENDER-DEFER: gate for the width-measurement layout effect below.
	const beInteractive = useBeInteractive();
	const [internalSelected, setInternalSelected] = React.useState<string>(() =>
		controlledValue !== undefined ? getInitialSelection(parsedOptions, controlledValue) : getInitialSelection(parsedOptions, defaultValue),
	);
	const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
	const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
	const firedInitialRef = React.useRef(false);
	// W1-08-F-08-04 fix: tags the label of the last USER-initiated pick so
	// the external-change focus effect can tell it apart from parent-side
	// updates.
	const lastUserPickRef = React.useRef<string | null>(null);

	// Controlled-vs-uncontrolled source of truth.
	// W1-08-CG-01 fix: controlled mode with a value that matches no option
	// (author renamed/removed an option after it was selected, or during
	// live editing) left `selected` dangling — no button was marked
	// checked AND no button kept a tab stop (`!selected` fell through on
	// every index): a keyboard focus trap plus an aria-checked/visual
	// desync against the parent's stored value. Fall back to the first
	// option for PRESENTATION only — the parent's value stays untouched
	// until an explicit pick, so required-field validation still works.
	// SYN-10 fix: `selected` is the PRESENTATION value — when a controlled
	// value matches no option it falls back to the first option's label so
	// tabIndex/aria-checked/visual state stay coherent. The hidden form
	// input must NOT copy that fallback: it would submit the first option's
	// label while the parent's React state holds a different value, so it
	// binds `formValue` (the real controlled value) instead.
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
	// A11Y-ROVING: the single tab stop skips disabled options — a
	// disabled Tab stop is focusable but inoperable, with no spoken
	// reason, and moveFocus already skips them on arrows. Selected (when
	// enabled) wins, else the first enabled option; -1 when every option
	// is disabled (nothing operable left to stop on).
	const tabbableOptionIndex = (() => {
		const selIdx = parsedOptions.findIndex(
			(o) => optionValue(o) === selected && !o.disabled,
		);
		if (selIdx >= 0) return selIdx;
		return parsedOptions.findIndex((o) => !o.disabled);
	})();

	React.useEffect(() => {
		// Only re-seed internal state when uncontrolled.
		if (controlledValue !== undefined) return;
		const next = controlledValue !== undefined ? getInitialSelection(parsedOptions, controlledValue) : getInitialSelection(parsedOptions, defaultValue);
		React.startTransition(() => setInternalSelected(next));
	}, [defaultValue, parsedOptions, controlledValue]);

	// T6-M3 fix: while controlled, `internalSelected` is not the source of
	// truth, so it silently went stale — if the parent later returned to
	// uncontrolled (controlledValue back to undefined), the component
	// resumed from a bogus seed instead of the last controlled selection.
	// Keep it in lockstep with the latest controlled value so an
	// uncontrolled fallback (or a remount reusing these refs) is correct.
	React.useEffect(() => {
		if (controlledValue === undefined) return;
		if (parsedOptions.length === 0) return;
		const next = getInitialSelection(parsedOptions, controlledValue);
		// W1-08-F-08-12 fix: skip the write when the controlled value
		// already equals the current selection — the old unconditional
		// startTransition re-rendered the parent for a no-op.
		if (next === internalSelected) return;
		React.startTransition(() => setInternalSelected(next));
	}, [controlledValue, parsedOptions, internalSelected]);

	// W1-08-F-08-04 fix: when the controlled value changes from OUTSIDE
	// (Reset, cross-field auto-select, re-entering the step), the roving
	// tabIndex moved to the new button but DOM focus stayed on the old one
	// — now unreachable via Tab, stranding keyboard/SR users. `selectOption`
	// tags user picks, so this only fires for external changes. Focus is
	// deferred a frame: the re-render must land before the button is
	// queried, and the cleanup cancels it if the group re-renders again.
	React.useEffect(() => {
		if (controlledValue === undefined) return;
		if (lastUserPickRef.current === controlledValue) {
			lastUserPickRef.current = null;
			return;
		}
		// W1-08-F-08-06 fix: match by value-or-label to honor `value`-keyed
		// options.
		const idx = parsedOptions.findIndex(
			(option) => optionValue(option) === controlledValue,
		);
		// W1-08-F-08-05 fix: when the controlled value matches NO option
		// (author renamed/removed it, or a stale restore), the old code
		// early-returned here — but the presentation fallback already flipped
		// button 0's tabIndex to 0 and the previously-focused button to -1,
		// stranding DOM focus on an unreachable button until a mouse click.
		// Fall through to focusing index 0 so keyboard users can still Tab in.
		if (idx < 0 && parsedOptions.length === 0) return;
		const focusIdx = idx >= 0 ? idx : 0;
		const focusRaf = requestAnimationFrame(() => {
			buttonRefs.current[focusIdx]?.focus();
		});
		return () => cancelAnimationFrame(focusRaf);
	}, [controlledValue, parsedOptions]);

	// W1-08-CG-10 fix: when the author shrinks the options while a later
	// option had focus (live editing in Framer), that button unmounts and
	// focus silently falls to <body> with no recovery. Clamp the focus/
	// hover indices to the surviving length and restore focus to the last
	// valid button instead.
	React.useEffect(() => {
		let focusRaf = 0;
		if (focusedIndex !== null && focusedIndex >= parsedOptions.length) {
			const clamped = Math.max(0, parsedOptions.length - 1);
			if (parsedOptions.length === 0) {
				setFocusedIndex(null);
			} else {
				setFocusedIndex(clamped);
				// W2-30-F4 fix: cancellable frame — the effect cleanup
				// below invalidates it if the group re-renders/unmounts.
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

	// T6-L2 fix: the one-shot mount onChange must re-fire when the author
	// edits the options (parsedOptions identity changes) - otherwise the
	// parent's value keeps the stale first option forever in uncontrolled
	// mode. Declared BEFORE the mount effect so the reset lands first and
	// the one-shot effect below observes the fresh flag.
	React.useEffect(() => {
		if (parsedOptions.length > 0) {
			firedInitialRef.current = false;
		}
	}, [parsedOptions]);

	// Fix #1: when uncontrolled, fire onChange once on mount so the parent's
	// `values[field.id]` matches the visually-highlighted first option. Without
	// this, a required choice field shows an option highlighted but fails
	// validation because the parent never received the value.
	React.useEffect(() => {
		if (firedInitialRef.current) return;
		if (controlledValue !== undefined) return;
		if (parsedOptions.length === 0) return;
		firedInitialRef.current = true;
		// W1-08-CG-02 fix: compute the seed synchronously instead of
		// reading `internalSelected` — the re-seed effect updates that
		// state via React.startTransition (async), so this effect fired
		// the PREVIOUS options' value on every options edit (author
		// tweaks options in Framer), re-stamping the parent's stored
		// value with a stale label.
		onChange?.(controlledValue !== undefined ? getInitialSelection(parsedOptions, controlledValue) : getInitialSelection(parsedOptions, defaultValue));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parsedOptions, controlledValue, defaultValue]);

	useIsomorphicLayoutEffect(() => {
		// PRERENDER-DEFER: width measurement is environment-dependent —
		// the prerender browser's viewport baked ITS width into the
		// served HTML while every client starts at the 320px guess
		// (#418 attribute mismatches on the option wrappers). Defer the
		// measurement to interactive clients; the guess is
		// server-identical everywhere.
		if (!beInteractive) return;
		if (
			typeof window !== "undefined" &&
			typeof ResizeObserver !== "undefined"
		) {
			if (!rootRef.current) return;
			// W1-19-F-12 fix: the state starts at a guessed 320px, so the
			// first paint (before the ResizeObserver's first callback lands)
			// laid out with the guess and visibly reflowed a frame later.
			// Reading the real width synchronously here — layout effects run
			// before paint — makes even the very first frame correct.
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

	// W1-11-A11 fix: the window listeners below were duplicated here,
	// re-implementing the shared T7-M3 `useKeyboardModality` hook.
	// W1-11-NEW-FIND-2 fix: that hook (and this call) is gone now —
	// focus indication comes from the CSS :focus-visible rule alone.

	// W1-11-NEW-FIND-2 fix: focus indication is standardized on the CSS
	// `:focus-visible` rule (`.be-motion-root :is(button, a)` / `.be-input:focus-visible`) —
	// the per-component inline boxShadow focus rings (this one keyed on
	// isKeyboardModality) were removed. The selection ring below stays:
	// it marks SELECTED state, not focus.
	// PRIMARY-FOREGROUND: foreground for options rendered on the Primary
	// (Accent) surface — semantic token, not a hard-coded white assumption.
	// FIELD-STYLES: the per-field Selected Text override wins when set; the
	// per-field Font control's size replaces the historical 14px floor only
	// when the author explicitly set it.
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

	// W1-08-F-08-06 fix: selection is written as the option's VALUE
	// (falling back to the label when no explicit value is authored). The
	// old label-only write-side collapsed duplicate labels onto a single
	// round-trip key — clicking the second "Apple" re-mapped to the first
	// via `selectedIndex` and the visual ring snapped back.
	const selectOption = React.useCallback(
		(option: ChoiceOption) => {
			// W1-20-N1 fix: a pick after the POST snapshot would update
			// React state but never the in-flight payload — silently lost
			// on success. Block all selection during submission.
			if (isSubmitting) return;
			// FINAL-50 fix: per-option disabled — reject selection.
			if (option.disabled) return;
			const value = optionValue(option);
			// W1-08-F-08-04 fix: tag user-initiated picks so the external-
			// change focus effect below doesn't fight the user's own focus.
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
			// FINAL-50 fix: skip disabled options when roaming. After a full
			// loop with nothing selectable, stay put instead of spinning.
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
			// FINAL-44 fix: defense-in-depth Space capture — native <button>
			// already swallows it, but an explicit preventDefault guarantees
			// no page-scroll/leak on any host.
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

	// W1-08-F-08-06 fix: index-based selection comparison (hoisted so the
	// segmented divider and the option buttons agree). Match by value-or-label
	// so two options sharing a label are distinguished by their distinct
	// `value`; the round-trip now lands on the option the user clicked.
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
		// W1-08-F-08-06 fix: `selected` is the label of the controlled
		// value; two options may legitimately share a label ("Apple"
		// twice). Label comparison made BOTH buttons aria-checked + both
		// tabIndex=0 (two tab stops, wrong roving state). Compare by the
		// controlled value's index in the options list instead.
		const isSelected = selectedIndex === index;
		// T10-L4 fix: images/descriptions render on cards (and radio rows);
		// pills/segmented stay compact text-only.
		const showMedia = variant === "cards" || variant === "radio";
		return (
			/* biome-ignore lint/a11y/useSemanticElements: intentional custom radio
	       button — a native <input type="radio"> cannot carry the
	       card/pill/segmented visual system. The full radiogroup contract
	       (roving tabindex, arrow-key navigation, aria-checked) is
	       implemented below, so SR/keyboard behavior is equivalent. */
			<button
				// W1-08-F-08-06 fix: duplicate labels collided as React
				// keys; index-suffixed keys stay unique.
				key={`${option.label}-${index}`}
				ref={(node) => {
					buttonRefs.current[index] = node;
				}}
				type="button"
				role="radio"
				aria-checked={isSelected}
				// W1-20-N1 fix: freeze the radiogroup during submission —
				// the disabled attribute drops the group from the tab order
				// and blocks all interaction (the selectOption guard above
				// is defense-in-depth for keyboard paths). Mirrors the
				// Back/Continue buttons' disabled + opacity pattern.
				// W1-10-OBS-5 fix: the parallel aria-disabled was redundant
				// with the native disabled attribute (and can make some SRs
				// announce the state twice); removed.
				// FINAL-50 fix: per-option disabled uses aria-disabled +
				// greyed styling INSTEAD of the native attribute — a native
				// disabled would remove it from the roving-tabindex set and
				// break arrow-key traversal past it.
				disabled={isSubmitting}
				aria-disabled={option.disabled || undefined}
				// T4-M6 fix: the option buttons previously carried
				// no invalid/describedby hints of their own - only
				// the radiogroup container did - so screen readers
				// focusing an option never heard the error
				// association. Propagate both to each button.
				aria-invalid={ariaInvalid || undefined}
				aria-describedby={ariaDescribedBy}
				// W1-10-A16 fix (revised, Biome a11y sweep): the
				// required hint now lives ONLY on the four
				// radiogroup containers (ARIA forbids aria-required
				// on individual radio roles — propagating it to each
				// option button was spec-invalid and screen readers
				// already hear the group-level requirement).
				// Fix #17: roving tabindex — exactly one enabled option is
				// tabbable (selected when enabled, else first enabled);
				// Arrow keys move focus between options (skipping disabled).
				tabIndex={index === tabbableOptionIndex ? 0 : -1}
				// W1-08-F-08-06 fix: pass the option object (not just its
				// label) so selectOption resolves the `value` round-trip.
				onClick={() => selectOption(option)}
				onKeyDown={(event) => handleKeyDown(event, index)}
				onMouseEnter={() => React.startTransition(() => setHoveredIndex(index))}
				onMouseLeave={() => React.startTransition(() => setHoveredIndex(null))}
				onFocus={() => React.startTransition(() => setFocusedIndex(index))}
				onBlur={() => React.startTransition(() => setFocusedIndex(null))}
				style={{
					// HEIGHT-REMOVED: fixed 23px floor like inputs (was the
					// 44px touch floor) — option height grows via the
					// variant Padding now. Stored legacy `minHeight` wins.
					minHeight: optionMinHeight ?? 23,
					// FINAL-51 fix: width floor too — very short labels ("A",
					// "1") previously produced hair-thin tap targets.
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
					// W1-11-NEW-FIND-1 fix: the inline `outline: "none"`
					// here outranked (by CSS specificity) the scoped
					// `.be-motion-root :is(button, a):focus-visible + the .be-input inset ring`
					// rule, so the ONLY focus indicator was the modal
					// boxShadow below — leaving a 1-frame window with NO
					// visible indicator while keyboard-modality detection
					// races. Removing it lets the CSS `:focus-visible`
					// outline provide the always-on keyboard ring
					// (currentColor adapts; pointer clicks stay clean
					// because :focus-visible doesn't match them).
					// W1-11-NEW-FIND-1 fix: the inline `outline: "none"`
					// here outranked (by CSS specificity) the scoped
					// `.be-motion-root :is(button, a):focus-visible + the .be-input inset ring`
					// rule; removing it lets the CSS `:focus-visible`
					// outline provide the always-on keyboard ring
					// (currentColor adapts; pointer clicks stay clean
					// because :focus-visible doesn't match them).
					// W1-11-NEW-FIND-2 fix: the inline boxShadow focus
					// indicator (gated on isKeyboardModality) was removed —
					// focus rings now come solely from that CSS rule. The
					// remaining ring marks SELECTED state only.
					// DECOR: author shadow layers UNDER the selected-state
					// ring (comma-composed); "none"/unset adds nothing.
					boxShadow: [
						isSelected ? `inset 0 0 0 1px ${selectedRing}` : null,
						!isNoShadowValue(optionShadow) && optionShadow
							? optionShadow
							: null,
					]
						.filter(Boolean)
						.join(", ") || "none",
					...backdropStyle(optionBlur),
					fontFamily: optionFont?.fontFamily ?? "inherit",
					fontSize: effectiveFontSize,
					lineHeight: 1.2,
					...optionFontExtraStyle,
					overflow: "hidden",
					// W1-18-F1 fix: gated on prefers-reduced-motion.
					transition: reducedMotion
						? "none"
						: "border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease",
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
				{showMedia && option.image ? (
					<img
						src={option.image}
						alt=""
						aria-hidden="true"
						// FINAL-69 fix: browser-native off-thread loading.
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
						// W1-10-N8 fix: the glyph is decorative — the option
						// label carries the meaning. Without aria-hidden,
						// SRs read the emoji/symbol inconsistently per
						// platform ("bookmark", "raised hand", …).
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
								// W1-19-F-05/F-10 fix: long radio labels
								// were ellipsized on one line instead of
								// wrapping, which clipped real answers.
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
							// W1-19-F-05/F-10 fix: card/segmented labels
							// were one-lined with ellipsis — wrapping is
							// what keeps long option text readable. Pills
							// keep nowrap: they're short labels and wrap
							// would break the pill shape.
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
				// SYN-10 fix: bind the REAL controlled value, not the
				// presentation fallback (see `formValue` above).
				value={formValue}
				// W1-10-A12 fix: the form-state dump input was announced
				// by some screen readers as an editable text field; it is
				// transport only, so it is hidden from the accessibility
				// tree entirely.
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
				// W1-08-F-08-08 fix: with zero options the group used to
				// render an empty radiogroup — a dead box with no clue why.
				// Show an explanatory placeholder instead (validation still
				// fails correctly for required fields below it).
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
						// FIX: allow any number of cards to wrap naturally.
						// `columns` still adapts to width (2/3/5) but each card
						// keeps a readable min width so 5-6 options wrap to
						// 2-3 rows instead of crushing to unreadable widths.
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
					// FIELD-STYLES: Background → track, Selected BG → thumb,
					// Selected Border → thumb border, Radius → track radius
					// (the thumb derives −3 via innerRadiusValue). Text Color →
					// inactive segments, Selected Text → active segment.
					borderRadius={optionRadius ?? 16}
					textColor={selectedTextColor}
					mutedTextColor={textColor}
					backgroundColor={selectedSurface}
					trackBackground={trackBackground}
					thumbBorderColor={selectedRing}
					optionPaddingX={optionPaddingX}
					optionFont={optionFont}
					trackShadow={optionShadow}
					trackBlur={optionBlur}
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
							// FIX: allow any number of pills to wrap naturally.
							// Narrow (<420) keeps 2 per row for readability;
							// wide uses auto-sized pills that wrap as needed.
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
// =============================================================================
// T9-M1/T9-M6 fix: the 42-cell calendar grid used to define 6 inline
// handlers per cell (252 closures per render) and lived in the same scope as
// the time grid, so clicking a time slot re-rendered every cell. Both cells
// and the whole date-picker grid are now extracted as memoized components:
// hover/focus/time-selection only re-render what actually changed.
// =============================================================================

interface CalendarCellProps {
	date: Date;
	dateKey: string;
	isUnavailable: boolean;
	isSelected: boolean;
	isInMonth: boolean;
	// CAL-ADJ-INDICATOR: compact month abbreviation when this cell is the
	// first visible date of an adjacent month (either direction); null/absent
	// otherwise. Computed by the shared getAdjacentMonthAbbreviation helper.
	adjacentMonthLabel?: string | null;
	isToday: boolean;
	isRingHover: boolean;
	// ROVING-TABINDEX: exactly ONE selectable date per visible grid is the
	// roving tab stop (tabIndex 0); every other cell renders tabIndex -1.
	// Arrow/Home/End/PageUp/PageDown navigation moves focus between cells
	// without changing Tab order.
	isActive: boolean;
	firstDayOfWeek: number;
	locale?: string;
	// W1-19-N1 fix: narrow containers (≤~329px effective width) get
	// shrinkable grid tracks — the cell drops its hard 44px minWidth so
	// neighbors don't overlap (threaded from CalendarGrid's own isNarrow).
	isNarrow: boolean;
	// W1-07-F4 fix: when present, the cell is labeled with the visitor's
	// tz date (the same tz its slot-date keys use) instead of the
	// browser-local day-of-month.
	timeZone?: string;
	accentColor: string;
	borderColor: string;
	subtleFill: string;
	textColor: string;
	selectedAccentText: string;
	mutedSoftText: string;
	// F-17-3 fix: radius token cascaded so the cell follows the author's
	// borderRadius control instead of the hardcoded 6px.
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
	isInMonth,
	adjacentMonthLabel,
	isToday,
	isRingHover,
	isActive,
	firstDayOfWeek,
	locale,
	isNarrow,
	// W1-07-F4 fix: tz-aware cell label.
	timeZone,
	accentColor,
	borderColor,
	subtleFill,
	textColor,
	selectedAccentText,
	mutedSoftText,
	// F-17-3 fix: radius token (author's borderRadius control).
	borderRadius,
	onSelect,
	onMoveFocus,
	onGoToNextMonth,
	onGoToPreviousMonth,
	onHoverChange,
	onFocusChange,
}: CalendarCellProps) {
	// W1-18-F1 fix: the cell's CSS color/border transitions are gated on
	// prefers-reduced-motion (MotionConfig can't touch plain CSS).
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
				// W1-19-N1 fix: the F-01 grid tracks shrink to ~33–39px on
				// ≤329px viewports; a hard 44px minWidth then overlaps the
				// next cell (which paints over it, shrinking the EFFECTIVE
				// target anyway). On narrow containers the track itself is
				// the honest target — drop the floor so cells stay their
				// real size and nothing is covered.
				minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN,
			}}
		>
			<button
				type="button"
				disabled={isUnavailable}
				// W1-10-OBS-5 fix: the parallel aria-disabled was redundant
				// with the native disabled attribute; removed.
				// ROVING-TABINDEX: the native button keeps its own semantics
				// (no role override); the grid-cell state lives on the
				// wrapping div above, the interactive control stays a real
				// <button>. Exactly one selectable cell per grid exposes
				// tabIndex 0; the rest are -1 and reached via arrow keys.
				tabIndex={isUnavailable || !isActive ? -1 : 0}
				data-date-key={dateKey}
				// Focus-restore hooks live HERE on the focusable element —
				// moveFocus and the post-commit month-change effect call
				// .focus() directly on what they query.
				data-be-active-date={!isUnavailable && isActive ? "true" : undefined}
				aria-label={
					date.toLocaleDateString(locale, {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
						// W1-07-F4 fix: announce the date in the visitor's tz —
						// otherwise the aria label can still disagree with the
						// slots the cell shows. Invalid tz strings are already
						// filtered by isValidTimeZone (browser-local fallback).
						...(isValidTimeZone(timeZone) ? { timeZone } : {}),
					}) + (isToday ? " (Today)" : "")
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
						// W1-11-A2 fix: pass focusAfter=true so the
						// pendingMonthFocusRef effect re-focuses the new month's
						// active cell — previously focus fell to document.body
						// when the focused date button unmounted with the old
						// grid.
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
					// F-17-3 fix: was `6` — now the author's token.
					borderRadius,
					border: `1px solid ${isUnavailable ? "transparent" : borderColor}`,
					// W2-52 fix: ONLY the selected date gets the accent fill.
					// Today is a separate state (dot indicator below) — selecting
					// another date must never leave two highlighted cells.
					background: isSelected ? accentColor : isUnavailable ? "transparent" : subtleFill,
					color: isSelected ? selectedAccentText : isUnavailable ? mutedSoftText : textColor,
					cursor: isUnavailable ? "default" : "pointer",
					fontSize: 14,
					// W1-18-F1 fix: gated on prefers-reduced-motion.
					transition: reducedMotion
						? "none"
						: "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, color 0.16s ease",
					// W1-11-NEW-FIND-2 fix: focus indication is standardized on
					// the CSS `:focus-visible` rule — the isKeyboardModality
					// boxShadow focus branch is gone; these rings mark STATE
					// (selected / hover), never focus.
					boxShadow:
						isSelected || isRingHover
							? `inset 0 0 0 2px ${accentColor}`
							: "none",
					fontWeight: 500,
				}}

			>
				{/* W1-07-F4 fix: the visible day-of-month must match the
                    visitor-tz date the slots are bucketed under (CC-13
                    getDateKeyInTimeZone); with the browser >12h ahead/behind,
                    the old browser-local getDate() labeled "Dec 15" while
                    showing Dec 14 slots. slice(-2) = the zero-padded day. */}
				<span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
					{Number(getDateKeyInTimeZone(date, timeZone || "").slice(-2))}
					{adjacentMonthLabel && !isSelected ? (
						/* CAL-ADJ-INDICATOR: adjacent-month dates carry a
			   compact month abbreviation above the number (generic
			   — derived from the date's own month by the shared
			   helper, shown only on the first visible date of each
			   adjacent month in EITHER direction). */
						<span
							aria-hidden="true"
							style={{
								position: "absolute",
								top: 2,
								left: "50%",
								transform: "translateX(-50%)",
								fontSize: 8,
								fontWeight: 700,
								letterSpacing: "0.06em",
								textTransform: "uppercase",
								color: mutedSoftText,
								pointerEvents: "none",
								whiteSpace: "nowrap",
							}}
						>
							{adjacentMonthLabel}
						</span>
					) : null}
					{isToday && !isSelected ? (
						/* W2-52 fix: today's marker is a small dot beneath the
			   number — visually independent of the selected-date
			   fill AND of availability (TODAY-INDEPENDENT: today
			   stays on the real current date even when that day is
			   unavailable; Today / Selected / Available /
			   Unavailable are independent states). currentColor
			   keeps it legible in every state. */
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
				{/* CAL-ADJ-TOOLTIP: custom hover tooltip for AVAILABLE
                    adjacent-month dates only — unavailable/disabled adjacent
                    cells render no tooltip and receive no hover treatment at
                    all (the mouse handlers above already gate on
                    !isUnavailable). Purely decorative: aria-hidden, the
                    button's aria-label remains the screen-reader surface.
                    Text is the full month name only (never the year);
                    background follows the author's Accent token with the
                    component's fixed on-accent foreground. */}
				{!isInMonth && !isUnavailable ? (
					<span
						className="be-adj-tooltip"
						aria-hidden="true"
						style={{
							position: "absolute",
							bottom: "100%",
							left: "50%",
							transform: "translateX(-50%)",
							marginBottom: 6,
							// PRIMARY-FOREGROUND: tooltip sits on the Primary
							// (Accent) surface — semantic On-Primary token.
							background: accentColor,
							color: selectedAccentText,
							padding: "4px 8px",
							borderRadius: 4,
							fontSize: 12,
							fontWeight: 600,
							whiteSpace: "nowrap",
							pointerEvents: "none",
							opacity: 0,
							transition: reducedMotion ? "none" : "opacity 0.15s ease",
							zIndex: 10,
						}}
					>
						{date.toLocaleDateString(locale, {
							month: "long",
							...(isValidTimeZone(timeZone) ? { timeZone } : {}),
						})}
					</span>
				) : null}
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
	// W1-02-F9 fix: month-nav aria names are author-localisable templates;
	// {month} is replaced with the real target month's name.
	previousMonthAriaTemplate: string;
	nextMonthAriaTemplate: string;
	canGoPrev: boolean;
	canGoNext: boolean;
	weekdayLabels: string[];
	cells: Date[];
	visibleMonth: Date;
	selectedDate: Date | null;
	today: Date;
	hoveredDateKey: string | null;
	isNarrow: boolean;
	firstDayOfWeek: number;
	dateKeyOf: (date: Date) => string;
	hasAvailability: (date: Date) => boolean;
	// ROVING-TABINDEX: the key of the ONE selectable date that acts as the
	// grid's roving tab stop (tabIndex 0); all other cells render -1.
	activeDateKey: string | null;
	locale?: string;
	// W1-07-F4 fix: visitor-tz for cell labels (see CalendarCell).
	timeZone?: string;
	accentColor: string;
	borderColor: string;
	subtleFill: string;
	textColor: string;
	selectedAccentText: string;
	mutedSoftText: string;
	mutedText: string;
	// F-17-3 fix: radius token cascaded to cells + nav buttons.
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
	hoveredDateKey,
	isNarrow,
	firstDayOfWeek,
	dateKeyOf,
	hasAvailability,
	// ROVING-TABINDEX: single active (tabbable) date key.
	activeDateKey,
	locale,
	// W1-07-F4 fix: forwarded to cells for tz-aware labels.
	timeZone,
	accentColor,
	borderColor,
	subtleFill,
	textColor,
	selectedAccentText,
	mutedSoftText,
	mutedText,
	// F-17-3 fix: radius token.
	borderRadius,
	onPrevMonth,
	onNextMonth,
	onSelectDate,
	onMoveFocus,
	onHoverChange,
	onFocusChange,
}: CalendarGridProps) {
	// W1-10-A4 fix: stable id linking the grid to its month/year heading
	// (aria-labelledby). SSR/hydration fix: Framer serves real browsers a
	// headless-prerendered HTML where effects have ALREADY run, so ANY
	// INSTANCE-ISOLATION: was a plain constant, so two engines on one page
	// shared the same id (duplicate IDs). Now per-instance via the stable
	// reactInstanceId prefix ("" on first render of both server and client,
	// then "be-engine-1" etc. after effect), so each grid's label is unique.
	const gridLabelId = instanceId ? `${instanceId}-be-calendar-grid-label` : "be-calendar-grid-label";
	// MONTH-ANNOUNCE dedupe: the visible month/year header below carries the
	// role="status" live region that announces month changes; the former
	// SECOND sr-only region (plus its ref/state/effect) announced the exact
	// same "Month Year" string again — screen readers heard every page flip
	// twice. One announcement source remains.
	const [hoveredNav, setHoveredNav] = React.useState<"prev" | "next" | null>(null);
	const rows: React.ReactNode[] = [];
	for (let r = 0; r < CALENDAR_WEEKS_TO_RENDER; r++) {
		rows.push(
			/* biome-ignore lint/a11y/useFocusableInteractive: row is a structural
	       grouping only (display: contents) — focus lives on the cells
	       via the roving-tabindex contract; making the row tabbable would
	       add a dead stop. */
			// biome-ignore lint/a11y/useSemanticElements: see CSS-grid calendar note above.
			<div role="row" key={`row-${r}`} style={{ display: "contents" }}>
				{cells.slice(r * 7, r * 7 + 7).map((date, cIdx) => {
					const globalIdx = r * 7 + cIdx;
					const dateKey = dateKeyOf(date);
					const isInMonth = date.getMonth() === visibleMonth.getMonth();
					const isPast = startOfDay(date).getTime() < today.getTime();
					// W2-54 fix: adjacency is no longer a blanket
					// unavailability. Next/previous-month days inside the
					// visible grid behave like real dates — selectable when
					// availability exists (the slots fetch already covers the
					// month edges), disabled otherwise. `isInMonth` now only
					// drives the month-abbreviation indicator.
					// CAL-ADJ-SOURCE: `hasAvailability` is the SAME normalized
					// availability source used by the in-month view (the
					// parent's month-wide Cal.com slots, fetched with ±12-day
					// edge widening) — a previewed adjacent date shows exactly
					// the state it will have after navigating into its month.
					// Unknown/not-yet-fetched dates are unavailable, never
					// "available because rendered".
					const isUnavailable = isPast || !hasAvailability(date);
					const isSelected = isSameDay(selectedDate, date);
					const isToday = isSameDay(today, date);
					// W2-55 fix: LEADING cells from the previous month that
					// are past or have no availability render as EMPTY
					// gridcells — matching Cal.com, where irrelevant leading
					// days are blank while trailing next-month days continue
					// into the grid. Alignment (7 columns) is preserved by
					// keeping each placeholder in its track.
					const isEmptyLeadingCell =
						!isInMonth && date.getTime() < visibleMonth.getTime() && (isPast || !hasAvailability(date));
					if (isEmptyLeadingCell) {
					return (
						// A11Y: blank placeholders carry no state — the old
						// aria-disabled="true" announced meaningless noise.
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
					// CAL-ADJ-INDICATOR: one shared helper drives BOTH the
					// previous-month and next-month abbreviations — only the
					// first rendered date of each adjacent month carries one
					// (empty leading placeholders are skipped over).
					const adjacentMonthLabel = !isInMonth
						? getAdjacentMonthAbbreviation(
							cells,
							globalIdx,
							(candidate) =>
								candidate.getTime() < visibleMonth.getTime() &&
								(startOfDay(candidate).getTime() < today.getTime() ||
									!hasAvailability(candidate)),
						)
						: null;
					// ROVING-TABINDEX: exactly one selectable cell per grid
					// is the tab stop; unavailable cells are never active.
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
							isInMonth={isInMonth}
							adjacentMonthLabel={adjacentMonthLabel}
							isToday={isToday}
							isRingHover={isRingHover}
							isActive={isActive}
							firstDayOfWeek={firstDayOfWeek}
							locale={locale}
							// W1-19-N1 fix: pass the narrow flag through so
							// the cell can drop its 44px minWidth on
							// shrinkable tracks (no overlap on ≤329px).
							isNarrow={isNarrow}
							// W1-07-F4 fix: label cells in the visitor's tz.
							timeZone={timeZone}
							accentColor={accentColor}
							borderColor={borderColor}
							subtleFill={subtleFill}
							textColor={textColor}
							selectedAccentText={selectedAccentText}
							mutedSoftText={mutedSoftText}
							// F-17-3 fix: radius token.
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
	return (
		<>
			{/* CSS-NOTE: the .be-adj-tooltip hover/focus reveal rule is defined
                ONCE in RootShell's root <style> block (search "CSS-CONSOLIDATED")
                — this grid no longer injects a per-instance copy. */}
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
						// W1-10-A4 fix: the grid is now labelled BY this
						// heading via aria-labelledby instead of a detached
						// aria-label string.
						id={gridLabelId}
						// W1-09-DT-EmptyMonth fix: fallback focus target —
						// programmatically focusable so a fully-empty month
						// can land focus here instead of <body>.
						tabIndex={-1}
						data-be-month-heading
						style={{
							margin: 0,
							fontWeight: 700,
							fontSize: 16,
						}}
					>
						{/* W1-10-OBS-2 fix: the month/year header had no
                            live-region semantics — SR users paging the
                            calendar never heard the month change. This
                            wrapper gives the visible header itself status
                            semantics. MONTH-ANNOUNCE dedupe: this is now the
                            ONLY month-change announcement — the second
                            sr-only region that repeated the same string was
                            removed. */}
						{/* biome-ignore lint/a11y/useSemanticElements: intentional
                            polite status region (W1-10-OBS-2) — the visible
                            month/year header announces the month change; an
                            <output> would change the element's semantics. */}
						<span role="status" aria-live="polite" aria-atomic="true">
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
						</span>
					</h3>
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						// W2-46 fix: compact, subtle header controls — 24px buttons
						// with an 8px gap, visually quieter than the month title.
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
							// W2-46 fix: muted tone (60% text) so the arrows stay
							// secondary to the month title; disabled stays softer.
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
							// W2-46 fix: muted tone — matches the prev button.
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

			{/* MONTH-ANNOUNCE dedupe: the single live region is the visible
                    month/year header above (role="status"); the duplicate
                    sr-only region that re-announced the same string was
                    removed. */}

			{/* biome-ignore lint/a11y/useSemanticElements: CSS-grid calendar with the
               W3C grid role pattern — native <table> markup cannot host the
               display:grid / display:contents layout this component uses. */}
			<div
				// W1-10-A3 fix: the weekday header was a bare div row
				// OUTSIDE the role="grid" — screen readers traversing
				// "grid" semantics never saw its columns. It now lives
				// inside the grid as its first row of columnheaders
				// (display: contents keeps the CSS grid layout intact —
				// the cells stay direct grid items just like date rows).
				role="grid"
				aria-labelledby={gridLabelId}
				style={{
					display: "grid",
					// W1-19-F-01 fix: same shrink-to-fit treatment as the
					// weekday header row above (see comment there).
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

const SELECTED_SLOT_KEY = "__selectedSlot" as const;

interface BookingPayload {
	date: Date;
	time24h: string;
	timeLabel: string;
	/** Optional Cal.com slot end (ISO string) - used for ICS DTEND. */
	end?: string;
}

// T7-H1 / T7-M5 fix: the form's central state is no longer Record<string,
// any> - field values are strings/booleans, and `__selectedSlot` is a typed
// top-level member instead of a magic string read through unchecked casts.
type BookingValues = Record<string, string | boolean | undefined> & {
	[SELECTED_SLOT_KEY]?: BookingPayload;
};

// W1-15-TS-02 fix: boundary narrow for restore-time data entering typed
// state. `JSON.parse` output is `unknown`; every field value must be a
// string/boolean/undefined. (SELECTED_SLOT_KEY is exempt at the call site —
// it is the one structured key and is re-narrowed separately.)
function isFieldValue(v: unknown): v is string | boolean | undefined {
	return v === undefined || typeof v === "string" || typeof v === "boolean";
}

// W1-15-TS-14 fix: runtime guard for __selectedSlot at the sessionStorage
// boundary. JSON.parse never hands back Date instances, so `date` must be a
// non-empty ISO string here (it is rehydrated to a real Date immediately
// after this guard passes); `end` accepts undefined or a non-empty string.
// Before this guard existed the restore cast re-narrowed ONLY `date` —
// hostile storage could smuggle `time24h: 42`, `timeLabel: false`, `end: {}`
// through as BookingPayload-typed values, corrupting the ICS export and
// calendar deep links (and crashing SuccessScreen via `new Date({})`).
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

// T7-M3 fix: the time picker (format toggle + slot list) is now its own
// memoized component. DateAndTimeInline re-renders it only when
// time-related props change (format, hover, selection, slot data), so
// calendar interaction no longer rebuilds the slot list, and vice versa.
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
	mutedText: string;
	mutedSoftText: string;
	backgroundColor: string;
	loadingLabel: string;
	slotsLoading: boolean;
	selectedDate: Date | null;
	/** W2-51: the default/active date when nothing is selected yet (today) —
	 *  keeps the time header populated on first entry. */
	fallbackDate: Date;
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
	// F-17-3 fix: radius token.
	borderRadius: string | number;
	// W1-02-F9 fix: empty-state messages and the list/grid aria names are
	// copy-driven instead of hardcoded.
	pickDateToSeeTimesLabel: string;
	noTimesFallbackLabel: string;
	timeSlotsAriaLabel: string;
	availableTimesAriaLabel: string;
	/** W1-10-A1 fix: marks the slot radiogroup as required. The datetime
	 *  step always requires a picked slot, so callers pass `true`. */
	required?: boolean;
	/** W1-10-A13 fix: the visitor's chosen timezone, appended to each
	 *  slot's aria-label so AT users hear "3:00 PM, America/New_York"
	 *  instead of a bare wall-clock time with no zone context. */
	timeZone?: string;
	// W1-09-DT-SR fix: the formatted date for the currently shown day,
	// folded into each slot's aria-label.
	slotDateLabel?: string;
	// W1-10-N1 fix: the slot radiogroup is the one invalidatable control
	// that never got aria-invalid/aria-describedby. `slotError` is the
	// current error text, `slotErrorId` the id of the engine-level error
	// banner to point at (only meaningful while `slotError` is set).
	slotError?: string | null;
	slotErrorId?: string;
	// W1-10-N3 fix: group label for the 12h/24h time-format toggle.
	timeFormatLabel: string;
}

// W1-16-P-02 fix: the 17-48 slot buttons used to be inlined in
// TimeSlotList's map — every parent re-render (hover, typing elsewhere,
// 60s tick) rebuilt all of them. Extracted into a memo'd child whose
// props are all primitives/booleans plus stable callbacks (useState
// setters and useCallback'd handlers from DateAndTimeInline), so a slot
// re-renders only when its OWN state actually changed. `elapsed` is
// precomputed by the map (isTimeElapsed is rebuilt on the minute tick),
// keeping the memo's prop surface flat.
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
	selectedAccentText: string;
	// F-17-3 fix: radius token.
	radius: string | number;
	onSelect: (value: string) => void;
	setHoveredTime: (time: string | null) => void;
	setFocusedKey: (key: string | null) => void;
	// W1-11-A3 fix: when nothing is selected, exactly one slot must stay
	// tabbable (the first non-elapsed one), or the whole radiogroup is
	// unreachable by keyboard until a mouse click. ChoiceGroupInline
	// already falls back to its first option; this mirrors that.
	isInitialFocus: boolean;
	/** W1-10-A13 fix: chosen timezone for the aria-label (see
	 *  TimeSlotListProps.timeZone). */
	timeZone?: string;
	// W1-09-DT-SR fix: formatted date for the shown day.
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
		selectedAccentText,
		radius,
		onSelect,
		setHoveredTime,
		setFocusedKey,
		isInitialFocus,
		timeZone,
		// W1-09-DT-SR fix: date context for the label.
		slotDateLabel,
	} = props;
	// W1-18-F1 fix: gated on prefers-reduced-motion (same rationale as the
	// calendar cell).
	const reducedMotion = useReducedMotion();
	return (
		/* biome-ignore lint/a11y/useSemanticElements: intentional custom radio
	   button — a native <input type="radio"> cannot host the styled slot
	   pill, hover/selected states, and roving-tabindex contract (T5-H3/T5-M1). */
		<button
			type="button"
			// T5-H3 fix (continued): each slot is now a radio in
			// the group above, and T5-M1: only the currently
			// selected slot stays tabbable - arrows move it.
			role="radio"
			aria-checked={selected}
			// W1-10-A13 fix: name the slot with its zone so AT users
			// aren't left with a zone-less wall-clock time.
			// W1-09-DT-SR fix: the date is folded in too — SR users now
			// hear "9:00 AM, Tue, Aug 16, America/New_York".
			aria-label={[label, slotDateLabel, timeZone].filter(Boolean).join(", ")}
			disabled={elapsed}
			// W1-10-OBS-5 fix: the parallel aria-disabled was redundant
			// with the native disabled attribute; removed.
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
				// F-17-3 fix: was `6` — now the author's token.
				borderRadius: radius,
				padding: isNarrow ? "0 10px" : "0 12px",
				background: selected ? accentColor : "transparent",
				color: elapsed
					? mutedSoftText
					: selected
						? selectedAccentText
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
				// W1-18-F1 fix: gated on prefers-reduced-motion.
				transition: reducedMotion
					? "none"
					: "border-color 0.16s ease, background-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease",
				// W1-11-NEW-FIND-2 fix: focus indication is standardized on
				// the CSS `:focus-visible` rule — the isKeyboardModality
				// boxShadow focus branch is gone; these rings mark STATE
				// (selected / hover), never focus.
				boxShadow: selected
					? `inset 0 0 0 1px ${accentColor}`
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
	// F-01-05 fix: on canvas/export/thumbnail renders the sliding 12h/24h
	// indicator is drawn at its final position instead of being a
	// framer-motion spring (no editor jitter, no layout re-measure).
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
		mutedText,
		mutedSoftText,
		backgroundColor,
		loadingLabel,
		slotsLoading,
		selectedDate,
		fallbackDate,
		showTimesWithoutDate,
		timeOptions,
		availableTimes,
		selectedTime,
		hoveredTime,
		setHoveredTime,
		onSelectTime,
		isTimeElapsed,
		// F-17-3 fix: radius token.
		borderRadius,
		pickDateToSeeTimesLabel,
		noTimesFallbackLabel,
		timeSlotsAriaLabel,
		availableTimesAriaLabel,
		required,
		timeZone,
		// W1-10-N1 fix: slot-error wiring for the radiogroup.
		slotError,
		slotErrorId,
		// W1-10-N3 fix: group label for the 12h/24h toggle.
		timeFormatLabel,
	} = props;
	// RADIUS-INNER: the segmented control's outer surface uses the shared
	// Radius token; its active/highlight pill is inset by the control's 3px
	// padding, so its radius derives as max(0, Radius − 3) instead of
	// blindly repeating the outer value (correct for every Radius 0–24).
	const segmentInnerRadius = innerRadiusValue(borderRadius, 3);
	// W1-16-P-13 fix: the first non-elapsed slot used to be re-found with
	// `.findIndex()` for every rendered slot (O(N²) per render — ~13k
	// comparisons for a 36-slot day); compute it once per render, then
	// compare against the map's index.
	const firstNonElapsedIndex = React.useMemo(
		() => timeOptions.findIndex((time) => !isTimeElapsed(time)),
		[timeOptions, isTimeElapsed],
	);
	// A11Y-SCROLLER: the list hides its scrollbar (rule 53) — magnifier
	// and keyboard users get no "more below" affordance otherwise. When
	// the content overflows, the region becomes a labelled tab stop and
	// gains a bottom fade (a mask, not a scrollbar). No overflow → no
	// extra stop, no fade, byte-identical to before.
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
	// FINAL-68 fix: runtime guard for pathological author configs (e.g.
	// 5-minute steps over 24h = 288 slots) — the list is intentionally not
	// virtualized, so surface the degradation instead of shipping silent jank.
	React.useEffect(() => {
		if (timeOptions.length > 50) {
			console.warn(
				`[BookingEngine] ${timeOptions.length} time slots rendered without virtualization — performance may degrade. Consider a larger slot interval.`,
			);
		}
	}, [timeOptions]);
	// W1-11-F5 fix: when the 60s tick marks the Tab-focused slot as
	// elapsed, the button turns `disabled` and focus silently drops to
	// <body> (WCAG 2.4.3). Re-run on every tick (isTimeElapsed identity
	// changes with `now`) and hand focus to the next non-elapsed slot,
	// wrapping around; if nothing is left, clear the focused key.
	const slotGridRef = React.useRef<HTMLDivElement | null>(null);
	// W1-11-NEW-FIND-3 fix: the 12h/24h toggle is the only multi-button
	// group without Arrow-key navigation (ChoiceGroupInline, the date grid,
	// and the slot list all have it). Refs let ArrowLeft/ArrowRight move
	// focus between the two format buttons, matching the engine's other
	// two-button-group keyboard model.
	const formatButtonRefs = React.useRef<
		Record<"12h" | "24h", HTMLButtonElement | null>
	>({ "12h": null, "24h": null });
	// W1-09-DT-SR fix: a selected slot's aria-label was bare
	// "9:00 AM, [timezone]" — SR users had no idea WHICH day that time
	// belongs to (the date lives only in the separate date grid). Fold the
	// current date into each slot's label.
	const slotDateLabel = React.useMemo(
		() =>
			selectedDate
				? // TZ-HEADER fix: SR date in the visitor zone too (was
					// browser-local, drifting a day near midnight).
					selectedDate.toLocaleDateString(pageLocale(), {
						weekday: "short",
						month: "short",
						day: "numeric",
						...(isValidTimeZone(timeZone) ? { timeZone } : {}),
					})
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
				// CAL-GRID-121: third track of the wide 1:2:1 grid (full
				// height via grid stretch); narrow mode stacks in flow.
				minWidth: 0,
				borderLeft: isNarrow ? "none" : subtleBorder,
				borderTop: isNarrow ? subtleBorder : "none",
				padding: isNarrow ? "10px 16px 0 16px" : "16px 16px 0 16px",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				gap: 12,
			}}
		>
			{/* W2-57 fix: the time list stays scrollable but the browser
                scrollbar itself is invisible. CSS-CONSOLIDATED: the
                .be-dt-scroll rules live ONCE in RootShell's root <style>
                block (search "CSS-CONSOLIDATED") — this list no longer
                injects a per-instance copy (::-webkit-scrollbar needs a real
                CSS rule; inline styles can't target pseudo-elements). */}
			<div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
				{/* W2-51 fix: the header reflects the ACTIVE date immediately —
                    today is the default selection, so the label is never
                    empty on entry. Two-tone hierarchy matching the calendar
                    header: weekday strong/full color like the month title,
                    ordinal day muted like the year in "August 2026". */}
				<div
					style={{
						fontSize: 16,
						fontWeight: 700,
						color: textColor,
						whiteSpace: "nowrap",
					}}
				>
					{(() => {
						// TZ-HEADER fix: weekday AND day number derive from
						// the same visitor-tz date key the slots are bucketed
						// under (getDateKeyInTimeZone) — the old browser-local
						// getDate()/weekday named the wrong day near midnight
						// whenever the zone offset pushed the date over.
						const d = selectedDate ?? fallbackDate;
						const tzOpt = isValidTimeZone(timeZone)
							? { timeZone }
							: undefined;
						const w = d.toLocaleDateString(pageLocale(), {
							weekday: "short",
							...tzOpt,
						});
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
							// TZ-HEADER fix (ordinal): same visitor-tz day
							// number as above — never browser-local getDate().
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

			{/* W2-47 fix: the time list must stay CONTAINED within the
                    calendar row, never stretch the whole component. Wide:
                    this wrapper takes its height from the row (the calendar
                    section drives it) and the list fills it absolutely,
                    scrolling internally when there are many slots — so the
                    panel stays visually aligned with the calendar. Narrow:
                    natural flow; the stacked page scrolls instead. No fixed
                    pixel cap, no hidden action area. */}
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
							? { minWidth: 0 }
							: {
								position: "absolute",
								inset: 0,
								overflowY: "auto",
								minWidth: 0,
								...(scrollerOverflows
									? {
										WebkitMaskImage:
											"linear-gradient(to bottom, black 88%, transparent)",
										maskImage:
											"linear-gradient(to bottom, black 88%, transparent)",
									}
									: {}),
							}
					}
				>
					{/* Fix #18: when no date is picked (and the engine asked
                            us to hide times until a date is chosen), show a
                            hint instead of dumping all month slots. */}
					{slotsLoading ? (
						/* biome-ignore lint/a11y/useSemanticElements: intentional polite
				       live region (T5-H8) — announces slot loading; <output> is not
				       a standalone status message and would change inline layout. */
						<div
							role="status"
							aria-live="polite"
							aria-atomic="true"
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
						// W1-10-A14 fix: this hint was given
						// role="status"/aria-live in the T5-H8 sweep,
						// which made SRs announce the STATIC guidance
						// on page load. It is persistent placeholder
						// copy, not a status change — interactive
						// updates (loading / no-times) keep their
						// live regions two blocks up/down.
						>
							{pickDateToSeeTimesLabel}
						</div>
					) : timeOptions.length === 0 && availableTimes === undefined ? (
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
							// Same T5-H8 fix: "no availability" is a
							// status change screen readers must hear.
							role="status"
							aria-live="polite"
							aria-atomic="true"
						>
							{noTimesFallbackLabel}
						</div>
					) : timeOptions.length === 0 ? (
						// Cal.com mode with zero slots for this day —
						// the parent's outer banner handles the message;
						// render an empty spacer here to avoid the L3
						// duplicate-panel layout.
						<div style={{ padding: "8px 0" }} />
					) : (
						<div
							// W1-11-F5 fix: the grid is queried by the
							// elapsed-focus rescue effect.
							ref={slotGridRef}
							style={{
								display: "grid",
								// W2-39 fix: one vertical column — each slot
								// spans the full width and sits directly below
								// the previous one (no nested scroll).
								gridTemplateColumns: "minmax(0, 1fr)",
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
							aria-label={availableTimesAriaLabel}
							aria-required={required || undefined}
							// W1-10-N1 fix: error wiring matching every other
							// invalidatable control (see FieldRenderer paths).
							aria-invalid={slotError ? true : undefined}
							aria-describedby={slotError ? slotErrorId : undefined}
							onKeyDown={(e) => {
								// FINAL-44 fix: defense-in-depth Space capture.
								if (e.key === " ") {
									e.preventDefault();
									return;
								}
								const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
								// W1-09-DT-10 fix: Home/End per the WAI-ARIA
								// radiogroup pattern — jump to the first/last
								// pickable slot (elapsed ones are disabled and
								// skipped).
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
								// H3 fix: an elapsed slot is shown but
								// disabled, the same treatment past
								// calendar dates already get, rather
								// than staying fully clickable.
								const elapsed = isTimeElapsed(time);
								const isHover =
									hoveredTime === time.value && !selected && !elapsed;
								return (
									// W1-16-P-02 fix: memo'd child — see
									// TimeSlotButton above.
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
										selectedAccentText={selectedAccentText}
										onSelect={onSelectTime}
										// F-17-3 fix: radius token.
										radius={borderRadius}
										setHoveredTime={setHoveredTime}
										setFocusedKey={setFocusedKey}
										isInitialFocus={
											selectedTime === null && firstNonElapsedIndex === index
										}
										// W1-10-A13 fix: zone for the
										// slot aria-label.
										timeZone={timeZone}
										// W1-09-DT-SR fix: date context.
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

// T7-M3 fix: keyboard-modality detection (focus rings only when the user is
// actually using a keyboard) used to live here as `useKeyboardModality`.
// W1-11-NEW-FIND-2 fix: it was removed entirely — focus indication now comes
// from the CSS `:focus-visible` rule (`.be-motion-root :is(button, a)` / `.be-input:focus-visible`),
// which the browser gates on modality natively, so no JS state is needed.

// T7-M3 fix: all calendar-navigation state (visible month, grid cells,
// T7-M3 fix: all calendar-navigation state (visible month, grid cells,
// prev/next boundaries and labels, focus-restore after month changes, and
// the empty-month auto-advance) moved out of DateAndTimeInline into its own
// hook. The component keeps only what it uses directly for rendering and
// selection, so a month change no longer re-renders the time picker or the
// derived color tokens.
interface UseCalendarNavigationOptions {
	initialVisibleMonth?: Date | null;
	today: Date;
	rootRef: React.RefObject<HTMLDivElement | null>;
	onMonthChange?: (monthStart: Date) => void;
	availableDates?: Set<string>;
	slotsLoading?: boolean;
	// W1-07-N5 fix: the visitor's chosen zone — header month/year derive
	// from the same visitor-tz date key the cells display.
	timeZone?: string;
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
		// W1-07-N4/N5 fixes: visitor-tz seeding of the initial month and
		// the visitor-tz-derived month/year header.
		timeZone,
	} = options;

	// Fix #19: seed visibleMonth from the parent so navigation survives remounts.
	const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => {
		if (initialVisibleMonth) return initialVisibleMonth;
		// W1-07-N4 fix: was `new Date()` — a browser-local now. Near a
		// timezone-driven month boundary (browser months ahead/behind the
		// visitor's tz) the calendar opened on the wrong month. `today` is
		// already the visitor-tz-corrected "today" in cell coordinates
		// (W1-09-NEW-01), so seeding from its Y/M opens the right month.
		return new Date(today.getFullYear(), today.getMonth(), 1);
	});

	// T6-M2 fix: visibleMonth was seeded from initialVisibleMonth only in the
	// lazy initializer - a LATE prop change (e.g. the parent restoring state
	// after the widget already mounted) never reached the calendar. Mirror the
	// initialDate/initialTime sync pattern above.
	// W2-27-F11 fix: the sync effect lacked an equality guard. Every parent
	// re-render with a NEW Date object identity would re-fire it, and a stale
	// captured month could yank the calendar back after the visitor had already
	// paged forward. Both months are normalized to day 1 before comparing, so a
	// "Mar 5" prop can't toggle against the widget's "Mar 1", and identical
	// months are no-ops.
	// CAL-CALENDAR-STABILITY fix: the sync effect ALSO ran on month changes
	// the calendar itself initiated (arrows, PageUp/Down, empty-month
	// auto-advance, cross-month arrow focus). Those changes commit via
	// startTransition while the parent prop only catches up afterwards
	// (onMonthChange → parent state → new prop). With async metadata/
	// availability re-renders landing around that deferred commit, the effect
	// saw internal ≠ still-old prop and YANKED the calendar back a month,
	// then it re-advanced — a visible back/forth month flash on step entry.
	// A child-initiated flag breaks that ping-pong: only genuine external
	// prop changes (saved-step restore) may re-sync the month.
	const childMonthChangeRef = React.useRef(false);
	React.useEffect(() => {
		if (!initialVisibleMonth) return;
		// The calendar changed its own month — the prop catches up via
		// onMonthChange; never re-sync against the still-old prop value.
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

	// W1-07-N5 fix: the header used the browser-local components of
	// `visibleMonth` while the CELL day numbers render the visitor-tz date
	// key — for very large zone offsets the header and the grid could
	// disagree about the month. Derive from the same visitor-tz date key
	// the cells display (its YYYY-MM is the month the grid shows), then
	// resolve the month's LOCALE name from the month index alone (a month
	// name is zone-independent; the index keeps locale-awareness).
	const visibleMonthKey = React.useMemo(
		() => getDateKeyInTimeZone(visibleMonth, timeZone || ""),
		[visibleMonth, timeZone],
	);
	const monthName = React.useMemo(() => {
		const m = Number(visibleMonthKey.slice(5, 7));
		if (!Number.isFinite(m) || m < 1 || m > 12) {
			return visibleMonth.toLocaleDateString(pageLocale(), { month: "long" });
		}
		return new Date(2000, m - 1, 1).toLocaleDateString(pageLocale(), {
			month: "long",
		});
	}, [visibleMonthKey, visibleMonth]);
	const yearLabel = React.useMemo(() => {
		const y = Number(visibleMonthKey.slice(0, 4));
		return Number.isFinite(y) && y > 0
			? String(y)
			: String(visibleMonth.getFullYear());
	}, [visibleMonthKey, visibleMonth]);

	// M7 fix: first day of the week was hardcoded to Sunday. Most of the
	// world (and most Cal.com hosts) uses Monday. `Intl.Locale.weekInfo` is
	// the standard way to ask the runtime what the visitor's own locale
	// expects; it's a newer API (not yet universal), so this degrades to
	// Sunday — the previous, always-safe behavior — wherever it's missing.
	// W1-15-TS-01 fix: this was the last `as any` in the file. `Intl.Locale`
	// with `getWeekInfo`/`weekInfo` is a newer API that older TS libs (and
	// some bundlers' lib configs) don't declare yet, but we only ever read
	// `firstDay` from it, so a purpose-built shape is enough — no `any`.
	const firstDayOfWeek = React.useMemo(() => {
		try {
			// W1-09-DT-03 fix: this used navigator.language while
			// weekdayLabels/monthName use pageLocale() — a browser locale
			// differing from the document's lang could rotate the weekday
			// header one way and the grid offset another. Use the same
			// locale source as the labels so they can never disagree.
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
				// Intl's weekInfo.firstDay is 1 (Mon) – 7 (Sun); this file's
				// Date-based math uses JS's native 0 (Sun) – 6 (Sat).
				return info.firstDay % 7;
			}
		} catch {
			// Unsupported in this browser/environment — fall back to Sunday.
		}
		return 0;
	}, []);

	// M8 fix: weekday labels were hardcoded English strings even though the
	// month/year header above was already localized via `toLocaleDateString`
	// — inconsistent. Derive them the same way, off a known Sunday
	// (2023-01-01), rotated to start on `firstDayOfWeek`.
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
		for (let i = 0; i < CALENDAR_WEEKS_TO_RENDER * 7; i++) {
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

	// M5 fix: next-month navigation had no cap, so a visitor (or a stray
	// rapid-click / auto-advance loop, see M11 below) could page arbitrarily
	// far into the future. Cap it at a year out — comfortably beyond any
	// realistic booking horizon.
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

	// H5 fix: Page Up/Down (and, harmlessly, the prev/next month buttons)
	// used to leave focus stranded after a month change — the previously
	// focused date button unmounts with the old grid and nothing takes its
	// place as the focus target. Flag that the next month render should
	// re-focus the grid's roving active cell (`activeDateKey`, the single
	// `tabIndex={0}` date) once it exists.
	const pendingMonthFocusRef = React.useRef(false);
	// W1-09-NEW-03 fix: cross-month ARROW navigation previously scheduled a
	// single rAF immediately after `setVisibleMonth` — under
	// startTransition deferral (scheduler load) that frame could fire while
	// the OLD grid was still mounted, focusing a cell that unmounts with it
	// and dropping keyboard focus to document.body. Arrows now set this
	// target key + the pending flag and let the post-commit effect below
	// focus the exact cell once the new month actually exists. Exposed so
	// the DateAndTimeInline moveFocus callback can set it.
	const pendingMonthFocusTargetRef = React.useRef<string | null>(null);

	// L4 fix: both of these now use the functional `setState` updater form,
	// reading the *actual* latest committed month rather than whatever
	// `visibleMonth` happened to be captured in this render's closure. The
	// old version closed over `visibleMonth` from render time, so firing
	// this twice in quick succession (e.g. two fast clicks before the
	// re-render they scheduled had committed) both calls saw the same stale
	// starting month and only ever advanced by one month total.
	const goToPreviousMonth = React.useCallback(
		(focusAfter?: boolean) => {
			if (focusAfter) pendingMonthFocusRef.current = true;
			// W1-14-F5 fix: month navigation is a non-urgent view change —
			// wrap it in startTransition so it never blocks typing/hover on
			// the current month. The updater stays pure; the W1-11-A2
			// [visibleMonth] effect re-focuses the active cell after the
			// deferred commit.
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

	// Notify the parent on every visible-month change (including the
	// initial one, so the engine fetches slots for the starting month) from
	// a single place, rather than duplicating the call inside both
	// navigation functions above.
	React.useEffect(() => {
		onMonthChange?.(visibleMonth);
	}, [visibleMonth, onMonthChange]);

	// H5 fix (continued): once the new month has actually rendered, focus
	// its "active" cell if a Page Up/Down (or W1-09-NEW-03 cross-month
	// arrow) triggered this change. Prefer the explicit target key when the
	// cross-month arrow path set one; otherwise fall back to the grid's
	// roving active cell (`data-be-active-date` — the single `tabIndex={0}`
	// date under the roving-tabindex model).
	React.useEffect(() => {
		if (!pendingMonthFocusRef.current) return;
		pendingMonthFocusRef.current = false;
		const targetKey = pendingMonthFocusTargetRef.current;
		pendingMonthFocusTargetRef.current = null;
		// W2-30-F4 fix: cancellable frame — invalidated by the cleanup
		// below if the month flips again (or the widget unmounts) before
		// the frame fires.
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
			// W1-09-DT-EmptyMonth fix: a fully-empty month renders no
			// `tabIndex=1` cell at all — focus fell to <body> and the
			// visitor was stranded (WCAG 2.4.3). Land on the month
			// heading instead, which names the (empty) month.
			rootRef.current
				?.querySelector<HTMLElement>("[data-be-month-heading]")
				?.focus();
		});
		return () => cancelAnimationFrame(focusRaf);
	}, [visibleMonth]);

	// M11 fix: previously the calendar always opened on the current
	// calendar month even when it had zero bookable slots, leaving the
	// visitor staring at an all-disabled grid until they manually paged
	// forward. Once we know (via `availableDates`, M6) that the visible
	// month is fully empty, auto-advance — capped at a few months so a
	// permanently-misconfigured event type doesn't page forever.
	const autoAdvancedMonthsRef = React.useRef(0);
	React.useEffect(() => {
		if (!availableDates) return; // demo/fallback mode — nothing to check
		if (slotsLoading) return; // don't judge an in-flight fetch as "empty"
		if (availableDates.size > 0) return;
		if (autoAdvancedMonthsRef.current >= 3) return;
		// W2-49 fix: the initial current month must remain visible even when
		// it has no slots — the visitor should see August when today is Aug 24,
		// not an auto-advanced September. Only advance once the visitor has
		// already left the initial month (or after a manual navigation).
		if (visibleMonth.getTime() === currentMonthStart.getTime()) return;
		autoAdvancedMonthsRef.current += 1;
		goToNextMonth();
	}, [availableDates, slotsLoading, goToNextMonth, visibleMonth, currentMonthStart]);

	const canGoPrev = visibleMonth.getTime() > currentMonthStart.getTime();
	const canGoNext = visibleMonth.getTime() < maxMonthStart.getTime();
	// L6 fix: nav button aria-labels used to just say "Previous/Next month"
	// with no indication of *which* month that'd land on.
	const prevMonthLabel = React.useMemo(() => {
		const d = new Date(
			visibleMonth.getFullYear(),
			visibleMonth.getMonth() - 1,
			1,
		);
		return d.toLocaleDateString(pageLocale(), {
			month: "long",
			year: "numeric",
		});
	}, [visibleMonth]);
	const nextMonthLabel = React.useMemo(() => {
		const d = new Date(
			visibleMonth.getFullYear(),
			visibleMonth.getMonth() + 1,
			1,
		);
		return d.toLocaleDateString(pageLocale(), {
			month: "long",
			year: "numeric",
		});
	}, [visibleMonth]);

	// CAL-CALENDAR-STABILITY: the exposed setter marks a child-initiated
	// month change (cross-month arrow focus in moveFocus, and any future
	// child month mutation) so the parent-prop sync effect above never yanks
	// the calendar back to a stale prop month. Marked only when the month
	// actually changes, so boundary no-ops can't leave a stale flag behind.
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
		// W1-09-DT-08 fix: the 12-month booking horizon — moveFocus (in
		// DateAndTimeInline, which owns the keyboard-move callback) needs
		// it to clamp arrow/PageDown moves to the same bound the nav
		// buttons already respect.
		maxMonthStart,
		// W1-09-NEW-03 fix: cross-month arrow focus handoff — the arrow
		// path sets these, the post-commit effect above consumes them.
		pendingMonthFocusRef,
		pendingMonthFocusTargetRef,
	};
}

// T7-M3 fix: the time-picker state (slot options, 12h/24h format, hover,
// elapsed-slot ticking, selection) moved into its own hook. DateAndTimeInline
// now only owns calendar/selection state and composition.
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
	// W1-02-F17/F18 fix: AM/PM labels are copy-driven (author-localisable
	// suffixes) instead of hardcoded English.
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

	// T9-M10 fix: this prop->state sync effect only writes when the
	// incoming value is genuinely different. The click path already updates
	// local state, so an unconditional write just re-rendered the whole
	// widget with identical state.
	React.useEffect(() => {
		if (initialTime !== undefined) {
			React.startTransition(() =>
				setSelectedTime((prev) => (prev === initialTime ? prev : initialTime)),
			);
		}
	}, [initialTime]);

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
			// W2-45 fix: plain time labels only. The old DST-collision
			// suffix ("(EDT)" / "(GMT-05:00)") fired whenever two rows
			// shared a wall-clock label — which, with times shown before
			// a date is picked, meant the WHOLE month's identical
			// wall-times collided and every button rendered a redundant
			// "(GMT+3)"-style suffix that vanished after picking a date.
			// Visible labels are now always just the time; slot identity
			// (and any DST-fold distinction) lives in the ISO `value`,
			// aria-labels, and the booking payload — never in the text.
			// W2-48 fix: before a date is picked, `availableTimes`
			// contains the whole month's slots — every day's 9:00 AM shares
			// the same wall-clock minutes, so mapping directly produced the
			// same 9:00→16:45 range repeated per day. Deduplicate
			// deterministically by the slot's VISITOR-WALL time-of-day
			// identity (start minutes + end minutes, both in the visitor
			// zone) before mapping so the pre-selection list is a single
			// clean range. Post-selection filtering already yields one day.
			// Wall-based on BOTH ends: keying on the raw ISO slice mixed
			// UTC wall-clock into a visitor identity (same 9:00 AM twice
			// across a DST change), and ignoring the end collapsed
			// different durations sharing a start (9:00×30 vs 9:00×60).
			// DST-fold duplicates (same wall range, distinct instants)
			// collapse to the first — their labels are identical by rule
			// 43, so keeping both offers no chooseable distinction.
			const seenMinutes = new Set<string>();
			const deduped: typeof availableTimes = [];
			for (const t of availableTimes) {
				// timeZone is optional in standalone/demo wiring (where
				// slots carry no ISO ends anyway) — without it there is
				// no visitor zone to resolve the end into, so the key
				// degrades to start-minutes only.
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
			// Fallback: if dedup somehow empties (should not), keep original
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

	// H3 fix: previously nothing checked whether a time slot had already
	// passed — a visitor viewing today's schedule late in the day could
	// still tap a 9am slot that elapsed hours ago (Cal.com would reject the
	// booking, but only after they'd filled in the rest of the form).
	// Ticks every 30 seconds (aligned with the midnight-rollover poll):
	// the old 60s tick left up to a minute where an elapsed slot stayed
	// clickable and then failed at Continue against the live clock.
	// HYDRATION-CLOCK fix: same determinism contract as `today` above. The
	// wall-clock instant used to be captured independently by the prerender
	// (publish time) and the hydrating visitor (visit time), so any slot
	// starting between the two rendered DIFFERENT `disabled` flags in the
	// served HTML vs the first client render. Both sides now start with
	// "nothing elapsed yet"; the real instant lands pre-paint on mount and
	// keeps ticking every minute.
	const [now, setNow] = React.useState<Date | null>(null);
	useIsomorphicLayoutEffect(() => {
		setNow(new Date());
		const id = window.setInterval(() => setNow(new Date()), 30000);
		return () => window.clearInterval(id);
	}, []);
	const isTimeElapsed = React.useCallback(
		(time: { value: string; minutes: number }) => {
			if (!now) return false;
			if (!selectedDate) return false;
			if (!isSameDay(selectedDate, today)) return false;
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
// =============================================================================
// CAL-EVENT-META UI: compact event-information panel (Calendar step only)
// =============================================================================

// CAL-EVENT-META: renders ONLY the fields Cal.com actually returned — a
// missing field omits its row entirely, never an empty label. Duration falls
// back to the author's Default Meeting Duration control when the event type
// carries no reliable length. Pure display: no state, no fetch.
const CalEventInfoPanel = React.memo(function CalEventInfoPanel(props: {
	meta: CalEventMeta;
	fallbackDurationMinutes?: number;
	accentColor: string;
	textPrimaryColor: string;
	textSecondaryColor: string;
	borderColor: string;
	borderRadius: number | string;
	// FINAL-09 fix: localisable duration suffixes.
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
							// FINAL-69 fix: browser-native off-thread loading.
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
	// PRIMARY-FOREGROUND: semantic On-Primary colour for the selected date
	// and the adjacent-month tooltip (both render on Primary surfaces).
	// Falls back to the legacy constant for instances/paths that don't
	// pass it yet.
	accentForegroundColor?: string;
	// CAL-BG-OWNERSHIP: the calendar surface is owned by the Calendar
	// Widget marker's own `calendarStyles` (Background/Radius/Padding —
	// the same shared FieldStyleOverrides model). The global Background
	// token deliberately does NOT reach the calendar anymore; an unset
	// key falls back to DEFAULT_CALENDAR_SURFACE_BACKGROUND so opening
	// the Styles submenu never changes the calendar's appearance.
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
	/** M6/M11 fix: the full set of calendar days (in the visitor's chosen
	 *  timezone, keyed the same way as the grid's own `dateKey`) that have
	 *  at least one open Cal.com slot anywhere in the currently-fetched
	 *  month. `undefined` means "no real integration" (demo/fallback grid,
	 *  matching `availableTimes`'s own undefined convention) — every
	 *  in-month, non-past date stays selectable. When provided, days not in
	 *  the set are shown disabled even if they're otherwise a normal future
	 *  weekday. */
	availableDates?: Set<string>;
	/** M11: while true, this component won't auto-advance past a fully
	 *  empty month — we don't yet know whether it's genuinely empty or the
	 *  fetch just hasn't resolved. */
	slotsLoading?: boolean;
	/** INSTANCE-ISOLATION: per-engine id for DOM ids (gridLabelId, field ids). */
	instanceId?: string;
	/** CC-13 completion: the timezone slot labels are displayed in. Grid
	 *  date keys and slot availability marks are derived through this zone
	 *  so a slot's calendar day always matches its label's day. When
	 *  omitted, falls back to browser-local keys (demo mode). */
	timeZone?: string;
	/** Copy shown in the time panel while Cal.com availability is loading. */
	loadingLabel?: string;
	onSelectionReady?: (payload?: BookingPayload) => void;
	onDateChange?: (date: Date) => void;
	onMonthChange?: (monthStart: Date) => void;
	onTimeFormatChange?: (format: "12h" | "24h") => void;
	/** Requirement 4: the engine now always passes `true` here so the time
	 *  slot list/picker is visible by default, without requiring the user
	 *  to pick a date first. Kept as a prop (rather than hardcoded inside
	 *  this component) so the "pick a date to see times" fallback path
	 *  below remains available if ever needed again. */
	showTimesWithoutDate?: boolean;
	// W1-02-F9 fix (bundle 14): copy-driven strings for the calendar
	// wrapper, time list and its empty states. Required — the single
	// production call site (StepBody/RootShell) always passes them from
	// the configured `copy` object.
	pickDateToSeeTimesLabel: string;
	noTimesFallbackLabel: string;
	timeSlotsAriaLabel: string;
	availableTimesAriaLabel: string;
	datePickerAriaLabel: string;
	amLabel: string;
	pmLabel: string;
	previousMonthAriaTemplate: string;
	nextMonthAriaTemplate: string;
	/** W1-10-A1 fix: passed through to TimeSlotList's slot radiogroup.
	 *  The datetime step always requires a picked slot, so the single
	 *  production call site (StepBody) passes `true`. */
	required?: boolean;
	// W1-10-N1 fix: pass-through of the engine-level slot error state so
	// TimeSlotList can wire aria-invalid/aria-describedby on the radiogroup.
	slotError?: string | null;
	slotErrorId?: string;
	// W1-10-N3 fix: group label for the 12h/24h time-format toggle.
	timeFormatLabel: string;
	// CAL-EVENT-META: normalized Cal.com event/profile metadata. Absent
	// (undefined/null) on demo grids, unconfigured instances or fetch
	// failure — in every one of those cases the info panel simply does not
	// render and the calendar behaves exactly as before.
	eventMeta?: CalEventMeta | null;
	/** CAL-EVENT-META: deterministic state machine for the panel —
	 *  "disabled" hides it entirely; "loading" shows the skeleton; "ready"
	 *  renders the data; "failed" shows a neutral fallback. The initial
	 *  value is identical on server and client first render. */
	eventMetaStatus?: CalEventMetaStatus;
	/** CAL-EVENT-META: author Default Meeting Duration (minutes) — only used
	 *  when Cal.com itself returns no reliable event length. */
	eventMetaFallbackDurationMinutes?: number;
	// FINAL-07 fix: visitor-facing panel copy that used to be hardcoded
	// module constants. Optional — older callers fall back to the
	// historical constants.
	calEventMetaLoadingAria?: string;
	calEventMetaUnavailableCopy?: string;
	// FINAL-09 fix: localisable duration suffixes for the info panel.
	hourSuffix?: string;
	minuteSuffix?: string;
}

const DateAndTimeInline = React.memo(function DateAndTimeInline(
	props: DateAndTimeInlineProps,
) {
	const {
		instanceId = "",
		accentColor,
		// PRIMARY-FOREGROUND: On-Primary token (legacy constant fallback).
		accentForegroundColor = TEXT_ON_ACCENT,
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
		// W1-10-N1 fix: slot-error pass-through.
		slotError,
		slotErrorId,
		// W1-10-N3 fix: toggle group label.
		timeFormatLabel,
		// CAL-EVENT-META: optional Cal.com event/profile metadata + the
		// author duration fallback for the info panel.
		eventMeta,
		eventMetaStatus = "disabled",
		eventMetaFallbackDurationMinutes,
		// FINAL-07 fix: author-localisable panel copy (historical
		// constants as fallbacks).
		calEventMetaLoadingAria = CAL_META_LOADING_ARIA,
		calEventMetaUnavailableCopy = CAL_META_UNAVAILABLE_COPY,
		hourSuffix = DEFAULT_COPY_HOUR_SUFFIX,
		minuteSuffix = DEFAULT_COPY_MINUTE_SUFFIX,
	} = props;

	// HYDRATION-CLOCK fix (persistent React #425/#418 root cause): `today`
	// used to initialize straight from the wall clock (`new Date()`), so the
	// PRERENDERED HTML — generated at publish time — baked the publish-day
	// calendar into the served markup (today highlight, past-date disabling,
	// seeded month), while a visitor hydrating days later computed a
	// different day → guaranteed server/client mismatches across the grid.
	// First render is now a pure function of constants: BOTH sides start
	// from one fixed placeholder day; the isomorphic layout effect below
	// applies the real visitor-tz clock BEFORE paint (no flash, and the
	// engine's first onMonthChange already carries the real month).
	const [clockReady, setClockReady] = React.useState(false);
	const [today, setToday] = React.useState<Date>(() => HYDRATION_PLACEHOLDER_TODAY);
	// PRERENDER-DEFER: the clock apply used to be an unconditional mount
	// layout effect — correct for renderToString, but Framer's headless
	// prerender runs effects too, so the served HTML carried the REAL
	// prerender-day month/year while every visitor's first render computes
	// the placeholder day (the exact #425 text mismatches in the h3 month
	// header). Gate on the interactive-client flag: prerender (and
	// pre-interaction automation) keeps the placeholder day baked, real
	// visitors apply the real clock in this same pre-paint layout phase.
	const beInteractive = useBeInteractive();
	useIsomorphicLayoutEffect(() => {
		if (!beInteractive) return;
		setClockReady(true);
		setToday(getTodayInTimeZone(timeZone));
		// Mount-only: later timeZone swaps are handled by the scheduler
		// effect below via its [timeZone] dependency.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [beInteractive]);
	React.useEffect(() => {
		if (!clockReady || typeof window === "undefined") return;
		// Midnight rollover must follow the visitor's local calendar date,
		// not the browser's local midnight. Polling every 30s is cheap
		// (one Intl.DateTimeFormat per tick) and handles DST, travel, or
		// system clock changes without computing visitor-tz midnight in UTC.
		let intervalId: number;
		let timeoutId: number;
		const checkRollover = () => {
			const newToday = getTodayInTimeZone(timeZone);
			setToday((prev) => (isSameDay(prev, newToday) ? prev : newToday));
		};
		// Align first check to the next 30s boundary, then interval.
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
	// Requirement 4: scoped id for this DateAndTimeInline instance's own
	// <style> block (hiding the time-list scrollbar needs a real CSS rule
	// for ::-webkit-scrollbar — inline styles can't target pseudo-elements).
	// CSS-CONSOLIDATED: that rule now lives ONCE in RootShell's root
	// <style> block (same constant class `.be-dt-scroll`); the per-instance
	// style tag and this id are gone.
	// T5-M8 fix: reduce-motion support for the 12h/24h slider.
	const prefersReducedMotion = useReducedMotion();

	const [measuredWidth, setMeasuredWidth] = React.useState<number>(560);
	const rootRef = React.useRef<HTMLDivElement | null>(null);
	// W2-30-F4 fix: tracks the focus-restore frame issued by moveFocus so
	// a later move can cancel the stale one (and unmount can too). Lives
	// here — moveFocus is this component's callback.
	const focusRafRef = React.useRef(0);
	// W2-29-N1 fix: arms when a date is picked whose slots fetch is still
	// in flight (the single-rAF auto-focus finds no slot buttons yet); the
	// post-commit effect below re-focuses the first pickable slot once the
	// fetch resolves.
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
		// W1-07-N4/N5 fixes: visitor-tz month seeding + header derivation.
		timeZone,
	});
	// HYDRATION-CLOCK fix: when the calendar self-seeded from the placeholder
	// day (fresh visit — no saved/restored month), advance to the REAL
	// current month in the same pre-paint pass as the clock application.
	// The engine's first onMonthChange then carries the real month — exactly
	// one availability fetch, no placeholder-month request, and the served
	// HTML still matches the client's deterministic first render.
	const selfSeededMonthRef = React.useRef(!initialVisibleMonth);
	useIsomorphicLayoutEffect(() => {
		if (!clockReady) return;
		if (!selfSeededMonthRef.current) return;
		selfSeededMonthRef.current = false;
		setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
	}, [clockReady, today, setVisibleMonth]);
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(
		// W2-56 fix: deterministic placeholder selection — fresh visits
		// start on the fixed placeholder day (identical server/client
		// markup), then the clock layout effect below swaps in the real
		// visitor-local date pre-paint. A restored/saved date always wins.
		() => initialDate ?? HYDRATION_PLACEHOLDER_TODAY,
	);
	const placeholderSelectedRef = React.useRef(!initialDate);
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
	// W1-11-NEW-FIND-2 fix: useKeyboardModality (and its state) is gone —
	// focus rings come from the CSS :focus-visible rule alone now.
	const lastReadyKeyRef = React.useRef<string>("");

	useIsomorphicLayoutEffect(() => {
		// PRERENDER-DEFER: same determinism contract as the choice-field
		// measurement — the 560px guess is server-identical everywhere; the
		// real measurement waits for an interactive client (#418 on the
		// datetime step's motion subtree came from the baked viewport width).
		if (!beInteractive) return;
		if (
			typeof window !== "undefined" &&
			typeof ResizeObserver !== "undefined"
		) {
			if (!rootRef.current) return;
			// W1-19-F-12 fix: same synchronous first-read as the choice
			// field — the 560px guess previously flashed on the first paint.
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

	// T9-M10 fix: these prop->state sync effects only write when the
	// incoming value is genuinely different. The click path already
	// updates local state, so an unconditional write just re-rendered the
	// whole widget with identical state.
	// W2-56 fix: `null` is the fresh-visit "no saved date" signal from the
	// engine — it must NOT wipe the default today selection applied by the
	// clock layout effect above. Only a REAL restored date syncs through.
	React.useEffect(() => {
		if (!initialDate) return;
		React.startTransition(() =>
			setSelectedDate((prev) =>
				prev && isSameDay(prev, initialDate) ? prev : initialDate,
			),
		);
	}, [initialDate]);

	const isNarrow = measuredWidth < COMPACT_BREAKPOINT;
	// PRIMARY-FOREGROUND: foreground for the selected date/slot and the
	// adjacent-month tooltip — all render on the author's Primary surface.
	// Semantic token, not a hard-coded white assumption.
	const selectedAccentText = accentForegroundColor;
	const mutedText = React.useMemo(() => withAlpha(textColor, 0.6), [textColor]);
	const mutedSoftText = React.useMemo(
		() => withAlpha(textColor, 0.42),
		[textColor],
	);
	const subtleFill = React.useMemo(
		() => withAlpha(textColor, 0.08),
		[textColor],
	);
	const softerFill = React.useMemo(
		() => withAlpha(textColor, 0.05),
		[textColor],
	);
	const subtleBorder = React.useMemo(
		() => `1px solid ${borderColor}`,
		[borderColor],
	);
	// CAL-BG-OWNERSHIP: resolved calendar-surface tokens. Every key comes
	// from the Calendar Widget marker's own `calendarStyles` ONLY when the
	// author configured it (STYLES-INIT: untouched keys are undefined);
	// otherwise the native defaults apply — white surface, shared Radius
	// token, no padding. Opening the Styles submenu therefore never changes
	// the calendar's appearance, and a configured value replaces exactly
	// one of these without touching the global Background token or the
	// transparent footer.
	const normalizedCalendarStyles = normalizeStyleOverrides(calendarStyles);
	const surfaceBackground =
		normalizedCalendarStyles?.backgroundColor ?? DEFAULT_CALENDAR_SURFACE_BACKGROUND;
	const surfaceRadius = resolveFieldRadius(normalizedCalendarStyles, radius, "calendar-widget" as FieldType);
	const surfacePadding =
		typeof normalizedCalendarStyles?.padding === "string" && normalizedCalendarStyles.padding.trim()
			? normalizedCalendarStyles.padding
			: undefined;
	// W1-11-NEW-FIND-2 fix: the `focusInset` shadow memo is gone —
	// focus rings come from the CSS :focus-visible rule alone.

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
		[timeZone],
	);

	// M6 fix: previously any in-month, non-past date was selectable
	// regardless of whether Cal.com actually had open slots that day —
	// clicking through to an empty day was a dead end. `availableDates`
	// (populated by the parent from the whole month's fetched slots, not
	// just the selected day's) lets a day be marked unavailable the same
	// way a past/out-of-month day already is. `undefined` preserves the old
	// behavior for the no-Cal.com-config demo grid.
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
	// DEFAULT-SELECTION (hard rule): first available date ON/AFTER
	// visitor-local today across the ENTIRE loaded grid window. Unlike
	// firstAvailableDate above this is NOT restricted to the visible month —
	// calendarCells spans the leading/trailing adjacent-month rows and the
	// slots fetch covers ±12 days beyond the month, so adjacent-window
	// availability is the same normalized Cal.com source the grid renders.
	// This is what makes "today unavailable late in the month" select the
	// first available date in the following days/month instead of leaving
	// nothing selected (AGENTS.md rule 78).
	const firstAvailableDateFromToday = React.useMemo(() => {
		for (const date of calendarCells) {
			const isPast = startOfDay(date).getTime() < today.getTime();
			if (!isPast && hasKnownAvailability(date)) return date;
		}
		return null;
	}, [calendarCells, today, hasKnownAvailability]);
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
			selectedDate.getMonth() === visibleMonth.getMonth() &&
			// W1-09-DT-StaleSelected fix: a date picked earlier can become
			// unavailable mid-session (the availability fetch resolves, the
			// author tightens the schedule). Trusting it as the active cell
			// left the grid with NO tabIndex=1 cell and broke Tab order.
			// Only treat it as active while it still has availability;
			// otherwise fall through to the first available date.
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

	// ROVING-TABINDEX: Tab order model. Exactly ONE selectable date per
	// visible grid — `selectedOrFirstDateKey` (the selected date, else the
	// month's first available date) — renders `tabIndex={0}`; every other
	// cell renders `tabIndex={-1}`. Positive tabindex values are never used:
	// they create a document-global tab sequence that hijacks order across
	// the whole page. Keyboard users Tab once into the grid's active cell,
	// then move with Arrow keys / Home / End / PageUp / PageDown (handled by
	// each cell's native keydown), and Tab again to leave — the standard
	// WAI-ARIA grid/roving-tabindex contract.
	const activeDateKey = selectedOrFirstDateKey;

	// DEFAULT-SELECTION algorithm (hard rules 77/78 — never an isToday
	// mirror, never an unavailable date):
	//
	//   visitor-local today
	//   → today available/selectable  → select today
	//   → otherwise → select the FIRST AVAILABLE date on/after today anywhere
	//     in the loaded grid window (firstAvailableDateFromToday); when that
	//     date lives in the adjacent-month window and the visitor has not
	//     paged away, advance the visible month so the selection is in view
	//   → no available future date in the loaded range → NO selected date
	//
	// Today (the dot marker) stays on the real visitor-local date in every
	// branch — Today and Selected are independent states. The decision runs
	// once per fresh visit (placeholderSelectedRef gate): a restored/saved
	// date always wins and short-circuits this effect. Availability comes
	// from the same normalized Cal.com set the grid renders, deferred while
	// the fetch is in flight.
	useIsomorphicLayoutEffect(() => {
		if (!clockReady) return;
		if (!placeholderSelectedRef.current) return;
		// Still on placeholder (2024-01-01) means today not yet swapped in.
		if (today.getFullYear() === 2024 && today.getMonth() === 0 && today.getDate() === 1) return;
		// For Cal.com, wait for availability to be known before deciding.
		// availableDates === undefined means no Cal.com config (demo) -> all dates considered available.
		// If slots are still loading, defer the decision.
		const isCalcom = availableDates !== undefined;
		const isLoading = typeof slotsLoading !== "undefined" ? slotsLoading : false;
		if (isCalcom && isLoading) return;
		const todayAvailable = hasKnownAvailability(today);
		const defaultDate = todayAvailable ? today : firstAvailableDateFromToday;
		if (defaultDate) {
			placeholderSelectedRef.current = false;
			React.startTransition(() => {
				setSelectedDate(defaultDate);
				// Keep the engine in sync so the time panel lists the
				// selected day's times exactly like a visitor click.
				onDateChange?.(defaultDate);
			});
			// Advance the visible month only while the calendar still
			// sits on its self-seeded starting view (today's month, or
			// the hydration placeholder if the self-seed hasn't committed
			// in this same pass). A visitor who paged away during the
			// fetch keeps their view — the selection still lands.
			const untouched =
				(visibleMonth.getFullYear() === today.getFullYear() &&
					visibleMonth.getMonth() === today.getMonth()) ||
				(visibleMonth.getFullYear() === 2024 &&
					visibleMonth.getMonth() === 0);
			if (
				untouched &&
				(defaultDate.getFullYear() !== visibleMonth.getFullYear() ||
					defaultDate.getMonth() !== visibleMonth.getMonth())
			) {
				setVisibleMonth(
					new Date(
						defaultDate.getFullYear(),
						defaultDate.getMonth(),
						1,
					),
				);
			}
		} else if (isCalcom && !isLoading) {
			// No available future date anywhere in the loaded window ->
			// leave NO selected date (never select an unavailable date).
			// The visitor can page forward to load further months.
			placeholderSelectedRef.current = false;
			setSelectedDate(null);
		}
	}, [clockReady, today, hasKnownAvailability, firstAvailableDateFromToday, availableDates, slotsLoading, visibleMonth, setVisibleMonth, onDateChange]);

	// STALE-SELECTION fix: a picked date can go invalid mid-session — the
	// 30s midnight poll rolls `today` past it, or the availability fetch
	// resolves tighter than at pick time. The click guard above only
	// blocks NEW picks; without this the grid kept an accent-filled
	// DISABLED cell and the time panel kept the old day's slots. Re-run
	// the rule-84 default (today-if-available else first future, else
	// nothing) whenever the current selection is past or has no
	// availability. Deterministic derivation from [today, availableDates]
	// — not a timing hack: gated on the default effect's first decision
	// (placeholderSelectedRef), a settled fetch, and Cal.com mode (demo
	// has no availability set, past-dates still clear). Clearing both
	// halves reuses the onSelectionReady(incomplete) contract below, so
	// the parent drops the stale slot exactly like a fresh visit.
	useIsomorphicLayoutEffect(() => {
		if (!clockReady) return;
		if (placeholderSelectedRef.current) return;
		if (!selectedDate) return;
		const isCalcom = availableDates !== undefined;
		const isLoading = typeof slotsLoading !== "undefined" ? slotsLoading : false;
		if (isCalcom && isLoading) return;
		const past = startOfDay(selectedDate).getTime() < today.getTime();
		const unavailable = isCalcom && !hasKnownAvailability(selectedDate);
		if (!past && !unavailable) return;
		const todayAvailable = hasKnownAvailability(today);
		const fallback = todayAvailable ? today : firstAvailableDateFromToday;
		React.startTransition(() => {
			setSelectedTime(null);
			if (fallback) {
				setSelectedDate(fallback);
				onDateChange?.(fallback);
			} else {
				setSelectedDate(null);
			}
		});
	}, [clockReady, selectedDate, today, availableDates, slotsLoading, hasKnownAvailability, firstAvailableDateFromToday, onDateChange]);

	// Diagnostics for initial-date logic (enable via window.__BE_DIAGNOSTICS__ = true or ?beDiagnostics=1)
	React.useEffect(() => {
		if (typeof window === "undefined") return;
		const enabled = (window as unknown as Record<string, unknown>).__BE_DIAGNOSTICS__ === true || new URLSearchParams(window.location.search).has("beDiagnostics");
		if (!enabled) return;
		const todayKey = getDateKeyInTimeZone(today, timeZone || "");
		const selectedKey = selectedDate ? getDateKeyInTimeZone(selectedDate, timeZone || "") : null;
		const todayAvailable = hasKnownAvailability(today);
		const firstAvailKey = firstAvailableDate ? getDateKeyInTimeZone(firstAvailableDate, timeZone || "") : null;
		console.debug("[BE Diagnostic] date-initial", {
			timeZone: timeZone || "(none)",
			todayKey,
			selectedKey,
			todayAvailable,
			firstAvailableKey: firstAvailKey,
			clockReady,
			hasKnownAvailability: !!availableDates,
		});
	}, [timeZone, today, selectedDate, firstAvailableDate, hasKnownAvailability, availableDates, clockReady]);

	const getPayload = React.useCallback(
		(date: Date, time: string): BookingPayload => {
			// If the time value is an ISO string (real Cal.com slot), parse it
			// to derive a label. Otherwise it's a "HH:MM" 24h string from the
			// fallback grid.
			const isIso = /^\d{4}-\d{2}-\d{2}T/.test(time);
			if (isIso) {
				// Capture the slot end (if available) for ICS DTEND (fix #11).
				const matched = availableTimes?.find(
					(candidate) => candidate.value === time,
				);
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
		// SYN-09 fix: the body reads amLabel/pmLabel via formatTimeLabel —
		// omitting them from the deps left stale labels in review/
		// confirmation/ICS copy after an author edit in the Copy panel.
		[activeTimeFormat, availableTimes, amLabel, pmLabel],
	);

	const handleDateSelect = React.useCallback(
		(date: Date) => {
			if (startOfDay(date).getTime() < today.getTime()) return;
			React.startTransition(() => {
				setSelectedDate(date);
				// ADJACENT-FOLLOW fix: picking a live trailing/leading
				// adjacent-month date selected an off-view date while the
				// view stayed behind (selected cell tabIndex -1, header
				// showing the wrong month). Follow the selection exactly
				// like the default effect above (raw setVisibleMonth +
				// onDateChange below lets the parent prop follow, so the
				// parent-prop sync never yanks it back — rule 39).
				if (
					date.getFullYear() !== visibleMonth.getFullYear() ||
					date.getMonth() !== visibleMonth.getMonth()
				) {
					setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
				}
				// CC-1 fix: a previously-picked time belongs to the OLD date.
				// Without this, selecting a new date while a time from the
				// prior date is still set lets the onSelectionReady effect
				// below pair the new date with the stale time and submit a
				// booking for the wrong day.
				setSelectedTime(null);
			});
			// W1-09-DT-AutoFocus fix: picking a date (mouse or keyboard)
			// re-rendered the slot list but never moved focus to it —
			// keyboard users had to Tab through every remaining date cell
			// to reach the new day's slots (WCAG 2.4.3). After the render
			// lands, focus the first pickable slot; same tracked-frame
			// pattern as moveFocus above.
			if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current);
			focusRafRef.current = requestAnimationFrame(() => {
				rootRef.current
					?.querySelector<HTMLButtonElement>(
						"button[role='radio']:not([disabled])",
					)
					?.focus();
			});
			// W2-29-N1 fix: the rAF above misses when `slotsLoading` is
			// still true at fire time (the list renders only the loading
			// div — querySelector returns null, focus stays stranded on
			// the calendar cell, and nothing re-triggers when the slots
			// arrive). Arm the pending flag; the effect keyed on
			// slotsLoading/timeOptions below completes the focus move.
			pendingSlotListFocusRef.current = true;
			if (onDateChange) onDateChange(date);
		},
		[onDateChange, today, visibleMonth, setVisibleMonth],
	);

	// W2-29-N1 fix: completes the date-pick auto-focus when it fired
	// while the slots fetch was still in flight. Runs once the load
	// settles AND the new day's slot buttons exist; clears the flag as
	// soon as it attempts the move so a later (unrelated) slots change
	// doesn't yank focus. The frame is tracked like every other focus
	// move (focusRafRef) so a follow-up move/unmount cancels it.
	React.useEffect(() => {
		if (!pendingSlotListFocusRef.current) return;
		if (slotsLoading) return;
		if (timeOptions.length === 0) {
			// The fetch resolved with nothing to pick (empty day); a
			// focus move is meaningless — disarm instead of retrying on
			// every unrelated slots update.
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
	// W1-16-P-15 fix: `hasKnownAvailability` changes identity on every Cal.com
	// availability fetch (it derives from `availableDates`) and sat in this
	// callback's dep array. Each fetch flipped `moveFocus`'s identity, the fresh
	// reference flowed into CalendarGrid's `onMoveFocus` prop, and all 42
	// memoized CalendarCells re-rendered per fetch even though none of their
	// visual props changed. Reading through the ref keeps `moveFocus`
	// identity-stable across fetches while still honoring the latest
	// availability set on every keypress.
	const hasKnownAvailabilityRef = React.useRef(hasKnownAvailability);
	// W1-14-N2 doc: this render-phase write is INTENTIONAL (not an effect) —
	// see the W1-16-P-15 note above. Moving it to useEffect would add a
	// one-render lag and re-break the 42-cell memoization the fix protects.
	hasKnownAvailabilityRef.current = hasKnownAvailability;

	const moveFocus = React.useCallback(
		(target: Date) => {
			if (startOfDay(target).getTime() < today.getTime()) return;
			// W1-09-DT-08 fix: no upper-bound guard existed — arrow keys and
			// PageDown could walk the focus (and month) past the 12-month
			// booking horizon (maxMonthStart) that the nav buttons already
			// respect. Mirror the same clamp here.
			if (startOfDay(target).getTime() > maxMonthStart.getTime()) return;
			if (!hasKnownAvailabilityRef.current(target)) return;
			const inVisibleMonth =
				target.getFullYear() === visibleMonth.getFullYear() &&
				target.getMonth() === visibleMonth.getMonth();
			if (!inVisibleMonth) {
				const monthStart = new Date(target.getFullYear(), target.getMonth(), 1);
				// W1-09-NEW-03 fix: cross-month arrow moves previously scheduled
				// a single rAF here. Under startTransition deferral (scheduler
				// load) that frame could fire while the OLD grid was still
				// mounted — focusing (or missing) the target in the outgoing
				// grid and dropping focus to document.body after commit. Hand
				// the target key to the same pendingMonthFocusRef contract that
				// PageUp/PageDown already use: the post-commit effect (in
				// useCalendarNavigation) focuses the exact cell once the new
				// month exists.
				pendingMonthFocusRef.current = true;
				pendingMonthFocusTargetRef.current = dateKeyOf(target);
				React.startTransition(() => setVisibleMonth(monthStart));
				return;
			}
			const key = dateKeyOf(target);
			// W2-30-F4 fix: the frame is tracked and cancelled before the next
			// move issues a new one (and on unmount below), instead of letting
			// stale focus frames queue up.
			if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current);
			focusRafRef.current = requestAnimationFrame(() => {
				rootRef.current
					?.querySelector<HTMLElement>(`[data-date-key="${key}"]`)
					?.focus();
			});
		},
		[today, visibleMonth, dateKeyOf, maxMonthStart],
	);

	// Section 9.3: confirmationMode is "External Button" — fire onSelectionReady
	// once both date and time are chosen. Do NOT auto-advance or show an
	// internal Book button. The engine's own handleContinue() reads from this.
	// Also fire `onSelectionReady(undefined)` when the selection becomes
	// incomplete so the parent clears the stale slot (fixes stale-slot bug).
	React.useEffect(() => {
		if (!selectedDate || !selectedTime) {
			if (lastReadyKeyRef.current !== "") {
				lastReadyKeyRef.current = "";
				onSelectionReady?.(undefined);
			}
			return;
		}
		// The same selected slot needs to be re-published when the visitor
		// switches 12h/24h; otherwise the review and confirmation screens
		// retain the label captured at the original selection time.
		// M7 fix: the key and getPayload both read activeTimeFormat, so it
		// must be in the dep array — previously it was omitted, the effect
		// never re-ran on a 12h↔24h toggle, and the parent kept showing the
		// original timeLabel forever (the frozen-at-selection bug).
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

	return (
		<div
			ref={rootRef}
			style={{
				position: "relative",
				width: "100%",
				height: "auto",
				minHeight: 300,
				// CAL-BG-OWNERSHIP: the calendar surface's radius/background/
				// padding are owned by the marker field's own Styles submenu
				// (calendarStyles); untouched keys keep the native look. The
				// global Background token does not reach this surface.
				borderRadius: surfaceRadius,
				background: surfaceBackground,
				...(surfacePadding ? { padding: surfacePadding } : {}),
				// DECOR: calendar-surface shadow/blur from the marker
				// field's Calendar Styles — only when configured.
				...shadowStyle(normalizedCalendarStyles?.shadow),
				...backdropStyle(normalizedCalendarStyles?.backgroundBlur),
				color: textColor,
				border: subtleBorder,
				overflow: "hidden",
				display: "flex",
				flexDirection: "column",
				boxSizing: "border-box",
				fontFamily: "inherit",
			}}
		>
			{/* CAL-GRID-121: wide layouts are an intentional proportional
                    1:2:1 grid — event information | calendar | time slots —
                    via `minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)`. All
                    three columns grow and shrink proportionally with the
                    container; the minmax(0, …) floors (plus minWidth: 0 on
                    every child) stop content from forcing horizontal
                    overflow. Narrow (< COMPACT_BREAKPOINT) keeps the existing
                    stacked flex-column reflow. When the event panel is
                    hidden (no Cal.com config), the template drops to a 2:1
                    calendar|times grid so auto-placement never leaves an
                    empty first track. */}
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
				{/* CAL-EVENT-META: event information panel — first column on
                    wide layouts, stacked above the calendar when narrow
                    (the row above already switches to `column`). The panel
                    KEEPS its structure whenever Cal.com is configured: a
                    deterministic skeleton while loading, the real metadata
                    when ready, and a neutral fallback on failure — so the
                    layout never collapses or shifts, and the server/client
                    first renders are byte-identical. Hidden entirely only
                    when Cal.com isn't configured for a datetime step. */}
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
							// Fixed minimum footprint shared by every state so
							// loading → ready → fallback never shifts layout.
							minHeight: isNarrow ? undefined : 176,
						}}
					>
						{eventMetaStatus === "ready" && eventMeta ? (
							<CalEventInfoPanel
								meta={eventMeta}
								fallbackDurationMinutes={eventMetaFallbackDurationMinutes}
								accentColor={accentColor}
								textPrimaryColor={textColor}
								textSecondaryColor={mutedText}
								borderColor={borderColor}
								borderRadius={radius}
								hourSuffix={hourSuffix}
								minuteSuffix={minuteSuffix}
							/>
						) : eventMetaStatus === "failed" ? (
							/* Neutral, informational fallback — no fake data,
				no error tones (rule 38: metadata failure is
				never an alarm). */
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
							/* Loading skeleton — static neutral blocks, no
				shimmer, identical markup on server and client. */
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
									<div
										style={{
											width: 40,
											height: 40,
											borderRadius: "50%",
											background: withAlpha(borderColor, 0.5),
											flexShrink: 0,
										}}
									/>
									<div
										style={{
											width: "60%",
											height: 14,
											borderRadius: 7,
											background: withAlpha(borderColor, 0.5),
										}}
									/>
								</div>
								<div
									style={{
										width: "85%",
										height: 18,
										borderRadius: 7,
										background: withAlpha(borderColor, 0.5),
									}}
								/>
								<div
									style={{
										width: "45%",
										height: 13,
										borderRadius: 7,
										background: withAlpha(borderColor, 0.5),
									}}
								/>
								<div
									style={{
										width: "70%",
										height: 13,
										borderRadius: 7,
										background: withAlpha(borderColor, 0.5),
									}}
								/>
							</div>
						)}
					</section>
				) : null}
				<section
					aria-label={datePickerAriaLabel}
					style={{
						// CAL-GRID-121: middle track of the 1:2:1 grid — the
						// calendar column is sized by the template, not flex.
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
						selectedDate={selectedDate}
						today={today}
						hoveredDateKey={hoveredDateKey}
						isNarrow={isNarrow}
						firstDayOfWeek={firstDayOfWeek}
						dateKeyOf={dateKeyOf}
						hasAvailability={hasKnownAvailability}
						activeDateKey={activeDateKey}
						locale={pageLocale()}
						// W1-07-F4 fix: label cells in the visitor's tz.
						timeZone={timeZone}
						accentColor={accentColor}
						borderColor={borderColor}
						subtleFill={subtleFill}
						textColor={textColor}
						selectedAccentText={selectedAccentText}
						mutedSoftText={mutedSoftText}
						mutedText={mutedText}
						// F-17-3 fix: radius token (the `radius` prop this
						// inline component already receives).
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
					textColor={textColor}
					selectedAccentText={selectedAccentText}
					mutedText={mutedText}
					mutedSoftText={mutedSoftText}
					// CAL-BG-OWNERSHIP: inner surfaces follow the calendar's
					// OWN resolved surface background (never the global
					// Background token), so a customized calendar stays
					// coherent end to end.
					backgroundColor={surfaceBackground}
					// F-17-3 fix: radius token.
					borderRadius={String(radius)}
					loadingLabel={loadingLabel}
					slotsLoading={slotsLoading}
					selectedDate={selectedDate}
					fallbackDate={today}
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
					// W1-10-A13 fix: zone for the slot aria-labels.
					timeZone={timeZone}
					// W1-10-N1 fix: slot-error wiring.
					slotError={slotError}
					slotErrorId={slotErrorId}
					// W1-10-N3 fix: toggle group label.
					timeFormatLabel={timeFormatLabel}
				/>
				{/* A11Y-ANNOUNCE: the W1-10-N4 polite "{time} selected" region
                    lived here — removed. Native radio semantics already
                    announce selection (aria-checked) on pick, so the extra
                    region double-spoke every choice. */}
			</div>
		</div>
	);
});

// =============================================================================
// BookingEngine — types and constants
// =============================================================================

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
	// Requirement 3: a placeholder "field" that marks where the calendar/
	// time picker renders within a Calendar step's Fields array, so authors
	// can drag it above or below their custom fields. It carries no value,
	// is never validated, and has no editable label/placeholder/etc.
	| "calendar-widget";
type FlowStatus = "in-progress" | "submitting" | "success" | "error";

// T6-H4 fix: flowStatus is a tiny state machine. The guarded setter
// (transitionFlowStatus) rejects impossible transitions - e.g. a future
// edit doing `transitionFlowStatus("submitting")` from `success` would be
// a no-op with a console warning instead of silently corrupting the flow.
const FLOW_STATUS_TRANSITIONS: Record<FlowStatus, Array<FlowStatus>> = {
	"in-progress": ["submitting", "success", "error"],
	submitting: ["success", "error"],
	success: ["in-progress"],
	error: ["in-progress"],
};

// CC-12 fix: this is the shape Framer's `ControlType.Font` actually resolves
// to at runtime (verified against how the runtime code below reads it —
// fontFamily/fontSize/fontWeight/fontStyle/letterSpacing/lineHeight). All
// fields optional since Framer only includes the ones the font control's
// `controls` list opts into, and the runtime already defends every read with
// `?.` + a fallback.
// W2-34 Item 6 / W1-15-TS-10 fix: the interface only declares what
// fontStack actually READS. Framer's runtime font object carries many
// more fields (size, textAlign, textTransform, …) — reading only the six
// needed keys means the narrower type can never mis-read the runtime
// shape; widening with invented fields would just fake precision.
interface FramerFont {
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: number | string;
	fontStyle?: string;
	letterSpacing?: number | string;
	lineHeight?: number | string;
}

// FIELD-STYLES (native compound controls): the value shape of Framer's
// ControlType.Border, restricted to the keys this engine consumes. All
// optional — Framer only includes what the author set. Per-side widths are
// the compound control's segmented mode; the engine renders the max side so
// a per-side author value still takes effect.
interface FramerBorderStyle {
	borderWidth?: number;
	borderTopWidth?: number;
	borderRightWidth?: number;
	borderBottomWidth?: number;
	borderLeftWidth?: number;
	borderStyle?: string;
	borderColor?: string;
}

// FIELD-STYLES (hard rule): the shared per-field style-override model behind
// every field type's "Styles" submenu in the Framer panel. ONE architecture,
// three control sets (input-like / choice / checkbox) that expose exactly the
// subset meaningful for that field type — never fake controls. Every key is
// optional: an unset key falls back to the engine theme token, so the default
// appearance is preserved unless the author explicitly changes a value.
// Per-field isolation: overrides live on the field's own config object and can
// never affect another field (AGENTS.md).
interface FieldStyleOverrides {
	/** Control typography (input text / option labels). Weight is ignored
	 *  on segmented options, which stay 600 per the shared-thumb rule. */
	font?: FramerFont;
	/** The field label's typography. */
	labelFont?: FramerFont;
	labelColor?: string;
	/** Text/input content color — also option text on choice groups. */
	textColor?: string;
	/** Placeholder text color (inputs; the empty-select hint). Renders for
	 *  real via the .be-input::placeholder CSS-variable rule and the
	 *  select's empty-hint color branch — a first-class style, not a stub
	 *  (AGENTS.md). */
	placeholderColor?: string;
	/** Input / option / segmented-track surface color. */
	backgroundColor?: string;
	/** NEW (native compound): one logical Border control — color, width and
	 *  style in a single value. Wins over the legacy scalar keys below. */
	border?: FramerBorderStyle;
	/** LEGACY scalar border keys — still honored for instances saved before
	 *  the compound Border control existed (and still written by the
	 *  compound control's runtime shape on old canvases). */
	borderColor?: string;
	borderWidth?: number;
	/** NEW (native compound): CSS radius string from ControlType.BorderRadius
	 *  ("12px", or four per-corner values "12px 4px 12px 4px"). The legacy
	 *  single-number form is still honored. */
	radius?: number | string;
	/** NEW (native compound): CSS padding string from ControlType.Padding
	 *  ("10px 14px", per-side segmented forms supported). The legacy
	 *  vertical/horizontal number pair is still honored. */
	padding?: string;
	/** LEGACY scalar padding keys — see `padding`. */
	paddingY?: number;
	paddingX?: number;
	/** Focus/active border color (inset focus ring on .be-input). */
	focusBorderColor?: string;
	/** Minimum control height (inputs, options). */
	minHeight?: number;
	/** Label ↔ control ↔ error spacing inside the field column. */
	spacing?: number;
	/** Selected/active option surface (choice groups). */
	selectedBackgroundColor?: string;
	selectedTextColor?: string;
	selectedBorderColor?: string;
	/** Native checkbox accent + square size. */
	accentColor?: string;
	checkSize?: number;
	/** DECOR: native Framer box-shadow string. Applied only when set to
	 *  a real shadow — "none"/empty means no shadow layer, so state
	 *  rings (selected/hover/focus) are never stomped and unopened
	 *  groups change nothing. */
	shadow?: string;
	/** DECOR: backdrop-blur radius in px (frosted glass over imagery).
	 *  Applied only when > 0; 0/unset means no backdrop layer. */
	backgroundBlur?: number;
}

interface FieldConfig {
	id?: string;
	label: string;
	fieldType: FieldType;
	placeholder?: string;
	required: boolean;
	options?: Array<string>;
	// W1-08-F-08-06 fix: parallel per-option values, aligned by index with
	// `options` — lets authors disambiguate duplicate labels (two "Apple"s)
	// so the round-trip selection lands on the option the visitor clicked.
	// Empty/absent entries fall back to using the label as the value
	// (identical to pre-fix behavior).
	optionValues?: Array<string>;
	// T10-L4 fix: parallel per-option image URLs and descriptions, aligned
	// by index with `options`. Empty arrays keep the plain text-only cards.
	optionImages?: Array<string>;
	optionDescriptions?: Array<string>;
	// AUTHOR-DEFAULT-SELECTION: optional pre-selected option for the
	// ChoiceGroup variants (segmented/pills/cards/radio). Empty/undefined
	// keeps the historical behavior (first non-empty option). When set it
	// must match an option label (or entry of `optionValues`); a value
	// that matches nothing falls back to the first option — never empty.
	defaultOption?: string;
	// T10-M4 fix: optional per-field input length cap. 0/undefined means
	// "use the built-in default for this field type" (see effectiveMaxLength).
	maxLength?: number;
	// FINAL-80 fix: optional textarea height in rows. Undefined keeps the
	// historical 4-row default; settable via code override (the fixed panel
	// schema doesn't author per-field extras).
	rows?: number;
	width: "full" | "half";
	isPrimaryName?: boolean;
	// T3-M8 fix: optional Cal.com custom-field id. When set, the field's
	// value is sent in `bookingFieldsResponses` on the booking POST instead
	// of only ever appearing inside the free-text notes.
	calFieldId?: string;
	// VALIDATION-REMOVED (rule 100): NO validation controls exist —
	// no Validation dropdown, no Min/Max Length, no Regex Pattern. The
	// keys below stay ONLY as internal/legacy carriers: normalizeSteps
	// forces authored fields to neutral (`validationRule: "type"`,
	// `minLength: undefined`, `maxLength: 0`, no custom pattern) so any
	// stored author override can never take effect; the engine validates
	// purely by fieldType with fixed per-type caps. `minLength` is still
	// set programmatically for auto-injected Cal.com fields (which bypass
	// normalizeSteps). Never re-add a control for any of these, and never
	// read a stored override as configuration again.
	validationRule?:
	| "type"
	| "none"
	| "email"
	| "phone"
	| "min-length"
	| "custom-regex";
	minLength?: number;
	customRegex?: string;
	// Legacy canvas-only regex test input. Control removed; never read.
	regexPreviewInput?: string;
	// FIELD-STYLES (hard rule): per-field visual overrides. Three keys, ONE
	// shared model (FieldStyleOverrides) — the panel shows exactly one
	// "Styles" submenu per field type: input-like fields (text/email/phone/
	// textarea/select) use `styles`, choice groups use `choiceStyles`,
	// checkbox uses `checkStyles`. Unset keys keep the engine theme look.
	styles?: FieldStyleOverrides;
	choiceStyles?: FieldStyleOverrides;
	// STYLES-INIT-PER-VARIANT: segmented/pills/cards/radio each own a
	// Styles key whose control defaults equal that variant's effective
	// defaults. choiceStyles stays select's live key and the legacy
	// fallback merged underneath the variant keys (see
	// mergeStyleOverrides), so saved instances keep every override.
	segmentedStyles?: FieldStyleOverrides;
	pillsStyles?: FieldStyleOverrides;
	cardsStyles?: FieldStyleOverrides;
	radioStyles?: FieldStyleOverrides;
	checkStyles?: FieldStyleOverrides;
	// CAL-BG-OWNERSHIP: the Calendar Widget marker's own Styles set. Its
	// Background/Radius/Padding own the calendar surface — the global
	// Background token no longer applies to it (see DateAndTimeInline).
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
	// No Property Control by design: `style` is injected by the Framer
	// runtime ({ width/height } under fixed sizing) and spread onto the
	// root element — it is a platform surface, not an author-facing prop.
	style?: React.CSSProperties;
	styles: {
		// THEME-AGNOSTIC (hard rule): no component-level Light/Dark/Auto
		// mode selector. The engine consumes ONE light/default semantic
		// palette. FIVE independent author controls (COLOR-SYSTEM, rule 90):
		// Accent, Primary Foreground, Surface, Text, Border — website-level
		// theme differences are the author's job via Framer Color Variables
		// assigned to these controls (see AGENTS.md). There is deliberately
		// NO Background control (transparent root; calendar owns its own
		// surface) and NO Error control (fixed internal #DC2626). Text
		// Secondary and Success are derived internally via withAlpha at
		// fixed design ratios — see the engine body.
		accentColor: string;
		// PRIMARY-FOREGROUND: semantic On-Primary token for text/icons
		// rendered directly on Primary/Accent-colored surfaces (selected
		// date/slot, primary buttons, adjacent-month tooltip). An independent
		// author-configured value — never derived from or validated against
		// the Primary colour (see AGENTS.md hard rules).
		accentForegroundColor: string;
		surfaceColor: string;
		textPrimaryColor: string;
		// BORDER: the one border token. Rendered verbatim everywhere a
		// border is drawn (inputs, cards, calendar cells, dividers). A
		// control named Background must never control a border (rule 90).
		borderColor: string;
		// W1-17-F-17-13 fix: Framer's BorderRadius control can emit either
		// a CSS size string ("12px") or a numeric radius; the interface
		// previously claimed `string`, so numeric values were a silent type
		// lie. All consumers (CalendarCell/Grid, TimeSlotButton/List,
		// StepBody/ReviewStepBody/FieldRenderer) are widened to match.
		borderRadius: string | number;
		// FIELD-GAP (hard rule): spacing between fields in the field grid.
		// Single source of truth — control default 16px, range 0–32px,
		// clamped again at runtime (same dual enforcement as Radius).
		// Replaces the old hard-coded 12px grid gap (AGENTS.md).
		gap?: number;
	};
	font: FramerFont;
	// Per-surface heading typography (step + success + error titles).
	// The base `font` above stays the body control.
	headingFont?: FramerFont;
	// Animation — variant (style) + duration (speed). Variant is the single
	// source of truth for which of the 6 production concepts is used.
	transition: Transition;
	transitionVariant?:
	| "fadeRise"
	| "blurScale"
	| "slide"
	| "zoom"
	| "verticalSlide"
	| "blurSlide";
}

// BUTTON-GROUPS: per-button Text + style overrides inside the Buttons
// group (mirrors the field Styles model). Every group is optional — an
// unopened group leaves the button on its role default, so existing
// canvases render byte-identically. `text` falls back to the legacy
// flat label key (author customizations from before the grouping
// survive), then to the shipped default.
// BUTTON-INTERACTION: per-state overrides inside a button group (Hover
// / Pressed submenus). Every key is a delta over the button's base
// style — unset means "same as base". No layout-affecting rows (no
// font/size swaps that would shift layout on hover).
interface ButtonInteractionState {
	/** Framer native transition into this state (first row). */
	transition?: Transition;
	/** 1 = no zoom. Applied as transform: scale(). */
	scale?: number;
	/** 1 = fully opaque. */
	opacity?: number;
	textColor?: string;
	backgroundColor?: string;
	/** Full Framer Border submenu (color + width + style, like the base
	 *  button Border). Width 0 (the default) means "keep the button's
	 *  normal border" — set 1+ to override it in this state. */
	border?: FramerBorderStyle;
	/** Applied only when a real shadow (see shadowStyle). */
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
	/** DECOR: see FieldStyleOverrides.shadow/backgroundBlur. */
	shadow?: string;
	backgroundBlur?: number;
	hover?: ButtonInteractionState;
	pressed?: ButtonInteractionState;
}
// ===== Copy =====
interface BookingEngineCopyProps {
	// Navigation & action button copy, grouped into one control (see
	// Requirement 5) the same way `styles`/`font`/`copy` are grouped below.
	// Each button owns a group (Text + full style set); the legacy flat
	// label keys stay readable (optional) so pre-grouping canvases keep
	// their custom copy.
	buttonLabels: {
		continueButton?: ButtonStyleGroup;
		backButton?: ButtonStyleGroup;
		finalActionButton?: ButtonStyleGroup;
		// SYN-03 fix: the "Cancel" affordance shown while a booking POST is
		// in flight — the last footer button without a label control.
		cancelButton?: ButtonStyleGroup;
		continueLabel?: string;
		backLabel?: string;
		finalActionLabel?: string;
		cancelSubmitLabel?: string;
		// NAV-GROUP-TOGGLE: lives inside the Buttons group. Default (false /
		// undefined) keeps the Split layout — Back far left, primary action
		// far right (see AGENTS.md hard rules).
		groupNavButtons?: boolean;
		// CONFIRM-ACTIONS: confirmation-state labels live in the Buttons
		// group because they configure confirmation buttons. Defaults keep
		// the pre-existing copy ("Done" / "Book another" / "Add to calendar").
		doneButton?: ButtonStyleGroup;
		bookAnotherButton?: ButtonStyleGroup;
		addToCalendarButton?: ButtonStyleGroup;
		doneLabel?: string;
		bookAnotherLabel?: string;
		addToCalendarLabel?: string;
		// HOME-URL-REMOVED: "Done" always navigates to the website root
		// ("/") — the Home URL control is gone by author direction, the
		// destination is fixed in the component (DEFAULT_CONFIRM_HOME_URL)
		// and never exposed. The success screen never auto-redirects.
	};
	// Copy (fix #20: configurable terminal-state strings)
	copy: {
		successTitle: string;
		successSubtitle: string;
		errorTitle: string;
		errorSubtitle: string;
		retryLabel: string;
		loadingAvailabilityLabel: string;
		noTimesLabel: string;
		submittingLabel: string;
		// T3-L3 fix: optional support-contact path on the error screen -
		// empty value hides the link, so existing instances are unaffected.
		supportContactLabel: string;
		supportContactValue: string;
		// T3-I3 fix: explicit marker that the success screen's time is shown
		// in the visitor's own (selected) timezone.
		timeZoneLabel: string;
		// T3-M3 fix: calendar-event summary text instead of the bare
		// literal "Booking".
		icsSummaryLabel: string;
		// T10-H4 fix: the remaining hardcoded visitor-facing strings are
		// exposed too. The PropertyControl defaults are the single source
		// (W1-02-F24 — no in-component `||` fallbacks left to drift).
		stepCounterTemplate: string;
		// W1-10-N3 fix: group label for the 12h/24h time-format toggle.
		timeFormatLabel: string;
		availabilityErrorLabel: string;
		dateLabel: string;
		timeLabel: string;
		// T10-H5 fix: extra calendar-provider deep links on the success
		// screen, alongside the .ics download.
		googleCalendarLabel: string;
		outlookCalendarLabel: string;
		// W1-02-F9–F23 fix (bundle 14): confirmation/manage-link labels,
		// empty-state copy, AM/PM suffixes, .ics PRODID/SUMMARY, notes
		// section headers, error fallbacks and the demo-grid times.
		confirmationNumberLabel: string;
		rescheduleOrCancelLabel: string;
		editLabel: string;
		pickDateToSeeTimesLabel: string;
		noTimesFallbackLabel: string;
		selectOptionLabel: string;
		stepProgressLabel: string;
		// W1-02-F4/F6/F7 fix: announcement template + counter format +
		// required marker are now copy-driven (see constants).
		stepAnnouncementTemplate: string;
		unknownErrorLabel: string;
		errorFallbackMessage: string;
		amLabel: string;
		pmLabel: string;
		icsProdid: string;
		icsSummaryFallback: string;
		// FINAL-06 fix: author-facing ICS LOCATION text (where to go).
		// Empty string omits the LOCATION line entirely, preserving the
		// historical output for virtual bookings.
		icsLocationLabel: string;
		// FINAL-07 fix: Cal.com event-info panel copy that was previously
		// hardcoded module constants (misclassified as "Cal.com data").
		calEventMetaLoadingAria: string;
		calEventMetaUnavailableCopy: string;
		// FINAL-09 fix: localisable duration suffixes (info panel).
		hourSuffix: string;
		minuteSuffix: string;
		notesSelectedTimeLabel: string;
		notesDatePrefix: string;
		notesTimePrefix: string;
		demoStartTime: string;
		demoEndTime: string;
		demoInterval: number;
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
		// W1-02-F4–F8 fix (bundle 17): all Cal.com error surfaces behind one
		// nested group; the engine merges over ERROR_COPY_DEFAULTS so old
		// canvases without the group keep working.
		errorCopy: ErrorCopy;
		// SYN-01 fix: the addPropertyControls `validation` group is nested
		// INSIDE this `copy` object control (sibling of aria/errorCopy), so
		// Framer persists author edits to props.copy.validation.*. The
		// interface now declares it here to match the schema; the top-level
		// `validation` prop below remains only as a legacy fallback for
		// instances saved before the group was nested.
		validation?: Partial<ValidationCopy>;
	};
	// SYN-01 fix (legacy path): T4-H3 originally declared `validation` as a
	// top-level sibling of `copy`; instances saved while that schema was
	// live hold their values here. The runtime reads `copy.validation`
	// first and falls back to this prop.
	validation?: Partial<ValidationCopy>;
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
// Scoped exception: the per-field choice-Array controls (`options`,
// `optionValues`, `optionImages`, `optionDescriptions` — all inside each
// step's `fields` list) DO use `hidden`, keyed off that same field's own
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
	// Progress - grouped object control (Visible + Step Count Text
	// Position + Show Text Content + Bar Style).
	progressBar: {
		visible: boolean;
		stepCountPosition: "top" | "bottom";
		showTextContent: boolean;
		barStyle: "solid" | "dashed";
	};
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
	calApiKey: string;
	calEventTypeId: string;
	// TZ-TIME-HARD-RULE: the 12h/24h time format is a per-visitor runtime
	// concern only. It must never be presettable from Properties Controls —
	// the engine always defaults to 12h and lets the END USER toggle it on
	// the live widget (see `timeFormat` state below). `defaultTimeFormat`
	// was deliberately removed (see AGENTS.md hard rules).
	//
	// TZ-TIME-HARD-RULE: the visitor's time zone is ALWAYS auto-detected
	// from the browser via `detectTimezone()`. There is no time-zone list,
	// no manual time-zone selector, and no Properties-Controls time-zone
	// control — `timezones` was deliberately removed (see AGENTS.md).
	// W1-02-F26 fix: Cal.com v2 API base URL — lets self-hosted Cal.com
	// deployments use the engine without forking. Default: Cal.com cloud.
	calApiBaseUrl?: string;
	// LOCALE-REMOVED: the `locale` Property Control (FINAL-12) was removed:
	// date formatting always follows <html lang>, then the browser default.
	// There is no author locale override and no such prop.
	// SESSION-KEY-REMOVED: the `sessionStorageKey` Property Control
	// (FINAL-14) was removed: the base autosave key is always
	// "booking-engine:session", namespaced per instance by DOM position
	// (INSTANCE-ISOLATION). Autosave itself is always-on (AGENTS.md rule 7).
	// DURATION-SOURCE (hard rule): removed — Cal.com event metadata is the
	// single source of truth for the meeting duration. There is no
	// author-facing duration fallback control and no props fallback; see
	// `meetingDurationMs` in the state hook.
	// T10-M1 fix: analytics hook. The component fires a small set of events
	// with serializable payloads - `step_complete`, `booking_submitted`,
	// `booking_success`, `booking_error` - through this callback. No
	// property control: wire it from a code override (e.g. window.dataLayer
	// or a segment/posthog SDK call). Errors thrown by the callback are
	// caught and logged, never allowed to break the booking flow.
	onAnalytics?: (eventName: string, payload?: Record<string, unknown>) => void;
}

interface BookingEngineProps
	extends BookingEngineStyleProps,
	BookingEngineConfigProps,
	BookingEngineCopyProps { }

// W1-04-L3 fix: the old `[^\s@]+@[^\s@]+\.[^\s@]{2,}` accepted
// "user@domain..com" (double dot), "user@.com" (no domain) and
// "user@domain.com." (trailing dot) because `[^\s@]` includes `.` and the
// structure was one blob + one literal dot. Now the domain is DNS-label
// shaped: one or more alnum labels (single hyphen allowed inside) joined by
// single dots, TLD at least two alnum chars, nothing before/after.
// W1-04-F-4 fix: the TLD was `[A-Za-z0-9]{2}...` — "user@example.123" and
// "user@example.1a2" passed. Real TLDs start with a letter: strict
// `[A-Za-z]{2,}` (punycode/IDN TLDs are out of scope for an ASCII regex).
const EMAIL_REGEX =
	/^[^\s@]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
// W1-04-C1 fix: accepts E.164/international formats with 3-6 digit groups,
// optional parens on any group, and separators (space/-/.) — e.g.
// "+1 (555) 555-5555", "+44 20 7946 0958", "+33 1 42 68 53 00". The loose
// structure is intentional: validatePhone() separately requires >= 7 digits.
const PHONE_REGEX =
	/^\+?[(]?\d{1,4}[)]?(?:[-\s.]?[(]?\d{1,4}[)]?){2,5}[-\s.]?\d{1,9}$/;

// T7-M6 fix: named constants for repeated magic numbers (touch targets,
// compact breakpoint, calendar grid size, Progress height, icon sizes).
const TOUCH_TARGET_MIN = 44;
const COMPACT_BREAKPOINT = 768;
const CALENDAR_WEEKS_TO_RENDER = 6;
const PROGRESS_BAR_HEIGHT = 4;
const CHECKMARK_ICON_SIZE = 64;
const ERROR_ICON_SIZE = 40;
// T7-M6 completion (5th pass): the remaining layout breakpoints are named.
const CHOICE_COLUMNS_BREAKPOINT_WIDE = 560;
const CHOICE_COLUMNS_BREAKPOINT_MEDIUM = 380;
// W1-19-F-06 fix: renamed from PILLS_SINGLE_COLUMN_BREAKPOINT — the old
// name described the opposite of what the constant does. Below 420px the
// pill options stop flowing at natural width and go TWO per row (each
// 50% wide); there is no single-column state anywhere in that code path.
const PILLS_TWO_PER_ROW_BREAKPOINT = 420;
// T9-M2/T9-M11 fix: animation configs hoisted to module level so the
// Progress and the 12h/24h toggle never allocate new transition/
// animate objects per render.
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
// T8-L3 fix: hoisted field-type lists - hidden() callbacks run on every
// properties-panel render, so the arrays are allocated once at module load
// instead of fresh on every callback invocation.
const CHOICE_FIELD_TYPES = ["select", "segmented", "pills", "cards", "radio"];
const TEXT_FIELD_TYPES = ["text", "textarea"];
// T7-H8 fix: default ICS meeting duration when the Cal.com slot lacks an end.
const DEFAULT_MEETING_DURATION_MS = 30 * 60 * 1000;
// W1-02-F26 fix: Cal.com v2 base URL is author-configurable so self-hosted
// deployments can point at their own instance. Trailing slashes are stripped
// at the use site (the path builder appends "/v2/...").
const DEFAULT_CAL_API_BASE_URL = "https://api.cal.com";
// The `cal-api-version` header value sent with the slots + meta calls.
// Internal only — not a Property Control; adopting a new Cal.com API
// version is a component code update (see AGENTS.md).
const DEFAULT_CAL_API_VERSION = "2024-09-04";
// BOOKING-VERSION fix: the booking POST does NOT use the version above.
// Cal.com routes bookings controllers by version — sending the slots
// version (2024-09-04) makes POST /v2/bookings fall through routing and
// fail with 404 NotFoundException ("Cannot POST /v2/bookings") on the
// live site. Per Cal.com's current bookings docs, the create-booking
// controller requires `cal-api-version: 2024-08-13`. Slots/meta stay on
// their proven version; only the POST pins this one.
const CAL_BOOKING_API_VERSION = "2024-08-13";
// Fixed, industry-neutral .ics download filename — never business-branded
// and never a Property Control (see AGENTS.md).
const DEFAULT_ICS_FILENAME = "Booking Appointment.ics";
// Fallback UID domain when crypto.randomUUID is unavailable (RFC 5545
// requires a UID; the domain after the @ is decorative on the non-UUID
// path). Internal compatibility detail — not a Property Control.
const DEFAULT_ICS_UID_DOMAIN = "@booking-engine";

// THEME-AGNOSTIC (hard rule): the old DEFAULT_DARK_THEME palette, the
// `ColorMode` ("light" | "dark" | "auto") prop and the prefers-color-scheme
// listener were removed. The Booking Engine is theme-agnostic at the
// component level: it exposes ONE light/default semantic palette through the
// Styles color controls and renders exactly the values the author configures.
// Website-level dark-mode designs are handled by the author assigning Framer
// Color Variables to those controls — the engine never owns the mode
// decision and never switches palettes itself (see AGENTS.md).

// NOTE (TZ-TIME-HARD-RULE): the old `COMMON_TIMEZONES` list was removed
// along with the "Time Zones" Properties-Controls array — the visitor's time
// zone is now always auto-detected from the browser in code (see AGENTS.md).

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
	};
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
				placeholder: "Anything we should know before your appointment?",
				required: false,
				width: "full",
			},
		],
	};
}

// Runtime fallback only (should not normally be reached — each stepN control
// always has its own defaultValue). Rebuilt fresh on every call, per Safety
// Rule #1. "Review" is no longer one of the shipped default personas
// (Requirement 2 — it isn't a selectable step type any more), so slot 3
// onward all fall back to a blank form step.
function getRuntimeFallbackStep(index: number): StepConfig {
	if (index === 0) return makeDefaultFormStep();
	if (index === 1) return makeDefaultCalendarStep();
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

// SSR/hydration fix: window.matchMedia("(pointer: coarse)") read during render
// gave touch devices a 16px input font on the client while the SSR HTML was
// served with 14px (React #418 attribute mismatch). Start at the
// server-identical `false`, switch post-hydration. Pointer capability never
// changes mid-session, so one mount-time read is enough.
function useCoarsePointer(): boolean {
	const [coarse, setCoarse] = React.useState<boolean>(false);
	// PRERENDER-DEFER: the prerender browser always reports a fine pointer,
	// so an unconditional mount read baked `false` into the served HTML —
	// which happens to equal the initial state. Keep that guarantee
	// explicit: the read waits for an interactive client, so the served
	// markup can never diverge from the visitor's first render.
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
			// non-fatal: fine-pointer rendering is the safe default
		}
	}, [beInteractive]);
	return coarse;
}

// SSR/hydration fix (storage keys only): React.useId() is NOT
// hydration-stable inside Framer code components, and — as it turned out —
// neither are ""-initialised state + mount-effect ids. Framer serves real
// browsers a HEADLESS-PRERENDERED HTML where component effects have ALREADY
// run (`be-spin-be-engine-5`, `be-field-1-…`), while other clients (curl,
// no-store fetches) get a plain renderToString variant (`be-spin-`, `-be-field-…`).
// The hydrating client's FIRST render carries initial state (""), so any
// state/effect/useId-derived markup mismatches one of the two served
// variants — the exact #425 ("text content did not match", the <style>
// keyframes), #418 (attribute, every field's id/for pair) and #422
// recovery errors this site logged. EVERYTHING rendered must therefore be
// a plain constant or props-derived (see gridLabelId, be-dt-scroll,
// be-spin, be-field-*, be-slot-error, be-timezone-select). This hook is
// now used for the sessionStorage key ONLY — never for rendered markup —
// because the key is not part of the tree and needs per-instance
// uniqueness on multi-engine pages.
let hydrationSafeIdCounter = 0;
function useHydrationSafeId(prefix: string): string {
	const [id, setId] = React.useState<string>("");
	React.useEffect(() => {
		hydrationSafeIdCounter += 1;
		setId(`${prefix}-${hydrationSafeIdCounter}`);
	}, [prefix]);
	return id;
}

// W1-07-F1 fix: `Intl.DateTimeFormat(tz).format()` throws RangeError on an
// invalid IANA timezone string (e.g. a corrupted sessionStorage restore).
// One validator used at every boundary where a tz string enters the engine —
// the restore point, slot-map timezone, and the success screen — so a bad
// string degrades to "UTC" instead of hijacking the helper's silent-fallback
// path (which only masks the problem locally while the fetch URL still gets
// the bad string and 400s).
function isValidTimeZone(tz: string | null | undefined): tz is string {
	if (!tz) return false;
	try {
		Intl.DateTimeFormat("en", { timeZone: tz });
		return true;
	} catch {
		return false;
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
	id: string;
}

interface NormalizedStep extends Omit<StepConfig, "fields"> {
	id: string;
	fields: NormalizedField[];
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
					options: field.options || [],
					// VALIDATION-REMOVED (rule 100): authored validation
					// overrides are neutralized at this single choke point
					// — stored `validationRule`/`minLength`/`maxLength`/
					// `customRegex` from older canvases can never take
					// effect. Neutral = built-in per-type behavior:
					// "type" inference, default min 3, default max cap.
					// (Auto-injected Cal.com fields bypass normalizeSteps,
					// so their programmatic minLength survives.)
					validationRule: "type" as const,
					minLength: undefined,
					maxLength: 0,
					customRegex: undefined,
					regexPreviewInput: undefined,
				})),
			}))
			// T10-M9 fix: a form step with zero fields renders as dead air on
			// the published site (title + Continue, nothing to fill in). Drop it
			// from the pipeline entirely; the canvas-only warning (see
			// emptyStepWarnings) still tells the author why their step vanished.
			.filter((step) => !(step.stepType === "form" && step.fields.length === 0))
			// Review step removed: pre-booking review no longer exists (success
			// details are shown post-booking). Any persisted "review" step is
			// dropped silently so old canvases migrate without a hard error.
			.filter((step) => (step.stepType as string) !== "review")
	);
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
// FINAL-16 fix: the old "only ever called from handleContinue" claim here
// was stale. `validateStep` is called from: handleContinue (gate + error
// surfacing), the saved-progress restore path (re-validating a restored
// step before trusting it), and the review-step body (summarising which
// prior steps still hold invalid answers). The Requirement-3 invariant is
// narrower and still true: validateStep never runs PER KEYSTROKE — field-
// level live revalidation in handleFieldChange uses validateField only.

const MIN_TEXT_LENGTH = 3;

// T4-H3 fix: validation messages are author-configurable via the Copy panel
// (validation.*) instead of hard-coded in the validator; the validator
// takes a read-only slice and falls back to these shipped defaults.
type ValidationCopy = {
	requiredFieldError: string;
	emailError: string;
	phoneError: string;
	minLengthError: string;
	maxLengthError: string;
	pickDateTimeError: string;
	pastTimeError: string;
	customRegexError: string;
	invalidRegexError: string;
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
	customRegexError: "This value doesn't match the required format",
	invalidRegexError: "This field's custom regex pattern is invalid",
	minLength: MIN_TEXT_LENGTH,
};

function validateField(
	field: NormalizedField,
	value: string | boolean | undefined,
	validationCopy?: ValidationCopy,
): string | null {
	const vc = validationCopy ?? DEFAULT_VALIDATION_COPY;
	// The Calendar Widget "field" is just a drag-and-drop placeholder that
	// marks where the calendar/time picker renders in the fields list — it
	// has no value of its own and is never validated (its own error, "Please
	// pick a date and time", is tracked separately via __selectedSlot).
	if (field.fieldType === "calendar-widget") return null;
	// Fix #9: required checkbox treats value===false as empty.
	if (field.fieldType === "checkbox" && field.required && value !== true) {
		return vc.requiredFieldError;
	}
	// T4-H1 fix: whitespace-only strings count as empty - a value of nine
	// spaces used to clear both the required check and the min-length check.
	// T7-H2 fix: value is now string | boolean | undefined - the dead
	// Array.isArray branch (and the impossible null comparison) are gone.
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
	// Max-length is an internal constraint only — no always-visible
	// counter. Surface the same field-level error style as required
	// when the value is over the cap (restore / paste / no HTML cap).
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
	// VALIDATION-REMOVED (rule 100): no per-field rule overrides exist.
	// Every check below derives purely from fieldType with fixed caps
	// (text/textarea min 3; email format + 254 max; phone format + 7
	// digits + 40 max; choice/checkbox required-only; calendar-widget
	// never). `field.minLength` survives only as the internal carrier
	// for auto-injected Cal.com fields (authored fields are neutralized
	// in normalizeSteps, so this is always the built-in 3 for them).
	const minLength = field.minLength ?? vc.minLength;
	// W1-20-H3 fix: min-length validation must NEVER fire on optional
	// fields — a partially filled optional field (e.g. "ab") used to
	// block submission with "too short". An optional field either stays
	// empty (valid, by definition) or may hold anything the visitor wants.
	// Required fields keep the length gate so "3" doesn't pass as a name.
	// FINAL-18 fix: count Unicode CODE POINTS, not UTF-16 code units —
	// "👍👍" is 2 characters to a human but 4 code units, so emoji-heavy
	// input could pass minLength=3 while being visibly too short.
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

// Shared phone rule (T4-M3 fix): the loose format regex alone accepted
// "12345" - a plausible-looking string is not a phone number. Require at
// least 7 digits so short, unusable values fail clearly.
// W1-04-F-3/F-5 fixes: the email path trimmed, the phone path didn't — a
// pasted trailing space failed the anchored regex. The digit-count check also
// rejects short, unusable numbers while accepting standard digits-only input.
function validatePhone(str: string, vc: ValidationCopy): string | null {
	const trimmed = str.trim();
	if (!PHONE_REGEX.test(trimmed)) return vc.phoneError;
	// FINAL-17 fix: PHONE_REGEX's per-group optional parens accepted
	// unbalanced/misnested input like "(555-555-5555" or "555)-555(".
	// Strip every well-formed "(digits/symbols)" pair; any paren left
	// over means an unmatched "(" / ")" / wrong-order group.
	const withoutPairs = trimmed.replace(/\([^()]*\)/g, " ");
	if (/[()]/.test(withoutPairs)) {
		return vc.phoneError;
	}
	const digits = trimmed.replace(/\D/g, "").length;
	if (digits < 7) return vc.phoneError;
	return null;
}

// PHONE-NUMBERS-ONLY fix: type="tel" / inputMode="tel" are only KEYBOARD
// HINTS — desktop and external keyboards still accept letters. The phone
// field strips everything outside the phone charset at its single write
// point (FieldRenderer's onChange), so letters never enter engine state
// and — the input is controlled — never appear in the field, typing AND
// pasting (author direction: numbers only, nothing else visible). The
// allowed set is exactly what PHONE_REGEX/validatePhone accept: digits,
// a leading-formatting "+ ( ) - . " and spaces. The payload builders
// sanitize once more at the boundary (defense in depth, no-op by then).
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
	// Fix #5: datetime step now returns a real error message when no slot is
	// picked, so the user sees "Please pick a date and time" instead of a
	// silent block. Calendar steps can also carry custom fields now - those
	// are validated exactly like fields on a Form step.
	if (step.stepType === "datetime") {
		const errors: Record<string, string | null> = {};
		for (const field of step.fields) {
			errors[field.id] = validateField(field, values[field.id], validationCopy);
		}
		const slot = values[SELECTED_SLOT_KEY];
		if (!slot) {
			errors[SELECTED_SLOT_KEY] = vc.pickDateTimeError;
		} else {
			// T4-L3 fix: a slot whose start time has already passed (stale
			// page, back-navigation, timezone flips) was accepted as-is —
			// the booking could be created in the past. Reject past starts.
			// W1-12-F-12-12 fix: guard the corrupted-slot branch — a restored
			// `__selectedSlot` missing `date` (or holding an invalid one)
			// used to throw `TypeError` on `slot.date.getTime()`, and the
			// restore effect's catch block responded by purging ALL saved
			// storage (data loss from one corrupted nested field). A slot
			// with neither a valid ISO `time24h` nor a valid `date` is
			// treated as "no slot picked".
			const slotDateMs =
				slot.date instanceof Date && !Number.isNaN(slot.date.getTime())
					? slot.date.getTime()
					: Number.NaN;
			const isIsoSlot = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h);
			let startMs: number;
			if (isIsoSlot) {
				startMs = new Date(slot.time24h).getTime();
			} else if (!Number.isNaN(slotDateMs)) {
				// W1-07-N6 fix: demo-slot `time24h` is a bare "HH:MM" —
				// the old fallback used the CELL-MIDNIGHT epoch, so every
				// slot on today's demo cell read as "already in the past"
				// after midnight and was rejected at Continue even though
				// the slot list plainly showed it as upcoming. Reconstruct
				// the picked instant (cell midnight + HH:MM) the same way
				// isTimeElapsed does, so the two paths agree.
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
	// ReviewStepBody removed (rule 75): persisted "review" steps are dropped
	// by the normalizeSteps filter above, so validateStep can never see one.
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

// =============================================================================
// Cal.com v2 API controller
// =============================================================================
// Implements:
//   - GET /v2/slots?eventTypeId=&start=&end=&timeZone=
//   - POST /v2/bookings
// All responses are parsed defensively — the engine degrades to "no slots" or
// a friendly error message rather than throwing on unexpected shapes.

interface CalSlot {
	start: string;
	// SYN-07 fix (live-OpenAPI verified): `end` is only present with
	// format=range (which the fetch below now requests); the default `time`
	// format and the legacy seated-slot shape omit it, so it is optional
	// while `start` is mandatory.
	end?: string;
}

// T7-H4 fix: runtime type guard - replaces the unsafe `as CalSlot[]` cast
// on the flattened Cal.com response. The old truthiness filter only checked
// `s && s.start`; this verifies the shape.
// SYN-07 fix (live-OpenAPI verified): Cal.com v2 documents slot objects as
// { start, end } (format=range) or { start } (format=time); seated events add
// { time, bookingUid }. Accept all three defensively — `time` feeds `start`,
// `end` stays optional — so a server that ignores `format` can never render
// an empty calendar with no error.
//
// W1-15-TS-10 fix: the old `isCalSlot` type guard claimed `s is CalSlot`
// even for the seated { time, bookingUid } shape where `start` is ABSENT —
// the guard's local `start` fallback was never written back to the object,
// so downstream consumers read `slot.start === undefined` (Invalid Date,
// NaN minutes, un-selectable row). A mapper instead: normalize every
// accepted shape into a REAL CalSlot (the `time` fallback baked INTO the
// returned object) or null. Framer-compatible: internal helper, same
// return type downstream.
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
	// T3-H4 fix: lets callers force a fresh fetch (retry after a failed
	// submission, error-banner retry) instead of being stuck with whatever
	// was fetched on step entry.
	refetch: () => void;
}

// Shared cache key: month (local Y/M) + the timezone the fetch used, since
// slot data is timezone-dependent. T3-H4 fix: hoisted so `refetch` can clear
// the exact same key the fetch effect reads.
// W2-33-A1 / W1-05-F1 fix: apiKey + eventTypeId are part of the key too -
// an author swapping Cal.com credentials or event type in Framer used to be
// served the previous configuration's cached slots (stale availability,
// wrong booking target) because the key only covered month + timezone.
function monthCacheKey(
	monthStart: Date,
	timeZone: string,
	apiKey: string,
	eventTypeId: string,
	// FINAL-10 fix: slots fetched from one deployment must never be served
	// for another (mid-session self-hosted-URL swap), so the stripped base
	// URL is part of the cache identity.
	apiBase: string,
): string {
	// W1-05-N5 fix: the key used browser-local getFullYear()/getMonth(),
	// which mislabels the visitor-tz month when the browser tz and the
	// visitor tz straddle a month boundary. getDateKeyInTimeZone already
	// produces the visitor-tz "YYYY-MM" the slot fetch window is built
	// around, so the key now matches the month actually requested.
	return `${getDateKeyInTimeZone(monthStart, timeZone || "").slice(0, 7)}|${timeZone}|${apiKey}|${eventTypeId}|${apiBase}`;
}

// CC-15 fix: shared timeout for both Cal.com calls. 18s comfortably covers a
// slow-but-working connection while still recovering a stranded visitor well
// before they'd give up and leave. Internal only — not a Property Control;
// `useCalcomSlots` and `submitCalcomBooking` both default to it.
const FETCH_TIMEOUT_MS = 18000;

// =============================================================================
// BE-DIAG (scoped booking diagnostics — removable)
// =============================================================================
// Concise, structured console diagnostics for the Cal.com request lifecycle
// and the booking POST. Deliberately NOT a Property Control: it exists to
// make the request/submit behavior observable in the browser console without
// touching the author-facing panel. Disable with `window.__BE_DIAG__ = false`
// (e.g. from a snippet or a console one-liner); the default is ON because an
// unnoticed failure is what shipped here before. Every event is one
// console.info line with a stable `[BookingEngine]` prefix and a JSON-ish
// payload that NEVER contains the API key (not even a fingerprint) and never
// contains visitor field values (only shapes/lengths/presence).
const BE_DIAG_PREFIX = "[BookingEngine]";

function beDiagEnabled(): boolean {
	if (typeof window === "undefined") return false;
	const w = window as unknown as { __BE_DIAG__?: boolean };
	return w.__BE_DIAG__ !== false;
}

function beDiag(event: string, data: Record<string, unknown>): void {
	if (!beDiagEnabled()) return;
	try {
		console.info(`${BE_DIAG_PREFIX} ${event}`, data);
	} catch {
		// Diagnostics must never break the flow (frozen console, weird
		// embedders). Swallow silently — this is observability, not state.
	}
}

// Edge-case guard: some embedding environments strip/nominalize
// `console.info`. Route through whatever exists so the diag lines still land.
if (typeof console !== "undefined" && typeof console.info !== "function") {
	console.info = console.log.bind(console);
}

// Cross-request rate-limit memory. When ANY Cal.com call gets a 429, the
// timestamp lands here; the booking POST's catch consults it so an opaque
// network-layer failure (browser blocked a non-CORS 429 response →
// TypeError "Failed to fetch") is reported as the rate-limit category it
// almost certainly is, instead of the dishonest "check your connection".
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

// =============================================================================
// PRERENDER-DEFER (React #418/#425/#422 hard fix)
// =============================================================================
// Framer serves real browsers HTML captured from a HEADLESS browser in which
// component effects have ALREADY run (proven by the served ids in the
// hydration audit). Any effect that updates RENDERED state — the visitor
// clock, the calendar's self-seeded month, width measurement, Cal.com
// fetches — therefore bakes prerender-time values into the served HTML, and
// no visitor's first client render can reproduce them: the exact minified
// #425 (month/year text), #418 (wrapper/aside/style attributes) and #422
// recovery errors this page logged.
//
// The fix is a single "interactive client" gate: every environment-dependent
// effect consults it and stays at its initial (server-identical) value until
// the page is a REAL, interactive client. The prerendering automation browser
// (navigator.webdriver === true — Puppeteer/Playwright set it) NEVER flips it
// on its own, so the served HTML is a pure function of initial state, which
// is byte-identical to every visitor's first render. Real visitors flip it
// in a microtask right after module evaluation — i.e. before the first
// effects flush, still after the hydration comparison, which only inspects
// render output (the gate never appears in markup). QA automation that never
// qualifies gets the same deterministic first paint and flips the gate on
// its first real interaction.
//
// The renderToString variant (curl / no-store fetches) already matches: its
// effects never run at all.
let BE_INTERACTIVE = false;
const BE_INTERACTIVE_LISTENERS = new Set<() => void>();

function beSetInteractive(): void {
	if (BE_INTERACTIVE) return;
	BE_INTERACTIVE = true;
	for (const listener of Array.from(BE_INTERACTIVE_LISTENERS)) {
		try {
			listener();
		} catch {
			// A throwing listener must not block the others.
		}
	}
}

function detectAutomationPrerender(): boolean {
	if (typeof navigator === "undefined") return false;
	try {
		return navigator.webdriver === true;
	} catch {
		return false;
	}
}

if (typeof window !== "undefined") {
	if (detectAutomationPrerender()) {
		// Prerender/automation browser: only a genuine interaction (which
		// crawlers never perform) may flip the gate. This keeps the gate OFF
		// while the prerenderer captures its HTML.
		window.addEventListener("pointerdown", beSetInteractive, {
			once: true,
			capture: true,
		});
		window.addEventListener("keydown", beSetInteractive, {
			once: true,
			capture: true,
		});
	} else {
		// Real visitor: flip as soon as the module evaluates — a microtask so
		// the hydration render itself still observes the initial (false) value
		// and the gate is true by the time mount effects flush.
		Promise.resolve().then(beSetInteractive);
		// Belt-and-suspenders: extremely lazy bundles can hydrate after the
		// microtask queue drained; the first interaction covers any residual.
		window.addEventListener("pointerdown", beSetInteractive, {
			once: true,
			capture: true,
		});
		window.addEventListener("keydown", beSetInteractive, {
			once: true,
			capture: true,
		});
	}
}

/** PRERENDER-DEFER: subscribe to the interactive gate. Returns `false` during
 *  SSR, the headless prerender, and (pre-interaction) QA automation; `true`
 *  for real visitors from the first effect flush onward. Effects that update
 *  rendered state must no-op while this is `false` — their state then stays
 *  at the server-identical initial value, which is what the served HTML
 *  contains. */
function useBeInteractive(): boolean {
	const [interactive, setInteractive] = React.useState(BE_INTERACTIVE);
	React.useEffect(() => {
		if (BE_INTERACTIVE) {
			// Flipped before this component mounted — sync without waiting.
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

// DETERMINISTIC-LIFECYCLE: module-level month-keyed slots cache, shared by
// every useCalcomSlots instance on the page (multi-instance sites included —
// the key already contains apiKey/eventTypeId/apiBase/timeZone/month). A
// remount of the same page re-reads this cache instead of re-firing the GET;
// entries still expire via the TTL at the read site.
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

// DETERMINISTIC-LIFECYCLE: cross-instance in-flight dedup. Identical
// concurrent availability requests (same month key) share ONE network
// round-trip: the first caller registers a promise; a later effect run
// (remount, dep echo) FOLLOWS it and applies the outcome through its own
// state setters instead of firing a duplicate GET. Entries are removed when
// the request settles. This is the mechanism that makes the request
// lifecycle idempotent for identical inputs without any retry/timeout tuning.
interface CalSlotsOutcome {
	error: string | null;
}
const calSlotsInflight = new Map<string, Promise<CalSlotsOutcome>>();

// W1-05-F-04 fix: slots cache entries are considered stale after 5 minutes
// (long enough to make month paging feel instant, short enough that a
// long-lived tab never offers already-elapsed slots as selectable). Internal
// only — not a Property Control.
const SLOTS_CACHE_TTL_MS = 5 * 60 * 1000;

// W1-15-TS-08 fix: the HTTP-failure path used to throw
// `new Error(...) as Error & { status?: number; retryAfterSeconds?: number }`
// and the catch handler re-derived those fields through a structural
// projection — the same ad-hoc shape, duplicated. A named error class lets
// the throw site construct a typed error and the catch site narrow via
// `instanceof` with zero casts.
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
	// T10-H4 fix: fallback message when Cal.com reports no useful error
	// detail; the call site passes copy.availabilityErrorLabel.
	fallbackErrorLabel?: string,
	// W1-02-F4–F8 fix (bundle 17): centralized error copy for the slots
	// ladder; defaults mirror ERROR_COPY_DEFAULTS if not provided.
	errorCopy?: Partial<ErrorCopy>,
	// W1-02-F1 fix (bundle 17): author-tunable timeout override.
	timeoutMs?: number,
	// W1-02-F26 fix: Cal.com v2 API base URL (self-hosted deployments).
	apiBaseUrl?: string,
	// W1-02-F27 fix: `cal-api-version` header value.
	apiVersion?: string,
	// W1-02-F30 fix: cache TTL override for the month-keyed slots cache.
	cacheTtlMs?: number,
): UseCalcomSlotsResult {
	const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopy || {}) };
	// W1-02-F26/F27/F30 fixes: resolve the author-tunable overrides once
	// (the component's resolved values are passed in; defaults keep this
	// hook honest for any future internal caller). Trailing slashes are
	// stripped so the "/v2/..." suffix joins cleanly.
	const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "");
	const apiVer = apiVersion || DEFAULT_CAL_API_VERSION;
	const cacheTtl =
		typeof cacheTtlMs === "number" && cacheTtlMs >= 0
			? cacheTtlMs
			: SLOTS_CACHE_TTL_MS;
	// F-01-02 fix: was `RenderTarget.current() === RenderTarget.canvas` —
	// a single-target guard. `useIsStaticRenderer()` also covers `export`
	// and `thumbnail` targets, so the Cal.com availability fetch (with its
	// `Authorization: Bearer` header) can no longer leak into static-export
	// bundles.
	const isStaticRender = useIsStaticRenderer();
	// PRERENDER-DEFER: no availability network traffic before the client is
	// real (interactive). Combined with the parent's reached-gate, a slots
	// GET now fires exactly once per (config, month, timezone) when the
	// visitor is actually on the Calendar step.
	const beInteractive = useBeInteractive();
	const [slots, setSlots] = React.useState<
		Array<{ value: string; label: string; end?: string; minutes: number }>
	>([]);
	// CC-3/T2-C3 fix: was `false`, so the first painted frame after mount
	// showed the empty/previous state instead of the loading banner — the
	// fetch effect only set `loading=true` after the first paint. Initialize
	// to `true` and let the no-op branches below (no config / canvas / no
	// month) settle it to `false` synchronously in the same effect.
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	// M2 fix: every month navigation re-fetched from scratch, even for a
	// month already loaded once this session (e.g. paging back and forth
	// between two months). A plain ref-backed cache, keyed by month + the
	// timezone it was fetched for (results differ by timezone), avoids
	// redundant round-trips without needing any extra state plumbing.
	// W1-05-F-04 fix: entries now carry a `fetchedAt` timestamp so a
	// long-lived tab crossing midnight (or an event-type's schedule editing)
	// doesn't keep offering already-elapsed slots as selectable — the read
	// site below refetches entries older than SLOTS_CACHE_TTL_MS.
	// DETERMINISTIC-LIFECYCLE: the cache is now MODULE-level (shared across
	// remounts of the same page — Framer breakpoint switches, canvas
	// re-parents) so a remount re-reads the fresh cache instead of firing a
	// second GET for a month this page just fetched. Identity semantics are
	// unchanged (same key, same TTL).
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
	// T3-H4 fix: see UseCalcomSlotsResult.refetch — a bump re-runs the fetch
	// effect below exactly as if the month had changed.
	const [refreshNonce, setRefreshNonce] = React.useState(0);
	const refetch = React.useCallback(() => {
		if (!monthStart) return;
		cacheRef.current.delete(
			monthCacheKey(monthStart, timeZone, apiKey, eventTypeId, apiBase),
		);
		setRefreshNonce((count) => count + 1);
	}, [monthStart, timeZone, apiKey, eventTypeId, apiBase]);

	// W1-05-F1 fix (continued): bulk invalidation on credential/event-type
	// change — the key-based fix above already prevents stale reads, this
	// just drops the previous configuration's entries from memory instead
	// of letting them accumulate for the session.
	// W1-07-F9 fix: `timeZone` joined the deps — the cache key includes it
	// (results differ by timezone), so switching the visitor's timezone
	// must also drop the old timezone's entries instead of letting them
	// linger (~460 KB worst case across 16 tz × 12 months).
	React.useEffect(() => {
		cacheRef.current.clear();
		// FINAL-10 fix: `apiBase` joined the deps — a mid-session endpoint
		// swap must drop the previous deployment's cached entries too
		// (its keys are unreachable now, this just frees the memory).
	}, [apiKey, eventTypeId, timeZone, apiBase]);

	React.useEffect(() => {
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
		// PRERENDER-DEFER: no availability GET before the client is
		// real. The gate flips post-hydration on real visitors, so the
		// first eligible fetch happens in the same effect pass as
		// before — just never during SSR/prerender/automation.
		if (!beInteractive) {
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
		// W1-05-F-04 fix: honor the TTL — a fresh-enough entry short-circuits
		// the fetch; a stale one falls through and is replaced below.
		if (cached && Date.now() - cached.fetchedAt < cacheTtl) {
			beDiag("cal:slots:cache-hit", {
				trigger: "month-effect",
				month: monthKey.slice(0, 7),
				timeZone,
				ageMs: Date.now() - cached.fetchedAt,
			});
			setSlots(cached.slots);
			setLoading(false);
			setError(null);
			return;
		}
		// DETERMINISTIC-LIFECYCLE: same month already in flight — follow
		// it and apply the shared outcome instead of racing a duplicate
		// GET. The leader writes the cache on success, so a settle-time
		// cache read covers the happy path; the outcome carries the
		// error copy for the failure path.
		const inflight = calSlotsInflight.get(monthKey);
		if (inflight) {
			beDiag("cal:slots:dedup", {
				trigger: "month-effect",
				month: monthKey.slice(0, 7),
				timeZone,
			});
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
			});
			return () => {
				cancelled = true;
			};
		}

		let cancelled = false;
		// DETERMINISTIC-LIFECYCLE: register this fetch as the in-flight
		// leader BEFORE the first attempt goes out; every settle path
		// (success/failure/abort-cleanup) must resolve the promise and
		// remove the entry so a later run can fetch again.
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
		// T3-I6 fix: a 500/502/503 from Cal.com used to drop straight into
		// the same error screen as a real failure — a transient server
		// outage became visitor friction that needed a manual retry. Retry
		// 5xx responses up to twice with exponential backoff (1s, then 3s)
		// before surfacing the error. Track the backoff timers so unmount
		// clears them like the rest of this effect's in-flight work.
		const backoffTimers: number[] = [];
		// W1-05-F4 fix: the month boundaries were constructed as
		// browser-LOCAL midnights while the visitor's `timeZone` (the one
		// Cal.com keys slots by) can drift from the browser's. When they
		// disagreed, the first/last day of the visitor's month fell outside
		// the requested range and its slots were silently missed.
		// W2-26-F26-1 fix: ±1 day was NOT enough — the worst-case
		// browser↔visitor drift is 26h (Kiritimati +14 ↔ Baker/Howland −12,
		// 24h45m for Chatham +12:45), so a visitor's first-of-month
		// 00:00–01:59 slot instants could still land BEFORE the widened
		// start.
		// FINAL-23 fix: the buffer is intentionally TWELVE days per side,
		// not two — it must cover (a) the drift above AND (b) the full
		// leading/trailing adjacent-month rows the grid renders (AGENTS.md
		// rules 51/57: trailing next-month cells stay selectable and their
		// previewed availability must exactly match the real Cal.com source),
		// which a ±2-day window cannot reach. The grid only renders visible
		// dates, so extra neighboring-day slots are unused data, never
		// orphaned UI; the cost is a larger fetch window by design.
		const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
		start.setDate(start.getDate() - 12);
		const end = new Date(
			monthStart.getFullYear(),
			monthStart.getMonth() + 1,
			0,
			23,
			59,
			59,
		);
		end.setDate(end.getDate() + 12);
		const startStr = start.toISOString();
		const endStr = end.toISOString();
		const url = `${apiBase}/v2/slots?eventTypeId=${encodeURIComponent(
			eventTypeId,
		)}&start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(
			endStr,
		)}&timeZone=${encodeURIComponent(timeZone)}&format=range`;
		// SYN-07 fix (live-OpenAPI verified): `format=range` is REQUIRED —
		// the docs' default `time` format returns bare time strings (or
		// {start}-only objects), which carry no `end`, and the rest of the
		// engine's data contract (BookingPayload.slotEnd → POST body `end`,
		// success-screen duration, analytics) depends on `end`. Without it
		// the calendar renders empty with NO error surface.

		setLoading(true);
		setError(null);
		// H5 fix: the previous month's slots stayed in state while the new
		// month's fetch was in flight, so a visitor could see (and click)
		// times that belong to whatever month they just navigated away
		// from, briefly indistinguishable from real availability for the
		// new month.
		setSlots([]);

		// BE-DIAG: one line per availability GET — trigger, inputs,
		// cache verdict. Never the API key.
		beDiag("cal:slots:fetch", {
			trigger: "month-effect",
			endpoint: "GET /v2/slots",
			eventTypeId,
			month: monthKey.slice(0, 7),
			timeZone,
			cache: "miss",
		});

		// CC-15 fix: neither the fetch itself nor a cancelled request was
		// ever actually aborted before — the `cancelled` flag only stopped
		// React state updates from a stale response, it didn't stop the
		// network request or free up a hung connection. Without a timeout, a
		// stalled connection left `loading=true` forever with no way for the
		// visitor to recover. The AbortController now does double duty: it
		// aborts on a 18s timeout AND on effect cleanup (e.g. rapid month
		// navigation queuing a new fetch), so an old in-flight request is
		// actually cancelled instead of just ignored.
		const controller = new AbortController();
		const timeoutMsValue = timeoutMs ?? FETCH_TIMEOUT_MS;
		// W1-05-F3 fix: the timeout must be PER ATTEMPT, not one shared
		// timer: the old `.finally()` cleared the single timer after the
		// first HTTP token arrived, so 5xx retries (1s/3s backoff) ran
		// with NO timeout protection — a hung retry left `loading=true`
		// forever with no recovery. Each attempt now arms its own timer
		// (aborting the shared controller on fire) and clears it when the
		// attempt settles; a hung retry is aborted at 18s like attempt 1.

		const attempt = (triesLeft: number) => {
			// W2-25-F10 fix: detect a dead connection BEFORE dispatching — the
			// request would hang or fail anyway (and surface a scarier generic
			// copy); the visitor immediately gets the actionable offline
			// message instead.
			if (typeof navigator !== "undefined" && navigator.onLine === false) {
				setError(copy.offlineError);
				setSlots([]);
				setLoading(false);
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
						// M9 fix: every non-2xx response (401/403/404/500/...)
						// used to collapse into the same generic
						// `Error("HTTP ${status}")` → the same opaque catch-all
						// string for the visitor. Attach the status so the
						// catch handler below can give a specific, actionable
						// message per status class instead.
						// W1-15-TS-08 fix: constructed as the named
						// HttpFetchError (status + parsed Retry-After) instead of
						// casting a plain Error — the catch handler narrows via
						// `instanceof` with zero ad-hoc shapes.
						// W2-25-F6 fix: 429 responses carry `Retry-After`
						// (seconds or HTTP-date); parsed here so the visitor
						// gets a real wait estimate instead of generic copy.
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
					// W1-15-TS-04 fix: the payload shapes are unions, not `any` —
					// every branch narrows to slots or throws it away.
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
					// Cal.com v2 typically returns { data: { slots: { 'YYYY-MM-DD': [{start,end}, ...] } } }
					// but we accept several shapes defensively.
					let rawSlots: unknown[] = [];
					if (json && typeof json === "object" && !Array.isArray(json)) {
						// Only member access through the one narrowed boundary:
						// the union's members collide (`unknown[]` has no
						// `.data`), so read the two shape keys through a typed
						// view of the already-narrowed object (W1-15-TS-04/TS-06).
						const body = json as { data?: unknown; slots?: unknown };
						const data = body.data;
						if (Array.isArray(data)) {
							rawSlots = data;
						} else if (data && typeof data === "object") {
							// SYN-07 fix (live-OpenAPI verified): the documented
							// v2 response is { status, data: { 'YYYY-MM-DD': [slots] } }
							// — date keys sit DIRECTLY under `data`. The old code
							// only read `data.slots`, so the live shape fell
							// through to `rawSlots = []` (empty calendar, no
							// error). Read `data.slots` if present (legacy
							// nesting), else flatten the date-key map.
							const slots = (data as { slots?: unknown }).slots;
							if (slots && typeof slots === "object") {
								// W1-15-TS-10 fix: normalization happens once at the
								// mapping step below (normalizeCalSlot), so the raw
								// shape stays unknown here.
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
					// W1-15-TS-10 fix: normalize each accepted shape into a REAL
					// CalSlot (the seated-slot `time` fallback baked into the
					// object) or null, instead of filtering through a guard
					// that lied about `start`'s presence.
					const mapped = rawSlots
						.map(normalizeCalSlot)
						.filter((slot): slot is CalSlot => slot !== null)
						.map((slot) => {
							const d = new Date(slot.start);
							// CC-13 fix: was `d.getHours()`, which reads the
							// BROWSER's local zone. Use the zone the visitor
							// actually selected (the same `timeZone` this fetch
							// was requested with) so labels and day-bucketing
							// match what was asked for.
							const minutes = getMinutesInTimeZone(d, timeZone);
							return {
								value: slot.start,
								// Store raw minutes; the DateAndTimeInline
								// component formats the label using the active
								// 12h/24h toggle (fixes #10).
								label: formatTimeLabel(minutes, "12h"),
								end: slot.end,
								minutes,
							};
						})
						// W1-05-N3 fix: an invalid `start` ISO string survives
						// normalizeCalSlot (it only checks string-ness) as an
						// Invalid Date → NaN minutes → garbled label + a row
						// whose value sorts nowhere sensible. Drop it instead
						// of rendering one unusable slot row per malformed
						// slot.
						.filter((slot) => !Number.isNaN(slot.minutes))
						.sort((a, b) => (a.value < b.value ? -1 : 1));
					// W1-05-F-04 fix: stamp the entry with its fetch time so the
					// TTL check at the read site can expire it.
					cacheRef.current.set(monthKey, {
						slots: mapped,
						fetchedAt: Date.now(),
					});
					// DETERMINISTIC-LIFECYCLE: followers are released FIRST and
					// unconditionally — a cancelled leader must never leave a
					// follower hanging on the shared in-flight promise.
					settleInflight({ error: null });
					if (cancelled) return;
					setSlots(mapped);
					setLoading(false);
				})
				.catch((err: unknown) => {
					// W1-15-TS-08 fix: HTTP failures now arrive as the named
					// `HttpFetchError` — `instanceof` gives typed
					// status/retryAfterSeconds with no structural projection;
					// timeouts (AbortError) and the malformed-JSON sentinel come
					// as plain Errors and narrow through `plainErr`.
					// (Supersedes the W1-15-TS-01 projection.)
					const httpErr = err instanceof HttpFetchError ? err : null;
					const plainErr = err instanceof Error ? err : null;
					const timedOut = plainErr?.name === "AbortError";
					const status = httpErr?.status;
					// T3-I6 fix (continued): real server-side outages (5xx —
					// not auth, not client errors) get up to two retries with
					// backoff before the error screen; the existing per-status
					// messaging below then only runs after retries are spent.
					// W2-25-F12 fix: DOCUMENTED RETRY ASYMMETRY — the slots GET
					// retries up to 2 times with backoff, but the booking POST
					// deliberately never auto-retries (it only has timeout
					// abort + explicit visitor retry). This is intentional: a
					// retried POST whose first attempt actually succeeded
					// server-side could double-book, and Cal.com does not
					// document idempotency-key enforcement (W1-06-F-06-4).
					// Do not "fix" this asymmetry without a server-side
					// idempotency story.
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
					// M9 fix (continued): specific messages for the response
					// classes a visitor (or the site owner debugging a bad API
					// key) can actually act on, instead of one shared string.
					let message: string;
					if (timedOut) {
						message = copy.slotsTimeoutError;
					} else if (status === 401 || status === 403) {
						message = copy.credentialError;
					} else if (status === 404) {
						message = copy.slotsNotFoundError;
					} else if (status === 429) {
						// T2-M9 fix: rate limiting previously fell through to the
						// generic `err.message` ("HTTP 429") — visitors couldn't
						// tell a temporary quota block from a real outage.
						// W2-25-F6 fix: when the response carried a Retry-After
						// hint, surface it instead of the vague "wait a moment".
						// BE-DIAG + rate-limit memory: a readable 429 stamps the
						// cross-request memory so a later CORS-opaque failure can
						// be classified honestly.
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
						// W2-25-F7 fix: the malformed-body sentinel from the
						// shared readJson must not reach the visitor verbatim —
						// map it to the same generic fallback copy as any other
						// unclassifiable failure.
						// W1-05-N2 fix: raw `plainErr?.message` ("HTTP 400",
						// "Failed to fetch") is developer-oriented and must not
						// surface either. A network-layer TypeError (browser
						// fetch rejection, CORS, firewall) gets the actionable
						// networkError copy; everything else classifiable gets
						// the author fallback label or the generic slot copy.
						message =
							plainErr?.message === MALFORMED_JSON_ERROR
								? copy.slotsFallbackError
								: plainErr instanceof TypeError ||
									plainErr?.name === "TypeError"
									? // DETERMINISTIC-LIFECYCLE (honesty): a TypeError right
									// after a readable 429 is almost always the browser
									// blocking a non-CORS 429 response — report the
									// rate-limit category, not "check your connection".
									recentCalRateLimit()
										? copy.slotsRateLimitGenericError
										: copy.networkError
									: fallbackErrorLabel || copy.slotsFallbackError;
					}
					setError(message);
					// DETERMINISTIC-LIFECYCLE: release followers with the real
					// outcome before the (possibly cancelled) leader state write.
					settleInflight({ error: message });
					if (cancelled) return;
					setSlots([]);
					setLoading(false);
				})
				.finally(() => {
					window.clearTimeout(attemptTimeoutId);
				});
		};
		attempt(2);

		return () => {
			cancelled = true;
			controller.abort();
			// DETERMINISTIC-LIFECYCLE: if this leader is torn down before
			// settling (unmount / dep change), release any followers
			// instead of leaving them on a promise that resolves only via
			// the aborted chain's catch.
			if (calSlotsInflight.get(monthKey) === inflightPromise) {
				settleInflight({ error: null });
			}
			backoffTimers.forEach((id) => {
				window.clearTimeout(id);
			});
		};
		// W2-33-A2 fix: `fallbackErrorLabel` was captured by the catch ladder
		// but omitted from deps — a copy change mid-session kept the stale
		// fallback in closure. String prop, pure value, safe in the array.
		// W1-05-F-03 fix: `errorCopy` (referentially stable at the call site —
		// useMemo'd) and `timeoutMs` (primitive) feed the same ladder; both are
		// safe in the array and keep the effect honest under future refactors.
	}, [
		apiKey,
		eventTypeId,
		monthStart,
		timeZone,
		refreshNonce,
		// PRERENDER-DEFER: the interactive gate is part of the fetch
		// contract — flipping it re-runs the effect so the first real
		// client fetch happens in the same pass.
		beInteractive,
		fallbackErrorLabel,
		errorCopy,
		timeoutMs,
		// FINAL-10 fix: the endpoint/version/TTL values feed both the
		// request (apiBase/apiVer) and the cache identity (apiBase in the
		// month key, cacheTtl in the freshness check) — a mid-session
		// change must re-run this effect instead of serving the previous
		// deployment's cached slots. All primitives; no render-loop risk.
		apiBase,
		apiVer,
		cacheTtl,
	]);

	return { slots, loading, error, refetch };
}

// =============================================================================
// CAL-EVENT-META: Cal.com event/profile metadata (read-only, same key)
// =============================================================================
// One extra GET — /v2/event-types/{eventTypeId} — reuses the SAME browser-
// exposed API key the slots/booking calls already use. No new Property
// Controls: Cal.com is the source of truth for organizer/business identity,
// avatar, event title, duration and location. Every failure mode (bad key,
// foreign event ID, self-hosted without the route, malformed body, offline)
// resolves to `null` and the calendar/booking flow continues untouched —
// metadata must NEVER block availability.
//
// VERSION NOTE (live-OpenAPI verified): this endpoint's documented response
// shape is pinned to `cal-api-version: 2024-06-14`. The shared
// DEFAULT_CAL_API_VERSION (2024-09-04) used by slots/bookings would make
// THIS endpoint fall back to an OLDER shape, so it gets its own internal
// constant. Internal only — never a Property Control (see AGENTS.md).
const CAL_EVENT_TYPE_API_VERSION = "2024-06-14";
// CAL-EVENT-META: neutral copy for the panel's non-data states. Internal
// constants, NOT Property Controls — these are transient states, and rule 38
// forbids duplicating Cal.com data as author-facing controls.
const CAL_META_LOADING_ARIA = "Loading meeting details";
const CAL_META_UNAVAILABLE_COPY = "Meeting details are temporarily unavailable.";
// HYDRATION-CLOCK fix: fixed placeholder "today" for the deterministic first
// render of the Calendar step (see the clock block in DateAndTimeInline).
// Never rendered as content — it only anchors today-highlight/past-guard/
// month-seed computations identically on server and client until the
// isomorphic layout effect swaps in the real visitor-tz clock pre-paint.
const HYDRATION_PLACEHOLDER_TODAY = new Date(2024, 0, 1);
// Same freshness window as the slots cache — one cached GET per
// key/eventType/baseURL combination keeps the panel in sync with Cal.com
// edits within minutes without hammering the API.
const EVENT_META_CACHE_TTL_MS = SLOTS_CACHE_TTL_MS;

/** Normalized, all-optional metadata model the UI renders from. */
interface CalEventMeta {
	title?: string;
	description?: string;
	durationMinutes?: number;
	// Variable-length events list their options here
	// (`metadata.multipleLengths`) — the ONLY case where the bookings
	// API accepts `lengthInMinutes` (fixed-length events reject it).
	multipleLengths?: number[];
	locationLabel?: string;
	organizerName?: string;
	avatarUrl?: string;
}

// Friendly labels for the documented integration location enum (subset of
// the common providers; unknown integrations omit the row entirely rather
// than rendering a raw enum string).
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
			// organizersDefaultApp / unknown — no reliable display label.
			return undefined;
	}
}

/**
 * Defensive normalizer for the /v2/event-types/{id} payload. Handles BOTH
 * documented response variants:
 *  - user event  → `users[]` (+ `ownerId`)
 *  - team event  → `team{}` + `hosts[]` (roundRobin/collective/managed)
 * Identity preference: team name/logo first (business identity), then the
 * mandatory round-robin host, then the owner/first user. All fields stay
 * optional — missing/null values are simply omitted by the panel.
 */
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
	// Variable-length options live under the event's `metadata` bag.
	// Defensive read: anything non-numeric is dropped, capped so a
	// pathological payload can't grow the object.
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
		// Round-robin "mandatory" hosts are the fixed hosts — prefer them.
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

// CAL-BOOKING-FIELDS: Cal.com bookingFields that may be required. Used for
// author warning (canvas) and visitor auto-inject (Additional Details step
// before Calendar). Non-blocking like meta: any failure -> empty array.
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
		// Select / multiselect / radio / checkboxGroup carry options.
		// Cal.com shapes vary: options as string[] or {label,value}[] or {value}[].
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
		// Also handle Cal.com's "select" with enum-like `options` as string[] already covered.
		// Some custom fields use `variants` instead of `options`.
		out.push({ slug, label, type, required, hidden, isDefault, placeholder, options });
	}
	return out;
}

function calTypeToFieldType(calType: string): FieldType {
	switch ((calType || "").toLowerCase()) {
		case "phone":
			return "phone";
		// AUTO-INJECT-EMAIL fix: Cal.com `email` custom fields used to
		// fall through to `text`, so a required Cal email only got the
		// min-length-3 check and never the email-format check — invalid
		// addresses sailed into the booking POST and failed there.
		case "email":
			return "email";
		case "textarea":
		case "multilinetext":
			return "textarea";
		case "text":
		case "url":
		case "number":
		default:
			// select/radio/checkboxGroup/multiselect need choice handling
			if (["select", "multiselect", "radio", "radiogroup", "checkboxgroup", "selectgroup"].includes((calType || "").toLowerCase())) {
				return "select";
			}
			if (["boolean", "checkbox"].includes((calType || "").toLowerCase())) {
				return "checkbox";
			}
			return "text";
	}
}

/**
 * Single read-only metadata fetch. Mirrors the slots/booking fetch posture
 * (same base URL resolution, Bearer key, per-attempt timeout) but — unlike
 * availability — ANY failure resolves to `null` instead of surfacing an
 * error: the panel is additive and must never block booking.
 */
async function fetchCalEventTypeMeta(params: {
	apiKey: string;
	eventTypeId: string;
	apiBaseUrl?: string;
	timeoutMs?: number;
}): Promise<{ meta: CalEventMeta | null; bookingFields: CalBookingField[] }> {
	const { apiKey, eventTypeId, apiBaseUrl, timeoutMs } = params;
	// Same fail-fast guard philosophy as the booking POST: a non-numeric
	// Event ID can never resolve to a real event type.
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
		// Timeout / abort / network / CORS — metadata is optional by design.
		return { meta: null, bookingFields: [] };
	} finally {
		clearTimeout(timeoutId);
	}
}

// Success-only cache: a failed fetch is retried on the next mount instead of
// being pinned negative, while a success is served instantly across remounts
// (step navigation) until the TTL lapses and Cal.com edits flow through.
// Stores both meta and bookingFields together (same endpoint).
const calEventMetaCache = new Map<
	string,
	{ meta: CalEventMeta | null; bookingFields: CalBookingField[]; fetchedAt: number }
>();

/** CAL-EVENT-META: deterministic panel state machine. The initial value is a
 *  pure function of the (server-identical) props so the first server AND
 *  client renders agree byte-for-byte — async Cal.com resolution must never
 *  appear in the initial markup (hydration parity, see AGENTS.md). */
type CalEventMetaStatus = "disabled" | "loading" | "ready" | "failed";

/**
 * Parallel, non-blocking metadata hook. Runs alongside the slots fetch when
 * Cal.com is configured. `status` is deterministic on first render
 * ("disabled"/"loading" from props alone) and transitions only after
 * hydration; `meta` is `null` until a successful fetch. Any failure lands in
 * "failed" so the panel can show a neutral fallback instead of vanishing.
 */
function useCalcomEventMeta(params: {
	enabled: boolean;
	apiKey: string;
	eventTypeId: string;
	apiBaseUrl?: string;
}): { status: CalEventMetaStatus; meta: CalEventMeta | null; bookingFields: CalBookingField[] } {
	const { enabled, apiKey, eventTypeId, apiBaseUrl } = params;
	// Deterministic initializer: identical on server and client first render.
	// PRERENDER-DEFER note: `enabled` now includes the interactive gate, so
	// the initial status is "disabled" in the served HTML AND in the
	// visitor's first render; it transitions to "loading" when the gate
	// flips post-hydration. The headless prerender can no longer fire this
	// GET at publish time (the eager metadata fetch was part of the 429
	// cascade), while real visitors still get metadata immediately after
	// hydration — early enough for the required-field auto-injection and
	// the info panel.
	const [status, setStatus] = React.useState<CalEventMetaStatus>(() =>
		enabled ? "loading" : "disabled",
	);
	const [meta, setMeta] = React.useState<CalEventMeta | null>(null);
	const [bookingFields, setBookingFields] = React.useState<CalBookingField[]>([]);
	const cacheKey = `${(apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "")}|${apiKey}|${eventTypeId}`;
	React.useEffect(() => {
		if (!enabled || !apiKey || !eventTypeId) {
			setStatus("disabled");
			setBookingFields([]);
			return;
		}
		const cached = calEventMetaCache.get(cacheKey);
		if (cached && Date.now() - cached.fetchedAt < EVENT_META_CACHE_TTL_MS) {
			beDiag("cal:meta:cache-hit", {
				trigger: "enabled-effect",
				eventTypeId,
			});
			setMeta(cached.meta);
			setBookingFields(cached.bookingFields || []);
			setStatus(cached.meta || cached.bookingFields.length ? "ready" : "failed");
			return;
		}
		setStatus("loading");
		// BE-DIAG: one line per metadata GET — trigger + inputs, never
		// the API key.
		beDiag("cal:meta:fetch", {
			trigger: "enabled-effect",
			endpoint: "GET /v2/event-types/{id}",
			eventTypeId,
			cache: "miss",
		});
		let cancelled = false;
		fetchCalEventTypeMeta({ apiKey, eventTypeId, apiBaseUrl }).then((res) => {
			if (cancelled) return;
			const hasData = res.meta !== null || (res.bookingFields && res.bookingFields.length > 0);
			if (hasData) {
				calEventMetaCache.set(cacheKey, { meta: res.meta, bookingFields: res.bookingFields, fetchedAt: Date.now() });
				setMeta(res.meta);
				setBookingFields(res.bookingFields);
				setStatus("ready");
				beDiag("cal:meta:status", {
					status: "ready",
					eventTypeId,
					hasMeta: res.meta !== null,
					bookingFieldCount: res.bookingFields.length,
				});
			} else {
				// No meta and no fields -> treat as failed, but keep empty fields
				setMeta(null);
				setBookingFields([]);
				setStatus("failed");
				beDiag("cal:meta:status", {
					status: "failed",
					eventTypeId,
				});
			}
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
	// W1-06-F-06-3 fix: Cal.com v2's booking response carries canonical
	// reschedule/cancel links (host-correct for self-hosted instances).
	// The success screen prefers these over the constructed fallback.
	rescheduleUrl?: string;
	cancelUrl?: string;
	// T3-M2 fix: machine-readable Cal.com error code, when the response
	// carries one — lets the caller branch on codes instead of guessing
	// from message substrings.
	errorCode?: string;
	// W1-06-F-06-4 fix: when true, `error` is ALREADY visitor-facing copy
	// (mapped inside this module — timeout, network, malformed-body,
	// empty-response paths) and the caller must NOT run it through
	// mapCalcomError again. The defensive second mapping used to degrade
	// the friendly string down to the generic fallback (the timeout copy
	// has no "TIMEOUT" code branch and no matching substring).
	alreadyMapped?: boolean;
	// FINAL-21 fix: HTTP status of the failed response, when one was
	// received — consulted as a last-resort branch by mapCalcomError for
	// non-standard bodies with no recognizable code/message.
	httpStatus?: number;
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
	uid: string | null;
	manageUrl: string | null;
	// W1-06-F-06-3 fix: API-provided canonical links, when the response
	// carried them. The success screen prefers these over the constructed
	// `https://cal.com/booking/{uid}` fallback, which is wrong for
	// self-hosted instances.
	rescheduleUrl: string | null;
	cancelUrl: string | null;
}

async function submitCalcomBooking(params: {
	apiKey: string;
	eventTypeId: string;
	slotStart: string;
	// The slot `end` (ISO datetime) is captured at selection time for
	// ICS/deep-link builders. It is NOT sent as top-level `end` (the
	// bookings schema rejects it) — it only feeds the `lengthInMinutes`
	// derivation below, and only when the event allows it.
	slotEnd?: string;
	// BODY-SCHEMA fix: `lengthInMinutes` may be sent ONLY when the event
	// type offers multiple lengths (Cal.com 400-rejects it otherwise:
	// "Can't specify 'lengthInMinutes'..."). The caller derives this
	// from `calEventMeta.multipleLengths`.
	allowLengthInMinutes?: boolean;
	name: string;
	email: string;
	timeZone: string;
	// BODY-SCHEMA fix: no `notes` param — top-level notes are rejected
	// by the bookings schema (the ICS description still uses
	// buildNotesPayload directly).
	// T3-H2 fix: same key must be reused across retries of one submission.
	idempotencyKey?: string;
	// T3-M8 fix: author-mapped custom field values.
	bookingFieldsResponses?: Record<string, string>;
	// T6-L7 fix: optional external signal - the caller (BookingEngine)
	// aborts it on unmount so an in-flight POST dies with the component.
	externalSignal?: AbortSignal;
	// W1-02-F4–F8 fix (bundle 17): centralized error copy for the POST
	// failures; defaults mirror ERROR_COPY_DEFAULTS if not provided.
	errorCopy?: Partial<ErrorCopy>;
	// W1-02-F1 fix (bundle 17): author-tunable timeout override.
	timeoutMs?: number;
	// W1-02-F26 fix: Cal.com v2 API base URL (self-hosted deployments).
	apiBaseUrl?: string;
	// BOOKING-VERSION fix: no apiVersion param — the POST pins
	// CAL_BOOKING_API_VERSION (the slots version 404s bookings routing).
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
	// W1-02-F26/F27 fixes: resolve the author-tunable base URL + the
	// BOOKING-pinned API version header once (trailing slashes normalized
	// for the join).
	const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "");
	const apiVer = CAL_BOOKING_API_VERSION;
	// H4 fix: `Number(eventTypeId)` silently produced `NaN` for any
	// non-purely-numeric event type ID (e.g. a slug), and `JSON.stringify`
	// serializes `NaN` as `null` — so the request body sent
	// `"eventTypeId":null` with no error at all, and Cal.com's rejection of
	// that came back as an opaque "Booking failed" for the visitor. Fail
	// fast with a clear, actionable message instead of ever building that
	// malformed payload.
	const parsedEventTypeId = Number(eventTypeId);
	if (!eventTypeId || !Number.isFinite(parsedEventTypeId)) {
		return {
			success: false,
			error: copy.misconfiguredFormError,
		};
	}
	// T3-M5 fix: gate the slot time at the door — the demo grid's "HH:MM"
	// times must never reach the API (they'd POST a malformed `start` and
	// fail opaquely, or worse book against a garbage timestamp). Same guard
	// also lives in handleSubmitBooking, so this is defense in depth.
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotStart)) {
		return {
			success: false,
			error: copy.invalidSlotTimeError,
			errorCode: "INVALID_SLOT_START",
		};
	}
	// CC-15 fix: no timeout previously — a stalled connection left
	// `flowStatus="submitting"` forever with no recovery path for the
	// visitor.
	const controller = new AbortController();
	const timeoutMsValue = timeoutMs ?? FETCH_TIMEOUT_MS;
	const timeoutId = setTimeout(() => controller.abort(), timeoutMsValue);
	// T6-L7 fix: bridge the caller's unmount abort into the same
	// controller as the timeout so either one cancels the POST.
	// W2-30-F2 fix: the bridged listener is removed in `finally` once the
	// POST settles, so a long-lived caller signal can't keep a dangling
	// handler on this controller.
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
	// W2-25-F10 fix: fail fast on a dead connection instead of firing a
	// doomed POST and then surfacing the generic network error.
	if (typeof navigator !== "undefined" && navigator.onLine === false) {
		beDiag("booking:abort-offline", { endpoint: "POST /v2/bookings" });
		return {
			success: false,
			error: copy.offlineError,
			errorCode: "OFFLINE",
		};
	}
	// BE-DIAG: attempt start — endpoint/type, non-sensitive inputs, and the
	// payload SHAPE (key list only; never field values, never the API key).
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
	beDiag("booking:attempt", {
		endpoint: "POST /v2/bookings",
		eventTypeId: parsedEventTypeId,
		slotStart,
		slotEnd: payloadPreview.hasEnd ? slotEnd : null,
		payloadKeys: Object.keys({
			eventTypeId: 1,
			start: 1,
			lengthInMinutes: payloadPreview.hasEnd ? 1 : 0,
			attendee: 1,
			metadata: 1,
			...(payloadPreview.bookingFieldsResponseKeys.length
				? { bookingFieldsResponses: 1 }
				: {}),
		}),
		bookingFieldsResponseKeys: payloadPreview.bookingFieldsResponseKeys,
		idempotency: Boolean(idempotencyKey),
	});
	try {
		const res = await fetch(`${apiBase}/v2/bookings`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
				"cal-api-version": apiVer,
				// CORS-BLOCK fix: `X-Idempotency-Key` is NOT sent. The old
				// comment assumed unknown headers are ignored — false in
				// browsers: any non-safelisted header forces a CORS
				// preflight, and Cal.com's Access-Control-Allow-Headers
				// does not list it, so the preflight fails and EVERY live
				// booking dies with "Failed to fetch" (only reproducible
				// on the published site, never in canvas). The key
				// generation/reset machinery below is now dormant (kept,
				// harmless) until Cal.com documents the header; duplicate
				// protection stays what it was: the client never
				// auto-retries a POST.
			},
			body: JSON.stringify({
				eventTypeId: parsedEventTypeId,
				start: slotStart,
				// BODY-SCHEMA fix: the 2024-08-13 bookings schema has NO
				// top-level `end` (rejected: "should not exist") — duration
				// travels as `lengthInMinutes` derived from the slot's own
				// end, and ONLY when the event offers multiple lengths
				// (fixed-length events 400-reject the key outright).
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
				// BODY-SCHEMA fix: no top-level `notes` (rejected: "should
				// not exist"). Answers already travel structured (attendee
				// + bookingFieldsResponses); the human-readable notes still
				// feed the .ics DESCRIPTION via buildNotesPayload.
				metadata: {},
				...(bookingFieldsResponses && Object.keys(bookingFieldsResponses).length
					? { bookingFieldsResponses }
					: {}),
			}),
			signal: controller.signal,
		});
		// W1-06-F-06-1 fix: parse the body tolerantly and BEFORE the
		// `!res.ok` branch. The old shape called the throwing `readJson`
		// first, so a 4xx/5xx whose body wasn't JSON (HTML error page,
		// proxy junk) threw MALFORMED_JSON_ERROR and skipped the
		// status-aware mapping below — the HTTP status context was lost.
		// Here the parse can never throw; `json === null` means "body was
		// not JSON" and each branch decides what that means for it. The
		// throwing `readJson` sentinel remains the GET path's contract.
		// T3-M1 fix: named interface for the tolerant POST body below —
		// a bare inline annotation worked until control-flow narrowing made
		// `as typeof json` (json still narrowed to `null` at that point)
		// cast the parse result to `null`, collapsing every later access.
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
			// W1-06-F-06-3 fix: canonical manage links land on the
			// booking object (or one level up in some v2 shapes).
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
			// T3-M2 fix: carry Cal.com's machine-readable code through so
			// mapCalcomError can branch on it before falling back to
			// substring matching.
			const code = json?.error?.code || json?.code || json?.error?.errorCode;
			// FINAL-25 fix: the GET path parses Retry-After on 429, the POST
			// never did — a rate-limited submission now surfaces a real wait
			// estimate instead of an unactionable message.
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
					// BE-DIAG + rate-limit memory: a readable 429 is the
					// anchor fact — later opaque failures get classified
					// against it.
					noteCalRateLimit();
					beDiag("booking:failure", {
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
				// BE-DIAG: preserve Cal.com's own structured error — this is
				// the code/message the failure report must carry verbatim.
				beDiag("booking:failure", {
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
					// A readable 429 that reached this branch (no Retry-After
					// header) still stamps the cross-request memory.
					noteCalRateLimit();
				}
				return {
					success: false,
					error: String(apiError),
					errorCode: code,
					httpStatus: res.status,
				};
			}
			// W1-06-F-06-4 fix: no machine-readable error from Cal.com —
			// use the author-facing template; it is already visitor-facing
			// copy, so flag it to skip the consumer's mapper (which would
			// otherwise degrade it to the generic fallback).
			if (res.status === 429) {
				noteCalRateLimit();
			}
			beDiag("booking:failure", {
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
		// T3-M6 fix: a 2xx status with an empty/null body used to sail
		// through as success — the visitor got a confirmation screen for a
		// booking there's no record of. An empty body is not a confirmation;
		// fail with copy that tells them what to check.
		// W1-06-F-06-1 fix: a 2xx whose body was NOT JSON (truncated chunk,
		// proxy junk) gets the dedicated malformed-response copy instead —
		// the visitor sees "unusable response" rather than the
		// empty-confirmation phrasing.
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
				// W1-06-F-06-4 fix: already visitor-facing copy (see
				// SubmitBookingResult.alreadyMapped).
				alreadyMapped: true,
			};
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
			json?.id;
		// FINAL-26 fix: keyed-but-empty success shapes —
		// {status:"success", data:null} or {status:"error", error:null} —
		// carry object keys so the guard above passes, then slipped through
		// as SUCCESS with uid=undefined (no confirmation number, unstable
		// ICS UID). A 2xx with no extractable booking is treated like an
		// empty confirmation: the emptyResponse copy explicitly tells the
		// visitor to check their email before retrying, which is also the
		// safest guidance against double-booking an attempt that may have
		// landed server-side.
		if (!uid) {
			return {
				success: false,
				error: copy.emptyResponseError,
				errorCode: "NO_UID_IN_SUCCESS_RESPONSE",
				httpStatus: res.status,
				alreadyMapped: true,
			};
		}
		// W1-06-F-06-3 fix: prefer the API's canonical links (host-correct
		// on self-hosted instances) to any client-side construction.
		const rescheduleUrl =
			json?.data?.booking?.rescheduleUrl ||
			json?.data?.rescheduleUrl ||
			json?.rescheduleUrl;
		const cancelUrl =
			json?.data?.booking?.cancelUrl ||
			json?.data?.cancelUrl ||
			json?.cancelUrl;
		// BE-DIAG: success carries the booking UID (never field values).
		beDiag("booking:success", {
			endpoint: "POST /v2/bookings",
			bookingUid: uid,
		});
		return {
			success: true,
			error: null,
			bookingUid: uid,
			...(rescheduleUrl ? { rescheduleUrl } : {}),
			...(cancelUrl ? { cancelUrl } : {}),
		};
		// T7-M10 fix: catch was `err: any` - now unknown, narrowed to an Error
		// (with Cal.com's optional code/errorCode extras) before reading.
	} catch (err: unknown) {
		const errObj =
			err instanceof Error
				? (err as Error & { code?: string; errorCode?: string })
				: null;
		const timedOut = errObj?.name === "AbortError";
		// W1-06-F-06-1 fix: the malformed-body sentinel gets its own
		// dedicated copy token here instead of falling through
		// mapCalcomError into the generic fallback — a visitor who hit an
		// HTML error page from a proxy now sees "unusable response" copy
		// rather than "something went wrong". (Defensive: the POST body
		// parse above is tolerant, so this branch primarily future-proofs
		// against readJson-based callers.)
		const malformed = errObj?.message === MALFORMED_JSON_ERROR;
		// TASK-6 HONESTY FIX: the browser throws TypeError "Failed to
		// fetch" BOTH for real connectivity loss AND for any response it
		// is not allowed to read — including a 429 whose CORS headers
		// are missing. When ANY Cal.com call got a readable 429 recently,
		// classifying this opaque failure as a rate limit (with the
		// wait-and-retry copy) is the truthful category; "check your
		// connection" was the copy that shipped when the real cause was
		// the request cascade.
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
		// BE-DIAG: the structured failure — category, machine code, and
		// the raw Cal.com message when one exists.
		beDiag("booking:failure", {
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
			// T3-H2 fix: route non-timeout network errors through the same
			// mapper as API errors so a failed POST during connectivity
			// trouble gets a useful, actionable message instead of one
			// catch-all string.
			error: mappedError,
			errorCode: timedOut
				? "TIMEOUT"
				: malformed
					? MALFORMED_JSON_ERROR
					: opaqueAfterRateLimit
						? "RATE_LIMIT_EXCEEDED"
						: errObj?.code || errObj?.errorCode || "",
			// W1-06-F-06-4 fix: the string above is already visitor-facing
			// copy — flag it so handleSubmitBooking's mapCalcomError pass
			// does not re-map (and degrade) it.
			alreadyMapped: true,
		};
	} finally {
		clearTimeout(timeoutId);
		// W2-30-F2 fix: release the caller-signal bridge now that the POST
		// has settled (the controller is already final at this point).
		if (externalAbortHandler && externalSignal) {
			externalSignal.removeEventListener("abort", externalAbortHandler);
			externalAbortHandler = null;
		}
	}
}

function mapCalcomError(
	message: string,
	code?: string,
	// W1-02-F4–F8 fix (bundle 17): centralized error copy — callers pass
	// their merged ErrorCopy; defaults keep module-internal callers safe.
	errorCopy?: Partial<ErrorCopy>,
	// W1-02-F19 fix: the catch-all fallback is copy-driven at the call
	// sites that have the copy object; module-internal callers (the
	// fetch catch) fall back to the same single-source constant.
	fallback: string = DEFAULT_COPY_SUBMIT_ERROR_FALLBACK,
	// FINAL-21 fix: HTTP status as the LAST-resort branch — consulted only
	// when neither the machine code nor the message heuristics matched, so
	// non-standard Cal.com-compatible bodies still get class-appropriate copy.
	status?: number,
): string {
	const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopy || {}) };
	// T3-M2 fix: when Cal.com sends a machine-readable error code, branch on
	// it FIRST — substring matching against human messages is fragile and
	// has already broken once as Cal.com reworded its copy. Unknown codes
	// fall through to the heuristics below.
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
		// W1-06-F-06-3 fix: machine-readable 429/5xx/400-class codes now
		// map to dedicated, visitor-actionable copy instead of falling to
		// the generic fallback. Rate-limit reuses `slotsRateLimitGenericError`
		// (no Retry-After hint is available to the mapper here); server-side
		// reuses `slotsUnavailableError`; the 400-class gets its own
		// `badRequestError` token.
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
	// W1-06-F-06-3 fix: substring heuristics for the 429/5xx classes that
	// substring-matched nothing before (only "network"/"fetch" covered).
	if (m.includes("rate limit") || m.includes("too many requests"))
		return copy.slotsRateLimitGenericError;
	if (m.includes("internal") || m.includes("server error"))
		return copy.slotsUnavailableError;
	if (m.includes("network") || m.includes("fetch")) return copy.networkError;
	// FINAL-21 fix: last-resort HTTP-status classification.
	if (status === 401 || status === 403) return copy.credentialError;
	if (status === 429) return copy.slotsRateLimitGenericError;
	if (status !== undefined && status >= 500) return copy.slotsUnavailableError;
	// BOOKING-VERSION fix: a 404 on either call means the event/route
	// isn't there (deleted event type, wrong base URL) — an owner-side
	// configuration problem, never the visitor's answers. Route to the
	// not-found copy instead of the misleading bad-request ("check your
	// answers") copy below.
	if (status === 404) return copy.slotsNotFoundError;
	// BARE-409 fix: Cal.com returns 409 with an empty/non-JSON body (or a
	// bare {status:409} with no machine code) when a slot was just taken.
	// Without this it fell into generic badRequestError ("check your
	// answers") — the visitor's answers are fine, the SLOT is gone. A
	// taken slot always means timeTakenError, and the message it yields
	// ("just taken…") is what the retry path branches on below.
	if (status === 409) return copy.timeTakenError;
	if (status !== undefined && status >= 400 && status < 500) {
		return copy.badRequestError;
	}
	return fallback;
}

// T3-H2 fix: client-generated idempotency key for the booking POST — one per
// selected slot (see handleSubmitBooking / handleSlotReady), reused across
// retries so a retried POST can't double-book.
function makeIdempotencyKey(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `bk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// W1-15-TS-02 fix: `res.json()` alone is `Promise<any>` under strict
// settings. One typed reader keeps every API-call site honest.
// W2-25-F7 fix: a malformed body (HTML error page, proxy junk, truncated
// chunk) used to throw a raw SyntaxError whose message ("Unexpected token
// < in JSON at position 0") leaked straight onto the visitor's screen.
// Convert to one stable sentinel the catch ladders map to friendly copy.
const MALFORMED_JSON_ERROR = "MALFORMED_JSON_RESPONSE";

// W1-15-TS-15 fix: the generic was unconstrained — readJson<string> would
// type-check even though res.json() only yields JSON objects/arrays. The
// constraint covers both shapes the slot endpoint returns.
async function readJson<
	T extends Record<string, unknown> | unknown[],
>(res: Response): Promise<T> {
	try {
		return (await res.json()) as T;
	} catch {
		throw new Error(MALFORMED_JSON_ERROR);
	}
}

// =============================================================================
// Engine helpers
// =============================================================================

// T7-M11 fix: findNameField/findEmailField were 95% duplicated iteration
// loops (and disagreed on fallback heuristics). One generic helper + two
// one-line callers now.
function findField(
	steps: NormalizedStep[],
	predicate: (field: NormalizedField) => boolean,
): NormalizedField | null {
	for (const step of steps) {
		if (step.stepType !== "form") continue;
		for (const field of step.fields) {
			if (predicate(field)) return field;
		}
	}
	return null;
}

function findNameField(steps: NormalizedStep[]): NormalizedField | null {
	const primary = findField(steps, (field) => field.isPrimaryName === true);
	if (primary) return primary;
	// Fallback heuristic: field id/label contains "name" as a whole word.
	// T3-L8 fix: plain /name/i matched "filename", "username", "Surname" —
	// any field whose label merely contained the letters n-a-m-e — and
	// silently hijacked the wrong field as the booker's name. \b anchors the
	// match to a word boundary.
	return findField(
		steps,
		(field) => /\bname\b/i.test(field.label) || /\bname\b/i.test(field.id),
	);
}

function findEmailField(steps: NormalizedStep[]): NormalizedField | null {
	const typed = findField(steps, (field) => field.fieldType === "email");
	if (typed) return typed;
	// T3-I7 fix: forms authored with only a text field (label "Email" /
	// "E-mail" / "Your email") had no email field, so Cal.com's attendee
	// email fell back to a magic string and the booking succeeded with a
	// wrong/no recipient. Heuristic: any not-yet-matched field whose label
	// or id looks like an email/contact field.
	return findField(steps, (field) => {
		if (field.fieldType !== "text") return false;
		const hay = `${field.label} ${field.id}`.toLowerCase();
		return /\b(email|e-mail|mail|contact)\b/.test(hay);
	});
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
	values: BookingValues,
	// W1-07-N1 fix: format the {date} token in the visitor's chosen zone
	// so it agrees with the SuccessScreen/ReviewStepBody labels; a corrupt
	// zone string falls back to browser-local (isValidTimeZone guard).
	timeZone?: string,
): string {
	if (typeof text !== "string" || !text.includes("{")) return text;
	const formFields =
		steps.flatMap((step) => (step.stepType === "form" ? step.fields : [])) ||
		[];
	const nameField =
		formFields.find((field) => field.isPrimaryName) || findEmailField(steps);
	const name = nameField ? String(values[nameField.id] ?? "").trim() : "";
	const slot = values[SELECTED_SLOT_KEY];
	// W1-07-N1 fix: same zoned options the CalendarCell aria-label uses.
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
			? new Date(slot.time24h).toLocaleDateString(pageLocale(), dateOpts)
			: slot.date.toLocaleDateString(pageLocale(), dateOpts)
		: "";
	return text.replace(/\{name\}/g, name).replace(/\{date\}/g, date);
}

// T5-H2 fix: autocomplete hinting was entirely absent, so the browser's
// address-bar data (name, email, phone) was never offered even though the
// form collects exactly those. Map fields to the HTML autofill tokens by
// type and label; unknown fields return undefined (no hint).
function autocompleteToken(field: NormalizedField): string | undefined {
	const label = `${field.label} ${field.id}`.toLowerCase();
	if (field.fieldType === "email") return "email";
	if (field.fieldType === "phone") return "tel";
	if (field.isPrimaryName) return "name";
	// W1-20-N8 fix: the original table covered name/email/phone only —
	// address and organization fields never got a browser-autofill token.
	// Order matters: the specific address components must be tested before
	// the bare "address" / "name" fallbacks that would swallow them.
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

// T3-M8 fix: fields the author mapped to a Cal.com custom field id
// (FieldConfig.calFieldId) are sent via the booking POST's
// `bookingFieldsResponses` map — previously custom fields only ever lived
// inside the free-text `notes` string, so Cal.com's own booking-custom-fields
// UI stayed empty no matter what the form asked.
// AUTO-SLUG-FALLBACK: when calFieldId is empty, derive a kebab-case slug
// from the field label (e.g. "Pet Name" -> "pet-name", "Room Type" -> "room-type")
// so any vertical (clinic/hotel/restaurant) gets structured data out of the box
// without manual Framer edits. Explicit calFieldId always wins (backward compat).
// Attendee fields (isPrimaryName/email) and calendar-widgets are skipped for
// auto-derived keys — they already have dedicated payload slots.
function slugifyLabel(label: string): string {
	return (label || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-+/g, "-");
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
			if (value === undefined || value === "") continue;
			let key = (field.calFieldId || "").trim();
			if (!key) {
				if (field.isPrimaryName || field.fieldType === "email" || field.fieldType === "calendar-widget") continue;
				key = slugifyLabel(field.label) || field.id;
				if (!key) continue;
			}
			// PHONE-INPUT-RAW: phone values are stored raw (see write
			// point) — sanitize at this payload boundary so Cal.com
			// receives clean digits, never typed letters.
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
	// W1-07-N1 fix: format the notes date-prefix in the visitor's chosen
	// zone so it matches the success-screen label and on-screen copy.
	timeZone?: string,
): string {
	// T3-L5 fix: the primary-name and email fields used to be included here
	// AND in the `attendee` object — so every booking's notes carried the
	// visitor's name and email twice.
	// T3-L6 fix: notes were formatted as Markdown ("## heading" /
	// "- **label**: value"), which Cal.com's notes field stores verbatim as
	// plain text — bookings kept literal "##" and "**" in them.
	const lines: string[] = [];
	for (const step of steps) {
		// Calendar steps can carry custom fields too - include them in notes.
		if (step.stepType !== "form" && step.stepType !== "datetime") continue;
		if (!step.fields.length) continue;
		const stepLines: string[] = [];
		for (const field of step.fields) {
			if (field.isPrimaryName || field.fieldType === "email") continue;
			const value = values[field.id];
			if (value === undefined || value === "") continue;
			// PHONE-INPUT-RAW: same payload-boundary sanitize as
			// buildBookingFieldsResponses — notes carry clean digits.
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
		// W1-07-F7 fix: same instant-vs-cell-midnight derivation as the
		// success/review labels so every derived string agrees with the
		// clicked cell and the ICS filename.
		const tzOpts = isValidTimeZone(timeZone) ? { timeZone } : undefined;
		const dateOpts: Intl.DateTimeFormatOptions = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			...tzOpts,
		};
		const dateStr = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
			? new Date(slot.time24h).toLocaleDateString(pageLocale(), dateOpts)
			: slot.date.toLocaleDateString(pageLocale(), dateOpts);
		lines.push(selectedTimeLabel);
		lines.push(`${datePrefix}${dateStr}`);
		lines.push(`${timePrefix}${slot.timeLabel}`);
	}
	return lines.join("\n").trim();
}

// W1-06-F-06-5 fix: RFC 5545 (3.3.11) TEXT escaping — backslash FIRST,
// then semicolon and comma. The old code only folded newlines, so
// visitor-typed content like "Doe, Jane", "No onions; extra cheese" or
// "C:\Users\..." produced INVALID content lines that strict calendar
// clients (Apple Calendar) could mis-parse.
function escapeIcsText(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\r?\n/g, "\\n");
}

// W1-06-F-06-6 fix: RFC 5545 (3.1) content lines SHOULD NOT exceed 75
// octets; long SUMMARY/DESCRIPTION lines were emitted unwrapped, which
// strict parsers could choke on. Fold at 75 UTF-8 octets with CRLF +
// space continuation — measuring OCTETS, not chars, so multi-byte
// sequences are never split mid-character.
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
	// W2-23-N1 fix: author-tunable fallback meeting duration (ms) when the
	// Cal.com slot carries no end — the old hardcoded 30 minutes couldn't
	// fit 15-min clinics or 60-min salons.
	meetingDurationMs: number = DEFAULT_MEETING_DURATION_MS,
	// W1-02-F29 fix: fallback UID domain for the non-UUID UID path (only
	// used when crypto.randomUUID is unavailable). Author-brandable; the
	// default keeps historical UIDs stable.
	uidDomain: string = DEFAULT_ICS_UID_DOMAIN,
	// FINAL-06 fix: author-configured LOCATION text. Empty/omitted keeps
	// the line absent — virtual bookings legitimately have no location.
	location?: string,
	// FINAL-19 fix: stable UID source (the Cal.com booking's own UID).
	uid?: string,
): string {
	const toIcsDate = (d: Date) =>
		d
			.toISOString()
			.replace(/[-:]/g, "")
			.replace(/\.\d{3}Z$/, "Z");
	// Fix #4: use the actual Cal.com slot start (ISO) when available, instead
	// of slot.date (which is midnight of the picked calendar day). Fall back
	// to combining slot.date with the HH:MM time for the demo grid.
	let startDate: Date;
	let endDate: Date;
	const isIso = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h);
	if (isIso) {
		startDate = new Date(slot.time24h);
		// Fix #11: use the real Cal.com slot end if we captured it.
		// W2-31-NEW-1 fix: a hostile/corrupt `slot.end` (restored from
		// sessionStorage or smuggled by a malformed API shape) yields an
		// Invalid Date here — `toIcsDate(endDate).toISOString()` then
		// throws RangeError: Invalid time value and crashes the
		// SuccessScreen render. Guard it: only a parseable, non-NaN end
		// is trusted; anything else falls back to start + default
		// duration. (isBookingPayload at the restore boundary closes the
		// `end: {}` vector specifically; this is defense-in-depth.)
		const slotEnd = slot.end ? new Date(slot.end) : null;
		endDate =
			slotEnd && !Number.isNaN(slotEnd.getTime())
				? slotEnd
				: new Date(startDate.getTime() + meetingDurationMs);
		// Defense-in-depth on the start too: an unparseable ISO slot time
		// must not emit "DTSTART:Invalid Date" / crash the ICS build.
		if (Number.isNaN(startDate.getTime())) {
			startDate = new Date();
		}
		if (Number.isNaN(endDate.getTime())) {
			endDate = new Date(startDate.getTime() + meetingDurationMs);
		}
	} else {
		// Demo grid: combine the picked date with the HH:MM time string.
		const mins = parseTimeToMinutes(slot.time24h);
		startDate = new Date(slot.date);
		startDate.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
		endDate = new Date(startDate.getTime() + meetingDurationMs);
	}
	const start = toIcsDate(startDate);
	const end = toIcsDate(endDate);
	// T3-M4 fix: the UID was `startDate.getTime()@booking-engine` — a raw
	// epoch isn't unique across bookings for the same slot time, and RFC
	// 5545 (5.8.4) requires a globally-unique identifier. A random UUID is.
	// FINAL-19 fix: prefer the Cal.com-provided booking UID when one exists
	// — re-exporting the SAME booking must not mint a new identifier (two
	// .ics files with different UIDs import as duplicate calendar events).
	// Resolved into a NEW name: `const uid` would re-declare the `uid`
	// parameter in this scope (TS 2300 duplicate identifier).
	const resolvedUid =
		(uid && uid.trim()) ||
		(typeof crypto !== "undefined" && "randomUUID" in crypto
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random().toString(36).slice(2)}${uidDomain}`);
	// T3-M3 fix: was "SUMMARY:Booking" and nothing else. STATUS:
	// CONFIRMED + SEQUENCE:0 are the RFC 5545 way to mark a confirmed
	// event, and DESCRIPTION carries the collected booking answers
	// instead of throwing them away. ORGANIZER has no data source in
	// this component's config surface and stays omitted; LOCATION now
	// has one (FINAL-06: author copy control) but stays omitted when
	// the author leaves it empty.
	// W1-06-F-06-6 fix: long content lines are folded at 75 octets
	// (RFC 5545 §3.1) when assembling the payload.
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
			? // W1-06-F-06-2 fix: slice the RAW text to 500 chars FIRST, then
			// escape. The old order (escape → slice) could cut a 2-char
			// escape sequence in half (e.g. `\;` → dangling `\`), which
			// strict RFC 5545 parsers may use to drop DESCRIPTION or the
			// whole VEVENT. Slicing the unescaped source leaves every
			// escape sequence intact.
			[`DESCRIPTION:${escapeIcsText(description.slice(0, 500))}`]
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
		// T3-I4 fix: `btoa(unescape(encodeURIComponent(ics)))` relied on the
		// deprecated `unescape` (ECMAScript Annex B, slated for removal).
		// Encode the string's UTF-8 bytes via TextEncoder and assemble the
		// binary string manually — same result, no deprecated API.
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

// T10-M4 fix: per-field length caps. An authored `maxLength` wins; otherwise
// a sane default per input type. The caps only exist to stop unbounded input —
// they never block a restored session value from rendering.
function effectiveMaxLength(
	field: Pick<NormalizedField, "fieldType">,
): number {
	// VALIDATION-REMOVED (rule 100): fixed per-type caps, never
	// author-set (normalizeSteps forces maxLength to neutral 0, and no
	// control exposes it). text 250 (names/short info), textarea 1000
	// (long answers), email 254 (RFC 5321 — also what Cal.com enforces),
	// phone 40 (15 digits + formatting). Everything else has no cap.
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

// T10-H5 fix: Google Calendar / Outlook deep links generated from the booked
// slot, complementing the .ics download. Times are UTC-compact (YYYYMMDDTHHMMSSZ)
// as those providers require; duration comes from the Cal.com slot end or the
// default meeting length when the slot has none.
function buildCalendarDeepLink(
	provider: "google" | "outlook",
	slot: BookingPayload,
	summary: string,
	description?: string,
	// W2-23-N1 fix: author-tunable fallback duration when the slot lacks
	// an end (mirrors buildIcsDataUri's parameter).
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
	// W1-09-NEW-02 fix: Google's `dates` wants the basic-ISO UTC form
	// (YYYYMMDDTHHMMSSZ). Outlook's `startdt`/`enddt` ALSO want the UTC
	// instant WITH the `Z` suffix (verified against the add-event-to-
	// calendar provider docs: `YYYY-MM-DDTHH:mm:SSZ`; omitting `Z` makes
	// Outlook read the value in the VIEWER's zone, shifting a Sydney
	// booking by 10h). The old comment claiming Outlook wants no `Z`
	// was wrong — keep the suffix, drop only the millis.
	const toExtended = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
	const text = encodeURIComponent(summary);
	const details = encodeURIComponent(description || "");
	if (provider === "google") {
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${toCompact(start)}/${toCompact(end)}&details=${details}`;
	}
	return `https://outlook.live.com/calendar/0/action/compose?subject=${text}&startdt=${toExtended(start)}&enddt=${toExtended(end)}&body=${details}`;
}

// =============================================================================
// The component
// =============================================================================

// W1-01-F-02 fix: the @framerDisableUnlink annotation itself sits in the
// JSDoc immediately above the default export (`BookingEngine`) — this old
// comment at the section header claimed "above" and pointed 2000 lines
// away; reworded to point at the real location without implying adjacency.
// T7-I3 fix: @framerDisableUnlink prevents editors from
// accidentally unlink-detaching this code component into a divergent copy.
// Deterministic step visibility — single source of truth.
// Previous architecture used AnimatePresence + usePresence + playEnterAnimation
// + variants enter/active/inactive. That left animation state (initial/animate
// /exit, layout projection, AnimatePresence mode) as a second source of truth
// that could survive re-mounts and leave `isPresent:true` with `opacity:0`
// after repeated 1↔2 cycles. This replaces it with a pure function of
// `activeIndex`: every render derives position/opacity/pointerEvents directly
// from `isActive`. No AnimatePresence, no usePresence, no initial-enter flag,
// no layout projection. Motion only interpolates between the two deterministic
// end states; initial={false} guarantees the first paint (including a restored
// saved step) is already at the correct final opacity without flashing.
//
// Six genuinely different production transition concepts.
// All share the same deterministic isActive → position/opacity/pointerEvents
// contract; only the interpolated values differ. `initial={false}` keeps first
// paint correct, and `custom` carries navigation direction for slide variants.
// Variant names reflect what they actually do.
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
		// FINAL-61 fix: typed as framer-motion's Variants (was
		// Record<string, unknown>), so variant keys are compile-checked and
		// the three `as unknown as` / `as never` escape hatches are gone.
		variants: Variants;
		transition: Transition;
		useDirection?: boolean;
	}
> = {
	fadeRise: {
		// Fade Rise — soft opacity + y, premium minimal
		variants: {
			active: { opacity: 1, y: 0 },
			inactive: { opacity: 0, y: 8 },
		},
		transition: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] } as Transition,
	},
	blurScale: {
		// Blur Scale — scale + blur + opacity, subtle depth (improved: 95% / 4px)
		variants: {
			active: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
			inactive: { opacity: 0, scale: 0.95, y: 0, filter: "blur(4px)" },
		},
		transition: { type: "spring", stiffness: 320, damping: 28, mass: 0.9 } as Transition,
	},
	slide: {
		// Slide Flow — horizontal x + opacity, direction-aware
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
		// Zoom — scale only, no y/x, subtle pop
		variants: {
			active: { opacity: 1, scale: 1 },
			inactive: { opacity: 0, scale: 0.92 },
		},
		transition: { type: "spring", stiffness: 360, damping: 26 } as Transition,
	},
	verticalSlide: {
		// Vertical Slide — larger y distance than Fade Rise, spring
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
		// Blur Slide — x + blur + opacity, premium combination
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

function StepVisibilityWrapper(props: {
	isActive: boolean;
	baseTransition: Transition;
	children: React.ReactNode;
	// Diagnostic: step index for logging, not for identity (key is step.id).
	stepIndex: number;
	activeIndex: number;
	variant: TransitionVariantId;
	direction: number;
}) {
	const reducedMotion = useReducedMotion();
	const isStatic = useIsStaticRenderer();
	const def = TRANSITION_VARIANT_DEFS[props.variant];
	// FINAL-54 fix (Rules of Hooks): this useMemo previously ran only on the
	// non-static path, AFTER an early return — "Rendered fewer hooks than
	// expected" whenever Framer flipped render targets mid-lifetime (canvas ↔
	// preview ↔ published). Hooks must be unconditional: compute first,
	// branch after.
	// Duration from the existing Step Transition control must affect every variant
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
				style={{
					position: props.isActive ? "relative" : "absolute",
					top: props.isActive ? undefined : 0,
					left: 0,
					width: "100%",
					pointerEvents: props.isActive ? "auto" : "none",
					opacity: props.isActive ? 1 : 0,
				}}
				aria-hidden={props.isActive ? undefined : true}
				inert={props.isActive ? undefined : true}
			>
				{props.children}
			</div>
		);
	}
	return (
		<motion.div
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
			inert={props.isActive ? undefined : true}
			// Diagnostic: expose deterministic state as data attributes for
			// Elements/Computed inspection and for runtime logging verification.
			data-step-index={props.stepIndex}
			data-active-index={props.activeIndex}
			data-is-active={props.isActive ? "1" : "0"}
			data-transition-variant={props.variant}
			onAnimationComplete={() => {
				// Diagnostic hook — logs final deterministic state after each
				// transition. Keep lightweight; gated behind __BE_STEP_DEBUG__.
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

// In-session form snapshots. Step UI remounts (AnimatePresence keys,
// Framer canvas remounts) must not wipe answers — this lives outside
// any component instance. sessionStorage remains the reload path.
//
// INSTANCE-ISOLATION (rule 91): one snapshot PER PERSISTENCE IDENTITY,
// never a page-wide singleton. The old module-level single object let
// Instance A's answers/step seed Instance B's initial state (and gated
// B's own storage restore away) — the root cause of instances steering
// each other. Keys are the per-instance storage identity (see
// instanceKeyRef below): two engines on one page have two identities, so
// each seeds/clamps/persists only its own session. Any number of
// instances is supported; deliberately-identical author-set storage keys
// intentionally share a session (documented behavior).
type InSessionFormSnapshot = {
	values: BookingValues;
	currentIndex: number;
	timeFormat: "12h" | "24h";
};
const inSessionFormSnapshots = new Map<string, InSessionFormSnapshot>();

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
		font,
		headingFont,
		transition,
		transitionVariant,
		copy,
		calApiKey,
		calEventTypeId,
		onAnalytics,
	} = props;

	// SYN-01 fix: the addPropertyControls `validation` group is nested
	// inside the `copy` object control, so author edits are persisted to
	// props.copy.validation.* (NOT a top-level prop). Read the nested
	// path first; fall back to the legacy top-level prop for instances
	// saved before the group was nested inside `copy`.
	const validation = copy?.validation ?? props.validation;

	// T4-H3 fix: author-configurable validation messages (Copy panel →
	// Validation), threaded into validateField/validateStep. Defaults mirror
	// the previously hard-coded strings, so existing instances are
	// unaffected until an author changes them.
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
			customRegexError:
				validationMessages?.customRegexError ??
				DEFAULT_VALIDATION_COPY.customRegexError,
			invalidRegexError:
				validationMessages?.invalidRegexError ??
				DEFAULT_VALIDATION_COPY.invalidRegexError,
			// VALIDATION-REMOVED (rule 100): the minimum is fixed (3) —
			// no control, and stored overrides are ignored.
			minLength: DEFAULT_VALIDATION_COPY.minLength,
		};
		// W1-04-H1 fix: the memo body reads `validation`, so the dep array must
		// list `validation` — `[copy]` left stale validation messages in the
		// editor when only the Validation group changed.
	}, [validation]);

	// Destructure style tokens from the grouped Styles object. FIVE
	// independent author controls remain (COLOR-SYSTEM, rule 90): Accent,
	// Primary Foreground, Surface, Text, Border. There is deliberately NO
	// Background control (transparent root + calendar-owned surface) and
	// NO Error control (fixed internal red). Text Secondary and Success
	// are DERIVED below; the semantic token names stay identical
	// downstream, so every UI state keeps a valid color.
	const {
		accentColor,
		// PRIMARY-FOREGROUND: independent On-Primary token (see Styles control).
		accentForegroundColor,
		surfaceColor,
		textPrimaryColor,
		// BORDER: authored token, rendered verbatim everywhere a border is
		// drawn — one control, one semantic purpose (rule 90).
		borderColor,
		borderRadius,
	} = styles;
	// COLOR-SYSTEM derived/fixed tokens. Fixed design ratios and fixed
	// semantic colors — never contrast calculations, never color
	// validation, never auto-correction. The same local names the removed
	// props used keeps every downstream consumer (theme memo, RootShell/
	// StepBody/SuccessState props) valid.
	const textSecondaryColor = withAlpha(
		textPrimaryColor,
		DERIVED_SECONDARY_TEXT_ALPHA,
	);
	const successColor = DERIVED_SUCCESS_COLOR;
	const errorColor = FIXED_ERROR_COLOR;
	// Radius clamp: the Framer control (now Number) enforces 0–24 in the UI,
	// but runtime must also sanitize — a value outside the range must never
	// reach the rendered component even if passed programmatically.
	const sanitizedRadiusValue = React.useMemo(() => {
		const raw =
			typeof borderRadius === "number"
				? borderRadius
				: parseInt(String(borderRadius ?? "12"), 10);
		const n = Number.isFinite(raw) ? raw : 12;
		return Math.max(0, Math.min(24, Math.round(n)));
	}, [borderRadius]);
	const sanitizedRadius = `${sanitizedRadiusValue}px`;
	// FIELD-GAP: runtime clamp mirrors the control range (default 16px,
	// 0–32) so a programmatic value outside the range never reaches the DOM
	// — the same dual enforcement (control + runtime) the Radius token
	// uses. This single value drives the field-grid spacing in StepBody;
	// there is no second gap control (AGENTS.md hard rule).
	const fieldGap = React.useMemo(() => {
		const raw = Number(styles?.gap);
		const n = Number.isFinite(raw) ? raw : 16;
		return Math.max(0, Math.min(32, Math.round(n)));
	}, [styles?.gap]);
	// Progress settings (grouped object control). Defaults keep
	// previous instances behaving exactly as before.
	const progressVisible = progressBar?.visible !== false;
	const stepCountPosition: "top" | "bottom" =
		progressBar?.stepCountPosition === "bottom" ? "bottom" : "top";
	const progressShowTextContent = progressBar?.showTextContent !== false;
	const progressBarStyle: "solid" | "dashed" =
		progressBar?.barStyle === "solid" ? "solid" : "dashed";

	// Destructure copy from the grouped Buttons object (Requirement 5).
	// NAV-GROUP-TOGGLE: `groupNavButtons` is read from the Buttons group
	// (moved out of the top-level props). `=== true` keeps the default
	// Split layout for old instances that never set it.
	// BUTTON-GROUPS: per-button Text wins; the legacy flat label keeps
	// pre-grouping canvases' custom copy; then the shipped default.
	const { groupNavButtons } = buttonLabels;
	const bl = buttonLabels ?? {};
	const continueLabel = resolveButtonText(bl.continueButton?.text, bl.continueLabel, "Continue");
	const backLabel = resolveButtonText(bl.backButton?.text, bl.backLabel, "Back");
	const finalActionLabel = resolveButtonText(bl.finalActionButton?.text, bl.finalActionLabel, "Book Now");
	// CONFIRM-ACTIONS: confirmation-state labels + fixed home destination.
	// The `??`-style fallbacks cover instances saved before these controls
	// existed — they mirror the Property-Control defaults so old canvases
	// keep their exact previous copy.
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
	// HOME-URL-REMOVED: "Done" always navigates to the website root.
	// No control, no stored override — DEFAULT_CONFIRM_HOME_URL is the
	// destination, used directly at the render site.
	// (Button STYLE surfaces resolve in the engine component, next to
	// their render sites — theme/totalActive/isLast are declared later
	// in this hook, so resolving here trips TS2448/TS2454.)

	// Autosave-to-browser is a permanent, always-on product feature —
	// never an author toggle and never paired with disclosure UI.
	// Auto-generate a stable instance ID per component instance so
	// multiple BookingEngine components on the same page don't collide
	// in sessionStorage. SSR/hydration fix: Framer serves real browsers
	// a headless-prerendered HTML where effects have ALREADY run (and
	// can serve a plain renderToString variant to other clients), so
	// effect-set ids mismatch the hydrating client's first render. The
	// sessionStorage KEY is safe (never rendered), but the keyframes
	// name and every rendered id derived from an id hook are plain
	// constants now — see be-spin / be-field-* / be-dt-scroll /
	// be-calendar-grid-label / be-slot-error / be-timezone-select.
	const persistState = true;
	// Form-state lifetime is independent of step UI remounts AND of the
	// hydration-safe instance id (that id increments every mount and must
	// never be the sessionStorage key — a remount would miss the saved
	// answers). One engine is visible per page; the key is stable.
	const reactInstanceId = useHydrationSafeId("be-engine");
	// F-12-4 fix: never write or restore on the Framer canvas / exports —
	// persistence is a live-visitor feature only.
	const isStaticRender = useIsStaticRenderer();

	// W1-02-F4–F8 fix (bundle 17): single merged errorCopy — old canvases
	// (no `copy.errorCopy` group) fall back to ERROR_COPY_DEFAULTS; the
	// five error surfaces read through this one object.
	const errorCopy = React.useMemo(
		() => ({ ...ERROR_COPY_DEFAULTS, ...(copy?.errorCopy || {}) }),
		[copy?.errorCopy],
	);
	// W1-02-F26 fix: self-hosted Cal.com base URL; trailing slashes are
	// normalized so the "/v2/..." suffix always joins cleanly. `??` covers
	// instances saved before the control existed.
	const calApiBaseUrl = (
		props.calApiBaseUrl ?? DEFAULT_CAL_API_BASE_URL
	).replace(/\/+$/, "");
	// DURATION-SOURCE (hard rule): the author-tunable
	// `defaultMeetingDurationMs` Property Control AND its props fallback are
	// removed. The meeting duration now resolves in ONE place — after the
	// Cal.com event metadata hook below — from `calEventMeta.durationMinutes`;
	// until metadata arrives, the module-level DEFAULT_MEETING_DURATION_MS
	// constant (not a control, not a prop) keeps ICS/deep-links/success-screen
	// behavior stable. Cal.com is the single source of truth.

	// T5-M8 fix: honor the visitor's prefers-reduced-motion setting - the
	// step fades/glides, the progress-bar spring, and the toggle slider all
	// collapse to instant when motion is reduced.
	const prefersReducedMotion = useReducedMotion();

	// Resolve the Framer transition for step-to-step animation. Falls back to a
	// smooth default if the editor hasn't customized it.
	// W2-37-A1 fix: an author-customized `stepTransition` previously bypassed
	// reduced motion entirely (the short-circuit only zeroed the DEFAULT). Now
	// prefers-reduced-motion wins no matter what the author configured — step
	// changes are instant for those visitors.
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

	// THEME-AGNOSTIC: the old colorMode → palette resolution, the
	// prefers-color-scheme listener and the dark pick() branch were removed
	// with the Theme control. There is exactly one semantic palette — the
	// author's configured values below — and the engine never switches it.
	// (The old matchMedia subscription here was the last light/dark branch;
	// nothing reads the OS scheme any more.)

	// W1-19-F-07 fix: on mobile the virtual keyboard shrinks the visual
	// viewport, which can cover the field being typed into (no auto-scroll
	// happens while the user is mid-edit). Whenever the visual viewport
	// resizes while a flow control has focus, nudge the focused control
	// back into view with a nearest-edge scroll — a no-op when nothing
	// needs moving.
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
				// W1-01-F-05 fix: defense-in-depth guard matching the
				// L7153 pattern — the outer effect already checked
				// `window` and `visualViewport`, but a rAF callback can
				// outlive whatever assumed its own globals.
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

	// Fix #25: memoize the theme object so child components wrapped in
	// React.memo don't re-render on every parent render.
	// THEME-AGNOSTIC + COLOR-SYSTEM: exactly ONE semantic palette. Accent,
	// Primary Foreground, Surface, Text and Border are the author's
	// configured values, rendered verbatim — no Light/Dark/Auto branching,
	// no contrast logic (AGENTS.md hard rules). Text Secondary and Success
	// are derived at the fixed design ratios above; Error is the fixed
	// internal red. Site-level theme switching stays the author's job via
	// Framer Color Variables assigned to the five Styles color controls.
	const theme = React.useMemo<Theme & { borderRadius: string }>(
		() => ({
			accentColor,
			// PRIMARY-FOREGROUND: rendered verbatim — no derivation.
			accentForegroundColor,
			surfaceColor,
			textPrimaryColor,
			textSecondaryColor,
			borderColor,
			errorColor,
			successColor,
			// Not a color token, carried for the ErrorScreen surface —
			// never theme-switched (the single Radius token rules it).
			borderRadius: sanitizedRadius,
		}),
		[
			accentColor,
			accentForegroundColor,
			surfaceColor,
			textPrimaryColor,
			// BORDER is an authored token (rule 90) — it must be a memo dep or
			// Border-only edits render a stale theme (the derived/fixed
			// tokens below recompute from these same inputs).
			borderColor,
			sanitizedRadius,
		],
	);

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
		];
		const clampedCount = clamp(Math.round(stepCount ?? 2), 1, 10);
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

	// Normalize the authored schema into stable IDs.
	const normalizedSteps = React.useMemo(
		() => normalizeSteps(effectiveStepsConfig),
		[effectiveStepsConfig],
	);

	// Pipeline: only enabled steps participate, in fixed-slot order
	// (Step 1 → Step N, truncated by `stepCount`). Step order is not
	// drag-reorderable in the panel — see fixed-slots rationale above
	// and at the makeStepControl definition.
	// baseActiveSteps is the author-authored pipeline; activeSteps below
	// may include an auto-injected Additional Details step for missing
	// required Cal.com bookingFields (visitor only, 11-step exception).
	const baseActiveSteps = React.useMemo(
		() => normalizedSteps.filter((step) => step.enabled),
		[normalizedSteps],
	);
	const baseTotalActive = baseActiveSteps.length;

	// Base navigation (author-authored pipeline only) — used for hasDatetimeStep
	// and for initial hydration before Cal.com fields are known. Effective
	// navigation (with auto-injected Additional Details step) is defined after
	// the bookingFields fetch below.
	// INSTANCE-ISOLATION: initial state is hydration-neutral (empty/step 1/
	// 12h — identical on server and client). A remount of a live session is
	// seeded pre-paint by the identity effect below from THIS instance's
	// own snapshot; a fresh visit is restored pre-paint from THIS
	// instance's own storage key. Nothing is ever read from another
	// instance's session.
	const [currentIndex, setCurrentIndex] = useStateGuarded(
		0,
		baseTotalActive,
	);
	// CC-8 fix: `useStateGuarded` only re-clamps when its setter is called —
	// it does not retroactively clamp the already-committed state when
	// `totalActive` shrinks on its own (e.g. an author disables a step
	// while a visitor is mid-flow). The correction effect below fixes this
	// on the NEXT commit, but the render that happens before that effect
	// runs would otherwise read `activeSteps[currentIndex]` as `undefined`
	// and crash on `currentStep.title`. This is defense-in-depth: clamp for
	// this render too, not just in the effect.
	const baseSafeCurrentIndex = Math.min(currentIndex, Math.max(0, baseTotalActive - 1));
	// FINAL-63 fix: explicit bounds guard — the indexed read is honest about
	// being fallible (empty pipeline / mid-flow step removal), matching the
	// SYN-04 handling downstream instead of relying on clamp arithmetic alone.
	const baseCurrentStep: NormalizedStep | undefined =
		baseSafeCurrentIndex >= 0 && baseSafeCurrentIndex < baseActiveSteps.length
			? baseActiveSteps[baseSafeCurrentIndex]
			: undefined;
	const baseIsFirst = baseSafeCurrentIndex === 0;
	const baseIsLast = baseSafeCurrentIndex === baseTotalActive - 1;

	// F-03-1 fix: the pipeline used to track position by array index only,
	// so when an author toggled an intermediate step's `enabled` OFF
	// mid-flow, the visitor's plain index silently re-pointed at a
	// DIFFERENT step (wrong step content with no warning) — the CC-8
	// clamp above only catches the index running past the end. Track the
	// currently-visited step by its stable ID and re-resolve that ID
	// against the new active set during render — before paint — so:
	//   - steps removed BEFORE the visitor's step shift the index down
	//     (they stay on the same step), and
	//   - the step they were ON being removed lands the flow on the next
	//     enabled step rather than a silent swap to arbitrary content.
	const pinnedStepIdRef = React.useRef<string | null>(null);
	const lastActiveStepsKeyRef = React.useRef<string>(
		baseActiveSteps.map((step) => step.id).join("|"),
	);
	React.useEffect(() => {
		pinnedStepIdRef.current = baseActiveSteps[baseSafeCurrentIndex]?.id ?? null;
	}, [baseSafeCurrentIndex, baseActiveSteps]);
	// Render-phase adjustment (the documented React pattern for reacting
	// to derived-state/prop changes before paint).
	// Note: this base adjustment keeps hydration stable; effective adjustment
	// with auto-injected step is handled after effectiveActiveSteps below.
	const baseActiveStepsKey = baseActiveSteps.map((step) => step.id).join("|");
	if (baseActiveStepsKey !== lastActiveStepsKeyRef.current) {
		lastActiveStepsKeyRef.current = baseActiveStepsKey;
		const pinnedIndex = pinnedStepIdRef.current
			? baseActiveSteps.findIndex((step) => step.id === pinnedStepIdRef.current)
			: -1;
		const remapped =
			pinnedIndex !== -1
				? pinnedIndex
				: // W1-03-5 fix: the fallback used raw `currentIndex`; the
				// clamped `safeCurrentIndex` is the semantically correct
				// value when the pinned ID is stale/missing.
				Math.min(baseSafeCurrentIndex, baseTotalActive - 1);
		if (remapped !== currentIndex) {
			// W1-03-4 fix: `React.startTransition` deferred the commit —
			// the "before paint" guarantee this render-phase remap exists
			// for was defeated, and the visitor saw the wrong step for a
			// frame. Direct set matches the W1-14-F6 sibling clamp.
			setCurrentIndex(remapped);
		}
	}

	// Form state. Hydration-safe: start empty (matches server) and hydrate
	// from in-memory snapshot (remount) or sessionStorage in layout effect.
	// Do not read sessionStorage synchronously during render (hydration #425).
	// INSTANCE-ISOLATION: start empty (hydration-safe; matches server). The
	// identity effect below seeds from this instance's own snapshot on
	// remount, pre-paint.
	const [values, setValues] = React.useState<BookingValues>({});
	const [errors, setErrors] = React.useState<Record<string, string | null>>({});
	const [touched, setTouched] = React.useState<Record<string, boolean>>({});
	const [flowStatus, setFlowStatus] = React.useState<FlowStatus>("in-progress");
	const [submitError, setSubmitError] = React.useState<string | null>(null);
	const [bookingResult, setBookingResult] =
		React.useState<BookingConfirmation | null>(null);

	// Date/time tracking for the datetime step.
	// T6-L9 fix: the booked slot lives in exactly ONE place -
	// `values[SELECTED_SLOT_KEY]`. The parent's date is DERIVED from it,
	// falling back to the transient day the visitor is browsing (the
	// calendar can't wait for a full slot: picking a date must show that
	// day's times before a time is chosen). Everything downstream
	// (slotsForSelectedDate, the "no times" banner, the initialDate seed)
	// reads this derived value, so there is no second source of truth to
	// drift. The child's own selectedDate/selectedTime are local UI state.
	const [pickedDate, setPickedDate] = React.useState<Date | null>(null);
	// W1-15-TS-12 fix: the `as Date | null` cast was redundant — the trailing
	// `?? null` already widens `undefined` to `null`.
	const selectedDate = pickedDate ?? values[SELECTED_SLOT_KEY]?.date ?? null;
	const [visibleMonth, setVisibleMonth] = React.useState<Date | null>(null);
	// TZ-TIME-HARD-RULE: the visitor's time zone is ALWAYS auto-detected
	// from the browser (`detectTimezone()`). It is never user-selectable and
	// never author-configurable — the visible Time Zone <select> and the
	// Properties-Controls "Time Zones" list were removed (see AGENTS.md).
	// This single source of truth flows into the Cal.com slots fetch (the
	// `timeZone` query param) and every formatting helper, so a visitor in
	// Cairo always sees slots in Africa/Cairo even when the clinic's Cal.com
	// event is configured in America/New_York.
	//
	// SSR/hydration fix: the initializer used to call detectTimezone()
	// during render — server saw "UTC", the visitor's browser saw the real
	// IANA zone, diverging the SSR HTML from the first client render.
	// Start at the server-identical "UTC"; the effect swaps in the real
	// zone post-hydration. There is no saved-progress override anymore, so
	// the functional-form guard just skips the swap if it already ran.
	const [timeZone, setTimeZone] = React.useState<string>("UTC");
	// PRERENDER-DEFER: the zone swap used to run on mount unconditionally —
	// in the headless prerender that baked the PRERENDER HOST's IANA zone
	// into the served markup chain (clock, date keys). Defer to interactive
	// clients so the served HTML keeps "UTC" exactly like the first render.
	const beInteractiveForTz = useBeInteractive();
	React.useEffect(() => {
		if (!beInteractiveForTz) return;
		setTimeZone((prev) => (prev === "UTC" ? detectTimezone() : prev));
	}, [beInteractiveForTz]);
	// TZ-TIME-HARD-RULE: the 12h/24h time format is a per-visitor runtime
	// preference. It ALWAYS defaults to 12h and is controlled ONLY by the
	// end user via the on-widget toggle in the time-slot picker. The
	// Properties-Controls "Initial Time Format" preset was removed (see
	// AGENTS.md); `defaultTimeFormat` no longer exists.
	//
	// Task 2 M6 fix: this was purely local state inside `DateAndTimeInline`
	// before, which meant it reset back to the hardcoded "12h" default
	// every time the visitor stepped away from the datetime step and back
	// (each step's content unmounts on navigation), and obviously never
	// survived a page refresh either. Lifted up alongside `timeZone`, which
	// already got this treatment, so both choices persist the same way.
	// (The visitor's own format choice is still persisted to sessionStorage
	// below — that is a per-viewer preference, not an author preset.)
	const [timeFormat, setTimeFormat] = React.useState<"12h" | "24h">("12h");

	// INSTANCE-ISOLATION (rule 91): per-instance persistence identity.
	// The base key is the fixed historical key "booking-engine:session"
	// (the `sessionStorageKey` author control was removed). The EFFECTIVE
	// identity is derived from this root's position
	// among all `[data-be-engine-root]` elements: the FIRST instance keeps
	// the plain historical key (existing single-engine saved progress stays
	// reachable — rules 13/20 preserved), every ADDITIONAL instance gets a
	// positional suffix. The identity is mount-stable (DOM order of the
	// roots does not change across re-renders), supports any number of
	// instances, involves no "top/bottom" detection, and never renders
	// into markup (layout effect only) so hydration stays byte-identical.
	const baseSessionKey = "booking-engine:session";
	const instanceKeyRef = React.useRef<string>(baseSessionKey);
	// Runs as the FIRST layout effect of the hook (declared before the
	// snapshot write + restore effects): resolve identity, then seed this
	// instance's own in-session snapshot pre-paint (rule 16 — no Step-1
	// flash on remount). Seeding is scoped to THIS instance's key, so
	// Instance A's step/values can never seed Instance B.
	useIsomorphicLayoutEffect(() => {
		if (typeof document === "undefined") return;
		const root = engineRootRef?.current;
		if (root) {
			const roots = Array.from(
				document.querySelectorAll<HTMLElement>("[data-be-engine-root]"),
			);
			const idx = roots.indexOf(root);
			instanceKeyRef.current =
				idx <= 0 ? baseSessionKey : `${baseSessionKey}#${idx + 1}`;
		}
		const snap = inSessionFormSnapshots.get(instanceKeyRef.current);
		if (!snap) return;
		setValues({ ...snap.values });
		setCurrentIndex(
			Math.min(snap.currentIndex, Math.max(0, baseTotalActive - 1)),
		);
		setTimeFormat(snap.timeFormat);
		// Mirror the storage-restore month handling: keep the calendar on
		// the month of the seeded selection (M3 fix parity).
		const snapSlot = snap.values[SELECTED_SLOT_KEY];
		if (snapSlot && typeof snapSlot === "object" && "date" in snapSlot) {
			const d = (snapSlot as { date?: unknown }).date;
			if (d instanceof Date && !Number.isNaN(d.getTime())) {
				setPickedDate(d);
				setVisibleMonth(new Date(d.getFullYear(), d.getMonth(), 1));
			}
		}
		// baseSessionKey/root identity only; the seed reads the map once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [baseSessionKey, baseTotalActive]);

	// Keep this instance's snapshot in lockstep so a remount (animation
	// unmount, Framer canvas) rehydrates from memory, not empty useState.
	// Per-identity map — never another instance's session (rule 91).
	React.useEffect(() => {
		inSessionFormSnapshots.set(instanceKeyRef.current, {
			values,
			// Uses base index before auto-inject; effective index is handled after
			// effectiveActiveSteps is resolved (visitor auto step).
			currentIndex: baseSafeCurrentIndex,
			timeFormat,
		});
	}, [values, baseSafeCurrentIndex, timeFormat]);

	// Persisted-state restore. Autosave is always-on (rule 7); payloads
	// carry a schema version so a future shape change can migrate or purge
	// instead of silently mis-restoring.
	const PERSIST_SCHEMA_VERSION = 1;
	// Restore before paint so a saved currentIndex never flashes Step 1.
	// Hydration fix (#425/#418/#422): server and initial client render must
	// match (Step 1). Do not read sessionStorage synchronously in initializers.
	// This layout effect runs after hydration but before paint, so the update
	// to Step 2/3 is not a hydration mismatch (both initial renders were Step 1).
	// If an in-memory snapshot exists (remount within same session), it was
	// already used as initial state and is more recent than debounced storage,
	// so skip the sessionStorage read to avoid stale overwrite.
	//
	// BE-REMOUNT-RESTORE fix: the snapshot gate is now "any snapshot at all",
	// not "snapshot with data". A non-null module snapshot proves THIS mount
	// is a remount of a live page session (Framer breakpoint switches re-mount
	// code components when the preview/published page crosses a breakpoint,
	// animation unmounts, canvas re-parents) — not a fresh visit. On such a
	// remount the live snapshot is authoritative even when it looks pristine:
	// re-reading sessionStorage here resurrected progress saved EARLIER in the
	// same tab and teleported the visitor onto a previously-saved step (e.g.
	// straight onto the Calendar step with its final-action button) purely
	// because they resized across a breakpoint boundary. Fresh page loads have
	// a null snapshot and still restore saved progress below, so the
	// always-on autosave restore contract (AGENTS.md rules 7/16/20) is
	// unchanged; only mid-session resurrection is gone.
	useIsomorphicLayoutEffect(() => {
		if (!persistState) return;
		if (typeof window === "undefined") return;
		// F-12-4 fix: no restore on the canvas / in exports.
		if (isStaticRender) return;
		// INSTANCE-ISOLATION: the gate is THIS instance's own snapshot — a
		// non-null entry for our identity proves this mount is a remount of
		// a live session (rule 74 semantics, now per instance). Another
		// instance's snapshot must never gate our restore.
		if (inSessionFormSnapshots.has(instanceKeyRef.current)) return;
		try {
			const raw = window.sessionStorage.getItem(instanceKeyRef.current);
			if (!raw) return;
			// F-12-6 fix (merge) + F-12-8 fix (reviver removal): the old global
			// reviver converted ANY property named "date" holding an ISO string
			// into a Date object — including a visitor-typed text field called
			// "date". The targeted block below rehydrates only
			// `__selectedSlot.date` (the one known Date-bearing key); every other
			// value stays exactly as stored.
			const parsed = JSON.parse(raw) as {
				v?: unknown;
				values?: Record<string, unknown>;
				timeZone?: unknown;
				timeFormat?: unknown;
				currentIndex?: unknown;
			};
			if (parsed && typeof parsed === "object") {
				// F-12-3 fix: stamp mismatch means an old/corrupt shape —
				// purge it rather than guess.
				if (parsed.v !== PERSIST_SCHEMA_VERSION) {
					console.info(
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
				// W1-15-TS-14 fix: the previous `as (Omit<BookingPayload,
				// "date"> & { date?: unknown }) | undefined` cast re-narrowed
				// only `date` while accepting `time24h`/`timeLabel`/`end`
				// unvalidated — hostile sessionStorage could smuggle
				// non-string values that corrupt ICS/calendar-deep-link
				// consumers downstream. Full runtime guard first; anything
				// that fails is purged rather than guessed at. `date` is
				// still rehydrated from its ISO string to a real Date below.
				const rawSlot = restoredValues[SELECTED_SLOT_KEY];
				if (rawSlot !== undefined && !isBookingPayload(rawSlot)) {
					restoredValues[SELECTED_SLOT_KEY] = undefined;
				}
				const restoredSlot = isBookingPayload(rawSlot) ? rawSlot : undefined;
				// Fix #3: re-hydrate __selectedSlot.date from ISO string to
				// a real Date object so downstream Date methods don't throw.
				if (restoredSlot && !(restoredSlot.date instanceof Date)) {
					try {
						// W1-15-TS-06 fix: `typeof` narrow instead of a raw
						// `as string` cast — non-string, non-Date junk feeds an
						// empty string to the Date constructor, yielding an
						// Invalid Date that the NaN check below rejects
						// cleanly (same outcome as before, without the opaque
						// `new Date(unknown)` construction or a thrown
						// `.getTime()` TypeError).
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
				// F-12-6 fix: merge over any current/default values instead
				// of wholesale replacement (restore should never blank out
				// values written between load and parse). The single cast
				// here is parse-time data entering a typed map (W1-15-TS-05).
				// W1-15-TS-02 fix: hostile/corrupt sessionStorage could put
				// arrays/objects into visitor-typed fields — every value is
				// narrowed at the boundary. SELECTED_SLOT_KEY is exempt (it
				// is the one structured key, re-narrowed below).
				const restoredEntries = Object.entries(restoredValues).filter(
					([key, value]) => key === SELECTED_SLOT_KEY || isFieldValue(value),
				);
				// W1-15-TS-11 fix: bind the FILTERED map once and pass it to
				// both setValues and validateStep — the latter used to get
				// the unfiltered `restoredValues` (hostile arrays/numbers in
				// the hostile-sessionStorage shape reached validateStep
				// despite the boundary narrow). Defensive `String(value)`
				// coercion still stands, but the type lie is gone.
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
						// Already rehydrated to a Date above; the instanceof
						// guard keeps the parse-time `unknown` from reaching
						// Date's constructor un-narrowed (W1-15-TS-05).
						const restoredDate =
							slot.date instanceof Date
								? slot.date
								: new Date(String(slot.date));
						setPickedDate(restoredDate);
						// M3 fix: only `selectedDate` was restored — the
						// calendar itself defaults to *today's* month
						// whenever `visibleMonth` is null, so a visitor who
						// picked a date next month, then refreshed, came
						// back to see this month's grid with nothing
						// visibly selected (their actual selection was just
						// scrolled off-screen). Restore the month the
						// selected date is actually in too.
						setVisibleMonth(
							new Date(restoredDate.getFullYear(), restoredDate.getMonth(), 1),
						);
					}
				}
				// TZ-TIME-HARD-RULE: time zone is never restored from saved
				// progress — it is always freshly auto-detected from the
				// browser on every load (the auto-detect effect above).
				// Restoring a previously stored zone would re-introduce a
				// manual override. Only the visitor's own 12h/24h format
				// choice is restored (a per-viewer preference, not an
				// author preset).
				if (parsed.timeFormat === "12h" || parsed.timeFormat === "24h") {
					setTimeFormat(parsed.timeFormat);
				}
				// T6-H2 fix: restore the step the visitor was on. Clamped by
				// the `useLayoutEffect` below if the author shrank the step
				// count since the session was saved.
				// W1-04-H3 fix: restore must not bypass validation. Re-run
				// `validateStep` over every *prior* step against the restored
				// values; if any fails, clamp the visitor back to the first
				// invalid step so a refresh can't jump past an incomplete
				// required field. The restored step itself may legitimately
				// be mid-fill, so it is not validated here.
				if (
					typeof parsed.currentIndex === "number" &&
					Number.isFinite(parsed.currentIndex) &&
					parsed.currentIndex >= 0
				) {
					// W1-12-F-12-14 fix: a hand-crafted entry with a huge
					// `currentIndex` (e.g. 1e6) used to loop a million times
					// (same-origin DoS); bound the iteration to the number of
					// active steps before re-validating prior steps.
					// Uses base pipeline; auto-injected step not yet known at restore time.
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
					setCurrentIndex(restoredIndex);
				}
			}
		} catch (err: unknown) {
			// T6-L6 fix: previously silent - a corrupt/oversized saved session
			// must not quietly kill the restore path with zero trace.
			console.warn("BookingEngine: failed to restore saved progress.", err);
			// F-12-1 fix: a parse failure used to leave the corrupt entry in
			// storage forever, so every reload re-threw the same error. Purge it.
			try {
				window.sessionStorage.removeItem(instanceKeyRef.current);
			} catch {
				console.warn("BookingEngine: failed to purge corrupt saved progress.");
			}
		}
	}, [persistState, isStaticRender]);

	// Persist on every change while in-progress.
	// T6-M1 fix: the write used to run synchronously on EVERY keystroke
	// (JSON.stringify + sessionStorage.setItem per character). Debounce by
	// 300ms so a typing burst serializes once, after the pause.
	const persistTimerRef = React.useRef<number | null>(null);
	// T7-H6 fix: the 0ms focus timers are stored here so they can be cancelled
	// on unmount - previously they were fire-and-forget and could run against
	// a detached DOM node.
	const focusTimerRef = React.useRef<number | null>(null);
	// W2-30-F3 fix: focus timers were overwritten without clearing the prior
	// one — a queued 0ms timer from a previous Continue click could fire after
	// the visitor had already moved on. Every schedule clears the previous timer
	// first, so only the latest focus intent survives.
	const scheduleFocusTimer = React.useCallback((fn: () => void) => {
		if (focusTimerRef.current !== null) {
			window.clearTimeout(focusTimerRef.current);
		}
		focusTimerRef.current = window.setTimeout(fn, 0);
	}, []);
	React.useEffect(() => {
		if (!persistState) return;
		if (typeof window === "undefined") return;
		// F-12-4 fix: never write on the canvas / in exports.
		if (isStaticRender) return;
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
			// F-12-9 fix: the very first write on a fresh mount is redundant —
			// an untouched form has nothing worth persisting. Only write once
			// the visitor actually entered something or left step 0.
			// Uses base index before auto-inject; effective persist is handled
			// via the same base value (auto step is always before calendar, so
			// the offset is stable and the restore clamp handles any shift).
			const hasAnything =
				baseSafeCurrentIndex > 0 ||
				Object.values(values).some(
					(v) => v !== undefined && v !== null && v !== "",
				);
			if (!hasAnything) return;
			try {
				window.sessionStorage.setItem(
					instanceKeyRef.current,
					JSON.stringify({
						// F-12-3 fix: schema stamp on every write.
						v: PERSIST_SCHEMA_VERSION,
						// W1-12-F-12-13 fix: `values` already contains
						// SELECTED_SLOT_KEY (it lives inside BookingValues), and
						// the restore path only reads `parsed.values` — the old
						// separate top-level copy was ~76 bytes of dead weight
						// per write.
						values,
						// TZ-TIME-HARD-RULE: time zone is deliberately NOT
						// persisted — it is always re-detected from the
						// browser on load. Persisting a zone (or restoring
						// one) would re-introduce a manual override that
						// could show the wrong wall-clock to a visitor who
						// moved locations between sessions. Only the
						// visitor's own time-format preference is saved.
						timeFormat,
						// T6-H2 fix: currentIndex was never persisted, so a
						// refresh mid-flow silently dropped the visitor back to
						// step 0 (the layout effect below re-clamps the restored
						// value if the author changed the step count meanwhile).
						currentIndex: baseSafeCurrentIndex,
					}),
				);
			} catch (err: unknown) {
				// T6-L6 fix: a quota-exceeded write (5MB typical) used to be
				// silently swallowed - the visitor believed progress was being
				// saved while nothing was. Log it; there is no visitor-facing
				// disclosure for autosave.
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
		// TZ-TIME-HARD-RULE: `timeZone` is intentionally absent — it is no
		// longer persisted, so it must not trigger persistence writes.
		timeFormat,
		baseSafeCurrentIndex,
		isStaticRender,
	]);

	// W2-29-N2 fix: the focusTimerRef cleanup used to live inside the
	// persist effect's teardown, but that effect early-returns (no
	// cleanup registered) whenever persistState is off, on the canvas, or
	// after success — so in those configurations a scheduled focus timer
	// leaked until the engine unmounted. Its cleanup now lives here, in an
	// unmount-only effect that always runs.
	React.useEffect(() => {
		return () => {
			if (focusTimerRef.current !== null) {
				window.clearTimeout(focusTimerRef.current);
				focusTimerRef.current = null;
			}
		};
	}, []);

	// Reset currentIndex if it ever exceeds the active pipeline length
	// (e.g. when author disables steps while a user is mid-flow).
	// CC-8 fix: useLayoutEffect instead of useEffect so the correction
	// commits before the browser paints, closing the window during which a
	// stale currentIndex could be visible (the `safeCurrentIndex` clamp
	// above still covers the very first render, before any effect runs).
	useIsomorphicLayoutEffect(() => {
		// W1-14-F6 fix: was wrapping setCurrentIndex in startTransition —
		// a deferred update commits after paint, so the layout-effect
		// guarantee (correction applied before paint) was defeated. The
		// clamp now commits synchronously inside the layout phase.
		// Uses baseTotalActive here; effective clamp is handled after
		// auto-injected step is resolved below.
		if (currentIndex >= baseTotalActive && baseTotalActive > 0) {
			setCurrentIndex(Math.max(0, baseTotalActive - 1));
		} else if (baseTotalActive === 0) {
			setCurrentIndex(0);
		}
	}, [currentIndex, baseTotalActive]);

	// Cal.com slots — fetched when a datetime step is present in the flow,
	// the visitor has ACTUALLY REACHED a datetime step, and config is
	// present. Two gates, one deterministic lifecycle:
	//
	// 1. REACHED-GATE (this block): the old gating on the *static*
	//    `hasDatetimeStep` fired the availability GET the moment the
	//    hidden-mounted calendar self-seeded its month — while the visitor
	//    was still on Step 1 (the console evidence shows both GETs, and
	//    their 429s, during the Step-1 page load). `reachedDatetimeStep`
	//    flips ONCE, when the visitor first lands on a datetime step (incl.
	//    saved-progress restore), and never flips back — so the effect dep
	//    stays stable for the rest of the flow (T2-M4's concern) while the
	//    eager pre-Calendar fetch is gone.
	// 2. INTERACTIVE-GATE (inside useCalcomSlots): no network during SSR,
	//    the headless prerender, or pre-interaction automation.
	const hasDatetimeStep =
		baseActiveSteps.some((step) => step.stepType === "datetime") ?? false;
	const hasCalConfig = Boolean(calApiKey && calEventTypeId);
	const [reachedDatetimeStep, setReachedDatetimeStep] =
		React.useState(false);
	const {
		slots,
		loading: slotsLoading,
		error: slotsError,
		// T3-H4 fix: retry path refetches availability (see handleRetry).
		refetch: slotsRefetch,
	} = useCalcomSlots(
		hasCalConfig ? calApiKey : "",
		hasCalConfig ? calEventTypeId : "",
		hasDatetimeStep && reachedDatetimeStep ? visibleMonth : null,
		timeZone,
		copy?.availabilityErrorLabel,
		errorCopy,
		FETCH_TIMEOUT_MS,
		// W1-02-F26 fix: self-hosted base URL.
		calApiBaseUrl,
		DEFAULT_CAL_API_VERSION,
		SLOTS_CACHE_TTL_MS,
	);

	// CAL-EVENT-META: fetch event/profile metadata — same key + Event ID +
	// Base URL, read-only. Never gates availability: the panel shows a
	// deterministic loading/fallback instead of blocking or vanishing.
	// `status` is server/client-identical on first render (hydration
	// parity). INTERACTIVE-GATE: this runs AFTER hydration (the flag is
	// false until then), which also keeps the headless prerender from
	// firing this GET at publish time — metadata is needed early for the
	// required-field auto-injection and the info panel, but never before
	// the client is real. The success-only cache (below) dedupes repeats.
	const beInteractiveForMeta = useBeInteractive();
	const { status: calEventMetaStatus, meta: calEventMeta, bookingFields: calBookingFields } = useCalcomEventMeta({
		enabled: hasCalConfig && hasDatetimeStep && beInteractiveForMeta,
		apiKey: calApiKey,
		eventTypeId: calEventTypeId,
		apiBaseUrl: calApiBaseUrl,
	});

	// DURATION-SOURCE (hard rule): Cal.com event metadata is the single
	// source of truth for the meeting duration. `durationMinutes` comes
	// straight from the /v2/event-types payload (the same GET that powers
	// the info panel and the required-field auto-injection); the module
	// constant is a transient placeholder until the metadata lands — NOT
	// an author-facing control or prop. Downstream consumers (ICS export,
	// calendar deep links, success screen, info-panel fallback minutes)
	// are unchanged; they simply read the metadata-derived value now.
	const meetingDurationMs = React.useMemo(() => {
		const minutes = calEventMeta?.durationMinutes;
		if (typeof minutes === "number" && Number.isFinite(minutes) && minutes > 0) {
			return Math.round(minutes) * 60 * 1000;
		}
		return DEFAULT_MEETING_DURATION_MS;
	}, [calEventMeta]);

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
		if (!hasCalConfig) return undefined;
		const set = new Set<string>();
		for (const slot of slots) {
			const d = new Date(slot.value);
			if (Number.isNaN(d.getTime())) continue;
			// CC-13 completion: was browser-local Y/M/D, so near-midnight
			// slots bucketed into the wrong calendar day whenever the
			// selected timezone differed from the browser's. Use the same
			// zone the labels were computed in.
			set.add(getDateKeyInTimeZone(d, timeZone));
		}
		return set;
	}, [hasCalConfig, slots, timeZone]);

	// Filter slots to the selected date (if a date is picked).
	const slotsForSelectedDate = React.useMemo(() => {
		if (!selectedDate) return slots;
		const selectedKey = getDateKeyInTimeZone(selectedDate, timeZone);
		return slots.filter((slot) => {
			try {
				const d = new Date(slot.value);
				// CC-13 completion: was `isSameDay` (browser-local) — same
				// near-midnight misbucket. Compare calendar days in the
				// visitor's selected timezone instead.
				return getDateKeyInTimeZone(d, timeZone) === selectedKey;
			} catch {
				return false;
			}
		});
	}, [slots, selectedDate, timeZone]);

	// CC-10 fix: `canProceed` was dead code (never read anywhere) that ran
	// a full `validateStep()` on every keystroke because `values` was a
	// dependency — directly contradicting this file's own rule that
	// validation must never run while typing (see handleFieldChange above).
	// Deleted rather than kept "just in case": if step-gating on validity is
	// ever wanted, it should be recomputed where it's used, not sit here
	// silently paying a per-keystroke cost for nothing.

	// T9-M7 fix: the render target is static for a component's lifetime;
	// compute once instead of reading it on every render.
	// W1-13-F-13-10 fix: hoisted above every canvas-only memo below — on
	// the published site those banners never render, so their verdicts
	// must never be computed either.
	const isCanvas = React.useMemo(
		() => RenderTarget.current() === RenderTarget.canvas,
		[],
	);

	// CAL-REQUIRED-FIELDS: missing required Cal.com bookingFields not covered by base pipeline.
	// Covered if any field has calFieldId === slug or auto-slug(label) === slug (case-insensitive),
	// plus name/email special handling. Used for canvas warning and visitor auto-inject.
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

	// Effective pipeline: base + auto-injected Additional Details step before datetime (visitor only, 11-step exception).
	// Hydration-safe: starts as base (both server and client first render), then expands after bookingFields fetch.
	const effectiveActiveSteps = React.useMemo(() => {
		if (missingRequiredCalFields.length === 0) return baseActiveSteps;
		if (isCanvas) return baseActiveSteps;
		const autoFields: NormalizedField[] = missingRequiredCalFields.map((f) => {
			// AUTO-INJECT-TYPES fix: three mapping gaps made auto steps
			// fail validation or wedge entirely (verified against live
			// Cal.com shapes):
			//  - number/url fall through to `text` and inherited the
			//    name-like min-length-3 gate, so "7" failed. Short-value
			//    Cal types gate at minLength 1 (required + non-empty).
			//  - select/radio/multiselect with zero parseable options is
			//    UNSATISFIABLE as required (nothing to pick — the step
			//    could never advance). Fall back to free text so the
			//    step stays passable; the canvas warning already tells
			//    the author to fix the source field.
			//  - multiselect stays single-`select` (no multi-pick UI
			//    exists) — documented limitation, one value is accepted.
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
		const dtIdx = baseActiveSteps.findIndex((s) => s.stepType === "datetime");
		if (dtIdx >= 0) {
			return [...baseActiveSteps.slice(0, dtIdx), autoStep, ...baseActiveSteps.slice(dtIdx)];
		}
		return [...baseActiveSteps, autoStep];
	}, [baseActiveSteps, missingRequiredCalFields, isCanvas]);

	// Final pipeline used for rendering, progress, navigation and submission.
	// baseActiveSteps remains the author-authored source for hasDatetimeStep and canvas warnings.
	const activeSteps = effectiveActiveSteps;
	const totalActive = activeSteps.length;
	const safeCurrentIndex = Math.min(currentIndex, Math.max(0, totalActive - 1));
	const currentStep: NormalizedStep | undefined =
		safeCurrentIndex >= 0 && safeCurrentIndex < activeSteps.length ? activeSteps[safeCurrentIndex] : undefined;
	const isFirst = safeCurrentIndex === 0;
	const isLast = safeCurrentIndex === totalActive - 1;

	// REACHED-GATE (part 1 of the slots gating above): flip once, here,
	// where the EFFECTIVE pipeline (auto-injected step included) is known.
	// Landing on any datetime step — by Continue, jump, or saved-progress
	// restore — flips it; it never flips back, so the slots effect dep
	// stays stable afterwards.
	React.useEffect(() => {
		if (reachedDatetimeStep) return;
		const step = activeSteps[safeCurrentIndex];
		if (step && step.stepType === "datetime") {
			setReachedDatetimeStep(true);
		}
	}, [activeSteps, safeCurrentIndex, reachedDatetimeStep]);

	// Clamp for effective pipeline (grows from base to base+1 when auto step appears).
	useIsomorphicLayoutEffect(() => {
		if (currentIndex >= totalActive && totalActive > 0) {
			setCurrentIndex(Math.max(0, totalActive - 1));
		}
	}, [currentIndex, totalActive]);

	// Effective pinned handling for auto-injected step: when the auto step appears,
	// keep the visitor on the same logical step (Calendar stays Calendar).
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

	// Guardrail warning (canvas-only): datetime step without name+email somewhere.
	const needsNameEmailGuardrail = React.useMemo(() => {
		// FINAL-04 fix: result is only consumed behind `isCanvas &&` —
		// skip the sweep entirely on preview/published site.
		if (!isCanvas) return false;
		if (!baseActiveSteps.some((step) => step.stepType === "datetime")) return false;
		return !findNameField(baseActiveSteps) || !findEmailField(baseActiveSteps);
	}, [baseActiveSteps, isCanvas]);

	// Canvas-only empty-step warnings. Detects:
	//   - A form step with zero fields (T10-M9: skipped on the published site)
	//   - A choice-type field (select/segmented/pills/cards/radio) with zero options
	const emptyStepWarnings = React.useMemo(() => {
		// FINAL-04 fix: warnings only render on the canvas — bail out
		// before allocating/sweeping on preview/published site.
		if (!isCanvas) return [];
		const warnings: string[] = [];
		// T10-M9: normalizedSteps (not activeSteps) — empty form steps are
		// filtered out of the pipeline, so the author warning must read the
		// pre-filter list or it would never fire.
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
		// CAL-REQUIRED-FIELDS: canvas warning when Cal.com requires fields the Engine doesn't cover.
		// Visitors will still succeed via the auto-injected Additional Details step, but the author
		// can fix it properly by adding a matching field (label or Cal Field ID) or making the
		// Cal.com field optional.
		if (missingRequiredCalFields.length > 0) {
			const labels = missingRequiredCalFields.map((f) => `"${f.label} (${f.slug})"`).join(", ");
			warnings.push(
				`Cal.com event requires ${missingRequiredCalFields.length === 1 ? "a field" : "fields"} your Engine has no matching field for: ${labels}. Add ${missingRequiredCalFields.length === 1 ? "a field" : "fields"} with ${missingRequiredCalFields.length === 1 ? "that label" : "those labels"} (or matching Cal Field IDs) or make ${missingRequiredCalFields.length === 1 ? "it" : "them"} optional in Cal.com. Visitors will see ${missingRequiredCalFields.length === 1 ? "it" : "them"} as an auto-generated Additional Details step before the calendar.`,
			);
		}
		// FINAL-05 fix (1 of 3): Cal.com credentials configured but no
		// datetime step exists — the inverse of the needsCalSetup banner.
		{
			const hasDatetime =
				baseActiveSteps.some((step) => step.stepType === "datetime") ?? false;
			if (calApiKey && calEventTypeId && !hasDatetime) {
				warnings.push(
					"Cal.com credentials are set but no step uses the Calender. Add or enable a Calender step, or clear the API key and Event Type ID.",
				);
			}
		}
		// Review step removed: former FINAL-05 (2 of 3) warning dropped.
		// Any persisted "review" step is silently filtered in normalizeSteps,
		// so no canvas warning is needed. Success details are post-booking only.
		// FINAL-05 fix (3 of 3): silently-defaulted step copy —
		// normalizeSteps falls back to a generic "Step N" title when the
		// author leaves it blank. Read from the RAW slot config (defaults
		// are applied during normalization, so the normalized list can't
		// tell "authored" from "defaulted"). Subtitle alone stays silent:
		// an intentionally subtitle-less step is a normal configuration.
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

	// VALIDATION-REMOVED (rule 100): the canvas-only custom-regex live
	// verdict sweep lived here (isReDosRisky + getCompiledCustomRegex +
	// regexPreviewVerdicts + its render block below). No custom patterns
	// can exist anymore — no control, no stored override — so the whole
	// path is deleted, not left to rot.

	// T10-M1 fix: analytics emitter. A throwing author callback must never
	// break the booking flow, so everything is try/caught.
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

	// ===== handlers =====

	// Fix #12: ref-based double-submit guard. The flowStatus check alone has a
	// race window between the first click and React's re-render; this ref closes it.
	const submittingRef = React.useRef(false);
	// F-03-4 fix: same race for the non-POST step advance — `setCurrentIndex`
	// updaters from two rapid Continue clicks can compose past the guard
	// (React 18 does NOT coalesce separate event handlers), skipping a step
	// and double-firing analytics. This ref closes it; released when the
	// new index actually lands (effect on safeCurrentIndex below).
	const navigatingRef = React.useRef(false);
	// T3-H2 fix: one idempotency key per selected slot, generated on first
	// submit and REUSED across retries of the same submission — see
	// handleSubmitBooking / handleSlotReady / makeIdempotencyKey.
	const idempotencyKeyRef = React.useRef<string | null>(null);
	// FINAL-20 fix: the machine-readable error code from the last failed
	// POST, captured at failure time so handleRetry can branch on it
	// instead of substring-matching localized/author-customized copy.
	const submitErrorCodeRef = React.useRef<string | null>(null);

	// T6-M8 fix: focusFirstInvalidField only READS values (to look up the
	// current value while deciding which field to focus). Putting `values`
	// in its deps made it - and every handler that depends on it
	// (handleContinue) - rebuild on every keystroke. A ref holds the latest
	// values without forcing recreation.
	const valuesRef = React.useRef(values);
	React.useEffect(() => {
		valuesRef.current = values;
	}, [values]);

	// F-03-4 fix (continued): release the advance guard whenever the visited
	// step actually lands — navigation (Continue/Back/jump/restart/retry) all
	// move the index, so this covers every path without a setTimeout.
	React.useEffect(() => {
		navigatingRef.current = false;
	}, [safeCurrentIndex]);

	// T6-L7 fix: abort the in-flight booking POST and release the
	// double-submit guard when the component unmounts mid-submit (React 18
	// silently no-ops the state updates, but the fetch itself would keep
	// running - a network leak and a stuck "submitting" ref).
	const abortControllerRef = React.useRef<AbortController | null>(null);
	// W2-25-F11 fix: an explicit Cancel (handleCancelSubmit) aborts the
	// in-flight POST, which resolves as a TIMEOUT-shaped failure inside
	// submitCalcomBooking. These refs let the stale continuation tell a
	// user-initiated cancel apart from a real timeout/error, and keep a
	// newer submission (started after the cancel) from being clobbered by
	// the cancelled attempt's late return.
	const cancelRequestedRef = React.useRef(false);
	const submitSeqRef = React.useRef(0);
	React.useEffect(() => {
		return () => {
			submittingRef.current = false;
			abortControllerRef.current?.abort();
			abortControllerRef.current = null;
		};
	}, []);

	// CC-6 fix: focus management on step transitions. Screen-reader users
	// otherwise get no signal a step changed — focus silently stays on the
	// (now stale) Continue button. Move focus to the new step's heading on
	// every transition, but not on first mount (that would steal focus from
	// the page on initial load, which is its own accessibility anti-pattern).
	const stepTitleRef = React.useRef<HTMLHeadingElement | null>(null);
	// FINAL-42 fix: programmatic focus target for the submitting state —
	// focusing the aria-busy button announces the in-flight status to SRs.
	const submitButtonRef = React.useRef<HTMLButtonElement | null>(null);
	const hasMountedStepRef = React.useRef(false);
	React.useEffect(() => {
		if (!hasMountedStepRef.current) {
			hasMountedStepRef.current = true;
			return;
		}
		stepTitleRef.current?.focus();
	}, [safeCurrentIndex]);

	// SUBMIT-DRIVEN-VALIDATION (hard rule): field validation is triggered by
	// the explicit Continue / final-action click (`handleContinue` →
	// `validateStep`) — NEVER while the visitor is typing. This handler
	// updates `values` only; it never runs the validation rules for their
	// own sake. The single exception is cleanup: when a field ALREADY shows
	// an error (surfaced by a failed Continue attempt), editing that field
	// may update or clear its existing message so the visitor sees the
	// error resolve — but a field with NO visible error never gains one
	// from typing alone, and an in-progress value is never judged
	// mid-edit. Required/format/max-length/phone/email rules
	// all follow this same submit-driven model (AGENTS.md).
	const handleFieldChange = React.useCallback(
		(fieldId: string, value: string | boolean | undefined) => {
			// SYN-05 fix: `activeSteps.find()` only examined the FIRST step
			// holding form/datetime fields, so fields in any later form step
			// never re-validated here — their stale errors survived until the
			// next Continue click. Iterate every active step until the field
			// is found.
			let field: NormalizedField | undefined;
			for (const step of activeSteps) {
				if (step.stepType === "form" || step.stepType === "datetime") {
					field = step.fields.find((candidate) => candidate.id === fieldId);
					if (field) break;
				}
			}
			// W1-20-N2 fix: normalize pasted/typed whitespace BEFORE storage.
			// Validation already trims internally (EMAIL_REGEX.test(str.trim())
			// etc.), so a whitespace-padded email used to pass green here and
			// then get rejected by Cal.com's server-side check at POST time.
			// Storing the trimmed value keeps validation, the POST payload and
			// sessionStorage restore all in agreement. Textareas are exempted —
			// multi-line content can legitimately carry leading indentation.
			// Store the live input as typed. Trimming on every keystroke
			// rewrote controlled values (eating spaces, fighting IME) and
			// made fields look empty after remount if the last keystroke
			// had been collapsed. Validation/submit still trim internally.
			const nextValue = value;
			valuesRef.current = { ...valuesRef.current, [fieldId]: nextValue };
			// INSTANCE-ISOLATION: keep THIS instance's snapshot fresh so a
			// mid-keystroke remount never loses the typed value (the
			// per-identity write effect also runs, but a remount can land
			// between keystroke and its debounce-free tick).
			const liveKey = instanceKeyRef.current;
			const liveSnap = inSessionFormSnapshots.get(liveKey);
			inSessionFormSnapshots.set(liveKey, {
				values: valuesRef.current,
				currentIndex: liveSnap?.currentIndex ?? 0,
				timeFormat: liveSnap?.timeFormat ?? "12h",
			});
			setValues((prev) => ({ ...prev, [fieldId]: nextValue }));
			// SUBMIT-DRIVEN-VALIDATION: typing alone never validates and
			// never INTRODUCES an error. Only a field that already shows
			// an error (from a failed Continue attempt) is re-evaluated
			// here, so the visitor sees that existing message clear (or
			// update) as they fix the value — nothing new appears for
			// in-progress input.
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

	// W1-14-F3 fix: `onTimeFormatChange={\`(fmt) => setTimeFormat(fmt)\`}` was
	// an inline arrow — a fresh reference every render broke `StepBody`'s
	// React.memo on EVERY re-render (hover, keystroke, minute tick), even
	// when nothing it needs changed. The useState setter is stable, so the
	// callback is trivially stable too.
	const handleTimeFormatChange = React.useCallback((format: "12h" | "24h") => {
		setTimeFormat(format);
	}, []);

	// T6-H4 fix: guarded flowStatus setter - see FLOW_STATUS_TRANSITIONS.
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
			// Review step removed: persisted review steps are filtered in normalizeSteps,
			// but guard for any in-memory review that slipped through.
			if ((step.stepType as string) === "review") return;
			for (const field of step.fields) {
				const err = validateField(
					field,
					valuesRef.current[field.id],
					validationCopy,
				);
			if (err) {
				// INSTANCE-ISOLATION (rule 91): query is scoped to THIS
				// instance's own subtree. Field ids are shared across
				// instances (hydration-safe constants), so a document-wide
				// query used to focus the FIRST instance's input while the
				// visitor was interacting with another one.
				const wrapper = engineRootRef?.current?.querySelector<HTMLElement>(
					`[data-field-id="${field.id}"]`,
				);
					// T4-M5 fix: the wrapper div isn't focusable, so calling
					// `focus()` on it silently did nothing (visible for
					// choice/radio groups) and keyboard focus never reached
					// the invalid control. Focus the first real focusable
					// control inside the wrapper instead.
					const focusable = wrapper?.querySelector<HTMLElement>(
						'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
					);
					const target = focusable ?? wrapper;
					if (target) {
						try {
							// FOCUS-SCROLL fix (form layout corruption): the old
							// sequence — native focus() + scrollIntoView({ block:
							// "center" }) — scrolled the form's overflow:hidden
							// container so the invalid field sat at its CENTER.
							// The form's scrollHeight includes the absolutely-
							// positioned inactive steps, so it was programmatically
							// scrollable: the top of the form (labels + first
							// inputs) clipped above the container with no way to
							// scroll back, and minHeight slack showed as a huge
							// empty region below. The focused field ALWAYS sits
							// inside the form box (the form wraps the active
							// step), so: focus without native scrolling, then
							// reveal with block:"nearest" — a no-op for the form,
							// minimal correct reveal for the page if the
							// component extends below the viewport.
							target.focus({ preventScroll: true });
							target.scrollIntoView({ behavior: "smooth", block: "nearest" });
						} catch {
							/* ignore */
						}
						break;
					}
				}
			}
		},
		// INSTANCE-ISOLATION: engineRootRef is a stable ref object — listing
		// it documents the root-scoped query without invalidating the
		// callback identity.
		[validationCopy],
	);

	const handleSubmitBooking = React.useCallback(async () => {
		// Fix #6 + F-01-02: never fire a real POST from inside the Framer
		// canvas OR from static export/thumbnail renders (no Bearer-key
		// traffic in static bundles).
		if (isStaticRender) return;
		// Fix #12: double-submit guard.
		if (submittingRef.current) return;
		submittingRef.current = true;

		const nameField = findNameField(activeSteps);
		const emailField = findEmailField(activeSteps);
		// W1-14-F4 fix: ref read (see valuesRef note below) instead of the
		// closure `values`, so `values` can leave the dep array.
		const slot = valuesRef.current[SELECTED_SLOT_KEY];

		// T3-M7 fix: the old single "required information is missing" line
		// blamed the visitor in BOTH failure modes below — but a missing
		// name/email FIELD is an author-configuration bug nobody can fix
		// from the visitor side, while a missing slot is a plain visitor
		// flow issue. Two distinct paths, two honest messages.
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

		// T3-M5 fix: never POST a non-ISO slot time (the demo grid's
		// "HH:MM" values). Fail visibly instead of sending garbage to
		// Cal.com — submitCalcomBooking re-checks too.
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

		// W1-14-F4 fix: reads go through the ref-backed valuesRef
		// (latest committed values) instead of the closure `values`,
		// dropping `values` from the dep array below — the callback
		// no longer rebuilds on every keystroke.
		const name = String(valuesRef.current[nameField.id] || "");
		const email = String(valuesRef.current[emailField.id] || "");
		// BODY-SCHEMA fix: no `notes` built for the POST (top-level notes
		// are schema-rejected; the ICS description builds its own via
		// buildNotesPayload at its render site).
		const bookingFieldsResponses = buildBookingFieldsResponses(
			activeSteps,
			valuesRef.current,
		);

		transitionFlowStatus("submitting");
		setSubmitError(null);
		// FINAL-42 fix: move focus to the (now busy) submit button so the
		// aria-busy announcement actually fires and keyboard users have a
		// stable Escape route while the POST is in flight.
		scheduleFocusTimer(() => {
			submitButtonRef.current?.focus();
		});
		// T10-M1 fix: the attempt itself (POST about to start) - distinct
		// from success/error, so funnel analytics can count submissions
		// attempted vs completed.
		emitAnalytics("booking_submitted", {
			slotStart: slot.time24h,
			calEventTypeId,
		});

		// T3-H2 fix: generate the idempotency key ONCE per selected slot and
		// keep it across retries — a retried POST after a network blip then
		// can't create a duplicate booking. Cleared on success and whenever
		// a different slot is picked (handleSlotReady).
		if (!idempotencyKeyRef.current) {
			idempotencyKeyRef.current = makeIdempotencyKey();
		}

		// T6-L7 fix: hand the unmount-abort signal to the POST so it dies
		// with this component instead of leaking.
		abortControllerRef.current = new AbortController();
		// W2-25-F11 fix: tag this attempt so a cancelled POST's late return
		// can be told apart from a newer submission's result (see below).
		const submitSeq = ++submitSeqRef.current;

		const result = await submitCalcomBooking({
			apiKey: calApiKey,
			eventTypeId: calEventTypeId,
			slotStart: slot.time24h,
			// Duration travels as lengthInMinutes (derived from the slot
			// end inside submitCalcomBooking) — there is no top-level
			// `end` in the bookings schema — and ONLY when the event
			// offers multiple lengths (fixed-length events 400-reject
			// the key). Unknown/absent metadata means single-length:
			// omit and let the event default apply.
			slotEnd: slot.end,
			allowLengthInMinutes:
				(calEventMeta?.multipleLengths?.length ?? 0) > 1,
			name,
			email,
			timeZone,
			bookingFieldsResponses,
			idempotencyKey: idempotencyKeyRef.current,
			externalSignal: abortControllerRef.current.signal,
			// W1-02-F4–F8 fix (bundle 17): thread the merged copy into the
			// POST; the timeout stays internal (FETCH_TIMEOUT_MS).
			errorCopy,
			timeoutMs: FETCH_TIMEOUT_MS,
			// W1-02-F26 fix: same self-hosted base URL as the slots GET.
			// (No apiVersion: the POST pins CAL_BOOKING_API_VERSION.)
			apiBaseUrl: calApiBaseUrl,
		});
		abortControllerRef.current = null;

		// W2-25-F11 fix: the visitor cancelled mid-flight — the result
		// below is just the abort surfacing as a TIMEOUT-shaped failure,
		// not a real booking error. Consume the flag and revert to the
		// form silently; the seq check prevents a stale cancellation from
		// wiping out a newer submission's flow state.
		if (cancelRequestedRef.current) {
			cancelRequestedRef.current = false;
			submittingRef.current = false;
			if (submitSeqRef.current === submitSeq) {
				transitionFlowStatus("in-progress");
			}
			return;
		}

		if (result.success) {
			// T3-H2: this submission is done — a future booking (or retry
			// for a new slot) starts with a fresh key.
			idempotencyKeyRef.current = null;
			// CC-11 fix: surface the booking reference instead of discarding
			// the response. `manageUrl` uses Cal.com's own public booking
			// page (which is where Cal.com itself exposes reschedule/cancel)
			// rather than guessing at reschedule/cancel field names.
			// W1-06-F-06-3 fix: when the response itself carried canonical
			// reschedule/cancel links (host-correct for self-hosted
			// instances), prefer them over the constructed URL in the
			// success screen.
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
			// POST-SUCCESS-REFETCH fix: the month cache (5-min TTL) kept
			// serving pre-booking availability, so "Book another" showed
			// the just-taken slot until TTL/refetch/409. Refresh behind
			// the success screen so the next flow starts truthful.
			slotsRefetch();
		} else {
			// T3-M2 fix: pass the machine-readable error code through.
			// W1-02-F19 fix: the unknown-error and catch-all fallbacks are
			// copy-driven. W1-02-F4–F8 fix: branch copy comes from the
			// merged ErrorCopy too.
			// W1-06-F-06-4 fix: only map RAW errors — when the POST layer
			// already resolved a visitor-facing string (timeout, network,
			// malformed/empty body), trust it instead of re-mapping and
			// degrading it to the generic fallback.
			const errorMessage = result.alreadyMapped
				? (result.error || copy.errorFallbackMessage)
				: mapCalcomError(
					result.error || copy.unknownErrorLabel,
					result.errorCode,
					errorCopy,
					copy.errorFallbackMessage,
					// FINAL-21 fix: last-resort status classification.
					result.httpStatus,
				);
		setSubmitError(errorMessage);
		// FINAL-20 fix: remember the machine code alongside the message.
		// BARE-409 fix: with no machine code the retry path below could
		// not see a bare 409 (its message heuristic needs the mapped
		// "just taken" copy, which a customized Copy panel may reword).
		// Stash an HTTP_### sentinel so Retry branches on status too.
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
		// W1-02-F26 fix: a live base-URL edit in the panel re-targets the
		// POST on the next submit.
		calApiBaseUrl,
		// W1-14-F2 fix: the body reads copy.unknownErrorLabel and
		// copy.errorFallbackMessage (L7949/7952) - an author editing the
		// Copy panel in Framer kept stale error strings being POSTed
		// server-side.
		copy,
		// W1-14-N1 fix: stable-identity ([] deps) callback read by the body,
		// listed for exhaustive-deps correctness.
		transitionFlowStatus,
		// FINAL-42 fix: focus hand-off on submit-start.
		scheduleFocusTimer,
		// FINAL-57 fix: the body gates on isStaticRender — list it for
		// exhaustive-deps honesty (stable per render-target lifetime).
		isStaticRender,
	]);

	const handleContinue = React.useCallback(() => {
		if (!currentStep) return;
		if (flowStatus === "submitting") return;

		// F-03-2 fix: was `isLast && currentStep.stepType === "review"` — the
		// re-validate-all-prior guarantee only fired when the review step was
		// terminal. An author placing the review step mid-flow lost it
		// entirely. Re-validate on ANY review step entry; if all prior steps
		// Review step removed: former F-03-2 review re-validation dropped.
		// Any persisted "review" step is filtered in normalizeSteps, so no
		// review-specific jump-back is needed.

		const { valid, errors: stepErrors } = validateStep(
			currentStep,
			valuesRef.current,
			validationCopy,
		);
		setErrors((prev) => ({ ...prev, ...stepErrors }));
		setTouched((prev) => touchAllFieldsIn(currentStep, prev));

		// ===== THE FIX =====
		// Nothing below this line runs on an invalid step.
		if (!valid) {
			// Focus the first invalid field for accessibility (Section 11).
			// Defer to next tick so the just-set error state has rendered.
			scheduleFocusTimer(() => focusFirstInvalidField(currentStep));
			return;
		}

		if (isLast) {
			// Terminal action — submit a Cal.com booking if a datetime step is in
			// the pipeline, otherwise just show the success screen.
			const hasDatetime = activeSteps.some(
				(step) => step.stepType === "datetime",
			);
			if (hasDatetime && hasCalConfig) {
				handleSubmitBooking();
			} else if (hasDatetime && !hasCalConfig) {
				// CC-3 fix: on the published site, a datetime step with no
				// Cal.com credentials must NOT silently "succeed" — that
				// leaves a visitor believing they booked an appointment the
				// clinic has no record of. The canvas-only setup banner
				// already warns the author about this; on a real visit we
				// stop hard instead of faking a confirmation. (On canvas
				// itself, RenderTarget guards elsewhere keep this harmless.)
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

		// F-03-4 fix (continued): guard BEFORE the advance — the first
		// click claims the window synchronously, so a second click in the
		// same frame (before the startTransition commits) bails before any
		// duplicate analytics or composed updaters. The submit path above
		// is separately guarded by submittingRef.
		if (navigatingRef.current) return;
		navigatingRef.current = true;
		// T10-M1 fix: announce step completion as the visitor advances.
		emitAnalytics("step_complete", {
			stepIndex: safeCurrentIndex,
			stepNumber: safeCurrentIndex + 1,
			totalSteps: totalActive,
			stepTitle: currentStep.title,
			stepType: currentStep.stepType,
		});
		// Direct set — startTransition deferred the destination step past
		// AnimatePresence's enter, which could leave it at opacity 0.
		setCurrentIndex((i) => Math.min(i + 1, totalActive - 1));
	}, [
		currentStep,
		flowStatus,
		isLast,
		totalActive,
		activeSteps,
		safeCurrentIndex,
		hasCalConfig,
		// W1-04-M4 fix: `validationCopy` was missing — `validateStep` is
		// recreated per render and reads it, so a change to the Validation
		// group alone (e.g. new custom error copy in the Framer editor)
		// kept serving the stale copy from the closure. `currentIndex` was
		// dropped: the body now only reads the clamped `safeCurrentIndex`.
		validationCopy,
		focusFirstInvalidField,
		handleSubmitBooking,
		// W1-14-N1 fix: both of these are stable-identity ([] deps) callbacks
		// the body reads — listed for exhaustive-deps correctness, no
		// runtime behavior change.
		scheduleFocusTimer,
		setSubmitError,
		transitionFlowStatus,
		emitAnalytics,
		errorCopy,
	]);

	const handleBack = React.useCallback(() => {
		if (isFirst) return;
		// W1-03-3 fix: mirror handleContinue's navigatingRef claim —
		// React 18 does NOT coalesce separate event handlers, so two
		// rapid Back clicks used to compose their functional updaters
		// (`(i) => Math.max(0, i - 1)`) and skip 2 steps back. The first
		// click claims the window synchronously; the release effect
		// (W1-14-F9, ~L7063) resets it after the transition.
		if (navigatingRef.current) return;
		navigatingRef.current = true;
		setCurrentIndex((i) => Math.max(0, i - 1));
	}, [isFirst]);

	// T10-H1 fix: review-step Edit links jump straight to the owning step.
	// Guards against a stale stepIndex (e.g. steps changed after submit),
	// and clears the in-flight submit state if one is running.
	// T10-H1 fix: review-step Edit links jump straight to the owning step.
	const handleJumpToStep = React.useCallback(
		(stepIndex: number) => {
			if (stepIndex < 0 || stepIndex >= activeSteps.length) return;
			// W1-04-§1.3 fix: this is the backward-only "Edit" path
			// (ReviewStepBody is the sole caller); refuse any forward jump
			// so a future caller cannot use it to skip past an unvalidated
			// step. Forward navigation stays gated behind validateStep via
			// handleContinue.
			// FINAL-15 fix: `>=` also refuses a SAME-index jump — claiming
			// the navigation lock for a no-op setCurrentIndex would bail
			// out of re-render, never fire the release effect, and leave
			// navigatingRef stuck true forever.
			if (stepIndex >= safeCurrentIndex) return;
			// W1-03-7 fix: claim the navigation lock exactly like
			// handleContinue/handleBack do, so a double-click on the Edit
			// link cannot trigger two transitions in the same commit.
			if (navigatingRef.current) return;
			navigatingRef.current = true;
			if (flowStatus === "submitting") {
				setSubmitError(null);
				idempotencyKeyRef.current = null;
				// W1-06-F-06-10 fix: jumping steps mid-submission used to
				// leave the POST running — its late success/error return
				// dragged the visitor into the result screen from wherever
				// they'd jumped. Abort it and treat it exactly like the
				// Cancel button: the continuation swallows the aborted
				// return via cancelRequestedRef + submitSeqRef.
				cancelRequestedRef.current = true;
				abortControllerRef.current?.abort();
				abortControllerRef.current = null;
				submittingRef.current = false;
			}
			// F-03-5 fix: was a raw `setFlowStatus("in-progress")` that
			// bypassed the flow-status state machine (illegal-transition
			// logging + guards). Route through it like every other handler.
			transitionFlowStatus("in-progress");
			setCurrentIndex(stepIndex);
		},
		[activeSteps.length, flowStatus, transitionFlowStatus, safeCurrentIndex],
	);

	const handleRetry = React.useCallback(() => {
		// T3-H3/H4 fix: when the failure was the slot itself (taken by
		// someone else / availability lapsed), retrying in place re-submits
		// the identical stale slot — a wasted POST at best, an endless
		// retry loop at worst. Take the visitor back to the calendar, drop
		// the stale slot, and force a fresh availability fetch (the cache
		// would otherwise keep serving the old data, see useCalcomSlots' T3-H4
		// refetch) so they pick what's actually free.
		// FINAL-20 fix: branch on Cal.com's machine code first — substring-
		// matching the visitor-facing message broke whenever the body lacked
		// `apiError` ("Booking failed (HTTP 409)" contains neither phrase)
		// or the author customized/localized the copy. The legacy substring
		// check remains only as a last-resort fallback for responses with
		// no code at all.
		const code = (submitErrorCodeRef.current || "").toUpperCase();
		const msg = submitError || "";
		const slotTaken =
			code.includes("SLOT_NOT_AVAILABLE") ||
			code.includes("BOOKING_LIMIT") ||
			code.includes("MAXIMUM_NUMBER_OF_BOOKINGS") ||
			// BARE-409 fix: sentinel stashed at submit-failure time (see
			// above) — a codeless 409 still routes back to the calendar
			// with a fresh fetch instead of re-POSTing the stale slot.
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
				setCurrentIndex(dtIdx);
				slotsRefetch();
			}
		}
		// Critical: do NOT clear `values`. The user re-picks only what they want to change.
		transitionFlowStatus("in-progress");
		setSubmitError(null);
		// T6-L1 fix: a stale confirmation from an earlier booking must not
		// survive a retry - handleRestart cleared it, handleRetry didn't.
		setBookingResult(null);
		submittingRef.current = false;
		// W1-11-A4 fix: "Retry" used to drop focus nowhere — the visitor
		// landed back in the in-progress view with focus on <body> (WCAG
		// 2.4.3). Move it to the step heading once the re-render lands,
		// reusing the existing debounced focus-timer helper (W1-14-F2).
		scheduleFocusTimer(() => {
			stepTitleRef.current?.focus();
		});
	}, [submitError, activeSteps, slotsRefetch, scheduleFocusTimer, transitionFlowStatus]);

	// W2-25-F11 fix: while the POST is in flight (up to FETCH_TIMEOUT_MS)
	// the visitor previously had no escape except page navigation — the
	// Back button and step links are disabled and the submit button is a
	// spinner. Cancel aborts the fetch, clears the pending idempotency key
	// so the next attempt starts clean, and returns to the form. The
	// cancelled POST's continuation sees cancelRequestedRef and swallows
	// its abort-shaped failure (see handleSubmitBooking).
	const handleCancelSubmit = React.useCallback(() => {
		if (flowStatus !== "submitting") return;
		cancelRequestedRef.current = true;
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
		submittingRef.current = false;
		idempotencyKeyRef.current = null;
		setSubmitError(null);
		transitionFlowStatus("in-progress");
		// W2-29-N1 fix: the Cancel button unmounts the moment the submit
		// spinner leaves — focus dropped to <body> (WCAG 2.4.3). Mirror
		// handleRetry's focus hand-off to the step heading.
		scheduleFocusTimer(() => {
			stepTitleRef.current?.focus();
		});
	}, [flowStatus, scheduleFocusTimer, transitionFlowStatus]);

	// FINAL-42 fix: Escape is a keyboard route out of the submitting state
	// (previously only reachable by Tabbing to the Cancel button). The
	// window-level listener exists only while the POST is in flight.
	// INSTANCE-ISOLATION (rule 91): a keydown originating inside a
	// DIFFERENT engine's subtree must not cancel this instance's submit —
	// the closest `[data-be-engine-root]` marker disambiguates (body/
	// document targets keep the documented behavior).
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
		// FINAL-53 fix: gate on isStaticRender for consistency with the
		// restore/write paths — the canvas/export must never touch storage.
		if (isStaticRender) return;
		valuesRef.current = {};
		setValues({});
		setErrors({});
		setTouched({});
		setPickedDate(null);
		setVisibleMonth(null);
		setSubmitError(null);
		setBookingResult(null);
		setCurrentIndex(0);
		transitionFlowStatus("in-progress");
		submittingRef.current = false;
		// RESTART-KEY fix: a failed attempt's idempotency key must not
		// leak into the next visitor's booking ("Book another" after a
		// failure reuses this restart). Harmless today (Cal.com ignores
		// the undocumented header) but wrong if ever enforced — every
		// other terminal path (success/retry/cancel/slot-pick) already
		// resets it.
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
			// T3-H2: slot cleared — the old idempotency key no longer
			// describes this submission; start fresh on the next pick.
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
		// T3-H2: a *different* slot is a different booking — the previous
		// slot's retry key must never be reused for it.
		idempotencyKeyRef.current = null;
		// Live-clear the error once a slot is chosen.
		setTouched((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: true }));
		setErrors((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: null }));
		// FINAL-52 fix: mirror the date-pick auto-focus (W1-09-DT-AutoFocus)
		// for slot picks — selecting a slot now moves focus to the primary
		// action (Continue/Book) instead of stranding keyboard users at the
		// end of the slot list (WCAG 2.4.3). Debounced via the shared focus
		// timer so it lands after the re-render.
		scheduleFocusTimer(() => {
			submitButtonRef.current?.focus();
		});
	}, [scheduleFocusTimer]);

	// T6-H3 fix: inline arrows recreated these callbacks every render,
	// defeating the memoization of the inlined child components.
	// T6-L9 fix: the calendar's transient day goes to `pickedDate`; the
	// booked slot itself stays canonical in `values[SELECTED_SLOT_KEY]`.
	// FINAL-60 fix (invariant, per audit): these callbacks are handed to
	// memoized inlined children (DateAndTimeInline/ChoiceGroupInline).
	// They MUST stay referentially stable (`useCallback` with minimal,
	// primitive-or-stable deps) and must not synchronously trigger state
	// updates that flow back into their own props — otherwise every
	// engine re-render remounts/memo-busts the whole calendar subtree.
	const handleInlineDateChange = React.useCallback(
		(d: Date) => setPickedDate(d),
		[],
	);
	const handleInlineMonthChange = React.useCallback(
		(m: Date) => setVisibleMonth(m),
		[],
	);
	// TZ-TIME-HARD-RULE: there is no time-zone change handler anymore —
	// the zone is auto-detected from the browser and cannot be changed by
	// the visitor or the author. `handleInlineTimeZoneChange` (and the
	// `onTimeZoneChange` StepBody prop it fed) was removed.

	// ===== render =====

	// (isCanvas is computed once near the top of this hook — see the
	// W1-13-F-13-10 hoist, needed by the verdict memos below.)
	// W1-14-F7 fix: was a fresh object literal on every render — `fontStack`
	// flows into RootShell and every memo'd descendant, so any parent
	// re-render (typing, hover, minute tick) churned the whole tree. Now
	// memoized on the only thing that changes it.
	const fontStack: React.CSSProperties = React.useMemo(
		() => ({
			// W1-02-F5 fix: shared constant (documented intentional
			// fallback — the font itself stays a Framer FontFamily
			// control, so a second fallback control would just shadow it).
			fontFamily: font?.fontFamily ?? DEFAULT_FONT_FAMILY,
			// A11Y-SYSTEM: explicit values use ?? (never ||) so a stored
			// 0 can't collapse a token.
			fontSize: font?.fontSize ?? 15,
			lineHeight: font?.lineHeight ?? 1.4,
			letterSpacing: font?.letterSpacing ?? 0,
			fontWeight: font?.fontWeight ?? 400,
			fontStyle: font?.fontStyle ?? "normal",
		}),
		[font],
	);

	// Setup guard: no Cal.com credentials configured. Rendered as an inline
	// banner above the working flow (NOT a replacement) so the editor can still
	// see and interact with the component on the canvas.
	const needsCalSetup = hasDatetimeStep && !hasCalConfig;

	// ---- 1. Empty pipeline guard (canvas-only) ----

	// ---- 4. Active step render ----
	const progressPct =
		totalActive > 0 ? ((safeCurrentIndex + 1) / totalActive) * 100 : 0;
	const completePct = Math.round(progressPct);
	const counterText = formatStepCounter(
		copy.stepCounterTemplate,
		safeCurrentIndex + 1,
		totalActive,
	);
	// W1-10-A2 fix: ONE combined sr-only live region announces the step
	// transition — counter, percentage, and step title together (the
	// visible counters announced numbers only; the title was only ever
	// reachable via the focus-move). W2-28-F10 fix: zero announcement on
	// first render — the region is empty until the active step actually
	// changes.
	// SYN-04 fix: `currentStep` is `undefined` when `totalActive === 0`
	// (all steps disabled / all empty form steps dropped), and the
	// main component's empty-pipeline guard runs AFTER this hook —
	// so `currentStep.title` here threw a TypeError on the canvas before
	// the guard could ever render. Announce nothing in that state.
	// W1-02-F4 fix: the announcement was a hardcoded
	// "{counter}, {percent}% complete — {title}" — an author localizing
	// stepProgressLabel could never fix the sr-only copy. Template with
	// placeholder substitution now.
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

	// Determine the primary button label. On a single-step flow, "Continue"
	// becomes the final action.
	const primaryLabel =
		totalActive === 1 || isLast ? finalActionLabel : continueLabel;
	// BUTTON-GROUPS: the primary button's STYLE follows the same branch
	// (Continue vs Final Action) — the engine resolves the surface.
	const isFinalPrimary = totalActive === 1 || isLast;
	const isSubmitting = flowStatus === "submitting";
	// NAV-GROUP-TOGGLE: Back and the primary action default to a split layout
	// (Back far-left, Continue/Book Now far-right). Grouping them side-by-side
	// is an OPT-IN author choice via the `groupNavButtons` property control —
	// never the default (see AGENTS.md hard rules).
	const navGrouped = groupNavButtons === true;
	// T9-M11 fix: the animate target was an inline object literal - a new
	// reference every render forced framer-motion to re-evaluate the
	// animation target on each keystroke. Memoized on the only thing
	// that changes it.
	// W1-18-F2 fix: animate a GPU-composited transform (scaleX with a left
	// transform origin, applied to a full-width element) instead of `width`
	// — animating width forces layout on every spring frame.
	const progressAnimate = React.useMemo(
		() => ({ scaleX: progressPct / 100 }),
		[progressPct],
	);

	return {
		abortControllerRef,
		accentColor,
		activeSteps,
		availableDates,
		backLabel,
		bookingResult,
		borderColor,
		borderRadius,
		sanitizedRadius,
		buttonLabels,
		calApiKey,
		calEventTypeId,
		fieldGap,
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
		errorCopy,
		// W1-02-F26 + W2-23-N1 fixes: the resolved self-hosted base URL
		// and the author-tunable fallback meeting duration.
		calApiBaseUrl,
		meetingDurationMs,
		// CAL-EVENT-META: normalized event/profile metadata (or null).
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
	// INSTANCE-ISOLATION (rule 91): the engine root ref is created BEFORE
	// the state hook so the hook can (a) derive a mount-stable per-instance
	// persistence identity from this root's DOM position and (b) scope
	// queries/handlers (focus restoration, Escape) to this instance's own
	// subtree. Declared before the destructure — hooks order is stable.
	const engineRootRef = React.useRef<HTMLDivElement | null>(null);
	const {
		activeSteps,
		availableDates,
		backLabel,
		bookingResult,
		borderRadius,
		sanitizedRadius,
		fieldGap,
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
		errorCopy,
		// W2-23-N1 fix: resolved author-tunable fallback duration, threaded
		// to the SuccessScreen.
		meetingDurationMs,
		calEventMeta,
		calEventMetaStatus,
	} = useBookingEngineState(props, engineRootRef);

	// LOCALE-REMOVED: no locale override: pageLocale() follows <html lang>.

	// SYN-03 fix: the in-flight POST cancel button previously hardcoded
	// "Cancel" — the only footer button not driven by buttonLabels. The
	// Cancel group (Text + styles) drives it now, with the legacy flat
	// key and shared default behind it for older canvases.
	const cancelSubmitLabel = resolveButtonText(
		buttonLabels?.cancelButton?.text,
		buttonLabels?.cancelSubmitLabel,
		DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL,
	);

	// PRIMARY-FOREGROUND: accent-filled surfaces (submit button, spinner,
	// "Book another", Retry) render their text from the semantic On-Primary
	// token — never a hard-coded white assumption. Button groups may
	// override per button; the resolver falls back to this token.
	// BUTTON-GROUPS (styles): resolved here in engine scope — theme,
	// borderRadius, totalActive/isLast (via isFinalPrimary) are all
	// declared before this point (resolving inside the state hook tripped
	// TS2448/TS2454). Untouched groups fall back to the role defaults
	// (live theme tokens) — byte-identical to the previous hardcoded look.
	const blGroups = buttonLabels ?? {};
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
	const backButtonStyle = resolveButtonStyle(blGroups.backButton, ghostButtonRole, borderRadius);
	const cancelButtonStyle = resolveButtonStyle(blGroups.cancelButton, ghostButtonRole, borderRadius);
	// The primary button wears Continue's styles except on the last step,
	// where Final Action's text AND style take over (mirrors primaryLabel).
	const primaryGroup = isFinalPrimary
		? blGroups.finalActionButton
		: blGroups.continueButton;
	const primaryButtonStyle = resolveButtonStyle(
		primaryGroup,
		primaryButtonRole,
		borderRadius,
	);
	// BUTTON-GROUPS (success): the ICS link is an accent-outline role;
	// Done is ghost; "Book another" is primary with tighter padding.
	const addToCalendarButtonStyle = resolveButtonStyle(
		blGroups.addToCalendarButton,
		{
			background: "transparent",
			color: theme.accentColor,
			borderWidth: 1,
			borderColor: theme.accentColor,
			padding: "10px 18px 10px 18px",
		},
		borderRadius,
	);
	const doneButtonStyle = resolveButtonStyle(
		blGroups.doneButton,
		// Done is a SECONDARY ghost (muted text, unlike Back/Cancel) —
		// its role default must match, or untouched instances restyle.
		{ ...ghostButtonRole, color: theme.textSecondaryColor },
		borderRadius,
	);
	const bookAnotherButtonStyle = resolveButtonStyle(
		blGroups.bookAnotherButton,
		{ ...primaryButtonRole, padding: "10px 18px 10px 18px" },
		borderRadius,
	);
	// BUTTON-INTERACTION: one hover/pressed state per footer button.
	// Unconditional hooks (the buttons themselves render conditionally).
	const backIx = useButtonInteraction();
	const cancelIx = useButtonInteraction();
	const primaryIx = useButtonInteraction();
	const animateIx = !prefersReducedMotion;

	// W1-19-N3 fix: the form-grid two-column decision was a VIEWPORT media
	// rule — embeds in narrow desktop sidebars stayed 2-col (cramped,
	// inputs clipped). Every other responsive decision in this file uses
	// container width via ResizeObserver (L757, L3511), so the grid now
	// does too: measure RootShell, collapse below COMPACT_BREAKPOINT (the
	// file-wide container threshold), and the @media rule is gone.
	// (engineRootRef is created above the state hook — INSTANCE-ISOLATION.)
	const [engineWidth, setEngineWidth] = React.useState<number>(320);
	// PRERENDER-DEFER: the prerender browser's viewport must never reach
	// the served HTML — the two-column grid decision (engineWidth >=
	// COMPACT_BREAKPOINT) baked into the prerender could not be reproduced
	// by a narrow visitor's first render (#418 on the step wrappers).
	const beInteractiveForWidth = useBeInteractive();
	React.useEffect(() => {
		if (!beInteractiveForWidth) return;
		const node = engineRootRef.current;
		if (!node || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				// FINAL-56 fix: match the file's other width observers —
				// non-urgent updates go through startTransition so rapid
				// resizes don't force synchronous re-renders (layout thrash).
				React.startTransition(() => {
					setEngineWidth(entry.contentRect.width);
				});
			}
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, [beInteractiveForWidth]);

	// F-01-05 fix (bundle 16): BookingEngine's own render-scope copy — the
	// progress-bar fill and the 12h/24h slider (in TimeSlotList) are drawn
	// at their final position under canvas/export/thumbnail instead of
	// animating (the state hook keeps its separate copy for persistence
	// gating).
	const isStaticRender = useIsStaticRenderer();

	// W1-02-F9 fix: `copy.aria` didn't exist on canvases saved before the
	// group was added to the panel — merge over the single-source defaults
	// so old instances keep working without a `copy.aria.x` crash.
	const ariaLabels = React.useMemo(
		() => ({ ...DEFAULT_ARIA_LABELS, ...(copy.aria || {}) }),
		[copy.aria],
	);

	// Diagnostic instrumentation. FINAL-70 fix: promoted from "temporary" to
	// a proper, permanently-gated debug feature (window.__BE_STEP_DEBUG__ =
	// true) with full rAF cleanup — it is dev-only tooling for verifying the
	// deterministic step-visibility invariant, never visitor-facing.
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
		// Verify computed styles after paint (double rAF)
		// FINAL-55 fix: track BOTH frames and cancel them on cleanup — the
		// fire-and-forget inner rAF previously ran against a detached/stale
		// tree after unmount or a rapid step change.
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
		// On the published site, rendering nothing is cleaner than an error
		// message. On canvas, show the notice so the editor knows what's wrong.
		if (!isCanvas) return null;
		return (
			<RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
				{/* biome-ignore lint/a11y/useSemanticElements: intentional
                    polite status region (W1-13-N1) — the canvas-only
                    empty-pipeline notice announces on mount; an <output>
                    would change the element's semantics. */}
				<div
					// W1-13-N1 fix: bring this canvas-only notice up to the
					// F-13-8/F-13-9 standard the other banners use — polite
					// status region (announces on mount) plus a 1px outline
					// so it never disappears on low-contrast canvas themes.
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

	// ---- 3. Terminal states (outside the step count) ----
	if (flowStatus === "success") {
		return (
			<RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
				<SuccessScreen
					steps={activeSteps}
					values={values}
					bookingResult={bookingResult}
					accentColor={theme.accentColor}
					// PRIMARY-FOREGROUND: semantic On-Primary for the accent-
					// filled "Book another" button.
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
					// CONFIRM-ACTIONS: confirmation button labels come from
					// the Buttons group now.
					addToCalendarLabel={addToCalendarButtonLabel}
					bookAnotherLabel={bookAnotherLabel}
					doneLabel={doneLabel}
					addToCalendarStyle={addToCalendarButtonStyle}
					bookAnotherStyle={bookAnotherButtonStyle}
					doneStyle={doneButtonStyle}
					addToCalendarHover={blGroups.addToCalendarButton?.hover}
					addToCalendarPressed={blGroups.addToCalendarButton?.pressed}
					doneHover={blGroups.doneButton?.hover}
					donePressed={blGroups.doneButton?.pressed}
					bookAnotherHover={blGroups.bookAnotherButton?.hover}
					bookAnotherPressed={blGroups.bookAnotherButton?.pressed}
					animateInteractions={animateIx}
					timeZone={timeZone}
					timeZoneLabel={copy.timeZoneLabel}
					icsSummaryLabel={copy.icsSummaryLabel}
					dateLabel={copy.dateLabel}
					timeLabel={copy.timeLabel}
					googleCalendarLabel={copy.googleCalendarLabel}
					outlookCalendarLabel={copy.outlookCalendarLabel}
					// W1-02-F9–F16 fix: confirmation reference + manage link
					// labels and the .ics/notes copy are author-localisable.
					confirmationNumberLabel={copy.confirmationNumberLabel}
					rescheduleOrCancelLabel={copy.rescheduleOrCancelLabel}
					notesSelectedTimeLabel={copy.notesSelectedTimeLabel}
					notesDatePrefix={copy.notesDatePrefix}
					notesTimePrefix={copy.notesTimePrefix}
					icsProdid={copy.icsProdid}
					icsSummaryFallback={copy.icsSummaryFallback}
					icsLocationLabel={copy.icsLocationLabel}
					// W2-23-N1 fix: author-tunable fallback meeting duration
					// (ICS + deep links).
					meetingDurationMs={meetingDurationMs}
					// CONFIRM-ICON-ANIM: the confirmation circle reuses the
					// selected Transition Type family and its timing — no
					// second transition control.
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
					surfaceColor={theme.surfaceColor}
					borderColor={theme.borderColor}
					borderRadius={borderRadius}
					accentColor={theme.accentColor}
					// PRIMARY-FOREGROUND: semantic On-Primary for the accent-
					// filled retry button.
					accentForegroundColor={theme.accentForegroundColor}
					onRetry={handleRetry}
					errorTitle={copy.errorTitle}
					errorSubtitle={copy.errorSubtitle}
					headingFont={headingFont}
					retryLabel={copy.retryLabel}
					supportContactLabel={copy.supportContactLabel}
					supportContactValue={copy.supportContactValue}
				/>
			</RootShell>
		);
	}
	return (
		<RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
			{/* FINAL-37 fix: WCAG 2.4.1 bypass-blocks skip link — keyboard
                users can jump past the whole flow to the footer actions.
                Visually hidden until focused (constant CSS lives once in
                RootShell's style block); per-instance id keeps
                multi-instance pages valid. */}
			<a
				href={`#be-skip-end-${reactInstanceId}`}
				className="be-skip-link"
			>
				Skip to end of booking
			</a>
			{/* W1-10-A2/W2-28-F10 fix: combined step-transition live
                region — counter + percentage + step title in one polite
                announcement, empty until the step actually changes (no
                first-render spout). */}
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
			{/* Cal.com setup notice — canvas-only. Never shown in preview or
                on the published site. The flow below remains fully interactive
                in all render targets; the date/time step falls back to a
                generated demo grid when credentials are missing. */}
			{isCanvas && needsCalSetup ? (
				/* biome-ignore lint/a11y/useSemanticElements: intentional
		    polite banner live region (W1-13-F-13-9). */
				<div
					// W1-13-F-13-9 fix: canvas banners were silent divs —
					// screen-reader-using authors were never told a banner
					// appeared. role="status" (polite), not alert: these are
					// author nudges, not visitor errors.
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
					// W1-13-F-13-9 fix: silent div → polite status region.
					role="status"
					aria-live="polite"
					aria-atomic="true"
					style={{
						padding: "10px 14px",
						marginBottom: 12,
						borderRadius: borderRadius,
						background: withAlpha(theme.errorColor, 0.1),
						// W1-13-F-13-8 fix: no border — on low-contrast
						// themes the error-tinted background alone could
						// vanish; match the other banners' 1px outline.
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
						// W1-13-F-13-9 fix: silent div → polite status
						// region (each warning announces on mount).
						role="status"
						aria-live="polite"
						aria-atomic="true"
						style={{
							padding: "10px 14px",
							marginBottom: 8,
							borderRadius: borderRadius,
							background: withAlpha(theme.errorColor, 0.1),
							// W1-13-F-13-8 fix: missing border, same
							// invisibility risk as the guardrail banner.
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

			{/* VALIDATION-REMOVED (rule 100): canvas regex verdicts lived
                here — deleted with the custom-regex machinery. */}

			{totalActive > 1 && (progressVisible || progressShowTextContent) ? (
				<div style={{ marginBottom: 16 }}>
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
							// T5-H8 completion: step progress is a status
							// change screen readers never heard. W1-10-A2
							// fix: the ANNOUNCEMENT now comes from the
							// single combined sr-only region above; this
							// visible row keeps only the visual text.
							// W1-10-OBS-3 fix: the W1-10-A6 era marked this
							// row aria-current="step", but that token is for
							// step INDICATOR/step links in a multi-step flow,
							// not plain text rows — semantically stretched,
							// so it's reserved for actual step navigation.
							// FINAL-39 fix: aria-hidden — this row duplicates
							// the sr-only announcement verbatim and would be
							// read twice.
							aria-hidden="true"
						>
							<span>{counterText}</span>
							<span>
								{copy.stepProgressLabel.replace("{pct}", String(completePct))}
							</span>
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
							// FINAL-38 fix: friendlier announcement than the raw
							// "50 of 100" valuenow/max pair.
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
										// W1-18-F1 fix: gated on
										// prefers-reduced-motion.
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
							// FINAL-38 fix: friendlier announcement than the raw
							// "50 of 100" valuenow/max pair.
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
							// Same T5-H8 fix as the top counter: step progress reaches
							// screen readers via the combined sr-only
							// region. W1-10-OBS-3 fix: this row no longer
							// carries aria-current="step" (that token is
							// reserved for real step indicators/links).
							// FINAL-39 fix: aria-hidden — duplicates the sr-only
							// announcement verbatim and would be read twice.
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

			{/* Deterministic step visibility — single source of truth is
                 `safeCurrentIndex`. Every step is rendered, but only the
                 active step is `relative/1/auto`; all others are
                 `absolute/0/none`. No AnimatePresence, no usePresence, no
                 enter-flag — opacity/position are pure functions of
                 `isActive`. Motion only interpolates between the two
                 deterministic end states; `initial={false}` guarantees the
                 first paint (including a restored saved step) is already at
                 the correct final opacity without flashing. */}
			<form
				// T5-L6 fix: give the form an accessible name so screen
				// readers can distinguish it from other forms on a page.
				aria-label={ariaLabels.bookingForm}
				// ADVANCE-FIX: the sticky footer nav (and its Continue
				// submit button) lives OUTSIDE this <form> element, so a
				// descendant type="submit" button could never submit it.
				// INSTANCE-ISOLATION: form id is per-instance via reactInstanceId
				// (hydration-safe: "" on first render of both server and client,
				// then "be-engine-1", "be-engine-2" etc. after effect). Two
				// engines on one page must not share the same form id, otherwise
				// the `form` attribute on the Continue button would submit the
				// first engine's form regardless of which instance was clicked.
				id={reactInstanceId ? `be-booking-form-${reactInstanceId}` : "be-booking-form"}
				// W1-04-F-8 fix: without noValidate the browser's native
				// validation fired before onSubmit for required/email
				// fields — browser tooltip UX vs the engine's inline
				// errors, two inconsistent styles. The engine validates
				// itself (handleContinue → validateStep), so native
				// validation is pure noise.
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					handleContinue();
				}}
				style={{
					position: "relative",
					// Task 1: stable minimum visual size for short steps
					// (e.g., Calendar fallback "unavailable" message). Generic
					// for every step — not fixed height, grows naturally when
					// content exceeds the minimum.
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
							<h2
								ref={isActive ? stepTitleRef : null}
								tabIndex={-1}
								className="be-focus-target"
								style={{
									color: theme.textPrimaryColor,
									// Per-surface Heading Font (Body control
									// stays the base). Unset = previous look.
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
									marginBottom: 4,
									marginTop: 0,
									// FINAL-43 fix: inline `outline:"none"` removed —
									// it killed every indicator when JS moved focus
									// here; .be-focus-target:focus-visible supplies
									// a keyboard-visible ring (pointer flows clean).
									// W1-19-F-09 fix: when the browser scrolls this
									// focus target into view (native focus scroll /
									// page restore), keep it clear of any sticky
									// headers or the sticky footer nav.
									scrollMarginTop: 72,
								}}
							>
								{step.title}
							</h2>
							{step.subtitle ? (
								<div
									style={{
										color: theme.textSecondaryColor,
										fontSize: 14,
										marginBottom: 16,
										lineHeight: 1.5,
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
								fieldGap={fieldGap}
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
								ariaLabels={ariaLabels}
								errorCopy={errorCopy}
								// INSTANCE-ISOLATION (rule 91): per-engine id prefix
								// for the slot-error banner + every field id.
								instanceId={reactInstanceId}
								onFieldChange={handleFieldChange}
								onSlotReady={handleSlotReady}
								onDateChange={handleInlineDateChange}
								onMonthChange={handleInlineMonthChange}
								// TZ-TIME-HARD-RULE: no `onTimeZoneChange` — the zone
								// is auto-detected and cannot be changed by visitors.
								// W1-14-F3 fix: was an inline arrow — now the
								// stable handleTimeFormatChange so StepBody's
								// React.memo holds between unrelated re-renders.
								onTimeFormatChange={handleTimeFormatChange}
								onJumpToStep={handleJumpToStep}
								onRetrySlots={slotsRefetch}
								hideDemoWhenUnconfigured={!isCanvas && needsCalSetup}
								engineWidth={engineWidth}
								// W1-20-N1 fix: freeze all authored fields during
								// the POST (see StepBodyProps.isSubmitting).
								isSubmitting={isSubmitting}
								// CAL-EVENT-META: datetime-step info panel data;
								// status drives the loading/fallback states.
								eventMeta={calEventMeta}
								eventMetaStatus={calEventMetaStatus}
								eventMetaFallbackDurationMinutes={Math.round(
									meetingDurationMs / 60000,
								)}
							/>
						</StepVisibilityWrapper>
					);
				})}
			</form>

			{/* Footer nav */}
			{/* T10-H2 fix: sticky so Back/Continue stay reachable on long
		steps instead of scrolling out of view. */}
			{/* FOOTER-TRANSPARENT (hard rule): the nav/action wrapper must
		NOT consume the exposed Background color — that token belongs to
		the main surface only (RootShell's root container). The wrapper
		is transparent so the author's page design shows through behind
		the sticky actions, exactly like every other non-surface chrome
		in this component. No replacement footer background property
		exists by design. */}
			{/* NAV-GROUP-TOGGLE: default = split layout. Back sits far left and
                the primary action far right (`justifyContent: space-between`
                with a right-aligned action group). Only when the author opts
                into `groupNavButtons` do they become adjacent (flex-end). */}
			<div
				style={{
					display: "flex",
					gap: 8,
					marginTop: 24,
					alignItems: "center",
					justifyContent: navGrouped || isFirst ? "flex-end" : "space-between",
					position: "sticky",
					bottom: 0,
					zIndex: 10,
					// FOOTER-TRANSPARENT: no `background` here — see the
					// hard-rule note above. Content scrolling beneath the
					// sticky actions is the intended look; the buttons
					// themselves remain opaque for readability.
					paddingTop: 12,
					// FINAL-30 fix: keep the buttons clear of the iOS home-
					// indicator gesture area (iPhone X+) — env() is 0 on
					// devices without an inset, so this is a no-op elsewhere.
					paddingBottom: "env(safe-area-inset-bottom, 0px)",
				}}
			>
				{!isFirst ? (
					<button
						type="button"
						onClick={handleBack}
						disabled={isSubmitting}
						{...backIx.bind}
						style={{
							minHeight: TOUCH_TARGET_MIN,
							// BUTTON-GROUPS: Back group's resolved surface
							// + Hover/Pressed deltas.
							...applyButtonInteraction(
								backButtonStyle,
								blGroups.backButton?.hover,
								blGroups.backButton?.pressed,
								backIx,
								animateIx,
							),
							cursor: isSubmitting ? "not-allowed" : "pointer",
							opacity: isSubmitting ? 0.5 : 1,
						}}
					>
						{backLabel}
					</button>
				) : null}
				{/* NAV-GROUP-TOGGLE: the primary action (plus the in-flight
                    Cancel) live in a right-aligned group. In the default
                    split layout the outer `space-between` pushes this group
                    to the far right while Back stays far left; when the
                    author opts into `groupNavButtons`, the whole row becomes
                    `flex-end` so Back and this group sit side-by-side. */}
				<div
					style={{
						display: "flex",
						gap: 8,
						alignItems: "center",
						justifyContent: "flex-end",
					}}
				>
					{/* W2-25-F11 fix: Cancel during an in-flight submission —
                    aborts the POST (abortControllerRef) and returns to the
                    review form instead of forcing the visitor to wait out
                    the full FETCH_TIMEOUT_MS spinner or navigate away. */}
					{isSubmitting ? (
						<button
							type="button"
							onClick={handleCancelSubmit}
							{...cancelIx.bind}
							style={{
								minHeight: TOUCH_TARGET_MIN,
								// BUTTON-GROUPS: Cancel group's surface + states.
								...applyButtonInteraction(
									cancelButtonStyle,
									blGroups.cancelButton?.hover,
									blGroups.cancelButton?.pressed,
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
						// T5-L7 fix: this was type="button", so pressing Enter
						// inside a text field never submitted the form - the
						// onSubmit handler was dead code for every multi-field
						// step. It's the form's submit button now.
						// W1-04-F-7 cleanup: onClick={handleContinue} was
						// redundant (the form's onSubmit already fires for a
						// submit click AND Enter) — one code path now.
						//
						// ADVANCE-FIX: this button lives in the sticky footer
						// nav, OUTSIDE the <form> element. A type="submit"
						// button with no form owner does nothing when clicked,
						// so handleContinue() (fired only via the form's
						// onSubmit) never ran and the step never advanced. The
						// INSTANCE-ISOLATION: must match the form's per-instance id above.
						form={reactInstanceId ? `be-booking-form-${reactInstanceId}` : "be-booking-form"}
						type="submit"
						disabled={isSubmitting}
						ref={submitButtonRef}
						{...primaryIx.bind}
						// W1-10-A10 / W2-28-F6 fix: reading "Continue" + a
						// visual spinner told screen reader users nothing in
						// progress — the button now exposes aria-busy while
						// the POST is in flight so the update is announced.
						aria-busy={isSubmitting ? true : undefined}
						style={{
							minHeight: TOUCH_TARGET_MIN,
							// BUTTON-GROUPS: Continue/Final-Action groups'
							// resolved surface (branch mirrors primaryLabel)
							// + Hover/Pressed deltas.
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
						}}
					>
						{isSubmitting ? (
							<>
								<span
									// W1-10-N9 fix: the spinner span is
									// decorative; the button's aria-busy already
									// announces progress. aria-hidden stops SRs
									// from reading the bare rotating disc as
									// something namable.
									aria-hidden="true"
									style={{
										width: 14,
										height: 14,
										borderRadius: "50%",
										// BUTTON-GROUPS: spinner ring follows
										// the primary button's text color.
										border: `2px solid ${primaryButtonStyle.color}`,
										borderTopColor: "transparent",
										display: "inline-block",
										animation: prefersReducedMotion
											? "none"
											: "be-spin 0.8s linear infinite",
									}}
								/>
								{copy.submittingLabel}
							</>
						) : (
							primaryLabel
						)}
					</button>
				</div>
			</div>

			{/* FINAL-37 fix: skip-link landing target (programmatic focus). */}
			<div
				id={`be-skip-end-${reactInstanceId}`}
				tabIndex={-1}
				style={{ position: "relative" }}
			/>

			{/* Fix #7: focus-visible ring for form inputs + namespaced spinner keyframes.
                CC-5 fix: this used to target `.be-input-${reactInstanceId}`,
                but every input actually renders with the plain `be-input`
                class — so the rule never matched and no field ever showed a
                keyboard focus ring. Selector now matches the real class.

                =================================================================
                HYDRATION-AUDIT — canonical explanation. READ BEFORE EDITING
                =================================================================
                WHY `suppressHydrationWarning` MUST STAY ON THIS AND THE OTHER
                TWO <style> TAGS (~4516 scrollbar, ~10500 reduced-motion):

                PROBLEM (fixed 2026-08; React warnings #425/#418/#422 showed on
                every load of the published site, on every build, for weeks):
                - Framer's page prerender runs inside a headless Chrome. When
                  React commits a <style> by setting textContent, the browser
                  PARSES the CSS and RE-SERIALIZES it. The served HTML
                  therefore carries the browser-NORMALIZED text, while the
                  hydrating client's first render computes the RAW
                  template-literal string from this file.
                - The two texts differ byte-for-byte even though the CSS is
                  equivalent. Observed diffs: keyframes `100% { ... }` (server)
                  vs `to { ... }` (client); `outline: rgb(0,102,187) solid 2px`
                  (reordered/spaced) vs `2px solid ...`; `currentcolor` vs
                  `currentColor`; `-webkit-user-select` silently dropped by the
                  serializer; multi-line rules collapsed onto one line with
                  `\n\n` separators. Any single byte difference ⇒ React throws
                  "Text content did not match" (#425 at the <style> in this
                  subtree, #418 at the reduced-motion style, #422 recovery),
                  discards the server HTML and re-renders client-side on every
                  visit (visible double-load flicker).
                - A long audit chased ids and keyframes (useId, instance
                  prefixes, reactInstanceId, keyframe names) — all were fixed,
                  but none was the remaining cause. The mismatch lived in the
                  CSS TEXT bytes. The ONLY correct fix is `suppressHydrationWarning`
                  — React's documented mechanism for this exact case: it stops
                  the text comparison (the server's serialized CSS is valid and
                  is kept after hydration), so no warning, no re-render, no
                  flicker. Do NOT try to "align" the two texts instead; the
                  server text is not reachable from this file.

                RULES FOR FUTURE AGENTS (violating any re-introduces #425):
                1. Never remove `suppressHydrationWarning` from any of the
                   three <style> tags in this file.
                2. Never move this CSS into a <style> without the flag, a CSS
                   file, an inline style object, or a Framer style panel — the
                   component must stay self-contained and the flag must stay
                   with it.
                3. Never reformat the CSS text (indentation, line breaks,
                   value order). It is harmless ONLY because the flag silences
                   the comparison — reformatting churns the diff for nothing
                   and invites someone to "fix" the text to match the server.
                4. Ids must stay deterministic: derived from `field.id` only,
                   no instance prefix, no useId(), no random suffixes (see the
                   note where the unused `fieldId` helper was removed in
                   StepBody). Non-deterministic ids re-trigger #425 on the
                   elements themselves, independently of these <style> tags.
                ================================================================= */}
			<style suppressHydrationWarning>{`
.be-input { outline: none; }
/* FOCUS-STATE-COMPOSE fix: the focus ring is an INSET box-shadow, not an
   outside outline. The form container is overflow:hidden (step-transition
   clipping), and inputs sit flush with its edges — an outside ring was
   clipped on the left/right and collided with the 1px error border into a
   broken double-ring. An inset ring can never be clipped, never overlaps
   neighbors, and matches the calendar's existing 2px inset-ring language.
   Invalid fields keep a RED ring while focused (error stays clearly red,
   focus stays clearly intentional) via the be-input-invalid class. */
.be-input:focus-visible {
    box-shadow: inset 0 0 0 2px var(--be-focus-color, ${theme.accentColor});
}
.be-input.be-input-invalid:focus-visible {
    box-shadow: inset 0 0 0 2px ${theme.errorColor};
}
/* Pointer-modality (C-FOCUS-3): text inputs, <textarea> and <select>
   match :focus-visible on BOTH a mouse click and keyboard focus, so the
   heavy inset ring above painted on every click into a field. RootShell
   toggles .be-pointer-active on the root when the last input was a
   pointer; in that mode the ring is suppressed — the caret (text fields)
   or open state (<select>) already marks the active field, and an error
   stays visible via the red border. Keyboard/AT focus flips back to
   keyboard mode (Tab/Arrow) and keeps the full ring (WCAG 2.4.7). */
.be-motion-root.be-pointer-active .be-input:focus-visible {
    box-shadow: none;
}
.be-motion-root.be-pointer-active .be-input.be-input-invalid:focus-visible {
    box-shadow: none;
}
/* FIELD-STYLES: per-field Placeholder + Focus Border overrides ride CSS
   variables set inline on the input itself (--be-ph-color / --be-focus-color).
   The [style*=] guard keeps these rules INERT for fields without the override,
   so the browser-default placeholder appearance and the theme-accent focus
   ring are preserved byte-for-byte when no Styles value is set. The focus
   rule above falls back to ${theme.accentColor} when --be-focus-color is
   absent — identical to the pre-override behavior. */
.be-input[style*="--be-ph-color"]::placeholder {
    color: var(--be-ph-color);
}
.be-input[style*="--be-ph-color"]::-webkit-input-placeholder {
    color: var(--be-ph-color);
}
/* W1-11-A5/A6 fix: the Back/Continue buttons, month-nav arrows,
   slot-list retry, review Edit links and success/error-screen buttons
   had no keyboard-focus styling at all — an invisible focus ring on
   14 interactive elements. One scoped rule covers them all; currentColor
   adapts to each element's own text color.
   FOCUS-STATE-COMPOSE fix: select removed from this rule — selects
   carry .be-input and get the inset ring above; the old outside outline
   double-applied (two rings) and clipped at the container edge. */
.be-motion-root :is(button, a):focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
/* T10-L2 fix: hide the scrollbar on the horizontally scrollable segmented
   control (WebKit/Blink; Firefox/Edge are handled inline via
   scrollbarWidth/msOverflowStyle on the element itself). */
.be-scrollbar-none::-webkit-scrollbar { display: none; }
/* W2-38 re-apply (lost during the StepBody/disclosure rewrite):
   touch-action: manipulation kills the legacy ~300ms tap delay on iOS
   Safari for every interactive element; user-select:none stops the iOS
   long-press text-selection callout on role="radio"/checkbox buttons and
   anchors. Scoped to .be-motion-root so the rule never leaks to the host
   page. Covers every interactive element group in the flow.
   FINAL-28/29 fix: user-select alone does NOT suppress the iOS tap flash
   or the long-press callout — add -webkit-tap-highlight-color (gray box on
   tap) and -webkit-touch-callout (long-press menu) so taps feel native. */
.be-motion-root :is(button, a, [role="button"], [role="radio"], [role="checkbox"], select) {
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
}
/* Placeholder colour: a fixed 60% pre-blend of the primary text over the
   surface, applied as a solid colour with opacity:1 (a constant choice —
   never derived from the configured colours). */
.be-motion-root input::placeholder,
.be-motion-root textarea::placeholder {
    color: ${withAlpha(theme.textPrimaryColor, 0.6, theme.surfaceColor)};
    opacity: 1;
}
/* CSS-CONSOLIDATED: static Calendar CSS defined ONCE here instead of being
   re-injected per Calendar/time-panel instance. Both rules are constant —
   no dynamic tokens inside.
   1. Adjacent-month custom tooltip: revealed on hover/focus of the date
      button; the tooltip element itself is aria-hidden + pointer-events:none
      and only renders for AVAILABLE adjacent-month dates.
   2. Time list (.be-dt-scroll): scrollable with an invisible browser
      scrollbar (::-webkit-scrollbar cannot be targeted by inline styles). */
.be-motion-root button:hover .be-adj-tooltip,
.be-motion-root button:focus .be-adj-tooltip,
.be-motion-root button:focus-visible .be-adj-tooltip { opacity: 1 !important; }
.be-dt-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.be-dt-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }
@keyframes be-spin { to { transform: rotate(360deg); } }
`}</style>
		</RootShell>
	);
}

// =============================================================================
// useStateGuarded — keeps `currentIndex` within [0, max)
// =============================================================================

function useStateGuarded(
	initial: number,
	max: number,
): [number, (next: number | ((prev: number) => number)) => void] {
	const [state, setState] = React.useState<number>(() =>
		max > 0 ? Math.min(initial, max - 1) : 0,
	);
	// F-03-3 fix: the setter used to close over `max` and W2-33-A3: that
	// rebuilt the setter identity on every `max` change AND the hook never
	// retroactively clamped already-committed state when `max` shrank (the
	// consumers' own `safeCurrentIndex` defense-in-depth papered over it).
	// The max now lives in a latest-ref (maintained in an effect, same
	// convention as `valuesRef`), so the setter is permanently stable, and
	// the effect below re-clamps committed state when the ceiling drops.
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

// =============================================================================
// RootShell — the relative-positioned root container required by Framer
// =============================================================================

const RootShell = React.memo(function RootShell(props: {
	style?: React.CSSProperties;
	fontStack: React.CSSProperties;
	children?: React.ReactNode;
	// W1-19-N3 fix: the engine's width observer targets the shell's div
	// (React.memo'd component — a plain prop, not forwardRef, keeps the
	// memo comparison trivially stable).
	rootRef?: React.Ref<HTMLDivElement>;
}) {
	// Pointer-modality tracking (C-FOCUS-3): text inputs, <textarea> and
	// <select> all match the CSS `:focus-visible` pseudo-class on BOTH a
	// mouse click AND keyboard focus (MDN: "when a text box needing user
	// input has focus, focus is indicated"), so the heavy inset focus ring
	// below painted on EVERY click into a field. Track the last input
	// modality at the root — a pointerdown anywhere in the component flips
	// to pointer mode (suppress the ring: the caret / open state already
	// marks the active field); a Tab/Arrow key flips back to keyboard mode
	// (keep the full ring for WCAG 2.4.7 / 1.4.11). Same pattern as
	// what-input and the voice-typer SearchField.
	//
	// Deliberately NO blur/focusout reset: a click that moves focus from
	// input A to input B fires pointerdown(B) → focusout(A), so a reset
	// on focusout would re-show the ring on the freshly-clicked field.
	// Pointer mode persists until the next Tab/Arrow (standard
	// what-input semantics); the FIRST keyboard navigation into the form
	// always fires keydown and restores the ring.
	const [pointerActive, setPointerActive] = React.useState(false);
	React.useEffect(() => {
		const root = shellRef.current;
		if (!root) return;
		const onPointerDown = () => setPointerActive(true);
		const onKeyDown = (e: KeyboardEvent) => {
			// A keyboard navigation key means the user is reaching the
			// form with the keyboard — restore the ring. `?.` because this
			// capture-phase root listener also sees synthetic/dispatched
			// events whose `key` can be undefined (prod crash: reading
			// 'startsWith' of undefined).
			if (e.key === "Tab" || e.key?.startsWith("Arrow")) {
				setPointerActive(false);
			}
		};
		// Capture phase so child interactions (inputs, selects, buttons)
		// register on the root.
		root.addEventListener("pointerdown", onPointerDown, true);
		root.addEventListener("keydown", onKeyDown, true);
		return () => {
			root.removeEventListener("pointerdown", onPointerDown, true);
			root.removeEventListener("keydown", onKeyDown, true);
		};
	}, []);

	// Merge the local shell ref (event listeners target it) with the
	// caller's rootRef (width observer + engine plumbing).
	const shellRef = React.useRef<HTMLDivElement | null>(null);
	const setRootRef = React.useCallback(
		(node: HTMLDivElement | null) => {
			shellRef.current = node;
			if (typeof props.rootRef === "function") {
				props.rootRef(node);
			} else if (props.rootRef) {
				props.rootRef.current = node;
			}
		},
		[props.rootRef],
	);

	// Deliberately NO background, borderRadius, or border on the root — the
	// editor controls those via Framer's native properties panel (or by
	// wrapping the component in a Framer frame). Inner elements (inputs,
	// buttons, date picker, banners) still use the theme tokens.
	// W1-18-F3 fix: every framer-motion animation in the flow is scoped
	// through this single wrapper with `reducedMotion="user"`, so visitors
	// with prefers-reduced-motion: reduce get instant (not animated)
	// transforms/layout — the single highest-impact reduced-motion fix.
	// W2-37-A3 fix: plus a real CSS media rule for the non-framer CSS
	// transitions (scoped to the component via `be-motion-root`, never
	// leaking to the host page), zeroing animation/transition durations.
	return (
		<MotionConfig reducedMotion="user">
			<div
				className={
					pointerActive
						? "be-motion-root be-pointer-active"
						: "be-motion-root"
				}
				ref={setRootRef}
				// INSTANCE-ISOLATION (rule 91): constant marker attribute — every
				// Booking Engine root carries it so the engine can derive a
				// mount-stable, per-instance persistence identity (DOM position)
				// and scope queries/handlers to its own subtree. Plain constant:
				// hydration-safe (nothing id-derived, nothing per-instance in
				// the markup itself).
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
			{/* HYDRATION-AUDIT: `suppressHydrationWarning` is REQUIRED here —
                the canonical explanation lives at the be-input <style> just
                above in this same file (search "HYDRATION-AUDIT"). This
                reduced-motion <style> was one of the three that produced
                warnings #425/#418/#422: the prerender's headless Chrome
                re-serializes this @media block with different indentation
                than the raw template literal (server: 2-space media indent,
                single-line rule; client: multi-line), so the texts never
                matched byte-for-byte. Never remove the flag, never reformat
                the CSS text, never inline the rule into style objects. */}
			<style suppressHydrationWarning>{`
@media (prefers-reduced-motion: reduce) {
    .be-motion-root, .be-motion-root * {
        animation-duration: 0.001s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001s !important;
    }
}
/* FINAL-37 fix: skip link is visually hidden until keyboard-focused,
   then revealed top-left. Colors inherit from the theme tokens; the
   global a:focus-visible outline supplies the visible indicator. */
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
/* FINAL-43 fix: programmatic-focus targets (step/success/error headings)
   get a keyboard-visible ring via :focus-visible — pointer-driven focus()
   stays clean, keyboard-initiated navigation gets the indicator the old
   inline outline:"none" used to suppress. */
.be-focus-target:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
`}</style>
		</MotionConfig>
	);
});

// =============================================================================
// StepBody — renders the active step's fields
// =============================================================================

interface StepBodyProps {
	step: NormalizedStep;
	/** Fix #2: full pipeline so ReviewStepBody can derive real field labels. */
	steps: NormalizedStep[];
	values: BookingValues;
	errors: Record<string, string | null>;
	touched: Record<string, boolean>;
	theme: Theme;
	borderRadius: string | number;
	/** FIELD-GAP (hard rule): field-grid spacing from the Styles Gap
	 *  control (default 16px, clamped 0–32 at runtime). Single source of
	 *  truth for both form-grid `gap`s — the hard-coded 12px is gone. */
	fieldGap: number;
	hasCalConfig: boolean;
	slotsLoading: boolean;
	/** Fix #13: surface Cal.com fetch errors as an inline banner. */
	slotsError: string | null;
	slotsForSelectedDate: Array<{
		value: string;
		label: string;
		end?: string;
		minutes: number;
	}>;
	/** Undefined keeps the no-Cal.com demo calendar fully selectable. */
	availableDates: Set<string> | undefined;
	selectedDate: Date | null;
	/** Fix #19: parent-controlled visible month. */
	visibleMonth: Date | null;
	timeZone: string;
	/** Task 2 M6 fix: lifted alongside `timeZone` so the visitor's 12h/24h
	 *  choice survives step navigation and session restore instead of
	 *  quietly resetting to "12h" every time `DateAndTimeInline` remounts. */
	timeFormat: "12h" | "24h";
	/** CC-3 completion: on the published site (not canvas), a datetime step
	 *  with no Cal.com credentials must not render the fake demo grid —
	 *  StepBody shows a hard unavailable notice instead. */
	hideDemoWhenUnconfigured: boolean;
	/** Fix #20: configurable copy. */
	copy: BookingEngineProps["copy"];
	/** W1-02-F9 note: merged copy.aria labels, computed by the parent —
	 *  children must not re-derive them from props.copy (single source). */
	ariaLabels: typeof DEFAULT_ARIA_LABELS;
	/** W1-02-F4–F8 fix (bundle 17): merged error copy for the
	 *  unconfigured-date-time notice (title + body). */
	errorCopy: ErrorCopy;
	/** INSTANCE-ISOLATION (rule 91): this engine's hydration-safe id
	 *  prefix — scopes the slot-error banner id (and through it every
	 *  field id rendered here) to this instance. Empty on the first
	 *  render of server and client alike (no hydration mismatch). */
	instanceId: string;
	onFieldChange: (fieldId: string, value: string | boolean | undefined) => void;
	onSlotReady: (payload?: BookingPayload) => void;
	onDateChange: (d: Date) => void;
	onMonthChange: (m: Date) => void;
	// TZ-TIME-HARD-RULE: there is intentionally no `onTimeZoneChange` prop —
	// the time zone is auto-detected from the browser and is not editable by
	// visitors or authors (see AGENTS.md). `timezoneOptions` was removed for
	// the same reason.
	onTimeFormatChange: (fmt: "12h" | "24h") => void;
	/** T10-H1 fix: review-step Edit links jump back to a given step. */
	onJumpToStep: (stepIndex: number) => void;
	/** T10-M8 fix: re-fetch availability from the error banner. */
	onRetrySlots: () => void;
	/** W1-19-N3 fix: container width from the engine's RootShell observer —
	 *  the form grid collapses to one column below COMPACT_BREAKPOINT
	 *  regardless of viewport width. */
	engineWidth: number;
	/** W1-20-N1 fix: mirrors the engine's flowStatus === "submitting" —
	 *  threaded to FieldRenderer so every authored field (inputs, choice
	 *  groups, checkboxes) freezes during the POST. Edits made after the
	 *  payload snapshot used to land in state but never in the in-flight
	 *  request, then vanish on success. */
	isSubmitting?: boolean;
	// CAL-EVENT-META: normalized Cal.com event/profile metadata for the
	// datetime step's information panel. Status is the deterministic
	// loading/ready/failed/disabled state machine — form/review steps never
	// receive either (disabled).
	eventMeta?: CalEventMeta | null;
	eventMetaStatus?: CalEventMetaStatus;
	eventMetaFallbackDurationMinutes?: number;
}

// FINAL-67 fix: per-field custom comparator. The whole-flow `values`/
// `errors`/`touched` maps change identity on EVERY keystroke, so default
// shallow memoization re-rendered every mounted step (all steps stay
// mounted for transitions) — visible typing lag on long forms. This
// comparator compares only the slice a step OWNS (its own field ids, plus
// the slot key for datetime steps). Review steps summarize every prior
// answer, so they intentionally fall back to full-map identity comparison
// and keep today's behavior.
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
		fieldGap,
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
		ariaLabels,
		onFieldChange,
		onSlotReady,
		onDateChange,
		onMonthChange,
		onTimeFormatChange,
		onJumpToStep,
		onRetrySlots,
		hideDemoWhenUnconfigured,
		errorCopy,
		// INSTANCE-ISOLATION (rule 91): hydration-safe per-engine id prefix.
		instanceId = "",
		engineWidth,
		isSubmitting = false,
		eventMeta,
		eventMetaStatus,
		eventMetaFallbackDurationMinutes,
	} = props;

	// W1-10-N2 fix: the slot-error banner id is scoped per engine instance
	// via the hydration-safe prefix ("" on the first render of both server
	// and client — no hydration mismatch; set post-mount like the skip
	// link's suffix). Two engines on one page never resolve each other's
	// slot-error references.
	const slotErrorId = `${instanceId ? `${instanceId}-` : ""}be-slot-error`;

	// W1-11-A9 fix: the slots error banner announces (role="alert") but
	// never took focus, so a keyboard/low-vision visitor had to hunt for
	// the message after the calendar rejected the slot. Now the banner
	// takes focus on first appearance (tabIndex={-1}); the alert role
	// handles the announcement, focus just lands the cursor for inspection.
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

	// Shared renderer for user-authored fields. Form steps use it directly;
	// Calendar steps render it above the calendar widget so any fields
	// authored on a Calendar step behave exactly like Form-step fields.
	const renderFormFields = () => {
		const isTwoCol =
			step.layout === "two-column" && engineWidth >= COMPACT_BREAKPOINT;
		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: isTwoCol ? "1fr 1fr" : "1fr",
					// FIELD-GAP: the Styles Gap control is the single
					// source of truth for the field-grid spacing (the
					// old hard-coded 12px was removed — AGENTS.md).
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
						selectOptionLabel={copy.selectOptionLabel}
						// W1-20-N1 fix: freeze authored fields during the POST.
						isSubmitting={isSubmitting}
						instanceId={instanceId}
					/>
				))}
			</div>
		);
	};

	// Review step removed: pre-booking review no longer rendered. Any
	// persisted "review" step is filtered in normalizeSteps and never reaches
	// StepBody. Success details are post-booking only.

	// --- Datetime step ---
	if (step.stepType === "datetime") {
		const slotError =
			touched[SELECTED_SLOT_KEY] && errors[SELECTED_SLOT_KEY]
				? errors[SELECTED_SLOT_KEY]
				: null;
		const isTwoCol =
			step.layout === "two-column" && engineWidth >= COMPACT_BREAKPOINT;

		// Requirement 3: everything that used to be permanently pinned
		// "above" the custom fields — the Cal.com error/no-times messages,
		// the calendar/time picker (including its loading state), its inline error,
		// and the timezone selector — is now a single unit that renders
		// wherever the "Calendar Widget" marker sits in `step.fields`, so
		// dragging that marker in the Fields array actually moves the whole
		// calendar block up or down relative to any custom fields.
		// CAL-BG-OWNERSHIP: the Calendar Widget marker field carries the
		// calendar's own Styles set (Background/Radius/Padding). It is
		// passed straight into DateAndTimeInline so the calendar surface is
		// owned by the marker's Styles submenu — the global Background
		// token never reaches the calendar, and the footer/nav wrapper
		// stays transparent (FOOTER-TRANSPARENT).
		const calendarMarkerField = step.fields.find(
			(candidate) => candidate.fieldType === "calendar-widget",
		);
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
							{copy.retryLabel}
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
						// T5-H8 completion: the engine-level "no times"
						// banner was a silent div, same as the in-widget
						// ones — announce when a chosen day has no slots.
						role="status"
						aria-live="polite"
						aria-atomic="true"
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
						/* TZ-TIME-UNAVAILABLE-FIX: this "unavailable" state is a
			       NORMAL, EXPECTED fallback (no Cal.com API config), NOT
			       an error. It is deliberately styled as a neutral,
			       informational status message — no error/red tones, no
			       role="alert" alarm. It simply occupies the same slot
			       the calendar widget would, so the step heading stays
			       in its usual position directly under the Progress.
			       The heading is rendered by the parent above the form
			       regardless of which branch shows here. */
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
							// PRIMARY-FOREGROUND: semantic On-Primary for the
							// selected date + adjacent-month tooltip.
							accentForegroundColor={theme.accentForegroundColor}
							// CAL-BG-OWNERSHIP: the marker field's own Styles
							// set owns the calendar surface (Background,
							// Radius, Padding). Undefined while untouched —
							// the calendar renders its native look and the
							// global Background token is not consulted.
							calendarStyles={calendarMarkerField?.calendarStyles}
							textColor={theme.textPrimaryColor}
							borderColor={theme.borderColor}
							radius={borderRadius}
							// W1-02-F17 fix: demo-grid times run the fixed
							// DEFAULT_DEMO_* constants (no author controls).
							startTime={copy.demoStartTime ?? DEFAULT_DEMO_START_TIME}
							endTime={copy.demoEndTime ?? DEFAULT_DEMO_END_TIME}
							interval={copy.demoInterval ?? DEFAULT_DEMO_INTERVAL}
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
							loadingLabel={copy.loadingAvailabilityLabel}
							onSelectionReady={onSlotReady}
							onDateChange={onDateChange}
							onMonthChange={onMonthChange}
							onTimeFormatChange={onTimeFormatChange}
							timeZone={timeZone}
							showTimesWithoutDate
							pickDateToSeeTimesLabel={copy.pickDateToSeeTimesLabel}
							noTimesFallbackLabel={copy.noTimesFallbackLabel}
							timeSlotsAriaLabel={ariaLabels.timeSlots}
							availableTimesAriaLabel={ariaLabels.availableTimes}
							datePickerAriaLabel={ariaLabels.datePicker}
							// W1-10-A1 fix: the datetime step always requires
							// a picked slot (validateStep emits pickDateTimeError
							// otherwise), so the radiogroup is required.
							required
							amLabel={copy.amLabel}
							pmLabel={copy.pmLabel}
							previousMonthAriaTemplate={ariaLabels.previousMonthTemplate}
							nextMonthAriaTemplate={ariaLabels.nextMonthTemplate}
							// W1-10-N1 fix: engine-level slot error wired to
							// the radiogroup (aria-invalid/aria-describedby).
							slotError={slotError}
							slotErrorId={slotErrorId}
							// W1-10-N3 fix: copy-driven toggle group label.
							timeFormatLabel={
								copy.timeFormatLabel ?? DEFAULT_COPY_TIMEFORMAT_LABEL
							}
							// CAL-EVENT-META: info panel data (datetime step
							// only; null → panel hidden, calendar unchanged).
							eventMeta={eventMeta}
							eventMetaStatus={eventMetaStatus}
							eventMetaFallbackDurationMinutes={
								eventMetaFallbackDurationMinutes
							}
							// FINAL-07 fix: author-localisable panel copy.
							calEventMetaLoadingAria={copy.calEventMetaLoadingAria}
							calEventMetaUnavailableCopy={copy.calEventMetaUnavailableCopy}
							// FINAL-09 fix: localisable duration suffixes.
							hourSuffix={copy.hourSuffix}
							minuteSuffix={copy.minuteSuffix}
						/>
					)}
				</div>
				{slotError ? (
					<div
						ref={slotErrorBannerRef}
						// W1-10-N1 fix: the banner had no id, so the slot
						// radiogroup's aria-describedby had nothing to
						// reference. Scoped per instance like every other id.
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
				{/* TZ-TIME-HARD-RULE: the visible Time Zone selector was
                    removed entirely. The time zone is auto-detected from the
                    visitor's browser and applied to the calendar/slots in
                    code — there is no manual <select> in either the working
                    calendar view or the unavailable fallback, and no author
                    list in Properties Controls (see AGENTS.md). */}
			</div>
		);

		const hasCalendarMarker = step.fields.some(
			(candidate) => candidate.fieldType === "calendar-widget",
		);

		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: isTwoCol ? "1fr 1fr" : "1fr",
					// FIELD-GAP: same Styles Gap control as form steps.
					gap: fieldGap,
				}}
				className={`be-form-grid`}
			>
				{step.fields.map((field) =>
					field.fieldType === "calendar-widget" ? (
						<React.Fragment key={field.id}>{calendarBlock}</React.Fragment>
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
							choiceGroupAriaLabel={ariaLabels.choiceGroup}
							selectOptionLabel={copy.selectOptionLabel}
							// W1-20-N1 fix: freeze authored fields during the POST.
							isSubmitting={isSubmitting}
							instanceId={instanceId}
						/>
					),
				)}
				{/* Backward compatibility: an existing Calendar step saved
                    before the Calendar Widget marker existed won't have one
                    in its `fields` array. Fall back to rendering the
                    calendar at the end rather than dropping it entirely. */}
				{!hasCalendarMarker ? calendarBlock : null}
			</div>
		);
	}

	// --- Form step ---
	return renderFormFields();
}, areStepBodyPropsEqual);

// =============================================================================

// =============================================================================
// FieldRenderer — switch on field.type
// =============================================================================

interface FieldRendererProps {
	field: NormalizedField;
	value: string | boolean | undefined;
	error: string | null;
	theme: StepBodyProps["theme"];
	borderRadius: string | number;
	isTwoCol: boolean;
	onFieldChange: (fieldId: string, value: string | boolean | undefined) => void;
	// W1-02-F9 fix: the choice-group fallback name and the select
	// placeholder are copy-driven.
	choiceGroupAriaLabel: string;
	selectOptionLabel: string;
	// W1-20-N1 fix: freezes every input/choice/checkbox during the POST
	// (threaded from StepBodyProps.isSubmitting).
	isSubmitting?: boolean;
	// INSTANCE-ISOLATION (rule 91): this engine's hydration-safe id prefix.
	// Empty string on the first render (both server and client — no
	// hydration mismatch), then "be-engine-N" post-mount. Field DOM ids
	// (label htmlFor, input id, error id, aria-describedby) are prefixed
	// with it so two engines on one page never resolve each other's
	// labels/announcements. The ids mutate post-hydration in the same
	// commit for the whole pair — exactly like the skip-link's
	// `be-skip-end-${reactInstanceId}`.
	instanceId: string;
}

// A11Y-ANNOUNCE: field errors assert ONCE, then go polite. The message
// element stays mounted while the visitor corrects the field (rule 81's
// cleanup path re-renders it per keystroke) — a static role="alert"
// re-interrupted typing with every letter. First appearance asserts;
// every later update (same error instance) is a polite status. Clearing
// unmounts, so a brand-new error asserts again.
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
		selectOptionLabel,
		isSubmitting = false,
		instanceId = "",
	} = props;

	// INSTANCE-ISOLATION (rule 91): field DOM ids are scoped per engine
	// instance. History: the original instance-scoped ids were dropped in
	// the W1-10-N2 hydration audit because effect-derived prefixes
	// mismatched the headless prerender (#418). The hydration-safe
	// `reactInstanceId` ("" on the first render of BOTH server and client,
	// then set once post-mount — the same proven pattern as the skip
	// link's `be-skip-end-${reactInstanceId}`) lets us restore instance
	// scoping WITHOUT any hydration divergence: first render is identical
	// everywhere, and the id/htmlFor/describedby pair mutates in one
	// commit. Two engines on one page therefore never resolve each
	// other's labels, focus, or error announcements.
	const domIdPrefix = instanceId ? `${instanceId}-` : "";
	const fieldDomId = `${domIdPrefix}be-field-${field.id}`;
	const errorDomId = `${domIdPrefix}be-error-${field.id}`;

	// T10-M5 fix: auto-resize the textarea to its content. Hooks live at
	// the top (not inside the switch) so a fieldType change in the editor
	// never shifts the hook order.
	const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
	// W2-37-A2 fix: the old effect reset `height: auto` and re-wrote a
	// height on EVERY keystroke, forcing a synchronous layout pass each
	// time. Now nothing is written while the content fits the current box
	// (grow), and the auto-reset only happens when content actually
	// shrank below it — typing inside the current height is a no-op.
	// W1-14-F7 fix: useLayoutEffect — the measurement+write happens in the
	// same commit as the value change, so the box never renders one frame
	// at the stale height (flicker) before the effect corrects it.
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

	// SYN-08 fix: `opts` was rebuilt with a fresh `.map()` on every render
	// and `onChange` was an inline arrow, defeating ChoiceGroupInline's
	// React.memo at every FieldRenderer re-render (choice click, error
	// change, value change). Worse, the fresh opts identity re-triggered
	// ChoiceGroupInline's one-shot mount-seed onChange (W1-08-CG-02),
	// re-stamping the parent's stored value with the first option — so a
	// required choice group auto-passed validation without user input.
	// `field` is referentially stable between renders (StepBody receives
	// memoized normalized steps), so these three array deps suffice. Hooks
	// stay at the top so a fieldType change never shifts hook order.
	const opts: ChoiceOption[] = React.useMemo(
		() =>
			(field.options || []).map((opt, idx) => ({
				label: opt,
				// W1-08-F-08-06 fix: thread the author-authored value through
				// (parallel to optionImages/optionDescriptions). Empty entries
				// fall back to the label as the value (optionValue handles that).
				value: field.optionValues?.[idx] || undefined,
				image: field.optionImages?.[idx] || undefined,
				description: field.optionDescriptions?.[idx] || undefined,
			})),
		[field.options, field.optionValues, field.optionImages, field.optionDescriptions],
	);
	const handleChoiceChange = React.useCallback(
		(value: string) => onFieldChange(field.id, value),
		[field.id, onFieldChange],
	);

	// FINAL-49 fix: for choice types the htmlFor target doesn't exist —
	// ChoiceGroupInline renders a role="radiogroup" div (not a labelable
	// element) that already carries its own aria-label — so the <label>
	// was a dead click target. Choice fields get a plain text heading;
	// native-control fields keep the real label↔input association.
	const isChoiceFieldType = CHOICE_FIELD_TYPES.includes(field.fieldType);

	// FIELD-STYLES (hard rule): resolve this field's own override object.
	// Segmented/pills/cards/radio each own a variant Styles key whose
	// control defaults equal that variant's effective defaults; the shared
	// legacy choiceStyles object merges underneath per property, so
	// instances saved before the split keep every override live. Select
	// keeps choiceStyles as its live key. Undefined everywhere = default
	// engine look. normalizeStyleOverrides strips values that can never be
	// real choices (empty-string colors), so activation-time
	// materialization can never sneak one past the theme fallbacks.
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
	const fs = normalizeStyleOverrides(fieldStyleOverrides);
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
		...(fs?.labelFont?.lineHeight != null
			? { lineHeight: fs.labelFont.lineHeight }
			: {}),
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
		// FIELD-STYLES: per-field Spacing override (default 6px). Kept as
		// flex gap — rule 6 forbids margin/padding for error separation.
		gap: fs?.spacing ?? 6,
		minWidth: 0,
	};

	// Fix #7 + W1-11-A1: the `.be-input:focus-visible` CSS rule (defined in
	// the parent render) provides the keyboard focus ring. No inline outline
	// here — an inline `outline: "none"` previously overrode the rule by
	// specificity and made the keyboard ring invisible (WCAG 2.4.7).
	// Textarea auto-resize hooks live at the top of each branch's render
	// path below; this memo must also be top-level.
	// W1-19-F-02 fix: iOS Safari zooms into ANY focused control whose
	// font-size is below 16px. On coarse-pointer (touch) devices the
	// effective input font is bumped to 16px so focusing never zooms;
	// fine-pointer devices keep the compact 14px look.
	// SSR/hydration fix: matchMedia now runs in an effect (useCoarsePointer)
	// rather than during render, so the SSR font size matches the first
	// client render — the old inline matchMedia made touch-device markup
	// diverge from the SSR HTML (React #418).
	const isCoarsePointer = useCoarsePointer();
	const inputFontSize = isCoarsePointer ? 16 : 14;

	// W1-18-F1 fix: the focus-ring border transition is gated too.
	const reducedMotion = useReducedMotion();

	// FIELD-STYLES: resolve the input-like control surface. Every key falls
	// back to the engine default; the error border still wins over a custom
	// border color (error visibility is functional, not decorative). The
	// coarse-pointer ≥16px font guard (iOS zoom prevention) always wins.
	const fsFontSize = fontPixelSize(fs?.font?.fontSize);
	const fsInputFontSize = isCoarsePointer
		? Math.max(16, fsFontSize ?? inputFontSize)
		: (fsFontSize ?? inputFontSize);
	// FIELD-STYLES (native compound controls): border/radius/padding resolve
	// through the shared helpers — new compound values win, legacy scalars
	// still work, untouched fields fall back to the engine theme. The error
	// border still wins over a custom border color (functional, not
	// decorative), and the coarse-pointer ≥16px font guard always wins.
	const fsBorder = resolveFieldBorder(fs, field.fieldType);
	const fsRadius = resolveFieldRadius(fs, borderRadius, field.fieldType);
	const fsPadding = resolveFieldPadding(fs, field.fieldType);
	const inputBaseStyle: React.CSSProperties = {
		width: "100%",
		// HEIGHT-REMOVED: fixed 23px floor — no Height control exists, so
		// field height grows via Padding only. A stored `minHeight` from
		// an older canvas still wins as legacy (never silently restyle a
		// saved instance).
		minHeight: fs?.minHeight ?? 23,
		padding: fsPadding,
		borderRadius: fsRadius,
		border: `${fsBorder.width}px ${fsBorder.style} ${error ? theme.errorColor : (fsBorder.color ?? theme.borderColor)
			}`,
		background: fs?.backgroundColor ?? theme.surfaceColor,
		color: fs?.textColor ?? theme.textPrimaryColor,
		fontFamily: fs?.font?.fontFamily ?? "inherit",
		// W1-19-F-02 fix: was a flat 14 (see inputFontSize above).
		fontSize: fsInputFontSize,
		...(fs?.font?.fontWeight != null ? { fontWeight: fs.font.fontWeight } : {}),
		...(fs?.font?.fontStyle ? { fontStyle: fs.font.fontStyle } : {}),
		...(fs?.font?.letterSpacing != null
			? { letterSpacing: fs.font.letterSpacing }
			: {}),
		...(fs?.font?.lineHeight != null ? { lineHeight: fs.font.lineHeight } : {}),
		boxSizing: "border-box",
		// FIELD-STYLES: placeholder + focus colors ride CSS variables so
		// the static .be-input rules can consume per-field values while
		// staying inert (browser-default look) when unset.
		...(fs?.placeholderColor
			? ({ "--be-ph-color": fs.placeholderColor } as React.CSSProperties)
			: {}),
		...(fs?.focusBorderColor
			? ({ "--be-focus-color": fs.focusBorderColor } as React.CSSProperties)
			: {}),
		// DECOR: shadow/blur layers ride along only when configured —
		// unopened groups (and "none"/0) leave the surface untouched.
		...shadowStyle(fs?.shadow),
		...backdropStyle(fs?.backgroundBlur),
		// W1-18-F1 fix: gated on prefers-reduced-motion.
		// FOCUS-STATE-COMPOSE fix: the inset focus ring is a box-shadow —
		// fade it with the border so state changes never pop.
		transition: reducedMotion
			? "none"
			: "border-color 0.15s ease, box-shadow 0.15s ease",
	};

	switch (field.fieldType) {
		case "calendar-widget":
			// Marker-only "field": the actual calendar/time picker UI is
			// rendered by the parent (see StepBody's field/calendar map for
			// datetime steps) at the exact position this entry occupies in
			// the array. If it's ever encountered outside a datetime step
			// (e.g. a step's type was switched after adding it), render
			// nothing rather than a confusing stray text input.
			return null;
		case "textarea":
			return (
				<div style={containerStyle} data-field-id={field.id}>
					{labelEl}
					<textarea
						id={fieldDomId}
						// W1-20-N5 fix: prefer the author-mapped Cal field id
						// as the semantic form name — autofill/password
						// managers key on name, and "step-1-field-0" gives
						// them nothing. Falls back to the normalized id.
						name={field.calFieldId || field.id}
						className={error ? "be-input be-input-invalid" : "be-input"}
						value={typeof value === "string" ? value : ""}
						placeholder={field.placeholder || ""}
						required={field.required}
						// FINAL-79 fix: textarea fields (address, notes) now
						// participate in browser autofill like inputs do.
						autoComplete={autocompleteToken(field)}
						// W1-20-N1 fix: freeze during the POST — an edit after
						// the payload snapshot would only land in state and
						// vanish on success.
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
						// HEIGHT-REMOVED: same fixed 23px floor as inputs
						// (was 96) — textarea height comes from `rows` +
						// Padding now.
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
					{/* Requirement 4: a visible dropdown-arrow indicator on the
                        far right of the input, since `appearance: "none"`
                        below removes the browser's native one. */}
					<div style={{ position: "relative" }}>
						<select
							id={fieldDomId}
							// W1-20-N5 fix: same semantic-name preference as
							// the textarea/input sites above.
							name={field.calFieldId || field.id}
							className={error ? "be-input be-input-invalid" : "be-input"}
							value={typeof value === "string" ? value : ""}
							required={field.required}
							// FINAL-79 fix: country-style selects get autofill
							// tokens too (autocompleteToken maps "country" etc.).
							autoComplete={autocompleteToken(field)}
							// W1-20-N1 fix: freeze during the POST (see textarea).
							disabled={isSubmitting}
							onChange={(e) => onFieldChange(field.id, e.target.value)}
							aria-invalid={!!error}
							aria-describedby={
								error ? errorDomId : undefined
							}
							style={{
								...inputBaseStyle,
								cursor: isSubmitting ? "not-allowed" : "pointer",
								appearance: "none",
								paddingRight:
									paddingHorizontalFrom(fsPadding) + 22,
								// FIELD-STYLES: the empty-select hint uses the
								// Placeholder color; a chosen value uses Text Color.
								color:
									!value && fs?.placeholderColor
										? fs.placeholderColor
										: (fs?.textColor ?? theme.textPrimaryColor),
							}}
						>
							<option value="" disabled={field.required}>
								{field.placeholder || selectOptionLabel}
							</option>
							{/* T7-M1 fix: options are always strings (the property control is
                                ControlType.String) - the object branch was dead, and
                                (opt as any).label was the file's last "as any". */}
							{(field.options || []).map((opt) => {
								const label = opt;
								return (
									<option key={label} value={label}>
										{label}
									</option>
								);
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
								stroke={fs?.textColor ?? theme.textSecondaryColor}
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					{errorEl}
				</div>
			);
		case "segmented":
		case "pills":
		case "cards":
		case "radio": {
			// Fix #22: pass options as a direct array (no comma round-trip).
			// T7-M1 fix: options are strings - the object branch was dead.
			// T10-L4 fix: zip the parallel image/description arrays in by
			// index so cards/radio can render media without changing the
			// stored options shape. (SYN-08: the zipped array is built in a
			// top-of-component useMemo — see above — so its identity is
			// stable across renders.)
			const variant =
				field.fieldType === "pills"
					? "pills"
					: field.fieldType === "segmented"
						? "segmented"
						: field.fieldType === "radio"
							? "radio"
							: "cards";
			// FIELD-STYLES (native compound controls): resolve the choice
			// surface. Author-set radius/padding/border come from the
			// compound values when present (legacy scalars still honored);
			// when unset they stay undefined so ChoiceGroupInline's
			// per-variant defaults (pills 999, segmented 16, …) still apply.
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
						// CC-7 fix: this was passed as "", so the
						// radiogroup's accessible name fell through to
						// `inputName` — the internal field ID (e.g.
						// "step-0-field-0"), which is what screen readers
						// announced instead of the field's actual label.
						label={field.label}
						// W1-08-CG-04 fix: the CC-7 label also made the
						// in-component VISIBLE label render, duplicating
						// labelEl above; suppress the duplicate copy (the
						// radiogroup aria-name still uses `label`).
						showLabel={false}
						inputName={field.id}
						// AUTHOR-DEFAULT-SELECTION: the author-configured
						// pre-selected option wins; empty falls back to the
						// historical first-option seed (existing canvases
						// unchanged — their `defaultOption` is "").
						defaultValue={field.defaultOption || opts[0]?.label || ""}
						variant={variant}
						optionsText=""
						options={opts}
						accentColor={theme.accentColor}
						// PRIMARY-FOREGROUND: On-Primary for selected options.
						accentForegroundColor={theme.accentForegroundColor}
						// FIELD-STYLES: per-field overrides resolved from this
						// field's own Styles submenu — every key falls back to
						// the engine theme value when unset, so untouched
						// fields render exactly as before.
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
						optionBlur={fs?.backgroundBlur}
						trackBackground={fs?.backgroundColor}
						controlledValue={typeof value === "string" ? value : undefined}
						ariaInvalid={!!error}
						ariaDescribedBy={
							error ? errorDomId : undefined
						}
						onChange={handleChoiceChange}
						choiceGroupAriaLabel={choiceGroupAriaLabel}
						required={field.required}
						// W1-20-N1 fix: freeze the radiogroup during the POST
						// (mirrors the native-input disabled above).
						isSubmitting={isSubmitting}
					/>
					{errorEl}
				</div>
			);
		}
		case "checkbox": {
			const checked = Boolean(value);
			// FIELD-STYLES: checkbox consumes its own checkStyles set —
			// Label Font, Label Color, Accent and Size. Defaults keep the
			// historical 18px box + theme accent + 14px label.
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
							// W1-19-N2 fix: single-line labels were ~20px
							// tall (WCAG 2.5.5 target-size fail); the whole
							// label row is the tap target, so it gets the
							// same 44px floor as the F-03 Edit button.
							minHeight: TOUCH_TARGET_MIN,
							// W1-20-N1 fix: the label row is the tap target —
							// dim/pointer-cue it when the POST is in flight.
							opacity: isSubmitting ? 0.5 : 1,
							...(isSubmitting ? { cursor: "not-allowed" } : {}),
						}}
					>
						<input
							type="checkbox"
							// W1-20-N5 fix: same semantic-name preference as
							// the other input sites.
							name={field.calFieldId || field.id}
							checked={checked}
							required={field.required}
							// W1-20-N1 fix: freeze during the POST (see textarea).
							disabled={isSubmitting}
							onChange={(e) => onFieldChange(field.id, e.target.checked)}
							aria-invalid={!!error}
							// Fix #16: associate the error with the checkbox.
							aria-describedby={
								error ? errorDomId : undefined
							}
							style={{
								marginTop: 2,
								width: checkSize,
								height: checkSize,
								accentColor: checkAccent,
								cursor: "pointer",
								// DECOR: box shadow/blur on the check box
								// only when configured.
								...shadowStyle(fs?.shadow),
								...backdropStyle(fs?.backgroundBlur),
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
						// W1-20-M2 fix: `name` was missing everywhere, so
						// password managers couldn't group fields and
						// autofill had nothing to key on.
						// W1-20-N5 fix: the author-mapped Cal field id is
						// the semantic name autofill keys on; the normalized
						// internal id stays as the fallback.
						name={field.calFieldId || field.id}
						className={error ? "be-input be-input-invalid" : "be-input"}
						type={
							field.fieldType === "email"
								? "email"
								: field.fieldType === "phone"
									? "tel"
									: "text"
						}
						// VALIDATION-REMOVED (rule 100): no author pattern to
						// surface — the form is `noValidate` and enforcement
						// stays with validateField's fixed per-type rules.
						// W1-20-M1 fix: mobile keyboards — email and phone
						// fields pulled up the full QWERTY instead of the
						// @-key / numeric keypad.
						inputMode={
							field.fieldType === "email"
								? "email"
								: field.fieldType === "phone"
									? "tel"
									: undefined
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
						// W1-20-N1 fix: freeze during the POST (see textarea).
						disabled={isSubmitting}
						// PHONE-NUMBERS-ONLY fix: the phone field accepts phone
						// characters only — letters/symbols outside the phone
						// charset are stripped at this single write point, so
						// they never enter engine state and (controlled
						// input) never appear in the field — typing AND
						// pasting. The allowed set is exactly what
						// PHONE_REGEX/validatePhone accept: digits and phone
						// formatting "+ ( ) - . " plus spaces.
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

// =============================================================================
// SuccessScreen — confirmation summary + .ics download
// =============================================================================

const SuccessScreen = React.memo(function SuccessScreen(props: {
	steps: NormalizedStep[];
	values: BookingValues;
	bookingResult: BookingConfirmation | null;
	accentColor: string;
	// PRIMARY-FOREGROUND: On-Primary for accent-filled buttons on this screen.
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
	// Per-surface Heading Font (shared with step + error titles).
	headingFont?: FramerFont;
	// CONFIRM-ACTIONS: labels come from the Buttons group now.
	addToCalendarLabel: string;
	bookAnotherLabel: string;
	doneLabel: string;
	// BUTTON-GROUPS: resolved visual surfaces for the three styled
	// confirmation actions (Google/Outlook/manage links stay theme-driven).
	addToCalendarStyle: React.CSSProperties;
	bookAnotherStyle: React.CSSProperties;
	doneStyle: React.CSSProperties;
	addToCalendarHover?: ButtonInteractionState;
	addToCalendarPressed?: ButtonInteractionState;
	doneHover?: ButtonInteractionState;
	donePressed?: ButtonInteractionState;
	bookAnotherHover?: ButtonInteractionState;
	bookAnotherPressed?: ButtonInteractionState;
	animateInteractions: boolean;
	// HOME-URL-REMOVED: "Done" always navigates to DEFAULT_CONFIRM_HOME_URL
	// (website root) — no prop, no control.
	// CONFIRM-ICON-ANIM: the circle's entrance reuses the selected
	// Transition Type family + the existing Transition timing control.
	transitionVariant: TransitionVariantId;
	baseTransition: Transition;
	// T3-I3 fix: the timezone the visitor booked in (selected TZ, not
	// browser TZ) plus the label copy that marks the time as "their" time.
	timeZone: string;
	timeZoneLabel: string;
	// T3-M3 fix: configurable calendar-event summary.
	icsSummaryLabel: string;
	// T10-H4 fix: summary row labels for the booked date and time.
	dateLabel: string;
	timeLabel: string;
	// T10-H5 fix: labels of the Google Calendar / Outlook deep-link buttons.
	googleCalendarLabel: string;
	outlookCalendarLabel: string;
	// W1-02-F9–F23 fix: confirmation reference, manage link, .ics and
	// notes-section copy are author-localisable.
	confirmationNumberLabel: string;
	rescheduleOrCancelLabel: string;
	notesSelectedTimeLabel: string;
	notesDatePrefix: string;
	notesTimePrefix: string;
	icsProdid: string;
	icsSummaryFallback: string;
	// FINAL-06 fix: author ICS LOCATION text (empty → line omitted).
	icsLocationLabel?: string;
	// W2-23-N1 fix: author-tunable fallback meeting duration (ms).
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
		addToCalendarLabel,
		bookAnotherLabel,
		doneLabel,
		addToCalendarStyle,
		bookAnotherStyle,
		doneStyle,
		// BUTTON-INTERACTION: per-button hover/pressed configs + whether
		// transitions may animate (engine's reduced-motion verdict).
		addToCalendarHover,
		addToCalendarPressed,
		doneHover,
		donePressed,
		bookAnotherHover,
		bookAnotherPressed,
		animateInteractions,
		transitionVariant,
		baseTransition,
		timeZone,
		timeZoneLabel,
		icsSummaryLabel,
		dateLabel,
		timeLabel,
		googleCalendarLabel,
		outlookCalendarLabel,
		confirmationNumberLabel,
		rescheduleOrCancelLabel,
		notesSelectedTimeLabel,
		notesDatePrefix,
		notesTimePrefix,
		icsProdid,
		icsSummaryFallback,
		icsLocationLabel,
		meetingDurationMs,
	} = props;

	// CC-6 fix: this screen replaces the whole step flow, so screen-reader
	// users need to be told something happened and where to listen. Focus
	// the heading on mount and mark the region as an assertive status so
	// it's announced even though focus (not just DOM insertion) moved here.
	const headingRef = React.useRef<HTMLHeadingElement | null>(null);
	React.useEffect(() => {
		headingRef.current?.focus();
	}, []);
	// BUTTON-INTERACTION: one hover/pressed state per confirmation action.
	const icsIx = useButtonInteraction();
	const doneIx = useButtonInteraction();
	const bookAnotherIx = useButtonInteraction();

	// CONFIRM-ICON-ANIM: two-stage confirmation reveal.
	// Stage 1 — the green circle enters using the SAME transition family the
	// author selected via the existing "Transition Type" control (fade rise,
	// blur scale, slide, zoom, …) timed by the existing "Transition" control.
	// No second transition-type control exists; this is a pure consumer of
	// TRANSITION_VARIANT_DEFS, so a blur-based step transition produces a
	// blur-style circle reveal, etc.
	// Stage 2 — after the circle lands, the check mark draws itself as an
	// SVG path (pathLength 0 → 1).
	// Static canvas/export renders and prefers-reduced-motion visitors get
	// the final state without motion (short fade at most), as everywhere else.
	const isStaticRender = useIsStaticRenderer();
	const reducedMotion = useReducedMotion();
	const variantDef = TRANSITION_VARIANT_DEFS[transitionVariant];
	const circleHidden = React.useMemo(() => {
		const raw: unknown = variantDef.variants.inactive;
		const resolved =
			typeof raw === "function" ? (raw as (c: number) => unknown)(1) : raw;
		// FINAL-61 fix: Variants-typed values flow straight through — no cast.
		return resolved as Variants;
	}, [variantDef]);
	const circleShown = variantDef.variants.active;
	// Same duration-override rule StepVisibilityWrapper uses: the configured
	// Transition control's duration must drive every variant.
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

	// Build a label/value summary from every form step's fields.
	// FINAL-66 fix: memoized — this iterates steps × fields with Intl
	// formatting; it previously re-ran on EVERY render (hover, live-region
	// updates), and its output feeds the ICS URI identity.
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
					if (value === undefined || value === "") continue;
					list.push({
						id: field.id,
						label: field.label,
						value: String(value),
					});
				}
			}
			if (values[SELECTED_SLOT_KEY]) {
				const slot = values[SELECTED_SLOT_KEY];
				// T3-I3 fix: the date/time were formatted in the BROWSER's zone
				// while the slot itself was booked in the visitor-selected zone —
				// anyone whose browser zone differs (travel, VPN, wrong system
				// clock) saw a confirmation that silently disagreed with the actual
				// booking time. Format in the selected zone and label the time as
				// the visitor's own.
				const tzOpts = timeZone ? { timeZone } : undefined;
				// W1-07-F2 fix: an invalid IANA `timeZone` (author typo, corrupt
				// restore, stale prop) makes toLocaleDateString throw RangeError —
				// an uncaught render-crash. Fall back to the browser-local zone
				// like every zoned-format helper does.
				let dateStr: string;
				try {
					// W1-07-F7 fix: format the slot's actual UTC instant when a
					// real Cal.com slot is booked (`time24h` has a "T"); `slot.date`
					// (the cell's browser-local midnight) is the demo-mode fallback
					// only.
					const slotDate = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
						? new Date(slot.time24h)
						: slot.date;
					dateStr = slotDate.toLocaleDateString(pageLocale(), {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
						...tzOpts,
					});
				} catch {
					dateStr = slot.date.toLocaleDateString(pageLocale(), {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					});
				}
				list.push({ label: dateLabel, value: dateStr });
			list.push({
				label: timeLabel,
				value: timeZoneLabel
					? `${slot.timeLabel} (${timeZoneLabel})`
					: slot.timeLabel,
			});
		}
		// CC-11 fix: surface the booking reference (the Cal.com booking
		// UID — the booking's ID for reschedule/cancel), when one was
		// returned. Derived INSIDE the memo: the old code pushed onto the
		// memoized array in the render body, so EVERY re-render (button
		// hovers, focus moves, ticks) appended another identical
		// "Confirmation #" row and the list grew without bound. Never
		// mutate a memoized value during render.
		if (bookingResult?.uid) {
			list.push({
				label: confirmationNumberLabel,
				value: bookingResult.uid,
			});
		}
		return list;
	}, [steps, values, timeZone, dateLabel, timeLabel, timeZoneLabel, bookingResult?.uid, confirmationNumberLabel]);

	// T3-M3 fix: the .ics DESCRIPTION carries the collected answers (minus
	// the internal "Selected Time" section) instead of nothing; the SUMMARY
	// uses the author-configurable label. W1-02-F17 fix: the notes-section
	// headers come from copy.
	const icsDescription = React.useMemo(() => {
		const raw = buildNotesPayload(
			steps,
			values,
			notesSelectedTimeLabel,
			notesDatePrefix,
			notesTimePrefix,
			// W1-07-N1 fix: same zoned formatting as the on-screen labels.
			timeZone,
		);
		const cut = raw.indexOf(notesSelectedTimeLabel);
		return cut > 0 ? raw.slice(0, cut).trim() : raw;
	}, [steps, values, notesSelectedTimeLabel, notesDatePrefix, notesTimePrefix, timeZone]);

	// FINAL-19 fix: the ICS URI was rebuilt inline on EVERY render, and each
	// rebuild minted a fresh UID + DTSTAMP (see buildIcsDataUri). Memoize on
	// the actual inputs so re-renders (hover states, live-region updates)
	// reuse the exact same payload — and therefore the same UID.
	const icsUri = React.useMemo(
		() =>
			values[SELECTED_SLOT_KEY]
				? buildIcsDataUri(
					values[SELECTED_SLOT_KEY],
					icsDescription || undefined,
					icsSummaryLabel,
					icsProdid,
					icsSummaryFallback,
					// W2-23-N1 fix: author-tunable fallback duration.
					meetingDurationMs,
					// FINAL-06 fix: author ICS LOCATION (empty omits line).
					typeof icsLocationLabel === "string" ? icsLocationLabel : "",
					// FINAL-19 fix: seed from the booking's own Cal.com UID.
					bookingResult?.uid ?? undefined,
				)
				: "",
		[
			values,
			icsDescription,
			icsSummaryLabel,
			icsProdid,
			icsSummaryFallback,
			meetingDurationMs,
			icsLocationLabel,
			bookingResult,
		],
	);

	// T10-H5 fix: Google/Outlook deep links need a real UTC instant — the
	// demo grid's "HH:MM" times have no date, so gate both links on the
	// same ISO check the submit path uses.
	// W1-15-TS-13 fix: the raw cast discarded the string/boolean union the
	// values map actually holds. Narrow through the shared runtime guard
	// instead — same outcome, no type lie.
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
				// W2-23-N1 fix: author-tunable fallback duration.
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
				// W2-23-N1 fix: author-tunable fallback duration.
				meetingDurationMs,
			)
			: "";

	return (
		// A11Y-ANNOUNCE: plain wrapper — the focus move to the heading
		// below already announces the screen. The previous assertive live
		// region re-announced the whole page on top of focus (double
		// announcement on every successful booking).
		<div>
			{/* CONFIRM-ICON-ANIM: Circle with checkmark — centered, on top.
                    The container enters via the selected Transition Type
                    family; the check then draws itself as an SVG path.
                    Static renders paint the final state (initial={false}). */}
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					marginBottom: 16,
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
							width: CHECKMARK_ICON_SIZE,
							height: CHECKMARK_ICON_SIZE,
							borderRadius: "50%",
							background: successColor,
							// Fixed foreground for the checkmark stroke. A
							// constant — never derived from the configured
							// colours.
							color: TEXT_ON_ACCENT,
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
							aria-hidden="true"
							role="presentation"
						>
							{animateCheck ? (
								// Stage 2: path-drawing reveal — the stroke grows
								// from its start point once the circle has landed.
								// Path direction matters: it starts at the check's
								// natural lower-left tail (4,12), passes through
								// the bottom vertex (9,17) and finishes at the
								// upper-right tip (20,6). Never reversed.
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
					// Per-surface Heading Font (unset = previous look).
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
					textAlign: "center",
					marginBottom: 4,
					marginTop: 0,
					// FINAL-43 fix: outline:none removed (see .be-focus-target).
				}}
			>
				{replaceCopyTokens(successTitle, steps, values, timeZone)}
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
				{replaceCopyTokens(successSubtitle, steps, values, timeZone)}
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

			{/* CONFIRM-ACTIONS: confirmation actions are right-aligned to
                match the footer nav's primary-action side. Order within the
                group: calendar/manage secondaries, then Done, then the
                accent-filled "Book another" as the far-right primary. */}
			<div
				style={{
					display: "flex",
					gap: 8,
					flexWrap: "wrap",
					alignItems: "center",
					justifyContent: "flex-end",
				}}
			>
				{icsUri ? (
					<a
						href={icsUri}
						// Fixed, industry-neutral download filename — never
						// business-branded and never a Property Control (see
						// AGENTS.md).
						download={DEFAULT_ICS_FILENAME}
						{...icsIx.bind}
						style={{
							display: "inline-flex",
							alignItems: "center",
							minHeight: TOUCH_TARGET_MIN,
							// BUTTON-GROUPS: Add-to-Calendar group's surface
							// + Hover/Pressed deltas.
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
						// W1-06-F-06-3 fix: prefer the API-provided canonical
						// manage link (rescheduleUrl, else cancelUrl) over the
						// constructed `https://cal.com/booking/{uid}` — the
						// constructed URL is wrong on self-hosted instances.
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
						{rescheduleOrCancelLabel}
					</a>
				) : null}
				{/* CONFIRM-ACTIONS: "Done" sits immediately to the left of
                    the primary action. Explicit visitor navigation only —
                    the success screen never auto-redirects. The destination
                    is fixed (website root) — HOME-URL-REMOVED has no control
                    and no hidden state. */}
				<a
					href={DEFAULT_CONFIRM_HOME_URL}
					{...doneIx.bind}
					style={{
						display: "inline-flex",
						alignItems: "center",
						minHeight: TOUCH_TARGET_MIN,
						// BUTTON-GROUPS: Done group's resolved surface
						// + Hover/Pressed deltas.
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
						// BUTTON-GROUPS: Book-another group's surface
						// + Hover/Pressed deltas.
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

// =============================================================================
// ErrorScreen — friendly, non-technical message + Try Again (preserves values)
// =============================================================================

// T3-L3 fix: turn the author-supplied support-contact string into a usable
// link — bare email → mailto:, phone-like → tel:, explicit URL → as-is,
// anything else stays a plain (non-linked) string.
function supportContactHref(value: string): {
	href: string;
	external: boolean;
} {
	const trimmed = (value || "").trim();
	if (/^https?:\/\//i.test(trimmed)) return { href: trimmed, external: true };
	if (/[^@\s]+@[^@\s]+\.[^@\s]+/.test(trimmed))
		return { href: `mailto:${trimmed}`, external: false };
	if (/^[+]?[\d\s().-]{5,}$/.test(trimmed))
		return {
			href: `tel:${trimmed.replace(/[^\d+]/g, "")}`,
			external: false,
		};
	return { href: trimmed, external: false };
}

const ErrorScreen = React.memo(function ErrorScreen(props: {
	message: string;
	errorColor: string;
	textPrimaryColor: string;
	textSecondaryColor: string;
	surfaceColor: string;
	borderColor: string;
	borderRadius: string | number;
	accentColor: string;
	// PRIMARY-FOREGROUND: On-Primary for the accent-filled retry button.
	accentForegroundColor: string;
	onRetry: () => void;
	errorTitle: string;
	errorSubtitle: string;
	// Per-surface Heading Font (shared with step + success titles).
	headingFont?: FramerFont;
	retryLabel: string;
	// T3-L3 fix: optional support-contact path (empty value → hidden).
	supportContactLabel: string;
	supportContactValue: string;
}) {
	const {
		message,
		errorColor,
		textPrimaryColor,
		textSecondaryColor,
		// W1-17-N7-new fix: the retry-button text picker needs the real
		// backdrop; it was declared in props but never destructured.
		surfaceColor,
		borderColor,
		borderRadius,
		accentColor,
		accentForegroundColor,
		onRetry,
		errorTitle,
		errorSubtitle,
		headingFont,
		retryLabel,
		supportContactLabel,
		supportContactValue,
	} = props;

	// CC-6 fix: same reasoning as SuccessScreen — this replaces the whole
	// flow, so focus needs to move here and the region needs to announce
	// itself, or screen-reader users are simply stranded.
	const headingRef = React.useRef<HTMLHeadingElement | null>(null);
	React.useEffect(() => {
		headingRef.current?.focus();
	}, []);

	return (
		// A11Y-ANNOUNCE: plain wrapper — the focus move to the heading
		// below already announces the screen. The previous assertive live
		// region re-announced the error page on top of focus (double
		// announcement on every failure).
		<div>
			{/* ERROR-STATE-DESIGN: centered premium layout on the same 320px
				floor as the form (rule 18) — the component never collapses
				around this short content. Column centers both axes;
				max-widths keep lines composed on wide embeds. */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					minHeight: 320,
					padding: "24px 16px",
					boxSizing: "border-box",
				}}
			>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 6,
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
						// Soft halo ring for a composed, premium mark.
						boxShadow: `0 0 0 8px ${withAlpha(errorColor, 0.06)}`,
						color: errorColor,
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 24,
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
						// Per-surface Heading Font (unset = previous look).
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
							fontSize: 14,
							color: textSecondaryColor,
							marginTop: 6,
							lineHeight: 1.5,
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
					justifyContent: "center",
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
						// PRIMARY-FOREGROUND: semantic On-Primary token for the
						// accent-filled retry button — never a hard-coded white.
						color: accentForegroundColor,
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
							// W1-11-NEW-FIND-6 fix: the focus outline uses
							// currentColor (the global :focus-visible rule),
							// so a deliberately muted textSecondaryColor could
							// fall under the 3:1 indicator-contrast threshold.
							// textPrimaryColor keeps the outline legible no
							// matter how quiet the secondary token is.
							color: textPrimaryColor,
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
		</div>
	);
});

BookingEngine.displayName = "BookingEngine";

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
type FieldControlProps = Partial<FieldConfig>;
type StepSlotControlProps = Pick<BookingEngineProps, "stepCount">;
type ProgressBarControlProps = Pick<
	BookingEngineProps["progressBar"],
	"showTextContent"
>;

// =============================================================================
// FIELD-STYLES control factories (AGENTS.md rule 83)
// =============================================================================
// One reusable architecture for the per-field Styles submenu. Three composed
// control sets — input-like, choice, checkbox — share these factories and the
// single FieldStyleOverrides runtime model. Every control is optional AND
// default-free (STYLES-INIT hard rule): an untouched key materializes as
// undefined and never overrides the engine theme / field default, and each
// field type exposes exactly the set that is meaningful for it (no fake
// controls). The Calendar Widget marker exposes `calendarStyles` (see below).
const FIELD_STYLE_INPUT_TYPES = ["text", "email", "phone", "textarea"];
const isFieldStyleInputType = (fieldType?: string) =>
	FIELD_STYLE_INPUT_TYPES.includes(fieldType || "");

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
		// STYLES-INIT-EFFECTIVE: the default is the field's effective default
		// for this property, so Framer's activation-time materialization
		// yields the inherit look instead of a 0 override.
		defaultValue,
	};
}
// FONT-EFFECTIVE-DEFAULTS (rules 90/93/96): a Font control with NO
// defaultValue materializes Framer's generic font on activation (the
// reported bug: enabling Styles restyled text even before touching
// anything). Every Font row therefore carries a defaultValue equal to
// the size/weight the field REALLY renders with, resolved per usage:
//   - input + choice option text → 14px Regular (inputBaseStyle /
//     effectiveFontSize floor; coarse-pointer 16px guard still wins)
//   - input + choice field labels → 13px Medium (labelEl fallbacks)
//   - checkbox labels → 14px Regular (check-label fallbacks)
// Weight comes via `variant` (the control resolves it to fontWeight,
// which is what the runtime reads). Line-height ships at 1.6 for every
// label row (author direction — airier labels than the browser's
// `normal`). Family/letter-spacing stay unset so page inheritance
// survives until the author picks a value.
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
// FIELD-STYLES (native compound controls): the Border / Radius / Padding
// controls are Framer's documented compound types — one logical Border
// (color + width + style, per-side segmented mode included), a Framer-style
// Radius (single value or per-corner), and a Padding control (single value
// or per-side).
//
// STYLES-INIT (hard rule, AGENTS.md): NO nested field-styles control carries
// a concrete `defaultValue`. A `defaultValue` would be materialized as an
// EXPLICIT value the moment the author activates the optional Styles object,
// and the runtime would then treat "not customized" as "configured" —
// overriding the field's own native/default styling (the reported bug:
// opening Styles snapped a field to the submenu's defaults). Instead every
// key materializes as undefined while untouched, and the runtime resolvers
// (resolveFieldBorder/Radius/Padding, fontPixelSize, the `??` guards) fall
// back to each field type's own default. A value is stored — and applied —
// only when the author actually enters one, and reopening the submenu shows
// Framer's persisted value (previously customized values are never reset).
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
		// STYLES-INIT-EFFECTIVE: mirrors the surface's effective border so
		// the materialized value renders identically to the inherit path
		// (and a zero-width materialization can never strip borders).
		defaultValue,
	};
}
function fieldStylesRadiusControl(defaultValue: string = FIELD_STYLES_FIELD_RADIUS) {
	return {
		type: ControlType.BorderRadius,
		title: "Radius",
		optional: true,
		// STYLES-INIT-EFFECTIVE: the caller's own effective radius default
		// (per-variant for choice sets); an explicit author-entered 0 still
		// applies as 0 (`??`/typeof resolvers, never falsy checks).
		defaultValue,
	};
}
function fieldStylesPaddingControl(defaultValue: string = FIELD_STYLES_INPUT_PADDING) {
	return {
		type: ControlType.Padding,
		title: "Padding",
		optional: true,
		// STYLES-INIT-EFFECTIVE: the caller's own effective padding default,
		// same constant the runtime resolver falls back to, so opening
		// Styles shows the field's real padding.
		defaultValue,
	};
}
// DECOR: Framer's NATIVE shadow control (ControlType.BoxShadow — not a
// custom-built one).
// SHADOW-FORM fix: the default MUST be a fully-parseable shadow value.
// The previous defaultValue "none" is not parseable as a shadow, so
// Framer materialized a corrupt "Mixed" row (empty editor, zeroed
// fields) that shadowed real values until manually deleted. This
// transparent zero-offset/zero-blur shadow parses into clean fields,
// renders identically to no shadow, and the runtime treats it exactly
// like "none" (see isNoShadow).
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
function fieldStylesShadowControl() {
	return {
		type: ControlType.BoxShadow,
		title: "Shadow",
		defaultValue: NO_SHADOW_VALUE,
	};
}
// DECOR: backdrop-blur only (not the full CSS filter set — blurring the
// element itself, hue/saturate/invert etc. have no booking-UI use case;
// backdrop blur gives the frosted-glass panel over imagery). Number, so
// the materialized 0 is provably off (numbers honor defaults).
function fieldStylesBackgroundBlurControl() {
	return {
		type: ControlType.Number,
		title: "BG Blur",
		optional: true,
		min: 0,
		max: 40,
		step: 1,
		unit: "px",
		defaultValue: 0,
	};
}
// DECOR runtime: shadow applies only for a real shadow value — the
// transparent-zero default (see NO_SHADOW_VALUE), "none", "" and unset
// all mean "no shadow layer", which keeps state rings
// (selected/hover/focus boxShadows) intact and makes unopened groups
// zero-impact.
function shadowStyle(shadow: string | undefined): React.CSSProperties {
	return !isNoShadowValue(shadow) && shadow && shadow.trim()
		? { boxShadow: shadow }
		: {};
}
// DECOR runtime: backdrop blur applies only above 0px (both the standard
// property and the WebKit-prefixed one Safari still needs).
function backdropStyle(px: number | undefined): React.CSSProperties {
	return typeof px === "number" && px > 0
		? {
				backdropFilter: `blur(${px}px)`,
				WebkitBackdropFilter: `blur(${px}px)`,
			}
		: {};
}

function makeInputFieldStylesControls() {
	// Per-type effective defaults: text/select use INPUT_PADDING, textarea same.
	// Using the shared helper keeps one reusable mechanism, not per-field hacks.
	const eff = getFieldStylesEffectiveDefaults("text");
	return {
		// STYLES-ORDER: Label Font first, input Font second (author
		// expectation — the label is what they look at first).
		labelFont: fieldStylesFontControl("Label Font", {
			fontSize: "13px",
			variant: "Medium",
			lineHeight: 1.6,
		}),
		font: fieldStylesFontControl("Font", {
			fontSize: "14px",
			variant: "Regular",
		}),
		labelColor: fieldStylesColorControl("Label Color"),
		textColor: fieldStylesColorControl("Text Color"),
		placeholderColor: fieldStylesColorControl("Placeholder Color"),
		backgroundColor: fieldStylesColorControl("Background"),
		border: fieldStylesBorderControl(),
		// STYLES-ORDER: Focus Border sits directly after Border (it
		// modifies the border on focus), never after Padding.
		focusBorderColor: fieldStylesColorControl("Focus Border"),
		radius: fieldStylesRadiusControl(),
		padding: fieldStylesPaddingControl(),
		// HEIGHT-REMOVED: no Height row — field height is hardcoded to
		// 23px at the consumption sites and grown via Padding only.
		// (A stored `minHeight` from an older canvas is still honored
		// as legacy; new instances can no longer set one.)
		shadow: fieldStylesShadowControl(),
		backgroundBlur: fieldStylesBackgroundBlurControl(),
		spacing: fieldStylesNumberControl("Gap", 0, 24, eff.spacing),
	};
}

function makeVariantChoiceStylesControls(
	variant: "select" | "segmented" | "pills" | "cards" | "radio",
) {
	// One reusable factory for every choice-based Styles set: the numeric
	// and compound defaults are this variant's own effective defaults (the
	// same constants the runtime resolvers fall back to), so activating
	// Styles materializes the inherit look and only an author-entered value
	// becomes an override. Cards (10px 8px), pills (10px 12px, 999px),
	// segmented (11px 10px) and select/radio (14px) each keep their
	// own real values here instead of sharing one generic set. Explicit 0
	// is preserved via ?? checks.
	const eff = getFieldStylesEffectiveDefaults(variant);
	return {
		// STYLES-ORDER: Label Font first (see makeInputFieldStylesControls).
		labelFont: fieldStylesFontControl("Label Font", {
			fontSize: "13px",
			variant: "Medium",
			lineHeight: 1.6,
		}),
		font: fieldStylesFontControl("Font", {
			fontSize: "14px",
			variant: "Regular",
		}),
		labelColor: fieldStylesColorControl("Label Color"),
		textColor: fieldStylesColorControl("Text Color"),
		backgroundColor: fieldStylesColorControl("Background"),
		border: fieldStylesBorderControl(),
		radius: fieldStylesRadiusControl(eff.radius),
		padding: fieldStylesPaddingControl(eff.padding),
		// HEIGHT-REMOVED: no Height row — field height is hardcoded to
		// 23px at the consumption sites and grown via Padding only.
		// (A stored `minHeight` from an older canvas is still honored
		// as legacy; new instances can no longer set one.)
		shadow: fieldStylesShadowControl(),
		backgroundBlur: fieldStylesBackgroundBlurControl(),
		spacing: fieldStylesNumberControl("Gap", 0, 24, eff.spacing),
		selectedBackgroundColor: fieldStylesColorControl("Selected BG"),
		selectedTextColor: fieldStylesColorControl("Selected Text"),
		selectedBorderColor: fieldStylesColorControl("Selected Border"),
	};
}

function makeCheckboxFieldStylesControls() {
	const eff = getFieldStylesEffectiveDefaults("checkbox");
	return {
		labelFont: fieldStylesFontControl("Label Font", {
			fontSize: "14px",
			variant: "Regular",
			lineHeight: 1.6,
		}),
		labelColor: fieldStylesColorControl("Label Color"),
		accentColor: fieldStylesColorControl("Accent"),
		checkSize: fieldStylesNumberControl("Size", 12, 32, eff.minHeight),
		shadow: fieldStylesShadowControl(),
		backgroundBlur: fieldStylesBackgroundBlurControl(),
		spacing: fieldStylesNumberControl("Gap", 0, 24, eff.spacing),
	};
}

function makeCalendarFieldStylesControls() {
	const eff = getFieldStylesEffectiveDefaults("calendar-widget");
	return {
		backgroundColor: fieldStylesColorControl("Background"),
		radius: fieldStylesRadiusControl(eff.radius),
		padding: fieldStylesPaddingControl(eff.padding),
		shadow: fieldStylesShadowControl(),
		backgroundBlur: fieldStylesBackgroundBlurControl(),
	};
}

// BUTTON-GROUPS: one reusable factory for every button's rows — Text
// first (fixes the "Continue/Continue" confusion: the row is now titled
// "Text" and holds "Continue"), then the same style vocabulary as field
// Styles. Compound/numeric defaults are the button's own effective
// values (four-value padding — PADDING-FOUR-VALUE — or Framer drops them
// to 0 on activation); color keys stay default-free so unset buttons
// track the live theme tokens (rules 90/93/96/98).
// BUTTON-INTERACTION: shared rows for the Hover / Pressed submenus —
// deltas over the button's base style (unset = same as base). Scale and
// opacity materialize as provable no-ops (1); colors stay default-free
// like every color row. `borderDefaultColor` is the button's OWN base
// border color: the hover Border default is {width 0 + this color}, so
// the value is always fully parseable (an empty-string color
// materializes as a corrupt "Mixed" row — same saga as the shadow
// "none"). Width 0 keeps the base border regardless of color.
function makeButtonInteractionControls(borderDefaultColor: string) {
	return {
		// Transition FIRST (author expectation): Framer's native
		// transition control, driving the animation into this state.
		// Default mirrors the pre-interaction feel (.15s ease-out).
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
		// Full Framer Border submenu, like the base button Border —
		// NOT color-only. Width 0 (the default) keeps the button's
		// normal border (see applyButtonInteraction); set 1+ to
		// override color/width/style in this state.
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
function makeButtonGroupControls(defaults: {
	text: string;
	padding: string;
	borderWidth: number;
	borderColor: string;
}) {
	return {
		text: {
			type: ControlType.String,
			title: "Text",
			defaultValue: defaults.text,
		},
		textColor: fieldStylesColorControl("Text Color"),
		backgroundColor: fieldStylesColorControl("Background"),
		border: fieldStylesBorderControl({
			borderWidth: defaults.borderWidth,
			borderStyle: "solid",
			borderColor: defaults.borderColor,
		}),
		radius: fieldStylesRadiusControl("12px"),
		padding: fieldStylesPaddingControl(defaults.padding),
		font: fieldStylesFontControl("Font", {
			fontSize: "14px",
			variant: "Semibold",
		}),
		shadow: fieldStylesShadowControl(),
		backgroundBlur: fieldStylesBackgroundBlurControl(),
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

interface ButtonRoleDefaults {
	background: string;
	color: string;
	borderWidth: number;
	borderColor: string;
	padding: string;
}

// BUTTON-GROUPS resolver: unset keys fall back to the role defaults
// (live theme tokens), so untouched buttons render exactly as before
// and track theme edits; explicit values (incl. 0) apply — `??` for
// numbers, `||` for colors where "" means unset (rule-96-blessed).
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
		// DECOR: shadow/blur layers ride along only when configured —
		// unopened groups (and "none"/0) leave the surface untouched.
		...shadowStyle(group?.shadow),
		...backdropStyle(group?.backgroundBlur),
	};
}

// BUTTON-INTERACTION runtime: pressed wins over hover; both are deltas
// over the resolved base. Untouched (undefined) state objects return the
// base style object untouched — zero behavior change for existing
// canvases. Border override replaces the shorthand wholesale (width 0 =
// inherit base); style/color fall back to the base border's own parts
// (splitBorderParts), then button text.
// BUTTON-INTERACTION transition: Framer's native Transition value
// drives the inline-style swap (inline styles cannot run springs, so
// spring/physics types resolve to their timed equivalent — duration
// honors the author's value, easing falls back to ease). Maps
// duration/ease/delay onto the six animated properties.
const INTERACTION_ANIMATED_PROPS = [
	"background-color",
	"border-color",
	"box-shadow",
	"color",
	"opacity",
	"transform",
];
// BUTTON-INTERACTION border: our own resolved `border` strings always
// have exactly three parts (width style color) or are "none", so this
// split is total for values we generate — never parse author CSS here.
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
	// Exit timing: while leaving hover, the hover config still governs
	// the way back; pressed falls back to hover timing, then the default.
	const t = state.pressed
		? (pressed?.transition ?? hover?.transition)
		: hover?.transition;
	const out: React.CSSProperties = { ...base };
	if (st) {
		if (st.backgroundColor) out.background = st.backgroundColor;
		if (st.textColor) out.color = st.textColor;
		// Full Border submenu: width 0 (the default) keeps the base
		// border entirely. A positive width replaces it wholesale —
		// style/color fall back to the base border's own parts, then to
		// the button text, so setting only "width 2" keeps the current
		// look but thicker instead of snapping to an arbitrary color.
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
	// The merge always owns `transition` (it replaces the old per-site
	// opacity-only lines): untouched buttons get the harmless full-list
	// default, configured states get their own timing.
	out.transition = interactionTransition(t, animate);
	return out;
}

// One interaction state per button (hovering Done must not light up the
// ICS link). Disabled native buttons never fire mouse events, so no
// disabled guard is needed — and :hover-less touch/keyboard users simply
// see the base style.
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

// BUTTON-GROUPS text: new group text wins, the legacy flat label keeps
// pre-grouping canvases' custom copy, then the shipped default. `||`
// (not `??`) so a materialized "" can never wipe a legacy custom label.
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
		// VALIDATION-REMOVED (rule 100): no Validation dropdown, no Minimum
		// Length, no Regex Pattern, no Test Input. Validation is inferred
		// from fieldType only, with fixed per-type caps hardcoded in the
		// engine (validateField/effectiveMaxLength) — never author-edited.
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
		// AUTHOR-DEFAULT-SELECTION: which option starts pre-selected for
		// the ChoiceGroup variants (segmented/pills/cards/radio). Scalar
		// + sibling-hidden like `options` (same Safety Rule #2 exception).
		// Empty keeps the historical first-option seed; a set value must
		// match an option label (or Option Values entry) — getInitialSelection
		// matches value-or-label and falls back to first on no match.
		// Native `select` is excluded on purpose: its placeholder/empty
		// state is the correct required-field UX (no auto-pass there).
		defaultOption: {
			type: ControlType.String,
			title: "Default Selected",
			defaultValue: "",
			placeholder: "Empty = first option",
			description:
				"Pre-selected option. Must match an option label or value; empty keeps the first option.",
			hidden: (p: FieldControlProps) =>
				p?.fieldType !== "segmented" &&
				p?.fieldType !== "pills" &&
				p?.fieldType !== "cards" &&
				p?.fieldType !== "radio",
		},
		// Scalar — safe to conditionally hide (Safety Rule #2).
		isPrimaryName: {
			type: ControlType.Boolean,
			title: "Primary Name",
			defaultValue: false,
			// T8-L1 fix: removed deprecated enabledTitle/disabledTitle.
			hidden: (p: FieldControlProps) => p?.fieldType !== "text",
		},
		// VALIDATION-REMOVED (rule 100): no Max Length control. The cap is
		// the built-in per-type value (see effectiveMaxLength) — text 250,
		// textarea 1000, email 254 (RFC 5321), phone 40 — never author-set.
		// T10-L4 fix: parallel image/description arrays for choice options,
		// aligned by index with `options`. Same narrow exception to Safety
		// Rule #2 as `options` itself (Array hidden by sibling fieldType).
		// W1-08-F-08-06 fix: `optionValues` follows the same exception/
		// pattern — see the scoped-exception note above `options`.
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
				type: ControlType.String,
				defaultValue: "",
				placeholder: "e.g. https://…/badge.png",
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
		// FIELD-STYLES (hard rule): the per-field Styles submenu. Object
		// controls share the title "Styles"; each is hidden for disjoint
		// type sets so the panel always shows exactly ONE Styles item per
		// field type, opening the control set that is meaningful for it.
		// Plain Object controls hidden by a sibling scalar are the
		// documented-safe conditional-visibility pattern (Safety Rule #2).
		// Calendar Widget gets exactly one too: `calendarStyles`
		// (Background/Radius/Padding — CAL-BG-OWNERSHIP).
		styles: {
			type: ControlType.Object,
			title: "Styles",
			buttonTitle: "Styles",
			icon: "effect",
			optional: true,
			controls: makeInputFieldStylesControls(),
			hidden: (p: FieldControlProps) => !isFieldStyleInputType(p?.fieldType),
		},
		choiceStyles: {
			type: ControlType.Object,
			title: "Styles",
			buttonTitle: "Styles",
			icon: "effect",
			optional: true,
			controls: makeVariantChoiceStylesControls("select"),
			hidden: (p: FieldControlProps) => p?.fieldType !== "select",
		},
		segmentedStyles: {
			type: ControlType.Object,
			title: "Styles",
			buttonTitle: "Styles",
			icon: "effect",
			optional: true,
			controls: makeVariantChoiceStylesControls("segmented"),
			hidden: (p: FieldControlProps) => p?.fieldType !== "segmented",
		},
		pillsStyles: {
			type: ControlType.Object,
			title: "Styles",
			buttonTitle: "Styles",
			icon: "effect",
			optional: true,
			controls: makeVariantChoiceStylesControls("pills"),
			hidden: (p: FieldControlProps) => p?.fieldType !== "pills",
		},
		cardsStyles: {
			type: ControlType.Object,
			title: "Styles",
			buttonTitle: "Styles",
			icon: "effect",
			optional: true,
			controls: makeVariantChoiceStylesControls("cards"),
			hidden: (p: FieldControlProps) => p?.fieldType !== "cards",
		},
		radioStyles: {
			type: ControlType.Object,
			title: "Styles",
			buttonTitle: "Styles",
			icon: "effect",
			optional: true,
			controls: makeVariantChoiceStylesControls("radio"),
			hidden: (p: FieldControlProps) => p?.fieldType !== "radio",
		},
		checkStyles: {
			type: ControlType.Object,
			title: "Styles",
			buttonTitle: "Styles",
			icon: "effect",
			optional: true,
			controls: makeCheckboxFieldStylesControls(),
			hidden: (p: FieldControlProps) => p?.fieldType !== "checkbox",
		},
		calendarStyles: {
			type: ControlType.Object,
			title: "Styles",
			buttonTitle: "Styles",
			icon: "color",
			optional: true,
			controls: makeCalendarFieldStylesControls(),
			hidden: (p: FieldControlProps) => p?.fieldType !== "calendar-widget",
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
			title: "Cal Field ID",
			defaultValue: "",
			placeholder: "e.g. pet-name",
			hidden: (p: FieldControlProps) => p?.fieldType === "calendar-widget",
		},
	};
}

// Review step removed per product decision: pre-booking review no longer exists.
// Success details are shown post-booking in the confirmation state. Only
// "form" and "datetime" (Calendar) remain as authorable step types.
function makeStepTypeControl(defaultType: StepType) {
	return {
		type: ControlType.Enum,
		title: "Step Type",
		options: ["form", "datetime"],
		optionTitles: ["Form", "Calendar"],
		defaultValue: (defaultType as string) === "review" ? "form" : defaultType,
		displaySegmentedControl: true,
	};
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
	};
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
			// BUTTON-GROUPS: one group per button — Text first (this ends
			// the old "Continue/Continue" confusion: the row is titled
			// "Text" and holds "Continue"), then the full style set with
			// the button's own effective defaults. Every group is
			// optional: unopened renders exactly as before.
			continueButton: {
				type: ControlType.Object,
				title: "Continue",
				buttonTitle: "Continue",
				icon: "object",
				optional: true,
				controls: makeButtonGroupControls({
					text: "Continue",
					padding: "10px 22px 10px 22px",
					borderWidth: 0,
					borderColor: FIELD_STYLES_BORDER_COLOR,
				}),
			},
			finalActionButton: {
				type: ControlType.Object,
				title: "Final Action",
				buttonTitle: "Final Action",
				icon: "object",
				optional: true,
				controls: makeButtonGroupControls({
					text: "Book Now",
					padding: "10px 22px 10px 22px",
					borderWidth: 0,
					borderColor: FIELD_STYLES_BORDER_COLOR,
				}),
			},
			backButton: {
				type: ControlType.Object,
				title: "Back",
				buttonTitle: "Back",
				icon: "object",
				optional: true,
				controls: makeButtonGroupControls({
					text: "Back",
					padding: "10px 18px 10px 18px",
					borderWidth: 1,
					borderColor: FIELD_STYLES_BORDER_COLOR,
				}),
			},
			// SYN-03 fix: cancel affordance during an in-flight submission.
			// The button only appears while the booking POST is in flight;
			// clicking it aborts the request and returns to the review step.
			cancelButton: {
				type: ControlType.Object,
				title: "Cancel",
				buttonTitle: "Cancel",
				icon: "object",
				optional: true,
				controls: makeButtonGroupControls({
					text: DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL,
					padding: "10px 18px 10px 18px",
					borderWidth: 1,
					borderColor: FIELD_STYLES_BORDER_COLOR,
				}),
			},
			// NAV-GROUP-TOGGLE: the grouping control belongs to the
			// navigation buttons, so it lives inside the Buttons group.
			// Default Split (Back far left, primary action far right);
			// opt-in Grouped places them side-by-side (AGENTS.md hard rule).
			groupNavButtons: {
				type: ControlType.Boolean,
				title: "Layout",
				defaultValue: false,
				enabledTitle: "Grouped",
				disabledTitle: "Split",
			},
			// CONFIRM-ACTIONS: confirmation-state buttons. Same group
			// as every other button — no standalone group.
			doneButton: {
				type: ControlType.Object,
				title: "Done",
				buttonTitle: "Done",
				icon: "object",
				optional: true,
				controls: makeButtonGroupControls({
					text: DEFAULT_COPY_RETURN_HOME_LABEL,
					padding: "10px 18px 10px 18px",
					borderWidth: 1,
					borderColor: FIELD_STYLES_BORDER_COLOR,
				}),
			},
			bookAnotherButton: {
				type: ControlType.Object,
				title: "Book Another",
				buttonTitle: "Book Another",
				icon: "object",
				optional: true,
				controls: makeButtonGroupControls({
					text: DEFAULT_CONFIRM_BOOK_ANOTHER_LABEL,
					padding: "10px 18px 10px 18px",
					borderWidth: 0,
					borderColor: FIELD_STYLES_BORDER_COLOR,
				}),
			},
			addToCalendarButton: {
				type: ControlType.Object,
				title: "Add to Calendar",
				buttonTitle: "Add to Calendar",
				icon: "object",
				optional: true,
				controls: makeButtonGroupControls({
					text: DEFAULT_CONFIRM_ADD_TO_CALENDAR_LABEL,
					padding: "10px 18px 10px 18px",
					borderWidth: 1,
					// Baked Accent default (#0066BB, same as the Accent
					// control default) — the live Accent token applies
					// while untouched; see the factory comment.
					borderColor: "#0066BB",
				}),
			},
			// HOME-URL-REMOVED: no destination control — "Done" always
			// navigates to the website root (DEFAULT_CONFIRM_HOME_URL).
		},
	},

	// ----- Progress (grouped, like Buttons/Styles) -----
	progressBar: {
		type: ControlType.Object,
		title: "Progress",
		icon: "object",
		buttonTitle: "Progress",
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
				defaultValue: "dashed",
				displaySegmentedControl: true,
			},
		},
	},
	// ----- Styles (one light/default semantic palette; no Theme selector) -----
	styles: {
		type: ControlType.Object,
		title: "Styles",
		icon: "color",
		buttonTitle: "Styles",
		controls: {
			accentColor: {
				type: ControlType.Color,
				title: "Accent",
				// Default accent. Assign a Framer Color Variable here to
				// let a site-level theme drive it (the engine itself is
				// theme-agnostic and renders this value verbatim).
				defaultValue: "#0066BB",
			},
			// PRIMARY-FOREGROUND: semantic On-Primary token. Independent of
			// Accent — no contrast math, no auto-correction, no validation
			// (AGENTS.md hard rules). Pairing Primary + Primary Foreground is
			// the author's choice; the component renders both verbatim.
			accentForegroundColor: {
				type: ControlType.Color,
				title: "Primary Foreground",
				defaultValue: "#FFFFFF",
			},
			// COLOR-SYSTEM (rule 90): there is deliberately NO Background
			// control — the engine root is transparent by design (the Framer
			// frame provides the page background) and the Calendar owns its
			// own surface (CAL-BG-OWNERSHIP). A Background control here was
			// a duplicate/conflicting mapping: its only consumer was the
			// border pre-blend, i.e. a control named Background controlling
			// a border. Border is its own authored control below.
			surfaceColor: {
				type: ControlType.Color,
				title: "Surface",
				defaultValue: "#F7F8FA",
			},
			// COLOR-SYSTEM: "Text" is the single base text color. Text
			// Secondary is derived from it internally (fixed 0.62 alpha) —
			// there is no second text control and no replacement for the
			// removed ones (see AGENTS.md rule 90).
			textPrimaryColor: {
				type: ControlType.Color,
				title: "Text",
				defaultValue: "#111827",
			},
			// BORDER (rule 90): the one border token, rendered verbatim
			// everywhere a border is drawn. There is deliberately NO
			// Background control (transparent root, calendar-owned surface)
			// and NO Error control (fixed internal #DC2626).
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
			// FIELD-GAP (hard rule): spacing between fields in the field
			// grid. Default 16px, range 0–32px, step 1px. Single source of
			// truth for the field-grid vertical spacing — no other gap
			// control exists and no hard-coded value remains (AGENTS.md).
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
		},
	},
	font: {
		type: ControlType.Font,
		title: "Body Font",
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
	// Per-surface heading typography (step + success + error titles).
	// Body text keeps the control above; buttons keep their per-button
	// Font rows. Defaults equal the previous hardcoded titles.
	headingFont: {
		type: ControlType.Font,
		title: "Heading Font",
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

	// ----- Animation -----
	transitionVariant: {
		type: ControlType.Enum,
		title: "Transition Type",
		options: ["fadeRise", "blurScale", "slide", "zoom", "verticalSlide", "blurSlide"],
		optionTitles: ["Fade Rise", "Blur Scale", "Slide", "Zoom", "Vertical Slide", "Blur Slide"],
		defaultValue: "blurScale",
	},
	transition: {
		type: ControlType.Transition,
		title: "Transition",
		defaultValue: {
			type: "tween",
			ease: [0.44, 0, 0.56, 1],
			duration: 0.4,
		},
	},

	// ----- Copy (configurable terminal-state strings) -----
	copy: {
		type: ControlType.Object,
		title: "Copy",
		icon: "object",
		buttonTitle: "Copy",
		controls: {
			// CONFIRM-COPY: heading carries the outcome ("Successfully"),
			// subtitle carries the next step — the two never repeat the
			// same message (see AGENTS.md).
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
				placeholder: "Email, phone, or https://… support link",
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
			// DEAD CONTROL REMOVAL (rule 8): Time Zone Select had zero
			// runtime reads — the zone is auto-detected, never manual.
			// W1-10-N3 fix: group label for the 12h/24h toggle.
			timeFormatLabel: {
				type: ControlType.String,
				title: "Time Format Toggle Label",
				defaultValue: DEFAULT_COPY_TIMEFORMAT_LABEL,
			},
			// DEAD CONTROL REMOVAL (rule 8): Detected Time Zone Prefix
			// had zero runtime reads — same auto-detect rationale.
			// DEAD CONTROL REMOVAL (rules 4/5/7): the privacy-notice,
			// required-fields-hint, saved-answers, save-failed, character-
			// count and required-marker controls were removed with their
			// (never-rendered) copy — the component is hard-ruled against
			// rendering those features, so the controls only promised
			// output that could never appear. No replacement exists.
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
			// DEAD CONTROL REMOVAL (rules 4/5/7) — see the note above
			// availabilityErrorLabel: privacyNotice, requiredFieldsHint,
			// savedAnswersLabel, clearSavedAnswersLabel, saveFailedMessage,
			// characterCountTemplate and requiredFieldMarker are gone;
			// neither the controls nor their copy remain.
			// CONFIRM-ACTIONS: the "Done" label moved to the Buttons group
			// (Done group) — see the Buttons group.
			// W1-02-F9–F23 fix (bundle 14): the remaining visitor-facing
			// strings. Defaults share the same constants the runtime
			// fallbacks use (see the W1-02-F24 note above the constants).
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
			editLabel: {
				type: ControlType.String,
				title: "Edit",
				defaultValue: DEFAULT_COPY_EDIT_LABEL,
			},
			pickDateToSeeTimesLabel: {
				type: ControlType.String,
				title: "Pick A Date Hint",
				defaultValue: DEFAULT_COPY_PICK_DATE_TO_SEE_TIMES_LABEL,
				displayTextArea: true,
			},
			noTimesFallbackLabel: {
				type: ControlType.String,
				title: "No Times Fallback",
				defaultValue: DEFAULT_COPY_NO_TIMES_FALLBACK_LABEL,
				displayTextArea: true,
			},
			selectOptionLabel: {
				type: ControlType.String,
				title: "Select Placeholder",
				defaultValue: DEFAULT_COPY_SELECT_OPTION_LABEL,
			},
			stepProgressLabel: {
				type: ControlType.String,
				title: "Step Progress",
				defaultValue: DEFAULT_COPY_STEP_PROGRESS_TEMPLATE,
			},
			// W1-02-F4/F6/F7 fix: announcement template, counter format
			// and required marker are author-localizable.
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
			amLabel: {
				type: ControlType.String,
				title: "AM Suffix",
				defaultValue: DEFAULT_COPY_AM_LABEL,
			},
			pmLabel: {
				type: ControlType.String,
				title: "PM Suffix",
				defaultValue: DEFAULT_COPY_PM_LABEL,
			},
			// ICS-INTERNALS-REMOVED (rule 26): Product ID + Summary
			// Fallback are protocol constants, not configuration — reads
			// fall back to DEFAULT_COPY_ICS_* (function defaults agree).
			// icsLocationLabel stays: real author content (FINAL-06).
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
			hourSuffix: {
				type: ControlType.String,
				title: "Hour Suffix",
				defaultValue: DEFAULT_COPY_HOUR_SUFFIX,
			},
			minuteSuffix: {
				type: ControlType.String,
				title: "Minute Suffix",
				defaultValue: DEFAULT_COPY_MINUTE_SUFFIX,
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
			// DEMO-REMOVED: Demo Start/End/Interval controls deleted — the
			// no-Cal.com fallback grid always runs 09:00–17:00 at 30min
			// (DEFAULT_DEMO_*). A demo-grid tuner is not site-owner
			// configuration; reads below fall back to the constants.
			// W1-02-F9 fix: accessibility names behind one nested group,
			// mirroring the `validation` group. The month-nav templates'
			// {month} placeholder is replaced with the target month name.
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
			// W1-02-F4–F8 fix (bundle 17): every Cal.com error surface is
			// editable here; defaults mirror ERROR_COPY_DEFAULTS exactly so
			// the panel state matches the engine's built-in behavior until
			// an author changes a field.
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
					// W1-06-F-06-1 fix: author-facing controls for the two
					// new copy tokens (malformed body / 400-class) so the
					// 100%-customizable principle holds for them too.
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
					customRegexError: {
						type: ControlType.String,
						title: "Custom Regex Mismatch",
						defaultValue: DEFAULT_VALIDATION_COPY.customRegexError,
					},
					invalidRegexError: {
						type: ControlType.String,
						title: "Invalid Custom Regex",
						defaultValue: DEFAULT_VALIDATION_COPY.invalidRegexError,
					},
					// VALIDATION-REMOVED (rule 100): no Min Length control.
					// The minimum is fixed in code (3 for text/textarea) —
					// never author-set.
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
		// CONFIRM-CRED-PLACEHOLDER: tells the author where the key comes
		// from without shipping a real-looking credential.
		placeholder: "Paste a key from Cal.com Settings → Developer",
	},
	calEventTypeId: {
		type: ControlType.String,
		title: "Cal.com Event ID",
		defaultValue: "",
		placeholder: "The number in your event type URL",
	},
	// TZ-TIME-HARD-RULE: the "Initial Time Format" control was removed — the
	// 12h/24h format always defaults to 12h and is toggled by the END USER on
	// the live widget (see AGENTS.md).
	//
	// TZ-TIME-HARD-RULE: the "Time Zones" list control was removed — the time
	// zone is always auto-detected from the visitor's browser in code. No
	// author list, no manual time-zone picker, no Framer user exposure (see
	// AGENTS.md).
	//
	// W1-02-F26 fix: Cal.com v2 API base URL — lets self-hosted Cal.com
	// deployments use the engine. Trailing slashes are stripped at use.
	// (Self-hosted Cal.com support is still being evaluated; keep this
	// control for now.)
	calApiBaseUrl: {
		type: ControlType.String,
		title: "Cal.com API Base URL",
		defaultValue: DEFAULT_CAL_API_BASE_URL,
	},
	// LOCALE-REMOVED: the `locale` author override was removed: date
	// formatting always follows <html lang>, then the browser default
	// (see AGENTS.md).
	//
	// SESSION-KEY-REMOVED: the `sessionStorageKey` author control was
	// removed: the base autosave key is always "booking-engine:session",
	// namespaced per instance by DOM position (see AGENTS.md).
	// DURATION-SOURCE (hard rule): the "Default Meeting Duration (ms)"
	// Property Control is removed — Cal.com event metadata is the single
	// source of truth for duration. No renamed/replacement fallback
	// control exists.
	// HOME-URL-REMOVED: the former "Return Home URL" / "Home URL"
	// controls are gone by author direction — "Done" always navigates to
	// the website root (DEFAULT_CONFIRM_HOME_URL). Same explicit
	// visitor-action behavior — no auto-redirect (see AGENTS.md).
});

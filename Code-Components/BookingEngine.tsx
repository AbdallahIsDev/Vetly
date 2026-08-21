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
	AnimatePresence,
	MotionConfig,
	motion,
	type Transition,
	usePresence,
	useReducedMotion,
} from "framer-motion";
import * as React from "react";

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
function parseColorToRgba(
	color: string,
): { r: number; g: number; b: number; a: number } | null {
	const trimmed = (color || "").trim().toLowerCase();
	if (!trimmed) return null;
	// W1-17-N1-new fix: "transparent" is a spec-valid CSS colour the old
	// fall-through returned null for (callers treated null as "invalid").
	// Map it to fully-opaque-black-with-zero-alpha.
	if (trimmed === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
	// W1-17-N2-new fix: currentColor resolves against context and is
	// never known statically; it now has its own early return so callers
	// can tell "contextual, cannot be judged" apart from "invalid".
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
		if (tokens[0].endsWith("rad")) {
			hue = (hue * 180) / Math.PI;
		} else if (tokens[0].endsWith("turn")) {
			hue = hue * 360;
		} else if (tokens[0].endsWith("grad")) {
			hue = (hue * 360) / 400;
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
	return `color-mix(in srgb, ${color} ${safeAlpha * 100}%, transparent)`;
}

// T5-L8 fix: date formatting should follow the page's declared language
// (<html lang>), not the browser's default locale - they can differ (e.g. a
// German site visited from a browser set to English). Falls back to the
// browser default when the page declares no lang.
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
const DEFAULT_COPY_SELECT_OPTION_LABEL = "Select an option…";
const DEFAULT_COPY_STEP_PROGRESS_TEMPLATE = "{pct}% complete";
const DEFAULT_COPY_UNKNOWN_ERROR_LABEL = "Unknown error";
const DEFAULT_COPY_SUBMIT_ERROR_FALLBACK =
	"Something went wrong while submitting your booking. Please try again.";
const DEFAULT_COPY_AM_LABEL = "AM";
const DEFAULT_COPY_PM_LABEL = "PM";
const DEFAULT_COPY_ICS_PRODID = "//BookingEngine//Framer//EN";
const DEFAULT_COPY_ICS_SUMMARY_FALLBACK = "Booking";
const DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL = "Selected Time";
const DEFAULT_COPY_NOTES_DATE_PREFIX = "Date: ";
const DEFAULT_COPY_NOTES_TIME_PREFIX = "Time: ";
const DEFAULT_COPY_STEP_COUNTER_TEMPLATE = "Step {current} of {total}";
// W1-10-N3 fix: group label for the 12h/24h time-format toggle.
const DEFAULT_COPY_TIMEFORMAT_LABEL = "Time format";
// W1-10-N4 fix: live-region template announced when a slot is picked.
// `{time}` is replaced with the slot's formatted label.
const DEFAULT_COPY_TIME_SLOT_SELECTED_TEMPLATE = "{time} selected";
const DEFAULT_DEMO_START_TIME = "09:00";
const DEFAULT_DEMO_END_TIME = "17:00";
const DEFAULT_DEMO_INTERVAL = 30;
// SYN-02 fix: persistence-disclosure strings (rendered when persistState is
// ON) now live behind the copy panel instead of inline JSX literals.
const DEFAULT_COPY_SAVED_ANSWERS_LABEL = "Answers are saved in this browser.";
const DEFAULT_COPY_CLEAR_SAVED_ANSWERS_LABEL = "Clear my saved answers";
const DEFAULT_COPY_SAVE_FAILED_MESSAGE =
	"Progress couldn't be saved to this browser (storage full). Your answers this session are unaffected.";
// W1-12-NEW-4 fix: when persistState is ON the disclosure must never go
// blank — an author can empty the `privacyNotice` control and create a
// fresh-mount consent gap. This fallback keeps a disclosure on record
// whenever storage is active and the author text is empty.
const DEFAULT_COPY_PRIVACY_NOTICE =
	"Your progress is saved in this browser tab so you can return later.";
// W1-02-F4 fix: sr-only step announcement — was a hardcoded
// "{counter}, {percent}% complete — {title}" that diverged from the
// localized visible progress label. Placeholders: {counter}, {percent},
// {title}.
const DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE =
	"{counter}, {percent}% complete — {title}";
// W1-02-F6 fix: character-counter format ({current}/{max}).
const DEFAULT_COPY_CHARACTER_COUNT_TEMPLATE = "{current}/{max}";
// W1-02-F7 fix: required-field marker (some designs prefer "(required)").
const DEFAULT_COPY_REQUIRED_FIELD_MARKER = "*";
// W1-02-F5 fix: the success-screen "Done" link and the font-stack fallback
// were inline literals; now shared constants the schema and runtime share.
const DEFAULT_COPY_RETURN_HOME_LABEL = "Done";
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
// firstAvailableDate, dateTabIndexByKey) are all correct for any
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
	}, []);

	// W1-11-A11 fix: the window listeners below were duplicated here,
	// re-implementing the shared T7-M3 `useKeyboardModality` hook.
	// W1-11-NEW-FIND-2 fix: that hook (and this call) is gone now —
	// focus indication comes from the CSS :focus-visible rule alone.

	// W1-11-NEW-FIND-2 fix: focus indication is standardized on the CSS
	// `:focus-visible` rule (`.be-motion-root :is(button, a, select)`) —
	// the per-component inline boxShadow focus rings (this one keyed on
	// isKeyboardModality) were removed. The selection ring below stays:
	// it marks SELECTED state, not focus.
	// Fixed foreground for the selected option (rendered on the accent
	// background). A constant — never derived from the configured colours.
	const selectedTextColor = TEXT_ON_ACCENT;
	const compact = measuredWidth < COMPACT_BREAKPOINT;
	const effectiveFontSize = Math.max(14, fontSize);
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
			const nextIndex = (currentIndex + delta + count) % count;
			const next = parsedOptions[nextIndex];
			if (!next) return;
			buttonRefs.current[nextIndex]?.focus();
			React.startTransition(() => setFocusedIndex(nextIndex));
			selectOption(next);
		},
		[parsedOptions, selectOption],
	);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
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
				disabled={isSubmitting}
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
				// Fix #17: roving tabindex — only the selected (or first)
				// option is tabbable; Arrow keys move focus between options.
				tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
				// W1-08-F-08-06 fix: pass the option object (not just its
				// label) so selectOption resolves the `value` round-trip.
				onClick={() => selectOption(option)}
				onKeyDown={(event) => handleKeyDown(event, index)}
				onMouseEnter={() => React.startTransition(() => setHoveredIndex(index))}
				onMouseLeave={() => React.startTransition(() => setHoveredIndex(null))}
				onFocus={() => React.startTransition(() => setFocusedIndex(index))}
				onBlur={() => React.startTransition(() => setFocusedIndex(null))}
				style={{
					minHeight: TOUCH_TARGET_MIN,
					borderRadius: radius,
					border: `1px solid ${isSelected || isHovered ? accentColor : borderColor}`,
					background: isSelected ? accentColor : backgroundColor,
					color: isSelected ? selectedTextColor : textColor,
					cursor: isSubmitting ? "not-allowed" : "pointer",
					opacity: isSubmitting ? 0.5 : 1,
					// W1-11-NEW-FIND-1 fix: the inline `outline: "none"`
					// here outranked (by CSS specificity) the scoped
					// `.be-motion-root :is(button, a, select):focus-visible`
					// rule, so the ONLY focus indicator was the modal
					// boxShadow below — leaving a 1-frame window with NO
					// visible indicator while keyboard-modality detection
					// races. Removing it lets the CSS `:focus-visible`
					// outline provide the always-on keyboard ring
					// (currentColor adapts; pointer clicks stay clean
					// because :focus-visible doesn't match them).
					// W1-11-NEW-FIND-1 fix: the inline `outline: "none"`
					// here outranked (by CSS specificity) the scoped
					// `.be-motion-root :is(button, a, select):focus-visible`
					// rule; removing it lets the CSS `:focus-visible`
					// outline provide the always-on keyboard ring
					// (currentColor adapts; pointer clicks stay clean
					// because :focus-visible doesn't match them).
					// W1-11-NEW-FIND-2 fix: the inline boxShadow focus
					// indicator (gated on isKeyboardModality) was removed —
					// focus rings now come solely from that CSS rule. The
					// remaining ring marks SELECTED state only.
					boxShadow: isSelected
						? `inset 0 0 0 1px ${accentColor}`
						: "none",
					fontFamily: "inherit",
					fontSize: effectiveFontSize,
					lineHeight: 1.2,
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
						gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
						gap: compact ? 6 : 8,
						minWidth: 0,
					}}
				>
					{parsedOptions.map((option, index) =>
						renderOptionButton(option, index, {
							padding: compact ? "10px 6px" : "10px 8px",
							textAlign: "center",
						}),
					)}
				</div>
			) : null}
			{variant === "segmented" ? (
				<div
					role="radiogroup"
					aria-label={label || choiceGroupAriaLabel || inputName}
					aria-invalid={ariaInvalid || undefined}
					aria-describedby={ariaDescribedBy}
					aria-required={required || undefined}
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
						renderOptionButton(
							option,
							index,
							{
								flex: "1 0 auto",
								borderRadius: 0,
								border: "none",
								borderRight:
									index < parsedOptions.length - 1
										? `1px solid ${selectedIndex === index ? accentColor : borderColor}`
										: "none",
								padding: compact ? "10px 6px" : "10px 8px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 6,
								minWidth: 0,
							},
							{
								// T10-L2 fix: keep the full label in the scroll
								// row — truncation only returned when it wrapped.
								overflow: "visible",
								textOverflow: "clip",
								whiteSpace: "nowrap",
							},
						),
					)}
				</div>
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
							padding: "10px 14px",
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
							padding: compact ? "10px 10px" : "10px 12px",
							borderRadius: 999,
							// W1-19-F-06 fix: renamed (was PILLS_SINGLE_COLUMN_BREAKPOINT) — this is
							// the "two pills per row" threshold, not
							// a single-column one.
							flex:
								measuredWidth < PILLS_TWO_PER_ROW_BREAKPOINT
									? "1 1 calc(50% - 4px)"
									: "0 0 auto",
							minWidth:
								measuredWidth < PILLS_TWO_PER_ROW_BREAKPOINT
									? "calc(50% - 4px)"
									: "auto",
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
	isToday: boolean;
	isTodayHighlighted: boolean;
	isRingHover: boolean;
	tabIndex: number;
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
	isToday,
	isTodayHighlighted,
	isRingHover,
	tabIndex,
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
		<button
			type="button"
			role="gridcell"
			disabled={isUnavailable}
			// W1-10-OBS-5 fix: the parallel aria-disabled was redundant
			// with the native disabled attribute; removed.
			aria-selected={isSelected}
			// W1-10-A7 fix: mark the current date the machine-readable way
			// (aria-current="date") instead of only a textual suffix; the
			// "(Today)" suffix stays for the audible benefit.
			aria-current={isToday ? "date" : undefined}
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
			data-date-key={dateKey}
			tabIndex={isUnavailable ? -1 : tabIndex}
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
				minHeight: TOUCH_TARGET_MIN,
				// W1-19-N1 fix: the F-01 grid tracks shrink to ~33–39px on
				// ≤329px viewports; a hard 44px minWidth then overlaps the
				// next cell (which paints over it, shrinking the EFFECTIVE
				// target anyway). On narrow containers the track itself is
				// the honest target — drop the floor so cells stay their
				// real size and nothing is covered.
				minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN,
				// F-17-3 fix: was `6` — now the author's token.
				borderRadius,
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
				// W1-18-F1 fix: gated on prefers-reduced-motion.
				transition: reducedMotion
					? "none"
					: "background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, color 0.16s ease",
				// W1-11-NEW-FIND-2 fix: focus indication is standardized on
				// the CSS `:focus-visible` rule — the isKeyboardModality
				// boxShadow focus branch is gone; these rings mark STATE
				// (selected / today / hover), never focus.
				boxShadow:
					isSelected || isTodayHighlighted
						? `inset 0 0 0 1px ${accentColor}`
						: isRingHover
							? `inset 0 0 0 1px ${accentColor}`
							: "none",
				fontWeight: isTodayHighlighted && !isSelected ? 700 : 400,
			}}
		>
			{/* W1-07-F4 fix: the visible day-of-month must match the
                visitor-tz date the slots are bucketed under (CC-13
                getDateKeyInTimeZone); with the browser >12h ahead/behind,
                the old browser-local getDate() labeled "Dec 15" while
                showing Dec 14 slots. slice(-2) = the zero-padded day. */}
			{Number(getDateKeyInTimeZone(date, timeZone || "").slice(-2))}
		</button>
	);
});

interface CalendarGridProps {
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
	dateTabIndexByKey: Map<string, number>;
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
	dateTabIndexByKey,
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
	// W1-10-A9 / W2-28-F5 fix: the sr-only month/year live region must
	// not announce on first render — otherwise a screen reader spouts
	// "January 2026" on page load. Content stays empty until the visible
	// month label actually changes.
	const monthLabel = `${monthName} ${yearLabel}`;
	const prevMonthLabelRef = React.useRef(monthLabel);
	const [announceMonthLabel, setAnnounceMonthLabel] = React.useState(false);
	// W1-10-A4 fix: stable id linking the grid to its month/year heading
	// (aria-labelledby). SSR/hydration fix: Framer serves real browsers a
	// headless-prerendered HTML where effects have ALREADY run, so ANY
	// state/effect/useId-derived value mismatches the hydrating client's
	// first render (#425/#418/#422). This id is a plain constant — the
	// same in the prerender, in renderToString, and on the first client
	// render — so nothing derived from it can ever mismatch.
	const gridLabelId = "be-calendar-grid-label";
	useIsomorphicLayoutEffect(() => {
		if (prevMonthLabelRef.current !== monthLabel) {
			prevMonthLabelRef.current = monthLabel;
			setAnnounceMonthLabel(true);
		}
	}, [monthLabel]);
	const rows: React.ReactNode[] = [];
	for (let r = 0; r < CALENDAR_WEEKS_TO_RENDER; r++) {
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
					const isPast = startOfDay(date).getTime() < today.getTime();
					const isUnavailable = !isInMonth || isPast || !hasAvailability(date);
					const isSelected = isSameDay(selectedDate, date);
					const isToday = isSameDay(today, date);
					const isTodayHighlighted = isToday;
					const isRingHover =
						hoveredDateKey === dateKey &&
						!isUnavailable &&
						!isSelected &&
						!isTodayHighlighted;
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
							tabIndex={dateTabIndexByKey.get(dateKey) ?? 0}
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
                            calendar never heard the month change. The
                            visually-hidden sibling below only speaks the
                            authored announcement copy; this wrapper gives
                            the visible header itself status semantics. */}
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
						// W1-19-F-08 fix: a fixed 24px gutter wasted ~30% of
						// the header's width on narrow viewports — halved
						// below the compact breakpoint where the month
						// title needs the room.
						gap: isNarrow ? 12 : 24,
					}}
				>
					<button
						type="button"
						aria-label={previousMonthAriaTemplate.replace(
							"{month}",
							prevMonthLabel,
						)}
						onClick={() => onPrevMonth()}
						disabled={!canGoPrev}
						tabIndex={0}
						style={{
							appearance: "none",
							background: "transparent",
							color: canGoPrev ? textColor : mutedSoftText,
							border: "none",
							// F-17-3 fix: was 6.
							borderRadius,
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
						aria-label={nextMonthAriaTemplate.replace(
							"{month}",
							nextMonthLabel,
						)}
						onClick={() => onNextMonth()}
						disabled={!canGoNext}
						tabIndex={0}
						style={{
							appearance: "none",
							background: "transparent",
							color: canGoNext ? textColor : mutedSoftText,
							border: "none",
							// F-17-3 fix: was 6.
							borderRadius,
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
				{announceMonthLabel ? monthLabel : null}
			</div>

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
								opacity: 0.65,
								color: mutedText,
								padding: "4px 0",
								marginBottom: 8,
							}}
						>
							{label}
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
	loadingLabel: string;
	dtInstanceId: string;
	slotsLoading: boolean;
	selectedDate: Date | null;
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
				minHeight: TOUCH_TARGET_MIN,
				border: `1px solid ${hovered ? accentColor : borderColor}`,
				// F-17-3 fix: was `6` — now the author's token.
				borderRadius: radius,
				padding: isNarrow ? "10px 10px" : "10px 12px",
				background: selected ? accentColor : "transparent",
				color: elapsed
					? mutedSoftText
					: selected
						? selectedAccentText
						: textColor,
				fontSize: 14,
				cursor: elapsed ? "not-allowed" : "pointer",
				opacity: elapsed ? 0.5 : 1,
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis",
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
	// W1-16-P-13 fix: the first non-elapsed slot used to be re-found with
	// `.findIndex()` for every rendered slot (O(N²) per render — ~13k
	// comparisons for a 36-slot day); compute it once per render, then
	// compare against the map's index.
	const firstNonElapsedIndex = React.useMemo(
		() => timeOptions.findIndex((time) => !isTimeElapsed(time)),
		[timeOptions, isTimeElapsed],
	);
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
				? selectedDate.toLocaleDateString(pageLocale(), {
						weekday: "short",
						month: "short",
						day: "numeric",
					})
				: "",
		[selectedDate],
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
			{/* biome-ignore lint/a11y/useSemanticElements: a native <fieldset>
                        forces UA border chrome and min-inline-size: min-content, which
                        breaks this styled flex toggle. role="group" gives the same SR
                        grouping (see W1-10-N3) without the layout hazard. */}
			<div
				// W1-10-N3 fix: the 12h/24h toggle is a two-button
				// group — without role="group" + aria-label, SR users
				// heard bare "12h, toggle button, pressed" with no
				// clue what the buttons switch.
				role="group"
				aria-label={timeFormatLabel}
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
				{isStaticRender ? (
					<div
						style={{
							position: "absolute",
							top: 3,
							bottom: 3,
							// W1-18-F1 fix: position is the constant
							// `left: 3` baseline; the format switch is a
							// GPU-composited transform (translateX by one
							// thumb-width + 2px gap) instead of animating
							// `left`, which costs layout every frame.
							left: 3,
							width: "calc(50% - 6px)",
							transform:
								activeTimeFormat === "24h"
									? "translateX(calc(100% + 3px))"
									: "translateX(0)",
							borderRadius: 999,
							background: accentColor,
							boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
							pointerEvents: "none",
						}}
					/>
				) : (
					<motion.div
						initial={false}
						// W1-18-F1 fix: the slide animates a composited
						// transform (x = one thumb width + 3px gap) instead
						// of the layout property `left` — springs over
						// `left` re-layout every frame.
						animate={{
							x: activeTimeFormat === "24h" ? "calc(100% + 3px)" : 0,
						}}
						transition={
							prefersReducedMotion ? INSTANT_TRANSITION : TIME_TOGGLE_TRANSITION
						}
						style={{
							position: "absolute",
							top: 3,
							bottom: 3,
							left: 3,
							width: "calc(50% - 6px)",
							borderRadius: 999,
							background: accentColor,
							boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
							pointerEvents: "none",
						}}
					/>
				)}
				{(["12h", "24h"] as Array<"12h" | "24h">).map((format) => {
					const active = activeTimeFormat === format;
					return (
						<button
							key={format}
							ref={(node) => {
								formatButtonRefs.current[format] = node;
							}}
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
									setActiveTimeFormat(format);
									onTimeFormatChange?.(format);
								})
							}
							// W1-11-NEW-FIND-3 fix: ArrowLeft/ArrowRight move
							// focus between the two format buttons (Home/End
							// per the radio-group convention), consistent with
							// the engine's other button groups.
							onKeyDown={(e) => {
								const next = e.key === "ArrowRight" ? "24h" : null;
								const prev = e.key === "ArrowLeft" ? "12h" : null;
								const home = e.key === "Home" ? "12h" : null;
								const end = e.key === "End" ? "24h" : null;
								const target = next ?? prev ?? home ?? end;
								if (!target) return;
								e.preventDefault();
								formatButtonRefs.current[target]?.focus();
							}}
							onFocus={() =>
								React.startTransition(() => setFocusedKey(`format-${format}`))
							}
							onBlur={() => React.startTransition(() => setFocusedKey(null))}
							style={{
								flex: 1,
								// T5-L1 fix: 38px was under the 44x44px minimum
								// touch-target size.
								minHeight: TOUCH_TARGET_MIN,
								border: "none",
								borderRadius: 999,
								background: "transparent",
								color: active ? selectedAccentText : textColor,
								cursor: "pointer",
								fontFamily: "inherit",
								fontSize: 14,
								fontWeight: 600,
								// W1-18-F1 fix: gated on
								// prefers-reduced-motion (the
								// prop is already in scope).
								transition: prefersReducedMotion
									? "none"
									: "color 0.18s ease, box-shadow 0.18s ease",
								// W1-11-NEW-FIND-2 fix: focus ring comes from the
								// CSS :focus-visible rule; the isFocus boxShadow
								// indicator is gone.
								boxShadow: "none",
								position: "relative",
								zIndex: 1,
							}}
						>
							{format}
						</button>
					);
				})}
			</div>

			<div
				className="be-dt-scroll"
				style={{
					overflowY: "auto",
					maxHeight: 220,
					minWidth: 0,
					// W1-19-F-04 fix: the scrollbar was hidden
					// entirely (scrollbarWidth/msOverflowStyle +
					// a display:none ::-webkit-scrollbar rule), so a
					// scrollable list gave ZERO affordance that more
					// times exist below. Thin-but-visible scrollbars
					// on every engine now (WebKit rule in the
					// instance <style> block below).
					scrollbarWidth: "thin",
					msOverflowStyle: "auto",
				}}
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
							// M8 fix: was a single `1fr` column, so
							// any day with more than a handful of
							// slots turned into a long scroll inside
							// an already-short (220px) sidebar. Two
							// columns roughly halves that.
							gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
		</aside>
	);
});

// T7-M3 fix: keyboard-modality detection (focus rings only when the user is
// actually using a keyboard) used to live here as `useKeyboardModality`.
// W1-11-NEW-FIND-2 fix: it was removed entirely — focus indication now comes
// from the CSS `:focus-visible` rule (`.be-motion-root :is(button, a, select)`),
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
	React.useEffect(() => {
		if (!initialVisibleMonth) return;
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
	// re-focus the grid's "active" cell (tabIndex 1 — see
	// `dateTabIndexByKey`) once it exists.
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
	// tabIndex=1 active cell.
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
				rootRef.current?.querySelector<HTMLElement>('[tabindex="1"]');
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
		autoAdvancedMonthsRef.current += 1;
		goToNextMonth();
	}, [availableDates, slotsLoading, goToNextMonth]);

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
			const base = availableTimes.map((timeOption) => ({
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
			// W1-07-F3 fix: DST fall-back (e.g. 2026-11-01 NY) folds two
			// distinct UTC instants into the same wall label — two "01:00
			// AM" rows for what are actually different moments. Only real
			// Cal.com slots (ISO `value`) can collide (the demo grid's
			// minute steps can't); suffix the colliding rows with the
			// visitor-tz abbreviation per instant, e.g. "01:00 AM (EDT)"
			// vs "01:00 AM (EST)".
			if (timeZone && isValidTimeZone(timeZone)) {
				const labelCounts = new Map<string, number>();
				for (const item of base) {
					if (!item.value.includes("T")) continue;
					labelCounts.set(item.label, (labelCounts.get(item.label) || 0) + 1);
				}
				const abbrevOf = (instant: string): string | null => {
					try {
						const parts = getCachedDateTimeFormat("en", {
							timeZone,
							timeZoneName: "short",
						}).formatToParts(new Date(instant));
						const short = parts.find((p) => p.type === "timeZoneName")?.value;
						if (short) return short;
						// W1-07-F5 fix: an exotic engine can omit the
						// "short" zone name entirely — the old code then
						// produced "01:30 AM ()" with empty parens on the
						// DST fall-back collision branch. Fall back to the
						// UTC-offset suffix ("GMT-05:00" vs "GMT-06:00"),
						// which still disambiguates the folded instants.
						const longParts = getCachedDateTimeFormat("en", {
							timeZone,
							timeZoneName: "longOffset",
						}).formatToParts(new Date(instant));
						return (
							longParts.find((p) => p.type === "timeZoneName")?.value || null
						);
					} catch {
						return null;
					}
				};
				return base.map((item) =>
					item.value.includes("T") && (labelCounts.get(item.label) || 0) > 1
						? {
								...item,
								label: `${item.label} (${abbrevOf(item.value) || ""})`,
							}
						: item,
				);
			}
			return base;
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
	// Ticks once a minute, which is plenty granular for greying out a slot
	// list without re-rendering on every second.
	const [now, setNow] = React.useState<Date>(() => new Date());
	React.useEffect(() => {
		if (typeof window === "undefined") return;
		const id = window.setInterval(() => setNow(new Date()), 60000);
		return () => window.clearInterval(id);
	}, []);
	const isTimeElapsed = React.useCallback(
		(time: { value: string; minutes: number }) => {
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
interface DateAndTimeInlineProps {
	accentColor: string;
	backgroundColor: string;
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
	// W1-10-N4 fix: live-region template for slot picks.
	timeSlotSelectedTemplate: string;
}

const DateAndTimeInline = React.memo(function DateAndTimeInline(
	props: DateAndTimeInlineProps,
) {
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
		// W1-10-N4 fix: slot-pick announcement template.
		timeSlotSelectedTemplate,
	} = props;

	// M4 fix: `today` used to be memoized once with `[]` deps, so a booking
	// page left open past midnight kept treating yesterday as "today" —
	// showing the wrong date highlighted and letting a now-past date be
	// selected. Recompute at each local midnight instead, so a long-lived
	// session self-corrects without a page refresh.
	const [today, setToday] = React.useState<Date>(() =>
		getTodayInTimeZone(timeZone),
	);
	React.useEffect(() => {
		if (typeof window === "undefined") return;
		let timeoutId: number;
		const scheduleNext = () => {
			const now = new Date();
			// A few seconds past midnight, not exactly at it, so we're never
			// racing the clock rollover itself. The timer ticks on the
			// BROWSER's midnight; the value itself is tz-corrected by
			// getTodayInTimeZone, so a tz day-boundary that lands mid-day
			// self-corrects on the next tick (or a timeZone change).
			const nextMidnight = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() + 1,
				0,
				0,
				5,
			);
			timeoutId = window.setTimeout(() => {
				setToday(getTodayInTimeZone(timeZone));
				scheduleNext();
			}, nextMidnight.getTime() - now.getTime());
		};
		scheduleNext();
		return () => window.clearTimeout(timeoutId);
	}, [timeZone]);
	// Requirement 4: scoped id for this DateAndTimeInline instance's own
	// <style> block (hiding the time-list scrollbar needs a real CSS rule
	// for ::-webkit-scrollbar — inline styles can't target pseudo-elements).
	// SSR/hydration fix: plain constant (see gridLabelId) — the class and
	// the style-block selectors must be identical in the prerendered HTML,
	// renderToString HTML and the client's first render.
	const dtInstanceId = "be-dt-scroll";
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
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(
		() => initialDate ?? null,
	);
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

	// W1-10-N4 fix: mouse-clicking a slot only flipped aria-checked on the
	// focused element — keyboard users heard nothing either when re-picking
	// via pointer. Announce "{time} selected" into a polite live region,
	// skipping repeats of the same pick (a fresh region text is what makes
	// SRs speak).
	const [slotAnnouncement, setSlotAnnouncement] = React.useState<string | null>(
		null,
	);
	const announcedSlotRef = React.useRef<string | null>(null);
	const announceSlotPick = React.useCallback(
		(time: string) => {
			if (announcedSlotRef.current === time) return;
			announcedSlotRef.current = time;
			const opt = timeOptions.find((o) => o.value === time);
			if (opt) {
				setSlotAnnouncement(
					timeSlotSelectedTemplate.replace("{time}", opt.label),
				);
			}
		},
		[timeOptions, timeSlotSelectedTemplate],
	);
	const handleSlotSelect = React.useCallback(
		(time: string) => {
			announceSlotPick(time);
			handleTimeSelect(time);
		},
		[announceSlotPick, handleTimeSelect],
	);

	const [hoveredDateKey, setHoveredDateKey] = React.useState<string | null>(
		null,
	);

	const [focusedKey, setFocusedKey] = React.useState<string | null>(null);
	// W1-11-NEW-FIND-2 fix: useKeyboardModality (and its state) is gone —
	// focus rings come from the CSS :focus-visible rule alone now.
	const lastReadyKeyRef = React.useRef<string>("");

	useIsomorphicLayoutEffect(() => {
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
	}, []);

	// T9-M10 fix: these prop->state sync effects only write when the
	// incoming value is genuinely different. The click path already
	// updates local state, so an unconditional write just re-rendered
	// the whole widget with identical state.
	React.useEffect(() => {
		if (initialDate !== undefined) {
			React.startTransition(() =>
				setSelectedDate((prev) =>
					prev && isSameDay(prev, initialDate) ? prev : initialDate,
				),
			);
		}
	}, [initialDate]);

	const isNarrow = measuredWidth < COMPACT_BREAKPOINT;
	// Fixed foreground for the selected date/slot (rendered on the accent
	// background). A constant — never derived from the configured colours.
	const selectedAccentText = TEXT_ON_ACCENT;
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
		const map = new Map<string, number>();
		if (!selectedOrFirstDateKey) return map;
		let next = 2;
		for (const date of calendarCells) {
			const isInMonth = date.getMonth() === visibleMonth.getMonth();
			const isPast = startOfDay(date).getTime() < today.getTime();
			if (!isInMonth || isPast || !hasKnownAvailability(date)) continue;
			const dateKey = dateKeyOf(date);
			if (dateKey === selectedOrFirstDateKey) {
				map.set(dateKey, 1);
			} else {
				map.set(dateKey, next);
				next += 1;
			}
		}
		return map;
	}, [
		calendarCells,
		visibleMonth,
		today,
		selectedOrFirstDateKey,
		hasKnownAvailability,
		dateKeyOf,
	]);

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
		[onDateChange, today],
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
					aria-label={datePickerAriaLabel}
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
						dateTabIndexByKey={dateTabIndexByKey}
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
					// F-17-3 fix: radius token.
					borderRadius={String(radius)}
					loadingLabel={loadingLabel}
					dtInstanceId={dtInstanceId}
					slotsLoading={slotsLoading}
					selectedDate={selectedDate}
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
				{/* W1-10-N4 fix: visually-hidden polite region that speaks
                    "{time} selected" on slot pick (mouse or keyboard). */}
				{/* biome-ignore lint/a11y/useSemanticElements: intentional
                    visually-hidden polite live region (W1-10-N4) — <output>
                    carries implicit form-calculation semantics that would be
                    wrong for a selection announcement. */}
				<div
					role="status"
					aria-live="polite"
					aria-atomic="true"
					style={{
						position: "absolute",
						width: 1,
						height: 1,
						overflow: "hidden",
						clip: "rect(0 0 0 0)",
						whiteSpace: "nowrap",
					}}
				>
					{slotAnnouncement}
				</div>
			</div>

			{/* W1-19-F-04 fix: the time-list scrollbar. Was hidden entirely
                (`display: none`) with no affordance; now a thin, low-contrast
                thumb. Firefox/Edge are covered inline above via
                `scrollbarWidth: "thin"` — WebKit/Blink still need a real CSS
                rule for pseudo-elements, hence this scoped <style>.
                HYDRATION-AUDIT: `suppressHydrationWarning` is REQUIRED here
                (see the canonical explanation at the be-input <style> in
                RootShell, search "HYDRATION-AUDIT"). Never remove the flag,
                never move this CSS to inline styles/a CSS file, never
                reformat the text — doing so re-triggers hydration warning
                #425/#418/#422 on publish. */}
			<style suppressHydrationWarning>{`
.be-dt-scroll::-webkit-scrollbar { width: 8px; }
.be-dt-scroll::-webkit-scrollbar-track { background: transparent; }
.be-dt-scroll::-webkit-scrollbar-thumb {
    background: ${withAlpha(textColor, 0.25)};
    border-radius: 8px;
}
`}</style>
		</div>
	);
});

// =============================================================================
// BookingEngine — types and constants
// =============================================================================

type StepType = "form" | "datetime" | "review";
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
type ColorMode = "light" | "dark" | "auto";

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
	// T10-M4 fix: optional per-field input length cap. 0/undefined means
	// "use the built-in default for this field type" (see effectiveMaxLength).
	maxLength?: number;
	width: "full" | "half";
	isPrimaryName?: boolean;
	// T3-M8 fix: optional Cal.com custom-field id. When set, the field's
	// value is sent in `bookingFieldsResponses` on the booking POST instead
	// of only ever appearing inside the free-text notes.
	calFieldId?: string;
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
		| "custom-regex";
	minLength?: number;
	customRegex?: string;
	// W1-20-M6 fix: canvas-only test input for the Regex Pattern control.
	// When an author types sample text here, the canvas shows a live verdict
	// (matches / no match / invalid / ReDoS risk) evaluated with the exact
	// same compiled regex the published flow uses. Never rendered live.
	regexPreviewInput?: string;
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
	style?: React.CSSProperties;
	styles: {
		// Theme (formerly the top-level "Color Mode") - first entry in Styles.
		theme: ColorMode;
		accentColor: string;
		backgroundColor: string;
		surfaceColor: string;
		textPrimaryColor: string;
		textSecondaryColor: string;
		borderColor: string;
		errorColor: string;
		successColor: string;
		// W1-17-F-17-13 fix: Framer's BorderRadius control can emit either
		// a CSS size string ("12px") or a numeric radius; the interface
		// previously claimed `string`, so numeric values were a silent type
		// lie. All consumers (CalendarCell/Grid, TimeSlotButton/List,
		// StepBody/ReviewStepBody/FieldRenderer) are widened to match.
		borderRadius: string | number;
	};
	font: FramerFont;
	// Animation
	transition: Transition;
}

// ===== Copy =====
interface BookingEngineCopyProps {
	// Navigation & action button copy, grouped into one control (see
	// Requirement 5) the same way `styles`/`font`/`copy` are grouped below.
	buttonLabels: {
		continueLabel: string;
		backLabel: string;
		finalActionLabel: string;
		// SYN-03 fix: the "Cancel" affordance shown while a booking POST is
		// in flight — the last footer button without a label control.
		cancelSubmitLabel: string;
	};
	// Copy (fix #20: configurable terminal-state strings)
	copy: {
		successTitle: string;
		successSubtitle: string;
		addToCalendarLabel: string;
		restartLabel: string;
		errorTitle: string;
		errorSubtitle: string;
		retryLabel: string;
		loadingAvailabilityLabel: string;
		noTimesLabel: string;
		emptyReviewLabel: string;
		reviewIntroLabel: string;
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
		timeZoneSelectLabel: string;
		// W1-10-N3 fix: group label for the 12h/24h time-format toggle.
		timeFormatLabel: string;
		// W1-10-N4 fix: live-region template for slot picks ("{time} selected").
		timeSlotSelectedTemplate: string;
		detectedTimeZonePrefix: string;
		availabilityErrorLabel: string;
		dateLabel: string;
		timeLabel: string;
		// T10-H5 fix: extra calendar-provider deep links on the success
		// screen, alongside the .ics download.
		googleCalendarLabel: string;
		outlookCalendarLabel: string;
		// T10-M2 fix: optional privacy note rendered under the form when PII
		// fields are present. Empty value hides the notice entirely.
		privacyNotice: string;
		// T10-L1 fix: explanation of the required-field marker. Rendered
		// whenever at least one field in the flow is required.
		requiredFieldsHint: string;
		// T10-L6 fix: label of the "return to home" link shown on the success
		// screen. Rendered only when `returnHomeUrl` is configured.
		returnHomeLabel: string;
		// SYN-02 fix: GDPR/CCPA persistence disclosures — previously inline
		// JSX literals, so they could not be localized. Rendered whenever
		// persistState is ON / a save failed.
		savedAnswersLabel: string;
		clearSavedAnswersLabel: string;
		saveFailedMessage: string;
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
		characterCountTemplate: string;
		requiredFieldMarker: string;
		unknownErrorLabel: string;
		errorFallbackMessage: string;
		amLabel: string;
		pmLabel: string;
		icsProdid: string;
		icsSummaryFallback: string;
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
	// Progress bar - grouped object control (Visible + Step Count Text
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
	// W1-02-F1 fix (bundle 17): author-tunable Cal.com request timeout
	// (both the availability GET and the booking POST use it). Defaults to
	// 18000ms when the control hasn't been saved on an old instance.
	fetchTimeoutMs: number;
	// W1-02-F26 fix: Cal.com v2 API base URL — lets self-hosted Cal.com
	// deployments use the engine without forking. Default: Cal.com cloud.
	calApiBaseUrl?: string;
	// W1-02-F27 fix: `cal-api-version` header value sent with both the
	// slots GET and the bookings POST.
	calApiVersion?: string;
	// W1-02-F30 fix: the per-month slots cache TTL. Tune down for
	// high-velocity availability (concert tickets) or up for low-churn
	// bookings (salons).
	slotsCacheTtlMs?: number;
	// W2-23-N1 fix: meeting-duration fallback (ms) for ICS exports,
	// Google/Outlook deep links, and the success screen when the Cal.com
	// slot carries no end.
	defaultMeetingDurationMs?: number;
	// W1-02-F28 fix: .ics download filename prefix (the "-YYYY-MM-DD.ics"
	// part is appended automatically).
	icsDownloadFilenamePrefix?: string;
	// W1-02-F29 fix: fallback UID domain used ONLY when crypto.randomUUID
	// is unavailable (older browsers) — branding for the non-UUID UID path.
	icsUidDomain?: string;
	// T10-L6 fix: destination for the success screen's "Done" link. Empty
	// value hides the link entirely.
	returnHomeUrl: string;
	// NAV-GROUP-TOGGLE: opt-in to placing the Back and primary (Continue /
	// Book Now) buttons side-by-side. Default is FALSE, so Back sits far
	// left and the primary action far right (see AGENTS.md hard rules).
	groupNavButtons?: boolean;
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
		BookingEngineCopyProps {}

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
// compact breakpoint, calendar grid size, progress bar height, icon sizes).
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
// progress bar and the 12h/24h toggle never allocate new transition/
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
// W1-02-F27 fix: the `cal-api-version` header value is author-configurable
// so future Cal.com v2 minor versions can be adopted without a code change.
const DEFAULT_CAL_API_VERSION = "2024-09-04";
// W1-02-F28 fix: .ics download filename prefix is brandable. The YYYY-MM-DD
// stamp and ".ics" extension always follow it.
const DEFAULT_ICS_FILENAME_PREFIX = "booking-";
// W1-02-F29 fix: fallback UID domain when crypto.randomUUID is unavailable
// (RFC 5545 requires a UID; the domain after the @ is decorative on the
// non-UUID path — author-brandable per W1-02-F29).
const DEFAULT_ICS_UID_DOMAIN = "@booking-engine";

const DEFAULT_DARK_THEME = {
	// Default dark-mode palette. Pure defaults — the author can override
	// every colour here, and the component renders exactly what is
	// configured. No colour is derived from or judged against another.
	accentColor: "#4F8EF7",
	backgroundColor: "#0F1115",
	surfaceColor: "#1A1D23",
	textPrimaryColor: "#FFFFFF",
	textSecondaryColor: "#9CA3AF",
	borderColor: "#2A2D34",
	errorColor: "#F87171",
	successColor: "#16A34A",
	borderRadius: "12px",
};

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
				placeholder: "Anything we should know?",
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
	React.useEffect(() => {
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
	}, []);
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
				})),
			}))
			// T10-M9 fix: a form step with zero fields renders as dead air on
			// the published site (title + Continue, nothing to fill in). Drop it
			// from the pipeline entirely; the canvas-only warning (see
			// emptyStepWarnings) still tells the author why their step vanished.
			.filter((step) => !(step.stepType === "form" && step.fields.length === 0))
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
// Field-level errors are only ever computed inside `validateStep`, which is
// only ever called from `handleContinue` — see Requirement 3: validation
// must never trigger or display while the user is still typing.

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
	// T4-M4 fix: per-field rules (validationRule / minLength / customRegex)
	// override the type-derived checks below.
	const explicitRule =
		field.validationRule && field.validationRule !== "type"
			? field.validationRule
			: undefined;
	if (explicitRule === "none") return null;
	if (explicitRule === "email") {
		if (!EMAIL_REGEX.test(str.trim())) return vc.emailError;
		return null;
	}
	if (explicitRule === "phone") {
		return validatePhone(str, vc);
	}
	if (explicitRule === "custom-regex") {
		if (!field.customRegex) return vc.invalidRegexError;
		// W1-04-H2 fix: reject ReDoS-prone shapes up front (compiling and
		// running them would let a visitor freeze the tab), then use the
		// cached compiled regex instead of recompiling per keystroke.
		if (isReDosRisky(field.customRegex)) return vc.invalidRegexError;
		const re = getCompiledCustomRegex(field, field.customRegex);
		if (!re) return vc.invalidRegexError;
		if (!re.test(str)) return vc.customRegexError;
		return null;
	}
	const minLength = field.minLength ?? vc.minLength;
	// W1-20-H3 fix: min-length validation must NEVER fire on optional
	// fields — a partially filled optional field (e.g. "ab") used to
	// block submission with "too short". An optional field either stays
	// empty (valid, by definition) or may hold anything the visitor wants.
	// Required fields keep the length gate so "3" doesn't pass as a name.
	if (explicitRule === "min-length") {
		if (field.required && str.trim().length < minLength) {
			return vc.minLengthError;
		}
		return null;
	}
	if (field.fieldType === "email" && !EMAIL_REGEX.test(str.trim())) {
		return vc.emailError;
	}
	if (field.fieldType === "phone") {
		return validatePhone(str, vc);
	}
	if (
		field.required &&
		(field.fieldType === "text" || field.fieldType === "textarea") &&
		str.trim().length < minLength
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
	const digits = trimmed.replace(/\D/g, "").length;
	if (digits < 7) return vc.phoneError;
	return null;
}

// W1-04-H2 fix: author-supplied custom regexes were recompiled on every
// validateField call (every keystroke) and catastrophic-backtracking
// patterns could freeze the main thread (ReDoS). Compiled patterns are now
// cached per field in a WeakMap, and statically detectable exponential-time
// shapes are rejected before a visitor's input ever reaches them.
const customRegexCache = new WeakMap<
	object,
	{ re: RegExp | null; invalid: boolean; pattern: string }
>();

// W1-04-F-6 fix: the ReDoS analysis below constructs 3-4 `new RegExp` per
// call, and validateField runs it on EVERY keystroke for custom-regex
// fields (plus the live-preview verdict path). The verdict is a pure
// function of the pattern string — cache it. Bounded growth: patterns
// come from the author's property panel.
const reDosCache = new Map<string, boolean>();

function isReDosRisky(pattern: string): boolean {
	const cached = reDosCache.get(pattern);
	if (cached !== undefined) return cached;
	const verdict = isReDosRiskyUncached(pattern);
	reDosCache.set(pattern, verdict);
	return verdict;
}

function isReDosRiskyUncached(pattern: string): boolean {
	// Exponential backtracking requires a group that can match the same
	// input many ways (inner quantifier or ambiguous alternation) wrapped in
	// an *unbounded* outer quantifier. Bounded repeats like `(\\d{1,3}){3}`
	// are poly-time and allowed. Shapes blocked:
	//   (a+)+, (a*)*, (a{1,5})+, ([a-z]+)*   — inner quantifier
	//   (ab|a)+, (a|aa)+                     — alternation sharing a first
	//                                          character (prefix ambiguity)
	//   ((ab)+)+, ((a|b)*)+                  — nested groups
	// `(?:`/`(?=` markers are normalized to `(` first so the marker `?` is
	// not mistaken for a quantifier, and `body` treats a whole `[...]` class
	// as one atom so a class-scoped quantifier like `([a-z]+)*` is detected.
	const normalized = pattern.replace(/\(\?[:=!<>=]?/g, "(");
	// Grouping `(?: ... )` on every interpolated alternation is
	// load-bearing — without it the inner `|`s fork the rule into
	// unrelated branches.
	const body = "(?:[^()\\[\\]]|\\[[^\\[\\]]*\\])*";
	const innerQuant = "(?:[+*?]|\\{[0-9]+(?:,[0-9]*)?\\})";
	const outerUnbounded = "(?:[+*]|\\{[0-9]+,\\})";
	if (
		new RegExp(`\\(${body}${innerQuant}${body}\\)${outerUnbounded}`).test(
			normalized,
		)
	) {
		return true;
	}
	// Ambiguous-alternation check: only groups whose alternatives can match
	// the same first character are exponential in practice, so
	// `(mon|tue|fri)+$` (disjoint first chars) stays allowed while
	// `(a|aa)+` / `(ab|a)+` are rejected.
	if (new RegExp(`\\(${body}\\|${body}\\)${outerUnbounded}`).test(normalized)) {
		const groupRe = new RegExp(
			`\\((${body}\\|${body})\\)${outerUnbounded}`,
			"g",
		);
		for (
			let m = groupRe.exec(normalized);
			m !== null;
			m = groupRe.exec(normalized)
		) {
			const alts = m[1].split("|").filter(Boolean);
			const firsts = alts.map((alt) => {
				const t = alt.trim();
				if (t[0] === "\\") return t.slice(0, 2);
				if (t[0] === "[") {
					const end = t.indexOf("]");
					return end === -1 ? "[" : t.slice(0, end + 1);
				}
				return t.slice(0, 2);
			});
			for (let i = 0; i < firsts.length; i++) {
				for (let j = i + 1; j < firsts.length; j++) {
					const a = firsts[i];
					const b = firsts[j];
					// Same starting token, or one literal prefix of the
					// other: (a|aa)+, (ab|a)+, (foo|fo)+ are exponential.
					if (a === b) return true;
					if (a.length < b.length ? b.startsWith(a) : a.startsWith(b)) {
						return true;
					}
					// `.` matches anything → ambiguous with every token.
					if (a === "." || b === ".") return true;
					// Two character classes → conservatively ambiguous.
					if (a.startsWith("[") && b.startsWith("[")) return true;
					// Escape like \d/\w/\s vs a class → overlapping.
					if (
						(a.startsWith("\\") && b.startsWith("[")) ||
						(b.startsWith("\\") && a.startsWith("["))
					) {
						return true;
					}
				}
			}
		}
	}
	if (
		new RegExp(`\\(${body}\\(${body}\\)${body}\\)${outerUnbounded}`).test(
			normalized,
		)
	) {
		return true;
	}
	return false;
}

function getCompiledCustomRegex(field: object, pattern: string): RegExp | null {
	let cached = customRegexCache.get(field);
	// Recompile if the author changed the pattern on a field whose object
	// identity survived (defense against stale compiled regexes).
	if (!cached || cached.pattern !== pattern) {
		cached = { re: null, invalid: false, pattern };
		try {
			cached.re = new RegExp(pattern);
		} catch {
			cached.invalid = true;
		}
		customRegexCache.set(field, cached);
	}
	return cached.invalid ? null : cached.re;
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
	if (step.stepType === "review") {
		return { valid: true, errors: {} };
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
): string {
	// W1-05-N5 fix: the key used browser-local getFullYear()/getMonth(),
	// which mislabels the visitor-tz month when the browser tz and the
	// visitor tz straddle a month boundary. getDateKeyInTimeZone already
	// produces the visitor-tz "YYYY-MM" the slot fetch window is built
	// around, so the key now matches the month actually requested.
	return `${getDateKeyInTimeZone(monthStart, timeZone || "").slice(0, 7)}|${timeZone}|${apiKey}|${eventTypeId}`;
}

// CC-15 fix: shared timeout for both Cal.com calls. 18s comfortably covers a
// slow-but-working connection while still recovering a stranded visitor well
// before they'd give up and leave. W1-02-F1 fix: `useCalcomSlots` and
// `submitCalcomBooking` accept an optional override via `fetchTimeoutMs`.
const FETCH_TIMEOUT_MS = 18000;

// W1-05-F-04 fix: slots cache entries are considered stale after 5 minutes
// (long enough to make month paging feel instant, short enough that a
// long-lived tab never offers already-elapsed slots as selectable).
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
	>(new Map());
	// T3-H4 fix: see UseCalcomSlotsResult.refetch — a bump re-runs the fetch
	// effect below exactly as if the month had changed.
	const [refreshNonce, setRefreshNonce] = React.useState(0);
	const refetch = React.useCallback(() => {
		if (!monthStart) return;
		cacheRef.current.delete(
			monthCacheKey(monthStart, timeZone, apiKey, eventTypeId),
		);
		setRefreshNonce((count) => count + 1);
	}, [monthStart, timeZone, apiKey, eventTypeId]);

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
	}, [apiKey, eventTypeId, timeZone]);

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

		const monthKey = monthCacheKey(monthStart, timeZone, apiKey, eventTypeId);
		const cached = cacheRef.current.get(monthKey);
		// W1-05-F-04 fix: honor the TTL — a fresh-enough entry short-circuits
		// the fetch; a stale one falls through and is replaced below.
		// W1-02-F30 fix: the TTL is author-tunable via slotsCacheTtlMs.
		if (cached && Date.now() - cached.fetchedAt < cacheTtl) {
			setSlots(cached.slots);
			setLoading(false);
			setError(null);
			return;
		}

		let cancelled = false;
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
		// start. Widening by TWO calendar days on each side absorbs the
		// full drift harmlessly — the calendar grid only renders visible
		// dates, so neighboring-day slots are extra data, never orphaned UI.
		const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
		start.setDate(start.getDate() - 2);
		const end = new Date(
			monthStart.getFullYear(),
			monthStart.getMonth() + 1,
			0,
			23,
			59,
			59,
		);
		end.setDate(end.getDate() + 2);
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
					if (cancelled) return;
					// W1-05-F-04 fix: stamp the entry with its fetch time so the
					// TTL check at the read site can expire it.
					cacheRef.current.set(monthKey, {
						slots: mapped,
						fetchedAt: Date.now(),
					});
					setSlots(mapped);
					setLoading(false);
				})
				.catch((err: unknown) => {
					if (cancelled) return;
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
									? copy.networkError
									: fallbackErrorLabel || copy.slotsFallbackError;
					}
					setError(message);
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
		fallbackErrorLabel,
		errorCopy,
		timeoutMs,
	]);

	return { slots, loading, error, refetch };
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
	// W1-06-F-06-1 fix: Cal.com v2 /bookings requires the slot `end`
	// (ISO datetime) alongside `start` — omitting it 400-rejects every
	// booking attempt. `slot.end` has been captured into BookingPayload
	// and consumed by ICS/deep-link builders; it now arrives here too.
	slotEnd?: string;
	name: string;
	email: string;
	timeZone: string;
	notes: string;
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
	// W1-02-F27 fix: `cal-api-version` header value.
	apiVersion?: string;
}): Promise<SubmitBookingResult> {
	const {
		apiKey,
		eventTypeId,
		slotStart,
		slotEnd,
		name,
		email,
		timeZone,
		notes,
		idempotencyKey,
		bookingFieldsResponses,
		externalSignal,
		errorCopy: errorCopyParam,
		timeoutMs,
		apiBaseUrl,
		apiVersion,
	} = params;
	const copy = { ...ERROR_COPY_DEFAULTS, ...(errorCopyParam || {}) };
	// W1-02-F26/F27 fixes: resolve the author-tunable base URL + API
	// version header once (trailing slashes normalized for the join).
	const apiBase = (apiBaseUrl || DEFAULT_CAL_API_BASE_URL).replace(/\/+$/, "");
	const apiVer = apiVersion || DEFAULT_CAL_API_VERSION;
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
		return {
			success: false,
			error: copy.offlineError,
			errorCode: "OFFLINE",
		};
	}
	try {
		const res = await fetch(`${apiBase}/v2/bookings`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
				"cal-api-version": apiVer,
				// W1-06-F-06-4 fix: VERIFIED against Cal.com v2's published
				// OpenAPI (POST /v2/bookings) — `X-Idempotency-Key` is NOT a
				// documented parameter. The header is sent anyway as a harmless
				// best-effort (unknown headers are ignored), but it must NOT be
				// relied on for duplicate protection: without documented server
				// support, a retry that replays the same key (T3-H2 keeps the
				// key across retries by design) could in principle create a
				// second booking if the first POST actually succeeded server-side
				// but its response was lost. Mitigations: the client NEVER
				// auto-retries a POST (no retry loop exists), and the visitor
				// re-submitting manually after an ambiguous failure is the only
				// residual exposure.
				...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
			},
			body: JSON.stringify({
				eventTypeId: parsedEventTypeId,
				start: slotStart,
				// W1-06-F-06-1 fix: thread the slot `end` into the POST body.
				// Guarded like `start` so a malformed/demo-grid end never
				// reaches the API.
				...(slotEnd && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotEnd)
					? { end: slotEnd }
					: {}),
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
			if (apiError) {
				return { success: false, error: String(apiError), errorCode: code };
			}
			// W1-06-F-06-4 fix: no machine-readable error from Cal.com —
			// use the author-facing template; it is already visitor-facing
			// copy, so flag it to skip the consumer's mapper (which would
			// otherwise degrade it to the generic fallback).
			return {
				success: false,
				error: copy.httpStatusTemplate.replace("{status}", String(res.status)),
				errorCode: code,
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
		const mappedError = timedOut
			? copy.submitTimeoutError
			: malformed
				? copy.malformedResponseError
				: mapCalcomError(
						errObj?.message || "",
						errObj?.code || errObj?.errorCode,
						copy,
					);
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
function buildBookingFieldsResponses(
	steps: NormalizedStep[],
	values: BookingValues,
): Record<string, string> {
	const out: Record<string, string> = {};
	for (const step of steps) {
		if (step.stepType !== "form" && step.stepType !== "datetime") continue;
		for (const field of step.fields) {
			if (!field.calFieldId) continue;
			const value = values[field.id];
			if (value === undefined || value === "") continue;
			out[field.calFieldId] = String(value);
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
			stepLines.push(`${field.label}: ${String(value)}`);
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
	const uid =
		typeof crypto !== "undefined" && "randomUUID" in crypto
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random().toString(36).slice(2)}${uidDomain}`;
	// T3-M3 fix: was "SUMMARY:Booking" and nothing else. STATUS:
	// CONFIRMED + SEQUENCE:0 are the RFC 5545 way to mark a confirmed
	// event, and DESCRIPTION carries the collected booking answers
	// instead of throwing them away. LOCATION/ORGANIZER have no data
	// source in this component's config surface, so they stay omitted
	// until one exists.
	// W1-06-F-06-6 fix: long content lines are folded at 75 octets
	// (RFC 5545 §3.1) when assembling the payload.
	const ics = foldIcsLines([
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		`PRODID:-//${prodid}`,
		"BEGIN:VEVENT",
		`UID:${uid}`,
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
	field: Pick<NormalizedField, "fieldType" | "maxLength">,
): number {
	// W1-20-M4 fix: email is clamped to RFC 5321's 254-char limit even
	// when the author configured a larger maxLength — no email address a
	// visitor types can legitimately exceed it, and Cal.com's own email
	// validation rejects anything longer anyway.
	if (field.fieldType === "email") {
		return Math.min(
			field.maxLength && field.maxLength > 0 ? field.maxLength : 254,
			254,
		);
	}
	if (field.maxLength && field.maxLength > 0) return field.maxLength;
	switch (field.fieldType) {
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
	// (YYYYMMDDTHHMMSSZ), but Outlook's `startdt`/`enddt` want extended ISO
	// WITH separators and WITHOUT the `Z` suffix (interpreted relative to
	// the viewer). Feeding Google's compact-UTC form into Outlook produces
	// an event at the wrong instant (or a rejected link). Separate
	// formatter per provider.
	const toExtended = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "");
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
// Named variants (stable identity) so opacity is a function of presence,
// not leftover enter/exit motion from the previous step. `layout` +
// popLayout previously projected the exiting step's opacity:0 onto the
// destination on reverse navigation, leaving the active step invisible
// while position/pointer-events had already flipped.
const STEP_PRESENCE_VARIANTS = {
	enter: { opacity: 0, y: 12 },
	active: { opacity: 1, y: 0 },
	inactive: { opacity: 0, y: -12 },
} as const;

// T5-M3 fix: AnimatePresence keeps the exiting step mounted during the
// fade, and the old motion.div stayed fully present in the
// accessibility tree - screen-reader users could re-read, and even tab
// into, the step that is visually gone. usePresence() flips to false the
// moment the step starts exiting, so the wrapper is hidden from assistive
// tech immediately (focus has already moved to the new step's heading).
function AnimatedStepContent(props: {
	transition: Transition;
	children: React.ReactNode;
	/** False for the first visible step (including a restored saved step)
	 *  so it never paints at opacity 0. True after the visitor navigates. */
	playEnterAnimation: boolean;
}) {
	const [isPresent] = usePresence();
	const reducedMotion = useReducedMotion();
	// T8-H1 fix: on the canvas and in exports there is nothing to animate -
	// skip framer-motion entirely so every properties-panel edit stops
	// triggering layout measurement + spring runs.
	const isStatic = useIsStaticRenderer();
	if (isStatic) {
		return <div style={{ position: "relative" }}>{props.children}</div>;
	}
	// Presence is the source of truth for layout AND opacity. Active
	// steps always animate toward `active` (opacity 1); inactive/exiting
	// steps toward `inactive` (opacity 0). Do not use `layout` here —
	// layout projection fights opacity/y on reverse navigation.
	return (
		<motion.div
			variants={STEP_PRESENCE_VARIANTS}
			initial={props.playEnterAnimation ? "enter" : false}
			animate={isPresent ? "active" : "inactive"}
			exit="inactive"
			transition={reducedMotion ? INSTANT_TRANSITION : props.transition}
			style={{
				position: isPresent ? "relative" : "absolute",
				left: isPresent ? undefined : 0,
				right: isPresent ? undefined : 0,
				width: "100%",
				pointerEvents: isPresent ? "auto" : "none",
			}}
			// W1-11-NEW-FIND-5 fix: aria-hidden only hides the exiting step
			// from screen readers — Tab still reached its focusable elements
			// during the ~16ms AnimatePresence exit window, and when the old
			// step unmounted the focus dropped to <body>. `inert` removes the
			// departing subtree from BOTH the accessibility tree and the Tab
			// order while it plays out (supported natively as a boolean prop
			// by React 19).
			aria-hidden={isPresent ? undefined : true}
			inert={isPresent ? undefined : true}
		>
			{props.children}
		</motion.div>
	);
}

// In-session form snapshot. Step UI remounts (AnimatePresence keys,
// Framer canvas remounts) must not wipe answers — this lives outside
// any component instance. sessionStorage remains the reload path.
type InSessionFormSnapshot = {
	values: BookingValues;
	currentIndex: number;
	timeFormat: "12h" | "24h";
};
let inSessionFormSnapshot: InSessionFormSnapshot | null = null;

function readSessionStorageSnapshot(key: string): InSessionFormSnapshot | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.sessionStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as {
			v?: unknown;
			values?: Record<string, unknown>;
			timeFormat?: unknown;
			currentIndex?: unknown;
		};
		if (!parsed || parsed.v !== 1 || typeof parsed !== "object") return null;
		const restoredValues = (parsed.values || {}) as BookingValues;
		const currentIndex =
			typeof parsed.currentIndex === "number" && Number.isFinite(parsed.currentIndex)
				? Math.max(0, parsed.currentIndex)
				: 0;
		const timeFormat =
			parsed.timeFormat === "24h" || parsed.timeFormat === "12h"
				? parsed.timeFormat
				: "12h";
		return { values: restoredValues, currentIndex, timeFormat };
	} catch {
		return null;
	}
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
		returnHomeUrl,
		groupNavButtons,
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
			minLength:
				validationMessages?.minLength ?? DEFAULT_VALIDATION_COPY.minLength,
		};
		// W1-04-H1 fix: the memo body reads `validation`, so the dep array must
		// list `validation` — `[copy]` left stale validation messages in the
		// editor when only the Validation group changed.
	}, [validation]);

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
	} = styles;
	// Defensive fallback for instances created before the prop moved.
	const colorMode: ColorMode = themeSetting || "light";
	// Progress bar settings (grouped object control). Defaults keep
	// previous instances behaving exactly as before.
	const progressVisible = progressBar?.visible !== false;
	const stepCountPosition: "top" | "bottom" =
		progressBar?.stepCountPosition === "bottom" ? "bottom" : "top";
	const progressShowTextContent = progressBar?.showTextContent !== false;
	const progressBarStyle: "solid" | "dashed" =
		progressBar?.barStyle === "dashed" ? "dashed" : "solid";

	// Destructure copy from the grouped Buttons object (Requirement 5).
	const { continueLabel, backLabel, finalActionLabel } = buttonLabels;

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
	// W1-02-F1 fix (bundle 17): author-tunable timeout; `??` only fires
	// for pre-save instances that never got the new control.
	const fetchTimeoutMs = props.fetchTimeoutMs ?? FETCH_TIMEOUT_MS;
	// W1-02-F26/F27 fixes: self-hosted Cal.com base URL + API version
	// header are author-tunable; trailing slashes are normalized so the
	// "/v2/..." suffix always joins cleanly. `??` covers instances saved
	// before these controls existed.
	const calApiBaseUrl = (
		props.calApiBaseUrl ?? DEFAULT_CAL_API_BASE_URL
	).replace(/\/+$/, "");
	const calApiVersion =
		(typeof props.calApiVersion === "string" && props.calApiVersion.trim()) ||
		DEFAULT_CAL_API_VERSION;
	// W1-02-F30 fix: author-tunable slots cache TTL (the read site in
	// useCalcomSlots checks freshness against it).
	const slotsCacheTtlMs =
		typeof props.slotsCacheTtlMs === "number" && props.slotsCacheTtlMs >= 0
			? props.slotsCacheTtlMs
			: SLOTS_CACHE_TTL_MS;
	// W2-23-N1 fix: author-tunable fallback meeting duration (ICS export,
	// deep links, success screen) when Cal.com's slot carries no end.
	const meetingDurationMs =
		typeof props.defaultMeetingDurationMs === "number" &&
		props.defaultMeetingDurationMs > 0
			? props.defaultMeetingDurationMs
			: DEFAULT_MEETING_DURATION_MS;
	// W1-02-F28/F29 fixes: author-brandable .ics filename prefix and
	// non-UUID UID domain.
	const icsFilenamePrefix =
		(typeof props.icsDownloadFilenamePrefix === "string" &&
			props.icsDownloadFilenamePrefix) ||
		DEFAULT_ICS_FILENAME_PREFIX;
	const icsUidDomain =
		(typeof props.icsUidDomain === "string" && props.icsUidDomain.trim()) ||
		DEFAULT_ICS_UID_DOMAIN;

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
			({ type: "tween", ease: "easeInOut", duration: 0.3 } as const);

	// Resolve colorMode → effective palette. "auto" uses the dark palette only
	// when the visitor's OS reports prefers-color-scheme: dark. Default is light.
	// SSR fix: the old lazy initializer read matchMedia during render — the
	// server always saw `false` while a dark-OS visitor's browser saw `true`,
	// so the FIRST client render produced an entirely different theme than the
	// SSR HTML (React #418 mismatches on every colored element). Initialize
	// deterministically (`false`, same as the server) and let the mount effect
	// below sync the real value synchronously after hydration.
	const [systemDark, setSystemDark] = React.useState<boolean>(false);
	React.useEffect(() => {
		// W1-17-F-17-9 fix: the OS-scheme subscription was wired up
		// unconditionally, so fixed-mode instances ("light"/"dark") still
		// listened and re-rendered on every unrelated OS theme toggle.
		// Only "auto" reads systemDark — that is the only mode that needs
		// the listener.
		if (colorMode !== "auto") return;
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		)
			return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => setSystemDark(mq.matches);
		update();
		try {
			mq.addEventListener("change", update);
			return () => mq.removeEventListener("change", update);
		} catch {
			mq.addListener(update);
			return () => mq.removeListener(update);
		}
	}, [colorMode]);

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
	// F-17-4 fix: the dark-mode fallback matched light defaults by EXACT
	// string equality — "#ffffff" or "white" slipped through and rendered
	// light colours in dark mode. Comparison is now normalized (case and
	// leading '#'), and only the default light values swap (so an author
	// who deliberately sets "#FFFFFF" on purpose keeps it in both modes).
	// F-17-8 fix: every field now has a dark counterpart — accent/error/
	// success/borderRadius previously had NO fallback (the dark theme's
	// declared values were dead).
	// fixes light-only.
	const theme = React.useMemo(() => {
		const useDarkLocal =
			colorMode === "dark" || (colorMode === "auto" && systemDark);
		const isDefault = (value: string | number, lightDefault: string) =>
			String(value ?? "")
				.trim()
				.toLowerCase()
				.replace(/^#/, "") === lightDefault.toLowerCase().replace(/^#/, "");
		const pick = (value: string, lightDefault: string, darkDefault: string) =>
			isDefault(value, lightDefault) ? darkDefault : value;
		return useDarkLocal
			? {
					accentColor: pick(
						accentColor,
						"#0066BB",
						DEFAULT_DARK_THEME.accentColor,
					),
					backgroundColor: pick(
						backgroundColor,
						"#FFFFFF",
						DEFAULT_DARK_THEME.backgroundColor,
					),
					surfaceColor: pick(
						surfaceColor,
						"#F7F8FA",
						DEFAULT_DARK_THEME.surfaceColor,
					),
					textPrimaryColor: pick(
						textPrimaryColor,
						"#111827",
						DEFAULT_DARK_THEME.textPrimaryColor,
					),
					textSecondaryColor: pick(
						textSecondaryColor,
						"#6B7280",
						DEFAULT_DARK_THEME.textSecondaryColor,
					),
					borderColor: pick(
						borderColor,
						"#E5E7EB",
						DEFAULT_DARK_THEME.borderColor,
					),
					errorColor: pick(
						errorColor,
						"#DC2626",
						DEFAULT_DARK_THEME.errorColor,
					),
					successColor: pick(
						successColor,
						"#15803D",
						DEFAULT_DARK_THEME.successColor,
					),
					// W1-17-N5-new fix: the old dark branch used to swap the
					// radius token to `DEFAULT_DARK_THEME.borderRadius` when it
					// detected the light default "12px" — but no runtime site
					// ever consumed `theme.borderRadius` (everything reads the
					// raw prop), so the swap was invisible dead logic AND a
					// latent footgun (a future dark-radius change would only hit
					// the canvas banner). Both branches now carry the raw prop;
					// borderRadius is documented as NOT theme-aware.
					borderRadius,
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
					borderRadius,
				};
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
		borderRadius,
	]);

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
	const activeSteps = React.useMemo(
		() => normalizedSteps.filter((step) => step.enabled),
		[normalizedSteps],
	);
	const totalActive = activeSteps.length;

	const [currentIndex, setCurrentIndex] = useStateGuarded(
		inSessionFormSnapshot?.currentIndex ??
			readSessionStorageSnapshot("booking-engine:session")?.currentIndex ??
			0,
		totalActive,
	);
	// CC-8 fix: `useStateGuarded` only re-clamps when its setter is called —
	// it does not retroactively clamp the already-committed state when
	// `totalActive` shrinks on its own (e.g. an author disables a step
	// while a visitor is mid-flow). The correction effect below fixes this
	// on the NEXT commit, but the render that happens before that effect
	// runs would otherwise read `activeSteps[currentIndex]` as `undefined`
	// and crash on `currentStep.title`. This is defense-in-depth: clamp for
	// this render too, not just in the effect.
	const safeCurrentIndex = Math.min(currentIndex, Math.max(0, totalActive - 1));
	const currentStep = activeSteps[safeCurrentIndex];
	const isFirst = safeCurrentIndex === 0;
	const isLast = safeCurrentIndex === totalActive - 1;

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
		activeSteps.map((step) => step.id).join("|"),
	);
	React.useEffect(() => {
		pinnedStepIdRef.current = activeSteps[safeCurrentIndex]?.id ?? null;
	}, [safeCurrentIndex, activeSteps]);
	// Render-phase adjustment (the documented React pattern for reacting
	// to derived-state/prop changes before paint).
	const activeStepsKey = activeSteps.map((step) => step.id).join("|");
	if (activeStepsKey !== lastActiveStepsKeyRef.current) {
		lastActiveStepsKeyRef.current = activeStepsKey;
		const pinnedIndex = pinnedStepIdRef.current
			? activeSteps.findIndex((step) => step.id === pinnedStepIdRef.current)
			: -1;
		const remapped =
			pinnedIndex !== -1
				? pinnedIndex
				: // W1-03-5 fix: the fallback used raw `currentIndex`; the
					// clamped `safeCurrentIndex` is the semantically correct
					// value when the pinned ID is stale/missing.
					Math.min(safeCurrentIndex, totalActive - 1);
		if (remapped !== currentIndex) {
			// W1-03-4 fix: `React.startTransition` deferred the commit —
			// the "before paint" guarantee this render-phase remap exists
			// for was defeated, and the visitor saw the wrong step for a
			// frame. Direct set matches the W1-14-F6 sibling clamp.
			setCurrentIndex(remapped);
		}
	}

	// Form state. Seed from the in-session snapshot (survives step
	// remounts) then sessionStorage (survives reloads). Never start empty
	// when the visitor already typed answers this session.
	const [values, setValues] = React.useState<BookingValues>(() => {
		const snap =
			inSessionFormSnapshot ??
			readSessionStorageSnapshot("booking-engine:session");
		return snap?.values ? { ...snap.values } : {};
	});
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
	React.useEffect(() => {
		setTimeZone((prev) => (prev === "UTC" ? detectTimezone() : prev));
	}, []);
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
	const [timeFormat, setTimeFormat] = React.useState<"12h" | "24h">(
		() =>
			inSessionFormSnapshot?.timeFormat ??
			readSessionStorageSnapshot("booking-engine:session")?.timeFormat ??
			"12h",
	);

	// Keep the module-level snapshot in lockstep so a remount (animation
	// unmount, Framer canvas) rehydrates from memory, not empty useState.
	React.useEffect(() => {
		inSessionFormSnapshot = {
			values,
			currentIndex: safeCurrentIndex,
			timeFormat,
		};
	}, [values, safeCurrentIndex, timeFormat]);

	// Persisted-state restore. Opt-in (F-12-2); auto-generated instance ID.
	// F-12-3 fix: payloads carry a schema version so a future shape change
	// can migrate or purge instead of silently mis-restoring.
	const PERSIST_SCHEMA_VERSION = 1;
	const sessionKey = "booking-engine:session";
	// Restore before paint so a saved currentIndex never flashes Step 1.
	useIsomorphicLayoutEffect(() => {
		if (!persistState) return;
		if (typeof window === "undefined") return;
		// F-12-4 fix: no restore on the canvas / in exports.
		if (isStaticRender) return;
		try {
			const raw = window.sessionStorage.getItem(sessionKey);
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
						window.sessionStorage.removeItem(sessionKey);
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
					let restoredIndex = Math.min(parsed.currentIndex, activeSteps.length);
					for (let i = 0; i < restoredIndex; i++) {
						const prior = activeSteps[i];
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
				window.sessionStorage.removeItem(sessionKey);
			} catch {
				console.warn("BookingEngine: failed to purge corrupt saved progress.");
			}
		}
	}, [persistState, sessionKey, isStaticRender]);

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
				window.sessionStorage.removeItem(sessionKey);
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
			const hasAnything =
				safeCurrentIndex > 0 ||
				Object.values(values).some(
					(v) => v !== undefined && v !== null && v !== "",
				);
			if (!hasAnything) return;
			try {
				window.sessionStorage.setItem(
					sessionKey,
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
					currentIndex: safeCurrentIndex,
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
		sessionKey,
		values,
		flowStatus,
		// TZ-TIME-HARD-RULE: `timeZone` is intentionally absent — it is no
		// longer persisted, so it must not trigger persistence writes.
		timeFormat,
		safeCurrentIndex,
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
		if (currentIndex >= totalActive && totalActive > 0) {
			setCurrentIndex(Math.max(0, totalActive - 1));
		} else if (totalActive === 0) {
			setCurrentIndex(0);
		}
	}, [currentIndex, totalActive]);

	// Cal.com slots — fetched when a datatetime step is present in the flow
	// and config is present. T2-M4 fix: was gated on `datetimeStepActive`,
	// so entering (and later re-entering) the datetime step flipped the
	// effect dep, re-running the fetch effect even though the month never
	// changed. Gating on the *static* `hasDatetimeStep` keeps the dep stable
	// for the whole flow (the per-month cache absorbs an otherwise-eager
	// fetch for a datetime step that comes later in the flow).
	const hasDatetimeStep =
		activeSteps.some((step) => step.stepType === "datetime") ?? false;
	const hasCalConfig = Boolean(calApiKey && calEventTypeId);
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
		copy?.availabilityErrorLabel,
		errorCopy,
		fetchTimeoutMs,
		// W1-02-F26/F27/F30 fixes: self-hosted base URL, API version
		// header, and author-tunable cache TTL.
		calApiBaseUrl,
		calApiVersion,
		slotsCacheTtlMs,
	);

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

	// Guardrail warning (canvas-only): datetime step without name+email somewhere.
	const needsNameEmailGuardrail = React.useMemo(() => {
		if (!activeSteps.some((step) => step.stepType === "datetime")) return false;
		return !findNameField(activeSteps) || !findEmailField(activeSteps);
	}, [activeSteps]);

	// Canvas-only empty-step warnings. Detects:
	//   - A form step with zero fields (T10-M9: skipped on the published site)
	//   - A choice-type field (select/segmented/pills/cards/radio) with zero options
	const emptyStepWarnings = React.useMemo(() => {
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
		for (const step of activeSteps) {
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
		return warnings;
	}, [normalizedSteps, activeSteps]);

	// T9-M7 fix: the render target is static for a component's lifetime;
	// compute once instead of reading it on every render.
	// W1-13-F-13-10 fix: hoisted above the author-verdict memo below — on
	// the published site that banner never renders, so its verdict must
	// never be computed either (regex compilation runs were paying mount
	// cost on every visitor page).
	const isCanvas = React.useMemo(
		() => RenderTarget.current() === RenderTarget.canvas,
		[],
	);

	// W1-20-M6 fix: canvas-only live verdict for each custom-regex field
	// that has a test input filled in. Reuses the production code path
	// (`isReDosRisky` + `getCompiledCustomRegex`) so the preview matches
	// exactly what visitors will hit after publish.
	const regexPreviewVerdicts = React.useMemo(() => {
		// W1-13-F-13-10 fix: the results only ever render behind
		// `isCanvas &&` — skip the whole sweep on preview/published site.
		if (!isCanvas) return [];
		const verdicts: Array<{
			fieldLabel: string;
			pattern: string;
			kind: "ok" | "mismatch" | "invalid" | "risky";
			message: string;
		}> = [];
		for (const step of normalizedSteps) {
			if (step.stepType !== "form" && step.stepType !== "datetime") {
				continue;
			}
			for (const field of step.fields) {
				if (
					(field.validationRule ?? "type") !== "custom-regex" ||
					!field.customRegex ||
					!field.regexPreviewInput
				) {
					continue;
				}
				const pattern = field.customRegex;
				const testInput = field.regexPreviewInput;
				if (isReDosRisky(pattern)) {
					verdicts.push({
						fieldLabel: field.label,
						pattern,
						kind: "risky",
						message:
							"Risk of exponential backtracking (ReDoS). Simplify the pattern (e.g. remove nested/inner quantifiers or prefix-sharing alternatives).",
					});
					continue;
				}
				const re = getCompiledCustomRegex(field, pattern);
				if (!re) {
					verdicts.push({
						fieldLabel: field.label,
						pattern,
						kind: "invalid",
						message: "Invalid regex pattern — will not compile.",
					});
					continue;
				}
				verdicts.push({
					fieldLabel: field.label,
					pattern,
					kind: re.test(testInput) ? "ok" : "mismatch",
					message: re.test(testInput)
						? `Matches: “${testInput}”`
						: `No match for: “${testInput}”`,
				});
			}
		}
		return verdicts;
	}, [isCanvas, normalizedSteps]);

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
	// First visible step (including a restored saved step) must paint at
	// opacity 1. Enter animation is armed only after the visitor navigates.
	const playStepEnterAnimationRef = React.useRef(false);
	// T3-H2 fix: one idempotency key per selected slot, generated on first
	// submit and REUSED across retries of the same submission — see
	// handleSubmitBooking / handleSlotReady / makeIdempotencyKey.
	const idempotencyKeyRef = React.useRef<string | null>(null);

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
	const hasMountedStepRef = React.useRef(false);
	React.useEffect(() => {
		if (!hasMountedStepRef.current) {
			hasMountedStepRef.current = true;
			return;
		}
		stepTitleRef.current?.focus();
	}, [safeCurrentIndex]);

	// Requirement 3: validation must never trigger or display dynamically
	// while the user is typing — only `handleContinue` (on "Continue"/final
	// action click) is allowed to compute and surface field errors. So this
	// handler only ever updates `values`; it deliberately does not touch
	// `errors` or `touched`.
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
			inSessionFormSnapshot = {
				values: valuesRef.current,
				currentIndex: inSessionFormSnapshot?.currentIndex ?? 0,
				timeFormat: inSessionFormSnapshot?.timeFormat ?? "12h",
			};
			setValues((prev) => ({ ...prev, [fieldId]: nextValue }));
			// T4-M1 fix: previous behavior only (re)validated on Continue, so a
			// visitor who fixed what the error described kept seeing a stale
			// error until the next submit attempt. Re-validate the single
			// touched field immediately so errors clear (or appear) live.
			if (!field) return;
			const err = validateField(field, nextValue, validationCopy);
			setErrors((prev) => ({ ...prev, [fieldId]: err }));
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
			// Calendar steps can carry custom fields too - only Review has none.
			if (step.stepType === "review") return;
			for (const field of step.fields) {
				const err = validateField(
					field,
					valuesRef.current[field.id],
					validationCopy,
				);
				if (err) {
					const wrapper = document.querySelector<HTMLElement>(
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
							target.focus();
							target.scrollIntoView({
								behavior: "smooth",
								block: "center",
							});
						} catch {
							/* ignore */
						}
						break;
					}
				}
			}
		},
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
		const notes = buildNotesPayload(
			activeSteps,
			valuesRef.current,
			copy.notesSelectedTimeLabel,
			copy.notesDatePrefix,
			copy.notesTimePrefix,
			// W1-07-N1 fix: notes date string is formatted in the
			// visitor's chosen zone like the on-screen labels.
			timeZone,
		);
		const bookingFieldsResponses = buildBookingFieldsResponses(
			activeSteps,
			valuesRef.current,
		);

		transitionFlowStatus("submitting");
		setSubmitError(null);
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
			// W1-06-F-06-1 fix: real Cal.com slots carry an `end` ISO string
			// captured at selection time — required by Cal.com v2 /bookings.
			slotEnd: slot.end,
			name,
			email,
			timeZone,
			notes,
			bookingFieldsResponses,
			idempotencyKey: idempotencyKeyRef.current,
			externalSignal: abortControllerRef.current.signal,
			// W1-02-F4–F8 fix (bundle 17): thread the merged copy + the
			// author-tunable timeout into the POST.
			errorCopy,
			timeoutMs: fetchTimeoutMs,
			// W1-02-F26/F27 fixes: same self-hosted base URL + API version
			// as the slots GET.
			apiBaseUrl: calApiBaseUrl,
			apiVersion: calApiVersion,
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
					);
			setSubmitError(errorMessage);
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
		fetchTimeoutMs,
		// W1-02-F26/F27 fixes: a live base-URL/version edit in the panel
		// re-targets the POST on the next submit.
		calApiBaseUrl,
		calApiVersion,
		// W1-14-F2 fix: the body reads copy.unknownErrorLabel and
		// copy.errorFallbackMessage (L7949/7952) - an author editing the
		// Copy panel in Framer kept stale error strings being POSTed
		// server-side.
		copy,
		// W1-14-N1 fix: stable-identity ([] deps) callback read by the body,
		// listed for exhaustive-deps correctness.
		transitionFlowStatus,
	]);

	const handleContinue = React.useCallback(() => {
		if (!currentStep) return;
		if (flowStatus === "submitting") return;

		// F-03-2 fix: was `isLast && currentStep.stepType === "review"` — the
		// re-validate-all-prior guarantee only fired when the review step was
		// terminal. An author placing the review step mid-flow lost it
		// entirely. Re-validate on ANY review step entry; if all prior steps
		// are valid the flow simply continues (below).
		if (currentStep.stepType === "review") {
			const firstInvalidIdx = activeSteps.findIndex(
				// W1-14-F4 fix: ref read — `values` left the dep array.
				(s) => !validateStep(s, valuesRef.current, validationCopy).valid,
			);
			// W2-33-A4 fix: was raw `currentIndex` — when an author
			// disables a step mid-flow, `currentIndex` can exceed the
			// clamped range the visitor is actually on, sending the
			// jump-back to the wrong step (or a no-op that looks like a
			// stall). Compare against the clamped index instead.
			if (firstInvalidIdx >= 0 && firstInvalidIdx !== safeCurrentIndex) {
				const invalidStep = activeSteps[firstInvalidIdx];
				setErrors((prev) => ({
					...prev,
					...validateStep(invalidStep, valuesRef.current, validationCopy)
						.errors,
				}));
				setTouched((prev) => touchAllFieldsIn(invalidStep, prev));
				playStepEnterAnimationRef.current = true;
				setCurrentIndex(firstInvalidIdx);
				scheduleFocusTimer(() => focusFirstInvalidField(invalidStep));
				return;
			}
		}

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
		playStepEnterAnimationRef.current = true;
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
		playStepEnterAnimationRef.current = true;
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
			if (stepIndex > safeCurrentIndex) return;
			// W1-03-7 fix: claim the navigation lock exactly like
			// handleContinue/handleBack do, so a double-click on the Edit
			// link cannot trigger two transitions in the same commit.
			if (navigatingRef.current) return;
			navigatingRef.current = true;
			playStepEnterAnimationRef.current = true;
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
		const msg = submitError || "";
		const slotTaken =
			msg.includes("just taken") || msg.includes("no longer available");
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
				playStepEnterAnimationRef.current = true;
				React.startTransition(() => setCurrentIndex(dtIdx));
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

	const handleRestart = React.useCallback(() => {
		valuesRef.current = {};
		setValues({});
		setErrors({});
		setTouched({});
		setPickedDate(null);
		setVisibleMonth(null);
		setSubmitError(null);
		setBookingResult(null);
		playStepEnterAnimationRef.current = false;
		setCurrentIndex(0);
		transitionFlowStatus("in-progress");
		submittingRef.current = false;
		if (typeof window !== "undefined" && persistState) {
			try {
				window.sessionStorage.removeItem(sessionKey);
			} catch (err: unknown) {
				console.warn(
					"BookingEngine: failed to clear saved progress on restart.",
					err,
				);
			}
		}
	}, [persistState, sessionKey, transitionFlowStatus]);

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
		};
		setValues(
			(prev) => ({ ...prev, [SELECTED_SLOT_KEY]: payload }) as BookingValues,
		);
		// T3-H2: a *different* slot is a different booking — the previous
		// slot's retry key must never be reused for it.
		idempotencyKeyRef.current = null;
		// Live-clear the error once a slot is chosen.
		setTouched((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: true }));
		setErrors((prev) => ({ ...prev, [SELECTED_SLOT_KEY]: null }));
	}, []);

	// T6-H3 fix: inline arrows recreated these callbacks every render,
	// defeating the memoization of the inlined child components.
	// T6-L9 fix: the calendar's transient day goes to `pickedDate`; the
	// booked slot itself stays canonical in `values[SELECTED_SLOT_KEY]`.
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
			fontSize: font?.fontSize || 15,
			lineHeight: font?.lineHeight || 1.4,
			letterSpacing: font?.letterSpacing || 0,
			fontWeight: font?.fontWeight || 400,
			fontStyle: font?.fontStyle || "normal",
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
		handleCancelSubmit,
		handleContinue,
		playStepEnterAnimation: playStepEnterAnimationRef.current,
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
		stepAnnouncement,
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
		regexPreviewVerdicts,
		errorCopy,
		fetchTimeoutMs,
		// W1-02-F26/F27/F30 + W2-23-N1 + W1-02-F28/F29 fixes: the
		// resolved author-tunable Cal.com + ICS integration values.
		calApiBaseUrl,
		calApiVersion,
		slotsCacheTtlMs,
		meetingDurationMs,
		icsFilenamePrefix,
		icsUidDomain,
	};
}

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
export default function BookingEngine(props: BookingEngineProps) {
	const {
		activeSteps,
		availableDates,
		backLabel,
		bookingResult,
		borderRadius,
		buttonLabels,
		completePct,
		copy,
		counterText,
		currentStep,
		emptyStepWarnings,
		errors,
		flowStatus,
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
		handleTimeFormatChange,
		hasCalConfig,
		playStepEnterAnimation,
		isCanvas,
		isFirst,
		isSubmitting,
		needsCalSetup,
		needsNameEmailGuardrail,
		prefersReducedMotion,
		primaryLabel,
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
		stepTransition,
		style,
		submitError,
		theme,
		timeFormat,
		timeZone,
		totalActive,
		touched,
		values,
		visibleMonth,
		returnHomeUrl,
		regexPreviewVerdicts,
		errorCopy,
		// W1-02-F28/F29 + W2-23-N1 fixes: resolved author-tunable ICS
		// branding + duration values, threaded to the SuccessScreen.
		meetingDurationMs,
		icsFilenamePrefix,
		icsUidDomain,
	} = useBookingEngineState(props);

	// SYN-03 fix: the in-flight POST cancel button previously hardcoded
	// "Cancel" — the only footer button not driven by buttonLabels. Use the
	// shared default for canvases saved before the control existed.
	const cancelSubmitLabel =
		buttonLabels?.cancelSubmitLabel ?? DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL;

	// Fixed foreground for the accent-filled submit button and its spinner.
	// A constant — never derived from the configured colours.
	const accentTextOnSurface = TEXT_ON_ACCENT;

	// W1-19-N3 fix: the form-grid two-column decision was a VIEWPORT media
	// rule — embeds in narrow desktop sidebars stayed 2-col (cramped,
	// inputs clipped). Every other responsive decision in this file uses
	// container width via ResizeObserver (L757, L3511), so the grid now
	// does too: measure RootShell, collapse below COMPACT_BREAKPOINT (the
	// file-wide container threshold), and the @media rule is gone.
	const engineRootRef = React.useRef<HTMLDivElement | null>(null);
	const [engineWidth, setEngineWidth] = React.useState<number>(320);
	React.useEffect(() => {
		const node = engineRootRef.current;
		if (!node || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setEngineWidth(entry.contentRect.width);
			}
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

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
					dateLabel={copy.dateLabel}
					timeLabel={copy.timeLabel}
					googleCalendarLabel={copy.googleCalendarLabel}
					outlookCalendarLabel={copy.outlookCalendarLabel}
					returnHomeLabel={copy.returnHomeLabel}
					returnHomeUrl={returnHomeUrl}
					// W1-02-F9–F16 fix: confirmation reference + manage link
					// labels and the .ics/notes copy are author-localisable.
					confirmationNumberLabel={copy.confirmationNumberLabel}
					rescheduleOrCancelLabel={copy.rescheduleOrCancelLabel}
					notesSelectedTimeLabel={copy.notesSelectedTimeLabel}
					notesDatePrefix={copy.notesDatePrefix}
					notesTimePrefix={copy.notesTimePrefix}
					icsProdid={copy.icsProdid}
					icsSummaryFallback={copy.icsSummaryFallback}
					// W1-02-F28/F29 + W2-23-N1 fixes: brandable .ics filename
					// prefix + UID domain, and the author-tunable fallback
					// meeting duration (ICS + deep links).
					icsFilenamePrefix={icsFilenamePrefix}
					icsUidDomain={icsUidDomain}
					meetingDurationMs={meetingDurationMs}
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
					onRetry={handleRetry}
					errorTitle={copy.errorTitle}
					errorSubtitle={copy.errorSubtitle}
					retryLabel={copy.retryLabel}
					supportContactLabel={copy.supportContactLabel}
					supportContactValue={copy.supportContactValue}
				/>
			</RootShell>
		);
	}
	return (
		<RootShell rootRef={engineRootRef} style={style} fontStack={fontStack}>
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

			{/* W1-20-M6 fix: canvas-only regex preview verdicts (live
                evaluation of the author's test input). Never rendered in
                preview or on the published site. */}
			{isCanvas && regexPreviewVerdicts.length > 0
				? regexPreviewVerdicts.map((verdict, verdictIdx) => (
						/* biome-ignore lint/a11y/useSemanticElements: intentional
                          polite status region (W1-13-F-13-9) for author-facing
                          verdicts. */
						<div
							key={`${verdict.fieldLabel}-${verdict.pattern}-${verdictIdx}`}
							// W1-13-F-13-9 fix: silent div → polite status
							// region for author-facing verdicts.
							role="status"
							aria-live="polite"
							aria-atomic="true"
							style={{
								padding: "10px 14px",
								marginBottom: 8,
								borderRadius: borderRadius,
								background: withAlpha(
									verdict.kind === "ok"
										? theme.successColor
										: verdict.kind === "mismatch"
											? theme.errorColor
											: theme.accentColor,
									0.1,
								),
								border: `1px solid ${withAlpha(
									verdict.kind === "ok"
										? theme.successColor
										: verdict.kind === "mismatch"
											? theme.errorColor
											: theme.accentColor,
									0.3,
								)}`,
								color: theme.textPrimaryColor,
								fontSize: 12,
								lineHeight: 1.4,
							}}
						>
							<strong style={{ color: theme.textPrimaryColor }}>
								{verdict.fieldLabel}
							</strong>
							<span style={{ opacity: 0.75 }}> — {verdict.message}</span>
							<div
								style={{
									fontFamily: "'SF Mono', Consolas, 'Courier New', monospace",
									fontSize: 11,
									opacity: 0.7,
									marginTop: 4,
									overflowWrap: "anywhere",
								}}
							>
								{verdict.pattern}
							</div>
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
							// change screen readers never heard. W1-10-A2
							// fix: the ANNOUNCEMENT now comes from the
							// single combined sr-only region above; this
							// visible row keeps only the visual text.
							// W1-10-OBS-3 fix: the W1-10-A6 era marked this
							// row aria-current="step", but that token is for
							// step INDICATOR/step links in a multi-step flow,
							// not plain text rows — semantically stretched,
							// so it's reserved for actual step navigation.
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
							aria-label={ariaLabels.bookingProgress}
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
								borderRadius: 999,
								overflow: "hidden",
							}}
							role="progressbar"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={completePct}
							aria-label={ariaLabels.bookingProgress}
						>
							{isStaticRender ? (
								<div
									style={{
										width: "100%",
										height: "100%",
										background: theme.accentColor,
										borderRadius: 999,
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
										borderRadius: 999,
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
						>
							<span>{counterText}</span>
							<span>
								{copy.stepProgressLabel.replace("{pct}", String(completePct))}
							</span>
						</div>
					) : null}
				</div>
			) : null}

			{/* Step content with smooth transition between steps.
                AnimatePresence mode="sync" runs enter/exit together. Exiting
                steps leave document flow via position:absolute (isPresent),
                so the form height follows the active step without popLayout
                layout projection (which left reverse-nav destinations at
                opacity 0). */}
			<form
				// T5-L6 fix: give the form an accessible name so screen
				// readers can distinguish it from other forms on a page.
				aria-label={ariaLabels.bookingForm}
				// ADVANCE-FIX: the sticky footer nav (and its Continue
				// submit button) lives OUTSIDE this <form> element, so a
				// descendant type="submit" button could never submit it.
				// This stable id lets the Continue button associate with
				// the form via the `form` HTML attribute (form-owner
				// resolution) — restoring both click-to-submit and
				// Enter-to-submit without moving the sticky footer. Plain
				// constant (like gridLabelId) so SSR/first-client-render
				// always agree; multi-instance pages may share the id
				// (harmless — one engine is visible per page at a time).
				id="be-booking-form"
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
				}}
			>
				<AnimatePresence mode="sync" initial={false}>
					<AnimatedStepContent
						key={safeCurrentIndex}
						transition={stepTransition}
						playEnterAnimation={playStepEnterAnimation}
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
								// W1-19-F-09 fix: when the browser
								// scrolls this focus target into view
								// (native focus scroll / page restore),
								// keep it clear of any sticky headers
								// or the sticky footer nav.
								scrollMarginTop: 72,
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
							ariaLabels={ariaLabels}
							errorCopy={errorCopy}
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
						/>
					</AnimatedStepContent>
				</AnimatePresence>
			</form>

			{/* Footer nav */}
			{/* T10-H2 fix: sticky so Back/Continue stay reachable on long
                steps instead of scrolling out of view; background matches
                the root so content never shows through. */}
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
					background: theme.backgroundColor,
					paddingTop: 12,
					paddingBottom:
						// W1-19-N4 fix: same `, 0px` fallback as the
						// submit bar — non-notch browsers evaluate the
						// whole calc() as invalid otherwise.
						"calc(12px + env(safe-area-inset-bottom, 0px))",
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
							// W1-18-F1 fix: gated on prefers-reduced-motion.
							transition: prefersReducedMotion ? "none" : "opacity 0.15s ease",
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
							cursor: "pointer",
							// W1-18-F1 fix: gated on prefers-reduced-motion.
							transition: prefersReducedMotion ? "none" : "opacity 0.15s ease",
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
					// `form` attribute explicitly links it to the
					// booking form by its stable id, making it that form's
					// submit control again.
					form="be-booking-form"
					type="submit"
					disabled={isSubmitting}
					// W1-10-A10 / W2-28-F6 fix: reading "Continue" + a
					// visual spinner told screen reader users nothing in
					// progress — the button now exposes aria-busy while
					// the POST is in flight so the update is announced.
					aria-busy={isSubmitting ? true : undefined}
					style={{
						minHeight: TOUCH_TARGET_MIN,
						padding: "10px 22px",
						borderRadius: borderRadius,
						border: "none",
						background: theme.accentColor,
						color: accentTextOnSurface,
						fontFamily: "inherit",
						fontSize: 14,
						fontWeight: 600,
						cursor: isSubmitting ? "not-allowed" : "pointer",
						opacity: isSubmitting ? 0.7 : 1,
						// W1-18-F1 fix: gated on prefers-reduced-motion.
						transition: prefersReducedMotion ? "none" : "opacity 0.15s ease",
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
									border: `2px solid ${accentTextOnSurface}`,
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
.be-input:focus-visible {
    outline: 2px solid ${theme.accentColor};
    outline-offset: 1px;
}
/* W1-11-A5/A6 fix: the Back/Continue buttons, month-nav arrows,
   slot-list retry, review Edit links and success/error-screen buttons
   had no keyboard-focus styling at all — an invisible focus ring on
   14 interactive elements. One scoped rule covers them all; currentColor
   adapts to each element's own text color. */
.be-motion-root :is(button, a, select):focus-visible {
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
   page. Covers every interactive element group in the flow. */
.be-motion-root :is(button, a, [role="button"], [role="radio"], [role="checkbox"], select) {
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
}
/* Placeholder colour: a fixed 60% pre-blend of the primary text over the
   surface, applied as a solid colour with opacity:1 (a constant choice —
   never derived from the configured colours). */
.be-motion-root input::placeholder,
.be-motion-root textarea::placeholder {
    color: ${withAlpha(theme.textPrimaryColor, 0.6, theme.surfaceColor)};
    opacity: 1;
}
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
				className="be-motion-root"
				ref={props.rootRef}
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
	theme: {
		accentColor: string;
		backgroundColor: string;
		surfaceColor: string;
		textPrimaryColor: string;
		textSecondaryColor: string;
		borderColor: string;
		errorColor: string;
		successColor: string;
	};
	borderRadius: string | number;
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
		engineWidth,
		isSubmitting = false,
	} = props;

	// W1-10-N2 fix: the slot-error banner id must be scoped per StepBody
	// instance — two BookingEngine instances on one page used to collide on
	// these ids (the label and aria-describedby resolved against the first
	// instance). SSR/hydration fix: plain constant (see gridLabelId).
	const slotErrorId = "be-slot-error";

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
					choiceGroupAriaLabel={ariaLabels.choiceGroup}
					selectOptionLabel={copy.selectOptionLabel}
					// W1-20-N1 fix: freeze authored fields during the POST.
					isSubmitting={isSubmitting}
					/>
				))}
			</div>
		);
	};

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
				timeZone={timeZone}
			/>
		);
	}

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
                       in its usual position directly under the progress bar.
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
							accentColor={theme.accentColor}
							backgroundColor={theme.backgroundColor}
							textColor={theme.textPrimaryColor}
							borderColor={theme.borderColor}
							radius={borderRadius}
							// W1-02-F17 fix: demo-grid times are copy-driven so
							// the canvas preview isn't stuck at 09:00–17:00.
							startTime={copy.demoStartTime}
							endTime={copy.demoEndTime}
							interval={copy.demoInterval}
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
							// W1-10-N4 fix: slot-pick announcement template.
							timeSlotSelectedTemplate={
								copy.timeSlotSelectedTemplate ??
								DEFAULT_COPY_TIME_SLOT_SELECTED_TEMPLATE
							}
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
					gap: 12,
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
});

// =============================================================================
// ReviewStepBody — auto-summarizes prior steps
// =============================================================================

const ReviewStepBody = React.memo(function ReviewStepBody(props: {
	step: NormalizedStep;
	steps: NormalizedStep[];
	values: BookingValues;
	theme: StepBodyProps["theme"];
	borderRadius: string | number;
	copy: BookingEngineProps["copy"];
	// T10-H1 fix: Edit link per entry jumps straight back to the step that
	// owns the field/slot, instead of forcing Back-Back-Back.
	onJumpToStep?: (stepIndex: number) => void;
	// W1-07-F7 fix: the slot instant is formatted in the visitor's zone
	// (same zone the calendar displayed), so the review date can't drift
	// from what the visitor clicked.
	timeZone?: string;
}) {
	const { steps, values, theme, borderRadius, copy, onJumpToStep, timeZone } =
		props;
	// Fix #2: derive labels from field metadata across ALL form steps, not
	// from the raw `values` keys (which are normalized IDs like "step-0-field-0").
	const entries: Array<{
		id?: string;
		label: string;
		value: string;
		stepIndex: number;
	}> = [];
	let datetimeStepIndex = -1;
	steps.forEach((stepEntry, stepIdx) => {
		if (stepEntry.stepType !== "form" && stepEntry.stepType !== "datetime")
			return;
		if (stepEntry.stepType === "datetime" && datetimeStepIndex === -1) {
			datetimeStepIndex = stepIdx;
		}
		for (const field of stepEntry.fields) {
			const value = values[field.id];
			if (value === undefined || value === "") continue;
			entries.push({
				id: field.id,
				label: field.label,
				value: String(value),
				stepIndex: stepIdx,
			});
		}
	});
	if (values[SELECTED_SLOT_KEY]) {
		const slot = values[SELECTED_SLOT_KEY];
		// W1-07-F7 fix: `slot.date` is the calendar CELL's browser-local
		// midnight — formatting it in the visitor's zone showed a date that
		// could disagree with the clicked cell (≥12h tz drift) and the ICS
		// filename. A real Cal.com slot carries its actual UTC instant in
		// `time24h`; derive the label from that instant instead, falling
		// back to `slot.date` only for demo mode (minute-steps grid, no
		// "T" in the value). Formatted in the zone the calendar displayed.
		const fmtOpts: Intl.DateTimeFormatOptions = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const tzOpts = timeZone ? { timeZone } : undefined;
		let dateStr: string;
		try {
			const slotDate = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
				? new Date(slot.time24h)
				: slot.date;
			dateStr = slotDate.toLocaleDateString(pageLocale(), {
				...fmtOpts,
				...tzOpts,
			});
		} catch {
			dateStr = slot.date.toLocaleDateString(pageLocale(), fmtOpts);
		}
		// T10-H4 fix: "Date"/"Time" row labels come from copy. W1-02-F24:
		// the in-component `||` fallbacks were removed (they duplicated the
		// copy panel's own defaults).
		entries.push({
			label: copy.dateLabel,
			value: dateStr,
			stepIndex: datetimeStepIndex,
		});
		entries.push({
			label: copy.timeLabel,
			value: slot.timeLabel,
			stepIndex: datetimeStepIndex,
		});
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
										onClick={() => onJumpToStep(entry.stepIndex)}
										// W1-10-A8 fix: a bare "Edit" repeats
										// identically on every row — screen
										// reader users can't tell which row a
										// button belongs to. Name it with the
										// row it edits.
										aria-label={
											entry.label
												? `${copy.editLabel}: ${entry.label}`
												: copy.editLabel
										}
										style={{
											border: "none",
											background: "none",
											padding: 0,
											// W1-19-F-03 fix: the Edit link
											// was a ~40×16 text blob — under
											// the 44×44px touch-target
											// minimum. The hit area is grown
											// to 44×44 while the label keeps
											// its small type.
											minWidth: 44,
											minHeight: 44,
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
											color: theme.accentColor,
											fontSize: 12,
											fontWeight: 500,
											cursor: "pointer",
											fontFamily: "inherit",
										}}
									>
										{copy.editLabel}
									</button>
								) : null}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
});

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
	} = props;

	// W1-10-N2 fix: field ids were instance-scoped so two BookingEngine
	// instances on one page collided — `<label
	// htmlFor>`, `aria-describedby` and error wiring all resolved to the
	// wrong (first) instance's controls. SSR/hydration fix: ids are now
	// derived from the (props-stable) `field.id` only, with no instance
	// prefix — identical in the prerendered HTML and the client's first
	// render, so the label/input id pair always resolves within this field
	// and nothing id-derived can mismatch. Multi-instance pages can share
	// ids (harmless here — one engine is visible per page at a time).
	// (The old `fieldId` helper was removed in the hydration audit — it
	// was declared but never called.)

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

	const labelEl = (
		<label
			htmlFor={`be-field-${field.id}`}
			style={{
				display: "block",
				fontSize: 13,
				fontWeight: 500,
				color: theme.textPrimaryColor,
			}}
		>
			{field.label}
		</label>
	);

	const errorEl = error ? (
		<div
			id={`be-error-${field.id}`}
			style={{
				color: theme.errorColor,
				fontSize: 12,
			}}
			role="alert"
		>
			{error}
		</div>
	) : null;

	const containerStyle: React.CSSProperties = {
		gridColumn: field.width === "half" && isTwoCol ? "span 1" : "span 2",
		display: "flex",
		flexDirection: "column",
		gap: 6,
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

	const inputBaseStyle: React.CSSProperties = {
		width: "100%",
		minHeight: TOUCH_TARGET_MIN,
		padding: "10px 14px",
		borderRadius: borderRadius,
		border: `1px solid ${error ? theme.errorColor : theme.borderColor}`,
		background: theme.surfaceColor,
		color: theme.textPrimaryColor,
		fontFamily: "inherit",
		// W1-19-F-02 fix: was a flat 14 (see inputFontSize above).
		fontSize: inputFontSize,
		boxSizing: "border-box",
		// W1-18-F1 fix: gated on prefers-reduced-motion.
		transition: reducedMotion ? "none" : "border-color 0.15s ease",
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
						id={`be-field-${field.id}`}
						// W1-20-N5 fix: prefer the author-mapped Cal field id
						// as the semantic form name — autofill/password
						// managers key on name, and "step-1-field-0" gives
						// them nothing. Falls back to the normalized id.
						name={field.calFieldId || field.id}
						className={`be-input`}
						value={typeof value === "string" ? value : ""}
						placeholder={field.placeholder || ""}
						required={field.required}
						// W1-20-N1 fix: freeze during the POST — an edit after
						// the payload snapshot would only land in state and
						// vanish on success.
					disabled={isSubmitting}
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
							id={`be-field-${field.id}`}
							// W1-20-N5 fix: same semantic-name preference as
							// the textarea/input sites above.
							name={field.calFieldId || field.id}
							className={`be-input`}
							value={typeof value === "string" ? value : ""}
							required={field.required}
							// W1-20-N1 fix: freeze during the POST (see textarea).
							disabled={isSubmitting}
							onChange={(e) => onFieldChange(field.id, e.target.value)}
							aria-invalid={!!error}
							aria-describedby={
								error ? `be-error-${field.id}` : undefined
							}
							style={{
								...inputBaseStyle,
								cursor: isSubmitting ? "not-allowed" : "pointer",
								appearance: "none",
								paddingRight: 36,
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
								stroke={theme.textSecondaryColor}
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
						controlledValue={typeof value === "string" ? value : undefined}
						ariaInvalid={!!error}
						ariaDescribedBy={
							error ? `be-error-${field.id}` : undefined
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
						id={`be-field-${field.id}`}
						// W1-20-M2 fix: `name` was missing everywhere, so
						// password managers couldn't group fields and
						// autofill had nothing to key on.
						// W1-20-N5 fix: the author-mapped Cal field id is
						// the semantic name autofill keys on; the normalized
						// internal id stays as the fallback.
						name={field.calFieldId || field.id}
						className={`be-input`}
						type={
							field.fieldType === "email"
								? "email"
								: field.fieldType === "phone"
									? "tel"
									: "text"
						}
						// W1-20-N3 fix: surface the author's custom-regex as a
						// native `pattern` hint too. The form is `noValidate`
						// (W1-04-F-8) so enforcement stays with our own
						// validateField — this only gives browsers/autofill a
						// declarative description of the expected format.
						pattern={
							(field.validationRule ?? "type") === "custom-regex"
								? field.customRegex || undefined
								: undefined
						}
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
					onChange={(e) => onFieldChange(field.id, e.target.value)}
					aria-invalid={!!error}
					aria-describedby={
						error ? `be-error-${field.id}` : undefined
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
	textPrimaryColor: string;
	textSecondaryColor: string;
	surfaceColor: string;
	borderColor: string;
	successColor: string;
	borderRadius: string | number;
	onRestart: () => void;
	successTitle: string;
	successSubtitle: string;
	addToCalendarLabel: string;
	restartLabel: string;
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
	// T10-L6 fix: "return to home" link. `returnHomeUrl` empty → hidden.
	returnHomeLabel: string;
	returnHomeUrl: string;
	// W1-02-F9–F23 fix: confirmation reference, manage link, .ics and
	// notes-section copy are author-localisable.
	confirmationNumberLabel: string;
	rescheduleOrCancelLabel: string;
	notesSelectedTimeLabel: string;
	notesDatePrefix: string;
	notesTimePrefix: string;
	icsProdid: string;
	icsSummaryFallback: string;
	// W1-02-F28 fix: brandable .ics download filename prefix.
	icsFilenamePrefix: string;
	// W1-02-F29 fix: brandable fallback UID domain (non-UUID path only).
	icsUidDomain: string;
	// W2-23-N1 fix: author-tunable fallback meeting duration (ms).
	meetingDurationMs: number;
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
		confirmationNumberLabel,
		rescheduleOrCancelLabel,
		notesSelectedTimeLabel,
		notesDatePrefix,
		notesTimePrefix,
		icsProdid,
		icsSummaryFallback,
		icsFilenamePrefix,
		icsUidDomain,
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

	// W1-18-N2 fix: the checkmark previously appeared instantly — a brief
	// scale/fade entrance makes the confirmation feel celebratory. Gated
	// on prefers-reduced-motion (fade-only, no transform, short duration).
	const reducedMotion = useReducedMotion();

	// Build a label/value summary from every form step's fields.
	const entries: Array<{ id?: string; label: string; value: string }> = [];
	for (const stepEntry of steps) {
		if (stepEntry.stepType !== "form" && stepEntry.stepType !== "datetime")
			continue;
		for (const field of stepEntry.fields) {
			const value = values[field.id];
			if (value === undefined || value === "") continue;
			entries.push({ id: field.id, label: field.label, value: String(value) });
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
		entries.push({ label: dateLabel, value: dateStr });
		entries.push({
			label: timeLabel,
			value: timeZoneLabel
				? `${slot.timeLabel} (${timeZoneLabel})`
				: slot.timeLabel,
		});
	}

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
	const icsDateStamp = (() => {
		if (!values[SELECTED_SLOT_KEY]) return "";
		const slot = values[SELECTED_SLOT_KEY];
		const iso = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
			? slot.time24h
			: slot.date.toISOString();
		// W1-07-N2 fix: was `iso.slice(0, 10)` — the UTC calendar date,
		// which disagrees with the visitor-tz date shown on the success
		// screen on cross-tz bookings (NYC visitor booking a late-UTC
		// slot saw Dec 16 on screen but downloaded booking-12-15.ics).
		// getDateKeyInTimeZone formats the key in the visitor's zone
		// (invalid zone falls back to browser-local, same guard chain).
		return getDateKeyInTimeZone(new Date(iso), timeZone || "");
	})();

	const icsUri = values[SELECTED_SLOT_KEY]
		? buildIcsDataUri(
				values[SELECTED_SLOT_KEY],
				icsDescription || undefined,
				icsSummaryLabel,
				icsProdid,
				icsSummaryFallback,
				// W2-23-N1 fix: author-tunable fallback duration.
				meetingDurationMs,
				// W1-02-F29 fix: author-brandable UID domain.
				icsUidDomain,
			)
		: "";

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

	// CC-11 fix: surface the booking reference, when one was returned.
	if (bookingResult?.uid) {
		entries.push({
			label: confirmationNumberLabel,
			value: bookingResult.uid,
		});
	}

	return (
		/* biome-ignore lint/a11y/useSemanticElements: intentional assertive
            live region (CC-6) announcing the success screen; <output> is not
            a screen-level alert container. */
		<div role="status" aria-live="assertive" aria-atomic="true">
			{/* Circle with checkmark — centered, on top */}
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					marginBottom: 16,
				}}
			>
				<motion.div
					initial={reducedMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
					animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
					transition={{ duration: reducedMotion ? 0.15 : 0.35, ease: "easeOut" }}
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
						<polyline points="20 6 9 17 4 12" />
					</svg>
				</div>
				</motion.div>
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
						// W1-02-F28 fix: filename prefix is author-brandable
						// (default "booking-"); the YYYY-MM-DD stamp + ".ics"
						// extension always follow it.
						download={`${icsFilenamePrefix}${icsDateStamp}.ics`}
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
				<button
					type="button"
					onClick={onRestart}
					style={{
						minHeight: TOUCH_TARGET_MIN,
						padding: "10px 18px",
						borderRadius: borderRadius,
						border: "none",
						background: accentColor,
						// Fixed foreground for the accent-filled button.
						// A constant — never derived from the configured
						// colours.
						color: TEXT_ON_ACCENT,
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
						{/* W1-02-F5 fix: shared constant fallback (was inline "Done"). */}
						{returnHomeLabel ?? DEFAULT_COPY_RETURN_HOME_LABEL}
					</a>
				) : null}
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
	onRetry: () => void;
	errorTitle: string;
	errorSubtitle: string;
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
		onRetry,
		errorTitle,
		errorSubtitle,
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
		<div role="alert" aria-live="assertive" aria-atomic="true">
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
						// Fixed foreground for the accent-filled button.
						// A constant — never derived from the configured
						// colours.
						color: TEXT_ON_ACCENT,
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
			options: ["type", "none", "email", "phone", "min-length", "custom-regex"],
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
		// W1-20-M6 fix: canvas-only test-input preview for the regex.
		// Scalar + same sibling-gate as `customRegex` — matches the
		// existing safe conditional-visibility pattern.
		regexPreviewInput: {
			type: ControlType.String,
			title: "Test Input (canvas)",
			defaultValue: "",
			placeholder: "Type sample text…",
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
				!CHOICE_FIELD_TYPES.includes(p?.fieldType || ""),
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
				placeholder: "Distinct form value (blank = use label)",
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
	};
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
			// SYN-03 fix: cancel affordance during an in-flight submission.
			cancelSubmitLabel: {
				type: ControlType.String,
				title: "Cancel Submit",
				defaultValue: DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL,
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
				// Default accent. Existing instances keep their own values;
				// in dark mode the pick() override swaps this light default
				// for DEFAULT_DARK_THEME.accentColor.
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
				defaultValue: "#DC2626",
			},
			successColor: {
				type: ControlType.Color,
				title: "Success",
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
			// W1-10-N3 fix: group label for the 12h/24h toggle.
			timeFormatLabel: {
				type: ControlType.String,
				title: "Time Format Toggle Label",
				defaultValue: DEFAULT_COPY_TIMEFORMAT_LABEL,
			},
			// W1-10-N4 fix: slot-pick live announcement template.
			timeSlotSelectedTemplate: {
				type: ControlType.String,
				title: "Time Selected Announcement",
				defaultValue: DEFAULT_COPY_TIME_SLOT_SELECTED_TEMPLATE,
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
			// W2-31-A-31-2 fix: ship with a disclosure default that actually
			// explains the opt-in behavior, instead of an empty string that
			// undermined the F-12-2 consent flow. Authors can edit or remove.
			privacyNotice: {
				type: ControlType.String,
				title: "Privacy Notice",
				defaultValue:
					"Your answers are saved in this browser so you can continue later. Cleared when you finish or press “Clear my saved answers”.",
				placeholder: "e.g. We only use your details to confirm your booking.",
				displayTextArea: true,
			},
			// T10-L1 fix: explanation of the required-field asterisk.
			requiredFieldsHint: {
				type: ControlType.String,
				title: "Required Fields Hint",
				defaultValue: "Fields marked * are required",
			},
			// SYN-02 fix: persistence disclosures rendered when persistState
			// is ON (saved-progress row) or a save failed (storage quota).
			savedAnswersLabel: {
				type: ControlType.String,
				title: "Saved Answers Note",
				defaultValue: DEFAULT_COPY_SAVED_ANSWERS_LABEL,
			},
			clearSavedAnswersLabel: {
				type: ControlType.String,
				title: "Clear Saved Answers",
				defaultValue: DEFAULT_COPY_CLEAR_SAVED_ANSWERS_LABEL,
			},
			saveFailedMessage: {
				type: ControlType.String,
				title: "Save Failed Message",
				defaultValue: DEFAULT_COPY_SAVE_FAILED_MESSAGE,
				displayTextArea: true,
			},
			// T10-L6 fix: label of the success-screen "Done" link.
			returnHomeLabel: {
				type: ControlType.String,
				title: "Return Home Label",
				// W1-02-F5 fix: shared constant (was an inline "Done").
				defaultValue: DEFAULT_COPY_RETURN_HOME_LABEL,
			},
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
			characterCountTemplate: {
				type: ControlType.String,
				title: "Character Count Format",
				defaultValue: DEFAULT_COPY_CHARACTER_COUNT_TEMPLATE,
			},
			requiredFieldMarker: {
				type: ControlType.String,
				title: "Required Field Marker",
				defaultValue: DEFAULT_COPY_REQUIRED_FIELD_MARKER,
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
			icsProdid: {
				type: ControlType.String,
				title: "ICS Product ID",
				defaultValue: DEFAULT_COPY_ICS_PRODID,
			},
			icsSummaryFallback: {
				type: ControlType.String,
				title: "ICS Summary Fallback",
				defaultValue: DEFAULT_COPY_ICS_SUMMARY_FALLBACK,
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
			demoStartTime: {
				type: ControlType.String,
				title: "Demo Start Time",
				defaultValue: DEFAULT_DEMO_START_TIME,
			},
			demoEndTime: {
				type: ControlType.String,
				title: "Demo End Time",
				defaultValue: DEFAULT_DEMO_END_TIME,
			},
			demoInterval: {
				type: ControlType.Number,
				title: "Demo Interval",
				defaultValue: DEFAULT_DEMO_INTERVAL,
				min: 15,
				max: 60,
				step: 5,
			},
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
						placeholder: "use {status} for the HTTP code",
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
						placeholder: "use {seconds} for the wait time",
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
					minLength: {
						type: ControlType.Number,
						title: "Min Length",
						defaultValue: DEFAULT_VALIDATION_COPY.minLength,
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
	// TZ-TIME-HARD-RULE: the "Initial Time Format" control was removed — the
	// 12h/24h format always defaults to 12h and is toggled by the END USER on
	// the live widget (see AGENTS.md).
	//
	// TZ-TIME-HARD-RULE: the "Time Zones" list control was removed — the time
	// zone is always auto-detected from the visitor's browser in code. No
	// author list, no manual time-zone picker, no Framer user exposure (see
	// AGENTS.md).
	//
	// NAV-GROUP-TOGGLE: opt into placing the Back and primary (Continue /
	// Book Now) buttons side-by-side. Defaults to OFF, so Back sits far left
	// and the primary action far right.
	groupNavButtons: {
		type: ControlType.Boolean,
		title: "Group navigation buttons together",
		defaultValue: false,
		enabledTitle: "Grouped",
		disabledTitle: "Split",
		description:
			"Default: Back on the far left, Continue/Book Now on the far right. Turn on to place them side-by-side.",
	},
	// W1-02-F1 fix (bundle 17): author-tunable Cal.com request timeout —
	// applies to both the availability GET and the booking POST.
	fetchTimeoutMs: {
		type: ControlType.Number,
		title: "Cal.com Timeout (ms)",
		defaultValue: 18000,
		min: 3000,
		max: 60000,
		step: 500,
	},
	// W1-02-F26 fix: Cal.com v2 API base URL — lets self-hosted Cal.com
	// deployments use the engine. Trailing slashes are stripped at use.
	calApiBaseUrl: {
		type: ControlType.String,
		title: "Cal.com API Base URL",
		defaultValue: DEFAULT_CAL_API_BASE_URL,
	},
	// W1-02-F27 fix: `cal-api-version` header value — adopt new Cal.com
	// v2 minor versions without a code change.
	calApiVersion: {
		type: ControlType.String,
		title: "Cal.com API Version",
		defaultValue: DEFAULT_CAL_API_VERSION,
	},
	// W1-02-F30 fix: author-tunable slots cache TTL — tune down for
	// high-velocity availability, up for low-churn bookings.
	slotsCacheTtlMs: {
		type: ControlType.Number,
		title: "Slots Cache TTL (ms)",
		defaultValue: SLOTS_CACHE_TTL_MS,
		min: 0,
		max: 30 * 60 * 1000,
		step: 60 * 1000,
	},
	// W2-23-N1 fix: author-tunable fallback meeting duration — used for
	// the .ics, the Google/Outlook deep links, and the success-screen
	// time when Cal.com's slot has no end.
	defaultMeetingDurationMs: {
		type: ControlType.Number,
		title: "Default Meeting Duration (ms)",
		defaultValue: DEFAULT_MEETING_DURATION_MS,
		min: 5 * 60 * 1000,
		max: 8 * 60 * 60 * 1000,
		step: 5 * 60 * 1000,
	},
	// W1-02-F28 fix: brandable .ics download filename prefix.
	icsDownloadFilenamePrefix: {
		type: ControlType.String,
		title: "ICS Filename Prefix",
		defaultValue: DEFAULT_ICS_FILENAME_PREFIX,
	},
	// W1-02-F29 fix: brandable fallback UID domain (only used when the
	// browser lacks crypto.randomUUID).
	icsUidDomain: {
		type: ControlType.String,
		title: "ICS UID Domain",
		defaultValue: DEFAULT_ICS_UID_DOMAIN,
	},
	// T10-L6 fix: destination of the success-screen "Done" link. Empty hides it.
	returnHomeUrl: {
		type: ControlType.String,
		title: "Return Home URL",
		defaultValue: "",
		placeholder: "https://your-site.com",
	},
});

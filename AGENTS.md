# AGENTS.md — Operating Rules for Future Agents

This file is read by humans AND by other AI agents (in future sessions or
future projects). It assumes the reader has **zero prior context** about the
conversation that produced these rules. If something looks like an oversight,
it probably is not — it is a deliberate, hard requirement. Read this file
before editing anything in this repository.

---

## Hard Rules — Do Not Reintroduce

The rules in this section are **non-negotiable**. They permanently override any
"best practice", accessibility guideline, audit finding, or review suggestion
that would contradict them. Do not "fix", "improve", "flag", or "revert" any of
these decisions.

### 1. No contrast checking, WCAG contrast validation, or automatic color/contrast suggestions — ever

This component (the Booking Engine, `Code-Components/BookingEngine.tsx`) must
**never** include any of the following, in the Framer canvas, in preview, or
anywhere else:

- Any computation of color-contrast ratios (relative luminance, WCAG contrast
  ratio, etc.).
- Any comparison of a color against a WCAG threshold (e.g. 4.5:1 text, 3:1
  non-text / 1.4.11).
- Any warning, notification, status message, badge, or overlay that tells the
  person configuring the component that a color choice "fails", "passes",
  "is below threshold", or "needs attention".
- Any "auto text picker" or automatic foreground/background decision that
  picks a text or icon color based on computed contrast against a background.

If you are tempted to add any of the above because you think it is helpful or
because some audit/review flagged color contrast as an issue, **do not**. The
absence of contrast checking is an intentional, permanent product decision,
not an oversight.

### 2. Never auto-select, auto-correct, or restrict a user's chosen colors

The component's colors (text, background, surface, border, accent, error,
success, etc.) are fully customizable by the person configuring it via Framer
property controls. The component must **never**:

- Force, restrict, auto-correct, or override a user-chosen color based on any
  computed contrast result.
- Auto-select or auto-pick a text/foreground color based on a background color.
- Interpose a derived color that is different from what the user configured.

The component's only job regarding color is to render **exactly** the colors
the author configures — nothing more. If a user wants white text on a white
background, that is their choice and their outcome to accept.

### 3. Color/contrast outcomes are the configurer's responsibility — never a finding

Any review, audit, "improvement" pass, or code review of this repository must
**explicitly ignore contrast / color-choice accessibility as a category of
finding**. Low contrast, unreadable combinations, or color choices that fail
WCAG are **not bugs** in this component. They must **not** be:
- flagged,
- reported,
- "fixed",
- or turned into a warning in the UI.

### Context / rationale (for the reader)

The component's palette is intentionally left entirely up to the person
configuring it. The product owner decided that the component must not second-
guess or police color choices. This was an explicit, deliberate decision — a
previously existing contrast-warning system and auto-text-picker were **removed
on purpose** to honor it. If you find contrast-related code, comments that
re-introduce it, or are about to write some, stop and consult this rule.

### 4. No "fields marked * are required" helper text or required-asterisks

Do not render a "Fields marked * are required" (or equivalent) helper line.
Do not render a required asterisk (`*`) — or any other required marker — next
to field labels. Per-field validation messages ("This field is required")
alone communicate required status.

### 5. No always-visible character counters

Do not display a running character count (e.g. "0/250") under or near inputs.
Max-length is an internal constraint only. Enforce it in validation and surface
an over-limit message in the same style/location as other field-level errors,
shown only on violation.

### 6. Field / error-message spacing must use flex `gap`

Space a field and its error message with flex `gap` on the field column. Do
not use margin or padding to separate the error from the input.

### 7. Autosave-to-browser is permanent and always-on

Autosave of answers to `sessionStorage` is a core, non-negotiable product
feature: hardcoded on, never optional. Do not add a Framer property control,
visitor toggle, or disclosure/helper text for it ("saved answers", "clear my
saved answers", privacy-notice-about-autosave, etc.). Keep the save/restore
logic; never expose a way to turn it off.

### 8. Time zone is always auto-detected from the end user's browser — never exposed as a control

The booking engine's time zone is a **runtime, per-visitor concern** and must
always be auto-detected from the end user's browser/locale via
`detectTimezone()` (the `timeZone` state starts at `"UTC"` for SSR/hydration
and swaps in the real IANA zone after mount). It must **never**:

- Render a visible/manual Time Zone `<select>` for the visitor (in either the
  working calendar view or the unavailable fallback).
- Expose a "Time Zones" list control, or any manual/curated time-zone list,
  in Framer Properties Controls.
- Restore a previously saved/persisted time zone that could override
  auto-detection (e.g. a stale `sessionStorage` zone from a different
  location).

The single auto-detected zone is what's sent to Cal.com's slots API (the
`timeZone` query param) and what every formatting helper uses, so slots are
always shown in the visitor's own local time regardless of the clinic/event's
configured zone. Do not reintroduce `COMMON_TIMEZONES`, a `timezones`
Properties-Controls array, a `timezoneOptions` list, or a time-zone change
handler.

### 9. Time format (12h/24h) stays an end-user-facing feature only — no "initial time format" preset

The 12h/24h time-format toggle is a legitimate per-viewer preference and must
remain available to the **end user** on the live widget. It must **never** be
presettable or restricted from Framer Properties Controls: there is no
"Initial Time Format" control, and the engine always defaults to 12h (the
`timeFormat` state starts at `"12h"`). The visitor's own chosen format may be
persisted to `sessionStorage` and restored — that is a per-viewer preference,
not an author preset. Do not reintroduce a `defaultTimeFormat` prop or its
property control.

### 10. Back / Book Now buttons default to far-left / far-right; grouping is opt-in

The footer navigation defaults to a **split layout**: the "Back" button sits
far left and the step's primary action ("Continue"/"Book Now") sits far right
— they are never adjacent by default. Grouping them side-by-side is **opt-in**
via the `groupNavButtons` ("Group navigation buttons together") property
control, which defaults to `false`. Do not change the default to grouped, and
do not place the two buttons adjacent in the default layout.

### 11. Step form state must persist on Back/Continue navigation within a session

Entered form values live in engine-level state (`values`/`valuesRef`) and must
be restored exactly when the visitor navigates Back or forward between steps
**within the same session** — not just via autosave-to-browser on reload. Back
navigation must never clear a previous step's entered data. This coexists with
(and is independent of) the autosave-to-browser feature: autosave persists
across page reloads, while in-session Back/forward restores from in-memory
state even before a debounced autosave has fired. Do not reset `values` on
step changes.

### 12. The "unavailable booking" fallback is a normal state, not an error

When the datetime step has no valid Cal.com API key + event ID on the
published site, the component shows an "unavailable" notice. This is an
**expected, normal state** (missing config), not an error. It must:

- Use neutral/informational styling — never error/red tones and never
  `role="alert"` (it is a `role="status"` informational message).
- Keep the step heading ("Pick a Time") and description in the exact same
  position/spacing as the working calendar state (directly under the progress
  bar) — no extra gap above them.

Do not restyle this fallback as alarming, do not color it with the error
palette, and do not push the heading down to make room for it.

---

## Ongoing Documentation Habit

Whenever the human explicitly requests a change, correction, or preference
that should be preserved long-term — especially anything that overrides a
"best practice" default, or anything the human has said "don't do this" or
"always do this" about — add it to this file under **Hard Rules — Do Not
Reintroduce** (or a clearly named equivalent section), phrased as a rule for
future agents to follow, not just a changelog entry.

The purpose is to prevent regressions when a different AI agent (without the
original conversation's context) later reviews or "improves" the code and
misinterprets an intentional absence or choice as an oversight.

### 13. Form state must persist across step navigation

**Form state must persist across step navigation. Navigating Back, Continue, or between steps must never clear or reset previously entered values. Step UI lifecycle/remounting must not determine the lifetime of form data.**

This is a **non-configurable core behavior**. It must not be removed or weakened by future optimization, refactoring, animation changes, or review passes. The form data must be kept in stable parent-level state that survives step unmounts/remounts. Never rely on the step component lifecycle for state preservation, and never reset the state upon entering a step.

Do not key browser autosave with a per-mount incrementing instance id. Keep a stable sessionStorage key plus an in-session memory snapshot so remounts restore the same answers immediately. Do not trim or reinitialize field values on every keystroke or on step change.

### 14. Only the active step may participate in normal layout flow

**Only the active step may participate in normal layout flow. The active step must be `position: relative` and visible; inactive rendered steps must be removed from normal flow using `position: absolute`, hidden appropriately, and must not intercept interaction. Step navigation must update this state correctly in both directions.**

This is a **permanent architectural rule**. Do not hide inactive steps with opacity alone while leaving them `position: relative`. Do not use `display: none` as the primary transition mechanism. Do not add arbitrary spacers, min-heights, or fixed-height workarounds so the form can ignore leftover inactive content. The form's height must follow the active step. Inactive steps must use `pointer-events: none` (or equivalent) so they cannot capture clicks or focus. Form state and step layout are separate concerns — do not use extra persistence layers to compensate for a layout bug.
### 15. Active-step opacity is never 0

**The active step must always resolve to `position: relative`, `opacity: 1`, and `pointer-events: auto`. Inactive rendered steps must resolve to `position: absolute`, `opacity: 0`, and `pointer-events: none`. Navigation in either direction must never leave the active step at opacity 0.**

Opacity is a function of the logical active/presence state, not leftover enter/exit animation from a previous step. Do not start a remounted destination step at `initial: { opacity: 0 }` without a guaranteed animate-to-1. This applies to every configured step index, not only Step 1 ↔ Step 2.

### 16. Restore saved step before the first visible paint

**When saved progress exists, the component must restore the saved current step before the first visible render so users never see an intermediate Step 1 flash before being moved to the saved step.**

Read the existing always-on sessionStorage payload in a layout effect (or equivalent pre-paint path) using a **stable** storage key. Do not wait for a post-paint `useEffect`. Do not introduce a second persistence system. No-saved-progress still starts at step 0.

### 17. Step visibility is deterministically derived from the active step

**Step visibility must be deterministically derived from the active step. The active step must always end at `position: relative`, `opacity: 1`, and `pointer-events: auto`; inactive steps must end at `position: absolute`, `opacity: 0`, and `pointer-events: none`. This must remain correct across unlimited repeated forward/back navigation. Do not use timing hacks, retries, or navigation-count-specific fixes.**

There must be a single source of truth (`activeStepIndex` → `isActive` → style). Do not maintain independent long-lived animation/opacity/position state that can desynchronize from the logical active step. Any recurrence of `active step at opacity 0` is an architectural regression — fix the deterministic derivation, do not add another conditional, timeout, forced repaint, or recovery patch.

### 18. Booking Engine maintains minimum visual height

**The main booking/form content area must maintain a sensible minimum height while still growing naturally with larger step content.** Use `min-height` (not fixed `height`) on the form container so short steps (e.g., Calendar fallback "Booking is currently unavailable") do not cause the component to shrink vertically. When a step contains more fields/content than the minimum, the component must expand to fit it. Apply generically to every step/configuration.

### 19. Progress-bar style defaults to Dashed

**The progress indicator's `barStyle` defaults to `Dashed` (segmented) but remains user-configurable via the existing Framer Properties Control.** The control must still offer both `Solid` and `Dashed`. Do not hard-code the style or remove the control. The runtime fallback must also default to `dashed` when the stored value is missing.

### 20. Saved-progress restoration must not cause hydration mismatches

**Saved-progress restoration must not introduce server/client or hydration mismatches (#425/#418/#422).** The server and initial client render must match (Step 1). Do not read `sessionStorage` synchronously during render/initializers. Restore the saved `currentIndex`/`values`/`timeFormat` in a layout effect (or equivalent pre-paint path) using the stable `booking-engine:session` key, after hydration but before paint, so the saved step appears without a visible Step 1 flash. Keep the stable key plus in-session memory snapshot for remounts, but do not let either cause initial-render divergence.

### 21. Animation architecture remains deterministic

**Future animation work must preserve the deterministic active-step visibility architecture.** The active step is the single source of truth; every transition variant must resolve to `relative/1/auto` for active and `absolute/0/none` for inactive, regardless of direction or number of steps. Do not reintroduce `AnimatePresence`/`usePresence`/enter-flag state that can desynchronize, and do not use opacity/position recovery hacks. The temporary three-option transition selector is for evaluation only and must not be documented as a permanent feature.

### 22. Step Transition control is the single source of truth for transition type

**The `Step Transition` Property Control is the single source of truth for which of the six production transition concepts is used.** The six options are `Fade Rise`, `Blur Scale`, `Slide`, `Zoom`, `Vertical Slide`, and `Blur Slide` — each must be meaningfully distinct, not minor variations. Do not add a second control to select transition type, and do not reintroduce the temporary floating selector/debug UI. The existing `Transition Duration` ( `transition` ) Property Control's duration must control **every** variant visibly — increasing the configured duration must lengthen all six variants.

### 23. Back and Forward transitions must be symmetric

**Back navigation must be the proper reverse of Forward for every transition variant and every configured step.** Do not switch the outgoing step to `position: absolute` with hard-coded `left:0/right:0` (or equivalent) in a way that causes an immediate layout jump; the position/layout transition architecture must keep the outgoing step visually stable during the animation. Do not patch Back with timing hacks, direction-specific timeouts, or navigation-count fixes.

### 24. Final transition control names and defaults

**`Transition Type` is the dropdown used to select the step-transition style and defaults to `Blur Scale`.** Keep all six options (`Fade Rise`, `Blur Scale`, `Slide`, `Zoom`, `Vertical Slide`, `Blur Slide`). **`Transition` controls timing and defaults to Ease In Out, cubic-bezier `0.44, 0, 0.56, 1`, `0.4s` duration, and `0s` delay.** Do not reintroduce a segmented control for transition type, do not rename these controls back to "Step Transition"/"Transition Duration", and do not change the default type away from `Blur Scale` or the default timing away from `0.4s`.

### 25. Navigation-button grouping lives inside the Buttons group and defaults to Split

**The navigation-button grouping control belongs inside the existing `Buttons` Property Control group (`buttonLabels`), not as a standalone top-level control.** It defaults to **Split** (Back far left, primary action far right) with the opt-in **Grouped** side-by-side option still available. Use a **short label** (one or two words — "Layout" with `Grouped`/`Split` options) and **no helper/description text** under it; the label and option titles must be self-explanatory. Do not reintroduce a long label, a description, or move the control back out of the Buttons group.

### 26. Cal.com integration internals are not Property Controls

**The Cal.com request timeout (`FETCH_TIMEOUT_MS`, 18s), the `cal-api-version` header value (`DEFAULT_CAL_API_VERSION`), the slots cache TTL (`SLOTS_CACHE_TTL_MS`, 5 min), and the ICS UID domain (`DEFAULT_ICS_UID_DOMAIN`) are internal implementation details.** They are **not** Property Controls and must not be re-exposed to Framer users. Do not reintroduce "Cal.com Timeout (ms)", "Cal.com API Version", "Slots Cache TTL (ms)", or "ICS UID Domain" controls. Adopting a new Cal.com API version is a component code update.

### 27. ICS download filename is fixed and generic

**The .ics download filename is the fixed, industry-neutral `Booking Appointment.ics` (`DEFAULT_ICS_FILENAME`) — never business-branded and never a Property Control.** The Booking Engine must stay suitable for clinics, hotels, consultants, travel businesses, and other industries without requiring the owner to customize the filename. Do not reintroduce an "ICS Filename Prefix" branding control.

### 28. Default Meeting Duration stays author-configurable

**`Default Meeting Duration (ms)` remains an exposed Property Control** because different businesses use different appointment lengths and it affects the .ics export, Google/Outlook deep links, and the success-screen time when a Cal.com slot carries no end. Keep its default (`DEFAULT_MEETING_DURATION_MS`, 30 min).

### 29. Return Home URL is author-facing; success never auto-redirects

**`Return Home URL` is an author-facing Property Control for a real visitor-facing navigation destination, and it defaults to the website root (`"/"`).** A successful booking must **show the success/result screen** (with its actions) and must **never automatically redirect** — the result screen stays visible until the visitor chooses an action, and only the "Return Home" button navigates to the configured URL. Do not reintroduce an empty default that hides the link, and do not add any auto-redirect after booking.

### 30. Confirmation copy: heading and subtitle never repeat each other

**The confirmation heading and subtitle must communicate different information.** The heading states the outcome and contains the word **"Successfully"** (default: "Booking successfully confirmed"); the subtitle tells the visitor what happens/what to do next (default: "Your appointment details are below — add them to your calendar."). Do not reintroduce duplicate message pairs like "Booking confirmed" + "Your booking is confirmed.", and do not promise email delivery the component cannot guarantee.

### 31. Confirmation actions: right-aligned, explicit Done, no auto-redirect

**Confirmation-state actions render in a right-aligned group (matching the footer's primary-action side).** Within the group, the accent-filled primary action is **"Book another"** at the far right, and **"Done" sits immediately to its left**; calendar/manage secondaries sit to Done's left. Navigating home is an **explicit visitor action only** — the confirmation screen stays visible until the visitor chooses an action. This refines (does not replace) rules 10 and 29.

### 32. Confirmation button labels and Home URL live in the Buttons group

**`Done` (`doneLabel`), `Book Another` (`bookAnotherLabel`), `Add to Calendar` (`addToCalendarLabel`), and `Home URL` (`homeUrl`) are controls inside the existing Buttons Property Control group (`buttonLabels`) — not a standalone group and not top-level controls.** Defaults preserve the previous copy ("Done" / "Book another" / "Add to calendar", home URL "/"). Runtime fallbacks mirror these defaults so instances saved before the move keep their behavior. Rule 29's behavior requirements are unchanged; note the control is now labeled "Home URL" inside Buttons.

### 33. Confirmation-circle animation reuses Transition Type; check mark draws itself

**The green confirmation circle's entrance must reuse the existing `Transition Type` selection (`TRANSITION_VARIANT_DEFS[transitionVariant]`) and the existing `Transition` timing control — including its duration override — exactly like step visibility does.** After the circle lands, the check mark animates as an SVG path draw (`pathLength` 0 → 1). Do not create a second transition-type control for the confirmation state, do not hard-code an unrelated animation family, and keep static-render/reduced-motion visitors at the final state (short fade at most).

### 34. Cal.com API Base URL stays author-facing

**`Cal.com API Base URL` (`calApiBaseUrl`, default `https://api.cal.com`) remains an exposed Property Control** because self-hosted Cal.com deployments point at a different origin — something only the site author knows. It feeds both Cal.com calls (slots GET and booking POST) with trailing slashes stripped at the use site. Unlike rule 26's internals, this is deployment configuration, not implementation detail; do not hard-code it.

### 35. Final confirmation copy defaults (supersedes rule 30 defaults)

**The confirmation heading default is `"Booked Successfully"`; the subtitle default is `"Your appointment details are below."`** Heading and subtitle still never repeat each other (rule 30's structural requirement stands). Subtitle copy must stay concise and natural: **no em dashes and no AI-style punctuation**, and it must only mention adding to a calendar when an actual calendar action is rendered on the confirmation state.

### 36. Add to Calendar action must exist and be configurable

**The confirmation state always offers a working Add to Calendar action wired to the existing ICS pipeline (`buildIcsDataUri`, fixed generic filename) — never a duplicate calendar system or an invented external-auth flow.** It renders whenever a booked slot exists (an .ics needs a date/time), sits inside the right-aligned confirmation group to the left of Done/Book another, and its label comes from the Buttons group (`addToCalendarLabel`, default `"Add to Calendar"`). Google/Outlook deep links may accompany it but do not replace it.

### 37. Check-mark draw direction is forward along the path

**The confirmation check mark must visibly trace its SVG path from its natural starting point at the lower-left tail (`4,12`), through the bottom vertex (`9,17`), ending at the upper-right tip (`20,6`) — i.e., `d="M4 12 9 17 20 6"` with `pathLength` 0 → 1.** Never reverse the path so it draws tip-first, and never fake the draw with an opacity reveal. Rule 33's requirements (reuse Transition Type for the circle, own draw animation for the check) are unchanged.

### 38. Cal.com event/profile metadata is Cal.com-sourced and must never block booking

**Event/organizer metadata for the Calendar-step information panel (organizer/business name, avatar/logo, event title, duration, location/meeting type, description) must be fetched from Cal.com (`GET /v2/event-types/{eventTypeId}`, endpoint-specific `cal-api-version: 2024-06-14`, same browser-exposed read-only key, Base URL honored) — never duplicated as new Framer Property Controls.** The panel belongs to the Calendar step only (info | calendar | times; stacks at narrow widths) and renders only from normalized metadata. **Any metadata failure — auth denial, self-hosted gap, malformed body, offline, timeout — must resolve to `null` and hide the panel; it must never delay availability, surface an error state, or block the booking flow.** The author's `Default Meeting Duration` remains the duration fallback when Cal.com returns no length; the visitor auto-detected time zone (rule 8) remains the only displayed zone.

### 39. Async Cal.com updates must never remount or reset the calendar month/date

**Asynchronous Cal.com metadata and availability updates must not remount, reset, or oscillate the calendar's current month/date state, and must never cause visible month flashing on Calendar-step entry or during data loading.** The calendar's own month changes (arrows, PageUp/Down, empty-month auto-advance, cross-month focus) are child-initiated and must never be re-synced against a stale parent `visibleMonth` prop that has not yet caught up via `onMonthChange`; the parent-prop sync is reserved for genuine external changes (saved-step restoration). Do not reintroduce the parent↔child month ping-pong, and do not fix flashing with arbitrary delays, timeouts, or loading gates.

### 40. Calendar metadata panel must preserve its layout with loading/fallback states

**The Calendar-step event-information panel must always occupy its layout slot when Cal.com is configured — never collapse or vanish.** The state machine is deterministic: "disabled" (no Cal.com config, panel hidden), "loading" (skeleton placeholders, identical markup server + client), "ready" (real Cal.com metadata), "failed" (neutral fallback text, no error tones). The initial state is derived from props alone so hydration is byte-identical. Metadata failure must never block or delay the calendar or booking flow (rule 38).

### 41. Time slots are a single column with no nested scroll; month nav is compact

**The time-slot area must render as one vertical column (no two-column grid) and must not contain a nested scroll area or a hidden action button — the panel ends naturally after its content.** The calendar-header month navigation buttons use a compact 32×32px footprint with a 16px gap between them, accessible and visually balanced with the month title. Do not reintroduce the 44px touch-target floor for these in-header controls, the two-column grid, or the `maxHeight:220` scroll container.

### 42. Calendar rendering must never bake wall-clock values into the initial markup

**The first server render and the first client render must be pure functions of props/constants — never of `new Date()`/`Date.now()`.** Framer's prerendered HTML is generated at publish time, so wall-clock-derived state (`today`, elapsed-slot instants, seeded month) differs from the hydrating visitor's and produces guaranteed #425/#418 mismatches across the calendar/slot tree. The deterministic pattern is mandatory: both sides render from fixed placeholders (`HYDRATION_PLACEHOLDER_TODAY`, "nothing elapsed yet"), then an isomorphic layout effect applies the real visitor-tz clock pre-paint (including advancing a self-seeded placeholder month). This refines rules 20 and 39; do not regress to clock-initialized state or mask the mismatch with `suppressHydrationWarning`.

### 43. Time-slot labels are plain times — no GMT/time-zone suffixes

**Individual time-slot buttons must render only the localized time (e.g. `9:00 AM`).** Never append `(GMT+3)`-style offsets or tz abbreviations to visible slot labels, whether before or after a date is selected. Slot identity lives in the ISO value/aria-labels/payload, not in button text. Visitor timezone behavior itself is unchanged (rule 8).

### 44. Time panel stays contained within the calendar row

**On wide layouts the available-times list is height-contained by the calendar-driven flex row (absolute-fill wrapper with internal overflow when many slots exist); on narrow widths it stacks with natural page flow.** It must never stretch the whole Booking Engine component downward. This refines rule 41's single-column requirement with bounded containment; do not reintroduce unbounded growth or fixed pixel caps like `maxHeight:220`.

### 45. Calendar opens on the actual current month

**When the visitor first enters the Calendar step without an explicitly selected date, the calendar must open on the actual current month (e.g., August 2026 when today is Aug 24, 2026, not September).** The initial month is derived from the current date via the visitor's timezone-aware clock, never hard-coded. Saved-state restoration (selected date's month) is preserved; the deterministic clock pattern of rule 42 still applies.

### 46. Adjacent-month dates show a generic month indicator on hover

**The calendar grid displays adjacent-month dates around the current month, and hovering (or focusing) a date that belongs to an adjacent month shows a compact month indicator (e.g., `SEP` for September) inside/above the cell.** The indicator is generic — it derives the month abbreviation from the hovered date's own month via `pageLocale()` — not a hard-coded September case. Dates in the currently displayed month never show this indicator.

### 47. Weekday labels are uppercase and readable; date hover is 2px

**Weekday labels (`SUN`–`SAT`) are rendered uppercase with increased visibility (higher contrast/weight) instead of the previous muted styling, while the month title remains strong but balanced.** Date-cell hover/focus rings use an approximately **2px** inset stroke (`inset 0 0 0 2px accentColor`) while preserving accessibility and the existing selected/today states.

### 48. Time-section header follows the Cal.com pattern

**The time-section header shows the currently selected day in a compact uppercase form (e.g., `MON 24th`) alongside a compact 12h/24h segmented control, not a full-width stretched control.** The outer control uses a slightly darker surface than the main white component background, while the active segment visually sits on the same white surface as the main component (white pill with soft shadow, muted inactive labels). Functionality and aria remain unchanged.

### 49. Availability slots are deterministically deduplicated before rendering

**Before date selection, the available-time list must never show the same daily range repeated per calendar day.** The time list is deduplicated deterministically by the slot's time-of-day identity (minutes/time value) so a `9:00 AM → 4:45 PM` range appears once, not many times. Selecting a date afterwards shows the correct single-day range. Do not hide duplicates visually; fix the source and deduplicate by slot identity.

### 50. Selected date and today are separate states — exactly one selection

**Selected-date styling derives ONLY from dedicated selected-date state — never from `isToday`.** Exactly one date can be selected at a time; picking another date must immediately clear the previous accent fill (today reverts to an ordinary cell with its dot). Today's marker is a small independent dot beneath the number (`currentColor`, aria-hidden) that coexists with any selection. On a fresh visit today is the DEFAULT selection: the deterministic placeholder day renders on both sides' first markup, then the clock layout effect swaps in real today pre-paint; a restored/saved date always wins over the default, and an engine `null` initialDate must not wipe it.

### 51. Adjacent-month grid behavior: aligned empties, live adjacent days, generic month identification

**The 7-column grid stays perfectly aligned.** Leading previous-month cells that are past/unavailable render as EMPTY non-interactive gridcells (Cal.com-style blanks); trailing next-month cells stay in the grid and are selectable when availability exists (the widened slots fetch covers month edges) — adjacency alone must never disable a date. Every adjacent-month cell carries a compact uppercase month abbreviation above its number (derived generically from the date via `pageLocale()`), plus a native full-month tooltip (`title`); in-month cells get neither.

### 52. Time header reflects the active date immediately; compact content-sized toggle

**The time-section header shows the active/default date on first entry — never empty.** Format: `MON` in the month-title treatment (16/700 full text color) + `23rd` ordinal in the muted year treatment (16/500 `mutedText`), weekday exactly three uppercase letters, ordinal attached to the day, all derived dynamically from the active date. The 12h/24h segmented control sits beside it content-sized (never stretched): ~32px tall, compact padding, 13px labels, slightly-darker track surface, white active pill with **dark active text** (never white-on-white) and muted inactive labels.

### 53. Time list scrolls but never shows a browser scrollbar

**The available-times list remains scrollable inside its contained panel while the scrollbar itself is hidden** via `scrollbar-width: none` + `-ms-overflow-style: none` + `::-webkit-scrollbar { width:0; height:0; display:none }` on `.be-dt-scroll`. Do not replace the scroll area with unbounded growth and do not reintroduce a visible scrollbar; keep the scoped `<style suppressHydrationWarning>` pattern for this constant CSS.

### 54. Precise event-avatar and metadata sizing

**The Calendar-step event-information avatar is exactly `32px × 32px` (image and fallback circle, `fontSize 14` initial) kept beside the organizer name in the horizontal layout.** Duration and location rows are `16px` text (weight 500, readable secondary color) with `24px × 24px` icons, visually secondary to the title but more readable than the previous muted/small treatment. Keep icons aligned with text via `inline-flex`.

### 55. Calendar navigation, weekday, and date-number typography

**Previous/next month buttons are `24px × 24px` with an `8px` gap between them; on hover an enabled button shows `rgba(229, 231, 235, 0.5)` (the same surface as the segmented control outer background), disabled buttons never gain hover styling.** Weekday labels are `12px` / `700` uppercase, column-aligned. Every calendar date number is `500` weight in every state (selected today vs adjacent vs disabled all share `500`; never use a heavier/lighter weight for selected).

### 56. Time slots, Time section layout, and time-header formatting

**Every available-time button is `36px` tall, `600` weight, centered, with text color at `75%` opacity of the base `textColor` token (elapsed/disabled stay muted).** The Time section header sits in the same horizontal row as the compact content-sized 12h/24h control (`12h 24h` side-by-side, outer darker surface than white, active white pill with dark text). The header's day label uses title-case `Mon 24th` (weekday short with first letter uppercase, rest lowercase, ordinal attached) at `16px`: weekday `700` full color like the month title, numeric + ordinal `500` muted like the year in `August 2026`, derived dynamically from the active/default date and visible immediately on first render (placeholder → real today pre-paint).

### 57. Adjacent-month labels: first date only, neutral, and availability-consistent

**The compact month abbreviation (`SEP`, `OCT`, …) appears only on the first visible date of each adjacent month, not on every adjacent cell.** It is positioned at `top: 1px; left: 50%; transform: translateX(-50%)` inside the date cell, uses a stable neutral/muted color (never the cell's hover/selected accent), and is removed entirely when that date becomes selected (selected styling takes over). It is generated dynamically from the date's own month (`pageLocale()`, `month:"short"` uppercase). Hovering an adjacent date shows a native `title` tooltip with the full month name + year; in-month dates get no tooltip. **Previewed adjacent-month availability must exactly match the real Cal.com source for that month:** never infer availability from visibility; if the adjacent month's slots have not been fetched yet, treat those dates as unavailable until the real data arrives, so `Sep 1` shows the same available/unavailable state while previewed in August and after navigating to September.

### 58. Shared Radius 0–24px is the single source of truth

**The `Radius` Property Control (Styles group) is limited to `0–24px` (min 0, max 24) and is the only radius token for the Booking Engine.** It drives the main container, the Time-Format segmented-control outer container, the active/highlighted segment, the calendar month-navigation buttons, and the progress-bar track/fill — all must read the same `radius` value. When `Radius` is `0`, every one of those surfaces becomes square (`border-radius: 0`), never retaining a pill radius. Do not hard-code separate `999`/`12px` radii for those elements and do not create another radius control.

### 59. Calendar navigation buttons are content-sized; metadata icons are 20×20 contained

**Previous/next month buttons have no fixed `24px × 24px` size — their dimensions come from the icon plus `6px` padding (`width: auto; height: auto; padding: 6px; display: inline-flex` centered).** Hover on an enabled button shows `background: <segmented-outer-background>` at `100%` opacity and `border: 1px solid <segmented-border>` at `100%` opacity; disabled buttons never show hover. **Event metadata icons (duration/location) are exactly `20px × 20px`, never overflowing:** each SVG sits in a stable `20px` wrapper (`width:20; height:20; flex-shrink:0; display:flex; alignItems:center; justifyContent:center`) that is vertically centered with the `16px` metadata text.

### 60. Radius control and runtime clamp

**`Radius` is a `ControlType.Number` (not `BorderRadius`) with `min: 0, max: 24, step: 1, unit: "px"` and `defaultValue: 12`.** Runtime styling also clamps the value to `0–24` before applying, so a programmatic value outside the range never reaches the DOM. This dual enforcement (control + runtime) keeps the Framer UI and the rendered component consistent.

### 61. Adjacent-month indicators and custom tooltips

**The 3-letter month abbreviation appears only on the first visible date of each adjacent month — both the next month (e.g., `OCT` above Oct 1 when viewing September) and the previous month (e.g., `AUG` above Aug 31 when viewing September).** It is generated dynamically, centered with `left: 50% + translateX(-50%)`, stable muted color, and removed when that cell becomes selected. **Hovering or focusing an adjacent-month date shows a single custom tooltip (not a native `title` browser tooltip) positioned above the cell with the full month name (e.g., `August`); it has `pointer-events: none`, does not affect layout, and disappears on leave/blur while the `aria-label` remains for accessibility.

### 62. Booking Engine is fluidly responsive at 850px default

**The Booking Engine's Framer default/design width remains `850px` (`@framerIntrinsicWidth 850`), but the rendered component is fluid: `width: 100%`, `maxWidth: 100%`, `minWidth: 0`, never `width: 850px` in runtime.** The root and all flex/grid children use `minWidth: 0` and `flex` shrinkability so the 3-column Calendar layout (event info | calendar | times) can reduce gaps/column widths at medium widths and reflow to a vertical stack (event info → calendar → times) at small widths without horizontal overflow, clipping, or unusable cells. Every state (calendar, time list, form, confirmation) participates.

### 63. No positive `tabindex` — the Calendar uses roving tabindex only

**Calendar date navigation must never use positive `tabindex` values (`1`, `2`, `3`, …).** Exactly one selectable date per visible grid (the active date: selected date, else first available of the month) renders `tabIndex={0}`; every other date cell renders `tabIndex={-1}`. Keyboard users Tab once into the grid's active cell and move with Arrow keys / Home / End / PageUp / PageDown via the cells' native keydown handlers. Positive tabindex creates a document-global tab sequence that hijacks ordering for the whole page; its reintroduction is an architectural regression.

### 64. Accessible Calendar/Time controls preserve native keyboard semantics

**Grid/time-list semantics must not strip native interactive semantics from their controls.** The date cell is a `role="gridcell"` wrapper containing a real `<button>` (native focus, Enter/Space, disabled); never collapse the two by putting `role="gridcell"` directly on the button or removing button semantics. The time list stays a `role="radiogroup"` of `role="radio"` buttons with roving tabindex and arrow keys per the ARIA radio pattern. Each interactive area keeps ONE clear accessible name; the same month/date must never be announced twice (one live-region source for month changes).

### 65. Static Calendar CSS is defined once at RootShell scope — no per-instance `<style>` tags

**Constant Calendar CSS (adjacent-month tooltip reveal `.be-adj-tooltip`, hidden time-list scrollbar `.be-dt-scroll`) lives ONCE in RootShell's root `<style suppressHydrationWarning>` block — never re-injected per Calendar/time-panel instance.** Inline styles are reserved for genuinely dynamic values (Property Control tokens, colors, computed dimensions). Any new `<style>` tag must carry `suppressHydrationWarning` and follow the HYDRATION-AUDIT rules in the source.

### 66. Inner surface radius derives from outer Radius minus its inset

**Wherever an inner surface sits inside an outer radius with a known border/padding inset (the 12h/24h segmented control: 3px padding), its radius is derived as `max(0px, Radius − inset)` — never a blind repeat of the outer Radius and never negative.** Correct for every Radius value 0–24; at Radius 0 every such inner surface becomes square too.

### 67. Today is independent from availability

**The Today indicator always marks the actual current calendar date, never the first available date.** Today may be Today + unavailable, Today + selected, etc.; Selected/Available/Unavailable/Adjacent-month states are independent of it and must be derived independently.

### 68. Adjacent-month indicators/tooltips: shared helper, both directions, available dates only

**Previous-month and next-month indicators use one shared helper (`getAdjacentMonthAbbreviation`) — never two hard-coded implementations — showing the abbreviation only on the first visible adjacent-month date of each month, removed when selected.** The custom hover tooltip shows ONLY the full month name (no year), 12px/600, on the Accent token background with the fixed on-accent foreground, positioned above the cell, `pointer-events: none`, `aria-hidden`, and appears exclusively on selectable/available adjacent dates — unavailable adjacent dates get no tooltip and no hover treatment. Previewed adjacent availability always equals the same normalized Cal.com source used inside that month.

### 69. Desktop Calendar columns are a proportional 1:2:1 grid

**The wide-layout Calendar step uses an intentional proportional width relationship — event information : calendar : time slots = 1 : 2 : 1 — implemented as `grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)`.** All three columns grow and shrink proportionally with the container; when the event panel is hidden (no Cal.com config) the template drops to a proportional 2:1 calendar|times grid so auto-placement never leaves an empty track. Do not reintroduce fixed pixel flex bases (`232px`/`220px`) or a center-column-only `flex: 1` as the primary desktop sizing model. Narrow widths (< COMPACT_BREAKPOINT) keep the stacked reflow; every column keeps `minWidth: 0` and `minmax(0, …)` tracks so children can never force horizontal overflow.

### 70. Primary-colored surfaces use a semantic Primary Foreground token — never a hard-coded white

**Every surface rendered on the Primary/Accent color (selected date, selected time slot, selected choice options, Continue/submit button + its spinner, "Book another", error "Retry", adjacent-month tooltip) takes its foreground from the semantic `Primary Foreground` (`accentForegroundColor`) Styles control — an independent author-configured value, not a contrast calculation and not a constant white assumption.** `TEXT_ON_ACCENT` remains only as the control's default/fallback value. The success-screen checkmark sits on the Success color and is exempt until a Success-foreground pairing is ever introduced.

### 71. No automatic contrast logic — restated for the token system

**Never introduce WCAG contrast computation, automatic foreground switching, auto color correction, color restrictions, validation, or warnings in connection with the Primary/Primary-Foreground tokens (or any other colors).** This restates hard rules 1–3 at the token level: choosing incompatible combinations (e.g., white on white) is the Framer author's deliberate choice and outcome; the component renders exactly what is configured.

### 72. Time Format labels always use font-weight 600

**Both segments of the 12h/24h Time Format segmented control render `font-weight: 600` in every state** — active and inactive are distinguished by colour treatment only, never by weight. Do not reintroduce 700/500 state-dependent weights.

### 73. A "flow collapses to calendar-only with Book Now below ~1200px" report is a breakpoint-override divergence — never a width-threshold bug in code

**The Booking Engine has zero viewport-width-dependent navigation logic.** The only width thresholds in the file (`COMPACT_BREAKPOINT = 768`, choice-column/pills breakpoints) affect layout columns and cell sizing only; step order, step count, and `currentIndex` are pure functions of the Property Control props of whichever breakpoint variant Framer is rendering. Diagnostic signature, proven from the code:

- Progress bar hidden ⇒ `totalActive === 1` (all progress rendering is gated behind `totalActive > 1`).
- Primary button says the final action ("Book Now") ⇒ `totalActive === 1 || isLast`.
- Calendar-only view ⇒ the single active step is the `datetime` step.

Together these prove the component received a **different Steps configuration on the smaller breakpoint** (e.g. a stale per-breakpoint override: `stepCount: 1` with a Date & Time step, or form steps whose Fields arrays arrive empty and are dropped by the T10-M9 zero-fields filter in `normalizeSteps`). Framer scopes property edits to the breakpoint the canvas/preview is currently at: editing Steps while the canvas/preview is below the Desktop breakpoint silently writes Tablet/Phone-scoped overrides that diverge from Desktop forever after.

Required behavior when this symptom appears (or when touching step configuration at all):

1. Do NOT add width-based navigation logic, auto-jump prevention, or "restore my steps" patches to the component — that would fight the author's actual configuration and violate rule 2's spirit.
2. In Framer, select the Booking Engine instance at EACH breakpoint (Desktop / Tablet / Phone), compare the Steps / Number of Steps controls, and reset every overridden control on Tablet/Phone so it inherits Desktop (or re-set it deliberately). Also check ancestor frames for duplicated instances across breakpoint variants.
3. Remember remount semantics: crossing a breakpoint boundary unmounts/remounts code components; the engine must come back exactly where the visitor was via the module snapshot (rule 74), never via stale storage or clamped state.

### 74. Remounts within a live page session must never resurrect stale sessionStorage progress

**A non-null module-level `inSessionFormSnapshot` proves the current mount is a REMOUNT of a live session (breakpoint switch, animation unmount, canvas re-parent) — and on any such mount the sessionStorage restore effect must skip the storage read entirely, even when the snapshot looks pristine (empty values, index 0).** The pre-fix gate (`if snapshot hasData → skip`) let a resize-triggered remount with an empty-looking snapshot re-read older storage from earlier in the same tab and teleport the visitor onto a previously-saved step mid-session. The live snapshot is always at least as fresh as the debounced storage write, so skipping storage on remount loses nothing. Fresh PAGE loads keep a null snapshot and must continue restoring saved progress before first paint (rules 7/16/20 unchanged — autosave stays always-on).

### 75. Pre-booking Review step removed — success is the only review

**The Booking Engine has no pre-booking Review step.** `StepType` is `"form" | "datetime"` only; the Framer control shows `Form` and `Calendar` only. Any persisted `review` step is dropped in `normalizeSteps` and never rendered. The post-booking success state (`flowStatus === "success"` with its confirmation details) is the sole review surface. Do not re-add a `review` step type, its `ReviewStepBody`, or its warnings and re-validation.

### 76. Cal.com bookingFields are auto-handled — auto-slug, canvas warning, visitor auto-inject with 11-step exception

**`calFieldId` auto-slug is the fit-all default.** `buildBookingFieldsResponses` uses `field.calFieldId` when set, otherwise `slugifyLabel(field.label)` (kebab-case, e.g. `Pet Name` → `pet-name`) with `field.id` fallback. Explicit `calFieldId` always wins (backward compat). Attendee fields (`isPrimaryName`/`email`/`calendar-widget`) are skipped for auto-derived keys.

**Missing required Cal.com fields are surfaced to the author, not the visitor, and auto-repaired for the visitor.** `GET /v2/event-types/{id}` is fetched via `fetchCalEventTypeMeta` (same `CAL_EVENT_TYPE_API_VERSION`, cached `EVENT_META_CACHE_TTL_MS`, non-blocking per rule 38) to get both `CalEventMeta` and `bookingFields[]` (`slug`/`label`/`type`/`required`/`hidden`/`isDefault`/`placeholder`/`options`). A required `bookingFields` entry is *missing* when no base field covers its `slug` via `calFieldId` or auto-slug (case-insensitive, plus `name` coverage for `isPrimaryName`/`email`). In the Framer canvas (`isCanvas`) a warning lists each missing required field (`"Pet Name (pet-name)"`) and tells the author to add a matching label/`calFieldId` or make the Cal.com field optional — visitors never see this warning.

**Visitor auto-inject is a separate `Additional Details` step before the Calendar.** On the published site (`!isCanvas`) when `missingRequiredCalFields.length > 0`, the engine inserts one `form` step (`id: auto-cal-required`, title `Additional Details`, subtitle `Please provide the following details to complete your booking.`) immediately before the first `datetime` step (or appended if no datetime). Each missing field becomes a `NormalizedField` (`id: auto-cal-{slug}`, `label`, `placeholder`, `required: true`, `fieldType: calTypeToFieldType(type)`, `calFieldId: slug`, options mapped to `ChoiceOption`). Hydration-safe: initial server and client render use the base pipeline; the effective pipeline grows after the fields fetch. Progress, `totalActive`, `safeCurrentIndex`, validation and `bookingFieldsResponses`/`notes` all use the effective pipeline.

**11-step exception:** The author's `stepCount`/`Fields` controls cap at 10 steps/10 fields, but the effective pipeline may be 11 steps when the auto step is added to a 10-step base. `totalActive` and navigation must handle 11. Do not re-cap effective at 10 and do not coerce the auto step into an existing step when missing is 3+ — the dedicated step prevents overloading a single step with 8 fields.

**Docs guidance:** Owners should keep Cal.com custom fields **optional** and author custom fields in the Engine (Engine is source of truth via auto-slug + notes). Optional keeps bookings from failing; required should only be used when the auto-inject or a matching Engine field exists.

### 77. Calendar Today is visitor-local and independent from Selected

**The Calendar's `today` state must always be the visitor's actual local calendar date** derived via `getTodayInTimeZone(timeZone)` (visitor-auto-detected zone, not browser local or UTC). `today` is the `isToday` marker (dot) and past-date guard; `selectedDate` is the `isSelected` highlight. The two are independent: Today never implies Selected.

### 78. Today is only selected when it is available

**Today must never be selected merely because it is today.** The default selected date on first open (no saved/restored date) is: today if `hasKnownAvailability(today)` is true, otherwise the **first available date on or after today** in the loaded `calendarCells` window using the same `availableDates` source that the grid uses. If no future date is available in the loaded window, leave `selectedDate` as `null` (no selection) rather than selecting an unavailable date. Today marker stays on the real today regardless.

### 79. Today calculation is live, not frozen

**The `today` state must not be frozen from an earlier render or server pass.** It is initialized from `HYDRATION_PLACEHOLDER_TODAY` for hydration parity, then set to `getTodayInTimeZone(timeZone)` pre-paint. While the component remains open across local midnight, `today` must roll over to the new visitor-local date without a full reload, via a lightweight poll that checks `getTodayInTimeZone(timeZone)` every 30s. Do not schedule based on browser local midnight.

### 80. Segmented controls share one moving-thumb implementation

**All segmented controls in the Booking Engine must use the same reusable `SegmentedControl` with a moving absolute highlight/thumb.** The thumb is `position: absolute` inside a `position: relative` track, width `calc((100% - 6px) / N)`, height inset 3px, radius `max(0px, Radius - 3px)`, animating via `transform: translateX(index * 100%)`. Do not implement a variant by changing the selected button's background directly. Use the shared component for the Calendar Time Format (12h/24h) and the BookingEngine segmented choice variant. Active and inactive text both use `font-weight: 600`, distinguished by color only. The component must support arbitrary option counts and preserve keyboard `aria-pressed` and focus behavior.








### 81. Field validation is triggered by Continue/submit — never live typing

**Field-content validation (required, format, max-length, min-length, phone/email, custom-regex) runs ONLY when the visitor explicitly attempts to proceed — the Continue / final-action click (`handleContinue` → `validateStep`), and the equivalent forward/submit action for later steps.** Typing must never run validation rules "to score" the in-progress value, and must never make a field GAIN a first-time error. The single permitted exception: a field that already shows an error (from a failed Continue attempt) may have that existing message updated or cleared by edits to the same field, so the visitor sees the error resolve. Do not reintroduce per-keystroke validation, onChange scoring, or "validate on blur" — the error surface is submit-driven, full stop.

### 82. Field-grid Gap defaults to 16px, controlled from Styles, range 0–32px

**The `Gap` Property Control lives inside the Styles group (alongside Radius): `ControlType.Number`, default `16`, `min: 0, max: 32, step: 1, unit: "px"`.** It is the SINGLE source of truth for the field-grid spacing in StepBody (both the form-step grid and the datetime-step grid). The runtime re-clamps to 0–32 (same dual enforcement as Radius). There is no second gap control and no hard-coded `12px` field-grid gap anywhere; do not reintroduce one.

### 83. Every supported field type has a reusable Styles submenu

**Every field type in the Fields arrays exposes exactly ONE "Styles" item inside its own field configuration, opening a dedicated nested style configuration.** The architecture is shared, not per-type duplicated: one `FieldStyleOverrides` model + one set of control factories (`fieldStyles*Control` / `make*FieldStylesControls`) compose four control sets — input-like (`styles`: text/email/phone/textarea/select), choice (`choiceStyles`: select/segmented/pills/cards/radio), checkbox (`checkStyles`) and the Calendar Widget (`calendarStyles`) — each exposing only the properties that are meaningful for that type (typography, text color, background, border color/width, radius, padding, focus/active border, spacing, placeholder, control height, selected-state and option/card styling where supported; checkbox: label font/color, accent, size; calendar: background, radius, padding — see rule 86). All keys are optional — an untouched key falls back to the engine theme so the default appearance is preserved unless explicitly changed; overrides are per-field and never affect other fields. Do not split the architecture into unrelated per-type controls, and do not add fake/non-functional controls to any set.

### 84. Calendar default selection: today, else first available future date — Today stays independent

**On a fresh calendar open (no restored date) the default selection follows exactly this algorithm:** visitor-local today → if today is available/selectable, select today → otherwise select the FIRST AVAILABLE date on/after today anywhere in the loaded grid window (the implementation scans `calendarCells` including adjacent-month rows via `firstAvailableDateFromToday`, and advances the visible month when the first available date lives there and the visitor has not paged away) → if no available future date exists in the loaded range, leave NO selected date. Never select an unavailable date; never use `isToday` as the selected-state source; the Today marker stays attached to the real visitor-local date even when it is unavailable (Today and Selected are separate states — rules 67/77/79 unchanged). Selecting another date removes the previous selected state immediately. Today is always computed from the visitor's auto-detected local time zone (`getTodayInTimeZone`), never shifted by UTC/server date boundaries.

### 85. The Booking Engine is theme-agnostic at the component level

**The component exposes its light/default semantic color palette (Accent, Primary Foreground, Background, Surface, Text Primary/Secondary, Border, Error, Success) but does NOT expose or implement a Light/Dark/Auto theme-mode selector — at any level, including hidden or vestigial state.** The `Theme` control, the `ColorMode` type, `DEFAULT_DARK_THEME`, the `prefers-color-scheme` listener and the dark `pick()` branch were all removed on purpose; do not reintroduce any of them and do not add another mechanism that silently switches palettes. Website-level theme differences are handled by the Framer user assigning Framer Color Variables to the exposed color properties (Framer/the site theme can vary those values per site mode) — the engine simply consumes the selected color values and never owns the mode decision. This does not weaken color customization: all semantic color controls remain, there is no contrast detection/auto-correction/restriction (rules 1–3, 70, 71 unchanged).

### 86. The Calendar Widget owns its own background (CAL-BG-OWNERSHIP); the footer nav stays transparent

**The Calendar Widget marker's background is owned by its own `calendarStyles` set — NOT by the global Background token.** `DateAndTimeInline` reads `calendarStyles.backgroundColor` (falling back to the global Background only when the author never configured the field), and the calendar block's radius/padding come from `calendarStyles.radius`/`calendarStyles.padding` when set (falling back to the shared Radius token and no padding). Exposed surface is deliberately minimal: Background, Radius, Padding — exactly the controls that are meaningful for the calendar surface, no fake/no-op controls (rule 83). All are optional: an unconfigured calendar renders byte-identically to the pre-ownership default, so no saved canvas changes appearance. The footer navigation wrapper has no background style of its own (the `FOOTER-TRANSPARENT` hard rule) — it never consumes any field background, including the calendar's, and never receives one; do not give it one.

### 87. Opening a Styles submenu must never override field defaults (STYLES-INIT)

**Activating/opening a field's Styles submenu must never change how the field renders. No nested field-styles control (input `styles`, `choiceStyles`, `checkStyles`, `calendarStyles`) may carry a concrete `defaultValue`.** A `defaultValue` inside an optional Styles Object is materialized as an EXPLICIT value the moment the author activates the submenu, which makes the runtime treat "not customized" as "configured" and snap the field to the submenu's defaults instead of its own native/default styling. The model must distinguish, per key and per field:

- **not customized →** the key is `undefined`/absent and the runtime resolvers (`resolveFieldBorder` / `resolveFieldRadius` / `resolveFieldPadding`, `fontPixelSize`, the `??` fallbacks) preserve the field's existing default look;
- **customized →** the author-entered value is stored by Framer, applied verbatim, and survives close/reopen of the submenu (Framer persists the activated object per instance; the component must never reset it).

Sentinel values (`0`, `""`, empty colors) must not mean "not configured" — those are legitimate explicit choices and are applied as such; only absence/`undefined` means untouched. This is a data/model requirement, never a visual workaround. Field Styles remain an additive layer: if the author never configures a Styles submenu, every field renders exactly as it did before Styles existed. No contrast checking, auto-correction, or color restriction may be introduced in connection with any of this (rules 1–3, 70, 71 unchanged).

**Calendar background ownership refinement (refines rule 86):** the calendar surface is owned exclusively by the marker field's `calendarStyles` (Background/Radius/Padding) — the global Styles Background token no longer reaches the calendar in any state, configured or not. An unconfigured calendar renders `DEFAULT_CALENDAR_SURFACE_BACKGROUND` (the calendar's native white default), so opening Calendar Styles never changes its appearance. Inner calendar surfaces (time list, segmented control) follow the calendar's own resolved surface, and the navigation/footer wrapper stays transparent under every Background configuration (FOOTER-TRANSPARENT).

### 88. Color system: six authored controls, three derived tokens (COLOR-SYSTEM)

**The Styles panel exposes exactly SIX independent color controls — Accent, Primary Foreground, Background, Surface, Text, Error — plus the unchanged Radius and Gap. Do not reintroduce Text Secondary, Border, or Success as author-facing color controls, and do not create replacement controls for them.** The three removed tokens remain semantic tokens for every consumer but are derived internally at the engine's single choke point (`useBookingEngineState`):

- **Text Secondary** = `withAlpha(textPrimaryColor, 0.62)` — fixed design ratio;
- **Border** = `withAlpha(textPrimaryColor, 0.12, backgroundColor)` — fixed design ratio, pre-blended onto the Background;
- **Success** = `DERIVED_SUCCESS_COLOR` (one fixed internal green, `#15803D`).

Error stays an independent author control (it drives validation/booking-critical states and is a legitimate brand choice). Accent and Primary Foreground stay independent — Primary Foreground is never derived from Accent. The ratios and the success green are **fixed design defaults chosen by the component, never contrast calculations, never color validation, never auto-correction, and never warnings** about author-selected colors (hard rules 1–3, 70, 71 unchanged): the author picks any values and accepts derived outcomes. Every UI state must keep a valid semantic color if the palette changes again.

### 89. No dynamic CMS → Select-option loading; no fragile workarounds (CMS-DECISION)

**Native dynamic loading of a Framer CMS Collection's records as Booking Engine Select options is NOT part of the Booking Engine architecture.** A reusable Code Component cannot query an arbitrary CMS collection at runtime (the collection APIs are Plugin-only; Property Controls have no collection picker), and scalar CMS field binding on CMS detail pages stays a platform feature outside this component. **Do not implement the hidden-DOM bridge, DOM scraping, plugin side-channels, or any other fragile runtime workaround.** Static `ChoiceOption[]` authoring via the Options control is the supported, industry-generic approach, and it flows to Cal.com unchanged via auto-slug/`calFieldId` (rule 76). Revisit only if Framer introduces proper native support for collection-driven code-component properties.

### 90. Exact color mapping, fixed Error, effective-default Styles initialization, and instance isolation

**Color mapping (supersedes rule 88's palette).** The Styles panel exposes exactly FIVE color controls — Accent, Primary Foreground, Surface, Text, Border — plus Radius and Gap. There is deliberately NO `Background` control (the engine root is transparent by design; the calendar owns its own surface per rule 86) and NO `Error` control. **A control named Background must never control a border; every exposed color has exactly one semantic purpose, and `Border` renders verbatim everywhere a border is drawn.** Error is the fixed internal value `#DC2626` (`FIXED_ERROR_COLOR`) used consistently for validation errors, error messages/banners, error borders/rings, retry/error states, and every other semantic error UI — never re-exposed as a Property Control and never replaced by a derived value. Text Secondary (`withAlpha(text, 0.62)`) and Success (`#15803D`) remain derived/fixed as in rule 88. No contrast logic, validation, auto-correction, or theme switching may be introduced in connection with any of this (rules 1–3, 70, 71, 85 unchanged).

**Field Styles are an override layer — effective-default initialization (refines rule 87's mechanism).** Rule 87's "no defaultValue" mechanism is superseded: Framer materializes untouched nested controls of an activated optional Styles object as zero/empty values regardless of `optional`, so a defaultValue-free control snapped fields to `padding: 0 / radius: 0` on activation. The required model instead: **every nested field-styles control carries `defaultValue`s equal to that control set's EFFECTIVE runtime defaults** (single-source constants shared with the runtime resolvers — `FIELD_STYLES_*`), so activating Styles materializes the inherit look, the panel shows the field's real defaults, and only an author-entered value becomes an override. **Explicit `0` values must remain distinguishable from unset and must be applied as entered**: resolvers determine set/unset with `??` and `typeof` checks — never falsy `||` checks, never sentinel `0`/`""`/empty-color-as-unset. Reopening the submenu preserves stored overrides exactly. Color keys stay default-free so they keep tracking the live theme tokens.

**Every Booking Engine instance is completely isolated (INSTANCE-ISOLATION).** Any number of engines may coexist on one page; none may ever affect another's current step, form values, validation state, date/time selection, transition, loading/error state, calendar state, or UI state. Root causes that must never regress: (1) module-level mutable UI state — the in-session snapshot is a `Map` keyed by per-instance persistence identity (`inSessionFormSnapshots`), never a page-wide singleton; (2) shared persistence — each instance derives a mount-stable storage key from its own DOM position among `[data-be-engine-root]` roots (first instance keeps the historical plain key; additional instances get positional suffixes), so autosave/restore never crosses instances (rules 7/13/16/74 preserved per instance); (3) instance-scoped DOM ids, queries, event handlers, and focus management — field/slot error ids are prefixed with the hydration-safe `reactInstanceId` (empty on the first render of server and client alike, then set post-mount), focus-restoration queries are scoped to the instance's own root subtree (`engineRootRef.current.querySelector`), window-level handlers ignore keydowns originating inside a different engine root, and the booking form id `be-booking-form-{reactInstanceId}` is per-instance so `form="be-booking-form-*"` never submits the wrong engine. Global-only constants that are deliberately shared: CSS class names/keyframes, the page-global locale override, the Cal.com rate-limit backoff timestamp, and the page-wide interactivity flag.

### 91. Background and Border are distinct controls — never cross-wired

**`Background` and `Border` are semantically distinct controls.** `Background` (when it exists) controls only surface fills; `Border` controls only borders. A control named `Background` must never drive a `border` style, and `Border` must never drive a background. The Styles panel's five colors are Accent, Primary Foreground, Surface, Text, Border — `Border` renders verbatim everywhere a border is drawn (`FIELD-STYLES` resolvers, calendar cells, inputs, cards).

### 92. Error is fixed #DC2626 — never a Property Control

**Error color is the fixed internal value `#DC2626` (`FIXED_ERROR_COLOR`) and must not be exposed as a Property Control.** All validation errors, error banners, error borders, and retry states use this single value. Do not re-expose it as `errorColor` or derive it from another token.

### 93. Field Styles override must preserve effective defaults and explicit zero

**Field Styles is an override layer, not a replacement.** Activating a field's Styles submenu must leave the field's effective appearance unchanged: each control's `defaultValue` is that field type's own effective default (text vs select vs cards vs pills vs segmented vs checkbox vs calendar have different paddings/radii/heights), shared via `getFieldStylesEffectiveDefaults` and the `FIELD_STYLES_*` constants. An unset key is `undefined` and the runtime falls back to the per-type default; an explicit `0` (or `0px` or empty color) is a real override and must be applied via `??`/`typeof` checks, never `||` falsy checks. Reopening Styles preserves stored overrides.

### 94. Instance isolation is hard — no shared mutable UI state

**Every Booking Engine instance's UI/form/navigation/calendar/transition/loading/error state is isolated.** No module-level mutable UI state, no shared current-step, no shared form values, no shared `querySelector` over `document`, no hard-coded DOM id like `be-booking-form` without a per-instance suffix, no shared `navigatingRef` or animation state, no shared Cal.com loading state, no shared cache that contains UI state. All DOM ids are `reactInstanceId`-prefixed, all queries are `engineRootRef.current.querySelector`, all storage keys are `instanceKeyRef`-scoped, all window handlers check `closest("[data-be-engine-root]")` before acting.

### 95. No Locale and no Session Storage Key author controls (LOCALE-REMOVED / SESSION-KEY-REMOVED)

**The `Locale` and `Session Storage Key` Property Controls were removed and must not be reintroduced — not even under an Advanced group.** Date formatting always follows `<html lang>`, then the browser default (`pageLocale()`); there is no author locale override, no `locale` prop, and no override plumbing. The autosave base key is always the fixed `"booking-engine:session"`, namespaced per instance by DOM position among `[data-be-engine-root]` roots (first instance keeps the plain key, additional instances get positional suffixes); there is no `sessionStorageKey` prop. Autosave itself stays always-on (rule 7) and per-instance isolation stays hard (rule 94). Do not re-add either control.

### 96. Field Styles is an override layer with per-variant effective defaults (STYLES-INIT-PER-VARIANT)

**Opening a field's Styles submenu must never change how the field renders.** Every Styles control carries a `defaultValue` equal to that exact field type's own effective default, so whatever Framer materializes on activation renders identically to the inherit path: text/email/phone/textarea share the input set, select keeps `choiceStyles`, and segmented/pills/cards/radio each own a variant key (`segmentedStyles`, `pillsStyles`, `cardsStyles`, `radioStyles`) because their real defaults differ (cards `10px 8px`, pills `10px 12px` + `999px`, segmented `11px 10px`, select/radio `10px 14px`). One parameterized factory builds all choice sets from `getFieldStylesEffectiveDefaults`; do not reunite them into one shared generic set.

**Unset vs explicit is structural, never sentinel-based.** An untouched key is `undefined` and every resolver falls back to the type's default; an explicit `0` or `"0px"` is a real override applied via `??`/`typeof` checks. The only values normalized away are ones that can never be intentional: empty-string colors (nothing paints with `""`) via `normalizeStyleOverrides`, and non-positive font sizes via `fontPixelSize`. `choiceStyles` stays the legacy fallback merged per property underneath the variant keys (`mergeStyleOverrides`), so instances saved before the split keep every override live. Select shows exactly one Styles submenu (the `choiceStyles` one); do not show it the input set again.

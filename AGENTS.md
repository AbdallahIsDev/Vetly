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


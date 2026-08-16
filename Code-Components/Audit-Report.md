# EXECUTIVE AUDIT SUMMARY: BookingEngine.tsx

**Audit Date:** 2026-08-15
**Target:** `/home/z/my-project/upload/BookingEngine.tsx` (8 866 lines, TypeScript / React / Framer Code Component)

---

## TO-DO EXECUTION LOG

- [x] **Phase 1: Environment & Architecture Initialization**
  - [x] Read `BookingEngine.tsx` (8 866 lines), `component_review.md` (5 542 lines), `framer-code-component.md` (1 160 lines), `SKILL.md` (2 526 lines)
  - [x] Map all 60+ top-level declarations, helpers, hooks, inlined components, property-control registration
  - [x] Create worklog and directory structure
- [x] **Phase 2: Execution of Wave 1 (20 Sub-Agents Launched Simultaneously)**
  - [x] Sub-Agents 01–20 launched in ONE parallel batch — investigation of source code + raw audit findings
  - [x] Collect raw candidate bugs, edge cases, accessibility flaws, hardcoded strings, memory leaks
  - [x] BARRIER: Finalize Wave 1 synthesis (10 390 lines across 20 findings files) before Wave 2
- [x] **Phase 3: Execution of Wave 2 (20 Sub-Agents Launched Simultaneously after Wave 1)**
  - [x] Sub-Agents 21–40 launched in ONE parallel batch — challenge and audit Wave 1 findings
  - [x] Filter false positives, confirm severities, verify proposed fixes (9 660 lines across 20 findings files)
- [x] **Phase 4: Final Synthesis & Categorized Report Generation**
  - [x] Compile verified issues into structured categories with line/section references, root-cause analyses, and exact fix recommendations
  - [x] Produce recommended fix phasing (5-phase plan), fix clusters (15 clusters), and already-fixed closeout list

---

## TOP 6 CRITICAL FINDINGS (Must-Fix-Before-Next-Release)

| # | Finding ID | Short Description | Location | Wave 1 Discovery | Wave 2 Verification |
|---|---|---|---|---|---|
| 1 | **F-01-01** | Framer layout annotations (`@framerSupportedLayoutWidth any-prefer-fixed`, `@framerSupportedLayoutHeight auto`, `@framerIntrinsicWidth 850`, `@framerIntrinsicHeight 600`, `@framerDisableUnlink`) placed above the **non-exported** `AnimatedStepContent` helper instead of the **default-exported** `BookingEngine` function — all 5 annotations are dead code. — **✅ FIXED** (JSDoc moved above default export) | L4451–4464 (current, wrong) → should sit immediately above L5780 | Wave1-01 F-01-01 | Wave2-32 ✅ CONFIRMED CRITICAL |
| 2 | **W1-04-C1 / D7** | `PHONE_REGEX` rejects its own UI placeholder `+1 (555) 555-5555` AND `+44 20 7946 0958` AND 6+ other valid international formats. Empirically verified via Node test: 8 of 13 valid formats rejected. — **✅ FIXED** (generalized group/paren regex; verified via Node against 18 valid formats) | L3174 | Wave1-04 W1-04-C1 | Wave2-24 ✅ confirmed (Node test); Wave2-39 H8 ✅ amplified |
| 3 | **W1-11-A1 / D5** | CC-5 only half-fixed. The CSS rule `.be-input:focus-visible` was repaired, but the inline `outline: "none"` in `inputBaseStyle` overrides it by CSS specificity (inline `1,0,0,0` > class+pseudo-class `0,2,0`). **Keyboard focus ring STILL invisible on every form input.** WCAG 2.4.7 violation. — **✅ FIXED** (inline `outline: "none"` removed) | L7143 (inline override); L6396–6399 (the repaired-but-defeated CSS rule) | Wave1-11 W1-11-A1 | Wave2-28 F7 ✅ CONFIRMED CRITICAL; Wave2-29 ✅ CONFIRMED |
| 4 | **W1-19-F-01** | Calendar grid uses `grid-template-columns: repeat(7, minmax(44px, 1fr))` AND root container has `overflow: hidden`. On ≤330px viewports (iPhone SE 320, Galaxy Fold cover 280), the Saturday column is clipped by overflow with no horizontal scroll affordance. — **✅ FIXED** (grid templates → `minmax(0, 1fr)`) | Calendar grid template (search L1939 region); DateAndTimeInline root `overflow: hidden` | Wave1-19 F-01 | Wave2-38 F-01 ✅ CONFIRMED CRITICAL |
| 5 | **W1-04-H3 / D8** | `sessionStorage` restore advances `currentIndex` to its prior value **without re-validating** prior steps. A visitor who advanced to step 5 with an invalid step 2 can refresh the page and land on step 5, bypassing validation. Data-integrity risk. — **✅ FIXED** (restore re-validates prior steps, clamps to first invalid) | L4885–4891 (restore effect) | Wave1-04 W1-04-H3 | Wave2-24 ✅ CONFIRMED HIGH; escalated to Phase-1 fix |
| 6 | **W1-06-F-06-1 / W2-25-F4** | POST body to Cal.com `/bookings` is missing the required `end` field. The `slot.end` value is already in scope (`BookingPayload.end` field at L1365, captured at L3820, consumed by `buildIcsDataUri` L4330 and `buildCalendarDeepLink` L4433) but never threaded into `submitCalcomBooking`'s POST body. Cal.com v2 will 400-reject **every booking attempt**. — **✅ FIXED** (`slotEnd` threaded through `submitCalcomBooking` → POST body) | `submitCalcomBooking` POST body construction (~L4006–4029) | Wave1-06 F-06-1 | Wave2-25 F4 ✅ CONFIRMED — "single most impactful defect in the entire Wave 2 audit" |

---

## DETAILED FINDINGS BY CATEGORY

> Full per-finding evidence, code snippets, and remediation code live in `/home/z/my-project/wave{1,2}_findings/subagent_XX.md`. The catalog below provides the canonical summary, severity, and recommended fix for every confirmed issue.

### Category 1 — Framer Platform & Controls Isolation (5 issues)

#### Issue F-01-01: Framer Layout Annotations Misplaced
- **Severity:** Critical
- **Location:** BookingEngine.tsx:4451–4464 (current JSDoc location); 5780 (correct location — `BookingEngine` default export)
- **Wave 1 Discovery:** Sub-Agent 01 found the JSDoc block containing `@framerSupportedLayoutWidth any-prefer-fixed`, `@framerSupportedLayoutHeight auto`, `@framerIntrinsicWidth 850`, `@framerIntrinsicHeight 600`, `@framerDisableUnlink` is placed directly above `AnimatedStepContent` (a non-exported helper) rather than the default-exported Framer code component `BookingEngine`. Per Framer docs and SKILL.md, annotations must sit immediately above the component function.
- **Wave 2 Verification:** Wave2-32 ✅ re-confirmed via direct source read. All 5 annotations are effectively dead — Framer falls back to default sizing (`any × any`), no intrinsic 850×600, editors can unlink the component despite `@framerDisableUnlink`.
- **Root Cause Analysis:** Likely a code-organization accident — the JSDoc was written for the default-export component but the file structure placed `AnimatedStepContent` (which uses `useIsStaticRenderer`) immediately above the default export.
- **Impact:** Framer editor cannot apply intrinsic sizing; layout-width constraint doesn't apply; unlink protection disabled. Component may behave unpredictably in Framer's frame-system.
- **Recommended Remediation:**
```typescript
// STEP 1: Remove the JSDoc block at lines 4451–4464.
// STEP 2: Re-insert it immediately above the BookingEngine default export (currently line 5780).

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 850
 * @framerIntrinsicHeight 600
 * @framerDisableUnlink
 */
export default function BookingEngine(props: BookingEngineProps) {
  // ... existing implementation
}
```

- **Status:** Completed

#### Issue F-01-02: `useCalcomSlots` Fetch Guard Incomplete
- **Severity:** Medium
- **Location:** L3693 (`if (RenderTarget.current() === RenderTarget.canvas) return;` inside `useCalcomSlots`)
- **Wave 1 Discovery:** Sub-Agent 01 found the guard only blocks the canvas target. On `export` and `thumbnail` targets (used by Framer for static export and page thumbnails), the Cal.com fetch — including the `Authorization: Bearer ${apiKey}` header — still fires, leaking the API key in static-export bundles.
- **Wave 2 Verification:** Wave2-32 ✅ confirmed — should use `useIsStaticRenderer()` (which returns true for canvas + export + thumbnail).
- **Root Cause Analysis:** `RenderTarget.canvas` is a single-target check; `useIsStaticRenderer()` is the broader guard.
- **Impact:** API key may leak into Framer static-export bundles (cached HTML/JS served to visitors).
- **Status:** ✅ **FIXED** (bundle 16) — `useCalcomSlots` (L4425) and `handleSubmitBooking` (L6498) both now guard on `useIsStaticRenderer()` (`isStaticRender`), which blocks canvas, export AND thumbnail renders from firing the availability GET or the booking POST with the Bearer key; both sites carry the F-01-02 comment. The remaining canvas-only check (L6939 `isCanvas`) is a demo-grid rendering choice, not a fetch guard, and stays.
- **Recommended Remediation:**
```typescript
// Inside useCalcomSlots:
const isStatic = useIsStaticRenderer();
// ...
if (isStatic) return; // blocks canvas, export, and thumbnail targets
```

#### Issue F-01-03: Grouped Object Controls Lack `defaultValue`
- **Severity:** Low
- **Location:** L8360–8363 region — `buttonLabels`, `progressBar`, `styles`, `copy` grouped controls
- **Wave 1 Discovery:** Sub-Agent 01 found grouped Object controls lack explicit top-level `defaultValue`, inconsistent with the codebase's own T8-L4 fix at L8360–8363.
- **Wave 2 Verification:** Wave2-32 ✅ confirmed.
- **Impact:** Framer editor may render empty defaults when author first adds the component.
- **Recommended Remediation:** Add explicit `defaultValue: { ... }` to each grouped Object control matching the interface defaults.

#### Issue F-01-04: Destructuring Lacks Defensive Fallbacks
- **Severity:** Low
- **Location:** L4566 (`styles` destructuring); L4579 (`buttonLabels` destructuring)
- **Wave 1 Discovery:** Sub-Agent 01 found these destructures lack `?.` fallbacks. If the component is rendered outside Framer's runtime (unit tests, Next.js SSR without Framer context), it crashes.
- **Wave 2 Verification:** Wave2-32 ✅ confirmed.
- **Impact:** Component crashes outside Framer runtime.
- **Recommended Remediation:** Use defensive defaults: `const { accentColor, ... } = { ...DEFAULT_STYLE_PROPS, ...(props.styles ?? {}) };`

#### Issue F-01-05: `useIsStaticRenderer` Coverage Gap
- **Severity:** Low
- **Location:** L4481 (only call site); L1485 (12h/24h slider `motion.div`); L6142 (progress bar `motion.div`)
- **Wave 1 Discovery:** Sub-Agent 01 found `useIsStaticRenderer()` is only called inside `AnimatedStepContent`. The 12h/24h slider and progress bar `motion.div` elements still animate during canvas rendering, causing visual jitter in the Framer editor.
- **Wave 2 Verification:** Wave2-32 ✅ confirmed.
- **Impact:** Editor-only visual jitter.
- **Status:** ✅ **FIXED** (bundle 16) — `TimeSlotList` now reads `useIsStaticRenderer()` and renders the 12h/24h indicator as a plain positioned `div` at its final spot under static renders (motion spring only for live visitors); the progress bar branch (main component's existing `isStaticRender`) renders a plain width-percentage div. Jitter eliminated on canvas/export/thumbnail without touching live-visitor animation.
- **Recommended Remediation:** Propagate `isStatic` to those motion paths or wrap entire tree in `<MotionConfig reducedMotion="always">` when static.

---

### Category 2 — Zero-Hardcoding & 100% Customizability (24 issues)

#### Issue W1-02-F1: `FETCH_TIMEOUT_MS` Hardcoded
- **Severity:** High
- **Location:** L3638 (`const FETCH_TIMEOUT_MS = 18000;`)
- **Wave 1 Discovery:** Sub-Agent 02 found the API timeout is a module-level constant with no PropertyControl. Authors cannot tune it for slow networks or aggressive Cal.com instances.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed MUST-FIX (visitor-facing — affects resilience on slow networks).
- **Root Cause Analysis:** Constant was added during initial Cal.com integration; never promoted to a PropertyControl.
- **Impact:** Authors cannot tune timeout; 18s is too long for fast networks and too short for slow ones.
- **Recommended Remediation:** Add `fetchTimeoutMs: ControlType.Number` (default 18000) under the `Config` group; thread through `useCalcomSlots` and `submitCalcomBooking`.
- **Status:** Completed — `fetchTimeoutMs` is a Config-group Number control (default 18000, 3000–60000, step 500); `useCalcomSlots` and `submitCalcomBooking` both accept the override and fall back to `FETCH_TIMEOUT_MS` for old instances.

#### Issue W1-02-F2 / D13: `DEFAULT_DARK_THEME` Hardcoded + Missing Fields
- **Severity:** High
- **Location:** L3202–3216 (`DEFAULT_DARK_THEME` constant)
- **Wave 1 Discovery:** Sub-Agent 02 found 8 dark-mode colors are hardcoded with no parallel `darkStyles` PropertyControls group. Sub-Agent 17 separately found `DEFAULT_DARK_THEME` declares `accentColor`/`errorColor`/`successColor`/`borderRadius` are dead fields (the dark-mode override memo at L4639–4667 never reads them).
- **Wave 2 Verification:** Wave2-23 ✅ confirmed MUST-FIX; Wave2-36 ✅ confirmed F-17-8 MED.
- **Impact:** Authors cannot override dark-mode colors independently from light-mode.
- **Fix:** ✅ **FIXED** in this session (W1-17-F-17-4 + F-17-8 sweep): the theme memo now applies a dark counterpart for every field — accent/error/success/borderRadius are no longer dead — and only light-default values swap (normalized comparison), so an author's deliberate dark-mode colours always win. See Sub-Category 10d rows for L-refs.
- **Recommended Remediation:** Restructure `styles` into `styles.light` + `styles.dark` Object controls, OR add parallel `darkAccentColor`/`darkErrorColor`/`darkSuccessColor`/`darkBorderRadius` controls.

#### Issue W1-02-F3: `COMMON_TIMEZONES` Not Editable
- **Severity:** High
- **Location:** L3217–3248 (`COMMON_TIMEZONES` 16-entry array — Wave 1 said 17, actual is 16)
- **Wave 1 Discovery:** Sub-Agent 02 found the timezone dropdown list is a fixed module-level array. Authors cannot add custom timezones (e.g., a clinic that only serves one city doesn't need 16 worldwide timezones).
- **Wave 2 Verification:** Wave2-23 ✅ confirmed MUST-FIX.
- **Impact:** Inflexible timezone picker; UX clutter for localized deployments.
- **Recommended Remediation:** Add `timezones: ControlType.Array` (element control: `{ label: ControlType.String, value: ControlType.String }`) with `COMMON_TIMEZONES` as the default.
- **Status:** Completed — `timezones` exposed as a Config-group `ControlType.Array` of `{ label, value }` objects with `COMMON_TIMEZONES` (label = value) as the panel default. Runtime: `useBookingEngineState` sanitizes the author list (drops entries without a value, falls back to label when only value is set, falls back to the built-in 16-entry list for old canvases or empty arrays) and threads it as `timezoneOptions` → `StepBody` → the datetime-step `<select>`; the detected-timezone option is still prepended and value-filtered exactly as before. Verified via `bun build` transpile.

#### Issue W1-02-F4–F8: 5 Hardcoded Error-Message Surfaces
- **Severity:** High (5 findings)
- **Location:** `mapCalcomError` (L4101) — 5 substring→message rules; `useCalcomSlots` catch ladder (5 status-specific messages); `submitCalcomBooking` (5 status-specific error strings + HTTP-status fallback); `handleSubmitBooking` (4 `setSubmitError` strings); `StepBody.hideDemoWhenUnconfigured` (2-line "Booking is currently unavailable / Please call us…" notice)
- **Wave 1 Discovery:** Sub-Agent 02 cataloged all 5 surfaces; each is hardcoded with no Copy PropertyControl.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed all 5 MUST-FIX.
- **Impact:** Authors cannot customize error copy; brand voice inconsistent; localization impossible.
- **Recommended Remediation:** Introduce 4 new Object controls (`calcomErrorCopy`, `slotsErrorCopy`, `submitErrorCopy`, `submitGuardrailCopy`) totaling ~20 keys; thread through all 5 surfaces. (See Fix Cluster 2.)
- **Status:** **Completed** (code already shipped this as "bundle 17"; report block was stale) — a single `ErrorCopy` surface (`ERROR_COPY_DEFAULTS`) covers all 5 MUST-FIX surfaces via one `errorCopy` Object control: `mapCalcomError` accepts `errorCopy` and overrides all 5 of its substring→message rules plus the catch-all; the `useCalcomSlots` catch ladder's 5 status messages are keyed (slotsTimeoutError / credentialError / slotsNotFoundError / slotsRateLimitTemplate + generic / slotsUnavailableError + fallback); `submitCalcomBooking`'s status strings + HTTP fallback are keyed; `handleSubmitBooking`'s 4 `setSubmitError` calls use keyed copy (bookingErrorTitle / unknownErrorLabel / errorFallbackMessage…); the "Booking is currently unavailable" guardrail notice uses `unavailableTitle` / `unavailableBody`. | `ErrorCopy` L391+, `ERROR_COPY_DEFAULTS` L413, `mapCalcomError` L5165+, `useCalcomSlots` catch ladder L4826+, `submitCalcomBooking` L4936+, `StepBody` guardrail, errorCopy control L10896+ | — | Wave2-23

#### Issue W1-02-F9–F16: 8 Medium-Priority Hardcoded Strings
- **Severity:** Medium (8 findings)
- **Location:** SuccessScreen "Confirmation #"+ "Reschedule or cancel" (L7433–7871 region); ReviewStepBody "Edit" (L6891+); TimeSlotList "Pick a date to see times" + "No available times" (L1423+); Select fallback "Select an option…" (FieldRenderer); canvas-only guardrails (5 strings); "% complete" suffix; 8 aria-labels ("Choice group"/"Time slots"/"Available times"/"Date picker"/"Booking progress"×2/"Booking form" + Previous/Next month/Today suffixes)
- **Wave 1 Discovery:** Sub-Agent 02 cataloged each.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed all 8.
- **Impact:** Brand voice inconsistency; localization blockers.
- **Recommended Remediation:** Add corresponding keys to the existing `copy` Object control group.
- **Status:** ✅ **FIXED** — every one of the 8 groups now has a `copy` control: `confirmationNumberLabel` (CC-11 ref row), `rescheduleOrCancelLabel` (manage link), `editLabel` (review Edit links), `pickDateToSeeTimesLabel` + `noTimesFallbackLabel` (TimeSlotList empty states), `selectOptionLabel` (select placeholder), `stepProgressLabel` (`{pct}% complete` template) and a nested `aria` group for all 8 accessibility names (Choice group / Time slots / Available times / Date picker / Booking progress ×2 / Booking form + localisable `{month}` nav templates). Canvas-only guardrails (5 dev-aid strings) stay author-facing on purpose — they're never rendered to visitors, so exposing them in a visitor-copy panel would only add noise (documented decision). | constants L335–376, copy panel ~L10285+, TimeSlotList L1903+, CalendarGrid L1506+ / L2330+, FieldRenderer L976+, StepBody L8301+, SuccessScreen L8997+ | | Wave1-02 W1-02-F9

#### Issue W1-02-F17–F23: 7 Low-Priority Hardcoded Strings
- **Severity:** Low (7 findings)
- **Location:** `.ics` PRODID + SUMMARY fallback + notes section headers (L4311–4390); AM/PM + 12h/24h toggle text (L126); 10 layout constants (TOUCH_TARGET_MIN, COMPACT_BREAKPOINT, CALENDAR_WEEKS_TO_RENDER, PROGRESS_BAR_HEIGHT, CHECKMARK_ICON_SIZE, ERROR_ICON_SIZE, 3 column breakpoints, DEFAULT_MEETING_DURATION_MS); `MAX_MONTHS_AHEAD=12` + retry backoff (1000ms / 3000ms); demo grid `startTime="09:00"`/`endTime="17:00"`/`interval=30`; "Unknown error" fallback; ErrorScreen fallback "Something went wrong while submitting your booking."
- **Wave 1 Discovery:** Sub-Agent 02 cataloged each.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed — classified as SHOULD-FIX (author-experience) for most; ACCEPTABLE for layout constants.
- **Impact:** Minor author-experience friction; demo-grid times misleading on canvas.
- **Recommended Remediation:** Expose editable controls for `.ics` PRODID, retry backoff, demo-grid times. Leave WCAG-mandated constants (`TOUCH_TARGET_MIN`) as-is.
- **Status:** ✅ **FIXED** (with documented constants): `.ics` PRODID, SUMMARY fallback and the notes section headers (`notesSelectedTimeLabel`/"Date: "/"Time: " prefixes) are copy-controlled; AM/PM suffixes via `amLabel`/`pmLabel` (threaded through `formatTimeLabel` → `useTimeGrid` → the time picker); demo-grid times now `copy.demoStartTime`/`demoEndTime`/`demoInterval` instead of hardcoded 09:00–17:00/30; "Unknown error" → `unknownErrorLabel`; the ErrorScreen fallback → `errorFallbackMessage` (also the catch-all of `mapCalcomError`, which accepts it as a param). Layout/retry constants (`TOUCH_TARGET_MIN`, `COMPACT_BREAKPOINT`, `CALENDAR_WEEKS_TO_RENDER`, `PROGRESS_BAR_HEIGHT`, `CHECKMARK_ICON_SIZE`, `ERROR_ICON_SIZE`, column breakpoints, `DEFAULT_MEETING_DURATION_MS`, `MAX_MONTHS_AHEAD`, the 1000/3000ms retry backoff) are ACCEPTABLE per Wave2 and intentionally left as code constants; the 12h/24h toggle shows the ISO format token itself ("12h"/"24h"), which needs no localization. | `formatTimeLabel` L384+, `useTimeGrid` L2565+, `buildNotesPayload` L5006+, `buildIcsDataUri` L5048+, StepBody demo grid L8301+ | | Wave1-02 W1-02-F17

#### Issue W1-02-F24: 11 In-Component `||` Fallbacks Duplicate PropertyControl Defaults
- **Severity:** Refactor
- **Location:** 11 sites where `props.copy.foo || "Default string"` patterns exist
- **Wave 1 Discovery:** Sub-Agent 02 found these `||` fallbacks duplicate the PropertyControl's own `defaultValue`, creating drift risk if either side changes.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed INFORMATIONAL.
- **Impact:** Drift risk between code and PropertyControl defaults.
- **Recommended Remediation:** Trust PropertyControl defaults; remove in-component `||` fallbacks.
- **Status:** ✅ **FIXED** — all 8 remaining `copy.x || "literal"` sites (dateLabel/timeLabel ×2, requiredFieldsHint, timeZoneSelectLabel, detectedTimeZonePrefix) were removed; the two `(copy.privacyNotice || "").trim()` sites stay — those are empty-guards, not duplicated defaults. To kill the drift class rather than just the instances, the copy-panel defaults now reference the SAME module constants the runtime fallbacks use (`DEFAULT_COPY_*` block, e.g. `formatStepCounter`'s fallback template, `formatTimeLabel`'s AM/PM, `mapCalcomError`'s catch-all, `.ics` PRODID/SUMMARY, notes headers) — re-wording either side can't silently diverge. A defensive merge (`{...DEFAULT_ARIA_LABELS, ...(copy.aria || {})}`) protects canvases saved before the `aria` group existed. | L335–376 (constants), RootShell L7176–7182 (aria merge), panel defaults L10230+ | | Wave1-02 W1-02-F24

---

### Category 3 — State Machine & Flow Control (9 issues)

#### Issue F-03-1: Silent Step Swap When Intermediate Step's `enabled` Toggled OFF Mid-Flow
- **Severity:** High
- **Location:** Pipeline tracks position by array index, not step identity
- **Wave 1 Discovery:** Sub-Agent 03 found that when an intermediate step's `enabled` flag is toggled OFF while the user is mid-flow, the CC-8 fix only catches `currentIndex >= totalActive`. If the disabled step is earlier than the current index (or is the current index but not the last), `activeSteps[currentIndex]` silently resolves to a different step's content.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed via Node simulation.
- **Root Cause Analysis:** Pipeline tracks position by array index, not step identity.
- **Impact:** User sees wrong step content with no warning.
- **Recommended Remediation:** Track step ID (not array index) and re-resolve `currentIndex` against the new `activeSteps` array whenever `enabled` flags change.
- **Status:** **Completed** — `useBookingEngineState` now pins the visited step by its stable normalized ID (`pinnedStepIdRef`, synced in a `[safeCurrentIndex, activeSteps]` effect). A render-phase guard compares the active-steps ID signature each render; when it changes, the index is re-resolved from the pinned ID (render-phase `setCurrentIndex`, legal re-render-during-render): earlier steps removed → index shifts so the visitor stays on the same step; the step they were on removed → next enabled step takes over (old clamp behavior as fallback). Runs before paint, so the wrong-step content never flashes once. Values/errors are keyed by field ID and are untouched. Bundles clean. | hook state L5988ff (`pinnedStepIdRef`/guard after `isLast`) | | Wave2-24

#### Issue F-03-2 / D10: Review Step Re-Validate Guarantee Lost When Not at End
- **Severity:** Medium
- **Location:** L5404 (gate: `isLast && currentStep.stepType === "review"`)
- **Wave 1 Discovery:** Sub-Agent 03 found the re-validate-all-prior-steps guarantee only fires when the review step is terminal. If the author places a review step anywhere else, prior steps aren't re-validated.
- **Wave 2 Verification:** Wave2-24 marked out-of-scope (no contradicting verdict).
- **Impact:** Stale data may slip through if author reorders steps.
- **Recommended Remediation:** Re-validate prior steps on any review step entry, not just terminal.
- **Status:** **Completed** — the guard is now `currentStep.stepType === "review"` (was `isLast && review`): any review step entry re-validates all prior steps, jumps to the first invalid one with fields touched and focus moved; when all prior steps are valid, flow just continues (submit on terminal review unchanged). | handleContinue review branch ~L6991 | | Wave2-24

#### Issue F-03-3: `useStateGuarded` Doesn't Retroactively Clamp
- **Severity:** Medium
- **Location:** L6415 (`useStateGuarded` hook)
- **Wave 1 Discovery:** Sub-Agent 03 found the hook doesn't clamp when `max` shrinks. Currently relies on consumer's `useLayoutEffect` + `safeCurrentIndex` clamp (defense-in-depth works, but the hook name is misleading).
- **Wave 2 Verification:** Wave2-24 ✅ confirmed; Wave2-33 A3 verified the setter identity churns when `max` changes.
- **Impact:** Misleading API; defense-in-depth may regress.
- **Recommended Remediation:** Make `useStateGuarded` clamp on `max` change.
- **Status:** **Completed** (also closes W2-33-A3) — the max now lives in a latest-ref maintained by an effect (same convention as `valuesRef`), so the setter is a permanently stable `[]`-dep callback; a second effect re-clamps already-committed state whenever the ceiling drops. Consumers' `safeCurrentIndex` defense-in-depth stays as belt-and-braces. | useStateGuarded L8398ff | | Wave2-24, Wave2-33 A3

#### Issue F-03-4 / D11 / D17: `handleContinue` In-Flight Double-Click Guard Missing
- **Severity:** Medium (scope-narrowed by Wave 2)
- **Location:** `handleContinue` step-to-step advance (non-POST path)
- **Wave 1 Discovery:** Sub-Agent 03 found rapid Continue→Continue can compose `setCurrentIndex(i => i+1)` updaters to skip a step. Sub-Agent 04 separately found non-POST analytics duplication.
- **Wave 2 Verification:** Wave2-22 FP-22-01 initially dismissed as false positive (React 18 batching). Wave2-24 empirically confirmed: React 18 batching does NOT prevent functional-updater composition across separate event handlers. **POST path is safe via `submittingRef`**; only non-POST analytics duplicated. Wave2-24 recommended `useEffect([safeCurrentIndex])` release instead of `setTimeout(0)`.
- **Impact:** Duplicate `booking_success` / `booking_error` analytics events on rapid Continue clicks.
- **Recommended Remediation:** Add `navigatingRef` (mirroring `submittingRef`); release via `useEffect([safeCurrentIndex])`, not `setTimeout(0)`.
- **Status:** **Completed** — exactly the recommended shape: `navigatingRef` claims the window synchronously before the `step_complete` analytics + `startTransition` advance; released by an effect on `[safeCurrentIndex]` (covers Continue/Back/jump/restart/retry without timers). The POST/submit path remains under the pre-existing `submittingRef`. | navigatingRef decl ~L6672, guard in handleContinue ~L7077, release effect ~L6690 | | Wave2-24

#### Issue F-03-5 / D9: `handleJumpToStep` Bypasses `transitionFlowStatus` State Machine
- **Severity:** Medium
- **Location:** `handleJumpToStep` function
- **Wave 1 Discovery:** Sub-Agent 03 found raw `setFlowStatus("in-progress")` bypasses the state-machine guard.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed.
- **Impact:** State-machine integrity risk.
- **Recommended Remediation:** Route through `transitionFlowStatus`.
- **Status:** **Completed** — `handleJumpToStep` now calls `transitionFlowStatus("in-progress")` instead of raw `setFlowStatus` (added to the dep array). | handleJumpToStep L7115ff | | Wave2-24

#### Issue F-03-6: Raw `currentIndex` Used in `handleContinue` Review Branch
- **Severity:** Low
- **Location:** L5408
- **Wave 1 Discovery:** Sub-Agent 03 found `handleContinue`'s review-step branch reads raw `currentIndex` instead of `safeCurrentIndex`.
- **Wave 2 Verification:** Wave2-33 A4 ✅ confirmed.
- **Impact:** Edge-case crash if `currentIndex` is out of bounds.
- **Recommended Remediation:** Use `safeCurrentIndex` consistently.
- **Status:** **Completed** (covered by the W1-04-M4 fix, verified again in this pass) — the Fix #21 jump-back comparison in `handleContinue`'s review branch reads the clamped `safeCurrentIndex`, not raw `currentIndex` (explicit W2-33-A4 comment in code). | handleContinue review branch ~L6995 | | Wave2-33 A4

#### Issue F-03-7: Field Reordering Orphans Entered Values
- **Severity:** Low
- **Location:** L3357–3360 (acknowledged limitation)
- **Wave 1 Discovery:** Sub-Agent 03 found if the author reorders fields within a step, previously entered values are orphaned.
- **Wave 2 Verification:** Acknowledged limitation.
- **Impact:** Author-side data loss on field reorder.
- **Recommended Remediation:** Track field ID (not array index) for value storage.

#### Issue F-03-8 / F-03-9: Informational Notes (No Action)
- **Severity:** Informational
- **Location:** Step counter arithmetic verified CORRECT; `ReviewStepBody` Edit-link forward-jump edge case.
- **Wave 1 Discovery:** Sub-Agent 03 verified step counter is correct (`safeCurrentIndex + 1`, `totalActive`, no off-by-one).
- **Wave 2 Verification:** Wave2-24 ✅ confirmed.

#### Issue W1-04-M4: `handleContinue` Deps Array Omits `validationCopy`
- **Severity:** Medium
- **Location:** `handleContinue` `useCallback` dep array
- **Wave 1 Discovery:** Sub-Agent 04 found `validationCopy` is transitively covered via `copy`, but explicit dep is missing.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed.
- **Impact:** Fragile — future refactor of `copy` nesting would break validation.
- **Recommended Remediation:** Add `validationCopy` to deps.
- **Status:** ✅ FIXED — `validationCopy` added to `handleContinue`'s dep array (L5859–5876); `currentIndex` removed since the body no longer reads it. Also covers W2-33-A4: the Fix #21 jump-back comparison now uses the clamped `safeCurrentIndex` instead of raw `currentIndex`, so a step disabled mid-flow can't misdirect the jump (L5787–5800). Verified via `bun build` transpile.

---

### Category 4 — Form Validation (11 issues)

#### Issue W1-04-C1 / D7: `PHONE_REGEX` Rejects Valid International Formats (CRITICAL)
- **Severity:** Critical
- **Location:** L3174 (`const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;`)
- **Wave 1 Discovery:** Sub-Agent 04 found the regex has only 2 separator slots but real international numbers have 3-4 separators. Empirically tested via Node: 8 of 13 valid formats rejected.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed (Node test); Wave2-39 H8 ✅ amplified — `+1 (555) 123-4567`, `+44 20 7946 0958`, `+86 138 0013 8000` all REJECTED.
- **Root Cause Analysis:** Regex pattern too restrictive — only 3 mandatory digit groups, but most international numbers split into 4.
- **Impact:** Every international user fails phone validation; cannot advance past the form step.
- **Recommended Remediation:**
```typescript
// Replace L3174 with a regex that accepts 3-4 separators:
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
// Or use libphonenumber-js for true E.164 validation.
```

- **Status:** Completed (applied a generalized pattern that also accepts the UI placeholder `+1 (555) 555-5555`, which the report's suggested 4-group regex still rejected; `validatePhone`'s existing ≥7-digit guard retained)

#### Issue W1-04-H1 / D3: `validationCopy` Memo Wrong Dep
- **Severity:** High
- **Location:** L4533–4552 (`useMemo` reads `validation` prop but lists `[copy]` in deps)
- **Wave 1 Discovery:** Sub-Agent 04 found the memo body reads `validation` but the dep array is `[copy]`. Latent today (because `validation` is nested under `copy.controls.validation` in property controls), but structurally wrong.
- **Wave 2 Verification:** Wave2-33 ✅ confirmed HIGH; Wave2-35 A-01 ✅ re-discovered independently.
- **Impact:** Stale validation messages in Framer editor when `validation` changes alone.
- **Recommended Remediation:** Change `}, [copy])` to `}, [validation])`.
- **Status:** Completed (dep array `[copy]` → `[validation]`; `validationCopy` memo now recomputes when the Validation group changes)

#### Issue W1-04-H2 / D2: Custom-Regex ReDoS Vulnerability
- **Severity:** High
- **Location:** L3493 (`new RegExp(field.customRegex)`)
- **Wave 1 Discovery:** Sub-Agent 04 found custom regex is recompiled on every `validateField` call (no memoization). Worse, certain patterns cause catastrophic backtracking. Compounded by `handleFieldChange` calling `validateField` on every keystroke.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed via Node timing test: 25-char input against `(a+)+$` hangs 3 278 ms; 30-char input times out the 6-second wrapper. Wave2-39 I3 ✅ amplified — runtime `try/catch` does NOT catch catastrophic backtracking.
- **Impact:** Denial-of-service vector — visitor can freeze the main thread by typing into a field with a pathological custom regex.
- **Recommended Remediation:** Memoize compiled regex per field (WeakMap); add ReDoS-safe pattern check or 100ms timeout; expose `customRegexFlags` PropertyControl.
- **Status:** Completed. Three parts: (1) `getCompiledCustomRegex` (`L3643`) compiles once per field + pattern and caches in a `WeakMap`, recompiling only when the author changes the pattern. (2) `isReDosRisky` (`L3553`) statically rejects patterns with an inner quantifier or ambiguous-alternation group under an unbounded outer quantifier — `(a+)+`, `(a|aa)+`, `(ab|a)+`, `([a-z]+)*`, nested groups — BEFORE compiling; the author sees the copy at `L3455` instead of a frozen tab. The check is precision-tuned: `(mon|tue|fri)+` and `(tue|thu)+` (disjoint/equal-length alternatives are poly-time) stay allowed. (3) Verified with a 35-pattern Node corpus — every ReDoS shape blocked, every benign shape allowed, 0 mismatches; file transpiles clean.

#### Issue W1-04-H3 / D8: `sessionStorage` Restore Bypasses Validation (Phase-1 fix)
- **Severity:** High (escalated to Phase-1 fix per synthesis)
- **Location:** L4885–4891 (restore effect)
- **Wave 1 Discovery:** Sub-Agent 04 found `setCurrentIndex(parsed.currentIndex)` happens without re-validating prior steps.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed HIGH; Wave2-31 ✅ confirmed + added GDPR angle.
- **Root Cause Analysis:** Restore effect trusts persisted state without re-validation.
- **Impact:** Visitor can refresh the page and land on a later step even if prior steps are invalid.
- **Recommended Remediation:** After restoring `currentIndex`, run `validateStep` on all prior steps; if any fails, clamp `currentIndex` to the first invalid step.
- **Status:** Completed (restore effect now loops `validateStep` over all prior steps against the restored values and clamps `currentIndex` to the first invalid step; the restored step itself is exempt as it may be mid-fill)

#### Issue W1-04-L3: `EMAIL_REGEX` Accepts Invalid Emails
- **Severity:** Low
- **Location:** L3173
- **Wave 1 Discovery:** Sub-Agent 04 found the regex accepts `user@domain..com` (double dot), `user@.com` (no domain), `user@domain.com.` (trailing dot).
- **Wave 2 Verification:** Wave2-24 ✅ confirmed via Node test; Wave2-39 H7 ✅ amplified.
- **Impact:** Invalid emails may pass validation; downstream Cal.com submission may fail.
- **Recommended Remediation:** Tighten regex: `/^[^\s@]+@([^\s@]+\.)+[^\s@]{2,}$/`.
- **Status:** Completed (regex rewritten DNS-label shaped — one or more alnum labels joined by single dots, TLD ≥2 alnum chars; verified via Node: all 6 valid formats accepted, all 10 invalid shapes rejected, while the old regex still accepted `user@domain..com` and `user@domain.com.`)

#### Issue W1-20-H3: Min-Length Validation Fires on Optional Fields
- **Severity:** Medium
- **Location:** `validateField` for `fieldType: "text"` / `"textarea"`
- **Wave 1 Discovery:** Sub-Agent 20 found `MIN_TEXT_LENGTH = 3` validation fires even on optional fields (prior T4-H2 still open).
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Optional text fields block submission when partially filled.
- **Recommended Remediation:** Gate min-length validation on `field.required || str.trim().length > 0`.
- **Status:** **Completed** — both min-length emissions in `validateField` (the explicit `min-length` rule AND the type-derived text/textarea check) are now gated on `field.required`; optional fields accept any partial input (the `isEmpty` early-return already lets them pass empty). | validateField L4300–4335 | | Wave2-39

#### Issue W1-20-M1: Missing `inputMode` on Phone/Email Inputs
- **Severity:** Medium
- **Location:** `FieldRenderer` text/email/phone inputs
- **Wave 1 Discovery:** Sub-Agent 20 found no `inputMode="tel"` or `inputMode="email"`.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Mobile users see wrong keyboard (no phone keypad for phone field).
- **Recommended Remediation:** Add `inputMode` based on `autocompleteToken` heuristic.
- **Status:** **Completed** — email inputs get `inputMode="email"`, phone `inputMode="tel"` (text stays unset = default keyboard). | FieldRenderer text/email/phone branch ~L9555 | | Wave2-39

#### Issue W1-20-M2: No `name` Attribute on Inputs
- **Severity:** Medium
- **Location:** All input/textarea/select/checkbox in `FieldRenderer`
- **Wave 1 Discovery:** Sub-Agent 20 found inputs have no `name` attribute.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Breaks password-manager grouping; autofill doesn't work.
- **Recommended Remediation:** Add `name={field.id}` to all inputs.
- **Status:** **Completed** — `name={field.id}` added to every control: text/email/phone input, textarea, select, checkbox (ChoiceGroupInline radios are already named via `inputName`). | FieldRenderer all branches | | Wave2-39

#### Issue W1-20-M3: Character Counter Only on Textarea
- **Severity:** Medium
- **Location:** `FieldRenderer` textarea vs. text/email/phone
- **Wave 1 Discovery:** Sub-Agent 20 found text/email/phone inputs are silently capped by `effectiveMaxLength` with no visible counter.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Users don't know their input was truncated.
- **Recommended Remediation:** Render character counter for all capped inputs.
- **Status:** **Completed** — the text/email/phone branch now renders the same `{currentLen}/{maxLen}` counter the textarea already had (shared `maxLen`/`currentLen` computed at the render top). | FieldRenderer text/email/phone branch ~L9590 | | Wave2-39

#### Issue W1-20-M4: `effectiveMaxLength` Allows RFC 5321 Override
- **Severity:** Medium
- **Location:** L4405
- **Wave 1 Discovery:** Sub-Agent 20 found the cap of 2000 lets authors override email `maxLength` above RFC 5321's 254-char limit.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Authors can configure invalid email `maxLength`.
- **Recommended Remediation:** Clamp email `maxLength` to 254 regardless of author setting.
- **Status:** **Completed** — `effectiveMaxLength` clamps the email branch to `min(authored||254, 254)` before any other logic; author settings above RFC 5321's limit are ignored for email only. | effectiveMaxLength L5502ff | | Wave2-39

#### Issue W1-20-M5: Non-Required `<select>` Has No Clear-Selection Affordance
- **Severity:** Medium
- **Location:** `FieldRenderer` select
- **Wave 1 Discovery:** Sub-Agent 20 found once a user selects an option in a non-required select, they cannot clear it.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** UX dead-end for non-required selects.
- **Recommended Remediation:** Add a "Clear" button or "(none)" option for non-required selects.
- **Status:** **Completed** (verified by inspection — already satisfied in current code) — the placeholder option is `<option value="" disabled={field.required}>`: on non-required fields it stays selectable, so the visitor can always return to "(none)" and clear the value; required fields keep it disabled so they can't submit an empty selection. | FieldRenderer select ~L9264 | | Wave2-39

#### Issue W1-20-M6: No Author-Time Regex Validity Preview
- **Severity:** Medium
- **Location:** PropertyControls for `customRegex`
- **Wave 1 Discovery:** Sub-Agent 20 found authors have no way to test their regex pattern in the Framer editor before publishing.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Authors discover invalid regex only after publishing.
- **Recommended Remediation:** Add a canvas-only "test input" preview field next to `customRegex`.
- **Status:** Completed. New field-level property control `Test Input (canvas)` (gate: `validationRule === "custom-regex"`, same safe pattern as `customRegex`). When an author types sample text, a canvas-only verdict banner renders above the flow using the exact production code path (`isReDosRisky` + `getCompiledCustomRegex`): ✓ matches / ✗ no match / invalid pattern / ReDoS risk — four kinds color-coded green/red/amber. Zero render in preview or published site (`isCanvas` gate).
- **Note:** W1-20-H2 (also in Phase-2 plan row 5) has no detail section in this report and the Wave-1 findings files are not in the repo; its remediation is unrecoverable from the codebase. Flagged for source-file lookup before claiming row 5 complete.

---

### Category 5 — Cal.com Integration (Slots + POST + ICS) (28 issues)

#### Issue W1-05-F1 / D14: `monthCacheKey` Omits `apiKey` + `eventTypeId`
- **Severity:** High
- **Location:** L3631 (`monthCacheKey` function) + L3640 (`useCalcomSlots`)
- **Wave 1 Discovery:** Sub-Agent 05 found the cache key includes month + timezone but NOT `apiKey` or `eventTypeId`.
- **Wave 2 Verification:** Wave2-25 F1 ✅ confirmed HIGH; Wave2-33 A1 ✅ re-discovered independently.
- **Impact:** When an author swaps Cal.com credentials or eventTypeId in Framer, the cache serves stale slots from the previous configuration.
- **Recommended Remediation:** Extend `monthCacheKey` to include `apiKey` + `eventTypeId`; add bulk cache invalidation effect on credential change.
- **Status:** **Completed** — `monthCacheKey` now takes `apiKey` + `eventTypeId` (both call sites updated: `refetch` delete + fetch-effect read); a bulk `cacheRef.current.clear()` effect runs on `[apiKey, eventTypeId]` change so old-config entries don't accumulate. Config swaps in Framer now fetch fresh slots instead of serving the previous credentials' cache. Bundles clean. | monthCacheKey L4530ff, refetch + invalidation effect L4590ff, effect read L4622ff | | Wave2-25 F1, Wave2-33 A1

#### Issue W1-05-F2 / D4: Cal.com API Key Shipped to Browser
- **Severity:** High
- **Location:** L3996 (slots GET `Authorization: Bearer ${apiKey}`); ~L4006 (POST same)
- **Wave 1 Discovery:** Sub-Agent 05 found the API key is bundled into client-side JS and sent in plaintext Bearer header.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed (architectural; cross-ref CC-4, T2-C4, T3-I5).
- **Impact:** Any visitor with DevTools can read the key and replay it to read/modify/cancel all bookings.
- **Recommended Remediation:** Architectural — proxy through a Framer backend function or serverless endpoint that injects the key server-side. Client should POST to `/api/calcom/slots` and `/api/calcom/bookings`. If proxy is out of scope, document as a known security gap and switch to Cal.com's embed-iframe flow.
- **Status:** Completed (documentation path — the file already carries a KNOWN SECURITY LIMITATION block at L3144–3160 covering exactly this: client-side key exposure, DevTools replay risk, rotation/scoping guidance, and the proxy fix requirement. No code change possible inside the single-file constraint; proxying remains a documented infra requirement)

#### Issue W1-05-F3: `.finally()` Clears Timeout After First Attempt
- **Severity:** Medium
- **Location:** Inside `useCalcomSlots` fetch promise chain
- **Wave 1 Discovery:** Sub-Agent 05 found `.finally()` clears the 18s timeout after the first attempt; 5xx retries lose timeout protection.
- **Wave 2 Verification:** Wave2-25 F2 ✅ confirmed.
- **Impact:** Retry path can hang indefinitely.
- **Recommended Remediation:** Move `clearTimeout(timeoutId)` out of `.finally()` into terminal paths only.
- **Status:** **Completed** — the shared timer is gone; each `attempt()` arms its own `attemptTimeoutId` (aborting the shared controller at 18s) and clears it in its own `.finally`, so a hung 5xx retry is still aborted and surfaces `slotsTimeoutError` instead of stalling `loading=true` forever. Accumulated backoff timers are still cancelled on cleanup. | useCalcomSlots attempt L4725ff / finally L4905ff | | Wave2-25 F2

#### Issue W1-05-F4: Date Range in Browser-Local TZ
- **Severity:** Medium
- **Location:** `useCalcomSlots` GET URL construction
- **Wave 1 Discovery:** Sub-Agent 05 found `start` / `end` are computed in browser-local tz, not the visitor-selected `timeZone`.
- **Wave 2 Verification:** Wave2-25 F3 ✅ confirmed.
- **Impact:** Slots near month boundaries may be missed.
- **Recommended Remediation:** Widen date range ±1 day to absorb TZ-boundary drift.
- **Status:** ✅ FIXED — the slots GET range is now widened by one calendar day on each side of the month (L4684ff). Browser-local vs visitor-tz drift (up to ±14h) can no longer push the visitor's first/last day outside the requested range; the calendar grid renders only visible dates so neighboring-day slots are harmless extra data. Verified via `bun build` transpile.

#### Issue W1-06-F-06-1 / W2-25-F4: POST Body Missing `end` Field (CRITICAL)
- **Severity:** High (escalated to Phase-1 fix per synthesis)
- **Location:** `submitCalcomBooking` POST body construction (~L4006–4029)
- **Wave 1 Discovery:** Sub-Agent 06 found Cal.com v2 requires `end` (ISO datetime). Implementation sends only `start`. Data is already in scope (`slot.end` captured at L3820, used by `buildIcsDataUri` L4330 and `buildCalendarDeepLink` L4433) but never threaded into the POST body.
- **Wave 2 Verification:** Wave2-25 F4 ✅ confirmed — "single most impactful defect in the entire Wave 2 audit".
- **Impact:** **Every booking attempt will 400-reject** under Cal.com v2's required-field schema.
- **Recommended Remediation:**
```typescript
// In submitCalcomBooking:
const body = {
  eventTypeId,
  start: slot.start,
  end: slot.end,           // ADD THIS LINE — slot.end is already in scope
  responses: { ... },
  timeZone,
  language,
  metadata,
};
```
- **Status:** Completed (`slotEnd` param added to `submitCalcomBooking`, gated by the same ISO-format guard as `start`; call site in `handleSubmitBooking` now passes `slot.end`, which is captured at slot-mapping time and threaded through `getPayload` → `BookingPayload.end`)

#### Issue W1-06-F-06-3: `manageUrl` Hardcoded
- **Severity:** Medium
- **Location:** SuccessScreen `manageUrl = https://cal.com/booking/${uid}`
- **Wave 1 Discovery:** Sub-Agent 06 found Cal.com v2's response includes `rescheduleUrl` and `cancelUrl` which are discarded.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed.
- **Impact:** Breaks for self-hosted Cal.com instances; collapses reschedule/cancel into one generic link.
- **Recommended Remediation:** Use `bookingResult.rescheduleUrl` and `bookingResult.cancelUrl` from the Cal.com response.
- **Status:** ✅ FIXED — the success screen's manage link now prefers the API-provided `rescheduleUrl` (else `cancelUrl`) over the constructed `https://cal.com/booking/{uid}` fallback, which was host-wrong on self-hosted instances. Both fields are captured across the nested v2 response shapes (`data.booking.*`, `data.*`, top-level) and threaded through `SubmitBookingResult` → `BookingConfirmation`. Link count and label semantics unchanged. Verified via `bun build` transpile.

#### Issue W1-06-F-06-4 / W2-25-F5: `X-Idempotency-Key` Header Not Officially Supported
- **Severity:** Medium
- **Location:** L4002–4004 (header sent)
- **Wave 1 Discovery:** Sub-Agent 06 found the header is sent but Cal.com v2's `/bookings` endpoint doesn't officially document it.
- **Wave 2 Verification:** Wave2-25 F5 ✅ confirmed.
- **Impact:** If unsupported, retry path provides no protection against duplicate bookings.
- **Recommended Remediation:** Verify with Cal.com staging; if unsupported, document and remove.
- **Status:** ✅ FIXED — verified against Cal.com v2's published OpenAPI (POST /v2/bookings, 2026): `X-Idempotency-Key` is NOT a listed parameter (only `cal-api-version`, `Authorization`, `x-cal-secret-key`, `x-cal-client-id`). Header retained as a harmless best-effort but the claim "Cal.com rejects duplicate bookings on the same key" was REMOVED — the comment now documents the verified reality: no documented server enforcement, client NEVER auto-retries the POST, and the only residual duplicate exposure is manual visitor re-submission after an ambiguous failure. Updated comment at L4174–4187 (was the T3-H2 claim).

#### Issue W1-06-F-06-5: ICS Not RFC 5545-Escaped
- **Severity:** Medium
- **Location:** `buildIcsDataUri` (L4311–4390)
- **Wave 1 Discovery:** Sub-Agent 06 found SUMMARY/DESCRIPTION not TEXT-escaped — commas, semicolons, backslashes not escaped.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed.
- **Impact:** Strict calendar clients (Apple Calendar) may mis-parse.
- **Recommended Remediation:** Add `escapeIcsText` helper (escape `\`, `;`, `,`, newlines).
- **Status:** ✅ FIXED — new `escapeIcsText` helper (RFC 5545 §3.3.11 order: backslash → semicolon → comma → newlines as `\n`) now wraps both `SUMMARY` and `DESCRIPTION` in `buildIcsDataUri`. Escape order matters: backslash must come first so the shell-escaped `\;`/`\,` survive the pass. Verified via `bun build` transpile.

#### Issue W1-06-F-06-6 through W1-06-F-06-13: 8 Lower-Priority Cal.com POST Issues
- **Severity:** Low (8 findings)
- **Location:** ICS line folding (75 octets), iOS Safari `data:` URI unreliability, ICS DESCRIPTION when no form answers, `handleJumpToStep` AbortController bypass, `mapCalcomError` substring fragility, `language` field 2-char truncation, Outlook URL consumer-only, `bookingResult.uid` undefined despite success.
- **Wave 1 Discovery:** Sub-Agent 06 cataloged each.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed.
- **Recommended Remediation:** See Fix Cluster 7 in synthesis.
- **Status:** Partial — see per-item detail in Fix Cluster 7 below.

**Fix Cluster 7 item-by-item:**
- ICS line folding (75 octets): ✅ FIXED — `foldIcsLines` folds at 75 UTF-8 octets (never splitting a multi-byte sequence; verified lossless round-trip incl. astral-plane chars) and is applied at `buildIcsDataUri` assembly.
- iOS Safari `data:` URI unreliability: documented — the calendar link is one of three add-to-calendar affordances (Google/Outlook deep links remain), so a data-URI failure still has fallbacks. No code change.
- ICS DESCRIPTION when no form answers: no-op — the field is only emitted when a description exists.
- `handleJumpToStep` AbortController bypass: ✅ FIXED — jumping steps mid-submission now aborts the in-flight POST and consumes the late return exactly like the Cancel button (cancelRequestedRef + submitSeqRef), so the visitor is never dragged into the result screen from the step they jumped to.
- `mapCalcomError` substring fragility: already mitigated — T3-M2 made machine-readable codes branch FIRST; substring heuristics only run for messages with no code. Residual substring risk documented as Low.
- `language` field 2-char truncation: already fixed (T3-L2, `slice(0, 2)` + `navigator.language`).
- Outlook URL consumer-only: documented — deep link targets outlook.com/owa; no enterprise OWA endpoint config exists in the component's config surface.
- `bookingResult.uid` undefined despite success: already fixed (T3-M1 nested-shape fallback chain).

#### Issue W1-06-F-06-14, F-06-15: Refactor Items
- **Severity:** Refactor (2 findings)
- **Location:** `handleRetry` doesn't clear `idempotencyKeyRef`; POST `eventTypeId` numeric coercion rejects slug-based IDs.
- **Wave 1 Discovery:** Sub-Agent 06 cataloged each.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed.
- **Status:** F-06-14 documented as intentional — the idempotency key is deliberately REUSED across a manual re-submit of the same slot (the client never auto-retries), which is the only residual duplicate-protection proxy available given Cal.com v2 does not enforce `X-Idempotency-Key` (W1-06-F-06-4). It is cleared on success, on cancel, and on slot change; the T3-H2 comment documents the rationale. F-06-15 unchanged — `eventTypeId` is configured from Cal.com's numeric event-type ID surface; slug support is not an option in the current config model.

#### Issue W2-25-F6: `Retry-After` Header Not Read on 429 (NEW)
- **Severity:** Medium (NEW from Wave 2)
- **Location:** `useCalcomSlots` catch handler
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Visitor sees generic "wait a moment" copy regardless of server hint.
- **Recommended Remediation:** Read `Retry-After` header on 429; surface "Please wait N seconds" copy.
- **Status:** ✅ FIXED — the non-ok branch of the slots fetch (L3940–3968) now parses `Retry-After` (numeric seconds or HTTP-date) onto the thrown error as `retryAfterSeconds`; the 429 catch branch (L4032–4047) surfaces "Please wait N seconds" (capped at 90) when the hint exists, falling back to the previous copy. Verified via `bun build` transpile.

#### Issue W2-25-F7: Malformed JSON Leaks Raw Error Text (NEW)
- **Severity:** Medium (NEW from Wave 2)
- **Location:** `useCalcomSlots` `res.json()` call
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Visitor sees raw `JSON.parse` error text (e.g., "Unexpected token < in JSON at position 0").
- **Recommended Remediation:** Wrap `res.json()` in try/catch; surface friendly error.
- **Status:** ✅ FIXED — the shared typed reader `readJson` (L5241ff) now wraps `res.json()` in try/catch and rethrows one stable sentinel (`MALFORMED_JSON_RESPONSE`) instead of the raw SyntaxError text; the slots catch ladder maps the sentinel to the friendly `slotsFallbackError` copy, and the submit path's `mapCalcomError` naturally falls through to the generic "Something went wrong while submitting" fallback. No raw `JSON.parse` text can reach the visitor on either path. Verified via `bun build` transpile.

#### Issue W2-25-F10: No `navigator.onLine` Check (NEW)
- **Severity:** Medium (NEW from Wave 2)
- **Location:** `useCalcomSlots` and `submitCalcomBooking`
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Offline visitor wastes a request; no proactive advisory.
- **Recommended Remediation:** Check `navigator.onLine` before fetch; surface "You appear to be offline" copy.
- **Status:** ✅ FIXED — new `offlineError` copy key (interface + defaults + Framer control) surfaces "You appear to be offline…". `useCalcomSlots`'s per-attempt check fails fast before dispatching (error state, no doomed request); `submitCalcomBooking` returns `OFFLINE` before the POST. Verified via `bun build` transpile.

#### Issue W2-25-F11: No Cancel Button During In-Flight Submission (NEW)
- **Severity:** Medium (NEW from Wave 2)
- **Location:** Submit button during `flowStatus === "submitting"`
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Visitor stares at spinner for up to 18s with no escape except page navigation.
- **Recommended Remediation:** Add Cancel button that calls `abortControllerRef.current?.abort()`.
- **Status:** ✅ FIXED — Cancel button rendered in the footer nav only while `isSubmitting` (L6883–6908); `handleCancelSubmit` aborts `abortControllerRef.current`, frees the double-submit guard, clears the stale idempotency key, and returns to the review form. The cancelled POST's late return (an AbortError surfaces as a TIMEOUT-shaped failure) is swallowed via `cancelRequestedRef` + `submitSeqRef` so no error screen appears and a newer submission started after the cancel is never clobbered (guard at L5718–5744). Verified via `bun build` transpile.

#### Issue W2-25-F12: GET/POST Retry Asymmetry (NEW)
- **Severity:** Low (NEW from Wave 2)
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Future maintainer could "fix" asymmetry and create duplicate-booking hazard.
- **Recommended Remediation:** Document retry-path asymmetry; add code comment.
- **Status:** ✅ FIXED — code comment added above the GET 5xx retry block (L4044–4056): the slots GET retries up to 2× with backoff while the booking POST deliberately never auto-retries, because a retried POST whose first attempt actually succeeded server-side could double-book (and Cal.com does not document idempotency-key enforcement, W1-06-F-06-4). Includes an explicit "do not 'fix' without server-side idempotency" warning.

---

### Category 6 — Timezone & i18n (9 issues)

#### Issue F-07-1: Invalid `timeZone` Silently Falls Back
- **Severity:** Medium
- **Location:** `sessionStorage` restore at L4870–4875
- **Wave 1 Discovery:** Sub-Agent 07 found invalid `timeZone` strings from `sessionStorage` restore are unvalidated. Helpers fall back silently to browser-local, but Cal.com fetch URL still gets the bad string → 400 error.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed.
- **Impact:** Visitor can't recover from a 400 error caused by stale sessionStorage.
- **Recommended Remediation:** Add `isValidTimeZone()` validator at the restore boundary.
- **Status:** ✅ FIXED — new `isValidTimeZone` helper (try/catch on `Intl.DateTimeFormat` with the candidate) added beside `detectTimezone`; the sessionStorage restore's timeZone branch now validates and falls back to `detectTimezone()` for invalid IANA strings, so a bad string never reaches the slots fetch URL. Verified via `bun build` transpile.

#### Issue F-07-2: `SuccessScreen.toLocaleDateString` Not Try/Catch'd
- **Severity:** Medium
- **Location:** L7519
- **Wave 1 Discovery:** Sub-Agent 07 found this call isn't guarded, unlike upstream tz helpers. Render-crash if invalid tz reaches this code path.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed.
- **Recommended Remediation:** Wrap in try/catch; fall back to UTC.
- **Status:** ✅ FIXED — the SuccessScreen confirmation summary's zoned `toLocaleDateString` (L9893ff) is now wrapped in try/catch with a browser-local fallback, so an invalid `timeZone` (author typo, corrupt restore, stale prop) degrades gracefully instead of crashing the screen. Verified via `bun build` transpile.

#### Issue F-07-3: DST Fall-Back Produces Duplicate Labels
- **Severity:** Low
- **Location:** `formatTimeLabel` for DST-observing timezones
- **Wave 1 Discovery:** Sub-Agent 07 found DST fall-back (e.g., 2024-11-03 NY) produces two distinct UTC instants that both format to "01:00 AM" with no tz-abbreviation disambiguation.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed via `Intl.DateTimeFormat` test on 2026-11-01 01:30 NY.
- **Impact:** Production slots list shows duplicate labels.
- **Recommended Remediation:** Append `(${tzName})` suffix on label collision.
- **Status:** ✅ FIXED — the single slot-list label builder (DateAndTimeInline's `timeOptions`) now detects label collisions among real Cal.com ISO slots and suffixes each colliding row with the visitor-tz abbreviation per instant ("01:00 AM (EDT)" vs "01:00 AM (EST)"). Pre-verified with node: 2026-11-01 05:30Z/06:30Z NY = same wall label, distinct abbreviations. Suffix only applies when the tz is valid and rows collide; the demo grid (minute steps) can't collide and is untouched. Verified via `bun build` transpile.

#### Issue F-07-4: Calendar Cells Browser-Local Midnights
- **Severity:** Low
- **Location:** L1939–1955 (cell construction); L1028 (cell label via `date.getDate()`)
- **Wave 1 Discovery:** Sub-Agent 07 found calendar cells are constructed as browser-local midnights but labeled via `date.getDate()`, while slot date keys use visitor tz. When visitor's tz differs from browser tz by >12h, cell label disagrees with slots shown.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed — verified with browser Tokyo +9 / visitor LA -8 = 17h delta → cell labeled "Dec 15" shows Dec 14 PST slots.
- **Recommended Remediation:** Construct calendar cells as visitor-tz midnights.
- **Status:** ✅ FIXED — calendar cells are now labeled with the visitor-tz day-of-month via the same `getDateKeyInTimeZone` helper that buckets the slots (CC-13), so label and slot data agree by construction; the aria-label also announces the visitor-tz date (gated by `isValidTimeZone`, browser-local fallback). `timeZone` threaded `CalendarGrid` → `CalendarCell` (DateAndTimeInline render site). Verified via `bun build` transpile.

#### Issue F-07-5 through F-07-9: Lower-Priority TZ Issues
- **Severity:** Low / Refactor (5 findings)
- **Location:** `isTimeElapsed` browser-local `isSameDay`; `detectTimezone` called 3 places (DRY violation); demo grid "HH:MM" no DST awareness; `pageLocale()` returns undefined for unknown `<html lang>`; `parseTimeToMinutes`/`minutesTo24h` reciprocity edge cases.
- **Wave 1 Discovery:** Sub-Agent 07 cataloged each.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed.
- **Recommended Remediation:** Consolidate `detectTimezone` calls; add `isValidTimeZone` helper.
- **Status:** Partial — `isValidTimeZone` helper now exists and is used at the restore boundary, the success-screen date formatter, the cell aria-label path, and the slot-label DST suffix (F-07-1/F-07-2/F-07-3/F-07-4 depend on it). `detectTimezone` call-site consolidation and the remaining display-path edge cases stay documented below severity threshold.

---

### Category 7 — Accessibility: ARIA & Screen Readers (16 issues)

#### Issue W1-10-A1 / W2-28-F1: Radiogroup Containers Missing `aria-required`
- **Severity:** High
- **Location:** 4 `ChoiceGroupInline` instances + `TimeSlotList` radiogroup (L724, L746, L795, L823, L1674)
- **Wave 1 Discovery:** Sub-Agent 10 found `role="radiogroup"` containers don't set `aria-required`. Grep returned 0 matches for `aria-required`.
- **Wave 2 Verification:** Wave2-28 F1 ✅ confirmed HIGH.
- **Impact:** Screen readers don't announce required-ness; WCAG 1.3.1 / 3.3.2 violation.
- **Recommended Remediation:** Add `aria-required={field.required}` to each radiogroup container; propagate to each option button.
- **Status:** **Completed** — `ChoiceGroupInline` gained a `required?: boolean` prop; all 4 radiogroup containers (cards/segmented/radio/pills) and every option button (`aria-required={required || undefined}`) now carry it; FieldRenderer threads `required={field.required}` from the field config (also closes W1-10-A16's option-button gap). `TimeSlotList` gained the same prop — its radiogroup is marked required, and `DateAndTimeInline` passes it through; StepBody passes `required` (datetime steps always demand a picked slot). Bundles clean. | ChoiceGroupInlineProps L575ff / radiogroups L1102–1217 / renderOptionButton L890; FieldRenderer call L9258; TimeSlotListProps L1836ff / radiogroup L2290; DateAndTimeInlineProps L2879ff / TimeSlotList call L3508; StepBody call L8618 | | Wave2-28 F1

#### Issue W1-10-A2 / W2-28-F2: No Dedicated `aria-live` for Step Transitions
- **Severity:** High
- **Location:** Progress counter at L6079/L6174 uses `role="status" aria-live="polite"` but does NOT include step title
- **Wave 1 Discovery:** Sub-Agent 10 found step transitions announce "Step 2 of 5, 20% complete" but NOT the step title. Title is announced only via focus-move-to-heading at L5177–5183.
- **Wave 2 Verification:** Wave2-28 F2 ✅ confirmed + refined — two separate announcements, not combined.
- **Impact:** Screen reader users hear fragmented transition info.
- **Recommended Remediation:** Combine step counter + title in one `aria-live="polite"` region.
- **Status:** ✅ **FIXED** — one sr-only `role="status" aria-live="polite"` region now announces `"Step 2 of 5, 30% complete — <step title>"` as a single combined announcement; the visible counter rows lost their own live roles (no double-announce). See also W2-28-F10 note below. | L6705–6717 (announcement memo/effect), L7099–7118 (region) | | Wave1-10 W1-10-A2

#### Issue W1-10-A3 / W2-28-F3: CalendarGrid Weekday-Header Row Not Marked
- **Severity:** Medium
- **Location:** L1304–1326 (plain `<div>`s, structurally outside `role="grid"` at L1328)
- **Wave 1 Discovery:** Sub-Agent 10 found weekday headers are plain divs.
- **Wave 2 Verification:** Wave2-28 F3 ✅ confirmed.
- **Recommended Remediation:** Wrap in `<div role="row">` with `<div role="columnheader">` children; move inside the `role="grid"` container.

#### Issue W1-10-A4, W1-10-A5, W1-10-A7, W1-10-A8: 4 Medium ARIA Gaps
- **Severity:** Medium (4 findings)
- **Location:** CalendarGrid not associated with `<h3>` via `aria-labelledby`; ChoiceGroupInline label is `<div>` not associated via `aria-labelledby`; Today's cell uses `(Today)` suffix in `aria-label` instead of `aria-current="date"`; Review-step "Edit" buttons have no descriptive `aria-label`.
- **Wave 1 Discovery:** Sub-Agent 10 cataloged each.
- **Wave 2 Verification:** Wave2-28 ✅ confirmed.
- **Recommended Remediation:** Use `aria-labelledby` / `aria-current` / descriptive `aria-label` patterns.

#### Issue W1-10-A6 / W2-28-F4: No `aria-current="step"` Anywhere
- **Severity:** Medium
- **Location:** Step indicator
- **Wave 1 Discovery:** Sub-Agent 10 found grep returns 0 matches for `aria-current`.
- **Wave 2 Verification:** Wave2-28 F4 ✅ confirmed.
- **Impact:** Screen reader users can't identify the current step.
- **Recommended Remediation:** Add `aria-current="step"` to the current step's indicator.
- **Status:** ✅ **FIXED** — the visible step-counter rows (top and bottom positions) carry `aria-current="step"` — the flow's visible step indicator — while the actual transition text is announced via the combined live region (W1-10-A2). | L7305, L7404 | | Wave1-10 W1-10-A6

#### Issue W1-10-A9 / W2-28-F5: Month/Year `aria-live` Region First-Render Risk
- **Severity:** Medium
- **Location:** L1287–1302 (`aria-live="polite"` region)
- **Wave 1 Discovery:** Sub-Agent 10 found the region may announce on first render (no mount guard).
- **Wave 2 Verification:** Wave2-28 F5 ✅ confirmed.
- **Impact:** Screen reader users hear "January 2026" on page load.
- **Recommended Remediation:** Add `hasMounted` ref to suppress first-render announcement.
- **Status:** ✅ **FIXED** — CalendarGrid now diff-tracks the `monthName yearLabel` string; the region's content stays empty until the first real month change, so page load is silent and only actual month jumps announce. | L1382–1392, L1599 | | Wave1-10 W1-10-A9

#### Issue W1-10-A10 / W2-28-F6: Continue Button Missing `aria-busy`
- **Severity:** Medium
- **Location:** Continue/Submit button during `flowStatus === "submitting"`
- **Wave 1 Discovery:** Sub-Agent 10 found the button has no `aria-busy` attribute while submitting. Spinner span L6368–6380 is purely visual.
- **Wave 2 Verification:** Wave2-28 F6 ✅ confirmed.
- **Impact:** Screen reader users don't know submission is in progress.
- **Recommended Remediation:** Add `aria-busy={flowStatus === "submitting"}` to the button.
- **Status:** ✅ **FIXED** — the submit/Continue button now sets `aria-busy` while `flowStatus === "submitting"`, so screen readers announce the in-flight state instead of only seeing the disabled attribute. | L7677 | | Wave1-10 W1-10-A10

#### Issue W1-10-A11 through W1-10-A16 + W2-28-F10: 7 Lower-Priority ARIA Gaps
- **Severity:** Low (7 findings)
- **Location:** Timezone `<select>` missing `aria-required`; hidden input in radiogroup missing `aria-hidden`; time-slot buttons no timezone in `aria-label`; "Pick a date" hint uses `role="status"` on first render; ChoiceGroup option buttons don't propagate `aria-required`; `data-date-key` exposed to AT; step-progress counter `aria-live` regions no first-render guard.
- **Wave 1 Discovery:** Sub-Agent 10 cataloged each.
- **Wave 2 Verification:** Wave2-28 ✅ confirmed.
- **Recommended Remediation:** See Fix Cluster 13.
- **W2-28-F10 fix note (in cluster 13):** ✅ **FIXED** — the two visible step-progress `role="status"` counters had no first-render guard; they were replaced by the single combined region of W1-10-A2, which holds empty content until the active step changes (no announcement on mount). The remaining A11–A16 items (timezone select `aria-required`, hidden-input `aria-hidden`, time-slot label timezone, "Pick a date" status hint, `data-date-key` exposure, option `aria-required` propagation) are outside cluster-13 scope (see plan table row 13). | L6705–6717, L7099–7118 | | Wave2-28 W2-28-F10
- **A16 fix note (with W1-10-A1):** ✅ **FIXED** — ChoiceGroup option buttons now propagate `aria-required` alongside the already-shared `aria-invalid`/`aria-describedby` (renderOptionButton). **A11 ✅ FIXED** — the review-step timezone `<select>` now sets `aria-required="true"` (the datetime step is always required: a slot time only means something in that timezone) | L9307 |. **A12 ✅ FIXED** — the radiogroup's hidden form-state input is now `aria-hidden="true"` (transport only; some SRs announced it as an editable field) | L1157–1162 |. **A13 ✅ FIXED** — each time-slot button now names its zone: `aria-label="{label}, {timeZone}"`, threaded `DateAndTimeInline → TimeSlotList → TimeSlotButton` (W1-07-F4 threaded the grid; this closes the same gap for the slot list) | L1982, L2021–2022, L2058–2062, L2504, L3749 |. **A14 ✅ FIXED** — the "Pick a date" hint is static guidance, not a status change; its `role="status"`/`aria-live` (from the T5-H8 sweep) made SRs announce it on page load — removed; the two genuinely dynamic regions (loading / no-times) keep theirs | L2354 |. **A15 ✅ ACCEPTABLE by design** — `data-date-key` is a plain data attribute (never announced by AT) and is load-bearing: the W1-11-A2 cross-month focus restore queries it; removing it would break keyboard focus tracking for no accessibility gain.

---

### Category 8 — Accessibility: Focus & Keyboard Navigation (11 issues + 2 NEW)

#### Issue W1-11-A1 / D5: CC-5 Only Half-Fixed (CRITICAL)
- **Severity:** Critical
- **Location:** L7143 (inline `outline: "none"` in `inputBaseStyle`); L6396–6399 (CSS rule `.be-input:focus-visible` that the override defeats)
- **Wave 1 Discovery:** Sub-Agent 11 found the T4-L2/T5-C1 className-mismatch fix repaired the CSS class name, but the inline `outline: "none"` style overrides the repaired CSS rule by CSS specificity (inline `1,0,0,0` > class+pseudo-class `0,2,0`).
- **Wave 2 Verification:** Wave2-28 F7 ✅ CONFIRMED CRITICAL; Wave2-29 ✅ CONFIRMED.
- **Root Cause Analysis:** Two-layer fix (className + outline) was applied in two passes; the second pass (outline removal) was missed.
- **Impact:** Keyboard focus ring STILL invisible on every form input. WCAG 2.4.7 violation.
- **Recommended Remediation:**
```typescript
// In FieldRenderer's inputBaseStyle (around L7143):
// REMOVE: outline: "none",
// OR replace with: outline: "revert",  // restores browser default
// Better: don't set outline inline at all; let the .be-input:focus-visible CSS rule apply.
```

- **Status:** Completed (inline `outline: "none"` removed from `inputBaseStyle`; `.be-input { outline: none }` base rule still suppresses mouse-focus outlines, `.be-input:focus-visible` now applies the keyboard ring)

#### Issue W1-11-A2 / D1: PageUp/PageDown Focus Loss After Month Change
- **Severity:** High (escalated from Medium by Wave2-28)
- **Location:** L888–889 (`CalendarCellProps.onGoToNextMonth: () => void` — drops `focusAfter?` param); L1062–1063 (same for `onGoToPreviousMonth`); L986–991 (PageUp/PageDown keyboard handler can't pass `focusAfter=true`)
- **Wave 1 Discovery:** Sub-Agent 11 found the H5 fix infrastructure (`pendingMonthFocusRef`) exists but is dead code — no caller passes `focusAfter=true`. Grep confirmed 0 matches for `goToNextMonth(true)` / `goToPreviousMonth(true)`.
- **Wave 2 Verification:** Wave2-28 F8 ✅ CONFIRMED HIGH (WCAG 2.4.3 focus-order violation); Wave2-27 F4 ✅ confirmed.
- **Impact:** When user presses PageUp/PageDown to switch months, focus is lost to `document.body`.
- **Recommended Remediation:** Widen prop types to `(focusAfter?: boolean) => void`; have `CalendarCell.onKeyDown` pass `true` for PageUp/PageDown; resurrect the `pendingMonthFocusRef` effect.
- **Status:** Completed. `CalendarCellProps.onGoToNextMonth`/`onGoToPreviousMonth` and `CalendarGridProps.onNextMonth`/`onPrevMonth` widened to `(focusAfter?: boolean) => void`; the PageUp/PageDown handler now calls `onGoToNextMonth(true)`/`onGoToPreviousMonth(true)` (L993–996), which sets `pendingMonthFocusRef` and the existing `[visibleMonth]` effect re-focuses the new month's `[tabindex="1"]` active cell. Mouse nav-button clicks intentionally keep calling without the flag — the button itself stays focused. Result: focus stays in the date grid across month changes (WCAG 2.4.3).

#### Issue W1-11-A3 / W2-28-F9: TimeSlotList Unreachable via Tab When No Slot Selected
- **Severity:** High
- **Location:** L1736 (`tabIndex={elapsed ? -1 : selected ? 0 : -1}`)
- **Wave 1 Discovery:** Sub-Agent 11 found the roving-tabindex logic leaves no tabbable slot when none is selected. Compare with `ChoiceGroupInline` L521 which correctly falls back to the first option.
- **Wave 2 Verification:** Wave2-28 F9 ✅ confirmed HIGH (WCAG 2.1.1 violation).
- **Impact:** Keyboard-only users can't reach the time slot list at all until they click a slot with a mouse.
- **Recommended Remediation:** Change L1736 to mirror `ChoiceGroupInline`'s pattern: `tabIndex={selected ? 0 : index === 0 ? 0 : -1}`.
- **Status:** **Completed** — `TimeSlotButton` gained an `isInitialFocus` prop and its tabIndex is now `elapsed ? -1 : selected ? 0 : isInitialFocus ? 0 : -1`; `TimeSlotList` computes the first non-elapsed slot via `findIndex((t) => !isTimeElapsed(t))` and passes `isInitialFocus` to exactly that button when nothing is selected. Goes one step beyond the recommended remediation: if the first slot of the day has already elapsed (e.g. 09:00 at 09:30), the first *enabled* slot takes the tab stop instead of a disabled one. Arrow-key roving inside the radiogroup was already in place. Bundles clean. | TimeSlotButton props ~L1915 / tabIndex L1965; TimeSlotList map L2361–2374 | | Wave2-28 F9

#### Issue W1-11-A4: `handleRetry` Focus Loss
- **Severity:** Medium
- **Location:** `handleRetry` function
- **Wave 1 Discovery:** Sub-Agent 11 found when user clicks "Retry" on the error screen, focus does NOT move to a sensible target.
- **Wave 2 Verification:** Wave2-29 ✅ confirmed.
- **Recommended Remediation:** Move focus to the first focusable element in the in-progress view.

#### Issue W1-11-A5 + W1-11-A6: No `:focus-visible` Styling on 14 Buttons/Links
- **Severity:** Medium (2 findings)
- **Location:** Back/Continue buttons; prev/next month buttons, slots-error retry, Edit links, success/error screen links and buttons (~12 elements)
- **Wave 1 Discovery:** Sub-Agent 11 found no `:focus-visible` CSS rules for these elements.
- **Wave 2 Verification:** Wave2-29 ✅ confirmed.
- **Recommended Remediation:** One global CSS rule `button:focus-visible, a:focus-visible, select:focus-visible { outline: 2px solid var(--accent-color); outline-offset: 2px; }`.

#### Issue W1-11-A7 + W2-29-N1 (NEW): Focus Ring Invisible on Selected Option/Slot
- **Severity:** Medium (2 findings)
- **Location:** `ChoiceGroupInline` L544–549 (selected option); `TimeSlotList` L1789–1795 (selected slot)
- **Wave 1 Discovery:** Sub-Agent 11 found T1-M13 layered-ring fix exists in `CalendarCell` but was NOT back-ported to `ChoiceGroupInline`.
- **Wave 2 Verification:** Wave2-29 ✅ confirmed W1-11-A7; Wave2-29 N1 ✅ NEW — same gap in `TimeSlotList` (Wave 1-11 missed this).
- **Recommended Remediation:** Back-port the CalendarCell layered-ring pattern to both call sites.

#### Issue W1-11-A8 through W1-11-A11 + W2-29-N2 (NEW): Lower-Priority Focus Issues
- **Severity:** Low / Refactor (5 findings)
- **Location:** Timezone `<select>` lacks `.be-input` class; no focus management on slots-error banner; positive `tabIndex` on calendar cells breaks Tab order (acknowledged tradeoff); duplicated `useKeyboardModality` hook logic; `focusTimerRef` cleanup gated on `persistState` (NEW from Wave2-29).
- **Wave 1 Discovery:** Sub-Agent 11 cataloged each.
- **Wave 2 Verification:** Wave2-29 ✅ confirmed; W2-29-N2 ✅ NEW.
- **Recommended Remediation:** See Fix Cluster 3 + 4.
- **Status:** — **A8 ✅ FIXED** — the review-step timezone `<select>` now carries `className="be-input"`, picking up both the base outline suppression and the `.be-input:focus-visible` keyboard ring restored by the CC-5/W1-11-A1 fix | L9298–9306 |. **A9 ✅ FIXED** — the slots-error banner now takes focus (`tabIndex={-1}`, ref) on first appearance via a transition-watching effect in StepBody; the `role="alert"` announcement is untouched, focus just lands the cursor for inspection | L9009–9025, L9267–9268 |. **A10 ✅ ACCEPTABLE by design** — the single `tabIndex=1` "active" cell is the standard roving-tabindex model for arrow-key grids (same as the time-slot radiogroup); positive tabIndex keeps the active cell reachable when nothing is selected, and Tab moves past the grid via the single tab stop as intended. **A11 ✅ FIXED** — ChoiceGroupInline's inline window-listener effect re-implemented the shared T7-M3 `useKeyboardModality` hook; it now consumes the hook (identical behavior, one implementation) | L836–840, L2517–2541 |. **W2-29-N2 ✅ FIXED** — the `focusTimerRef` cleanup lived inside the persist effect's teardown, which early-returns (persistState off / canvas / post-success) *before* registering any cleanup; in those configs a scheduled focus timer leaked until unmount. The focus-timer cleanup now lives in its own unmount-only effect that always runs | L6682–6697, L6674–6681 |.

---

### Category 9 — Persistence (sessionStorage) & Privacy (12 issues + 2 NEW)

#### Issue F-12-1: Corrupt `sessionStorage` Entry Never Purged
- **Severity:** Low
- **Location:** Restore effect at L4885–4891
- **Wave 1 Discovery:** Sub-Agent 12 found if `JSON.parse` throws, the bad entry stays in storage forever.
- **Wave 2 Verification:** Wave2-31 ✅ confirmed.
- **Recommended Remediation:** Wrap `JSON.parse` in try/catch; on failure, `sessionStorage.removeItem(STORAGE_KEY)`.
- **Status:** Completed (restore catch now purges the corrupt entry; schema-version mismatch also purges instead of guessing)

#### Issue F-12-2 / W2-31-A-31-1: GDPR/CCPA PII Without Consent (HIGH — escalated from MED)
- **Severity:** High (escalated by Wave2-31 from Medium)
- **Location:** Persist effect at L4915–4928; `persistState` hardcoded `true`
- **Wave 1 Discovery:** Sub-Agent 12 found PII (name, email, phone) persisted without opt-out.
- **Wave 2 Verification:** Wave2-31 A-31-1 ✅ upgraded to HIGH — reframed as GDPR/CCPA compliance issue.
- **Impact:** GDPR/CCPA — visitor inputs (name, email, phone) persisted without notice, consent, or "clear my data" control.
- **Recommended Remediation:** Add `persistState: ControlType.Boolean` (default false); add `privacyNotice: ControlType.String` PropertyControl with disclosure text; add mid-flow "Clear my saved answers" affordance.
- **Status:** Completed. (1) `persistState` exposed as Config PropertyControl, **default OFF** (was hardcoded `true`) — PII is only written when an author opts in. (2) `privacyNotice` ships with a real disclosure default instead of empty. (3) Mid-flow "Clear my saved answers" link + "Answers are saved in this browser" indicator appear when anything is stored; clears the sessionStorage entry without disrupting the form. (4) Persistence fully gated off the Framer canvas/exports (`useIsStaticRenderer`). Pairing note: opt-in default means previously-published instances stop persisting until authors enable the new control.

#### Issue F-12-3 through F-12-6: 4 Lower-Priority Persistence Issues
- **Severity:** Low (4 findings)
- **Location:** No schema version stamp; persist runs on Framer canvas (no RenderTarget guard); orphaned entries when `useId()` shifts; restore overwrites values without merging.
- **Wave 1 Discovery:** Sub-Agent 12 cataloged each.
- **Wave 2 Verification:** Wave2-31 ✅ confirmed.
- **Recommended Remediation:** See Fix Cluster 6.
- **Status:** Completed as a cluster: schema version stamp (`v: 1`) written/checked on every persist/restore (F-12-3); canvas/export write+restore skipped via `useIsStaticRenderer` (F-12-4); storage entry keyed by `useId()` per instance and cleared on finish/restart (F-12-5); restore now MERGES over current values instead of wholesale replacement (F-12-6).

#### Issue F-12-7 through F-12-12 + W2-31-A-31-2 / A-31-3: Refactor Items
- **Severity:** Refactor (6 findings + 2 NEW)
- **Location:** `focusTimerRef` cleanup mixed into persist effect (cross-ref F-30-1); reviver over-broad (any `"date"` key coerced); first post-mount persist redundant; `focusTimerRef` overwritten without clearing prior timer; quota-exceeded not surfaced; no pre-write size check; `privacyNotice` defaults to empty; mid-flow "Clear" affordance missing.
- **Wave 1 Discovery:** Sub-Agent 12 cataloged each.
- **Wave 2 Verification:** Wave2-30 ✅ confirmed; Wave2-31 ✅ confirmed.
- **Recommended Remediation:** See Fix Cluster 6.
- **Status:** Completed as a cluster: over-broad "date" reviver removed (only `__selectedSlot.date` is rehydrated, via the targeted post-parse block — a visitor-typed text field named "date" no longer becomes a Date object) (F-12-8); redundant first mount write suppressed — nothing persists until the visitor entered data or left step 0 (F-12-9); quota-exceeded writes surface a one-time in-flow notice (F-12-10/F-12-12); `privacyNotice` now has a meaningful default (A-31-2); mid-flow "Clear my saved answers" added (A-31-3). `focusTimerRef` cleanup stays in the persist effect's return but is now cleared before overwrite via the shared effect teardown (W1-14-F2 / W2-30-F3 residual verified against the ref pattern at L5091+).

---

### Category 10 — Code Quality, Performance, TypeScript, Motion, Mobile, Theme (44 issues)

#### Sub-Category 10a: Code Quality / Refactor (Wave 1-14, 15, 16) — 22 issues
- **W1-14-F2 / F-30-1 (Medium):** Persist effect cleanup cross-wires `focusTimerRef`. Wave2-30 ✅ confirmed. — **✅ FIXED** (focus timers now scheduled via a `scheduleFocusTimer` helper that clears the prior timer; persist-effect cleanup remains as unmount safety)
- **W1-14-F3 (Medium):** Inline arrow `onTimeFormatChange` at L6260 breaks `StepBody` memoization. Wave2-33 ✅ confirmed. — **✅ FIXED** (new stable `handleTimeFormatChange` useCallback in the hook, exposed via return/destructure, used at the StepBody call site; the inline arrow previously gave `StepBody` a fresh prop reference on every render)
- **W1-14-F4 (Medium):** `handleSubmitBooking` and `handleContinue` have `values` in deps. Wave2-33 ✅ confirmed. — **✅ FIXED** (all `values` reads in both handlers now go through the existing `valuesRef` — same pattern already used by `focusFirstInvalidField` — and `values` is gone from both dep arrays; the callbacks no longer rebuild on every keystroke)
- **W1-14-F5 / F6 / F7 (Low × 3):** `goToPreviousMonth`/`goToNextMonth` skip `startTransition`; `useLayoutEffect` for `currentIndex` uses `startTransition` (defeats purpose); `fontStack` not memoized. — **✅ FIXED** (F5: month flips now wrapped in `startTransition`, updater stays pure, W1-11-A2 focus effect still runs post-commit; F6: `startTransition` removed from the CC-8 clamp layout effect so the correction commits before paint; F7: `fontStack` is now a `useMemo` on the `font` prop)
- **W1-14-F8 (Refactor):** `React.memo` on all 11 leaf components without custom comparators.
- **W1-16-P-01 / W2-35-M-01 (Refactor — downgraded from Medium):** FieldRenderer rebuilds `opts` array every render. Wave2-35 verdict: SKIP (premature memoization — `FieldRenderer` is already `React.memo`'d with stable prop surface).
- **W1-16-P-02 / W2-35-M-02 (Medium retained):** TimeSlotList renders 17-48 slot buttons inline; no per-slot memoization. Wave2-35 verdict: APPLY (extract `TimeSlotButton` `React.memo`'d child). — **✅ FIXED** (`TimeSlotButton` memo'd child extracted; props are all primitives/booleans plus the parent's stable `useState` setters/`useCallback` handlers, `elapsed` precomputed in the map so the 60s-tick rebuild of `isTimeElapsed` doesn't churn the buttons; a slot re-renders only when its own state changed)
- **W1-16-P-03 through P-12 (Low / Refactor × 9):** Various premature-memoization concerns. Wave2-35 verdicts: SKIP for most.
- **W1-15-TS-01 (Medium):** Last `as any` in production: `(Intl as any).Locale(localeTag)` at L1915. — **✅ FIXED** (typed alias: `Intl as unknown as { Locale: new (tag: string) => { getWeekInfo? / weekInfo? } }` — the only fields the calendar reads; no `any` remains in the file) | L2396–2410 | | Wave1-15 W1-15-TS-01
- **W1-15-TS-02 (Refactor — reclassified from Medium):** `await res.json()` returns `Promise<any>`. Wave2-34: TypeScript strictness, no runtime impact. — **✅ FIXED** (one typed `readJson<T>` reader; both API calls (availability + booking POST) declare their exact payload unions, and every branch narrows before use) | L5000–5004 (reader), L4545–4560 (availability union), L4855–4878 (booking union) | | Wave1-15 W1-15-TS-02
- **W1-15-TS-03 (Medium):** Six `catch (err)` clauses with implicit `any`. Fix via `useUnknownInCatchVariables: true`. — **✅ FIXED** (all six now `catch (err: unknown)` — each body only forwards `err` to `console.warn`, so nothing needed narrowing; the 7th clause (submit catch) was already typed in an earlier bundle) | L5869, L5927, L5967, L6297, L6827, L6844 | | Wave1-15 W1-15-TS-03
- **W1-15-TS-04 through TS-11 (Low × 8):** rawSlots typing, restoredValues implicit any, redundant casts, isCalSlot idiom, FramerFont interface, BookingValues intersection. — **✅ FIXED / verified-by-inspection** (TS-04: `rawSlots` explicitly `unknown[]`, narrowed by the existing `isCalSlot` guard (TS-07, already in place at L4334); TS-05: `restoredValues` typed `Record<string, unknown>` with one documented cast at the `setValues` merge; TS-06: remaining casts audited — only `as const`, the two purpose-built `as unknown as` aliases (Intl.Locale TS-01, `window` TypedArray probing) and the typed JSON reader remain; TS-10/W2-34-Item-6: `FramerFont` documents that it declares only the six fields `fontStack` reads — extra runtime fields are ignored, never misread (see note below); TS-11: `BookingValues` is already the documented `Record<…> & { [SELECTED_SLOT_KEY]?: BookingPayload }` intersection from an earlier fix). Caveat: this repo has no tsconfig/node_modules, so verification is transpile (`bun build` clean) + static analysis, not `tsc`. | L1743–1745, L3474–3484, L4334, L5734+, L5000+ | | Wave1-15 W1-15-TS-04
- **W1-08-CG-03 (in bundle 9):** Detail section absent from this report (same recovery gap as W1-20-H2 — no Wave-1 detail file in the repo). Verified by inspection instead: the full `CalendarGrid` prop surface is already stable — `CalendarCell` and `CalendarGrid` are `React.memo`'d, `cells`/`dateTabIndexByKey` are `useMemo`'d, `dateKeyOf`/`hasKnownAvailability`/`handleDateSelect`/`moveFocus` and both month-nav callbacks are `useCallback`'d, and the only remaining non-primitive prop (`locale={pageLocale()}`) is a cheap string. No inline-object regression found in current code; noted as covered by inspection.
- **W2-33-A1 (NEW Medium):** `useCalcomSlots` cache key omits `apiKey`/`eventTypeId` (re-discovery of W1-05-F1). — **✅ FIXED** (with W1-05-F1 — key now includes both; see that block) | monthCacheKey L4530ff | | Wave2-33 W2-33-A1
- **W2-33-A2 / A3 / A4 (NEW Low × 3):** `useCalcomSlots` effect captures `fallbackErrorLabel` but omits from deps; `useStateGuarded` setter churns when `max` changes; `handleContinue` reads raw `currentIndex` at L5408. — **A3 ✅ FIXED** (with F-03-3 — setter is now a stable `[]`-dep callback reading the ceiling from a latest-ref) | useStateGuarded L8398ff; **A4 ✅ FIXED** (with W1-04-M4 — review-branch comparison uses clamped `safeCurrentIndex`; see F-03-6) | handleContinue review branch ~L6995; **A2 ✅ FIXED** — `fallbackErrorLabel` added to the `useCalcomSlots` fetch effect's dep array | effect deps ~L4965

#### Sub-Category 10b: Motion (Wave 1-18, 37) — 9 issues
- **W1-18-F1 (Medium):** 8 inline-CSS `transition:` properties NOT gated by `prefersReducedMotion`. Wave2-37 ✅ confirmed at L554, L1013, L1554, L1787, L6121, L6334, L6360, L7144. — **✅ FIXED** (nine spots gated — choice option buttons, calendar cells, time-slot buttons, the 12h/24h time toggle, progress step segments, input focus border in `inputBaseStyle`, and the footer Back/Cancel/Submit opacity fades: `transition: "none"` under prefers-reduced-motion; MotionConfig can't touch plain CSS transitions so each is gated where it's defined) | L797, L1285, L1815, L1967, L7296, L7576, L7604, L7633, L8492 | | Wave1-18 W1-18-F1
- **W1-18-F2 (Medium):** `layout` prop on `AnimatedStepContent` (L4487) not reduced-motion-gated; re-measures on every keystroke. Wave2-37 ✅ confirmed. — **✅ FIXED** (`layout={!reducedMotion}` — under prefers-reduced-motion framer-motion stops the expensive layout-measure pass entirely) | L5097 (AnimatedStepContent L5063+) | | Wave1-18 W1-18-F2
- **W1-18-F3 (Medium):** No `<MotionConfig reducedMotion="user">` wrapper. Wave2-37 ✅ confirmed — "single highest-impact fix". — **✅ FIXED** (`RootShell` — the single root every flow state (in-progress / success / error) renders through — now wraps the tree in `<MotionConfig reducedMotion="user">`, so all framer-motion transforms/layout go instant for reduce-motion visitors) | L7734 (RootShell L7723+) | | Wave1-18 W1-18-F3
- **W1-18-F4 / F5 / F6 (Low / Refactor × 3):** Form container no `overflow`; `PROGRESS_BAR_TRANSITION`/`TIME_TOGGLE_TRANSITION` not exposed via PropertyControls; terminal-state transitions are abrupt swaps. — not in cluster-12 scope (see plan table).
- **W2-37-A1 (NEW Medium):** Author-customized `stepTransition` bypasses `prefersReducedMotion` (short-circuit at L4594–4598). — **✅ FIXED** (the reduced-motion branch now wins over the author's customized transition instead of the reverse — `prefersReducedMotion ? tween-0 : author-or-default`) | L5216–5222 | | Wave2-37 W2-37-A1
- **W2-37-A2 (NEW Low):** Textarea auto-resize `useEffect` causes per-keystroke layout reflow. — **✅ FIXED** (height writes only occur when content actually grows past or shrinks below the current box; typing within the current height is a no-op, so per-keystroke layout passes are gone) | L8370–8390 (FieldRenderer) | | Wave2-37 W2-37-A2
- **W2-37-A3 (NEW Refactor):** No `@media (prefers-reduced-motion: reduce)` rule in `<style>` block. — **✅ FIXED** (a scoped `.be-motion-root` media rule in RootShell zeroes `animation-duration`/`transition-duration` under reduce mode; scoped to the component so the host page is never affected) | L7745–7755 | | Wave2-37 W2-37-A3

#### Sub-Category 10c: Mobile / Responsive (Wave 1-19, 38) — 17 issues
- **W1-19-F-01 (Critical):** Calendar grid overflows ≤330px viewports. Wave2-38 ✅ confirmed. — **Status: Completed** (both weekday-header and calendar grids changed `minmax(44px, 1fr)` → `minmax(0, 1fr)`; identical on normal widths, graceful shrink on tiny viewports)
- **W1-19-F-02 (High):** Input `fontSize: 14` triggers iOS Safari zoom-on-focus. Wave2-38 ✅ confirmed. — **✅ FIXED** (bump the effective input font to ≥16px on coarse-pointer devices — `(pointer: coarse)` — where iOS zooms on focus; flow field inputs/textarea/select via a memo (14px kept on fine pointers) and the review-step timezone `<select>` via the same on-render check) | L8393–8416 (field inputs), L7950–7985 (review timezone select) | | Wave1-19 W1-19-F-02
- **W1-19-F-03 (High):** "Edit" link in `ReviewStepBody` below 44×44px touch target. Wave2-38 ✅ confirmed. — **✅ FIXED** (the Edit button now has a 44×44px hit area — `minWidth`/`minHeight: 44`, inline-flex centered — while the label keeps its 12px type) | L8278–8296 | | Wave1-19 W1-19-F-03
- **W1-19-F-04 through F-07 (Medium × 4):** Hidden scrollbars no affordance; choice cards 2-col truncation; `PILLS_SINGLE_COLUMN_BREAKPOINT` misnomer; no virtual-keyboard handling. — **✅ FIXED** (F-04: time-slot list scrollbar went from hidden (`scrollbarWidth/msOverflowStyle: none` + `::-webkit-scrollbar { display: none }`) to thin-but-visible on every engine — Firefox/Edge inline `thin`, WebKit gets a themed 8px thumb rule; F-05 + F-10: card/radio/segmented option labels now wrap (`whiteSpace: normal`) instead of ellipsizing — pills keep nowrap so the pill shape survives; F-06: constant renamed `PILLS_SINGLE_COLUMN_BREAKPOINT` → `PILLS_TWO_PER_ROW_BREAKPOINT` — it gates two-per-row, not single-column; F-07: a `visualViewport` resize listener scrolls the focused input/textarea/select back into view when the virtual keyboard covers it) | L1950–1960 + L3260–3268 (scrollbars), L858–915 (labels), L3600 + L1076–1092 (breakpoint), L5238–5290 (visualViewport) | | Wave1-19 W1-19-F-04
- **W1-19-F-08 through F-12 (Low × 5):** `gap: 24` wastes space; no `scroll-margin-top`; `whiteSpace: nowrap` prevents wrapping; `paddingBottom: 84` insufficient on notched iPhones; `measuredWidth` initial guess flash. — **✅ FIXED** (F-08: calendar header gutter `24 → isNarrow ? 12 : 24`; F-09: step-title focus target gets `scrollMarginTop: 72` so sticky chrome never covers it; F-10: covered by the F-05 label-wrap sweep; F-11: form bottom padding is now `calc(84px + env(safe-area-inset-bottom, 0px))` for notched iPhones; F-12: both width-measuring components read `clientWidth` synchronously in a layout effect before the ResizeObserver lands, killing the 320px/560px guess flash on first paint) | L1450–1460 (gap), L7376 (scroll-margin), L7352 (safe-area), L610–635 + L2815–2840 (measured width) | | Wave1-19 W1-19-F-08
- **W1-19-F-13 through F-17 (Refactor × 5):** Informational items (compact-mode, 100dvh, host-page scroll reliance, safe-area-inset positive).

#### Sub-Category 10d: Theme / Colors (Wave 1-17, 36) — 13 issues
- **W1-17-F-17-1 (High):** `getReadableTextColor` uses non-WCAG luminance formula (Rec.601 + 0.6 threshold instead of WCAG 2.1 relative luminance + 4.5:1). Wave2-36 ✅ confirmed — verified `#808080` returns white where WCAG requires black. — **✅ FIXED** (WCAG 2.1 relative luminance (sRGB→linear, 0.2126/0.7152/0.0722) with the exact black/white tie threshold L = 0.1791; `#808080` now picks black at 5.32:1, `#0066BB` still white at 5.70:1; one added `srgbToLinear` guard means a 8-bit unitless value can no longer produce an out-of-range luminance) | L243–301 | | Wave1-17 W1-17-F-17-1
- **W1-17-F-17-2 (High):** `parseColorToRgb` does not support 8-char hex, 4-char hex, named colours, or `hsl()/hsla()`. Wave2-36 ✅ confirmed. — **✅ FIXED** (full parser rewrite: hex 3/4/6/8 (with or without `#`), named colours, `rgb()/rgba()` with commas or space+slash and `%` channels, `hsl()/hsla()` with deg/rad/turn/grad and alpha; `parseColorToRgb` is now a projection of the new `parseColorToRgba`) | L101–233 (parser), L235–241 (projection) | | Wave1-17 W1-17-F-17-2
- **W1-17-F-17-3 / D6 (High):** `borderRadius` token NOT cascaded to `CalendarCell` (L997) or `TimeSlotList` (L1767). Wave2-36 ✅ confirmed — 7 hardcoded radius literals verified. — **✅ FIXED** (cascade now: `CalendarCell` takes `borderRadius` ← `CalendarGrid` ← `DateAndTimeInline.radius` (its existing prop) for the date cells and both month-nav arrows; `TimeSlotButton` takes `radius` ← `TimeSlotList.borderRadius` ← `DateAndTimeInline.radius`; internals like the progress bar, time pills and segmented toggles intentionally stay `999` – they are pill shapes, not radius tokens) | CalendarCell L1094–1160, CalendarGrid L1266–1510, TimeSlotButton L1686–1770, TimeSlotList L1620–2118, DateAndTimeInline L2605–2690, 3149–3220 | | Wave1-17 W1-17-F-17-3
- **W1-17-F-17-4 through F-17-7 (Medium × 4):** Dark-mode fallback exact-equality; no contrast validation warning; no `parseColorToRgb` failure warning; `withAlpha` doesn't blend alpha onto background. — **FIXED** (F-17-4: theme memo normalizes light-default comparison (trim/case/`#`) so `#ffffff`/`white` correctly fall back to dark values; F-17-5: canvas-only `themeVerdicts` banner checks AA 4.5:1 for primary/secondary/error/success text on page and surface plus the auto text picker vs accent, evaluated on the resolved dark-aware theme; F-17-6: same banner lists unparseable author colour tokens (invalid → browser default); F-17-7: `withAlpha` now composites a translucent colour over an optional background before returning, and `getReadableTextColor` composites over white before judging luminance) | L5156–5270 (memo), L5850–5925 (verdicts), L7080–7118 (banner), L101–186 + L268–299 (withAlpha/picker) | | Wave1-17 W1-17-F-17-4
- **W1-17-F-17-8 (Medium, also W1-02-F2/D13):** Dark-mode `accentColor`/`errorColor`/`successColor`/`borderRadius` were dead fields — the memo never read them. — **✅ FIXED** (same sweep as F-17-4: the theme memo now applies a dark counterpart for all nine fields, reading `DEFAULT_DARK_THEME` values for accent/error/success/borderRadius; fields deliberately held at a non-default light value keep it in dark mode) | L5156–5270 (memo), L3585–3595 (`DEFAULT_DARK_THEME`) | | Wave1-17 W1-17-F-17-8
- **W1-17-F-17-9 / F-17-10 / F-17-12 / F-17-13 (Low × 4):** `prefers-color-scheme` subscription always active; SSR dark-flash risk; `ColorMode` type vs PropertyControl enum naming mismatch; `borderRadius` type mismatch (`string` vs `ControlType.BorderRadius`). — **F-17-9 ✅ FIXED** (the OS-scheme subscription effect now bails unless `colorMode === "auto"` — fixed-mode instances no longer listen and re-render on unrelated OS theme toggles; the T10-M6 lazy-initializer first-paint correctness is untouched) | L6093–6121 |. **F-17-10 ✅ ACCEPTABLE by design** — the T10-M6 synchronous lazy init already makes the first client paint correct; the residual "flash" is only the pre-hydration SSR document, and Framer runs this client-rendered (canvas/export additionally gated by `useIsStaticRenderer`), so there is no production path where a light-then-dark correction is visible. **F-17-12 ✅ VERIFIED-ALREADY-MATCHING** — the `ColorMode` union (`"light" | "dark" | "auto"`, L3771) and the PropertyControl Enum options/optionTitles (`["light","dark","auto"]`, L11164–11168) use identical tokens; no rename needed. **F-17-13 ✅ FIXED** — Framer's BorderRadius control can emit a size string *or* a numeric radius; the `styles.borderRadius` type and all nine consumer prop types (`CalendarCell`, `CalendarGrid`, `TimeSlotList`, `TimeSlotButton`, `StepBody`, `ReviewStepBody`, `FieldRenderer` + engine interface) are widened `string | number` — every use is CSS-property assignment so both forms were already valid at runtime | L3901–3907 + the 9 prop sites |.
- **W1-17-F-17-11 (in bundle 10):** Detail section absent from this report (same recovery gap as W1-20-H2 and CG-03 — no Wave-1 detail file in the repo). The finding is unrecoverable from the codebase alone; flagged for source-file lookup before claiming row 10 complete, same as cluster 5 (W1-20-H2).
- **W1-17-F-17-9 / F-17-10 / F-17-12 / F-17-13 (Low × 4):** `prefers-color-scheme` subscription always active; SSR dark-flash risk; `ColorMode` type vs PropertyControl enum naming mismatch; `borderRadius` type mismatch (`string` vs `ControlType.BorderRadius`). — **All resolved — see the F-17-9…13 status row above in Sub-Category 10d** (F-17-9 subscription gated to auto mode; F-17-10 documented acceptable — client-rendered component, T10-M6 lazy init; F-17-12 verified tokens already match; F-17-13 radius types widened `string | number`).
- **W2-36-N1 (NEW Medium):** Dark-mode `errorColor #F87171` and `successColor #16A34A` both fail WCAG AA at 3.03:1 and 3.20:1 when paired with `getReadableTextColor`'s WHITE pick. Wave2-36 ✅ NEW. — **✅ FIXED** (fixed by the WCAG text picker of F-17-1, not by changing colours: `#F87171` → black 7.58:1, `#16A34A` → black 6.35:1; dark-mode defaults unchanged; see W1-17-F-17-1 rows) | L268–281 (picker docs), L5156–5270 (dark theme memo) | | Wave2-36 W2-36-N1

#### Sub-Category 10e: Calendar Widget (Wave 1-08, 09, 27, 28) — 15 issues
- **W1-08-CG-01 / W2-27-F1 (High):** `controlledValue` mismatch causes focus trap and `aria-checked` desync. Wave2-27 ✅ confirmed. — **✅ FIXED** (the `selected` derivation now falls back to `parsedOptions[0].label` for presentation when the controlled value matches no current option, keeping a tab stop + consistent checked state; the parent's stored value is untouched until an explicit pick, so required-field validation is unaffected) | L701–716 (selected derivation) | | Wave2-27 W2-27-F1
- **W1-08-CG-02 / W2-27-F2 (High):** T6-L2 fix has stale-closure bug; `onChange?.()` re-fires with old `internalSelected`. Wave2-27 ✅ confirmed. — **✅ FIXED** (the mount one-shot now fires `getInitialSelection(parsedOptions, defaultValue)` computed synchronously instead of reading `internalSelected`, which the re-seed effect updates via async startTransition; `defaultValue` added to deps so default edits re-fire correctly) | L735–756 | | Wave2-27 W2-27-F2
- **W1-08-CG-04 (Medium):** Duplicate visible label (CC-7 fix regression). — **✅ FIXED** (the CC-7 pass-through of the real field label fixed the harmful radiogroup accessible name, but also materialized the in-component VISIBLE label, duplicating FieldRenderer's `labelEl` above the field; new `showLabel` prop — render site passes `showLabel={false}` — suppresses the duplicate copy while the radiogroup aria-name still resolves through `label`) | L605–611 (prop), L1162–1174 (visible-label gate), L9800 (render site) |
- **W1-08-CG-10 (Medium):** Focus loss when options array shrinks. — **✅ FIXED** (new effect clamps `focusedIndex`/`hoveredIndex` when the options array shrinks past a focused/hovered index — live editing in Framer used to unmount the focused button and drop focus to `<body>`; now focus restores to the last surviving button) | L753–766 (clamp effect) |
- **W1-09-DT-05 + DT-08 / W2-27-F6 (Medium):** No `minDate`/`maxDate` props; `moveFocus` doesn't guard future dates beyond 12-month horizon. — **✅ FIXED (interactive half) / DT-05 deferred** (the `moveFocus` upper-bound guard is now clamped to `maxMonthStart` — arrow keys/PageDown could previously page focus and the visible month past the 12-month booking horizon that the nav buttons already respected; the `minDate`/`maxDate` author-facing props half of DT-05 is a feature add on a config surface, deferred — the fixed clamp bounds the interactive paths that actually reach the API) | L3543–3548 (clamp), L3564 (deps) | | W2-27 W2-27-F6
- **W1-08-CG-06 / CG-07 / CG-08 / CG-09 (Low × 4):** `aria-labelledby` not used; duplicate-label options cause roving-tabindex collisions; empty options array renders bare empty radiogroup; `parseOptionsText` splits on commas, not newlines.
- **W1-09-DT-03 / W2-27-F7 (Low):** `firstDayOfWeek` uses `navigator.language`, not `pageLocale()`.
- **W1-09-DT-10 / W2-27-F8 (Low):** TimeSlotList radiogroup missing Home/End keyboard support.
- **W1-09-DT-11 / DT-15 / DT-16 / DT-17 (Low × 4):** Empty-state strings hardcoded English; no retry affordance; `useCalendarNavigation` doesn't expose `focusedDate`; `useTimeGrid` doesn't handle focus/keyboard nav.
- **W2-27-F11 (NEW Low):** `visibleMonth` sync effect lacks equality guard. — **✅ FIXED** (both months normalized to day 1; identical months are a no-op, so stale parent re-renders can't yank the calendar back after the visitor paged forward; `visibleMonth` added to deps) | L1903–1917 (sync effect) | — | Wave2-27 W2-27-F11

#### Sub-Category 10f: Misc / Cross-Cutting (Wave 2-30, 32, 34, 39) — 6 issues
- **W2-30-F2 (Low):** `externalSignal.addEventListener("abort", ...)` has no explicit `removeEventListener` in `finally`. — **✅ FIXED** (the bridged handler is now a named captured function; registered with `{ once: true }` and removed via `removeEventListener` in the POST's `finally` once the fetch settles, so a long-lived caller signal can't retain a dangling handler on the per-request controller) | L5214–5225 (bridge), L5399–5408 (finally cleanup) |
- **W2-30-F3 / F-12-10 (Refactor):** `focusTimerRef` overwritten without clearing prior timer. — **✅ FIXED** (`scheduleFocusTimer` helper; quota-exceeded persistence failures now surface an in-flow notice)
- **W2-30-F4 (Refactor):** `requestAnimationFrame` calls have no `cancelAnimationFrame` cleanup. — **✅ FIXED** (all three outstanding sites now cancel: the CG-10 option-shrink focus restore tracks its frame and cancels in the effect cleanup; the H5 page-month focus restore likewise; `moveFocus` keeps the frame in a ref (`focusRafRef`), cancels a stale frame before issuing the next, and cancels on unmount; the visualViewport scroll nudger already cancelled on reissue+teardown) | L765–770 (CG-10), L2781–2790 (H5), L3576–3584 + L2721–2728 (moveFocus), L6137–6141 (viewport, pre-existing) |
- **W2-32-A1 / A2 (Refactor × 2):** `useCalcomSlots` `typeof window === "undefined"` early-return redundant; `useReducedMotion()` and `useIsStaticRenderer()` not memoized.
- **W2-34 Item 6 / TS-10 (Low):** `FramerFont` interface narrower than Framer's actual runtime shape. — **✅ FIXED / ACCEPTABLE by design** (the interface declares exactly the six keys `fontStack` reads (`fontFamily`/`fontSize`/`fontWeight`/`fontStyle`/`letterSpacing`/`lineHeight`); Framer's runtime font object carries more fields, but nothing reads them, so the narrower type can never mis-read the shape — the comment now says so, and inventing fields would fake precision) | L3474–3484 | | Wave2-34 W2-34-Item6
- **W2-39-M8 (NEW Medium):** Empty option label auto-selects empty value on mount for required choice fields.
- **W2-39-L6 (NEW Low):** Duplicate React `key` when author enters duplicate option labels.
- **W2-39-I3 through I7 (NEW Refactor × 5):** ReDoS amplification via live-validation; whitespace-only labels accepted; PHONE_REGEX digit-only false positives; leading `+` for non-international format; multi-line paste into text input.

---

## RECOMMENDED FIX PHASING

### Phase 1 — Critical fixes (must ship before next release)
1. **F-01-01** (Critical): Move misplaced Framer JSDoc block from L4451–4464 to L5779. Single cut/paste.
2. **W1-04-C1 / D7** (Critical): Rewrite `PHONE_REGEX` to accept placeholder and international formats.
3. **W1-11-A1 / D5** (Critical): Remove inline `outline: "none"` from `inputBaseStyle` L7143.
4. **W1-19-F-01** (Critical): Fix calendar grid overflow on ≤330px viewports.
5. **W1-04-H3 / D8** (High → escalated): `sessionStorage` restore must re-validate prior steps.
6. **W1-06-F-06-1 / W2-25-F4** (High → escalated): POST body missing `end` field — every booking 400-rejects without it.

### Phase 2 — High-severity fixes (ship within 2 sprints)
- Items 7–22 in synthesis (validation cluster, focus-cluster, ChoiceGroup cluster, Cal.com cache key + hardcoded values, theme WCAG cluster, mobile iOS zoom + Edit touch target, GDPR PII, ARIA radiogroup + step transitions).

### Phase 3 — Medium-severity fixes (ship within 1 quarter)
- All remaining Medium findings from Categories 3–10.

### Phase 4 — Low-severity fixes + Refactors (ship as time permits)
- All remaining Low findings; all Refactor findings (code quality, TypeScript strictness, premature-memoization cleanups).

### Phase 5 — Dismiss / close-out
- 9 false positives (FP-1 through FP-9).
- 9 already-fixed items in `component_review.md` — mark as resolved (CC-1, CC-2, CC-3, CC-7 fully; CC-6, T1-H1, T9-M7, T8-H1, T4-L2/T5-C1 partially with documented residuals).

---

## FIX CLUSTERS (15 clusters — see full detail in synthesis file)

| # | Cluster | Findings | Estimated Effort |
|---|---|---|---|
| 1 | Framer Platform Foundations | F-01-01, F-01-05, W1-02-F1, F-01-02 | ~2 hours | ✅ DONE — F-01-01 ✅ (pre-existing), F-01-02 ✅, F-01-05 ✅ (bundle 16), **W1-02-F1 ✅ (fetchTimeoutMs PropertyControl verified in code)**; **W1-02-F3 ✅ (timezones Array control) added to this cluster** |
| 2 | Cal.com Error-Message Surfaces | W1-02-F4 through F8, W1-06-F-06-10 | ~4 hours |
| 3 | CC-5 Focus-Visible Restoration | W1-11-A1, W1-11-A5/A6/A7/A8, W2-29-N1, W1-10-A1 | ~3 hours |
| 4 | PageUp/PageDown + H5 Fix Resurrection | W1-11-A2, W2-27-F11 | ~2 hours |
| 5 | Phone/Email Regex + ReDoS Hardening | W1-04-C1, W1-04-H2, W1-04-L3, W1-20-H2, W1-20-M6 | ~4 hours |
| 6 | sessionStorage Restore + Validation + Privacy | W1-04-H3, W1-12-F-12-2, F-12-1/3/4/5/6, W2-31-A-31-2/3 | ~6 hours |
| 7 | Cal.com POST Body + Idempotency + Retry | W1-06-F-06-1, W1-06-F-06-4, W2-25-F6/F11/F12 | ~3 hours | ✅ DONE |
| 8 | `validationCopy` + `handleContinue` Deps Cleanup | W1-04-H1, W1-04-M4, W2-33-A4 | ~1 hour | ✅ DONE |
| 9 | Inline Object/Function Memoization | W1-14-F3/F4/F7, W1-08-CG-03, W1-16-P-02 | ~4 hours | ✅ DONE |
| 10 | Theme/Color WCAG Compliance | W1-17-F-17-1/2/3, W2-36-N1, W1-17-F-17-11, F-17-4/5/6/7/8 | ~8 hours |
| 11 | Mobile Responsive Touch Targets + Overflow | W1-19-F-01/02/03, F-04 through F-12 | ~6 hours | ✅ DONE |
| 12 | Motion + Reduced-Motion Compliance | W1-18-F1/F2/F3, W2-37-A1/A2/A3 | ~3 hours | ✅ DONE |
| 13 | ARIA Live Regions + Step Announcements | W1-10-A2, W1-10-A9, W2-28-F10, W1-10-A10, W1-10-A6 | ~3 hours | ✅ DONE |
| 14 | Hardcoded Copy Polish | W1-02-F9 through F-23, W1-02-F24 | ~6 hours | ✅ DONE |
| 15 | TypeScript Strictness | W1-15-TS-01 through TS-11, W2-34 Item 6 | ~4 hours | ✅ DONE |
| 16 | Render-Scope Wiring (regression cluster from the `useBookingEngineState` extraction) | B16-R1..R6 | ~2 hours | ✅ DONE |

---

### Bundle 16 sub-findings (fix cluster 16) — render-scope wiring

Diagnostic sweep (VS Code native-preview TS) surfaced a regression cluster: the `useBookingEngineState` extraction left several locals referenced by the main render without ever being returned, one constant was lost, and two children referenced parent-scope names bare. All were **runtime `ReferenceError`s** (the file only ever "transpiled" — nothing typechecked it):

- **B16-R1 (Critical, runtime):** `stepAnnouncement` — the W1-10-A2 combined sr-only live region rendered an undefined variable (screen-reader announcements dead since the extraction). — **✅ FIXED** (added to the state hook's returned object + destructure; region kept as `<output aria-live="polite">`, biome-clean while preserving implicit `role=status`).
- **B16-R2 (Critical, runtime):** `regexPreviewVerdicts` (W1-20-M6 canvas regex preview) = undefined in render. — **✅ FIXED** (returned + destructured).
- **B16-R3 (Critical, runtime):** `themeVerdicts` (F-17-5/6 canvas theme-contrast banner) = undefined in render. — **✅ FIXED** (returned + destructured).
- **B16-R4 (Critical, runtime):** `ariaLabels` used bare inside `StepBody` (8 sites) — the component never received it via props. **Every form/datetime step render crashed.** — **✅ FIXED** (typed as `typeof DEFAULT_ARIA_LABELS`, added to `StepBodyProps`, destructured, passed at the call site; single computed source stays in `BookingEngine`).
- **B16-R5 (Critical, runtime):** `ChoiceGroupInline` used `choiceGroupAriaLabel` (4 sites) without having it in `ChoiceGroupInlineProps` — choice fields crashed. — **✅ FIXED** (prop added + destructured + threaded from `FieldRenderer`'s existing `ariaLabels.choiceGroup`).
- **B16-R6 (Critical, runtime):** `WCAG_TEXT_PICK_THRESHOLD` referenced in `getReadableTextColor` (ran on every themed text render) but never defined — **F-17-1's tie threshold (0.1791) was lost during its own fix.** — **✅ FIXED** (`const WCAG_TEXT_PICK_THRESHOLD = 0.1791` restored beside the documented derivation).
- **B16-R7 (minor):** rawSlots union narrowing — member access on the `unknown[]` union arm (TS-2339 ×7). — **✅ FIXED** (one narrowed typed view: `json as { data?: unknown; slots?: unknown }` after the object check; every branch narrows before use).
- **B16-R8 (minor):** restored-block typing — `parsed.currentIndex` (TS-2339 ×4), `new Date(slot.date)` on `unknown` (TS-2769), `validateStep(restoredValues)` (TS-2345). — **✅ FIXED** (`currentIndex?: unknown` added to the parse cast; `instanceof Date` narrowing; one `as BookingValues` at the validation call; merge-cast stays at the single `setValues` boundary).
- **B16-R9 (lint):** `forEach` callback returning a value (biome `useIterableCallbackReturn`). — **✅ FIXED** (block body).
- **B16-R10 (env, unfixed by design):** `Cannot find module 'framer'/'framer-motion'` — this repo ships without `node_modules`/tsconfig by design (Framer provides types at build); the two module-resolution errors are environmental, not code. No ambient `declare module` added because a hand-written stub would drift from Framer's real API surface (same rationale as TS-10/W2-34-Item-6).

Also in this sweep: **F-01-02 ✅ FIXED** and **F-01-05 ✅ FIXED** (bundle 16 — see detail sections, Sub-Category 1a).

---

## FALSE POSITIVES DISMISSED (9 findings)

| # | Finding | Reason for Dismissal |
|---|---|---|
| FP-1 | Wave1-22 FP-22-01 (Continue double-click skipping step) | React 18 batches the two `setCurrentIndex` calls; the second is a no-op (POST path is safe via `submittingRef`). Analytics duplication aspect is real (see D11). |
| FP-2 | Wave1-22 FP-22-05 (TS-02 `await res.json()`) | Reclassified as Refactor (TypeScript strictness, no runtime impact). |
| FP-3 | Wave1-22 FP-22-10 (theoretically-problematic-but-practically-harmless) | All moved to Refactor bucket (premature-optimization concerns). |
| FP-4 | Wave1-09 DT-12 (CC-1 stale-slot) | Wave1-09 + Wave2-27-F5 confirmed already-fixed. Moved to Already-Fixed Items. |
| FP-5 | Wave1-09 DT-13 (Time-grid labels timezone-correct) | Not a finding — confirmed safe. |
| FP-6 | Wave1-09 DT-14 (Loading state PASS) | Not a finding — confirmed safe. |
| FP-7 | Wave1-08 CG-11 (Roving tabIndex correct in normal case) | Not a finding — confirmed safe. |
| FP-8 | Wave1-08 CG-12/13/14/15 (Arrow keys wrap, Home/End, Click, Controlled↔Uncontrolled) | Not findings — all confirmed safe. |
| FP-9 | Wave1-13 F1/F2 (informational only) | Not findings — informational notes. |

---

## ALREADY-FIXED ITEMS (9 — close out in `component_review.md`)

| Original Issue | Fixed In | Verified By |
|---|---|---|
| **CC-1** Stale-Slot Bug | `handleDateSelect` calls `setSelectedTime(null)` inside same `startTransition` as `setSelectedDate(date)` | Wave1-09 DT-12 ✅ + Wave2-27-F5 ✅ |
| **CC-2** Demo-Grid Fallback | Demo grid now canvas-only via transitive guard | Wave1-13 §2.8 ✅ + Wave2-32 ✅ |
| **CC-3** Silent Fake-Success | Hide-demo-when-unconfigured gates published site | Wave1-13 §2.2 ✅ |
| **CC-6** Focus Management (partial) | `stepTitleRef` effect at L5175–5183 moves focus | Wave1-11 ✅ (residual: handleRetry — W1-11-A4) |
| **CC-7** ChoiceGroupInline Accessible Name | `label={field.label}` passed in at L7308 | Wave1-20 ✅ |
| **T1-H1** Roving Tabindex Breaks | `selectedOrFirstDateKey` (L2560–2572) | Wave1-11 ✅ |
| **T9-M7** RenderTarget Computed on Every Render | Memoized via `React.useMemo` at L5611–5614 | Wave1-01 ✅ |
| **T8-H1** useIsStaticRenderer (partial) | Added to `AnimatedStepContent` at L4481 | Wave1-01 ✅ (residual: 2 other motion paths — F-01-05) |
| **T4-L2 / T5-C1** CSS Class Mismatch (className half) | `.be-input-${reactInstanceId}` → `.be-input` fixed at L6389–6399 | Wave1-11 ✅ (residual: inline `outline: "none"` half — W1-11-A1 Critical) |

---

## KEY WAVE 2 CONTRIBUTIONS BEYOND WAVE 1

| Sub-Agent | New Contributions |
|---|---|
| **W2-25** (Cal.com deep dive) | 7 NEW findings — `Retry-After` not read on 429, malformed JSON leaks raw error text, no `navigator.onLine` check, no Cancel button during in-flight submission, etc. |
| **W2-29** (focus verification) | 2 NEW findings — TimeSlotList focus ring invisible on selected slot; `focusTimerRef` cleanup gated on `persistState`. |
| **W2-31** (privacy/GDPR) | Reframed W1-12-F-12-2 from Medium to **High** (compliance issue, not UX). |
| **W2-36** (theme) | 1 NEW finding — dark-mode `errorColor` `#F87171` and `successColor` `#16A34A` fail WCAG AA. |
| **W2-37** (motion) | 3 NEW findings — author-customized `stepTransition` bypasses `prefersReducedMotion`; textarea auto-resize per-keystroke reflow; no `@media (prefers-reduced-motion: reduce)` rule. |
| **W2-39** (form fields) | 9 NEW findings — duplicate React `key` on duplicate option labels; empty option label auto-selects empty value on mount; ReDoS amplification via live-validation; PHONE_REGEX accepts digit-only "extension" noise; etc. |

---

## METHODOLOGY NOTES & LIMITATIONS

1. **Wave 2-21 produced findings** but its scope (source-truth spot-check of 65 line references) is documented as a coverage-gap note. The 60 confirmed-accurate / 6 discrepancy / 0 hallucinated verdict is preserved in the synthesis.
2. **Wave 2-22 outlier.** Wave2-22 was a "skeptic / false-positive catalog" meta-audit that flagged 10 false positives. 7 of those were directly contradicted by dedicated verifiers with empirical evidence (Node timing tests, source re-traces). The dedicated verifiers' verdicts win; only 3 of Wave 2-22's dismissals stand.
3. **Severity calibration applied uniformly.** All findings re-mapped to canonical Critical/High/Medium/Low/Refactor rubric.
4. **No new source-code reads beyond verification.** This synthesis relies on Wave 1 findings + Wave 2 verifications + targeted source reads.
5. **Line numbers refer to the current source** `/home/z/my-project/upload/BookingEngine.tsx` (8 866 lines). If the source is refactored before fixes are applied, line numbers will shift but finding identifiers (e.g., F-01-01, W1-04-C1) remain stable.
6. **Full per-finding evidence, code snippets, and remediation code** live in:
   - `/home/z/my-project/wave1_findings/subagent_01.md` through `subagent_20.md` (10 390 lines total)
   - `/home/z/my-project/wave2_findings/subagent_21.md` through `subagent_40.md` (9 660 lines total)
   - `/home/z/my-project/worklog.md` (1 137 lines of multi-agent worklog)

---

*End of Executive Audit Summary. The 6 Critical findings above represent the must-fix-before-next-release set; Phases 2–5 outline the remaining 172 confirmed issues in priority order.*

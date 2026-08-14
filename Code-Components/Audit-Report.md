# EXECUTIVE AUDIT SUMMARY: BookingEngine.tsx

**Audit Date:** 2026-08-15
**Target:** `/home/z/my-project/upload/BookingEngine.tsx` (8 866 lines, TypeScript / React / Framer Code Component)
**Methodology:** Two-Wave Sequential Multi-Agent Architecture (40 sub-agents total)
**Audit Lead:** Super Z (Principal React/TypeScript Architect, Framer Design System Master, WCAG Specialist)

---

## Execution Audit Overview

- **Wave 1 Sub-Agents (Investigation):** 20 / 20 Executed Simultaneously in ONE parallel batch (Completed)
- **Wave 2 Sub-Agents (Review & Verification):** 20 / 20 Executed Simultaneously in ONE parallel batch after Wave 1 completed (Completed — Sub-Agent 21 produced findings file but is documented as a coverage-gap note in synthesis)
- **Total Raw Findings Identified (Wave 1):** 249 (including INFO / Confirmed-Safe notes; ~190 are actionable)
- **Final Confirmed Issues (post-dedup, post-verification, post-conflict-resolution):** 178
  - Critical: 6
  - High: 38
  - Medium: 64
  - Low: 55
  - Refactor: 15
- **Confirmed Critical/High Severity:** 44 (6 Critical + 38 High)
- **False Positives Dismissed in Wave 2:** 9
- **Wave 1 Findings Confirmed Already-Fixed:** 9 (CC-1, CC-2, CC-3, CC-7, partial CC-6, T1-H1, T9-M7, partial T8-H1, className-half of T4-L2/T5-C1)
- **Wave 1 Severities Adjusted by Wave 2:** 13 (e.g., DT-07 Med→High, F-12-2 Med→High GDPR reframe, TS-02 Med→Refactor)
- **Cross-Wave-1 Duplicate Clusters Merged:** 17
- **Wave 2 NEW Findings Surfaced During Verification:** 30

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

## METHODOLOGY NOTE — STRICT SEQUENTIAL WAVE COMPLIANCE

Per the user's strict execution directive (RULE A: Strict Sequential Wave Dependency, RULE B: Intra-Wave Parallel Sub-Agent Launch, RULE C: Distinct Wave Scopes):

- **Wave 1** (Sub-Agents 01–20) was launched in **one** parallel execution batch and ran to 100% completion before any Wave 2 sub-agent was initialized.
- **Wave 2** (Sub-Agents 21–40) was launched in **one** parallel execution batch only after Wave 1 finished.
- The two waves **never ran concurrently**. Each sub-agent received the full file inventory (BookingEngine.tsx, component_review.md, framer-code-component.md, SKILL.md, worklog.md) and produced its findings file at `/home/z/my-project/wave{1,2}_findings/subagent_XX.md`.
- All sub-agents appended work-log entries to the shared `/home/z/my-project/worklog.md` (final length: 1 137 lines).

---

## TOP 6 CRITICAL FINDINGS (Must-Fix-Before-Next-Release)

| # | Finding ID | Short Description | Location | Wave 1 Discovery | Wave 2 Verification |
|---|---|---|---|---|---|
| 1 | **F-01-01** | Framer layout annotations (`@framerSupportedLayoutWidth any-prefer-fixed`, `@framerSupportedLayoutHeight auto`, `@framerIntrinsicWidth 850`, `@framerIntrinsicHeight 600`, `@framerDisableUnlink`) placed above the **non-exported** `AnimatedStepContent` helper instead of the **default-exported** `BookingEngine` function — all 5 annotations are dead code. | L4451–4464 (current, wrong) → should sit immediately above L5780 | Wave1-01 F-01-01 | Wave2-32 ✅ CONFIRMED CRITICAL |
| 2 | **W1-04-C1 / D7** | `PHONE_REGEX` rejects its own UI placeholder `+1 (555) 555-5555` AND `+44 20 7946 0958` AND 6+ other valid international formats. Empirically verified via Node test: 8 of 13 valid formats rejected. | L3174 | Wave1-04 W1-04-C1 | Wave2-24 ✅ confirmed (Node test); Wave2-39 H8 ✅ amplified |
| 3 | **W1-11-A1 / D5** | CC-5 only half-fixed. The CSS rule `.be-input:focus-visible` was repaired, but the inline `outline: "none"` in `inputBaseStyle` overrides it by CSS specificity (inline `1,0,0,0` > class+pseudo-class `0,2,0`). **Keyboard focus ring STILL invisible on every form input.** WCAG 2.4.7 violation. | L7143 (inline override); L6396–6399 (the repaired-but-defeated CSS rule) | Wave1-11 W1-11-A1 | Wave2-28 F7 ✅ CONFIRMED CRITICAL; Wave2-29 ✅ CONFIRMED |
| 4 | **W1-19-F-01** | Calendar grid uses `grid-template-columns: repeat(7, minmax(44px, 1fr))` AND root container has `overflow: hidden`. On ≤330px viewports (iPhone SE 320, Galaxy Fold cover 280), the Saturday column is clipped by overflow with no horizontal scroll affordance. | Calendar grid template (search L1939 region); DateAndTimeInline root `overflow: hidden` | Wave1-19 F-01 | Wave2-38 F-01 ✅ CONFIRMED CRITICAL |
| 5 | **W1-04-H3 / D8** | `sessionStorage` restore advances `currentIndex` to its prior value **without re-validating** prior steps. A visitor who advanced to step 5 with an invalid step 2 can refresh the page and land on step 5, bypassing validation. Data-integrity risk. | L4885–4891 (restore effect) | Wave1-04 W1-04-H3 | Wave2-24 ✅ CONFIRMED HIGH; escalated to Phase-1 fix |
| 6 | **W1-06-F-06-1 / W2-25-F4** | POST body to Cal.com `/bookings` is missing the required `end` field. The `slot.end` value is already in scope (`BookingPayload.end` field at L1365, captured at L3820, consumed by `buildIcsDataUri` L4330 and `buildCalendarDeepLink` L4433) but never threaded into `submitCalcomBooking`'s POST body. Cal.com v2 will 400-reject **every booking attempt**. | `submitCalcomBooking` POST body construction (~L4006–4029) | Wave1-06 F-06-1 | Wave2-25 F4 ✅ CONFIRMED — "single most impactful defect in the entire Wave 2 audit" |

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

#### Issue F-01-02: `useCalcomSlots` Fetch Guard Incomplete
- **Severity:** Medium
- **Location:** L3693 (`if (RenderTarget.current() === RenderTarget.canvas) return;` inside `useCalcomSlots`)
- **Wave 1 Discovery:** Sub-Agent 01 found the guard only blocks the canvas target. On `export` and `thumbnail` targets (used by Framer for static export and page thumbnails), the Cal.com fetch — including the `Authorization: Bearer ${apiKey}` header — still fires, leaking the API key in static-export bundles.
- **Wave 2 Verification:** Wave2-32 ✅ confirmed — should use `useIsStaticRenderer()` (which returns true for canvas + export + thumbnail).
- **Root Cause Analysis:** `RenderTarget.canvas` is a single-target check; `useIsStaticRenderer()` is the broader guard.
- **Impact:** API key may leak into Framer static-export bundles (cached HTML/JS served to visitors).
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

#### Issue W1-02-F2 / D13: `DEFAULT_DARK_THEME` Hardcoded + Missing Fields
- **Severity:** High
- **Location:** L3202–3216 (`DEFAULT_DARK_THEME` constant)
- **Wave 1 Discovery:** Sub-Agent 02 found 8 dark-mode colors are hardcoded with no parallel `darkStyles` PropertyControls group. Sub-Agent 17 separately found `DEFAULT_DARK_THEME` declares `accentColor`/`errorColor`/`successColor`/`borderRadius` are dead fields (the dark-mode override memo at L4639–4667 never reads them).
- **Wave 2 Verification:** Wave2-23 ✅ confirmed MUST-FIX; Wave2-36 ✅ confirmed F-17-8 MED.
- **Impact:** Authors cannot override dark-mode colors independently from light-mode.
- **Recommended Remediation:** Restructure `styles` into `styles.light` + `styles.dark` Object controls, OR add parallel `darkAccentColor`/`darkErrorColor`/`darkSuccessColor`/`darkBorderRadius` controls.

#### Issue W1-02-F3: `COMMON_TIMEZONES` Not Editable
- **Severity:** High
- **Location:** L3217–3248 (`COMMON_TIMEZONES` 16-entry array — Wave 1 said 17, actual is 16)
- **Wave 1 Discovery:** Sub-Agent 02 found the timezone dropdown list is a fixed module-level array. Authors cannot add custom timezones (e.g., a clinic that only serves one city doesn't need 16 worldwide timezones).
- **Wave 2 Verification:** Wave2-23 ✅ confirmed MUST-FIX.
- **Impact:** Inflexible timezone picker; UX clutter for localized deployments.
- **Recommended Remediation:** Add `timezones: ControlType.Array` (element control: `{ label: ControlType.String, value: ControlType.String }`) with `COMMON_TIMEZONES` as the default.

#### Issue W1-02-F4–F8: 5 Hardcoded Error-Message Surfaces
- **Severity:** High (5 findings)
- **Location:** `mapCalcomError` (L4101) — 5 substring→message rules; `useCalcomSlots` catch ladder (5 status-specific messages); `submitCalcomBooking` (5 status-specific error strings + HTTP-status fallback); `handleSubmitBooking` (4 `setSubmitError` strings); `StepBody.hideDemoWhenUnconfigured` (2-line "Booking is currently unavailable / Please call us…" notice)
- **Wave 1 Discovery:** Sub-Agent 02 cataloged all 5 surfaces; each is hardcoded with no Copy PropertyControl.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed all 5 MUST-FIX.
- **Impact:** Authors cannot customize error copy; brand voice inconsistent; localization impossible.
- **Recommended Remediation:** Introduce 4 new Object controls (`calcomErrorCopy`, `slotsErrorCopy`, `submitErrorCopy`, `submitGuardrailCopy`) totaling ~20 keys; thread through all 5 surfaces. (See Fix Cluster 2.)

#### Issue W1-02-F9–F16: 8 Medium-Priority Hardcoded Strings
- **Severity:** Medium (8 findings)
- **Location:** SuccessScreen "Confirmation #"+ "Reschedule or cancel" (L7433–7871 region); ReviewStepBody "Edit" (L6891+); TimeSlotList "Pick a date to see times" + "No available times" (L1423+); Select fallback "Select an option…" (FieldRenderer); canvas-only guardrails (5 strings); "% complete" suffix; 8 aria-labels ("Choice group"/"Time slots"/"Available times"/"Date picker"/"Booking progress"×2/"Booking form" + Previous/Next month/Today suffixes)
- **Wave 1 Discovery:** Sub-Agent 02 cataloged each.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed all 8.
- **Impact:** Brand voice inconsistency; localization blockers.
- **Recommended Remediation:** Add corresponding keys to the existing `copy` Object control group.

#### Issue W1-02-F17–F23: 7 Low-Priority Hardcoded Strings
- **Severity:** Low (7 findings)
- **Location:** `.ics` PRODID + SUMMARY fallback + notes section headers (L4311–4390); AM/PM + 12h/24h toggle text (L126); 10 layout constants (TOUCH_TARGET_MIN, COMPACT_BREAKPOINT, CALENDAR_WEEKS_TO_RENDER, PROGRESS_BAR_HEIGHT, CHECKMARK_ICON_SIZE, ERROR_ICON_SIZE, 3 column breakpoints, DEFAULT_MEETING_DURATION_MS); `MAX_MONTHS_AHEAD=12` + retry backoff (1000ms / 3000ms); demo grid `startTime="09:00"`/`endTime="17:00"`/`interval=30`; "Unknown error" fallback; ErrorScreen fallback "Something went wrong while submitting your booking."
- **Wave 1 Discovery:** Sub-Agent 02 cataloged each.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed — classified as SHOULD-FIX (author-experience) for most; ACCEPTABLE for layout constants.
- **Impact:** Minor author-experience friction; demo-grid times misleading on canvas.
- **Recommended Remediation:** Expose editable controls for `.ics` PRODID, retry backoff, demo-grid times. Leave WCAG-mandated constants (`TOUCH_TARGET_MIN`) as-is.

#### Issue W1-02-F24: 11 In-Component `||` Fallbacks Duplicate PropertyControl Defaults
- **Severity:** Refactor
- **Location:** 11 sites where `props.copy.foo || "Default string"` patterns exist
- **Wave 1 Discovery:** Sub-Agent 02 found these `||` fallbacks duplicate the PropertyControl's own `defaultValue`, creating drift risk if either side changes.
- **Wave 2 Verification:** Wave2-23 ✅ confirmed INFORMATIONAL.
- **Impact:** Drift risk between code and PropertyControl defaults.
- **Recommended Remediation:** Trust PropertyControl defaults; remove in-component `||` fallbacks.

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

#### Issue F-03-2 / D10: Review Step Re-Validate Guarantee Lost When Not at End
- **Severity:** Medium
- **Location:** L5404 (gate: `isLast && currentStep.stepType === "review"`)
- **Wave 1 Discovery:** Sub-Agent 03 found the re-validate-all-prior-steps guarantee only fires when the review step is terminal. If the author places a review step anywhere else, prior steps aren't re-validated.
- **Wave 2 Verification:** Wave2-24 marked out-of-scope (no contradicting verdict).
- **Impact:** Stale data may slip through if author reorders steps.
- **Recommended Remediation:** Re-validate prior steps on any review step entry, not just terminal.

#### Issue F-03-3: `useStateGuarded` Doesn't Retroactively Clamp
- **Severity:** Medium
- **Location:** L6415 (`useStateGuarded` hook)
- **Wave 1 Discovery:** Sub-Agent 03 found the hook doesn't clamp when `max` shrinks. Currently relies on consumer's `useLayoutEffect` + `safeCurrentIndex` clamp (defense-in-depth works, but the hook name is misleading).
- **Wave 2 Verification:** Wave2-24 ✅ confirmed; Wave2-33 A3 verified the setter identity churns when `max` changes.
- **Impact:** Misleading API; defense-in-depth may regress.
- **Recommended Remediation:** Make `useStateGuarded` clamp on `max` change.

#### Issue F-03-4 / D11 / D17: `handleContinue` In-Flight Double-Click Guard Missing
- **Severity:** Medium (scope-narrowed by Wave 2)
- **Location:** `handleContinue` step-to-step advance (non-POST path)
- **Wave 1 Discovery:** Sub-Agent 03 found rapid Continue→Continue can compose `setCurrentIndex(i => i+1)` updaters to skip a step. Sub-Agent 04 separately found non-POST analytics duplication.
- **Wave 2 Verification:** Wave2-22 FP-22-01 initially dismissed as false positive (React 18 batching). Wave2-24 empirically confirmed: React 18 batching does NOT prevent functional-updater composition across separate event handlers. **POST path is safe via `submittingRef`**; only non-POST analytics duplicated. Wave2-24 recommended `useEffect([safeCurrentIndex])` release instead of `setTimeout(0)`.
- **Impact:** Duplicate `booking_success` / `booking_error` analytics events on rapid Continue clicks.
- **Recommended Remediation:** Add `navigatingRef` (mirroring `submittingRef`); release via `useEffect([safeCurrentIndex])`, not `setTimeout(0)`.

#### Issue F-03-5 / D9: `handleJumpToStep` Bypasses `transitionFlowStatus` State Machine
- **Severity:** Medium
- **Location:** `handleJumpToStep` function
- **Wave 1 Discovery:** Sub-Agent 03 found raw `setFlowStatus("in-progress")` bypasses the state-machine guard.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed.
- **Impact:** State-machine integrity risk.
- **Recommended Remediation:** Route through `transitionFlowStatus`.

#### Issue F-03-6: Raw `currentIndex` Used in `handleContinue` Review Branch
- **Severity:** Low
- **Location:** L5408
- **Wave 1 Discovery:** Sub-Agent 03 found `handleContinue`'s review-step branch reads raw `currentIndex` instead of `safeCurrentIndex`.
- **Wave 2 Verification:** Wave2-33 A4 ✅ confirmed.
- **Impact:** Edge-case crash if `currentIndex` is out of bounds.
- **Recommended Remediation:** Use `safeCurrentIndex` consistently.

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

#### Issue W1-04-H1 / D3: `validationCopy` Memo Wrong Dep
- **Severity:** High
- **Location:** L4533–4552 (`useMemo` reads `validation` prop but lists `[copy]` in deps)
- **Wave 1 Discovery:** Sub-Agent 04 found the memo body reads `validation` but the dep array is `[copy]`. Latent today (because `validation` is nested under `copy.controls.validation` in property controls), but structurally wrong.
- **Wave 2 Verification:** Wave2-33 ✅ confirmed HIGH; Wave2-35 A-01 ✅ re-discovered independently.
- **Impact:** Stale validation messages in Framer editor when `validation` changes alone.
- **Recommended Remediation:** Change `}, [copy])` to `}, [validation])`.

#### Issue W1-04-H2 / D2: Custom-Regex ReDoS Vulnerability
- **Severity:** High
- **Location:** L3493 (`new RegExp(field.customRegex)`)
- **Wave 1 Discovery:** Sub-Agent 04 found custom regex is recompiled on every `validateField` call (no memoization). Worse, certain patterns cause catastrophic backtracking. Compounded by `handleFieldChange` calling `validateField` on every keystroke.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed via Node timing test: 25-char input against `(a+)+$` hangs 3 278 ms; 30-char input times out the 6-second wrapper. Wave2-39 I3 ✅ amplified — runtime `try/catch` does NOT catch catastrophic backtracking.
- **Impact:** Denial-of-service vector — visitor can freeze the main thread by typing into a field with a pathological custom regex.
- **Recommended Remediation:** Memoize compiled regex per field (WeakMap); add ReDoS-safe pattern check or 100ms timeout; expose `customRegexFlags` PropertyControl.

#### Issue W1-04-H3 / D8: `sessionStorage` Restore Bypasses Validation (Phase-1 fix)
- **Severity:** High (escalated to Phase-1 fix per synthesis)
- **Location:** L4885–4891 (restore effect)
- **Wave 1 Discovery:** Sub-Agent 04 found `setCurrentIndex(parsed.currentIndex)` happens without re-validating prior steps.
- **Wave 2 Verification:** Wave2-24 ✅ confirmed HIGH; Wave2-31 ✅ confirmed + added GDPR angle.
- **Root Cause Analysis:** Restore effect trusts persisted state without re-validation.
- **Impact:** Visitor can refresh the page and land on a later step even if prior steps are invalid.
- **Recommended Remediation:** After restoring `currentIndex`, run `validateStep` on all prior steps; if any fails, clamp `currentIndex` to the first invalid step.

#### Issue W1-04-L3: `EMAIL_REGEX` Accepts Invalid Emails
- **Severity:** Low
- **Location:** L3173
- **Wave 1 Discovery:** Sub-Agent 04 found the regex accepts `user@domain..com` (double dot), `user@.com` (no domain), `user@domain.com.` (trailing dot).
- **Wave 2 Verification:** Wave2-24 ✅ confirmed via Node test; Wave2-39 H7 ✅ amplified.
- **Impact:** Invalid emails may pass validation; downstream Cal.com submission may fail.
- **Recommended Remediation:** Tighten regex: `/^[^\s@]+@([^\s@]+\.)+[^\s@]{2,}$/`.

#### Issue W1-20-H3: Min-Length Validation Fires on Optional Fields
- **Severity:** Medium
- **Location:** `validateField` for `fieldType: "text"` / `"textarea"`
- **Wave 1 Discovery:** Sub-Agent 20 found `MIN_TEXT_LENGTH = 3` validation fires even on optional fields (prior T4-H2 still open).
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Optional text fields block submission when partially filled.
- **Recommended Remediation:** Gate min-length validation on `field.required || str.trim().length > 0`.

#### Issue W1-20-M1: Missing `inputMode` on Phone/Email Inputs
- **Severity:** Medium
- **Location:** `FieldRenderer` text/email/phone inputs
- **Wave 1 Discovery:** Sub-Agent 20 found no `inputMode="tel"` or `inputMode="email"`.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Mobile users see wrong keyboard (no phone keypad for phone field).
- **Recommended Remediation:** Add `inputMode` based on `autocompleteToken` heuristic.

#### Issue W1-20-M2: No `name` Attribute on Inputs
- **Severity:** Medium
- **Location:** All input/textarea/select/checkbox in `FieldRenderer`
- **Wave 1 Discovery:** Sub-Agent 20 found inputs have no `name` attribute.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Breaks password-manager grouping; autofill doesn't work.
- **Recommended Remediation:** Add `name={field.id}` to all inputs.

#### Issue W1-20-M3: Character Counter Only on Textarea
- **Severity:** Medium
- **Location:** `FieldRenderer` textarea vs. text/email/phone
- **Wave 1 Discovery:** Sub-Agent 20 found text/email/phone inputs are silently capped by `effectiveMaxLength` with no visible counter.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Users don't know their input was truncated.
- **Recommended Remediation:** Render character counter for all capped inputs.

#### Issue W1-20-M4: `effectiveMaxLength` Allows RFC 5321 Override
- **Severity:** Medium
- **Location:** L4405
- **Wave 1 Discovery:** Sub-Agent 20 found the cap of 2000 lets authors override email `maxLength` above RFC 5321's 254-char limit.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Authors can configure invalid email `maxLength`.
- **Recommended Remediation:** Clamp email `maxLength` to 254 regardless of author setting.

#### Issue W1-20-M5: Non-Required `<select>` Has No Clear-Selection Affordance
- **Severity:** Medium
- **Location:** `FieldRenderer` select
- **Wave 1 Discovery:** Sub-Agent 20 found once a user selects an option in a non-required select, they cannot clear it.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** UX dead-end for non-required selects.
- **Recommended Remediation:** Add a "Clear" button or "(none)" option for non-required selects.

#### Issue W1-20-M6: No Author-Time Regex Validity Preview
- **Severity:** Medium
- **Location:** PropertyControls for `customRegex`
- **Wave 1 Discovery:** Sub-Agent 20 found authors have no way to test their regex pattern in the Framer editor before publishing.
- **Wave 2 Verification:** Wave2-39 ✅ confirmed.
- **Impact:** Authors discover invalid regex only after publishing.
- **Recommended Remediation:** Add a canvas-only "test input" preview field next to `customRegex`.

---

### Category 5 — Cal.com Integration (Slots + POST + ICS) (28 issues)

#### Issue W1-05-F1 / D14: `monthCacheKey` Omits `apiKey` + `eventTypeId`
- **Severity:** High
- **Location:** L3631 (`monthCacheKey` function) + L3640 (`useCalcomSlots`)
- **Wave 1 Discovery:** Sub-Agent 05 found the cache key includes month + timezone but NOT `apiKey` or `eventTypeId`.
- **Wave 2 Verification:** Wave2-25 F1 ✅ confirmed HIGH; Wave2-33 A1 ✅ re-discovered independently.
- **Impact:** When an author swaps Cal.com credentials or eventTypeId in Framer, the cache serves stale slots from the previous configuration.
- **Recommended Remediation:** Extend `monthCacheKey` to include `apiKey` + `eventTypeId`; add bulk cache invalidation effect on credential change.

#### Issue W1-05-F2 / D4: Cal.com API Key Shipped to Browser
- **Severity:** High
- **Location:** L3996 (slots GET `Authorization: Bearer ${apiKey}`); ~L4006 (POST same)
- **Wave 1 Discovery:** Sub-Agent 05 found the API key is bundled into client-side JS and sent in plaintext Bearer header.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed (architectural; cross-ref CC-4, T2-C4, T3-I5).
- **Impact:** Any visitor with DevTools can read the key and replay it to read/modify/cancel all bookings.
- **Recommended Remediation:** Architectural — proxy through a Framer backend function or serverless endpoint that injects the key server-side. Client should POST to `/api/calcom/slots` and `/api/calcom/bookings`. If proxy is out of scope, document as a known security gap and switch to Cal.com's embed-iframe flow.

#### Issue W1-05-F3: `.finally()` Clears Timeout After First Attempt
- **Severity:** Medium
- **Location:** Inside `useCalcomSlots` fetch promise chain
- **Wave 1 Discovery:** Sub-Agent 05 found `.finally()` clears the 18s timeout after the first attempt; 5xx retries lose timeout protection.
- **Wave 2 Verification:** Wave2-25 F2 ✅ confirmed.
- **Impact:** Retry path can hang indefinitely.
- **Recommended Remediation:** Move `clearTimeout(timeoutId)` out of `.finally()` into terminal paths only.

#### Issue W1-05-F4: Date Range in Browser-Local TZ
- **Severity:** Medium
- **Location:** `useCalcomSlots` GET URL construction
- **Wave 1 Discovery:** Sub-Agent 05 found `start` / `end` are computed in browser-local tz, not the visitor-selected `timeZone`.
- **Wave 2 Verification:** Wave2-25 F3 ✅ confirmed.
- **Impact:** Slots near month boundaries may be missed.
- **Recommended Remediation:** Widen date range ±1 day to absorb TZ-boundary drift.

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

#### Issue W1-06-F-06-3: `manageUrl` Hardcoded
- **Severity:** Medium
- **Location:** SuccessScreen `manageUrl = https://cal.com/booking/${uid}`
- **Wave 1 Discovery:** Sub-Agent 06 found Cal.com v2's response includes `rescheduleUrl` and `cancelUrl` which are discarded.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed.
- **Impact:** Breaks for self-hosted Cal.com instances; collapses reschedule/cancel into one generic link.
- **Recommended Remediation:** Use `bookingResult.rescheduleUrl` and `bookingResult.cancelUrl` from the Cal.com response.

#### Issue W1-06-F-06-4 / W2-25-F5: `X-Idempotency-Key` Header Not Officially Supported
- **Severity:** Medium
- **Location:** L4002–4004 (header sent)
- **Wave 1 Discovery:** Sub-Agent 06 found the header is sent but Cal.com v2's `/bookings` endpoint doesn't officially document it.
- **Wave 2 Verification:** Wave2-25 F5 ✅ confirmed.
- **Impact:** If unsupported, retry path provides no protection against duplicate bookings.
- **Recommended Remediation:** Verify with Cal.com staging; if unsupported, document and remove.

#### Issue W1-06-F-06-5: ICS Not RFC 5545-Escaped
- **Severity:** Medium
- **Location:** `buildIcsDataUri` (L4311–4390)
- **Wave 1 Discovery:** Sub-Agent 06 found SUMMARY/DESCRIPTION not TEXT-escaped — commas, semicolons, backslashes not escaped.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed.
- **Impact:** Strict calendar clients (Apple Calendar) may mis-parse.
- **Recommended Remediation:** Add `escapeIcsText` helper (escape `\`, `;`, `,`, newlines).

#### Issue W1-06-F-06-6 through W1-06-F-06-13: 8 Lower-Priority Cal.com POST Issues
- **Severity:** Low (8 findings)
- **Location:** ICS line folding (75 octets), iOS Safari `data:` URI unreliability, ICS DESCRIPTION when no form answers, `handleJumpToStep` AbortController bypass, `mapCalcomError` substring fragility, `language` field 2-char truncation, Outlook URL consumer-only, `bookingResult.uid` undefined despite success.
- **Wave 1 Discovery:** Sub-Agent 06 cataloged each.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed.
- **Recommended Remediation:** See Fix Cluster 7 in synthesis.

#### Issue W1-06-F-06-14, F-06-15: Refactor Items
- **Severity:** Refactor (2 findings)
- **Location:** `handleRetry` doesn't clear `idempotencyKeyRef`; POST `eventTypeId` numeric coercion rejects slug-based IDs.
- **Wave 1 Discovery:** Sub-Agent 06 cataloged each.
- **Wave 2 Verification:** Wave2-25 ✅ confirmed.

#### Issue W2-25-F6: `Retry-After` Header Not Read on 429 (NEW)
- **Severity:** Medium (NEW from Wave 2)
- **Location:** `useCalcomSlots` catch handler
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Visitor sees generic "wait a moment" copy regardless of server hint.
- **Recommended Remediation:** Read `Retry-After` header on 429; surface "Please wait N seconds" copy.

#### Issue W2-25-F7: Malformed JSON Leaks Raw Error Text (NEW)
- **Severity:** Medium (NEW from Wave 2)
- **Location:** `useCalcomSlots` `res.json()` call
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Visitor sees raw `JSON.parse` error text (e.g., "Unexpected token < in JSON at position 0").
- **Recommended Remediation:** Wrap `res.json()` in try/catch; surface friendly error.

#### Issue W2-25-F10: No `navigator.onLine` Check (NEW)
- **Severity:** Medium (NEW from Wave 2)
- **Location:** `useCalcomSlots` and `submitCalcomBooking`
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Offline visitor wastes a request; no proactive advisory.
- **Recommended Remediation:** Check `navigator.onLine` before fetch; surface "You appear to be offline" copy.

#### Issue W2-25-F11: No Cancel Button During In-Flight Submission (NEW)
- **Severity:** Medium (NEW from Wave 2)
- **Location:** Submit button during `flowStatus === "submitting"`
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Visitor stares at spinner for up to 18s with no escape except page navigation.
- **Recommended Remediation:** Add Cancel button that calls `abortControllerRef.current?.abort()`.

#### Issue W2-25-F12: GET/POST Retry Asymmetry (NEW)
- **Severity:** Low (NEW from Wave 2)
- **Wave 1 Discovery:** N/A — discovered by Wave2-25.
- **Wave 2 Verification:** Wave2-25 ✅ NEW.
- **Impact:** Future maintainer could "fix" asymmetry and create duplicate-booking hazard.
- **Recommended Remediation:** Document retry-path asymmetry; add code comment.

---

### Category 6 — Timezone & i18n (9 issues)

#### Issue F-07-1: Invalid `timeZone` Silently Falls Back
- **Severity:** Medium
- **Location:** `sessionStorage` restore at L4870–4875
- **Wave 1 Discovery:** Sub-Agent 07 found invalid `timeZone` strings from `sessionStorage` restore are unvalidated. Helpers fall back silently to browser-local, but Cal.com fetch URL still gets the bad string → 400 error.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed.
- **Impact:** Visitor can't recover from a 400 error caused by stale sessionStorage.
- **Recommended Remediation:** Add `isValidTimeZone()` validator at the restore boundary.

#### Issue F-07-2: `SuccessScreen.toLocaleDateString` Not Try/Catch'd
- **Severity:** Medium
- **Location:** L7519
- **Wave 1 Discovery:** Sub-Agent 07 found this call isn't guarded, unlike upstream tz helpers. Render-crash if invalid tz reaches this code path.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed.
- **Recommended Remediation:** Wrap in try/catch; fall back to UTC.

#### Issue F-07-3: DST Fall-Back Produces Duplicate Labels
- **Severity:** Low
- **Location:** `formatTimeLabel` for DST-observing timezones
- **Wave 1 Discovery:** Sub-Agent 07 found DST fall-back (e.g., 2024-11-03 NY) produces two distinct UTC instants that both format to "01:00 AM" with no tz-abbreviation disambiguation.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed via `Intl.DateTimeFormat` test on 2026-11-01 01:30 NY.
- **Impact:** Production slots list shows duplicate labels.
- **Recommended Remediation:** Append `(${tzName})` suffix on label collision.

#### Issue F-07-4: Calendar Cells Browser-Local Midnights
- **Severity:** Low
- **Location:** L1939–1955 (cell construction); L1028 (cell label via `date.getDate()`)
- **Wave 1 Discovery:** Sub-Agent 07 found calendar cells are constructed as browser-local midnights but labeled via `date.getDate()`, while slot date keys use visitor tz. When visitor's tz differs from browser tz by >12h, cell label disagrees with slots shown.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed — verified with browser Tokyo +9 / visitor LA -8 = 17h delta → cell labeled "Dec 15" shows Dec 14 PST slots.
- **Recommended Remediation:** Construct calendar cells as visitor-tz midnights.

#### Issue F-07-5 through F-07-9: Lower-Priority TZ Issues
- **Severity:** Low / Refactor (5 findings)
- **Location:** `isTimeElapsed` browser-local `isSameDay`; `detectTimezone` called 3 places (DRY violation); demo grid "HH:MM" no DST awareness; `pageLocale()` returns undefined for unknown `<html lang>`; `parseTimeToMinutes`/`minutesTo24h` reciprocity edge cases.
- **Wave 1 Discovery:** Sub-Agent 07 cataloged each.
- **Wave 2 Verification:** Wave2-26 ✅ confirmed.
- **Recommended Remediation:** Consolidate `detectTimezone` calls; add `isValidTimeZone` helper.

---

### Category 7 — Accessibility: ARIA & Screen Readers (16 issues)

#### Issue W1-10-A1 / W2-28-F1: Radiogroup Containers Missing `aria-required`
- **Severity:** High
- **Location:** 4 `ChoiceGroupInline` instances + `TimeSlotList` radiogroup (L724, L746, L795, L823, L1674)
- **Wave 1 Discovery:** Sub-Agent 10 found `role="radiogroup"` containers don't set `aria-required`. Grep returned 0 matches for `aria-required`.
- **Wave 2 Verification:** Wave2-28 F1 ✅ confirmed HIGH.
- **Impact:** Screen readers don't announce required-ness; WCAG 1.3.1 / 3.3.2 violation.
- **Recommended Remediation:** Add `aria-required={field.required}` to each radiogroup container; propagate to each option button.

#### Issue W1-10-A2 / W2-28-F2: No Dedicated `aria-live` for Step Transitions
- **Severity:** High
- **Location:** Progress counter at L6079/L6174 uses `role="status" aria-live="polite"` but does NOT include step title
- **Wave 1 Discovery:** Sub-Agent 10 found step transitions announce "Step 2 of 5, 20% complete" but NOT the step title. Title is announced only via focus-move-to-heading at L5177–5183.
- **Wave 2 Verification:** Wave2-28 F2 ✅ confirmed + refined — two separate announcements, not combined.
- **Impact:** Screen reader users hear fragmented transition info.
- **Recommended Remediation:** Combine step counter + title in one `aria-live="polite"` region.

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

#### Issue W1-10-A9 / W2-28-F5: Month/Year `aria-live` Region First-Render Risk
- **Severity:** Medium
- **Location:** L1287–1302 (`aria-live="polite"` region)
- **Wave 1 Discovery:** Sub-Agent 10 found the region may announce on first render (no mount guard).
- **Wave 2 Verification:** Wave2-28 F5 ✅ confirmed.
- **Impact:** Screen reader users hear "January 2026" on page load.
- **Recommended Remediation:** Add `hasMounted` ref to suppress first-render announcement.

#### Issue W1-10-A10 / W2-28-F6: Continue Button Missing `aria-busy`
- **Severity:** Medium
- **Location:** Continue/Submit button during `flowStatus === "submitting"`
- **Wave 1 Discovery:** Sub-Agent 10 found the button has no `aria-busy` attribute while submitting. Spinner span L6368–6380 is purely visual.
- **Wave 2 Verification:** Wave2-28 F6 ✅ confirmed.
- **Impact:** Screen reader users don't know submission is in progress.
- **Recommended Remediation:** Add `aria-busy={flowStatus === "submitting"}` to the button.

#### Issue W1-10-A11 through W1-10-A16 + W2-28-F10: 7 Lower-Priority ARIA Gaps
- **Severity:** Low (7 findings)
- **Location:** Timezone `<select>` missing `aria-required`; hidden input in radiogroup missing `aria-hidden`; time-slot buttons no timezone in `aria-label`; "Pick a date" hint uses `role="status"` on first render; ChoiceGroup option buttons don't propagate `aria-required`; `data-date-key` exposed to AT; step-progress counter `aria-live` regions no first-render guard.
- **Wave 1 Discovery:** Sub-Agent 10 cataloged each.
- **Wave 2 Verification:** Wave2-28 ✅ confirmed.
- **Recommended Remediation:** See Fix Cluster 13.

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

#### Issue W1-11-A2 / D1: PageUp/PageDown Focus Loss After Month Change
- **Severity:** High (escalated from Medium by Wave2-28)
- **Location:** L888–889 (`CalendarCellProps.onGoToNextMonth: () => void` — drops `focusAfter?` param); L1062–1063 (same for `onGoToPreviousMonth`); L986–991 (PageUp/PageDown keyboard handler can't pass `focusAfter=true`)
- **Wave 1 Discovery:** Sub-Agent 11 found the H5 fix infrastructure (`pendingMonthFocusRef`) exists but is dead code — no caller passes `focusAfter=true`. Grep confirmed 0 matches for `goToNextMonth(true)` / `goToPreviousMonth(true)`.
- **Wave 2 Verification:** Wave2-28 F8 ✅ CONFIRMED HIGH (WCAG 2.4.3 focus-order violation); Wave2-27 F4 ✅ confirmed.
- **Impact:** When user presses PageUp/PageDown to switch months, focus is lost to `document.body`.
- **Recommended Remediation:** Widen prop types to `(focusAfter?: boolean) => void`; have `CalendarCell.onKeyDown` pass `true` for PageUp/PageDown; resurrect the `pendingMonthFocusRef` effect.

#### Issue W1-11-A3 / W2-28-F9: TimeSlotList Unreachable via Tab When No Slot Selected
- **Severity:** High
- **Location:** L1736 (`tabIndex={elapsed ? -1 : selected ? 0 : -1}`)
- **Wave 1 Discovery:** Sub-Agent 11 found the roving-tabindex logic leaves no tabbable slot when none is selected. Compare with `ChoiceGroupInline` L521 which correctly falls back to the first option.
- **Wave 2 Verification:** Wave2-28 F9 ✅ confirmed HIGH (WCAG 2.1.1 violation).
- **Impact:** Keyboard-only users can't reach the time slot list at all until they click a slot with a mouse.
- **Recommended Remediation:** Change L1736 to mirror `ChoiceGroupInline`'s pattern: `tabIndex={selected ? 0 : index === 0 ? 0 : -1}`.

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

---

### Category 9 — Persistence (sessionStorage) & Privacy (12 issues + 2 NEW)

#### Issue F-12-1: Corrupt `sessionStorage` Entry Never Purged
- **Severity:** Low
- **Location:** Restore effect at L4885–4891
- **Wave 1 Discovery:** Sub-Agent 12 found if `JSON.parse` throws, the bad entry stays in storage forever.
- **Wave 2 Verification:** Wave2-31 ✅ confirmed.
- **Recommended Remediation:** Wrap `JSON.parse` in try/catch; on failure, `sessionStorage.removeItem(STORAGE_KEY)`.

#### Issue F-12-2 / W2-31-A-31-1: GDPR/CCPA PII Without Consent (HIGH — escalated from MED)
- **Severity:** High (escalated by Wave2-31 from Medium)
- **Location:** Persist effect at L4915–4928; `persistState` hardcoded `true`
- **Wave 1 Discovery:** Sub-Agent 12 found PII (name, email, phone) persisted without opt-out.
- **Wave 2 Verification:** Wave2-31 A-31-1 ✅ upgraded to HIGH — reframed as GDPR/CCPA compliance issue.
- **Impact:** GDPR/CCPA — visitor inputs (name, email, phone) persisted without notice, consent, or "clear my data" control.
- **Recommended Remediation:** Add `persistState: ControlType.Boolean` (default false); add `privacyNotice: ControlType.String` PropertyControl with disclosure text; add mid-flow "Clear my saved answers" affordance.

#### Issue F-12-3 through F-12-6: 4 Lower-Priority Persistence Issues
- **Severity:** Low (4 findings)
- **Location:** No schema version stamp; persist runs on Framer canvas (no RenderTarget guard); orphaned entries when `useId()` shifts; restore overwrites values without merging.
- **Wave 1 Discovery:** Sub-Agent 12 cataloged each.
- **Wave 2 Verification:** Wave2-31 ✅ confirmed.
- **Recommended Remediation:** See Fix Cluster 6.

#### Issue F-12-7 through F-12-12 + W2-31-A-31-2 / A-31-3: Refactor Items
- **Severity:** Refactor (6 findings + 2 NEW)
- **Location:** `focusTimerRef` cleanup mixed into persist effect (cross-ref F-30-1); reviver over-broad (any `"date"` key coerced); first post-mount persist redundant; `focusTimerRef` overwritten without clearing prior timer; quota-exceeded not surfaced; no pre-write size check; `privacyNotice` defaults to empty; mid-flow "Clear" affordance missing.
- **Wave 1 Discovery:** Sub-Agent 12 cataloged each.
- **Wave 2 Verification:** Wave2-30 ✅ confirmed; Wave2-31 ✅ confirmed.
- **Recommended Remediation:** See Fix Cluster 6.

---

### Category 10 — Code Quality, Performance, TypeScript, Motion, Mobile, Theme (44 issues)

#### Sub-Category 10a: Code Quality / Refactor (Wave 1-14, 15, 16) — 22 issues
- **W1-14-F2 / F-30-1 (Medium):** Persist effect cleanup cross-wires `focusTimerRef`. Wave2-30 ✅ confirmed.
- **W1-14-F3 (Medium):** Inline arrow `onTimeFormatChange` at L6260 breaks `StepBody` memoization. Wave2-33 ✅ confirmed.
- **W1-14-F4 (Medium):** `handleSubmitBooking` and `handleContinue` have `values` in deps. Wave2-33 ✅ confirmed.
- **W1-14-F5 / F6 / F7 (Low × 3):** `goToPreviousMonth`/`goToNextMonth` skip `startTransition`; `useLayoutEffect` for `currentIndex` uses `startTransition` (defeats purpose); `fontStack` not memoized.
- **W1-14-F8 (Refactor):** `React.memo` on all 11 leaf components without custom comparators.
- **W1-16-P-01 / W2-35-M-01 (Refactor — downgraded from Medium):** FieldRenderer rebuilds `opts` array every render. Wave2-35 verdict: SKIP (premature memoization — `FieldRenderer` is already `React.memo`'d with stable prop surface).
- **W1-16-P-02 / W2-35-M-02 (Medium retained):** TimeSlotList renders 17-48 slot buttons inline; no per-slot memoization. Wave2-35 verdict: APPLY (extract `TimeSlotButton` `React.memo`'d child).
- **W1-16-P-03 through P-12 (Low / Refactor × 9):** Various premature-memoization concerns. Wave2-35 verdicts: SKIP for most.
- **W1-15-TS-01 (Medium):** Last `as any` in production: `(Intl as any).Locale(localeTag)` at L1915.
- **W1-15-TS-02 (Refactor — reclassified from Medium):** `await res.json()` returns `Promise<any>`. Wave2-34: TypeScript strictness, no runtime impact.
- **W1-15-TS-03 (Medium):** Six `catch (err)` clauses with implicit `any`. Fix via `useUnknownInCatchVariables: true`.
- **W1-15-TS-04 through TS-11 (Low × 8):** rawSlots typing, restoredValues implicit any, redundant casts, isCalSlot idiom, FramerFont interface, BookingValues intersection.
- **W2-33-A1 (NEW Medium):** `useCalcomSlots` cache key omits `apiKey`/`eventTypeId` (re-discovery of W1-05-F1).
- **W2-33-A2 / A3 / A4 (NEW Low × 3):** `useCalcomSlots` effect captures `fallbackErrorLabel` but omits from deps; `useStateGuarded` setter churns when `max` changes; `handleContinue` reads raw `currentIndex` at L5408.

#### Sub-Category 10b: Motion (Wave 1-18, 37) — 9 issues
- **W1-18-F1 (Medium):** 8 inline-CSS `transition:` properties NOT gated by `prefersReducedMotion`. Wave2-37 ✅ confirmed at L554, L1013, L1554, L1787, L6121, L6334, L6360, L7144.
- **W1-18-F2 (Medium):** `layout` prop on `AnimatedStepContent` (L4487) not reduced-motion-gated; re-measures on every keystroke. Wave2-37 ✅ confirmed.
- **W1-18-F3 (Medium):** No `<MotionConfig reducedMotion="user">` wrapper. Wave2-37 ✅ confirmed — "single highest-impact fix".
- **W1-18-F4 / F5 / F6 (Low / Refactor × 3):** Form container no `overflow`; `PROGRESS_BAR_TRANSITION`/`TIME_TOGGLE_TRANSITION` not exposed via PropertyControls; terminal-state transitions are abrupt swaps.
- **W2-37-A1 (NEW Medium):** Author-customized `stepTransition` bypasses `prefersReducedMotion` (short-circuit at L4594–4598).
- **W2-37-A2 (NEW Low):** Textarea auto-resize `useEffect` causes per-keystroke layout reflow.
- **W2-37-A3 (NEW Refactor):** No `@media (prefers-reduced-motion: reduce)` rule in `<style>` block.

#### Sub-Category 10c: Mobile / Responsive (Wave 1-19, 38) — 17 issues
- **W1-19-F-01 (Critical):** Calendar grid overflows ≤330px viewports. Wave2-38 ✅ confirmed.
- **W1-19-F-02 (High):** Input `fontSize: 14` triggers iOS Safari zoom-on-focus. Wave2-38 ✅ confirmed.
- **W1-19-F-03 (High):** "Edit" link in `ReviewStepBody` below 44×44px touch target. Wave2-38 ✅ confirmed.
- **W1-19-F-04 through F-07 (Medium × 4):** Hidden scrollbars no affordance; choice cards 2-col truncation; `PILLS_SINGLE_COLUMN_BREAKPOINT` misnomer; no virtual-keyboard handling.
- **W1-19-F-08 through F-12 (Low × 5):** `gap: 24` wastes space; no `scroll-margin-top`; `whiteSpace: nowrap` prevents wrapping; `paddingBottom: 84` insufficient on notched iPhones; `measuredWidth` initial guess flash.
- **W1-19-F-13 through F-17 (Refactor × 5):** Informational items (compact-mode, 100dvh, host-page scroll reliance, safe-area-inset positive).

#### Sub-Category 10d: Theme / Colors (Wave 1-17, 36) — 13 issues
- **W1-17-F-17-1 (High):** `getReadableTextColor` uses non-WCAG luminance formula (Rec.601 + 0.6 threshold instead of WCAG 2.1 relative luminance + 4.5:1). Wave2-36 ✅ confirmed — verified `#808080` returns white where WCAG requires black.
- **W1-17-F-17-2 (High):** `parseColorToRgb` does not support 8-char hex, 4-char hex, named colours, or `hsl()/hsla()`. Wave2-36 ✅ confirmed.
- **W1-17-F-17-3 / D6 (High):** `borderRadius` token NOT cascaded to `CalendarCell` (L997) or `TimeSlotList` (L1767). Wave2-36 ✅ confirmed — 7 hardcoded radius literals verified.
- **W1-17-F-17-4 through F-17-7 (Medium × 4):** Dark-mode fallback exact-equality; no contrast validation warning; no `parseColorToRgb` failure warning; `withAlpha` doesn't blend alpha onto background.
- **W1-17-F-17-9 / F-17-10 / F-17-12 / F-17-13 (Low × 4):** `prefers-color-scheme` subscription always active; SSR dark-flash risk; `ColorMode` type vs PropertyControl enum naming mismatch; `borderRadius` type mismatch (`string` vs `ControlType.BorderRadius`).
- **W2-36-N1 (NEW Medium):** Dark-mode `errorColor #F87171` and `successColor #16A34A` both fail WCAG AA at 3.03:1 and 3.20:1 when paired with `getReadableTextColor`'s WHITE pick. Wave2-36 ✅ NEW.

#### Sub-Category 10e: Calendar Widget (Wave 1-08, 09, 27, 28) — 15 issues
- **W1-08-CG-01 / W2-27-F1 (High):** `controlledValue` mismatch causes focus trap and `aria-checked` desync. Wave2-27 ✅ confirmed.
- **W1-08-CG-02 / W2-27-F2 (High):** T6-L2 fix has stale-closure bug; `onChange?.()` re-fires with old `internalSelected`. Wave2-27 ✅ confirmed.
- **W1-08-CG-04 (Medium):** Duplicate visible label (CC-7 fix regression).
- **W1-08-CG-10 (Medium):** Focus loss when options array shrinks.
- **W1-09-DT-05 + DT-08 / W2-27-F6 (Medium):** No `minDate`/`maxDate` props; `moveFocus` doesn't guard future dates beyond 12-month horizon.
- **W1-08-CG-06 / CG-07 / CG-08 / CG-09 (Low × 4):** `aria-labelledby` not used; duplicate-label options cause roving-tabindex collisions; empty options array renders bare empty radiogroup; `parseOptionsText` splits on commas, not newlines.
- **W1-09-DT-03 / W2-27-F7 (Low):** `firstDayOfWeek` uses `navigator.language`, not `pageLocale()`.
- **W1-09-DT-10 / W2-27-F8 (Low):** TimeSlotList radiogroup missing Home/End keyboard support.
- **W1-09-DT-11 / DT-15 / DT-16 / DT-17 (Low × 4):** Empty-state strings hardcoded English; no retry affordance; `useCalendarNavigation` doesn't expose `focusedDate`; `useTimeGrid` doesn't handle focus/keyboard nav.
- **W2-27-F11 (NEW Low):** `visibleMonth` sync effect lacks equality guard.

#### Sub-Category 10f: Misc / Cross-Cutting (Wave 2-30, 32, 34, 39) — 6 issues
- **W2-30-F2 (Low):** `externalSignal.addEventListener("abort", ...)` has no explicit `removeEventListener` in `finally`.
- **W2-30-F3 / F-12-10 (Refactor):** `focusTimerRef` overwritten without clearing prior timer.
- **W2-30-F4 (Refactor):** `requestAnimationFrame` calls have no `cancelAnimationFrame` cleanup.
- **W2-32-A1 / A2 (Refactor × 2):** `useCalcomSlots` `typeof window === "undefined"` early-return redundant; `useReducedMotion()` and `useIsStaticRenderer()` not memoized.
- **W2-34 Item 6 / TS-10 (Low):** `FramerFont` interface narrower than Framer's actual runtime shape.
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
| 1 | Framer Platform Foundations | F-01-01, F-01-05, W1-02-F1, F-01-02 | ~2 hours |
| 2 | Cal.com Error-Message Surfaces | W1-02-F4 through F8, W1-06-F-06-10 | ~4 hours |
| 3 | CC-5 Focus-Visible Restoration | W1-11-A1, W1-11-A5/A6/A7/A8, W2-29-N1, W1-10-A1 | ~3 hours |
| 4 | PageUp/PageDown + H5 Fix Resurrection | W1-11-A2, W2-27-F11 | ~2 hours |
| 5 | Phone/Email Regex + ReDoS Hardening | W1-04-C1, W1-04-H2, W1-04-L3, W1-20-H2, W1-20-M6 | ~4 hours |
| 6 | sessionStorage Restore + Validation + Privacy | W1-04-H3, W1-12-F-12-2, F-12-1/3/4/5/6, W2-31-A-31-2/3 | ~6 hours |
| 7 | Cal.com POST Body + Idempotency + Retry | W1-06-F-06-1, W1-06-F-06-4, W2-25-F6/F11/F12 | ~3 hours |
| 8 | `validationCopy` + `handleContinue` Deps Cleanup | W1-04-H1, W1-04-M4, W2-33-A4 | ~1 hour |
| 9 | Inline Object/Function Memoization | W1-14-F3/F4/F7, W1-08-CG-03, W1-16-P-02 | ~4 hours |
| 10 | Theme/Color WCAG Compliance | W1-17-F-17-1/2/3, W2-36-N1, W1-17-F-17-11, F-17-4/5/6/7/8 | ~8 hours |
| 11 | Mobile Responsive Touch Targets + Overflow | W1-19-F-01/02/03, F-04 through F-12 | ~6 hours |
| 12 | Motion + Reduced-Motion Compliance | W1-18-F1/F2/F3, W2-37-A1/A2/A3 | ~3 hours |
| 13 | ARIA Live Regions + Step Announcements | W1-10-A2, W1-10-A9, W2-28-F10, W1-10-A10, W1-10-A6 | ~3 hours |
| 14 | Hardcoded Copy Polish | W1-02-F9 through F-23, W1-02-F24 | ~6 hours |
| 15 | TypeScript Strictness | W1-15-TS-01 through TS-11, W2-34 Item 6 | ~4 hours |

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

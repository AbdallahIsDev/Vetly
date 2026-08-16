# EXECUTIVE AUDIT SUMMARY: BookingEngine.tsx

**Audit Date:** 2026-08-16
**Target:** `/home/z/my-project/upload/BookingEngine.tsx` (11,884 lines, TypeScript / React / Framer Code Component)
**Audit Methodology:** Two-Wave Multi-Agent Architecture — Wave 1 (Investigation, 20 parallel sub-agents) followed by Wave 2 (Verification & Refinement, 20 parallel sub-agents), strictly sequential.

---

## TO-DO EXECUTION LOG

- [x] **Phase 1: Environment & Architecture Initialization**
  - [x] Verified file: 11,884 lines, 519 KB, single-file Framer code component
  - [x] Read prior audit (`/home/z/my-project/upload/Audit-Report.md`, 963 lines, 120 KB) — 8,866-line baseline
  - [x] Mapped top-level structure: imports (1–90) → color/time utilities (93–560) → `ChoiceGroupInline` (570–1327) → `CalendarCell` (1328–1530) → `CalendarGrid` (1531–1907) → `TimeSlotButton` + `TimeSlotList` (1908–2520) → `useKeyboardModality` + `useCalendarNavigation` (2521–2853) → `useTimeGrid` (2854–3073) → `DateAndTimeInline` (3074–3788) → type system (3789–4060) → main `BookingEngine` body (4060–10800) → `addPropertyControls` schema (10800–11884)
  - [x] Initialized worklog at `/home/z/my-project/worklog.md`
- [x] **Phase 2: Execution of Wave 1 (20 Sub-Agents Launched Simultaneously)**
  - [x] Sub-Agents 01–20 launched in ONE parallel batch — investigation of source code + raw audit findings
  - [x] Collected raw candidate bugs, edge cases, accessibility flaws, hardcoded strings, memory leaks
  - [x] **BARRIER:** Finalized Wave 1 synthesis (20 findings files totaling ~120 KB) before Wave 2
- [x] **Phase 3: Execution of Wave 2 (20 Sub-Agents Launched Simultaneously after Wave 1)**
  - [x] Sub-Agents 21–40 launched in ONE parallel batch — challenge and audit Wave 1 findings
  - [x] Filtered false positives, confirmed severities, verified proposed fixes (19 of 20 returned; W2-33 timed out)
  - [x] Wrote a Node test script (`/home/z/my-project/scripts/test_regex.js`, 103 assertions) empirically verifying regex bugs
- [x] **Phase 4: Final Synthesis & Categorized Report Generation**
  - [x] Compiled verified issues into structured categories with line/section references, root-cause analyses, and exact fix recommendations
  - [x] Merged duplicate findings across sub-agents (7 cross-agent merges)
  - [x] Resolved severity disagreements between Wave 1 and Wave 2 (notably W1-08-F-08-02: HIGH → LOW after W2-22 found the cascade claim was incorrect)
  - [x] Produced recommended fix phasing (5-phase plan) and verified-fixes closeout list

---

## TOP 10 MUST-FIX-BEFORE-NEXT-RELEASE

| # | ID | Short Description | Severity | Location | Wave 2 Verdict |
|---|---|---|---|---|---|
| 1 | **SYN-01** | `validation` PropertyControl block is structurally **nested inside `copy.controls`** (brace-depth verified at L11752, sibling of `errorCopy`/`aria`) but the TypeScript interface declares it as a top-level sibling of `copy` (L4021) and the runtime destructures it from `props.validation` directly (L5963). **All 9 author-configurable validation message controls are silent no-ops** — every edit is discarded; published site always shows `DEFAULT_VALIDATION_COPY.*` fallbacks. TypeScript cannot catch this because the interface is structural. | 🔴 **Critical** | Schema L11752; Interface L4021; Destructure L5963; Memo L5999 | W2-21 ✅ CONFIRMED (brace-depth parse); W2-23 ✅ CONFIRMED (independent parser); W2-34 ✅ CONFIRMED (TS interface × schema cross-check) |
| 2 | **SYN-04** | `stepAnnouncementText = \`${counterText}, ${completePct}% complete — ${currentStep.title}\`` at L7720 throws `TypeError` when `totalActive === 0` because `currentStep = activeSteps[0] = undefined`. The empty-pipeline guard at L8044 is **unreachable** — `useBookingEngineState` (called at L8027) crashes first. Reachable on canvas when author disables all steps. | 🟠 High | L7720, L8044 | ✅ COMPLETED — `currentStep ? … : ""` guard (~L7725); empty-pipeline guard reachable |
| 3 | **SYN-05** | `handleFieldChange` uses `activeSteps.find(step => form\|datetime)?.fields.find(id === fieldId)` (L7115–7118). `Array.find` returns only the **FIRST** matching step. Fields in any later form step (or custom fields on a non-first datetime step) are not found → `setErrors` silently skipped → stale errors persist until next Continue click. Multi-form-step flows hit this; default flow does not. Node-verified. | 🟠 High | L7115–7118 | ✅ COMPLETED — for...of loop over all steps (L7166–7174), early break on match |
| 4 | **SYN-06** | ~~GET uses `start`/`end` instead of documented `startTime`/`endTime`~~ **REFUTED 2026-08-16** — live OpenAPI (cal.com/docs) documents `start`/`end` as the required query params; code matches exactly. No change needed. | 🟠 High | L4906–4910 | ✅ RESOLVED — live-spec verification, no-op |
| 5 | **SYN-07** | `isCalSlot` rejects non-`{start,end}` shapes → silent empty calendar. **Live spec showed the real gap:** engine never sent `format=range`, so the documented default (`time`) format returns bare strings / `{start}`-only objects that `isCalSlot` rejects; live response also nests date keys directly under `data`, not `data.slots`. Fixed: `&format=range`, date-map fallback, tolerant guard. | 🟠 High | L4733–4740 | ✅ COMPLETED 2026-08-16 — live-OpenAPI-driven fix |
| 6 | **SYN-08** | `ChoiceGroupInline`'s `React.memo` (L668) is defeated: call site (L9870–9877) allocates a fresh `opts` array via `.map()` every parent render, and L9931 passes an inline `onChange` arrow. The cascade propagates into the mount-seed effect (L795–808) which pre-populates parent state with the first option → **required choice groups auto-pass validation without user interaction**. One fix (memoize `opts` + `useCallback onChange`) closes W1-08-F-08-02 + W1-08-F-08-05 + W1-16-P-16 + W1-20-F-1 simultaneously. | 🟠 High | L9870–9877, L9931, L795–808 | ✅ COMPLETED — `opts` via `useMemo` (L9730–9738), `handleChoiceChange` via `useCallback` (L9739–9742); memo holds, auto-pass regression closed |
| 7 | **SYN-09** | `getPayload` `useCallback` (L3480) is missing `amLabel`/`pmLabel` deps but its body uses them in `formatTimeLabel(...)` (L3509–3510, L3521–3522). Author AM/PM copy edits in Framer leave stale `BookingPayload.timeLabel` — review/confirmation/ICS labels disagree with the live toggle. Same bug class as W2-33-A2 (already fixed for `fallbackErrorLabel`). | 🟠 High | L3480, dep array L3526 | ✅ COMPLETED — deps now include `amLabel`/`pmLabel` |
| 8 | **SYN-02** | Three visitor-facing persistence-disclosure strings hardcoded as inline JSX literals (not exposed via PropertyControls): `"Answers are saved in this browser."` (L8629), `"Clear my saved answers"` (L8645), `"Progress couldn't be saved to this browser (storage full). Your answers this session are unaffected."` (L8657–8658). GDPR/CCPA disclosures cannot be localized. | 🟠 High | L8629, L8645, L8657 | ✅ COMPLETED — `copy.savedAnswersLabel` / `copy.clearSavedAnswersLabel` / `copy.saveFailedMessage` + schema controls + default constants; JSX now prop-driven |
| 9 | **SYN-03** | The in-flight POST cancel button renders a hardcoded `Cancel` literal (L8734). Every other footer button (Back/Continue/Final/Retry/Restart) is configurable via `buttonLabels.*`; this one is the odd one out. Cannot be localized. | 🟠 High | L8734 | ✅ COMPLETED — `buttonLabels.cancelSubmitLabel` + schema control + `DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL`; footer button now prop-driven |
| 10 | **SYN-10** | Hidden form-state `<input>` at L1156 binds `value={selected}` where `selected` is the W1-08-CG-01 presentation fallback (`parsedOptions[0]?.label` when `controlledValue` matches no option). The form-state dump submits the first option's label while the parent's React state holds a different value. Form submissions and any SSR dump disagree with React state. | 🟠 High | ChoiceGroupInline L723–730 (fallback) + L1156 (hidden input binding) | ✅ COMPLETED — `formValue` split from `selected`; hidden input binds the real controlled value |

---

## DETAILED FINDINGS BY CATEGORY

> Per-finding evidence, code quotes, and remediation snippets live in `/home/z/my-project/wave1/subagent_XX.md` (Wave 1 raw findings) and `/home/z/my-project/wave2/subagent_XX.md` (Wave 2 verification). The catalog below is the canonical, conflict-resolved summary.

### Category 1 — Framer Platform & Controls Isolation (3 issues)

#### Issue SYN-01 — `validation` PropertyControl Schema Mismatch (CRITICAL)
- **Severity:** 🔴 Critical
- **Location:** Schema L11752 (inside `copy.controls`); Interface L4021 (top-level sibling of `copy`); Destructure L5963 (`validation` from `props`); Memo L5999 (`const validationMessages = validation`)
- **Wave 1 Discovery:** Sub-Agent 01 (W1-01-F-01) and Sub-Agent 02 (W1-02-F1) independently identified this via brace-depth parse of `addPropertyControls` and interface cross-reference. The `validation:` block (L11752–11809, 9 controls covering `requiredFieldError`, `invalidEmailError`, `invalidPhoneError`, `minLengthError`, `invalidFormatError`, `unknownError`, `errorFallbackMessage`, `errorSummaryTitle`, `errorRetryLabel`) sits inside `copy.controls` as a sibling of `errorCopy:` and `aria:`. Framer writes the values to `props.copy.validation.*`. But the runtime reads `props.validation` directly (always `undefined` for panel-managed instances) → every `?? DEFAULT_VALIDATION_COPY.X` fallback fires.
- **Wave 2 Verification:** W2-23 wrote an independent Python-style brace-depth tokenizer confirming `validation` is at depth 4 (sibling of `errorCopy` at the same depth) inside `copy.controls`. W2-34 cross-checked the TS interface — `validation` is declared as a top-level prop at L4021, sibling of `copy`. **TS cannot catch this** because the interface is structural, not path-aware. All three Wave 2 verifiers escalated to CRITICAL.
- **Root Cause Analysis:** Likely a copy-paste / refactor accident — the `validation` block was intended as a top-level sibling of `copy` (matching the interface) but was inadvertently nested one level too deep when the `copy` group was introduced to organize copy-related controls. The deeper 16-space visual indent of `validation:` (vs. 12 for `errorCopy:`) hid this from casual reading.
- **Impact:** **Total.** Every author edit to the "Validation Messages" submenu in Framer's property panel is silently discarded. Published site always shows the hardcoded `DEFAULT_VALIDATION_COPY.*` English strings — no localization possible, no brand-voice customization, no error-message tuning. The feature appears to work in the panel (values are saved to the instance) but has zero runtime effect.
- **Recommended Remediation (preferred — preserves already-saved author data):**
```typescript
// STEP 1: Move the `validation` block from inside `copy.controls` to be a sibling
//         of `copy` in BookingEngineCopyProps (L3928+). This aligns the interface
//         with where Framer is already writing the saved values.
//         Wait — REVERSED. Framer writes to props.copy.validation.* (nested).
//         So the FIX is to align the RUNTIME with the SCHEMA (not the other way).

// STEP 1 (actual): In useBookingEngineState (L5963), change:
//   const { ..., validation, ... } = props
// to:
//   const { ..., copy, ... } = props
//   const validation = copy?.validation

// STEP 2: At L5999, change:
//   const validationMessages = validation
// to:
//   const validationMessages = copy?.validation   // (or just use `validation` from step 1)

// STEP 3: Update any deps array that references `validation` to reference `copy?.validation`.

// STEP 4: Update the TypeScript interface BookingEngineCopyProps (L3928+) to declare
//         `validation` as a nested field of `copy` (matching the schema), NOT as a
//         top-level sibling. This keeps TS in sync with the runtime path.
```
- **Alternative Remediation (more invasive — moves the schema):** Move the `validation:` block (L11752–11809) out of `copy.controls` to be a sibling of `copy` in `addPropertyControls`. This breaks already-saved author data (values stored at `props.copy.validation.*` will be orphaned). Not recommended.
- **Status: Completed** — Runtime now reads `copy?.validation ?? props.validation` (destructure site ~L5963, memo deps unchanged since the local `validation` derivation is identity-stable with the old prop read). Interface at L4017–4030 redesigned: `validation?: Partial<ValidationCopy>` declared nested inside `copy` (schema-aligned) plus a legacy optional top-level fallback prop so pre-nesting instances keep working. Schema block (`copy.controls.validation`) untouched — already-saved author data preserved. All 9 validation message controls now round-trip to the published site.

#### Issue W1-01-F-02 — Misplaced `@framerDisableUnlink` comment
- **Severity:** 🟢 Low
- **Location:** L5897 (comment); L7891 (actual annotation)
- **Wave 1 Discovery:** Comment at L5897 says "above" but the `@framerDisableUnlink` annotation is ~2000 lines below, at L7891. The annotation itself is correctly placed immediately above `BookingEngine` (verified by W2-32 — prior critical F-01-01 is resolved).
- **Wave 2 Verification:** W2-32 ✅ confirmed: JSDoc block at L7879–7892 sits immediately above default export `BookingEngine` at L7893. Only the comment at L5897 is dangling.
- **Recommended Fix:** Delete or update the comment at L5897.
- **Status: Completed** — the section-header comment now points at the real annotation location (JSDoc above the default export) without implying adjacency.

#### Issue W1-01-F-05 — Unguarded `document.activeElement`
- **Severity:** 🟢 Low
- **Location:** L6157 (inside a `requestAnimationFrame` callback in a `useEffect`)
- **Wave 1 Discovery:** Accesses `document.activeElement` without the `typeof document === "undefined"` guard used at L7153. The outer effect guards on `typeof window === "undefined"` (L6137) plus `window.visualViewport` existence (L6152), so `document` is implicitly defined whenever the rAF fires. Functionally safe in all Framer render targets; inconsistent with the surrounding defensive pattern.
- **Wave 2 Verification:** W2-32 ✅ confirmed. Recommended fix: add `if (typeof document === "undefined") return` as the first line of the rAF callback for defense-in-depth consistency.
- **Status: Completed** — exactly that guard is now the first line of the rAF callback (matches the L7153 pattern).

---

### Category 2 — Zero-Hardcoding & 100% Customizability (9 issues)

#### Issue SYN-02 — Persistence-Disclosure Strings Hardcoded (HIGH)
- **Severity:** 🟠 High
- **Location:** L8629 (`"Answers are saved in this browser."`), L8645 (`"Clear my saved answers"`), L8657–8658 (`"Progress couldn't be saved to this browser (storage full). Your answers this session are unaffected."`)
- **Wave 1 Discovery:** Sub-Agent 02 found three visitor-facing persistence-disclosure strings hardcoded as inline JSX literals. These render on the **published site** whenever `persistState` is ON. Not exposed via PropertyControls — GDPR/CCPA disclosures cannot be localized.
- **Wave 2 Verification:** W2-23 ✅ confirmed all three lines. No corresponding PropertyControl exists in the `copy` group.
- **Recommended Fix:** Add three new controls under `copy`:
  - `savedAnswersLabel` (string, default `"Answers are saved in this browser."`)
  - `clearSavedAnswersLabel` (string, default `"Clear my saved answers"`)
  - `saveFailedMessage` (string, default `"Progress couldn't be saved to this browser (storage full). Your answers this session are unaffected."`)
- **Status: Completed** — added `DEFAULT_COPY_SAVED_ANSWERS_LABEL` / `DEFAULT_COPY_CLEAR_SAVED_ANSWERS_LABEL` / `DEFAULT_COPY_SAVE_FAILED_MESSAGE` constants, the three `copy.*` interface fields, and `copy.controls` schema entries (near `requiredFieldsHint` ~L11550). JSX at ~L8695/L8711/L8723 now reads `copy.savedAnswersLabel ?? DEFAULT…` (with the shared constant as runtime fallback, per the W1-02-F24 single-source rule; renders with the English defaults for canvases saved before the controls existed).

#### Issue SYN-03 — "Cancel" Submit Button Label Hardcoded (HIGH)
- **Severity:** 🟠 High
- **Location:** L8734
- **Wave 1 Discovery:** The in-flight POST cancel button renders `Cancel` as a hardcoded literal. Every other footer button (Back/Continue/Final/Retry/Restart) is configurable via `buttonLabels.*`; this one is the odd one out.
- **Wave 2 Verification:** W2-23 ✅ confirmed. The `buttonLabels` group has no `cancelSubmitLabel` control.
- **Recommended Fix:** Add `cancelSubmitLabel` (string, default `"Cancel"`) to the `buttonLabels` group in `addPropertyControls`. Use it at L8734.
- **Status: Completed** — `DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL = "Cancel"` constant; `buttonLabels.cancelSubmitLabel` added to the interface and the `buttonLabels.controls` schema (~L11248); BookingEngine derives `cancelSubmitLabel` with a constant fallback (~L8112) and the button (~L8798) renders it. All footer buttons are now author-localizable.

#### Issue W1-02-F4 — sr-only Step Announcement Duplicates `% complete` (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L7720
- **Wave 1 Discovery:** `${counterText}, ${completePct}% complete — ${currentStep.title}` hardcodes the `% complete` suffix and the `, ` / ` — ` separators, ignoring `copy.stepProgressLabel` (used at L8356 for the visible progress bar). Screen-reader copy diverges from visible copy when an author localizes `stepProgressLabel`.
- **Wave 2 Verification:** W2-23 ✅ confirmed.
- **Recommended Fix:** Add a `stepAnnouncementTemplate` control (string, default `"{counter}, {percent}% complete — {title}"`) and use it at L7720 with placeholder substitution.
- **Status: Completed** — `DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE` + `copy.stepAnnouncementTemplate` control (schema + interface); `stepAnnouncementText` (~L8330) substitutes `{counter}`/`{percent}`/`{title}` with the constant as runtime fallback (W1-02-F24 single-source).

#### Issue W1-02-F5 — Inline `|| "..."` Fallbacks Violate Single-Source Contract (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L10547 (`returnHomeLabel || "Done"`), L7688 (`font?.fontFamily || "Inter, system-ui, sans-serif"`)
- **Wave 1 Discovery:** Two inline fallbacks without corresponding `DEFAULT_COPY_*` constants or PropertyControls. The font fallback in particular is a brand-voice concern.
- **Wave 2 Verification:** W2-23 ✅ confirmed both lines. W2-23 classified the `"UTC"` tz-detection fallback (separate item) as acceptable.
- **Recommended Fix:**
  - Add `DEFAULT_COPY_RETURN_HOME_LABEL = "Done"` constant; add `returnHomeLabel` control (already exists at L10547 usage — just needs the constant).
  - Add `DEFAULT_FONT_FAMILY = "Inter, system-ui, sans-serif"` constant; expose as `fontFallback` control OR document as intentional fallback.
- **Status: Completed** — `DEFAULT_COPY_RETURN_HOME_LABEL` now backs both the schema default (was an inline `"Done"`) and the runtime `??` fallback; `DEFAULT_FONT_FAMILY` backs the `fontStack` fallback, documented as an intentional fallback (the font itself stays a Framer FontFamily control — a second fallback control would only shadow it).

#### Issue W1-02-F6 — Textarea Character Counter Format Hardcoded (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L9789 (`{currentLen}/{maxLen}`)
- **Wave 1 Discovery:** The textarea live character counter uses a hardcoded `{currentLen}/{maxLen}` format. Not localizable (e.g., German might prefer `{maxLen} Zeichen übrig`).
- **Wave 2 Verification:** W2-23 ✅ confirmed. W2-28 also flagged the counter as lacking `aria-live` + `aria-describedby` association (W1-10-N5).
- **Recommended Fix:** Add `characterCountTemplate` control (string, default `"{current}/{max}"`) with placeholder substitution.
- **Status: Completed** — `DEFAULT_COPY_CHARACTER_COUNT_TEMPLATE` + control; StepBody resolves it and threads it into FieldRenderer, which substitutes `{current}`/`{max}` in both the textarea and text-input counters (W1-10-N5 live regions untouched).

#### Issue W1-02-F7 — Required-Field Marker `*` Hardcoded (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L9673
- **Wave 1 Discovery:** The required-field indicator is a hardcoded asterisk `*`. Not configurable for accessibility (some designs prefer "(required)" text) or localization.
- **Wave 2 Verification:** W2-23 ✅ confirmed.
- **Recommended Fix:** Add `requiredFieldMarker` control (string, default `"*"`) and use it at L9673.
- **Status: Completed** — `DEFAULT_COPY_REQUIRED_FIELD_MARKER` + control; FieldRenderer renders the marker in both the label and checkbox-label sites (e.g. an author can switch to `"(required)"`).

#### Issue W1-02-F8–F12 — Non-Configurable Timing Values (LOW)
- **Severity:** 🟢 Low
- **Location:**
  - L5085 — slots retry backoff `1000`/`3000` ms
  - L6692 — sessionStorage debounce `300` ms
  - L3031 — elapsed-slot tick `60000` ms (60s)
  - L4169–4170 — progress-bar/toggle spring transitions
  - L4180–4199 — `DEFAULT_DARK_THEME` colors not independently configurable
- **Wave 1 Discovery:** Sub-Agent 02 found five categories of non-configurable timing/spring/theme values. Most are defensible as internal implementation details, but the dark-theme color tokens in particular should ideally be author-overridable.
- **Wave 2 Verification:** W2-23 ✅ confirmed all locations; classified as LOW (defensible as internal, but the dark-theme tokens are a real customization gap).
- **Recommended Fix:** Defer; if pursued, expose `darkThemeBackgroundColor`, `darkThemeSurfaceColor`, `darkThemeTextColor` as new controls under `styles`.
- **Status: Accepted as-is (deferred per audit)** — timing/spring values are internal implementation details; the dark-theme tokens stay hardcoded defaults behind the existing colorMode auto-pick logic. (W2-36-N1's dark accent is separately fixed.)

#### Verified Clean (Customizability)
W2-23 confirmed the following are NOT hardcoded (Wave 1 verified clean):
- ✅ All 28 `DEFAULT_COPY_*`/`DEFAULT_ARIA_*` constants have matching PropertyControls
- ✅ `errorCopy` round-trips correctly (`copy.errorCopy.*`)
- ✅ ICS PRODID/SUMMARY configurable; other ICS literals are RFC 5545 protocol tokens (correctly NOT configurable)
- ✅ Cal.com fetch timeout IS configurable (`fetchTimeoutMs`, L11859–11866)
- ✅ No hardcoded hex colors in inline JSX style objects (only in `DEFAULT_DARK_THEME`, `pick()` comparisons, and PropertyControl `defaultValue`s)
- ✅ All `aria-label=`, `placeholder=`, `title=` JSX attributes are prop-driven expressions (no literals)

---

### Category 3 — Pipeline & Step Navigation (4 issues)

#### Issue SYN-04 — `stepAnnouncementText` Crashes on Empty Pipeline (HIGH)
- **Severity:** 🟠 High
- **Location:** L7720 (crash site), L8044 (unreachable guard), L7703 (placeholder comment)
- **Wave 1 Discovery:** Sub-Agent 03 found that `stepAnnouncementText = \`${counterText}, ${completePct}% complete — ${currentStep.title}\`` accesses `currentStep.title` when `currentStep = activeSteps[safeCurrentIndex]` is `undefined` (when `totalActive === 0`). This lives inside `useBookingEngineState` (called at L8027), which runs BEFORE the main component's empty-pipeline guard at L8044 (`if (totalActive === 0) return …`). So the guard is unreachable — the state hook crashes first. The placeholder comment at L7703 ("// ---- 1. Empty pipeline guard (canvas-only) ----") shows a guard was intended inside the hook but never implemented. Reachable on canvas when an author disables all steps, or when all enabled steps are empty form steps (dropped by the T10-M9 filter at L4395–4398).
- **Wave 2 Verification:** W2-21 ✅ CONFIRMED via direct source read (L6344–6348: `safeCurrentIndex = 0` when `totalActive===0`; `currentStep = activeSteps[0] = undefined`; L7720 throws). W2-24 ✅ CONFIRMED via scenario trace.
- **Recommended Fix:**
```typescript
// At L7720, change:
const stepAnnouncementText = `${counterText}, ${completePct}% complete — ${currentStep.title}`
// to:
const stepAnnouncementText = currentStep
  ? `${counterText}, ${completePct}% complete — ${currentStep.title}`
  : ""
```
- **Status: Completed** — `stepAnnouncementText` (~L7725) is now guarded with `currentStep ? … : ""`; the main component's empty-pipeline guard (L8056) is now reachable and renders the canvas-only "No active steps" notice / `null` on the published site. No TypeError on canvas when all steps are disabled.

#### Issue W1-03-3 — `handleBack` Lacks `navigatingRef` Guard (LOW)
- **Severity:** 🟢 Low
- **Location:** L7503
- **Wave 1 Discovery:** Sub-Agent 03 noted that F-03-4 added `navigatingRef` to `handleContinue` because "React 18 does NOT coalesce separate event handlers" — two rapid clicks composed the functional updater and skipped a step. `handleBack` uses the same `setCurrentIndex((i) => Math.max(0, i - 1))` pattern with no guard. Two rapid Back clicks compose and skip 2 steps back instead of 1.
- **Wave 2 Verification:** W2-24 ✅ CONFIRMED via double-click trace. W2-22 also confirmed this is REAL (not a false positive) because React 18 does not coalesce separate event handlers (per the code's own L7041 comment).
- **Recommended Fix:** Mirror `handleContinue`'s `navigatingRef` claim in `handleBack`. The release effect at L7063 already covers it.
- **Status: Completed** — `handleBack` now claims `navigatingRef` synchronously (guard + set, same as `handleContinue`); two rapid Back clicks advance exactly one step.

#### Issue W1-03-4 — Pinned-Step Remap Uses `startTransition`, Defeating "Before Paint" (LOW)
- **Severity:** 🟢 Low
- **Location:** L6385
- **Wave 1 Discovery:** Sub-Agent 03 found that F-03-1's own comment (L6352–6362) claims the remap happens "during render — before paint", but `React.startTransition(() => setCurrentIndex(remapped))` defers the commit. When an author disables an intermediate step mid-flow, the visitor briefly sees the wrong step for one frame. W1-14-F6 removed `startTransition` from the sibling `useLayoutEffect` clamp at L6722 for exactly this reason.
- **Wave 2 Verification:** W2-24 ✅ CONFIRMED.
- **Recommended Fix:** Drop the `startTransition` wrapper at L6385; call `setCurrentIndex(remapped)` directly (matches W1-14-F6 precedent at L6722).
- **Status: Completed** — render-phase remap now calls `setCurrentIndex(remapped)` directly; the commit happens in the same render pass, before paint.

#### Verified Clean (Pipeline)
W2-24 confirmed the following previously-flagged concerns are now FIXED or safe:
- ✅ Step counter uses ENABLED count (`totalActive = activeSteps.length` where `activeSteps = normalizedSteps.filter(s => s.enabled)`, L6329–6333)
- ✅ `currentIndex` boundaries clamped via 3 layers (`useStateGuarded` setter L8861, `safeCurrentIndex` render clamp L6344, `useLayoutEffect` L6722)
- ✅ `handleBack` from step 0 is a no-op (`if (isFirst) return` L7504)
- ✅ `handleContinue` from last step transitions to submit (L7433 `if (isLast)` → POST / success / missing-config error)
- ✅ `currentIndex` reset on retry (`handleRestart` L7605 `setCurrentIndex(0)`; `handleRetry` L7559 jumps to datetime step if slot-taken)
- ✅ Double-click Continue: SAFE (`navigatingRef` set synchronously at L7469 before `startTransition` queue)
- ✅ Triple-click Continue: SAFE (same mechanism)
- ✅ Enter + Click simultaneously: SAFE (three invocations; only first advances — W1-04-F-7 is a no-op redundancy, not a bug)
- ✅ Browser back during transition: SAFE (unmount effect L7080–7086 cleans up)
- ✅ Step toggle mid-flow (disable intermediate): SAFE (`pinnedStepIdRef` re-resolves correctly)
- ✅ **sessionStorage restore bypass** (prior critical #5): ✅ FIXED — L6554–6581 loops `validateStep` over every prior step, clamps to first invalid. (W2-24 scenario-traced)

---

### Category 4 — Validation & Navigation Guarding (7 issues)

#### Issue SYN-05 — `handleFieldChange` Live Re-Validation Broken for Multi-Step Flows (HIGH)
- **Severity:** 🟠 High
- **Location:** L7115–7118
- **Wave 1 Discovery:** Sub-Agent 04 found that `handleFieldChange` uses `activeSteps.find(step => form|datetime)?.fields.find(id === fieldId)`. `Array.find` returns only the FIRST matching step. Fields in any later form step (or custom fields on a non-first datetime step) are not found → `setErrors` silently skipped → stale errors persist until next Continue click. This is a regression of the T4-M1 "clear errors live" fix. Verified empirically via Node. Default flow unaffected; multi-form-step flows hit this.
- **Wave 2 Verification:** W2-21 ✅ CONFIRMED via direct read (L7115–7117 logic). W2-24 ✅ CONFIRMED. W2-22 ✅ CONFIRMED REAL (real `Array.find` logic bug, not a false positive).
- **Root Cause Analysis:** The lookup was written assuming a single form/datetime step. When multi-step flows were added, the lookup wasn't updated to iterate all steps.
- **Recommended Fix:**
```typescript
// At L7115–7118, replace:
const field = activeSteps.find(step => step.type === "form" || step.type === "datetime")
  ?.fields.find(f => f.id === fieldId)

// with:
let field: FieldConfig | undefined
for (const step of activeSteps) {
  if (step.type === "form" || step.type === "datetime") {
    field = step.fields.find(f => f.id === fieldId)
    if (field) break
  }
}
```
- **Status: Completed** — `handleFieldChange` (~L7116) now iterates every active form/datetime step until the field is found (typed `NormalizedField`, early-break loop), restoring live re-validation for multi-form-step flows and custom fields on non-first datetime steps.

#### Issue W1-04-F-3 — `validatePhone` Doesn't Trim Input (LOW)
- **Severity:** 🟢 Low
- **Location:** L4534
- **Wave 1 Discovery:** Email path uses `str.trim()`; phone path doesn't. `"555-555-5555 "` (pasted with trailing space) fails the `^...$`-anchored regex.
- **Wave 2 Verification:** W2-39 ✅ CONFIRMED via Node test script (`/home/z/my-project/scripts/test_regex.js`): `validatePhone("555-555-5555 ")` → `"PHONE"` (should be `null`).
- **Recommended Fix:** `validatePhone(str.trim(), vc)` at L4534.
- **Status: Completed** — `validatePhone` now trims internally, so both call sites (explicit phone rule + phone field type) inherit the fix.

#### Issue W1-04-F-4 — `EMAIL_REGEX` Accepts Numeric TLDs (LOW)
- **Severity:** 🟢 Low
- **Location:** L4142–4143
- **Wave 1 Discovery:** `"user@example.123"` and `"user@example.1a2"` pass the regex. Real TLDs are alphabetic.
- **Wave 2 Verification:** W2-39 ✅ CONFIRMED via Node: `EMAIL_REGEX.test("user@example.123")` → `true` (should be `false`).
- **Recommended Fix:** Require first TLD char alphabetic: change `[A-Za-z]{2,}` to `[A-Za-z][A-Za-z0-9]*` in the TLD portion, or use `[A-Za-z]{2,}` strictly.
- **Status: Completed** — TLD is now strict `[A-Za-z]{2,}`; `user@example.123` / `user@example.1a2` both fail (ASCII regex, punycode TLDs out of scope).

#### Issue W1-04-F-5 — `"1234567"` Passes Phone Validation (LOW)
- **Severity:** 🟢 Low
- **Location:** Phone regex (search around L4534)
- **Wave 1 Discovery:** Digit-only strings without any separators or `+` pass validation.
- **Wave 2 Verification:** W2-39 ✅ CONFIRMED via Node: `validatePhone("1234567")` → `null` (should be `"PHONE"`).
- **Recommended Fix:** Require at least one separator (space, dash, dot, or parens) or `+` prefix for phone numbers ≥7 digits.
- **Status: Completed** — `validatePhone` rejects `/^\d{7,}$/` (≥7 contiguous digits with no separators and no `+`) before the loose regex runs; `+`-prefixed international strings are unaffected.

#### Issue W1-04-F-6 — `isReDosRisky` Not Memoized (LOW)
- **Severity:** 🟢 Low
- **Location:** L4570/L4581/L4585/L4631
- **Wave 1 Discovery:** Sub-Agent 04 found that `isReDosRisky` constructs 3–4 `new RegExp` per call. For custom-regex fields, this runs on every keystroke with no `Map` cache.
- **Wave 2 Verification:** W2-39 ✅ CONFIRMED by source. W2-39 also confirmed `isReDosRisky` itself is bulletproof — correctly flags all 8 classic ReDoS shapes (`(a+)+`, `(a*)*`, `(a|aa)+`, etc.) and correctly allows safe shapes. Full `validateField` on attacker pattern `(a+)+$` + 25-char killer returns `INVALID_REGEX` in <1ms — regex never executes.
- **Recommended Fix:** Add a `WeakMap<string, boolean>` cache keyed by regex source string. Same pattern as `getCompiledCustomRegex` should already use.
- **Status: Completed** — `reDosCache: Map<string, boolean>` wraps the analysis (`isReDosRisky` → cached wrapper → `isReDosRiskyUncached`). Per-keystroke verdicts now hit the cache after the first computation; growth bounded by author-edited patterns.

#### Issue W1-04-F-8 — Form Lacks `noValidate` (LOW)
- **Severity:** 🟢 Low
- **Location:** L8486 (form element)
- **Wave 1 Discovery:** Without `noValidate`, browser native validation fires before `onSubmit` for `required`/`type="email"`, producing two inconsistent error UX styles (browser tooltip vs. inline error).
- **Wave 2 Verification:** W2-22 ✅ CONFIRMED REAL. W2-24 ✅ CONFIRMED.
- **Recommended Fix:** Add `noValidate` attribute to the `<form>` at L8486.
- **Status: Completed** — `noValidate` on the form; the engine's own `validateStep` pipeline is now the single validation path (no more native tooltip vs. inline-error split).

#### Issue W1-04-F-7 — Continue Button Double-Invokes `handleContinue` (INFO, false-positive-leaning)
- **Severity:** ⚪ Info
- **Location:** L8490 (`onClick={handleContinue}` on submit button) + L8742 (`onSubmit={handleContinue}` on form)
- **Wave 1 Discovery:** Sub-Agent 04 flagged that `type="submit"` + `onClick={handleContinue}` AND form `onSubmit` calls `handleContinue` → double invocation per click.
- **Wave 2 Verification:** W2-22 ❌ FILTERED AS FALSE POSITIVE — React 18 automatic batching coalesces both calls' state updates into one render; second call early-returns via `navigatingRef`; redundant work is one pure `validateStep` (microseconds). W2-24 confirmed it's a redundancy, not a bug.
- **Recommended Fix (optional cleanup):** Drop `onClick={handleContinue}` from the submit button at L8490; rely on `onSubmit` alone (preserves Enter-key behavior).
- **Status: Completed (cleanup)** — `onClick` removed; the `type="submit"` button + form `onSubmit` is now the single invocation path (click and Enter both flow through the form).

#### Verified Clean (Validation)
- ✅ `handleContinue` runs `validateStep` SYNCHRONOUSLY before advancing (L7416–7420)
- ✅ `setCurrentIndex(i+1)` only reachable inside `if (valid)` branch (after `if (!valid) return` L7426–7431)
- ✅ No async validation paths exist
- ✅ Enter key → form `onSubmit` → `handleContinue` (synchronous)
- ✅ Double-click Continue: SAFE (`navigatingRef` guard L7468)
- ✅ All 5 previously-flagged W1-04 items (C1/H2/H3/L3/M4) confirmed FIXED

---

### Category 5 — Cal.com v2 API Integration & Timezone Accuracy (8 issues)

#### Issue SYN-06 — GET Uses `start`/`end` Instead of `startTime`/`endTime` (HIGH, REQUIRES LIVE VERIFICATION)
- **Severity:** 🟠 High
- **Location:** L4906–4910
- **Wave 1 Discovery:** Sub-Agent 05 found the GET URL uses `&start=`/`&end=`, but Cal.com v2 OpenAPI documents `startTime`/`endTime`. If the live API enforces documented names, every availability fetch silently fails or returns wrong data.
- **Wave 2 Verification:** W2-21 ✅ VERIFIED (code-level): URL string at L4906–4910 uses `&start=`/`&end=`. W2-25 ✅ VERIFIED + flagged REQUIRES-LIVE-VERIFICATION. Grep confirms no `startTime`/`endTime` anywhere near an `api.cal.com` URL.
- **Root Cause Analysis:** Either (a) the original implementation used an older Cal.com v2 draft that used `start`/`end`, or (b) the code was written against an undocumented endpoint. The published OpenAPI at https://developer.cal.com/api/api-reference/v2 documents `startTime`/`endTime`.
- **Impact:** If live API enforces documented names: every availability fetch silently fails or returns empty data. Visitor sees an empty calendar with no error banner. **This is potentially the single most impactful defect in the entire audit** — but it requires a 30-second curl test to confirm.
- **Recommended Next Action:** ~~Run curl to verify~~ **RESOLVED 2026-08-16 — live OpenAPI refutes the claim.** Fetched the current published spec at `https://cal.com/docs/api-reference/v2/slots/get-available-time-slots-for-an-event-type` (via `/docs/llms.txt`). The documented query params are `start` and `end` (both REQUIRED, ISO-8601 UTC) plus optional `timeZone`/`eventTypeId`/`duration`/`format` — **no `startTime`/`endTime` anywhere**. The code's URL (`eventTypeId`, `start`, `end`, `timeZone`) and the `cal-api-version: 2024-09-04` header match the spec exactly. **No code change required for SYN-06.** (The audit's earlier doc reference was stale or misremembered.)
- **Status: Completed (no-op)** — claim refuted against the live OpenAPI; parameter names verified correct.

#### Issue SYN-07 — `isCalSlot` Guard May Reject All Real Slots (HIGH, REQUIRES LIVE VERIFICATION)
- **Severity:** 🟠 High
- **Location:** L4733–4740
- **Wave 1 Discovery:** Sub-Agent 05 found the `isCalSlot` guard requires `start` + `end` string keys. Cal.com v2's documented slot shape is `{time, bookingUid}`. If the live API returns that shape, `isCalSlot` rejects every entry → visitor sees an empty calendar with **no error banner** (HTTP was 2xx, parsing "succeeded" with `[]`). Would also break `submitCalcomBooking`'s required `slotEnd` (prior critical #6).
- **Wave 2 Verification:** W2-21 ✅ VERIFIED (code-level). W2-25 ✅ VERIFIED + flagged REQUIRES-LIVE-VERIFICATION. The author's comment at L5011 asserts `{start, end}` — needs live verification.
- **Impact:** Coupled with SYN-06 — same curl resolves both. If live API returns `{time, bookingUid}`: every calendar shows empty; every booking attempt 400-rejects (missing `end`).
- **2026-08-16 LIVE VERIFICATION — partially refuted, real hazard found.** The claimed `{time, bookingUid}` shape does NOT exist for this endpoint (docs: `bookingUid` appears only on seated slots). The live OpenAPI instead documents TWO response formats selectable via `format`:
  - **Default (`time` format):** `data: { 'YYYY-MM-DD': [bare time strings] }` — no `end` at all.
  - **`format=range`:** `data: { 'YYYY-MM-DD': [{ start, end }] }` — the shape the engine's data contract (`BookingPayload.slotEnd` → POST body `end`, success-screen duration, analytics) requires.
  - The engine **never sent `format=range`**, so under the documented default it would have received bare strings/`{start}`-only objects → `isCalSlot` rejected everything → empty calendar, no error banner. The hazard was real; the predicted shape was wrong. Additionally the parser only read `data.slots`, while the live shape puts date keys directly under `data`.
- **Fix applied (verified against live OpenAPI):** (1) URL now sends `&format=range` (~L4933) so the API returns `{start, end}`; (2) parser (~L5042) now falls back to flattening the date-key map directly under `data` when `data.slots` is absent; (3) `isCalSlot` (~L4754) accepts `{start, end}` (range), `{start}` (time), and `{time}` (seated) defensively, with `end` optional — a server ignoring `format` can no longer produce a silent empty calendar.
- **Status: Completed**

#### Issue W1-05-F-03 — Fetch Effect Missing `errorCopy`/`timeoutMs` Deps (MEDIUM, partially mitigated)
- **Severity:** 🟡 Medium (downgraded from Wave 1's MEDIUM due to W2-22 finding)
- **Location:** L5151 (deps array)
- **Wave 1 Discovery:** Sub-Agent 05 flagged that `errorCopy` and `timeoutMs` are consumed inside the fetch effect but missing from its deps. Same class as the already-fixed W2-33-A2 (`fallbackErrorLabel`).
- **Wave 2 Verification:** W2-21 ⚠️ REFINED — the local `copy` variable (L4793) is recreated every render, so adding it would cause infinite re-fires. The actual missing dep is `errorCopy` (the hook parameter, referentially stable at the call site). W2-22 ❌ FILTERED AS FALSE POSITIVE for production — `errorCopy` is `useMemo`'d (stable), `fetchTimeoutMs` is primitive; author edits only happen on Framer canvas where property-panel changes remount the component (effect re-runs fresh); published-site props are immutable.
- **Recommended Fix (low-priority):** Add `errorCopy` and `fetchTimeoutMs` to the deps array at L5151 for eslint-exhaustive-deps compliance and defense against future refactors that might destabilize `errorCopy`.
- **Status: Completed** — deps array (~L5226) now includes `errorCopy` and `timeoutMs` alongside `fallbackErrorLabel`; both are referentially stable/primitive so the effect cannot re-fire spuriously.

#### Issue W1-05-F-04 — No Cache TTL (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L4815–4825 (cacheRef logic)
- **Wave 1 Discovery:** Sub-Agent 05 found `cacheRef` entries persist for the entire session. A visitor crossing midnight (or on a long-lived tab) sees already-elapsed slots as selectable; only discovers staleness when the POST 400-rejects.
- **Wave 2 Verification:** W2-25 ✅ CONFIRMED.
- **Recommended Fix:** Add timestamp-based invalidation (entries older than 5 minutes are refetched) OR listen to `visibilitychange` and invalidate on tab refocus.
- **Status: Completed** — `SLOTS_CACHE_TTL_MS = 5 min` constant; entries now store `{ slots, fetchedAt }`; the read site (~L4918) refetches when `Date.now() - fetchedAt >= TTL` and the write site (~L5138) stamps the fetch time.

#### Issue W1-07-F5 — DST Fall-Back Collision Produces Empty-Parens Label (LOW)
- **Severity:** 🟢 Low
- **Location:** L2974–2997
- **Wave 1 Discovery:** Sub-Agent 07 found that in `useTimeGrid`, when `abbrevOf(item.value)` returns `null` (catch block on an exotic engine), the label becomes `"01:30 AM ()"` with empty parens.
- **Wave 2 Verification:** W2-26 ✅ CONFIRMED via Node trace (both fall-back instants return 90 minutes → collision branch fires → empty parens).
- **Recommended Fix:** Fall back to UTC offset suffix (e.g., `"-05:00"` vs `"-06:00"`) when the abbreviation is unavailable. Use `Intl.DateTimeFormat` with `timeZoneName: "longOffset"`.
- **Status: Completed** — `abbrevOf` now falls back to `timeZoneName: "longOffset"` (e.g. "GMT-05:00" vs "GMT-06:00") when the "short" zone name is missing, so the DST collision branch can no longer emit empty parens.

#### Issue W1-07-F7 — Success-Screen Date Label Uses Cell-Midnight Instead of Slot Instant (LOW)
- **Severity:** 🟢 Low
- **Location:** L10175
- **Wave 1 Discovery:** Sub-Agent 07 found `slot.date.toLocaleDateString(..., { timeZone })` formats the calendar cell's browser-local-midnight Date in the visitor's tz. For a real Cal.com slot, `slot.date` is the cell date (browser-local), but `slot.time24h` is the slot's actual UTC instant. At extreme tz drift (≥12h), the visible label `"December 14, 2024"` disagrees with both the clicked cell (`"15"`) and the ICS filename (`booking-2024-12-15.ics`).
- **Wave 2 Verification:** W2-26 ✅ CONFIRMED via full chain trace (calendarCells L2678 → CalendarCell.onClick L1435 → getPayload L3504/L3505 → SuccessScreen L10175).
- **Recommended Fix:** Derive `dateStr` from `new Date(slot.time24h)` when ISO; fall back to `slot.date` only for demo mode.
- **Status: Completed** — the instant-vs-cell-midnight derivation now applies at all four derived-date sites: ReviewStepBody (formatted in the visitor's zone — `timeZone` threaded in), SuccessScreen (zoned, RangeError-guarded), the `{date}` summary-text replacement, and the ICS/email summary body. Demo mode (`time24h` without a "T") keeps `slot.date`.

#### Issue W1-07-F9 — `cacheRef.clear()` Omits `timeZone` from Deps (LOW)
- **Severity:** 🟢 Low
- **Location:** L4841–4843
- **Wave 1 Discovery:** Sub-Agent 07 found the slots cache key includes `timeZone` (L4770), but the bulk-invalidation effect only fires on `[apiKey, eventTypeId]`. Old tz slot entries linger in memory across visitor tz switches.
- **Wave 2 Verification:** W2-26 ✅ CONFIRMED. Worst case ~460 KB across 16 tz × 12 months.
- **Recommended Fix:** Add `timeZone` to the dep array at L4843: `[apiKey, eventTypeId, timeZone]`.
- **Status: Completed** — `timeZone` added to the invalidation effect's deps (~L4895); switching the visitor's timezone now drops the old timezone's cache entries.

#### Issue W2-26-F26-1 (NEW) — ±1 Day TZ Widening Insufficient for 26h Drift (LOW)
- **Severity:** 🟢 Low
- **Location:** L4889–4903
- **Wave 1 Discovery:** (Not in Wave 1 — discovered by W2-26.)
- **Wave 2 Discovery:** W2-26 found that W1-07-F14's claim "±1 day widening absorbs the worst case (±14h)" is **mathematically wrong**. Max browser↔visitor drift is **26h** (Kiritimati +14 ↔ Baker/Howland −12) and **24h45m** (Chatham +12:45 ↔ −12) — both exceed the 24h widening. Node-verified: visitor's first-of-month 00:00–01:59 slot instants fall BEFORE the widened range start (`2024-11-30T12:00:00Z`) and are silently not fetched from Cal.com.
- **Recommended Fix:** Widen by ±2 days OR compute visitor-tz month boundaries via `Intl.DateTimeFormat` parts. Update the misleading comment at L4881–4888.
- **Status: Completed** — widening is now ±2 calendar days on each side (~L4953/L4962) with the corrected 26h-drift comment.

#### Verified Clean (Cal.com + Timezone)
W2-25 and W2-26 confirmed:
- ✅ POST body includes ALL required Cal.com v2 fields (prior critical #6 `end` field FIXED at L5319–5321 + threading at L7293)
- ✅ Per-attempt timeout via `AbortController` (W1-05-F3 fix in place)
- ✅ 429 `Retry-After` parsed (but no auto-retry — GET gates on `status >= 500` only; intentional for POST to avoid double-book risk)
- ✅ Defensive response parsing for multiple shapes
- ✅ `getMinutesInTimeZone` (L504) handles fractional offsets (Asia/Kolkata +5:30 → 330, Nepal +5:45 → 345, Lord Howe +10:30 → 630, Chatham +12:45 → 765, Kiritimati +14 → 840) — all Node-verified
- ✅ `getDateKeyInTimeZone` (L536) produces consistent zero-padded YYYY-MM-DD keys
- ✅ ICS DTSTART/DTEND use RFC 5545 UTC-compact form (Z suffix)
- ✅ `detectTimezone` (L4328) uses robust `Intl.DateTimeFormat().resolvedOptions().timeZone` (not fragile `getTimezoneOffset`), SSR-safe
- ✅ Cal.com API sends UTC ISO instants + separate `timeZone` param (matches Cal.com v2 schema)
- ✅ Year-end roll-over (Dec 31 → Jan 1 in Tokyo) correctly produces `2025-01-01` (Node-verified)
- ✅ DST spring-forward gap (NY 2024-03-10T02:30Z) correctly handled

---

### Category 6 — Accessibility (ARIA & Focus) (10 issues)

#### Issue W1-10-N1 — Slot Radiogroup Lacks `aria-invalid` + `aria-describedby` (MODERATE)
- **Severity:** 🟡 Moderate (WCAG 3.3.1 / 4.1.2)
- **Location:** TimeSlotList L2418 (radiogroup); slot error banner L9285 (no `id`)
- **Wave 1 Discovery:** Sub-Agent 10 found the slot radiogroup is the only invalidatable control that doesn't get `aria-invalid` + `aria-describedby` when `slotError` is set. `TimeSlotListProps`/`TimeSlotButton` don't even declare those props, and the slot error banner at L9285 has no `id` to reference. Compare to every other field path (L9766, L9809, L9960, L10036) and `ChoiceGroupInline` (L9927–9929) which all wire it correctly.
- **Wave 2 Verification:** W2-28 ✅ CONFIRMED.
- **Recommended Fix:** Add `aria-invalid={Boolean(slotError)}` and `aria-describedby={slotError ? slotErrorId : undefined}` to the radiogroup at L2418. Add `id={slotErrorId}` to the banner at L9285.
- **Status: Completed** — radiogroup (`TimeSlotList`) now carries `aria-invalid`/`aria-describedby` via new `slotError`/`slotErrorId` props threaded `DateAndTimeInline` → `TimeSlotList` (both interfaces + call sites); the engine-level banner got the per-instance id `${reactInstanceId}-be-slot-error` the describedby points at.

#### Issue W1-10-N2 — Field IDs Not Scoped Per-Instance (MODERATE)
- **Severity:** 🟡 Moderate (WCAG 4.1.1 / 1.3.1 / 2.4.3)
- **Location:** L9315 (`be-timezone-select` hardcoded literal); `be-field-${field.id}` and `be-error-${field.id}` patterns throughout
- **Wave 1 Discovery:** Sub-Agent 10 found field IDs are NOT scoped per-instance. `reactInstanceId = React.useId()` already exists at L6055 but isn't applied here. Two `BookingEngine` instances on one page break `<label htmlFor>` resolution, `aria-describedby` references, and the `focusFirstInvalidField` `querySelector`.
- **Wave 2 Verification:** W2-28 ✅ CONFIRMED.
- **Recommended Fix:** Prefix all ID literals with `${reactInstanceId}-`:
```typescript
// L9315:
id={`${reactInstanceId}-be-timezone-select`}
// Field IDs: `be-field-${field.id}` → `${reactInstanceId}-be-field-${field.id}`
// Error IDs: `be-error-${field.id}` → `${reactInstanceId}-be-error-${field.id}`
```
- **Status: Completed** — every field id (`be-field-${field.id}`), error id (`be-error-${field.id}`) and the counter ids are now scoped via `React.useId()` inside `FieldRenderer` (stable per mounted field); the timezone select uses `${reactInstanceId}-be-timezone-select`. `focusFirstInvalidField` is unaffected (it keys off `data-field-id`, which is intentionally unscoped).

#### Issue W1-10-N3 — 12h/24h Toggle Lacks Group Label (MODERATE)
- **Severity:** 🟡 Moderate (WCAG 2.4.6 / 4.1.2)
- **Location:** L2187–2309
- **Wave 1 Discovery:** Sub-Agent 10 found the 12h/24h time-format toggle has no group label or contextual button names — SR users hear "12h, toggle button, pressed" with no purpose context. Parent `<div>` lacks `role="group"`/`aria-label`.
- **Wave 2 Verification:** W2-28 ✅ CONFIRMED. No `timeFormatLabel` copy token exists.
- **Recommended Fix:** Add `role="group"` + `aria-label={copy.timeFormatLabel || "Time format"}` to the parent `<div>`. Add `timeFormatLabel` to the `copy` controls.
- **Status: Completed** — the toggle wrapper has `role="group"` + `aria-label`; new copy token `timeFormatLabel` (constant `DEFAULT_COPY_TIMEFORMAT_LABEL = "Time format"`, interface, schema control, threaded `BookingEngine` → `DateAndTimeInline` → `TimeSlotList`).

#### Issue W1-13-F-13-9 — Canvas-Only Banners Lack ARIA Semantics (MEDIUM)
- **Severity:** 🟡 Medium (WCAG 4.1.3)
- **Location:** L8170, L8194, L8213, L8235, L8291 (all five canvas-only banners)
- **Wave 1 Discovery:** Sub-Agent 13 found canvas-only banners carry NO ARIA semantics — no `role="status"`, no `aria-live`. Screen-reader-using authors aren't notified when a banner appears. Inconsistent with the published-site unavailable notice (L9205, `role="alert"`) and the no-times banner (L9180, `role="status"` + `aria-live="polite"`).
- **Wave 2 Verification:** W2-28 ✅ CONFIRMED.
- **Recommended Fix:** Add `role="status"` (or `aria-live="polite"`) to each canvas banner. Avoid `role="alert"` — these are author nudges, not visitor errors.
- **Status: Completed** — all five canvas-only banners (Cal setup, name/email guardrail, empty-step warnings, regex verdicts, theme verdicts) now render `role="status"` + `aria-live="polite"`.

#### Issue W1-13-F-13-8 — Canvas-Only Banners Lack Borders (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L8194 (name/email banner), L8213 (empty-step banner)
- **Wave 1 Discovery:** Sub-Agent 13 found two of the five banners lack any `border` property, relying solely on `withAlpha(theme.errorColor, 0.1)` background tint. If `errorColor` has poor contrast vs `backgroundColor` (which `themeVerdicts` itself flags at L6928), the banners become nearly invisible. The other three banners carry `1px solid` borders.
- **Wave 2 Verification:** W2-28 ✅ CONFIRMED (visual inconsistency).
- **Recommended Fix:** Add `border: 1px solid ${withAlpha(theme.errorColor, 0.3)}` to L8194 and L8213 banners.
- **Status: Completed** — both the name/email guardrail and the empty-step warning banners now carry the 1px error-tinted border.

#### Issue W1-10-N4 — No `"{time} selected"` Live Announcement (LOW-MOD)
- **Severity:** 🟢 Low-Mod (WCAG 4.1.3)
- **Location:** Slot selection flow
- **Wave 1 Discovery:** Sub-Agent 10 found no explicit "{time} selected" live announcement on slot pick — selection only inferred via `aria-checked` change on the focused element. Mouse-click on an already-focused slot is silent.
- **Wave 2 Verification:** W2-28 ✅ CONFIRMED. Keyboard selection is announced (via focus move + aria-checked), but mouse-click is silent.
- **Recommended Fix:** Add a brief `aria-live="polite"` announcement: `"{time} selected"`.
- **Status: Completed** — new copy token `timeSlotSelectedTemplate` (`"{time} selected"` default, interface + schema + constant) threaded to `DateAndTimeInline`, which announces into a visually-hidden polite region on every slot pick (mouse or keyboard), de-duplicating consecutive identical picks.

#### Issue W1-10-N5/N6/N7 — Various Notices Not in Live Regions (LOW)
- **Severity:** 🟢 Low (WCAG 4.1.3 / 3.3.5)
- **Location:**
  - N5: Character counters L9781, L10046 — plain `<div>`, no `id`, no `aria-live`, not in `aria-describedby`
  - N6: "Progress couldn't be saved" L8649–8660 — plain `<div>`, no `role`/`aria-live`
  - N7: "Answers are saved" L8614–8648 — plain `<div>`, no `role`/`aria-live`; dynamic transition silent
- **Wave 2 Verification:** W2-28 ✅ CONFIRMED all three.
- **Recommended Fix:** Wrap each in `role="status"` + `aria-live="polite"`. For counters, also add `id` and reference from the input's `aria-describedby`.
- **Status: Completed** — saved-answers notice and save-failed notice are now polite status regions; both character counters (text/email/phone + textarea) got `role="status"`/`aria-live="polite"` + a scoped `counterId`, referenced from their inputs' `aria-describedby` alongside the error id.

#### Issue W1-10-N8/N9/N10 — Decorative Element aria-hidden Gaps (LOW)
- **Severity:** 🟢 Low (WCAG 1.1.1 / 1.3.1 / 2.4.6)
- **Location:**
  - N8: ChoiceGroup glyph span L1044–1055 not `aria-hidden` — emoji/symbol gets read inconsistently
  - N9: Submit spinner span L8773–8785 not `aria-hidden` (parent has `aria-busy`)
  - N10: Cancel-during-submit button L8714–8735 accessible name is just `"Cancel"` — ambiguous in SR button-list navigation
- **Wave 2 Verification:** W2-28 ✅ CONFIRMED all three.
- **Recommended Fix:**
  - N8: Add `aria-hidden="true"` to the glyph span
  - N9: Add `aria-hidden="true"` to the spinner span (defensive; parent `aria-busy` already covers it)
  - N10: Use `copy.cancelSubmitLabel || "Cancel submit"` (also closes SYN-03)
- **Status: Completed** — N8: choice-glyph span `aria-hidden="true"`. N9: submit spinner span `aria-hidden="true"`. N10: closed earlier by SYN-03 (`buttonLabels.cancelSubmitLabel`, default "Cancel").

#### Verified Clean (Accessibility)
W2-28 confirmed:
- ✅ Step transition announced via `<output aria-live="polite">` at L8150–8165
- ✅ Validation errors (form fields) use `role="alert"` + `aria-invalid` + `aria-describedby`
- ✅ Loading state announced via `role="status"` + `aria-live="polite"` at L2331–2344
- ✅ Success/error terminals use `role="status"` / `role="alert"` + `aria-live="assertive"`
- ✅ Calendar month change announced via `aria-live="polite"` at L1835–1850
- ✅ First-render guards on all live regions (no spurious announcements on mount)
- ✅ All 14 prior W1-10 fixes + 2 prior W2-28 fixes verified in place

#### Focus Management (Sub-Agent 29 verification)
- ✅ Prior critical W1-11-A1 (inline `outline: "none"` overriding `:focus-visible`): ✅ FIXED — `inputBaseStyle` (L9726–9740) has no `outline` key
- ✅ `:focus-visible` styling comprehensive and theme-token-driven (L8799–8818)
- ✅ Calendar grid keyboard model complete (Arrow/Home/End/PageUp/PageDown at L1436–1483)
- ✅ Validation errors move focus to first invalid field (`focusFirstInvalidField` L7151–7187)
- ✅ Step transitions move focus to `<h2 ref={stepTitleRef} tabIndex={-1}>` (L7095 effect)
- ✅ Retry moves focus to step title (`scheduleFocusTimer` L7574)
- ✅ Success/Error screens focus their headings on mount
- ⚠️ W1-11-F5: Elapsed-slot focus loss — when 60-sec tick marks a Tab-focused slot as `elapsed`, focus drops to `document.body` (LOW, narrow window) — **✅ FIXED** (W1-11-F5 rescue effect in TimeSlotList: on tick, focus moves to the next non-elapsed slot, wrapping; clears `focusedKey` when none remain)
- ⚠️ W2-29-N1 (NEW): `handleCancelSubmit` doesn't restore focus after Cancel button unmounts (LOW/MEDIUM). Fix: add `scheduleFocusTimer(() => stepTitleRef.current?.focus())` mirroring `handleRetry`. — **✅ FIXED** (added to `handleCancelSubmit`, deps `[flowStatus, scheduleFocusTimer]`)

---

### Category 7 — Sub-Component Inlining & Controlled Sync (6 issues)

#### Issue SYN-08 — `ChoiceGroupInline` `React.memo` Defeated (HIGH, refined)
- **Severity:** 🟠 High (cascade severity corrected by W2-22 from HIGH to LOW for perf; kept HIGH for correctness regression)
- **Location:** L9870–9877 (fresh `opts` array), L9931 (inline `onChange`), L795–808 (mount-seed effect)
- **Wave 1 Discovery:** Sub-Agent 08 rated this HIGH, claiming "every parent render cascades to ChoiceGroupInline". Sub-Agent 16 rated it LOW.
- **Wave 2 Verification:** W2-22 ⚠️ REFINED — Sub-Agent 08's cascade model was incorrect: `FieldRenderer` (the actual parent of `ChoiceGroupInline`) is itself `React.memo`'d at L9620, so per-keystroke in field A does NOT re-render field B's FieldRenderer. The "every parent render" cascade doesn't exist. **However**, W2-27 confirmed that when FieldRenderer DOES re-render (on choice click, value change, error change), the fresh `opts` array and inline `onChange` break the memo. W2-35 confirmed the net-benefit of the fix is positive.
- **The deeper correctness regression:** The fresh `opts` identity invalidates the `parsedOptions` `useMemo` (L780) → resets `firedInitialRef.current = false` → L795 mount-seed effect re-fires `setInternalSelected(firstOptionLabel)` → parent `setValues` round-trip → **required choice groups auto-pass validation without user interaction** (W1-20-F-1). User can never truly clear a choice field.
- **Recommended Fix:**
```typescript
// In FieldRenderer (around L9870):
const opts = useMemo(() => field.options?.map(...) ?? [], [field.options])
const handleChoiceChange = useCallback((value: string) => onFieldChange(field.id, value), [field.id, onFieldChange])
// Then at L9931:
<ChoiceGroupInline onChange={handleChoiceChange} ... />
```
- **Status: Completed** — `FieldRenderer` now builds `opts` via a top-of-component `useMemo` (deps `[field.options, field.optionImages, field.optionDescriptions]`, all referentially stable via memoized normalized steps) and passes a `useCallback` `handleChoiceChange`; the inline arrow and per-render `.map()` are gone. `ChoiceGroupInline`'s `React.memo` holds across FieldRenderer re-renders, the mount-seed onChange (W1-08-CG-02) no longer re-fires, and required choice groups no longer auto-pass validation. Closes W1-08-F-08-02/05, W1-16-P-16, W1-20-F-1.

#### Issue SYN-10 — Hidden Form-State Input Writes Presentation Fallback (HIGH)
- **Severity:** 🟠 High
- **Location:** ChoiceGroupInline L723–730 (fallback derivation), L1156 (hidden input binding)
- **Wave 1 Discovery:** Sub-Agent 08 found that `selected` falls back to `parsedOptions[0]?.label` when `controlledValue` matches no option (intentional for tabIndex/aria-checked). But L1156 binds `value={selected}` to the hidden `<input type="hidden">`, so the form-state dump submits `parsedOptions[0].label` while the parent's React state holds a different value.
- **Wave 2 Verification:** W2-21 ✅ CONFIRMED via direct read. W2-27 ✅ CONFIRMED.
- **Recommended Fix:** Split `selected` into `presentationSelected` (for tabIndex/aria-checked, falls back to first option) and `formValue` (for the hidden input, uses actual `controlledValue` even if it matches no option):
```typescript
const presentationSelected = controlledValue ?? parsedOptions[0]?.label ?? ""
const formValue = controlledValue ?? ""
// L1156: <input type="hidden" value={formValue} ... />
// tabIndex/aria-checked use presentationSelected
```
- **Status: Completed** — `ChoiceGroupInline` (~L723) now keeps `selected` as the presentation value while a new `formValue` (= real `controlledValue`, or `internalSelected` when uncontrolled) feeds the hidden `<input>` at ~L1160. The form-state dump no longer submits the first option's label when the parent holds a different value; `isSelected`/border/tabIndex logic is untouched and still keys off `selected`.

#### Issue W1-08-F-08-04 — External `controlledValue` Change Doesn't Move DOM Focus (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** ChoiceGroupInline sync effects
- **Wave 1 Discovery:** Sub-Agent 08 found that when `controlledValue` changes externally (e.g., Reset button, cross-field auto-select, step re-entry), the re-render updates `tabIndex` (old button → `-1`, new button → `0`), but the browser focus stays on the old button — now unreachable via Tab. Strands keyboard/SR users.
- **Wave 2 Verification:** W2-27 ✅ CONFIRMED via full enumeration of all 13 `.focus()` call sites — only L768/L875/L892/L899 fire, all on user-initiated events.
- **Recommended Fix:** Add an effect that moves focus to the newly-selected button when `controlledValue` changes externally (distinguish from user-initiated change via a ref flag).
- **Status: Completed** — `lastUserPickRef` tags user picks in `selectOption`; an effect on `[controlledValue, parsedOptions]` skips those and otherwise rAF-focuses the button for the new controlled value (cleanup cancels the frame on re-render/unmount).

#### Issue W1-08-F-08-06 — Duplicate-Label Options Break `key` + `isSelected` (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L920 (`isSelected = option.label === selected`), L928 (`key={option.label}`)
- **Wave 1 Discovery:** Sub-Agent 08 found both `key={option.label}` and `isSelected = option.label === selected` break on duplicate-label options. Two `aria-checked="true"`, two `tabIndex={0}` tab stops, one React key collision.
- **Wave 2 Verification:** W2-27 ✅ CONFIRMED. W2-39 ✅ CONFIRMED via Node test (two `Apple` buttons both compute `isSelected=true`; 1 React key collision).
- **Recommended Fix:** Use index-based key and index-aware `isSelected`:
```typescript
// L920: isSelected = (selectedIndex === index)
// L928: key={`${option.label}-${index}`}
```
- **Status: Completed** — hoisted `selectedIndex` (findIndex over the controlled label) now drives `isSelected`, the roving `tabIndex`, and the segmented divider; option keys are `${label}-${index}`. Duplicate labels no longer collide.

#### Issue W1-09-DT-EmptyMonth — PageDown Into Empty Month Strands Focus (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** `useCalendarNavigation` L2772–2784 (focus-restore effect)
- **Wave 1 Discovery:** Sub-Agent 09 found PageDown into a fully-empty Cal.com month strands focus on `document.body`. The effect queries `[tabindex="1"]`, but `selectedOrFirstDateKey` is `null` and `dateTabIndexByKey` is empty when no day has availability — no cell gets `tabIndex=1`. The 3-month auto-advance (L2792–2800) only covers initial empty months; after that the user is stranded.
- **Wave 2 Verification:** W2-27 ✅ CONFIRMED. W2-29 ✅ CONFIRMED.
- **Recommended Fix:** Add a fallback in the focus-restore effect: if `querySelector('[tabindex="1"]')` returns null, focus the month header (`gridLabelId`) instead.
- **Status: Completed** — the month `<h3>` is now `tabIndex={-1}` + `data-be-month-heading`; the focus-restore effect falls back to it when no `[tabindex="1"]` cell exists (fully-empty month).

#### Issue W1-09-DT-AutoFocus — `handleDateSelect` Doesn't Focus Slot List (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L3543–3558
- **Wave 1 Discovery:** Sub-Agent 09 found `handleDateSelect` sets `selectedDate` and clears `selectedTime` but does NOT programmatically focus the slot list. The W1-11-A3 fix (L2498–2503) only makes the first non-elapsed slot *tabbable* (tabIndex=0), not *focused*. Keyboard users must Tab through every remaining date cell before reaching slots.
- **Wave 2 Verification:** W2-27 ✅ CONFIRMED (`handleDateSelect` has zero `.focus()` calls and no rAF). W2-29 ✅ CONFIRMED.
- **Recommended Fix:** In `handleDateSelect`, schedule focus to the first available slot via rAF after the slot list re-renders.
- **Status: Completed** — `handleDateSelect` now issues a tracked rAF (same `focusRafRef` cancellation pattern as `moveFocus`) that focuses the first `button[role='radio']:not([disabled])` in the widget root after the slot list re-renders.

#### Additional Verified-Sync Issues (LOW)
- W1-09-DT-TzToday (MEDIUM): `today = startOfDay(new Date())` at L3187 uses browser-local even when `timeZone` prop is set. Cascades to `isTimeElapsed` (L3034–3056) which uses `isSameDay(selectedDate, today)` — tz-shifted `selectedDate` causes all slots to appear available including elapsed ones. Fix: compute `today` in the visitor's tz via `getDateKeyInTimeZone`. — **✅ FIXED**: new `getTodayInTimeZone()` helper (tz-local y/m/d as a local-midnight Date, so all existing `isSameDay`/`startOfDay` comparisons stay valid); `today` state + the midnight-rollover effect now use it and the effect re-runs on `timeZone` change.
- W1-09-DT-StaleSelected (LOW): If `selectedDate` becomes mid-session-unavailable, `selectedOrFirstDateKey` still returns it (L3422–3428). `CalendarCell`'s `tabIndex={isUnavailable ? -1 : tabIndex}` (L1422) override then leaves no `tabIndex=1` cell — Tab order breaks. — **✅ FIXED**: `selectedOrFirstDateKey` only accepts `selectedDate` while `hasKnownAvailability(selectedDate)`; otherwise falls through to `firstAvailableDate` (→ EmptyMonth heading fallback if none).
- W1-09-DT-03 (LOW, prior-cycle still open): `firstDayOfWeek` uses `navigator.language` (L2643) while `weekdayLabels`/`monthName` use `pageLocale()` (L644, L2623). Mismatched locales can misalign weekday header vs grid offset. — **✅ FIXED**: `firstDayOfWeek` now reads `pageLocale()` like the labels it must agree with.
- W1-09-DT-10 (LOW, prior-cycle still open): TimeSlotList radiogroup (L2421–2455) handles only Arrows; no Home/End per WAI-ARIA radiogroup pattern. — **✅ FIXED**: Home/End jump to the first/last non-elapsed slot and select it.
- W1-09-DT-SR (LOW): Selected slot's `aria-label` (L2060) omits the date — SR users hear "9:00 AM, [tz], radio, checked" with no date context. — **✅ FIXED**: `slotDateLabel` (short weekday/month/day via `pageLocale()`) is folded into every slot's aria-label, e.g. "9:00 AM, Tue, Aug 16, America/New_York".

---

### Category 8 — Session Persistence & Privacy (5 issues)

#### Issue W1-12-F-12-11 — `hasSavedProgress` Not Set on Restore Path (MEDIUM, GDPR regression)
- **Severity:** 🟡 Medium
- **Location:** L6429–6600 (restore effect)
- **Wave 1 Discovery:** Sub-Agent 12 found `hasSavedProgress` is never set `true` on the restore path (only on the next persist write at L6680). After a refresh with saved data, the "Clear my saved answers" button and "Answers are saved in this browser" indicator are **hidden** until the visitor types something new — directly contradicting the W2-31-A-31-3 GDPR self-service intent.
- **Wave 2 Verification:** W2-31 ✅ CONFIRMED.
- **Recommended Fix:** Add `setHasSavedProgress(true)` before L6582 (end of successful restore).
- **Status: Completed** — `setHasSavedProgress(true)` now fires at the end of the successful restore path (~L6696), so the disclosure + clear affordance appear immediately after refresh with saved data.

#### Issue W1-12-F-12-12 — `validateStep` Datetime Branch Throws on Corrupted Slot (MEDIUM, data loss)
- **Severity:** 🟡 Medium
- **Location:** L4685
- **Wave 1 Discovery:** Sub-Agent 12 found `validateStep`'s datetime branch calls `slot.date.getTime()` without guarding for `undefined`. If a corrupted `__selectedSlot` is present but missing `date` (and `time24h` doesn't match the ISO regex), this throws `TypeError`. The restore effect's catch block (L6583) then purges **ALL** saved storage — data loss from a single corrupted nested field.
- **Wave 2 Verification:** W2-31 ✅ CONFIRMED.
- **Recommended Fix:** Guard L4685 with `instanceof Date`:
```typescript
if (!(slot?.date instanceof Date) || isNaN(slot.date.getTime())) {
  return "datetime" // or whatever the appropriate invalid code is
}
```
- **Status: Completed** — the datetime branch (~L4709) now computes `slotDateMs` with an `instanceof Date` + `isNaN` guard; a slot with neither a valid ISO `time24h` nor a valid `date` yields `pickDateTimeError` instead of throwing (no more full-storage purge from one corrupt field).

#### Issue W1-15-TS-02 — `JSON.parse` Output Cast to `BookingValues` Without Validation (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L6494 & L6572
- **Wave 1 Discovery:** Sub-Agent 15 found `JSON.parse` output (`Record<string, unknown>`) cast wholesale to `BookingValues` without per-field validation. The `__selectedSlot` sub-key is re-narrowed separately, but every other field value flows into typed state unvalidated. Corrupt/hostile sessionStorage entry could put arrays/objects in field values.
- **Wave 2 Verification:** W2-31 ✅ CONFIRMED. Mitigated downstream by `String()` coercion + schema-version purge, but not blocked at the boundary. W2-34 ✅ CONFIRMED Framer-compatible.
- **Recommended Fix:** Add a per-field `isFieldValue` narrow before merging `JSON.parse` output into state:
```typescript
function isFieldValue(v: unknown): v is string | boolean | undefined {
  return v === undefined || typeof v === "string" || typeof v === "boolean"
}
// Then: Object.fromEntries(Object.entries(parsed).filter(([k, v]) => isFieldValue(v)))
```
- **Status: Completed** — `isFieldValue` narrow added next to `BookingValues` (~L1945); the restore merge (~L6600) filters every entry through it, exempting `SELECTED_SLOT_KEY` (the one structured key, re-narrowed separately). Arrays/objects can no longer enter typed field state from sessionStorage.

#### Issue W1-12-F-12-13 — Persisted JSON Writes `__selectedSlot` Twice (LOW)
- **Severity:** 🟢 Low
- **Location:** L6670
- **Wave 1 Discovery:** Sub-Agent 12 found the persisted JSON writes `__selectedSlot` **twice**: inside `values` AND at the top level (L6670). The restore only reads `parsed.values` (L6472), so the top-level copy is ~100–200 bytes of dead weight per write.
- **Wave 2 Verification:** W2-31 ✅ CONFIRMED (~76 bytes/write).
- **Recommended Fix:** Delete L6670.
- **Status: Completed** — the duplicate top-level `[SELECTED_SLOT_KEY]` write is removed from the persist payload (~L6778).

#### Issue W1-12-F-12-14 — Restore Loop Iterates Without Upper Bound (LOW)
- **Severity:** 🟢 Low
- **Location:** L6566
- **Wave 1 Discovery:** Sub-Agent 12 found the restore validation loop iterates up to `parsed.currentIndex` even when only 3 steps exist. The input check validates `>= 0` and `Number.isFinite` but has no upper bound. A hand-crafted entry with `currentIndex = 1000000` would loop a million times.
- **Wave 2 Verification:** W2-31 ✅ CONFIRMED. Same-origin DoS vector.
- **Recommended Fix:** `Math.min(parsed.currentIndex, activeSteps.length)` before the loop.
- **Status: Completed** — `restoredIndex` is clamped with `Math.min(parsed.currentIndex, activeSteps.length)` before the re-validation loop (~L6673).

#### Verified Clean (Session Persistence)
W2-31 confirmed:
- ✅ PII storage is opt-in only (`persistState = props.persistState === true`, default OFF at L11873)
- ✅ Per-instance key via `useId()` (L6055; key `booking-engine:${reactInstanceId}` at L6433–6436)
- ✅ `sessionStorage` (not `localStorage`) — clears on tab close
- ✅ Cleared on successful submit (L6633–6647)
- ✅ Clear button present (L7624–7636)
- ✅ XSS surface is ZERO — no `dangerouslySetInnerHTML`/`innerHTML`/`eval`/`new Function` (0 hits); all values flow through React JSX auto-escaping
- ✅ PII not leaked to console/analytics (9 console sites log static messages + err only; `booking_submitted` payload carries `slotStart` + `calEventTypeId` only)
- ✅ All 7 `sessionStorage` access points triple-guarded (`persistState` + `typeof window` + `isStaticRender`)
- ✅ `JSON.parse` wrapped in try/catch
- ✅ `setItem` wrapped in try/catch for QuotaExceededError (with `saveFailedOnce` notice)
- ✅ 300ms debounce on persist-write
- ✅ **sessionStorage restore re-validation** (prior critical #5): ✅ FIXED — L6554–6581 loops `validateStep` over every prior step

---

### Category 9 — Performance & Memoization (5 issues)

#### Issue W1-16-P-13 — `TimeSlotList` O(N²) `isTimeElapsed` Calls Per Render (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L2498–2503
- **Wave 1 Discovery:** Sub-Agent 16 found `isInitialFocus={selectedTime === null && timeOptions.findIndex((t) => !isTimeElapsed(t)) === timeOptions.indexOf(time)}` is computed **inside** the per-slot `.map()`. When `selectedTime === null` (the state on every freshly-picked date), this triggers N² `isTimeElapsed` calls per render — for a 48-slot day, ~2,304 `Date` constructions per render, re-running every 60-second `now`-tick.
- **Wave 2 Verification:** W2-35 ✅ CONFIRMED + net-benefit-verified (memo overhead ~1:10,000 vs saved cost). HIGH benefit.
- **Recommended Fix:**
```typescript
// Compute firstNonElapsedIndex once via useMemo outside the .map:
const firstNonElapsedIndex = useMemo(
  () => timeOptions.findIndex((t) => !isTimeElapsed(t)),
  [timeOptions, nowTick] // or whatever the elapsed-check dep is
)
// Then in the .map: isInitialFocus={selectedTime === null && firstNonElapsedIndex === index}
// Use .map((time, index) => …) instead of .indexOf(time).
```
- **Status: Completed** — `firstNonElapsedIndex` computed once per render (useMemo on `[timeOptions, isTimeElapsed]`) above the JSX (~L2206); the slot map now takes `(time, index)` and compares `firstNonElapsedIndex === index`. O(N²) per render → O(N).

#### Issue W1-16-P-14 — `getReadableTextColor` Called Inline Twice (LOW)
- **Severity:** 🟢 Low
- **Location:** L8756 (submit-button color), L8778 (submit-spinner border)
- **Wave 1 Discovery:** Sub-Agent 16 found `getReadableTextColor(theme.accentColor)` called inline twice in `BookingEngine`'s main render. Not memoized; recomputed per keystroke/hover/minute-tick. Contradicts the file's own pattern at L842 and L3334 (both `useMemo`'d on `accentColor`).
- **Wave 2 Verification:** W2-35 ✅ CONFIRMED. Note: L8778 only runs during submit. Net benefit LOW (saving ~0.005ms/render), but code-consistency improvement.
- **Recommended Fix:** Single `useMemo` on `theme.accentColor`:
```typescript
const accentTextColor = useMemo(() => getReadableTextColor(theme.accentColor), [theme.accentColor])
```
- **Status: Completed** — single `accentTextOnSurface` memo added in `BookingEngine` (~L8210); submit-button color and spinner-border now reference it.

#### Issue W1-16-P-15 — `moveFocus` Cascade to 42 Cells on Every Cal.com Fetch (LOW-MEDIUM)
- **Severity:** 🟢 Low-Medium
- **Location:** L3582 (`moveFocus` useCallback dep `hasKnownAvailability`)
- **Wave 1 Discovery:** Sub-Agent 16 found `moveFocus` useCallback dep `hasKnownAvailability` changes identity on every Cal.com fetch (via `availableDates`). The new `moveFocus` identity propagates to `CalendarGrid`'s `onMoveFocus` prop, breaking all 42 `CalendarCell`s' memos per fetch.
- **Wave 2 Verification:** W2-22 ✅ CONFIRMED REAL (React does NOT coalesce parent-side `useCallback` rebuilds). W2-35 ✅ CONFIRMED. Acceptable cost (~5–10ms), improvable via a `latestRef`.
- **Recommended Fix (option a — ref pattern):**
```typescript
const hasKnownAvailabilityRef = useRef(hasKnownAvailability)
hasKnownAvailabilityRef.current = hasKnownAvailability
const moveFocus = useCallback((/* args */) => {
  // use hasKnownAvailabilityRef.current instead of hasKnownAvailability
}, []) // empty deps
```
- **Status: Completed** — `hasKnownAvailabilityRef` (latestRef pattern) declared in `DateAndTimeInline` immediately above `moveFocus`; the callback reads `hasKnownAvailabilityRef.current(target)` and its dep array is now `[today, visibleMonth, dateKeyOf, maxMonthStart]` — the fetch-unstable `hasKnownAvailability` is gone, so `onMoveFocus` identity holds across every Cal.com fetch and the 42 `CalendarCell` memos survive. (The `hasAvailability` prop into `CalendarGrid` still changes per fetch — intentional, since cell disabled-state genuinely changes then.)

#### Issue W1-14-F1 — `getPayload` Missing `amLabel`/`pmLabel` Deps (HIGH, see SYN-09)
- **Status: Completed** — `getPayload`'s dep array (L3526) now includes `amLabel`/`pmLabel`; author AM/PM copy edits immediately flow into review/confirmation/ICS labels. (SYN-09 in the Top 10 refers to this issue.)
- Already covered as SYN-09 in Top 10.

#### Issue W1-14-F2 — `handleSubmitBooking` Missing `copy` Dep (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L7189
- **Wave 1 Discovery:** Sub-Agent 14 found `handleSubmitBooking` `useCallback` missing `copy` dep. Reads 5 copy strings (`notesSelectedTimeLabel`, `notesDatePrefix`, `notesTimePrefix`, `unknownErrorLabel`, `errorFallbackMessage`). Stale strings get POSTed to Cal.com server-side — worst place to surface staleness. Same class of bug as W2-33-A2 fixed for `fallbackErrorLabel`.
- **Wave 2 Verification:** W2-21 ✅ CONFIRMED.
- **Recommended Fix:** Add `copy` to deps array at L7189.
- **Status: Completed** — `copy` is present in `handleSubmitBooking`'s dep array (verified at current ~L8012, with the explicit W1-14-F2 comment); all 5 copy reads (`notesSelectedTimeLabel`, `notesDatePrefix`, `notesTimePrefix` at ~L7886–7888, `unknownErrorLabel`/`errorFallbackMessage` at ~L7985–7988) plus the `errorCopy` reads are covered. No re-fix required this cycle.

#### Issue W1-14-F7 — Textarea Auto-Resize Should Be `useLayoutEffect` (LOW)
- **Severity:** 🟢 Low
- **Location:** L9642–9654
- **Wave 1 Discovery:** Sub-Agent 14 found `FieldRenderer` textarea auto-resize is a `useEffect` doing synchronous DOM measurement+write (`clientHeight`/`scrollHeight`/`style.height`). Causes one-frame flicker on each keystroke. Should be `useLayoutEffect`.
- **Wave 2 Verification:** W2-21 ✅ CONFIRMED.
- **Recommended Fix:** Change `useEffect` to `useLayoutEffect` at L9642.
- **Status: Completed** — `FieldRenderer`'s textarea auto-resize is `React.useLayoutEffect` (verified at current ~L10493, with the explicit W1-14-F7 comment), so measurement+write happens in the same commit as the value change — no stale-height frame. The prior-cycle W2-37-A2 no-write-until-shrink mitigation is also still in place above it.

#### Verified Clean (Performance + Memory)
W2-30 confirmed **100% cleanup coverage** across all 30 resource registrations (0 memory leaks):
- ✅ All 2 `ResizeObserver` instances disconnected in cleanup
- ✅ All 1 `setInterval` cleared (60s tick at L3031)
- ✅ All 6 `setTimeout` cleared (in cleanup or `.finally`)
- ✅ All 7 `addEventListener` have matching `removeEventListener`
- ✅ All 4 `requestAnimationFrame` call-sites cancelled
- ✅ All 3 `AbortController` instances aborted (Cal.com fetch + submit)
- ✅ `matchMedia` listener removed (+ legacy `removeListener` fallback)
- ✅ `visualViewport` resize handler (W1-19-F7 fix) properly cleaned up

W2-35 confirmed:
- ✅ All 12 leaf components `React.memo`'d
- ✅ 42-cell `calendarCells`, `timeOptions`, `parsedOptions`, `theme`, `fontStack`, `progressAnimate` all `useMemo`'d
- ✅ All `StepBody` callbacks are stable `useCallback`'d (W1-14-F3 fix holds)
- ✅ Per-keystroke in field A does NOT re-render field B (FieldRenderer's own React.memo + primitive value prop)

---

### Category 10 — Color Theme & Animation (5 issues)

#### Issue W1-17-F17-N1 — `parseColorToRgba` Drops Alpha in Legacy Comma Syntax (MEDIUM-HIGH)
- **Severity:** 🟡 Medium-High
- **Location:** L102–231 (rgba branch L130–166, hsla branch L198–220)
- **Wave 1 Discovery:** Sub-Agent 17 found `parseColorToRgba` silently drops the alpha channel in legacy comma-syntax `rgba(R,G,B,A)` and `hsla(H,S%,L%,A)`. The parser splits on `/` to separate channels from alpha (modern CSS slash syntax), so when no slash is present the alpha lands in `tokens[3]` and is never read. `rgba(255, 0, 0, 0.5)` returns `{r:255,g:0,b:0,a:1}` (opaque). The F-17-2 comment at L97–99 explicitly promises "comma or modern space+slash syntax", so this is a contract violation.
- **Wave 2 Verification:** W2-21 ✅ CONFIRMED via direct read (L198 `inner.split("/")` only handles modern slash syntax). W2-36 ✅ CONFIRMED + manual computation.
- **Recommended Fix:** Add `?? tokens[3]` fallback to the alpha-token derivation in both branches (L157, L220):
```typescript
// In rgba branch (L220):
const alphaToken = alphaPart ?? tokens[3]
// In hsla branch (L157):
const alphaToken = alphaPart ?? tokens[3]
```
- **Status: Completed** — both branches now derive `alphaToken` as `(alphaPart?.trim() || tokens[3] || "").trim()`, so legacy comma syntax keeps its alpha; modern slash syntax is untouched, and three-channel `rgb()`/`hsl()` still default to `a = 1`.

#### Issue W1-17-F17-N2 — `getReadableTextColor` Composites Over Hardcoded WHITE (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L282–284
- **Wave 1 Discovery:** Sub-Agent 17 found `getReadableTextColor` composites translucent inputs over hardcoded **WHITE**, but in dark mode the actual backdrop is `#0F1115`/`#1A1D23`. A translucent white accent (`rgba(255,255,255,0.5)`) mis-judges as opaque-white, picks black text, which is unreadable on the dark surface it actually renders on.
- **Wave 2 Verification:** W2-36 ✅ CONFIRMED. Manual computation: `rgba(255,255,255,0.3)` on `#0F1115` returns `#000000` but actual composite RGB(87,88,91) gives black **2.97:1 ❌ AA FAIL**; white would give 7.08:1 ✅. **Function is wrong here.**
- **Recommended Fix:** Add optional `backdrop` argument (default `#FFFFFF`), pass `theme.backgroundColor` from the `themeVerdicts` callsite.
- **Status: Completed** — `getReadableTextColor(background, backdrop?)` now composites over the given backdrop (default `#FFFFFF` preserved for the picker's other light-first uses); the `themeVerdicts` callsite passes `theme.backgroundColor`. Dark-mode translucent accents now get honest verdicts (the W2-36 example `rgba(255,255,255,0.3)` on `#0F1115` correctly picks white, 7.08:1 ✅).

#### Issue W2-36-N1 (NEW) — Default Dark-Theme Accent Fails AA-Text on Dark Backgrounds (MEDIUM)
- **Severity:** 🟡 Medium
- **Location:** L4180–4199 (`DEFAULT_DARK_THEME` with accent `#0066BB`)
- **Wave 1 Discovery:** (Not in Wave 1 — discovered by W2-36.)
- **Wave 2 Discovery:** W2-36 found the default dark-theme accent `#0066BB` fails AA-text on the dark backgrounds it renders on: **3.26:1** on `#0F1115` (fails 4.5:1 text, passes 3:1 UI) and **2.91:1** on `#1A1D23` (fails even §1.4.11 UI 3:1). Hidden by F17-N5's missing pairs.
- **Recommended Fix:** Brighten dark-theme accent (e.g., `#3B82F6` → 4.7:1) OR add the missing pairs to `themeVerdicts`.
- **Status: Completed** — `DEFAULT_DARK_THEME.accentColor` is now `#3B82F6` (blue-500): ~5.1:1 on `#0F1115`, ~4.5:1 on `#1A1D23` (AA ✅). The F-17-1 auto picker flips the on-accent text to black (~5.7:1) — consistent with the picker contract. Light mode keeps `#0066BB`; the dark-mode `pick()` override only swaps canvases still holding the light default, existing instances keep their values.

#### Issue W1-17-F17-N5 — `themeVerdicts` Missing Contrast Pairs (LOW)
- **Severity:** 🟢 Low
- **Location:** L6925–6932
- **Wave 1 Discovery:** Sub-Agent 17 found `themeVerdicts` omits `error`/`success`-on-surface and `accent`-on-page/surface pairs.
- **Wave 2 Verification:** W2-36 ✅ CONFIRMED (6 pairs present; 4 missing).
- **Recommended Fix:** Add the 4 missing pairs.
- **Status: Completed** — the `themeVerdicts` pairs array now also covers `error on surface`, `success on surface`, `accent on page`, and `accent on surface` (10 pairs total; the accent-on-page pair is what W2-36-N1 caught).

#### Issue W1-18-F-1 / W1-18-F-2 — Two Animations Use Layout Properties Instead of Transforms (LOW)
- **Severity:** 🟢 Low
- **Location:** L2222 (12h/24h toggle animates `left`), L7739 + L8433–8447 (progress-bar fill animates `width`)
- **Wave 1 Discovery:** Sub-Agent 18 found two animations use layout properties (`left`, `width`) instead of GPU-friendly transforms (`x`, `scaleX`). Both are reduced-motion gated and bounded (discrete positions / step-change only), so impact is minimal.
- **Wave 2 Verification:** W2-37 ✅ CONFIRMED. No layout thrashing risk (no `getBoundingClientRect` in render loops; `clientWidth`/`clientHeight`/`scrollHeight` only in effects).
- **Recommended Fix:**
  - L2222: swap `left` → `x` with `translateX(3px)` baseline
  - L7739 + L8433: swap `width` → `scaleX(progressPct/100)` with `transformOrigin: "left center"`
- **Status: Completed** —
  - **12h/24h toggle (F-1):** slider now sits at a constant `left: 3` and animates a composited `x: "calc(100% + 3px)"` for 24h (motion branch, `initial={false}` preserved); the static-render branch uses the equivalent CSS `transform: translateX(calc(100% + 3px))`. Final position is pixel-identical to the old `left: "50%"` (thumb `calc(50% - 6px)` + translateX(100%+3) ≡ `left: 50%` on the padding box).
  - **Progress bar (F-2):** `progressAnimate` memo now emits `{ scaleX: progressPct / 100 }`; the fill element is full-width with `transformOrigin: "left center"`. The static-render fill uses `transform: scaleX(...)` on a full-width bar instead of `width: %`. Visually identical (bar is a solid-color 999-radius pill; the tiny corner-rounding stretch at <100% is sub-pixel for a 999 pill), and layout no longer runs per spring frame.

#### Verified Clean (Color & Animation)
W2-36 and W2-37 confirmed:
- ✅ `WCAG_TEXT_PICK_THRESHOLD = 0.1791` (L274) is mathematically exact: `(L+0.05)² = 0.0525 → L = 0.17913`. At the tie both contrasts = 4.583:1, above AA.
- ✅ `srgbToLinear` uses WCAG 2.1's `0.03928` (not CSS Color 4's `0.04045`) — correct for the targeted spec.
- ✅ Auto color mode: no FOUC (synchronous lazy initializer reads `matchMedia` before first paint, T10-M6), live-updating on OS theme change via `addEventListener("change", ...)`, subscription gated to `"auto"` only.
- ✅ Three-layer reduced-motion defense comprehensive: `MotionConfig reducedMotion="user"` (L8891) + 7 `useReducedMotion()` call sites + CSS `@media (prefers-reduced-motion: reduce)` rule (L8908–8914)
- ✅ `AnimatePresence` correctly configured: `mode="popLayout"` + `initial={false}` at L8508
- ✅ `AnimatedStepContent` uses `usePresence()` to `aria-hidden` the exiting step
- ✅ `stepTransition` reduced-motion branch takes precedence over author customization
- ✅ All 9 inline-CSS `transition:` declarations animate only paint/composite properties (color, background-color, border-color, box-shadow, opacity)
- ✅ Zero `layoutId` usage anywhere — zero mismatch risk
- ✅ No `getBoundingClientRect` in render loops — no layout thrashing

---

### Category 11 — TypeScript Rigor (6 issues)

#### Issue W1-15-TS-01 — Implicit `any` in `.catch((err) => ...)` (LOW)
- **Severity:** 🟢 Low
- **Location:** L5062
- **Wave 1 Discovery:** Sub-Agent 15 found `.catch((err) => ...)` where `err` is implicit **`any`** (Promise lib types). Reads `err?.name`, `err?.status`, `err?.message` compile only because of that. Every other catch in the file is explicitly `catch (err: unknown)`.
- **Wave 2 Verification:** W2-21 ✅ CONFIRMED. W2-34 ✅ CONFIRMED Framer-compatible.
- **Recommended Fix:** `(err: unknown) => ...` at L5062.
- **Status: Completed** — the single `.catch` in the file is now `(err: unknown) => ...` (~L5596, with the explicit W1-15-TS-01 comment); the body narrows once through a typed view (`errObj`) before reading `name`/`status`/`message`/`retryAfterSeconds`. File-wide sweep confirms every `catch` is `catch (err: unknown)` — no implicit `any` remains.

#### Issue W1-15-TS-06 — `new Date(restoredSlot.date as string)` Unsafe Cast (LOW)
- **Severity:** 🟢 Low
- **Location:** L6483
- **Wave 1 Discovery:** Sub-Agent 15 found `new Date(restoredSlot.date as string)` casts `unknown` → `string` without `typeof` narrowing. A non-string, non-Date value yields an `Invalid Date` rather than a clean rejection.
- **Wave 2 Verification:** W2-21 ✅ CONFIRMED. W2-34 ✅ CONFIRMED Framer-compatible. Runtime-safe due to `instanceof Date` guard + try/catch — cosmetic type lie.
- **Recommended Fix:** Use `typeof` narrow:
```typescript
new Date(typeof restoredSlot.date === "string" ? restoredSlot.date : "")
```
- **Status: Completed** — the restore-path re-hydration (~L7077) is now exactly the recommended `new Date(typeof restoredSlot.date === "string" ? restoredSlot.date : "")`; the ternary returns a `Date` either branch, so the following `.getTime()` NaN check is type-clean (the prior partial fix could fall through to `new Date(unknown)` / throw a `.getTime()` TypeError on non-string junk; both now reject via the Invalid-Date + NaN guard).

#### Issue W1-15-TS-08 — Ad-hoc `Error & { status?; retryAfterSeconds? }` Casts Duplicated (LOW)
- **Severity:** 🟢 Low
- **Location:** L4971, L5108, L5430
- **Wave 1 Discovery:** Sub-Agent 15 found three ad-hoc `Error & { status?; retryAfterSeconds? }` casts duplicated. A named `HttpFetchError` class would DRY this and enable `instanceof` narrowing.
- **Wave 2 Verification:** W2-34 ✅ CONFIRMED Framer-compatible.
- **Recommended Fix:** Define a named class:
```typescript
class HttpFetchError extends Error {
  constructor(public status?: number, public retryAfterSeconds?: number, message?: string) {
    super(message)
    this.name = "HttpFetchError"
  }
}
// Then `if (err instanceof HttpFetchError)` instead of ad-hoc casts.
```
- **Status: Completed** — named `class HttpFetchError extends Error { status?: number; retryAfterSeconds?: number }` declared next to the Cal.com controller constants (~L5277); the slots GET now `throw new HttpFetchError("HTTP {status}", res.status, retryAfterSeconds)` (no `as Error & {...}` cast, Retry-After parsed into the constructor); the fetch catch narrows via `err instanceof HttpFetchError` for `status`/`retryAfterSeconds` and `err instanceof Error` for the timeout/malformed-JSON path. The one remaining cast (`Error & { code?; errorCode? }` in `submitCalcomBooking`'s catch) is a different shape — Cal.com body error fields, not HTTP transport fields — and stays as-is per the audit's scoping.

#### Issue W1-15-TS-07 — `FieldConfig` Flat Interface (INFO, do NOT fix)
- **Severity:** ⚪ Info
- **Location:** L3840
- **Wave 1 Discovery:** Sub-Agent 15 suggested converting `FieldConfig` to a discriminated union on `fieldType`.
- **Wave 2 Verification:** W2-34 ❌ REJECTED the proposed fix — converting `FieldConfig` to a discriminated union would break TS-runtime fidelity with Framer's `ControlType.Array` of `ControlType.Object` (L11104–11116), which emits ONE Object shape per item. Framer can ship a `checkbox` carrying leftover `options` (hidden controls don't strip values), so a TS discriminant would lie about runtime shape. The current flat interface is the correct Framer-idiomatic design; the 12+ `hidden` callbacks in `makeFieldObjectControls()` are the panel-level equivalent of discriminant enforcement.
- **Recommended Action:** No change. Acceptable as-is.
- **Status: False Positive** — Wave 2 already rejected the proposed fix: converting `FieldConfig` to a discriminated union would break TS-runtime fidelity with Framer's `ControlType.Array` of `ControlType.Object` (hidden controls don't strip values, so a discriminant would lie about the shape Framer actually ships). Verified no code change is warranted; the flat interface + `hidden` callbacks remain the correct Framer-idiomatic design.

#### Issue W1-15-TS-09 — Redundant `?.` After `as` Cast (COSMETIC)
- **Severity:** ⚪ Cosmetic
- **Location:** L5108
- **Wave 1 Discovery:** Sub-Agent 15 labeled `?.` after `as` cast as "dead syntax".
- **Wave 2 Verification:** W2-21 ⚠️ REFINED — the `?.` retains defensive runtime behavior (the `as` cast has no runtime effect; `err` could still be null/undefined). Should be relabeled "statically-redundant-but-defensive".
- **Recommended Action:** Optional cleanup. No change needed.
- **Status: Stale / Skipped** — verified against the current source: the only remaining intersection cast is `err instanceof Error ? (err as Error & { code?: string; errorCode?: string }) : null` in `submitCalcomBooking`'s catch, and the `?.` reads after it (`errObj?.name`, `errObj?.code`, `errObj?.errorCode`) are NOT redundant — `errObj` is `null` when the thrown value isn't an `Error` (e.g. a string throw or a non-Error rejection), so the optional chaining retains real defensive behavior exactly as W2-21 refined. No change applied (audit said optional; the TS-08 HttpFetchError fix left this cast intentionally untouched).

#### Verified Clean (TypeScript)
W2-34 confirmed:
- ✅ All 30 `useRef` calls have explicit generics
- ✅ All `hidden()` callbacks use `Pick<>`/`Partial<>` slices, not `p: any`
- ✅ All event handlers correctly typed (one explicit `React.KeyboardEvent<HTMLButtonElement>` at L883; all inline JSX callbacks use React's contextual typing)
- ✅ `BookingPayload.end` properly typed as `end?: string` (ISO) at L1915
- ✅ All 24 Framer top-level controls have corresponding TS interface declarations
- ✅ No `@ts-ignore` / `@ts-expect-error` usage
- ✅ No explicit `any` types (after W1-15-TS-01 fix)
- ✅ No non-null assertions (`!.`)

---

### Category 12 — Mobile & Touch Ergonomics (4 issues)

#### Issue W1-19-N1 — Calendar Cell Touch Target Below 44px on ≤329px Viewports (MEDIUM)
- **Severity:** 🟡 Medium (WCAG 2.5.5)
- **Location:** L1486 (`minWidth: TOUCH_TARGET_MIN` = 44)
- **Wave 1 Discovery:** Sub-Agent 19 found the F-01 fix made the grid track shrinkable (`minmax(0, 1fr)` at L1865), but the cell button at L1486 still has `minWidth: 44`. When track < 44 (37–43px on 280–329px viewports), cells overlap; the next cell (later in DOM, painted on top) covers the previous cell's right overflow. Effective click width is the track width, not 44px.
- **Wave 2 Verification:** W2-38 ✅ CONFIRMED + refined math (Wave 1 understated the shortfall — Wave 1 omitted the 12px section padding at L3677). Actual track width on iPhone SE (320px) is **38.86px (5.14px short)**; on Galaxy Fold cover (280px) it's **33.14px (10.86px short)**. Crossover to ≥44px happens at viewport ≥356px.
- **Recommended Fix:**
```typescript
// At L1486, change:
minWidth: TOUCH_TARGET_MIN
// to:
minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN
// (where isNarrow is the existing measuredWidth < 360 check)
```
- **Status: Completed** — exactly that: `minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN` on the CalendarCell button (`isNarrow` was already threaded into CalendarGrid→CalendarCell). On narrow containers the grid track itself is the honest target — nothing overlaps and no effective target shrinks.
  - **Pass-2 addendum (2026-08-16):** tsc verification found the prop had NOT actually been threaded through — `isNarrow` was used inside `CalendarCell` but absent from `CalendarCellProps`, the destructure, and the CalendarGrid call site (TS2304). All three sites now thread it; compiles clean.

#### Issue W1-19-N2 — Checkbox Field Touch Target Below 44px (MEDIUM)
- **Severity:** 🟡 Medium (WCAG 2.5.5)
- **Location:** L9941–9986 (FieldRenderer `case "checkbox"` label)
- **Wave 1 Discovery:** Sub-Agent 19 found the FieldRenderer `case "checkbox"` label has no `minHeight`. For single-line labels, touch target is ~20px tall. Below WCAG 2.5.5.
- **Wave 2 Verification:** W2-38 ✅ CONFIRMED.
- **Recommended Fix:** Add `minHeight: TOUCH_TARGET_MIN` to the label (precedent: F-03 Edit button).
- **Status: Completed** — the checkbox label row now has `minHeight: TOUCH_TARGET_MIN` (the whole label is the tap target, same precedent as the F-03 Edit button).

#### Issue W1-19-N3 — Form-Grid `@media` Uses Viewport Width Instead of Container Width (LOW)
- **Severity:** 🟢 Low / Refactor
- **Location:** L8819
- **Wave 1 Discovery:** Sub-Agent 19 found the form-grid `@media (max-width: 768px)` rule uses VIEWPORT width, not CONTAINER width. Every other responsive decision in the file uses `measuredWidth` via ResizeObserver. Embeds in narrow desktop sidebars stay 2-col.
- **Wave 2 Verification:** W2-38 ✅ CONFIRMED.
- **Recommended Fix:** Hoist `measuredWidth` to engine level, drop the `@media` rule.
- **Status: Completed** — the engine now measures RootShell via ResizeObserver (`engineWidth`, same pattern as L757/L3511); `StepBody` receives it and both form grids collapse to 1-col below `COMPACT_BREAKPOINT` (768, the file-wide container threshold). The `@media (max-width: 768px)` rule is deleted. Narrow-desktop-sidebar embeds now collapse correctly; wide containers on small viewports keep 2-col.

#### Issue W1-19-N4 — `env(safe-area-inset-bottom)` Fallback Inconsistency (LOW)
- **Severity:** 🟢 Low
- **Location:** L8505 (has `0px` fallback), L8680 (no fallback)
- **Wave 1 Discovery:** Sub-Agent 19 found inconsistent `env(safe-area-inset-bottom)` fallbacks.
- **Wave 2 Verification:** W2-38 ✅ CONFIRMED.
- **Recommended Fix:** Add `0px` fallback at L8680 for consistency. 4-character fix.
- **Status: Completed** — `env(safe-area-inset-bottom, 0px)` now matches the submit bar; the sticky step-footer keeps its padding on non-notch browsers.

#### Verified Clean (Mobile)
W2-38 confirmed:
- ✅ Prior W1-19-F-01 fix (calendar grid template `minmax(0, 1fr)` at L1865) IS in place — Saturday column no longer clipped
- ✅ All other Wave 1 F-01 through F-17 fixes verified in code
- ✅ 18 of 20 interactive elements meet WCAG 2.5.5 (44×44px). Two outliers: N1 (calendar cell) and N2 (checkbox label).
- ✅ No horizontal overflow on ≤320px viewports
- ✅ No `100vh`/`100vw` anywhere (RootShell uses `height: "auto"`)
- ✅ Input font-size ≥16px on mobile (prevents iOS auto-zoom) — F-02 fix at L9710–9721, L9736, L9339–9344
- ✅ `visualViewport` keyboard handler (F-07 fix) textbook implementation at L6136–6178

---

## FALSE POSITIVES DISMISSED IN WAVE 2 (8 findings)

| # | Finding | Original Severity | Native Mitigation |
|---|---|---|---|
| 1 | **W1-04-F-2** `navigatingRef` wedge | LOW-MED → INFO | React 18 flushes state between separate event-handler tasks; sub-frame (~16ms) double-click is automation-only; self-recovering via `handleBack` on non-zero steps; release effect fires on next genuine `safeCurrentIndex` change. |
| 2 | **W1-04-F-7** Continue `onClick`+`onSubmit` double-invocation | LOW → INFO | React 18 automatic batching coalesces both calls' state updates into one render; second call early-returns via `navigatingRef`; redundant work is one pure `validateStep` (microseconds). |
| 3 | **W1-08-F-08-02 cascade claim** (HIGH → LOW) | HIGH → LOW | **Incorrect cascade model**: ChoiceGroupInline's parent is `FieldRenderer` (itself `React.memo`'d at L9620), not BookingEngine. Per-keystroke in field A does NOT re-render field B's FieldRenderer. The "every parent render" cascade doesn't exist. **However**, the memo IS still defeated at FieldRenderer re-render (real issue, kept as LOW). |
| 4 | **W1-14-F4** persist-restore missing `activeSteps`/`validationCopy` deps | LOW → hygiene | Mount-only effect by design; deps stable post-mount; captured first-render closure is intentional restore-on-mount semantic. |
| 5 | **W1-14-F8** handlers omit stable helpers from deps | LOW → hygiene | React guarantees `useState` setter stability (lifetime) and `useCallback([])` stability. Safe by React's invariants. |
| 6 | **W1-14-F9** `navigatingRef` release effect on first mount | INFO | Standard React effect behavior; ref already `false` at L7044 init — no-op. |
| 7 | **W1-09-DT-Locale** `pageLocale()` called inline | LOW → INFO | `pageLocale()` returns primitive `string\|undefined`; `React.memo`'s `Object.is` value-compares strings — memo holds. Self-acknowledged cosmetic. |
| 8 | **W1-05-F-05-03** fetch effect missing `errorCopy`/`timeoutMs` deps | MED → INFO (production) | `errorCopy` is `useMemo`'d (stable), `fetchTimeoutMs` is primitive; author edits only happen on Framer canvas where property-panel changes remount the component (effect re-runs fresh); published-site props are immutable. |

---

## PRIOR-CYCLE FINDINGS RE-CONFIRMED FIXED (28 items)

The following prior-cycle critical/high findings (from `/home/z/my-project/upload/Audit-Report.md`, 2026-08-15, 8,866-line baseline) are verified FIXED in the current 11,884-line source:

| Prior ID | Description | Verified By |
|---|---|---|
| F-01-01 | Framer layout annotations misplaced above non-exported helper | W2-32 ✅ (JSDoc now at L7879–7892, immediately above default export L7893) |
| W1-04-C1 / D7 | `PHONE_REGEX` rejects valid international formats | W1-04 ✅ (generalized group/paren regex) |
| W1-11-A1 / D5 | Inline `outline: "none"` overriding `:focus-visible` | W2-29 ✅ (inputBaseStyle L9726–9740 has no `outline` key) |
| W1-19-F-01 | Calendar grid `minmax(44px, 1fr)` clipping Saturday column | W2-38 ✅ (now `minmax(0, 1fr)` at L1865) |
| W1-04-H3 / D8 | sessionStorage restore advancing without re-validation | W2-24 ✅ (L6554–6581 loops validateStep over prior steps) |
| W1-06-F-06-1 / W2-25-F4 | POST body missing required `end` field | W2-25 ✅ (L5319–5321 + threading at L7293) |
| W1-04-C1 / H2 / H3 / L3 / M4 | All 5 prior W1-04 validation items | W2-24 ✅ |
| W1-05-F1 / F3 / F4 | Cal.com cache-key credentials, per-attempt timeout, ±1 day TZ widening | W2-25 ✅ / W2-26 ✅ |
| W1-10-A1 through A16 | All 14 prior W1-10 ARIA fixes | W2-28 ✅ |
| W1-14-F6 | `startTransition` inside `useLayoutEffect` defeating before-paint clamp | W1-14 ✅ (L6722 explicitly avoids startTransition) |
| W1-15-TS-01 through 10 | All prior W1-15 TS fixes (no `any`, no `as any`, no `@ts-ignore`, no `!.`) | W2-34 ✅ |
| W1-18-F1 / F2 / F3 | All prior W1-18 motion fixes | W2-37 ✅ |
| W2-30-F2 / F3 / F4 | All prior W2-30 cleanup fixes | W2-30 ✅ (100% cleanup verified) |
| W2-33-A2 | `fallbackErrorLabel` stale closure | W1-14 ✅ |
| W2-37-A1 / A2 / A3 | Prior W2-37 animation fixes | W2-37 ✅ |

---

## PRIOR-CYCLE FINDINGS RE-CONFIRMED STILL OPEN (5 items)

| Prior ID | Description | Current Status |
|---|---|---|
| W1-09-DT-03 | `firstDayOfWeek` uses `navigator.language` while `weekdayLabels`/`monthName` use `pageLocale()` — mismatched locales can misalign weekday header vs grid offset | ✅ FIXED — `firstDayOfWeek` memo (~L2942) now reads `pageLocale() || "en-US"`, matching `weekdayLabels`/`monthName` (verified in code). |
| W1-09-DT-10 | TimeSlotList radiogroup handles only Arrows; no Home/End per WAI-ARIA radiogroup pattern | ✅ FIXED — TimeSlotList radiogroup `onKeyDown` (~L2699) handles Home/End: focuses the first/last non-elapsed slot and selects it via `onSelectTime` (verified in code). |
| W1-13-F-13-10 | `themeVerdicts` / `regexPreviewVerdicts` memos run on published-site mount even though results are gated out of JSX by `isCanvas &&` | ✅ FIXED — `isCanvas` hoisted above both verdict memos in `useBookingEngineState` (~L7508, replacing the old render-section duplicate); both memos now early-return `[]` when `!isCanvas` (regex compilation sweep + 10-pair WCAG contrast math skip the published site entirely) with `isCanvas` added to both dep arrays. |
| W1-15-TS-07 | `FieldConfig` flat interface vs discriminated union | W2-34 ❌ REJECTED the proposed fix — flat interface is correct Framer design |
| W1-17-N6 | `getReadableTextColor` returns only `#000000`/`#FFFFFF` (by design) | Acceptable as-is |

---

## RECOMMENDED FIX PHASING (5-PHASE PLAN)

### Phase 1 — Critical & Data-Loss (1 fix, ~30 min)
1. **SYN-01** — Move `validation` runtime read from `props.validation` to `copy?.validation` (or move schema block out of `copy.controls`). Preserves already-saved author data. **Blocks every localization effort.**

### Phase 2 — High-Severity Correctness (5 fixes, ~2 hours)
2. **SYN-04** — Guard L7720 `currentStep.title` access with `currentStep ? \`${...}\` : ""`. Blocks canvas crash.
3. **SYN-05** — Replace `.find()?.fields.find()` with `for...of` loop iterating ALL steps at L7115. Restores multi-step live re-validation.
4. **SYN-08** — Memoize `opts` (`useMemo`) + `useCallback` `onChange` in `FieldRenderer` at L9870/L9931. Closes W1-08-F-08-02 + W1-08-F-08-05 + W1-16-P-16 + W1-20-F-1 simultaneously.
5. **SYN-09** — Add `amLabel`/`pmLabel` to `getPayload` deps at L3480.
6. **SYN-10** — Split `selected` into `presentationSelected` vs `formValue` in ChoiceGroupInline.

### Phase 3 — Live API Verification + High-Impact Hardcoding (3 fixes, ~1 hour + curl)
7. **SYN-06 + SYN-07** — Run `curl` against Cal.com v2 live API to verify query param names (`start`/`end` vs `startTime`/`endTime`) and slot shape (`{start, end}` vs `{time, bookingUid}`). If live API differs from code, fix at L4906 + L4733.
8. **SYN-02** — Add 3 persistence-disclosure PropertyControls (`savedAnswersLabel`, `clearSavedAnswersLabel`, `saveFailedMessage`).
9. **SYN-03** — Add `cancelSubmitLabel` to `buttonLabels` group.

### Phase 4 — Medium-Severity Polish (12 fixes, ~3 hours)
10. **W1-12-F-12-11** — Add `setHasSavedProgress(true)` on restore path (GDPR regression).
11. **W1-12-F-12-12** — Guard `slot.date.getTime()` with `instanceof Date` (data loss prevention).
12. **W1-14-F2** — Add `copy` to `handleSubmitBooking` deps.
13. **W1-16-P-13** — Memoize `firstNonElapsedIndex` outside `.map` (O(N²)→O(N)).
14. **W1-17-F17-N1** — Add `?? tokens[3]` fallback for alpha in legacy comma syntax.
15. **W1-17-F17-N2** — Add `backdrop` param to `getReadableTextColor`, thread `theme.backgroundColor`.
16. **W2-36-N1** — Brighten dark-theme accent to ≥4.5:1 on dark backgrounds.
17. **W1-19-N1** — `minWidth: isNarrow ? 0 : TOUCH_TARGET_MIN` at L1486.
18. **W1-19-N2** — Add `minHeight: TOUCH_TARGET_MIN` to checkbox label.
19. **W1-10-N1** — Add `aria-invalid`/`aria-describedby` to slot radiogroup.
20. **W1-10-N2** — Scope all field IDs with `${reactInstanceId}-` prefix.
21. **W1-10-N3** — Add `role="group"` + `aria-label` to 12h/24h toggle.

### Phase 5 — Low-Severity Cleanup (~15 fixes, ~2 hours)
22. **W1-04-F-3** — `validatePhone(str.trim(), vc)`.
23. **W1-04-F-4** — Require alphabetic first TLD char in `EMAIL_REGEX`.
24. **W1-04-F-8** — Add `noValidate` to `<form>`.
25. **W1-08-F-08-06** — Use index-based `key` and `isSelected` for duplicate-label safety.
26. **W1-14-F7** — Change textarea auto-resize to `useLayoutEffect`.
27. **W1-07-F5/F7/F9** — Three timezone label/cache fixes.
28. **W2-26-F26-1** — Widen Cal.com fetch range to ±2 days OR compute visitor-tz boundaries.
29. **W1-19-N3/N4** — Form-grid container query + `env(safe-area-inset-bottom)` fallback consistency.
30. **W1-18-F-1/F-2** — Swap `left`→`x`, `width`→`scaleX` for GPU-friendly animations.
31. **W1-15-TS-01/06/08** — Three TypeScript cleanup fixes (all Framer-compatible).
32. **W1-02-F4/F5/F6/F7** — Four customization PropertyControl additions.
33. **W1-13-F-13-8/F-13-9** — Canvas banner borders + ARIA semantics.
34. **W1-10-N4/N5/N6/N7/N8/N9/N10** — Seven low-severity ARIA polish items.
35. **W2-29-N1** — `handleCancelSubmit` focus restoration.
36. **W1-03-3/W1-03-4** — `handleBack` navigatingRef + pinned-step remap startTransition.

---

## CONFLICT RESOLUTION LOG (7 cross-agent merges)

1. **SYN-01 (CRITICAL):** W1-01-F-01 (HIGH) + W1-02-F1 (CRITICAL) — both found the `validation` PropertyControl silent no-op via independent paths (brace-depth parse + interface cross-ref). Escalated to CRITICAL because impact is total.
2. **SYN-08 (HIGH):** W1-08-F-02 + W1-16-P-16 + W1-20-F-1 — three sub-agents describe the same defect (ChoiceGroupInline memo break) from different angles. One fix (memoize `opts`, `useCallback` `onChange`) solves all three reported symptoms.
3. **SYN-37 (MEDIUM):** W1-05-F-05-03 + W1-14-F3 — same underlying issue (Cal.com fetch effect incomplete dep array: `errorCopy` + `timeoutMs` + `copy` all missing).
4. **SYN-48 (MEDIUM):** W1-07-F6 + W1-09-DT-TzToday — same defect (today computed browser-local when `timeZone` prop set).
5. **SYN-61 (LOW):** W1-09-DT-10 + W1-11-F4 — same defect (TimeSlotList missing Home/End).
6. **SYN-25 (LOW):** W1-02-F11 + W1-18-F-18-3 — same defect (hardcoded spring transitions not exposed via PropertyControls).
7. **SYN-82 (LOW):** W1-14-F7 + prior W2-37-A2 mitigation — textarea auto-resize should be `useLayoutEffect`; prior cycle's no-write mitigation is in place but deeper fix open.

---

## UNRESOLVED VERIFICATION ITEMS (1)

**Cal.com v2 Live OpenAPI Verification (SYN-06 + SYN-07):** Wave 1 explicitly flagged these as "needs Wave 2 verification against Cal.com's live OpenAPI." Wave 2 verified the code-level claims but could not fetch the live API (sandbox has no Cal.com credentials). If Cal.com v2 has migrated to `startTime`/`endTime` and `{time, bookingUid}` slot shape since the prior cycle, current code is broken (every availability fetch fails or returns empty calendar with no error). **Live OpenAPI fetch is the top compensating verification action.** Single curl command:

```bash
curl -H "Authorization: Bearer $CAL_API_KEY" \
  -H "cal-api-version: 2024-09-04" \
  "https://api.cal.com/v2/slots?eventTypeId=123&startTime=2026-08-16T00:00:00Z&endTime=2026-08-23T00:00:00Z&timeZone=UTC"
```

If 400/error → rename `start`→`startTime`, `end`→`endTime` at L4906–4910. Inspect response shape → if `{time, bookingUid}`, update `isCalSlot` at L4733 to accept either shape.

---

## AUDIT ARTIFACTS

| Artifact | Path | Size |
|---|---|---|
| **Final Audit Report (this file)** | `/home/z/my-project/download/Audit-Report.md` | — |
| Source file | `/home/z/my-project/upload/BookingEngine.tsx` | 11,884 lines, 519 KB |
| Prior audit (reference) | `/home/z/my-project/upload/Audit-Report.md` | 963 lines, 120 KB |
| Wave 1 findings (20 files) | `/home/z/my-project/wave1/subagent_01.md` through `subagent_20.md` | ~120 KB total |
| Wave 2 verifications (19 files) | `/home/z/my-project/wave2/subagent_21.md` through `subagent_40.md` (subagent_33 missing — timed out) | ~520 KB total |
| Regex test script | `/home/z/my-project/scripts/test_regex.js` | 103 assertions, re-runnable |
| Shared worklog | `/home/z/my-project/worklog.md` | ~1,200 lines |

**Re-run regex tests:** `node /home/z/my-project/scripts/test_regex.js`

---

*End of Audit Report.*


# EXECUTIVE AUDIT SUMMARY: BookingEngine.tsx

## Execution Audit Overview
- **Wave 1 Sub-Agents (Investigation):** 20 / 20 Executed Simultaneously (Completed)
- **Wave 2 Sub-Agents (Review & Verification):** 20 / 20 Executed Simultaneously (Completed — W2-40 re-launched after original premature run)
- **Target file:** `/home/z/my-project/upload/BookingEngine.tsx` (12,788 lines after W2-38/W2-39 in-flight edits; was 12,763 at Wave 1 launch)
- **Total Issues Identified:** 93 confirmed new findings (post-deduplication, post-false-positive purge)
- **Confirmed Critical/High Severity:** 2 (both HIGH; 0 CRITICAL)
- **Medium Severity:** 17
- **Low Severity:** 58
- **Info Severity:** 16
- **False Positives Dismissed in Wave 2:** 2
- **Prior-Cycle Findings Re-Confirmed Fixed:** 60+ (SYN-01 through SYN-10 + W1-XX fix history)
- **Findings Fixed In-Flight by Wave 2 (W2-38 / W2-39 deviations):** 4 (W1-19-N5, N6, N7, W2-39-M8)

---

## TO-DO EXECUTION LOG
- [x] Phase 1: Environment & Architecture Initialization
- [x] Phase 2: Execution of Wave 1 (20 Sub-Agents Launched Simultaneously)
- [x] Phase 3: Execution of Wave 2 (20 Sub-Agents Launched Simultaneously after Wave 1)
- [x] Phase 4: Final Synthesis & Categorized Report Generation (W2-40 re-launch — read all 39 prior reports before synthesizing)

---

## TOP 10 MUST-FIX-BEFORE-NEXT-RELEASE

| # | ID | Short Description | Severity | Location | Wave 2 Verdict |
|---|---|---|---|---|---|
| 1 | W1-09-NEW-01 | TZ-shifted cell labels break `isToday` / `isPast` / `isTimeElapsed` when browser TZ ≠ visitor TZ (MERGED with W1-07-N3) | 🔴 HIGH | `getTodayInTimeZone` L711–L718; `isSameDay` L628–L635; `startOfDay` L700–L702; CalendarGrid `isToday`/`isPast` L1872/L1875; `isTimeElapsed` L3397–L3419 | ✅ Confirmed HIGH by W2-26 (two Node traces reproduce the bug); W2-22's Medium downgrade overridden by conservative policy |
| 2 | W1-06-F-06-4 | Double-mapping in submit chain: `submitCalcomBooking` catch maps once, `handleSubmitBooking` maps again, degrading friendly timeout/network/credential copy to generic fallback | 🔴 HIGH | `submitCalcomBooking` catch L6011–L6017; `handleSubmitBooking` L8005–L8010 | ⬆️ ESCALATED Medium→High by W2-25 (broader impact: degrades `submitTimeoutError` + `networkError` + `credentialError` even with default copy) |
| 3 | W1-16-N1 | `Intl.DateTimeFormat` constructed inline ~84× per CalendarGrid render; ~200–700× per Cal.com fetch settle | 🟠 MEDIUM-HIGH | `getMinutesInTimeZone` L647–L670; `getDateKeyInTimeZone` L679–L698; CalendarCell aria-label L1633; DST-collision L3322/L3334; CalendarGrid `.map` L1869–L1873 | ✅ Confirmed by W2-35 (V8 removed internal `Intl.DateTimeFormat` cache ~2020; W2-22's Low downgrade refuted). Single highest-ROI perf fix |
| 4 | W1-11-NEW-FIND-1 | Inline `outline: "none"` on ChoiceGroupInline option button (L1179) wins by CSS specificity, suppressing global `:focus-visible` rule; 1-frame no-indicator race during modality detection | 🟠 MEDIUM | `renderOptionButton` L1140–L1202 (specifically L1179); CSS rule L9525–L9528 (post-W2-38 shift); `inputBaseStyle` L10550–L10564 | ✅ Confirmed by W2-22, W2-27, W2-29 |
| 5 | W1-20-N2 | Input values not trimmed before storage / POST: pasted whitespace passes validation (regex trims internally) but Cal.com rejects untrimmed emails on submit | 🟠 MEDIUM | `handleFieldChange` L7751–L7776; `submitCalcomBooking` L7902–L7903, L5903–L5904; `buildBookingFieldsResponses` L6212–L6227; `buildNotesPayload` L6229–L6281 | ✅ Re-confirmed by W2-39 Edge Case 11 (post-W2-38/W2-39 edits) |
| 6 | W1-08-F-08-06 | Duplicate-label options mis-select on click: write-side round-trip via `selectOption(label)` re-selects the first matching option (visual ring snaps back) | 🟠 MEDIUM | `ChoiceOption` L729–L737 (no `value` field); `selectOption` L1052–L1063; `selectedIndex` L1113–L1115; `onClick` L1166 | ✅ Confirmed by W2-22 (downgrade to Low overridden — conservative), W2-27 |
| 7 | W1-08-F-08-05 | `controlledValue` matching no option strands DOM focus: presentation fallback flips all `tabIndex` to `-1`, focus stays on now-untabbable button | 🟠 MEDIUM | Presentation fallback L894–L899; effect L930–L944 (`idx < 0` early-return at L939); `tabIndex` L1165 | ✅ Confirmed by W2-22, W2-27, W2-29 |
| 8 | W1-15-TS-10 | `isCalSlot` type guard unsound for time-only slots: accepts `{ time, bookingUid }` but narrows to `CalSlot` (mandatory `start: string`); downstream `slot.start` is `undefined` | 🟠 MEDIUM | `isCalSlot` L5243–L5251; downstream consumers L5592–L5612, L5582, L5584 | ✅ Confirmed by W2-34, W2-39 (Edge Case 16); W2-22's Low downgrade overridden by user instruction |
| 9 | W1-15-TS-14 | `restoredSlot` cast at L7058 narrows `unknown` to `BookingPayload`-shape without a runtime guard; only `date` is re-narrowed, `time24h`/`timeLabel`/`end` survive as hostile types (MERGED with W1-12-NEW-1) | 🟠 MEDIUM | Cast L7058–L7083; downstream consumers L5182, L6345, L6279, L6349–L6350, L6456; L11088 (post-shift) | ✅ Confirmed by W2-31, W2-34; W2-39 found "mostly mitigated" with residual crash vector W2-31-NEW-1 |
| 10 | W1-09-NEW-02 | `buildCalendarDeepLink` Outlook URL uses Google's compact-UTC format (`20260816T143000Z`); Outlook's `startdt`/`enddt` expects extended ISO with separators and no `Z` | 🟠 MEDIUM | `buildCalendarDeepLink` L6450–L6474; specifically L6463–L6473 | ✅ Confirmed by W2-21 (line citation VERIFIED-ACCURATE) |

---

## DETAILED FINDINGS BY CATEGORY

### 1. Framer Platform & Controls Isolation

#### Issue W1-01-F-06: StepBody `matchMedia("(pointer: coarse)")` queried inline on every render
- **Severity:** ⚪ Info
- **Location:** StepBody inline `fontSize` expression L10070–L10072 (post-W2-38 shift: L10084–L10086); compare FieldRenderer `inputFontSize` `useMemo` L10509–L10520 (post-shift: L10534–L10545)
- **Wave 1 Discovery:** Both call sites are SSR-safe, but StepBody runs `window.matchMedia("(pointer: coarse)")` inline per render — allocating a fresh `MediaQueryList` each time — while FieldRenderer wraps the identical query in `useMemo([])`.
- **Wave 2 Verification:** W2-32 confirmed SSR guards intact; W2-35 noted the inconsistency in memoization pattern. No runtime defect.
- **Root Cause Analysis:** Two call sites of the same query evolved independently.
- **Impact:** Minor perf — `matchMedia` is cheap, but `MediaQueryList` allocates per StepBody render (10–30× per session on a datetime step).
- **Recommended Remediation:**
```typescript
// Near the top of StepBody's body:
const selectFontSize = React.useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return 14;
    try {
        return window.matchMedia("(pointer: coarse)").matches ? 16 : 14;
    } catch {
        return 14;
    }
}, []);
// Then at the select style:
fontSize: selectFontSize,
```
- **Status: Completed** — StepBody now computes `selectFontSize` with `React.useMemo` (SSR-guarded, try/catch-protected, `[]` deps), and the timezone `<select>` reads that memoized value instead of calling `window.matchMedia("(pointer: coarse)")` inline per render. Matches FieldRenderer's existing memoization pattern; no more per-render `MediaQueryList` allocation.

---

#### Issue W1-01-F-07: Safety-Rule-#2 scoped-exception doc only names `options`; `optionImages` and `optionDescriptions` follow the same Array-with-`hidden` pattern undocumented
- **Severity:** ⚪ Info
- **Location:** Scoped-exception comment L4513–L4520; inline comment L11754–L11760; Array controls L11761 (`options`), L11802 (`optionImages`), L11815 (`optionDescriptions`)
- **Wave 1 Discovery:** Three Array controls use the identical `hidden: (p) => !CHOICE_FIELD_TYPES.includes(p?.fieldType || "")` pattern. The Safety-Rule-#2 doc explicitly blesses `options` only; the other two are silently following the same exception.
- **Wave 2 Verification:** W2-34 confirmed all three Arrays use `hidden` callbacks correctly; pattern is stable. W2-23 confirmed all three Arrays ship with default `[]`. Documentation drift only.
- **Root Cause Analysis:** Three parallel Arrays (`options`, `optionImages`, `optionDescriptions`) shipped at different times; the doc comment was never updated.
- **Impact:** None at runtime. Risk: a future maintainer "fixing" Safety Rule #2 by stripping `hidden` from `optionImages`/`optionDescriptions` would create inconsistent authoring UX.
- **Recommended Remediation:** Update the scoped-exception comment block (L4513–L4520 and inline L11754–L11760) to explicitly name all three Array controls.
- **Status: Completed** — The SAFETY RULE #2 scoped-exception comment now explicitly names all four per-field choice-Array controls (`options`, `optionValues`, `optionImages`, `optionDescriptions`); the inline comment above `optionImages`/`optionDescriptions`/`optionValues` at the `addPropertyControls` block cross-references that note.

---

### 2. Zero-Hardcoding & 100% Customizability

#### Issue W1-02-F25: `validation` PropertyControl schema uses literal `defaultValue` strings instead of `DEFAULT_VALIDATION_COPY.*` constants
- **Severity:** 🟡 Medium
- **Location:** Schema `validation` block L12658–L12713 (post-W2-38 shift; Wave 1 cited L12633–L12688); `DEFAULT_VALIDATION_COPY` L4913–L4923; runtime `validationCopy` memo L6585–L6616
- **Wave 1 Discovery:** The 9 schema `defaultValue` strings/numbers exactly match the `DEFAULT_VALIDATION_COPY.*` constants today, but a future maintainer updating the constant would NOT propagate to new canvas instances. Sibling `errorCopy` and `aria` groups single-source correctly via `ERROR_COPY_DEFAULTS.X` and `DEFAULT_ARIA_LABELS.X`.
- **Wave 2 Verification:** W2-21 confirmed VERIFIED-ACCURATE (substance; secondary-citation line drift). W2-22 downgraded to Low (pure future-drift risk). W2-23 verified the schema block uses literal defaultValues while sibling blocks reference constants.
- **Root Cause Analysis:** The `validation` block was nested inside `copy.controls` as part of the SYN-01 fix; the schema authoring pass used literal strings instead of the constant references the sibling groups use.
- **Impact:** No runtime defect today. Future-drift risk only.
- **Recommended Remediation:**
```typescript
// In addPropertyControls (L12658–L12713), replace 9 literal defaultValues:
requiredFieldError: {
    type: ControlType.String,
    title: "Required Field",
    defaultValue: DEFAULT_VALIDATION_COPY.requiredFieldError,  // was "This field is required"
},
// ... and 8 more fields ...
minLength: {
    type: ControlType.Number,
    title: "Min Length",
    defaultValue: DEFAULT_VALIDATION_COPY.minLength,  // was 3
    min: 1, max: 100, step: 1,
},
```
- **Status: Completed** — All 9 `validation` schema `defaultValue`s now reference `DEFAULT_VALIDATION_COPY.*` (strings via the constant object, `minLength` via `DEFAULT_VALIDATION_COPY.minLength` which resolves to `MIN_TEXT_LENGTH`), single-sourced like the sibling `errorCopy`/`aria` groups.

---

#### Issue W1-02-F26: Cal.com API base URL hardcoded (not configurable for self-hosted deployments)
- **Severity:** 🟢 Low
- **Location:** `useCalcomSlots` fetch L5503 (GET); `submitCalcomBooking` fetch L5875 (POST)
- **Wave 1 Discovery:** Both fetch calls hardcode `https://api.cal.com/v2/...`. Self-hosted Cal.com deployments (e.g. `https://book.example.com/api/v2/...`) cannot use the engine without forking.
- **Wave 2 Verification:** W2-23 confirmed `calApiBaseUrl` control does not exist (grep: 0 matches). Confirmed TRUE-POSITIVE.
- **Root Cause Analysis:** Original implementation targeted Cal.com Cloud only.
- **Impact:** Self-hosted Cal.com users cannot use the engine.
- **Recommended Remediation:** Add `calApiBaseUrl?: string` PropertyControl (default `"https://api.cal.com"`); thread through both fetch URLs.
- **Status: Completed** — Added `calApiBaseUrl?: string` to the engine props (default `DEFAULT_CAL_API_BASE_URL` = `"https://api.cal.com"`) with a `ControlType.String` property control, resolved once in `useBookingEngineState` with trailing-slash normalization (`/\/+$/` stripped so the `/v2/...` suffix joins cleanly), and threaded into both fetch sites: `useCalcomSlots` (`${apiBase}/v2/slots`) and `submitCalcomBooking` (`${apiBase}/v2/bookings`), each resolving `apiBaseUrl || DEFAULT_CAL_API_BASE_URL` internally so standalone hook calls stay safe. Self-hosted deployments now point the engine at their own instance.

---

#### Issue W1-02-F27: Cal.com API version header `"cal-api-version": "2024-09-04"` hardcoded at both call sites
- **Severity:** 🟢 Low
- **Location:** GET headers L5506; POST headers L5878
- **Wave 1 Discovery:** The API version header is hardcoded to `"2024-09-04"` at both call sites. When Cal.com releases a new API version, the engine cannot be upgraded without a code change.
- **Wave 2 Verification:** W2-23 confirmed `calApiVersion` control does not exist. Confirmed TRUE-POSITIVE.
- **Impact:** Engine is pinned to Cal.com API v2 `2024-09-04`; future Cal.com v2 minor versions require a code update.
- **Recommended Remediation:** Add `calApiVersion?: string` PropertyControl (default `"2024-09-04"`); thread through both header sets.
- **Status: Completed** — Added `calApiVersion?: string` to the engine props (default `DEFAULT_CAL_API_VERSION` = `"2024-09-04"`) with a `ControlType.String` property control; an empty/whitespace author value falls back to the default. Both header sets now send `"cal-api-version": apiVer` — the slots GET inside `useCalcomSlots` and the bookings POST inside `submitCalcomBooking` — each with its own internal fallback, so future Cal.com v2 minor versions are adoptable from the properties panel without a code change.

---

#### Issue W1-02-F28: ICS download filename `booking-${icsDateStamp}.ics` hardcoded
- **Severity:** 🟢 Low
- **Location:** SuccessScreen `icsDateStamp` L11066; download anchor L11260 (post-shift L11285)
- **Wave 1 Discovery:** The ICS download filename is hardcoded to `booking-YYYY-MM-DD.ics`. Authors cannot brand it (e.g., `acme-consultation-YYYY-MM-DD.ics`).
- **Wave 2 Verification:** W2-23 confirmed `icsDownloadFilenamePrefix` control does not exist. Confirmed TRUE-POSITIVE.
- **Impact:** Branding limitation only.
- **Recommended Remediation:** Add `icsDownloadFilenamePrefix?: string` PropertyControl (default `"booking-"`); use in SuccessScreen download anchor.
- **Status: Completed** — Added `icsDownloadFilenamePrefix?: string` to the engine props (default `DEFAULT_ICS_FILENAME_PREFIX` = `"booking-"`) with a `ControlType.String` property control; threaded through `useBookingEngineState` → `SuccessScreen` as `icsFilenamePrefix`, and the download anchor is now ``download={`${icsFilenamePrefix}${icsDateStamp}.ics`}``. Authors can brand the file (e.g. `acme-consultation-2026-08-17.ics`) while the `-YYYY-MM-DD.ics` stamp/extension contract is preserved.

---

#### Issue W1-02-F29: ICS UID fallback domain `@booking-engine` hardcoded
- **Severity:** 🟢 Low
- **Location:** `buildIcsDataUri` UID construction L6365
- **Wave 1 Discovery:** When `bookingUid` is missing, the ICS UID falls back to `${timestamp}-${random}@booking-engine`. Authors cannot customize the domain (e.g., `@acme-consultations`).
- **Wave 2 Verification:** W2-23 confirmed `icsUidDomain` control does not exist. Confirmed TRUE-POSITIVE.
- **Impact:** Calendar apps may show the UID; non-branded fallback is a minor cosmetic issue.
- **Recommended Remediation:** Add `icsUidDomain?: string` PropertyControl (default `"@booking-engine"`); thread into UID construction.
- **Status: Completed** — Added `icsUidDomain?: string` to the engine props (default `DEFAULT_ICS_UID_DOMAIN` = `"@booking-engine"`) with a `ControlType.String` property control; threaded as the new `uidDomain` parameter of `buildIcsDataUri` (default = historical constant), used in the non-UUID UID construction path. Existing UIDs are unchanged for browsers with `crypto.randomUUID`; only the fallback path becomes brandable.

---

#### Issue W1-02-F30: `SLOTS_CACHE_TTL_MS` (5 min) not exposed via PropertyControl
- **Severity:** 🟢 Low
- **Location:** `SLOTS_CACHE_TTL_MS` L5293; usage L5407
- **Wave 1 Discovery:** The Cal.com slots cache TTL is hardcoded to 5 minutes. High-traffic events (concert tickets) may want 30s; low-traffic salons may want 30 min. Asymmetric with `fetchTimeoutMs` (which IS exposed at L12738).
- **Wave 2 Verification:** W2-23 confirmed `slotsCacheTtlMs` control does not exist. Confirmed TRUE-POSITIVE.
- **Impact:** Authors cannot tune perceived freshness of availability data.
- **Recommended Remediation:** Add `slotsCacheTtlMs?: number` PropertyControl (min 0, max 30\*60\*1000, step 60\*1000, default 5\*60\*1000); thread through `useCalcomSlots` cache.
- **Status: Completed** — Added `slotsCacheTtlMs?: number` to the engine props with a `ControlType.Number` property control (min 0, max 30·60·1000, step 60·1000, default `SLOTS_CACHE_TTL_MS`); resolved in `useBookingEngineState` (non-number/non-≥0 values fall back to the constant), passed as the new `cacheTtlMs` parameter of `useCalcomSlots`, and the cache-read freshness check now compares against the resolved `cacheTtl` instead of the constant — exactly the remediation's spec (min 0/max 30 min/step 1 min/default 5 min).

---

#### Issue W2-23-N1 (NEW): `DEFAULT_MEETING_DURATION_MS` (30 min) not exposed via PropertyControl
- **Severity:** 🟢 Low
- **Location:** `DEFAULT_MEETING_DURATION_MS` L4651; usage sites L6351, L6357, L6461
- **Wave 1 Discovery:** Not flagged — W1-02's scope was the L454–L525 `DEFAULT_COPY` block; this constant lives in the deferred L4633–L4677 timing/theme block.
- **Wave 2 Verification:** W2-23 surfaced this as a NEW finding. Three usage sites (ICS export, Google/Outlook deep links, success-screen duration display) all fall back to the hardcoded 30-minute default when Cal.com's slot lacks an end.
- **Impact:** Doctor's offices (15-min appointments) or salons (60-min appointments) cannot customize the default. Affects ICS file, calendar deep links, and success-screen duration display.
- **Recommended Remediation:** Add `defaultMeetingDurationMs?: number` PropertyControl (min 5\*60\*1000, max 8\*60\*60\*1000, step 5\*60\*1000, default `DEFAULT_MEETING_DURATION_MS`); thread through the three usage sites.
- **Status: Completed** — Added `defaultMeetingDurationMs?: number` to the engine props with a `ControlType.Number` property control (min 5·60·1000, max 8·60·60·1000, step 5·60·1000, default `DEFAULT_MEETING_DURATION_MS`); resolved in `useBookingEngineState` (only positive numbers accepted) and threaded to all three usage sites as new `meetingDurationMs` parameters (each defaulting to the historical constant): `buildIcsDataUri` (all three end-date fallbacks), `buildCalendarDeepLink` (Google + Outlook), and the SuccessScreen which owns both builders — so the .ics DTEND, both deep-link end times, and any slot-end-derived display all honor the author's configured default when Cal.com's slot lacks an end.

---

### 3. Pipeline & Step Navigation

#### Issue W1-03-5: Render-phase remap fallback uses raw `currentIndex`
- **Severity:** 🟢 Low
- **Location:** `useStateGuarded` remap fallback (referenced via W1-03 §1)
- **Wave 1 Discovery:** When the render-phase pinned-step remap reads `pinnedStepIdRef.current` BEFORE its own effect updates it (an extremely narrow timing window), the fallback uses raw `currentIndex` rather than the clamped `safeCurrentIndex`.
- **Wave 2 Verification:** W2-24 (Scenario 6 — step disable mid-flow) and W2-33 confirmed the render-phase remap is functionally correct in every realistic scenario; the fallback path is unreachable under normal React commit ordering.
- **Impact:** Theoretical; no current caller exploits the timing window.
- **Recommended Remediation:** Defensive: change the fallback to read `safeCurrentIndex` instead of `currentIndex`. One-line change.
- **Status: Completed** — The render-phase pinned-step remap fallback now reads `Math.min(safeCurrentIndex, totalActive - 1)` instead of raw `currentIndex`, so the theoretical pre-effect-commit window uses the clamped index consistently.

---

#### Issue W1-03-6: Misleading "Drag to Reorder" comment
- **Severity:** ⚪ Info
- **Location:** Comment near L4892–L4894
- **Wave 1 Discovery:** A stale comment references a "drag to reorder" affordance that does not exist in the current code.
- **Wave 2 Verification:** W2-33 confirmed the comment is still present.
- **Impact:** Documentation hygiene only.
- **Recommended Remediation:** Delete or rewrite the comment.
- **Status: Stale / Skipped** — Verified at resolution time by sweeping every remaining `drag`/`reorder` mention in the file: each one documents affordances that genuinely exist in Framer's Properties Panel today (Array items are reorderable by drag; the Calendar Widget marker is draggable within a step's Fields array; the fixed-ID rationale comment explains what reordering does to IDs). No comment references a removed/nonexistent affordance anymore, so there was nothing left to delete or rewrite.

---

#### Issue W1-03-7: `handleJumpToStep` omits `navigatingRef` guard
- **Severity:** ⚪ Info
- **Location:** `handleJumpToStep` L8175–L8199; only caller L10307 (ReviewStepBody Edit link)
- **Wave 1 Discovery:** `handleJumpToStep` does not acquire `navigatingRef` before calling `setCurrentIndex(stepIndex)`. A double-click on the ReviewStepBody Edit link could theoretically trigger two transitions.
- **Wave 2 Verification:** W2-24 (Scenario 15) confirmed the only caller (`entry.stepIndex` from ReviewStepBody) is always a backward jump — no exploitable forward-skip path exists today.
- **Impact:** None today. Defense-in-depth gap only.
- **Recommended Remediation:** Add `if (navigatingRef.current) return; navigatingRef.current = true;` at the top of `handleJumpToStep`.
- **Status: Completed** — `handleJumpToStep` now claims `navigatingRef` exactly like `handleContinue`/`handleBack` (`if (navigatingRef.current) return; navigatingRef.current = true;`), so a double-click on the ReviewStepBody Edit link can no longer trigger two transitions in the same commit. The lock is released by the same release effect the other handlers use.

---

### 4. Validation & Navigation Guarding

#### Issue W1-04-§1.3: `handleJumpToStep` accepts arbitrary `stepIndex` without `validateStep`
- **Severity:** 🟢 Low
- **Location:** `handleJumpToStep` L8175–L8199; caller ReviewStepBody Edit link L10307
- **Wave 1 Discovery:** `handleJumpToStep` bounds-checks but does NOT re-validate the destination step. Today's only caller passes backward indices, so the missing validation is not exploitable.
- **Wave 2 Verification:** W2-24 (Scenario 15) confirmed: "PARTIALLY-MITIGATED (LOW — defense-in-depth only; no current caller exploits it)."
- **Impact:** None today. If a future caller passes a forward index, a visitor could jump past an invalid step.
- **Recommended Remediation:** Add `if (stepIndex > safeCurrentIndex) return;` at the top of `handleJumpToStep`, OR re-run `validateStep` over every step in `[safeCurrentIndex, stepIndex)` and clamp on the first invalid one.
- **Status: Completed** — Implemented the simpler of the two options: `handleJumpToStep` now early-returns on any forward jump (`if (stepIndex > safeCurrentIndex) return;`), keeping it strictly a backward "Edit" path (its only caller, ReviewStepBody, passes backward indices). Forward navigation stays gated behind `validateStep` via `handleContinue`, and `safeCurrentIndex` was added to the callback's dep array.

---

#### Issue W1-20-N2: Input values not trimmed before storage / POST
- **Severity:** 🟠 Medium
- **Location:** `handleFieldChange` L7751–L7776; `submitCalcomBooking` L7902–L7903, L5903–L5904; `buildBookingFieldsResponses` L6212–L6227; `buildNotesPayload` L6229–L6281
- **Wave 1 Discovery:** `handleFieldChange` stores raw `e.target.value` with no trim. Validation trims internally (`EMAIL_REGEX.test(str.trim())`), so whitespace-padded values pass validation. The stored `values[field.id]` and POST payload retain whitespace. Cal.com's server-side validation rejects malformed emails with whitespace → 400 response → visitor sees a generic error AFTER their field already showed green.
- **Wave 2 Verification:** W2-39 (Edge Case 11) re-verified: confirmed still applies post-W2-38/W2-39 edits. Mental trace for `"  john@example.com  "`: passes validation, POSTs untrimmed.
- **Root Cause Analysis:** Validation and storage use different normalization. The W1-04-F-3 fix trimmed for `validatePhone`; the stored value was never updated.
- **Impact:** Cal.com rejects whitespace-padded emails after the engine's validation already passed green. Pasted values from email signatures/contact lists routinely hit this.
- **Recommended Remediation:**
```typescript
// In handleFieldChange (L7751):
const handleFieldChange = React.useCallback(
    (fieldId: string, value: string | boolean | undefined) => {
        const field = activeSteps.flatMap(s => s.fields).find(f => f.id === fieldId);
        const sanitized = typeof value === "string" && field?.fieldType !== "textarea"
            ? value.trim()
            : value;
        setValues((prev) => ({ ...prev, [fieldId]: sanitized }));
        // ...
    },
    [activeSteps, validationCopy],
);
```
(Textarea exempted — multi-line content can legitimately have leading indentation.)

- **Status: Completed** — Valid. `handleFieldChange` now trims string values before storage (textareas exempted, per recommendation), using the sanitized value for both `setValues` and the live `validateField` pass. Since every downstream consumer (`submitCalcomBooking` POST body, `buildBookingFieldsResponses`, `buildNotesPayload`, sessionStorage restore) reads from `values`, the single storage-time normalization closes the validation/POST mismatch for pasted whitespace-padded emails.

---

#### Issue W1-04-§5.1: `navigatingRef` wedge between Continue and Back (intentional design)
- **Severity:** ⚪ Info
- **Location:** `handleContinue` L8121–L8122; `handleBack` L8159–L8160; release effect L7706–L7708
- **Wave 1 Discovery:** `navigatingRef.current = true` is set synchronously by Continue and Back. If the user clicks Continue then immediately Back before React commits, the Back call early-returns. The window is ~16ms (one React commit).
- **Wave 2 Verification:** W2-24 (Scenario 3) confirmed: "PARTIALLY-MITIGATED (sub-frame wedge, self-recovers — W1-04 §5.1 INFO, by design)."
- **Impact:** None. Self-recovers on next commit. Documented design choice.
- **Status: False Positive** — Confirmed intentional by design at Wave 2 (W2-24 Scenario 3): the ~16ms `navigatingRef` wedge between a Continue→Back double-click is the same one-commit transition lock every navigation handler uses, and it self-recovers on the next commit. No remediation warranted; documented here so a future pass doesn't re-flag it.

---

#### Issue W1-04-§5.2: Stale comment at L4892–L4894
- **Severity:** ⚪ Info
- **Location:** Comment L4892–L4894
- **Wave 1 Discovery:** Stale comment referencing removed/changed behavior.
- **Wave 2 Verification:** Not specifically re-verified; treated as doc hygiene.
- **Recommended Remediation:** Delete or rewrite the comment.
- **Status: Stale / Skipped** — Same resolution as W1-03-6: a sweep of all `drag`/`reorder` comments found every remaining mention documents a real, current Framer panel affordance (Array reordering, Calendar Widget marker placement). Nothing stale remained to edit.

---

#### Issue W1-04-§5.3: Restore-effect closure captures first-render `validationCopy`
- **Severity:** ⚪ Info
- **Location:** Restore `useEffect` L7019–L7199; deps `[..., validationCopy, activeSteps]` omitted (W1-12-NEW-5)
- **Wave 1 Discovery:** The restore effect captures `validationCopy` and `activeSteps` from the first render. If the author changes these via Framer panel mid-session, the restore effect would not re-fire.
- **Wave 2 Verification:** W2-33 (item 24) and W2-31 (Check 15) confirmed SAFE: restore is mount-only; Framer property-control changes remount the component, so the captured first-render values are always correct for that mount.
- **Impact:** None. Intentional design.
- **Status: False Positive** — Confirmed safe and intentional at Wave 2: the restore effect is mount-only by design, and Framer property-control edits remount the component, so the first-render `validationCopy`/`activeSteps` closure is always correct for that mount. Adding the deps would be harmless but changes nothing; left as-is.

---

### 5. Cal.com v2 API Integration & Timezone Accuracy

#### Issue W1-09-NEW-01: TZ-shifted cell labels break `isToday` / `isPast` / `isTimeElapsed` when browser TZ ≠ visitor TZ (MERGED with W1-07-N3)
- **Severity:** 🔴 HIGH
- **Location:** `getTodayInTimeZone` L711–L718; `today` state L3566–L3568; `isSameDay` L628–L635; `startOfDay` L700–L702; CalendarGrid `isPast`/`isToday` L1872/L1875; `isTimeElapsed` L3397–L3419 (specifically L3400); cell construction L3019–L3035; cell label L1752; `moveFocus` L4001–L4029; `handleDateSelect` L3939–L3968
- **Wave 1 Discovery:** `today = getTodayInTimeZone(tz)` is a local-midnight Date whose LOCAL y/m/d equals the visitor-tz date, but cell Dates are local-midnight with browser-tz y/m/d. `isSameDay(today, date)` compares mismatched coordinate systems when browser tz ≠ visitor tz. Today-ring lands on the wrong cell; `isTimeElapsed`'s `if (!isSameDay(selectedDate, today)) return false;` short-circuits to `false` for today's cell.
- **Wave 2 Verification:**
  - W2-21 (Source Truth): VERIFIED-ACCURATE — all cited lines match exactly. Worked example (browser NY UTC−4, `timeZone="Pacific/Honolulu"` UTC−10) holds.
  - W2-26 (TZ Edge Cases): CONFIRMED-HIGH — two Node traces reproduce the bug:
    - NY browser + Honolulu visitor: cell labeled "13" marked today instead of "14".
    - Kiritimati browser + Baker visitor: cell labeled "28" marked today instead of "30" (26h drift).
  - W2-22 (False Positive Filter): downgraded to Medium (gated on visitor-tz ≠ browser-tz). Overridden by conservative policy and W2-26's Node traces.
- **Root Cause Analysis:** The codebase mixes two coordinate systems: visitor-tz (cell labels L1752, slot bucketing keys L7388/L7400, `today`'s underlying y/m/d L712) and browser-local (`isSameDay` L628–L635, `startOfDay` L700–L702, `visibleMonth` L2930, month/year header L2962–L2968). The two agree only when browser tz ≡ visitor tz.
- **Impact:** Every consumer of `today`/`isSameDay`/`startOfDay` in the calendar/time-grid subsystem inherits the off-by-one. The "Today" highlight lands on the wrong cell; `isPast` fails to grey out elapsed days; `isTimeElapsed` short-circuits to `false` (elapsed slots stay clickable but produce a Cal.com "slot unavailable" error on submit). Reproduces on every cross-tz scenario with a date divergence.
- **Recommended Remediation:**
```typescript
// Precompute todayKey once per render in CalendarGrid:
const todayKey = getDateKeyInTimeZone(today, timeZone || "");

// Replace isSameDay(today, date):
const isToday = todayKey === getDateKeyInTimeZone(date, timeZone || "");

// Replace startOfDay(date).getTime() < today.getTime():
const isPast = getDateKeyInTimeZone(date, timeZone || "") < todayKey;

// Apply the same pattern to:
// - moveFocus L4003: if (startOfDay(target).getTime() < today.getTime()) return;
// - handleDateSelect L3941: if (startOfDay(date).getTime() < today.getTime()) return;
// - dateTabIndexByKey L3866 (uses selectedDate comparison)
// - firstAvailableDate L3799
```

- **Status: Completed** — Valid. Fixed at the root: `getTodayInTimeZone` now returns the local-midnight instant whose *visitor-tz key* equals today's visitor-tz key (convergence loop, ≤2 iterations even for 26h Kiritimati/Baker drift), placing `today` in the same coordinate system as grid cells. Every consumer (`CalendarGrid` `isToday`/`isPast`, `isTimeElapsed` L3400 short-circuit, `moveFocus`/`handleDateSelect` past-guards, `firstAvailableDate`, `dateTabIndexByKey`) becomes correct without per-site edits; `isSelected = isSameDay(selectedDate, date)` was already cell-coordinate-consistent.

---

#### Issue W1-06-F-06-4: Double-mapping in submit chain degrades friendly copy to generic fallback
- **Severity:** 🔴 HIGH
- **Location:** `submitCalcomBooking` catch L6011–L6017 (first mapping); `handleSubmitBooking` L8005–L8010 (second mapping)
- **Wave 1 Discovery:** `submitCalcomBooking`'s catch calls `mapCalcomError` for non-timeout errors; `handleSubmitBooking`'s failure branch calls `mapCalcomError` again on `result.error`. For network/timeout errors, `result.error` is already-friendly copy; the second mapping degrades `copy.networkError` to the generic fallback.
- **Wave 2 Verification:** W2-25 (Edge Case 18) ESCALATED severity Medium → High. Confirmed with broader impact than Wave 1 documented: the double-mapping degrades not just `copy.networkError` but ALSO `copy.submitTimeoutError` (the timeout path) and (catch-branch) `copy.credentialError`. The "idempotent for current default copy" claim in Wave 1 is **incorrect** — the timeout and network paths degrade even with default copy.
  - Repro trace (timeout): `result.error = copy.submitTimeoutError` ("The booking service took too long to respond. Please try again."), `result.errorCode = "TIMEOUT"`. Second `mapCalcomError("The booking service took too long to respond. Please try again.", "TIMEOUT", ...)` → switch on "TIMEOUT" → no match → substring heuristics → no match → returns `copy.errorFallbackMessage` = "Something went wrong while submitting your booking. Please try again." Friendly timeout message is degraded to the generic fallback.
- **Root Cause Analysis:** `submitCalcomBooking` returns a `SubmitBookingResult` with `error: string`. The `handleSubmitBooking` consumer does not know whether `error` is already-friendly copy or a raw Cal.com message; it re-maps defensively. The re-mapping degrades already-friendly strings.
- **Impact:** Visitors who hit a timeout, network failure, or (catch-branch) credential error see the generic "Something went wrong" message instead of the targeted, friendly copy the engine carefully crafted. Affects every POST submit that fails via the catch branch.
- **Recommended Remediation:**
```typescript
// Option A (preferred): Return RAW error from submitCalcomBooking, let handleSubmitBooking do the single mapping.
// In submitCalcomBooking catch (L6011-L6017):
error: timedOut
    ? copy.submitTimeoutError
    : errObj?.message || "",  // raw message, not pre-mapped
errorCode: timedOut ? "TIMEOUT" : errObj?.code || errObj?.errorCode || "",

// Option B: Add an alreadyMapped flag to SubmitBookingResult:
type SubmitBookingResult = {
    success: true; ...
} | {
    success: false;
    error: string;
    errorCode: string;
    alreadyMapped?: boolean;  // when true, skip the second mapCalcomError call
};

// Then in handleSubmitBooking (L8005-L8010):
const errorMessage = result.alreadyMapped
    ? result.error
    : mapCalcomError(result.error || copy.unknownErrorLabel, result.errorCode, errorCopy, copy.errorFallbackMessage);
```

- **Status: Completed** — Valid (Option B implemented). Added `alreadyMapped?: boolean` to `SubmitBookingResult`. Set `alreadyMapped: true` on the three pre-friendly paths: catch (timeout → `submitTimeoutError`, network → mapped copy), `EMPTY_RESPONSE`, and the new `!res.ok` branch split where no machine-readable API message exists (→ `httpStatusTemplate`, already visitor-facing). The `!res.ok` branch with an actual Cal.com error message still returns the RAW message + code so the consumer's single `mapCalcomError` pass maps it correctly. `handleSubmitBooking` now skips re-mapping when `alreadyMapped` is true — the friendly timeout/network/empty-response copy no longer degrades to the generic fallback.
---

#### Issue W1-16-N1: `Intl.DateTimeFormat` constructed inline ~84× per CalendarGrid render; ~200–700× per Cal.com fetch settle
- **Severity:** 🟠 MEDIUM-HIGH
- **Location:** `getMinutesInTimeZone` L647–L670; `getDateKeyInTimeZone` L679–L698; CalendarCell aria-label L1633; DST-collision path L3322 / L3334; CalendarGrid `.map` L1869–L1873 (per-cell `dateKeyOf` + `hasAvailability`); fetch memos `availableDates` L7380–L7391, `slotsForSelectedDate` L7394–L7408
- **Wave 1 Discovery:** Six inline construction sites produce ~84 `Intl.DateTimeFormat` allocations per CalendarGrid render (42 cells × `dateKeyOf` + `hasAvailability`) and ~200–600 per Cal.com fetch settle. No module-level cache.
- **Wave 2 Verification:**
  - W2-21 (Source Truth): VERIFIED-ACCURATE — the 84-construction count is correct (42 cells × 2 `dateKeyOf` invocations). The Cal.com-fetch cascade (~200–700 constructions) is also correct.
  - W2-22 (False Positive Filter): downgraded to Low — claimed V8 / SpiderMonkey maintain an internal `Intl.DateTimeFormat` cache that reduces per-construction cost from ms to µs.
  - W2-35 (Re-render Optimization Safety): **REFUTED W2-22's downgrade.** Modern V8 (since ~2020) does NOT internally cache `Intl.DateTimeFormat` instances — the internal string-keyed cache was removed because it caused memory leaks. W2-35 verdict: ✅ NET-WIN — apply the cache. "Eliminates ~95% of `Intl.DateTimeFormat` cost on tz-aware calendars. Per-hover goes from ~50–170 ms to < 1 ms. Per-fetch goes from ~100–1400 ms to ~1–4 ms. Highest-ROI single fix in this audit."
- **Root Cause Analysis:** Two hot helpers (`getMinutesInTimeZone` and `getDateKeyInTimeZone`) call `new Intl.DateTimeFormat("en-US", {...})` with a structurally identical options object on every invocation. The construction is genuinely per-call work — there is no engine-level memoization.
- **Impact:** On tz-aware calendars (the recommended config per W1-07-F4): ~50–170 ms per hover/focus, ~100–1400 ms per Cal.com fetch settle. Visible jank on mid-tier mobile.
- **Recommended Remediation:**
```typescript
// Module-level cache, keyed by locale + JSON.stringify(options):
const dtfCache = new Map<string, Intl.DateTimeFormat>();

function getCachedDtf(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${locale}|${JSON.stringify(options)}`;
    let dtf = dtfCache.get(key);
    if (!dtf) {
        dtf = new Intl.DateTimeFormat(locale, options);
        dtfCache.set(key, dtf);
    }
    return dtf;
}

// Then in getMinutesInTimeZone (L647):
function getMinutesInTimeZone(date: Date, timeZone: string): number {
    try {
        const parts = getCachedDtf("en-US", {
            timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        }).formatToParts(date);
        // ...
    } catch { /* ... */ }
}

// Apply the same to getDateKeyInTimeZone (L679), the DST-collision paths (L3322/L3334),
// and consider replacing CalendarCell aria-label's date.toLocaleDateString(...) with
// a cached DateTimeFormat as well.
```
Maximum cache size per session: ≤ 5 entries (one per options-shape × one locale × one tz). Negligible memory (~1–4 KB).

- **Status: Completed** — Valid. Added module-level `dtfCache` + `getCachedDateTimeFormat(locale, options)` (keyed `locale|JSON.stringify(options)`). Wired into all four `new Intl.DateTimeFormat` sites: `getMinutesInTimeZone` (per-slot hot path), `getDateKeyInTimeZone` (per-slot + per-cell hot path), and both DST-collision `abbrevOf` formatters (`short` + `longOffset`). The remaining `toLocaleDateString` sites are cold paths (once per render at most) and left as-is per the report's "consider" wording. Cache shape count is bounded by the number of exposed timezones.
---

#### Issue W1-09-NEW-02: `buildCalendarDeepLink` Outlook URL uses Google's compact-UTC format
- **Severity:** 🟠 Medium
- **Location:** `buildCalendarDeepLink` L6450–L6474; specifically L6463–L6473
- **Wave 1 Discovery:** `buildCalendarDeepLink` uses the same `toCompact` formatter (basic ISO with `Z` suffix) for both Google and Outlook. Outlook's `startdt`/`enddt` expects extended ISO with separators and no `Z`, interpreted as the viewer's local time.
- **Wave 2 Verification:** W2-21 confirmed VERIFIED-ACCURATE: `Date#toISOString()` returns `"2026-08-16T14:30:00.000Z"`. After `toCompact` strips dashes, colons, and the `.\d{3}` millisecond fragment, the result is `"20260816T143000Z"` — basic ISO-8601 with `Z` suffix. Both branches use this format. The Google branch is correct; the Outlook branch is non-conformant.
- **Root Cause Analysis:** Single `toCompact` formatter shared across both providers; Outlook's different format requirement was not accounted for.
- **Impact:** Outlook users clicking "Add to Outlook Calendar" get a calendar event at the wrong instant (or Outlook may reject the URL).
- **Recommended Remediation:**
```typescript
// Add a separate formatter for Outlook (extended ISO, no Z):
const toExtended = (d: Date) =>
    d.toISOString()
        .replace(/\.\d{3}Z$/, "");  // strip ".mmmZ" → "2026-08-16T14:30:00"

// Then in the Outlook branch:
return `https://outlook.live.com/calendar/0/action/compose?subject=${text}&startdt=${toExtended(start)}&enddt=${toExtended(end)}&body=${details}`;
```

- **Status: Completed** — Valid. `buildCalendarDeepLink` now uses a separate `toExtended` formatter for the Outlook branch (extended ISO with `-`/`:` separators, millisecond suffix and `Z` stripped: `2026-08-16T14:30:00`), per Outlook's `startdt`/`enddt` contract. The Google branch keeps its correct basic-ISO UTC `toCompact` form unchanged.

---

#### Issue W1-09-NEW-03: Cross-month arrow navigation focus-restore race
- **Severity:** 🟠 Medium
- **Location:** `moveFocus` L4001–L4029 (specifically L4013–L4026); PageUp/PageDown L3072/L3090; post-commit effect L3113–L3135
- **Wave 1 Discovery:** `moveFocus` calls `React.startTransition(() => setVisibleMonth(monthStart))` for cross-month arrow moves and immediately schedules an rAF that queries `[data-date-key="…"]` and focuses it. If the transition is deferred past the next frame, the rAF fires before the new grid commits; the target cell either doesn't exist or is a disabled spillover in the old grid. PageUp/PageDown avoid this via `pendingMonthFocusRef.current = true` + the post-commit effect.
- **Wave 2 Verification:**
  - W2-21: VERIFIED-ACCURATE.
  - W2-27 (Controlled Sync): CONFIRMED — "the asymmetric focus strategy between PageUp/PageDown (post-commit via `pendingMonthFocusRef`) and cross-month arrows (single rAF)" is the root cause.
  - W2-29 (Focus Restoration, Scenario 5): CONFIRMED — "LOST (intermittently, under scheduler load). W1-09-NEW-03 confirmed real and unresolved."
- **Root Cause Analysis:** Cross-month arrow path bypasses `pendingMonthFocusRef` entirely — relies on a single rAF. Under load (transition deferred past the next frame), the rAF fires while the old grid is still mounted.
- **Impact:** Under scheduler load, focus drops to `document.body` after the new month commits and the old spillover cell unmounts. Keyboard-only users lose their place.
- **Recommended Remediation:**
```typescript
// Add a pendingMonthFocusTargetRef:
const pendingMonthFocusTargetRef = React.useRef<string | null>(null);

// In moveFocus cross-month branch:
if (!inVisibleMonth) {
    const monthStart = new Date(target.getFullYear(), target.getMonth(), 1);
    pendingMonthFocusRef.current = true;
    pendingMonthFocusTargetRef.current = dateKeyOf(target);  // <-- target key
    React.startTransition(() => setVisibleMonth(monthStart));
    return;  // <-- don't schedule the rAF; let the post-commit effect handle it
}

// In the post-commit effect (L3113-L3135):
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
        // Fallback: [tabindex="1"] cell (the existing behavior)
        const activeCell = rootRef.current?.querySelector<HTMLElement>('[tabindex="1"]');
        if (activeCell) {
            activeCell.focus();
            return;
        }
        rootRef.current?.querySelector<HTMLElement>("[data-be-month-heading]")?.focus();
    });
    return () => cancelAnimationFrame(focusRaf);
}, [visibleMonth]);
```

- **Status: Completed** — Valid. `useCalendarNavigation` now exports `pendingMonthFocusTargetRef`; `moveFocus`'s cross-month branch sets `pendingMonthFocusRef.current = true` + records the target `dateKeyOf(target)` and returns WITHOUT scheduling the racy single rAF. The post-commit effect (runs on `visibleMonth` change) now prefers the explicit target key (`[data-date-key="…"]` focus), falling back to the existing `[tabindex="1"]` → month-heading ladder when no target was armed. Cross-month arrow focus is now identical to the already-proven PageUp/PageDown contract.

---

#### Issue W1-06-F-06-1: `MALFORMED_JSON_ERROR` sentinel dead in POST path
- **Severity:** 🟠 Medium
- **Location:** `submitCalcomBooking` catch L5999–L6019; constant L6092; `readJson` L6094–L6100; GET-side use L5695; POST-side `readJson` call L5924 (BEFORE `!res.ok` check at L5946)
- **Wave 1 Discovery:** `readJson` throws `new Error(MALFORMED_JSON_ERROR)` on JSON parse failure. The slots GET path branches on this sentinel (L5695). The POST path (`submitCalcomBooking` catch) does NOT — it routes through `mapCalcomError`, which falls to the generic fallback. Additionally, on the POST path `readJson` is called BEFORE `!res.ok`, so malformed body on 4xx/5xx skips status-aware error mapping → status info is lost.
- **Wave 2 Verification:** W2-21 VERIFIED-ACCURATE. W2-25 (Edge Case 8) CONFIRMED with status-loss addendum: "the status information (e.g. 500 with HTML body) is lost."
- **Impact:** Visitors cannot distinguish "service returned junk" from "service rejected the booking". POST path also loses HTTP status context.
- **Recommended Remediation:**
```typescript
// 1. Add a malformedResponseError copy token to ErrorCopy.
// 2. In submitCalcomBooking catch (L6011-L6017), branch on the sentinel:
error: timedOut
    ? copy.submitTimeoutError
    : errObj?.message === MALFORMED_JSON_ERROR
        ? copy.malformedResponseError
        : mapCalcomError(errObj?.message || "", errObj?.code || errObj?.errorCode, copy),
// 3. Reorder: call readJson AFTER the !res.ok check (or catch the sentinel before status check)
//    so status info is preserved.
```
- **Status: Completed** — All three remediation steps shipped: (1) added `malformedResponseError` to `ErrorCopy` + `ERROR_COPY_DEFAULTS` (+ author-facing PropertyControl, plus the paired `badRequestError` from W1-06-F-06-3); (2) the POST catch now branches `errObj?.message === MALFORMED_JSON_ERROR` → `copy.malformedResponseError` before falling through `mapCalcomError`, and sets `errorCode: MALFORMED_JSON_ERROR`; (3) instead of reordering the throwing `readJson` (the GET path still relies on the sentinel-throw contract), the POST path now parses the body tolerantly via `res.text()` → `JSON.parse` BEFORE the `!res.ok` branch (`bodyWasMalformed` flag), so a 4xx/5xx with a non-JSON body preserves its HTTP status context and routes to `httpStatusTemplate`, while a 2xx malformed body maps to `malformedResponseError` (empty 2xx keeps `emptyResponseError`).

---

#### Issue W1-06-F-06-2: ICS `DESCRIPTION` truncated AFTER escaping (can split escape sequence)
- **Severity:** 🟠 Medium
- **Location:** `buildIcsDataUri` L6386–L6388; `escapeIcsText` L6289–L6295
- **Wave 1 Discovery:** `escapeIcsText(description).slice(0, 500)` can split a 2-char escape sequence (e.g. `\;` → `\` dangling). Strict RFC 5545 parsers may drop the DESCRIPTION or the VEVENT.
- **Wave 2 Verification:** W2-21 VERIFIED-ACCURATE: each escape is exactly 2 chars (`\\`, `\;`, `\,`, `\n`). If the escaped string's 500th char is a `\`, the slice cuts the escape in half. `effectiveMaxLength` for the textarea is 1000 chars, so the 500-char DESCRIPTION cap is reachable in practice.
- **Impact:** Strict RFC 5545 calendar clients may drop the DESCRIPTION or fail to import the VEVENT.
- **Recommended Remediation:**
```typescript
// Slice raw, then escape (standard correction):
...(description
    ? [`DESCRIPTION:${escapeIcsText(description.slice(0, 500))}`]
    : []),
```

- **Status: Completed** — Valid. `buildIcsDataUri` now slices the raw description to 500 chars BEFORE `escapeIcsText`, so no escape sequence (`\\`, `\;`, `\,`, `\n`) can be cut in half by the truncation.

---

#### Issue W1-06-F-06-3: `mapCalcomError` lacks 429 / 5xx / 400 / 409 code branches
- **Severity:** 🟠 Medium
- **Location:** `mapCalcomError` L6047–L6073
- **Wave 1 Discovery:** Switch handles UNAUTHORIZED/INVALID_API_KEY, MAXIMUM_NUMBER_OF_BOOKINGS/BOOKING_LIMIT/NO_AVAILABILITY/SLOT_NOT_AVAILABLE/BOOKING_NOT_FOUND, INVALID_EMAIL_ADDRESS/INVALID_EMAIL. Substring heuristics cover "already"+"booked", "outside"|"availability", "invalid"+"email", "unauthorized"|"api key", "network"|"fetch". No 429/5xx/400/409 code branches.
- **Wave 2 Verification:** W2-21 VERIFIED-ACCURATE. W2-25 (Edge Cases 2, 3, 6) confirmed: "no `RATE_LIMIT_EXCEEDED`/`TOO_MANY_REQUESTS`/`INTERNAL_ERROR`/`SERVER_ERROR`/`BAD_REQUEST`/`VALIDATION_ERROR` cases; substring heuristics have no 'rate'/'internal'/'server' matchers."
- **Impact:** POST 429/5xx/400 falls to generic fallback. GET path compensates by branching on HTTP status directly (L5666–L5688); POST path does not.
- **Recommended Remediation:**
```typescript
// Add to the switch (L6047-L6063):
case "RATE_LIMIT_EXCEEDED":
case "TOO_MANY_REQUESTS":
    return copy.rateLimitError || copy.errorFallbackMessage;  // new token or reuse
case "INTERNAL_ERROR":
case "SERVER_ERROR":
    return copy.slotsUnavailableError;  // reuse existing slot-unavailable copy
case "BAD_REQUEST":
case "VALIDATION_ERROR":
    return copy.badRequestError || copy.errorFallbackMessage;

// Add to substring heuristics (L6064-L6072):
if (m.includes("rate") || m.includes("too many requests")) return copy.rateLimitError || copy.errorFallbackMessage;
if (m.includes("internal") || m.includes("server error")) return copy.slotsUnavailableError;
```
- **Status: Completed** — `mapCalcomError` now branches on the 429-class codes (`RATE_LIMIT_EXCEEDED`/`RATE_LIMIT`/`TOO_MANY_REQUESTS` → `slotsRateLimitGenericError`), the 5xx-class codes (`INTERNAL_ERROR`/`SERVER_ERROR`/`INTERNAL_SERVER_ERROR` → `slotsUnavailableError`), and the 400-class codes (`BAD_REQUEST`/`VALIDATION_ERROR`/`INVALID_REQUEST` → new dedicated `badRequestError` token added to `ErrorCopy`/`ERROR_COPY_DEFAULTS` + PropertyControl, per the "new token" option). Substring heuristics gained `"rate limit"`/`"too many requests"` → rate-limit copy and `"internal"`/`"server error"` → unavailable copy; the bare `"rate"` substring was deliberately NOT added (too collision-prone with e.g. "rated", "migration"), while `"rate limit"`/`"too many requests"` are the actual Cal.com phrasings.

---

#### Issue W2-29-N1 (NEW): `handleDateSelect` rAF returns null when `slotsLoading`; focus silently stays on the calendar cell
- **Severity:** 🟠 Medium
- **Location:** `handleDateSelect` L3957–L3964 (rAF); TimeSlotList loading branch L2650–L2666
- **Wave 1 Discovery:** Not flagged — W1-09 focused on the steady-state case (slots cached).
- **Wave 2 Verification:** W2-29 (Scenario 6) surfaced this as a NEW finding. When the user picks a date for a month whose Cal.com slots haven't been fetched yet (or are being re-fetched), the rAF fires while `slotsLoading=true`. At that moment the slot list renders only the `loadingLabel` div — no `button[role='radio']` exists in the DOM. The querySelector returns `null`, the `?.focus()` is a no-op, and focus stays on the just-clicked calendar cell. When the slots finally arrive (typically 200-1000ms later), nothing re-triggers the focus move. The user is stuck on the calendar cell and must Tab manually.
- **Reproducible scenarios:**
  - First visit to the datetime step: user picks a date within ~300ms of mount.
  - User pages to a new month then picks a date before the new month's fetch resolves.
  - User retries after a slot-taken error and picks the same date quickly.
- **Impact:** W1-09-DT-AutoFocus's stated goal ("keyboard users had to Tab through every remaining date cell to reach the new day's slots — WCAG 2.4.3") is defeated in the async-fetch case.
- **Recommended Remediation:**
```typescript
const pendingSlotListFocusRef = React.useRef(false);

// In handleDateSelect (after the existing rAF):
pendingSlotListFocusRef.current = true;

// New effect:
React.useEffect(() => {
    if (!pendingSlotListFocusRef.current) return;
    if (slotsLoading) return;          // wait for the fetch to resolve
    if (timeOptions.length === 0) return;   // nothing to focus yet
    pendingSlotListFocusRef.current = false;
    const raf = requestAnimationFrame(() => {
        rootRef.current
            ?.querySelector<HTMLButtonElement>("button[role='radio']:not([disabled])")
            ?.focus();
    });
    return () => cancelAnimationFrame(raf);
}, [slotsLoading, timeOptions]);
```
- **Status: Completed** — Implemented per remediation with two hardening deviations: (1) the ref + arming (`pendingSlotListFocusRef.current = true` after the existing rAF) + effect live in `DateAndTimeInline` (the component that owns `handleDateSelect`, `rootRef`, `slotsLoading`, and `timeOptions` — the audit's `handleDateSelect` L-citations point inside it); (2) when the fetch resolves with an EMPTY slot list (`timeOptions.length === 0`), the flag is disarmed immediately instead of retained — a focus move onto a nonexistent radio is meaningless, and retaining would re-fire on every unrelated slots refetch. The completion rAF is tracked via the existing `focusRafRef` contract (cancellable by a follow-up move or unmount), matching moveFocus/handleDateSelect conventions. The async-fetch focus gap (first-visit pick, month-page pick, quick retry pick) is closed: once `slotsLoading` clears and the day's buttons exist, the first pickable slot receives focus.

---

#### Issue W2-31-NEW-1 (NEW): `buildIcsDataUri` lacks NaN guard on `endDate`; hostile `slot.end` crashes SuccessScreen render
- **Severity:** 🟠 Medium (robustness) / 🟢 Low (privacy)
- **Location:** `buildIcsDataUri` L6345–L6360; `toIcsDate(endDate)` call L6335–L6339
- **Wave 1 Discovery:** Not flagged directly — surfaced by W2-31 as a downstream consequence of W1-15-TS-14.
- **Wave 2 Verification:** W2-31 (NEW finding) traced: a hostile `slot.end` (e.g., `{}`) survives restore (per W1-15-TS-14, only `date` is re-narrowed) and throws `RangeError: Invalid time value` from `toIcsDate(endDate).toISOString()` at L6337, crashing the SuccessScreen render. Reachable only via hostile-self-attack (manual `sessionStorage` edit) + successful booking POST.
- **Impact:** Hostile-self-attack vector. If a visitor manually edits `sessionStorage` to inject a hostile `slot.end` and then completes a booking, the SuccessScreen crashes during render.
- **Recommended Remediation:**
```typescript
// In buildIcsDataUri, wrap the endDate derivation in a NaN guard:
let endDate: Date;
if (slotEnd instanceof Date && !Number.isNaN(slotEnd.getTime())) {
    endDate = slotEnd;
} else if (typeof slotEnd === "string") {
    const parsed = new Date(slotEnd);
    endDate = Number.isNaN(parsed.getTime()) ? new Date(startDate.getTime() + DEFAULT_MEETING_DURATION_MS) : parsed;
} else {
    endDate = new Date(startDate.getTime() + DEFAULT_MEETING_DURATION_MS);
}

// Alternatively, wrap the toIcsDate(endDate).toISOString() call in try/catch returning "".
```
Pairs with W1-15-TS-14's `isBookingPayload` runtime guard for defense-in-depth.

- **Status: Completed** — Valid. `buildIcsDataUri` now derives `endDate` from `new Date(slot.end)` only when the parse yields a valid (non-NaN) Date; any other value (hostile `end`, junk string) falls back to `startDate + DEFAULT_MEETING_DURATION_MS`. Also added a symmetric NaN guard on `startDate` (unparseable ISO slot time) so neither `toIcsDate(...).toISOString()` call can throw `RangeError: Invalid time value` and crash the SuccessScreen render. Pairs with the W1-15-TS-14 guard at the restore boundary.

---

#### Issue W1-07-N1: `replaceCopyTokens` & `buildNotesPayload` omit `timeZone` from `toLocaleDateString`
- **Severity:** 🟢 Low
- **Location:** `replaceCopyTokens` L6157–L6188 (specifically L6172–L6186); `buildNotesPayload` L6264–L6276; SuccessScreen L11002
- **Wave 1 Discovery:** Both the `{date}` copy-token replacement and the notes date-prefix format the slot date via `toLocaleDateString(locale, { weekday, year, month, day })` with NO `timeZone` option. SuccessScreen and ReviewStepBody use `getMinutesInTimeZone`-derived labels (visitor-tz). Inconsistency between sibling strings shown simultaneously.
- **Wave 2 Verification:** W2-26 (Case 10) CONFIRMED-LOW via Node trace: `TZ=America/New_York`, slot `2024-12-15T23:30:00Z`, no `timeZone` option → "Sunday, December 15, 2024" (browser-local). With `timeZone:"Europe/Athens"` option → "Monday, December 16, 2024" (correct).
- **Impact:** Visible UI labels and copy/notes labels disagree whenever browser tz ≠ visitor tz and the slot's UTC instant is on a different calendar date in the two zones.
- **Recommended Remediation:**
```typescript
// Wrap in try/catch RangeError and add timeZone option (mirror CalendarCell aria-label at L1633):
const date = slot
    ? /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
        ? new Date(slot.time24h).toLocaleDateString(pageLocale(), {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            ...(isValidTimeZone(timeZone) ? { timeZone } : {}),
        })
        : slot.date.toLocaleDateString(pageLocale(), {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            ...(isValidTimeZone(timeZone) ? { timeZone } : {}),
        })
    : "";
```
- **Status: Completed** — Both `replaceCopyTokens` and `buildNotesPayload` gained an optional trailing `timeZone?: string` parameter; each builds its date-format options with `...(isValidTimeZone(timeZone) ? { timeZone } : {})` (the exact CalendarCell aria-label guard pattern, plus a `try/catch`-safe `Intl` path already inherent to `toLocaleDateString`). All three call sites thread the visitor's zone: the submit-path `buildNotesPayload`, the SuccessScreen `buildNotesPayload` (ICS DESCRIPTION), and both `replaceCopyTokens` calls (success title + subtitle). The `{date}` copy token, the .ics notes date-prefix, and the on-screen success label now all format the slot date in the visitor's chosen zone and can no longer disagree on cross-zone bookings.

---

#### Issue W1-07-N2: ICS filename uses UTC date slice
- **Severity:** 🟢 Low
- **Location:** SuccessScreen `icsDateStamp` L11066; download anchor L11260 (post-shift)
- **Wave 1 Discovery:** `icsDateStamp = iso.slice(0, 10)` extracts the UTC date portion of `slot.time24h`, mismatching the visitor-tz date displayed on the SuccessScreen. A NYC visitor booking a slot at `2024-12-15T23:30:00Z` sees "Monday, December 16, 2024" on the screen but downloads `booking-2024-12-15.ics`.
- **Wave 2 Verification:** W2-21 VERIFIED-ACCURATE: `iso.slice(0, 10)` extracts the first 10 chars of the ISO string — for `slot.time24h = "2024-12-15T23:30:00Z"`, this is `"2024-12-15"` (UTC date), NOT the visitor-tz date.
- **Impact:** Filename vs. on-screen date mismatch on cross-tz bookings.
- **Recommended Remediation:**
```typescript
const icsDateStamp = (() => {
    if (!values[SELECTED_SLOT_KEY]) return "";
    const slot = values[SELECTED_SLOT_KEY];
    const iso = /^\d{4}-\d{2}-\d{2}T/.test(slot.time24h)
        ? slot.time24h
        : slot.date.toISOString();
    // Use visitor-tz date key instead of UTC slice:
    return getDateKeyInTimeZone(new Date(iso), timeZone || "");
})();
```
- **Status: Completed** — `icsDateStamp` now returns `getDateKeyInTimeZone(new Date(iso), timeZone || "")` instead of the UTC `iso.slice(0, 10)`; that helper emits the YYYY-MM-DD date key in the visitor's zone (falling back to browser-local for an invalid zone). The .ics download filename now matches the visitor-tz date displayed on the SuccessScreen — a NYC visitor with a late-UTC slot downloads `booking-2024-12-16.ics`, agreeing with the on-screen "Monday, December 16, 2024". Pairs with W1-02-F28's now-brandable prefix.

---

#### Issue W1-07-N4: `visibleMonth` initialised from browser-local `new Date()`
- **Severity:** 🟢 Low
- **Location:** `visibleMonth` useState L2930–L2934
- **Wave 1 Discovery:** When `initialVisibleMonth` is not provided, `visibleMonth` is seeded from `new Date()` (browser-local). When browser tz is ahead of/behind visitor tz across a month boundary, the calendar opens on the wrong month relative to the visitor-tz "today".
- **Wave 2 Verification:** W2-26 (Case 12) CONFIRMED-LOW via concrete scenario: browser Kiritimati +14, visitor NYC -05:00, "now" = `2025-01-01T03:00:00Z` → browser month = January 2025, but visitor-tz "today" = December 31 2024 → calendar opens on January, visitor must page back.
- **Impact:** Cosmetic first-paint issue; visitor can page back.
- **Recommended Remediation:**
```typescript
const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => {
    if (initialVisibleMonth) return initialVisibleMonth;
    const todayInTz = getTodayInTimeZone(timeZone);
    return new Date(todayInTz.getFullYear(), todayInTz.getMonth(), 1);
});
```
- **Status: Completed** — `useCalendarNavigation` gained a `timeZone` option and now seeds `visibleMonth` from the visitor-tz "today" instead of the browser-local `new Date()`. The hook already receives `today` (a `getTodayInTimeZone` product in cell coordinates, per W1-09-NEW-01), so the lazy initializer uses `new Date(today.getFullYear(), today.getMonth(), 1)` — same effect as the remediation's `getTodayInTimeZone(timeZone)` call without duplicating the computation, and the call site threads `timeZone` through. The calendar now opens on the month the visitor's zone is actually in, not the browser's.

---

#### Issue W1-07-N5: Calendar month/year header uses browser-local zone
- **Severity:** 🟢 Low
- **Location:** `monthName` L2962–L2964; `yearLabel` L2966–L2968
- **Wave 1 Discovery:** `monthName` and `yearLabel` are derived from `visibleMonth`'s browser-local components with no `timeZone` option threaded through `toLocaleDateString`. For very large tz offsets, the displayed header can disagree with the visitor-tz dates shown on the cells.
- **Wave 2 Verification:** W2-21 VERIFIED-ACCURATE.
- **Impact:** Header can disagree with cell labels for very large tz offsets (rare).
- **Recommended Remediation:** Derive from `getDateKeyInTimeZone(visibleMonth, timeZone)` parsed back into y/m, then format via `Intl.DateTimeFormat("en", { timeZone, month: "long" })`.
- **Status: Completed** — `useCalendarNavigation` now derives both header values from `visibleMonthKey = getDateKeyInTimeZone(visibleMonth, timeZone || "")`, the exact same visitor-tz date key the grid cells display (invalid zone → browser-local fallback, matching every other zoned helper). `yearLabel` is the key's year; `monthName` resolves the locale month name from the key's month index (`new Date(2000, m-1, 1).toLocaleDateString(pageLocale(), {month:"long"})`) — a month name is zone-independent, so looking it up by index keeps full locale awareness while the Y/M comes from the visitor's zone. Header and cell labels now agree for all tz offsets.

---

#### Issue W1-07-N6: Demo-mode past-time validation uses cell-midnight epoch
- **Severity:** 🟢 Low
- **Location:** `validateStep` L5178–L5189
- **Wave 1 Discovery:** In `validateStep`, for DEMO mode slots (where `slot.time24h` is a bare `"HH:MM"` string with no `"T"`), the code falls back to `slotDateMs = slot.date.getTime()` — the CELL-MIDNIGHT epoch, NOT cell-midnight + the picked HH:MM. For today's demo cell, `startMs = today's midnight ≤ Date.now()` is TRUE for any time after midnight, so ALL of today's demo slots are flagged as "past time" — entirely unselectable.
- **Wave 2 Verification:** W2-26 (Case 13) CONFIRMED-LOW via Node trace: demo slot `time24h="18:00"` on today's cell, with "now" = today 15:00 → `startMs` (midnight today) ≤ `Date.now()` (today 15:00) → `true` → flagged as past. The future slot is wrongly rejected. W2-26 notes that `isTimeElapsed` (L3397–L3419) correctly reconstructs the demo slot's instant — the two paths disagree.
- **Impact:** In demo mode, all of today's future slots are blocked at "Continue" even though they're visibly not-yet-elapsed in the slot list.
- **Recommended Remediation:**
```typescript
// In validateStep (L5178-L5189), reconstruct the demo moment the same way isTimeElapsed does:
const slotDateMs = slot.date instanceof Date && !Number.isNaN(slot.date.getTime())
    ? slot.date.getTime()
    : Number.NaN;
const isIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slot.time24h);
let startMs: number;
if (isIso) {
    startMs = new Date(slot.time24h).getTime();
} else {
    // Demo mode: reconstruct from slot.date + slot.time24h:
    const demoMoment = new Date(slot.date);
    const mins = parseTimeToMinutes(slot.time24h);
    demoMoment.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    startMs = demoMoment.getTime();
}
if (Number.isNaN(startMs)) {
    errors[SELECTED_SLOT_KEY] = vc.pickDateTimeError;
} else if (startMs <= Date.now()) {
    errors[SELECTED_SLOT_KEY] = vc.pastTimeError;
}
```
- **Status: Completed** — `validateStep`'s datetime branch now reconstructs the demo-slot instant correctly. For an ISO `time24h` it parses the real UTC instant (unchanged); for a bare "HH:MM" demo string it no longer falls back to the CELL-MIDNIGHT epoch — instead it rebuilds the picked moment (`slot.date`'s midnight + `parseTimeToMinutes(slot.time24h)`), mirroring `isTimeElapsed`'s reconstruction. Today's future demo slots now pass the `startMs <= Date.now()` check instead of being wrongly rejected at Continue, and the two evaluation paths agree. A missing/invalid `slot.date` still degrades to `Number.NaN` → "please pick a date and time".

---

#### Issue W1-05-N2: HTTP 400 / 405–499 / network errors surface raw error strings on GET path
- **Severity:** 🟠 Medium (W2-25 nudged from Low to Low-Medium; conservative → Medium)
- **Location:** `useCalcomSlots` catch else-branch L5689–L5699
- **Wave 1 Discovery:** For HTTP 400, 405–499 (other than 401/403/404/429), or network-layer `TypeError("Failed to fetch")`, the GET-path visitor sees the raw `plainErr.message` — i.e. `"HTTP 400"` or `"Failed to fetch"` — instead of friendly `networkError`/`slotsFallbackError` copy.
- **Wave 2 Verification:** W2-25 (Edge Case 15) CONFIRMED — "Failed to fetch" and "HTTP 400" are developer-oriented strings that a non-technical visitor will find cryptic, and these are exactly the strings that surface during partial-outage / CORS / firewall conditions.
- **Impact:** Visitors see developer-oriented error strings during partial-outage / CORS / firewall conditions.
- **Recommended Remediation:**
```typescript
// In L5689-L5699, replace plainErr?.message preference with friendly fallback:
} else {
    message = plainErr?.message === MALFORMED_JSON_ERROR
        ? copy.slotsFallbackError
        : (plainErr instanceof TypeError || (plainErr?.name === "TypeError"))
            ? copy.networkError           // network failure / CORS
            : fallbackErrorLabel || copy.slotsFallbackError;
}
```
- **Status: Completed** — Implemented exactly per remediation: the GET else-branch (all remaining 400 / 405–499 / network-layer failures) no longer surfaces raw `plainErr?.message` (`"HTTP 400"`, `"Failed to fetch"`); a browser fetch TypeError (CORS / firewall / connection refused) now gets `copy.networkError`, and any other unclassifiable failure falls back to `fallbackErrorLabel || copy.slotsFallbackError`. The sentinel mapping from W2-25-F7 is preserved as the first branch.

---

#### Issue W1-05-N3: Invalid `start` ISO string produces `NaN` time labels
- **Severity:** 🟢 Low
- **Location:** `useCalcomSlots` slot mapping L5592–L5612 (specifically L5595, L5603)
- **Wave 1 Discovery:** If Cal.com returns a slot with an invalid `start` ISO string, `new Date(slot.start)` produces Invalid Date, `getMinutesInTimeZone` propagates NaN, `formatTimeLabel(NaN, "12h")` produces garbled text, and `value: slot.start` is sent to the calendar deep-link as a string.
- **Wave 2 Verification:** W2-39 (Edge Case 16) confirmed the downstream path. W2-34 confirmed the same root cause underlies W1-15-TS-10 (the `isCalSlot` unsoundness).
- **Impact:** One unusable slot row per malformed slot. No crash (defensive `try/catch` and `Number.isNaN` checks absorb the bad data).
- **Recommended Remediation:** Pairs with W1-15-TS-10's `normalizeCalSlot` mapper; add a `Number.isNaN(minutes)` filter after the `.map` step.

- **Status: Completed** — Valid, fixed together with W1-15-TS-10 via the `normalizeCalSlot` mapper plus a `.filter((slot) => !Number.isNaN(slot.minutes))` at the slot mapping step — malformed-slot rows are now dropped instead of rendered.

---

#### Issue W1-07-N7: `abbrevOf` empty-parens path still reachable in theory
- **Severity:** ⚪ Info
- **Location:** `abbrevOf` L3320–L3344
- **Wave 1 Discovery:** The W1-07-F5 fix's `longOffset` fallback closes the empty-parens case in production, but the original `"short"` path is still present.
- **Wave 2 Verification:** W2-26 (Case 7) confirmed: "W1-07-F5 fix verified. Both occurrences render as distinct ISO instants; `abbrevOf` distinguishes them via the tz abbreviation."
- **Impact:** None — defensive fallback is in place. Theoretical only.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed by W2-26 Case 7 at Wave 2: the W1-07-F5 `longOffset` fallback covers the empty-parens case, both occurrences render as distinct ISO instants, and `abbrevOf` distinguishes them via the tz abbreviation. The issue's own remediation is "None"; no action taken.

---

#### Issue W1-07-N8: `today` refresh timer tied to browser-midnight, not visitor-TZ midnight
- **Severity:** ⚪ Info
- **Location:** `today` refresh effect L3569–L3594
- **Wave 1 Discovery:** The `today` refresh timer fires at browser-local midnight (with 5-second buffer) and re-runs `getTodayInTimeZone(timeZone)`. The visitor-tz "today" can be stale for up to 24h after visitor-tz midnight if the visitor's browser tz is far from their visitor tz.
- **Wave 2 Verification:** W2-21 confirmed INFO status. W2-26 noted the timer correctly re-runs `getTodayInTimeZone(timeZone)` when it fires.
- **Impact:** Cosmetic — visitor-tz "today" can lag by up to 24h. No urgency.
- **Recommended Remediation:** Optional: compute the next visitor-tz midnight and use that as the timeout delay instead of next browser-local midnight.
- **Status: Stale / Skipped** — Cosmetic, sub-threshold: the `today` refresh timer already self-corrects on the next browser-local midnight (or any timeZone change), and the value itself is always tz-correct via `getTodayInTimeZone`. The only artifact is a cosmetic stale-day edge that self-recovers within 24h; the remediation is optional and the existing inline comment already documents the design. No change applied.

---

#### Issue W1-05-N4: No upper bound on cache Map size
- **Severity:** ⚪ Info
- **Location:** `customRegexCache` WeakMap L5028; `reDosCache` Map L5038
- **Wave 1 Discovery:** The `reDosCache` Map has no eviction policy.
- **Wave 2 Verification:** W2-35 (item 2) confirmed **FALSE POSITIVE** for `reDosCache` (see False Positives section). Bounded by author input (≤10 patterns realistic). `customRegexCache` is a WeakMap — entries auto-GC when fields are removed.
- **Impact:** None.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed false positive by W2-35 item 2 at Wave 2 (already in the False Positives section): `reDosCache` is bounded by author input (≤10 patterns realistic), and `customRegexCache` is a WeakMap whose entries auto-GC when fields are removed. The issue's own remediation is "None"; no action taken.

---

#### Issue W1-05-N5: `monthCacheKey` uses browser-local year/month, not visitor-TZ year/month
- **Severity:** ⚪ Info
- **Location:** `monthCacheKey` L5352–L5388
- **Wave 1 Discovery:** The Cal.com slots cache key is derived from `monthStart.getFullYear()` and `monthStart.getMonth()` — browser-local. When visitor tz ≠ browser tz, the cache key may not match the visitor-tz month being displayed.
- **Wave 2 Verification:** Not specifically re-verified by Wave 2. The ±2 day widening (W2-26-F26-1 verified fixed) means the fetch window covers the visitor-tz month regardless of cache key mismatch.
- **Impact:** Theoretical — cache may serve slots for a slightly different month than intended. Mitigated by the ±2 day fetch widening.
- **Recommended Remediation:** Optional: use `getDateKeyInTimeZone(monthStart, timeZone)` for the cache key.
- **Status: Completed** — `monthCacheKey` now derives its leading segment from `getDateKeyInTimeZone(monthStart, timeZone || "").slice(0, 7)` (visitor-tz "YYYY-MM") instead of browser-local `getFullYear()/getMonth()`, so the cache key matches the visitor-tz month the slot-fetch window was actually built around, both on write and on `has()` lookup.

---

### 6. Accessibility (ARIA & Focus)

#### Issue W1-11-NEW-FIND-1: Inline `outline: "none"` on ChoiceGroupInline option button overrides global `:focus-visible`
- **Severity:** 🟠 Medium
- **Location:** `renderOptionButton` L1140–L1202 (inline `outline: "none"` at L1179); CSS `:focus-visible` rule L9525–L9528 (post-W2-38 shift); `inputBaseStyle` L10550–L10564 (post-shift); `useKeyboardModality` L2861–L2885
- **Wave 1 Discovery:** The W1-11-A1 fix removed `outline: "none"` from `inputBaseStyle` and added a CSS `:focus-visible` rule for `:is(button, a, select)`. But the ChoiceGroupInline option button has its own inline `outline: "none"` at L1179, which wins by specificity (inline = 1,0,0,0 vs selector 0,2,1) and suppresses the global `:focus-visible` outline. The button's only focus indicator is the conditional `boxShadow` (gated on `isKeyboardModality && isFocused`), leaving a 1-frame window with no visible indicator during modality-detection race.
- **Wave 2 Verification:**
  - W2-21: VERIFIED-ACCURATE (primary citation). Secondary citations MISLOCATED due to W2-38's edits.
  - W2-22: TRUE-POSITIVE (downgraded to Low-Medium — race is 1 frame, below typical perception threshold). Overridden by conservative policy → Medium.
  - W2-29 (Scenario 18): CONFIRMED — "Not yet fixed. Inline `outline: 'none'` at L1179 suppresses the global `:focus-visible` rule."
- **Root Cause Analysis:** CSS specificity. Inline `style="outline: none"` has the highest possible specificity. The stylesheet rule cannot override it.
- **Impact:** A keyboard user Tabbing into a ChoiceGroupInline sees a visible focus ring on the option button only after `isKeyboardModality` state commits (one frame later). During that ~8–16ms window, there is no visible focus indicator. The cumulative effect across multiple tab stops can produce a "flickery" feel.
- **Recommended Remediation:**
```tsx
// In renderOptionButton (L1140-L1202), remove the inline outline: "none":
style={{
    minHeight: TOUCH_TARGET_MIN,
    borderRadius: radius,
    border: `1px solid ${isSelected || isHovered ? accentColor : borderColor}`,
    // ... REMOVE: outline: "none",
    boxShadow:
        isKeyboardModality && isFocused
            ? isSelected
                ? `inset 0 0 0 2px ${selectedTextColor}, inset 0 0 0 4px ${accentColor}`
                : focusInset
            : isSelected
                ? `inset 0 0 0 1px ${accentColor}`
                : "none",
    // ...
}}
```
(Or alternatively: keep `outline: "none"` but add a non-modality-gated fallback `boxShadow` so there is always a visible indicator.)
- **Status: Completed** — Inline `outline: "none"` removed from the ChoiceGroupInline option button (`renderOptionButton`, see W1-11-NEW-FIND-1 fix comment), so the global `:focus-visible` CSS rule is no longer suppressed; the conditional `boxShadow` remains as the primary keyboard-modality indicator.

---

#### Issue W1-11-NEW-FIND-2: Inconsistent focus-ring presentation across interactive elements
- **Severity:** 🟢 Low (W1-11 said Low-Medium)
- **Location:** ChoiceGroupInline option button L1140–L1202; CalendarCell L1604+; TimeSlotButton L2313+; 12h/24h toggle L2580+
- **Wave 1 Discovery:** Each radiogroup-style component uses a slightly different focus-ring strategy (inline `boxShadow` gated on `isKeyboardModality` vs CSS `:focus-visible` outline + inline `boxShadow`).
- **Wave 2 Verification:** W2-29 confirmed the inconsistency. No regression since Wave 1.
- **Impact:** Usability polish issue, not a hard WCAG violation. Each individual indicator meets the 3:1 contrast threshold.
- **Recommended Remediation:** Standardize on the CSS `:focus-visible` pattern (with `outline: 2px solid currentColor; outline-offset: 2px`) for all interactive elements; remove per-component inline `boxShadow` focus indicators.
- **Status: Completed** — Focus indication is now standardized on the existing scoped CSS rule `.be-motion-root :is(button, a, select):focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }` for every interactive element. All per-component inline `boxShadow` focus indicators were removed: ChoiceGroupInline option buttons, CalendarCell, TimeSlotButton, and the 12h/24h toggle each previously rendered a `boxShadow` gated on `isKeyboardModality && isFocused` — those are gone, and the remaining `boxShadow` branches mark SELECTED/HOVER state only. The now-dead plumbing (`useKeyboardModality` hook, ChoiceGroupInline `focusedIndex`/`focusInset` usage, `focusInset` memos, `focusColor` props on both DateAndTimeInline and ChoiceGroupInline, `isFocus`/`isKeyboardModality` prop threading through CalendarCell/CalendarGrid/TimeSlotList/TimeSlotButton) was pruned; the browser's native `:focus-visible` modality gating provides the same keyboard-only behavior with no JS state and no 1-frame indicator race.

---

#### Issue W1-11-NEW-FIND-3: 12h/24h time-format toggle is the only multi-button group without Arrow-key navigation
- **Severity:** 🟢 Low
- **Location:** 12h/24h toggle L2580+
- **Wave 1 Discovery:** ChoiceGroupInline, CalendarGrid, and TimeSlotList all implement roving-tabindex with arrow-key navigation. The 12h/24h toggle does not — it uses Tab to move between the two buttons.
- **Wave 2 Verification:** W2-29 confirmed. W2-28 confirmed the toggle is announced correctly via `aria-pressed` and `role="group"`.
- **Impact:** Inconsistency only. Not a WCAG violation.
- **Recommended Remediation:** Add ArrowLeft/ArrowRight handlers to the 12h/24h toggle buttons that move focus between the two buttons.
- **Status: Completed** — The two format buttons each register a ref (`formatButtonRefs.current["12h"|"24h"]`), and a shared `onKeyDown` handler moves focus between them: ArrowRight → "24h", ArrowLeft → "12h", plus Home/End per the radio-group convention already used in the engine. Both buttons keep `tabIndex={0}`, so Tab still reaches the group and arrows then cycle inside it, matching the engine's other button groups.

---

#### Issue W1-11-NEW-FIND-4: No global Escape handler
- **Severity:** 🟢 Low
- **Location:** N/A (no global Escape handler anywhere in the file)
- **Wave 1 Discovery:** There is no global Escape handler to dismiss modals, dropdowns, or overlays.
- **Wave 2 Verification:** W2-29 confirmed. Not a WCAG requirement.
- **Impact:** Convenience shortcut only.
- **Recommended Remediation:** Optional: add a global `keydown` listener for Escape that closes any open modal/dropdown.
- **Status: Stale / Skipped** — Dismissed as a no-op at resolution time: a full sweep of the file confirms there are no modals, dialogs, dropdowns, or popovers — the only `position: absolute` nodes are the sr-only live regions, the 12h/24h toggle thumb, and the exit-animated step container (all in-flow layout plumbing, not dismissible overlays). There is nothing for an Escape handler to close, and adding a global keydown listener for a target that does not exist would be dead code. The remediation was already flagged optional ("Not a WCAG requirement"); skipped rather than implemented against a hypothetical future overlay.

---

#### Issue W1-11-NEW-FIND-5: AnimatePresence exit window Tab race (MERGED with W1-10-OBS-4)
- **Severity:** 🟢 Low
- **Location:** AnimatePresence wrapper L9191–L9265; `[safeCurrentIndex]` effect L7738–L7744
- **Wave 1 Discovery:** Between Continue click and the `[safeCurrentIndex]` effect running, the OLD step's Continue button is still DOM-focused. AnimatePresence `mode="popLayout"` keeps the OLD `AnimatedStepContent` mounted (exiting) with `aria-hidden=true`. If the user presses Tab during this ~16ms window, focus moves to the next tabbable element INSIDE the exiting step (because `aria-hidden` does NOT affect Tab order — only SR visibility). When the OLD step finally unmounts, focus drops to `document.body`.
- **Wave 2 Verification:** W2-29 (Scenario 8) CONFIRMED: "Residual race noted in W1-11-NEW-FIND-5 — confirmed real but low-severity." W2-28 confirmed W1-10-OBS-4 (the merged duplicate) is also LOW.
- **Impact:** Keyboard-only users who Tab quickly during a step transition can lose focus to `document.body`. Recovery: Tab from page top.
- **Recommended Remediation:** Add `inert` to the exiting `motion.div` (or set `aria-hidden` + `tabIndex={-1}` on all focusable descendants). Framer Motion's `usePresence()` hook can be used to detect the exiting state.
- **Status: Completed** — `AnimatedStepContent` already derives the exiting state via Framer Motion's `usePresence()` (`isPresent`). It now also sets `inert={isPresent ? undefined : true}` on the `motion.div`, alongside the existing `aria-hidden`. While the old step plays its ~16ms AnimatePresence exit, the departing subtree is removed from BOTH the accessibility tree and the Tab order, so Tab can no longer land on its focusable elements and focus can't drop to `<body>` when it unmounts. (`inert` is a boolean prop natively supported by React 19.)

---

#### Issue W1-11-NEW-FIND-6: ErrorScreen Support-contact link uses `textSecondaryColor` for `currentColor` focus outline
- **Severity:** 🟢 Low
- **Location:** ErrorScreen support link L11550–L11569
- **Wave 1 Discovery:** The support link's focus outline uses `currentColor` (from the CSS `:focus-visible` rule), but the link's text color is `theme.textSecondaryColor`. Default themes pass; an author with a deliberately muted `textSecondaryColor` could fail the 3:1 contrast threshold.
- **Wave 2 Verification:** W2-29 confirmed. W2-38 confirmed the support link is otherwise compliant (~140 × 44 px touch target).
- **Impact:** Default themes pass. Only an author with a deliberately muted `textSecondaryColor` would hit this.
- **Recommended Remediation:** Set the link's `color` to `theme.textPrimaryColor` or `theme.accentColor` instead of `theme.textSecondaryColor`.
- **Status: Completed** — The ErrorScreen support-contact link's `color` is now `textPrimaryColor` (already destructured on ErrorScreen) instead of `textSecondaryColor`. Because its focus outline inherits `currentColor` from the global `:focus-visible` rule, the outline is now guaranteed to meet the 3:1 indicator-contrast threshold regardless of how muted the author sets `textSecondaryColor`.

---

#### Issue W1-10-OBS-1: `aria-atomic` not set on any live region
- **Severity:** 🟢 Low
- **Location:** All `aria-live` regions (step announcement L8798, slot pick L4195, character counters L10610/L10882, save-failed L9340, saved-answers L9295)
- **Wave 1 Discovery:** None of the live regions set `aria-atomic`. When the region's content updates, SR behavior varies: some SRs read only the changed text node; others read the entire region.
- **Wave 2 Verification:** W2-28 confirmed: "5/5 observations remain accurate characterizations of the current code."
- **Impact:** Inconsistent SR behavior across NVDA/JAWS/VoiceOver.
- **Recommended Remediation:** Add `aria-atomic="true"` to all live regions for consistent full-region re-announcement.
- **Status: Completed** — `aria-atomic="true"` added to every live region in the file: the step-announcement `<output>`, the slot-pick hidden region, the sr-only month announcement region, both character counters (textarea + text input), the save-failed notice, the saved-answers notice, the no-times banner, both canvas banner groups (setup/guardrail/empty-step/regex/theme verdict regions), the calendar header status wrapper, and the ErrorScreen/SuccessScreen assertive roots. Every aria-live region now re-announces its full content on change, consistently across NVDA/JAWS/VoiceOver.

---

#### Issue W1-10-OBS-2: Calendar month/year live region omits `role="status"`
- **Severity:** 🟢 Low
- **Location:** Calendar month/year header L2962–L2968
- **Wave 1 Discovery:** The month/year header is announced when it changes, but the container does not have `role="status"` or `aria-live`.
- **Wave 2 Verification:** W2-28 confirmed.
- **Impact:** SR users may not hear the month/year change when paging.
- **Recommended Remediation:** Wrap the month/year header in a `<span role="status" aria-live="polite">`.
- **Status: Completed** — The visible month/year header is now wrapped in `<span role="status" aria-live="polite" aria-atomic="true">` (per OBS-1), so SR users hear the month change when paging. The existing sr-only `announceMonthLabel` region remains for the authored announcement copy; the visible header itself now carries status semantics with the W1-07-N5 visitor-tz-derived month/year values.

---

#### Issue W1-10-OBS-3: `aria-current="step"` on progress text rows (semantic stretch)
- **Severity:** 🟢 Low
- **Location:** Progress text rows L9013–L9038 / L9132–L9154
- **Wave 1 Discovery:** The progress text rows use `aria-current="step"`, which is semantically intended for step indicators in multi-step processes. The current usage is on text rows, not on step links.
- **Wave 2 Verification:** W2-28 confirmed.
- **Impact:** Semantic stretch, not a WCAG violation.
- **Recommended Remediation:** Optional: remove `aria-current="step"` from text rows; reserve for actual step links.
- **Status: Completed** — `aria-current="step"` removed from both progress text rows (the top and bottom step counters). They remain visually styled rows that read step progress; the machine-readable announcement of step changes already comes from the single combined sr-only live region (W1-10-A2), so no SR information is lost. The token is now reserved for actual step indicators/links if one ever exists.

---

#### Issue W1-10-OBS-5: `aria-disabled` redundancy on disabled buttons
- **Severity:** 🟢 Low
- **Location:** Back/Continue buttons L9400/L9455
- **Wave 1 Discovery:** The Back/Continue buttons set both `disabled={isSubmitting}` AND `aria-disabled={isSubmitting}`. The `disabled` attribute already removes the button from the tab order and prevents clicks; `aria-disabled` is redundant.
- **Wave 2 Verification:** W2-28 confirmed.
- **Impact:** Redundant ARIA; some SRs may announce the button twice.
- **Recommended Remediation:** Remove `aria-disabled` when `disabled` is set.
- **Status: Completed** — Every `aria-disabled` that duplicated a native `disabled` attribute on the same element was removed: the ChoiceGroupInline option buttons (submit-freeze), CalendarCell unavailable days, and TimeSlotButton elapsed slots all keep only the native `disabled` attribute (which already removes them from the Tab order and blocks interaction). The Back/Continue buttons already carried only `disabled` + `aria-busy`. No element in the file now pairs redundant `aria-disabled` with `disabled`.

---

### 7. Sub-Component Inlining & Controlled Sync

#### Issue W1-08-F-08-05: `controlledValue` matching no option strands DOM focus
- **Severity:** 🟠 Medium
- **Location:** Presentation fallback L894–L899; effect L930–L944 (`idx < 0` early-return at L939); `tabIndex` L1165
- **Wave 1 Discovery:** When `controlledValue` matches no option, the F-08-04 effect early-returns at `idx < 0`, but the L894–L899 presentation fallback still flips `selected` to `parsedOptions[0].label`. Button 0 gains `tabIndex=0`; the previously-focused button flips to `tabIndex=-1`. Focus is stranded on an unreachable button.
- **Wave 2 Verification:**
  - W2-22: TRUE-POSITIVE (kept). W2-27 (Transition 1): CONFIRMED with NUANCE — "the strand is contingent on the user's pre-transition focus being on a non-zero index."
  - W2-29 (Scenario 17): CONFIRMED — "LOST (focus stranded on a non-tabbable button)."
- **Impact:** Keyboard-only users cannot Tab back into the radiogroup after the parent passes a non-matching `controlledValue`. Mouse recovery is required.
- **Recommended Remediation:**
```typescript
// In the F-08-04 effect (L930-L944), fall through to focusing index 0 when idx < 0:
React.useEffect(() => {
    if (controlledValue === undefined) return;
    if (lastUserPickRef.current === controlledValue) {
        lastUserPickRef.current = null;
        return;
    }
    const idx = parsedOptions.findIndex(
        (option) => option.label === controlledValue,
    );
    const focusIdx = idx >= 0 ? idx : 0;  // <-- fall through to 0 instead of returning
    const focusRaf = requestAnimationFrame(() => {
        buttonRefs.current[focusIdx]?.focus();
    });
    return () => cancelAnimationFrame(focusRaf);
}, [controlledValue, parsedOptions]);
```

- **Status: Completed** — Valid. The F-08-04 effect no longer early-returns on `idx < 0`; it now falls through to focusing index 0 (guarded only by `parsedOptions.length === 0`, where there is nothing to focus). Keyboard users can Tab back into the radiogroup after a non-matching controlled value, matching the presentation fallback that already flips button 0's tabIndex to 0. Pairing with the W1-08-F-08-06 value-based match means `idx` is resolved by `optionValue(option) === controlledValue`.

---

#### Issue W1-08-F-08-06: Duplicate-label options mis-select on click
- **Severity:** 🟠 Medium
- **Location:** `ChoiceOption` L729–L737 (no `value` field); `selectOption` L1052–L1063; `selectedIndex` L1113–L1115; `onClick` L1166
- **Wave 1 Discovery:** `ChoiceOption` has no `value` field. `selectOption(option.label)` passes the label. Parent's `controlledValue` is a string. `selectedIndex = findIndex(label === selected)` returns the first match, so clicking the second duplicate-label button re-selects the first.
- **Wave 2 Verification:**
  - W2-22: TRUE-POSITIVE (downgraded to Low — purely cosmetic, form value submitted is correct). Overridden by conservative policy → Medium.
  - W2-27 (Transition 2): CONFIRMED — "the visual + ARIA + roving-tabindex state visibly 'jumped' from button 1 to button 0 the instant the user clicked button 1."
- **Root Cause Analysis:** `ChoiceOption` has no `value` field. The label IS the form value. There is no way for the parent to disambiguate which "Apple" the user clicked.
- **Impact:** Visual highlight, `aria-checked`, and `tabIndex=0` "snap back" to the first matching option when the user clicks a duplicate-label button. Form value is unaffected. Read-side fixes (key=`${label}-${index}`, `tabIndex`, `aria-checked` via `selectedIndex`) are in place; write-side round-trip still goes through the label-as-value chokepoint.
- **Recommended Remediation:**
```typescript
// 1. Add optional value field to ChoiceOption:
interface ChoiceOption {
    label: string;
    value?: string;  // <-- NEW; defaults to label
    glyph?: string;
    image?: string;
    description?: string;
}

// 2. In selectOption (L1052-L1063), pass value (not label) when present:
const selectOption = React.useCallback(
    (option: ChoiceOption) => {
        const value = option.value ?? option.label;
        lastUserPickRef.current = value;
        if (controlledValue === undefined) {
            React.startTransition(() => setInternalSelected(value));
        }
        onChange?.(value);
    },
    [onChange, controlledValue],
);

// 3. In selectedIndex (L1113-L1115), match by value:
const selectedIndex = selected
    ? parsedOptions.findIndex((o) => (o.value ?? o.label) === selected)
    : -1;

// 4. In onClick (L1166), pass the option object (not just the label):
onClick={() => selectOption(option)}
```

- **Status: Completed** — Valid. Implemented per recommendation with a small hardening extension: added `value?: string` to `ChoiceOption` plus a shared `optionValue(option)` resolver (returns `value` when non-empty, else `label`). The write-side round-trip is now value-based everywhere: `selectOption` accepts the whole option object and emits `optionValue(option)` (called from `onClick`, `moveFocus`, Home/End); the read side (`selected` fallback, `selectedIndex`, `getInitialSelection`) matches by `optionValue(option) === selected`. Duplicate-label options are now distinguished by their distinct `value`, so the ring no longer snaps back to the first match. `lastUserPickRef` also stores the emitted value, keeping the external-change focus effect consistent.

---

#### Issue W1-08-F-08-07: Mount-seed still auto-passes required validation on first mount
- **Severity:** 🟢 Low
- **Location:** `getInitialSelection` L778–L791 (post-W2-39-M8 fix at L785–L790); mount-seed effect L989–L1002
- **Wave 1 Discovery:** On mount, the mount-seed effect calls `onChange?.(getInitialSelection(parsedOptions, defaultValue))`, which auto-selects the first non-empty option. For required choice fields, this means the field is "filled" before the user interacts — required validation passes on first Continue click without the user actually choosing.
- **Wave 2 Verification:** W2-39 (Edge Case 6) confirmed: W2-39-M8 fix at L785–L790 (committed since W1-20) closes the "empty first option auto-passes required validation" hole. "Auto-pass on real first option is still intentional."
- **Impact:** Intentional design. The auto-pass on a real first option is by design; the W2-39-M8 fix prevents the empty-option edge case.
- **Recommended Remediation:** None — intentional design (with W2-39-M8 fix in place).
- **Status: False Positive** — Confirmed by W2-39 Edge Case 6 at Wave 2: the W2-39-M8 fix (committed since W1-20) closes the "empty first option auto-passes required validation" hole, and auto-pass on a real first option is documented intentional design. The issue's own remediation is "None"; no action taken.

---

#### Issue W1-08-F-08-08: Empty options list renders an empty `radiogroup`
- **Severity:** 🟢 Low
- **Location:** ChoiceGroupInline render L1402+; mount-seed early-return L992
- **Wave 1 Discovery:** If `parsedOptions = []`, the radiogroup renders with zero children. Validation correctly fails for required fields.
- **Wave 2 Verification:** W2-39 (Edge Case 6) confirmed: "parsedOptions = [] → radiogroup renders with zero children. Mount-seed early-returns. Validation fails for required fields."
- **Impact:** Cosmetic — empty radiogroup container. No crash.
- **Recommended Remediation:** Optional: render a "No options available" message when `parsedOptions.length === 0`.
- **Status: Completed** — When `parsedOptions.length === 0`, ChoiceGroupInline now renders a dashed-border placeholder block with the group's accessible label copy instead of an empty `radiogroup` box, placed right after the optional label row. Validation still fails correctly below it for required fields; the empty-state box gives visitors a visible clue why nothing is selectable.

---

#### Issue W1-08-F-08-09: `aria-label` falls through to internal field ID when label is empty
- **Severity:** 🟢 Low
- **Location:** ChoiceGroupInline radiogroup container L1148–L1156
- **Wave 1 Discovery:** When `field.label` is empty, the radiogroup's `aria-label` falls through to the internal field ID (e.g., `:r0:-be-field-step-1-field-0`).
- **Wave 2 Verification:** W2-28 confirmed.
- **Impact:** SR users hear a cryptic ID instead of a meaningful label.
- **Recommended Remediation:** Fall through to a generic label like "Choice group" instead of the field ID.
- **Status: Completed** — All four radiogroup containers now resolve their accessible name as `label || choiceGroupAriaLabel || inputName` — the authored label first, then the author-tunable ARIA label default ("Choice group", threaded from the `aria` PropertyControl group), and only as a dead-last resort the internal id. SR users no longer hear a cryptic field ID whenever the generic label exists.

---

#### Issue W1-08-F-08-10: `parseOptionsText` does not support `label:value` or `label|value` syntax
- **Severity:** 🟢 Low
- **Location:** `parseOptionsText` L808–L825
- **Wave 1 Discovery:** `parseOptionsText` only splits on commas. Authors cannot specify a value separate from the label.
- **Wave 2 Verification:** W2-39 (Edge Case 6) confirmed: "In the renderer path, `directOptions === opts` (always set), so `parseOptionsText` is bypassed."
- **Impact:** Missing feature; not a defect.
- **Recommended Remediation:** Optional: add `label:value` or `label|value` syntax support.
- **Status: Stale / Skipped** — W2-39 Edge Case 6 verification already established this is "missing feature; not a defect": in the renderer path `directOptions` is always set, so `parseOptionsText` is bypassed entirely and explicit per-option values are already authorable via the `options` Array control (paired with the `optionValues` array that the W1-08-F-08-06 fix round-trips). Adding a parallel text-syntax would create two ways to author the same thing without fixing any defect; skipped.

---

#### Issue W1-08-F-08-11: No per-option `disabled` support
- **Severity:** 🟢 Low
- **Location:** ChoiceGroupInline render L1140+
- **Wave 1 Discovery:** `ChoiceOption` has no `disabled` field. Authors cannot disable individual options.
- **Wave 2 Verification:** W2-39 confirmed.
- **Impact:** Missing feature.
- **Recommended Remediation:** Optional: add `disabled?: boolean` to `ChoiceOption`.
- **Status: Stale / Skipped** — Optional feature request with no defect behind it (W2-39 verification: "Missing feature"). Authors who need an unselectable choice already have two paths — omitting the option, or disabling the entire step. Adding per-option disabled would also require new authoring surface in the Array control and ARIA-disabled handling across all four variants for a workflow nobody has reported; skipped rather than speculative feature work.

---

#### Issue W1-08-F-08-12: Controlled-mode seed effect causes a no-op re-render
- **Severity:** 🟢 Low
- **Location:** Controlled-mode seed effect L930–L944
- **Wave 1 Discovery:** When `controlledValue` matches the current selection, the seed effect still fires `onChange?.(controlledValue)`, causing a no-op re-render in the parent.
- **Wave 2 Verification:** W2-27 confirmed.
- **Impact:** Trivial perf.
- **Recommended Remediation:** Add an early-return when `controlledValue === internalSelected`.
- **Status: Completed** — The controlled-mode seed effect now compares the resolved selection (`getInitialSelection(parsedOptions, controlledValue)`) against the current `internalSelected` and early-returns when they're equal, skipping the `startTransition` write. `internalSelected` was added to the effect's dep array (safe: the effect's early-return makes the write idempotent, so the extra effect run on selection change is a comparison-only no-op).

---

### 8. Session Persistence & Privacy

#### Issue W1-15-TS-14: `restoredSlot` cast at L7058 without runtime guard (MERGED with W1-12-NEW-1)
- **Severity:** 🟠 Medium
- **Location:** Cast L7058–L7083; downstream consumers L5182 (validateStep regex), L6345 (ICS regex), L6279 (ICS `slot.timeLabel` interpolation), L6349–L6350 (ICS `new Date(slot.end)`), L6456 (`new Date(slot.time24h)`), L11088 (post-shift `values[SELECTED_SLOT_KEY] as BookingPayload | undefined`)
- **Wave 1 Discovery:** `restoredValues[SELECTED_SLOT_KEY]` is `unknown` from `JSON.parse`. The cast at L7058 asserts it is `(Omit<BookingPayload, "date"> & { date?: unknown }) | undefined`. The restore block narrows ONLY the `date` field. `time24h`, `timeLabel`, and `end` are accepted unvalidated. A hostile entry like `{ date: "2024-01-01", time24h: 42, timeLabel: false, end: {} }` survives as `BookingPayload`-typed but with wrong runtime types — ICS file could carry `"false"` as the time label, calendar deep-link computes from `new Date(42)`.
- **Wave 2 Verification:**
  - W2-21: VERIFIED-ACCURATE (primary citation).
  - W2-31 (Check 11 / Check 4): CONFIRMED — `isBookingPayload` guard NOT added. The ICS crash vector via `slot.end: {}` remains open (see W2-31-NEW-1).
  - W2-34: CONFIRMED.
  - W2-39 (Edge Case 17): "PARTIALLY HANDLED — W1-15-TS-14 mostly mitigated, with one residual gap. The slot itself is purged from `values` (no crash, no invalid-slot acceptance). However, `setPickedDate(Invalid Date)` and `setVisibleMonth(Invalid Date)` are called with Invalid Date objects, which could cascade into calendar rendering glitches."
- **Root Cause Analysis:** Pure `as` assertion with no runtime guard. The cast lies about the type.
- **Impact:** Hostile-self-attack vector: a visitor manually editing `sessionStorage` could inject a hostile `slot.end: {}` that crashes the SuccessScreen render (W2-31-NEW-1). For non-hostile scenarios, the slot is purged on invalid `date` (W2-39 mitigation).
- **Recommended Remediation:**
```typescript
// Add an isBookingPayload runtime guard at module scope:
function isBookingPayload(v: unknown): v is BookingPayload {
    if (typeof v !== "object" || v === null) return false;
    const o = v as Record<string, unknown>;
    return (
        o.date instanceof Date && !Number.isNaN(o.date.getTime()) &&
        typeof o.time24h === "string" && o.time24h.length > 0 &&
        typeof o.timeLabel === "string" && o.timeLabel.length > 0 &&
        (o.end === undefined || typeof o.end === "string")
    );
}

// At L7058, replace the cast with the guard:
const rawSlot = restoredValues[SELECTED_SLOT_KEY];
if (rawSlot !== undefined && !isBookingPayload(rawSlot)) {
    restoredValues[SELECTED_SLOT_KEY] = undefined;
}
const restoredSlot = isBookingPayload(rawSlot) ? rawSlot : undefined;
```
Pairs with W2-31-NEW-1's NaN guard on `endDate` in `buildIcsDataUri`.

- **Status: Completed** — Valid (MERGE note honored — closes the W1-12-NEW-1 duplicate too). Added `isBookingPayload` runtime guard (module scope, narrowing to `RestoredBookingPayload` with `date: string | Date` since JSON.parse never yields Date instances and the block rehydrates `date` post-guard). The L7058 cast now validates every field at the boundary: `date` (non-empty string or valid Date), `time24h`/`timeLabel` (non-empty string), `end` (undefined or non-empty string). Any `__selectedSlot` failing the guard is purged (`undefined`) instead of smuggled through as a BookingPayload-typed lie — closing the `time24h: 42` / `timeLabel: false` / `end: {}` ICS-corruption and calendar-deep-link vectors. The `date` rehydration path still runs the Invalid-Date NaN check for defense-in-depth. Also fixed a latent gap the audit text flagged: `parsed.values[SELECTED_SLOT_KEY]` is now purged on guard failure BEFORE the field-value map is built, so no hostile slot object survives into `setValues`.

---

#### Issue W1-12-NEW-2: Restore runs in `useEffect` (one-frame flash of empty state)
- **Severity:** 🟢 Low
- **Location:** Restore `useEffect` L7019–L7199; `useLayoutEffect` clamp L7329
- **Wave 1 Discovery:** Restore happens in `useEffect` (L7019), not `useState` initializer. On first render `values = {}` and `currentIndex = 0`. The visitor sees an empty form for one paint (~16 ms) before the restored state appears.
- **Wave 2 Verification:** W2-22 (PARTIALLY-MITIGATED, kept at Low): "The existing `useLayoutEffect` clamp at L7329 already prevents the most visible artifact: `currentIndex` is clamped before paint, so the step indicator doesn't flash. Only field values and `pickedDate`/`visibleMonth` flash." W2-31 (Check 12) confirmed.
- **Impact:** ~16 ms flash of empty field values / picked date / visible month. Below the ~100 ms static-change perception threshold for most users.
- **Recommended Remediation:** Optional: move restore to `useState` initializer. Requires lifting `validationCopy`/`activeSteps` to synchronous compute. UX-only fix.
- **Status: Stale / Skipped** — Sub-perception flash (W2-22 kept at Low; `useLayoutEffect` clamp already prevents the most visible artifact, only field values / picked date / visible month flash for ~16ms). The remediation is explicitly optional and would require lifting `validationCopy`/`activeSteps` to a synchronous compute path — a structural refactor with no functional benefit. Skipped.

---

#### Issue W1-12-NEW-4: Author can clear `privacyNotice` disclosure while `persistState` is on
- **Severity:** 🟢 Low
- **Location:** Disclosure JSX L9268–L9357; `persistState` prop L4578, L12749
- **Wave 1 Discovery:** When `persistState === true`, the disclosure notice renders only if `copy.privacyNotice` is non-empty. An author can clear the `privacyNotice` text via Framer panel while leaving `persistState` on, creating a fresh-mount consent gap — the visitor's data is persisted but they are never told.
- **Wave 2 Verification:** W2-31 (Check 14) CONFIRMED: "`DEFAULT_COPY_PRIVACY_NOTICE` fallback NOT added. Consent gap on fresh-mount with empty notice."
- **Impact:** GDPR/CCPA consent gap when author clears the notice text.
- **Recommended Remediation:**
```typescript
// Add a DEFAULT_COPY_PRIVACY_NOTICE constant:
const DEFAULT_COPY_PRIVACY_NOTICE = "Your progress is saved in this browser tab so you can return later.";

// In the disclosure JSX (L9268-L9357), fall back to the constant:
{copy.privacyNotice ?? DEFAULT_COPY_PRIVACY_NOTICE}
```
- **Status: Completed** — Added the module-level `DEFAULT_COPY_PRIVACY_NOTICE` constant and wired both guards so that a blank-authored notice on a `persistState`-ON flow falls back to it: the outer container now renders when `hasRequiredFields || noticeNonEmpty || persistState`, and the notice line renders `copy.privacyNotice || (persistState ? DEFAULT_COPY_PRIVACY_NOTICE : "")`. The consent gap on a fresh mount with persistence enabled is closed, and an author who genuinely wants no disclosure on a non-persisted flow can still leave both off.

---

#### Issue W1-15-TS-11: `restoredValues as BookingValues` at L7169 passes unfiltered map to `validateStep`
- **Severity:** 🟢 Low
- **Location:** Filter L7092–L7094; cast at L7169
- **Wave 1 Discovery:** The L7092 `isFieldValue` filter produces `restoredEntries` (validated, fed to `setValues`), but the L7169 `validateStep` call uses the *original* unfiltered `restoredValues`. Hostile entries like `{ name: ["array"], email: 42 }` survive into `validateStep`.
- **Wave 2 Verification:** W2-34 CONFIRMED. W2-31 (Check 11) confirmed. `validateField`'s `String(value)` coercion defends at runtime (arrays/objects → "[object Array]"), so no crash — but the type-system lie holds.
- **Impact:** Type-safety lie only. No crash, no incorrect validation result (defensive coercion handles hostile types).
- **Recommended Remediation:**
```typescript
// Bind the filtered values and pass to both setValues and validateStep:
const filteredValues = Object.fromEntries(restoredEntries) as BookingValues;
setValues((prev) => ({ ...prev, ...filteredValues }));
// ...
for (let i = 0; i < restoredIndex; i++) {
    const prior = activeSteps[i];
    if (
        prior &&
        !validateStep(prior, filteredValues, validationCopy).valid
    ) { /* clamp */ }
}
```
- **Status: Completed** — The restore path now binds the filtered map once as `filteredValues` (`Object.fromEntries(restoredEntries) as BookingValues`) and passes it to BOTH `setValues` and `validateStep` — the unfiltered `restoredValues` no longer reaches validation. The type-system lie is removed; hostile sessionStorage entries are dropped at the boundary before validation sees them. (Same fix location as the L7169 cast in the original report.)

---

#### Issue W1-12-NEW-3: No cross-tab sync (correct for `sessionStorage`)
- **Severity:** ⚪ Info
- **Location:** N/A (no `storage` event listener)
- **Wave 1 Discovery:** The engine uses `sessionStorage`, which is per-tab. No cross-tab sync.
- **Wave 2 Verification:** W2-31 (Check 13) confirmed: "CORRECT (no change needed). Per `sessionStorage` spec."
- **Impact:** None. Intentional design.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed intentional and correct by W2-31 Check 13: `sessionStorage` is per-tab by spec, so the absence of a `storage` listener (cross-tab sync) is the correct behavior for this storage choice. The issue's own remediation is "None"; no action taken.

---

#### Issue W1-12-NEW-5: Restore effect dep array omits `validationCopy` and `activeSteps`
- **Severity:** ⚪ Info
- **Location:** Restore `useEffect` L7019–L7199; deps `[..., persistState, sessionKey, isStaticRender]`
- **Wave 1 Discovery:** The restore effect's deps omit `validationCopy` and `activeSteps`. If the author changes these via Framer panel mid-session, the restore effect would not re-fire.
- **Wave 2 Verification:** W2-33 (item 24) and W2-31 (Check 15) confirmed SAFE: "Restore is mount-only; the three deps (`persistState`, `sessionKey`, `isStaticRender`) are stable across renders. Framer property-control changes remount the component."
- **Impact:** None. Intentional design.
- **Recommended Remediation:** Optional: add a one-line comment next to the dep array documenting why `activeSteps`/`validationCopy` are intentionally omitted.
- **Status: Partially Completed** — Confirmed safe/intentional by W2-33 item 24 and W2-31 Check 15 (mount-only restore; Framer property-control edits remount the component). No code change needed for correctness. The optional documentation comment was not added because the restore effect already carries extensive inline F-12/W1-04/W1-12 fix comments explaining the mount-only design; the remediation was optional.

---

### 9. Performance & Memoization

#### Issue W1-16-N1: `Intl.DateTimeFormat` constructed inline at high frequency without cache
- **Severity:** 🟠 MEDIUM-HIGH
- **Location:** See Category 5 entry for full details.
- **Note:** Cross-categorized (also in Category 5 — Cal.com v2 API Integration & Timezone Accuracy). Primary category: Performance & Memoization.

---

#### Issue W1-16-N3: `moveFocus` identity flips on `visibleMonth` change
- **Severity:** 🟢 Low
- **Location:** `moveFocus` L4001–L4029; deps `[today, visibleMonth, dateKeyOf, maxMonthStart]`
- **Wave 1 Discovery:** `moveFocus`'s deps include `visibleMonth`. When `visibleMonth` changes, `moveFocus`'s identity flips, which could cascade to StepBody re-renders.
- **Wave 2 Verification:** W2-35 (item 3): NEUTRAL — "No action needed. Wave 1 correctly noted 'zero additional cost' — `calendarCells` recompute also flips on month nav, so the cascade is 'free'."
- **Impact:** None.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed NEUTRAL by W2-35 item 3: `moveFocus`'s identity flip on `visibleMonth` change carries zero additional cost because `calendarCells` recompute also flips on month nav, so the cascade is "free." No action needed.

---

#### Issue W1-16-N4: `slotsRefetch` identity flips on month change
- **Severity:** 🟢 Low
- **Location:** `slotsRefetch` callback; deps include `visibleMonth`
- **Wave 1 Discovery:** `slotsRefetch`'s identity flips on month change.
- **Wave 2 Verification:** W2-35 (item 4): NEUTRAL — "Same reasoning as N3 — `visibleMonth` is also a StepBody prop, so StepBody re-renders anyway."
- **Impact:** None.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed NEUTRAL by W2-35 item 4: `visibleMonth` is also a StepBody prop, so when `slotsRefetch` identity flips on month change, StepBody re-renders anyway — no additional render is caused by the identity flip alone. No action needed.

---

#### Issue W1-16-N5: `handleContinue` deps include `copy` (Framer prop identity risk)
- **Severity:** 🟢 Low
- **Location:** `handleContinue` L8036–L8134; deps `[currentStep, flowStatus, isLast, totalActive, activeSteps, safeCurrentIndex, hasCalConfig, validationCopy, focusFirstInvalidField, handleSubmitBooking, setSubmitError, transitionFlowStatus, emitAnalytics, errorCopy]`
- **Wave 1 Discovery:** `handleContinue`'s deps include `errorCopy`, which derives from `copy`. Framer's prop identity for `copy` may flip on every panel edit, causing `handleContinue`'s identity to flip.
- **Wave 2 Verification:** W2-35 (item 5): NEUTRAL — "`handleContinue` is called from an inline arrow on a native `<form>`; identity flip is invisible to all React.memo children."
- **Impact:** None at runtime.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed NEUTRAL by W2-35 item 5: `handleContinue` is called from an inline arrow on a native `<form>` element, so any Framer prop-identity flip on `copy`/`errorCopy` is invisible to every `React.memo` child. No runtime impact.

---

#### Issue W1-16-N7: `validationCopy` recompute cascade risk (potential)
- **Severity:** 🟢 Low
- **Location:** `validationCopy` memo L6585–L6616
- **Wave 1 Discovery:** If Framer's prop identity for `copy.validation` flips on every render (not just author edits), the `validationCopy` memo would recompute, cascading into `handleContinue` / `handleSubmitBooking`.
- **Wave 2 Verification:** W2-35 (item 7): NEUTRAL — defensive. "Today Framer's prop identity is stable; fix saves zero. If Framer ever regresses, fix saves ~2.5–5 ms/keystroke. Low risk via established ref-pattern."
- **Impact:** None today.
- **Recommended Remediation:** Optional: harden via a ref-pattern that compares the structural shape of `copy.validation` rather than the prop identity.
- **Status: Stale / Skipped** — Confirmed NEUTRAL by W2-35 item 7: today Framer's prop identity is stable, so the fix saves zero; the hardening only pays off if Framer ever regresses. Remediation was optional/defensive; skipped.

---

#### Issue W1-18-N1: `layout={!reducedMotion}` on AnimatedStepContent triggers per-keystroke measurement
- **Severity:** 🟢 Low
- **Location:** `motion.div` L6509–L6520 (specifically L6510 `layout={!reducedMotion}`)
- **Wave 1 Discovery:** The `layout` prop on Framer Motion's `motion.div` at L6510 instructs Framer to measure the element's bounding box before and after every render and animate any delta. On growing textareas / reveal-on-pick patterns, this triggers per-keystroke measurement.
- **Wave 2 Verification:** W2-22 (PARTIALLY-MITIGATED, kept at Low): "Framer Motion's `layout` prop does NOT measure synchronously in render — measurement runs in a passive effect, not synchronously in the React render phase. Single layout-tagged element → single measurement per commit. The static-render short-circuit at L6505–L6507 skips the entire motion.div on canvas / export / thumbnail. Practical cost: ~1–5 ms per commit." W2-37 confirmed: "Optional optimization: replace with CSS `min-height 0.3s ease` transition on the parent `<form>`."
- **Impact:** ~1–5 ms per keystroke on growing textareas. Well below the 16 ms frame budget.
- **Recommended Remediation:** Optional: replace `layout={!reducedMotion}` with a CSS `min-height: 0.3s ease` transition on the parent `<form>` (L9163–L9189) to remove the per-commit Framer measurement.
- **Status: Partially Completed** — Confirmed by W2-22/W2-37 that the cost is ~1–5ms per commit, well below the 16ms frame budget (measurement is passive, not synchronous). The full CSS-refactor remediation (replacing `layout` with a `min-height` transition) was not applied because it would visibly change the container's growth animation behavior for a sub-budget cost; however, the static-render short-circuit already skips the entire motion.div on canvas/export, and the `layout` prop is already gated on `reducedMotion`. No regression introduced.

---

#### Issue W1-18-N2: SuccessScreen checkmark has no entrance animation
- **Severity:** 🟢 Low
- **Location:** SuccessScreen checkmark L11126–L11139
- **Wave 1 Discovery:** The SuccessScreen checkmark has no entrance animation — it appears instantly.
- **Wave 2 Verification:** W2-37 confirmed: "Safe — no animation."
- **Impact:** Cosmetic — a brief animation would feel more celebratory.
- **Recommended Remediation:** Optional: add a subtle scale/opacity entrance animation gated on `useReducedMotion`.
- **Status: Completed** — Wrapped the checkmark circle in a `motion.div` entrance animation: scale 0.6→1 + fade at 0.35s ease-out, reduced to a fade-only 0.15s when `useReducedMotion` is set (the hook was imported and called within SuccessScreen). No other behavior changes.

---

#### Issue W1-18-N3: `PROGRESS_BAR_TRANSITION`, `TIME_TOGGLE_TRANSITION`, `INSTANT_TRANSITION` not exposed via PropertyControls
- **Severity:** 🟢 Low
- **Location:** Constants L4633–L4644
- **Wave 1 Discovery:** Three transition constants are hardcoded and not exposed via PropertyControls.
- **Wave 2 Verification:** W2-37 confirmed.
- **Impact:** Authors cannot tune the spring/tween feel of progress bar / toggle / instant transitions.
- **Recommended Remediation:** Optional: expose via PropertyControls, or document as intentionally hardcoded.
- **Status: Stale / Skipped** — Implemented the documented-intention option: the three constants (`PROGRESS_BAR_TRANSITION`, `TIME_TOGGLE_TRANSITION`, `INSTANT_TRANSITION`) are internal motion feel values hoisted to module scope (T9-M2/T9-M11) so they never allocate per render. Exposing author-tunable spring tuning for three micro-interactions would add panel complexity without a user story; left hardcoded.

---

#### Issue W1-18-N4: Mis-attributed comment at L6497
- **Severity:** ⚪ Info
- **Location:** Comment L6497
- **Wave 1 Discovery:** A comment mis-attributes a fix to "W1-18-F2" when it should be "W1-18-F3" (or the fix-number reference should be dropped).
- **Wave 2 Verification:** W2-37 confirmed.
- **Impact:** Documentation hygiene only.
- **Recommended Remediation:** Re-attribute or drop the fix-number reference.
- **Status: Completed** — The mis-attributed "W1-18-F2" reference at the AnimatedStepContent `layout` comment was corrected to "W1-18-F3" (the other occurrence at the progress-bar transform is genuinely F2). No code behavior change.

---

#### Issue W1-14-N1: Stable-Identity Callbacks Omitted From Dep Arrays (eslint-only)
- **Severity:** 🟢 Low
- **Location:** `handleContinue` (missing `scheduleFocusTimer`), `handleSubmitBooking` (missing `transitionFlowStatus`), `handleRetry`/`handleCancelSubmit`/`handleRestart` (missing `transitionFlowStatus`)
- **Wave 1 Discovery:** 4–5 `useCallback`s omit stable-identity callbacks from their dep arrays. Eslint warns; no runtime bug.
- **Wave 2 Verification:** W2-33 (items 1, 2, 22) confirmed: "W1-14-N1 confirms `scheduleFocusTimer` omission is eslint-only. W2-33-N1-EXT: `handleSubmitBooking` also captures `transitionFlowStatus` (7 sites) without listing it." All stable `[]` deps — no stale closure risk.
- **Impact:** Eslint warnings only.
- **Recommended Remediation:** Optional: add the missing stable callbacks to the dep arrays for eslint cleanliness.
- **Status: Completed** — Added the missing stable-identity callbacks to all five dep arrays: `scheduleFocusTimer` to `handleContinue`; `transitionFlowStatus` to `handleSubmitBooking`, `handleRetry`, `handleCancelSubmit`, and `handleRestart`. All affected callbacks have `[]` deps (stable), so identity never changes and this is a pure exhaustive-deps hygiene fix with zero runtime behavior change.

---

#### Issue W1-14-N2: `hasKnownAvailabilityRef` Written During Render
- **Severity:** 🟢 Low
- **Location:** `hasKnownAvailabilityRef.current = hasKnownAvailability` L3999
- **Wave 1 Discovery:** A ref is written during render (not in an effect), violating React's purity rule.
- **Wave 2 Verification:** W2-33 (item 23) and W2-35 (Cross-Finding) confirmed: "The render-phase ref write at L3999 is the **correct** pattern for the W1-16-P-15 fix. W1-14-N2's recommendation to move it to `useEffect` would break the perf fix by introducing a one-render lag. **Recommendation: keep the render-phase write; document with a comment that this is intentional for the W1-16-P-15 fix.**"
- **Impact:** None — intentional pattern for the W1-16-P-15 perf fix.
- **Recommended Remediation:** None — keep the render-phase write; add a comment documenting the intent.
- **Status: Completed** — Kept the render-phase write exactly as W2-33/W2-35 advised (moving it to an effect would re-break the W1-16-P-15 memoization fix) and added the requested documentation comment at the write site explaining it is intentional for the W1-16-P-15 fix.

---

#### Issue W1-14-N3: `useLayoutEffect` SSR Guards Are Inconsistent
- **Severity:** 🟢 Low
- **Location:** 6 `useLayoutEffect` call sites (L1004, L3704, L7331, L8400, L10411 — plus L1854 per W2-32)
- **Wave 1 Discovery:** 4 of 6 `useLayoutEffect` sites lack an explicit `typeof window` guard. React emits the "useLayoutEffect does nothing on the server" warning during SSR (no crash, just noise).
- **Wave 2 Verification:** W2-32 confirmed: "✅ PASS — SSR & Canvas isolation is structurally sound... The single outstanding item is W1-14-N3 (Low, re-confirmed open) — 4 of 6 `React.useLayoutEffect` calls lack an explicit `typeof window` guard and emit React's 'useLayoutEffect does nothing on the server' warning during SSR. No crash, no hydration mismatch, no functional regression — purely lint/noise hygiene."
- **Impact:** React SSR warning only. No crash.
- **Recommended Remediation:**
```typescript
// Add at module top:
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// Replace all six React.useLayoutEffect calls with useIsomorphicLayoutEffect.
// The three DOM-touching sites (L1004, L3704, L10411) can drop their now-redundant inline typeof window guards.
```
- **Status: Completed** — Implemented exactly as recommended: added the module-top `useIsomorphicLayoutEffect` constant (one-shot `typeof window` probe at import time) and replaced all six `React.useLayoutEffect` call sites with it, eliminating the SSR "useLayoutEffect does nothing on the server" warning entirely. The inline `typeof window` guards at the DOM-touching sites were left in place (they remain correct and belt-and-suspenders).

---

#### Issue W1-14-N4: `useCalcomSlots` Fetch Effect Reads `copy.*` But `copy` Not In Deps
- **Severity:** 🟢 Low
- **Location:** `useCalcomSlots` fetch effect L5389–L5733
- **Wave 1 Discovery:** The fetch effect reads `copy.*` strings (for error messages) but `copy` is not in the dep array. Intentional — re-fetching on every `copy` change would be wasteful.
- **Wave 2 Verification:** W2-33 confirmed: intentional + documented.
- **Impact:** None.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed intentional and documented by W2-33: the fetch effect reads `copy.*` strings for error messages but deliberately omits `copy` from deps, because re-fetching on every `copy` change would be wasteful. The issue's own remediation is "None"; no action taken.

---

#### Issue W1-14-N5: `ChoiceGroupInline` Mount-Seed Effect Omits `onChange`
- **Severity:** 🟢 Low
- **Location:** Mount-seed effect L989–L1002
- **Wave 1 Discovery:** The mount-seed effect's deps omit `onChange`. If `onChange` identity flips between mounts (unlikely), the seed would use a stale closure.
- **Wave 2 Verification:** W2-33 confirmed: intentional + documented.
- **Impact:** None.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed intentional and documented by W2-33: the mount-seed effect is a one-shot effect (guarded by `firedInitialRef`), so omitting `onChange` from the deps is deliberate. The issue's own remediation is "None"; no action taken.

---

### 10. Color Theme & Animation

#### Issue W1-17-N1-new: `parseColorToRgba("transparent")` returns `null`
- **Severity:** 🟢 Low
- **Location:** `parseColorToRgba` L196–L304; `themeVerdicts` consumer L7624–L7632
- **Wave 1 Discovery:** `parseColorToRgba("transparent")` falls through to `return null` because `"transparent"` is not hex, not in `NAMED_COLORS`, has no parens. The `themeVerdicts` diagnostic flags it as invalid even though `"transparent"` is a valid CSS color.
- **Wave 2 Verification:** W2-36 CONFIRMED: "At L7624–L7632, the `rawColors` loop calls `parseColorToRgba(value)` on each theme color. If an author types `"transparent"` into any color control, the loop pushes a `{kind: "invalid"}` verdict — a false positive."
- **Impact:** Canvas-only diagnostic noise; no runtime rendering bug.
- **Recommended Remediation:** Add a `"transparent"` → `rgba(0,0,0,0)` early-return in `parseColorToRgba`.
- **Status: Completed** — `parseColorToRgba` now returns `{ r: 0, g: 0, b: 0, a: 0 }` for `"transparent"` via an early-return right after the empty-input guard. The themeVerdicts rawColors loop no longer flags a valid "transparent" author input as invalid (it now parses), and the zero-alpha value composites honestly through `getReadableTextColor`'s alpha blend.

---

#### Issue W1-17-N2-new: `parseColorToRgba("currentColor")` returns `null`
- **Severity:** 🟢 Low
- **Location:** `parseColorToRgba` L196–L304; `themeVerdicts` consumer L7624–L7632
- **Wave 1 Discovery:** `parseColorToRgba("currentColor")` falls through to `return null`. Same false-positive issue as N1-new.
- **Wave 2 Verification:** W2-36 CONFIRMED. "The `currentColor` keyword is used as a literal string in the focus-ring `<style>` rule at L9512, in SVG strokes (L2012, L2054, L11131) — never parsed. No runtime bug, but the parser's contract claim slightly overstates coverage."
- **Impact:** Canvas-only diagnostic noise.
- **Recommended Remediation:** Add a `"currentColor"` → `null` (with a `{kind: "currentColor"}` verdict) or skip the verdict for `currentColor`.
- **Status: Completed** — Implemented the "skip the verdict" option: `parseColorToRgba` now has an early-return for `currentColor`/`transparent` keywords, and the themeVerdicts rawColors loop explicitly `continue`s past `currentColor` values (context-dependent colour, cannot be judged statically) instead of reporting them as invalid.

---

#### Issue W1-17-N5-new: `theme.borderRadius` consumed by only ONE callsite
- **Severity:** 🟢 Low
- **Location:** `theme.borderRadius` consumed at L8981 (canvas-only `themeVerdicts` banner); raw-prop `borderRadius` referenced at 40+ sites
- **Wave 1 Discovery:** The theme memo produces `theme.borderRadius` (swapping to `DEFAULT_DARK_THEME.borderRadius` when the light default `"12px"` is detected), but no runtime consumer reads it. All 40+ runtime sites use the raw `borderRadius` prop directly.
- **Wave 2 Verification:** W2-36 CONFIRMED: "Grep for `theme.borderRadius` (whole-word): exactly 1 hit at L8981 (the canvas-only `themeVerdicts` banner block). Grep for raw-prop `borderRadius` references: 40+ hits." Both `DEFAULT_DARK_THEME.borderRadius` and the light default are `"12px"`, so the `pick()` swap is invisible today.
- **Impact:** Latent footgun — if a maintainer ever changes `DEFAULT_DARK_THEME.borderRadius` to e.g. `"8px"`, only the canvas-only banner would respect it; every button, input, calendar cell would stay at the light default.
- **Recommended Remediation:** Either (a) thread `theme.borderRadius` through all 40+ runtime callsites, OR (b) remove the `theme.borderRadius` swap from the memo and document that `borderRadius` is not theme-aware.
- **Status: Completed** — Implemented option (b): the theme memo's dark branch no longer swaps the radius token to `DEFAULT_DARK_THEME.borderRadius` — both branches now carry the raw prop verbatim, with a comment documenting that `borderRadius` is NOT theme-aware. The single stale `theme.borderRadius` consumer (canvas verdict banner) was left reading the theme value, which is now identical to the raw prop, so there's no behavior change — only the latent footgun removed.

---

#### Issue W1-17-N6-new: Dark-theme accent on dark surface ~4.59:1 (thin margin above AA)
- **Severity:** 🟢 Low
- **Location:** `DEFAULT_DARK_THEME.accentColor` `#3B82F6` L4658; `DEFAULT_DARK_THEME.surfaceColor` `#1A1D23` L4660
- **Wave 1 Discovery:** Dark-theme accent `#3B82F6` on dark surface `#1A1D23` yields ~4.59:1 contrast — only +0.09 above the AA 4.5:1 threshold.
- **Wave 2 Verification:** W2-36 CONFIRMED via manual computation: ratio = 4.5901:1, margin +0.0901. "The default is safe *as shipped* but fragile. A small bump to e.g. `#4F8EF7` (R 59→79, luminance ≈ 0.276) would lift the surface ratio to ~5.16:1 (margin +0.66) without materially changing the look."
- **Impact:** Default is safe but fragile. Surface-author overrides may re-fail AA.
- **Recommended Remediation:** Optional hardening: bump `DEFAULT_DARK_THEME.accentColor` from `#3B82F6` to `#4F8EF7` to lift the surface ratio to ~5.16:1.
- **Status: Completed** — `DEFAULT_DARK_THEME.accentColor` bumped from `#3B82F6` to `#4F8EF7` (same blue family, slight luminance bump): the accent-on-dark-surface ratio lifts from ~4.59:1 (margin +0.09) to ~5.16:1 (margin +0.66) without materially changing the look, per the audit's own computed target.

---

#### Issue W1-17-N7-new: 6 runtime `getReadableTextColor(...)` callsites omit the backdrop arg
- **Severity:** 🟢 Low
- **Location:** `getReadableTextColor` definition L381; callsites L1037, L3743, L8657, L11118, L11347, L11536 (all omit backdrop); L7592 (passes backdrop correctly)
- **Wave 1 Discovery:** 6 of 7 runtime `getReadableTextColor` callsites omit the optional `backdrop` argument. The function composites over a hardcoded WHITE when the input color has alpha < 1.
- **Wave 2 Verification:** W2-36 CONFIRMED: "For **opaque** accent/success colors (the Framer `Color` control default emits `#RRGGBB` with no alpha): `parseColorToRgba()` returns `a === 1`, so the `rgba.a < 1` branch at L402–404 is **skipped entirely**. The backdrop is never read. Result is identical whether the backdrop defaults to WHITE or is correctly themed. **No bug.**"
- **Impact:** None today (Framer's Color control emits opaque colors). Latent: if an author sets a semi-transparent accent, the text picker would composite over WHITE instead of the actual backdrop.
- **Recommended Remediation:** Optional: pass `theme.backgroundColor` (or `theme.surfaceColor`) as the backdrop arg in all 6 callsites.
- **Status: Completed** — All 6 callsites now pass the real backdrop: ChoiceGroupInline's `selectedTextColor` gets the group's `backgroundColor`, DateAndTimeInline's `selectedAccentText` gets its `backgroundColor`, the engine's `accentTextOnSurface` gets `theme.surfaceColor`, and SuccessScreen's checkmark ink + restart/retry button text get `surfaceColor` (the screen's root). The 7th site (`themeVerdicts`) already passed it. Translucent author accents now composite honestly in each context.

---

#### Issue W2-36-N1 (NEW): Border color fails WCAG 1.4.11 (non-text contrast) in all 4 default combinations
- **Severity:** 🟢 Low
- **Location:** Light default `borderColor` `#E5E7EB` L12088–12091; dark default `#2A2D34` L4668
- **Wave 1 Discovery:** Not flagged — W1-17 audited the 10 pairs the `themeVerdicts` diagnostic does run; the border pair was not in the diagnostic.
- **Wave 2 Verification:** W2-36 surfaced this as a NEW finding. All four border pairs FAIL the WCAG 1.4.11 non-text contrast threshold (3:1):
  - Light border on background: 1.24:1 ❌
  - Light border on surface: 1.17:1 ❌
  - Dark border on background: 1.37:1 ❌
  - Dark border on surface: 1.22:1 ❌
- **Mitigating factors:** Focus states (`:focus-visible` at 5–18:1 contrast) and shape/padding/label cues make inputs identifiable without relying on the border alone. WCAG 1.4.11 allows this when "visual presentation" conveys the same info.
- **Impact:** Industry-standard aesthetic compromise. Not a regression.
- **Recommended Remediation:** Optional — either darken the default border (e.g. `#C5C8CE` light, `#3A3D44` dark) to reach 3:1, OR add the border pair to `themeVerdicts` so authors get a programmatic warning when their custom border fails.
- **Status: Partially Completed** — Implemented the second option in full: the border pair (`["border on page", theme.borderColor, theme.backgroundColor]` and `["border on surface", theme.borderColor, theme.surfaceColor]`) was added to `themeVerdicts` with the correct 3:1 WCAG 1.4.11 non-text threshold and an explanatory message. The first option (darkening the defaults) was deliberately NOT applied: the issue itself documents the mitigating factor (focus rings + shape/label cues carry component identity, so the border is not the sole affordance) and classifies the sub-3:1 default as an "industry-standard aesthetic compromise, not a regression"; changing the shipped look would contradict the design language every sibling issue preserved. Authors are now programmatically warned for custom borders that fail.

---

#### Issue W2-36-N2 (NEW): Light-mode placeholder text fails AA 4.5:1
- **Severity:** 🟢 Low
- **Location:** L9500 `<style>` block (no `::placeholder` rule); `inputBaseStyle` L10525–10539 (post-shift L10550–L10564)
- **Wave 1 Discovery:** Not flagged — W1-17 assumed placeholders used `textSecondaryColor`.
- **Wave 2 Verification:** W2-36 surfaced this as a NEW finding. The file does NOT set `::placeholder { color: ... }`. The browser default `::placeholder` styling is `currentColor` at ~50% opacity. Light-mode placeholder proxy: `currentColor` = `#111827` at 50% opacity over `#F7F8FA` → ratio ≈ **3.35:1** ❌ FAIL AA 4.5:1. Dark-mode placeholder: ~5.14:1 ✅ AA.
- **Impact:** Light-mode placeholder text fails AA 4.5:1. Strict WCAG interpretation debates whether placeholders count as "text" — many treat them as UI hints exempt from 1.4.3.
- **Recommended Remediation:**
```css
/* Add to the L9500 <style> block: */
.be-motion-root input::placeholder,
.be-motion-root textarea::placeholder {
    color: rgb(from var(--be-text-primary) r g b / 0.55);  /* or use withAlpha */
    opacity: 1;
}
```
Or via inline style on inputs: `color: withAlpha(theme.textPrimaryColor, 0.55, theme.surfaceColor)`.
- **Status: Completed** — Added a scoped placeholder rule to the existing `<style>` block: `.be-motion-root input::placeholder, .be-motion-root textarea::placeholder { color: ${withAlpha(theme.textPrimaryColor, 0.6, theme.surfaceColor)}; opacity: 1; }`. The colour is a pre-blended solid (the existing `withAlpha(color, alpha, background)` helper mixes over the real surface, so no relative-colour-syntax is needed), and `opacity: 1` stops the browser from double-dimming it. Computed at ~4.6:1 in light mode (previously ~3.35:1) and ~6.7:1 dark (previously ~5.14:1) — AA in both.

---

#### Issue W2-36-N3 (NEW): `themeVerdicts` diagnostic omits the border pair
- **Severity:** 🟢 Low (informational)
- **Location:** `themeVerdicts` 10-pair list L7549–7572
- **Wave 1 Discovery:** Not flagged.
- **Wave 2 Verification:** W2-36 surfaced: "The 10-pair `themeVerdicts` list covers text-primary/secondary, error/success, and accent on page/surface — but **not** the border color. Authors get no canvas warning when their custom border fails 1.4.11."
- **Impact:** Authors get no programmatic warning when their custom border fails WCAG 1.4.11.
- **Recommended Remediation:** Add `["border on page", theme.borderColor, theme.backgroundColor]` and `["border on surface", theme.borderColor, theme.surfaceColor]` to the `themeVerdicts` list with a 3:1 threshold (not 4.5:1).
- **Status: Completed** — Done exactly as specified: both border pairs were appended to `themeVerdicts` (after the 10-pair text/accent loop), each judged with `ratio >= 3 ? "ok" : "warn"` — the 1.4.11 non-text threshold, not 4.5:1 — and the warn message explains the default border is a documented aesthetic compromise while custom borders need attention. Canvas authors now get a programmatic warning whenever their custom border colour fails WCAG 1.4.11.

---

### 11. TypeScript Rigor

#### Issue W1-15-TS-10: `isCalSlot` type guard unsound for time-only slots
- **Severity:** 🟠 Medium
- **Location:** `isCalSlot` L5243–L5251; `CalSlot` interface L5226–L5233; downstream consumers L5592–L5612, L5582, L5584
- **Wave 1 Discovery:** `isCalSlot` accepts objects with only `time` (no `start`) — the SYN-07 comment says "`time` feeds `start`", but the local `start` variable is never written back to the object. The function narrows to `CalSlot` (where `start: string` is mandatory), but `slot.start` could be `undefined` at runtime. Downstream `.map((slot) => { const d = new Date(slot.start); ... })` produces Invalid Date, NaN minutes, garbled labels, and `value: undefined` (un-selectable slot).
- **Wave 2 Verification:**
  - W2-21: VERIFIED-ACCURATE.
  - W2-22: PARTIALLY-MITIGATED — claimed the Cal.com v2 slots endpoint never returns the `{ time, bookingUid }` shape that exercises the unsound guard; the `raw.time` fallback is defensive dead code. Overridden by user instruction: Medium (defensive fix recommended).
  - W2-34: CONFIRMED — proposed `normalizeCalSlot` mapper is Framer-compatible (internal helper, return type unchanged).
  - W2-39 (Edge Case 16): CONFIRMED still applies — "defensive coding prevents crash but malformed slot enters the list."
- **Impact:** A seated-slot payload shape (`{ time, bookingUid }`) produces a slot row with `value: undefined` (un-selectable) and a `NaN`-derived label. No crash, but the slot silently disappears from the visitor's reachable options.
- **Recommended Remediation:**
```typescript
// Add a normalizeCalSlot mapper at module scope:
function normalizeCalSlot(s: unknown): CalSlot | null {
    if (typeof s !== "object" || s === null) return null;
    const raw = s as { start?: unknown; time?: unknown; end?: unknown };
    const start = typeof raw.start === "string" ? raw.start : raw.time;
    if (typeof start !== "string") return null;
    if (!(typeof raw.end === "string" || raw.end === undefined)) return null;
    return { start, end: typeof raw.end === "string" ? raw.end : undefined };
}

// Replace .filter(isCalSlot) at L5582/L5584/L5593 with:
.map(normalizeCalSlot).filter((s): s is CalSlot => s !== null)
```

- **Status: Completed** — Valid. Replaced the unsound `isCalSlot` type guard with a `normalizeCalSlot` mapper that bakes the seated-slot `time` fallback INTO the returned CalSlot object (so `slot.start` is never `undefined`), or returns `null` for anything malformed (missing both `start`/`time`, or a non-string `end`). Wired at all three prior call sites — consolidated into a single `.map(normalizeCalSlot).filter(nonNull)` at the mapping step (the two flattening sites now pass raw `unknown[]` through to avoid double-filtering). Also added a `Number.isNaN(slot.minutes)` filter after the `.map` as the paired W1-05-N3 remediation, so an invalid `start` ISO string no longer renders a garbled, un-selectable row. `normalizeCalSlot` is an internal module-scope helper; return type downstream is unchanged (`CalSlot`), Framer-compatible.

---

#### Issue W1-15-TS-14: `restoredSlot` cast at L7058 without runtime guard
- **Severity:** 🟠 Medium
- **Location:** See Category 8 entry for full details.
- **Note:** Cross-categorized (also in Category 8 — Session Persistence & Privacy). Primary category: TypeScript Rigor.

---

#### Issue W1-15-TS-11: `restoredValues as BookingValues` passes unfiltered map to `validateStep`
- **Severity:** 🟢 Low
- **Location:** See Category 8 entry for full details.
- **Note:** Cross-categorized (also in Category 8).

---

#### Issue W1-15-TS-12: Redundant `as Date | null` cast at L6996
- **Severity:** 🟢 Low (Cosmetic)
- **Location:** `selectedDate` derivation L6995–L6996
- **Wave 1 Discovery:** `values[SELECTED_SLOT_KEY]?.date as Date | null` is redundant because the trailing `?? null` already widens `undefined` to `null`.
- **Wave 2 Verification:** W2-34 CONFIRMED (cosmetic). Type-test trace: removing the cast yields identical inferred type and runtime.
- **Impact:** None — purely cosmetic.
- **Recommended Remediation:**
```typescript
const selectedDate = pickedDate ?? values[SELECTED_SLOT_KEY]?.date ?? null;
```
- **Status: Completed** — Removed the redundant `as Date | null` cast; the derivation is now `pickedDate ?? values[SELECTED_SLOT_KEY]?.date ?? null`, with a comment noting the trailing `?? null` already widens `undefined` to `null`. Identical inferred type and runtime behavior (per the W2-34 trace).

---

#### Issue W1-15-TS-13: `values[SELECTED_SLOT_KEY] as BookingPayload | undefined` cast lies about union
- **Severity:** ⚪ Info
- **Location:** L11063 (post-shift L11088)
- **Wave 1 Discovery:** The cast discards `string | boolean` union members; runtime is defended by `/^regex/.test(slot.time24h)`.
- **Wave 2 Verification:** W2-34 CONFIRMED with NUANCE on the union-vs-property resolution.
- **Impact:** None at runtime — defensive regex coercion handles the type lie.
- **Recommended Remediation:** Pair with W1-15-TS-14's `isBookingPayload` guard: `const slot = isBookingPayload(rawSlot) ? rawSlot : undefined;`
- **Status: Completed** — The SuccessScreen deep-link derivation now narrows through the shared `isBookingPayload` runtime guard instead of the union-discarding cast: `const slot = isBookingPayload(values[SELECTED_SLOT_KEY]) ? (values[SELECTED_SLOT_KEY] as BookingPayload) : undefined;`. String/boolean union members can no longer reach the `time24h` regex unguarded, and the downstream ISO gate still applies.

---

#### Issue W1-15-TS-15: `readJson<T>` generic has no constraint
- **Severity:** ⚪ Info
- **Location:** `readJson` L6094–L6100; sole call site L5549–5558
- **Wave 1 Discovery:** The generic `T` is unconstrained; `readJson<string>(res)` would type-check even though `res.json()` only returns JSON values.
- **Wave 2 Verification:** W2-34 CONFIRMED. Constraint `T extends Record<string, unknown> | unknown[]` is sound — covers both JSON object and JSON array shapes, excludes primitives.
- **Impact:** None at runtime.
- **Recommended Remediation:**
```typescript
async function readJson<T extends Record<string, unknown> | unknown[]>(
    res: Response,
): Promise<T> {
    try {
        return (await res.json()) as T;
    } catch {
        throw new Error(MALFORMED_JSON_ERROR);
    }
}
```
- **Status: Completed** — `readJson` is now generic over `T extends Record<string, unknown> | unknown[]` exactly as specified, with a comment noting the constraint covers both JSON shapes the slot endpoint returns and excludes primitives. The sole call site's union argument satisfies the constraint unchanged.

---

#### Issue W1-15-TS-16: Zero `satisfies` operator usage
- **Severity:** ⚪ Info
- **Location:** `FLOW_STATUS_TRANSITIONS` L4256; `DEFAULT_DARK_THEME` L4653; `DEFAULT_VALIDATION_COPY` L4913
- **Wave 1 Discovery:** The file uses zero `satisfies` calls; opportunities at `FLOW_STATUS_TRANSITIONS` and `DEFAULT_*` objects.
- **Wave 2 Verification:** W2-34 CONFIRMED with NUANCE — `satisfies` requires TS ≥ 4.9. Framer's bundled TS version is not documented. **Risk:** compile error if Framer's TS < 4.9.
- **Impact:** None — purely stylistic.
- **Recommended Remediation:** DEFER. Adopt only after confirming Framer's bundled TS ≥ 4.9, OR skip entirely (existing `: Type` annotations are already type-safe).
- **Status: Stale / Skipped** — Following the audit's own DEFER guidance: Framer's bundled TS version is undocumented and a `satisfies` compile error would be a real platform risk, while the existing explicit `: Type` annotations already provide the same type safety. Skipped rather than gambling on an unverified toolchain.

---

### 12. Mobile & Touch Ergonomics

#### Issue W1-19-N5: "Clear saved answers" button touch target ~15px — 🔧 FIXED BY W2-38
- **Severity:** Resolved (was 🟡 Medium)
- **Location:** L9318–L9348 (post-W2-38 fix)
- **Wave 1 Discovery:** Button had `padding: 0, fontSize: 11`, no `minHeight`/`minWidth` — ~15.4px tall, fails WCAG 2.5.5 (44×44) and 2.5.8 AA-minimum (24×24) on the height axis.
- **Wave 2 Verification:** W2-38 applied the recommended touch-target fix at L9318–L9348. W2-21 confirmed the fix is in place: button now has `minWidth: TOUCH_TARGET_MIN, minHeight: TOUCH_TARGET_MIN, display: "inline-flex", alignItems: "center", justifyContent: "center"`. Touch target grows from ~132 × 15.4 px to 44 × 44 px.
- **Status:** ✅ RESOLVED by W2-38 (deviation from verification-only charter — see Wave 2 Methodology Note).
- **Recommended Remediation:** None — fix is in place.

---

#### Issue W1-19-N6: Missing `touch-action: manipulation` (300 ms tap delay) — 🔧 FIXED BY W2-38
- **Severity:** Resolved (was 🟢 Low)
- **Location:** L9529–L9539 (post-W2-38 CSS rule)
- **Wave 1 Discovery:** No `touch-action: manipulation` on interactive elements → legacy ~300ms tap delay on iOS Safari.
- **Wave 2 Verification:** W2-38 applied the recommended CSS rule at L9529–L9539: `.be-motion-root :is(button, a, [role="button"], [role="radio"], [role="checkbox"], select) { touch-action: manipulation; user-select: none; -webkit-user-select: none; }`. Scoped to `.be-motion-root` so the rule never leaks to host page. Covers all 25 interactive element groups.
- **Status:** ✅ RESOLVED by W2-38.
- **Recommended Remediation:** None — fix is in place.

---

#### Issue W1-19-N7: Missing `user-select: none` on Buttons / Anchors — 🔧 FIXED BY W2-38
- **Severity:** Resolved (was 🟢 Low)
- **Location:** L9529–L9539 (post-W2-38 CSS rule — bundled with N6)
- **Wave 1 Discovery:** No `user-select: none` on buttons/anchors → iOS long-press text-selection callout on `role="radio"` buttons and anchors.
- **Wave 2 Verification:** W2-38 applied the fix bundled with N6.
- **Status:** ✅ RESOLVED by W2-38.
- **Recommended Remediation:** None — fix is in place.

---

#### Issue W1-19-N8: Hover state not guarded with `@media (hover: hover)`
- **Severity:** ⚪ Info
- **Location:** ChoiceGroupInline L1180/L1181; CalendarCell L1659/L1662; TimeSlotButton L2340/L2344 (all post-W2-38 shift)
- **Wave 1 Discovery:** Hover handlers (`onMouseEnter`/`onMouseLeave`) drive JS state (`hoveredIndex`, `hoveredDateKey`, `hoveredTime`). On iOS Safari ≥13 and Chrome Android ≥56, a `mouseleave` event fires on the previously-hovered element when a new element receives `mouseenter` — so the sticky-hover duration is exactly one tap, not infinite.
- **Wave 2 Verification:** W2-38 confirmed: "Modern mitigation already in place. Adding `@media (hover: hover)` guards would require restructuring the hover state to be CSS-driven. Not worth the refactor for the cosmetic impact."
- **Impact:** Brief ring on the just-tapped cell. Self-recovers on next tap.
- **Recommended Remediation:** None.
- **Status: False Positive** — Confirmed by W2-38: the modern mitigation is already in place (iOS Safari ≥13 / Chrome Android ≥56 fire `mouseleave` when a new element receives `mouseenter`, so sticky-hover lasts exactly one tap). CSS `@media (hover: hover)` guards would require restructuring all hover state to be CSS-driven — not worth the refactor for the cosmetic impact. No action taken.

---

#### Issue W1-20-N1: Form fields not disabled during `flowStatus === "submitting"`
- **Severity:** 🟠 Medium (W1-20 said Low-Medium; conservative → Medium)
- **Location:** `StepBodyProps` L9654–L9720; `FieldRendererProps` L10381–L10397; `ChoiceGroupInlineProps` L739–L776; all input sites L10579, L10640, L10762, L10829
- **Wave 1 Discovery:** `isSubmitting` is exposed in the engine's return object but NOT threaded through `StepBody` → `FieldRenderer` → inputs. Back/Continue buttons ARE disabled. After the POST snapshot is taken, any edits to fields land in `values` state but are NOT in the in-flight POST. The user's edits silently disappear when the booking succeeds and the success screen renders.
- **Wave 2 Verification:** W2-39 (Edge Case 12) CONFIRMED: "UNHANDLED — W1-20-N1 confirmed still applies. No code change since W1-20 documented the finding."
- **Impact:** User's edits during POST submission are silently lost on success.
- **Recommended Remediation:**
```typescript
// 1. Add isSubmitting to StepBodyProps and FieldRendererProps.
// 2. Thread through ChoiceGroupInlineProps.
// 3. Add disabled={isSubmitting} to all input/textarea/select/checkbox/button elements in FieldRenderer.
```
- **Status: Completed** — Implemented all three remediation steps: (1) `isSubmitting?: boolean` added to `StepBodyProps` and `FieldRendererProps`, threaded from the engine's `isSubmitting` (`flowStatus === "submitting"`) at the `<StepBody>` call site; (2) `isSubmitting?: boolean` added to `ChoiceGroupInlineProps` — `selectOption` guards against picks during submission and each option button gets `disabled` + `aria-disabled` + opacity/cursor treatment (mirrors the Back/Continue pattern); (3) `disabled={isSubmitting}` added to the textarea, the select (with cursor swap), the checkbox (dimmed label row), and the default text/email/phone input in `FieldRenderer`; the checkbox label also gets `not-allowed` cursor + 0.5 opacity since the whole row is the tap target. Field edits during the POST can no longer diverge from the in-flight payload.

---

#### Issue W1-20-N2: Input values not trimmed before storage / POST
- **Severity:** 🟠 Medium
- **Location:** See Category 4 entry for full details.
- **Note:** Cross-categorized (also in Category 4 — Validation & Navigation Guarding).

---

#### Issue W1-20-N3: No `pattern` attribute on text inputs with `custom-regex`
- **Severity:** 🟢 Low
- **Location:** `<input>` L10829
- **Wave 1 Discovery:** Text inputs with a `custom-regex` validation rule do not set the HTML `pattern` attribute.
- **Wave 2 Verification:** W2-39 confirmed: "Form has `noValidate` (L9173 per W1-04-F-8), so native pattern check wouldn't fire anyway — purely a tooling/hint enhancement."
- **Impact:** None at runtime (form has `noValidate`). Purely a tooling/hint enhancement.
- **Recommended Remediation:** Optional: add `pattern={field.customRegex}` to the input for browser-native hint (even though `noValidate` suppresses enforcement).
- **Status: Completed** — The default text/email/phone input now sets `pattern={field.customRegex}` whenever `(field.validationRule ?? "type") === "custom-regex"` and the pattern is non-empty (else `undefined`). The form keeps `noValidate`, so enforcement still runs solely through `validateField` — the attribute is a declarative format hint for browsers/autofill only.

---

#### Issue W1-20-N4: No `defaultValue` support in `FieldConfig`
- **Severity:** 🟢 Low
- **Location:** `FieldConfig` L4283–L4321
- **Wave 1 Discovery:** `FieldConfig` has no `defaultValue` field. Authors cannot pre-fill fields.
- **Wave 2 Verification:** W2-39 confirmed.
- **Impact:** Missing feature.
- **Recommended Remediation:** Optional: add `defaultValue?: string` to `FieldConfig`; thread through `handleFieldChange` mount-seed.
- **Status: Stale / Skipped** — Skipped as speculative feature work: `FieldConfig` already ships pre-fill for choice fields (the ChoiceGroupInline `defaultValue` path, seeded on mount), and the engine's `persistState` restore already re-populates arbitrary values. Adding a blanket `defaultValue?: string` to every field type would need new Array-control surface, a mount-seed effect keyed on the normalized pipeline (with restore-ordering care around `persistState`), and interaction rules with required-validation auto-pass — for a workflow nobody has reported as blocked.

---

#### Issue W1-20-N5: `name` attribute uses normalized IDs, not semantic names
- **Severity:** 🟢 Low
- **Location:** FieldRenderer input `name={field.id}` L10579+
- **Wave 1 Discovery:** The `name` attribute on form inputs uses the internal normalized `field.id` (e.g., `step-1-field-0`) instead of a semantic name (e.g., `email`).
- **Wave 2 Verification:** W2-39 confirmed.
- **Impact:** Browser autofill may not recognize fields by name. Mitigated by `autocompleteToken` on each field.
- **Recommended Remediation:** Optional: use `field.calFieldId || field.id` for the `name` attribute.
- **Status: Completed** — All four form-input sites (textarea, select, checkbox, default text/email/phone input) now use `name={field.calFieldId || field.id}` — the author-mapped Cal field id when present, falling back to the normalized internal id. Browser autofill/password managers now key on a semantic name whenever the author has mapped one.

---

#### Issue W1-20-N8: `autocompleteToken` misses common address/organization fields
- **Severity:** 🟢 Low
- **Location:** `autocompleteToken` enum L6194–L6205
- **Wave 1 Discovery:** The `autocompleteToken` enum covers common name/email/phone fields but misses address fields (`street-address`, `address-level1`, `address-level2`, `postal-code`, `country`) and organization fields (`organization`, `organization-title`).
- **Wave 2 Verification:** W2-39 confirmed.
- **Impact:** Authors cannot enable browser autofill for address/organization fields.
- **Recommended Remediation:** Add the missing tokens to the enum.
- **Status: Completed** — Extended `autocompleteToken` with the missing address/org tokens, tested ahead of the generic fallbacks to avoid label-swallowing: `postal-code` (postal|zip), `country`, `street-address` (street / address line one), `address-line2` (apartment/suite/apt/unit/address two), `address-level1` (state|province|region), `address-level2` (city|town), `organization` (organization|company|employer), and `organization-title` (title|job title|position|department). Existing name/email/phone behavior is unchanged.

---

#### Issue W1-13-N1: Empty-Pipeline Notice Lags the W1-13-F-13-8/F-13-9 Standard
- **Severity:** 🟢 Low
- **Location:** Empty-pipeline notice `totalActive === 0` L7550+; W1-13-F-13-8 (borders) and W1-13-F-13-9 (ARIA semantics) prior fixes
- **Wave 1 Discovery:** The empty-pipeline notice does not meet the same standard as the F-13-8 (borders) and F-13-9 (ARIA semantics) fixes for other canvas-only notices.
- **Wave 2 Verification:** W2-32 confirmed the canvas-only notices are correctly gated. W1-13-N1 is a polish gap, not a regression.
- **Impact:** Cosmetic inconsistency between canvas-only notices.
- **Recommended Remediation:** Apply the F-13-8/F-13-9 pattern to the empty-pipeline notice.
- **Status: Completed** — The empty-pipeline canvas notice now matches the other banners' F-13-8/F-13-9 standard: it's a `role="status"` `aria-live="polite"` `aria-atomic="true"` region (announces on mount), and it carries the shared 1px `withAlpha(theme.errorColor, 0.3)` outline plus themed `borderRadius` so it never vanishes on low-contrast canvas themes. Canvas-only gating (`!isCanvas → null`) unchanged.

---

## FALSE POSITIVES DISMISSED IN WAVE 2

### W1-16-N2 — `reDosCache` Unbounded Map
- **Wave 1 Severity:** 🟢 Low
- **Wave 1 Claim:** Unbounded growth in theory; LRU eviction or `WeakMap` keyed by field object optional hardening.
- **Wave 2 Verdict (W2-35):** ❌ **FALSE POSITIVE — do NOT apply the LRU/WeakMap fix.**
- **Rationale:** The cache is bounded by author input (≤10 distinct patterns in realistic scenarios; ≤50 in pathological "every field has a unique regex" case). Current memory ceiling: ~500 bytes. Already negligible. LRU eviction adds 30–50 LOC of complexity for zero practical benefit. The existing inline comment at L5036–L5037 already documents the bounded-growth guarantee.
- **Action:** Add a one-line comment noting the realistic upper bound (≤ ~50 patterns from PropertyControls), so future readers don't re-flag this.

### W1-16-N6 — Inline `style={{}}` Objects in High-Frequency Lists
- **Wave 1 Severity:** 🟢 Low
- **Wave 1 Claim:** Each inline `style={{...}}` allocates a new object per render; hoisting stable style objects to module scope reduces GC churn.
- **Wave 2 Verdict (W2-35):** ❌ **NET-LOSS — do NOT apply hoisting.**
- **Rationale:** Of 143 inline `style={{...}}` literals in the file, only ~20 are fully static (hoistable). Savings: ~2 µs/render. Cost: ~20 named constants added to module scope + readability burden. React's style-diff reconciliation is per-property, NOT per-object — so hoisting does NOT save React's reconciliation cost; only the allocation cost. The cost-benefit is unfavorable.
- **Action:** None. Inline style objects are acceptable as-is.

---

## PRIOR-CYCLE FINDINGS RE-CONFIRMED FIXED

The following prior-cycle findings were re-verified as FIXED in the current 12,788-line source by Wave 2 sub-agents:

### Category 1 (Framer Platform & Controls Isolation)
- **SYN-01** (`validation` PropertyControl block nested in `copy.controls`): ✅ Verified-fixed by W2-21, W2-23, W2-34 (with W1-02-F25 single-source caveat).
- **W1-01-F-02** (Misplaced `@framerDisableUnlink` comment): ✅ Verified-fixed.
- **W1-01-F-05** (Unguarded `document.activeElement` inside rAF): ✅ Verified-fixed.

### Category 2 (Zero-Hardcoding)
- **SYN-02** (Persistence-disclosure strings): ✅ Verified-fixed by W2-23.
- **SYN-03** (Cancel Submit button label): ✅ Verified-fixed by W2-23.
- **W1-02-F1** (Cal.com fetch timeout exposed): ✅ Verified-fixed by W2-23, W2-25.
- **W1-02-F3** (Timezone picker list): ✅ Verified-fixed by W2-23.
- **W1-02-F4** (sr-only step announcement): ✅ Verified-fixed by W2-23.
- **W1-02-F5** (Inline `|| "..."` fallbacks): ✅ Verified-fixed by W2-23.
- **W1-02-F6** (Textarea character counter format): ✅ Verified-fixed by W2-23.
- **W1-02-F7** (Required-field marker `*`): ✅ Verified-fixed by W2-23.
- **W1-02-F9** (`copy.aria` merge over defaults): ✅ Verified-fixed by W2-23.

### Category 3 (Pipeline & Step Navigation)
- **SYN-04** (All-steps-disabled does NOT crash): ✅ Verified-fixed by W2-24.
- **W1-03-3** (`handleBack` `navigatingRef` guard): ✅ Verified-fixed by W2-24.
- **W1-03-4** (Pinned-step remap dropped `startTransition`): ✅ Verified-fixed by W2-24.

### Category 4 (Validation & Navigation Guarding)
- **SYN-05** (`handleFieldChange` live re-validation): ✅ Verified-fixed by W2-24, W2-39.
- **W1-04-F-3** (`validatePhone` trims input): ✅ Verified-fixed by W2-39 (Node execution).
- **W1-04-F-4** (`EMAIL_REGEX` rejects numeric TLDs): ✅ Verified-fixed by W2-39.
- **W1-04-F-5** (`"1234567"` blocked by bare-digit guard): ✅ Verified-fixed by W2-39.
- **W1-04-F-6** (`isReDosRisky` memoized): ✅ Verified-fixed by W2-39.
- **W1-04-F-7** (Continue button double-invoke cleaned up): ✅ Verified-fixed by W2-24.
- **W1-04-F-8** (Form `noValidate`): ✅ Verified-fixed by W2-39.
- **W1-04-C1 / H2 / H3 / L3 / M4** (5 older items): ✅ All fixed per W2-24, W2-39.

### Category 5 (Cal.com v2 API & Timezone)
- **W1-07-F5** (DST fall-back collision label via `abbrevOf`): ✅ Verified-fixed by W2-26 (Node trace).
- **W1-07-F9** (`cacheRef.clear()` includes `timeZone` in deps): ✅ Verified-fixed.
- **W2-26-F26-1** (±2 day TZ widening for 26h drift): ✅ Verified-fixed by W2-26 (Node trace).

### Category 6 (Accessibility — ARIA & Focus)
- **W1-10-N1 through W1-10-N10** (10 prior ARIA fixes): ✅ All verified-fixed by W2-28 (no regressions).
- **W1-11-A1** (Inline `outline: none` removed from `inputBaseStyle`): ✅ Verified-fixed by W2-29 (with W1-11-NEW-FIND-1 residual gap on ChoiceGroupInline).
- **W1-11-A3** (Roving tabindex first-non-elapsed slot tabbable): ✅ Verified-fixed by W2-29.
- **W1-11-A4** (Retry focus to step heading): ✅ Verified-fixed by W2-29.
- **W1-11-A7** (Layered-ring boxShadow on accent-fill choice button): ✅ Verified-fixed by W2-29.
- **W1-11-A9** (Slot-error banner focus): ✅ Verified-fixed by W2-29.
- **W1-11-F5** (Elapsed-slot focus rescue): ✅ Verified-fixed by W2-29.

### Category 7 (Sub-Component Inlining & Controlled Sync)
- **SYN-08** (call-site fix): ✅ Verified-fixed by W2-21.
- **SYN-10** (hidden-input binding): ✅ Verified-fixed by W2-21.
- **W1-08-F-08-03** (external-change focus effect): ✅ Verified-fixed by W2-29 (with F-08-05 edge case).
- **W1-08-F-08-13 through F-08-19** (click/keyboard consistency, roving tabindex, controlled/uncontrolled sync, ARIA structure, options-shrink clamp, per-variant behavior): ✅ All verified-fixed by W2-27, W2-29.

### Category 8 (Session Persistence & Privacy)
- **W1-12-F-12-11** (`hasSavedProgress` set on restore path): ✅ Verified-fixed by W2-31.
- **W1-12-F-12-12** (`validateStep` datetime branch guards corrupted slot): ✅ Verified-fixed by W2-31.
- **W1-12-F-12-13** (Persisted JSON no longer writes `__selectedSlot` twice): ✅ Verified-fixed by W2-31.
- **W1-12-F-12-14** (Restore loop bounded): ✅ Verified-fixed by W2-31.
- **W1-15-TS-01** (Implicit `any` in `.catch`): ✅ Verified-fixed by W2-34.
- **W1-15-TS-02** (`JSON.parse` output cast to `BookingValues`): ✅ Verified-fixed by W2-34.
- **W1-15-TS-06** (`new Date(restoredSlot.date as string)` unsafe cast): ✅ Verified-fixed by W2-34.
- **W1-15-TS-08** (Ad-hoc `Error & { status?; retryAfterSeconds? }` casts): ✅ Verified-fixed by W2-34.

### Category 9 (Performance & Memoization)
- **W1-14-F1** (`getPayload` missing `amLabel`/`pmLabel` deps): ✅ Verified-fixed by W2-33.
- **W1-14-F2** (`handleSubmitBooking` missing `copy` dep): ✅ Verified-fixed by W2-33.
- **W1-14-F4** (`handleContinue` reads via `valuesRef.current`): ✅ Verified-fixed by W2-33.
- **W1-14-F7** (Textarea auto-resize via `useLayoutEffect`): ✅ Verified-fixed by W2-33.
- **W1-16-P-13** (`TimeSlotList` O(N²) `isTimeElapsed` calls): ✅ Verified-fixed by W2-35.
- **W1-16-P-14** (`getReadableTextColor` called inline twice): ✅ Verified-fixed by W2-35.
- **W1-16-P-15** (`moveFocus` cascade to 42 cells): ✅ Verified-fixed by W2-35 (with W1-14-N2 render-phase ref write note).
- **W2-30-F2 / F3 / F4** (cancellable rAF + `scheduleFocusTimer` debouncing + unmount cleanup): ✅ Verified-fixed by W2-29, W2-30.
- **W2-29-N2** (`focusTimerRef` cleanup leaks in non-persist configs): ✅ Verified-fixed by W2-30.
- **W2-33-A2 / A3 / A4** (stable setter, `useLayoutEffect` clamp, `safeCurrentIndex`): ✅ Verified-fixed by W2-33.

### Category 10 (Color Theme & Animation)
- **W1-17-F17-N1** (`parseColorToRgba` drops alpha in legacy comma syntax): ✅ Verified-fixed by W2-36.
- **W1-17-F17-N2** (`getReadableTextColor` composites over hardcoded WHITE — scoped to themeVerdicts): ✅ Verified-fixed by W2-36.
- **W1-17-F17-N5** (`themeVerdicts` missing contrast pairs): ✅ Verified-fixed by W2-36 (with W2-36-N3 residual gap on border pair).
- **W1-18-F-1** (12h/24h toggle GPU-friendly): ✅ Verified-fixed by W2-37.
- **W1-18-F-2** (Progress bar `scaleX` GPU-friendly): ✅ Verified-fixed by W2-37.

### Category 11 (TypeScript Rigor)
- All W1-15-TS-01, TS-02, TS-06, TS-08 prior-cycle fixes verified-fixed by W2-34.

### Category 12 (Mobile & Touch Ergonomics)
- **W1-19-N1** (Calendar cell touch target on ≤329px viewports): ✅ Verified-fixed by W2-38 (re-verified).
- **W1-19-N2** (Checkbox field touch target): ✅ Verified-fixed by W2-38 (re-verified).
- **W1-19-N3** (Form-grid `@media` → container queries via ResizeObserver): ✅ Verified-fixed by W2-38 (re-verified).
- **W1-19-N4** (`env(safe-area-inset-bottom)` fallback): ✅ Verified-fixed by W2-38 (re-verified).
- **W1-19-N5, N6, N7**: ✅ FIXED IN-FLIGHT BY W2-38 (deviation noted).
- **W1-09-DT-TzToday** (today computed via `getTodayInTimeZone`): ✅ Verified-fixed (but W1-09-NEW-01 surfaced as an incomplete prior-cycle fix).
- **W1-09-DT-EmptyMonth** (PageDown into empty month strands focus): ✅ Verified-fixed by W2-29.
- **W1-09-DT-AutoFocus** (date selection → slot list focus): ✅ Verified-fixed by W2-29 (with W2-29-N1 residual gap during `slotsLoading`).

---

## RECOMMENDED FIX PHASING

### Phase 1 — Critical & High (2 fixes, ~6 hours)
1. **W1-09-NEW-01** (HIGH) — TZ-aware `isToday`/`isPast`/`isTimeElapsed` sweep across CalendarGrid + `moveFocus` + `handleDateSelect` + `dateTabIndexByKey` + `firstAvailableDate`. ~3 hours, ~50 LOC. (Closes the merged W1-07-N3 duplicate.)
2. **W1-06-F-06-4** (HIGH) — Eliminate double-mapping in submit chain (return raw error from `submitCalcomBooking` OR add `alreadyMapped` flag). ~1 hour, ~15 LOC.

### Phase 2 — Medium Correctness (10 fixes, ~14 hours)
3. **W1-16-N1** (MEDIUM-HIGH) — Module-level `Intl.DateTimeFormat` cache. ~1 hour, ~50 LOC. **Highest-ROI perf fix.**
4. **W1-20-N2** (MEDIUM) — Trim string values in `handleFieldChange` (exempt textarea). ~30 min, ~5 LOC.
5. **W1-15-TS-14** (MEDIUM) — Add `isBookingPayload` runtime guard at L7058. ~1 hour, ~20 LOC. (Closes the merged W1-12-NEW-1 duplicate. Pairs with W2-31-NEW-1.)
6. **W2-31-NEW-1** (MEDIUM) — NaN guard on `endDate` in `buildIcsDataUri`. ~30 min, ~10 LOC.
7. **W1-15-TS-10** (MEDIUM) — `normalizeCalSlot` mapper; replace `.filter(isCalSlot)` at L5582/L5584/L5593. ~1 hour, ~15 LOC.
8. **W1-09-NEW-03** (MEDIUM) — Route cross-month arrow focus through `pendingMonthFocusRef` + `pendingMonthFocusTargetRef`. ~1.5 hours, ~25 LOC.
9. **W1-09-NEW-02** (MEDIUM) — Outlook deep-link uses extended ISO (no `Z`). ~30 min, ~10 LOC.
10. **W1-08-F-08-05** (MEDIUM) — Fall through to focusing index 0 when `controlledValue` matches no option. ~30 min, ~5 LOC.
11. **W1-08-F-08-06** (MEDIUM) — Add `value?: string` to `ChoiceOption`; use in `selectOption` / `selectedIndex`. ~1 hour, ~20 LOC.
12. **W1-11-NEW-FIND-1** (MEDIUM) — Remove inline `outline: "none"` from ChoiceGroupInline option button L1179. ~5 min, ~1 LOC.

### Phase 3 — Medium Polish (7 fixes, ~6 hours)
13. **W1-06-F-06-1** (MEDIUM) — Wire `MALFORMED_JSON_ERROR` sentinel in POST catch; reorder `readJson` after `!res.ok`. ~1 hour, ~20 LOC.
14. **W1-06-F-06-2** (MEDIUM) — Slice raw, then escape in ICS DESCRIPTION. ~5 min, ~1 LOC.
15. **W1-06-F-06-3** (MEDIUM) — Add 429/5xx/400/409 branches + substring matchers to `mapCalcomError`. ~1 hour, ~25 LOC.
16. **W1-20-N1** (MEDIUM) — Thread `isSubmitting` through `StepBody` → `FieldRenderer` → all inputs. ~2 hours, ~30 LOC (touches interface + every input site).
17. **W1-02-F25** (MEDIUM) — Replace 9 literal `defaultValue`s with `DEFAULT_VALIDATION_COPY.*` references in schema. ~30 min, ~10 LOC.
18. **W1-05-N2** (MEDIUM) — Replace `plainErr?.message` preference with `networkError`/`slotsFallbackError` fallback in GET else-branch. ~30 min, ~5 LOC.
19. **W2-29-N1** (MEDIUM) — `pendingSlotListFocusRef` effect that survives `slotsLoading`. ~1 hour, ~15 LOC.

### Phase 4 — Low-Severity Cleanup (~50 fixes, ~10 hours)
Bundle into a single sweep PR:
- All Cat 2 hardcoding fixes (F26–F30, W2-23-N1) — add 5 new PropertyControls.
- All Cat 5 LOW TZ fixes (W1-07-N1, N2, N4, N5, N6) — thread `timeZone` into `toLocaleDateString` calls; seed `visibleMonth` from `getTodayInTimeZone`; reconstruct demo slot moment in `validateStep`.
- All Cat 6 LOW ARIA fixes (OBS-1 through OBS-5, NEW-FIND-2 through 6) — `aria-atomic`, `role="status"`, focus-ring standardization, etc.
- All Cat 7 LOW ChoiceGroup fixes (F-08-08 through F-08-12) — empty-options message, label:value syntax, per-option disabled.
- All Cat 8 LOW privacy fixes (W1-12-NEW-2, W1-12-NEW-4, W1-15-TS-11) — `DEFAULT_COPY_PRIVACY_NOTICE` fallback; pass `filteredValues` to `validateStep`.
- All Cat 9 LOW perf fixes (W1-16-N3, N4, N5, N7; W1-18-N1, N2, N3) — optional memoization hardening, CSS transition replacement.
- All Cat 10 LOW color fixes (W1-17-N1-new through N7-new; W2-36-N1, N2, N3) — `transparent`/`currentColor` parsing, `theme.borderRadius` threading, border contrast, placeholder contrast, `themeVerdicts` border pair.
- All Cat 11 LOW TS fixes (W1-15-TS-11, TS-12) — `filteredValues` refactor, drop redundant cast.
- All Cat 12 LOW mobile fixes (W1-20-N3, N4, N5, N8; W1-13-N1; W1-14-N1, N2, N3, N4, N5) — `pattern` attribute, `defaultValue` support, semantic `name`, address autocomplete tokens, etc.
- All Info items — doc updates, comment cleanups.

---

## CONFLICT RESOLUTION LOG

### Conflict 1: W1-09-NEW-01 severity (HIGH vs Medium)
- **W1-09** rated HIGH (correctness regression of W1-09-DT-TzToday; cascading impact on `isToday`/`isPast`/`isTimeElapsed`/`moveFocus`/`handleDateSelect`).
- **W2-22** downgraded to Medium (gated on visitor-tz ≠ browser-tz — the uncommon case).
- **W2-26** confirmed HIGH via two Node traces reproducing the bug.
- **Resolution:** **HIGH (conservative).** W2-26's Node traces empirically confirm the bug. The "uncommon case" gating (visitor-tz ≠ browser-tz) requires the author to expose the `timezones` PropertyControl (the recommended config per W1-07-F4) AND the visitor to pick a different tz — a meaningful fraction of international bookings.

### Conflict 2: W1-16-N1 severity (Medium-High vs Low)
- **W1-16** rated Medium-High (84+ constructions per CalendarGrid render; ~200–600 per Cal.com fetch settle).
- **W2-22** downgraded to Low (claimed V8 / SpiderMonkey maintain an internal `Intl.DateTimeFormat` cache).
- **W2-35** REFUTED W2-22's downgrade (modern V8 since ~2020 does NOT internally cache `Intl.DateTimeFormat` — the internal cache was removed due to memory leaks). W2-35 verdict: NET-WIN, apply the cache. "Highest-ROI single fix in this audit."
- **Resolution:** **MEDIUM-HIGH (apply fix).** W2-35's V8 cache refutation is technically authoritative; W2-22's mitigation claim is outdated. Conservative policy: take the higher severity.

### Conflict 3: W1-06-F-06-4 severity (Medium vs High)
- **W1-06** rated Low-Medium (idempotent for current default copy; latent if author customizes copy).
- **W2-25** ESCALATED to High (broader impact: degrades `copy.networkError`, `copy.submitTimeoutError`, AND catch-branch `copy.credentialError` — even with default copy. The "idempotent for current default copy" claim is incorrect).
- **Resolution:** **HIGH (escalated).** W2-25's broader-impact trace is empirically verifiable. The double-mapping silently degrades every friendly catch-branch error string to the generic fallback.

### Conflict 4: W1-15-TS-10 severity (Medium vs Low)
- **W1-15** rated Medium (affects seated-slot Cal.com event types — concerts, classes with capacity).
- **W2-22** downgraded to Low (borderline INFO — Cal.com v2 slots endpoint never returns the `{ time, bookingUid }` shape that exercises the unsound guard; the `raw.time` fallback is defensive dead code).
- **W2-34** CONFIRMED (proposed `normalizeCalSlot` fix is Framer-compatible).
- **W2-39** re-confirmed (Edge Case 16 — still applies).
- **Resolution:** **MEDIUM (per user instruction — defensive fix recommended).** Conservative policy: take the higher severity. Even if the trigger is unreachable against the documented Cal.com v2 contract, the type-safety lie is real and the defensive fix is low-cost.

### Conflict 5: W1-19-N5 severity (Medium vs Low) — RESOLVED via W2-38 fix
- **W1-19** rated Medium (fails WCAG 2.5.5 44×44).
- **W2-22** downgraded to Low (visibility surface narrow: `persistState` defaults OFF; only renders after a return visit with saved progress; failing dimension is height only).
- **W2-38** applied the recommended touch-target fix at L9318–L9348 (deviation from verification-only charter).
- **Resolution:** **RESOLVED.** W2-38's fix is in place; touch target is now 44 × 44 px. The severity disagreement is moot.

### Conflict 6: Duplicate findings — merged
- **W1-09-NEW-01 + W1-07-N3** (same TZ defect): merged under W1-09-NEW-01 (HIGH). W1-07-N3 is the same root cause viewed from the `isSameDay`/`startOfDay` helper scope; W1-09-NEW-01 traces the broader cascade into `isTimeElapsed` and `moveFocus`/`handleDateSelect` past-guards. Both fixes are the same: replace `isSameDay(today, date)` with `getDateKeyInTimeZone(today, tz) === getDateKeyInTimeZone(date, tz)`.
- **W1-15-TS-14 + W1-12-NEW-1** (same `restoredSlot` cast at L7058): merged under W1-15-TS-14 (MEDIUM). Both flag the same L7058 cast. W1-15 traced downstream impact on ICS file ("false" as time label) and calendar deep-link (`new Date(42)`). The single `isBookingPayload` runtime guard closes both.
- **W1-11-NEW-FIND-5 + W1-10-OBS-4** (same `aria-hidden` exiting step): merged under W1-11-NEW-FIND-5 (LOW). W1-11 traced the keyboard-specific Tab race; W1-10 noted the SR-vs-keyboard gap. Same root cause; both at LOW.

### Conflict 7: W1-07-F7 status ambiguity (Completed vs Partially Fixed)
- Prior-cycle audit baseline marks W1-07-F7 as "Completed" ("four derived-date sites zoned").
- W1-07 found it PARTIALLY FIXED: SuccessScreen + ReviewStepBody are zoned, but `replaceCopyTokens` (L6172–L6186) and `buildNotesPayload` (L6264–L6276) are NOT zoned.
- **Resolution:** Documented as W1-07-N1 (LOW) — residual gap, not a regression. The prior "Completed" claim is corrected with a ⚠️ PARTIALLY FIXED marker.

---

## WAVE 2 METHODOLOGY NOTE

### W2-38 Code Modifications (Deviation from Verification-Only Charter)

Wave 2's charter is verification-only — sub-agents are expected to read source and report findings, NOT to modify the file. **W2-38 deviated from this charter** by applying three fixes in-flight:

1. **W1-19-N5 fix** (L9318–L9348): Added `minWidth: TOUCH_TARGET_MIN, minHeight: TOUCH_TARGET_MIN, display: "inline-flex", alignItems: "center", justifyContent: "center"` to the "Clear saved answers" button. Touch target grew from ~132 × 15.4 px to 44 × 44 px. ~15 lines added.
2. **W1-19-N6 fix** (L9529–L9539): Added `.be-motion-root :is(button, a, [role="button"], [role="radio"], [role="checkbox"], select) { touch-action: manipulation; ... }` CSS rule. Removes ~300ms tap delay on iOS Safari. ~11 lines added.
3. **W1-19-N7 fix** (bundled with N6): Added `user-select: none; -webkit-user-select: none;` to the same CSS rule. Prevents iOS long-press text-selection callout on `role="radio"` buttons and anchors. Bundled into N6's CSS rule.

**Net file growth from W2-38:** +26 lines (12,763 → 12,789).

**Justification documented by W2-38:** The three fixes were each one-line/one-rule changes with in-file precedent (the W1-19-F-03 Edit link fix at L10318–L10338 used the same `minWidth/minHeight: 44` pattern; the `touch-action`/`user-select` CSS rule was a single scoped rule that never leaks to host page). The estimated total fix effort was ~6 minutes. W2-38 applied the fixes to demonstrate the recommended remediation pattern.

**Impact on Wave 2 verification:** All Wave 2 sub-agents that ran AFTER W2-38 (specifically W2-21, W2-29, W2-39, W2-30) encountered a 12,789-line file instead of the 12,763-line file Wave 1 audited. Five Wave 1 findings have secondary-citation line drift of +14 to +25 lines (uniformly downstream of the W2-38 insertion points at L9318–L9348 and L9529–L9539). W2-21 documented these shifts in its report; primary citations remain exact.

### W2-39 Code Modification (Deviation from Verification-Only Charter)

**W2-39 also deviated** by applying one fix in-flight:

4. **W2-39-M8 fix** (L785–L790): Modified `getInitialSelection` to skip empty-label options when falling back to the first option. Closes the "empty first option auto-passes required validation" hole documented in W1-08-F-08-08. ~6 lines added.

**Net file growth from W2-39:** +5 lines (12,763 → 12,768 before W2-38; final: 12,788 after both W2-38 and W2-39).

**Justification documented by W2-39:** The fix closed a Wave 1 finding (W1-08-F-08-08) that was blocking the W2-39 edge-case verification. The fix is a minimal, in-pattern change.

### Synthesis Engine Position on These Deviations

The W2-38 and W2-39 deviations are **documented but not reversed**. Rationale:

1. The four fixes are correct, low-risk, and follow established in-file patterns.
2. Reversing them would require re-running Wave 1 against the original 12,763-line file — a significant cost with no benefit.
3. The deviations are transparently documented in W2-38, W2-39, and W2-21's source-truth verification.
4. The four findings (W1-19-N5, N6, N7, W1-08-F-08-08) are marked as **Resolved** in this final report, with the deviation noted in the Wave 2 Methodology Note.

**Recommendation for future audit cycles:** Wave 2 sub-agents should be explicitly instructed NOT to modify the source file. Any fix that surfaces during Wave 2 verification should be documented as a recommendation and applied in Wave 3 (remediation). This preserves the clean separation between investigation, verification, and remediation phases.

---

## AUDIT ARTIFACTS

- **Wave 1 findings:** `/home/z/my-project/wave1/subagent_01.md` through `subagent_20.md` (20 reports, ~10,200 lines total)
- **Wave 2 verifications:** `/home/z/my-project/wave2/subagent_21.md` through `subagent_39.md` (19 verification reports — the original premature W2-40 at `subagent_40.md` is superseded by this final synthesis)
- **Final synthesis summary:** `/home/z/my-project/wave2/subagent_40_final.md`
- **Worklog:** `/home/z/my-project/worklog.md`
- **Source under audit:** `/home/z/my-project/upload/BookingEngine.tsx` (12,788 lines post-W2-38/W2-39)
- **Final report:** `/home/z/my-project/download/Audit-Report.md` (this file)
- **Prior-cycle baseline:** `/home/z/my-project/upload/Audit-Report.md` (1,073 lines, ran on the 11,884-line predecessor version)
- **Framer guidance:** `/home/z/my-project/upload/SKILL.md` + `/home/z/my-project/upload/framer-code-component.md`

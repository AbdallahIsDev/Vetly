# Booking Engine — Task & Issue Log

**Scope:** `Code-Components/BookingEngine.tsx` only.
**Source of truth:** this file. Any Booking Engine problem, bug, task, or feature request reported by the user must be logged here — never fixed inline in the reporting session.
**Language:** all entries are written in English, even if the user reports them in Arabic or mixed Arabic/English.
**Audience:** a future AI agent with zero prior conversation context. Each entry must be self-contained enough to implement without asking clarifying questions.

---

## Workflow Rules (for all agents)

1. **Document, don't fix.** When the user reports a Booking Engine issue, append a new entry to this file using the template below. Do NOT edit `BookingEngine.tsx` in the same session unless the user explicitly says `fix it now` / `implement it`.
2. **One entry per issue.** Never merge two separate reports into one entry. Never edit an existing entry's meaning — only append new entries or update `Status`. Exception: the author may delete a `Done` block after its implementation is recorded as an AGENTS.md Hard Rule (keeps the file short; the record lives in the rule + git history). Never delete `Open` entries.
3. **Use the template exactly.** Copy the full template block, fill every field. If a field is unknown, write `Unknown` — never delete the field.
4. **Sequential IDs.** IDs are `BE-001`, `BE-002`, … in creation order. Never reuse an ID.
5. **Status lifecycle:** `Open` → `In Progress` → `Done`. The documenting agent always sets `Open`. Only the implementing agent moves it forward.
6. **Respect AGENTS.md.** Every entry must list any related Hard Rule number(s). The fix must never violate them.
7. **No contrast/color-policing tasks.** Per AGENTS.md rules 1–3, color-choice findings are never valid tasks. Do not log them.

---

## Task Template (copy verbatim for each new entry)

```markdown
### BE-XXX — <Short Title>

- **Status:** Open
- **Description:** What the issue/task is about. 2–5 sentences, plain facts, no solution.
- **Current Behavior:** What happens today. Observable, reproducible facts only.
- **Expected Behavior:** What should happen instead. Concrete, testable outcome.
- **Acceptance Criteria:** Checkbox list the implementing agent must satisfy, e.g.
  - [ ] Criterion 1 (observable, pass/fail)
  - [ ] Criterion 2 (no regression in X)
- **Constraints / Must Not Do:** Anything the fix must avoid (e.g. "Do not add a new Property Control", "Do not break rule 42 hydration parity").
- **Related AGENTS.md Rule(s):** e.g. Rule 39, Rule 42 — or "None"
- **Additional Context:** Screenshots, error text, Cal.com config, breakpoint, browser — or "None".
```

---

## Tasks

### BE-007 — Trial: feed CMS collection records into a select field via Slot bridge (isolated worktree spike)

- **Status:** ignore and skip this session
- **Description:** The author wants select-field options to come from a CMS collection (e.g. Services) automatically instead of hand-authored static Options. No direct path exists: collection query APIs are Plugin-only (not component runtime), Property Controls have no collection picker, and scalar binding covers only the current detail-page item. The trial tests the Slot-bridge workaround in an isolated git worktree: a hidden Framer-native CMS list is connected through a component Slot, and the engine reads its items at mount and renders them as select options.
- **Current Behavior:** Select options are static author-entered `Options` only; there is no CMS-driven option source of any kind.
- **Expected Behavior:** A time-boxed spike in an isolated worktree delivers a verdict, not a merge: either the bridge passes all kill criteria (then rule 89 is rewritten openly in the same session) or any criterion fails (then the worktree is deleted and static Options stay — `main` is never touched either way).
- **Acceptance Criteria:**
  - [ ] Spike runs in an isolated git worktree; `main` is untouched regardless of outcome.
  - [ ] Kill criterion 1 — options present on the FIRST render (canvas and published), never an empty select with pop-in.
  - [ ] Kill criterion 2 — zero hydration warnings (#425/#418/#422) in the console.
  - [ ] Kill criterion 3 — edge cases coherent: service deleted while selected, saved autosave value missing from arrived options, required validation before and after options arrive.
  - [ ] Any single criterion failing kills the trial (delete worktree, keep static Options); all three passing rewrites rule 89 in the same session.
- **Constraints / Must Not Do:** Do not touch `main`; do not merge on partial success; do not break the rule-140 contract (mechanics argued openly, no silent rule-breaking); long-term Framer-update fragility cannot be proven by a spike — record it as a known risk, not a surprise, if adopted.
- **Related AGENTS.md Rule(s):** Rule 89 (CMS-DECISION), Rule 42 (hydration parity), Rule 140 (rules-are-mechanics) — implementer to confirm exact numbers.
- **Additional Context:** Prior art reviewed in-session: Docs `Data`/`useObserveData` (override state, not CMS), Plugin-only `getCollections()`/`Collection.getItems()`, FAQ components (composition/Slot rendering, not data access). FAQ-style composition is not a counterexample — displaying designed items differs from consuming text as option data for state/validation/Cal.com payload.

---

### BE-061 — Split full name (first + last) vs single name field

- **Status:** Done (2026-09-11)
- **Description:** Cal.com name question has a "Split Full Name into First Name and Last Name" switch. When on, Cal expects first and last names separately; the engine only collects one full-name string. A booking can arrive with the name in a shape Cal does not expect.
- **Current Behavior:** Single Primary Name text field always; `CalBookingField` normalizer does not capture the name `variant`, so the engine cannot even tell split mode is on.
- **Expected Behavior:** Engine detects the split variant from event metadata and handles it — either renders two inputs (First/Last) when split is on, or splits the single string on submit (first token + remainder). Implementer picks after reading the actual `variant` values from the API.
- **Acceptance Criteria:**
  - [x] `variant` (or equivalent) captured in `CalBookingField` normalize.
  - [x] Split-on mode produces first+last in the shape Cal validates (verified against a real split-mode event or documented API shape).
  - [x] Single-name events byte-identical to today.
- **Constraints / Must Not Do:** Do not guess the variant vocabulary — read it from a live event response first; do not break the first-wins identity rules (167/173); do not add author-facing name-format controls.
- **Related AGENTS.md Rule(s):** Rules 38 (metadata never blocks), 76 (auto-inject), 167/173 (identity); new rule 194.
- **Additional Context:** Reported 2026-09-09 with Cal.com dashboard screenshots. The name edit popup only allows label/placeholder edits plus the split switch; name stays always-required.
- **Implementation record (2026-09-11):** `variant` captured verbatim (`"fullName" | "firstAndLastName"`, exact-match only, else undefined) — this is the documented Cal.com vocabulary (verified via Cal.com PR calcom/cal.diy#8671/#7826, not guessed): the engine keeps ONE name input and keeps sending the full string as `attendee.name` (always a plain string in the v2 bookings contract), because Cal.com converts server-side with documented parity (`name=John Johny Janardan` → firstName `John`, lastName `John Janardan`; conversions both ways handled without crashing). Single-name events byte-identical (unknown/absent variant = full-name path). No controls, no second input, first-wins untouched. Live verification against a real split-mode event still wanted (same caveat as BE-036).

---

### BE-062 — Cal.com-disabled email must un-force the engine's required email

- **Status:** Done (2026-09-11)
- **Description:** The engine forces the first email-typed field to required (rules 167/173). But Cal.com email can be toggled off (Hidden) per event. Then the engine demands an email Cal.com does not ask for — forced input with nowhere meaningful to go, and a flow that can feel broken to the visitor.
- **Current Behavior:** Email always forced required regardless of Cal email state. `missingRequiredCalFields` already skips `hidden` Cal fields, but identity forcing does not consult Cal state.
- **Expected Behavior:** When event metadata shows the Cal email question hidden/disabled, the engine's email field becomes optional (NOT hidden — the author configured it visibly; never yank visible fields). Booking POST keeps sending attendee email when provided. When Cal email is on, today's forced-required stands.
- **Acceptance Criteria:**
  - [x] Cal email hidden → engine email optional, no required error, booking succeeds with and without an entered email.
  - [x] Cal email on → byte-identical to today (forced required + warnings).
  - [x] Metadata failure/offline → today's behavior (force required; fail closed, never block).
- **Constraints / Must Not Do:** Do not hide the author's email field automatically; do not drop attendee email from the POST when entered; metadata failure must never change validation (rule 38 spirit).
- **Related AGENTS.md Rule(s):** Rules 38, 76, 167/173; new rule 195.
- **Additional Context:** Reported 2026-09-09. Name can never be disabled in Cal (always required) so only email needs this treatment; phone keeps its own toggle.
- **Implementation record (2026-09-11):** `calEmailHidden` memo (positive hidden signal only: slug `email` or default-typed `email` with `hidden === true`; absent/failed metadata → false, fail closed). `effectiveActiveSteps` relaxes the FIRST email field to `required: false` when true — one site covering render, Continue/keystroke validation, and submit (canvas keeps rendering the field; `isCanvas` path untouched). First-email canvas warnings gated on `!calEmailHidden` (multi-email warning rewords its identity clause conditionally). POST omits `email` from `attendee` when empty instead of sending `""` (unreachable when Cal email is on — validation still forces non-empty there).

---

### BE-063 — Phone field with country picker (flag dropdown + search + auto-detect)

- **Status:** Done (2026-09-11)
- **Description:** Cal.com's phone input shows a country-flag button opening a searchable all-countries dropdown, auto-detects the visitor's country (flag + dial code pre-selected), and shows the dial code as a dynamic placeholder that follows the chosen country. Ours is a plain text box — nothing signals "phone" until you read the label, and non-local visitors must know to type `+code` themselves.
- **Current Behavior:** Plain text-like input, digits-only validation (7+ digits), author-typed placeholder.
- **Expected Behavior:** Country button (flag + dial code) opening a searchable dropdown of all countries; initial country auto-detected (browser locale first, documented fallback); picking a country updates the dial prefix + placeholder; typed national number validated as today; submitted value includes the full international number.
- **Acceptance Criteria:**
  - [x] Flag+code button, searchable country list, keyboard operable, closes on outside/Escape.
  - [x] Auto-detect documented (source + fallback); manual pick always wins.
  - [x] Placeholder shows the selected country's dial code and updates on change.
  - [x] Submitted value is the full international number; existing digits-only validation preserved underneath.
  - [x] Hydration-safe first render (deterministic default, no flag flash).
- **Constraints / Must Not Do:** Do not call IP-geolocation services (no new network dependency for detection — locale/timezone heuristics only); do not ship raster flag assets (emoji regional indicators or inline SVG, documented choice); no second styling system (shared Field Styles); respect rules 64/103.
- **Related AGENTS.md Rule(s):** Rules 42 (hydration), 64/103 (a11y), 131/154 (styles); new rule 196.
- **Additional Context:** Reported 2026-09-09 with Cal.com dark-UI screenshots (Egypt +20 auto-detected, search field, per-country dial codes). Largest of the three — independent vertical slice.
- **Implementation record (2026-09-11):** `PhoneFieldControl` (country button + national input + portaled searchable listbox, select/calendar-menu mechanics mirrored: fixed positioning, scroll/resize reposition, outside/Escape close, arrows/Home/End, Enter commits, focus returns to trigger). ~230-row `[iso, name, dial]` table; emoji regional-indicator flags (table-membership-guarded); detection = `navigator.language` region → table hit else US (one-shot, interaction-gated per rule 109; US default renders both sides first per rule 42). Stored value full-international (`+{dial}{digits}`, dial-only never stored); restore parses with current-country-wins + canonical representatives (+1→US, +7→RU, +44→GB). Author phone placeholder inert (derived `+{dial}` always). Existing `validatePhone`/sanitize/max-40 preserved underneath; hidden input keeps name transport. 14 helper unit tests pass on the real extracted code.


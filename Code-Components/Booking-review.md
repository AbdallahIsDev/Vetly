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

### BE-055 — Multi Select field type (multi-pick combobox with chips)

- **Status:** Done (2026-09-09)
- **Description:** The engine needs a new `multiselect` field type: a custom combobox like the existing single `select` (rule 134 mechanics: trigger + portaled listbox), but multi-pick. Closed box shows selected options as removable chips (`Option1 x`); open menu shows all options with checkmarks on picked ones, hover wash, and full keyboard support. Fully customizable through the shared Field Styles vocabulary (rule 131/154) like every other field. Also resolves the Cal.com multiselect gap: auto-injected required multi-pick fields map to this type instead of single `select`.
- **Current Behavior:** No multi-pick field exists. `calTypeToFieldType` maps Cal.com `multiselect` to single `select`, so at most one value is collected and submitted where Cal.com expects a list.
- **Expected Behavior:** Author picks `Multi Select` type, authors Options/Option Values like other choice types, styles via Field Styles; visitor picks zero-to-many, chips render with x-remove, required means >=1 picked; stored value is a string array; Cal.com payload sends the array under the slug; single-select behavior untouched.
- **Acceptance Criteria:**
  - [ ] New `multiselect` FieldType end-to-end: controls, normalize, validation (required = >=1), render (trigger + chips + portaled menu + checks), keyboard (arrows/Home/End/Enter/Escape, focus stays on trigger), payload array under slug.
  - [ ] Unset renders with zero chips and no pre-highlight (no first-option seed for this type).
  - [ ] `calTypeToFieldType` maps truly multi-valued Cal kinds to `multiselect` (implementer confirms which: `multiselect`/`checkboxgroup`/`selectgroup`).
  - [ ] Hydration parity: first render deterministic (closed, nothing portaled), same as rule 134.
  - [ ] No regression to single select, segmented, pills, cards, radio.
- **Constraints / Must Not Do:** Do not reuse the native multi-select popup (unstylable, same reason as rule 134); do not store comma-joined strings (array only, Cal expects a list); do not pre-seed a first pick; do not add a second styling system (shared Field Styles + Selected Styles subgroup); respect rules 64/103 (single announcement, native keyboard semantics where applicable).
- **Related AGENTS.md Rule(s):** Rules 76 (auto-inject mapping), 97/133 (choice defaults — multiselect explicitly excluded from seeding), 103 (one announcer), 131/154 (shared styles only), 134 (combobox mechanics precedent).
- **Additional Context:** Author mockups: dark trigger box; open menu lists Option1–4; picked rows show check + Option1 chip with x; multi-pick shows Option1 + Option3 chips. Requested with screenshots, 2026-09-09 session.
- **Implementation record (2026-09-09, Option A array model):** `MultiSelectFieldControl` mirrors the single-select combobox (trigger + portaled listbox, aria-activedescendant, focus never leaves trigger) with toggle-in-place rows (check glyph + Selected Styles), removable chips, placeholder when empty, per-value hidden inputs, and NO seed effect. `BookingValues`/`isFieldValue`/handlers widened to `string[]`; `isEmptyPayloadValue` + `validateField` treat `[]` as empty (required = >=1); payload sends the raw array under the slug; notes/success join with ", ". `calTypeToFieldType`: `multiselect` → `multiselect`; `selectgroup` stays `select` (single-valued in Cal.com). Default Selected row hidden for this type. New AGENTS.md rule 182.

---

### BE-056 — Checkbox Group field type (new type, not a checkbox toggle)

- **Status:** Done (2026-09-09)
- **Description:** New `checkboxgroup` field type: a labeled set of independent checkboxes, zero-to-many checkable, styled by shared Field Styles. Deliberately NOT a yes/no toggle on the existing single `checkbox` (author-direction, 2026-09-09): the single checkbox stores boolean, the group stores a string array — overloading one type corrupts existing canvases when the toggle flips. Cal.com `checkboxgroup` auto-maps to this type.
- **Current Behavior:** No group exists. `calTypeToFieldType` maps Cal.com `checkboxgroup` to single `select` — same broken class as the multiselect gap (one value where Cal expects a list).
- **Expected Behavior:** Author authors Options/Option Values; visitor checks any subset; required means >=1 checked; stored value is a string array; payload sends the array under the slug; single `checkbox` untouched (boolean forever).
- **Acceptance Criteria:**
  - [ ] New `checkboxgroup` FieldType end-to-end: controls, normalize, validation (required = >=1), render (native checkbox inputs, keyboard native), payload array under slug.
  - [ ] Unset renders with nothing checked and no pre-check (excluded from seeding like multiselect).
  - [ ] `calTypeToFieldType` maps `checkboxgroup` (and `selectgroup` if multi-valued — implementer confirms) to `checkboxgroup`.
  - [ ] No regression to single checkbox, select, or choice types.
- **Constraints / Must Not Do:** Do not add a multi-toggle to single checkbox; do not store comma-joined strings; do not pre-check anything; shared Field Styles only; respect rules 64/103.
- **Related AGENTS.md Rule(s):** Rules 76, 97/133 (seeding exclusion extended to checkboxgroup), 131/154.
- **Additional Context:** Author decision 2026-09-09: new type over toggle, same rationale as BE-055. Shares the values-array model decision with BE-055 — implement together.
- **Implementation record (2026-09-09):** `checkboxgroup` renders a native `fieldset` + one real checkbox input per option (native keyboard, no JS focus management). Toggle appends/removes the option value in the string array; required = >=1 (shared `isEmptyPayloadValue`/`validateField` array handling, no seed anywhere). Check Size row extended to the group; styles resolve through the checkbox-flavored carriers + shared Field Styles. `calTypeToFieldType`: `checkboxgroup` → `checkboxgroup`; `selectgroup` stays `select` (single-valued). Single `checkbox` untouched. New AGENTS.md rule 183.

---

### BE-057 — Number field type

- **Status:** Done (2026-09-09)
- **Description:** New `number` field type: text-like input with numeric keyboard (`inputMode="decimal"`), digits/decimal-separator validation (no min-length-3 text rule). Needed for age/weight/quantity on any vertical (vet clinic included). Cal.com `number` auto-maps here instead of `text`.
- **Current Behavior:** No number type. Cal.com `number` maps to `text`, so a required single-digit answer fails min-length-3 — live bug.
- **Expected Behavior:** Author picks Number; visitor gets numeric keyboard; validation accepts digits with optional decimal (locale-agnostic `.`/`,`? — implementer decides, document); required + numeric-format; payload sends the string under the slug.
- **Acceptance Criteria:**
  - [ ] New `number` FieldType end-to-end: controls, normalize, validation (required + numeric format, no min-3), render (inputMode decimal), payload under slug/calFieldId.
  - [ ] `calTypeToFieldType` maps `number` to `number`.
  - [ ] Single-digit required numbers pass; non-numeric input fails with a field error.
- **Constraints / Must Not Do:** Do not reuse text min-length rules; do not strip characters silently beyond the phone-field precedent (validate-and-error, don't mangle); shared Field Styles only.
- **Related AGENTS.md Rule(s):** Rules 76, 81 (submit-driven), 100 (fixed per-type caps — number caps join the table), 131/154.
- **Additional Context:** Requested 2026-09-09 alongside URL/checkbox-group as mandatory coverage for a global component.
- **Implementation record (2026-09-09):** `number` FieldType end-to-end (type dropdown, `inputMode="decimal"`, `isValidNumberInput` digits/optional-decimal/sign, no min-3, 250 max cap, `numberError` Copy row). `calTypeToFieldType`: `number` → `number`. Decision: schemeless digits accepted as format-valid; payload sends the string verbatim (no normalization).

---

### BE-058 — URL field type

- **Status:** Done (2026-09-09)
- **Description:** New `url` field type: text-like input with URL keyboard (`inputMode="url"`), format validation (http(s) scheme, host present), shared Field Styles. For website/social/portfolio links on any vertical. Cal.com `url` auto-maps here instead of `text`.
- **Current Behavior:** No URL type. Cal.com `url` maps to `text` with no format check — malformed URLs reach Cal.com and risk server-side rejection.
- **Expected Behavior:** Author picks URL; visitor gets URL keyboard; validation requires valid http(s) URL (scheme optional in input? — implementer decides: accept `example.com`, normalize or reject, document); payload sends under slug.
- **Acceptance Criteria:**
  - [ ] New `url` FieldType end-to-end: controls, normalize, validation (required + URL format), render (inputMode url), payload under slug.
  - [ ] `calTypeToFieldType` maps `url` to `url`.
  - [ ] Malformed input fails with a field error; valid URLs pass with or without typed scheme per documented decision.
- **Constraints / Must Not Do:** Do not auto-normalize user input silently (validate-and-error); shared Field Styles only; respect rule 81.
- **Related AGENTS.md Rule(s):** Rules 76, 81, 100, 131/154.
- **Additional Context:** Requested 2026-09-09 as mandatory global-component coverage.
- **Implementation record (2026-09-09):** `url` FieldType end-to-end (`type="url"`, `inputMode="url"`, `isValidUrlInput`: http(s) only, host must contain a dot, schemeless input accepted as `https://` for validation but stored verbatim — no silent normalization, `urlError` Copy row). `calTypeToFieldType`: `url` → `url`.

---

### BE-059 — Address stays text mapping; Google Places autocomplete deferred

- **Status:** Done (2026-09-09)
- **Description:** Cal.com `address` currently maps to `text` and bookings succeed (Cal accepts the string) — keep that. A Google-Places-autocomplete address field (suggestions dropdown, "Powered by Google") is deferred, not refused: it needs the author's own Places API key (billing), mandatory Google attribution, keystroke-to-Google privacy implications, and no-key/offline behavior. That is a standalone integration project, not a field-type addition.
- **Current Behavior:** Address works as plain text end-to-end; no suggestions.
- **Expected Behavior (this entry):** Confirm and lock the text mapping; record Places as a future integration with its prerequisites. No component change required unless verification finds the text mapping broken.
- **Acceptance Criteria:**
  - [ ] Verify a required Cal.com address field books successfully through the text-mapped auto field.
  - [ ] If broken, fix the mapping (still text — no Places in this entry).
  - [ ] Places prerequisites recorded here for the future entry (key mgmt, attribution, privacy, fallback).
- **Constraints / Must Not Do:** Do not start Places work in this entry; do not add key controls; do not send keystrokes anywhere without an author-provided key.
- **Related AGENTS.md Rule(s):** Rule 76.
- **Additional Context:** Author mockup 2026-09-09 shows Cal.com-style dark suggestions dropdown. Author agrees: nice-to-have, deferred.
- **Verification record (2026-09-09):** `address` falls to the `text` default in `calTypeToFieldType`; the auto factory builds a required text field with the `minLength: 1` override and the slug-mapped payload — the full required-address path is code-verified (live Cal.com acceptance is author-side). Places prerequisites stand as listed. No component change.

---

### BE-060 — Per-step Header toggle (show/hide title + subtitle)

- **Status:** Done (2026-09-09)
- **Description:** Authors wanting a clean fields-first step had to erase title/subtitle (losing the copy), got nagged by a canvas "add a title" warning, and saw a "Step N" fallback rendered in its place. A per-step `Header` boolean (Show/Hide, default Show, second row after Visible) hides the whole header block; Title/Subtitle rows hide with it, the canvas warning skips headerless steps, and nothing renders.
- **Current Behavior:** (pre-fix) empty title fell back to "Step N" in preview + canvas warning; erasing was the only hide path and restoring meant retyping.
- **Expected Behavior:** Header Hide → no h2, no subtitle, no warning, no fallback, stored copy preserved; toggle back restores instantly. Header Show + empty title keeps today's fallback + warning (legitimate mid-edit signal).
- **Acceptance Criteria:**
  - [x] Header row second after Visible, Show default, stored values untouched.
  - [x] Hide removes Title/Subtitle rows from the panel and the header from render; copy preserved.
  - [x] Canvas title warning fires only for header-shown steps.
  - [x] Step-change focus/announce contracts intact (focus no-ops silently without a heading; sr region still announces).
- **Constraints / Must Not Do:** Do not remove the fallback/warning for header-shown steps; do not touch notes/analytics titles; do not apply to the system Calendar panel (own Title/Subtitle rows).
- **Related AGENTS.md Rule(s):** Rules 103/124 (announce/focus) — new rule 186 records the toggle.
- **Additional Context:** Requested 2026-09-09 (Arabic + English). System Calendar excluded deliberately — its Title/Subtitle live in the Calendar item, not a step submenu.
- **Implementation record (2026-09-09):** `StepConfig.showHeader?` (default true via `!== false` in normalize, backward compatible); `makeStepControl` Header row with Show/Hide titles + `hidden` gates on Title/Subtitle; `StepSlotControlProps` widened for the gates; render wraps h2+subtitle in a fragment conditional; warning loop early-returns on hidden headers. Focus effect untouched (null ref no-ops).

---

### BE-065 — Stale Primary-Name flag survives a field type change (false duplicate warning + dropped payload)

- **Status:** Done (2026-09-09)
- **Description:** Author flags a text field as Primary Name, then flips its type to cards: Framer keeps the stored flag (the row hides for non-text, so it can never be unset). The engine treated it as live — canvas false-warned `Multiple fields are marked "Primary Name" ("Full Name", "options cards")`, forced-required the wrong field, hid the cards field's Required row, used it as attendee-name source, and skipped its value from the payload.
- **Current Behavior:** (pre-fix) any stored `isPrimaryName: true` counted regardless of type.
- **Expected Behavior:** Flags count on text fields only; stale flags are inert everywhere (forcing, warnings, payload, autocomplete, coverage) but preserved in storage so flipping back to text revives the original intent.
- **Acceptance Criteria:**
  - [x] Single `isNameFlagged` choke point (text-only) at every read: forcing, fallback, duplicates, findName, notes name, autocomplete token, payload skips, coverage, warnings.
  - [x] Required-row gate text-scoped (stale-flagged non-text shows its toggle again).
  - [x] Stored stale value never stripped (flip-back safe).
- **Constraints / Must Not Do:** Do not strip stored flags in normalize; do not change first-wins among text flags.
- **Related AGENTS.md Rule(s):** Rules 167/173/179 — text-only scope recorded.
- **Additional Context:** Reported 2026-09-09 with canvas screenshot; user root-caused it correctly before reporting.
- **Implementation record (2026-09-09):** `isNameFlagged` helper + 10 read sites (forcing ×3, findName, notes, autocomplete, payload ×2, coverage, warnings, Required gate); fingerprint `pn` deliberately still reads the raw flag (rekey-on-restructure is the safe direction).

---

### BE-064 — Auto-inject every uncovered Cal.com field, not just required (option A)

- **Status:** Done (2026-09-09)
- **Description:** Cal.com is the single source of truth: any visible Cal.com field with no engine match auto-appears in the Additional Details step — required AND optional. Dashboard-disabled fields never inject (verified: the dashboard toggle IS the `hidden` flag — toggled-off rows show the "Hidden" badge and the official component doesn't render them either).
- **Current Behavior:** (pre-fix) only uncovered *required* fields injected; uncovered optional fields silently never collected (data loss vs the official component).
- **Expected Behavior:** Uncovered visible Cal field → auto step row with Cal's own required state honored; covered (label/calFieldId/name/email) → untouched; hidden → never injected.
- **Acceptance Criteria:**
  - [x] Filter is `!hidden && !covered` (required requirement dropped); factory keeps `required: f.required`.
  - [x] Canvas warning lists auto-added fields marked (optional) where applicable.
  - [x] Zero remaining `missingRequiredCalFields` references; biome green.
- **Constraints / Must Not Do:** Do not inject hidden fields; do not force required-ness onto optional Cal fields; author-covered fields never duplicated.
- **Related AGENTS.md Rule(s):** Rule 76 amended (required-only → all uncovered).
- **Additional Context:** Author direction 2026-09-09 (Arabic): edit in one place (Cal.com), component follows. Verified via dashboard-badge semantics + API docs (`field`/`variant`/slug shape); no plugin needed — runtime union, not canvas writeback (impossible in code components by platform design).
- **Implementation record (2026-09-09):** `missingRequiredCalFields` → `missingCalFields` (filter + all 3 use sites + deps); factory `required: f.required`; warning rewritten.

---

### BE-061 — Split full name (first + last) vs single name field

- **Status:** Open
- **Description:** Cal.com name question has a "Split Full Name into First Name and Last Name" switch. When on, Cal expects first and last names separately; the engine only collects one full-name string. A booking can arrive with the name in a shape Cal does not expect.
- **Current Behavior:** Single Primary Name text field always; `CalBookingField` normalizer does not capture the name `variant`, so the engine cannot even tell split mode is on.
- **Expected Behavior:** Engine detects the split variant from event metadata and handles it — either renders two inputs (First/Last) when split is on, or splits the single string on submit (first token + remainder). Implementer picks after reading the actual `variant` values from the API.
- **Acceptance Criteria:**
  - [ ] `variant` (or equivalent) captured in `CalBookingField` normalize.
  - [ ] Split-on mode produces first+last in the shape Cal validates (verified against a real split-mode event or documented API shape).
  - [ ] Single-name events byte-identical to today.
- **Constraints / Must Not Do:** Do not guess the variant vocabulary — read it from a live event response first; do not break the first-wins identity rules (167/173); do not add author-facing name-format controls.
- **Related AGENTS.md Rule(s):** Rules 38 (metadata never blocks), 76 (auto-inject), 167/173 (identity).
- **Additional Context:** Reported 2026-09-09 with Cal.com dashboard screenshots. The name edit popup only allows label/placeholder edits plus the split switch; name stays always-required.

---

### BE-062 — Cal.com-disabled email must un-force the engine's required email

- **Status:** Open
- **Description:** The engine forces the first email-typed field to required (rules 167/173). But Cal.com email can be toggled off (Hidden) per event. Then the engine demands an email Cal.com does not ask for — forced input with nowhere meaningful to go, and a flow that can feel broken to the visitor.
- **Current Behavior:** Email always forced required regardless of Cal email state. `missingRequiredCalFields` already skips `hidden` Cal fields, but identity forcing does not consult Cal state.
- **Expected Behavior:** When event metadata shows the Cal email question hidden/disabled, the engine's email field becomes optional (NOT hidden — the author configured it visibly; never yank visible fields). Booking POST keeps sending attendee email when provided. When Cal email is on, today's forced-required stands.
- **Acceptance Criteria:**
  - [ ] Cal email hidden → engine email optional, no required error, booking succeeds with and without an entered email.
  - [ ] Cal email on → byte-identical to today (forced required + warnings).
  - [ ] Metadata failure/offline → today's behavior (force required; fail closed, never block).
- **Constraints / Must Not Do:** Do not hide the author's email field automatically; do not drop attendee email from the POST when entered; metadata failure must never change validation (rule 38 spirit).
- **Related AGENTS.md Rule(s):** Rules 38, 76, 167/173.
- **Additional Context:** Reported 2026-09-09. Name can never be disabled in Cal (always required) so only email needs this treatment; phone keeps its own toggle.

---

### BE-063 — Phone field with country picker (flag dropdown + search + auto-detect)

- **Status:** Open
- **Description:** Cal.com's phone input shows a country-flag button opening a searchable all-countries dropdown, auto-detects the visitor's country (flag + dial code pre-selected), and shows the dial code as a dynamic placeholder that follows the chosen country. Ours is a plain text box — nothing signals "phone" until you read the label, and non-local visitors must know to type `+code` themselves.
- **Current Behavior:** Plain text-like input, digits-only validation (7+ digits), author-typed placeholder.
- **Expected Behavior:** Country button (flag + dial code) opening a searchable dropdown of all countries; initial country auto-detected (browser locale first, documented fallback); picking a country updates the dial prefix + placeholder; typed national number validated as today; submitted value includes the full international number.
- **Acceptance Criteria:**
  - [ ] Flag+code button, searchable country list, keyboard operable, closes on outside/Escape.
  - [ ] Auto-detect documented (source + fallback); manual pick always wins.
  - [ ] Placeholder shows the selected country's dial code and updates on change.
  - [ ] Submitted value is the full international number; existing digits-only validation preserved underneath.
  - [ ] Hydration-safe first render (deterministic default, no flag flash).
- **Constraints / Must Not Do:** Do not call IP-geolocation services (no new network dependency for detection — locale/timezone heuristics only); do not ship raster flag assets (emoji regional indicators or inline SVG, documented choice); no second styling system (shared Field Styles); respect rules 64/103.
- **Related AGENTS.md Rule(s):** Rules 42 (hydration), 64/103 (a11y), 131/154 (styles).
- **Additional Context:** Reported 2026-09-09 with Cal.com dark-UI screenshots (Egypt +20 auto-detected, search field, per-country dial codes). Largest of the three — independent vertical slice.

---

---

### BE-066 - Remove the Default Selected control entirely (keep first-option seed)

- **Status:** Done (2026-09-09)
- **Description:** The `Default Selected` row on choice fields was panel noise: with it empty (the near-universal state) the engine seeds the first non-empty option anyway, so authors pick the default by reordering Options. Author direction: delete the row, keep the seed.
- **Current Behavior:** (pre-fix) control present with "Empty = first option" semantics.
- **Expected Behavior:** No control, no interface key, no runtime read - `getFirstNonEmptyOption` everywhere; reordering Options is the only default picker.
- **Acceptance Criteria:**
  - [x] Zero `defaultOption`/`getInitialSelection`/`Default Selected` references in code (verified by grep).
  - [x] `getFirstNonEmptyOption` is the single seed path (select display/seed, ChoiceGroupInline init/sync/fire).
  - [x] Biome green.
- **Constraints / Must Not Do:** Do not re-add the row; stored custom values intentionally stop applying (recorded freeze - reorder to feature).
- **Related AGENTS.md Rule(s):** Rules 97 (rewritten), 133 (amended).
- **Additional Context:** Requested 2026-09-09.
- **Implementation record (2026-09-09):** Deleted the control block, the `FieldConfig` key, the fingerprint `do` carrier (autosave re-keys once on update), the `ChoiceGroupInlineProps.defaultValue` prop + destructure, and all 6 call sites; `getInitialSelection(options, defaultValue)` collapsed to `getFirstNonEmptyOption(options)` with controlled-value matching preserved inline at each site (identical semantics for live values).

---

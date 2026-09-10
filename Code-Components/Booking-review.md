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

### BE-067 — One-black defaults + ghost Back hover reveal

- **Status:** Done (2026-09-09)
- **Description:** Author direction: Accent and Text both default to `#111111` (one black look, no brand hue in defaults); ghost Back defaults to white fill, transparent 1px border, muted text, with border + solid text appearing on hover; inputs stay white with visible borders.
- **Current Behavior:** (pre-fix) blue accent `#0066BB`, slate text `#111827`, ghost buttons with always-visible borders.
- **Expected Behavior:** Near-black defaults everywhere; Back reads as text until hovered (no layout shift — transparent border always present); inputs white + bordered so they read on white sites.
- **Acceptance Criteria:**
  - [x] Accent/Text defaults `#111111`; Primary Foreground stays white.
  - [x] Ghost role white/transparent/muted; Back hover fallback paints border token + primary text only while author Hover unopened.
  - [x] Selected-styles + Calendar-Links border defaults follow `#111111`.
  - [x] Reference file + explorer Version A updated to match.
- **Constraints / Must Not Do:** Do not restore visible ghost borders or blue defaults; author Hover/Pressed always wins when opened.
- **Related AGENTS.md Rule(s):** New rule 187.
- **Additional Context:** Discussed 2026-09-09 (Arabic); author approved the full proposal including transparent-border technique.
- **Implementation record (2026-09-09):** Token defaults, ghost role, Back hover fallback object, static border defaults; reference swatches + explorer A updated.

---

### BE-068 — System Cal.com slugs excluded from auto-inject (guests, rescheduleReason)

- **Status:** Done (2026-09-09)
- **Description:** After option A shipped, entering an Event ID flagged system fields (`location`, `notes`, `guests`, `rescheduleReason`) — all optional. Two of them must never inject: `rescheduleReason` belongs to the reschedule flow (a fresh booking has nothing to reschedule), and `guests` (Multiple Emails) has no engine counterpart by single-attendee design. `location`/`notes` stay injected (legitimate booker questions).
- **Current Behavior:** (pre-fix) all four surfaced in the canvas warning and injected for visitors.
- **Expected Behavior:** `SYSTEM_EXCLUDED_CAL_SLUGS` (`reschedulereason`, `guests`) never auto-injects; author-covered fields with those slugs still flow normally; warning lists only what will actually inject.
- **Acceptance Criteria:**
  - [x] Exclusion by slug (lowercased) before the coverage check; manual coverage path untouched.
  - [x] Biome green.
- **Constraints / Must Not Do:** Do not exclude `location`/`notes`; do not block manual coverage of the excluded slugs.
- **Related AGENTS.md Rule(s):** Rule 76 amended.
- **Additional Context:** Reported 2026-09-09 with dashboard + warning screenshots. Author confirmed guests has negligible value; dashboard toggle-off already maps to `hidden`.
- **Implementation record (2026-09-09):** Module-level `SYSTEM_EXCLUDED_CAL_SLUGS` + filter clause.

---

### BE-069 — Remove the skip link entirely (no flow shortcuts)

- **Status:** Done (2026-09-09)
- **Description:** The "Skip to end of booking" link revealed ugly on Tab focus (overlapping content), glitched layout on activation, and contradicted the product (a booking is a mandatory sequence — nothing may be skipped). Author direction: remove the entire mechanism, record the ban.
- **Current Behavior:** (pre-fix) skip anchor + target + CSS present.
- **Expected Behavior:** No skip anchor, target, or CSS anywhere; Tab order flows through the steps natively.
- **Acceptance Criteria:**
  - [x] Zero `be-skip` references (verified by grep); biome green.
- **Constraints / Must Not Do:** Do not re-add any skip/shortcut mechanism, including remapped Tab/Shift-Tab section jumps.
- **Related AGENTS.md Rule(s):** New rule 188.
- **Additional Context:** Reported 2026-09-09 with screenshots (focus-reveal overlap + post-activation glitch).
- **Implementation record (2026-09-09):** Deleted anchor, target div, and both CSS rules.

---

### BE-070 — Selected Styles audit: alleged cross-leak + inert rows (VERDICT, no runtime change)

- **Status:** Done (2026-09-09)
- **Description:** Author reported (a) Selected border edits leaking onto the field border, and (b) Selected radius/font/padding/shadow doing nothing, proposing to delete the inert rows.
- **Current Behavior:** (verified, unchanged) no selected-to-field write path exists anywhere: every border/color read is nullish-safe (`??`, never `||`), merges never mutate, `normalizeStyleOverrides` copies before cleaning. The subgroup cannot affect the field border by construction.
- **Expected Behavior:** No code change. (a) needs the 30-second red test to identify the true mechanism — prime suspects, all selected-scoped by design: unselected-option hover border follows the selected color/fill, radio dot ring follows selected text, inset selected ring follows selected border color. (b) is architecture, not breakage: cards/pills/radio/listbox consume their documented vocabulary; segmented geometry (radius/font/padding/shadow/border-width) is hardcoded per rules 80/101, so those four rows are inert on segmented only — the shared factory cannot hide rows per type, and deleting them globally would gut cards/pills/radio.
- **Acceptance Criteria:**
  - [x] Full read audit: resolvers, merges, normalize, all consumers (segmented site feeds selected bg/text/border-color into thumb + active text — rule 158 intent holds).
  - [x] Rule 158 clarified to enumerate per-type consumption + inert-by-design rows.
  - [x] Red-test protocol delivered to author for (a).
- **Constraints / Must Not Do:** Do not delete subgroup rows (live on other types); do not wire selected geometry into the segmented thumb (rules 80/101); do not "fix" (a) without the red test identifying a real path.
- **Related AGENTS.md Rule(s):** Rules 80/101, 130, 142, 146, 158 (clarified).
- **Additional Context:** Reported 2026-09-09 (Arabic). Segmented field was the test surface for (b).
- **Implementation record (2026-09-09):** Rule-158 clarification only; zero runtime edits.

---

### BE-071 - Calendar surface Radius mirrors the global 0-24 contract

- **Status:** Done (2026-09-10)
- **Description:** The Calendar Styles Radius row (a `BorderRadius` control with no bounds) now matches the global Styles Radius: Number control, min 0, max 24, step 1, px stepper, default 12 - plus the same runtime clamp. Legacy string values keep resolving.
- **Acceptance Criteria:**
  - [x] Control + runtime dual enforcement; biome green.
- **Related AGENTS.md Rule(s):** Rule 60 (extended to the calendar surface).
- **Implementation record (2026-09-10):** Row swapped to Number; `surfaceRadius` clamps parsed values (`%` passes through).

---

### BE-072 - Smooth form-height animation across steps

- **Status:** Done (2026-09-10)
- **Description:** Step changes jumped instantly between heights (e.g. 200px two-field step vs 500px five-field step). The form now animates its explicit height toward the measured active-step height with the step transition timing, both directions.
- **Acceptance Criteria:**
  - [x] Grow + shrink animate smoothly; floor, reduced-motion, hydration parity preserved; biome green.
- **Related AGENTS.md Rule(s):** New rule 189.
- **Implementation record (2026-09-10):** `motion.form` + `formRef` measurement (layout effect + ResizeObserver on the active node) + `FORM_CONTENT_MIN_HEIGHT` floor shared with the style.

---
### BE-073 - Selected geometry applies to the segmented thumb (rule was wrong)

- **Status:** Done (2026-09-10)
- **Description:** Author order: the "geometry stays hardcoded" rule was wrong - Selected Styles radius/font/padding/shadow/border must visibly work on segmented like every other choice type. Verified the selected colors already flowed (thumb bg/text/border); only geometry was pinned.
- **Expected Behavior:** Selected radius/padding/font/shadow/border-width reshape the thumb + active option; unset keys inherit exactly as before; 12h/24h toggle byte-identical (passes nothing).
- **Acceptance Criteria:**
  - [x] Thumb inset derives from selected padding (width math tracks it, alignment never drifts).
  - [x] No TDZ/hook hazards (biome `noInvalidUseBeforeDeclaration` caught one during implementation - fixed by ordering).
  - [x] Biome green.
- **Constraints / Must Not Do:** Do not touch track geometry (outer padding, position math, slide animation - rule 80); do not change the toggle.
- **Related AGENTS.md Rule(s):** Rule 158 corrected (was "inert by design", now full vocabulary on thumb + active option).
- **Additional Context:** Author override 2026-09-10 (rule 140): "the rule is wrong, fix the comp".
- **Implementation record (2026-09-10):** `SegmentedControl` gains 7 optional selected props; thumb radius/inset/width/border/shadow + active font/padding derive with inherit-fallbacks; ChoiceGroupInline segmented site threads its selected props through.

---
### BE-074 - Canvas keeps natural height (no explicit pixels on canvas)

- **Status:** Done (2026-09-10)
- **Description:** Live preview fit content correctly, but the Framer canvas clipped new fields under a stale fixed frame. The explicit animated height fought the canvas frame sizing.
- **Expected Behavior:** On canvas the form stays natural `auto` height (Framer measures content per render); published site keeps animating.
- **Acceptance Criteria:**
  - [x] `isCanvas` bypass in the measure effect (null height, observer skipped); biome green.
- **Related AGENTS.md Rule(s):** Rule 189 extended (canvas clause).
- **Additional Context:** Reported 2026-09-10 with canvas screenshot (fields cut under fixed frame). If clipping persists after this, the instance frame itself is set to Fixed height in canvas layout settings (author-side, not code).
- **Implementation record (2026-09-10):** Early return on `isCanvas` + dep added.

---

### BE-075 — Author-controllable vertical rhythm (progress / header / fields / nav spacing)

- **Status:** Done (2026-09-10)
- **Description:** Author can now control the three zone gaps from Styles: Progress Gap (progress block to form), Heading Gap (header to fields), Footer Gap (fields to nav) — each 0–64px. Defaults reproduce the shipped look exactly: 16 / 16 / 36.
- **Current Behavior:** (pre-fix) Vertical rhythm was fixed in code: the progress wrapper carried a fixed `marginBottom: 16`, the step title (`h2`) used `marginBottom: 4`, the subtitle block used `marginBottom: 16`, the footer nav row used `marginTop: 24` plus `paddingTop: 12`, and only the field-to-field grid had an author control (the shared Gap token).
- **Expected Behavior:** A Framer author can enlarge or shrink the flow's vertical spacing from the panel; shipped defaults reproduce the current look exactly on untouched canvases.
- **Acceptance Criteria:**
  - [x] Progress-to-form, header-to-fields, and fields-to-nav distances are all author-adjustable from the panel and visibly change the rendered spacing at both extremes.
  - [x] Untouched canvases render byte-identically where a subtitle exists (defaults 16/16/36; footer 36 = old 24+12 sum); title-only steps re-baseline trailing 4→16 (recorded on BE-077 — shipped defaults all carry subtitles).
  - [x] Spacing stays correct with headers hidden (BE-060 toggle), with the Calendar stage, with validation errors expanding content, and with the 320px minimum-height floor.
  - [x] No hydration mismatch (pure prop-derived memo) and no step-height animation regression.
- **Constraints / Must Not Do:** Rule 123's footer-rhythm clause amended openly per Rule 140 (explicit `fix it now` author order — zone rhythm is now a meaningful design decision; raw inter-button `gap 8` and sticky stay internal). Shared Gap token untouched (Rule 82); field/error pairs keep flex `gap` (Rule 6).
- **Related AGENTS.md Rule(s):** Rules 6, 18, 82, 123 (amended), 129, 189; new rule 190.
- **Additional Context:** Reported 2026-09-10, in Arabic/mixed Arabic-English, no screenshots.
- **Implementation record (2026-09-10):** `SECTION_SPACING_DEFAULTS` + `clampSectionSpacing` + `sectionSpacing` memo; three Styles Number controls (0–64px steppers); header grouped into flex-column wrapper (BE-077); footer single-owner margin (BE-078). Keys excluded from the config fingerprint.

---

### BE-076 — Step DOM: header stays inside the form (3 zones verdict)

- **Status:** Done (2026-09-10)
- **Description:** Verdict: keep the 3-zone DOM (progress / form-with-per-step-header / nav). No fourth standalone header zone. Each step owns a different title/subtitle (or hides it via BE-060), and the header rides the step's visibility transition, focus/announce lifecycle, `inert` sync, and form-height measurement — a standalone zone would duplicate all of that with zero visual gain and would split submit/validation ownership away from the form.
- **Current Behavior:** Per-step header (`h2.be-focus-target` + subtitle block) renders inside each `StepVisibilityWrapper` inside the single `motion.form`, followed by `StepBody`; progress renders above the form and the footer nav below it.
- **Expected Behavior:** Structure unchanged; per-step titles render correctly on every step including the system Calendar and auto-injected Additional Details step.
- **Acceptance Criteria:**
  - [x] Every step shows its own correct title/subtitle (or nothing when its header is hidden) — unchanged render path.
  - [x] Focus/announcement, deterministic visibility, `inert` sync, restore-before-paint, hydration parity, and form-height measurement untouched.
  - [x] No visual regression on untouched canvases.
- **Constraints / Must Not Do:** Rules 14/17/21/23, 103/124, 139, 186, 189 preserved — no DOM split made.
- **Related AGENTS.md Rule(s):** Rules 14, 17, 21, 23, 103, 124, 139, 186, 189; verdict recorded in new rule 190.
- **Additional Context:** Author question from 2026-09-10 (Arabic); asked for the agent's opinion on 3 vs 4 elements. Verdict: keep 3.

---

### BE-077 — Step header grouped with flex gap (no more sibling margins)

- **Status:** Done (2026-09-10)
- **Description:** Title and subtitle now render inside one header `div` (flex column, `gap: 4` internal, `marginBottom: <Heading Gap>` trailing). The `h2` and subtitle sibling margins are gone (both `marginBottom: 0`).
- **Current Behavior:** (pre-fix) The step `h2` carried `marginBottom: 4` and the subtitle `div` carried `marginBottom: 16`; there was no header wrapper element.
- **Expected Behavior:** Header spacing follows the same gap-based rhythm as field/error pairs (Rule 6); untouched canvases look the same.
- **Acceptance Criteria:**
  - [x] Title/subtitle grouped in one header element; sibling margins replaced by the group gap mechanism.
  - [x] Subtitle-present steps render byte-identically (4px title gap + Heading Gap 16 default = old 4 + 16); title-only steps re-baseline trailing 4→16 (intentional — one owner per zone beats per-case margins).
  - [x] Per-step Header toggle, per-step/global alignment, and focus ref/announcer behavior unchanged.
- **Constraints / Must Not Do:** No required markers (Rule 4); alignment scope unchanged (Rules 125/172); terminal headers untouched (Rule 174); focus-target class and announce behavior unchanged (Rules 103/124).
- **Related AGENTS.md Rule(s):** Rules 6, 103, 124, 125, 172, 174, 186; wrapper covered by new rule 190.
- **Additional Context:** Reported 2026-09-10 (Arabic).

---

### BE-078 — Footer nav has one spacing owner (marginTop, no more paddingTop stack)

- **Status:** Done (2026-09-10)
- **Description:** Fields-to-nav distance now comes from one owner — `marginTop: <Footer Gap>` (default 36, exactly the old 24+12 sum). The redundant `paddingTop: 12` is deleted. Sticky positioning and the safe-area bottom padding stay, with rationale in the code comment (row pins to the viewport bottom and clears the iOS home indicator; neither affects the fields-to-nav distance).
- **Current Behavior:** (pre-fix) The footer nav `div` set `marginTop: 24` plus `paddingTop: 12` together, so the distance was their stacked sum (36px).
- **Expected Behavior:** One intentional spacing mechanism; same default distance on untouched canvases.
- **Acceptance Criteria:**
  - [x] One documented owner; no margin-plus-padding stacking.
  - [x] Safe-area/sticky purpose recorded (kept with rationale).
  - [x] No visual jump on untouched canvases (36 = 36); narrow/stacked layouts and the 320px floor unaffected.
- **Constraints / Must Not Do:** Panel control lives in BE-075 (Footer Gap); Buttons Layout Order/Align/Width untouched (Rules 123/126/136).
- **Related AGENTS.md Rule(s):** Rules 18, 123 (amended via BE-075), 126, 129, 136; mechanism covered by new rule 190.
- **Additional Context:** Reported 2026-09-10 (Arabic). Author observation confirmed — margin and padding were indeed stacking.
- **Implementation record (2026-09-10):** Footer `marginTop` reads `sectionSpacing.footer`; `paddingTop: 12` removed; `gap: 8`, sticky, safe-area kept verbatim; purpose comment added inline.

---

### BE-079 — Remove the Calendar Summary suffix from export titles (duplicate-word risk)

- **Status:** Done (2026-09-11)
- **Description:** The `Calendar Summary` Copy control (`icsSummaryLabel`, default "Appointment") is appended after the Cal.com event title to build every calendar export title. Many real Cal.com event types are already named ending in "Appointment" (or "Meeting", etc.), so the suffix duplicates the word. The author judged the control a standing source of unexpected duplicated words across users and ordered it removed completely rather than guarded.
- **Current Behavior:** `calendarExportTitle` (`BookingEngine.tsx` ~12941) = `"<event title> <summary>"`, blank label degrading to the fixed fallback "Booking". A Cal.com event titled "Dental Appointment" exports as "Dental Appointment Appointment" on the ICS download, Google Calendar link, Microsoft Office link, and Microsoft Outlook link.
- **Expected Behavior:** Export title is the Cal.com event title verbatim on every export surface — no suffix is ever appended. The `Calendar Summary` control, the `icsSummaryLabel` interface key, and all reads are deleted (stored custom values intentionally freeze/stop applying, recorded per migration discipline). When event metadata has no title (rule 38 failure path), a fixed internal fallback constant (the existing `DEFAULT_COPY_ICS_SUMMARY_FALLBACK` "Booking" is acceptable) remains the ICS SUMMARY so the .ics stays valid — no control re-exposed.
- **Acceptance Criteria:**
  - [x] No export surface (ICS, Google, Office, Outlook) appends anything to the event title; a "Dental Appointment" event exports as exactly "Dental Appointment".
  - [x] `Calendar Summary` control row, `icsSummaryLabel` key, and suffix-consumption reads are gone; a no-title metadata failure still yields a non-empty ICS SUMMARY via the internal constant.
  - [x] Metadata failure never blocks booking or delays the calendar (rule 38) and no hydration regression appears.
  - [x] Rule 163 (EXPORT-TITLE-EVENT) is rewritten in the same implementing session per rule 140 — it currently mandates the suffix and would otherwise contradict the shipped state.
- **Constraints / Must Not Do:** Do not implement a dedup heuristic (skip-append-if-identical-suffix) — the author ordered complete removal, not guarding. Do not re-expose any label/summary control. Do not break the non-blocking metadata contract (rule 38).
- **Related AGENTS.md Rule(s):** Rule 163 (superseded by this order), Rule 110 (structural copy internal), Rule 38 (metadata never blocks), Rule 132/140 (log + rewrite openly).
- **Additional Context:** Reported 2026-09-11 during the property-controls audit. Author: event titles already ending in "Appointment" would render the word twice — "completely wrong"; removal is the chosen fix.
- **Implementation record (2026-09-11):** All 8 `icsSummaryLabel` sites removed in one pass: interface key (copy type, ~4724), prop pass (`icsSummaryLabel={copy.icsSummaryLabel}`), prop type + destructure in the success screen, the `calendarExportTitle` memo (rewritten to a plain expression: `eventTitle?.trim() || DEFAULT_COPY_ICS_SUMMARY_FALLBACK` — event title verbatim, no suffix logic, dedup heuristics deliberately absent), and the `Calendar Summary` property control row. The `DEFAULT_COPY_ICS_SUMMARY_FALLBACK` "Booking" constant and `buildIcsDataUri`'s internal `summaryFallback` param stay untouched (rule 38 no-title ICS-validity path — internal, never a control). Export consumers (ICS SUMMARY, Google/Office/Outlook deep links) already read `calendarExportTitle`, so all four surfaces switch with the single expression. No new controls, no new keys, no metadata-fetch changes; static string + existing constants keep hydration parity. AGENTS.md rule 163 rewritten in the same session (suffix mandate → verbatim title, BE-079 recorded); rule 104's `icsSummaryLabel stays` clause amended. Grep-verified zero `icsSummaryLabel`/`Calendar Summary` references remain in the component.


---

### BE-080 - Freeze five Copy controls: two aria-only labels + three Notes payload prefixes

- **Status:** Done (2026-09-11)
- **Description:** Property-controls copy audit surfaced five rows that fail the rule-111 test: two are aria-only labels (never visible to visitors) and three are literal format strings baked into the Cal.com notes payload and ICS description (not visitor copy). The author ordered all five removed from Property Controls ("make them fixed") - constants stay in the component.
- **Current Behavior:** (pre-fix) `Time Format Toggle Label`, `Event Info Loading (aria)`, `Notes Time Section`, `Notes Date Prefix`, `Notes Time Prefix` were editable Copy rows; editing the Notes rows silently corrupted the notes payload format.
- **Expected Behavior:** The five controls, interface keys, and threading are deleted; runtime renders from `DEFAULT_COPY_TIMEFORMAT_LABEL`, `CAL_META_LOADING_ARIA`, and the `DEFAULT_COPY_NOTES_*` constants; `buildNotesPayload` signature becomes `(steps, values, timeZone)`.
- **Acceptance Criteria:**
  - [x] No leftover reference to the five keys anywhere in the component (grep-verified).
  - [x] Aria/payload output byte-identical to the shipped defaults (constants unchanged).
  - [x] `Event Info Unavailable` and `Step Announcement Template` remain editable (not part of the order).
  - [x] Biome: zero new diagnostics vs HEAD (10 vs 14); tsc under matched SDK stubs: identical 8 pre-existing error families before and after.
- **Constraints / Must Not Do:** Never re-add the five rows under any group (rule 191). Do not remove `calEventMetaUnavailableCopy` / `stepAnnouncementTemplate` without a new explicit order.
- **Related AGENTS.md Rule(s):** Rules 111, 178 (extended), new rule 191.
- **Additional Context:** Reported 2026-09-11 following the full property-controls audit.
- **Implementation record (2026-09-11):** 5 control rows + `copy` interface keys + prop threading (segmented control, DateAndTimeInline, SuccessScreen) removed; `buildNotesPayload` signature simplified to `(steps, values, timeZone)` reading constants directly; ICS cut marker reads `DEFAULT_COPY_NOTES_SELECTED_TIME_LABEL`.

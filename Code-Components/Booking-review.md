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

---

### BE-086 — Phone UI follows the attached reui component; dropdown interact/scroll fixed

- **Status:** Done (2026-09-11)
- **Description:** The shipped phone picker had three UI defects against the attached reui `phone-input.tsx` reference: the country trigger showed flag + dial + chevron (should be flag-only), the trigger and number box were separated by a gap (should be joined flush), and the dropdown misbehaved — its scrollbar was hidden by the shared `be-select-scroll` rule so it could not be dragged, and its outside-close root sat on the list alone so pressing the search box or menu padding closed the menu mid-interaction.
- **Current Behavior:** (pre-fix) wide trigger (flag + `+dial` + chevron), `gap: 8` between trigger and input with full radii on both, `be-select-scroll` hiding the country-list scrollbar, `menuRef` on the `<ul>` only.
- **Expected Behavior:** Flag-only trigger joined flush to the number box (no gap, shared border, split radii, focus raises trigger above input edge), dropdown rows flag + name + dial-at-far-right with no check glyph, native visible scrollbar on the country list, whole dialog as the close-root, empty-state row when search matches nothing.
- **Acceptance Criteria:**
  - [x] Trigger renders the flag only (native `title` tooltip carries the country name; aria-label unchanged).
  - [x] Trigger + input share one border with split radii and zero gap, in every Radius/field-style configuration.
  - [x] Country list scrolls with a visible native scrollbar (draggable); single/multi select menus keep their hidden-scrollbar treatment untouched.
  - [x] Pressing search, padding, rows, or scrollbar never closes the menu; outside/Escape still do.
  - [x] Stored values, detection, parse, validation, placeholder derivation unchanged (rule 196 mechanics intact).
- **Constraints / Must Not Do:** Do not import the attached file or its dependencies (react-phone-number-input, lucide, cmdk-style packages, Tailwind) — UI contract only, reimplemented in plain inline styles; do not touch the `.be-select-scroll` rule itself (select menus rely on it); no new controls.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — reui UI contract); rules 42/109 (unchanged), 134/162 (menu mechanics unchanged).
- **Additional Context:** Reported 2026-09-11 (Arabic) with the reui reference file (`Code-Components/phone-input.tsx`, not imported) and docs link. The attached file is reference-only and must never be imported by the engine.
- **Implementation record (2026-09-11):** Trigger trimmed to flag-only (`title` = country name, `px 10px`, right border/radius zeroed, focus z-index); input left radii zeroed, container gap removed; dialog root owns `menuRef`, flex-column with hidden overflow, search fixed + separator + internally-scrolling list; rows without the check glyph (accent selected surface remains the indicator); "No country found." empty state; `aria-activedescendant` guarded on non-empty results. (BE-088 supersedes the scrollbar half: author ordered the hidden treatment back — country list takes `be-select-scroll` like the select menus.)
- **Implementation record 2 (2026-09-11, BE-087):** Flags are `PhoneFlag` images (flagcdn `w40` + `w80` retina, `key={iso}`, `onError` fail-closed to a styled two-letter badge) inside a fixed 22×16 slot — emoji rendering deleted (Windows has no flag-emoji font). Trigger drops the `be-input` class so keyboard focus shows only the standard platform button outline (the inset input ring + global button outline had stacked into a double ring); raised z-index keeps it visible over the input edge. Slot geometry is fixed everywhere, so country changes cause no layout shift.

---

### BE-087 — Phone flags render as boxes, trigger width shifts, focus ring is wrong

- **Status:** Done (2026-09-11)
- **Description:** On Windows the flag column shows the bare two-letter code ("DZ") instead of a flag — Windows ships no flag-emoji font, so regional-indicator pairs degrade to letters. The letters render at input font size in a fluid-width box, so picking countries with different code widths shifts the trigger layout. Keyboard focus on the trigger also stacks two rings (the `be-input` inset ring plus the global button outline) into one odd-looking double ring.
- **Current Behavior:** (pre-fix) emoji flags via `phoneCountryFlag`; trigger carries `be-input` class; flag slot fluid width.
- **Expected Behavior:** Real flag images with an offline-safe badge fallback, fixed-size flag slot in trigger and rows, single standard button focus outline on the trigger.
- **Acceptance Criteria:**
  - [x] Flags visible on Windows/macOS, online and offline (badge fallback), with zero layout shift on country change.
  - [x] Trigger focus shows exactly the platform button outline (same as Back/Continue), no double ring.
  - [x] No emoji-flag code remains; helpers/detection/parse/validation untouched.
- **Constraints / Must Not Do:** No flag packages, no raster assets shipped, no external JS dependencies; do not reintroduce emoji flags; do not touch select-menu scrollbar treatment.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — flag/ slot/ focus contract).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a screenshot (DZ box + +213 placeholder).
- **Implementation record (2026-09-11):** New `PhoneFlag` component (flagcdn SVG image + badge fallback, fixed 22×16 slot, `key={iso}` resets error state); `phoneCountryFlag` helper deleted; trigger `be-input` class removed (keeps border styling incl. error color + focus z-index); rows use the same slot. tsc clean; biome at the pre-existing baseline.

---

### BE-088 — SVG flags, timezone-aware detection, borderless search, hidden list scrollbar

- **Status:** Done (2026-09-11)
- **Description:** Follow-up polish on the phone picker: flags should be SVG rather than PNG; auto-detect must catch visitors whose browser locale is English but whose device is elsewhere (reported: Egypt); the search row should lose its bordered box (icon + borderless input, no ring, autofocus kept); the country-list scrollbar should be hidden like the select menus after all.
- **Current Behavior:** (pre-fix) flagcdn PNG (`w40`/`w80`); detection from `navigator.language` only (en-US browser in Cairo → US); search as a bordered box with `be-input` ring; country list with a visible native scrollbar.
- **Expected Behavior:** flagcdn SVG; detection chain locale-first then timezone (`PHONE_TIMEZONE_TO_ISO`, ~140 zones); search row plain (icon + text, separator below, autofocus retained, no ring); country list under `be-select-scroll` (scroll via wheel/touch/arrows).
- **Acceptance Criteria:**
  - [x] SVG flags render (badge fallback untouched); no PNG references remain.
  - [x] en-US + Africa/Cairo → EG; explicit non-default locale still wins (fr-FR + Cairo → FR); verified by 7 unit tests on the real detection code.
  - [x] Search has no box/border/ring; icon + placeholder; typing works immediately on open.
  - [x] No visible scrollbar on the country list; select menus untouched.
- **Constraints / Must Not Do:** No IP geolocation (timezone table only); do not re-add a search border or ring; do not touch the `.be-select-scroll` rule; no new controls.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — SVG, timezone chain, search, scrollbar).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a screenshot of the bordered search box.
- **Implementation record (2026-09-11):** `PhoneFlag` src → `flagcdn.com/{iso}.svg` (srcSet dropped — vector needs none); `PHONE_TIMEZONE_TO_ISO` + chained `detectPhoneCountryIso` (locale-first, timezone second, US last); search rebuilt as icon + borderless input (no `be-input` class, autofocus effect kept); country `<ul>` takes `be-select-scroll`. tsc clean; biome at the pre-existing baseline.

---

### BE-089 — Unfold indicator next to the selected flag

- **Status:** Done (2026-09-11)
- **Description:** The flag-only trigger gives no clickable signal. Author supplied an unfold-more glyph (up/down chevrons) and ordered both chevrons filled solid — the source file's upper chevron was stroke-only.
- **Current Behavior:** (pre-fix) trigger shows the flag alone.
- **Expected Behavior:** Flag + muted 16px unfold indicator (both chevrons filled, author paths verbatim) with a 4px gap; trigger width stays fixed (no layout shift); everything else untouched.
- **Acceptance Criteria:**
  - [x] Both chevrons render filled solid (no stroke); icon muted, fixed size, aria-hidden.
  - [x] Trigger width constant across countries; accessible name/tooltip unchanged.
- **Constraints / Must Not Do:** No icon packages; do not reintroduce dial text or chevron-text; do not touch the joined-border geometry.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — indicator contract).
- **Additional Context:** Reported 2026-09-11 (Arabic) with the author-supplied SVG paths.
- **Implementation record (2026-09-11):** Inline SVG (author paths, `fill="currentColor"`, no stroke attrs) beside the flag; button muted via `theme.textSecondaryColor`, `gap: 4`, right padding 8. tsc clean; biome at the pre-existing baseline.

---

### BE-090 — Phone trigger focus ring + segmented thumb bounce controls

- **Status:** Done (2026-09-11)
- **Description:** Two reports in one: (1) tabbing to the country trigger shows a muted OUTER outline stacked over the still-visible normal border — while every other field shows an inset accent ring; (2) the segmented thumb spring overshoots visibly (thumb exits the track edge and bounces back) and the author wants it calmer plus dedicated controls for the bounce/sensitivity.
- **Current Behavior:** (pre-fix) trigger carries no `be-input` class so keyboard focus falls back to the global `:is(button,a):focus-visible` outline (muted currentColor, offset outside) while its own dark border stays inside; thumb spring hardcoded at stiffness 400 / damping 30 (damping ratio ~0.75 — visibly underdamped).
- **Expected Behavior:** Trigger focus renders the same inset accent ring as every other field (focus color, `:focus-visible`-gated so mouse clicks stay ring-free, global outline suppressed as replaced); thumb defaults to stiffness 400 / damping 38 (ratio ~0.95 — effectively no overshoot) with two Transition-submenu Number controls to tune it.
- **Acceptance Criteria:**
  - [x] Trigger Tab-focus: single inset ring in the focus color (black on the author's theme), no outer outline, no double border; mouse-click focus shows no ring (platform convention).
  - [x] Thumb no longer exits the track on normal selection changes; reduced-motion path untouched.
  - [x] Thumb Stiffness (50-1000, default 400) and Thumb Damping (5-100, default 38) controls work on both the 12h/24h toggle and segmented choice fields; out-of-range values clamp; sibling engines with different settings stay isolated.
- **Constraints / Must Not Do:** Do not restyle the number input's own focus (already correct); do not add a top-level control group for two numbers (Transition submenu hosts them); do not use module-level mutable motion state (rule 94).
- **Related AGENTS.md Rule(s):** New rule 197 (SEGMENTED-MOTION + trigger focus contract).
- **Additional Context:** Reported 2026-09-11 (Arabic) with two screenshots (muted outer trigger ring; thumb overshoot).
- **Implementation record (2026-09-11):** Trigger: `outline: none` + `:focus-visible`-gated inset `box-shadow` in `fs.focusBorderColor ?? accent` (the exact `.be-input` expression). Thumb: `SegmentedMotionContext` (tree-scoped, memoized value) consumed by the shared `SegmentedControl`; resolution + clamping in `useBookingEngineState`, threaded via its return; provider wraps the main `RootShell` children; defaults 400/38. tsc clean; biome at the pre-existing baseline.

---

### BE-091 — Textarea has no Width control; always full width

- **Status:** Done (2026-09-11)
- **Description:** The per-field Width row (Fill/Half) shows for textarea fields. A half-width textarea renders a tall box beside a short field and breaks the row, so authors must never be able to pick Half for it.
- **Current Behavior:** (pre-fix) Width visible for every field type except `calendar-widget`; a stored `half` textarea renders `span 1`.
- **Expected Behavior:** The Width row hides for `textarea` (same `hidden()` as `calendar-widget`); the render forces `span 2` for textarea even when a stored `half` survives, so old canvases heal instead of breaking.
- **Acceptance Criteria:**
  - [x] Width row absent on textarea fields; present everywhere else as before.
  - [x] Stored-half textarea renders full width; all other width/grid behavior byte-identical.
- **Constraints / Must Not Do:** Do not coerce or strip the stored value (inert carrier); do not touch the half-grid derivation itself.
- **Related AGENTS.md Rule(s):** Rule 192a (amended — textarea-always-full).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a screenshot (Phone half + tall textarea).
- **Implementation record (2026-09-11):** `hidden()` covers `textarea`; `containerStyle.gridColumn` forces `span 2` for textarea (logic provably identical for all other types). Biome at the pre-existing baseline.


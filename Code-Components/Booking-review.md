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

### BE-119 — Select/multiselect height gap returns on Field Styles activation (re-test after BE-117 sync)

- **Status:** Open
- **Description:** With default styles the select/multiselect height matches text inputs, but merely activating (opening) the shared Field Styles submenu — changing nothing — brings the height gap back.
- **Current Behavior:** Gap is absent on defaults and appears right after Field Styles activation, with no value edited.
- **Expected Behavior:** Activating Field Styles without editing values renders byte-identically (effective-default initialization); select/multiselect closed boxes match text-input height in every font state.
- **Acceptance Criteria:**
  - [ ] Fresh text + select + multiselect fields match heights before AND after Field Styles activation (no edits).
  - [ ] Re-test only after the canvas runs code at or after BE-117; attach a new screenshot if the gap persists.
  - [ ] If it persists post-sync on fresh fields, record the canvas Body Font value and whether the diverging field is old (stored legacy carriers) or fresh.
- **Constraints / Must Not Do:** Do not hardcode heights or line-heights; do not strip stored per-field legacy carriers (rule 154 contract); do not add activation-driven reset effects.
- **Related AGENTS.md Rule(s):** Rules 87, 90, 93, 96, 98, 154, BE-117 entry, Rule 130.
- **Additional Context:** Reported 2026-09-11 (Arabic). Root-cause analysis: pre-BE-117 trigger roots inherited the root computed px line-height while inputs computed their own normal; defaults coincided, but activation materializes the Field Font row (Framer fills a concrete lineHeight), so inputs recompute from their own font while triggers kept inheriting the root value — the gap. BE-117 pins both sides to the identical rule, which in-browser measurement proved equal (38px = 38px), and every Field Styles row already carries its effective default — so on current code activation cannot diverge shared-key geometry. The report was filed while BE-092..BE-117 were still uncommitted working-tree edits, so the canvas under test predates the fix. If a single OLD field still diverges post-sync, its hidden stored legacy carriers differ from its siblings (per-field Styles controls are removed, so delete + re-add that field to clear them).

---

### BE-127 — Progress bar inherits step Transition Type animation instead of fixed grow

- **Status:** Open
- **Description:** The progress bar animates with the step Transition / Transition Type (e.g. blur, scale, fade) when moving between steps. The progress bar should have one fixed author-unchangeable animation: growing smoothly from left to right.
- **Current Behavior:** Setting Transition Type to e.g. `Blur Scale` makes the progress bar also blur, scale, or fade on step change. Moving from Step 1 to Step 2, the bar fades in / appears out of nowhere instead of continuing from its current position.
- **Expected Behavior:** Step 1 to Step 2 moves the progress fill physically from left to right, continuing / growing smoothly from its current position. Changing Transition / Transition Type never changes the progress bar animation.
- **Acceptance Criteria:**
  - [ ] Step forward grows the fill left-to-right from its prior position with no fade/blur/scale/appear-out-of-nowhere on the progress block.
  - [ ] Step back shrinks the fill right-to-left the same way.
  - [ ] Switching Transition Type across all six variants leaves the progress animation unchanged.
  - [ ] No regression in step-content transitions (each variant still distinct, duration control still governs content).
- **Constraints / Must Not Do:** Do not add a progress-animation Property Control; do not merge progress motion into the step-transition variants; do not break rules 21–24 step-visibility/transition architecture.
- **Related AGENTS.md Rule(s):** Rules 19, 22, 24, 117, 198, 199 — implementer to confirm exact numbers.
- **Additional Context:** Reported 2026-09-14 (English translation of Arabic report). Screenshot attached showing full-width bar "Step 1 of 3" / "33% complete".

---

### BE-128 — Progress bar needs additional style/version controls beyond full-width solid/dashed

- **Status:** Open
- **Description:** Only one full-width progress-bar version exists (far left to far right, alongside the step text), with Solid vs Dashed as the only style choice. Authors cannot achieve simpler, less prominent, or non-full-width progress designs.
- **Current Behavior:** One full-width bar version. Solid renders a single continuous bar without gaps; Dashed splits into segments matching the step count. No other version/style control exists.
- **Expected Behavior:** New Property Controls offer different progress-bar styles/versions (e.g. non-full-width, simpler less prominent designs), while the current full-width Solid/Dashed look stays available and default-identical for existing canvases.
- **Acceptance Criteria:**
  - [ ] Author can select a non-full-width / simpler progress-bar version from Property Controls.
  - [ ] Existing canvases with no new control touched render byte-identically (full-width Solid/Dashed preserved).
  - [ ] Progress text ("Step X of Y" / percent) keeps working with every new version.
- **Constraints / Must Not Do:** Do not remove the Solid/Dashed control; do not restyle untouched canvases; do not break rule 117 progress naming/visibility contract.
- **Related AGENTS.md Rule(s):** Rules 19, 117, 123, 129 — implementer to confirm exact numbers.
- **Additional Context:** Reported 2026-09-14. Same screenshot as BE-126 (full-width bar reference).

---

### BE-129 — Directional field border widths ignored; highest value applies to all sides

- **Status:** Open
- **Description:** In Styles > Field Styles > Border, the all-sides vs individual-sides switch shows Top/Right/Bottom/Left rows, but editing them has no effect. A bottom-only border design (clean underline look) cannot be achieved.
- **Current Behavior:** Setting all sides to `0` and Bottom to `2` still renders a `2px` border on all four sides. With Top `3` and Bottom `1`, all four sides render `3px` (highest value wins everywhere). Width, color, and style (solid/dashed/dotted) work when applied globally.
- **Expected Behavior:** Directional values apply strictly to the targeted side only: all `0` + Bottom `2` renders a bottom-only `2px` border; Top `3` + Bottom `1` renders `3px` top and `1px` bottom with the other sides at their own set values.
- **Acceptance Criteria:**
  - [ ] Bottom-only (`0/0/2/0`) renders border on the bottom edge only.
  - [ ] Distinct per-side values (e.g. Top 3, Bottom 1) render per side, never highest-wins-globally.
  - [ ] All-sides mode keeps working exactly as today.
  - [ ] Explicit `0` survives as a real override (no falsy-coercion to a default width).
- **Constraints / Must Not Do:** Do not drop stored border values as "dead"; do not break shared Field Styles resolution (explicit-wins, `??`/`typeof` only); do not restyle untouched canvases.
- **Related AGENTS.md Rule(s):** Rules 83, 90, 93, 96, 131, 154, 157, 199 — implementer to confirm exact numbers.
- **Additional Context:** Reported 2026-09-14. Reporter hypothesis: runtime applies a generic `border` / `border-width` property globally, and should switch to per-side properties (`border-top-width`, `border-bottom-width`, etc.) in individual mode. Implementer to verify against code, not assume.

---

### BE-130 — Section spacing controls relocation; single-vs-three controls question

- **Status:** Open
- **Description:** The three spacing controls at the bottom of Styles (Progress Gap, Heading Gap, Footer Gap, each default `32px`) live in the generic Styles group. The author asks to relocate each to its owning submenu, and asks whether to keep three separate controls or consolidate into one global gap control (goal: design freedom without overcomplication).
- **Current Behavior:** `Progress Gap` (distance progress bar to title/heading), `Heading Gap` (distance title to fields), `Footer Gap` (distance fields to navigation buttons) all sit at the bottom of the generic `Styles` section. Screenshot attached showing all three at `32px`.
- **Expected Behavior:** Progress Gap lives inside the `Progress` Property Controls (with bar visibility, bar style, progress text placement); Heading Gap lives at the very bottom of the `Header` Property Controls under main Styles; Footer Gap lives at the very bottom of the `Buttons` Property Controls under `Layout`. Plus an author decision, recorded before/with implementation: keep three separate controls vs one global gap control.
- **Acceptance Criteria:**
  - [ ] Each gap control renders in its new owning submenu with the same type/defaults (32px) and identical runtime effect when untouched.
  - [ ] Saved canvases with custom gap values keep rendering identically after the move (old paths as readable legacy carriers).
  - [ ] The three-vs-one decision is recorded on this entry (or a follow-up entry) before the panel is restructured.
  - [ ] Visual-only gap edits still never rekey autosave.
- **Constraints / Must Not Do:** Grouping moves change nesting only — never values, defaults, or runtime effect; follow the rule-116 grouping-migration contract (old paths as legacy carriers, one `??` resolution site); do not add raw footer-rhythm rows beyond the moved control.
- **Related AGENTS.md Rule(s):** Rules 116, 123, 128, 129, 131, 190 — implementer to confirm exact numbers.
- **Additional Context:** Reported 2026-09-14. Screenshots: Styles bottom showing Progress Gap / Heading Gap / Footer Gap each at 32px. Open question from author: "should we keep them as three separate item controls, or consolidate them into a single global gap control?"

---

### BE-131 — Typography caps across all text controls: size, line-height, letter-spacing, unit handling

- **Status:** Open
- **Description:** Label Font and Field Font carry some font-size limits, but caps are missing or too loose elsewhere. The author orders strict caps applied across ALL text-element controls in the component, with correct handling of px/rem/em/percent units and edge cases.
- **Current Behavior:** Standard text allows max `24px` / min `10px`; Heading Font allows max `40px`; Sub-heading / Body Font allows max `20px`; Line Height has no caps so extreme values (e.g. `20` or `30`) break the UI; Letter Spacing is unconstrained.
- **Expected Behavior:** Standard text capped to max `18px` / min `12px`; Heading Font max raised to `48px` with line-height caps; Sub-heading / Body Font max `18px`; Line Height strictly capped at max `2em` / `200%` / `20px` by unit; Letter Spacing given strict maximum limits (em or px) preventing UI breakage; unit conversions and edge cases (px, rem, em, percentages) handled correctly across every text control.
- **Acceptance Criteria:**
  - [ ] Standard-text controls enforce 12px min / 18px max at runtime (panel range matches where the platform allows).
  - [ ] Heading control enforces 48px max; body/sub-heading control enforces 18px max.
  - [ ] Line-height inputs cap at 2em / 200% / 20px by unit and extreme values can no longer break layout.
  - [ ] Letter-spacing has enforced maximums (em/px) on every text control.
  - [ ] Caps apply to every text-element control in the component, not Label/Field Font only; px/rem/em/% conversions verified with edge cases.
  - [ ] Untouched canvases render byte-identically; no control removed without an explicit order.
- **Constraints / Must Not Do:** Do not remove any typography control as a "simplification"; do not enforce caps with falsy checks that erase legitimate `0`; runtime caps are product decisions, never "dead code" (rule 199 discipline).
- **Related AGENTS.md Rule(s):** Rules 98, 101, 104, 116, 130, 157, 199 — implementer to confirm exact numbers.
- **Additional Context:** Reported 2026-09-14. Covers all text-element controls component-wide, not just Label Font / Field Font.

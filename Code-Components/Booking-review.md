# Booking Engine — Task & Issue Log

**Scope:** `Code-Components/BookingEngine.tsx` only.
**Source of truth:** this file. Any Booking Engine problem, bug, task, or feature request reported by the user must be logged here — never fixed inline in the reporting session.
**Language:** all entries are written in English, even if the user reports them in Arabic or mixed Arabic/English.
**Audience:** a future AI agent with zero prior conversation context. Each entry must be self-contained enough to implement without asking clarifying questions.

---

## Workflow Rules (for all agents)

1. **Document, don't fix.** When the user reports a Booking Engine issue, append a new entry to this file using the template below. Do NOT edit `BookingEngine.tsx` in the same session unless the user explicitly says `fix it now` / `implement it`.
2. **One entry per issue.** Never merge two separate reports into one entry. Never edit an existing entry's meaning — only append new entries or update `Status`.
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

### BE-019 — Reorder button style rows and rename Color / Fill

- **Status:** Open
- **Description:** The order and naming of the rows inside the shared button style sets do not read naturally. The author-ordered row sequence is: Font, then Text Color renamed to `Color`, then Background renamed to `Fill`, then Radius, Padding, Border, Shadow. (The Text content row itself stays where it is; only the style rows move. BG Blur is deliberately untouched by this entry — pending a separate removal decision.)
- **Current Behavior:** Button style rows follow the canonical Fill → Radius → Border → Shadow → BG Blur order with Padding after the five, titled Text Color / Background / BG Blur.
- **Expected Behavior:** Each shared button set (Primary, Secondary, Calendar Links) lists: Text (content, unchanged position), Font, Color (ex-Text Color), Fill (ex-Background), Radius, Padding, Border, Shadow, then Hover/Pressed. Every existing value migrates with its row (rename/move only — zero visual change on any canvas).
- **Acceptance Criteria:**
  - [ ] Row order and titles match the sequence above in all three shared sets, with values preserved exactly.
  - [ ] Untouched canvases render pixel-identically; stored overrides survive the rename (keys migrated, never dropped).
  - [ ] Hover/Pressed subgroups still close each set; no layout/affecting rows added.
- **Constraints / Must Not Do:** Do not change any rendered value, default, or behavior — reorder/rename only; do not touch BG Blur (separate decision); do not merge Text content with style rows.
- **Related AGENTS.md Rule(s):** Style-order and button-group rules (e.g. Rules 99/101/130/142) — implementer to confirm exact numbers and amend the canonical-order rule openly.
- **Additional Context:** None.

---

### BE-020 — Remove per-field Styles submenus now that shared Field Styles exists

- **Status:** Open
- **Description:** The shared Field Styles group already applies one style set to every field, yet each field's own configuration still exposes its own Styles submenu — the same N-places-to-edit fatigue BE-012 removed for buttons. The per-field layer is now redundant and must go, leaving the shared group as the single styling surface for fields.
- **Current Behavior:** Every field type exposes its own Styles submenu alongside the shared Field Styles group; both layers resolve (per-field wins per row).
- **Expected Behavior:** No field configuration shows a Styles submenu. All fields render from the shared Field Styles group plus engine defaults. Stored per-field overrides are handled by an explicit, recorded migration choice (drop them or promote them into the shared group — implementer states the choice on this entry before deleting).
- **Acceptance Criteria:**
  - [ ] Zero Styles submenus remain in any field configuration (all field types, all variants).
  - [ ] Untouched canvases render exactly as before (shared-unopened look preserved).
  - [ ] The migration choice for stored per-field overrides is recorded on this entry and implemented without silent restyling.
- **Constraints / Must Not Do:** Do not silently drop stored author values without recording the decision; do not touch the shared group, calendar surface, button sets, or terminal styles; resolution stays unset-inherits/explicit-wins.
- **Related AGENTS.md Rule(s):** Field-Styles global/scope rules (e.g. Rules 83/96/131/146) — implementer to confirm exact numbers and amend the per-field-layer clauses openly.
- **Additional Context:** None.

---

### BE-021 — Remove Background Blur from every Styles set (controls, plumbing, and rules)

- **Status:** Open
- **Description:** Background Blur rows exist on every button set, every field Styles set, and the calendar surface, but no author will ever blur a button or a field — the only real glass-blur use case (a panel over the page backdrop) is built by the author as a Framer wrapper frame around the component, natively, without any component support. The rows are dead panel weight plus migration surface for zero visual value.
- **Current Behavior:** A BG Blur row (default `0`, conditional-or-nothing runtime) ships in button groups, all field Styles sets, and Calendar Styles.
- **Expected Behavior:** Zero BG Blur rows, zero blur plumbing/resolvers, zero blur style application anywhere in the component. Untouched canvases render pixel-identically (unconfigured blur already applied nothing). Implement together with (or after) BE-019 — the final row order is the BE-019 sequence minus Blur.
- **Acceptance Criteria:**
  - [ ] No BG Blur control, interface key, resolver, or style application remains in any set (buttons, all field variants, calendar surface, select menu).
  - [ ] Stored blur values become inert (recorded migration choice on this entry; no silent restyling, no orphan crashes).
  - [ ] Rules rewritten in the same pass so the file never describes a removed control: rule 101 (universal-decor clause), rule 115 (canonical "five" → four), rule 130 (canonical order minus Blur), rule 98/113/117/134 Blur mentions — implementer to verify the full list against AGENTS.md.
- **Constraints / Must Not Do:** Do not leave orphaned keys/plumbing; do not change any other row, value, or behavior; do not re-add any filter control later (element-blur/hue/etc. stay excluded per rule 101's remainder).
- **Related AGENTS.md Rule(s):** Rules 98/101/113/115/117/130/134 (every Blur mention) — implementer to confirm exact numbers; the "five" becomes "four" openly per rule 140.
- **Additional Context:** None.

---

### BE-022 — Remove the Text Align row from input field Styles (controls, plumbing, and rules)

- **Status:** Open
- **Description:** Input field Styles exposes a Text Align row (Left/Center/Right, unset = inherit) for text/email/phone/textarea. The product is LTR-only: Center is never used in a form field and Right exists only for RTL locales the component does not target. Authors leave it on the default forever, so the row is pure panel noise plus stored-value surface.
- **Current Behavior:** A Text Align row ships in the input Styles set, applied only when set (`...(fs?.textAlign ? … : {})`).
- **Expected Behavior:** No Text Align row, key, or resolver anywhere. Fields render their natural inherited alignment (LTR default) in every case.
- **Acceptance Criteria:**
  - [ ] No Text Align control, interface key, or style application remains.
  - [ ] Stored `textAlign` values become inert without changing any rendered field (recorded migration on this entry).
  - [ ] Rules rewritten in the same pass: rule 128 (Text Align survivor clause + mechanism paragraph) and every fingerprint-exclusion list naming `textAlign` — implementer to verify the full list against AGENTS.md.
- **Constraints / Must Not Do:** Do not change field rendering for any canvas (unset already inherited — removal must be visually nil); do not touch label styling or choice/checkbox sets.
- **Related AGENTS.md Rule(s):** Rule 128 (and any other `textAlign` mention) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-023 — Field Styles rows follow the same order as button styles, with field naming

- **Status:** Open
- **Description:** Button style sets get the BE-019 order (Font, Color, Fill, Radius, Padding, Border, Shadow), and field Styles sets must mirror that same rhythm with field vocabulary. Verified present in code: `Label Font`, `Font`, `Label Color`, `Text Color`, `Placeholder Color`, `Background`, plus Radius/Padding/Border/Shadow rows. The author-ordered field sequence is: Label Font → Font (renamed `Field Font`) → Label Color → Text Color (renamed `Field Color`) → Placeholder → Background (renamed `Fill`) → Radius → Padding → Border → Shadow (renamed `Shadows`, last). Text Align is already gone via BE-022 and BG Blur via BE-021 — this entry assumes both removals.
- **Current Behavior:** Field sets use their own inherited row order/titles (`Font`, `Text Color`, `Background`, `Shadow` among Label/Placeholder/Focus/Gap rows).
- **Expected Behavior:** Every field Styles set lists rows in the sequence above with the new titles. Rename/move only — every existing value migrates with its row, zero visual change on any canvas. (Buttons keep `Shadow` singular per BE-019 unless the author orders otherwise — the `Shadows` plural is field-sets-only.)
- **Acceptance Criteria:**
  - [ ] All field Styles sets (input, all choice variants, checkbox, calendar surface where rows apply) match the sequence/titles above.
  - [ ] Untouched canvases render pixel-identically; stored overrides survive the renames (keys migrated, never dropped).
  - [ ] Implement together with (or after) BE-019/021/022 so the final panel is ordered, renamed, and free of Align/Blur in one pass.
- **Constraints / Must Not Do:** Do not change any rendered value, default, or behavior; do not add/remove rows beyond the BE-021/022 removals; do not touch resolution semantics or the shared-vs-per-field layering (BE-016/BE-020 decide that separately).
- **Related AGENTS.md Rule(s):** Style-order rules (e.g. Rules 98/130) plus BE-019/021/022 rule updates — implementer to confirm exact numbers and record the field sequence openly.
- **Additional Context:** None.

---

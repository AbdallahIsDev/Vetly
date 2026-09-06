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

### BE-001 — Stacked vertical layout opens scrolled to middle and time list does not scroll internally

- **Status:** Open
- **Description:** On a narrow breakpoint the Calendar stage stacks vertically (metadata on top, then date grid, then time list, then navigation buttons). When the visitor enters this stacked view, the visible viewport starts in the middle of the component: the top part is cut off and the bottom part is cut off. Attempting to scroll anywhere inside the component scrolls the page instead; the component's own content does not scroll.
- **Current Behavior:** (1) The stacked view renders pre-scrolled to approximately the vertical center of the component, so the event-info header above and the navigation below are out of view on entry. (2) Scroll gestures over the component move the page scroll, not the component/time-list content, so the visitor cannot reach the cut-off top or bottom from inside the component.
- **Expected Behavior:** (1) On entry to the stacked Calendar view, the component starts at its top (event-info header visible first), never pre-scrolled to the middle. (2) The available-times list scrolls internally within its own contained panel while the page behind stays put, so the visitor can reach every slot without losing the component position.
- **Acceptance Criteria:**
  - [ ] On narrow widths, entering the Calendar step shows the component from the top (header/metadata visible) with no initial middle-scroll offset.
  - [ ] The time list scrolls internally to reveal all slots while the surrounding page does not move during that gesture.
  - [ ] The scrollbar stays visually hidden (existing hidden-scrollbar styling preserved) while internal scrolling works.
  - [ ] Wide (horizontal-row) layout behavior is unchanged; no new Property Control is added.
- **Constraints / Must Not Do:** Do not reintroduce a visible scrollbar; do not add width-based navigation logic or new controls; do not break rules 44/53/62 or the deterministic step-visibility architecture.
- **Additional Context:** User-attached screenshot shows the stacked view cut at the top (date strip clipped at days 4–10) with the time header "Mon 7th" and slots from 9:00 AM downward; both upper metadata and lower navigation are out of view. Browser/breakpoint details: Unknown.

---

### BE-002 — Select field shows a placeholder item instead of a pre-selected real option

- **Status:** Open
- **Description:** A field of type select with two configured options renders as: field label plus a select box showing a placeholder prompt with a down-chevron. Opening the dropdown lists three items: the placeholder prompt first, then option 1, then option 2. The placeholder prompt behaves as a selectable item even though it is not a real option. The prompt text is also exposed as an editable Copy Property Control.
- **Current Behavior:** (1) The select box initially shows the placeholder prompt instead of a real option. (2) The open dropdown contains the placeholder prompt as its first item followed by the real options, so the visitor can land on / submit a non-option value. (3) The prompt copy is exposed as a Copy Property Control the author can edit.
- **Expected Behavior:** (1) The placeholder item is removed entirely — the dropdown lists only the real options (option 1, option 2). (2) One real option is always pre-selected and visible in the select box (auto-select). (3) The author chooses which option is auto-selected while configuring the select field. (4) The placeholder Copy Property Control is removed.
- **Acceptance Criteria:**
  - [ ] A select field with configured options always displays a real option on first render, never a placeholder prompt.
  - [ ] The open dropdown contains exactly the configured options — no extra placeholder item.
  - [ ] The author can configure which option is the pre-selected default per select field.
  - [ ] No placeholder-prompt Copy control remains exposed.
  - [ ] Required-field validation still works against the pre-selected state (a pre-selected real option counts as answered).
- **Constraints / Must Not Do:** Do not keep the placeholder as a third pseudo-option; do not add the placeholder back under another name; do not break fixed per-type validation or autosave restore of the stored value.
- **Related AGENTS.md Rule(s):** None confirmed — implementer to verify against AGENTS.md (validation and field-config rules).
- **Additional Context:** None.

---

### BE-003 — Select dropdown menu uses browser-default styling instead of the field styles

- **Status:** Open
- **Description:** The select field's closed box follows the configured field styles, but the open dropdown menu renders with plain browser-default styling. The component already has a field-styles system (Styles → field styles) that applies background, border, colors, shadow, blur, and padding to every field. The dropdown menu does not receive any of it.
- **Current Behavior:** Opening the select dropdown shows an unstyled browser-default menu that visually disagrees with the styled select box and the rest of the form.
- **Expected Behavior:** The dropdown menu inherits the same field styles as the select field itself — background, border, text colors, shadow, blur, padding — so the open menu looks like a styled extension of the field.
- **Acceptance Criteria:**
  - [ ] The open dropdown menu renders the select field's configured field styles (background, border, colors, shadow, blur, padding).
  - [ ] Unconfigured style keys keep falling back to the engine defaults exactly as the closed field does (no visual change for untouched fields).
  - [ ] Closed-field rendering and all other field types are unchanged.
- **Constraints / Must Not Do:** Do not introduce a second, separate styling system for the menu; do not add fake/non-functional style controls; do not break the field-styles override-layer semantics (unset inherits, explicit values win).
- **Related AGENTS.md Rule(s):** Rule 83 (field Styles architecture) — implementer to confirm exact numbers; fix must respect the override-layer rules.
- **Additional Context:** None.

---

### BE-004 — Buttons Layout "Order" control is confusing; rename so its effect is immediately obvious

- **Status:** Open
- **Description:** Inside the Buttons Property Control group, the Buttons Layout item holds a Layout row (Grouped = buttons side-by-side with a gap; Split = one button at each far end with space-between) and an Order row. The Order row controls whether the Back button or the primary button (Continue / final action) comes first, but its current label does not communicate that — authors read it and cannot tell what it does.
- **Current Behavior:** The Order row is labeled in a way that does not reveal its meaning, so an author cannot predict that it switches Back-first vs primary-first placement without trial and error.
- **Expected Behavior:** The row is renamed (or otherwise reworked, label-only) so its effect is understood on first read — e.g. framing it around the short word "Back" with `Left` / `Right` options: Back = Left means the primary button takes the opposite side, Back = Right flips it. Whatever the final wording, reading the row once must tell the author exactly which button goes where.
- **Acceptance Criteria:**
  - [ ] The Order row's label/options make the Back-vs-primary placement obvious without opening docs or experimenting.
  - [ ] Both placements keep working exactly as today (visual order, keyboard tab order, and screen-reader order stay coherent via true render order — no visual-only reordering).
  - [ ] No behavior, default, or stored-value migration change: existing canvases render identically; this is a naming/clarity change only.
- **Constraints / Must Not Do:** Do not change the control's behavior, default, or stored values; do not implement the rename via CSS-only visual reordering; do not add a second ordering control.
- **Related AGENTS.md Rule(s):** Buttons Layout / Order rules (true DOM order, Back First default — e.g. Rules 123/126) — implementer to confirm exact numbers; fix must respect the true-order requirement.
- **Additional Context:** None.

---

### BE-005 — Option Images must accept real image uploads (native Framer images), not pasted links

- **Status:** Open
- **Description:** Choice fields expose four index-parallel lists: Options (labels), Option Values (stored values), Option Images (one image per option), Option Descriptions (sub-text per option). Option Images is currently an array of URL strings, so the author must paste an image link — uploading an image from their device is impossible, and the card image gets none of Framer's native image processing.
- **Current Behavior:** The author can only enter an image link per option; no upload picker exists, and the rendered card image is a plain URL image (decorative `alt=""`, no responsive `srcSet`).
- **Expected Behavior:** Option Images becomes an array of native image controls (`ControlType.ResponsiveImage`), so the author uploads from their device and the cards render real Framer images with full image processing. Same list, same index-parallel alignment with Options — only the item control changes from link field to image picker.
- **Acceptance Criteria:**
  - [ ] The author can upload/pick an image per option from their device; it renders inside the cards variant.
  - [ ] Old configs storing plain link strings keep rendering (runtime accepts both string and `{src, srcSet, alt}` shapes).
  - [ ] The picker's `alt`/`srcSet` are wired through to the rendered image where possible.
  - [ ] Adding/persisting images in the panel verified working on canvas (nested-Array seeding check).
- **Constraints / Must Not Do:** Do not restructure the panel or break the index-parallel alignment with Options; do not silently drop stored link values from existing canvases; do not add fake/non-functional controls.
- **Related AGENTS.md Rule(s):** None confirmed — implementer to verify against AGENTS.md (choice-field option rules).
- **Additional Context:** None.

---

### BE-006 — Gate Option Images / Option Descriptions visibility to the variants that render them

- **Status:** Open
- **Description:** Option Images and Option Descriptions are shown for every choice-field type, but the runtime only consumes them in the cards and radio variants (`showMedia = variant === "cards" || variant === "radio"`; descriptions likewise, with cards getting an extra description slot). The select / segmented / pills variants ignore both, so the rows are dead configuration there.
- **Current Behavior:** Option Images and Option Descriptions rows are visible for all choice types, including select / segmented / pills where they have no effect.
- **Expected Behavior:** Both rows are visible only for the cards and radio variants (not cards-only — radio genuinely renders them, so hiding them for radio would orphan working radio configs). They stay hidden for select / segmented / pills. Option Values stays visible for all choice types (it is identity used in selection matching and payload regardless of variant).
- **Acceptance Criteria:**
  - [ ] Option Images / Option Descriptions show for cards and radio, hidden for select / segmented / pills.
  - [ ] Existing radio configs using images/descriptions keep working unchanged.
  - [ ] Option Values visibility unchanged (all choice types).
- **Constraints / Must Not Do:** Do not gate to cards-only; do not change runtime rendering or stored values — visibility gating only.
- **Related AGENTS.md Rule(s):** None confirmed — implementer to verify against AGENTS.md (choice-field option rules).
- **Additional Context:** None.

---

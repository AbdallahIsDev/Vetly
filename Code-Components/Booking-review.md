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

- **Status:** Open
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

### BE-008 — Selecting a trailing next-month day jumps the whole calendar and refetches; consider current-month-only grid like Cal.com

- **Status:** Open
- **Description:** The month grid shows trailing days from the next month (e.g. September view shows Oct 1–9; today Sep 7 is auto-selected as the first available day). Picking a day inside the current month only updates the time-section header and slots. But picking a trailing next-month day (e.g. Oct 2) navigates the entire calendar to that month with a full date+time loading state and a fresh availability fetch — identical to pressing the next-month arrow.
- **Current Behavior:** (1) Trailing next-month days render as selectable cells in the current-month grid. (2) Selecting one jumps the visible month to October, shows loading across the date and time panels, and fires a new API call for the new month's availability. (3) The initial month fetch covers only the current month, so the jump always costs a second fetch.
- **Expected Behavior:** Undecided direction — implementer to pick one and state why: (A) render current-month days only and leave adjacent cells blank/non-interactive like the official Cal.com component (no adjacent selection exists, so no surprise jump or extra fetch; month changes happen only via the arrows, which legitimately fetch); or (B) keep adjacent days selectable but make the pick lightweight (no full-month jump, no whole-panel loading). The author leans toward (A) but leaves the call to the implementing session.
- **Acceptance Criteria:**
  - [ ] Picking a same-month day keeps the current lightweight behavior (header/slots update only).
  - [ ] Either no next/previous-month day is selectable from the current grid (blank cells, Cal.com-style), or selecting one does not trigger a full-month navigation plus whole-panel loading.
  - [ ] Past months stay unreachable (no backward navigation into the past).
  - [ ] Explicit arrow navigation still fetches the newly shown month as today.
- **Constraints / Must Not Do:** Do not fetch months the visitor may never open on initial load; do not break the deterministic month/day state rules or hydration parity; do not reintroduce month flashing on entry.
- **Related AGENTS.md Rule(s):** Adjacent-month grid rules and month-state rules (e.g. Rules 39/46/51/57/61/68) — implementer to confirm exact numbers.
- **Additional Context:** User-attached screenshot of the official Cal.com component (September 2026, Sep 7 selected): only September days render; the three trailing cells after Sep 30 are absent entirely (not disabled), and the two leading pre-Sep-1 cells are absent too. Past-month back navigation is not allowed.

---

### BE-009 — Calendar grid should be 5 rows like Cal.com, not 6 (follows BE-008)

- **Status:** Open
- **Description:** The official Cal.com component renders its month grid in 5 rows while ours renders 6. The 5-row grid gives the component visual breathing room instead of packing everything edge-to-edge. If BE-008 direction (A) is adopted (current-month days only, adjacent cells blank), the grid must collapse to the 5 rows Cal.com uses rather than keeping a 6-row frame.
- **Current Behavior:** The calendar grid renders 6 rows regardless of month content.
- **Expected Behavior:** The month grid renders in 5 rows matching the Cal.com reference: current-month days plus blank space where adjacent-month cells would be, with airy spacing instead of a packed 6-row block.
- **Acceptance Criteria:**
  - [ ] The rendered month grid is 5 rows, consistent across months (no 5-vs-6 flicker when navigating).
  - [ ] Applies together with BE-008 direction (A); if (B) is chosen instead, this entry is void — record that outcome on this entry.
  - [ ] No horizontal overflow, clipping, or unusable cells at any width; stacked narrow layout unaffected.
- **Constraints / Must Not Do:** Do not add spacers, min-heights, or fixed-height workarounds; do not break the deterministic step-visibility or month-state rules.
- **Related AGENTS.md Rule(s):** Same family as BE-008 (adjacent-month grid / month-state rules) — implementer to confirm exact numbers.
- **Additional Context:** Follows BE-008; user-attached Cal.com screenshot shows the 5-row September 2026 grid.

---

### BE-010 — Time-section aside needs bottom padding in stacked (vertical) layout

- **Status:** Open
- **Description:** The time-section `aside` carries 16px padding on every side except the bottom, which is intentionally zero in the horizontal (side-by-side) layout. When the component renders stacked vertically, the missing bottom padding is wrong — the time panel ends flush against what follows it.
- **Current Behavior:** The `aside` has 16px padding on top/left/right and no bottom padding in every layout, including the stacked vertical layout.
- **Expected Behavior:** Horizontal layout keeps the current treatment (16px everywhere except bottom). Stacked vertical layout adds the 16px bottom padding as well.
- **Acceptance Criteria:**
  - [ ] Stacked vertical layout: time `aside` has 16px bottom padding.
  - [ ] Horizontal layout: bottom padding stays absent, all other sides 16px — pixel-identical to today.
  - [ ] No other spacing in the time panel changes.
- **Constraints / Must Not Do:** Do not change horizontal-layout spacing; do not add global margin/padding overrides outside the `aside`.
- **Related AGENTS.md Rule(s):** Time-panel containment/stacking rules (e.g. Rules 44/62) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-011 — Remove the mask-image inline style from the .be-dt-scroll element

- **Status:** Open
- **Description:** The `.be-dt-scroll` element inside the time-section `aside` carries an inline `mask-image` style (the overflow fade). The author finds it looks bad and wants it gone entirely.
- **Current Behavior:** `.be-dt-scroll` renders with an inline `mask-image` fade over the scrollable time list.
- **Expected Behavior:** The `mask-image` inline style is removed completely; slot rows render without any mask/fade treatment.
- **Acceptance Criteria:**
  - [ ] No `mask-image` (or equivalent fade) remains on `.be-dt-scroll` in any state.
  - [ ] Internal scrolling and the hidden-scrollbar treatment are unchanged.
  - [ ] No visual change to anything outside the time list.
- **Constraints / Must Not Do:** Do not reintroduce a visible scrollbar; do not replace the mask with another fade mechanism.
- **Related AGENTS.md Rule(s):** Time-list scroll rules (e.g. Rules 44/53) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

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

### BE-012 — Collapse the 10 per-button style groups into shared Primary / Secondary style sets

- **Status:** Open
- **Description:** Every one of the 10 Buttons groups owns a full independent style set, but the buttons form two visual families that differ only in text. Family 1 (accent-filled primary): Continue, Final Action (Book Now), the submitting/loading state, Book Another, Retry. Family 2 (transparent ghost): Back, Cancel, Done, Reschedule-or-cancel, Contact support. (Nuance for the implementer: Book Another uses tighter 10px/18px padding; Done renders muted secondary text; the ICS/Google/Outlook trio is an accent-outline variant — decide whether it becomes a third set or folds into Secondary.) Because styles are per-button, an author can style Continue black and then reach the last step to find Book Now in default blue — same action, inexplicable change for both the author and the visitor.
- **Current Behavior:** 10 independent style groups; styling one button never affects its visual siblings, so identically-surfaced buttons can diverge mid-flow (e.g. black Continue → blue Book Now).
- **Expected Behavior:** Two shared style sets — Primary (main action) and Secondary (Back/Cancel and kin) — each edited once and applied to every button in the family. Per-button Text labels stay independent; only the style surface is shared. Styling Primary black makes Continue, Book Now, loading, Book Another, and Retry all black.
- **Acceptance Criteria:**
  - [ ] One Primary style edit restyles Continue, Final Action, submitting/loading, Book Another, and Retry together.
  - [ ] One Secondary style edit restyles Back, Cancel, Done, Reschedule-or-cancel, and Contact support together (or documents why any member is excluded).
  - [ ] The ICS/Google/Outlook trio is explicitly resolved (third set or folded in — stated, not accidental).
  - [ ] The black-Continue → blue-Book-Now divergence is impossible.
  - [ ] Existing canvases keep their exact current look unless the author edits the shared sets (stored per-button overrides migrate, never silently dropped).
- **Constraints / Must Not Do:** Do not keep 10 independent style surfaces under new names; do not merge the Text labels (copy stays per-button); do not break the true-DOM-order, hover/pressed-delta, or override-layer semantics.
- **Related AGENTS.md Rule(s):** Buttons-group rules (e.g. Rules 99/101) — implementer to confirm exact numbers.
- **Additional Context:** Reported alongside the button visual-reference audit (`Booking-Buttons-Reference.html`, repo root), which shows the current per-button surfaces.

---

### BE-013 — Rename the submitting label from “Submitting…” to “Booking…”

- **Status:** Open
- **Description:** The loading state appears on the primary button right after the visitor presses Book Now, but its text reads “Submitting…”, which does not match what the visitor just asked for. The visitor expects confirmation that a booking is in progress.
- **Current Behavior:** Pressing Book Now swaps the primary button to a spinner plus the text “Submitting…”.
- **Expected Behavior:** The loading text reads “Booking…” (spinner and opacity behavior unchanged).
- **Acceptance Criteria:**
  - [ ] In-flight primary button shows the spinner plus “Booking…”.
  - [ ] No other copy changes; the old string is gone under every name (no re-adding a control or constant for it).
- **Constraints / Must Not Do:** Do not expose the loading text as a Property Control; do not change spinner, timing, or disabled behavior.
- **Related AGENTS.md Rule(s):** Structural-copy rules (e.g. Rules 110/111 — loading strings are internal) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-014 — Remove Contact Support and audit remaining buttons for removal

- **Status:** Open
- **Description:** The Contact Support action on the error screen does not belong in a booking-only component: every host site already has a contact page in its header/footer, the visitor can find contact on their own, and the button adds author complexity (it demands a contact-link configuration). Worse, a client who drops the component in with just a Cal.com key and event ID gets a dead Contact button they never knew existed. The same “useless action” lens must be applied to every other button.
- **Current Behavior:** The error screen renders Contact Support whenever contact details are configured, and silently renders a dead control surface when they are not part of the author's setup.
- **Expected Behavior:** Contact Support is removed entirely (button, label, value plumbing, controls). Every remaining button is audited with the same question — “does a booking-only component need this, or does the host site already own it?” — and each removal candidate is listed with a keep/remove verdict plus one-line reasoning before anything is deleted.
- **Acceptance Criteria:**
  - [ ] Contact Support fully removed: no render, no label, no value key, no control, no dead surface for unconfigured clients.
  - [ ] Audit table for all remaining actions (keep/remove + one-line reason each) recorded on this entry before deletions.
  - [ ] Error screen still offers a complete path forward (Retry) with no layout collapse.
- **Constraints / Must Not Do:** Do not leave orphaned interface keys, controls, or copy constants behind; do not remove Retry or any booking-critical action without an explicit separate author order.
- **Related AGENTS.md Rule(s):** Controls-UX and copy-simplification rules (e.g. Rules 110/111) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-015 — One Global Density preset drives all spacing (fields + footer + sections)

- **Status:** Open
- **Description:** Spacing today is split: the field grid has a shared Gap control (16px default) while the footer rhythm (gap 8, marginTop 24, paddingTop 12) and section rhythm are hardcoded per site. An author wanting a compact embed or an airy page layout must fight several surfaces at once — or cannot do it at all. This is the spacing twin of BE-012: one decision, whole component.
- **Current Behavior:** Field-grid spacing is author-controlled (Gap 0–32px); footer/section spacing is fixed internals the author cannot reach.
- **Expected Behavior:** One Density enum — Compact / Comfortable (default) / Spacious — lives in Styles and scales field gap, footer gap/margins, and section rhythm together. Comfortable reproduces today's exact values pixel-for-pixel; Compact/Spacious are fixed preset ratios the implementer defines once (no raw px rows, no per-surface controls).
- **Acceptance Criteria:**
  - [ ] Comfortable renders byte-identically to today on existing canvases (unopened = unchanged).
  - [ ] Switching to Compact/Spacious visibly tightens/loosens fields, footer, and sections together with no overflow, clipping, or collapsed layouts at any width.
  - [ ] Exactly one control added; no raw spacing/position rows anywhere (footer rhythm, calendar geometry, and progress structure stay internal).
- **Constraints / Must Not Do:** Do not add per-surface spacing controls; do not change Gap's current behavior when Density is Comfortable; visual-only key stays out of the autosave fingerprint.
- **Related AGENTS.md Rule(s):** Spacing-internal rules (e.g. Rules 82/123) — implementer to confirm exact numbers; the preset carve-out must be recorded back into the rules.
- **Additional Context:** Proposed from the shared-layer audit (same philosophy as BE-012): full freedom (Gap still works per its range) plus one easy global path.

---

### BE-016 — Global Field Styles absorbs selected-state and checkbox accent/size as shared defaults

- **Status:** Open
- **Description:** Global Field Styles today shares only the input-set vocabulary; choice Selected-* rows and checkbox accent/size rows are deliberately per-field-only. So an author who wants every selected card and every checkbox accent in the brand color must open each field's Styles submenu one by one — the same 10-places-to-edit fatigue as BE-012's buttons.
- **Current Behavior:** Selected-state styling and checkbox accent/size resolve per field only; the global group has no twin rows, so there is no brand-once path.
- **Expected Behavior:** The global group gains Selected and Check rows as shared defaults using the identical layered resolution the system already uses: per-field explicit value wins, else global value, else engine default (`??`/`typeof` semantics, explicit 0 included). Unopened global renders byte-identically to today.
- **Acceptance Criteria:**
  - [ ] Setting the global Selected/Check rows restyles every choice field's selected state and every checkbox accent/size at once.
  - [ ] Any per-field explicit value still beats the global (override layer intact, verified per row).
  - [ ] Untouched canvases render exactly as before; reopening submenus preserves stored values.
- **Constraints / Must Not Do:** Do not change resolution semantics (unset inherits, explicit wins — never falsy checks); do not add fake/non-functional rows; do not touch calendar, button, or terminal style systems.
- **Related AGENTS.md Rule(s):** Field-Styles global/scope rules (e.g. Rule 131) — implementer to confirm exact numbers and update the per-field-only clause openly.
- **Additional Context:** Proposed from the shared-layer audit (same philosophy as BE-012): the global stays the easy path, per-field stays the full-freedom path.

---

### BE-017 — Time-slot selected surface follows the shared Primary set, no new controls

- **Status:** Open
- **Description:** Time-slot buttons are the only clickable surfaces with zero author styling: dimensions, selected fill, and muted states are all hardcoded. Today a selected slot renders the Accent token directly. Once BE-012's shared Primary set exists, slots should read the same source — otherwise the author styles Primary black and the selected slot stays blue, which is the exact BE-012 divergence bug in a new place.
- **Current Behavior:** Slot selected/disabled surfaces are hardcoded (Accent fill for selected) with no control surface of any kind.
- **Expected Behavior:** The selected slot renders the shared Primary set's surface (same resolver the buttons use); unselected/disabled slot rendering stays exactly as today. No new Property Control is added for slots — they inherit.
- **Acceptance Criteria:**
  - [ ] Editing shared Primary restyles the selected slot together with Continue/Book Now/Retry.
  - [ ] Unselected, elapsed/disabled, and hover slot states render exactly as today.
  - [ ] Zero new controls; hidden-scrollbar and containment behavior untouched.
- **Constraints / Must Not Do:** Do not add slot styling controls; do not change slot geometry (36px height, single column) or list behavior; implement after (or with) BE-012 so the shared set exists.
- **Related AGENTS.md Rule(s):** Slot/time-list rules (e.g. Rules 44/53/56/70) — implementer to confirm exact numbers.
- **Additional Context:** Proposed from the shared-layer audit to prevent a second instance of the BE-012 divergence bug.

---

### BE-018 — Strip verbose comments from BookingEngine.tsx; keep 1–2 line comments only

- **Status:** Open
- **Description:** BookingEngine.tsx carries ~6,100 comment-only lines out of ~20,200 total (~30%): narrated fix histories, multi-paragraph rationale, and documentation of changes long since landed. Measured 2026-09-07: 6172 lines matching `^\s*//`. Long-form reasoning belongs in AGENTS.md as hard rules (new rule 141), not inline. The component must read as clean code with surgical short comments.
- **Current Behavior:** ~30% of the file is comments, including stale change narratives that add no value to a reader or future agent.
- **Expected Behavior:** Every remaining comment is 1–2 lines stating only what the adjacent code does that a reader cannot see. Any load-bearing rationale encountered during the trim is migrated to AGENTS.md as (or into) a hard rule instead of being deleted silently. Zero logic, style, control, or copy changes.
- **Acceptance Criteria:**
  - [ ] Comment-only lines reduced by an order of magnitude; no comment block exceeds 2 lines (implementer lists any rare exception with reason on this entry).
  - [ ] The final `git diff` contains only removed comment lines plus AGENTS.md rule additions — provably zero runtime change (typecheck + existing harnesses pass).
  - [ ] No rule, invariant, or warning from the removed comments is lost: each survives either as a 1–2 line comment or as an AGENTS.md hard rule.
- **Constraints / Must Not Do:** Do not touch code, styles, controls, copy, or logic — comment-only diff; do not reword logic while "cleaning"; do not delete a rationale without migrating it.
- **Related AGENTS.md Rule(s):** Rule 141 (comment hygiene) — this entry is its enforcement pass.
- **Additional Context:** None.

---

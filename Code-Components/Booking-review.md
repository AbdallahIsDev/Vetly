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

### BE-051 — Remove the Accessibility Labels submenu; hard-code all ARIA labels in-component

- **Status:** Open
- **Description:** The Copy group carries an `Accessibility Labels` submenu with 8 editable rows (Choice Group, Time Slots, Available Times, Date Picker, Booking Progress, Booking Form, Previous Month Nav, Next Month Nav) feeding `ariaLabels` into every landmark, radiogroup, and nav control. ARIA labels are screen-reader plumbing, not author copy: no author rewrites them, and an edited one risks breaking the single-announcement contracts (rules 64/103) without any visible signal. The whole submenu must go; the labels stay as hard-coded in-component constants.
- **Current Behavior:** 8 editable ARIA rows under Copy → Accessibility Labels, resolved through `ariaLabels` into all interactive regions.
- **Expected Behavior:** No Accessibility Labels submenu, keys, or reads anywhere. All eight labels render from fixed internal constants with today's exact default strings. Screen-reader announcements, landmark names, and nav templates behave exactly as today on untouched canvases.
- **Acceptance Criteria:**
  - [ ] Zero Accessibility-Labels control/interface/plumbing remnants (submenu, keys, `copy.aria` reads).
  - [ ] Every aria-label/aria-template in the component renders today's default string verbatim.
  - [ ] Stored custom ARIA values intentionally stop applying (recorded freeze — same discipline as BE-028/BE-035).
- **Constraints / Must Not Do:** Do not change a single announced string; do not touch the live-region/focus announcement contracts (rules 64/103/124); do not add controls back under any group.
- **Related AGENTS.md Rule(s):** Copy-controls and a11y-announcement rules (e.g. Rules 64/103/110/111/124) — implementer to confirm exact numbers and record the removal openly.
- **Additional Context:** Verified in code: `aria` object (8 rows with `DEFAULT_ARIA_*` defaults) feeding `ariaLabels` into progress, form, choice groups, time lists, date picker, and month nav templates.

---

### BE-052 — Prevent a second Primary-Name flag at authoring time (or closest achievable)

- **Status:** Open
- **Description:** Once one text field is flagged Primary Name, the flag stays available on every other text field, so the author can flag a second one: both lose their Required row, both get forced required (first-wins at runtime), and the only signal is a canvas warning. The author asks that the option disappear from all other text fields once used — prevention instead of warning.
- **Current Behavior:** Flag settable on unlimited text fields; duplicates resolve first-wins with a canvas warning ("keep exactly one").
- **Expected Behavior:** Honest platform constraint, stated up front: a per-item `hidden()` sees only its own field's props and cannot know another field is flagged, so literally hiding the flag on "the others" is NOT implementable in Framer property controls (same limitation recorded in rule 173 for the Required row). Implementer must deliver the closest prevention and record the mechanism: candidate directions are (a) keep flag + first-wins but escalate the duplicate signal beyond a warning (exact UX recorded on this entry), or (b) relocate the designation out of per-field flags into a single component-level selection that structurally admits exactly one. Either way the runtime stays first-wins and the payload still submits exactly one name.
- **Acceptance Criteria:**
  - [ ] The chosen mechanism is recorded on this entry with why true-hiding is impossible (per-item visibility, no sibling access).
  - [ ] An author cannot end up with two silently-required name fields: duplicates are either structurally impossible or unmissably signaled before publish.
  - [ ] Single-flag canvases byte-identical in behavior; payload still exactly one name.
- **Constraints / Must Not Do:** Do not claim sibling-aware hiding (it cannot work — verify, don't assume); do not weaken the mandatory-identity guarantee; do not add required-markers UI.
- **Related AGENTS.md Rule(s):** Identity rules (39/167/173) — implementer to confirm exact numbers.
- **Additional Context:** Author-tested symptom: second flagged field also loses Required and becomes required-by-default, with only the canvas warning as signal.

---

### BE-053 — Cards Width Full never fills; flashes full on reload then snaps to fit; rename Half → Fit

- **Status:** Open
- **Description:** A Cards field exposes a Width row (Full/Half, default Full) meant to switch the cards between full-row width and a fitted width — but setting Full renders fit anyway: with two options each should take ~50% (100% combined), yet they render fitted. Worse, every page reload flashes the correct full width for a fraction of a second before snapping back to fit, which points at a post-mount override (late style resolution, hydration-path divergence, or a width effect firing after paint) rather than a static styling mistake. Separately, the `Half` title misnames the behavior and must read `Fit` (options Full/Fit).
- **Current Behavior:** Width Full renders fit; reload shows a sub-second full-width flash before snapping to fit; the row reads Full/Half.
- **Expected Behavior:** Full fills the row (two options share 100%); Fit renders the fitted width; no reload flash (first paint already shows the final width); the row reads Full/Fit with stored values migrating (`half` → fit semantics recorded, never silently restyled).
- **Acceptance Criteria:**
  - [ ] Full fills the row deterministically from first paint (no flash on reload, canvas or published).
  - [ ] Fit renders the fitted behavior; the flash-then-snap is gone on every reload.
  - [ ] Row titles read Full/Fit; stored `half` values migrate to fit semantics with zero visual surprise (recorded here).
- **Constraints / Must Not Do:** Do not mask the flash with timers/delays (find the late override — resolution order, effect, or hydration divergence — and fix the source); do not change card styling, options, or validation.
- **Related AGENTS.md Rule(s):** Field-layout/choice rules (implementer to confirm exact numbers; hydration-parity rules if the cause is a render-path divergence).
- **Additional Context:** Verified in code: Width control `options: ["full","half"]`, titles Full/Half, default `"full"`; render gates on `field.width === "half" && isTwoCol` for grid span — the Full path and the flash source both need the implementer's trace.

---

### BE-054 — Remove the in-flight Cancel button entirely

- **Status:** Open
- **Description:** While the booking POST is in flight the primary button turns into the Booking… loader and a Cancel button appears beside it to abort the request. The booking round-trip takes two to three seconds to success — no visitor can meaningfully decide and press Cancel inside that window, so the button is dead UI that crowds the submitting footer for zero real value.
- **Current Behavior:** Submitting footer shows dimmed Back + Cancel + Booking… loader; Cancel aborts via `abortControllerRef` (`handleCancelSubmit`).
- **Expected Behavior:** No Cancel button, label, or button plumbing anywhere. Submitting footer is dimmed Back + Booking… loader only. Request lifecycle otherwise unchanged.
- **Acceptance Criteria:**
  - [ ] Zero Cancel render/label (`DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL`)/handler remnants tied to the button.
  - [ ] Abort-on-unmount and any non-button abort paths (slots fetch cancellation) stay intact — implementer verifies each `abortControllerRef` use and records what stays vs goes.
  - [ ] Submitting footer renders dimmed Back + loader with no gap/collapse from the removal.
- **Constraints / Must Not Do:** Do not change the loading state, timeout, retry, or failure paths; do not leave the abort plumbing half-removed (every remaining `abort()` call justified on this entry).
- **Related AGENTS.md Rule(s):** Footer/submitting rules — implementer to confirm exact numbers and amend the Cancel clauses openly.
- **Additional Context:** Verified in code: `handleCancelSubmit` aborts `abortControllerRef`; the ref is also used at unmount/cleanup and in slots-fetch paths — those are outside this removal until the implementer says otherwise.

---


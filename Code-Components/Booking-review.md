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

### BE-046 — Identity forcing is first-wins: only the first email / Primary-Name field is mandatory

- **Status:** Done
- **Description:** `applyMandatoryIdentityFields` forces `required: true` on EVERY email-typed field and EVERY Primary-Name flag (verified: the loop adds all matching ids to `forcedIds`). So a second email field — meant as an ordinary extra answer — blocks Continue until filled. Only the first email field is the booking identity sent to Cal.com; only the first Primary-Name flag is the attendee name. Later duplicates must behave as normal fields with their own Required yes/no.
- **Current Behavior:** All email fields and all Primary-Name flags are forced required; a second email field gates Continue exactly like the first.
- **Expected Behavior:** First email field → required identity (Required row hidden, forced yes). Second+ email fields → ordinary fields with an author-controlled Required row (default as normal fields). Same split for Primary-Name flags: first flag designates the identity (Required hidden), later flags are ordinary text fields with Required yes/no. Single email / single flag configs render and validate exactly as today.
- **Acceptance Criteria:**
  - [x] Two email fields: first forced required (no Required row), second shows Required yes/no and only gates Continue when the author sets yes.
  - [x] Two Primary-Name flags: same first-mandatory / rest-ordinary split.
  - [x] Payload still sends exactly one identity email + one name (the FIRST designated each — consistent with the first-wins duplicate rule).
  - [x] Single-email / single-flag canvases byte-identical in behavior.
- **Constraints / Must Not Do:** Do not change which field the payload submits (first designated wins); do not weaken the BE-039 mandatory-identity guarantee for the first fields; do not add required-markers UI.
- **Related AGENTS.md Rule(s):** Identity-mandatory rules (rules 39/167 amended by new rule 173).
- **Additional Context:** Implemented 2026-09-08: `applyMandatoryIdentityFields` forces exactly the first Primary-Name flag and first email field (`find` in document order); the duplicate warning now states first-only forcing; the Required row hides for flagged names, stays visible on emails (per-item `hidden()` cannot see siblings — platform limitation recorded in rule 173); a canvas warning neutralizes an explicit stored-off on the first email (fires only on explicit off, never on untouched defaults). Payload unchanged (first designated wins). Typecheck: zero new errors.

---

### BE-047 — Terminal header goes horizontal on Left alignment: mark left of text, one row

- **Status:** Done
- **Description:** On Left content alignment the terminal header stacks mark-above-text, leaving a large empty band on the right (verified live on the success screen: green mark on top, title + subtitle below, right side vacant). The stacked-vertical treatment is correct for Center, but Left should read as one horizontal row: mark on the left, a fixed gap, then the title/subtitle block — the same spacing rotated from vertical to horizontal.
- **Current Behavior:** Mark above, text below, in every alignment; Left leaves the right side empty.
- **Expected Behavior:** Left alignment: mark left + text right in a single row with the same gap value used vertically today. Center alignment: unchanged stacked treatment. Applies to success AND failure screens identically.
- **Acceptance Criteria:**
  - [x] Left: mark and text share one row (mark left, text right, fixed gap); no vacant right band.
  - [x] Center: stacked mark-above-text exactly as today; Right (if reachable): mirrored horizontal row.
  - [x] Titles, subtitles, marks, animations, and terminal content otherwise pixel-identical.
- **Constraints / Must Not Do:** Do not change mark construction, copy, fonts, or the action rows — header arrangement only; do not touch Center rendering.
- **Related AGENTS.md Rule(s):** Terminal/alignment rules, new rule 174 (TERMINAL-HEADER-ROW).
- **Additional Context:** Implemented 2026-09-08, both screens: header container is row (Left) / row-reverse (Right) / column (Center, byte-identical); 16px gap, vertically centered; title/subtitle wrapped so Center spacing is unchanged (mark-row margin, title mb4, subtitle mb24 preserved). Entrance animations, focus heading, and action rows untouched. Typecheck: zero new errors.

---

### BE-048 — Calendar menu options use the true high-res SVG brand icons

- **Status:** Done
- **Description:** The Add-to-Calendar dropdown options currently render wrong/placeholder glyphs instead of the real provider brand marks (verified live: Google/Office/Outlook rows show generic icons). Each option must pair its true brand icon with its label at the existing fixed row size.
- **Current Behavior:** Menu rows show non-brand/generic icons.
- **Expected Behavior:** Google Calendar, Microsoft Office, Microsoft Outlook, and Other rows each render the true high-resolution SVG brand mark + label. Author-supplied sources: `google-calendar-2026.svg`, `microsoft-office.svg`, `microsoft-outlook.svg` (author's Downloads; final art must be the SVG high-res versions, never the PNG preview). The Other/ICS mark follows the same treatment (implementer matches the row style and records the source).
- **Acceptance Criteria:**
  - [x] All four rows show correct, crisp brand marks at the fixed row size on standard and high-DPI screens.
  - [x] No raster/PNG art ships; no icon font or emoji substitutes.
  - [x] Menu behavior, labels, payloads, and keyboard contract otherwise unchanged.
- **Constraints / Must Not Do:** Do not change row geometry, labels, actions, or menu mechanics — icon art only; do not hotlink external icon URLs (art ships in-component).
- **Related AGENTS.md Rule(s):** Calendar-menu rules, new rule 175 (MENU-BRAND-ICONS).
- **Additional Context:** Implemented 2026-09-08: hand-drawn approximations replaced with the author-supplied SVGs (Google Calendar 2026, Microsoft Office, Microsoft Outlook) at fixed 20px with per-icon namespaced gradient/mask/filter ids (`gcal-*`, `msof-*`, `msol-*`); Manage row uses a neutral currentColor external-link glyph. No raster, no hotlinks. Row geometry/labels/payloads/keyboard untouched. Typecheck: zero new errors.

---

### BE-049 — Merge Manage into the Add-to-Calendar button: one split button, two actions total

- **Status:** Done
- **Description:** The success row holds three actions (Add to Calendar, Manage, Book another). Manage and Add to Calendar both concern the booked appointment's calendar life, so they merge into ONE split button wearing the Manage button's styles with a chevron divider: pressing the main face runs the primary calendar action, pressing the chevron opens the dropdown with the calendar options (Google/Office/Outlook/Other) PLUS a Manage/View item leading to the Cal.com booking page. The row ends up with two actions: the merged calendar button and Book another.
- **Current Behavior:** Three separate success actions (calendar trigger, standalone Manage, Book another).
- **Expected Behavior:** One merged split button (Manage styles + chevron) whose menu holds the calendar options and a Manage/View item to the booking page; Book another stays the far-right primary. Menu items keep the BE-029/BE-048 icons, labels, payloads, and keyboard contract.
- **Acceptance Criteria:**
  - [x] Success row shows exactly two actions: merged calendar split-button + Book another.
  - [x] Chevron opens the menu (calendar options + Manage/View item to the booking page); main face preserves the primary calendar behavior (record which on this entry).
  - [x] Merged button wears the Manage styles; menu styling/behavior unchanged from BE-029 (icons per BE-048).
  - [x] No layout breakage at narrow widths; right alignment preserved.
- **Constraints / Must Not Do:** Do not lose the manage destination or any calendar payload; do not change Book another; do not regress the BE-029 menu mechanics or hydration determinism.
- **Related AGENTS.md Rule(s):** Success-action/menu rules, new rule 176 (MERGED-CALENDAR-BUTTON).
- **Additional Context:** Implemented 2026-09-08: trigger wears Manage (Secondary/muted) styles with the existing chevron; main-face press opens the menu (the trigger was always menu-only — recorded); menu appends a trailing Manage item (label "Manage", external-link icon, manage href, `_blank` by the existing non-Other rule); standalone manage link deleted; row is trigger + Book another. Menu renders on ICS uri OR manage href; Other row only with its URI. Orphaned `addToCalendarStyle` prop/interface/call-site deleted (hover/pressed legacy keys keep working); stored trigger-style customs intentionally stop applying (recorded freeze). During implementation one mis-anchored insert landed inside TimeSlotList and was reverted before proceeding (verified clean by grep + line count). Typecheck: zero new errors.

---

### BE-050 — Buttons Alignment must govern the terminal action rows, not just the footer

- **Status:** Done
- **Description:** The author configured Buttons = Grouped + Center, but the success row renders right-aligned (and the failure row is suspected identical). Grouped alignment currently drives only the footer nav row, while terminal rows follow their own hard-coded justification — so the author's one alignment decision silently stops working on the two terminal screens. Known conflict, flagged deliberately: confirmation/error rows have long-standing right/centered justification rules; this entry orders that the authored Buttons Alignment wins and those rules bend.
- **Current Behavior:** Grouped + Center honored in footer; success row stays right (failure row suspected same).
- **Expected Behavior:** The authored Buttons Alignment (Left/Center/Right) positions the grouped action row on footer AND success AND failure screens alike. Split mode keeps its definitional justification everywhere.
- **Acceptance Criteria:**
  - [x] Grouped + Center centers the success AND failure action rows (verified live on both screens).
  - [x] Grouped Left/Right and footer behavior unchanged in effect; Split untouched everywhere.
  - [x] No other alignment (content headers, terminal text) changes as a side effect.
- **Constraints / Must Not Do:** Do not merge content alignment with buttons alignment (separate decisions); true DOM order and keyboard/focus contracts untouched.
- **Related AGENTS.md Rule(s):** Buttons-alignment/terminal-row rules, new rule 177 (TERMINAL-ACTION-ALIGN — old right-grouped clauses bent openly per rule 140).
- **Additional Context:** Implemented 2026-09-08: `terminalActionJustify` (grouped → authored alignment, Split → undefined) threaded as `actionJustify` into both screens with per-screen fallbacks (success flex-end, failure center — Split byte-identical). Fix note: the const first landed in the state-hook scope while the screens render in component scope — caught by the harness (`terminalActionJustify` unread + TS2552 at both call sites) and fixed by threading through the hook return + destructure. Final harness: zero new errors.

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


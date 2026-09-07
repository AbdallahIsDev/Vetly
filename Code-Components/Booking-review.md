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

### BE-024 — Group the Selected rows into one “Selected Styles” subgroup with the full style vocabulary

- **Status:** Open
- **Description:** The shared Field Styles group lists the selected-state rows (Selected BG / Text / Border, …) flat among all other rows — noise for authors who never touch them, and too shallow for authors who do (colors only). The chosen direction (of the two considered; per-field Selected submenus were rejected because every new cards/tiles field would need the same styles re-applied by hand): remove the flat selected rows and replace them with one `Selected Styles` item that opens a submenu carrying the FULL style vocabulary — colors, border, shadow, padding, radius, everything — in one organized place.
- **Current Behavior:** Selected-state styling is N flat color-ish rows inside the shared group; per-field Selected submenus do not exist.
- **Expected Behavior:** One `Selected Styles` (or `Active Styles` — implementer picks the clearer title and records it) subgroup inside shared Field Styles; opening it reveals the complete style set for the selected/active state of cards/tiles/choice fields. One place, full freedom, no noise around it.
- **Acceptance Criteria:**
  - [ ] Exactly one Selected subgroup replaces the flat selected rows; it holds the full vocabulary (not colors-only).
  - [ ] Editing it restyles every selected/active option at once (shared-layer semantics unchanged: unset inherits, explicit wins).
  - [ ] Untouched canvases render pixel-identically (defaults equal today's effective selected look).
- **Constraints / Must Not Do:** Do not reintroduce per-field Selected submenus; do not narrow the subgroup to colors-only; do not touch unselected/checkbox/calendar/button styling.
- **Related AGENTS.md Rule(s):** Field-Styles rules (e.g. Rules 131/146 plus BE-023 updates) — implementer to confirm exact numbers and record the subgroup openly.
- **Additional Context:** None.

---

### BE-025 — Move Check Size out of shared Styles into the Checkbox field’s own submenu

- **Status:** Open
- **Description:** The shared Field Styles group carries a Check Size row, but checkbox sizing concerns only Checkbox-type fields — it is noise for every other field type. Type-specific settings belong with their field, not in the shared surface.
- **Current Behavior:** Check Size lives in shared Field Styles for all fields.
- **Expected Behavior:** Check Size is removed from the shared group and appears as a row in the field’s own configuration submenu, visible only when that field’s type is Checkbox. Every other field type never sees it.
- **Acceptance Criteria:**
  - [ ] Shared Field Styles contains no Check Size row.
  - [ ] Checkbox fields expose Check Size in their own submenu with today's default (18) and range.
  - [ ] Untouched canvases (checkbox and otherwise) render pixel-identically.
- **Constraints / Must Not Do:** Do not change the default, range, or rendering; do not show the row for non-checkbox types; stored values migrate, never silently dropped.
- **Related AGENTS.md Rule(s):** Field-Styles rules (e.g. Rules 131/146) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-026 — Field shadows are clipped on the sides by an overflow:hidden ancestor

- **Status:** Open
- **Description:** Applying Shadow to fields renders the shadow at the bottom only — the sides are cut off, apparently by an `overflow: hidden` ancestor (14 such sites exist in the component; verified by grep). A shadow the author configured must be fully visible on all sides.
- **Current Behavior:** Field shadows clip horizontally; only the bottom shadow survives.
- **Expected Behavior:** Configured field shadows render whole on every side. Open conflict, flagged deliberately: the clipping ancestor may be load-bearing for the deterministic step-transition architecture (inactive steps clipped/absolute) — the implementer must identify the exact clipping element and resolve without breaking step visibility (overflow-visible where safe, spacing compensation, or another mechanism the implementer justifies on this entry).
- **Acceptance Criteria:**
  - [ ] A configured field shadow is fully visible on all four sides in every step and layout.
  - [ ] Step transitions, active/inactive visibility, and layout containment behave exactly as before (rules 14/17/21–23 untouched in effect).
  - [ ] Unshadowed fields render pixel-identically to today.
- **Constraints / Must Not Do:** Do not break the deterministic active-step visibility architecture to fix a shadow; do not add spacers/min-heights as a fake frame; do not change shadow defaults.
- **Related AGENTS.md Rule(s):** Step-visibility/layout rules (e.g. Rules 14/17/21–23) plus style-system rules — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-027 — Collapse the Text-only per-button groups into one shared “Button Texts” submenu

- **Status:** Open
- **Description:** After the shared-style consolidation each button still owns its own Property-Control group holding exactly one row (Text), so editing every button's copy means opening ten separate submenus one by one. Copy belongs together in one place, exactly like shared styles.
- **Current Behavior:** 10 per-button groups (Continue, Back, Final Action, Cancel, Done, Book Another, Add to Calendar, Google Calendar, Outlook, Retry) each expose a single Text row.
- **Expected Behavior:** One `Button Texts` submenu holds every button label in a single list; the per-button single-row groups are gone. Every stored custom label migrates with its text (never dropped, never reset to default).
- **Acceptance Criteria:**
  - [ ] All button texts are editable from one submenu; no per-button Text-only groups remain.
  - [ ] Every stored custom label survives with its exact value; untouched canvases keep shipped defaults.
  - [ ] Texts removed from controls by BE-028 are not in the list (implement together or after BE-028).
- **Constraints / Must Not Do:** Do not change any label value or default in the move; do not merge labels that BE-028 hard-codes; do not touch style sets.
- **Related AGENTS.md Rule(s):** Button-group/text rules (e.g. Rules 99/101/142) — implementer to confirm exact numbers and record the new structure openly.
- **Additional Context:** None.

---

### BE-028 — Hard-code button texts the author will never change; audit the rest

- **Status:** Open
- **Description:** Several button texts are exposed as editable controls purely for "full freedom," but no author ever changes them (Book Another, Add to Calendar, Add to Google Calendar, Add to Outlook, and others like them) — each editable row is panel noise plus stored-value surface for a value that stays at default forever. Fixed texts must be hard-coded; only texts an author plausibly rewrites stay editable.
- **Current Behavior:** Every button text above (and possibly more) is an exposed control despite being effectively constant.
- **Expected Behavior:** The fixed texts above are hard-coded constants with no control, no interface key, no legacy carrier. Every remaining button text gets a keep-editable/hard-code verdict with one-line reasoning, recorded on this entry before deletion (same audit discipline as BE-014).
- **Acceptance Criteria:**
  - [ ] Listed texts are hard-coded; no control/interface/legacy key remains for them.
  - [ ] Audit table for all other button texts (keep-editable vs hard-code + reason) recorded on this entry before deletions.
  - [ ] Untouched canvases render exactly the same strings (including previously customized ones only where the verdict is keep-editable — hard-coded verdicts intentionally freeze the shipped text; record each).
- **Constraints / Must Not Do:** Do not hard-code Continue/Back/Final-Action/Done/Retry/booking-critical copy without an explicit separate author order; do not leave orphaned keys/controls.
- **Related AGENTS.md Rule(s):** Controls-UX/copy rules (e.g. Rules 99/110/111/142) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-029 — Replace the three calendar buttons with one “Add to Calendar” button + dropdown menu

- **Status:** Open
- **Description:** The success screen shows six actions at once, three of which are near-duplicate calendar buttons (Add to Calendar / Add to Google Calendar / Add to Outlook) plus Reschedule-or-cancel, Done, and Book Another. Following the attached reference (Google Calendar / Microsoft Office / Microsoft Outlook / Other): one `Add to Calendar` button opens a dropdown menu; Google/Office/Outlook deep-link to their calendars, and Other downloads the .ics file.
- **Current Behavior:** Three separate always-visible calendar buttons crowd the success row (six actions total).
- **Expected Behavior:** One `Add to Calendar` button; on press it opens a styled dropdown with Google Calendar, Microsoft Office, Microsoft Outlook, and Other (Other = .ics download). Deep-link options navigate to their calendar with the booking pre-filled, exactly as today.
- **Acceptance Criteria:**
  - [ ] Success row shows one calendar button; the menu lists the four options above with working actions.
  - [ ] Every menu option pairs its provider brand icon with its label (icon + text per the reference screenshot, never text-only); icons use the component's existing icon/image path at one fixed row size.
  - [ ] The dropdown reuses the component's field/button style vocabulary (no second styling system, no browser-default menu).
  - [ ] Keyboard contract sane (Enter/Space opens, arrows move, Escape closes, focus returns to the trigger); outside press closes.
  - [ ] Google/Outlook/ICS payloads behave exactly as today (titles per BE-030).
- **Constraints / Must Not Do:** Do not regress to a native `<select>` popup; do not break the right-aligned success row or the BE-012 shared sets; menu must not trigger hydration mismatches (deterministic first render).
- **Related AGENTS.md Rule(s):** Success-action and menu/styling rules (e.g. Rules 31/134/142) — implementer to confirm exact numbers.
- **Additional Context:** Author-attached reference screenshot shows the target menu (Google Calendar / Microsoft Office / Microsoft Outlook / Other).

---

### BE-030 — Calendar export titles must carry the Cal.com event title, not a bare fallback

- **Status:** Open
- **Description:** Whatever the booking is about (e.g. a 15-minute meeting), the exported calendar entry lands with a generic title (`SUMMARY` falls back to `DEFAULT_COPY_ICS_SUMMARY_FALLBACK = "Booking"`), so the visitor's calendar shows a bare word with no indication of what was booked. The event title already exists in the component (Cal.com event-type metadata fetch).
- **Current Behavior:** ICS/deep-link titles resolve to the author summary label or the bare `"Booking"` fallback — never the actual event name.
- **Expected Behavior:** Every calendar export title (ICS + Google/Outlook deep links) reads `<Cal.com event title> + <Appointment/Booking suffix>` — the existing suffix word stays, prefixed by the real event name. When the event title is unavailable, today's fallback behavior applies unchanged.
- **Acceptance Criteria:**
  - [ ] A booked "15 Min Meeting" exports as e.g. "15 Min Meeting Appointment" (exact suffix recorded on this entry).
  - [ ] ICS, Google, and Outlook titles agree with each other.
  - [ ] Missing event title degrades to today's fallback (no empty titles, no crashes).
- **Constraints / Must Not Do:** Do not block or delay booking/availability on the metadata fetch (rule 38 stands); do not add new Property Controls for the title.
- **Related AGENTS.md Rule(s):** Event-metadata and ICS rules (e.g. Rules 26/27/34/38) — implementer to confirm exact numbers.
- **Additional Context:** Verified in code: `SUMMARY:${...summary || summaryFallback}` with `DEFAULT_COPY_ICS_SUMMARY_FALLBACK = "Booking"`; event title is fetchable via the existing event-type metadata path.

---

### BE-031 — Rename the “Reschedule or cancel” button to a short, obvious label

- **Status:** Open
- **Description:** The manage button's text is long and clunky for a success-row action. The button itself stays (it is the visitor's only path to reschedule/cancel via their Cal.com booking page) — only its copy changes to something short that reads instantly (e.g. Edit/Manage — implementer proposes, author-approved wording recorded on this entry).
- **Current Behavior:** Label reads "Reschedule or cancel" (Copy default `DEFAULT_COPY_RESCHEDULE_OR_CANCEL_LABEL`).
- **Expected Behavior:** A concise label (one or two words) that still communicates "change or cancel this booking."
- **Acceptance Criteria:**
  - [ ] New label renders in the success row; row layout unbroken at narrow widths.
  - [ ] Destination and behavior (Cal.com manage URL) completely unchanged.
  - [ ] Stored customizations of the old label: recorded verdict (migrate or freeze) on this entry, no silent loss.
- **Constraints / Must Not Do:** Do not change destination, styling role, or visibility conditions; do not remove the button (its necessity is settled).
- **Related AGENTS.md Rule(s):** Success-action/copy rules (e.g. Rules 31/110/111) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-032 — Research: can reschedule/cancel happen inline, or is the Cal.com redirect mandatory?

- **Status:** Done
- **Description:** Today the manage button redirects the visitor to a Cal.com booking page where the reschedule/cancel affordance is a tiny footer line most visitors never notice. The author wants inline edit/reschedule/cancel on the same page (edit details → save → meeting info updates). Unknown: does Cal.com expose booking-reschedule/cancel APIs usable from this component, or is the redirect the only supported path?
- **Current Behavior:** (Known) redirect to the Cal.com booking page; the change/cancel entry point is visually buried there (per author screenshot).
- **Expected Behavior:** A verdict, not an implementation: either (A) a feasible inline design against Cal.com's booking APIs (endpoints, auth constraints, what a visitor token may/may not do — rescheduling someone else's booking from a public page has abuse implications that must be addressed), recorded with a concrete proposal; or (B) redirect-is-mandatory with the mechanism cited (docs/API evidence), plus the best low-cost improvement to the current handoff. `main` is never touched by this entry.
- **Acceptance Criteria:**
  - [x] Verdict A or B recorded on this entry with evidence (API docs/endpoints or the blocking constraint quoted).
  - [x] If A: auth/abuse analysis included (how a public visitor may mutate only their own booking).
  - [x] If B: the recommended handoff improvement stated (no implementation).
- **Constraints / Must Not Do:** No component changes under this entry; no new controls; do not design around undocumented endpoints.
- **Related AGENTS.md Rule(s):** Cal.com integration rules (e.g. Rules 26/34/38) — researcher to confirm exact numbers.
- **Additional Context:** VERDICT CORRECTED 2026-09-07 (the first verdict below was wrong — retained for the record per rule 140): (A-conditional) — inline cancel/reschedule-time is feasible WITHOUT any key. Decisive evidence: Cal.com's own engineer on calcom/cal.diy#24900 (closed/fixed): "when rescheduling or canceling a booking auth is not required for both new and old controller because booking uid already acts as a layer of protection." I.e. the booking UID is a capability token — possession authorizes. This matches the observed behavior exactly (anonymous incognito cancel via modal, no sign-in). The visitor already holds the UID on our success screen, so inline cancel grants them ZERO new authority versus the manage link we already hand them. Consequences: (1) the read-only-vs-full key question is moot — no key is sent at all; (2) the abuse objection collapses to "same as sharing the manage URL," which we already do; (3) what remains unproven and needs a live worktree spike (see BE-036): cross-origin POST acceptance (CORS) from a Framer site, exact behavior on self-hosted instances, email-verification-code flows, pending-state bookings, and whether guest-detail edits (name/email/notes without moving the slot) are supported anywhere — no endpoint for that was found, so "edit info inline" stays unproven while "cancel + move slot inline" is mechanism-sound. ORIGINAL (wrong) VERDICT, kept for the record: (B) per the v2 auth docs (`Authorization: Bearer cal_*`, "never put secret keys in client-side code"). Error: the docs describe the authenticated management path; the booking controllers deliberately exempt UID-scoped reschedule/cancel from auth.

---

### BE-033 — Remove the Done button from the success screen

- **Status:** Open
- **Description:** Done does nothing but navigate to the site home — a destination the visitor already reaches via the browser back button, the header logo/home link, or the footer. It is a dedicated component control for a need the host site already serves, adding row crowding (six success actions) for zero unique value.
- **Current Behavior:** Done renders left of Book Another, linking to `/` (fixed destination, no control).
- **Expected Behavior:** No Done button, label, group, or destination logic anywhere. The success row is calendar menu + manage + Book Another. No layout collapse, no orphaned keys/controls/copy.
- **Acceptance Criteria:**
  - [ ] Zero Done render/label/control/interface/destination remnants.
  - [ ] Success row stays right-aligned and unbroken with the remaining actions.
- **Constraints / Must Not Do:** Do not change the remaining actions' order roles (Book Another stays far-right primary); do not introduce any auto-redirect to replace it (success screen still waits for an explicit visitor action).
- **Related AGENTS.md Rule(s):** Success-action/home rules (e.g. Rules 29/31/32) — implementer to confirm exact numbers and amend the Done clauses openly.
- **Additional Context:** None.

---

### BE-034 — Success-screen info order is fixed: Name, Email, Date, Time first — never entry order

- **Status:** Open
- **Description:** The confirmation details list renders values in the exact order the visitor entered them, so Date/Time sink to the bottom whenever the calendar step is last (which is always — the calendar is the mandatory final stage). Identity (Name, Email) and appointment (Date, Time) are the four most important facts and must lead regardless of step/field order.
- **Current Behavior:** Details mirror entry order; Date/Time render last.
- **Expected Behavior:** Fixed leading order — Name, Email, Date, Time — followed by all remaining values in entry order. Applies however steps/fields are arranged, including email entered on a late step.
- **Acceptance Criteria:**
  - [ ] Name/Email/Date/Time lead in that order on every booking, regardless of step and field configuration.
  - [ ] Remaining values keep entry order after the fixed four; Confirmation-ID row stays last (per BE-035).
  - [ ] Missing values degrade sanely (present values keep relative order; no empty rows).
- **Constraints / Must Not Do:** Do not change payload, validation, autosave, or notes content — display ordering only; do not add controls for the order.
- **Related AGENTS.md Rule(s):** Success-screen/payload rules (e.g. Rules 30/119) — implementer to confirm exact numbers.
- **Additional Context:** None.

---

### BE-035 — Rename the trailing “Confirmation #” row to a hard-coded clear ID label

- **Status:** Open
- **Description:** The confirmation details end with a row labeled "Confirmation #" (`DEFAULT_COPY_CONFIRMATION_NUMBER_LABEL`, currently an exposed Copy control). The `#`-as-ID shorthand reads poorly, the label is editable despite never needing to change, and the row carries the booking UID that doubles as the Cal.com manage-page identifier — so it must stay last, just under a name visitors understand instantly.
- **Current Behavior:** Trailing row titled "Confirmation #", editable via Copy control.
- **Expected Behavior:** The row keeps the last position with a hard-coded, self-explanatory label (e.g. Confirmation ID / Booking ID / Appointment ID — implementer picks and records it). No control, no interface key, no legacy carrier.
- **Acceptance Criteria:**
  - [ ] New hard-coded label renders last in the details list on every booking.
  - [ ] No Copy control/interface/legacy key remains for it; stored customizations intentionally freeze to the shipped label (recorded here).
  - [ ] The UID value itself is unchanged (still the Cal.com booking identifier).
- **Constraints / Must Not Do:** Do not move the row off last; do not alter the UID value; do not add controls.
- **Related AGENTS.md Rule(s):** Success-screen/copy rules (e.g. Rules 30/110/111) — implementer to confirm exact numbers.
- **Additional Context:** Verified in code: `DEFAULT_COPY_CONFIRMATION_NUMBER_LABEL = "Confirmation #"` with a Copy-control default at the Copy panel.

---

### BE-037 — Refresh the button HTML reference after all button tasks land

- **Status:** Open
- **Description:** `Booking-Buttons-Reference.html` (repo root) is a hand-built visual snapshot of the buttons; every button-task implementation (shared sets BE-012, Booking… BE-013, removals BE-014/028/033, dropdown BE-029, renames BE-031/035, texts BE-027, and any other button-touching entry) silently dates it. After the last button task merges, the implementing agent must bring the page back to exact production fidelity in the same pass — no separate session, no stale snapshot left behind.
- **Current Behavior:** The page matches the pre-task component; each implementation drifts it further.
- **Expected Behavior:** The page reproduces the final component exactly: the single Add-to-Calendar dropdown (+ its menu options with brand icons), every removed button gone (Contact, Done, hard-coded texts' groups), every renamed label current, shared-set surfaces current — verified by re-rendering the page headlessly and eyeballing the screenshots before push.
- **Acceptance Criteria:**
  - [ ] Every button/action visible in the page exists in the component with identical surface, label, order, and in-step context; nothing removed still shown, nothing current missing.
  - [ ] Headless re-render screenshots reviewed and attached to (or noted on) this entry before push.
  - [ ] No component runtime changes made to serve the page (reference-only rule stands).
- **Constraints / Must Not Do:** Do not redesign or invent styles; values copy production source only; do not trigger real booking/API flows while verifying.
- **Related AGENTS.md Rule(s):** None (artifact hygiene) — implementer to confirm.
- **Additional Context:** Runs after BE-027/028/029/031/033/035 (and any other button-touching entry); ordering dependency recorded here so it is scheduled last.

---

### BE-036 — Trial: inline cancel (then reschedule-time) via UID-capability, isolated worktree spike

- **Status:** Open
- **Description:** BE-032's corrected verdict says UID-scoped cancel/reschedule needs no auth (calcom/cal.diy#24900: "booking uid already acts as a layer of protection"), but three things are unproven from docs alone: cross-origin POST acceptance from a Framer site, self-hosted behavior, and verification-code/pending-state flows. This trial proves them in an isolated git worktree against a real (test) event: an inline Cancel action (reason modal mirroring the hosted page, optional reason) calling the UID-scoped cancel with NO auth header, then — only if cancel proves out — a move-slot reschedule reusing the component's own availability reads.
- **Current Behavior:** The only manage path is the redirect to the Cal.com booking page.
- **Expected Behavior:** A verdict, not a merge: either the spike proves inline cancel (then a follow-up implementation entry wires it into the success screen, and rule 29-adjacent redirect assumptions are rewritten openly) or any kill criterion fails (worktree deleted, redirect stays, BE-032's verdict stands as UID-possible-but-unproven-in-practice).
- **Acceptance Criteria:**
  - [ ] Spike runs in an isolated git worktree against a test event; `main` untouched regardless of outcome.
  - [ ] Kill criterion 1 — anonymous inline cancel succeeds with UID only (no key, no sign-in) and the booking reads cancelled on the hosted manage page.
  - [ ] Kill criterion 2 — failure paths sane (already-cancelled UID, bad UID, offline): clear visitor feedback, no silent state corruption.
  - [ ] Kill criterion 3 (stretch, reschedule-time only if 1–2 pass) — moving the slot inline lands the new time and surfaces verification/pending states honestly.
  - [ ] Guest-detail edits (name/email/notes without moving the slot) are NOT attempted — no endpoint found; recorded as out of scope.
- **Constraints / Must Not Do:** Do not send any API key/secret from the browser (the point is UID-only); do not touch `main`; do not merge on partial success; no new Property Controls in the spike.
- **Related AGENTS.md Rule(s):** Cal.com integration rules (e.g. Rules 26/34/38) — implementer to confirm exact numbers.
- **Additional Context:** Follows the corrected BE-032 verdict. The visitor holds the UID from their own success screen, so the spike grants no new authority beyond the manage link already handed out.

---

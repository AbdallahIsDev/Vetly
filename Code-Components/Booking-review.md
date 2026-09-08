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

### BE-028 — Hard-code button texts the author will never change; audit the rest

- **Status:** Done
- **Description:** Several button texts are exposed as editable controls purely for "full freedom," but no author ever changes them (Book Another, Add to Calendar, Add to Google Calendar, Add to Outlook, and others like them) — each editable row is panel noise plus stored-value surface for a value that stays at default forever. Fixed texts must be hard-coded; only texts an author plausibly rewrites stay editable.
- **Current Behavior:** Every button text above (and possibly more) is an exposed control despite being effectively constant.
- **Expected Behavior:** The fixed texts above are hard-coded constants with no control, no interface key, no legacy carrier. Every remaining button text gets a keep-editable/hard-code verdict with one-line reasoning, recorded on this entry before deletion (same audit discipline as BE-014).
- **Acceptance Criteria:**
  - [x] Listed texts are hard-coded; no control/interface/legacy key remains for them.
  - [x] Audit table for all other button texts (keep-editable vs hard-code + reason) recorded on this entry before deletions.
  - [x] Untouched canvases render exactly the same strings (including previously customized ones only where the verdict is keep-editable — hard-coded verdicts intentionally freeze the shipped text; record each).
- **Constraints / Must Not Do:** Do not hard-code Continue/Back/Final-Action/Done/Retry/booking-critical copy without an explicit separate author order; do not leave orphaned keys/controls.
- **Related AGENTS.md Rule(s):** Controls-UX/copy rules (e.g. Rules 99/110/111/142) — implementer to confirm exact numbers.
- **Additional Context:** Implemented 2026-09-08 together with BE-027. **Audit table (recorded before deletion):**

  | Button text | Verdict | Reason |
  | --- | --- | --- |
  | Continue | keep-editable (Button Texts) | primary step CTA; authors commonly rebrand ("Next") |
  | Back | keep-editable (Button Texts) | primary navigation; commonly rebranded |
  | Book Now (Final Action) | keep-editable (Button Texts) | conversion-critical CTA, brand-specific; BE-028 constraint explicitly forbids hard-coding it |
  | Cancel (in-flight) | keep-editable (Button Texts) | booking-critical flow copy; wording affects trust |
  | Try again (Retry) | keep-editable (Button Texts) | BE-028 constraint explicitly forbids hard-coding it |
  | Done | REMOVED (BE-033, same session) | not hard-coded — the button is gone entirely |
  | Book another | hard-code (constant) | per BE-028 letter; post-booking utility, effectively constant — stored customs intentionally FROZEN to "Book another" |
  | Add to Calendar (trigger) | hard-code (constant) | per BE-028 letter; now the BE-029 dropdown trigger — stored customs FROZEN to "Add to Calendar" |
  | Add to Google Calendar | hard-code (menu label "Google Calendar") | BE-029 replaced the button with a menu item; provider name is fixed — stored customs FROZEN |
  | Add to Outlook | hard-code (menu label "Microsoft Outlook") | BE-029 menu item; provider name is fixed — stored customs FROZEN |
  | (new) Microsoft Office | hard-code (menu label) | BE-029 menu item — new provider, no legacy carrier ever existed |
  | (new) Other | hard-code (menu label) | BE-029 menu item — generic .ics download |

  Removed with the hard-coded verdicts: `bookAnotherLabel`/`addToCalendarLabel` (buttonLabels), `googleCalendarLabel`/`outlookCalendarLabel` (copy), and the `googleCalendarButton`/`outlookCalendarButton` style-group keys (buttons replaced by menu items). `bookAnotherButton`/`addToCalendarButton` stay as style-only legacy carriers (rule 142 — stored hover/pressed keys keep winning; their `.text` reads are gone).

---

### BE-029 — Replace the three calendar buttons with one “Add to Calendar” button + dropdown menu

- **Status:** Done
- **Description:** The success screen shows six actions at once, three of which are near-duplicate calendar buttons (Add to Calendar / Add to Google Calendar / Add to Outlook) plus Reschedule-or-cancel, Done, and Book Another. Following the attached reference (Google Calendar / Microsoft Office / Microsoft Outlook / Other): one `Add to Calendar` button opens a dropdown menu; Google/Office/Outlook deep-link to their calendars, and Other downloads the .ics file.
- **Current Behavior:** Three separate always-visible calendar buttons crowd the success row (six actions total).
- **Expected Behavior:** One `Add to Calendar` button; on press it opens a styled dropdown with Google Calendar, Microsoft Office, Microsoft Outlook, and Other (Other = .ics download). Deep-link options navigate to their calendar with the booking pre-filled, exactly as today.
- **Acceptance Criteria:**
  - [x] Success row shows one calendar button; the menu lists the four options above with working actions.
  - [x] Every menu option pairs its provider brand icon with its label (icon + text per the reference screenshot, never text-only); icons use the component's existing icon/image path at one fixed row size.
  - [x] The dropdown reuses the component's field/button style vocabulary (no second styling system, no browser-default menu).
  - [x] Keyboard contract sane (Enter/Space opens, arrows move, Escape closes, focus returns to the trigger); outside press closes.
  - [x] Google/Outlook/ICS payloads behave exactly as today (titles per BE-030).
- **Constraints / Must Not Do:** Do not regress to a native `<select>` popup; do not break the right-aligned success row or the BE-012 shared sets; menu must not trigger hydration mismatches (deterministic first render).
- **Related AGENTS.md Rule(s):** Success-action and menu/styling rules (e.g. Rules 31/134/142) — implementer to confirm exact numbers.
- **Additional Context:** Implemented 2026-09-08. New `CalendarExportMenu` component (trigger button + portaled `role="menu"` panel to `document.body`, mirroring `SelectFieldControl`'s portal/reposition/outside-pointerdown mechanics — rule 134 pattern). Menu options: Google Calendar, Microsoft Office (new `outlook.office.com` compose deep link — `buildCalendarDeepLink` gained the `"office"` provider), Microsoft Outlook (`outlook.live.com`), Other (.ics download with the fixed generic filename). Each option pairs a 20×20 inline brand-mark SVG with its label. Styling reuses the Calendar Links shared set vocabulary: trigger = resolved accent-outline role with Hover/Pressed; panel = surface fill + Calendar Links border/radius/shadow/font; rows = 10px 14px padding, `max(0, radius − 4)` row radius, `withAlpha(text, 0.06)` active wash (the select-menu row pattern). Keyboard: Enter/Space/ArrowDown/ArrowUp open; arrows/Home/End move real focus among `role="menuitem"` anchors (active-item wash marks the position); Escape closes and refocuses the trigger; Tab and item activation close; outside pointerdown closes. First render is deterministic (menu closed, nothing portaled) — no hydration impact. Options with no deep-link URI (non-ISO demo slot) are omitted exactly as the old buttons were conditionally rendered; the trigger renders whenever a booked slot exists (rule 36).

---

### BE-030 — Calendar export titles must carry the Cal.com event title, not a bare fallback

- **Status:** Done
- **Description:** Whatever the booking is about (e.g. a 15-minute meeting), the exported calendar entry lands with a generic title (`SUMMARY` falls back to `DEFAULT_COPY_ICS_SUMMARY_FALLBACK = "Booking"`), so the visitor's calendar shows a bare word with no indication of what was booked. The event title already exists in the component (Cal.com event-type metadata fetch).
- **Current Behavior:** ICS/deep-link titles resolve to the author summary label or the bare `"Booking"` fallback — never the actual event name.
- **Expected Behavior:** Every calendar export title (ICS + Google/Outlook deep links) reads `<Cal.com event title> + <Appointment/Booking suffix>` — the existing suffix word stays, prefixed by the real event name. When the event title is unavailable, today's fallback behavior applies unchanged.
- **Acceptance Criteria:**
  - [x] A booked "15 Min Meeting" exports as e.g. "15 Min Meeting Appointment" (exact suffix recorded on this entry).
  - [x] ICS, Google, and Outlook titles agree with each other.
  - [x] Missing event title degrades to today's fallback (no empty titles, no crashes).
- **Constraints / Must Not Do:** Do not block or delay booking/availability on the metadata fetch (rule 38 stands); do not add new Property Controls for the title.
- **Related AGENTS.md Rule(s):** Event-metadata and ICS rules (e.g. Rules 26/27/34/38) — implementer to confirm exact numbers.
- **Additional Context:** Verified in code: `SUMMARY:${...summary || summaryFallback}` with `DEFAULT_COPY_ICS_SUMMARY_FALLBACK = "Booking"`; event title is fetchable via the existing event-type metadata path. Implemented 2026-09-08: `SuccessScreen` receives `eventTitle` (threaded from the existing `calEventMeta.title` — non-blocking per rule 38) and resolves one `calendarExportTitle` consumed by ICS + Google + Office + Outlook alike: `${eventTitle} ${suffix}` where the **suffix is the author's Calendar Summary label (default `"Appointment"`, blank-degrades to `"Booking"`)** — so a booked "15 Min Meeting" exports as **"15 Min Meeting Appointment"**. Missing event title keeps today's exact behavior (`summary || fallback`).

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

- **Status:** Done
- **Description:** Done does nothing but navigate to the site home — a destination the visitor already reaches via the browser back button, the header logo/home link, or the footer. It is a dedicated component control for a need the host site already serves, adding row crowding (six success actions) for zero unique value.
- **Current Behavior:** Done renders left of Book Another, linking to `/` (fixed destination, no control).
- **Expected Behavior:** No Done button, label, group, or destination logic anywhere. The success row is calendar menu + manage + Book Another. No layout collapse, no orphaned keys/controls/copy.
- **Acceptance Criteria:**
  - [x] Zero Done render/label/control/interface/destination remnants.
  - [x] Success row stays right-aligned and unbroken with the remaining actions.
- **Constraints / Must Not Do:** Do not change the remaining actions' order roles (Book Another stays far-right primary); do not introduce any auto-redirect to replace it (success screen still waits for an explicit visitor action).
- **Related AGENTS.md Rule(s):** Success-action/home rules (e.g. Rules 29/31/32) — implementer to confirm exact numbers and amend the Done clauses openly.
- **Additional Context:** Implemented 2026-09-08 together with BE-027/BE-028/BE-029. Full removal: SuccessScreen button + props (`doneLabel`/`doneStyle`/`doneHover`/`donePressed`), `doneButton` control and interface key, `doneLabel` interface key, `DEFAULT_COPY_RETURN_HOME_LABEL` and `DEFAULT_CONFIRM_HOME_URL` constants, and every state-hook/`BookingEngine` resolution along the way — zero remnants (grep-verified). AGENTS.md rules 29/31/32 amended openly in the same pass (rule 140). The success row stays right-aligned: Add-to-Calendar dropdown → Manage → Book Another (far-right primary); no auto-redirect exists — success still waits for an explicit visitor action.

---

### BE-034 — Success-screen info order is fixed: Name, Email, Date, Time first — never entry order

- **Status:** Done
- **Description:** The confirmation details list renders values in the exact order the visitor entered them, so Date/Time sink to the bottom whenever the calendar step is last (which is always — the calendar is the mandatory final stage). Identity (Name, Email) and appointment (Date, Time) are the four most important facts and must lead regardless of step/field order.
- **Current Behavior:** Details mirror entry order; Date/Time render last.
- **Expected Behavior:** Fixed leading order — Name, Email, Date, Time — followed by all remaining values in entry order. Applies however steps/fields are arranged, including email entered on a late step.
- **Acceptance Criteria:**
  - [x] Name/Email/Date/Time lead in that order on every booking, regardless of step and field configuration.
  - [x] Remaining values keep entry order after the fixed four; Confirmation-ID row stays last (per BE-035).
  - [x] Missing values degrade sanely (present values keep relative order; no empty rows).
- **Constraints / Must Not Do:** Do not change payload, validation, autosave, or notes content — display ordering only; do not add controls for the order.
- **Related AGENTS.md Rule(s):** Success-screen/payload rules (e.g. Rules 30/119) — implementer to confirm exact numbers.
- **Additional Context:** Implemented 2026-09-08 in the `SuccessScreen` entries memo. Name/Email rows are identified with the existing `findNameField`/`findEmailField` helpers (primary-name flag first, then label/id heuristics — the same matching the `{name}` copy token uses); Date/Time rows carry stable internal ids. The four lead entries are pulled to the front in fixed order; all remaining entries keep entry order; the Confirmation ID row stays last (BE-035). Missing values simply produce no row (entries only exist for non-empty answers), so relative order degrades sanely; a field serving as both name and email match is deduplicated. Payload/validation/autosave/notes untouched — display ordering only.

---

### BE-035 — Rename the trailing “Confirmation #” row to a hard-coded clear ID label

- **Status:** Done
- **Description:** The confirmation details end with a row labeled "Confirmation #" (`DEFAULT_COPY_CONFIRMATION_NUMBER_LABEL`, currently an exposed Copy control). The `#`-as-ID shorthand reads poorly, the label is editable despite never needing to change, and the row carries the booking UID that doubles as the Cal.com manage-page identifier — so it must stay last, just under a name visitors understand instantly.
- **Current Behavior:** Trailing row titled "Confirmation #", editable via Copy control.
- **Expected Behavior:** The row keeps the last position with a hard-coded, self-explanatory label (e.g. Confirmation ID / Booking ID / Appointment ID — implementer picks and records it). No control, no interface key, no legacy carrier.
- **Acceptance Criteria:**
  - [x] New hard-coded label renders last in the details list on every booking.
  - [x] No Copy control/interface/legacy key remains for it; stored customizations intentionally freeze to the shipped label (recorded here).
  - [x] The UID value itself is unchanged (still the Cal.com booking identifier).
- **Constraints / Must Not Do:** Do not move the row off last; do not alter the UID value; do not add controls.
- **Related AGENTS.md Rule(s):** Success-screen/copy rules (e.g. Rules 30/110/111) — implementer to confirm exact numbers.
- **Additional Context:** Verified in code: `DEFAULT_COPY_CONFIRMATION_NUMBER_LABEL = "Confirmation #"` with a Copy-control default at the Copy panel. Implemented 2026-09-08: **recorded label: `"Confirmation ID"`** (`DEFAULT_COPY_CONFIRMATION_ID_LABEL`). The Copy control, the `copy.confirmationNumberLabel` interface key, and every read are deleted — no control, no interface key, no legacy carrier. **Stored-customization verdict: FREEZE** — previously customized labels intentionally stop applying (the row always reads "Confirmation ID"), per this entry's own spec. The row keeps its last position (after the BE-034 reorder) and the UID value is unchanged.

---

### BE-037 — Refresh the button HTML reference after all button tasks land

- **Status:** Done
- **Description:** `Booking-Buttons-Reference.html` (repo root) is a hand-built visual snapshot of the buttons; every button-task implementation (shared sets BE-012, Booking… BE-013, removals BE-014/028/033, dropdown BE-029, renames BE-031/035, texts BE-027, and any other button-touching entry) silently dates it. After the last button task merges, the implementing agent must bring the page back to exact production fidelity in the same pass — no separate session, no stale snapshot left behind.
- **Current Behavior:** The page matches the pre-task component; each implementation drifts it further.
- **Expected Behavior:** The page reproduces the final component exactly: the single Add-to-Calendar dropdown (+ its menu options with brand icons), every removed button gone (Contact, Done, hard-coded texts' groups), every renamed label current, shared-set surfaces current — verified by re-rendering the page headlessly and eyeballing the screenshots before push.
- **Acceptance Criteria:**
  - [x] Every button/action visible in the page exists in the component with identical surface, label, order, and in-step context; nothing removed still shown, nothing current missing.
  - [x] Headless re-render screenshots reviewed and attached to (or noted on) this entry before push.
  - [x] No component runtime changes made to serve the page (reference-only rule stands).
- **Constraints / Must Not Do:** Do not redesign or invent styles; values copy production source only; do not trigger real booking/API flows while verifying.
- **Related AGENTS.md Rule(s):** None (artifact hygiene) — implementer to confirm.
- **Additional Context:** Runs after BE-027/028/029/031/033/035 (and any other button-touching entry); ordering dependency recorded here so it is scheduled last. Implemented 2026-09-08 in the same pass as BE-027/028/029/031/033/035. Page rewritten to the final model: Button Texts submenu documented (Continue/Back/Final Action/Cancel/Retry editable; every other label a constant), the single Add-to-Calendar trigger with a static open-menu replica (Google Calendar / Microsoft Office / Microsoft Outlook / Other, 20×20 brand-mark icons copied verbatim from the component's SVGs), Manage (renamed label, muted secondary), Book another (tight primary), Done moved to the Removed section alongside Contact support, shared-set cards updated (Secondary no longer lists Done; Calendar Links description covers the menu). Headless re-render verified with Playwright (Chromium): full-page, menu-card, and success-row screenshots captured and reviewed — 11 cards, 4 menu items, "Done" present only in the Removed section, zero console errors. No component runtime changes were made to serve the page.

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

### BE-038 — Button Texts keeps 3 rows; Cancel/Retry hard-code; Continue/Back rows renamed

- **Status:** Done
- **Description:** The Button Texts submenu holds five editable rows, but Cancel ("Cancel") and Retry ("Try again") are effectively constant — no author rewrites them — so they must be hard-coded like the BE-028 set. The remaining rows need clearer titles: the "Continue" row becomes `Next Step` and the "Back" row becomes `Back Step` (values stay "Continue"/"Back"); Final Action stays exactly as is.
- **Current Behavior:** Five editable rows: Continue, Back, Final Action, Cancel, Retry (verified: `buttonTexts` controls + `continueLabel/backLabel/finalActionLabel/cancelSubmitLabel/retryLabel` resolution with legacy fallbacks).
- **Expected Behavior:** Three editable rows — Next Step (value "Continue"), Back Step (value "Back"), Final Action (unchanged). Cancel and Retry render their fixed strings with no control, interface key, or legacy carrier.
- **Acceptance Criteria:**
  - [x] Cancel/Retry have no editable row, key, or carrier; they always render "Cancel"/"Try again" (in-flight Cancel and both Retry surfaces included).
  - [x] Row titles read Next Step / Back Step / Final Action with unchanged default values ("Continue"/"Back"/"Book Now").
  - [x] Stored custom Cancel/Retry values intentionally freeze to the shipped strings (recorded here); stored Continue/Back/Final-Action customs survive under the renamed rows.
- **Constraints / Must Not Do:** Do not change any rendered default string; do not touch style sets, resolution order, or booking behavior; row renames are title-only (stored keys may stay if the rename is titles-only — implementer records the mechanism).
- **Related AGENTS.md Rule(s):** Button-text rules (e.g. Rules 99/142 plus BE-027/028 updates) — implementer to confirm exact numbers and record the 3-row structure openly.
- **Additional Context:** Implemented 2026-09-08. **Mechanism (title-only renames, recorded):** stored interface keys stay `continueLabel`/`backLabel`/`finalActionLabel`, only the Framer row titles changed (Continue → `Next Step`, Back → `Back Step`, Final Action untouched) — saved values migrate with their rows automatically. Cancel/Retry became fixed constants with the full carrier chain deleted: the `buttonTexts.cancelSubmitLabel`/`buttonTexts.retryLabel` rows and interface keys, the flat `buttonLabels.cancelSubmitLabel` key, the `copy.retryLabel` interface key, and every resolution read (`buttonTexts.<row> → perButtonGroup.text → flat legacy → default`) for both labels — both now resolve directly to `DEFAULT_BUTTON_CANCEL_SUBMIT_LABEL` ("Cancel") / `DEFAULT_COPY_RETRY_LABEL` ("Try again"), covering the in-flight Cancel button and both Retry surfaces (error screen + slots inline retry, which already share the single resolved value). Stored per-button `cancelButton`/`retryButton` style objects keep winning for hover/pressed styles via `mergeButtonStyleGroups` (rule 142 contract) — only their text plumbing is gone. **Freeze verdict:** stored custom Cancel/Retry texts intentionally stop applying (the rows always render the shipped strings), per this entry's own spec.

---

### BE-039 — Name and contact are mandatory: Primary-Name/email designation forces Required; duplicates resolved

- **Status:** Done
- **Description:** A successful Cal.com booking requires an attendee name plus at least one contact method (proven by a live 400: `"Attendee must have at least one contact method (email or phone number)"`, `calcom-validation/BadRequestException`). Yet today the author may leave all eight fields optional, the flow sails through every step to Book, and dies at the API — the worst possible place. The component already has role designations (a text field's `Primary Name` flag; email-typed fields); designation must imply mandatory.
- **Current Behavior:** All fields optional is allowed; validation passes; `POST /v2/bookings` returns 400 and the visitor lands on the failure screen after completing everything.
- **Expected Behavior:** (1) A text field with Primary Name = yes is always required — its Required row is hidden (forced yes). (2) The same treatment for the designated contact field (email-typed; phone counts as contact per Cal.com — implementer resolves email-vs-phone designation and records it). (3) Duplicates handled explicitly since the backend expects exactly one name and one contact identity: multiple Primary-Name flags and/or multiple email fields must resolve deterministically (first-wins + canvas warning, or hard error — implementer picks, records, and covers with tests), never silently sending the wrong identity.
- **Acceptance Criteria:**
  - [x] No configuration can reach Book without a Submittable name + ≥1 contact method: missing designation is caught at authoring/validation time (canvas warning and/or blocked advance with a clear field error), never as a post-submit API 400.
  - [x] Primary-Name fields show no Required row (forced required, including validation + payload paths).
  - [x] Duplicate name/email designations resolve deterministically with a recorded rule and canvas-visible signal; single-identity payload guaranteed.
  - [x] All-optional legacy canvases that previously 400d now fail fast with a clear message (never a silent behavior change for valid configs).
- **Constraints / Must Not Do:** Do not weaken fixed per-type validation; do not add new required-markers UI (rule 4 stands); do not break autosave restore, Cal.com payload mapping (`isPrimaryName`/email identity), or the success-screen Name/Email leading rows (BE-034).
- **Related AGENTS.md Rule(s):** Validation, payload-identity, and marker rules (e.g. Rules 4/76/81/100) — implementer to confirm exact numbers.
- **Additional Context:** Live proof (console, `POST /v2/bookings` → 400): `{category: 'calcom-validation', errorCode: 'BadRequestException', calcomMessage: 'attendee property is wrong, attendee email or phone property is wrong, Attendee must have at least one contact method (email or phone number)'}`. Verified in code: `required` Boolean control (default false), `isPrimaryName` Boolean (text-only), email field type, `findField`/identity helpers. Implemented 2026-09-08 via `applyMandatoryIdentityFields` (single choke point at the end of `normalizeSteps`, harness-tested: 12 identity cases pass). **Designation model (recorded):** (1) every text field flagged `Primary Name` is forced `required: true`; (2) the contact designation is the **email type** — every email-typed field is forced required (email is this engine's contact-identity vocabulary: email fields are excluded from `bookingFieldsResponses` and exist solely as attendee contact; the first email is the submitted attendee email); (3) with no designation at all, the label-matched identity field (`findNameField`/`findEmailField` — the exact field the submit path sends) is forced required instead, so no reachable config can submit an empty name/contact. **Phone verdict (email-vs-phone resolution, recorded):** email is the designated contact method — the booking POST attendee payload carries only email, a phone-only config is already blocked at the `!emailField` guard (`misconfiguredFormError`, canvas guardrail), and phone fields flow through bookingFieldsResponses/notes — so phone never receives the forced-required treatment and keeps its authored Required row. **Duplicates (first-wins, recorded):** multiple Primary-Name flags and/or multiple email fields resolve to the FIRST field in pipeline order — exactly what `findNameField`/`findEmailField` already submit — with canvas warnings for both duplicate shapes plus fallback-designation warnings ("mark it Primary Name" / "change its type to Email"). **Control surface:** the Required row is hidden (Property Control `hidden`) for `isPrimaryName` text fields and email-typed fields; a label-fallback text field keeps its visible Required row while being forced (the canvas warning explains the force). **Behavior change (intended, recorded):** previously-optional email fields now enforce required — this is the exact 400 BE-039 kills; autosave restore, per-type validation caps, payload mapping, and the BE-034 success rows are untouched. The 400 cure for any residual edge case is BE-040's `attendeeContactError` copy.

---

### BE-040 — Submit failures must surface actionable messages, not the vague bad-request fallback

- **Status:** Done
- **Description:** When the booking POST fails with a Cal.com validation error, the visitor sees the generic `badRequestError` ("The booking service rejected the request details. Please go back, check your answers, and try again.") while the console holds the precise cause (e.g. the attendee/contact-method message). A failure message that cannot tell the visitor what to fix is a dead end — especially now that BE-039 narrows (but can never fully close) the validation gap for misconfigured or edge-case payloads.
- **Current Behavior:** Cal.com 400s render the vague `badRequestError` fallback; the specific `calcomMessage` is console-only.
- **Expected Behavior:** Mapped Cal.com failure categories render visitor-actionable copy (missing contact → say contact is missing and which step holds it; taken slot → existing taken-slot copy; unknown → today's fallback). Messages name the remedy and, where deterministic, the step to return to — never raw API text, never technical codes.
- **Acceptance Criteria:**
  - [x] Each mapped failure (at minimum: attendee/contact validation, taken slot, timeout/offline already covered) shows copy that tells the visitor what happened and what to do next.
  - [x] Unmapped failures keep today's fallback (no blank/technical leakage: no status codes, errorCode strings, or raw `calcomMessage` in UI).
  - [x] The categorization already logged for `booking:failure` (endpoint/status/category) is reused — no second taxonomy.
- **Constraints / Must Not Do:** Do not print raw API payloads/codes to visitors; do not turn the message card into a second control surface beyond existing error-copy controls; console failure logging (rule 112) stays as the technical record.
- **Related AGENTS.md Rule(s):** Error-state/logging/copy rules (e.g. Rules 102/110/111/112) — implementer to confirm exact numbers.
- **Additional Context:** Verified in code: `ERROR_COPY_DEFAULTS.badRequestError` is the shown string; the `booking:failure` console record already carries endpoint/httpStatus/category/errorCode/calcomMessage. Pairs with BE-039 (prevention) as cure. Implemented 2026-09-08 in `mapCalcomError` (the single existing taxonomy point — no second system): a content branch now runs FIRST, before the code switch, catching the live 400 shapes ("Attendee must have at least one contact method (email or phone number)", "attendee property is wrong, attendee email or phone property is wrong") via `contact method` or `attendee` + email/phone/name token matching, returning the new `attendeeContactError` copy ("Your booking needs your name and an email address to be confirmed. Please go back, complete the contact details, and try again."). The key is a first-class `ErrorCopy` member with a Copy control row ("Booking Error Messages > Missing Contact Details") so authors can reword it. Taken-slot, timeout, offline, and every other mapping are untouched; unmapped failures still land on `badRequestError`/the fallback — the function never returns raw API text (harness-tested: contact-400 both with `BadRequestException` and `BAD_REQUEST` codes, unmapped 400, already-booked, and unknown-message cases). **Step-naming verdict (recorded):** the copy names the remedy ("go back, complete the contact details") but not a specific step number — the contact field can live on any authored step, so deterministic step naming is not possible without new plumbing; the visitor's values survive the error screen, so Retry → back → the field error shows exactly where to fix it.

---

### BE-041 — Failure-screen text should use balanced wrapping

- **Status:** Done
- **Description:** The failure screen's title, subtitle, and message card render with default text wrapping, which leaves ragged, uneven line breaks on the short centered/terminal copy. Balanced wrapping evens the lines and makes the terminal text look composed.
- **Current Behavior:** No `text-wrap`/`textWrap` value exists anywhere in the component (verified by grep) — terminal text wraps with the browser default.
- **Expected Behavior:** The failure-screen parent (the element containing the title, subtitle, and failure message) applies `text-wrap: balance`, so multi-line terminal copy breaks evenly.
- **Acceptance Criteria:**
  - [x] Title, subtitle, and message lines wrap balanced on the failure screen at narrow and wide widths.
  - [x] No other surface changes (balance applies to the failure parent only — implementer confirms scope on this entry; success screen explicitly out unless justified).
  - [x] Untouched single-line renders pixel-identical (balance is a no-op there).
- **Constraints / Must Not Do:** Do not change copy, fonts, sizes, colors, or layout — wrapping only; do not apply globally without recording why.
- **Related AGENTS.md Rule(s):** Error-state/terminal rules (e.g. Rules 102/129) — implementer to confirm exact numbers.
- **Additional Context:** Implemented 2026-09-08: `textWrap: "balance"` on the ErrorScreen's outer terminal column — the single element containing the mark row, title, subtitle, and the failure message card — so all failure text wraps balanced while inheriting into the existing `textAlign` behavior. **Scope confirmed on this entry (failure parent only):** the success screen and every other surface are untouched; single-line renders are byte-identical because balance is a no-op without a line break. No copy, font, size, color, or layout values changed.

---

### BE-042 — Remove the Terminal Icon Size control; hard-code 48px marks with 24px glyphs

- **Status:** Done
- **Description:** The Terminal group's only row is Icon Size (24–96px, unset = 64 success / 40 error), but terminal mark sizing is not a real author decision — it adds panel, stored values, and fallback plumbing for a number nobody tunes. Both marks become fixed: 48px circle, 24×24 inner glyph, on success and failure alike.
- **Current Behavior:** Icon Size control drives both marks (`iconSize ?? 64` success circle with half-size check SVG; `iconSize ?? 40` error circle with 60% "!" glyph); unset keeps the two historical sizes.
- **Expected Behavior:** No Terminal group, no Icon Size control/key/plumbing anywhere. Success and error marks render 48px circles with 24px glyphs, always. (Success layering itself changes per BE-043 — implement together; the sizes here are final either way.)
- **Acceptance Criteria:**
  - [x] Zero Icon Size control/interface/plumbing remnants; the emptied Terminal group is gone too.
  - [x] Both marks measure exactly 48px circles with 24px glyphs at every width, motion setting, and terminal.
  - [x] Untouched canvases that never set Icon Size keep their... (explicit change recorded: historical 64/40 become 48 — this is an intended visual change, not a silent regression; record it here, which this line does).
- **Constraints / Must Not Do:** Do not keep a hidden/legacy Icon Size key readable (stored values must stop applying — recorded here); do not change mark colors, animations, or layout — size/glyph only (structure per BE-043).
- **Related AGENTS.md Rule(s):** Terminal/controls rules (e.g. Rules 129/131) — implementer to confirm exact numbers and delete/amend the Icon Size clauses openly.
- **Additional Context:** Verified in code: `terminal.iconSize` group (sole row), `iconSize ?? CHECKMARK_ICON_SIZE (64)` + half-size SVG, `iconSize ?? ERROR_ICON_SIZE (40)` + 60% "!". Implemented 2026-09-08 (together with BE-043 in one pass, as the entry directs). Full removal, grep-verified zero remnants: the `terminal` control group AND its interface key, the `header.iconSize` interface key (stored values stop applying — both legacy reads deleted per this entry's constraint), the `terminalIconSize` resolution in the state hook, its return/destructure rows, and the `iconSize` props on `SuccessScreen`/`ErrorScreen` (props, destructures, render threads). Constants now read `CHECKMARK_ICON_SIZE = 48` / `ERROR_ICON_SIZE = 48`; the success check SVG is 24×24 (half) and the error "!" glyph fontSize is `Math.round(ERROR_ICON_SIZE / 2)` = 24px (the historical 60%-of-40 was also 24 — the glyph size is unchanged, only the circles grew). **Intended visual change (recorded):** success circles 64 → 48 and error circles 40 → 48, applied to every canvas regardless of stored values (stored Icon Size values are inert — no hidden readable key remains).

---

### BE-043 — Success mark becomes layered concentric circles like the failure mark

- **Status:** Done
- **Description:** The success mark is one flat solid-green circle while the failure mark is a composed treatment (large faint outer circle + smaller stronger inner circle + glyph, opacity stepping down outward). The flat solid disc reads heavy next to it; both terminals must share the same layered language, tinted per state.
- **Current Behavior:** Success = single solid `successColor` circle with white check; failure = error 12% disc + 6% halo ring + error glyph.
- **Expected Behavior:** Success renders two concentric success-green circles (outer faintest, inner stronger — same opacity-step construction as the failure mark) with the check glyph inside. Failure mark untouched.
- **Acceptance Criteria:**
  - [x] Success shows outer + inner green circles with visibly stepped opacity, check centered inside — same construction rhythm as the failure mark.
  - [x] Final sizes honor BE-042 (48px outer, 24px glyph); entrance + check-draw animations behave exactly as today.
  - [x] Failure mark pixel-identical; reduced-motion/static-render end states unchanged.
- **Constraints / Must Not Do:** Do not change the success green token, the check path/draw, or the entrance transition selection; do not touch the failure mark.
- **Related AGENTS.md Rule(s):** Terminal/success-animation rules (e.g. Rules 33/37) — implementer to confirm exact numbers.
- **Additional Context:** Implemented 2026-09-08 together with BE-042. The success mark now uses the failure mark's exact construction: outer halo ring `0 0 0 8px withAlpha(successColor, 0.06)` (faintest) + inner disc `withAlpha(successColor, 0.12)` (stronger) + the glyph in the full state color — the check SVG's `currentColor` now resolves to `successColor` (the flat solid disc and its `TEXT_ON_ACCENT` white-on-green are gone; `TEXT_ON_ACCENT` remains in use for its other accent-surface consumers). The check path (`M4 12 9 17 20 6`), `pathLength` 0 → 1 draw, strokeWidth, the circle entrance via `TRANSITION_VARIANT_DEFS[transitionVariant]` + the existing `Transition` timing (duration override included), the static-render/reduced-motion end states, and the success green token are all untouched. Failure mark untouched (pixel-identical styling values, only the shared constant changed 40 → 48 per BE-042).

---

### BE-044 — Move Content Alignment to the top of Styles; drop the emptied Content group

- **Status:** Done
- **Description:** The Content group exists solely to hold one row (Content Alignment) — a group-per-row is panel bloat. Alignment is a styling decision and belongs in Styles as its first row, so typography-adjacent decisions read top-down in one place.
- **Current Behavior:** `header` group titled Content holds only `contentAlignment` (Left/Center/Right, default Left); Styles starts with fonts/tokens.
- **Expected Behavior:** Content Alignment is the first row of the Styles group (same type, options, default). The emptied Content group is gone entirely. Stored alignment values keep applying (key migration recorded, never dropped).
- **Acceptance Criteria:**
  - [x] Styles lists Content Alignment first with identical options/default and identical effect (step headers + terminal headers).
  - [x] No Content group remains; stored values survive the move with zero visual change.
- **Constraints / Must Not Do:** Do not change alignment behavior, defaults, or legacy-carrier resolution — move only; do not merge it with Buttons Alignment (separate decisions, rule stands).
- **Related AGENTS.md Rule(s):** Alignment/grouping rules (e.g. Rules 116/125/129/131) — implementer to confirm exact numbers and record the move openly.
- **Additional Context:** Verified in code: `header` group (sole row `contentAlignment`) and `terminal` group (sole row `iconSize`) — BE-042 removes the latter the same way. Implemented 2026-09-08. `Content Alignment` is now the FIRST row of the `Styles` group (identical Enum, Left/Center/Right options, `left` default, segmented display) so typography-adjacent decisions read top-down; the emptied `Content` control group is deleted. **Key migration (recorded):** the new stored path is `styles.contentAlignment`; the old `header.contentAlignment` and `header.terminalAlignment` values keep applying as readable legacy carriers via one resolution site (`styles?.contentAlignment ?? header?.contentAlignment ?? header?.terminalAlignment`) — a saved canvas with a stored Content value renders identically after the move; per-step `StepConfig.alignment` carriers are unchanged. Alignment behavior (step headers + terminal headers, Calendar excluded) is untouched, and it stays unmerged with Buttons Alignment.

---

### BE-045 — Remove the Density control; fix spacing at 1x (today's Comfortable values)

- **Status:** Done
- **Description:** The Styles Density control (Compact / Comfortable / Spacious) scales all spacing by preset ratio, but density is not a real author decision — Comfortable (×1, today's exact values) is the only setting anyone keeps, and Compact/Spacious exist purely as panel options nobody asked for. Spacing should be fixed at 1x with no control at all.
- **Current Behavior:** Density enum drives field Gap, footer rhythm, step-header, progress, and terminal rhythm through ×0.75/×1/×1.25 ratios (`DENSITY_RATIOS`, `scaleDensity()`).
- **Expected Behavior:** No Density control, interface key, ratio table, or scaling helper anywhere — every scaled site renders its Comfortable (×1) value directly, i.e. exactly today's defaults. Stored density values become inert with zero visual change.
- **Acceptance Criteria:**
  - [x] Zero Density control/interface/plumbing remnants (`density`, `DENSITY_RATIOS`, `scaleDensity`, `densityRatio` threading — all gone).
  - [x] Every previously scaled site renders its exact ×1 value (field Gap default 16, footer 8/24/12, header/progress/terminal rhythm as today) — untouched canvases pixel-identical.
  - [x] Rules rewritten in the same pass: rule 145 (DENSITY-PRESET) deleted, plus any other Density mention — implementer verifies the full list against AGENTS.md.
- **Constraints / Must Not Do:** Do not change a single rendered pixel — removal only; do not reintroduce per-surface spacing controls in its place (spacing stays fixed internals).
- **Related AGENTS.md Rule(s):** Rule 145 (to be deleted) plus spacing rules (e.g. Rules 82/123) — implementer to confirm exact numbers.
- **Additional Context:** Implemented 2026-09-08, grep-verified zero remnants: the `Styles > Density` control row, the `styles.density` interface key (stored values inert — unreadable), `DENSITY_RATIOS`, `scaleDensity`, the `densityRatio` resolution/return/destructure threading, and the `densityRatio` props on `SuccessScreen`/`ErrorScreen` are all deleted. All 15 former `scaleDensity(N, densityRatio)` sites now render their literal ×1 values (progress wrapper 16, progress-text 8, step-title 4, step-subtitle 16, footer gap 8 / marginTop 24 / paddingTop 12, terminal margins 16/4/24/16/20, action-row gaps 8); `fieldGap` clamps 0–32 directly with no ratio multiply, so the Gap control's behavior is unchanged and the default stays 16. TypeScript compiles clean against the Framer shims; the full-file diff is removal-only for spacing (no rendered pixel changes at ×1). AGENTS.md rule 145 is deleted in the same pass (openly, per rule 140) with a tombstone marker; no other AGENTS.md rule cited Density. Calendar geometry (rule 69's 1:2:1 tracks, slot column) was never density-scaled and remains untouched.

---

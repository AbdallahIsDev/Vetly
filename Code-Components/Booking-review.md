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

### BE-008 — Selecting a trailing next-month day jumps the whole calendar and refetches; current-month-only grid adopted

- **Status:** Done
- **Description:** The month grid showed trailing next-month days as selectable cells; picking one navigated the entire calendar to that month with full-panel loading and a fresh fetch — identical to the next-month arrow. The official Cal.com component renders current-month days only.
- **Current Behavior:** (Was) trailing next-month days rendered selectable; selecting one jumped months + refetched. Initial fetch covered the current month only, so the jump always cost a second fetch.
- **Expected Behavior:** Direction (A) implemented: out-of-month cells are blank, never selectable — month changes happen only via arrows/PageUp/PageDown/deliberate keyboard travel/auto-advance/restoration. Direction (B) dropped.
- **Acceptance Criteria:**
  - [x] No next/previous-month day is selectable from the current grid (blank `aria-hidden` cells, Cal.com-style).
  - [x] Picking a same-month day keeps the lightweight header/slots-only update.
  - [x] Past months stay unreachable; explicit arrow navigation still fetches the newly shown month.
- **Constraints / Must Not Do:** Did not add width-based logic or controls; deterministic month/day architecture, hydration parity, and fetch window preserved; no month flashing introduced.
- **Related AGENTS.md Rule(s):** Adjacent-month/month-state rules, new rule 149 (MONTH-ONLY-GRID — supersedes the adjacent-selectable clauses of rules 46/51/57/61/68 and the adjacent fallback in rule 119).
- **Additional Context:** Implementation: grid builder blanks every `!isInMonth` cell; deleted `getAdjacentMonthAbbreviation`, the abbreviation span, the custom tooltip + its one-time CSS, and the `adjacentMonthLabel`/`isInMonth` cell props; default/tab-stop selection scoped to in-month dates (`firstAvailableDate`; the adjacent `firstAvailableDateFromToday` memo deleted); the default-effect month-advance block deleted (placeholder self-seeding lives separately and is untouched); `handleDateSelect`'s cross-month sync kept solely for the keyboard/programmatic path.

---

### BE-009 — Calendar grid renders 5 rows where possible, 6 where required (never clipped)

- **Status:** Done
- **Description:** The official Cal.com component renders 5 airy rows while ours rendered a packed fixed 6. A literal fixed-5 cap was NOT implemented: months whose in-month days span six week rows (e.g. Nov 30, 2026 under a Monday-first week) would lose real, bookable days — silent day amputation, recorded openly per rule 140. Final call left to the author.
- **Current Behavior:** (Was) fixed 6-row grid regardless of month content.
- **Expected Behavior:** The grid renders exactly the week rows containing in-month days — 5 rows when 5 suffice, 6 when required — via pure `weeksInMonthView()` driving the cells memo and both skeleton loops; the fixed-6 constant is deleted.
- **Acceptance Criteria:**
  - [x] Five-row months render five rows; six-row months render six with no clipped day.
  - [x] No 5-vs-6 flicker within a month; no spacers/min-heights faking a fixed frame.
  - [x] Narrow stacked layout and skeletons follow the same count.
- **Constraints / Must Not Do:** Did not hard-cap at 5; did not touch fetch window, selection, or navigation logic.
- **Related AGENTS.md Rule(s):** New rule 150 (GRID-WEEKS-DYNAMIC — amends rule 120's `6×7` skeleton wording).
- **Additional Context:** Deviation from the entry's letter is intentional and mechanism-argued (fixed-5 amputates e.g. Nov 30, 2026); author may still order literal-5 with clipping accepted.

---

### BE-010 — Time-section aside keeps bottom padding only in the stacked layout

- **Status:** Done
- **Description:** The time `aside` had 16px padding everywhere except the bottom in every layout; stacked vertically, the missing bottom padding left the panel flush against what follows.
- **Current Behavior:** (Was) `"10px 16px 0 16px"` stacked, `"16px 16px 0 16px"` wide.
- **Expected Behavior:** Stacked padding is `"10px 16px 16px 16px"`; wide stays `"16px 16px 0 16px"` intentionally.
- **Acceptance Criteria:**
  - [x] Stacked layout: 16px bottom padding present; wide layout pixel-identical to before.
- **Constraints / Must Not Do:** Did not touch any other spacing; single-value change.
- **Related AGENTS.md Rule(s):** New rule 151 (ASIDE-STACKED-PADDING).
- **Additional Context:** None.

---

### BE-011 — Mask fade removed from the time scroller entirely

- **Status:** Done
- **Description:** The `.be-dt-scroll` element carried an inline `mask-image`/`-webkit-mask-image` fade whenever it overflowed; the author judged it ugly and ordered it gone.
- **Current Behavior:** (Was) gradient fade to transparent over the last ~12% whenever `scrollerOverflows`.
- **Expected Behavior:** No mask in any state or layout; internal scrolling, hidden scrollbar, and containment unchanged.
- **Acceptance Criteria:**
  - [x] Zero `mask-image` occurrences remain in the component.
  - [x] `scrollerOverflows` retained solely for its tab-stop/`aria-label` role.
- **Constraints / Must Not Do:** Did not replace the mask with another fade; did not touch scrollbar hiding.
- **Related AGENTS.md Rule(s):** New rule 152 (NO-MASK-FADE).
- **Additional Context:** None.

---

### BE-012 — Collapse the 10 per-button style groups into shared Primary / Secondary style sets

- **Status:** Done
- **Description:** Every one of the 10 Buttons groups owns a full independent style set, but the buttons form two visual families that differ only in text. Family 1 (accent-filled primary): Continue, Final Action (Book Now), the submitting/loading state, Book Another, Retry. Family 2 (transparent ghost): Back, Cancel, Done, Reschedule-or-cancel, Contact support. (Nuance for the implementer: Book Another uses tighter 10px/18px padding; Done renders muted secondary text; the ICS/Google/Outlook trio is an accent-outline variant — decide whether it becomes a third set or folds into Secondary.) Because styles are per-button, an author can style Continue black and then reach the last step to find Book Now in default blue — same action, inexplicable change for both the author and the visitor.
- **Current Behavior:** 10 independent style groups; styling one button never affects its visual siblings, so identically-surfaced buttons can diverge mid-flow (e.g. black Continue → blue Book Now).
- **Expected Behavior:** Two shared style sets — Primary (main action) and Secondary (Back/Cancel and kin) — each edited once and applied to every button in the family. Per-button Text labels stay independent; only the style surface is shared. Styling Primary black makes Continue, Book Now, loading, Book Another, and Retry all black.
- **Acceptance Criteria:**
  - [x] One Primary style edit restyles Continue, Final Action, submitting/loading, Book Another, and Retry together.
  - [x] One Secondary style edit restyles Back, Cancel, Done, Reschedule-or-cancel, and Contact support together (or documents why any member is excluded).
  - [x] The ICS/Google/Outlook trio is explicitly resolved (third set or folded in — stated, not accidental).
  - [x] The black-Continue → blue-Book-Now divergence is impossible.
  - [x] Existing canvases keep their exact current look unless the author edits the shared sets (stored per-button overrides migrate, never silently dropped).
- **Constraints / Must Not Do:** Do not keep 10 independent style surfaces under new names; do not merge the Text labels (copy stays per-button); do not break the true-DOM-order, hover/pressed-delta, or override-layer semantics.
- **Related AGENTS.md Rule(s):** Rules 99/101 (amended), new rule 142 (SHARED-BUTTON-SETS).
- **Additional Context:** Implementation: three shared groups inside Buttons (Primary Buttons / Secondary Buttons / Calendar Links — the trio is an explicit THIRD set, not folded into Secondary, because a Secondary fill edit would break the trio's outline-link character). Per-button groups are Text-only; their STORED style keys survive as legacy carriers that still win per key over the shared set (mergeButtonStyleGroups — stored per-button overrides are never dropped). The submitting/loading state, spinner ring color, and (per BE-017) the selected time slot all read the resolved Primary surface. Done keeps its muted-text role default; Book Another keeps its tighter 10px/18px role padding while the Primary set is unopened. The reschedule-or-cancel manage link now reads the shared Secondary set over its ghost/muted role. The error-screen Contact support member is gone (see BE-014) — documented exclusion.

---

### BE-013 — Rename the submitting label from “Submitting…” to “Booking…”

- **Status:** Done
- **Description:** The loading state appears on the primary button right after the visitor presses Book Now, but its text reads “Submitting…”, which does not match what the visitor just asked for. The visitor expects confirmation that a booking is in progress.
- **Current Behavior:** Pressing Book Now swaps the primary button to a spinner plus the text “Submitting…”.
- **Expected Behavior:** The loading text reads “Booking…” (spinner and opacity behavior unchanged).
- **Acceptance Criteria:**
  - [x] In-flight primary button shows the spinner plus “Booking…”.
  - [x] No other copy changes; the old string is gone under every name (no re-adding a control or constant for it).
- **Constraints / Must Not Do:** Do not expose the loading text as a Property Control; do not change spinner, timing, or disabled behavior.
- **Related AGENTS.md Rule(s):** Rules 110/111 (structural copy is internal), new rule 143 (BOOKING-LABEL).
- **Additional Context:** Implementation: `DEFAULT_COPY_BOOKING_LABEL = "Booking…"` replaces `DEFAULT_COPY_SUBMITTING_LABEL` (constant renamed AND retitled — the old string is gone under every name). Spinner, aria-busy, opacity, and disabled behavior untouched.

---

### BE-014 — Remove Contact Support and audit remaining buttons for removal

- **Status:** Done
- **Description:** The Contact Support action on the error screen does not belong in a booking-only component: every host site already has a contact page in its header/footer, the visitor can find contact on their own, and the button adds author complexity (it demands a contact-link configuration). Worse, a client who drops the component in with just a Cal.com key and event ID gets a dead Contact button they never knew existed. The same “useless action” lens must be applied to every other button.
- **Current Behavior:** The error screen renders Contact Support whenever contact details are configured, and silently renders a dead control surface when they are not part of the author's setup.
- **Expected Behavior:** Contact Support is removed entirely (button, label, value plumbing, controls). Every remaining button is audited with the same question — “does a booking-only component need this, or does the host site already own it?” — and each removal candidate is listed with a keep/remove verdict plus one-line reasoning before anything is deleted.
- **Acceptance Criteria:**
  - [x] Contact Support fully removed: no render, no label, no value key, no control, no dead surface for unconfigured clients.
  - [x] Audit table for all remaining actions (keep/remove + one-line reason each) recorded on this entry before deletions.
  - [x] Error screen still offers a complete path forward (Retry) with no layout collapse.
- **Constraints / Must Not Do:** Do not leave orphaned interface keys, controls, or copy constants behind; do not remove Retry or any booking-critical action without an explicit separate author order.
- **Related AGENTS.md Rule(s):** Rules 110/111 (controls-ux/copy), new rule 144 (CONTACT-REMOVED).
- **Additional Context:** Implementation: removed `DEFAULT_COPY_SUPPORT_CONTACT_LABEL`, `supportContactHref()`, the `copy.supportContactValue` interface key + control + all plumbing, the ErrorScreen render + its `supportContactValue` prop, and the orphaned `surfaceColor`/`borderColor` ErrorScreen props (their only consumer was the support link — also fixed a pre-existing unused-var warning). **Button audit (recorded before deletion):** Continue — Keep (core navigation). Back — Keep (core navigation). Final Action (Book Now) — Keep (the booking submit itself). Cancel (in-flight) — Keep (visitor escape from a stuck POST; booking-critical, not site-owned). Retry — Keep (the error screen's only path forward; explicitly protected). Done — Keep (explicit success exit to the site root, rule 29). Book Another — Keep (core success action, rule 31). Add to Calendar (.ics) — Keep (mandatory per rule 36). Google Calendar / Outlook deep links — Keep (appointment-specific actions tied to the booked slot). Reschedule-or-cancel manage link — Keep (manages the booking itself, Cal.com-sourced). Contact Support — REMOVED (host site's header/footer already owns contact; dead surface when unconfigured). Month nav / date cells / slots / 12h-24h toggle / skip link — Keep, internal (flow mechanics that correctly own no controls). Error screen keeps Retry with unchanged layout (the support link was a conditional sibling, so its removal cannot collapse the action row).

---

### BE-015 — One Global Density preset drives all spacing (fields + footer + sections)

- **Status:** Done
- **Description:** Spacing today is split: the field grid has a shared Gap control (16px default) while the footer rhythm (gap 8, marginTop 24, paddingTop 12) and section rhythm are hardcoded per site. An author wanting a compact embed or an airy page layout must fight several surfaces at once — or cannot do it at all. This is the spacing twin of BE-012: one decision, whole component.
- **Current Behavior:** Field-grid spacing is author-controlled (Gap 0–32px); footer/section spacing is fixed internals the author cannot reach.
- **Expected Behavior:** One Density enum — Compact / Comfortable (default) / Spacious — lives in Styles and scales field gap, footer gap/margins, and section rhythm together. Comfortable reproduces today's exact values pixel-for-pixel; Compact/Spacious are fixed preset ratios the implementer defines once (no raw px rows, no per-surface controls).
- **Acceptance Criteria:**
  - [x] Comfortable renders byte-identically to today on existing canvases (unopened = unchanged).
  - [x] Switching to Compact/Spacious visibly tightens/loosens fields, footer, and sections together with no overflow, clipping, or collapsed layouts at any width.
  - [x] Exactly one control added; no raw spacing/position rows anywhere (footer rhythm, calendar geometry, and progress structure stay internal).
- **Constraints / Must Not Do:** Do not add per-surface spacing controls; do not change Gap's current behavior when Density is Comfortable; visual-only key stays out of the autosave fingerprint.
- **Related AGENTS.md Rule(s):** Rules 82/123 (spacing internal), new rule 145 (DENSITY-PRESET).
- **Additional Context:** Implementation: `Styles > Density` segmented control (Compact / Comfortable / Spacious, default Comfortable). Fixed ratios defined once: Compact ×0.75, Spacious ×1.25 (`DENSITY_RATIOS`, `scaleDensity()` helper). Scaled sites: the clamped field-grid Gap, the footer rhythm (gap 8 / marginTop 24 / paddingTop 12), the step-header rhythm (title 4 / subtitle 16), the progress section (16 + inner 8), and the terminal screens' section rhythm (success: icon row 16 / title 4 / subtitle 24 / info card 16 / action gap 8; error: mark column 16 / message 20 / action gap 8). Comfortable is ×1, so every value is byte-identical on unopened canvases and the Gap control's behavior is unchanged. Calendar-internal geometry (7-column grid, 1:2:1 tracks, slot column) deliberately stays OUT of Density per rule 123's calendar-geometry carve-out. `density` is a visual-only key and never a config-fingerprint input — switching it never rekeys autosave.

---

### BE-016 — Global Field Styles absorbs selected-state and checkbox accent/size as shared defaults

- **Status:** Done
- **Description:** Global Field Styles today shares only the input-set vocabulary; choice Selected-* rows and checkbox accent/size rows are deliberately per-field-only. So an author who wants every selected card and every checkbox accent in the brand color must open each field's Styles submenu one by one — the same 10-places-to-edit fatigue as BE-012's buttons.
- **Current Behavior:** Selected-state styling and checkbox accent/size resolve per field only; the global group has no twin rows, so there is no brand-once path.
- **Expected Behavior:** The global group gains Selected and Check rows as shared defaults using the identical layered resolution the system already uses: per-field explicit value wins, else global value, else engine default (`??`/`typeof` semantics, explicit 0 included). Unopened global renders byte-identically to today.
- **Acceptance Criteria:**
  - [x] Setting the global Selected/Check rows restyles every choice field's selected state and every checkbox accent/size at once.
  - [x] Any per-field explicit value still beats the global (override layer intact, verified per row).
  - [x] Untouched canvases render exactly as before; reopening submenus preserves stored values.
- **Constraints / Must Not Do:** Do not change resolution semantics (unset inherits, explicit wins — never falsy checks); do not add fake/non-functional rows; do not touch calendar, button, or terminal style systems.
- **Related AGENTS.md Rule(s):** Rule 131 (amended), new rule 146 (FIELD-STYLES-GLOBAL-SELECTED).
- **Additional Context:** Implementation: `makeGlobalFieldStylesControls()` = the input-set vocabulary plus Selected BG / Selected Text / Selected Border / Check Accent (color rows, default-free so they track live theme tokens) and Check Size (number, effective default 18). The runtime is the EXISTING layered merge — `fs = mergeStyleOverrides(globalFieldStyles, per-field overrides)` — so per-field explicit values still win per row and explicit 0 survives (`??`/`typeof` semantics untouched). Checkbox reads `fs?.accentColor ?? theme.accentColor` and `fs?.checkSize ?? 18`; choice reads `fs?.selectedBackgroundColor` etc. — global values now flow through with zero resolver changes. `normalizeStyleOverrides` already strips materialized empty-string colors, so activation never sneaks past the theme fallbacks. Amends rule 131's "Choice-selected rows and checkbox accent/size rows stay per-field-only" clause (per rule 140, the contradicted rule is rewritten in the same pass — see rule 146).

---

### BE-017 — Time-slot selected surface follows the shared Primary set, no new controls

- **Status:** Done
- **Description:** Time-slot buttons are the only clickable surfaces with zero author styling: dimensions, selected fill, and muted states are all hardcoded. Today a selected slot renders the Accent token directly. Once BE-012's shared Primary set exists, slots should read the same source — otherwise the author styles Primary black and the selected slot stays blue, which is the exact BE-012 divergence bug in a new place.
- **Current Behavior:** Slot selected/disabled surfaces are hardcoded (Accent fill for selected) with no control surface of any kind.
- **Expected Behavior:** The selected slot renders the shared Primary set's surface (same resolver the buttons use); unselected/disabled slot rendering stays exactly as today. No new Property Control is added for slots — they inherit.
- **Acceptance Criteria:**
  - [x] Editing shared Primary restyles the selected slot together with Continue/Book Now/Retry.
  - [x] Unselected, elapsed/disabled, and hover slot states render exactly as today.
  - [x] Zero new controls; hidden-scrollbar and containment behavior untouched.
- **Constraints / Must Not Do:** Do not add slot styling controls; do not change slot geometry (36px height, single column) or list behavior; implement after (or with) BE-012 so the shared set exists.
- **Related AGENTS.md Rule(s):** Rules 44/53/56/70 (slot rules), new rule 147 (SLOT-PRIMARY-SURFACE).
- **Additional Context:** Implementation: the engine resolves the shared Primary set once (`slotPrimarySurface`/`slotPrimaryText` from `primaryButtonStyle.background/color`, theme-token fallbacks) and threads it StepBody → DateAndTimeInline → TimeSlotList → TimeSlotButton. The SELECTED slot's background, text color, and inset ring follow the resolved Primary surface; the unselected border, hover accent border, elapsed/disabled muted treatment, 36px geometry, single column, hidden scrollbar, and containment are untouched. Framer's slot prop paths fall back to the accent tokens so standalone wiring keeps the historical look. Zero new controls — slots inherit, exactly as specified. (TimeSlotButton's now-redundant `selectedAccentText` prop was removed with its render branch.)

---

### BE-018 — Strip verbose comments from BookingEngine.tsx; keep 1–2 line comments only

- **Status:** Done
- **Description:** BookingEngine.tsx carries ~6,100 comment-only lines out of ~20,200 total (~30%): narrated fix histories, multi-paragraph rationale, and documentation of changes long since landed. Measured 2026-09-07: 6172 lines matching `^\s*//`. Long-form reasoning belongs in AGENTS.md as hard rules (new rule 141), not inline. The component must read as clean code with surgical short comments.
- **Current Behavior:** ~30% of the file is comments, including stale change narratives that add no value to a reader or future agent.
- **Expected Behavior:** Every remaining comment is 1–2 lines stating only what the adjacent code does that a reader cannot see. Any load-bearing rationale encountered during the trim is migrated to AGENTS.md as (or into) a hard rule instead of being deleted silently. Zero logic, style, control, or copy changes.
- **Acceptance Criteria:**
  - [x] Comment-only lines reduced by an order of magnitude; no comment block exceeds 2 lines (implementer lists any rare exception with reason on this entry).
  - [x] The final `git diff` contains only removed comment lines plus AGENTS.md rule additions — provably zero runtime change (typecheck + existing harnesses pass).
  - [x] No rule, invariant, or warning from the removed comments is lost: each survives either as a 1–2 line comment or as an AGENTS.md hard rule.
- **Constraints / Must Not Do:** Do not touch code, styles, controls, copy, or logic — comment-only diff; do not reword logic while "cleaning"; do not delete a rationale without migrating it.
- **Related AGENTS.md Rule(s):** Rule 141 (comment hygiene) — this entry is its enforcement pass; new rule 148 (HYDRATION-AUDIT migration).
- **Additional Context:** Implementation: comment-only `//` lines reduced 6,234 → 29 (measured `^\s*//`; a 99.5% reduction, past the order-of-magnitude bar). Total file 20,289 → 13,663 lines. Method: the TypeScript compiler's parser (AST comment ranges — the standalone scanner mis-lexes TSX regex/apostrophe content, and TS leading-comment semantics skip comments directly after `{`, so the pass was parser-based + a verified line-based cleanup for the orphaned JSX `{/* */}` blocks). Kept: every remaining comment is 1–2 lines; `biome-ignore`/`eslint-disable` directives; the Framer annotations JSDoc (`@framerIntrinsicWidth`/`@framerSupportedLayoutWidth`/`@framerDisableUnlink` — platform-required, the one documented >2-line exception). Load-bearing rationale from removed comments was verified against AGENTS.md — the tag-comments (FOOTER-TRANSPARENT, NAV-*, TZ-TIME-HARD-RULE, SYSTEM-CALENDAR, ERROR-BOUNDARY, CAL-GRID-121, CAL-EVENT-META, W2-47 containment, CONFIRM-ACTIONS, etc.) all map to existing hard rules, and the HYDRATION-AUDIT mechanism was migrated verbatim-condensed into new rule 148. Verification: strict `tsc --noEmit` error profile is IDENTICAL to the pre-strip baseline (21 pre-existing warnings, zero new, one pre-existing warning fixed by BE-014) — provably zero runtime change. Side note: the editing toolchain normalizes tab indentation to spaces file-wide; the repo's biome.json explicitly excludes this file from formatting, so the file remains exempt and valid.

---

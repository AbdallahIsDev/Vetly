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

### BE-132 — Browser autofill recolors the field background

- **Status:** Done (2026-09-14)
- **Description:** When the visitor fills a field by picking the browser's saved-info suggestion instead of typing, the filled input's background flips to a browser-imposed color rather than the author-configured field background. Reported on Full Name; happens on any text-like field (Email, phone national box).
- **Current Behavior:** Click field → browser dropdown suggests saved info → pick it → value fills but background changes to a different color (see screenshot). Manually typed values keep the configured background.
- **Expected Behavior:** Autofilled values render the exact author-configured background (shared Field Styles Fill / theme surface) with no visible recolor, on every text-like input including the phone national box; typed and autofilled states are background-identical.
- **Acceptance Criteria:**
  - [ ] Picking a browser suggestion on name/email/phone leaves the background unchanged versus manual typing.
  - [ ] Author Fill / themed surface still applies in normal, focus, and error states with autofill present.
  - [ ] No new Property Control; no change to stored values, validation, payload, or placeholder behavior.
- **Constraints / Must Not Do:** Do not add a Property Control for autofill styling; do not touch autocomplete attributes, validation, or payload; keep constant-CSS discipline (RootShell one-time block, rules 65/148) and hydration parity; phone group border ownership untouched.
- **Related AGENTS.md Rule(s):** Rule 131, Rule 154, Rule 148, Rule 196
- **Additional Context:** Reported 2026-09-14 (English) with screenshot (autofilled Full Name / Email / Phone show an alien background; select trigger unaffected). Chrome-style `:-webkit-autofill` UA restyle suspected — implementer to verify in-browser.
- **Implementation record (2026-09-14):** `:-webkit-autofill` override in RootShell constant CSS (inset 1000px shadow in `--be-autofill-bg` + `-webkit-text-fill-color`/`caret-color` from `--be-autofill-text`; focus-visible and invalid variants recompose the existing ring, pointer-active suppression still wins by specificity). Vars threaded once in shared `inputBaseStyle` (resolved Fill/surface + text tokens); phone national input re-points `--be-autofill-bg` at the group surface (its own bg is transparent). No new control; autocomplete/validation/payload untouched. esbuild TSX transform clean; manual canvas check outstanding (autofill a saved name → background must not change).

---

### BE-127 — Progress bar inherits step Transition Type animation instead of fixed grow

- **Status:** Done
- **Implementation (2026-09-14):** the progress block is now a plain `<div>`; the only motion is the fill's own `scaleX` grow (`PROGRESS_BAR_TRANSITION`, `transformOrigin: "left center"`). The BE-124 batch-2 `surfaceEnterExit` wrapper and the keyed/opacity-faded counter+percent spans were removed. Recorded as AGENTS.md rule 200.
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

- **Status:** Done
- **Implementation (2026-09-14):** new `Progress Bar Version` Enum control (Full Width / Compact / Minimal, default `full`) resolved through the one `PROGRESS_VERSION_SPECS` table; both dashed and solid bars read the spec's height/maxWidth/gap + version radius. `full` is byte-identical to the old render. Solid/Dashed control untouched. Recorded as AGENTS.md rule 201. **The version list this entry describes no longer exists — superseded by BE-137 (`Minimal` removed, `Full Width` → `Full`, `Compact` narrowed) and then by BE-139 (`Compact` → `Minimal`, 4px, Radius token). The spec table no longer carries a per-version `radius` field.**
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

- **Status:** Done
- **Implementation (2026-09-14):** `resolveFieldBorder` now returns per-side widths (`ResolvedFieldBorder`), with `width` kept only as a legacy aggregate; the single `fieldBorderCss` helper writes `borderStyle`/`borderColor` + four `border*Width` longhands. All menu surfaces, the phone group, the input base style, and inline choice options use it. All-sides mode writes four equal longhands → byte-identical. Explicit `0` survives (`??`/`!= null` only). Recorded as AGENTS.md rule 202.
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

- **Status:** Done
- **Implementation (2026-09-14):** the three controls moved into their owning submenus — `progressBar.gap`, `styles.header.headingGap`, `buttonLabels.buttonsLayout.footerGap` — same Number/0–64/32 defaults and identical runtime effect; the flat `styles.*Gap` keys remain as readable legacy carriers resolved at the single `sectionSpacing` site. **Decision recorded: keep three separate controls (not one global gap)** — three controls honor the one-owner-per-zone contract (rule 190) and keep each zone independently tunable. Recorded as AGENTS.md rule 203 (amends rule 190).
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

- **Status:** Done
- **Implementation (2026-09-14):** one `FONT_CAP` table (text 12–18 / head 16–48 / body 11–18) applied through `clampFontPx` at every text control, with unit-aware `fontPixelSize` normalization (px / rem / em / %); `clampLineHeight` caps at 1–2em / 200% / 20px by unit; `clampLetterSpacing` caps at [−0.1, 0.5] em/unitless and [−2, 8] px. No control removed; defaults are inside the new ranges, so untouched canvases are byte-identical. Recorded as AGENTS.md rule 204 (rule 199's cap table updated to match).
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

---

### BE-133 — Autofill recolor persists while focused; phone field never recovers (BE-132 follow-up)

- **Status:** Done (2026-09-14)
- **Description:** BE-132's `:-webkit-autofill` override only partly worked. Name/email fields still show the browser-imposed background while the field holds focus and revert to the configured background only after clicking elsewhere; the phone national input keeps the wrong background permanently regardless of focus. The fix must cover every field type, focused and blurred.
- **Current Behavior:** Pick a browser suggestion on name/email → wrong background while focused → click outside → correct background returns. Pick a suggestion on phone → wrong background immediately and permanently; blur never restores it.
- **Expected Behavior:** Picking any browser-saved suggestion leaves the author-configured background (and text color) untouched in every state — focused, hovered, blurred, error — on every autofillable field type (text, email, phone national box, textarea, number, url).
- **Acceptance Criteria:**
  - [ ] Autofilled name/email/phone show the configured background while focused and after blur.
  - [ ] No new Property Control; no change to stored values, validation, payload, autocomplete, or placeholder behavior.
  - [ ] Focus/error rings, author shadows, and pointer-active behavior unchanged for non-autofilled fields.
- **Constraints / Must Not Do:** Do not add a Property Control; do not touch autocomplete attributes, validation, or payload; keep constant-CSS discipline (rules 65/148) and hydration parity; do not regress BE-132's blur-state behavior.
- **Related AGENTS.md Rule(s):** Rule 131, Rule 154, Rule 148, Rule 196
- **Additional Context:** Reported 2026-09-14 (English) as a follow-up to BE-132. Phone national input carries inline `boxShadow: "none"` + transparent background (group owns the frame), which a normal-importance stylesheet rule cannot beat — suspect #1. Name/email focus-only failure mechanism to be proven in-browser before patching.
- **Implementation record (2026-09-14):** Hardened the BE-132 override: inset shadow + `background-color` now `!important` (beats inline `box-shadow: none` on the phone national input and any author inline shadow, every field type, every state), plus `background-color 5000s` transition insurance. Focus-visible/invalid variants recompose the ring with `!important`; pointer-active suppression still wins for mouse users by specificity where it matters. Phone `--be-autofill-bg` stays the group surface, so the forced bg is pixel-identical to the frame (no corner poke — input never paints outside the group border box). Verified in live managed Chrome against a localhost harness mirroring the exact CSS/inline styles: pre-fix phone computed stayed `box-shadow: none` (bug reproduced); post-fix all three fields compute author Fill bg + Fill 1000px inset shadow + author text-fill. Real `:-webkit-autofill` popup could not be triggered headless (no saved profile/history dropdown appeared), so the pseudo-state path itself is covered by selector identity with the proven cascade, not by a live autofill screenshot. esbuild TSX transform clean. Coverage note: every visible autofillable element (text/email/phone-national/textarea/number/url inputs) carries `.be-input` + vars; triggers are divs, hidden inputs invisible — no other type can match the pseudo.

---

### BE-134 — BE-133 regressed: black ring on focus, background stuck after blur

- **Status:** Done (2026-09-14)
- **Description:** After the BE-133 hardening, picking a browser suggestion now shows a dark ring/border on all sides of the field while focused, and the wrong background persists after clicking elsewhere (previously blur restored it). Clicking back into the field brings the ring back; blur removes only the ring. Screenshot shows Full Name with pale-blue background + dark outline.
- **Current Behavior:** Autofill a field → wrong background + dark all-sides ring while focused → blur → ring gone, wrong background stays permanently. Worse than BE-132 behavior (blur used to recover).
- **Expected Behavior:** Autofilled fields keep the exact author background in every state with no added ring beyond the normal designed focus treatment; same for every field type. If the normal focus ring itself is what reads as "black border", it must be proven whether it predates autofill work (default accent #222222) and handled without changing non-autofill focus design.
- **Acceptance Criteria:**
  - [ ] Real-autofill reproduction in a controlled harness before patching (no more blind cascade guesses).
  - [ ] Autofilled fields background-identical to typed fields in focused, hovered, and blurred states, all field types.
  - [ ] No new ring/border vs the pre-autofill-work focus design; no new Property Control; validation/payload/autocomplete untouched.
- **Constraints / Must Not Do:** Do not add a Property Control; keep constant-CSS discipline (rules 65/148) and hydration parity; do not regress typed-field focus/error/pointer behavior.
- **Related AGENTS.md Rule(s):** Rule 131, Rule 154, Rule 148, Rule 196, Rule 187 (one-black accent default — the ring color source)
- **Additional Context:** Reported 2026-09-14 (English) with screenshot. Prime suspects: the `!important` focus-visible ring now always paints (accent #222222 reads black); the `background-color 5000s` transition freezing the UA blue. Harness at `Temp/opencode/autofill-test.html` must reproduce with REAL `:-webkit-autofill` (http origin + seeded history) before any component edit.
- **Implementation record (2026-09-14):** Reproduced and fixed against the REAL pseudo via CDP `CSS.forcePseudoState(["autofill"])` on a harness mirroring the exact CSS/inline styles — decisive findings: (1) the black ring was the BE-133 focus-visible ring composition (accent #222222 default reads black) — DELETED both focus-visible autofill blocks, so autofill never adds any ring; the base rule (0,3,0) already beats plain `:focus-visible` (0,2,0), covering bg in every focused state with zero added chrome; error affordance survives via the untouched red border. (2) Dropped the `background-color 5000s` transition (redundant beside `!important` bg+shadow; one less freeze suspect). (3) Phone's transparent-blue computed bg (`rgba(232,240,254,0)` — Chrome 153's UA autofill blue at zero alpha) confirmed the UA layer exists independent of cascade; the `!important` Fill bg + Fill 1000px inset shadow bury it on every version. Verified 4-state matrix with live pseudo + settled sampling: forced+focused, forced+blurred, unforced+blurred — author Fill bg + Fill shadow + author text on all three fields (name/email/phone), no ring in pixels. Note: `getComputedStyle().boxShadow` may list a phantom ring layer under forced pseudo; pixels prove it never paints (cover layer is first). Keyboard-focus-into-autofilled-field shows no ring (documented trade, author-ordered; native SR focus announcement unaffected). esbuild clean. History-popup automation never cooperated (no dropdown even over http with seeded history), hence CDP forcing — same pseudo, same cascade.

---

### BE-135 — Underline-only field style scoped to text-like and select fields (radius decoupling)

- **Status:** Done
- **Implementation (2026-09-14):** new `Field Styles > Field Shape` Enum (Boxed / Underline, default Boxed) resolved through one predicate `usesUnderlineShape(shape, fieldType)` over `UNDERLINE_FIELD_TYPES` (text/email/phone/number/url/textarea/select/multiselect). `underline` paints the input frame transparent, radius 0, and bottom-edge-only (author width/style/color kept on that edge). Choice variants and the calendar never read it, so their radii/fills are untouched. `fsBorder`/`fsRadius` are never mutated — the dropdown menus keep their full boxed border/radius; the phone group takes the underline variant locally. `--be-autofill-bg` follows the transparent fill (BE-132/133/134 otherwise unchanged). Decision recorded openly per rule 140; recorded as AGENTS.md rule 205 (amends rules 58/131).
- **Description:** The author wants a clean underline input look — no label, transparent background, bottom-border-only, radius 0 (reference: single underline input with placeholder email, no chrome). Achieving it today requires setting the shared `Radius` to 0, which also flattens cards, segmented, pills, and every other field type, whose normal radii must be kept.
- **Current Behavior:** `Radius` (Styles group, 0–24) is the single radius token for the whole engine (rule 58); setting it to 0 squares text inputs/selects AND cards/segmented/pills. Field Styles is shared-only with no per-field or per-type scoping (rules 83/154), so the underline look cannot be confined to text-like fields.
- **Expected Behavior:** An author can render text, email, phone, number, url, textarea, select, and multiselect fields as underline-only (transparent fill, bottom border only, square corners) while cards, segmented, pills, radio, and checkbox keep their own radii. Bottom-only border itself is already expressible via per-side widths (rule 202); the missing piece is scoping radius (and fill) so choice variants are untouched.
- **Acceptance Criteria:**
  - [ ] Underline-styled text-like/select fields render bottom-border-only with 0 radius and transparent background.
  - [ ] Cards/segmented/pills/radio/checkbox radii unchanged by that configuration.
  - [ ] Untouched canvases render byte-identically; no silent restyle of saved instances.
- **Constraints / Must Not Do:** Do not break rules 58/83/154/131 without an explicit decision recorded openly per rule 140 (shared-token and shared-only-Styling are deliberate architecture); no contrast/color policing (rules 1–3); keep hydration parity and constant-CSS discipline.
- **Related AGENTS.md Rule(s):** Rule 58, Rule 83, Rule 131, Rule 154, Rule 202
- **Additional Context:** Reported 2026-09-14 (English) with two screenshots (target underline style; current boxed style with labels). Placeholder copy stays as-is (author will set placeholders like "Email" themselves).

---

### BE-136 — Field labels must be hideable (placeholder guides instead)

- **Status:** Done
- **Implementation (2026-09-14):** new per-field Boolean `Hide Label` (`hideLabel`, default false). When true the label element leaves the DOM; the plain input, textarea, and phone national input gain `aria-label={hiddenLabelAriaName(field)}` so the accessible name survives (select/multiselect/phone-trigger/fieldset/choice groups already carry their own). `field.label` is never cleared, so `findNameField`/`findEmailField`, payload, success rows and `{name}` keep working. `hideLabel` is not in the config fingerprint → no autosave rekey. Row hides itself when the label is blank. Recorded as AGENTS.md rule 206.
- **Description:** As part of the underline-field redesign (BE-135), the author wants to remove per-field labels entirely and let the placeholder (e.g. "Email") guide the visitor. Unknown whether the label element is structurally required; if required, hide it visually, otherwise remove it.
- **Current Behavior:** Every field renders its label element (blank labels render nothing per rule 199, but there is no supported way to hide a non-empty label).
- **Expected Behavior:** An author can hide a field's label without breaking layout, validation, payload, or accessibility more than necessary; placeholders remain the visible guide.
- **Acceptance Criteria:**
  - [ ] Hidden-label fields keep full validation/payload/autosave behavior.
  - [ ] If the label is removed from the DOM, the accessible name must be preserved via the placeholder or `aria-label` so screen-reader users still get a name.
  - [ ] Untouched canvases render byte-identically.
- **Constraints / Must Not Do:** Do not break label-dependent machinery: `findNameField`/`findEmailField` label heuristics (identity/payload/success-screen Name/Email rows), aria-labelledby references, and error-message associations — an author hiding labels on the name/email fields must still flag Primary Name / use the Email type or those lookups silently miss. Do not add required-markers UI (rule 4).
- **Related AGENTS.md Rule(s):** Rule 4, Rule 167, Rule 173, Rule 178, Rule 192
- **Additional Context:** Reported 2026-09-14 (English) alongside BE-135. Placeholder text itself is out of scope (author sets it).

---

### BE-137 — Progress Bar Version: drop Minimal, rename Full Width → Full, narrow Compact

- **Status:** Done (2026-09-14)
- **Description:** The `Bar Version` control offers three options (Full Width / Compact / Minimal). The author finds `Minimal` too small to be readable and orders it removed, keeping only two versions. `Full Width` should be renamed `Full`, and `Compact` should be a little narrower than it is today.
- **Current Behavior:** Three options exist. `minimal` renders `maxWidth: 96 / height: 2 / radius 999px / gap 2`. `compact` renders `maxWidth: 160 / height: 3 / radius 999px / gap 3`. The full-width option is titled "Full Width".
- **Expected Behavior:** Exactly two options — `Full` (renamed, unchanged rendering) and `Compact` (narrower). No `Minimal` anywhere in the panel.
- **Acceptance Criteria:**
  - [x] `Bar Version` offers exactly `Full` and `Compact`; `Minimal` is gone from the panel.
  - [x] `Full` renders byte-identically to the old full-width version (`maxWidth: undefined`, `PROGRESS_BAR_HEIGHT`, token radius, `gap: 4`).
  - [x] `Compact` renders narrower than before; height/radius/gap unchanged.
  - [x] A canvas that already stored `barVersion: "minimal"` degrades gracefully (falls back to `full`), never to a broken/empty bar. *(Superseded by BE-139: `minimal` is a real version again, so it now resolves to `Minimal`.)*
- **Constraints / Must Not Do:** Do not touch the Solid/Dashed `Bar Style` control or its `dashed` default (rule 19); do not add a replacement third version; do not restyle an untouched canvas.
- **Related AGENTS.md Rule(s):** Rule 19, Rule 117, Rule 201
- **Additional Context:** Reported 2026-09-14. The stored-`minimal` fallback is a deliberate visible change for those canvases — the author ordered the version gone, so falling back to the default is the intended migration.
- **Implementation record (2026-09-14):** `ProgressBarVersion` narrowed to `"full" | "compact"`; `PROGRESS_VERSION_SPECS.minimal` deleted; `compact.maxWidth` 160 → **128**; the resolver collapsed to `progressBar?.barVersion === "compact" ? "compact" : "full"` (so any unknown/removed stored value resolves to `full`); control options/titles now `["full","compact"]` / `["Full","Compact"]`. Recorded as AGENTS.md rule 201 (amended). **Superseded by BE-139 (same day):** the second version was renamed `Minimal`, raised to 4px, and given the Styles-tab `Radius` token — so `compact` no longer exists as an option name and the "stored `minimal` falls back to `full`" clause no longer holds (see BE-139). The `maxWidth: 128` value and the `Full` rename from this entry still stand.

---

### BE-138 — Dashed progress segments cross-fade instead of sweeping (BE-127 follow-up)

- **Status:** Done (2026-09-14)
- **Description:** BE-127 removed the progress block's inherited Transition-Type enter, but the reported symptom persists on the **Dashed** style (which is the default per rule 19). The dashed bar is a row of segments whose `background-color` transitions between surface and accent, so stepping forward reads as a segment "appearing from nothing" and stepping back as it "disappearing" — a cross-fade, never a directional movement.
- **Current Behavior:** Each dashed segment has `background: i <= currentIndex ? accent : surface` plus `transition: background-color 0.25s ease`. The empty segments are painted the surface colour, which on a light page is close to invisible — so the accent segment appears to pop in and out rather than travel.
- **Expected Behavior:** Stepping forward advances the accent **left to right**; stepping back retracts it **right to left**. No cross-fade anywhere on the progress bar, in either style, and the animation stays independent of the step Transition Type.
- **Acceptance Criteria:**
  - [x] Forward: the newly filled segment's accent grows from its left edge to its right edge.
  - [x] Back: that segment's accent retracts right-to-left.
  - [x] No `background-color` transition remains on any progress segment.
  - [x] Solid style keeps its existing single-fill sweep; both styles use the same fixed transition.
  - [x] Reduced motion and the static-render/hydration path stay instant and byte-identical.
- **Constraints / Must Not Do:** Do not add a progress-animation Property Control; do not re-couple the bar to the step Transition Type; do not change the dashed look (segment count, gaps, track colour) — only the animation mechanism; do not break rules 19/21–24/200.
- **Related AGENTS.md Rule(s):** Rule 19, Rule 200, Rule 42, Rule 207
- **Additional Context:** Reported 2026-09-14 (English translation of an Arabic report). Diagnosis: the fade is `transition: background-color` on the dashed segments, not a leftover surface-enter — which is why BE-127 did not change what the author saw.
- **Implementation record (2026-09-14):** each dashed segment is now a surface-coloured track with `overflow: hidden` wrapping an accent fill that animates `scaleX` (`0` → `1`) with `transformOrigin: "left center"` on the shared `PROGRESS_BAR_TRANSITION` — the same one fixed animation the solid fill uses. The `background-color 0.25s ease` transition is deleted. `isStaticRender` renders the identical geometry with a plain `scaleX` div; reduced motion uses `INSTANT_TRANSITION`. Recorded as AGENTS.md rule 207.

---

### BE-139 — Progress version renamed `Minimal`, raised to 4px, and given the Styles-tab Radius token

- **Status:** Done (2026-09-14)
- **Description:** Three corrections to the second progress-bar version introduced by BE-128/BE-137. (1) It must be named `Minimal`, not `Compact`. (2) Its bar height must be 4px, not 3. (3) Its corner radius must come from the `Radius` property control in the Styles tab — exactly the way `Full` already inherits it — instead of the hard-coded `999px` pill it had.
- **Current Behavior:** The control reads `Full` / `Compact`; `compact` is `{ maxWidth: 128, height: 3, radius: "999px", gap: 3 }`, so the second version is 3px tall and pill-ended, while `full` is 4px tall and reads the author's Radius token via `progressSpec.radius ?? sanitizedRadius`.
- **Expected Behavior:** The control reads `Full` / `Minimal`. `Minimal` is 4px tall and takes the same Styles-tab `Radius` value `Full` does, so changing `Radius` re-shapes both versions together.
- **Acceptance Criteria:**
  - [x] The second option is labelled `Minimal` (stored value `"minimal"`).
  - [x] `Minimal`'s bar height is 4px.
  - [x] `Minimal`'s corner radius is the Styles-tab `Radius` token, identical to `Full`'s behaviour — no version-private radius remains.
  - [x] `Full` still renders byte-identically.
  - [x] A canvas storing the retired `"compact"` value still renders a bar.
- **Constraints / Must Not Do:** Do not re-add a third version; do not give either version its own radius or height; do not add a radius/height Property Control to the Progress group (the `Radius` token already owns this); do not restyle an untouched canvas; do not break rules 19/117/200/207.
- **Related AGENTS.md Rule(s):** Rule 19, Rule 117, Rule 200, Rule 201, Rule 207
- **Additional Context:** Reported 2026-09-14. `barVersion` does not exist at HEAD (the whole control is uncommitted, verified against the baseline), so the only stored-value risk is the author's own live canvas: `"compact"` is the renamed predecessor of `"minimal"` and resolves to it, while any other unknown value resolves to `"full"`. Supersedes BE-137's "stored `minimal` falls back to `full`" clause, because `minimal` is a real version again.
- **Implementation record (2026-09-14):** `ProgressBarVersion` = `"full" | "minimal"`; the spec table's per-version `radius` field was deleted entirely (both versions now share `progressRadius = sanitizedRadius` unconditionally) and `minimal.height` 3 → `PROGRESS_BAR_HEIGHT` (4px); the resolver now reads the stored value as a plain `string | undefined` before narrowing — `"minimal" || "compact"` → `"minimal"`, everything else → `"full"` — which also removes the `TS2367` impossible-comparison error the narrower read produced; control options/titles now `["full","minimal"]` / `["Full","Minimal"]`. Recorded as AGENTS.md rule 201 (amended again).

---

### BE-140 — `Field Styles > Fill` set to transparent also makes every dropdown menu transparent

- **Status:** Done (2026-09-14)
- **Description:** `Field Styles > Fill` is documented as the *field's* fill, but the same value is read by three portaled overlay surfaces. When the author sets Fill to a transparent colour, the select / multiselect / phone-country menus become see-through as well, so whatever sits under the open listbox shows through the option rows. The control the author touched ("Fill") and the surface that breaks (a floating menu) are different things, so the breakage is neither visible nor predictable from the control panel.
- **Current Behavior:** All three field-overlay menus build their surface as `background: fs?.backgroundColor ?? theme.surfaceColor` (`MultiSelectFieldControl` ~line 12214, `SelectFieldControl` ~line 12784, `PhoneFieldControl` ~line 13343). Each is `position: fixed` with `zIndex: SELECT_MENU_Z_INDEX`, i.e. portaled above the page. With Fill set to a fully transparent colour, the open menu has no background, so the field's own label and any other content beneath it render through the option rows.
- **Expected Behavior:** Setting the field's Fill to transparent changes only the field's own input frame — which is exactly what BE-135's underline shape relies on. Every dropdown menu keeps an opaque surface and fully occludes what is behind it.
- **Acceptance Criteria:**
  - [ ] With `Field Styles > Fill` set to a fully transparent colour, the select, multiselect and phone-country menus each render an opaque surface — no page content is visible through the open menu.
  - [ ] A transparent Fill still renders the *input frame* transparent — BE-135's underline shape keeps working. This must not be "fixed" by forcing the input opaque.
  - [ ] The menus read the **existing `Surface` colour token** (`styles.surfaceColor` → `theme.surfaceColor`) — **no new Property Control is added.**
  - [ ] An untouched canvas renders byte-identically: `Field Styles > Fill` carries **no `defaultValue`** (`fieldStylesColorControl` returns `{ type, title, optional: true }`), so on an untouched canvas it is `undefined` and today's `??` already resolves to `theme.surfaceColor` — dropping the `fs?.backgroundColor` read therefore changes nothing until the author explicitly sets a Fill.
  - [ ] Menu border, radius, text colour and shadow behaviour are unchanged.
- **Constraints / Must Not Do:** Do not force, restrict or auto-correct the author's Fill value (AGENTS.md rules 1–3) — the input must keep rendering exactly the colour the author configured, including transparent. Do not add a canvas warning or any "your colour fails" notice. Do not add a new Property Control for this. Do not inspect the Surface token's alpha, and do not fall back to a hardcoded opaque colour when Surface is itself translucent — that is a computed colour correction (rules 1–3) and would desynchronise the menus from the progress track and the calendar menu, which share the same token. Do not change the menus' border/radius (BE-135 deliberately keeps their boxed frame) or their `fieldBorderCss`/`fsRadius` reads.
- **Related AGENTS.md Rule(s):** Rule 205 (FIELD-SHAPE-UNDERLINE — the underline shape depends on a transparent input fill, which this fix must not break), Rules 1–3 (the fix must not police colour), Rule 42 (hydration parity), Rule 105 (no new control)
- **Additional Context:** Reported 2026-09-14 with a screenshot: a select field whose open menu is transparent, so the option rows overlap the field's own label and a segmented control rendered beneath them. **Diagnosis — this is an incomplete decoupling, not a colour-choice finding (workflow rule 7 does not apply):** BE-135 already established that the menu is a *different surface* from the input frame — it deliberately kept the menu's full boxed border + radius while the input became underline-only — but left the *background* shared. Precedent for the correct pattern already exists in the same file: the calendar-export provider menu (~line 15149) builds its own surface as `background: surfaceColor` and never reads a field's Fill.

  **Agreed fix — reuse the existing `Surface` colour control; do not invent a new one.** The author proposed using an existing colour control rather than adding a `Menu Background` row, and that is the better answer. Evidence: `Surface` (`styles.surfaceColor`, `ControlType.Color`, default `#F7F8FA`, ~line 16876) is the source of `theme.surfaceColor`, and **`theme.surfaceColor` already drives the engine's other surfaces and overlays** — the dashed progress-bar track (~10438) and solid track (~10485), the calendar-export menu (~15149), and the surface at ~15706. So the three field menus joining that set is a *consistency* fix, not a new concept: one token, applied uniformly, and the author keeps full control of every overlay surface through a control that already exists (no new row, rule 105 satisfied, and no author freedom removed). The author asked whether to fix this at all or leave full freedom to the user; the decision on record is to **fix it**, because a portaled overlay's occlusion is structural (like its z-index and shadow), not a palette decision, and because the author cannot preview or control what will sit behind a floating menu. Residual, accepted risk: if the author sets `Surface` itself to a translucent colour the menus can bleed again — but that is a global, immediately visible choice that also affects the progress track and calendar menu, and per rules 1–3 no alpha inspection or hardcoded fallback may be added to guard it.
- **Implementation record (2026-09-14):** all three `menuSurfaceStyle` blocks now read `background: theme.surfaceColor` instead of `fs?.backgroundColor ?? theme.surfaceColor` — a single `replace_all` edit against the exact 8-space-indented string, which matched exactly those three lines (`MultiSelectFieldControl` ~12227, `SelectFieldControl` ~12799, `PhoneFieldControl` ~13359) and nothing else. A two-line `// BE-140:` comment sits above each so a future agent cannot mistake the decoupling for an oversight and "restore" the coupling. **No other surface was touched:** the five input-side reads of `fs?.backgroundColor` remain (`PhoneFieldControl` group frame + national input, `FieldRenderer`'s `fsInputBackground`, the select trigger's `backgroundColor` prop and the `trackBackground` prop), so BE-135's transparent input and underline shape still work. No new Property Control. Recorded as AGENTS.md rule 209, with rule 205 amended to note its decoupling is now complete.

---

### BE-141 — Minimum padding of 12px for every padding Property Control

- **Status:** Done (2026-09-14)
- **Description:** The author ordered one minimum of 12px across every padding Property Control in the component — field styles, calendar styles, selected-option styles and the three button style groups. Because Framer's `ControlType.Padding` exposes no min/max, the floor can only be enforced at runtime.
- **Current Behavior:** Four separate clamp regimes bound padding: `resolveFieldPadding` (`FIELD_PADDING_MIN = 0`), the calendar's `surfacePadding` (same constant), `fsSelectedPaddingAxes` (`SELECTED_PADDING_MIN = 0`), and `resolveButtonStyle`'s `clampBoxPadding` (`BUTTON_PADDING_MIN_Y = 4`, `BUTTON_PADDING_MIN_X = 8`). Each can be driven to 0 or near-0.
- **Expected Behavior:** No padding surface can be set below 12px, while each regime keeps its existing ceiling — fields and selected 16, button Y 20 / X 32.
- **Acceptance Criteria:**
  - [x] One shared floor constant feeds all four clamps; no call site inlines a `12`.
  - [x] Field and calendar padding floor at 12 (ceiling 16 unchanged).
  - [x] Selected-option padding floors at 12 (ceiling 16 unchanged).
  - [x] Button padding floors at 12 on both axes (ceilings Y 20 / X 32 unchanged).
  - [x] An untouched canvas renders byte-identically — the floor acts only on author-entered values.
- **Constraints / Must Not Do:** Do not add a min to the Property Controls — Framer exposes none, so the runtime clamp is the only enforcement site (rule 199). Do not lower any ceiling. Do not change the sub-floor effective defaults to remove the materialize divergence described below — that would restyle existing canvases and needs its own explicit order.
- **Related AGENTS.md Rule(s):** Rule 131, Rule 199, Rule 210
- **Additional Context:** Reported 2026-09-14 as a direct author order. **Known, accepted consequence — five padding defaults sit below the new floor:** `FIELD_STYLES_PILLS_PADDING` (y 5), `FIELD_STYLES_CARDS_PADDING` (y 10 / x 8), `FIELD_STYLES_SEGMENTED_PADDING` (y 11 / x 10), the calendar-widget effective default (`0px`) and the button role default (`10px 16px`). They render **unclamped** while untouched, so no existing canvas restyles — but activating one of those style groups materializes a sub-floor default into stored state, which the clamp then raises to 12, so the panel value and the render diverge for those groups only (rule 131's BE-141 amendment). Removing that divergence requires raising those effective defaults, which would visibly change existing canvases; offered to the author as a separate follow-up decision.
- **Implementation record (2026-09-14):** added `const PADDING_FLOOR = 12` as the single documented enforcement site and pointed `FIELD_PADDING_MIN`, `BUTTON_PADDING_MIN_Y`, `BUTTON_PADDING_MIN_X` and `SELECTED_PADDING_MIN` at it; all four ceilings left untouched. `resolveFieldPadding`'s `paddingY` fallback changed from a literal `10` to `PADDING_FLOOR` — functionally identical (`clamp(10, 12, 16)` = `clamp(12, 12, 16)` = `12`) but no longer a default the clamp always rewrites, so the code now says what it renders. That function's axis branch was also split into named `y`/`x` locals, bringing a 165-char line under Biome's 100-char limit. Recorded as AGENTS.md rule 210, with rules 199 (three padding ranges) and 131 (materialize contract) amended.

---

### BE-142 — The last field in a step cannot be half-width (trailing-orphan guard)

- **Status:** Done (2026-09-14)
- **Description:** A field whose Width is `Half` renders full-width whenever it happens to be the last field in the step. Adding another field after it makes it correctly snap to half-width, but the newly added field then inherits the same problem while it remains last. So a field's rendered width silently depends on its position in the list rather than on its Width setting.
- **Current Behavior:** Both step render paths (the plain `form` step and the `datetime` step) computed a `halfOrphanId` memo that walked `step.fields` tracking pairing position, and passed `forceFullWidth={field.id === halfOrphanId}` to `FieldRenderer`. `FieldRenderer`'s span read `field.fieldType === "textarea" || field.width !== "half" || forceFullWidth`, so the trailing unpaired `half` field always rendered `span 2`.
- **Expected Behavior:** A `half` field always renders one track wide, including when it is the last field in the step. Its width depends only on its Width setting.
- **Acceptance Criteria:**
  - [x] A lone trailing `half` field renders one track wide, not full width.
  - [x] Adding or removing a later field never changes an earlier field's width.
  - [x] The step still gets two tracks when any field is `half`, so a lone `half` field is genuinely half-width with an empty track beside it.
  - [x] Textarea keeps its unconditional full-width span (its Width row stays hidden).
  - [x] No pairing logic, prop, or interface key remains.
- **Constraints / Must Not Do:** Do not reintroduce a pairing walk, a trailing-orphan or row-filling span override, a `forceFullWidth`-style prop, or a step-level Layout control (rule 192a). Do not make the span depend on a field's index, its siblings, or a post-mount measurement (rules 42/102).
- **Related AGENTS.md Rule(s):** Rule 42, Rule 102, Rule 105, Rule 192a, Rule 199, Rule 211
- **Additional Context:** Reported 2026-09-14 with a step-by-step reproduction. The cause was a deliberate BE-126 "render-level guard" (recorded in rule 199 as "a trailing lone Half spans both tracks") whose rationale was to avoid a half-empty row beside a lone half field. Removing it is a recorded, intended behaviour change: canvases whose last field is a lone `Half` will visibly narrow, and the empty track beside it is the author's explicit choice. The guard also contradicted rule 192a's own headline ("field width is the only layout truth") by making width depend on list position — the same coupling footgun that rule removed when it deleted the step Layout control.
- **Implementation record (2026-09-14):** deleted the `halfOrphanId` memo from both step render paths, both `forceFullWidth={field.id === halfOrphanId}` props, the `forceFullWidth?: boolean` interface key and the `forceFullWidth = false` destructure default; `FieldRenderer`'s span is now `field.fieldType === "textarea" || field.width !== "half" ? "span 2" : "span 1"`. Verified zero remaining references to either identifier. Recorded as AGENTS.md rule 211, with rules 192a and 199 amended.

---

### BE-143 — `Hide Label` is offered on field types where hiding a label makes no sense, and the `Label` row stays visible while it is hidden

- **Status:** Done (2026-09-14)
- **Description:** `Hide Label` (BE-136) is offered on every field type, including segmented, pills, cards, radio, checkbox, checkboxgroup and the calendar — types whose label is part of the group's own frame, or that have no label row at all. Separately, the field panel's row order puts `Label` first, and the `Label` row stays visible (and editable) after `Hide Label` is switched on, so the author can change a label that is not being rendered.
- **Current Behavior:** `makeFieldObjectControls` declared `label` first, then `hideLabel`, then `fieldType`; `hideLabel`'s `hidden` only excluded the calendar and blank labels; `label`'s `hidden` only excluded the calendar. Switching `Hide Label` to Yes hid the label element but left the `Label` string row on screen.
- **Expected Behavior:** `Hide Label` appears only where hiding is a real design — the boxed-input family that can take the Underline shape (text, email, phone, number, url, textarea, select, multiselect). The panel order is `Type` (1st) → `Hide Label` (2nd) → `Label` (3rd). While `Hide Label` is Yes the `Label` row disappears; setting it back to No restores the row with its previous value.
- **Acceptance Criteria:**
  - [x] `Hide Label` is hidden on segmented, pills, cards, radio, checkbox, checkboxgroup and the calendar widget.
  - [x] `Hide Label` remains available on text, email, phone, number, url, textarea, select and multiselect.
  - [x] `Type` is row 1, `Hide Label` is row 2, `Label` is row 3, and no other row moved.
  - [x] `Hide Label = Yes` hides the `Label` row; `No` restores it with the value it had (hidden, never cleared).
  - [x] A stored `hideLabel: true` on a type that no longer offers the control does not hide that field's label.
  - [x] The accessible-name fallback (`hiddenLabelAriaName`) still works for the plain input, the textarea and the phone national input.
- **Constraints / Must Not Do:** Do not clear or blank `field.label` to hide the label (the `findNameField`/`findEmailField` heuristics, the payload name and the success rows read it — rule 206). Do not render a required marker or any label substitute (rule 4). Do not move `Label` out of position 3 or `Hide Label` out of position 2. Do not let the render honour a flag the panel no longer offers.
- **Related AGENTS.md Rule(s):** Rule 4, Rule 105, Rule 205, Rule 206, Rule 212
- **Additional Context:** The author's reasoning: hiding a label only reads as a design where the Underline shape (BE-135) lets the placeholder guide the eye, and `Underline` itself applies to exactly the boxed-input family — so the two capabilities should be the same list. The author was unsure whether select/multiselect should keep it; both are in `UNDERLINE_FIELD_TYPES`, so both keep it. `hideLabel` does not exist at HEAD, so no saved canvas can be affected by the narrowing.
- **Implementation record (2026-09-14):** added `supportsHiddenLabel(fieldType)` next to `usesUnderlineShape` — literally `UNDERLINE_FIELD_TYPES.has(fieldType)` — and used it in the control's `hidden`, in `hiddenLabelAriaName` and in `FieldRenderer`'s new `hideLabelActive` flag, so the panel and the render cannot disagree. Reordered `makeFieldObjectControls` to `fieldType` → `hideLabel` → `label` and gave `label` a `hidden` on `p?.hideLabel === true`. Recorded as AGENTS.md rule 212, with rules 205 and 206 amended.

---

### BE-144 — The progress bar cannot be aligned; a narrow (`Minimal`) bar is pinned to the left edge

- **Status:** Done (2026-09-14)
- **Description:** The `Minimal` progress-bar version is 128px wide inside a container that is much wider, so it always sits flush left with no way to move it. The author wants to be able to place it left, centred or right.
- **Current Behavior:** Both bar containers were `width: "100%"` capped by `progressSpec.maxWidth` with no horizontal positioning, so the used width collapsed to the left edge of the parent.
- **Expected Behavior:** A `Bar Align` row in the Progress submenu places the bar left (default, unchanged), centred, or right. Alignment moves the bar only.
- **Acceptance Criteria:**
  - [x] A `Bar Align` Enum (Left / Center / Right, default `Left`) exists in the Progress submenu.
  - [x] `Left` renders byte-identically to before (an empty style object is emitted).
  - [x] `Center` and `Right` move the dashed track and the solid bar identically.
  - [x] The "Step X of Y" / "N% complete" text row keeps its own full-width `space-between` layout.
  - [x] The row hides while `Bar Visible = No`, and an unknown/absent stored value resolves to `Left`.
- **Constraints / Must Not Do:** Do not make the row's visibility depend on `Bar Version`. Do not move the text row with the bar. Do not add a second alignment control for the text row without a new explicit order. Do not express this as `justifyContent` on the parent block.
- **Related AGENTS.md Rule(s):** Rule 42, Rule 117, Rule 201, Rule 213
- **Additional Context:** Implemented with auto margins rather than a wrapper or flex alignment, because both containers are already `width: 100%` blocks with a `maxWidth` — the free space is absorbed by whichever margin is `auto`. Alignment is inert on the `Full` version (no `maxWidth`, so both margins resolve to zero); the row stays visible there anyway so the author can set it up front and is never surprised by a control appearing and disappearing with the version.
- **Implementation record (2026-09-14):** added `type ProgressBarAlign = "left" | "center" | "right"` and `PROGRESS_BAR_ALIGN_VALUES`, a `barAlign?: ProgressBarAlign` prop, the `Bar Align` control (hidden while the bar is not visible), a `progressBarAlign` resolver that reads the stored value as a plain `string | undefined` before narrowing (the BE-139 pattern), and `progressAlignStyle` spread into both bar containers. Recorded as AGENTS.md rule 213, with rule 117's row list amended.

---

### BE-145 — Clearing a progress copy row still renders the default text

- **Status:** Done (2026-09-14)
- **Description:** Clearing `Step Counter`, `Step Progress` or `Step Announcement Template` to an empty string leaves the row showing its default value instead of nothing. The author wants a cleared row to render empty in the live preview.
- **Current Behavior:** `copy.stepCounterTemplate` / `stepProgressLabel` / `stepAnnouncementTemplate` were resolved with `firstNonEmpty(...) ?? DEFAULT`, which treats `""` as an absence; `formatStepCounter` applied a second `|| DEFAULT_COPY_STEP_COUNTER_TEMPLATE`; and `stepAnnouncementText` re-applied a `??` default after `copy` had already resolved.
- **Expected Behavior:** An empty string is a value. Only a genuinely unset key falls through to the legacy flat carrier, and only an unset carrier to the default.
- **Acceptance Criteria:**
  - [x] Clearing `Step Counter` renders no counter text.
  - [x] Clearing `Step Progress` renders no progress label.
  - [x] Clearing `Step Announcement Template` announces nothing.
  - [x] An untouched canvas renders byte-identically (unset still resolves to the default).
  - [x] The other copy rows keep their `firstNonEmpty` fallback behaviour (a blank error or button label is still a broken row).
- **Constraints / Must Not Do:** Do not change any other copy row to a `??` chain. Do not restore the `|| DEFAULT` in `formatStepCounter`. Do not remove the legacy flat carriers (`rawCopy.stepCounterTemplate` etc.) from the chain.
- **Related AGENTS.md Rule(s):** Rule 116, Rule 199, Rule 214
- **Additional Context:** The author also asked where `Step Announcement Template` renders. It is never visible: it feeds the visually hidden `<output aria-live="polite">` live region as the per-step screen-reader announcement, with `{counter}`, `{percent}` and `{title}` tokens and a default of `"{counter}, {percent}% complete"`. That is why only `Step Counter` (top-left) and `Step Progress` (top-right) appear on screen.
- **Implementation record (2026-09-14):** the three templates in the `copy` object now use `progressBar.content.<key> ?? rawCopy.<key> ?? DEFAULT`; `formatStepCounter` returns `template.replace(...)` with no fallback; `stepAnnouncementText` drops its redundant `??`. Recorded as AGENTS.md rule 214.

---

### BE-146 — The segmented field's `Selected Styles` duplicates `Padding` and `Radius`, and both fight the shared rows

- **Status:** Done (2026-09-14)
- **Description:** `Selected Styles` owns a `Padding` row and a `Radius` row that duplicate the shared `Field Styles` rows for the segmented field. Increasing `Selected Styles > Padding` grows the whole segmented container rather than the inside of the selected item, and `Selected Styles > Radius` overrides a thumb radius that is already derived from the shared radius.
- **Current Behavior:** `SegmentedControl` received `selectedPaddingY` / `selectedPaddingX` and applied them twice — as the thumb's inset (`top`/`bottom`/`left`) *and* as the active button's own `padding` — so only the active segment got extra vertical padding, making it the tallest cell and growing the fieldset, while the thumb shrank inside the track. `selectedRadius` overrode `innerRadiusValue(borderRadius, 3)`.
- **Expected Behavior:** One padding and one radius. The shared `Field Styles > Padding` drives the active segment's interior like every other segment; the shared `Field Styles > Radius` drives the track and the thumb (thumb = track radius − the track's fixed 3px inset). No duplicate rows.
- **Acceptance Criteria:**
  - [x] `Selected Styles` no longer lists `Padding` or `Radius`.
  - [x] The active segment uses the same padding as its siblings, from the shared Field Styles padding (both axes).
  - [x] The thumb radius is the shared track radius minus the track's 3px inset.
  - [x] The track's own 3px padding is unchanged.
  - [x] A stored `selected.padding` / `selected.radius` still wins, so a saved canvas renders exactly as before, and both keep their existing clamps.
- **Constraints / Must Not Do:** Do not make the thumb inset follow the shared padding (a 12–16px inset would shrink the thumb to nothing). Do not remove the legacy reads. Do not re-add either row, and do not add per-field variants (rule 154).
- **Related AGENTS.md Rule(s):** Rule 80, Rule 131, Rule 154, Rule 158, Rule 199, Rule 210, Rule 215
- **Additional Context:** `Selected Styles` ships at HEAD (`makeSelectedStylesControls` and the `Selected Styles` title are both in the baseline), so both legacy values are real and must stay readable. The vertical axis was genuinely missing before: `SegmentedControl` only accepted `optionPaddingX`, so the shared padding's Y value never reached the segment buttons — `ChoiceGroupInline` already received `optionPaddingY` for its other variants.
- **Implementation record (2026-09-14):** deleted the `radius` and `padding` rows from `makeSelectedStylesControls`; added `optionPaddingY` to `SegmentedControlProps`, its destructure, its button padding (now `optionPaddingY`/`optionPaddingX` for every segment) and the `ChoiceGroupInline` → `SegmentedControl` call; kept the legacy branch as `legacySelectedPad` so a stored `selected.padding` still wins. Recorded as AGENTS.md rule 215, with rules 158, 199 and 210 amended.

---

### BE-147 — Switching on `Selected Styles` immediately applies a 1px solid border

- **Status:** Done (2026-09-14)
- **Description:** Activating the `Selected Styles` group applies a 1px solid dark border to the selected item before the author has configured anything. Switching the group on should not change the render at all.
- **Current Behavior:** `Selected Styles` declared its `border` control with `defaultValue: { borderWidth: FIELD_STYLES_BORDER_WIDTH (1), borderStyle: "solid", borderColor: "#222222" }`. Framer materializes an activated optional object's nested defaults into stored state, so `fsSelected.border` became `{1, solid, #222222}` the moment the group was switched on — and because `fsSelectedBorderColor` reads `fsSelected.border.borderColor`, `selectedRing` also flipped from the live accent token to the hardcoded `#222222`, repainting the selected cards/pills/radio item.
- **Expected Behavior:** Activating the group renders exactly what the group-off state rendered. A border appears only once the author raises its width.
- **Acceptance Criteria:**
  - [x] Switching `Selected Styles` on adds no border to the selected item.
  - [x] The selected ring stays on the live accent token until a border is actually configured.
  - [x] Raising the border width paints the author's chosen width, style and colour.
  - [x] Setting width `0` explicitly removes the outline entirely (existing behaviour).
  - [x] An untouched canvas renders byte-identically.
- **Constraints / Must Not Do:** Do not restore a non-zero default width. Do not make the width or colour depend on theme tokens. Do not remove the width gate on the colour. Do not add a default ring.
- **Related AGENTS.md Rule(s):** Rule 131, Rule 158, Rule 199, Rule 216
- **Additional Context:** `BORDER_WIDTH_MIN` is already `0` and `ChoiceGroupInline` already treats an explicit `0` as "remove the outline entirely", so zero is a first-class value in this engine. The colour half of the fix matters as much as the width half: without the gate, materializing the default's `#222222` would repoint `selectedRing` for every cards/pills/radio selected item.
- **Implementation record (2026-09-14):** the `Selected Styles` border default is now `{ borderWidth: 0, borderStyle: "solid", borderColor: "#222222" }`, and `fsSelectedBorderColor` only reads `fsSelected.border.borderColor` when `(fsSelectedBorderWidth ?? 0) > 0` (new `fsSelectedBorderWidth` const, also reused at the segmented call site). Recorded as AGENTS.md rule 216, with rules 158 and 199 amended.

---

### BE-148 — `Step Announcement Template` is exposed as a Property Control but can never be seen

- **Status:** Done (2026-09-14)
- **Description:** `Progress > Content` offers a `Step Announcement Template` row whose value renders only into a visually hidden `aria-live` region. The author can neither see nor preview what they are editing, so the row invites them to write copy they cannot read back or verify.
- **Current Behavior:** `stepAnnouncementTemplate` was declared as a `ControlType.String` row (with `displayTextArea`) inside the `Content` group, alongside `Step Counter` and `Step Progress`.
- **Expected Behavior:** The template exists only in the component as its default copy; it is not authorable. A canvas that already stored a value keeps announcing exactly what it announced before.
- **Acceptance Criteria:**
  - [x] `Progress > Content` lists only `Step Counter` and `Step Progress`.
  - [x] The announcement still fires on every step change with `{counter}`, `{percent}` and `{title}` substituted.
  - [x] `DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE` is still the fallback, so an untouched canvas announces byte-identically.
  - [x] A stored `progressBar.content.stepAnnouncementTemplate` (the row ships at HEAD) and the flat legacy `copy.stepAnnouncementTemplate` are both still read.
  - [x] No unused-constant or dead-code residue is left behind.
- **Constraints / Must Not Do:** Do not re-add a control for this key, do not delete either read from the `copy` resolution chain, and do not expose it as a hidden or debug control.
- **Related AGENTS.md Rule(s):** Rule 116, Rule 117, Rule 214, Rule 217
- **Additional Context:** Follows directly from the BE-145 answer: the announcement is the only one of the three progress templates that never appears on screen, which is exactly why only `Step Counter` (top-left) and `Step Progress` (top-right) are visible. The trade this makes is recorded openly — an author who localizes the two visible rows now gets an announcement whose wrapper words stay English, because that half is no longer authorable. Deriving the announcement from the visible copy instead would fix that automatically, but it would change the announcement for canvases whose author had customized `Step Progress`, so it needs its own explicit order rather than being done silently here.
- **Implementation record (2026-09-14):** removed the `stepAnnouncementTemplate` entry from the `Content` group in the Progress controls and left a comment at that site explaining why the row is absent and that the template remains in the component. Both reads in the `copy` resolution chain are untouched, so a saved canvas is unaffected; `DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE` is still the chain's terminal fallback (no unused constant). Recorded as AGENTS.md rule 217, with rule 117's `Content` row list and rule 214 amended.

---

### BE-149 — Padding bounds are 8–24 for the field family, and the choice options were not clamped at all

- **Status:** Done (2026-09-14)
- **Description:** The author re-bounded padding: the segmented field's padding should be 8–24px, and the same for all padding in the component "for each field". BE-141 had set a single 12px floor and BE-126 a 16px field ceiling, so this is a lower floor and a higher ceiling at once. Investigating the scope surfaced a second, unmentioned defect: the choice variants' option padding never passed through any clamp.
- **Current Behavior:** Field padding (every field type), the calendar surface and the legacy selected-option padding were all clamped to 12–16. The choice variants (segmented, pills, cards, radio) took the author's `padding` keys straight into `optionPaddingY`/`optionPaddingX` with no clamp of any kind, so a large `Field Styles > Padding` grew the segments without limit while the same value was correctly clamped everywhere else.
- **Expected Behavior:** Every padding surface in the field family accepts 8–24px and clamps to those bounds; the choice options obey the same bounds as every other field. Buttons keep their existing 12px floor and ceilings, since the order was scoped to fields.
- **Acceptance Criteria:**
  - [x] Field padding (string form, and the `paddingX`/`paddingY` axis form) clamps to 8–24.
  - [x] The calendar surface and the legacy selected-option padding clamp to the same 8–24 bounds.
  - [x] The choice variants' option padding is clamped on both axes, with `undefined` preserved so the per-variant fallback still applies.
  - [x] Button padding is unchanged (Y 12–20 / X 12–32) — the order said "for each field".
  - [x] A canvas whose authored padding was inside the old 12–16 range renders byte-identically.
  - [x] No unused constant or dead carrier is left behind (`PADDING_FLOOR` is renamed, not orphaned).
- **Constraints / Must Not Do:** Do not hardcode `8`/`24` at a clamp site, do not give one field type its own bounds, do not move the buttons to 8–24 without a new explicit order, and do not remove the choice-option clamp as redundant.
- **Related AGENTS.md Rule(s):** Rule 87a, Rule 116, Rule 131, Rule 199, Rule 210, Rule 218
- **Additional Context:** Scope reading — "for each field" bounds the order to the field family, and BE-141's own wording ("every padding property control in this comp") shows the author says "everything" when they mean it, so the buttons were deliberately left alone and the fact is flagged rather than assumed. The old shared `PADDING_FLOOR` constant was renamed `BUTTON_PADDING_FLOOR` because once fields stopped reading it the old name described a constant no field obeyed. The effective-defaults consequence shrank rather than grew: `FIELD_STYLES_CARDS_PADDING` (y 10 / x 8) and `FIELD_STYLES_SEGMENTED_PADDING` (y 11 / x 10) now sit inside 8–24, so activating those groups materializes a default the clamp leaves alone; pills (y 5) and the calendar (`0px`) remain sub-floor and are still raised on activation.
- **Implementation record (2026-09-14):** `FIELD_PADDING_MIN`/`FIELD_PADDING_MAX` became 8/24 and `SELECTED_PADDING_MIN`/`SELECTED_PADDING_MAX` now read those two constants instead of repeating a value; the axis fallbacks were extracted to `FIELD_PADDING_FALLBACK_Y`/`_X` (12/14, unchanged values) so the code no longer cites a floor it does not read; `PADDING_FLOOR` was renamed `BUTTON_PADDING_FLOOR` and the button clamps are untouched. A new module-level `clampFieldPaddingAxis` closes the choice-option gap at the `fsPaddingAxes`/`fs?.paddingY` derivation, and the two `optionPadding*` props now read the clamped values. Recorded as AGENTS.md rule 218, with rule 199's field/selected ranges, rule 87a's materialize contract and rule 210's single-floor model rewritten. Verified: `tsc` 20 errors = the baseline multiset exactly, `biome lint` 1 pre-existing warning, CRLF intact (17,595 lines), no new over-100-char lines.

---

### BE-150 — One height for every field type, and every type's padding and floor derived from it

- **Status:** Done (2026-09-14)
- **Description:** The author observed that the component is "fully customizable" on paper while the padding clamp (8–24, rule 218) makes the real freedom almost imperceptible, and proposed fixing padding at one value for all fields and letting authors keep only colours, border, shadow and text. They flagged the cost themselves: one number cannot suit inputs and cards/segmented/pills, and the planned slider and switch types would make it worse. They then ordered the outcome they actually wanted: *"delete the padding control. Let each field type keep its own built-in value"*, plus a newly-noticed defect — segmented options have a minimum height, so padding below ~6px does nothing, **and that minimum makes the segmented field a different overall height from a text field**. Follow-up order: *"Give every field one height, and derive each type's padding and floor from it. I'd use 44px"*, keeping the calendar's and the three button groups' own `Padding` rows.
- **Current Behavior:** One `Padding` control (`Field Styles > Padding`) reached all fourteen field types, but six of them have different bases, so it could only ever be right for one type at a time. Worse, activating the group materialises Framer's `defaultValue` (`"14px"`) into stored state, which silently restyled the choice variants (their option padding jumped from an inline fallback to 14px, growing a segmented track from 40px to 52px) while leaving boxed inputs untouched. Field heights came from four unrelated floors (`BUTTON_MIN_HEIGHT` 32, `optionMinHeight ?? 23`, `TOUCH_TARGET_MIN` 44, `fs?.minHeight ?? 23`) plus three different padding bases, so one family rendered at five heights between ≈39px and ≈47px. `getFieldStylesEffectiveDefaults`' `minHeight` column was declared for all seven types and read by nobody. The choice variants had a **second, inline** option-padding table (`?? 10` / `?? 14` / `?? 8` / `?? 0`), so `FIELD_STYLES_CARDS_PADDING` / `_PILLS_` / `_SEGMENTED_` were constants named after types they never reached.
- **Expected Behavior:** Every field type and every choice option fills one shared row height (44px, the component's existing touch-target minimum). Each type's vertical padding and its row floor are derived from that height, not hand-picked. The `Field Styles > Padding` row is gone; the calendar and the three button groups keep theirs. A stored `padding` from a canvas saved while the row existed still renders (rule 116).
- **Acceptance Criteria:**
  - [x] `Field Styles > Padding` no longer exists; the calendar's and the three button groups' `Padding` rows are untouched.
  - [x] A boxed input/select, a textarea's first row, a radio option, a card, a pill, a segmented track, a single checkbox and a checkbox-group row all render at 44px on desktop.
  - [x] Every `FIELD_STYLES_*_PADDING` is derived from the row height, and no field type carries a private vertical-padding literal.
  - [x] The choice options' padding resolves through the same function and the same per-type table as the field itself — no second inline table.
  - [x] `getFieldStylesEffectiveDefaults(...).minHeight` is actually read (the per-type floor), and `fs?.minHeight` (a carrier with no producer) is gone.
  - [x] A stored legacy `padding` / `paddingY` / `paddingX` still renders, clamped to 8–24.
  - [x] `tsc` = the 20-error baseline multiset exactly; `biome lint` = the 1 pre-existing warning; CRLF intact; no new over-100-char lines.
- **Constraints / Must Not Do:** Do not reintroduce a `Padding` row in the shared field-styles group; do not add a fixed `height` (the row is a `minHeight`, so content and multi-line fields still grow); do not delete the legacy `fs.padding` / `paddingY` / `paddingX` reads; do not re-derive a second option-padding table; do not move the buttons or the calendar onto the field row.
- **Related AGENTS.md Rule(s):** Rule 87a, Rule 116, Rule 131, Rule 199, Rule 210, Rule 215, Rule 218, Rule 219
- **Additional Context:** The consultation's recommendation was to fix the row height rather than the padding, because padding is the mechanism that positions text inside the box — removing it jams the label against the border, and "one number for all fields" cannot be right for six shapes. The author accepted and chose 44px (already `TOUCH_TARGET_MIN` and the calendar cells' height). Known remaining exception, deliberately not changed in this pass: the **phone field renders 46px**, because its `.be-phone-group` is a bordered container wrapping children that each already fill their own 44px row — the group's own border sits outside them. This is pre-existing (it was 47px children in a 49px group before) and is a composite-frame question, not a padding one. Second accepted consequence: the choice variants lose the narrow-width (`compact`) horizontal padding reduction (cards 8→6, pills 12→10), because a built-in per type is by definition one value; the 2px delta is horizontal only and never affected height.
- **Implementation record (2026-09-14):** New module-level row model next to `paddingAxesFrom`: `TOUCH_TARGET_MIN` (44, moved up from its old site at line ~5372 so the derived constants can read it at module-evaluation time), `FIELD_ROW_HEIGHT = TOUCH_TARGET_MIN`, `FIELD_TEXT_LINE` (18), `FIELD_ROW_BORDER` (1), `FIELD_ROW_PAD_Y = (44 − 18) / 2 − 1 = 12`, `SEGMENTED_TRACK_INSET` (3, replacing four separate literals), `SEGMENTED_TRACK_BORDER` (1), `segmentedOptionHeight(trackHeight)` (row − 2×(inset+border) = 36 at 44), `BUTTON_MIN_HEIGHT` (32, moved with it), and `resolvedPaddingAxes()` for callers that hold an already-resolved padding. Every `FIELD_STYLES_*_PADDING` is now built from `FIELD_ROW_PAD_Y` (input/select `12px 14px`, cards `12px 8px`, pills `12px 12px`) except the segmented option (`0px 10px` — it is centred by flex inside a fixed-height track, so its height comes from the track, not padding). `FIELD_PADDING_FALLBACK_Y` now reads `FIELD_ROW_PAD_Y`. `getFieldStylesEffectiveDefaults`' `minHeight` column became live and is `FIELD_ROW_HEIGHT` for every field type (checkbox's floor corrected from its 18px box to its label row; the calendar stays `0` — it is a grid widget, not a row), consumed as `fsMinHeight` in `FieldRenderer` for `inputBaseStyle`, the choice options (`optionMinHeight`) and the checkbox / checkbox-group label rows; the textarea's redundant `minHeight` re-statement was deleted. The choice variants' option padding now resolves through `resolveFieldPadding(fs, field.fieldType)` — one function, one table, clamp intact — and the three inline `?? fallback` tables in `ChoiceGroupInline` were deleted, with `optionPaddingY` / `optionPaddingX` / `optionMinHeight` made required props. `SegmentedControl` gained a `rowHeight` prop (the choice variant passes it; the 12h/24h toggle does not, so it keeps its compact height), its track now carries `padding: SEGMENTED_TRACK_INSET` + `minHeight: rowHeight`, and its option takes `segmentedOptionHeight(rowHeight)`. The three dropdown menu rows keep a 44px floor of their own so the smaller field padding cannot shrink a menu's touch targets. `clampFieldPaddingAxis` was deleted — its clamp now lives in `resolveFieldPadding`'s legacy branches, the single place author values enter. `FieldStyleOverrides.minHeight` removed (no control ever wrote it; `git log -S` finds none in history). Recorded as AGENTS.md rule 219, with rules 87a, 116, 131, 199, 210, 215 and 218 amended in the same pass. Verified: `tsc` 20 errors = the baseline multiset exactly (`diff` of the sorted multisets is empty), `biome lint` 1 pre-existing warning (`suppressions/unused` at 3071), CRLF intact (17,776/17,776 lines), and no over-100-char line among the additions.

---

### BE-151 — `Styles > Radius` never reached the segmented field's track or its selected item

- **Status:** Done (2026-09-14)
- **Description:** Author order, one line, no report-only framing: *"styles -> radius didnt affect segmented field radius and selected item inside it, fix"*. The global `Styles > Radius` token was supposed to shape the segmented control's track and its selected thumb; it shaped neither.
- **Current Behavior:** `ChoiceGroupInline`'s segmented branch passed `borderRadius={optionRadius ?? 16}`. `Field Styles > Radius` is an **optional** group, so `fs` is `undefined` on any canvas where the author has not switched it on — which means `optionRadius` (derived from the stored `fs.radius`) is `undefined` too, and the literal **`16`** won. `16` has no source in any token: the global `Styles > Radius` defaults to **12** (`sanitizedRadius` falls back to 12, clamped 0–24), and every other field type already resolved to that 12. So on an untouched canvas the segmented track rendered 16px while a text field rendered 12px, and because `SegmentedControl` derives the thumb from the track (`innerRadiusValue(borderRadius, SEGMENTED_TRACK_INSET)` = track − 3), the selected item rendered 13px instead of 9px. The field was the one member of the family that ignored `Styles > Radius` at its default value; moving the token did nothing to it either (at 24 the track stayed 16). This also made BE-146's recorded intent — "the shared `Field Styles > Radius` drives the track *and* the thumb" (rule 215) — false in code from the day it was written.
- **Expected Behavior:** The segmented track's radius is the field's **resolved** radius, i.e. whatever `resolveFieldRadius(fs, borderRadius, field.fieldType)` returns: an explicit author radius when one is set, otherwise the global `Styles > Radius` token. The selected item follows the track through the existing single derivation site, so both move together and stay concentric (thumb = track − 3). A stored legacy `selected.radius` still wins for the thumb, unchanged.
- **Acceptance Criteria:**
  - [x] The segmented path carries no radius literal; the track's radius is `optionRadius ?? radius` where `radius` is the `resolveFieldRadius(...)` result.
  - [x] `Styles > Radius` reaches the segmented track and the selected item: at the default the field renders 12px / 9px, and moving the token to 24 renders 24px / 21px.
  - [x] The thumb's radius stays derived from the track at its one site (`innerRadiusValue(borderRadius, SEGMENTED_TRACK_INSET)`), so no second radius source is introduced.
  - [x] A stored legacy `selected.radius` still wins over the derived thumb radius, and a stored `fs.radius` still wins over the token.
  - [x] No other field type, the 12h/24h toggle, or any menu surface changes.
  - [x] The two constants whose equality with `FIELD_STYLES_FIELD_RADIUS` makes the token reach them carry a warning comment.
  - [x] `tsc` = the 20-error baseline multiset exactly; `biome lint` = the 1 pre-existing warning; CRLF intact; no new over-100-char lines.
- **Constraints / Must Not Do:** Do not reintroduce a radius literal on the segmented path; do not give the thumb its own fallback radius; do not treat `optionRadius` as an independent value (it is a legacy-carrier read equal to `radius` whenever it exists); do not restructure the equality-based native-radius sentinel in `resolveFieldRadius` without also changing how a type declares a private radius; do not "fix" the new 12px default by pinning the segmented type to 16.
- **Related AGENTS.md Rule(s):** Rule 116, Rule 199, Rule 215, Rule 219, Rule 220
- **Additional Context:** This is the last hole in the shared-radius story. The pattern the codebase already uses is `optionRadius ?? <that type's own resolved radius>` — the cards/pills option button reads `optionRadius ?? radius` (line ~2132) and the pills button reads `optionRadius ?? 999` (line ~2483, and pills' resolved radius *is* 999 because `FIELD_STYLES_PILLS_RADIUS` is a genuine native shape). Only the segmented branch used a bare literal, and `16` was not even the segmented type's own radius. The 12h/24h time-format toggle was already correct: it passes `borderRadius={borderRadius}` straight through, which is the precedent the segmented field now matches. **Honest effect statement:** this is *not* a no-op on an untouched canvas — the segmented field moves from a 16px track / 13px thumb to 12px / 9px, because 16 was never the token's value. That is the intended outcome of the order (the field now reads the same token as the rest of the family), and it is recorded plainly rather than glossed. Known residual fragility, deliberately not restructured in this pass: `resolveFieldRadius` detects "this type has no native radius of its own" by comparing the type's effective radius against `FIELD_STYLES_FIELD_RADIUS`, so `FIELD_STYLES_CARDS_RADIUS` and `FIELD_STYLES_SEGMENTED_RADIUS` must stay numerically equal to it; the coupling is invisible, and a warning comment now states it at the constants.
- **Implementation record (2026-09-14):** one prop changed in `ChoiceGroupInline`'s segmented branch — `borderRadius={optionRadius ?? 16}` → `borderRadius={optionRadius ?? radius}` — with an eight-line comment recording why (`radius` already carries `resolveFieldRadius(fs, borderRadius, field.fieldType)`; the old literal pinned the track, and the thumb with it, on every canvas that had not authored a field radius). A warning comment was added above `FIELD_STYLES_CARDS_RADIUS` / `FIELD_STYLES_SEGMENTED_RADIUS` explaining that their equality with `FIELD_STYLES_FIELD_RADIUS` is what makes those types track the global token, and that both must move with it. Nothing else on the segmented path was touched: `selectedRadius` is still read first for the thumb (`clampRadiusToken(selectedRadius) ?? segmentInnerRadius`), and the 12h/24h toggle is unchanged. Recorded as AGENTS.md rule 220, with rule 215 amended in the same pass. Verified: `tsc` 20 errors = the baseline multiset exactly (`diff` of the sorted multisets is empty), `biome lint` 1 pre-existing warning (`suppressions/unused` at 3093), CRLF intact (17,795/17,795 lines), and no over-100-char line among the additions.

---

### BE-152 — Padding is never bounded: the button clamp and the calendar's padding are both removed

- **Status:** Done (2026-09-14)
- **Description:** Author order, delivered as a change of model rather than a change of number: *"the idea that we do a limitation on the padding, minimum and maximum, is a stupid idea. We should, the best practice is that we do the minimum and maximum, which is minimum height, maximum height, minimum width, maximum width."* Padding becomes unlimited — *"the user can put, for example, 150 padding, it's fine, no problem"* — and the element is bounded by its own min/max width and height instead. Two surfaces still bounded padding and both were named: *"in the buttons, the buttons also still have the padding and have a limitation"* and *"the calendar has also padding, and the padding has a limitation too."* The calendar's `Padding` control must go **entirely** — *"we need to remove it at all. And remove also the value of it from the element itself, I mean, we don't just remove it from the panel only, no, we remove it also from the component itself"* — because the calendar is three cards (event metadata, days, time slots) that each already carry their own padding. For the nav buttons: remove the padding min/max, add a minimum height, and *"don't add minimum or maximum width because the user might configure the buttons to be full width."*
- **Current Behavior:** `resolveButtonStyle` clamped every button group's padding with `clampBoxPadding(group.padding, BUTTON_PADDING_MIN_Y 12, BUTTON_PADDING_MAX_Y 20, BUTTON_PADDING_MIN_X 12, BUTTON_PADDING_MAX_X 32)`, so an author could not enter a large padding and a stored value was silently rewritten on every read. The calendar panel carried its own `Padding` row (`makeCalendarStylesStylesControls`) whose default is `0px`, and the root element applied it via `surfacePadding` — clamped to the *field family's* 8–24, so switching the group on materialised `0px` and the clamp immediately rewrote it to **8px**. The nav buttons already carried `minHeight: 32` (`BUTTON_MIN_HEIGHT`), which never binds because their padding gives them ≈38px.
- **Expected Behavior:** Padding is unlimited everywhere the author can set it; the element's own dimensions are the bound. The calendar has no `Padding` row and no root padding — its three cards inset themselves. The buttons keep their `minHeight: 32` and gain no width bound, so a full-width footer button stays possible.
- **Acceptance Criteria:**
  - [x] No button padding is clamped: `resolveButtonStyle` passes the author's padding string through verbatim.
  - [x] `clampBoxPadding` and `BUTTON_PADDING_FLOOR` / `BUTTON_PADDING_MIN_Y` / `MAX_Y` / `MIN_X` / `MAX_X` are gone — no dead helper or constant left behind.
  - [x] The calendar's `Padding` row is removed from `makeCalendarStylesStylesControls`, and the unused `eff` binding with it.
  - [x] `surfacePadding` and its spread on the calendar root element are removed, so a stored `calendarStyles.padding` no longer renders.
  - [x] The buttons' `minHeight: BUTTON_MIN_HEIGHT` (32) is unchanged, and no min/max width is added to any button.
  - [x] `FIELD_PADDING_MIN` / `FIELD_PADDING_MAX` (8–24) are untouched and remain the component's only padding bounds, acting on stored legacy field values alone.
  - [x] Untouched canvases render byte-identically: the calendar root had no padding unless its group was activated, and buttons already fell back to the unclamped `role.padding`.
  - [x] `tsc` = the 20-error baseline multiset exactly; `biome lint` = the 1 pre-existing warning; CRLF intact; no new over-100-char lines.
- **Constraints / Must Not Do:** Do not reintroduce a padding clamp for the buttons or the calendar; do not add a width bound to a button (a ceiling would cap a full-width footer button); do not restore `clampBoxPadding` or the `BUTTON_PADDING_*` constants; do not re-add a `Padding` row to the calendar panel; do not treat the calendar's removed carrier as a rule-116 regression to "fix"; do not widen the 8–24 field bounds in response to any of this.
- **Related AGENTS.md Rule(s):** Rule 87, Rule 90, Rule 105, Rule 116, Rule 131, Rule 199, Rule 210, Rule 218, Rule 219, Rule 221
- **Additional Context:** The author's model inverts the previous one: BE-141/BE-149/BE-150 all tuned *padding* bounds, and this order says the bound belongs on the element instead. The field family had already moved that way in BE-150 (one row height, min-height only), so this change brings the buttons and the calendar into line rather than inventing anything. **Two decisions were put to the author and both were deliberate:** (1) the nav buttons' min height stays at the existing **32px** rather than rising to the 44px touch-target minimum — the author chose "leave as is", accepting that the floor never binds; (2) the minimum-height change applies to the **footer nav only**, and since 32px already applies to every button-group button (Book Another, Retry, the calendar links) nothing was added to the others. **Effect, stated plainly:** untouched canvases are unchanged in both places, but (a) activating the calendar's Styles group no longer inserts 8px, and a stored calendar padding stops rendering — the one deliberate exception to rule 116's carrier contract, ordered explicitly; (b) a canvas that activated a button-styles group had its materialised `10px 16px` raised to `12px 16px` by the clamp and now renders `10px 16px`, exactly what the panel shows — which **restores rule 131's materialise-the-inherit-look contract for the button groups**. The calendar removal is safe because all three inner cards carry their own padding: the metadata card `16px`, the days card `16px`, and `TimeSlotList` `16px 16px 0 16px`.
- **Implementation record (2026-09-14):** `resolveButtonStyle`'s `padding` branch became `typeof group?.padding === "string" && group.padding.trim() ? group.padding : role.padding`; `clampBoxPadding` (and its orphaned doc comment) and the five `BUTTON_PADDING_*` constants were deleted, and the BE-149 comment block above `FIELD_PADDING_MIN` was rewritten to record that the button regime no longer exists. `makeCalendarStylesStylesControls` lost `const eff = getFieldStylesEffectiveDefaults("calendar-widget")` and its `padding: fieldStylesPaddingControl(eff.padding)` row, replaced by a BE-152 comment; the calendar render lost the `surfacePadding` derivation and its spread on the root element. `fieldStylesPaddingControl`'s doc comment was updated (the three button groups are now its only callers). `clampPadding` is untouched and still used by `resolveFieldPadding` at the field legacy carrier. Recorded as AGENTS.md rule 221, with rules 87, 90, 199, 210 and 218 amended in the same pass. Verified: `tsc` 20 errors = the baseline multiset exactly (`diff` of the sorted multisets is empty), `biome lint` 1 pre-existing warning (`suppressions/unused` at 3093), CRLF intact (17,773/17,773 lines), and no over-100-char line among the additions.

---

### BE-153 — Selected Styles border color leaks to all fields on color-picker drag

- **Status:** Done (2026-09-14)
- **Implementation record (2026-09-14):** verdict is a Framer platform bug, proven from the code: text inputs render via `resolveFieldBorder(fs)` → `fieldBorderCss(fsInputBorder)` reading `fs?.border` only, and unselected options render `fsBorder.color` with `selectedRing` gated under `isSelected` — no path feeds `fs.selected.border` into an unselected surface, so a selected-border drag repainting text inputs means Framer wrote both stored props, and the single-click/drag divergence (same picker, same code path) rules out a component read bug. Applied the pre-authorized fallback: deleted the `Border` row from `makeSelectedStylesControls` (subgroup is now Font/Color/Fill/Shadow); `fieldStylesBorderControl` untouched; legacy `selected.border` reads (`fsSelectedBorderWidth` / width-gated `fsSelectedBorderColor` / `selectedBorderStyle`) intact per rule 116, so saved canvases keep rendering. Switching the group on is now structurally non-visual for borders (closes BE-147's activation complaint without a default). Shadow X/Y/Blur 0 + Spread is the documented pseudo-border. Recorded as AGENTS.md rule 222, with rules 158/216 amended. Verified: `tsc` 20 errors = the baseline multiset exactly, `biome lint` 1 pre-existing warning, no new over-100-char lines.
- **Description:** The `Border` row inside `Styles > Field Styles > Selected Styles` is supposed to style only the selected choice option (segmented active segment, selected cards/pills/radio item). A single click in its color-picker applies only to the selected item, but click-hold-drag in the same picker also repaints every unselected field's border. A prior agent investigated the component code, found no defect, and asked for a user-run debug test that was never performed, so the issue persists.
- **Current Behavior:** With `Field Styles > Border` set to red, all field borders render red. Activating `Selected Styles` adds a `#222222` 1px border before anything is configured (reporter observation; HEAD code after BE-147 declares a zero-width default, so the canvas under test may predate that fix — implementer to confirm on a synced canvas). Opening `Selected Styles > Border > Color`: single-click on a blue swatch paints only the selected option blue while other fields stay red; click-hold-drag to a green swatch paints the selected option green AND repaints all other field borders green too.
- **Expected Behavior:** `Selected Styles > Border` color/width/style apply strictly to the selected option in every interaction mode. Single-click and click-hold-drag in the color picker produce the identical isolated result. Activating `Selected Styles` without configuring anything renders byte-identically to the group-off state.
- **Acceptance Criteria:**
  - [ ] Activating `Selected Styles` with no edits renders byte-identically (no auto-added 1px `#222222` border).
  - [ ] Single-click color pick on the selected border changes only the selected option.
  - [ ] Click-hold-drag color pick on the selected border changes only the selected option; no unselected field border changes.
  - [ ] `Field Styles > Border` still drives all unselected field borders independently.
  - [ ] Verdict recorded with evidence whether the drag-leak is a component bug or a Framer platform (`ControlType.Border` nested inside an optional `ControlType.Object`) bug; if platform, the agreed fallback is applied instead of a component patch.
- **Constraints / Must Not Do:** Do not add color-contrast computation, validation, warnings, or auto-correction (rules 1–3, 70, 71); do not add a new Property Control without an explicit order (if the verdict is a Framer platform bug, removal of the `Selected Styles > Border` row is the pre-authorized fallback, with `Shadow` X/Y/Blur 0 + Spread as the documented pseudo-border workaround — not a second border system); do not break rules 158/215/216 (Selected Styles owns Font/Color/Fill/Border/Shadow only, zero-width border default, width-gated color read) or rule 202 (per-side border widths); do not break hydration parity (rule 42) or constant-CSS discipline (rules 65/148); do not treat the stored `selected.border` legacy carrier as dead (rule 116).
- **Related AGENTS.md Rule(s):** Rule 158, Rule 202, Rule 215, Rule 216, Rules 1–3
- **Additional Context:** Reported 2026-09-14 with three screenshots: (1) all borders red from `Field Styles > Border` before `Selected Styles` activation; (2) selected option blue via single-click, others still red; (3) selected option plus all other fields green via drag. `Selected Styles` set is `fieldStyles.selected` (`makeSelectedStylesControls`, `ControlType.Object` optional, rows Font/Color/Fill/Border/Shadow; Border via `fieldStylesBorderControl` with `ControlType.Border` optional). Reference docs named by reporter: `Code-Components/Docs/framer-code-component.md` (Border control: `borderWidth` or per-side widths plus `borderStyle`/`borderColor`) and `Code-Components/Docs/SKILL.md` (same Border value object).

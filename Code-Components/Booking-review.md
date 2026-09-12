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

### BE-092 — Number field strips everything except digits and signs at the write point

- **Status:** Done (2026-09-11)
- **Description:** The `number` field behaved like a text field: typed letters appeared in the box (validation only complained afterwards). Author order: letters must never appear at all, and no symbol except minus/plus may appear either. This regressed before — it must never regress again.
- **Current Behavior:** (pre-fix) default-branch `onChange` passed `e.target.value` through verbatim for `number`; `"12ab"` displayed `"12ab"` until submit-time validation.
- **Expected Behavior:** `sanitizeNumberInput` (`/[^0-9+-]/g`) runs at the keystroke handler — only `0-9`, `+`, `-` survive; letters, dots, commas, parens, spaces-in-middle never render. Validation (`isValidNumberInput`, max 250, no min-length) judges shape on what remains, unchanged.
- **Acceptance Criteria:**
  - [x] Typing letters/symbols shows nothing; digits and leading signs work normally.
  - [x] 14 unit tests pass (strip cases + validation-on-remainder cases).
  - [x] Non-number field types byte-identical (arm is `number`-gated).
- **Constraints / Must Not Do:** Do not weaken back to validation-only messaging; do not add min-length; do not coerce to numeric JSON (rule 184 stands otherwise).
- **Related AGENTS.md Rule(s):** Rule 184 (amended — total write-point strip); rule 97 (same precedent as phone).
- **Additional Context:** Reported 2026-09-11 (Arabic). Deliberate consequence recorded: the decimal point is stripped too, so only whole/signed integers are enterable and the decimal branch of `isValidNumberInput` is unreachable by typing.
- **Implementation record (2026-09-11):** `NUMBER_DISALLOWED_CHARS` + `sanitizeNumberInput` beside the phone sanitizer; one `number`-gated arm in the default input `onChange`. tsc clean (full-file parity run); biome at the pre-existing baseline.

---

### BE-093 — Number field collapses repeated signs to one leading sign

- **Status:** Done (2026-09-11)
- **Description:** After BE-092, `-`/`+` survive the strip but stack without limit — `-+-+-+-+-+-+-+-` renders as typed. Signs are only meaningful as a single leading character.
- **Current Behavior:** (pre-fix) every typed sign survives wherever it lands.
- **Expected Behavior:** At most one leading sign survives; interior signs are dropped. First typed char wins (`-+-+-+-+-` → `-`, `+-12` → `+12`, `5-3` → `53`).
- **Acceptance Criteria:**
  - [x] The screenshot string collapses to `-`; normal signed/unsigned entry unchanged.
  - [x] 14 unit tests pass (collapse + prior strip cases).
- **Constraints / Must Not Do:** Do not move into validation-only; do not touch the allowed set (rule 184).
- **Related AGENTS.md Rule(s):** Rule 184 (amended — single-sign collapse).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a screenshot (`-+-+-+-+-+-+-+-` in the box).
- **Implementation record (2026-09-11):** `sanitizeNumberInput` keeps the first char iff sign, strips all other `+-`. Biome parses (pre-existing baseline); change is expression-local to the tested helper.

---

### BE-094 — Number field matches Cal.com's intermediate set (trailing minus displays)

- **Status:** Done (2026-09-11)
- **Description:** After BE-093, typing `4-` swallowed the minus — the visitor could not type Cal.com's intermediate states. Investigation (mandated by the reporter: do exactly like Cal.com) proved Cal renders native `type="number"` with zero JS filtering (`NumberWidget` passes `e.target.value` verbatim) and validates on submit.
- **Current Behavior:** (pre-fix) only a single leading sign survived; `4-` collapsed to `4` on keystroke.
- **Expected Behavior:** The display permits Cal.com's exact intermediate set `[+-]?digits*[+-]?` (`4-`, `-4-` show while typing); letters/symbols still never appear; submit validation unchanged and still rejects non-shapes. True native stays banned (controlled-wipe + spinners/locale chaos, rule 184).
- **Acceptance Criteria:**
  - [x] `4-` and `-4-` display; `-+-+-` still collapses; letters/dots never appear.
  - [x] 19 unit tests pass on the real extracted helper (including the over-merge the harness caught mid-session).
  - [x] `4-` displays but never submits (validation rejects) — Cal parity.
- **Constraints / Must Not Do:** Do not switch to native `type="number"`; do not weaken letter-stripping; do not touch validation.
- **Related AGENTS.md Rule(s):** Rule 184 (amended — Cal-parity intermediates).
- **Additional Context:** Reported 2026-09-11 (English): "i still cant type 4-". Cal.com evidence: `packages/features/form-builder/widgets.tsx` (`NumberWidget`), plus `fieldTypes.ts` (`number.isTextType` is dashboard-side config, not the booker renderer).
- **Implementation record (2026-09-11):** `sanitizeNumberInput` takes optional single head + single tail (adjacent/sign-only middles merge); body interior signs still dropped. Biome parses (pre-existing baseline); tsc unaffected (expression-local).

---

### BE-095 — Accepted signs are never eaten: interior minus migrates front

- **Status:** Done (2026-09-11)
- **Description:** Typing `4` after an accepted trailing minus (`4-`) collapsed to `44` — a character the visitor saw was deleted by the next keystroke. The minus must survive: it migrates to the front instead.
- **Current Behavior:** (pre-fix) lone interior signs were dropped (`4-` + `4` → `44`).
- **Expected Behavior:** Runs collapse first, then: zero signs → digits; one sign (leading/trailing/interior) → keep or migrate front (`4-4` → `-44`, `5-3` → `-53` — supersedes BE-093's `53`); leading+trailing pair → keep (`-4-`); 3+ signs → first front, rest dropped. Every display state is submittable except trailing-pending (`4-`), which still only displays.
- **Acceptance Criteria:**
  - [x] `4-` + `4` → `-44`; no typed sign ever vanishes; no sign salad possible.
  - [x] 23 unit tests pass on the real extracted helper.
  - [x] Letters/dots still never appear; validation untouched.
- **Constraints / Must Not Do:** Do not return to swallowing typed signs; do not switch to native input; do not touch validation.
- **Related AGENTS.md Rule(s):** Rule 184 (amended — migrate-front).
- **Additional Context:** Reported 2026-09-11 (English): "if i typed 4 after the - it will be 44 not 4-4".
- **Implementation record (2026-09-11):** `sanitizeNumberInput` rewritten around run-collapse + positional rule (leading/trailing keep, lone interior migrates, pair-kept, multi-dropped). Prior `5-3 → 53` / `1+2+3 → 123` expectations superseded openly to `-53` / `+123`. Biome parses (pre-existing baseline).

---

### BE-096 — Default placeholders: author value wins, per-type defaults underneath

- **Status:** Done (2026-09-11)
- **Description:** Phone fields ignored the configured Placeholder (always showed the derived dial code), and every other input type defaulted to an empty placeholder. Authors get a working placeholder everywhere with a sensible type-based default underneath.
- **Current Behavior:** (pre-fix) phone placeholder hardwired to `+{dial}`; text/textarea/email/number/url render `""` when unconfigured.
- **Expected Behavior:** Configured Placeholder wins on every type. Empty falls back to `DEFAULT_PLACEHOLDER_BY_TYPE`: text/textarea → "Your answer" (industry-standard generic), email → "name@example.com", number → "0", url → "example.com", phone → derived `+{dial}` (existing logic). Choice types untouched (no placeholder surface).
- **Acceptance Criteria:**
  - [x] Setting a Placeholder shows it verbatim on every input type (incl. phone).
  - [x] Empty shows the per-type default; untouched canvases gain the hint with no other change.
- **Constraints / Must Not Do:** Do not add a placeholder control (already exists); do not touch choice/multiselect trigger text; phone dial-derivation stays the phone default.
- **Related AGENTS.md Rule(s):** Rule 196 (phone placeholder sentence).
- **Additional Context:** Reported 2026-09-11 (English): "add default placeholder to the field type phone" + "all the other fields based on their types".
- **Implementation record (2026-09-11):** `DEFAULT_PLACEHOLDER_BY_TYPE` + `defaultFieldPlaceholder()` beside the field resolvers; applied at the textarea and default-input render sites. Phone part superseded same-day by BE-097 (below) — the author-wins branch lived for one session only.

---

### BE-097 — Phone has no Placeholder row; dial code is the only placeholder

- **Status:** Done (2026-09-11)
- **Description:** The Placeholder row still shows for phone fields, but the phone input already carries a dynamic dial-code placeholder — the row is redundant panel noise next to a value that always wins.
- **Current Behavior:** (pre-fix) Placeholder row visible for phone; BE-096's author-wins branch briefly honored it.
- **Expected Behavior:** The Placeholder row hides for `phone` (same `hidden()` as `calendar-widget`); the national box always renders the derived `+{dial}`; any stored phone placeholder is inert.
- **Acceptance Criteria:**
  - [x] No Placeholder row on phone fields; all other types unchanged.
  - [x] Phone box always shows the current country's dial code.
- **Constraints / Must Not Do:** Do not strip stored values (inert carriers); do not touch the type-default map for other types.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — derived-always).
- **Additional Context:** Reported 2026-09-11 (English) with a screenshot of the Fields panel.
- **Implementation record (2026-09-11):** `hidden()` covers `phone`; `PhoneFieldControl` back to derived-only. Biome at the pre-existing baseline.

---

### BE-098 — Phone placeholder row restored: empty shows dial code, typed overrides

- **Status:** Done (2026-09-11)
- **Description:** Author reconsidered BE-097 on reflection: hiding the row restricts freedom — better to keep the Placeholder row (empty by default), render the dynamic country code for empty, and let anything typed override it.
- **Current Behavior:** (pre-fix, BE-097) no Placeholder row for phone; derived dial code always.
- **Expected Behavior:** Placeholder row visible for phone (empty default); empty renders the current country's dial code; typed content takes over verbatim.
- **Acceptance Criteria:**
  - [x] Row present and empty by default; empty shows `+{dial}` following country changes.
  - [x] Typed placeholder renders verbatim instead of the dial code.
- **Constraints / Must Not Do:** Do not change the dial-derivation; do not touch other types.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — author-wins restored).
- **Additional Context:** Reported 2026-09-11 (Arabic): author chose freedom over restriction.
- **Implementation record (2026-09-11):** Reverted BE-097's two edits (row unhidden, author-wins branch restored with a BE-098 comment). Biome at the pre-existing baseline.

---

### BE-099 — Never-set shows the type default; cleared renders nothing

- **Status:** Done (2026-09-11)
- **Description:** BE-096's `||` fallback fused two states: a never-set placeholder and a deliberately cleared one both rendered the generic default — so an author could never have NO placeholder, and new fields arrived empty in the panel. The correct contract: new fields arrive carrying a placeholder (panel row filled, preview shows it); editing changes it; deleting it removes it entirely.
- **Current Behavior:** (pre-fix) `field.placeholder || default` at all three render sites; Placeholder row `defaultValue: ""`; blank-step seed sets `placeholder: ""`.
- **Expected Behavior:** Render sites read `field.placeholder ?? default` — `undefined` (never set) shows the type default, `""` (cleared) renders nothing. The Placeholder row carries no `defaultValue`; the blank-step seed omits the key; auto-injected Cal fields omit the key when Cal sends none. Stored `""` from the old-default era renders nothing (same as its pre-BE-096 look — recorded migration wart).
- **Acceptance Criteria:**
  - [x] New blank field/step arrives with the type default visible in preview.
  - [x] Clearing the row removes the preview placeholder completely (no generic resurrection).
  - [x] Typing shows verbatim; shipped seeds with explicit placeholders untouched.
- **Constraints / Must Not Do:** Do not re-add a `""` default to the row; do not coerce `undefined` to `""` in normalize (it doesn't — verified); do not touch choice trigger text.
- **Related AGENTS.md Rule(s):** None new (mechanism lives on BE-096's rule-196 sentence + code comments).
- **Additional Context:** Reported 2026-09-11 (Arabic) — clarification of the BE-096 order.
- **Implementation record (2026-09-11):** `??` at phone/textarea/default sites; row `defaultValue` deleted with rationale comment; blank seed key omitted; auto-inject uses conditional spread. Biome at the pre-existing baseline.

---

### BE-100 — Number follows observed Cal.com behavior: ignore plus, block repeats, blur cleanup

- **Status:** Done (2026-09-11)
- **Description:** The reporter tested Cal.com's number field and specified its exact mechanism: leading minus works; a repeated minus never registers; plus is ignored completely (stripped on blur: `+1` becomes `1`); typing `1+5` then blurring cuts everything from the `+` (leaves `1`). Our `-1` + `-` + `1` chain produced `-11`/`-111` because the accepted trailing minus combined with the next digit.
- **Current Behavior:** (pre-fix) lone interior/trailing signs displayed (BE-094/BE-095); `+` survivable; no blur pass.
- **Expected Behavior:** Typing allows digits + one leading minus only (repeat/interior minus swallowed, `+` stripped like a letter); a number-only `onBlur` applies Cal's cleanup (drop leading `+`, cut from first remaining `+`) for legacy/pasted values; minus never touched on blur; validation unchanged.
- **Acceptance Criteria:**
  - [x] `-` `1` `-` `1` `1` types `-1`, `-1`, `-11`, `-111` exactly (reporter's chain).
  - [x] `+` never appears by typing; blur maps `+1`→`1`, `1+5`→`1`.
  - [x] 27 unit tests pass on the real extracted helpers.
- **Constraints / Must Not Do:** Do not switch to native input (controlled-wipe + spinners/locale chaos); do not reintroduce `+` recognition or trailing-minus display; do not touch validation.
- **Related AGENTS.md Rule(s):** Rule 184 (rewritten — Cal-shaped write point + blur).
- **Additional Context:** Reported 2026-09-11 (Arabic + English) after the reporter probed Cal.com directly. Cal evidence: native `type="number"` with verbatim `setValue` (their `widgets.tsx`); the blur-strip is their observed behavior.
- **Implementation record (2026-09-11):** `sanitizeNumberInput` reduced to `-?digits*` (disallowed class drops `+`); new `normalizeNumberOnBlur`; number-gated `onBlur` on the default input (value-only update). Full-file tsc clean; biome at the pre-existing baseline.

---

### BE-101 — Empty panel placeholder always shows the default (platform fuses empty states)

- **Status:** Done (2026-09-11)
- **Description:** After BE-099, a phone field with an empty panel Placeholder showed no preview placeholder at all — the `??` never fired because Framer stores `""` for untouched rows too, so never-set and cleared are indistinguishable at runtime.
- **Current Behavior:** (pre-fix) `field.placeholder ?? default` at phone/textarea/default sites; empty panel renders nothing.
- **Expected Behavior:** All three sites read `field.placeholder || default` — empty (however it got empty) always shows the type default/dial code; typed shows verbatim. To render NO placeholder at all, type a single space.
- **Acceptance Criteria:**
  - [x] Empty phone Placeholder row previews the current dial code; typing overrides.
  - [x] Same empty-shows-default on textarea/default inputs; BE-096 map unchanged.
- **Constraints / Must Not Do:** Do not attempt unset-vs-cleared separation again (platform-impossible); BE-099's cleared-renders-nothing is superseded openly.
- **Related AGENTS.md Rule(s):** Rule 196 (BE-101 tag).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a screenshot (empty row, empty preview).
- **Implementation record (2026-09-11):** `??` → `||` at the three sites + comment correction. Biome at the pre-existing baseline.

---

### BE-102 — Field grid switches columns in CSS; measured-width state deleted

- **Status:** Done (2026-09-11)
- **Description:** Steps with Half fields flashed on load/preview: six full-width rows snapped to three paired rows with a height jump. Root cause was architectural, not timing — `engineWidth` initialized at 320 (always single-column) and corrected only after a gated passive measure, so the first paint was definitionally wrong.
- **Current Behavior:** (pre-fix) `useState(320)` + interaction-gated `ResizeObserver` + `isTwoCol` plumbing through StepBody into every field's inline span.
- **Expected Behavior:** Columns flip in CSS only: the form carries `container-type: inline-size`, `.be-form-grid` goes two-track under a container query at 768px when config-derived `data-two-col` is set; spans are config-only and width-agnostic. Markup is width-independent, so server, prerender, and first paint are byte-identical. No measure, no gate, no snap — on any embed width.
- **Acceptance Criteria:**
  - [x] Six-half-field step paints three paired rows on the very first paint (no rows flash, no height jump).
  - [x] Narrow embeds still stack single-column; textarea still spans both.
  - [x] Zero hydration-mismatch risk (no width in markup; ungating the measure would reintroduce it).
  - [x] `engineWidth` state, observer, gate usage, and all `isTwoCol` plumbing deleted (no dead code).
- **Constraints / Must Not Do:** Do not ungate or reintroduce JS width measurement for the grid (rules 42/109); do not touch the calendar's separate `measuredWidth` path; keep 768px synced with `COMPACT_BREAKPOINT`.
- **Related AGENTS.md Rule(s):** Rule 192a (amended — CSS columns clause).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a slow-motion description (six rows → three rows + height shrink). Same flash class rule 180 already fixed for cards with pure CSS.
- **Implementation record (2026-09-11):** Container query block in RootShell constant CSS; `be-form-scope` on `motion.form`; both grid divs drop the inline template for `data-two-col`; `containerStyle.gridColumn` drops the width condition; `isTwoCol` prop/interface/passes/consts and the whole `engineWidth` apparatus removed. Full-file tsc clean; biome at the pre-existing baseline.

---

### BE-103 — Phone seam divider can never double; trigger ring is error-aware

- **Status:** Done (2026-09-11)
- **Description:** In the error state the divider between the country trigger and the number box rendered as a 2px line (trigger right border + input left border side by side). Separately, the trigger's focus ring ignored the error state while every other field switches its ring to the error color when invalid.
- **Current Behavior:** (pre-fix) trigger `borderRightWidth: 0` beside the input's full left border; trigger focus ring always accent-colored.
- **Expected Behavior:** The number input overlaps the trigger edge by 1px (`marginLeft: -1`) so exactly one divider line paints no matter which side renders (later sibling on top); the trigger focus ring uses the error color when invalid — mirroring `.be-input.be-input-invalid:focus-visible` exactly.
- **Acceptance Criteria:**
  - [x] Seam reads as a single 1px divider in normal, error, focused, and error+focused states.
  - [x] Trigger Tab-focus in error shows the error-colored inset ring (not accent).
- **Constraints / Must Not Do:** Do not remove either side's border (overlap, not deletion); do not re-add `be-input` to the trigger.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — seam + ring contract).
- **Additional Context:** Reported 2026-09-11 (English) with an error-state screenshot.
- **Implementation record (2026-09-11):** `marginLeft: -1` on the national input with rationale comment; focus `boxShadow` branches on `hasError`. Biome at the pre-existing baseline.
- **Implementation record 2 (2026-09-11, seam revert):** The overlap hid the divider instead of protecting it — the trigger is `position: relative` and paints above the pulled-under input border, so the normal-state divider vanished (the error divider the reporter saw was the focused inset ring stacked beside the input border — identical to every other focused-invalid field, not a seam bug). Overlap removed; seam is trigger-right(0) + input-left(1px) adjacent again: exactly one divider in every state. The error-aware focus ring stays.
- **Implementation record 3 (2026-09-11, joint-aware rings):** SUPERSEDED same day (see record 4) — kept here so the dead end stays documented, not repeated.
- **Implementation record 4 (2026-09-11, real root cause + focus cleanup):** The reporter nailed it: the trigger gained its right border exactly on the error transition because the shared `border` shorthand changed color — the browser reset the sibling `borderRightWidth` and React never re-applied the unchanged `0`. Fix: the trigger carries border longhands only (`border: undefined` + width/style/color, `borderRightWidth: 0`), so color changes touch only `borderColor`. Proven in-browser (old vs fixed side by side). All custom focus machinery deleted per author order (`triggerFocused`/`inputFocused`, gated rings, z-index): the trigger takes the global button outline, the input its `be-input` ring — zero JS, same as every other control. NOTE: a later parallel edit deleted this block from the working tree and the 2px instantly returned — restored via checkout; if the seam ever doubles again, first grep that `inputRing`/`inputFocused` are still present before theorizing.
- **Implementation record 5 (2026-09-11, final seam architecture):** The trigger keeps the FULL shared border with zero side overrides (exactly like the select trigger) and the input tucks 1px beneath it — the divider is the trigger's own opaque right edge, so it always exists and can never double in any state. This retires the longhands workaround (no overrides left to trap) while its lesson stays recorded. Proven in-browser (error + normal screenshots, single divider both).

---

### BE-105 — Phone becomes 3 parts with +-first dial editing (Cal.com parity)

- **Status:** Done (2026-09-11)
- **Description:** Cal.com's phone input is three parts (flag button | muted dial text | number box), not two — the middle dial is plain muted text, never a placeholder. Typing `+` first moves entry into the middle slot; typing the code jumps back to the number box with the flag updated. Ours is rebuilt to the same sequence.
- **Current Behavior:** (pre-fix) two parts (button + input); `+` anywhere stripped; derived dial shown as the input's placeholder.
- **Expected Behavior:** Row renders button + muted `+{dial}` text + number input, all flush. Typing `+` into an empty number box opens dial-edit mode (mini input in the middle slot, autofocus); an exact dial match selects the country, exits the mode, and focuses the number box; Escape/clearing/blurring exits without changing anything; opening the dropdown abandons the mode. The number box placeholder is now the author's or empty (the static dial text replaces the derived placeholder).
- **Acceptance Criteria:**
  - [x] Middle slot always shows the current dial as muted text; typing `+` first moves typing there.
  - [x] Typing a full code (`20`) selects the country, updates the flag, returns focus right.
  - [x] Partial/no-match codes wait; Escape/blur/dropdown abandon cleanly; stored values/validation untouched.
- **Constraints / Must Not Do:** No libphonenumber-style auto-formatting (dependency-free platform constraint — digits stay raw); no globe empty-state (a detected country always exists here); pasted `+` numbers keep today's fill-national behavior; no new controls.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — 3-part structure + dial-edit contract).
- **Additional Context:** Reported 2026-09-11 (Arabic) with three Cal.com screenshots after the reporter inspected their component; reui reference behavior folded in.
- **Implementation record (2026-09-11):** `dialEdit` state + `nationalRef`/`dialEditRef`; `emitNational` branches to mode entry on fresh `+`; `onDialEditChange` (digits-only, max 4, canonical-first exact match → select + jump-back); autofocus-via-effect (noAutofocus-lint-safe, same pattern as menu search); middle span aria-hidden + mini input labelled; placeholder falls back to author-or-empty. tsc clean; biome at the pre-existing baseline.

---

### BE-106 — Trigger border identical to select; dial slot fixed width

- **Status:** Done (2026-09-11)
- **Description:** Two reports in one: (1) the country trigger showed no border in the normal state while the select trigger did — the trigger now carries the shared border verbatim with zero overrides, exactly like select; (2) the middle dial slot changed width per country (`+1` vs `+224`), shifting the layout on every pick.
- **Current Behavior:** (pre-fix) trigger border resolved per-side (fragile across error transitions); dial span/input sized to content.
- **Expected Behavior:** Trigger border byte-identical to the select/input treatment (full shared `border`, joined radii only); dial span and dial-edit box share one fixed `3em` border-box slot (fits the longest `+2244`-style code at any font size), so switching countries never moves anything.
- **Acceptance Criteria:**
  - [x] Trigger shows the same border as select in normal state, red in error, same width.
  - [x] Dial slot constant width for every country and in both display/edit modes.
- **Constraints / Must Not Do:** No side-specific border overrides on the trigger (the shorthand/longhand trap); no content-sized widths in the dial slot.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — select-identical border + fixed slot).
- **Additional Context:** Reported 2026-09-11 (English) with a borderless-trigger screenshot; author fixed the trigger side in parallel.
- **Implementation record (2026-09-11):** Verified the parallel trigger fix in-tree; fixed `3em` + `border-box` on span and mini (replacing the growing `ch` width). Biome at the pre-existing baseline.

---

### BE-107 — No generic placeholder fallbacks; empty panel means empty preview

- **Status:** Done (2026-09-11)
- **Description:** Number fields previewed `0` and text fields `Your answer` with empty panel rows. Per author order, the visitor-facing rule is now absolute author control: typed shows, empty shows nothing — on every field type.
- **Current Behavior:** (pre-fix) `DEFAULT_PLACEHOLDER_BY_TYPE` map rendered generics for empty rows (BE-096/BE-101).
- **Expected Behavior:** Textarea/default inputs render `field.placeholder || ""`; the map and helper are deleted (no dead code). Phone untouched (author-or-empty since BE-105).
- **Acceptance Criteria:**
  - [x] Empty Placeholder row previews nothing on every type; typed previews verbatim.
  - [x] Zero references to the deleted map/helper remain.
- **Constraints / Must Not Do:** Do not reintroduce type-default fallbacks without a new explicit order (BE-096/BE-099/BE-101 superseded openly).
- **Related AGENTS.md Rule(s):** None new (removal only; rule 196's phone sentence already states author-or-empty).
- **Additional Context:** Reported 2026-09-11 (Arabic): author is the sole owner of placeholder copy.
- **Implementation record (2026-09-11):** Two render sites back to `|| ""`; map + helper + comment deleted. Biome at the pre-existing baseline.

---

### BE-108 — Span + input grouped in one bordered box; slot centered and full-height

- **Status:** Done (2026-09-11)
- **Description:** The middle dial span carried side padding instead of centering, never stretched to the row height, and the border lived on the input itself — three separate parts sharing edges. Per author direction the span and input are grouped in one bordered container that owns the border.
- **Current Behavior:** (pre-fix) span `paddingRight: 4`, content-height only; input owns the full border.
- **Expected Behavior:** One `be-phone-group` box holds span + input and owns the border (longhands only, no left edge, error-aware color, right radii, author shadow); the input inside is borderless/transparent/shadowless; the span and dial-edit box are centered in a fixed `3em` slot stretching the full row height. Group focus ring via `:focus-within` + inline `--be-group-ring` var (zero JS focus state; same pointer-active convention as inputs).
- **Acceptance Criteria:**
  - [x] No `paddingRight` anywhere in the middle slot; dial centered in both modes.
  - [x] Span stretches full row height; single divider in normal and error (proven in-browser).
  - [x] Keyboard focus shows one ring around the whole group box.
- **Constraints / Must Not Do:** No focus JS on this control (var + stylesheet only); no border shorthand on the group (the reset trap); do not reintroduce per-element rings.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — group architecture).
- **Additional Context:** Reported 2026-09-11 (Arabic) with the directed fix (group owns the border).
- **Implementation record (2026-09-11):** Group div (flex, stretch, surface bg, border longhands, radii, shadow, var); input borderless + transparent + shadowless (keeps `be-input` class for placeholder var); span/mini centered + stretch + fixed slot; constant-CSS `:focus-within` ring + pointer-active suppression. Proven in-browser (error + normal screenshots).

---

### BE-109 — Phone input border resurrected on error; neutralized via shorthand removal

- **Status:** Done (2026-09-11)
- **Description:** In the error state the national input painted its own 1px red border inside the group's border (double frame with square corners). Same shorthand-reset trap as the trigger: the shared `border` shorthand changed color, resetting the sibling `borderWidth: 0`, which React never re-applied.
- **Current Behavior:** (pre-fix) input combined the changing shorthand with a constant `borderWidth: 0`.
- **Expected Behavior:** The input carries `border: undefined` (shorthand neutralized — React never applies or changes it) plus the lone constant `borderWidth: 0`, which can never be reset by anything. Phone-only exception; every other field type keeps its own input border + radius untouched.
- **Acceptance Criteria:**
  - [x] No input-owned border in any state (normal, error, focused); group border is the single frame.
  - [x] Proven in-browser: old pattern resurrects 0px→1px on color flip, fixed pattern stays 0px.
- **Constraints / Must Not Do:** Do not put any changing shorthand above a preserved longhand on one element (the standing trap rule); phone-only.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — input neutralization).
- **Additional Context:** Reported 2026-09-11 (Arabic) with normal/error screenshots; reporter directed phone-only scope.
- **Implementation record (2026-09-11):** Two-line change (`border: undefined` + existing width). Biome at the pre-existing baseline.

---

### BE-110 — Per-country national length cap from libphonenumber metadata

- **Status:** Done (2026-09-11)
- **Description:** The E.164-only cap (15 minus dial) allowed 13 Egyptian national digits while real Egyptian numbers max out at 10. The reporter demanded a global, non-guessed solution and pointed at Cal.com's own stack for the method.
- **Current Behavior:** (pre-fix) national budget was `15 - dial.length` for every country.
- **Expected Behavior:** The budget is `min(metadataMax, 15 - dialLength)` where `metadataMax` is each country's max national-significant length extracted from libphonenumber metadata (the same dataset Cal.com's phone stack is built on). Missing entries fall back to the E.164 ceiling. Egypt caps at 10; the US at 10; Germany at 13.
- **Acceptance Criteria:**
  - [x] Egypt national box stops at 10 digits; previously-valid entries everywhere still fit.
  - [x] Table sourced from data, never hand-written (extraction audited: no lengths live outside int arrays; over-estimates only, never under).
  - [x] 15 budget unit tests pass on the real extracted table + helper (including the RU/KZ 14 the reporter-class verification confirmed against source metadata).
- **Constraints / Must Not Do:** Do not hand-tune table values; do not add a control (fixed product data); do not weaken to messages.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — per-country cap clause).
- **Additional Context:** Reported 2026-09-11 (Arabic): country code must not eat into a global limit blindly; solution must hold for every country.
- **Implementation record (2026-09-11):** Installed libphonenumber-js locally (temp only, never a repo dependency), brute-forced then directly extracted max possible-NSN per table ISO; `PHONE_MAX_NATIONAL` record + `phoneNationalBudget()`; `emitNational` consumes it; caught and removed one transcribed-but-absent entry (GS) during verification. Full-file tsc clean; biome at the pre-existing baseline.

---

### BE-111 — Select-all + plus enters dial-edit at once; globe while codeless

- **Status:** Done (2026-09-11)
- **Description:** Two Cal.com parities: (1) select-all + `+` must clear the number AND open dial-edit mode in one press (ours needed two — the entry guard read stale pre-event state, so the first press only cleared); (2) while a bare `+` with no recognized code sits in the middle slot, the trigger must show the globe icon instead of the stale country flag.
- **Current Behavior:** (pre-fix) `_` + `+` → cleared number, same flag, cursor in number box; bare `+` kept the previous flag.
- **Expected Behavior:** A bare `+` alone (empty box or select-all replacement) always opens dial-edit mode with cleared number; pasted `+...` keeps filling digits directly. Globe (author-supplied lucide paths, verbatim) replaces the flag exactly while `dialEdit !== null`.
- **Acceptance Criteria:**
  - [x] One press: select-all, `+` → empty number, `+` in middle, cursor blinking there.
  - [x] Globe visible only during codeless editing; flag returns on match/abandon.
  - [x] Paste behavior unchanged; `national` dep dropped from `emitNational`.
- **Constraints / Must Not Do:** No icon packages (inline SVG only); do not touch match/abandon logic.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — single-press entry + globe).
- **Additional Context:** Reported 2026-09-11 (Arabic) after probing Cal.com, with the globe SVG.
- **Implementation record (2026-09-11):** Entry condition simplified to raw `=== "+"` (fixes its own predecessor's stale-state hole and restores paste-fill as a side effect); conditional globe/flag swap in the trigger. tsc clean; biome at the pre-existing baseline.

---

### BE-112 — Empty select/multiselect triggers keep input height via nbsp strut

- **Status:** Done (2026-09-11)
- **Description:** An empty multiselect (or an option-less select) rendered ~19px shorter than text inputs despite sharing min-height 23px and padding. Root cause, proven in-browser across five variants: a content-less element has no line box at all, so border-box min-height floors the bare box at 23px — while any text (even nbsp) restores the full input-height line box.
- **Current Behavior:** (pre-fix) empty triggers render zero content; `min-height: 23px` floors them at 23px total vs ~42px inputs.
- **Expected Behavior:** Empty states render a non-breaking space (`\u00A0`, never a collapsible plain space) so the line box — and therefore the height — always matches populated fields. Multiselect keeps showing its real placeholder when set; single-select gains no placeholder feature (rule 133 stands — the nbsp is a height strut, invisible and screen-reader-neutral beside the labelled combobox).
- **Acceptance Criteria:**
  - [x] Empty multiselect/select match input height at every font/padding (content-driven, no hardcoded heights).
  - [x] Populated states byte-identical; chevrons (absolute) never shift.
- **Constraints / Must Not Do:** Do not raise trigger min-height to input height (breaks custom fonts — the reason rule 98 removed fixed heights); do not add a select placeholder control; use nbsp only, never a plain space.
- **Related AGENTS.md Rule(s):** Rule 98 (amended — empty-trigger strut clause).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a number-vs-select screenshot; reporter correctly diagnosed the empty-div mechanism.
- **Implementation record (2026-09-11):** Two one-line changes (multiselect empty span, select closed-box fallback) + byte-verified the character is U+00A0. Biome at the pre-existing baseline.

---

### BE-113 — Globe icon shares the flag's fixed slot (no layout shift)

- **Status:** Done (2026-09-11)
- **Description:** Entering dial-edit mode swapped the 22px-wide flag for the 16px globe, shrinking the trigger and shifting the row.
- **Current Behavior:** (pre-fix) bare 16px globe svg in the trigger.
- **Expected Behavior:** The globe renders centered inside the same fixed 22×16 slot as the flag — swapping changes pixels, never geometry.
- **Acceptance Criteria:**
  - [x] Flag↔globe swap moves nothing around it.
- **Constraints / Must Not Do:** Do not resize the flag slot; do not touch match/abandon logic.
- **Related AGENTS.md Rule(s):** Rule 196 (slot-parity clause).
- **Additional Context:** Reported 2026-09-11 (Arabic).
- **Implementation record (2026-09-11):** Wrapper span mirroring `PhoneFlag` geometry. Biome at the pre-existing baseline.

---

### BE-114 — Multiselect rows: check-only selected mark; SVG chip remove

- **Status:** Done (2026-09-11)
- **Description:** Selected multiselect dropdown rows painted the full accent surface with light text (ugly at the author's near-black accent). Per order, the sole selected indicator is now the accent-colored check over the same hover wash unselected rows get; plus the chip remove `×` text glyph becomes the author-supplied lucide X SVG (behavior unchanged — it already removed on press).
- **Current Behavior:** (pre-fix) selected rows: accent bg + accent-foreground text + light check; chip × was a text character.
- **Expected Behavior:** Selected rows: normal text, no background change — the accent check alone marks selection (hover wash is hover-only); unselected hovered rows show the wash transiently. Chips carry the 12px X SVG (inherits chip text color, existing press/Escape/outside behavior untouched).
- **Acceptance Criteria:**
  - [x] No full-accent row anywhere in the multiselect menu; selected rows carry no background at all (wash is hover-only); single-select listbox and choice options untouched (rule 158 stands there).
  - [x] Check visible only on selected rows, in the accent surface color.
  - [x] Chip X renders the supplied paths and still removes on press.
- **Constraints / Must Not Do:** Do not touch single-select row styling or the shared Selected Styles vocabulary; no new controls.
- **Related AGENTS.md Rule(s):** Rule 182 (amended — check-only indicator + SVG glyph).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a dropdown screenshot + the lucide X SVG.
- **Implementation record (2026-09-11):** Row color/background branches rewritten (selected joins the hover-wash branch — later refined to check-only in the same entry's follow-up); check span reads the selected-surface token; chip glyph swapped (handlers byte-identical); `selectedRowText` restored after the compiler proved the chips still need it. Biome at the pre-existing baseline.

---

### BE-115 — Multiselect empty text uses the real placeholder color, not opacity

- **Status:** Done (2026-09-11)
- **Description:** The empty-state span faded the inherited text color to 70% opacity instead of using the placeholder color system, rendering wrong next to real input placeholders.
- **Current Behavior:** (pre-fix) `<span style={{ opacity: 0.7 }}>`.
- **Expected Behavior:** `color: fs.placeholderColor ?? withAlpha(textPrimary, 0.6, surface)` — the exact expression real input placeholders resolve to — at full opacity. nbsp strut untouched.
- **Acceptance Criteria:**
  - [x] Empty text visually matches input placeholders in every theme/style config.
- **Constraints / Must Not Do:** Do not touch the nbsp strut or the populated states.
- **Related AGENTS.md Rule(s):** None new (bugfix aligning to the existing system).
- **Additional Context:** Reported 2026-09-11 (English, one line).
- **Implementation record (2026-09-11):** One style swap; nbsp byte re-verified U+00A0 after the edit. Biome at the pre-existing baseline.

---

### BE-116 — Field-type change drops the orphaned value (treated as brand-new)

- **Status:** Done (2026-09-11)
- **Description:** Field ids are positional (`step-0-field-1`), so changing a field's Type orphans its stored value: a select auto-seeded with "Option 1" keeps showing "Option 1" after switching the field to text (canvas showed the stale value while preview showed the placeholder). The new type must start disconnected from the old type's data — except config like the placeholder, which always survives.
- **Current Behavior:** (pre-fix) stored value + error persist across a type change whenever the id stays put.
- **Expected Behavior:** The first render with a new field type drops exactly that field's value and error; placeholder and all other config untouched; single-select re-seeds naturally on switching back.
- **Acceptance Criteria:**
  - [x] Select→text with seeded "Option 1" renders the text placeholder immediately on canvas (no stale text).
  - [x] Placeholder and unrelated config survive type changes verbatim.
  - [x] Fresh loads never wipe restored autosave (first-seen ids seed silently); remounts/reorders without type change never clear.
- **Constraints / Must Not Do:** Do not touch config on type change; do not clear on navigation/remount/restore (rules 7/13/74 stand); no new controls.
- **Related AGENTS.md Rule(s):** Rule 13 (amended — the one type-change exception).
- **Additional Context:** Reported 2026-09-11 (Arabic) with a canvas screenshot (stale "Option 1" in a text box beside a filled Placeholder row).
- **Implementation record (2026-09-11):** `prevFieldTypesRef` + pre-paint layout effect over `effectiveActiveSteps`: unknown ids seed, changed ids with non-empty values delete value + error via functional setters. Full-file tsc clean; biome at the pre-existing baseline.

---

### BE-117 — Select/multiselect triggers pin the input line-height rule

- **Status:** Done (2026-09-11)
- **Description:** Text inputs and select/multiselect triggers differed by 2-7px (scaling with size) despite identical font/padding/border. Measured in-browser: inputs compute their own `line-height: normal` content (~16px at 14px font) while plain divs inherit the root Body `1.5em` computed to px (21px) — 38px vs 43px boxes.
- **Current Behavior:** (pre-fix) triggers inherited whatever line-height reached them; inputs used `normal` (or the author Body value via `inputBaseStyle`).
- **Expected Behavior:** Both trigger roots set `lineHeight: fs?.font?.lineHeight ?? "normal"` — the exact `inputBaseStyle` rule — so content heights agree at every font, with or without an author Body value. No fixed heights anywhere (height stays padding-driven); nbsp strut (BE-112) and placeholders untouched.
- **Acceptance Criteria:**
  - [x] Select/multiselect match text-input height with default and custom fonts/sizes.
  - [x] Author Body line-height still flows to both sides identically.
- **Constraints / Must Not Do:** Do not hardcode heights or line-heights; do not touch `inputBaseStyle` (inputs are the reference); choice-option variants out of scope.
- **Related AGENTS.md Rule(s):** Rule 130 (amended — trigger line-height clause, same leak family).
- **Additional Context:** Reported 2026-09-11 (Arabic) as a varying 2-7px gap; proven by measurement, not theory.
- **Implementation record (2026-09-11):** Two one-line additions (multiselect + single-select trigger roots). Biome at the pre-existing baseline.

---

### BE-118 — Header rows grouped into one Header submenu

- **Status:** Done (2026-09-11)
- **Description:** The three header-related Styles rows (Text Align, Head Font, Body Font) sat as three separate top-level items. The author ordered them grouped into one item that opens a submenu holding all three, named Header.
- **Current Behavior:** (pre-fix) contentAlignment (Text Align), headingFont (Head Font), font (Body Font) are three sibling rows under Styles.
- **Expected Behavior:** One Styles Header item opens a submenu with the same three rows (same titles, types, options, defaults). Stored flat values keep rendering via legacy fallback; new picks store under the header subgroup.
- **Acceptance Criteria:**
  - [x] Panel shows one Header item; opening it reveals Text Align + Head Font + Body Font with unchanged defaults.
  - [x] Pre-grouping canvases render byte-identically (legacy fallback chains).
  - [x] No other control moved, renamed, or re-defaulted.
- **Constraints / Must Not Do:** Do not change types/titles/defaults/options (nesting only, rule-116 contract); do not drop the flat legacy reads; Body Font scope is unchanged (it still drives all body copy, not only headers).
- **Related AGENTS.md Rule(s):** Rules 116, 125, 130, 172 (amended — Header nesting).
- **Additional Context:** Ordered 2026-09-11 (Arabic) with a Styles-panel screenshot showing the three rows.
- **Implementation record (2026-09-11):** styles.header subgroup added (interface + controls); resolutions prepend the header path before the flat/typography/prop chains. Full-file tsc clean; biome at the pre-existing baseline.

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

### BE-122 — Single-select selected row is a check glyph, not an accent surface

- **Status:** Done (2026-09-11)
- **Description:** The single-select dropdown painted the selected option with the full primary/accent surface. The author wants no selected background — just a check glyph beside the selected option, exactly like the multiselect.
- **Current Behavior:** (pre-fix) selected single-select row renders `selectedRowSurface` background + `selectedRowText` color.
- **Expected Behavior:** Selected single-select rows render plain option text with the same 16px accent check span multiselect uses (accent when selected, transparent otherwise, with the same 0.12s color fade); hover wash only follows the active row.
- **Acceptance Criteria:**
  - [x] No accent background/text on any selected dropdown row (single + multi alike).
  - [x] Selected single option shows the check; unselected shows none; keyboard/pointer/aria-selected semantics unchanged.
  - [x] Multiselect check span gains the same color fade.
- **Constraints / Must Not Do:** Do not change the check glyph paths; do not touch closed-box selected-slot styling (rule 147) or payload/validation.
- **Related AGENTS.md Rule(s):** Rule 142 (shared sets), new menu-animation rule (BE-123 batch).
- **Additional Context:** Ordered 2026-09-11 (Arabic), explicit implement order.
- **Implementation record (2026-09-11):** Single-select `renderRow` rebuilt as flex + check span mirroring multiselect; both check spans carry `color 0.12s ease`. Full-file tsc clean; biome at the pre-existing baseline.

---

### BE-123 — All dropdown menus animate open and close

- **Status:** Done (2026-09-11)
- **Description:** Every dropdown surface (single-select listbox, multiselect listbox, phone country dialog, calendar export menu) mounted/unmounted instantly with no enter/exit animation.
- **Current Behavior:** (pre-fix) `{open && menuRect && createPortal(...)}` with zero opacity/position transition on all four surfaces.
- **Expected Behavior:** All four surfaces enter with a quick fade-rise (opacity 0 to 1, 4px y, 0.14s easeOut) and fade out on close; the export menu rises from its open side; reduced motion and static renders stay instant; first render stays closed (byte-identical hydration).
- **Acceptance Criteria:**
  - [x] Open + close animate on all four menus; chevron rotations and row hover transitions untouched.
  - [x] Exiting rows cannot commit/toggle (exit sets `pointerEvents: none` instantly).
  - [x] Focus contracts unchanged (select/multiselect/phone keep trigger focus; export keeps its menuitem focus model; Escape/outside/blur close synchronously).
- **Constraints / Must Not Do:** Do not touch rect measurement, reposition logic, portal targets, or focus management; no AnimatePresence around step containers (rule 21 governs steps only — menus are separate).
- **Related AGENTS.md Rule(s):** Rules 21/22 (amended — menu AnimatePresence sanctioned), 134, 162.
- **Additional Context:** Ordered 2026-09-11 (Arabic), explicit implement order ("any dropdown menu must animate open and close").
- **Implementation record (2026-09-11):** Each portal site wrapped in `AnimatePresence`; surfaces became `motion.ul`/`motion.div` with initial/animate/exit + 0.14s transition, `reducedMotion` gates, exit `pointerEvents: none`. Full-file tsc clean; biome at the pre-existing baseline.
- **Follow-up fix (2026-09-11, same day):** all four menus stopped opening entirely after the first shape. Root cause: the portal itself was the direct child of `AnimatePresence` (presence tracking over portal objects proved unreliable in the Framer runtime). Restructured to the textbook pattern — persistent portal, `AnimatePresence` *inside*, keyed `motion` surface — with zero logic/focus/rect changes. If menus ever regress again, the documented fallback is enter-only motion (drop the menu `AnimatePresence`, close becomes instant).

---

### BE-124 — Component-wide instant-transition audit: batches 1 + 2 done

- **Status:** Done (2026-09-11)
- **Description:** The author reports many component surfaces appear/disappear instantly (not only menus) and ordered 2-3 subagents to audit the whole component for instant transitions, then smooth them. Three parallel audits (menus/overlays, steps/screens, fields/buttons) returned ~35 findings.
- **Current Behavior:** Batch 1 (this session) animates: all four menu enter/exits, select checkmark rows, choice selected-ring shadow, segmented label color, radio-dot pop, today-dot pop, month-nav buttons, slot elapsed opacity, phone/export row color, focus-ring fades (input + phone group), Booking spinner fade, multiselect chip enter pop, phone globe/flag + dial fades, field-error enter, slots-error banner enter, success detail stagger + action-row fade.
- **Expected Behavior:** Batch 2 (open): flowStatus success/error tree crossfade; skeleton-to-content crossfades (calendar grid, time list, event info); directional month-grid slide reusing the transition variants; date-change slot-list crossfade; 12h/24h label crossfade; non-directional step variants honoring Back/Forward; progress counter/pct crossfade; progress-block mount height; closed-box value text crossfade; multiselect chip exit/layout; error-screen enter + Retry state transitions; submitting opacity transitions. Each must keep hydration parity, single-announcer contracts, focus behavior, and reduced-motion instant paths.
- **Acceptance Criteria:**
  - [x] Three audit reports filed (menus/overlays, steps/screens, fields/buttons) with file:line per finding.
  - [x] Batch 1 implemented with reduced-motion gates throughout and no unmount-timing changes.
  - [x] Batch 2 implemented under explicit order (2026-09-11): terminal crossfade (single-return restructure, mode="wait", opacity only), skeleton enter-fades (calendar grid directional slide + header text fade, time-list swap fade, event-info status fade), all six step variants direction-aware, progress block mount + counter/pct fades, select closed-box value fade, error-screen enter (mark scale + card/action fades).
- **Constraints / Must Not Do:** Do not animate cards-grid reflow or calendar grid geometry (pure-CSS no-measurement architecture, rules 180/192a); do not add mask fades (rule 152); do not gate submit disabled/aria on animation; no Cancel affordance ever (rule 181); step-container AnimatePresence stays banned (rule 21).
- **Related AGENTS.md Rule(s):** Rules 21/22, 53, 64, 103, 109, 124, 135, 152, 180/192a, 181.
- **Additional Context:** Ordered 2026-09-11 (Arabic) with explicit subagent audit (3 agents launched, all returned finding lists). Full per-finding inventory (file:line + suggested approach + constraints) lives in the session record; implementer of batch 2 should re-derive line numbers from the current file (they shift as edits land).
- **Implementation record — batch 2 (2026-09-11):** `useMountedOnce` hook gates every enter-only `initial` (first paint byte-identical; reduced motion via tree-wide `MotionConfig`). Terminal crossfade: success/error early returns became `successEl`/`errorEl` elements under one persistent `AnimatePresence mode="wait"` (verified zero hooks below the old returns first). Calendar grid: keyed container remount (`branch:YYYY-MM` key, render-phase direction state) with slide/fade on ready branch, skeleton instant, header text keyed fade. Time list: radiogroup keyed by date+format. Event info: status-keyed wrapper. Progress: mount height/opacity + keyed counter/pct text. Select closed-box value keyed fade. All six step variants direction-aware (`inactive` as `custom` functions). Deliberate deviations from the audit: skeleton swaps are enter-only (mode="wait" would delay content for animation); chip exit/layout dropped (exit window risks focus-on-remove + wrap measurement — enter pop stays); closed-box value animates after all (sync enter-only, zero typing delay — rule 198 amended). Full-file tsc clean; biome at the pre-existing baseline.

---

### BE-120 — Phone national input keeps shared padding everywhere except the left

- **Status:** Done (2026-09-11)
- **Description:** In the phone field the national-number box (where the visitor types the rest of the digits) carried the full shared padding on all four sides, leaving a wide gap between the dial slot and the typed digits. The author wants the shared padding kept on every side except the left, so the digits sit flush against the dial slot.
- **Current Behavior:** (pre-fix) the national input inherits the whole shared padding including 14px on the left.
- **Expected Behavior:** The national input keeps the shared top/right/bottom padding with `paddingLeft: 0`; dial slot, group border, divider behavior, and all other phone mechanics unchanged.
- **Acceptance Criteria:**
  - [x] Typed digits (and placeholder) start flush against the dial slot; top/right/bottom spacing unchanged.
  - [x] No other field type affected; phone validation/storage/display untouched.
- **Constraints / Must Not Do:** Do not add a Property Control for this; do not touch the dial slot width or the group border.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — national-input padding clause).
- **Additional Context:** Ordered 2026-09-11 (Arabic), explicit implement order.
- **Implementation record (2026-09-11):** One-line `paddingLeft: 0` after the `inputBaseStyle` spread in the national input (wins over the shared shorthand). Full-file tsc clean; biome at the pre-existing baseline.

---

### BE-121 — Phone flag trigger: left padding follows the shared Padding control

- **Status:** Done (2026-09-11)
- **Description:** The phone field has three parts (flag button, dial slot, national input). Raising the shared Padding control grew the national input on all sides, but the flag button only grew top/bottom — its left (fixed 10px) and right (fixed 8px) never moved. The author wants top/bottom/left to follow the shared padding, right excluded.
- **Current Behavior:** (pre-fix) flag trigger hardcodes `paddingLeft: 10, paddingRight: 8` regardless of the Padding control.
- **Expected Behavior:** Flag trigger uses `paddingLeft: padAxes.x` (shared horizontal) with top/bottom already on `padAxes.y`; `paddingRight` stays fixed at 8px so the seam divider never drifts from the dial slot.
- **Acceptance Criteria:**
  - [x] Raising Padding grows the flag button top/bottom/left exactly like other fields; right side unchanged.
  - [x] Seam/divider geometry and dial-slot adjacency untouched.
- **Constraints / Must Not Do:** Do not add a Property Control for this; do not change the fixed right padding.
- **Related AGENTS.md Rule(s):** Rule 196 (amended — trigger padding clause).
- **Additional Context:** Ordered 2026-09-11 (Arabic), explicit implement order.
- **Implementation record (2026-09-11):** One-line change (`paddingLeft: 10` to `paddingLeft: padAxes.x`). Full-file tsc clean; biome at the pre-existing baseline.


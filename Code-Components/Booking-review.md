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
- **Implementation record 3 (2026-09-11, joint-aware rings):** The error-state thickness came from the focused half's own full ring (2px) stacking against the 1px divider. Both halves now paint three-sided rings omitting the seam edge (`inset 2px 0 0 0` trigger / `inset -2px 0 0 0` input, error-aware color) — one continuous ring around the joined control, single divider preserved in every focus state.


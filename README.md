# Vetly — Booking Engine fixes (BE-024 … BE-152)

Sessions: 2026-09-08 (BE-024…BE-050) + 2026-09-09 (BE-051…BE-054) + 2026-09-14 (BE-127…BE-131, BE-135…BE-152) · Skipped: BE-007 (per your instruction) · BE-036 left Open (needs a live Cal.com test event — isolated worktree spike per its own constraints) · BE-032 was already Done.

## What's in this zip

| File | Change |
| --- | --- |
| `Code-Components/BookingEngine.tsx` | The fixed component (all review tasks below implemented) |
| `Code-Components/Booking-review.md` | Open entries + template; Done blocks are pruned after their rule is recorded (AGENTS.md rule 132) |
| `AGENTS.md` | Amended + new rules 158–181 (earlier sessions), 200–204 (BE-127…BE-131), 205–206 (BE-135…BE-136), 207 (BE-138), 208 (BE-139), 209 (BE-140), 210 (BE-141, rewritten by BE-149, amended by BE-150), 211 (BE-142), 212–216 (BE-143…BE-147), 217 (BE-148), 218 (BE-149, amended by BE-150) and 219 (BE-150), 220 (BE-151) and 221 (BE-152); rules 58/131/190/198/199/200 amended, 201 amended twice (BE-137, BE-139), 205 amended (BE-140, BE-143), 192a amended (BE-142), 117/158/199/206/210 amended (BE-143…BE-147), 117/214 amended (BE-148), 87a/199/210 amended (BE-149), 87a/131/199/210/215/218 amended (BE-150), 215 amended (BE-151), and 87/90/199/210/218 amended (BE-152) |
| `Booking-Buttons-Reference.html` | Static visual reference of the final button model (all clicks dead) |

## How to apply

Copy each file over the matching file in your repository / Framer project source, keeping the same relative paths. BookingEngine.tsx is a self-contained Framer code component — paste it into the Framer code editor (replacing the whole file) if you manage it there.

## What was implemented

### BE-024 … BE-037 (2026-09-08)

- **BE-024 — Selected Styles subgroup:** the flat Selected BG/Text/Border rows became one `Selected Styles` item with the full vocabulary (Font, Color, Fill, Radius, Padding, Border, Shadow). Applies to selected cards/pills/radio options (full vocabulary), the segmented thumb (colors only), and the select listbox's selected row (colors). Legacy stored values keep winning.
- **BE-025 — Check Size moved:** now a row on each Checkbox field (visible only for checkbox type; default 18, range 12–32). Stored values migrate.
- **BE-026 — Shadow clipping fixed:** the form's `overflow: hidden` became `clipPath: "inset(-24px)"` — configured field shadows render whole on all sides while step transitions stay bounded. The step-visibility architecture is untouched.
- **BE-027 — Button Texts submenu (3 rows per rules 161/166):** one `Buttons > Button Texts` submenu holds Next Step ("Continue") / Back Step ("Back") / Final Action ("Book Now") and nothing else. Cancel and Retry are fixed constants with no control, interface key, or legacy carrier. The ten per-button single-row groups are gone; every stored custom label still resolves (three-level legacy chain).
- **BE-028 — Hard-coded fixed labels:** Book another, Add to Calendar, and the new menu labels (Google Calendar / Microsoft Office / Microsoft Outlook / Other) are constants. The full audit table (keep-editable vs hard-code, with reasons) is recorded on the BE-028 entry.
- **BE-029 — Add to Calendar dropdown:** one trigger button opens a styled menu (portaled, ARIA menu pattern, full keyboard support) with the four provider options and 20×20 brand icons. Microsoft Office is a new deep link (outlook.office.com). Styled from the Calendar Links shared set — no second styling system.
- **BE-030 — Export titles carry the event name:** ICS + Google + Office + Outlook all read `<Cal.com event title> <Appointment suffix>` (e.g. "15 Min Meeting Appointment"); missing title keeps today's fallback. Non-blocking, no new controls.
- **BE-031 — Manage label:** the "Reschedule or cancel" default became "Manage" (control stays editable; stored customs keep rendering).
- **BE-033 — Done removed:** no button, label, group, interface key, or destination constant remains. The success row is: Add to Calendar dropdown → Manage → Book another. No auto-redirect (explicit visitor action only).
- **BE-034 — Success details order:** Name, Email, Date, Time always lead (in that order), then remaining values in entry order, then Confirmation ID last.
- **BE-035 — Confirmation ID:** hard-coded "Confirmation ID" label (no control / interface key / legacy carrier; stored customs intentionally freeze).
- **BE-037 — Buttons reference refreshed:** Booking-Buttons-Reference.html mirrors the final component.

### BE-038 … BE-045 (2026-09-08)

- **Button Texts consolidation (BE-038):** Retry/Cancel rows gone — exactly Next Step / Back Step / Final Action remain; stored customs freeze to "Try again".
- **Identity mandatory (BE-039/BE-046):** every Primary Name text field and every email-typed field is always required (forced at normalize, Required row hidden); duplicates resolve first-wins with canvas warnings.
- **Attendee failure copy (BE-040):** Cal.com contact/attendee rejections map to an actionable message, never raw API text.
- **Failure text balance (BE-041):** the error screen's terminal column uses balanced text wrapping.
- **Terminal marks fixed (BE-042/BE-043):** both marks are 48px circles with 24px glyphs; the success mark uses the failure mark's layered concentric construction.
- **Content Alignment in Styles (BE-044):** the global alignment control is the first Styles row; the one-row Content group is gone.
- **Density deleted (BE-045):** no Density control, key, or ratio table — spacing renders Comfortable values directly.

### BE-046 … BE-050 (2026-09-08)

- **First-wins identity (BE-046):** exactly the first Primary-Name flag and first email field are forced required; later duplicates are ordinary fields.
- **Terminal header rows (BE-047):** Left/Right alignments render mark + text side by side; Center keeps the stacked treatment.
- **Brand icons (BE-048):** the calendar menu rows render the true provider SVGs with per-icon namespaced IDs.
- **Merged calendar button (BE-049):** one Manage-styled split-button opens the menu (calendar options + trailing Manage item); Book another stays far-right primary.
- **Terminal action align (BE-050):** success/failure action rows follow Buttons Alignment in Grouped mode, keep definitional positions in Split.

### BE-051 … BE-054 (2026-09-09)

- **BE-051 — ARIA labels hard-coded:** the Accessibility Labels submenu, its keys, and all reads are gone; the eight labels render from fixed internal constants (stored customs freeze, same discipline as BE-028/BE-035). Announcements byte-identical.
- **BE-052 — Duplicate flag escalation:** true sibling-aware hiding is impossible in Framer controls (verified), so later Primary-Name flags get an error-toned notice under the field plus the banner. Runtime stays first-wins; single-flag canvases byte-identical.
- **BE-053 — Cards grid pure CSS:** Width Full = `auto-fit` (options share the row), Fit = `auto-fill` (fitted look); the JS-measured column count (and its reload flash) is gone. Stored values stay `full`/`half` (title-only rename).
- **BE-054 — Cancel removed:** no in-flight Cancel button, label, handler, or Escape-to-cancel. Abort-on-unmount and abort-on-Edit-jump stay (each justified); loading/timeout/retry/failure paths unchanged.

### BE-127 … BE-131 (2026-09-14)

- **BE-127 — Progress bar has one fixed animation:** the progress block no longer inherits the step Transition Type. It is a plain container whose only motion is the fill's own left-to-right `scaleX` grow (`PROGRESS_BAR_TRANSITION`); the BE-124 batch-2 `surfaceEnterExit` wrapper and the keyed counter/percent fades were removed. Switching any of the six Transition Type variants leaves the bar unchanged; step-content transitions are untouched.
- **BE-128 — Progress bar versions:** a new `Progress Bar Version` control (Full Width / Compact / Minimal, default Full Width) resolved through one `PROGRESS_VERSION_SPECS` table. Solid/Dashed stays; `full` renders byte-identically to before. *(The version list was later reworked by BE-137 and BE-139 — see the progress-bar session below.)*
- **BE-129 — Per-side field borders:** `resolveFieldBorder` now keeps each side's width independently and one `fieldBorderCss` helper emits `border-top/right/bottom/left-width`. Bottom-only `0/0/2/0` and mixed Top 3 / Bottom 1 now render per side; all-sides mode is unchanged; explicit `0` survives.
- **BE-130 — Section spacing relocated:** Progress Gap → `Progress`, Heading Gap → bottom of `Header`, Footer Gap → bottom of `Buttons > Layout`. Same Number/0–64/32 defaults and runtime effect; the flat `styles.*Gap` keys remain as legacy carriers. **Decision: keep three separate controls, not one global gap.**
- **BE-131 — Typography caps:** one `FONT_CAP` table (text 12–18 / head 16–48 / body 11–18) enforced at every text control via `clampFontPx` with px/rem/em/% normalization; line height capped at 1–2em / 200% / 20px by unit; letter spacing capped at [−0.1, 0.5] em/unitless and [−2, 8] px. No control removed; defaults are inside the new ranges.

### BE-135 … BE-136 (2026-09-14) — underline-field redesign

- **BE-135 — Scoped underline field style:** a new `Field Styles > Field Shape` Enum (Boxed / Underline, default Boxed). `Underline` renders only the boxed-input family (text, email, phone, number, url, textarea, select, multiselect) with a transparent fill, `border-radius: 0`, and a bottom-edge-only border — while segmented, pills, cards, radio, checkbox and the calendar keep their own fills and radii. Underline thickness stays tunable via `Field Styles > Border > Bottom`. The dropdown menus keep their full boxed frame, and `--be-autofill-bg` follows the transparent fill so autofill cannot repaint the field. Decision recorded openly (AGENTS.md rule 205, amending rules 58/131 per rule 140).
- **BE-136 — Hideable field labels:** a new per-field `Hide Label` Boolean (default off). When on, the label element leaves the DOM and the placeholder guides the visitor; the plain input, textarea and phone national input gain an `aria-label` so the accessible name survives. `field.label` is never cleared, so the name/email identity heuristics, payload, success rows and `{name}` token keep working, and toggling it never rekeys autosave.

### BE-137 … BE-139 (2026-09-14) — progress bar

- **BE-137 — Bar Version list:** `Minimal` removed (too small to read); `Full Width` renamed `Full`; `Compact` narrowed 160px → **128px**. `Full` still renders byte-identically. (The `Minimal` removal and the `Compact` naming were both superseded by BE-139 the same day.)
- **BE-138 — the dashed bar now sweeps:** the real cause of the reported fade was the Dashed style (the default), whose segments cross-faded `background-color` between surface and accent — which is why BE-127's fix changed nothing visible. Each segment is now a surface track wrapping an accent fill that sweeps `scaleX` with `transformOrigin: left center` on the same `PROGRESS_BAR_TRANSITION` as the solid fill: forward grows left-to-right, back retracts right-to-left. No colour transition remains on any progress segment.
- **BE-139 — the second version is `Minimal`, 4px tall, and uses the Styles-tab Radius token:** `Compact` renamed to `Minimal`, height 3px → **4px**, and its hard-coded `999px` pill radius removed in favour of the same `Radius` token `Full` already inherits — so changing `Radius` in the Styles tab re-shapes **both** versions together, and no version owns a private radius. A canvas that stored the retired `"compact"` value resolves to `Minimal`; anything else unknown resolves to `Full`.

## Verification

- `tsc --noEmit` (strict, React 18 types) passes clean against framer/framer-motion shims.
- Original tab indentation preserved (whitespace-normalized during editing, restored byte-exactly; final diff ≈ 784 insertions / 314 deletions of real content).
- All legacy-carrier contracts (AGENTS.md rules 142/154) honored — no saved canvas silently restyles.
- `biome.json` covers the whole repo (`biome check` green), with two deliberate carve-outs: `framer-scripts/` is excluded (generated canvas-runner code, not shipped), and `noNoninteractiveElementToInteractiveRole` is off for `BookingEngine.tsx` only — its autofix (strip `role=listbox/option`) would destroy the ARIA listbox pattern of rules 134/162. Every other suppression in the component is an inline `biome-ignore` with its reason on the line.

### BE-127…BE-131 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** — zero new type errors introduced. (The residual errors are pre-existing shim noise from framer-motion's loose typing.)
- `biome lint` reports only the one pre-existing `suppressions/unused` warning at the grid-calendar `biome-ignore` — no new lint problems.
- Line endings (CRLF) preserved byte-for-byte; the diff is content-only (`git diff --stat`: 1 file changed).
- No saved canvas silently restyles: `full` progress spec, all-sides border mode, the three gap controls' defaults, and every typography default are all inside/identical to their prior values.

### BE-135…BE-136 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** (20 = 20) — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning at the grid-calendar `biome-ignore` — no new lint problems.
- Byte-identity for untouched canvases: `fieldShape` absent/unknown resolves to `boxed` (today's render), `hideLabel` absent is `false` (label renders as before, no `aria-label` added), and neither key is in the config fingerprint — no autosave rekey.
- Known, deliberate non-change: the keyboard `:focus-visible` inset ring still applies to underlined fields (the engine's uniform focus affordance). A shape-aware focus treatment was out of scope for this order and would be a separate explicit decision.

### BE-137…BE-139 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** (20 = 20) — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning at the grid-calendar `biome-ignore` — no new lint problems.
- Untouched canvases unaffected: the `full` spec is unchanged, so a canvas on `Full` renders byte-identically. A canvas on the second version renders shorter and 4px tall (intended); the `Radius` token now drives both versions.
- The dashed bar keeps its exact look (segment count, gaps, track colour) — only the animation mechanism changed, so hydration parity and the static-render path still match (both draw the same geometry as a plain `scaleX` div).
- BE-139 caught and fixed one regression of its own making: reading the stored value through the narrowed `ProgressBarVersion` type made the legacy `"compact"` comparison an impossible-overlap `TS2367` error (21 errors vs. the 20 baseline). The read was widened to `string | undefined` at the single resolution site — the honest type for unvalidated canvas data — returning the count to 20.

### BE-140 (2026-09-14) — a transparent field Fill no longer makes the dropdowns transparent

- **BE-140 — the menus own their surface:** setting `Field Styles > Fill` to a fully transparent colour used to make all three dropdown menus see-through, so the page showed through the open listbox. The menus now paint `theme.surfaceColor` — the **existing `Surface` control** in the Styles tab — instead of the field's Fill. No new Property Control, so the author keeps full control of every overlay surface through a control that already exists, and the three field menus now match the progress-bar tracks and the calendar-export menu, which already used that token. This completes BE-135's decoupling, which had separated the menus' border and radius from the input frame but left the background shared.

### BE-140 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** (20 = 20) — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning at the grid-calendar `biome-ignore` — no new lint problems.
- **Byte-identity for untouched canvases is proven, not assumed:** `Field Styles > Fill` carries no `defaultValue` (`fieldStylesColorControl` returns `{ type, title, optional: true }`, deliberately default-free so colour keys track the live theme tokens). On an untouched canvas `fs.backgroundColor` is `undefined`, so the old `??` already resolved to `theme.surfaceColor` — dropping the read changes nothing until the author explicitly sets a Fill.
- **No author freedom removed:** the five input-side reads of `fs?.backgroundColor` are untouched (the phone group frame and national input, `FieldRenderer`'s `fsInputBackground`, the select trigger's `backgroundColor` prop and the `trackBackground` prop), so a transparent input fill and BE-135's underline shape keep working exactly as before. Only the three `menuSurfaceStyle` blocks changed — a single `replace_all` edit against the exact indented string, which matched those three lines and nothing else.
- Deliberately **not** added: alpha inspection of the `Surface` token, or a hardcoded opaque fallback. That would be a computed colour correction (rules 1–3) and would desynchronise the menus from the progress track and calendar menu sharing the same token. A translucent `Surface` token remains the author's global, visible choice.

### BE-141 (2026-09-14) — one 12px minimum across every padding control

- **BE-141 — padding floor:** every padding surface in the component now floors at **12px** — field styles, calendar styles, the selected-option styles and the three button style groups — through a single `PADDING_FLOOR = 12` constant that all four runtime clamps read. Framer's `ControlType.Padding` exposes no min/max, so the runtime clamp is the only enforcement site. Each regime keeps its own ceiling (fields/selected 16, button Y 20 / X 32). `resolveFieldPadding`'s `paddingY` fallback moved from a literal `10` to `PADDING_FLOOR` — identical output, but no longer a default the clamp always rewrites.

### BE-141 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** (20 = 20) — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning at the grid-calendar `biome-ignore` — no new lint problems.
- **Untouched canvases are byte-identical, by construction:** `resolveFieldPadding` returns the field type's effective default **unclamped** when the author has set neither `padding` nor `paddingX`/`paddingY`, and `resolveButtonStyle` falls back to the unclamped `role.padding` when `group.padding` is unset. The floor therefore only acts on values the author actually entered.
- **One known, accepted consequence, flagged to you:** five padding defaults sit *below* the new floor — pills (y 5), cards (y 10 / x 8), segmented (y 11 / x 10), the calendar widget (`0px`) and the button roles (`10px 16px`). They render unclamped while untouched, so nothing restyles today; but activating one of those style groups materializes the sub-floor default, which the clamp then raises to 12, so for those groups only the panel value and the render diverge. Removing that would mean raising those defaults — which would visibly change existing canvases — so it is left as your call, not done silently.

### BE-142 (2026-09-14) — the last field in a step can finally be half-width

- **BE-142 — the trailing-orphan guard is gone:** a field set to Width `Half` used to render full-width whenever it happened to be the last field in the step, so its width depended on its *position* rather than its Width setting — and adding a field after it retroactively resized it. That was a deliberate BE-126 guard ("a trailing lone Half spans both tracks") intended to avoid a half-empty row; it is now removed. The `halfOrphanId` pairing memo, the `forceFullWidth` prop, its interface key and its destructure default are all deleted. A `half` field now always spans one track, so a lone half field sits half-width with an empty track beside it — your explicit choice, and the honest reading of "Width is the only layout truth". Textarea keeps its unconditional full-width span.

### BE-142 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** (20 = 20) — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning at the grid-calendar `biome-ignore` — no new lint problems.
- Verified **zero** remaining references to `halfOrphanId` or `forceFullWidth` anywhere in the component, so no dead carrier or pass-through prop was left behind (rule 105).
- **Intended visible change, flagged to you:** any canvas whose last field is a lone `Half` will narrow to half-width. The empty track beside it is the requested behaviour, not a regression. The step still derives two tracks from config alone (`data-two-col` when any field is `half`), so a lone half field has a track to occupy.
- No hydration risk: the span is still derived purely from field config — the removal makes it *less* dependent on state, not more, so server/prerender/first-paint parity (rules 42/102) is unchanged.

### BE-143 … BE-147 (2026-09-14) — field panel, progress, and `Selected Styles`

Six orders in one pass. Details and rationale are in `AGENTS.md` rules 212–216 and in each `BE-14x` entry of `Booking-review.md`.

- **BE-143 — `Hide Label` is now scoped, and the field rows are ordered.** `Hide Label` is offered only where hiding a label is a real design: the boxed-input family that can take the Underline shape — text, email, phone, number, url, textarea, select, multiselect. Segmented, pills, cards, radio, checkbox, checkboxgroup and the calendar no longer offer it. The gate is one shared predicate, `supportsHiddenLabel(fieldType)`, which is literally `UNDERLINE_FIELD_TYPES.has(fieldType)` — so the two capabilities are a single list and cannot drift apart. The field panel's order is now `Type` (1st) → `Hide Label` (2nd) → `Label` (3rd); while `Hide Label` is Yes the `Label` row disappears, and setting it back to No restores the row with its previous value (hidden, never cleared). The gate is enforced in the render too, so a stored flag on a type that no longer offers the control cannot hide a label the panel says it cannot hide. Select and multiselect keep the ability — they are both in the underline family.
- **BE-144 — the progress bar can be aligned.** New `Bar Align` row (Left / Center / Right, default Left) in the Progress submenu. Left is the shipped position and emits nothing, so untouched canvases render byte-identically. Implemented as auto margins on the existing `width: 100%` + `maxWidth` containers — no wrapper element, no layout change to the surrounding block. Only the `Minimal` version is narrower than its container, so alignment is inert on `Full`; the row stays visible there so it never appears and disappears as you toggle versions. Alignment moves the **bar only** — the "Step X of Y" / "N% complete" row keeps its own full-width layout.
- **BE-145 — a cleared progress template now renders empty.** `Step Counter`, `Step Progress` and `Step Announcement Template` resolve with a plain `??` chain, so an explicit `""` is a value and only a genuinely unset key falls through to the legacy carrier / default. Two second-guesses that made a cleared row show the default anyway are gone: `formatStepCounter`'s own `|| DEFAULT` and a redundant `??` in the announcement text. The other copy rows are unchanged — a blank error or button label is still a broken row, so those keep the `firstNonEmpty` fallback.
- **BE-145 (answer) — where `Step Announcement Template` renders:** nowhere visible. It feeds the visually hidden `<output aria-live="polite">` live region as the per-step screen-reader announcement, with `{counter}`, `{percent}` and `{title}` tokens (default `"{counter}, {percent}% complete"`). That is why only `Step Counter` (top-left) and `Step Progress` (top-right) appear on screen.
- **BE-145 — the `Content` group hides with `Show Text` off.** With no text to write copy for, the whole group hides (and is restored untouched when `Show Text` goes back to Yes — `hidden` is never deletion). Rule 117's row list was also corrected: it still described the pre-BE-128 four-row menu.
- **BE-146 — the segmented field now has one padding and one radius.** `Selected Styles` no longer lists `Padding` or `Radius`. The shared `Field Styles > Radius` drives the track *and* the thumb — the thumb's radius is the track radius minus the track's fixed 3px inset, which is the only value that keeps it concentric. The shared `Field Styles > Padding` drives the active segment's interior like every other segment. Previously the selected padding was applied **twice** — as the thumb's inset *and* as the active button's own padding — so only the active segment got extra vertical padding, making it the tallest cell and growing the whole fieldset (which is what read as "padding around the outer container"), while the thumb shrank inside the track. The vertical axis was genuinely missing: `SegmentedControl` only accepted `optionPaddingX`, so the shared padding's Y never reached the segment buttons — `optionPaddingY` is now plumbed through. The track's own 3px padding is untouched, and a stored `selected.padding` / `selected.radius` still wins, so saved canvases render exactly as before.
- **BE-147 — switching `Selected Styles` on no longer applies a border.** The group's `Border` default was `1px solid #222222`, and Framer materializes an activated optional object's nested defaults — so a 1px dark border appeared the instant the group was switched on, before anything was configured. The default is now a **zero-width** border (zero is already a first-class value here: `BORDER_WIDTH_MIN` is 0 and an explicit `0` already means "remove the outline entirely"). The colour half matters too: `fsSelectedBorderColor` now ignores the border's colour while its width is 0, so materializing the default's `#222222` can no longer repoint `selectedRing` away from the live accent token and repaint the selected cards/pills/radio item.

### BE-143…BE-147 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** (20 = 20) — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning at the grid-calendar `biome-ignore` — no new lint problems.
- CRLF line endings preserved byte-for-byte; no new lines over the 100-char Biome limit.
- **Untouched canvases stay byte-identical, by construction:** `Bar Align`'s default emits an empty style object; the three progress templates only fall through to the default when a key is genuinely unset; `hideLabel` does not exist at HEAD, so the narrowing cannot affect a saved canvas; and `Selected Styles`' new border default renders the same nothing that the unset state rendered (the unset 1px ring is only ever visible against a non-accent fill, and setting one requires activating the group).
- **Intended visible changes, flagged to you:** (1) a segmented field whose author had raised `Selected Styles > Padding` will now follow the shared Field Styles padding instead — the `Selected Styles` rows are gone; (2) a canvas that stored `Selected Styles > Radius` keeps that value (legacy carrier), but a canvas that never set it now derives the thumb radius from the shared radius, which is what it already did unless the row had been touched; (3) a segmented field on a canvas that sets the shared `Field Styles > Padding` will now also take that padding on the **vertical** axis, which it previously ignored.
- The `Selected Styles` subgroup ships at HEAD, so both of its removed values (`padding`, `radius`) remain readable legacy carriers with their existing 12px floor and clamps — nothing was deleted from the render path, only from the panel.

### BE-148 (2026-09-14) — the announcement template is no longer authorable

- **BE-148 — `Step Announcement Template` removed from the panel.** Following the BE-145 answer — that this template renders only into a visually hidden `aria-live` region — the row is gone from `Progress > Content`, which now holds just `Step Counter` and `Step Progress`. The reasoning: an author editing it is writing copy they can never read back, preview, or see break, so the row is a trap rather than a freedom. The template stays in the component as its default (`"{counter}, {percent}% complete"`, tokens `{counter}` / `{percent}` / `{title}`).
- **Nothing changes for an existing canvas.** The key ships at HEAD as a control, so both stored paths (`progressBar.content.stepAnnouncementTemplate` and the flat legacy `copy.stepAnnouncementTemplate`) are still read at the same single resolution site — removing the row does not remove the value. An untouched canvas announces byte-identically.
- **One trade, recorded openly:** because the announcement's wrapper words are no longer authorable, an author who localizes the two visible rows now gets an announcement that is partly English. Deriving the announcement from the visible copy instead would fix that automatically and would still reproduce today's default exactly — but it would also change the announcement for any canvas whose author had customized `Step Progress`, so it needs its own explicit order. Say the word if you want it.

### BE-148 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** (20 = 20) — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning — no new lint problems.
- CRLF preserved byte-for-byte; no new lines over the 100-char limit.

### BE-149 (2026-09-14) — padding is 8–24 for the field family, and the choice options were never clamped

- **BE-149 — the bounds moved, in both directions at once.** Your order: *"segmented field padding should be min 8px max 24px and same thing for all padding inside this comp for each field"*. BE-141 had set a single 12px floor and BE-126 a 16px field ceiling, so this is a **lower floor and a higher ceiling**: `FIELD_PADDING_MIN` / `FIELD_PADDING_MAX` are now 8 / 24, and `SELECTED_PADDING_MIN` / `SELECTED_PADDING_MAX` read those same two constants rather than repeating a value, so the field family cannot drift. The calendar surface and the legacy selected-option padding follow automatically — they already read the same constants.
- **BE-149 — the real bug was one that was never mentioned: the choice options had no clamp at all.** Segmented, pills, cards and radio fed your `padding` keys straight into `optionPaddingY` / `optionPaddingX`, bypassing every clamp in the file — so a large `Field Styles > Padding` grew the segments without limit while the identical value was correctly clamped on every other field. A new `clampFieldPaddingAxis` now clamps both axes at that derivation, and `undefined` deliberately stays `undefined` so the per-variant fallback (`optionPaddingY ?? 10`, and so on) still applies when you have set nothing.
- **BE-149 — the buttons were deliberately left alone, and this is the one thing worth your confirmation.** Your order said "for each field", and BE-141's own wording ("every padding property control in this comp") shows you say "everything" when you mean everything — so the buttons keep their 12px floor and Y 20 / X 32 ceilings. The old shared `PADDING_FLOOR` constant is renamed `BUTTON_PADDING_FLOOR` in the same pass, because once no field reads it, a constant called "the padding floor" would describe something no field obeys. **If you did mean the buttons too, say so and they move to 8–24 in one small pass.**
- **BE-149 — what actually changes on an existing canvas.** Anything you entered inside the old 12–16 range renders exactly as before, because it is inside 8–24 as well; an untouched field still reads its unclamped effective default, as always. What changes is only what you previously could not do: 8–11 no longer snaps up to 12, 17–24 no longer snaps down to 16, and out-of-range values now clamp to 8 / 24 instead of 12 / 16.
- **BE-149 — the materialise-the-default consequence shrank rather than grew.** Two of the five defaults BE-141 listed as sub-floor now sit inside the bounds: `FIELD_STYLES_CARDS_PADDING` (y 10 / x 8) and `FIELD_STYLES_SEGMENTED_PADDING` (y 11 / x 10), so activating those style groups materialises a default the clamp leaves alone. Still sub-floor: pills (y 5) and the calendar (`0px`) against the 8px field floor, and the button role default (`10px 16px`) against the button floor. Those are raised on activation exactly as before — and now to a less surprising number.
- The axis fallbacks you get when you set only one axis were extracted to named constants (`FIELD_PADDING_FALLBACK_Y` = 12, `FIELD_PADDING_FALLBACK_X` = 14, values unchanged) so the code states what it renders instead of citing a floor it no longer reads.

### BE-149 session (2026-09-14)

- `tsc --noEmit` (strict) against framer/framer-motion shims reports the **same error count as the pre-change `HEAD` baseline** (20 = 20), and the error-code-and-message multiset is **identical** — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning — no new lint problems.
- CRLF preserved (17,595 lines, every one CRLF); no new lines over the 100-char limit; no stale `PADDING_FLOOR` reference left behind.

### BE-150 (2026-09-14) — one height for every field, and the `Padding` control is gone

- **BE-150 — every field type now renders at 44px, and the `Padding` row is deleted.** Your order: *"delete the padding control. Let each field type keep its own built-in value"*, then *"Give every field one height, and derive each type's padding and floor from it. I'd use 44px"*. There is one new number in the component — `FIELD_ROW_HEIGHT` = 44, which is the touch-target minimum it already had — and everything else is derived from it: `FIELD_ROW_PAD_Y` = (44 − 18) / 2 − 1 = **12**, which every field padding is built from (input/select `12px 14px`, cards `12px 8px`, pills `12px 12px`), and `segmentedOptionHeight()` = 44 − 2 × (3 + 1) = **36** for a segment inside its track.
- **BE-150 — the height mismatch you spotted is fixed at the source, not patched.** The five heights came from four unrelated floors plus three different padding bases. That per-type floor column already existed in `getFieldStylesEffectiveDefaults` — declared for all seven types and read by **nobody**. It is now the real floor, read in one place and applied to boxed inputs, the textarea, the dropdown triggers, the choice options and the checkbox rows. Roughly: a text field was ≈47px, a segmented track 40px, a radio 40px, a pill ≈39px, a card ≈39px; all of them are now 44px.
- **BE-150 — the segmented min-height you flagged was real, and it was worse than dead padding.** A segment's padding below ~6px did nothing *and* the option's `minHeight: 32` made the whole track a different height from a text field. Both are gone: the track fills the 44px row, its option takes what is left, and the thumb inset, the track padding and the inner-radius step are now one named constant (`SEGMENTED_TRACK_INSET`) instead of the literal `3` in four places.
- **BE-150 — a second bug the consultation found: activating `Field Styles` silently restyled the choice fields.** One control fed six different bases, so switching the group on materialised its `"14px"` default into the choice variants and grew a segmented track from 40px to 52px — while boxed inputs, whose base was *also* 14px, did not move at all. With the row gone that cannot happen, and the choice options now resolve their padding through the same function and the same table as the field itself instead of a private inline table. `FIELD_STYLES_CARDS_PADDING` / `_PILLS_` / `_SEGMENTED_` used to be named after types they never actually reached; they are now live.
- **BE-150 — kept, as you asked:** the calendar's and the three button groups' own `Padding` rows. Also kept: any padding you had already stored on a canvas — it still renders, clamped to 8–24 (rule 116). Buttons keep their 12px floor and Y 20 / X 32 ceilings; nothing about them moved.
- **BE-150 — two honest consequences.** (1) The choice variants lose their narrow-width horizontal padding reduction (cards 8→6, pills 12→10), because a built-in per type is by definition one value; it is horizontal only and never affected height. (2) **The phone field still renders 46px** — its frame is a bordered container wrapping two children that each fill a 44px row, so the group's own border sits outside them. That is pre-existing (it was 47 in a 49 before) and it is a frame question rather than a padding one; **say the word and I will make the group the 44 and let the children fill it.**
- **BE-150 — the row is a `minHeight`, never a `height`.** A textarea still grows with its row count, a card with its image and description, a two-line option with its label. 44px is the family's shared floor, not a cap.

### BE-150 session (2026-09-14)

- `tsc --noEmit` (strict) against the framer/framer-motion shims reports the **same 20 errors as the pre-change baseline**, and a `diff` of the two sorted error multisets is **empty** — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning — no new lint problems.
- CRLF preserved (17,776 of 17,776 lines); no over-100-char line among the additions; no leftover reference to `clampFieldPaddingAxis`, `fs?.minHeight` or the deleted inline option-padding fallbacks.
- `DEFAULT_COPY_STEP_ANNOUNCEMENT_TEMPLATE` is still the terminal fallback of the `copy` resolution chain, so no unused constant or dead carrier was left behind.

### BE-151 (2026-09-14) — `Styles > Radius` now reaches the segmented field and its selected item

- **BE-151 — the segmented field was the one field that ignored `Styles > Radius`, and your report was exactly right.** Your order: *"styles -> radius didnt affect segmented field radius and selected item inside it, fix"*. The segmented branch was passing a **hardcoded `16`** as its fallback radius. Because `Field Styles > Radius` is an *optional* group, that literal won on every canvas where you had not switched the group on — i.e. every untouched canvas — so the track stayed 16px no matter what `Styles > Radius` said.
- **BE-151 — the selected item was wrong for the same reason, not a second bug.** A segmented thumb has no radius of its own; it is derived from the track at exactly one place (`track radius − the track's 3px inset`), so a wrong track is a wrong thumb. One prop fixed both, and there is still only one derivation site.
- **BE-151 — the honest number, because this is a visible default change and not a no-op.** On an untouched canvas the segmented field rendered a **16px** track and a **13px** thumb while every other field type rendered the token's **12px**. It now renders **12px / 9px** — the same token the rest of the family reads. Move `Styles > Radius` to 24 and the track follows to 24 with a 21px thumb (before, it stayed pinned at 16). 16 was never the token's value, so removing it *has* to move the default; that is the point of the fix, and it is recorded plainly rather than described as "no visual change".
- **BE-151 — the precedent was already in the file.** The 12h/24h time-format toggle passes `borderRadius` straight through and has always tracked the token, and the cards/pills options already read `optionRadius ?? <their own resolved radius>`. The segmented branch was the only site using a bare literal — and `16` was not even the segmented type's own radius.
- **BE-151 — a warning comment now guards the invisible part.** `resolveFieldRadius` decides "this type has no native radius of its own" by comparing the type's effective radius against `FIELD_STYLES_FIELD_RADIUS`, so `FIELD_STYLES_CARDS_RADIUS` and `FIELD_STYLES_SEGMENTED_RADIUS` must stay numerically equal to it — that equality is what makes those types follow your `Radius` token at all. A comment at the constants says so, and says both must move if `FIELD_STYLES_FIELD_RADIUS` ever changes.
- **BE-151 — nothing else moved.** A stored `selected.radius` still wins for the thumb and a stored `fs.radius` still wins for the track (rule 116); the 12h/24h toggle, every other field type and every menu surface are untouched.

### BE-151 session (2026-09-14)

- `tsc --noEmit` (strict) against the framer/framer-motion shims reports the **same 20 errors as the pre-change baseline**, and a `diff` of the two sorted error multisets is **empty** — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning — no new lint problems.
- CRLF preserved (17,795 of 17,795 lines); no over-100-char line among the additions; the segmented path carries no radius literal and the thumb still has exactly one derivation site.
- AGENTS.md rule numbering verified unique and contiguous through **220**; rule 215 amended in the same pass so the "shared `Radius` drives the track and the thumb" clause is now true in code as well as in intent.

### BE-152 (2026-09-14) — padding is never bounded; the element is bounded instead

- **BE-152 — the model changed, not just a number.** Your read: bounding *padding* with a min/max is the wrong lever, because padding is your business and a floor can only ever be right for one shape. The bound belongs on the **element** — min/max width and height — and padding should be unlimited: *"the user can put, for example, 150 padding, it's fine, no problem."* Two surfaces were still bounding padding, and both are now fixed.
- **BE-152 — the buttons are unbounded.** The limitation wasn't on the control (Framer's `Padding` control can't hold a min/max at all) — it was a runtime clamp in `resolveButtonStyle`: Y 12–20, X 12–32. Your padding string is now passed through verbatim, and the clamp helper (`clampBoxPadding`) and its five constants are deleted rather than left as dead code.
- **BE-152 — no width bound was added to any button, deliberately.** Your reason: *"don't add minimum or maximum width because the user might configure the buttons to be full width."* A width *floor* would be safe, but a width **ceiling** would silently cap a full-width footer button — so the buttons get height-only treatment, the same shape the field family already has.
- **BE-152 — the calendar's padding is gone from the panel AND from the element.** The root surface's padding was clamped to the *field* family's 8–24, and since the row's default is `0px`, switching the group on materialised `0px` and the clamp rewrote it to **8px** — a control whose only honest value was zero. The calendar is three cards and each carries its own padding (event metadata `16px`, days `16px`, time slots `16px 16px 0 16px`), so the root's was redundant. **A stored calendar padding no longer renders** — that is the one deliberate exception to the "keep old values readable" rule, and you ordered it explicitly ("we remove it also from the component itself").
- **BE-152 — what actually changes on an existing canvas.** Untouched canvases are unchanged in both places: the calendar root only had padding if you activated the group, and buttons already fell back to their unclamped role padding when you hadn't set one. Two things do change: activating the calendar's Styles group no longer inserts 8px, and a canvas where you *had* activated a button-styles group used to have its materialised `10px 16px` silently raised to `12px 16px` — it now renders `10px 16px`, exactly what the panel shows. That second one is a fix: it restores the rule that switching a group on must never change the render.
- **BE-152 — the nav buttons' min height, per your answer.** You chose to **leave it at the existing 32px** rather than raise it to the 44px touch-target minimum, and the footer-nav scope you picked needs no code change either, because 32px already applies to every button-group button. So that half of the order is a deliberate no-op; the buttons keep their floor and gain nothing new.
- **BE-152 — the field family was already the model.** The fields have been min-height-only since BE-150 (one 44px row, padding derived from it, no padding freedom). This order brings the buttons and the calendar into line with that, and the 8–24 field bounds stay — they now act only on a stored legacy value, so they are not dead code.

### BE-152 session (2026-09-14)

- `tsc --noEmit` (strict) against the framer/framer-motion shims reports the **same 20 errors as the pre-change baseline**, and a `diff` of the two sorted error multisets is **empty** — zero new type errors.
- `biome lint` reports only the one pre-existing `suppressions/unused` warning — no new lint problems.
- CRLF preserved (17,773 of 17,773 lines); no over-100-char line among the additions; `clampBoxPadding`, `BUTTON_PADDING_FLOOR` and the four `BUTTON_PADDING_*` bounds are gone with no remaining reference, and `clampPadding` is still used by the field resolver.
- AGENTS.md rule numbering verified unique and contiguous through **221**; rules 87, 90, 199, 210 and 218 amended in the same pass so the button-padding regime, the calendar padding row and the sub-floor-default list are all described as they now are.

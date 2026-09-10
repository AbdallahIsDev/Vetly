# Vetly — Booking Engine fixes (BE-024 … BE-054)

Sessions: 2026-09-08 (BE-024…BE-050) + 2026-09-09 (BE-051…BE-054) · Skipped: BE-007 (per your instruction) · BE-036 left Open (needs a live Cal.com test event — isolated worktree spike per its own constraints) · BE-032 was already Done.

## What's in this zip

| File | Change |
| --- | --- |
| `Code-Components/BookingEngine.tsx` | The fixed component (all review tasks below implemented) |
| `Code-Components/Booking-review.md` | Open entries + template; Done blocks are pruned after their rule is recorded (AGENTS.md rule 132) |
| `AGENTS.md` | Amended + new rules 158–181 (these sessions' intentional states) |
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

## Verification

- `tsc --noEmit` (strict, React 18 types) passes clean against framer/framer-motion shims.
- Original tab indentation preserved (whitespace-normalized during editing, restored byte-exactly; final diff ≈ 784 insertions / 314 deletions of real content).
- All legacy-carrier contracts (AGENTS.md rules 142/154) honored — no saved canvas silently restyles.
- `biome.json` covers the whole repo (`biome check` green), with two deliberate carve-outs: `framer-scripts/` is excluded (generated canvas-runner code, not shipped), and `noNoninteractiveElementToInteractiveRole` is off for `BookingEngine.tsx` only — its autofix (strip `role=listbox/option`) would destroy the ARIA listbox pattern of rules 134/162. Every other suppression in the component is an inline `biome-ignore` with its reason on the line.

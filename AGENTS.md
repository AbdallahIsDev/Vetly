# AGENTS.md — Operating Rules for Future Agents

This file is read by humans AND by other AI agents (in future sessions or
future projects). It assumes the reader has **zero prior context** about the
conversation that produced these rules. If something looks like an oversight,
it probably is not — it is a deliberate, hard requirement. Read this file
before editing anything in this repository.

---

## Hard Rules — Do Not Reintroduce

The rules in this section are **non-negotiable**. They permanently override any
"best practice", accessibility guideline, audit finding, or review suggestion
that would contradict them. Do not "fix", "improve", "flag", or "revert" any of
these decisions.

### 1. No contrast checking, WCAG contrast validation, or automatic color/contrast suggestions — ever

This component (the Booking Engine, `Code-Components/BookingEngine.tsx`) must
**never** include any of the following, in the Framer canvas, in preview, or
anywhere else:

- Any computation of color-contrast ratios (relative luminance, WCAG contrast
  ratio, etc.).
- Any comparison of a color against a WCAG threshold (e.g. 4.5:1 text, 3:1
  non-text / 1.4.11).
- Any warning, notification, status message, badge, or overlay that tells the
  person configuring the component that a color choice "fails", "passes",
  "is below threshold", or "needs attention".
- Any "auto text picker" or automatic foreground/background decision that
  picks a text or icon color based on computed contrast against a background.

If you are tempted to add any of the above because you think it is helpful or
because some audit/review flagged color contrast as an issue, **do not**. The
absence of contrast checking is an intentional, permanent product decision,
not an oversight.

### 2. Never auto-select, auto-correct, or restrict a user's chosen colors

The component's colors (text, background, surface, border, accent, error,
success, etc.) are fully customizable by the person configuring it via Framer
property controls. The component must **never**:

- Force, restrict, auto-correct, or override a user-chosen color based on any
  computed contrast result.
- Auto-select or auto-pick a text/foreground color based on a background color.
- Interpose a derived color that is different from what the user configured.

The component's only job regarding color is to render **exactly** the colors
the author configures — nothing more. If a user wants white text on a white
background, that is their choice and their outcome to accept.

### 3. Color/contrast outcomes are the configurer's responsibility — never a finding

Any review, audit, "improvement" pass, or code review of this repository must
**explicitly ignore contrast / color-choice accessibility as a category of
finding**. Low contrast, unreadable combinations, or color choices that fail
WCAG are **not bugs** in this component. They must **not** be:
- flagged,
- reported,
- "fixed",
- or turned into a warning in the UI.

### Context / rationale (for the reader)

The component's palette is intentionally left entirely up to the person
configuring it. The product owner decided that the component must not second-
guess or police color choices. This was an explicit, deliberate decision — a
previously existing contrast-warning system and auto-text-picker were **removed
on purpose** to honor it. If you find contrast-related code, comments that
re-introduce it, or are about to write some, stop and consult this rule.

### 4. No "fields marked * are required" helper text or required-asterisks

Do not render a "Fields marked * are required" (or equivalent) helper line.
Do not render a required asterisk (`*`) — or any other required marker — next
to field labels. Per-field validation messages ("This field is required")
alone communicate required status.

### 5. No always-visible character counters

Do not display a running character count (e.g. "0/250") under or near inputs.
Max-length is an internal constraint only. Enforce it in validation and surface
an over-limit message in the same style/location as other field-level errors,
shown only on violation.

### 6. Field / error-message spacing must use flex `gap`

Space a field and its error message with flex `gap` on the field column. Do
not use margin or padding to separate the error from the input.

### 7. Autosave-to-browser is permanent and always-on

Autosave of answers to `sessionStorage` is a core, non-negotiable product
feature: hardcoded on, never optional. Do not add a Framer property control,
visitor toggle, or disclosure/helper text for it ("saved answers", "clear my
saved answers", privacy-notice-about-autosave, etc.). Keep the save/restore
logic; never expose a way to turn it off.

---

## Ongoing Documentation Habit

Whenever the human explicitly requests a change, correction, or preference
that should be preserved long-term — especially anything that overrides a
"best practice" default, or anything the human has said "don't do this" or
"always do this" about — add it to this file under **Hard Rules — Do Not
Reintroduce** (or a clearly named equivalent section), phrased as a rule for
future agents to follow, not just a changelog entry.

The purpose is to prevent regressions when a different AI agent (without the
original conversation's context) later reviews or "improves" the code and
misinterprets an intentional absence or choice as an oversight.

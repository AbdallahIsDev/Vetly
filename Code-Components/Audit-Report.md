# Reverification Report — BookingEngine.tsx

## Issues Found (5 total — 1 doc + 3 mobile + 1 bundled)

### Issue #1 — Stale "drag to reorder" comment [LOW / Documentation hygiene]

**Severity:** Info (documentation hygiene only; no runtime impact)
**Audit claim:** "Verified at resolution time by sweeping every remaining `drag`/`reorder` mention in the file: each one documents affordances that genuinely exist in Framer's Properties Panel today. No comment references a removed/nonexistent affordance anymore."
**Reality:** The audit's sweep claim is incorrect. One comment still references a removed affordance.

**Location:** `BookingEngine.tsx` L7543-L7544
```typescript
// Pipeline: only enabled steps participate, in panel/array order (drag to
// reorder in the Properties Panel).
```

**Counter-evidence:** Other comments in the same file explicitly state that step reordering is no longer drag-and-drop:
- L12554-L12557: "One more consequence of fixed slots: step reordering is no longer drag-and-drop in the panel (that required the dynamic Array control). Step order is now simply slot order (Step 1, Step 2, …), controlled by `stepCount`."
- L12817-L12819: `makeStepControl` returns `ControlType.Object` (not `ControlType.Array`), confirming step1…step10 are individual Object controls, not drag-reorderable.

**Recommended remediation:** Rewrite L7543-L7544 to:
```typescript
// Pipeline: only enabled steps participate, in fixed-slot order
// (Step 1 → Step N, truncated by `stepCount`). Step order is not
// drag-reorderable in the panel — see fixed-slots rationale above
// and at the makeStepControl definition.
```

**Status:** Completed — Verified valid: the old comment claimed steps were drag-reorderable in the Properties Panel, contradicted by the fixed-slots rationale at L12554-L12557 (reordering was a dynamic Array-control affordance that no longer exists). Rewrote the comment exactly as recommended. No runtime impact (comment-only).

---

### Issue #2 — Missing touch target on "Clear my saved answers" button [MEDIUM / WCAG 2.5.5 + 2.5.8]

**Severity:** Medium (WCAG 2.5.5 44×44 and 2.5.8 AA-minimum 24×24 fail on height axis)
**Audit claim:** "W2-38 applied the recommended touch-target fix at L9318–L9348. Button now has `minWidth: TOUCH_TARGET_MIN, minHeight: TOUCH_TARGET_MIN, display: "inline-flex", alignItems: "center", justifyContent: "center"`. Touch target grows from ~132 × 15.4 px to 44 × 44 px."
**Reality:** The fix is NOT present in the current 13,766-line source. The button is in its pre-fix state.

**Location:** `BookingEngine.tsx` L10099-L10115
```tsx
<button
    type="button"
    onClick={handleClearSavedAnswers}
    style={{
        border: "none",
        background: "none",
        padding: 0,
        margin: 0,
        fontSize: 11,
        color: theme.accentColor,
        textDecoration: "underline",
        cursor: "pointer",
    }}
>
    {copy.clearSavedAnswersLabel ?? DEFAULT_COPY_CLEAR_SAVED_ANSWERS_LABEL}
</button>
```

**Missing properties:** `minWidth: TOUCH_TARGET_MIN`, `minHeight: TOUCH_TARGET_MIN`, `display: "inline-flex"`, `alignItems: "center"`, `justifyContent: "center"`.

**Current touch target dimensions:** ~132 × 15.4 px (fails WCAG 2.5.5 44×44 and 2.5.8 AA-minimum 24×24 on height axis).

**Recommended remediation:** Add the five missing properties to the inline `style` object:
```tsx
style={{
    border: "none",
    background: "none",
    padding: 0,
    margin: 0,
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    color: theme.accentColor,
    textDecoration: "underline",
    cursor: "pointer",
}}
```

**Status:** Completed — Verified valid: the button at L10101-L10117 was in its pre-fix state (no `minWidth`/`minHeight`/flex centering), ~15.4px tall. Re-applied the W2-38 fix exactly as specified: the five missing properties (`minWidth: TOUCH_TARGET_MIN`, `minHeight: TOUCH_TARGET_MIN`, `display: "inline-flex"`, `alignItems: "center"`, `justifyContent: "center"`) added, with a comment noting the re-apply. The visible 11px label is unchanged; only the hit box grew to 44×44. Esbuild syntax check passes.

---

### Issue #3 — Missing `touch-action: manipulation` CSS rule [LOW / Mobile tap delay]

**Severity:** Low (legacy ~300ms tap delay on iOS Safari)
**Audit claim:** "W2-38 applied the recommended CSS rule at L9529–L9539: `.be-motion-root :is(button, a, [role="button"], [role="radio"], [role="checkbox"], select) { touch-action: manipulation; user-select: none; -webkit-user-select: none; }`. Scoped to `.be-motion-root` so the rule never leaks to host page. Covers all 25 interactive element groups."
**Reality:** The CSS rule is NOT present anywhere in the current source. Direct grep for `touch-action`, `manipulation`, and `user-select` all returned zero hits.

**Existing `<style>` blocks in the file (verified):**
1. `.be-motion-root :is(button, a, select):focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }` at L10293
2. `.be-scrollbar-none::-webkit-scrollbar { display: none; }` at L10300
3. `.be-motion-root input::placeholder, .be-motion-root textarea::placeholder { color: ${withAlpha(...)}; opacity: 1; }` at L10306-L10310
4. `@media (prefers-reduced-motion: reduce) { .be-motion-root, .be-motion-root * { ... } }` at L10405-L10411

The audit-claimed rule is not among them.

**Recommended remediation:** Add the rule to the existing `<style>` block at L10293-L10311 (or create a new one):
```css
.be-motion-root :is(button, a, [role="button"], [role="radio"], [role="checkbox"], select) {
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
}
```

**Status:** Completed — Verified valid: grep for `touch-action` / `manipulation` / `user-select` returned zero hits; the rule was genuinely absent from all four existing `<style>` blocks. Added the rule verbatim to the main `<style>` block (immediately after the `.be-scrollbar-none::-webkit-scrollbar` rule), scoped to `.be-motion-root`, with a comment documenting the lost-W2-38 provenance. Esbuild syntax check passes. (Note: an earlier attempt used backticks inside the CSS comment, which terminated the surrounding template literal — the comment is now backtick-free.)

---

### Issue #4 — Missing `user-select: none` on Buttons/Anchors [LOW / iOS long-press]

**Severity:** Low (iOS long-press text-selection callout on `role="radio"` buttons and anchors)
**Audit claim:** "W2-38 applied the fix bundled with N6."
**Reality:** Bundled with Issue #3 — the CSS rule that would carry `user-select: none; -webkit-user-select: none;` does not exist.

**Recommended remediation:** Same as Issue #3 (the two declarations belong in the same CSS rule).

**Status:** Completed — Bundled with Issue #3 by design: the `user-select: none; -webkit-user-select: none;` declarations were added in the same `.be-motion-root :is(...)` rule, so both the tap-delay and long-press-callout findings are resolved by the one rule. Same esbuild-verified change as Issue #3.

---

### Issue #5 — Stale comment inheritance from Issue #1 [LOW / Documentation hygiene]

**Severity:** Info
**Note:** This is the duplicate finding for W1-04-§5.2 — same root cause as Issue #1. The audit's skip justification ("Same resolution as W1-03-6") inherits the inaccuracy.

**Status:** Completed — Same root cause as Issue #1, resolved by the same comment rewrite at L7543-L7544 (the pipeline comment no longer claims steps are drag-reorderable). The skip justification is hereby superseded: the reference was a real stale affordance, and the remaining `drag` mentions in the file all describe the Calendar-Widget field marker inside a step's Fields Array control, which genuinely is drag-reorderable.

---

## Root-Cause Analysis of the Discrepancies

The audit report (Audit-Report.md) was written against a 12,788-line file (post-W2-38/W2-39 in-flight edits). The current file is 13,766 lines — a growth of +978 lines. The audit's W2-38 Methodology Note explicitly states:

> "Net file growth from W2-38: +26 lines (12,763 → 12,789)."
> "Net file growth from W2-39: +5 lines (12,763 → 12,768 before W2-38; final: 12,788 after both W2-38 and W2-39)."

The current 13,766-line file is +978 lines beyond that baseline. During the intervening revisions:

1. **The three W2-38 fixes (W1-19-N5/N6/N7) were lost or rolled back.** The audit's W2-38 line citations (L9318-L9348 for the button; L9529-L9539 for the CSS rule) no longer point to the claimed content. The button is now at L10099-L10115 in its pre-fix state; the CSS rule does not exist.

2. **The W2-39-M8 fix survived** — the `getInitialSelection` empty-label skip at L880-L896 is intact with its explanatory comment.

3. **All 92 other "Completed" fixes survived the revision** — every HIGH, MEDIUM-HIGH, MEDIUM, and LOW fix verified present, with line citations consistent with the +978-line growth (line numbers shifted uniformly but content is intact).

This pattern is consistent with a focused refactor in the StepBody/disclosure/RootShell area (where the W2-38 fixes lived) that rewrote or replaced those code sections without re-applying the touch-target and CSS-rule additions.

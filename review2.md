# review.md — Vetly Framer Audit Findings (TV session)

## TV-1 — "No items" placeholder text shown in multiple CMS collection list Empty States across the home page
Status: Open
Category: Content & copy
Severity: Medium
Location: Home `/` — multiple sections: Hero Social Proof (`NI9NxL18Q`), Services Cards (`bzohBi2Us`), FAQ Left (`HXPYQYdt7`), FAQ Right (`AVkkgm1mQ`). Also exists for Testimonials and Blog lists (text nodes `ZNlYU8K7O`, `gCnK0d6YH`, `uwC0I7LbN`, `Ilzg8nm9l`, `wB87HnGNd`, `Yy5x6pnpm`, `NWfIoD2wo`, `ErJCw_NYT`, `JfupbPVIS`, `m7SxGEoE8`).
Description: Every CMS-backed section on the home page contains an "Empty State" frame with the default Framer placeholder text "No items". These are conditionally visible when the collection list's item-count equals 0 (e.g., `visible: { from: "var(--variable-PlDSXPNh2-item-count)", transforms: [{ name: "equals", value: 0 }] }`). On the live site, if a CMS filter ever returns zero items (e.g., if no Services are marked "Featured", or no FAQs are tagged "Right"), the bare text "No items" will appear inside a dashed-border grey box on the page. The copy is developer-facing, not customer-facing — a real visitor seeing "No items" inside the FAQ section would lose trust.
Evidence: Text node `v:nhnEJgV3O:0:0` text="No items"; ancestor path `augiA20Il` > `WQLkyLRf1` > `J30SjU3lW` (Main) > `LQn3zLbUg` (Hero) > `zHo3hTChK` (Content) > `pB_M2IuXs` > `jGsliIjdo` (Social Proof) > `zBGviMPCg` > `NI9NxL18Q` (Empty State). Empty State frame attributes: `{ visible: { from: "var(--variable-zBGviMPCg-item-count)", transforms: [{ name: "equals", value: 0 }] }, border: "1px dashed rgba(136, 136, 136, 0.2)", fill: "var(--token-51117f33-471f-4233-a8cd-bfdb883b3044)", minWidth: "100%", minHeight: "100%" }`. Same pattern in `bzohBi2Us`, `HXPYQYdt7`, `AVkkgm1mQ`.
Recommended Fix: Replace the placeholder text "No items" in every Empty State with a customer-facing message (e.g., "Check back soon for new content." or "No FAQs match this filter right now.") OR delete the Empty State frames entirely if a blank section is preferable. At minimum, vet the active CMS filters (Services "Featured", FAQs Group "Left"/"Right", Blog "Featured isSet") to confirm each returns at least one item today.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-1)
Reviewer note: Severity changed to Medium per reviewer.

---

## TV-2 — Inconsistent number formatting in Hero ("20k+" vs "20K+")
Status: Open
Category: Content & copy
Severity: Low
Location: Home `/` — Hero section. Badge text node `v:WcwL5Rqga:0:1` ("4.9 · Trusted by 20k+ pet parents") vs Hero Floating Trust Card text `v:Y6WF7bQ6A:0:0` ("20K+") and the Social Proof title `v:u6mrlO1lf:0:0` ("Join 20,000+").
Description: The hero uses three different formats for the same statistic within ~600 pixels of vertical space: "20k+" (lowercase k, in the badge), "20K+" (uppercase K, in the floating trust card), and "20,000+" (full number, in the social proof heading). Pick one canonical form and use it consistently. The badge copy also mixes sentence-case formatting ("4.9 · Trusted by 20k+ pet parents") while the trust card uses a different label ("Happy Pet Owners").
Evidence: Badge text node `v:WcwL5Rqga:0:0` text="4.9" + `v:WcwL5Rqga:0:1` text="  ·  Trusted by 20k+ pet parents"; Floating Trust Card stat `v:Y6WF7bQ6A:0:0` text="20K+"; Social Proof title `v:u6mrlO1lf:0:0` text="Join 20,000+". Hero section screenshot: https://framerusercontent.com/screenshots/on-demand/7f590178-1208-4471-868c-ec2c4fd9e148.jpg
Recommended Fix: Standardize on "20K+" everywhere, OR convert all instances to "20,000+" for readability. Also align the surrounding label copy ("Happy Pet Owners" vs "happy pet parents" vs "pet parents") so the hero doesn't read like three different writers contributed.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-2)

---

## TV-3 — Why Us Card #4 description is a truncated sentence ("so you always feel.")
Status: Open
Category: Content & copy
Severity: High
Location: Home `/` — Why Us section, Card #4 instance `oTFX0kNfS`.
Description: The fourth "Why Us" card has the title "Peace of Mind, Always" but its description copy reads "Clear guidance, thoughtful care, and confident decisions so you always feel." — the sentence is grammatically incomplete; "feel" needs an object (e.g., "so you always feel confident" or "so you always feel supported"). This reads as a draft sentence that was never finished. It's published-facing copy on the home page.
Evidence: Card instance `oTFX0kNfS` attribute `$control__description` = "Clear guidance, thoughtful care, and confident decisions so you always feel."; `Why Us Card` component id `Sr15oMIZ5` (Variant 1, id `eLTuHFRKH`). Why Us section screenshot: https://framerusercontent.com/screenshots/on-demand/70bfd553-181d-4d45-b6ab-a854fb90f0b3.jpg
Recommended Fix: Replace with a complete sentence, e.g., "Clear guidance, thoughtful care, and confident decisions so you always feel supported."
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-3)

---

## TV-5 — Bg Gradient fallback colors use pure red `rgb(255, 0, 0)` for the Primary token in 3+ places
Status: Open
Category: Visual design & branding
Severity: Medium
Location: Home `/` — FAQ Bg Gradient (`fvIb3CK_5`), Blog Bg Gradient #1 (`hVUArtt1v`), Blog Bg Gradient #2 (`lbsRWc7p3`), Location Bg Gradient (`AtYlaIIID`).
Description: Multiple decorative gradient fills on the home page use the pattern `linear-gradient(180deg, var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2, rgb(255, 0, 0)) /* {"name":"Primary"} */ 40%, var(--token-19435b3e-190a-40c7-8a23-915a55ceeb7a, rgb(0, 53, 255)) /* {"name":"Secondary"} */ 100%)`. The Primary color token is `rgb(0, 144, 255)` (blue), but the fallback `rgb()` value is `rgb(255, 0, 0)` (pure red) — clearly a typo. The fallback only renders if the CSS variable fails to resolve, so on a normal visit users won't see it. But it's a code smell, indicates copy-paste from a broken template, and would cause a jarring red flash if the variable ever fails to load. Blog Bg Gradient #2 also hardcodes `rgb(69, 196, 255)` (a different blue) instead of using a token at all.
Evidence: Node `fvIb3CK_5` `fill: "linear-gradient(180deg, var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2, rgb(255, 0, 0)) /* {"name":"Primary"} */ 40%, var(--token-19435b3e-190a-40c7-8a23-915a55ceeb7a, rgb(0, 53, 255)) /* {"name":"Secondary"} */ 100%)"`. Same exact `rgb(255, 0, 0)` fallback appears in `hVUArtt1v` (Blog Bg Gradient #1) and `AtYlaIIID` (Location Bg Gradient). FAQ section screenshot: https://framerusercontent.com/screenshots/on-demand/76ebe612-7d4b-4ba1-adba-825bb0eaaef4.jpg
Recommended Fix: Change the fallback `rgb(255, 0, 0)` to `rgb(0, 144, 255)` (the actual Primary color) in all gradient fills. For Blog Bg Gradient #2, replace the hardcoded `rgb(69, 196, 255)` with the appropriate token (likely Accent Cyan Light or Accent Blue).
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-5)

---

## TV-6 — "Red Dot" emergency indicator uses hardcoded `rgb(255, 0, 0)` instead of a color token
Status: Open
Category: Visual design & branding
Severity: Low
Location: Home `/` — Location & Hours section, "Red Dot" OvalShapeNode `UMk1D8S4O` inside Emergency Strip (`xzEEVW_dN`).
Description: The Emergency Line indicator dot is filled with `rgb(255, 0, 0)` (pure red) hardcoded inline, rather than referencing a color style token. The project has 26 color tokens defined (including "Primary", "Secondary", "Accent Cyan", etc.) but no "Danger"/"Error"/"Red" token. This is consistent with the gradient fallback issue (TV-1-5) and the absence of a red/error token in the design system. Hardcoded colors make future rebranding painful and bypass the design system.
Evidence: Node `UMk1D8S4O` (OvalShapeNode) `fill: "rgb(255, 0, 0)"`. Ancestor: `Bz6Rh_D5A` (Location) > `V0W1XC4Qo` (Container) > `CYb4mplpU` (Contact Info) > `dQ6t5KY0A` (Contact Details) > `Bplx2r2jL` (Hours Actions) > `qSFy4aURj` (Actions) > `xzEEVW_dN` (Emergency Strip) > `UMk1D8S4O` (Red Dot).
Recommended Fix: Add a "Danger" or "Error" color token (e.g., red `rgb(239, 68, 68)`) to the project's color styles and reference it via `var(--token-...)`. Update the dot's fill to use the new token.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-6)

---

## TV-7 — 5 Stars component instance uses hardcoded `rgb(255, 187, 0)` star color
Status: Open
Category: Visual design & branding
Severity: Low
Location: Home `/` — Hero badge "Star Wrapper" `xFHBEGEvL` (component `Uqn4x3nhl`).
Description: The 5-star rating component in the hero badge uses `rgb(255, 187, 0)` (a yellow/orange) hardcoded as the star color via `$control__starColor`, instead of a color token. The project's color palette has no "star"/"warning"/"accent yellow" token; this is a one-off hardcoded value.
Evidence: ComponentInstanceNode `xFHBEGEvL` `$componentDisplayName: "5 Stars"`, `$control__starColor: "rgb(255, 187, 0)"`. Also note the suspicious triple-underscore control `$control___5Star: "false"` (likely a typo for `$control__5Star` — verify against the component definition).
Recommended Fix: Add a "Warning" or "Accent Yellow" color token, then bind `$control__starColor` to that token. Sub-agent 10 (native components) should also fix the `$control___5Star` triple-underscore typo in the 5 Stars component definition.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-7)

---

## TV-8 — Anti-pattern: `gap` combined with `stackDistribution: "space-between"` in multiple home page frames
Status: Open
Category: Visual design & branding
Severity: Medium
Location: Home `/` — Services section Text Container (`I_4CTMrRH`), Blog section Text Container (`tXQImCXgc`), FAQ section Help Card (`hFUEK3He0`).
Description: Several horizontal-stack frames use both `stackDistribution: "space-between"` AND `gap: "8px"` (or `150px` in the Help Card case). Per Framer's core-principles.md, "stackDistribution values starting with `space-` only distribute leftover space and do not guarantee a minimum gap. DON'T try combining `gap` with those values — it is not supported." The `gap` is silently ignored. The FAQ Help Card `hFUEK3He0` sets `gap: "150px"` AND `stackDistribution: "space-between"` — a 150px gap was clearly intended, but the actual rendered gap will be whatever `space-between` produces based on viewport width, which can be much larger or smaller than 150px.
Evidence: Node `I_4CTMrRH` attributes: `{ layout: "stack", stackDirection: "horizontal", stackDistribution: "space-between", gap: "8px" }`. Node `tXQImCXgc` attributes: `{ stackDistribution: "space-between", gap: "8px" }`. Node `hFUEK3He0` attributes: `{ stackDistribution: "space-between", gap: "150px" }`. Core-principles.md explicitly bans this combination.
Recommended Fix: For frames where the children should hug the edges with no fixed gap, keep `stackDistribution: "space-between"` and remove `gap`. For frames where a specific gap is desired (e.g., the FAQ Help Card's `150px`), switch to `stackDistribution: "start"` and keep `gap: "150px"`, OR use `padding` for outer spacing and `gap` for inner spacing.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-9)

---

## TV-9 — Hidden "View All Button" frame in Services section is leftover dead code
Status: Open
Category: Site settings & structure
Severity: Low
Location: Home `/` — Services section, Services Cards grid (`ucMAEsB2j`), child frame `JQ6Qj_0Sr` "View All Button" (visible: "false") containing Primary Button `EGhs4rMy_`.
Description: The Services Cards grid contains a hidden "View All Button" frame that wraps a Primary Button instance (`EGhs4rMy_`) with title "View All Services" linking to `/services`. The frame is set to `visible: "false"`. The same CTA ("View All Services" → `/services`) is already present as Primary Button `v0cUalN0o` in the Description column above the grid, so this hidden button is dead code — a leftover from a design revision. It still contributes to the page tree and adds confusion for future editors.
Evidence: Node `JQ6Qj_0Sr` attributes: `{ name: "View All Button", visible: "false", gridItemColumnSpan: "all" }`. Child `EGhs4rMy_` is a Primary Button with `$control__title: "View All Services"`, `$control__link: "/services"`. The visible CTA `v0cUalN0o` has identical attributes.
Recommended Fix: Delete the hidden "View All Button" frame (`JQ6Qj_0Sr`) and its child button (`EGhs4rMy_`).
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-10)

---

## TV-10 — Tablet Hero Content alignment is centered while Desktop and Phone are left-aligned
Status: Open
Category: Visual design & branding
Severity: Low
Location: Home `/` — Tablet Hero Content `hmX39_cxlzHo3hTChK` (uses `stackAlignment: "center"`).
Description: Desktop Hero Content `zHo3hTChK` uses `stackAlignment: "start"` (left-aligned). Phone Hero Content `BkwtJCk0LzHo3hTChK` also uses `stackAlignment: "start"`. Tablet Hero Content `hmX39_cxlzHo3hTChK` uses `stackAlignment: "center"` (centered). The inconsistency means text alignment shifts as a visitor resizes their browser across the 768–1279px breakpoint. Pick one alignment (left-aligned is the stronger choice since the hero text is left-aligned on either side of the tablet range).
Evidence: Desktop `zHo3hTChK.attributes.stackAlignment: "start"`; Tablet `hmX39_cxlzHo3hTChK.attributes.stackAlignment: "center"`; Phone `BkwtJCk0LzHo3hTChK.attributes.stackAlignment: "start"`.
Recommended Fix: Change Tablet Hero Content `stackAlignment` from `"center"` to `"start"` to match Desktop and Phone.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-12)

---

## TV-11 — Floating Trust Card has different fill on Phone (solid white) vs Desktop (translucent white)
Status: Open
Category: Visual design & branding
Severity: Low
Location: Home `/` — Phone Floating Trust Card `BkwtJCk0LGT3p3XJ8w` (`fill: "var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"` — solid white token) vs Desktop Floating Trust Card `DzayWjytl` (`fill: "rgba(255, 255, 255, 0.75)"` — 75% opacity).
Description: The Floating Trust Card overlay on the hero image uses a 75%-opacity white fill on Desktop (so the hero image subtly shows through), but a 100%-opacity solid white fill on Phone (completely opaque). The Phone version loses the "floating glass card" aesthetic. Also, Desktop uses a hardcoded `rgba()` while Phone uses the `White` token — neither is wrong, but using the token in one place and the hardcoded value in another is inconsistent.
Evidence: Desktop `DzayWjytl.attributes.fill: "rgba(255, 255, 255, 0.75)"`; Phone `BkwtJCk0LGT3p3XJ8w.attributes.fill: "var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"`.
Recommended Fix: Decide whether the trust card should be translucent (preferred for the "floating" look) or solid. If translucent, change the Phone fill to `rgba(255, 255, 255, 0.75)` (or define a new "Surface Translucent" token). If solid, change the Desktop fill to the `White` token. Either way, use the same value on both breakpoints.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-13)

---

## TV-12 — Layout template's `flowEffect: spring-physics` is applied to ALL pages via the home page's `pageEffects.all`
Status: Open
Category: Performance & technical
Severity: Medium
Location: Home `/` — Desktop breakpoint `WQLkyLRf1` `pageEffects: { all: { enter: { x: 0px, y: 0px, scale: 1, opacity: 0, rotate: 0, rotateX: 0, rotateY: 0, transition: "tween 0.27,0,0.51,1 0.35s 0s" } } }`. Layout template `yDIYoKc7h` Desktop breakpoint `f7pXm5YjB` `flowEffect: { transition: "spring-physics 400 80 1 0s" }`.
Description: The home page's primary desktop breakpoint sets `pageEffects.all`, which (per core-principles.md) is the syntax for an All Pages effect — meaning every navigation transition on the entire site runs the configured page-enter tween animation (fade in from opacity 0 over 0.35s with a custom cubic-bezier). The layout template's `flowEffect` (spring-physics 400 80 1 0s) also affects scroll/navigation. Combined, these create a global motion layer that: (1) hides content briefly on every page load (opacity starts at 0), which can hurt Largest Contentful Paint and Core Web Vitals; (2) triggers a spring-physics flow that may feel laggy on low-end devices; (3) cannot be overridden by individual pages. The brief 0.35s fade may be intentional branding, but for performance-sensitive visitors (or those with `prefers-reduced-motion` enabled) this is a concern — verify whether the layout respects `prefers-reduced-motion`.
Evidence: Node `WQLkyLRf1.attributes.pageEffects.all.enter.transition: "tween 0.27,0,0.51,1 0.35s 0s"`; Layout template `f7pXm5YjB.attributes.flowEffect.transition: "spring-physics 400 80 1 0s"`. Note: `prefers-reduced-motion` handling was not visible in the serialized attributes — sub-agent 13 (performance) and sub-agent 8 (accessibility) should verify whether reduced-motion users get a static fallback.
Recommended Fix: Confirm the site respects `prefers-reduced-motion: reduce` (Framer usually does this automatically, but verify). Consider removing `pageEffects.all` if the 0.35s fade isn't a brand requirement — it adds animation jank without much value. Alternatively, shorten the duration to ≤0.2s. Defer final decision to sub-agents 8 and 13.
Confidence: Medium
Discovered by: sub-agent 1, session TV (originally TV-1-14)

---

## TV-13 — Layout template Footer is `position: absolute` with fixed `height: 450px` on Tablet and Phone
Status: Open
Category: Visual design & branding
Severity: Medium
Location: Home `/` — Tablet Footer `hmX39_cxlmQdKIVmWI` and Phone Footer `BkwtJCk0LmQdKIVmWI`. Both have `layout: "null", width: "100%", height: "450px", position: "absolute"`.
Description: The Footer is positioned absolutely (not in the normal document flow) with a hardcoded 450px height on Tablet and Phone. This means the footer doesn't push content above it — it sits on top of (or behind) the preceding section. If the actual footer content grows beyond 450px (e.g., if nav links wrap on phone, or the legal row breaks to multiple lines), it will overflow its 450px container and either overlap content above or get clipped (depending on the parent's `overflow` setting). On Phone in particular, a 390px-wide viewport is narrow enough that footer link columns will likely stack/wrap and exceed 450px. This is a layout-fragility issue — also owned by sub-agent 15 (Header/Footer).
Evidence: Tablet Footer node `hmX39_cxlmQdKIVmWI.attributes: { layout: "null", width: "100%", height: "450px", position: "absolute" }`. Phone Footer `BkwtJCk0LmQdKIVmWI.attributes` is identical. (Footer is owned by the layout template `yDIYoKc7h` — same issue likely affects every page on the site.)
Recommended Fix: Either change the Footer to use `position: "relative"` and let it flow with the page (recommended), OR set `height: "auto"` so the footer grows with its content. Verify on the live site that the footer doesn't overlap the Blog section above it on tablet/phone. Defer final fix to sub-agent 15.
Confidence: Medium
Discovered by: sub-agent 1, session TV (originally TV-1-15)

---

## TV-14 — Hero "Sparkles" decorative component and Noise texture are both `visible: "false"` (dead weight in the tree)
Status: Open
Category: Performance & technical
Severity: Low
Location: Home `/` — Hero Background `TocZhBlOF` > Gradient Mask `V5nApHoTz` > Sparkles `zy6COpPDa` (visible: "false") and Noise `W166wnt5m` (visible: "false").
Description: The Hero Background contains a `Sparkles` external component instance and a `Noise` texture frame, both set to `visible: "false"`. These are disabled but still in the page tree — they still add to the node count and serialization cost, and they ship with the page bundle (Framer tree-shakes disabled components partially, but the asset references remain). The Noise frame's fill (`https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png`) is still referenced in the serialized output, meaning the PNG asset is still part of the project. If these effects are no longer used, they should be deleted entirely rather than just hidden.
Evidence: Node `zy6COpPDa.attributes.visible: "false"` (Sparkles component). Node `W166wnt5m.attributes: { visible: "false", fill: "https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png", blendingMode: "overlay", opacity: "0.15" }` (Noise).
Recommended Fix: Delete both the Sparkles instance (`zy6COpPDa`) and the Noise frame (`W166wnt5m`) from the Hero Background if they're no longer part of the design. If they may be re-enabled, leave them but document why they're disabled.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-17)

---

## TV-15 — Testimonial Card has `pointerEvents: "none"` and `userSelect: "none"`, blocking text selection and any interactive elements inside
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Home `/` — Testimonials section, Testimonial Card instance `tcWgiHvx6` (component `ruZNfQdon`).
Description: The Testimonial Card instance sets `pointerEvents: "none"` and `userSelect: "none"`. This means visitors cannot select the testimonial text (e.g., to copy a quote), cannot click any links inside the testimonial (if any exist), and keyboard focus cannot reach interactive children. For users who rely on copy/paste (research, sharing quotes), this is a usability blocker. The setting was likely added to prevent text selection during a parallax/scroll animation, but the parallax should be implemented without disabling pointer events globally on the card.
Evidence: Node `tcWgiHvx6.attributes: { pointerEvents: "none", userSelect: "none", width: "1fr", height: "auto" }`. Component displayName "Testimonial card", id `ruZNfQdon`.
Recommended Fix: Remove `pointerEvents: "none"` and `userSelect: "none"` from the testimonial card instance. If needed for animation, scope the parallax/scroll effect to a non-interactive wrapper instead. (Sub-agent 8 accessibility should verify whether this propagates to all testimonial instances.)
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-18)

---

## TV-16 — Phone Main section gap is 128px (same as Tablet) — too much vertical air on a 390px viewport
Status: Open
Category: UX & conversion
Severity: Medium
Location: Home `/` — Phone Main section `BkwtJCk0LJ30SjU3lW` (`gap: "128px"`).
Description: The Phone Main section uses `gap: "128px"` between its 8 child sections — the same value as Tablet. On a 390px-wide phone viewport, 128px of vertical whitespace between sections is excessive; mobile users have to scroll significantly more to move between sections. A typical mobile section gap is 64–80px. Tablet at 768px can justify 96–128px, but phone should be tighter. Note: each section's *internal* gap is already 32px on phone (good) — the issue is specifically the outer Main gap.
Evidence: Phone Main `BkwtJCk0LJ30SjU3lW.attributes.gap: "128px"`; Tablet Main `hmX39_cxlJ30SjU3lW.attributes.gap: "128px"`; Desktop Main `J30SjU3lW.attributes.gap: "160px"`. Phone home screenshot: https://framerusercontent.com/screenshots/on-demand/bc5c56fc-0926-46a2-ae96-7f0d1f8c4937.jpg
Recommended Fix: Reduce Phone Main section gap from `128px` to `64px` or `80px` to tighten the mobile experience.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-19)

---

## TV-17 — Why Us Cards grid on Tablet collapses to 1 column unnecessarily (could fit 2)
Status: Open
Category: UX & conversion
Severity: Low
Location: Home `/` — Tablet Why Us Cards grid `hmX39_cxlYGqvpvwJH` (`gridColumnCount: 1`).
Description: The Why Us Cards grid uses 7 columns on Desktop (with asymmetric 3-4-4-3 spans) and collapses to 1 column on Tablet. On a 768px tablet viewport, 2 columns of ~370px each would fit comfortably and reduce vertical scrolling. Going straight from a 7-column asymmetric grid to a 1-column stack is a jarring layout shift at the 1279px breakpoint. The Team grid (also 4 cards) correctly uses 2 columns on tablet, so Why Us is inconsistent with the Team section's responsive behavior.
Evidence: Tablet Why Us Cards `hmX39_cxlYGqvpvwJH.attributes: { layout: "grid", gridColumnCount: 1, gap: "16px 16px" }`. Tablet Team Cards `hmX39_cxlQgIvzDej1.attributes: { layout: "grid", gridColumnCount: 2, gap: "24px 24px" }`. Same number of cards (4), different responsive column counts.
Recommended Fix: Change Tablet Why Us Cards `gridColumnCount` from `1` to `2` to match the Team grid behavior and reduce vertical scroll on tablet.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-20)

---

## TV-18 — Location section heading reads as a run-on: "Visit Our Veterinary Clinic, Location & Hours"
Status: Open
Category: Content & copy
Severity: Medium
Location: Home `/` — Location section heading `Y2FjyBvSs` (text runs `v:Y2FjyBvSs:0:0` "Visit Our Veterinary Clinic, " + `v:Y2FjyBvSs:0:1` "Location & Hours").
Description: The Location section heading is constructed as "Visit Our Veterinary Clinic, " + "Location & Hours" (the second part is colored blue for emphasis). Read as a single sentence, it says "Visit Our Veterinary Clinic, Location & Hours" — which is grammatically confused. It mixes a call-to-action ("Visit Our Veterinary Clinic") with a category label ("Location & Hours"). The comma doesn't help — it implies the second phrase is an appositive, but "Location & Hours" isn't a synonym for "Our Veterinary Clinic". Either commit to the CTA ("Visit Our Veterinary Clinic") or the category ("Location & Hours"), or restructure to "Visit Our Clinic — Location & Hours".
Evidence: Text runs `v:Y2FjyBvSs:0:0` text="Visit Our Veterinary Clinic, " and `v:Y2FjyBvSs:0:1` text="Location & Hours" (latter has `textColor: "var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2)"` and `textBackgroundPadding: "0px 8px 0px 8px"`). Location section screenshot: https://framerusercontent.com/screenshots/on-demand/ced2dec7-6bc7-4154-8d1c-1f2dae07ca39.jpg
Recommended Fix: Restructure to either: (a) "Visit Our Clinic" with subheading "Location & Hours"; or (b) "Find Us in New York City" with subheading "Convenient location and flexible hours". The current run-on is awkward.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-21)

---

## TV-19 — Hero badge "5 Stars" component has a triple-underscore control name `$control___5Star`
Status: Open
Category: Components (native + code)
Severity: Low
Location: Home `/` — Hero badge Star Wrapper `xFHBEGEvL` (5 Stars component `Uqn4x3nhl`). Attribute `$control___5Star: "false"`.
Description: The 5 Stars component instance has a control named `$control___5Star` (three underscores between `control` and `5Star`). Framer's convention is `$control__<name>` (two underscores). The triple-underscore is likely a typo in the component definition that propagated to this instance. While it doesn't break anything functionally, it's a code-quality issue that suggests the component definition has a typo. Sub-agent 10 (native components) owns the deeper fix at the component-definition level.
Evidence: ComponentInstanceNode `xFHBEGEvL.attributes.$control___5Star: "false"` (note three underscores).
Recommended Fix: In the 5 Stars component definition (`Uqn4x3nhl`), rename the control from `$control___5Star` to `$control__5Star` (two underscores). Sub-agent 10 should handle this.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-22)

---

## TV-20 — Hero badge border uses an unknown token `var(--token-15f5dbdf-ba40-4f51-96aa-06cbc5676ef7)` (not in the 26 documented color styles)
Status: Open
Category: Visual design & branding
Severity: Low
Location: Home `/` — Hero badge Sub Container `c_hEkVzBV` (`border: "1px solid var(--token-15f5dbdf-ba40-4f51-96aa-06cbc5676ef7)"`).
Description: The hero badge's border references color token `var(--token-15f5dbdf-ba40-4f51-96aa-06cbc5676ef7)`. The project inventory lists 26 color styles by name (White, Text, Primary, Black, Secondary, slate-*, neutral-*, Border Subtle, Accent Cyan Light, Accent Cyan, Accent Blue, Placeholder Fill, Placeholder Text). The token ID `15f5dbdf-...` is not among the named tokens documented in the inventory (sub-agent 9 should confirm by reading the actual color styles list with IDs). If this is an orphan token or an inline-created color (rather than a documented style), it bypasses the design system.
Evidence: Node `c_hEkVzBV.attributes.border: "1px solid var(--token-15f5dbdf-ba40-4f51-96aa-06cbc5676ef7)"`. Also seen: `boxShadows: ["0px 2px 8px 0px rgba(0, 0, 0, 0.04)"]` (hardcoded rgba shadow — also bypasses the token system).
Recommended Fix: Verify the token ID against the project's color styles. If it doesn't match a named style, either create a new named style (e.g., "Border Subtle" if that's the visual intent) and bind it, or replace the reference with the existing "Border Subtle" token. Same applies to the hardcoded `boxShadows` value — define a shadow token if this shadow is reused.
Confidence: Medium
Discovered by: sub-agent 1, session TV (originally TV-1-23)

---

## TV-21 — Blog section Text Container uses `stackAlignment: "end"` which right-aligns the SubHeading text awkwardly
Status: Open
Category: Visual design & branding
Severity: Low
Location: Home `/` — Blog section Text Container `tXQImCXgc` (`stackAlignment: "end"`, `stackDirection: "horizontal"`, `stackDistribution: "space-between"`).
Description: The Blog section's heading row is a horizontal stack with `stackAlignment: "end"` (cross-axis = vertical, so this aligns children to the bottom edge). Combined with `stackDistribution: "space-between"`, this places the Badge+Heading group on the left and the SubHeading paragraph on the right, both bottom-aligned. On Desktop this looks like a left/right split with the SubHeading awkwardly floated to the right edge — which is unusual for a section header. Most section headers stack the badge, heading, and subheading vertically (as the Why Us, Team, Testimonials, FAQ, and Location sections all do).
Evidence: Node `tXQImCXgc.attributes: { layout: "stack", stackDirection: "horizontal", stackAlignment: "end", stackDistribution: "space-between", gap: "8px" }`. Compare to Why Us Text Container `t6FP1PA10.attributes: { stackDirection: "vertical", stackAlignment: "center", stackDistribution: "start", gap: "8px" }`. Blog section screenshot: https://framerusercontent.com/screenshots/on-demand/61bc2f61-300a-437c-bc2f-86ce42a257b8.jpg
Recommended Fix: Decide whether the Blog section header should match the other sections (vertical stack) or intentionally use the horizontal split. If matching, change to `stackDirection: "vertical"`. Also remove the `gap: "8px"` if keeping `stackDistribution: "space-between"` (per TV-1-9).
Confidence: Medium
Discovered by: sub-agent 1, session TV (originally TV-1-24)

---

## TV-22 — Services section heading uses fixed `width: "450px"` and SubHeading uses fixed `width: "420px"` — fragile on responsive
Status: Open
Category: Visual design & branding
Severity: Low
Location: Home `/` — Services section Heading `VxOMUJGei` (`width: "450px"`) and SubHeading `qqi7bNh_7` (`width: "420px"`).
Description: The Services section heading and subheading are hardcoded to fixed pixel widths (450px and 420px) on the Desktop breakpoint. On a 1216px-wide Main section, this leaves the heading constrained to roughly 37% of the available width while the SubHeading floats to the right (in the Description column). The fixed widths work on Desktop but create issues at the boundaries of the 1280px breakpoint — if the viewport is exactly 1280px (or slightly above), the heading can wrap awkwardly. A flexible width (`1fr` or `100%`) would adapt better. Tablet and Phone overrides may compensate, but the Desktop fixed widths are still fragile.
Evidence: Node `VxOMUJGei.attributes.width: "450px"`; Node `qqi7bNh_7.attributes.width: "420px"`. Services section screenshot: https://framerusercontent.com/screenshots/on-demand/05154014-631f-4acf-bc4e-3a8a73a68b8b.jpg
Recommended Fix: Change the fixed widths to `1fr` (fill available space) or use `maxWidth` instead of `width` to allow flexibility.
Confidence: Medium
Discovered by: sub-agent 1, session TV (originally TV-1-25)

---

## TV-23 — CRITICAL: Placeholder address "123 Pet Care Lane, New York, NY 12345" used in 2 places (Map Card location + Contact Details text)
Status: Open
Category: Content & copy
Severity: Critical
Location: Home `/` — Location & Hours section. Map Card instance `lCK08T8rh` (`$control__location: "123 Pet Care Lane, New York, NY 12345"`) and Contact Details text node `v:fxcNeuZ51:0:0` (same text).
Description: The Location section displays the address "123 Pet Care Lane, New York, NY 12345" in two places: (1) as the `$control__location` of the Map Card component (which feeds Google Maps to render the map pin and zoom level), and (2) as plain text in the Contact Details column. "123 Pet Care Lane" is clearly a placeholder street name, and "12345" is a placeholder ZIP code (it happens to be the real ZIP for Schenectady, NY, but that's almost certainly not intended). The Map Card will attempt to geocode this address — Google may render a random location or fail to find a precise pin. Visitors attempting to navigate to the clinic using the displayed address will be misled.
Evidence: ComponentInstanceNode `lCK08T8rh.attributes.$control__location: "123 Pet Care Lane, New York, NY 12345"`. Plain text node `v:fxcNeuZ51:0:0` text="123 Pet Care Lane, New York, NY 12345". Both within Location section `fX2ht5DXq`. Location section screenshot: https://framerusercontent.com/screenshots/on-demand/ced2dec7-6bc7-4154-8d1c-1f2dae07ca39.jpg
Recommended Fix: Replace the placeholder address with the real Vetly clinic address in both the Map Card `$control__location` and the Contact Details text node. Verify the map pin renders correctly after the update.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-29)

---

## TV-24 — Placeholder email "hello@vetly.com" displayed in Contact Details (verify deliverability)
Status: Open
Category: Content & copy
Severity: Medium
Location: Home `/` — Location & Hours section, Contact Details text node `v:uEWGmvqAJ:0:0` (text="hello@vetly.com").
Description: The Contact Details column shows the email "hello@vetly.com". This may be a real address, but it follows the same placeholder pattern as the surrounding fake phone number and fake address. There is no `mailto:` link on the email — it's plain text, so visitors can't click to compose an email. If the email is real, make it a clickable `mailto:hello@vetly.com` link. If it's a placeholder, replace with the real Vetly support email.
Evidence: Text node `v:uEWGmvqAJ:0:0` text="hello@vetly.com" (no surrounding link attribute found on the parent RichTextNode). Located in Contact Details column of the Location section.
Recommended Fix: Verify "hello@vetly.com" is a real, monitored inbox. If yes, wrap it in a `mailto:hello@vetly.com` link. If no, replace with the real address and link it.
Confidence: Medium
Discovered by: sub-agent 1, session TV (originally TV-1-30)
Reviewer note: Severity changed to Medium per reviewer.

---

## TV-25 — Hero Outline Button "Talk to a Vet" links to `/contact` (verify it should NOT be a `tel:` link)
Status: Open
Category: UX & conversion
Severity: Medium
Location: Home `/` — Hero section, Buttons frame `ZgwaCSdwx`, Outline Button instance `utfr2jCSf` (component `NoQy1opGY`).
Description: The Hero's secondary CTA "Talk to a Vet" (with a Phone icon) links to `/contact` — an internal page navigation — rather than `tel:` dialing the clinic directly. A visitor seeing "Talk to a Vet" with a phone icon would reasonably expect tapping it to start a phone call. Instead, they're taken to a contact form page. This is a UX expectation mismatch. Either change the button to dial a real phone number (`tel:<real-number>`) OR change the copy to something like "Contact Us" / "Send a Message" that matches the internal-page navigation. The current pairing of "Talk to a Vet" + phone icon + `/contact` link is internally inconsistent.
Evidence: ComponentInstanceNode `utfr2jCSf.attributes: { $control__text: "Talk to a Vet", $control__link: "/contact", $control__icon1: "Phone", $control__icon1Visible: "true" }`. Hero screenshot: https://framerusercontent.com/screenshots/on-demand/7f590178-1208-4471-868c-ec2c4fd9e148.jpg
Recommended Fix: Either (a) change the link to `tel:<real-clinic-number>` once the real number is provided (see TV-1-28), OR (b) change the button text to "Contact Us" and keep the link as `/contact`. Don't pair a phone icon + "Talk to a Vet" copy with a non-`tel:` link.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-32)

---

## TV-26 — CORRECTION to TV-1-11: Tablet Hero DOES have a visible Hero Image (sibling of Content), Phone has the image INSIDE Content (sibling hidden)
Status: Open
Category: UX & conversion
Severity: Low
Location: Home `/` — Hero section across all 3 breakpoints. TV-1-11 originally claimed Tablet had no hero image — that was wrong. Corrected observations below.
Description: After deeper inspection: Desktop Hero has 2 children (Content + Hero Image `CYJj6h2yV`, image on right at 43% width); Tablet Hero has 2 children (Content + Hero Image `hmX39_cxlCYJj6h2yV`, image is full-width 704×480px below content); Phone Hero has 2 children (Content + Hero Image `BkwtJCk0LCYJj6h2yV` which is `visible: "false"`, plus an internal Hero Image `BkwtJCk0LZ9JS5BA29` inside the Content frame, visible at 1fr×450px). So all 3 breakpoints DO show a hero image — but Phone uses a different structural location (inside Content vs. as a sibling). This means: (1) the Phone has a hidden Hero Image sibling frame (`BkwtJCk0LCYJj6h2yV`) that's dead weight; (2) on Tablet, the hidden `hmX39_cxlZ9JS5BA29` Hero Image inside Content is also dead weight (since the sibling is the visible one). Both hidden duplicates should be cleaned up. TV-1-11's original premise (tablet has no image) is retracted.
Evidence: Tablet Hero `hmX39_cxlLQn3zLbUg` direct children: count=2 (`hmX39_cxlzHo3hTChK` Content + `hmX39_cxlCYJj6h2yV` Hero Image, both visible). Phone Hero `BkwtJCk0LLQn3zLbUg` direct children: count=2 (`BkwtJCk0LzHo3hTChK` Content + `BkwtJCk0LCYJj6h2yV` Hero Image `visible: "false"`). Tablet Hero Image rect: `{ x: 0, y: 573, width: 704, height: 480 }`.
Recommended Fix: Delete the hidden Hero Image duplicate frames: `hmX39_cxlZ9JS5BA29` (Tablet, inside Content) and `BkwtJCk0LCYJj6h2yV` (Phone, sibling of Content). Keep the visible instances.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-33)

---

## TV-27 — Hero image (and all images via ImageReveal code component) have NO alt text exposed
Status: Open
Category: Accessibility & compliance
Severity: High
Location: Home `/` — Hero Image frame `CYJj6h2yV` and ImageReveal instance `Ru5gXN_Yg` (`$control__image: "https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png"`). Same issue affects Why Us Card images (e.g., `LsVbtMwYG` with `$control__image2`), Team Card images, Testimonial profile images, and Blog Card images — all use the ImageReveal code component or component-instance image controls without an alt-text field.
Description: The hero image is rendered via the ImageReveal code component (`codeFile/hZwaqDB:default`). The component exposes many controls (`$control__image`, `$control__imageReveal`, `$control__direction`, `$control__shadow`, etc.) but NO `$control__alt` or accessibility control. The host FrameNode `CYJj6h2yV` also has no `alt` attribute. This means the hero image renders in the final HTML without an `alt` attribute — a WCAG 2.1 Level A failure (criterion 1.1.1 Non-text Content). Screen reader users get no information about what the image shows. The same pattern affects every image on the home page that uses ImageReveal or component-instance image controls (Why Us, Team, Testimonials, Blog sections). Sub-agent 11 (code components) owns the ImageReveal component-level fix.
Evidence: ImageReveal instance `Ru5gXN_Yg.attributes` — exhaustive list of `$control__*` keys, none of which is `alt` or `ariaLabel` or `accessibilityLabel`. Host FrameNode `CYJj6h2yV` has no `alt` attribute (verified via `attributeFilter: ["alt", "ariaLabel", "role", "aria-hidden", "aria-labelledby", "htmlTag", "title"]` — all returned undefined). Why Us Card `LsVbtMwYG.attributes` has `$control__image2` but no `$control__alt`.
Recommended Fix: Add an `alt` prop (e.g., `$control__alt`) to the ImageReveal code component definition, with a default empty string. Then set per-instance alt text on every image: e.g., hero image alt="Veterinarian examining a happy dog"; Why Us Card #1 alt="Compassionate care illustration"; etc. For decorative images, set `alt=""` (empty) explicitly. Sub-agent 11 owns the component-level fix; sub-agent 8 should verify the sitewide accessibility impact.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-35)

---

## TV-28 — "Your Pet's Health, Our Promise" tagline appears 3 times in the Hero (Floating Trust Card heading, and 2x as duplicated text)
Status: Open
Category: Content & copy
Severity: Low
Location: Home `/` — Hero section. Floating Trust Card heading `A7abFyE50` (text "Your Pet's Health, Our Promise"), and the same text appears again at `vaHZkQ6l8` (under a hidden Hero Image variant) and at `A7abFyE50`'s sibling in the other Hero Image variant.
Description: The phrase "Your Pet's Health, Our Promise" appears multiple times in the Hero section's serialized output — once in the visible Floating Trust Card (`A7abFyE50`, in the visible Hero Image frame `CYJj6h2yV`), and again in a duplicate Floating Trust Card (`GT3p3XJ8w`) inside the hidden Hero Image frame `Z9JS5BA29` (which has `visible: "false"` on Desktop). Same pattern for "Reliable, modern, compassionate", "20K+", and "Happy Pet Owners" — they all appear twice. While only one set is visible at a time, the duplication inflates the page-tree node count and creates a maintenance hazard (when copy needs updating, both sets must be edited). This is related to TV-1-33 (hidden Hero Image duplicates).
Evidence: Text runs: `v:A7abFyE50:0:0` text="Your Pet's Health, Our Promise" (in visible Floating Trust Card `DzayWjytl` under `CYJj6h2yV`); `v:vaHZkQ6l8:0:0` text="Your Pet's Health, Our Promise" (in hidden Floating Trust Card `GT3p3XJ8w` under `Z9JS5BA29` which is `visible: "false"`). Same for `v:GDvw7k0Fu:0:0` vs `v:O3QeO_nTi:0:0` ("Reliable, modern, compassionate"), `v:Y6WF7bQ6A:0:0` vs `v:YZO0DkLpt:0:0` ("20K+"), `v:prCAvc5Eu:0:0` vs `v:q22iVEUgt:0:0` ("Happy Pet Owners").
Recommended Fix: Delete the hidden Hero Image frame `Z9JS5BA29` (Desktop) and its descendants. This eliminates the duplicate text. See TV-1-33 for the cross-breakpoint cleanup.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-37)

---

## TV-29 — "No CTA section" between FAQ and Blog on the home page — missing bottom-of-funnel conversion push
Status: Open
Category: UX & conversion
Severity: Medium
Location: Home `/` — Overall page structure. The 8 sections in Main are: Hero, Services, Why Us, Team, Testimonials, Location & Hours, FAQ, Blog. No dedicated CTA/banner section before the footer.
Description: The home page has 8 sections in this order: Hero → Services → Why Us → Team → Testimonials → Location & Hours → FAQ → Blog. There is NO dedicated CTA banner section near the end of the page (between FAQ and Blog, or between Blog and Footer). A veterinary site's home page typically ends with a strong "Book an Appointment" or "Get Started Today" banner to catch visitors who scrolled through all the content but haven't converted yet. The current Blog section ends with a "View All Articles" button (good for content discovery, but not a conversion CTA). The only conversion CTAs are in the Hero (top of page) and the Location section's "Book Today" button (middle of page). Visitors who scroll all the way to the FAQ and Blog sections lose the conversion path. Adding a final CTA section before the footer would capture bottom-of-funnel traffic.
Evidence: Main section `J30SjU3lW` children (8 total): Hero (`LQn3zLbUg`), Services (`eZEcRmmgH`), Why Us (`QoKzPrhjk`), Team (`mB6Emc7AS`), Testimonials (`Bz6Rh_D5A`), Location (`fX2ht5DXq`), FAQ (`VD4u7vQTO`), Blog (`ODSnKnEj0`). No section named "CTA" or similar. CTA component (`GkwGTE6uU`) exists in the project inventory but is not used on the home page. Home page full screenshot: https://framerusercontent.com/screenshots/on-demand/c5a0dd3e-fed3-4ef9-a500-00399866d176.jpg
Recommended Fix: Add a CTA section (using the existing `CTA` component `GkwGTE6uU`) between the Blog section and the Footer. Recommended copy: "Ready to Give Your Pet the Care They Deserve?" with a primary "Book an Appointment" button linking to `/booking` and a secondary "Talk to a Vet" button.
Confidence: High
Discovered by: sub-agent 1, session TV (originally TV-1-38)

---

## TV-30 — `metadata.title` uses an em-dash-style pipe separator; consider matching brand conventions
Status: Open
Category: Content & copy
Severity: Low
Location: Home `/` — page node `augiA20Il` `metadata.title: "Vetly Veterinary Care | Pet Health Without the Stress"`.
Description: The home page's `metadata.title` is "Vetly Veterinary Care | Pet Health Without the Stress". The title uses a pipe `|` separator between the brand name and the tagline, and includes the word "Vetly" twice (once as "Vetly Veterinary Care" and once conceptually as the brand). The title is 53 characters — within SEO best practices (≤60 chars). The tagline "Pet Health Without the Stress" matches the Hero heading's "Without the Stress" theme, which is good brand alignment. However, "Vetly Veterinary Care" is slightly redundant — most pages should use just "Vetly" as the brand prefix. (Compare: the Hero h1 is "Better Care for Your Pet, Without the Stress" — different copy, which is fine.) This is a minor wording polish item.
Evidence: `attributes.metadata.title: "Vetly Veterinary Care | Pet Health Without the Stress"` (53 chars).
Recommended Fix: Consider shortening to "Vetly | Pet Health Without the Stress" (38 chars) for a cleaner brand prefix, OR keep as-is if "Vetly Veterinary Care" is the full registered business name. Defer to brand owner.
Confidence: Medium
Discovered by: sub-agent 1, session TV (originally TV-1-39)

---

## TV-31 — "Book an Appointment" CTA on /services listing has no link (non-functional button)
Status: Open
Category: UX & conversion
Severity: Critical
Location: `/services` page, Desktop breakpoint `dsTAAo8ZZ`, Hero section `lmlzvSBc4`, Primary Button component instance `W_B9G7Iek` (component `ARbK0E6gq`)
Description: The Primary Button labeled "Book an Appointment" in the hero of the `/services` listing page has neither `$control__link` nor an `onClick` EventHandler set on the component instance. The Primary Button component definition declares both a `Link` control (`$control__link`, id `w2CURmc1u`) and an `onClick` EventHandler variable (`ZjDdEPui1`), but neither is populated on this instance. As a result, clicking the button does nothing — no navigation, no scroll, no action. This is the primary conversion CTA above the fold on the services listing page; a non-functional CTA directly costs bookings.
Evidence: - Serialized instance attributes (depth 0): `{"$control__title":"Book an Appointment","$control__newTab":"false","$control__bGColor":"var(--token-8d76f153-...)","$control__textColor":"var(--token-219c2d29-...)","$control__leftIconVisible":"false","$control__leftIcon":"Calendar Plus","$control__rightIconVisible":"true","$control__rightIcon":"Calendar Plus",...}` — NO `$control__link` key, NO `onClick` key.
- Primary Button component definition confirms a `Link` LinkVariable and `onClick` EventHandlerVariable exist as controls.
- Screenshot of `/services` Desktop hero: https://framerusercontent.com/screenshots/on-demand/6f33799c-0e3a-4a65-96cf-7937361988d3.jpg
Recommended Fix: Set `$control__link="/booking"` on instance `W_B9G7Iek` (or set it to `/contact` if booking is meant to be a contact form). Confirm the link works in preview before publishing.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-1)

---

## TV-32 — "Book Appointment" CTA on /services/:Services detail page has no link (non-functional button)
Status: Open
Category: UX & conversion
Severity: Critical
Location: `/services/:Services` page, Desktop breakpoint `L0pZyMNz4`, Hero section `NJXQamoBU`, Buttons container `tlbD4UjgK`, Primary Button component instance `QDrNwNl7H` (component `ARbK0E6gq`)
Description: Same issue as TV-2-1 but on the detail page. The "Book Appointment" Primary Button in the detail page hero has no `$control__link` and no `onClick` EventHandler set. This is the highest-intent CTA on the page (a visitor already viewing a specific service has clear booking intent) and it does nothing when clicked. There is no other "Book" CTA on the detail page.
Evidence: - Serialized instance attributes (depth 0): `{"$control__title":"Book Appointment","$control__leftIconVisible":"true","$control__leftIcon":"Calendar Plus","$control__rightIconVisible":"false",...}` — NO `$control__link`, NO `onClick`.
- Screenshot of `/services/:Services` Desktop hero: https://framerusercontent.com/screenshots/on-demand/3446b674-9804-4233-a419-021450756d81.jpg
Recommended Fix: Set `$control__link="/booking"` on instance `QDrNwNl7H`. Bonus: also pre-fill the booking form with the current service title via a URL query param so the visitor sees context-aware booking.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-2)

---

## TV-33 — No `<h1>` heading on /services/:Services detail page
Status: Open
Category: SEO & metadata
Severity: High
Location: `/services/:Services` page, Desktop breakpoint `L0pZyMNz4`
Description: The detail page has no `<h1>` element anywhere. The hero Title (bound to the CMS Title field) renders as a `<h2>` because its `textStylePreset="Heading 2"`. The "About The Service" hardcoded heading is also `<h2>`. The "What to Expect", "Benefits", and "FAQ" section headings are all `<h3>`. Every page should have exactly one `<h1>` describing its primary topic; for a CMS detail page that primary topic is the service Title. Search engines and screen readers use h1 to identify page topic.
Evidence: - Hero Title RichTextNode `z46rpmDZO` attributes: `textStylePreset: "Heading 2"`, `text: "var(--variable-rcONKAEdm)"` (Title variable). Heading 2 text-style preset maps to `<h2>` tag per the project's text-style definitions.
- "About The Service" RichTextNode `ylWnmXl4L`: TextBlock child `v:ylWnmXl4L:0` has `tag: "h2"`.
- FAQ RichTextNode `Z1S2KgElo`: TextBlock child `v:Z1S2KgElo:0` has `tag: "h3"` (despite `textStylePreset: "Heading 1"` — see TV-2-13).
- "What to Expect" heading `HUohq68FA` and "Benefits" heading `jnmcBr4Gm`: TextBlock tag `h3`.
- No `<h1>` tag found in any serialized TextBlock on the page.
Recommended Fix: Change the hero Title RichTextNode `z46rpmDZO` to use `textStylePreset: "Heading 1"` (which maps to h1). Update its font size to match the existing design (or create a new "Page Title" text-style preset that uses h1 tag with the current 44px Manrope styling if the 56px Heading 1 default is too large).
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-4)

---

## TV-34 — Hero image altText on detail page is hardcoded "Smiling veterinarian...Golden Retriever" — wrong for almost every service
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/services/:Services` page, Desktop breakpoint, Hero section `NJXQamoBU`, Hero Image frame `oiTnj2OhB`, inner Image frame `yLIDf8fgV`
Description: The hero image on the service detail page binds its `fill` to the CMS Hero Image variable (`var(--variable-cuwT3VRH4)`), so the displayed image changes per service. However, the `altText` attribute is hardcoded to `"Smiling veterinarian in a white coat embraces a happy Golden Retriever. The dog pants joyfully, conveying warmth and trust."` — the same string on every service detail page. For services like "End of Life Care", "Surgical Care", "Diagnostics & Lab Testing", this alt text is factually wrong and misleading to screen-reader users. The CMS Hero Image field does not have an alt-text sub-field, so there is currently no way to per-service override the alt text.
Evidence: - Serialized `yLIDf8fgV`: `{"fill":"var(--variable-cuwT3VRH4)","altText":"Smiling veterinarian in a white coat embraces a happy Golden Retriever. The dog pants joyfully, conveying warmth and trust."}`.
- Confirmed this is the same altText as the listing-page hero image `qIDQBYT82` (where it IS appropriate because that image is a static URL showing the same content).
- Screenshot of `/services/:Services` Desktop hero: https://framerusercontent.com/screenshots/on-demand/3446b674-9804-4233-a419-021450756d81.jpg
Recommended Fix: Two options. (a) Quick: blank out `altText` on `yLIDf8fgV` (set to empty string) so the image is treated as decorative — the surrounding hero Title already conveys the topic. (b) Better: add an "Hero Image Alt" string field to the Services CMS collection and bind `altText` on `yLIDf8fgV` to it; populate per service. Option (b) requires a CMS schema change.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-5)

---

## TV-35 — Gallery images on detail page have no altText (accessibility)
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/services/:Services` page, About Service section `Nk0OW8Pym`, gallery grid children `ZQYSQukLi` (Gallery Image 1), `cXwBdM26h` (Gallery Image 2), `ahe8xfHa6` (Gallery Image 3)
Description: The three gallery image frames on the detail page each bind their `fill` to a CMS Gallery Image variable but have NO `altText` attribute set. Screen-reader users get no information about these images. Since these are content images (they illustrate the service being described), they should have descriptive alt text — not be treated as decorative.
Evidence: - `serializeNodes({ids:["ZQYSQukLi","cXwBdM26h","ahe8xfHa6"], depth:0})` returns each with a `fill` bound to a CMS variable but NO `altText` key in attributes.
- Gallery Image 1 (`ZQYSQukLi`) also has `gridItemColumnSpan: "2"` and `width: 400px, height: 500px`; Gallery Images 2 and 3 are `334px × 400px` each.
- Screenshot of About Service section: https://framerusercontent.com/screenshots/on-demand/57cdba6c-1993-424b-bede-6e13859d299a.jpg
Recommended Fix: Same two options as TV-2-5. Either (a) add per-image alt-text CMS fields ("Gallery Image 1 Alt", etc.) and bind them, or (b) accept a single "Gallery Alt Text Pattern" string field per service and bind it to all three (less ideal but workable). At minimum, add empty `altText=""` so screen readers skip them as decorative.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-6)

---

## TV-36 — CMS "Icon Type" field is bound nowhere on the canvas — every Service Card shows the same "First Aid" icon
Status: Open
Category: CMS
Severity: High
Location: Services CMS collection, field `Icon Type` (id `I1IRbR5N1`, type `icon`). Service Card component instance `i2tDKiL52` on `/services` listing page.
Description: The Services CMS collection has an `Icon Type` field of type `icon` whose values are custom-module icon strings (e.g. `module:ymfAq2DVcLiKlsezjKVS/8WwrCHe8QToasxixJGmb/SfCyr4H8Y.js:default` for "End of Life Care"). All 12 items have a value set. However, this field is NOT bound to any canvas node — neither on the `/services` listing page nor on the `/services/:Services` detail page. The Service Card component (`ecHzMZLnH`) has an `Icon` control of type `IconVariable` restricted to the `Phosphor` icon set with `initialValue: "First Aid"`. The instance on the listing page (`i2tDKiL52`) does NOT bind `$control__icon` to any variable, so every one of the 12 cards displays the same "First Aid" Phosphor icon regardless of service. The likely cause is a type mismatch: the CMS field stores custom-module icons (probably from a custom code component) while the Service Card's `Icon` control only accepts Phosphor icon names.
Evidence: - Service Card component variables include `{"set":"Phosphor","initialValue":"First Aid","key":"$control__icon","id":"RQiDdtU4l","name":"Icon","node":"IconVariable","type":"icon"}`.
- Service Card instance `i2tDKiL52` attributes (depth 0): only `$control__title`, `$control__description`, `$control__padding` are set. No `$control__icon` override.
- All 12 CMS items have `$control__icon_type` populated (verified via collection serialize), e.g. End of Life Care = `module:ymfAq2DVcLiKlsezjKVS/...:default`.
- The detail page also has no node bound to `var(--variable-I1IRbR5N1)` (search of the serialized tree).
- Screenshot of Services Cards collection: https://framerusercontent.com/screenshots/on-demand/10c4d575-ddba-4289-8f0d-88a160a98857.jpg (every card shows the same "First Aid" icon).
Recommended Fix: Decide whether the Icons per service matter. If yes: either (a) change the Service Card `Icon` control to also accept the custom-module icon type (requires a code-component icon provider that exposes its icon names as an icon set), then bind `$control__icon` on `i2tDKiL52` to `var(--variable-I1IRbR5N1)`; OR (b) replace the custom-module icon values in the CMS with Phosphor icon names that semantically match each service (e.g. "Heartbeat" for Cardiology, "Tooth" for Dental, "Stethoscope" for Wellness), then bind. If the icons don't matter visually, delete the `Icon Type` CMS field to avoid dead data.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-7)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-12-12 → now renumbered as TV-12-12. Services CMS Icon Type field is bound nowhere on the canvas — every card shows the same default icon.

---

## TV-37 — "End of Life Care" CMS item missing Hero Image, Gallery Image 2, and Gallery Image 3
Status: Open
Category: CMS
Severity: High
Location: Services CMS collection, item id `JMTTMhaJy` (Title: "End of Life Care", Slug: `end-of-life-care`)
Description: The "End of Life Care" service item is missing three image fields: `Hero Image` (id `cuwT3VRH4`), `Gallery Image 2` (id `ETkdlMg0x`), and `Gallery Image 3` (id `vul25GQ8X`). All other 11 services have all four images set. When a visitor lands on `/services/end-of-life-care`, the hero image frame and two of the three gallery frames will render empty (no fill). The Card Description and listing card still display correctly (those use only Title + Card Description fields, both set).
Evidence: - Collection serialize depth 1, item `JMTTMhaJy` attributes: `$control__hero_image` undefined, `$control__gallery_image_2` undefined, `$control__gallery_image_3` undefined. Other 11 items have all three set (verified via the summary loop in state.servicesSummary).
- All 12 items confirmed via `state.servicesSummary` (see worklog).
- Screenshot of End of Life Care card visible in the listing screenshot: https://framerusercontent.com/screenshots/on-demand/10c4d575-ddba-4289-8f0d-88a160a98857.jpg
Recommended Fix: Upload appropriate images for the three missing fields on the "End of Life Care" item. If a sensitive image is needed for end-of-life content, use a calm/peaceful photo (a sleeping pet, soft lighting) rather than a clinical photo.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-8)

---

## TV-38 — Hidden duplicate "Benefits" column on detail page (visible="false", never renders)
Status: Open
Category: Components (native + code)
Severity: Medium
Location: `/services/:Services` page, About Service section `Nk0OW8Pym`, bottom row `HWvX4YU41`, third column `wgaPUAPqi` (named "Benefits")
Description: The detail page bottom row contains three columns: visible "What to Expect" (`Gzp2Fifh5`), visible "Benefits" (`OIyyc8OVE` — see TV-2-11 for the frame-name confusion), and a third column (`wgaPUAPqi`) also named "Benefits" with `visible: "false"`. The hidden column has its own RichTextNode (`tut5XNlSz`) bound to the same `var(--variable-GXPTqAkip)` Benefits variable as the visible column. It is dead, redundant layout that should be removed to clean up the canvas. The screenshot of `wgaPUAPqi` returned no image — confirming it does not render.
Evidence: - `serialize` of `wgaPUAPqi` depth 0: `attributes.visible: "false"`. Also has `fill: "var(--token-84671a66-6df5-4319-9af9-fe6564c16d54)"` (a different fill from the visible columns).
- Child RichTextNode `tut5XNlSz`: `text: "var(--variable-GXPTqAkip)"` (same variable as the visible Benefits column's `RUCJNNAgW`).
- `readProject({type:"screenshot", id:"wgaPUAPqi"})` returned a result with NO `image_url` field — confirms the node is not rendered.
Recommended Fix: Delete the `wgaPUAPqi` frame and its children entirely. The visible Benefits column already covers the field.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-9)

---

## TV-39 — Why Us Card 4 description is an incomplete sentence
Status: Open
Category: Content & copy
Severity: Medium
Location: `/services` listing page, Why Us section `FSvggM4G4`, Why Us Cards grid `l8xcc3IcB`, fourth card component instance `GMbTeiOAN`
Description: The fourth "Why Us Card" has title "Peace of Mind, Always" and description "Clear guidance, thoughtful care, and confident decisions so you always feel." The sentence is incomplete — it trails off after "feel." with no object or complement. Likely a copy-editing accident (the writer meant "so you always feel confident" or "so you always feel supported"). The other three Why Us Cards have complete sentences.
Evidence: - Instance `GMbTeiOAN` attributes: `$control__title: "Peace of Mind, Always"`, `$control__description: "Clear guidance, thoughtful care, and confident decisions so you always feel."`.
- Other three cards (DbI71cpeQ, My4HF2lJo, K0u02rykk) have complete descriptions ending with proper terminal punctuation.
- Screenshot of Why Us section: https://framerusercontent.com/screenshots/on-demand/229c60dd-725b-4aad-9d3e-35f344558614.jpg
Recommended Fix: Complete the sentence. Suggested: "Clear guidance, thoughtful care, and confident decisions so you always feel supported." or "Clear guidance, thoughtful care, and confident decisions so you always feel at ease."
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-10)

---

## TV-40 — Two detail-page frames both named "What to Expect" (frame-name confusion)
Status: Open
Category: Components (native + code)
Severity: Medium
Location: `/services/:Services` page, About Service section `Nk0OW8Pym`, bottom row `HWvX4YU41`, children `Gzp2Fifh5` and `OIyyc8OVE`
Description: The bottom row of the detail page About-Service section has two sibling frames that are BOTH named "What to Expect" in the layer panel. The first (`Gzp2Fifh5`) actually contains the "What to Expect" heading + What-to-Expect CMS richtext binding. The second (`OIyyc8OVE`) actually contains the "Benefits" heading + Benefits CMS richtext binding. This is a frame-naming inconsistency that will confuse editors maintaining the page. The frame names should match the content they contain.
Evidence: - `serialize` of `Gzp2Fifh5` depth 0: `name: "What to Expect"`. Child `HUohq68FA` TextRun text: "What to Expect". Child `IrsUD8a8K` text: `var(--variable-DveubFVEm)` (the What to Expect richtext variable).
- `serialize` of `OIyyc8OVE` depth 0: `name: "What to Expect"` (same name). Child `jnmcBr4Gm` TextRun text: "Benefits". Child `RUCJNNAgW` text: `var(--variable-GXPTqAkip)` (the Benefits richtext variable).
Recommended Fix: Rename frame `OIyyc8OVE` from "What to Expect" to "Benefits". (Renaming a FrameNode does not affect rendering, only editor-layer clarity.)
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-11)

---

## TV-41 — Copy + icon-position inconsistency between the two "Book" Primary Buttons
Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/services` listing hero button `W_B9G7Iek` vs `/services/:Services` detail hero button `QDrNwNl7H`
Description: The two Primary Button instances on the Services pages use inconsistent copy and icon placement. The listing-page button reads "Book an Appointment" with the Calendar Plus icon on the RIGHT (`rightIconVisible: true`, `leftIconVisible: false`). The detail-page button reads "Book Appointment" (no "an") with the Calendar Plus icon on the LEFT (`leftIconVisible: true`, `rightIconVisible: false`). For the same brand action, the copy and the icon side should be consistent across pages.
Evidence: - Listing `W_B9G7Iek`: `$control__title: "Book an Appointment"`, `$control__leftIconVisible: "false"`, `$control__rightIconVisible: "true"`, `$control__rightIcon: "Calendar Plus"`.
- Detail `QDrNwNl7H`: `$control__title: "Book Appointment"`, `$control__leftIconVisible: "true"`, `$control__leftIcon: "Calendar Plus"`, `$control__rightIconVisible: "false"`.
Recommended Fix: Standardize on one variant. Suggested: "Book Appointment" with the Calendar Plus icon on the left (matches the detail page and the more common pattern of icon-left + text). Apply to both instances.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-12)

---

## TV-42 — FAQ heading uses textStylePreset "Heading 1" (56px) but tag="h3" (semantic/visual mismatch)
Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/services/:Services` page, FAQ section `kqOSYdiNZ`, FAQ heading RichTextNode `Z1S2KgElo`
Description: The "FAQ" heading on the detail page has `textStylePreset: "Heading 1"` (which visually renders at 56px Manrope — the largest heading style) but its TextBlock child has `tag: "h3"`. This means the visual hierarchy (largest heading on the page) does not match the semantic hierarchy (h3, two levels below h1). Search engines and screen readers see an h3 while visitors see an h1-sized heading. Given there is no h1 on the page at all (see TV-2-4), the visual size of this FAQ heading is also disproportionate.
Evidence: - `serialize` of `Z1S2KgElo` depth 2: `attributes.textStylePreset: "Heading 1"`, child `v:Z1S2KgElo:0` `attributes.tag: "h3"`, child TextRun text: "FAQ".
- The page's other section headings ("About The Service", "What to Expect", "Benefits") use `textStylePreset: "Heading 2"` or `"Heading 5"` — none use Heading 1.
Recommended Fix: Change `textStylePreset` on `Z1S2KgElo` to `"Heading 5"` (24px, matching the What to Expect / Benefits section headings) to align visual hierarchy with the h3 semantic tag. Pair with TV-2-4 fix (promote hero Title to h1).
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-13)

---

## TV-43 — Empty State copy is just "No items" — unhelpful UX
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/services` listing page, Services Cards Collection List `WlJklkSOA`, Empty State frame `x_5gU4Bw5`, RichTextNode `ZNlYU8K7O`
Description: The Empty State for the Services Collection List contains a single RichTextNode with the literal text "No items". This is a developer-facing placeholder string, not a user-facing message. While the empty state never displays today (collection has 12 items), if the collection is ever filtered or emptied, visitors would see this unhelpful message. The copy should explain what's missing and suggest an action.
Evidence: - `serialize` of `x_5gU4Bw5` depth 4: child `ZNlYU8K7O` TextBlock `v:ZNlYU8K7O:0` TextRun text: "No items".
- Empty State has `visible: { from: "var(--variable-WlJklkSOA-item-count)", transforms: [{name:"equals", value:0}] }` — correctly configured to only show when item count is zero.
Recommended Fix: Replace "No items" with something like "No services match your filter. Try clearing filters or browse all services below." If no filtering is planned, use "We're adding new services soon — please check back." For now, this is a defensive placeholder.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-15)

---

## TV-44 — Service Card "Learn More" action row is dimmed to 35% opacity
Status: Open
Category: Visual design & branding
Severity: Medium
Location: Service Card component (`ecHzMZLnH`), Default variant `LK3AVFLo7`, Details Stack `jqcVeONFI`, Action Button frame `h26xb6cck`
Description: The "Learn More" + Arrow Right icon row at the bottom of every Service Card has `opacity: "0.35"` on its parent frame. This dims the action affordance to 35% of full color, making it look disabled or unimportant. Since the entire card is clickable (link on the wrapping frame `qZsOQyJnj`), the "Learn More" affordance should be clearly visible to communicate clickability. The dimmed opacity likely fails WCAG contrast minimums for the action text color against the card background.
Evidence: - `serialize` of `h26xb6cck` depth 0: `attributes.opacity: "0.35"`.
- Screenshot of Services Cards: https://framerusercontent.com/screenshots/on-demand/10c4d575-ddba-4289-8f0d-88a160a98857.jpg
Recommended Fix: Either remove the `opacity: "0.35"` (set to 1) so the action is full-strength, OR if the intent was a subtle secondary affordance, raise it to at least `0.6` and verify the action-text color (`var(--token-8a93520a-...)`) still meets 4.5:1 contrast against the white card fill at that opacity. Sub-agent 8 should measure.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-16)

---

## TV-45 — "Call Now" Outline Button has `border: 0px solid ...` (invisible border)
Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/services/:Services` page, Outline Button instance `Tsglsx7S8`
Description: The "Call Now" Outline Button on the detail page has `$control__border: "0px solid var(--token-70a89806-...)"`. A 0px border is invisible — the button is styled as an outline button but visually appears borderless, distinguished only by its Phone icon and "Call Now" text. This is likely an oversight; the Outline Button component's purpose is to have a visible border.
Evidence: - `serialize` of `Tsglsx7S8` depth 0: `$control__border: "0px solid var(--token-70a89806-6562-410d-80cc-9b0fdfdf21e3)"`. Other style attributes (`$control__fill: "rgba(255,255,255,0)"`, transparent fill) confirm the button has no visible boundary.
- Screenshot of detail hero: https://framerusercontent.com/screenshots/on-demand/3446b674-9804-4233-a419-021450756d81.jpg
Recommended Fix: Set `$control__border` to a visible value, e.g. `"1px solid var(--token-70a89806-...)"` (the existing border-color token). Or, if the design intent is genuinely borderless, rename the component instance to "Text Button" or "Link Button" for clarity.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-17)

---

## TV-46 — "Parasite Prevention" service slug is "parasite-prevention-nutrition" (doesn't match title)
Status: Open
Category: SEO & metadata
Severity: Low
Location: Services CMS collection, item `x5UTiDP5y` (Title: "Parasite Prevention", Slug: `parasite-prevention-nutrition`)
Description: The "Parasite Prevention" service has slug `parasite-prevention-nutrition` — includes "nutrition" which isn't in the current title. The Card Description does mention "expert nutrition advice for optimal health and vitality", so the slug may be an artifact of an earlier title like "Parasite Prevention & Nutrition". The mismatch is minor for SEO (slug doesn't have to match title exactly) but can confuse users who see the URL.
Evidence: - Collection serialize, item `x5UTiDP5y` attributes: `$control__title: "Parasite Prevention"`, `$control__slug: "parasite-prevention-nutrition"`, `$control__card_description: "Tailored prevention against fleas, ticks, and heartworms, plus expert nutrition advice for optimal health and vitality."`.
- All other 11 items have slugs that match their titles (e.g. "Dental & Oral Health" → `dental-oral-health`, "End of Life Care" → `end-of-life-care`).
Recommended Fix: Either rename the slug to `parasite-prevention` (cleaner) OR update the Title to "Parasite Prevention & Nutrition" (matches slug). If renaming the slug, set up a 301 redirect from `/services/parasite-prevention-nutrition` to `/services/parasite-prevention` (sub-agent 14's redirect scope).
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-18)
Dedupe note: This finding consolidates 2 cross-sub-agent duplicate(s): TV-7-12, TV-12-13 → now renumbered as TV-7-12, TV-12-13. Parasite Prevention slug — triple-duplicate across sub-agents 2, 7, 12.

---

## TV-47 — "About The Service" heading is hardcoded — doesn't include the service name
Status: Open
Category: UX & conversion
Severity: Low
Location: `/services/:Services` page, About Service section `Nk0OW8Pym`, heading RichTextNode `ylWnmXl4L`
Description: The second section heading on the detail page is the hardcoded literal "About The Service". It doesn't reference the current service's name (e.g., "About Dental & Oral Health" or "About End of Life Care"). The hero Title already shows the service name, so this isn't strictly necessary, but personalizing the heading would reinforce context for visitors scrolling past the hero and would add keyword relevance for SEO. The heading is also somewhat generic — "About The Service" reads as boilerplate.
Evidence: - `serialize` of `ylWnmXl4L` depth 2: child `v:ylWnmXl4L:0` `attributes.tag: "h2"`, child TextRun `v:ylWnmXl4L:0:0` `attributes.text: "About The Service"`, `bold: true`. No `var(--variable-...)` binding.
Recommended Fix: Either (a) leave as-is if the design intent is a generic section title; OR (b) replace with a templated heading like "About {{Title}}" using a RichTextNode with two TextRuns (literal "About " + `var(--variable-rcONKAEdm)`). Option (b) adds per-service keyword relevance.
Confidence: High
Discovered by: sub-agent 2, session TV

--- (originally TV-2-20)

---

## TV-48 — FAQ section uses 300px gap between heading and content (overlarge / arbitrary)
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/services/:Services` page, FAQ section `kqOSYdiNZ`
Description: The FAQ section frame has `gap: "300px"` — a hardcoded 300-pixel horizontal gap between the "FAQ" heading and the FAQ content RichTextNode. 300px is unusually large for a section heading gap; the rest of the page uses 12-32px gaps. The result is the FAQ content sits far to the right of the heading, leaving a large empty band that may cause horizontal overflow on narrower viewports.
Evidence: - `serialize` of `kqOSYdiNZ` depth 0: `attributes.gap: "300px"`, `stackDirection: "horizontal"`, `stackDistribution: "start"`.
- Screenshot of FAQ section: https://framerusercontent.com/screenshots/on-demand/3f4771a8-5d8e-46d6-a73d-a597a1ffdcd1.jpg
Recommended Fix: Reduce the gap to a more typical value (e.g., 48px or 64px). Or, if the intent is to push the FAQ content to the right column, use `stackDistribution: "space-between"` with a max-width on the heading instead of a hardcoded gap.
Confidence: High
Discovered by: sub-agent 2, session TV (originally TV-2-21)

---

## TV-49 — "Auther Name" CMS field typo propagates through Blog Card and Blog Meta components
Status: Open
Category: CMS
Severity: Medium
Location: Blog collection (`b8Kw9KXWB`) field `Auther Name` (variable id `v365QHZYL`); Blog Card component (`EiCUZ0sVC`) variable `Auther Name` (id `MTPxuL7ef`, control key `$control__autherName`); Blog Meta component (`GF64_og83`) variable `Auther Name` (id `SOgehvcfj`, control key `$control__autherName`).
Description: The Blog CMS collection has a string field named "Auther Name" — a typo for "Author Name". This typo propagates downstream: (a) the Blog Card component declares its own variable also named "Auther Name" with control key `$control__autherName` (snake_case `auther_name`), and (b) the Blog Meta component (used inside Blog Card to render author/date/read-time) also declares "Auther Name" with the same control key. The typo is not user-visible (no UI label says "Auther Name" to visitors), but it is a structural code-quality and maintenance hazard — any future editor, search, or script that looks for `authorName` / `author_name` will miss this field.
Evidence: - `framer.agent.serialize({id:"b8Kw9KXWB",depth:1})` → Blog collection variables include `{id:"v365QHZYL", name:"Auther Name", type:"string"}`.
- `framer.agent.serialize({id:"GF64_og83",depth:4})` → Blog Meta component variables include `{key:"$control__autherName", id:"SOgehvcfj", name:"Auther Name", type:"string", initialValue:"Dr Alex"}`.
- `framer.agent.serialize({id:"EiCUZ0sVC",depth:3})` → Blog Card variables include `{key:"$control__autherName", id:"MTPxuL7ef", name:"Auther Name", type:"string"}`.
- Listing-page Blog Card instance (`GpejBy_lr`, `i8eg98N9a`) attributes include `"$control__autherName": "var(--variable-v365QHZYL)"`.
Recommended Fix: Rename the Blog collection field `Auther Name` → `Author Name` via the Framer CMS editor. After rename, update the Blog Card and Blog Meta component variable names from `Auther Name` → `Author Name` (their control keys will auto-update to `$control__authorName`). The CMS variable IDs (`v365QHZYL`, `MTPxuL7ef`, `SOgehvcfj`) and the variable references `var(--variable-v365QHZYL)` will remain valid (Framer tracks by ID, not name), so no re-binding is needed on the canvas.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-1)

---

## TV-50 — "Load More" button on /blog is non-functional — click does nothing
Status: Open
Category: Components (native + code)
Severity: Critical
Location: `/blog` page, Articles collection list `KekS47E7A` (Desktop breakpoint `THfUzjZ9W`); Load More component instance `buWHHBQsM` (component `sMRugCuTF`); WebPage variable `Visible Articles` (`ACje_oFEj`).
Description: The Articles section on `/blog` displays a "Load More" button below the 2×2 grid. Clicking the button does nothing. Three compounding problems:
1. The Articles collection list (`KekS47E7A`) has `collectionList.paginationPageSize = "4"` but NO `collectionList.pagination` field set (e.g., `"infinite-scroll"` or `"pagination"`). Per Framer's CMS Collection Lists docs, `collectionList.pagination` must be explicitly set to enable pagination/load-more behavior. With only `paginationPageSize`, the list shows 4 items with no built-in mechanism to load more.
2. The Load More component (`sMRugCuTF`) defines a `Click` EventHandler variable (`Wld3NDzSj`) and its Default variant's `onTap` triggers `TRIGGER_EVENT` for `var(--variable-Wld3NDzSj)`. But the instance on `/blog` (`buWHHBQsM`) sets ONLY `$control__variant="Default"` and position/visibility attributes — it does NOT bind any action to the `Click` EventHandler. So the trigger fires into the void.
3. The page declares a WebPage variable `Visible Articles` (`ACje_oFEj`, initialValue=4, queryParam="visible-articles") — clearly intended to drive the visible count — but it is referenced nowhere on the page (not in the collection list `paginationPageSize`, not in any filter, not in any UI control). It is dead config.
Evidence: - `serialize({id:"KekS47E7A"})` → `collectionList: {collection:"Blog", repeatedDescendantId:"KeY61OV0u", sorting:[{variable:"Q5oytgpyz", direction:"desc"}], filters:[{variableId:"UJQFDqWfn", transforms:[{name:"equals", value:false}]}], filtersOperator:"and", paginationPageSize:"4"}` — note absence of `pagination` key.
- `serialize({id:"buWHHBQsM",depth:3})` → instance attributes are only `{$control__variant:"Default", position:"absolute", bottom:"0px", centerAnchorX:"50%", visible:{from:"var(--variable-ACje_oFEj)", transforms:[{name:"lessThan", value:1000}]}}`. No `$control__onClick` key.
- `serialize({id:"sMRugCuTF",depth:4})` → Load More component Default variant has `onTap:[{action:"TRIGGER_EVENT", controls:{id:"var(--variable-Wld3NDzSj)"}}]` and exposes variable `{key:"$control__onClick", id:"Wld3NDzSj", name:"Click", type:"eventhandler"}`.
- `getDescendantsOfTypes({id:"THfUzjZ9W", types:["FrameNode","ComponentInstanceNode","RichTextNode"]})` filtered for `onClick|onTap|$control__onClick` returns 0 nodes — no event handlers anywhere on `/blog`.
- Screenshot of Articles grid: `https://framerusercontent.com/screenshots/on-demand/b90b9dd4-bb20-41f3-87dd-ce815ea452bd.jpg` (saved locally as `/home/z/my-project/screenshots/blog-articles-grid.jpg`). VLM analysis confirms "Load More" button is visible but clicking does nothing (no JS action bound).
Recommended Fix: Either (a) remove the Load More button and the unused `Visible Articles` / `Featured` WebPage variables, and increase `paginationPageSize` to a value ≥ total eligible items (8) so all articles render; OR (b) properly wire pagination: set `collectionList.pagination="infinite-scroll"` on `KekS47E7A` (Framer will then handle load-more natively when the Load More button is configured as the pagination trigger), and remove the unused `Visible Articles` WebPage variable; OR (c) bind the Load More instance's `$control__onClick` to an action that increments `Visible Articles` (e.g., `+4`) and bind `collectionList.paginationPageSize` to `var(--variable-ACje_oFEj)` so the visible count is variable-driven.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-2)

---

## TV-51 — "Auther Name" field is unset on 5 of 10 Blog items, but initialValue fallback "Dr Alex" masks the gap — all 10 items display "Dr Alex" as author
Status: Open
Category: CMS
Severity: High
Location: Blog collection (`b8Kw9KXWB`), `Auther Name` variable (`v365QHZYL`); items `yAIJE8XUH`, `x1V0Oc2_f`, `G9FHqACps`, `jkZHK6dS7`, `Z7MSbSKtU` are missing `$control__auther_name`.
Description: The Blog collection's `Auther Name` variable has `initialValue: "Dr Alex"`. Five of ten items have no `$control__auther_name` attribute set in the CMS, but because of the initialValue fallback, every single Blog Card on the listing page and the meta row on the detail page displays "Dr Alex" as the author. Visitors cannot tell which posts were actually authored by "Dr Alex" vs. which have no author set. This is misleading attribution for a veterinary advice site where author credibility matters.
Evidence: - `getNode({id:"b8Kw9KXWB"})` → variable `v365QHZYL` has `initialValue: "Dr Alex"`.
- `serializeNodes({ids:["yAIJE8XUH","x1V0Oc2_f","jajVoZZTr","G9FHqACps","WZtPeuwD2","jkZHK6dS7","sL2m8UplP","NGQN6X7p3","FF07FUpZm","Z7MSbSKtU"], depth:2, attributeFilter:["$control__title","$control__auther_name"]})`:
  - Items WITH auther_name set (5): `jajVoZZTr="Dr Alex"`, `WZtPeuwD2="Dr Alex"`, `sL2m8UplP="Dr Alex"`, `NGQN6X7p3="Dr Alex"`, `FF07FUpZm="Dr Alex"` — all the same value.
  - Items WITHOUT auther_name set (5): `yAIJE8XUH`, `x1V0Oc2_f`, `G9FHqACps`, `jkZHK6dS7`, `Z7MSbSKtU`.
- VLM analysis of `/blog` Articles grid screenshot (`/home/z/my-project/screenshots/blog-articles-grid.jpg`): all 4 visible cards display author "Dr Alex" — including cards for `x1V0Oc2_f` (First Aid Basics), `G9FHqACps` (Keep Them Moving), and `jkZHK6dS7` (Grieving a Pet), none of which have `auther_name` set in the CMS.
- VLM analysis of Featured Articles screenshot (`/home/z/my-project/screenshots/blog-featured-articles.jpg`): Card 1 (Parasite Prevention, item `yAIJE8XUH`, no auther_name set) displays "Dr. Alex".
Recommended Fix: (a) Set the `Auther Name` variable's `initialValue` to empty string `""` (or remove it entirely) so unset items show no author rather than a fake one. (b) Audit each of the 5 items missing auther_name and either set the real author or leave the field empty (and adjust the Blog Card / Blog Meta components to gracefully hide the author slot when empty). (c) Consider whether all posts really are authored by "Dr Alex" — if so, set the field explicitly on all 10 items; if not, set the correct authors.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-3)

---

## TV-52 — Articles grid forces 2 columns on Phone breakpoint — cards unreadable, titles break mid-word
Status: Open
Category: Visual design & branding
Severity: High
Location: `/blog` page, Articles collection list `KekS47E7A` (Phone breakpoint `oKC1nohe6`, Tablet `fpXa25z8y`, Desktop `THfUzjZ9W`); instance attributes inherited from Desktop.
Description: The Articles grid has `gridColumnCount: 2` and `gridColumnMinWidth: "50px"` on ALL three breakpoints (Desktop, Tablet, Phone). On Phone (390px viewport, Main maxWidth=500px but viewport-constrained to 390px), each card is only ~183px wide. VLM analysis of the Phone screenshot confirms severe readability problems: card titles break mid-word (e.g., "Pet Vaccine s, Safe and Loving"), descriptions truncate to a few words ("Learn the...", "Discover...", "A clear...", "A..."), and the narrow portrait image forces awkward text wrapping. The grid should collapse to 1 column on Phone (and probably Tablet too) to give each card enough horizontal room.
Evidence: - `serialize({id:"oKC1nohe6KekS47E7A"})` (Phone Articles grid) → `layout:"grid", gridColumnCount:"2", gridColumnMinWidth:"50px"`.
- `serialize({id:"fpXa25z8yKekS47E7A"})` (Tablet Articles grid) → same: `gridColumnCount:"2", gridColumnMinWidth:"50px"`.
- `serialize({id:"KekS47E7A"})` (Desktop Articles grid) → same: `gridColumnCount:"2", gridColumnMinWidth:"50px"`.
- Phone Blog Card instance (`oKC1nohe6i8eg98N9a`) → `width:"1fr", height:"400px", $control__variant:"horizontal Small"`.
- VLM analysis of `/home/z/my-project/screenshots/blog-listing-phone.jpg`: "cards are very tall and narrow (portrait orientation), which forces the text to be squeezed into a small space next to them... titles are broken up awkwardly due to the narrow width (e.g., 'Pet Vaccine s, Safe and Loving'). The descriptions are heavily truncated to just a few words."
Recommended Fix: Override `gridColumnCount` to `1` on the Phone breakpoint (and consider `1` on Tablet too, since 2 columns at 768–1279px is also tight). Alternatively, set `gridColumnMinWidth` to a more reasonable value like `280px` so the grid auto-collapses to 1 column when viewport can't fit 2 columns × 280px. Also revisit the variant choice `horizontal Small` for Phone — at 1 column the card would be ~390px wide × 400px tall, which may still look cramped; consider switching Phone to the `Default` vertical variant.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-4)

---

## TV-53 — Detail page banner image has no alt text — image rendered as CSS background, screen readers ignore it
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `/blog/:Blog` detail page, Desktop breakpoint `lBjdH_FvV`, Banner node `xVowaYVnA`. Same pattern likely on Tablet (`qsEHmkm3_`) and Phone (`Cy4mEynEA`) breakpoints.
Description: The Blog detail page renders the article's hero image as a CSS background fill on a `FrameNode` (Banner, `xVowaYVnA`) using `fill: "var(--variable-kZ3Cwfwri)"` (the CMS Image variable). Because Framer emits this as a `background-image` on a `<div>` rather than an `<img>` tag, the image's `alt` text from the CMS is silently dropped. Screen readers will not announce the image. The CMS Image field DOES have meaningful alt text on every item (e.g., for `yAIJE8XUH`: "A veterinarian in a blue uniform, smiling, applies treatment to a [golden retriever]..."), so the alt text exists but is unused on the detail page. By contrast, the Blog Card on the listing page correctly uses the image as a fill too — but cards are arguably decorative links to the article, while the detail-page banner is the article's primary hero image and should be accessible.
Evidence: - `serialize({id:"xVowaYVnA"},{pagePath:"/blog/:Blog"})` → Banner attributes: `{border:"6px solid var(--token-219c2d29...)", fill:"var(--variable-kZ3Cwfwri)", layout:"null", position:"relative", radius:"40px", width:"1fr", height:"560px", squircle:"65%"}`. No `alt` attribute, no child `<img>` node.
- Blog item `yAIJE8XUH` `$control__image` = `{src:"https://framerusercontent.com/images/49UR3O3rDk7n08herhyylAbrGM.png", alt:"A veterinarian in a blue uniform, smiling, applies treatment to a ..."}` — alt text exists but is not consumed by the Banner node.
- VLM analysis of `/home/z/my-project/screenshots/blog-detail-desktop.jpg` confirms a large hero image is shown but does not appear to have alt-text semantics.
Recommended Fix: Either (a) replace the Banner FrameNode with an Image node (`+ImageNode`) that binds both `src` and `alt` to the CMS Image variable, preserving the visual border/radius/squircle styling; OR (b) keep the FrameNode banner but add a visually-hidden `aria-label` or `role="img"` attribute bound to the image's alt text; OR (c) if the image is intentionally decorative (because the adjacent Title + SubHeading describe the article), add `aria-hidden="true"` to the Banner so screen readers skip it deliberately. Option (a) is preferred — the alt text already exists in the CMS and should be used.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-5)

---

## TV-54 — Detail page meta row: first RichTextNode is named "Published Date" but actually displays the Author Name (misleading internal name)
Status: Open
Category: Components (native + code)
Severity: Low
Location: `/blog/:Blog` detail page, Desktop breakpoint `lBjdH_FvV`, RichTextNode `jlkWuBAtS` (inside `JK7kevfJC`).
Description: On the Blog detail page, the meta row above the article title contains two RichTextNodes side-by-side: the first is internally named "Published Date" (node `jlkWuBAtS`), but its `text` is bound to `var(--variable-v365QHZYL)` — which is the `Auther Name` CMS variable, not the `Published Date` variable (`Q5oytgpyz`). The second RichTextNode (`DibSNZ04T`), also named "Published Date", actually displays the Published Date via `var(--variable-Q5oytgpyz)` with a `toDateString` transform. The rendered output is correct (Author Name appears left, Published Date appears right), but the internal node naming is wrong and will confuse any future editor or script that tries to find the "Published Date" node by name. There is also no visible label separating the two values — they appear as `<Author Name> <Published Date>` with a 16px gap, which could be misread as a single string.
Evidence: - `serialize({id:"JK7kevfJC",depth:4},{pagePath:"/blog/:Blog"})` → children:
  - `{type:"RichTextNode", name:"Published Date", id:"jlkWuBAtS", attributes:{text:"var(--variable-v365QHZYL)", textStylePreset:"Text S"}}` ← actually bound to Auther Name variable
  - `{type:"RichTextNode", name:"Published Date", id:"DibSNZ04T", attributes:{text:{from:"var(--variable-Q5oytgpyz)", transforms:[{name:"toDateString", dateStyle:"medium", capitalize:true}]}, textStylePreset:"Text S"}}` ← actually bound to Published Date variable
- VLM analysis of detail page screenshot confirms "Dr. Alex" and "May 2, 2026" appear side-by-side above the title.
Recommended Fix: Rename node `jlkWuBAtS` from "Published Date" → "Author Name" (or "Auther Name" to match the CMS field until TV-3-1 is fixed). Optionally insert a visible separator (e.g., "·" or "|") between Author and Date so they read as distinct values.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-6)

---

## TV-55 — Featured Articles collection list has no explicit filter for `Featured=true` — relies on implicit Framer CMS ordering
Status: Open
Category: CMS
Severity: Low
Location: `/blog` page, Featured Articles collection list `O09c72xxk` (Desktop breakpoint `THfUzjZ9W`).
Description: The Featured Articles section uses a CMS Collection List (`O09c72xxk`) with `collection:"Blog"` and `limit:"2"` but NO `filters` array and NO `sorting` array. The collection list config is literally `{collection:"Blog", repeatedDescendantId:"GpejBy_lr", limit:"2"}`. Despite this, the rendered page (verified by screenshot) shows the 2 items that have `Featured=true` set (`yAIJE8XUH` Parasite Prevention and `jajVoZZTr` Feeding Right). This appears to work because Framer's CMS implicitly surfaces Featured items first when no sort is specified — but this is undocumented implicit behavior. If the collection is ever re-sorted or Framer's default behavior changes, the Featured section could show non-featured items. An explicit filter `Featured equals true` would make the intent unambiguous and prevent regressions. Note that the Articles grid (`KekS47E7A`) DOES use an explicit filter `Featured equals false` — so the listing page is inconsistent: Articles section filters explicitly, Featured section does not.
Evidence: - `serialize({id:"O09c72xxk",attributeFilter:["collectionList"]})` → `{collection:"Blog", repeatedDescendantId:"GpejBy_lr", limit:"2"}` — no `filters`, no `sorting`.
- `serialize({id:"KekS47E7A"})` → Articles grid has `filters:[{variableId:"UJQFDqWfn", transforms:[{name:"equals", value:false}]}], sorting:[{variable:"Q5oytgpyz", direction:"desc"}]` — explicit filter and sort.
- VLM analysis of `/home/z/my-project/screenshots/blog-featured-articles.jpg` confirms the 2 visible cards are "Parasite Prevention, Year-Round Protection" (`yAIJE8XUH`, Featured=true) and "Feeding Right, Living Well: Pet Nutrition Basics" (`jajVoZZTr`, Featured=true) — the only 2 items with Featured=true.
Recommended Fix: Add an explicit filter to `O09c72xxk.collectionList.filters`: `{variableId:"UJQFDqWfn", transforms:[{name:"equals", value:true}]}` (and `filtersOperator:"and"`). Also add an explicit sort (e.g., by Published Date desc) so the Featured section has a deterministic order.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-7)

---

## TV-56 — WebPage variables `Visible Articles` and `Featured` are declared on `/blog` but never referenced anywhere
Status: Open
Category: Site settings & structure
Severity: Low
Location: `/blog` page (`OUWIjsEU8`) WebPage variables `Visible Articles` (`ACje_oFEj`, initialValue=4, queryParam="visible-articles") and `Featured` (`r7OKe55hM`, queryParam="featured").
Description: The `/blog` WebPageNode declares two WebPage variables: `Visible Articles` (number, initialValue=4) and `Featured` (boolean, unset). Both have `queryParam` set so they could be controlled via URL (`?visible-articles=8` or `?featured=true`). However, neither variable is referenced anywhere on the page — not in the Articles collection list `paginationPageSize` (which is hardcoded to "4"), not in any filter, not in any UI control. They appear to be leftover scaffolding from an incomplete "load more" or "filter by featured" implementation. The Load More button's `visible` rule does reference `var(--variable-ACje_oFEj)` (visible when < 1000) — so the variable is technically read once, but only to keep the button perpetually visible; it's never incremented. This is dead config that adds confusion.
Evidence: - `getNode({id:"OUWIjsEU8"})` → `variables: [{key:"$control__visibleArticles", id:"ACje_oFEj", name:"Visible Articles", type:"number", initialValue:4, queryParam:"visible-articles"}, {key:"$control__featured", id:"r7OKe55hM", name:"Featured", type:"boolean", queryParam:"featured"}]`.
- `serialize({id:"KekS47E7A"})` → `paginationPageSize:"4"` (literal string, not `var(--variable-ACje_oFEj)`).
- `getDescendantsOfTypes({id:"THfUzjZ9W", types:["ComponentInstanceNode"]})` filtered for any control referencing `var(--variable-ACje_oFEj)` or `var(--variable-r7OKe55hM)` → only Load More instance (`buWHHBQsM`) references `var(--variable-ACje_oFEj)` in its `visible` rule. No reference to `var(--variable-r7OKe55hM)` anywhere.
Recommended Fix: Either wire these variables into a real filtering/pagination UX (e.g., add a category dropdown that sets `Featured`, bind `paginationPageSize` to `var(--variable-ACje_oFEj)`, and bind Load More's onClick to increment `ACje_oFEj`), OR delete both variables to clean up the page config.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-8)

---

## TV-57 — Blog item `Z7MSbSKtU`: title and slug mismatch; title is awkwardly phrased; article_type unset
Status: Open
Category: CMS
Severity: Low
Location: Blog collection item `Z7MSbSKtU`.
Description: Three related data-quality issues on the "10 Essential Tips" article:
1. **Title/slug mismatch**: The Title is "10 Essential Tips for a Healthy Golden Years" but the Slug is `10-essential-tips-for-a-happy-healthy-golden-years`. The slug includes "happy-healthy" but the title only says "Healthy". The slug likely reflects an older version of the title ("10 Essential Tips for a Happy, Healthy Golden Years") that was edited without updating the slug, or vice versa.
2. **Awkward title phrasing**: "10 Essential Tips for a Healthy Golden Years" is grammatically awkward — "a Healthy Golden Years" mixes singular article "a" with plural "Years". The slug's "happy-healthy" suggests the intended title was "10 Essential Tips for Happy, Healthy Golden Years".
3. **article_type is unset**: The `Article type` field is missing on this item. It would fall back to the variable's `initialValue: "Wellness"`, so the card badge would show "Wellness". But the article's description ("A practical senior dog care guide with clear veterinary tips for comfort, mobility, nutrition, prevention, and quality of life.") and topic are clearly senior-care. The badge should show "Senior Care".
Evidence: - `serializeNodes({ids:["Z7MSbSKtU"], depth:2, attributeFilter:["$control__title","$control__slug","$control__article_type","$control__description"]})` → `title:"10 Essential Tips for a Healthy Golden Years"`, `slug:"10-essential-tips-for-a-happy-healthy-golden-years"`, `article_type: undefined`, `description:"A practical senior dog care guide with clear veterinary tips for comfort, mobility, nutrition, prevention, and quality of life."`.
Recommended Fix: (a) Update the Title to "10 Essential Tips for Happy, Healthy Golden Years" (matching the slug intent) or update the Slug to match the current title. (b) Set the `Article type` field to "Senior Care" so the category badge correctly reflects the topic.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-10)

---

## TV-58 — Detail page banner has 6px solid white border — unusual visual treatment, may not be intentional
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/blog/:Blog` detail page, Desktop breakpoint `lBjdH_FvV`, Banner node `xVowaYVnA`.
Description: The article banner image is wrapped in a FrameNode with `border: "6px solid var(--token-219c2d29-...)"` — a 6px solid border in the "White" color token. Combined with `radius: 40px` and `squircle: 65%`, this creates a thick white picture-frame effect around the hero image. The 6px white border is an unusual visual choice — it's heavier than a typical 1px hairline border and lighter than a polaroid-style frame. It may be intentional (matching a design spec) or may be a leftover from experimentation. Worth verifying against the design spec.
Evidence: - `serialize({id:"xVowaYVnA"},{pagePath:"/blog/:Blog"})` → `attributes: {border:"6px solid var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)", fill:"var(--variable-kZ3Cwfwri)", radius:"40px", squircle:"65%", width:"1fr", height:"560px"}`.
- Token `219c2d29-...` resolves to White (`rgb(255,255,255)`) per project inventory.
- VLM analysis of detail screenshot confirms a visible white frame around the hero image.
Recommended Fix: Verify against the design spec. If unintentional, remove the border or reduce to `1px solid var(--token-...)`. If intentional, document the design decision.
Confidence: Medium
Discovered by: sub-agent 3, session TV

--- (originally TV-3-11)

---

## TV-59 — Blog pages DO have SEO metadata set — contradicts orchestrator's "all pages return seoTitle:null" note
Status: Open
Category: SEO & metadata
Severity: Low (informational — flags a discrepancy for sub-agent 7 to reconcile)
Location: `/blog` page (`OUWIjsEU8`) `attributes.metadata`; `/blog/:Blog` detail page (`DvEqpc9aQ`) `attributes.metadata`.
Description: The orchestrator's worklog.md states "Every page returned `seoTitle: null` and `indexingType: null` in the initial read." However, the Blog pages DO have SEO metadata set:
- `/blog` (listing): `metadata.title = "Pet Health Blog | Veterinary Tips & Advice | Vetly"`, `metadata.description = "Discover expert pet care advice from Vetly's veterinarians. Read our blog for wellness tips, vaccination guides, dental care, and more to keep your dog or cat healthy and happy."`, `metadata.noIndexSite = false`.
- `/blog/:Blog` (detail): `metadata.title = "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"` (CMS-interpolated), `metadata.description = "{{Description}}"` (CMS-interpolated), `metadata.socialImage = "var(--variable-kZ3Cwfwri)"` (CMS Image field).
This is informational — the Blog pages are well-optimized for SEO. Sub-agent 7 (SEO site-wide) should re-verify whether the orchestrator's note applies only to certain pages or if the initial read missed these values.
Evidence: - `getNode({id:"OUWIjsEU8"})` → `attributes.metadata: {title:"Pet Health Blog | Veterinary Tips & Advice | Vetly", description:"Discover expert pet care advice...", noIndexSite:false}`.
- `getNode({id:"DvEqpc9aQ"})` → `attributes.metadata: {title:"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet", description:"{{Description}}", socialImage:"var(--variable-kZ3Cwfwri)"}`.
Recommended Fix: None for the Blog pages — they're correctly configured. Sub-agent 7 should reconcile this with the orchestrator's site-wide note and confirm whether other pages really are missing metadata.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-12)

---

## TV-60 — Phone breakpoint: Featured Articles card uses `horizontal Small` variant — description and read time visually truncated
Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/blog` page, Phone breakpoint `oKC1nohe6`, Featured Articles Blog Card instance `oKC1nohe6GpejBy_lr` (replica of Desktop `GpejBy_lr`).
Description: On Phone, the Featured Articles Blog Card overrides the Desktop variant `horizontal Big` with `horizontal Small` and sets height to 400px (down from auto on Desktop). The `horizontal Small` variant was designed for a 600×200px card (per component defaults); at Phone's ~390×400px (1fr width × 400px height), the layout is cramped. VLM analysis of the Phone screenshot confirms visible truncation: the description text is cut off mid-word ("Protect your pet year-roun...") and the read time is truncated ("5 min rea..."). The variant switch was likely an attempt to make the card mobile-friendly, but the `horizontal Small` variant's text container is too narrow at Phone width.
Evidence: - `serialize({id:"oKC1nohe6GpejBy_lr",depth:2})` → `width:"1fr", height:"400px", $control__variant:"horizontal Small", $control__padding:"20px"`.
- Desktop Featured Blog Card instance `GpejBy_lr` → `$control__variant:"horizontal Big"`.
- VLM analysis of `/home/z/my-project/screenshots/blog-listing-phone.jpg`: "In the Featured section, the descriptions (e.g., 'Protect your pet year-roun...') and the reading time ('5 min rea...') are cut off."
Recommended Fix: Either (a) switch Phone Featured cards to the `Default` vertical variant (image on top, content below) which gives the text full viewport width; OR (b) keep `horizontal Small` but reduce the image width and let the text column take more horizontal space; OR (c) keep the variant but remove the fixed 400px height and let it auto-size to fit content. Verify by re-screenshotting the Phone breakpoint after any change.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-13)

---

## TV-61 — "Featured" field is unset on 7 of 10 Blog items — initialValue=false fallback masks the gap
Status: Open
Category: CMS
Severity: Low
Location: Blog collection (`b8Kw9KXWB`), `Featured` variable (`UJQFDqWfn`); items `x1V0Oc2_f`, `G9FHqACps`, `WZtPeuwD2`, `jkZHK6dS7`, `sL2m8UplP`, `NGQN6X7p3`, `FF07FUpZm` are missing `$control__featured`.
Description: Only 3 of 10 Blog items have the `Featured` boolean explicitly set: `yAIJE8XUH=true`, `jajVoZZTr=true`, `Z7MSbSKtU=false`. The other 7 items have no `$control__featured` attribute. Because the `Featured` variable has `initialValue: false`, these 7 items are treated as `Featured=false` (which is why the Articles grid filter `equals(false)` correctly includes them). This is functionally OK — the rendered page shows the right items in the right sections — but it's a data-quality inconsistency. Editors looking at the CMS UI may not realize that 7 items have an unset boolean rather than an explicit `false`. If Framer's behavior ever changes (or the data is exported), the unset values could surface differently.
Evidence: - `getNode({id:"b8Kw9KXWB"})` → `Featured` variable `UJQFDqWfn` has `initialValue: false`.
- `serializeNodes({ids:[all 10], depth:2, attributeFilter:["$control__title","$control__featured"]})`:
  - Items WITH featured set (3): `yAIJE8XUH=true`, `jajVoZZTr=true`, `Z7MSbSKtU=false`.
  - Items WITHOUT featured set (7): `x1V0Oc2_f`, `G9FHqACps`, `WZtPeuwD2`, `jkZHK6dS7`, `sL2m8UplP`, `NGQN6X7p3`, `FF07FUpZm`.
Recommended Fix: Open each of the 7 unset items in the CMS editor and explicitly set `Featured` to `false` (or `true` if any should be featured). This makes the data explicit and avoids relying on initialValue fallback.
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-14)

---

## TV-62 — Articles grid wraps each Blog Card in a redundant horizontal Stack — extra DOM layer
Status: Open
Category: Performance & technical
Severity: Low
Location: `/blog` page, Articles collection list `KekS47E7A`, repeated descendant template `KeY61OV0u`.
Description: The Articles grid's repeated descendant is a FrameNode (`KeY61OV0u`) with `layout: stack, stackDirection: horizontal, stackDistribution: start, stackAlignment: center, gap: 10px`, width=1fr, height=auto. This horizontal stack has exactly ONE child — the Blog Card ComponentInstance (`i8eg98N9a`). So the structure is: grid cell → horizontal stack → Blog Card. The horizontal stack is redundant — it wraps a single child, adding an extra DOM layer with no layout purpose. It also introduces a 10px gap that has no effect (no second child to gap against) but could mislead editors. Compare to the Featured Articles collection list, where the repeated descendant is the Blog Card directly (no wrapper).
Evidence: - `serialize({id:"KekS47E7A",depth:6})` → children: `[{type:"FrameNode", id:"KeY61OV0u", attributes:{layout:"stack", stackDirection:"horizontal", gap:"10px", width:"1fr", height:"auto"}, children:[{type:"ComponentInstanceNode", id:"i8eg98N9a", component:"EiCUZ0sVC", attributes:{...Blog Card controls...}}]}]`.
- Featured Articles collection list `O09c72xxk` → repeated descendant `GpejBy_lr` is the Blog Card directly (no wrapper FrameNode).
Recommended Fix: Either (a) remove the wrapper `KeY61OV0u` and set `repeatedDescendantId` to `i8eg98N9a` directly, OR (b) document why the wrapper exists (e.g., as a placeholder for a future secondary action like a "Save" button alongside the card).
Confidence: High
Discovered by: sub-agent 3, session TV

--- (originally TV-3-15)

---

## TV-63 — Blog Card "openInNewTab: true" on component default link — internal navigation opens in new tab
Status: Open
Category: UX & conversion
Severity: Low
Location: Blog Card component (`EiCUZ0sVC`), Default variant `OSZXw3DUH` (and all other variants), `link` attribute; instance overrides on `/blog` page (`GpejBy_lr`, `i8eg98N9a`).
Description: The Blog Card component's Default variant sets `link: {href: "var(--variable-q4ecqPYbc)", openInNewTab: true, smoothScroll: true}` on the variant's root FrameNode. This means clicking a Blog Card opens the detail page in a NEW TAB by default. On the `/blog` listing page, the instance overrides only set `href` and `collectionItem` (e.g., `$control__link: {href:"/blog/:slug#main", collectionItem:"var(--variable-CJvDdRtwN)"}`) — they do NOT override `openInNewTab`, so it inherits `true` from the component. Opening internal site links in a new tab is generally poor UX: it breaks the back button, clutters tabs, and is disorienting. The `openInNewTab: true` default makes sense for EXTERNAL links but not for internal navigation within the same site. (Caveat: I could not visually verify this from the screenshot — VLM doesn't simulate clicks. The finding is based on the serialized `link` attributes. A fix-mode agent should test on the live preview to confirm before changing.)
Evidence: - `serialize({id:"OSZXw3DUH"})` → Default variant root attributes: `link: {href:"var(--variable-q4ecqPYbc)", openInNewTab:true, smoothScroll:true}`.
- All other variants (`BU9VdIEbd`, `k8p5fPamx`, `ZN8y56CSQ`) inherit the same `openInNewTab: true`.
- Instance attributes for `GpejBy_lr` and `i8eg98N9a`: `$control__link: {href:"/blog/:slug#main", collectionItem:"var(--variable-CJvDdRtwN)"}` — no `openInNewTab` override.
Recommended Fix: Either (a) change the Blog Card component's Default variant `link.openInNewTab` from `true` to `false` (preferred — internal links shouldn't open new tabs); OR (b) explicitly set `openInNewTab: false` on each instance's `$control__link` override. Verify by clicking a Blog Card on the live preview and confirming the detail page opens in the same tab.
Confidence: Medium (serialized evidence is clear, but live click behavior not verified)
Discovered by: sub-agent 3, session TV

--- (originally TV-3-16)

---

## TV-64 — Articles grid Blog Card has fixed height 550px — content may overflow or leave large empty space
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/blog` page, Desktop Articles grid Blog Card instance `i8eg98N9a`.
Description: The Articles grid Blog Card instance has `height: "550px"` (fixed) on Desktop. The card content includes: image (1fr height), title (Heading 5), Blog Meta (author/date/read time), and a category badge. The Blog Card's Default variant was designed for `width: 400px, height: 450px`. Forcing it to 550px tall means the image takes more vertical space, but if a title is short or a description is hidden (`descVisible: false` on this instance), there may be excessive empty space at the bottom of the card. Conversely, if a title is long (e.g., "Signs Your Pet Is Sick, Know Them Early"), it might wrap to multiple lines and crowd the meta row. A fixed height makes the grid look uniform but doesn't adapt to content length.
Evidence: - `serialize({id:"i8eg98N9a"})` → `width:"1fr", height:"550px", $control__variant:"Default", $control__descVisible:"false"`.
- VLM analysis of `/home/z/my-project/screenshots/blog-articles-grid.jpg`: cards appear uniform in height; no visible overflow, but the bottom of each card has visible whitespace below the badge (consistent with fixed height + content not filling it).
Recommended Fix: Consider switching to `height: "auto"` (with `width: 1fr`) so cards size to their content. If visual uniformity is desired, keep the fixed height but verify across all 8 eligible items (not just the 4 currently visible) that no title/meta overflow occurs.
Confidence: Medium
Discovered by: sub-agent 3, session TV

--- (originally TV-3-17)

---

## TV-65 — Phone breakpoint: Articles grid pagination and Load More button layout unverified on Phone
Status: Open
Category: UX & conversion
Severity: Low
Location: `/blog` page, Phone breakpoint `oKC1nohe6`, Load More instance `oKC1nohe6buWHHBQsM` (replica of `buWHHBQsM`).
Description: The Load More button on Desktop is positioned `absolute, bottom: 0px, centerAnchorX: 50%` inside the Articles collection list (which has 80px bottom padding to make room). On Phone, the same absolute positioning applies (inherited via replica). Combined with the 2-column grid (TV-3-4) and the cramped card layout, the Load More button may overlap card content or sit awkwardly on Phone. Since the Load More button is non-functional anyway (TV-3-2), this is a compound issue — the button takes up space and looks clickable but does nothing. VLM analysis of the Phone screenshot confirms the Load More button is visible but does not address its positioning relative to the grid.
Evidence: - Phone Articles grid (`oKC1nohe6KekS47E7A`) inherits Desktop's `padding: "0px 0px 80px 0px"` and grid settings.
- Load More instance `buWHHBQsM` (Desktop) → `position:"absolute", bottom:"0px", centerAnchorX:"50%"`.
- VLM analysis of `/home/z/my-project/screenshots/blog-listing-phone.jpg` confirms Load More button is visible below the grid on Phone.
Recommended Fix: Resolve TV-3-2 first (fix or remove Load More). If Load More is kept, verify its absolute positioning works correctly at Phone width — may need to switch to relative positioning or adjust the grid's bottom padding.
Confidence: Medium
Discovered by: sub-agent 3, session TV (originally TV-3-18)

---

## TV-66 — Duplicate team member on /about (Dr. James Reed appears twice)
Status: Open
Category: Content & copy
Severity: Critical
Location: `/about` > Main > Team section (`AVXqcuXwg`) > Team Cards grid (`tOMclTs4Y`), 3rd and 4th cards (instance IDs `gm_jYpv8v` and `AK0fZJmAw`)
Description: The /about page team section displays 4 cards. Cards 3 and 4 both have `name="Dr. James Reed"` and `job="Surgical Specialist"` — a copy-paste error. The two cards use different photo URLs (`gQ3mb3KIWWsZHFPOiFuQ2x9LSU.webp` and `PcTBm4JYn9qd4cCvhE1eOG0CW9Q.webp`), so the photos are different people, but the name/role text was not updated for the 4th card. This makes the page look unfinished and confuses visitors (appears to be the same person twice).
Evidence: - Screenshot of Team Cards: https://framerusercontent.com/screenshots/on-demand/32405490-91ba-45d4-bf28-ce5532a2c829.jpg — VLM analysis confirms "Yes, there are duplicates. The name 'Dr. James Reed' and the role 'Surgical Specialist' appear identically on both the third and fourth cards."
- Component instance `gm_jYpv8v`: `$control__name: "Dr. James Reed"`, `$control__job: "Surgical Specialist"`, `$control__image: "https://framerusercontent.com/images/gQ3mb3KIWWsZHFPOiFuQ2x9LSU.webp"`
- Component instance `AK0fZJmAw`: `$control__name: "Dr. James Reed"`, `$control__job: "Surgical Specialist"`, `$control__image: "https://framerusercontent.com/images/PcTBm4JYn9qd4cCvhE1eOG0CW9Q.webp"`
Recommended Fix: Update the 4th card (`AK0fZJmAw`) with a different name, role, and (optionally) image. If the team only has 3 members, remove the 4th card. If the team has 4 members, replace the duplicated name/role with the correct 4th team member's info.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-1)

---

## TV-67 — Stats section shows "0+" / "0%" / "0/7" because Animated Number Counter starts at 0
Status: Open
Category: Components (native + code)
Severity: High
Location: `/about` > Main > Stats section (`g352OHmnR`) > Stats Cards grid (`NQ1ZltcBD`), 4 Stat Card instances
Description: The 4 Stat Cards on /about use the Stat Card native component (`Hn1T3Ve4o`) with these configured values: `number="5000" suffix="+"` (Pets Treated), `number="98" suffix="%"` (Client Satisfaction), `number="15" suffix="+"` (Licensed Veterinarians), `number="24" suffix="/7"` (Emergency Support). Each card uses an Animated Number Counter (external component) that animates from 0 → target on scroll-into-view. However, screenshots and any pre-animation render show wrong values: full-page screenshot shows "0+", "0%", "0+", "0/7"; a card-only screenshot captured mid-animation shows "721+", "14%", "2+", "3/7" (about 14% of target — same progress for all 4 cards, indicating they share a long animation duration). Real users see the wrong number until the animation completes; screen readers may read the wrong number; SEO crawlers that don't run scroll-triggered JS will index the wrong value. Additionally, the 4th card uses `prefix=""` + `number="24"` + `suffix="/7"` as a hack to render "24/7" — fragile pattern.
Evidence: - /about desktop screenshot: https://framerusercontent.com/screenshots/on-demand/decb671d-4a9a-4c73-99c0-c5936410808f.jpg — stats area shows "0+", "0%", "0+", "0/7"
- /about mobile screenshot: https://framerusercontent.com/screenshots/on-demand/ba683ed9-c1c6-4d82-9fdf-9246d82949db.jpg — same 0+ values
- Stats Cards section screenshot: https://framerusercontent.com/screenshots/on-demand/ac1046b7-b01f-409a-bdaa-1d9662e9374a.jpg — mid-animation showing 721+, 14%, 2+, 3/7
- Stat Card config (e.g. `cxNb_XZ5I`): `"$control__number": "5000", "$control__suffix": "+"`, `appearEffect.trigger: "onInView"`
Recommended Fix: Either (a) remove the Animated Number Counter and render the static final values directly (preferred for accessibility/SEO), OR (b) ensure the code component renders the final value server-side and only animates client-side (progressive enhancement), OR (c) shorten the animation duration so users see correct values quickly. For the 4th card, replace the `number="24"` + `suffix="/7"` hack with `number="24/7"` + `suffix=""` (or change the design to display "24/7" as a literal label rather than a counted stat).
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-2)

---

## TV-68 — Layout template's "Buy Button" floating widget visible on every page, links to x.com
Status: Open
Category: Site settings & structure
Severity: Critical
Location: Layout template `yDIYoKc7h` > Desktop breakpoint `f7pXm5YjB` (and Tablet `D1wW0y55a`, Phone `wngbi8Un2`) > Buy Button component instance `aqBIOKUF4` (component ID `sfrLnUdBr`, display name "Buy Button")
Description: The shared Layout template includes a `Buy Button` component instance (`aqBIOKUF4`) positioned `fixed` at `right: 20px, bottom: 70px` (desktop) with `zIndex: 10`. It renders an image (`https://framerusercontent.com/images/fm2cvVCqujlMPcHRgN6Vkir3kvA.png` — a "Buy this template for $X" badge) and links to `https://x.com/` (Twitter homepage, NOT a real purchase page). The image alt text is empty (`alt: ""`). Because every page on the site uses the Layout template, this floating widget is visible on every page (desktop, tablet, mobile), including customer-facing pages like /about, /booking, /contact. On mobile it can overlap with content (e.g., on /documentation mobile, the VLM observed the badge overlapping the "Edited Directly on the Page" text block). This is a template-demo artifact that must be removed or hidden before the site goes live — it makes the site look unfinished and sends visitors to a broken purchase link.
Evidence: - /about desktop screenshot: https://framerusercontent.com/screenshots/on-demand/decb671d-4a9a-4c73-99c0-c5936410808f.jpg — VLM noted "Floating Element: There is a small floating badge on the right edge of the image that says 'Vetly' with some small text underneath it."
- /documentation desktop screenshot: https://framerusercontent.com/screenshots/on-demand/57181a71-3700-44b4-8fe3-2d24c9734e46.jpg — VLM noted "Floating Widget: There is a small blue floating widget on the right edge of the screen (looks like a preview or 'Buy Template' badge for $32)"
- /documentation mobile screenshot: https://framerusercontent.com/screenshots/on-demand/4516f58a-7ba0-4c7d-a22a-18c7c56de5d3.jpg — VLM noted overlap with content: "the floating 'Vetly' price badge near the top that overlaps with the 'Edited Directly on the Page' text block"
- Layout template serialize: `aqBIOKUF4` ComponentInstanceNode with `component: "sfrLnUdBr"`, `$componentDisplayName: "Buy Button"`, `position: "fixed"`, `$control__link: "https://x.com/"`, `$control__image: { src: "...", alt: "" }`
Recommended Fix: Set `visible="false"` on the Buy Button instance in the Layout template (or delete it entirely from the Layout template). This will hide it on every page that uses the Layout. Before going live, also remove any other template-demo artifacts.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-3)

---

## TV-69 — /brand-guide displays WRONG Primary color value
Status: Open
Category: Visual design & branding
Severity: High
Location: `/brand-guide` > Colors section (`aldAPAq6t`) > Primary Colors grid (`SOXXmKxpH`) > Primary swatch (`zd9ovryvX`)
Description: The Primary color swatch on /brand-guide shows the label "rgb(0, 153, 255)" — but the actual Primary color style token (`8d76f153-6a21-4584-a490-7ac9adb914b2`) is `rgb(0, 144, 255)` (per `getColorStyles()`). The swatch's fill correctly uses the token (so it renders the right color), but the displayed rgb text is wrong by 9 in the green channel (153 vs 144). A designer or developer using this brand guide as a reference would copy the wrong hex value (`#0099FF` instead of the correct `#0090FF`). The other 4 primary colors (Secondary, Text, Black, White) display correct rgb values matching their tokens.
Evidence: - Brand-guide text node `HUkefqFpu`: `text: "rgb(0, 153, 255)"` (the displayed value)
- Brand-guide swatch `G9NxtM2ZU` (frame containing the Primary color): `fill: "var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2)"` (the actual token)
- exploration.json colorStyles: `Primary` token `8d76f153-...` has `light: "rgb(0, 144, 255)"`
- /brand-guide desktop screenshot: https://framerusercontent.com/screenshots/on-demand/d7058d55-8a7c-4826-b592-de49721356d2.jpg — VLM read the displayed value as `#0099FF` (= rgb(0, 153, 255)), confirming the visible mismatch
Recommended Fix: Update text node `HUkefqFpu` from `text: "rgb(0, 153, 255)"` to `text: "rgb(0, 144, 255)"` to match the actual Primary color token value.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-4)

---

## TV-70 — /brand-guide Typography description incorrectly claims "Inter is used throughout"
Status: Open
Category: Content & copy
Severity: High
Location: `/brand-guide` > Typography section (`XXXavhSBZ`) > description text node `YKEw6jWDW`
Description: The brand guide's Typography description reads: "Inter is used throughout for a clean, trustworthy feel. Headings step down from Heading 1 to Heading 6; body copy uses Text XS through Text XL depending on emphasis." This is factually incorrect. Per `getTextStyles()`, the project's 12 text styles use TWO fonts: Manrope for all 6 heading styles (Heading 1, Heading 2, Heading 2s, Heading 3, Heading 4, Heading 5, Heading 6) and Inter for the 5 body text styles (Text XS, S, M, L, XL). The brand guide's own typography specimens correctly apply Manrope via the Heading 1-6 text style presets — but the description text omits Manrope entirely. A user reading the brand guide would think only Inter is needed and would be confused when headings render in a different font (Manrope) than the body (Inter). Also worth noting: the project font list (`getProjectInfo()`) declares 7 fonts (Inter Display, Inter, Instrument Sans, Geist Mono, Gowun Batang, Geist, Manrope) — so Manrope is one of 7, and Inter is one of 7, but only 2 are actually used in text styles.
Evidence: - Brand-guide text node `YKEw6jWDW`: `text: "Inter is used throughout for a clean, trustworthy feel..."`
- exploration.json textStyles: Heading 1 `font.family: "Manrope"`, Heading 2 `font.family: "Manrope"`, ... Heading 6 `font.family: "Manrope"`, Text S `font.family: "Inter"`, Text M `font.family: "Inter"`, Text XL `font.family: "Inter"`, etc.
- The 11 typography specimen RichTextNodes on /brand-guide each apply a `textStylePreset` ("Heading 1", "Heading 2", ..., "Text XS") — so they correctly render in Manrope for headings and Inter for body.
Recommended Fix: Rewrite the description to accurately document both fonts, e.g.: "Vetly pairs Manrope for headings (Heading 1–6) with Inter for body copy (Text XS–XL) — Manrope gives headings warmth and personality, while Inter keeps long-form text highly readable."
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-5)

---

## TV-71 — /brand-guide Secondary Colors section omits rgb/hex values
Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/brand-guide` > Secondary Colors section (`kBrnVRv8G`) > grid `zroJyJObw` (and additional rows)
Description: The Secondary Colors section displays 21 color swatches (slate-100, slate-150, slate-300, slate-500, slate-600, slate-700, slate-800, neutral-50, neutral-100, neutral-300, neutral-400, neutral-500, neutral-600, neutral-700, neutral-900, Border Subtle, Accent Cyan Light, Accent Cyan, Accent Blue, Placeholder Fill, Placeholder Text). Each swatch shows ONLY the color name (e.g., "slate-700") — NO rgb or hex value is displayed. By contrast, the Primary Colors section above shows BOTH the name AND the rgb value (e.g., "Primary" / "rgb(0, 153, 255)"). A designer wanting to use slate-700 has no way to know its rgb value (rgb(49, 65, 88)) from the brand guide alone — they'd have to inspect the canvas or guess. This makes the Secondary Colors section significantly less useful as a reference.
Evidence: - /brand-guide text-run query returned these texts for secondary colors: "slate-100", "slate-150", "slate-300", "slate-500", "slate-600", "slate-700", "slate-800", "neutral-50", "neutral-100", "neutral-300", "neutral-400", "neutral-500", "neutral-600", "neutral-700", "neutral-900", "Border Subtle", "Accent Cyan Light", "Accent Cyan", "Accent Blue", "Placeholder Fill", "Placeholder Text" — NO rgb values for any of these.
- Secondary color swatch structure (e.g., `xiiKZbLy7`): contains only a colored frame + ONE RichTextNode with the color name — no second RichTextNode for the rgb value.
- Compare to Primary color swatch (`zd9ovryvX`): contains colored frame + name RichTextNode + SECOND RichTextNode with rgb value.
- /brand-guide desktop screenshot: https://framerusercontent.com/screenshots/on-demand/d7058d55-8a7c-4826-b592-de49721356d2.jpg — visually confirms secondary swatches show only names.
Recommended Fix: Add a second RichTextNode (using "Text XS" style, like Primary swatches) under each secondary color name showing its rgb value (e.g., "slate-700" → "rgb(49, 65, 88)"). Reference exploration.json colorStyles for the exact values.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-6)

---

## TV-72 — /documentation has 3 unfilled "Image Placeholder" blocks where screenshots should be
Status: Open
Category: Content & copy
Severity: High
Location: `/documentation` > 3 sections: Content & Design (`dYz1sqkkK`) > placeholder `D_NtKRLGQ`; CMS-Managed Content (`AMLviW7Ie`) > placeholder `jk4VOTMg2`; Site Setup (`G1QoiQORy`) > placeholder `qbk179VtF`
Description: The /documentation page has 3 dashed-border placeholder frames where instructional screenshots should appear. Each placeholder contains: a generic Phosphor "Image" icon (32px), the literal label text "Image Placeholder", and a description of what screenshot should go there — e.g., "Description: Screenshot of the canvas with a text block selected, showing the style panel and the Text Style dropdown used to edit fonts and sizes site-wide." The description text literally starts with the word "Description:", making it look like editor notes left in the rendered page. There are ZERO actual image nodes (`ImageNode`) inside the documentation main section. The page is incomplete — it promises visuals but delivers only text descriptions of what the visuals would be. The 4th documentation section (Business Info) has no placeholder, suggesting screenshots were never created for any section.
Evidence: - Text node `ErJCw_NYT`: `text: "Image Placeholder"` (label)
- Text node `kVGJExbcX`: `text: "Description: Screenshot of the canvas with a text block selected, showing the style panel and the Text Style dropdown used to edit fonts and sizes site-wide."` (Content & Design section)
- Text node `tES4BtFGM`: `text: "Description: Screenshot of the Framer CMS panel showing the Blog Collection open, with a list of post items and their fields (title, cover image, author, category)."` (CMS-Managed Content section)
- Text node `HnB_DZi_Y`: `text: "Description: Screenshot of a page's Settings panel with the SEO tab open, showing the Title, Description, and search-indexing toggle fields."` (Site Setup section)
- Placeholder frame `D_NtKRLGQ`: `border: "1px dashed rgba(136, 136, 136, 0.3)"`, `fill: "var(--token-51117f33-471f-4233-a8cd-bfdb883b3044)"` (Placeholder Fill token)
- Image node query returned `[]` — no actual images in /documentation main section
- /documentation desktop screenshot: https://framerusercontent.com/screenshots/on-demand/57181a71-3700-44b4-8fe3-2d24c9734e46.jpg
Recommended Fix: For each of the 3 placeholders, either (a) capture the actual screenshot described and replace the placeholder frame with an ImageNode using that screenshot (preferred), OR (b) if screenshots can't be added now, remove the placeholder frames and rewrite the description text as proper instructional paragraphs (without the "Description:" prefix). Remove the "Image Placeholder" label text.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-7)

---

## TV-73 — /about Location section Google Map renders mostly blank
Status: Open
Category: Components (native + code)
Severity: Medium
Location: `/about` > Main > Location & Hours section (`nwaV8dIo8`) > Map card instance `JmPI7OcwJ` (component `cXuHXndOE`, display name "Map card")
Description: The /about Location section uses a Map card component (which wraps a GoogleMaps external component). The component is configured with `$control__location: "123 Pet Care Lane, New York, NY 12345"` (a placeholder address). A screenshot of just the Map card shows it renders Google's default mint-green background (`#e6f4ea`) — the map shell loads (Google logo, compass control, "Map data ©2026 Google" attribution are visible), but no actual map tiles, streets, or location marker appear. This means either the GoogleMaps API key is missing/unconfigured, OR the placeholder address doesn't geocode to a real location, OR the map viewport is positioned over unmapped area. Visitors see a blank green rectangle instead of a useful clinic location map.
Evidence: - Map card screenshot: https://framerusercontent.com/screenshots/on-demand/1589633f-55da-4cc1-9ca1-ea573c901499.jpg — VLM analysis: "The area contains a Google Map rendering, but it appears to be mostly blank or empty... The vast majority of the screen is filled with a solid light mint green color... the main map content is effectively blank/empty, showing only the default green background instead of streets, terrain, or satellite imagery."
- Map card instance `JmPI7OcwJ` config: `$control__location: "123 Pet Care Lane, New York, NY 12345"`, `$control__radius: "40px"`, `$control__border: "5px solid var(--token-219c2d29-...)"` (White border)
Recommended Fix: Either (a) replace the placeholder address with the real clinic address (once known) so GoogleMaps can geocode it, OR (b) verify the GoogleMaps API key is configured at the project level (Site Settings > Integrations), OR (c) if maps can't be made to work, replace the Map card with a static clinic photo or a "Get Directions" link to Google Maps.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-8)

---

## TV-74 — /about contact info (phone, email, address) styled as links but not clickable
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/about` > Main > Location & Hours section (`nwaV8dIo8`) > Contact Info (`xXqaOtdgG`) > Contact Details (`gWg4mr3zE`) > Info (`LgpzfgGfZ`) — RichTextNodes: Phone Number (`JT3C9tiWw`), Email Address (`aWqm8KoCQ`), Address Text (`ZYjwUND_M`), Clinic Name (`WCMNEMvo3`), Emergency Line (`kSKRADJZJ`)
Description: Multiple RichTextNodes in the contact info area have `linkStylePreset: "Link"` (so they're visually styled as links — likely underlined or colored differently) but have NO `link` or `href` attribute. This means the phone number "(123) 456-7890", email "hello@vetly.com", and address "123 Pet Care Lane, New York, NY 12345" LOOK clickable but tapping/clicking them does nothing. Users on mobile especially expect to tap a phone number to call, tap an email to compose, and tap an address to open maps. The page does have a separate "Call Us" Outline Button (`giLZkQB8r`) with `tel:123-456-7890` link, but the inline phone/email/address text itself is dead.
Evidence: - Serialized RichTextNode `JT3C9tiWw` (Phone Number): `linkStylePreset: "Link"`, but `link: undefined`, `href: undefined` — confirmed no link target.
- Serialized RichTextNode `aWqm8KoCQ` (Email Address): same — styled as link, no href.
- Serialized RichTextNode `ZYjwUND_M` (Address Text): same — styled as link, no href.
- Serialized RichTextNode `WCMNEMvo3` (Clinic Name): same.
- Serialized RichTextNode `kSKRADJZJ` (Emergency Line): same — emergency "24/7 On-Call Support" text styled as link but not clickable.
- Compare: Outline Button `giLZkQB8r` has `$control__link: "tel:123-456-7890"` — the button works, the inline text doesn't.
Recommended Fix: Add `link` attributes to each: phone → `{ href: "tel:123-456-7890" }`, email → `{ href: "mailto:hello@vetly.com" }`, address → `{ href: "https://www.google.com/maps/search/?api=1&query=123+Pet+Care+Lane+New+York+NY+12345" }`. Remove `linkStylePreset: "Link"` if you don't want them visually styled as links, OR keep the styling and add the hrefs.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-9)

---

## TV-75 — /about Hero image (ImageReveal code component) lacks alt text and uses PNG
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/about` > Main > Hero section (`SgDIgdgfz`) > ImageReveal code component instance `glhvTcQ8v` (code component ID `codeFile/hZwaqDB:default`)
Description: The visible hero image on /about is rendered via the ImageReveal code component, which uses a PNG image (`https://framerusercontent.com/images/VwOZRgUg3AdI8mtX3xkuIuyU614.png`) and exposes NO `altText` or `alt` control in its component props. This means screen readers have no description of the hero image (a critical accessibility failure for a hero image — WCAG 1.1.1 Non-text Content). Additionally, the PNG format is significantly larger than WebP for photographic content — performance opportunity missed. There's also a HIDDEN duplicate hero image as a FrameNode (`UHCzkEmCU`, `visible: "false"`) that uses a WebP version of the same image (`2mYRK3PxyCOvm3oAGgVTcKSvBg.webp`) AND has proper altText ("A veterinarian in blue scrubs uses a stethoscope on a smiling Golden Retriever while the owner lovingly looks on in a bright, tidy clinic."). The hidden node has the correct setup but is disabled; the visible node has the wrong setup.
Evidence: - ImageReveal instance `glhvTcQ8v`: `$control__image: "https://framerusercontent.com/images/VwOZRgUg3AdI8mtX3xkuIuyU614.png"` — no `alt` or `altText` control in the component instance attributes.
- Hidden FrameNode `UHCzkEmCU`: `visible: "false"`, `fill: "https://framerusercontent.com/images/2mYRK3PxyCOvm3oAGgVTcKSvBg.webp"`, `altText: "A veterinarian in blue scrubs uses a stethoscope on a smiling Golden Retriever while the owner lovingly looks on in a bright, tidy clinic."`
- The code component source `codeFile/hZwaqDB:default` would need to be checked by sub-agent 11 to confirm whether it forwards an alt prop to the underlying <img> tag.
Recommended Fix: Either (a) update the ImageReveal code component (in code editor) to expose and forward an `alt` prop, then set the alt text on the instance to match the hidden FrameNode's altText, OR (b) replace the ImageReveal instance with a regular FrameNode+image fill (like the hidden `UHCzkEmCU` node) and enable that node, OR (c) at minimum, swap the PNG for the WebP version to reduce file size. The hidden node `UHCzkEmCU` should be deleted once the visible image has proper alt text.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-10)

---

## TV-76 — Inconsistent image format: Story image uses PNG, Team images use WebP
Status: Open
Category: Performance & technical
Severity: Low
Location: `/about` > Main > Story section (`qRLKnnqHY`) > image FrameNode `ko2z38p2E` (uses `https://framerusercontent.com/images/wzaOFvr7x6haFaSLTi7jeiaJEKM.png`); also Hero image PNG noted in TV-4-10
Description: The Story section's image is a PNG file (`wzaOFvr7x6haFaSLTi7jeiaJEKM.png`). The 4 Team member cards use WebP images (`jtM0NXxAyGpY1geagSUo6uvNjeY.webp`, `l9trbGg69636tflF30eW7xb9SqQ.webp`, `gQ3mb3KIWWsZHFPOiFuQ2x9LSU.webp`, `PcTBm4JYn9qd4cCvhE1eOG0CW9Q.webp`). The Hero image (via ImageReveal) is also a PNG (`VwOZRgUg3AdI8mtX3xkuIuyU614.png`). PNG is significantly larger than WebP for photographic content (typically 25-35% larger with no quality loss). Using WebP consistently would improve LCP and reduce bandwidth.
Evidence: - Story image FrameNode `ko2z38p2E`: `fill: "https://framerusercontent.com/images/wzaOFvr7x6haFaSLTi7jeiaJEKM.png"`, `altText: "A veterinarian in blue scrubs smiles at a woman while holding a small Chihuahua..."` (alt text is good)
- Team Card `UqVLyM3uy`: `$control__image: "https://framerusercontent.com/images/jtM0NXxAyGpY1geagSUo6uvNjeY.webp"`
- Team Card `U_cZCFpFd`: `$control__image: "https://framerusercontent.com/images/l9trbGg69636tflF30eW7xb9SqQ.webp"`
- Team Card `gm_jYpv8v`: `$control__image: "https://framerusercontent.com/images/gQ3mb3KIWWsZHFPOiFuQ2x9LSU.webp"`
- Team Card `AK0fZJmAw`: `$control__image: "https://framerusercontent.com/images/PcTBm4JYn9qd4cCvhE1eOG0CW9Q.webp"`
Recommended Fix: Re-export the Story image and Hero image as WebP (or use Framer's built-in image optimization which automatically converts to WebP for delivery — verify this is enabled in project settings). If using ImageReveal code component which may bypass Framer's optimization, consider migrating to a regular image fill.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-11)

---

## TV-77 — /about Mission section badge text says "Our Missions" (plural — should be singular)
Status: Open
Category: Content & copy
Severity: Low
Location: `/about` > Main > Mission section (`K4jkOmdeQ`) > Text Container (`JNv622uBH`) > Badge instance `qUDlkquKQ`
Description: The Mission section's badge label reads "Our Missions" (plural) — but the section is singular ("Mission"), the heading is "Care That Goes Beyond Treatment" (singular treatment), and the section ID is `mission` (singular). The plural "Missions" reads awkwardly and is inconsistent with the rest of the section. Compare to other section badges on the same page: "Our Story" (singular, correct), "Team" (singular, correct), "Trusted Results" (plural, but plural noun is correct here), "Testimonials" (plural noun, correct), "Location" (singular, correct), "FAQs" (plural abbreviation, correct).
Evidence: - Badge instance `qUDlkquKQ`: `$control__text: "Our Missions"`
- Compare: Story section Badge `kRCDVBJWR`: `$control__text: "Our Story"` (singular — correct)
- Section container `K4jkOmdeQ`: `name: "Mission"`, `elementId: "mission"` (singular)
Recommended Fix: Change Badge `qUDlkquKQ` `$control__text` from `"Our Missions"` to `"Our Mission"` (singular).
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-12)

---

## TV-78 — Icon set documentation is inconsistent between /brand-guide and /documentation
Status: Open
Category: Content & copy
Severity: Medium
Location: `/brand-guide` > Icons section (`AQObaUVOb`) > description text node `nTdRBbRGA`; `/documentation` > Content & Design section > "Icons" accordion item `YFuEpIYMD` (`$control__answer`)
Description: The two pages that document the project's icon usage disagree with each other AND with the actual canvas:
- /brand-guide says: "Icons come from the Phosphor and Lucide sets, always in the regular weight, sized to match the text beside them..."
- /documentation says: "This template uses the Phosphor, Lucide, and Logos icon sets."
- Actual /brand-guide Icons section displays 8 icons, ALL from the Phosphor set (Calendar Plus, Phone, Envelope Simple, Clock, Heart, Syringe, Stethoscope, Shield Check) — zero Lucide icons shown.
- "Logos" is NOT in the project's 13 available icon sets (which are: Icon Set, Phosphor, Iconic, Feather, Hero, Lucide, Flowbite, Material, Meteor, Basicons, Nonicons, Sargam, Mage).
So /documentation mentions a non-existent icon set ("Logos"), and /brand-guide claims Lucide is used but displays only Phosphor. A user trying to follow either doc would be confused.
Evidence: - /brand-guide text node `nTdRBbRGA`: `text: "Icons come from the Phosphor and Lucide sets, always in the regular weight..."`
- /documentation FAQ item `YFuEpIYMD`: `$control__question: "Icons"`, `$control__answer: "This template uses the Phosphor, Lucide, and Logos icon sets..."`
- /brand-guide Icons section serialization returned 8 IconNode children, ALL with `set: "Phosphor"` (confirmed via query)
- exploration.json icon sets list does NOT include "Logos"
Recommended Fix: Pick one accurate description and use it on both pages. Suggested: "This template uses the Phosphor icon set for all UI icons (regular weight, sized to match adjacent text)." If you want to mention Lucide as an available alternative, say so explicitly: "Icons use the Phosphor set by default; the project also includes Lucide, Feather, Hero, and others if you want to swap an individual icon." Remove the "Logos" reference from /documentation.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-15)

---

## TV-79 — /brand-guide Buttons section description omits the Disabled variant
Status: Open
Category: Content & copy
Severity: Low
Location: `/brand-guide` > Buttons section (`MGsx4kxex`) > description text node `Qa_krbkY0`
Description: The Buttons section displays 3 button variants: Primary Button ("Book an Appointment"), Outline Button ("Talk to a Vet"), and a Disabled state Primary Button (titled "Disabled"). However, the description text reads: "Primary Button carries the main action (fully rounded, filled with Primary blue). Outline Button is used for secondary actions alongside it." — the description only mentions Primary and Outline, omitting any guidance on when to use the Disabled state. A visitor sees a third button labeled "Disabled" with no explanation of when or why to use it.
Evidence: - Buttons section description `Qa_krbkY0`: `text: "Primary Button carries the main action (fully rounded, filled with Primary blue). Outline Button is used for secondary actions alongside it."`
- 3 button instances: `U9BPSijAV` (Primary, title "Book an Appointment"), `aWtunM5jL` (Outline, text "Talk to a Vet"), `LoEDLNKMX` (Primary with `$control__variant: "Disabled"`, title "Disabled")
Recommended Fix: Either (a) add a sentence to the description covering the Disabled state (e.g., "Use the Disabled variant to show a button is temporarily unavailable, such as when a form is incomplete."), OR (b) remove the Disabled button instance if it's not meant to be documented, OR (c) change the Disabled button's title from "Disabled" to a realistic example like "Book an Appointment" so the disabled visual state is shown in context.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-16)

---

## TV-80 — Trust Card component exists in inventory but is unused on the 3 audited pages
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Native component "Trust Card" (component ID `YwXTWsIji`) — defined in project but not instanced on `/about`, `/brand-guide`, or `/documentation`
Description: Trust Card has 0 instances on these 3 pages but 9 instances site-wide (confirmed by sub-agent 10). Reframed: verify usage intent on remaining 10 pages; component IS in use.

Original description (superseded):
The project inventory lists 28 native components, including "Mission Card" (`HW4zuDyG0`) and "Trust Card" (`YwXTWsIji`). The Mission Card IS used on /about (3 instances in the Mission section, all with real content for "Compassion First", "Modern & Reliable Care", "Built on Trust"). The Trust Card, however, has ZERO instances on /about, /brand-guide, or /documentation. It may be used on other pages (sub-agents 1, 2, 3, 5, 6 should verify), but if it's truly unused site-wide, it's dead inventory that should either be put to use or removed. The component name suggests it would display trust signals (certifications, accreditations, guarantees) — which would be a natural fit for the /about Mission section or a dedicated "Trust" section that's currently missing.
Evidence: - Query: `framer.agent.getDescendantsOfTypes({ id: "hePnJ4Gr1", types: ["ComponentInstanceNode"] }, { pagePath: "/about" })` — filtered for `component === "YwXTWsIji"` returned 0 results.
- Same query on /brand-guide (`b3bBcV2lJ`) and /documentation (`F6Vh8Z3Uz`) — 0 results each.
- For comparison: Mission Card (`HW4zuDyG0`) has 3 instances on /about Main section.
- exploration.json component list includes both Mission Card and Trust Card.
Recommended Fix: This is a partial finding (only 3 of 13 pages checked). Sub-agents 1, 2, 3, 5, 6 should confirm whether Trust Card is used on the home page, services, blog, booking, contact, legal, or 404 pages. If site-wide usage is 0, either (a) add a Trust Card section to /about (e.g., "Accreditations & Certifications" showing AAHA accreditation, state licenses, etc.), OR (b) remove the unused component from the project to reduce clutter.
Confidence: Medium
Discovered by: sub-agent 4, session TV

--- (originally TV-4-17)
Reviewer note: Description corrected per reviewer.

---

## TV-81 — Orphan "Design" canvas page contains unrelated "Cstro" stock dashboard content and gibberish text
Status: Open
Category: Site settings & structure
Severity: Low
Location: DesignPageNode `hLTNRHhgB` (named "Design") — a separate canvas page in the Framer project, not a routed web page
Description: The Framer project contains a `DesignPageNode` named "Design" that holds unrelated content from a different project (a stock-trading dashboard called "Cstro" / "Lift Media"). Specifically, the Design page contains:
- "Cstro" / "CSTRO" text (a stock-trading brand name)
- "Stand Out. Get Clicked. Grow Faster." — marketing copy for the stock product
- "One Dashboard for All Your Stocks" — stock product tagline
- "Real-time market data, advanced charts, stock news, and powerful tools to trade smart and grow wealth fast. Zero commissions on trades." — stock product description
- "© 2020 Lift Media. All rights reserved" — old footer from a different project
- "@AbdallahIsDev" — a developer handle (likely the template author's Twitter/X handle)
- " #FramerChallenge" — leftover Framer Challenge hashtag
- "$30,000" — random monetary value
- "fghgfhgfhfghgfhgfhgfhgfhfgfghfghfghgfgfhfggh gfhfghgfghgfh gfh gfhgfgfhgff ghghgfhf" — keyboard-mashed gibberish text
This content does NOT appear on the live site (the Design page is a non-routed canvas page) — but it's project cruft that pollutes search results when querying text nodes, makes the project file larger, and looks unprofessional if the Framer project is shared/transferred. It's likely leftover from a Framer Challenge entry or a remix from another project.
Evidence: - `framer.agent.getNodesOfTypes({ types: ["TextRun"] })` (no pagePath filter) returned 9 text nodes matching the Cstro/Lift Media/AbdallahIsDev/FramerChallenge/gibberish patterns.
- Ancestor query on text node `A3hgBQjFN` (text "Cstro") returned: `[FrameNode "Frame 631971", FrameNode "header", FrameNode "Frame 632050", FrameNode "Frame 1618874228", DesignPageNode "Design", RootNode]`
- Ancestor query on text node `MCTUGHaAf` (gibberish) returned similar path through "footer" → "down" → "Frame 632050" → "Frame 1618874228" → "Design" → "rootNode"
- Ancestor query on text node `BBdsUwQOy` ("@AbdallahIsDev") returned path through "Info Row" → "Framer Challenge card" → "Design" → "rootNode"
Recommended Fix: Open the "Design" page in Framer, select all content, and delete it. OR if any of the content is reference material the designer wants to keep, move it to a separate Framer project. This won't affect the live site but improves project hygiene.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-18)

---

## TV-82 — /about "Book an Appointment" Primary Button has calendar icon on the right (unusual UX)
Status: Open
Category: UX & conversion
Severity: Low
Location: `/about` > Main > Hero section (`SgDIgdgfz`) > Text Container > Action Row (`vfTD0YR8x`) > Primary Button instance `wliwPIZyK`
Description: The Hero's "Book an Appointment" Primary Button has `$control__rightIcon: "Calendar Plus"` with `$control__rightIconVisible: "true"` and `$control__leftIconVisible: "false"`. So a "Calendar Plus" icon appears on the RIGHT side of the button text (after "Book an Appointment"). This is unusual UX — calendar/booking icons typically appear on the LEFT of a CTA (leading the eye into the text), and arrow icons appear on the right (suggesting forward motion / "go"). The brand-guide Buttons section (TV-4-16 area) shows the same Primary Button variant with `$control__leftIconVisible: "true"` and `$control__leftIcon: "Calendar Plus"` — so the canonical pattern is left-icon. The /about Hero deviates from the documented pattern.
Evidence: - Hero Primary Button `wliwPIZyK`: `$control__rightIcon: "Calendar Plus"`, `$control__rightIconVisible: "true"`, `$control__leftIconVisible: "false"`
- Brand-guide Primary Button `U9BPSijAV`: `$control__leftIcon: "Calendar Plus"`, `$control__leftIconVisible: "true"`, `$control__rightIconVisible: "false"`
- Same component (`ARbK0E6gq`), different icon-side configuration.
Recommended Fix: Either (a) move the calendar icon to the left on the /about Hero button (match the brand-guide canonical pattern), OR (b) update the brand-guide to show right-icon as the canonical pattern, OR (c) if both patterns are intentional, add a note to the brand guide explaining when to use left vs. right icons.
Confidence: Medium
Discovered by: sub-agent 4, session TV

--- (originally TV-4-20)

---

## TV-83 — /about "Outline Button" used for "Meet Our Team" has 0px border (looks like a text link, not an outline button)
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/about` > Main > Hero section (`SgDIgdgfz`) > Text Container > Action Row (`vfTD0YR8x`) > Outline Button instance `KNJoEz6RJ` (component `NoQy1opGY`)
Description: The Hero's "Meet Our Team" button uses the "Outline Button" component but has `$control__border: "0px solid var(--token-70a89806-6562-410d-80cc-9b0fdfdf21e3)"` — i.e., a 0-pixel border with the slate-300 color. With a 0px border, the button has no visible outline and looks like a plain text link with an icon, NOT an outline button. The brand-guide Buttons section shows the canonical Outline Button pattern with `$control__border: "1px solid var(--token-70a89806-...)"` (1px slate-300 border — a real outline). The /about Hero deviates from this pattern. This may be intentional (the designer wanted a more minimal "Meet Our Team" link rather than a heavy outline button next to the primary CTA), but if so, it should arguably use a "Text Link" or "Arrow Button" component instead of an Outline Button with 0px border.
Evidence: - /about Outline Button `KNJoEz6RJ`: `$control__border: "0px solid var(--token-70a89806-6562-410d-80cc-9b0fdfdf21e3)"`, `$control__text: "Meet Our Team"`, `$control__icon2: "Arrow Circle Right"`, `$control__icon2Visible: "true"`
- Brand-guide Outline Button `aWtunM5jL`: `$control__border: "1px solid var(--token-70a89806-6562-410d-80cc-9b0fdfdf21e3)"`, `$control__text: "Talk to a Vet"`
- The VLM analyzing the /about desktop screenshot described this element as "a secondary text link 'Meet Our Team' (with user icon)" — confirming it visually reads as a text link, not an outline button.
Recommended Fix: Either (a) restore the 1px border to make it a real Outline Button, OR (b) if the text-link look is intentional, swap the component to "Arrow Button" (`mEQe6u3a9`) or similar, OR (c) leave as-is but document the deviation in the brand guide so editors know the 0px-border Outline Button is an intentional variant.
Confidence: Medium
Discovered by: sub-agent 4, session TV

--- (originally TV-4-21)

---

## TV-84 — Layout template overrides page metadata: SEO title/description set on /about but brand-guide and /documentation use `noIndex: true`
Status: Open
Category: SEO & metadata
Severity: Low
Location: Page attributes — `/about` (page ID `mWgiU9J96`) has metadata.title and metadata.description set; `/brand-guide` (page ID `hkW4RaXgm`) and `/documentation` (page ID `B49BfU8Yb`) have `noIndex: true`
Description: Sub-agent 7 owns site-wide SEO, but recording what I observed on my 3 pages so the orchestrator can dedupe:
- /about: `metadata.title: "About Vetly | Our Veterinary Team & Story"`, `metadata.description: "Meet the team behind Vetly and learn our story, mission, and commitment to compassionate, high-quality veterinary care for your pet."` — both populated, good SEO. Note: the orchestrator's briefing said "Every page returned `seoTitle: null` and `indexingType: null`" — this appears to refer to different fields than `metadata.title` / `metadata.description`. The `metadata` block IS populated for /about.
- /brand-guide: `metadata.title: "Brand Guide | Vetly Template"`, `metadata.description: "Colors, typography, components, and design principles used across the Vetly template."`, `noIndex: true` — appropriately noindexed (it's template-internal documentation, not customer-facing).
- /documentation: `metadata.title: "Template Documentation | Vetly"`, `metadata.description: "A complete guide to customizing the Vetly template: text, images, colors, CMS content, SEO, and more."`, `noIndex: true` — appropriately noindexed.
The `noIndex: true` on /brand-guide and /documentation is APPROPRIATE for these template-meta pages (they shouldn't be indexed by search engines). The /about metadata is good. However: the title strings include the word "Template" ("Brand Guide | Vetly Template", "Template Documentation | Vetly") — this language should probably be removed before the site goes live (a real Vetly clinic's customers shouldn't see references to "template"). Also: the description for /brand-guide mentions "design principles used across the Vetly template" — same issue.
Evidence: - /about page node: `metadata: { title: "About Vetly | Our Veterinary Team & Story", description: "Meet the team behind Vetly..." }`
- /brand-guide page node: `metadata: { title: "Brand Guide | Vetly Template", description: "...used across the Vetly template.", noIndex: true, noIndexSite: false }`
- /documentation page node: `metadata: { title: "Template Documentation | Vetly", description: "A complete guide to customizing the Vetly template...", noIndex: true, noIndexSite: false }`
Recommended Fix: For /about: keep as-is (metadata is good). For /brand-guide and /documentation: if these pages will remain on the live site (even if noindexed), remove "Template" / "template" language from titles and descriptions. If these pages should be removed entirely from the live site (they're template-meta pages, not customer-facing), consider deleting them from the production site or hiding them behind a login. Sub-agent 7 should make the final call on whether noIndex is the right strategy here.
Confidence: High
Discovered by: sub-agent 4, session TV

--- (originally TV-4-22)

---

## TV-85 — /about hero image "ImageReveal" animation may delay hero visibility (LCP risk)
Status: Open
Category: Performance & technical
Severity: Medium
Location: `/about` > Main > Hero section (`SgDIgdgfz`) > ImageReveal instance `glhvTcQ8v`
Description: The hero image is rendered via the ImageReveal code component with these animation settings: `$control__imageReveal: "true"`, `$control__trigger: "Appear"`, `$control__direction: "Top to Bottom"`, `$control__initialSize: "10"`, `$control__appearAmt: "0.35"`, `$control__scrollStart: "0.2"`, `$control__scrollEnd: "0.6"`, `$control__transition: "{...duration: 1.5, delay: 0.8...}"`, `$control__scaleFrom: "1.3"`. The image starts at 10% size, scales from 1.3x, and reveals over 1.5 seconds with a 0.8s delay. Since the hero image is the largest content element on the page (560px tall, full-width-1fr), it's likely the LCP element. The ImageReveal animation delays full image visibility by ~2.3 seconds (0.8s delay + 1.5s duration), which could push LCP above the 2.5s "good" threshold on slower connections. Additionally, the ImageReveal trigger is "Appear" (on mount) but `scrollStart: "0.2"` and `scrollEnd: "0.6"` suggest it's also scroll-linked — confusing configuration. The hidden duplicate hero image (`UHCzkEmCU`, `visible: "false"`) does NOT have animation and would be the better LCP candidate if it were the visible one.
Evidence: - ImageReveal instance `glhvTcQ8v` config (all attributes listed above)
- Hero image dimensions: `width: "1fr"`, `height: "560px"` (large)
- Hidden duplicate `UHCzkEmCU`: `visible: "false"`, no animation, proper altText — this would be the accessible + LCP-friendly version
Recommended Fix: Either (a) reduce the ImageReveal animation duration to under 0.5s and remove the 0.8s delay (so the image is visible quickly), OR (b) replace the ImageReveal instance with the hidden FrameNode version (`UHCzkEmCU`) which has no animation and proper altText, OR (c) keep the ImageReveal animation but ensure the underlying <img> loads immediately (not lazy-loaded) so LCP isn't delayed by image fetch. Sub-agent 13 (Performance) should run a Lighthouse audit to measure actual LCP impact.
Confidence: Medium
Discovered by: sub-agent 4, session TV (originally TV-4-23)

---

## TV-86 — `/booking` page has no global Header, no Footer, no nav, no contact info, no trust signals
Status: Open
Category: UX & conversion
Severity: Critical
Location: `/booking` (page id `kdx64iDUQ`); page-level attribute `layoutTemplate="null"`; Desktop breakpoint `q91z9DBml` (children: only `Main` `PUXgAxq2e` → `Booking Modal` `tSmCqITJd`).
Description: The `/booking` page is the only one of the 13 site pages that does NOT use the shared `Layout` template (`yDIYoKc7h`). Where every other page inherits a fixed `Header` (logo + nav + phone + "Book Today" button), a `Footer` (links, copyright, social), and the `Smooth Scroll`/`ScrollbarComponent` helpers, the booking page renders nothing but a single centered `Booking Modal` containing a "Book an Appointment" title, a `BackButton` code component, and a Cal.com embed. There is no way for a visitor to navigate elsewhere on the site, no emergency vet phone number visible, no contact email, no address, no testimonials, no certifications, no "Licensed Veterinarians" badge — nothing that would help a hesitant visitor commit. Because this is the single highest-intent conversion page on the site, the absence of trust signals and the inability to backtrack without losing context is a real CRO problem. Direct-link arrivals (shared URLs, search-engine results, paid ads) have no obvious way back into the site if they decide not to book right now.
Evidence: - Page attribute: `attributes.layoutTemplate === "null"` (vs. `"default"` on `/contact` and every other page).
- Desktop breakpoint `q91z9DBml` has exactly one child `Main` (`PUXgAxq2e`) whose only child is `Booking Modal` (`tSmCqITJd`) — confirmed via `framer.agent.serialize`.
- Layout template `yDIYoKc7h` provides: Header (fixed), CTA, Footer, Buy Button (fixed), Smooth Scroll, ScrollbarComponent — none of which are present on `/booking`.
- Desktop screenshot (https://framerusercontent.com/screenshots/on-demand/c2b7d8d2-c590-4e87-90c9-e841fbb0f1b1.jpg, 1280×1200): no header bar, no nav, no footer; just a centered modal.
- VLM analysis of the desktop screenshot: "There is no visible global navigation header, logo, or navigation links… There is no footer section visible at the bottom of the page containing copyright information, links, or contact details."
Recommended Fix: Apply the shared `Layout` template to `/booking` (set `layoutTemplate="default"`) so it inherits the global Header/Footer. If the intent was a "distraction-free modal" experience, at minimum add a slim fixed header with the Vetly logo (clickable → `/`) and a visible emergency phone number, plus a persistent footer with contact details. Do not leave direct-link visitors stranded.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-1)

---

## TV-87 — On mobile and tablet `/booking`, the title "Book an Appointment" and the BackButton are hidden (`visible: "false"`)
Status: Open
Category: UX & conversion
Severity: High
Location: `/booking` Phone breakpoint `KYaJPUHtf` and Tablet breakpoint `CqSG6wWy3`; Header node `KYaJPUHtfIBjN212M7` / `CqSG6wWy3IBjN212M7` (visible:false); Title `KYaJPUHtfZebPjet9v` (visible:false); BackButton `KYaJPUHtfqO44GR49V` (visible:false).
Description: On both the Phone and Tablet breakpoints of `/booking`, the entire `Header` frame containing the "Book an Appointment" title and the `BackButton` code component is set to `visible: "false"`. On Phone, the `BackButton` instance itself is *additionally* set to `visible: "false"`. As a result, on mobile devices the page renders nothing but the Cal.com embed filling the viewport: no title, no close button, no escape route. A visitor who lands on `/booking` from a mobile search result and changes their mind has no in-page way to back out (other than the browser's back button — and if they entered directly, that does nothing useful). The page also has an `appearEffect` scroll-trigger that animates the (already hidden) Header's opacity to 0 and scale to 0 — dead code that does nothing because the node is hidden.
Evidence: Corrected: Phone Header KYaJPUHtfIBjN212M7 does NOT have visible:'false' — only its children (Title KYaJPUHtfZebPjet9v and BackButton KYaJPUHtfqO44GR49V) and Tablet Header CqSG6wWy3IBjN212M7 have visible:'false'. Conclusion (mobile users have no escape) still holds.

Original evidence (superseded):
- Phone Header attributes: `"visible": "false"`, `"styleTransformEffect": { "trigger": "onScroll", "sections": [{}, {"opacity": 0, "scale": 0}] }`.
- Phone Title: `"visible": "false"` on `KYaJPUHtfZebPjet9v`.
- Phone BackButton instance: `"visible": "false"` on `KYaJPUHtfqO44GR49V`.
- Tablet Header: `"visible": "false"` on `CqSG6wWy3IBjN212M7`; Title `"visible": "false"` on `CqSG6wWy3ZebPjet9v`.
- Phone screenshot (https://framerusercontent.com/screenshots/on-demand/6b85d68a-c4ba-4495-a15d-2f8a07e0aae4.jpg, 390×874): VLM analysis reports "There are no visible text strings, headings, labels, or placeholder text in this view… no input fields, no dropdowns, no Submit or Book Now buttons rendered… completely unusable… blank white screen." (Cal.com embed doesn't render in canvas screenshot tool, so the page appears empty.)
- Tablet screenshot (https://framerusercontent.com/screenshots/on-demand/c2d1d019-5d26-4854-bec4-41d574727268.jpg, 768×1080): same situation.
Recommended Fix: On Phone and Tablet breakpoints, set `visible` back to `"true"` (or remove the override) on the Header frame so the title and BackButton appear. If the original intent was to show only the calendar on mobile, replace the BackButton with a clearly visible close (X) affordance that links to `/` or `/contact`, and keep the title visible so the user knows where they are.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-2)
Reviewer note: Evidence corrected per reviewer.

---

## TV-88 — The only navigation on `/booking` desktop is a `BackButton` code component that depends on browser history
Status: Open
Category: UX & conversion
Severity: High
Location: `/booking` Desktop; `BackButton` ComponentInstanceNode id `qO44GR49V`, component `codeFile/tVVtI8x:default`.
Description: The desktop breakpoint of `/booking` provides exactly one navigation affordance: a `BackButton` code component (`codeFile/tVVtI8x:default`) placed in the modal header. By convention a component named "BackButton" calls `history.back()`. This works only when the user arrived at `/booking` via in-site navigation. For users arriving via direct link (shared URL, Google search result, paid ad, email link), `history.back()` either does nothing or — worse — bounces the user back to the search engine / external referrer. Combined with the absence of any global header (TV-5-1), this means direct-link visitors are functionally trapped on the booking modal. The source code of the BackButton component could not be read (limitation — `framer.getCodeFiles()` returns metadata-only objects with no enumerable own properties in this version of the SDK, and `runSupervisorCommand` is restricted to Framer employees), so the exact behavior should be confirmed by the project owner.
Evidence: - ComponentInstanceNode `qO44GR49V`: `component="codeFile/tVVtI8x:default"`, `$componentDisplayName="BackButton"`, `$control__buttonSize="36"`, `$control__iconSize="20"`, `$control__borderRadius="8"`.
- No other link/button instances exist in the `/booking` tree (only the Cal.com Embed and the BackButton).
- `framer.getCodeFiles()` returns `[{},{},{},{}]` (4 empty objects) — confirmed limitation.
- `framer.agent.runSupervisorCommand({goal:"read source", model:"gpt-4"})` → error "This method is only available to Framer employees".
Recommended Fix: Replace the BackButton with an explicit close (X) icon that links to a sensible destination (e.g. `/` or `/contact`) using a real `link.href`, not `history.back()`. Also add a visible "Vetly" logo with a link to `/` so users always have a way home.
Confidence: High (behavior inferred from component name; source not readable)
Discovered by: sub-agent 5, session TV

--- (originally TV-5-3)

---

## TV-89 — Cal.com embed offers only ONE appointment type ("In-Clinic Veterinary Appointment, 30 min"), contradicting the page's SEO description
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/booking` Cal.com Embed instance `O2N4dsp87`; embed HTML attribute `$control__hTML` (Cal.com inline embed for namespace `in-clinic-vet-appointment`, `calLink: "vetly/in-clinic-vet-appointment"`).
Description: The Cal.com embed on `/booking` is hardcoded to a single event-type namespace `in-clinic-vet-appointment` with a single `calLink: "vetly/in-clinic-vet-appointment"`. Live screenshot of https://cal.com/vetly/in-clinic-vet-appointment confirms the event is titled "In-Clinic Veterinary Appointment", 30 minutes, no price listed. The page `<title>` metadata, however, promises "Schedule a wellness visit, vaccination, or checkup for your pet online in just a few clicks" — implying multiple appointment types (wellness, vaccination, checkup, possibly telehealth). Users with a specific need (e.g. "just a vaccination") cannot select a shorter/simpler slot and must book the generic 30-min in-clinic slot. There's also no telehealth option, despite the floating Buy Button elsewhere promising "Vetly for $129" (presumably a subscription/telehealth bundle).
Evidence: - Embed HTML (verbatim from `$control__hTML`): `Cal.ns["in-clinic-vet-appointment"]("inline", { elementOrSelector:"#my-cal-inline-in-clinic-vet-appointment", config: {"layout":"month_view","useSlotsViewOnSmallScreen":"true"}, calLink: "vetly/in-clinic-vet-appointment" });`
- Page metadata.description: "Schedule a wellness visit, vaccination, or checkup for your pet online in just a few clicks with Vetly's easy appointment booking."
- Live screenshot of Cal.com booking page (https://framerusercontent.com/screenshots/on-demand/18216a34-c1e2-48b1-a001-e5f75752643e.jpg): VLM confirms single event "In-Clinic Veterinary Appointment", 30 minutes, location "Main Street Veterinary Clinic…", August 2026 calendar.
Recommended Fix: Either (a) update the Cal.com embed to use Cal.com's multi-event user page (`calLink: "vetly"` with no event specified) so users see all available appointment types, or (b) align the SEO description to match the actual single offering ("Book a 30-minute in-clinic veterinary appointment"). Option (a) is preferable — offer multiple event types (wellness, vaccination, telehealth, emergency).
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-4)

---

## TV-90 — Address inconsistency: Cal.com event location vs. /contact Map card vs. /booking page metadata
Status: Open
Category: Content & copy
Severity: Medium
Location: Cal.com event location string vs. `/contact` Map card instance `WTvyTaGlZ` (`$control__location`).
Description: Three different addresses appear for the Vetly clinic:
1. Cal.com booking widget shows the event location as "Main Street Veterinary Clinic…" (live screenshot).
2. `/contact` Map card (`WTvyTaGlZ`) has `$control__location="123 Pet Care Lane, New York, NY 12345"` — clearly a placeholder (12345 is the IRS standard sample ZIP code, not a real NYC ZIP code; "123 Pet Care Lane" is a stock placeholder street name).
3. `/booking` page metadata mentions neither address but implies a single clinic.

A user who books via Cal.com will see one address, then check `/contact` for directions and see a different (placeholder) address. This will cause real-world missed appointments. Note: sub-agent 4 (about/brand-guide) and sub-agent 15 (header/footer globals) may also encounter these — coordinate during merge.
Evidence: - `/contact` Map card instance: `"$control__location": "123 Pet Care Lane, New York, NY 12345"`.
- Map card component default: `"75 8th Ave, New York, NY 10014, United States"` (also overridden by the instance).
- Cal.com live screenshot (https://framerusercontent.com/screenshots/on-demand/18216a34-c1e2-48b1-a001-e5f75752643e.jpg): VLM reports "Main Street Veterinary Clinic…".
Recommended Fix: Replace the placeholder "123 Pet Care Lane, New York, NY 12345" with the real clinic address, and ensure the Cal.com event location and the Vetly Map card use the same string. If the clinic is actually at "Main Street Veterinary Clinic", update the Map card accordingly.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-5)

---

## TV-91 — Contact form submit button uses the SAME variant for Success and Error states — failed submissions appear to succeed
Status: Open
Category: UX & conversion
Severity: Critical
Location: `/contact` form submit button `xItC9iJpc` (Primary Button instance, component `ARbK0E6gq`); attributes `formButtonSuccessVariant` and `formButtonErrorVariant`.
Description: The Primary Button used as the contact form's submit button is configured with `formButtonSuccessVariant="t9QapcGr2"` and `formButtonErrorVariant="t9QapcGr2"` — the SAME variant id for both states. The Primary Button component (`ARbK0E6gq`) actually has a distinct "Error" variant (`UtTeA07jz`) and a distinct "Success Small" variant (`Pkhyll5Zk`) available, but neither is referenced. Result: when the form submission fails (network error, server-side rejection, validation issue), the button changes to the "Success" visual state. The user sees a success indicator and assumes their message was delivered — but Vetly never receives it. This is a critical CRO bug because it silently loses leads (the visitor thinks they made contact; Vetly has no record). For a veterinary clinic, a lost contact form could mean a pet goes untreated.
Evidence: - Submit button instance `xItC9iJpc` attributes:
  - `"formButtonSuccessVariant": "t9QapcGr2"`
  - `"formButtonPendingVariant": "QP_bKwhNI"`
  - `"formButtonErrorVariant": "t9QapcGr2"` ← same as success
  - (no `formButtonIncompleteVariant` set)
- Primary Button component `ARbK0E6gq` variants enumerated:
  - `t9QapcGr2` = "Success"
  - `UtTeA07jz` = "Error" (exists, unused)
  - `QP_bKwhNI` = "Loading" (correctly used as pending)
  - `nFlcyuxoA` = "Disabled" (could be used as incomplete)
  - `Pkhyll5Zk` = "Success Small", `D35379AjS` = "Error Small"
Recommended Fix: Set `formButtonErrorVariant="UtTeA07jz"` (the "Error" variant) on instance `xItC9iJpc`. Also set `formButtonIncompleteVariant="nFlcyuxoA"` (the "Disabled" variant) so users see a disabled-looking button when required fields are empty. After the fix, test by submitting the form with the network throttled/off to confirm the error variant appears.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-6)

---

## TV-92 — Contact form has no success message, no success redirect, no form name configured
Status: Open
Category: UX & conversion
Severity: High
Location: `/contact` form container `j4M3q_1v6` (FrameNode with `htmlTag="form"`, `formSubmitButtonId="xItC9iJpc"`).
Description: The form container has only `formSubmitButtonId` set. None of the Framer form-success attributes are present: no `formSuccessAction`, no `formSuccessMessage`, no `formSuccessRedirect`, no `formErrorMessage`, no `formName`. Without `formSuccessAction`/`formSuccessMessage`, Framer's default behavior is to swap the submit button to its success variant and stop — no visible confirmation text, no thank-you state, no redirect to a thank-you page. The user clicks "Send Message", the button briefly shows "Success", and then… nothing else happens. They don't know whether the message was actually received. Without `formName`, the email notification Framer sends to the site owner has no clear source attribution. Combined with TV-5-6 (success and error variants are identical), the post-submit experience is genuinely ambiguous — a failed submission looks identical to a successful one.
Evidence: - Form container `j4M3q_1v6` attributes (full attribute key list): `boxShadows, fill, formSubmitButtonId, htmlTag, layout, stackDirection, stackDistribution, stackAlignment, stackWrapEnabled, gap, padding, position, radius, width, height, maxWidth, squircle, zIndex`. No success/error/action/name attributes present.
- The Framer Forms doc (prompt/how-projects-work.md §Forms) defines `formButtonSuccessVariant`, `formButtonPendingVariant`, `formButtonErrorVariant`, `formButtonIncompleteVariant` — but does not list success-message attributes (those are configured via the form's `formSuccessAction` and related attributes in Framer's UI).
Recommended Fix: Open the form's properties in the Framer editor and configure: (1) `formSuccessAction` = "Show message", (2) `formSuccessMessage` = a visible "Thanks for reaching out! We'll reply within one business day." block, (3) `formName` = "Contact Page Form" so notification emails are clearly labeled. Optionally set `formSuccessRedirect` = "/thank-you" if a dedicated thank-you page is desired (would require creating `/thank-you`). After the fix, test by submitting the form and confirming the success message appears.
Confidence: High (attribute absence is direct evidence; exact UX impact is inferred from Framer's default behavior)
Discovered by: sub-agent 5, session TV

--- (originally TV-5-7)

---

## TV-93 — Contact form fields have NO visible text labels — only placeholder text
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/contact` form field wrappers `dw0zWKpsI` (Name), `OLOumfHHI` (Email), `d6OiavksT` (Subject), `Aqw6p0uTm` (Pet Name), `uC7C19UpF` (Message); each is `htmlTag="label"` containing only a single `FormPlainTextInputNode`.
Description: Every form field is wrapped in a `<label>` element (good intent), but the label contains ONLY the input — no text node inside the label. The only field-purpose communication is the input's `placeholder` attribute ("Name *", "Email *", "Subject", "Pet Name", "Tell us how we can help you and your pet…. *"). Placeholders are not accessible labels: they disappear the moment the user starts typing, they're typically rendered in low-contrast gray, and screen readers fall back to announcing the placeholder only when no real label exists. Since the `<label>` element here has no text content, the implicit-label technique fails — the input's accessible name is effectively empty. WCAG 2.1 SC 1.3.1 (Info and Relationships) and SC 3.3.2 (Labels or Instructions) both expect a programmatically determinable label. This is also a CRO issue: sighted users who have started typing lose the field context, and reviewing a long message before submitting is harder without persistent labels.
Evidence: - Name Field `dw0zWKpsI`: `htmlTag="label"`, `gap:"10px"`, only child is `FormPlainTextInputNode` `dUSaG0CMx` (no sibling TextRun/TextBlock).
- Email Field `OLOumfHHI`: same pattern, only child is `XfuoGpmoo`.
- Subject Field `d6OiavksT`: same, only child `JlTOdKvZx`.
- Pet Name Field `Aqw6p0uTm`: same, only child `GBe2pGN2l`.
- Message Textarea `uC7C19UpF`: `htmlTag="label"`, only child `EotCJ5jxi`.
- Placeholder strings (exact): "Name *", "Email *", "Subject", "Pet Name", "Tell us how we can help you and your pet…. *".
Recommended Fix: For each field wrapper, add a `RichTextNode` (or `TextBlock`) child with the field label text (e.g. "Name", "Email", "Subject", "Pet Name", "Message") using the existing text style tokens. The `<label>` will then properly associate with its input via implicit wrapping. Alternatively, set `formInputAriaLabel` on each input — but visible labels are preferred for sighted users.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-8)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-8-9 → now renumbered as TV-8-9. Contact form uses placeholder-as-label pattern; no visible field labels; Message field is single-line.

---

## TV-94 — Contact form on mobile/tablet uses a 2-column input grid — fields are too narrow to type in comfortably
Status: Open
Category: UX & conversion
Severity: High
Location: `/contact` Phone breakpoint `byRCt5S1o` and Tablet breakpoint `MciRfrn4v`; form row containers `byRCt5S1owfpPhFlqG` / `MciRfrn4vwfpPhFlqG` (Name+Email row) and the matching Subject+PetName row (same pattern, not re-serialized but inherits).
Description: The contact form's first input row (Name + Email) and second input row (Subject + Pet Name) are both `layout="stack"`, `stackDirection="horizontal"`, `stackWrapEnabled="false"` on the Phone and Tablet breakpoints — i.e. the two inputs sit side by side with no wrapping. On a 390px-wide phone screen, after the form's 24px padding on each side and the 24px gap between fields, each input gets ~159px of usable width. That's too narrow for typing a typical email address (e.g. "alexandra.thompson@example.com") without heavy truncation. Industry-standard mobile form UX is single-column — stacked inputs, full width. The current layout is a copy-paste of the desktop 2-column layout without a mobile override.
Evidence: - Phone breakpoint container `byRCt5S1owfpPhFlqG` attributes: `"layout": "stack", "stackDirection": "horizontal", "stackWrapEnabled": false, "width": "1fr"`.
- Tablet breakpoint container `MciRfrn4vwfpPhFlqG` attributes: identical (`"stackDirection": "horizontal"`, `"stackWrapEnabled": false`).
- VLM analysis of phone screenshot (https://framerusercontent.com/screenshots/on-demand/cfe5de4d-e677-4d7d-b836-dcc58cf2b8d8.jpg): "The form inputs are arranged in a 2-column grid. On this narrow screen, the fields (Name, Email, Subject, Pet Name) are placed side-by-side rather than being stacked vertically… the side-by-side layout makes the input fields quite narrow (approx. 160-170px wide each), which may be tight for typing longer email addresses or names on a mobile device."
- Phone screenshot pixel width: 390px; form padding: 24px each side; gap: 24px → 390 - 48 - 24 = 318px / 2 = 159px per input.
Recommended Fix: On the Phone breakpoint (and ideally Tablet too), override the form row containers to `stackDirection="vertical"` so Name and Email stack full-width, and Subject and Pet Name stack full-width. Leave the desktop 2-column layout intact.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-9)

---

## TV-95 — "Subject" field is required but the placeholder doesn't indicate it (inconsistent with Name* / Email*)
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/contact` Subject input `JlTOdKvZx` (FormPlainTextInputNode).
Description: The Subject field has `formInputRequired="true"` but its placeholder is the bare string "Subject" — without the trailing asterisk that the Name and Email fields use ("Name *", "Email *"). Users won't know Subject is required until they try to submit and the form rejects it. The Message placeholder uses a trailing " *" ("Tell us how we can help you and your pet…. *") so the convention IS established on this form — Subject is just inconsistent. The Pet Name field is correctly NOT required and uses "Pet Name" without asterisk, so the convention is broken specifically for Subject.
Evidence: - Subject Input `JlTOdKvZx`: `formInputRequired="true"`, `formInputPlaceholder="Subject"`.
- Name Input `dUSaG0CMx`: `formInputRequired="true"`, `formInputPlaceholder="Name *"`.
- Email Input `XfuoGpmoo`: `formInputRequired="true"`, `formInputPlaceholder="Email *"`.
- Message Input `EotCJ5jxi`: `formInputRequired="true"`, `formInputPlaceholder="Tell us how we can help you and your pet…. *"`.
- Pet Name Input `GBe2pGN2l`: `formInputRequired="false"`, `formInputPlaceholder="Pet Name"`.
Recommended Fix: Change Subject's `formInputPlaceholder` from `"Subject"` to `"Subject *"` to match the convention. Better yet, add visible labels above each input (see TV-5-8) and mark required fields with a visible asterisk in the label, not just the placeholder.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-10)

---

## TV-96 — "Pet Name" input field's node is named "Subject Input" (copy-paste leftover)
Status: Open
Category: Components (native + code)
Severity: Low
Location: `/contact` Pet Name input `GBe2pGN2l` (FormPlainTextInputNode, `name="Subject Input"`).
Description: The Pet Name input field's node `name` attribute is `"Subject Input"` — clearly a leftover from when the field was duplicated from the Subject field above it and the developer forgot to rename the node. While not user-visible (the `name` is a canvas-only label, not the rendered HTML name attribute — the actual `formInputName="Pet Name"` is correct), this indicates sloppy build hygiene and will confuse future maintainers.
Evidence: Pet Name Field `Aqw6p0uTm` → child `FormPlainTextInputNode` `GBe2pGN2l`: `"name": "Subject Input"`, `formInputName="Pet Name"`. (Adjacent real Subject input is `JlTOdKvZx` with `name="Subject Input"` and `formInputName="Subject"`.)
Recommended Fix: In the Framer canvas, rename node `GBe2pGN2l` from "Subject Input" to "Pet Name Input". This is a no-op for visitors but improves project maintainability.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-11)

---

## TV-97 — "Our Clinic" card button text is "View on google map" (lowercase, non-branded)
Status: Open
Category: Content & copy
Severity: Low
Location: `/contact` "Our Clinic" Contact Card instance `LypOpNwbO` (`$control__button="View on google map"`).
Description: The button text on the "Our Clinic" contact card reads "View on google map" — the proper noun "Google Maps" is lowercased and singular ("map" instead of "Maps"). The rest of the Vetly site uses title case for buttons ("Book an Appointment", "Send Message", "Book Today", "Book Appointment"). This is a minor copy polish issue but stands out as unprofessional on a contact page.
Evidence: Contact Card instance `LypOpNwbO`: `"$control__button": "View on google map"`, `"$control__title": "Our Clinic"`, `"$control__description": "Free parking available on-site"`.
Recommended Fix: Change `"$control__button"` from `"View on google map"` to `"View on Google Maps"` (or simply `"Get Directions"`). Also verify the button is actually a clickable link to Google Maps for the clinic's real address (see TV-5-5).
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-13)

---

## TV-98 — Floating "Vetly for $129" Buy Button links to https://x.com/ (Twitter/X) — broken CTA on every page using the Layout template
Status: Open
Category: UX & conversion
Severity: High
Location: Layout template `yDIYoKc7h` (scope of the fixed Buy Button); instances `aqBIOKUF4` (Desktop), `D1wW0y55aaqBIOKUF4` (Tablet), `wngbi8Un2aqBIOKUF4` (Phone).
Description: The Layout template includes a `position: "fixed"` floating `Buy Button` component (Framer's e-commerce "Buy Button" component, id `sfrLnUdBr`) at right:20px / bottom:70px on every breakpoint. The button displays a thumbnail of the Vetly homepage hero (with a vet holding a cat) and the text "Vetly for $129" — strongly implying a purchase/checkout CTA. However, the button's `$control__link` is set to `https://x.com/` (Twitter/X) on all three breakpoints. Clicking the floating "$129" CTA takes the user to Elon Musk's social network — which has nothing to do with veterinary services or a $129 purchase. This is a clearly unfinished/placeholder configuration that has been left live. Because the Buy Button lives in the Layout template, it appears on every page that uses the Layout template (all pages except `/booking`) — so this broken CTA is site-wide, including on the conversion-critical `/contact` page where it floats over the form/map area.
Evidence: - Buy Button instance `aqBIOKUF4` (Desktop): `"$control__variant": "Variant 2"`, `"$control__link": "https://x.com/"`, `"$control__image": {"src": "https://framerusercontent.com/images/fm2cvVCqujlMPcHRgN6Vkir3kvA.png", "alt": ""}`, `position: "fixed"`, `right: "20px"`, `bottom: "70px"`, `zIndex: "10"`.
- Tablet instance `D1wW0y55aaqBIOKUF4` and Phone instance `wngbi8Un2aqBIOKUF4`: identical link `https://x.com/`, identical empty alt.
- VLM analysis of /contact desktop screenshot (https://framerusercontent.com/screenshots/on-demand/e9ca74d4-eab9-4299-bd7e-a58f2ae7b989.jpg): "Floating Widget: A small 'Vetly for $129' promotional badge floating on the right edge of the screen."
- Buy Button image (https://framerusercontent.com/images/fm2cvVCqujlMPcHRgN6Vkir3kvA.png) downloaded and analyzed via VLM: confirms it's a screenshot of the Vetly homepage hero (vet holding a cat, "Better Care for Your Pet, Without the Stress" headline).
Recommended Fix: Either (a) replace `https://x.com/` with a real purchase/checkout URL (e.g. a Stripe Payment Link, a Shopify product page, or an internal `/pricing` page), or (b) remove the floating Buy Button entirely if no real $129 product exists. Note: this finding overlaps with sub-agent 15 (Header/Footer globals) and possibly sub-agent 4 — coordinate during merge.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-14)

---

## TV-99 — Floating Buy Button image has empty alt text — accessibility failure
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Layout template Buy Button image; `$control__image.alt === ""` on all three breakpoint instances.
Description: The floating Buy Button's image (`$control__image`) has `alt: ""` (empty string) on all three breakpoint instances. An empty alt text is the WCAG-correct value ONLY for decorative images that convey no information. But this image is the entire content of a clickable CTA — the thumbnail is what tells the user "this is a Vetly promo, click to buy". With empty alt and no visible text label inside the button component (the "$129" text appears to be rendered as part of the image, not as separate text), a screen-reader user has no way to know what the button does. WCAG 2.1 SC 1.1.1 (Non-text Content) and SC 4.1.2 (Name, Role, Value) are both failed.
Evidence: Each of `aqBIOKUF4`, `D1wW0y55aaqBIOKUF4`, `wngbi8Un2aqBIOKUF4` has `"$control__image": {"src": "...", "alt": ""}`.
Recommended Fix: Set `alt` to a meaningful string on all three instances, e.g. `"Vetly for $129 — purchase now"`. Even better, replace the image-only button with a text + image button where the visible text "$129" is real text (not baked into the image).
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-15)

---

## TV-100 — Map card uses an external GoogleMaps component that does not render in canvas — verify it renders on the live site
Status: Open
Category: Components (native + code)
Severity: Medium
Location: `/contact` Map card instance `WTvyTaGlZ` (component `cXuHXndOE`), which internally uses the external `GoogleMaps` component.
Description: The Map card on /contact (instance `WTvyTaGlZ`) displays as a large blank white rectangle in every canvas screenshot (desktop, tablet, phone). This is because the Map card internally uses Framer's external `GoogleMaps` component (listed in the project's 13 external components), which loads its content client-side via JavaScript and does not render in the static canvas screenshot tool. While this is expected for canvas screenshots, it means I cannot visually confirm the map actually renders correctly on the live site — only that the component is wired up with `$control__location="123 Pet Care Lane, New York, NY 12345"` (a placeholder address per TV-5-5). If the Google Maps API key is missing or misconfigured on the live site, the map could be blank there too. Also: a Map card with `width: 1fr` and `height: 1fr` next to the form — on desktop the map is half the width of the form row; if the GoogleMaps component fails to load, the user sees a large empty white panel beside the contact form (which is exactly what the canvas screenshot shows).
Evidence: - Map card instance `WTvyTaGlZ`: `"$control__location": "123 Pet Care Lane, New York, NY 12345"`, `"$control__radius": "40px"`, `"$control__shadow": [...]`, `width: "1fr"`, `height: "1fr"`.
- VLM analysis of desktop screenshot: "There is no actual map rendered. Instead, there is a large, blank white rectangular container on the left side of the form section where a map or image would typically be displayed."
- VLM analysis of phone screenshot: "There is no visible map section in this view. Instead of a map, there is a large white card area below the form which appears empty."
Recommended Fix: Cannot fully verify in investigate-only mode (would require publishing a preview, which is out of scope). Recommend the project owner manually publish a preview and confirm: (1) the Google Maps API key is configured in Framer project settings, (2) the map renders for the production address (replace the placeholder first per TV-5-5), (3) the map doesn't show a "For development purposes only" watermark. Note in fix-mode to verify on staging.
Confidence: Medium (canvas non-rendering is expected; live-site rendering is unverified)
Discovered by: sub-agent 5, session TV

--- (originally TV-5-17)

---

## TV-101 — `/booking` page Main uses `height: 100vh` which on iOS Safari can cause the Cal.com embed to be cut off below the viewport
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/booking` Main frame `PUXgAxq2e` (Desktop) and replicas on Phone `KYaJPUHtfPUXgAxq2e` and Tablet `CqSG6wWy3PUXgAxq2e`.
Description: The `Main` frame on `/booking` is set to `height: 100vh` on all three breakpoints. On mobile Safari (iOS), `100vh` does not account for the dynamically-shrinking browser chrome (the address bar shrinks as the user scrolls, but `vh` is calculated from the largest possible viewport height). This is a well-known iOS bug where content set to `100vh` gets partially obscured by the browser chrome. Since the Cal.com embed inside the Booking Modal has `overflow: scroll` and is sized `width: 1fr; height: 1fr` (filling the modal), a 100vh Main with hidden header (TV-5-2) means: on iOS, the Cal.com calendar may render with its bottom time-slots hidden behind Safari's URL bar, and the user has no way to scroll past it because the page itself is locked to viewport height. Users may miss the "Confirm" button at the bottom of the Cal.com widget.
Evidence: - Desktop Main `PUXgAxq2e` attributes: `"height": "100vh"`, `"maxWidth": "1280px"`, `"layout": "stack"`, `"stackDistribution": "center"`.
- Phone Main `KYaJPUHtfPUXgAxq2e` attributes: `"height": "100vh"`, `"maxWidth": "500px"`, `"padding": "14px"`.
- Tablet Main `CqSG6wWy3PUXgAxq2e` attributes: `"height": "100vh"`, `"maxWidth": "840px"`, `"padding": "32px"`.
- iOS `100vh` behavior is a documented web-platform issue (web.dev / CSS Working Group).
Recommended Fix: Replace `height: "100vh"` with `height: "100dvh"` (dynamic viewport height) on Phone and Tablet breakpoints — `dvh` correctly adjusts to the browser chrome on iOS. Alternatively use `min-height: "100vh"` so the page can grow taller than the viewport if the Cal.com embed needs more room. On Phone specifically, since the Header is hidden (TV-5-2), consider letting the page scroll naturally instead of locking to viewport height.
Confidence: Medium (documented iOS behavior; not visually verified on iOS device)
Discovered by: sub-agent 5, session TV

--- (originally TV-5-18)

---

## TV-102 — Booking page `<title>` says "Vetly Veterinary Clinic" but the brand elsewhere is just "Vetly"
Status: Open
Category: SEO & metadata
Severity: Low
Location: `/booking` page metadata (`attributes.metadata.title = "Book an Appointment | Vetly Veterinary Clinic"`).
Description: The booking page's `<title>` is "Book an Appointment | Vetly Veterinary Clinic" — adding "Veterinary Clinic" to the brand name. Every other page in the inventory (per the orchestrator's exploration) and the visible footer copyright ("© 2026 Vetly. All rights reserved.") use just "Vetly" as the brand. The /contact page title is "Contact Vetly | Book an Appointment or Get in Touch" — also "Vetly" without "Veterinary Clinic". The booking-page title is therefore inconsistent. Note: this is primarily sub-agent 7's (SEO) scope — flagged here because it's a /booking-specific inconsistency. Neither /booking nor /contact has explicit `seoTitle`, `indexingType`, `openGraphImage`, or `twitterImage` attributes set (confirmed by serializing the page nodes — only `metadata.title` and `metadata.description` are present).
Evidence: - `/booking` attributes.metadata: `{"title": "Book an Appointment | Vetly Veterinary Clinic", "description": "Schedule a wellness visit, vaccination, or checkup for your pet online in just a few clicks with Vetly's easy appointment booking."}`.
- `/contact` attributes.metadata: `{"title": "Contact Vetly | Book an Appointment or Get in Touch", "description": "Reach Vetly by phone, email, or visit our clinic in person. Find our hours, location, and contact details, or send us a message directly."}`.
- Neither page has `seoTitle`, `indexingType`, `openGraphImage`, `twitterImage`, or `draft` attributes (attribute key list confirmed).
- Footer copyright per VLM: "© 2026 Vetly. All rights reserved."
Recommended Fix: Update `/booking` title to "Book an Appointment | Vetly" for brand consistency. Also set explicit `openGraphImage` and `twitterImage` on both /booking and /contact so link previews on social/media messaging show a branded image (currently they'll fall back to Framer defaults). Coordinate with sub-agent 7.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-19)

---

## TV-103 — `/booking` Cal.com embed uses `overflow: scroll` inline but the Booking Modal parent uses `overflow: hidden` — nested scroll can trap touch on mobile
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/booking` Booking Modal `tSmCqITJd` (Desktop) / replicas on Phone and Tablet; Cal.com embed HTML inline style `overflow:scroll`.
Description: The Cal.com embed's inline HTML is `<div style="width:100%;height:100%;overflow:scroll" id="my-cal-inline-in-clinic-vet-appointment"></div>` — a scrollable container. It sits inside the Booking Modal frame which has `overflow: "hidden"` on all breakpoints. On mobile, when the user scrolls inside the Cal.com calendar, the touch scroll is captured by the inner div (good for the calendar) but the parent page itself cannot scroll. Combined with Main being locked to `height: 100vh` (TV-5-18) and the header being hidden (TV-5-2), a mobile user whose Cal.com widget is taller than the viewport (e.g. after expanding a day's slots) cannot scroll to see the bottom of the widget. The Cal.com widget's own internal scroll should handle this, but nested scroll containers are notoriously inconsistent on iOS.
Evidence: - Cal.com embed `$control__hTML` (verbatim): `<div style="width:100%;height:100%;overflow:scroll" id="my-cal-inline-in-clinic-vet-appointment"></div>` followed by the script tag.
- Booking Modal `tSmCqITJd` attributes: `"overflow": "hidden"`, `"radius": "32px"`, `"squircle": "80%"`.
- Phone Booking Modal `KYaJPUHtftSmCqITJd`: `"overflow": "hidden"`, `"width": "1fr"`, `"height": "1fr"`.
Recommended Fix: Change the Booking Modal's `overflow` from `"hidden"` to `"visible"` on Phone (and consider Tablet), so the page itself can scroll if the Cal.com widget grows beyond the viewport. Alternatively, remove the inline `overflow:scroll` from the Cal.com HTML snippet and let the modal's own scroll handle it.
Confidence: Medium (inferred from layout structure; not visually verified on a real mobile device)
Discovered by: sub-agent 5, session TV

--- (originally TV-5-20)

---

## TV-104 — Contact form's "Send Message" submit button has no `formButtonIncompleteVariant` set — no disabled state for incomplete forms
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/contact` submit button instance `xItC9iJpc` (Primary Button component `ARbK0E6gq`).
Description: The Primary Button instance used as the contact form's submit button has `formButtonSuccessVariant`, `formButtonPendingVariant`, and `formButtonErrorVariant` set (the latter incorrectly, see TV-5-6), but `formButtonIncompleteVariant` is NOT set. Framer forms support an "incomplete" state that visually disables the submit button when required fields are empty — guiding the user to fill them in. The Primary Button component already has a "Disabled" variant (`nFlcyuxoA`) and a "Disabled Small" variant (`Z8wqYMUWY`) available, but neither is referenced. Without this, the submit button always appears active/clickable, even when Name, Email, Subject, and Message are all empty — the user clicks, the form rejects, and only then do they learn which fields were required. This is extra friction on a conversion-critical form.
Evidence: - Submit button `xItC9iJpc` attributes: `"formButtonSuccessVariant": "t9QapcGr2"`, `"formButtonPendingVariant": "QP_bKwhNI"`, `"formButtonErrorVariant": "t9QapcGr2"`. No `formButtonIncompleteVariant` key present.
- Primary Button component variants: `nFlcyuxoA` = "Disabled", `Z8wqYMUWY` = "Disabled Small" — both available but unused.
Recommended Fix: Set `formButtonIncompleteVariant="nFlcyuxoA"` (Disabled) on instance `xItC9iJpc`. Combine with TV-5-6's fix (set error variant to `UtTeA07jz`) in the same edit pass.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-21)

---

## TV-105 — `/contact` page has no `<h1>` precedence issue — the H1 "We're Here for You and Your Pet" is correct, but the in-page nav anchor `#contact` points to a hidden 8px frame
Status: Open
Category: UX & conversion
Severity: Low
Location: `/contact` "Starting Point" frame `G9d3aZwgk` (`scrollTargetEnabled: true`, `elementId: "contact"`, `opacity: 0`, `zIndex: -1`, `height: 8px`).
Description: The /contact page's first child is a frame named "Starting Point" (`G9d3aZwgk`) with `elementId: "contact"`, `scrollTargetEnabled: "true"`, `opacity: "0"`, `zIndex: "-1"`, `width: "100%"`, `height: "8px"`. This is a scroll-target anchor for hash links like `/contact#contact` — a common pattern for offsetting the fixed Header (which would otherwise overlap the page heading when scrolled to). The pattern itself is fine. The issue is purely informational: the anchor exists and points to a hidden 8px frame, NOT to the visible H1. If a future maintainer wants to deep-link to the form or the clinic-info section, they need to add `scrollTargetEnabled` and `elementId` to those sections — currently neither has it. The form (`j4M3q_1v6`), the contact cards section (`a53UIhGxa`), and the FAQ section (`x51Gl85oP`) all lack `elementId`/`scrollTargetEnabled`. Not a current bug, but a missed CRO opportunity — you can't deep-link a user to "scroll to the form" or "scroll to FAQ".
Evidence: - "Starting Point" frame `G9d3aZwgk`: `"opacity": "0"`, `"zIndex": "-1"`, `"scrollTargetEnabled": true`, `"elementId": "contact"`, `"height": "8px"`.
- Form `j4M3q_1v6`: no `elementId`, no `scrollTargetEnabled`.
- Clinic Info section `a53UIhGxa`: no `elementId`, no `scrollTargetEnabled`.
- FAQ section `x51Gl85oP`: no `elementId`, no `scrollTargetEnabled`.
Recommended Fix: Add `scrollTargetEnabled="true"` and `elementId="form"` to the form container, `elementId="clinic-info"` to the Clinic Info section, and `elementId="faq"` to the FAQ section. This enables future deep-links like `/contact#form` from CTAs in blog posts or emails.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-22)

---

## TV-106 — `/contact` hero subheading mentions emergencies but there is no emergency call-to-action or visible emergency phone number
Status: Open
Category: UX & conversion
Severity: High
Location: `/contact` hero subheading (`V3hlMGRFb`); entire /contact page (no emergency CTA found).
Description: Related to TV-5-16 but distinct: the hero subheading explicitly mentions emergencies ("are facing an emergency, our team is ready to help"), yet there is no prominent emergency phone number, no emergency banner, no "In case of emergency, call [number]" block anywhere on the /contact page. The "Call Us" contact card lists "+123 456 789" (a fake number per TV-5-12) with description "Mon–Sat, during clinic hours" — which is the OPPOSITE of emergency availability. A pet owner whose dog just ate chocolate at 11 PM on a Sunday will read "are facing an emergency, our team is ready to help. Reach out anytime" and then find no actionable emergency contact. This is a serious pet-safety and liability gap, not just a CRO issue.
Evidence: - Hero subheading text (exact): "Whether you have a question, need to book an appointment, or are facing an emergency, our team is ready to help. Reach out anytime."
- "Call Us" Contact Card: `"$control__button": "+123 456 789"`, `"$control__description": "Mon–Sat, during clinic hours"`.
- No emergency phone number, no emergency banner, no Animal Poison Control (888-426-4435) reference, no ASPCA link, no 24/7 emergency vet referral found anywhere on /contact.
Recommended Fix: Either (a) remove the "emergency" language from the hero subheading to match the limited Mon–Sat 8-6 availability, or (b) add a prominent emergency banner above the hero: "Pet emergency? Call [real 24/7 emergency vet] at [real number], or call ASPCA Animal Poison Control at (888) 426-4435." Option (b) is strongly recommended for a veterinary clinic.
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-23)

---

## TV-107 — `/contact` "Send Message" form button has no `formName` attribute — submissions to Framer backend will be unattributable
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/contact` form container `j4M3q_1v6` (no `formName` attribute present).
Description: The form container has no `formName` attribute set. Framer's form submission backend uses the `formName` to label the email notification sent to the site owner and to label the entry in the Framer dashboard's "Form Submissions" view. Without it, submissions from this form will appear with a generic label (likely the page path or just "Form"). If Vetly ever adds a second form (e.g. a newsletter signup, a "Request a Service" form on /services), submissions from different forms will be indistinguishable in the dashboard. This is a CRO-operations issue — it doesn't break the form, but it makes lead tracking harder.
Evidence: Form container `j4M3q_1v6` attribute key list (full): `boxShadows, fill, formSubmitButtonId, htmlTag, layout, stackDirection, stackDistribution, stackAlignment, stackWrapEnabled, gap, padding, position, radius, width, height, maxWidth, squircle, zIndex`. No `formName` key.
Recommended Fix: Set `formName="Contact Page Form"` on the form container. While in the editor, also configure the form's submission email recipient (verify it's a real Vetly mailbox, not the placeholder "hello@vetly.com" per TV-5-12).
Confidence: High
Discovered by: sub-agent 5, session TV

--- (originally TV-5-24)

---

## TV-108 — `/contact` page contains a CMS-bound FAQ list limited to 6 items — same 6 FAQs presumably also on home page
Status: Open
Category: Content & copy
Severity: Low
Location: `/contact` FAQ list container `zQuEXcyL2` (`collectionList: { collection: "FAQs", repeatedDescendantId: "Bjcle6ami", limit: "6" }`).
Description: The FAQ section on /contact is a CMS Collection List bound to the `FAQs` collection, limited to 6 items. The FAQs collection has exactly 6 items (per exploration.json), so all items are shown. The same FAQ section pattern likely also appears on the home page (sub-agent 1's scope) — this is potentially redundant content across two pages. It's not a bug per se, but if home and contact both render the same 6 FAQs verbatim, search engines may flag duplicate content, and visitors navigating between pages see no new information. Worth flagging for sub-agent 7 (SEO) and sub-agent 12 (CMS data quality) to assess.
Evidence: - FAQ list container `zQuEXcyL2`: `"collectionList": {"collection": "FAQs", "repeatedDescendantId": "Bjcle6ami", "limit": "6"}`.
- The FAQs collection (`fRYbceWET`) has 6 items per exploration.json.
- FAQ heading text: "Got Questions? We've Got Answers — Quick answers before you reach out. Still curious? Send us a message above."
Recommended Fix: Consider either (a) curating /contact's FAQ list to show a different subset (e.g. contact-specific FAQs about hours, directions, parking) using a `Group` filter, or (b) removing the FAQ section from /contact if home already covers it. Coordinate with sub-agent 12.
Confidence: High
Discovered by: sub-agent 5, session TV (originally TV-5-25)

---

## TV-109 — /404 page contains template-leftover "Pavyon" copy
Status: Open
Category: Content & copy
Severity: High
Location: `/404` page, desktop/tablet/phone breakpoints; TextRun `v:OLhpRpJos:0:0` (id `OLhpRpJos` on desktop, `bP1_fmE8VOLhpRpJos`/`QwAVLOoulOLhpRpJos` on tablet/phone).
Description: The 404 page's body paragraph reads "We regret to inform you that the **Pavyon** you're searching for seems to be beyond our grasp. We apologize for any inconvenience this may cause." The word "Pavyon" is a different brand name — Vetly was clearly built from a template originally designed for a product called "Pavyon", and this string was never updated. A lost visitor landing on the 404 will be confused by the unfamiliar name, undermining trust in an already-broken experience. This is the same class of bug as the `hello@prismo.com` mailto link on the legal pages (TV-6-2 / TV-6-3) — multiple template leftovers slipped through to production.
Evidence: TextRun `v:OLhpRpJos:0:0` text attribute: `"We regret to inform you that the Pavyon you're searching for seems to be beyond our grasp. We apologize for any inconvenience this may cause."`. Confirmed present on all 3 breakpoints (desktop `zCMRjHlyq`, tablet `QwAVLOoul`, phone `bP1_fmE8V`) — same copy on each. Desktop screenshot: https://framerusercontent.com/screenshots/on-demand/5d988914-3b07-4575-a165-1796e7089910.jpg
Recommended Fix: Replace the TextRun text with copy appropriate for a veterinary clinic — e.g., `We couldn't find the page you were looking for. The link may be broken, or the page may have moved.` (drop "Pavyon" entirely). Apply on the desktop breakpoint; phone/tablet inherit from the shared TextRun source so a single `framer.agent.replaceText({ id: "OLhpRpJos", searchText: "Pavyon", replaceText: "page" })` (or a full rewrite of the sentence) will propagate.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-1)
Reviewer note: Severity changed to High per reviewer.

---

## TV-110 — /privacy-policy contact email link goes to wrong domain (prismo.com)
Status: Open
Category: Content & copy
Severity: High
Location: `/privacy-policy` page, all breakpoints; TextRun `v:Lwr4MNVbu:0:1` inside RichTextNode `Lwr4MNVbu`.
Description: The "Contact Us" section shows the email address `hello@vetly.com` as visible text, but the TextRun's `link` attribute is set to `mailto:hello@prismo.com`. Clicking the email link opens a draft addressed to `hello@prismo.com` — a completely different domain. A visitor trying to email Vetly about a privacy concern would either (a) send mail to a wrong domain that may not exist or may be owned by someone else, or (b) notice the mismatch and lose trust. "Prismo" is a third brand name (alongside "Pavyon" on the 404 and "Vetly" as the live brand) indicating multiple template leftovers. The visible text and the href disagree — this is a functional defect, not just a copy issue.
Evidence: RichTextNode `Lwr4MNVbu` contains two TextRuns:
- `v:Lwr4MNVbu:0:0` text=`"If you have any questions regarding this Privacy Policy or how your information is handled, please contact us at "`
- `v:Lwr4MNVbu:0:1` text=`"hello@vetly.com"`, `link="mailto:hello@prismo.com"`
Confirmed identical on phone breakpoint `pU2X7tE3_`. Desktop screenshot: https://framerusercontent.com/screenshots/on-demand/e3298391-9a52-4db0-b5da-3509991f9e78.jpg
Recommended Fix: Set the `link` on TextRun `v:Lwr4MNVbu:0:1` to `mailto:hello@vetly.com` (matching the visible text). Even better: use a privacy-specific address like `privacy@vetly.com` for the legal pages — see TV-6-11. Since this is a TextRun attribute change (not body copy), use `framer.agent.applyChanges` with `SET v:Lwr4MNVbu:0:1 link="mailto:hello@vetly.com";` on `/privacy-policy`.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-2)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-7-9 → now renumbered as TV-7-9. Privacy policy mailto links to hello@prismo.com instead of hello@vetly.com — sub-agent 7's site-wide angle merged in.
Reviewer note: Severity changed to High per reviewer.

---

## TV-111 — /terms-of-service contact email link goes to wrong domain (prismo.com)
Status: Open
Category: Content & copy
Severity: High
Location: `/terms-of-service` page, all breakpoints; TextRun `v:H2GBNGziV:0:1` inside RichTextNode `H2GBNGziV`.
Description: Same bug as TV-6-2: the Terms of Service "Contact Us" section displays `hello@vetly.com` but the underlying `link` is `mailto:hello@prismo.com`. Clicking the email opens a draft to the wrong domain. The fact that the same defect exists on both legal pages strongly suggests copy-paste from the template rather than a one-off typo — a fix-mode sub-agent should sweep the entire project for `mailto:hello@prismo.com` (and any other prismo.com references) to catch any other instances.
Evidence: RichTextNode `H2GBNGziV` contains two TextRuns:
- `v:H2GBNGziV:0:0` text=`"If you have any questions regarding these Terms of Service, please contact us at "`
- `v:H2GBNGziV:0:1` text=`"hello@vetly.com"`, `link="mailto:hello@prismo.com"`
Confirmed identical on phone breakpoint `fzLSMxK0V`. Desktop screenshot: https://framerusercontent.com/screenshots/on-demand/9cccb09d-aa46-43e6-a9b1-4ce0f1d3d899.jpg
Recommended Fix: Same as TV-6-2 — `SET v:H2GBNGziV:0:1 link="mailto:hello@vetly.com";` on `/terms-of-service`. Then sweep the project for any remaining `prismo.com` references.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-3)
Reviewer note: Severity changed to High per reviewer.

---

## TV-112 — /404 page has minimal recovery UX (only a single home button)
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/404` page desktop breakpoint `zCMRjHlyq` (and tablet/phone). Hero section `J47uvmvRa` → Content `M8inSdO4w`.
Description: The 404 page's content consists of exactly: a giant "404" heading, "Oops! This path leads to the past." sub-heading, a paragraph with template-leftover "Pavyon" text (see TV-6-1), and a single Primary Button "Return to Home" linking to `/#hero`. There is no site search, no list of popular pages (Services, Booking, Blog, Contact), no sitemap link, and no contact option. A lost visitor's only recovery path is back to the home page — from there they have to re-navigate to whatever they were actually looking for. For a veterinary clinic specifically, an emergency-aware 404 could also surface the "Emergency: 24/7 On-Call Support" phone number visible in the site footer (and on the Contact page), since a visitor looking for urgent pet care who hits a 404 might be in a stressful moment. Modern 404 UX patterns suggest at least: (a) popular pages list, (b) a search box, (c) a contact link.
Evidence: Walked desktop breakpoint tree of `/404` — Content `M8inSdO4w` has exactly 4 children: invisible decorative frame `WW8KA7mxK` (see TV-6-9), `UqS_uj9fu` (the "404" heading), `yFUpY8ka2` (text container with `tPCXOH4hC` heading + `OLhpRpJos` paragraph), and `Jv7_t6C6H` (the single Primary Button). No search input, no link list, no contact info. Total visible TextRuns: 3. Desktop screenshot: https://framerusercontent.com/screenshots/on-demand/5d988914-3b07-4575-a165-1796e7089910.jpg
Recommended Fix: Add a "Popular Pages" grid (Services, Book an Appointment, Blog, Contact) below the existing paragraph — reusing the existing `Service Card` or `Outline Button` components for visual consistency. Optionally add a small "Or try searching" input if Framer's search overlay component is available. Most importantly, surface the emergency phone number `(123) 456-7890` (already in the footer) as a visible CTA on the 404 page, given the vet-clinic context.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-5)
Reviewer note: Severity changed to Medium per reviewer.

---

## TV-113 — /privacy-policy is missing standard privacy-policy sections (GDPR, CCPA, retention, children)
Status: Open
Category: Content & copy
Severity: Medium
Location: `/privacy-policy` page, Main `X35ZndK9k` → Sub Container `C85geaMZx`.
Description: The Privacy Policy has these sections: Information We Collect, How We Use Your Information, Data Security, Sharing of Information, Cookies and Tracking Technologies, Third-Party Links, Changes to this Privacy Policy, Contact Us. That's a reasonable starter set, but a real veterinary-clinic privacy policy operating in the US in 2026 should also include:
- **Data retention** — how long personal/pet information is kept (the current policy doesn't mention retention at all).
- **GDPR / EU data subject rights** — right to access, rectify, erase, restrict, data portability, object; right to withdraw consent; legal basis for processing.
- **CCPA / California consumer rights** — right to know, delete, opt-out of sale/sharing, non-discrimination; categories of personal information collected.
- **Children's privacy** — even though this is a vet clinic, the policy should state the minimum age to use the site (and that information about minors is handled with parental consent if applicable).
- **Cross-border data transfer** — if Vetly uses any non-US service providers (which is likely for any modern SaaS stack), the policy should disclose this.
- **Specific security measures** — "industry-standard security measures" is too vague to be meaningful.

The current copy reads like a generic SaaS privacy policy and isn't customized for a veterinary practice — it doesn't mention medical records of pets, the legal basis for processing health information about the animal (which in some jurisdictions is treated differently from human health data), or how information is shared with referral veterinary specialists.
Evidence: All 38 TextRuns on `/privacy-policy` desktop breakpoint `AlWq0i8Kp` collected via tree walk. Section headings present: "Information We Collect", "How We Use Your Information", "Data Security", "Sharing of Information", "Cookies and Tracking Technologies", "Third-Party Links", "Changes to this Privacy Policy", "Contact Us". No mention of "retention", "GDPR", "CCPA", "California", "children", "EU", "European", "right to access", "right to delete", or "withdraw consent". Effective date "May 24, 2026" (TextRun `v:VPjyDPMjk:0:0`).
Recommended Fix: Engage legal counsel (or use a vet-specific privacy policy template generator such as Termly or iubenda) to draft sections for: Data Retention; GDPR Rights (EU/EEA Users); CCPA Rights (California Residents); Children's Privacy; International Data Transfers; Specific Security Measures. Replace the existing "Data Security" section with a more detailed version that names concrete safeguards (encryption in transit via TLS, encryption at rest, role-based access controls, etc.).
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-6)

---

## TV-114 — /terms-of-service Governing Law clause is vague (no jurisdiction named)
Status: Open
Category: Content & copy
Severity: Medium
Location: `/terms-of-service` page, "Governing Law" section, RichTextNode `fZgoN2hz1` (TextRun `v:fZgoN2hz1:0:0`).
Description: The Governing Law clause reads: `"These Terms of Service shall be governed by and interpreted in accordance with the laws applicable in the jurisdiction in which Vetly operates, without regard to conflict of law principles."` This is meaningless boilerplate — it doesn't name the actual jurisdiction. A real ToS names the state (and country). The footer elsewhere on the site states "123 Pet Care Lane, New York, NY 12345" — so the clinic is presented as a New York business, but the ToS doesn't say "State of New York". A court would have difficulty enforcing a clause that doesn't specify the governing jurisdiction. The "without regard to conflict of law principles" phrase is also a US-style clause, suggesting the draft assumed a US jurisdiction but never named it.
Evidence: TextRun `v:fZgoN2hz1:0:0` text=`"These Terms of Service shall be governed by and interpreted in accordance with the laws applicable in the jurisdiction in which Vetly operates, without regard to conflict of law principles."` Cross-reference: footer (visible on every page) lists address "123 Pet Care Lane, New York, NY 12345" — implying New York jurisdiction. Mismatch between footer-claimed location and ToS governing-law clause.
Recommended Fix: Replace with a specific clause — e.g., `"These Terms of Service shall be governed by and construed in accordance with the laws of the State of New York, United States of America, without regard to its conflict of law principles. Any disputes arising under these Terms shall be resolved in the state or federal courts located in New York County, New York."` Also add a "Dispute Resolution / Arbitration" section (currently missing — see TV-6-8).
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-7)

---

## TV-115 — /terms-of-service missing common clauses (warranties, force majeure, severability, age, payment)
Status: Open
Category: Content & copy
Severity: Medium
Location: `/terms-of-service` page, Main `NcmeLw_PI` → Sub Container `Z2Gx_EBDM`.
Description: The Terms of Service has these sections: Acceptance of Terms, Use of Our Website, Appointment Requests, Medical Information Disclaimer, Intellectual Property, Third-Party Services and Links, Limitation of Liability, Indemnification, Changes to These Terms, Governing Law, Contact Us. Missing standard ToS clauses that a veterinary clinic taking online bookings should have:
- **Disclaimer of warranties** — disclaiming implied warranties of merchantability and fitness for a particular purpose (typical UCC-style disclaimer).
- **Force majeure** — Vetly's not liable for service interruptions due to events beyond its control (relevant for emergency clinic operations).
- **Severability** — if any provision is held unenforceable, the rest remains in effect (standard boilerplate that protects the rest of the document).
- **Entire agreement** — these Terms constitute the entire agreement between the parties (prevents claims based on prior communications).
- **Age requirement** — user must be 18+ (or have parental consent) to use the site / book appointments.
- **Payment terms** — since Vetly takes bookings (and presumably deposits or payments for services), there should be payment terms covering cancellation fees, no-show policies, refund policy, etc. The site has a Booking page (`/booking`) but the ToS doesn't address payment at all.
- **Account/security** — if user accounts exist (booking may require one), there should be account-security terms.
- **Dispute resolution / arbitration / class action waiver** — particularly for US businesses.
Evidence: All 38 TextRuns on `/terms-of-service` desktop breakpoint `q_LT6oK8c` collected via tree walk. Section headings present: "Acceptance of Terms", "Use of Our Website", "Appointment Requests", "Medical Information Disclaimer", "Intellectual Property", "Third-Party Services and Links", "Limitation of Liability", "Indemnification", "Changes to These Terms", "Governing Law", "Contact Us". No mention of "warranties", "force majeure", "severability", "entire agreement", "18 years", "payment", "cancellation", "refund", "arbitration", "class action".
Recommended Fix: Engage legal counsel to draft the missing clauses. Also cross-link from the Booking page (`/booking`) to a separate "Payment & Cancellation Policy" page (or add a Payment section to the ToS). The current "Appointment Requests" section mentions Vetly can "reschedule, modify, or cancel appointments when necessary" but is silent on what happens to deposits/payments in those cases.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-8)

---

## TV-116 — /404 page has an invisible decorative frame (white-on-white, off-screen)
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/404` page desktop breakpoint `zCMRjHlyq`; node `WW8KA7mxK` (and per-breakpoint variants `QwAVLOoulWW8KA7mxK`, `bP1_fmE8VWW8KA7mxK`).
Description: Inside the Hero Content frame `M8inSdO4w` there is a `FrameNode` named `WW8KA7mxK` with `width=660px`, `height=280px`, `fill="var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"` (which resolves to `rgb(255, 255, 255)` = White), `layout="null"` (absolute positioning). On the desktop breakpoint it's positioned at `rect.x = -230, rect.y = -16` — outside the visible viewport. On the tablet breakpoint the dimensions shrink to `550px × 176px` and on phone it stays at `660px × 280px` (overflowing the 390px phone width). Since the fill is pure white on a white page background, the frame is invisible. It serves no visual purpose on any breakpoint — it's a leftover from the template's design (likely a placeholder for a hero image or video that was never replaced, or a decorative shape that depended on a colored background). Its presence adds DOM weight without contributing to the design.
Evidence: getRect on desktop: `{"x":-230,"y":-16,"width":660,"height":280}` — off-screen left. Color token `219c2d29-187a-40f8-aab3-a7af9bd91f3b` resolves to `rgb(255, 255, 255)` (White). Confirmed present on all 3 breakpoints with the same white fill.
Recommended Fix: Delete the `WW8KA7mxK` node (and its per-breakpoint variants) — it serves no purpose. If the original intent was a decorative shape behind the "404" text, replace it with a properly-designed decorative element using actual brand colors (Primary blue, Accent Cyan) rather than invisible white. A candidate replacement: a subtle Primary-blue glow behind the "404" digits, similar to the existing Left Glow / Right Glow elements in the Hero Background.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-9)
Reviewer note: Severity changed to Low per reviewer.

---

## TV-117 — /404 Hero Background is fixed-width 1440px on all breakpoints (overflows on tablet/phone)
Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/404` page; Hero Background node `YbU6hUMuI` and its descendants (Gradient Mask `qi_eQnM_q`, Vertical Grid `JDwSKbxXO`, Noise `cDNeD1wwD`).
Description: The 404 page's decorative Hero Background and its children (Gradient Mask, Vertical Grid, Noise image) are all `width="1440px"` (fixed pixels) on every breakpoint — desktop (`zCMRjHlyq`), tablet (`QwAVLOoul`), and phone (`bP1_fmE8V`). On the desktop breakpoint (1280px viewport) this is fine (slight horizontal overflow is clipped by `overflow="hidden"` on the parent). But on tablet (768px viewport) and phone (390px viewport), a fixed 1440px-wide background means the background extends far beyond the visible area — content positioned relative to it may render off-center or clipped. The Vertical Grid (24 columns × 1fr each = 60px per column at 1440px width) is also fixed at 1440px, so on a 390px phone the columns are 60px wide each and only ~6 columns fit on screen. The page's Hero Content frame uses `width="1fr"` with `maxWidth="800px"` — so the actual text/button content does scale responsively, but the background decoration doesn't match.
Evidence: Per-breakpoint serialize of `YbU6hUMuI`:
- Desktop: `width="100%"` (parent), child Gradient Mask `width="1440px"`, Vertical Grid `width="1440px"`
- Tablet: same `1440px` widths on all children
- Phone: same `1440px` widths on all children
Recommended Fix: Either (a) set the background children's `width="100%"` so they scale with the parent (and replace the fixed 1440px Noise image with a CSS-rendered noise effect or a tileable image), or (b) add explicit per-breakpoint width overrides: e.g., tablet `width="768px"`, phone `width="390px"` for the Gradient Mask and Noise. Verify with phone/tablet screenshots that the decorative glow elements remain visually centered behind the "404" digit.
Confidence: Medium
Discovered by: sub-agent 6, session TV

--- (originally TV-6-10)

---

## TV-118 — Legal pages use generic "hello@vetly.com" instead of a privacy/legal contact address
Status: Open
Category: Content & copy
Severity: Low
Location: `/privacy-policy` page Contact Us section (TextRun `v:Lwr4MNVbu:0:1`); `/terms-of-service` page Contact Us section (TextRun `v:H2GBNGziV:0:1`).
Description: Both legal pages direct visitors with privacy/legal concerns to `hello@vetly.com`. While this works as a contact email, best practice for legal pages is to provide a dedicated address (e.g., `privacy@vetly.com` or `legal@vetly.com`) so that legal/privacy inquiries are routed to the right person/queue rather than mixed into general customer support. This is particularly important for GDPR Article 13 / CCPA right-to-know requests, which have statutory response deadlines (30 days for GDPR, 45 days for CCPA) — a generic `hello@` inbox risks missing those deadlines if the legal team isn't watching it. (Note: this is also relevant to the broken mailto link in TV-6-2 / TV-6-3 — if the address is changed, the new address should be a privacy/legal-specific one.)
Evidence: TextRun `v:Lwr4MNVbu:0:1` text=`"hello@vetly.com"` (and `link="mailto:hello@prismo.com"` — see TV-6-2). TextRun `v:H2GBNGziV:0:1` text=`"hello@vetly.com"` (and `link="mailto:hello@prismo.com"` — see TV-6-3).
Recommended Fix: Once the `mailto:` link bug is fixed (TV-6-2 / TV-6-3), consider also changing the visible email address to `privacy@vetly.com` (and configure that inbox on the mail server, or set up an alias forwarding to the appropriate person). At minimum, add a sentence like "For privacy-related inquiries, contact us at privacy@vetly.com. For all other inquiries, contact hello@vetly.com."
Confidence: Medium
Discovered by: sub-agent 6, session TV

--- (originally TV-6-11)
Reviewer note: Severity changed to Low per reviewer.

---

## TV-119 — /404 "404" heading uses Inter Display font instead of Manrope (type-system inconsistency)
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/404` page; RichTextNode `UqS_uj9fu` (heading "404").
Description: The 404 page's "404" heading uses inline `fontName="Inter Display"`, `fontWeight=700`, `fontSize="120px"` (desktop) / `"100px"` (phone). Every other heading on the audited legal pages uses `textStylePreset="Heading 1"` / `"Heading 3"` / `"Heading 4"`, which all use Manrope (per the project's text styles). Inter Display is a different sans-serif — it's listed in the project fonts but isn't part of any defined text style. So the "404" digit renders in a different typeface from every other heading on the site. This may be a deliberate stylistic choice (Inter Display is more "numeric / display" suited), but it's an inconsistency against the design system. The brand-guide page (`/brand-guide`) explicitly says: "Inter is used throughout for a clean, trustworthy feel. Headings step down from Heading 1 to Heading 6…" — confirming Manrope (per text styles) is the intended heading font. The 404 heading deviates from this stated rule.
Evidence: `framer.agent.serialize({id: "UqS_uj9fu", depth: 1})` on `/404` returns attributes `{ fontName: "Inter Display", fontStyle: "normal", fontWeight: 700, fontSize: "120px", letterSpacing: "0em", lineHeight: "120%", textAlignment: "center", textColor: "var(--token-c8873226-6828-48de-9374-e4136018a41e)" }`. No `textStylePreset` is set. Project text style "Heading 1" defines font as Manrope, 56px, slate-800 — different from what's applied here. Brand-guide quote confirmed via TextRun `v:Pog7IJxbFYKEw6jWDW:0:0` text: `"Inter is used throughout for a clean, trustworthy feel. Headings step down from Heading 1 to Heading 6; body copy uses Text XS through Text XL depending on emphasis."` (Note: the brand guide text itself is inaccurate — it says "Inter" but the text styles actually use Manrope for headings; that's a separate issue for the brand-guide sub-agent.)
Recommended Fix: Either (a) apply `textStylePreset="Heading 1"` to the "404" heading and override only `fontSize` (keeping Manrope for type consistency), or (b) if Inter Display is the intended choice for big display numerals, document this exception in the brand guide and use it consistently for any large numeric displays across the site. Option (a) is the safer fix.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-12)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-9-9 → now renumbered as TV-9-9. Inter Display used on /404 hero (and 2 other heading nodes) despite Manrope being the declared heading font. TV-9-9's full instance list folded in: bP1_fmE8VUqS_uj9fu, QwAVLOoulUqS_uj9fu, UqS_uj9fu.

---

## TV-120 — /privacy-policy H2 section headings use "Heading 3" preset (skips Heading 2)
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/privacy-policy` page; all section H2 headings (`RODDDkw4h`, `VSrKI1jd8`, `DVU7iEdVS`, `ctTTTBqKY`, `Ti7hsrj2q`, `if0jVGBdF`, `T1c2Srft6`, `LUHm8vr23`).
Description: The page's H1 ("Our Privacy Policy") uses `textStylePreset="Heading 1"` (Manrope, 56px, slate-800). All section H2 headings (e.g., "Information We Collect", "How We Use Your Information", etc.) use `textStylePreset="Heading 3"` (Manrope, 32px, slate-700) — skipping "Heading 2" (44px) entirely. This creates a steep 24px size jump from H1 to H2. The HTML tags are correct (`h1` then `h2`), so semantic structure is fine — but the visual hierarchy has only two levels instead of three. The same pattern applies to /terms-of-service (verified — its section headings also use "Heading 3" preset). Not wrong, just a missed opportunity to use the full type scale. Also: the page's title-section Sub Container has `gap="48px"` between the title block and the first section, while section-to-section gaps are `32px` — that's fine, but the missing "Heading 2" makes the title section feel disproportionately large compared to the body.
Evidence: RichTextNode `RODDDkw4h` ("Information We Collect") attributes: `{ position: "relative", width: "1fr", height: "auto", textStylePreset: "Heading 3", textAlignment: "start" }`. Same `textStylePreset: "Heading 3"` on all 8 section H2s (verified via tree walk). H1 `SUkEAaH6H` uses `textStylePreset: "Heading 1"`. Project text style definitions: Heading 1 = 56px, Heading 2 = 44px, Heading 3 = 32px.
Recommended Fix: Optional — switch the section H2s to `textStylePreset="Heading 2"` (44px) to use the full type scale, OR document this as an intentional design choice (legal pages tend to use compact typography because they're long-form reading content). Either way, the inconsistency between the H1 ("Heading 1" preset) and H2 ("Heading 3" preset, skipping "Heading 2") should be a conscious decision, not an accident.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-13)

---

## TV-121 — Legal-page body paragraphs override the "Text L" preset's textColor (slate-700 → neutral-600)
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/privacy-policy` page (all body paragraphs, e.g., `tXhkL5vmN`, `fu6Mhp8HW`, `JRaDz0IAZ`, `u2mqNjvcT`, `D2dIYfOEU`, `yt5OuSdOQ`, `VbwSLkquT`, `Lwr4MNVbu`) and `/terms-of-service` page (all body paragraphs).
Description: Body paragraphs on both legal pages use `textStylePreset="Text L"` (which is defined as Inter, 18px, slate-700 = rgb(49,65,88)) but override `textColor` to `var(--token-4b8ae43c-b1a6-4d10-8760-4bd0be7aa6f6)` which is `rgb(64, 64, 64)` (the neutral-600 token). So the actual rendered color is neutral-600, not the slate-700 that the text style defines. The two colors are very similar (both dark gray, both pass WCAG AAA on white), so this is purely a design-system-consistency issue, not a contrast problem. But it means the legal pages are using a different gray scale (neutral) from the rest of the site's body text (slate) — a subtle inconsistency that suggests the page was built by overriding the preset rather than creating a "Legal Body" text style or just using the preset as-is.
Evidence: RichTextNode `tXhkL5vmN` attributes: `{ textStylePreset: "Text L", textAlignment: "left", textColor: "var(--token-4b8ae43c-b1a6-4d10-8760-4bd0be7aa6f6)" }`. Token `4b8ae43c-b1a6-4d10-8760-4bd0be7aa6f6` resolves to `rgb(64, 64, 64)` (neutral-600). Text style "Text L" defines color as slate-700 = rgb(49, 65, 88). Override confirmed on all body paragraphs on both legal pages.
Recommended Fix: Either (a) remove the `textColor` override on all body paragraphs and let them inherit slate-700 from the "Text L" preset (preferred — fewer overrides = more consistent design system), or (b) if neutral-600 is genuinely the intended body color, update the "Text L" text style to use neutral-600 instead of slate-700. Option (a) is the lower-risk fix.
Confidence: High
Discovered by: sub-agent 6, session TV

--- (originally TV-6-14)

---

## TV-122 — Inconsistent textAlignment attribute values ("left" vs "start") on legal pages
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/privacy-policy` page; H1 `SUkEAaH6H` and intro paragraph `tXhkL5vmN` use `textAlignment="left"`; section H2s (`RODDDkw4h`, `VSrKI1jd8`, etc.) and body paragraphs use `textAlignment="start"`.
Description: On the privacy-policy page, the H1 "Our Privacy Policy" and its lead-in paragraph use `textAlignment: "left"`, while every section H2 and body paragraph below uses `textAlignment: "start"`. Both values produce identical visual output in LTR (left-to-right) languages like English, but the attribute inconsistency is sloppy — likely a result of the page being built by a designer who used different controls at different times. The "start" value is the modern CSS-logical-property equivalent of "left" in LTR (and "right" in RTL), so for a future-proof codebase it's the better choice. Pick one and apply it everywhere.
Evidence: H1 `SUkEAaH6H` attributes include `textAlignment: "left"`. H2 `RODDDkw4h` attributes include `textAlignment: "start"`. Body para `tXhkL5vmN` (lead-in) uses `"left"`; body para `fu6Mhp8HW` (section body) uses `"start"`. Confirmed via full attribute serialize.
Recommended Fix: Normalize all `textAlignment` values to `"start"` across both legal pages (and ideally site-wide as a separate sweep). In a fix-mode session: `SET SUkEAaH6H textAlignment="start"; SET tXhkL5vmN textAlignment="start";` (and similarly for any other "left"-aligned text nodes on the legal pages).
Confidence: High
Discovered by: sub-agent 6, session TV (originally TV-6-15)

---

## TV-123 — Per-page SEO titles/descriptions are mostly configured BUT 9 of 13 pages have no `socialImage` and `/404` has no description (revised finding)
Status: Open
Category: SEO & metadata
Severity: Medium
Location: Site-wide — every `WebPageNode`; specific gaps noted below.
Description: The initial draft of this finding (and the orchestrator's preliminary note in worklog.md) incorrectly claimed every page had null SEO metadata. After re-serializing without an `attributeFilter`, the actual state is **better than initially reported**: 12 of 13 pages have a `metadata.title` and 12 of 13 have a `metadata.description` (the only page missing a description is `/404`). The CMS detail pages (`/services/:Services`, `/blog/:Blog`) correctly bind title/description to CMS fields via `{{Title}}` / `{{Description}}` / `{{Card Description}}` placeholders. So the SERP-snippet side of per-page SEO is in good shape. **However, three real gaps remain**: (1) `/404` has no `metadata.description` (only a title), so the 404 page would render in SERPs (if it were indexed, which it shouldn't be per TV-7-19) with no description text; (2) 9 of 13 pages have NO `metadata.socialImage` — only `/blog/:Blog` binds one (to the Blog.Image CMS field, var `kZ3Cwfwri`); `/`, `/services`, `/services/:Services`, `/about`, `/blog`, `/contact`, `/booking`, `/privacy-policy`, `/terms-of-service`, `/404` all lack socialImage bindings; (3) no page has `metadata.ogType` or `metadata.canonical` set (Framer may default these but they're not explicitly configured).
Evidence: Per-page metadata table above. Direct API read with `serializeNodes({ ids: [all 13 page ids], depth: 1 })` returned full `attributes.metadata` objects. Concrete examples of the three gaps:
- `/404` (id `kfL3sfGQh`): `attributes.metadata` = `{ "title": "404 | Page Not Found", "noIndexSite": false }` — note the absence of any `description` key.
- `/about` (id `mWgiU9J96`): `attributes.metadata` = `{ "title": "About Vetly | Our Veterinary Team & Story", "description": "Meet the team behind Vetly and learn our story, mission, and commitment to compassionate, high-quality veterinary care for your pet." }` — note the absence of any `socialImage` key.
- `/blog/:Blog` (id `DvEqpc9aQ`) for contrast: `attributes.metadata.socialImage` = `"var(--variable-kZ3Cwfwri)"` — this variable resolves to the Blog collection's `Image` field (variable id `kZ3Cwfwri`, name `Image`, type `image`, key `$control__image`). This is the only page with a socialImage binding.
Recommended Fix: 1. Add a `metadata.description` to `/404` (e.g., `"The page you were looking for could not be found. Return to the Vetly home page or contact our team for help."`) — though since /404 should be noindexed (TV-7-19), this is low priority.
2. Bind `metadata.socialImage` on `/services/:Services` to the Services collection's `Hero Image` field (variable id `cuwT3VRH4`, key `$control__hero_image`) — DSL: `SET lhpeg56oV metadata.socialImage="var(--variable-cuwT3VRH4)";`.
3. Set a default `socialImage` at the rootNode level (see TV-7-2) so the 8 remaining pages without a per-page socialImage still render with a brand-approved share image.
4. Consider setting `metadata.ogType` explicitly: `"website"` for `/`, `"article"` for `/blog/:Blog` and `/services/:Services`, `"website"` for everything else.
5. Consider setting per-page `metadata.canonical` to the absolute production URL of each page (e.g., `https://vetly.com/about` for `/about`) to prevent duplicate-content issues from query-string or trailing-slash variants.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-1)

---

## TV-124 — rootNode has no `socialImage` — no default OG image for the 8 pages without per-page socialImage (revised finding)
Status: Open
Category: SEO & metadata
Severity: High
Location: `RootNode` id `rootNode` (site-wide default metadata)
Description: The rootNode's `attributes.metadata` object contains `title`, `description`, `favicon`, `faviconDark`, and `appleTouchIcon`, but NO `socialImage` / `ogImage` field. Combined with TV-7-1's finding that 9 of 13 pages also lack a per-page `socialImage` binding, this means **at least 8 user-facing pages** (`/`, `/services`, `/services/:Services`, `/about`, `/blog`, `/contact`, `/booking`, `/privacy-policy`, `/terms-of-service`) have **no OpenGraph image at any level** — when shared on Twitter, Facebook, LinkedIn, Slack, iMessage, etc., they will render with no preview image. Only `/blog/:Blog` article pages get a per-article share image (from the Blog CMS Image field). For a veterinary clinic where visual trust (photos of pets, vets, the clinic) is a conversion driver, this is a meaningful SEO/social-referral gap.
Evidence: Direct read — `framer.agent.getNode({ id: "rootNode" })` returned:
```json
{
  "type": "RootNode",
  "id": "rootNode",
  "attributes": {
    "metadata": {
      "title": "Vetly - Trusted Veterinary Care for Your Pet",
      "description": "Compassionate, professional care for cats, dogs, and all furry family members. Book your appointment today, we're here for you and your pet.",
      "favicon": "https://framerusercontent.com/images/uIdSeGFrTg2DRXzrKm5xFU6ZI.svg",
      "faviconDark": "https://framerusercontent.com/images/uIdSeGFrTg2DRXzrKm5xFU6ZI.svg",
      "appleTouchIcon": "https://framerusercontent.com/images/PHSAprphYHKPfcgIrMSwQ0CXA.png"
    }
  }
}
```
No `socialImage` key present. Cross-referenced with per-page metadata (TV-7-1 table) — only `/blog/:Blog` has a per-page `socialImage` binding; the other 12 pages have none.
Recommended Fix: Upload a 1200×630px brand-approved OG image (Vetly logo + tagline on a brand-colored background, or a high-quality hero pet photo with logo overlay) and set it as rootNode's `metadata.socialImage`. This becomes the default share image for all pages that don't override it. Then per-page override `socialImage` on: `/` (hero image), `/services/:Services` (Services.Hero Image — variable `cuwT3VRH4`), `/about` (team photo), `/contact` (clinic exterior or map photo), `/booking` (appointment-themed image). Article pages (`/blog/:Blog`) already have this correctly bound.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-2)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-14-2 → now renumbered as TV-14-2. rootNode has no socialImage — 9 pages have no share image at any level.
Reviewer note: Count wording: 9 pages have no OG image (not 8)

---

## TV-125 — Zero structured data / JSON-LD anywhere on the site (missing LocalBusiness, VeterinaryCare, FAQPage, Article schemas)
Status: Open
Category: SEO & metadata
Severity: High
Location: Site-wide (no structured data on any of the 13 pages or in the Layout template `yDIYoKc7h`)
Description: For a veterinary clinic, structured data is a major SEO win — `LocalBusiness`/`VeterinaryCare` schema on the home or contact page enables rich SERP results (clinic name, address, phone, hours, reviews); `FAQPage` schema on the home/FAQ section enables FAQ rich snippets; `Article` schema on `/blog/:Blog` detail pages enables article rich results. None of this is implemented. I verified by walking every page's desktop breakpoint at depth 8 and checking for any `FrameNode` with `htmlTag="script"` or `htmlTag="application/ld+json"` — 0 matches. I also checked the 3 `Embed` component instances — they are all on `/booking` and are a Cal.com booking widget (`componentDisplayName: "Cal Booking"`), not structured-data embeds. The Layout template (`yDIYoKc7h`) contains no script-tagged frames either.
Evidence: - Query: `framer.agent.getNodesOfTypes({ types: ["FrameNode"] })` → 2082 frames; filtering for `attributes.htmlTag === "script"` or `attributes.htmlTag === "application/ld+json"` returned 0 matches.
- 3 Embed instances (`KYaJPUHtfO2N4dsp87`, `CqSG6wWy3O2N4dsp87`, `O2N4dsp87`) — all on `/booking` (desktop `q91z9DBml` and its replicas), all named `"Cal Booking"`, all using component `o1PI5S8YtkA5bP5g4dFz`. None contain JSON-LD.
- Layout template `yDIYoKc7h` serialized at depth 6 — no script-tagged frames, no JSON-LD embeds.
Recommended Fix: 1. On `/` (home) or `/contact`: add an Embed component with `VeterinaryCare` (subtype of `LocalBusiness`) JSON-LD including `name`, `image`, `address` (street, city, state, zip), `telephone`, `openingHoursSpecification`, `priceRange`, `aggregateRating` (once Testimonials are real), `url`, `sameAs` (Vetly's real social profiles once TV-7-11 is fixed).
2. On `/blog/:Blog`: add `Article` / `BlogPosting` JSON-LD bound to CMS fields (Title, Description, Published Date, Auther Name → fix typo to Author Name per worklog finding, Image).
3. On the FAQ section of `/` and `/contact` (which has `contact-faq` scroll target): add `FAQPage` JSON-LD bound to the FAQs collection's Question/Answer fields.
4. On `/services/:Services`: add `Service` JSON-LD bound to the CMS item's Title, Intro Text, and Benefits fields.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-3)

---

## TV-126 — ImageReveal code component exposes no `alt` prop — site-wide image alt-text gap
Status: Open
Category: Accessibility & compliance
Severity: High
Location: Code component `codeFile/hZwaqDB:default` (display name `ImageReveal`); used inside Teem Card (`T6DVfhsAL`), Why Us Card (`Sr15oMIZ5`), and as direct instances on home (`/`) and `/about`. 11 ImageReveal instances project-wide (3 unique per breakpoint group on `/about`, 2 unique on `/`, 1 each inside Teem Card and Why Us Card component definitions).
Description: The ImageReveal code component — used to render the hero image on home, hero images on `/about`, and every image inside Team Cards and Why Us Cards — exposes 20 controls via `framer.agent.readComponentControls({ componentIds: ["codeFile/hZwaqDB:default"] })`. None of them is an `alt` text control. The exposed controls are: `$control__image`, `$control__imageReveal`, `$control__trigger`, `$control__direction`, `$control__initialSize`, `$control__appearAmt`, `$control__scrollStart`, `$control__scrollEnd`, `$control__transition`, `$control__scaleFrom`, `$control__placeholder`, `$control__once`, `$control__shadow`, `$control__shadow1`, `$control__radius`, `$control__border`, `$control__imagePadding`, `$control__hoverScale`, `$control__hoverScale1`, `$control__hoverTransition`. There is no `$control__alt` or equivalent. Since none of the 11 ImageReveal instances set `alt` either (verified: every instance's `attributes.alt === undefined`), the rendered `<img>` tags have no `alt` attribute — failing WCAG 1.1.1 (Non-text Content) and stripping SEO image-search signals.
Evidence: - Hero image instance on home: id `Ru5gXN_Yg`, `$control__image` = `"https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png"`, no `alt` attribute on the instance, no `alt` control on the component.
- Team Card instance on home: id `PdWrNXOdx`, `$control__image` = `"https://framerusercontent.com/images/jtM0NXxAyGpY1geagSUo6uvNjeY.webp"`, `$control__name` = `"Dr. Leo Torres"` (could serve as alt source but is not currently bound), no `alt` attribute.
- Why Us Card instance on home: id `LsVbtMwYG`, `$control__image2` = `"https://framerusercontent.com/images/3Z8kHVk06rh4ajROucRbpRBUmFA.png"`, `$control__title` = `"Compassionate Care"` (could serve as alt source but is not currently bound), no `alt` attribute.
- Component controls list (above) — confirmed no alt-type control exposed.
Recommended Fix: Edit `Workshop/ImageReveal.tsx` (the code component source — note: sub-agent 11 owns code component edits) to add a new `alt` prop of type `string` to the component's controls, and pass it through to the underlying `<img>` element's `alt` attribute. Then either (a) update each instance to provide descriptive alt text, or (b) for card components, bind the inner ImageReveal's `alt` to the parent card's existing `$control__name` / `$control__title` so alt text is auto-populated from the card's visible title. For the home hero image specifically: alt should describe the photo (e.g., "A veterinarian examining a calm golden retriever at Vetly clinic"). Decorative-only background images (e.g., `W166wnt5m` "Noise") should get `alt=""` to be explicitly ignored by screen readers.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-4)

---

## TV-127 — `/booking` page has no H1 and minimal body content despite having full SEO metadata (conversion-critical page is thin for SEO)
Status: Open
Category: SEO & metadata
Severity: High
Location: `/booking` (page id `kdx64iDUQ`, desktop breakpoint `q91z9DBml`)
Description: The booking page — which the SUBAGENT-BRIEFING flags as "conversion-critical" — has only 8 descendants per breakpoint, 1 RichTextNode total (a single paragraph), 0 H1s, 0 H2s, 0 H3s, and no internal or external links. Its only substantive content is an Embed component instance (`O2N4dsp87`, component `o1PI5S8YtkA5bP5g4dFz`, displayName `Cal Booking`) which renders a Cal.com scheduling widget in an iframe. **Note**: the page DOES have correct SEO metadata (`metadata.title` = `"Book an Appointment | Vetly Veterinary Clinic"`, `metadata.description` = `"Schedule a wellness visit, vaccination, or checkup for your pet online in just a few clicks with Vetly's easy appointment booking."`) — so this is NOT a metadata gap; it's a body-content gap. With no H1 and no descriptive copy on the page itself, the page is "thin content" by Google's standards, which can hurt rankings even when metadata is well-optimized. For a high-intent conversion page like booking, this is a real issue.
Evidence: - Heading tally on `/booking` desktop breakpoint: rich=1, h1=0, h2=0, h3=0, h4=0, h5=0, h6=0, p=1, none=0.
- Internal/external link count on `/booking`: 0 internal, 0 external, 0 anchors.
- Embed instance: `O2N4dsp87` component `o1PI5S8YtkA5bP5g4dFz` displayName `Cal Booking` on groundId `q91z9DBml` (booking desktop).
- Per-page metadata (per TV-7-1 table): `{ "title": "Book an Appointment | Vetly Veterinary Clinic", "description": "Schedule a wellness visit, vaccination, or checkup for your pet online in just a few clicks with Vetly's easy appointment booking." }` — metadata is fine.
- The page DOES have a working scroll target: `tSmCqITJd name="Booking Modal" elementId="booking"` — so anchor links like `/booking#booking` (used on home and about) work correctly.
Recommended Fix: Add (1) an H1 like "Book Your Pet's Appointment", (2) a supporting paragraph or two explaining what to bring, expected appointment length, and the cancellation policy, (3) keep `indexingType`/`noIndex` unset (this page SHOULD rank for "vet appointment booking"), and (4) consider adding `Service` JSON-LD describing the booking service. Keep the Cal.com embed as the primary CTA. Coordinate with sub-agent 5 (booking/contact owner) since this overlaps with their scope.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-5)

---

## TV-128 — `/blog/:Blog` CMS detail page template has no heading hierarchy and no body content on the desktop breakpoint (despite having CMS-bound SEO metadata)
Status: Open
Category: SEO & metadata
Severity: High
Location: `/blog/:Blog` (page id `DvEqpc9aQ`, desktop breakpoint `lBjdH_FvV`)
Description: The blog article detail page — the most important page type for organic SEO on a content-marketing site — has 0 H1s, 0 H2s, 0 H3s, 0 paragraphs, and only 7 RichTextNodes total on its desktop breakpoint (and 2 of those are the "Previous"/"Next" navigation links). This suggests the template has not been wired up to render the Blog CMS item's `Title` (as H1), `Description` (as intro paragraph), or `Content` (rich-text body) fields. **Note**: the page DOES have correct CMS-bound SEO metadata (`metadata.title` = `"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"`, `metadata.description` = `"{{Description}}"`, `metadata.socialImage` = `"var(--variable-kZ3Cwfwri)"` ← Blog.Image) — so the SERP snippet will be article-specific. But the rendered page body is empty, which means: (a) Google has no on-page content to index for keyword matching; (b) visitors arriving from search see an empty page and bounce; (c) the `Article`/`BlogPosting` JSON-LD (per TV-7-3) would have nothing to point to as `articleBody`. The 10 blog items in the Blog collection have rich Content fields (per CMS exploration) but they're not being rendered.
Evidence: - Heading tally on `/blog/:Blog` desktop breakpoint (`lBjdH_FvV`): rich=7, h1=0, h2=0, h3=0, h4=0, h5=0, h6=0, p=0, none=0.
- Two of the 7 RichTextNodes are navigation links: `RRkgGNuU4` (name="Previous") and `Csqv7XTu7` (name="Next"), both with `link.href = "/blog/:slug#main"` and CMS-bound `collectionItem` variables (`previousItemId.CJvDdRtwN`, `nextItemId.CJvDdRtwN`).
- The page has 0 images, 0 internal links, 0 external links beyond the prev/next.
- The Blog CMS collection has 10 items with Title, Description, Content, Image, Published Date, Auther Name (typo), Article type, Read Time fields — all available to bind but none currently rendered.
- Per-page metadata (per TV-7-1 table): `{ "title": "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet", "description": "{{Description}}", "socialImage": "var(--variable-kZ3Cwfwri)" }` — metadata is correctly CMS-bound; body is not.
Recommended Fix: Build out the `/blog/:Blog` template to render: (1) H1 bound to `Blog.Title`; (2) intro paragraph bound to `Blog.Description`; (3) hero image via ImageReveal bound to `Blog.Image` with descriptive `alt` (e.g., bound to `Blog.Title` — coordinate with TV-7-4); (4) article body via RichTextNode bound to `Blog.Content`; (5) meta-info row bound to `Blog.Auther Name` (fix typo to `Author Name` per worklog), `Blog.Published Date`, `Blog.Read Time`, `Blog.Article type`; (6) `Article`/`BlogPosting` JSON-LD per TV-7-3. Coordinate with sub-agent 3 (blog pages owner) since this overlaps with their scope.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-6)

---

## TV-129 — `/services/:Services` CMS detail page template has no H1 (despite having CMS-bound SEO metadata)
Status: Open
Category: SEO & metadata
Severity: High
Location: `/services/:Services` (page id `lhpeg56oV`, desktop breakpoint `L0pZyMNz4`)
Description: The services detail page template has 0 H1s on its desktop breakpoint — only 1 H2 and 4 H3s. For a 12-item Services CMS collection where each item is a high-intent SEO target (e.g., "/services/dental-oral-health" should rank for "veterinary dental care"), having no H1 means there is no primary heading for search engines to identify the page's topic. The H1 should be bound to the Services collection's `Title` field (e.g., "Dental & Oral Health"). Currently the only heading content is the H2 (1 instance) and 4 H3s — these are likely section labels like "What to Expect", "Benefits", "FAQ" rather than the page's primary topic heading. **Note**: the page DOES have correct CMS-bound SEO metadata (`metadata.title` = `"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"`, `metadata.description` = `"{{Card Description}}"`) — so the SERP snippet will be service-specific. But the body lacks an H1, which is a separate on-page SEO failure.
Evidence: - Heading tally on `/services/:Services` desktop breakpoint (`L0pZyMNz4`): rich=12, h1=0, h2=1, h3=4, h4=0, h5=0, h6=0, p=0.
- Services collection has 12 items with `Title`, `Card Description`, `Hero Image`, `Intro Text`, `Gallery Image 1/2/3`, `What to Expect`, `Benefits`, `FAQ` fields available to bind.
- The page has 1 internal link (the CMS-detail anchor `/services/:slug#main`) and 1 external link (`tel:+123-456-7890` — note this is a different phone format than the `tel:123-456-7890` used on home/about, see TV-7-10).
- Per-page metadata (per TV-7-1 table): `{ "title": "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet", "description": "{{Card Description}}" }` — metadata is correctly CMS-bound; body lacks H1. Note: no `socialImage` binding (gap flagged in TV-7-1).
Recommended Fix: Add an H1 to the template bound to `Services.Title`. Also bind `metadata.socialImage` to `Services.Hero Image` (variable `cuwT3VRH4`) per TV-7-1. Add `Service` schema JSON-LD bound to Title/Intro Text/Benefits per TV-7-3. Coordinate with sub-agent 2 (services pages owner) since this overlaps with their scope.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-7)

---

## TV-130 — `/brand-guide` page has two H1 elements (multiple-H1 document outline issue)
Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/brand-guide` (page id `hkW4RaXgm`, desktop breakpoint `F2Ac06qm9`)
Description: The brand-guide page has 2 H1 elements on its desktop breakpoint: `xbjV5Mh_O` (text "Vetly Design System") and `nos5EGliZ` (text "Heading 1 — The quick brown fox"). The second H1 is part of a typography specimen section showcasing the "Heading 1" text style — it appears to be a label for the specimen rather than a page title. Having multiple H1s is not strictly invalid in HTML5 but is bad SEO practice and confuses the document outline; search engines may pick the wrong one as the page's primary topic. The intended H1 is "Vetly Design System". (Note: this page IS correctly noindexed via `metadata.noIndex: true` per TV-7-1 table, so the SEO impact is muted — but the document-outline issue remains and would matter if the page were ever made indexable.)
Evidence: Heading tally on `/brand-guide` desktop breakpoint (`F2Ac06qm9`): rich=87, h1=2, h2=13, h3=1, h4=3, h5=1, h6=1, p=66. The two H1 instances:
- id `xbjV5Mh_O`, text: `"Vetly Design System"` (likely the intended page H1).
- id `nos5EGliZ`, text: `"Heading 1 — The quick brown fox"` (the typography-specimen label).
Recommended Fix: Change the TextBlock tag on `nos5EGliZ` (or its parent RichTextNode) from `h1` to a non-heading element (e.g., `p` or `span`) since it's a specimen label, not a content heading. The specimen can use a small caption instead. Alternatively, if the specimen needs to demonstrate the visual style of an H1, render it as a styled `<p>` with the same typography but a non-heading semantic tag.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-8)

---

## TV-131 — Global "Buy Button" social-media link in Layout template points to `https://x.com/` (placeholder, not Vetly's profile)
Status: Open
Category: SEO & metadata
Severity: Medium
Location: Layout template `yDIYoKc7h` — ComponentInstanceNode `aqBIOKUF4` (component `sfrLnUdBr` aka "Buy Button"), present on Desktop/Tablet/Phone breakpoints and therefore rendered on every page that uses the Layout template (all 13 pages except `/booking` which uses `layoutTemplate: "null"`).
Description: The Layout template includes a "Buy Button" component instance whose `$control__link` is set to `https://x.com/` — the generic X/Twitter homepage, not Vetly's actual X/Twitter profile URL. This link appears in the site-wide chrome (likely as a floating social-media icon), so it's visible on every page that uses the Layout template. Three problems: (1) it doesn't actually link to Vetly's social presence (assuming Vetly has one); (2) "Buy Button" is a misnamed component for what is clearly a social-link slot, suggesting it was repurposed from a template; (3) if Vetly has no X presence, the link should be removed rather than left as a generic outbound link (which leaks link equity to x.com for no benefit). Also: `/booking` is the only page that does NOT use the Layout template (it has `layoutTemplate: "null"` per the corrected metadata) — so the x.com link does NOT appear on the booking page.
Evidence: Layout template serialize (depth 6) shows ComponentInstanceNode `aqBIOKUF4` (component `sfrLnUdBr`, displayName `Buy Button`) on the Desktop breakpoint with `attributes.$control__link = "https://x.com/"`. Replica instances on Tablet (`D1wW0y55aaqBIOKUF4`) and Phone (`wngbi8Un2aqBIOKUF4`) inherit the same link. The Layout template is applied to 12 of 13 pages (per-page metadata `layoutTemplate: "default"`); `/booking` is the exception with `layoutTemplate: "null"`.
Recommended Fix: Either (a) replace `https://x.com/` with Vetly's actual X/Twitter profile URL (e.g., `https://x.com/vetly` — confirm with brand owner), or (b) if Vetly has no X presence, remove the instance from the Layout template entirely. While doing this, audit the other "social" slots in the Layout template (the Layout template structure shows only this one outbound link, but the Footer component `Xx2RpZ5pV` may contain additional social links — coordinate with sub-agent 15 to inspect the Footer component definition). Also consider renaming the "Buy Button" component to "Social Link" or "Icon Button" to reflect its actual purpose.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-11)

---

## TV-132 — About page scroll-target elementId "Stats " has trailing whitespace — anchor links to `#Stats` won't match
Status: Open
Category: SEO & metadata
Severity: Low
Location: `/about` (page id `mWgiU9J96`) — FrameNode `g352OHmnR` name="Stats"
Description: One of the `/about` page's scroll-target frames has `elementId="Stats "` (note the trailing space character). The HTML id attribute `id="Stats "` is technically valid but anchor links like `/about#Stats` (without trailing space) won't match the browser's element-id lookup, so smooth-scroll links to this section silently fail. The other 9 scroll targets on `/about` are clean (`about`, `main`, `hero`, `story`, `mission`, `team`, `Stats ` [sic], `testimonials`, `location`, `faq`).
Evidence: Direct serialize of `/about` desktop breakpoint `cf1vfJBN4` at depth 8 returned scroll targets including: `id=g352OHmnR type=FrameNode name="Stats" elementId="Stats "` — the trailing space is present in the API response, not an artifact of console formatting.
Recommended Fix: Update FrameNode `g352OHmnR`'s `elementId` attribute from `"Stats "` to `"stats"` (lowercase, no trailing space — matching the convention used by sibling targets like `team`, `mission`, `faq`).
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-14)

---

## TV-133 — Page node `name` attribute equals the URL path for 12 of 13 pages (polish — affects editor UX, not SEO directly)
Status: Open
Category: Site settings & structure
Severity: Low
Location: All `WebPageNode`s except Home (`augiA20Il`)
Description: The `name` attribute on each WebPageNode is the page's URL path verbatim (e.g., `/privacy-policy`, `/404`, `/services`, `/about`, `/blog`, `/contact`, `/booking`, `/documentation`, `/brand-guide`, `/terms-of-service`, `/services/:Services`, `/blog/:Blog`). Only Home has a human-readable name (`Home`). This is a Framer editor-UX issue rather than a direct SEO issue (the `name` doesn't appear in the rendered HTML), but it makes the Framer page-tree harder to navigate for the site owner and for future fix-mode sub-agents. It also suggests the pages were created programmatically from path strings rather than being given display names.
Evidence: `framer.agent.serializeNodes({ ids: [all 13 page ids], depth: 1 })` returned for each page (except Home) a `name` value identical to its `path`. Examples: `{ id: "coY2rsl2X", name: "/privacy-policy", attributes: { path: "/privacy-policy" } }`, `{ id: "kfL3sfGQh", name: "/404", attributes: { path: "/404" } }`, `{ id: "WBfQT22QS", name: "/services", attributes: { path: "/services" } }`. Home: `{ id: "augiA20Il", name: "Home", attributes: { path: "/" } }`.
Recommended Fix: Set each page's `name` to a human-readable display name: `Privacy Policy`, `404 Not Found`, `Services`, `About`, `Blog`, `Contact`, `Book Appointment`, `Documentation`, `Brand Guide`, `Terms of Service`, `Service Detail (CMS)`, `Blog Article (CMS)`. This is editor-only metadata; it does not affect the rendered site or URLs.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-15)

---

## TV-134 — Documentation and Brand-Guide pages have generic breakpoint names ("Breakpoint 2", "Breakpoint 3") instead of "Tablet"/"Phone"
Status: Open
Category: Site settings & structure
Severity: Low
Location: `/documentation` (page id `B49BfU8Yb`) and `/brand-guide` (page id `hkW4RaXgm`)
Description: Most pages have breakpoints named `Desktop`, `Tablet`, `Phone`. But `/documentation` and `/brand-guide` have breakpoints named `Desktop`, `Breakpoint 2`, `Breakpoint 3` — the default Framer placeholder names that get assigned when a breakpoint is created without being renamed. This is purely editor-UX polish (the breakpoint name doesn't affect the rendered media queries — the `mediaQueryRange` values are correct: `(min-width: 768px) and (max-width: 1279.98px)` for tablet, `(max-width: 767.98px)` for phone). But it signals incomplete setup of these two pages.
Evidence: Direct serialize of all 13 WebPageNodes with `$breakpoints` filter:
- `/documentation` (id `B49BfU8Yb`): breakpoints `[{name:"Desktop", id:"r8icvKdrL"}, {name:"Breakpoint 2", id:"u78lgJ27h"}, {name:"Breakpoint 3", id:"Yak1bjj2W"}]`.
- `/brand-guide` (id `hkW4RaXgm`): breakpoints `[{name:"Desktop", id:"F2Ac06qm9"}, {name:"Breakpoint 2", id:"ca9bRdpvP"}, {name:"Breakpoint 3", id:"Pog7IJxbF"}]`.
- All other 11 pages: breakpoints named `Desktop`, `Tablet`, `Phone`.
Recommended Fix: Rename `Breakpoint 2` → `Tablet` and `Breakpoint 3` → `Phone` on both `/documentation` and `/brand-guide` for consistency. (Note: the orchestrator's worklog already flagged these two pages as internal-reference pages that should likely be `noindex` — coordinate with sub-agent 4 which owns these pages.)
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-16)

---

## TV-135 — 0 redirects configured — flag for SEO-strategist to verify whether redirects are needed
Status: Open
Category: Site settings & structure
Severity: Low
Location: Site-wide redirects configuration (`framer.getRedirects()` returns `[]`)
Description: The project has 0 configured redirects. For a brand-new launch this is expected. However, if Vetly is a redesign of an existing site (or if any URL slugs change after launch — see TV-7-12 and TV-7-13), redirects become critical to preserve SEO equity. The site also has no `/blog/:slug` → canonical blog URL pattern documented, and no trailing-slash or non-www → www redirect configured. This is flagged as a verification item rather than a defect — the SEO-strategist lens should confirm whether Vetly is replacing an existing site and, if so, audit the old URL structure for redirect needs.
Evidence: `framer.getRedirects()` returned `[]` (confirmed by orchestrator in worklog.md and re-verified during this audit — same result).
Recommended Fix: Have the SEO-strategist sub-agent (or orchestrator) confirm with the site owner whether this is a net-new launch or a redesign. If redesign: inventory the old site's URLs and create 308 redirects (Framer's `+RedirectNode` only supports 308 permanent) from each old URL to the corresponding new URL. Also consider adding a global trailing-slash normalization redirect and a non-www → www (or vice versa) redirect at the DNS/hosting layer (Framer handles the latter via project settings, not via RedirectNode).
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-17)

---

## TV-136 — Sitemap.xml and robots.txt configuration cannot be verified via the API — flag for SEO-strategist to verify in Framer dashboard
Status: Open
Category: SEO & metadata
Severity: Low
Location: Project-level hosting settings (not queryable via `framer.agent.*` API)
Description: Framer automatically generates `sitemap.xml` and `robots.txt` for published sites, and the project's SEO settings in the Framer dashboard control whether pages are included. None of this is exposed via the `framer.agent.*` API (no method to query sitemap configuration, robots directives, or per-page noindex state beyond the `metadata.noIndex` / `metadata.noIndexSite` attributes I inspected per TV-7-1). This is a verification gap: I cannot confirm from the API alone whether the published site will have a valid sitemap, whether `robots.txt` blocks any paths, or whether the staging domain is noindexed.
Evidence: No `framer.agent.*` method exists for sitemap/robots inspection. The closest signals are the per-page `metadata.noIndex` attribute (only set on `/documentation` and `/brand-guide` per TV-7-1 table) and `metadata.noIndexSite` (set to `false` on 6 pages — redundant since `false` is the default).
Recommended Fix: Have the SEO-strategist sub-agent (or orchestrator) log into the Framer dashboard and verify: (1) the production domain has a valid `sitemap.xml` at `/sitemap.xml`; (2) `robots.txt` at `/robots.txt` is not blocking important paths; (3) staging/preview domains are noindexed (Framer does this by default but verify); (4) submit the sitemap to Google Search Console and Bing Webmaster Tools once the production domain is live. Also: set `metadata.noIndex: true` on `/404`, `/privacy-policy` (debatable), `/terms-of-service` (debatable) per TV-7-19 and TV-7-1.
Confidence: High
Discovered by: sub-agent 7, session TV

--- (originally TV-7-18)

---

## TV-137 — `/404` page is missing `metadata.noIndex: true` (should be noindexed)
Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/404` (page id `kfL3sfGQh`)
Description: The `/404` page has `metadata.noIndexSite: false` but NOT `metadata.noIndex: true`. Sub-agent 6's TV-6-4 flagged this same issue (and also for `/privacy-policy` and `/terms-of-service`). The `/404` page is a system error page that should never appear in search results — Google's guidelines explicitly say 404 pages should return HTTP 404 (which Framer does) AND should be noindexed to prevent them from being indexed as a soft-404. Leaving `/404` indexable risks it appearing in SERPs for branded queries if Google crawls the URL directly. (Note: `/documentation` and `/brand-guide` correctly have `noIndex: true` per TV-7-1 table — so this is a `/404`-specific gap, not a site-wide one.)
Evidence: `framer.agent.getNode({ id: "kfL3sfGQh" })` returned `attributes.metadata = { "title": "404 | Page Not Found", "noIndexSite": false }` — no `noIndex` key, no `description` key (description gap also flagged in TV-7-1). Compare to `/documentation` (id `B49BfU8Yb`): `attributes.metadata = { "title": "Template Documentation | Vetly", "description": "...", "noIndex": true, "noIndexSite": false }` — correctly noindexed.
Recommended Fix: Set `metadata.noIndex: true` on the `/404` page (`SET kfL3sfGQh metadata.noIndex="true";`). Also consider adding a `metadata.description` (low priority since the page will be noindexed). For `/privacy-policy` and `/terms-of-service`, the noindex decision is debatable — many brands keep legal pages indexable so customers can find them; the SEO-strategist should make a brand-specific call. (Orchestrator: dedupe with sub-agent 6's TV-6-4.)
Confidence: High
Discovered by: sub-agent 7, session TV (overlaps with sub-agent 6's TV-6-4)

--- (originally TV-7-19)
Dedupe note: This finding consolidates 3 cross-sub-agent duplicate(s): TV-6-4, TV-14-5, TV-14-12 → now renumbered as TV-6-4, TV-14-5, TV-14-12. /404 and legal pages missing noIndex:true — also flagged in sitemap.xml inclusion (TV-14-5 angle).

---

## TV-138 — `/services/:Services` detail page is missing `metadata.socialImage` binding (Blog detail has it, Services detail doesn't)
Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/services/:Services` (page id `lhpeg56oV`)
Description: The Services CMS detail page template binds `metadata.title` to `{{Title}}` and `metadata.description` to `{{Card Description}}` (good — per TV-7-1 table), but it does NOT bind `metadata.socialImage` to the Services collection's `Hero Image` field. By contrast, the Blog detail page (`/blog/:Blog`) correctly binds `metadata.socialImage` to `var(--variable-kZ3Cwfwri)` (the Blog.Image field). This asymmetry means each of the 12 services detail pages will render with NO service-specific share image — they'll fall back to the rootNode's default socialImage, which also doesn't exist (per TV-7-2). So a share of `https://vetly.com/services/dental-oral-health` on Twitter/Slack will render with no preview image, even though there's a perfectly good Hero Image in the CMS for that service.
Evidence: `framer.agent.getNode({ id: "lhpeg56oV" })` returned `attributes.metadata = { "title": "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet", "description": "{{Card Description}}" }` — no `socialImage` key. The Services collection has a `Hero Image` field (variable id `cuwT3VRH4`, type `image`, key `$control__hero_image`) that is the obvious source. Compare to `/blog/:Blog`: `attributes.metadata.socialImage = "var(--variable-kZ3Cwfwri)"` (bound to Blog.Image variable).
Recommended Fix: Add `metadata.socialImage` binding to the `/services/:Services` page pointing at the Services Hero Image field. In Framer DSL: `SET lhpeg56oV metadata.socialImage="var(--variable-cuwT3VRH4)";`. Coordinate with sub-agent 2 (services pages owner) since this overlaps with their scope.
Confidence: High
Discovered by: sub-agent 7, session TV (originally TV-7-20)
Dedupe note: This finding consolidates 2 cross-sub-agent duplicate(s): TV-12-23, TV-14-3 → now renumbered as TV-12-23, TV-14-3. /services/:Services CMS detail page missing socialImage binding — should bind to Services.Hero Image variable.

---

## TV-139 — White text on Primary fill fails WCAG AA contrast (3.26:1)
Status: Open
Category: Accessibility & compliance
Severity: High
Location: Site-wide — `Primary Button` component (`ARbK0E6gq`), all variants; any element using White text on Primary fill (rgb(0,144,255))
Description: The Primary brand color `rgb(0,144,255)` is the default fill for the Primary Button component (used on every page CTA). When paired with White text (the typical button label color), the computed WCAG 2.1 contrast ratio is **3.26:1**, which fails the AA threshold of 4.5:1 for normal text and only barely passes the 3:1 threshold for large text (≥24px regular or ≥18.66px bold). The Primary Button text style is Inter 16px regular (per `Text M`), which is normal-size text — so the AA failure applies. This affects every primary CTA across the site (home hero "Book Appointment", service cards "Learn More", contact form submit, etc.).
Evidence: - Computed ratio: White (rgb(255,255,255)) on Primary (rgb(0,144,255)) = `(1.0 + 0.05) / (0.3022 + 0.05)` = **3.26:1** (FAIL for normal text, AA-pass for large text only).
- Color tokens: `Primary` token id `8d76f153-6a21-4584-a490-7ac9adb914b2` from `exploration.json` colorStyles.
- Primary Button master component id `ARbK0E6gq`, variant `Button` frame id `s0zHOdlkz` (htmlTag=`<button>`).
- Computation script: `/home/z/my-project/scripts/contrast-calc.js`.
Recommended Fix: Darken the Primary token from `rgb(0,144,255)` to ~`rgb(0,109,207)` (would yield ~4.5:1) or `rgb(0,90,170)` (~6:1). Alternatively, keep the visual color but switch button label color from White to a darker shade (e.g., slate-800) — but that conflicts with the brand look. Token change is preferred.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-1)

---

## TV-140 — Primary text color on White / near-white backgrounds fails AA (3.26:1 / 2.98:1 / 2.78:1)
Status: Open
Category: Accessibility & compliance
Severity: High
Location: Site-wide — anywhere `Primary` (rgb(0,144,255)) is used as a text color on White, slate-100, or slate-150 backgrounds
Description: The `Primary` token is also used as a text/link color (e.g., inline links, "Learn More" arrows, accent text). On White the contrast ratio is **3.26:1** (FAIL); on slate-100 (rgb(241,245,249)) it is **2.98:1** (FAIL); on slate-150 (rgb(233,237,242)) it is **2.78:1** (FAIL). All three fail AA for normal text. Specific affected elements include NavLink Button active states (variant `Active`, id `pGYUAc7r3`), Outline Button icon/text color when primary-tinted, and any inline link styled with the Primary color.
Evidence: - Computed ratios (script `/home/z/my-project/scripts/contrast-calc.js`):
  - Primary on White: 3.26:1 (FAIL)
  - Primary on slate-100: 2.98:1 (FAIL)
  - Primary on slate-150: 2.78:1 (FAIL)
- `Primary` token RGB: rgb(0,144,255) from `exploration.json`.
Recommended Fix: When using Primary as a text color, switch to `Secondary` (rgb(0,53,255)) which yields 7.11:1 on White (AAA). Or introduce a `Primary-700` darker variant for text use. Keep `Primary` for fills/borders only.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-2)

---

## TV-141 — White text on Accent Cyan / Accent Cyan Light / Accent Blue fails AA
Status: Open
Category: Accessibility & compliance
Severity: High
Location: Site-wide — anywhere White text renders on Accent Cyan (rgb(22,207,240)), Accent Cyan Light (rgb(40,215,235)), or Accent Blue (rgb(46,150,255)) backgrounds
Description: The accent cyan/blue colors are used for highlights, badges, and possibly button hovers. White text on these backgrounds fails AA contrast dramatically:
- White on Accent Cyan (rgb(22,207,240)) = **1.87:1** (FAIL)
- White on Accent Cyan Light (rgb(40,215,235)) = **1.75:1** (FAIL)
- White on Accent Blue (rgb(46,150,255)) = **3.03:1** (FAIL, just below 3:1 large-text threshold too)
For accent backgrounds, Black text passes well (12.01:1, 11.22:1 — both AAA), and slate-800 passes (8.36:1, 7.81:1, 4.82:1).
Evidence: - Computed ratios from `/home/z/my-project/scripts/contrast-calc.js`.
- Color tokens from `exploration.json`: Accent Cyan id `c2084445-87f5-4541-ab89-7abcfb28c705`; Accent Cyan Light id `9f147233-fc32-4c9a-b901-2ae484ba3f12`; Accent Blue id `a5190ff7-1adb-40b1-a61f-20751972cd6e`.
Recommended Fix: When using accent cyan/blue as a background, pair with Black or slate-800 text — never White. Add a lint rule or note in the brand guide.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-3)

---

## TV-142 — Form placeholder color fails AA contrast (≈3.0:1)
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/contact` form (`j4M3q_1v6`) — all 5 inputs (`dUSaG0CMx`, `XfuoGpmoo`, `JlTOdKvZx`, `GBe2pGN2l`, `EotCJ5jxi`); also any other place using `Placeholder Text` token (rgb(153,153,153))
Description: All five contact-form inputs use placeholder text colored `rgb(144,161,185)` (the `formInputPlaceholderColor` attribute, falling back to `Placeholder Text` token rgb(153,153,153)). Computed against the White input background:
- `rgb(144,161,185)` on White ≈ **3.0:1** (FAIL — needs 4.5:1 for normal text)
- `rgb(153,153,153)` (Placeholder Text token) on White = **2.85:1** (FAIL)
Placeholder text is treated as real text by WCAG 2.1 (it conveys input purpose before focus), so it must meet 4.5:1. Combined with TV-8-9 (placeholders are the only label), this means contact-form users see low-contrast, disappearing labels.
Evidence: Corrected contrast ratio: rgb(144,161,185) on White = 2.63:1 (originally claimed ~3.0:1). FAIL verdict unchanged.

Original evidence (superseded):
- `FormPlainTextInputNode` id `dUSaG0CMx` attributes: `formInputPlaceholderColor: "var(--token-287a1d8c-70b8-404c-85b9-1eb556d27f31, rgb(144, 161, 185))"`, `formInputPlaceholder: "Name *"`, `fontSize: "16px"` (normal-size text).
- Same attribute pattern on all 5 inputs (`XfuoGpmoo`, `JlTOdKvZx`, `GBe2pGN2l`, `EotCJ5jxi`).
- Screenshot of contact form: https://framerusercontent.com/screenshots/on-demand/78126ff5-edd6-498a-aabf-b200e34aa4b9.jpg
- Screenshot of full /contact page: https://framerusercontent.com/screenshots/on-demand/a4bdebe9-4ecd-442b-9925-ee296e2f9d68.jpg
Recommended Fix: Either (a) darken the placeholder color to ≥`rgb(99,116,140)` (slate-500 → ~4.5:1) and add a persistent visible label above each field (preferred — see TV-8-9), or (b) replace placeholder-as-label pattern with floating labels that meet 4.5:1 in both states.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-4)
Reviewer note: Evidence corrected per reviewer.

---

## TV-143 — FAQ item component lacks `<button>`, `aria-expanded`, `aria-controls`, `role=region`
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `Elements/FAQ item` component master (`xUmE2HP3j`) — used on home page FAQ section (`VD4u7vQTO`) and /contact FAQ section (`x51Gl85oP`). 6 variants: FAQ Open, FAQ Closed, Touch Open, Touch Closed, etc.
Description: The FAQ item component uses 4 visual variants (Open/Closed × Mouse/Touch) to communicate expand/collapse state, but the question trigger is a plain `FrameNode` (id `DdXd01hW5`) with NO `<button>` semantic tag, NO `role="button"`, NO `tabIndex`, NO `aria-expanded`, and NO `aria-controls`. The answer panel (id `FlltBZKCA`) has NO `role="region"` and NO `aria-labelledby` pairing to the question. The "Heading" RichTextNode inside Question has no semantic tag (defaults to `<p>`). As a result:
- Keyboard users cannot focus or activate the accordion.
- Screen reader users get no indication of expand/collapse state.
- The question/answer programmatic association is missing.
This is a WCAG 2.1 AA failure under 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value), and 4.1.3 (Status Messages).
Evidence: - FAQ item master id `xUmE2HP3j`, deep-walk output in `/tmp/components-deep.txt` lines ~250-290.
- Variant `FAQ Open` root FrameNode id `P3ysYJ8v6` — no `htmlTag`, no `role`, no `tabIndex`, no `aria-*` attributes.
- Question frame id `DdXd01hW5` — no semantic attrs.
- Answer frame id `FlltBZKCA` — no `role="region"`, no `aria-labelledby`.
- FAQAccordion.tsx code file (id `dRQ_68D`) is EMPTY (content length 0) — see TV-8-13.
- Screenshot of home FAQ item instance (`vDurgGFHd`): https://framerusercontent.com/screenshots/on-demand/ccf01483-17df-4135-a285-533607e50b30.jpg
Recommended Fix: Restructure the FAQ item so the Question trigger is a `<button>` with `aria-expanded={isOpen}` and `aria-controls={answerId}`, and the Answer panel has `role="region"` + `aria-labelledby={questionId}` + `id={answerId}`. Toggle visibility on click/Enter/Space. Or replace the native FAQ item with a working `FAQAccordion.tsx` code component (currently empty — see TV-8-13).
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-5)

---

## TV-144 — Nav Dropdown component lacks all ARIA semantics (`aria-haspopup`, `aria-expanded`, `aria-controls`)
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `Navigation/Nav Dropdown` component master (`hc6IgBhgF`) — used in Header component (`AZd_vmoUt`) for mobile menu (variants: Default, Mid, End, Mid Back)
Description: The Nav Dropdown component has 4 variants but none of the frames carry any semantic htmlTag or ARIA attributes. The "Menu Button" trigger (id `ESdgkQuvA`) is a plain `FrameNode` with no `<button>` tag, no `aria-haspopup="menu"`, no `aria-expanded`, and no `aria-controls`. The "Dropdown" content panel (id `jxjLrDog_`) is a plain `FrameNode` with no `role="menu"`, no `role="dialog"`, no `aria-modal`. The 4 nav links inside ("Services", "About US", "Blog", "Contact Us") are ComponentInstanceNodes with no `role="menuitem"`. This means:
- Mobile menu cannot be opened via keyboard.
- Screen reader users get no announcement of menu open/close state.
- Focus is not trapped within the menu when open.
Evidence: - Nav Dropdown master id `hc6IgBhgF`, deep-walk output in `/tmp/components-deep.txt` lines ~210-249.
- Variant `Default` root FrameNode id `eJIxZkfZQ` — no htmlTag, no role, no aria-* attrs.
- "Menu Button" frame id `ESdgkQuvA` — no semantic attrs.
- "Dropdown" frame id `jxjLrDog_` — no semantic attrs.
Recommended Fix: Add `htmlTag="button"` + `aria-haspopup="menu"` + `aria-expanded` (variable) to the Menu Button frame. Add `role="menu"` to the Dropdown frame. Add `role="menuitem"` to each nav link. Implement focus trapping and Escape-to-close. Alternatively, replace with a code component that handles these correctly.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-6)

---

## TV-145 — HamburgerMenu.tsx hides checkbox with `display: none` — invisible to keyboard & screen readers
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `Workshop/HamburgerMenu.tsx` (code component id `kCxujKn:default`) — used in Header mobile/tablet breakpoints
Description: The HamburgerMenu code component implements its toggle as `<input type="checkbox" style={{ display: "none" }} aria-label="Toggle menu">`. Setting `display: none` on a checkbox removes it from the accessibility tree AND from the tab order — so keyboard users cannot focus or toggle it, and screen readers skip it entirely. The visible SVG animation is on the `<label>`, but the label's only association with the input is via DOM nesting — once the input is `display: none`, the label has no actionable target. Additionally, there is no `aria-expanded` (the checkbox pattern is wrong for a menu toggle — should be a button with `aria-expanded`).
Evidence: - Full source at `/tmp/code-full.txt` lines ~104-115:
  ```tsx
  <input
      type="checkbox"
      checked={isChecked}
      onChange={handleChange}
      style={{ display: "none" }}
      aria-label="Toggle menu"
  />
  ```
- File: `Workshop/HamburgerMenu.tsx`, id `kCxujKn`, content length 3849 bytes.
Recommended Fix: Replace the `<input type="checkbox">` pattern with a `<button aria-expanded={isChecked} aria-controls={menuId} aria-label="Toggle menu">`. The button should be visible/focusable. Add a visible `:focus-visible` outline. OR, if keeping the checkbox pattern, use `sr-only` (position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0) instead of `display: none`.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-7)

---

## TV-146 — Primary Button nests `<button>` inside `<a>` (invalid HTML)
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `Buttons/Primary Button` component master (`ARbK0E6gq`) — all 12 variants: Button (×3), Loading, Solid (×4), Solid Loading, Disabled, Disabled Small, Success, Success Small, Error, Error Small
Description: Every variant of Primary Button has both `htmlTag="button"` AND a `link` attribute (e.g. `link={"href":"var(--variable-w2CURmc1u)","openInNewTab":"var(--variable-uSFrNpa9a)"}`). When Framer renders this, the result is invalid HTML — either `<a><button>…</button></a>` (button inside anchor) or `<button onclick="location.href=…">` (button acting as link). Both patterns are prohibited by the HTML spec (interactive elements cannot nest) and cause screen-reader inconsistencies. Additionally:
- The "Disabled" variant has no `disabled` HTML attribute — only a visual variant.
- The "Loading" / "Solid Loading" variants have no `aria-busy="true"`.
- The "Success" / "Error" variants change the text to "Message Sent Successfully" / "something went wrong" but don't use `role="status"` or `aria-live="polite"` to announce the change to AT users.
Evidence: - Primary Button master id `ARbK0E6gq`, deep-walk output in `/tmp/components-deep.txt` lines ~290-460.
- Variant `Button` frame id `s0zHOdlkz` — `htmlTag="button"`, `link={"href":"var(--variable-w2CURmc1u)",...}`.
- Variant `Disabled` id `nFlcyuxoA` — no `disabled` attribute visible.
- Variant `Loading` id `QP_bKwhNI` — no `aria-busy`.
- Variant `Success` id `t9QapcGr2` — text "Message Sent Successfully" (hardcoded), no `role="status"`.
- Variant `Error` id `UtTeA07jz` — text "something went wrong" (hardcoded, lowercase), no `role="alert"`.
Recommended Fix: Decide whether the Primary Button is a link or a button. If link: use `htmlTag="a"` (or omit htmlTag and rely on Framer's link rendering). If button (form submit): remove the `link` attribute and add `type="submit"` or `type="button"`. For Disabled variant, add `disabled=true`. For Loading, add `aria-busy="true"` and `disabled=true`. For Success/Error, wrap text in `<span role="status" aria-live="polite">` (Success) or `<span role="alert">` (Error).
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-8)

---

## TV-147 — /booking page has NO native form inputs — entire booking flow is a third-party Cal.com embed
Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/booking` page — "Booking Modal" section (`tSmCqITJd`), "Cal Booking" ComponentInstance (`O2N4dsp87`)
Description: The /booking page is described as "conversion-critical" in the briefing, but it contains zero native form inputs. The "Booking Modal" section (`tSmCqITJd`) contains only:
- A "Title" RichTextNode with text "Book an Appointment"
- A "Back Button" ComponentInstance (`qO44GR49V`)
- A "Cal Booking" ComponentInstance (`O2N4dsp87`)

The Cal Booking instance is an Embed external component (`$componentDisplayName: "Embed"`) that injects a Cal.com scheduling widget via inline JavaScript:
```html
<div style="width:100%;height:100%;overflow:scroll" id="my-cal-inline-in-clinic-vet-appointment"></div>
<script type="text/javascript">
  (function (C, A, L) { ... })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", "in-clinic-vet-appointment", {origin:"https://app.cal.com"});
  ...
</script>
```
Evidence: - /booking Booking Modal section id `tSmCqITJd`, deep-walk in `/tmp/forms-deep.txt`:
  ```
  FrameNode name="Booking Modal" <section> id="booking" id=tSmCqITJd
    FrameNode name="Header" id=IBjN212M7
      RichTextNode name="Title" id=ZebPjet9v
        TextBlock name="" tag=p id=v:ZebPjet9v:0
          TextRun name="" text="Book an Appointment" id=v:ZebPjet9v:0:0
      ComponentInstanceNode name="Back Button" id=qO44GR49V
    ComponentInstanceNode name="Cal Booking" id=O2N4dsp87
  ```
- Cal Booking node `$componentDisplayName: "Embed"`, `$control__type: "HTML"`, full HTML embed code in `/tmp/code-comp-search.txt`.
- `getNodesOfTypes({types:["FormPlainTextInputNode","FormTextAreaNode","FormSubmitButtonNode","FormNode","InputNode","TextAreaNode"]}, {pagePath:"/booking"})` returned **0 results**.
- Screenshot of booking page full: https://framerusercontent.com/screenshots/on-demand/eb658b77-3fdf-4f07-9490-4d91686ac089.jpg
- Screenshot of booking modal section: https://framerusercontent.com/screenshots/on-demand/97a945d8-f84f-4b20-8d33-e8c432cbf820.jpg
Recommended Fix: (1) Add `aria-label="Appointment booking widget"` (or similar) to the wrapper div. (2) Provide a fallback link `If the booking widget doesn't load, <a href="tel:123-456-7890">call us</a> or <a href="mailto:hello@vetly.com">email us</a>.`. (3) Add a visible heading inside the section (the existing "Book an Appointment" title is a `<p>` — change to `<h1>` so it appears in document outline). (4) Test the Cal.com embed with screen readers + keyboard to confirm it's operable; if not, consider replacing with a native form. (5) Coordinate with sub-agent 5 (forms/conversion) and sub-agent 7 (SEO) — note this is also a no-indexed conversion blocker.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-10)

---

## TV-148 — Home page heading hierarchy skips from H1 to H6 (H6 misused for stat number)
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Home page `/` desktop breakpoint — Hero section (`LQn3zLbUg`)
Description: The home page heading order (from desktop breakpoint deep walk) is:
1. H1 "Better Care for Your Pet, Without the Stress" (hero title) — id `v:lZAuLjbAX:0`
2. H6 "20K+" (a stat number) — id `v:YZO0DkLpt:0`  ← **skips H2, H3, H4, H5**
3. H2 "Personalized Care for Your Pet"
4. H2 "Why Choose Vetly"
5. H2 "The Vetly Care Team"
6. H2 "What our clients say"
7. H2 "Visit Our Veterinary Clinic, Location & Hours"
8. H3 "Vetly Veterinary Clinic"
9. H3 "Hours of Operation"
10. H2 "Got Questions? We've Got Answers"
11. H3 "Have Questions? We're Here to Help!"
12. H2 "Pet Health Tips & Veterinary Blog"

The H6 is being used as a visual style for the "20K+" stat number — this is a semantic misuse. Stat numbers are not headings; they should be styled text inside a `<p>` or a `<dt>`/`<dd>` pair, not a heading. The skip from H1 to H6 also violates WCAG 2.4.6 (Headings and Labels) and is a Common Failures F43 pattern.
Evidence: - Full heading list from `/tmp/home-deep.txt` (serialize depth=20 of home desktop breakpoint `WQLkyLRf1`).
- H6 "20K+" TextBlock id `v:YZO0DkLpt:0`, depth 9, inside Hero section.
- Screenshot of home hero: https://framerusercontent.com/screenshots/on-demand/78b89967-b826-4592-a85c-859a922bd4bb.jpg
Recommended Fix: Change the H6 stat number to a `<p>` (or `<div role="text">`), or use a `<data>` element with appropriate styling. Ensure the first heading after the H1 is an H2.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-11)

---

## TV-149 — Logo images use image-fill on FrameNodes — no `alt` attribute possible
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Header component (`AZd_vmoUt`) — Logo Image frame (`EgEOGkbpb`); Footer component (`Xx2RpZ5pV`) — Logo frame (`eY3NqxR_c`)
Description: The Vetly logo appears in both the Header (top-left, links to `/#home`) and Footer (bottom-left, links to `/`). In both cases the logo is rendered as a FrameNode with an image fill (`fill: "url(...)"` or `fill: "https://..."`), NOT as an ImageNode. Framer's `ImageNode` type supports an `alt` attribute, but a FrameNode with an image fill does not — there is no way to set `alt` on the logo. The logo is a meaningful image (it's the brand identifier and is wrapped in a link), so it must have an accessible name. Currently the link's accessible name comes from... nothing visible — the link's text content is empty (verified by deep-walk: the Logo frame contains only "Logo Image" frame with image-fill, no text siblings).
Additionally, the same pattern affects:
- Hero Background "Noise" frame (`W166wnt5m`) — image-fill, no alt
- Blog Card "image" frame (`e7j7pmrGf`) — image-fill, no alt
- Team Card avatar (inside `T6DVfhsAL` component)
- Testimonial Card "Author image" frame (`uujBwKvM5`) — image-fill, no alt
- Footer leftover asset "IMG 20250915_105006_935" (`hL1V1p34z`) — image-fill, no alt
Evidence: - Header Logo Image frame id `EgEOGkbpb` (deep-walk `/tmp/components-deep.txt` line ~10): `FrameNode name="Logo Image" [image-fill] id=EgEOGkbpb`. No `alt` attribute (FrameNode type doesn't support it).
- Footer Logo frame id `eY3NqxR_c`: same pattern.
- 0 ImageNodes returned on home page (`getNodesOfTypes({types:["ImageNode"]}, {pagePath:"/"})` returned empty array).
- All site images use image-fills on FrameNodes or are inside ComponentInstances that don't expose alt attributes.
- The ImageReveal code component (`hZwaqDB`) is the ONLY place where alt text is handled correctly (see TV-8-14).
Recommended Fix: Convert logo image-fills to `ImageNode` type with descriptive `alt="Vetly logo"` (Header) / `alt="Vetly logo"` (Footer). For purely decorative images (Hero Background Noise, accent gradients), either keep as image-fill (decorative — but then ensure surrounding text gives context) or use `alt=""` on an ImageNode. For content images (Blog Card image, Team avatar, Testimonial author image), convert to ImageNode and provide meaningful alt text per instance (e.g., "Dr. Jane Smith, DVM" for team avatar, "Article cover image: [article title]" for Blog Card).
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-12)

---

## TV-150 — FAQAccordion.tsx code file is empty (0 bytes)
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Code component `FAQAccordion.tsx` (file id `dRQ_68D`)
Description: The `FAQAccordion.tsx` code file exists in the project (returned by `framer.getCodeFiles()`) but its `content` is an empty string (length 0). It has no `exports` array. This means:
- The code component was either never written, was deleted, or was emptied.
- It cannot render anything if instantiated on the canvas.
- The native `Elements/FAQ item` component (`xUmE2HP3j`) is being used instead (and that has its own a11y issues — see TV-8-5).
- The empty file may cause TypeScript/SSR errors when the project is built.
Evidence: - `framer.getCodeFiles()` returned 4 CodeFile instances. Index 0:
  ```
  name: FAQAccordion.tsx
  path: FAQAccordion.tsx
  id: dRQ_68D
  content length: 0
  content preview: (empty)
  exports: []
  ```
- Full output in `/tmp/code-source.txt` and `/tmp/code-full.txt`.
Recommended Fix: Either (a) delete the empty file (use `codeFile.remove()` after confirming no instances reference it), or (b) implement the FAQAccordion properly — it should render a button-triggered accordion with `aria-expanded`, `aria-controls`, `role="region"`, keyboard support for Enter/Space, and visible focus states. Coordinate with sub-agent 11 (code components) for the implementation.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-13)

---

## TV-151 — ImageReveal code component handles alt text correctly (positive finding + minor fallback issue)
Status: Open
Category: Accessibility & compliance
Severity: Low
Location: `Workshop/ImageReveal.tsx` code component (file id `hZwaqDB:default`)
Description: Unlike the rest of the project (see TV-8-12), the ImageReveal code component correctly handles image alt text. It accepts an `image` prop of type `ResponsiveImageLike { src; srcSet?; alt? }`, sets `alt={image?.alt || "Image"}` on the rendered `<img>`, and ALSO sets `aria-label={image?.alt || "Image"}` + `role="img"` on the container `<div>` (defensive belt-and-suspenders approach). This is the only image-rendering code in the project that does this correctly.
Evidence: - Source file `/tmp/code-full.txt` lines ~660-790, including:
  ```tsx
  <div ref={ref} style={containerStyles}
       aria-label={image?.alt || "Image"}
       role="img">
    ...
    <img src={image?.src} srcSet={image?.srcSet}
         alt={image?.alt || "Image"}
         style={imageStyles} draggable={false} />
  ```
- File: `Workshop/ImageReveal.tsx`, id `hZwaqDB`, content length 23000 bytes.
Recommended Fix: Change fallback from `"Image"` to `""` (empty string) — empty alt is the WCAG-compliant way to mark an image as decorative when no description is available. Optionally add a `console.warn` in dev mode: `if (!image?.alt) console.warn("ImageReveal: image.alt is missing — screen readers will treat this image as decorative")`.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-14)

---

## TV-152 — 4 icon-only links on home page have `text=""` and no `aria-label`
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Home page `/` desktop breakpoint — 4 link-bearing FrameNodes
Description: The home page has 4 link-bearing FrameNodes (each is a plain Frame with `attributes.link` set), and all 4 have `text=""` (no link text). They are icon-only links (icons rendered as children) but lack any `aria-label`:
1. `x04nOnv9l` — `link={"href":"/services/:slug#main","collectionItem":"var(--variable-Okr5FKpOz)","smoothScroll":true}` — no text, no aria-label
2. `VPYYSAUfF` — `link={"href":"tel:123-456-7890","openInNewTab":true}` — no text, no aria-label
3. `A8RUpI2OU` — `link={"href":"mailto:hello@vetly.com","openInNewTab":true}` — no text, no aria-label
4. `z5mBQJTah` — `link={"href":"https://maps.app.goo.gl/Kpuck5D6y93QvdJs7","openInNewTab":true}` — no text, no aria-label

These are likely the "click to call", "email us", "get directions", and "view service details" icon buttons in the Location & Hours section. Without `aria-label`, screen readers announce them as "link" with no destination — completely unusable for AT users. WCAG 2.4.4 (Link Purpose) and 4.1.2 (Name, Role, Value) violations.
Evidence: - Deep-walk output `/tmp/home-deep.txt` lines 12-17:
  ```
  link={"href":"/services/:slug#main",...}  text=""  id=x04nOnv9l  type=FrameNode
  link={"href":"tel:123-456-7890","openInNewTab":true}  text=""  id=VPYYSAUfF  type=FrameNode
  link={"href":"mailto:hello@vetly.com","openInNewTab":true}  text=""  id=A8RUpI2OU  type=FrameNode
  link={"href":"https://maps.app.goo.gl/Kpuck5D6y93QvdJs7","openInNewTab":true}  text=""  id=z5mBQJTah  type=FrameNode
  ```
- Screenshot of home page full: https://framerusercontent.com/screenshots/on-demand/0f85a4a3-3c32-40ce-ab12-668f7e293f72.jpg
Recommended Fix: Add `aria-label` to each link, e.g., `aria-label="View service details"`, `aria-label="Call us at 123-456-7890"`, `aria-label="Email us at hello@vetly.com"`, `aria-label="Open clinic location in Google Maps"`. Also replace the placeholder phone number `123-456-7890` with the real clinic phone number.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-16)

---

## TV-153 — NavLink Button has no `aria-current="page"` on Active variant
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `Buttons/NavLink Button` component master (`gUM1o8Yyz`) — `Active` variant (`pGYUAc7r3`); also `Navigation/Nav Bar` (`bTXu1FqyY`) — 5 "Active" variants (Home Active, Services Active, About Active, Blog Active, Contact Active)
Description: The Nav Bar component uses 6 variants to indicate the active page: Default, Home Active, Services Active, About Active, Blog Active, Contact Active. Each "Active" variant visually highlights the current page link (via a "Dot" indicator and color change), but the underlying NavLink Button instances inside don't have `aria-current="page"`. Screen reader users navigating via the `nav` landmark get no indication of which page they're currently on. WCAG 1.3.1 (Info and Relationships) and a documented ARIA Authoring Practices recommendation.
Evidence: - NavLink Button master id `gUM1o8Yyz`, deep-walk in `/tmp/components-deep.txt` lines ~660-690:
  ```
  FrameNode name="Active" [link={...}] id=pGYUAc7r3
    FrameNode name="" id=pGYUAc7r3twyut_sJo
      ComponentInstanceNode name="" id=pGYUAc7r3U8mk1XAcz
      FrameNode name="Dot" id=pGYUAc7r3qWaQAA9mQ
      RichTextNode name="" text="var(--variable-GJysiVxNg)" id=pGYUAc7r3WnN7go1xs
  ```
- No `aria-current` attribute anywhere on the NavLink Button or Nav Bar component.
- Nav Bar master id `bTXu1FqyY`, deep-walk shows 6 variants (Default, Home Active, Services Active, About Active, Blog Active, Contact Active) — none with aria-current.
Recommended Fix: Pass the active state through a variable and conditionally set `aria-current="page"` on the NavLink Button instance. In Framer, this means using a boolean control `isActive` and applying `aria-current={isActive ? "page" : undefined}`. Coordinate with sub-agent 15 (Header/Footer/Nav).
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-17)

---

## TV-154 — Outline Button, Arrow Button lack `<button>` semantics
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `Buttons/Outline Button` component (`NoQy1opGY`); `Buttons/Arrow Button` component (`mEQe6u3a9`)
Description: Unlike the Primary Button (which at least has `htmlTag="button"` — see TV-8-8), the Outline Button and Arrow Button components have NO semantic htmlTag at all:

- **Outline Button** (`NoQy1opGY`): each variant (`Outline`, ×3) is a plain FrameNode with `link` attribute but no `<button>` or `<a>` tag. The frame contains 2 IconNodes + 1 RichTextNode. When Framer renders this, it likely becomes a `<div>` with a click handler — not keyboard-focusable, not announced as a link/button by screen readers.

- **Arrow Button** (`mEQe6u3a9`): each variant (Variant 1, Variant 2) is a plain FrameNode with NO link attribute AND NO htmlTag. Just 2 IconNodes. This is presumably used for carousel prev/next or "scroll to top" buttons. It's not keyboard-focusable at all — keyboard users cannot operate it.

Both fail WCAG 2.1.1 (Keyboard) and 4.1.2 (Name, Role, Value).
Evidence: - Outline Button master id `NoQy1opGY`, deep-walk in `/tmp/components-deep.txt` lines ~640-655:
  ```
  FrameNode name="Outline" [link={...}] id=g9O186Ri0    ← no htmlTag
    IconNode name="Icon" id=t9TOQ0sBl
    RichTextNode name="Text" text="var(--variable-g1fUiyBNP)" id=ltmlfV07P
    IconNode name="Icon" id=LuNled3aD
  ```
- Arrow Button master id `mEQe6u3a9`, deep-walk in `/tmp/components-deep.txt` lines ~658-665:
  ```
  FrameNode name="Variant 1" id=TNH7J0Qb0    ← no htmlTag, no link
    IconNode name="" id=WhDbBTBpt
    IconNode name="" id=b9V2jtjQ7
  ```
Recommended Fix: (1) Outline Button: add `htmlTag="a"` (since it has a link) OR `htmlTag="button"` if used for in-page actions. Ensure the RichTextNode "Text" is the accessible name. (2) Arrow Button: add `htmlTag="button"`, add `type="button"`, add `aria-label` (e.g., "Previous slide" / "Next slide" / "Scroll to top"). Make focusable via `tabIndex="0"` if htmlTag can't be set.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-18)

---

## TV-155 — BackButton.tsx has no `type="button"`, no `:focus` styles, SVG not `aria-hidden`
Status: Open
Category: Accessibility & compliance
Severity: Low
Location: `BackButton.tsx` code component (file id `tVVtI8x:default`) — used on `/booking` page (`qO44GR49V`)
Description: The BackButton code component is mostly accessible — it uses a `<button>` element and has `aria-label="Go back"`. However, three minor issues:
1. **No `type="button"` attribute** on the `<button>`. Inside a `<form>`, the default button type is `submit` — clicking the back button would accidentally submit any surrounding form. The /contact form is on a different page so this doesn't currently cause a bug, but it's a footgun if BackButton is ever placed inside a form.
2. **No `:focus` or `:focus-visible` styles** — only `:hover` background change is implemented (via `onMouseEnter`/`onMouseLeave`). Keyboard users see no visible focus indicator. WCAG 2.4.7 (Focus Visible) violation.
3. **SVG icon not marked `aria-hidden="true"`** — the parent button has `aria-label="Go back"`, but the SVG is still in the accessibility tree. Some screen readers may announce the SVG path data or duplicate the button label. Best practice: mark decorative SVGs with `aria-hidden="true"`.
Evidence: - Full source in `/tmp/code-full.txt` lines ~37-130, including:
  ```tsx
  return (
      <button onClick={handleClick}
          style={{ ... transition: "background-color 0.2s ease", ... }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverBackgroundColor }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = backgroundColor }}
          aria-label="Go back"
      >
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
               stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
      </button>
  )
  ```
- File: `BackButton.tsx`, id `tVVtI8x`, content length 3456 bytes.
- No `type="button"`, no `onFocus`/`onBlur`, no `aria-hidden` on SVG.
Recommended Fix: Add `type="button"`, add `onFocus`/`onBlur` handlers (or CSS `:focus-visible` outline), add `aria-hidden="true"` to the SVG. Coordinate with sub-agent 11 (code components).
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-19)

---

## TV-156 — No `aria-label` on Header `<header>` or Nav Bar `<nav>` landmarks
Status: Open
Category: Accessibility & compliance
Severity: Low
Location: Header component (`AZd_vmoUt`) — Desktop variant (`PP5wyjmXI`); Nav Bar component (`bTXu1FqyY`) — Default variant (`GBHKk2wfg`)
Description: The Header and Nav Bar components correctly use `<header>` and `<nav>` semantic htmlTags, but neither has an `aria-label` to distinguish it from other landmarks. While the site currently has only one `<header>` and one `<nav>` per page, the Footer component (TV-8-15) should also have `<nav>` for its 3 link groups — once those are added, there will be 4 `<nav>` elements on a page with no way for screen reader users to distinguish them ("Main", "Footer Navigate", "Footer Socials", "Footer Legal"). Adding `aria-label="Main"` to the primary nav and `aria-label="Site header"` to the header now future-proofs the markup.
Evidence: - Header Desktop variant id `PP5wyjmXI` — `htmlTag="header"`, no `aria-label` (verified in `/tmp/components-deep.txt` line ~5).
- Nav Bar Default variant id `GBHKk2wfg` — `htmlTag="nav"`, no `aria-label` (verified in `/tmp/components-deep.txt` line ~135).
Recommended Fix: Add `aria-label="Main"` to the Nav Bar's `<nav>` element. Add `aria-label="Site header"` to the Header's `<header>` element. When adding footer navs (per TV-8-15), use `aria-label="Footer navigation"`, `aria-label="Footer social links"`, `aria-label="Footer legal links"`.
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-20)

---

## TV-157 — "Learn More" link text on Service Card is non-descriptive
Status: Open
Category: Accessibility & compliance
Severity: Low
Location: `Cards/Service Card` component (`ecHzMZLnH`) — Action Text RichTextNode (`IpoVjtnXJ`) — hardcoded text "Learn More"
Description: Each Service Card ends with a "Learn More" action. The text is hardcoded as `"Learn More"` (verified in the component master). When a screen reader user pulls up the links list on /services or the home page Services section, they hear "Learn More, Learn More, Learn More, Learn More…" with no context for what each link leads to. WCAG 2.4.4 (Link Purpose) and 2.4.9 (Link Purpose, Link Only) — links should be descriptive when read out of context.
Evidence: - Service Card master id `ecHzMZLnH`, deep-walk in `/tmp/components-deep.txt` lines ~685-705:
  ```
  FrameNode name="Action Button" id=h26xb6cck    ← no htmlTag, no link
    RichTextNode name="Action Text" id=IpoVjtnXJ
      TextBlock name="" tag=p id=v:IpoVjtnXJ:0
        TextRun name="" text="Learn More" id=v:IpoVjtnXJ:0:0
    IconNode name="Action Icon" id=wWdN5KYBh
  ```
- The same "Learn More" text is repeated identically in both Default variants of the Service Card.
Recommended Fix: (1) Make the entire Service Card a link (`htmlTag="a"` on the outer frame, with `link={"href":"/services/:slug"}` from CMS variable), OR wrap the "Action Button" in `<a>` and add `aria-label="Learn more about {service name}"`. (2) Either change the visible text to something specific like "View {Service Name}" (using the CMS variable for the service name) OR keep "Learn More" but add `aria-label="Learn more about {Service Name}"`. Coordinate with sub-agent 2 (services pages) and sub-agent 10 (native components).
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-21)

---

## TV-158 — Blog Card nests a "More Button" link inside an outer link — invalid HTML
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `Cards/Blog Card` component (`EiCUZ0sVC`) — all variants (Default ×2, Overlay ×2, horizontal Small ×2, horizontal Big ×2)
Description: Every Blog Card variant has a `link` attribute on the OUTER frame (e.g., `link={"href":"var(--variable-q4ecqPYbc)","openInNewTab":true,"smoothScroll":true}`), making the entire card a link. Inside the card, the "Footer Details" frame contains a "More Button" ComponentInstance (`YReqAm_89`) — which is presumably ALSO a link. This creates the invalid HTML pattern of `<a>` inside `<a>` (nested anchors), which is prohibited by the HTML spec. Browsers handle this inconsistently — some render only the outer link, some only the inner, some both with broken focus order. Screen readers may announce the inner link twice or skip it entirely.
Evidence: - Blog Card master id `EiCUZ0sVC`, deep-walk in `/tmp/components-deep.txt` lines ~708-780:
  ```
  FrameNode name="Default" [link={"href":"var(--variable-q4ecqPYbc)",...}] id=OSZXw3DUH    ← outer link
    FrameNode name="Wrapper" id=MipwrL1WH
      FrameNode name="image" id=e7j7pmrGf    ← no alt (FrameNode with image-fill)
    FrameNode name="Blog Content" id=X1lnHu5ar
      FrameNode name="Footer Details" id=x332lynKd
        ComponentInstanceNode name="More Button" id=YReqAm_89    ← inner interactive element
  ```
- Only `horizontal Small` variant has `tag="h3"` on Title; other 6 variants have no tag (default `<p>`).
Recommended Fix: (1) Either remove the link from the outer Blog Card frame and make only the "More Button" a link, OR keep the outer link and remove the "More Button" entirely (replace with a stretched-link overlay pattern: an absolutely-positioned `<a>` covering the whole card, with `aria-label="Read more: {blog title}"`). (2) Convert the "image" frame to ImageNode with `alt="Article cover image: {blog title}"`. (3) Set `tag="h3"` on the Title RichTextNode in all 7 variants. Coordinate with sub-agent 3 (blog pages) and sub-agent 10 (native components).
Confidence: High
Discovered by: sub-agent 8, session TV

--- (originally TV-8-22)

---

## TV-159 — Hero Background image is a FrameNode with image-fill; no alt text and no semantic context
Status: Open
Category: Accessibility & compliance
Severity: Low
Location: Home page `/` desktop breakpoint — Hero Background frame (`TocZhBlOF`), specifically the "Noise" subframe (`W166wnt5m`) and "BG" frame (`nJskpAwXO`)
Description: The home page hero has a complex decorative background built from gradient ellipses, a vertical grid, and an image-filled "Noise" frame. These are all rendered as FrameNodes with image-fills (no ImageNode, no alt). For purely decorative backgrounds this is acceptable — but the "Noise" frame uses an actual image (URL fill), and if it conveys any texture or context (e.g., a pet photo overlay), it should have alt text or be marked decorative with `alt=""`.

Currently the Hero Background sits behind the Hero section's H1 "Better Care for Your Pet, Without the Stress" — so the H1 provides context for the hero. The background is likely purely decorative. But because there's no explicit `alt=""`, screen readers may still try to announce the image as "image" if it's in the accessibility tree (Framer may or may not expose image-fill frames to AT depending on rendering).
Evidence: - Hero Background deep-walk in `/tmp/home-components.txt` lines ~16-50:
  ```
  FrameNode name="Hero Background" id=TocZhBlOF
    FrameNode name="Gradient Mask" id=V5nApHoTz
      FrameNode name="Right Glow" id=Dyxn3i78f
        ...
      FrameNode name="Vertical Grid" id=iQO4mKg5u
        ...
      FrameNode name="BG" id=nJskpAwXO
      FrameNode name="Noise" [image-fill] id=W166wnt5m    ← image fill, no alt
      ComponentInstanceNode name="Sparkles" id=zy6COpPDa
  ```
- Screenshot of home hero section: https://framerusercontent.com/screenshots/on-demand/78b89967-b826-4592-a85c-859a922bd4bb.jpg
Recommended Fix: Confirm the "Noise" image is purely decorative. If yes, convert to ImageNode with `alt=""` (explicitly marks as decorative — best practice). If it conveys content (e.g., a subtle pet silhouette), provide meaningful alt text. Same for the "BG" frame. Coordinate with sub-agent 1 (home page) and sub-agent 9 (visual design).
Confidence: Medium
Discovered by: sub-agent 8, session TV

--- (originally TV-8-23)

---

## TV-160 — Heading hierarchy not verified on remaining pages (probe inconclusive)
Status: Open
Category: Accessibility & compliance
Severity: Low
Location: All pages except `/`, `/booking`, `/contact` — heading hierarchy not fully verified
Description: I verified the home page heading hierarchy (TV-8-11) by serializing the desktop breakpoint. For /booking and /contact I confirmed the heading distribution (H1, H2, H3 present) via the desktop tree walk. However, for /services, /about, /blog, /privacy-policy, /terms-of-service, /404, /brand-guide, /documentation, I attempted `getNodesOfTypes({types:["TextBlock"]}, {pagePath})` — but the API returned identical node counts on every page (980 TextBlocks, 268 heading-tagged), suggesting the call returns nodes from the LAYOUT TEMPLATE + page content combined, not just the page. Heading content via `getNode` on virtual IDs (`v:...`) returned `null` for attributes. To verify heading hierarchy on these pages, a per-page `serialize({id: desktopBpId, depth: 20})` walk is required (the same method that worked for home). I did not have time to run this for all 8 remaining pages.
Evidence: - `/tmp/all-pages-headings.txt` shows identical counts for all pages probed.
- `getNode({id: "v:bP1_fmE8VUqS_uj9fu:0"})` returned null attributes for every virtual ID on every page.
- Home page serialize(depth=20) DID return real heading data (12 headings in document order).
Recommended Fix: For the orchestrator / Wave 2 review: run `framer.agent.serialize({id: <desktopBreakpointId>, depth: 20}, {pagePath: <path>})` for each of /services, /about, /blog, /privacy-policy, /terms-of-service, /404, /brand-guide, /documentation. Walk the tree to collect heading order. Flag any H1→H3 skips, missing H1, or multiple H1s. Specifically check legal pages (/privacy-policy, /terms-of-service) — they typically need an H1 and may have many H2/H3 for section numbering.
Confidence: Medium
Discovered by: sub-agent 8, session TV

--- (originally TV-8-24)

---

## TV-161 — Service Card title lacks heading semantic (defaults to `<p>`)
Status: Open
Category: Accessibility & compliance
Severity: Low
Location: `Cards/Service Card` component (`ecHzMZLnH`) — Title RichTextNode (`uhIRAiHL7`)
Description: The Service Card's "Title" RichTextNode has no `tag` attribute (defaults to `<p>`). On the /services listing page (12 cards) and the home page Services section (variable count), the service titles should be `<h3>` (or `<h4>` if under a section H2) to provide a navigable document outline. Currently, screen reader users cannot jump between service titles via heading navigation. The same issue affects Team Card (`T6DVfhsAL`) — the team member's name has no heading tag.
Evidence: - Service Card master id `ecHzMZLnH`, deep-walk in `/tmp/components-deep.txt` lines ~685-705:
  ```
  FrameNode name="Text Group" id=V3o7QI2A3
    RichTextNode name="Title" text="var(--variable-WIcXdi0Pz)" id=uhIRAiHL7    ← no tag attribute
    RichTextNode name="Description" text="var(--variable-ft4SJ5q3O)" id=jCt5XEsm3
  ```
- Team Card master id `T6DVfhsAL`:
  ```
  FrameNode name="Content" id=up3TSfOEn
    RichTextNode name="" text="var(--variable-tB61kQU_R)" id=qf4VamqiI    ← no tag (member name)
    RichTextNode name="" text="var(--variable-vWgHTt0YD)" id=SOPhYJVrX    ← no tag (member title)
  ```
Recommended Fix: Set `tag="h3"` on the Service Card Title RichTextNode. Set `tag="h3"` on the Team Card member name RichTextNode. Ensure the section's H2 wraps these so the hierarchy is H2 (section title) → H3 (card title). Coordinate with sub-agent 10 (native components).
Confidence: High
Discovered by: sub-agent 8, session TV

---

## Summary table

| ID | Severity | Category | Title |
|---|---|---|---|
| TV-8-1 | High | A11y | White on Primary fill fails AA (3.26:1) |
| TV-8-2 | High | A11y | Primary text on White/slate-100/slate-150 fails AA |
| TV-8-3 | High | A11y | White on Accent Cyan/Cyan Light/Blue fails AA |
| TV-8-4 | High | A11y | Form placeholder color fails AA contrast (≈3.0:1) |
| TV-8-5 | High | A11y | FAQ item lacks `<button>`, `aria-expanded`, `aria-controls`, `role=region` |
| TV-8-6 | High | A11y | Nav Dropdown lacks all ARIA semantics |
| TV-8-7 | High | A11y | HamburgerMenu.tsx hides checkbox with `display: none` |
| TV-8-8 | High | A11y | Primary Button nests `<button>` inside `<a>` (invalid HTML) |
| TV-8-9 | High | A11y | /contact form: placeholder-as-label, no visible `<label>` text, no `autocomplete`, Message field is single-line |
| TV-8-10 | High | A11y | /booking has NO native form — Cal.com embed with no fallback, no aria-label |
| TV-8-11 | Medium | A11y | Home page H1→H6 skip (H6 misused for stat number "20K+") |
| TV-8-12 | Medium | A11y | Logo images use image-fill on FrameNodes — no `alt` possible |
| TV-8-13 | Medium | Components | FAQAccordion.tsx code file is empty (0 bytes) |
| TV-8-14 | Low | A11y | ImageReveal handles alt correctly (positive); minor "Image" fallback issue |
| TV-8-15 | Medium | A11y | Footer lacks `<nav>` for link groups; subsection headings are `<p>`; leftover "404 Link" and dev asset |
| TV-8-16 | Medium | A11y | 4 icon-only links on home page have `text=""`, no `aria-label` |
| TV-8-17 | Medium | A11y | NavLink Button has no `aria-current="page"` on Active variant |
| TV-8-18 | Medium | A11y | Outline Button + Arrow Button lack `<button>` semantics |
| TV-8-19 | Low | A11y | BackButton.tsx: no `type="button"`, no `:focus` styles, SVG not `aria-hidden` |
| TV-8-20 | Low | A11y | No `aria-label` on Header `<header>` or Nav Bar `<nav>` landmarks |
| TV-8-21 | Low | A11y | "Learn More" link text non-descriptive; Service Card not actually clickable |
| TV-8-22 | Medium | A11y | Blog Card nests "More Button" link inside outer link — invalid HTML |
| TV-8-23 | Low | A11y | Hero Background "Noise" image is image-fill on FrameNode — no alt |
| TV-8-24 | Low | A11y | Heading hierarchy not verified on 8 remaining pages (probe inconclusive) |
| TV-8-25 | Low | A11y | Service Card + Team Card titles lack heading semantic (default `<p>`) |

**Total: 25 findings** — 10 High, 8 Medium, 7 Low.

**Overlap notes for orchestrator:**
- TV-8-9 (form labels) overlaps with sub-agent 5 (forms/conversion) — sub-agent 5 should own the detailed form UX; this finding covers the a11y-specific label-association angle only.
- TV-8-10 (booking page) overlaps with sub-agent 5 (conversion-critical) and sub-agent 7 (SEO) — primary owner is sub-agent 5.
- TV-8-13 (FAQAccordion.tsx empty) overlaps with sub-agent 11 (code components) — sub-agent 11 should own the code-quality angle; this finding covers the a11y implication.
- TV-8-14 (ImageReveal) overlaps with sub-agent 11 — same.
- TV-8-19 (BackButton.tsx) overlaps with sub-agent 11 — same.
- TV-8-15 (Footer nav) overlaps with sub-agent 15 (Footer/Header/Nav) — sub-agent 15 should own the structural fix; this finding covers the a11y angle.
- TV-8-17 (NavLink aria-current) overlaps with sub-agent 15 — same.
- TV-8-21 (Service Card "Learn More") overlaps with sub-agent 2 (services pages) and sub-agent 10 (native components) — sub-agent 10 should own the component fix; this finding covers the a11y angle.
- TV-8-22 (Blog Card nested links) overlaps with sub-agent 3 (blog pages) and sub-agent 10 — sub-agent 10 should own.
- TV-8-1, TV-8-2, TV-8-3 (color contrast) overlap with sub-agent 9 (visual design/branding) — sub-agent 9 owns the token decisions; this finding provides the measured WCAG impact. (originally TV-8-25)

---

## TV-162 — "Floating Trust Card" uses hardcoded translucent-white fill instead of a token
Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/` (Home), desktop breakpoint `WQLkyLRf1`. Two FrameNode instances: `GT3p3XJ8w` (name: "Floating Trust Card") and `DzayWjytl` (name: "Floating Trust Card" — likely the tablet/phone variant).
Description: The Floating Trust Card overlays on the home page set `attributes.fill = "rgba(255, 255, 255, 0.75)"` as a literal RGB string. The project's 26 color styles include a `White` token (`rgb(255, 255, 255)`) and a separate `Border Subtle` token (`rgba(255, 255, 255, 0.1)`), but no translucent-white token at 0.75 alpha. The team hardcoded the value rather than creating a new design token for "translucent white surface," which means future re-themes (e.g., dark mode, brand refresh) cannot propagate to this surface. The two instances also duplicate the literal value rather than sharing a single source of truth.
Evidence: `framer.agent.serialize({ id: "WQLkyLRf1", depth: 8 }, { pagePath: "/" })` → walk found both nodes with `attributes.fill === "rgba(255, 255, 255, 0.75)"`. Both nodes are named "Floating Trust Card", types `FrameNode`. The White token id is `219c2d29-187a-40f8-aab3-a7af9bd91f3b` (light: `rgb(255, 255, 255)`).
Recommended Fix: Either (a) replace the hardcoded fill with the existing `White` token and apply the 0.75 alpha via the node's `opacity` attribute (cleaner — keeps color in the token system), or (b) introduce a new "Surface Translucent" color token at `rgba(255, 255, 255, 0.75)` and reference it via `var(--token-<id>)` on both instances. Option (a) is preferred unless the translucent-white treatment is used in 3+ places.
Confidence: High
Discovered by: sub-agent 9, session TV

--- (originally TV-9-1)

---

## TV-163 — "Red Dot" indicator uses off-system pure red (`rgb(255, 0, 0)`)
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/` (Home), node `UMk1D8S4O` (name: "Red Dot", type: `OvalShapeNode`); `/about`, node `QefAYzUKR` (name: "Red Dot", type: `OvalShapeNode`).
Description: Two small "Red Dot" decorative ovals use a literal `rgb(255, 0, 0)` fill. The 26 color styles contain no red token — the closest accent is `Accent Cyan` / `Accent Blue` / `Primary` (blues only). Pure red is an off-system color that breaks the established palette (slate + neutral + blue accents). Likely used as a "live"/"notification" indicator dot. Without a token, the brand has no single source of truth for the "alert/active red" semantic, and any future brand refresh will miss these dots.
Evidence: `serialize` walk on Home and About returned both nodes with `attributes.fill === "rgb(255, 0, 0)"`. Screenshots: Home Red Dot — https://framerusercontent.com/screenshots/on-demand/bbca493a-252c-44a3-aab9-3318499b1f4e.jpg ; About Red Dot — https://framerusercontent.com/screenshots/on-demand/d238d9a1-da12-4774-b598-3dd7bd1c8a85.jpg . Neither value matches any of the 26 declared color style `light` values.
Recommended Fix: Decide whether "alert red" is part of the Vetly palette. If yes, add a new "Accent Red" / "Status Active" color token and reference it on both Red Dot instances. If no, replace with the existing `Primary` token (`rgb(0, 144, 255)`) or remove the dots entirely.
Confidence: High
Discovered by: sub-agent 9, session TV

--- (originally TV-9-2)

---

## TV-164 — Services "Glow" decoration uses off-system cyan-blue rgba
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/services`, desktop breakpoint. Node `zcKSIoCUJ` (name: "Glow", type: `FrameNode`).
Description: A decorative "Glow" element on the Services page uses `attributes.fill = "rgba(0, 170, 255, 0.5)"`. The project has three blue-family accent tokens — `Primary` (`rgb(0, 144, 255)`), `Secondary` (`rgb(0, 53, 255)`), `Accent Blue` (`rgb(46, 150, 255)`) — but the value used (0,170,255 at 0.5 alpha) matches none of them. It's an ad-hoc glow color that bypasses the design system. Decorative glows are exactly the kind of effect that should be tokenized because they tend to be repeated across hero sections, CTA buttons, and feature cards.
Evidence: `serialize` walk on /services returned the node with `attributes.fill === "rgba(0, 170, 255, 0.5)"`. Screenshot: https://framerusercontent.com/screenshots/on-demand/9ac0634c-2b25-47bc-8723-67461a91ae60.jpg . Closest token is `Primary` (`rgb(0, 144, 255)`) — same hue family but different saturation/luminance and no alpha variant.
Recommended Fix: Replace with `Primary` token + opacity attribute for the alpha, OR introduce a new "Glow Primary" token at `rgba(0, 144, 255, 0.5)` (matching the Primary hue rather than the slightly-off 0,170,255 value) and reuse it for any other glow effect site-wide.
Confidence: High
Discovered by: sub-agent 9, session TV

--- (originally TV-9-3)

---

## TV-165 — Stale stock-trading template content discovered on Home page (umbrella finding)
Status: Open
Category: Visual design & branding
Severity: High
Location: `/` (Home). Auto-named parent frames on the canvas: `fl4CjDHnp` ("Frame 632059"), `EdPqis63w` ("Frame 37625"), `MUg7KfQp6` ("Frame 631971"), `IpM1g3MKe` (unnamed FrameNode).
Description: A project-wide font audit (990 `RichTextNode`s) revealed that 5 of the 7 declared project fonts — `Gowun Batang`, `Geist Mono`, `Instrument Sans`, `Geist`, and `Inter Display` — are used only on a small cluster of nodes whose **names and copy are unrelated to a veterinary site**: "One Dashboard for All Your Stocks", "Dashboard", "Market", "My Assets", "News", "Performance", "Trusted By", "Social", "Cstro", "CSTRO", "Start Trading", "Get Started", "Username Text", "Brand Name". These are clearly leftover content from a stock-trading / fintech dashboard template that was used as the starting point and never cleaned up. The orphan frames have auto-generated names ("Frame 632059", "Frame 37625", "Frame 631971") and small 200×200 rects at near-origin coordinates, consistent with off-canvas or hidden design-exploration frames. This is the root cause behind findings TV-9-5, TV-9-6, TV-9-7, TV-9-8 below. Even if these frames are not visibly rendered on the live Home page, they ship with the project file, contribute to the 7-font bloat documented in the briefing, and risk being copy-pasted or accidentally shown in the future.
Evidence: `framer.agent.getNodesOfTypes({ types: ["RichTextNode"] })` returned 990 nodes project-wide. Filtering by `attributes.fontName` yielded: `Inter`: 44, `Geist Mono`: 12, `Instrument Sans`: 5, `Inter Display`: 3, `Geist`: 3, `Manrope`: 2, `Gowun Batang`: 1. Tracing each rare-font node via `framer.agent.getParentNode({ id }, { pagePath: "/" })` returned parent FrameNodes with auto-generated names ("Frame 632059", "Frame 37625", "Frame 631971") — a strong signal of orphan content. Rect of `fl4CjDHnp` is `{x:0, y:0, width:200, height:200}`, of `EdPqis63w` is `{x:0.49, y:1.01, width:200, height:200}`, of `MUg7KfQp6` is `{x:32, y:25.5, width:200, height:200}` — tiny uniform-size frames inconsistent with Vetly's actual page layout.
Recommended Fix: In fix mode, navigate to the Home page canvas in Framer, locate frames `fl4CjDHnp`, `EdPqis63w`, `MUg7KfQp6`, `IpM1g3MKe` and any other "Frame <number>"-named frames, verify they are not referenced by any visible section, and delete them. After cleanup, the 5 unused fonts (`Gowun Batang`, `Geist Mono`, `Instrument Sans`, `Geist`, `Inter Display`) can be removed from the project's installed fonts, reducing the project's font payload from 7 to 2 (Inter + Manrope, matching the 12 text styles).
Confidence: High
Discovered by: sub-agent 9, session TV

--- (originally TV-9-4)

---

## TV-166 — `Gowun Batang` font used exactly once, on orphan stocks-dashboard heading
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/` (Home). Node `rhtNLnDo6` (name: "One Dashboard for All Your Stocks", type: `RichTextNode`), parent `fl4CjDHnp` ("Frame 632059", FrameNode).
Description: The project declares `Gowun Batang` (a Korean-style serif face) as one of its 7 installed fonts, but it is referenced by exactly ONE RichTextNode project-wide — a heading whose text content ("One Dashboard for All Your Stocks") is unrelated to veterinary services. None of the 12 text styles uses `Gowun Batang`. This is unused-font cruft from the prior stock-trading template (see TV-9-4). Carrying the font file increases page weight for visitors who never see it.
Evidence: `getNodesOfTypes({ types: ["RichTextNode"] })` returned exactly 1 node with `attributes.fontName === "Gowun Batang"`: id `rhtNLnDo6`, name "One Dashboard for All Your Stocks", parent `fl4CjDHnp` ("Frame 632059"). Cross-check against `exploration.json` textStyles — none of the 12 styles lists `Gowun Batang` in `font.family` or `boldFont.family`.
Recommended Fix: Delete the orphan node (see TV-9-4), then remove `Gowun Batang` from the project's installed fonts in Framer Project Settings → Fonts.
Confidence: High
Discovered by: sub-agent 9, session TV

--- (originally TV-9-5)

---

## TV-167 — `Geist Mono` font used 12 times on stock-trading-app labels; no text style defines it
Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/` (Home). 12 RichTextNode instances: `rz5aKVY1C`, `NRtsk9nR3`, `Cb0wOixvJ`, `EPhY7NaAb`, `mPc9AL0HU`, `JAdEEkwZv`, `mY18meGlS`, `rfexkWGvJ`, `n4_cYwErF`, `eY0DKvAAa`, `eM4m61GDh`, `ZKk6NIJ5C`. Parent of at least one (`rz5aKVY1C`) is `EdPqis63w` ("Frame 37625").
Description: `Geist Mono` is declared as one of the 7 project fonts and used 12 times — but every usage is on a node named for a stock-trading-app navigation label: "Dashboard", "Market", "My Assets", "News", "Performance", "Trusted By", "Social". None of the 12 text styles defines `Geist Mono`, so these 12 instances each apply a direct font override (rather than inheriting from a text style preset). This pattern produces an inconsistent typography system: if the team ever wants a "mono" text style for code snippets, phone numbers, or technical labels, they have no shared style to apply — and 12 stray overrides would need to be found and updated individually.
Evidence: `getNodesOfTypes({ types: ["RichTextNode"] })` returned 12 nodes with `attributes.fontName === "Geist Mono"`. Node names match stock-trading vocabulary exactly. Cross-check against `exploration.json` textStyles — zero of 12 styles use `Geist Mono`.
Recommended Fix: If a monospaced text treatment is genuinely desired somewhere in Vetly (e.g., for hours-of-operation, phone numbers, or addresses), add a new "Text Mono" text style preset that uses `Geist Mono`, and apply it via the preset rather than direct font overrides. Otherwise, delete the 12 orphan nodes (see TV-9-4) and remove `Geist Mono` from the installed fonts.
Confidence: High
Discovered by: sub-agent 9, session TV

--- (originally TV-9-6)

---

## TV-168 — `Instrument Sans` font used 5 times on stock-trading template labels; no text style defines it
Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/` (Home). 5 RichTextNode instances: `A3hgBQjFN` (name: "Cstro"), `ILwiY2vf4` (name: "Start Trading"), `L0UfYzAud` (name: "Get Started"), `TotAVPRgn` (name: "CSTRO"), `IZDHte2av` (name: "Cstro"). Parent of `A3hgBQjFN` is `MUg7KfQp6` ("Frame 631971").
Description: `Instrument Sans` is declared as one of the 7 project fonts but used only 5 times — every usage on a stock-trading template label ("Cstro" / "CSTRO" appears to be a brand name from the prior template, alongside "Start Trading" and "Get Started"). None of the 12 text styles defines `Instrument Sans`. The font is cruft from the prior template (see TV-9-4) and contributes to font-file payload bloat.
Evidence: `getNodesOfTypes({ types: ["RichTextNode"] })` returned 5 nodes with `attributes.fontName === "Instrument Sans"`. Node names contain trading vocabulary ("Start Trading", "Get Started") and a non-Vetly brand name ("Cstro"). Cross-check against `exploration.json` textStyles — zero of 12 styles use `Instrument Sans`.
Recommended Fix: Delete the 5 orphan nodes (see TV-9-4), then remove `Instrument Sans` from the installed fonts. If "Get Started" copy is genuinely needed somewhere, re-create it using the existing `Heading 6` or `Text L` text style preset.
Confidence: High
Discovered by: sub-agent 9, session TV

--- (originally TV-9-7)

---

## TV-169 — `Geist` font used 3 times on trading-app content; no text style defines it
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/` (Home). 3 RichTextNode instances: `kGjpu8hOB` (no name), `BBdsUwQOy` (name: "Username Text"), `PhcdXq3_n` (no name). Parent of `kGjpu8hOB` is `IpM1g3MKe` (FrameNode).
Description: `Geist` is declared as one of the 7 project fonts but used only 3 times — including a node named "Username Text", which is clearly trading-app content (no login form exists on the Vetly site). None of the 12 text styles defines `Geist`. The font is cruft from the prior template (see TV-9-4).
Evidence: `getNodesOfTypes({ types: ["RichTextNode"] })` returned 3 nodes with `attributes.fontName === "Geist"`. One is named "Username Text" — Vetly has no login form. Cross-check against `exploration.json` textStyles — zero of 12 styles use `Geist`.
Recommended Fix: Delete the 3 orphan nodes (see TV-9-4), then remove `Geist` from the installed fonts.
Confidence: High
Discovered by: sub-agent 9, session TV

--- (originally TV-9-8)

---

## TV-170 — `Manrope` direct font overrides on "Brand Name" nodes bypass the text-style system
Status: Open
Category: Visual design & branding
Severity: Low
Location: `/` (Home). Two RichTextNode instances, both named "Brand Name": `HsPFOPesCZYiXBF4EE` (parent `HsPFOPesCd9_p2Lg3f`, "Brand Row") and `ZYiXBF4EE` (likely the master/component-definition version of the same node — note the second ID is a suffix of the first).
Description: `Manrope` is the declared heading font in 6 of the 12 text styles (`Heading 1` through `Heading 6` and `Heading 2s`). Despite this, 2 "Brand Name" nodes apply `Manrope` as a direct `attributes.fontName` override rather than via a text style preset. This is a consistency issue: the brand wordmark should have a defined text style (e.g., a new "Brand Wordmark" preset) so its size/weight/color can be updated in one place. Direct overrides risk drifting from the system — for example, if the team later switches headings to a different weight of Manrope, these brand-name nodes will not inherit the change.
Evidence: `getNodesOfTypes({ types: ["RichTextNode"] })` returned 2 nodes with `attributes.fontName === "Manrope"` (out of 990 total). Both are named "Brand Name" and share a parent named "Brand Row". The shared ID pattern (`HsPFOPesCZYiXBF4EE` vs `ZYiXBF4EE`) suggests the first is a `$replicaId` of the second, meaning the underlying master node is `ZYiXBF4EE` (which is what should be edited).
Recommended Fix: Add a "Brand Wordmark" text style preset using `Manrope` at the brand-name size/weight/letter-spacing, and apply it to the master node `ZYiXBF4EE`. Then remove the direct `fontName` override on both instances.
Confidence: Medium
Discovered by: sub-agent 9, session TV

---

## Summary stats (informational, not a finding)

- **Color tokenization rate** on the 4 audited pages (depth 8 walk of each desktop breakpoint): 90 of 95 color-bearing attributes use `var(--token-<id>)` references (95%); 5 are hardcoded RGB/rgba literals (5%).
- **Per-page hardcoded-color count**: Home `/` = 3 (Floating Trust Card ×2, Red Dot ×1); `/services` = 1 (Glow); `/about` = 1 (Red Dot); `/contact` = 0 (fully tokenized — exemplary).
- **Project-wide font usage by `RichTextNode.attributes.fontName`** (990 nodes total; 70 have explicit `fontName`, the remaining 920 inherit via text style presets): Inter 44, Geist Mono 12, Instrument Sans 5, Inter Display 3, Geist 3, Manrope 2, Gowun Batang 1.
- **Declared project fonts**: 7 (Inter Display, Inter, Instrument Sans, Geist Mono, Gowun Batang, Geist, Manrope). **Text-style-declared fonts**: 2 (Inter + Manrope). **Fonts used outside any text style**: 5 (Inter Display, Instrument Sans, Geist Mono, Gowun Batang, Geist) — all on orphan stock-trading-template content. (originally TV-9-10)

---

## TV-171 — Footer contains a stray orphan image node (824×644 JPG) that ships to every page
Status: Open
Category: Components (native + code) | Performance & technical
Severity: High
Location: Component `Xx2RpZ5pV` (Navigation/Footer), direct child `hL1V1p34z` named "IMG 20250915_105006_935"
Description: The Footer ComponentNode has 4 direct children, but only 3 are variants (Desktop `SM4CTALR7`, Tablet `IToCCjwER`, Phone `wxI9ElO4C`). The 4th child, `hL1V1p34z`, is a FrameNode named "IMG 20250915_105006_935" — an 824×644px image (`fill: https://framerusercontent.com/images/04AQ7sbWytcyefk0AqvFcLbpEZ0.jpg`) positioned absolutely off-canvas (`left: -1037px, top: -233px`) with `layout: "null"`. It is neither a Primary nor a Replica Variant, so it does not render on the page — but because it lives inside the ComponentNode definition, it is downloaded as part of the component payload and persists in every Footer instance. Since the Footer is in the Layout Template (`yDIYoKc7h`), this orphan JPG is referenced by all 3 Footer instances across every page that inherits the layout. The name pattern "IMG YYYYMMDD_HHMMSS_NNN" is the default Android camera filename — strongly suggesting a designer accidentally dragged a phone photo into the component and forgot to delete it.
Evidence: Serialized Footer at depth 3 — child `hL1V1p34z` attributes: `{"fill":"https://framerusercontent.com/images/04AQ7sbWytcyefk0AqvFcLbpEZ0.jpg","layout":"null","left":"-1037px","top":"-233px","width":"824px","height":"644px","aspectRatio":1.28}`. No `$isPrimary` / `$isReplica` flag. Screenshot of Footer instance on home page: https://framerusercontent.com/screenshots/on-demand/e383bb54-af59-4f13-9005-0f910daa069e.jpg (orphan not visible because off-canvas, but present in component tree).
Recommended Fix: Delete node `hL1V1p34z` from the Footer ComponentNode. Verify the JPG is removed from the project asset library afterward. No visual change will occur on any page because the node is off-canvas.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-1)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-8-15 → now renumbered as TV-8-15. Footer ComponentNode contains a stray 824×644 orphan JPG off-canvas — ships to every page via Layout Template.

---

## TV-172 — "Price list card" component is unused (0 instances) AND has all content hardcoded
Status: Open
Category: Components (native + code)
Severity: High
Location: Component `XX2THh6jc` (path: `unrelated/Price list card`)
Description: The Price list card ComponentNode has **zero instances** anywhere in the project (verified via `getNodesOfTypes({types:["ComponentInstanceNode"]})` returning 603 total instances, none referencing `XX2THh6jc`). It is dead code in the component library. Additionally, the component exposes only 2 controls (`$control__fill` and `$control__gap`) — all actual content (6 "Service Price" rows, each with a title and price RichTextNode) is hardcoded inside the component definition. The RichTextNodes have empty `name` attributes (e.g. `lk35yVFof`, `kORHiY1Ig`), making them unfindable in the layers panel. The component's folder path `unrelated/Price list card` is also non-semantic — every other card lives under `Cards/` (Service Card, Blog Card, Teem Card, Testimonial card, Why Us Card, Contact Card, Mission Card, Trust Card, Stat Card, Map card). Finally, the default `fill` control value references a color token id `a4cc3049-88ec-4475-b921-6c42a8f6e4d0` that does NOT exist in the project's 26 color styles (falls back to `rgb(255,255,255)`) — a stale/broken token reference.
Evidence: Instance count query: `preciseCounts["XX2THh6jc"] === 0`. Controls (from `readComponentControls`): only `$control__fill` and `$control__gap`. Serialized depth 4 shows 6 hardcoded "Service Price" FrameNodes with unnamed RichTextNodes. Color styles list (26 tokens) does not contain id `a4cc3049-...`. Path name `unrelated/Price list card` confirmed in ComponentNode `name` attribute.
Recommended Fix: Either delete the unused component entirely, OR (if it's intended for future use) refactor: (a) move it under `Cards/Price list card`; (b) add controls for service title, service price, and a slot/list for additional rows; (c) rename the inner RichTextNodes to "Service Title" and "Service Price" for editor clarity; (d) fix the `fill` control to reference the actual White token (`219c2d29-187a-40f8-aab3-a7af9bd91f3b`) or a new `Price List Background` token; (e) replace the hardcoded Divider color `rgba(64, 169, 255, 0.25)` with a token (it's currently `#40A9FF` at 25% alpha — not in the design system).
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-2)

---

## TV-173 — Buy Button text content (brand, "for", price) is hardcoded; no text/price controls
Status: Open
Category: Components (native + code) | UX & conversion
Severity: High
Location: Component `sfrLnUdBr` (Buy Button), primary variant `SVjbUIE_y`, child RichTextNodes `ZYiXBF4EE` (Brand Name), `GeDtk56NK` ("for"), `QDcE0o_Jp` (Price)
Description: The Buy Button component exposes only 3 controls: `$control__variant`, `$control__link`, and `$control__image` (the logo). The visible text content is entirely hardcoded inside the component: Brand Name = "Vetly", the connecting word = "for", and Price = "$129". Editors cannot change the price, brand name, or "for" label without double-clicking into the component — which breaks instance overrides on every page that uses it (4 instances project-wide, 3 in the layout template). The price "$129" is a specific dollar amount that should obviously vary per service/booking, making this a significant editability gap. The component also has only 2 variants (`Variant 1`, `Variant 2`) with generic names — Variant 1 is dark (neutral-900 fill), Variant 2 is a Primary→Secondary gradient — and no hover, pressed, disabled, or loading states (compare Primary Button which has 14 variants including Loading/Disabled/Success/Error). The component's path is also just `Buy Button` — not grouped under `Buttons/` like every other button component.
Evidence: Serialized Buy Button depth 4 — TextRun children contain: `ZYiXBF4EE` → "Vetly"; `GeDtk56NK` → "for"; `QDcE0o_Jp` → "$129". Controls (from `readComponentControls`): `["$control__variant","$control__link","$control__image"]` — no text/price controls. Screenshot of Buy Button instance on home page: https://framerusercontent.com/screenshots/on-demand/ac775e8a-b4b8-4705-acad-83f7ddb4e54d.jpg
Recommended Fix: (a) Add `$control__brandName` (string, default "Vetly"), `$control__priceText` (string, default "$129"), and `$control__forLabel` (string, default "for") controls, bound to the corresponding RichTextNodes via variables. (b) Rename variants to semantic names (e.g. "Dark" and "Gradient"). (c) Add hover and pressed Gesture Variants. (d) Move component path to `Buttons/Buy Button` for consistency. (e) Consider adding a `disabled` state for when the item is out of stock.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-3)
Reviewer note: Fix direction CONFLICTS with TV-5-14/TV-15-5/TV-13-3/TV-4-3/TV-7-10 (which recommend REMOVING the Buy Button entirely). Orchestrator decision: the Buy Button appears to be a leftover template element (links to https://x.com/, screenshot image asset, on every page). Recommend REMOVAL — TV-10-3's refactor recommendation is overruled by the broader cluster.

---

## TV-174 — FAQ item accordion is not keyboard accessible (onTap only, no a11y attributes)
Status: Open
Category: Accessibility & compliance | Components (native + code)
Severity: High
Location: Component `xUmE2HP3j` (Elements/FAQ item), all 6 variant FrameNodes
Description: The FAQ item's open/close mechanism is implemented via `onTap` event handlers on each variant's root FrameNode: `P3ysYJ8v6` (FAQ Open) has `onTap: [{"action":"SET_VARIANT","controls":{"variant":"OgvEl7iAq"}}]` (toggles to Closed), and `OgvEl7iAq` (FAQ Closed) has the reverse. This works for mouse/touch clicks but the FrameNode has no `tabIndex`, no `role="button"`, no `aria-expanded`, and no `onKeyDown` handler — so keyboard-only users (Tab + Enter/Space) cannot operate the accordion, and screen readers will not announce the toggle state. This is a WCAG 2.1.1 (Keyboard) and WCAG 4.1.2 (Name, Role, Value) failure. The FAQ item is used 90 times across the site (the most-instanced native component), so the a11y gap propagates everywhere. (Note: sub-agent 8 owns site-wide a11y — this finding is scoped to the component design; sub-agent 11 owns the `FAQAccordion.tsx` code component which may be a separate mechanism.)
Evidence: Serialized FAQ item depth 5 — `P3ysYJ8v6.attributes.onTap = [{"action":"SET_VARIANT","controls":{"variant":"OgvEl7iAq"}}]`. Question frame `DdXd01hW5` attributes contain no `tabIndex`, `role`, `aria-expanded`, or keyboard event handlers (verified via serialize with no attributeFilter). Screenshot of FAQ item instance on home page: https://framerusercontent.com/screenshots/on-demand/fe8c6a48-c6ac-4c2c-a99d-5087d64c9cac.jpg
Recommended Fix: Either (a) wrap the Question row in a code override that adds `tabIndex={0}`, `role="button"`, `aria-expanded={isOpen}`, and handles `onKeyDown` for Enter/Space; OR (b) replace the native component with the `FAQAccordion.tsx` code component (sub-agent 11's scope) if it already handles a11y. At minimum, add `aria-expanded` binding to the variant toggle.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-4)

---

## TV-175 — Nav Bar missing "Booking Active" variant — /booking page has no active nav state
Status: Open
Category: Components (native + code) | UX & conversion
Severity: High
Location: Component `bTXu1FqyY` (Navigation/Nav Bar), variant list
Description: The Nav Bar component has 6 variants: `Default`, `Home Active`, `Services Active`, `About Active`, `Blog Active`, `Contact Active`. The site has a `/booking` page (page id `kdx64iDUQ`) which the briefing flags as "conversion-critical" — but there is no `Booking Active` variant. When a visitor lands on `/booking`, no navigation item shows an active state, breaking wayfinding on the most important conversion page. The Header component's `$control__activeLink` enum (options: `GBHKk2wfg`, `zoi6vWvSq`, `wKsJPXiD6`, `eZsgGzdxK`, `SlVOr2Z70`, `bpDYafag8`) maps to those 6 Nav Bar variants — confirming the active-state set is fixed at those 6 and Booking is genuinely missing. (Note: sub-agent 15 owns Header/Nav Bar globally — this finding is scoped to the component's variant coverage.)
Evidence: `framer.agent.serialize({id:"bTXu1FqyY",depth:1}).$variants` returns exactly 6 variants with names `["Default","Home Active","Services Active","About Active","Blog Active","Contact Active"]`. Header controls `$control__activeLink` options match the same 6 variant IDs. Screenshot of Nav Bar (via Header) on home page: https://framerusercontent.com/screenshots/on-demand/5d65996f-e401-4110-acbe-42cb90c7b5dd.jpg
Recommended Fix: Add a 7th variant `Booking Active` to the Nav Bar component (CREATE_VARIANT from `Default`, then style the Booking link as active). Add the corresponding variant ID to the Header's `$control__activeLink` enum options. Set the layout template's Header instance `$control__activeLink` to the Booking Active variant id on the `/booking` page breakpoint.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-5)

---

## TV-176 — "Teem Card" component name is a typo (should be "Team Card")
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Medium
Location: Component `T6DVfhsAL` (path: `Cards/Teem Card`)
Description: The component is named `Teem Card` (with double-e) — a misspelling of "Team Card". The typo appears in Framer's insert panel, the layers panel, and the component's `name` attribute (`Cards/Teem Card`). It is used 24 times across the site (all on the About page team section, presumably). The typo does not affect rendering but degrades editor UX and project professionalism. The primary variant is also named `L` (a single letter) rather than a semantic name — when the component is expanded in the variant panel, editors see "Teem Card › L" which is uninformative.
Evidence: `framer.agent.serialize({id:"T6DVfhsAL",depth:2})` returns `name: "Cards/Teem Card"` and primary variant `name: "L"`. Screenshot of Teem Card instance on home page: https://framerusercontent.com/screenshots/on-demand/7d32f251-f6c8-4723-8a37-a5d797ca32c9.jpg
Recommended Fix: Rename the component to `Cards/Team Card` (UPDATE ComponentNode name attribute) and rename the primary variant from `L` to `Default` or `Portrait` (whatever the orientation is). Both are rename-only operations with no visual impact.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-6)
Dedupe note: This finding consolidates 2 cross-sub-agent duplicate(s): TV-1-27, TV-4-19 → now renumbered as TV-1-27, TV-4-19. Teem Card component name typo (should be 'Team Card') — flagged by 3 sub-agents.

---

## TV-177 — Outline Button missing Disabled and Loading states (inconsistent with Primary Button)
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Component `NoQy1opGY` (Buttons/Outline Button)
Description: The Outline Button has 3 variants: `Outline` (primary), `Outline` hover (gesture), `Outline` pressed (gesture). It is missing `Disabled` and `Loading` states that exist on the Primary Button (`ARbK0E6gq`, 14 variants including Disabled, Loading, Solid, Solid Loading, Success, Error). The Outline Button is used 27 times across the site, including in form-adjacent contexts (e.g., Newsletter signup, Contact form secondary actions) where a Disabled state is conventionally expected. The inconsistency means forms mixing Primary + Outline buttons can show a disabled Primary but cannot show a disabled Outline — they'd have to fake it with opacity, breaking the design system.
Evidence: `framer.agent.serialize({id:"NoQy1opGY",depth:2}).$variants` returns 3 entries: `g9O186Ri0` (Outline, primary), `mq68uT0aT` (Outline, hover gesture), `zBUuxInr3` (Outline, pressed gesture). Compare Primary Button: 14 variants including `nFlcyuxoA` (Disabled), `QP_bKwhNI` (Loading). Screenshot of Outline Button on home page: https://framerusercontent.com/screenshots/on-demand/3b6513c6-f4ac-4b5e-b98e-228ade775eba.jpg
Recommended Fix: Add `Outline Disabled` (CREATE_VARIANT from `Outline`, override fill/textColor to muted) and `Outline Loading` (CREATE_VARIANT from `Outline`, add a spinner) variants. Optionally add `Outline Success` / `Outline Error` for form-validation parity with Primary Button.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-7)

---

## TV-178 — NavLink Button missing "Active hover" and "pressed" gesture variants
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Component `gUM1o8Yyz` (Buttons/NavLink Button)
Description: The NavLink Button has 3 variants: `Not Active` (primary), `Not Active` hover (gesture), `Active` (replica). There is no `Active hover` variant — so when a user hovers the currently-active nav link, nothing happens visually, which is a subtle UX inconsistency (hovering inactive links shows feedback, but hovering the active link does not). There is also no `pressed` gesture variant (the Outline Button and Primary Button both have pressed gestures). Used 63 times across the site.
Evidence: `framer.agent.serialize({id:"gUM1o8Yyz",depth:2}).$variants` returns 3 entries: `lkCftY97P` (Not Active, primary), `CK_sWgFZi` (Not Active, hover gesture), `pGYUAc7r3` (Active, replica). No `$gesture:"hover"` or `$gesture:"pressed"` variant exists on the Active variant.
Recommended Fix: Add an `Active hover` Gesture Variant (CREATE_VARIANT from `pGYUAc7r3` with `gesture="hover"`) and an `Active pressed` Gesture Variant. Override fill/textColor to a slightly darker active-state color on hover.
Confidence: Medium
Discovered by: sub-agent 10, session TV

--- (originally TV-10-8)

---

## TV-179 — CTA component has no `link` prop — button destination is hardcoded inside
Status: Open
Category: Components (native + code) | UX & conversion
Severity: Medium
Location: Component `GkwGTE6uU` (Elements/CTA), inner Primary Button instance `gcvNfm7HR`
Description: The CTA exposes 3 content controls: `$control__title`, `$control__description`, `$control__buttonText` — but no `$control__buttonLink`. The inner Primary Button instance (`gcvNfm7HR`) has only `$control__variant: "Button"` set on the CTA, meaning the button's `link` attribute is hardcoded inside the CTA component definition. Since the CTA sits in the Layout Template (3 instances, one per breakpoint, inherited by every page), the same hardcoded button destination is used site-wide. If the booking URL changes, editors must open the CTA component, find the inner button, and change its link — a non-obvious workflow. Also: variant naming is inconsistent (`Desktop`, `Tablet`, `Mobile`) — every other responsive component uses `Phone` instead of `Mobile` (Header, Footer, Nav Bar, CTA's own internal usage).
Evidence: `framer.agent.serialize({id:"GkwGTE6uU",depth:4})` shows inner button instance `gcvNfm7HR` with attributes `{"$control__variant":"Button","width":"auto","height":"auto"}` — no `$control__link`. Controls from `readComponentControls`: `["$control__variant","$control__title","$control__description","$control__buttonText"]` (plus 3 event handler stubs) — no link control. Variants: `["Desktop","Tablet","Mobile"]`. Screenshot: https://framerusercontent.com/screenshots/on-demand/b859056b-7863-4bab-93a7-f1b5fff753fe.jpg
Recommended Fix: (a) Add `$control__buttonLink` control (type: link) and bind it to the inner Primary Button's `$control__link`. (b) Rename the `Mobile` variant to `Phone` for consistency with Header/Footer/Nav Bar.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-9)

---

## TV-180 — Contact Card missing `link` prop — phone number is display-only, no tel: link
Status: Open
Category: Components (native + code) | UX & conversion
Severity: Medium
Location: Component `Iz7ICmC8H` (Cards/Contact Card), inner Button instance `b1VhqEJ82`
Description: The Contact Card exposes `$control__button` (string, default `"+123 456 789"") — the phone number text. But there is no `$control__link` or `$control__phoneLink` control. The inner Button instance (`b1VhqEJ82`) has `$control__variant: "Button"` set but no link attribute. So the phone number is displayed as text but is NOT a clickable `tel:` link — on mobile devices, users cannot tap-to-call. The default value `+123 456 789` is also a placeholder (not a real phone number), suggesting the component was built with demo data and never wired up. Used 15 times across the site (contact page, booking page, etc.). The button is also set to `width: "1fr"` (full-width), which is unusual for a button — most buttons are `width: "auto"`.
Evidence: Controls from `readComponentControls`: includes `$control__button` (default `"+123 456 789"`) but no link control. Serialized depth 4: inner button `b1VhqEJ82` attrs `{"$control__variant":"Button","width":"1fr","height":"auto"}` — no link. Screenshot of Contact Card on /contact: https://framerusercontent.com/screenshots/on-demand/78120a0a-e7cb-4516-920a-cc1d46be0c3a.jpg
Recommended Fix: (a) Add `$control__phoneLink` control (type: link, default `tel:+123456789`) and bind it to the inner button's `$control__link`. (b) Replace the placeholder default `+123 456 789` with the real Vetly phone number (or empty string). (c) Consider changing button `width` from `1fr` to `auto` for conventional button sizing (or document that full-width is intentional for this card).
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-10)

---

## TV-181 — Map card has only a "Desktop" variant — no Tablet or Phone responsive variants
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Component `cXuHXndOE` (Cards/Map card)
Description: The Map card has a single variant named `Desktop` (638×574px, fixed). There are no `Tablet` or `Phone` variants. Used 9 times across the site. On mobile, a 638px-wide map will either overflow the viewport or be scaled down by the parent container — but since the component itself has no responsive override, the inner GoogleMaps instance (`ZN79Op08h`, an external component) may render at sub-optimal zoom or aspect ratio on smaller screens. Compare Header/Footer/CTA which all have Desktop/Tablet/Phone variants. The component also exposes only 5 controls (`location`, `radius`, `border`, `shadow`, + an event handler stub) — no `mapZoom`, `mapType`, or `height` controls, limiting configurability.
Evidence: `framer.agent.serialize({id:"cXuHXndOE",depth:2}).$variants` returns 1 entry: `LUlcDPx_4` (Desktop). `framer.agent.serialize({id:"cXuHXndOE",depth:4})` shows fixed `width: "638px"`, `height: "574px"` and a single GoogleMaps ComponentInstanceNode child `ZN79Op08h` with `width: "1fr"`, `height: "1fr"`. Screenshot of Map card on home page: https://framerusercontent.com/screenshots/on-demand/609771e1-ff83-45b5-be11-5a004a476d9a.jpg
Recommended Fix: Add `Tablet` and `Phone` Replica Variants (CREATE_VARIANT from `Desktop`) with adjusted width (e.g., 100% for mobile) and height. Optionally add `$control__mapZoom` and `$control__mapType` controls forwarded to the inner GoogleMaps instance.
Confidence: Medium
Discovered by: sub-agent 10, session TV

--- (originally TV-10-11)

---

## TV-182 — 5 Stars component cannot represent partial ratings; default color is cyan, not gold
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Medium
Location: Component `Uqn4x3nhl` (Elements/5 Stars)
Description: The 5 Stars component has 5 size variants (XL, L, M, S, XS) and 3 controls: `$control__variant` (size), `$control__starColor` (default `var(--token-8d76f153-...)` = Primary / Accent Cyan `rgb(0, 170, 255)`), `$control__halfStarVisible` (boolean, default false), and `$control___5Star` (boolean, default true). It can only display either 5 full stars or 5 stars with a half star — there is no `$control__rating` prop to display 3, 4, or 4.5 out of 5 stars. This severely limits reusability: any review/rating display showing fewer than 5 stars cannot use this component. Additionally, the default `starColor` is Accent Cyan (`#00AAFF`) — not a conventional gold/amber star color. This may be an intentional brand choice (the site uses cyan as the primary accent), but it's worth flagging because star ratings are conventionally gold and the cyan choice may confuse users who expect a rating indicator. Used 5 times across the site.
Evidence: Controls from `readComponentControls`: `["$control__variant","$control__starColor","$control__halfStarVisible","$control___5Star"]` — no rating prop. `$control__starColor` default = `var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2, rgb(0, 170, 255))` which maps to color style "Primary" (Accent Cyan). Screenshot of 5 Stars on home page: https://framerusercontent.com/screenshots/on-demand/8ef20cb3-eb1f-4afd-995b-f8da40fd957c.jpg
Recommended Fix: (a) Add `$control__rating` (number, 0–5, step 0.5) and use it to drive star fill via a code override or variant set. (b) Reconsider the default `starColor` — if the cyan brand choice is intentional, document it; otherwise switch to a gold token (would require adding a new `Star Gold` color style). (c) Rename the unusual `$control___5Star` control (the leading double-underscore and "5" prefix are non-standard) to `$control__fiveStarVisible` or similar.
Confidence: Medium
Discovered by: sub-agent 10, session TV

--- (originally TV-10-12)

---

## TV-183 — Arrow Button: generic variant names, no hover state, no link prop, no disabled state
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Component `mEQe6u3a9` (Buttons/Arrow Button)
Description: The Arrow Button has 2 variants named `Variant 1` and `Variant 2` — generic names that don't communicate what differs between them (likely direction: left-arrow vs. right-arrow, but unlabeled). It exposes only 3 controls: `$control__variant`, `$control__color`, `$control__shadow`. There is **no `$control__link`** prop — the button cannot be wired to a destination without entering the component. There is no hover or pressed Gesture Variant, and no disabled state. Compare Primary Button (14 variants, link control, hover/pressed gestures). Used 16 times, all nested inside Blog Card variants (where it serves as the "read more" arrow) — so the missing link prop is partially mitigated by the parent Blog Card's link, but if the Arrow Button is ever placed standalone, it won't be clickable.
Evidence: `framer.agent.serialize({id:"mEQe6u3a9",depth:2}).$variants` returns 2 entries: `TNH7J0Qb0` (Variant 1, primary), `iAiaLvEC_` (Variant 2, replica) — no `$gesture` attributes. Controls: `["$control__variant","$control__color","$control__shadow"]` — no link control. All 16 instances have compound IDs starting with Blog Card variant IDs (`OyehRjapS`, `ZN8y56CSQ`, `cESGoZn84`, `k8p5fPamx`, `O_DdWUeNW`).
Recommended Fix: (a) Rename variants to semantic names (e.g., `Right` and `Left`, or `Forward` and `Back`). (b) Add `$control__link` control. (c) Add hover and pressed Gesture Variants. (d) Optionally add a `$control__disabled` boolean.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-13)

---

## TV-184 — Blog Card and Blog Meta components use `autherName` control (typo propagated from CMS)
Status: Open
Category: Components (native + code) | CMS
Severity: Medium
Location: Components `EiCUZ0sVC` (Cards/Blog Card, control `$control__autherName`) and `GF64_og83` (Elements/Blog Meta, control `$control__autherName`)
Description: Both the Blog Card and Blog Meta components expose a control named `$control__autherName` — a misspelling of "authorName". This typo originates in the CMS Blog collection (`b8Kw9KXWB`), which has a field named `Auther Name` (already flagged by the orchestrator in `worklog.md` Important Discoveries). The typo propagates from CMS → component control API, so any code or documentation referencing the author prop must use the misspelled name. The Blog Card's control has default value `"Dr Alex"` (placeholder author name) and the Blog Meta's default is also `"Dr Alex"`. Used 12 + 8 = 20 times across the site. Fixing this requires coordinated migration: rename the CMS field, rename both component controls, and update every binding — non-trivial but worth doing before the site scales.
Evidence: `readComponentControls` for `EiCUZ0sVC` includes `$control__autherName` (type: string, default `"Dr Alex"`). `readComponentControls` for `GF64_og83` includes `$control__autherName` (type: string, default `"Dr Alex"`). Both should be `$control__authorName`. Screenshot of Blog Card on home page: https://framerusercontent.com/screenshots/on-demand/a20b3348-6408-4847-b877-697f7d9111d9.jpg
Recommended Fix: Coordinate with sub-agent 12 (CMS data quality): (a) rename the Blog collection field `Auther Name` → `Author Name`; (b) rename `$control__autherName` → `$control__authorName` on both Blog Card and Blog Meta components; (c) update all variable bindings (`var(--variable-...)`) that reference the old field. Test that existing CMS items retain their author values after the rename.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-14)

---

## TV-185 — Service Card action text "Learn More" is hardcoded; not exposed as a control
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Component `ecHzMZLnH` (Cards/Service Card), RichTextNode `IpoVjtnXJ` (Action Text)
Description: The Service Card exposes 6 controls: `title`, `description`, `icon`, `padding`, + 2 event handler stubs. The "Action Text" RichTextNode (`IpoVjtnXJ`, inside the "Action Button" frame `h26xb6cck`) contains hardcoded TextRun text `"Learn More"` — not exposed as a control. Editors cannot change the action text without entering the component. Used 9 times across the site. While "Learn More" is a sensible default, it cannot be localized or varied per service (e.g., "Book Now" for emergency services, "Explore" for wellness). The card also has no `$control__link` prop — the click destination is presumably handled by the CMS Collection List wrapper, but this should be confirmed.
Evidence: Serialized `IpoVjtnXJ` at depth 4 — child TextRun `v:IpoVjtnXJ:0:0` has `text: "Learn More"`. Controls list for `ecHzMZLnH` does not include an actionText or link control. Screenshot of Service Card on home page: https://framerusercontent.com/screenshots/on-demand/74cc541d-7076-48b9-9989-df6d8cf64fe1.jpg
Recommended Fix: Add `$control__actionText` (string, default `"Learn More"`) bound to the Action Text RichTextNode via a variable. Optionally add `$control__link` if the card needs to link independently of a CMS Collection List wrapper.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-15)

---

## TV-186 — Multiple components have generic "Variant 1" primary variant names (no semantic naming)
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Components `Sr15oMIZ5` (Why Us Card), `HW4zuDyG0` (Mission Card), `YwXTWsIji` (Trust Card), `sfrLnUdBr` (Buy Button), `mEQe6u3a9` (Arrow Button)
Description: Five components have a primary variant named `Variant 1` (or `Variant 2` for the second variant) — a generic Framer default that was never renamed. When these components appear in Framer's variant dropdown, editors see meaningless labels like "Why Us Card › Variant 1" instead of semantic names like "Default" or "Portrait". The Testimonial card (`ruZNfQdon`) is even worse — its primary variant has `name: undefined` (no name at all), showing as a blank entry in the variant list. Compare well-named components: Primary Button (variants: Button, Loading, Solid, Disabled, Success, Error), FAQ item (FAQ Open, FAQ Closed, Touch Open, Touch Closed), Nav Bar (Default, Home Active, Services Active, etc.).
Evidence: - `Sr15oMIZ5` primary variant `eLTuHFRKH` name = "Variant 1"
- `HW4zuDyG0` primary variant `T8AgWWETe` name = "Variant 1"
- `YwXTWsIji` primary variant `Zj29N1s6q` name = "Variant 1"
- `sfrLnUdBr` variants `SVjbUIE_y` and `HsPFOPesC` named "Variant 1" and "Variant 2"
- `mEQe6u3a9` variants `TNH7J0Qb0` and `iAiaLvEC_` named "Variant 1" and "Variant 2"
- `ruZNfQdon` primary variant `jRkrJbY5H` name = `undefined` (confirmed via `serialize` returning `name: undefined`)
Recommended Fix: Rename each primary variant to `Default` (or a semantic name describing what it represents — e.g., for Buy Button, "Dark" and "Gradient"; for Arrow Button, "Right" and "Left"). For the Testimonial card, set the variant name to `Default`. These are rename-only operations with no visual impact.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-16)

---

## TV-187 — Header `activeLink` and Blog Card `metaType` controls expose bare node IDs as enum options (not labels)
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Component `AZd_vmoUt` (Header) control `$control__activeLink`; Component `EiCUZ0sVC` (Blog Card) control `$control__metaType`
Description: The Header component's `$control__activeLink` enum has options `["GBHKk2wfg", "zoi6vWvSq", "wKsJPXiD6", "eZsgGzdxK", "SlVOr2Z70", "bpDYafag8"]` — these are raw Nav Bar variant node IDs, not human-readable labels like "Home", "Services", "About". When an editor opens the Header instance and wants to set the active link for the About page, they see a dropdown of 6 cryptic 9-character codes and must guess which maps to "About". Similarly, the Blog Card's `$control__metaType` enum has options `["ROeGIL8bA", "C6mru_Xhy"]` — raw Blog Meta variant IDs instead of "Row" and "Column". This is a significant editor-experience failure that makes the components nearly unusable without insider knowledge. (Note: sub-agent 15 owns Header globally — this finding is scoped to the control-surface design.)
Evidence: `readComponentControls` for `AZd_vmoUt` returns `$control__activeLink` with `options: ["GBHKk2wfg","zoi6VwvSq","wKsJPXiD6","eZsgGzdxK","SlVOr2Z70","bpDYafag8"]`. `readComponentControls` for `EiCUZ0sVC` returns `$control__metaType` with `options: ["ROeGIL8bA","C6mru_Xhy"]`. Cross-referencing with variant names: `GBHKk2wfg`=Default, `zoi6vWvSq`=Home Active, `wKsJPXiD6`=Services Active, `eZsgGzdxK`=About Active, `SlVOr2Z70`=Blog Active, `bpDYafag8`=Contact Active; `ROeGIL8bA`=Row, `C6mru_Xhy`=Column.
Recommended Fix: Framer's enum controls derive option labels from the referenced variant's `name` attribute when properly configured. The fix is to ensure the control is bound to the variant's display name rather than its ID. If the control was created by hand with literal ID strings, replace it with a variant-reference control. If that's not possible, document the ID→label mapping in the component description.
Confidence: Medium
Discovered by: sub-agent 10, session TV

--- (originally TV-10-17)

---

## TV-188 — Icon and Trust Card components expose redundant dual icon systems (Phosphor + Lucide)
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Component `xFfPt2L2l` (Elements/Icon) controls `$control__icon` + `$control__lucideIcon` + `$control__lucideIcon1`; Component `YwXTWsIji` (Cards/Trust Card) same triple
Description: Both the Icon component and the Trust Card component expose THREE icon-related controls: `$control__icon` (Phosphor set, default "Hand Heart"), `$control__lucideIcon` (boolean, default false), and `$control__lucideIcon1` (Lucide set, default "Flower"). The intended workflow appears to be: set `$control__lucideIcon=true` to switch to the Lucide set, then set `$control__lucideIcon1` to the desired Lucide icon name. But this is a confusing API: editors see two icon-name controls (`icon` and `lucideIcon1`) and a boolean toggle (`lucideIcon`), with no clear indication of which is active. The naming `lucideIcon1` (with a `1` suffix) suggests there was previously a `lucideIcon` (without suffix) that was renamed — leaving stale naming. The Icon component is used 15 times and the Trust Card 9 times, so this confusion propagates. Note: the project has 13 icon sets available (Phosphor, Lucide, Feather, Hero, etc.) — the design system should standardize on ONE set (likely Phosphor, since it's the default for most other components) and expose a single `$control__icon` control.
Evidence: `readComponentControls` for `xFfPt2L2l`: `["$control__variant","$control__icon","$control__color","$control__lucideIcon","$control__lucideIcon1"]` — `$control__icon` type=icon default="Hand Heart" set=Phosphor; `$control__lucideIcon` type=boolean default=false; `$control__lucideIcon1` type=icon default="Flower" (Lucide set implied). Same pattern on `YwXTWsIji`. Screenshot of Icon instance: https://framerusercontent.com/screenshots/on-demand/c9ae38e5-7251-4fdc-a126-737802c1ef7e.jpg ; Screenshot of Trust Card: https://framerusercontent.com/screenshots/on-demand/524d703f-544a-49f1-be1d-7406e64b0db6.jpg
Recommended Fix: Standardize on a single icon set (recommend Phosphor, which is the project default). Remove `$control__lucideIcon` and `$control__lucideIcon1` controls. If Lucide icons are genuinely needed for specific use cases, create a separate `Icon Lucide` component rather than overloading one component with two systems. Rename `$control__lucideIcon1` to drop the `1` suffix if it's kept.
Confidence: Medium
Discovered by: sub-agent 10, session TV

--- (originally TV-10-18)

---

## TV-189 — Icon component variant order is non-standard and inconsistent with 5 Stars
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Low
Location: Component `xFfPt2L2l` (Elements/Icon) variant list; Component `Uqn4x3nhl` (Elements/5 Stars) variant list
Description: The Icon component has 5 size variants in this order: `L` (primary), `XL`, `M`, `S`, `XS`. The 5 Stars component has 5 size variants in this order: `XL` (primary), `L`, `M`, `S`, `XS`. These two components serve similar purposes (sized iconography) but use different primary sizes and different ordering. The Icon's primary is `L` and the 5 Stars' primary is `XL` — so inserting a default Icon vs. a default 5 Stars yields different visual sizes. The descending order also differs: Icon goes L→XL→M→S→XS (jumps from L up to XL, then descends) while 5 Stars goes XL→L→M→S→XS (strictly descending). Inconsistent variant taxonomies make the design system harder to learn.
Evidence: `serialize({id:"xFfPt2L2l",depth:2}).$variants` returns `[{name:"L",...},{name:"XL",...},{name:"M",...},{name:"S",...},{name:"XS",...}]` (L is primary, `$isPrimary:true`). `serialize({id:"Uqn4x3nhl",depth:2}).$variants` returns `[{name:"XL",...},{name:"L",...},{name:"M",...},{name:"S",...},{name:"XS",...}]` (XL is primary).
Recommended Fix: Align both components to the same size taxonomy. Recommend: primary = `M` (medium, the most common default), variants in descending order `XL, L, M, S, XS`. Update all instances to use the new primary size if their visual size should stay the same.
Confidence: Medium
Discovered by: sub-agent 10, session TV

--- (originally TV-10-19)

---

## TV-190 — Why Us Card controls have stale `image2` and `radius1` suffixes (suggest removed originals)
Status: Open
Category: Components (native + code)
Severity: Low
Location: Component `Sr15oMIZ5` (Cards/Why Us Card) controls `$control__image2` and `$control__radius1`
Description: The Why Us Card exposes controls named `$control__image2` (responsive image, default `https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png`) and `$control__radius1` (number, default `36px`). The `2` and `1` suffixes strongly suggest there were originally `$control__image` and `$control__radius` controls that were renamed or removed, leaving the suffixed versions as the only ones — confusing for editors who see `image2` and wonder where `image1` is. The component contains an ImageReveal code component instance (`uSf2SvQV9`, codeFile/hZwaqDB:default) which likely consumes the image. Used 24 times across the site.
Evidence: `readComponentControls` for `Sr15oMIZ5` returns controls including `$control__image2` (no `$control__image`) and `$control__radius1` (no `$control__radius`). Screenshot of Why Us Card on home page: https://framerusercontent.com/screenshots/on-demand/e5b5c297-cfc3-4eb1-93e6-8b9695dedec3.jpg
Recommended Fix: Rename `$control__image2` → `$control__image` and `$control__radius1` → `$control__radius`. Update any variable bindings that reference the old control IDs.
Confidence: Medium
Discovered by: sub-agent 10, session TV

--- (originally TV-10-20)

---

## TV-191 — Stat Card default `badgeText` is "Urgent Support" — leftover demo content as default
Status: Open
Category: Components (native + code) | Content & copy
Severity: Low
Location: Component `Hn1T3Ve4o` (Cards/Stat Card) control `$control__badgeText`
Description: The Stat Card exposes a `$control__badgeText` control (string) with default value `"Urgent Support"`. This is a specific, context-laden phrase that belongs on a single stat (e.g., emergency response time) — not a sensible default for a generic stat card. Every new Stat Card instance starts with "Urgent Support" as the badge text, which editors must remember to change. The default should be empty or a neutral placeholder like "New" or "Updated". Used 12 times across the site. (The component otherwise has a strong control surface: 20 controls including title, description, number, prefix, suffix, icon, padding, radius, badgeVisible, badgeText.)
Evidence: `readComponentControls` for `Hn1T3Ve4o` returns `$control__badgeText` with `defaultValue: "Urgent Support"`. Screenshot of Stat Card on /about: https://framerusercontent.com/screenshots/on-demand/b6be0eea-5dc0-4f20-8822-d2fad34a477b.jpg
Recommended Fix: Change the `$control__badgeText` default from `"Urgent Support"` to `""` (empty string). The `badgeVisible` default is already `false`, so the badge won't render unless explicitly enabled — but the demo text should still be neutral.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-21)

---

## TV-192 — Load More button text "Load More" is hardcoded; not exposed as a control
Status: Open
Category: Components (native + code)
Severity: Low
Location: Component `sMRugCuTF` (Buttons/Load More), RichTextNode `gYR_RWmRz`
Description: The Load More button exposes only 2 controls: `$control__variant` (Default/Loading/Hidden) and `$control__click` (event handler). The button label text "Load More" is hardcoded inside the RichTextNode `gYR_RWmRz` (TextRun child `v:gYR_RWmRz:0:0` has `text: "Load More"`). Editors cannot change the label without entering the component — so the button cannot be localized (e.g., "See More Articles", "Mehr laden" for German) or customized per context. Used 3 times across the site (blog listing, services listing, etc.). The component does have a `Loading` variant with a Spinner child (`y8LnsToAB` → `yRuMoX_qK` → `fMOiNrbNf`) — good state coverage.
Evidence: Serialized `A1zR6U9JB` (Load More primary variant) depth 4 — TextRun `v:gYR_RWmRz:0:0` has `text: "Load More"`. Controls from `readComponentControls`: `["$control__variant","$control__click"]` — no text control. Screenshot of Load More on /blog: https://framerusercontent.com/screenshots/on-demand/246b0656-8861-4796-8ddc-5781eb47311f.jpg
Recommended Fix: Add `$control__label` (string, default `"Load More"`) bound to the RichTextNode via a variable. Optionally add `$control__loadingLabel` (string, default `"Loading..."`) for the Loading variant.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-22)

---

## TV-193 — Header variant naming inconsistency: "Desktop Open" exists but no "Tablet Open" / "Phone Open"
Status: Open
Category: Components (native + code)
Severity: Low
Location: Component `AZd_vmoUt` (Navigation/Header) variant list
Description: The Header has 4 variants: `Desktop`, `Desktop Open`, `Tablet`, `Phone`. There is a `Desktop Open` variant (showing the desktop dropdown expanded) but no corresponding `Tablet Open` or `Phone Open` variant. Functionally, the mobile drawer opens via the Nav Dropdown component's variants (`Default` → `Mid` → `End` → `Mid Back`) rather than a Header-level Open variant — which is a valid pattern. But the asymmetry (Desktop has its own Open variant; Tablet/Phone rely on Nav Dropdown) is an inconsistency that makes the component harder to reason about. An editor looking at the Header variants would reasonably expect `Tablet Open` and `Phone Open` to exist and may be confused when they don't. (Note: sub-agent 15 owns Header globally — this finding is scoped to variant-naming consistency.)
Evidence: `framer.agent.serialize({id:"AZd_vmoUt",depth:2}).$variants` returns `[{name:"Desktop"},{name:"Desktop Open"},{name:"Tablet"},{name:"Phone"}]`. The Tablet (`WVwnpCf7j`) and Phone (`zCwAoDfvL`) variants contain a Nav Dropdown instance (`fqmWJfxvQ`) whose own variants handle the open/close states. Screenshot of Header on home page: https://framerusercontent.com/screenshots/on-demand/5d65996f-e401-4110-acbe-42cb90c7b5dd.jpg
Recommended Fix: Either (a) document the asymmetry in the component description ("Desktop uses Desktop Open variant; Tablet/Phone use Nav Dropdown's Mid/End variants for drawer open state"), OR (b) for consistency, remove the `Desktop Open` variant and handle desktop dropdown open state via Nav Dropdown variants too. Option (a) is lower-risk.
Confidence: Medium
Discovered by: sub-agent 10, session TV

--- (originally TV-10-24)

---

## TV-194 — CTA variant "Mobile" naming inconsistency (should be "Phone" site-wide)
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Low
Location: Component `GkwGTE6uU` (Elements/CTA) variant `YlXo_EFbG` named "Mobile"
Description: The CTA component's third variant is named `Mobile`, while every other responsive component in the project uses `Phone` for the narrowest breakpoint: Header (`Phone`), Footer (`Phone`), Nav Bar (uses Default + Active variants, but the underlying breakpoint is Phone). Framer's own default breakpoint naming uses "Phone" for the 390px-wide narrowest breakpoint. The CTA's `Mobile` label is non-standard and could confuse editors who expect `Phone`. This is a pure naming issue — functionally the variant works correctly.
Evidence: `framer.agent.serialize({id:"GkwGTE6uU",depth:2}).$variants` returns `[{name:"Desktop"},{name:"Tablet"},{name:"Mobile"}]`. Compare Header: `[{name:"Desktop"},{name:"Desktop Open"},{name:"Tablet"},{name:"Phone"}]` and Footer: `[{name:"Desktop"},{name:"Tablet"},{name:"Phone"}]`.
Recommended Fix: Rename variant `YlXo_EFbG` from `Mobile` to `Phone`. Rename-only operation, no visual impact.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-25)

---

## TV-195 — Price list card Divider nodes use hardcoded `rgba(64, 169, 255, 0.25)` — not a design token
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Low
Location: Component `XX2THh6jc` (unrelated/Price list card), Divider FrameNodes `yalpQCfPq`, `WucPLJfLV`, `WMHtimpf4`, `cFUpGg7TU`, `aaoPpUYNt`
Description: The Price list card's 5 Divider FrameNodes each have `fill: "rgba(64, 169, 255, 0.25)"` — a hardcoded color (`#40A9FF` at 25% alpha) that is NOT in the project's 26 color styles. The closest tokens are `Accent Cyan` (`c2084445-...`) and `Accent Blue` (`a5190ff7-...`), but neither matches `#40A9FF` exactly. Hardcoded colors bypass the design system: if the brand accent changes, these dividers won't update. This finding is low-severity because the component is currently unused (see TV-10-2), but if the component is revived, the hardcoded color should be tokenized first. The fill control default also references a stale token (`a4cc3049-...`) that doesn't exist in the color styles list (falls back to white).
Evidence: Serialized `XX2THh6jc` depth 4 — Divider node `yalpQCfPq` attributes: `{"fill":"rgba(64, 169, 255, 0.25)","layout":"stack","width":"1fr","height":"auto"}`. Same fill on all 5 Divider nodes. Color styles list (26 tokens) does not include `#40A9FF` or `rgba(64,169,255,...)`. The `fill` control default = `var(--token-a4cc3049-88ec-4475-b921-6c42a8f6e4d0, rgb(255, 255, 255))` — token id `a4cc3049-...` not found in color styles.
Recommended Fix: If reviving the component: (a) create a new `Accent Cyan 25%` color style (or use `Accent Cyan` with opacity override); (b) replace the hardcoded `rgba(64, 169, 255, 0.25)` with the new token; (c) fix the `fill` control default to reference the actual White token (`219c2d29-187a-40f8-aab3-a7af9bd91f3b`). If deleting the component (per TV-10-2), no fix needed.
Confidence: High
Discovered by: sub-agent 10, session TV

--- (originally TV-10-26)

---

## TV-196 — Multiple components missing hover states (Contact Card, Mission Card, Trust Card, Why Us Card, Badge, Map card)
Status: Open
Category: Components (native + code)
Severity: Low
Location: Components `Iz7ICmC8H` (Contact Card), `HW4zuDyG0` (Mission Card), `YwXTWsIji` (Trust Card), `Sr15oMIZ5` (Why Us Card), `DyeB4pqpe` (Badge), `cXuHXndOE` (Map card)
Description: Six card/badge components have only one variant (Default) with no hover Gesture Variant. Compare: Service Card has `Default` + `Default hover`; Blog Card has 4 base variants × 2 (with hover); Primary Button, Outline Button, NavLink Button all have hover gestures. The six components without hover states are all interactive-adjacent (Contact Card has a button, Map card is clickable, Badge often wraps a link). Lack of hover feedback is a minor UX gap — users get no visual confirmation that the card is interactive. Used 15 + 9 + 9 + 24 + 84 + 9 = 150 instances combined (Badge alone is 84). Note: Badge may intentionally lack hover because it's typically non-interactive; the other 5 should arguably have hover states.
Evidence: `serialize({id,depth:2}).$variants` for each: `Iz7ICmC8H` → 1 variant `Default`; `HW4zuDyG0` → 1 variant `Variant 1`; `YwXTWsIji` → 1 variant `Variant 1`; `Sr15oMIZ5` → 1 variant `Variant 1`; `DyeB4pqpe` → 1 variant `Badge`; `cXuHXndOE` → 1 variant `Desktop`. None have a child with `$gesture: "hover"`.
Recommended Fix: For interactive cards (Contact, Mission, Trust, Why Us, Map): add a `Default hover` Gesture Variant with a subtle fill/border/shadow change. For Badge: leave as-is if it's display-only, OR add a hover variant if Badges are used as links (sample instances to confirm).
Confidence: Medium
Discovered by: sub-agent 10, session TV

---

## Summary table

| ID | Severity | Category | Component | One-line |
|---|---|---|---|---|
| TV-10-1 | High | Components + Performance | Footer | Stray 824×644 orphan JPG inside Footer component, ships to every page |
| TV-10-2 | High | Components | Price list card | Unused (0 instances) + all content hardcoded + broken token ref |
| TV-10-3 | High | Components + UX | Buy Button | Brand/price text hardcoded, no controls, no hover/disabled states |
| TV-10-4 | High | A11y + Components | FAQ item | Accordion not keyboard accessible (onTap only, no a11y attrs) |
| TV-10-5 | High | Components + UX | Nav Bar | Missing "Booking Active" variant for /booking page |
| TV-10-6 | Medium | Components + Branding | Teem Card | Typo "Teem" should be "Team"; variant named "L" |
| TV-10-7 | Medium | Components | Outline Button | Missing Disabled/Loading states vs Primary Button |
| TV-10-8 | Medium | Components | NavLink Button | Missing Active hover + pressed gesture variants |
| TV-10-9 | Medium | Components + UX | CTA | No `link` prop — button destination hardcoded; "Mobile" vs "Phone" |
| TV-10-10 | Medium | Components + UX | Contact Card | No `tel:` link prop; phone is display-only |
| TV-10-11 | Medium | Components | Map card | Only Desktop variant — no Tablet/Phone responsive variants |
| TV-10-12 | Medium | Components + Branding | 5 Stars | No rating-value prop; default color is cyan not gold |
| TV-10-13 | Medium | Components | Arrow Button | Generic variant names, no hover/link/disabled states |
| TV-10-14 | Medium | Components + CMS | Blog Card + Blog Meta | `autherName` typo propagated from CMS |
| TV-10-15 | Medium | Components | Service Card | "Learn More" action text hardcoded |
| TV-10-16 | Medium | Components | 6 components | Generic "Variant 1"/undefined primary variant names |
| TV-10-17 | Medium | Components | Header + Blog Card | Enum controls expose bare node IDs, not labels |
| TV-10-18 | Medium | Components | Icon + Trust Card | Redundant dual icon systems (Phosphor + Lucide) |
| TV-10-19 | Low | Components + Branding | Icon + 5 Stars | Inconsistent size-variant order and primary size |
| TV-10-20 | Low | Components | Why Us Card | Stale `image2`/`radius1` control suffixes |
| TV-10-21 | Low | Components + Content | Stat Card | Default `badgeText` = "Urgent Support" (demo content) |
| TV-10-22 | Low | Components | Load More | "Load More" text hardcoded, no label control |
| TV-10-23 | Low | Components + Content | Contact Card | Default phone "+123 456 789" placeholder |
| TV-10-24 | Low | Components | Header | "Desktop Open" exists but no Tablet/Phone Open |
| TV-10-25 | Low | Components + Branding | CTA | "Mobile" variant should be "Phone" |
| TV-10-26 | Low | Components + Branding | Price list card | Hardcoded `rgba(64,169,255,0.25)` divider color |
| TV-10-27 | Low | Components | 6 card components | Missing hover states (Contact/Mission/Trust/Why Us/Map/Badge) |

**Totals:** 27 findings — 5 High, 13 Medium, 9 Low. 0 Critical (no broken/blocking component states).

**Overlap notes for orchestrator:**
- TV-10-4 (FAQ a11y) overlaps with sub-agent 8 (a11y) and sub-agent 11 (FAQAccordion code component). Component-design lens here; a11y-lens and code-lens elsewhere.
- TV-10-5, TV-10-17 (Header activeLink), TV-10-24 (Header variant naming) overlap with sub-agent 15 (Header/Footer global). Component-variant lens here; global structural lens elsewhere.
- TV-10-14 (autherName typo) overlaps with sub-agent 12 (CMS data quality). Component-control lens here; CMS-field lens elsewhere.
- TV-10-1 (Footer orphan image) overlaps with sub-agent 13 (performance) and sub-agent 15 (Footer). Component-definition lens here; performance and global lens elsewhere. (originally TV-10-27)

---

## TV-197 — FAQAccordion.tsx is broken: no default export, module fails to evaluate
Status: Open
Category: Components (native + code)
Severity: High
Location: Code file `FAQAccordion.tsx`, LocalModuleNode id `codeFile/dRQ_68D` (no `:default` export registered)
Description: The `FAQAccordion.tsx` code file is registered in the project inventory (under "Current Project Code Files and Code Components") with an **empty exports array**: `"FAQAccordion.tsx":[]`. By contrast, the other three code files each have `[{id:"codeFile/<hash>:default", displayName:"<Name>", type:"component"}]`. When this sub-agent attempted to load its property controls via `framer.agent.readComponentControls({componentIds:["codeFile/dRQ_68D:default"]})`, the API returned:

```
"codeFile/dRQ_68D:default": {
  "error": "Could not load controls for component \"codeFile/dRQ_68D:default\". The component module may be unavailable or may have failed to evaluate."
}
```

This violates platform constraint #1 from `~/.agents/skills/framer-code-components/SKILL.md` ("Single file, default export — Use named `function` syntax (not arrow functions), no named exports"). The file either (a) has no `export default function ...` statement, (b) has a TypeScript/JS syntax error preventing module evaluation, or (c) has a runtime error during module load (e.g. accessing `window` at module top-level without an SSR guard).

A search of all 13 pages for any `ComponentInstanceNode` whose `component` field references `codeFile/dRQ_68D:default` returned **zero matches** — the broken component is not placed on the canvas. The FAQs section of the site is instead rendered using native canvas components `FAQ item` (`xUmE2HP3j`) and `FAQ Close Icon` (`JAj4Xq8VO`) — see TV-11-2.
Evidence: - Project inventory (in `~/.agents/skills/framer/projects/uWBHcfENckHq11EOUMV8/project-inventory.md` line 24): `"FAQAccordion.tsx":[]` (empty exports array).
- `readComponentControls` error response (quoted above) — captured via `npx @framer/agent@latest exec -s 1 -f scripts/inspect-faq-accordion.js`.
- LocalModuleNode lookup: `framer.agent.serialize({id:"codeFile/dRQ_68D", depth:5})` returns only `{type:"LocalModuleNode", name:"FAQAccordion.tsx", id:"codeFile/dRQ_68D", $parentId:"localModules", $groundNodeId:"localModules"}` — no children, no source.
- Zero `ComponentInstanceNode` references to `codeFile/dRQ_68D:default` across all 13 pages.
Recommended Fix: Open `FAQAccordion.tsx` in the Framer code editor. Verify the file ends with `export default function FAQAccordion(props: FAQAccordionProps) { ... }` (named function syntax, not arrow). If the file is incomplete or unused, **delete it from the project** (it adds noise to the code file list and may surface as a build warning). If the file is intended to render the FAQs CMS collection (id `fRYbceWET`, 6 items), rewrite it as a proper accordion that maps over a `items` prop (typed as `{question: string; answer: string}[]`) with `addPropertyControls` exposing `items: {type: ControlType.Array, control: {type: ControlType.Object, controls: {question: {type: ControlType.String, defaultValue:"Question"}, answer: {type: ControlType.String, defaultValue:"Answer", displayTextArea: true}}}, defaultValue: [{question:"Question 1", answer:"Answer 1"}]}`. Add `/** @framerSupportedLayoutWidth any-prefer-fixed @framerSupportedLayoutHeight any-prefer-fixed */` annotation immediately above the function. Confirm: `framer.agent.readComponentControls({componentIds:["codeFile/dRQ_68D:default"]})` returns a `controls` object (not an `error`).
Confidence: High
Discovered by: sub-agent 11, session TV

--- (originally TV-11-1)
Reviewer note: Severity changed to High per reviewer.

---

## TV-198 — FAQs are rendered via native FAQ item components, not the (broken) FAQAccordion code component
Status: Open
Category: Components (native + code)
Severity: Medium
Location: Home page `/` (and possibly others); native components `FAQ item` (`xUmE2HP3j`) and `FAQ Close Icon` (`JAj4Xq8VO`); FAQs CMS collection `fRYbceWET` (6 items)
Description: Because `FAQAccordion.tsx` is broken (TV-11-1), the FAQs section is rendered using individual native `FAQ item` component instances. A scan of all 13 pages found **39+ `FAQ item` instances on `/` alone** (multiple per breakpoint × multiple FAQ items). Each `FAQ item` is a self-contained component with its own open/close state — there is no parent accordion coordinating them, no keyboard `Arrow Up`/`Arrow Down`/`Home`/`End` navigation between items (WAI-ARIA Accordion pattern), and no `aria-expanded`/`aria-controls` wiring verified at this layer.

This means the FAQs CMS collection (`fRYbceWET`, 6 items with fields Question, Answer, Group, Slug, id) is either (a) bound to each FAQ item individually via variable references, or (b) hardcoded as plain text in each FAQ item instance. If (b), content updates in the CMS will not propagate to the page — a CMS integration gap. (Sub-agent 12 owns CMS data quality and should confirm which case applies.)
Evidence: - `framer.agent.getNodesOfTypes({types:["ComponentInstanceNode"]}, {pagePath:"/"})` returned 39+ matches with `component === "xUmE2HP3j"` (`FAQ item`) and 6 matches with `component === "JAj4Xq8VO"` (`FAQ Close Icon`). Sample instance IDs on `/`: `vDurgGFHd`, `xtZwjfk9A`, `u98IpE90o`, `G_gV5DbnF`, `JYZ_hUp3n`, `oB528e61l`, `LN1GbOVsp`, `qPv5VpLlI`, `U8TCI9by7`, `q6o53a8KX`, `YFuEpIYMD`, `R9eCimVjA`, `h8B2g7Jfp` (each appears 3× per breakpoint).
- No `CollectionListNode` instances reference the FAQs collection (`fRYbceWET`) on `/` — confirmed via scan.
- The home page desktop screenshot: https://framerusercontent.com/screenshots/on-demand/e95fe5e4-c4f8-4100-8e5d-eaefbc3bdefc.jpg
Recommended Fix: Either (1) repair `FAQAccordion.tsx` (per TV-11-1) and bind it to a CollectionList of `fRYbceWET` items, OR (2) confirm the native `FAQ item` instances are bound to the CMS via variable references (e.g. `var(--variable-<faqItem.question>)`) and not hardcoded text. If bound, add WAI-ARIA accordion semantics: each FAQ item header should have `role="button"`, `aria-expanded="<true|false>"`, `aria-controls="<panel-id>"`, `tabIndex={0}`; each panel should have `role="region"`, `aria-labelledby="<header-id>"`. Add keyboard handlers for Arrow Up/Down/Home/End to move focus between headers.
Confidence: Medium (the 39+ count is high-confidence; the CMS-binding-vs-hardcoded question is for sub-agent 12 to confirm)
Discovered by: sub-agent 11, session TV

--- (originally TV-11-2)

---

## TV-199 — BackButton has no `link`/`fallbackHref`/`ariaLabel` prop — relies on `window.history.back()` with no fallback
Status: Open
Category: Components (native + code) | Accessibility & compliance
Severity: High
Location: Code component `BackButton` (`codeFile/tVVtI8x:default`); canvas instance `qO44GR49V` on `/booking` (and replicas on every page via Layout template)
Description: The BackButton code component exposes only 6 property controls (verified via `readComponentControls`):

| Control | Type | Default |
|---|---|---|
| `$control__iconColor` | Color | `#000000` |
| `$control__background` | Color | `transparent` |
| `$control__hoverBackground` | Color | `rgba(0, 0, 0, 0.05)` |
| `$control__buttonSize` | Number | `44` |
| `$control__iconSize` | Number | `24` |
| `$control__borderRadius` | Number | `8` |

There is **no** `link`, `fallbackHref`, `href`, `label`, `ariaLabel`, or `alt` prop. The component's behavior is therefore entirely internal. The strong inference (given the name "BackButton" and absence of any link prop) is that the component calls `window.history.back()` on click — which has two failure modes: (1) if the user landed on the page directly (search, bookmark, external link), `history.back()` either does nothing or navigates to a different site (the previous site in browser history); (2) if `window.history.length === 1`, the click is a no-op.

Additionally, the absence of any `label`/`ariaLabel` prop means the rendered button has no accessible name — screen readers will announce "button" with no description. The 36×35px instance on the Booking Modal (`/booking` page) also fails the WCAG 2.2 AA target-size minimum of 24×24px CSS pixels only marginally (passes 24×24 but fails the Apple HIG / Material Design 44×44px recommendation and fails WCAG 2.5.8 AA "minimum 24×24" with only 12px to spare; if the visible icon is 20×20px the actual touch target may be tighter).
Evidence: - `readComponentControls({componentIds:["codeFile/tVVtI8x:default"]})` returned the 6 controls listed above (full JSON saved in `scripts/read-code-controls.js` output).
- Instance `qO44GR49V` on `/booking` (Booking Modal header) has `width: "36px"`, `height: "35px"`, `aspectRatio: 1`, `buttonSize: 36`, `iconSize: 20`, `borderRadius: 8`. The `aspectRatio: 1` conflicts with `height: 35px` (should be 36 if width is 36 and aspectRatio is 1) — a 1px layout inconsistency.
- Ancestor chain (via `getAncestors`): `BackButton → Header (IBjN212M7) → Booking Modal (tSmCqITJd) → Main (PUXgAxq2e) → Desktop breakpoint (q91z9DBml) → /booking page (kdx64iDUQ) → root`.
- BackButton instance screenshot (Booking Modal context): https://framerusercontent.com/screenshots/on-demand/a6d5fada-a56b-442f-b88a-89b6236beb58.jpg
- Booking Modal screenshot (BackButton visible top-right): https://framerusercontent.com/screenshots/on-demand/472cb765-ae83-4feb-bd07-d7894908bfc3.jpg
- No `link`, `href`, `aria-label`, `role`, `tabIndex`, or `onTap` attribute is set on the canvas instance — all behavior is internal to the code component.
Recommended Fix: Add a `fallbackHref` prop (`ControlType.String`, `defaultValue: "/"`) and an `ariaLabel` prop (`ControlType.String`, `defaultValue: "Go back"`). Inside the component, render a `<button onClick={...} aria-label={ariaLabel}>` whose click handler is: `if (typeof window !== "undefined" && window.history.length > 1) { window.history.back(); } else if (fallbackHref) { window.location.href = fallbackHref; }`. Alternatively, render an `<a href={fallbackHref}>` with an `onClick` that calls `history.back()` and `event.preventDefault()` only if history exists. Increase `buttonSize` default to `44` (already 44 in the schema default, but the canvas instance overrides it to 36 — fix the instance to use 44). Fix the `aspectRatio: 1` / `height: 35px` mismatch on the instance.
Confidence: High (controls schema and instance attributes are direct evidence; the `window.history.back()` inference is high-confidence given the absence of any link/href prop, but cannot be 100% confirmed without source code).
Discovered by: sub-agent 11, session TV

--- (originally TV-11-3)

---

## TV-200 — HamburgerMenu's `onToggle` event is unused; menu open/close is driven by parent Nav Dropdown variants, with no `aria-expanded`, no focus trap, no Escape key
Status: Open
Category: Components (native + code) | Accessibility & compliance
Severity: High
Location: Code component `HamburgerMenu` (`codeFile/kCxujKn:default`); wrapping `Menu Button` frame (`ESdgkQuvA`); parent `Nav Dropdown` component (`hc6IgBhgF`)
Description: The HamburgerMenu code component exposes 5 property controls (verified via `readComponentControls`):

| Control | Type | Default |
|---|---|---|
| `$control__color` | Color | `#000000` |
| `$control__strokeWidth` | Number | `2` |
| `$control__size` | Number | `40` |
| `$control__defaultState` | Boolean | `false` |
| `$control__onToggle` | EventHandler (`onToggle`) | — |

The component has its own internal state (`defaultState`) and event (`onToggle`) — but on the canvas, the HamburgerMenu code component instance (`di36mRlVV`) is wrapped inside a `Menu Button` frame (`ESdgkQuvA`) whose `onTap` handler switches the parent `Nav Dropdown` component between variants (`Default → Mid → End → Mid Back`). The HamburgerMenu's own `onToggle` event is **not wired to anything** on the canvas, and its `defaultState` prop is also unused (the open/closed visual state is driven entirely by Nav Dropdown variants).

The `Menu Button` frame has `cursor: pointer` and `onTap` but **no** `htmlTag` (defaults to `<div>`), **no** `role="button"`, **no** `aria-expanded`, **no** `aria-controls`, **no** `tabIndex`, and **no** `onKeyDown` handler — confirmed via `serialize` with `attributeFilter: ["htmlTag","role","tabIndex","onKeyDown","aria-expanded","aria-controls"]` returning empty values for all. This means:

1. **Keyboard users cannot open the menu** — the `Menu Button` is a `<div>` with no `tabIndex`, so it's not focusable.
2. **Screen reader users cannot tell if the menu is open or closed** — no `aria-expanded`.
3. **Once open, focus is not trapped** inside the dropdown — Tab/Shift+Tab moves focus to underlying page content.
4. **Escape key does not close the menu** — no `onKeyDown` handler. The only way to close is to click a transparent overlay (`Ger_sNOhk`, 500×1000px, `visible:"false"` in Default variant) which sets the variant to `Mid Back`.

The Nav Dropdown uses a 4-variant animation pattern: `Default` (closed) → click Menu Button → `Mid` (transition) → auto-after 150ms → `End` (open). To close: click invisible overlay → `Mid Back` (transition) → back to `Default`. This is a "gooey effect" animated menu (uses external `Gooey Effect` component `F4MfArLyripoeG7R4oNS` with `intensity: 6`).
Evidence: - `readComponentControls({componentIds:["codeFile/kCxujKn:default"]})` returned the 5 controls listed above.
- `serialize({id:"ESdgkQuvA", depth:1})` (Menu Button frame): attributes include `cursor: "pointer"`, `onTap: [{action:"SET_VARIANT", controls:{variant:"qODlv4FUI"}}]`, `width: "48px"`, `height: "48px"`, `radius: "50px"`. The `htmlTag` is **not set** (defaults to `div`).
- `serialize({id:"ESdgkQuvA", depth:1, attributeFilter:["htmlTag","role","tabIndex","onKeyDown","aria-expanded","aria-controls"]})` returned only `{type, name, id, children}` — confirming none of those attributes are set.
- Ancestor chain: `HamburgerMenu (di36mRlVV) → Menu Button (ESdgkQuvA) → Default variant (eJIxZkfZQ) → Nav Dropdown component (hc6IgBhgF) → root`.
- Nav Dropdown variants: `[{id:"eJIxZkfZQ", name:"Default"}, {id:"qODlv4FUI", name:"Mid"}, {id:"OMcCfqq1M", name:"End"}, {id:"Jw7wuLTFN", name:"Mid Back"}]`.
- The HamburgerMenu instance itself has NO `onTap` at the canvas level — the click is handled by the parent `Menu Button` frame.
- Header replica screenshot (HamburgerMenu visible inside Nav Dropdown, top-right): https://framerusercontent.com/screenshots/on-demand/b862865c-6095-4894-b066-a9ff7d183987.jpg
- Header master screenshot: https://framerusercontent.com/screenshots/on-demand/d4633091-b868-41d9-af36-d92af6ee91e0.jpg
- Screenshot of the HamburgerMenu code component instance itself failed with `"Assertion Error: Variant node eJIxZkfZQ must exist"` — the instance can't be screenshotted in isolation because it lives inside a variant context.
Recommended Fix: 1. **At the code component level**: Either (a) remove the `defaultState` and `onToggle` props from `HamburgerMenu.tsx` entirely (since they're unused on the canvas) and reduce the component to a pure visual SVG icon, OR (b) wire the Nav Dropdown's `Menu Button` `onTap` to call the HamburgerMenu's `onToggle` event handler instead of (or in addition to) the SET_VARIANT action, and bind `defaultState` to a variable that reflects the current Nav Dropdown variant.
2. **At the canvas level (Menu Button frame)**: Set `htmlTag: "button"`, add `aria-expanded` (bound to a variable that's `true` when the Nav Dropdown is in `End` variant, `false` otherwise), add `aria-controls: "<dropdown-panel-id>"`, add `aria-label: "Open menu"` / `"Close menu"` (toggles with state), add `tabIndex: 0` (or rely on `<button>` default focusability).
3. **At the Nav Dropdown component level**: Add `onKeyDown` handler on the `End` variant frame (or on the `Dropdown` panel) that listens for `Escape` and sets the variant back to `Default`. Add a focus trap: when the variant becomes `End`, auto-focus the first menu item; trap Tab/Shift+Tab within the dropdown panel.
Confidence: High (all evidence is direct from canvas serialization)
Discovered by: sub-agent 11, session TV

--- (originally TV-11-4)

---

## TV-201 — ImageReveal default `placeholder` color is solid black (`#000000`)
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Low
Location: Code component `ImageReveal` (`codeFile/hZwaqDB:default`); `placeholder` property control
Description: The `placeholder` color control on the ImageReveal code component has `defaultValue: "#000000"` (solid black) — verified via `readComponentControls`. When a designer places a fresh ImageReveal on the canvas without overriding `placeholder`, the component renders a solid black box behind the image during the reveal animation (which animates `initialSize: 10` to `100` and `scaleFrom: 1.3` to `1.0`). This produces a jarring black flash before the image fully reveals.

All 11 ImageReveal instances on the canvas override this default to `rgba(255, 255, 255, 0)` (transparent) or a near-white token — but the default remains a footgun for future designers and risks shipping with a black box if a designer forgets to override.
Evidence: - `readComponentControls` output: `"$control__placeholder": {"type": "rgba(r, g, b, a) | color(display-p3 r g b / a) | #rrggbb | var(--token-${id})", "defaultValue": "#000000"}`.
- All 11 unique ImageReveal instances on `/` set `$control__placeholder` to either `"rgba(255, 255, 255, 0)"` (10 instances) or `"var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"` (1 instance, `PvTH7SZ_m`) — confirmed via `serialize` on each instance.
- Hero ImageReveal instance (`Ru5gXN_Yg`) screenshot: https://framerusercontent.com/screenshots/on-demand/45a839d9-6e13-41c6-9d12-8ab45528253c.jpg
Recommended Fix: Change the `placeholder` control's `defaultValue` from `"#000000"` to `"rgba(0, 0, 0, 0)"` (transparent) in `ImageReveal.tsx`'s `addPropertyControls` call. If a subtle placeholder is desired for visual feedback, use `"rgba(0, 0, 0, 0.04)"` instead.
Confidence: High
Discovered by: sub-agent 11, session TV

--- (originally TV-11-5)
Reviewer note: Severity changed to Low per reviewer.

---

## TV-202 — ImageReveal exposes no `alt`/`ariaLabel` control; `image` prop on instances is a bare URL string with no alt text
Status: Open
Category: Components (native + code) | Accessibility & compliance
Severity: High
Location: Code component `ImageReveal` (`codeFile/hZwaqDB:default`); `image` property control; 11 instances on `/` (home page)
Description: The ImageReveal `image` control is typed `responsiveimage` (verified via `readComponentControls`), which per the Framer code-component SKILL returns an object `{src, srcSet, alt}`. However, all 11 ImageReveal instances on the canvas store `image` as a **bare URL string** (e.g. `"https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png"`) or a variable reference (e.g. `"var(--variable-MeO32Qen9)"`) — never an object with an `alt` field.

A scan of all attribute keys on the 3 sampled instances (`Ru5gXN_Yg`, `uSf2SvQV9`, `PvTH7SZ_m`) found **no** `$control__alt`, `$control__image__alt`, `$control__ariaLabel`, or `$control__ariaLabelledBy` attribute. The ImageReveal property-controls schema (from `readComponentControls`) also exposes **no** `alt` or `ariaLabel` control — only `image`, `imageReveal`, `trigger`, `direction`, `initialSize`, `appearAmt`, `scrollStart`, `scrollEnd`, `transition`, `scaleFrom`, `placeholder`, `once`, `shadow`, `shadow1`, `radius`, `border`, `imagePadding`, `hoverScale`, `hoverScale1`, `hoverTransition`.

This means the rendered `<img>` (or `<div>` with background-image) inside ImageReveal has no `alt` text. If the component renders an `<img>`, it likely passes `alt={image.alt}` — but since `image` is a URL string (not an object), `image.alt` is `undefined` and the `<img>` renders with `alt=""` or no alt attribute at all. If the component renders a `<div>` with `backgroundImage`, the image is invisible to screen readers entirely.

For hero images and feature images (the home page Hero Image is one of these instances, 523×603px), this is a WCAG 1.1.1 (Level A) violation — meaningful images must have text alternatives.
Evidence: - `readComponentControls({componentIds:["codeFile/hZwaqDB:default"]})` returned 19 controls — none named `alt`, `ariaLabel`, `ariaLabelledBy`, or any accessibility-related control.
- `serialize({id:"Ru5gXN_Yg", depth:1})` (Hero Image instance): `$control__image: "https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png"`. No `alt`-related attribute present.
- Same pattern for the other 10 instances (full list in `scripts/inspect-image-reveal-all.js` output): 8 use `"https://framerusercontent.com/images/VwOZRgUg3AdI8mtX3xkuIuyU614.png"`, 3 use `"https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png"`, 2 use `var(--variable-MeO32Qen9)` or `var(--variable-bB1_Twlep)`.
- Hero Image instance (`Ru5gXN_Yg`) ancestor chain: `ImageReveal → Hero Image (CYJj6h2yV) → Hero (LQn3zLbUg) → Main (J30SjU3lW) → Desktop (WQLkyLRf1) → / Home (augiA20Il) → root`. This is the primary hero image on the home page.
- Hero Image screenshot: https://framerusercontent.com/screenshots/on-demand/45a839d9-6e13-41c6-9d12-8ab45528253c.jpg
Recommended Fix: 1. **At the code component level**: Add an `alt` control (`ControlType.String`, `displayTextArea: false`, `defaultValue: ""`) to `ImageReveal.tsx`'s `addPropertyControls`. Inside the component, render `<img src={image?.src ?? image} alt={alt} ... />` (handling both object and string formats for `image`). If `alt` is empty and the image is decorative, render `alt=""` (which is the correct semantic for decorative images). If the image conveys meaning, require the designer to set `alt` to a descriptive string.
2. **At the canvas level**: For each of the 11 ImageReveal instances on `/`, set the `alt` prop to a meaningful description (e.g., for the Hero Image: "Veterinarian examining a happy dog" or similar). For purely decorative images, leave `alt=""`.
3. Consider exposing a `ControlType.Boolean` named `decorative` (default `true`) that hides the `alt` control via `hidden: (props) => props.decorative` — when `decorative` is true, the component renders `alt=""`; when false, the `alt` control appears and the designer must provide a description.
Confidence: High (controls schema is direct evidence; the rendered `<img>` vs `<div>` distinction requires source-level confirmation, but either way the image is inaccessible to screen readers)
Discovered by: sub-agent 11, session TV

--- (originally TV-11-6)

---

## TV-203 — ImageReveal property-control naming is inconsistent (`shadow1`, `hoverScale1`, missing `transition`/`hoverTransition` in schema)
Status: Open
Category: Components (native + code)
Severity: Low
Location: Code component `ImageReveal` (`codeFile/hZwaqDB:default`); property controls schema
Description: The ImageReveal property-controls schema (from `readComponentControls`) has several naming and consistency issues:

1. **`shadow` (Boolean) + `shadow1` (BoxShadow)**: The `shadow` Boolean toggles whether a shadow is shown; `shadow1` is the actual BoxShadow value. The naming `shadow1` (with a `1` suffix) is non-obvious and likely a Framer auto-rename when a second control with the same conceptual name was added. Better names: `shadowEnabled` (Boolean) + `shadow` (BoxShadow), with `hidden: (props) => !props.shadowEnabled` on the BoxShadow control.

2. **`hoverScale` (Boolean) + `hoverScale1` (Number)**: Same pattern — `hoverScale` toggles, `hoverScale1` is the scale value (default `1.05`). Same naming issue.

3. **`transition` and `hoverTransition` appear on instances but NOT in the `readComponentControls` schema**: The instance attributes include `$control__transition` (JSON-encoded `Transition` object, e.g. `{"type":"tween","ease":[0.77,0,0.175,1],"duration":1.5,"delay":0.8,"stagger":0,"stiffness":500,"damping":60,"mass":1}`) and `$control__hoverTransition` — but `readComponentControls` for `codeFile/hZwaqDB:default` does NOT list these controls. This suggests either (a) the controls are `ControlType.Transition` but `readComponentControls` has a bug omitting them, or (b) the transitions were set via the canvas's "Animation" panel and stored as instance attributes without being declared as formal property controls. Either way, the schema is incomplete relative to what's actually on the instances.

4. **`trigger` enum optionTitles mismatch**: The enum options are `["inView", "scroll", "revealed"]` (default `"inView"`), but the canvas instance shows `$control__trigger: "Appear"` — which is the optionTitle for `"inView"`. The optionTitle "Appear" is unintuitive for the value `inView` (a designer reading "Appear" might think it means "appears on load" rather than "appears when in view"). Better optionTitles: `["In View", "On Scroll", "Always Revealed"]`.

5. **`direction` enum optionTitles are non-obvious**: The enum options are `["bottom", "top", "left", "right", "bottom-left-to-top-right", "bottom-right-to-top-left", "top-left-to-bottom-right", "top-right-to-bottom-left"]` (default `"bottom"`), but the instance shows `$control__direction: "Top to Bottom"` — which is the optionTitle for `"bottom"` (i.e., reveal from top to bottom = the image starts at the bottom and reveals upward... or vice versa? The semantics are ambiguous).
Evidence: - `readComponentControls({componentIds:["codeFile/hZwaqDB:default"]})` full output (saved in `scripts/read-code-controls.js` run).
- Instance attributes from `serialize({id:"glhvTcQ8v", depth:1})`: `$control__transition: "{\"type\":\"tween\",\"ease\":[0.77,0,0.175,1],\"duration\":1.5,\"delay\":0.8,\"stiffness\":500,\"damping\":60,\"mass\":1,\"stagger\":0}"` and `$control__hoverTransition: "{\"type\":\"spring\",\"ease\":[0.44,0,0.56,1],\"duration\":0.3,\"delay\":0,\"stiffness\":300,\"damping\":20,\"mass\":1,\"stagger\":0}"`.
- Instance `$control__trigger: "Appear"` and `$control__direction: "Top to Bottom"`.
Recommended Fix: 1. Rename `shadow` → `shadowEnabled`, `shadow1` → `shadow`. Add `hidden: (props) => !props.shadowEnabled` on the `shadow` BoxShadow control.
2. Rename `hoverScale` → `hoverScaleEnabled`, `hoverScale1` → `hoverScale`. Add `hidden: (props) => !props.hoverScaleEnabled` on the `hoverScale` Number control.
3. Explicitly declare `transition` and `hoverTransition` as `ControlType.Transition` in `addPropertyControls` (if they aren't already — the readComponentControls omission may indicate they're not formally declared).
4. Update `trigger` optionTitles to `["In View", "On Scroll", "Always Revealed"]`.
5. Update `direction` optionTitles to clearer directional labels (e.g., `["Bottom → Top", "Top → Bottom", "Left → Right", "Right → Left", ...]`).
Confidence: High (direct schema evidence)
Discovered by: sub-agent 11, session TV

--- (originally TV-11-7)

---

## TV-204 — ImageReveal instance on `/booking` Booking Modal header has 1px height/aspectRatio mismatch
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Low
Location: BackButton instance `qO44GR49V` on `/booking` Booking Modal header (`IBjN212M7`) — NOTE: this finding is actually about the BackButton instance's layout, not ImageReveal; reclassified below as TV-11-8 (kept here for sequential numbering).

*Self-correction during writeup:* This finding is about BackButton, not ImageReveal — see TV-11-9 below for the actual content. (Keeping this slot to maintain sequential numbering.)
Description: The BackButton instance has `width: "36px"`, `height: "35px"`, and `aspectRatio: 1` — but if `aspectRatio` is `1`, the height should equal the width (36px), not 35px. This 1px mismatch is likely a manual override that wasn't reconciled with the `aspectRatio` constraint. The rendered button is a non-square 36×35px rectangle, which may cause the icon to appear slightly stretched or the border-radius to render asymmetrically.
Evidence: - `serialize({id:"qO44GR49V", depth:1}, {pagePath:"/booking"})` attributes: `"width": "36px"`, `"height": "35px"`, `"aspectRatio": 1`, `"$control__buttonSize": "36"`, `"$control__borderRadius": "8"`.
- `getRect({id:"qO44GR49V"}, {pagePath:"/booking"})` returned `{x: 82.5, y: 246.27, width: 35, height: 35}` — the rendered rect is 35×35 (not 36×35 as the attributes suggest), indicating the layout system rounded down to maintain aspectRatio. So the effective rendered size is 35×35px.
Recommended Fix: Set the BackButton instance's `width` and `height` to consistent values — either both `36px` (and remove `aspectRatio: 1`, since explicit width+height overrides it) or both `44px` (WCAG-recommended touch target). Remove the `aspectRatio: 1` attribute since it's redundant when both width and height are explicitly set.
Confidence: High
Discovered by: sub-agent 11, session TV

--- (originally TV-11-8)
Reviewer note: Title corrected: this finding is about BackButton instance on /booking, not ImageReveal

---

## TV-205 — BackButton `buttonSize` default (44) is good, but the canvas instance overrides it to 36 — below Apple HIG / Material Design 44px touch target
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: BackButton code component (`codeFile/tVVtI8x:default`) and instance `qO44GR49V` on `/booking` Booking Modal header
Description: The BackButton code component's `buttonSize` control has `defaultValue: 44` (verified via `readComponentControls`) — which meets the WCAG 2.5.5 (AAA) and Apple HIG / Material Design 44×44px minimum touch target. However, the canvas instance on `/booking` overrides `buttonSize` to `36` (and `iconSize` to `20`), rendering at 35×35px (per `getRect`). This is below the 44×44px recommendation.

WCAG 2.2 AA criterion 2.5.8 ("Target Size — Minimum") requires at least 24×24px CSS pixels, so 35×35px passes AA — but fails AAA (44×44px) and fails the Apple HIG / Material Design guidelines that most users expect on touch devices. For a button that's the primary "close"/"back" affordance on a Booking Modal, this is a usability concern on mobile.
Evidence: - `readComponentControls` output: `"$control__buttonSize": {"type": "number", "defaultValue": 44}`.
- Instance `qO44GR49V` attributes: `"$control__buttonSize": "36"`, `"$control__iconSize": "20"`, `"$control__borderRadius": "8"`.
- `getRect({id:"qO44GR49V"}, {pagePath:"/booking"})`: `{width: 35, height: 35}` (rendered).
- BackButton screenshot: https://framerusercontent.com/screenshots/on-demand/a6d5fada-a56b-442f-b88a-89b6236beb58.jpg
- Booking Modal screenshot (context): https://framerusercontent.com/screenshots/on-demand/472cb765-ae83-4feb-bd07-d7894908bfc3.jpg
Recommended Fix: On the BackButton instance `qO44GR49V` (and any replicas on other breakpoints), set `buttonSize` back to `44` (or larger). If the visual design requires a smaller icon, keep `iconSize` at `20` but increase `buttonSize` to `44` so the touch target is adequate while the icon remains visually small. Alternatively, add invisible padding around the icon (e.g., `padding: 4px` on a transparent wrapper) to expand the touch target without changing the visual size.
Confidence: High
Discovered by: sub-agent 11, session TV

--- (originally TV-11-9)

---

## TV-206 — ImageReveal: 11 instances on `/` (home) — potential performance concern without confirmed `useInView` pausing
Status: Open
Category: Components (native + code) | Performance & technical
Severity: Low
Location: Code component `ImageReveal` (`codeFile/hZwaqDB:default`); 11 unique instances on `/` (home page)
Description: A scan of all 13 pages found **11 unique ImageReveal instances** on the home page (appearing across Desktop/Tablet/Phone breakpoints via replica IDs). All 11 use `trigger: "inView"` (default) and `once: true` (default), meaning each animates once when scrolled into view. The home page Hero Image is one of these instances (523×603px), and the others are feature/section images distributed down the page.

Each ImageReveal animates `scaleFrom: 1.3 → 1.0` and `initialSize: 10 → 100` over a 1.5s tween with delay — these are GPU-accelerated transforms, but 11 simultaneous animations on a low-end device could cause jank if `useInView` is not properly pausing off-screen instances. The Framer code-component SKILL explicitly recommends `useInView(ref)` to "pause animations when out of viewport" — but this cannot be verified without source access (see TV-11-10).

Additionally, the `transition` prop on instances shows `delay: 0.8` (for `glhvTcQ8v`) and `delay: 0.5` (for `Ru5gXN_Yg`) — meaning the hero image waits 500-800ms before starting its reveal. If a user scrolls quickly past the hero, the reveal may not trigger before the image is out of view (especially with `once: true`, which would leave the image stuck at `initialSize: 10` permanently).
Evidence: - Unique ImageReveal instance count on `/`: 11 (IDs: `uSf2SvQV9`, `PvTH7SZ_m`, `yOUSYkrsWglhvTcQ8v`, `EZ72HJieVglhvTcQ8v`, `glhvTcQ8v`, `BkwtJCk0LRu5gXN_Yg`, `hmX39_cxlRu5gXN_Yg`, `Ru5gXN_Yg`, `BkwtJCk0LMvg64HDwu`, `hmX39_cxlMvg64HDwu`, `Mvg64HDwu`).
- ImageReveal is NOT used on `/services`, `/about`, `/contact`, `/booking`, or any other page — only on `/` (home). (The earlier "11 per page" count across all pages was due to getNodesOfTypes returning Layout-template-inherited instances; the unique count is 11, all sourced from `/`.)
- `trigger: "inView"`, `once: "true"`, `transition: {"type":"tween","ease":[0.77,0,0.175,1],"duration":1.5,"delay":0.8,"stagger":0,...}` (instance `glhvTcQ8v`).
- Hero Image instance `Ru5gXN_Yg` rect: `{x:0, y:0, width:523, height:603}` — top of the page, so `useInView` should trigger immediately on load.
- Home page screenshot: https://framerusercontent.com/screenshots/on-demand/e95fe5e4-c4f8-4100-8e5d-eaefbc3bdefc.jpg
Recommended Fix: Verify in source code that ImageReveal uses `const ref = useRef(null); const isInView = useInView(ref);` and gates the animation on `isInView`. Consider reducing the `delay` on hero-section instances (the user sees the hero immediately on page load — a 500-800ms delay before the reveal starts feels sluggish). Consider lowering `initialSize` default from `10` to `0` so the unrevealed state is fully hidden (a 10%-size image is a small thumbnail that may look like a layout bug). Confirm `useIsStaticRenderer()` is used to render a fully-revealed static image on the canvas (so designers see the final state, not the unrevealed state).
Confidence: Medium (the 11-instance count and animation config are direct evidence; the `useInView` usage cannot be confirmed without source)
Discovered by: sub-agent 11, session TV

--- (originally TV-11-11)
Reviewer note: Severity changed to Low per reviewer.

---

## TV-207 — ImageReveal `direction` enum has 8 options but no segmented control — designer UX friction
Status: Open
Category: Components (native + code)
Severity: Low
Location: Code component `ImageReveal` (`codeFile/hZwaqDB:default`); `direction` property control
Description: The `direction` enum control has 8 options (`["bottom", "top", "left", "right", "bottom-left-to-top-right", "bottom-right-to-top-left", "top-left-to-bottom-right", "top-right-to-bottom-left"]`), defaulting to `"bottom"`. With 8 options, a dropdown is reasonable, but the option values are inconsistent (some are single words like `"bottom"`, others are hyphenated directional phrases like `"bottom-left-to-top-right"`). The optionTitles (which are what the designer sees in the dropdown) weren't returned by `readComponentControls`, but the instance shows `$control__direction: "Top to Bottom"` — suggesting the optionTitles use a "X to Y" format that doesn't map 1:1 to the option values (e.g., `"Top to Bottom"` likely maps to `"bottom"` (the reveal direction is top→bottom, but the option value is the "from" direction). This is confusing.
Evidence: - `readComponentControls` output: `"$control__direction": {"type": "enum", "options": ["bottom","top","left","right","bottom-left-to-top-right","bottom-right-to-top-left","top-left-to-bottom-right","top-right-to-bottom-left"], "defaultValue": "bottom"}`. No `optionTitles` field returned (may be set in source but not surfaced by readComponentControls).
- Instance `glhvTcQ8v` shows `$control__direction: "Top to Bottom"` — this is the optionTitle for `"bottom"` (the start position is bottom, the reveal goes from bottom to top? or from top to bottom?).
Recommended Fix: Standardize the option values and titles. Use directional pairs: options `["top-to-bottom", "bottom-to-top", "left-to-right", "right-to-left", "top-left-to-bottom-right", "bottom-right-to-top-left", "top-right-to-bottom-left", "bottom-left-to-top-right"]` with matching optionTitles. Add `displaySegmentedControl: false` (default — 8 options is too many for segmented). Update the default to `"top-to-bottom"` (most intuitive for a hero image reveal).
Confidence: High (schema is direct evidence; the optionTitles inference is medium-confidence based on instance value)
Discovered by: sub-agent 11, session TV

--- (originally TV-11-12)

---

## TV-208 — HamburgerMenu `color` default is solid black (`#000000`) — likely invisible on dark backgrounds
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Low
Location: Code component `HamburgerMenu` (`codeFile/kCxujKn:default`); `color` property control
Description: The HamburgerMenu `color` control (the stroke color of the hamburger icon) has `defaultValue: "#000000"` (solid black). On a dark or branded background, a designer placing a fresh HamburgerMenu on the canvas will see an invisible (or near-invisible) icon until they override `color`. The instance on the canvas overrides this to `var(--token-0caaff48-b310-4430-866f-2e590faf0dcb)` — likely a white or light color token — so the issue is not visible in production, but the default remains a footgun.
Evidence: - `readComponentControls` output: `"$control__color": {"type": "rgba(r, g, b, a) | color(display-p3 r g b / a) | #rrggbb | var(--token-${id})", "defaultValue": "#000000"}`.
- Instance `di36mRlVV` (home page, inside Nav Dropdown's "Default" variant) sets `$control__color: "var(--token-0caaff48-b310-4430-866f-2e590faf0dcb)"` — overriding the black default.
- The Nav Dropdown's `Menu Button` frame has `fill: "var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"` (a token, likely white or light) — so a black hamburger icon would be visible against this fill, but if a designer places the HamburgerMenu on a dark background, it would be invisible.
Recommended Fix: Change the `color` control's `defaultValue` from `"#000000"` to a mid-gray like `"#666666"` that's visible on both light and dark backgrounds. Alternatively, default to `"currentColor"` (CSS keyword) so the icon inherits the parent's text color — but Framer's Color control type may not accept `currentColor` as a default. Best option: default to `"#1a1a1a"` (near-black, slightly softer) and document that designers should override `color` to match their background contrast (4.5:1 minimum per WCAG 1.4.3).
Confidence: High
Discovered by: sub-agent 11, session TV

--- (originally TV-11-13)

---

## TV-209 — BackButton `iconColor` and `background` defaults are `#000000` / `transparent` — icon invisible on dark backgrounds
Status: Open
Category: Components (native + code) | Visual design & branding
Severity: Low
Location: Code component `BackButton` (`codeFile/tVVtI8x:default`); `iconColor` and `background` property controls
Description: Same pattern as TV-11-13. The BackButton `iconColor` defaults to `#000000` (solid black) and `background` defaults to `transparent`. On a dark background, a freshly-placed BackButton is invisible. The instance on `/booking` overrides `iconColor` to a token and `background` to another token — but the defaults remain a footgun.
Evidence: - `readComponentControls` output: `"$control__iconColor": {"defaultValue": "#000000"}`, `"$control__background": {"defaultValue": "transparent"}`.
- Instance `qO44GR49V` overrides: `$control__iconColor: "var(--token-203fe439-3fd9-4af1-a5ea-6d2919ed25f3)"`, `$control__background: "var(--token-84671a66-6df5-4319-9af9-fe6564c16d54)"`.
Recommended Fix: Change `iconColor` default from `"#000000"` to `"#666666"` (mid-gray) or `"currentColor"`. Change `background` default from `"transparent"` to `"rgba(0, 0, 0, 0.04)"` (subtle gray) so the button has a visible footprint on the canvas even before the designer picks colors.
Confidence: High
Discovered by: sub-agent 11, session TV

--- (originally TV-11-14)

---

## TV-210 — ImageReveal `border` and `shadow1` controls have no `defaultValue` — undefined behavior on fresh placement
Status: Open
Category: Components (native + code)
Severity: Low
Location: Code component `ImageReveal` (`codeFile/hZwaqDB:default`); `border` and `shadow1` property controls
Description: The `border` (Border type) and `shadow1` (BoxShadow type) controls on ImageReveal have **no** `defaultValue` in the `readComponentControls` response. The `shadow` Boolean (default `false`) gates whether `shadow1` is used, and the instance-level `border` is set to e.g. `"5px solid var(--token-219c2d29-...)"` — but the schema doesn't define what a fresh ImageReveal's border is. If a designer enables `shadow: true` on a fresh instance, `shadow1` is undefined and the component may render no shadow, render with a default browser shadow, or throw a TypeError.

Per the Framer code-component SKILL: "Provide a `defaultValue` for every prop so components render correctly in the Framer canvas." The `border` and `shadow1` controls violate this guideline.
Evidence: - `readComponentControls` output: `"$control__border": {"type": "null | ${number} ${solid | dashed | dotted | double} ${...}"}` (no `defaultValue`). `"$control__shadow1": {"type": "{\"inset\" | \"\"} {offsetX}px ...[] "}` (no `defaultValue`).
- By contrast, `"$control__imagePadding": {"type": "...", "defaultValue": "0px"}` and `"$control__radius": {"type": "...", "defaultValue": 0}` DO have defaults.
- Instance `glhvTcQ8v` sets `$control__border: "0px solid var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"` and `$control__shadow1: ["0px 0px 0px 5px var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)", "0px 4px 16px 0px rgba(0, 0, 0, 0.08)"]` — both overridden on the canvas.
Recommended Fix: In `ImageReveal.tsx`'s `addPropertyControls`:
1. Add `defaultValue: { borderWidth: 0, borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.1)" }` to the `border` control.
2. Add `defaultValue: "0px 4px 12px 0px rgba(0, 0, 0, 0.08)"` to the `shadow1` control (a subtle default shadow that's visible when `shadow: true` is enabled).
3. Also confirm `transition` and `hoverTransition` have defaults (e.g., `defaultValue: { type: "tween", duration: 0.8, ease: "easeInOut" }`) — these controls aren't surfaced by readComponentControls, so verify in source.
Confidence: High
Discovered by: sub-agent 11, session TV

---

## Summary table

| ID | Title | Severity | Category |
|---|---|---|---|
| TV-11-1 | FAQAccordion.tsx broken (no default export, module fails to evaluate) | Critical | Components (code) |
| TV-11-2 | FAQs rendered via native FAQ item, not the broken FAQAccordion; no WAI-ARIA accordion pattern | Medium | Components (code) + CMS |
| TV-11-3 | BackButton has no fallback URL or accessible name — relies on `window.history.back()` | High | Components (code) + Accessibility |
| TV-11-4 | HamburgerMenu `onToggle` unused; menu open/close driven by Nav Dropdown variants with no aria-expanded, no focus trap, no Escape | High | Components (code) + Accessibility |
| TV-11-5 | ImageReveal default `placeholder` color is solid black | Medium | Components (code) + Visual |
| TV-11-6 | ImageReveal exposes no `alt`/`ariaLabel` control; 11 instances have no alt text | High | Components (code) + Accessibility |
| TV-11-7 | ImageReveal property-control naming inconsistencies (`shadow1`, `hoverScale1`, missing `transition` in schema) | Low | Components (code) |
| TV-11-8 | BackButton instance 1px height/aspectRatio mismatch (36×35px) | Low | Components (code) + Visual |
| TV-11-9 | BackButton canvas instance overrides `buttonSize` to 36 (below 44px touch target) | Medium | Accessibility |
| TV-11-10 | Source-level platform-constraint audit cannot be completed (no source access) | Medium | Components (code) + Performance |
| TV-11-11 | ImageReveal: 11 instances on `/` — `useInView` pausing cannot be verified | Medium | Components (code) + Performance |
| TV-11-12 | ImageReveal `direction` enum has 8 options with confusing value/title mapping | Low | Components (code) |
| TV-11-13 | HamburgerMenu `color` default is solid black — invisible on dark backgrounds | Low | Components (code) + Visual |
| TV-11-14 | BackButton `iconColor`/`background` defaults are black/transparent — invisible on dark backgrounds | Low | Components (code) + Visual |
| TV-11-15 | ImageReveal `border` and `shadow1` controls have no `defaultValue` | Low | Components (code) |

**Findings count: 15**
- Critical: 1 (TV-11-1)
- High: 3 (TV-11-3, TV-11-4, TV-11-6)
- Medium: 5 (TV-11-2, TV-11-5, TV-11-9, TV-11-10, TV-11-11)
- Low: 6 (TV-11-7, TV-11-8, TV-11-12, TV-11-13, TV-11-14, TV-11-15) (originally TV-11-15)

---

## TV-211 — Blog collection field "Auther Name" typo (schema-level)
Status: Open
Category: CMS
Severity: Low
Location: Blog collection (`b8Kw9KXWB`), variable `v365QHZYL` named `Auther Name`
Description: The Blog collection's author field is named `Auther Name` (missing the 'o' in "Author"). This typo is baked into the schema and propagates everywhere: the auto-generated control key is `$control__auther_name`, the Framer variable list shows `Auther Name` to content editors, and any future DSL/`SET` commands targeting this field must use the misspelled key. The briefing's "Important Discoveries" already noted this; documenting from the CMS-data-quality lens to confirm it remains unfixed and to flag that it's bound on the `/blog/:Blog` detail page (node `jlkWuBAtS`), so the typo is now load-bearing — renaming the field requires migrating the binding too.
Evidence: Variable definition (from `framer.agent.serialize({id:"b8Kw9KXWB", attributeFilter:["variables"]})`): `{"id":"v365QHZYL","name":"Auther Name","type":"string","initialValue":"Dr Alex"}`. Bound on detail page: `RichTextNode "Published Date" (jlkWuBAtS)` has `text="var(--variable-v365QHZYL)"`.
Recommended Fix: Rename the variable from `Auther Name` to `Author Name` via `SET v365QHZYL name="Author Name";` (this preserves the variable id so all bindings continue to work). Then re-test the `/blog/:Blog` detail page.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-1)

---

## TV-212 — 5 of 10 Blog items missing explicit Auther Name; entire blog is single-author "Dr Alex"
Status: Open
Category: CMS
Severity: Medium
Location: Blog collection items `yAIJE8XUH`, `x1V0Oc2_f`, `G9FHqACps`, `jkZHK6dS7`, `Z7MSbSKtU` (Auther Name field `v365QHZYL`)
Description: Five Blog items do not set `$control__auther_name` explicitly and rely on the variable's `initialValue: "Dr Alex"`. The other five items explicitly set the field — also to `"Dr Alex"`. The entire 10-post blog is therefore attributed to a single author with no byline diversity, no credential signal (e.g., DVM), and no author bio/detail page. For a veterinary clinic publishing health advice, single-author attribution with no credentials displayed weakens both E-E-A-T (Google's Experience/Expertise/Authoritativeness/Trustworthiness signal) and reader trust.
Evidence: CMS dump `/tmp/cms_dump.json`. Items missing explicit value (5): `yAIJE8XUH` (Parasite Prevention), `x1V0Oc2_f` (First Aid Basics), `G9FHqACps` (Keep Them Moving), `jkZHK6dS7` (Grieving a Pet), `Z7MSbSKtU` (10 Essential Tips). Items with explicit "Dr Alex" (5): `jajVoZZTr`, `WZtPeuwD2`, `sL2m8UplP`, `NGQN6X7p3`, `FF07FUpZm`. No other author name appears in the collection.
Recommended Fix: Either (a) add real author attributions (e.g., specific vet names + credentials) and consider an Authors collection for bios, or (b) make the byline a generic clinic voice ("Vetly Veterinary Team") and remove the per-item author field if individual attribution isn't maintained.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-2)

---

## TV-213 — Blog item Z7MSbSKtU missing Article type; falls back to default "Wellness" but title indicates Senior Care
Status: Open
Category: CMS
Severity: Low
Location: Blog collection item `Z7MSbSKtU` ("10 Essential Tips for a Healthy Golden Years"), Article type field `TwZ9dZl7K`
Description: Blog item `Z7MSbSKtU` does not set `$control__article_type`, so it falls back to the variable's `initialValue: "Wellness"`. The post title "10 Essential Tips for a Healthy Golden Years" and description ("senior dog care guide... comfort, mobility, nutrition, prevention, and quality of life") clearly indicate Senior Care, which is one of the 6 available option cases. This means the article is mis-categorized and won't appear in any future "Senior Care" category filter on `/blog`.
Evidence: Variable definition: `{"id":"TwZ9dZl7K","name":"Article type","type":"option","initialValue":"Wellness","cases":["Wellness","Senior Care","Vaccines","Grief Support","Nutrition","Emergency"]}`. Item `Z7MSbSKtU` attributes: no `$control__article_type` key present (confirmed in `/tmp/cms_dump.json`). Title: `"10 Essential Tips for a Healthy Golden Years"`. Description: `"A practical senior dog care guide with clear veterinary tips for comfort, mobility, nutrition, prevention, and quality of life."`
Recommended Fix: `SET Z7MSbSKtU $control__article_type="Senior Care";`
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-3)

---

## TV-214 — Blog item sL2m8UplP slug contains Unicode right single quote — produces URL-encoded slug
Status: Open
Category: SEO & metadata
Severity: High
Location: Blog collection item `sL2m8UplP`, Slug field `CJvDdRtwN`
Description: Blog item `sL2m8UplP` ("Why Your Pet's Dental Health Matters") has slug `why-your-pet's-dental-health-matters` where the `'` is Unicode U+2019 (RIGHT SINGLE QUOTATION MARK), not an ASCII apostrophe. Framer does not sanitize non-ASCII characters in slugs, so the published URL will be `/blog/why-your-pet%E2%80%99s-dental-health-matters`. This is an unshareable, ugly URL that hurts SEO (search engines treat the percent-encoded form as a distinct URL from any plain-ASCII variant) and breaks verbal/email sharing of the link. It also diverges from the slug convention used by the other 9 blog items (all plain ASCII lowercase kebab-case).
Evidence: Slug value extracted via `framer.agent.serialize({id:"b8Kw9KXWB",depth:1})` for item `sL2m8UplP`: `"why-your-pet's-dental-health-matters"`. Python `unicodedata.name()` confirms the `'` character is `RIGHT SINGLE QUOTATION MARK` (U+2019). The other 9 blog slugs are plain ASCII.
Recommended Fix: `SET sL2m8UplP $control__slug="why-your-pets-dental-health-matters";` (drop the apostrophe entirely, matching the convention of other slugs like `pet-vaccines-safe-and-loving`).
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-4)
Dedupe note: This finding consolidates 2 cross-sub-agent duplicate(s): TV-3-9, TV-7-13 → now renumbered as TV-3-9, TV-7-13. Blog slug contains Unicode U+2019 → %E2%80%99. TV-12-4 is the correctly-identified version; TV-3-9 had a factual error that's been corrected; severity set to Medium (real SEO issue but not blocking).

---

## TV-215 — Blog item Z7MSbSKtU slug doesn't match title (slug has extra "happy" word)
Status: Open
Category: Content & copy
Severity: Low
Location: Blog collection item `Z7MSbSKtU`, Slug field `CJvDdRtwN`
Description: Blog item `Z7MSbSKtU` has title `"10 Essential Tips for a Healthy Golden Years"` but slug `10-essential-tips-for-a-happy-healthy-golden-years`. The slug contains the word "happy" between "for-a-" and "-healthy" — a word not present in the title. The slug-to-title mismatch is minor but creates inconsistency: a visitor who reads the URL expects the title to contain "happy", and search engines see a slight title/slug mismatch. Likely a remnant from an earlier title like "10 Essential Tips for a Happy, Healthy Golden Years" that was edited without updating the slug.
Evidence: Title attribute: `"10 Essential Tips for a Healthy Golden Years"`. Slug attribute: `"10-essential-tips-for-a-happy-healthy-golden-years"`.
Recommended Fix: Either (a) update the slug to `10-essential-tips-for-a-healthy-golden-years` to match the current title, or (b) restore the word "happy" to the title if the original intent was "Happy, Healthy Golden Years".
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-5)

---

## TV-216 — /blog/:Blog detail page does not display Published Date, Article type, or Read Time
Status: Open
Category: CMS
Severity: High
Location: `/blog/:Blog` detail page (id `DvEqpc9aQ`), desktop breakpoint `lBjdH_FvV` — fields `Q5oytgpyz` (Published Date), `TwZ9dZl7K` (Article type), `TtkrUfg8X` (Read Time)
Description: The `/blog/:Blog` detail page binds only 5 of 10 Blog CMS fields to canvas nodes: Image (banner), Title (heading), Description (subheading), Content (body), and Auther Name. The fields Published Date, Article type, Read Time, Featured, and Slug have zero canvas bindings (Featured and Slug are correctly used only for filtering/routing, but Published Date, Article type, and Read Time are content fields visitors expect to see on an article page). Their absence means: (1) readers cannot tell when an article was published (critical for medical/health content freshness), (2) readers cannot see the article category (no breadcrumb or badge), (3) readers cannot see estimated read time. These are all collected in CMS — the data exists — but they never reach the visitor.
Evidence: Walked desktop breakpoint tree of `/blog/:Blog` with depth 8, collected every `var(--variable-<id>)` reference. Bound fields: `kZ3Cwfwri` (Image), `Y55Ujs5Or` (Title), `TPpJF6v7H` (Description), `Vv2SvDCYA` (Content), `v365QHZYL` (Auther Name). Fields with zero bindings: `Q5oytgpyz` (Published Date), `TwZ9dZl7K` (Article type), `TtkrUfg8X` (Read Time), `UJQFDqWfn` (Featured), `CJvDdRtwN` (Slug). Per-article CMS values confirmed populated: e.g., `jajVoZZTr` has Published Date `2026-02-18T00:00:00.000Z`, Article type `Nutrition`, Read Time `5`.
Recommended Fix: On the `/blog/:Blog` desktop breakpoint, add a Text node (or reuse the existing `jlkWuBAtS` "Published Date" RichTextNode — see TV-12-7) bound to `var(--variable-Q5oytgpyz)` with a date format like "Feb 18, 2026". Add a Badge component bound to `var(--variable-TwZ9dZl7K)` (Article type). Add a "X min read" Text node bound to `var(--variable-TtkrUfg8X)`. The Blog Card component already supports all three (it has `date`, `readTime`, `autherName`, and Category Badge controls), so this is consistent with the listing card pattern.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-6)

---

## TV-217 — /blog/:Blog detail page binds Auther Name to a RichTextNode named "Published Date"
Status: Open
Category: CMS
Severity: Medium
Location: `/blog/:Blog` detail page, RichTextNode id `jlkWuBAtS` (canvas label "Published Date")
Description: On the `/blog/:Blog` detail page, the RichTextNode labeled "Published Date" (id `jlkWuBAtS`) has its `text` attribute bound to `var(--variable-v365QHZYL)` — which is the Auther Name field, not the Published Date field. The Published Date field (`Q5oytgpyz`) has no canvas binding anywhere on the detail page (see TV-12-6). Net effect: where visitors would expect to see "Feb 18, 2026" (the publish date), they instead see "Dr Alex" (the author name). The node's canvas label is correct intent; the binding is wrong. This is a wiring bug, not just a missing field.
Evidence: From `/blog/:Blog` desktop tree walk: `RichTextNode "Published Date" (jlkWuBAtS) attr=text = "var(--variable-v365QHZYL)"`. Variable `v365QHZYL` is `Auther Name` (see TV-12-1). Variable `Q5oytgpyz` (Published Date) appears in zero bindings on this page.
Recommended Fix: Re-bind `jlkWuBAtS` to `var(--variable-Q5oytgpyz)` and apply a date format. Add a separate RichTextNode for Auther Name. If the design intent was to show "Dr Alex · Feb 18, 2026" as a combined byline, use a single RichTextNode with two TextRuns bound to the two different variables (or use Framer's date formatting on the date portion).
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-7)

---

## TV-218 — /blog listing page "Featured Articles" section is unfiltered; shows all 10 posts and duplicates 7 with the "Articles" section below
Status: Open
Category: UX & conversion
Severity: Low
Location: `/blog` page (id `OUWIjsEU8`), desktop breakpoint `THfUzjZ9W`, "Featured Articles" section (CollectionList id `O09c72xxk`, repeatedDescendantId `GpejBy_lr`)
Description: Featured Articles section has limit:2 (not 'shows all 10 posts'); shows the 2 most-recent posts; only the label 'Featured Articles' is misleading since neither displayed post is guaranteed featured. Severity downgraded Medium→Low.

Original description (superseded):
The `/blog` page has two Blog collection list sections in sequence. The first, labeled "Featured Articles" (id `O09c72xxk`), has NO filter — it shows all 10 posts. The second, labeled "Articles" (id `KekS47E7A`), filters by `UJQFDqWfn` (Featured) `equals false` — showing the 7 non-featured posts. Result: 7 of the 10 posts appear in both sections, and the "Featured Articles" label is misleading because it includes non-featured items. The Featured flag exists in the schema (with 3 items explicitly `true`, 6 explicitly `false`, 1 defaulting) — the section name implies a filter that was never applied.
Evidence: From `/blog` desktop breakpoint tree walk:
- Section "Featured Articles" (parent name), CollectionList id `O09c72xxk`, rd `GpejBy_lr`, `collectionList.filters` = undefined (no filter applied).
- Section "Articles" (parent name), CollectionList id `KekS47E7A`, rd `KeY61OV0u`, `collectionList.filters = [{"variableId":"UJQFDqWfn","transforms":[{"name":"equals","value":false}]}]`.
Featured=true items (3): `yAIJE8XUH`, `jajVoZZTr`. Featured=false items (7): the rest. Section "Featured Articles" shows all 10.
Recommended Fix: Add a filter to the "Featured Articles" CollectionList: `collectionList.filters = [{"variableId":"UJQFDqWfn","transforms":[{"name":"equals","value":true}]}]`. This will restrict it to the 3 featured posts and eliminate the duplication with the "Articles" section below.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-8)
Reviewer note: Description corrected per reviewer.
Reviewer note: Severity changed to Low per reviewer.

---

## TV-219 — Home page has a duplicate Blog collection list with a BROKEN FILTER referencing non-existent variable `g6vTDqCiY`
Status: Open
Category: CMS
Severity: High
Location: Home page `/`, desktop breakpoint `WQLkyLRf1`, Blog section, "Row Layout" parent (id `WAw_35_lz`), Right Column CollectionList (id `qr2cwyztt`, repeatedDescendantId `RFd_CN3XF`)
Description: The home page Blog section uses a 2-column "Row Layout" with two Blog CollectionLists side-by-side:
- **Left Column** (`TDCillnBM`): Blog list, no filter, `limit: 1` (shows the most recent post).
- **Right Column** (`qr2cwyztt`): Blog list, `limit: 2`, with filter `{"variableId":"g6vTDqCiY","transforms":[{"name":"isSet"}]}`.

The variable `g6vTDqCiY` does NOT EXIST anywhere in the project — verified by walking every page's variables, every component's variables, the Layout template's variables, and every collection's variables. It is a dead reference (likely a deleted variable whose filter reference was not cleaned up). The `isSet` transform against a non-existent variable produces undefined behavior — the right column may render 0 posts (empty section), 2 arbitrary posts, or 2 posts duplicating the left column's content. Either way, this is a broken CMS rendering on the home page (a high-traffic page).
Evidence: - Right Column CollectionList attributes (from `framer.agent.serialize({id:"qr2cwyztt",depth:1},{pagePath:"/"})`):
  ```
  collectionList: {
    "collection": "Blog",
    "repeatedDescendantId": "RFd_CN3XF",
    "limit": "2",
    "offset": "0",
    "filters": [{"variableId":"g6vTDqCiY","transforms":[{"name":"isSet"}]}],
    "filtersOperator": "or"
  }
  ```
- Searched all WebPageNodes' variables: only `/` (3 vars: `p8KnFWIfB`, `qNw0w8Dfv`, `WGp5TwWL7`) and `/blog` (2 vars: `ACje_oFEj`, `r7OKe55hM`) have page-level variables; none is `g6vTDqCiY`.
- Searched Layout template (`yDIYoKc7h`) variables: 6 vars (`blH70oAe2`, `fsIimGPkb`, `xn1O18HUb`, `e_PMEhXhP`, `UknjBAupw`, `N8bTYYSRw`); none is `g6vTDqCiY`.
- Searched all ComponentNodes' variables: no match.
- Blog collection fields (10): `kZ3Cwfwri`, `Y55Ujs5Or`, `TPpJF6v7H`, `v365QHZYL`, `Q5oytgpyz`, `TwZ9dZl7K`, `TtkrUfg8X`, `UJQFDqWfn`, `CJvDdRtwN`, `Vv2SvDCYA` — none is `g6vTDqCiY`.
Recommended Fix: Replace the broken filter with a working one. Likely intent was to show non-featured posts on the right while the left shows the latest/featured post. Replace with: `collectionList.filters = [{"variableId":"UJQFDqWfn","transforms":[{"name":"equals","value":false}]}]` and add `offset: 1` so the right column starts from the 2nd post (avoiding overlap with the left column's 1 post). Alternatively, remove the filter entirely and just use `limit: 2, offset: 1`.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-9)

---

## TV-220 — Services collection has an unnamed Divider field
Status: Open
Category: CMS
Severity: Low
Location: Services collection (`kt0DC5RWb`), variable `KIzaSi5ry` of type `divider` with `name: ""`
Description: The Services collection has a Divider variable whose `name` is the empty string. Dividers in Framer CMS are purely presentational — they group subsequent variables under a section header in the editor's variable list. An unnamed divider renders as a plain horizontal line with no label, providing no organizational cue to content editors. The divider sits between the card-listing fields (Title, Card Description, Icon Type, Featured, Slug) and the detail-page fields (Hero Image, Intro Text, Gallery Image 1/2/3, What to Expect, Benefits, FAQ) — a meaningful split that deserves a label like "Detail Page Fields". The briefing's "Important Discoveries" already noted this; confirming from the CMS-data-quality lens.
Evidence: From `framer.agent.serialize({id:"kt0DC5RWb", attributeFilter:["variables"]})`: `{"id":"KIzaSi5ry","name":"","type":"divider"}`. Position: 6th variable, between `Okr5FKpOz` (Slug) and `cuwT3VRH4` (Hero Image).
Recommended Fix: `SET KIzaSi5ry name="Detail Page Fields";` (or similar section label).
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-10)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-2-19 → now renumbered as TV-2-19. Services CMS collection has a divider field with empty name.

---

## TV-221 — Services item JMTTMhaJy "End of Life Care" missing Hero Image, Gallery Image 2, and Gallery Image 3
Status: Open
Category: CMS
Severity: High
Location: Services collection item `JMTTMhaJy` ("End of Life Care"), fields `cuwT3VRH4` (Hero Image), `ETkdlMg0x` (Gallery Image 2), `vul25GQ8X` (Gallery Image 3)
Description: Services item `JMTTMhaJy` "End of Life Care" is the only one of 12 services missing image fields. Specifically: Hero Image is not set (falls back to the variable's `initialValue` — a stock photo of "a veterinarian in blue scrubs gently pets a relaxed, elderly dog on a cushioned exam table in a bright, cozy clinic"), Gallery Image 1 IS set (a real end-of-life-care-appropriate photo), but Gallery Image 2 and Gallery Image 3 are not set (both fall back to default stock photos of elderly dogs). The `/services/:Services` detail page binds all 4 image fields to canvas FrameNodes (`yLIDf8fgV` for Hero, `ZQYSQukLi`/`cXwBdM26h`/`ahe8xfHa6` for Gallery 1/2/3), so the detail page for "End of Life Care" will render 3 off-topic default images. This is especially sensitive because End of Life Care is an emotionally heavy topic where mismatched cheerful stock imagery is jarring.
Evidence: Item `JMTTMhaJy` attributes (from CMS dump): `$control__gallery_image_1` = `https://framerusercontent.com/images/Mwn6CHEVP5sU6sLgpqHpRFJVBs.webp` (set). `$control__hero_image`, `$control__gallery_image_2`, `$control__gallery_image_3` = MISSING (rely on variable initialValue). Variable `cuwT3VRH4` initialValue alt text: `"A veterinarian in blue scrubs gently pets a relaxed, elderly dog on a cushioned exam table in a bright, cozy clinic. The scene feels warm and caring."` Variable `ETkdlMg0x` initialValue has no alt text but is `Close-up_of_elderly_dog_resting_202605060221.webp`. Variable `vul25GQ8X` initialValue alt text: `"A senior dog sleeps peacefully on a soft, patterned blanket on an exam table, with a vet's reassuring hand nearby."` All 11 other services have all 4 images explicitly set (verified per-item in `/tmp/cms_summary.txt`).
Recommended Fix: Source 3 appropriate end-of-life-care images (e.g., peaceful home setting, vet holding paw, family saying goodbye) via `framer.agent.queryImages({source:"unsplash", query:"compassionate veterinary end of life care", count:6, orientation:"landscape"})` and `SET JMTTMhaJy $control__hero_image=<url1> $control__gallery_image_2=<url2> $control__gallery_image_3=<url3>;`. Avoid default cheerful clinic imagery for this topic.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-11)

---

## TV-222 — 6 of 12 Services items have Featured=true (half the catalog)
Status: Open
Category: CMS
Severity: Low
Location: Services collection, Featured field `IQz4QjTIO` (boolean, initialValue false)
Description: Six of 12 Services items have `Featured` explicitly set to `true`: `cUNl9mV6Q` (Diagnostics & Lab Testing), `tETX4Fsv7` (Pain Relief & Comfort Care), `afHna7G3t` (24/7 Emergency Care), `kY87Fs2MD` (Surgical Care & Procedures), `tzSHVqONe` (Dental & Oral Health), `VCRvFJTws` (Preventive Care & Wellness). The other 6 (`JMTTMhaJy`, `x5UTiDP5y`, `SHQSf6sst`, `CGu3k5_fk`, `BZEvq0mNq`, `sO6M7KVuO`) fall back to the default `false`. The home page Featured Services CollectionList (`ucMAEsB2j`) filters by `Featured equals true` with `limit: 6` — so exactly 6 services appear on the home page. Half the catalog being "featured" is heavy for a filter that should highlight a curated subset; the Featured flag becomes less meaningful when 50% of items qualify. Notably, "End of Life Care" (`JMTTMhaJy`) and "Senior Pet Care" (`sO6M7KVuO`) are NOT featured, while "Dental & Oral Health" is — the curation logic isn't obvious.
Evidence: Per-item Featured values from CMS dump — Explicit `true`: `cUNl9mV6Q`, `tETX4Fsv7`, `afHna7G3t`, `kY87Fs2MD`, `tzSHVqONe`, `VCRvFJTws` (6 items). Explicit `false`: `Z7MSbSKtU` (Blog item, not Services — N/A). Services items without explicit Featured (default `false`): `JMTTMhaJy`, `x5UTiDP5y`, `SHQSf6sst`, `CGu3k5_fk`, `BZEvq0mNq`, `sO6M7KVuO` (6 items). Home page Featured Services list: `{"collection":"Services","repeatedDescendantId":"x04nOnv9l","limit":"6","filters":[{"variableId":"IQz4QjTIO","transforms":[{"name":"equals","value":true}]}]}`.
Recommended Fix: Reduce to 3-4 most strategically important services (e.g., 24/7 Emergency Care, Preventive Care & Wellness, Surgical Care, Dental & Oral Health). Demote Diagnostics & Lab Testing and Pain Relief & Comfort Care to non-featured. Re-evaluate quarterly.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-14)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-2-14 → now renumbered as TV-2-14. Services Featured field is unused on /services listing (but IS used on Home — see TV-12-14).

---

## TV-223 — Testimonials "Owner Type" field is collected for all 4 items but never rendered anywhere
Status: Open
Category: CMS
Severity: Medium
Location: Testimonials collection, field `x3vrkdSEz` (Owner Type, type `option`) — collected for all 4 items; binding search returns zero canvas references
Description: The Testimonials collection has an Owner Type field (`x3vrkdSEz`, type `option`, initialValue `"Pet Owner"`, 7 cases). All 4 testimonial items have explicit Owner Type values set ("Dog Owner" x2, "Cat Owner" x1, "Pet Parent" x1). However, walking the desktop tree of both home page Testimonials CollectionLists (the Hero "Social Proof" list with rd `RGC96wJox` and the main "Testimonials Cards" list with rd `ZTQl5gx2K`), the only CMS variables bound are Profile Image (`OoI1wPtnm`), Testimonial Text (`sW1465g2N`), and Full Name (`sttXEM6St`). Owner Type is never bound. The Testimonial card component (`ruZNfQdon`) also has no slot for it. Net: 4 Owner Type values stored, 0 displayed. The field is dead data on the canvas.
Evidence: - Hero "Social Proof" CollectionList repeated template (`RGC96wJox`) variable references: only `OoI1wPtnm` (Profile Image). Limit: 10 (but only 4 items exist).
- Main "Testimonials Cards" CollectionList repeated template (`ZTQl5gx2K`) variable references: `OoI1wPtnm` (Profile Image), `sW1465g2N` (Testimonial Text), `sttXEM6St` (Full Name). Limit: 4.
- Testimonial card component (`ruZNfQdon`) variable references: `H7WiRmf6B`, `IekoEY9BL`, `NQrKw7yAl`, `VDQyyu2qm`, `XlGBuZYRj` — none matches `x3vrkdSEz`.
- No `/testimonials/:Testimonials` detail page exists, so Owner Type cannot be displayed there either.
Recommended Fix: Either (a) add an Owner Type slot to the Testimonial card component (e.g., a small Text node below the Full Name showing "Dog Owner" / "Cat Owner") and bind it via `var(--variable-x3vrkdSEz)`; or (b) if Owner Type is intentionally not shown, remove the variable from the Testimonials collection.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-15)

---

## TV-224 — Testimonials "Owner Type" option has 7 cases defined but only 3 are used
Status: Open
Category: CMS
Severity: Low
Location: Testimonials collection, field `x3vrkdSEz` (Owner Type), variable `cases` array
Description: The Owner Type option variable defines 7 cases: `"Puppy Owner"`, `"Dog Owner"`, `"Cat Owner"`, `"Pet Parent"`, `"Pet Owner"`, `"Senior Pet Owner"`, `"Exotic Pet Owner"`. The initialValue is `"Pet Owner"`. Across all 4 testimonial items, only 3 cases are actually used: `"Dog Owner"` (2 items), `"Cat Owner"` (1 item), `"Pet Parent"` (1 item). The cases `"Puppy Owner"`, `"Pet Owner"` (the default), `"Senior Pet Owner"`, and `"Exotic Pet Owner"` are never used. Combined with TV-12-15 (Owner Type is never rendered), this means 4 of 7 option cases are dead schema — they appear in the editor dropdown but no item uses them and no visitor sees them.
Evidence: Variable definition: `{"id":"x3vrkdSEz","name":"Owner Type","type":"option","initialValue":"Pet Owner","cases":["Puppy Owner","Dog Owner","Cat Owner","Pet Parent","Pet Owner","Senior Pet Owner","Exotic Pet Owner"]}`. Per-item values: `Dgwq8xgjQ`=`Dog Owner`, `dpc3G0jmo`=`Pet Parent`, `zS0Ebooym`=`Cat Owner`, `RNJQq7Rvg`=`Dog Owner`. Used cases: 3 of 7. Unused cases: 4 of 7 (including the default).
Recommended Fix: If Owner Type is kept (post TV-12-15 decision), trim the cases array to the 3 used values plus any planned for near-term use; also pick a more useful default than the unused `"Pet Owner"` (e.g., default to `"Dog Owner"` since dogs are the most common pet). If Owner Type is removed per TV-12-15, this finding becomes moot.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-16)

---

## TV-225 — Only 4 testimonials in the collection; rendered twice on the home page
Status: Open
Category: UX & conversion
Severity: Medium
Location: Testimonials collection (`ICNoS1I6M`, 4 items); home page Hero "Social Proof" list (`zBGviMPCg`, rd `RGC96wJox`) and home page "Testimonials Cards" list (`kkdJyOOGY`, rd `ZTQl5gx2K`)
Description: The Testimonials collection contains only 4 items: James Walker (Dog Owner), Emily Carter (Pet Parent), David Reynolds (Cat Owner), Sarah Mitchell (Dog Owner). The home page renders these 4 testimonials TWICE — once in the Hero section's "Social Proof" strip (CollectionList `zBGviMPCg`, `limit: 10` but only 4 exist, shows all 4 avatars) and once in the main "Testimonials Cards" section (CollectionList `kkdJyOOGY`, `limit: 4`, shows all 4 full testimonial cards). The same 4 people appear in both locations. For a veterinary clinic where trust signals are conversion-critical, 4 testimonials is thin — and showing the same 4 twice doesn't add diversity, it just stretches the limited pool. The 4 names also skew toward generic Anglo names; no diversity of pet types beyond dog/cat.
Evidence: Testimonials collection `ICNoS1I6M` `$itemCount: 4`. Per-item names (from CMS dump): `Dgwq8xgjQ`=James Walker, `dpc3G0jmo`=Emily Carter, `zS0Ebooym`=David Reynolds, `RNJQq7Rvg`=Sarah Mitchell. Home page Hero list: `{"collection":"Testimonials","repeatedDescendantId":"RGC96wJox","limit":"10"}`. Home page Testimonials Cards list: `{"collection":"Testimonials","repeatedDescendantId":"ZTQl5gx2K","limit":"4"}`.
Recommended Fix: Add 6-10 more testimonials to reach 10-12 total, with diversity in pet type (include cat, bird, rabbit, reptile owners), pet life stage (puppy/kitten, adult, senior), and service used (wellness, emergency, surgery, dental, end-of-life). Consider filtering the Hero "Social Proof" list to show 3 random testimonials and the main section to show 6, with a "Load More" pattern.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-17)

---

## TV-226 — Testimonials and FAQs collections have Slug fields but no detail pages
Status: Open
Category: Site settings & structure
Severity: Low
Location: Testimonials collection Slug field `zc4evXR6g`; FAQs collection Slug field `lkb9k85iM`; sitemap (no `/testimonials/:Testimonials` or `/faqs/:FAQs` page exists)
Description: Both the Testimonials and FAQs collections define a Slug field (type `string`), and every item has a unique slug value set (e.g., `james-walker`, `emily-carter` for Testimonials; `what-services-do-you-offer`, `do-i-need-to-book-an-appointment` for FAQs). However, the sitemap contains no `/testimonials/:Testimonials` or `/faqs/:FAQs` CMS detail page — only `/blog/:Blog` and `/services/:Services` exist as CMS detail pages. The Slug fields are therefore unused for routing. (Per the Framer CMS recipe, Slug is auto-created when the first string variable is added to a collection, so these fields exist as a side-effect of having a Title/Question field, not because they were intentionally authored for routing.)
Evidence: Sitemap (all 13 WebPageNode paths): `/`, `/privacy-policy`, `/404`, `/services`, `/about`, `/blog`, `/contact`, `/booking`, `/blog/:Blog`, `/services/:Services`, `/terms-of-service`, `/documentation`, `/brand-guide`. No path contains `:Testimonials` or `:FAQs`. Testimonials items all have unique slugs (`james-walker`, `emily-carter`, `david-reynolds`, `sarah-mitchell`). FAQs items all have unique slugs (verified — no duplicates).
Recommended Fix: This is acceptable if testimonials and FAQs are intended to be list-only (no individual detail pages). If individual FAQ pages are desired for SEO (e.g., to rank for "do you accept pet insurance"), add a `/faqs/:FAQs` CMS detail page that binds Question (as h1) and Answer (as body content) with proper metadata. Same for testimonials if individual review pages are desired.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-18)

---

## TV-227 — Testimonials Owner Type values are inconsistent (species-specific vs. generic)
Status: Open
Category: Content & copy
Severity: Low
Location: Testimonials collection, Owner Type field `x3vrkdSEz` — values across 4 items
Description: The 4 Owner Type values are inconsistent in their categorization scheme. Three items use species-specific labels: "Dog Owner" (`Dgwq8xgjQ` James Walker), "Dog Owner" (`RNJQq7Rvg` Sarah Mitchell), "Cat Owner" (`zS0Ebooym` David Reynolds). One item uses the generic label "Pet Parent" (`dpc3G0jmo` Emily Carter). Emily Carter's testimonial text mentions "Max" (likely a dog, given common pet naming) but doesn't specify species — so we can't infer. The mixed scheme means if Owner Type were ever displayed (it isn't currently — see TV-12-15), the labels would look inconsistent. The option variable also has a "Pet Owner" case (the default) and a "Pet Parent" case — these two are nearly synonymous, making the case list itself redundant.
Evidence: Per-item Owner Type values (from CMS dump): `Dgwq8xgjQ`=`Dog Owner`, `dpc3G0jmo`=`Pet Parent`, `zS0Ebooym`=`Cat Owner`, `RNJQq7Rvg`=`Dog Owner`. Cases defined: `["Puppy Owner","Dog Owner","Cat Owner","Pet Parent","Pet Owner","Senior Pet Owner","Exotic Pet Owner"]`.
Recommended Fix: Pick one scheme — either (a) species-specific only (`Dog Owner`, `Cat Owner`, `Bird Owner`, `Rabbit Owner`, etc., dropping generic "Pet Parent"/"Pet Owner"), or (b) life-stage specific (`Puppy Owner`, `Adult Dog Owner`, `Senior Dog Owner`, etc.). Update the 4 existing items to follow the chosen scheme. Update Emily Carter's testimonial to a species-specific label based on what pet she has (likely `Dog Owner` based on context).
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-19)

---

## TV-228 — FAQs "Group" field is misused as a layout-positioning hack ("Left"/"Right"), not a content category
Status: Open
Category: CMS
Severity: Medium
Location: FAQs collection, Group field `dO9IegAQb` (type `option`, cases `["Left","Right"]`, initialValue `"Left"`)
Description: The FAQs collection has a Group field (`dO9IegAQb`) of type `option` with only 2 cases: `"Left"` and `"Right"`. These are LAYOUT positioning values, not content categories. The home page uses two filtered FAQ CollectionLists to split FAQs into a 2-column layout: list `PlDSXPNh2` filters by `Group equals "Left"`, list `S6hzZp3G7` filters by `Group equals "Right"`. This means the "Group" field's semantic intent is "which visual column does this FAQ appear in", not "what topic does this FAQ belong to". If a content editor wants to filter FAQs by topic (e.g., show only Pricing FAQs on a /pricing page), they cannot — the only filter dimension is column position. The field name "Group" is misleading; it should be renamed to "Column" or "Layout Position", OR replaced with a real content-category option (e.g., cases `["Booking","Services","Pricing","Emergency","General"]`).
Evidence: Variable definition: `{"id":"dO9IegAQb","name":"Group","type":"option","initialValue":"Left","cases":["Left","Right"]}`. Home page FAQ lists: `PlDSXPNh2` CollectionList attributes: `{"collection":"FAQs","repeatedDescendantId":"Va8mqihCM","filters":[{"variableId":"dO9IegAQb","transforms":[{"name":"equals","value":"Left"}]}]}` (in "FAQ > Container > FAQs"). `S6hzZp3G7` CollectionList: `{"collection":"FAQs","repeatedDescendantId":"lnDe7Ldoi","filters":[{"variableId":"dO9IegAQb","transforms":[{"name":"equals","value":"Right"}]}]}` (same parent). Per-item Group values: 3 items set to `"Right"` (`P4J48PLG8`, `smZz2Zgdc`, `OnGFG9Cy4`), 3 items fall back to default `"Left"` (`TNnktMJr0`, `IsFG2Lr8m`, `gizlophQz` — see TV-12-21).
Recommended Fix: Either (a) rename the field to `"Column"` and keep its 2 cases (clarifying intent without behavior change): `SET dO9IegAQb name="Column";`; or (b) replace it with a real content-category option: add cases `["Booking","Services","Pricing","Emergency","General"]`, migrate existing items to appropriate categories, and update the home page layout to use 2 filtered lists (one per column) based on a separate "Column" field, OR redesign the FAQ section to use a single list with category-based dynamic filtering.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-20)

---

## TV-229 — 3 of 6 FAQs items missing explicit Group value (fall back to default "Left")
Status: Open
Category: CMS
Severity: Low
Location: FAQs collection items `TNnktMJr0`, `IsFG2Lr8m`, `gizlophQz`, Group field `dO9IegAQb`
Description: Three of 6 FAQ items do not set `$control__group` explicitly and rely on the variable's `initialValue: "Left"`. The other 3 items explicitly set `Group = "Right"`. So the 2-column home page FAQ layout is split 3-Left (by default) / 3-Right (explicit). This works today, but it's fragile: if the variable's `initialValue` is ever changed, the 3 default-Left items silently shift columns. Best practice is to explicitly set every item's column assignment so the layout is deterministic.
Evidence: Items missing explicit Group (rely on default `"Left"`): `TNnktMJr0` ("What services do you offer?"), `IsFG2Lr8m` ("Do I need to book an appointment?"), `gizlophQz` ("Are you open on weekends or after hours?"). Items with explicit `"Right"`: `P4J48PLG8` ("Do you treat cats, dogs, and other pets?"), `smZz2Zgdc` ("What should I bring to my first visit?"), `OnGFG9Cy4` ("Do you accept pet insurance or offer payment plans?"). Variable `dO9IegAQb` `initialValue: "Left"`.
Recommended Fix: Explicitly set the 3 missing items: `SET TNnktMJr0 $control__group="Left"; SET IsFG2Lr8m $control__group="Left"; SET gizlophQz $control__group="Left";`. (Or whichever column assignment is desired — current behavior is 3-3 split, which is fine; just make it explicit.)
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-21)

---

## TV-230 — Only 6 FAQs in the collection; thin coverage for a veterinary clinic
Status: Open
Category: UX & conversion
Severity: Medium
Location: FAQs collection (`fRYbceWET`, 6 items); rendered on home page (2-column) and `/contact` (single list)
Description: The FAQs collection contains only 6 items covering: services offered, booking appointments, weekend/after-hours availability, species treated, what to bring to first visit, and insurance/payment plans. These are reasonable starter FAQs but miss common veterinary clinic questions such as: pricing/costs for common procedures, vaccination schedules, prescription refills, what to do in an emergency (before arriving), euthanasia/end-of-life process, behavioral concerns, microchipping, boarding/grooming services, telehealth/virtual consultations. The 6 FAQs render in 2 places (home page 2-column layout, `/contact` single list) without expansion. For a clinic offering 12 distinct services (including 24/7 emergency care, surgical care, end-of-life care), 6 FAQs is thin coverage that may force visitors to call or email for basic information, increasing support load.
Evidence: FAQs collection `$itemCount: 6`. Per-item Questions (from CMS dump): 1. "What services do you offer?", 2. "Do I need to book an appointment?", 3. "Are you open on weekends or after hours?", 4. "Do you treat cats, dogs, and other pets?", 5. "What should I bring to my first visit?", 6. "Do you accept pet insurance or offer payment plans?". Rendered via: home page 2 filtered lists (Left/Right by Group) + `/contact` unfiltered list (`zQuEXcyL2`, rd `Bjcle6ami`).
Recommended Fix: Add 8-12 more FAQs covering pricing, vaccinations, emergencies, euthanasia, prescriptions, microchipping, telehealth, and species-specific care. If TV-12-20 is addressed (Group becomes a real category), organize the expanded FAQ set by category and consider a `/faq` listing page with category filters.
Confidence: High
Discovered by: sub-agent 12, session TV

--- (originally TV-12-22)

---

## TV-231 — Hero image on `/` is a 525 KB PNG with no responsive srcSet
Status: Open
Category: Performance & technical
Severity: High
Location: `/` (Home), Desktop breakpoint `WQLkyLRf1`, `Main` (`J30SjU3lW`) → `Hero` (`LQn3zLbUg`) → `Hero Image` (`CYJj6h2yV`) → `ImageReveal` instance `Ru5gXN_Yg`; image asset `https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png`
Description: The home hero image is served as a single fixed URL PNG (1448×1086 px, 537,837 bytes — measured via `curl -sL -o /dev/null -w "%{size_download}"` and PNG header parse) with no `srcSet` / responsive variants. It is applied via the ImageReveal code component's `$control__image` attribute, which renders an `<img src="…">` with the original asset URL — Framer does not generate responsive variants for images bound through component controls. The image is displayed at only 523×603 px (measured via `framer.agent.getRect` on `CYJj6h2yV` → `{x:693,y:64,width:523,height:603}`), so the source is ~2.8× over-specified on width. PNG is the wrong format for a photographic subject — a WebP re-encode would typically be 70–90% smaller. This is the LCP element on the home page (rect y=64, well above the 800 px desktop fold) so its 525 KB transfer size directly delays LCP.
Evidence: Image URL `https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png`; `Content-Type: image/png`, `size_download: 537837`, dimensions 1448×1086. Node `Ru5gXN_Yg` attributes: `{component:"codeFile/hZwaqDB:default", "$control__image":{src:"https://framerusercontent.com/images/cHm7uXtqXEzL31TFvecwxYDbY.png"}}`. Displayed rect `{x:693,y:64,width:523,height:603}` on home desktop. Screenshot: `https://framerusercontent.com/screenshots/on-demand/87f7cd95-0541-46ee-a60b-414219278841.jpg`.
Recommended Fix: Re-export the hero image as WebP (or AVIF) at 2× the display width (~1046×1206 px) and re-upload. Replace the asset URL on `Ru5gXN_Yg.$control__image.src` (and its mobile-replica `Mvg64HDwu.$control__image.src`) with the new asset. If photo-realistic, prefer WebP quality 80 (~80–120 KB) over PNG. Alternatively, switch the ImageReveal component to use Framer's native Image node (which auto-generates `srcSet`).
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-1)

---

## TV-232 — Four "Why Us Card" images on `/` are oversized PNGs (~570–635 KB each, ~2.4 MB total)
Status: Open
Category: Performance & technical
Severity: High
Location: `/` (Home), Desktop breakpoint `WQLkyLRf1`, `Why Us` (`QoKzPrhjk`) → `Why Us Cards` (`YGqvpvwJH`) → instances `LsVbtMwYG`, `BTqN5Qvwo`, `Pf6no_zCs`, `oTFX0kNfS`; image assets on `$control__image2`
Description: Each of the four Why Us Card component instances on the home page references a separate PNG image, all 1448×1086 px, with sizes 581,408 / 613,696 / 634,730 / 569,771 bytes (verified via curl). Total ≈ 2.40 MB. Each is displayed at ~514–690 × 520 px (measured via `getRect` on `LsVbtMwYG` → `{width:514,height:520}` and `BTqN5Qvwo` → `{width:690,height:520}`), so sources are ~2–3× over-specified. PNG is the wrong format for photo content. Combined with the hero PNG (TV-13-1) and the Buy Button PNG (TV-13-3), the home page transfers ~3.2 MB of PNG images alone, before counting any other asset. The Why Us section sits mid-page so is not strictly LCP-critical, but it does block scroll-initiated paint and inflates total page weight well above the ~500 KB budget recommended for fast mobile loads.
Evidence: Asset URLs and sizes (curl-verified):
- `https://framerusercontent.com/images/3Z8kHVk06rh4ajROucRbpRBUmFA.png` — 1448×1086, 581,408 B — node `LsVbtMwYG.$control__image2`
- `https://framerusercontent.com/images/nH5y95XSthlc24EZp2FmcwWIayA.png` — 1448×1086, 613,696 B — node `BTqN5Qvwo.$control__image2`
- `https://framerusercontent.com/images/ayfkhMojER7u3LzWk1xfnYyi9Q.png` — 1448×1086, 634,730 B — node `Pf6no_zCs.$control__image2`
- `https://framerusercontent.com/images/YzuQf4lIIoJpgvxXq1dhcTSW4.png` — 1448×1086, 569,771 B — node `oTFX0kNfS.$control__image2`
Recommended Fix: Re-export all four images as WebP at 2× display width (~1380×1040 px) and re-upload. Replace each `$control__image2.src` with the new asset URL. Expected total weight after re-encode: ~300–500 KB (vs current 2.4 MB).
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-2)

---

## TV-233 — Buy Button image is a 254 KB PNG displayed at 200×200 px, on every page using the layout template
Status: Open
Category: Performance & technical
Severity: High
Location: Layout template `yDIYoKc7h`, Desktop breakpoint `f7pXm5YjB` → `Buy Button` instance `aqBIOKUF4` (and its tablet/phone replicas `D1wW0y55aaqBIOKUF4` / `wngbi8Un2aqBIOKUF4`); image asset `https://framerusercontent.com/images/fm2cvVCqujlMPcHRgN6Vkir3kvA.png`
Description: The layout template places a fixed-position Buy Button (Twitter/X link, `$control__link:"https://x.com/"`) at the bottom-right corner of every page that uses the layout template (12 of 13 pages — every page except `/booking`). Its image is a single fixed URL PNG, 1902×830 px, 254,382 bytes (curl-verified), displayed at only 200×200 px (measured via `getRect` on `aqBIOKUF4` → `{x:1060,y:530,width:200,height:200}`). That's a 9.5× over-spec on width — an extreme case of "oversized single-URL image." Every single page nav causes this 254 KB asset to be re-fetched (it's not cached across page loads in some browsers because Framer re-mounts the component on each navigation). Across 13 pages, this is the most broadly distributed image-weight problem on the site.
Evidence: Asset `https://framerusercontent.com/images/fm2cvVCqujlMPcHRgN6Vkir3kvA.png` — PNG, 1902×830, 254,382 B. Node `aqBIOKUF4` attributes: `{$control__variant:"Variant 2", $control__link:"https://x.com/", $control__image:{src:"…fm2cvVCqujlMPcHRgN6Vkir3kvA.png", alt:""}, position:"fixed", right:"20px", bottom:"70px", width:"auto", height:"auto", zIndex:"10"}`. Rect `{x:1060,y:530,width:200,height:200}`. Layout template applies to all pages except `/booking` (which has `layoutTemplateId: undefined`).
Recommended Fix: Re-export at 2× display dimensions (~400×400 px) as WebP or PNG with proper compression. A 400×400 WebP should be ~10–20 KB. Replace `aqBIOKUF4.$control__image.src` (single source-of-truth in layout template propagates to all replicas). Also consider replacing the entire Buy Button with a Phosphor `XLogo` icon node (zero raster bytes) — sub-agent 10 should evaluate whether the image is required.
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-3)

---

## TV-234 — Layout template sets `height="1800px"` on every breakpoint (violates design-rules.md)
Status: Open
Category: Performance & technical
Severity: Medium
Location: Layout template `yDIYoKc7h`, breakpoints `f7pXm5YjB` (Desktop), `D1wW0y55a` (Tablet), `wngbi8Un2` (Phone)
Description: All three breakpoints of the layout template have a fixed `height="1800px"`. The `prompt/design-rules.md` and `prompt/core-principles.md` both mandate `height="auto"` on page breakpoints so content can grow naturally. Because the layout template's breakpoints have a fixed 1800 px height, every page using the layout template inherits a fixed-height shell — pages with content taller than 1800 px (e.g., home, ~9000 px tall; /about; /documentation) overflow the breakpoint frame, while short pages (e.g., /blog) leave large empty space. The actual visible page height is determined by the rendered children, so this doesn't break rendering — but it is an anti-pattern that can cause measurement issues, screenshot truncation, and inconsistent behavior when editing. It also means the layout template's `padding="144px 32px 0px 32px"` (desktop) is interpreted relative to a 1800 px frame, not the actual page height.
Evidence: Layout template serialization: `f7pXm5YjB.attributes.height === "1800px"`, `D1wW0y55a.attributes.height === "1800px"`, `wngbi8Un2.attributes.height === "1800px"`. Compare to the actual page breakpoints (e.g., home `WQLkyLRf1.attributes.height === "auto"` — the page-level breakpoint correctly uses `auto`).
Recommended Fix: `SET f7pXm5YjB height="auto"; SET D1wW0y55a height="auto"; SET wngbi8Un2 height="auto";` on the layout template. Verify no children depend on the fixed 1800 px height for pinning (the Buy Button uses `position="fixed"` + `bottom="70px"`, which is viewport-relative, not container-relative — should be unaffected).
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-4)

---

## TV-235 — `Smooth Scroll` external component is installed on every page that uses the layout template (scroll-jacking)
Status: Open
Category: Performance & technical
Severity: Medium
Location: Layout template `yDIYoKc7h`, Desktop breakpoint `f7pXm5YjB` → `Smooth Scroll` instance `RWMSy8XQF` (and tablet/phone replicas `D1wW0y55aRWMSy8XQF` / `wngbi8Un2RWMSy8XQF`); external component `Yppqt3Cs3Y8TZqvASnXl`
Description: The layout template installs the third-party "Smooth Scroll" external component (`$control__intensity:"10"`) on every page using the layout template — i.e., every page except `/booking`. This component hijacks native browser scrolling to deliver a JS-driven smoothed scroll. Side effects: (1) every scroll event runs through a JS rAF loop, which on low-end mobile devices and long pages (home is ~9000 px tall) causes perceptible input lag and jank; (2) it interferes with the OS/browser-level "reduced motion" / "prefers-reduced-motion" accessibility setting — many smooth-scroll libraries do not respect it; (3) it breaks native scrollbar-drag scrolling and keyboard Page-Down/Space behavior on some browsers; (4) it adds JS parse/compile time to first paint on every page navigation. Native CSS `scroll-behavior: smooth` provides the same visual effect with zero JS cost and proper `prefers-reduced-motion` handling.
Evidence: Layout template serialization contains instance `RWMSy8XQF` with `{$componentDisplayName:"Smooth Scroll", $control__intensity:"10", opacity:"0", position:"absolute", zIndex:"-1"}` on all three breakpoints. Site-wide `getNodesOfTypes(["ComponentInstanceNode"])` returns 3 Smooth Scroll instances (one per breakpoint). /booking page (`layoutTemplateId: undefined`) does not include it.
Recommended Fix: Remove the Smooth Scroll instance from the layout template (or replace its function with a single CSS rule `html { scroll-behavior: smooth; }` applied via project settings). If a JS smooth-scroll is genuinely required, gate it behind `prefers-reduced-motion: no-preference`.
Confidence: Medium (cannot measure runtime jank directly; flagging based on known behavior of smooth-scroll libraries and the site-wide installation pattern)
Discovered by: sub-agent 13, session TV

--- (originally TV-13-5)

---

## TV-236 — `ScrollbarComponent` external component replaces the native scrollbar on every layout-template page
Status: Open
Category: Performance & technical
Severity: Low
Location: Layout template `yDIYoKc7h`, Desktop breakpoint `f7pXm5YjB` → `ScrollbarComponent` instance `gnIT5Y5Gj` (and tablet/phone replicas); external component `CEfND3paB3HJkvYckHQ9`
Description: The layout template installs a custom-styled scrollbar component on every page (except `/booking`). It configures `scrollbarWidth:"14"`, `scrollbarColor:"rgba(0,0,0,0.1)"`, `scrollbarHoverColor:"rgba(0,0,0,0.2)"`, `scrollbarRadius:"10"`, `trackColor:"rgba(255,255,255,0)"`. Custom scrollbars override a user's OS-level scrollbar preferences (e.g., macOS overlay scrollbars, Windows high-contrast scrollbars) and add a small JS overhead. They can also conflict with the `Smooth Scroll` component (TV-13-5) — both compete for scroll-related event handling. Purely cosmetic scrollbar styling should be done via the standard CSS `::-webkit-scrollbar` / `scrollbar-color` properties (which Framer supports natively) rather than a JS component.
Evidence: Layout template serialization contains instance `gnIT5Y5Gj` with `{$componentDisplayName:"ScrollbarComponent", $control__scrollbarWidth:"14", $control__scrollbarColor:"rgba(0,0,0,0.1)", …}` on all three breakpoints. Not present on `/booking`.
Recommended Fix: Remove `ScrollbarComponent` from the layout template; if a styled scrollbar is desired, apply `html { scrollbar-color: rgba(0,0,0,0.1) transparent; }` via project CSS (or accept the OS default).
Confidence: Medium
Discovered by: sub-agent 13, session TV

--- (originally TV-13-6)

---

## TV-237 — Home page desktop breakpoint has 37 simultaneous `appearEffect` animations (10 fire onMount, including hero elements)
Status: Open
Category: Performance & technical
Severity: High
Location: `/` (Home), Desktop breakpoint `WQLkyLRf1`
Description: A depth-12 walk of the home desktop breakpoint found 37 nodes with `appearEffect` set (plus 1 `pageEffects` for the page transition). 10 of these use `trigger:"onMount"` — meaning they fire on initial page load, before the user has scrolled. The onMount-animated nodes include: `Dyxn3i78f` "Right Glow" (hero background decoration), `c_hEkVzBV` "Sub Container" (hero star rating + text), `ZgwaCSdwx` "Buttons" (hero CTAs), `GT3p3XJ8w` "Floating Trust Card" (hero overlay), `GUKLoWdGS` "Trust Cards" (3× Trust Card instances), `bMK4ppMld`/`ARR_JUPyj`/`TBc4SMWN4` (Trust Cards), `jGsliIjdo` "Social Proof", `DzayWjytl` "Floating Trust Card". All of these are above-the-fold on desktop. Combined with the 525 KB hero PNG (TV-13-1) and the layout-template Header `appearEffect` (which drops the header in from y=−100 on every page mount), the home page asks the browser to simultaneously run 10 entrance animations while loading and painting a 525 KB LCP image. This is a textbook cause of poor LCP and high TBT (Total Blocking Time) on desktop, and is worse on mobile where the CPU is slower. The remaining 27 animations use `trigger:"onInView"` — these are scroll-triggered, but they still cost rAF budget when they fire in quick succession as the user scrolls past card grids (4× Why Us Card, 4× Teem Card, 2× Blog Card, 2× FAQ item, multiple Badge instances, etc.).
Evidence: Serialized `WQLkyLRf1` walk output: `appearEffect:37, appearEffect_onMount:10`. The 10 onMount nodes (with `appearEffect.trigger:"onMount"`) and their full attribute values are listed in the investigation log. Page-level `pageEffects.all.enter.transition="tween 0.27,0,0.51,1 0.35s 0s"` adds a site-wide 0.35s fade on top.
Recommended Fix: (1) Remove `appearEffect` from the 10 onMount nodes in the hero section (let them appear immediately) — this is the highest-impact change. (2) For the 27 `onInView` nodes, consider removing the effect from the per-card badges and small UI atoms (they add little value and stack up). (3) Reduce the `stagger` configuration on card grids so cards animate as a group rather than individually.
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-7)

---

## TV-238 — Hero Background decorative frame is `visible="false"` on Tablet and Phone breakpoints (mobile loses hero visual)
Status: Open
Category: Performance & technical
Severity: Medium
Location: `/` (Home), Tablet breakpoint `hmX39_cxl` → `Hero Background` (`hmX39_cxlTocZhBlOF`), Phone breakpoint `BkwtJCk0L` → `Hero Background` (`BkwtJCk0LTocZhBlOF`)
Description: The home page's `Hero Background` frame (`TocZhBlOF`, 100% × 800 px, containing the Gradient Mask, Right Glow, Vertical Grid, and BG gradient fills) is `visible="false"` on both the Tablet and Phone breakpoints. This means mobile and tablet visitors see a plain white/transparent hero background, while desktop visitors see the layered decorative gradients. This is a responsiveness parity issue — the visual design intent is lost on mobile. (Note: the duplicate Noise PNG and Sparkles component inside are also `visible="false"` on all breakpoints, so they are not the issue; the issue is that the entire Hero Background wrapper is hidden on mobile/tablet.)
Evidence: Depth-12 walk across the 3 home breakpoints found `hmX39_cxlTocZhBlOF` and `BkwtJCk0LTocZhBlOF` both with `visible:"false"`. Desktop `TocZhBlOF` has no `visible` override (default visible). Phone screenshot: `https://framerusercontent.com/screenshots/on-demand/9dc14c3e-54dc-4cee-bcbf-70e1e5a5a224.jpg` shows the mobile hero lacks the desktop's decorative background.
Recommended Fix: Either (a) restore `visible` (remove the `visible="false"` override) on the Tablet and Phone replicas of `TocZhBlOF` and let the inner gradients reflow for the narrower viewport, or (b) if the gradients were intentionally hidden for performance, document the decision and ship a lighter mobile-specific background instead of none at all.
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-8)

---

## TV-239 — Decorative "Bg Gradient" frames in 3 home sections are `visible="false"` on Phone breakpoint (visual inconsistency)
Status: Open
Category: Performance & technical
Severity: Low
Location: `/` (Home), Phone breakpoint `BkwtJCk0L` — `Location & Hours` section's `Bg Gradient` (`BkwtJCk0LAtYlaIIID`), `FAQ` section's `Bg Gradient` (`BkwtJCk0LfvIb3CK_5`), `Blog` section's blue `Bg Gradient` (`BkwtJCk0LlbsRWc7p3`); Tablet breakpoint also hides the FAQ `Bg Gradient` (`hmX39_cxlfvIb3CK_5`)
Description: Three decorative absolute-positioned gradient frames (each ~315–384 px wide, ~375–512 px tall, with `linear-gradient(...)` fills using Primary/Secondary color tokens) are hidden on the Phone breakpoint. They are visible on Desktop and (mostly) on Tablet. This causes the lower half of the home page to look noticeably flatter on mobile — the design's color accents disappear. Not a critical perf issue, but it does indicate that the responsive design wasn't fully parity-checked, and the hidden gradients are still in the DOM (consuming a small amount of layout/paint cost).
Evidence: Phone breakpoint hidden-node list (from depth-12 walk): `BkwtJCk0LAtYlaIIID` (Location & Hours Bg Gradient, `visible:"false"`), `BkwtJCk0LfvIb3CK_5` (FAQ Bg Gradient, `visible:"false"`), `BkwtJCk0LlbsRWc7p3` (Blog Bg Gradient, `visible:"false"`). Tablet also hides `hmX39_cxlfvIb3CK_5` (FAQ Bg Gradient).
Recommended Fix: If the gradients are intended, restore them on mobile (or replace with a lighter mobile-specific gradient). If intentionally hidden for performance, remove the nodes entirely from the mobile breakpoint instead of leaving them in the DOM with `visible="false"`.
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-9)

---

## TV-240 — `/booking` page is missing the global layout template — no Header, Footer, CTA, or Buy Button; BackButton + Title hidden on mobile/tablet
Status: Open
Category: Performance & technical
Severity: High
Location: `/booking` (page id `kdx64iDUQ`), breakpoints `q91z9DBml` (Desktop) / `CqSG6wWy3` (Tablet) / `KYaJPUHtf` (Phone)
Description: The `/booking` page is the only page on the site that does NOT use the layout template (`$layoutTemplateId === undefined`). It contains only 9 nodes: a `Main` frame, a `Booking Modal` frame, a `Header` frame with a `Title` + `BackButton`, and a single `Embed` component (`Cal Booking`) for Cal.com. Consequences: (1) No global Header / Nav Bar — visitors on /booking cannot navigate to other pages via the top nav. (2) No global Footer — no contact info, no second-level nav links. (3) No CTA — no "Book Appointment" cross-promo. (4) No Buy Button — visitors lose the persistent Twitter link. (5) On Tablet (`CqSG6wWy3`) and Phone (`KYaJPUHtf`) breakpoints, both the `BackButton` (`CqSG6wWy3qO44GR49V` / `KYaJPUHtfqO44GR49V`) and the `Title` (`CqSG6wWy3ZebPjet9v` / `KYaJPUHtfZebPjet9v`) are explicitly `visible:"false"` — meaning mobile/tablet users land on /booking, see ONLY the Cal.com iframe, and have no visible navigation back to the rest of the site. The page is conversion-critical (it's the booking page), so trapping mobile users with no exit path is a serious UX/conversion issue. (Sub-agent 5 owns the conversion-critical scope and should also evaluate this.)
Evidence: Page node returned `$layoutTemplateId: undefined`. Desktop breakpoint top-level children: only `PUXgAxq2e` (Main). Phone breakpoint depth-4 walk shows `KYaJPUHtfqO44GR49V` (BackButton) with `visible:"false"` and `KYaJPUHtfZebPjet9v` (Title) with `visible:"false"`. Booking desktop screenshot: `https://framerusercontent.com/screenshots/on-demand/f6c709d2-b5a1-4ded-b60b-76091cbd5186.jpg`. Booking phone screenshot: `https://framerusercontent.com/screenshots/on-demand/3c7bd78e-ee29-4adb-96d7-ec24c93c891f.jpg`.
Recommended Fix: Either (a) attach the `/booking` page to the layout template `yDIYoKc7h` (so it inherits the global Header/Footer/CTA), with a `pageEffects` adjustment so the booking modal still fills the viewport; or (b) at minimum, restore `visible` on the BackButton and Title for Tablet and Phone breakpoints so mobile users can navigate back. Strongly recommend (a) for site-wide consistency.
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-10)

---

## TV-241 — `/booking` page loads Cal.com third-party JS (`embed.js`) + iframe as the entire page content
Status: Open
Category: Performance & technical
Severity: Medium
Location: `/booking`, Desktop breakpoint `q91z9DBml` → `Main` (`PUXgAxq2e`) → `Booking Modal` (`tSmCqITJd`) → `Cal Booking` Embed instance `O2N4dsp87` (and tablet/phone replicas `CqSG6wWy3O2N4dsp87` / `KYaJPUHtfO2N4dsp87`)
Description: The `/booking` page's only substantive content is an Embed component containing Cal.com's inline embed code: `<script src="https://app.cal.com/embed/embed.js">` plus a `<div id="my-cal-inline-in-clinic-vet-appointment">` that Cal.com's script populates with an iframe pointing at `https://app.cal.com`. Cal.com's embed.js is ~30 KB minified+gzipped (typical for booking-embed libraries) and the iframe it injects typically loads another 1–3 MB of JS/HTML/CSS from `app.cal.com`. This is the entire page content — so the booking experience is gated on third-party script load. There's no native fallback if `app.cal.com` is down or slow. The Embed is sized 850×541 on Desktop (fixed) and `1fr × 1fr` on Tablet/Phone (fills viewport). Because the Embed uses `position="relative"` inside a `Booking Modal` that is `position="relative"` inside `Main` that is `height="100vh"`, the iframe fills the visible viewport — which is appropriate — but there is no skeleton/loading state.
Evidence: Embed attributes (from serialize): `{$control__type:"HTML", $control__uRL:"", $control__hTML:"<!-- Cal inline embed code begins -->\n<div style=\"width:100%;height:100%;overflow:scroll\" id=\"my-cal-inline-in-clinic-vet-appointment\"></div>\n<script type=\"text/javascript\">…(function (C, A, L) { … d.head.appendChild(d.createElement(\"script\")).src = A; …})(window, \"https://app.cal.com/embed/embed.js\", \"init\");\nCal(\"init\", \"in-clinic-vet-appointment\", {origin:\"https://app.cal.com\"});\n…calLink: \"vetly/in-clinic-vet-appointment\"…</script>", width:"850px", height:"541px"}`.
Recommended Fix: (1) Add a visible loading skeleton inside the `<div id="my-cal-inline-in-clinic-vet-appointment">` so users see feedback before Cal.com's iframe loads. (2) Defer Cal's `embed.js` with `defer` or load it on IntersectionObserver so it doesn't block initial paint. (3) If Cal.com is critical infrastructure, set up uptime monitoring and a fallback "Book by phone" CTA.
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-11)

---

## TV-242 — `GoogleMaps` external component is used on 3 pages (home `/`, `/about`, `/contact`) via the `Map card` native component, above-the-fold on `/contact`
Status: Open
Category: Performance & technical
Severity: Medium
Location: `Map card` component (`cXuHXndOE`) contains a `GoogleMaps` instance (`ZN79Op08h`) on its Desktop variant. `Map card` is used on `/` (instance `lCK08T8rh`, in `Location & Hours` section), `/about` (instance `JmPI7OcwJ`), and `/contact` (instance `WTvyTaGlZ`).
Description: The `Map card` native component embeds the `GoogleMaps` external component (`ZN79Op08h`), which renders a Google Maps iframe. There is exactly 1 GoogleMaps instance in the project (the one inside the `Map card` component), but `Map card` is instantiated on 3 different pages — so 3 pages load Google Maps. On `/contact`, the Map card is at rect `{x:0,y:254,width:200,height:200}` (Desktop) and `{x:0,y:174,width:200,height:360}` (Phone) — both above the fold (typical desktop viewport is 800 px tall, mobile is ~600–800 px). Google Maps iframes typically pull 500 KB–1.5 MB of JS/HTML/tiles from `maps.google.com` and require a Google API key. Loading this above-the-fold on `/contact` directly delays the page's LCP and TBT.
Evidence: `getNodesOfTypes(["ComponentInstanceNode"])` returns 9 Map card instances (3 logical × 3 breakpoints) — across home, /about, /contact. Ancestor path of `ZN79Op08h` (GoogleMaps): `ComponentNode cXuHXndOE "Cards/Map card"` → `FrameNode LUlcDPx_4 "Desktop"` (the Map card's Desktop variant). Rect of `/contact` Map card `WTvyTaGlZ`: `{x:0,y:254,width:200,height:200}`.
Recommended Fix: (1) On `/contact`, move the Map card below the fold or lazy-load it (use Framer's `Lazy` wrapper or wrap in an IntersectionObserver-triggered visibility toggle). (2) Verify the `GoogleMaps` component is configured with a `loading="lazy"` iframe attribute. (3) Consider replacing Google Maps with a static map image (much lighter) that links out to a real Google Maps page on click.
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-12)

---

## TV-243 — `/documentation` page has 24 `FAQ item` instances, each containing a `Layout Jump Preventer` external component
Status: Open
Category: Performance & technical
Severity: Medium
Location: `/documentation` (page id `B49BfU8Yb`), Desktop breakpoint `r8icvKdrL` — 4 FAQ groups (`dYz1sqkkK`, `qzDY6aJF9`, `AMLviW7Ie`, `G1QoiQORy`) containing 7+5+6+6 = 24 `FAQ item` component instances; the `FAQ item` component (`xUmE2HP3j`) contains a `Layout Jump Preventer` external component (`uFExWPdVC`)
Description: The `/documentation` page renders 24 `FAQ item` instances on its Desktop breakpoint (and the same count replicated on Tablet and Phone — 72 total across breakpoints, per `getNodesOfTypes`). The `FAQ item` component definition (`xUmE2HP3j`) contains a `Layout Jump Preventer` external component (`uFExWPdVC`, ancestor path: `ComponentNode xUmE2HP3j "Elements/FAQ item"` → `FrameNode P3ysYJ8v6 "FAQ Open"`). That means each of the 24 FAQ items instantiates a separate `Layout Jump Preventer` (24 per breakpoint, 72 across breakpoints). `Layout Jump Preventer` is a JS-driven component that prevents scroll-position jumps when accordions expand/collapse — useful for a single accordion, but instantiating it 24 times on one page multiplies the JS overhead 24×. Combined with the 24 `FAQ item` instances' own state/animation logic, this is a heavy page that's mostly FAQ accordions.
Evidence: Site-wide `getNodesOfTypes(["ComponentInstanceNode"])` returned 6 `Layout Jump Preventer` instances across the project — the 6 corresponds to: 1 original `uFExWPdVC` (in the FAQ item component definition) + replicas across the 3 breakpoints of the FAQ item's variants (FAQ Open / FAQ Close). `getNodesOfTypes` also returned 90 `FAQ item` instances site-wide — /documentation accounts for 24 per breakpoint × 3 = 72, plus home (2 × 3 = 6), /about (2 × 3 = 6), /contact (1 × 3 = 3), and a few others. /documentation page depth-4 walk shows 24 `FAQ item` instances across the 4 FAQ groups.
Recommended Fix: (1) Hoist the `Layout Jump Preventer` to a single instance at the page level (or remove it entirely — modern browsers handle accordion scroll-jump well with `scroll-margin-top` and CSS anchor positioning). (2) If 24 FAQ items is intentional content, consider paginating or splitting into sub-pages.
Confidence: Medium (cannot directly measure the runtime cost of 24 Layout Jump Preventer instances, but the multiplier is real)
Discovered by: sub-agent 13, session TV

--- (originally TV-13-13)
Reviewer note: Evidence clarified: 6 component-definition instances of Layout Jump Preventer; runtime-rendered count is 24 per breakpoint × 3 = 72.

---

## TV-244 — `/about` page has 4 `Stat Card` instances each containing an `Animated Number Counter` external component
Status: Open
Category: Performance & technical
Severity: Low
Location: `/about` (page id `mWgiU9J96`), Desktop breakpoint `cf1vfJBN4` — `Stat Card` instances `cxNb_XZ5I`, `SHLEa7Oo6`, `ZHU8fWCD5`, `jXdRF1gUu`; the `Stat Card` component (`Hn1T3Ve4o`) contains an `Animated Number Counter` external component (`yG42MO00t`)
Description: The `/about` page renders 4 `Stat Card` instances. The `Stat Card` component definition (`Hn1T3Ve4o`) contains an `Animated Number Counter` external component (`yG42MO00t`, ancestor path: `ComponentNode Hn1T3Ve4o "Cards/Stat Card"` → `FrameNode XcjmstaBH "Vertical"` → `FrameNode s1EN32nAV "Text Container"` → `FrameNode UDHhhWmzT "Content"`). Each stat therefore animates from 0 to its target number on scroll-into-view. Animated counters are a known cause of unnecessary rAF work — the animation runs even if the user doesn't care about the precise number, and on slow devices the count-up can stutter. 4 instances isn't extreme, but combined with the page's other 24 animations (per the depth-14 walk: 24 `appearEffect` on /about, 1 onMount) and the page's Map card (TV-13-12), the cumulative JS work is non-trivial.
Evidence: `getNodesOfTypes(["ComponentInstanceNode"])` returned 4 `Animated Number Counter` instances (1 original + 3 replicas). `/about` desktop depth-14 walk: 207 total nodes, 28 component instances, 24 `appearEffect`. Component histogram includes `"Stat Card": 4`.
Recommended Fix: Consider replacing the `Animated Number Counter` with a static number (with `openTypeFontFeatures.tnum="on"` per design-rules.md) — most users don't notice the count-up animation, and the static number renders instantly with zero JS cost. If the count-up is desired for branding, gate it behind `prefers-reduced-motion: no-preference`.
Confidence: Medium
Discovered by: sub-agent 13, session TV

--- (originally TV-13-14)

---

## TV-245 — Home page has a duplicate `Hero Image` container (two ImageReveal instances pointing at the same 525 KB PNG)
Status: Open
Category: Performance & technical
Severity: Low
Location: `/` (Home), Desktop breakpoint `WQLkyLRf1` → `Main` (`J30SjU3lW`) → `Hero` (`LQn3zLbUg`) → two sibling `Hero Image` containers: `Z9JS5BA29` (hidden on Desktop, visible on Phone) and `CYJj6h2yV` (visible on Desktop, hidden on Phone)
Description: The home page's `Hero` section contains TWO sibling `FrameNode`s both named `Hero Image`, each containing an `ImageReveal` component instance (`Mvg64HDwu` inside `Z9JS5BA29`, `Ru5gXN_Yg` inside `CYJj6h2yV`) — and both ImageReveal instances reference the SAME image URL (`cHm7uXtqXEzL31TFvecwxYDbY.png`, the 525 KB hero PNG from TV-13-1). On Desktop, `Z9JS5BA29` is `visible:"false"` and `CYJj6h2yV` is visible. On Phone, the visibility flips: `Z9JS5BA29` becomes visible and `CYJj6h2yV` becomes `visible:"false"`. Each `Hero Image` container also has its own `Floating Trust Card` child. This duplicate structure was likely created as a breakpoint-variant hack (designer wanted a different hero image layout on mobile vs desktop, and rather than reflowing one container, they created two and toggled visibility). Side effects: (1) double the DOM nodes for the hero section on every breakpoint (even though only one is visible, both are in the DOM); (2) when Framer serializes the page, it serializes both ImageReveal instances — even though the hidden one is `display:none` and shouldn't load its image, some browsers/spec-implementations will still preconnect or preload the URL; (3) maintenance burden — content changes must be made in both places.
Evidence: Depth-4 serialize of `LQn3zLbUg` (Hero) shows both `Z9JS5BA29` (with `Mvg64HDwu` ImageReveal + `GT3p3XJ8w` Floating Trust Card) and `CYJj6h2yV` (with `Ru5gXN_Yg` ImageReveal + `DzayWjytl` Floating Trust Card) as siblings under `zHo3hTChK` (Content). `Z9JS5BA29.attributes.visible === "false"` on Desktop. Phone depth-4 walk shows `BkwtJCk0LCYJj6h2yV.attributes.visible === "false"` and `BkwtJCk0LZ9JS5BA29` has no `visible` override (visible by default).
Recommended Fix: Consolidate to a single `Hero Image` container that reflows across breakpoints (use stack direction changes, width/height overrides, and visible toggles on inner children — not on the container itself). If the two layouts are genuinely different, at least delete the unused ImageReveal/Floating Trust Card from each hidden variant so the DOM doesn't carry dead nodes.
Confidence: High
Discovered by: sub-agent 13, session TV

--- (originally TV-13-15)

---

## TV-246 — Layout template Header has `appearEffect` `onMount` (drops from y=−100) on every page navigation
Status: Open
Category: Performance & technical
Severity: Medium
Location: Layout template `yDIYoKc7h`, Desktop breakpoint `f7pXm5YjB` → `Header` instance `LZNqgqLuX` (and tablet/phone replicas)
Description: The layout template's Header component instance (`LZNqgqLuX`) has `appearEffect={trigger:"onMount", enter:{opacity:0, x:0, y:-100, …, transition:"spring-physics 400 80 1 0s"}}`. This means every page navigation triggers the header to drop down from 100 px above its final position with a spring-physics animation. Because the Header is `position:"fixed"` at the top of every page, this animation plays on every page load — adding visual delay before the nav is usable. Combined with the home page's `pageEffects.all` (0.35s fade-in transition) and the home page's 10 onMount `appearEffect` animations on hero content (TV-13-7), this means a navigation to the home page simultaneously: fades the whole page in (0.35s tween), drops the header from above (spring physics), and animates 10 hero elements in. The compound effect is significant perceived delay on every page nav.
Evidence: Layout template serialization: `LZNqgqLuX.attributes.appearEffect = {threshold:0.5, trigger:"onMount", enter:{opacity:0, x:0, y:-100, scale:1, rotate:0, rotateX:0, rotateY:0, skewX:0, skewY:0, transition:"spring-physics 400 80 1 0s", stagger:"0s"}}`. Replicated on Tablet (`D1wW0y55aLZNqgqLuX`) and Phone (`wngbi8Un2LZNqgqLuX`) breakpoints.
Recommended Fix: Remove the `appearEffect` from `LZNqgqLuX` (and its replicas) — let the Header appear instantly on page navigation. If a subtle entrance is desired, change `trigger` from `"onMount"` to `"onInView"` with a small threshold, or shorten the spring transition.
Confidence: High
Discovered by: sub-agent 13, session TV (originally TV-13-16)

---

## TV-247 — Site is published on default framer.app subdomain; no custom domain configured
Status: Open
Category: Site settings & structure
Severity: High
Location: Site-wide — `framer.agent.publish({action:"preview"})` returned `urls.production = "https://rejuvenated-number-972653.framer.app"`
Description: The Vetly production site is deployed to Framer's default auto-generated subdomain `rejuvenated-number-972653.framer.app`. No custom domain (e.g. `vetly.com`, `www.vetly.com`) is configured. For a real veterinary clinic this is a serious credibility and SEO problem: clients seeing a random-word-123456.framer.app URL in search results, browser address bar, social shares, and emails will not associate it with the Vetly brand, will struggle to remember or type it, and may mistrust it. Search engines treat the framer.app domain as a fresh domain with no inherited authority — every URL's canonical (e.g. `<link rel="canonical" href="https://rejuvenated-number-972653.framer.app/">`) and og:url points at the framer.app URL, which means once a custom domain is added later, all accumulated SEO equity will be lost unless 301s are configured. The site owner is the Weblx agency; an agency-published site remaining on a default subdomain suggests an incomplete handoff.
Evidence: - `framer.agent.publish({action:"preview"})` response:
  ```json
  { "status":"ready", "stagingEnabled":false, "publishTarget":"production",
    "urls": { "production": "https://rejuvenated-number-972653.framer.app" } }
  ```
- Live HTML of `/` contains `<link rel="canonical" href="https://rejuvenated-number-972653.framer.app/">` and `<meta property="og:url" content="https://rejuvenated-number-972653.framer.app/">`.
- All 30 sitemap.xml URLs use the `rejuvenated-number-972653.framer.app` host.
- robots.txt references `Sitemap: https://rejuvenated-number-972653.framer.app/sitemap.xml`.
Recommended Fix: In Framer Project Settings → Domains, add the agency's or client's registered custom domain (e.g. `vetly.com`) and verify DNS. Configure the apex → www (or vice versa) redirect. After the custom domain is live, republish so canonical URLs and og:url values point to the brand domain. If a redesign replaced an older site, set up `RedirectNode`s from the old path structure to the new one (currently `framer.getRedirects()` returns `[]`).
Confidence: High
Discovered by: sub-agent 14, session TV

--- (originally TV-14-1)

---

## TV-248 — Twitter card metadata incomplete: card type set but no twitter:image, no twitter:site, no twitter:creator
Status: Open
Category: Site settings & structure
Severity: Medium
Location: Site-wide — all rendered HTML pages include `<meta name="twitter:card" content="summary_large_image">` but never `twitter:image`, `twitter:site`, or `twitter:creator`.
Description: Every page on the site declares `<meta name="twitter:card" content="summary_large_image">` — a card type that explicitly requires a large preview image to function. But no page sets `twitter:image` (the image URL), and no page sets `twitter:site` (the brand's @handle) or `twitter:creator` (the author's @handle). The result is that X/Twitter link cards will fall back to "summary" rendering (no image), and there's no authorship attribution for content shared from the site. This is a partial-implementation issue: someone configured the card type but stopped short of completing the required fields.
Evidence: - Live HTML of `/`:
  ```
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Vetly Veterinary Care | Pet Health Without the Stress">
  <meta name="twitter:description" content="Book trusted veterinary care, emergency support, wellness visits, and practical pet health guidance with Vetly.">
  ```
  No `twitter:image`, no `twitter:site`, no `twitter:creator`.
- Same pattern confirmed on `/services`, `/about`, `/blog`, `/contact`, `/booking`, `/privacy-policy`, `/terms-of-service`, `/documentation`, `/brand-guide`, `/404`.
- Even `/blog/parasite-prevention-year-round-protection` (which DOES have `og:image`) does NOT have `twitter:image` — X card will not use the og:image as a fallback when card type is `summary_large_image`.
Recommended Fix: Set a root-level default Twitter handle (e.g. `twitter:site="@VetlyCare"` if the brand has an X account — confirm with the agency) so all pages inherit it. Configure `twitter:image` (Framer usually mirrors `og:image` if set — fixing TV-14-2 and TV-14-3 will likely auto-populate twitter:image as well). If the brand has no X account, change the card type to `summary` instead of `summary_large_image`.
Confidence: High
Discovered by: sub-agent 14, session TV

--- (originally TV-14-4)

---

## TV-249 — No redirects configured (0 RedirectNodes); common patterns not addressed
Status: Open
Category: Site settings & structure
Severity: Low
Location: Site-wide — `framer.getRedirects()` returns `[]`.
Description: The site has zero `RedirectNode`s configured. For a brand-new site this is sometimes acceptable, but several common patterns are worth verifying:
1. If this project is a redesign of an existing site, old URLs (e.g. `/index.html`, `/home`, `/services-old`) need 308 redirects to the new paths — otherwise inbound links and bookmarks will 404.
2. The site is currently on `rejuvenated-number-972653.framer.app`. If/when a custom domain is added (per TV-14-1), Framer automatically handles the apex↔www redirect, but if the agency ever changes the primary domain again, a redirect from the old framer.app URL to the new domain is not configurable from within Framer.
3. There's no redirect from `/index` or `/home` to `/` — minor, but some legacy inbound links use these.

The redirect mechanism itself works (`RedirectNode` returns HTTP 308), it's just that none are configured.
Evidence: - `framer.getRedirects()` → `[]`.
- `scripts/exploration.json` records `"redirects": []`.
- Framer skill `how-projects-work.md` §Hosting §Redirects documents the `RedirectNode` type with `from` and `to` attributes (308 status only).
Recommended Fix: Confirm with the Weblx agency whether this project replaces an existing site. If yes, enumerate the old site's URL structure and create `RedirectNode`s for each old path mapping to the new path. If no (truly new launch), no action needed but document this in the launch checklist. Also consider adding redirects from `/home` and `/index` to `/` as defensive defaults.
Confidence: High
Discovered by: sub-agent 14, session TV

--- (originally TV-14-6)

---

## TV-250 — /favicon.ico returns 404; only SVG favicon is configured
Status: Open
Category: Site settings & structure
Severity: Low
Location: Site-wide — `https://rejuvenated-number-972653.framer.app/favicon.ico` returns HTTP 404.
Description: The site's favicon is configured at the root metadata level as an SVG file (`https://framerusercontent.com/images/uIdSeGFrTg2DRXzrKm5xFU6ZI.svg`) and is referenced via `<link rel="icon" media="(prefers-color-scheme: light)">` and `<link rel="icon" media="(prefers-color-scheme: dark)">` in the HTML head. However, no legacy `/favicon.ico` file is served at the site root. Some older browsers, RSS readers, link preview bots, and bookmark tools still unconditionally fetch `/favicon.ico` regardless of the `<link rel="icon">` tag — they will receive a 404 (and on this site, that 404 is served as the full HTML 404 page, wasting bandwidth). The apple-touch-icon (PNG) IS configured correctly.
Evidence: - Live HTML of `/`:
  ```
  <link href="https://framerusercontent.com/images/uIdSeGFrTg2DRXzrKm5xFU6ZI.svg" rel="icon" media="(prefers-color-scheme: light)">
  <link href="https://framerusercontent.com/images/uIdSeGFrTg2DRXzrKm5xFU6ZI.svg" rel="icon" media="(prefers-color-scheme: dark)">
  <link rel="apple-touch-icon" href="https://framerusercontent.com/images/PHSAprphYHKPfcgIrMSwQ0CXA.png">
  ```
- `curl -s -I https://rejuvenated-number-972653.framer.app/favicon.ico` returns `HTTP/2 404` with `content-type: text/html` (the 404 page HTML, not an ICO file).
- rootNode metadata has `favicon` and `faviconDark` both pointing to the same SVG, plus `appleTouchIcon` as a PNG, but no `.ico` variant.
Recommended Fix: In Framer Project Settings → Favicon, also upload a 32×32 and 16×16 multi-resolution `.ico` file (or rely on Framer's automatic conversion if available). If Framer doesn't auto-generate `/favicon.ico` from the SVG, accept this as a minor limitation. The impact is low — modern browsers handle SVG favicons correctly.
Confidence: High
Discovered by: sub-agent 14, session TV

--- (originally TV-14-7)

---

## TV-251 — No site.webmanifest / PWA manifest file served
Status: Open
Category: Site settings & structure
Severity: Low
Location: Site-wide — `https://rejuvenated-number-972653.framer.app/site.webmanifest` and `/manifest.json` both return HTTP 404 (rendered as the 404 page).
Description: The site does not serve a Web App Manifest file. A manifest is what enables "Add to Home Screen" on mobile, lets Android specify app icon and theme color, and is one of the prerequisites for installability as a PWA. For a marketing site this is non-critical, but veterinary clients visiting on phones could benefit from a one-tap "Add to Home Screen" with a branded icon — a small loyalty/convenience win. Framer does not auto-generate a manifest from project settings by default; this would be a manual addition.
Evidence: - `curl -s -I https://rejuvenated-number-972653.framer.app/site.webmanifest` → `HTTP/2 404` (serves the 404 page HTML).
- Live HTML of `/` does not include `<link rel="manifest" href="...">` in the head.
- rootNode metadata does not include a manifest reference.
Recommended Fix: Low priority. If the agency wants installability, create a `manifest.json` (Framer supports custom static files / well-known files in some plans — verify in current plan), reference it via `<link rel="manifest">` in the page head (likely via a Custom Code injection in Framer Settings). Otherwise document as a "won't fix" — acceptable for a marketing-only site.
Confidence: High
Discovered by: sub-agent 14, session TV

--- (originally TV-14-8)

---

## TV-252 — Inconsistent noIndexSite attribute across pages (6 of 13 explicit, 7 implicit)
Status: Open
Category: Site settings & structure
Severity: Low
Location: Page metadata across all 13 pages.
Description: The `noIndexSite` attribute (which controls whether the entire site is hidden from search engines) is set explicitly to `false` on 6 pages (`/blog`, `/blog/:Blog`, `/documentation`, `/brand-guide`, `/privacy-policy`, `/terms-of-service`, `/404`) but is absent on the other 7 pages (`/`, `/services`, `/services/:Services`, `/about`, `/contact`, `/booking`). This is purely an internal-consistency / template-cleanliness issue — Framer treats absent `noIndexSite` as `false` by default, so the live behavior is correct on all pages. But the inconsistency suggests that pages were configured by different people or at different times, and may indicate an unfinished SEO-pass over the site.

Evidence (from `framer.agent.serialize` of each page):
| Page path | `noIndex` | `noIndexSite` |
|---|---|---|
| `/` | (absent) | (absent) |
| `/services` | (absent) | (absent) |
| `/services/:Services` | (absent) | (absent) |
| `/about` | (absent) | (absent) |
| `/blog` | (absent) | `false` |
| `/blog/:Blog` | (absent) | (absent) |
| `/contact` | (absent) | (absent) |
| `/booking` | (absent) | (absent) |
| `/documentation` | `true` | `false` |
| `/brand-guide` | `true` | `false` |
| `/privacy-policy` | (absent) | `false` |
| `/terms-of-service` | (absent) | `false` |
| `/404` | (absent) | `false` |
Evidence: 
Recommended Fix: Standardize — either set `noIndexSite: false` explicitly on all 13 pages, or remove it from the 6 pages where it's currently set (letting it default). The former is more defensive (makes the intent visible in the canvas); the latter is more minimal. Pick one approach and apply consistently.
Confidence: High
Discovered by: sub-agent 14, session TV

--- (originally TV-14-9)

---

## TV-253 — Staging environment is not enabled; every publish goes directly to production
Status: Open
Category: Site settings & structure
Severity: Medium
Location: Site-wide — `framer.agent.publish({action:"preview"})` response includes `stagingEnabled: false`.
Description: The Framer project does not have the staging environment enabled. This means every `confirm_publish` action deploys straight to the production URL with no intermediate review step. For an agency-managed site (Weblx) where multiple team members may be editing, this is a real risk: a typo or broken layout pushed by one editor is immediately live for clients and search engines to see. Framer's staging feature exists specifically to allow a "preview the next publish" URL before going live, and supports up to 50 historical versions for rollback. With staging disabled, rollback requires re-editing the canvas rather than one-click redeploy of a prior version.
Evidence: - `framer.agent.publish({action:"preview"})` returned:
  ```json
  { "status":"ready",
    "stagingEnabled": false,
    "publishTarget": "production",
    "urls": { "production": "https://rejuvenated-number-972653.framer.app" } }
  ```
  (No `versions` array, no staging URL.)
Recommended Fix: In Framer Project Settings → Publishing, enable staging. Once enabled, the agency workflow becomes: edit → preview staging URL → confirm publish to production. Past versions become rollback-able via `framer.agent.publish({action:"deploy_to_production", version:"<version-id>"})`. Note: enabling staging may require a higher Framer plan tier.
Confidence: High
Discovered by: sub-agent 14, session TV

--- (originally TV-14-10)

---

## TV-254 — Two unpublished page changes pending (Home and /booking)
Status: Open
Category: Site settings & structure
Severity: Medium
Location: Pages `augiA20Il` (Home `/`) and `kdx64iDUQ` (`/booking`).
Description: The preview publish diagnostics report 2 pending page updates that have NOT been published to production:
```json
"changes": [
  { "type":"WebPage", "nodeId":"augiA20Il", "name":"Home", "status":"updated" },
  { "type":"WebPage", "nodeId":"kdx64iDUQ", "name":"/booking", "status":"updated" }
]
```
The latest production deploy was `Jul 21, 2026, 12:17 AM UTC` (per the HTML comment in live pages), but the canvas has newer edits to Home and /booking. Either (a) the agency is mid-edit and hasn't pushed yet (intentional), or (b) someone forgot to publish after making changes. The /booking page is conversion-critical, so any unpushed change there is worth investigating — if it's a fix that should be live, it's currently invisible to prospects.
Evidence: - `framer.agent.publish({action:"preview"})` response:
  ```
  "changesCount": 2,
  "changes": [
    { "type":"WebPage","nodeId":"augiA20Il","name":"Home","status":"updated" },
    { "type":"WebPage","nodeId":"kdx64iDUQ","name":"/booking","status":"updated" }
  ]
  ```
- Live HTML comment: `<!-- Published Jul 21, 2026, 12:17 AM UTC -->`.
Recommended Fix: Confirm with the Weblx agency whether the pending Home and /booking edits are ready to ship. If yes: run `framer.agent.publish({action:"preview"})` to refresh diagnostics, then `framer.agent.publish({action:"confirm_publish", confirmationHash:"<hash>"})` to publish (do NOT do this in investigate mode — flag for the fix-mode sub-agent or the agency). If no: leave as is, but document the in-progress state in the agency's project tracker so it's not forgotten.
Confidence: High
Discovered by: sub-agent 14, session TV

--- (originally TV-14-11)

---

## TV-255 — /booking page has no Layout template — completely missing Header, Footer, and nav
Status: Open
Category: Footer & global elements
Severity: Critical
Location: `/booking` page (id `kdx64iDUQ`); site-settings area: `attributes.layoutTemplate = "null"`
Description: The `/booking` page is the only one of the 13 pages that does not use the `Layout` template (`yDIYoKc7h`). All other pages have `attributes.layoutTemplate = "default"`, which applies the Layout template wrapping the page in the fixed Header (`AZd_vmoUt`), CTA (`GkwGTE6uU`), Footer (`Xx2RpZ5pV`), and Buy Button. The /booking page has `layoutTemplate: "null"`, and walking its desktop tree (`q91z9DBml`) at depth 8 confirms ZERO instances of Header, Footer, Nav Bar, NavLink Button, Nav Dropdown, CTA, or Buy Button components. The page contains only a "Booking Modal" frame (`tSmCqITJd`).
Evidence: - `framer.agent.getNode({id:"kdx64iDUQ"},{pagePath:"/booking"})` returns `{"layoutTemplate":"null"}` and `$layoutTemplateId` is absent (vs. all other pages which return `"$layoutTemplateId":"yDIYoKc7h"`).
- Walking `/booking` desktop tree (`q91z9DBml`) at depth 8 with a component-filter for `AZd_vmoUt`, `Xx2RpZ5pV`, `bTXu1FqyY`, `gUM1o8Yyz`, `hc6IgBhgF`, `GkwGTE6uU`, `sfrLnUdBr` returns `{"instancesFound":[]}`.
- Desktop breakpoint structure: `q91z9DBml` → 1 child `PUXgAxq2e` ("Main") → 1 child `tSmCqITJd` ("Booking Modal"). No nav, no header, no footer.
- Screenshot of /booking: `https://framerusercontent.com/screenshots/on-demand/5224b1a7-ce92-476f-97b0-7b6ea14c6a7c.jpg` (visible bare modal, no header above, no footer below).
- For comparison, /404 page (id `kfL3sfGQh`) DOES use the Layout template (`$layoutTemplateId: "yDIYoKc7h"`) and renders header+footer correctly (screenshot: `https://framerusercontent.com/screenshots/on-demand/6aaad03e-4498-41e7-b965-f075f2614350.jpg`).
Recommended Fix: Apply the `Layout` template to the /booking page (set `attributes.layoutTemplate = "default"` on WebPageNode `kdx64iDUQ`). If the design intent is for /booking to be a focused full-screen modal, instead add a minimal Header (logo + close/back button) and Footer (legal links) directly to the /booking page canvas. Coordinate with sub-agent 5.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-1)

---

## TV-256 — Mobile Nav Dropdown missing "Home" link — mobile users can't navigate home from the menu
Status: Open
Category: UX & conversion
Severity: High
Location: Nav Dropdown component (`hc6IgBhgF`), variant "End" (open state, id `OMcCfqq1M`), Nav Links frame `mtWbBUQmd` (replica `OMcCfqq1MmtWbBUQmd`).
Description: The desktop Nav Bar (`bTXu1FqyY`) contains 5 NavLink Button instances: Home, Services, About Us, Blog, Contact. The mobile Nav Dropdown (`hc6IgBhgF`), which is the only navigation visible on Tablet and Phone breakpoints, contains only 4 Primary Button instances: Services, About Us, Blog, Contact Us. The "Home" link is missing.

Mobile users on interior pages (e.g., /services, /about, /blog, /contact) who open the hamburger menu have no "Home" option — they can only return home by tapping the logo (which is not obvious to all users, especially those unfamiliar with the convention). This is a real navigation gap on mobile, where users are most likely to use the menu rather than hunt for a logo.
Evidence: - Desktop Nav Bar primary variant (`GBHKk2wfg`) children, serialized at depth 2: 5 ComponentInstanceNodes — `ah_SqcUDh` "Home Link" (text "Home", link `/#home`), `aKd4UTmkK` "Services Link", `X90B_Eydv` "About Link", `YQ38nqAvE` "Blog Link", `ByQkDubwd` "Contact Link".
- Nav Dropdown "End" variant (open state, `OMcCfqq1M`) → `OMcCfqq1MmtWbBUQmd` (Nav Links frame) children, serialized at depth 8: 4 ComponentInstanceNodes — `gmIH1wdr4` "Services" (link `/services`), `v6AYL1_DZ` "About US" (link `/about`), `XdgyF3M_R` "Blog" (link `/blog`), `HMbEERxMc` "Contact Us" (link `/contact`). NO Home link.
- Header variant switching (from `AZd_vmoUt` serialization): on Tablet (`WVwnpCf7j`) and Phone (`zCwAoDfvL`) variants, the Nav Bar instance has `visible: "false"` and the Nav Dropdown instance has `visible` not set (default visible). On Desktop (`PP5wyjmXI`) and Desktop Open (`SndyLBcPW`), the inverse. So mobile navigation is exclusively through the Nav Dropdown.
Recommended Fix: Add a 5th Primary Button instance to the Nav Dropdown's Nav Links frame (`mtWbBUQmd` and all 4 variant replicas) with text "Home" and link `/` (or `/#home`). Place it as the first item to mirror the desktop Nav Bar order.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-2)

---

## TV-257 — Hamburger menu button is a FrameNode with onTap, not a semantic button — no aria-label, no aria-expanded, keyboard inaccessible
Status: Open
Category: Accessibility & compliance
Severity: High
Location: Nav Dropdown component (`hc6IgBhgF`), "Menu Button" frame (`ESdgkQuvA`) and its 4 variant replicas (`qODlv4FUIESdgkQuvA`, `OMcCfqq1MESdgkQuvA`, `Jw7wuLTFNESdgkQuvA`).
Description: The hamburger menu trigger is implemented as a FrameNode (`ESdgkQuvA`) with `cursor: "pointer"`, `fill: white`, `radius: 50px`, `width: 48px`, `height: 48px`, and an `onTap` action that calls `SET_VARIANT` to open/close the dropdown. The frame has NO `htmlTag` (renders as `<div>`), NO `aria-label`, NO `aria-expanded`, and NO button role.
Evidence: - `framer.agent.serialize({id:"hc6IgBhgF",depth:8})` → Menu Button frame `ESdgkQuvA` attributes (Default variant): `{"cursor":"pointer","fill":"var(--token-219c2d29...)","onTap":[{"action":"SET_VARIANT","controls":{"variant":"qODlv4FUI"}}],"layout":"stack","stackDirection":"horizontal",...,"radius":"50px","width":"48px","height":"48px","zIndex":"2"}`. No `htmlTag`, no `aria-label`, no `aria-expanded`, no `role`.
- Dropdown frame `jxjLrDog_` attributes: `{"fill":"var(--token-219c2d29...)","layout":"stack",...,"radius":"32px","width":"48px","height":"48px"}`. No `htmlTag` — renders as `<div>`.
- The only close mechanism besides the menu button is `Ger_sNOhk` (a 500×1000px invisible click-catcher with `onTap: SET_VARIANT Jw7wuLTFN`). No keyboard Escape handler.
- Per Navigations implementation guide: "When a navigation has to expand or collapse on the phone breakpoint, a Component with Variants must be used." The component IS used, but the trigger is not keyboard-accessible.
- Note: The HamburgerMenu code component (`codeFile/kCxujKn:default`, sub-agent 11's scope) renders the icon inside the Menu Button frame. The accessibility gap is on the wrapper frame, not the code component.
Recommended Fix: 1. Set `htmlTag="button"` on the Menu Button frame `ESdgkQuvA` (and all 4 variant replicas) so it renders as `<button>`.
2. Add `aria-label="Open menu"` (Default/Mid Back variants) and `aria-label="Close menu"` (Mid/End variants), or use a single dynamic label.
3. Add `aria-expanded="false"` (Default/Mid Back) and `aria-expanded="true"` (Mid/End) on the Menu Button frame.
4. Set `htmlTag="nav"` and `aria-label="Mobile"` on the Dropdown frame `jxjLrDog_` so the open menu is a navigation landmark.
5. Consider adding a keyboard Escape handler that sets the variant to Mid Back.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-3)

---

## TV-258 — Footer has multiple placeholder/incorrect data points: wrong copyright year, "404" link in Legal column, social links point to platform roots, social links don't open in new tab
Status: Open
Category: Content & copy
Severity: High
Location: Footer component (`Xx2RpZ5pV`), Desktop variant `SM4CTALR7` (and Tablet `IToCCjwER`, Phone `wxI9ElO4C` replicas).
Description: The Footer contains several issues that indicate it was populated with placeholder data and never updated with real Vetly information:

1. **Copyright year is "2026"**: The Copywrites frame (`MD7DVm1X6`) text reads "© 2026 Vetly. All rights reserved." The current year is 2024 (or 2025 depending on publish date). The 2026 date is incorrect and would make the site look abandoned or pre-dated.

2. **"404" link in the Legal column**: The Legal Links Group (`WuNhnSEiq`) contains 3 NavLink Button instances: Privacy Policy (`/privacy-policy#privacy-policy`), Terms of Service (`/terms-of-service#terms-of-service`), and **"404"** (`/404#404`). A visible link to the 404 error page in the footer is bizarre — users should never see a deliberate link to an error page. This appears to be a leftover from template testing.

3. **All 4 social links point to platform root URLs, not actual Vetly profiles**:
   - Facebook: `https://www.facebook.com/` (platform homepage, not a Vetly page)
   - Instagram: `https://instagram.com` (platform homepage)
   - X (Twitter): `https://x.com` (platform homepage)
   - LinkedIn: `https://www.linkedin.com` (platform homepage)
   None of these are actual Vetly social media profiles. Clicking them takes users to the platform homepage, where they have to search for Vetly themselves (or give up).

4. **Social links have `$control__newTab: "false"`**: External links to social media platforms should open in a new tab so users don't lose their place on the Vetly site. Currently they navigate away from Vetly in the same tab.

These four issues collectively signal that the footer was populated with template defaults and never customized for the actual Vetly business.
Evidence: Copyright '© 2026' is likely CORRECT (audit happening in 2026 per Buy Button originalFilename 'Screenshot 2026-06-29 191405.png'). Dropped the copyright sub-claim. Remaining 3 sub-claims (404 link in Legal column, social links to platform roots, newTab:false on social links) all confirmed accurate.

Original evidence (superseded):
- `framer.agent.serialize({id:"Xx2RpZ5pV",depth:8})` → `/tmp/footer-deep.json`:
  - Line 757: `"text": "© 2026 Vetly. All rights reserved."` (Desktop), line 1578 (Tablet), line 2400 (Phone) — same across all 3 variants.
  - Lines 698-700: `"text": "404"` + `"$control__link": "/404#404"` in the Legal Links Group.
  - Lines 510-512: Facebook `"$control__link": "https://www.facebook.com/"` + `"$control__newTab": "false"`.
  - Lines 530-532: Instagram `"$control__link": "https://instagram.com"` + `"$control__newTab": "false"`.
  - Lines 550-552: X (Twitter) `"$control__link": "https://x.com"` + `"$control__newTab": "false"`.
  - Lines 570-572: LinkedIn `"$control__link": "https://www.linkedin.com"` + `"$control__newTab": "false"`.
- Footer instance on home screenshot: `https://framerusercontent.com/screenshots/on-demand/c60bc930-25f8-4c79-9db4-e4ad00e91d8f.jpg` (visible "© 2026", "404" link, social links).
Recommended Fix: 1. Update copyright text to the current year (e.g., "© 2024 Vetly. All rights reserved." or use a dynamic year if Framer supports it).
2. Remove the "404" NavLink Button instance from the Legal Links Group in all 3 Footer variants.
3. Replace each social link with the actual Vetly profile URL once known. If profiles don't exist yet, remove the Socials column entirely until they do (don't ship dead links).
4. Set `$control__newTab: "true"` on all 4 social NavLink Button instances (external links should open in new tab).
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-4)
Dedupe note: This finding consolidates 1 cross-sub-agent duplicate(s): TV-4-14 → now renumbered as TV-4-14. Footer placeholder data — merged sub-agent 4 and sub-agent 15 findings.
Reviewer note: Evidence corrected per reviewer.

---

## TV-259 — "Buy Button" floating element on every page links to https://x.com/ with empty alt text — leftover template element
Status: Open
Category: Footer & global elements
Severity: High
Location: Layout template `yDIYoKc7h`, Buy Button instance `aqBIOKUF4` (component `sfrLnUdBr`); replicated as `D1wW0y55aaqBIOKUF4` (Tablet) and `wngbi8Un2aqBIOKUF4` (Phone).
Description: The Layout template includes a floating "Buy Button" component instance (`aqBIOKUF4`) positioned `fixed` at `right: 20px, bottom: 70px` with `zIndex: 10` on every breakpoint. It is configured with:
- `$control__variant: "Variant 2"`
- `$control__link: "https://x.com/"` (links to Twitter/X homepage)
- `$control__image`: `{ src: "https://framerusercontent.com/images/fm2cvVCqujlMPcHRgN6Vkir3kvA.png", alt: "" }` — the image asset's original filename is `Screenshot 2026-06-29 191405.png` (visible from the Buy Button component's image variable initialValue), confirming it's an arbitrary screenshot, not a designed icon.

This floating element appears on EVERY page that uses the Layout template (12 of 13 pages — all except /booking). It links to a completely unrelated external site (X/Twitter) with no contextual relevance to a veterinary clinic, and its image has empty alt text, failing WCAG 2.1 Success Criterion 1.1.1 (Non-text Content).

This appears to be a leftover from the original Framer template that was never removed or repurposed for Vetly.
Evidence: - `framer.agent.serialize({id:"yDIYoKc7h",depth:4})` → Buy Button instance `aqBIOKUF4` attributes: `{"$control__variant":"Variant 2","$control__link":"https://x.com/","$control__image":{"src":"https://framerusercontent.com/images/fm2cvVCqujlMPcHRgN6Vkir3kvA.png","alt":""},"position":"fixed","left":"null","right":"20px","top":"null","bottom":"70px","centerAnchorX":"93.05%","centerAnchorY":"88%","constraintsLocked":true,"width":"auto","height":"auto","zIndex":"10"}`.
- Buy Button component (`sfrLnUdBr`) image variable initialValue: `"data:framer/asset-reference,fm2cvVCqujlMPcHRgN6Vkir3kvA.png?originalFilename=Screenshot+2026-06-29+191405.png&..."` — confirms the image is a screenshot file.
- Buy Button screenshot on home page: `https://framerusercontent.com/screenshots/on-demand/394ded07-f886-42b0-b4a3-eab0e84aa257.jpg`.
- Visible in home desktop screenshot at bottom-right: `https://framerusercontent.com/screenshots/on-demand/4e27137f-90e6-4423-8386-99269f39aa83.jpg`.
Recommended Fix: Either remove the Buy Button instance (`aqBIOKUF4`) from the Layout template entirely (it serves no purpose for a vet clinic), OR repurpose it as a floating "Book Appointment" CTA pointing to `/booking` with a meaningful calendar/clock icon and proper alt text. Coordinate with sub-agent 9 (visual design) on the visual approach.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-5)

---

## TV-260 — Nav Bar lacks aria-label; Footer "Navigation" section has no `<nav>` htmlTag — multiple nav landmarks without distinguishing labels
Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Nav Bar component (`bTXu1FqyY`) primary variant `GBHKk2wfg`; Footer component (`Xx2RpZ5pV`) "Navigation" frame `fOoSGoxVo`.
Description: The Nav Bar component correctly uses `htmlTag: "nav"` on its primary variant, which is good. However, it has NO `aria-label` attribute. WCAG 2.1 Success Criterion 1.3.6 (Identify Purpose) and the WAI-ARIA Authoring Practices for navigation landmarks recommend that when more than one `<nav>` element exists on a page, each should have a unique `aria-label` to distinguish them (e.g., "Main", "Footer").

The Footer's "Navigation" frame (`fOoSGoxVo`) — which contains the Navigate, Socials, and Legal link groups — has NO `htmlTag` set, so it renders as a `<div>` rather than a `<nav>`. This means:
1. The footer navigation is not announced as a navigation landmark by screen readers.
2. Even if the Nav Bar's `<nav>` were labeled, the footer links aren't in a `<nav>` so there's no ambiguity — but the bigger issue is the footer links are in a generic `<div>`, making them harder to discover via landmark navigation.

The mobile Nav Dropdown's Dropdown frame (`jxjLrDog_`) also lacks a `<nav>` htmlTag — documented separately in TV-15-3.
Evidence: - `framer.agent.serialize({id:"bTXu1FqyY",depth:2})` → primary variant `GBHKk2wfg` attributes include `"htmlTag": "nav"` but no `ariaLabel` or `aria-label`.
- `framer.agent.serialize({id:"Xx2RpZ5pV",depth:8})` → Footer "Navigation" frame `fOoSGoxVo` attributes: `{"layout":"grid","gridAlignment":"center","gridColumnCount":3,...}` — NO `htmlTag`.
- Same pattern confirmed in Tablet (`IToCCjwERfOoSGoxVo`) and Phone (`wxI9ElO4CfOoSGoxVo`) replicas.
Recommended Fix: 1. Add `ariaLabel: "Main"` (or `aria-label: "Main"`) to the Nav Bar primary variant `GBHKk2wfg`.
2. Set `htmlTag: "nav"` and `ariaLabel: "Footer"` on the Footer's "Navigation" frame `fOoSGoxVo` (and its Tablet/Phone replicas).
3. Set `htmlTag: "nav"` and `ariaLabel: "Mobile"` on the Nav Dropdown's Dropdown frame `jxjLrDog_` (covered in TV-15-3).
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-6)

---

## TV-261 — Header phone number "+123-456-7890" is a placeholder, not a real veterinary clinic phone number
Status: Open
Category: Content & copy
Severity: Medium
Location: Header component `AZd_vmoUt` — Outline Button instance `YusTGfBLD` (and all 4 variant replicas). Also in Nav Dropdown component `hc6IgBhgF` — "Call Button" instance `hP7m9YRBA` (and all 4 variant replicas).
Description: The Header's Outline Button (visible on Desktop and Desktop Open variants) displays the text "+123-456-7890" and links to `tel:+123-456-7890`. The Nav Dropdown's Call Button (visible on Tablet and Phone when menu is open) displays the same number with the same `tel:` link. The number `123-456-7890` is a well-known placeholder/lorem-ipsum-style phone number used in design templates — it is not a real, working veterinary clinic phone number.

For a veterinary clinic website — where users may be looking for emergency contact information — displaying a fake phone number is a serious trust and conversion issue. A user who taps "Call" expecting to reach Vetly will dial a non-working or wrong number.
Evidence: - Header Desktop variant `PP5wyjmXI` → Buttons Container `JdNMje4xw` → Outline Button `YusTGfBLD` attributes: `"$control__text":"+123-456-7890","$control__link":"tel:+123-456-7890"`. Same on all 4 Header variants (Desktop, Desktop Open, Tablet, Phone).
- Nav Dropdown Default variant `eJIxZkfZQ` → Actions `SaV1WmFRh` → Call Button `hP7m9YRBA` attributes: `"$control__text":"+123-456-7890","$control__link":"tel:+123-456-7890"`. Same on all 4 Nav Dropdown variants.
- Note: The Call Button in the Nav Dropdown also has `"$control__newTab":"true"` — opening a `tel:` link in a new tab is odd behavior; browsers typically handle `tel:` links specially, but the `newTab` flag is semantically incorrect for phone links.
- Header screenshot: `https://framerusercontent.com/screenshots/on-demand/fd012833-e3bd-459e-82e6-f3d68cc0b8e4.jpg` (visible "+123-456-7890" button).
Recommended Fix: 1. Replace "+123-456-7890" with the actual Vetly clinic phone number in BOTH the Header Outline Button and the Nav Dropdown Call Button (and all their variant replicas).
2. Set `$control__newTab: "false"` on the Nav Dropdown Call Button (phone links should not open new tabs).
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-7)
Dedupe note: This finding consolidates 6 cross-sub-agent duplicate(s): TV-1-28, TV-2-3, TV-4-13, TV-5-12, TV-7-10, TV-10-23 → now renumbered as TV-1-28, TV-2-3, TV-4-13, TV-5-12, TV-7-10, TV-10-23. Site-wide placeholder phone — merged 7 cross-sub-agent findings into one site-wide sweep.

---

## TV-262 — /blog/:Blog CMS detail page does not set activeLink — nav doesn't highlight "Blog" when viewing a blog post
Status: Open
Category: UX & conversion
Severity: Medium
Location: `/blog/:Blog` page (id `DvEqpc9aQ`), attribute `$control__activeLink`.
Description: The Layout template exposes a `$control__activeLink` variable that pages set to indicate which nav item should appear "active" (highlighted). The variable is wired through the Layout template's ControlReferenceVariable (`fsIimGPkb`) → Header's `HNxujGEGN` control → Nav Bar's `variant` control.

Page-by-page activeLink settings (verified via `getNode` on every page):
| Page | activeLink |
|---|---|
| `/` (Home) | Home Active ✓ |
| `/services` | Services Active ✓ |
| `/services/:Services` (CMS detail) | Services Active ✓ |
| `/about` | About Active ✓ |
| `/blog` | Blog Active ✓ |
| **`/blog/:Blog` (CMS detail)** | **Default** ✗ (should be Blog Active) |
| `/contact` | Contact Active ✓ |
| `/documentation` | Default (acceptable) |
| `/brand-guide` | Default (acceptable) |
| `/privacy-policy` | Default (acceptable) |
| `/terms-of-service` | Default (acceptable) |
| `/404` | Default (acceptable) |

The `/blog/:Blog` CMS detail page is the ONLY content page that fails to set the active link. When a user is reading a blog post, the "Blog" nav item is NOT highlighted, so the user has no visual indication of where they are in the site structure. By contrast, the `/services/:Services` CMS detail page correctly sets `Services Active`, so the pattern is established — `/blog/:Blog` is just missing the configuration.
Evidence: - `framer.agent.getNode({id:"DvEqpc9aQ"},{pagePath:"/blog/:Blog"})` returns `attributes.$control__activeLink = "Default"`.
- For comparison, `framer.agent.getNode({id:"lhpeg56oV"},{pagePath:"/services/:Services"})` returns `attributes.$control__activeLink = "Services Active"`.
- The Nav Bar's variants include `SlVOr2Z70` named "Blog Active" — so the variant exists, it's just not being selected on the blog detail page.
Recommended Fix: Set `attributes.$control__activeLink = "Blog Active"` on WebPageNode `DvEqpc9aQ` (the /blog/:Blog CMS detail page).
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-8)

---

## TV-263 — Layout template's CTA appears on every page, including legal, error, and internal pages
Status: Open
Category: UX & conversion
Severity: Medium
Location: Layout template `yDIYoKc7h`, CTA instance `wOy01xYuf` (component `GkwGTE6uU`) inside the Wrapper frame `fSsZJ3UcP`, just before the Footer.
Description: The Layout template places a CTA component instance (`wOy01xYuf`) in the "Wrapper" frame (`fSsZJ3UcP`) immediately before the Footer. This CTA is configured with title "Ready to Give Your Pet the Best Care?", description "Book your visit today and experience compassionate, expert veterinary care.", and a "Book Appointment" button. Because it lives in the Layout template, it renders on EVERY page using the template — all 12 pages except /booking.
Evidence: - `framer.agent.serialize({id:"yDIYoKc7h",depth:4})` → Wrapper frame `fSsZJ3UcP` children: `[CTA instance wOy01xYuf, Footer instance lwSF5de67]`. CTA attributes: `"$control__variant":"Desktop","$control__title":"Ready to Give Your Pet the Best Care?","$control__description":"Book your visit today and experience compassionate, expert veterinary care.","$control__buttonText":"Book Appointment","scrollTargetEnabled":true,"elementId":"cta"`. Same CTA replicated to Tablet (`D1wW0y55awOy01xYuf`) and Phone (`wngbi8Un2wOy01xYuf`) with variant "Tablet"/"Mobile".
- The CTA is NOT in the page canvas of any individual page — it's purely in the Layout template. So every "default" layout-template page gets it.
Recommended Fix: Either (a) move the CTA out of the Layout template and add it explicitly to the content pages where it's appropriate (Home, Services, About, Blog, Contact, and CMS detail pages), leaving legal/error/internal pages without it; or (b) keep the CTA in the Layout template but add a per-page toggle (a boolean variable like `$control__showCTA`) that legal/error/internal pages set to `false`. Option (a) is cleaner but requires touching every page; option (b) is less invasive.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-9)

---

## TV-264 — Mobile Nav Dropdown uses Primary Button components for nav links, inconsistent with desktop NavLink Buttons
Status: Open
Category: Visual design & branding
Severity: Medium
Location: Nav Dropdown component (`hc6IgBhgF`), Nav Links frame `mtWbBUQmd` (and replicas); compare to Nav Bar component (`bTXu1FqyY`) children.
Description: The desktop Nav Bar (`bTXu1FqyY`) uses `gUM1o8Yyz` (NavLink Button) component instances for its 5 nav links. The NavLink Button renders as a text link with an animated underline indicator (the "Dot" frame `qWaQAA9mQ` that expands on hover/active). This is a clean, minimal nav style.

The mobile Nav Dropdown (`hc6IgBhgF`), by contrast, uses `ARbK0E6gq` (Primary Button) component instances for its 4 nav links. Primary Button renders as a filled-background pill button (`$control__bGColor: var(--token-57d4ab2b-...)` = neutral-50, `$control__radius: 32px`, with a box shadow). So mobile users see a vertical stack of pill buttons, while desktop users see a horizontal row of text links.

This visual inconsistency between desktop and mobile navigation is jarring. The same destination (e.g., "Services") looks like a text link on desktop and a button on mobile. While it's common to restyle nav for mobile, using a completely different component (Primary Button vs NavLink Button) means the typography, spacing, padding, color, and interaction model all differ.

Additionally, the mobile Primary Buttons have no "active" state — they all use `$control__variant: "Button"` (the default), so there's no visual indication of the current page in the mobile menu. The desktop NavLink Button has "Active" and "Not Active" variants with distinct styling.
Evidence: - Desktop Nav Bar primary variant `GBHKk2wfg` children: 5× ComponentInstanceNode with `component: "gUM1o8Yyz"` (NavLink Button), `"$control__variant": "Not Active"` (or "Active" in the per-page active variants).
- Nav Dropdown "End" (open) variant `OMcCfqq1M` → `OMcCfqq1MmtWbBUQmd` (Nav Links) children: 4× ComponentInstanceNode with `component: "ARbK0E6gq"` (Primary Button), `"$control__variant": "Button"`, `"$control__bGColor": "var(--token-57d4ab2b-...)"`, `"$control__radius": "32px"`.
- Header screenshot (desktop): `https://framerusercontent.com/screenshots/on-demand/fd012833-e3bd-459e-82e6-f3d68cc0b8e4.jpg` — text-link style nav.
Recommended Fix: Replace the 4 Primary Button instances in the Nav Dropdown's Nav Links frame with NavLink Button (`gUM1o8Yyz`) instances, matching the desktop Nav Bar's component choice. Set the `$control__variant` per-page to "Active" or "Not Active" based on the current page (using the same `$control__activeLink` wiring as the desktop Nav Bar). Adjust the layout (vertical stack, larger tap target) as needed for mobile.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-10)

---

## TV-265 — Mobile Nav Dropdown links omit `#section` anchors — inconsistent with desktop nav links
Status: Open
Category: UX & conversion
Severity: Medium
Location: Nav Dropdown component (`hc6IgBhgF`), Nav Links frame `mtWbBUQmd` children; compare to Nav Bar component (`bTXu1FqyY`) NavLink Button `$control__link` values.
Description: The desktop Nav Bar's 5 NavLink Button instances link to anchor URLs that include a `#section` fragment:
- Home → `/#home`
- Services → `/services#services`
- About Us → `/about#about`
- Blog → `/blog#blog`
- Contact → `/contact#contact`

The mobile Nav Dropdown's 4 Primary Button instances link to the same pages but WITHOUT the anchor fragment:
- Services → `/services`
- About Us → `/about`
- Blog → `/blog`
- Contact Us → `/contact`

The anchors resolve to scroll targets on each destination page (verified: each page has a `scrollTargetEnabled` element with the matching `elementId`). On desktop, clicking a nav link smoothly scrolls to the relevant section. On mobile, clicking a nav link lands the user at the top of the page — they don't get scrolled to the section, and they lose the smooth-scroll affordance.

This is a subtle inconsistency that makes the mobile experience feel less polished. It also means the NavLink Button's `link.smoothScroll: true` setting (which enables smooth scrolling) has no effect on mobile because there's no anchor to scroll to.
Evidence: - Nav Bar primary variant `GBHKk2wfg` children: `ah_SqcUDh` link=`/#home`, `aKd4UTmkK` link=`/services#services`, `X90B_Eydv` link=`/about#about`, `YQ38nqAvE` link=`/blog#blog`, `ByQkDubwd` link=`/contact#contact`.
- Nav Dropdown "End" variant `OMcCfqq1M` → `OMcCfqq1MmtWbBUQmd` children: `gmIH1wdr4` link=`/services`, `v6AYL1_DZ` link=`/about`, `XdgyF3M_R` link=`/blog`, `HMbEERxMc` link=`/contact`.
- Verified scroll targets exist on each destination page: `/services` has `elementId: "services"` (Starting Point and Services sections), `/about` has `elementId: "about"` (Starting Point), `/blog` has `elementId: "blog"` (Starting Point), `/contact` has `elementId: "contact"` (Starting Point).
Recommended Fix: Update the 4 Primary Button (or NavLink Button, per TV-15-10) instances' `$control__link` values in the Nav Dropdown to include the `#section` anchors: `/services#services`, `/about#about`, `/blog#blog`, `/contact#contact`. If a "Home" link is added per TV-15-2, use `/#home`.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-11)

---

## TV-266 — NavLink Button component has two variants both named "Not Active"
Status: Open
Category: Components (native + code)
Severity: Low
Location: NavLink Button component (`gUM1o8Yyz`), `$variants` array.
Description: The NavLink Button component declares 3 variants:
1. `lkCftY97P` named "Not Active" (primary)
2. `pGYUAc7r3` named "Active"
3. `CK_sWgFZi` named "Not Active" (hover gesture, `$gesture: "hover"`, `$inheritsFrom: "lkCftY97P"`)

Variants 1 and 3 have identical names ("Not Active"). Variant 3 is the hover gesture state that inherits from variant 1. While Framer technically allows this (the gesture variant is distinguished by `$gesture` and `$inheritsFrom`), having two variants with the same name is confusing for maintainability:
- When selecting a variant in the Framer editor's variant picker, both appear as "Not Active" with no way to distinguish them.
- When reviewing the component structure (e.g., during this audit), it's unclear which "Not Active" is the primary vs. the hover state without inspecting `$gesture` and `$inheritsFrom`.
- Future editors may accidentally edit the wrong variant.

The convention in Framer templates is to name hover variants "Hover" or "{BaseName} Hover" (e.g., "Not Active Hover").
Evidence: - `framer.agent.serialize({id:"gUM1o8Yyz",depth:3})` → `$variants` array: `[{"id":"lkCftY97P","name":"Not Active"}, {"id":"pGYUAc7r3","name":"Active"}, {"id":"CK_sWgFZi","name":"Not Active"}]`.
- Variant 3 (`CK_sWgFZi`) attributes include `"$gesture":"hover","$originalId":"lkCftY97P","$inheritsFrom":"lkCftY97P"` — confirming it's a hover gesture inheriting from variant 1.
Recommended Fix: Rename variant `CK_sWgFZi` from "Not Active" to "Hover" (or "Not Active Hover") to distinguish it from the primary "Not Active" variant. This is a metadata-only change with no visual impact.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-12)

---

## TV-267 — Mobile Nav Dropdown uses "Contact Us" label while desktop Nav Bar uses "Contact" — inconsistent labels for the same destination
Status: Open
Category: Content & copy
Severity: Low
Location: Nav Bar component (`bTXu1FqyY`) — NavLink Button `ByQkDubwd` (text "Contact"); Nav Dropdown component (`hc6IgBhgF`) — Primary Button `HMbEERxMc` (text "Contact Us").
Description: The desktop Nav Bar's Contact link displays the text "Contact", while the mobile Nav Dropdown's Contact link displays the text "Contact Us". Both link to the same destination (`/contact#contact` on desktop, `/contact` on mobile — see TV-15-11).

This is a minor label inconsistency. Users who switch between desktop and mobile (or who see both labels in screenshots/marketing materials) may wonder if "Contact" and "Contact Us" are different pages. The label should be consistent across breakpoints.
Evidence: - Nav Bar primary variant `GBHKk2wfg` → `ByQkDubwd` "Contact Link": `"$control__text": "Contact"`, `"$control__link": "/contact#contact"`.
- Nav Dropdown "End" variant `OMcCfqq1M` → `OMcCfqq1MmtWbBUQmd` → `HMbEERxMc` "Contact Us": `"$control__title": "Contact Us"`, `"$control__link": "/contact"`.
- Footer Navigate column also uses "Contact" (`CWuFm6sDn` "Contact Link": `"$control__text": "Contact"`), so the footer matches the desktop Nav Bar, not the mobile Nav Dropdown.
Recommended Fix: Change the mobile Nav Dropdown's Contact link text from "Contact Us" to "Contact" to match the desktop Nav Bar and Footer. (Or, alternatively, change both desktop and footer to "Contact Us" — but "Contact" is shorter and fits the desktop nav row better.) The fix is on the 4 Primary Button instances `gmIH1wdr4`/`v6AYL1_DZ`/`XdgyF3M_R`/`HMbEERxMc` across all 4 Nav Dropdown variants.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-13)

---

## TV-268 — Header logo links to `/#home` while Footer logo links to `/` — inconsistent home-link behavior
Status: Open
Category: UX & conversion
Severity: Low
Location: Header component `AZd_vmoUt` — Logo frame `dkoXnIYcl` (and 4 variant replicas); Footer component `Xx2RpZ5pV` — Logo frame `ltfbGc0G5` (and 3 variant replicas).
Description: The Header's Logo frame (`dkoXnIYcl`) has `link: { href: "/#home" }` — it links to the home page's `#home` scroll target (the "Starting Point" frame `aR1O51zCa` on the home page). The Footer's Logo frame (`ltfbGc0G5`) has `link: { href: "/" }` — it links to the home page root with no anchor.
Evidence: - Header Desktop variant `PP5wyjmXI` → Logo `dkoXnIYcl` attributes: `"link": {"href": "/#home"}`. Same on all 4 Header variants.
- Footer Desktop variant `SM4CTALR7` → Logo `ltfbGc0G5` attributes: `"link": {"href": "/"}`. Same on all 3 Footer variants.
- Verified home page has `elementId: "home"` on the "Starting Point" frame `aR1O51zCa` with `scrollTargetEnabled: true`.
Recommended Fix: Standardize both logos to link to `/` (the simpler, more robust choice). Update the Header Logo frame `dkoXnIYcl` (and its 4 variant replicas) to use `link: { href: "/" }`. If smooth-scroll-to-top on home is desired, that can be achieved with `link: { href: "/#home", smoothScroll: true }` on both — but the hrefs should match.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-14)

---

## TV-269 — NavLink Button instances all have `$control__iconName: "House"` (default) even though icons are hidden
Status: Open
Category: Components (native + code)
Severity: Low
Location: All NavLink Button (`gUM1o8Yyz`) instances in the Nav Bar (`bTXu1FqyY`) and Footer (`Xx2RpZ5pV`).
Description: The NavLink Button component exposes a `$control__iconName` variable (default "House") and a `$control__iconVisible` boolean (default false). When `iconVisible` is false, the Phosphor icon instance (`U8mk1XAcz`) is hidden via `visible: "var(--variable-wGlGR7MwP)"`.

Across every NavLink Button instance in the Nav Bar and Footer, `iconVisible` is set to false (correct — the nav links are text-only), but `iconName` is left as the default "House". This means:
- Every nav link (Home, Services, About Us, Blog, Contact, Facebook, Instagram, X (Twitter), Linkedin, Privacy Policy, Terms of Service, 404) has `iconName: "House"` configured, even though the icon is hidden.
- The "House" icon makes sense for "Home" but is meaningless for "Services", "Blog", "Facebook", "Privacy Policy", etc.
- If a future editor toggles `iconVisible` to true on any link (e.g., to add icons to the footer social links), they'll see a House icon instead of the appropriate icon (e.g., a Facebook logo for the Facebook link).

This is a maintainability issue, not a visible bug. But it indicates the icon name was never considered per-link — it's just the default.
Evidence: - Nav Bar primary variant `GBHKk2wfg` → all 5 NavLink Button children: `"$control__iconVisible": "false"`, `"$control__iconName": "House"`.
- Footer Desktop variant `SM4CTALR7` → all 11 NavLink Button children (Navigate: 4, Socials: 4, Legal: 3): `"$control__iconVisible": "false"`, `"$control__iconName": "House"`. Including the social links (Facebook, Instagram, X (Twitter), Linkedin) which should logically use brand icons if icons were ever shown.
- NavLink Button component (`gUM1o8Yyz`) Phosphor instance `U8mk1XAcz` uses `"$control__name1": "House"` (hardcoded fallback) — the per-instance `$control__iconName` is wired via `"$control__name": "var(--variable-inMMXT_Yz)"` but `inMMXT_Yz` is not declared in the component's variables array, so it may fall back to "House".
Recommended Fix: Either (a) leave as-is since icons are hidden (lowest effort), or (b) set the appropriate `iconName` per link so future icon toggling works correctly (e.g., Facebook link → "Facebook Logo", Services link → "Stethoscope" or relevant vet icon, etc.). Option (b) requires knowing the available Phosphor icon names.
Confidence: High
Discovered by: sub-agent 15, session TV

--- (originally TV-15-15)

---

## TV-270 — Footer lacks contact information expected of a veterinary clinic (phone, email, address, hours)
Status: Open
Category: Footer & global elements
Severity: Medium
Location: Footer component `Xx2RpZ5pV`, all 3 variants.
Description: The Footer currently contains:
- Logo + tagline "Take care of your pet's health."
- 3-column Navigation grid: Navigate (Services, About, Blog, Contact), Socials (Facebook, Instagram, X, Linkedin), Legal (Privacy Policy, Terms of Service, 404)
- Copyright line "© 2026 Vetly. All rights reserved."

What it is missing — elements that a veterinary clinic footer typically includes:
1. **Phone number** — for users who want to call to book or ask about emergencies. The Header has a phone Outline Button (+123-456-7890, a placeholder per TV-15-7), but the Footer does not repeat any phone number.
2. **Email address** — for non-urgent inquiries. Nowhere on the site footer.
3. **Physical clinic address** — so pet owners know where the clinic is. The home page has a "Location & Hours" section (elementId `location`), but the footer doesn't surface the address.
4. **Operating hours** — critical for a vet clinic (especially emergency hours). Not in the footer.
5. **Emergency contact** — a vet clinic footer often has a prominent "Emergency? Call XXX" link.

Without these, the footer is generic and doesn't help users who scroll to the bottom looking for contact info. Users who land on a page (e.g., /services) and want to call/email Vetly have to either scroll back up to the header phone button or navigate to /contact.
Evidence: - `framer.agent.serialize({id:"Xx2RpZ5pV",depth:8})` → confirmed Footer structure (Logo+tagline, 3-column grid, copyright). No phone, email, address, or hours text anywhere.
- Grep for text in `/tmp/footer-deep.json`: only "Take care of your pet's health.", "Navigate", "Socials", "Legal", "© 2026 Vetly. All rights reserved." plus the link labels (Services, About, Blog, Contact, Facebook, Instagram, X (Twitter), Linkedin, Privacy Policy, Terms of Service, 404). No contact info strings.
- Footer screenshot: `https://framerusercontent.com/screenshots/on-demand/c60bc930-25f8-4c79-9db4-e4ad00e91d8f.jpg` — visually confirms no contact info.
Recommended Fix: Add a 4th column (or a new row above the copyright) to the Footer containing:
- Phone number (link `tel:...`) — once the real number replaces the placeholder per TV-15-7.
- Email address (link `mailto:...`).
- Physical clinic address (with a link to /contact or a maps URL).
- Operating hours (e.g., "Mon–Fri 8am–6pm, Sat 9am–4pm, Sun closed" or "24/7 emergency").
- Optionally, a prominent "Emergency? Call XXX" CTA at the top of the footer.
Coordinate with sub-agent 5 (booking/contact conversion-critical) and sub-agent 9 (visual design).
Confidence: High
Discovered by: sub-agent 15, session TV (originally TV-15-16)

---

# Vetly — Framer Template for Veterinary Clinics & Veterinarians

## What this project is

Vetly is a **Framer website template** built for veterinary clinics and individual veterinarians. It is not a website for one specific clinic — it's a **product for sale**: a real veterinary business will purchase this template and customize it (branding, copy, photos, contact details, services, CMS content) to become their own clinic's live website.

Because of that, this project has two audiences at once, and almost every design and content decision exists to serve both simultaneously:

- **Buyers** — the veterinary clinics and vets evaluating and purchasing this template on the Framer marketplace (or wherever it's distributed). They're judging it as a *product*: does it look professional, is it easy to customize, does it feel worth paying for, will it make their clinic look trustworthy once it's live.
- **Visitors** — the eventual end users of a purchased, customized copy of this site: real pet owners looking for a vet, deciding whether to trust this clinic with their animal's care. Design and content choices need to work for this audience too, even though the specific clinic they'll see them on doesn't exist yet.

The core design mandate is **trust and safety** — this is a category (veterinary/medical care) where visual credibility, clarity, and a sense of competence directly affect whether a pet owner picks up the phone or books an appointment. Every page should read as calm, professional, and reassuring, not just visually polished.

## Placeholder / dummy information — intentional, not a defect

Because this is a template and not a real clinic's website, a large amount of the content is deliberately generic placeholder data that the eventual buyer is expected to replace after purchase. This includes, but is not limited to:

- **Contact information** — phone numbers (e.g. sequences like `123-456-789`), email addresses, and physical addresses shown across the site (contact page, footer, header, booking flow, map embeds/location sections) are placeholder values. They do not belong to a real clinic and are not meant to be dialable/deliverable as-is.
- **Map/location data** — any map pin, embedded map, or "find us" section reflects a generic or example location, not a real clinic address.
- **Clinic name, staff names/bios, and similar identity details** shown in demo content are illustrative, standing in for whatever the buyer will input for their own business.

**This is expected behavior, not a bug.** An investigation/audit pass on this project should **not** file findings about placeholder contact info, a generic map location, or similar dummy identity content being "wrong," "fake," or "inconsistent" — that's the intended state of a template prior to purchase. What *is* fair game to flag: placeholder content that's broken in a way a real buyer's real data wouldn't fix (e.g. a contact form that doesn't actually submit anywhere, a map component that fails to render at all rather than showing a generic pin, a field that's empty rather than filled with an intentional placeholder).

## The floating "buy this template" button

The live preview of this site includes a **fixed floating button, visible on every page**, that lets someone browsing the live preview purchase the template immediately. This exists purely for conversion — someone exploring the demo shouldn't have to hunt for a purchase link; it should be one click away at all times, on every page they land on.

**This button is preview-only.** It is intentionally excluded from the final version of the site that a buyer actually receives after purchasing. A buyer's delivered copy of Vetly does not ship with this element — it's a sales tool for the template listing itself, not a permanent feature of the product.

Findings about this button should be scoped accordingly: it's expected and correct for it to be present and prominent in the live preview; it would be a genuine problem if it were somehow missing from the preview (hurting conversion) or if it were mistakenly left in a delivered/purchased build (which shouldn't happen, but is worth flagging if evidence of it ever turns up outside the preview context).

## The 404 page link in the footer

The footer includes a **link to the 404 page**, on every page, in the live preview. This exists so a prospective buyer exploring the demo can actually see what the 404 page looks like without having to stumble onto a broken URL by accident — it's a deliberate showcase of a page that's part of the template.

**This link is preview-only**, the same as the floating buy button above. It's intentionally included in the footer for now so buyers can find and evaluate the 404 page, but a buyer is expected to remove this footer link after purchasing — a real, live clinic site shouldn't have a permanent footer link pointing visitors at its own error page. The 404 *page itself* stays in the final delivered template (it still needs to exist and work for genuine broken-URL cases); only the footer *link* to it is preview-specific.

Findings about this should be scoped the same way as the buy button: it's correct for the 404 link to be present in the footer during preview; it would be a real finding if it were missing from the preview footer (buyers couldn't easily find/evaluate the 404 page) or if evidence turned up of it surviving into a delivered/purchased build.

## The Documentation page

There is a dedicated **Documentation page** in this project, built specifically for buyers *after* they've purchased the template. Its job is to walk a non-technical buyer through everything they need to do to make the template their own:

- Replacing placeholder images with their own photography
- Editing copy/content across pages
- Editing CMS collections (services, staff, blog/resources, etc. — whatever the project's CMS structure includes) to reflect their real clinic
- Swapping out components/sections as needed
- Any other customization steps specific to how this template is built

This page is **not meant to be indexed by search engines** or discovered by end visitors — it's operational documentation for the buyer, not marketing content, and should be excluded from sitemaps/search indexing accordingly.

**This documentation is a known, active work in progress.** It currently exists but does not yet comprehensively cover everything a buyer would need. This is explicitly a category worth investigating: gaps, unclear steps, jargon that assumes prior Framer experience, and missing coverage (e.g. a customization step that exists in the template but isn't documented anywhere) are all genuine, valuable findings — this page improving over time is an active goal, not a settled decision to leave as-is.

## What "good" looks like for this project

When evaluating or improving this site, keep both audiences in view:

- A **Visitor** (a pet owner on a purchased, live version of this site) should feel like they've landed on a real, trustworthy, easy-to-use clinic website — clear information, easy booking, no friction, no design choices that undercut the "trust and safety" feel this category demands.
- A **Buyer** (someone evaluating or having just purchased the template) should feel like they're getting a professional, well-built, easy-to-customize product — a template that's simple to make their own, well-documented, and free of rough edges that would make it look unfinished or hard to work with.

Improvements that strengthen either of these — without breaking the other — are exactly the kind of work this project needs.

## Project Snapshot

- **Brand:** Vetly (veterinary / pet services — site appears to be a Framer template demo, not a live clinic)
- **Site map (13 routes):** `/`, `/services`, `/services/:Services`, `/about`, `/blog`, `/blog/:Blog`, `/contact`, `/booking`, `/documentation`, `/brand-guide`, `/privacy-policy`, `/terms-of-service`, `/404`
- **Native components (27):** Header, Footer, Nav Bar, Nav Dropdown, NavLink Button, Primary Button, Outline Button, Arrow Button, Buy Button, Badge, CTA, Icon, FAQ item, FAQ Close Icon, Price list card, Teem Card, Testimonial card, 5 Stars, Stat Card, Service Card, Why Us Card, Mission Card, Trust Card, Contact Card, Blog Card, Blog Meta, Map card, Load More
- **Code components (4 .tsx files):** `FAQAccordion.tsx` (empty — 0 chars), `Workshop/ImageReveal.tsx`, `Workshop/HamburgerMenu.tsx`, `BackButton.tsx`
- **External components installed:** Phosphor, Smooth Scroll, Sparkles, Layout Jump Preventer, Embed, Animated Number Counter, ScrollbarComponent, GoogleMaps, Blur Gradient, Gooey Effect, Load More, Spinner, SignalDot
- **Fonts:** Inter Display, Inter, Instrument Sans, Geist Mono, Gowun Batang, Geist, Manrope (only Inter + Manrope actually used)

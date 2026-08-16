# Vetly Framer Site Audit — Findings (review.md)

**Project:** Vetly (veterinary / pet services brand) — Framer project `uWBHcfENckHq11EOUMV8`
**Audit session prefix:** DR
**Mode:** Investigate-only (no live-site changes)
**Total findings:** 317 (after Wave 2 review corrections)

## Audit Methodology

- **Wave 1 (Investigation):** 15 parallel sub-agents, each owning a disjoint slice of the site or audit category.
- **Wave 2 (Findings Review):** 5 adversarial reviewers spot-checked evidence, calibrated severities, and flagged duplicates.
- **Corrections applied during merge:** dropped materially-false findings, downgraded miscalibrated severities, merged cross-file duplicates, stripped incorrect line-number citations (content remained accurate), rewrote one finding whose diagnosis was wrong but symptom was real.
- **Evidence standard:** every finding includes a screenshot reference (node id + pagePath), a measured value, or exact quoted copy.

## Sub-Agent Roster (Wave 1)

| # | Scope | Findings |
|---|---|---|
| 1 | Home page (`/`) — content, copy, hero, social proof | 23 |
| 2 | Services pages (`/services` + `/services/:Services`) | 15 |
| 3 | Blog pages (`/blog` + `/blog/:Blog`) | 25 |
| 4 | About (`/about`) + Brand Guide (`/brand-guide`) | 24 |
| 5 | Contact + Booking + Documentation pages | 25 |
| 6 | Legal pages (Privacy, Terms, 404) | 18 |
| 7 | SEO & metadata audit (all 13 pages) | 22 |
| 8 | Accessibility & compliance audit | 30 |
| 9 | Visual design & branding audit | 27 |
| 10 | UX & conversion audit | 17 |
| 11 | Native components audit (all 27) | 40 |
| 12 | Code components audit (4 .tsx files) | 18 |
| 13 | CMS collections audit | 23 |
| 14 | Performance & technical audit | 13 |
| 15 | Site settings, navigation, footer & global elements | 23 |

**Total raw findings from Wave 1:** 343
**After Wave 2 corrections (drops, merges):** 317

## Findings by Severity

- **Critical:** 23
- **High:** 64
- **Medium:** 120
- **Low:** 110

## Findings by Category

- **Components:** 56
- **Content & copy:** 50
- **UX & conversion:** 49
- **Visual design & branding:** 45
- **Accessibility & compliance:** 35
- **CMS:** 27
- **SEO & metadata:** 26
- **Performance & technical:** 15
- **Site settings & structure:** 9
- **Footer & global elements:** 5

---

## Findings

## DR-2 — "Peace of Mind, Always" Why Us card description is truncated mid-sentence

Status: Open
Category: Content & copy
Severity: High
Location: `/` › Main › Why Us section (`QoKzPrhjk` › `YGqvpvwJH` Why Us Cards) › 4th card "Peace of Mind, Always"

Description:
The fourth "Why Us" feature card has the description "Clear guidance, thoughtful care, and confident decisions so you always feel." — the sentence ends abruptly with no period and no completion of the thought. The phrase "so you always feel" is grammatically incomplete; the writer clearly intended something like "so you always feel confident" or "so you always feel at ease". The other three Why Us cards all end with proper punctuation: "Compassionate Care" ends with "long-term health.", "Experienced Veterinary Team" ends with "every visit.", "State-of-the-Art Technology" ends with "accurate care." Only this card is broken.

Evidence:
VLM analysis of the Why Us section screenshot (`/home/z/my-project/screenshots/sub1/section-WhyUs.png`) returned: "Peace of Mind, Always — Clear guidance, thoughtful care, and confident decisions so you always feel. (Note: This text ends abruptly mid-sentence with no period.)" The three sibling cards all end with a period and complete sentences.

Recommended Fix:
Complete the sentence, e.g. "Clear guidance, thoughtful care, and confident decisions so you always feel at ease." or "…so you always feel confident in your pet's care." Verify the source copy in the Why Us card component / CMS and add the missing trailing phrase + period.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-3 — Home page Blog cards render wrong post title (rendering bug, not CMS duplication)

Status: Open
Category: Content & copy
Severity: High
Location: `/` › Main › Blog section (`ODSnKnEj0` › `grOXDNPLn` Container) › cards 2 and 3 (right column)

Description:
Two blog post cards on the home page Blog preview section visually render the same title "Pet Vaccines, Safe and Loving" — but the underlying CMS items have distinct titles ("10 Essential Tips for a Healthy Golden Years" and "A Comprehensive Guide to Senior Pet Care"). This is a rendering bug, not a CMS duplication: the right-column Collection List `qr2cwyztt` appears to filter on a non-existent variable `g6vTDqCiY`, which may cause the title variable binding to resolve incorrectly and display the wrong post's title.

Evidence:
VLM analysis of the Blog section screenshot (`/home/z/my-project/screenshots/sub1/section-Blog.png`) returned the three cards as: Card 1 (Featured) "Parasite Prevention, Year-Round Protection" / Wellness / May 2, 2026 / 5 min read; Card 2 "Pet Vaccines, Safe and Loving" / Wellness / Jan 1, 2026 / 6 min read / excerpt "A practical senior dog care guide with clear…"; Card 3 "Pet Vaccines, Safe and Loving" / Senior Care / Jan 7, 2026 / 7 min read / excerpt "A complete, compassionate guide to caring for…". VLM explicitly flagged: "Cards 2 and 3 share the exact same title despite having different category tags and different excerpts" and "The title for Card 2 ('Pet Vaccines…') does not match its excerpt text which discusses a 'senior dog care guide'".

Recommended Fix:
Investigate the home page Blog Collection List `qr2cwyztt` — specifically its filter on variable `g6vTDqCiY` (which does not exist on the Blog collection). Either remove the filter or correct the variable id. Then verify the title variable binding (var(--variable-Y55Ujs5Or)) on the Blog Card repeated descendant actually resolves to the post's Title field. Confirm via screenshot that each card displays its CMS item's correct Title before declaring this fixed. Do NOT edit the CMS items — they already have correct, unique titles.

Confidence: Medium
Discovered by: sub-agent 1, session DR

---

## DR-4 — Location section "map" renders as a solid placeholder box, no actual embedded map

Status: Open
Category: Content & copy
Severity: High
Location: `/` › Main › Location & Hours section (`fX2ht5DXq` › `V0W1XC4Qo` Container) › left-side map area

Description:
The Location & Hours section has a large rectangular area on the left that is supposed to show an embedded Google Map of the clinic location. Instead, it renders as a solid light-green placeholder box with only a small "Open in Maps" button in the top-left corner. No streets, no map tiles, no pin, no satellite imagery — the map itself is not rendering. The project has the external `GoogleMaps` component installed (id `Hbc0lxqGSRzFG6uMT9yO`) and the Map card native component (`cXuHXndOE`), so the embed is clearly intended. A veterinary clinic's location is critical conversion information — visitors need to see where the clinic is before deciding to book.

Evidence:
VLM analysis of the LocationHours section screenshot (`/home/z/my-project/screenshots/sub1/section-LocationHours.png`) returned: "There is a large rectangular area on the left side designated for the map. However, it does not show an actual map, streets, or satellite imagery. Instead, it displays as a solid light green placeholder box. Inside the top-left corner of this green box, there is a small white button labeled 'Open in Maps' with an external link icon." The address link `z5mBQJTah` does point to `https://maps.app.goo.gl/Kpuck5D6y93QvdJs7` (a real Google Maps short URL), so the location data exists — only the embedded map widget is broken/missing.

Recommended Fix:
Replace the placeholder box with a working `GoogleMaps` external component or the native Map card component, configured with the clinic's actual coordinates/address. Verify the Google Maps API key is set and the embed URL is valid. If the embed cannot be fixed quickly, at minimum show a static map image with a pin.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-5 — Hero "24/7 Care" / "We're here anytime" feature card contradicts actual hours (Sunday: Closed)

Status: Open
Category: Content & copy
Severity: High
Location: `/` › Main › Hero section (`LQn3zLbUg`) › feature card 3 "24/7 Care"

Description:
The hero shows three feature pills, the second of which is titled "24/7 Care" with subtitle "We're here anytime". However, the Location & Hours section lists the clinic's actual hours as Mon–Fri 8 AM–6 PM, Sat 9 AM–4 PM, Sun Closed — the clinic is NOT open 24/7. Only the separately-listed "Emergency: 24/7 On-Call Support" line is 24/7, and that's an on-call service, not the clinic being open. A pet owner reading "24/7 Care / We're here anytime" in the hero will expect to be able to walk in at 3 AM on a Sunday, which is not the case. This is misleading advertising that will cause frustration and lost trust when the owner discovers the clinic is actually closed.

Evidence:
Hero feature card text (extracted from tree): "24/7 Care" / "We're here anytime". Location & Hours section text (extracted from tree): "Monday – Friday: 8:00 AM – 6:00 PM", "Saturday: 9:00 AM – 4:00 PM", "Sunday: Closed", "Emergency: 24/7 On-Call Support". The hero promise and the actual hours contradict each other.

Recommended Fix:
Either (a) reword the hero feature card to "24/7 Emergency Support" / "On-call when you need us" to match the actual offering, OR (b) if the clinic genuinely offers 24/7 care, update the Location & Hours section to reflect that. The current mismatch misleads visitors.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-7 — Blog author "Dr Alex" does not match any Team section member

Status: Open
Category: Content & copy
Severity: Medium
Location: `/` › Main › Blog section cards (author "Dr Alex") vs Team section (`mB6Emc7AS`) members

Description:
All three visible blog post cards are authored by "Dr Alex", but the Team section lists four veterinarians: Dr. Leo Torres, Dr. Sarah Mitchell, and Dr. James Reed (twice). There is no "Dr. Alex" on the team. This inconsistency suggests either (a) the blog posts were authored by a team member who isn't listed on the Team section, (b) the author name is placeholder text that was never updated, or (c) the CMS author field is disconnected from the Team CMS collection. Pet owners value knowing which veterinarian wrote the health advice they're reading — a name that doesn't match any listed vet reduces trust.

Evidence:
VLM analysis of the Blog section screenshot returned all three cards authored by "Dr Alex". VLM analysis of the Team section screenshot returned the four team members: Dr. Leo Torres, Dr. Sarah Mitchell, Dr. James Reed, Dr. James Reed. "Dr Alex" does not appear in the Team section.

Recommended Fix:
Either add "Dr Alex" to the Team section (with photo and credentials), or update the blog posts' author field to match one of the existing team members. Ideally, the Blog CMS collection's author field should be a reference to the Team collection so names stay in sync.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-9 — Blog post dates are stale (most recent post is 3+ months old)

Status: Open
Category: Content & copy
Severity: Medium
Location: `/` › Main › Blog section (`ODSnKnEj0`) › three blog card date fields

**Additional locations (merged findings):**
- Blog collection → `Published Date` field across all 10 items.

Description:
The three visible blog post dates are May 2, 2026, Jan 1, 2026, and Jan 7, 2026. The project's `currentDate` is "August 6, 2026" — meaning the most recent post is over 3 months old and the other two are over 7 months old. The blog section heading promises "Pet Health Tips & Veterinary Blog" with "Expert advice from our veterinarians on wellness, nutrition, behavior, and more" — but the stale dates suggest the blog is not actively maintained. Visitors may conclude the clinic is no longer investing in pet health education, which can undermine the perception of active, current expertise.

**Additional context (merged from DR-13-23):** All 10 Blog Published Date values fall between 2026-01-01 and 2026-05-02. The project's `additionalContext.currentDate` is "August 6, 2026" — so all dates ARE in the past (good). However, the dates form a tight cluster (Jan–May 2026) with no recent posts in the last 3 months. The "Articles" Collection List on `/blog` sorts by Published Date DESC — the most recent post shown is from 2026-04-25 (x1V0Oc2_f, "First Aid Basics"). A visitor scanning the blog might perceive the content as stale (no fresh posts in 3+ months). This is a content-strategy observation, not a bug — but worth flagging because Framer CMS doesn't surface "stale content" warnings.

Evidence:
VLM analysis of the Blog section screenshot returned dates "May 2, 2026", "Jan 1, 2026", "Jan 7, 2026" for the three cards. Project `additional-context.currentDate` = "August 6, 2026" (from project inventory). Most-recent-post-to-today gap = ~3 months.

**Additional evidence (from DR-13-23):** Blog item Published Dates: yAIJE8XUH=2026-05-02, x1V0Oc2_f=2026-04-25, jajVoZZTr=2026-02-18, G9FHqACps=2026-02-11, WZtPeuwD2=2026-02-04, jkZHK6dS7=2026-01-28, sL2m8UplP=2026-01-21, NGQN6X7p3=2026-01-14, FF07FUpZm=2026-01-07, Z7MSbSKtU=2026-01-01. Project context: currentDate="August 6, 2026".

Recommended Fix:
Either publish fresh blog content on a regular cadence (at least monthly), or remove the visible dates from the blog cards if the blog is intentionally evergreen/low-cadence. If dates are shown, the most recent post should be within the last 30–60 days.

**Additional fix note (from DR-13-23):** Publish a new blog post dated August 2026 (or update the existing posts' Published Dates to be more recent). At minimum, ensure the most recent post is from within the last 30–60 days for an active blog appearance.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-10 — No accreditation, license, or trust badges (AAHA, RCVS, etc.) anywhere on the home page

Status: Open
Category: Content & copy
Severity: Medium
Location: `/` (entire page — Home has no accreditation/trust badges anywhere)

Description:
A veterinary clinic's home page is expected to display accreditation logos and trust badges (e.g. AAHA accreditation, RCVS/Royal College of Veterinary Surgeons, state veterinary medical association memberships, Fear-Free certification, insurance accepted). The Vetly home page has none of these — the only trust signals are the 4.9★ rating pill, the 20k+ pet parent count, and 4 customer testimonials. While these are good social-proof signals, they don't substitute for professional accreditations that prove the clinic meets recognized veterinary standards. Pet owners comparing clinics often look specifically for accreditation badges as a quality signal.

Evidence:
Full visual review of all 6 chunks of the desktop home screenshot + all 8 section screenshots. No accreditation logos, no "AAHA-accredited" text, no "RCVS" text, no "Fear-Free Certified" text, no "Licensed in NY" text, no trust badge imagery of any kind found anywhere on the home page. The project's external components list also does not include any "Trustpilot" widget (Trustpilot is in the available components but not installed: `0FGMb16YHyLms7uyPaAH` is in "Additionally Available Components", not "Current Project External Components").

Recommended Fix:
Add an accreditation/trust badges strip — either in the hero (below the social proof row) or as a dedicated row above the footer. Include any real accreditations the clinic holds. If the clinic has no formal accreditations, at minimum add "Licensed veterinarians", "Bonded & insured", "Accepts pet insurance" badges.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-11 — No insurance / payment plans information visible on home page (only in collapsed FAQ)

Status: Open
Category: Content & copy
Severity: Medium
Location: `/` (entire page)

Description:
The FAQ section includes a question "Do you accept pet insurance or offer payment plans?" — confirming the clinic does have an insurance/payment policy worth communicating — but the answer is hidden inside a collapsed accordion, and no insurance or payment-plan information appears anywhere else on the home page. Cost and insurance are major decision factors for pet owners choosing a vet. Hiding this information in a collapsed FAQ means most visitors won't see it. There's no "Insurance accepted" badge, no "Payment plans available" callout, no pricing transparency section.

Evidence:
VLM analysis of the FAQ section screenshot (`/home/z/my-project/screenshots/sub1/section-FAQ.png`) confirmed the question "Do you accept pet insurance or offer payment plans?" is present but collapsed (answer not visible). Visual review of all other sections found zero mentions of "insurance", "payment", "pricing", "cost", or dollar amounts anywhere on the home page.

Recommended Fix:
Add an "Insurance & Payment" callout — either as a small badge/badge row near the trust signals, as a dedicated subsection in the Location & Hours area, or as a short paragraph in the Why Us section. At minimum, surface the answer to the FAQ question on the page itself rather than hiding it in a collapsed accordion.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-12 — No pricing transparency on home page (no cost indication or "see our pricing" link)

Status: Open
Category: Content & copy
Severity: Medium
Location: `/` › Main › Services section (`eZEcRmmgH`) and entire page

Description:
The Services section lists six service cards (Diagnostics & Lab Testing, Pain Relief & Comfort Care, 24/7 Emergency Care, Surgical Care & Procedures, Dental & Oral Health, Preventive Care & Wellness) — none of which include any pricing information, price range, "starting at" cost, or "see our pricing" link. The "View All Services" button leads to /services, but there's no indication that pricing will be available there. For a veterinary clinic, cost is one of the top concerns for pet owners — entirely omitting any pricing signal forces visitors to call or book to learn cost, which adds friction and may cause them to bounce to a competitor that's more transparent. The project has a "Price list card" component (`XX2THh6jc`) available but it's not used on the home page.

Evidence:
VLM analysis of the Services section screenshot (`/home/z/my-project/screenshots/sub1/section-Services.png`) explicitly returned: "No, there is no visible pricing or cost information on this page. All descriptions focus on the value and nature of the services rather than the cost." Visual review of all other home page sections found no pricing, no "starting at $X", no "see pricing" CTA anywhere.

Recommended Fix:
Either add a "Starting at $X" price to each Service card, add a "See our pricing" link near the "View All Services" button, or add a small "Transparent Pricing" callout in the Why Us section. If exact prices vary too much to show, at least add a price-range or "Request a quote" CTA with a clear path to cost information.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-13 — Footer lacks emergency contact info, phone/address quick reference, and newsletter signup

Status: Open
Category: Content & copy
Severity: Medium
Location: `/` › Footer (layout template `yDIYoKc7h` › `lwSF5de67` Footer component)

Description:
The Footer currently contains four columns: brand+tagline ("Vetly" / "Take care of your pet's health."), Navigate (Services, About, Blog, Contact), Socials (Facebook, Instagram, X, LinkedIn as text links), and Legal (Privacy Policy, Terms of Service, 404). For a veterinary clinic, the footer is prime real estate for emergency-critical info that pet owners may need at 2 AM: an emergency phone number, the clinic address, hours summary, and a "Book appointment" CTA. None of these are present. There's also no newsletter signup (the project has a Mailchimp component available but unused) — a missed lead-capture opportunity for a clinic that publishes a blog.

Evidence:
VLM analysis of the footer screenshot (`/home/z/my-project/screenshots/sub1/footer.png`) returned the full footer contents (logo, tagline, 3 link columns, copyright) and explicitly confirmed: "Newsletter Signup: None visible. Emergency Contact Info: None visible. Phone/Address: None visible. Trust Badges: None visible." The Project Inventory shows the Footer component is `Xx2RpZ5pV`.

Recommended Fix:
Add to the Footer: (1) emergency phone number with "24/7 on-call" label, (2) clinic address with link to maps, (3) hours summary (Mon–Fri 8–6, Sat 9–4, Sun Closed), (4) a "Book Appointment" CTA button, (5) optionally a newsletter signup form for blog updates.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-14 — Hidden duplicate Hero Image frame containing duplicate "Your Pet's Health, Our Promise" content (leftover from design iteration)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/` › Main › Hero section (`LQn3zLbUg`) › hidden "Hero Image" frame `Z9JS5BA29` (visible=false)

Description:
The Hero section contains TWO "Hero Image" frames: `Z9JS5BA29` (with `visible=false`, inside the Content wrapper `ay8ils9T7`) and `CYJj6h2yV` (visible, direct child of Hero). The hidden frame contains a duplicate Floating Trust Card with the same content as the visible one: "Your Pet's Health, Our Promise", "Reliable, modern, compassionate", "20K+", "Happy Pet Owners". This duplicate content is in the page tree (and would be crawled by search engines and read by screen readers) but is not visually rendered. It's a leftover from the design iteration that should be cleaned up.

Evidence:
Tree serialization showed both `Z9JS5BA29` (visible=false) and `CYJj6h2yV` (visible=undefined/true) as Hero Image frames. Text-run extraction returned duplicate strings: `v:vaHZkQ6l8:0:0` "Your Pet's Health, Our Promise" (in hidden frame) and `v:A7abFyE50:0:0` "Your Pet's Health, Our Promise" (in visible frame); same duplication for "Reliable, modern, compassionate", "20K+", "Happy Pet Owners". `getRect` on `Z9JS5BA29` returned `x=218 y=180.4 w=200 h=420` (positioned off the visible hero image area).

Recommended Fix:
Delete the hidden `Z9JS5BA29` frame (and its children including the duplicate Floating Trust Card `GT3p3XJ8w`). This removes the duplicate content from the DOM without affecting the visible design.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-15 — "No items" fallback text present in 4 collection lists on the home page

Status: Open
Category: Content & copy
Severity: Low
Location: `/` › Hero "Social Proof" avatars (`nhnEJgV3O` inside `NI9NxL18Q` "Empty State"), Services cards (`gCnK0d6YH` inside `bzohBi2Us` "Empty State"), FAQ items 1 and 2 (`uwC0I7LbN` inside `HXPYQYdt7`, `Ilzg8nm9l` inside `AVkkgm1mQ`)

Description:
Four collection lists on the home page have their default "Empty State" frame containing the placeholder text "No items". This text is currently hidden because the collections have items, but it's in the DOM. If a CMS collection ever fails to load (sync error, deleted collection, etc.), visitors will see the unhelpful "No items" text instead of meaningful fallback content. The default "No items" string is also unprofessional — it doesn't tell the visitor what's wrong or what to do.

Evidence:
Tree text-run extraction returned 4 instances of "No items": `v:nhnEJgV3O:0:0` (Hero), `v:gCnK0d6YH:0:0` (Services), `v:uwC0I7LbN:0:0` (FAQ), `v:Ilzg8nm9l:0:0` (FAQ). Ancestor walk confirmed each is inside a frame named "Empty State" (`NI9NxL18Q`, `bzohBi2Us`, `HXPYQYdt7`, `AVkkgm1mQ`).

Recommended Fix:
Either (a) customize each "Empty State" frame with a meaningful fallback message (e.g. "Check back soon for new content"), (b) hide the Empty State frame entirely (set visible=false) so nothing renders when items are missing, or (c) replace "No items" with an empty string. At minimum, ensure the fallback text is customer-appropriate.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-18 — Team cards have no social media, email, or contact links for individual veterinarians

Status: Open
Category: Content & copy
Severity: Low
Location: `/` › Main › Team section (`mB6Emc7AS` › `QgIvzDej1` Team Cards)

Description:
The four Team cards show only a photo, name, and role — no social media links (LinkedIn, Twitter), no email address, no "Book with Dr. X" link, no specialization details (e.g. years of experience, education, certifications). Many veterinary clinic team sections include at least a LinkedIn icon or a "Book with this vet" CTA on each card. The current cards are minimal and miss an opportunity to build personal trust and give pet owners a way to learn more about or connect with a specific veterinarian.

Evidence:
VLM analysis of the Team section screenshot explicitly returned "Social Media Icons: None" for all four team member cards. No contact links, no LinkedIn, no email, no "Book with Dr. X" CTA visible on any card.

Recommended Fix:
Add to each Team card: (1) a LinkedIn icon link (most relevant for professional credentials), (2) optionally an email icon, (3) optionally a "Book with Dr. X" CTA that deep-links to /booking with the vet pre-selected. Also consider adding a short credential line (e.g. "DVM, 12 years experience") under the role.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-19 — Footer "Socials" column shows platform names as text links, no graphical icons

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/` › Footer (layout template `yDIYoKc7h` › `lwSF5de67` Footer) › Socials column

Description:
The Footer's Socials column lists "Facebook", "Instagram", "X (Twitter)", "LinkedIn" as plain text links. Convention for footer social sections is to use recognizable platform icons (e.g. the Facebook "f", Instagram camera, X logo, LinkedIn "in") rather than text labels. Text-only social links look unfinished and take more visual space than necessary. The project has the Phosphor icon set installed (which includes brand icons) and external Instagram/Facebook/X components are available but unused.

Evidence:
VLM analysis of `footer.png` returned: "Socials: 1. Facebook, 2. Instagram, 3. X (Twitter), 4. LinkedIn" and explicitly noted "The 'Socials' column contains text links for social platforms, but no graphical icons are displayed next to them in this view."

Recommended Fix:
Replace the text labels with social media icons (use Phosphor brand icons or the external Instagram/Facebook/X components). Keep the text as accessible labels (aria-label) but display icons visually. Verify each icon links to the clinic's actual social media profile URLs.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-20 — No "About preview" or mission/values section that links to /about

Status: Open
Category: Content & copy
Severity: Medium
Location: `/` (entire page — Home has no section that previews/links to /about)

Description:
The home page has a "Why Us" section with 4 feature cards (Compassionate Care, Experienced Veterinary Team, State-of-the-Art Technology, Peace of Mind, Always) — this is a values/positioning section, but it has no "Learn more about us" or "Meet our team" CTA linking to /about. The Team section also doesn't link to /about. The footer has an "About" link, but there's no above-the-fold or mid-page promotion of the /about page. A veterinary clinic's About page is where pet owners go to learn about the clinic's history, mission, and philosophy — not promoting it from the home page is a missed opportunity to build trust and drive deeper engagement.

Evidence:
Visual review of all 8 home page sections confirmed no "About Us" CTA, no "Learn more about us" link, no "Read our story" button anywhere. The "View All Services" CTA (→ /services) and "View All Articles" CTA (→ /blog) are present, but no equivalent CTA for /about. The "Why Us" section's text container (`tfti5X9yu`) ends with the intro paragraph and has no button.

Recommended Fix:
Add a CTA to the "Why Us" section (e.g. "Learn More About Us" or "Read Our Story") that links to /about. Alternatively, add a small "About Vetly" preview card or banner between the Why Us and Team sections with a link to /about.

Confidence: High
Discovered by: sub-agent 1, session DR

---

## DR-26 — Zero pricing transparency on either Services page; "Price list card" component (`XX2THh6jc`) is not used

Status: Open
Category: UX & conversion
Severity: High
Location: `/services` (node `WBfQT22QS`) and `/services/:Services` (node `lhpeg56oV`); Services CMS collection `kt0DC5RWb`

Description:
Neither the Services index nor any service detail page surfaces a price for any service. The project ships a "Price list card" native component (`XX2THh6jc`) but it is not placed on either Services page — and the Services CMS collection schema has no `price` field at all, so there is no structured data to drive one even if the component were added. For a veterinary audience, "How much does a wellness exam cost?" and "What's the average cost of a dental cleaning?" are top-of-funnel search queries; complete price opacity forces the visitor to call or book to learn pricing, which is a known conversion friction pattern. The only price-like element anywhere on the page is the misconfigured floating "Buy Button" thumbnail (DR-2-3), which is illegible and links to X.com.

Evidence:
Serialized Services collection variables (CMS schema) — fields are: Title, Card Description, Icon Type, Featured, Slug, Hero Image, Intro Text, Gallery Image 1/2/3, What to Expect, Benefits, FAQ, id. No price/number/currency field exists. Component instances on `/services` Main (via `getDescendantsOfTypes ComponentInstanceNode`): Primary Button, Badge, Service Card, Why Us Card — no `Price list card` instance. Detail page Main tree (`blK0b98uj`): Hero, About Service, FAQ — no `Price list card` instance. Screenshot VLM analysis confirms: "No specific pricing is listed for individual services."

Recommended Fix:
(1) Add a `price` (or `price_range`) field to the Services CMS collection (`kt0DC5RWb`). Populate it per service. (2) Place a `Price list card` (`XX2THh6jc`) instance on the detail page bound to the new field, or at minimum surface price text in the Hero sub-heading area. (3) Consider adding a starting-price chip on the Service Card component (`ecHzMZLnH`) on the index. This is also flagged for sub-agent #13 (CMS) and sub-agent #11 (native components) for the Price list card audit.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-27 — Services CMS schema is missing critical service-detail fields: duration, price, prep instructions, related services

Status: Open
Category: CMS
Severity: High
Location: Services CMS collection `kt0DC5RWb` (variable schema)

Description:
The Services collection schema covers identity (Title, Slug, Icon, Hero Image), marketing copy (Card Description, Intro Text), and two body sections (What to Expect, Benefits, FAQ). It is missing four fields that a veterinary service detail page should have to be genuinely useful and conversion-ready:
1. **Price / price range** — see DR-2-5.
2. **Duration** ("30–60 min consult") — pet owners need to plan their visit; absent.
3. **Prep instructions** ("Fast your pet 8 hours before surgery", "Bring a fresh stool sample") — critical for surgery, dental, diagnostics. The existing "What to Expect" field is close but describes the visit, not pre-visit prep.
4. **Related services reference** (collectionreference single/multi → Services) — there is no cross-linking between related services on the detail page (see DR-2-7).

Evidence:
`framer.agent.serialize({ id: "kt0DC5RWb", depth: 1 }).variables` returns 13 entries — Title, Card Description, Icon Type, Featured, Slug, (Divider), Hero Image, Intro Text, Gallery Image 1, Gallery Image 2, Gallery Image 3, What to Expect, Benefits, FAQ, id. No `price`, `duration`, `prep_instructions`, or `collectionreference` variable exists.

Recommended Fix:
Add four new variables on collection `kt0DC5RWb`:
- `+Variable <id> name="Price" type="string" scope="kt0DC5RWb";` (or use `number` + currency formatting)
- `+Variable <id> name="Duration" type="string" scope="kt0DC5RWb";` (e.g. "30–45 min")
- `+Variable <id> name="Prep Instructions" type="richtext" scope="kt0DC5RWb";`
- `+CollectionReferenceVariable <id> name="Related Services" type="multi" collection="kt0DC5RWb" scope="kt0DC5RWb";`
Then populate per item and bind on the detail page (see DR-2-7).

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-28 — Detail page has no "Related services" section, no pricing block, no duration, no prep instructions block

Status: Open
Category: UX & conversion
Severity: High
Location: `/services/:Services` (node `lhpeg56oV`) → Desktop → Main (`blK0b98uj`)

Description:
The detail page body is structured as: Hero → About Service (intro + gallery + What to Expect + Benefits + FAQ). It is missing the cross-linking and informational sections that drive both SEO internal linking and conversion:
1. **No "Related services" section** — visitors reading about "End of Life Care" might also need "Pain Relief & Comfort Care" or "Senior Pet Care", but nothing on the page surfaces those links. This forces a back-button trip to the index.
2. **No pricing block** (see DR-2-5).
3. **No duration field rendered** (see DR-2-6).
4. **No prep instructions block** (see DR-2-6) — particularly important for "Surgical Care & Procedures", "Diagnostics & Lab Testing", and "Dental & Oral Health".

Evidence:
Tree walk of `blK0b98uj` at depth 4 returns exactly two top-level sections: `Hero (NJXQamoBU)` and `About Service (Nk0OW8Pym)`. No frame named "Related", "Other Services", "Pricing", "Duration", or "Prep" exists. The page's only navigation paths out are (a) the global Header, (b) the global Footer, (c) the global CTA banner — all of which are layout-template inherited, not detail-page-specific. There is no in-page cross-linking to sibling services.

Recommended Fix:
After DR-2-6 schema additions are made, add a new "Related Services" section to the detail page containing a CMS Collection List filtered by the new `Related Services` multi-reference field, rendering Service Card instances. Also add small structured blocks (price chip in hero, duration line, prep instructions panel inside About Service) bound to the new variables. The CMS Detail Pages implementation guide should be consulted for the Previous/Next item variables (mentioned in how-projects-work.md §CMS detail pages) which could provide a lighter-weight alternative.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-29 — Detail page renders duplicate "Benefits" column (same heading + same content twice)

Status: Open
Category: Content & copy
Severity: High
Location: `/services/:Services` (node `lhpeg56oV`) → Desktop → Main → About Service (`Nk0OW8Pym`) → inner Frame `HWvX4YU41` → children `Gzp2Fifh5`, `OIyyc8OVE`, `wgaPUAPqi`

Description:
The "About Service" section has a horizontal stack of three sub-sections under container `HWvX4YU41`. Walking the tree at depth 4 reveals:
- Section `Gzp2Fifh5` — heading RichTextNode text = `"What to Expect"`, Content node `IrsUD8a8K` bound to `var(--variable-DveubFVEm)` (the `What to Expect` CMS variable). ✓ Correct.
- Section `OIyyc8OVE` — Frame is *named* "What to Expect" but its heading RichTextNode text = `"Benefits"`, and Content node `RUCJNNAgW` is bound to `var(--variable-GXPTqAkip)` (the `Benefits` CMS variable). ✗ Mislabeled frame name + duplicate of #3.
- Section `wgaPUAPqi` — Frame named "Benefits", heading text = `"Benefits"`, Content node `tut5XNlSz` bound to `var(--variable-GXPTqAkip)` (the `Benefits` CMS variable). ✓ Correct, but identical to #2.

Evidence:
Serialized each of `Gzp2Fifh5`, `OIyyc8OVE`, `wgaPUAPqi` at depth 4 on pagePath `/services/:Services` — confirmed heading texts and variable bindings as above. The parent container `HWvX4YU41` has `layout: stack`, `stackDirection: horizontal`, `stackWrapEnabled: false`, `width: 1fr`, `height: 210px`, `overflow: clip` — so the three columns render side-by-side at a fixed 210px height with clipping.

Recommended Fix:
Either (a) delete section `OIyyc8OVE` (and its Tablet/Phone replicas) entirely so only the single correct "Benefits" column remains, or (b) repurpose it: rename the heading to a new label (e.g. "How to Prepare") and rebind its Content node to a new CMS variable (see DR-2-6's `Prep Instructions` proposal). Option (b) is preferred because it fills a real content gap.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-30 — Missing key veterinary services: no standalone Vaccinations, Grooming, Boarding, or Microchipping services in the CMS

Status: Open
Category: Content & copy
Severity: Medium
Location: Services CMS collection `kt0DC5RWb` (12 items)

Description:
The Services collection contains 12 items: End of Life Care, Parasite Prevention, Alternative Therapies, Exotic & Pocket Pets, Diagnostics & Lab Testing, Puppy Kitten Care, Pain Relief & Comfort Care, Senior Pet Care, 24/7 Emergency Care, Surgical Care & Procedures, Dental & Oral Health, Preventive Care & Wellness. Several services that prospective veterinary clients actively search for are absent as standalone services:
- **Vaccinations** — only mentioned in copy ("Puppy Kitten Care" card description says "vaccinations"; "Preventive Care & Wellness" mentions "customized vaccinations"). No dedicated page exists, which is a notable SEO gap because "dog vaccinations", "cat vaccines near me", and "puppy shots schedule" are high-volume queries.
- **Grooming** — not listed at all (some vet clinics offer grooming as an add-on).
- **Boarding** — not listed at all.
- **Microchipping** — not listed (commonly bundled with preventive/wellness but worth a standalone detail page for SEO).
- **Spay & Neuter** — mentioned inside "Surgical Care & Procedures" copy but no standalone page (high search volume).

Some of these may be intentional service-scope decisions, but vaccinations in particular is so central to veterinary care that its absence as a standalone page is a content gap. At minimum, the existing "Preventive Care & Wellness" page should explicitly call out vaccinations as a sub-topic.

Evidence:
`framer.agent.getNode({ id: "kt0DC5RWb" }).children` returns 12 items with slugs: `end-of-life-care`, `parasite-prevention-nutrition`, `alternative-therapies`, `exotic-pocket-pets`, `diagnostics-lab-testing`, `puppy-kitten-care`, `pain-relief-comfort-care`, `senior-pet-care`, `24-7-emergency-care`, `surgical-care-procedures`, `dental-oral-health`, `preventive-care-wellness`. No slug matching `vaccination`, `groom`, `board`, `microchip`, `spay`, or `neuter` exists.

Recommended Fix:
Add new CMS items for at least Vaccinations (strongly recommended) and consider Grooming, Boarding, Microchipping, and Spay/Neuter depending on Vetly's actual service scope. Each new item needs the full set of CMS fields populated (Title, Card Description, Icon, Hero Image, Intro Text, What to Expect, Benefits, FAQ, plus the new fields proposed in DR-2-6). Coordinate with sub-agent #13 (CMS) for population.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-31 — Services CMS "Featured" boolean field is unused on the index (no filter, no highlight)

Status: Open
Category: CMS
Severity: Medium
Location: Services CMS collection `kt0DC5RWb` field `Featured` (`IQz4QjTIO`); `/services` index → Services Cards collection list (`WlJklkSOA`)

Description:
The Services CMS schema has a boolean `Featured` field. Six of the twelve items have `featured=true` (Diagnostics & Lab Testing, Pain Relief & Comfort Care, 24/7 Emergency Care, Surgical Care & Procedures, Dental & Oral Health, Preventive Care & Wellness). However, the index page's Services Cards collection list (`WlJklkSOA`) is configured as a plain grid with `collectionList: { collection: "Services", repeatedDescendantId: "qZsOQyJnj" }` — no filter is applied on `Featured`, and the Service Card component (`ecHzMZLnH`) has no visual differentiation (badge, border, "Featured" tag) for featured items. The field is effectively dead data. Either remove it from the schema or wire it into the index (e.g. a "Featured services" row above the full grid, or a badge on featured cards).

Evidence:
Collection list node `WlJklkSOA` attributes — `collectionList: { collection: "Services", repeatedDescendantId: "qZsOQyJnj" }`, `gridColumnCount: 3`, `gap: "20px 20px"`. No `filter` or `sort` key present. Service Card component definition walk at depth 5 shows children: Icon, Title (bound to `--variable-WIcXdi0Pz`), Description (bound to `--variable-ft4SJ5q3O`), Action Button (with Action Text + Action Icon). No Featured-bound badge/element.

Recommended Fix:
Either (a) remove the `Featured` variable from the schema (`DEL IQz4QjTIO;` after confirming no consumers), or (b) add a "Featured Services" Collection List above the main grid filtered to `Featured = true`, and/or add a "Featured" badge to the Service Card component bound to the field.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-32 — Services index "Empty State" fallback text is the generic string "No items"

Status: Open
Category: Content & copy
Severity: Low
Location: `/services` (node `WBfQT22QS`) → Services Cards collection list `WlJklkSOA` → Empty State node `x_5gU4Bw5` → RichTextNode `ZNlYU8K7O`

Description:
The collection list has an Empty State fallback (`x_5gU4Bw5`) that renders the literal text `"No items"` if the Services collection is ever empty. This string is unhelpful to a visitor (who has no idea what a "collection" is) and on-brand for neither a vet clinic nor a software product. Currently the collection has 12 items so the fallback is not shown, but if CMS sync ever fails or the collection is temporarily emptied, visitors would land on a near-blank Services page reading only "No items" — a brand-damaging edge case.

Evidence:
Tree walk of `WlJklkSOA` at depth 5: child `x_5gU4Bw5` (Empty State) → RichTextNode `ZNlYU8K7O` → TextBlock → TextRun with `text: "No items"`.

Recommended Fix:
Replace the Empty State copy with something useful and on-brand, e.g. `"We're updating our services list. Please call us at <phone> or browse our wellness plans."` Include a Primary Button linking to `/contact` or `/booking`. The Empty State copy edit can be done via `framer.agent.replaceText({ id: "ZNlYU8K7O", searchText: "No items", replaceText: "<new copy>" }, { pagePath: "/services" })`.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-33 — Detail page metadata description uses `{{Card Description}}` (short card text) instead of a fuller detail-page summary

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/services/:Services` (node `lhpeg56oV`) → page `metadata` attribute

Description:
The detail page's `metadata` attribute is `{ title: "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet", description: "{{Card Description}}" }`. The description template binds to the *Card Description* CMS field — which is the short one-line marketing copy used on the index card (e.g. `"Compassionate palliative support and gentle euthanasia services to ensure dignity, peace, and comfort in your pet's final moments."` for End of Life Care). For SEO, Google truncates meta descriptions around 155–160 chars; this Card Description is fine length-wise but it duplicates the OG/card copy and doesn't reflect the richer page content (Intro Text, What to Expect, Benefits). Better practice is to bind description to a dedicated SEO summary field, or to `{{Intro Text}}` (truncated) which gives a fuller unique-to-page summary. Note: full SEO audit belongs to sub-agent #7 — this finding is raised from the Services scope because the page-level metadata template lives on the Services detail page node.

Evidence:
`framer.agent.getNode({ id: "lhpeg56oV" })` returns `attributes.metadata = { title: "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet", description: "{{Card Description}}" }`. Compare to index page metadata (`WBfQT22QS`): `{ title: "Veterinary Services | Wellness, Surgery & Emergency Care | Vetly", description: "Explore Vetly's full range of veterinary services, from routine wellness exams and vaccinations to surgery, dental care, and 24/7 emergency support." }` — the index has hand-written SEO copy, the detail page uses a thin variable substitution.

Recommended Fix:
Either (a) add a dedicated `SEO Description` richtext/string variable to the Services CMS collection and bind `description` to `{{SEO Description}}`, or (b) at minimum rebind to `{{Intro Text}}` so the description reflects the page's actual content. Coordinate with sub-agent #7 (SEO) for the broader meta-description audit.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-34 — Detail page "About Service" inner container has a fixed 210px height with overflow: clip — long bullet lists risk vertical cutoff

Status: Open
Category: UX & conversion
Severity: Medium
Location: `/services/:Services` (node `lhpeg56oV`) → Desktop → Main → About Service (`Nk0OW8Pym`) → inner horizontal stack container `HWvX4YU41`

Description:
Container `HWvX4YU41` (which holds the three side-by-side "What to Expect" / "Benefits" / "Benefits (duplicate)" columns) has `layout: stack`, `stackDirection: horizontal`, `width: 1fr`, `height: 210px` (fixed), `overflow: clip`. A fixed 210px height is brittle:
- If any service's "What to Expect" or "Benefits" richtext grows beyond 4 bullets (or uses long sentences), the bottom of the list will be visually clipped with no scroll affordance.
- This violates the core-principles "Auto-sizing requires layout" rule (FrameNode with `height: auto` instead of fixed pixel height) and the "Nodes default to auto-sizing" guidance — the container should size to content, not the other way around.
- The End of Life Care page (rendered in the screenshot) happens to fit because each list has exactly 4 short bullets, but other services like "Surgical Care & Procedures" or "Preventive Care & Wellness" may have longer content.

Evidence:
`framer.agent.serialize({ id: "HWvX4YU41", depth: 2 }, { pagePath: "/services/:Services" }).attributes` returns `{ layout: "stack", stackDirection: "horizontal", stackDistribution: "center", stackAlignment: "start", stackWrapEnabled: false, gap: "16px", overflow: "clip", position: "relative", width: "1fr", height: "210px" }`.

Recommended Fix:
`SET HWvX4YU41 height="auto" overflow="visible";` (or `overflow="clip"` with auto height is acceptable). Repeat on Tablet (`ztYrtMPA5HWvX4YU41`) and Phone (`kWpDPzsQWHWvX4YU41`) replicas. Verify on Tablet/Phone that the horizontal stack still makes sense — on Phone, consider switching `stackDirection` to `vertical` for the mobile breakpoint.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-35 — Service Card component shows only Title + Description + "Learn More" link; no price, category, duration, or featured badge

Status: Open
Category: Components
Severity: Medium
Location: Service Card component `ecHzMZLnH` (variants `LK3AVFLo7`, `yOjvWlEPq`)

Description:
The Service Card component renders an Icon (top), Title (bound to `--variable-WIcXdi0Pz`), Description (bound to `--variable-ft4SJ5q3O`), and an "Action Button" with arrow (the "Learn More →" link). It exposes no slot for: price/starting price, service category tag, estimated duration, or a "Featured" badge. As used on the index, every card looks visually identical apart from icon + text — there's no scannable hierarchy to distinguish emergency care from routine wellness. The cards are also visually consistent (a good thing) but undifferentiated (a missed opportunity). On the index screenshot, the 12 cards in a 3-col grid all look the same, which forces visitors to read every card to find what they need.

Evidence:
Serialized `ecHzMZLnH` at depth 5 — two variants (`LK3AVFLo7`, `yOjvWlEPq`) both contain: Icon component instance, Details Stack → Text Group (Title + Description) → Action Button (Action Text + Action Icon). No additional slots/elements. Index screenshot VLM analysis confirms: "Each card is white with rounded corners, a subtle shadow, an icon at the top, a title, a short description, and a 'Learn More →' link."

Recommended Fix:
Consider extending the Service Card component with optional slots: a small "Starting at $X" price chip (top-right), an optional "Featured" badge, and/or a category tag. If the Featured field (DR-2-10) is wired up, the card should expose a Featured badge variant. Coordinate with sub-agent #11 (native components) for the component-level redesign.

Confidence: High
Discovered by: sub-agent 2, session DR

---

## DR-36 — Featured Articles section shows wrong posts; one featured post is invisible on `/blog`

Status: Open
Category: CMS
Severity: Critical
Location: `/blog` → Desktop breakpoint → "Featured Articles" section (node `OtnL8EEyY`) → collection-list wrapper (node `O09c72xxk`); CMS collection `Blog` (id `b8Kw9KXWB`)

Description:
The Featured Articles collection list is configured with `{ "collection": "Blog", "repeatedDescendantId": "GpejBy_lr", "limit": "2" }` — it has **no filter and no sort**. It simply returns the first two items in the collection's natural CMS order. Meanwhile, the Articles grid directly below filters `Featured == false` (variableId `UJQFDqWfn` equals false).

The collection's natural order is: 1) `yAIJE8XUH` (Parasite Prevention, `featured=true`), 2) `x1V0Oc2_f` (First Aid Basics, `featured` unset → defaults to `false`), 3) `jajVoZZTr` (Feeding Right, `featured=true`). The Featured section therefore renders Parasite Prevention (correctly featured) AND First Aid Basics (which is NOT featured). The actually-featured "Feeding Right, Living Well: Pet Nutrition Basics" post (`jajVoZZTr`, `featured=true`) is the third item — it is excluded from Featured by the `limit: 2`, AND it is filtered out of the Articles grid because `Featured == false` excludes it. As a result, **a post explicitly marked as featured is invisible on the blog index**, and a non-featured post is rendered in the featured slot. This is silent data loss for the visitor and CMS author alike.

Evidence:
- Featured collectionList config (from `framer.agent.serialize({ id: "OtnL8EEyY", depth: 5 })`): `{ "collection": "Blog", "repeatedDescendantId": "GpejBy_lr", "limit": "2" }` — no `filters`, no `sorting`.
- Articles grid filter (from `framer.agent.serialize({ id: "dzt4SbfEq", depth: 5 })`): `filters: [{ "variableId": "UJQFDqWfn", "transforms": [{ "name": "equals", "value": false }] }]`.
- Blog collection items in natural order (from `framer.agent.serialize({ id: "b8Kw9KXWB", depth: 1 })`): yAIJE8XUH, x1V0Oc2_f, jajVoZZTr, G9FHqACps, WZtPeuwD2, jkZHK6dS7, sL2m8UplP, NGQN6X7p3, FF07FUpZm, Z7MSbSKtU.
- Item-level field check (from `serializeNodes`): `yAIJE8XUH.featured="true"`, `x1V0Oc2_f.featured` unset, `jajVoZZTr.featured="true"`.

Recommended Fix:
Add a filter to the Featured Articles collection list on node `O09c72xxk`: `filters: [{ "variableId": "UJQFDqWfn", "transforms": [{ "name": "equals", "value": true }] }]`. Optionally also add a sort by `Published Date DESC` for deterministic ordering. Verify all three featured posts (or however many exist) are intended to be `limit: 2` — if more than 2 posts are marked featured, raise the limit or remove the featured flag from the extras.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-37 — "Load More" button on `/blog` does nothing when clicked

Status: Open
Category: UX & conversion
Severity: Critical
Location: `/blog` → Desktop → "Articles" section → grid `KekS47E7A` → Load More instance `buWHHBQsM`; Load More component `sMRugCuTF`

Description:
The Load More component exposes a `Click` event-handler variable (`Wld3NDzSj`, type `eventhandler`) which its Default variant triggers via `onTap`. The instance placed on `/blog` (`buWHHBQsM`) does NOT wire up `$control__onClick` — the attribute is simply absent. Furthermore, the Articles grid's `paginationPageSize` is hardcoded to the literal `"4"`, NOT bound to the page-level `Visible Articles` variable (`ACje_oFEj`, initialValue 4). The `Visible Articles` variable is only used for the Load More button's own visibility condition (`lessThan 1000`). Clicking the button therefore triggers nothing — no items are revealed, no loading state is shown, no error is surfaced. With 10 posts in the collection and only 4 displayed, this means 6 posts are unreachable from the index (assuming the Featured section also fails per DR-3-1).

Evidence:
- Load More root variables: `[{"key":"onClick","id":"Wld3NDzSj","name":"Click","node":"EventHandlerVariable","type":"eventhandler"}]`.
- Load More Default variant `onTap`: `[{ "action": "TRIGGER_EVENT", "controls": { "id": "var(--variable-Wld3NDzSj)" } }]`.
- Instance `buWHHBQsM` attributes (full): `$control__variant: "Default"`, `position: "absolute"`, `bottom: "0px"`, `centerAnchorY: "98.09%"`, `visible: { from: "var(--variable-ACje_oFEj)", transforms: [{ name: "lessThan", value: 1000 }] }`. **No `$control__onClick` present.**
- Articles grid `collectionList.paginationPageSize: "4"` (literal, not bound to a variable).
- Page-level variable `ACje_oFEj` ("Visible Articles", type number, initialValue 4) is defined on the page node but only referenced by the Load More button's visibility check.

Recommended Fix:
On the Load More instance `buWHHBQsM`, set `$control__onClick` to increment the page-level `Visible Articles` variable (`ACje_oFEj`) by 4 (or by a sensible step). Then bind the Articles grid `paginationPageSize` on node `KekS47E7A` to `var(--variable-ACje_oFEj)` instead of the literal `"4"`. Optionally wire the Load More variant to switch to `Loading` while the increment is processing and to `Hidden` when `Visible Articles` reaches the total item count.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-38 — All Blog Card variants open internal post links in a new tab

Status: Open
Category: UX & conversion
Severity: High
Location: Blog Card component `EiCUZ0sVC` → variants `OSZXw3DUH` (Default), `ZN8y56CSQ` (horizontal Big), `k8p5fPamx` (horizontal Small), `BU9VdIEbd` (Overlay), and their Phone-scope twins

**Additional locations (merged findings):**
- Component `EiCUZ0sVC` (Cards/Blog Card) — root FrameNode has `link={"href":"var(--variable-q4ecqPYbc)","openInNewTab":true,"smoothScroll":true}` on all 7 variants. Used on `/blog` index and Home "Pet Health Tips" section.

Description:
Every Blog Card variant sets `link.openInNewTab = true` on the wrapper. The link target is `var(--variable-q4ecqPYbc)` (the post's CMS `Link` variable), which on the `/blog` index is configured as `{ "href": "/blog/:slug#main", "collectionItem": "var(--variable-CJvDdRtwN)" }` — i.e. internal site navigation. Forcing every blog card click to open in a new browser tab is bad UX: it breaks the back button, pollutes the user's tab bar, and is contrary to generally-expected behavior for in-site navigation. It is also an accessibility concern for screen-reader users who may not be aware a new window opened.

**Additional context (merged from DR-8-22):** Each blog card link has `openInNewTab: true`, which causes the link to open in a new browser tab. There is no `aria-label` or visible text indicating this behavior (e.g. "opens in new tab"). This can be disorienting for screen-reader users and users with cognitive disabilities, who may not realize a new tab has opened.

Evidence:
From `framer.agent.serialize({ id: "<variantId>", depth: 1 })` for each variant:
- `OSZXw3DUH` (Default): `{ "openInNewTab": true, "smoothScroll": true, "linkHref": "var(--variable-q4ecqPYbc)" }`
- `ZN8y56CSQ` (horizontal Big): same
- `k8p5fPamx` (horizontal Small): same
- `OyehRjapS` (horizontal Big, Phone-scope twin): same

The `/blog` index Featured instance (`GpejBy_lr`) and grid instance (`i8eg98N9a`) both pass `$control__link: { "href": "/blog/:slug#main", "collectionItem": "var(--variable-CJvDdRtwN)" }` — confirming internal navigation, not external.

**Additional evidence (from DR-8-22):** - Component `EiCUZ0sVC` walk (script `10-components-deep.js`): all 7 variants have `link={"href":"var(--variable-q4ecqPYbc)","openInNewTab":true,"smoothScroll":true}`.

Recommended Fix:
Set `link.openInNewTab = false` on every Blog Card variant (or simply remove the `openInNewTab` attribute so it defaults to false). Reserve `openInNewTab: true` for genuinely external links (e.g. social share targets). The Paginator Previous/Next links on the detail page already use the default (no `openInNewTab`), so this is inconsistent with the rest of the blog nav as well.

**Additional fix note (from DR-8-22):** Either (a) remove `openInNewTab: true` so links open in the same tab (preferred for in-site navigation), or (b) add an off-screen or visible "opens in new tab" indication to the link text or `aria-label`. For blog post navigation within the same site, same-tab is the better UX.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-39 — Blog detail page lacks author bio, related posts, social share, and end-of-article CTA

Status: Open
Category: UX & conversion
Severity: High
Location: `/blog/:Blog` (node `DvEqpc9aQ`) → Desktop breakpoint `lBjdH_FvV` → Main `dNx7WjoKc` → Article section `JhuQgDRPQ`

**Additional locations (merged findings):**
- `/blog/:Blog` (node `DvEqpc9aQ`) — entire page

Description:
The Article section of the blog detail page contains only three children: `Text Container` (header: author + date + title + subheading), `Banner` (hero image), and `Content` (rich-text body). The Paginator is a sibling section directly below. There are NO other components on the page — confirmed by `getDescendantsOfTypes({ id: "lBjdH_FvV", types: ["ComponentInstanceNode"] })` returning `[]` for the Desktop breakpoint (the layout template provides CTA + Footer globally, but no blog-specific components).

Missing the elements a reader (and a search engine) expects on a blog detail page:
- **Author bio / byline section** — only the bare author name "Dr Alex" appears as a Text S line in the header; no avatar, no credentials, no bio paragraph.
- **Related posts section** — none. After reading a post, the only navigation forward is Previous/Next, which is chronological, not topical.
- **Social sharing buttons** — none.
- **End-of-article CTA** (e.g. "Book an appointment", "Subscribe to our newsletter", "Ask a vet") — none. The body content of at least one post explicitly invites the reader to act ("At Vetly, we're here to support you… Book an Appointment or contact us for personalized advice.") but the page provides no button to do so — the visitor must scroll back to the global CTA in the layout template footer or use the main nav.

**Additional context (merged from DR-3-20):** Blog posts are a primary sharing surface — visitors who find a useful veterinary article often want to share it with friends, family, or social media. The `/blog/:Blog` page provides NO social sharing buttons (no X/Twitter, no Facebook, no LinkedIn, no copy-link, no email-share). The Framer project has `H9CvVrwLrFYAbKP9eYKI` (Facebook), `YLAIqVion55BUycOZr6e` (X), and `Hj20QU19p80mpYsvesiZ` (Copy Clipboard) available as external components — all unused. This is a missed organic-distribution opportunity, especially for a content-marketing surface.

Evidence:
- `framer.agent.serialize({ id: "JhuQgDRPQ", depth: 6 })` returned exactly three children: `vlqOrAJPz` (Text Container), `xVowaYVnA` (Banner), `xmNqnS9um` (Content RichTextNode).
- `framer.agent.getDescendantsOfTypes({ id: "lBjdH_FvV", types: ["ComponentInstanceNode"] })` returned `[]`.
- Layout template Wrapper provides only CTA (`GkwGTE6uU`) and Footer (`Xx2RpZ5pV`) globally; no per-page CTA or related-posts component.
- Post `Z7MSbSKtU` Content ends with: "At Vetly, we're here to support you and your senior companion every step of the way. Book an Appointment or contact us for personalized advice." — but no actionable button is rendered near this text.

**Additional evidence (from DR-3-20):** `framer.agent.getDescendantsOfTypes({ id: "lBjdH_FvV", types: ["ComponentInstanceNode"] })` returned `[]` — no share components of any kind on the detail page.

Recommended Fix:
Add the following sections to the Article page template, in this order after the Content RichTextNode:
1. Author byline block (avatar image + name + credentials + 1-2 sentence bio) — add an "Author" CMS reference field or a dedicated Authors collection.
2. Social share row (X / Facebook / Copy Link) — Framer has `H9CvVrwLrFYAbKP9eYKI` (Facebook), `YLAIqVion55BUycOZr6e` (X), and `Hj20QU19p80mpYsvesiZ` (Copy Clipboard) available as external components.
3. Related posts section — a 3-card grid filtered to the same `Article type` as the current post, excluding the current item.
4. End-of-article CTA — reuse the existing `GkwGTE6uU` CTA component or add a Primary Button linking to `/booking`.

**Additional fix note (from DR-3-20):** Add a social-share row immediately above or below the Content RichTextNode (or in a sticky sidebar on Desktop). Recommended set: Copy Link, X, Facebook, Email (mailto:?subject=…&body=…). Use the existing Framer external components for Facebook/X/Copy-Clipboard, and add a mailto link for email.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-40 — Blog detail header omits read time and article category

Status: Open
Category: Content & copy
Severity: Medium
Location: `/blog/:Blog` → Desktop → Article section → Text Container `vlqOrAJPz` (children `JK7kevfJC` row + `tbmRszkDN` Heading + `NwTXtJRbN` SubHeading)

Description:
The CMS schema defines both `Read Time` (`TtkrUfg8X`, number, default 3) and `Article type` (`TwZ9dZl7K`, option with cases Wellness / Senior Care / Vaccines / Grief Support / Nutrition / Emergency). Both are surfaced on the Blog Card (so they ARE visible on the `/blog` index). However, the detail page's Text Container only renders two metadata strings: an Author Name line and a Published Date line. The read time and article category are NOT displayed anywhere on the detail page. This is an inconsistency between the card and the detail page, and it removes two pieces of wayfinding context (estimated reading effort, topic category) that help a reader decide whether to invest in the article.

Evidence:
From `framer.agent.getDescendantsOfTypes({ id: "lBjdH_FvV", types: ["RichTextNode", "TextBlock"] })`, the only metadata text nodes in the Article section are:
- `jlkWuBAtS` (named "Published Date" but `text: "var(--variable-v365QHZYL)"` = Auther Name)
- `DibSNZ04T` (named "Published Date", `text: { from: "var(--variable-Q5oytgpyz)", transforms: [toDateString] }` = actual date)
- `tbmRszkDN` (Heading, `text: "var(--variable-Y55Ujs5Or)"` = Title)
- `NwTXtJRbN` (SubHeading, `text: "var(--variable-TPpJF6v7H)"` = Description)
- `xmNqnS9um` (Content body)
No node references `TtkrUfg8X` (Read Time) or `TwZ9dZl7K` (Article type) on the detail page.

Recommended Fix:
Extend the Text Container header on the detail page to display the Article type (as a `DyeB4pqpe` Badge, matching the Blog Card's Category Badge) and the Read Time (e.g. "5 min read"). Reuse the Blog Meta component (`GF64_og83`) or add a new row mirroring the Blog Card's meta row.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-41 — Phone breakpoint renders the Articles grid in 2 columns on narrow viewports

Status: Open
Category: UX & conversion
Severity: High
Location: `/blog` → Phone breakpoint `oKC1nohe6` → Articles grid `oKC1nohe6KekS47E7A`

Description:
The Articles grid uses `layout: "grid"` with `gridColumnCount: 2` on ALL three breakpoints (Desktop, Tablet, Phone). On the Phone breakpoint (max-width 767.98px, canvas width 390px), with the layout template's 16px horizontal padding, the available content width is 390 − 32 = 358px. After the 24px column gap, each Blog Card gets (358 − 24) / 2 = 167px of width. The Phone variant of the Blog Card is "horizontal Small" with height overridden to 400px (vs the variant's default 200px). A 167×400px card is awkwardly narrow and tall, and forces the cover image, title, and meta into a cramped horizontal layout. Two cards per row also doubles the cognitive load on a small screen. Standard practice is 1 column on phones ≤ 480-600px.

Evidence:
- Phone grid attrs (from `framer.agent.serialize({ id: "oKC1nohe6KekS47E7A", depth: 1 })`): `{ "layout": "grid", "gridColumnCount": 2, "gap": "24px 24px", "padding": "0px 0px 80px 0px" }`.
- Layout template Phone frame: `width: 390px`, `padding: "96px 16px 0px 16px"` → content width 358px.
- Phone Featured Articles list (`oKC1nohe6O09c72xxk`) uses `layout: "stack"` with `gap: 32px` — single-column (correct).
- Phone Blog Card instance attrs: `variant: "horizontal Small"`, `height: 400px`, `width: 1fr`.

Recommended Fix:
Set the Phone grid `gridColumnCount: 1` (or use `gridColumnMinWidth` to make it responsive). Alternatively, on Phone, swap the variant to the vertical "Default" card and let each card fill the column width. The current Phone Featured list already uses a single-column stack, so making the grid 1-column would also bring visual consistency between the two sections on mobile.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-42 — Phone Main section gap is 128px — excessive for mobile

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/blog` → Phone breakpoint `oKC1nohe6` → Main `oKC1nohe6peWUIV6zc` (the Phone-scope Main); also affects `/blog/:Blog` if mirrored

Description:
The Phone Main stack uses `gap: 128px` between its two child sections (Featured Articles and Articles). For comparison, the Desktop Main uses `gap: 160px` and Tablet is implied to inherit Desktop's value. 128px of vertical whitespace between sections on a 390px-wide, ~800px-tall phone viewport creates an outsized visual void — nearly 1/6 of a typical phone screen height per gap. This pushes the Articles section's heading and cards well below the fold after the Featured section, and contributes to an excessively long scroll. The layout template already adds 96px of top padding, so the first section starts at y≈96+(header height) and the second section starts roughly 700-900px down.

Evidence:
From `framer.agent.serialize({ id: "oKC1nohe6", depth: 2 }, { pagePath: "/blog" })`:
- Phone Main attrs: `{ "width": "1fr", "height": "auto", "maxWidth": "500px", "gap": "128px" }`.
- Desktop Main attrs (for contrast): `{ "width": "1fr", "maxWidth": "1280px", "gap": "160px" }`.
- Layout template Phone frame: `padding: "96px 16px 0px 16px"`.

Recommended Fix:
Reduce Phone Main `gap` to ~64-80px (typically half of desktop). If you want to preserve a strong visual break between Featured and Articles, 64-80px on mobile reads as a section break without forcing excessive scroll.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-43 — Five of ten blog posts have an empty Author Name field

Status: Open
Category: Content & copy
Severity: Medium
Location: CMS collection `Blog` (id `b8Kw9KXWB`) → field `$control__auther_name` (variable id `v365QHZYL`); items yAIJE8XUH, x1V0Oc2_f, G9FHqACps, jkZHK6dS7, Z7MSbSKtU

Description:
The Blog collection schema declares `Auther Name` (variable `v365QHZYL`) as an optional string with initialValue "Dr Alex". Five of the ten published posts do NOT set this field — they fall back to nothing (the variable is unset, not the default), so the rendered card and detail page header show an empty string for the author. Because the Blog Meta component renders the author name as a bare RichTextNode with no fallback transform, the result is a visible gap (or, on the detail page, a leading whitespace before the date in the meta row). The five affected posts are:
1. `yAIJE8XUH` (Parasite Prevention, Year-Round Protection) — also a featured post
2. `x1V0Oc2_f` (First Aid Basics, Ready When It Matters)
3. `G9FHqACps` (Keep Them Moving: Exercise for Every Life Stage)
4. `jkZHK6dS7` (Grieving a Pet, Healing With Love)
5. `Z7MSbSKtU` (10 Essential Tips for a Healthy Golden Years)

The five that DO set it use the literal string "Dr Alex" — i.e. every authored post is by the same person. This is a credibility risk for a veterinary blog: readers (and search engines) value named, credentialed authors. Having no author at all on half the posts is worse than having a generic one.

Evidence:
From `framer.agent.serializeNodes({ ids: [<all 10>], attributeFilter: ["$control__auther_name", ...] })`:
- Posts WITH author: jajVoZZTr, WZtPeuwD2, sL2m8UplP, NGQN6X7p3, FF07FUpZm — all return `author: "Dr Alex"`.
- Posts WITHOUT author: yAIJE8XUH, x1V0Oc2_f, G9FHqACps, jkZHK6dS7, Z7MSbSKtU — `author` is undefined in the response.
- Schema: `Auther Name` variable has `required: false` and `initialValue: "Dr Alex"` (but initialValue is only applied when creating a NEW item — existing items keep their stored value, which is empty).

Recommended Fix:
For each of the 5 unauthored posts, set `Auther Name` to "Dr Alex" (or the appropriate credited veterinarian). Going forward, consider making `Auther Name` a required field, and consider introducing an `Authors` CMS collection (with name, credentials, avatar, bio) so the byline can be a reference rather than a free-text string — this would also enable a proper author bio section on the detail page (see DR-3-4).

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-44 — Blog slug contains a non-ASCII typographic apostrophe

Status: Open
Category: SEO & metadata
Severity: High
Location: CMS collection `Blog` → item `sL2m8UplP` → `$control__slug` field

Description:
The post "Why Your Pet's Dental Health Matters" (item id `sL2m8UplP`) has slug `why-your-pet's-dental-health-matters`. The apostrophe is the Unicode right single quotation mark U+2019 (`'`), NOT an ASCII apostrophe (`'`) and NOT a hyphen. URL slugs must be ASCII-only — browsers will percent-encode this character (likely as `%E2%80%99`), producing a URL like `https://vetly.com/blog/why-your-pet%E2%80%99s-dental-health-matters`. This is ugly, hurts shareability (the URL doesn't paste cleanly into plain-text contexts), and can cause issues with some crawlers, link previewers, and analytics tools that don't handle multi-byte characters in paths consistently. None of the other 9 slugs contain non-ASCII characters.

Evidence:
From `framer.agent.serializeNodes({ ids: ["sL2m8UplP"], attributeFilter: ["$control__slug", "$control__title"] })`:
- `title: "Why Your Pet's Dental Health Matters"` (the title also uses U+2019, but in body copy that's stylistically correct).
- `slug: "why-your-pet's-dental-health-matters"` — the U+2019 character is present in the slug.

Recommended Fix:
Replace the U+2019 with nothing (preferred — slugs should drop punctuation) or with an ASCII hyphen, giving `why-your-pets-dental-health-matters`. After changing the slug, add a 301 redirect from the old (percent-encoded) URL to the new one to preserve any inbound links and search indexing. Audit the rest of the slugs (currently OK) on a go-forward basis.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-45 — Slug / title mismatch on the "10 Essential Tips" post

Status: Open
Category: Content & copy
Severity: Low
Location: CMS collection `Blog` → item `Z7MSbSKtU` → `$control__slug` vs `$control__title`

Description:
Item `Z7MSbSKtU` has `title: "10 Essential Tips for a Healthy Golden Years"` but `slug: "10-essential-tips-for-a-happy-healthy-golden-years"`. The slug includes the word "happy" which is absent from the title. Additionally, the title's grammar is awkward — "a Healthy Golden Years" mixes singular article "a" with plural "Years". Either the title or the slug is out of date, and the title itself has a grammar issue.

Evidence:
- `title: "10 Essential Tips for a Healthy Golden Years"`
- `slug: "10-essential-tips-for-a-happy-healthy-golden-years"`

Recommended Fix:
Decide on the canonical phrasing (e.g. "10 Essential Tips for Happy, Healthy Golden Years" or "10 Essential Tips for a Happy, Healthy Senior Pet"), then update both the title and slug to match. If changing the slug, add a 301 redirect from the old URL.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-46 — CMS field and component variable misspelled as "Auther Name" (should be "Author")

Status: Open
Category: CMS
Severity: Low
Location: Blog collection field `Auther Name` (variable id `v365QHZYL`); Blog Card component variable `Auther Name` (id `MTPxuL7ef`); Blog Meta component variable `Auther Name` (id `SOgehvcfj`); also propagated to the `/blog/:Blog` detail page Text Container RichTextNode `jlkWuBAtS` which is named "Published Date" but its text binds to the Auther Name variable

**Additional locations (merged findings):**
- Components `EiCUZ0sVC` "Blog Card" (variable `$control__autherName`) and `GF64_og83` "Blog Meta" (variable `$control__autherName`)

Description:
The misspelling "Auther" (instead of "Author") appears in three places: the Blog CMS collection field name, the Blog Card component's exposed control, and the Blog Meta component's exposed control. This is a leaky abstraction — CMS authors see "Auther Name" in the Framer CMS editor, and any future maintainer reading the component API sees the misspelled control name. The detail page also has a frame whose RichTextNode is NAMED "Published Date" but actually displays the Auther Name variable (see DR-3-13), compounding the confusion.

**Additional context (merged from DR-11-11):** Both components expose a string variable named `Auther Name` — a misspelling of "Author Name". The variable is used to bind the blog post author's display name in the Blog Meta sub-component nested inside Blog Card (8 nested Blog Meta instances per Blog Card variant × 8 variants = 64 binding points). Because Blog Meta's variable name is misspelled, Blog Card's variable that flows into it inherits the same misspelling. The variable name appears in the Framer editor right sidebar for every Blog Card / Blog Meta instance, making the editor UI look unprofessional.

Evidence:
- Blog collection schema: `{ "key": "$control__auther_name", "id": "v365QHZYL", "name": "Auther Name", "node": "Variable", "type": "string", "initialValue": "Dr Alex", "required": false }`
- Blog Card component variables: `{ "key": "$control__autherName", "id": "MTPxuL7ef", "name": "Auther Name", "node": "Variable", "type": "string", "initialValue": "Dr Alex" }`
- Blog Meta component variables: `{ "key": "$control__autherName", "id": "SOgehvcfj", "name": "Auther Name", "node": "Variable", "type": "string", "initialValue": "Dr Alex" }`

**Additional evidence (from DR-11-11):** `framer.agent.serializeNodes({ ids: ["EiCUZ0sVC","GF64_og83"], depth: 2 })` — both components list `[{name:"Auther Name", key:"$control__autherName", type:"string"}]` in their variables array.

Recommended Fix:
Rename the field/control in all three locations to "Author Name". In Framer, renaming a variable updates the display name only — the underlying `key` (e.g. `$control__auther_name`) and `id` stay stable, so this is a safe cosmetic change with no impact on data bindings. Also fix the misnamed Text Container node `jlkWuBAtS` on the detail page (see DR-3-13).

**Additional fix note (from DR-11-11):** Rename the variable in Blog Meta first (`Auther Name` → `Author Name`). The variable key (`$control__autherName`) can stay the same to avoid breaking existing bindings, but the display name should be corrected. Then propagate the rename to Blog Card's variable.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-47 — Blog Card `Desc Truncate` variable is dead — truncation is hardcoded to 2 lines

Status: Open
Category: Components
Severity: Low
Location: Blog Card component `EiCUZ0sVC` → "horizontal Big" variant `ZN8y56CSQ` → Description RichTextNode `ZN8y56CSQbECn7Mbv6`; also affects Default variant

Description:
The Blog Card component exposes a `Desc Truncate` control (variable `m55v_s_FK`, type number, initialValue 1) — ostensibly the number of lines to which the description should be clamped. However, the Description RichTextNode inside the variant sets `textTruncation: "2"` as a literal — it does NOT reference the `Desc Truncate` variable. As a result, changing the `Desc Truncate` value on a card instance (e.g. the Featured instance `GpejBy_lr` sets `$control__descTruncate: "1`) has no effect — the description is always clamped to 2 lines.

Evidence:
- Blog Card variables: `{ "key": "$control__descTruncate", "id": "m55v_s_FK", "name": "Desc Truncate", "type": "number", "initialValue": 1 }`.
- Description RichTextNode attrs (horizontal Big variant): `{ "text": "var(--variable-wgO_tDLA3)", "textTruncation": "2", "visible": "var(--variable-wjJrWuvBr)" }` — note `textTruncation` is the literal string `"2"`, not a variable reference.
- Featured instance `GpejBy_lr` sets `$control__descTruncate: "1"`, but the rendered card would still clamp to 2 lines.

Recommended Fix:
Either (a) bind the Description's `textTruncation` attribute to `var(--variable-m55v_s_FK)` so the control actually works, or (b) remove the `Desc Truncate` variable from the component API to avoid misleading maintainers. Option (a) is preferred if the intent was to allow per-instance truncation control.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-48 — Detail page header has two sibling nodes both named "Published Date"; the first actually renders the Author Name

Status: Open
Category: Components
Severity: Low
Location: `/blog/:Blog` → Desktop → Article section → Text Container `vlqOrAJPz` → row `JK7kevfJC` → children `jlkWuBAtS` and `DibSNZ04T`

Description:
The horizontal row at the top of the article header contains two RichTextNodes. Both are named "Published Date". The first (`jlkWuBAtS`) actually binds its `text` to `var(--variable-v365QHZYL)` — i.e. the Auther Name variable, NOT the date. The second (`DibSNZ04T`) correctly binds to a date formula (`var(--variable-Q5oytgpyz)` with `toDateString` transform). This makes the tree confusing to navigate in the Framer editor, and if a future maintainer tries to "fix" the duplicate-named Published Date node by deleting one, they could easily remove the author name by mistake. The first node should be named "Author Name" (and see DR-3-11 for the field-name typo).

Evidence:
From `framer.agent.serialize({ id: "vlqOrAJPz", depth: 5 })`:
- Row `JK7kevfJC` children:
  - `jlkWuBAtS`, name: "Published Date", `text: "var(--variable-v365QHZYL)"` (Auther Name)
  - `DibSNZ04T`, name: "Published Date", `text: { from: "var(--variable-Q5oytgpyz)", transforms: [{ name: "toDateString", dateStyle: "medium", capitalize: true }] }`

Recommended Fix:
Rename node `jlkWuBAtS` to "Author Name" to match what it renders. Optionally also wrap the author name and date with a separator (e.g. "·" or "|") since they are currently displayed with only a 16px gap and no visual separator — on the rendered page they read as two ungrouped strings.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-49 — Most recent blog post is 3+ months old; no publishing cadence signal

Status: Open
Category: Content & copy
Severity: Medium
Location: CMS collection `Blog` → all 10 items' `Published Date` field (`$control__published_date`)

Description:
The 10 blog posts have `Published Date` values ranging from 2026-01-01 to 2026-05-02. The project's `additionalContext.currentDate` is "August 6, 2026" and the inventory was generated 2026-08-07. The newest post is therefore 3 months and 5 days old; the oldest is just over 7 months old. There is no visible "last updated" or "publishing cadence" indicator on the `/blog` index (no "Subscribe for updates", no "New posts every Tuesday" copy, no RSS link). For a content-marketing surface positioned as "Expert advice from our veterinarians", a 3-month publishing gap (visible to any visitor who scrolls to the bottom of the page) signals the blog may be dormant. The Articles grid is sorted by Published Date DESC, so the stalest-dated posts appear at the bottom — but there's no editorial signal of activity.

Evidence:
From `serializeNodes` on all 10 items (sorted DESC by date):
- yAIJE8XUH "Parasite Prevention…" → 2026-05-02 (newest)
- x1V0Oc2_f "First Aid Basics…" → 2026-04-25
- jajVoZZTr "Feeding Right…" → 2026-02-18
- G9FHqACps "Keep Them Moving…" → 2026-02-11
- WZtPeuwD2 "Signs Your Pet Is Sick…" → 2026-02-04
- jkZHK6dS7 "Grieving a Pet…" → 2026-01-28
- sL2m8UplP "Why Your Pet's Dental Health Matters" → 2026-01-21
- NGQN6X7p3 "Pet Vaccines, Safe and Loving" → 2026-01-14
- FF07FUpZm "A Comprehensive Guide to Senior Pet Care" → 2026-01-07
- Z7MSbSKtU "10 Essential Tips for a Healthy Golden Years" → 2026-01-01 (oldest)

Project `additionalContext`: `{"userName":"Weblx agency","currentDate":"August 6, 2026","timeZone":"America/New_York"}`.

Recommended Fix:
Either (a) publish new posts on a regular cadence (e.g. monthly), or (b) if the blog is intentionally evergreen, add a visible "Last updated: <date>" or "Reviewed by Dr Alex on <date>" indicator on each post (this would require a new `last_reviewed_date` CMS field), or (c) prominently feature an email-subscription capture on the `/blog` index so visitors can be notified when new posts land. The `<additional-context>` suggests the site is being actively maintained (Aug 2026), but the blog content does not reflect that.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-50 — `/blog/:Blog` detail page has no category filter or search on the index, and no related-posts cross-linking

Status: Open
Category: UX & conversion
Severity: Medium
Location: `/blog` index (node `OUWIjsEU8`) — entire Main section; `/blog/:Blog` detail (node `DvEqpc9aQ`) — Article section

Description:
The `/blog` index has only two collection lists (Featured and Articles grid) and a single non-functional "Load More" button (see DR-3-2). There is no category filter, no tag cloud, no search input, no author filter, and no date archive — despite the CMS having a structured `Article type` field with 6 categories (Wellness, Senior Care, Vaccines, Grief Support, Nutrition, Emergency). A visitor interested in, say, only "Nutrition" posts must scroll through all 10 cards (4 visible + manual pagination that doesn't work) to find the one Nutrition post. Likewise, the detail page provides only chronological Previous/Next pagination — there is no "Related posts" section (see DR-3-4) so a reader finishing a Senior Care article cannot easily find the other Senior Care article.

The Framer component library has a Search component available (`6wAE2eMb2Tl3zrU7u4UL`) and the project could trivially add category badges as filter links — both are unused.

Evidence:
- `/blog` Desktop component instances: `[Badge, Blog Card, Badge, Blog Card, Load More]` — no Search, no filter UI.
- `/blog/:Blog` Desktop component instances: `[]` — no related-posts grid.
- CMS `Article type` cases: `["Wellness", "Senior Care", "Vaccines", "Grief Support", "Nutrition", "Emergency"]` — defined but unused as a filter dimension.

Recommended Fix:
1. On `/blog`, add a row of category filter pills above the Articles grid (Wellness, Senior Care, Vaccines, Grief Support, Nutrition, Emergency, All). Use Framer's collection-list filter binding to filter the grid by `Article type` based on the active pill.
2. Optionally add a Search input bound to the Blog collection's title/description fields.
3. On `/blog/:Blog`, add a "Related Articles" section below the Content body — a 3-card grid filtered to `Article type == current.Article type` AND `id != current.id`, sorted by Published Date DESC, limit 3.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-51 — One blog post is missing its `Article type` value

Status: Open
Category: CMS
Severity: Medium
Location: CMS collection `Blog` → item `Z7MSbSKtU` → `$control__article_type` field

Description:
Item `Z7MSbSKtU` ("10 Essential Tips for a Healthy Golden Years") has no `Article type` value set in the CMS. The schema declares `Article type` as an OptionVariable with `initialValue: "Wellness"` — but the initialValue only applies to newly-created items, so this existing item renders with no type. On the Blog Card, the Category Badge (`$control__text: "var(--variable-WHKyrcuAm)"`) displays the type; if the type is unset, the badge will render empty (or in some Framer versions, fall back to the default "Wellness"). The post's content is clearly senior-care-focused, so it should be categorized as "Senior Care", not left blank or defaulted to "Wellness".

Evidence:
From `serializeNodes` summary, item `Z7MSbSKtU` returned `type: undefined` (no `$control__article_type` value). All other 9 items returned a valid type.

Recommended Fix:
Set `Article type = "Senior Care"` on item `Z7MSbSKtU`. Going forward, consider making `Article type` a required field (the schema currently has no `required: true` on it).

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-52 — "Load More" button is positioned absolute at the bottom of the Articles grid and may overlap the last row of cards

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/blog` → Desktop → Articles section → grid `KekS47E7A` → Load More instance `buWHHBQsM`

Description:
The Load More button is a child of the Articles grid frame `KekS47E7A`, with `position: "absolute"`, `bottom: "0px"`, `centerAnchorY: "98.09%"`. The grid itself is `layout: "grid"`, `width: "1fr"`, `height: "auto"`, `padding: "0px 0px 80px 0px"` (80px bottom padding only). When the grid contains content (4 cards in 2 columns = 2 rows), the absolute-positioned button is anchored to the bottom edge of the grid's content box. With `centerAnchorY: 98.09%`, the button is positioned roughly at the bottom 2% of the grid height — overlapping the bottom of the second row of cards. The 80px bottom padding on the grid creates a buffer, but the button's `centerAnchorY` of 98.09% places it just inside the padding zone. This is brittle: any change to the grid's row count (via DR-3-2's intended Load More functionality) or to the card height will move the button. The Empty State (`xlVy0Nx51`) is also absolute-positioned with `minWidth: 100%, minHeight: 100%` — it would cover the entire grid including the Load More button when there are zero items.

Evidence:
From `framer.agent.serialize({ id: "buWHHBQsM", depth: 3 })`:
- `{ "position": "absolute", "left": "null", "right": "null", "top": "null", "bottom": "0px", "centerAnchorX": "50%", "centerAnchorY": "98.09%", "constraintsLocked": true, "width": "auto", "height": "auto" }`.
- Grid `KekS47E7A` attrs: `{ "layout": "grid", "padding": "0px 0px 80px 0px", "width": "1fr", "height": "auto" }`.
- Empty State `xlVy0Nx51` attrs: `{ "position": "relative", "minWidth": "100%", "minHeight": "100%", "visible": <conditional on item-count==0> }`.

Recommended Fix:
Restructure the Articles section so the Load More button is in normal flow (not absolute). For example: nest the grid + Empty State in a vertical stack inside `KekS47E7A` (so the grid is one child and the button is the next sibling, with `gap` providing spacing). This will keep the button below the grid no matter how many rows are rendered, and removes the need for the 80px bottom padding hack.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-53 — `/blog/:Blog` detail page does not mark the Blog nav item as active

Status: Open
Category: UX & conversion
Severity: Low
Location: `/blog/:Blog` (node `DvEqpc9aQ`) → page attribute `$control__activeLink`

Description:
The `/blog` index page sets `$control__activeLink: "Blog Active"` — so the Blog nav item is highlighted when a visitor is on the index. The `/blog/:Blog` detail page, however, sets `$control__activeLink: "Default"` — meaning when a visitor is reading a blog post, NO nav item is highlighted (or the home/default state is shown). This breaks wayfinding: a visitor on `/blog/parasite-prevention-year-round-protection` who wants to go back to the blog index has no visual cue that the "Blog" nav item is the right one to click.

Evidence:
- `/blog` page attrs: `$control__activeLink: "Blog Active"`.
- `/blog/:Blog` page attrs: `$control__activeLink: "Default"`.

Recommended Fix:
Set `$control__activeLink: "Blog Active"` on the `/blog/:Blog` page node so the Blog nav item stays highlighted on detail pages.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-54 — Detail page hero Banner has a heavy 6px border on Desktop and 5px on Phone

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/blog/:Blog` → Desktop → Article section → Banner `xVowaYVnA`; Phone equivalent `Cy4mEynEAxVowaYVnA`

Description:
The article hero Banner frame has `border: "6px solid var(--token-219c2d29-…)"` on Desktop (5px on Phone) — a 6-pixel solid border around a 1280×560px image. This is an unusually heavy stroke weight for an editorial image — typical hero image treatments use no border, a 1-2px subtle border, or a soft shadow. Combined with `radius: 40px` + `squircle: 65%`, the visual effect is a thick frame around the hero image that draws the eye to the border rather than the photograph. The same `--token-219c2d29-…` color is used as a fill for the Badge component (a pale neutral), so the border is light-colored against the photograph — increasing visual noise without adding clarity.

Evidence:
- Desktop Banner: `{ "border": "6px solid var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)", "radius": "40px", "width": "1fr", "height": "560px", "squircle": "65%" }`.
- Phone Banner: `{ "border": "5px solid var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)", "radius": "40px", "height": "320px" }`.
- Tablet Banner: `{ "border": "6px solid var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)", "radius": "40px", "height": "384px" }`.

Recommended Fix:
Reduce the border weight to 0 (preferred — let the image bleed to the rounded corners), or to 1-2px if a subtle frame is desired. The `radius: 40px` + `squircle: 65%` already provide enough visual containment.

Confidence: Medium
Discovered by: sub-agent 3, session DR

---

## DR-55 — Featured Articles section "horizontal Big" Blog Card forces fixed height 360px on Desktop; content may overflow or underflow

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/blog` → Desktop → Featured Articles → Blog Card instance `GpejBy_lr` (component variant `ZN8y56CSQ`)

Description:
The Featured Articles Blog Card uses the "horizontal Big" variant, which has a fixed `height: 360px` on Desktop. The card's content (Title + Description + Blog Meta + Category Badge + Arrow Button) is laid out in a vertical stack inside the right column with `gap: 32px` and `padding: 2px`. If the title is long (e.g. "A Comprehensive Guide to Senior Pet Care" wraps to 2 lines) AND the description is 2 lines (clamped) AND the meta row is present, the content may approach or exceed 360px — causing visual tightness or clipping. Conversely, shorter titles (like "Pet Vaccines, Safe and Loving") leave visible empty space at the bottom of the card. The variant does not set `height: auto` to allow content-driven sizing.

Evidence:
- Variant `ZN8y56CSQ` attrs: `{ "width": "1120px", "height": "360px", "layout": "stack", "stackDirection": "horizontal" }`.
- Blog Content inner frame attrs: `{ "layout": "stack", "stackDirection": "vertical", "gap": "32px", "padding": "2px", "width": "1fr", "height": "auto" }` (height auto on the content column, but the outer variant is fixed 360px).
- Description RichTextNode: `textTruncation: "2"`, `visible: "var(--variable-wjJrWuvBr)"` — 2-line clamp.

Recommended Fix:
Either change the variant height to `auto` so the card grows to fit its content, or verify across all current CMS items that the content fits within 360px and add a content-overflow strategy (e.g. shorter description clamp) if not. Since the card is in a vertical stack with gap, `height: auto` is safe.

Confidence: Medium
Discovered by: sub-agent 3, session DR

---

## DR-56 — Articles grid Default Blog Card has fixed height 550px with description hidden — large empty space likely

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/blog` → Desktop → Articles grid → Blog Card instance `i8eg98N9a` (component variant `OSZXw3DUH` "Default")

Description:
The Articles grid uses the "Default" Blog Card variant, which has a fixed `height: 550px` on Desktop. The instance sets `$control__descVisible: "false"` — so the description is hidden. The visible content on the card is therefore: cover image (top portion), Title, Blog Meta (author + date + read time), Category Badge. With description hidden, the bottom half of the 550px card is likely underfilled — leaving visible whitespace between the meta row and the category badge / bottom of card. The Default variant was probably designed to include a description; with it hidden, the fixed 550px height is no longer justified.

Evidence:
- Variant `OSZXw3DUH` attrs: `height: 550px` (from earlier serialize — confirmed via the instance which sets `height: "550px"`).
- Instance `i8eg98N9a` attrs: `{ "$control__variant": "Default", "$control__descVisible": "false", "$control__descTruncate": "1", "height": "550px", "width": "1fr" }`.

Recommended Fix:
Either (a) set the instance `$control__descVisible: "true"` so the description fills the lower portion of the card (recommended — adds context for the visitor), or (b) reduce the Default variant's height to ~400-440px to match the visible content, or (c) set the height to `auto` so the card sizes to its content. Option (a) is preferred for content density.

Confidence: Medium
Discovered by: sub-agent 3, session DR

---

## DR-57 — `/blog` index metadata description is well-written but no canonical / OG image is explicitly set on the index page

Status: Open
Category: SEO & metadata
Severity: Low
Location: `/blog` page node `OUWIjsEU8` → attributes.metadata

Description:
The `/blog` index page sets `metadata.title: "Pet Health Blog | Veterinary Tips & Advice | Vetly"` and `metadata.description: "Discover expert pet care advice from Vetly's veterinarians. Read our blog for wellness tips, vaccination guides, dental care, and more to keep your dog or cat healthy and happy."` — both are good. However, the index metadata does NOT include a `socialImage` (unlike the `/blog/:Blog` detail page which sets `socialImage: "var(--variable-kZ3Cwfwri)"`). When the `/blog` URL is shared on social media or messaging apps, the OG/Twitter card will fall back to whatever the site-level default social image is (set in site settings) — which may or may not be blog-relevant. The detail page correctly uses the post's cover image as its social image; the index page should use a curated blog-hero image.

Evidence:
- `/blog` index attrs.metadata: `{ "title": "Pet Health Blog | Veterinary Tips & Advice | Vetly", "description": "Discover expert pet care advice from Vetly's veterinarians. Read our blog for wellness tips, vaccination guides, dental care, and more to keep your dog or cat healthy and happy.", "noIndexSite": false }` — no `socialImage`.
- `/blog/:Blog` detail attrs.metadata: `{ "title": "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet", "description": "{{Description}}", "socialImage": "var(--variable-kZ3Cwfwri)" }` — has socialImage.

Recommended Fix:
Add a `socialImage` to the `/blog` index page metadata, pointing to a curated blog-hero image (e.g. one of the post cover images, or a custom branded blog OG image at 1200×630px).

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-58 — "Featured" boolean on Blog collection has no schema-level documentation; intended cardinality is unclear

Status: Open
Category: CMS
Severity: Low
Location: CMS collection `Blog` → `Featured` field (`UJQFDqWfn`)

Description:
The `Featured` boolean field has `initialValue: false` and `required: false`. There is no schema-level documentation indicating the intended cardinality (how many posts should be featured at once). The current data has 2 posts marked `featured=true` (yAIJE8XUH and jajVoZZTr), which matches the `limit: 2` on the Featured Articles collection list — but this coupling is implicit and fragile. If a CMS author marks a 3rd post as featured, it will be invisible on the index (per DR-3-1's missing filter, the 3rd featured post is excluded from Featured by the limit, and excluded from Articles by the filter). If a CMS author unfeatures one of the 2 currently-featured posts, the Featured section would show only 1 card (with the limit still 2). There is also no schema validation preventing all posts from being marked featured (which would empty the Articles grid entirely).

Evidence:
- `Featured` variable: `{ "key": "$control__featured", "id": "UJQFDqWfn", "name": "Featured", "node": "Variable", "type": "boolean", "initialValue": false }`.
- Featured Articles collectionList: `limit: "2"` (no filter — see DR-3-1).
- Articles grid filter: `Featured == false`.
- Current featured count: 2 of 10 posts.

Recommended Fix:
This is primarily mitigated by fixing DR-3-1 (add `Featured == true` filter to the Featured collectionList). Additionally, document the intended cardinality in the field's description (Framer supports field descriptions in the CMS editor), e.g. "Mark up to 2 posts as featured — these appear at the top of /blog. Additional featured posts will not appear anywhere." Consider raising the limit to 3 if the design supports it.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-59 — Empty State copy on Articles grid is the placeholder string "No items" — not user-facing quality

Status: Open
Category: Content & copy
Severity: Low
Location: `/blog` → Articles section → grid `KekS47E7A` → Empty State `xlVy0Nx51` → RichTextNode `NWfIoD2wo`

Description:
When the Articles collection list returns zero items (e.g. if all posts are marked featured, or if a future category filter has no matches), the Empty State frame becomes visible. Its copy is the literal string "No items" — a developer placeholder, not user-facing copy. A visitor who encounters this state sees "No items" with no explanation, no suggestion (e.g. "Check back soon" or "Browse all posts"), and no path forward.

Evidence:
From `framer.agent.serialize({ id: "dzt4SbfEq", depth: 5 })`:
- Empty State attrs: `{ "border": "1px dashed rgba(136, 136, 136, 0.2)", "fill": "rgba(204, 204, 204, 0.2)", "radius": "20px", "minWidth": "100%", "minHeight": "100%", "visible": <conditional on item-count==0> }`.
- Empty State RichTextNode `NWfIoD2wo`: `text: "No items"`, font Inter 16px, color rgb(153, 153, 153).

Recommended Fix:
Replace "No items" with user-facing copy such as "No articles found. Check back soon — our vets are working on new posts." or "No posts in this category yet — browse all articles instead." Include a link back to the unfiltered view if a filter is applied.

Confidence: High
Discovered by: sub-agent 3, session DR

---

## DR-60 — Duplicate "Dr. James Reed" team card on /about

Status: Open
Category: Content & copy
Severity: Critical
Location: `/about` → Desktop > Main > Team > Team Cards grid (id `tOMclTs4Y`); team card instances `gm_jYpv8v` and `AK0fZJmAw`

Description:
The Team section on `/about` ("The Vetly Care Team") shows four team members, but the 3rd and 4th cards have identical data. Both cards are `Teem Card` (component `T6DVfhsAL`) instances with `$control__name = "Dr. James Reed"` and `$control__job = "Surgical Specialist"`. Only the photos differ. This is a copy-paste error — the 4th team member was clearly duplicated without being renamed/relabeled. Visitors will perceive the page as sloppy, fake, or unfinished, which is especially damaging on an "About Us" / "Meet the team" page whose entire purpose is to build trust.

Evidence:
Serialized About page tree inspection shows:
- Instance `UqVLyM3uy` → name=`Dr. Leo Torres`, job=`Behavior & Wellness Coach`, image=`...jtM0NXxAyGpY1geagSUo6uvNjeY.webp`
- Instance `U_cZCFpFd` → name=`Dr. Sarah Mitchell`, job=`Lead Veterinarian`, image=`...l9trbGg69636tflF30eW7xb9SqQ.webp`
- Instance `gm_jYpv8v` → name=`Dr. James Reed`, job=`Surgical Specialist`, image=`...gQ3mb3KIWWsZHFPOiFuQ2x9LSU.webp`
- Instance `AK0fZJmAw` → name=`Dr. James Reed`, job=`Surgical Specialist`, image=`...PcTBm4JYn9qd4cCvhE1eOG0CW9Q.webp`

Recommended Fix:
Replace instance `AK0fZJmAw`'s overrides — set `$control__name` to a unique vet name and `$control__job` to a unique role (e.g., Dr. Maya Chen, Dental Specialist, or Dr. Omar Haddad, Exotic Pets). Confirm the 4th photo matches the new person.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-61 — Brand Guide documents wrong Primary color value

Status: Open
Category: Visual design & branding
Severity: High
Location: `/brand-guide` → Desktop > Section "Primary Colors" → text node `HUkefqFpu`

Description:
The Brand Guide page's "Primary Colors" section shows the Primary brand color as `rgb(0, 153, 255)`. However, the actual project color style token named "Primary" (id `8d76f153-6a21-4584-a490-7ac9adb914b2`, path `/Primary`) is `rgb(0, 144, 255)`. The green channel differs by 9 (153 vs 144). Because the Brand Guide is explicitly described as "the reference when extending the template," any designer or developer copying this value will use a different blue than the one the live site actually uses for buttons, links, and highlights — silently breaking brand consistency on every new asset.

Evidence:
Brand Guide page text node `HUkefqFpu` reads `"rgb(0, 153, 255)"`. Project color style from `framer.getColorStyles()` returns `{"id":"8d76f153-6a21-4584-a490-7ac9adb914b2","name":"Primary","path":"/Primary","light":"rgb(0, 144, 255)"}`. The 9-unit green channel discrepancy is real and not a rendering artifact.

Recommended Fix:
Edit the text of node `HUkefqFpu` on `/brand-guide` to read `rgb(0, 144, 255)` to match the actual Primary color token. While there, also visually verify the displayed Primary swatch is bound to the `--token-8d76f153-6a21-4584-a490-7ac9adb914b2` variable (rather than a hardcoded raw color) so the swatch and label can never drift again.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-62 — Brand Guide states "Inter is used throughout" but headings actually use Manrope

Status: Open
Category: Visual design & branding
Severity: High
Location: `/brand-guide` → Desktop > Typography section → description text node `YKEw6jWDW`

Description:
The Brand Guide's Typography section copy reads "Inter is used throughout for a clean, trustworthy feel. Headings step down from Heading 1 to Heading 6; body copy uses Text XS through Text XL depending on emphasis." This statement is false. The actual `framer.getTextStyles()` returns show that **every** heading style (Heading 1, Heading 2, Heading 2s, Heading 3, Heading 4, Heading 5, Heading 6) uses the **Manrope** font family (weights 500–700), while only the five body-text styles (Text XS, Text S, Text M, Text L, Text XL) use Inter (weight 400). The brand guide therefore misrepresents the typography system it claims to document. Anyone extending the template based on this guidance will use Inter for headings, producing an off-brand result. Additionally, the project font inventory lists 7 families (`Inter Display`, `Inter`, `Instrument Sans`, `Geist Mono`, `Gowun Batang`, `Geist`, `Manrope`) — not just Inter — so the documented typography also fails to mention 5 of the 7 installed fonts.

Evidence:
Project text styles from `framer.getTextStyles()`:
- Heading 1 (id `CimPz1gHs`) → `font.family = "Manrope"`, weight 500
- Heading 2 (id `Z1UxzBYMV`) → `font.family = "Manrope"`, weight 700
- Heading 2s (id `oZ2jm8VJY`) → `font.family = "Manrope"`, weight 600
- Heading 3, 4, 5, 6 → all `Manrope`
- Text S, L, XL, M, XS → all `Inter`, weight 400

Brand Guide page text node `YKEw6jWDW` reads: `"Inter is used throughout for a clean, trustworthy feel. Headings step down from Heading 1 to Heading 6; body copy uses Text XS through Text XL depending on emphasis."`

Recommended Fix:
Rewrite the Typography description on `/brand-guide` to accurately state: "Manrope is used for all headings (Heading 1–6) at medium to bold weights; Inter is used for body copy (Text XS through Text XL) at regular weight." Update the specimen labels if they imply all specimens are Inter. Optionally audit whether the 5 unused fonts (Inter Display, Instrument Sans, Geist Mono, Gowun Batang, Geist) should be removed from the project.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-63 — FAQ section on /about renders "No items" placeholder text

Status: Open
Category: Content & copy
Severity: High
Location: `/about` → Desktop > Main > FAQ section (Frame `FAQ`) → Container > FAQs (Frame) → text nodes `wB87HnGNd` and `Yy5x6pnpm`

Description:
The About page has a "Got Questions? We've Got Answers" FAQ section with the subheading "Everything you need to know about Vetly's services and care," but the actual FAQ list contains only 2 `FAQ item` component instances (`u98IpE90o`, `G_gV5DbnF`) and one of the FAQ text nodes literally renders the placeholder string `"No items"`. The text node `wB87HnGNd` (visible on Desktop) and its replica `Yy5x6pnpm` both return the text `"No items"` — this is the default empty-state label of a CMS collection list or "Load More" component that has not been populated. Visitors to a production site see a heading promising answers but no actual questions, plus a literal "No items" string. This makes the page look unfinished and breaks the trust-building intent of the FAQ section.

Evidence:
Extracted text from `/about` includes:
- `[v:GKDT0AukJ:0:0] "Got Questions? We've Got "`
- `[v:GKDT0AukJ:0:1] "Answers"`
- `[v:qmGp7m7hp:0:0] "Everything you need to know about Vetly's services and care"`
- `[v:wB87HnGNd:0:0] "No items"`
- `[v:Yy5x6pnpm:0:0] "No items"`

ComponentInstanceNode count on the Desktop About page shows only 2 `xUmE2HP3j` (FAQ item) instances: `u98IpE90o` and `G_gV5DbnF`.

Recommended Fix:
Either populate the FAQ section with at least 4–6 real Q&A pairs (e.g., "Do you accept walk-ins?", "What payment methods do you accept?", "How do I prepare my pet for surgery?", "Do you offer payment plans?"), or remove the FAQ section entirely from `/about` if no FAQ content exists yet. Also hide or replace the "No items" empty-state label.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-64 — /about has no accreditations or certifications section

Status: Open
Category: Content & copy
Severity: Medium
Location: `/about` (entire page) — no AAHA, RCVS, state veterinary board, Fear Free, or other certification mentions anywhere in the page text

Description:
For a veterinary clinic, accreditations and certifications (AAHA accreditation, RCVS registration, state board licensing, Fear Free certification, etc.) are critical trust signals. The About page text contains zero mentions of any accreditation, certification, or licensing body. The page promises "expert veterinary care" and "Licensed Veterinarians" (in the stat cards) but provides no verifiable proof of credentials. This is a missed conversion opportunity — prospective clients researching veterinary clinics typically look for accreditation logos and credentials before booking.

Evidence:
Full text extraction of `/about` (97 text nodes scanned across 3 breakpoints; 44 unique strings). Searching the unique text list shows zero occurrences of "AAHA", "RCVS", "accredit", "certif", "license", "fear free", or any accreditation body name. The Team section also shows no credentials next to vet names (just role titles like "Lead Veterinarian", "Surgical Specialist" — no DVM, VMD, DACVS, or equivalent post-nominals).

Recommended Fix:
Add an "Accreditations & Certifications" subsection to `/about` showing the clinic's accreditation logos (AAHA, state board, Fear Free, etc.) with brief context. Add post-nominal credentials to each team card (e.g., "Dr. Sarah Mitchell, DVM" instead of just "Dr. Sarah Mitchell").

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-65 — Stat Cards display "0" until Animated Number Counter animates (initial-render regression)

Status: Open
Category: UX & conversion
Severity: High
Location: `/about` → Desktop > Main > Stats > Stats Cards grid (4 Stat Card instances `cxNb_XZ5I`, `SHLEa7Oo6`, `ZHU8fWCD5`, `jXdRF1gUu`)

Description:
The "Trusted by Thousands of Pet Families" stats section uses the external `Animated Number Counter` component to animate from 0 to the final value. The actual data configured on the 4 Stat Cards is correct (5000+ Pets Treated, 98% Client Satisfaction, 15+ Licensed Veterinarians, 24/7 Emergency Support). However, the screenshot captured at initial render shows all four stats displaying "0+", "0%", "0+", "0/7" because the Animated Number Counter has not yet animated up to the final values. This affects every visitor on first paint, every visitor using reduced-motion settings (where the animation may be disabled), every screenshot shared on social media, and every search-engine crawler that snapshots the page. The visual impression is that the clinic has treated zero pets and has zero percent client satisfaction — the opposite of the intended trust signal.

Evidence:
VLM analysis of `/about` screenshot reports: "The 'Trusted Results' section contains obvious placeholder zeros (0+, 0%, 0/7) instead of actual statistics." Verified the actual instance data is correct: `cxNb_XZ5I` `$control__number = "5000"` and `$control__suffix = "+"`; `SHLEa7Oo6` `$control__number = "98"` and `$control__suffix = "%"`; `ZHU8fWCD5` `$control__number = "15"` and `$control__suffix = "+"`; `jXdRF1gUu` `$control__number = "24"` and `$control__suffix = "/7"`. The data is right; the initial-render visual is wrong.

Recommended Fix:
Configure the Animated Number Counter code component to render the final value by default and only animate when the user has scripting enabled AND prefers motion. Alternatively, set the counter's `initialSize`/`startValue` to the final number so the static text content shows the real value, and animate only the visual reveal. The page should never display "0" as the static text content of a stat.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-66 — Brand Guide colors shown in RGB format, not hex

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/brand-guide` → Primary Colors section (text nodes `HUkefqFpu`, `XAmidQ_zz`, `uEh1QBQGL`, `sRomgbxIk`, `Dky4vCxen`)

Description:
The Brand Guide page documents every brand color as an `rgb(R, G, B)` string (e.g., `rgb(0, 153, 255)`, `rgb(0, 53, 255)`, `rgb(24, 50, 77)`). Standard brand guides universally display hex values (`#0099FF`, `#0035FF`, `#18324D`) because they are shorter, copy-pasteable directly into CSS / Figma / Sketch / any design tool, and easier to communicate verbally. The secondary color section (slate-100, slate-300, etc.) doesn't show any color value at all — just the color name with a swatch. A designer extending the template has no way to copy a hex value without manually converting RGB to hex.

Evidence:
Brand Guide text extraction:
- `HUkefqFpu` → `"rgb(0, 153, 255)"`
- `XAmidQ_zz` → `"rgb(0, 53, 255)"`
- `uEh1QBQGL` → `"rgb(24, 50, 77)"`
- `sRomgbxIk` → `"rgb(0, 0, 0)"`
- `Dky4vCxen` → `"rgb(255, 255, 255)"`

None of the slate or neutral scale color tokens have any RGB or hex label visible on the page.

Recommended Fix:
Replace each `rgb(R, G, B)` label with the equivalent hex string (e.g., `#0099FF`). Also add hex labels beneath the slate and neutral swatches so designers can copy any token's value.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-67 — Brand Guide missing Voice & Tone guidelines

Status: Open
Category: Content & copy
Severity: Medium
Location: `/brand-guide` (entire page) — no Voice & Tone section present

Description:
The Brand Guide documents Logo, Colors, Typography, Buttons, Inputs, Cards, Icons, Border Radius, Shadows, Spacing, and Component Examples — but has no Voice & Tone section. For a content-driven veterinary brand where the tone (warm, reassuring, professional, pet-loving) is the brand's emotional differentiator, missing voice guidelines is a significant gap. Anyone writing copy for the site (blog posts, service descriptions, FAQ answers, email templates) has no documented rules to follow, which leads to tonal drift between pages and authors.

Evidence:
Brand Guide page text extraction (full text dump reviewed) contains section headings: "Logo Usage", "Primary Colors", "Secondary Colors", "Typography", "Buttons", "Inputs", "Cards", "Icons", "Border Radius", "Shadows", "Spacing Principles", "Component Examples". No section titled "Voice", "Tone", "Voice & Tone", "Writing", or "Copy" appears. The closest the page comes is the line "Inter is used throughout for a clean, trustworthy feel" — which describes the font, not the writing voice.

Recommended Fix:
Add a Voice & Tone section to `/brand-guide` covering: (1) brand personality attributes (e.g., warm, expert, calm, plain-spoken), (2) do/don't copy examples, (3) preferred terminology (e.g., "pet parent" vs "owner", "companion animal" vs "pet"), (4) tone for different contexts (emergency vs wellness visit), (5) reading-level target.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-68 — Brand Guide missing Imagery guidelines

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/brand-guide` (entire page) — no Imagery / Photography section present

Description:
The Brand Guide documents icons, colors, type, and components but has no Imagery or Photography guidelines section. For a veterinary brand, photography is a primary trust signal — photos of staff, clinic interiors, and pets appear on Home, About, Services, and Blog. Without documented imagery rules (e.g., "warm natural lighting", "diverse pet species", "no distressed animals", "show staff in scrubs interacting with pets", "avoid stock-photo clichés"), image selection will drift and the brand will look inconsistent. The VLM analysis specifically noted: "No specific photography guidelines (e.g., 'no stock photos,' 'warm lighting') are listed in this view."

Evidence:
Brand Guide page section headings enumerated in text extraction: Logo, Primary Colors, Secondary Colors, Typography, Buttons, Inputs, Cards, Icons, Border Radius, Shadows, Spacing, Component Examples. No "Imagery", "Photography", "Photos", or "Image Style" section.

Recommended Fix:
Add an Imagery / Photography section to `/brand-guide` covering: (1) photographic style (lifestyle vs clinical, lighting, color grading), (2) acceptable subjects (staff with pets, clinic interiors, procedures), (3) prohibited subjects (distressed animals, graphic procedures, identifiable clients without consent), (4) technical specs (minimum resolution, aspect ratios, file formats), (5) examples of "on-brand" vs "off-brand" photos.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-69 — Brand Guide page metadata and H1 expose "Template" framing on a public URL

Status: Open
Category: Content & copy
Severity: Medium
Location: `/brand-guide` page metadata (`title`, `description`) + page H1 text node `xbjV5Mh_O`

Description:
The Brand Guide page is published on the public URL `/brand-guide`. Its page metadata `title` is `"Brand Guide | Vetly Template"`, its `description` is `"Colors, typography, components, and design principles used across the Vetly template."`, and the page H1 reads `"Vetly Design System"`. The metadata explicitly calls Vetly a "template" in both title and description. Although the page is set to `noIndex: true` (so it won't appear in Google search results), the page is still publicly accessible at `/brand-guide` to any human visitor who types the URL or clicks a link. If the goal is for Vetly to be perceived as a real veterinary clinic, having a public page that calls it a template undermines the entire brand. (Even if Vetly is genuinely a template demo for sale, the page metadata repeating "template" twice is redundant and the page itself ends with a "Book Appointment" CTA which is a conversion action not appropriate for a template-marketing page.)

Evidence:
`framer.agent.getNode({ id: "hkW4RaXgm" })` returns `attributes.metadata = {"title":"Brand Guide | Vetly Template","description":"Colors, typography, components, and design principles used across the Vetly template.","noIndex":true,"noIndexSite":false}`. Page H1 text node `xbjV5Mh_O` reads `"Vetly Design System"`.

Recommended Fix:
Decide the intent. If Vetly is a real clinic: remove the word "Template" from the title and description; consider whether `/brand-guide` should be publicly accessible at all (the design system documentation is typically internal-only). If Vetly is a template for sale: leave the metadata as-is but remove the "Book Appointment" CTA at the bottom of the page since template buyers don't book appointments, and clearly label the page as "Template Documentation" rather than implying it's the live clinic's brand guide.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-70 — Brand Guide ends with a "Book Appointment" CTA inappropriate for a documentation page

Status: Open
Category: UX & conversion
Severity: Low
Location: `/brand-guide` → bottom-of-page CTA banner (visible in brand-guide.jpg screenshot, "Ready to Give Your Pet the Best Care?" + "Book Appointment" button)

Description:
The Brand Guide page ends with a full-width gradient CTA banner reading "Ready to Give Your Pet the Best Care?" with a "Book Appointment" primary button — the same CTA used on Home, About, Services, etc. This conversion CTA is contextually inappropriate on a brand-system documentation page. The page is meant to be a reference for designers/developers extending the template; pushing an appointment booking at the end breaks the documentation framing and creates cognitive dissonance. (The page metadata also explicitly says this is a "template" reference page — making the booking CTA doubly out of place.)

Evidence:
VLM analysis of `/brand-guide` screenshot reports: "Footer CTA: 'Ready to Give Your Pet the Best Care?' 'Book your visit today and experience compassionate, expert veterinary care.' Button: 'Book Appointment'". The CTA banner is part of the layout template (default layout template `yDIYoKc7h`), so it appears on every page — but on `/brand-guide` specifically it adds no value.

Recommended Fix:
Either remove the CTA banner from `/brand-guide` (override the layout template), or replace it with a documentation-appropriate CTA such as "Back to Home" or "View Component Library" or a download link to the brand assets.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-71 — "Teem Card" component misspelled (should be "Team Card")

Status: Open
Category: Components
Severity: Low
Location: Component `T6DVfhsAL` (displayName "Teem Card", name "Cards/Teem Card")

Description:
The Team Card component is misspelled "Teem Card" (extra 'e', missing the 'a'). The component name "Cards/Teem Card" appears in the Framer editor component picker, in the project inventory, and propagates to every instance (4 on `/about`, plus replicas on Tablet and Phone = 12 total instances reference this misspelled component). The variant of this component is also poorly named — single letter `"L"` instead of a descriptive name like "Default" or "Portrait".

Evidence:
`framer.agent.serialize({ id: "T6DVfhsAL", depth: 4 })` returns `{ "name": "Cards/Teem Card", "$variants": [{ "id": "XSt04gwsA", "name": "L" }], ... }`. Project inventory file (`project-inventory.md`) also lists the displayName as "Teem Card".

Recommended Fix:
Rename the component from "Teem Card" to "Team Card" and rename its variant from "L" to a descriptive name (e.g., "Default" or "Portrait Card"). Framer will propagate the rename to all 4 instances on `/about` automatically.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-72 — Mission Card component used for "values" cards but no actual Mission Card on /about

Status: Open
Category: Components
Severity: Low
Location: Component `HW4zuDyG0` ("Mission Card") — used 3× on `/about` for VALUES, not for the mission statement

Description:
The Mission Card component (id `HW4zuDyG0`) is documented in the inventory as a "Mission Card" but is used on `/about` for the three VALUES cards in the "Care That Goes Beyond Treatment" section — i.e., "Compassion First", "Modern & Reliable Care", "Built on Trust". The actual mission STATEMENT on `/about` is a plain paragraph (`"We are committed to providing compassionate, high-quality veterinary care..."`) — not rendered through a Mission Card. The component name is therefore misleading: it's structurally an icon+title+content card, but calling it "Mission Card" suggests it should hold the mission statement. A future maintainer reading the component name will be confused about where the actual mission lives.

Evidence:
`/about` Desktop page has 3 `HW4zuDyG0` instances in `Main/Mission/Mission Cards`:
- `UybosA1wB` → title=`Compassion First`, iconName=`Hand Heart`, content=`"We treat every pet with kindness, patience, and respect..."`
- `DmBQy4azL` → title=`Modern & Reliable Care`, iconName=`Stethoscope`, content=`"From advanced diagnostics..."`
- `bivREsYii` → title=`Built on Trust`, iconName=`Shield Check`, content=`"We believe in clear communication..."`

Meanwhile the mission statement itself is in a plain RichTextNode `TCK158lYo` reading `"We are committed to providing compassionate, high-quality veterinary care..."` — not in a Mission Card.

Recommended Fix:
Either (a) rename the `HW4zuDyG0` component from "Mission Card" to "Value Card" or "Feature Card" to match its actual usage, or (b) restructure the Mission section to actually use a Mission Card component that displays the mission statement prominently.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-73 — Why Us Card (Sr15oMIZ5) and Trust Card (YwXTWsIji) components never used on /about or /brand-guide

Status: Open
Category: Components
Severity: Low
Location: Components `Sr15oMIZ5` (Why Us Card) and `YwXTWsIji` (Trust Card) — unused on `/about` and `/brand-guide`

Description:
The project inventory lists two trust-focused components — "Why Us Card" (`Sr15oMIZ5`) and "Trust Card" (`YwXTWsIji`) — but neither is used on the About page (which is the most natural place for trust-building content) nor on the Brand Guide page (which is the natural place to demonstrate the trust components). They may be used elsewhere on the site, but on About — where they would have maximum conversion impact — they're absent. Their absence on the Brand Guide also means anyone extending the template has no example of how to use them.

Evidence:
`getDescendantsOfTypes({ id: "mWgiU9J96", types: ["ComponentInstanceNode"] })` returns 28 unique ComponentInstanceNodes on Desktop `/about`. Component IDs in use: `ARbK0E6gq` (Primary Button), `NoQy1opGY` (Outline Button), `codeFile/hZwaqDB:default` (ImageReveal), `DyeB4pqpe` (Badge), `HW4zuDyG0` (Mission Card), `T6DVfhsAL` (Teem Card), `Hn1T3Ve4o` (Stat Card), `ruZNfQdon` (Testimonial card), `cXuHXndOE` (Map card), `xUmE2HP3j` (FAQ item). Neither `Sr15oMIZ5` nor `YwXTWsIji` appear in the list. Same for `/brand-guide` Desktop: 9 component instances, IDs `DyeB4pqpe`, `ARbK0E6gq`, `NoQy1opGY`, `ecHzMZLnH` (Service Card), `ruZNfQdon` (Testimonial card), `Iz7ICmC8H` (Contact Card), `xUmE2HP3j` (FAQ item). Why Us Card and Trust Card not present.

Recommended Fix:
Either (a) use Why Us Card and Trust Card on `/about` to add a structured "Why Choose Vetly" trust section between the Story and Team sections, or (b) demonstrate them in the Component Examples section of `/brand-guide`, or (c) if they are deprecated, remove them from the component library.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-74 — Text styles "Heading 2s" and "Text XL" use raw RGB color `rgb(15, 23, 43)` instead of the Text color token

Status: Open
Category: Visual design & branding
Severity: Medium
Location: Project text styles "Heading 2s" (id `oZ2jm8VJY`) and "Text XL" (id unknown without further inspect — visible in `framer.getTextStyles()` result) — both have `color: "rgb(15, 23, 43)"` (raw value) instead of the Text color token

Description:
Two of the twelve project text style presets — "Heading 2s" and "Text XL" — use a raw hardcoded color `rgb(15, 23, 43)` instead of being bound to the project's "Text" color token (id `8a93520a-ceec-4246-af62-32f5d8f70f28`, value `rgb(24, 50, 77)`). This causes three problems: (1) the text colors in these two styles are visually inconsistent with the documented brand Text color (15 vs 24 in red, 23 vs 50 in green, 43 vs 77 in blue — a measurable difference); (2) updating the "Text" color token in the future will not propagate to these two styles, silently breaking brand consistency; (3) the Brand Guide page documents Text as `rgb(24, 50, 77)` but anyone using "Heading 2s" or "Text XL" gets a different color. The other 10 text styles correctly bind to a named color token (slate-700, slate-800, slate-600).

Evidence:
`framer.getTextStyles()` returns (truncated for clarity):
```
Heading 1     font=Manrope  color=slate-800(rgb(29, 41, 61))
Heading 2     font=Manrope  color=slate-800(rgb(29, 41, 61))
Heading 2s    font=Manrope  color=rgb(15, 23, 43)         <-- raw, not token-bound
Heading 3     font=Manrope  color=slate-700(rgb(49, 65, 88))
Heading 4     font=Manrope  color=slate-800(rgb(29, 41, 61))
Heading 5     font=Manrope  color=slate-800(rgb(29, 41, 61))
Heading 6     font=Manrope  color=slate-700(rgb(49, 65, 88))
Text S        font=Inter    color=slate-600(rgb(69, 85, 108))
Text L        font=Inter    color=slate-700(rgb(49, 65, 88))
Text XL       font=Inter    color=rgb(15, 23, 43)         <-- raw, not token-bound
Text M        font=Inter    color=slate-600(rgb(69, 85, 108))
Text XS       font=Inter    color=slate-600(rgb(69, 85, 108))
```
Brand Guide page documents Text as `rgb(24, 50, 77)` (the token value), but `rgb(15, 23, 43)` ≠ `rgb(24, 50, 77)`.

Recommended Fix:
Edit the "Heading 2s" and "Text XL" text style presets to bind their `color` to the `Text` color token (id `8a93520a-ceec-4246-af62-32f5d8f70f28`) instead of the raw `rgb(15, 23, 43)` value. After the change, all 12 text styles will be token-bound and consistent with the documented brand Text color.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-75 — /about Story section uses an unoptimized PNG image while Hero uses WebP

Status: Open
Category: Performance & technical
Severity: Low
Location: `/about` → Desktop > Main > Story section → image Frame (fill = `https://framerusercontent.com/images/wzaOFvr7x6haFaSLTi7jeiaJEKM.png`)

Description:
The Story section's main image is a `.png` file (`wzaOFvr7x6haFaSLTi7jeiaJEKM.png`, displayed at 545px height on Desktop, 500px on Tablet, 340px on Phone), while the Hero image directly above it uses the more efficient `.webp` format (`2mYRK3PxyCOvm3oAGgVTcKSvBg.webp`). For a photographic image with no transparency need, PNG is significantly larger than WebP at equivalent visual quality, adding unnecessary bytes to the page load. The PNG likely has transparency (which is why it was chosen) but if the visual doesn't actually need transparency, switching to WebP would reduce file size by 60–80%.

Evidence:
Serialized About page tree shows:
- Hero image fill: `"https://framerusercontent.com/images/2mYRK3PxyCOvm3oAGgVTcKSvBg.webp"` (WebP)
- Story image fill: `"https://framerusercontent.com/images/wzaOFvr7x6haFaSLTi7jeiaJEKM.png"` (PNG)

Recommended Fix:
Re-export the Story image as WebP (with transparency if needed — WebP supports alpha channel). If the PNG has no transparency, re-export as flat WebP. Replace the image fill on the Story section's image Frame on all three breakpoints.

Confidence: Medium (file size impact not measured; PNG vs WebP difference is well-documented but the actual byte savings depend on the source image)
Discovered by: sub-agent 4, session DR

---

## DR-76 — /about page CTA at end is "Book Appointment" but no "Meet Us" or "Book a Tour" option

Status: Open
Category: UX & conversion
Severity: Low
Location: `/about` → end-of-page CTA banner (visible in about.jpg screenshot)

Description:
The About page ends with the standard CTA banner ("Ready to Give Your Pet the Best Care?" + "Book Appointment" button). This is the same CTA used on Home, Services, and other pages. For an About page specifically — where the user's intent is to evaluate the clinic before committing — offering a lower-friction CTA like "Meet the Team" (scrolls back to team section), "Book a Clinic Tour", or "Contact Us" would capture users who aren't yet ready to book an appointment. The hero already has "Book an Appointment" + "Meet Our Team" as the two CTAs, but the bottom-of-page CTA only offers the booking path.

Evidence:
VLM analysis confirms: "CTA at the End: The page concludes with a large, full-width banner with a blue gradient background. Headline: 'Ready to Give Your Pet the Best Care?' Subtext: 'Book your visit today and experience compassionate, expert veterinary care.' Button: 'Book Appointment'." No secondary CTA option visible.

Recommended Fix:
Add a secondary "Meet the Team" or "Contact Us" outline button next to the primary "Book Appointment" button in the end-of-page CTA banner on `/about`. The hero already uses this two-CTA pattern (Book + Meet Our Team), so replicating it at the bottom maintains consistency and captures mid-funnel users.

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-77 — Brand Guide page H1 says "Vetly Design System" but URL and nav say "Brand Guide" (terminology inconsistency)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/brand-guide` page H1 (text node `xbjV5Mh_O`) vs URL path `/brand-guide` and Footer nav label

Description:
The page H1 reads "Vetly Design System", but the page URL is `/brand-guide`, the page metadata title is "Brand Guide | Vetly Template", and the footer nav label (per the brand-guide screenshot) is "Brand Guide". Three different labels for the same page: "Design System" (H1), "Brand Guide" (URL/metadata/footer). This minor inconsistency creates ambiguity for users searching for the page by name and for SEO indexing (the H1 should match the metadata title's primary keyword).

Evidence:
Page H1 text node `xbjV5Mh_O` returns `"Vetly Design System"`. Page metadata `title` returns `"Brand Guide | Vetly Template"`. Page URL path: `/brand-guide`. VLM analysis of brand-guide.jpg confirms the H1 reads "Vetly Design System" and the footer shows "Brand Guide" in the Navigate column.

Recommended Fix:
Align all labels. Recommended: rename the H1 from "Vetly Design System" to "Vetly Brand Guide" to match the URL, metadata title, and footer label. (Or alternatively, rename the URL and footer to "design-system" — but "Brand Guide" is the more common industry term.)

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-78 — Brand Guide footer lists "404" under Legal column

Status: Open
Category: Footer & global elements
Severity: Medium
Location: Footer component (id `Xx2RpZ5pV`) — Legal column — visible on `/brand-guide` screenshot (and likely site-wide since Footer is shared)

Description:
The Footer's Legal column lists three items: "Privacy Policy", "Terms of Service", and "404". The "404" entry is wrong — 404 is an HTTP error page, not a legal document. It should not appear in the Legal column (or anywhere in the footer as a navigable link). Including "404" as a footer link is confusing to users (clicking it shows them an error page they didn't intend to visit) and signals that the footer was populated without review.

Evidence:
VLM analysis of `/brand-guide` screenshot reports: "Footer: ... Legal (Privacy Policy, Terms of Service, 404)". This is the shared Footer component (`Xx2RpZ5pV`), so the same finding applies site-wide.

Recommended Fix:
Remove the "404" link from the Footer Legal column. If a 404 link is needed anywhere (e.g., for testing), it should not be in the user-facing footer.

Confidence: High (based on VLM screenshot analysis; would benefit from a direct Footer component inspection to confirm the link target and whether it's a hardcoded nav item or a CMS-driven list)
Discovered by: sub-agent 4, session DR

---

## DR-79 — /about Team Cards grid on Tablet uses fixed `height: 900px` container that may overflow

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/about` → Tablet breakpoint > Main > Team > Team Cards grid (id `tOMclTs4Y`)

Description:
On the Tablet breakpoint (768–1279px), the Team Cards grid is configured with `gridColumnCount: 2`, `gridRowCount: 2`, and a fixed `height: "900px"`. Each Team Card instance has `height: "460px"`. With 2 rows × 460px + 1 gap × 24px = 944px of content inside a 900px container — a 44px overflow. The grid's `overflow` is not explicitly set to `clip`, so children may visually escape the 900px frame, or alternatively the rows may be squeezed to 438px each, distorting the team cards' aspect ratio. The `gridRowHeightType: "auto"` should make rows size to content, but the fixed container `height: 900px` overrides that intent. Compare to the Desktop breakpoint where `height: "auto"` (correctly lets the grid grow to fit content).

Evidence:
Serialized About page Tablet breakpoint Team Cards attributes: `{ "layout": "grid", "gridColumnCount": 2, "gridRowCount": 2, "gridRowHeightType": "auto", "gridRowHeight": "600px", "gap": "24px 24px", "height": "900px" }`. Desktop breakpoint: `{ "layout": "grid", "gridColumnCount": 4, "gridRowCount": 1, "gridRowHeightType": "auto", "gridRowHeight": "600px", "gap": "24px 24px", "height": "auto" }`. Phone breakpoint: `{ "layout": "grid", "gridColumnCount": 1, "gridRowCount": 1, "gridRowHeightType": "auto", "gridRowHeight": "600px", "gap": "24px", "height": "auto" }`.

Recommended Fix:
Change the Tablet Team Cards grid `height` from `"900px"` to `"auto"` to match Desktop and Phone, allowing the grid to size to its content. Verify visually on a 768–1279px viewport after the change.

Confidence: Medium (overflow is calculated from attribute values; would benefit from a visual screenshot at 1024px width to confirm the actual rendering)
Discovered by: sub-agent 4, session DR

---

## DR-80 — /about page contains placeholder demo contact data (phone, address, email)

Status: Open
Category: Content & copy
Severity: Medium
Location: `/about` → Desktop > Main > Location & Hours section → Contact Info (text nodes `JT3C9tiWw`, `aWqm8KoCQ`, `ZYjwUND_M`)

Description:
The Location & Hours section on `/about` displays obviously-placeholder contact data: phone `"(123) 456-7890"`, email `"hello@vetly.com"`, and address `"123 Pet Care Lane, New York, NY 12345"`. The phone number uses the canonical placeholder pattern `(123) 456-7890` (which is universally recognized as fake — area code 123 is unassigned in the NANP). The address "123 Pet Care Lane" is similarly a placeholder. If this is a real clinic site, these placeholders must be replaced with real contact data; if this is a template demo, the placeholders should be visually labeled as such (e.g., "(your phone number here)"). As-is, the placeholder data undermines the page's trust-building intent.

Evidence:
Text extraction from `/about`:
- `JT3C9tiWw` → `"(123) 456-7890"`
- `aWqm8KoCQ` → `"hello@vetly.com"`
- `ZYjwUND_M` → `"123 Pet Care Lane, New York, NY 12345"`

The phone number `(123) 456-7890` matches the well-known placeholder pattern. The address "123 Pet Care Lane" is not a real NYC street.

Recommended Fix:
Replace with real contact data, or if this is a template, replace with realistic-looking placeholder data that uses the brand's actual domain and a clearly-demo phone number (e.g., `(555) 123-4567` with a comment in the page metadata that it's a demo).

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-81 — Cross-page: Brand Guide documents 5-token Primary palette but project actually defines 26 color tokens

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/brand-guide` Primary Colors + Secondary Colors sections vs project `framer.getColorStyles()` (26 tokens)

Description:
The Brand Guide's Primary Colors section documents 5 colors (Primary, Secondary, Text, Black, White). The Secondary Colors section documents 21 more (7 slate + 8 neutral + 6 accents like Border Subtle, Accent Cyan Light, Accent Cyan, Accent Blue, Placeholder Fill, Placeholder Text). Total = 26 documented. This count actually matches `framer.getColorStyles()` (26 tokens), which is good. However, the Brand Guide doesn't visually show the actual hex/RGB value for any of the 21 secondary colors — only their names with a swatch. A designer extending the template cannot copy any of the slate, neutral, or accent color values without manually inspecting the project's color tokens in the Framer editor. (This is a refinement of DR-4-7 which focuses on the Primary colors being RGB.)

Evidence:
Brand Guide text extraction shows secondary color labels: `slate-100`, `slate-150`, `slate-300`, `slate-500`, `slate-600`, `slate-700`, `slate-800`, `neutral-50`, `neutral-100`, `neutral-300`, `neutral-400`, `neutral-500`, `neutral-600`, `neutral-700`, `neutral-900`, `Border Subtle`, `Accent Cyan Light`, `Accent Cyan`, `Accent Blue`, `Placeholder Fill`, `Placeholder Text` — but no RGB or hex values are displayed next to any of these swatches. `framer.getColorStyles()` returns 26 tokens with their RGB values.

Recommended Fix:
Add a small RGB/hex value label beneath each secondary color swatch in the Brand Guide so all 26 colors are documented with copyable values. (This pairs with DR-4-7's recommendation to switch Primary colors from RGB to hex.)

Confidence: High
Discovered by: sub-agent 4, session DR

---

## DR-82 — /about Stats section: first Stat Card uses variant "Vertical Active" while other 3 use "Vertical" (unclear intent)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/about` → Desktop > Main > Stats > Stats Cards grid → 4 Stat Card instances (`cxNb_XZ5I`, `SHLEa7Oo6`, `ZHU8fWCD5`, `jXdRF1gUu`)

Description:
In the Stats section, the first Stat Card (`cxNb_XZ5I`, "Pets Treated") uses component variant `"Vertical Active"`, while the other three use variant `"Vertical"`. This creates a visual asymmetry — one card is highlighted differently from the others. The intent is unclear: is "Pets Treated" supposed to be the hero stat? If so, the choice is arbitrary (Client Satisfaction 98% would arguably be a stronger hero stat). If the intent is just visual variety, it reads as an inconsistency. The Brand Guide doesn't document either variant or explain when to use "Active" vs default.

Evidence:
Stat Card instance attributes:
- `cxNb_XZ5I` → `$control__variant = "Vertical Active"`, title=`Pets Treated`, number=`5000`
- `SHLEa7Oo6` → `$control__variant = "Vertical"`, title=`Client Satisfaction`, number=`98`
- `ZHU8fWCD5` → `$control__variant = "Vertical"`, title=`Licensed Veterinarians`, number=`15`
- `jXdRF1gUu` → `$control__variant = "Vertical"`, title=`Emergency Support`, number=`24`

Recommended Fix:
Either (a) make all 4 Stat Cards the same variant (`"Vertical"`) for consistency, or (b) if "Active" is intentional, document the rationale in the Brand Guide's Stat Card section and choose the most strategically important stat to highlight (e.g., 98% Client Satisfaction is a stronger trust signal than 5000+ Pets Treated).

Confidence: High
Discovered by: sub-agent 4, session DR

---

## Summary

24 findings total. Severity breakdown:
- Critical: 2 (DR-4-1 duplicate team member, DR-4-3 typography mismatch)
- High: 4 (DR-4-2 wrong Primary color, DR-4-4 FAQ "No items", DR-4-5 no accreditations, DR-4-6 stat counters showing 0)
- Medium: 6 (DR-4-8 missing Voice & Tone, DR-4-9 missing Imagery, DR-4-10 "Template" framing, DR-4-16 raw RGB color tokens, DR-4-20 footer "404", DR-4-22 placeholder contact data)
- Low: 12 (DR-4-7 RGB not hex, DR-4-11 CTA on brand guide, DR-4-12 breakpoint names, DR-4-13 "Teem" typo, DR-4-14 Mission Card misuse, DR-4-15 unused trust components, DR-4-17 PNG image, DR-4-18 single CTA, DR-4-19 terminology, DR-4-21 tablet overflow, DR-4-23 secondary colors unlabeled, DR-4-24 stat variant inconsistency)

Cross-page consistency conclusion: The About page and Brand Guide are broadly aligned on visual design (same color tokens, same typography scale, same layout template). However, the Brand Guide's *documentation* of the brand has measurable gaps versus the *actual* brand in use: wrong Primary color value (DR-4-2), wrong font attribution (DR-4-3), two text styles using raw colors instead of tokens (DR-4-16), missing voice/imagery guidelines (DR-4-8, DR-4-9), and RGB-not-hex formatting (DR-4-7). The About page also has its own content-quality issues — duplicate team member (DR-4-1), empty FAQ (DR-4-4), placeholder contact data (DR-4-22), no accreditations (DR-4-5).

---

## DR-83 — Contact Card "buttons" are not clickable — no link/url prop on the Contact Card component

Status: Open
Category: UX & conversion
Severity: Critical
Location: `/contact` — Contact Cards `AUdriw9vE` (Call Us), `Vq9ZSUgsA` (Email Us), `LypOpNwbO` (Our Clinic), `FByulN0zN` (Hours); component `Iz7ICmC8H` (Cards/Contact Card)

Description:
The Contact Card component exposes only `title`, `description`, `icon`, `button` (string), `gap`, `radius`, `padding` controls — there is **no `link` or `url` prop**. The inner Button (Primary Button `ARbK0E6gq`) instance inside the component definition (`b1VhqEJ82`) has no `link` attribute set, only styling props. As a result, all four contact card "buttons" — "+123 456 789" (Call Us), "hello@vetly.com" (Email Us), "View on google map" (Our Clinic), and "8:00 AM – 6:00 PM" (Hours) — render as styled text labels but do not navigate anywhere. Visitors cannot click-to-call (`tel:`), click-to-email (`mailto:`), or click to open Google Maps. This is the highest-impact conversion defect on the contact page.

Evidence:
`readComponentControls({ componentIds: ["Iz7ICmC8H"] })` returned controls `{title, description, icon, button, gap, radius, padding}` — no link/url. Inner button `b1VhqEJ82` serialized attributes contain only `$control__variant`, `$control__title`, styling props — no `link`. Screenshot: `/contact` desktop screenshot referenced above; the four contact cards appear under the "Clinic Info" badge with button-styled labels.

Recommended Fix:
Add a `link` (or `url` + `linkType`) control to the Contact Card component and pass it through to the inner Primary Button's `link` attribute. For each instance: Call Us → `{href: "tel:+1234567890"}`, Email Us → `{href: "mailto:hello@vetly.com"}`, Our Clinic → `{href: "https://www.google.com/maps/search/?api=1&query=...", newTab: true}`. Hours card can remain non-clickable but should be restyled as plain text, not a button.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-84 — Map card uses fake placeholder address "123 Pet Care Lane, New York, NY 12345"

Status: Open
Category: Content & copy
Severity: High
Location: `/contact` — Map card component instance `WTvyTaGlZ` (`$control__location`)

Description:
The Map card component instance has `$control__location: "123 Pet Care Lane, New York, NY 12345"`. "123 Pet Care Lane" is not a real street name, "12345" is a placeholder ZIP code (it's the ZIP for Schenectady, NY, but the address itself does not exist). The Google Maps embed will render a non-existent location, and the address text shown elsewhere on the site (e.g., the documentation "Address" FAQ confirms this same address is reused) is also fake. Real customers following GPS directions will be misled.

Evidence:
Serialized attributes of `WTvyTaGlZ` on all three breakpoints: `$control__location: "123 Pet Care Lane, New York, NY 12345"`. Documentation FAQ "Address" item confirms the address is reused: "Edit the clinic address as text on the About and Contact pages, then update the location field on the Map card component in the same section so the map matches." Screenshot: `/contact` desktop screenshot — Map card visible on the right of the contact form.

Recommended Fix:
Replace `123 Pet Care Lane, New York, NY 12345` with the real clinic street address and update the same value on the Map card on the About page (and any other instances).

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-85 — Phone number is a placeholder format "+123 456 789"

Status: Open
Category: Content & copy
Severity: High
Location: `/contact` — Contact Card instance `AUdriw9vE` (Call Us) `$control__button: "+123 456 789"`

Description:
The Call Us contact card shows `+123 456 789` as the phone number. This is a non-dialable placeholder format (real US numbers have 10 digits in the format `+1 (XXX) XXX-XXXX`; this has only 9 digits after the country code and an unusual spacing). Pet owners who try to copy/paste or tap-to-call this number will fail. Even if a `tel:` link were added (see DR-5-1), the destination would be invalid.

Evidence:
Serialized attributes of `AUdriw9vE` on Desktop, Tablet, Phone breakpoints: `$control__button: "+123 456 789"`. Default value in the Contact Card component controls is also `"+123 456 789"` (i.e., the default placeholder was never replaced). Screenshot: `/contact` desktop screenshot — visible in the Clinic Info section.

Recommended Fix:
Replace with the real clinic phone number in E.164 format (e.g., `+1 (555) 123-4567`) on the Contact Card instance. Also update in the Footer and anywhere else the phone appears (per documentation FAQ "Phone Number": "Update the phone number directly wherever it appears as text — in the Navigation, Footer, and on the Contact page").

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-86 — Form fields have no visible text labels — only placeholder text

Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/contact` — form fields `dw0zWKpsI` (Name), `OLOumfHHI` (Email), `d6OiavksT` (Subject), `Aqw6p0uTm` (Pet Name), `uC7C19UpF` (Message) inside form root `j4M3q_1v6`

Description:
Each form field wrapper has `htmlTag: "label"` but contains only the `FormPlainTextInputNode` itself — no separate text label node. The only text a sighted user sees is the `formInputPlaceholder` (e.g., "Name *", "Email *", "Subject", "Pet Name", "Tell us how we can help you and your pet…. *"). Placeholders disappear as soon as the user starts typing, leaving no visible label of what the field was asking for — a known UX anti-pattern for forms of more than 2 fields. From an accessibility standpoint, although the `<label>` element wraps the input, it contains no text node, so the implicit label-input association is weak; assistive technology will fall back to the `placeholder` attribute, which is not a substitute for a programmatic label.

Evidence:
Each field wrapper (e.g., `dw0zWKpsI`) serialized with `htmlTag: "label"` and exactly 1 child — the FormPlainTextInputNode (no preceding Text/RichText sibling). Each input's `formInputPlaceholder` is the only label-like text. Desktop screenshot of `/contact` shows fields with only placeholder text.

Recommended Fix:
Add a visible text label (RichTextNode with the field name, e.g., "Name", "Email", "Subject", "Pet Name", "Message") above each input inside the field wrapper, and add an explicit `aria-label` or programmatic `<label for=...>` association. Keep the placeholder as a hint/example, not the only label.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-87 — Submit button's success and error variants are identical — users cannot tell if submission succeeded or failed

Status: Open
Category: UX & conversion
Severity: High
Location: `/contact` — form submit button `xItC9iJpc` (Primary Button instance)

Description:
The submit button is wired as a Framer form button (`formButtonSuccessVariant: "t9QapcGr2"`, `formButtonPendingVariant: "QP_bKwhNI"`, `formButtonErrorVariant: "t9QapcGr2"`). The success and error variants point to the **same** variant id (`t9QapcGr2`). When a visitor submits the form, the button will look identical whether the submission succeeded or failed. Combined with the lack of any visible success/confirmation message elsewhere in the form (see DR-5-6), this means a visitor whose submission errored will see no feedback and likely believe it succeeded, or vice versa.

Evidence:
`getNode({ id: "xItC9iJpc" })` returned attrs including `formButtonSuccessVariant: "t9QapcGr2"`, `formButtonErrorVariant: "t9QapcGr2"` (identical). `formButtonPendingVariant: "QP_bKwhNI"` is the only distinct variant.

Recommended Fix:
Either point `formButtonErrorVariant` to a distinct variant (e.g., red background, "Try again" label) and `formButtonSuccessVariant` to a distinct green/"Sent!" variant, OR add a separate confirmation/error message node above/below the button that toggles visibility based on the form's success/error state.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-88 — No visible success/confirmation message after form submit

Status: Open
Category: UX & conversion
Severity: High
Location: `/contact` — form root `j4M3q_1v6` (children: 2 field rows + Message textarea + Submit button)

Description:
The form container `j4M3q_1v6` has exactly 4 children: row 1 (Name + Email), row 2 (Subject + Pet Name), Message textarea, and the Submit button. There is no RichTextNode, banner, or any element intended to display a "Thank you, your message has been sent" confirmation. Visitors who submit the form have no on-page confirmation that the message was received — the only feedback is the button itself, and as documented in DR-5-5 the button's success and error variants are identical. For a contact form on a veterinary site where visitors may be submitting urgent pet health questions, the absence of confirmation is a significant trust/UX gap.

Evidence:
Serialized children of `j4M3q_1v6`: `[wfpPhFlqG (Container), QW0frWB7t (Container), uC7C19UpF (Message Textarea), xItC9iJpc (Submit Button)]` — no success message node. Also no `appearEffect` or visibility condition tied to form success anywhere in the form tree.

Recommended Fix:
Add a confirmation RichTextNode (e.g., "Thanks for reaching out — we'll get back to you within one business day.") inside the form, initially hidden, with visibility tied to the form's success state (Framer forms support `formSubmitted` style conditions). Optionally add an error message node tied to the error state.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-89 — Contact form missing phone and preferred-contact-time fields

Status: Open
Category: UX & conversion
Severity: Medium
Location: `/contact` — form root `j4M3q_1v6` (current fields: Name, Email, Subject, Pet Name, Message)

Description:
The form collects Name, Email, Subject, Pet Name, and Message — but no phone number and no preferred-contact-time field. The page's own subheading reads "Whether you have a question, need to book an appointment, or are facing an emergency, our team is ready to help. Reach out anytime." For emergency or appointment-related inquiries, the clinic will frequently need to call the pet owner back; without a phone field, they must exchange multiple emails to schedule a call. The Subject field is generic and could be replaced with a more useful Service/Reason dropdown (wellness, vaccination, surgery, dental, emergency, other).

Evidence:
Form root `j4M3q_1v6` children enumerated in DR-5-6. Subheading text confirmed: "Whether you have a question, need to book an appointment, or are facing an emergency, our team is ready to help. Reach out anytime." Available `FormPlainTextInputNode`s: `dUSaG0CMx` (Name, text), `XfuoGpmoo` (Email, email), `JlTOdKvZx` (Subject, text), `GBe2pGN2l` (Pet Name, text), `EotCJ5jxi` (Message, textarea).

Recommended Fix:
Add a phone field (`formTextInputType: "tel"`, optional or required based on clinic preference) and a preferred-contact-time field (text or dropdown). Consider converting Subject into a Reason-for-Contact dropdown to route inquiries faster.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-90 — "Subject" field is required but its placeholder lacks the required asterisk indicator

Status: Open
Category: UX & conversion
Severity: Low
Location: `/contact` — Subject input `JlTOdKvZx` (`formInputName: "Subject"`, `formInputRequired: "true"`, `formInputPlaceholder: "Subject"`)

Description:
The Subject field has `formInputRequired: "true"` but its placeholder text is just `"Subject"` (no `*`), whereas every other required field uses the asterisk convention in its placeholder: Name → `"Name *"`, Email → `"Email *"`, Message → `"Tell us how we can help you and your pet…. *"`. Pet Name is correctly unmarked because it is the only non-required field. The inconsistency means visitors who scan the form for asterisks will assume Subject is optional and may skip it, then hit a validation error on submit.

Evidence:
Per-field serialized attributes:
  - Name: `formInputRequired: "true"`, `formInputPlaceholder: "Name *"`
  - Email: `formInputRequired: "true"`, `formInputPlaceholder: "Email *"`
  - Subject: `formInputRequired: "true"`, `formInputPlaceholder: "Subject"` ← missing `*`
  - Pet Name: `formInputRequired: "false"`, `formInputPlaceholder: "Pet Name"`
  - Message: `formInputRequired: "true"`, `formInputPlaceholder: "Tell us how we can help you and your pet…. *"`

Recommended Fix:
Either change the Subject placeholder to `"Subject *"` to match the convention, or — preferably — implement proper visible labels with `*` indicators on required fields (see DR-5-4) so the convention doesn't depend on placeholder text.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-91 — Message field placeholder has non-standard punctuation "…."

Status: Open
Category: Content & copy
Severity: Low
Location: `/contact` — Message input `EotCJ5jxi` (`formInputPlaceholder: "Tell us how we can help you and your pet…. *"`)

Description:
The Message textarea placeholder reads `"Tell us how we can help you and your pet…. *"` — an ellipsis character (`…`) immediately followed by a period (`.`) and then the required asterisk. The combination `….` is non-standard (an ellipsis already implies trailing-off punctuation; adding a period is redundant and looks like a typo). The trailing `" *"` also spaces the asterisk oddly.

Evidence:
Serialized attribute on `EotCJ5jxi`: `formInputPlaceholder: "Tell us how we can help you and your pet…. *"`.

Recommended Fix:
Replace with a cleaner convention such as `"Tell us how we can help you and your pet… *"` (ellipsis only) or `"How can we help you and your pet? *"`.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-92 — Pet Name input node mislabeled "Subject Input" (copy-paste leftover)

Status: Open
Category: Components
Severity: Low
Location: `/contact` — Pet Name Field wrapper `Aqw6p0uTm` → inner FormPlainTextInputNode `GBe2pGN2l` (named "Subject Input")

Description:
The Pet Name Field wrapper is correctly named "Pet Name Field", but the inner FormPlainTextInputNode is named "Subject Input" — a copy-paste leftover from the adjacent Subject field. The user-facing `formInputName` and `formInputPlaceholder` are correctly "Pet Name", so the displayed behavior is correct, but the node name is misleading for future editors and could cause confusion when applying targeted overrides or debugging form submissions.

Evidence:
`getNode({ id: "GBe2pGN2l" })` returned `type=FormPlainTextInputNode name="Subject Input"`. The node's `formInputName` is "Pet Name" and `formInputPlaceholder` is "Pet Name" — confirming the visual is right but the internal name is wrong.

Recommended Fix:
Rename node `GBe2pGN2l` from "Subject Input" to "Pet Name Input".

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-93 — Business hours shown as a single range with no per-day breakdown

Status: Open
Category: Content & copy
Severity: Medium
Location: `/contact` — Contact Card `FByulN0zN` (Hours): `$control__description: "Mon–Sat, closed Sunday"`, `$control__button: "8:00 AM – 6:00 PM"`

Description:
The Hours contact card shows a single range "8:00 AM – 6:00 PM" with a subtitle "Mon–Sat, closed Sunday". Real veterinary clinics typically have varied hours (e.g., shorter Saturday hours, late-closing one weekday, emergency on-call hours). The Documentation page's "Working Hours" FAQ explicitly promises per-day hours: "Hours of operation are listed on the About and Contact pages inside the 'Hours of Operation' block. Edit each day's text directly on the canvas." — but no per-day block is present on the contact page. Pet owners who need to know if the clinic is open at 7pm on a Saturday cannot tell from this single-range display.

Evidence:
Contact Card `FByulN0zN` attrs on all three breakpoints: `$control__description: "Mon–Sat, closed Sunday"`, `$control__button: "8:00 AM – 6:00 PM"`. Documentation FAQ "Working Hours" text confirms the intended pattern of per-day editing.

Recommended Fix:
Replace the single-range Hours card with a per-day hours table or list (Mon, Tue, Wed, Thu, Fri, Sat, Sun) showing open/close times for each day, including any lunch closures or emergency-only hours. Optionally distinguish walk-in vs appointment-only hours.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-94 — Booking page provides no emergency booking path

Status: Open
Category: UX & conversion
Severity: Critical
Location: `/booking` — page node `kdx64iDUQ` (full page tree has no emergency-related copy)

Description:
The `/contact` subheading explicitly tells visitors "Whether you have a question, need to book an appointment, or are facing an emergency, our team is ready to help." This directs emergency traffic to the booking flow, but the `/booking` page itself contains only a Cal.com embed for "In-Clinic Veterinary Appointment" — there is NO emergency booking path, no "If this is an emergency, call X" banner, no separate emergency phone number, and no triage step to redirect urgent cases. Pet owners facing a true emergency (e.g., a hit-by-car, toxin ingestion, breathing difficulty) will land on a calendar booking widget and have to wait potentially days for an available slot. For a veterinary service this is a critical safety/UX gap.

Evidence:
Full `/booking` tree at depth 5 contains: title "Book an Appointment" (RichTextNode `ZebPjet9v`), BackButton (`qO44GR49V`), and Cal.com HTML embed (`O2N4dsp87`). Zero emergency-related text nodes. The Cal.com event URL `https://cal.com/vetly/in-clinic-vet-appointment` resolves to a single generic event type titled "In-Clinic Veterinary Appointment" — no emergency-specific event type. `/contact` subheading text confirmed above.

Recommended Fix:
Add a prominent emergency banner at the top of `/booking` (and `/contact`): "If your pet is experiencing a medical emergency, call us immediately at <real phone> or go to your nearest emergency veterinary hospital. Do not use this form." Optionally add a Cal.com event type for urgent same-day triage and link to it from a separate button above the standard booking widget.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-95 — Booking page has no shared Header/Footer — no nav escape hatch; back button fails for direct-link visitors

Status: Open
Category: UX & conversion
Severity: High
Location: `/booking` — page node `kdx64iDUQ`, `layoutTemplate: "null"` (does not use the default Layout Template `yDIYoKc7h`)

**Additional locations (merged findings):**
- `/booking` (node `kdx64iDUQ`); attributes `layoutTemplate: "null"`. Default layout template `yDIYoKc7h` is the standard for all other 12 pages.

Description:
The `/booking` page is configured with `layoutTemplate: "null"` — it does not use the default Layout Template, so the shared Header (Nav Bar) and Footer are not rendered. The only on-page navigation is the BackButton component (`qO44GR49V`) in the top-left of the Booking Modal. The BackButton's `handleClick` calls `window.history.back()` when no explicit `onClick` is set (per the source of `BackButton.tsx`). This works for visitors who arrived via in-site navigation, but does **nothing** for visitors who arrived via direct link, Google search, or shared URL — `window.history.back()` to an empty history is a no-op. Such visitors are stranded with no way to reach `/contact`, `/services`, or `/` other than editing the URL bar.

**Additional context (merged from DR-15-1):** The booking page is the only route in the 13-page site map that explicitly sets `layoutTemplate: "null"`. As a result it does NOT inherit any of the shared chrome defined by the default layout template `yDIYoKc7h`: there is no Header instance (logo, nav links, phone button, "Book Today" CTA), no Footer instance (logo, navigation/socials/legal columns, copyright), no CTA instance ("Ready to Give Your Pet the Best Care?"), no Smooth Scroll component, and no ScrollbarComponent. The page contains only its own `Desktop/Tablet/Phone` breakpoints, each holding a single `Main` frame with a Cal.com booking modal (`O2N4dsp87`, Cal namespace `in-clinic-vet-appointment`).

A visitor landing on `/booking` from an external link, an email, or a search engine has no in-page way to navigate back to Home, Services, About, Blog, Contact, or any legal page — they must use the browser back button or hand-edit the URL. The phone number, address, business hours, and emergency contact info shown elsewhere via the layout template are also unavailable here. This is a real friction/wayfinding issue for a high-intent conversion page.

Evidence:
Page attrs from `getNode({ id: "kdx64iDUQ" })`: `layoutTemplate: "null"` (vs `/contact` and `/documentation` which both have `layoutTemplate: "default"` with `$layoutTemplateId: "yDIYoKc7h"`). `BackButton.tsx` source: `handleClick = (e) => { if (onClick) onClick(); else if (typeof window !== "undefined" && window.history) { startTransition(() => { window.history.back() }) } }`. The Desktop BackButton instance has no `onClick` override.

**Additional evidence (from DR-15-1):** `framer.agent.getNode({ id: "kdx64iDUQ" }, { pagePath: "/booking" })` returns `attributes.layoutTemplate: "null"`. Depth-4 serialize of `kdx64iDUQ` shows top-level children = `[Desktop "q91z9DBml", Tablet "CqSG6wWy3", Phone "KYaJPUHtf"]` with each breakpoint containing only a `Main > Booking Modal > Cal Booking` tree — zero `ComponentInstanceNode` of `AZd_vmoUt` (Header), `Xx2RpZ5pV` (Footer), or `GkwGTE6uU` (CTA). Screenshot: `https://framerusercontent.com/screenshots/on-demand/3586feb2-98a7-402f-8394-512c7f6d616e.jpg`.

Recommended Fix:
Either (a) re-enable the default Layout Template on `/booking` so the shared Header/Footer render, OR (b) replace the BackButton with an explicit link to `/` (home) or to `/contact` (so direct-link visitors have a guaranteed escape hatch), OR (c) add a small "Back to site" link in the modal header that uses a real `href` rather than `history.back()`.

**Additional fix note (from DR-15-1):** On the `/booking` page, set `layoutTemplate` to `"default"` (or to the explicit template id `yDIYoKc7h`) so the page inherits the standard Header, CTA, Footer, and chrome. If the intent is a focused booking experience with a minimal nav, create a second lightweight layout template (Header-only or simplified Header) and apply that to `/booking` instead — but bare `null` strips the visitor of all wayfinding. Verify visually that the booking modal still renders correctly with the layout template applied (it currently sits inside a 100vh `Main` frame, so the modal may need to move out of that fixed-height container or the layout template's `Wrapper` may need to be skipped).

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-96 — BackButton renders an X (close) icon but is labeled "Go back" — semantic/visual mismatch

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `/booking` — BackButton instances `qO44GR49V` (Desktop), `CqSG6Wy3qO44GR49V` (Tablet), `KYaJPUHtfqO44GR49V` (Phone); code component `BackButton.tsx` (`codeFile/tVVtI8x:default`)

Description:
The `BackButton.tsx` source comment describes it as "A simple back button with an X icon that navigates to the previous page." The SVG renders two diagonal crossing lines — visually an "X" (universally the "close" / "dismiss" affordance). The button's `aria-label="Go back"`. This creates a mismatch: sighted users will perceive the button as "close this view" (which, on a focused booking modal, may be interpreted as "dismiss the modal" rather than "navigate away from the page"); screen-reader users hear "Go back" with no indication of where back is. Combined with DR-5-13 (the back behavior is unreliable for direct-link visitors), the icon-label mismatch compounds the wayfinding problem.

Evidence:
`BackButton.tsx` SVG paths: `<line x1="18" y1="6" x2="6" y2="18" />` and `<line x1="6" y1="6" x2="18" y2="18" />` — these draw an X. Source comment: "A simple back button with an X icon". `aria-label="Go back"`.

Recommended Fix:
Either (a) change the SVG icon to a left-pointing arrow/chevron (matching the "Go back" label), or (b) if the X icon is intentional for "close the booking modal", change `aria-label` to "Close" and ensure the click behavior matches (and add an explicit `/contact` or `/` link elsewhere on the page per DR-5-13). Option (a) is recommended given the current behavior is page-level navigation.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-97 — BackButton shape inconsistent across breakpoints (rectangular on desktop, circular on mobile)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/booking` — BackButton instances on Desktop (`$control__borderRadius: 8`), Tablet (`$control__borderRadius: 50`), Phone (`$control__borderRadius: 50`)

Description:
The BackButton on the Desktop breakpoint uses `borderRadius: 8` (rectangular with 8px rounded corners, `buttonSize: 36`, `iconSize: 20`). On Tablet and Phone breakpoints it uses `borderRadius: 50` (full circle, `buttonSize: 36` Tablet / `24` Phone, `iconSize: 20` Tablet / `24` Phone). Same component, different shapes across breakpoints — a small but real visual inconsistency that affects brand polish.

Evidence:
Per-breakpoint BackButton attrs from `/booking` depth-5 serialize:
  - Desktop `qO44GR49V`: `$control__borderRadius: "8"`, `$control__buttonSize: "36"`, `$control__iconSize: "20"`
  - Tablet `CqSG6Wy3qO44GR49V`: `$control__borderRadius: "50"`, `$control__buttonSize: "36"`, `$control__iconSize: "20"`
  - Phone `KYaJPUHtfqO44GR49V`: `$control__borderRadius: "50"`, `$control__buttonSize: "24"`, `$control__iconSize: "24"`

Recommended Fix:
Pick one shape and apply consistently across breakpoints. If circular is preferred for touch targets (better tap target on mobile), apply `borderRadius: 50` on Desktop too — or vice versa.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-98 — Booking page has no service selection, no pet name/breed, no cancel/reschedule policy copy

Status: Open
Category: UX & conversion
Severity: High
Location: `/booking` — page node `kdx64iDUQ` (full tree)

Description:
The `/booking` page consists of a "Book an Appointment" title, a back button, and a single Cal.com embed. There is no native service selection (wellness, vaccination, dental, surgery, etc.), no pet name/pet type/breed capture on the Framer side, no cancel/reschedule policy text, no "what to bring to your appointment" guidance, and no preparation instructions. The booking metadata description promises "Schedule a wellness visit, vaccination, or checkup" — but the actual Cal.com event type is a single generic "In-Clinic Veterinary Appointment" with no service differentiation. All form fields are deferred entirely to the third-party Cal.com widget, so the Framer-side booking UX is essentially a blank modal with an iframe.

Evidence:
`/booking` depth-5 serialize shows only 3 elements in the Booking Modal: Header (Title `ZebPjet9v` text "Book an Appointment" + BackButton `qO44GR49V`) and Cal.com Embed (`O2N4dsp87`, `$control__hTML` containing `calLink: "vetly/in-clinic-vet-appointment"`). HTTP fetch of `https://cal.com/vetly/in-clinic-vet-appointment` returned HTTP 200 with `<title>In-Clinic Veterinary Appointment | vetly | Cal.com</title>` — confirming a single generic event type. No policy/cancel/reschedule/preparation text nodes anywhere in the tree.

Recommended Fix:
Add a small intro section above the Cal embed explaining (1) what to expect, (2) cancellation/reschedule policy (e.g., "Please give us 24 hours' notice to reschedule"), (3) what to bring (e.g., "Bring your pet's vaccination records and any current medications"), (4) emergency disclaimer (cross-reference DR-5-12). Consider adding service-type options via separate Cal.com event types or a service-selection step that deep-links into the right Cal.com event.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-99 — Desktop Cal.com embed uses fixed 850×541 pixel dimensions

Status: Open
Category: UX & conversion
Severity: Medium
Location: `/booking` — Cal.com Embed ComponentInstanceNode `O2N4dsp87` (Desktop), `width: "850px", height: "541px"`

Description:
On the Desktop breakpoint, the Cal.com embed is locked to `width: 850px, height: 541px` (fixed pixels). The Booking Modal wraps this with `width: auto, height: auto` and centers it. On a typical 1280px-wide desktop breakpoint, this leaves ~215px of empty space on each side of the embed, and on wider displays (1440px, 1920px) the embed appears increasingly small and lost in whitespace. The Tablet and Phone variants correctly use `width: "1fr", height: "1fr"`, so the issue is desktop-specific.

Evidence:
Desktop embed attrs: `width: "850px", height: "541px"`. Tablet embed `CqSG6Wy3O2N4dsp87` attrs: `width: "1fr", height: "1fr"`. Phone embed `KYaJPUHtfO2N4dsp87` attrs: `width: "1fr", height: "1fr"`. Cal.com `inline` config supports `layout: "month_view"` which would scale responsively if the container were flexible.

Recommended Fix:
Change the Desktop embed width to `1fr` (or `100%`) with a sensible `maxWidth` (e.g., `900px` or `1100px`) and let the height auto-size or use `1fr` inside a bounded parent. The Cal.com inline embed will scale to fill the container.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-100 — Booking page screenshots are suspiciously small (13 KB desktop, 4.5 KB mobile) — Cal.com embed likely does not render for crawlers/preview-bots/no-JS users

Status: Open
Category: Performance & technical
Severity: Medium
Location: `/booking` — page node `kdx64iDUQ`, Cal embed `O2N4dsp87` (`$control__hTML` containing a `<script>` tag)

Description:
The /booking screenshot returned by Framer is 13 KB (desktop) and 4.5 KB (mobile) — compared to 211 KB and 119 KB for /contact at the same breakpoint. This strongly suggests the Cal.com embed does not render during Framer's screenshot pass (the embed HTML contains a `<script>` tag that injects `https://app.cal.com/embed/embed.js` and then mounts the booking UI into `<div id="my-cal-inline-in-clinic-vet-appointment">`). Crawlers, link-preview bots (Slack, iMessage, social cards), and visitors with JavaScript disabled will see only the modal chrome (title + back button + empty white box) — no booking UI. The page has no `<noscript>` fallback or static placeholder.

Evidence:
Screenshot byte sizes (downloaded locally): `booking.jpg` 13,932 bytes; `booking-mobile.jpg` 4,464 bytes; `contact.jpg` 211,122 bytes; `contact-mobile.jpg` 119,340 bytes; `documentation.jpg` 361,834 bytes; `documentation-mobile.jpg` 280,690 bytes. Cal embed HTML confirmed via `getNode({ id: "O2N4dsp87" })` — contains `<script type="text/javascript">` and a `<div id="my-cal-inline-...">` placeholder.

Recommended Fix:
Add a `<noscript>` fallback inside the embed HTML ("JavaScript is required to book an appointment online. Please call us at <phone> or email <email>."), and/or add a visible static "Book an appointment" link/CTA below the embed pointing to `https://cal.com/vetly/in-clinic-vet-appointment` as a fallback for users whose browser blocks the embed script.

Confidence: Medium
Discovered by: sub-agent 5, session DR

---

## DR-101 — `/documentation` page is template-admin documentation, publicly accessible at /documentation

Status: Open
Category: Content & copy
Severity: High
Location: `/documentation` — page node `B49BfU8Yb` (badge "Template Documentation", title "How to Customize Your Vetly Template")

Description:
The page's badge reads "Template Documentation", its H1 is "How to Customize Your Vetly Template", and its subheading describes "This guide walks through every editable part of the Vetly template — from quick text and color changes to CMS-managed content like services, blog posts, and testimonials." All sections (Editing Text, Replacing Images, Replacing the Logo, Changing Colors, Updating Typography, Editing Navigation, Icons, Phone Number, Email Address, Address, Working Hours, Social Links, FAQs, Testimonials, Services, Blog Posts, Categories, General CMS Content, Booking Setup, SEO Settings, Page Settings, Variables, Components, Forms) are template-customization instructions aimed at the template buyer, not customer-facing content. Although the page has `noIndex: true` (so it won't be indexed by search engines), it is still publicly reachable at `https://vetly.com/documentation` (or whatever the production domain is). Real pet owners who land here — via a shared link, a typo, or curiosity — will be confused and may lose trust in the clinic ("is this a real vet or a template demo?").

Evidence:
Page metadata from `getNode({ id: "B49BfU8Yb" })`: `metadata.title: "Template Documentation | Vetly"`, `metadata.description: "A complete guide to customizing the Vetly template: text, images, colors, CMS content, SEO, and more."`, `noIndex: true`. Badge text confirmed: "Template Documentation". H1 confirmed: "How to Customize Your Vetly Template". Subheading confirmed via deep serialize.

Recommended Fix:
Either (a) unpublish the `/documentation` route entirely on the production site (move it to an internal-only path or remove it before going live), or (b) gate it behind authentication / remove it from the production deploy, or (c) if it must remain public, replace its content with customer-facing documentation (e.g., "What to expect at your first visit", "Preparing your pet for surgery", "Vaccination schedule") and update the metadata title/description accordingly.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-102 — Documentation page has three "Image Placeholder" cards with invisible icons and only description text

Status: Open
Category: Visual design & branding
Severity: High
Location: `/documentation` — three placeholder frames `D_NtKRLGQ` (under Content & Design), `jk4VOTMg2` (under CMS Content), `qbk179VtF` (under Site Setup)

Description:
Each of the four documentation sections ends with a dashed-border "Image Placeholder" card. Three of these (`D_NtKRLGQ`, `jk4VOTMg2`, `qbk179VtF`) contain an IconNode with `$control__alpha: "0"` (fully transparent — invisible), plus a "Image Placeholder" title and a description like "Description: Screenshot of the canvas with a text block selected, showing the style panel and the Text Style dropdown used to edit fonts and sizes site-wide." The icons are invisible and the descriptions are written as alt-text captions, not as actual screenshots. To a viewer the cards look incomplete/broken — dashed border, faint heading "Image Placeholder", caption-style text, and nothing visually informative.

Evidence:
Per-section deep serialize of `D_NtKRLGQ` children: `f5oNV0bgG` [IconNode] `$control__alpha: "0"` (fully transparent), `ErJCw_NYT` [RichTextNode] text "Image Placeholder", `kVGJExbcX` [RichTextNode] text "Description: Screenshot of the canvas with a text block selected...". Same pattern for `jk4VOTMg2` (caption "Screenshot of the Framer CMS panel showing the Blog Collection open...") and `qbk179VtF` (caption "Screenshot of a page's Settings panel with the SEO tab open...").

Recommended Fix:
Either replace each placeholder with an actual screenshot of the described UI (and remove the "Image Placeholder" title), or remove the three placeholder cards entirely. The dashed-border styling with invisible icons reads as "TODO" rather than documentation.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-103 — Documentation "Still Have Questions?" CTA points visitors to Framer's help center, not Vetly's contact

Status: Open
Category: Content & copy
Severity: Medium
Location: `/documentation` — CTA box `eYuo5bt_J`, title `V66Jzj5WK` ("Still Have Questions?"), body `ACA6qpdv9`

Description:
The bottom CTA on the documentation page reads: "Still Have Questions? This documentation covers the most common customizations. For anything else, refer to Framer's own help center for platform-level features like CMS, forms, and publishing." This CTA is appropriate for a template buyer using Framer, but inappropriate for a live Vetly site — a real pet-owner visitor reading this page (which is publicly accessible per DR-5-19) and clicking through to "Framer's help center" will land on generic platform documentation that has nothing to do with their pet. Even for the template-buyer audience, the CTA misses an opportunity to direct them to Vetly's own support channel.

Evidence:
Deep serialize of `eYuo5bt_J` children: `V66Jzj5WK` text "Still Have Questions?", `ACA6qpdv9` text "This documentation covers the most common customizations. For anything else, refer to Framer's own help center for platform-level features like CMS, forms, and publishing." No link to `/contact` is present in the CTA box.

Recommended Fix:
If the page is unpublished (per DR-5-19 fix), this is moot. If it remains, replace the CTA to point to Vetly's `/contact` page: "Still have questions? Reach our team at /contact or call <phone>." For template-buyer audience, also link to Framer's help center as a secondary option.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-104 — Code Block component is installed but unused on the /documentation page

Status: Open
Category: Components
Severity: Low
Location: `/documentation` — entire page tree; Code Block external component `pVk4QsoHxASnVtUBp6jr` (from inventory)

Description:
The project's available-components inventory includes a "Code Block" component (id `pVk4QsoHxASnVtUBp6jr`, keywords "code block"). The /documentation page is the natural home for code snippets — particularly the "Forms" FAQ item ("The Contact form is a native form connected to a submit button. Update field labels or add new fields directly on the canvas; connect submissions to an email or integration in Site Settings."), the "Booking Setup" item, the "Variables" item, and the "Components" item, all of which would benefit from illustrative code/embed snippets. However, no Code Block instance exists anywhere in the /documentation tree — every section uses only FAQ accordion items and RichTextNode paragraphs.

Evidence:
`/documentation` depth-5 serialize of all four sections (Content & Design `dYz1sqkkK`, Business Info `qzDY6aJF9`, CMS Content `AMLviW7Ie`, Site Setup `G1QoiQORy`) — children are exclusively RichTextNode, ComponentInstanceNode (FAQ items with `$control__variant: "FAQ Closed"`), and the placeholder FrameNodes. No ComponentInstanceNode references the Code Block component. Inventory confirms Code Block is available but not used.

Recommended Fix:
Where relevant (e.g., Forms, Booking Setup, Variables), supplement the FAQ answers with short Code Block snippets showing example DSL or embed code. If code examples are not needed for this audience, this finding can be deferred.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-105 — `/booking` page metadata description mentions only 3 service types, mismatching the broader services offering

Status: Open
Category: SEO & metadata
Severity: Low
Location: `/booking` — page node `kdx64iDUQ`, `metadata.description`

Description:
The `/booking` page metadata description reads: "Schedule a wellness visit, vaccination, or checkup for your pet online in just a few clicks with Vetly's easy appointment booking." This mentions only 3 service types (wellness, vaccination, checkup). The Services page presumably offers more (e.g., surgery, dental, diagnostics, emergency). The description undersells the booking capability and may mislead search-engine users into thinking only those 3 services can be booked. The actual Cal.com event type is a single generic "In-Clinic Veterinary Appointment" (see DR-5-16), so neither the metadata nor the actual booking flow reflects a full service catalog.

Evidence:
`getNode({ id: "kdx64iDUQ" })` returned `metadata.description: "Schedule a wellness visit, vaccination, or checkup for your pet online in just a few clicks with Vetly's easy appointment booking."`. Cal.com event type at `https://cal.com/vetly/in-clinic-vet-appointment` titled "In-Clinic Veterinary Appointment" (single generic event).

Recommended Fix:
Update the metadata description to reflect the full range of bookable services, or — better — fix DR-5-16 to actually offer service-specific booking and align the description with the real options.

Confidence: High
Discovered by: sub-agent 5, session DR

---

## DR-106 — Contact section uses 160px vertical gap between contact form, clinic info, and FAQ — visually sparse

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/contact` — Main frame `pzJ96MWbD` (`gap: "160px"`)

Description:
The contact page's Main frame uses `gap: 160px` between its three top-level children: the Contact section (form + map), the Clinic Info section (4 contact cards), and the FAQ section. 160px is unusually large for inter-section spacing on a typical marketing site (most templates use 80–120px). Combined with the contact section's own internal `gap: 56px` (between heading and form) and the Clinic Info section's vertical rhythm, the page may feel overly stretched, especially on shorter laptop viewports.

Evidence:
`getNode({ id: "pzJ96MWbD" })` returned `layout: "stack"`, `stackDirection: "vertical"`, `gap: "160px"`, three children: `FkbBrwZKp` (Contact), `a53UIhGxa` (Clinic Info), `x51Gl85oP` (FAQ wrapper).

Recommended Fix:
Reduce the Main frame `gap` to ~96–120px to match typical section rhythm, OR confirm with the design intent if 160px is deliberate (in which case document the choice).

Confidence: Medium
Discovered by: sub-agent 5, session DR

---

## DR-107 — Contact Map card border set to 0px (effectively no border) but Border attribute still present — vestigial style

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/contact` — Map card instance `WTvyTaGlZ` (`$control__border: "0px solid var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"`)

Description:
The Map card component instance has `$control__border: "0px solid var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"` — a 0px-width border that effectively renders as no border. The shadow attribute is also unusual: `["0px 0px 0px 4px var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)", "0px 4px 12px 0px rgba(0, 0, 0, 0.04)"]` — a 4px outer "shadow" using the white token, which creates a halo-like offset rather than a typical card shadow. The combination is non-standard: a 0px border plus a 4px white halo shadow. Visually this may render as a thin white ring around the map (which is on a white background, so likely invisible). It's a minor cleanup opportunity.

Evidence:
`getNode({ id: "WTvyTaGlZ" })` attrs include `$control__border: "0px solid var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)"`, `$control__shadow: ["0px 0px 0px 4px var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)", "0px 4px 12px 0px rgba(0, 0, 0, 0.04)"]`.

Recommended Fix:
Remove the 0px border attribute (it does nothing) and either remove the 4px white halo shadow or replace with a meaningful card shadow if separation from the background is intended.

Confidence: Medium
Discovered by: sub-agent 5, session DR

---

## DR-108 — Privacy Policy has no "User Rights" section (GDPR/CCPA gap)

Status: Open
Category: Content & copy
Severity: High
Location: `/privacy-policy` (`coY2rsl2X`) — Sub Container `C85geaMZx` (the sections stack)

Description:
The Privacy Policy has 8 sections — Information We Collect, How We Use Your Information, Data Security, Sharing of Information, Cookies and Tracking Technologies, Third-Party Links, Changes to this Privacy Policy, Contact Us — but contains **no section on user rights**. There is no mention of the right to access, correct, delete, or download personal data; no right to opt out of sale or sharing; no right to restrict or object to processing; no GDPR-specific notice; no CCPA-specific notice. For a veterinary service that collects pet-owner PII (name, email, phone, pet information, IP address, device info) and may serve users in the EU, UK, California, Virginia, and other jurisdictions with privacy laws, this is a real compliance gap that exposes Vetly to regulatory risk and undermines user trust.

Evidence:
All TextRun nodes on `/privacy-policy` extracted via `getDescendantsOfTypes`. Confirmed section headings (Desktop breakpoint TextBlock tags): "Information We Collect", "How We Use Your Information", "Data Security", "Sharing of Information", "Cookies and Tracking Technologies", "Third-Party Links", "Changes to this Privacy Policy", "Contact Us". No TextRun text contains "rights", "GDPR", "CCPA", "access your data", "correct", "delete your", "opt-out", "opt out", "your choices", "data portability", or "restriction".

Recommended Fix:
Add a "Your Privacy Rights" section (between "Sharing of Information" and "Cookies and Tracking Technologies") explaining: (a) the rights users have under applicable laws (access, correction, deletion, data portability, restriction, objection, opt-out of sale/sharing); (b) how to exercise those rights (email hello@vetly.com); (c) a CCPA-specific notice stating "We do not sell your personal information"; (d) a sentence on response timelines (e.g., 30 days).

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-109 — Privacy Policy has no Data Retention section

Status: Open
Category: Content & copy
Severity: Medium
Location: `/privacy-policy` (`coY2rsl2X`)

Description:
The Privacy Policy does not state how long personal data is retained. There is no "Data Retention" section. Data retention is a standard clause in modern privacy policies and is required under GDPR Article 5(1)(e) ("kept for no longer than is necessary"). Users have no way to know whether their data is kept indefinitely or deleted after a defined period. For a veterinary service, retention also intersects with medical-records retention laws which vary by jurisdiction.

Evidence:
All TextRun nodes on `/privacy-policy` extracted. No TextRun contains "retention", "retain", "how long", "delete your data", or "destroy". The only occurrence of "delete" is implicit in the cookie section ("You may choose to disable cookies through your browser settings").

Recommended Fix:
Add a "Data Retention" section stating retention periods for each category of personal data: e.g., appointment/pet health records retained for X years per applicable veterinary regulations; marketing communications data deleted after X months of inactivity; technical/log data retained for X days. Also state the criteria used to determine retention periods.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-110 — Privacy Policy has no Children's Privacy (COPPA) section

Status: Open
Category: Content & copy
Severity: Low
Location: `/privacy-policy` (`coY2rsl2X`)

Description:
The Privacy Policy does not address children's privacy or COPPA. While a veterinary service may not intentionally collect data from children under 13, the policy should explicitly state that the service is not directed at children and how the company would handle accidental collection of children's data — this is a standard clause in privacy policies and signals regulatory diligence.

Evidence:
All TextRun nodes on `/privacy-policy` extracted. No occurrence of "children", "child", "COPPA", "under 13", "under thirteen", or "minors" in the policy text.

Recommended Fix:
Add a "Children's Privacy" section: "Our website and services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us at hello@vetly.com so we can delete it."

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-111 — Contact email mailto link on BOTH legal pages points to wrong domain (`hello@prismo.com`)

Status: Open
Category: Content & copy
Severity: Critical
Location: `/privacy-policy` (`coY2rsl2X`) — Contact Us section — RichTextNode `Lwr4MNVbu` — TextRun `v:Lwr4MNVbu:0:1`. Also `/terms-of-service` (`JW10XMiXx`) — Contact Us section — RichTextNode `H2GBNGziV` — TextRun `v:H2GBNGziV:0:1`.

Description:
On both legal pages, the visible contact email text reads "hello@vetly.com" but the underlying mailto hyperlink points to `mailto:hello@prismo.com` (with `openInNewTab: true`). "Prismo" is a different brand — this is a leftover from a template or another project that was not updated when the site was customized for Vetly. When users click the contact email, their email client will open a new tab addressed to hello@prismo.com, which is presumably not monitored by Vetly. Privacy inquiries, legal notices (including DMCA takedowns, defamation claims, breach notifications), and contract disputes will all go to the wrong inbox and go unanswered. This is a serious legal/compliance issue, not just a cosmetic typo.

Evidence:
Confirmed via `framer.agent.getNode` + `getDescendantsOfTypes` for TextRun on both pages. TextRun `v:Lwr4MNVbu:0:1` (Privacy, Desktop) attributes: `text="hello@vetly.com"`, `link={"href":"mailto:hello@prismo.com","openInNewTab":true}`. TextRun `v:H2GBNGziV:0:1` (Terms, Desktop) attributes: `text="hello@vetly.com"`, `link={"href":"mailto:hello@prismo.com","openInNewTab":true}`. Same mailto is repeated on Tablet (`qY8n7HLAJ`/`kCUsiUT2R` prefix) and Phone (`pU2X7tE3_`/`fzLSMxK0V` prefix) breakpoints — 6 affected TextRuns in total.

Recommended Fix:
Update the `link.href` on all 6 affected TextRuns (Desktop/Tablet/Phone for both pages) to `mailto:hello@vetly.com` to match the visible text. Then verify that hello@vetly.com is actually monitored. Also consider setting `openInNewTab: false` for mailto links (current `true` opens a blank tab that stays blank after the mail client launches — minor UX annoyance).

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-112 — No BackButton or breadcrumb on either legal page

Status: Open
Category: UX & conversion
Severity: Low
Location: `/privacy-policy` (`coY2rsl2X`) — top of page, Sub Container `maUyaMZ70` > Container `UjKWN7ic3`. Also `/terms-of-service` (`JW10XMiXx`) — top of page, Sub Container `zVQkT_0UP` > Container `UjKWN7ic3`.

Description:
Neither legal page provides a BackButton, breadcrumb, or in-body "back to home" link. The only navigation is the global Header (rendered via the default layout template). The project ships a `BackButton.tsx` code component (`codeFile/tVVtI8x:default`) explicitly for this purpose — but a project-wide search returned 0 instances of it being used anywhere. The top of each legal page has a small Phosphor icon ComponentInstance (Privacy: `SeuyTe4nU`; Terms: `qIWqvohtR`) configured with `$control__name="ClockClockwise"`, `$control__name1="House"`, 20×20px, that sits next to the "Last updated" date — but it has **no `link` attribute**, so it is purely decorative and not clickable. Users arriving at `/privacy-policy` from a footer link, an email signature, or an external referral have no quick way back to the previous page or to the homepage from within the body of the policy itself; they must scroll up to find the Header or use the browser back button.

Evidence:
`getNodesOfTypes({ types: ["ComponentInstanceNode"] })` filtered for `codeOverride === "codeFile/tVVtI8x:default"` returned 0 results project-wide. `getDescendantsOfTypes` for `ComponentInstanceNode` on `/privacy-policy` returned only `SeuyTe4nU` (and its tablet/phone variants) with attributes showing `$control__name="ClockClockwise"`, `$control__name1="House"`, `$control__color`, `$control__weight`, `$control__mirrored`, but no `link` or `url` attribute. Same shape on `/terms-of-service` with `qIWqvohtR`.

Recommended Fix:
Either (a) drop the existing `BackButton.tsx` code component at the top of each legal page (above the H1) configured to navigate to `/`, or (b) add a simple text link "← Back to home" above the page title. The decorative ClockClockwise/House icon could be wired up as the back affordance if a link is added.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-113 — Privacy Policy does not link to Terms of Service

Status: Open
Category: Content & copy
Severity: Low
Location: `/privacy-policy` (`coY2rsl2X`)

Description:
The Privacy Policy does not contain any internal link to `/terms-of-service`. Cross-linking legal documents is a long-standing best practice — users reading the privacy policy are likely to also need the terms of service, and forcing them to scroll to the Footer to find the link adds friction. The body copy should reference the related document inline.

Evidence:
All TextRun nodes on `/privacy-policy` extracted. Only 1 link found per breakpoint: the email mailto (`v:Lwr4MNVbu:0:1`). No TextRun contains the text "Terms of Service" or "terms".

Recommended Fix:
Add a sentence in the "Sharing of Information" or "Contact Us" section linking to `/terms-of-service`, e.g., "Please also review our Terms of Service, which govern your use of our website and services."

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-114 — Terms of Service has no Payment Terms section

Status: Open
Category: Content & copy
Severity: Medium
Location: `/terms-of-service` (`JW10XMiXx`) — Sub Container `Z2Gx_EBDM`

Description:
The Terms of Service has 11 sections but does not include any payment terms. For a veterinary service with a `/booking` page (present in the site map), payment terms are essential — covering billing, refunds, cancellation fees, accepted payment methods, and authority to charge stored payment methods. Without payment terms, Vetly has weak legal ground for chargebacks, billing disputes, or no-show fees. The existing sections cover appointment *requests* but say nothing about what happens when money changes hands.

Evidence:
All TextRun nodes on `/terms-of-service` extracted. Section headings confirmed: "Acceptance of Terms", "Use of Our Website", "Appointment Requests", "Medical Information Disclaimer", "Intellectual Property", "Third-Party Services and Links", "Limitation of Liability", "Indemnification", "Changes to These Terms", "Governing Law", "Contact Us". No TextRun contains "payment", "billing", "fees", "refund", "charge", "price", "deposit", "invoice", or "credit card".

Recommended Fix:
Add a "Payment and Billing" or "Fees and Payment" section that covers: (a) accepted payment methods; (b) when payment is due (at time of service vs. at booking); (c) refund policy; (d) cancellation/no-show fees (cross-reference the new Cancellation section from DR-6-8); (e) authority to charge stored payment methods; (f) disputed charges.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-115 — Terms of Service has no Cancellation Policy section

Status: Open
Category: Content & copy
Severity: Medium
Location: `/terms-of-service` (`JW10XMiXx`) — "Appointment Requests" section (Heading `gGJeEpR8a`, Paragraph `moRjsR74v`)

Description:
The Terms of Service does not include a clear cancellation policy. The only mention of cancellation is one sentence in the Appointment Requests section: "Vetly reserves the right to reschedule, modify, or cancel appointments when necessary." — which protects Vetly but does not address user-initiated cancellations, the cancellation window, late-cancellation fees, or no-show policies. For a booking-based veterinary service, this is a critical gap: users have no clear expectations about what happens if they need to cancel, and Vetly has no contractual basis to charge no-show fees.

Evidence:
All TextRun nodes on `/terms-of-service` extracted. Only one occurrence of "cancel" in the entire ToS: TextRun `v:moRjsR74v:2:0` text: "Vetly reserves the right to reschedule, modify, or cancel appointments when necessary." No section heading for "Cancellation", "Cancellations", "No-Show", "Missed Appointments", or "Rescheduling".

Recommended Fix:
Add a "Cancellations and No-Shows" section specifying: (a) how users can cancel (e.g., via the booking confirmation email, by phone, or in the user dashboard); (b) the cancellation window (e.g., "at least 24 hours before the scheduled appointment"); (c) late-cancellation fee if any; (d) no-show policy; (e) Vetly's right to cancel (move the existing "Vetly reserves the right..." sentence here).

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-116 — Terms of Service has no Dispute Resolution / Arbitration clause

Status: Open
Category: Content & copy
Severity: Medium
Location: `/terms-of-service` (`JW10XMiXx`) — "Governing Law" section (Heading `u4IPGrYUk`, Paragraph `fZgoN2hz1`)

Description:
The Terms of Service has a Governing Law section but no dispute resolution clause — no arbitration agreement, no class-action waiver, no jurisdiction/venue clause, no requirement to attempt informal resolution first. For a service-based business that takes appointments and processes payments, this leaves Vetly exposed to litigation in any jurisdiction where a user happens to be located. Most modern ToS templates include a binding arbitration + class-action waiver to reduce litigation risk.

Evidence:
All TextRun nodes on `/terms-of-service` extracted. Governing Law section text: "These Terms of Service shall be governed by and interpreted in accordance with the laws applicable in the jurisdiction in which Vetly operates, without regard to conflict of law principles." No TextRun contains "arbitration", "dispute", "class action", "jury waiver", "waive", "venue", "jurisdiction" (other than the governing-law reference), "informal resolution", or "mediation".

Recommended Fix:
Add a "Dispute Resolution" section specifying: (a) parties will attempt informal resolution first (e.g., 30-day notice to hello@vetly.com); (b) binding arbitration agreement (specify rules, e.g., AAA); (c) class-action waiver; (d) jurisdiction/venue for any court proceedings (e.g., state/federal courts of [Specific State]); (e) allocation of attorneys' fees.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-117 — Governing Law clause is jurisdictionally vague

Status: Open
Category: Content & copy
Severity: Medium
Location: `/terms-of-service` (`JW10XMiXx`) — Governing Law section — RichTextNode `fZgoN2hz1` — TextRun `v:fZgoN2hz1:0:0`

Description:
The Governing Law clause reads: "These Terms of Service shall be governed by and interpreted in accordance with the laws applicable in the jurisdiction in which Vetly operates, without regard to conflict of law principles." This is too vague to be reliably enforceable — "the jurisdiction in which Vetly operates" does not name a specific state or country, and a court may decline to enforce a clause that does not identify the governing law with reasonable specificity. The clause also does not specify a venue or forum for disputes.

Evidence:
TextRun `v:fZgoN2hz1:0:0` text (exact): "These Terms of Service shall be governed by and interpreted in accordance with the laws applicable in the jurisdiction in which Vetly operates, without regard to conflict of law principles."

Recommended Fix:
Replace with a specific jurisdiction: "These Terms of Service shall be governed by and interpreted in accordance with the laws of the State of [Specific State], United States, without regard to its conflict of law principles. You and Vetly agree to submit to the exclusive jurisdiction of the state and federal courts located in [Specific County/State] for any dispute arising out of or relating to these Terms." Replace [Specific State] and [Specific County/State] with the actual jurisdiction where Vetly is incorporated or headquartered.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-118 — Terms of Service does not link to Privacy Policy

Status: Open
Category: Content & copy
Severity: Low
Location: `/terms-of-service` (`JW10XMiXx`)

Description:
The Terms of Service does not contain any internal link to `/privacy-policy`. Cross-linking legal documents is best practice — users reading the ToS likely also need to review the Privacy Policy, especially since the ToS "Third-Party Services and Links" and "Appointment Requests" sections implicate data collection. Forcing users to scroll to the Footer to find the Privacy Policy link adds friction.

Evidence:
All TextRun nodes on `/terms-of-service` extracted. Only 1 link per breakpoint: the email mailto (`v:H2GBNGziV:0:1`). No TextRun contains "Privacy Policy" or "privacy".

Recommended Fix:
Add a sentence in the "Acceptance of Terms" or "Use of Our Website" section linking to `/privacy-policy`, e.g., "For information about how we collect, use, and protect your personal information, please review our Privacy Policy."

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-119 — 404 page copy references a different brand ("Pavyon")

Status: Open
Category: Content & copy
Severity: Critical
Location: `/404` (`kfL3sfGQh`) — Hero > Content > Text Container `yFUpY8ka2` > Paragraph `OLhpRpJos` — TextRun `v:OLhpRpJos:0:0`

**Additional locations (merged findings):**
- `/404` (node `kfL3sfGQh`); paragraph RichTextNode `OLhpRpJos` (TextRun `v:OLhpRpJos:0:0`).

Description:
The 404 page paragraph reads: "We regret to inform you that the Pavyon you're searching for seems to be beyond our grasp. We apologize for any inconvenience this may cause." The word "Pavyon" is a different brand name — a leftover from a template or another project — not "Vetly" or "page". This is a clear brand inconsistency that signals the 404 page was assembled from a template without proper copy customization. For users who hit a 404, this looks unprofessional and confusing, and may cause them to wonder if they've reached the wrong site entirely. Combined with the `hello@prismo.com` mailto leftover on the legal pages (DR-6-4), this suggests the site was built on a multi-brand template that wasn't fully rebranded for Vetly.

**Additional context (merged from DR-15-3):** The /404 page paragraph text reads: *"We regret to inform you that the Pavyon you're searching for seems to be beyond our grasp. We apologize for any inconvenience this may cause."* The brand name "Pavyon" is a leftover from the original Framer template the site was built from — it was never updated to "Vetly" on this page. Every visitor who hits a non-existent URL will see a confusing, off-brand error message referring to a brand they've never heard of. This undermines trust on a veterinary site (where the visitor may already be anxious about a pet health issue) and is a clear signal that the site is a template that wasn't fully customized.

Evidence:
TextRun `v:OLhpRpJos:0:0` text (exact): "We regret to inform you that the Pavyon you're searching for seems to be beyond our grasp. We apologize for any inconvenience this may cause." Same copy repeated on Tablet (`v:QwAVLOoulOLhpRpJos:0:0`) and Phone (`v:bP1_fmE8VOLhpRpJos:0:0`) breakpoints. Screenshot saved at `/home/z/my-project/screenshots/sub6/404.jpg`.

**Additional evidence (from DR-15-3):** `framer.agent.getDescendantsOfTypes({ id: "kfL3sfGQh", types: ["TextRun"] }, { pagePath: "/404" })` returns (among others) `{ id: "v:OLhpRpJos:0:0", text: "We regret to inform you that the Pavyon you're searching for seems to be beyond our grasp. We apologize for any inconvenience this may cause." }`. Same string is replicated on the Tablet (`v:QwAVLOoulOLhpRpJos:0:0`) and Phone (`v:bP1_fmE8VOLhpRpJos:0:0`) variants. Screenshot: `https://framerusercontent.com/screenshots/on-demand/5e60f8fe-360f-4a50-a0aa-3688f877d2ab.jpg`.

Recommended Fix:
Replace "the Pavyon" with "the page" — final copy: "We regret to inform you that the page you're searching for seems to be beyond our grasp. We apologize for any inconvenience this may cause." Better yet, rewrite to be on-brand and actionable: "We couldn't find the page you were looking for. Let's get you back on track." Apply to all 3 breakpoints.

**Additional fix note (from DR-15-3):** Use `framer.agent.replaceText({ id: "v:OLhpRpJos:0:0", searchText: "Pavyon", replaceText: "page" }, { pagePath: "/404" })` — or rewrite the paragraph entirely to be on-brand and pet-empathetic (e.g. "We couldn't find that page — but your pet's care is still our priority. Try the navigation above or head back to the home page."). Apply the same replacement on the Tablet (`v:QwAVLOoulOLhpRpJos:0:0`) and Phone (`v:bP1_fmE8VOLhpRpJos:0:0`) TextRun variants. Search the rest of the project for any other "Pavyon" references and replace them too.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-120 — 404 page offers only one navigation option (Return to Home)

Status: Open
Category: UX & conversion
Severity: High
Location: `/404` (`kfL3sfGQh`) — Hero > Content > ComponentInstance `Jv7_t6C6H`

Description:
The 404 page offers only one navigation option: a "Return to Home" button linking to `/#hero`. There are no links to popular destinations like `/services`, `/blog`, `/contact`, or `/booking`. Best-practice 404 pages provide multiple navigation paths so users can recover from the dead-end and continue their journey. For a veterinary service, the most valuable next actions are booking an appointment, viewing services, or contacting the clinic — none of which are surfaced on the 404 page. Users who landed on /booking or /services from an old link or a typo will hit a dead-end and have to manually navigate via the Header.

Evidence:
ComponentInstance `Jv7_t6C6H` attributes: `$control__variant="Button"`, `$control__title="Return to Home"`, `$control__link="/#hero"`, `$control__newTab="false"`. Only 1 ComponentInstance per breakpoint on the 404 page (Desktop `Jv7_t6C6H`, Tablet `QwAVLOoulJv7_t6C6H`, Phone `bP1_fmE8VJv7_t6C6H`). No other links in the 404 tree (0 TextRuns with `link`, 0 other linkable components).

Recommended Fix:
Add 2-3 additional buttons or text links below the primary CTA, e.g., "Browse Services" → `/services`, "Book an Appointment" → `/booking`, "Contact Us" → `/contact`. Reuse the existing Outline Button component (`NoQy1opGY`) or a simple text-link cluster. Consider a "Popular pages" heading above the secondary links.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-121 — 404 page has no search bar

Status: Open
Category: UX & conversion
Severity: Medium
Location: `/404` (`kfL3sfGQh`) — Hero > Content (`M8inSdO4w`)

Description:
The 404 page does not include a search bar. When users land on a 404 from a mistyped URL or broken link, a search bar lets them find what they were actually looking for without leaving the page. Framer has an available `Search` component (`6wAE2eMb2Tl3zrU7u4UL`) listed in the project's additional components — it is not currently installed/used. Without a search affordance, the only recovery paths are the "Return to Home" button and the global Header nav.

Evidence:
404 page tree contains: Hero Background (gradient/grid/noise), Hero (Content with Heading "404" `UqS_uj9fu`, Heading "Oops!..." `tPCXOH4hC`, Paragraph `OLhpRpJos`, Button `Jv7_t6C6H`). No search input node, no Search component instance, no form element present.

Recommended Fix:
Add a search input between the paragraph and the primary CTA button. Either install Framer's `Search` component (`6wAE2eMb2Tl3zrU7u4UL`) or implement a simple input that submits to a site-search query (e.g., redirect to `/blog?q=<query>` or a dedicated search results page).

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-122 — 404 page has no suggested pages or popular content

Status: Open
Category: UX & conversion
Severity: Medium
Location: `/404` (`kfL3sfGQh`) — Hero > Content (`M8inSdO4w`)

Description:
The 404 page does not surface any suggested pages, popular services, or recent blog posts. Best-practice 404 pages suggest 3-5 likely destinations to help users recover and continue engaging with the site. For Vetly, this could be a list of top services (Wellness Exams, Vaccinations, Dental Care) or recent blog posts. Without suggested content, the 404 is a dead-end and bounces users.

Evidence:
404 page Hero Content children: unnamed decorative FrameNode `WW8KA7mxK` (660×280px blur gradient, opacity 0.75, no children with text), Heading `UqS_uj9fu` ("404"), Text Container `yFUpY8ka2` (Heading + Paragraph), ComponentInstance `Jv7_t6C6H` (Return to Home button). No list/grid of suggested pages. No Service Card / Blog Card / text-link list.

Recommended Fix:
Below the primary CTA, add a "Popular pages" or "You might be looking for" section with 3-4 cards or text links to `/services`, `/blog`, `/booking`, `/contact`. Could reuse the existing Service Card (`ecHzMZLnH`) or Blog Card (`EiCUZ0sVC`) components for visual consistency.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-123 — 404 page is missing meta description and is indexable by search engines

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/404` (`kfL3sfGQh`) — page metadata

**Additional locations (merged findings):**
- `/404` (node `kfL3sfGQh`); `attributes.metadata`.

Description:
The 404 page's metadata only has `title="404 | Page Not Found"` — **no `description` is set**. Additionally, `noIndexSite` is `false`, meaning search engines are allowed to index the 404 page. Best practice is to set 404 pages to `noindex` to prevent them from appearing in search results and diluting crawl budget. The 404 page is not a destination users would search for, and having it indexed could compete with real content for the brand query. (For comparison, both `/privacy-policy` and `/terms-of-service` have descriptions set.)

**Additional context (merged from DR-15-11):** The /404 page's metadata contains only `title: "404 | Page Not Found"` and `noIndexSite: false` — there is no `description` field. While 404 pages are typically not indexed (and arguably should be `noindex`), the missing description means search engines and social shares have no snippet to display. The page is currently `noIndexSite: false` (meaning it CAN be indexed), so without a description, search engines will fabricate one from page content (currently the "Pavyon" copy from DR-15-3 — which would be embarrassing if indexed). Either add a description OR set `noIndex: true` to prevent indexing.

Evidence:
Page metadata extracted via `serialize` on `kfL3sfGQh`: `{ "title": "404 | Page Not Found", "noIndexSite": false }` — no `description` key present. Compare to `/privacy-policy` metadata which includes `title`, `description`, and `noIndexSite=false`; `/terms-of-service` includes `title`, `description`, and `noIndexSite=false`.

**Additional evidence (from DR-15-11):** `framer.agent.getNode({ id: "kfL3sfGQh" }, { pagePath: "/404" })` returns `attributes.metadata = { title: "404 | Page Not Found", noIndexSite: false }` — no `description` key. Compare to all other pages which have a `description` field set.

Recommended Fix:
Set `noIndexSite: true` on the 404 page (page settings). Optionally add a meta description like "The page you were looking for could not be found. Return to the Vetly homepage or browse our veterinary services." for completeness.

**Additional fix note (from DR-15-11):** Either (a) set `metadata.description` to something like "The page you're looking for can't be found. Return to the Vetly home page or use the navigation to find what you need." OR (b) set `noIndex: true` on the /404 page (preferred — 404 pages should not be indexed). Coordinate with sub-agent 7 (SEO) which likely also flagged this.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-124 — 404 page sub-heading is unclear ("Oops! This path leads to the past.")

Status: Open
Category: Content & copy
Severity: Low
Location: `/404` (`kfL3sfGQh`) — Hero > Content > Text Container `yFUpY8ka2` > Heading `tPCXOH4hC` — TextRun `v:tPCXOH4hC:0:0`

Description:
The 404 sub-heading reads "Oops! This path leads to the past." — this is poetic but ambiguous. Users may not immediately understand that they've hit a 404 (page not found). "Path leads to the past" could be misinterpreted as a temporal/historical reference rather than a 404 indicator. Combined with the "Pavyon" mistake in the paragraph (DR-6-12) and the lack of suggested pages, the 404 page reads as unedited template content. A clearer heading like "Page not found" or "We couldn't find that page" would be more helpful and would also reinforce what happened for accessibility (screen-reader users get the heading announced first).

Evidence:
TextRun `v:tPCXOH4hC:0:0` text (exact): "Oops! This path leads to the past." Repeated on Tablet (`v:QwAVLOoultPCXOH4hC:0:0`) and Phone (`v:bP1_fmE8VtPCXOH4hC:0:0`) breakpoints.

Recommended Fix:
Replace with a clearer heading like "Page not found" or "We couldn't find that page". Keep the friendly tone if desired ("Oops! Page not found.") but prioritize clarity over poetry. Apply to all 3 breakpoints.

Confidence: High
Discovered by: sub-agent 6, session DR

---

## DR-125 — 404 page giant "404" heading (120px) — potential mobile overflow

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/404` (`kfL3sfGQh`) — Hero > Content > Heading `UqS_uj9fu` (Desktop), `bP1_fmE8VUqS_uj9fu` (Phone breakpoint)

Description:
The "404" hero heading uses Inter Display, weight 700, **fontSize 120px**, line-height 120%, text-align center. This is a stylistic choice for impact on Desktop, but on the Phone breakpoint (width typically 390-414px) three characters at 120px may overflow or be cut off — Framer's text-frame clipping could hide digits. Should be verified on actual mobile rendering. If the design intent is "big number, full-bleed", a responsive sizing (e.g., 80px on Phone) would be safer.

Evidence:
RichTextNode `UqS_uj9fu` attributes (Desktop): `fontName="Inter Display"`, `fontWeight=700`, `fontSize="120px"`, `lineHeight="120%"`, `textAlignment="center"`, `width="1fr"`, `height="auto"`. The Phone-breakpoint equivalent `bP1_fmE8VUqS_uj9fu` exists in the tree (confirmed via serialize) but its fontSize was not individually inspected — flagged for visual verification.

Recommended Fix:
Verify the 404 heading renders correctly on Phone breakpoint via screenshot at viewport width 390px. If it overflows or clips, set the Phone-breakpoint fontSize to ~80-96px or use a smaller value with `width="100%"` and `textAlignment="center"`. Screenshot reference: `/home/z/my-project/screenshots/sub6/404.jpg` (Desktop).

Confidence: Medium
Discovered by: sub-agent 6, session DR

---

## Findings index

| ID | Title | Severity | Page |
|---|---|---|---|
| DR-6-1 | Privacy Policy missing User Rights section | High | /privacy-policy |
| DR-6-2 | Privacy Policy missing Data Retention section | Medium | /privacy-policy |
| DR-6-3 | Privacy Policy missing Children's Privacy (COPPA) | Low | /privacy-policy |
| DR-6-4 | Both legal pages — contact email mailto points to `hello@prismo.com` (wrong brand) | Critical | /privacy-policy + /terms-of-service |
| DR-6-5 | No BackButton or breadcrumb on either legal page | Low | /privacy-policy + /terms-of-service |
| DR-6-6 | Privacy Policy does not link to Terms of Service | Low | /privacy-policy |
| DR-6-7 | Terms of Service missing Payment Terms section | Medium | /terms-of-service |
| DR-6-8 | Terms of Service missing Cancellation Policy | Medium | /terms-of-service |
| DR-6-9 | Terms of Service missing Dispute Resolution / Arbitration | Medium | /terms-of-service |
| DR-6-10 | Governing Law clause is jurisdictionally vague | Medium | /terms-of-service |
| DR-6-11 | Terms of Service does not link to Privacy Policy | Low | /terms-of-service |
| DR-6-12 | 404 page copy references wrong brand "Pavyon" | Critical | /404 |
| DR-6-13 | 404 page offers only one navigation option | High | /404 |
| DR-6-14 | 404 page has no search bar | Medium | /404 |
| DR-6-15 | 404 page has no suggested pages | Medium | /404 |
| DR-6-16 | 404 page missing meta description + indexable | Medium | /404 |
| DR-6-17 | 404 sub-heading unclear | Low | /404 |
| DR-6-18 | 404 heading 120px — potential mobile overflow | Low | /404 |

**Total: 18 findings.** Critical: 2. High: 2. Medium: 7. Low: 7.

---

## DR-126 — `/booking` page has no H1 heading

Status: Open
Category: SEO & metadata
Severity: Critical
Location: `/booking` — `kdx64iDUQ` — the only text node is a RichTextNode named "Title" (`ZebPjet9v`) inside the "Booking Modal" section.

Description:
The booking page has zero heading elements. Its only text element is a RichTextNode named "Title" (`ZebPjet9v`) whose explicit TextBlock child has `tag: "p"` (paragraph) and `textStylePreset: "Text L"` — it is visually styled as body text, not a heading, and is semantically rendered as `<p>`. The page has no H1, no H2, and no H3 anywhere. Without an H1, search engines and assistive technology cannot identify the page's primary topic; the page will rank poorly for "book vet appointment" intent and is non-compliant with WCAG 2.4.6 (Headings and Labels) and the HTML spec's "exactly one H1 per page" recommendation.

Evidence:
- `getDescendantsOfTypes({id:"kdx64iDUQ", types:["TextBlock"]}, {pagePath:"/booking"})` returned `{"tagCounts": {"p": 3}}` (3 paragraph tags across the 3 breakpoints; zero of any heading level).
- `serialize({id:"ZebPjet9v", depth:8}, {pagePath:"/booking"})` returned `attributes: {textStylePreset: "Text L", ...}` with one child `TextBlock {tag: "p"}` containing a single `TextRun {text: "Book an Appointment"}`.
- Page metadata `title: "Book an Appointment | Vetly Veterinary Clinic"` exists, but no H1 mirrors it on the rendered page.

Recommended Fix:
Convert the "Title" RichTextNode (`ZebPjet9v`) on `/booking` to use a heading by setting `textStylePreset: "Heading 1"` AND adding a TextBlock child with `tag: "h1"` (matching the pattern on `/` Home where RichTextNode `lZAuLjbAX` has child TextBlock `v:lZAuLjbAX:0` with `tag: "h1"`). Keep the existing text "Book an Appointment".

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-127 — `/services/:Services` CMS detail page has no H1

Status: Open
Category: SEO & metadata
Severity: Critical
Location: `/services/:Services` — `lhpeg56oV` — RichTextNode named "Heading" (`z46rpmDZO`) inside the hero section, parent frame `mp49InyOr`.

Description:
The service detail page has zero H1 elements across all breakpoints. The main service title — a RichTextNode named "Heading" (`z46rpmDZO`) bound to the CMS variable `var(--variable-rcONKAEdm)` — uses `textStylePreset: "Heading 2"` (visually styled as Heading 2) but has NO TextBlock child with a semantic tag, so the rendered HTML defaults to `<p>` rather than `<h1>` or `<h2>`. The descendants scan confirmed `h1: 0` on this page. With no H1, search engines cannot determine which service the page is about; every CMS detail page will inherit this defect, suppressing rankings for high-intent service queries like "veterinary surgery", "pet dental care", etc.

Evidence:
- `getDescendantsOfTypes({id:"lhpeg56oV", types:["TextBlock"]}, {pagePath:"/services/:Services"})` returned `{"tagCounts": {"h2": 3, "h3": 12}}` — zero H1.
- `serialize({id:"z46rpmDZO", depth:8}, {pagePath:"/services/:Services"})` returned a RichTextNode with `attributes: {textStylePreset: "Heading 2", text: "var(--variable-rcONKAEdm)"}` and NO `children` array (no TextBlock child).
- The single `h2` per breakpoint is the section title "About The Service" (`ylWnmXl4L`), not the main service title.
- Page metadata `title: "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"` uses a CMS variable for the title — but no H1 mirrors it on the rendered page.

Recommended Fix:
On the `/services/:Services` page, edit the RichTextNode `z46rpmDZO` (the CMS-bound "Heading"): change `textStylePreset` to `"Heading 1"` and add a TextBlock child with `tag: "h1"` so the service title renders as `<h1>` on every CMS item. This must be done on the primary Desktop breakpoint (`L0pZyMNz4`) so it propagates to Tablet/Phone replicas.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-128 — `/blog/:Blog` CMS detail page has no H1

Status: Open
Category: SEO & metadata
Severity: Critical
Location: `/blog/:Blog` — `DvEqpc9aQ` — RichTextNode named "Heading" (`tbmRszkDN`) inside the "Text Container" frame (`vlqOrAJPz`) of the Article section.

Description:
The blog detail page has zero H1 elements. The main blog post title — a RichTextNode named "Heading" (`tbmRszkDN`) bound to CMS variable `var(--variable-Y55Ujs5Or)` — uses `textStylePreset: "Heading 1"` (visually styled as Heading 1) but has NO TextBlock child with a semantic tag, so the rendered HTML defaults to `<p>`. The descendants scan confirmed zero TextBlocks of ANY tag on the entire page. This means every blog post renders without an H1, severely compromising SEO for blog content (Google uses H1 as a primary on-page ranking signal) and accessibility (screen reader users have no heading navigation). The article body RichTextNode `xmNqnS9um` (`text: var(--variable-Vv2SvDCYA)`) likewise has no TextBlock children, so even internal H2/H3 styling in the rich text body would not produce semantic heading tags.

Evidence:
- `getDescendantsOfTypes({id:"DvEqpc9aQ", types:["TextBlock"]}, {pagePath:"/blog/:Blog"})` returned `{"tagCounts": {}}` — zero TextBlocks of any kind.
- `serialize({id:"tbmRszkDN", depth:8}, {pagePath:"/blog/:Blog"})` returned a RichTextNode with `attributes: {textStylePreset: "Heading 1", text: "var(--variable-Y55Ujs5Or)"}` and NO `children` array (no TextBlock child).
- Page metadata `title: "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"` uses a CMS variable for the title, but the on-page H1 is missing.

Recommended Fix:
On the `/blog/:Blog` page, add a TextBlock child with `tag: "h1"` to the RichTextNode `tbmRszkDN`. The existing `textStylePreset: "Heading 1"` is already correct visually. Without the TextBlock child, Framer renders the title as `<p>`. Apply on the Desktop breakpoint (`lBjdH_FvV`) so it propagates to replicas.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-129 — `/404` page is missing a meta description

Status: Open
Category: SEO & metadata
Severity: High
Location: `/404` — `kfL3sfGQh` — `attributes.metadata` (no `description` field present).

Description:
The 404 page's metadata object contains only `{"title": "404 | Page Not Found", "noIndexSite": false}` — there is NO `description` field. All other 12 pages have a description set. While 404 pages are typically not indexed, a missing description combined with the page being indexable (see DR-7-13) means Google could surface the page in search results with an auto-generated snippet. More importantly, the missing description signals incomplete SEO setup.

Evidence:
- `getNode({id:"kfL3sfGQh"}, {pagePath:"/404"})` returned `attributes.metadata = {"title":"404 | Page Not Found","noIndexSite":false}` — no `description` key.
- Compare to `/privacy-policy` metadata: `{"title":"Privacy Policy | Your Privacy Matters to Us","description":"Our Privacy Policy outlines how we collect, use, and protect your personal information. Your privacy and security are our priorities.","noIndexSite":false}`.

Recommended Fix:
Add a `description` field to `/404` metadata, e.g. `"The page you were looking for could not be found. Visit Vetly's home page to book veterinary care, explore services, or read our pet health blog."` (under 160 chars).

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-130 — Missing social share image (OG/Twitter image) on 12 of 13 pages

Status: Open
Category: SEO & metadata
Severity: High
Location: All pages EXCEPT `/blog/:Blog` — i.e. `/` (`augiA20Il`), `/services` (`WBfQT22QS`), `/services/:Services` (`lhpeg56oV`), `/about` (`mWgiU9J96`), `/blog` (`OUWIjsEU8`), `/contact` (`CimqoCoMb`), `/booking` (`kdx64iDUQ`), `/documentation` (`B49BfU8Yb`), `/brand-guide` (`hkW4RaXgm`), `/privacy-policy` (`coY2rsl2X`), `/terms-of-service` (`JW10XMiXx`), `/404` (`kfL3sfGQh`).

**Additional locations (merged findings):**
- `/services/:Services` — `lhpeg56oV` — `attributes.metadata` (no `socialImage` field).

Description:
The `metadata.socialImage` field is set ONLY on `/blog/:Blog` (using `var(--variable-kZ3Cwfwri)` — the CMS blog post image). The other 12 pages have NO `socialImage` set in their metadata. Framer's plugin API does not expose a site-level default OG image, so we cannot confirm whether a fallback exists via the Framer dashboard. If no site default exists, sharing any of these 12 page URLs on social media (Twitter, Facebook, LinkedIn, Slack, etc.) will produce a link card with no preview image — dramatically reducing click-through rate from social channels. For a veterinary brand where hero imagery is a key trust signal, this is a measurable conversion loss.

**Additional context (merged from DR-7-9):** The service detail page's metadata has `title: "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"` and `description: "{{Card Description}}"` — both correctly bound to CMS variables for per-item uniqueness — but there is NO `socialImage` field. Compare to `/blog/:Blog` which has `socialImage: "var(--variable-kZ3Cwfwri)"` (CMS blog image). Every service detail page will share whatever site-default OG image exists (or none at all), so sharing a link to "Veterinary Surgery" looks identical to sharing "Pet Dental Care" on social media. For a services business where each service has distinct visual cues, this is a missed opportunity.

Evidence:
- Per-page metadata inspection shows `socialImage` present only on `/blog/:Blog`: `{"title":"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet","description":"{{Description}}","socialImage":"var(--variable-kZ3Cwfwri)"}`.
- All other 12 pages' metadata contains only `title`, `description`, and (where applicable) `noIndex`/`noIndexSite` — no `socialImage` key.
- `framer.getProjectInfo()` returns only `{id, name:"Vetly", apiVersion1Id}` — site-level OG image not exposed via plugin API.

**Additional evidence (from DR-7-9):** - `getNode({id:"lhpeg56oV"})` returned `metadata: {"title":"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet","description":"{{Card Description}}"}` — no `socialImage` key.
- Compare to `/blog/:Blog` metadata: `{"title":"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet","description":"{{Description}}","socialImage":"var(--variable-kZ3Cwfwri)"}`.
- The page already has a CMS-bound image fill `var(--variable-cuwT3VRH4)` on the hero — that variable (or another image variable) should be reused as `socialImage`.

Recommended Fix:
For each of the 12 affected pages, set `metadata.socialImage` to an appropriate branded 1200×630px image. Prioritize: `/` (hero image), `/services` (services collage), `/about` (clinic/team photo), `/contact` (clinic exterior or map), `/booking` (booking CTA graphic). Legal pages (`/privacy-policy`, `/terms-of-service`) and `/404` can use a generic Vetly branded OG image. Also confirm via the Framer dashboard that a site-level default OG image is configured as a fallback. Note: `/services/:Services` should use a CMS-bound social image (e.g. `var(--variable-<serviceImage>)`) so each service detail page gets a unique share image, matching the pattern already used on `/blog/:Blog`.

**Additional fix note (from DR-7-9):** Add `socialImage` to the `/services/:Services` metadata, bound to the same CMS image variable used for the hero image (likely `var(--variable-cuwT3VRH4)` or whichever variable holds the service's primary image). This ensures each service detail page renders a unique OG image when shared.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-131 — No structured data / Schema.org markup anywhere in the project

Status: Open
Category: SEO & metadata
Severity: High
Location: Project-wide — no JSON-LD or microdata markup exists on any of the 13 pages. The only Embed component instances in the project are 3 Cal.com embeds on `/booking` (`O2N4dsp87`, `CqSG6wWy3O2N4dsp87`, `KYaJPUHtfO2N4dsp87`).

Description:
A whole-project search for Embed/JSON-LD/Schema components returned only the Cal.com booking widget on `/booking`. There is NO structured data anywhere — no `LocalBusiness`, `VeterinaryCare`, `BlogPosting`, `BreadcrumbList`, `FAQPage`, `MedicalBusiness`, `WebSite`, or `Organization` schema. For a veterinary clinic, the absence of `LocalBusiness`/`VeterinaryCare` schema means Google cannot enrich search results with business hours, address, phone, ratings, or services. The absence of `BlogPosting` schema on `/blog/:Blog` prevents blog posts from appearing in Google News / Top Stories carousels. The absence of `FAQPage` schema on `/services/:Services` (which has an FAQ section) forfeits FAQ rich results. The absence of `BreadcrumbList` on detail pages loses breadcrumb rich results.

Evidence:
- `getNodesOfTypes({types:["ComponentInstanceNode"]})` returned 603 instances; filtering by name pattern `/embed|schema|json-ld|seo|structured/i` or component id `o1PI5S8YtkA5bP5g4dFz` (the Embed external component) returned exactly 3 results — all "Cal Booking" instances on `/booking`.
- Inspection of the default layout template `yDIYoKc7h` (depth 4) shows only Header, Blur Gradient, Wrapper (CTA + Footer), Buy Button — no Embed/code injection for structured data.

Recommended Fix:
Add JSON-LD structured data via Embed components or code overrides:
1. `LocalBusiness` (or `VeterinaryCare`) schema on `/`, `/services`, `/contact`, `/booking` — include name, address, phone, openingHours, priceRange, image, geo, sameAs (social profiles).
2. `BlogPosting` schema on `/blog/:Blog` — bind fields to CMS variables (headline, datePublished, author, image, articleBody).
3. `Service` schema on `/services/:Services` — bind to CMS service fields.
4. `FAQPage` schema on `/services/:Services` — bind to the CMS FAQ field.
5. `BreadcrumbList` on `/services/:Services` and `/blog/:Blog`.
6. `WebSite` + `Organization` schema in the layout template (site-wide).

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-132 — `/brand-guide` page has TWO H1 elements per breakpoint

Status: Open
Category: SEO & metadata
Severity: High
Location: `/brand-guide` — `hkW4RaXgm` — two distinct H1 TextBlocks per breakpoint: `xbjV5Mh_O` (visible page title "Vetly Design System") and `nos5EGliZ` (Typography section sample "Heading 1 — The quick brown fox"). Total H1 count: 6 across 3 breakpoints = 2 unique per breakpoint.

Description:
The brand-guide page has two H1 elements per breakpoint (6 H1 TextBlocks total across the 3 breakpoints). The first H1 ("Vetly Design System", RichTextNode `xbjV5Mh_O`) is the legitimate page title in the hero section. The second H1 ("Heading 1 — The quick brown fox", RichTextNode `nos5EGliZ`) is in the Typography section showing visual samples of each heading level — it is a styling demo, not a content heading. Both render as `<h1>` in the HTML. Multiple H1s on a single page dilute the semantic signal to search engines and confuse screen reader heading navigation. While HTML5 allows multiple H1s in theory, best practice (and Google's guidance) is one H1 per page.

Evidence:
- `getDescendantsOfTypes({id:"hkW4RaXgm", types:["TextBlock"]}, {pagePath:"/brand-guide"})` returned `{"tagCounts": {"h1": 6, "h2": 39, "h3": 3, "h4": 9, "h5": 3, "h6": 3, "p": 198}}` — 6 H1s across 3 breakpoints = 2 unique per breakpoint.
- `serialize({id:"xbjV5Mh_O", depth:5}, {pagePath:"/brand-guide"})` returned RichTextNode with `textStylePreset: "Heading 1"` and TextBlock child `v:xbjV5Mh_O:0` with `tag: "h1"`, containing TextRun `"Vetly Design System"`.
- `serialize({id:"nos5EGliZ", depth:5}, {pagePath:"/brand-guide"})` returned RichTextNode with `textStylePreset: "Heading 1"` and TextBlock child `v:nos5EGliZ:0` with `tag: "h1"`, containing TextRun `"Heading 1 — The quick brown fox"`.
- Note: `/brand-guide` is correctly set to `noIndex: true`, so this issue does not affect search rankings directly — but it does affect accessibility and the page would surface if noindex were ever removed.

Recommended Fix:
In the Typography section of `/brand-guide`, change the TextBlock `tag` of the "Heading 1 — The quick brown fox" sample from `"h1"` to `"p"` (or remove the tag entirely) while keeping the `textStylePreset: "Heading 1"` so the visual styling is preserved but the semantic HTML is no longer an H1. Apply the same treatment to the H2/H3/H4/H5/H6 typography samples in that section (they are currently tagged as real h2/h3/h4/h5/h6 — verify and demote to `<p>` to avoid polluting the heading outline). The visible page title "Vetly Design System" should remain the only H1.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-133 — All page-level image fills have missing alt text

Status: Open
Category: SEO & metadata
Severity: High
Location: Direct image fills (not inside component instances) on 7 pages:
- `/` — `augiA20Il` — "Noise" texture image (`6mcf62RlDfRfU61Yg5vb2pefpi4.png`), 1 instance per breakpoint × 3.
- `/services` — `WBfQT22QS` — "Image" hero image (`3YH4HoGM2TVZrslMesdcQmpZ3U.webp`), 1 per breakpoint.
- `/services/:Services` — `lhpeg56oV` — 4 image fills per breakpoint including 3 CMS-bound images (`var(--variable-cuwT3VRH4)`, `var(--variable-fi_ngkpzZ)`, `var(--variable-ETkdlMg0x)`, `var(--variable-vul25GQ8X)`).
- `/about` — `mWgiU9J96` — 2 image fills per breakpoint ("Image" `2mYRK3PxyCOvm3oAGgVTcKSvBg.webp` + "Untitled" `wzaOFvr7x6haFaSLTi7jeiaJEKM.png`).
- `/blog/:Blog` — `DvEqpc9aQ` — "Banner" image fill (CMS variable `var(--variable-kZ3Cwfwri)`), 1 per breakpoint.
- `/brand-guide` — `hkW4RaXgm` — SVG image fill (`1R4NU3f2Nxccfas5QWXH8vNoyw.svg`, likely the Vetly logo), 1 per breakpoint.
- `/404` — `kfL3sfGQh` — "Noise" texture image (same `6mcf62RlDfRfU61Yg5vb2pefpi4.png` as home), 1 per breakpoint.

Description:
Every page-level FrameNode with an image fill has the `alt` attribute UNSET (not even `alt=""` for decorative images). This is a WCAG 2.1 Level A failure (Success Criterion 1.1.1 Non-text Content) and an SEO issue — Google uses image alt text as a ranking signal for image search and to understand image context. The CMS-bound images on `/services/:Services` and `/blog/:Blog` will display different images per item but never have alt text, so visually impaired users get no information about any CMS image. The "Noise" texture on `/` and `/404` is decorative and should be `alt=""` (empty) to mark as presentational.

Evidence:
- Deep serialize (depth 8) + descendants scan of every page collected all image fills; each had `alt` UNSET.
- Sample from `/services`: FrameNode named "Image", `fill: "https://framerusercontent.com/images/3YH4HoGM2TVZrslMesdcQmpZ3U.webp"`, `alt: "[UNSET]"`, `htmlTag: "(none)"`.
- Sample from `/blog/:Blog`: FrameNode named "Banner", `fill: "var(--variable-kZ3Cwfwri)"`, `alt: "[UNSET]"`, `htmlTag: "(none)"`.
- Note: images inside component instances (Blog Card, Service Card, Testimonial Card, etc.) were not directly inspectable via page serialize — those are tracked under sub-agent 11 (Native components audit). They likely share the same missing-alt pattern.

Recommended Fix:
For each page-level image fill, set `alt` based on image purpose:
- Decorative images (the "Noise" texture on `/` and `/404`): set `alt=""` (empty string).
- Content images (hero images on `/services`, `/about`, `/brand-guide` logo): write concise descriptive alt text (e.g. "Vetly logo", "Veterinarian examining a golden retriever").
- CMS-bound images (`/services/:Services`, `/blog/:Blog`): bind `alt` to a CMS variable — add an "Alt Text" field to each CMS collection and bind the image frame's `alt` attribute to it. Failing that, fall back to a templated alt like `var(--variable-Title)` so at least the service/post title appears.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-134 — `/services/:Services` FAQ section heading uses Heading 1 visual style but is tagged as H3

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/services/:Services` — `lhpeg56oV` — RichTextNode "FAQ" (`Z1S2KgElo`) inside the FAQ section, parent `kqOSYdiNZ`.

Description:
The FAQ section title on the service detail page has a visual/semantic mismatch. Its RichTextNode has `textStylePreset: "Heading 1"` (visually styled as the largest heading), but its TextBlock child has `tag: "h3"` (semantically an H3). This means the FAQ section visually appears larger than the page's actual H1 (which is missing — see DR-7-2), creating a confusing visual hierarchy where the FAQ section title is the most prominent text on the page but is marked as a third-level heading. Search engines and screen readers will see it as an H3 nested without a proper H1 ancestor.

Evidence:
- `serialize({id:"Z1S2KgElo", depth:4}, {pagePath:"/services/:Services"})` returned `attributes: {textStylePreset: "Heading 1", ...}` with child TextBlock `v:Z1S2KgElo:0` having `tag: "h3"` and TextRun text `"FAQ"`.
- The page has no H1 (see DR-7-2), so this "FAQ" H3 is technically the largest heading on the page despite the visual style suggesting otherwise.

Recommended Fix:
After fixing DR-7-2 (adding a proper H1 for the service title), change the FAQ section title's `textStylePreset` from `"Heading 1"` to `"Heading 3"` (matching the existing `tag: "h3"`), OR change the TextBlock `tag` from `"h3"` to `"h2"` if the FAQ section should be a major section. Pick one visual+semantic pairing — do not let the visual style and semantic tag disagree.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-135 — `/404` page is not marked noindex

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/404` — `kfL3sfGQh` — `attributes.metadata` (no `noIndex` field present; only `noIndexSite: false`).

Description:
The 404 error page does not have `noIndex: true` set in its metadata. While `noIndexSite: false` (the site-wide override) is correctly false, the page-level `noIndex` flag is absent. 404 pages should be `noindex` because they have no unique content value for search engines and can dilute crawl budget if many variant 404 URLs get indexed. Compare to `/documentation` and `/brand-guide` which correctly have `noIndex: true`. (Privacy Policy and Terms of Service are debatable; 404 should definitively be noindex.)

Evidence:
- `getNode({id:"kfL3sfGQh"})` returned `metadata: {"title":"404 | Page Not Found","noIndexSite":false}` — no `noIndex` key.
- Compare to `/documentation` metadata: `{"title":"Template Documentation | Vetly","description":"A complete guide to customizing the Vetly template: text, images, colors, CMS content, SEO, and more.","noIndex":true,"noIndexSite":false}` — has `noIndex: true`.

Recommended Fix:
Set `metadata.noIndex = true` on `/404` page (`kfL3sfGQh`).

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-136 — `/blog` meta description exceeds 160-character limit

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/blog` — `OUWIjsEU8` — `attributes.metadata.description`.

Description:
The blog index page's meta description is 176 characters, exceeding the recommended 60–160 character limit. Google typically truncates descriptions around 155–160 characters on desktop (and ~120 on mobile), so the trailing text "to keep your dog or cat healthy and happy." will be cut off with an ellipsis ("…") in search results, weakening the call-to-action. The current value: "Discover expert pet care advice from Vetly's veterinarians. Read our blog for wellness tips, vaccination guides, dental care, and more to keep your dog or cat healthy and happy."

Evidence:
- `getNode({id:"OUWIjsEU8"})` returned `metadata.description: "Discover expert pet care advice from Vetly's veterinarians. Read our blog for wellness tips, vaccination guides, dental care, and more to keep your dog or cat healthy and happy."` — measured at 176 characters.
- Recommended upper bound: 160 characters (Google's typical desktop snippet truncation point).

Recommended Fix:
Shorten the description to ≤160 characters while keeping the most important keywords up front. Suggested: "Discover expert pet care advice from Vetly's veterinarians — wellness tips, vaccination guides, dental care, and more for your dog or cat." (134 chars).

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-137 — `/services` page title exceeds 60-character limit

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/services` — `WBfQT22QS` — `attributes.metadata.title`.

Description:
The services index page's title is 64 characters, exceeding the recommended 50–60 character limit. Google typically truncates titles around 60 characters on desktop, so the trailing "Vetly" brand may be cut off with an ellipsis. The current value: "Veterinary Services | Wellness, Surgery & Emergency Care | Vetly" (64 chars). The two-pipe structure ("| … | … | …") is also visually heavy; consolidating could improve both length and readability.

Evidence:
- `getNode({id:"WBfQT22QS"})` returned `metadata.title: "Veterinary Services | Wellness, Surgery & Emergency Care | Vetly"` — measured at 64 characters.
- Recommended upper bound: 60 characters.

Recommended Fix:
Shorten to ≤60 characters while keeping "Vetly" brand at the end. Suggested: "Veterinary Services | Vetly" (27 chars — too short), or "Veterinary Services: Wellness, Surgery & Emergency | Vetly" (58 chars), or "Vetly Veterinary Services: Wellness, Surgery, Emergency Care" (59 chars).

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-138 — `/privacy-policy` and `/404` page titles do not include the brand "Vetly"

Status: Open
Category: SEO & metadata
Severity: Medium
Location: - `/privacy-policy` — `coY2rsl2X` — `metadata.title: "Privacy Policy | Your Privacy Matters to Us"` (43 chars, no "Vetly").
- `/404` — `kfL3sfGQh` — `metadata.title: "404 | Page Not Found"` (20 chars, no "Vetly").

Description:
Two page titles omit the brand name "Vetly". Every other page in the site includes "Vetly" in the title (e.g. "About Vetly | Our Veterinary Team & Story", "Terms of Service | Vetly"). Brand consistency in title tags helps users recognize the site in search results, reinforces brand recall, and is a basic SEO hygiene practice. The Privacy Policy title is also generic ("Your Privacy Matters to Us" is a tagline, not a brand+page-type identifier).

Evidence:
- `getNode({id:"coY2rsl2X"})` returned `metadata.title: "Privacy Policy | Your Privacy Matters to Us"` — no "Vetly" substring.
- `getNode({id:"kfL3sfGQh"})` returned `metadata.title: "404 | Page Not Found"` — no "Vetly" substring.
- Compare: every other page title contains "Vetly" — e.g. `/terms-of-service` → "Terms of Service | Vetly"; `/booking` → "Book an Appointment | Vetly Veterinary Clinic".

Recommended Fix:
- Privacy Policy: change title to "Privacy Policy | Vetly" or "Privacy Policy | Vetly Veterinary Care" (under 60 chars).
- 404: change title to "404 | Page Not Found | Vetly" or "Page Not Found | Vetly" (under 60 chars).

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-139 — CMS detail page title template risks exceeding 60 characters for typical content

Status: Open
Category: SEO & metadata
Severity: Medium
Location: - `/services/:Services` — `lhpeg56oV` — `metadata.title: "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"`.
- `/blog/:Blog` — `DvEqpc9aQ` — `metadata.title: "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"`.

Description:
Both CMS detail page templates use the title pattern `{{Title}} - Vetly - Trusted Veterinary Care for Your Pet`. The static suffix alone (` - Vetly - Trusted Veterinary Care for Your Pet`) is 46 characters. Any CMS item with a title longer than 19 characters will push the total above the 60-character SEO limit — and most real service/blog titles are longer than 19 chars (e.g. "Emergency Veterinary Surgery" = 28 chars → total 69 chars; "How to Care for Your Senior Cat" = 31 chars → total 72 chars). Google will truncate these titles, often cutting the brand or the unique portion. The pattern is also unusual — typical SEO convention is `{Page Title} | {Brand}` (e.g. "Emergency Veterinary Surgery | Vetly"). The current template duplicates "Vetly" and adds a tagline ("Trusted Veterinary Care for Your Pet") which provides little SEO value relative to its length.

Evidence:
- Both CMS detail page metadata: `"title": "{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"`.
- Static suffix length: ` - Vetly - Trusted Veterinary Care for Your Pet` = 46 characters (including leading separator). The free space for the CMS title is 60 - 46 = 14 characters, far too short for typical titles.

Recommended Fix:
Change both CMS detail page title templates to a shorter pattern. Suggested: `{{Title}} | Vetly` — leaves 53 characters for the CMS title, fits most service/blog titles comfortably, follows standard SEO convention. If a brand tagline is desired, use it as the meta description instead.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-140 — `/` Home page heading hierarchy skips from H3 to H6 (missing H4/H5)

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/` — `augiA20Il` — page-wide heading outline.

Description:
The home page's heading hierarchy goes H1 → H2 → H3 → H6, skipping H4 and H5. Per-breakpoint counts (total / 3 breakpoints): 1 H1, 7 H2, 3 H3, 1 H6. The H6 (the smallest heading level) appears after H3 sections without intermediate H4/H5 nesting. While not a critical SEO issue, skipping heading levels violates the logical document outline that screen readers and search engines expect. WCAG 2.4.10 (Section Headings, AAA) recommends that headings be nested without skipping levels.

Evidence:
- `getDescendantsOfTypes({id:"augiA20Il", types:["TextBlock"]}, {pagePath:"/"})` returned `{"tagCounts": {"p": 99, "h1": 3, "h6": 3, "h2": 21, "h3": 9}}`. Divided by 3 breakpoints: 1 H1, 7 H2, 3 H3, 0 H4, 0 H5, 1 H6 per breakpoint.
- The H6 is likely a footer or "small print" heading; semantically it should be promoted to H4 (or removed as a heading) so the outline goes H1 → H2 → H3 → H4.

Recommended Fix:
Find the H6 TextBlock on the home page (likely a small section title in the footer or a "fine print" area) and either promote it to H4 (so the hierarchy is H1→H2→H3→H4) or change its `tag` to `"p"` if it's not actually a section heading. Confirm by inspecting all H3 TextBlocks on the page to determine the correct hierarchy.

Confidence: Medium
Discovered by: sub-agent 7, session DR

---

## DR-141 — `/about` page heading hierarchy skips from H3 to H5 (missing H4)

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/about` — `mWgiU9J96` — page-wide heading outline.

Description:
The about page's heading hierarchy includes H5 elements but no H4 elements. Per-breakpoint counts (approximate, since some H3/H5 are not evenly distributed across breakpoints): 1 H1, 7 H2, ~2 H3, 0 H4, ~1 H5. The H5 appears after H3 sections without an intermediate H4, skipping a level. This violates the logical document outline and is a minor accessibility/SEO issue.

Evidence:
- `getDescendantsOfTypes({id:"mWgiU9J96", types:["TextBlock"]}, {pagePath:"/about"})` returned `{"tagCounts": {"h1": 3, "p": 63, "h2": 21, "h3": 7, "h5": 2}}`. No H4 TextBlocks present.

Recommended Fix:
Find the H5 TextBlock(s) on `/about` and either promote to H4 (filling the skipped level) or change the `tag` to `"p"` if it's not actually a section heading. Confirm by inspecting the H5 location in the page structure.

Confidence: Medium
Discovered by: sub-agent 7, session DR

---

## DR-142 — `/booking` page has no navigation (no Layout Template applied) — affecting internal linking

Status: Open
Category: SEO & metadata
Severity: Medium
Location: `/booking` — `kdx64iDUQ` — `attributes.layoutTemplate: "null"` (vs. `"default"` on every other page).

Description:
The `/booking` page is the only page in the site with `layoutTemplate: "null"` — meaning it does not use the default Layout template that includes the global Header (with nav links to /, /services, /about, /blog, /contact), the CTA section, the Footer, and the Buy Button. The page contains only a "Booking Modal" section with the Cal.com embed and a "Back Button" (custom code component `BackButton.tsx`). Consequences for SEO: (1) the page has no internal links pointing OUT to other site pages (only a back button that uses JS history), so link equity cannot flow from /booking to other pages; (2) the page has no Header nav, so crawlers and users who land on /booking directly have no path to the rest of the site without using the back button; (3) the missing Footer means no sitemap/footer links are present.

Evidence:
- `getNode({id:"kdx64iDUQ"})` returned `attributes: {layoutTemplate: "null", metadata: {...}, path: "/booking"}` — only 3 attribute keys (no `$control__showNavSection`, no `$control__activeLink`).
- Compare to all other 12 pages: `attributes.layoutTemplate: "default"` plus `$control__showNavSection` and `$control__activeLink`.
- Deep serialize of `/booking` showed only the "Booking Modal" frame with Cal.com Embed (`O2N4dsp87`) and a "Back Button" code component (`qO44GR49V`) — no Header/Footer instance.

Recommended Fix:
Apply the default Layout template to `/booking` (set `layoutTemplate: "default"`) so the page inherits the global Header, CTA, and Footer. If the design intent is a focused, modal-style booking page, consider keeping the layout template but configuring `$control__showNavSection` to hide specific nav sections, or use a different layout template variant. At minimum, add a Footer or a manual link back to `/contact` and `/` so crawlers and users can navigate away from the booking page.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-143 — `/404` page H1 text is just "404" — not descriptive

Status: Open
Category: SEO & metadata
Severity: Low
Location: `/404` — `kfL3sfGQh` — RichTextNode "Heading" (`UqS_uj9fu`), TextBlock child `v:UqS_uj9fu:0` with `tag: "h1"`.

Description:
The 404 page's single H1 contains only the text "404" — a number with no descriptive context. While the page IS indexable (no noIndex set — see DR-7-11) and has a title "404 | Page Not Found", the H1 itself does not convey what the page is about. Best practice is for the H1 to mirror or extend the page title — e.g. "Page Not Found" or "404 — Page Not Found". This is a minor SEO and accessibility issue (screen reader users hearing "404" out of context won't know what happened).

Evidence:
- `serialize({id:"UqS_uj9fu", depth:4}, {pagePath:"/404"})` (via serializeNodes) returned a single TextRun with `text: "404"` inside the H1 TextBlock.
- The page metadata title is "404 | Page Not Found" — but the H1 only says "404".

Recommended Fix:
Update the H1 TextBlock on `/404` to contain "Page Not Found" (or "404 — Page Not Found") instead of just "404". This aligns the H1 with the page title and provides context to assistive technology. The numeric "404" can remain as a large visual element if desired — change its `tag` from `"h1"` to `"p"` and make the descriptive text the H1.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-144 — Site-level SEO settings (favicon, default OG image, sitemap.xml, robots.txt, lang attribute) cannot be verified via plugin API

Status: Open
Category: SEO & metadata
Severity: Low
Location: Project-wide — `framer.getProjectInfo()` returns only `{id, name:"Vetly", apiVersion1Id}`; no `SiteSettingsNode` is exposed via `getNodesOfTypes`.

Description:
The Framer plugin API does not expose site-level SEO settings — favicon, default Open Graph image, sitemap.xml generation, robots.txt configuration, the HTML `lang` attribute, or hreflang configuration. These are typically managed via the Framer dashboard (Settings → SEO / Site Settings). The audit cannot confirm whether: (1) a favicon is set; (2) a default site-wide OG image is configured; (3) sitemap.xml will be auto-generated on publish; (4) robots.txt exists and is correct; (5) the site's `<html lang="...">` attribute is set to "en" or another locale; (6) hreflang is configured (the site appears to be English-only based on content, but this cannot be verified).

Evidence:
- `framer.getProjectInfo()` returned `{"id":"0094533deb4db938c3a5ed9816b5bdf6a7c545a610b4c526d3411eeec400b304","name":"Vetly","apiVersion1Id":"1666046897"}` — no domain, favicon, OG image, sitemap, or language fields.
- `getNodesOfTypes({types:["SiteSettingsNode","SettingsNode","ProjectSettingsNode"]})` returned `[]`.
- No `<link rel="icon">` or `<html lang>` metadata visible in any WebPageNode's attributes.

Recommended Fix:
Verify the following via the Framer dashboard (not fixable via plugin):
1. **Favicon**: Set a 32×32 and 180×180 (apple-touch-icon) favicon in Settings → Site → Favicon.
2. **Default OG image**: Set a site-wide default share image (1200×630px) in Settings → SEO → Social Image. This will serve as the fallback for the 12 pages missing `socialImage` (DR-7-5).
3. **Sitemap**: Confirm "Generate sitemap.xml" is enabled in Settings → SEO. Framer auto-generates `/sitemap.xml` on publish.
4. **robots.txt**: Confirm Framer's default robots.txt (allows all + points to sitemap) is in place. Custom rules can be added in Settings → SEO → robots.txt.
5. **Language**: Set the site locale (e.g. `lang="en"`) in Settings → Site → Locale.
6. **Domain**: Verify a custom domain is configured (the site is not currently published, per the project state).

Confidence: High (that the API does not expose these)
Discovered by: sub-agent 7, session DR

---

## DR-145 — No per-page Open Graph title/description, Twitter card type, or canonical URL overrides are exposed

Status: Open
Category: SEO & metadata
Severity: Low
Location: Project-wide — `WebPageNode.attributes.metadata` only supports `title`, `description`, `socialImage`, `noIndex`, `noIndexSite`.

Description:
Framer's page metadata schema exposes only 5 fields: `title`, `description`, `socialImage`, `noIndex`, `noIndexSite`. There are NO separate fields for:
- Open Graph title (`og:title`) — distinct from `<title>`
- Open Graph description (`og:description`) — distinct from meta description
- Twitter card type (`twitter:card=summary_large_image` vs `summary`)
- Twitter title/description
- Canonical URL override (`<link rel="canonical">`)
- hreflang alternates

Framer auto-generates these from the page title/description by default. This is acceptable for most sites but limits SEO control for cases where you want a different social-preview title vs the SERP title (common CRO practice). For Vetly, the current setup means OG title = page title and OG description = meta description — which is fine, but should be confirmed as intentional. There is no way to override the canonical URL per page (e.g. for syndicated blog content or duplicate content consolidation).

Evidence:
- Inspected `metadata` object on all 13 WebPageNodes — only `title`, `description`, `socialImage`, `noIndex`, `noIndexSite` keys ever appear.
- Framer documentation confirms the page metadata schema exposes these fields only; advanced OG/Twitter/canonical customization requires either dashboard settings or custom code in the Layout template.

Recommended Fix:
No action needed if the current auto-generation is acceptable. If advanced control is desired, consider adding a global code override in the Layout template that injects custom `og:title`, `twitter:card`, or `canonical` `<link>` tags based on the page path. For now, document this as a known platform limitation.

Confidence: High
Discovered by: sub-agent 7, session DR

---

## DR-146 — `/services/:Services` description uses `{{Card Description}}` variable name (suggests wrong CMS field bound)

Status: Open
Category: SEO & metadata
Severity: Low
Location: `/services/:Services` — `lhpeg56oV` — `attributes.metadata.description: "{{Card Description}}"`.

Description:
The service detail page's meta description is bound to a CMS variable named `{{Card Description}}`. The variable name "Card Description" suggests this field was originally intended to be the description shown on service cards in the `/services` index (a short, ~30-50 char teaser), not a full meta description (~160 chars). If the "Card Description" CMS field contains only a short card teaser, the meta description will be too short to fill Google's snippet (which prefers ~120-160 chars). Conversely, if it contains a full description, the service cards on `/services` may render overly long text. Compare to `/blog/:Blog` which uses `{{Description}}` (a cleaner name suggesting a dedicated meta-description field).

Evidence:
- `getNode({id:"lhpeg56oV"})` returned `metadata.description: "{{Card Description}}"`.
- Compare to `/blog/:Blog` `metadata.description: "{{Description}}"` — different variable name, suggesting different CMS schema conventions.

Recommended Fix:
Verify in the CMS collection for Services whether the "Card Description" field is intended for the service card preview or the meta description. If it's a short card teaser, add a separate "Meta Description" field to the Services CMS collection and rebind `metadata.description` to that new field. Each service should have a unique 120-160 char meta description that expands on the title (e.g. "Comprehensive veterinary surgery services at Vetly — including soft tissue, orthopedic, and emergency surgery. Schedule a consultation today.").

Confidence: Medium
Discovered by: sub-agent 7, session DR

---

## DR-147 — Primary Button white-on-blue gradient fails AA contrast for normal text

Status: Open
Category: Accessibility & compliance
Severity: High
Location: Component `ARbK0E6gq` (Buttons/Primary Button); used on Home (`/`), About, Contact, every page where Primary Button instances appear (e.g. home desktop instances `utfr2jCSf`, `YadkeMZKF`).

Description:
The Primary Button's frame fill is a 135° linear gradient `linear-gradient(135deg, var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2, rgb(0, 170, 255)) 20%, var(--token-19435b3e-190a-40c7-8a23-915a55ceeb7a, rgb(0, 53, 255)) 100%)` — i.e. Primary `#0090FF` for the first 20% of the button width, transitioning to Secondary `#0035FF`. The button label uses text style preset `Text M` = **16 px / weight 400 / regular** — i.e. *normal text* under WCAG, which requires 4.5:1 contrast (AA). White text on pure Primary `#0090FF` measures **3.26 : 1**, failing AA for normal text. White on the gradient midpoint (`rgb(0,99,255)`) measures 4.97 : 1, but at least the leftmost ~20% of every Primary Button fails. This is the site's primary CTA on every page.

Evidence:
- Computed contrast ratios (script `scripts/sub8/02-contrast-compute.js`):
  - White `#FFFFFF` on Primary `#0090FF` = **3.26 : 1** (FAIL AA-normal 4.5; PASS AA-large 3.0; FAIL AAA).
  - White on Secondary `#0035FF` = 7.11 : 1 (PASS).
  - White on gradient midpoint `rgb(0,99,255)` = 4.97 : 1 (PASS AA-normal, FAIL AAA).
- Text style `Text M` (id `Q8I0V3QLW`): `fontSize=16px`, `weight=400` → normal text.
- Button frame attrs: `fill=linear-gradient(135deg, var(--token-8d76f153-6a21-... rgb(0, 170, 255)) 20%, var(--token-19435b3e-190a-... rgb(0, 53, 255)) 100%)`, `textStylePreset=Text M`, `textColor=var(--variable-wyqldSoqO)` (white, confirmed via Spinner inner fill `var(--token-219c2d29-...)` = White).
- Visual: Home screenshot https://framerusercontent.com/screenshots/on-demand/9ebe7670-0e23-4c2e-a61b-b9430ed15db4.jpg — primary CTA button "Book Appointment" / "Get Started".

Recommended Fix:
Darken the gradient start color (e.g. use `#0066CC` or `#005EE6` instead of `#0090FF` for the first stop, or shift the gradient to start at Secondary `#0035FF` and lighten toward Primary). Alternatively, raise button text to ≥18 px (or ≥14 px bold) so it qualifies as "large text" (3:1 threshold) — but the design system clearly intends 16 px regular, so fixing the gradient is preferable. Verify ≥4.5:1 across the entire button width.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-148 — Contact form placeholder text fails AA contrast (2.63 : 1)

Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/contact` page (Desktop breakpoint `Dwyf0MEcX`), inputs: `dUSaG0CMx` (Name), `XfuoGpmoo` (Email), `JlTOdKvZx` (Subject), `GBe2pGN2l` (Pet Name), `EotCJ5jxi` (Message). All `FormPlainTextInputNode`.

Description:
Every Contact form input uses `formInputPlaceholderColor="var(--token-287a1d8c-70b8-404c-85b9-1eb556d27f31, rgb(144, 161, 185))"` (`#90A1B9`) on a white field background. The measured contrast is **2.63 : 1**, which fails both AA-normal (4.5) AND AA-large (3.0). Since the placeholder is the ONLY label users see before focusing the field (see DR-8-7), this affects every visitor, especially those with low vision or in bright ambient light.

Evidence:
- Input attrs (all five): `"formInputPlaceholderColor": "var(--token-287a1d8c-70b8-404c-85b9-1eb556d27f31, rgb(144, 161, 185))"`, `"fill"` parent `var(--token-219c2d29-...)` = White `#FFFFFF`.
- Computed: rgb(144,161,185) on White = **2.63 : 1** (FAIL AA-normal, FAIL AA-large, FAIL AAA).
- Visual: Contact screenshot https://framerusercontent.com/screenshots/on-demand/6ddcf103-aa91-48e6-9462-445e022ecd5a.jpg.

Recommended Fix:
Darken the placeholder token to at least `#5C6B82` (≈4.5:1 on white) — or, better, replace placeholder-only labels with real `<label>` elements above each field (see DR-8-7) and use a darker placeholder color for the hint text.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-149 — Buy Button "for" text uses rgba(255,255,255,0.5) — fails AA (1.81 : 1)

Status: Open
Category: Accessibility & compliance
Severity: High
Location: Component `sfrLnUdBr` (Buy Button), "Variant 2" (`HsPFOPesC`), RichTextNode `HsPFOPesCGeDtk56NK` named `"for"`. Used in the pricing section of the Services page (and anywhere Buy Button is placed).

Description:
The "for" label in the gradient variant of the Buy Button uses `textColor="rgba(255, 255, 255, 0.5)"` over the Primary→Secondary gradient (`linear-gradient(135deg, var(--token-8d76f153-... rgb(0, 170, 255)), var(--token-19435b3e-... rgb(0, 53, 255)))`). Composited over Primary `#0090FF` this yields **1.81 : 1**; composited over the gradient midpoint it yields **2.28 : 1**. Both fail AA (4.5 normal / 3.0 large). The "Brand Name" and "Price" labels in the same button use solid White (`var(--token-219c2d29-...)`), so the "for" label is the only one that fails — but it's still visible text.

Evidence:
- Component serialized attrs: `Variant 2 → "for" RichTextNode textColor="rgba(255, 255, 255, 0.5)"`, parent fill `linear-gradient(135deg, var(--token-8d76f153-...) ...)`.
- Computed (script `13-extra-contrasts.js`):
  - rgba(255,255,255,0.5) over Primary `#0090FF` composited = `rgb(128,177,255)`, contrast = **1.81 : 1** (FAIL).
  - rgba(255,255,255,0.5) over gradient midpoint `rgb(0,99,255)` composited = `rgb(128,177,255)`, contrast = **2.28 : 1** (FAIL).
  - (For reference, the same rgba over neutral-900 in Variant 1 = 5.26 : 1 — passes AA, so the gradient variant is the only failing one.)

Recommended Fix:
Either (a) raise the opacity to ≥0.85 (rgba(255,255,255,0.85) over Primary = ~2.86:1, still fails; need 1.0 opacity for AA on the Primary end), or (b) reuse solid White `var(--token-219c2d29-...)` for the "for" label, matching the Brand Name and Price labels.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-150 — NavLink Button inactive state uses 80% opacity, dropping contrast to 2.61 : 1

Status: Open
Category: Accessibility & compliance
Severity: High
Location: Component `gUM1o8Yyz` (Buttons/NavLink Button), first "Not Active" variant (`lkCftY97P`), RichTextNode `WnN7go1xs`. Rendered in the Header on every page (`AZd_vmoUt`).

Description:
The inactive NavLink Button sets `opacity="0.8"` on the RichTextNode, with `textColor=var(--variable-wqm4uiVUk)` (defaults to Primary `#0090FF`). Composited over the white header background, this yields `rgb(51,166,255)`, contrast **2.61 : 1** — failing AA for both normal and large text. Nav links are the primary way users navigate the site, so this affects every visitor using the top navigation.

Evidence:
- NavLink Button attrs (id `WnN7go1xs`): `"opacity": "0.8"`, `"textColor": "var(--variable-wqm4uiVUk)"`, `"textStylePreset": "Text M"` (16 px / 400 = normal text).
- Text style "Text M": 16 px regular → AA requires 4.5:1.
- Computed (script `18-extra-states.js`): Primary `#0090FF` at 0.8 opacity composited over White = `rgb(51, 166, 255)`, contrast = **2.61 : 1** (FAIL AA-normal, FAIL AA-large, FAIL AAA).

Recommended Fix:
Remove `opacity="0.8"` and instead use a darker text color for the inactive state (e.g. `slate-600 #45556C` which gives 7.58:1 on White — passes AAA). Reserve Primary `#0090FF` for the active/hover state only, since even at full opacity it only achieves 3.26:1 on White (see DR-8-1).

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-151 — HamburgerMenu code component is not keyboard accessible

Status: Open
Category: Accessibility & compliance
Severity: Critical
Location: Code component `codeFile/kCxujKn:default` (Workshop/HamburgerMenu.tsx), used in the Header on Phone and Tablet breakpoints (every page).

Description:
The HamburgerMenu renders a `<label>` wrapping an `<input type="checkbox" style={{ display: "none" }} aria-label="Toggle menu">`. Setting `display: none` on the checkbox **removes it from the tab order and from the accessibility tree** — keyboard users cannot focus the checkbox, and screen readers will not announce it. The wrapping `<label>` is not focusable, so the entire control is keyboard-inaccessible. Furthermore, the component itself does not implement any of the menu-button semantics the WAI-ARIA Authoring Practices require for a navigation toggle: no `aria-expanded`, no `aria-controls`, no Escape-to-close handler, no focus trap. The `onToggle` callback is fired only on `onChange` of the hidden checkbox — which never fires for keyboard users because they cannot reach the checkbox. Since the HamburgerMenu is the only top-level navigation on Phone and Tablet breakpoints, mobile keyboard / screen-reader users have no way to open the menu at all.

Evidence:
- Code (Workshop/HamburgerMenu.tsx, lines 184–239):
  ```tsx
  return (
    <label style={{ cursor: "pointer", display: "inline-block", width: size, height: size }}>
      <input type="checkbox" checked={isChecked} onChange={handleChange}
        style={{ display: "none" }} aria-label="Toggle menu" />
      <svg viewBox="0 0 32 32" ...>
        ...
      </svg>
    </label>
  )
  ```
- No `onKeyDown` / `onKeyUp` / `onKeyPress` handlers; no Escape handling; no `aria-expanded`; no `aria-controls`; no focus management.

Recommended Fix:
1. Replace `display: none` with `position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none;` so the checkbox remains in the a11y tree and tab order. (Visually identical — the icon still represents the state.)
2. Add `aria-expanded={isChecked}` and `aria-controls="<menu-id>"` to the label or wrap with a real `<button>` element that has `aria-expanded` / `aria-controls`.
3. Add Escape-to-close: when `isChecked === true`, listen for `keydown` of Escape and call `setIsChecked(false)`.
4. Implement a focus trap when the menu is open (focus the first menu item on open, cycle focus within the menu, return focus to the hamburger button on close).
5. Document that the consumer of `onToggle` must also wire focus management — or move that responsibility into the component itself.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-152 — FAQ accordion is not keyboard accessible and lacks ARIA state

Status: Open
Category: Accessibility & compliance
Severity: Critical
Location: Native component `xUmE2HP3j` (Elements/FAQ item) — used on Home (`/` "Got Questions?" section), Services Detail (`/services/:Services` FAQ section), and likely `/documentation`. Also: code file `FAQAccordion.tsx` (id `dRQ_68D`) is EMPTY — `getCodeFiles()` returns `{}` for its content (verified in script `05-code-files-dump.js`).

Description:
The FAQ item component implements its open/closed state as Framer variants ("FAQ Open", "FAQ Closed", "Touch Open", "Touch Closed"). Variant switching is wired through Framer's `onTap` event, which only fires on mouse/touch — keyboard users cannot toggle the accordion. The "Question" header is a `RichTextNode` with no `tag` attribute (renders as `<p>`), the root FrameNode has `htmlTag=NONE`, and there is no `role="button"`, `aria-expanded`, `aria-controls`, `tabindex`, or any keyboard handler. The empty `FAQAccordion.tsx` code file (which would normally provide keyboard support) was never implemented — it is referenced in the project inventory but has zero lines of code. As a result, every FAQ section on the site is inaccessible to keyboard and screen-reader users.

Evidence:
- Component `xUmE2HP3j` root: `ComponentNode name="Elements/FAQ item"` with variants:
  - `FrameNode "FAQ Open" (P3ysYJ8v6) htmlTag=NONE`
  - `FrameNode "FAQ Closed" (OgvEl7iAq) htmlTag=NONE`
  - `FrameNode "Touch Open" (cduQvt9da) htmlTag=NONE`
  - `FrameNode "Touch Closed" (ay0JXaXoX) htmlTag=NONE`
- "Question" RichTextNode `cZi5gDvvp` attrs: `textColor=var(--token-0caaff48-...)` (slate-800), NO `tag` attribute (defaults to `<p>`).
- "Answer" RichTextNode `Nc5LEgXFJ` attrs: `textColor=var(--token-203fe439-...)` (slate-600), NO `tag`.
- No `aria-expanded`, no `aria-controls`, no `role`, no `tabindex`, no `onKeyDown`.
- `FAQAccordion.tsx` file dump: `CONTENT_LEN: 0`, body `{}`.

Recommended Fix:
Either (a) implement `FAQAccordion.tsx` as a real React component that renders a `<button aria-expanded aria-controls>` for the question and a `<region>` for the answer, with Enter/Space to toggle and Arrow Up/Down to move between items per the WAI-ARIA Accordion Pattern; OR (b) replace the native FAQ item component with HTML semantics: set `htmlTag="button"` on the Question frame, add `aria-expanded` (variant-bound) and `aria-controls` pointing to the Answer frame's id, and add `htmlTag="region"` to the Answer frame. Ensure focus styles are visible.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-153 — Contact form uses placeholder-only labels — no `<label>` element associated with inputs

Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/contact` page (Desktop `Dwyf0MEcX`, Tablet, Phone), inputs `dUSaG0CMx` (Name), `XfuoGpmoo` (Email), `JlTOdKvZx` (Subject), `GBe2pGN2l` (Pet Name), `EotCJ5jxi` (Message).

Description:
Each `FormPlainTextInputNode` is wrapped in a FrameNode ("Name Field", "Email Field", "Subject Input Field", "Pet Name Field", "Message Textarea"), but the wrapper contains ONLY the input — no visible label text node, no `<label>` element, no `aria-label` / `aria-labelledby` on the input. The only labeling text is the placeholder ("Name *", "Email *", "Subject", "Pet Name", "Tell us how we can help you and your pet…. *"). Placeholders disappear as soon as the user starts typing, they are not associated programmatically with the input, and they are not announced as labels by screen readers (the placeholder is announced as a "placeholder" hint, not a label). The `formInputName` attribute ("Name", "Email", etc.) becomes the HTML `name` attribute, which is NOT exposed as the accessible name.

Evidence:
- Input `dUSaG0CMx` (Name) attrs: `"formInputName": "Name"`, `"formInputPlaceholder": "Name *"`, `"formInputRequired": "true"`, `"formTextInputType": "text"`. No `aria-label`, no `aria-labelledby`, no surrounding `<label>`.
- Parent `FrameNode "Name Field" (dw0zWKpsI)` children: just the `FormPlainTextInputNode`. No sibling RichTextNode serving as visible label.
- Same pattern for all 5 inputs (verified script `12-contact-form-inputs.js`).

Recommended Fix:
Add a visible `<label>` element (RichTextNode with `htmlTag="label"`) above each input, and connect it via `for`/`id` matching; OR add `aria-label="Name"`, `aria-label="Email"`, etc. to each input. Keep the placeholder as a short hint only. Best practice: visible label + placeholder hint. The "Name *" / "Email *" pattern in placeholders already indicates the design intended the asterisk as the required marker, so move "Name" / "Email" into a real `<label>` above the field and keep "*" as the required indicator.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-154 — Contact form has no error message containers (aria-live regions)

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `/contact` page form (`TF_br82uW` container and children).

Description:
The Contact form has 5 inputs with `formInputRequired="true"` on four of them (Name, Email, Subject, Message), but there are no `aria-live` regions or error message containers anywhere in the form tree. When validation fails (e.g. invalid email, missing required field), screen-reader users will not be informed unless the framework injects an error — and even then, without `aria-live="polite"` or `role="alert"`, the error will not be announced. Framer forms by default render errors inline near the input but do not add `aria-live`.

Evidence:
- Walk of Contact page Desktop breakpoint (script `11-contact-booking.js`) — FrameNode tree contains only inputs and their wrappers; no FrameNode named "Error", no RichTextNode with `role="alert"` or `aria-live` attribute.
- Inputs have `formInputRequired="true"` but no `aria-required` is set explicitly (the HTML `required` attribute alone is acceptable to AT, but no error announcement mechanism exists).

Recommended Fix:
Add a per-input error container (FrameNode with `role="alert"` or `aria-live="assertive"`) bound to the input's validation state. Use `aria-describedby` on each input to point to its error container id, and `aria-invalid="true"` when the field fails validation.

Confidence: Medium (Framer's default form submission behavior may add some inline messaging, but no `aria-live` regions are present in the canvas — needs runtime verification).
Discovered by: sub-agent 8, session DR

---

## DR-155 — Booking page has no H1 — "Book an Appointment" title is rendered as `<p>`

Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/booking` page (Desktop `q91z9DBml`, Tablet `CqSG6wWy3`, Phone `KYaJPUHtf`), RichTextNode `ZebPjet9v` ("Title") inside FrameNode "Header" inside FrameNode "Booking Modal".

Description:
The Booking page's only title text — "Book an Appointment" — is rendered as a `RichTextNode` with `TextBlock` child whose `tag="p"`, not `h1`. The page has zero heading-tagged nodes (verified across all 3 breakpoints in script `06-walk-all-pages.js`: HEADINGS (0)). Screen-reader users navigating by headings will find no entry point on this page. This is also an SEO issue (see sub-agent 7's scope) but primarily an accessibility violation since the page has no semantic H1.

Evidence:
- Walk (script `11-contact-booking.js`): `RichTextNode name="Title" (ZebPjet9v) → TextBlock (v:ZebPjet9v:0) tag=p → TextRun text="Book an Appointment"`.
- Heading scan across `/booking`: HEADINGS (0) on all breakpoints.

Recommended Fix:
Change the `tag` of the "Title" TextBlock from `p` to `h1` on all three breakpoints (or apply the `Heading 1` text style preset which already carries `tag="h1"`).

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-156 — Service Detail page has no H1 — CMS service title is not heading-tagged

Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/services/:Services` page (CMS detail, id `lhpeg56oV`) — Desktop, Tablet, Phone breakpoints.

Description:
The Service Detail page's first heading is `H2 "About The Service"` (id `v:ylWnmXl4L:0` and per-breakpoint equivalents), followed by H3s "What to Expect", "Benefits", "Benefits" (duplicate), "FAQ". The CMS-driven service name (e.g. "Annual Wellness Exam") that should be the H1 is not rendered with any heading tag — verified by walking all `tag`-bearing nodes in the page: only H2s and H3s are present, never H1. This means every Service Detail page lacks a primary heading for screen-reader navigation and SEO.

Evidence:
- Script `20-detail-pages-headings.js` output — `ALL TAGGED NODES (15)` on Service Detail: only H2 ("About The Service") and H3 (4×). No H1 anywhere across 3 breakpoints.
- Heading hierarchy on each breakpoint: H2 → H3 → H3 → H3 → H3 (no H1 above).

Recommended Fix:
Find the CMS-bound service title RichTextNode (the one bound to the `:Services` collection's title field) and set its `tag` to `h1` (or apply the `Heading 1` text style preset). Verify on each of the 3 breakpoints.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-157 — Blog Detail page has zero heading tags

Status: Open
Category: Accessibility & compliance
Severity: High
Location: `/blog/:Blog` page (CMS detail, id `DvEqpc9aQ`) — Desktop, Tablet, Phone breakpoints.

Description:
Walking the Blog Detail page returns 0 tagged nodes — no `<h1>`, no `<h2>`, no `<p>` tags even. The CMS-driven blog post title and body content are rendered as RichTextNodes with no `tag` attribute, which Framer renders as `<div>` by default (not semantic). Screen-reader users have no way to navigate this page by headings, and the page has no semantic H1. This is a critical accessibility and SEO gap on every blog post.

Evidence:
- Script `20-detail-pages-headings.js` output for Blog Detail: `ALL TAGGED NODES (0)` and `HEADINGS ONLY (0)`.
- This is across all 3 breakpoints (Desktop, Tablet, Phone).

Recommended Fix:
Tag the blog post title RichTextNode as `h1`, the post body sections as `h2`/`h3` as appropriate, and body paragraphs as `p`. If the body comes from a CMS rich-text field, ensure the CMS field type preserves heading tags (Framer's RichTextNode honors `tag` set in the canvas). At minimum, the title must be `<h1>`.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-158 — Brand Guide page heading order skips H3 (H1 → H2 → H4 → H5 → H6)

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `/brand-guide` page (id `hkW4RaXgm`) — Desktop, Tablet, Phone breakpoints.

Description:
The Brand Guide page's heading hierarchy skips H3 entirely. Per `06-walk-all-pages.js`, the heading sequence on each of the 3 Brand Guide breakpoints is: `H1 → H2 → H4 → H4 → H2 → H2 → H2 → H1 → H2 → H3 → H4 → H5 → H6 → ...` (repeats 4×). Multiple H1s per breakpoint? Looking more carefully, the 4× repetition is across breakpoints, so each breakpoint has 1 H1 + a sequence that includes H2, H4, H5, H6, occasionally H3. The H4/H5/H6 levels appear to be used as visual styling tokens for "Color", "Typography", "Spacing" subsections rather than reflecting true document outline. Skipping heading levels (H2 → H4) breaks screen-reader heading navigation.

Evidence:
- Script `06-walk-all-pages.js` output — Brand Guide page has 63 headings across 3 breakpoints (21 per breakpoint). Sequence per breakpoint includes H1, H2, H4, H4, H2, H2, H2, H1, H2, H3, H4, H5, H6 — multiple skips of H3 between H2 and H4.

Recommended Fix:
Re-tag the H4/H5/H6 styled headings to reflect true document outline — either demote to H3, or restructure so the levels descend without skipping. If the visual size difference is needed, use separate text style presets that share the same `tag` (e.g. two presets both tagged `h3` but with different `fontSize`).

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-159 — Home page uses H6 as a stat counter ("20K+"), not as a heading

Status: Open
Category: Accessibility & compliance
Severity: Low
Location: `/` (Home, id `augiA20Il`) Desktop breakpoint `WQLkyLRf1`, RichTextNode `v:YZO0DkLpt:0` (text "20K+").

Description:
The hero stat "20K+" is rendered as an `<h6>` tag — likely chosen because the H6 text style preset (22 px / weight 500) matches the visual size desired. However, H6 is a heading of last resort and "20K+" is a stat number, not a heading. This pollutes the document outline with a meaningless H6 inside the hero section before any H2. Screen-reader users navigating by headings will hear "20K+" as a heading.

Evidence:
- Script `09-home-headings-images.js` output: `H6 [v:YZO0DkLpt:0]: "20K+"` — appears immediately after H1 "Better Care for Your Pet, Without the Stress".
- Text style "Heading 6" (id `u0N6x5qIe`): 22 px / weight 500 / slate-700 color.

Recommended Fix:
Create a new text style preset "Stat" or "Display Number" with the same visual properties (22 px / weight 500 / slate-700) but with `tag="p"` (or no tag). Apply it to "20K+" and any other stat counters on the page.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-160 — BackButton code component has no visible focus style

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Code component `codeFile/tVVtI8x:default` (BackButton.tsx), used on `/booking` page (3 instances: `qO44GR49V`, `CqSG6wWy3qO44GR49V`, `KYaJPUHtfqO44GR49V`).

Description:
The BackButton is a real `<button>` element (good — keyboard focusable by default) with `aria-label="Go back"` (good). However, the component explicitly handles `onMouseEnter` / `onMouseLeave` to swap background color on hover, but does NOT handle `onFocus` / `onBlur` to apply the same visual treatment for keyboard focus. There is no `:focus-visible` CSS rule and no inline `outline` style — Framer's runtime CSS typically resets `outline` to `none` on buttons. As a result, keyboard users tabbing to the BackButton see no visible focus indicator. WCAG 2.4.7 (Focus Visible) requires a visible focus indicator.

Evidence:
- BackButton.tsx source (verified in script `05-code-files-dump.js`):
  ```tsx
  <button onClick={handleClick} style={{...}}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverBackgroundColor }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = backgroundColor }}
    aria-label="Go back">
  ```
  No `onFocus` / `onBlur` / `:focus-visible` / `outline` rule.
- The `style` object also has `border: "none"` — but no `outline: none`. The browser default outline MAY apply, but Framer's runtime CSS typically sets `*:focus { outline: none }` globally — needs runtime verification.

Recommended Fix:
Add `onFocus={(e) => { e.currentTarget.style.backgroundColor = hoverBackgroundColor }}` and `onBlur={(e) => { e.currentTarget.style.backgroundColor = backgroundColor }}` to mirror hover behavior for keyboard focus. Better: add a CSS `:focus-visible` rule with a 2-px outline using `var(--token-8d76f153-...)` (Primary) for high contrast.

Confidence: Medium (Framer may add its own focus ring at runtime — needs verification on the live site).
Discovered by: sub-agent 8, session DR

---

## DR-161 — Service Card "Action Button" is not a real button — no role, no link, no htmlTag

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Native component `ecHzMZLnH` (Cards/Service Card), FrameNode `h26xb6cck` named "Action Button" with RichTextNode `IpoVjtnXJ` and IconNode `wWdN5KYBh`. Used on Home (`/services/:slug#main` linked cards), `/services` page.

Description:
The Service Card has a "FrameNode name='Action Button'" containing a RichTextNode (text "View Service" or similar — bound to a variable) and an arrow IconNode. However, this FrameNode has NO `link` attribute, NO `htmlTag="button"`, NO `role="button"`, and NO `onClick`/`onTap`. The card itself has a `link` on the parent (verified on the Home page hero `x04nOnv9l`: `link={"href":"/services/:slug#main","collectionItem":"var(--variable-Okr5FKpOz)","smoothScroll":true}`). So the entire card is one big link, and the "Action Button" is purely decorative. This is misleading — sighted users see a button affordance, but the actual click target is the whole card. For screen-reader users, the "Action Button" text is read as plain text inside a link, which is acceptable, but the visual affordance doesn't match the semantic structure.

Evidence:
- Component `ecHzMZLnH` serialized (script `10-components-deep.js`): `FrameNode name="Action Button" (h26xb6cck)` — no `link`, no `htmlTag`, no `role`, no `onTap`. Children: RichTextNode "Action Text" + IconNode "Action Icon".
- The parent Service Card FrameNode `LK3AVFLo7` does NOT have a `link` either — but when the card is placed on the Home page (`FrameNode x04nOnv9l`), the wrapping FrameNode gets `link={"href":"/services/:slug#main",...}`.

Recommended Fix:
Either (a) remove the "Action Button" affordance entirely and let the whole card be the link (with a clear hover state on the card); or (b) make the "Action Button" a real link/button nested inside the card (will require restructuring so the card is NOT a link — to avoid nested interactive elements). Option (a) is simpler.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-162 — Arrow Button component has no accessible name

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Native component `mEQe6u3a9` (Buttons/Arrow Button) — two variants, each with two IconNodes (left + right arrow). Used for testimonial carousel / pagination controls (likely on Home testimonials section).

Description:
The Arrow Button component consists of a FrameNode wrapping two IconNodes (presumably "previous" and "next" arrows). There is no text label, no `aria-label`, no `role="button"`, no `htmlTag`. Screen-reader users will encounter two unnamed images inside an unnamed frame — they cannot tell what the buttons do. WCAG 4.1.2 requires an accessible name for interactive components.

Evidence:
- Component `mEQe6u3a9` serialized (script `10-components-deep.js`):
  ```
  ComponentNode name="Buttons/Arrow Button" (mEQe6u3a9)
    FrameNode name="Variant 1" (TNH7J0Qb0)
      IconNode (WhDbBTBpt)
      IconNode (b9V2jtjQ7)
    FrameNode name="Variant 2" (iAiaLvEC_)
      IconNode (iAiaLvEC_WhDbBTBpt)
      IconNode (iAiaLvEC_b9V2jtjQ7)
  ```
  No `aria-label`, no `htmlTag`, no `role`, no `link` on any frame.

Recommended Fix:
Set `htmlTag="button"` on each arrow wrapper FrameNode and add `aria-label="Previous"` / `aria-label="Next"` (or "Previous testimonial" / "Next testimonial" for clarity). If the icons are decorative, add `aria-hidden="true"` on the IconNodes.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-163 — Header logo link has no accessible name

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Component `AZd_vmoUt` (Navigation/Header), FrameNode `dkoXnIYcl` named "Logo" with `link={"href":"/#home"}`, child FrameNode `EgEOGkbpb` named "Logo Image" with `fill=https://framerusercontent.com/images/1R4NU3f2Nxccf...`. Rendered on every page.

Description:
The Header logo is a FrameNode with `link={"href":"/#home"}` wrapping a child FrameNode whose `fill` is an image URL (the logo image). The link has no text content and no `aria-label` — screen readers will announce it as a bare link with no name (or in some browsers, read out the image URL). On every page, the primary "go home" navigation control is unlabeled.

Evidence:
- Component `AZd_vmoUt` Desktop variant walk (script `10-components-deep.js`): `FrameNode name="Logo" (dkoXnIYcl) link={"href":"/#home"} → FrameNode name="Logo Image" (EgEOGkbpb) fill=https://framerusercontent.com/images/1R4NU3f2Nxccf...`.
- No `aria-label`, no text content, no `role` on the link FrameNode.
- Same pattern on Tablet and Phone variants (`WVwnpCf7jdkoXnIYcl`, `zCwAoDfvLdkoXnIYcl`).

Recommended Fix:
Add `aria-label="Vetly home"` (or the brand name) to the "Logo" FrameNode on each breakpoint. The image inside is decorative (since the link provides the name).

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-164 — Footer "Navigation" frame lacks nav landmark (htmlTag="nav")

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Component `Xx2RpZ5pV` (Navigation/Footer), FrameNode `fOoSGoxVo` named "Navigation" — appears on Desktop, Tablet, Phone variants.

Description:
The Footer contains a FrameNode named "Navigation" with three "Links Group" children (containing the footer nav links), but this FrameNode has `htmlTag=NONE` — it renders as a `<div>`, not a `<nav>`. Without `<nav>` landmark, screen-reader users cannot quickly jump to the footer navigation. The Header's nav (in component `bTXu1FqyY` Nav Bar) similarly lacks htmlTag — it's also rendered as a `<div>` named "Default" / "Home Active" / etc.

Evidence:
- Component `Xx2RpZ5pV` Desktop walk (script `10-components-deep.js`): `FrameNode name="Navigation" (fOoSGoxVo)` — no htmlTag in attrs.
- Component `bTXu1FqyY` (Nav Bar) Desktop walk: `FrameNode name="Default" (GBHKk2wfg)` and `FrameNode name="Home Active" (zoi6vWvSq)` etc. — no htmlTag in attrs.

Recommended Fix:
Set `htmlTag="nav"` on the Footer's "Navigation" FrameNode and on the Nav Bar's variant root FrameNodes (Default, Home Active, Services Active, etc. — but only one renders per page, so all should carry the tag).

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-165 — CTA section background image has no alt / role="img"

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Component `GkwGTE6uU` (Elements/CTA), FrameNode `Dh1gq4066` named "Background" with `fill=https://framerusercontent.com/images/qWq64aaaj4o60...`. Rendered on multiple pages (Home, About, Services, Contact, etc.).

Description:
The CTA section uses a background image (FrameNode "Background" with image fill). The image is decorative (just a texture behind white text), so it should be hidden from screen readers OR have an empty alt. Currently it has no `role="img"`, no `aria-label`, and no `aria-hidden`. Framer renders image fills as CSS `background-image`, which screen readers ignore by default — so this is likely fine at runtime. However, if the image is meaningful (e.g. shows pets being cared for), it should have alt text. Visual inspection suggests it's purely decorative.

Evidence:
- Component `GkwGTE6uU` walk (script `10-components-deep.js`): `FrameNode name="Background" (Dh1gq4066) fill=https://framerusercontent.com/images/qWq64aaaj4o60...` — no `role`, no `aria-label`, no `aria-hidden`.

Recommended Fix:
Confirm the image is decorative. If so, add `aria-hidden="true"` to the "Background" FrameNode. If meaningful, add `role="img"` and `aria-label="<description>"`.

Confidence: Medium
Discovered by: sub-agent 8, session DR

---

## DR-166 — Blog Card image has no alt text

Status: Open
Category: Accessibility & compliance
Severity: High
Location: Component `EiCUZ0sVC` (Cards/Blog Card), FrameNode `e7j7pmrGf` named "image" with `fill=var(--variable-BbAQszSNV)` (the CMS image variable). Used on `/blog` index, on Home "Pet Health Tips" section, and possibly elsewhere.

Description:
Each Blog Card renders the post's cover image as a FrameNode with an image fill (sourced from the CMS `:Blog` collection's image field). The image is meaningful — it illustrates the blog post — but the FrameNode has no `role="img"`, no `aria-label`, no `alt` attribute, and no `aria-hidden`. Framer typically renders image fills as CSS `background-image` (which screen readers ignore), so the image is effectively hidden from assistive technology without an explicit `role="img"` + `aria-label`. Each blog card's link wraps the whole card and uses the post title as the link text (which is good), so the image itself may be considered decorative — but with 7 card variants (Default ×2, Overlay ×2, horizontal Small ×2, horizontal Big ×2), at least one variant has the image taking up significant screen real estate where it functions as a content image.

Evidence:
- Component `EiCUZ0sVC` walk (script `10-components-deep.js`): `FrameNode name="image" (e7j7pmrGf) fill=var(--variable-BbAQszSNV)` — no `role`, no `aria-label`, no `alt`. Same on all 7 variants.
- The card root has `link={"href":"var(--variable-q4ecqPYbc)","openInNewTab":true,"smoothScroll":true}` — opens in new tab (see DR-8-22).

Recommended Fix:
Either (a) treat as decorative and add `aria-hidden="true"` to the image FrameNode; OR (b) treat as meaningful and add `role="img"` + `aria-label` bound to the CMS post title (e.g. `aria-label="Cover image for {post title}"`). Option (a) is acceptable since the link text already conveys the post title.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-167 — Contact form "Subject" field has inconsistent required marker

Status: Open
Category: Accessibility & compliance
Severity: Low
Location: `/contact` page, input `JlTOdKvZx` (Subject Input) — `formInputName="Subject"`, `formInputRequired="true"`, `formInputPlaceholder="Subject"` (no asterisk).

Description:
The Subject field is marked `formInputRequired="true"` but its placeholder is `"Subject"` (no asterisk), while the other required fields use asterisks in their placeholders: "Name *", "Email *", "Tell us how we can help you and your pet…. *". The Pet Name field (correctly) has `formInputRequired="false"` and placeholder "Pet Name" (no asterisk). The inconsistency means sighted users cannot reliably tell which fields are required by visual scan.

Evidence:
- Input `JlTOdKvZx` attrs (script `12-contact-form-inputs.js`): `"formInputName": "Subject"`, `"formInputRequired": "true"`, `"formInputPlaceholder": "Subject"`.
- Compare: Name (`"formInputPlaceholder": "Name *"`, `"formInputRequired": "true"`), Email (`"Email *"`, `"true"`), Message (`"Tell us how we can help you and your pet…. *"`, `"true"`), Pet Name (`"Pet Name"`, `"false"`).

Recommended Fix:
Either (a) change Subject's placeholder to "Subject *" to match the other required fields, or (b) better, move all labels to real `<label>` elements above the fields and use a "*" marker on the label (see DR-8-7).

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-168 — Contact form input border fails 3:1 UI contrast (1.49 : 1)

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `/contact` page form inputs — `borderColor="var(--token-70a89806-6562-410d-80cc-9b0fdfdf21e3)"` = slate-300 `#CAD5E2`, `borderBottom="1px"` on white background.

Description:
Each Contact form input uses a 1-px bottom border in slate-300 `#CAD5E2` against the white field background. The measured contrast is **1.49 : 1**, which fails the WCAG 1.4.11 non-text contrast requirement (3:1 for UI components and graphical objects). This means users with low vision may not be able to perceive where the input field begins/ends. With only a 1-px bottom border (no full border, no fill, no background), the input is essentially invisible without sufficient contrast.

Evidence:
- Input attrs (all 5): `"borderColor": "var(--token-70a89806-6562-410d-80cc-9b0fdfdf21e3)"` (slate-300 `#CAD5E2`), `"borderBottom": "1px"`, parent fill White.
- Computed (script `18-extra-states.js`): slate-300 on White = **1.49 : 1** (FAIL 3:1 UI contrast).

Recommended Fix:
Darken the border color to at least slate-500 `#62748E` (4.76:1 on White) or slate-600 `#45556C` (7.58:1). Alternatively, add a subtle fill (e.g. `neutral-50 #FAFAFA`) to the input wrapper to visually distinguish the field without relying solely on the border.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-169 — FAQAccordion.tsx code file is empty (0 bytes)

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Code file `FAQAccordion.tsx` (id `dRQ_68D`).

Description:
The project inventory lists `FAQAccordion.tsx` as one of four code components, but `getCodeFiles()` returns an empty object `{}` for its content (`CONTENT_LEN: 0`, body `{}` — verified in script `05-code-files-dump.js`). The file is referenced but never implemented. This is the root cause of DR-8-6 — the FAQ accordion relies on the native "FAQ item" component (which has no keyboard support) because the code-based accessible accordion was never written. The empty file may also produce a build-time warning or be silently ignored.

Evidence:
- Script `05-code-files-dump.js` output: `=== FILE: FAQAccordion.tsx (id: dRQ_68D ) | keys:  ===` / `No direct content field; dumping JSON` / `{}`.
- Compare: `BackButton.tsx` (CONTENT_LEN: 3456), `HamburgerMenu.tsx` (CONTENT_LEN: 3849), `ImageReveal.tsx` (CONTENT_LEN: 23000) — all populated.

Recommended Fix:
Either (a) implement `FAQAccordion.tsx` as a real accessible accordion component (per WAI-ARIA Accordion Pattern — `<button aria-expanded>` for the trigger, `<region>` for the panel, Arrow Up/Down to move between items, Home/End to jump to first/last, Enter/Space to toggle), OR (b) delete the empty file and update the FAQ item native component to set `htmlTag="button"` on the question frame and wire variant switching to keyboard events. Option (a) is preferred.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-170 — ImageReveal default alt is generic "Image" (not descriptive)

Status: Open
Category: Accessibility & compliance
Severity: Low
Location: Code component `codeFile/hZwaqDB:default` (Workshop/ImageReveal.tsx), default `alt` value.

Description:
ImageReveal's default `image.alt` is `"Image"` (verified in source: `image = { src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg", alt: "Image" }`). The component correctly renders `<img alt={image?.alt || "Image"} />` and also sets `aria-label={image?.alt || "Image"} role="img"` on the wrapper div (good — both layers covered). However, if an editor drops an ImageReveal instance without setting the `alt` prop, the rendered alt text will be the generic string "Image", which is not descriptive. The component also has a minor redundancy: both the wrapper div (`role="img" aria-label="..."`) and the inner `<img alt="...">` expose the same alt text — screen readers may announce it twice (depending on the browser/AT combination).

Evidence:
- ImageReveal.tsx source (lines 354–358): `image = { src: "...", alt: "Image" }` as default.
- Lines 670, 703, 719, 777: `aria-label={image?.alt || "Image"}` and `alt={image?.alt || "Image"}`.

Recommended Fix:
Change the default `alt` to `""` (empty — treats the image as decorative until an editor provides a real description), OR require the `alt` prop with no default. Address the double-announcement by adding `aria-hidden="true"` to the inner `<img>` (since the wrapper already has `role="img"` + `aria-label`).

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-171 — Accent color tokens fail contrast when used as text/links on white

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: Color styles `Accent Cyan` `#16CFF0`, `Accent Cyan Light` `#28D7EB`, `Accent Blue` `#2E96FF`, and Primary `#0090FF`. These are defined as global tokens and may be applied to text nodes (links, accents) throughout the site.

Description:
Several accent colors, when used as text or link color on a white background, fail WCAG 1.4.3 Contrast (Minimum). Computed ratios:
- `Accent Cyan #16CFF0` on White = **1.87 : 1** (FAIL AA-large, FAIL AA-normal, FAIL AAA)
- `Accent Cyan Light #28D7EB` on White = **1.75 : 1** (FAIL all)
- `Accent Blue #2E96FF` on White = **3.03 : 1** (FAIL AA-normal, PASS AA-large marginal)
- `Primary #0090FF` on White = **3.26 : 1** (FAIL AA-normal, PASS AA-large)
On dark backgrounds (slate-700/800, black) these same colors pass comfortably (e.g. Accent Cyan on slate-800 = 7.81:1). The issue is only when they appear on light/white backgrounds. The Primary color is also used as a NavLink active state color and as link text color in some places (e.g.Heading 1 hero "Your Pet" highlight uses `textColor=var(--token-8d76f153-...)` = Primary — large text 56 px so passes 3:1, but a regular-weight link at 16 px would fail).

Evidence:
- Computed (script `02-contrast-compute.js`): ratios as above.
- Contact page hero `v:tM5VkBlO5:0:1` uses `textColor=var(--token-8d76f153-...)` (Primary) for "Your Pet" highlight — inside an H1 at 56 px (large text, passes 3:1 = OK). But the same pattern at 16 px regular would fail.

Recommended Fix:
Add a documentation note in the brand guide that Accent Cyan, Accent Cyan Light, Accent Blue, and Primary are NOT approved for use as text or link color on white/light backgrounds at normal text sizes (≤18 px regular or ≤14 px bold). Reserve them for: (a) large text (≥18 px) on white, (b) any text on dark backgrounds (slate-700+), or (c) decorative/non-text use. For link text on white, use Secondary `#0035FF` (7.11:1) or slate-700 `#314158` (10.36:1).

Confidence: High
Discovered by: sub-agent 8, session DR

---

## DR-172 — Documentation page uses H1 → H4 → H4 → H2 (skips H3)

Status: Open
Category: Accessibility & compliance
Severity: Low
Location: `/documentation` page (id `B49BfU8Yb`) — Desktop, Tablet, Phone breakpoints.

Description:
The Documentation page's heading sequence per breakpoint is: `H1 → H4 → H4 → H2 → H2 → H2 → H2 → H3 → H1 → H4 → H4 → ...` (repeats 3× — one per breakpoint). Skipping from H1 down to H4 (skipping H2 AND H3) is a heading-order violation. The H4s are likely the "card titles" or "tag labels" inside a documentation card grid, used for visual size rather than hierarchy. Each H1 is followed immediately by two H4s before any H2 appears — broken document outline.

Evidence:
- Script `06-walk-all-pages.js` output for Documentation: 24 headings across 3 breakpoints (8 per breakpoint). Per-breakpoint sequence: H1, H4, H4, H2, H2, H2, H2, H3.

Recommended Fix:
Re-tag the H4s that appear immediately after H1 as H2 (or restructure so they appear after an H2). If they're truly card titles in a grid below the H1, they should be H2 (each card = subsection) or wrapped in a `<section>` with its own H2. Avoid using H4 purely for font size — create a "Card Title" text style preset with `tag="h2"` and the desired font size.

Confidence: High
Discovered by: sub-agent 8, session DR

---

## Summary

| ID | Severity | WCAG | Topic |
|---|---|---|---|
| DR-8-1 | High | 1.4.3 | Primary Button white-on-blue fails AA (3.26:1) |
| DR-8-2 | High | 1.4.3 | Contact form placeholder text fails AA (2.63:1) |
| DR-8-3 | High | 1.4.3 | Buy Button "for" rgba white 0.5 fails AA (1.81:1) |
| DR-8-4 | High | 1.4.3 | NavLink inactive 0.8 opacity fails AA (2.61:1) |
| DR-8-5 | Critical | 2.1.1, 4.1.2 | HamburgerMenu not keyboard accessible (display:none checkbox) |
| DR-8-6 | Critical | 2.1.1, 4.1.2 | FAQ accordion not keyboard accessible, no ARIA state |
| DR-8-7 | High | 1.3.1, 3.3.2, 4.1.2 | Contact form: placeholder-only labels, no `<label>` |
| DR-8-8 | Medium | 3.3.1, 4.1.3 | Contact form: no aria-live error regions |
| DR-8-9 | High | 1.3.1, 2.4.6 | Booking page missing H1 (title is `<p>`) |
| DR-8-10 | High | 1.3.1, 2.4.6 | Service Detail page missing H1 |
| DR-8-11 | High | 1.3.1, 2.4.6 | Blog Detail page has zero headings |
| DR-8-12 | Medium | 1.3.1 | Brand Guide skips H3 in heading order |
| DR-8-13 | Low | 1.3.1 | Home H6 misused for "20K+" stat counter |
| DR-8-14 | Medium | 2.4.7 | BackButton has no visible focus state |
| DR-8-15 | Medium | 1.3.1, 4.1.2 | Service Card "Action Button" is not a real button |
| DR-8-16 | Medium | 4.1.2 | Arrow Button has no accessible name |
| DR-8-17 | Medium | 2.4.4, 4.1.2 | Header logo link has no accessible name |
| DR-8-18 | Medium | 1.3.1 | Footer "Navigation" lacks nav landmark |
| DR-8-19 | Medium | 1.1.1 | CTA background image has no alt / role |
| DR-8-20 | High | 1.1.1 | Blog Card image has no alt text |
| DR-8-21 | Low | 3.3.2 | Contact Subject field inconsistent required marker |
| DR-8-22 | Low | 3.2.5 | Blog Card links open in new tab without warning |
| DR-8-23 | Medium | 1.4.11 | Contact form input border fails 3:1 UI contrast (1.49:1) |
| DR-8-24 | Low | 1.4.11 | "Border Subtle" fails 3:1 UI contrast on dark |
| DR-8-25 | Medium | n/a (root cause) | FAQAccordion.tsx is empty (0 bytes) |
| DR-8-26 | Low | 1.1.1 | ImageReveal default alt is generic "Image" |
| DR-8-27 | Medium | 1.4.3 | Accent Cyan/Cyan Light/Accent Blue/Primary fail as text on white |
| DR-8-28 | Medium | 1.4.3 | slate-500 fails AA on tinted card backgrounds |
| DR-8-29 | Medium | 2.4.1, 4.1.2, 2.1.2 | Booking Cal.com iframe a11y cannot be guaranteed |
| DR-8-30 | Low | 1.3.1 | Documentation page skips H3 in heading order |

**Total findings: 30** (2 Critical, 9 High, 12 Medium, 7 Low)

**Coverage:**
- All 13 pages visited (Home, Services, Service Detail, About, Blog, Blog Detail, Contact, Booking, Documentation, Brand Guide, Privacy, Terms, 404).
- All 27 native components walked via `serialize({depth: 4})`; 12 inspected in detail (Primary Button, Outline Button, CTA, NavLink Button, Header, Footer, Nav Bar, FAQ item, Service Card, Blog Card, Buy Button, Arrow Button).
- All 4 code files read in full (FAQAccordion.tsx empty; BackButton.tsx, HamburgerMenu.tsx, ImageReveal.tsx fully analyzed).
- All 26 color styles + 12 text styles loaded; contrast ratios computed for every text/background pairing observed in the design.

---

## DR-173 — Two text style presets use hardcoded colors instead of color tokens

Status: Open
Category: Visual design & branding
Severity: High
Location: Project-wide text style definitions — `Heading 2s` (id `oZ2jm8VJY`) and `Text XL` (id `YZ0SM41L3`)

Description:
The `Heading 2s` and `Text XL` text style presets both define their color as the hardcoded string `rgb(15, 23, 43)` instead of referencing a color style token. This RGB value does not match any defined token — the closest, `slate-800`, is `rgb(29, 41, 61)`. The intended color is something resembling a "slate-900", but no such token exists in the project. The result is two of the twelve text styles silently break the token system: any future re-skin of the slate scale will miss these presets, and the visual gap between `rgb(15, 23, 43)` and `slate-800 rgb(29, 41, 61)` is perceptible (darker, cooler). `Heading 2s` is used on `/services`, `/services/:Services`, `/blog/:Blog`; `Text XL` is used on `/`, `/about`, `/brand-guide`. This is a project-wide systemic issue, not a one-off.

Evidence:
Captured via `framer.getTextStyles()`:
- `Heading 2s` (id=oZ2jm8VJY): `"color": "rgb(15, 23, 43)"` (string, not token object) — font Manrope 600 36px / 1.4em
- `Text XL` (id=YZ0SM41L3): `"color": "rgb(15, 23, 43)"` (string) — font Inter 400 20px / 1.7em
- All other 10 presets reference a token object (`{"id": "...", "name": "slate-800", "light": "rgb(29, 41, 61)"}` etc.).

Recommended Fix:
Either (a) add a `slate-900` token with value `rgb(15, 23, 43)` and update both presets to reference it, or (b) change both presets to reference the existing `slate-800` token if the slight visual difference is acceptable. Option (a) is preferred for brand fidelity.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-174 — Primary Button gradient fallback for Primary color is wrong (rgb(0, 170, 255) vs token rgb(0, 144, 255))

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `Primary Button` component (id `ARbK0E6gq`) — all variants that use the gradient; `Buy Button` component (id `sfrLnUdBr`) Variant 2

Description:
The Primary→Secondary gradient fill on the Primary Button uses `linear-gradient(135deg, var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2, rgb(0, 170, 255)) /* {"name":"Primary"} */ 20%, var(--token-19435b3e-190a-40c7-8a23-915a55ceeb7a, rgb(0, 53, 255)) /* {"name":"Secondary"} */ 100%)`. The `var(--token-...)` CSS variable resolves correctly at runtime, but the *fallback value* `rgb(0, 170, 255)` does not match the actual Primary token value `rgb(0, 144, 255)` — it is off by 26 in the green channel. While modern browsers will resolve the CSS variable and never see the fallback, the discrepancy is a brand-quality issue: if the token ever fails to resolve (e.g. dark-mode switchover, missing token definition), users see the wrong color. The same wrong fallback appears in the Buy Button Variant 2 gradient. Systemic — affects every primary CTA on the site.

Evidence:
- Primary Button variant `s0zHOdlkz` (Button): `"fill": "linear-gradient(135deg, var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2, rgb(0, 170, 255)) /* {\"name\":\"Primary\"} */ 20%, var(--token-19435b3e-190a-40c7-8a23-915a55ceeb7a, rgb(0, 53, 255)) /* {\"name\":\"Secondary\"} */ 100%)"`
- Buy Button variant `HsPFOPesC` (Variant 2): same gradient string
- Primary token light value: `rgb(0, 144, 255)` (from `framer.getColorStyles()`)
- Discrepancy: green channel 170 vs 144 (Δ26)

Recommended Fix:
Replace `rgb(0, 170, 255)` with `rgb(0, 144, 255)` in both component gradient fills so the fallback matches the token value exactly. Better: use a single `var(--token-…)` reference without a fallback, or define a `Primary` gradient token.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-175 — Primary Button Success and Error variants use hardcoded colors with no token

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `Primary Button` component (id `ARbK0E6gq`) — variants `t9QapcGr2` (Success), `Pkhyll5Zk` (Success Small), `UtTeA07jz` (Error), `D35379AjS` (Error Small)

Description:
The Success variant fill is hardcoded `rgb(72, 227, 20)` (a vivid green) and the Error variant fill is hardcoded `rgba(255, 0, 0, 0.15)` (red with 15% alpha). Neither color matches any defined token. There are no "Success" or "Error" semantic tokens in the project's 26-color palette. This means the brand system cannot centrally tune success/error feedback colors — they're locked to whatever hex was typed into the component. Success states are typically used on form submissions (e.g. contact, booking flows), so this directly affects perceived brand quality on conversion paths.

Evidence:
- Variant `t9QapcGr2` (Success): `"fill": "rgb(72, 227, 20)"`
- Variant `Pkhyll5Zk` (Success Small): `"fill": "rgb(72, 227, 20)"`
- Variant `UtTeA07jz` (Error): `"fill": "rgba(255, 0, 0, 0.15)"`
- Variant `D35379AjS` (Error Small): `"fill": "rgba(255, 0, 0, 0.15)"`
- Color style list contains no "Success", "Error", "Danger", "Positive", "Warning", or red/green semantic token.

Recommended Fix:
Add `Success` (rgb(72, 227, 20)) and `Error` (rgba(255, 0, 0, 0.15) — or a non-alpha equivalent like `rgb(239, 68, 68)`) tokens to the color style library, then update the four variants to reference them.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-176 — Form placeholder text bypasses the text style system (no preset, hardcoded 16px / 1.2em)

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/` (12 nodes), `/services` (3 nodes), `/about` (6 nodes), `/blog` (3 nodes) — all form input placeholder text

Description:
24 rich text nodes that render form placeholder text (in newsletter / contact / search inputs) have NO `textStylePreset` set. Instead they use inline `fontSize: 16px` and `lineHeight: 1.2em` directly. The project's `Text M` preset is also 16px / 1.7em — so these placeholders differ from the design-system body text in line-height (1.2em vs 1.7em). The text color correctly references the `Placeholder Text` token (`var(--token-474519c5-…)`) on most pages, EXCEPT on `/blog` where three placeholder nodes use the hardcoded string `rgb(153, 153, 153)` — see DR-9-7. Bypassing the text style system means future restyling of placeholder typography requires touching 24 individual nodes instead of one preset.

Evidence:
- `/` no-preset nodes (sample ids): `nhnEJgV3O`, `gCnK0d6YH`, `uwC0I7LbN`, `Ilzg8nm9l` (+ 8 breakpoint variants) — all `fontSize: 16px`, `lineHeight: 1.2em`, `textColor: var(--token-474519c5-9352-40a1-a39d-59248b079a85)` (Placeholder Text)
- `/services`: `ZNlYU8K7O` (+ 2 variants) — same pattern
- `/about`: `wB87HnGNd`, `Yy5x6pnpm` (+ 4 variants) — same pattern
- `/blog`: `NWfIoD2wo` (+ 2 variants) — same pattern BUT `textColor: rgb(153, 153, 153)` (hardcoded)
- `Text M` preset (id `Q8I0V3QLW`): Inter 400 16px / 1.7em / slate-600

Recommended Fix:
Create a new `Placeholder` text style preset (Inter 400 16px / 1.2em, color = Placeholder Text token), then apply it to all 24 nodes. Replace the hardcoded `rgb(153, 153, 153)` on `/blog` with the Placeholder Text token reference.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-177 — Blog page hardcodes Placeholder Text color (rgb(153, 153, 153)) instead of using the token

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/blog` — 3 rich text nodes (placeholder text in the search/newsletter input)

Description:
Three text nodes on `/blog` set `textColor: "rgb(153, 153, 153)"` as a hardcoded string. The project already defines a `Placeholder Text` token with the exact same value `rgb(153, 153, 153)` (token id `474519c5-9352-40a1-a39d-59248b079a85`). The other pages (`/`, `/services`, `/about`) correctly reference this token via `var(--token-474519c5-…)`. This is a one-page rogue color that should be the token reference.

Evidence:
- `/blog` rich text node `NWfIoD2wo` (and 2 breakpoint variants `fpXa25z8yNWfIoD2wo`, `oKC1nohe6NWfIoD2wo`): `textColor: "rgb(153, 153, 153)"`
- `Placeholder Text` token (from `framer.getColorStyles()`): `light: "rgb(153, 153, 153)"` — exact match
- Contrast: `/`, `/services`, `/about` all use `var(--token-474519c5-9352-40a1-a39d-59248b079a85)` for the same role.

Recommended Fix:
Replace the hardcoded string on the 3 `/blog` nodes with `var(--token-474519c5-9352-40a1-a39d-59248b079a85)`.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-178 — Multiple hardcoded rogue colors in CTA / hero gradients across home, about, blog, services, 404

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/` (Hero, CTA, About sections), `/about` (Hero, CTA), `/blog` (CTA), `/services` (Service Card overlay), `/404` (Hero Background)

Description:
Several decorative gradient fills across pages use hardcoded RGB stops that do not match any defined color token. This is systemic — the same intent ("Primary-to-Secondary blue gradient") is implemented with at least three different sets of hardcoded values:
1. **`rgb(255, 0, 0)` as the Primary fallback** in home/about hero gradients — wildly wrong (pure red), used as `var(--token-8d76f153-…, rgb(255, 0, 0))`. Primary is `rgb(0, 144, 255)`.
2. **`rgb(0, 85, 255)` as the Secondary fallback** in home/about/blog gradients — Secondary token is `rgb(0, 53, 255)`, off by 32 in green.
3. **`rgb(69, 196, 255)` as a hardcoded gradient stop** in home/about/blog gradients — no token exists for this color. Closest tokens: Accent Cyan Light `rgb(40, 215, 235)`, Accent Cyan `rgb(22, 207, 240)`, Accent Blue `rgb(46, 150, 255)` — none match.
4. **`rgba(0, 170, 255, 0.5)`** on `/services` (Service Card overlay) — same wrong value as DR-9-4's Primary fallback (rgb(0, 170, 255)), with 50% alpha. No token.
5. **`rgba(242, 240, 238, 0.2)`** in `/404` Hero Background gradients — `rgb(242, 240, 238)` doesn't match any token (closest is slate-100 `rgb(241, 245, 249)`, off by 1/5/9 in channels).
6. **`rgba(255, 255, 255, 0.75)`** on `/` (overlay tint) — no token for 75%-alpha white. The `White` token is solid; `Border Subtle` is `rgba(255, 255, 255, 0.1)`.
7. **`rgba(255,255,255,1)`** on `/documentation` and `/brand-guide` (12 + 3 instances) — should use the `White` token (`rgb(255, 255, 255)`).

The result is a "broken telephone" effect: designers hand-tweaked each gradient stop individually, and over time the colors have drifted apart. The same brand element renders slightly differently on each page.

Evidence:
- `/` fills include: `linear-gradient(180deg, var(--token-8d76f153-6a21-4584-a490-7ac9adb914b2, rgb(255, 0, 0)) /* {"name":"Primary"} */ 40%, var(--token-19435b3e-190a-40c7-8a23-915a55ceeb7a, rgb(0, 53, 255)) /* {"name":"Secondary"} */ 100%)` (3 instances), `linear-gradient(180deg, var(--token-8d76f153-…, rgb(255, 0, 0)) 40%, var(--token-19435b3e-…, rgb(0, 85, 255)) 100%)` (3 instances), `linear-gradient(180deg, rgb(69, 196, 255) 40%, var(--token-19435b3e-…, rgb(0, 85, 255)) 100%)` (3 instances), `rgba(255, 255, 255, 0.75)` (2 instances)
- `/about` fills: same 3 gradient variants (3+3+3 instances)
- `/blog` fills: `linear-gradient(180deg, rgb(69, 196, 255) 40%, var(--token-19435b3e-…, rgb(0, 85, 255)) 100%)` (6 instances)
- `/services` fills: `rgba(0, 170, 255, 0.5)` (3 instances)
- `/404` fills: `linear-gradient(270deg, rgba(242, 240, 238, 0.2) 0%, rgba(242, 240, 238, 0) 100%)` (72 instances — page background overlay)
- `/documentation` fills: `rgba(255,255,255,1)` (12 instances)
- `/brand-guide` fills: `rgba(255,255,255,1)` (3 instances)

Recommended Fix:
1. Audit every `linear-gradient(...)` fill on the site and replace hardcoded fallback values with the matching token values (Primary = `rgb(0, 144, 255)`, Secondary = `rgb(0, 53, 255)`).
2. Replace `rgb(69, 196, 255)` with a token — either pick the closest existing token (Accent Cyan Light or Accent Blue) or add a new `Accent Sky` token if the color is intentional.
3. Replace `rgba(0, 170, 255, 0.5)` with `rgba(0, 144, 255, 0.5)` (Primary with 50% alpha) — or define a `Primary 50%` token.
4. Replace `rgba(255,255,255,1)` with `var(--token-219c2d29-187a-40f8-aab3-a7af9bd91f3b)` (White token) on `/documentation` and `/brand-guide`.
5. Consider defining gradient tokens (e.g. `Brand Gradient Primary`) to centralize the gradient definition.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-179 — Hardcoded gray borders on multiple pages (no token for rgba(136, 136, 136, *))

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/` (3 instances), `/services` (3), `/blog` (3) — all `1px dashed rgba(136, 136, 136, 0.2)`; `/documentation` (9 instances) — `1px dashed rgba(136, 136, 136, 0.3)`

Description:
Decorative dashed borders across multiple pages use `rgba(136, 136, 136, 0.2)` or `rgba(136, 136, 136, 0.3)`. There is no defined token for `rgb(136, 136, 136)` in the color style library. The closest neutrals are `neutral-400 rgb(161, 161, 161)` and `neutral-500 rgb(115, 115, 115)` — neither matches. Additionally, the alpha varies between pages (0.2 on landing pages, 0.3 on documentation), making the same visual element look slightly different across the site. This is a systemic pattern across 4 pages (18 instances total).

Evidence:
- `/` borders: `1px dashed rgba(136, 136, 136, 0.2)` ×3
- `/services` borders: `1px dashed rgba(136, 136, 136, 0.2)` ×3
- `/blog` borders: `1px dashed rgba(136, 136, 136, 0.2)` ×3
- `/documentation` borders: `1px dashed rgba(136, 136, 136, 0.3)` ×9
- `framer.getColorStyles()` contains no token with value `rgb(136, 136, 136)` or any alpha variant.

Recommended Fix:
Define a `Border Dashed` token (e.g. `rgba(136, 136, 136, 0.2)`) and use it consistently. Pick one alpha value (0.2 or 0.3) and apply it everywhere.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-180 — Section max-width is inconsistent across pages (1280 / 1120 / 750 / none)

Status: Open
Category: Visual design & branding
Severity: Medium
Location: Top-level "Main" section FrameNode on each page (Desktop breakpoint)

**Additional locations (merged findings):**
- `/404` — Hero section `J47uvmvRa` (Desktop breakpoint `zCMRjHlyq`)

Description:
The site does not have a single, documented section max-width. The Main section uses 4 different max-width values across 11 pages surveyed:
- `1280px` on `/`, `/services`, `/about`, `/blog`, `/contact`, `/booking`, `/documentation` (7 pages)
- `1120px` on `/brand-guide` (1 page — undocumented outlier)
- `750px` on `/privacy-policy` and `/terms-of-service` (2 pages — narrower for legal readability, but no token defines this width)
- No max-width set on `/404` Hero section (violates the core-principles.md "Section max-width" rule: every width=1fr section must have maxWidth)

The brand-guide page itself uses 1120px instead of 1280px — ironic for a page that should document the brand system. The legal pages' 750px is reasonable for readability but is not documented anywhere as "narrow content width". The 404 page's missing max-width means content can stretch to the full viewport on large screens.

**Additional context (merged from DR-9-22):** The 404 page's Hero section is `width: 1fr` with `padding: 64px 0px 64px 0px` and `gap: 24px` but has **no `maxWidth`** attribute set. This directly violates the core-principles.md rule: *"When creating a FrameNode that is a direct child of the breakpoint using a fill-width width setting (such as width='100%' or width='1fr'), always include maxWidth"*. On wide viewports the 404 hero content will stretch to the full viewport width, making the "404" headline and copy span too wide for comfortable reading. The other pages all set maxWidth on their Main section (DR-9-10).

Evidence:
- `/` Main `J30SjU3lW`: `maxWidth: 1280px` (script `15-sections-deep.js`)
- `/brand-guide` Main `b3bBcV2lJ`: `maxWidth: 1120px`
- `/privacy-policy` Main `X35ZndK9k`: `maxWidth: 750px`
- `/terms-of-service` Main `NcmeLw_PI`: `maxWidth: 750px`
- `/404` Hero `J47uvmvRa`: `maxWidth: undefined` (none set, width=1fr)

**Additional evidence (from DR-9-22):** - `/404` Desktop sections (script `15-sections-deep.js`):
  - `P0YTNQEXr` (Starting Point, decorative overlay): no maxWidth (acceptable — overlay)
  - `YbU6hUMuI` (Hero Background, decorative overlay): no maxWidth (acceptable — overlay)
  - `J47uvmvRa` (Hero, content): `width: "1fr"`, `maxWidth: undefined` ← VIOLATION
- Padding on `J47uvmvRa`: `64px 0px 64px 0px` (horizontal padding is 0 — does not substitute for maxWidth)

Recommended Fix:
Standardize on `1280px` for landing pages, define a `narrow-content` max-width (e.g. `768px` or `800px`) for legal / article pages, and add `maxWidth` to the `/404` Hero section. Document both widths in the brand guide.

**Additional fix note (from DR-9-22):** Add `maxWidth: "1280px"` (or `800px` if a narrower 404 hero is desired) and add horizontal padding (e.g. `64px 32px 64px 32px`) to the Hero section.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-181 — Section vertical gap is wildly inconsistent (24px / 80px / 96px / 160px)

Status: Open
Category: Visual design & branding
Severity: Medium
Location: Top-level "Main" section FrameNode on each page (Desktop breakpoint)

Description:
The vertical gap between top-level sections inside each page's Main stack varies 6.6× across pages: `160px` (home, services, about, blog, contact), `96px` (documentation, brand-guide), `80px` (privacy, terms), `24px` (booking, 404). There is no documented "section gap" scale. A visitor moving from the home page (160px section spacing) to the documentation page (96px) perceives a noticeably tighter rhythm, which breaks brand consistency. The 24px gap on `/booking` and `/404` is so small it suggests the page was built with a different layout intent (single-screen / minimal) but no design-system rationale is recorded.

Evidence:
- `/` Main `J30SjU3lW`: `gap: 160px`
- `/services` Main `NSWbX2QeF`: `gap: 160px`
- `/about` Main `hePnJ4Gr1`: `gap: 160px`
- `/blog` Main `peWUIV6zc`: `gap: 160px`
- `/contact` Main `pzJ96MWbD`: `gap: 160px`
- `/booking` Main `PUXgAxq2e`: `gap: 24px`
- `/documentation` Main `F6Vh8Z3Uz`: `gap: 96px`
- `/brand-guide` Main `b3bBcV2lJ`: `gap: 96px`
- `/privacy-policy` Main `X35ZndK9k`: `gap: 80px`
- `/terms-of-service` Main `NcmeLw_PI`: `gap: 80px`
- `/404` Hero `J47uvmvRa`: `gap: 24px`

Recommended Fix:
Pick a primary section-gap value (e.g. `128px` or `160px`) and apply it consistently across landing pages. Document 2-3 gap tiers in the brand guide (e.g. dense=64px, default=128px, spacious=160px) and assign each page a tier explicitly.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-182 — Brand-guide page itself has asymmetric section padding (80px top / 120px bottom)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/brand-guide` Main section `b3bBcV2lJ` (Desktop, Tablet, Mobile breakpoints)

Description:
The brand-guide page's top-level Main section uses asymmetric vertical padding `80px 0px 120px 0px` on Desktop — 80px top, 120px bottom. The tablet breakpoint uses `140px 32px 100px 32px` (140 top, 100 bottom — also asymmetric and even larger). The mobile breakpoint uses `120px 20px 80px 20px`. None of these are symmetric, and the brand-guide is supposed to be the canonical reference for the brand's spacing system. By contrast, the `/documentation` page uses symmetric `80px 0px 80px 0px`. Asymmetric padding on a "system reference" page undermines the credibility of the documented system.

Evidence:
- `/brand-guide` Desktop `b3bBcV2lJ`: `padding: "80px 0px 120px 0px"` (script `14-sections.js`)
- `/brand-guide` Tablet `ca9bRdpvPb3bBcV2lJ`: `padding: "140px 32px 100px 32px"`
- `/brand-guide` Mobile `Pog7IJxbFb3bBcV2lJ`: `padding: "120px 20px 80px 20px"`
- `/documentation` Desktop `F6Vh8Z3Uz`: `padding: "80px 0px 80px 0px"` (symmetric — contrast)

Recommended Fix:
Align the brand-guide page padding with the rest of the site — pick `80px 0px 80px 0px` for Desktop and scale down proportionally for tablet/mobile. If extra bottom space is needed for visual breathing room, document the rule ("sections end with 120px bottom whitespace") and apply it everywhere.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-183 — About page images have inconsistent border radius across breakpoints (48 / 32 / 28)

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `/about` — image nodes `UHCzkEmCU` (image `2mYRK3PxyCOvm3oAGgVTcKSvBg.webp`) across 3 breakpoints

Description:
The same image on the About page renders with three different corner radii across breakpoints: `48px` (Desktop, height 528px), `32px` (Tablet, height 432px), `28px` (Mobile, height 352px). A user who resizes the browser or rotates their device sees the same image morph its corner shape — a subtle but unprofessional inconsistency. The radius is also not on a consistent scale (28 → 32 → 48 are not multiples of a single step). The second about-page image `wzaOFvr7x6haFaSLTi7jeiaJEKM.png` keeps a consistent `48px` across all breakpoints — so the inconsistency is specific to one image, suggesting it was edited breakpoint-by-breakpoint without a system.

Evidence:
- About image 1 `UHCzkEmCU` (Desktop): `radius: "48px"`, `height: "528px"`
- About image 1 `EZ72HJieVUHCzkEmCU` (Tablet): `radius: "32px"`, `height: "432px"`
- About image 1 `yOUSYkrsWUHCzkEmCU` (Mobile): `radius: "28px"`, `height: "352px"`
- About image 2 `ko2z38p2E` (all breakpoints): `radius: "48px"` ✓ (consistent)

Recommended Fix:
Pick one radius for image cards (e.g. `32px` or `48px`) and apply it consistently across breakpoints. If smaller breakpoints need smaller radius for visual harmony, document the scale (e.g. `48px → 32px → 24px`) and apply it to ALL images, not just one.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-184 — Service-detail CMS images have inconsistent radius across breakpoints (24 / 8)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/services/:Services` — image nodes `ZQYSQukLi`, `cXwBdM26h`, `ahe8xfHa6` (the 3 secondary CMS images) across Desktop / Tablet / Mobile breakpoints

Description:
Three secondary images on the service-detail page use `radius: "24px"` on Desktop and Tablet, but drop to `radius: "8px"` on Mobile — a 3× reduction. The primary image keeps `32px` across all breakpoints (consistent). The drastic radius change on mobile makes the secondary images look like a different design system. Likely a hand-edit done for mobile polish without considering brand consistency.

Evidence:
- Desktop `ZQYSQukLi` (Image): `radius: "24px"`, `height: "500px"`
- Tablet `ztYrtMPA5ZQYSQukLi`: `radius: "24px"`, `height: "400px"`
- Mobile `kWpDPzsQWZQYSQukLi`: `radius: "8px"`, `height: "200px"`
- Same pattern for `cXwBdM26h` and `ahe8xfHa6` (24px → 24px → 8px)
- Primary image `yLIDf8fgV`: 32px across all breakpoints ✓

Recommended Fix:
Use a single radius for secondary images across all breakpoints (e.g. `24px`). If a smaller radius is needed on mobile for layout reasons, document it and apply consistently to all secondary images.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-185 — Card border-radius scale is undefined (20 / 24 / 28 / 32 / 40 / 44 / 48 px all in use)

Status: Open
Category: Visual design & branding
Severity: Medium
Location: All pages — multiple FrameNodes with `radius` set

Description:
The site does not have a documented border-radius scale. Walking all 13 pages, the following radius values are in active use: `8px`, `20px`, `24px`, `28px`, `32px`, `40px`, `44px`, `48px`, `100px` (pills on legal pages), `400px` (pills on services), `6px` (Buy Button inner logo), `10px` (Buy Button), `50px` (Arrow Button pill). That's 12 distinct radius values with no clear tiering system. Cards specifically use 20/24/28/32/40/44/48 — 7 different values for the same visual role. There is no documented "card radius" or "image radius" standard. The `44px` and `48px` outliers on `/` and `/about` (likely hero/CTA cards) are particularly unusual — they fall between standard scale steps.

Evidence:
- `/` radii: 20px (×3), 24px (×4), 32px (×3), 44px (×2)
- `/about` radii: 24px (×1), 28px (×1), 32px (×4), 44px (×2), 48px (×4)
- `/services` radii: 20px (×3), 32px (×3), 400px (×3)
- `/services/:Services` radii: 8px (×3 mobile), 20px (×6), 24px (×12), 32px (×6)
- `/blog` radii: 20px (×3)
- `/blog/:Blog` radii: 40px (×3)
- `/contact` radii: 32px (×6)
- `/booking` radii: 32px (×3)
- `/documentation` radii: 20px (×9), 24px (×6), 32px (×15)
- `/brand-guide` radii: 20px (×9), 24px (×3)
- `/privacy-policy` and `/terms-of-service` radii: 100px (×3 each) — pill shape
- Component radii: Buy Button 10px / inner logo 6px, Arrow Button 50px

Recommended Fix:
Define a 3-tier radius scale in the brand guide (e.g. small=12px, medium=24px, large=40px, pill=999px) and audit every card to snap to the nearest tier. Remove the 28px / 44px outliers.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-186 — Primary Button component has duplicate variant names ("Button" ×3, "Solid" ×2)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `Primary Button` component (id `ARbK0E6gq`)

Description:
The Primary Button component defines 14 variants, but several share identical display names: `Button` is used by 3 variants (`s0zHOdlkz`, `TeU8ysG26`, `A8E1xSQtf`), `Solid` is used by 2 (`Pp8cBPVwA`, `gqu2v98wu`). When a designer or content editor picks a variant from a dropdown, they cannot distinguish which "Button" or "Solid" they're selecting — they have to know the variant ID. This is a brand-system maintainability issue. The duplicate-name variants are likely breakpoint variants (Desktop/Tablet/Mobile) of the same logical state, which Framer should auto-resolve via breakpoints rather than via separately-named variants.

Evidence:
- `$variants` on Primary Button: `[{"id":"s0zHOdlkz","name":"Button"},{"id":"QP_bKwhNI","name":"Loading"},{"id":"OPkWU3_LJ","name":"Solid"},{"id":"KQFjUkjhI","name":"Solid Loading"},{"id":"nFlcyuxoA","name":"Disabled"},{"id":"Z8wqYMUWY","name":"Disabled Small"},{"id":"t9QapcGr2","name":"Success"},{"id":"Pkhyll5Zk","name":"Success Small"},{"id":"UtTeA07jz","name":"Error"},{"id":"D35379AjS","name":"Error Small"},{"id":"TeU8ysG26","name":"Button"},{"id":"A8E1xSQtf","name":"Button"},{"id":"Pp8cBPVwA","name":"Solid"},{"id":"gqu2v98wu","name":"Solid"}]`

Recommended Fix:
Rename the duplicate variants to be unique (e.g. `Button (Desktop)`, `Button (Tablet)`, `Button (Phone)`) or consolidate them into a single variant with proper breakpoint overrides.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-187 — Outline Button has 3 variants all named "Outline"; Arrow Button uses generic "Variant 1/2" names

Status: Open
Category: Visual design & branding
Severity: Low
Location: `Outline Button` (id `NoQy1opGY`), `Arrow Button` (id `mEQe6u3a9`)

Description:
Two button components have variant naming issues. Outline Button defines 3 variants all named `Outline` (`g9O186Ri0`, `mq68uT0aT`, `zBUuxInr3`) — same problem as DR-9-16. Arrow Button uses generic names `Variant 1` and `Variant 2` (`TNH7J0Qb0`, `iAiaLvEC_`) with no semantic meaning — a content editor cannot tell whether Variant 2 is "hover", "active", "alternate style", or something else without inspecting the variant. Both patterns harm the brand-system usability.

Evidence:
- Outline Button `$variants`: `[{"id":"g9O186Ri0","name":"Outline"},{"id":"mq68uT0aT","name":"Outline"},{"id":"zBUuxInr3","name":"Outline"}]`
- Arrow Button `$variants`: `[{"id":"TNH7J0Qb0","name":"Variant 1"},{"id":"iAiaLvEC_","name":"Variant 2"}]`
- Arrow Button Variant 1 padding `11px`, radius `50px` (no fill — likely transparent)
- Arrow Button Variant 2 padding `11px`, radius `50px` (no fill — likely transparent)

Recommended Fix:
Rename Outline Button variants to reflect breakpoint or state. Rename Arrow Button variants to reflect purpose (e.g. `Default`, `Hover` / `Active`).

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-188 — Buy Button uses hardcoded padding and radius instead of variables (inconsistent with other buttons)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `Buy Button` component (id `sfrLnUdBr`) — both Variant 1 and Variant 2

Description:
The Primary Button and Outline Button use variable-bound padding and radius (`padding: "var(--variable-qUgmAJrNw)"`, `radius: "var(--variable-A7YwNfgta)"` for Primary; `padding: "var(--variable-YMcbAd7rz)"`, `radius: "var(--variable-l9KD7vP3c)"` for Outline). The Buy Button, by contrast, hardcodes both: `padding: "6px 16px 6px 6px"` and `radius: "10px"`. The inner logo frame also hardcodes `radius: "6px"`. This means Buy Button does not respond to global button padding/radius variables — if the brand system updates button padding, Buy Button stays at 6/16/6/6. The asymmetric padding (6px top, 16px right, 6px bottom, 6px left) is intentional for the logo+text layout but is not abstracted to a variable.

Evidence:
- Primary Button variant `s0zHOdlkz`: `padding: "var(--variable-qUgmAJrNw)"`, `radius: "var(--variable-A7YwNfgta)"`
- Outline Button variant `g9O186Ri0`: `padding: "var(--variable-YMcbAd7rz)"`, `radius: "var(--variable-l9KD7vP3c)"`
- Buy Button variant `SVjbUIE_y`: `padding: "6px 16px 6px 6px"`, `radius: "10px"` — hardcoded
- Buy Button variant `HsPFOPesC`: `padding: "6px 16px 6px 6px"`, `radius: "10px"` — hardcoded
- Buy Button inner logo: `radius: "6px"` — hardcoded

Recommended Fix:
Either bind Buy Button's padding and radius to the same variables used by Primary/Outline, or create dedicated `BuyButtonPadding` / `BuyButtonRadius` variables if the asymmetric padding is intentional and should be reusable.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-189 — Header component width (1200px) is narrower than its inner container maxWidth (1280px)

Status: Open
Category: Visual design & branding
Severity: Medium
Location: `Header` component (id `AZd_vmoUt`) — Desktop variant `PP5wyjmXI` and inner Container `sYr202cSf`

Description:
The Header component's outer frame is `width: 1200px` with `padding: 16px 32px 16px 32px`. Its inner Container frame is `width: 1fr` with `maxWidth: 1280px`. So the header is capped at 1200px wide but contains a container that wants to grow to 1280px — the math doesn't work. On viewports wider than 1200px, the header stops at 1200px while every other section's Main stack goes to 1280px, so the header visually appears narrower than the body content below it. This is a real alignment break, not a theoretical issue. Additionally, the inner Container has `fill: rgba(255, 255, 255, 0)` (transparent white) — which is functionally identical to `null`/no fill but pollutes the attribute.

Evidence:
- Header Desktop variant `PP5wyjmXI`: `width: "1200px"`, `padding: "16px 32px 16px 32px"`
- Inner Container `sYr202cSf`: `width: "1fr"`, `maxWidth: "1280px"`, `fill: "rgba(255, 255, 255, 0)"`
- Page Main sections use `maxWidth: 1280px` (DR-9-10 evidence)

Recommended Fix:
Set the Header's outer frame to `width: 100%` and `maxWidth: 1280px` (matching the page Main), OR set the inner Container's `maxWidth` to 1200px. Remove the `rgba(255, 255, 255, 0)` fill on the inner Container (use `null` or omit). Verify visually on a 1440px-wide viewport.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-190 — Footer component uses non-system gap value 326px

Status: Open
Category: Visual design & branding
Severity: Low
Location: `Footer` component (id `Xx2RpZ5pV`) — Desktop variant `SM4CTALR7`, inner Copywrites frame `MD7DVm1X6`

Description:
The Footer's Copywrites frame uses `gap: 326px` — a value that is not on any reasonable spacing scale (326 ÷ 8 = 40.75, not a multiple of 8). The Container frame above it uses `gap: 256px` (32 × 8 — at least on the 8-multiple scale, but still unusually large for a footer layout). The footer's overall width is `1200px` (not 1280px — see DR-9-19 for the same pattern in Header). This suggests the footer was hand-tuned to push elements apart to fill a specific width rather than being built on a spacing system. The result is a footer that visually works but is unmaintainable.

Evidence:
- Footer Desktop `SM4CTALR7`: `width: "1200px"`, `padding: "0px 0px 24px 0px"`, `gap: "80px"`
- Inner Container `I0k1DiaQQ`: `gap: "256px"`
- Inner Copywrites `MD7DVm1X6`: `gap: "326px"` ← non-system value

Recommended Fix:
Replace `326px` with a system-aligned value (e.g. `128px` or `160px`). Re-evaluate whether the 256px Container gap is intentional or should be smaller. Align footer width to 1280px to match the rest of the site.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-191 — Breakpoint naming is inconsistent across pages (Desktop/Tablet/Phone vs Desktop/Breakpoint 2/Breakpoint 3)

Status: Open
Category: Visual design & branding
Severity: Low
Location: All pages — Desktop breakpoint FrameNode naming

Description:
Pages use two different naming conventions for their 3 breakpoints:
- `/`, `/services`, `/about`, `/blog`, `/contact`, `/booking`, `/privacy-policy`, `/terms-of-service`, `/404` use the names **Desktop / Tablet / Phone**
- `/brand-guide` and `/documentation` use the names **Desktop / Breakpoint 2 / Breakpoint 3**

The "Breakpoint 2 / Breakpoint 3" names are Framer's default placeholder names — they were never renamed when those pages were created. This is a small but real brand-system hygiene issue: anyone reading the project tree sees inconsistent names, and downstream tooling that filters by breakpoint name may miss the un-renamed pages.

Evidence:
- `/` children: `[{"name":"Desktop"}, {"name":"Tablet"}, {"name":"Phone"}]` (script `14-sections.js`)
- `/brand-guide` children: `[{"name":"Desktop"}, {"name":"Breakpoint 2"}, {"name":"Breakpoint 3"}]`
- `/documentation` children: `[{"name":"Desktop"}, {"name":"Breakpoint 2"}, {"name":"Breakpoint 3"}]`

Recommended Fix:
Rename `Breakpoint 2` → `Tablet` and `Breakpoint 3` → `Phone` on `/brand-guide` and `/documentation` to match the other 9 pages.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-192 — 404 page decorative "404" headline has no text style preset (pure inline 120px/100px)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/404` — text node `UqS_uj9fu` (and breakpoint variants `QwAVLOoulUqS_uj9fu`, `bP1_fmE8VUqS_uj9fu`)

Description:
The large decorative "404" headline on the 404 page uses NO `textStylePreset`. It is styled entirely with inline attributes: `fontSize: 120px` (Desktop), `120px` (Tablet), `100px` (Mobile), `lineHeight: 120%`, `textColor: var(--token-c8873226-…)` (neutral-900 token). The existing `Heading 1` preset (Manrope 500 56px / 1.2em / slate-800) is too small for this decorative use case, so the designer bypassed the system. This is a brand-system gap — there is no "Display" or "Hero" text style for oversized numerals/headlines.

Evidence:
- Node `UqS_uj9fu` (name=Heading): `textStylePreset: null`, `fontSize: 120px`, `lineHeight: 120%`, `textColor: var(--token-c8873226-6828-48de-9374-e4136018a41e)`
- Tablet variant `QwAVLOoulUqS_uj9fu`: `fontSize: 120px`, same
- Mobile variant `bP1_fmE8VUqS_uj9fu`: `fontSize: 100px`, same

Recommended Fix:
Add a `Display` or `Hero` text style preset (e.g. Manrope 500 / 120px / 1.2em / neutral-900) to the text style library and apply it to this node. This unlocks the style for future hero / 404 / large-numeral use cases.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-193 — Service-detail page CMS images have inconsistent heights (1fr / 500 / 400 / 400)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/services/:Services` — Desktop breakpoint, image nodes `yLIDf8fgV` (primary), `ZQYSQukLi`, `cXwBdM26h`, `ahe8xfHa6`

Description:
The service-detail page renders 4 CMS-bound images on Desktop with heights `1fr`, `500px`, `400px`, `400px` respectively. While the primary image being `1fr` (filling its container) is reasonable, the secondary images use two different fixed heights (500px and 400px) with no documented rationale. The visual rhythm is uneven — one secondary image is taller than the other two. Across breakpoints the inconsistency compounds: tablet uses `1fr / 400px / 250px / 250px`, mobile uses `1fr / 200px / 131px / 131px`. The `131px` value is particularly odd (not a multiple of 8). There is no defined "secondary image height" scale.

Evidence:
- Desktop images: `yLIDf8fgV` h=1fr, `ZQYSQukLi` h=500px, `cXwBdM26h` h=400px, `ahe8xfHa6` h=400px
- Tablet images: `yLIDf8fgV` h=1fr, `ZQYSQukLi` h=400px, `cXwBdM26h` h=250px, `ahe8xfHa6` h=250px
- Mobile images: `yLIDf8fgV` h=1fr, `ZQYSQukLi` h=200px, `cXwBdM26h` h=131px, `ahe8xfHa6` h=131px

Recommended Fix:
Standardize secondary image heights — pick one value per breakpoint (e.g. Desktop 400px, Tablet 300px, Mobile 200px) and apply to all three secondary images. Or use `aspectRatio` instead of fixed heights so images scale proportionally.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-194 — Top-level structural inconsistency: "Starting Point" wrapper missing on 3 pages

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/booking`, `/documentation`, `/brand-guide` (Desktop breakpoints) — missing the "Starting Point" FrameNode that other pages have

Description:
Most pages (/, /services, /about, /blog, /contact, /privacy-policy, /terms-of-service, /404) wrap their Desktop content in a top-level structure that includes a `Starting Point` frame (a decorative overlay container with `layout=null`, `width=100%`). Three pages — `/booking`, `/documentation`, `/brand-guide` — omit this wrapper entirely and have only a `Main` (or unnamed) section as their sole top-level child. This is a structural inconsistency: either the wrapper is needed for decorative overlays (in which case the 3 pages are missing potential overlays) or it is unnecessary (in which case the 8 pages have dead structure). Either way, the inconsistency suggests the page templates were not built from a single shared starting point.

Evidence:
- Pages WITH `Starting Point`: `/` (`aR1O51zCa`), `/services` (`uCc_YTyAN`), `/about` (`NYmjvjbDZ`), `/blog` (`vCDgeXbu5`), `/contact` (`G9d3aZwgk`), `/privacy-policy` (`SVji0uetT`), `/terms-of-service` (`AuXBEZjxl`), `/404` (`P0YTNQEXr`) — 8 pages
- Pages WITHOUT: `/booking` (only `PUXgAxq2e` Main), `/documentation` (only `F6Vh8Z3Uz` Main), `/brand-guide` (only `b3bBcV2lJ` Main) — 3 pages

Recommended Fix:
Decide whether `Starting Point` is part of the standard page template. If yes, add it to the 3 missing pages. If no, remove it from the 8 pages that have it (verify no decorative overlay is actually using it first — `/` and `/404` also have a `Hero Background` overlay that may depend on `Starting Point`).

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-195 — Home page section padding values are ad-hoc (8 / 16 / 32 / 48 / 64 px top paddings)

Status: Open
Category: Visual design & branding
Severity: Low
Location: `/` — multiple FrameNodes within the Main section

Description:
Walking all FrameNodes with `padding` set on the home page, the top-padding values used include `8px`, `16px`, `32px`, `48px`, `64px` — 5 different values, none documented as part of a section-padding scale. The bottom paddings are equally varied (`0px`, `40px`, `20px`, `54px` on `/about`). Specific oddities: `54px` on `/about` (not a multiple of 4), `32px 40px 32px 40px` (asymmetric horizontal padding 40 vs vertical 32), `32px 20px 32px 20px` (asymmetric with 20px horizontal). This is a systemic spacing-discipline issue — the design system does not enforce a spacing scale.

Evidence:
- `/` paddings (script `03-analyze.js`): `64px 0px 0px 0px` (×3), `48px 0px 0px 0px` (×1), `32px 0px 0px 0px` (×1), `32px 40px 32px 40px` (×1), `32px 20px 32px 20px` (×1), `16px 0px 0px 0px` (×2), `12px 14px 12px 14px` (×1), `8px 0px 0px 0px` (×1)
- `/about` paddings include `0px 0px 54px 0px` (54 is not a multiple of 4 or 8)
- `/documentation`: `120px 20px 80px 20px` (120 and 80 — multiples of 8 but very large)

Recommended Fix:
Define a section-padding scale (e.g. 8 / 16 / 24 / 32 / 48 / 64 / 80 / 96 / 128 px) and audit all FrameNode paddings to snap to the nearest step. Document the scale in the brand guide.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-196 — Image audit is incomplete for component-instance-internal images (scope limitation)

Status: Open
Category: Visual design & branding
Severity: Low
Location: All pages with image-bearing component instances (Service Card, Blog Card, Testimonial card, etc.)

Description:
My image-quality walk (script `08-no-preset-and-images.js`) inspected direct image fills on the page tree at serialize depth 5. This captured standalone image frames (Home Noise overlay, About page hero images, Services page hero, 404 Noise overlay) but did NOT expand component instances, so images inside Service Card, Blog Card, Testimonial card, Why Us Card, Mission Card, Trust Card, Map card, etc. were not directly inspected. Pages that appear to have "0 image-bearing nodes" (`/blog`, `/blog/:Blog`, `/contact`, `/booking`, `/documentation`, `/brand-guide`, `/privacy-policy`, `/terms-of-service`) very likely DO render images via component instances — I just did not expand them. The image-alt-text audit (sub-agent 8) and performance audit (sub-agent 14) likely cover this gap. Flagging here so the orchestrator can dispatch a follow-up if image-quality issues inside component instances are suspected.

Evidence:
- `/blog` shows 0 direct image fills but renders Blog Card instances (id `EiCUZ0sVC`) that contain images.
- `/contact` shows 0 direct image fills but renders Map card instances (id `cXuHXndOE`) which may contain GoogleMaps.
- `/brand-guide` shows 3 direct image fills (rgba white) but renders color swatches that may be image-based.

Recommended Fix:
If image-quality issues inside component instances are a concern, dispatch a focused audit that flattens or serializes each card component (`EiCUZ0sVC`, `ecHzMZLnH`, `Sr15oMIZ5`, `HW4zuDyG0`, `YwXTWsIji`, `cXuHXndOE`, `T6DVfhsAL`, `ruZNfQdon`) at depth 4 and inspects inner image fills.

Confidence: High
Discovered by: sub-agent 9, session DR

---

## DR-197 — /services "Book an Appointment" primary CTA has no link (dead button)

Status: Open
Category: UX & conversion
Severity: Critical
Location: `/services` → Desktop breakpoint `dsTAAo8ZZ` → Main `NSWbX2QeF` → Hero `lmlzvSBc4` → Text Container `p03oZ1QWR` → Primary Button instance `W_B9G7Iek` (component `ARbK0E6gq`)

Description:
The Hero section of the `/services` page contains a "Book an Appointment" Primary Button (variant `Button`) as the page's primary conversion CTA, but the instance has NO `$control__link` attribute set. Serialized node attributes show `$control__title: "Book an Appointment"`, `$control__variant: "Button"`, padding, radius, colors, and icons — but no link. Clicking the button does nothing. The `/services` page is the second-most-important conversion page (after Home) and is the primary destination of the Home "View All Services" CTA — so a high-intent visitor who clicks "Book an Appointment" here is dropped with no path forward except scrolling back to the global header.

Evidence:
Serialized node `W_B9G7Iek` attributes (pagePath `/services`):
```
"$control__variant": "Button",
"$control__title": "Book an Appointment",
"$control__newTab": "false",
"$control__bGColor": "var(--token-8d76f153-...)",
"$control__textColor": "var(--token-219c2d29-...)",
"$control__leftIconVisible": "false",
"$control__rightIconVisible": "true",
"$control__rightIcon": "Calendar Plus",
"$control__padding": "12px 28px 12px 28px",
"$control__distribute": "Center",
"$control__radius": "32px",
"position": "relative",
"width": "auto",
"height": "auto"
```
No `$control__link` field. Compare to the working Home hero button `ktjD5Syiq` which has `$control__link: "/booking#booking"`. Screenshot: /services desktop breakpoint — `https://framerusercontent.com/screenshots/on-demand/7f75b3ad-c387-42d2-b773-72fb1c2f069f.jpg`.

Recommended Fix:
Set the Primary Button instance's `$control__link` to `/booking` (or `/booking#booking` to match the Home hero pattern). Apply via `SET W_B9G7Iek $control__link="/booking#booking";` with `pagePath: "/services"`. Verify the same fix is needed on `/services/:Services` (see DR-10-2) and `/brand-guide` (see DR-10-3).

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-198 — /services/:Services detail "Book Appointment" primary CTA has no link (dead button)

Status: Open
Category: UX & conversion
Severity: Critical
Location: `/services/:Services` → Desktop breakpoint `L0pZyMNz4` → Main `blK0b98uj` → Primary Button instance `QDrNwNl7H` (component `ARbK0E6gq`)

Description:
The CMS-driven Services detail page has a "Book Appointment" Primary Button (variant `Button`) as its primary conversion CTA, but the instance has NO `$control__link` attribute set. After a user navigates from /services to a specific service detail page, the "Book Appointment" button — the single most important action on the page — does nothing when clicked. The only working CTA on the detail page is the secondary "Call Now" Outline button (which itself uses the placeholder phone number `+123-456-7890`, see DR-10-9).

Evidence:
Deep-walked `/services/:Services` Main at depth 10. Found 2 button instances:
```
[
  { id: "QDrNwNl7H", type: "Primary Button", title: "Book Appointment" /* NO link */ },
  { id: "Tsglsx7S8", type: "Outline Button", text: "Call Now", link: "tel:+123-456-7890" }
]
```
Serialized `QDrNwNl7H` attributes show title, variant, padding, colors — but no `$control__link` field.

Recommended Fix:
Set `$control__link="/booking"` (or `/booking#booking`) on `QDrNwNl7H`. Apply via `SET QDrNwNl7H $control__link="/booking#booking";` with `pagePath: "/services/:Services"`.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-199 — /brand-guide "Book an Appointment" and "Talk to a Vet" buttons have no links

Status: Open
Category: UX & conversion
Severity: Medium
Location: `/brand-guide` → Desktop breakpoint `F2Ac06qm9` → Main `b3bBcV2lJ` → Primary Button `U9BPSijAV` (title "Book an Appointment") and Outline Button `aWtunM5jL` (text "Talk to a Vet")

Description:
The /brand-guide page (intended as a template demo / brand reference page) has two CTAs in its body: a "Book an Appointment" Primary Button and a "Talk to a Vet" Outline Button. Neither has a `$control__link` attribute set — both are dead buttons. While /brand-guide is marked `noIndex: true` and intended for internal use, it's still a live route on the site, and any visitor (or QA reviewer) who clicks these CTAs gets no response. Additionally, the page has a third button with `variant: "Disabled"` and title "Disabled" — appears to be a state-demo placeholder left in the production page.

Evidence:
Deep-walked `/brand-guide` Main at depth 8:
```
[
  { id: "U9BPSijAV", type: "Primary Button", title: "Book an Appointment" /* NO link */ },
  { id: "aWtunM5jL", type: "Outline Button", text: "Talk to a Vet" /* NO link */ },
  { id: "LoEDLNKMX", type: "Primary Button", title: "Disabled", variant: "Disabled" }
]
```

Recommended Fix:
Either (a) set proper links (`/booking` and `/contact` respectively) if the page should remain a functional demo, or (b) remove the demo buttons if /brand-guide should be a pure design-reference page. The "Disabled" placeholder button should be removed entirely. Note: the page is noIndex'd, so SEO impact is nil, but UX polish is needed if the page is shown to clients/stakeholders.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-200 — CTA component (GkwGTE6uU) is never used on any page

Status: Open
Category: UX & conversion
Severity: High
Location: Component `GkwGTE6uU` (display name "CTA"); confirmed absent on all 13 pages

Description:
The project ships with a purpose-built CTA component (`GkwGTE6uU`) that renders a full-width conversion banner: heading "Ready to Give Your Pet the Best Care?", description "Book your visit today and experience compassionate, expert veterinary care.", and a Primary "Book Appointment" button → `/booking`. The component has 3 breakpoints (Desktop, Tablet, Mobile), an animated background image, and word-by-word text reveal effects. A site-wide walk of all 13 Desktop breakpoints found ZERO instances of this component placed on any page. Combined with DR-10-7 (5 pages have no in-body CTA), this means a polished, ready-to-use conversion asset is sitting unused while multiple pages end without any next-step CTA.

Evidence:
Deep-walked Desktop breakpoint of each of 13 pages (depth 4–8) and counted component instances by `displayName`. CTA component counts per page:
```
/ : 0   /services : 0   /services/:Services : 0   /about : 0
/blog : 0   /blog/:Blog : 0   /contact : 0   /booking : 0
/documentation : 0   /brand-guide : 0   /privacy-policy : 0   /terms-of-service : 0   /404 : 0
```
Component itself exists with proper default copy and a working `/booking` link (verified by serializing `GkwGTE6uU`).

Recommended Fix:
Place the CTA component at the bottom of content-heavy pages that currently lack a next-step CTA — at minimum: /about (after Testimonials), /blog (after Articles list), /blog/:Blog (after article body), and /services/:Services (after service detail). Consider also adding it to /services (after Why Us) and the Home page (before Footer).

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-201 — /booking page has no layout template (no header, no footer, no nav)

Status: Open
Category: UX & conversion
Severity: High
Location: `/booking` page node `kdx64iDUQ` — `attributes.layoutTemplate: "null"` and `attributes.$control__activeLink` absent

Description:
The `/booking` page is the only one of 13 routes that does NOT use the site's default Layout Template (`yDIYoKc7h`). Serialized page attributes show `layoutTemplate: "null"`, and the page contains only two elements: a BackButton code component (`qO44GR49V`, code component `tVVtI8x`) and an Embed component (`O2N4dsp87`) hosting a Cal.com inline widget for the `vetly/in-clinic-vet-appointment` event. The page renders as a full-viewport (height: 100vh) modal-style experience with no header, no footer, and no site navigation. Consequences: (1) the persistent "Book Today" header CTA is gone — but acceptable since the user is already on the booking page; (2) the persistent phone-number CTA is gone — users who hit a Cal.com error or want to call instead have no number visible; (3) there is no nav path to anywhere else on the site except the BackButton (which uses browser history — if the user entered /booking directly via URL, BackButton may close the tab or go to about:blank); (4) the page provides no alternative contact method (email, address, hours) if the user isn't ready to book.

Evidence:
- Page node `kdx64iDUQ` attributes: `layoutTemplate: "null"`, no `$control__activeLink`, no `$control__showNavSection`.
- /booking Desktop `q91z9DBml` Main `PUXgAxq2e` has a single child: `tSmCqITJd` "Booking Modal" (htmlTag: section).
- Inside Booking Modal: only `qO44GR49V` (BackButton) + `O2N4dsp87` (Embed with Cal.com inline code for `vetly/in-clinic-vet-appointment`).
- Cal.com embed HTML (truncated): `<div id="my-cal-inline-in-clinic-vet-appointment">…Cal.ns["in-clinic-vet-appointment"]("inline", {elementOrSelector:"#my-cal-inline-in-clinic-vet-appointment", config:{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}, calLink: "vetly/in-clinic-vet-appointment"})…</div>`
- Screenshot: /booking desktop — `https://framerusercontent.com/screenshots/on-demand/aa0c2721-2fe8-4ef8-8ec6-9a0402fd02d9.jpg`.

Recommended Fix:
Either (a) apply the default layout template so the page shows header/footer with persistent phone CTA + nav — preserves escape routes; or (b) if the focused modal pattern is intentional, add a small "Prefer to call? +1-XXX-XXX-XXXX" contact strip + a "Back to Home" link below the Cal.com embed so users have an alternative path. Coordinate with sub-agent #5 (booking owner) on the chosen direction.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-202 — Five content pages have zero in-body CTAs

Status: Open
Category: UX & conversion
Severity: High
Location: `/blog` (Main `peWUIV6zc`), `/blog/:Blog` (Main `dNx7WjoKc`), `/documentation` (Main `F6Vh8Z3Uz`), `/privacy-policy` (Main `X35ZndK9k`), `/terms-of-service` (Main `NcmeLw_PI`)

Description:
Five pages have ZERO button components anywhere in their body (verified by deep-walking each Main to depth 8–10 and filtering for Primary Button, Outline Button, Arrow Button, and Buy Button component instances). On these pages, the only conversion path is the global header's "Book Today" button — which disappears the moment the user scrolls past the sticky header. After reading a blog post, a documentation FAQ, or a legal page, the user reaches the end of the content with no obvious next step. This is especially damaging on `/blog/:Blog` (the CMS blog detail page) — a visitor who just read a pet-care article is the highest-intent audience for a "Book a consult" or "Ask our vets" CTA, yet none is presented.

Evidence:
Deep-walk button counts (depth 8–10):
```
/blog           : []
/blog/:Blog     : []
/documentation  : []
/privacy-policy : []
/terms-of-service: []
```

Recommended Fix:
Add a CTA at the end of each of these pages. The unused CTA component (`GkwGTE6uU`, see DR-10-5) is purpose-built for this. At minimum: (1) `/blog/:Blog` — add CTA at end of article body, copy like "Have a question about your pet? Book a vet consult." (2) `/blog` — add CTA after Articles list, copy like "Ready to give your pet the best care? Book an appointment." (3) `/documentation` — add a "View live site" or "Book a demo" CTA. (4) `/privacy-policy` and `/terms-of-service` — lower priority but could include a "Back to Home" or "Contact us" link.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-203 — Mobile nav dropdown omits "Home" link

Status: Open
Category: UX & conversion
Severity: Medium
Location: Nav Dropdown component `hc6IgBhgF` → Default variant `eJIxZkfZQ` → Dropdown `jxjLrDog_` → Content `QSiFMVJ6K` → Nav Links `mtWbBUQmd`

Description:
The mobile navigation menu (the Nav Dropdown component, opened via the HamburgerMenu code component `kCxujKn`) contains only 4 nav links: Services, About Us, Blog, Contact Us. The desktop Nav Bar has 5 links including Home. A mobile user on /services, /about, /blog, or /contact who opens the menu to return Home has no "Home" item — they must intuit that tapping the logo returns them to Home. While tapping the logo is a common web convention, omitting Home from the mobile menu creates an inconsistency with desktop (where Home is explicitly listed) and forces mobile users to learn a different navigation pattern. The mobile menu does include the "Book Today" Primary CTA and the phone-call Outline CTA, which is good.

Evidence:
Serialized Nav Dropdown component's Nav Links frame `mtWbBUQmd` contains 4 children, all `ARbK0E6gq` (Primary Button) instances:
```
gmIH1wdr4  →  title="Services"     link="/services"
v6AYL1_DZ  →  title="About Us"     link="/about"
XdgyF3M_R  →  title="Blog"         link="/blog"
HMbEERxMc  →  title="Contact Us"   link="/contact"
```
Compare to desktop Nav Bar `bTXu1FqyY` Default variant which has 5 NavLink Button instances including `ah_SqcUDh` (text "Home", link "/#home"). The mobile menu uses Primary Button components for nav items (visual styling inconsistency with desktop's text-link NavLink Buttons).

Recommended Fix:
Add a 5th Primary Button to the mobile Nav Links frame with title="Home" and link="/". Alternatively, restructure the mobile menu to use NavLink Button components (matching desktop styling) instead of Primary Buttons for visual consistency.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-204 — Placeholder phone number "+123-456-7890" used in 3 conversion-critical CTAs

Status: Open
Category: UX & conversion
Severity: Critical
Location: Header component `AZd_vmoUt` Desktop Outline Button `YusTGfBLD` (also replicated in Tablet `WVwnpCf7jYusTGfBLD` and Phone `zCwAoDfvLYusTGfBLD`); Nav Dropdown `hc6IgBhgF` Call Button `hP7m9YRBA`; `/services/:Services` Outline Button `Tsglsx7S8` (text "Call Now")

Description:
The phone-call CTA across the site displays the placeholder phone number "+123-456-7890" and links to `tel:+123-456-7890`. This is the default placeholder from the template and is not a real clinic phone number. The placeholder appears in 3 user-facing locations: (1) the persistent header Outline Button visible on every page that uses the layout template (12 of 13 pages), (2) the mobile nav menu "Call Button" inside the Nav Dropdown, and (3) the "Call Now" Outline Button on the /services/:Services detail page. A pet owner who clicks "Call" from any page dials a non-working or wrong number — at best a frustrating dead end, at worst a misdialed stranger. For a veterinary clinic (where emergency calls are time-critical), this is a conversion-critical defect.

Evidence:
Serialized attributes of the 3 button instances:
```
Header Outline Button (Desktop) YusTGfBLD:
  $control__text: "+123-456-7890"
  $control__link: "tel:+123-456-7890"
  $control__icon1: "Phone"
  $control__icon1Visible: "true"

Recommended Fix:
Replace the placeholder number with the real Vetly clinic phone number across all 3 instances (and the 4 header variants). The Header component-level fix (on `YusTGfBLD`) propagates to all variants; the Nav Dropdown fix (on `hP7m9YRBA`) propagates to all pages that use the layout; the `/services/:Services` fix (on `Tsglsx7S8`) is a single-instance override. Coordinate with site owner to confirm the real number. Also consider whether an emergency-only number should be exposed differently (see DR-10-12).

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-205 — Nav link hash anchors don't match section names on Home, /about, /blog

Status: Open
Category: UX & conversion
Severity: Medium
Location: Nav Bar component `bTXu1FqyY` → NavLink Button instances: `ah_SqcUDh` (Home, link `/#home`), `X90B_Eydv` (About Us, link `/about#about`), `YQ38nqAvE` (Blog, link `/blog#blog`)

Description:
Three of the five nav links use hash anchors that don't match any section name on their target page. (1) The "Home" link points to `/#home`, but the Home page has no section/frame named "home" — the top section is named "Hero". (2) The "About Us" link points to `/about#about`, but the /about page has no section named "about" — its sections are Hero, Story, Mission, Team, Stats, Testimonials, Location & Hours, FAQ. (3) The "Blog" link points to `/blog#blog`, but the /blog page has no section named "blog" — its sections are Featured Articles and Articles. (Note: the "Services" link `/services#services` correctly matches the /services page's "Services" section, and the "Contact" link `/contact#contact` correctly matches the /contact page's "Contact" section.) Framer's smooth-scroll behavior silently fails when the target anchor doesn't resolve — so users clicking "Home", "About Us", or "Blog" from any other page land at the top of the target page (correct outcome by accident, since the page loads at top by default), but the smooth-scroll affordance is broken for in-page nav clicks.

Evidence:
- NavLink Button attributes (from Nav Bar component `bTXu1FqyY` Default variant):
  - `ah_SqcUDh`: text="Home", link="/#home"
  - `aKd4UTmkK`: text="Services", link="/services#services"
  - `X90B_Eydv`: text="About Us", link="/about#about"
  - `YQ38nqAvE`: text="Blog", link="/blog#blog"
  - `ByQkDubwd`: text="Contact", link="/contact#contact"
- Home Main `J30SjU3lW` section names (verified at depth 4): Hero, Services, Why Us, Team, Testimonials, Location & Hours, FAQ, Blog — no "home" section.
- /about Main `hePnJ4Gr1` section names (verified at depth 4): Hero, Story, Mission, Team, Stats, Testimonials, Location & Hours, FAQ — no "about" section.
- /blog Main `peWUIV6zc` section names (verified at depth 4): Featured Articles, Articles — no "blog" section.

Recommended Fix:
Either (a) rename the top section of each page to match its nav anchor (Home's Hero → "Home"; /about's Hero → "About"; /blog's Featured Articles → "Blog"), or (b) update the NavLink Button link attributes to remove the hash for pages where the anchor doesn't exist (e.g., change `/#home` to `/`, `/about#about` to `/about`, `/blog#blog` to `/blog`). Option (b) is simpler and avoids breaking other internal links that reference these sections.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-206 — Logo link and /404 button use inconsistent anchors (/#home vs /#hero)

Status: Open
Category: UX & conversion
Severity: Low
Location: Header component `AZd_vmoUt` → Logo frame `dkoXnIYcl` (link `/#home`); `/404` page Primary Button `Jv7_t6C6H` (title "Return to Home", link `/#hero`)

Description:
The site logo (in the Header component, applied to all 4 breakpoints) links to `/#home`. The "Return to Home" Primary Button on the /404 page links to `/#hero`. Both are intended to send users to the home page, but they reference different hash anchors. Neither anchor matches an actual section name on the Home page (whose top section is named "Hero" — so `/#hero` would resolve, but `/#home` would not). The result: clicking the /404 "Return to Home" button navigates to `/` and attempts to smooth-scroll to the "Hero" section (works), while clicking the logo from any interior page navigates to `/` and attempts to scroll to "home" (silently fails, lands at top). The inconsistency is minor but indicates the nav anchor scheme is not coherent site-wide.

Evidence:
- Header Logo frame `dkoXnIYcl` attributes: `link: { href: "/#home" }` (verified on all 4 header variants — Desktop, Desktop Open, Tablet, Phone).
- /404 Primary Button `Jv7_t6C6H` attributes: `$control__title: "Return to Home"`, `$control__link: "/#hero"`.
- Home page top section is named "Hero" (id `LQn3zLbUg`) — verified by deep-walk.

Recommended Fix:
Standardize on a single anchor scheme. Either (a) rename Home's Hero section to "Home" and use `/#home` everywhere, or (b) use `/#hero` everywhere (logo + 404 button), or (c) simplify by removing the hash entirely — link both to `/`. Option (c) is the cleanest: `SET dkoXnIYcl link.href="/";` and `SET Jv7_t6C6H $control__link="/";`. Coordinate with DR-10-10's fix.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-207 — Emergency path is buried at the bottom of the home page

Status: Open
Category: UX & conversion
Severity: High
Location: Home `/` → Main `J30SjU3lW` → Location & Hours section `fX2ht5DXq` → Contact Info `CYb4mplpU` → Emergency Strip `xzEEVW_dN`

Description:
The site's only emergency messaging ("Emergency: 24/7 On-Call Support") lives in a small text strip inside the "Location & Hours" section — the 6th of 8 sections on the Home page, well below the fold. There is no emergency CTA in the global header, no emergency banner on the /services or /booking pages, and no emergency mention on the /contact page above the fold. For a veterinary clinic, pet emergencies are time-critical and a primary reason owners seek a vet — burying the emergency path forces a distressed user to scroll through Hero, Services, Why Us, Team, Testimonials, and Location sections before finding the emergency message. The header's phone CTA (currently the placeholder "+123-456-7890", see DR-10-9) is not differentiated as an emergency line and is not labeled as 24/7. Compounding this, the Cal.com booking widget on /booking is for an "in-clinic-vet-appointment" event — there is no emergency booking path.

Evidence:
Home Emergency Strip `xzEEVW_dN` text content (deep-walked):
```
"Emergency: "
"24/7"
" On-Call Support"
```
This is plain text inside a Text M RichTextNode — no link, no phone number, no CTA button. Located in the Location & Hours section, which is the 6th section (after Hero, Services, Why Us, Team, Testimonials).

Recommended Fix:
(1) Add an "Emergency?" CTA to the global header — either a distinct red badge or a separate small text link near the phone CTA, linking to a dedicated /emergency page or to `tel:<real-emergency-number>`. (2) Above the Home hero or as a thin sticky banner, add a one-line emergency strip ("Pet emergency? Call our 24/7 line: XXX-XXX-XXXX"). (3) On /booking, add an emergency escape link below the Cal.com embed ("For emergencies, call XXX-XXX-XXXX — don't book online"). (4) On /contact, surface the emergency number above the contact form. Coordinate with site owner to confirm a real emergency number exists.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-208 — /blog/:Blog detail page has no active nav state

Status: Open
Category: UX & conversion
Severity: Low
Location: `/blog/:Blog` page node `DvEqpc9aQ` → `attributes["$control__activeLink"]: "Default"`

Description:
The CMS-driven blog detail page (`/blog/:Blog`) has its layout template's Active Link variable set to "Default" — meaning no nav item is highlighted as active when a user is reading a blog post. Compare: `/blog` (the index) correctly sets `activeLinkValue: "Blog Active"`, highlighting the Blog nav item. But once the user clicks into a blog post, the Blog nav highlight disappears. This is a minor wayfinding issue — users lose the visual cue that they're still in the Blog section. The 5 main nav pages (/, /services, /services/:Services, /about, /blog, /contact) all have correct active state; only the /blog/:Blog CMS detail route is misconfigured.

Evidence:
Per-page `$control__activeLink` attribute values:
```
/                    : "Home Active"        ✓
/services            : "Services Active"    ✓
/services/:Services  : "Services Active"    ✓
/about               : "About Active"       ✓
/blog                : "Blog Active"        ✓
/blog/:Blog          : "Default"            ✗  ← should be "Blog Active"
/contact             : "Contact Active"     ✓
/booking             : (no layout template)
/documentation       : "Default"            (not in nav — acceptable)
/brand-guide         : "Default"            (not in nav — acceptable)
/privacy-policy      : "Default"            (not in nav — acceptable)
/terms-of-service    : "Default"            (not in nav — acceptable)
/404                 : "Default"            (not in nav — acceptable)
```

Recommended Fix:
Set `/blog/:Blog` page's `attributes["$control__activeLink"]` to `"Blog Active"`. Apply via the page's layout template variable override (use the `SET` command on the page-level layout template variable binding, with `pagePath: "/blog/:Blog"`).

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-209 — /services page duplicates Home's "Why Us" section without adding service comparison content

Status: Open
Category: UX & conversion
Severity: Medium
Location: `/services` → Main `NSWbX2QeF` → Why Us section `FSvggM4G4` → Why Us Cards frame `l8xcc3IcB` (4 instances of `Sr15oMIZ5` "Why Us Card")

Description:
The `/services` page is supposed to be the services index — the place where pet owners compare service offerings. Instead, the page contains: (1) a Hero with a single dead "Book an Appointment" CTA (see DR-10-1), (2) a "Services" section with a CMS-backed Services Cards container that is currently empty (shows "No items", see DR-10-4), and (3) a "Why Us" section with 4 Why Us Card instances — using the EXACT SAME titles as the Home page's Why Us section: "Compassionate Care", "Experienced Veterinary Team", "State-of-the-Art Technology", "Peace of Mind, Always". The page therefore offers no service comparison, no pricing information, no service descriptions, and no unique value beyond what's already on Home. A user who clicks "View All Services" on Home lands on /services and finds duplicate content + an empty services list. Even if the CMS Services collection were populated, the page lacks comparison affordances (no price column, no "starting at" pricing, no service-duration info, no "book this service" per-card CTA).

Evidence:
- /services Main sections (depth 4): Hero, Services, Why Us.
- /services Why Us Cards: 4 instances of `Sr15oMIZ5` with titles "Compassionate Care", "Experienced Veterinary Team", "State-of-the-Art Technology", "Peace of Mind, Always" — identical to Home page's Why Us Cards.
- /services Services Cards container `WlJklkSOA`: contains Empty State `x_5gU4Bw5` showing "No items".
- /services page has 1 Service Card instance — but only as part of the empty CMS list, not a meaningful display.
- No pricing components (Price list card `XX2THh6jc`) are used on /services or anywhere on the site.

Recommended Fix:
(1) Populate the Services CMS collection (coordinate with sub-agent #13). (2) Differentiate the /services Why Us section from Home's — either remove it (since Home already covers it) or replace with service-specific differentiators (e.g., "Same-day appointments", "Insurance accepted", "Payment plans"). (3) Add pricing transparency — use the Price list card component (`XX2THh6jc`) or add a "Starting at $XX" badge to each Service Card. (4) Add a per-service "Book this service" CTA on each Service Card. (5) Consider a comparison table or category filter for service browsing.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-210 — /documentation and /brand-guide have generic "Breakpoint 2"/"Breakpoint 3" names instead of "Tablet"/"Phone"

Status: Open
Category: UX & conversion
Severity: Low
Location: `/documentation` page `B49BfU8Yb` (top children: Desktop `r8icvKdrL`, Breakpoint 2 `u78lgJ27h`, Breakpoint 3 `Yak1bjj2W`); `/brand-guide` page `hkW4RaXgm` (top children: Desktop `F2Ac06qm9`, Breakpoint 2 `ca9bRdpvP`, Breakpoint 3 `Pog7IJxbF`)

**Additional locations (merged findings):**
- `/brand-guide` page breakpoints — `ca9bRdpvP` named "Breakpoint 2", `Pog7IJxbF` named "Breakpoint 3"

Description:
All other 11 pages have properly named breakpoints ("Desktop", "Tablet", "Phone"). The /documentation and /brand-guide pages have their Tablet and Phone breakpoints named generically as "Breakpoint 2" and "Breakpoint 3". This is a maintenance/UX-team friction issue rather than a user-facing conversion issue, but it suggests these two pages may have been added later without applying the project's breakpoint-naming convention. The unnamed breakpoints are still functional (responsive sizing works), but a future editor auditing or modifying these pages will have to mentally map "Breakpoint 2" → "Tablet" and "Breakpoint 3" → "Phone", increasing the risk of an editor making changes to the wrong breakpoint.

**Additional context (merged from DR-4-12):** The Brand Guide page's tablet and mobile breakpoints are named generically "Breakpoint 2" and "Breakpoint 3", whereas every other page in the site map (including `/about` and the default layout template) names them "Tablet" and "Phone" respectively. This naming inconsistency shows up in the Framer editor and in serialized output, making it harder for a future maintainer to identify which breakpoint is which. It's a minor housekeeping issue but indicates the page was created hastily without applying the project's naming convention.

Evidence:
Page-level serialization of all 13 pages shows the breakpoint naming pattern:
```
/                     : Desktop, Tablet, Phone
/services             : Desktop, Tablet, Phone
/services/:Services   : Desktop, Tablet, Phone
/about                : Desktop, Tablet, Phone
/blog                 : Desktop, Tablet, Phone
/blog/:Blog           : Desktop, Tablet, Phone
/contact              : Desktop, Tablet, Phone
/booking              : Desktop, Tablet, Phone
/documentation        : Desktop, Breakpoint 2, Breakpoint 3   ←
/brand-guide          : Desktop, Breakpoint 2, Breakpoint 3   ←
/privacy-policy       : Desktop, Tablet, Phone
/terms-of-service     : Desktop, Tablet, Phone
/404                  : Desktop, Tablet, Phone
```

**Additional evidence (from DR-4-12):** `framer.agent.serialize({ id: "hkW4RaXgm", depth: 1 }).$breakpoints` returns:
```
[ { id: "F2Ac06qm9", name: "Desktop", mediaQueryRange: "(min-width: 1280px)" },
  { id: "ca9bRdpvP", name: "Breakpoint 2", mediaQueryRange: "(min-width: 768px) and (max-width: 1279.98px)" },
  { id: "Pog7IJxbF", name: "Breakpoint 3", mediaQueryRange: "(max-width: 767.98px)" } ]
```
Compare to `/about` which returns breakpoints named `"Desktop"`, `"Tablet"`, `"Phone"` for the same media queries.

Recommended Fix:
Rename the breakpoints on /documentation and /brand-guide to "Tablet" and "Phone" to match the project convention. Apply via Framer's breakpoint-rename DSL or the canvas UI.

**Additional fix note (from DR-4-12):** Rename breakpoint `ca9bRdpvP` to `"Tablet"` and breakpoint `Pog7IJxbF` to `"Phone"` via the Framer editor.

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-211 — Header "Book Today" CTA copy is inconsistent with body CTAs ("Book Today" vs "Book an Appointment" vs "Book Appointment")

Status: Open
Category: UX & conversion
Severity: Low
Location: Header Primary Button instance `OLDfgiQJq` (title "Book Today"); Home Hero Primary Button `ktjD5Syiq` (title "Book an Appointment"); /services Hero Primary Button `W_B9G7Iek` (title "Book an Appointment"); /services/:Services Primary Button `QDrNwNl7H` (title "Book Appointment"); /about Primary Button `wliwPIZyK` (title "Book an Appointment"); /brand-guide Primary Button `U9BPSijAV` (title "Book an Appointment"); CTA component `GkwGTE6uU` default button text "Book Appointment"

Description:
The Primary CTA copy varies across the site: the persistent header button says "Book Today" (2 words), Home/Services/About/brand-guide body buttons say "Book an Appointment" (3 words), and /services/:Services + the CTA component say "Book Appointment" (2 words, no "an"). All three variants link to /booking (where they have links — see DR-10-1, DR-10-2, DR-10-3 for the ones that don't). The copy inconsistency is minor but suggests lack of a CTA-copy guideline. "Book Today" is more urgent/CTA-like; "Book an Appointment" is more formal; "Book Appointment" reads as a telegraphic abbrevation. Best practice is to standardize on one phrase across all booking CTAs.

Evidence:
CTA copy inventory (across all button instances with title containing "book"):
```
Header (persistent, all pages with layout)  : "Book Today"

Recommended Fix:
Standardize on "Book an Appointment" (the most common variant) for all booking CTAs. Update the Header component's Primary Button title from "Book Today" to "Book an Appointment", and update /services/:Services + the CTA component from "Book Appointment" to "Book an Appointment".

Confidence: High
Discovered by: sub-agent 10, session DR

---

## DR-212 — Buy Button: all copy hardcoded, only Link and Image exposed as variables

Status: Open
Category: Components
Severity: Critical
Location: Component `sfrLnUdBr` "Buy Button" — TextRun nodes `v:ZYiXBF4EE:0:0`, `v:GeDtk56NK:0:0`, `v:QDcE0o_Jp:0:0` inside both variant `SVjbUIE_y` ("Variant 1") and variant `HsPFOPesC` ("Variant 2")

Description:
The Buy Button component exposes only two component variables — `Link` (`$control__link`) and `Image` (`$control__image`). All of its visible text is hardcoded inside TextRun nodes:
- "Brand Name" RichTextNode → TextRun text = `"Vetly"`
- `"for"` RichTextNode → TextRun text = `"for"`
- "Price" RichTextNode → TextRun text = `"$129"`

These strings are duplicated in both variants. The Buy Button is placed in the layout template (`yDIYoKc7h`, instance `aqBIOKUF4`) so it appears on every page that uses the Layout template — yet editors cannot change the price, brand, or preposition text without editing the component definition. The component also has no radius/padding/shadow controls, so any visual tweak requires editing the component itself.

Evidence:
`framer.agent.serialize({ id: "sfrLnUdBr", depth: 8 })` returned TextRuns `[{id:"v:ZYiXBF4EE:0:0", text:"Vetly"}, {id:"v:GeDtk56NK:0:0", text:"for"}, {id:"v:QDcE0o_Jp:0:0", text:"$129"}, {id:"v:HsPFOPesCZYiXBF4EE:0:0", text:"Vetly"}, {id:"v:HsPFOPesCGeDtk56NK:0:0", text:"for"}, {id:"v:HsPFOPesCQDcE0o_Jp:0:0", text:"$129"}]`. Variables list: `[{name:"Link", type:"link"}, {name:"Image", type:"image"}]` only. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/sfrLnUdBr-Buy_Button.jpg`.

Recommended Fix:
Add three new component variables — `Brand Name` (string), `Preposition` (string, default "for"), and `Price` (string). Bind each RichTextNode's text attribute to the new variable (e.g. set `text="var(--variable-<brandNameId>)"` on the "Brand Name" RichTextNode, mirroring the pattern already used by the Title variable in Primary Button `ARbK0E6gq`).

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-213 — Price list card is orphaned: zero usages anywhere, all content hardcoded

Status: Open
Category: Components
Severity: Critical
Location: Component `XX2THh6jc` "Price list card" — entire component (variant `LF0mywFke` "Default")

Description:
A full orphan check across all 13 pages, the layout template `yDIYoKc7h`, and the descendant tree of every other component returned 0 instances of Price list card. It is defined but never placed. On top of that, the component has no text variables — its variables list contains only `Fill`, `Gap`, and `Border`. All visible copy is hardcoded inside TextRun nodes:

| Row | Service label | Price label |
|---|---|---|
| Header | "Service" | "Price" |
| 1 | "Check-up" | "$65" |
| 2 | "Vaccination" | "$45" |
| 3 | "Emergency Visit" | "$120" |
| 4 | "Surgery" | "$300" |

The component also uses hardcoded `textColor=rgb(28, 64, 78)` (×5 RichTextNodes) instead of a color style, hardcoded `fill=rgba(64, 169, 255, 0.25)` for the Divider nodes (×5), and hardcoded `fontSize="16px"` + `fontName="Inter"` + `fontWeight=600` instead of the Text M text style.

Evidence:
`framer.agent.getDescendantsOfTypes({ id, types: ["ComponentInstanceNode"] })` against every page, the layout template, and every other component — 0 matches for `XX2THh6jc`. Serialize output: variables = `[{name:"Fill"}, {name:"Gap"}, {name:"Border"}]`; TextRuns include `"Service"`, `"Price"`, `"Check-up"`, `"$65"`, `"Vaccination"`, `"$45"`, `"Emergency Visit"`, `"$120"`, `"Surgery"`, `"$300"`. RichTextNode text colors: `rgb(28, 64, 78)`. Divider fills: `rgba(64, 169, 255, 0.25)`.

Recommended Fix:
Either delete the component (preferred if there's no plan to use it) or convert it into a real, reusable component: add a `Service Name` and `Price` string variable per row (or convert to a CMS-bound collection list), bind the RichTextNodes to those variables, swap `rgb(28, 64, 78)` → `var(--token-8a93520a-...)` (Text color style) or `var(--token-f4164b99-...)` (slate-700), swap the Divider fill to `var(--token-8d76f153-...)` (Primary) with opacity, and apply the Text M text style to the row text nodes.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-214 — Load More: button label "Load More" hardcoded across all 3 variants, no Text variable

Status: Open
Category: Components
Severity: Critical
Location: Component `sMRugCuTF` "Load More" — RichTextNode `gYR_RWmRz` (and its replicas in variants `BQFQQasEO` "Loading" and `GMI7vFA5I` "Hidden"); TextRun `v:gYR_RWmRz:0:0` etc.

Description:
The Load More component exposes only one variable — `onClick` (event handler). The button label is hardcoded as `"Load More"` in all three variants (Default, Loading, Hidden). Three instances exist on `/blog` (instance IDs `buWHHBQsM`, `fpXa25z8ybuWHHBQsM`, `oKC1nohe6buWHHBQsM`) — every one of them shows the literal string "Load More" and cannot be customized to "Show More Posts", "View More Articles", etc. without editing the component.

Evidence:
`framer.agent.serialize({ id: "sMRugCuTF", depth: 8 })` — variables: `[{name:"Click", key:"onClick", type:"eventhandler"}]` only. RichTextNode `gYR_RWmRz` has `text: undefined` (no variable binding); its TextRun child `v:gYR_RWmRz:0:0` has `text: "Load More"`. Same pattern replicated in `BQFQQasEOgYR_RWmRz` and `GMI7vFA5IgYR_RWmRz`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/sMRugCuTF-Load_More.jpg`.

Recommended Fix:
Add a `Label` string variable (default "Load More") and bind the RichTextNode's `text` attribute to it (same pattern as Primary Button's Title variable). All three variants will then inherit the binding automatically.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-215 — Service Card: "Learn More" action text hardcoded, no Action Text variable

Status: Open
Category: Components
Severity: High
Location: Component `ecHzMZLnH` "Service Card" — RichTextNode `IpoVjtnXJ` "Action Text" in variant `LK3AVFLo7` "Default" and its replica `yOjvWlEPqIpoVjtnXJ` in variant `yOjvWlEPq` "Default"

Description:
The Service Card exposes 6 variables (Title, Description, Icon, Link, Padding, Shadow) — but the "Action Text" label that appears next to the action arrow is hardcoded as `"Learn More"` in both Default variants. The Title and Description RichTextNodes correctly bind to their variables (`var(--variable-WIcXdi0Pz)` and `var(--variable-ft4SJ5q3O)`), but the "Action Text" RichTextNode has `text: undefined` and a TextRun child with hardcoded `"Learn More"`. Service Card has 6 instances on the home page alone — every one shows "Learn More" with no way to vary it.

Evidence:
`framer.agent.serialize({ id: "ecHzMZLnH", depth: 8 })` — RichTextNodes: `[{name:"Title", text:"var(--variable-WIcXdi0Pz)"}, {name:"Description", text:"var(--variable-ft4SJ5q3O)"}, {name:"Action Text", text: undefined}]`. TextRun text: `"Learn More"` (×2). Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/ecHzMZLnH-Service_Card.jpg`.

Recommended Fix:
Add an `Action Text` string variable (default "Learn More") to Service Card and bind the "Action Text" RichTextNode's `text` attribute to it.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-216 — Primary Button: success/error state copy hardcoded with inconsistent capitalization

Status: Open
Category: Components
Severity: High
Location: Component `ARbK0E6gq` "Primary Button" — RichTextNode `zJAVKijUd` "Text" inside variants `t9QapcGr2` (Success), `Pkhyll5Zk` (Success Small), `UtTeA07jz` (Error), `D35379AjS` (Error Small); TextRuns `v:t9QapcGr2zJAVKijUd:0:0`, `v:UtTeA07jzzJAVKijUd:0:0`, etc.

Description:
In the four Success/Error variants, the primary "Text" RichTextNode loses its variable binding (text attribute = undefined) and the visible text becomes hardcoded inside the TextRun:
- Success / Success Small → `"Message Sent Successfully"` (Title Case)
- Error / Error Small → `"something went wrong"` (sentence case, lowercase "s")

Evidence:
`framer.agent.serialize({ id: "ARbK0E6gq", depth: 8 })` — RichTextNodes for variants `t9QapcGr2`, `Pkhyll5Zk`, `UtTeA07jz`, `D35379AjS` all have `text: undefined` on the `zJAVKijUd` "Text" node. TextRuns returned: `[{text:"Message Sent Successfully"}, {text:"Message Sent Successfully"}, {text:"something went wrong"}, {text:"something went wrong"}]`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/ARbK0E6gq-Primary_Button.jpg`.

Recommended Fix:
Add `Success Text` (string, default "Message sent successfully") and `Error Text` (string, default "Something went wrong") variables to Primary Button. Bind the "Text" RichTextNode in the four Success/Error variants to the appropriate variable. Standardize capitalization to Title Case or sentence case — pick one and apply consistently.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-217 — Footer: zero component variables; all content is hardcoded inside the component

Status: Open
Category: Components
Severity: High
Location: Component `Xx2RpZ5pV` "Footer" — entire component (variants `SM4CTALR7` Desktop, `IToCCjwER` Tablet, `wxI9ElO4C` Phone)

Description:
The Footer component's `variables` array is empty. Every string and image inside it is hardcoded:
- Copyright TextRun text = `"© 2026 Vetly. All rights reserved."` (year is also hardcoded)
- Three "Links Group" headings — `textColor=var(--token-4b8ae43c-...)` (neutral-700) but text content is hardcoded inside TextBlock/TextRun children
- Logo Icon fill uses a hardcoded gradient + `border=1px solid rgb(152, 204, 247)` — border color is not a color style
- 33 nested NavLink Button instances (`gUM1o8Yyz`) provide the actual navigation links, but their labels come from NavLink Button's own `Text` variable overrides — which are also hardcoded inside the Footer (not exposed as Footer variables)

The Footer is placed in the layout template (`lwSF5de67`) and renders on every page that uses the Layout template. Because nothing is exposed as a variable, any text update requires editing the Footer component itself.

Evidence:
`framer.agent.serialize({ id: "Xx2RpZ5pV", depth: 5 })` — `variables: []`. TextRun `text: "© 2026 Vetly. All rights reserved."`. Logo Icon `border: "1px solid rgb(152, 204, 247)"`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/Xx2RpZ5pV-Footer.jpg`.

Recommended Fix:
Expose at minimum: `Copyright Text` (string), `Logo Image` (image), and group-heading strings as variables. Replace `rgb(152, 204, 247)` with a color style (close candidate: extend `Accent Cyan Light` or add a new "Border/Light Blue" style). Use a date-expression for the year (or expose it as a variable) so the copyright auto-updates.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-218 — Header: logo image URL hardcoded, no Logo variable exposed

Status: Open
Category: Components
Severity: High
Location: Component `AZd_vmoUt` "Header" — `FrameNode "Logo Image"` inside variant `PP5wyjmXI` "Desktop" (and replicated in Desktop Open / Tablet / Phone)

Description:
The Header's logo is a hardcoded SVG URL: `fill=https://framerusercontent.com/images/1R4NU3f2Nxccfas5QWXH8vNoyw.svg`. The Header exposes only three variables — `Active Link` (option), `Hide Nav Section` (scrollsectionref), and `Gooey Visible` (boolean) — none of which control the logo. To swap the logo (e.g., for a white-on-dark variant or a holiday version), an editor must edit the component definition. The Header is placed in the layout template (`LZNqgqLuX`) so it renders on every page.

Evidence:
`framer.agent.serialize({ id: "AZd_vmoUt", depth: 5 })` — variant `PP5wyjmXI` Desktop contains `FrameNode/Logo` → `FrameNode/Logo Image` with `fill: "https://framerusercontent.com/images/1R4NU3f2Nxccfas5QWXH8vNoyw.svg"`. Variables: `[{name:"Active Link"}, {name:"Hide Nav Section"}, {name:"Gooey Visible"}]`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/AZd_vmoUt-Header.jpg`.

Recommended Fix:
Add a `Logo` (image) variable to Header and bind the `Logo Image` frame's `fill` attribute to it (e.g. `fill="var(--variable-<logoId>)"`). Replicate the binding across all 4 variants.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-219 — Blog Card "horizontal Small" variant: Title RichTextNode loses variable binding, falls back to hardcoded "Pet Vaccines, Safe and Loving"

Status: Open
Category: Components
Severity: High
Location: Component `EiCUZ0sVC` "Blog Card" — RichTextNode `k8p5fPamxWVJGrMOMy` "Title" in variant `k8p5fPamx` "horizontal Small" (and its replica `cESGoZn84WVJGrMOMy` in `cESGoZn84`); TextRuns `v:k8p5fPamxWVJGrMOMy:0:0` and `v:cESGoZn84WVJGrMOMy:0:0`

Description:
Blog Card's "Title" RichTextNode is correctly bound to the Title variable (`var(--variable-quzMrqTYf)`) in 6 of 8 variants, but in the two "horizontal Small" variants the `text` attribute is `undefined` and the TextRun contains the literal string `"Pet Vaccines, Safe and Loving"`. This means setting the Title variable on a Blog Card instance that uses the "horizontal Small" variant will have no effect — the title will always show "Pet Vaccines, Safe and Loving". Blog Card has 12 instances on the home page alone and is used throughout `/blog`.

Evidence:
`framer.agent.serialize({ id: "EiCUZ0sVC", depth: 8 })` — Title RichTextNodes: 6 with `text: "var(--variable-quzMrqTYf)"` (variants OSZXw3DUH, RhHYcSaiK, BU9VdIEbd, O_DdWUeNW, ZN8y56CSQ, OyehRjapS) and 2 with `text: undefined` (variants k8p5fPamx and cESGoZn84). TextRuns `v:k8p5fPamxWVJGrMOMy:0:0` and `v:cESGoZn84WVJGrMOMy:0:0` both contain `"Pet Vaccines, Safe and Loving"`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/EiCUZ0sVC-Blog_Card.jpg`.

Recommended Fix:
Open variant `k8p5fPamx` ("horizontal Small"), select the Title RichTextNode, and set `text="var(--variable-quzMrqTYf)"` to match the other 6 variants. Replicate to `cESGoZn84` if Framer doesn't auto-propagate.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-220 — Buy Button Variant 2: hardcoded `rgba(255,255,255,0.5)` text color on "for" label, inconsistent with Variant 1

Status: Open
Category: Components
Severity: High
Location: Component `sfrLnUdBr` "Buy Button" — RichTextNode `HsPFOPesCGeDtk56NK` "for" inside variant `HsPFOPesC` "Variant 2"

Description:
In variant `SVjbUIE_y` ("Variant 1"), the "for" RichTextNode uses `textColor=var(--token-f3b95cd0-dd2d-4512-8f95-5412bdb3212e)` (the `neutral-400` color style). In variant `HsPFOPesC` ("Variant 2"), the same node is overridden to `textColor=rgba(255, 255, 255, 0.5)` — a raw hardcoded color that doesn't reference any color style. This means future tweaks to `neutral-400` (or to a white/translucent style) won't propagate to Variant 2, and the two variants are visually inconsistent in their text color treatment.

Evidence:
`framer.agent.serialize({ id: "sfrLnUdBr", depth: 8 })` — RichTextNode `GeDtk56NK` (Variant 1) `textColor: "var(--token-f3b95cd0-dd2d-4512-8f95-5412bdb3212e)"`; RichTextNode `HsPFOPesCGeDtk56NK` (Variant 2) `textColor: "rgba(255, 255, 255, 0.5)"`.

Recommended Fix:
Replace `rgba(255, 255, 255, 0.5)` with a color style. Either reuse `var(--token-ca0ee82c-91b5-4b33-949f-8422e04fb7e9)` (Border Subtle, currently `rgba(255,255,255,0.1)`) by widening its alpha, or add a new "Text/Subtle White" color style at 50% alpha and reference it from Variant 2.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-221 — Component name typo: "Teem Card" should be "Team Card"

Status: Open
Category: Components
Severity: Low
Location: Component `T6DVfhsAL` — display name in inventory and internal name `Cards/Teem Card`

Description:
The component is named "Teem Card" (internally `Cards/Teem Card`). "Teem" is a misspelling of "Team" — the component renders a team member (image + name + job title). The component is used 24 times on the home page alone (PdWrNXOdx, RcjiJEDdF, ypW478CxZ and their breakpoint replicas). The misspelled name propagates to the Framer editor UI, the components panel, and any future documentation, and makes search/filter harder (searching "team" returns nothing).

Evidence:
`framer.agent.serialize({ id: "T6DVfhsAL", depth: 2 })` — `name: "Cards/Teem Card"`. Inventory list: `{"id":"T6DVfhsAL","displayName":"Teem Card"}`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/T6DVfhsAL-Teem_Card.jpg`.

Recommended Fix:
Rename the component definition to `Cards/Team Card`. Framer will auto-update the displayName in the components panel; existing instances will continue to point to the same component id.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-222 — Primary Button: 14 variants with duplicate names (3× "Button", 3× "Solid")

Status: Open
Category: Components
Severity: Medium
Location: Component `ARbK0E6gq` "Primary Button" — `$variants` array

Description:
Primary Button has 14 variants, but only 10 unique names — the names "Button" (×3), "Solid" (×3) appear multiple times. Full list: `Button, Loading, Solid, Solid Loading, Disabled, Disabled Small, Success, Success Small, Error, Error Small, Button, Button, Solid, Solid`. The 3 "Button" and 3 "Solid" entries appear to be desktop/tablet/mobile breakpoint replicas, but they are labeled identically. When an editor inserts a Primary Button and picks "Button" from the variant dropdown, Framer uses the first match — they cannot intentionally select the "Tablet" or "Phone" version of "Button" by name. This makes variant selection ambiguous and breaks any documentation that refers to "the Button variant".

Evidence:
`framer.agent.serialize({ id: "ARbK0E6gq", depth: 2 })` — `$variants: [{name:"Button", id:"s0zHOdlkz"}, {name:"Loading", id:"QP_bKwhNI"}, {name:"Solid", id:"OPkWU3_LJ"}, {name:"Solid Loading", id:"KQFjUkjhI"}, {name:"Disabled", id:"nFlcyuxoA"}, {name:"Disabled Small", id:"Z8wqYMUWY"}, {name:"Success", id:"t9QapcGr2"}, {name:"Success Small", id:"Pkhyll5Zk"}, {name:"Error", id:"UtTeA07jz"}, {name:"Error Small", id:"D35379AjS"}, {name:"Button", id:"TeU8ysG26"}, {name:"Button", id:"A8E1xSQtf"}, {name:"Solid", id:"Pp8cBPVwA"}, {name:"Solid", id:"gqu2v98wu"}]`.

Recommended Fix:
Convert the duplicate "Button"/"Solid" entries into proper responsive breakpoints of the same variant (Framer supports per-variant breakpoint sizing without duplicating the variant). If breakpoint-as-variant is intentional, rename to `Button Desktop`, `Button Tablet`, `Button Mobile`, `Solid Desktop`, `Solid Tablet`, `Solid Mobile` so each variant is uniquely identifiable.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-223 — Outline Button: 3 variants all named "Outline" (ambiguous)

Status: Open
Category: Components
Severity: Medium
Location: Component `NoQy1opGY` "Outline Button" — `$variants` array

Description:
Outline Button has 3 variants, all named `Outline` (ids `g9O186Ri0`, `mq68uT0aT`, `zBUuxInr3`). They appear to be desktop/tablet/mobile replicas of the same single Outline state. The duplicate names make the variant dropdown ambiguous — an editor cannot intentionally select the tablet/mobile version. Outline Button is used 12 times on the home page alone.

Evidence:
`framer.agent.serialize({ id: "NoQy1opGY", depth: 2 })` — `$variants: [{name:"Outline", id:"g9O186Ri0"}, {name:"Outline", id:"mq68uT0aT"}, {name:"Outline", id:"zBUuxInr3"}]`.

Recommended Fix:
Convert the 3 replicas into proper responsive breakpoints of a single `Outline` variant, or rename to `Outline Desktop`, `Outline Tablet`, `Outline Mobile`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/NoQy1opGY-Outline_Button.jpg`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-224 — NavLink Button: duplicate "Not Active" variant name (3 variants, 2 share a name)

Status: Open
Category: Components
Severity: Medium
Location: Component `gUM1o8Yyz` "NavLink Button" — `$variants` array

Description:
NavLink Button has 3 variants: `Not Active` (id `lkCftY97P`), `Active` (id `pGYUAc7r3`), `Not Active` (id `CK_sWgFZi`). The two "Not Active" entries are likely desktop/tablet/mobile replicas (the Active variant may not have a mobile replica). NavLink Button is heavily nested — 30 instances inside Nav Bar (`bTXu1FqyY`) and 33 instances inside Footer (`Xx2RpZ5pV`), totaling 63+ indirect usages. The duplicate name makes variant selection ambiguous.

Evidence:
`framer.agent.serialize({ id: "gUM1o8Yyz", depth: 2 })` — `$variants: [{name:"Not Active", id:"lkCftY97P"}, {name:"Active", id:"pGYUAc7r3"}, {name:"Not Active", id:"CK_sWgFZi"}]`.

Recommended Fix:
Convert to breakpoints of a single `Not Active` variant, or rename the second replica to `Not Active Mobile` (or similar) for unambiguous selection.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-225 — Service Card: 2 variants both named "Default"

Status: Open
Category: Components
Severity: Medium
Location: Component `ecHzMZLnH` "Service Card" — `$variants` array

Description:
Service Card has 2 variants, both named `Default` (ids `LK3AVFLo7` and `yOjvWlEPq`). They appear to be desktop/mobile replicas. The duplicate name is ambiguous. Service Card has 6 instances on the home page alone.

Evidence:
`framer.agent.serialize({ id: "ecHzMZLnH", depth: 2 })` — `$variants: [{name:"Default", id:"LK3AVFLo7"}, {name:"Default", id:"yOjvWlEPq"}]`.

Recommended Fix:
Convert to breakpoints of a single `Default` variant, or rename to `Default Desktop` and `Default Mobile`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-226 — FAQ item: 6 variants with duplicate names (2× "FAQ Open", 2× "FAQ Closed")

Status: Open
Category: Components
Severity: Medium
Location: Component `xUmE2HP3j` "FAQ item" — `$variants` array

Description:
FAQ item has 6 variants: `FAQ Open`, `FAQ Closed`, `Touch Open`, `Touch Closed`, `FAQ Open`, `FAQ Closed`. The two extra `FAQ Open`/`FAQ Closed` entries are duplicates — likely a third breakpoint set. "Touch" naming is also unusual (likely a touch device breakpoint). FAQ item is used 15 times across the home page (and on other pages), so the duplicate names affect every FAQ section.

Evidence:
`framer.agent.serialize({ id: "xUmE2HP3j", depth: 2 })` — `$variants: [{name:"FAQ Open", id:"P3ysYJ8v6"}, {name:"FAQ Closed", id:"OgvEl7iAq"}, {name:"Touch Open", id:"cduQvt9da"}, {name:"Touch Closed", id:"ay0JXaXoX"}, {name:"FAQ Open", id:"hYK1I0WtA"}, {name:"FAQ Closed", id:"TUxVaxXHa"}]`.

Recommended Fix:
Rename the duplicates to unambiguous labels (e.g. `FAQ Open Desktop`, `FAQ Open Mobile`, `Touch Open` → `FAQ Open Touch`). Or convert the duplicate "FAQ" pair to breakpoints of the first pair. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/xUmE2HP3j-FAQ_item.jpg`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-227 — Blog Card: 8 variants with duplicate names + inconsistent capitalization

Status: Open
Category: Components
Severity: Medium
Location: Component `EiCUZ0sVC` "Blog Card" — `$variants` array

Description:
Blog Card has 8 variants: `Default, Overlay, horizontal Small, horizontal Big, Default, Overlay, horizontal Small, horizontal Big`. The duplicates appear to be desktop/mobile replicas. The `horizontal Small` and `horizontal Big` names also use lowercase `horizontal` — inconsistent with Title Case used for `Default` and `Overlay`. Blog Card has 12 instances on the home page and is used across `/blog`.

Evidence:
`framer.agent.serialize({ id: "EiCUZ0sVC", depth: 2 })` — `$variants: [{name:"Default", id:"OSZXw3DUH"}, {name:"Overlay", id:"BU9VdIEbd"}, {name:"horizontal Small", id:"k8p5fPamx"}, {name:"horizontal Big", id:"ZN8y56CSQ"}, {name:"Default", id:"RhHYcSaiK"}, {name:"Overlay", id:"O_DdWUeNW"}, {name:"horizontal Small", id:"cESGoZn84"}, {name:"horizontal Big", id:"OyehRjapS"}]`.

Recommended Fix:
Rename duplicates (e.g. `Default Desktop` / `Default Mobile`) and normalize casing to Title Case: `Horizontal Small`, `Horizontal Big`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-228 — Arrow Button: variants named "Variant 1" / "Variant 2" — generic, non-descriptive

Status: Open
Category: Components
Severity: Medium
Location: Component `mEQe6u3a9` "Arrow Button" — `$variants` array

Description:
Arrow Button has 2 variants named `Variant 1` and `Variant 2` (ids `TNH7J0Qb0` and `iAiaLvEC_`). These names convey no information about what differs between them. Visual inspection shows Variant 1 has two IconNodes (likely left+right arrows) and Variant 2 is a replica with the same structure but possibly different icon overrides. The component also exposes only `Color` and `Shadow` — no text/link/icon controls — making it essentially a static arrow pair. Arrow Button is used 16 times nested inside Blog Card (×8 variants × 2 = 16). Editors inserting it have no way to know which variant to pick.

Evidence:
`framer.agent.serialize({ id: "mEQe6u3a9", depth: 2 })` — `$variants: [{name:"Variant 1", id:"TNH7J0Qb0"}, {name:"Variant 2", id:"iAiaLvEC_"}]`. Variables: `[{name:"Color", type:"color"}, {name:"Shadow", type:"boxshadow"}]`.

Recommended Fix:
Rename variants to describe their visual difference (e.g. `Default`, `Hover` if they represent states, or `Light`, `Dark` if they represent color schemes). If they really are just two arrow styles, name them after the style (e.g. `Arrow Pair`, `Single Arrow`).

Confidence: Medium
Discovered by: sub-agent 11, session DR

---

## DR-229 — Buy Button: variants named "Variant 1" / "Variant 2" — generic, non-descriptive

Status: Open
Category: Components
Severity: Medium
Location: Component `sfrLnUdBr` "Buy Button" — `$variants` array

Description:
Buy Button has 2 variants named `Variant 1` and `Variant 2` (ids `SVjbUIE_y` and `HsPFOPesC`). Variant 1 has a dark fill (`var(--token-c8873226-6828-48de-9374-e4136018a41e)` = neutral-900); Variant 2 has a blue gradient fill (`linear-gradient(135deg, Primary 20%, Secondary 100%)`). These are clearly two different button color treatments but the names don't say so. Buy Button is placed in the layout template (`aqBIOKUF4`) and renders on every page.

Evidence:
`framer.agent.serialize({ id: "sfrLnUdBr", depth: 2 })` — `$variants: [{name:"Variant 1", id:"SVjbUIE_y"}, {name:"Variant 2", id:"HsPFOPesC"}]`. Variant 1 fill: `var(--token-c8873226-6828-48de-9374-e4136018a41e)`. Variant 2 fill: `linear-gradient(135deg, var(--token-8d76f153-...) 20%, var(--token-19435b3e-...) 100%)`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/sfrLnUdBr-Buy_Button.jpg`.

Recommended Fix:
Rename to `Dark` (Variant 1) and `Gradient` (Variant 2), or `Plain` and `Brand Gradient`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-230 — Why Us Card, Mission Card, Trust Card: single variant lazily named "Variant 1"

Status: Open
Category: Components
Severity: Medium
Location: Components `Sr15oMIZ5` "Why Us Card" (variant `eLTuHFRKH`), `HW4zuDyG0` "Mission Card" (variant `T8AgWWETe`), `YwXTWsIji` "Trust Card" (variant `Zj29N1s6q`)

Description:
Three card components each have exactly one variant, and in all three cases that variant is named `Variant 1`. This is Framer's auto-generated default name — it was never renamed. The result is that the Framer editor's variant dropdown shows "Variant 1" for every instance of these components, which is uninformative. Why Us Card has 24 instances, Mission Card 9 (on /about), and Trust Card 9 on the home page — collectively ~42 instances with the same meaningless variant label.

Evidence:
Serialize of all three components — each has `$variants: [{name:"Variant 1", id:"..."}]`. Screenshots: `/home/z/my-project/tool-results/sub11/screenshots/Sr15oMIZ5-Why_Us_Card.jpg`, `HW4zuDyG0-Mission_Card.jpg`, `YwXTWsIji-Trust_Card.jpg`.

Recommended Fix:
Rename each single variant to `Default` (or remove the variant entirely if Framer allows — single-variant components can sometimes be flattened).

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-231 — Testimonial card: single variant named "Variant"

Status: Open
Category: Components
Severity: Medium
Location: Component `ruZNfQdon` "Testimonial card" — `$variants: [{name:"Variant", id:"jRkrJbY5H"}]`

Description:
Testimonial card has one variant named `Variant` — Framer's auto-generated default name, never renamed. The internal node name `Jon Testimonial Author` (RichTextNode `NQrKw7yAl` inside the Author frame) suggests leftover sample data naming ("Jon" — likely a placeholder author name from initial design). 6 instances on home page.

Evidence:
`framer.agent.serialize({ id: "ruZNfQdon", depth: 2 })` — `$variants: [{name:"Variant", id:"jRkrJbY5H"}]`. Internal RichTextNode name `Jon Testimonial Author` (bound to `var(--variable-NQrKw7yAl)` / Full Name variable). Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/ruZNfQdon-Testimonial_card.jpg`.

Recommended Fix:
Rename the variant to `Default`. Optionally rename the internal RichTextNode from `Jon Testimonial Author` to `Author Name`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-232 — Teem Card: single variant named "L" (ambiguous — likely "Large")

Status: Open
Category: Components
Severity: Medium
Location: Component `T6DVfhsAL` "Teem Card" — `$variants: [{name:"L", id:"XSt04gwsA"}]`

Description:
Teem Card has one variant named `L`. This is ambiguous — it likely stands for "Large" but a single-letter variant name conveys no useful information and doesn't match any sizing convention in the project (the Icon component uses `XL, L, M, S, XS` as separate variants). 24 instances on home page.

Evidence:
`framer.agent.serialize({ id: "T6DVfhsAL", depth: 2 })` — `$variants: [{name:"L", id:"XSt04gwsA"}]`.

Recommended Fix:
Rename to `Default` (since there's only one variant, the size qualifier is meaningless) or add additional size variants (`S`, `M`, `L`) if the design truly needs them.

Confidence: Medium
Discovered by: sub-agent 11, session DR

---

## DR-233 — Nav Bar: 6 variants encoding "active link" state — should be a property, not 6 variants

Status: Open
Category: Components
Severity: Medium
Location: Component `bTXu1FqyY` "Nav Bar" — `$variants: [Default, Home Active, Services Active, About Active, Blog Active, Contact Active]`

Description:
Nav Bar encodes which nav link is "active" as 6 separate variants: `Default`, `Home Active`, `Services Active`, `About Active`, `Blog Active`, `Contact Active`. This is a fragile pattern — adding a new nav link (e.g. "Booking") requires creating a 7th variant, and every page that uses Nav Bar must explicitly pick the right variant. The Header component already exposes an `Active Link` option variable (`$control__activeLink`) for exactly this purpose, but Nav Bar doesn't honor it — it relies on variant selection instead. Nav Bar is nested 4× inside Header (Desktop/Tablet/Phone breakpoints × 2 Header variants).

Evidence:
`framer.agent.serialize({ id: "bTXu1FqyY", depth: 2 })` — `$variants: [{name:"Default", id:"GBHKk2wfg"}, {name:"Home Active", id:"zoi6vWvSq"}, {name:"Services Active", id:"wKsJPXiD6"}, {name:"About Active", id:"eZsgGzdxK"}, {name:"Blog Active", id:"SlVOr2Z70"}, {name:"Contact Active", id:"bpDYafag8"}]`. Header has variable `[{name:"Active Link", type:"option"}]`.

Recommended Fix:
Convert Nav Bar to a single `Default` variant that reads the active-link state from a new `Active Link` option variable (matching Header's pattern). Each NavLink Button inside Nav Bar can compare its own link to the active link to decide whether to render the "Active" or "Not Active" sub-variant. This collapses 6 variants → 1 and removes the need to pick a variant per page.

Confidence: Medium
Discovered by: sub-agent 11, session DR

---

## DR-234 — CTA: hardcoded background image URL, not exposed as a variable

Status: Open
Category: Components
Severity: Medium
Location: Component `GkwGTE6uU` "CTA" — `FrameNode "Background"` inside variant `UibekDVdI` "Desktop" (and replicated in Tablet/Mobile)

Description:
The CTA's background image is hardcoded as `fill=https://framerusercontent.com/images/qWq64aaaj4o60PKbwV3yhb4p3g.webp`. CTA exposes three string variables (`Title`, `Description`, `Button Text`) but no `Background Image` variable. The CTA is placed in the layout template (`wOy01xYuf`) so it renders on every page — yet editors cannot swap the background image per page or per campaign without editing the component.

Evidence:
`framer.agent.serialize({ id: "GkwGTE6uU", depth: 4 })` — variant `UibekDVdI` Desktop contains `FrameNode/Background` with `fill: "https://framerusercontent.com/images/qWq64aaaj4o60PKbwV3yhb4p3g.webp"`. Variables: `[{name:"Title"}, {name:"Description"}, {name:"Button Text"}]`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/GkwGTE6uU-CTA.jpg`.

Recommended Fix:
Add a `Background Image` (image) variable to CTA and bind the Background frame's `fill` attribute to it.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-235 — Footer: hardcoded logo gradient and border color (not color styles)

Status: Open
Category: Components
Severity: Medium
Location: Component `Xx2RpZ5pV` "Footer" — `FrameNode "Logo Icon"` (variant `SM4CTALR7` Desktop and replicas)

Description:
The Footer's Logo Icon uses `fill=linear-gradient(0deg, var(--token-8d76f153-...) 20%, ...)` (good — references Primary) but its `border=1px solid rgb(152, 204, 247)` is a hardcoded color not in the project's color styles. The closest existing style is `Accent Cyan Light` (`rgb(40, 215, 235)`) or `slate-300` (`rgb(202, 213, 226)`), neither of which matches `rgb(152, 204, 247)`. This means future color system updates won't propagate to the Footer logo border.

Evidence:
`framer.agent.serialize({ id: "Xx2RpZ5pV", depth: 5 })` — `FrameNode/Logo Icon` has `border: "1px solid rgb(152, 204, 247)"`. Project color styles list does not contain `rgb(152, 204, 247)`.

Recommended Fix:
Either pick an existing color style (e.g. add alpha to `Accent Cyan Light` or use a new style) or add a new color style "Border/Light Blue" = `rgb(152, 204, 247)` and reference it via `var(--token-<id>)`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-236 — Mission Card: hardcoded border color `rgb(236, 236, 236)`

Status: Open
Category: Components
Severity: Medium
Location: Component `HW4zuDyG0` "Mission Card" — variant `T8AgWWETe` "Variant 1" (and replicated across the component)

Description:
Mission Card's outer frame uses `border=1px solid rgb(236, 236, 236)` — a hardcoded color. The project has `neutral-100` (`rgb(245, 245, 245)`) and `slate-100` (`rgb(241, 245, 249)`) which are close but not equal; `rgb(236, 236, 236)` doesn't match any existing color style. Mission Card has 9 instances on `/about`.

Evidence:
`framer.agent.serialize({ id: "HW4zuDyG0", depth: 4 })` — variant `T8AgWWETe` has `border: "1px solid rgb(236, 236, 236)"`. Color styles list does not contain `rgb(236, 236, 236)`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/HW4zuDyG0-Mission_Card.jpg`.

Recommended Fix:
Add a new "Border Subtle Light" color style (or extend `Border Subtle`) and reference it via `var(--token-<id>)`, or pick an existing style like `neutral-100` and update the design accordingly.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-237 — Price list card: hardcoded text colors, divider fill, fontSize, and font — bypasses the design system

Status: Open
Category: Components
Severity: Medium
Location: Component `XX2THh6jc` "Price list card" — all RichTextNodes in variant `LF0mywFke` "Default"; all Divider nodes; row text styling

Description:
In addition to being orphaned (see DR-11-2), the Price list card bypasses the project's design system in five ways:
1. Row text color `rgb(28, 64, 78)` (×5 RichTextNodes) — doesn't match any color style. Closest is `Text` (`rgb(24, 50, 77)`).
2. Price text color uses `var(--token-8d76f153-...)` (Primary) — good.
3. Divider fill `rgba(64, 169, 255, 0.25)` (×5 Divider frames) — hardcoded, doesn't reference Primary with alpha.
4. Hardcoded `fontSize=16px` on all row RichTextNodes — should use `Text M` text style (which is 16px Inter 400).
5. Hardcoded `fontName=Inter` + `fontWeight=600` — doesn't reference any text style preset.

Evidence:
`framer.agent.serialize({ id: "XX2THh6jc", depth: 5 })` — 5 RichTextNodes with `textColor: "rgb(28, 64, 78)"`; 5 Divider frames with `fill: "rgba(64, 169, 255, 0.25)"`; 10 RichTextNodes with `fontSize: "16px", fontName: "Inter", fontWeight: 600`. Project text style `Text M` is `16px / Inter / 400`.

Recommended Fix:
If the component is kept, swap `rgb(28, 64, 78)` → `var(--token-8a93520a-...)` (Text); swap `rgba(64, 169, 255, 0.25)` → `var(--token-8d76f153-...)` (Primary) with alpha or to a new "Primary 25%" color style; apply the Text M text style preset to the row text nodes.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-238 — Buy Button: hardcoded fontSize (14px, 10px) and font weights — bypasses text styles

Status: Open
Category: Components
Severity: Medium
Location: Component `sfrLnUdBr` "Buy Button" — RichTextNodes `ZYiXBF4EE` "Brand Name" (14px / Manrope / 400), `GeDtk56NK` "for" (10px / Inter / 500), `QDcE0o_Jp` "Price" (10px / Inter / 400) in both variants

Description:
Buy Button uses hardcoded `fontSize=14px` for the brand name and `fontSize=10px` for the "for"/"Price" row, with hardcoded `fontName` and `fontWeight`. None of these text nodes reference the project's text styles. The closest existing styles are `Text S` (14px Inter 400) and `Text XS` (12px Inter 400). The 10px size doesn't match any text style — it's smaller than the smallest defined style.

Evidence:
`framer.agent.serialize({ id: "sfrLnUdBr", depth: 8 })` — RichTextNode `ZYiXBF4EE` has `fontSize: "14px", fontName: "Manrope", fontWeight: 400`. RichTextNode `GeDtk56NK` has `fontSize: "10px", fontName: "Inter", fontWeight: 500`. RichTextNode `QDcE0o_Jp` has `fontSize: "10px", fontName: "Inter", fontWeight: 400`. Project text styles: `Text XS = 12px Inter 400`, `Text S = 14px Inter 400`.

Recommended Fix:
Apply the `Text S` text style to the "Brand Name" RichTextNode (will switch font from Manrope to Inter — verify the design still looks right, or extend the text style system with a Manrope variant). For the 10px text, either create a new `Text XXS` (10px Inter) text style or upgrade the size to 12px to use `Text XS`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-239 — Button component proliferation: 5 separate button components with overlapping concerns

Status: Open
Category: Components
Severity: Medium
Location: Components `ARbK0E6gq` Primary Button, `NoQy1opGY` Outline Button, `mEQe6u3a9` Arrow Button, `gUM1o8Yyz` NavLink Button, `sfrLnUdBr` Buy Button

Description:
The project has 5 separate button components with overlapping concerns:
- **Primary Button** (14 variants, 14 variables) — full-featured CTA button with success/error/loading states.
- **Outline Button** (3 variants, 14 variables) — same feature set as Primary but with border instead of fill.
- **Arrow Button** (2 variants, 2 variables only) — minimal icon-only button with no text/link/icon controls; used 16× inside Blog Card.
- **NavLink Button** (3 variants, 7 variables) — text + dot indicator + icon; used 63× inside Nav Bar + Footer.
- **Buy Button** (2 variants, 2 variables only) — pre-built "buy" CTA with hardcoded brand/price text.

Primary and Outline are nearly identical in their variable surface (14 vs 14) — they could be unified into a single `Button` component with a `Style` property (`Solid` / `Outline` / `Gradient`). Arrow Button has so few variables it can't be customized — it could be a variant of Icon component (`xFfPt2L2l`) instead. Buy Button could be a special variant of Primary Button with extra "Brand Name" / "Price" fields shown only in that variant.

Evidence:
Per-component serialize results — see DR-11-1, DR-11-3, DR-11-12, DR-11-13, DR-11-18, DR-11-19 for individual evidence.

Recommended Fix:
This is a longer-term refactor. Consolidate Primary + Outline into a single Button component with a `Variant` property (Solid/Outline/Gradient). Promote Arrow Button into an Icon variant or expand its variable surface (text, link, icon). Consider whether Buy Button justifies its own component or could be expressed as a Button variant + an Image slot.

Confidence: Medium
Discovered by: sub-agent 11, session DR

---

## DR-240 — Card component proliferation: 9+ card components with overlapping concerns

Status: Open
Category: Components
Severity: Medium
Location: Components `ecHzMZLnH` Service Card, `XX2THh6jc` Price list card, `Sr15oMIZ5` Why Us Card, `YwXTWsIji` Trust Card, `HW4zuDyG0` Mission Card, `Hn1T3Ve4o` Stat Card, `T6DVfhsAL` Teem Card, `ruZNfQdon` Testimonial card, `EiCUZ0sVC` Blog Card, `Iz7ICmC8H` Contact Card, `cXuHXndOE` Map card

Description:
The project has 11 card-type components. Many share a near-identical structure (icon/image + title + description + optional CTA), but each is a separate component with its own variable surface:
- **Service Card** — Title, Description, Icon, Link + "Learn More" hardcoded action text
- **Why Us Card** — Image, Image 2, Title, Description, Background Visible, two radius controls
- **Trust Card** — Icon, Title, Description, Border, Lucide Icon toggle (note: has duplicate icon system — both `Icon` and `Lucide Icon`)
- **Mission Card** — Title, Content, Icon Name (named differently from "Icon" in other cards)
- **Stat Card** — Title, Description, Icon, Prefix, Number, Suffix, Badge — the most elaborate
- **Teem Card** (typo) — Image, Name, Job
- **Testimonial card** — Testimonial Text, Profile Image, Full Name, Owner Type
- **Contact Card** — Title, Description, Icon, Button
- **Blog Card** — Cover, Title, Description, Date, Type, Read Time, Auther Name (typo), Link, etc.
- **Map card** — Location, Radius, Border, Shadow (wraps GoogleMaps)
- **Price list card** — orphaned, see DR-11-2

Evidence:
Per-component serialize — variable lists documented in each component's `variables` array. Trust Card variables: `Icon, Title, Description, Padding, Border, Lucide Icon?, Lucide Icon`. Mission Card: `Title, Content, Icon Name` (no Padding/Radius/Border). Service Card: `Title, Description, Icon, Link, Padding, Shadow` (no Radius, no Button Text).

Recommended Fix:
Long-term refactor. Define a base `Card` component with a common variable surface (Title, Description, Icon, Image, Padding, Radius, Border, Shadow). Compose specialized cards (Stat, Blog, Testimonial, etc.) by adding their unique variables on top. Standardize variable naming (`Icon` everywhere, not `Icon Name`). Resolve the dual icon system in Trust Card and Icon component — pick one path (single Icon variable that accepts any icon set, or a typed `Icon Set` + `Icon Name` pair).

Confidence: Medium
Discovered by: sub-agent 11, session DR

---

## DR-241 — Icon component: variant order is non-sequential (L, XL, M, S, XS)

Status: Open
Category: Components
Severity: Low
Location: Component `xFfPt2L2l` "Icon" — `$variants` array

Description:
Icon has 5 size variants in this order: `L, XL, M, S, XS`. The order is non-sequential — it should be `XL, L, M, S, XS` (largest to smallest) to match the convention used by the 5 Stars component (which correctly uses `XL, L, M, S, XS`). This makes the variant dropdown confusing for editors.

Evidence:
`framer.agent.serialize({ id: "xFfPt2L2l", depth: 2 })` — `$variants: [{name:"L", id:"QsfCJjWi5"}, {name:"XL", id:"L_wvSjJXx"}, {name:"M", id:"m7QUtyVN3"}, {name:"S", id:"JCaYkQX4b"}, {name:"XS", id:"emhq9fyZU"}]`. Compare 5 Stars: `[{name:"XL"}, {name:"L"}, {name:"M"}, {name:"S"}, {name:"XS"}]` — correct order.

Recommended Fix:
Reorder the `$variants` array so XL comes first, then L, M, S, XS. (In Framer this is done by dragging variants in the component editor.)

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-242 — Footer vs CTA: inconsistent breakpoint terminology ("Phone" vs "Mobile")

Status: Open
Category: Components
Severity: Low
Location: Components `Xx2RpZ5pV` "Footer" (variants Desktop, Tablet, Phone) and `GkwGTE6uU` "CTA" (variants Desktop, Tablet, Mobile)

Description:
Footer uses "Phone" for its smallest-breakpoint variant; CTA uses "Mobile" for the same concept. The project should standardize on one term. Other components (Header) use "Phone" — so CTA is the outlier.

Evidence:
`framer.agent.serialize({ id: "Xx2RpZ5pV", depth: 2 })` — `$variants: [{name:"Desktop"}, {name:"Tablet"}, {name:"Phone"}]`. `framer.agent.serialize({ id: "GkwGTE6uU", depth: 2 })` — `$variants: [{name:"Desktop"}, {name:"Tablet"}, {name:"Mobile"}]`. Header uses `Desktop, Desktop Open, Tablet, Phone`.

Recommended Fix:
Pick one term project-wide. Recommend "Phone" (matches Header and Footer, and Framer's default Phone breakpoint). Rename CTA's `Mobile` variant → `Phone`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-243 — Footer: copyright year "2026" hardcoded

Status: Open
Category: Components
Severity: Low
Location: Component `Xx2RpZ5pV` "Footer" — TextRun `v:<copyright text node>:0:0` text = `"© 2026 Vetly. All rights reserved."`

Description:
The Footer copyright text contains the literal year "2026". This must be manually updated each calendar year or the site will show a stale copyright. The current project context confirms the system date is `August 6, 2026`, so the value is currently correct, but it will be wrong on January 1, 2027.

Evidence:
`framer.agent.serialize({ id: "Xx2RpZ5pV", depth: 5 })` — TextRun text `"© 2026 Vetly. All rights reserved."`. Project `additionalContext.currentDate` = "August 6, 2026".

Recommended Fix:
Either (a) expose a `Year` string variable on Footer and bind it, or (b) replace the literal year with a Framer date-expression that renders the current year (e.g. `{"from": "now", "transforms": [{"name": "toDateString", "dateStyle": "year"}]}` or similar), or (c) at minimum add a calendar reminder to update it annually.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-244 — Testimonial card: leftover sample-data node name "Jon Testimonial Author"

Status: Open
Category: Components
Severity: Low
Location: Component `ruZNfQdon` "Testimonial card" — RichTextNode `NQrKw7yAl` (bound to Full Name variable) inside variant `jRkrJbY5H`

Description:
The RichTextNode that displays the testimonial author's full name is internally named `Jon Testimonial Author` — likely a leftover sample-data name from initial design ("Jon" being a placeholder author). The node is correctly bound to the `Full Name` variable, so the visible text is dynamic, but the internal node name is unprofessional and appears in the Framer layers panel.

Evidence:
`framer.agent.serialize({ id: "ruZNfQdon", depth: 4 })` — RichTextNode `name: "Jon Testimonial Author", id: "NQrKw7yAl", text: "var(--variable-NQrKw7yAl)"`.

Recommended Fix:
Rename the RichTextNode from `Jon Testimonial Author` to `Author Name`.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-245 — Nav Dropdown: inconsistent capitalization in nested button labels ("About US")

Status: Open
Category: Components
Severity: Low
Location: Component `hc6IgBhgF` "Nav Dropdown" — nested ComponentInstanceNode labels

Description:
The Nav Dropdown contains 4 nested Primary Button instances used as nav links, with these names: `Services`, `About US`, `Blog`, `Contact Us`. The label `About US` is inconsistent — "US" is fully uppercase while "Us" in `Contact Us` is Title Case. The instance name is what propagates to the Framer layers panel and to the visible label if the button uses its own name as fallback text. While the actual button text comes from the Primary Button's `Title` variable override (set on each instance), the inconsistent instance naming is still a quality issue.

Evidence:
`framer.agent.getDescendantsOfTypes({ id: "hc6IgBhgF", types: ["ComponentInstanceNode"] })` — nested instances include `gmIH1wdr4 component=ARbK0E6gq name=Services`, `v6AYL1_DZ component=ARbK0E6gq name=About US`, `XdgyF3M_R component=ARbK0E6gq name=Blog`, `HMbEERxMc component=ARbK0E6gq name=Contact Us`.

Recommended Fix:
Rename the `About US` instance to `About Us` to match the Title Case used by the other three.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-246 — Multiple card components use hardcoded box-shadow rgba values (no shadow styles)

Status: Open
Category: Components
Severity: Low
Location: Components `DyeB4pqpe` Badge, `ruZNfQdon` Testimonial card, `Hn1T3Ve4o` Stat Card, `sMRugCuTF` Load More, `Sr15oMIZ5` Why Us Card, `Iz7ICmC8H` Contact Card, `HW4zuDyG0` Mission Card, `YwXTWsIji` Trust Card, `ARbK0E6gq` Primary Button, `NoQy1opGY` Outline Button, `sfrLnUdBr` Buy Button

Description:
Eleven components define `boxShadows` using raw rgba strings like `0px 4px 12px -1px rgba(0, 0, 0, 0.06)` or `0px 4px 12px -2px rgba(0, 0, 0, 0.02)`. While the alpha values vary slightly (0.02, 0.03, 0.04, 0.06), they all represent the same conceptual "subtle card shadow". Framer supports shadow styles (analogous to color styles) but none are defined in this project — every shadow is hardcoded. This means a future shadow redesign requires editing every component individually.

Evidence:
See per-component `boxShadows` arrays in serialize output. Primary Button alone has 62 hardcoded shadow strings across its 14 variants.

Recommended Fix:
Define 2–3 shadow styles in the project (e.g. "Shadow/Card Subtle", "Shadow/Card Hover", "Shadow/Button Glow") and reference them from each component. The Primary Button glow stack (6 layers) is the strongest candidate for promotion to a shared shadow style.

Confidence: High
Discovered by: sub-agent 11, session DR

---

## DR-247 — Stat Card: "Active" variants encode hover/active state instead of using event handlers

Status: Open
Category: Components
Severity: Low
Location: Component `Hn1T3Ve4o` "Stat Card" — variants `F_Z3kCh1C` "Horizontal Active" and `or_5PzZWV` "Vertical Active"

Description:
Stat Card has 4 variants: `Vertical`, `Horizontal`, `Horizontal Active`, `Vertical Active`. The "Active" variants appear to encode a hover/pressed/active visual state (e.g. colored background or shadow lift). Framer supports event-driven state styling (Hover, Pressed, Focus) via the `appearEffect` / `transition` attributes — but this pattern uses duplicate variants instead. This means switching to the "Active" state requires JS to swap variants at runtime, rather than CSS-driven :hover. 12 instances on `/about`.

Evidence:
`framer.agent.serialize({ id: "Hn1T3Ve4o", depth: 2 })` — `$variants: [{name:"Vertical"}, {name:"Horizontal"}, {name:"Horizontal Active"}, {name:"Vertical Active"}]`. The 4 variants have nearly identical structure but presumably different fill/border/shadow styling.

Recommended Fix:
Convert "Active" state styling to Framer's native hover state (set the Hover appearance on the Vertical and Horizontal variants). Delete the "Active" variants. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/Hn1T3Ve4o-Stat_Card.jpg`.

Confidence: Medium
Discovered by: sub-agent 11, session DR

---

## DR-248 — Trust Card and Icon component both have a "Lucide Icon?" boolean toggle creating a duplicate icon slot

Status: Open
Category: Components
Severity: Low
Location: Components `YwXTWsIji` "Trust Card" (variables `Lucide Icon?`, `Lucide Icon`, plus `Icon`) and `xFfPt2L2l` "Icon" (variables `Lucide Icon?`, `Lucide Icon`, plus `Icon`)

Description:
Both Trust Card and the Icon component expose a `Lucide Icon?` boolean that, when true, presumably shows a Lucide-set icon instead of the regular Icon. This creates two parallel icon systems inside a single component — editors must know to toggle the boolean AND set the right icon variable. The Phosphor icon set is also installed (project context shows `["Icon Set","Phosphor","Iconic","Feather","Hero","Lucide","Flowbite","Material","Meteor","Basicons","Nonicons","Sargam","Mage"]`), so the special-casing of Lucide is arbitrary. Why Lucide and not Phosphor or Hero?

Evidence:
`framer.agent.serialize({ id: "YwXTWsIji", depth: 2 })` — variables include `[{name:"Icon", type:"icon"}, {name:"Lucide Icon?", type:"boolean"}, {name:"Lucide Icon", type:"icon"}]`. Same pattern in Icon component.

Recommended Fix:
Drop the `Lucide Icon?` / `Lucide Icon` pair. Let the single `Icon` variable accept any icon from any installed set (Framer's icon variable type already supports this). If a real reason exists to special-case Lucide (e.g. a different visual style), document it in the component description; otherwise remove.

Confidence: Medium
Discovered by: sub-agent 11, session DR

---

## DR-249 — 5 Stars XL variant mixes SVGNode and IconNode types inconsistently

Status: Open
Category: Components
Severity: Low
Location: Component `Uqn4x3nhl` "5 Stars" — variant `vaNNg4o7C` "XL" contains 5 SVGNodes + 1 IconNode

Description:
The XL variant of 5 Stars contains 5 `SVGNode` instances and 1 `IconNode`. The other 4 variants (L, M, S, XS) presumably have the same structure. Mixing SVGNode and IconNode for the same conceptual element (a star) is inconsistent — either all stars should be SVGNodes (custom path) or all should be IconNodes (from an icon set). The `IconNode` is likely the "half star" controlled by the `Half Star Visible` boolean, but using a different node type for it makes the variant structure harder to maintain. 3 instances on home page.

Evidence:
`framer.agent.serialize({ id: "Uqn4x3nhl", depth: 4 })` — variant `vaNNg4o7C` "XL" contains `SVGNode/Star` (×5) + `IconNode/Star` (×1). Variables: `Star Color`, `Half Star Visible`, `Count`, `5 Star`. Screenshot: `/home/z/my-project/tool-results/sub11/screenshots/Uqn4x3nhl-5_Stars.jpg`.

Recommended Fix:
Convert all 5 SVGNodes to IconNodes (using a "Star" icon from any installed set), or convert the single IconNode to an SVGNode. Pick one node type for consistency.

Confidence: Medium
Discovered by: sub-agent 11, session DR

---

## Summary Table

| ID | Component | Severity | Issue |
|---|---|---|---|
| DR-11-1 | Buy Button | Critical | Hardcoded "Vetly"/"for"/"$129"; only Link+Image variables |
| DR-11-2 | Price list card | Critical | Orphaned (0 usages); all copy hardcoded |
| DR-11-3 | Load More | Critical | "Load More" hardcoded; only onClick variable |
| DR-11-4 | Service Card | High | "Learn More" hardcoded; no Action Text variable |
| DR-11-5 | Primary Button | High | Success/Error text hardcoded; inconsistent caps |
| DR-11-6 | Footer | High | Zero component variables; all content hardcoded |
| DR-11-7 | Header | High | Logo URL hardcoded; no Logo variable |
| DR-11-8 | Blog Card | High | "horizontal Small" Title loses variable binding |
| DR-11-9 | Buy Button | High | Variant 2 hardcoded rgba text color |
| DR-11-10 | Teem Card | High | Typo "Teem" → "Team" |
| DR-11-11 | Blog Card + Blog Meta | High | Typo "Auther Name" → "Author Name" |
| DR-11-12 | Primary Button | Medium | 14 variants with duplicate names |
| DR-11-13 | Outline Button | Medium | 3 variants all named "Outline" |
| DR-11-14 | NavLink Button | Medium | Duplicate "Not Active" variant |
| DR-11-15 | Service Card | Medium | 2 variants both named "Default" |
| DR-11-16 | FAQ item | Medium | 6 variants with duplicate names |
| DR-11-17 | Blog Card | Medium | 8 variants with duplicate names + lowercase |
| DR-11-18 | Arrow Button | Medium | Generic "Variant 1"/"Variant 2" |
| DR-11-19 | Buy Button | Medium | Generic "Variant 1"/"Variant 2" |
| DR-11-20 | Why Us/Mission/Trust Card | Medium | Single variant lazily named "Variant 1" |
| DR-11-21 | Testimonial card | Medium | Single variant named "Variant" |
| DR-11-22 | Teem Card | Medium | Single variant named "L" |
| DR-11-23 | Nav Bar | Medium | 6 active-state variants (should be a property) |
| DR-11-24 | CTA | Medium | Hardcoded background image URL |
| DR-11-25 | Footer | Medium | Hardcoded logo border color |
| DR-11-26 | Mission Card | Medium | Hardcoded border color rgb(236,236,236) |
| DR-11-27 | Price list card | Medium | Hardcoded colors, font size, font |
| DR-11-28 | Buy Button | Medium | Hardcoded fontSize/fontWeight |
| DR-11-29 | All buttons | Medium | 5 overlapping button components |
| DR-11-30 | All cards | Medium | 11 overlapping card components |
| DR-11-31 | Icon | Low | Non-sequential variant order |
| DR-11-32 | Footer vs CTA | Low | "Phone" vs "Mobile" inconsistency |
| DR-11-33 | Footer | Low | Hardcoded year "2026" |
| DR-11-34 | Testimonial card | Low | Leftover "Jon Testimonial Author" node name |
| DR-11-35 | Nav Dropdown | Low | "About US" inconsistent capitalization |
| DR-11-36 | 11 components | Low | Hardcoded box-shadow rgba (no shadow styles) |
| DR-11-37 | Contact Card | Low | Button variable binding needs verification |
| DR-11-38 | Stat Card | Low | "Active" variants instead of hover state |
| DR-11-39 | Trust Card + Icon | Low | Duplicate "Lucide Icon" toggle |
| DR-11-40 | 5 Stars | Low | Mixed SVGNode/IconNode in XL variant |

---

## DR-250 — FAQAccordion.tsx is an empty code file (dead code in project)

Status: Open
Category: Components
Severity: Critical
Location: Code file `FAQAccordion.tsx` (id `dRQ_68D`, project root path)

Description:
The code file `FAQAccordion.tsx` is registered in the project (id `dRQ_68D`, path `FAQAccordion.tsx`) but its content is **0 characters** — completely empty. Confirmed via three independent API paths: `framer.getCodeFiles()` returns `content: ""` (length 0); `framer.agent.serialize({ id: "dRQ_68D" })` returns `null`; and the project inventory snapshot shows `"FAQAccordion.tsx":[]` (empty exports array). The scope (sub-agent #12 task) requires this file to implement an accessible FAQ accordion with keyboard support: *"FAQAccordion specifically: keyboard support (Enter/Space to toggle, arrow keys to navigate, `aria-expanded`, `aria-controls`, `aria-labelledby`)"* — none of which can be present in an empty file.

The FAQ UI on the live site is built entirely with native components (`xUmE2HP3j` "FAQ item" + `JAj4Xq8VO` "FAQ Close Icon") — confirmed by `getNodesOfTypes({ types: ["ComponentInstanceNode"] })` which returns 90 `FAQ item` instances across Home (6), About (6), Documentation (72), Contact (3), Brand Guide (3). No `ComponentInstanceNode` references `codeFile/dRQ_68D:default` and no `CodeOverrideNode` exists in the project (count = 0). So the empty `FAQAccordion.tsx` is dead code: registered, never used, never exports anything.

This is a critical finding because (a) it indicates a half-finished or abandoned implementation that should either be completed or removed, (b) the empty file may produce a TypeScript / Framer build warning ("Module has no exports"), (c) it pollutes the code-file inventory and will confuse future maintainers who expect the file to do what its name promises.

Evidence:
- `framer.getCodeFiles()` → `FAQAccordion.tsx (id=dRQ_68D): 0 chars` (verified three times across separate CLI exec calls).
- Project inventory snapshot `project-inventory.md` (see source file via framer.getCodeFiles()): `{"FAQAccordion.tsx":[],"Workshop/ImageReveal.tsx":[{"id":"codeFile/hZwaqDB:default",...}],"Workshop/HamburgerMenu.tsx":[...],"BackButton.tsx":[...]}` — only FAQAccordion has an empty exports array.
- `framer.agent.getNodesOfTypes({ types: ["ComponentInstanceNode"] })` filtered by `component.includes("dRQ_68D")` → 0 results.
- `framer.agent.getNodesOfTypes({ types: ["CodeOverrideNode"] })` → 0 results (no overrides anywhere).

Recommended Fix:
Either (a) delete `FAQAccordion.tsx` from the code-file registry (it is dead code, the FAQ UI is built natively), OR (b) implement an actual `FAQAccordion` component per the scope requirements — a default-exported named function with `addPropertyControls`, keyboard support (Enter/Space to toggle, ArrowUp/ArrowDown to move focus between items), and proper ARIA wiring (`aria-expanded`, `aria-controls`, `aria-labelledby` on each toggle button; `role="region"` on each panel). Option (a) is preferable unless there is a known product reason to introduce a code-based accordion (e.g. animation needs beyond what native overrides can do).

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-251 — HamburgerMenu.tsx hides the checkbox with `display: "none"`, breaking keyboard access

Status: Open
Category: Accessibility & compliance
Severity: Critical
Location: `Workshop/HamburgerMenu.tsx` (see source file via framer.getCodeFiles()) (the `<input type="checkbox">` element)

Description:
The HamburgerMenu component implements its toggle as a `<label>` wrapping a hidden `<input type="checkbox">`:

```tsx
<input
    type="checkbox"
    checked={isChecked}
    onChange={handleChange}
    style={{ display: "none" }}
    aria-label="Toggle menu"
/>
```

Setting `display: "none"` on the input removes it from the tab order and from the accessibility tree in every major browser. The wrapping `<label>` is **not focusable** by default. The result: keyboard-only users cannot focus the toggle, cannot activate it with Enter/Space, and have no way to open or close the mobile navigation menu. This is a WCAG 2.1 Level A violation (Success Criterion 2.1.1 Keyboard) and is a Critical accessibility bug — the mobile menu is the primary navigation on small screens, so blocking keyboard access blocks navigation entirely.

The skill file's accessibility section says: *"aria roles on interactive elements; Semantic HTML (`<nav>`, `<article>`, `<section>`); alt=`""` on decorative images; 4.5:1 color contrast."* The component uses semantic HTML (`<input type="checkbox">`) but defeats its semantics with `display: none`.

Evidence:
Exact code quoted above ((see source file via framer.getCodeFiles()) of `Workshop/HamburgerMenu.tsx`). Verified via `framer.getCodeFiles()` returning the full source — the file content (length 3,849 chars) contains exactly one `<input>` element and its inline style is `{ display: "none" }`.

Recommended Fix:
Replace the label-wrapping-hidden-checkbox pattern with a real `<button>`:

```tsx
<button
    type="button"
    role="switch"
    aria-checked={isChecked}
    aria-expanded={isChecked}
    aria-controls="primary-nav"      // ID of the menu panel this controls
    aria-label={ariaLabel}            // expose as ControlType.String
    onClick={handleChange}
    style={{ /* visual styles, position: relative */ }}
>
    <svg ...aria-hidden="true">...</svg>
</button>
```

Or, if the label/checkbox pattern is desired for animation reasons, visually-hide the input instead of `display: none`:

```tsx
style={{
    position: "absolute",
    width: 1, height: 1,
    margin: -1, padding: 0, border: 0,
    overflow: "hidden", clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)", whiteSpace: "nowrap",
}}
```

Either fix restores keyboard access (Tab to focus, Space/Enter to toggle).

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-252 — HamburgerMenu.tsx is missing `aria-expanded` and `aria-controls` on the toggle

Status: Open
Category: Accessibility & compliance
Severity: High
Location: `Workshop/HamburgerMenu.tsx` (see source file via framer.getCodeFiles()) (the `<label>` and `<input>` elements)

Description:
The scope (sub-agent #12 task) requires the HamburgerMenu to expose `aria-expanded` and `aria-controls` so that screen-reader users understand whether the menu is currently open and which element the toggle controls. The current implementation has neither:

```tsx
<label style={{ cursor: "pointer", display: "inline-block", width: size, height: size }}>
    <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        style={{ display: "none" }}
        aria-label="Toggle menu"
    />
    <svg viewBox="0 0 32 32" ...>...</svg>
</label>
```

The component only emits a generic `onToggle(checked: boolean)` EventHandler. The consumer (the `Nav Dropdown` master, where all 4 instances live) is responsible for showing/hiding the menu panel, but the toggle button itself does not announce its expanded/collapsed state. A screen-reader user who focuses the toggle hears "Toggle menu, checkbox" with no indication of whether the menu is currently open.

The skill file's accessibility section says: *"aria roles on interactive elements."* `aria-expanded` is the standard ARIA attribute for a toggle that controls a collapsible region.

Evidence:
Full source of `Workshop/HamburgerMenu.tsx` (length 3,849 chars) — `aria-expanded` does not appear anywhere in the file; `aria-controls` does not appear anywhere in the file. The only ARIA attribute is `aria-label="Toggle menu"` on the (hidden) input.

Recommended Fix:
If migrating to a `<button>` (per DR-12-2), add `aria-expanded={isChecked}` and `aria-controls="primary-nav"` (where the value is the ID of the menu panel element). The `Nav Dropdown` master must give the menu panel an `id` matching the `aria-controls` value, OR the code component should accept an `ariaControlsId` prop (ControlType.String) so designers can wire it. At minimum, add `aria-expanded={isChecked}` immediately — it requires no consumer changes.

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-253 — HamburgerMenu.tsx has no Escape-to-close or click-outside handling

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `Workshop/HamburgerMenu.tsx` (entire component body)

Description:
The scope (sub-agent #12 task) requires the HamburgerMenu to support *"Escape to close, focus trap when open, ... click-outside to close."* The current HamburgerMenu only flips `isChecked` and calls `onToggle(newChecked)` — it has no `useEffect` that listens for `keydown` Escape, no focus-trap setup, and no document-level click handler to close when the user taps outside the menu.

This is partly by design (the toggle is decoupled from the menu panel via the EventHandler pattern, so the consumer is expected to manage the panel). But because the toggle holds the canonical `isChecked` state — and the menu panel's visibility depends on it — the close-on-Escape and close-on-click-outside behavior must be implemented somewhere. If neither HamburgerMenu nor the consumer (`Nav Dropdown` master) implements these handlers, then mobile visitors who open the menu and want to close it without re-tapping the small hamburger icon (or who press Escape expecting the menu to close) will have no way to do so via keyboard.

Evidence:
Full source of `Workshop/HamburgerMenu.tsx` (3,849 chars) contains:
- No `useEffect` import (only `useState`, `startTransition`, `type CSSProperties`)
- No `window.addEventListener` or `document.addEventListener` calls
- No `keydown` / `Escape` / `escape` string anywhere in the file
- No focus-related APIs (`focus()`, `tabIndex`, `inert`, `FocusTrap`)

Recommended Fix:
Either (a) implement Escape + click-outside inside HamburgerMenu by adding a `useEffect` that, when `isChecked === true`, registers a `keydown` listener for `Escape` (calls `setIsChecked(false)` + `onToggle(false)`) and a `mousedown`/`touchstart` listener on `document` that closes if the click is outside the toggle (and outside the menu panel — which requires the consumer to pass a ref or id); OR (b) document in the component's JSDoc that the consumer must implement these handlers, and add a `navPanelRef` Slot/control so the consumer can wire it. Approach (a) is preferable for self-containment.

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-254 — HamburgerMenu.tsx `defaultChecked` prop is read once and never re-synced

Status: Open
Category: Components
Severity: Low
Location: `Workshop/HamburgerMenu.tsx` (see source file via framer.getCodeFiles()) — `const [isChecked, setIsChecked] = useState(defaultChecked)`

Description:
The component uses `useState(defaultChecked)` to initialize `isChecked`, which only reads `defaultChecked` on first mount. If a designer toggles the `defaultChecked` ("Default State") control in Framer's properties panel after the component has mounted (e.g. switching from "Open" to "Closed" to preview the open state visually on canvas), the visible icon state will not update because `useState` ignores subsequent prop changes. The canvas screenshot will show the previous state until the component is forced to re-mount.

This is a minor polish issue — it does not affect production behavior (where the prop is fixed at mount time), but it makes the canvas preview misleading when iterating on the design.

Evidence:
(see source file via framer.getCodeFiles()) of `Workshop/HamburgerMenu.tsx`: `const [isChecked, setIsChecked] = useState(defaultChecked)`. No `useEffect` syncs `defaultChecked` to `isChecked` later. Confirmed by full file read.

Recommended Fix:
Either (a) accept that `defaultChecked` is mount-only and rename it to `initialChecked` for clarity, OR (b) add a `useEffect(() => { setIsChecked(defaultChecked); }, [defaultChecked]);` to re-sync on prop change. Approach (b) is preferable.

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-255 — ImageReveal.tsx has duplicate accessibility labels (container `role="img"` + inner `<img alt>`)

Status: Open
Category: Accessibility & compliance
Severity: High
Location: `Workshop/ImageReveal.tsx` (see source file via framer.getCodeFiles()) (static/revealed branch) and (see source file via framer.getCodeFiles()) (animated branch)

Description:
The ImageReveal component sets `role="img"` and `aria-label={image?.alt || "Image"}` on the outer container `<div>`, **and** renders an inner `<img>` with `alt={image?.alt || "Image"}`. This causes screen readers to announce the same alt text twice: once for the container (treated as an image because of `role="img"`) and once for the inner `<img>` element.

The skill file's accessibility section says: *"alt=`""` on decorative images"* — when the outer container has `role="img"` + `aria-label`, the inner `<img>` should be marked decorative with `alt=""` (or `aria-hidden="true"`) to prevent the duplicate announcement.

This appears in both render branches (static/revealed at (see source file via framer.getCodeFiles()), animated at (see source file via framer.getCodeFiles())). Both branches have:
```tsx
<div ref={ref} style={containerStyles} aria-label={image?.alt || "Image"} role="img">
    ...
    <img src={image?.src} srcSet={image?.srcSet} alt={image?.alt || "Image"} ... />
```

Evidence:
Full source of `Workshop/ImageReveal.tsx` (23,000 chars). Verified both render branches contain `aria-label={image?.alt || "Image"}` on the container `<div role="img">` and the same `alt={image?.alt || "Image"}` on the inner `<img>`.

Recommended Fix:
Either (a) remove `role="img"` and `aria-label` from the container and rely solely on the inner `<img alt>` (simplest, recommended), OR (b) keep `role="img"` + `aria-label` on the container and set the inner `<img alt="">` (decorative). Approach (a) is preferable — the `<img>` element natively conveys the same semantics without an ARIA wrapper.

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-256 — ImageReveal.tsx fallback alt text "Image" is unhelpful for screen readers

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `Workshop/ImageReveal.tsx` (see source file via framer.getCodeFiles()), 697, 713, 771 — `image?.alt || "Image"`

Description:
When the designer has not set an `alt` on the ResponsiveImage (or has set it to empty string), the component falls back to the literal string `"Image"`. A screen-reader user hearing "Image" gains zero context — they don't know whether the image is a hero photo of a dog, a clinic interior, a testimonial avatar, etc. The skill file's accessibility section says: *"alt=`""` on decorative images"* (i.e. if the image is purely decorative, mark it `alt=""` so screen readers skip it; otherwise provide a meaningful description).

The fallback `"Image"` is neither decorative (`""`) nor meaningful — it's the worst of both worlds.

Evidence:
The string `"Image"` appears 4 times in `Workshop/ImageReveal.tsx` as the fallback for `image?.alt`:
- (see source file via framer.getCodeFiles()) (default value): `alt: "Image"`
- (see source file via framer.getCodeFiles()) (static branch container aria-label): `aria-label={image?.alt || "Image"}`
- (see source file via framer.getCodeFiles()) (static branch `<img>` alt): `alt={image?.alt || "Image"}`
- (see source file via framer.getCodeFiles()) (animated branch container aria-label): `aria-label={image?.alt || "Image"}`
- (see source file via framer.getCodeFiles()) (animated branch `<img>` alt): `alt={image?.alt || "Image"}`

Recommended Fix:
Change the fallback to `""` (empty string) so that images without an alt are treated as decorative (skipped by screen readers). Better still, expose `alt` as its own `ControlType.String` control with `displayTextArea: true` so designers can provide a meaningful description per-instance. The default image already has `alt: "Image"` in the destructuring — change this default to `alt: ""` and add a separate string control.

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-257 — ImageReveal.tsx has no error or loading state for missing / failed image src

Status: Open
Category: UX & conversion
Severity: Medium
Location: `Workshop/ImageReveal.tsx` (see source file via framer.getCodeFiles()) and 768–774 — the `<img>` elements

Description:
The ImageReveal component renders `<img src={image?.src} srcSet={image?.srcSet} alt={...} />` with no `onError` or `onLoad` handler. When the image source is missing (e.g. designer cleared the ResponsiveImage control) or fails to load (404, network error, broken CMS reference), the browser shows a broken-image icon — which is especially jarring for a component whose entire purpose is to present images beautifully.

Additionally, while the image is loading, the container shows the `placeholderBackground` color (default `#000000`) — that's a sensible placeholder, but there is no skeleton/spinner and no fade-in once the image actually loads, so the transition from placeholder to image can be jarring on slow connections.

The skill file's "Common Errors" section notes: *"WebGL cross-origin: handle `SecurityError: Failed to execute 'texImage2D'` for cross-origin images."* While this component doesn't use WebGL, the principle applies: image-loading failures should be handled gracefully, not left to the browser's default broken-image rendering.

Evidence:
Source of `Workshop/ImageReveal.tsx` — no `onError` handler on either `<img>` ((see source file via framer.getCodeFiles()) or (see source file via framer.getCodeFiles())); no `onLoad` handler; no `loading="lazy"` attribute; no state variable tracking image load status.

Recommended Fix:
Add an `onError` handler that swaps the broken image for a placeholder (e.g. a neutral grey box with the alt text rendered as a caption, or a Phosphor `image` icon). Optionally add `loading="lazy"` and `decoding="async"` for performance. A simple implementation:

```tsx
const [imgError, setImgError] = useState(false)
...
<img
  src={image?.src}
  srcSet={image?.srcSet}
  alt={image?.alt || ""}
  onError={() => setImgError(true)}
  loading="lazy"
  decoding="async"
  style={imgError ? { ...imageStyles, opacity: 0 } : imageStyles}
/>
{imgError && (
  <div style={{ /* placeholder: centered icon + alt text */ }} aria-hidden="true">
    <PhosphorIcon name="image" />
    <span>{image?.alt}</span>
  </div>
)}
```

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-258 — BackButton.tsx uses a close (X) icon but is labeled "Go back" — semantic mismatch

Status: Open
Category: Accessibility & compliance
Severity: Medium
Location: `BackButton.tsx` (see source file via framer.getCodeFiles()) (the `<svg>`) and (see source file via framer.getCodeFiles()) (`aria-label="Go back"`)

Description:
The BackButton component renders an SVG of two crossing diagonal lines (a standard "close" / "X" icon) but labels the button `aria-label="Go back"`. A sighted user sees an X and assumes "close"; a screen-reader user hears "Go back" and assumes a back-arrow. This semantic mismatch creates confusion for users who switch between modalities (e.g. sighted keyboard users who also use a screen reader for verification) and is a low-grade accessibility defect.

The component is also used in contexts where "close" might be more accurate than "go back" — for example, the `/booking` page (where all 3 BackButton instances live) likely uses it to dismiss a booking panel, in which case "Close" would be the correct label. Conversely, if it really does navigate back (via `window.history.back()`), an arrow icon would communicate intent better.

Evidence:
- Source (see source file via framer.getCodeFiles()): `<line x1="18" y1="6" x2="6" y2="18" />` and `<line x1="6" y1="6" x2="18" y2="18" />` — two crossing diagonals, the universal "close" / X icon.
- Source (see source file via framer.getCodeFiles()): `aria-label="Go back"`.
- Canvas attributes for instance `KYaJPUHtfqO44GR49V` on `/booking`: `visible: "false"` (hidden on this breakpoint), `$control__borderRadius: "50"` (circular), `$control__buttonSize: "24"`, `$control__iconSize: "24"` — small circular X button, consistent with a "close" affordance, not a "go back" affordance.

Recommended Fix:
Either (a) replace the SVG path with a back-arrow icon (e.g. `<path d="M19 12H5M12 19l-7-7 7-7" />` for a left-pointing arrow) so the visual matches the `aria-label`; OR (b) change the `aria-label` to "Close" (or expose it as a `ControlType.String` so designers can pick per-instance — see DR-12-10). Option (b) is preferable because the icon is already an X.

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-259 — BackButton.tsx hardcodes `aria-label` and other UX strings; not exposed as controls

Status: Open
Category: Components
Severity: Medium
Location: `BackButton.tsx` (see source file via framer.getCodeFiles()) (`aria-label="Go back"`)

Description:
The BackButton's `aria-label` is hardcoded as `"Go back"` inside the JSX. Designers cannot customize it per-instance via the Framer properties panel — yet the component is used in contexts where the label should differ (e.g. on `/booking` it likely means "Close booking panel"; on a future use it might mean "Cancel" or "Return to services"). The skill file's "Property Controls" section says: *"Keep controls focused — make key elements configurable, hardcode the rest."* The accessible name of a button is a key element and should be configurable.

The same applies to the `transition: "background-color 0.2s ease"` CSS string on (see source file via framer.getCodeFiles()) (hardcoded hover timing) and the icon SVG paths ((see source file via framer.getCodeFiles())). The hover timing is a polish item; the aria-label is the more impactful concern.

Evidence:
Source (see source file via framer.getCodeFiles()): `aria-label="Go back"`. The `addPropertyControls` block ((see source file via framer.getCodeFiles())) exposes `iconColor`, `backgroundColor`, `hoverBackgroundColor`, `size`, `iconSize`, `borderRadius` — no `ariaLabel` or `label` control.

Recommended Fix:
Add an `ariaLabel` prop with a `ControlType.String` control (default `"Close"` or `"Go back"`), then bind `aria-label={ariaLabel}` in the JSX. Also consider exposing `transition` as a `ControlType.Transition` if hover timing flexibility is desired.

```tsx
addPropertyControls(BackButton, {
    ...,
    ariaLabel: {
        type: ControlType.String,
        title: "Accessible Label",
        defaultValue: "Close",
    },
})
```

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-260 — HamburgerMenu.tsx hardcodes `aria-label="Toggle menu"`; not exposed as a control

Status: Open
Category: Components
Severity: Medium
Location: `Workshop/HamburgerMenu.tsx` (see source file via framer.getCodeFiles()) (`aria-label="Toggle menu"`)

Description:
The HamburgerMenu's checkbox `aria-label` is hardcoded as `"Toggle menu"`. While this is a reasonable default, the component is used in 4 breakpoints of the `Nav Dropdown` master, and on different pages the menu it controls might be named differently (primary nav, mobile menu, filter menu, etc.). Designers cannot customize the label per-instance, which limits flexibility and forces a one-size-fits-all label.

The skill file's "Property Controls" section says: *"Provide a `defaultValue` for every prop so components render correctly in the Framer canvas."* Exposing `ariaLabel` as a control with `defaultValue: "Toggle menu"` satisfies this while allowing per-instance customization.

Evidence:
Source (see source file via framer.getCodeFiles()): `aria-label="Toggle menu"`. The `addPropertyControls` block ((see source file via framer.getCodeFiles())) exposes `strokeColor`, `strokeWidth`, `size`, `defaultChecked`, `onToggle` — no `ariaLabel` control.

Recommended Fix:
Add an `ariaLabel` prop with `ControlType.String` (default `"Toggle menu"`):

```tsx
addPropertyControls(HamburgerMenu, {
    ...,
    ariaLabel: {
        type: ControlType.String,
        title: "Accessible Label",
        defaultValue: "Toggle menu",
    },
})
```

Then bind `aria-label={ariaLabel}` on the input (or, preferably, on a real `<button>` per DR-12-2).

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-261 — BackButton.tsx mutates `style.backgroundColor` directly in `onMouseEnter`/`onMouseLeave` instead of using React state

Status: Open
Category: Components
Severity: Low
Location: `BackButton.tsx` (see source file via framer.getCodeFiles())

Description:
The BackButton handles hover by directly mutating the DOM via `e.currentTarget.style.backgroundColor = hoverBackgroundColor`. This is a non-idiomatic React pattern — it bypasses the React reconciler, can conflict with style overrides from the `style` prop, and won't be cleaned up if the component re-renders for any other reason. The skill file's "Best Practices" section doesn't explicitly forbid this, but the React community and Framer conventions prefer state-driven styling.

```tsx
onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = hoverBackgroundColor
}}
onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = backgroundColor
}}
```

Evidence:
(see source file via framer.getCodeFiles()) of `BackButton.tsx` — exact code quoted above.

Recommended Fix:
Use a `useState` for hover state:

```tsx
const [isHovered, setIsHovered] = useState(false)
...
<button
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    style={{
        ...,
        backgroundColor: isHovered ? hoverBackgroundColor : backgroundColor,
    }}
>
```

Or, even simpler, use a CSS `:hover` rule via a styled class (though inline styles in Framer code components typically don't support `:hover`).

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-262 — HamburgerMenu.tsx and BackButton.tsx do not use `useIsStaticRenderer` to short-circuit interactions on the canvas

Status: Open
Category: Performance & technical
Severity: Low
Location: `Workshop/HamburgerMenu.tsx` (entire component body) and `BackButton.tsx` (entire component body)

Description:
The skill file's "Animation Performance" section recommends:

```tsx
import { useIsStaticRenderer } from "framer";
const isStatic = useIsStaticRenderer();
if (isStatic) return <StaticPreview />;
```

Neither HamburgerMenu nor BackButton imports or uses `useIsStaticRenderer`. In practice the impact is small: BackButton's `onMouseEnter`/`onMouseLeave` won't fire on the static canvas anyway (no mouse events), and HamburgerMenu's `useState` toggle won't fire on the static canvas either (no user interaction). However, the `window.history.back()` call in BackButton would fire if any canvas interaction ever invokes `onClick` — the SSR guard (`typeof window !== "undefined"`) prevents the server crash but doesn't prevent unintended navigation on canvas.

The skill's intent is to skip side-effect-laden code paths when rendering for static export or canvas preview. BackButton has a real side effect (`window.history.back()`) that should be guarded. HamburgerMenu has fewer concerns but would still benefit from the pattern for consistency.

Evidence:
- `BackButton.tsx` source: no `useIsStaticRenderer` import (only `addPropertyControls, ControlType` from `framer`); `window.history.back()` is called inside `handleClick` with only a `typeof window !== "undefined"` guard ((see source file via framer.getCodeFiles())).
- `HamburgerMenu.tsx` source: no `useIsStaticRenderer` import (only `addPropertyControls, ControlType` from `framer`).

Recommended Fix:
Import `useIsStaticRenderer` from `"framer"` in both components and use it to short-circuit interactions:

```tsx
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
...
const isStatic = useIsStaticRenderer()
const handleClick = (e) => {
    if (isStatic) return
    if (onClick) onClick()
    else if (typeof window !== "undefined" && window.history) {
        startTransition(() => window.history.back())
    }
}
```

For HamburgerMenu, guarding `handleChange` with `if (isStatic) return` prevents the state from toggling on canvas hover/click previews (which can otherwise cause the canvas preview to drift away from `defaultChecked`).

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-263 — BackButton.tsx and HamburgerMenu.tsx do not set `position: "relative"` on the root element

Status: Open
Category: Components
Severity: Low
Location: `BackButton.tsx` (see source file via framer.getCodeFiles()) (the `<button>` style) and `Workshop/HamburgerMenu.tsx` (see source file via framer.getCodeFiles()) (the `<label>` style)

Description:
The skill file's "Platform Constraints" says: *"Position - Use `position: relative` on the root element, never `fixed`."* Neither BackButton nor HamburgerMenu explicitly sets `position: relative` on its root element. The default is `position: static`, which is not the same as `relative` — and while neither component uses `position: fixed` (which would be a hard violation), the recommendation is to set `relative` explicitly.

In practice, neither component positions children absolutely (so the lack of `relative` doesn't break anything today), but adding it future-proofs the components against absolute-positioned children and aligns with the skill file's guidance.

Evidence:
- `BackButton.tsx` root `<button>` style ((see source file via framer.getCodeFiles())): no `position` key.
- `HamburgerMenu.tsx` root `<label>` style ((see source file via framer.getCodeFiles())): no `position` key.

Recommended Fix:
Add `position: "relative"` to the root element's style in both components.

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-264 — ImageReveal.tsx imports `useScroll` from `framer-motion` but only conditionally uses it (potential SSR warning)

Status: Open
Category: Performance & technical
Severity: Low
Location: `Workshop/ImageReveal.tsx` (see source file via framer.getCodeFiles()) (imports) and (see source file via framer.getCodeFiles()) (`useScroll` call)

Description:
The ImageReveal imports `useScroll` from `framer-motion` and unconditionally calls it:

```tsx
const scrollYProgress = useScroll(
    revealMode === "scroll" && !noReveal && ref
        ? { target: ref, offset: ["start end", "end start"] }
        : undefined
).scrollYProgress
```

When `revealMode !== "scroll"`, the argument is `undefined`, so `useScroll` returns a no-op progress value — but it still allocates the hook state and any internal listeners. This is a minor inefficiency. More importantly, `framer-motion`'s `useScroll` may emit a warning when called without a target ref on the server (where there's no scroll container). The component already guards against SSR via `useIsStaticRenderer` for the inView animation branch ((see source file via framer.getCodeFiles())), but `useScroll` is called unconditionally.

Evidence:
(see source file via framer.getCodeFiles()) of `Workshop/ImageReveal.tsx` — `useScroll` is called outside any conditional. The `isStatic` check on (see source file via framer.getCodeFiles()) only guards the `useEffect` that updates motion values, not the `useScroll` call itself.

Recommended Fix:
This is mostly a stylistic/efficiency note — the conditional `undefined` argument to `useScroll` is the documented way to disable it, and `framer-motion` handles SSR gracefully. No fix needed unless warnings appear in the build output. If warnings do appear, wrap the call in a separate `<ScrollReveal>` child component rendered only when `revealMode === "scroll" && !isStatic`.

Confidence: Medium
Discovered by: sub-agent 12, session DR

---

## DR-265 — ImageReveal.tsx `transition` control is hidden when `revealMode !== "inView"`, so scroll-mode users can't customize the transition

Status: Open
Category: Components
Severity: Low
Location: `Workshop/ImageReveal.tsx` (see source file via framer.getCodeFiles()) (the `transition` property control)

Description:
The `transition` property control is hidden via `hidden: ({ revealEnabled, revealMode }) => !revealEnabled || revealMode !== "inView"`. This means designers using `revealMode: "scroll"` cannot customize the scroll-driven transition curve. While scroll-driven animations use `useTransform` (not the `transition` prop) for the progress mapping, the underlying motion-value animations (e.g. `imgScale`, `clipPath`) still respect the `transition` prop's `ease` and `duration` for any animated updates triggered by scroll progress changes.

This is a minor UX issue for designers — they may expect the "Transition" control to apply to all reveal modes, not just "Appear" (inView).

Evidence:
(see source file via framer.getCodeFiles()): `hidden: ({ revealEnabled, revealMode }) => !revealEnabled || revealMode !== "inView"`. The `scrollStart` and `scrollEnd` controls are visible only when `revealMode === "scroll"` ((see source file via framer.getCodeFiles())), but `transition` is invisible in scroll mode.

Recommended Fix:
Either (a) make `transition` visible in all reveal modes (`hidden: ({ revealEnabled }) => !revealEnabled`), OR (b) document in the control's `description` field that it only applies to "Appear" mode. Approach (a) is simpler and more discoverable.

Confidence: Medium
Discovered by: sub-agent 12, session DR

---

## DR-266 — ImageReveal.tsx uses untyped `any` for several props, bypassing TypeScript safety

Status: Open
Category: Components
Severity: Low
Location: `Workshop/ImageReveal.tsx` (see source file via framer.getCodeFiles()), 320, 326 — `transition: any`, `radius?: any`, `border?: any`

Description:
The `Props` interface declares three props as `any`:

```tsx
transition: any
...
radius?: any
...
border?: any
```

The skill file's "Platform Constraints" says: *"Types - Provide a typed props interface (e.g. `MyComponentProps`). Avoid NodeJS types like `Timeout` — use `number` instead."* While `any` is not a NodeJS type, it defeats the purpose of having a typed props interface. The `Transition` type from `framer-motion`, the `Border` type, and the `FusedNumber` type are all available from `framer`/`framer-motion` and should be used.

Evidence:
(see source file via framer.getCodeFiles()), 320, 326 of `Workshop/ImageReveal.tsx` — exact code quoted above. The `transition` is used directly in `animate(inViewProgress.get(), 1, { ...transition, ... })` ((see source file via framer.getCodeFiles())), which works because `any` accepts any shape.

Recommended Fix:
Import the proper types:

```tsx
import type { Transition } from "framer-motion"
import type { Border, FusedNumber } from "framer"

type Props = {
    ...
    transition: Transition
    radius?: number | FusedNumber
    border?: Border
    ...
}
```

This enables TypeScript to catch typos and shape mismatches at compile time.

Confidence: High
Discovered by: sub-agent 12, session DR

---

## DR-267 — BackButton.tsx `backgroundColor` control default is `"transparent"` (string), not a hex color, which may confuse the Framer color picker

Status: Open
Category: Components
Severity: Low
Location: `BackButton.tsx` (see source file via framer.getCodeFiles()) (`backgroundColor` control) and (see source file via framer.getCodeFiles()) (default in destructuring)

Description:
The `backgroundColor` property control is declared as `ControlType.Color` with `defaultValue: "transparent"`. The skill file's "Color" section says the default value should be either HEX (`"#fff"`) or HSL (`hsla(203, 87%, 50%, 0.5)`). The string `"transparent"` is neither — it's a CSS keyword. While modern browsers accept `transparent` as a color value, the Framer color picker may not display it correctly in the UI (the picker may show black or an empty state instead of "no color").

Evidence:
(see source file via framer.getCodeFiles()) of `BackButton.tsx`: `defaultValue: "transparent"`. Confirmed by `framer.getCodeFiles()` returning the full source.

Recommended Fix:
Use `rgba(0, 0, 0, 0)` (which is the RGBA equivalent of `transparent`) as the default value, so the Framer color picker displays it correctly:

```tsx
backgroundColor: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: "rgba(0, 0, 0, 0)",
},
```

Confidence: Medium
Discovered by: sub-agent 12, session DR

---

## Summary Table

| ID | File | Severity | Category | One-liner |
|---|---|---|---|---|
| DR-12-1 | FAQAccordion.tsx | Critical | Components | Empty code file (0 chars), no exports, dead code |
| DR-12-2 | HamburgerMenu.tsx | Critical | Accessibility & compliance | `display: "none"` on checkbox breaks keyboard access |
| DR-12-3 | HamburgerMenu.tsx | High | Accessibility & compliance | Missing `aria-expanded` and `aria-controls` on toggle |
| DR-12-4 | HamburgerMenu.tsx | Medium | Accessibility & compliance | No Escape-to-close or click-outside handling |
| DR-12-5 | HamburgerMenu.tsx | Low | Components | `defaultChecked` prop not re-synced after mount |
| DR-12-6 | ImageReveal.tsx | High | Accessibility & compliance | Duplicate aria: container `role="img"` + inner `<img alt>` |
| DR-12-7 | ImageReveal.tsx | Medium | Accessibility & compliance | Fallback alt "Image" is unhelpful |
| DR-12-8 | ImageReveal.tsx | Medium | UX & conversion | No error/loading state for missing or failed image src |
| DR-12-9 | BackButton.tsx | Medium | Accessibility & compliance | X icon labeled "Go back" — semantic mismatch |
| DR-12-10 | BackButton.tsx | Medium | Components | Hardcoded `aria-label`, not exposed as control |
| DR-12-11 | HamburgerMenu.tsx | Medium | Components | Hardcoded `aria-label`, not exposed as control |
| DR-12-12 | BackButton.tsx | Low | Components | Direct DOM mutation in `onMouseEnter`/`onMouseLeave` |
| DR-12-13 | BackButton.tsx + HamburgerMenu.tsx | Low | Performance & technical | No `useIsStaticRenderer` guard |
| DR-12-14 | BackButton.tsx + HamburgerMenu.tsx | Low | Components | Root element missing `position: "relative"` |
| DR-12-15 | ImageReveal.tsx | Low | Performance & technical | `useScroll` called unconditionally (potential SSR warning) |
| DR-12-16 | ImageReveal.tsx | Low | Components | `transition` control hidden in scroll mode |
| DR-12-17 | ImageReveal.tsx | Low | Components | Untyped `any` for `transition`, `radius`, `border` props |
| DR-12-18 | BackButton.tsx | Low | Components | `defaultValue: "transparent"` is not a valid color-picker value |

**Total findings: 18** — 2 Critical, 3 High, 6 Medium, 7 Low.

## What Was Verified (Positive Findings)

The following best-practice items were checked and **passed** for all 3 non-empty code components:

- **Single file, default export with named `function` syntax** — all 3 components use `export default function ComponentName(props)`. ✓
- **Imports only from allowed modules** (`react`, `react-dom`, `framer`, `framer-motion`) — all 3 verified. ✓
- **`motion` imported from `"framer-motion"`** — ImageReveal imports `motion` from `"framer-motion"` (line 280). BackButton and HamburgerMenu don't use `motion` (they use CSS transitions), so no risk of the wrong-import bug. ✓
- **Typed props interface** — all 3 declare a typed `Props`/`ComponentNameProps` interface. (ImageReveal has `any` for 3 props — see DR-12-17, but the interface exists.) ✓
- **Layout annotations present** — all 3 have `@framerSupportedLayoutWidth`/`@framerSupportedLayoutHeight` in a `/** */` block above the function. ✓ (FAQAccordion has none because the file is empty — see DR-12-1.)
- **No NodeJS types** (`Timeout`, `NodeJS.Timeout`, etc.) — none found in any file. ✓
- **No `position: fixed`** — none found in any file. ✓
- **SSR guards for `window`/`document` access** — BackButton has `if (typeof window !== "undefined" && window.history)` (line 48). HamburgerMenu and ImageReveal don't access `window`/`document` directly. ✓
- **`addPropertyControls` called** — all 3 components call it. ✓
- **`defaultValue` on every non-image control** — all controls have `defaultValue`. ✓
- **Image defaults set in the component body** (not in the control) — ImageReveal sets `image = { src: "...", alt: "Image" }` in the destructuring (lines 349–352); the `image` control has no `defaultValue` (correct, since `ControlType.ResponsiveImage` doesn't support it). ✓
- **`hidden` used for conditional visibility** — ImageReveal uses `hidden: ({ revealEnabled, revealMode }) => ...` extensively (lines 803, 829, 841, 855, 866, 877, 888, 899, 906, 915, 929, 972, 978). ✓
- **`startTransition` used for state updates** — BackButton wraps `window.history.back()` in `startTransition` (line 49); HamburgerMenu wraps `setIsChecked` in `startTransition` (line 172). ImageReveal uses motion values directly (no React state updates from animation). ✓
- **`useInView` to pause off-screen animations** — ImageReveal uses `useInView(ref, { amount: inViewAmount, once })` (line 394). ✓
- **`useIsStaticRenderer`** — ImageReveal uses it (line 383) and short-circuits the `useEffect` accordingly. (BackButton and HamburgerMenu don't — see DR-12-13.) ✓ for ImageReveal only.
- **Real `<button>` for BackButton** — BackButton renders `<button onClick={...} aria-label="Go back">`. ✓ (Per scope: "real `<button>` or `<a>` with proper `role` and `href`" — button is correct, no href needed since it's not a link.)
- **`alt` text on ImageReveal image** — present (though see DR-12-6 and DR-12-7 for quality issues). ✓

## Canvas Usage Summary

- **ImageReveal (11 instances)** — used on Home `/` (6, two breakpoints × 3 images), `/about` (3, three breakpoints), inside `Why Us Card` master (1), inside `Teem Card` master (1). All instances override the `image` prop (verified via `attributes.$control__image`). Some disable the reveal (`$control__imageReveal: "false"`) and use the component purely for image-with-shadow-border-hover presentation.
- **HamburgerMenu (4 instances)** — all inside the `Nav Dropdown` master (4 breakpoints, presumably desktop / tablet / mobile / mobile-landscape). Wired with `onToggle` EventHandler; consumer is responsible for showing/hiding the menu panel.
- **BackButton (3 instances)** — all on `/booking` page (3 breakpoints). One instance has `visible: "false"` (hidden on a specific breakpoint — likely desktop where a different nav element is used). All have circular shape (`borderRadius: 50`) and size 24.
- **FAQAccordion (0 instances)** — empty file, no usages anywhere (see DR-12-1).

---

## DR-268 — Blog "Auther Name" field misspelled AND empty on 6 of 10 items

Status: Open
Category: CMS
Severity: High
Location: Blog collection → `Auther Name` field (`$control__auther_name`, var id `v365QHZYL`). Rendered on `/blog/:Blog` detail page node `jlkWuBAtS` (bound to `var(--variable-v365QHZYL)`); also rendered on every Blog Card instance on `/blog` (`$control__autherName`).

Description:
The Blog collection schema field is misspelled "Auther Name" (should be "Author Name"). Worse, 6 of 10 blog items have this field empty: `yAIJE8XUH` (Parasite Prevention), `x1V0Oc2_f` (First Aid Basics), `G9FHqACps` (Keep Them Moving), `WZtPeuwD2` (Signs Your Pet Is Sick), `jkZHK6dS7` (Grieving a Pet), `Z7MSbSKtU` (10 Essential Tips). The remaining 4 items have value "Dr Alex". The blog detail page renders this field in the article meta row (next to the actual Published Date), so 6 of 10 blog posts show an empty author slot. The Blog Card component (`EiCUZ0sVC`) propagates the misspelling via its `$control__autherName` control and shows it on every card on `/blog`.

Evidence:
Schema entry `{"name": "Auther Name", "type": "string", "id": "v365QHZYL", "key": "$control__auther_name"}`. Items `yAIJE8XUH`, `x1V0Oc2_f`, `G9FHqACps`, `WZtPeuwD2`, `jkZHK6dS7`, `Z7MSbSKtU` show `"Auther Name": null`. Blog Card component variables include `{"key": "$control__autherName", "name": "Auther Name"}`.

Recommended Fix:
(a) Populate the Author field for the 6 empty items (e.g. set them all to "Dr Alex" or to a real bylined author). (b) Rename the schema field from "Auther Name" to "Author Name" via the Framer CMS dashboard. (c) The typo in the variable id `v365QHZYL` can stay (it's an internal id), but the human-facing name should be corrected.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-269 — Service "End of Life Care" item missing Hero Image and 2 of 3 Gallery Images

Status: Open
Category: CMS
Severity: High
Location: Services collection item `JMTTMhaJy` (slug `end-of-life-care`, Title "End of Life Care"). Fields `Hero Image` (`$control__hero_image`), `Gallery Image 2` (`$control__gallery_image_2`), `Gallery Image 3` (`$control__gallery_image_3`) all empty.

Description:
The "End of Life Care" service item has `Hero Image = null`, `Gallery Image 2 = null`, `Gallery Image 3 = null`. Only `Gallery Image 1` is populated. The service detail page (`/services/end-of-life-care`) renders all four image slots — Hero Image frame (`yLIDf8fgV`, `fill="var(--variable-cuwT3VRH4)"`) and three gallery frames (`ZQYSQukLi`, `cXwBdM26h`, `ahe8xfHa6` bound to gallery variables). Three of these four frames will display as empty placeholders. This is a sensitive service category — broken/blank imagery here is especially damaging to trust.

Evidence:
Item `JMTTMhaJy` fields: `"Hero Image": null`, `"Gallery Image 1": {"src": "https://framerusercontent.com/images/Mwn6CHEVP5sU6sLgpqHpRFJVBs.webp", ...}`, `"Gallery Image 2": null`, `"Gallery Image 3": null`. All other 11 services have all 4 images populated.

Recommended Fix:
Source and upload appropriate imagery for End of Life Care — a compassionate palliative-care scene for the Hero, and 2 additional gallery images (e.g. family consultation, comfort care). Match the alt-text pattern used by other services.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-270 — Service detail page renders Benefits content TWICE

Status: Open
Category: CMS
Severity: High
Location: `/services/:Services` page node `lhpeg56oV`, Desktop `Main` → `About Service` section (`Nk0OW8Pym`) → frame `HWvX4YU41`. Two sibling frames both bind the Benefits richtext variable: `RUCJNNAgW` (under frame `OIyyc8OVE`) and `tut5XNlSz` (under frame `wgaPUAPqi`).

Description:
The "About Service" section on every service detail page contains three subsections: (1) "What to Expect" heading + `var(--variable-DveubFVEm)` (correct), (2) "Benefits" heading + `var(--variable-GXPTqAkip)` (correct), (3) ANOTHER "Benefits" heading + the SAME `var(--variable-GXPTqAkip)` (duplicate). The Benefits content (which is ~150 chars of bullet-style text per service) is rendered twice on every one of the 12 service detail pages. The frame name of section 2 (`OIyyc8OVE` is named "What to Expect" in the canvas) suggests this was originally meant to be a different section (e.g. "What to Expect" again, or a third content block) and the wrong variable was bound.

Evidence:
Serialized nodes: `RUCJNNAgW.attributes.text = "var(--variable-GXPTqAkip)"`, `tut5XNlSz.attributes.text = "var(--variable-GXPTqAkip)"`. Both have parent frames with separate "Benefits" headings (jnmcBr4Gm and v71ZeoKqw — both TextRuns with text "Benefits"). Variable `GXPTqAkip` = Benefits field per collection schema.

Recommended Fix:
Change the binding of `RUCJNNAgW` to a different variable (e.g. `var(--variable-DveubFVEm)` if the section should show "What to Expect" again — though that would also duplicate), OR delete the duplicate frame `wgaPUAPqi` entirely (preferred — section 2 already shows Benefits correctly under heading jnmcBr4Gm). Best fix: delete section 3 (`wgaPUAPqi` and its children `v71ZeoKqw`, `tut5XNlSz`).

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-271 — /blog "Featured Articles" Collection List has no filter — shows wrong items

Status: Open
Category: CMS
Severity: High
Location: `/blog` page node `OUWIjsEU8` → Desktop frame `THfUzjZ9W` → `Featured Articles` section `OtnL8EEyY` → Collection List node `O09c72xxk`.

Description:
The "Featured Articles" Collection List on `/blog` has config `{"collection":"Blog","repeatedDescendantId":"GpejBy_lr","limit":"2"}` — NO filter, NO sort. It just takes the first 2 items in default collection order. The section is named "Featured Articles" and is intended to spotlight Featured blog posts, but it doesn't filter by the `Featured` field (var id `UJQFDqWfn`). Currently shown: `yAIJE8XUH` (Parasite Prevention, Featured="true" — happens to be featured) and `x1V0Oc2_f` (First Aid Basics, Featured=null — NOT actually featured). The truly featured item `jajVoZZTr` (Feeding Right, Featured="true") is excluded from this section. Additionally, `x1V0Oc2_f` then appears again in the "Articles" Collection List below (duplicate display).

Evidence:
Node `O09c72xxk` attribute `collectionList = {"collection":"Blog","repeatedDescendantId":"GpejBy_lr","limit":"2"}` (no `filters` key). Compare to Articles list `KekS47E7A` which has explicit filters. The Blog collection has 2 items with Featured="true": `yAIJE8XUH`, `jajVoZZTr`.

Recommended Fix:
Add a filter to the Featured Articles Collection List: `filters: [{"variableId":"UJQFDqWfn","transforms":[{"name":"equals","value":true}]}], filtersOperator: "and"`. Optionally add sorting by Published Date desc. Increase limit to 3 if you want to surface more featured posts. Verify the Featured field is set to "true" on at least 2–3 blog items.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-272 — Service detail page "Call Now" button uses placeholder phone number

Status: Open
Category: CMS
Severity: High
Location: `/services/:Services` page node `lhpeg56oV` → Desktop Main → Hero → Buttons frame `tlbD4UjgK` → ComponentInstanceNode `Tsglsx7S8` (the "Call Now" button).

Description:
The "Call Now" button on every service detail page links to `tel:+123-456-7890` — a clearly placeholder phone number (123-456-7890 is the classic fake number). Every one of the 12 service detail pages has this same broken Call Now CTA. A visitor who clicks Call Now expecting to reach the clinic dials a non-functional or wrong number. This is especially harmful on service pages where urgency matters (e.g. `24-7-emergency-care`).

Evidence:
Node `Tsglsx7S8` attributes include `"$control__text": "Call Now"`, `"$control__link": "tel:+123-456-7890"`. The same node is present in the service detail page template (rendered for all 12 service items).

Recommended Fix:
Update the link to the actual clinic phone number (e.g. `tel:+1-555-123-4567` or whatever the real number is). Make sure the same number is used in the Header, Footer, and Contact page for consistency.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-273 — Blog "Featured" field inconsistent across items (null vs true vs false)

Status: Open
Category: CMS
Severity: Medium
Location: Blog collection → `Featured` boolean field (var id `UJQFDqWfn`, key `$control__featured`).

Description:
The `Featured` field values are inconsistent across the 10 Blog items: 2 items have `Featured="true"` (`yAIJE8XUH`, `jajVoZZTr`); 1 item has `Featured="false"` (`Z7MSbSKtU`); 7 items have `Featured=null` (empty/unset: `x1V0Oc2_f`, `G9FHqACps`, `WZtPeuwD2`, `jkZHK6dS7`, `sL2m8UplP`, `NGQN6X7p3`, `FF07FUpZm`). The `/blog` Articles Collection List (`KekS47E7A`) filters by `Featured equals false`. Framer's treatment of null in boolean filters is ambiguous — null might be treated as "false" (matching) or as "not set" (not matching). If treated as "not set", only 1 item (`Z7MSbSKtU`) would appear in the Articles list, leaving 7 items invisible on `/blog`. Either way, the inconsistent population makes the filter behavior unpredictable and is a data-quality issue.

Evidence:
Per-item Featured values from serialized collection: yAIJE8XUH="true", x1V0Oc2_f=null, jajVoZZTr="true", G9FHqACps=null, WZtPeuwD2=null, jkZHK6dS7=null, sL2m8UplP=null, NGQN6X7p3=null, FF07FUpZm=null, Z7MSbSKtU="false". Articles list filter: `{"variableId":"UJQFDqWfn","transforms":[{"name":"equals","value":false}]}`.

Recommended Fix:
Explicitly set `Featured` to either "true" or "false" on all 10 blog items — never leave it null. Decide which 2–4 posts should be featured and set the rest to "false". This makes the Featured Articles and Articles lists behave deterministically.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-274 — Services "Featured" field inconsistent (6 true, 6 null)

Status: Open
Category: CMS
Severity: Medium
Location: Services collection → `Featured` boolean field (var id `IQz4QjTIO`, key `$control__featured`).

Description:
The `Featured` field values are inconsistent across the 12 Services items: 6 items have `Featured="true"` (`cUNl9mV6Q` Diagnostics, `tETX4Fsv7` Pain Relief, `afHna7G3t` 24/7 Emergency, `kY87Fs2MD` Surgical, `tzSHVqONe` Dental, `VCRvFJTws` Preventive); 6 items have `Featured=null` (`JMTTMhaJy` End of Life, `x5UTiDP5y` Parasite, `SHQSf6sst` Alternative, `CGu3k5_fk` Exotic, `BZEvq0mNq` Puppy/Kitten, `sO6M7KVuO` Senior). The Home page `/` Services Collection List (`ucMAEsB2j`) filters by `Featured equals true` with limit 6. The 6 Featured=true services exactly fill the limit. Two issues: (a) if a 7th service is added with Featured=true, it won't appear on home (limit 6 is hit); (b) the 6 services with Featured=null are silently de-prioritized on the home page without an explicit "false" decision — there's no clear editorial reason why Dental is featured but Senior Pet Care is not.

Evidence:
Per-item Featured values from serialized collection. Home page filter: `{"variableId":"IQz4QjTIO","transforms":[{"name":"equals","value":true}]}`, limit "6".

Recommended Fix:
Explicitly set Featured to "false" (not null) on the 6 unfeatured services. Re-evaluate the featured selection — End of Life Care, Senior Pet Care, and Puppy/Kitten Care are commonly-searched veterinary services and may warrant featuring on the home page. Consider increasing the limit to 8 or 9 if more services should be surfaced on home.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-275 — Blog slug contains apostrophe (URL-unfriendly)

Status: Open
Category: CMS
Severity: Medium
Location: Blog collection item `sL2m8UplP` (Title "Why Your Pet's Dental Health Matters") → `Slug` field (`$control__slug`).

Description:
The slug for blog item `sL2m8UplP` is `why-your-pet's-dental-health-matters` — it contains an apostrophe, which is not a URL-safe character. The URL `/blog/why-your-pet's-dental-health-matters` will be percent-encoded to `/blog/why-your-pet%27s-dental-health-matters` by browsers and CDN/SEO tools. This can cause: link-copy/paste issues, broken hrefs in plain-text contexts (e.g. email signatures, PDFs), analytics tracking inconsistencies (two URL forms of the same page), and minor SEO noise. None of the other 9 blog slugs and none of the 12 service slugs have this issue — they all use lowercase letters, digits, and hyphens only.

Evidence:
Item `sL2m8UplP` fields: `"Slug": "why-your-pet's-dental-health-matters"`, `"Title": "Why Your Pet's Dental Health Matters"`. All other Blog slugs are URL-safe (e.g. `parasite-prevention-year-round-protection`, `first-aid-basics-ready-when-it-matters`).

Recommended Fix:
Change the slug to `why-your-pets-dental-health-matters` (drop the apostrophe entirely — most readable) or `why-your-pet-s-dental-health-matters` (replace with hyphen). If the page is already indexed by search engines or has inbound links, set up a 301 redirect from the old URL to the new one.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-276 — Blog item missing Article Type field

Status: Open
Category: CMS
Severity: Medium
Location: Blog collection item `Z7MSbSKtU` (Title "10 Essential Tips for a Healthy Golden Years") → `Article type` field (`$control__article_type`, var id `TwZ9dZl7K`).

Description:
The `Article type` field on blog item `Z7MSbSKtU` is null. All other 9 blog items have an Article type value: Wellness, Emergency, Nutrition, Grief Support, Vaccines, Senior Care. The Blog Card component (`EiCUZ0sVC`) renders Article type as a tag/label via `$control__type` (bound to `var(--variable-TwZ9dZl7K)` with `optionToDisplayName` transform). When this item appears in a Collection List, the tag will be empty/missing — the card looks incomplete next to peers that show "Wellness" or "Nutrition". Additionally, this item is the only "Senior Care"-themed blog post (alongside `FF07FUpZm` "A Comprehensive Guide to Senior Pet Care" which is tagged Senior Care), so it should logically also be tagged Senior Care.

Evidence:
Item `Z7MSbSKtU` fields: `"Article type": null`. All other 9 items have non-null Article type values.

Recommended Fix:
Set Article type to "Senior Care" for item `Z7MSbSKtU` (matches content — the post is about senior dog care tips).

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-277 — Services "Icon Type" field is unused — all Service Cards show the same default icon

Status: Open
Category: CMS
Severity: Medium
Location: Services collection → `Icon Type` field (`$control__icon_type`, var id `I1IRbR5N1`). Service Card component `ecHzMZLnH` exposes `$control__icon` (IconVariable). Repeated card instances `i2tDKiL52` (on `/services`) and `HDdvzUBXf` (on `/`) do not bind `var(--variable-I1IRbR5N1)`.

Description:
Every Services collection item has an `Icon Type` field populated with a unique Phosphor icon module path (e.g. `module:ymfAq2DVcLiKlsezjKVS/.../SfCyr4H8Y.js:default` for End of Life Care, `module:dIG7XN9KAmImdjhERNf1/.../f40ONlxDn.js:default` for Parasite Prevention). However, the Service Card component instance on `/services` (`i2tDKiL52`) and on `/` home (`HDdvzUBXf`) only binds `$control__title`, `$control__description`, and `$control__padding` — the `$control__icon` slot is left at its component default ("First Aid" icon from the Phosphor set). Result: every service card on `/services` and `/` shows the same "First Aid" icon, regardless of the unique icon set per service in the CMS. The CMS icon data is dead content — collected but never displayed.

Evidence:
Service Card instance `i2tDKiL52` attrs: `{"$control__title":"var(--variable-rcONKAEdm)","$control__description":"var(--variable-T7HPayt_I)","$control__padding":"24px"}` — no `$control__icon` key. Same for `HDdvzUBXf`. Services items all have non-null Icon Type values (12 distinct icon module paths).

Recommended Fix:
On both the `/services` and `/` Service Card repeated instances, set `$control__icon` to `var(--variable-I1IRbR5N1)`. This wires the per-service icon from the CMS to the card's icon slot.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-278 — FAQs "Group" field is unused and inconsistently populated

Status: Open
Category: CMS
Severity: Medium
Location: FAQs collection → `Group` option field (`$control__group`, var id `dO9IegAQb`). Rendered via Collection List `zQuEXcyL2` on `/contact` (no filter on Group).

Description:
The FAQs collection has a `Group` field with values: 3 items have `Group=null` (`TNnktMJr0` "What services do you offer?", `IsFG2Lr8m` "Do I need to book an appointment?", `gizlophQz` "Are you open on weekends or after hours?"); 3 items have `Group="Right"` (`P4J48PLG8`, `smZz2Zgdc`, `OnGFG9Cy4`). There are NO items with `Group="Left"`. The `/contact` page FAQ Collection List (`zQuEXcyL2`) has config `{"collection":"FAQs","repeatedDescendantId":"Bjcle6ami","limit":"6"}` — no filter, no Group-based splitting. The FAQ item component (`xUmE2HP3j`) does not expose a Group control. So the Group field is completely unused — dead schema data with inconsistent values. The original design likely intended a 2-column FAQ layout (Left + Right groups), but only the Right group was populated, and the layout was changed to single-column.

Evidence:
3 items with Group=null, 3 items with Group="Right", 0 items with Group="Left". /contact Collection List has no filters key in its config. FAQ item component variables: Question, Answer, Padding, Gap — no Group.

Recommended Fix:
Either (a) delete the `Group` field from the FAQs collection schema (it's unused and adds clutter), OR (b) re-introduce a 2-column FAQ layout on `/contact` (or `/services`) and populate Group="Left" for 3 items and Group="Right" for the other 3, then filter the two Collection Lists accordingly.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-279 — Blog detail page omits Read Time and Article Type from article meta

Status: Open
Category: CMS
Severity: Medium
Location: `/blog/:Blog` detail page node `DvEqpc9aQ` → Desktop `Main` → `Article` (`JhuQgDRPQ`) → `Text Container` (`vlqOrAJPz`). Meta nodes `jlkWuBAtS` (Author Name) and `DibSNZ04T` (Published Date). No node binds `var(--variable-TtkrUfg8X)` (Read Time) or `var(--variable-TwZ9dZl7K)` (Article Type) on the detail page.

Description:
The blog detail page renders only Title, Description, Author Name, Published Date, Image, and Content. It does NOT render Read Time (var `TtkrUfg8X`, present in CMS as 5–7 minutes per post) or Article Type (var `TwZ9dZl7K`, e.g. "Wellness", "Nutrition"). Both fields ARE rendered on the Blog Card on `/blog` (via `$control__readTime` and `$control__type`). Their absence on the detail page is an inconsistency — a reader who clicks into an article loses the "5 min read" and "Wellness" context that was visible on the listing card. For long-form content especially, Read Time is a valuable reader-experience signal.

Evidence:
Blog Card component (`EiCUZ0sVC`) variables include `$control__readTime` and `$control__type`. Blog detail page serialization shows bindings for `var(--variable-v365QHZYL)` (Author), `var(--variable-Q5oytgpyz)` (Date), `var(--variable-Y55Ujs5Or)` (Title), `var(--variable-TPpJF6v7H)` (Description), `var(--variable-kZ3Cwfwri)` (Image), `var(--variable-Vv2SvDCYA)` (Content). No bindings to `var(--variable-TtkrUfg8X)` or `var(--variable-TwZ9dZl7K)`.

Recommended Fix:
Add the Read Time and Article Type to the article meta row on `/blog/:Blog` — for example, append " · 5 min read · Wellness" next to the Published Date. Reuse the Blog Card's meta pattern (`$control__metaType` "Row").

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-280 — Blog item Z7MSbSKtU title/slug mismatch + grammar error

Status: Open
Category: CMS
Severity: Low
Location: Blog collection item `Z7MSbSKtU` — Title and Slug fields.

Description:
The Title is `"10 Essential Tips for a Healthy Golden Years"` and the Slug is `"10-essential-tips-for-a-happy-healthy-golden-years"`. Two issues: (1) The slug includes "happy" which is not in the title — the slug and title tell different stories (title says "Healthy", slug says "Happy Healthy"). (2) The title itself has a grammar error: "a Healthy Golden Years" mixes singular article "a" with plural "Golden Years" — should be either "Healthy Golden Years" (drop the "a") or "a Healthy Golden Year" (singular). This appears on the blog listing card and the detail page H1.

Evidence:
Item `Z7MSbSKtU` fields: `"Title": "10 Essential Tips for a Healthy Golden Years"`, `"Slug": "10-essential-tips-for-a-happy-healthy-golden-years"`.

Recommended Fix:
Update Title to "10 Essential Tips for Happy, Healthy Golden Years" (or similar) and update Slug to match: `10-essential-tips-for-happy-healthy-golden-years`. Set up a 301 redirect from the old slug to the new one.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-281 — Auto-generated "id" field is empty on every item across all 4 collections

Status: Open
Category: CMS
Severity: Low
Location: All 4 collections (Blog `b8Kw9KXWB`, Services `kt0DC5RWb`, Testimonials `ICNoS1I6M`, FAQs `fRYbceWET`) → auto-generated `id` string field (e.g. key `$control__id`, var id `<collectionId>-id`).

Description:
Every collection has an auto-generated `id` field of type `string` (variable id pattern `<collectionId>-id`). Every single item across all 4 collections (Blog: 10, Services: 12, Testimonials: 4, FAQs: 6 — 32 items total) has this field empty (`null`). This appears to be a leftover field — perhaps created by an import or template — that is never populated and never referenced by any Collection List binding on any page. It clutters the CMS editor view and creates confusion ("should I fill this in?").

Evidence:
All 32 items across 4 collections show `"id": null` in the serialized attributes. Schema for each collection includes a variable with name "id" and type "string" with key `$control__id`. No Collection List filter or repeated-descendant binding references this variable.

Recommended Fix:
Delete the `id` field from each collection schema via the Framer CMS dashboard (Settings → Collections → [Collection] → Fields → remove "id"). Do this for all 4 collections.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-282 — Testimonials and FAQs collections have no detail page (Slug fields unused)

Status: Open
Category: CMS
Severity: Low
Location: Testimonials collection (`ICNoS1I6M`) → `$detailPageId: undefined`. FAQs collection (`fRYbceWET`) → `$detailPageId: undefined`. Both collections have a `Slug` field (e.g. `james-walker`, `what-services-do-you-offer`) that does not resolve to any URL.

Description:
The Testimonials and FAQs collections both have `$detailPageId = undefined` — no CMS detail page is assigned. Each item has a `Slug` field populated (Testimonials: `james-walker`, `emily-carter`, `david-reynolds`, `sarah-mitchell`; FAQs: `what-services-do-you-offer`, etc.). Without a detail page, these slugs don't resolve to URLs — clicking a testimonial or FAQ card does nothing (and the FAQ/Testimonial card components don't expose a Link control, so this is consistent). The Slug field is dead data: collected, never linked. Not strictly a bug if testimonials and FAQs are only meant to be displayed inline via Collection Lists — but the schema suggests an unfinished intent to have detail pages.

Evidence:
`state.allCollectionsData["ICNoS1I6M"].$detailPageId === undefined` and `state.allCollectionsData["fRYbceWET"].$detailPageId === undefined`. Blog and Services collections both have `$detailPageId` set (`DvEqpc9aQ` and `lhpeg56oV` respectively).

Recommended Fix:
Either (a) delete the `Slug` field from Testimonials and FAQs collections (since slugs aren't used), OR (b) create detail pages `/testimonials/:Testimonials` and `/faqs/:FAQs` if individual testimonial/FAQ pages are desired (e.g. for SEO long-tail landing pages). Option (a) is simpler and matches current site behavior.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-283 — Blog collection lacks dedicated SEO fields (uses Title + Description for meta)

Status: Open
Category: CMS
Severity: Low
Location: Blog collection (`b8Kw9KXWB`) schema — no SEO Title, no SEO Description, no canonical URL field. Detail page metadata: `{"title":"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet","description":"{{Description}}","socialImage":"var(--variable-kZ3Cwfwri)"}`.

Description:
The Blog collection has no dedicated SEO fields — the detail page metadata falls back to `{{Title}}` for the meta title and `{{Description}}` for the meta description. The Description field is a short ~150-char blurb written for card display, not optimized for search-engine snippets (which can be up to 155–160 chars but should be written with keywords in mind). The meta title template `"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet"` works but is generic. There's no per-post canonical URL override, no robots meta, no Open Graph description separate from page description. For a content-marketing blog, this is a missed SEO opportunity.

Evidence:
Blog collection schema variables: Image, Title, Description, Auther Name, Published Date, Article type, Read Time, Featured, Slug, Content, id — no SEO-specific fields. Detail page attributes metadata: `"title":"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet","description":"{{Description}}"`.

Recommended Fix:
Add `SEO Title` (string, optional) and `SEO Description` (string, optional, textarea) fields to the Blog collection. Update the detail page metadata to use `{{SEO Title}}` if set, falling back to `{{Title}}` otherwise. Same pattern for description.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-284 — Services collection lacks dedicated SEO fields and key service attributes (price, duration, category)

Status: Open
Category: CMS
Severity: Low
Location: Services collection (`kt0DC5RWb`) schema. Detail page metadata: `{"title":"{{Title}} - Vetly - Trusted Veterinary Care for Your Pet","description":"{{Card Description}}"}`.

Description:
The Services collection has no dedicated SEO fields and is missing several attributes a typical veterinary Services collection would have: (a) No SEO Title / SEO Description fields — meta description falls back to `{{Card Description}}` which is a ~150-char card blurb, not an SEO-optimized snippet. (b) No `Price` or `Cost Range` field — visitors can't see pricing without contacting the clinic. (c) No `Duration` field (e.g. "30 min", "60 min") — visitors can't plan their visit. (d) No `Category` field or multi-reference to a Categories collection — services can't be grouped/filtered on `/services` (e.g. "Wellness", "Surgical", "Emergency"). (e) No `Related Services` multi-reference field — can't cross-link related services on the detail page. (f) No `Doctor/Veterinarian` reference field — can't show which vet performs the service. None of these are blocking, but each is a missed opportunity for a veterinary Services CMS.

Evidence:
Services collection schema variables: Title, Card Description, Icon Type, Featured, Slug, Hero Image, Intro Text, Gallery Image 1/2/3, What to Expect, Benefits, FAQ, id — no SEO, price, duration, category, related, or doctor fields. Detail page metadata uses `{{Card Description}}` for description.

Recommended Fix:
Add at minimum: `SEO Title` (string, optional), `SEO Description` (string, optional textarea), and `Duration` (string, e.g. "30 min"). Consider adding `Price Range` (string), `Category` (option or reference), and `Related Services` (multi-reference to self) for richer service pages.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-285 — Testimonials collection lacks date and service-reference fields

Status: Open
Category: CMS
Severity: Low
Location: Testimonials collection (`ICNoS1I6M`) schema.

Description:
The Testimonials collection schema is: Testimonial Text, Profile Image, Full Name, Owner Type, Slug, id. Missing: (a) `Date` field — testimonials appear timeless; can't show "Reviewed in March 2026" or sort by date. (b) `Service Reference` (multi-reference to Services collection) — can't filter testimonials by which service they relate to (e.g. show surgery testimonials on the Surgical Care detail page). (c) `Rating` (number, 1–5) — testimonials all imply 5 stars but there's no explicit rating field. (d) `Pet Name` (string) — many testimonials mention a pet by name ("Max", "Luna", "Bella") but the pet name isn't a separate field. These additions would unlock dynamic testimonial display per service page.

Evidence:
Testimonials schema variables: `sW1465g2N` Testimonial Text, `OoI1wPtnm` Profile Image, `sttXEM6St` Full Name, `x3vrkdSEz` Owner Type, `zc4evXR6g` Slug, `ICNoS1I6M-id` id. No date, no service reference, no rating, no pet name.

Recommended Fix:
Add `Date` (date), `Rating` (number, default 5), `Pet Name` (string), and `Service` (reference to Services collection) fields. Then on each `/services/:Services` detail page, add a Testimonials Collection List filtered by Service = current item.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-286 — Blog collection lacks category, tags, and author bio fields

Status: Open
Category: CMS
Severity: Low
Location: Blog collection (`b8Kw9KXWB`) schema.

Description:
The Blog collection schema has an `Article type` option field (Wellness, Emergency, Nutrition, Grief Support, Vaccines, Senior Care) but no proper `Category` or `Tags` multi-value field. There's no `Author Bio` (richtext) field — just the `Auther Name` (typo) string. There's no `Author Photo` (image) field. There's no `Author Role` (e.g. "DVM, Lead Veterinarian"). For a content-marketing blog, these are standard fields that enable author pages, category landing pages, and tag-based filtering on `/blog`. Currently `/blog` has no filtering UI — visitors can't browse by topic.

Evidence:
Blog collection schema: Image, Title, Description, Auther Name, Published Date, Article type, Read Time, Featured, Slug, Content, id. No Category, Tags, Author Bio, Author Photo, Author Role fields. `/blog` page has no filter/tag UI — only Featured Articles + Articles lists.

Recommended Fix:
Add `Tags` (multi-string or reference collection), `Author Bio` (richtext), `Author Photo` (image), `Author Role` (string). Consider creating an `Authors` collection and converting `Auther Name` to a reference. Add a topic filter to `/blog` (e.g. dropdown or pill row that filters the Articles list by Article type).

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-287 — Service card Collection List "Empty State" has empty text content

Status: Open
Category: CMS
Severity: Low
Location: `/services` page → Collection List `WlJklkSOA` → Empty State frame `x_5gU4Bw5` → RichTextNode `ZNlYU8K7O` (empty TextBlock). Same on `/` home page → Collection List `ucMAEsB2j` → Empty State frame `bzohBi2Us` → RichTextNode `gCnK0d6YH` (empty).

Description:
Both Service Card Collection Lists (on `/services` and on `/`) have an "Empty State" frame containing a RichTextNode with no TextRun — completely empty text. The Empty State is shown when a Collection List filter matches zero items. Currently the home page filter (Featured=true) matches 6 items so the Empty State never triggers. But if all Featured flags were unset (e.g. during a CMS migration or content cleanup), the home page Services section would render a blank space instead of a helpful "No services found" message. Same for `/services` if the collection ever empties.

Evidence:
RichTextNode `ZNlYU8K7O` children: `[{"type":"TextBlock","id":"v:ZNlYU8K7O:0","attributes":{"tag":"p"},"children":[]}]` — no TextRun. RichTextNode `gCnK0d6YH` children: `[{"type":"TextBlock","id":"v:gCnK0d6YH:0","attributes":{"tag":"p"},"children":[]}]` — no TextRun.

Recommended Fix:
Add a TextRun with helpful copy to each Empty State RichTextNode — e.g. "No services match this filter. Try clearing filters or contact us directly." Or remove the Empty State frame entirely if it's unused (less helpful but acceptable).

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-288 — Blog detail page has a node named "Published Date" that actually displays Author Name

Status: Open
Category: CMS
Severity: Low
Location: `/blog/:Blog` detail page → `Article` (`JhuQgDRPQ`) → `Text Container` (`vlqOrAJPz`) → frame `JK7kevfJC` → two RichTextNodes both named "Published Date": `jlkWuBAtS` and `DibSNZ04T`.

Description:
The frame `JK7kevfJC` on the blog detail page contains two sibling RichTextNodes, both with the canvas name "Published Date". One of them (`jlkWuBAtS`) actually displays the Author Name (`text: "var(--variable-v365QHZYL)"` — the Auther Name variable). The other (`DibSNZ04T`) displays the actual Published Date with a `toDateString` transform. The mislabeled node name creates ongoing maintenance confusion — a future editor trying to remove the author from the meta row might delete the wrong node, or a future editor trying to change the date format won't know which "Published Date" node to edit. This is a code-quality issue, not a user-visible bug (the rendering is correct).

Evidence:
RichTextNode `jlkWuBAtS` name="Published Date", attributes.text = `"var(--variable-v365QHZYL)"` (Auther Name variable). RichTextNode `DibSNZ04T` name="Published Date", attributes.text = `{"from":"var(--variable-Q5oytgpyz)","transforms":[{"name":"toDateString","dateStyle":"medium","capitalize":true}]}` (Published Date variable).

Recommended Fix:
Rename node `jlkWuBAtS` from "Published Date" to "Author Name" (or "Author") in the canvas. This is a cosmetic rename in the Framer editor — no rendering impact.

Confidence: High
Discovered by: sub-agent 13, session DR

---

## DR-289 — Cal.com embed on /booking loads synchronously, not lazy-loaded

Status: Open
Category: Performance & technical
Severity: Medium
Location: `/booking` — node `kdx64iDUQ`; Embed ComponentInstanceNodes `O2N4dsp87` (Desktop), `CqSG6wWy3O2N4dsp87` (Tablet), `KYaJPUHtfO2N4dsp87` (Phone); external component `o1PI5S8YtkA5bP5g4dFz` (Embed).

Description:
The `/booking` page renders the Framer Embed component (one per breakpoint) with `$control__type="HTML"` and `$control__hTML` containing the full Cal.com inline embed code. The embedded script immediately injects `<script src="https://app.cal.com/embed/embed.js">` into the document `<head>` on page load (no `defer`/`async`/`loading="lazy"`), then calls `Cal("init", ...)` which makes additional XHR/fetch calls to fetch available time slots for the `vetly/in-clinic-vet-appointment` event type. The desktop embed is sized at a fixed `850px × 541px` and renders an interactive month-view calendar. Because the script runs on initial page paint, it competes with first-paint resources and delays LCP / TBT on `/booking`. The page itself has only 28 canvas nodes (very lightweight) — almost the entire page weight is the third-party Cal.com payload.

Evidence:
Inspected via `framer.agent.serialize({ id: "kdx64iDUQ", depth: 8 })` and dumped `Embed` ComponentInstanceNode attributes. The `$control__hTML` value begins with `<!-- Cal inline embed code begins -->` and contains `(function (C, A, L) { ... d.head.appendChild(d.createElement("script")).src = A; ... })(window, "https://app.cal.com/embed/embed.js", "init");` — synchronous script injection with no lazy-loading wrapper. Three identical embed instances exist (Desktop/Tablet/Phone), all `visible:true`.

Recommended Fix:
Replace the synchronous Cal inline embed with Cal.com's "popup" embed pattern (button-click triggers `Cal("inline", ...)` only after user interaction), or wrap the inline embed in an IntersectionObserver / `requestIdleCallback` so `embed.js` loads only when the calendar section scrolls into view. Cal.com's official docs document both patterns (`https://cal.com/docs/embed`).

Confidence: High
Discovered by: sub-agent 14, session DR

---

## DR-290 — Three disabled Sparkles instances on home add bundle weight without rendering

Status: Open
Category: Performance & technical
Severity: Low
Location: `/` — node `augiA20Il`; Sparkles ComponentInstanceNodes `zy6COpPDa` (Desktop), `hmX39_cxlzy6COpPDa` (Tablet), `BkwtJCk0Lzy6COpPDa` (Phone); external component `aZv0IBlbtH8fqAvXTwno` (Sparkles).

Description:
The home page has 3 instances of the external "Sparkles" code component installed (one per breakpoint) at the path `/Home/{Desktop,Tablet,Phone}/Hero Background/Gradient Mask/Sparkles`. All 3 have `visible:"false"` — they are disabled but still present in the project tree. Framer bundles the Sparkles code component's JS into the page bundle regardless of visibility (the React component is instantiated and then `display:none`'d). Each instance is sized `width:100% height:100%` and configured with `$control__density:0.25`, `$control__speed:0.2`. The animation requestAnimationFrame loop is likely still running even with visibility:false, depending on the component implementation.

Evidence:
Serialized home page tree via `framer.agent.serialize({ id: "augiA20Il", depth: 8 })`. All 3 Sparkles instances dumped with `visible:"false"`:
```
id: zy6COpPDa        path: /Home/Desktop/Hero Background/Gradient Mask/Sparkles   visible: false
id: hmX39_cxlzy6COpPDa path: /Home/Tablet/Hero Background/Gradient Mask/Sparkles  visible: false
id: BkwtJCk0Lzy6COpPDa path: /Home/Phone/Hero Background/Gradient Mask/Sparkles   visible: false
```

Recommended Fix:
Delete the 3 disabled Sparkles ComponentInstanceNodes from the home page. If the design intent was to remove the sparkle effect entirely, also uninstall the Sparkles external component (id `aZv0IBlbtH8fqAvXTwno`) from the project — see DR-14-8.

Confidence: High
Discovered by: sub-agent 14, session DR

---

## DR-291 — /brand-guide page weight exceeds 1000-node threshold (heaviest page)

Status: Open
Category: Performance & technical
Severity: Medium
Location: `/brand-guide` — node `hkW4RaXgm`.

Description:
The brand-guide page has 1186 total nodes in its serialized tree (395 nodes per breakpoint × 3 breakpoints sharing content). This is the only page in the site that exceeds the 1000-node threshold typically flagged as heavy. Of the 395 per-breakpoint nodes, 261 are text nodes — the page is text-heavy (likely covering color palette, typography, spacing, components documentation). 27 component instances and 2 image references per breakpoint. Combined with the 0 animations on this page, the weight is purely DOM/HTML — not a JS overhead concern, but a parsing/rendering concern for low-end devices.

Evidence:
`framer.agent.serialize({ id: "hkW4RaXgm", depth: 12 })` then per-breakpoint node count: Desktop=395, Breakpoint 2 (Tablet)=395, Breakpoint 3 (Phone)=395. Total = 1186. Per-breakpoint breakdown: 261 text, 2 images, 9 component instances, 9 frame wrappers.

Recommended Fix:
Break the brand-guide into multiple smaller pages (e.g. `/brand-guide/colors`, `/brand-guide/typography`, `/brand-guide/components`) with a navigation index, OR convert long-form documentation sections into collapsible accordions / tabbed panels so only one section renders at a time. Also consider lazy-rendering below-the-fold documentation sections with `IntersectionObserver`-based reveal.

Confidence: High
Discovered by: sub-agent 14, session DR

---

## DR-292 — Home page animation density: 81 appearEffects + 117 component instances

Status: Open
Category: Performance & technical
Severity: Medium
Location: `/` — node `augiA20Il`; animations distributed across hero, trust cards, services, why-us, team, testimonials, FAQ sections.

Description:
The home page has 81 `appearEffect` instances (enter animations), 2 `hoverEffect` instances, and 117 ComponentInstanceNodes (the highest count of any page). Of the 81 appearEffects, 61 use `trigger:"onInView"` (good — only fires when scrolled into view via IntersectionObserver) but 20 use `trigger:"onMount"` (bad — fires immediately on page load, even for elements below the fold). All appearEffects animate only transform/opacity properties (`opacity`, `x`, `y`, `scale`, `rotate`, `skewX/Y`) — no layout-property animations, so no layout-thrash jank risk. But the sheer count of Motion components + IntersectionObservers adds non-trivial JS overhead to the home page's initial bundle and runtime.

Evidence:
`framer.agent.serialize({ id: "augiA20Il", depth: 8 })` walked for `appearEffect` and `hoverEffect` attributes. Trigger breakdown: `{"onMount": 20, "onInView": 61}`. Sample appearEffect (Floating Trust Card `GT3p3XJ8w`):
```json
{ "threshold": 0.5, "trigger": "onMount",
  "enter": { "opacity": 0, "x": 0, "y": 32, "scale": 1, "rotate": 0,
             "transition": "tween 0.16,1,0.3,1 1.5s 0.5s" } }
```
The 20 `onMount` animations all fire in the first 2 seconds of page load (with delays up to 1s) — competing with hero image loading and LCP.

Recommended Fix:
Convert the 20 `onMount` appearEffects to `onInView` so they only fire when scrolled into view. Audit each section (Hero, Trust Cards, Services, Why Us, Team, Testimonials, FAQ, Footer) and consider reducing stagger delays for hero-adjacent sections so the above-the-fold animations complete within 1.5s rather than 2s.

Confidence: High
Discovered by: sub-agent 14, session DR

---

## DR-293 — About page animation density: 68 appearEffects + 21 hoverEffects

Status: Open
Category: Performance & technical
Severity: Medium
Location: `/about` — node `mWgiU9J96`; animations distributed across hero, mission cards, stat cards, team, values sections.

Description:
The about page has 68 `appearEffect` instances and 21 `hoverEffect` instances (the highest hover count of any page). The 21 hoverEffects are on Mission Cards (3 instances) and Stat Cards (4 instances × 3 breakpoints) — each applies a `y:-4px` lift on hover with `transition:"spring-physics 400 80 1 0.1s"`. All hover effects use transform/opacity only (GPU-accelerated) — no layout jank. But 68 appearEffects + 21 hoverEffects = 89 total animation bindings on one page, plus 84 component instances — high animation orchestration overhead.

Evidence:
`framer.agent.serialize({ id: "mWgiU9J96", depth: 8 })` walked for animation attributes. Sample hoverEffect (Mission Card `UybosA1wB`):
```json
{ "opacity": 1, "x": "0px", "y": "-4px", "scale": 1, "skewX": "0deg",
  "skewY": "0deg", "transition": "spring-physics 400 80 1 0.1s" }
```

Recommended Fix:
Consider removing the hover lift effect from Mission Cards (it's subtle — only 4px — and may not be perceivable to users anyway). For Stat Cards, consider keeping hover but converting to CSS `:hover` (transform: translateY(-4px)) instead of JS-driven motion to reduce JS overhead. Audit each section's appearEffect trigger (currently all `onMount`) and convert to `onInView`.

Confidence: Medium
Discovered by: sub-agent 14, session DR

---

## DR-294 — 8 of 15 site images are PNG (not next-gen WebP/AVIF)

Status: Open
Category: Performance & technical
Severity: Medium
Location: Site-wide — images on `/`, `/services`, `/about`, `/brand-guide`, `/404`.

Description:
A scan of all 13 pages found 15 unique images, all hosted on `framerusercontent.com` (Framer's CDN — good, no external CDNs). However, the format distribution is suboptimal:
- 8 PNG images (largest format, no compression for photos)
- 6 WebP images (good)
- 1 SVG (excellent)
- 0 AVIF images (best-in-class, not used)

The PNG images include the **home hero image** (`cHm7uXtqXEzL31TFvecwxYDbY.png`, used on `/` hero in both "Hero Image" component instances across 3 breakpoints) and 4 "Why Us Card" images on `/` + `/services`. PNGs typically weigh 2-5x more than equivalent WebP for photographic content. Framer's CDN does NOT auto-convert uploaded PNGs to WebP — the URL extension determines the served format.

The 6 WebP images are all "Team Card" portrait images on `/` and `/about` — these were uploaded as WebP. The inconsistency suggests images were added at different times by different people.

Evidence:
Per-page image URL scan via `framer.agent.serialize({ id: <pageId>, depth: 12 })` walking for `fill` and `$control__image*` attributes matching `framerusercontent.com/images/<hash>.<ext>`. Unique image URL list:
```
PNG (8):
- cHm7uXtqXEzL31TFvecwxYDbY.png    — Home hero image (used 6× across breakpoints)
- 3Z8kHVk06rh4ajROucRbpRBUmFA.png  — Why Us Card image (Home + Services, 6×)
- nH5y95XSthlc24EZp2FmcwWIayA.png  — Why Us Card image (Home + Services, 6×)
- ayfkhMojER7u3LzWk1xfnYyi9Q.png   — Why Us Card image (Home + Services, 6×)
- YzuQf4lIIoJpgvxXq1dhcTSW4.png    — Why Us Card image (Home + Services, 6×)
- 6mcf62RlDfRfU61Yg5vb2pefpi4.png  — Hero Background Noise texture (Home + 404)
- VwOZRgUg3AdI8mtX3xkuIuyU614.png  — (About page)
- wzaOFvr7x6haFaSLTi7jeiaJEKM.png  — (Brand-guide)

WebP (6):
- jtM0NXxAyGpY1geagSUo6uvNjeY.webp — Team Card (Home + About)
- l9trbGg69636tflF30eW7xb9SqQ.webp — Team Card (Home + About)
- gQ3mb3KIWWsZHFPOiFuQ2x9LSU.webp — Team Card (Home + About)
- PcTBm4JYn9qd4cCvhE1eOG0CW9Q.webp — Team Card (Home + About)
- 3YH4HoGM2TVZrslMesdcQmpZ3U.webp — Services Hero image
- 2mYRK3PxyCOvm3oAGgVTcKSvBg.webp — (Brand-guide)

SVG (1):
- 1R4NU3f2Nxccfas5QWXH8vNoyw.svg   — (404 page)
```

Recommended Fix:
Re-export the 8 PNG images as WebP (or AVIF if Framer CDN supports it — currently the team-card WebP images prove WebP works) and re-upload. The hero image (`cHm7uXtqXEzL31TFvecwxYDbY.png`) is the highest priority since it's the LCP element on `/`. Use a tool like `cwebp -q 80 input.png -o output.webp` to convert. Update the `$control__image` / `fill` attributes on the affected ComponentInstanceNodes / FrameNodes to the new WebP URLs.

Confidence: High
Discovered by: sub-agent 14, session DR

---

## DR-295 — 5 of 7 project fonts are unused (typography bloat)

Status: Open
Category: Performance & technical
Severity: Low
Location: Project-level typography settings; affects all pages.

**Additional locations (merged findings):**
- Project-level `<project-fonts>` declaration; affects page-load payload on every page
- Project-level `<project-fonts>` declaration

Description:
The project inventory lists 7 project fonts: `["Inter Display","Inter","Instrument Sans","Geist Mono","Gowun Batang","Geist","Manrope"]`. After auditing all 12 text style presets and walking every text run + every component definition, only **2 fonts** are actually referenced:
- **Inter** — used by 5 text style presets (Text XS/S/M/L/XL, all weight 400) + 14 inline references in component definitions
- **Manrope** — used by 7 text style presets (Heading 1-6, weights 500/600/700) + 2 inline references in component definitions

The other **5 project fonts are NOT used anywhere** in the project:
- `Inter Display` — 0 references in text styles, text runs, or components
- `Instrument Sans` — 0 references
- `Geist Mono` — 0 references (no monospace text anywhere)
- `Gowun Batang` — 0 references (the only serif font in the project — its presence suggests an abandoned serif-design intent)
- `Geist` — 0 references

Framer typically only serves fonts that are actually referenced by `textStylePreset` or inline `font` attributes, so the direct page-weight impact may be limited. However: (a) the project font picker shows all 7, which is misleading for editors and risks accidental usage; (b) if any weight of these unused fonts was explicitly added via Project Settings → Typography, Framer may emit a `@font-face` declaration for them anyway; (c) Gowun Batang is a Korean serif with a larger file size (~150KB+ per weight) — wasted bundle if loaded.

**Additional context (merged from DR-9-2):** The project loads seven font families, but only two are actually used: `Inter` (5 text styles) and `Manrope` (7 text styles). The other five — `Instrument Sans` (10 variants), `Geist Mono` (20 variants), `Gowun Batang` (2 variants), `Geist` (20 variants), and `Inter Display` (declared but 0 variants loaded — see DR-9-3) — are loaded into the project but never referenced by any `TextStylePresetNode` or as an inline `font` override on any of the 822 rich text nodes across all 13 pages. This is dead weight: every visitor's browser downloads font CSS/metadata for 5 unused families, and the brand system documentation is muddied by fonts that aren't part of the visual language.

**Additional context (merged from DR-9-3):** `<project-fonts>` lists `"Inter Display"` as one of the seven project fonts, but `framer.getFonts()` returns 0 variants for this family. A `font-search` query for "Inter Display" via `framer.agent.readProject` returns an empty result array, confirming the family does not exist in Framer's font library. This is an orphan declaration — either a stale leftover from an earlier design iteration or a typo. It does not directly harm rendering (no text node references it), but it pollutes the brand-system inventory and confuses anyone reading the project fonts list.

Evidence:
Two scans:
1. `framer.getTextStyles()` returned 12 text style presets — 5 use Inter, 7 use Manrope, 0 use any other font.
2. `framer.agent.getNodesOfTypes({ types: ["ComponentNode"] })` returned 28 component definitions; serialized each at depth 8 and walked for inline `font`/`fontFamily` attributes or any string matching the 7 project font names. Results: `"Inter": 14, "Manrope": 2`. All other project fonts: 0.

**Additional evidence (from DR-9-2):** - `framer.getFonts()` filtered to project-font names shows variant counts: Inter=20, Manrope=15, Instrument Sans=10, Geist Mono=20, Gowun Batang=2, Geist=20, Inter Display=0.
- `framer.getTextStyles()` shows 12 presets — all use either `Inter` or `Manrope`.
- Walking 822 rich text nodes across all 13 pages found `Inline font overrides: 0` (script `07-rich-text.js`).

**Additional evidence (from DR-9-3):** - `<project-fonts>["Inter Display","Inter","Instrument Sans","Geist Mono","Gowun Batang","Geist","Manrope"]</project-fonts>` (project-inventory.md)
- `framer.getFonts()` filtered: `Inter Display: 0 variants loaded`
- `font-search` for `name: "Inter Display"` → `[]` (empty results)

Recommended Fix:
Open Project Settings → Typography and remove the 5 unused fonts (Inter Display, Instrument Sans, Geist Mono, Gowun Batang, Geist). If Gowun Batang was intended for a specific use case (e.g. serif headings for blog posts), document that intent or implement it; otherwise remove.

**Additional fix note (from DR-9-2):** Remove `Instrument Sans`, `Geist Mono`, `Gowun Batang`, and `Geist` from `<project-fonts>` if they are not intended for future use. Coordinate with sub-agent 14 (performance) for payload impact. If any are intended for future use, document them in the brand guide as "reserved".

**Additional fix note (from DR-9-3):** Remove `"Inter Display"` from `<project-fonts>`. If the design intent was to use a display-weight Inter variant, use Inter's heavier weights (e.g. Inter 800/900) instead.

Confidence: High
Discovered by: sub-agent 14, session DR

---

## DR-296 — 9 of 13 installed external components are unused

Status: Open
Category: Performance & technical
Severity: Low
Location: Project-level Components panel; affects project bundle size and editor performance.

Description:
The project has 13 external components installed (per `<available-components>` External Components section). A site-wide scan of all 13 pages AND all 28 native component definitions shows that only **4 external components are actually used**:

Evidence:
Walked all 13 page trees (`serialize depth: 12`) and all 28 ComponentNode definitions (`serialize depth: 8`), tracking `node.component` field on every ComponentInstanceNode. Cross-referenced against the 13 external component IDs.

Recommended Fix:
Open the Components panel → External Components, and uninstall the 9 unused external components listed above. Keep Embed, GoogleMaps, Phosphor. Optionally also uninstall Sparkles after deleting its 3 disabled instances on home (see DR-14-2).

Confidence: High
Discovered by: sub-agent 14, session DR

---

## DR-297 — Page breakpoints lack `overflow="clip"` — risk of horizontal scroll on mobile

Status: Open
Category: Performance & technical
Severity: Low
Location: All 13 pages — Desktop/Tablet/Phone FrameNode breakpoints. Most acute on `/` home (Phone breakpoint) where decorative background layers are wider than the 390px viewport.

Description:
Per `core-principles.md`, Framer's default `overflow` is `visible`, which lets children bleed outside their parent. The principle states: "set `overflow='clip'` on all containers as a rule of thumb (e.g. page breakpoints, sections, cards, rounded containers, and responsive containers)". A direct attribute check on the home page's 3 breakpoints (`WQLkyLRf1`, `hmX39_cxl`, `BkwtJCk0L`) and the Phone breakpoint's `Hero Background/Gradient Mask` frame (`BkwtJCk0LV5nApHoTz`) shows `overflow`, `overflowX`, and `overflowY` are all `undefined` — i.e. defaulting to `visible`.

On the home Phone breakpoint (390px wide), the following decorative layers are wider than the viewport:
- `Hero Background/Gradient Mask` — 750px wide
- `Vertical Grid` — 1440px wide
- `BG` (image fill) — 1440px wide
- `Noise` (image fill) — 1440px wide
- `Vertical Grid/FrameNode` — 626px wide
- `Right Glow/Primary Gradient` — 420px wide
- `Right Glow/Secondary Gradient` — 420px wide

Without `overflow="clip"` on the Phone breakpoint or its Hero Background section, these 1440px-wide image fills will visually extend beyond the 390px viewport. Framer's runtime typically clips at the document level, so visible horizontal scroll may or may not occur — but the layout intent is unclear without explicit clipping.

Evidence:
`framer.agent.getNode({ id: "BkwtJCk0L" }, { pagePath: "/" })` returned attributes with no `overflow*` fields. Same for `WQLkyLRf1`, `hmX39_cxl`, and `BkwtJCk0LV5nApHoTz`. Width scan via `framer.agent.serialize({ id: "augiA20Il", depth: 8 })` found 25 fixed-width elements >390px on home, 7 of which are on the Phone breakpoint's Hero Background section.

Recommended Fix:
On every page's Phone (and Tablet) breakpoint root FrameNode, set `overflow="clip"` (or at minimum `overflowX="clip"`). Also set `overflow="clip"` on the Hero Background sections (and any other section containing decorative full-bleed layers). This aligns with `core-principles.md` Overflow control rule and prevents any potential horizontal-scroll regression on mobile devices.

Confidence: Medium
Discovered by: sub-agent 14, session DR

---

## DR-298 — /documentation and /brand-guide have auto-named "Breakpoint 2"/"Breakpoint 3" instead of "Tablet"/"Phone"

Status: Open
Category: Performance & technical
Severity: Low
Location: `/documentation` (id `B49BfU8Yb`) breakpoints `u78lgJ27h` and `Yak1bjj2W`; `/brand-guide` (id `hkW4RaXgm`) breakpoints `ca9bRdpvP` and `Pog7IJxbF`.

Description:
Of the 13 pages, 11 have properly named breakpoints (Desktop / Tablet / Phone). Two pages — `/documentation` and `/brand-guide` — have generic auto-generated names: "Breakpoint 2" (768px) and "Breakpoint 3" (390px). These names were assigned by Framer when the responsive breakpoints were auto-created and never renamed by the editor. This is a maintainability issue rather than a runtime performance issue, but it falls under technical hygiene.

Evidence:
`framer.agent.serialize({ id: <pageId>, depth: 1 })` for each page; the top-level FrameNode children's `name` attribute returned "Breakpoint 2" and "Breakpoint 3" only on `/documentation` and `/brand-guide`. All other 11 pages returned "Tablet" and "Phone".

Recommended Fix:
Rename the breakpoints on `/documentation` and `/brand-guide`: "Breakpoint 2" → "Tablet", "Breakpoint 3" → "Phone". This is a no-op for runtime but improves editor clarity for future maintainers.

Confidence: High
Discovered by: sub-agent 14, session DR

---

## DR-299 — GoogleMaps external component is used (via Map card) on /contact — verify lazy-loading

Status: Open
Category: Performance & technical
Severity: Low
Location: `/contact` — node `CimqoCoMb`; Map card ComponentInstanceNodes `cXuHXndOE` (3 instances, one per breakpoint: `WTvyTaGlZ`, `byRCt5S1oWTvyTaGlZ`, `byRCt5S1oT...`); the Map card component definition (`cXuHXndOE`) contains a GoogleMaps ComponentInstanceNode (`ZN79Op08h`) on its Desktop variant.

Description:
The task brief asked: "GoogleMaps (id `Hbc0lxqGSRzFG6uMT9yO`) — used on /contact? Does it lazy-load?". Investigation confirms:
- GoogleMaps is NOT placed directly on `/contact` page — a direct descendant scan returns 0 instances.
- However, GoogleMaps IS used **indirectly** via the native "Map card" component (`cXuHXndOE`), which contains a GoogleMaps ComponentInstanceNode inside its Desktop variant. The Map card is used 3× on `/contact` (one per breakpoint). The Map card passes `$control__location="123 Pet Care Lane, New York, NY 12345"` and `$control__zoom=19` through to GoogleMaps.

The Framer GoogleMaps external component typically renders as an `<iframe>` pointing at `google.com/maps/embed/v1/place?key=...&q=...&zoom=...`. The third-party component's source is not directly inspectable via the Framer API, so I cannot definitively verify whether the iframe uses `loading="lazy"` or not. The standard Framer GoogleMaps component DOES include `loading="lazy"` on the iframe per Framer's marketplace conventions, but this should be verified by inspecting the published page's network requests.

Evidence:
`framer.agent.serialize({ id: "cXuHXndOE", depth: 12 })` returned the Map card component definition tree showing:
```
ComponentNode Cards/Map card (cXuHXndOE)
└── FrameNode Desktop (LUlcDPx_4)
    └── ComponentInstanceNode (ZN79Op08h)
        component: Hbc0lxqGSRzFG6uMT9yO (GoogleMaps)
        $control__location: "var(--variable-U0qlwJdwV)"  // bound to Map card's $control__location prop
        $control__zoom: "19"
        $control__radius: "18px"
        width: "1fr"  height: "1fr"
```

Recommended Fix:
After publish, inspect the live `/contact` page's network panel and confirm the Google Maps iframe has `loading="lazy"`. If it doesn't, consider replacing the Framer GoogleMaps external component with a directly-coded `<iframe loading="lazy" src="https://www.google.com/maps/embed?pb=...">` to guarantee lazy-loading. Also consider reducing zoom from 19 (very close street-level) to 14-15 (neighborhood view) for better visual context.

Confidence: Medium
Discovered by: sub-agent 14, session DR

---

## DR-300 — Zero redirects configured at the project level

Status: Open
Category: Site settings & structure
Severity: Medium
Location: Project-level `RedirectNode`s (currently empty array). Affects every old/alternate URL pattern a visitor might type.

Description:
`framer.agent.getNodesOfTypes({ types: ["RedirectNode"] })` returns `[]`. The site has zero HTTP redirects configured, so any alternate path a visitor or external link uses will hit the `/404` page rather than silently redirecting to the canonical URL. Common patterns missing:
- `/home` → `/` (very common habit)
- `/index` → `/`
- `/service` → `/services` (singular → plural)
- `/appointment`, `/book`, `/appointments` → `/booking`
- `/privacy`, `/privacy` → `/privacy-policy`
- `/terms`, `/tos` → `/terms-of-service`
- `/about-us` → `/about`
- `/articles`, `/news` → `/blog`
- `/blog/post-name` deep-link pattern (if URL slug changes are ever made)

The plugin API confirms redirects are created via `RedirectNode` (`from`/`to`, `308` permanent). The skill file's `how-projects-work.md` §Redirects documents literal, slug, and wildcard redirect support, so wildcard-based patterns are achievable in a single node.

Evidence:
`framer.agent.getNodesOfTypes({ types: ["RedirectNode"] })` returns `[]`. (Captured 2026-08-07.)

Recommended Fix:
Add at minimum a wildcard redirect `from="/home" to="/"` and singular→plural redirects `/service` → `/services`, `/appointment` → `/booking`, `/about-us` → `/about`, `/privacy` → `/privacy-policy`, `/terms` → `/terms-of-service`. If old blog/service URLs existed before a CMS migration, add a slug-based redirect like `from="/blog/:article" to="/blog/:article"` (no-op) or to the new pattern. Use `+RedirectNode` with `from`/`to` attributes per the grammar in `how-projects-work.md` §Redirects.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-301 — Footer "Legal" column includes a link to `/404`

Status: Open
Category: Footer & global elements
Severity: Medium
Location: Footer component `Xx2RpZ5pV`, Desktop variant `SM4CTALR7`, "Links Group" `WuNhnSEiq`, NavLink Button instance `mmxv8gG3i` ("404 Link").

Description:
The Footer's Legal column contains three NavLink Button instances: Privacy Policy (`/privacy-policy#privacy-policy`), Terms of Service (`/terms-of-service#terms-of-service`), and a third link labeled **"404"** pointing to `/404#404`. Linking to a 404 error page from the site footer is highly unusual — visitors clicking it will see the "Oops! This path leads to the past." error message (which currently also references "Pavyon" — see DR-15-3). This is almost certainly a leftover from template development where the 404 link was used as a way to demo the 404 page. Real users have no reason to navigate to a 404 page on purpose; including it in the footer legal section is confusing and unprofessional.

Evidence:
`framer.agent.getDescendantsOfTypes({ id: "SM4CTALR7", types: ["ComponentInstanceNode"] }, { pagePath: "/" })` returns (among others) `{ id: "mmxv8gG3i", name: "404 Link", component: "gUM1o8Yyz", $componentDisplayName: "NavLink Button", text: "404", link: "/404#404", variant: "Not Active", iconName: "House" }`. Same instance is replicated on the Tablet (`IToCCjwER...`) and Phone (`wxI9ElO4C...`) footer variants.

Recommended Fix:
Delete the "404 Link" NavLink Button instance (`mmxv8gG3i`) from the Footer's Legal "Links" frame `Drw0d6PXR`. If a fourth legal link is desired, replace it with a relevant one (e.g. "Cookie Policy", "Accessibility Statement", "Sitemap"). Update all three breakpoints (Desktop/Tablet/Phone) consistently.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-302 — Header phone number "+123-456-7890" is a placeholder (not a real clinic number)

Status: Open
Category: Footer & global elements
Severity: High
Location: Header component `AZd_vmoUt`, all 4 variants (Desktop `PP5wyjmXI`, Desktop Open `SndyLBcPW`, Tablet `WVwnpCf7j`, Phone `zCwAoDfvL`); Outline Button instance `YusTGfBLD` (and its replicas).

Description:
The Header's Outline Button shows the text `"+123-456-7890"` and links to `tel:+123-456-7890`. The number `123-456-7890` is the classic sequential-digit placeholder (analogous to "555-0100" in film/TV) — it does not connect to a real veterinary clinic. A visitor who taps the call button on mobile (or copies the number) will dial a non-working or wrong number. For a veterinary site — where emergency callers may use this button in a panic — pointing them at a fake number is a serious trust and safety issue. The same fake number appears on all 4 Header variants (Desktop, Desktop Open, Tablet, Phone), so the bug is universal.

Evidence:
Header Desktop variant serialize shows Outline Button instance `YusTGfBLD` with `$control__text: "+123-456-7890"` and `$control__link: "tel:+123-456-7890"`. Tablet replica `WVwnpCf7jYusTGfBLD` and Phone replica `zCwAoDfvLYusTGfBLD` carry the same `$control__text` and `$control__link` values. (Note: the phone number is hidden on Tablet and Phone breakpoints because the parent `Buttons Container` has `visible: "false"`, but the data is still there and would render if visibility were toggled.)

Recommended Fix:
Replace `+123-456-7890` on all 4 Header variants with the actual Vetly clinic phone number, in both `$control__text` and `$control__link` (e.g. `tel:+15551234567`). Coordinate with the contact info that should also be added to the Footer (see DR-15-8). If the actual number is unknown, replace with a clearly-empty state (e.g. hide the phone Outline Button entirely) rather than shipping a fake number.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-303 — Footer social-media links point to bare platform homepages, not Vetly's profiles

Status: Open
Category: Footer & global elements
Severity: Medium
Location: Footer component `Xx2RpZ5pV`, Desktop variant `SM4CTALR7`, "Links Group" `w8S66Qlnl` ("Socials" column); instances `KfZHu7unQ` (Facebook), `yivQwwNqe` (Instagram), `vLUOVqL3m` (Twitter), `ln3RiOvtG` (Linkedin). Same on Tablet and Phone variants.

Description:
All four social-media NavLink Button instances in the Footer's "Socials" column link to the bare platform domain, not to an actual Vetly profile:
- Facebook Link → `https://www.facebook.com/`
- Instagram Link → `https://instagram.com`
- Twitter Link → `https://x.com`
- Linkedin Link → `https://www.linkedin.com`

A visitor clicking any of these lands on the social platform's homepage (logged-in feed or sign-in screen), not on Vetly's profile. This defeats the purpose of having social links in the footer — there is no brand discovery, no follower conversion, no cross-platform presence. The links also do not set `$control__newTab: "true"` (verified default `"false"`), so they navigate away from the Vetly site in the same tab. These are clearly placeholder URLs left over from template setup.

Evidence:
`framer.agent.getDescendantsOfTypes({ id: "SM4CTALR7", types: ["ComponentInstanceNode"] })` returns instances with `$control__link` values `https://www.facebook.com/`, `https://instagram.com`, `https://x.com`, `https://www.linkedin.com` respectively. All have `$control__newTab: "false"` (implicit default).

Recommended Fix:
Replace each `$control__link` value with the actual Vetly social profile URL (e.g. `https://www.facebook.com/VetlyClinic`, `https://www.instagram.com/vetly`, `https://x.com/vetly`, `https://www.linkedin.com/company/vetly`). Set `$control__newTab: "true"` on each instance so social platforms open in a new tab (preserves the visitor's place on the Vetly site). If Vetly doesn't have a presence on one of these platforms, remove that link rather than shipping a dead-end homepage link. Apply consistently across Desktop/Tablet/Phone variants.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-304 — Footer is missing critical veterinary-site content (phone, address, hours, emergency contact, newsletter, accreditation)

Status: Open
Category: Footer & global elements
Severity: High
Location: Footer component `Xx2RpZ5pV` (all 3 variants).

Description:
The Footer currently contains: Logo + tagline ("Take care of your pet's health."), a 3-column Navigation grid (Navigate / Socials / Legal), and a copyright line ("© 2026 Vetly. All rights reserved."). For a veterinary clinic site, the footer is missing every piece of trust-and-contact content a pet owner would expect to find there:

| Expected for a vet site | Present? |
|---|---|
| Logo + brand | ✓ |
| Tagline | ✓ |
| Quick nav links | ✓ (Services, About, Blog, Contact) |
| Social media links | ✓ (4 platforms — but URLs are placeholders, see DR-15-6) |
| Legal links (Privacy, Terms) | ✓ (plus stray 404 link — see DR-15-4) |
| Copyright notice | ✓ (current year 2026) |
| **Physical clinic address** | ✗ Missing |
| **Phone number (click-to-call)** | ✗ Missing (header has placeholder, but footer has none) |
| **Email address** | ✗ Missing |
| **Business hours (open/closed)** | ✗ Missing |
| **Emergency contact info (separate from regular)** | ✗ Missing — critical for vet sites |
| **Newsletter / email signup** | ✗ Missing |
| **Accreditation badges (AAHA, etc.)** | ✗ Missing |
| **Map / Get Directions link** | ✗ Missing |

The Header's "Book Today" CTA and the CTA section ("Ready to Give Your Pet the Best Care?") above the Footer compensate somewhat, but a visitor who scrolls to the bottom of any page (Home, Services, About, Blog, Contact, Privacy, Terms, etc.) looking for "where is the clinic?" / "what are the hours?" / "is there an emergency line?" will find nothing. This is a notable conversion and trust gap.

Evidence:
`framer.agent.getDescendantsOfTypes({ id: "SM4CTALR7", types: ["TextRun"] })` returns only 5 TextRun nodes: "Take care of your pet's health.", "Navigate", "Socials", "Legal", "© 2026 Vetly. All rights reserved." No address, phone, email, hours, or emergency text exists anywhere in the Footer. Component instances are limited to 11 NavLink Buttons (4 Navigate + 4 Socials + 3 Legal) and the Logo Icon frame — no contact cards, no Map card, no newsletter form, no badge images.

Recommended Fix:
Add a fourth footer column (or a contact strip above the copyright row) containing at minimum: clinic street address, click-to-call phone (matching the corrected Header number from DR-15-5), email (mailto link), and business hours. Consider adding a prominent "Emergency: 24/7 — call XXX" line, since emergency care is a key Vetly service mentioned in the page metadata. Optionally add a Map card (`cXuHXndOE`) for directions, a newsletter signup (a Kit/Mailchimp/Loops embed — Framer ships these as available components), and accreditation badge images. The Framer project already has a "Contact Card" component (`Iz7ICmC8H`) and "Map card" (`cXuHXndOE`) that could be reused.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-305 — No default Open Graph / social share image set at the RootNode metadata level

Status: Open
Category: Site settings & structure
Severity: High
Location: `rootNode` (site-wide default metadata). Only `/blog/:Blog` (node `DvEqpc9aQ`) sets a `socialImage` (sourced from CMS variable `var(--variable-kZ3Cwfwri)`).

Description:
The RootNode metadata returned by `framer.agent.getNode({ id: "rootNode" })` contains `title`, `description`, `favicon`, `faviconDark`, and `appleTouchIcon` — but NO `socialImage` (default OG image). As a result, when any page (other than `/blog/:Blog`) is shared on Facebook, X/Twitter, LinkedIn, Slack, iMessage, etc., the link preview will show no image — just the title and description text. This significantly reduces click-through rates on social shares (link previews with images get 2-3x more clicks than text-only) and makes the brand look unpolished. With 12 of 13 pages lacking a `socialImage`, the vast majority of shareable URLs on the site (Home, Services, About, Blog index, Contact, Booking, Documentation, Brand Guide, Privacy, Terms, 404, and Services detail) will all share without an image. The /blog/:Blog detail page is the only one that correctly pulls a `socialImage` from CMS.

Evidence:
`framer.agent.getNode({ id: "rootNode" })` returns `attributes.metadata = { title: "Vetly - Trusted Veterinary Care for Your Pet", description: "...", favicon: "...svg", faviconDark: "...svg", appleTouchIcon: "...png" }` — no `socialImage` key. Per-page metadata for `/`, `/services`, `/about`, `/blog`, `/contact`, `/booking`, `/documentation`, `/brand-guide`, `/privacy-policy`, `/terms-of-service`, `/404`, `/services/:Services` — none have `socialImage` set. Only `/blog/:Blog` (node `DvEqpc9aQ`) has `metadata.socialImage: "var(--variable-kZ3Cwfwri)"`.

Recommended Fix:
Upload a default OG image (recommended 1200×630px PNG/JPG) and set it on the RootNode metadata via `SET rootNode metadata.socialImage="https://framerusercontent.com/images/<uploaded-image>.jpg";`. The image should be brand-appropriate (e.g. the Vetly logo on a branded background, or a hero photo of a pet with the clinic). For high-traffic pages (Home, Services, About), consider also setting page-specific `socialImage` overrides. Coordinate with sub-agent 7 (SEO) which likely also flagged missing OG images.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-306 — Favicon is SVG-only; no PNG fallback for legacy browsers

Status: Open
Category: Site settings & structure
Severity: Low
Location: `rootNode.attributes.metadata.favicon` and `metadata.faviconDark` (both `https://framerusercontent.com/images/uIdSeGFrTg2DRXzrKm5xFU6ZI.svg`).

Description:
The site's favicon is set to a single SVG file (used for both `favicon` and `faviconDark`). SVG favicons are supported in modern browsers (Chrome, Firefox, Safari 12+, Edge) but are NOT supported in older Safari (<12), Internet Explorer, or some legacy embedded webviews. The Apple Touch Icon (`PHSAprphYHKPfcgIrMSwQ0CXA.png`) is correctly set as a PNG and covers iOS home-screen bookmarks, but there is no general-purpose PNG favicon (16x16 or 32x32) for legacy contexts. Most modern traffic will see the SVG fine, so impact is limited, but a PNG fallback is a one-line fix that closes the gap completely.

Evidence:
`framer.agent.getNode({ id: "rootNode" })` returns `metadata.favicon = "https://framerusercontent.com/images/uIdSeGFrTg2DRXzrKm5xFU6ZI.svg"`, `metadata.faviconDark = "https://framerusercontent.com/images/uIdSeGFrTg2DRXzrKm5xFU6ZI.svg"`, `metadata.appleTouchIcon = "https://framerusercontent.com/images/PHSAprphYHKPfcgIrMSwQ0CXA.png"`. No `favicon.png` or 16x16/32x32 PNG variants are present.

Recommended Fix:
Upload a 32×32 PNG (and optionally a 16×16 PNG) version of the favicon and add them as additional favicon entries in the RootNode metadata. If Framer's RootNode only accepts a single `favicon` field, prefer keeping the SVG (modern browsers) — the Apple Touch Icon PNG already covers iOS. This is a polish item; modern-browser visitors are unaffected.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-307 — No language/locale declared in site metadata or RootNode

Status: Open
Category: Site settings & structure
Severity: Medium
Location: `rootNode` site-wide metadata (no `lang` / `locale` field); pages do not declare language either.

Description:
The RootNode metadata returned by `getNode` contains no `lang` or `locale` field. Framer does not currently expose a `lang` attribute on the RootNode via the plugin API (per the skill file's note that "Localization functionality cannot currently be implemented with the current tools"), but the absence of any explicit language declaration is still worth flagging: all site copy is in English (verified across Home, Services, About, Blog, Contact, Booking, Privacy, Terms, 404 pages), but neither the RootNode metadata nor the per-page metadata declares `lang="en"` or `lang="en-US"`. Browsers and screen readers default to the user's OS language when no `lang` attribute is set on `<html>`, which can cause incorrect pronunciation of English text by assistive technology for non-English-OS users. Search engines also use the `lang` attribute as a hint for language targeting.

Evidence:
`framer.agent.getNode({ id: "rootNode" })` returns `attributes.metadata` with keys `title`, `description`, `favicon`, `faviconDark`, `appleTouchIcon` — no `lang` or `locale` key. All 13 pages' metadata likewise contain no language field.

Recommended Fix:
If Framer exposes a `lang` field on the RootNode in the editor (check Settings → Site → Localization), set it to `en` (or `en-US` if region-specific). If the plugin API does not yet support setting this, document it as a manual configuration step for the site owner. This is also an accessibility finding (sub-agent 8 may flag it).

Confidence: Medium (plugin API may not expose this setting; needs editor verification)
Discovered by: sub-agent 15, session DR

---

## DR-308 — `/blog/:Blog` CMS detail page does not set "Blog Active" nav state (inconsistent with `/services/:Services`)

Status: Open
Category: Site settings & structure
Severity: Medium
Location: `/blog/:Blog` (node `DvEqpc9aQ`); `attributes.$control__activeLink` is `"Default"`. Compare to `/services/:Services` (node `lhpeg56oV`) which sets `"$control__activeLink": "Services Active"`.

Description:
The site uses the layout template's `$control__activeLink` control (variable `fsIimGPkb`) to highlight the current section in the Header's Nav Bar. The 5 main pages set this correctly:
- `/` → "Home Active"
- `/services` → "Services Active"
- `/about` → "About Active"
- `/blog` → "Blog Active"
- `/contact` → "Contact Active"

The `/services/:Services` CMS detail page inherits "Services Active" (correct — when viewing a service detail, the Services nav item should be highlighted). However, the `/blog/:Blog` CMS detail page sets `$control__activeLink: "Default"` — meaning when a visitor reads a blog article, NONE of the nav items is highlighted. This is inconsistent with the services detail behavior and a missed wayfinding cue: blog readers can't tell at a glance that they're inside the Blog section.

Evidence:
`framer.agent.getNode({ id: "DvEqpc9aQ" }, { pagePath: "/blog/:Blog" })` returns `attributes.$control__activeLink: "Default"`. `framer.agent.getNode({ id: "lhpeg56oV" }, { pagePath: "/services/:Services" })` returns `attributes.$control__activeLink: "Services Active"`. Nav Bar component `bTXu1FqyY` has a "Blog Active" variant (`SlVOr2Z70`) available.

Recommended Fix:
Set `attributes.$control__activeLink` to `"Blog Active"` on the `/blog/:Blog` WebPageNode (node `DvEqpc9aQ`) to match the services-detail pattern. Use `framer.agent.applyChanges("SET DvEqpc9aQ $control__activeLink=\"Blog Active\";", { pagePath: "/blog/:Blog" })`.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-309 — Nav Bar has no active-state variants for Booking, Documentation, Brand Guide, Privacy, Terms, or 404 pages

Status: Open
Category: Site settings & structure
Severity: Low
Location: Nav Bar component `bTXu1FqyY` (only 6 variants: Default, Home Active, Services Active, About Active, Blog Active, Contact Active). Affects `/booking`, `/documentation`, `/brand-guide`, `/privacy-policy`, `/terms-of-service`, `/404` pages — all set `$control__activeLink: "Default"`.

Description:
The Nav Bar component was designed with active-state variants for the 5 primary nav items (Home, Services, About, Blog, Contact). The 6 secondary pages (Booking, Documentation, Brand Guide, Privacy Policy, Terms of Service, 404) have no corresponding active variant, so they all fall back to `"Default"` (no nav item highlighted). For pages like `/booking` that are accessed via the "Book Today" CTA (not via a nav link), the lack of active state is fine — booking isn't a nav destination. But for `/privacy-policy` and `/terms-of-service` (linked from the Footer Legal column) and for `/documentation` and `/brand-guide` (linked from elsewhere), visitors landing on these pages see a Nav Bar with no active state, which is a minor wayfinding inconsistency. This is acceptable as-is for legal/internal pages (which are not primary nav destinations), but is worth noting.

Evidence:
`framer.agent.serialize({ id: "bTXu1FqyY", depth: 1 })` returns `$variants: [{ id: "GBHKk2wfg", name: "Default" }, { id: "zoi6vWvSq", name: "Home Active" }, { id: "wKsJPXiD6", name: "Services Active" }, { id: "eZsgGzdxK", name: "About Active" }, { id: "SlVOr2Z70", name: "Blog Active" }, { id: "bpDYafag8", name: "Contact Active" }]`. No variants for Booking/Documentation/Brand Guide/Privacy/Terms/404. Pages `/documentation`, `/brand-guide`, `/privacy-policy`, `/terms-of-service`, `/404` all set `$control__activeLink: "Default"` (verified via getNode on each).

Recommended Fix:
Low priority — leave as-is for legal/template pages. If desired, add a "Privacy Active" variant for `/privacy-policy` and `/terms-of-service` (e.g. combining them into a single "Legal Active" highlight). Documentation/Brand Guide are typically hidden from public nav anyway (they have `noIndex: true`).

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-310 — Header CTA buttons (phone + "Book Today") are hidden on Tablet and Phone breakpoints; only accessible via hamburger menu

Status: Open
Category: UX & conversion
Severity: Medium
Location: Header component `AZd_vmoUt`, Tablet variant `WVwnpCf7j` and Phone variant `zCwAoDfvL`; "Buttons Container" frame `JdNMje4xw` (and replicas `WVwnpCf7jJdNMje4xw`, `zCwAoDfvLJdNMje4xw`).

Description:
On the Desktop variant, the Header shows two CTAs in the "Buttons Container" frame: an Outline Button with the clinic phone number (currently "+123-456-7890", see DR-15-5) and a Primary Button "Book Today" linking to `/booking`. On the Tablet and Phone variants, the same "Buttons Container" frame has `visible: "false"` set — meaning BOTH CTAs are hidden on tablet/mobile. The only way for a mobile visitor to access the "Book Today" CTA is to open the Nav Dropdown (hamburger menu) and find it inside the "Actions" sub-frame of the dropdown. The phone-number CTA is not in the dropdown's Actions sub-frame (only the "Book Today" Primary Button appears there based on the Nav Dropdown structure). On mobile, click-to-call is one of the highest-converting actions for a veterinary clinic — hiding the phone CTA behind a non-existent dropdown entry is a real conversion loss.

Evidence:
Header Tablet variant serialize: `WVwnpCf7jJdNMje4xw` (Buttons Container) has `attributes.visible: "false"`. Header Phone variant serialize: `zCwAoDfvLJdNMje4xw` (Buttons Container) has `attributes.visible: "false"`. The Nav Dropdown's "Actions" sub-frame (`SaV1WmFRh`) is `$truncated` at depth 4 with `$descendantCount: 2` — would need to verify what's actually inside, but the structure suggests only one or two action buttons.

Recommended Fix:
Either (a) re-enable the phone-number Outline Button visibility on Tablet/Phone (just the phone, not "Book Today" — to keep the mobile header uncluttered) by setting `visible: "true"` on the Outline Button instance (`WVwnpCf7jYusTGfBLD`, `zCwAoDfvLYusTGfBLD`) — keep the "Book Today" button hidden on mobile since it's redundant with the hamburger-menu version. Or (b) verify the Nav Dropdown's "Actions" sub-frame contains both the phone and Book Today buttons so they're at least accessible via the hamburger menu. Coordinate with sub-agent 10 (UX & conversion) which may have flagged the mobile nav pattern. Also note: the phone number itself is a placeholder (DR-15-5) — fix that before re-enabling visibility.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-311 — Logo image `altText` is the literal string "Logo" (not descriptive) on every Header variant

Status: Open
Category: Accessibility & compliance
Severity: Low
Location: Header component `AZd_vmoUt`, all 4 variants (Desktop `PP5wyjmXI`, Desktop Open `SndyLBcPW`, Tablet `WVwnpCf7j`, Phone `zCwAoDfvL`); "Logo Image" FrameNode `EgEOGkbpb` (and replicas). Footer component `Xx2RpZ5pV` has the same issue on its logo image (`eY3NqxR_c` and replicas — also `altText: "Logo"`).

Description:
The Header's "Logo Image" FrameNode has `altText: "Logo"` — a generic string that doesn't convey the brand name or purpose. Screen readers will announce "Logo" which is uninformative. WCAG 2.1 SC 1.1.1 (Non-text Content) requires that informative images have text alternatives that serve the equivalent purpose. For a logo that links to the home page, the appropriate alt text is the brand name (e.g. "Vetly — home") or simply "Vetly home". The same issue exists on the Footer's logo image.

Evidence:
Header Desktop variant: `EgEOGkbpb.attributes.altText = "Logo"`. Header Tablet: `WVwnpCf7jEgEOGkbpb.attributes.altText = "Logo"`. Header Phone: `zCwAoDfvLEgEOGkbpb.attributes.altText = "Logo"`. Footer Desktop: `eY3NqxR_c.attributes.altText = "Logo"`. Same on Tablet (`IToCCjwEReY3NqxR_c`) and Phone (`wxI9ElO4CeY3NqxR_c`) variants.

Recommended Fix:
Set `altText` to "Vetly — home" (or "Vetly logo") on every Logo Image instance across all Header and Footer variants. Use `framer.agent.applyChanges("SET EgEOGkbpb altText=\"Vetly — home\"; SET SndyLBcPWEgEOGkbpb altText=\"Vetly — home\"; ...")` for all 4 Header variants × 1 image + 3 Footer variants × 1 image = 7 nodes. Coordinate with sub-agent 8 (Accessibility) which likely also flagged this.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-312 — Domain configuration and auto-publish settings cannot be verified via the plugin API

Status: Open
Category: Site settings & structure
Severity: Low
Location: Project-level settings (domain, auto-publish) — not exposed via plugin API.

Description:
`framer.getProjectInfo()` returns only `{ id, name, apiVersion1Id }` — it does not expose the production domain (custom domain vs `*.framer.app`), the staging domain, the auto-publish setting, or any publishing/version history. Without this, the audit cannot verify whether the site is published to a custom domain (e.g. `vetly.com`) or to a default Framer subdomain (e.g. `vetly.framer.app`), and cannot confirm whether auto-publish is on. This is a tooling limitation, not a site defect — but it means the orchestrator should manually verify these settings in the Framer editor (Project Settings → Domains → Auto-publish) before declaring the audit complete.

Evidence:
`framer.getProjectInfo()` returned `{ id: "0094533deb4db938c3a5ed9816b5bdf6a7c545a610b4c526d3411eeec400b304", name: "Vetly", apiVersion1Id: "1666046897" }` — no domain or publishing fields.

Recommended Fix:
Manual verification step — site owner or orchestrator should open the Framer project's Settings → Domains panel and confirm: (a) a custom domain is configured and points to the production site, (b) the `*.framer.app` fallback domain is acceptable or hidden, (c) auto-publish is set to the intended behavior (on for fast iteration, off for controlled releases). Consider asking Framer to expose these settings via the plugin API in a future release.

Confidence: High (that the API does not expose these settings)
Discovered by: sub-agent 15, session DR

---

## DR-313 — `/about` page has an `elementId` with a trailing space ("Stats ") which can break hash-link navigation

Status: Open
Category: Site settings & structure
Severity: Low
Location: `/about` (node `mWgiU9J96`); "Stats" FrameNode `g352OHmnR` (and replicas `EZ72HJieVg352OHmnR`, `yOUSYkrsWg352OHmnR`).

Description:
The /about page's "Stats" section FrameNode has `elementId: "Stats "` — note the trailing space character. URL fragment identifiers are case-sensitive and the trailing space is preserved in the rendered `id` attribute. While no current nav link points to `/about#stats` or `/about#Stats `, any future anchor link, table-of-contents, or in-page jump that tries to target this section will need to URL-encode the space (`%20`) to work reliably. This is a latent defect — currently no impact since no link uses this anchor, but it's a sign of incomplete input sanitation and could cause confusing bugs later.

Evidence:
`framer.agent.getDescendantsOfTypes({ id: "mWgiU9J96", types: ["FrameNode"] }, { pagePath: "/about" })` returns (among others) `{ id: "g352OHmnR", name: "Stats", elementId: "Stats " }` (trailing space visible in JSON output). Same on Tablet (`EZ72HJieVg352OHmnR`) and Phone (`yOUSYkrsWg352OHmnR`) replicas.

Recommended Fix:
Set the elementId to `"stats"` (lowercase, no trailing space) on all 3 variants: `SET g352OHmnR elementId="stats"; SET EZ72HJieVg352OHmnR elementId="stats"; SET yOUSYkrsWg352OHmnR elementId="stats";` (executed on `/about`). Use a consistent lowercase kebab-case convention for all elementIds across the site (existing examples: `home`, `main`, `hero`, `services`, `why-us`, `team`, `testimonials`, `location`, `faq`, `blog`, `footer` — all lowercase; the `Blog` elementId on home page is also uppercase and should be normalized to `blog`).

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-314 — Home page's Blog section `elementId` is `"Blog"` (capitalized), inconsistent with all other anchors

Status: Open
Category: Site settings & structure
Severity: Low
Location: `/` (home page, node `augiA20Il`); "Blog" FrameNode `ODSnKnEj0` (and replicas `hmX39_cxlODSnKnEj0`, `BkwtJCk0LODSnKnEj0`).

Description:
On the home page, the "Blog" section FrameNode has `elementId: "Blog"` (capitalized B). All other home-page elementIds are lowercase (`home`, `main`, `hero`, `services`, `why-us`, `team`, `testimonials`, `location`, `faq`, `footer`). URL fragments are case-sensitive per RFC 3986 — a link to `/#blog` (lowercase) would NOT scroll to this section; only `/#Blog` (capital B) would. The Nav Bar's "Blog" link points to `/blog#blog` (lowercase) which navigates to the `/blog` page (where the elementId is correctly lowercase `blog`), so this inconsistency is currently masked. But it's a latent defect that will cause confusion if anyone tries to link to the home-page Blog section specifically.

Evidence:
`framer.agent.getDescendantsOfTypes({ id: "augiA20Il", types: ["FrameNode"] }, { pagePath: "/" })` returns `{ id: "ODSnKnEj0", name: "Blog", elementId: "Blog", scrollTargetEnabled: true }` (and the same on Tablet/Phone replicas). Compare to all other home-page elementIds which are lowercase.

Recommended Fix:
Set the elementId to `"blog"` (lowercase) on all 3 variants: `SET ODSnKnEj0 elementId="blog"; SET hmX39_cxlODSnKnEj0 elementId="blog"; SET BkwtJCk0LODSnKnEj0 elementId="blog";` (executed on `/`). Pair with DR-15-17 for a project-wide elementId normalization pass.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-315 — NavLink Button instances in Footer all have `$control__iconName: "House"` even though icons are hidden (default config noise)

Status: Open
Category: Components
Severity: Low
Location: Footer component `Xx2RpZ5pV`, all 3 variants; all 11 NavLink Button instances (`G5jnDzJ5X`, `k6nWkh2MD`, `CWuFm6sDn`, `Mx6huuquG`, `KfZHu7unQ`, `yivQwwNqe`, `vLUOVqL3m`, `ln3RiOvtG`, `Er88iunVp`, `B85R3tJHZ`, `mmxv8gG3i`) and their Tablet/Phone replicas. Also affects Nav Bar's 5 NavLink Button instances (Home, Services, About Us, Blog, Contact).

Description:
Every NavLink Button instance in both the Footer and Nav Bar has `$control__iconName: "House"` (the default icon name from the component), even though `$control__iconVisible: "false"` (icons are hidden). For social-media links, the "House" icon is meaningless — the appropriate icon would be `Facebook` / `Instagram` / `Twitter` / `Linkedin` (or `X Logo`). For nav links (Home, Services, etc.), the "House" icon is also a poor choice for non-Home items. Since `iconVisible: false`, this is currently invisible to users, but it's configuration noise that would surface as wrong icons if someone toggled `iconVisible: true` for any reason.

Evidence:
`framer.agent.getDescendantsOfTypes({ id: "SM4CTALR7", types: ["ComponentInstanceNode"] })` returns all 11 instances with `iconName: "House"`. Nav Bar Default variant serialize (`bTXu1FqyY`) shows all 5 NavLink Button instances with `$control__iconName: "House"`.

Recommended Fix:
Either (a) set the appropriate icon per instance (e.g. `Facebook` for Facebook Link, `Instagram` for Instagram Link, `House` for Home Link, `Services`/`Briefcase` for Services, etc.) so the icons are correct if ever enabled, OR (b) clear the `iconName` attribute (set to `null` or empty string) since icons are intentionally hidden. Option (a) is preferred for future-proofing. Low priority.

Confidence: High
Discovered by: sub-agent 15, session DR

---

## DR-316 — `/404` page does not include a `BackButton` component (project ships one but it's not used on the error page)

Status: Open
Category: UX & conversion
Severity: Low
Location: `/404` (node `kfL3sfGQh`); no `BackButton` code component instance present.

Description:
The project ships a `BackButton.tsx` code component (`codeFile/tVVtI8x:default`) but it is not used on the /404 page. The /404 page only offers a single Primary Button "Return to Home" linking to `/#hero`. For a visitor who arrived at /404 by clicking a broken in-site link, a "Go Back" button (browser-back equivalent) would be more contextually useful than only "Return to Home" — it would let them return to whatever page they were on before hitting the 404. This is a minor UX polish item, not a defect.

Evidence:
`framer.agent.getDescendantsOfTypes({ id: "kfL3sfGQh", types: ["ComponentInstanceNode"] }, { pagePath: "/404" })` returns 3 instances (one per breakpoint), all of type `ARbK0E6gq` (Primary Button). No `codeFile/tVVtI8x:default` (BackButton) instance is present.

Recommended Fix:
Consider adding a `BackButton` instance next to the existing "Return to Home" Primary Button on the /404 page, giving visitors two clear options: "Go Back" (return to previous page) and "Return to Home" (start over). Low priority.

Confidence: Medium (design choice — depends on intended UX)
Discovered by: sub-agent 15, session DR

---

## DR-317 — Header "Book Today" CTA links to `/booking` which has no Header (consistent but creates a dead-end loop)

Status: Open
Category: UX & conversion
Severity: Medium
Location: Header component `AZd_vmoUt`, all 4 variants; Primary Button instance `OLDfgiQJq` (and replicas). Target: `/booking` page (node `kdx64iDUQ`, see DR-15-1).

Description:
The Header's Primary Button "Book Today" links to `/booking` — which is the page that has NO layout template (DR-15-1) and therefore NO Header. The flow is: visitor on any page → clicks "Book Today" in the header → lands on /booking → the header (including the "Book Today" button and the logo link) disappears. After booking (or abandoning booking), the visitor has no in-page way back to the site. This is a self-reinforcing dead-end: the very CTA that brings visitors to /booking is the same CTA that disappears once they arrive. For visitors who complete the booking flow, this is acceptable (they're done). For visitors who abandon the booking (a large percentage), they must use the browser back button to return — and if they arrived via an external link (email, ad), there's no clear exit.

Evidence:
Header Desktop variant: `OLDfgiQJq.attributes.$control__link = "/booking"`. Same on Desktop Open (`SndyLBcPWOLDfgiQJq`), Tablet (`WVwnpCf7jOLDfgiQJq` — note: hidden via parent `visible: false`), Phone (`zCwAoDfvLOLDfgiQJq` — also hidden). Target page `/booking` has `layoutTemplate: "null"` (see DR-15-1 evidence).

Recommended Fix:
This is a downstream consequence of DR-15-1. Fixing DR-15-1 (applying the default layout template to /booking) will resolve this issue automatically — the header will appear on /booking and visitors will have full nav + logo to exit. If /booking must remain template-less for focus, add at minimum a small "Back to site" / "Vetly home" link inside the booking modal's header frame (`IBjN212M7`) so visitors have an exit. Coordinate with sub-agent 10 (UX & conversion).

Confidence: High
Discovered by: sub-agent 15, session DR

---

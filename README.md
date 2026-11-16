# AID Website — Final Six-Page Structure

This is a no-build-tool static website for finalizing the content and page architecture before animation work. It does not require React, Vite, or npm packages.

## Six primary pages

1. `index.html` — Home: hero, company introduction, proposal-supplied stats, four verticals, upcoming project previews and CTA.
2. `company.html` — Company: story, draft vision/mission/values, leadership content slot, sustainability and locations.
3. `capabilities.html` — Capabilities: residential, commercial, industrial and infrastructure sections, fleet categories, proposal-listed equipment specifications and vertical-specific enquiry links.
4. `projects.html` — Projects: portfolio data state, search/filter UI, upcoming projects, and project brief states selected by query string.
5. `careers.html` — Careers: company/culture introduction, honest vacancy-empty state and expression-of-interest route.
6. `contact.html` — Contact: proposal-supplied address/phone/email and enquiry form UI.

Upcoming-project detail states are available at:
- `projects.html?project=mall-of-lubumbashi`
- `projects.html?project=university-campus`

These are detail states on the Projects page rather than additional primary navigation pages.

## Homepage scroll-driven construction journey

The homepage now includes an illustrative, scroll-driven building sequence immediately below the muted looping hero video. Scroll progress reveals site preparation, excavation, foundations, structural framing, floor slabs, core/services, façade, interior lighting, landscaping and a finished conceptual view.

This is a custom SVG illustration and a conceptual storytelling device—not a depiction of a specific AID project, a verified construction method, or evidence of project status. The animation is implemented in `site.js` and styled in `styles.css`; it adds no external runtime dependency. It respects the user's reduced-motion preference by showing the completed illustration without scroll-driven movement.

## Run and build

No dependency installation is required. Serve the folder with any static web server, for example:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

The production deliverable is the static HTML/CSS/JS itself. There is no compilation step, so a Vite build is not required.

## Verification performed

- Checked all six HTML pages for document structure, title, stylesheet/script references and navigation links.
- Checked local image references against the bundled `images/` directory.
- Checked JavaScript syntax with Node.
- Verified all local page, script, stylesheet and image references, plus required section anchors.
- A headless Chromium visual run was attempted, but this environment blocked navigation to local pages; browser-level visual verification is therefore still required in Antigravity or a local browser.
- This revision intentionally focuses on content/page structure; no new animation system is included. Animation work can start once the structure is accepted.

## Content approval still needed before public launch

The proposal (Advize, August 2026) provides a starting point, not evidence that every claim is current. AID should approve:

- Statistics: 40+ delivered projects, 140,000+ sqm developed, 215+ km roads built, 15+ years.
- Company founding story, milestones, final vision/mission wording.
- Leadership names, titles, biographies and portraits.
- Current fleet counts/models/specifications.
- Completed and ongoing project records: names, status, location, scope, scale, delivery dates and approved photos.
- Upcoming-project status, programme, official concept renders and enquiry routing for Mall of Lubumbashi (20,000 sqm) and University Campus (18,000 sqm).
- Sustainability, environmental and community claims.
- Current job vacancies and application/CV handling process.
- Contact details listed in the proposal: 5460 Route Likasi, Lubumbashi, Haut-Katanga; +243814243441; admin@aidrdc.com.
- Official brand hex values; orange/green are retained as the agreed visual direction but exact official codes are not confirmed.

## Honest functional limitations

- The contact form performs browser validation and shows a local status message only. It does not send or store submissions. Connect an AID-approved email/CRM endpoint and test delivery before launch.
- Career applications and CV uploads are not enabled because the official application recipient/process has not been supplied.
- The completed-project gallery is intentionally not populated with fake project records. The proposal cites 40+ delivered projects, but actual approved records are needed for the gallery and its filters.
- Architecture images on the upcoming project cards are illustrative references, not official renders of Mall of Lubumbashi or the University Campus.
- The map placeholder should be replaced with a verified office map pin.

## Running locally with npm (no external dependencies)
This is a static HTML/CSS/JavaScript website, not a Vite/React application. A small Node.js server is included so it can be started consistently from the project root:

1. Install Node.js LTS if `node` and `npm` are not available.
2. Open a terminal in the folder containing `package.json`.
3. Run `npm install` (there are no third-party packages to download).
4. Run `npm run dev`.
5. Open `http://localhost:4173`.

Use `Ctrl+C` to stop the server. The `npm run check` command checks the JavaScript syntax. This local server is for development preview, not production hosting.


## Client project imagery update (October 2026)

The website now includes optimized WebP previews derived from the eight project collections shared by AID:
- Golf Villa
- Guest House
- Hospital
- Mall of Lubumbashi
- Palais de Justice
- Residential Tower
- School (preview extracted from the supplied PDF)
- University

These visuals appear on the homepage, project explorer and relevant capability sections. The project explorer supports search and category filters, with project brief URLs for each collection.

**Important content guardrail:** the image packages alone do not establish project status, location, delivery date, scope, ownership or completion. Those details are marked for client confirmation. Mall of Lubumbashi (20,000 sqm) and University Campus (18,000 sqm) are described as proposed/upcoming only because the August 2026 proposal lists them that way. Confirm that the proposal remains current before public launch.

## Homepage hero video update (October 2026)

- The homepage hero now uses `videos/aid-hero.mp4`, generated from the user-supplied architectural video.
- The source was 1280 × 720, approximately 10 seconds, H.264 video with an AAC audio stream.
- The delivered MP4 was re-encoded for web playback with the audio stream removed. It is approximately 2.1 MB, 1280 × 720, 24 fps, H.264, and fast-start enabled.
- The video element uses `autoplay`, `muted`, `loop`, and `playsinline`. No music or audio is delivered.
- `images/aid-hero-poster.webp` is extracted from the video for the loading poster and reduced-motion fallback.
- The existing headline and CTA buttons remain HTML layered above the video. A dark gradient overlay preserves text contrast.
- The hero video is hidden when `prefers-reduced-motion: reduce` is active; the poster remains visible.
- Browser-level autoplay and visual checks should still be performed on desktop and mobile browsers before launch.

## Current implementation notes
- Six primary pages: Home, Company, Capabilities, Projects, Careers and Contact.
- Shared CSS and JavaScript; mobile navigation selector has been aligned with the script.
- Project visuals are optimized for web rather than embedding the original high-resolution source files.
- Forms are a front-end prototype only; they do not send or store submissions.
- Homepage hero uses the supplied muted looping MP4 with a poster fallback.
- Before production launch, confirm contact details, leadership, project status and descriptions, statistics, fleet quantities, careers process, privacy/legal copy, form endpoint and hosting.


## Scroll journey verification notes
- `node --check site.js` and `node --check server.js` passed after adding the scroll-driven sequence.
- The homepage SVG was parsed as XML successfully; CSS syntax parsing returned no top-level errors.
- Local HTTP smoke tests returned 200 for the homepage, `site.js`, `styles.css`, hero MP4 and poster image.
- Real-browser visual testing has not been performed in this environment. Please check scroll pinning, scene composition and mobile behavior in your browser.


## Restored scroll-driven construction journey

The homepage construction journey now uses the detailed camera-rig SVG from the earlier V60 implementation, with its original GSAP/ScrollTrigger-driven 10-stage sequence. It is placed directly below the muted looping hero video and occupies a long, full-viewport scroll section rather than a small illustration card. GSAP files are bundled locally under `vendor/`, so no CDN is required for the animation. The animation is conceptual and does not represent a specific completed AID project.


## Latest UI refinement (2026-10-19)
- Removed the changing `01 / 10` stage counter above the active stage headline.
- Removed the bottom row of ten stage markers.
- Removed the “SCROLL TO BUILD” prompt.
- Kept the active stage headline and explanatory copy, the conceptual-build caption, and the thin orange scroll-progress indicator.
- Repositioned the remaining bottom caption closer to the lower edge now that the stage rail is gone.
The elevator cab remains present during the core/services sequence and rises continuously from the ground-floor landing toward the upper landing across several scroll stages; scrolling backward reverses the lift movement.


## Restored cinematic lift sequence

The homepage construction journey now includes the original V60-style elevator ride as a full-scene overlay. It fades in around the core/services stage and moves the lift cabin from the lower landing toward the upper floors over approximately four scroll stages. The cabin, passing floor lines, counterweight, doors, and floor display are all tied to the same GSAP ScrollTrigger timeline, so scrolling upward reverses the motion. The homepage hero video remains muted and looping.


## Original V60 lift journey
The homepage keeps the current video hero and detailed 10-stage building animation, followed by the original V60 CompletionJourney lift visual system: full cabin, sliding doors, AID interior branding, floor indicator, shaft rails, pulley, cables, counterweight and floor cards. The lift rises from floor 01 to floor 05 over a long scroll-scrubbed section and reverses when scrolling upward.


### Homepage building-to-lift transition
The original V60-style lift composition is overlaid inside the pinned construction journey. The camera builds from site preparation to a completed structure, pushes into the building, reveals the lift ride across five floors during the middle scroll interval, then fades back to the construction scene as the camera pulls out and the remaining façade/interior/landscape stages continue. The lift is not a separate scroll section.


## Company Journey interaction polish (2026-10-28)
- Added keyboard navigation for the milestone selector using arrow keys, Home and End.
- Added visible keyboard-focus styling for milestone controls.
- Added a restrained orange progress line along the lower edge of the Company Journey panel to communicate the active milestone.
- Added explicit accessible labels to milestone buttons.
- Milestone dates and copy remain placeholders until AID provides approved history; do not publish the placeholder values as factual company milestones.
- JavaScript syntax, HTML parsing, CSS parsing and ZIP integrity checks passed. Headless Chromium visual capture was attempted but did not complete in this environment; browser visual review remains pending.

## Motion layers (final)

- `motion.css` / `motion.js` — page motion: headline word reveals, card/list/image reveals, scroll-linked parallax, count-ups, line art, backgrounds, hover polish.
- `motion-plus.css` / `motion-plus.js` — additive polish layer: scroll progress bar, four-column page-transition curtain, eyebrow rule draw, 3D card settle, CAD-style card hover (orange trace + crosshair), button fill / magnetic pull, section-label scramble, link prefetch.
- `building-journey.js` / `lift-journey.js` / `site.js` — home building + lift scroll journey and company milestones (untouched by the motion layers).
- `company-media.css` + `videos/aid-isometric-build.mp4`, `videos/aid-site-earthmoving.mp4` — the two company-page animation rows.

All motion respects `prefers-reduced-motion`. To remove the polish layer, delete `motion-plus.css`/`motion-plus.js` and the matching tags in each page's `<head>`.

# AID Website QA Checklist

## Preserved homepage
- [x] Existing AID homepage hero video retained (`videos/aid-hero.mp4`).
- [x] Hero video remains muted, autoplay, looping, and inline.
- [x] Existing six-page static website and navigation retained.
- [x] Existing detailed, 10-stage construction animation retained.
- [x] Removed the previously approximated elevator overlay from the construction sequence.

## Original V60 lift sequence
- [x] Lift visual markup and styling ported from `src/CompletionJourney.jsx` and `src/styles.css` in the supplied V60 ZIP.
- [x] Full elevator cabin, metallic sliding doors, AID interior branding, floor indicator, shaft rails, pulley, cables, and counterweight included.
- [x] Five floor labels and contextual floor cards included.
- [x] Scroll-scrubbed movement from floor 01 to floor 05, spanning about 4.5 viewport-heights of scroll.
- [x] Reverse scrolling drives the lift back down.
- [x] Direct pixel transforms used for cabin, floor-stack, counterweight, and door movement to avoid dependence on CSS typed-arithmetic support.
- [x] Responsive and reduced-motion styles included.

## Automated checks
- [x] `npm run check` passes for server, site, building journey, and lift journey scripts.
- [x] HTML parser check passes.
- [x] ZIP integrity check passes.
- [ ] Visual browser test could not be completed in this environment; verify framing and scroll behavior in a local browser before deployment.

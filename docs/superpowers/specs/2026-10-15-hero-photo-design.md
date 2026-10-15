# Hero photo redesign

The centered circular avatar read as a social-profile tempelan. Replace it with a split hero built around a portrait, semi-formal photo.

## Layout
- `lg` and up: two columns. Left: badge, headline, summary, CTAs, left-aligned. Right: portrait photo card.
- Below `lg`: stacked. Text first, then the photo card, max width ~320px.
- Company strip below the hero is unchanged.

## Photo card
- 4:5 aspect, 16px radius, hairline ring + float shadow (DESIGN.md elevation), `object-cover object-top`. ~400px wide on desktop.
- Source: `profile.photo` (`public/photo.jpg`). If it fails to load, show a dark card with large "CW" initials.

## Gradient
- The mesh gradient moves from the page center to behind the photo card, slightly larger than the card. Drift and pointer-follow stay.

## Status chip
- White pill overlapping the card's bottom-left corner: "● Clocked in · {experience[0].company}". Dot uses the existing `live-dot` pulse.

## Motion
- Existing entrance order kept (badge, headline words, summary, CTAs), then the photo card, then the chip, all with the existing `.intro` rise-and-unblur.
- Reduced motion: everything shows immediately (existing `.intro` rules already handle this).

## Out of scope
- 3D tilt or hover effects on the photo.

## Files
- `src/components/Hero.tsx` only; existing `.mesh` and `.intro` CSS is reused.

## Update: option C is live
The split layout above was built, then swapped for option C at the user's request:
- Centered hero again; the mesh gradient is back behind the headline.
- The portrait sits in a pill inside the headline: "I (photo) build the software…". The pill is sized in em (0.82em × 1.7em), cropped at 25% from the top, and tilts and grows slightly on hover.
- No photo yet: the pill shows the brand gradient.
- The "Clocked in" chip was dropped; there is no photo corner to anchor it to.
To go back to the split layout, rebuild it from the sections above.

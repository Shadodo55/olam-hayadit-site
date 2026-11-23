# Design notes

## Subject

A family hardware showroom in Talpiot. The visitors are professionals (designers,
carpenters) and homeowners planning a visit. The site's job is to **prepare a visit
to the showroom**: "you choose a handle by hand". Product photography carries the
visual weight; the brand colours give the site its energy.

## Current design: "official showroom" (petrol)

The store chose the petrol palette and asked for a more official, high-end
look. Direction: a precise, technical feel, like a dimensioned drawing of a
handle, with the products' own metal (brass) as the only warm accent.

- **Type:** IBM Plex Sans Hebrew for headings (300 for large titles, 500 for
  headings and the wordmark), Assistant for text. Plex only ships 300 and 500:
  never put `font-semibold`/`font-bold` on a heading (it would be faked).
- **Header:** a dark utility bar (open-now status, both phone numbers, links,
  language) that scrolls away, and a white main bar that stays at the top.
- **Hero:** full-width media; a dark petrol panel (slogan with a brass rule,
  light headline, brass primary button, address) overlaps its lower edge on
  desktop. The sign's services sit beside the panel. Text never sits on the
  video itself.
- **Categories:** picture tiles; with 5, 9, 13… categories the first is a
  large 2×2 tile ("bento"), otherwise equal tiles that fill whole rows.
- **Bands:** professionals on the brand colour (with the mobile number and
  WhatsApp), the measuring guide on a light band, inner page headers on a
  light band (`page-band`). The footer opens with an invitation to the
  showroom and the three ways to get in touch.
- **Sample images:** studio-style renders (metal shading, soft shadows) so the
  site can be judged before real photos exist.

## Themes (demo while the store chooses)

Three themes, switched with `<html data-theme>`; tokens in `src/app/globals.css`,
the list in `src/lib/theme.ts`. A floating picker ("ערכת צבעים") saves the choice
in localStorage; an inline `<head>` script applies it before the first paint.

| Token        | logo                    | petrol (default) | classic        |
| ------------ | ----------------------- | ---------------- | -------------- |
| paper        | `#FFFFFF`               | `#F5F5F2`        | `#F5F1EA`      |
| surface      | `#EAF5F4`               | `#E7ECEA`        | `#ECE6DC`      |
| ink          | `#121212`               | `#1A2224`        | `#1E1D1B`      |
| accent       | `#1AA39A` (sign)        | `#0E5E66`        | `#D8C49C`      |
| on-accent    | ink (6.0:1)             | white (7.5:1)    | ink            |
| accent-ink   | `#0A6B64` (small text)  | `#0E5E66`        | `#7A5A22`      |
| button       | `#0A6B64` + white       | `#0E5E66`        | ink + paper    |
| highlight    | `#C8102E` (sign ribbon) | `#B3462B`        | `#7A5A22`      |
| band         | `#0E1716`               | `#0D2B2F`        | `#1E1D1B`      |
| display font | Rubik 800 + shadow      | Rubik 700        | Frank Ruhl 500 |

Rules:

- `accent` is for colour **blocks** with `on-accent` text, borders and
  decoration. Small text in the brand colour uses `accent-ink`.
- The logo-theme wordmark (turquoise on white, 3.1:1) is always ≥ 20px and
  heavy, so it counts as large text.
- Every theme passes axe on the main page types (`tests/e2e/themes.spec.ts`).

**When the store chooses:** make that theme's values the `@theme` defaults,
delete the other blocks, and set `NEXT_PUBLIC_THEME_PICKER=off` (or remove the
picker, its head script and the theme test).

## Principles (unchanged)

- **One memorable thing:** the handle mark, a bar pull drawn as a hole-to-hole
  dimension. It appears in the wordmark, the measurement filter and the
  measuring guide, where it carries real information.
- No shadows on cards, no gradients, no glass effects. Fills are flat.
- Motion only responds to actions (menus, dialogs, hover), and is off with
  reduced motion.
- Content is aligned to the inline-start edge (right in Hebrew).
- Defaults we avoid on purpose: all-caps eyebrow labels, meta strings joined
  with `·`, `→` appended to links, monospace data labels.

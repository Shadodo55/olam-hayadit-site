# Design notes

## Subject

A family hardware showroom in Talpiot. The visitors are professionals (designers,
carpenters) and homeowners planning a visit. The site's job is to **prepare a visit
to the showroom**: "you choose a handle by hand". Product photography carries the
visual weight; the brand colours give the site its energy.

## Design refresh (based on the store's sign)

The first design (cream, brass, a serif) read as quiet but boring. The refresh
takes its cues from the store's own sign: heavy turquoise lettering with a black
shadow, a red ribbon ("איכות ושירות זה אנחנו!"), and a strip of services
separated by ticks. Reference sites (Buster + Punch, Armac Martin, Superfront)
were studied for structure only: big product imagery, the brand colour used as
large flat blocks, bold type, dark framing bands.

What changed:

- **Hero:** a full-height accent colour block (headline, slogan ribbon, CTAs,
  phone numbers) beside the media. On phones the block comes first. Text is
  never over the video.
- **Services strip** from the sign, on the dark band (CMS: siteSettings
  `services`; slogan in `slogan`).
- **Two audiences** as two panels: home owners on `surface`, professionals on
  the dark `band`.
- **Category tiles** with pictures (category image from the CMS, else the
  first product photo). Tiles always fill whole rows (see `tileSpan`).
- **Section titles** have a short accent bar (`section-title` utility; inner
  pages get the same bar above the h1).
- **Product cards:** rounded image, red "new" badge, bolder price.
- Sample images are on a neutral grey (`#EEEEEC`) so they suit every theme.

## Themes (demo while the store chooses)

Three themes, switched with `<html data-theme>`; tokens in `src/app/globals.css`,
the list in `src/lib/theme.ts`. A floating picker ("ערכת צבעים") saves the choice
in localStorage; an inline `<head>` script applies it before the first paint.

| Token        | logo (default)          | petrol        | classic        |
| ------------ | ----------------------- | ------------- | -------------- |
| paper        | `#FFFFFF`               | `#F5F5F2`     | `#F5F1EA`      |
| surface      | `#EAF5F4`               | `#E7ECEA`     | `#ECE6DC`      |
| ink          | `#121212`               | `#1A2224`     | `#1E1D1B`      |
| accent       | `#1AA39A` (sign)        | `#0E5E66`     | `#D8C49C`      |
| on-accent    | ink (6.0:1)             | white (7.5:1) | ink            |
| accent-ink   | `#0A6B64` (small text)  | `#0E5E66`     | `#7A5A22`      |
| button       | `#0A6B64` + white       | `#0E5E66`     | ink + paper    |
| highlight    | `#C8102E` (sign ribbon) | `#B3462B`     | `#7A5A22`      |
| band         | `#0E1716`               | `#0D2B2F`     | `#1E1D1B`      |
| display font | Rubik 800 + shadow      | Rubik 700     | Frank Ruhl 500 |

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

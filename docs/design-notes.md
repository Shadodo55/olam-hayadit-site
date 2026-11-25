# Design notes

## Subject

A family hardware showroom in Talpiot. The visitors are professionals (designers,
carpenters) and homeowners planning a visit. The site's job is to **prepare a visit
to the showroom**: "you choose a handle by hand". Product photography carries the
visual weight; the brand colours give the site its energy.

## Current design: "official showroom" (new logo colours)

The store asked for an official, high-end look (first in petrol, now in the
new logo's navy and teal). Direction: a precise, technical feel, like a
dimensioned drawing of a handle, with brass-gold as the one action colour.

- **Type:** Rubik for headings (a light 300 line and a heavy 700 line, like
  the logo's two lines; `title-strong`), Assistant for text. IBM Plex Sans
  Hebrew only in the (hidden) petrol theme: it ships 300 and 500, so no
  `font-semibold`/`font-bold` on its headings.
- **Header:** a dark utility bar (open-now status, both phone numbers, links,
  language) that scrolls away, and a white main bar that stays at the top.
- **Hero:** full-width media; a dark navy panel (slogan with a brass rule,
  light headline, brass primary button, address) overlaps its lower edge on
  desktop. The sign's services sit beside the panel. Text never sits on the
  video itself.
- **Categories:** one full-width row per top category, the picture on
  alternating sides, with its subcategories as chips and a "כל ה…" button
  (inspired by a friend's draft; no numbering, since categories aren't a
  sequence).
- **New logo (default theme "logo"):** navy #042040 and teal #02A6AC from the
  logo file; brass-gold #F0B03F is the one eye-catching action colour (always
  with navy text). Titles pair a light line with a heavy line, like the logo's
  two lines.
- **Bands:** professionals on the brand colour (with the mobile number and
  WhatsApp), the measuring guide on a light band, inner page headers on a
  light band (`page-band`). The footer opens with an invitation to the
  showroom and the three ways to get in touch.
- **Sample images:** studio-style renders (metal shading, soft shadows) so the
  site can be judged before real photos exist.

## Conversion and motion (owner: "more motion, so people come and call")

Patterns taken from premium product sites (not copied): a masked headline
reveal, a slow services band, sections that rise in as they enter, a
count-up for the one real number (20+ years), a self-drawing dimension line
in the measuring guide, a sticky call/WhatsApp/directions bar on phones.
Every action leads to a call, WhatsApp or the showroom. All motion is CSS
(scroll-driven where possible), respects reduced motion, and never hides
content when it doesn't run.

## Colours (the store chose the new logo)

Tokens live in `src/app/globals.css`; the default theme is `logo`. The other
two themes (`petrol`, `classic`) are still in the code but the picker is off,
so visitors always see `logo` (build with `NEXT_PUBLIC_THEME_PICKER=on` to
bring the picker and its axe tests back).

| Token        | logo (default)                   | petrol       | classic     |
| ------------ | -------------------------------- | ------------ | ----------- |
| paper        | `#FFFFFF`                        | `#FFFFFF`    | `#F5F1EA`   |
| surface      | `#EEF4F5`                        | `#F0F2F1`    | `#ECE6DC`   |
| ink          | `#0C1D33`                        | `#172426`    | `#1E1D1B`   |
| accent       | `#02A6AC` (logo teal)            | `#0E5E66`    | `#D8C49C`   |
| on-accent    | navy `#042040` (5.5:1)           | white        | ink         |
| accent-ink   | `#007279` (small teal text)      | `#0E5E66`    | `#7A5A22`   |
| button       | navy `#042040` + white           | `#0E5E66`    | ink + paper |
| highlight    | brass-gold `#F0B03F` + navy      | `#D4B98A`    | `#D8C49C`   |
| band         | navy `#042040`                   | `#0D2B2F`    | `#1E1D1B`   |
| display font | Rubik 300 + 700 (`title-strong`) | Plex 300/500 | Frank Ruhl  |

Rules:

- `accent` is for colour **blocks** with `on-accent` text, borders and
  decoration. Small text in the brand colour uses `accent-ink`.
- `highlight` (gold) is the one action colour: main buttons and the showroom
  tile, which links to the visit page. Badges ("חדש") and plain facts use
  teal or navy, so gold always means "click here".
- The wordmark's second line uses `wordmark-accent` (≥ 3:1, always large).

## Principles

- **One memorable thing:** the logo mark (LogoMark: frame, lock plate and a
  teal lever) and, in the content, the hole-to-hole dimension: in the
  measurement filter, the measuring guide and the in-place preview, where it
  carries real information.
- No shadows on cards, no gradients, no glass effects. Fills are flat.
- Motion: see "Conversion and motion" above. One hero entrance, gentle
  scroll reveals, the logo curtain between pages (~0.6 s); everything is off
  with reduced motion and never hides content.
- Phones: the call/WhatsApp/directions bar never covers the page's own main
  buttons (on the home page it appears after the hero).
- Content is aligned to the inline-start edge (right in Hebrew).
- Defaults we avoid on purpose: all-caps eyebrow labels, meta strings joined
  with `·`, `→` appended to links, monospace data labels.

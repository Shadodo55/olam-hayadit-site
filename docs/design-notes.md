# Design notes (site shell, phase 2)

## Subject

A family hardware showroom in Talpiot. The visitors are professionals (designers,
carpenters) and homeowners planning a visit. The site's job is to **prepare a visit
to the showroom**: "you choose a handle by hand". Product photography will carry
the visual weight (phases 4 and 6). The shell must stay quiet and precise.

## Tokens

| Name               | Hex                   | Role                                                    |
| ------------------ | --------------------- | ------------------------------------------------------- |
| paper              | `#F5F1EA`             | page background (brief: warm off-white)                 |
| surface            | `#ECE6DC`             | quiet fills, hover                                      |
| ink                | `#1E1D1B`             | text; graphite bands (utility bar, footer)              |
| ink-muted          | `#5C5852`             | secondary text (6.3:1)                                  |
| brass / brass-ink  | `#A27C3A` / `#7A5A22` | the one metal accent; brass-ink for small text          |
| patina             | `#5E8C6A`             | "open now" dot only (verdigris, the colour brass turns) |
| line / line-strong | `#D9D2C6` / `#8C857A` | dividers / UI borders (3:1)                             |

Type: Frank Ruhl Libre for display and the wordmark, Assistant for UI and text.

## Layout

```
[ graphite utility bar: open-now status ........ professionals  visit  English ]
[ ▭ wordmark   Handles ▾  Technical ▾  Bath  Kitchen storage  Decor   ⌕ Search  ♡ My list ]
                                  ...page...
[ graphite footer: brand | catalog | information | visit + grouped hours ]
[ legal links + business details ]
```

Content is aligned to the inline-start edge (right in Hebrew), not centred.

## Principles

- **One memorable thing:** the handle mark. A bar pull, drawn as a hole-to-hole
  dimension. It appears in the wordmark now, and later in the measurement filter
  and the product specs, where it carries real information.
- The graphite bands at the top and bottom frame the warm paper. There are no
  cards with shadows, no gradients and no glass effects. Fills are flat, and
  dividers are only drawn where they separate real groups.
- Motion only responds to actions: menus, the dialog and the banner.
- Defaults we avoid on purpose:
  - all-caps eyebrow labels
  - meta strings joined with `·`
  - `→` appended to links
  - numbered markers, except in the measuring guide, which really is a sequence
  - monospace data labels

## Review against the brief

The brief itself asks for warm off-white, charcoal and brass, which is close to a
common generated look (cream with a serif). We keep it because the client asked
for it. What separates us is the choice of subject-specific details over decoration:

- brass instead of terracotta
- a patina green only for the "open" state
- graphite framing bands
- the handle/dimension motif
- later, real product photography

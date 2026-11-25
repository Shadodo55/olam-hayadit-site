# CLAUDE.md — עולם הידית והפרזול (Olam HaYadit) catalog site

@AGENTS.md

Catalog website for a family-owned hardware store in Talpiot, Jerusalem. No online
checkout yet; the architecture must allow adding cart/checkout/shipping later.
Full approved plan (Hebrew): `docs/plan.md`.

## Working with the owner (important)

- The project owner is a beginner. Before each setup step, explain in 1–2 simple
  Hebrew sentences what and why. When they must act (log in, click), give numbered,
  exact Hebrew instructions and wait. Never ask them to edit config files.
- Summaries after each phase are in Hebrew, with the live link and what to check.
- Never invent business facts (address, hours, phones, brands, prices, warranty).
  Confirmed facts live in `src/lib/site/business.ts`; unknown values are `null` and
  render as a visible `[להשלמה]` placeholder.
- NOT confirmed yet: "10 years warranty on bath accessories" — do not publish.

## Stack

- Next.js 16 (App Router) + TypeScript strict + Tailwind CSS v4 (via `@tailwindcss/turbopack`).
  Next 16 has breaking changes: read `node_modules/next/dist/docs/` before using an API.
- **Rendering: static export** (`output: "export"`). The Workers free plan (10 ms CPU,
  3 MB bundle) can't reliably run Next SSR. No server components that need a request,
  no `cookies()`, Server Actions, rewrites/redirects/headers in next.config, or ISR.
  `cacheComponents` is intentionally OFF.
- Hosting: Cloudflare Workers + Static Assets (`wrangler.jsonc`). The Worker in
  `worker/` runs only for `/api/*`; all pages are static files.
- CMS: Sanity (project `gntr6ikv`, dataset `production`, **public**). Content
  updates trigger a rebuild via GitHub `repository_dispatch` (`content-deploy.yml`).

## Sanity / data rules

- Studio lives in `studio/` (own `package.json`, deployed to
  https://olam-hayadit.sanity.studio by `studio-deploy.yml` on changes to `studio/**`).
  All field titles/help are Hebrew; Hebrew inputs are wrapped with `RtlInput`.
- Schemas: `studio/schemaTypes/`. Bilingual fields use `localeString` /
  `localeText` / `localeBlocks` (`{ he, en }`), required ones use `requireHebrew`.
  Images use `altImage` (alt text required). Variants live INSIDE the product.
- Document IDs must never contain `.` (dotted IDs are private in a public dataset).
- The website reads Sanity only at build time via `sanityFetch()` in
  `src/lib/sanity/client.ts` (memoized per worker; a failed fetch fails the build).
- Next.js caches build-time fetches in `.next/cache/fetch-cache` FOREVER. The
  `prebuild` script deletes it so every build gets fresh content; never cache
  `.next/cache` in CI (that once made published edits not appear).
  UI components never query Sanity: they get domain types from
  `src/features/catalog/data.ts`, `src/lib/site/settings.ts`, etc.
- Mapping CMS → domain happens in one place per type (`mapProduct`, `mapSettings`,
  `buildCategoryTree`) and drops incomplete content (no Hebrew title, no price).
  CMS prices are shekels; the domain uses integer agorot (`src/commerce/money.ts`).
- Images: `toSiteImage()` + `next/image` with the custom loader
  `src/lib/sanity/image-loader.ts` (Sanity CDN, `auto=format` → AVIF/WebP).
- Sample content: `isSample: true`; seed with `npm run seed` (in `studio/`, after
  `node scripts/generate-sample-images.mjs`), remove with `npm run samples:remove`,
  delete unused uploads with `npm run assets:cleanup` (`-- --dry` to preview).
- i18n: Hebrew (RTL) at `/`, English (LTR) at `/en`. Two root layouts:
  `src/app/(he)/` and `src/app/(en)/en/`. Route files there stay thin and render
  shared components from `src/features/`. 404: `src/app/global-not-found.tsx`.
- Fonts via `next/font` (self-hosted): Rubik (display, default "logo" theme,
  variable: light line + heavy line titles via `title-strong`), IBM Plex Sans
  Hebrew ("petrol", 300/500 only) and Frank Ruhl Libre ("classic"), both not
  preloaded, Assistant (text).
- Logo: `components/brand/LogoMark.tsx` is the store's logo mark redrawn as
  SVG (navy frame/plate, teal lever); `Wordmark` puts the name on two lines
  like the logo file. Favicon/og: `public/icon.svg` +
  `node scripts/generate-brand-images.mjs`.
- Colour themes (design demo): `logo` (default: the new logo's navy #042040 +
  teal #02A6AC, brass-gold `highlight` for the main actions), `petrol`,
  `classic`, set with
  `<html data-theme>`; tokens in `globals.css`, list in `src/lib/theme.ts`. Use the
  semantic colour classes (`accent`, `on-accent`, `accent-ink`, `button`, `band`,
  `on-band`, `highlight`…), never raw hex. Every theme must pass axe
  (`tests/e2e/themes.spec.ts`). Picker off: `NEXT_PUBLIC_THEME_PICKER=off`.

## i18n rules (next-intl)

- UI strings: `src/messages/he.json` and `en.json`. Both must have the same keys
  (a type check in `src/lib/i18n/messages.ts` enforces it).
- Server components: `await getTranslations({ locale, namespace })`. **Always pass
  `locale`**: without it next-intl reads request headers, which breaks static export.
  Never import `NextIntlClientProvider` from a server file; use
  `src/lib/i18n/IntlProvider.tsx`.
- Client components: `useTranslations(ns)`. Only the namespaces listed in
  `clientMessagesFor()` ship to the browser; add a namespace there if a client
  component needs it.
- CMS-style bilingual data uses `Localized` + `localized()`: it falls back to Hebrew
  and reports `lang`, so render the fallback text with `lang="he"`.
- Every page has its own route folder in both trees (there is no catch-all
  "coming soon" route any more: with `output: export` a catch-all with no params
  fails the build). A new page: add it to `pagePaths` in `src/lib/routes.ts`,
  create both route folders, add it to `tests/e2e/pages.ts`. Links come from
  `pagePaths`, never hard-coded strings.
- Unknown business details render with `<Placeholder>` ([להשלמה]), never invented.

## Catalog

- Routes: `/catalog` (index), `/catalog/[...slug]` (category, incl. subcategories'
  products), `/product/[slug]` (variant in `?sku=`). Pages: `src/features/catalog/
CategoryPage.tsx`, `ProductPage.tsx`.
- Listing logic is pure and unit-tested in `listing.ts` (filters, sort, facets,
  URL format `?finish=gold&cc=128&price=20-100&stock=1&sort=price-asc`) and
  `variants.ts` (variant selection, WhatsApp text). UI only renders.
- Filters/variant pickers keep state in React and mirror it to the URL with
  `history.replaceState` (instant UI; reading the URL only on load). Components
  using `useSearchParams` sit in `<Suspense>` with a full static fallback (SEO).
- Which filters a category shows is set per category in the CMS (`filters`).
- In-place preview ("הדמיה במקום"): the CMS `scene` on a category (inherited
  by subcategories, overridable per product; list in `studio/lib/constants.ts`
  and `features/catalog/scene.ts`) picks a true-to-scale SVG scene in
  `ui/ProductScene.tsx` (kitchen, drawers, door, fridge, towel bar, hook,
  legs). It draws the chosen variant: finish swatch colour, hole spacing /
  length in mm. The gallery shows it as a second view; picking a size opens
  it. Animated shapes are large and scaled DOWN (scaling up blurs them).
- Sample products are labelled on cards and pages; e2e tests must not depend on
  specific sample slugs (they pick the first product from a category).

## Content pages

- Home (`features/home/HomePage.tsx`): full-width media with a solid dark panel
  overlapping its lower edge (phones: below it), never text over video. Slogan and services strip come
  from siteSettings (`slogan`, `services`, as on the store's sign). Media: CMS hero video (`HeroVideo`: muted, loop, poster, visible pause,
  no autoplay with reduced motion) → poster image → `DimensionDrawing` fallback.
- Home conversion & motion (owner asked for "more motion, like premium sites";
  the store has 20+ years, `siteSettings.yearsExperience`): live open-status pill,
  WhatsApp CTA, two-weight hero title (two sentences in the headline → the
  second is the heavy teal line), facts mosaic (years count-up, open days,
  opening time, showroom; all from siteSettings), services marquee (pausable button + hover/focus; static list with
  reduced motion), "how it works" steps, phone action bar (`MobileActionBar`,
  call/WhatsApp/Waze; a spacer keeps it off the footer), WhatsApp button in the
  desktop header.
- Motion lives in `globals.css` (end of file): `.rise`/`.mask-word` (hero
  entrance), `data-reveal="self|children"` (CSS scroll-driven, no JS),
  `.parallax`, `.draw`, `.count-up`, and the page transition curtain (`PageTransition.tsx`: the logo on
  navy, rises and lifts). Everything sits inside
  `prefers-reduced-motion: no-preference`, and nothing hides content without
  it. Never move the hero video's pause button (`mediaClassName` targets only
  the `<video>`). Playwright runs with reduced motion so axe judges the final
  look; `tests/e2e/motion.spec.ts` turns motion on and checks it ends visible.
- Content data and pages: `features/content/data.ts` + `features/content/pages.tsx`
  (visit, measuring guide, about via `CmsPage`, FAQ as `<details>`, brands,
  projects, PDF catalogs). CMS rich text renders with `components/content/RichText`.
- Google Maps (`MapEmbed`) loads only after "external content" consent or a click;
  CSP `frame-src` allows only https://www.google.com. Sanity's CDN is our own
  content host (no cookies) and is allowed without consent.
- Sample media: `node scripts/generate-sample-media.mjs`, then
  `npm run seed:content` in `studio/` (FAQ/about are created only if missing).

## Forms and legal pages

- `/contact` and `/professionals` (`features/forms/pages.tsx`): `InquiryForm`
  (client) posts JSON to `/api/inquiry` (`worker/inquiry.ts`). One validator for
  browser and Worker: `features/forms/inquiry.ts` (returns error codes; the words
  are in the `forms` messages). It imports with relative paths: the Worker
  bundles it too (no `@/` alias there).
- Worker checks, in order: same Origin, body ≤ 16 KB, honeypot `website`
  (silently accepted), configured, rate limit (binding, 3/min per IP), fields,
  Turnstile, then a D1 copy, then the Resend email. Without `RESEND_API_KEY`,
  `INQUIRY_TO_EMAIL` and `TURNSTILE_SECRET_KEY` (Wrangler secrets) it answers 503
  `not_configured` and stores nothing; the form then offers phone/WhatsApp.
- Turnstile loads only when a form field (input/select/textarea) first gets
  focus, never on page view (the
  consent test covers `/contact`). CSP allows `challenges.cloudflare.com` for
  script and frame. Site key: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (falls back to
  Cloudflare's always-pass test key).
- D1 `olam-hayadit-inquiries`, schema in `worker/migrations/`. Apply a new
  migration with `npx wrangler d1 migrations apply olam-hayadit-inquiries --remote`.
  A daily cron (`scheduled`) deletes copies older than 12 months.
- Legal pages (`/accessibility`, `/privacy`, `/terms`, `/cookies`):
  `features/legal/` (`content-he.tsx`, `content-en.tsx`). Privacy, terms and
  cookies are DRAFTS for a lawyer, marked on the page; the accessibility
  statement is published as is (it describes the site as built; keep it true).
  Every service that receives visitor data (Cloudflare, Resend, Sanity CDN,
  Google after consent) must be listed in the privacy text. Business facts are injected from siteSettings
  (missing → `<Placeholder>`); update `LEGAL_UPDATED` when the text changes.
  Shipping/returns drafts live in `docs/drafts/` and are not published.

## Search and "My list"

- `/search-index.json` is generated at build (`src/app/(he)/search-index.json/route.ts`,
  `features/search/search-index.ts`) and loaded lazily by `useSearchIndex()`.
  Search is MiniSearch in the browser (`features/search/search.ts`): Hebrew
  normalisation (final letters, niqqud, gershayim), prefix + light fuzzy, AND.
- "My list" (`/my-list`) stores only `{ sku, slug, qty }` in localStorage
  (`commerce/list.ts`, `features/my-list/list-store.ts`); names/prices always come
  from the current index, so they're never stale. Same LineItem shape for a cart later.
- No autofocus on page load (it skips the skip-link for keyboard users).
- Visible button text must be part of its accessible name (axe
  `label-content-name-mismatch`): add context with `sr-only` text, not `aria-label`.
- Design decisions and tokens: `docs/design-notes.md`.

## Hard rules

- **Personal data never goes to Sanity** (the dataset is public). Form inquiries:
  Worker → email via Resend to `INQUIRY_TO_EMAIL` (+ optional copy in Cloudflare D1,
  deleted after 12 months).
- Accessibility is a legal requirement (IS 5568 / WCAG 2.1 AA): semantic HTML,
  one h1 per page, visible focus, labels on every control, 4.5:1 text contrast,
  keyboard + screen reader support, `prefers-reduced-motion`. No overlay widgets.
  axe must report 0 violations. New pages must be added to `tests/e2e/pages.ts`.
- Layout uses **logical** properties only (`ms-/me-/ps-/pe-/start-/end-/text-start`),
  never left/right, so RTL/LTR flip correctly. Numbers/phones inside RTL text get `dir="ltr"`.
- No third-party requests (maps, analytics, embeds) before cookie consent. A test enforces it.
- Prices are integers in agorot, including VAT. Commerce logic lives in `src/commerce/`.
- Secrets only in env vars / GitHub secrets / Wrangler secrets. `.env*` is ignored
  except `.env.example`.
- Sanity free plan: 10k documents incl. assets. Keep variants and translations
  inside the product document; max 4 images per product.
- GitHub Actions minutes are limited (2,000/month): content rebuilds run build+deploy
  only; full CI runs on PRs and pushes to `main`.
- Design: bold brand colour blocks from the store's sign; no gradients,
  glassmorphism, shadows-on-cards, emoji or stock "happy people" photos. Tokens
  are in `src/app/globals.css` (`@theme`); notes in `docs/design-notes.md`.
- Site is `noindex` until launch: set `NEXT_PUBLIC_ALLOW_INDEXING=true` and make the
  Lighthouse SEO assertion an error at launch.

## Structure

```
src/app/(he)/…, src/app/(en)/en/…   thin route files, one tree per locale
src/features/<feature>/             UI + logic per feature (store-info, home, catalog…)
src/components/                     shared UI and layout
src/lib/                            i18n, seo, site config, (phase 3) sanity client
src/commerce/                       (phase 3+) money, VAT, variants, list/cart stores
worker/                             Cloudflare Worker for /api/*
tests/e2e/                          Playwright + axe (runs against the built `out/`)
```

Unit tests sit next to the code (`*.test.ts`).

## Commands

| Command            | What                                                |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | dev server at http://localhost:3000                 |
| `npm run build`    | static export to `out/`                             |
| `npm run preview`  | build + run locally with Wrangler (like production) |
| `npm run check`    | lint + format check + type-check + unit tests       |
| `npm run test:e2e` | Playwright + axe against `out/` (build first)       |
| `npm run deploy`   | deploy `out/` + Worker to Cloudflare                |

Generated files (sample images/media, screenshots) never go inside the project:
the project is in OneDrive, which struggles with many synced files. They live in
`~/olam-hayadit-files/` (`sample-content/images`, `sample-content/media`,
`screenshots/`; override with `OLAM_FILES_DIR`). Local Playwright output goes to
the temp folder.

Windows notes: in the owner's PowerShell, `.ps1` scripts are blocked; use
`npm.cmd`/`npx.cmd` there. Windows PowerShell 5.1 `Get-Content`/`Set-Content` break
Hebrew text: never use them to edit source files. Lighthouse can't launch Chrome
locally; it runs in CI. The project is inside OneDrive: if a build fails with
`EPERM ... unlink .next/...`, delete `.next` and build again.

## Git

- Feature branch per phase (`phase-N-…`), PR to `main`, merge after CI passes.
  Pushing to `main` deploys.
- Commit identity: `Shadodo55 <75091962+Shadodo55@users.noreply.github.com>`.
- npm `allowScripts` pins esbuild/workerd versions; after Dependabot bumps them,
  re-approve with `npm install-scripts approve <pkg>`.

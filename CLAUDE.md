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
- Fonts: Frank Ruhl Libre (display) + Assistant (text) via `next/font` (self-hosted).

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
- Pages that aren't built yet are served by the catch-all "coming soon" routes
  (`src/app/(he)/[...slug]`, `src/app/(en)/en/[...slug]`). When you build a page,
  create its own route folder in both trees and add its key to `builtPages` in
  `src/lib/routes.ts`. Links come from `pagePaths`, never hard-coded strings.
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
- Sample products are labelled on cards and pages; e2e tests must not depend on
  specific sample slugs (they pick the first product from a category).
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
- Design: premium/minimal; no gradients, glassmorphism, shadows-on-cards, emoji or
  stock "happy people" photos. Tokens are in `src/app/globals.css` (`@theme`).
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

Windows notes: in the owner's PowerShell, `.ps1` scripts are blocked; use
`npm.cmd`/`npx.cmd` there. Windows PowerShell 5.1 `Get-Content`/`Set-Content` break
Hebrew text: never use them to edit source files. Lighthouse can't launch Chrome
locally; it runs in CI.

## Git

- Feature branch per phase (`phase-N-…`), PR to `main`, merge after CI passes.
  Pushing to `main` deploys.
- Commit identity: `Shadodo55 <75091962+Shadodo55@users.noreply.github.com>`.
- npm `allowScripts` pins esbuild/workerd versions; after Dependabot bumps them,
  re-approve with `npm install-scripts approve <pkg>`.

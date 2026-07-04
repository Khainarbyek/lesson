# Uyren Media and SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Kazakh default routing, educational lesson images, and SEO metadata/sitemap support to Uyren.

**Architecture:** Keep the MVP static and repo-owned. Lesson metadata gains image fields, a small SEO helper centralizes canonical/alternate URL generation, and `BaseLayout.astro` emits shared SEO/social tags for localized pages.

**Tech Stack:** Astro 7, TypeScript, React islands, Vitest, Netlify static hosting, `@astrojs/sitemap`.

---

## File Structure

- Modify `src/lib/locales.ts`: make `kk` the default locale.
- Create `src/lib/seo.ts`: centralize site URL, social image path, canonical URL, and locale alternate generation.
- Modify `src/lib/content.ts`: add `image` metadata to every lesson in every locale.
- Modify `src/layouts/BaseLayout.astro`: emit canonical, `hreflang`, Open Graph, and Twitter tags.
- Modify `src/pages/index.astro`: root route will inherit the new Kazakh default.
- Modify `src/pages/[locale]/index.astro`: pass canonical path and alternates to `BaseLayout`.
- Modify `src/pages/[locale]/lessons/[lessonId].astro`: pass canonical path and alternates to `BaseLayout`; show coming-soon lesson image.
- Modify `src/components/LessonCard.astro`: render lesson images with stable mobile-first dimensions.
- Create `public/media/lessons/*.svg`: concrete educational image assets.
- Create `public/media/social/uyren-og.svg`: default social sharing image.
- Create `public/robots.txt`: allow crawling and point to sitemap.
- Modify `astro.config.mjs`: add site URL and sitemap integration.
- Modify `package.json` and `package-lock.json`: add `@astrojs/sitemap`.
- Modify tests in `src/tests/content.test.ts` and add `src/tests/seo.test.ts`.

## Task 1: Locale And SEO Helpers

**Files:**
- Modify: `src/lib/locales.ts`
- Create: `src/lib/seo.ts`
- Modify: `src/tests/content.test.ts`
- Create: `src/tests/seo.test.ts`

- [x] **Step 1: Write failing tests**

Add tests asserting:

```ts
expect(defaultLocale).toBe("kk");
expect(getCanonicalUrl("/kk/")).toBe("https://uyren.netlify.app/kk/");
expect(getLocalizedAlternates("/lessons/alphabet").map((item) => item.locale)).toEqual(["en", "ru", "kk"]);
```

- [x] **Step 2: Run tests and verify they fail**

Run: `npm test -- src/tests/content.test.ts src/tests/seo.test.ts`

Expected: failure because `defaultLocale` is still `en` and `src/lib/seo.ts` does not exist yet.

- [x] **Step 3: Implement locale and SEO helpers**

Set `defaultLocale` to `kk` and create `src/lib/seo.ts` with `siteUrl`, `defaultSocialImage`, `getCanonicalUrl()`, and `getLocalizedAlternates()`.

- [x] **Step 4: Run tests and verify they pass**

Run: `npm test -- src/tests/content.test.ts src/tests/seo.test.ts`

Expected: all selected tests pass.

## Task 2: Lesson Image Metadata And Assets

**Files:**
- Modify: `src/lib/content.ts`
- Modify: `src/tests/content.test.ts`
- Create: `public/media/lessons/alphabet.svg`
- Create: `public/media/lessons/animals.svg`
- Create: `public/media/lessons/math.svg`
- Create: `public/media/lessons/chess.svg`
- Create: `public/media/lessons/typing.svg`
- Create: `public/media/lessons/chemistry.svg`
- Create: `public/media/social/uyren-og.svg`

- [x] **Step 1: Write failing test**

Add a test that every lesson in every locale has an image `src` beginning with `/media/lessons/` and non-empty `alt`.

- [x] **Step 2: Run test and verify it fails**

Run: `npm test -- src/tests/content.test.ts`

Expected: failure because lessons do not have `image` metadata.

- [x] **Step 3: Add metadata and assets**

Add `image: { src, alt }` to `LessonBase` and each lesson. Create concrete SVG educational assets for the six lesson subjects and a social image.

- [x] **Step 4: Run test and verify it passes**

Run: `npm test -- src/tests/content.test.ts`

Expected: content tests pass.

## Task 3: Render Images And SEO Tags

**Files:**
- Modify: `src/components/LessonCard.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/[locale]/index.astro`
- Modify: `src/pages/[locale]/lessons/[lessonId].astro`

- [x] **Step 1: Update layout and page props**

Pass `canonicalPath` and localized alternates into `BaseLayout` for home and lesson pages.

- [x] **Step 2: Render SEO tags**

In `BaseLayout.astro`, emit canonical link, locale alternate links, Open Graph tags, and Twitter card tags.

- [x] **Step 3: Render lesson images**

Update `LessonCard.astro` to show `lesson.image.src` and `lesson.image.alt` with stable dimensions and lazy loading. Update coming-soon lesson pages to show the image.

- [x] **Step 4: Run checks**

Run: `npm run check`

Expected: Astro check passes with no errors.

## Task 4: Sitemap, Robots, And Final Verification

**Files:**
- Modify: `astro.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `public/robots.txt`

- [x] **Step 1: Install sitemap integration**

Run: `npm install @astrojs/sitemap`

Expected: dependency added to `package.json` and lockfile.

- [x] **Step 2: Configure Astro and robots**

Add `site: "https://uyren.netlify.app"` and `sitemap({ i18n: ... })` to `astro.config.mjs`. Add `public/robots.txt` pointing to `https://uyren.netlify.app/sitemap-index.xml`.

- [x] **Step 3: Run full verification**

Run:

```bash
npm run check
npm test
npm run build
git diff --check
```

Expected: all commands exit 0, build emits sitemap files, and the diff has no whitespace errors.

- [x] **Step 4: Browser verification**

Preview the built site and inspect `/kk/`, `/en/`, and `/ru/` at mobile, tablet, and desktop widths. Confirm no horizontal overflow, images render, and SEO tags exist in built HTML.

- [x] **Step 5: Commit**

Commit with:

```bash
git add .
git commit -m "Add Uyren media and SEO foundation"
```

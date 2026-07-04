# Uyren Media and SEO Design

Date: 2026-07-04

## Goal

Improve Uyren's first public impression by adding real/simple educational imagery, making Kazakh the default language, and preparing the site for search engines and social sharing.

This is a small platform-quality slice. It should make the current MVP feel more complete without introducing a CMS, accounts, paid services, or a large content pipeline.

## Decisions

- Kazakh is the default language. The root route should guide visitors to `/kk/`.
- MVP media is stored in the repository under `public/media/`.
- Lesson cards should show concrete educational images instead of only text icons.
- SEO metadata should be generated from structured page props, not duplicated manually in every page.
- The deployed site URL is `https://uyren.netlify.app` until a custom domain exists.
- The first SEO pass should include canonical URLs, language alternates, Open Graph tags, a Twitter card, `robots.txt`, and a sitemap.

## Media Strategy

Use real/simple educational images for now:

- Alphabet: a letter-learning visual.
- Animals: a clear animal-learning visual.
- Math: simple numbers or counting objects.
- Chess: a chess piece or board.
- Typing: a keyboard/computer visual.
- Chemistry: safe school science objects such as beakers or molecules.

Store these in:

```text
public/media/lessons/<lesson-id>.<format>
public/media/social/uyren-og.<format>
```

Use optimized `.webp` files where practical. SVG can be used for simple generated educational placeholders, but the design direction is concrete learning images, not abstract decoration.

The repo-based approach is intentional for the MVP: it is free, simple, deploys with Netlify, and avoids adding a media service before Uyren has enough content to need one. When the media library grows, revisit Cloudinary, ImageKit, Supabase Storage, or another CDN-backed media service.

## SEO Strategy

Astro's static output is a strong fit for SEO because localized pages are emitted as HTML at build time. This slice should add the missing metadata layer:

- `title`
- `description`
- `canonicalUrl`
- `alternateLocales`
- `og:title`
- `og:description`
- `og:type`
- `og:url`
- `og:image`
- `twitter:card`

The layout should accept enough route/page information to generate these tags consistently. Home pages and lesson pages should both get localized canonical URLs and `hreflang` alternatives for `kk`, `en`, and `ru`.

Add `robots.txt` in `public/` and generate sitemap files during `astro build` with the official Astro sitemap integration configured for `https://uyren.netlify.app`.

## User Experience

The homepage should stay mobile-first:

- Lesson images must not cause horizontal overflow.
- Cards should remain easy to scan on phones.
- Images should have useful `alt` text for parents, teachers, assistive technology, and search engines.
- Existing language, age, and lesson flows should remain intact.

The visual tone should feel concrete and educational: simple, bright, and trustworthy. Avoid dark, abstract, or purely decorative stock-style visuals.

## Technical Shape

Extend lesson metadata with an image object:

```ts
image: {
  src: string;
  alt: string;
}
```

Update `LessonCard.astro` to render the image with stable dimensions and lazy loading. Keep the existing icon/accent system as a fallback or supporting label if an image is missing.

Extend `BaseLayout.astro` props to accept canonical path and optional social image data. Centralize metadata generation there so future pages do not repeat SEO tags.

Update `astro.config.mjs`:

- Add `site: "https://uyren.netlify.app"`.
- Add `@astrojs/sitemap`.
- Configure sitemap i18n for `kk`, `en`, and `ru`.

## Testing

Add or update tests to cover:

- `defaultLocale` is `kk`.
- Every lesson in every locale has an image source and alt text.
- Home copy and lesson metadata remain available for all locales.
- SEO helpers or layout data produce locale alternates where practical.

Run:

- `npm run check`
- `npm test`
- `npm run build`
- `git diff --check`

Also inspect the built or previewed homepage at mobile, tablet, and desktop sizes before calling the visual pass complete.

## Out Of Scope

- CMS.
- Admin uploads.
- User-generated media.
- Audio narration.
- Video lessons.
- Paid image CDN setup.
- Custom domain migration.

## Success Criteria

- Visiting `/` starts from the Kazakh experience.
- Lesson cards use educational imagery and still look good on mobile.
- The site exposes canonical, language alternate, Open Graph, Twitter, robots, and sitemap signals.
- The changes stay compatible with Netlify free hosting and the current `dev` to `main` deployment flow.
- CI remains green on `dev`.

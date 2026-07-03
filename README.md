# BrightLearn MVP

BrightLearn is a free children learning website MVP for English, Russian, and Kazakh learners. It starts with a broad lesson catalog and two playable activities for young children: Alphabet and Animals.

## Features

- Trilingual routes: `/en/`, `/ru/`, and `/kk/`.
- Age guidance for `3-5`, `6-8`, and `9+`.
- Lesson catalog for Alphabet, Animals, Math, Chess, Typing, and Chemistry.
- Playable Alphabet and Animals activities.
- Browser-only progress with `localStorage`.
- Static Astro build for simple free hosting.
- GitHub Actions CI.
- Netlify deploy configuration.

## Tech Stack

- Astro
- TypeScript
- React islands
- Tailwind CSS 4
- Vitest and Testing Library
- Netlify for hosting

## Local Development

Use Node `>=22.12.0`.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run check
npm test
npm run build
```

## Project Structure

- `src/lib/content.ts` contains localized homepage, lesson, and activity data.
- `src/components/` contains reusable UI and lesson components.
- `src/pages/[locale]/index.astro` renders each localized homepage.
- `src/pages/[locale]/lessons/[lessonId].astro` renders each localized lesson page.

## Free Hosting With Netlify

1. Push this repository to GitHub.
2. Open Netlify.
3. Choose **Add new project**.
4. Choose **Import an existing project**.
5. Connect GitHub and select this repository.
6. Use build command `npm run build`.
7. Use publish directory `dist`.
8. Deploy the `main` branch.

After this, every push to `main` will trigger a new Netlify deploy.

## CI/CD

GitHub Actions runs on pushes to `main` and on pull requests:

- `npm ci`
- `npm run check`
- `npm test`
- `npm run build`

Netlify handles production deploys from GitHub. If you later want GitHub Actions to deploy directly, add Netlify secrets and a deploy job:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`


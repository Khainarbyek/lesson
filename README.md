# Uyren MVP

Uyren is a free children learning website MVP for English, Russian, and Kazakh learners. It starts with a broad lesson catalog and playable activities for young children across Alphabet, Animals, and Math.

## Features

- Trilingual routes: `/en/`, `/ru/`, and `/kk/`.
- Age guidance for `3-5`, `6-8`, and `9+`.
- Lesson catalog for Alphabet, Animals, Math, Chess, Typing, and Chemistry.
- Playable Alphabet, Animals, number, and arithmetic activities.
- Browser-only progress with `localStorage`.
- Firebase Analytics support for production visit tracking.
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
nvm install
nvm use
npm install
npm run dev
```

If your terminal still shows an Astro Node version error, check the active version:

```bash
node -v
```

It should be `v22.12.0` or newer. This project includes `.nvmrc`, so `nvm use` should switch to a supported Node 22 version.

Useful checks:

```bash
npm run check
npm test
npm run build
```

## Firebase Analytics

Firebase Analytics is optional. The app initializes it only when all required public Firebase web config values are present.

1. Create or open a Firebase project.
2. Add a Web app in Firebase project settings.
3. Enable Analytics for the project and copy the Firebase config values.
4. Set these environment variables in production:

```bash
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_FIREBASE_MEASUREMENT_ID=
```

For local testing, copy `.env.example` to `.env` and fill the same values. Visits appear in Firebase Analytics after the site is deployed and receiving traffic.

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

After this, every push to `main` will trigger a new Netlify deploy. Development work should happen on `dev`; Netlify builds are ignored for non-`main` branches by `netlify.toml`.

## CI/CD

GitHub Actions runs on pushes to `main`, pushes to `dev`, and on pull requests:

- `npm ci`
- `npm run check`
- `npm test`
- `npm run build`

Netlify handles production deploys from GitHub. If you later want GitHub Actions to deploy directly, add Netlify secrets and a deploy job:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

For Netlify dashboard settings, keep `main` as the production branch and disable branch deploys/deploy previews unless you intentionally want preview URLs.

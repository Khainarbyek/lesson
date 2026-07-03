# Children Learning MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the first public MVP of the trilingual children learning website.

**Architecture:** Use Astro for static routes and content-heavy pages, with React islands for interactive lesson activities. Keep content in typed local data files so the MVP deploys as a static site and can later grow into backend-managed content without changing the public route shape.

**Tech Stack:** Astro, TypeScript, React, Tailwind CSS, Vitest, Testing Library, GitHub Actions, Netlify.

---

## File Structure

- `package.json` - npm scripts and dependencies.
- `astro.config.mjs` - Astro config with React integration and the Tailwind 4 Vite plugin.
- `tsconfig.json` - TypeScript config.
- `netlify.toml` - Netlify build and publish configuration.
- `.github/workflows/ci.yml` - CI workflow for install, checks, tests, and build.
- `README.md` - project overview, local commands, and free hosting guide.
- `src/styles/global.css` - base visual system.
- `src/layouts/BaseLayout.astro` - shared HTML shell.
- `src/lib/locales.ts` - locale definitions and route helpers.
- `src/lib/content.ts` - localized copy, lesson metadata, and activity data.
- `src/lib/progress.ts` - browser-only local progress helpers.
- `src/components/LanguageSwitcher.astro` - top navigation language control.
- `src/components/AgeFilter.astro` - age range cards.
- `src/components/LessonCard.astro` - lesson catalog card.
- `src/components/LessonActivity.tsx` - reusable React activity island.
- `src/pages/index.astro` - redirect/entry page to `/en/`.
- `src/pages/[locale]/index.astro` - localized homepage.
- `src/pages/[locale]/lessons/[lessonId].astro` - localized lesson page.
- `src/tests/content.test.ts` - content and localization tests.
- `src/tests/progress.test.ts` - local progress tests.
- `src/tests/LessonActivity.test.tsx` - interactive lesson tests.

## Task 1: Project Scaffold And Tooling

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `src/styles/global.css`

- [ ] **Step 1: Install the framework dependencies**

Run:

```bash
npm install astro @astrojs/react react react-dom tailwindcss @tailwindcss/vite
npm install --save-dev @astrojs/check typescript vitest jsdom @testing-library/react @testing-library/jest-dom @types/react @types/react-dom
```

Expected: `package.json` and `package-lock.json` are created or updated, and npm exits successfully.

- [ ] **Step 2: Add npm scripts and package metadata**

Create `package.json` with scripts matching this shape:

```json
{
  "name": "children-learning-mvp",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Keep dependency versions from npm install instead of hardcoding stale versions.

- [ ] **Step 3: Configure Astro, TypeScript, and Tailwind 4**

Create `astro.config.mjs`:

```js
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [react()],
  output: "static",
  vite: {
    plugins: [tailwindcss()]
  }
});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

Create `src/env.d.ts`:

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 4: Add the global visual foundation**

Create `src/styles/global.css` with `@import "tailwindcss";`, Tailwind 4 `@theme` tokens, body styles, responsive card utilities, focus rings, and reduced-motion support. Use a bright but balanced palette with sky, berry, leaf, and sun accents instead of a one-color theme.

- [ ] **Step 5: Verify scaffold**

Run:

```bash
npm run check
```

Expected: `astro check` runs. If it fails because no pages exist yet, continue to Task 3 and rerun after pages are created.

- [ ] **Step 6: Commit scaffold**

Run:

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/env.d.ts src/styles/global.css docs/superpowers/plans/2026-07-03-children-learning-mvp.md
git commit -m "chore: scaffold Astro learning site"
```

## Task 2: Typed Localized Content And Progress Helpers

**Files:**
- Create: `src/lib/locales.ts`
- Create: `src/lib/content.ts`
- Create: `src/lib/progress.ts`
- Create: `src/tests/content.test.ts`
- Create: `src/tests/progress.test.ts`

- [ ] **Step 1: Write failing content tests**

Create `src/tests/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getHomeCopy, getLessonById, getLessons, locales } from "../lib/content";

describe("localized content", () => {
  it("supports English, Russian, and Kazakh", () => {
    expect(locales.map((locale) => locale.code)).toEqual(["en", "ru", "kk"]);
  });

  it("returns homepage copy for each locale", () => {
    expect(getHomeCopy("en").heroTitle).toContain("Learn");
    expect(getHomeCopy("ru").heroTitle).toContain("Учись");
    expect(getHomeCopy("kk").heroTitle).toContain("Үйрен");
  });

  it("marks Alphabet and Animals as playable", () => {
    const playable = getLessons("en").filter((lesson) => lesson.status === "playable");
    expect(playable.map((lesson) => lesson.id)).toEqual(["alphabet", "animals"]);
  });

  it("returns localized lesson detail", () => {
    expect(getLessonById("kk", "animals")?.title).toContain("Жануар");
  });
});
```

Run:

```bash
npm test -- src/tests/content.test.ts
```

Expected: FAIL because `src/lib/content.ts` does not exist.

- [ ] **Step 2: Implement locale and content data**

Create `src/lib/locales.ts` with:

```ts
export const localeCodes = ["en", "ru", "kk"] as const;
export type LocaleCode = (typeof localeCodes)[number];

export const defaultLocale: LocaleCode = "en";

export const localeLabels: Record<LocaleCode, string> = {
  en: "English",
  ru: "Русский",
  kk: "Қазақша"
};

export function isLocaleCode(value: string | undefined): value is LocaleCode {
  return localeCodes.includes(value as LocaleCode);
}

export function localizedPath(locale: LocaleCode, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalizedPath === "/" ? "/" : normalizedPath}`;
}
```

Create `src/lib/content.ts` with typed homepage copy, age ranges, lesson metadata for Alphabet, Animals, Math, Chess, Typing, and Chemistry, and activity data for Alphabet and Animals in `en`, `ru`, and `kk`.

- [ ] **Step 3: Write failing progress tests**

Create `src/tests/progress.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { getLessonProgress, saveLessonProgress } from "../lib/progress";

describe("lesson progress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns zero progress by default", () => {
    expect(getLessonProgress("alphabet")).toEqual({ correct: 0, attempts: 0 });
  });

  it("saves progress per lesson", () => {
    saveLessonProgress("animals", { correct: 2, attempts: 3 });
    expect(getLessonProgress("animals")).toEqual({ correct: 2, attempts: 3 });
  });
});
```

Run:

```bash
npm test -- src/tests/progress.test.ts --environment jsdom
```

Expected: FAIL because `src/lib/progress.ts` does not exist.

- [ ] **Step 4: Implement local progress helpers**

Create `src/lib/progress.ts` with:

```ts
export type LessonProgress = {
  correct: number;
  attempts: number;
};

const prefix = "children-learning-progress";

function keyForLesson(lessonId: string) {
  return `${prefix}:${lessonId}`;
}

export function getLessonProgress(lessonId: string): LessonProgress {
  if (typeof localStorage === "undefined") {
    return { correct: 0, attempts: 0 };
  }

  const raw = localStorage.getItem(keyForLesson(lessonId));
  if (!raw) {
    return { correct: 0, attempts: 0 };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LessonProgress>;
    return {
      correct: Number(parsed.correct ?? 0),
      attempts: Number(parsed.attempts ?? 0)
    };
  } catch {
    return { correct: 0, attempts: 0 };
  }
}

export function saveLessonProgress(lessonId: string, progress: LessonProgress) {
  localStorage.setItem(keyForLesson(lessonId), JSON.stringify(progress));
}
```

- [ ] **Step 5: Verify content and progress**

Run:

```bash
npm test -- src/tests/content.test.ts src/tests/progress.test.ts --environment jsdom
```

Expected: PASS.

- [ ] **Step 6: Commit data layer**

Run:

```bash
git add src/lib src/tests/content.test.ts src/tests/progress.test.ts
git commit -m "feat: add localized lesson data"
```

## Task 3: Static Homepage And Catalog

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/LanguageSwitcher.astro`
- Create: `src/components/AgeFilter.astro`
- Create: `src/components/LessonCard.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/[locale]/index.astro`

- [ ] **Step 1: Create shared layout and presentational components**

Create a `BaseLayout.astro` that imports `src/styles/global.css`, sets the `lang` attribute from props, and renders a responsive page shell.

Create `LanguageSwitcher.astro` that links to `/en/`, `/ru/`, and `/kk/` while preserving the current path when possible.

Create `AgeFilter.astro` with age cards for `3-5`, `6-8`, and `9+`.

Create `LessonCard.astro` with `playable` and `coming-soon` visual states.

- [ ] **Step 2: Create localized routes**

Create `src/pages/index.astro` as a static redirect entry to `/en/`.

Create `src/pages/[locale]/index.astro` using `getStaticPaths()` for all locales. Render the localized homepage copy, age cards, and lesson cards from `getLessons(locale)`.

- [ ] **Step 3: Verify localized homepage build**

Run:

```bash
npm run build
```

Expected: PASS and generated routes include `/en/`, `/ru/`, and `/kk/`.

- [ ] **Step 4: Commit homepage**

Run:

```bash
git add src/layouts src/components src/pages
git commit -m "feat: add trilingual homepage"
```

## Task 4: Interactive Alphabet And Animals Lessons

**Files:**
- Create: `src/components/LessonActivity.tsx`
- Create: `src/tests/LessonActivity.test.tsx`

- [ ] **Step 1: Write failing interaction tests**

Create `src/tests/LessonActivity.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonActivity } from "../components/LessonActivity";
import { getLessonById } from "../lib/content";

describe("LessonActivity", () => {
  it("shows success feedback for a correct answer", () => {
    const lesson = getLessonById("en", "alphabet");
    if (!lesson || lesson.status !== "playable") throw new Error("Missing alphabet lesson");

    render(<LessonActivity lesson={lesson} />);
    fireEvent.click(screen.getByRole("button", { name: /A/i }));

    expect(screen.getByText(/Great job/i)).toBeInTheDocument();
  });

  it("shows try-again feedback for an incorrect answer", () => {
    const lesson = getLessonById("en", "animals");
    if (!lesson || lesson.status !== "playable") throw new Error("Missing animals lesson");

    render(<LessonActivity lesson={lesson} />);
    fireEvent.click(screen.getByRole("button", { name: /Dog/i }));

    expect(screen.getByText(/Try again/i)).toBeInTheDocument();
  });
});
```

Run:

```bash
npm test -- src/tests/LessonActivity.test.tsx --environment jsdom
```

Expected: FAIL because `LessonActivity.tsx` does not exist.

- [ ] **Step 2: Implement reusable React lesson island**

Create `LessonActivity.tsx` with:

- Props: `{ lesson: PlayableLesson }`.
- One prompt visible at a time.
- Large answer buttons.
- Immediate correct/incorrect feedback from localized copy.
- Progress updates through `getLessonProgress` and `saveLessonProgress`.
- A "next" button after correct answers.

- [ ] **Step 3: Verify interaction tests**

Run:

```bash
npm test -- src/tests/LessonActivity.test.tsx --environment jsdom
```

Expected: PASS.

- [ ] **Step 4: Commit activity island**

Run:

```bash
git add src/components/LessonActivity.tsx src/tests/LessonActivity.test.tsx
git commit -m "feat: add playable lesson activity"
```

## Task 5: Lesson Detail Routes

**Files:**
- Create: `src/pages/[locale]/lessons/[lessonId].astro`

- [ ] **Step 1: Create static lesson pages**

Create a localized dynamic route with `getStaticPaths()` for every locale and every lesson id.

For playable lessons, render:

```astro
<LessonActivity client:load lesson={lesson} />
```

For coming-soon lessons, render a friendly page that explains the subject is visible in the catalog and will receive activities as the platform grows.

- [ ] **Step 2: Verify all lesson pages build**

Run:

```bash
npm run build
```

Expected: PASS with generated localized lesson pages for all six subjects in all three languages.

- [ ] **Step 3: Commit lesson routes**

Run:

```bash
git add src/pages/[locale]/lessons/[lessonId].astro
git commit -m "feat: add localized lesson pages"
```

## Task 6: CI, Netlify, And Hosting Guide

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `netlify.toml`
- Create or modify: `README.md`

- [ ] **Step 1: Add GitHub Actions CI**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Check
        run: npm run check

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

- [ ] **Step 2: Add Netlify config**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/"
  to = "/en/"
  status = 302
```

- [ ] **Step 3: Add README guide**

Create `README.md` with:

- Project purpose.
- Local setup commands.
- MVP feature list.
- GitHub remote push note.
- Netlify free hosting steps:
  1. Open Netlify.
  2. Add new project from GitHub.
  3. Select this repository.
  4. Build command: `npm run build`.
  5. Publish directory: `dist`.
  6. Deploy production branch.

- [ ] **Step 4: Verify CI-equivalent commands locally**

Run:

```bash
npm ci
npm run check
npm test
npm run build
```

Expected: all commands pass.

- [ ] **Step 5: Commit CI and hosting files**

Run:

```bash
git add .github/workflows/ci.yml netlify.toml README.md
git commit -m "chore: add CI and Netlify deployment docs"
```

## Task 7: Final Review And Push Preparation

**Files:**
- Modify only if verification reveals concrete issues.

- [ ] **Step 1: Inspect worktree**

Run:

```bash
git status --short
```

Expected: no unstaged changes, or only intentional files to commit.

- [ ] **Step 2: Final build verification**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Summarize remote push command**

If the user already configured a remote, run:

```bash
git remote -v
```

Then tell the user to push:

```bash
git push origin main
```

Run the push only if the user asks Codex to push or if credentials are already configured and the user explicitly wants it.

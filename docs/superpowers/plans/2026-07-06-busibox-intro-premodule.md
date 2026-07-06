# Busibox Intro Pre-Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Start Here" Busibox intro pre-module with a single video that appears first and does not count toward course completion.

**Architecture:** Add an `isIntro` flag to the `Module` type and a shared `countsTowardCompletion()` helper. Prepend one intro module (one video-only lesson) to the `MODULES` source-of-truth array. Route every completion-denominator site through the helper (fixing a pre-existing dashboard bug), and add a "Start Here" UI pill. The video attaches later via the existing Admin → Videos flow — no new video code.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Vitest.

## Global Constraints

- Modules are defined only in `lib/module-data.ts` (`MODULES` array) — the single source of truth. No DB writes.
- Module list order = array order in `MODULES` (nothing sorts by `.order`). To appear first, the intro module must be the first array element.
- `Module.instructor` must be one of `'Peter' | 'Bobby' | 'Wes'` (union type in `lib/types.ts`).
- The intro module lesson must have **no** `activityType`, `activityId`, or `quizId` (pure watch page), matching the `mod-bonus-lunch-learn` lesson.
- Video is attached via Admin → Videos (`training-videos` data-api, keyed by `moduleId`+`lessonId`). Do **not** hardcode a URL or use the unused `Module.videoUrl` field.
- Tag copy: intro pill reads exactly `Start Here · doesn't count toward completion` (mirroring the existing bonus pill's phrasing).
- Test runner: `npm test` (`vitest run`). Type gate for page edits: `npx tsc --noEmit`.

---

### Task 1: Add `isIntro` flag and `countsTowardCompletion` helper

**Files:**
- Modify: `lib/types.ts:86` (add `isIntro` to `Module`)
- Modify: `lib/module-data.ts` (add helper near other exports)
- Test: `lib/module-data.test.ts` (create)

**Interfaces:**
- Produces: `Module.isIntro?: boolean`; `countsTowardCompletion(m: Pick<Module, 'isBonus' | 'isIntro'>): boolean` exported from `lib/module-data.ts`.

- [ ] **Step 1: Write the failing test**

Create `lib/module-data.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { countsTowardCompletion } from './module-data';

describe('countsTowardCompletion', () => {
  it('counts a normal module', () => {
    expect(countsTowardCompletion({})).toBe(true);
  });

  it('excludes bonus modules', () => {
    expect(countsTowardCompletion({ isBonus: true })).toBe(false);
  });

  it('excludes intro modules', () => {
    expect(countsTowardCompletion({ isIntro: true })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/module-data.test.ts`
Expected: FAIL — `countsTowardCompletion` is not exported (import error / undefined).

- [ ] **Step 3: Add the `isIntro` field to the `Module` type**

In `lib/types.ts`, after the `isBonus?: boolean;` line (currently line 86), add:

```ts
  /**
   * Intro (pre-module) modules appear first with a "Start Here" tag and do
   * NOT count toward the certificate's completion threshold, badges, or the
   * dashboard/profile progress percentages. Like bonus modules, they stay
   * outside the main progression.
   */
  isIntro?: boolean;
```

- [ ] **Step 4: Add the helper**

In `lib/module-data.ts`, in the "Helper Functions" section (near `getModule`, around line 1372), add:

```ts
/**
 * Whether a module counts toward course completion. Intro (pre-module) and
 * bonus modules are excluded from the certificate threshold, badges, and the
 * dashboard/profile progress percentages.
 */
export const countsTowardCompletion = (
  m: Pick<Module, 'isBonus' | 'isIntro'>,
): boolean => !m.isBonus && !m.isIntro;
```

`Module` is already imported at the top of `lib/module-data.ts`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- lib/module-data.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/module-data.ts lib/module-data.test.ts
git commit -m "Add isIntro flag and countsTowardCompletion helper"
```

---

### Task 2: Add the Busibox intro module to `MODULES`

**Files:**
- Modify: `lib/module-data.ts` (add `introLessons` and prepend the module to `MODULES`)
- Test: `lib/module-data.test.ts` (extend)

**Interfaces:**
- Consumes: `countsTowardCompletion` (Task 1).
- Produces: `MODULES[0]` with `id: 'mod-intro'`, `isIntro: true`, one lesson `mod-intro-les-1` (no activity).

- [ ] **Step 1: Write the failing test**

Append to `lib/module-data.test.ts`:

```ts
import { MODULES, countsTowardCompletion as counts } from './module-data';

describe('intro module', () => {
  const intro = MODULES[0];

  it('is first in the list', () => {
    expect(intro.id).toBe('mod-intro');
  });

  it('is flagged as intro and excluded from completion', () => {
    expect(intro.isIntro).toBe(true);
    expect(counts(intro)).toBe(false);
  });

  it('has exactly one video-only lesson (no activity)', () => {
    expect(intro.lessons).toHaveLength(1);
    const lesson = intro.lessons[0];
    expect(lesson.id).toBe('mod-intro-les-1');
    expect(lesson.activityType).toBeUndefined();
    expect(lesson.activityId).toBeUndefined();
    expect(lesson.quizId).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/module-data.test.ts`
Expected: FAIL — `MODULES[0].id` is `'mod-1'`, not `'mod-intro'`.

- [ ] **Step 3: Add the intro lessons array**

In `lib/module-data.ts`, immediately before the `// Module 1: Your AI Toolkit` section header (around line 30), add:

```ts
// ==========================================================================
// Intro (Pre-Module): Welcome to Busibox
// ==========================================================================

const introLessons: Lesson[] = [
  {
    id: 'mod-intro-les-1',
    title: 'Welcome to Busibox',
    estimatedMinutes: 5,
    order: 1,
    content: `
## Welcome to Busibox

Watch the short intro below to get oriented before you start the course.

> This is an **intro module**. It does not count toward your completion or your certificate — it's just here to get you started.
`,
  },
];
```

- [ ] **Step 4: Prepend the intro module to `MODULES`**

In `lib/module-data.ts`, make the intro module the **first** element of the `export const MODULES: Module[] = [` array (before the `mod-1` object, currently around line 1031):

```ts
  {
    id: 'mod-intro',
    title: 'Welcome to Busibox',
    description: 'Start here: a short introduction to Busibox and the Cashman AI Portal. Does not count toward course completion.',
    instructor: 'Peter',
    estimatedMinutes: 5,
    order: 0,
    icon: 'book-open',
    videoUrl: '',
    lessons: introLessons,
    isIntro: true,
  },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- lib/module-data.test.ts`
Expected: PASS (all tests including the new `intro module` block).

- [ ] **Step 6: Commit**

```bash
git add lib/module-data.ts lib/module-data.test.ts
git commit -m "Add Busibox intro pre-module as first module"
```

---

### Task 3: Route completion sites through `countsTowardCompletion`

**Files:**
- Modify: `lib/badge-eval.ts:106`
- Modify: `app/api/progress/admin/route.ts:64`
- Modify: `app/(authenticated)/profile/page.tsx:125`
- Test: `lib/badge-eval.test.ts` (create)

**Interfaces:**
- Consumes: `countsTowardCompletion`, `MODULES` (Task 1/2); `computeEarnedBadges({ visitorId, progress, quizScores }): Badge[]` from `lib/badge-eval.ts`.

- [ ] **Step 1: Write the failing test**

Create `lib/badge-eval.test.ts`. This proves the intro module is excluded from the "completionist" requirement — completing only the required (non-intro, non-bonus) lessons still earns `completionist`:

```ts
import { describe, it, expect } from 'vitest';
import { computeEarnedBadges } from './badge-eval';
import { MODULES, countsTowardCompletion } from './module-data';
import type { UserProgress } from './types';

describe('computeEarnedBadges — intro exclusion', () => {
  it('awards completionist for required modules without the intro module', () => {
    const requiredLessons = MODULES.filter(countsTowardCompletion).flatMap((m) =>
      m.lessons.map((l) => ({ moduleId: m.id, lessonId: l.id })),
    );

    const progress: UserProgress[] = requiredLessons.map((k, i) => ({
      id: `p-${i}`,
      visitorId: 'u1',
      moduleId: k.moduleId,
      lessonId: k.lessonId,
      completed: true,
      completedAt: '2026-07-06T00:00:00.000Z',
      startedAt: '2026-07-06T00:00:00.000Z',
      timeSpentSeconds: 0,
    }));

    const badges = computeEarnedBadges({ visitorId: 'u1', progress });
    expect(badges.some((b) => b.badgeType === 'completionist')).toBe(true);
  });
});
```

The object literal above matches `UserProgress` exactly (`lib/types.ts:107` — `id`, `visitorId`, `moduleId`, `lessonId`, `completed`, `completedAt`, `startedAt`, `timeSpentSeconds`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/badge-eval.test.ts`
Expected: FAIL — `badge-eval.ts` still uses `!m.isBonus`, so the newly added intro lesson (which we did NOT mark complete... wait: `requiredLessons` excludes intro, so its lesson is absent from progress; with the old `!m.isBonus` filter, `requiredLessonKeys` would include the intro lesson, making the stamps incomplete and completionist NOT emitted). Expected FAIL: `completionist` badge absent.

- [ ] **Step 3: Update `lib/badge-eval.ts`**

Add `countsTowardCompletion` to the existing import from `@/lib/module-data`:

```ts
import { MODULES, getModule, countsTowardCompletion } from '@/lib/module-data';
```

Change line 106 from:

```ts
  const requiredModules = MODULES.filter((m) => !m.isBonus);
```

to:

```ts
  const requiredModules = MODULES.filter(countsTowardCompletion);
```

- [ ] **Step 4: Update `app/api/progress/admin/route.ts`**

Add `countsTowardCompletion` to the import from `@/lib/module-data` (the file already imports `MODULES` from there). Change line 64 from:

```ts
    const requiredModules = MODULES.filter((m) => !m.isBonus);
```

to:

```ts
    const requiredModules = MODULES.filter(countsTowardCompletion);
```

- [ ] **Step 5: Update `app/(authenticated)/profile/page.tsx`**

Add an import for the helper (this client page imports types from `@/lib/types`; add a value import from `@/lib/module-data`):

```ts
import { countsTowardCompletion } from '@/lib/module-data';
```

Change line 125 from:

```ts
  const requiredModules = modules.filter((m) => !m.isBonus);
```

to:

```ts
  const requiredModules = modules.filter(countsTowardCompletion);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- lib/badge-eval.test.ts`
Expected: PASS.

- [ ] **Step 7: Type-check the edits**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add lib/badge-eval.ts lib/badge-eval.test.ts app/api/progress/admin/route.ts "app/(authenticated)/profile/page.tsx"
git commit -m "Exclude intro modules from completion via shared helper"
```

---

### Task 4: Fix dashboard completion math

**Files:**
- Modify: `app/(authenticated)/page.tsx:60-61`

**Interfaces:**
- Consumes: `countsTowardCompletion` (Task 1).

The dashboard currently sums `totalLessons` over **all** modules and counts **all** completed progress, so intro (and bonus) lessons dilute the percentage. Restrict both numerator and denominator to modules that count toward completion. No unit test (client component with no test harness in this repo); verified by type-check and reasoning.

- [ ] **Step 1: Add the helper import**

In `app/(authenticated)/page.tsx`, add:

```ts
import { countsTowardCompletion } from '@/lib/module-data';
```

- [ ] **Step 2: Restrict the completion math**

Replace lines 60-62:

```ts
  const completedLessons = progress.filter((p) => p.completed);
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const overallPercentage = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
```

with:

```ts
  const countedModuleIds = new Set(
    modules.filter(countsTowardCompletion).map((m) => m.id),
  );
  const completedLessons = progress.filter(
    (p) => p.completed && countedModuleIds.has(p.moduleId),
  );
  const totalLessons = modules
    .filter(countsTowardCompletion)
    .reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const overallPercentage = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(authenticated)/page.tsx"
git commit -m "Exclude non-counting modules from dashboard progress percent"
```

---

### Task 5: Add the "Start Here" tag to the modules list

**Files:**
- Modify: `app/(authenticated)/modules/page.tsx` (around line 119, next to the `isBonus` pill)

**Interfaces:**
- Consumes: `Module.isIntro` (Task 1).

- [ ] **Step 1: Add the intro pill**

In `app/(authenticated)/modules/page.tsx`, directly before the existing `{mod.isBonus && (` block (line 119), add:

```tsx
                    {mod.isIntro && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Start Here · doesn&apos;t count toward completion
                      </span>
                    )}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS (all tests, including the new module-data and badge-eval tests).

- [ ] **Step 4: Commit**

```bash
git add "app/(authenticated)/modules/page.tsx"
git commit -m "Add Start Here tag for the intro pre-module"
```

---

## Manual Verification (after all tasks)

1. Run `npm run dev` and open the Modules page: the **Welcome to Busibox** module appears **first** with a blue "Start Here · doesn't count toward completion" pill.
2. Open the intro module → its lesson: the page renders the welcome text; the `VideoPlayer` appears once an admin attaches a video via **Admin → Videos** (module `mod-intro`, lesson `mod-intro-les-1`).
3. A user who completes all six required modules but not the intro/bonus modules shows **100%** on both the dashboard and profile, and earns the `completionist` / `think-aimpossible` badges.

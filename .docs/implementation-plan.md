# ARC Raiders Loot Helper - Implementation Plan

## Project Overview

**Goal**: Build a static React application that helps ARC Raiders players make informed looting decisions by identifying which items to keep for progression (quests, hideout modules, projects) and which are safe to salvage.

**Technology Stack** (Latest 2025 Versions):

- **React 19.2** - Latest stable release with new hooks (use, useActionState, useOptimistic, useEffectEvent)
- **Vite 6.3+** - Lightning-fast dev server and build tool
- **Tailwind CSS v4.0+** - Modern CSS framework with new Vite plugin architecture
- **TypeScript 5+** - Type safety and developer experience
- **Vitest** - Fast unit testing with modern syntax
- **Zustand** - Lightweight state management

**Core Principles**:

- **TDD (Test-Driven Development)**: Write tests first, implement to pass (Red-Green-Refactor)
- **YAGNI (You Aren't Gonna Need It)**: Only implement features we need now
- **DRY (Don't Repeat Yourself)**: Abstract reusable logic into utilities/components
- **Modern React**: Leverage React 19 features for cleaner, more performant code

---

## Game Mechanics Context

Based on ARC Raiders gameplay research:

- **Weight system**: Inventory weight affects movement speed when limit reached
- **Backpack slots**: Limited during raids (~15-18 slots depending on augment)
- **Salvage vs Recycle**: In-raid salvage yields 50% materials; base recycling yields 100%
- **Stash management**: Base storage starts at 64 slots, expandable with coins
- **Player pain point**: Deciding what to loot/keep with limited inventory space

---

## React 19.2 Modern Hooks & Patterns

### New Hooks We'll Leverage

**1. `use()` Hook** - Simplifies data fetching and context consumption

```typescript
// OLD WAY (React 18):
const [data, setData] = useState(null)
useEffect(() => {
	fetch('/data.json')
		.then(r => r.json())
		.then(setData)
}, [])

// NEW WAY (React 19):
const data = use(fetch('/data.json')) // Cleaner, no useState/useEffect
```

**When to use**: Loading JSON data, consuming context without prop drilling

**2. `useActionState()` Hook** - Better form state management

```typescript
// For form submissions with pending states
const [state, submitAction, isPending] = useActionState(handleSubmit, initialState)
```

**When to use**: Search forms, filter panels (future enhancement if needed)

**3. `useOptimistic()` Hook** - Instant UI feedback

```typescript
// Show immediate UI updates while async operations complete
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn)
```

**When to use**: Future feature - user preferences/saved builds (YAGNI for now)

**4. `useEffectEvent()` Hook** (React 19.2) - Separate event logic from effects

```typescript
// Prevents unnecessary re-renders from changing props
const onItemClick = useEffectEvent(item => {
	// Event logic that doesn't need to re-run effect
})
```

**When to use**: Event handlers inside effects, logging, analytics

### Implementation Strategy

**Phase 2 (Data Layer)**: Use `use()` hook for loading JSON files instead of traditional useEffect + useState pattern. This reduces boilerplate and makes data loading cleaner.

**Phase 3 (UI Components)**: Stick with standard hooks (useState, useCallback, useMemo) for component state. React 19's compiler handles optimization automatically, reducing need for manual memoization.

**Later Phases**: Consider useActionState for search/filter forms if complexity warrants it (YAGNI principle).

---

## Phase 1: Project Foundation & Infrastructure

### Task 1.1: Initialize Vite + React + TypeScript Project

**Objective**: Set up a modern, fast development environment with type safety.

**Success Criteria**:

- [ ] Vite project created with React + TypeScript template
- [ ] Project runs locally on `npm run dev`
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] Hot module replacement (HMR) working

**Commands**:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

**Time Estimate**: 15 minutes

---

### Task 1.2: Configure Tailwind CSS v4 (New Architecture)

**Objective**: Install and configure Tailwind CSS v4 using the new Vite plugin.

**Success Criteria**:

- [ ] Tailwind CSS v4 installed with Vite plugin
- [ ] NO PostCSS config needed (v4 uses Vite plugin directly)
- [ ] NO `tailwind.config.js` needed (CSS-first configuration)
- [ ] Single `@import "tailwindcss"` directive in CSS works
- [ ] Test utility classes render correctly (e.g., `bg-blue-500`, `text-white`)

**Commands**:

```bash
npm install tailwindcss @tailwindcss/vite
```

**Files to Modify**:

**1. `vite.config.ts`** - Add Tailwind Vite plugin:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [react(), tailwindcss()],
})
```

**2. `src/index.css`** - Replace all content with single import:

```css
@import 'tailwindcss';
```

**Tailwind Plus Resources**:
You have access to Tailwind UI kits/templates/blocks. Reference these when building:

- Layout components (headers, navigation)
- Card designs for ItemCard component
- Table components for ItemTable
- Filter/search UI patterns

**Custom Theme (CSS-first in v4)**:
Create `src/theme.css` for custom colors (optional, only if needed):

```css
@import 'tailwindcss';

@theme {
	--color-arc-dark: #0a0e1a;
	--color-arc-gray: #1a1f2e;
	--color-arc-blue: #00a8ff;
	--color-arc-cyan: #00d8ff;
	--color-arc-orange: #ff6b35;
}
```

**Important Notes**:

- Tailwind v4 requires Safari 16.4+, Chrome 111+, Firefox 128+ (modern browsers only)
- No more `tailwind.config.js` unless advanced customization needed
- Theme customization now happens in CSS using `@theme` directive

**Time Estimate**: 20 minutes

---

### Task 1.3: Install Dependencies & Dev Tools

**Objective**: Install all required production and development dependencies.

**Success Criteria**:

- [ ] React Router installed for routing
- [ ] Testing framework (Vitest + React Testing Library) installed
- [ ] State management (Zustand) installed
- [ ] Utility libraries (clsx, date-fns if needed) installed
- [ ] Sample test passes

**Dependencies**:

```bash
# Production
npm install react-router-dom zustand clsx

# Development
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Time Estimate**: 15 minutes

---

### Task 1.4: Configure Testing Environment (TDD Foundation)

**Objective**: Set up Vitest with modern 2025 syntax for unit and integration testing.

**Success Criteria**:

- [ ] Vitest configured in `vite.config.ts`
- [ ] Test setup file created with modern React Testing Library configuration
- [ ] Sample test file created and passes
- [ ] `npm test` command runs tests
- [ ] Test coverage reporting enabled

**Files to Create/Modify**:

**1. `vite.config.ts`** - Add test configuration:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [react(), tailwindcss()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts',
		coverage: {
			reporter: ['text', 'html'],
			exclude: ['node_modules/', 'src/test/'],
		},
	},
})
```

**2. `src/test/setup.ts`** - Modern 2025 syntax:

```typescript
import '@testing-library/jest-dom/vitest' // NEW: Clean import for v4+
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
	cleanup()
})
```

**3. `tsconfig.json`** - Add Vitest types:

```json
{
	"compilerOptions": {
		"types": ["vitest/globals"]
	}
}
```

**4. `package.json`** - Add test scripts:

```json
{
	"scripts": {
		"test": "vitest",
		"test:ui": "vitest --ui",
		"test:coverage": "vitest --coverage"
	}
}
```

**5. `src/test/sample.test.ts`** - Verification test:

```typescript
import { describe, it, expect } from 'vitest'

describe('Setup Verification', () => {
	it('should run tests', () => {
		expect(true).toBe(true)
	})
})
```

**Key Changes from Older Setups**:

- Use `import '@testing-library/jest-dom/vitest'` instead of manual matcher setup
- No need to import/extend jest-dom matchers manually
- Cleaner, more streamlined configuration

**Time Estimate**: 30 minutes

---

### Task 1.5: Project Structure Setup

**Objective**: Create organized folder structure following separation of concerns.

**Success Criteria**:

- [ ] All folders created per structure below
- [ ] `README.md` with project description created
- [ ] `.gitignore` includes `node_modules`, `dist`, `coverage`, `public/data`

**Folder Structure**:

```
arc-loot-helper/
├── .docs/                    # Documentation
├── scripts/
│   └── fetch-data.js         # Build-time data fetcher
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/                # Route-level page components
│   ├── data/
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── hooks/            # Custom data hooks
│   ├── utils/                # Pure utility functions
│   ├── stores/               # Zustand state stores
│   ├── test/                 # Test utilities and setup
│   └── App.tsx
├── public/
│   └── data/                 # Generated JSON (gitignored)
└── package.json
```

**YAGNI Note**: Only create folders as needed during implementation.

**Time Estimate**: 10 minutes

---

## ✅ Phase 1 Complete: Learnings & Decisions

**Status**: ✅ **COMPLETED** (2025-11-12)

**Actual Time**: ~2.5 hours (vs estimated 2 hours)

### Key Learnings

#### 1. Vite Non-Empty Directory Handling

**Issue**: `npm create vite` doesn't scaffold directly into non-empty directories
**Solution**: Created in temporary folder, then moved files to root
**Decision**: This is acceptable for one-time setup; documented for future reference

#### 2. Latest Versions Verified (November 2025)

Successfully using cutting-edge stack:

- **React 19.2.0** (October 2025 release) ✅
- **Vite 7.2.2** (latest) ✅
- **Tailwind CSS 4.1.17** (v4 stable since January 2025) ✅
- **Vitest 4.0.8** (latest) ✅
- **TypeScript 5.9.3** ✅

#### 3. Tailwind v4 Architecture Confirmed

Successfully implemented new approach:

- ✅ NO `tailwind.config.js` needed
- ✅ NO PostCSS configuration required
- ✅ Single `@import "tailwindcss"` in CSS
- ✅ `@tailwindcss/vite` plugin integration
- **Learning**: v4 is much simpler than v3 - documentation was accurate

#### 4. Vitest Test Discovery

**Issue**: Vitest didn't automatically find test files
**Solution**: Added explicit `include` pattern in vite.config.ts:

```typescript
include: ['**/*.{test,spec}.{js,ts,jsx,tsx}']
```

**Decision**: This makes test discovery explicit and predictable

#### 5. Modern ESLint Flat Config

**Learning**: Vite now scaffolds with ESLint 9.x flat config format (not legacy `.eslintrc`)
**Decision**: Embraced flat config and integrated Prettier using this format
**Benefit**: More explicit, better typed, modern approach

### Additional Work Completed (Not in Original Plan)

#### Code Formatting & Linting Enhancement

**Decision**: Add comprehensive formatting to maintain code quality from the start

**Added**:

- ✅ **Prettier 3.6.2** with tab indentation
- ✅ **eslint-config-prettier** to disable conflicting rules
- ✅ **eslint-plugin-prettier** to run Prettier as ESLint rule
- ✅ `.prettierrc` configuration (tabs, no semicolons, single quotes)
- ✅ Format scripts: `npm run format`, `npm run format:check`
- ✅ Lint scripts: `npm run lint`, `npm run lint:fix`

**Result**: All project files formatted consistently with tab indentation

**Rationale**:

- Early formatting setup prevents tech debt
- Tab indentation preferred by user
- ESLint + Prettier integration catches issues early
- TDD approach benefits from linting in CI/CD pipeline

### Files Created

```
.prettierrc                    # Prettier config (tabs, formatting rules)
.prettierignore               # Exclude build artifacts
eslint.config.js              # ESLint flat config with Prettier integration
vite.config.ts                # Vite + Tailwind + Vitest configuration
src/test/setup.ts             # Vitest modern setup (2025 syntax)
src/test/sample.test.ts       # Verification tests (2/2 passing)
src/App.tsx                   # Demo app with Tailwind verification
src/index.css                 # Single Tailwind import
.gitignore                    # Updated with coverage/, public/data/
```

### Folder Structure Created

```
arc-loot-helper/
├── .docs/                    # Documentation
├── scripts/                  # Build scripts (empty, ready for Phase 2)
├── src/
│   ├── components/          # UI components (ready)
│   ├── pages/               # Route pages (ready)
│   ├── data/hooks/          # Custom hooks (ready)
│   ├── utils/               # Utilities (ready)
│   ├── stores/              # Zustand stores (ready)
│   └── test/                # Tests + setup ✅
└── public/data/             # Generated JSON (gitignored)
```

### Success Metrics

- ✅ Dev server starts in ~650ms (Vite is fast!)
- ✅ All tests pass (2/2)
- ✅ Zero npm vulnerabilities
- ✅ TypeScript strict mode enabled
- ✅ 100% of files formatted with tabs
- ✅ ESLint + Prettier integrated without conflicts

### Decisions for Future Phases

**React 19 `use()` Hook**:

- Will attempt in Phase 2 for data loading
- Fallback to traditional useState + useEffect if issues arise
- Goal: Learn modern patterns while maintaining pragmatism

**Testing Strategy**:

- Tests pass with current setup
- Ready for TDD approach in Phase 2
- Vitest globals work correctly with TypeScript

**Code Style**:

- Tabs > Spaces (user preference)
- Single quotes, no semicolons (Prettier default for modern projects)
- 100 character line width for readability

---

## Phase 2: Data Layer (TDD Approach)

### Task 2.1: Define TypeScript Interfaces (RED) ✅

**Objective**: Create type-safe interfaces for all game data based on arcraiders-data schema.

**Success Criteria**:

- [x] `Item` interface matches items.json structure
- [x] `Quest` interface matches quests.json structure
- [x] `HideoutModule` interface matches hideoutModules.json structure
- [x] `Project` interface matches projects.json structure
- [x] `SkillNode` interface matches skillNodes.json structure
- [x] All multilingual fields properly typed (e.g., `Record<string, string>`)

**TDD Approach**:

1. **RED**: Write test asserting type checking compiles
2. **GREEN**: Define interfaces to pass type checks
3. **REFACTOR**: Extract common patterns (e.g., `Localized<T>` type)

**Test File**: `src/data/types.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import type { Item, Quest } from './types'

describe('Data Types', () => {
	it('should allow valid Item object', () => {
		const item: Item = {
			id: 'test_item',
			name: { en: 'Test' },
			// ... all required fields
		}
		expect(item).toBeDefined()
	})
})
```

**Time Estimate**: 45 minutes

---

### Task 2.2: Build Data Fetcher Script (RED-GREEN) ✅

**Objective**: Create Node.js script to fetch JSON files from arcraiders-data repository at build time.

**Success Criteria**:

- [x] Script fetches all JSON files from GitHub raw URLs
- [x] Files saved to `public/data/` directory
- [x] Error handling for network failures
- [x] Script integrated into `package.json` build process
- [x] Test verifies script creates expected files

**TDD Approach**:

1. **RED**: Write test expecting files in `public/data/`
2. **GREEN**: Implement fetch script
3. **REFACTOR**: Extract reusable fetch logic

**Script**: `scripts/fetch-data.js`

```javascript
const fs = require('fs')
const https = require('https')

const BASE_URL = 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/'
const FILES = [
	'items.json',
	'quests.json',
	'hideoutModules.json',
	'projects.json',
	'skillNodes.json',
]
const OUTPUT_DIR = './public/data'

// Implementation follows
```

**Package.json**:

```json
"scripts": {
  "fetch-data": "node scripts/fetch-data.js",
  "prebuild": "npm run fetch-data",
  "build": "tsc && vite build"
}
```

**Time Estimate**: 1 hour

**Actual Time**: 45 minutes

---

## ✅ Tasks 2.1 & 2.2 Complete: Learnings & Decisions

**Status**: ✅ **Tasks 2.1 & 2.2 COMPLETED** (2025-11-12)

**Progress**: 2 of 5 tasks complete (40% of Phase 2)

### Key Learnings

#### 1. TDD Approach Highly Effective

**Success**: Writing tests first caught edge cases before implementation

- Type tests revealed optional field patterns early
- Data validation tests ensured script robustness
- 11/11 tests passing on first GREEN phase

**Decision**: Continue TDD for remaining Phase 2 tasks

#### 2. TypeScript Strict Typing Benefits

**Learning**: Comprehensive type definitions provide excellent developer experience

- IDE autocomplete works perfectly with all game data structures
- Caught potential null/undefined issues before runtime
- `LocalizedText` type made multilingual fields consistent

**Refactoring Success**:

- Extracted `LocalizedText`, `ItemRequirements`, `CategoryRequirements` utility types
- Created `LocalizedEntity` base interface (DRY principle)
- Added `ItemWithRequirements` for future analysis features

#### 3. ES Modules in Node.js Scripts

**Issue**: Initial script execution check using `import.meta.url === file://${process.argv[1]}` didn't work on Windows/MSYS
**Solution**: Simplified to direct function call since script is only used as CLI tool
**Learning**: Keep scripts simple; complex execution guards unnecessary for build scripts

#### 4. Game Data Volume Larger Than Expected

**Discovery**: 366 items (vs estimated ~100-150)

- items.json: 1.1 MB
- quests.json: 437 KB
- Total: ~2 MB of JSON data

**Implications**:

- Performance optimization will be important (Task 5.2)
- Virtual scrolling likely needed for item lists
- Data chunking strategy may be valuable

**Decision**: Monitor performance, implement optimizations in Phase 5 if needed

#### 5. Fetch Script Error Handling

**Implementation**: Robust error handling with retries

- Network errors caught and reported
- JSON validation before file write
- Exit code 1 on failures for CI/CD integration
- Beautiful console output with progress indicators

**Result**: 5/5 files fetched successfully on first run

### Files Created

```
src/data/types.ts              # TypeScript interfaces (142 lines)
src/data/types.test.ts         # Type validation tests (156 lines, 9 tests)
scripts/fetch-data.js          # Data fetcher (122 lines)
scripts/fetch-data.test.js     # Validation tests (72 lines)
public/data/*.json             # 5 game data files (2MB total, gitignored)
```

### Test Coverage

**Type Tests (9 tests)**: ✅

- LocalizedText validation
- Item interface (required & optional fields)
- Quest interface (requirements & rewards)
- HideoutModule with levels
- Project with phases
- SkillNode with prerequisites

**Data Fetcher Tests**: ✅

- Directory existence check
- File existence & size validation
- JSON parsing validation
- All 5 files validated successfully

**Total**: 11/11 tests passing

### npm Scripts Added

```json
"fetch-data": "node scripts/fetch-data.js"
"fetch-data:test": "node scripts/fetch-data.test.js"
"prebuild": "npm run fetch-data"
```

**Integration**: Data automatically fetched before builds via `prebuild` hook

### Data Structure Insights

From actual game data analysis:

- **366 items** across all rarities (Common → Legendary)
- **63 quests** with multilingual objectives
- **9 hideout modules** with up to 10 levels each
- **1 expedition project** with 6 phases
- **45 skill nodes** across 3 categories (CONDITIONING, MOBILITY, SURVIVAL)

**18 languages** supported in all localized fields:
en, de, fr, es, pt, pl, no, da, it, ru, ja, zh-TW, uk, zh-CN, kr, tr, hr, sr

### Decisions for Remaining Tasks

**Task 2.3 (Item Aggregator)**:

- Will need to handle 366 items efficiently
- Category-based requirements (Project Phase 5) need special handling
- Consider caching aggregated results

**Task 2.4 (Value/Weight Calculator)**:

- Zero-weight items exist (need to handle Infinity)
- Some items have no value (recyclables)
- Need prioritization algorithm for "keep or salvage"

**Task 2.5 (React 19 Hooks)**:

- 2MB of JSON is acceptable for static loading
- Will test React 19 `use()` hook for data fetching
- May need Suspense boundaries for loading states

### Success Metrics

- ✅ All TypeScript interfaces compile without errors
- ✅ 11/11 tests passing
- ✅ Data fetcher successfully downloads 2MB of game data
- ✅ Zero npm vulnerabilities maintained
- ✅ Scripts integrate cleanly with package.json build pipeline
- ✅ JSON validation ensures data integrity

---

### Task 2.3: Create Item Requirement Aggregator (RED-GREEN-REFACTOR) ✅

**Objective**: Calculate total item requirements across quests, hideout modules, and projects.

**Success Criteria**:

- [x] Function `calculateItemRequirements()` returns `Record<itemId, total>`
- [x] Correctly sums quest requirements (`requiredItemIds`)
- [x] Correctly sums hideout module requirements (all levels)
- [x] Correctly sums project requirements (all phases)
- [x] Documents category-based requirements (projects.json Phase 5) for UI handling
- [x] 100% test coverage for aggregation logic (14/14 tests passing)

**TDD Approach**:

1. **RED**: Write tests with sample data expecting correct totals
2. **GREEN**: Implement aggregation logic to pass tests
3. **REFACTOR**: Extract reusable parsers (DRY principle)

**Test File**: `src/utils/itemRequirements.test.ts`

```typescript
describe('calculateItemRequirements', () => {
	it('should sum quest requirements', () => {
		const quests = [
			{ requiredItemIds: { metal_parts: 10 } },
			{ requiredItemIds: { metal_parts: 5, wires: 3 } },
		]
		const result = calculateItemRequirements(quests, [], [])
		expect(result.get('metal_parts')).toBe(15)
		expect(result.get('wires')).toBe(3)
	})

	it('should sum hideout module level requirements', () => {
		// Test implementation
	})

	// More test cases...
})
```

**DRY Principle**: Extract common logic:

```typescript
// utils/parseRequirements.ts
export function parseRequirementObject(obj: Record<string, number>): Map<string, number> {
	// Reusable across quest/hideout/project parsers
}
```

**Time Estimate**: 2 hours

---

### Task 2.4: Create Value/Weight Ratio Calculator (RED-GREEN) ✅

**Objective**: Calculate looting priority score based on item value and weight.

**Success Criteria**:

- [x] Function `calculateValuePerWeight(item)` returns ratio
- [x] Handles zero-weight items (returns Infinity for high priority)
- [x] Handles items with no value (returns 0)
- [x] Test coverage for edge cases (10/10 tests passing)

**TDD Approach**:

1. **RED**: Write tests for various item types
2. **GREEN**: Implement calculation
3. **REFACTOR**: Handle edge cases

**Test File**: `src/utils/lootPriority.test.ts`

```typescript
describe('calculateValuePerWeight', () => {
	it('should calculate value per kg correctly', () => {
		const item = { value: 100, weightKg: 0.5 }
		expect(calculateValuePerWeight(item)).toBe(200)
	})

	it('should handle zero weight gracefully', () => {
		const item = { value: 100, weightKg: 0 }
		expect(calculateValuePerWeight(item)).toBe(Infinity)
	})
})
```

**Time Estimate**: 1 hour

---

### Task 2.5: Create Custom Data Hooks with React 19 `use()` (RED-GREEN) ✅

**Objective**: Build React hooks for accessing and filtering game data using modern React 19 patterns.

**Success Criteria**:

- [x] `useItems()` hook loads and returns items
- [x] `useQuests()`, `useHideoutModules()`, `useProjects()`, `useSkillNodes()` hooks
- [x] `useGameData()` hook loads all data in parallel
- [x] Used traditional useState + useEffect for reliability (pragmatic choice)
- [x] Tests verify hook behavior using React Testing Library (12/12 tests passing)

**TDD Approach**:

1. **RED**: Write tests using `renderHook` expecting data
2. **GREEN**: Implement hooks using React 19 `use()` for cleaner data fetching
3. **REFACTOR**: Extract common data-loading logic

**Modern React 19 Pattern** - Using `use()` hook:

```typescript
// hooks/useItems.ts
import { use } from 'react'
import type { Item } from '../types'

// Create a promise for the data (can be cached)
const itemsPromise = fetch('/data/items.json').then(r => r.json())

export function useItems() {
	// use() hook handles suspense and error boundaries automatically
	const items: Item[] = use(itemsPromise)
	return items
}
```

**Alternative: Traditional Pattern** (if `use()` causes issues):

```typescript
export function useItems() {
	const [items, setItems] = useState<Item[]>([])

	useEffect(() => {
		fetch('/data/items.json')
			.then(r => r.json())
			.then(setItems)
	}, [])

	return items
}
```

**Test File**: `src/data/hooks/useItems.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useItems } from './useItems'

describe('useItems', () => {
	it('should load items from JSON', async () => {
		const { result } = renderHook(() => useItems())

		await waitFor(() => {
			expect(result.current).toBeDefined()
			expect(result.current.length).toBeGreaterThan(0)
		})
	})
})
```

**DRY Principle**: Create reusable data loader:

```typescript
// hooks/useJsonData.ts
import { use } from 'react'

export function useJsonData<T>(path: string): T {
	const promise = fetch(path).then(r => r.json())
	return use(promise) // React 19 way
}
```

**Implementation Note**: Start with `use()` hook. If it causes complexity with testing or Suspense boundaries, fall back to traditional useState + useEffect pattern. The goal is to learn modern patterns while maintaining pragmatism (YAGNI).

**Time Estimate**: 2 hours

**Actual Time**: 1.5 hours

---

## ✅ Phase 2 Complete: Learnings & Decisions

**Status**: ✅ **PHASE 2 COMPLETED** (2025-11-12)

**Progress**: 5 of 5 tasks complete (100% of Phase 2)

**Test Coverage**: 47/47 tests passing ✅

### Catalyst UI Kit Integration (Added Before Phase 3)

**Decision**: Integrate Tailwind Catalyst UI Kit for accelerated Phase 3 development

**What is Catalyst**:

- Official React component library from Tailwind CSS team
- Included with Tailwind Plus subscription ($379 value)
- 26 pre-built React/TypeScript components designed for application UIs
- Built with Headless UI v2 for accessibility
- Uses Framer Motion for animations
- Perfect match for our tech stack (React 19, Tailwind v4, TypeScript)

**Components Added to `src/components/`**:

**Layouts (4)**:

- `sidebar-layout.tsx` - Perfect for our main app structure
- `stacked-layout.tsx` - Alternative layout option
- `navbar.tsx` - Top navigation component
- `auth-layout.tsx` - Not needed for our static app

**Forms (8)**:

- `input.tsx`, `textarea.tsx`, `select.tsx` - For search/filters
- `checkbox.tsx`, `radio.tsx`, `switch.tsx` - For filter panels
- `fieldset.tsx` - Form grouping
- `combobox.tsx`, `listbox.tsx` - Advanced selectors

**Data Display (6)**:

- `table.tsx` - Perfect for ItemTable component (Task 3.5)
- `badge.tsx` - Rarity and status badges (reusable!)
- `description-list.tsx` - Item details display
- `avatar.tsx` - Not needed for our app
- `pagination.tsx` - For large item lists
- `alert.tsx` - Error/warning messages

**Interactive (4)**:

- `button.tsx` - Reusable across entire app
- `dropdown.tsx` - Filter dropdowns, sort options
- `dialog.tsx` - Modals/confirmations
- `link.tsx` - Routing integration

**Typography (2)**:

- `heading.tsx` - Page titles, section headers
- `text.tsx` - Styled text components

**Utilities (2)**:

- `divider.tsx` - Visual separators
- `README.md` - Documentation

**Required Dependencies**:

```bash
npm install @headlessui/react motion
```

**Phase 3 Strategy Update**:
Instead of building components from scratch, we'll:

1. ~~Use Catalyst layouts for base structure~~ → **Simplified to single-page app (YAGNI)**
2. Adapt Catalyst table for ItemTable (saves ~2 hours)
3. Use Catalyst form components for search/filters (saves ~2 hours)
4. Customize Catalyst badge for rarity display (saves ~1 hour)
5. Adapt Catalyst components to ARC Raiders dark theme

**Architecture Simplification** (2025-11-12):

- **Decision**: Single-page application instead of multi-page navigation
- **Rationale**: YAGNI principle - users need one powerful view, not multiple pages
- **Design**: One ItemList page with:
  - Flexible grouping controls (group by: requirement type, rarity, item type, etc.)
  - Multi-dimensional filtering (filter by: needed/safe, rarity, type, etc.)
  - Search bar for quick item lookup
  - All 366 items shown by default (filterable)
- **Benefits**: Simpler UX, faster development, less routing complexity

**Estimated Time Savings**: ~10 hours (8 from Catalyst + 2 from simplified architecture)

**Trade-offs**:

- ✅ **Pro**: Production-ready, accessible, well-tested components
- ✅ **Pro**: Consistent design system out of the box
- ✅ **Pro**: Reduces custom CSS and component logic
- ✅ **Pro**: Mobile-responsive by default
- ⚠️ **Con**: Need to install additional dependencies (@headlessui/react, motion)
- ⚠️ **Con**: May need to customize for ARC Raiders theme
- ⚠️ **Con**: Learning curve for Catalyst patterns

**Documentation**: https://catalyst.tailwindui.com/docs

---

### Key Learnings

#### 1. Data Structure Mismatch Discovery (Critical Fix)

**Issue**: TypeScript types didn't match actual JSON structure

**Original Type Definition**:

```typescript
requiredItemIds?: Record<string, number>  // { metal_parts: 10 }
```

**Actual Data Structure**:

```json
"requiredItemIds": [
  { "itemId": "metal_parts", "quantity": 10 }
]
```

**Impact**:

- Tests initially passed with mock data using wrong structure
- Real data validation script revealed the mismatch
- TDD caught this early before building UI

**Fix**: Added `ItemRequirementEntry` interface and updated all types:

```typescript
export interface ItemRequirementEntry {
	itemId: string
	quantity: number
}

export interface Quest {
	requiredItemIds?: ItemRequirementEntry[] // Correct!
}
```

**Lesson**: Always validate types against real data, not just mocks

---

#### 2. Category-Based Requirements Complexity

**Discovery**: Project Phase 5 uses value-based categories, not item quantities

**Example from Expedition Project Phase 5**:

```json
"requirementCategories": [
  { "category": "Combat Items", "valueRequired": 250000 },
  { "category": "Survival Items", "valueRequired": 100000 }
]
```

**Challenges**:

1. "Combat Items" is NOT a type in items.json (actual types: "Assault Rifle", "Pistol", etc.)
2. Players can submit ANY combination of items totaling 250k value
3. Cannot pre-calculate exact item quantities

**Decision**:

- Document Phase 5 requirements separately
- Aggregator focuses on Phases 1-4 (specific items)
- UI will display Phase 5 as "value target" (future task)

**Code Comment Added**:

```typescript
/**
 * Note: Category-based requirements (requirementCategories) cannot be
 * converted to exact item quantities without additional logic, so they
 * are currently ignored. This applies to Project Phase 5 which uses
 * value-based category requirements.
 */
```

---

#### 3. TypeScript Project References for Node.js Scripts

**Issue**: IDE showed errors for `fs` and `path` imports in validation scripts, but CLI didn't

**Root Cause**:

- `tsconfig.app.json` (browser types) was checking `src/**/*.validate.ts`
- `tsconfig.node.json` (Node types) only checked `vite.config.ts`
- CLI `tsc --noEmit` only checks explicitly included files

**Fix**: Updated TypeScript project references:

```json
// tsconfig.node.json
"include": ["vite.config.ts", "src/**/*.validate.ts"]

// tsconfig.app.json
"exclude": ["src/**/*.validate.ts"]
```

**Lesson**: Validation scripts need Node.js types, keep separate from app code

---

#### 4. ESLint Configuration for Mixed Environments

**Issue**: Process global undefined in scripts

**Fix**: Added separate ESLint config for Node.js files:

```javascript
{
  files: ['scripts/**/*.js', 'src/**/*.validate.ts'],
  languageOptions: {
    globals: { ...globals.node }
  }
}
```

**Lesson**: Browser and Node code need different global configurations

---

#### 5. React 19 `use()` Hook - Pragmatic Choice

**Decision**: Used traditional `useState` + `useEffect` instead of React 19 `use()` hook

**Reasoning**:

- `use()` requires Suspense boundaries
- Testing with `use()` is more complex
- Traditional pattern is well-understood and reliable
- Data loading works perfectly with current approach

**Implementation**:

```typescript
export function useItems(): UseDataResult<Item[]> {
	const [data, setData] = useState<Item[] | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		// Fetch and set data
	}, [])

	return { data, loading, error }
}
```

**Lesson**: Modern patterns are great, but pragmatism wins - use what works

---

### Files Created (Phase 2 Complete)

**Type Definitions** (~170 lines):

- `src/data/types.ts` - Complete game data interfaces
- `src/data/types.test.ts` - Type validation tests (9 tests)

**Data Fetching** (~194 lines):

- `scripts/fetch-data.js` - GitHub data fetcher
- `scripts/fetch-data.validate.js` - Data integrity tests
- `package.json` - Added `prebuild` hook

**Utilities** (~300 lines):

- `src/utils/itemRequirements.ts` - Requirement aggregator
- `src/utils/itemRequirements.test.ts` - Aggregator tests (14 tests)
- `src/utils/itemRequirements.validate.ts` - Real data validation
- `src/utils/valueWeightCalculator.ts` - Value/weight calculator
- `src/utils/valueWeightCalculator.test.ts` - Calculator tests (10 tests)

**React Hooks** (~280 lines):

- `src/hooks/useGameData.ts` - 6 data loading hooks
- `src/hooks/useGameData.test.tsx` - Hook tests (12 tests)

**Configuration**:

- `tsconfig.node.json` - Updated for validation scripts
- `tsconfig.app.json` - Excluded validation scripts
- `eslint.config.js` - Added Node.js globals config

**Total**: ~944 lines of production code + tests

---

### Test Coverage Summary

| Test Suite              | Tests  | Status             |
| ----------------------- | ------ | ------------------ |
| Sample Tests            | 2      | ✅ Passing         |
| Type Tests              | 9      | ✅ Passing         |
| Item Requirements       | 14     | ✅ Passing         |
| Value/Weight Calculator | 10     | ✅ Passing         |
| Data Hooks              | 12     | ✅ Passing         |
| **Total**               | **47** | **✅ All Passing** |

---

### Real Data Validation Results

Successfully aggregated requirements from real game data:

```
📊 Data Loaded:
  - 366 items (1.1 MB)
  - 63 quests (437 KB)
  - 9 hideout modules (14 KB)
  - 1 expedition project (19 KB)
  - 45 skill nodes (118 KB)

✅ Aggregation Results:
  - 68 unique items needed
  - 1,215 total item quantities

🔝 Top Required Items:
  1. Rubber Parts (280)
  2. Metal Parts (230)
  3. ARC Alloy (101)
  4. Fabric (80)
  5. Plastic Parts (75)
```

---

### Code Quality Metrics

- **TypeScript**: ✅ 0 errors
- **ESLint**: ✅ 0 errors
- **Prettier**: ✅ All files formatted
- **Tests**: ✅ 47/47 passing
- **Build**: ✅ Successful
- **npm audit**: ✅ 0 vulnerabilities

---

### Strategic Decisions for Phase 3

**Data Layer is Complete**: All game data can now be loaded, aggregated, and calculated

**Next Steps (Phase 3 - UI Components)**:

1. Build base layout with Tailwind v4
2. Create item card components
3. Build requirement display components
4. Add search/filter functionality
5. Display value/weight priorities

**Known UI Challenges**:

- Phase 5 category requirements need special UI (separate from item list)
- 366 items need virtualization for performance
- Search/filter will be critical for usability

---

### Time Tracking

| Task                  | Estimated      | Actual         | Variance                     |
| --------------------- | -------------- | -------------- | ---------------------------- |
| 2.1 TypeScript Types  | 45 min         | 45 min         | ✅ On time                   |
| 2.2 Data Fetcher      | 1 hour         | 45 min         | ✅ Under                     |
| 2.3 Item Aggregator   | 2 hours        | 2.5 hours      | ⚠️ Over (data structure fix) |
| 2.4 Value/Weight Calc | 1 hour         | 45 min         | ✅ Under                     |
| 2.5 Data Hooks        | 2 hours        | 1.5 hours      | ✅ Under                     |
| **Phase 2 Total**     | **6.75 hours** | **6.25 hours** | **✅ Under budget**          |

**Note**: Task 2.3 took longer due to discovering and fixing data structure mismatch, but this was caught early by TDD and real data validation - worth the extra time!

---

## Phase 3: Core UI Components (DRY + Component Testing)

### Task 3.1: Create Base Layout Component (RED-GREEN)

**Objective**: Build responsive app shell with navigation.

**Success Criteria**:

- [ ] `Layout` component with header, nav, main content area
- [ ] Responsive design (mobile-first)
- [ ] Dark theme with ARC Raiders aesthetic
- [ ] Navigation links to key pages
- [ ] Component test verifies rendering

**TDD Approach**:

1. **RED**: Test expects header and nav elements
2. **GREEN**: Implement Layout component
3. **REFACTOR**: Extract reusable Header/Nav components if needed (YAGNI)

**Test File**: `src/components/Layout.test.tsx`

```typescript
describe('Layout', () => {
  it('should render header and navigation', () => {
    render(<Layout><div>Content</div></Layout>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
```

**Time Estimate**: 1.5 hours

---

### Task 3.2: Create SearchBar Component (RED-GREEN)

**Objective**: Build reusable search input with debouncing.

**Success Criteria**:

- [ ] SearchBar accepts `onSearch` callback
- [ ] Debounces input (300ms) to avoid excessive re-renders
- [ ] Clear button when text present
- [ ] Accessible (label, ARIA attributes)
- [ ] Test verifies debouncing behavior

**TDD Approach**:

1. **RED**: Test expects debounced callback after 300ms
2. **GREEN**: Implement with debounce logic
3. **REFACTOR**: Extract debounce hook if reused elsewhere

**Test File**: `src/components/SearchBar.test.tsx`

```typescript
describe('SearchBar', () => {
  it('should debounce search input', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'metal');

    expect(onSearch).not.toHaveBeenCalled(); // Not immediate

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('metal');
    }, { timeout: 400 });
  });
});
```

**Time Estimate**: 1.5 hours

---

### Task 3.3: Create FilterPanel Component (RED-GREEN)

**Objective**: Build multi-select filter UI for item type, rarity, etc.

**Success Criteria**:

- [ ] FilterPanel accepts filter options and onChange callback
- [ ] Supports multiple filter categories (type, rarity, needed/safe)
- [ ] Visual feedback for active filters
- [ ] Accessible (checkboxes with labels)
- [ ] Test verifies filter state changes

**TDD Approach**:

1. **RED**: Test expects filter checkboxes and state updates
2. **GREEN**: Implement component
3. **REFACTOR**: DRY - extract FilterGroup subcomponent if repeated

**Test File**: `src/components/FilterPanel.test.tsx`

**Time Estimate**: 2 hours

---

### Task 3.4: Create ItemCard Component (RED-GREEN)

**Objective**: Display individual item with all relevant info.

**Success Criteria**:

- [ ] Shows item name, icon, rarity, type
- [ ] Shows value, weight, value/weight ratio
- [ ] Shows "Needed: X" badge if required for progression
- [ ] Rarity color-coding (Common/Uncommon/Rare/Legendary)
- [ ] Responsive card layout
- [ ] Test verifies all data displayed

**TDD Approach**:

1. **RED**: Test expects all item properties rendered
2. **GREEN**: Implement card layout
3. **REFACTOR**: Extract Badge, StatDisplay subcomponents (DRY)

**DRY Principle**: Reusable components:

```typescript
// components/Badge.tsx - Reusable across app
// components/StatDisplay.tsx - For value/weight/etc
```

**Time Estimate**: 2 hours

---

### Task 3.5: Create ItemTable Component (RED-GREEN)

**Objective**: Tabular view of items with sorting.

**Success Criteria**:

- [ ] Displays items in sortable table
- [ ] Columns: Name, Type, Rarity, Value, Weight, Value/Weight, Needed
- [ ] Click column header to sort (ascending/descending)
- [ ] Responsive (horizontal scroll on mobile)
- [ ] Test verifies sorting logic

**TDD Approach**:

1. **RED**: Test expects sorted data when header clicked
2. **GREEN**: Implement table with sort state
3. **REFACTOR**: Extract useSortable hook (DRY)

**Time Estimate**: 2.5 hours

---

## Phase 4: Feature Pages

### Task 4.1: Build Item Browser Page (Integration)

**Objective**: Main page combining search, filters, and item display.

**Success Criteria**:

- [ ] SearchBar filters items by name
- [ ] FilterPanel filters by type, rarity, needed status
- [ ] Toggle between ItemCard grid and ItemTable views
- [ ] Displays item count ("Showing X of Y items")
- [ ] Integration test verifies search + filter interaction

**Integration Test**:

```typescript
describe('Item Browser Page', () => {
  it('should filter items by search and type', async () => {
    render(<ItemBrowser />);

    await userEvent.type(screen.getByRole('searchbox'), 'metal');
    await userEvent.click(screen.getByLabelText('Basic Material'));

    await waitFor(() => {
      const items = screen.getAllByTestId('item-card');
      expect(items.length).toBeGreaterThan(0);
      // Verify all are metal + basic material
    });
  });
});
```

**Time Estimate**: 2 hours

---

### Task 4.2: Build Keep or Salvage Page (Primary Feature)

**Objective**: Show which items to keep for progression and which are safe to salvage.

**Success Criteria**:

- [ ] Displays all items with "Needed" counts from aggregated requirements
- [ ] Priority indicators: Critical (quest), Needed (hideout/project), Optional, Safe to Salvage
- [ ] Filter toggle: "Show only needed" / "Show only safe to salvage"
- [ ] Sort by priority, value/weight, or name
- [ ] Visual distinction (color coding, icons) for categories
- [ ] Integration test verifies priority calculation

**Priority Logic** (defined in test first):

- **Critical**: Required for quests
- **Needed**: Required for hideout modules or projects
- **Optional**: Used in crafting recipes but not required for progression
- **Safe to Salvage**: Not needed anywhere

**Integration Test**:

```typescript
describe('Keep or Salvage Page', () => {
  it('should mark quest items as critical', async () => {
    render(<KeepOrSalvage />);

    const criticalItems = screen.getAllByText(/critical/i);
    expect(criticalItems.length).toBeGreaterThan(0);
  });

  it('should show total needed count', async () => {
    render(<KeepOrSalvage />);

    // Assuming metal_parts needed 15 total
    expect(screen.getByText(/needed: 15/i)).toBeInTheDocument();
  });
});
```

**Time Estimate**: 3 hours

---

### Task 4.3: Build Field Guide Page (Quick Reference)

**Objective**: Mobile-optimized quick reference for high-value loot.

**Success Criteria**:

- [ ] Displays items sorted by value/weight ratio by default
- [ ] Compact card layout optimized for mobile
- [ ] Quick filter buttons: "Quest Items", "High Value", "Materials"
- [ ] Offline-friendly (static data, no API calls)
- [ ] Responsive design test passes

**YAGNI Note**: Skip if time-constrained; Item Browser covers core functionality.

**Time Estimate**: 2 hours (optional)

---

## Phase 5: Polish & Optimization

### Task 5.1: Implement Dark Theme with Game Aesthetic

**Objective**: Apply consistent dark theme matching ARC Raiders visual style using Tailwind v4's CSS-first configuration.

**Success Criteria**:

- [ ] Dark background with accent colors (blues, cyans, oranges)
- [ ] Rarity colors: Common (gray), Uncommon (green), Rare (blue), Legendary (orange/gold)
- [ ] Consistent spacing using Tailwind spacing scale
- [ ] Focus states for accessibility
- [ ] Visual regression test or screenshot comparison

**Design Tokens** (Tailwind v4 CSS-first approach):

Create or update `src/index.css`:

```css
@import 'tailwindcss';

@theme {
	/* ARC Raiders brand colors */
	--color-arc-dark: #0a0e1a;
	--color-arc-gray: #1a1f2e;
	--color-arc-blue: #00a8ff;
	--color-arc-cyan: #00d8ff;
	--color-arc-orange: #ff6b35;

	/* Rarity colors */
	--color-rarity-common: #9ca3af;
	--color-rarity-uncommon: #10b981;
	--color-rarity-rare: #3b82f6;
	--color-rarity-legendary: #f59e0b;

	/* Background hierarchy */
	--color-bg-primary: var(--color-arc-dark);
	--color-bg-secondary: var(--color-arc-gray);
	--color-bg-elevated: #252a3a;

	/* Text colors */
	--color-text-primary: #f9fafb;
	--color-text-secondary: #d1d5db;
	--color-text-muted: #9ca3af;
}
```

**Usage in Components**:

```tsx
// Use custom colors as Tailwind classes
<div className="bg-arc-dark text-text-primary">
	<span className="text-rarity-legendary">Legendary Item</span>
</div>
```

**Tailwind Plus Components**: Reference dark mode examples from your Tailwind Plus UI kits for:

- Dark navigation patterns
- Card hover states
- Table theming
- Button variants

**Time Estimate**: 2 hours

---

### Task 5.2: Optimize Performance (Virtual Scrolling)

**Objective**: Handle large item lists (100+ items) without performance degradation.

**Success Criteria**:

- [ ] ItemTable/Grid uses virtual scrolling (react-virtual or similar)
- [ ] Smooth scrolling with 100+ items
- [ ] Lighthouse performance score > 90
- [ ] Bundle size < 200KB (gzipped)

**Implementation**:

```bash
npm install @tanstack/react-virtual
```

**Test**: Render 200 items, verify only ~20 DOM nodes rendered.

**YAGNI Note**: Only implement if performance issues observed.

**Time Estimate**: 2 hours (if needed)

---

### Task 5.3: Add Error Boundaries & Loading States

**Objective**: Graceful error handling and user feedback.

**Success Criteria**:

- [ ] ErrorBoundary component catches React errors
- [ ] Loading spinner while data fetches
- [ ] Empty states for no search results
- [ ] User-friendly error messages
- [ ] Test error scenarios

**Time Estimate**: 1.5 hours

---

### Task 5.4: Accessibility Audit

**Objective**: Ensure WCAG 2.1 AA compliance.

**Success Criteria**:

- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announcements for dynamic content
- [ ] Color contrast ratios meet 4.5:1 minimum
- [ ] ARIA labels on complex components
- [ ] Lighthouse accessibility score 100

**Tools**:

- axe DevTools browser extension
- Lighthouse CI

**Time Estimate**: 2 hours

---

## Phase 6: Deployment & CI/CD

### Task 6.1: Configure Build Process

**Objective**: Optimize production build for static hosting.

**Success Criteria**:

- [ ] `npm run build` executes fetch-data script first
- [ ] Vite builds optimized production bundle
- [ ] Source maps excluded from production
- [ ] Dead code elimination confirmed
- [ ] Build completes in < 60 seconds

**Vite Config**:

```typescript
export default defineConfig({
	build: {
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
				},
			},
		},
	},
})
```

**Time Estimate**: 1 hour

---

### Task 6.2: Set Up Cloudflare Pages Deployment

**Objective**: Deploy to Cloudflare Pages with automatic builds on push.

**Success Criteria**:

- [ ] GitHub repository connected to Cloudflare Pages
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node version specified (18+)
- [ ] Successful production deployment
- [ ] Site accessible at Cloudflare Pages URL

**Steps**:

1. Push to GitHub
2. Cloudflare Dashboard → Pages → Create Project
3. Connect repository
4. Configure build settings
5. Deploy

**Time Estimate**: 30 minutes

---

### Task 6.3: Automated Data Update Workflow

**Objective**: Daily GitHub Action to check for upstream data updates and trigger rebuild.

**Success Criteria**:

- [ ] GitHub Action runs daily (cron schedule)
- [ ] Fetches arcraiders-data repo latest commit SHA
- [ ] Compares to stored SHA
- [ ] Triggers Cloudflare Pages rebuild if changed
- [ ] Manual workflow dispatch available

**GitHub Action**: `.github/workflows/update-data.yml`

```yaml
name: Update Game Data

on:
  schedule:
    - cron: '0 12 * * *' # Daily at noon UTC
  workflow_dispatch: # Manual trigger

jobs:
  check-updates:
    runs-on: ubuntu-latest
    steps:
      - name: Check upstream repo
        # Implementation
      - name: Trigger Cloudflare Pages build
        # Using Cloudflare API
```

**Time Estimate**: 2 hours

---

## Phase 7: Documentation & Handoff

### Task 7.1: Write CLAUDE.md for Future AI Assistance

**Objective**: Document architecture and development workflows.

**Success Criteria**:

- [ ] Commands section (dev, build, test, deploy)
- [ ] Architecture overview (data flow, state management)
- [ ] Component structure explanation
- [ ] Testing approach documented
- [ ] Common troubleshooting steps

**Time Estimate**: 1 hour

---

### Task 7.2: Update README.md

**Objective**: User-facing documentation for contributors and users.

**Success Criteria**:

- [ ] Project description and purpose
- [ ] Features list
- [ ] Local development setup instructions
- [ ] Deployment process
- [ ] Data update process
- [ ] Contributing guidelines

**Time Estimate**: 45 minutes

---

## Summary Timeline

| Phase                  | Tasks        | Estimated Time |
| ---------------------- | ------------ | -------------- |
| Phase 1: Foundation    | 5 tasks      | ~2 hours       |
| Phase 2: Data Layer    | 5 tasks      | ~6.5 hours     |
| Phase 3: UI Components | 5 tasks      | ~9.5 hours     |
| Phase 4: Feature Pages | 3 tasks      | ~7 hours       |
| Phase 5: Polish        | 4 tasks      | ~7.5 hours     |
| Phase 6: Deployment    | 3 tasks      | ~3.5 hours     |
| Phase 7: Documentation | 2 tasks      | ~1.75 hours    |
| **Total**              | **27 tasks** | **~38 hours**  |

---

## SMART Goal Verification

Each task follows SMART criteria:

✅ **Specific**: Clear objective stated
✅ **Measurable**: Success criteria checkbox list
✅ **Achievable**: Realistic scope with time estimates
✅ **Relevant**: Aligned with project goals
✅ **Time-bound**: Estimated completion time provided

---

## Best Practice Adherence

### TDD (Test-Driven Development)

- All logic functions have RED-GREEN-REFACTOR cycle
- Tests written before implementation
- 100% coverage goal for utilities and data layer
- Integration tests for pages

### YAGNI (You Aren't Gonna Need It)

- No user accounts/backend (not needed yet)
- No advanced features (crafting calculator, skill tree visualizer) in initial release
- Optional tasks clearly marked
- Build only what serves the core use case

### DRY (Don't Repeat Yourself)

- Reusable utility functions (`parseRequirements`, `calculateValuePerWeight`)
- Shared components (`Badge`, `StatDisplay`, `SearchBar`)
- Custom hooks for data fetching (`useJsonData`)
- Tailwind theme tokens for consistent styling

---

## Risk Mitigation

**Risk**: Upstream data schema changes break app
**Mitigation**: TypeScript interfaces will catch breaking changes at build time; version pin data if needed

**Risk**: Large JSON files slow initial load
**Mitigation**: Static bundling ensures fast CDN delivery; implement code splitting if needed

**Risk**: Manual data updates forgotten
**Mitigation**: Automated daily workflow checks for updates

---

## Post-Launch Iteration (Future Phases)

Potential enhancements (YAGNI until user feedback):

- Interactive crafting chain visualizer
- Skill tree planner
- User-saved loadouts (local storage)
- PWA for offline mobile use
- Multilingual support (18 languages available in data)

---

## Document Changelog

**Version 3.1** (2025-11-12):

- ✅ **CATALYST UI KIT INTEGRATED** - Added 26 pre-built React/TypeScript components
- ✅ Documented Catalyst integration strategy and component inventory
- ✅ Updated Phase 3 approach to leverage Catalyst components
- ✅ Estimated 8 hours saved across Phase 3 using pre-built components
- ✅ Identified required dependencies: @headlessui/react, motion
- ✅ Mapped Catalyst components to Phase 3 tasks
- ✅ Documented trade-offs and benefits of using Catalyst

**Version 3.0** (2025-11-12):

- ✅ **PHASE 2 COMPLETED** - Data Layer Complete (All 5 tasks done!)
- ✅ Added comprehensive Phase 2 completion learnings section
- ✅ Documented data structure mismatch discovery & fix (arrays vs records)
- ✅ Documented category-based requirements (Phase 5) handling strategy
- ✅ Fixed TypeScript project references for Node.js validation scripts
- ✅ Fixed ESLint configuration for mixed browser/Node environments
- ✅ Documented pragmatic React hooks decision (useState over use())
- ✅ Test coverage: **47/47 tests passing** (100% passing rate)
- ✅ Real data validation: 68 unique items, 1,215 total quantities
- ✅ Code quality: 0 TS errors, 0 ESLint errors, 0 vulnerabilities
- ✅ Time tracking: 6.25 hours actual vs 6.75 estimated (under budget!)

**Version 2.2** (2025-11-12):

- ✅ **Phase 2 Tasks 2.1 & 2.2 COMPLETED** - TypeScript Interfaces & Data Fetcher
- ✅ Added comprehensive learnings section for Tasks 2.1 & 2.2
- ✅ Documented TDD approach effectiveness (11/11 tests passing)
- ✅ Noted game data volume insights (366 items, 2MB total)
- ✅ Documented ES modules script execution issue on Windows
- ✅ All success criteria marked complete with checkboxes
- ✅ Data fetcher integrated with prebuild hook
- ✅ Test coverage: Type validation + data integrity checks

**Version 2.1** (2025-11-12):

- ✅ **Phase 1 COMPLETED** - Project Foundation & Infrastructure
- ✅ Added comprehensive Phase 1 learnings and decisions section
- ✅ Documented Prettier + ESLint integration (tab indentation)
- ✅ Verified latest versions (React 19.2, Vite 7.2.2, Tailwind 4.1.17)
- ✅ Documented Vitest test discovery configuration
- ✅ Noted modern ESLint flat config format
- ✅ Project successfully running with zero vulnerabilities

**Version 2.0** (2025-11-12):

- ✅ Updated to React 19.2 (latest stable)
- ✅ Updated to Tailwind CSS v4.0+ with new Vite plugin architecture
- ✅ Updated to Vite 6.3+
- ✅ Added React 19 hooks guide (use, useActionState, useOptimistic, useEffectEvent)
- ✅ Modernized Vitest setup with 2025 syntax
- ✅ Added Tailwind Plus resources section
- ✅ Replaced tailwind.config.js with CSS-first @theme configuration
- ✅ Updated all code examples to use modern patterns
- ✅ Removed PostCSS/Autoprefixer (no longer needed with Tailwind v4)

**Version 1.0** (2025-11-12):

- Initial implementation plan with React 18/Tailwind v3

---

**Document Version**: 3.1
**Last Updated**: 2025-11-12
**Status**: ✅ Phase 2 Complete (100%) | 🚀 Catalyst UI Kit Added | 📋 Ready for Phase 3 (Core UI Components)

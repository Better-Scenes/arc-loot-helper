# TDD Implementation Plan: Progress Storage with Zustand

## Principles
- **YAGNI**: Build only what we need for quest completion tracking first
- **DRY**: Shared patterns for completion tracking across quests/hideout/projects
- **TDD**: Red → Green → Refactor cycle for every feature

## Status: ✅ COMPLETE - Full Progress Tracking System (27 passing tests)

**Implementation Date:** 2025-11-16
**Total Implementation Time:** ~23 minutes
**Test Coverage:** 27/27 passing
**Final Code Size:** 170 lines (down from 198 after DRY refactor)

### ✅ Completed Phases (All Done!)

| Phase | Description | Tests | Lines Saved | Status |
|-------|-------------|-------|-------------|--------|
| **1** | Quest completion tracking | 2 | - | ✅ DONE |
| **2** | Persistence verification | 2 | - | ✅ DONE |
| **3** | Query/selector utilities | 3 | - | ✅ DONE |
| **4** | Uncomplete functionality | 4 | - | ✅ DONE |
| **7** | Input validation & edge cases | 6 | - | ✅ DONE |
| **5** | Hideout/Projects expansion | 10 | - | ✅ DONE |
| **6** | DRY refactor (generic helpers) | - | 28 lines | ✅ DONE |

**Total:** 27 tests, 170 lines of production code

---

## Implementation Reflections & Lessons Learned

### Key Decisions Made

1. **Types Location**: Added progress types to existing `src/data/types.ts` instead of creating a separate file
   - *Rationale*: Keep all game data types centralized, easier to import

2. **Import Paths**: Used relative imports (`../data/types`) instead of path aliases (`@/data/types`)
   - *Observation*: Project doesn't use TypeScript path aliases, maintaining consistency

3. **localStorage Testing Strategy**: Changed approach from simulating page refresh to validating structure
   - *Challenge*: Can't reliably test hydration in test environment (store already initialized)
   - *Solution*: Test that localStorage structure is correct and contains expected data
   - *Learning*: Integration tests are better suited for hydration testing

4. **State Access Pattern**: Must call `getState()` after mutations to see updates
   - *Bug Found*: Initial test captured state reference before mutation
   - *Fix*: Call `getState()` after `completeQuest()` to get fresh state
   - *Zustand Quirk*: State updates don't mutate existing references

5. **Uncomplete Implementation**: Used object destructuring for clean removal
   - `const { [questId]: removed, ...remaining } = state.progress.quests`
   - *Benefits*: Immutable, concise, type-safe

6. **Reset Function**: Added for test isolation, also useful for "clear all progress" feature
   - Side benefit: Could add a "reset progress" button in UI

7. **Input Validation Strategy** (Phase 7): Single validation function for all methods
   - *Pattern*: `isValidQuestId()` checks `typeof === 'string' && length > 0`
   - *Implementation*: Early return in all methods if invalid
   - *Benefit*: Prevents localStorage corruption, no runtime errors
   - *Learning*: Simple validation function is better than inline checks (DRY)

### Test Coverage Insights

**What We Tested:**
- ✅ Completion tracking
- ✅ Persistence to localStorage
- ✅ localStorage structure validation
- ✅ Query methods return correct values
- ✅ Uncomplete functionality
- ✅ Edge cases (non-existent quests, multiple quests)
- ✅ **Input validation** (empty strings, null, undefined) ⭐ Phase 7
- ✅ **Special characters in IDs** (-, _, ., :) ⭐ Phase 7
- ✅ **Very long IDs** (1000+ characters) ⭐ Phase 7
- ✅ **Duplicate completions** (idempotent behavior) ⭐ Phase 7

**What We Haven't Tested Yet:**
- ⏳ Corrupted localStorage data handling (would require error recovery system)
- ⏳ Schema migration (version changes) (would be needed when adding hideout/projects)
- ⏳ Performance with large datasets (100+ quests) (not needed yet)

### Architecture Observations

**What Worked Well:**
- Zustand's persist middleware "just works" - zero configuration needed
- TypeScript inference works perfectly with `create<ProgressStore>()`
- Test structure is clean and readable
- Adding new features is straightforward (RED → GREEN → REFACTOR)

**Potential Future Improvements:**
- Extract helper function for completion pattern (DRY for hideout/projects)
- Add schema validation/migration system
- Consider adding optimistic updates for better UX
- Add bulk operations (completeMany, uncompleteMany)

---

## Phase 1: Minimal Viable Persistence

### Step 1.1: Types (Minimal)
**Goal**: Define only what we need for quest completion tracking

```typescript
// src/types/progress.ts
interface QuestProgress {
  questId: string
  completed: boolean
  completedAt: string | null
}

interface GameProgress {
  quests: Record<string, QuestProgress>
  version: number
}
```

**No test needed** - Types don't execute

---

### Step 1.2: RED - Write failing test for quest completion
**File**: `src/stores/__tests__/progressStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useProgressStore } from '../progressStore'

describe('progressStore - Quest Completion', () => {
  beforeEach(() => {
    // Clear store before each test
    useProgressStore.getState().reset()
  })

  it('should mark a quest as completed', () => {
    const { completeQuest, progress } = useProgressStore.getState()

    completeQuest('quest-001')

    expect(progress.quests['quest-001']).toBeDefined()
    expect(progress.quests['quest-001'].completed).toBe(true)
    expect(progress.quests['quest-001'].completedAt).toBeTruthy()
  })

  it('should not have quest before completion', () => {
    const { progress } = useProgressStore.getState()

    expect(progress.quests['quest-001']).toBeUndefined()
  })
})
```

**Run**: `npm test` → **FAIL** (store doesn't exist yet)

---

### Step 1.3: GREEN - Make test pass (minimal implementation)
**File**: `src/stores/progressStore.ts`

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GameProgress, QuestProgress } from '@/types/progress'

interface ProgressStore {
  progress: GameProgress
  completeQuest: (questId: string) => void
  reset: () => void
}

const initialState: GameProgress = {
  quests: {},
  version: 1
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      progress: initialState,

      completeQuest: (questId) => set((state) => ({
        progress: {
          ...state.progress,
          quests: {
            ...state.progress.quests,
            [questId]: {
              questId,
              completed: true,
              completedAt: new Date().toISOString()
            }
          }
        }
      })),

      reset: () => set({ progress: initialState })
    }),
    {
      name: 'arc-loot-helper-progress',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

**Run**: `npm test` → **PASS** ✅

---

### Step 1.4: REFACTOR - Clean up if needed
- Extract constants
- Improve naming
- Add JSDoc comments

**Run tests after each refactor** → Should stay **GREEN** ✅

---

## Phase 2: Persistence Verification

### Step 2.1: RED - Test localStorage persistence

```typescript
describe('progressStore - Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    useProgressStore.getState().reset()
  })

  it('should persist quest completion to localStorage', () => {
    const { completeQuest } = useProgressStore.getState()

    completeQuest('quest-001')

    const stored = localStorage.getItem('arc-loot-helper-progress')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed.state.progress.quests['quest-001'].completed).toBe(true)
  })

  it('should hydrate from localStorage on initialization', () => {
    // Simulate existing data
    localStorage.setItem('arc-loot-helper-progress', JSON.stringify({
      state: {
        progress: {
          quests: { 'quest-001': { questId: 'quest-001', completed: true, completedAt: '2025-01-01' } },
          version: 1
        }
      },
      version: 0
    }))

    // Re-create store (simulate page refresh)
    const { progress } = useProgressStore.getState()

    expect(progress.quests['quest-001'].completed).toBe(true)
  })
})
```

**Run**: `npm test` → Should **PASS** (Zustand persist handles this) ✅

---

## Phase 3: Query/Selector Utilities

### Step 3.1: RED - Test completion status query

```typescript
describe('progressStore - Queries', () => {
  it('should return true if quest is completed', () => {
    const { completeQuest, isQuestCompleted } = useProgressStore.getState()

    completeQuest('quest-001')

    expect(isQuestCompleted('quest-001')).toBe(true)
  })

  it('should return false if quest is not completed', () => {
    const { isQuestCompleted } = useProgressStore.getState()

    expect(isQuestCompleted('quest-999')).toBe(false)
  })
})
```

**Run**: `npm test` → **FAIL** (method doesn't exist)

---

### Step 3.2: GREEN - Add query method

```typescript
// Add to ProgressStore interface
isQuestCompleted: (questId: string) => boolean

// Add to store implementation
isQuestCompleted: (questId) => {
  const state = get()
  return state.progress.quests[questId]?.completed ?? false
}
```

**Run**: `npm test` → **PASS** ✅

---

### Step 3.3: REFACTOR - Extract helper

```typescript
// src/stores/progressStore.ts
const isCompleted = (id: string, collection: Record<string, { completed: boolean }>) =>
  collection[id]?.completed ?? false

// Use in store
isQuestCompleted: (questId) => isCompleted(questId, get().progress.quests)
```

**Run**: `npm test` → Should stay **GREEN** ✅

---

## Phase 4: Uncomplete/Toggle

### Step 4.1: RED - Test uncomplete

```typescript
it('should uncomplete a quest', () => {
  const { completeQuest, uncompleteQuest, isQuestCompleted } = useProgressStore.getState()

  completeQuest('quest-001')
  uncompleteQuest('quest-001')

  expect(isQuestCompleted('quest-001')).toBe(false)
})
```

**Run**: `npm test` → **FAIL**

---

### Step 4.2: GREEN - Implement uncomplete

```typescript
uncompleteQuest: (questId) => set((state) => {
  const { [questId]: removed, ...remaining } = state.progress.quests
  return {
    progress: {
      ...state.progress,
      quests: remaining
    }
  }
})
```

**Run**: `npm test` → **PASS** ✅

---

## Phase 5: DRY - Generic Completion Pattern

### Step 5.1: Identify duplication

Once we add hideout/projects, we'll repeat:
- `complete[Type]`
- `uncomplete[Type]`
- `is[Type]Completed`

### Step 5.2: RED - Test hideout completion

```typescript
describe('progressStore - Hideout Completion', () => {
  it('should mark hideout module level as completed', () => {
    const { completeHideoutLevel, isHideoutLevelCompleted } = useProgressStore.getState()

    completeHideoutLevel('module-001', 2)

    expect(isHideoutLevelCompleted('module-001', 2)).toBe(true)
  })
})
```

**Run**: `npm test` → **FAIL**

---

### Step 5.3: GREEN - Copy-paste quest pattern

```typescript
// Types
interface HideoutProgress {
  moduleId: string
  level: number
  completed: boolean
  completedAt: string | null
}

// Store
hideout: Record<string, HideoutProgress>

completeHideoutLevel: (moduleId, level) => set((state) => ({
  progress: {
    ...state.progress,
    hideout: {
      ...state.progress.hideout,
      [`${moduleId}-${level}`]: {
        moduleId,
        level,
        completed: true,
        completedAt: new Date().toISOString()
      }
    }
  }
}))
```

**Run**: `npm test` → **PASS** ✅

---

### Step 5.4: REFACTOR - Extract generic helper

```typescript
// src/stores/helpers/completionHelper.ts
export function createCompletionSlice<T extends { completed: boolean }>(
  key: string,
  createEntry: (id: string) => T
) {
  return {
    complete: (id: string) => (state: any) => ({
      progress: {
        ...state.progress,
        [key]: {
          ...state.progress[key],
          [id]: createEntry(id)
        }
      }
    }),

    isCompleted: (id: string, state: any) =>
      state.progress[key][id]?.completed ?? false
  }
}

// Use in store
const questSlice = createCompletionSlice('quests', (id) => ({
  questId: id,
  completed: true,
  completedAt: new Date().toISOString()
}))

completeQuest: (questId) => set(questSlice.complete(questId))
isQuestCompleted: (questId) => questSlice.isCompleted(questId, get())
```

**Run**: `npm test` → Should stay **GREEN** ✅

---

## Phase 6: Error Handling & Edge Cases

### Step 6.1: RED - Test edge cases

```typescript
describe('progressStore - Edge Cases', () => {
  it('should handle completing the same quest twice', () => {
    const { completeQuest, progress } = useProgressStore.getState()

    completeQuest('quest-001')
    const firstTime = progress.quests['quest-001'].completedAt

    // Wait a bit
    setTimeout(() => {
      completeQuest('quest-001')
      const secondTime = progress.quests['quest-001'].completedAt

      expect(secondTime).not.toBe(firstTime) // Updates timestamp
    }, 10)
  })

  it('should handle invalid quest IDs gracefully', () => {
    const { completeQuest } = useProgressStore.getState()

    expect(() => completeQuest('')).not.toThrow()
    expect(() => completeQuest(null as any)).not.toThrow()
  })
})
```

**Run**: `npm test` → May **FAIL**

---

### Step 6.2: GREEN - Add validation

```typescript
completeQuest: (questId) => {
  if (!questId || typeof questId !== 'string') return

  set((state) => ({ /* ... */ }))
}
```

**Run**: `npm test` → **PASS** ✅

---

## Implementation Order Summary

### ✅ Completed (17 passing tests)

1. ✅ **Quest completion** (core feature) - DONE
2. ✅ **Persistence verification** (localStorage works) - DONE
3. ✅ **Query methods** (read completion status) - DONE
4. ✅ **Uncomplete** (for accidental clicks) - DONE
7. ✅ **Input validation & edge cases** - DONE
   - ✅ Validates non-empty strings (rejects empty, null, undefined)
   - ✅ Handles duplicate completions gracefully
   - ✅ Supports special characters in IDs (-, _, ., :)
   - ✅ Handles very long IDs (1000+ chars)
   - ✅ Safe uncomplete of non-existent quests

### ⏳ Deferred Phases (Following YAGNI - implement when needed)

5. ⏳ **Hideout/Projects** (expand pattern) - NOT STARTED
   - Add `completeHideoutLevel(moduleId, level)`
   - Add `uncompleteHideoutLevel(moduleId, level)`
   - Add `isHideoutLevelCompleted(moduleId, level)`
   - Add `completeProjectPhase(projectId, phase)`
   - Add `uncompleteProjectPhase(projectId, phase)`
   - Add `isProjectPhaseCompleted(projectId, phase)`

6. ⏳ **DRY refactor** (generic helpers) - NOT STARTED
   - Extract `createCompletionSlice` helper
   - Reduce code duplication across quest/hideout/project methods
   - Consider performance optimizations

**Note:** Phases 5-6 deferred until hideout/project tracking is needed in UI

---

## Testing Strategy

```typescript
// Test structure
describe('progressStore', () => {
  describe('Quest Completion', () => {
    it('should complete quest')
    it('should not have quest before completion')
    it('should query completion status')
    it('should uncomplete quest')
  })

  describe('Persistence', () => {
    it('should persist to localStorage')
    it('should hydrate from localStorage')
  })

  describe('Hideout Levels', () => {
    // Same pattern as quests
  })

  describe('Projects', () => {
    // Same pattern as quests
  })

  describe('Edge Cases', () => {
    it('should handle duplicate completions')
    it('should validate inputs')
    it('should handle corrupted localStorage')
  })
})
```

---

## Files to Create

```
src/
├── types/
│   └── progress.ts              # Type definitions
├── stores/
│   ├── progressStore.ts         # Main Zustand store
│   ├── helpers/
│   │   └── completionHelper.ts  # DRY generic helpers (Phase 5)
│   └── __tests__/
│       └── progressStore.test.ts # Vitest tests
```

---

## Success Criteria

### Phase 1-4 Criteria (Quest Tracking) ✅ ACHIEVED

- ✅ All tests pass with `npm test` (11/11 passing)
- ✅ Data persists to localStorage automatically
- ✅ Can mark quests as complete/incomplete
- ✅ Can query quest completion status
- ✅ Type-safe TypeScript implementation
- ✅ Clean, maintainable code structure
- ✅ Only features we need (YAGNI) - No premature optimization

### Phase 5-7 Criteria (Future Work) ⏳ PENDING

- ⏳ Can mark hideout levels as complete/incomplete
- ⏳ Can mark project phases as complete/incomplete
- ⏳ No code duplication via generic helpers (DRY)
- ⏳ Input validation and error handling
- ⏳ Schema migration system for version updates

---

## Final Implementation Summary (2025-11-16)

### What Was Built

**Files Created:**
- ✅ `src/data/types.ts` - Added progress tracking type definitions (QuestProgress, HideoutProgress, ProjectProgress)
- ✅ `src/stores/progressStore.ts` - Zustand store with persistence, validation & DRY helpers (170 lines)
- ✅ `src/stores/__tests__/progressStore.test.ts` - Comprehensive test suite (348 lines, 27 tests)

**Features Delivered:**
- ✅ **Quest tracking:** complete/uncomplete/query methods
- ✅ **Hideout level tracking:** complete/uncomplete/query methods
- ✅ **Project phase tracking:** complete/uncomplete/query methods
- ✅ Timestamp tracking for all completions
- ✅ Automatic localStorage persistence (Zustand persist middleware)
- ✅ **Input validation** (empty strings, null, undefined, invalid numbers)
- ✅ **Edge case handling** (special chars, long IDs, duplicates)
- ✅ **DRY architecture** (generic helpers eliminate duplication)
- ✅ Comprehensive test coverage (27/27 passing)

**API Surface:**
```typescript
interface ProgressStore {
  progress: GameProgress

  // Quest tracking
  completeQuest: (questId: string) => void
  uncompleteQuest: (questId: string) => void
  isQuestCompleted: (questId: string) => boolean

  // Hideout level tracking
  completeHideoutLevel: (moduleId: string, level: number) => void
  uncompleteHideoutLevel: (moduleId: string, level: number) => void
  isHideoutLevelCompleted: (moduleId: string, level: number) => boolean

  // Project phase tracking
  completeProjectPhase: (projectId: string, phase: number) => void
  uncompleteProjectPhase: (projectId: string, phase: number) => void
  isProjectPhaseCompleted: (projectId: string, phase: number) => boolean

  // Utility
  reset: () => void  // For testing and "clear all" feature
}

// All methods validate inputs and handle edge cases gracefully
```

### Test Results

```
Test Files  1 passed (1)
Tests       27 passed (27) ✅ COMPLETE
Duration    ~1.7s
Code Size   170 lines (down from 198 after DRY refactor)

Coverage Breakdown:
├─ Quest Tracking
│  ├─ Quest Completion: 2 tests
│  ├─ Persistence: 2 tests
│  ├─ Queries: 3 tests
│  ├─ Uncomplete: 4 tests
│  └─ Input Validation & Edge Cases: 6 tests
│     ├─ Empty strings
│     ├─ Null values
│     ├─ Undefined values
│     ├─ Duplicate completions
│     ├─ Special characters
│     └─ Very long IDs (1000+ chars)
│
├─ Hideout Level Tracking: 5 tests
│  ├─ Completion with composite keys (moduleId-level)
│  ├─ Query methods
│  ├─ Uncomplete functionality
│  ├─ Multiple levels independently
│  └─ Input validation (empty strings, zero/negative levels)
│
└─ Project Phase Tracking: 5 tests
   ├─ Completion with composite keys (projectId-phase)
   ├─ Query methods
   ├─ Uncomplete functionality
   ├─ Multiple phases independently
   └─ Input validation (empty strings, zero/negative phases)
```

### Time Investment (Actual - Based on File Timestamps)

**Timeline - Full Implementation:**
- 08:05:42 - Types added (`src/data/types.ts`)
- 08:06:00 - Implementation started (`src/stores/` created)
- 08:15:06 - Phase 1-4,7 tests complete
- 08:15:29 - Phase 1-4,7 code complete (17 tests passing)
- 08:17:14 - Initial documentation finalized
- 08:25:03 - Phase 5 (hideout) tests added
- 08:25:43 - Phase 5 (hideout) code complete (22 tests passing)
- 08:26:20 - Phase 5 (projects) tests added
- 08:26:59 - Phase 5 (projects) code complete (27 tests passing)
- 08:28:18 - Phase 6 DRY refactor complete (170 lines, all 27 tests passing)

**Actual Time Breakdown:**
- **Phases 1-4,7** (Quest tracking + validation): 9 min 29 sec
  - 17 tests, full input validation
- **Phase 5** (Hideout + Projects): 11 min 30 sec
  - 10 additional tests (27 total)
  - Followed exact same TDD pattern
- **Phase 6** (DRY refactor): 1 min 19 sec
  - Reduced code from 198 to 170 lines (14% reduction)
  - All 27 tests still passing
- **Total Implementation:** ~22 minutes

**Speed Factors:**
- TDD kept focus tight (RED → GREEN → REFACTOR)
- Zustand's minimal boilerplate
- Pattern reuse across quest/hideout/projects
- TypeScript catching errors immediately
- Generic helpers eliminated duplication

### ✅ All Phases Complete!

The progress tracking system is **fully implemented** with:
- ✅ Quest tracking (complete/uncomplete/query)
- ✅ Hideout level tracking (complete/uncomplete/query)
- ✅ Project phase tracking (complete/uncomplete/query)
- ✅ Input validation & edge case handling
- ✅ DRY refactor with generic helpers
- ✅ Automatic localStorage persistence
- ✅ 27 comprehensive tests (100% passing)
- ✅ 170 lines of clean, maintainable code

### Potential Future Enhancements

**Not needed now, but could be added later:**

1. **Statistics/Summary API** (~15 min)
   - `getCompletionStats()` - returns counts/percentages
   - Aggregate progress across all types
   - Filter by trader, category, etc.

2. **Import/Export** (~20 min)
   - `exportProgress()` - JSON export
   - `importProgress(json)` - Restore from backup
   - Progress sharing between users

3. **Schema Migration System** (~30 min)
   - Handle version changes
   - Migrate old data formats
   - Corrupted data recovery

4. **Batch Operations** (~15 min)
   - `completeMany()` - bulk complete
   - `uncompleteMany()` - bulk uncomplete
   - Better UX for mass updates

### Key Takeaways

✅ **TDD Process Worked Flawlessly**
- Every feature started with a failing test (RED → GREEN → REFACTOR)
- No unnecessary features were added
- Refactoring was safe because tests caught regressions
- Phase 7 validation: 3 tests failed → added `isValidQuestId` → all 17 passed

✅ **Zustand Was The Right Choice**
- Minimal boilerplate (78 lines for full validated store)
- Built-in persistence "just works"
- TypeScript support is excellent
- Testing is straightforward with `getState()`

✅ **YAGNI Kept Scope Manageable**
- Only built quest tracking (what we need now)
- Structure ready for expansion (hideout/projects types already defined)
- No time wasted on features we might not need
- Deferred Phases 5-6 until actually needed

✅ **Input Validation Pays Off**
- Simple `isValidQuestId` function prevents runtime errors
- Early return pattern keeps code clean
- 6 edge case tests ensure robustness
- Production-ready defensive programming

✅ **Speed Achievement: 9.5 Minutes for Production Code**
- TDD eliminated debugging time (caught issues immediately)
- RED → GREEN → REFACTOR cycle prevented over-engineering
- Zustand's simplicity = less code to write
- Test-first approach meant no "going back to add tests"

🎯 **Production-Ready System**
- ✅ All 17 tests passing
- ✅ Type-safe TypeScript
- ✅ Automatic persistence across sessions
- ✅ Input validation & edge case handling
- ✅ Clean API for UI integration
- ✅ Zero runtime errors from invalid inputs
- ✅ **Delivered in <10 minutes** of actual coding time

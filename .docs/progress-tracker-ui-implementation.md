# TDD Implementation Plan: Progress Tracker UI

## Principles
- **YAGNI**: Build only what's needed for progression tracking
- **DRY**: Reuse existing UI components and patterns from ItemList
- **TDD**: Red → Green → Refactor cycle for components
- **Accessibility**: Keyboard navigation and screen reader support
- **Simple Navigation**: Use existing Navbar components, no sidebar

## Status: 📋 PLANNED - Ready for Implementation

**Target Features:**
1. View all quests, hideout modules, and project phases
2. Mark items as completed/incomplete
3. Show required items for each progression step
4. Intelligently hide completed items based on chain progression
5. Match existing app styling and patterns
6. Undo completion functionality (move back a stage)

---

## Navigation Solution: Simple Header with Navbar Components

**Current State:**
- App.tsx has custom header with logo/title
- Single page app (just ItemList)

**Proposed:**
- Keep same header layout
- Add `Navbar` + `NavbarItem` for navigation tabs (Items | Progress)
- Navbar components already handle mobile responsiveness with touch targets
- Clean, minimal, matches existing design

**Example:**
```typescript
// Enhanced header using existing Navbar components
<Navbar>
  <NavbarSection>
    {/* Logo/Title (existing) */}
  </NavbarSection>
  <NavbarSpacer />
  <NavbarSection>
    <NavbarItem href="/" current={pathname === '/'}>
      Items
    </NavbarItem>
    <NavbarItem href="/progress" current={pathname === '/progress'}>
      Progress
    </NavbarItem>
  </NavbarSection>
</Navbar>
```

**Mobile Behavior:** NavbarItem components have built-in touch targets (44x44px) and responsive styling - no extra work needed! ✅

---

## Architecture Overview

```
/progress route
  │
  ├─ ProgressTracker page (container)
  │    │
  │    ├─ ProgressSection (reusable section wrapper)
  │    │    ├─ QuestProgressList
  │    │    │    └─ QuestProgressItem (quest card)
  │    │    │         ├─ RequiredItemsList
  │    │    │         └─ CompletionButton
  │    │    │
  │    │    ├─ HideoutProgressList
  │    │    │    └─ HideoutProgressItem (module/level card)
  │    │    │         ├─ RequiredItemsList
  │    │    │         └─ CompletionButton
  │    │    │
  │    │    └─ ProjectProgressList
  │    │         └─ ProjectProgressItem (project/phase card)
  │    │              ├─ RequiredItemsList
  │    │              └─ CompletionButton
  │    │
  │    └─ ProgressStats (summary stats)
```

**State Flow:**
```
User clicks complete → progressStore.completeQuest()
                    → triggers useSyncRemainingRequirements
                    → remainingRequirementsStore updates
                    → UI re-renders with updated progress
```

---

## Phase 1: Routing & Navigation Header (Est: 12 min)

### Task 1.1: Setup React Router + Enhanced Header (12 min)
**Goal**: Add routing and update header to use Navbar components

**Files to modify:**
- `src/main.tsx` - Wrap app in BrowserRouter
- `src/App.tsx` - Add Routes + enhance header with Navbar

**Implementation (TDD):**

```typescript
// src/App.test.tsx (NEW - RED first)
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { GameDataProvider } from './contexts/GameDataContext'

describe('App Navigation', () => {
  it('should render navigation with Items and Progress links', () => {
    render(
      <BrowserRouter>
        <GameDataProvider>
          <App />
        </GameDataProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Items')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })

  it('should navigate to progress page', async () => {
    render(
      <BrowserRouter>
        <GameDataProvider>
          <App />
        </GameDataProvider>
      </BrowserRouter>
    )

    const progressLink = screen.getByText('Progress')
    progressLink.click()

    // Should show progress page content
    await waitFor(() => {
      expect(screen.getByText(/Progress Tracker/i)).toBeInTheDocument()
    })
  })
})
```

**Run**: `npm test -- App` → **FAIL** (no navigation yet)

**GREEN - Implementation:**

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ADD THIS
import './index.css'
import App from './App.tsx'
import { GameDataProvider } from './contexts/GameDataContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* ADD THIS */}
      <GameDataProvider>
        <App />
      </GameDataProvider>
    </BrowserRouter> {/* ADD THIS */}
  </StrictMode>
)
```

```typescript
// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom'
import { ItemList } from './pages/ItemList'
import { ProgressTracker } from './pages/ProgressTracker'
import { Footer } from './components/Footer'
import { Navbar, NavbarSection, NavbarItem, NavbarSpacer } from './components/navbar'
import { useSyncRemainingRequirements } from './hooks/useSyncRemainingRequirements'

function App() {
  const location = useLocation()
  useSyncRemainingRequirements()

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Enhanced header using Navbar components */}
      <header className="border-b border-white/10 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Navbar className="py-3">
            {/* Logo/Title Section */}
            <NavbarSection>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
                  <svg
                    className="size-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-semibold text-white">ARC Raiders Loot Helper</h1>
                  <p className="text-xs text-zinc-400">Keep or Salvage? Make informed decisions.</p>
                </div>
              </div>
            </NavbarSection>

            {/* Spacer pushes navigation to the right */}
            <NavbarSpacer />

            {/* Navigation Section */}
            <NavbarSection>
              <NavbarItem href="/" current={location.pathname === '/'}>
                Items
              </NavbarItem>
              <NavbarItem href="/progress" current={location.pathname === '/progress'}>
                Progress
              </NavbarItem>
            </NavbarSection>
          </Navbar>
        </div>
      </header>

      {/* Main content - Routes */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<ItemList />} />
          <Route path="/progress" element={<ProgressTracker />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
```

**Run**: `npm test -- App` → **PASS** ✅

**Acceptance Criteria:**
- ✅ Navigation tabs visible in header
- ✅ "Items" and "Progress" clickable
- ✅ Current page highlighted (motion indicator)
- ✅ Mobile touch targets work (44x44px via NavbarItem)
- ✅ Browser back/forward buttons work
- ✅ Clean, matches existing design

---

## Phase 2: Progress Tracker Page Shell (Est: 8 min)

### Task 2.1: Create ProgressTracker Page Structure (8 min)
**Goal**: Create basic page structure matching ItemList layout

**File to create:**
- `src/pages/ProgressTracker.tsx`

**Implementation (RED first):**
```typescript
// src/pages/__tests__/ProgressTracker.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressTracker } from '../ProgressTracker'
import { GameDataProvider } from '../../contexts/GameDataContext'

describe('ProgressTracker', () => {
  it('should render page title', () => {
    render(
      <GameDataProvider>
        <ProgressTracker />
      </GameDataProvider>
    )
    expect(screen.getByText(/Progress Tracker/i)).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(
      <GameDataProvider>
        <ProgressTracker />
      </GameDataProvider>
    )
    // Initially should show loading
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })
})
```

**Run**: `npm test -- ProgressTracker` → **FAIL** (component doesn't exist)

**GREEN - Create minimal component:**
```typescript
// src/pages/ProgressTracker.tsx
import { Heading } from '../components/heading'
import { Text } from '../components/text'
import { useGameData } from '../hooks/useGameData'

export function ProgressTracker() {
  const { data, loading, error } = useGameData()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Text className="text-zinc-400">Loading progress data...</Text>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Text className="text-red-400">Error loading data</Text>
          <Text className="mt-2 text-sm text-zinc-500">{error.message}</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Heading level={1}>Progress Tracker</Heading>
      <Text className="text-zinc-400">
        Track your quest, hideout, and project completion progress
      </Text>

      {/* Sections will be added in Phase 3-6 */}
    </div>
  )
}
```

**Run**: `npm test -- ProgressTracker` → **PASS** ✅

**Acceptance Criteria:**
- ✅ Page renders without errors
- ✅ Shows loading state while data fetches
- ✅ Shows error state if data fails to load
- ✅ Matches existing page styling (zinc-950 background, etc.)

---

## Phase 3: Shared Components (Est: 25 min)

### Task 3.1: Create ProgressSection Component (10 min)
**Goal**: Reusable section wrapper for each progression type

**TDD Approach:**
```typescript
// src/components/__tests__/ProgressSection.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressSection } from '../ProgressSection'

describe('ProgressSection', () => {
  it('should render section title and item count', () => {
    render(
      <ProgressSection title="Quests" totalCount={10} completedCount={3}>
        <div>Content</div>
      </ProgressSection>
    )

    expect(screen.getByText('Quests')).toBeInTheDocument()
    expect(screen.getByText('(3/10)')).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <ProgressSection title="Quests" totalCount={10} completedCount={3}>
        <div>Test Content</div>
      </ProgressSection>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should support collapsible state', async () => {
    const user = userEvent.setup()

    render(
      <ProgressSection title="Quests" totalCount={10} completedCount={3} defaultCollapsed={false}>
        <div>Content</div>
      </ProgressSection>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()

    // Click to collapse
    const header = screen.getByRole('button', { name: /Quests/i })
    await user.click(header)

    // Content should be hidden
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })
})
```

**Run**: `npm test -- ProgressSection` → **FAIL**

**GREEN - Implementation:**
```typescript
// src/components/ProgressSection.tsx
import { useState } from 'react'
import { Heading } from './heading'
import { Text } from './text'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid'

interface ProgressSectionProps {
  title: string
  totalCount: number
  completedCount: number
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function ProgressSection({
  title,
  totalCount,
  completedCount,
  children,
  defaultCollapsed = false,
}: ProgressSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Section Header - Clickable to collapse/expand */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-left hover:bg-zinc-800 transition-colors"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3">
          <Heading level={2} className="mb-0">
            {title}
          </Heading>
          <Text className="text-zinc-400">
            ({completedCount}/{totalCount})
          </Text>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <Text className="text-sm text-zinc-400">{percentage}%</Text>
          </div>
        </div>

        {isCollapsed ? (
          <ChevronDownIcon className="h-5 w-5 text-zinc-400" />
        ) : (
          <ChevronUpIcon className="h-5 w-5 text-zinc-400" />
        )}
      </button>

      {/* Section Content */}
      {!isCollapsed && <div className="space-y-3">{children}</div>}
    </div>
  )
}
```

**Run**: `npm test -- ProgressSection` → **PASS** ✅

**Acceptance Criteria:**
- ✅ Shows title with count badge
- ✅ Shows progress bar with percentage
- ✅ Collapses/expands on click
- ✅ Keyboard accessible
- ✅ Matches existing component styling

---

### Task 3.2: Create RequiredItemsList Component (8 min)
**Goal**: Display required items with quantities and icons

**TDD:**
```typescript
// src/components/__tests__/RequiredItemsList.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RequiredItemsList } from '../RequiredItemsList'
import type { Item, ItemRequirementEntry } from '../../data/types'

const mockItems: Item[] = [
  { id: 'metal-parts', name: { en: 'Metal Parts' }, type: 'material' },
  { id: 'spring', name: { en: 'Spring' }, type: 'material' },
]

const mockRequirements: ItemRequirementEntry[] = [
  { itemId: 'metal-parts', quantity: 10 },
  { itemId: 'spring', quantity: 5 },
]

describe('RequiredItemsList', () => {
  it('should render list of required items', () => {
    render(
      <RequiredItemsList
        requirements={mockRequirements}
        allItems={mockItems}
      />
    )

    expect(screen.getByText('Metal Parts')).toBeInTheDocument()
    expect(screen.getByText('×10')).toBeInTheDocument()
    expect(screen.getByText('Spring')).toBeInTheDocument()
    expect(screen.getByText('×5')).toBeInTheDocument()
  })

  it('should show empty state when no requirements', () => {
    render(
      <RequiredItemsList
        requirements={[]}
        allItems={mockItems}
      />
    )

    expect(screen.getByText(/No items required/i)).toBeInTheDocument()
  })

  it('should show remaining quantities when provided', () => {
    const remaining = { 'metal-parts': 7, 'spring': 2 }

    render(
      <RequiredItemsList
        requirements={mockRequirements}
        allItems={mockItems}
        remainingQuantities={remaining}
      />
    )

    // Should show "7 remaining" for metal-parts
    expect(screen.getByText(/7 remaining/i)).toBeInTheDocument()
    expect(screen.getByText(/2 remaining/i)).toBeInTheDocument()
  })
})
```

**Run**: `npm test -- RequiredItemsList` → **FAIL**

**GREEN - Implementation:**
```typescript
// src/components/RequiredItemsList.tsx
import type { Item, ItemRequirementEntry } from '../data/types'
import { ItemIcon } from './ItemIcon'
import { Badge } from './badge'

interface RequiredItemsListProps {
  requirements?: ItemRequirementEntry[]
  allItems: Item[]
  remainingQuantities?: Record<string, number>
}

export function RequiredItemsList({
  requirements,
  allItems,
  remainingQuantities,
}: RequiredItemsListProps) {
  if (!requirements || requirements.length === 0) {
    return (
      <div className="text-sm text-zinc-500 italic">
        No items required
      </div>
    )
  }

  // Create item lookup map
  const itemMap = new Map(allItems.map(item => [item.id, item]))

  return (
    <div className="flex flex-wrap gap-2">
      {requirements.map(({ itemId, quantity }) => {
        const item = itemMap.get(itemId)
        const remaining = remainingQuantities?.[itemId]
        const isComplete = remaining !== undefined && remaining === 0

        return (
          <div
            key={itemId}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-900 px-2 py-1"
          >
            <ItemIcon item={item} size="sm" />
            <span className={`text-sm ${isComplete ? 'text-zinc-500 line-through' : 'text-white'}`}>
              {item?.name?.en || itemId}
            </span>
            <Badge color={isComplete ? 'zinc' : 'blue'}>
              ×{quantity}
            </Badge>
            {remaining !== undefined && remaining > 0 && (
              <Badge color="orange">
                {remaining} remaining
              </Badge>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

**Run**: `npm test -- RequiredItemsList` → **PASS** ✅

**Acceptance Criteria:**
- ✅ Renders item icons and names
- ✅ Shows required quantities
- ✅ Shows remaining quantities when provided
- ✅ Handles missing items gracefully
- ✅ Visual indication for completed items

---

### Task 3.3: Create CompletionButton Component (7 min)
**Goal**: Reusable button for marking items complete/incomplete

**TDD:**
```typescript
// src/components/__tests__/CompletionButton.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompletionButton } from '../CompletionButton'

describe('CompletionButton', () => {
  it('should show "Mark Complete" when not completed', () => {
    const onToggle = vi.fn()
    render(<CompletionButton isCompleted={false} onToggle={onToggle} />)

    expect(screen.getByText(/Mark Complete/i)).toBeInTheDocument()
  })

  it('should show "Completed" when completed', () => {
    const onToggle = vi.fn()
    render(<CompletionButton isCompleted={true} onToggle={onToggle} />)

    expect(screen.getByText(/Completed/i)).toBeInTheDocument()
  })

  it('should call onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()

    render(<CompletionButton isCompleted={false} onToggle={onToggle} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
```

**Run**: `npm test -- CompletionButton` → **FAIL**

**GREEN - Implementation:**
```typescript
// src/components/CompletionButton.tsx
import { Button } from './button'
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid'

interface CompletionButtonProps {
  isCompleted: boolean
  onToggle: () => void
  disabled?: boolean
}

export function CompletionButton({
  isCompleted,
  onToggle,
  disabled = false,
}: CompletionButtonProps) {
  return (
    <Button
      color={isCompleted ? 'green' : 'blue'}
      onClick={onToggle}
      disabled={disabled}
      className="min-w-[140px]"
    >
      {isCompleted ? (
        <>
          <CheckIcon className="h-4 w-4" />
          Completed
        </>
      ) : (
        <>
          Mark Complete
        </>
      )}
    </Button>
  )
}

// Also create UncompleteButton for undo functionality
export function UncompleteButton({
  onUncomplete,
  disabled = false,
}: {
  onUncomplete: () => void
  disabled?: boolean
}) {
  return (
    <Button
      outline
      onClick={onUncomplete}
      disabled={disabled}
      className="min-w-[100px]"
    >
      <XMarkIcon className="h-4 w-4" />
      Undo
    </Button>
  )
}
```

**Run**: `npm test -- CompletionButton` → **PASS** ✅

**Acceptance Criteria:**
- ✅ Shows appropriate text and icon
- ✅ Calls callback on click
- ✅ Visual distinction between states
- ✅ Disabled state works
- ✅ Undo button available

---

## Phase 4: Quest Progress UI (Est: 35 min)

### Task 4.1: Create QuestProgressItem Component (15 min)
**Goal**: Display individual quest with completion controls

**TDD:**
```typescript
// src/components/__tests__/QuestProgressItem.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestProgressItem } from '../QuestProgressItem'
import type { Quest, Item } from '../../data/types'

const mockQuest: Quest = {
  id: 'quest-001',
  trader: 'Celeste',
  name: { en: 'First Steps' },
  objectives: [{ en: 'Collect 10 Metal Parts' }],
  xp: 100,
  requiredItemIds: [
    { itemId: 'metal-parts', quantity: 10 }
  ],
}

const mockItems: Item[] = [
  { id: 'metal-parts', name: { en: 'Metal Parts' }, type: 'material' },
]

describe('QuestProgressItem', () => {
  it('should render quest name and trader', () => {
    render(
      <QuestProgressItem
        quest={mockQuest}
        isCompleted={false}
        onComplete={vi.fn()}
        onUncomplete={vi.fn()}
        allItems={mockItems}
      />
    )

    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(screen.getByText(/Celeste/i)).toBeInTheDocument()
  })

  it('should show required items', () => {
    render(
      <QuestProgressItem
        quest={mockQuest}
        isCompleted={false}
        onComplete={vi.fn()}
        onUncomplete={vi.fn()}
        allItems={mockItems}
      />
    )

    expect(screen.getByText('Metal Parts')).toBeInTheDocument()
    expect(screen.getByText('×10')).toBeInTheDocument()
  })

  it('should call onComplete when mark complete clicked', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(
      <QuestProgressItem
        quest={mockQuest}
        isCompleted={false}
        onComplete={onComplete}
        onUncomplete={vi.fn()}
        allItems={mockItems}
      />
    )

    const button = screen.getByText(/Mark Complete/i)
    await user.click(button)

    expect(onComplete).toHaveBeenCalledWith('quest-001')
  })

  it('should show undo button when completed', () => {
    render(
      <QuestProgressItem
        quest={mockQuest}
        isCompleted={true}
        onComplete={vi.fn()}
        onUncomplete={vi.fn()}
        allItems={mockItems}
      />
    )

    expect(screen.getByText(/Completed/i)).toBeInTheDocument()
    expect(screen.getByText(/Undo/i)).toBeInTheDocument()
  })

  it('should show dimmed styling when completed', () => {
    const { container } = render(
      <QuestProgressItem
        quest={mockQuest}
        isCompleted={true}
        onComplete={vi.fn()}
        onUncomplete={vi.fn()}
        allItems={mockItems}
      />
    )

    // Card should have opacity/dimmed styling
    const card = container.firstChild
    expect(card).toHaveClass('opacity-60')
  })
})
```

**Run**: `npm test -- QuestProgressItem` → **FAIL**

**GREEN - Implementation:**
```typescript
// src/components/QuestProgressItem.tsx
import type { Quest, Item } from '../data/types'
import { Badge } from './badge'
import { RequiredItemsList } from './RequiredItemsList'
import { CompletionButton, UncompleteButton } from './CompletionButton'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

interface QuestProgressItemProps {
  quest: Quest
  isCompleted: boolean
  onComplete: (questId: string) => void
  onUncomplete: (questId: string) => void
  allItems: Item[]
  remainingQuantities?: Record<string, number>
}

export function QuestProgressItem({
  quest,
  isCompleted,
  onComplete,
  onUncomplete,
  allItems,
  remainingQuantities,
}: QuestProgressItemProps) {
  return (
    <div
      className={`rounded-lg border border-white/10 bg-zinc-900 p-4 transition-opacity ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              {quest.name.en}
            </h3>
            {isCompleted && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge color="blue">{quest.trader}</Badge>
            <Badge color="purple">{quest.xp} XP</Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isCompleted ? (
            <>
              <CompletionButton
                isCompleted={true}
                onToggle={() => onUncomplete(quest.id)}
              />
              <UncompleteButton onUncomplete={() => onUncomplete(quest.id)} />
            </>
          ) : (
            <CompletionButton
              isCompleted={false}
              onToggle={() => onComplete(quest.id)}
            />
          )}
        </div>
      </div>

      {/* Objectives */}
      {quest.objectives && quest.objectives.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-zinc-400 mb-1">Objectives:</p>
          <ul className="list-disc list-inside space-y-1">
            {quest.objectives.map((obj, idx) => (
              <li key={idx} className="text-sm text-zinc-300">
                {obj.en}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Items */}
      {quest.requiredItemIds && quest.requiredItemIds.length > 0 && (
        <div>
          <p className="text-sm font-medium text-zinc-400 mb-2">Required Items:</p>
          <RequiredItemsList
            requirements={quest.requiredItemIds}
            allItems={allItems}
            remainingQuantities={remainingQuantities}
          />
        </div>
      )}
    </div>
  )
}
```

**Run**: `npm test -- QuestProgressItem` → **PASS** ✅

---

### Task 4.2: Create QuestProgressList with Chain Logic (20 min)
**Goal**: List all quests with intelligent show/hide based on quest chains

**(Implementation similar to plan - see full details in original document)**

---

## Phases 5-7: Hideout/Projects/Integration/Testing

**(Similar TDD approach for hideout modules, projects, controls, and testing)**

*Full implementation details available - truncated for brevity*

---

## Time Estimates Summary (Senior Frontend Engineer)

| Phase | Description | Tasks | Est. Time |
|-------|-------------|-------|-----------|
| **1** | Routing & Navigation (Navbar) | 1 | 12 min |
| **2** | Page Structure | 1 | 8 min |
| **3** | Shared Components | 3 | 25 min |
| **4** | Quest Progress UI | 2 | 35 min |
| **5** | Hideout Progress UI | 2 | 30 min |
| **6** | Project Progress UI | 2 | 30 min |
| **7** | Integration & Controls | 2 | 20 min |
| **8** | Testing & Polish | 3 | 25 min |
| **Total** | **Full Implementation** | **16** | **~3 hours** |

---

## Design Decisions (Confirmed)

Based on your preference for simplicity:

**1. Navigation:**
- ✅ **Use Navbar components** (NavbarItem, NavbarSection) - simple horizontal tabs
- ✅ **No sidebar** - keep current header-based layout
- ✅ **Mobile handled automatically** by NavbarItem touch targets

**2. Quest Chain Display** (hideCompleted ON):
   - ✅ Show only NEXT quest in chain (recommended)

**3. Undo Functionality**:
   - ✅ Only uncomplete specific quest (recommended)

**4. Hideout/Project Undo**:
   - ✅ Only go back one level (recommended)

**5. Initial State**:
   - ✅ hideCompleted = true by default (cleaner)

**6. Empty State**:
   - ✅ Show celebration message

---

## Files Summary

### New Files:
```
src/
├── pages/
│   ├── ProgressTracker.tsx
│   └── __tests__/
│       ├── ProgressTracker.test.tsx
│       └── ProgressTracker.integration.test.tsx
├── components/
│   ├── ProgressSection.tsx
│   ├── RequiredItemsList.tsx
│   ├── CompletionButton.tsx
│   ├── ProgressStats.tsx
│   ├── QuestProgressItem.tsx
│   ├── QuestProgressList.tsx
│   ├── HideoutProgressItem.tsx
│   ├── HideoutProgressList.tsx
│   ├── ProjectProgressItem.tsx
│   ├── ProjectProgressList.tsx
│   └── __tests__/ (10 test files)
```

### Files to Modify:
```
src/
├── main.tsx (add BrowserRouter)
└── App.tsx (add Routes + enhance header with Navbar)
```

---

**Ready to implement with simple, clean navigation!** 🚀

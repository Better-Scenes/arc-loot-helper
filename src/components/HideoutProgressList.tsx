/**
 * HideoutProgressList Component
 * Lists hideout modules with level tracking
 */

import { useMemo } from 'react'
import type { HideoutModule, Item } from '../data/types'
import { useProgressStore } from '../stores/progressStore'
import { useRemainingRequirementsStore } from '../stores/remainingRequirementsStore'
import { HideoutProgressItem } from './HideoutProgressItem'

interface HideoutProgressListProps {
	modules: HideoutModule[]
	allItems: Item[]
	hideCompleted: boolean
}

export function HideoutProgressList({ modules, allItems, hideCompleted }: HideoutProgressListProps) {
	// Subscribe to progress data to trigger re-renders when it changes
	const progress = useProgressStore(state => state.progress)

	const isHideoutLevelCompleted = useProgressStore(state => state.isHideoutLevelCompleted)
	const completeHideoutLevel = useProgressStore(state => state.completeHideoutLevel)
	const uncompleteHideoutLevel = useProgressStore(state => state.uncompleteHideoutLevel)
	const remaining = useRemainingRequirementsStore(state => state.remaining)

	// Calculate current level for each module
	const modulesWithProgress = useMemo(() => {
		return modules.map(module => {
			let currentLevel = 0

			// Find highest completed level
			for (let level = 1; level <= module.maxLevel; level++) {
				if (isHideoutLevelCompleted(module.id, level)) {
					currentLevel = level
				} else {
					break // Levels must be completed in order
				}
			}

			return {
				module,
				currentLevel,
				isMaxed: currentLevel === module.maxLevel,
			}
		})
	}, [modules, progress, isHideoutLevelCompleted])

	// Filter based on hideCompleted and sort by module name
	const visibleModules = useMemo(() => {
		const filtered = hideCompleted
			? modulesWithProgress.filter(({ isMaxed }) => !isMaxed)
			: modulesWithProgress

		// Sort by module name for stable ordering
		return filtered.sort((a, b) => a.module.name.en.localeCompare(b.module.name.en))
	}, [modulesWithProgress, hideCompleted])

	if (visibleModules.length === 0) {
		return (
			<div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
				<p className="text-center text-zinc-500">
					{hideCompleted ? 'All hideout modules maxed! 🎉' : 'No hideout modules available'}
				</p>
			</div>
		)
	}

	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{visibleModules.map(({ module, currentLevel }) => (
				<HideoutProgressItem
					key={module.id}
					module={module}
					currentLevel={currentLevel}
					maxLevel={module.maxLevel}
					onCompleteLevel={completeHideoutLevel}
					onUncompleteLevel={uncompleteHideoutLevel}
					allItems={allItems}
					remainingQuantities={remaining || undefined}
				/>
			))}
		</div>
	)
}

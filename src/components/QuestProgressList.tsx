/**
 * QuestProgressList Component
 * Lists all quests with intelligent show/hide based on quest chains
 */

import { useMemo } from 'react'
import type { Quest, Item } from '../data/types'
import { useProgressStore } from '../stores/progressStore'
import { useRemainingRequirementsStore } from '../stores/remainingRequirementsStore'
import { QuestProgressItem } from './QuestProgressItem'

interface QuestProgressListProps {
	quests: Quest[]
	allItems: Item[]
	hideCompleted: boolean
}

export function QuestProgressList({ quests, allItems, hideCompleted }: QuestProgressListProps) {
	// Subscribe to progress data to trigger re-renders when it changes
	const progress = useProgressStore(state => state.progress)

	const isQuestCompleted = useProgressStore(state => state.isQuestCompleted)
	const completeQuest = useProgressStore(state => state.completeQuest)
	const uncompleteQuest = useProgressStore(state => state.uncompleteQuest)
	const remaining = useRemainingRequirementsStore(state => state.remaining)

	// Filter quests based on hideCompleted and chain logic
	const visibleQuests = useMemo(() => {
		if (!hideCompleted) {
			return quests
		}

		return quests.filter(quest => {
			const completed = isQuestCompleted(quest.id)

			// Hide if completed
			if (completed) return false

			// Show if no prerequisites
			if (!quest.previousQuestIds || quest.previousQuestIds.length === 0) {
				return true
			}

			// Show only if ALL prerequisites are completed
			const allPrereqsComplete = quest.previousQuestIds.every(prereqId => isQuestCompleted(prereqId))

			return allPrereqsComplete
		})
	}, [quests, hideCompleted, progress, isQuestCompleted])

	// Group by trader with stable sorting
	const questsByTrader = useMemo(() => {
		const grouped = new Map<string, Quest[]>()

		for (const quest of visibleQuests) {
			const trader = quest.trader || 'Unknown'
			if (!grouped.has(trader)) {
				grouped.set(trader, [])
			}
			grouped.get(trader)!.push(quest)
		}

		// Sort quests within each trader group by name
		grouped.forEach((quests) => {
			quests.sort((a, b) => a.name.en.localeCompare(b.name.en))
		})

		// Convert to array and sort trader groups alphabetically
		return Array.from(grouped.entries()).sort(([traderA], [traderB]) =>
			traderA.localeCompare(traderB)
		)
	}, [visibleQuests])

	if (questsByTrader.length === 0) {
		return (
			<div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
				<p className="text-center text-zinc-500">
					{hideCompleted ? 'All quests completed! 🎉' : 'No quests available'}
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{questsByTrader.map(([trader, traderQuests]) => (
				<div key={trader}>
					<h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400">{trader}</h3>
					<div className="space-y-3">
						{traderQuests.map(quest => (
							<QuestProgressItem
								key={quest.id}
								quest={quest}
								isCompleted={isQuestCompleted(quest.id)}
								onComplete={completeQuest}
								onUncomplete={uncompleteQuest}
								allItems={allItems}
								remainingQuantities={remaining || undefined}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	)
}

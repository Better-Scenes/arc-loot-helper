/**
 * QuestProgressItem Component
 * Displays individual quest with completion controls and requirements
 */

import type { Quest, Item } from '../data/types'
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
			<div className="mb-3 flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h3 className="text-lg font-semibold text-white">{quest.name.en}</h3>
						{isCompleted && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					{isCompleted ? (
						<>
							<CompletionButton isCompleted={true} onToggle={() => onUncomplete(quest.id)} />
							<UncompleteButton onUncomplete={() => onUncomplete(quest.id)} />
						</>
					) : (
						<CompletionButton isCompleted={false} onToggle={() => onComplete(quest.id)} />
					)}
				</div>
			</div>

			{/* Objectives */}
			{quest.objectives && quest.objectives.length > 0 && (
				<div className="mb-3">
					<p className="mb-1 text-sm font-medium text-zinc-400">Objectives:</p>
					<ul className="list-inside list-disc space-y-1">
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
					<p className="mb-2 text-sm font-medium text-zinc-400">Required Items:</p>
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

/**
 * HideoutProgressItem Component
 * Displays hideout module with level progression
 */

import type { HideoutModule, Item } from '../data/types'
import { Badge } from './badge'
import { RequiredItemsList } from './RequiredItemsList'
import { CompletionButton, UncompleteButton } from './CompletionButton'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

interface HideoutProgressItemProps {
	module: HideoutModule
	currentLevel: number // 0-based: 0 means no levels completed
	maxLevel: number
	onCompleteLevel: (moduleId: string, level: number) => void
	onUncompleteLevel: (moduleId: string, level: number) => void
	allItems: Item[]
	remainingQuantities?: Record<string, number>
}

export function HideoutProgressItem({
	module,
	currentLevel,
	maxLevel,
	onCompleteLevel,
	onUncompleteLevel,
	allItems,
	remainingQuantities,
}: HideoutProgressItemProps) {
	// Get the next level to complete
	const nextLevel = currentLevel + 1
	const levelData = module.levels.find(l => l.level === nextLevel)
	const isMaxLevel = currentLevel === maxLevel

	return (
		<div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
			{/* Header */}
			<div className="mb-3 flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h3 className="text-lg font-semibold text-white">{module.name.en}</h3>
						{isMaxLevel && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
					</div>
					<div className="mt-1 flex items-center gap-2">
						<Badge color="blue">
							Level {currentLevel}/{maxLevel}
						</Badge>
						{!isMaxLevel && levelData && <Badge color="purple">Next: Level {nextLevel}</Badge>}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					{currentLevel > 0 && (
						<UncompleteButton onUncomplete={() => onUncompleteLevel(module.id, currentLevel)} />
					)}
					{!isMaxLevel && levelData && (
						<CompletionButton
							isCompleted={false}
							onToggle={() => onCompleteLevel(module.id, nextLevel)}
						/>
					)}
				</div>
			</div>

			{/* Next Level Requirements */}
			{!isMaxLevel && levelData && (
				<div>
					<p className="mb-2 text-sm font-medium text-zinc-400">
						Requirements for Level {nextLevel}:
					</p>

					{levelData.requirementItemIds && levelData.requirementItemIds.length > 0 ? (
						<RequiredItemsList
							requirements={levelData.requirementItemIds}
							allItems={allItems}
							remainingQuantities={remainingQuantities}
						/>
					) : (
						<p className="text-sm italic text-zinc-500">No items required</p>
					)}

					{/* Other requirements (if any) */}
					{levelData.otherRequirements && levelData.otherRequirements.length > 0 && (
						<div className="mt-2">
							<p className="mb-1 text-sm font-medium text-zinc-400">Other:</p>
							<ul className="list-inside list-disc space-y-1">
								{levelData.otherRequirements.map((req, idx) => (
									<li key={idx} className="text-sm text-zinc-300">
										{req}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}

			{isMaxLevel && (
				<div className="text-sm font-medium text-green-500">✓ Maximum level reached</div>
			)}
		</div>
	)
}

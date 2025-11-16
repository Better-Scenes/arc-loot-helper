/**
 * ProjectProgressItem Component
 * Displays project with phase progression
 */

import type { Project, Item } from '../data/types'
import { Badge } from './badge'
import { RequiredItemsList } from './RequiredItemsList'
import { CompletionButton, UncompleteButton } from './CompletionButton'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

interface ProjectProgressItemProps {
	project: Project
	currentPhase: number
	totalPhases: number
	onCompletePhase: (projectId: string, phase: number) => void
	onUncompletePhase: (projectId: string, phase: number) => void
	allItems: Item[]
	remainingQuantities?: Record<string, number>
}

export function ProjectProgressItem({
	project,
	currentPhase,
	totalPhases,
	onCompletePhase,
	onUncompletePhase,
	allItems,
	remainingQuantities,
}: ProjectProgressItemProps) {
	const nextPhase = currentPhase + 1
	const phaseData = project.phases.find(p => p.phase === nextPhase)
	const isComplete = currentPhase === totalPhases

	return (
		<div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
			{/* Header */}
			<div className="mb-3 flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h3 className="text-lg font-semibold text-white">{project.name.en}</h3>
						{isComplete && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
					</div>
					<p className="mt-1 text-sm text-zinc-400">{project.description.en}</p>
					<div className="mt-2 flex items-center gap-2">
						<Badge color="blue">
							Phase {currentPhase}/{totalPhases}
						</Badge>
						{!isComplete && phaseData && <Badge color="purple">Next: {phaseData.name.en}</Badge>}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					{currentPhase > 0 && (
						<UncompleteButton onUncomplete={() => onUncompletePhase(project.id, currentPhase)} />
					)}
					{!isComplete && phaseData && (
						<CompletionButton isCompleted={false} onToggle={() => onCompletePhase(project.id, nextPhase)} />
					)}
				</div>
			</div>

			{/* Next Phase Requirements */}
			{!isComplete && phaseData && (
				<div>
					<p className="mb-2 text-sm font-medium text-zinc-400">Requirements for {phaseData.name.en}:</p>

					{phaseData.requirementItemIds && phaseData.requirementItemIds.length > 0 ? (
						<RequiredItemsList
							requirements={phaseData.requirementItemIds}
							allItems={allItems}
							remainingQuantities={remainingQuantities}
						/>
					) : (
						<p className="text-sm italic text-zinc-500">No specific items required</p>
					)}

					{/* Category requirements */}
					{phaseData.requirementCategories && (
						<div className="mt-2">
							<p className="mb-1 text-sm font-medium text-zinc-400">Category Requirements:</p>
							<div className="flex flex-wrap gap-2">
								{Object.entries(phaseData.requirementCategories).map(([category, value]) => (
									<Badge key={category} color="orange">
										{category}: {value.toLocaleString()}
									</Badge>
								))}
							</div>
						</div>
					)}

					{phaseData.description && (
						<p className="mt-2 text-sm italic text-zinc-400">{phaseData.description.en}</p>
					)}
				</div>
			)}

			{isComplete && <div className="text-sm font-medium text-green-500">✓ Project complete</div>}
		</div>
	)
}

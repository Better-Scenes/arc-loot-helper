/**
 * ProjectProgressList Component
 * Lists projects with phase tracking
 */

import { useMemo } from 'react'
import type { Project, Item } from '../data/types'
import { useProgressStore } from '../stores/progressStore'
import { useRemainingRequirementsStore } from '../stores/remainingRequirementsStore'
import { ProjectProgressItem } from './ProjectProgressItem'

interface ProjectProgressListProps {
	projects: Project[]
	allItems: Item[]
	hideCompleted: boolean
}

export function ProjectProgressList({
	projects,
	allItems,
	hideCompleted,
}: ProjectProgressListProps) {
	// Subscribe to progress data to trigger re-renders when it changes
	const progress = useProgressStore(state => state.progress)

	const isProjectPhaseCompleted = useProgressStore(state => state.isProjectPhaseCompleted)
	const completeProjectPhase = useProgressStore(state => state.completeProjectPhase)
	const uncompleteProjectPhase = useProgressStore(state => state.uncompleteProjectPhase)
	const remaining = useRemainingRequirementsStore(state => state.remaining)

	// Calculate current phase for each project
	const projectsWithProgress = useMemo(() => {
		return projects.map(project => {
			let currentPhase = 0
			const totalPhases = project.phases.length

			// Find highest completed phase
			for (let phase = 1; phase <= totalPhases; phase++) {
				if (isProjectPhaseCompleted(project.id, phase)) {
					currentPhase = phase
				} else {
					break // Phases must be completed in order
				}
			}

			return {
				project,
				currentPhase,
				totalPhases,
				isComplete: currentPhase === totalPhases,
			}
		})
	}, [projects, progress, isProjectPhaseCompleted])

	// Filter based on hideCompleted and sort by project name
	const visibleProjects = useMemo(() => {
		const filtered = hideCompleted
			? projectsWithProgress.filter(({ isComplete }) => !isComplete)
			: projectsWithProgress

		// Sort by project name for stable ordering
		return filtered.sort((a, b) => a.project.name.en.localeCompare(b.project.name.en))
	}, [projectsWithProgress, hideCompleted])

	if (visibleProjects.length === 0) {
		return (
			<div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
				<p className="text-center text-zinc-500">
					{hideCompleted ? 'All projects complete! 🎉' : 'No projects available'}
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			{visibleProjects.map(({ project, currentPhase, totalPhases }) => (
				<ProjectProgressItem
					key={project.id}
					project={project}
					currentPhase={currentPhase}
					totalPhases={totalPhases}
					onCompletePhase={completeProjectPhase}
					onUncompletePhase={uncompleteProjectPhase}
					allItems={allItems}
					remainingQuantities={remaining || undefined}
				/>
			))}
		</div>
	)
}

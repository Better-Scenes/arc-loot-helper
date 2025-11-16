/**
 * Progress Tracker Page
 * Track completion of quests, hideout modules, and projects
 */

import { useState, useMemo } from 'react'
import { Heading } from '../components/heading'
import { Text } from '../components/text'
import { Switch } from '../components/switch'
import { useGameData } from '../hooks/useGameData'
import { useProgressStore } from '../stores/progressStore'
import { ProgressStats } from '../components/ProgressStats'
import { ProgressSection } from '../components/ProgressSection'
import { QuestProgressList } from '../components/QuestProgressList'
import { HideoutProgressList } from '../components/HideoutProgressList'
import { ProjectProgressList } from '../components/ProjectProgressList'

export function ProgressTracker() {
	const { data, loading, error } = useGameData()
	const [hideCompletedQuests, setHideCompletedQuests] = useState(true)

	// Subscribe to progress data to trigger re-renders when it changes
	const progress = useProgressStore(state => state.progress)

	// Get progress store methods
	const isQuestCompleted = useProgressStore(state => state.isQuestCompleted)
	const isHideoutLevelCompleted = useProgressStore(state => state.isHideoutLevelCompleted)
	const isProjectPhaseCompleted = useProgressStore(state => state.isProjectPhaseCompleted)

	// Calculate completion statistics
	const stats = useMemo(() => {
		if (!data) {
			return {
				quests: { total: 0, completed: 0 },
				hideout: { total: 0, completed: 0 },
				projects: { total: 0, completed: 0 },
			}
		}

		// Quest stats
		const questsCompleted = data.quests.filter(q => isQuestCompleted(q.id)).length

		// Hideout stats (count individual level upgrades)
		let totalHideoutLevels = 0
		let completedHideoutLevels = 0
		data.hideoutModules.forEach(m => {
			totalHideoutLevels += m.maxLevel
			for (let level = 1; level <= m.maxLevel; level++) {
				if (isHideoutLevelCompleted(m.id, level)) {
					completedHideoutLevels++
				}
			}
		})

		// Project stats (count individual phase upgrades)
		let totalProjectPhases = 0
		let completedProjectPhases = 0
		data.projects.forEach(p => {
			const totalPhases = p.phases.length
			totalProjectPhases += totalPhases
			for (let phase = 1; phase <= totalPhases; phase++) {
				if (isProjectPhaseCompleted(p.id, phase)) {
					completedProjectPhases++
				}
			}
		})

		return {
			quests: { total: data.quests.length, completed: questsCompleted },
			hideout: { total: totalHideoutLevels, completed: completedHideoutLevels },
			projects: { total: totalProjectPhases, completed: completedProjectPhases },
		}
	}, [data, progress, isQuestCompleted, isHideoutLevelCompleted, isProjectPhaseCompleted])

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

	const quests = data?.quests || []
	const hideoutModules = data?.hideoutModules || []
	const projects = data?.projects || []
	const items = data?.items || []

	return (
		<div className="space-y-8">
			{/* Overall Statistics */}
			<ProgressStats stats={stats} />

			{/* Progress Sections */}
			<ProgressSection
				title="Quests"
				totalCount={stats.quests.total}
				completedCount={stats.quests.completed}
				defaultCollapsed={false}
				headerControls={
					<div className="flex items-center gap-3">
						<label htmlFor="hide-completed-quests" className="text-sm text-zinc-400">
							Hide Completed
						</label>
						<Switch
							id="hide-completed-quests"
							checked={hideCompletedQuests}
							onChange={setHideCompletedQuests}
						/>
					</div>
				}
			>
				<QuestProgressList quests={quests} allItems={items} hideCompleted={hideCompletedQuests} />
			</ProgressSection>

			<ProgressSection
				title="Hideout Modules"
				totalCount={stats.hideout.total}
				completedCount={stats.hideout.completed}
				defaultCollapsed={false}
			>
				<HideoutProgressList modules={hideoutModules} allItems={items} hideCompleted={false} />
			</ProgressSection>

			<ProgressSection
				title="Projects"
				totalCount={stats.projects.total}
				completedCount={stats.projects.completed}
				defaultCollapsed={false}
			>
				<ProjectProgressList projects={projects} allItems={items} hideCompleted={false} />
			</ProgressSection>
		</div>
	)
}

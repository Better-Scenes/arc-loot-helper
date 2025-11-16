/**
 * ProgressStats Component
 * Displays overall completion statistics
 */

import { Badge } from './badge'
import { Text } from './text'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

interface ProgressStatsProps {
	stats: {
		quests: { total: number; completed: number }
		hideout: { total: number; completed: number }
		projects: { total: number; completed: number }
	}
}

export function ProgressStats({ stats }: ProgressStatsProps) {
	const totalItems = stats.quests.total + stats.hideout.total + stats.projects.total
	const totalCompleted = stats.quests.completed + stats.hideout.completed + stats.projects.completed
	const overallPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0

	return (
		<div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
			<div className="mb-4 flex items-center justify-between">
				<Text className="text-lg font-semibold text-white">Overall Progress</Text>
				<Badge color={overallPercentage === 100 ? 'green' : 'blue'}>
					{overallPercentage}% Complete
				</Badge>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				{/* Quests */}
				<div className="rounded-lg bg-zinc-800 p-4">
					<div className="mb-2 flex items-center gap-2">
						<Text className="font-medium text-white">Quests</Text>
						{stats.quests.completed === stats.quests.total && (
							<CheckCircleIcon className="h-5 w-5 text-green-500" />
						)}
					</div>
					<div className="flex items-baseline gap-2">
						<Text className="text-2xl font-bold text-white">{stats.quests.completed}</Text>
						<Text className="text-zinc-400">/ {stats.quests.total}</Text>
					</div>
					<div className="mt-2 h-2 rounded-full bg-zinc-700">
						<div
							className="h-full rounded-full bg-blue-600 transition-all"
							style={{
								width: `${stats.quests.total > 0 ? (stats.quests.completed / stats.quests.total) * 100 : 0}%`,
							}}
						/>
					</div>
				</div>

				{/* Hideout */}
				<div className="rounded-lg bg-zinc-800 p-4">
					<div className="mb-2 flex items-center gap-2">
						<Text className="font-medium text-white">Hideout</Text>
						{stats.hideout.completed === stats.hideout.total && (
							<CheckCircleIcon className="h-5 w-5 text-green-500" />
						)}
					</div>
					<div className="flex items-baseline gap-2">
						<Text className="text-2xl font-bold text-white">{stats.hideout.completed}</Text>
						<Text className="text-zinc-400">/ {stats.hideout.total}</Text>
					</div>
					<div className="mt-2 h-2 rounded-full bg-zinc-700">
						<div
							className="h-full rounded-full bg-purple-600 transition-all"
							style={{
								width: `${stats.hideout.total > 0 ? (stats.hideout.completed / stats.hideout.total) * 100 : 0}%`,
							}}
						/>
					</div>
				</div>

				{/* Projects */}
				<div className="rounded-lg bg-zinc-800 p-4">
					<div className="mb-2 flex items-center gap-2">
						<Text className="font-medium text-white">Projects</Text>
						{stats.projects.completed === stats.projects.total && (
							<CheckCircleIcon className="h-5 w-5 text-green-500" />
						)}
					</div>
					<div className="flex items-baseline gap-2">
						<Text className="text-2xl font-bold text-white">{stats.projects.completed}</Text>
						<Text className="text-zinc-400">/ {stats.projects.total}</Text>
					</div>
					<div className="mt-2 h-2 rounded-full bg-zinc-700">
						<div
							className="h-full rounded-full bg-orange-600 transition-all"
							style={{
								width: `${stats.projects.total > 0 ? (stats.projects.completed / stats.projects.total) * 100 : 0}%`,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

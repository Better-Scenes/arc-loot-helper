/**
 * ProgressSection Component
 * Reusable collapsible section for quest/hideout/project progress
 */

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
	headerControls?: React.ReactNode
}

export function ProgressSection({
	title,
	totalCount,
	completedCount,
	children,
	defaultCollapsed = false,
	headerControls,
}: ProgressSectionProps) {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
	const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

	return (
		<div className="space-y-4">
			{/* Section Header - Clickable to collapse/expand */}
			<div className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-zinc-900 px-4 py-3">
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="flex flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
					aria-expanded={!isCollapsed}
				>
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
					{isCollapsed ? (
						<ChevronDownIcon className="h-5 w-5 text-zinc-400" />
					) : (
						<ChevronUpIcon className="h-5 w-5 text-zinc-400" />
					)}
				</button>

				{headerControls && <div className="ml-4">{headerControls}</div>}
			</div>

			{/* Section Content */}
			{!isCollapsed && <div className="space-y-3">{children}</div>}
		</div>
	)
}

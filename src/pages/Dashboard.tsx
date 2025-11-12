/**
 * Dashboard Page - Overview and statistics
 */

import { Heading } from '../components/heading'
import { Text } from '../components/text'

export function Dashboard() {
	return (
		<div>
			<Heading>Dashboard</Heading>
			<Text className="mt-2">
				Welcome to ARC Raiders Loot Helper! This tool helps you make informed looting decisions.
			</Text>

			<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg border border-zinc-950/5 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-zinc-900">
					<Text className="text-xs/6 font-medium text-zinc-500 dark:text-zinc-400">
						Total Items
					</Text>
					<div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">366</div>
				</div>

				<div className="rounded-lg border border-zinc-950/5 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-zinc-900">
					<Text className="text-xs/6 font-medium text-zinc-500 dark:text-zinc-400">
						Items Needed
					</Text>
					<div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">68</div>
				</div>

				<div className="rounded-lg border border-zinc-950/5 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-zinc-900">
					<Text className="text-xs/6 font-medium text-zinc-500 dark:text-zinc-400">
						Total Quantity
					</Text>
					<div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">1,215</div>
				</div>
			</div>
		</div>
	)
}

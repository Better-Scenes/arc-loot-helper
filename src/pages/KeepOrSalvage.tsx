/**
 * Keep or Salvage Page - Shows which items to keep for progression
 */

import { Heading } from '../components/heading'
import { Text } from '../components/text'

export function KeepOrSalvage() {
	return (
		<div>
			<Heading>Keep or Salvage</Heading>
			<Text className="mt-2">
				Identify which items you need for quests, hideout upgrades, and projects - and which are
				safe to salvage.
			</Text>

			<div className="mt-8">
				<Text className="text-sm text-zinc-500 dark:text-zinc-400">
					Priority indicators and item lists coming soon...
				</Text>
			</div>
		</div>
	)
}

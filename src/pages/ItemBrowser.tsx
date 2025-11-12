/**
 * Item Browser Page - Search and filter all items
 */

import { Heading } from '../components/heading'
import { Text } from '../components/text'

export function ItemBrowser() {
	return (
		<div>
			<Heading>Item Browser</Heading>
			<Text className="mt-2">Browse, search, and filter all 366 items in ARC Raiders.</Text>

			<div className="mt-8">
				<Text className="text-sm text-zinc-500 dark:text-zinc-400">
					Search and filter components coming soon...
				</Text>
			</div>
		</div>
	)
}

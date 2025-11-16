/**
 * RequiredItemsList Component
 * Displays list of required items with quantities and remaining counts
 */

import type { Item, ItemRequirementEntry } from '../data/types'
import { ItemIcon } from './ItemIcon'
import { Badge } from './badge'

interface RequiredItemsListProps {
	requirements?: ItemRequirementEntry[]
	allItems: Item[]
	remainingQuantities?: Record<string, number>
}

export function RequiredItemsList({
	requirements,
	allItems,
	remainingQuantities,
}: RequiredItemsListProps) {
	if (!requirements || requirements.length === 0) {
		return <div className="text-sm italic text-zinc-500">No items required</div>
	}

	// Create item lookup map
	const itemMap = new Map(allItems.map(item => [item.id, item]))

	return (
		<div className="flex flex-wrap gap-2">
			{requirements.map(({ itemId, quantity }) => {
				const item = itemMap.get(itemId)
				const remaining = remainingQuantities?.[itemId]
				const isComplete = remaining !== undefined && remaining === 0

				return (
					<div
						key={itemId}
						className="flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-900 px-2 py-1"
					>
						<ItemIcon imageUrl={item?.imageFilename} itemName={item?.name?.en || itemId} rarity={item?.rarity} size="sm" />
						<span className={`text-sm ${isComplete ? 'text-zinc-500 line-through' : 'text-white'}`}>
							{item?.name?.en || itemId}
						</span>
						<Badge color={isComplete ? 'zinc' : 'blue'}>×{quantity}</Badge>
					</div>
				)
			})}
		</div>
	)
}

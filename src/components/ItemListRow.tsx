/**
 * ItemListRow Component
 * Condensed list view for items - displays key information in a compact row
 */

import type { Item } from '../data/types'
import { ItemIcon } from './ItemIcon'
import { Badge } from './badge'

interface ItemListRowProps {
	item: Item
	quantityNeeded?: number
	requiredFor?: Array<'quests' | 'hideout' | 'projects'>
}

/**
 * Get rarity badge color based on rarity
 */
function getRarityColor(
	rarity: string | undefined
): 'zinc' | 'green' | 'blue' | 'orange' | 'purple' {
	if (!rarity) return 'zinc'
	const rarityLower = rarity.toLowerCase()
	if (rarityLower === 'common') return 'zinc'
	if (rarityLower === 'uncommon') return 'green'
	if (rarityLower === 'rare') return 'blue'
	if (rarityLower === 'legendary') return 'orange'
	if (rarityLower === 'epic') return 'purple'
	return 'zinc'
}

export function ItemListRow({ item, quantityNeeded, requiredFor }: ItemListRowProps) {
	const rarityColor = getRarityColor(item.rarity)
	const isSafeToSalvage = !requiredFor || requiredFor.length === 0
	const stackSize = item.stackSize || 1

	const imageUrl =
		item.imageFilename ||
		`https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/images/items/${item.id}.png`

	return (
		<div className="flex items-center gap-2 rounded border border-white/10 bg-zinc-900 px-2 py-1.5 transition hover:border-white/20 hover:bg-zinc-800">
			{/* Item Icon */}
			<ItemIcon
				imageUrl={imageUrl}
				itemName={item.name.en}
				rarity={item.rarity}
				size="xs"
			/>

			{/* Item Name & Category */}
			<div className="min-w-0 flex-1">
				<h3 className="truncate text-xs font-medium text-white">{item.name.en}</h3>
				<p className="truncate text-[10px] text-zinc-500">{item.category || 'Misc'}</p>
			</div>

			{/* Rarity and Type Badges */}
			<div className="flex flex-shrink-0 items-center gap-1">
				<Badge color={rarityColor} className="text-[10px] px-1.5 py-0.5">
					{item.rarity || 'Unknown'}
				</Badge>
				{item.type && (
					<Badge color="zinc" className="text-[10px] px-1.5 py-0.5">
						{item.type}
					</Badge>
				)}
			</div>

			{/* Value */}
			<div className="flex-shrink-0 text-right w-16">
				<div className="text-[10px] text-zinc-500">Value</div>
				<div className="text-xs font-medium text-zinc-200">{item.value?.toLocaleString() || '0'}</div>
			</div>

			{/* Weight */}
			<div className="flex-shrink-0 text-right w-14">
				<div className="text-[10px] text-zinc-500">Weight</div>
				<div className="text-xs font-medium text-zinc-200">{item.weightKg ?? 0} kg</div>
			</div>

			{/* $/kg */}
			<div className="flex-shrink-0 text-right w-16">
				<div className="text-[10px] text-zinc-500">$/kg</div>
				<div className="text-xs font-medium text-primary">
					{item.value && item.weightKg && item.weightKg > 0
						? Math.round(item.value / item.weightKg).toLocaleString()
						: item.value && !item.weightKg
							? '∞'
							: '0'}
				</div>
			</div>

			{/* Status Badge */}
			<div className="flex-shrink-0">
				{isSafeToSalvage ? (
					<Badge color="green" className="text-[10px] px-1.5 py-0.5">
						Safe
					</Badge>
				) : (
					<Badge color="blue" className="text-[10px] px-1.5 py-0.5">
						Need {quantityNeeded && `×${quantityNeeded}`}
					</Badge>
				)}
			</div>
		</div>
	)
}

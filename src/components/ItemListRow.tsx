/**
 * ItemListRow Component
 * Condensed list view for items - displays key information in a compact row
 */

import type { Item } from '../data/types'
import { ItemIcon } from './ItemIcon'
import { Badge } from './badge'

interface ItemListRowProps {
	item: Item
	requirements?: {
		total: number
		quests: number
		hideout: number
		projects: number
		sources: Set<'quests' | 'hideout' | 'projects'>
	}
	usedInRecipes?: Array<{ itemId: string; itemName: string; quantity: number }>
	recycledFrom?: Array<{ itemId: string; itemName: string; recycleQty?: number; salvageQty?: number }>
}

/**
 * Header row for the item list table
 */
export function ItemListHeader() {
	return (
		<div className="grid grid-cols-[48px_minmax(150px,200px)_220px_80px_70px_80px_minmax(200px,1fr)] items-center gap-3 rounded-t border border-b-0 border-white/10 bg-zinc-800/50 px-3 py-2">
			<div className="text-center text-[10px] font-medium text-zinc-400">Icon</div>
			<div className="text-left text-[10px] font-medium text-zinc-400">Item Name</div>
			<div className="text-left text-[10px] font-medium text-zinc-400">Rarity / Category</div>
			<div className="text-right text-[10px] font-medium text-zinc-400">Value</div>
			<div className="text-right text-[10px] font-medium text-zinc-400">Weight</div>
			<div className="text-right text-[10px] font-medium text-zinc-400">$/kg</div>
			<div className="text-left text-[10px] font-medium text-zinc-400">Properties</div>
		</div>
	)
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

export function ItemListRow({ item, requirements, usedInRecipes, recycledFrom }: ItemListRowProps) {
	const rarityColor = getRarityColor(item.rarity)
	const isNotRequired = !requirements
	const isRequired = !!requirements
	const isIngredient = usedInRecipes && usedInRecipes.length > 0
	const isCraftable = !!item.recipe
	const isReclaimed = recycledFrom && recycledFrom.length > 0
	const isRecyclable = (item.recyclesInto && Object.keys(item.recyclesInto).length > 0) || (item.salvagesInto && Object.keys(item.salvagesInto).length > 0)
	const stackSize = item.stackSize || 1

	const imageUrl =
		item.imageFilename ||
		`https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/images/items/${item.id}.png`

	return (
		<div className="grid grid-cols-[48px_minmax(150px,200px)_220px_80px_70px_80px_minmax(200px,1fr)] items-center gap-3 border-b border-l border-r border-white/10 bg-zinc-900 px-3 py-2 transition last:rounded-b hover:border-white/20 hover:bg-zinc-800">
			{/* Item Icon */}
			<div className="flex items-center justify-center">
				<ItemIcon
					imageUrl={imageUrl}
					itemName={item.name.en}
					rarity={item.rarity}
					size="xs"
				/>
			</div>

			{/* Item Name */}
			<div className="min-w-0">
				<h3 className="truncate text-xs font-medium text-white">{item.name.en}</h3>
			</div>

			{/* Rarity & Category (in same column, separate badges) */}
			<div className="flex items-center gap-1">
				<Badge color={rarityColor} className="text-[10px] px-1.5 py-0.5">
					{item.rarity || 'Unknown'}
				</Badge>
				<Badge color="zinc" className="text-[10px] px-1.5 py-0.5">
					{item.category || 'Misc'}
				</Badge>
			</div>

			{/* Value */}
			<div className="text-right">
				<div className="text-xs font-medium text-zinc-200">{item.value?.toLocaleString() || '0'}</div>
			</div>

			{/* Weight */}
			<div className="text-right">
				<div className="text-xs font-medium text-zinc-200">{item.weightKg ?? 0} kg</div>
			</div>

			{/* $/kg */}
			<div className="text-right">
				<div className="text-xs font-medium text-primary">
					{item.value && item.weightKg && item.weightKg > 0
						? Math.round(item.value / item.weightKg).toLocaleString()
						: item.value && !item.weightKg
							? '∞'
							: '0'}
				</div>
			</div>

			{/* Status Badges */}
			<div className="flex flex-wrap items-center gap-1">
				{isRequired && (
					<Badge
						color="blue"
						className="text-[10px] px-1.5 py-0.5"
						title={`Required: ${requirements.quests > 0 ? `${requirements.quests} for quests` : ''}${requirements.quests > 0 && (requirements.hideout > 0 || requirements.projects > 0) ? ', ' : ''}${requirements.hideout > 0 ? `${requirements.hideout} for hideout` : ''}${requirements.hideout > 0 && requirements.projects > 0 ? ', ' : ''}${requirements.projects > 0 ? `${requirements.projects} for projects` : ''} (Total: ×${requirements.total})`}
					>
						Required
					</Badge>
				)}

				{isNotRequired && (
					<Badge
						color="green"
						className="text-[10px] px-1.5 py-0.5"
						title="This item is not required for any quests, hideout upgrades, or projects"
					>
						Not Required
					</Badge>
				)}

				{isIngredient && (
					<Badge
						color="purple"
						className="text-[10px] px-1.5 py-0.5"
						title="This item is used as an ingredient in crafting recipes"
					>
						Ingredient
					</Badge>
				)}

				{isCraftable && (
					<Badge
						color="sky"
						className="text-[10px] px-1.5 py-0.5"
						title="This item can be crafted from other items"
					>
						Craftable
					</Badge>
				)}

				{isReclaimed && (
					<Badge
						color="lime"
						className="text-[10px] px-1.5 py-0.5"
						title="This item can be obtained by recycling or salvaging other items"
					>
						Reclaimed
					</Badge>
				)}

				{isRecyclable && (
					<Badge
						color="lime"
						className="text-[10px] px-1.5 py-0.5"
						title="This item can be recycled or salvaged into materials"
					>
						Recyclable
					</Badge>
				)}
			</div>
		</div>
	)
}

/**
 * ItemCard Component
 * Displays a single item with its properties, rarity, and requirement status
 */

import { useState, memo, useMemo, Profiler } from 'react'
import type { Item } from '../data/types'
import { Badge } from './badge'
import { ItemIcon } from './ItemIcon'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid'
import { calculateValuePerWeight } from '../utils/valueWeightCalculator'
import { onRenderCallback } from '../utils/profiler'

interface ItemCardProps {
	item: Item
	requirements?: {
		total: number
		quests: number
		hideout: number
		projects: number
		sources: Set<'quests' | 'hideout' | 'projects'>
	}
	usedInRecipes?: Array<{ itemId: string; itemName: string; quantity: number }>
	recycledFrom?: Array<{
		itemId: string
		itemName: string
		recycleQty: number
	}>
	allItems: Item[]
	itemValueMap: Map<string, number>
	showDetails?: boolean
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

/**
 * ItemCard displays item information in a card layout
 */
export const ItemCard = memo(function ItemCard({
	item,
	requirements,
	usedInRecipes,
	recycledFrom,
	allItems,
	itemValueMap,
	showDetails = false,
}: ItemCardProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const rarityColor = getRarityColor(item.rarity)
	const isNotRequired = !requirements
	const isRequired = !!requirements
	const isIngredient = usedInRecipes && usedInRecipes.length > 0
	const isCraftable = !!item.recipe
	const isReclaimed = recycledFrom && recycledFrom.length > 0
	const isRecyclable = item.recyclesInto && Object.keys(item.recyclesInto).length > 0
	const stackSize = item.stackSize || 1

	// Calculate salvage value (memoized to avoid recalculation on every render)
	const salvageInfo = useMemo(() => {
		if (!item.recyclesInto) return null

		let recycleValue = 0
		const recycleBreakdown: Array<{ itemId: string; quantity: number; value: number; total: number }> = []

		for (const [componentId, quantity] of Object.entries(item.recyclesInto)) {
			const componentValue = itemValueMap.get(componentId) || 0
			const total = componentValue * quantity
			recycleValue += total
			recycleBreakdown.push({
				itemId: componentId,
				quantity,
				value: componentValue,
				total,
			})
		}

		return { recycleValue, recycleBreakdown }
	}, [item.recyclesInto, itemValueMap])

	const salvageEfficiency = useMemo(() => {
		if (!salvageInfo || !item.value || item.value === 0) {
			return null
		}
		return (salvageInfo.recycleValue / item.value) * 100
	}, [salvageInfo, item.value])

	// Show details if either globally enabled OR locally expanded
	const shouldShowDetails = showDetails || isExpanded

	// Helper to get item name by ID
	const getItemName = (itemId: string): string => {
		const foundItem = allItems.find(i => i.id === itemId)
		return foundItem?.name.en || itemId
	}

	// Get recycle breakdown data
	const breakdownItems = (() => {
		const items: Array<{ id: string; name: string; quantity: number }> = []

		if (item.recyclesInto) {
			for (const [id, qty] of Object.entries(item.recyclesInto)) {
				if (qty > 0) {
					items.push({ id, name: getItemName(id), quantity: qty })
				}
			}
		}

		return items
	})()

	// Check if there are any details to show
	const hasDetails =
		breakdownItems.length > 0 ||
		(recycledFrom && recycledFrom.length > 0) ||
		!!item.recipe ||
		(usedInRecipes && usedInRecipes.length > 0) ||
		(isRequired && requirements)

	return (
		<Profiler id={`ItemCard-${item.id}`} onRender={onRenderCallback}>
			<div className="group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition hover:border-white/20 hover:bg-zinc-800">
			<div className="p-4">
				{/* CORE INFO - Always Visible */}

				{/* Header with image, name and rarity */}
				<div className="mb-3 flex items-start gap-3">
					{/* Item Image */}
					<ItemIcon
						imageUrl={item.imageFilename}
						itemName={item.name.en}
						rarity={item.rarity}
						size="sm"
					/>

					{/* Name and Category */}
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-base font-semibold text-white">{item.name.en}</h3>
						<p className="mt-1 text-sm text-zinc-400">{item.category || 'Misc'}</p>
					</div>

					{/* Rarity and Type Badges */}
					<div className="flex flex-shrink-0 flex-col items-end gap-1">
						<Badge color={rarityColor}>{item.rarity || 'Unknown'}</Badge>
						{item.type && (
							<Badge color="zinc" className="text-xs">
								{item.type}
							</Badge>
						)}
					</div>
				</div>

				{/* Item Stats - Always Visible */}
				<div className="mb-3 border-t border-white/10 pt-3 grid grid-cols-3 gap-4 text-sm">
					{/* Top Row */}
					<div>
						<div className="text-zinc-500">Value</div>
						<div className="font-medium text-emerald-400">
							{item.value?.toLocaleString() || '0'}
						</div>
					</div>
					<div className="text-center">
						<div className="text-zinc-500">Max Stack</div>
						<div className="font-medium text-zinc-200">{stackSize}</div>
					</div>
					<div className="text-right">
						<div className="text-zinc-500">Weight</div>
						<div className="font-medium text-zinc-200">{item.weightKg ?? 0} kg</div>
					</div>

					{/* Bottom Row */}
					<div>
						{salvageInfo && salvageInfo.recycleValue > 0 ? (
							<>
								<div className="text-zinc-500">Recycle $</div>
								<div className="flex items-center gap-1">
									<span className="font-medium text-emerald-400">
										{salvageInfo.recycleValue.toLocaleString()}
									</span>
									{salvageEfficiency !== null && (
										<Badge
											color={
												salvageEfficiency > 100
													? 'sky'
													: salvageEfficiency >= 80
														? 'green'
														: salvageEfficiency >= 50
															? 'yellow'
															: 'red'
											}
										>
											{salvageEfficiency.toFixed(0)}%
										</Badge>
									)}
								</div>
							</>
						) : (
							<div className="invisible">
								<div className="text-zinc-500">-</div>
								<div>-</div>
							</div>
						)}
					</div>
					<div className="text-center">
						<div className="text-zinc-500">$/Stack</div>
						<div className="font-medium text-emerald-400">
							{item.value ? (item.value * stackSize).toLocaleString() : '0'}
						</div>
					</div>
					<div className="text-right">
						<div className="text-zinc-500">$/kg</div>
						<div className="font-medium text-emerald-400">
							{(() => {
								const valuePerWeight = calculateValuePerWeight(item)
								if (valuePerWeight === Infinity) return '∞'
								if (valuePerWeight === 0) return '0'
								return Math.round(valuePerWeight).toLocaleString()
							})()}
						</div>
					</div>
				</div>

				{/* Status Tags - Always Visible */}
				<div className="mb-3">
					<div className="flex flex-wrap items-center gap-2">
						{/* Requirement Status */}
						{isRequired && (
							<Badge
								color="blue"
								title="This item is required for quests, hideout upgrades, or projects"
							>
								Required
							</Badge>
						)}

						{isNotRequired && (
							<Badge
								color="green"
								title="This item is not required for any quests, hideout upgrades, or projects"
							>
								Not Required
							</Badge>
						)}

						{/* Meta Tags */}
						{isIngredient && (
							<Badge color="purple" title="This item is used as an ingredient in crafting recipes">
								Ingredient
							</Badge>
						)}

						{isCraftable && (
							<Badge color="sky" title="This item can be crafted from other items">
								Craftable
							</Badge>
						)}

						{isReclaimed && (
							<Badge
								color="lime"
								title="This item can be obtained by recycling or salvaging other items"
							>
								Reclaimed
							</Badge>
						)}

						{isRecyclable && (
							<Badge color="lime" title="This item can be recycled or salvaged into materials">
								Recyclable
							</Badge>
						)}
					</div>
				</div>

				{/* Toggle Details Button - Only show if there are details */}
				{hasDetails && (
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex w-full items-center justify-center gap-2 border-t border-white/10 pt-3 text-sm text-zinc-400 transition hover:text-zinc-200"
					>
						{shouldShowDetails ? (
							<>
								<ChevronUpIcon className="size-4" />
								Hide Details
							</>
						) : (
							<>
								<ChevronDownIcon className="size-4" />
								Show Details
							</>
						)}
					</button>
				)}

				{/* DETAILED INFO - Collapsible */}
				{shouldShowDetails && hasDetails && (
					<div className="pt-3">
						{/* Breaks Down Into */}
						{breakdownItems.length > 0 && (
							<div className="mb-3">
								<div className="mb-2 text-xs text-zinc-500">Recycles into:</div>
								<div className="flex flex-wrap gap-2">
									{breakdownItems.map(mat => (
										<Badge key={mat.id} color="lime">
											{mat.name} (×{mat.quantity})
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Recycled From */}
						{recycledFrom && recycledFrom.length > 0 && (
							<div className="mb-3">
								<div className="mb-2 text-xs text-zinc-500">Recycled from:</div>
								<div className="flex flex-wrap gap-2">
									{recycledFrom.map(source => (
										<Badge key={source.itemId} color="lime">
											{source.itemName} (×{source.recycleQty ?? 0})
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Crafted From */}
						{item.recipe && (
							<div className="mb-3">
								<div className="mb-2 text-xs text-zinc-500">
									Crafted from
									{(item.workbench || item.craftBench) &&
										` (${Array.isArray(item.craftBench) ? item.craftBench.join(', ') : item.workbench || item.craftBench})`}
									:
								</div>
								<div className="flex flex-wrap gap-2">
									{Object.entries(item.recipe).map(([ingredientId, quantity]) => {
										const ingredientName = getItemName(ingredientId)
										return (
											<Badge key={ingredientId} color="sky">
												{ingredientName} (×{quantity})
											</Badge>
										)
									})}
								</div>
							</div>
						)}

						{/* Used in Recipes */}
						{usedInRecipes && usedInRecipes.length > 0 && (
							<div className="mb-3">
								<div className="mb-2 text-xs text-zinc-500">Used in recipes:</div>
								<div className="flex flex-wrap gap-2">
									{usedInRecipes.map(recipe => (
										<Badge key={recipe.itemId} color="purple">
											{recipe.itemName} (×{recipe.quantity})
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Required In Section */}
						{isRequired && requirements && (
							<div className="mb-3">
								<div className="mb-2 text-xs text-zinc-500">Required in:</div>
								<div className="flex flex-wrap gap-2">
									{requirements.quests > 0 && (
										<Badge color="blue">Quests (×{requirements.quests})</Badge>
									)}
									{requirements.hideout > 0 && (
										<Badge color="blue">Hideout (×{requirements.hideout})</Badge>
									)}
									{requirements.projects > 0 && (
										<Badge color="blue">Projects (×{requirements.projects})</Badge>
									)}
									<Badge color="blue">Total (×{requirements.total})</Badge>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
		</Profiler>
	)
})

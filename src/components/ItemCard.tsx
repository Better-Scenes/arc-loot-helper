/**
 * ItemCard Component
 * Displays a single item with its properties, rarity, and requirement status
 */

import { useState } from 'react'
import type { Item } from '../data/types'
import { Badge } from './badge'
import { ItemIcon } from './ItemIcon'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid'

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
		recycleQty?: number
		salvageQty?: number
	}>
	allItems: Item[]
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
export function ItemCard({
	item,
	requirements,
	usedInRecipes,
	recycledFrom,
	allItems,
	showDetails = false,
}: ItemCardProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const rarityColor = getRarityColor(item.rarity)
	const isNotRequired = !requirements
	const isRequired = !!requirements
	const isIngredient = usedInRecipes && usedInRecipes.length > 0
	const isCraftable = !!item.recipe
	const isReclaimed = recycledFrom && recycledFrom.length > 0
	const isRecyclable =
		(item.recyclesInto && Object.keys(item.recyclesInto).length > 0) ||
		(item.salvagesInto && Object.keys(item.salvagesInto).length > 0)
	const stackSize = item.stackSize || 1

	// Show details if either globally enabled OR locally expanded
	const shouldShowDetails = showDetails || isExpanded

	// Helper to get item name by ID
	const getItemName = (itemId: string): string => {
		const foundItem = allItems.find(i => i.id === itemId)
		return foundItem?.name.en || itemId
	}

	// Combine recycle and salvage data
	const breakdownItems = (() => {
		const combined = new Map<string, { name: string; recycleQty?: number; salvageQty?: number }>()

		if (item.recyclesInto) {
			for (const [id, qty] of Object.entries(item.recyclesInto)) {
				if (qty > 0) {
					combined.set(id, { name: getItemName(id), recycleQty: qty })
				}
			}
		}

		if (item.salvagesInto) {
			for (const [id, qty] of Object.entries(item.salvagesInto)) {
				if (qty > 0) {
					const existing = combined.get(id)
					if (existing) {
						existing.salvageQty = qty
					} else {
						combined.set(id, { name: getItemName(id), salvageQty: qty })
					}
				}
			}
		}

		return Array.from(combined.entries()).map(([id, data]) => ({ id, ...data }))
	})()

	// Use imageFilename from data (arctracker.io CDN with complete coverage)
	// Fallback to GitHub if imageFilename is missing
	const imageUrl =
		item.imageFilename ||
		`https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/images/items/${item.id}.png`

	// Check if there are any details to show
	const hasDetails =
		breakdownItems.length > 0 ||
		(recycledFrom && recycledFrom.length > 0) ||
		!!item.recipe ||
		(usedInRecipes && usedInRecipes.length > 0) ||
		(isRequired && requirements)

	return (
		<div className="group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition hover:border-white/20 hover:bg-zinc-800">
			<div className="p-4">
				{/* CORE INFO - Always Visible */}

				{/* Header with image, name and rarity */}
				<div className="mb-3 flex items-start gap-3">
					{/* Item Image */}
					<ItemIcon imageUrl={imageUrl} itemName={item.name.en} rarity={item.rarity} size="sm" />

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
				<div className="mb-3 border-t border-white/10 pt-3 flex justify-between text-sm">
					<div>
						<div className="text-zinc-500">Value</div>
						<div className="font-medium text-zinc-200">{item.value?.toLocaleString() || '0'}</div>
					</div>
					<div>
						<div className="text-zinc-500">Weight</div>
						<div className="font-medium text-zinc-200">{item.weightKg ?? 0} kg</div>
						<div className="mt-2 text-zinc-500">Max Stack</div>
						<div className="font-medium text-zinc-200">{stackSize}</div>
					</div>
					<div className="text-right">
						<div className="text-zinc-500">$/kg</div>
						<div className="font-medium text-cyan-400">
							{item.value && item.weightKg && item.weightKg > 0
								? Math.round(item.value / item.weightKg).toLocaleString()
								: item.value && !item.weightKg
									? '∞'
									: '0'}
						</div>
						<div className="mt-2 text-zinc-500">$/Stack</div>
						<div className="font-medium text-emerald-400">
							{item.value ? (item.value * stackSize).toLocaleString() : '0'}
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
								<div className="mb-2 text-xs text-zinc-500">Breaks down into:</div>
								<div className="flex flex-wrap gap-2">
									{(() => {
										// Check if item can be salvaged (any salvageQty > 0)
										const canBeSalvaged = breakdownItems.some(mat => (mat.salvageQty ?? 0) > 0)

										return breakdownItems.map(mat => {
											const recycleQty = mat.recycleQty ?? 0
											const salvageQty = mat.salvageQty ?? 0

											// If item can be salvaged, show both values (with zeros)
											// If item can't be salvaged at all, only show recycle value
											const label = canBeSalvaged
												? `${mat.name} (×${recycleQty}/×${salvageQty})`
												: `${mat.name} (×${recycleQty})`

											return (
												<Badge key={mat.id} color="lime">
													{label}
												</Badge>
											)
										})
									})()}
								</div>
							</div>
						)}

						{/* Salvaged From */}
						{recycledFrom && recycledFrom.length > 0 && (
							<div className="mb-3">
								<div className="mb-2 text-xs text-zinc-500">Salvaged from:</div>
								<div className="flex flex-wrap gap-2">
									{recycledFrom.map(source => {
										const recycleQty = source.recycleQty ?? 0
										const salvageQty = source.salvageQty ?? 0

										// If any salvage value exists, show both; otherwise only recycle
										const label =
											salvageQty > 0
												? `${source.itemName} (×${recycleQty}/×${salvageQty})`
												: `${source.itemName} (×${recycleQty})`

										return (
											<Badge key={source.itemId} color="lime">
												{label}
											</Badge>
										)
									})}
								</div>
							</div>
						)}

						{/* Crafted From */}
						{item.recipe && (
							<div className="mb-3">
								<div className="mb-2 text-xs text-zinc-500">
									Crafted from
									{item.craftBench &&
										` (${Array.isArray(item.craftBench) ? item.craftBench.join(', ') : item.craftBench})`}
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
	)
}

/**
 * ItemCard Component
 * Displays a single item with its properties, rarity, and requirement status
 */

import type { Item } from '../data/types'
import { Badge } from './badge'
import { ItemIcon } from './ItemIcon'

interface ItemCardProps {
	item: Item
	quantityNeeded?: number
	requiredFor?: Array<'quests' | 'hideout' | 'projects'>
	usedInRecipes?: Array<{ itemId: string; itemName: string; quantity: number }>
	recycledFrom?: Array<{ itemId: string; itemName: string; recycleQty?: number; salvageQty?: number }>
	allItems: Item[]
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
 * Format requirement labels
 */
const requirementLabels = {
	quests: 'Quest',
	hideout: 'Hideout',
	projects: 'Project',
}

/**
 * ItemCard displays item information in a card layout
 */
export function ItemCard({ item, quantityNeeded, requiredFor, usedInRecipes, recycledFrom, allItems }: ItemCardProps) {
	const rarityColor = getRarityColor(item.rarity)
	const isSafeToSalvage = !requiredFor || requiredFor.length === 0
	const stackSize = item.stackSize || 1

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

	return (
		<div className="group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition hover:border-white/20 hover:bg-zinc-800">
			<div className="p-4">
				{/* Header with image, name and rarity */}
				<div className="mb-3 flex items-start gap-3">
					{/* Item Image */}
					<ItemIcon
						imageUrl={imageUrl}
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

				{/* Item stats */}
				<div className="mb-3 flex justify-between text-sm">
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

				{/* Breaks Down Into */}
				{breakdownItems.length > 0 && (
					<div className="mb-3 border-t border-white/10 pt-3">
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

				{/* Created From (Recycling) */}
				{recycledFrom && recycledFrom.length > 0 && (
					<div className="mb-3 border-t border-white/10 pt-3">
						<div className="mb-2 text-xs text-zinc-500">Created from:</div>
						<div className="flex flex-wrap gap-2">
							{recycledFrom.map(source => {
								const recycleQty = source.recycleQty ?? 0
								const salvageQty = source.salvageQty ?? 0

								// If any salvage value exists, show both; otherwise only recycle
								const label = salvageQty > 0
									? `${source.itemName} (×${recycleQty}/×${salvageQty})`
									: `${source.itemName} (×${recycleQty})`

								return (
									<Badge key={source.itemId} color="sky">
										{label}
									</Badge>
								)
							})}
						</div>
					</div>
				)}

				{/* Used in Recipes */}
				{usedInRecipes && usedInRecipes.length > 0 && (
					<div className="mb-3 border-t border-white/10 pt-3">
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

				{/* Requirement indicators */}
				{!isSafeToSalvage && (
					<div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
						<span className="text-xs text-zinc-500">Needed for:</span>
						{requiredFor?.map(req => (
							<Badge key={req} color="blue">
								{requirementLabels[req]}
							</Badge>
						))}
						{quantityNeeded && <Badge color="cyan">×{quantityNeeded}</Badge>}
					</div>
				)}

				{isSafeToSalvage && (
					<div className="border-t border-white/10 pt-3">
						<Badge color="green">Safe to Salvage</Badge>
					</div>
				)}
			</div>
		</div>
	)
}

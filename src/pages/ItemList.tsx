/**
 * ItemList Page - Main application view
 * Shows all items with flexible filtering and grouping controls
 */

import { useState, useMemo, useCallback, Profiler } from 'react'
import { Heading } from '../components/heading'
import { Text } from '../components/text'
import { SearchBar } from '../components/SearchBar'
import { ItemToolbar } from '../components/ItemToolbar'
import { type FilterState } from '../components/FilterControls'
import { ItemCard } from '../components/ItemCard'
import { ItemListRow, ItemListHeader } from '../components/ItemListRow'
import { VirtualizedItemGrid } from '../components/VirtualizedItemGrid'
import { VirtualizedItemList } from '../components/VirtualizedItemList'
import { useGameData } from '../hooks/useGameData'
import { NORMALIZED_TYPE_ORDER } from '../utils/normalizeGameData'
import type { Item } from '../data/types'
import { onRenderCallback } from '../utils/profiler'

/**
 * Main ItemList page component
 */
export function ItemList() {
	// Load game data
	const { data: gameData, loading, error } = useGameData()
	const items = gameData?.items || null
	const quests = gameData?.quests || null
	const hideoutModules = gameData?.hideoutModules || null
	const projects = gameData?.projects || null

	// UI state
	const [searchQuery, setSearchQuery] = useState('')
	const [filters, setFilters] = useState<FilterState>({
		groupBy: 'type',
		metaFilters: {
			required: 'ignore',
			quests: 'ignore',
			hideout: 'ignore',
			projects: 'ignore',
			craftable: 'ignore',
			ingredient: 'ignore',
			recyclable: 'ignore',
			reclaimed: 'ignore',
		},
		rarityFilters: {
			common: 'ignore',
			uncommon: 'ignore',
			rare: 'ignore',
			legendary: 'ignore',
			epic: 'ignore',
		},
		categoryFilters: {
			Augments: 'ignore',
			Shields: 'ignore',
			Weapons: 'ignore',
			Ammunition: 'ignore',
			'Weapon Mods': 'ignore',
			'Quick Use': 'ignore',
			Keys: 'ignore',
			'Crafting Materials': 'ignore',
			Misc: 'ignore',
		},
		sortField: 'rarity',
		sortDirection: 'desc',
		displayMode: 'grid',
		showDetails: false,
	})

	// Use API's usedIn relationships directly (no need to compute)
	const usedInRecipes = useMemo(() => {
		if (!items)
			return new Map<string, Array<{ itemId: string; itemName: string; quantity: number }>>()

		const recipeMap = new Map<
			string,
			Array<{ itemId: string; itemName: string; quantity: number }>
		>()

		// Each item has API's usedIn data embedded
		for (const item of items) {
			if (item.usedIn && item.usedIn.length > 0) {
				recipeMap.set(
					item.id,
					item.usedIn
						.filter(rel => rel.item) // Filter out any without item data
						.map(rel => ({
							itemId: rel.item!.id,
							itemName: rel.item!.name,
							quantity: rel.quantity,
						}))
				)
			}
		}

		return recipeMap
	}, [items])

	// Calculate what items recycle into this item
	const recycledFrom = useMemo(() => {
		if (!items)
			return new Map<string, Array<{ itemId: string; itemName: string; recycleQty: number }>>()

		// Deduplicate items first
		const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values())

		const recycleMap = new Map<
			string,
			Array<{ itemId: string; itemName: string; recycleQty: number }>
		>()

		for (const item of uniqueItems) {
			// Check recyclesInto
			if (item.recyclesInto) {
				for (const [materialId, quantity] of Object.entries(item.recyclesInto)) {
					if (quantity > 0) {
						if (!recycleMap.has(materialId)) {
							recycleMap.set(materialId, [])
						}
						recycleMap.get(materialId)!.push({
							itemId: item.id,
							itemName: item.name.en,
							recycleQty: quantity,
						})
					}
				}
			}
		}

		return recycleMap
	}, [items])

	// Create a shared item value lookup map (used by salvage calculations)
	const itemValueMap = useMemo(() => {
		if (!items) return new Map<string, number>()

		const valueMap = new Map<string, number>()
		for (const item of items) {
			valueMap.set(item.id, item.value || 0)
		}
		return valueMap
	}, [items])

	// Calculate item requirements
	const itemRequirements = useMemo(() => {
		if (!quests || !hideoutModules || !projects) return new Map()

		const requirements = new Map<
			string,
			{
				total: number
				quests: number
				hideout: number
				projects: number
				sources: Set<'quests' | 'hideout' | 'projects'>
			}
		>()

		// Aggregate quest requirements
		for (const quest of quests) {
			if (quest.requiredItemIds) {
				for (const entry of quest.requiredItemIds) {
					const current = requirements.get(entry.itemId) || {
						total: 0,
						quests: 0,
						hideout: 0,
						projects: 0,
						sources: new Set(),
					}
					current.total += entry.quantity
					current.quests += entry.quantity
					current.sources.add('quests')
					requirements.set(entry.itemId, current)
				}
			}
		}

		// Aggregate hideout requirements
		for (const module of hideoutModules) {
			for (const level of module.levels) {
				if (level.requirementItemIds) {
					for (const entry of level.requirementItemIds) {
						const current = requirements.get(entry.itemId) || {
							total: 0,
							quests: 0,
							hideout: 0,
							projects: 0,
							sources: new Set(),
						}
						current.total += entry.quantity
						current.hideout += entry.quantity
						current.sources.add('hideout')
						requirements.set(entry.itemId, current)
					}
				}
			}
		}

		// Aggregate project requirements
		for (const project of projects) {
			for (const phase of project.phases) {
				if (phase.requirementItemIds) {
					for (const entry of phase.requirementItemIds) {
						const current = requirements.get(entry.itemId) || {
							total: 0,
							quests: 0,
							hideout: 0,
							projects: 0,
							sources: new Set(),
						}
						current.total += entry.quantity
						current.projects += entry.quantity
						current.sources.add('projects')
						requirements.set(entry.itemId, current)
					}
				}
			}
		}

		return requirements
	}, [quests, hideoutModules, projects])

	// Filter and search items (deduplicated)
	const filteredItems = useMemo(() => {
		if (!items) return []

		// First deduplicate items by ID
		const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values())

		return uniqueItems.filter(item => {
			// Hide items without names (incomplete data)
			if (!item.name?.en) {
				return false
			}

			// Search filter
			if (searchQuery) {
				const itemName = item.name.en.toLowerCase()
				if (!itemName.includes(searchQuery.toLowerCase())) {
					return false
				}
			}

			// Rarity tri-state filters
			const itemRarity = item.rarity?.toLowerCase() as
				| 'common'
				| 'uncommon'
				| 'rare'
				| 'epic'
				| 'legendary'
				| undefined
			for (const [rarity, mode] of Object.entries(filters.rarityFilters)) {
				if (mode === 'ignore') continue

				const hasRarity = itemRarity === rarity

				// Include: must have this rarity
				if (mode === 'include' && !hasRarity) {
					return false
				}

				// Exclude: must NOT have this rarity
				if (mode === 'exclude' && hasRarity) {
					return false
				}
			}

			// Category tri-state filters
			const itemCategory = item.category as keyof typeof filters.categoryFilters | undefined
			for (const [category, mode] of Object.entries(filters.categoryFilters)) {
				if (mode === 'ignore') continue

				const hasCategory = itemCategory === category

				// Include: must have this category
				if (mode === 'include' && !hasCategory) {
					return false
				}

				// Exclude: must NOT have this category
				if (mode === 'exclude' && hasCategory) {
					return false
				}
			}

			// Meta filters (tri-state: include/exclude/ignore)
			const req = itemRequirements.get(item.id)
			const recipes = usedInRecipes.get(item.id)
			const sources = recycledFrom.get(item.id)

			// Item properties for filtering
			const itemProps = {
				required: !!req,
				quests: req?.sources.has('quests') || false,
				hideout: req?.sources.has('hideout') || false,
				projects: req?.sources.has('projects') || false,
				craftable: !!item.recipe,
				ingredient: !!recipes && recipes.length > 0,
				recyclable: !!item.recyclesInto && Object.keys(item.recyclesInto).length > 0,
				reclaimed: !!sources && sources.length > 0,
			}

			// Apply tri-state filter logic
			for (const [key, mode] of Object.entries(filters.metaFilters)) {
				if (mode === 'ignore') continue

				const hasProperty = itemProps[key as keyof typeof itemProps]

				// Include: must have the property
				if (mode === 'include' && !hasProperty) {
					return false
				}

				// Exclude: must NOT have the property
				if (mode === 'exclude' && hasProperty) {
					return false
				}
			}

			return true
		})
	}, [items, searchQuery, filters, itemRequirements, usedInRecipes, recycledFrom])

	// Sort items
	const sortedItems = useMemo(() => {
		const itemsCopy = [...filteredItems]
		const direction = filters.sortDirection === 'asc' ? 1 : -1

		switch (filters.sortField) {
			case 'name':
				return itemsCopy.sort((a, b) => {
					const nameA = a.name?.en || ''
					const nameB = b.name?.en || ''
					return nameA.localeCompare(nameB) * direction
				})
			case 'type':
				// Sort by category (meta group) using normalized type order
				return itemsCopy.sort((a, b) => {
					const categoryA = (a.category || 'Misc') as (typeof NORMALIZED_TYPE_ORDER)[number]
					const categoryB = (b.category || 'Misc') as (typeof NORMALIZED_TYPE_ORDER)[number]
					const indexA = NORMALIZED_TYPE_ORDER.indexOf(categoryA)
					const indexB = NORMALIZED_TYPE_ORDER.indexOf(categoryB)
					return (indexA - indexB) * direction
				})
			case 'rarity':
				// Sort by rarity (Legendary > Epic > Rare > Uncommon > Common)
				return itemsCopy.sort((a, b) => {
					const rarityOrder = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common', 'Unknown']
					const rarityA = a.rarity || 'Unknown'
					const rarityB = b.rarity || 'Unknown'
					const indexA = rarityOrder.indexOf(rarityA)
					const indexB = rarityOrder.indexOf(rarityB)
					const finalIndexA = indexA === -1 ? 999 : indexA
					const finalIndexB = indexB === -1 ? 999 : indexB
					// Invert direction: lower index = better rarity, so desc = ascending index
					return (finalIndexA - finalIndexB) * -direction
				})
			case 'value':
				return itemsCopy.sort((a, b) => {
					return ((a.value || 0) - (b.value || 0)) * direction
				})
			default:
				return itemsCopy
		}
	}, [filteredItems, filters.sortField, filters.sortDirection])

	// Group items
	const groupedItems = useMemo(() => {
		if (filters.groupBy === 'none') {
			return [{ title: 'All Items', items: sortedItems }]
		}

		if (filters.groupBy === 'rarity') {
			const groups = new Map<string, Item[]>()
			for (const item of sortedItems) {
				const rarity = item.rarity || 'Unknown'
				if (!groups.has(rarity)) groups.set(rarity, [])
				groups.get(rarity)!.push(item)
			}
			const rarityOrder = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common', 'Unknown']
			return Array.from(groups.entries())
				.sort(([a], [b]) => {
					const indexA = rarityOrder.indexOf(a)
					const indexB = rarityOrder.indexOf(b)
					return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
				})
				.map(([rarity, items]) => ({ title: rarity, items }))
		}

		if (filters.groupBy === 'type') {
			const groups = new Map<string, Item[]>()
			for (const item of sortedItems) {
				const category = item.category || 'Misc'
				if (!groups.has(category)) groups.set(category, [])
				groups.get(category)!.push(item)
			}
			// Sort by the normalized type order (game inventory order)
			return NORMALIZED_TYPE_ORDER.filter(cat => groups.has(cat)).map(category => ({
				title: category,
				items: groups.get(category)!,
			}))
		}

		if (filters.groupBy === 'requirement') {
			const groups: Record<string, Item[]> = {
				'Quest Items': [],
				'Hideout Items': [],
				'Project Items': [],
				'Not Required': [],
			}

			for (const item of sortedItems) {
				const req = itemRequirements.get(item.id)
				if (!req) {
					groups['Not Required'].push(item)
				} else {
					if (req.sources.has('quests')) groups['Quest Items'].push(item)
					if (req.sources.has('hideout')) groups['Hideout Items'].push(item)
					if (req.sources.has('projects')) groups['Project Items'].push(item)
				}
			}

			return Object.entries(groups)
				.filter(([, items]) => items.length > 0)
				.map(([title, items]) => ({ title, items }))
		}

		return [{ title: 'All Items', items: sortedItems }]
	}, [sortedItems, filters.groupBy, itemRequirements])

	// Handlers
	const handleSearch = useCallback((query: string) => {
		setSearchQuery(query)
	}, [])

	const handleFilterChange = useCallback((newFilters: FilterState) => {
		setFilters(newFilters)
	}, [])

	// Loading state
	if (loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Text className="text-zinc-400">Loading items...</Text>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="text-center">
					<Text className="text-red-400">Error loading data</Text>
					<Text className="mt-2 text-sm text-zinc-500">{error.message}</Text>
				</div>
			</div>
		)
	}

	// Use group-specific keys only for 'requirement' grouping (where items can appear in multiple groups)
	const needsGroupKey = filters.groupBy === 'requirement'

	// Use virtualization for better performance with many items
	const shouldVirtualize = filteredItems.length > 50

	return (
		<div>
			{/* Search and Toolbar */}
			<div className="mb-8 space-y-4">
				{/* Search */}
				<SearchBar onSearch={handleSearch} placeholder="Search items..." />

				{/* Compact Toolbar */}
				<ItemToolbar
					filters={filters}
					onFilterChange={handleFilterChange}
					itemCount={items?.length || 0}
					filteredCount={filteredItems.length}
				/>
			</div>

			{/* Item Groups - Virtualized or Standard */}
			{shouldVirtualize ? (
				// Virtualized rendering for large lists
				filters.displayMode === 'list' ? (
					<VirtualizedItemList
						groups={groupedItems}
						itemRequirements={itemRequirements}
						usedInRecipes={usedInRecipes}
						recycledFrom={recycledFrom}
						needsGroupKey={needsGroupKey}
					/>
				) : (
					<VirtualizedItemGrid
						groups={groupedItems}
						itemRequirements={itemRequirements}
						usedInRecipes={usedInRecipes}
						recycledFrom={recycledFrom}
						allItems={items || []}
						itemValueMap={itemValueMap}
						showDetails={filters.showDetails}
						needsGroupKey={needsGroupKey}
					/>
				)
			) : (
				// Standard rendering for small lists
				<div className="space-y-8">
					{groupedItems.map(group => (
						<div key={group.title}>
							<Heading level={2} className="mb-4">
								{group.title}
								<Text className="ml-2 inline text-zinc-500">({group.items.length})</Text>
							</Heading>

							{group.items.length === 0 ? (
								<div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
									<Text className="text-center text-zinc-500">No items match your filters</Text>
								</div>
							) : filters.displayMode === 'list' ? (
								<div>
									<ItemListHeader />
									<Profiler id={`list-${group.title}`} onRender={onRenderCallback}>
										<div>
											{group.items.map(item => {
												const req = itemRequirements.get(item.id)
												const recipes = usedInRecipes.get(item.id)
												const sources = recycledFrom.get(item.id)
												return (
													<ItemListRow
														key={needsGroupKey ? `${group.title}-${item.id}` : item.id}
														item={item}
														requirements={req}
														usedInRecipes={recipes}
														recycledFrom={sources}
													/>
												)
											})}
										</div>
									</Profiler>
								</div>
							) : (
								<Profiler id={`grid-${group.title}`} onRender={onRenderCallback}>
									<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
										{group.items.map(item => {
											const req = itemRequirements.get(item.id)
											const recipes = usedInRecipes.get(item.id)
											const sources = recycledFrom.get(item.id)
											return (
												<ItemCard
													key={needsGroupKey ? `${group.title}-${item.id}` : item.id}
													item={item}
													requirements={req}
													usedInRecipes={recipes}
													recycledFrom={sources}
													allItems={items || []}
													itemValueMap={itemValueMap}
													showDetails={filters.showDetails}
												/>
											)
										})}
									</div>
								</Profiler>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

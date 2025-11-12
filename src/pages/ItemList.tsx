/**
 * ItemList Page - Main application view
 * Shows all items with flexible filtering and grouping controls
 */

import { useState, useMemo, useCallback } from 'react'
import { Heading } from '../components/heading'
import { Text } from '../components/text'
import { SearchBar } from '../components/SearchBar'
import { ItemToolbar } from '../components/ItemToolbar'
import { type FilterState } from '../components/FilterControls'
import { ItemCard } from '../components/ItemCard'
import { useGameData } from '../hooks/useGameData'
import { NORMALIZED_TYPE_ORDER } from '../utils/normalizeGameData'
import type { Item } from '../data/types'

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
		groupBy: 'none',
		requirements: [],
		rarities: [],
		categories: [],
		sortField: 'name',
		sortDirection: 'asc',
	})

	// Calculate what recipes use each item
	const usedInRecipes = useMemo(() => {
		if (!items) return new Map<string, Array<{ itemId: string; itemName: string; quantity: number }>>()

		// Deduplicate items first
		const uniqueItems = Array.from(
			new Map(items.map(item => [item.id, item])).values()
		)

		const recipeMap = new Map<string, Array<{ itemId: string; itemName: string; quantity: number }>>()

		for (const item of uniqueItems) {
			if (item.recipe) {
				// For each ingredient in this item's recipe
				for (const [ingredientId, quantity] of Object.entries(item.recipe)) {
					if (!recipeMap.has(ingredientId)) {
						recipeMap.set(ingredientId, [])
					}
					recipeMap.get(ingredientId)!.push({
						itemId: item.id,
						itemName: item.name.en,
						quantity,
					})
				}
			}
		}

		return recipeMap
	}, [items])

	// Calculate what items recycle/salvage into this item
	const recycledFrom = useMemo(() => {
		if (!items) return new Map<string, Array<{ itemId: string; itemName: string; recycleQty?: number; salvageQty?: number }>>()

		// Deduplicate items first
		const uniqueItems = Array.from(
			new Map(items.map(item => [item.id, item])).values()
		)

		const recycleMap = new Map<string, Array<{ itemId: string; itemName: string; recycleQty?: number; salvageQty?: number }>>()

		for (const item of uniqueItems) {
			// Check recyclesInto
			if (item.recyclesInto) {
				for (const [materialId, quantity] of Object.entries(item.recyclesInto)) {
					if (quantity > 0) {
						if (!recycleMap.has(materialId)) {
							recycleMap.set(materialId, [])
						}
						const existing = recycleMap.get(materialId)!.find(r => r.itemId === item.id)
						if (existing) {
							existing.recycleQty = quantity
						} else {
							recycleMap.get(materialId)!.push({
								itemId: item.id,
								itemName: item.name.en,
								recycleQty: quantity,
							})
						}
					}
				}
			}

			// Check salvagesInto
			if (item.salvagesInto) {
				for (const [materialId, quantity] of Object.entries(item.salvagesInto)) {
					if (quantity > 0) {
						if (!recycleMap.has(materialId)) {
							recycleMap.set(materialId, [])
						}
						const existing = recycleMap.get(materialId)!.find(r => r.itemId === item.id)
						if (existing) {
							existing.salvageQty = quantity
						} else {
							recycleMap.get(materialId)!.push({
								itemId: item.id,
								itemName: item.name.en,
								salvageQty: quantity,
							})
						}
					}
				}
			}
		}

		return recycleMap
	}, [items])

	// Calculate item requirements
	const itemRequirements = useMemo(() => {
		if (!quests || !hideoutModules || !projects) return new Map()

		const requirements = new Map<
			string,
			{ total: number; sources: Set<'quests' | 'hideout' | 'projects'> }
		>()

		// Aggregate quest requirements
		for (const quest of quests) {
			if (quest.requiredItemIds) {
				for (const entry of quest.requiredItemIds) {
					const current = requirements.get(entry.itemId) || {
						total: 0,
						sources: new Set(),
					}
					current.total += entry.quantity
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
							sources: new Set(),
						}
						current.total += entry.quantity
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
							sources: new Set(),
						}
						current.total += entry.quantity
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
		const uniqueItems = Array.from(
			new Map(items.map(item => [item.id, item])).values(),
		)

		return uniqueItems.filter(item => {
			// Search filter
			if (searchQuery) {
				const itemName = item.name?.en?.toLowerCase() || ''
				if (!itemName.includes(searchQuery.toLowerCase())) {
					return false
				}
			}

			// Rarity filter
			if (filters.rarities.length > 0) {
				if (!item.rarity) return false
				const itemRarity = item.rarity.toLowerCase() as 'common' | 'uncommon' | 'rare' | 'legendary'
				if (!filters.rarities.includes(itemRarity)) {
					return false
				}
			}

			// Category filter
			if (filters.categories.length > 0) {
				if (!item.category) return false
				if (!filters.categories.includes(item.category as any)) {
					return false
				}
			}

			// Requirement filter
			if (filters.requirements.length > 0) {
				const req = itemRequirements.get(item.id)
				const isSafe = !req

				// Check if item matches any selected requirement filter
				const matchesFilter = filters.requirements.some(reqFilter => {
					if (reqFilter === 'safe') return isSafe
					if (reqFilter === 'quests') return req?.sources.has('quests')
					if (reqFilter === 'hideout') return req?.sources.has('hideout')
					if (reqFilter === 'projects') return req?.sources.has('projects')
					return false
				})

				if (!matchesFilter) return false
			}

			return true
		})
	}, [items, searchQuery, filters, itemRequirements])

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
				return itemsCopy.sort((a, b) => {
					const typeA = a.type || ''
					const typeB = b.type || ''
					return typeA.localeCompare(typeB) * direction
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
			return Array.from(groups.entries())
				.sort(
					([a], [b]) =>
						['Common', 'Uncommon', 'Rare', 'Legendary'].indexOf(a) -
						['Common', 'Uncommon', 'Rare', 'Legendary'].indexOf(b)
				)
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
			return NORMALIZED_TYPE_ORDER.filter(cat => groups.has(cat))
				.map(category => ({ title: category, items: groups.get(category)! }))
		}

		if (filters.groupBy === 'requirement') {
			const groups: Record<string, Item[]> = {
				'Quest Items': [],
				'Hideout Items': [],
				'Project Items': [],
				'Safe to Salvage': [],
			}

			for (const item of sortedItems) {
				const req = itemRequirements.get(item.id)
				if (!req) {
					groups['Safe to Salvage'].push(item)
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

	// Statistics
	const stats = useMemo(() => {
		const totalItems = items?.length || 0
		const itemsNeeded = itemRequirements.size
		const totalQuantity = Array.from(itemRequirements.values()).reduce(
			(sum, req) => sum + req.total,
			0
		)
		const safeToSalvage = totalItems - itemsNeeded

		return { totalItems, itemsNeeded, totalQuantity, safeToSalvage }
	}, [items, itemRequirements])

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

	return (
		<div>
			{/* Header */}
			<div className="mb-8">
				<Heading level={1}>All Items</Heading>
				<Text className="mt-2">
					Browse all {stats.totalItems} items in ARC Raiders. Filter by what you need and group by
					requirement type.
				</Text>
			</div>

			{/* Statistics */}
			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
					<Text className="text-xs/6 font-medium text-zinc-400">Total Items</Text>
					<div className="mt-2 text-3xl font-semibold text-white">{stats.totalItems}</div>
				</div>

				<div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
					<Text className="text-xs/6 font-medium text-zinc-400">Items Needed</Text>
					<div className="mt-2 text-3xl font-semibold text-blue-400">{stats.itemsNeeded}</div>
				</div>

				<div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
					<Text className="text-xs/6 font-medium text-zinc-400">Total Quantity</Text>
					<div className="mt-2 text-3xl font-semibold text-cyan-400">
						{stats.totalQuantity.toLocaleString()}
					</div>
				</div>

				<div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
					<Text className="text-xs/6 font-medium text-zinc-400">Safe to Salvage</Text>
					<div className="mt-2 text-3xl font-semibold text-green-400">{stats.safeToSalvage}</div>
				</div>
			</div>

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

			{/* Item Groups */}
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
						) : (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{group.items.map(item => {
									const req = itemRequirements.get(item.id)
									const recipes = usedInRecipes.get(item.id)
									const sources = recycledFrom.get(item.id)
									return (
										<ItemCard
											key={`${group.title}-${item.id}`}
											item={item}
											quantityNeeded={req?.total}
											requiredFor={req ? Array.from(req.sources) : undefined}
											usedInRecipes={recipes}
											recycledFrom={sources}
											allItems={items || []}
										/>
									)
								})}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

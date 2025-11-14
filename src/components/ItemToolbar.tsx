/**
 * ItemToolbar Component
 * Compact horizontal toolbar for grouping, filtering, and sorting controls
 */

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from './dropdown'
import { Button } from './button'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/16/solid'
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/20/solid'
import { NORMALIZED_TYPE_ORDER, type NormalizedItemType } from '../utils/normalizeGameData'
import type { FilterState, GroupByOption, SortField, DisplayMode } from './FilterControls'
import { TriStateCheckbox, type FilterMode } from './TriStateCheckbox'

interface ItemToolbarProps {
	filters: FilterState
	onFilterChange: (filters: FilterState) => void
	itemCount: number
	filteredCount: number
}

const groupByOptions: Array<{ value: GroupByOption; label: string }> = [
	{ value: 'none', label: 'No Grouping' },
	{ value: 'requirement', label: 'By Requirement' },
	{ value: 'rarity', label: 'By Rarity' },
	{ value: 'type', label: 'By Type' },
]

const metaFilterOptions = {
	requirements: [
		{ key: 'required' as const, label: 'Required' },
		{ key: 'quests' as const, label: 'Quest Items' },
		{ key: 'hideout' as const, label: 'Hideout Items' },
		{ key: 'projects' as const, label: 'Project Items' },
	],
	crafting: [
		{ key: 'craftable' as const, label: 'Craftable' },
		{ key: 'ingredient' as const, label: 'Ingredient' },
		{ key: 'recyclable' as const, label: 'Recyclable' },
		{ key: 'reclaimed' as const, label: 'Reclaimed' },
		{ key: 'purchased' as const, label: 'Purchased' },
	],
}

const rarityOptions = [
	{ key: 'common' as const, label: 'Common' },
	{ key: 'uncommon' as const, label: 'Uncommon' },
	{ key: 'rare' as const, label: 'Rare' },
	{ key: 'epic' as const, label: 'Epic' },
	{ key: 'legendary' as const, label: 'Legendary' },
]

const sortFieldOptions: Array<{
	value: SortField
	label: string
	defaultDirection: 'asc' | 'desc'
	ascLabel: string
	descLabel: string
}> = [
	{ value: 'name', label: 'Name', defaultDirection: 'asc', ascLabel: 'A-Z', descLabel: 'Z-A' },
	{
		value: 'type',
		label: 'Type',
		defaultDirection: 'asc',
		ascLabel: 'Default',
		descLabel: 'Reverse',
	},
	{
		value: 'rarity',
		label: 'Rarity',
		defaultDirection: 'desc',
		ascLabel: 'Worst-Best',
		descLabel: 'Best-Worst',
	},
	{
		value: 'value',
		label: 'Value',
		defaultDirection: 'desc',
		ascLabel: 'Low-High',
		descLabel: 'High-Low',
	},
]

export function ItemToolbar({
	filters,
	onFilterChange,
	itemCount,
	filteredCount,
}: ItemToolbarProps) {
	const handleGroupByChange = (value: GroupByOption) => {
		onFilterChange({ ...filters, groupBy: value })
	}

	const handleMetaFilterChange = (key: keyof typeof filters.metaFilters, value: FilterMode) => {
		onFilterChange({
			...filters,
			metaFilters: {
				...filters.metaFilters,
				[key]: value,
			},
		})
	}

	const handleRarityFilterChange = (key: keyof typeof filters.rarityFilters, value: FilterMode) => {
		onFilterChange({
			...filters,
			rarityFilters: {
				...filters.rarityFilters,
				[key]: value,
			},
		})
	}

	const handleCategoryFilterChange = (key: NormalizedItemType, value: FilterMode) => {
		onFilterChange({
			...filters,
			categoryFilters: {
				...filters.categoryFilters,
				[key]: value,
			},
		})
	}

	const handleSortFieldChange = (value: SortField) => {
		const option = sortFieldOptions.find(opt => opt.value === value)
		if (!option) return

		// If clicking the current sort field, toggle direction
		if (filters.sortField === value) {
			onFilterChange({
				...filters,
				sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
			})
		} else {
			// If clicking a new sort field, use its default direction
			onFilterChange({
				...filters,
				sortField: value,
				sortDirection: option.defaultDirection,
			})
		}
	}

	const handleDisplayModeChange = (mode: DisplayMode) => {
		onFilterChange({ ...filters, displayMode: mode })
	}

	const clearAllFilters = () => {
		onFilterChange({
			groupBy: 'none',
			metaFilters: {
				required: 'ignore',
				quests: 'ignore',
				hideout: 'ignore',
				projects: 'ignore',
				craftable: 'ignore',
				ingredient: 'ignore',
				recyclable: 'ignore',
				reclaimed: 'ignore',
				purchased: 'ignore',
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
			sortField: 'name',
			sortDirection: 'asc',
			displayMode: filters.displayMode,
			showDetails: filters.showDetails,
		})
	}

	const selectedGroupBy =
		groupByOptions.find(opt => opt.value === filters.groupBy) || groupByOptions[0]
	const selectedSortField =
		sortFieldOptions.find(opt => opt.value === filters.sortField) || sortFieldOptions[0]
	const sortDirectionLabel =
		filters.sortDirection === 'asc' ? selectedSortField.ascLabel : selectedSortField.descLabel

	// Count active filters (non-ignore states)
	const activeMetaFilterCount = Object.values(filters.metaFilters).filter(
		v => v !== 'ignore'
	).length
	const activeRarityFilterCount = Object.values(filters.rarityFilters).filter(
		v => v !== 'ignore'
	).length
	const activeCategoryFilterCount = Object.values(filters.categoryFilters).filter(
		v => v !== 'ignore'
	).length
	const hasActiveFilters =
		activeMetaFilterCount > 0 || activeRarityFilterCount > 0 || activeCategoryFilterCount > 0
	const activeFilterCount =
		activeMetaFilterCount + activeRarityFilterCount + activeCategoryFilterCount

	return (
		<div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-4 py-3">
			{/* Group By Dropdown */}
			<Dropdown>
				<DropdownButton outline>
					<span className="text-zinc-400">Group:</span> {selectedGroupBy.label}
				</DropdownButton>
				<DropdownMenu>
					{groupByOptions.map(option => (
						<DropdownItem key={option.value} onClick={() => handleGroupByChange(option.value)}>
							{option.label}
						</DropdownItem>
					))}
				</DropdownMenu>
			</Dropdown>

			{/* Filter Dropdown */}
			<Dropdown>
				<DropdownButton outline>
					<span className="text-zinc-400">Filter:</span>{' '}
					{hasActiveFilters ? `${activeFilterCount} active` : 'All Items'}
				</DropdownButton>
				<DropdownMenu className="w-[800px]">
					<div className="col-span-full grid grid-cols-4 gap-4 p-3">
						{/* Requirement Filters */}
						<div>
							<div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Requirements
							</div>
							<div className="space-y-2">
								{metaFilterOptions.requirements.map(option => (
									<TriStateCheckbox
										key={option.key}
										label={option.label}
										value={filters.metaFilters[option.key]}
										onChange={value => handleMetaFilterChange(option.key, value)}
									/>
								))}
							</div>
						</div>

						{/* Crafting/Materials Filters */}
						<div>
							<div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Crafting
							</div>
							<div className="space-y-2">
								{metaFilterOptions.crafting.map(option => (
									<TriStateCheckbox
										key={option.key}
										label={option.label}
										value={filters.metaFilters[option.key]}
										onChange={value => handleMetaFilterChange(option.key, value)}
									/>
								))}
							</div>
						</div>

						{/* Rarity Filters */}
						<div>
							<div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Rarity
							</div>
							<div className="space-y-2">
								{rarityOptions.map(option => (
									<TriStateCheckbox
										key={option.key}
										label={option.label}
										value={filters.rarityFilters[option.key]}
										onChange={value => handleRarityFilterChange(option.key, value)}
									/>
								))}
							</div>
						</div>

						{/* Category Filters */}
						<div>
							<div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Category
							</div>
							<div className="space-y-2">
								{NORMALIZED_TYPE_ORDER.map(category => (
									<TriStateCheckbox
										key={category}
										label={category}
										value={filters.categoryFilters[category]}
										onChange={value => handleCategoryFilterChange(category, value)}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Toolbar Section */}
					{hasActiveFilters && (
						<div className="col-span-full -mx-1 -mb-1 border-t border-white/10 bg-zinc-900/50 py-2 text-center">
							<button
								onClick={clearAllFilters}
								className="text-sm text-cyan-400 hover:text-cyan-300"
							>
								Clear all
							</button>
						</div>
					)}
				</DropdownMenu>
			</Dropdown>

			{/* Sort Dropdown */}
			<Dropdown>
				<DropdownButton outline>
					<span className="text-zinc-400">Sort:</span> {selectedSortField.label} (
					{sortDirectionLabel})
				</DropdownButton>
				<DropdownMenu>
					{sortFieldOptions.map(option => {
						const isActive = filters.sortField === option.value

						return (
							<DropdownItem
								key={option.value}
								onClick={() => handleSortFieldChange(option.value)}
								className="flex items-center justify-between"
							>
								<span>{option.label}</span>
								{isActive && (
									<span className="ml-4 flex items-center gap-1 text-xs text-zinc-400">
										{filters.sortDirection === 'asc' ? (
											<>
												<ArrowUpIcon className="size-3" />
												{option.ascLabel}
											</>
										) : (
											<>
												<ArrowDownIcon className="size-3" />
												{option.descLabel}
											</>
										)}
									</span>
								)}
							</DropdownItem>
						)
					})}
				</DropdownMenu>
			</Dropdown>

			{/* Display Mode Toggle */}
			<div className="flex gap-1">
				<Button
					outline
					onClick={() => handleDisplayModeChange('grid')}
					className={filters.displayMode === 'grid' ? 'bg-white/10' : ''}
				>
					<Squares2X2Icon className="size-4" />
				</Button>
				<Button
					outline
					onClick={() => handleDisplayModeChange('list')}
					className={filters.displayMode === 'list' ? 'bg-white/10' : ''}
				>
					<ListBulletIcon className="size-4" />
				</Button>
			</div>

			{/* Show Details Toggle - only visible in grid mode */}
			{filters.displayMode === 'grid' && (
				<Button
					outline
					onClick={() => onFilterChange({ ...filters, showDetails: !filters.showDetails })}
					className={filters.showDetails ? 'bg-white/10' : ''}
				>
					Show Details
				</Button>
			)}

			{/* Item Count */}
			<div className="ml-auto text-sm text-zinc-400">
				{filteredCount === itemCount ? (
					<span>
						<span className="font-semibold text-white">{itemCount}</span> items
					</span>
				) : (
					<span>
						<span className="font-semibold text-white">{filteredCount}</span> of{' '}
						<span className="font-semibold text-white">{itemCount}</span> items
					</span>
				)}
			</div>
		</div>
	)
}

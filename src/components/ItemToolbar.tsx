/**
 * ItemToolbar Component
 * Compact horizontal toolbar for grouping, filtering, and sorting controls
 */

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from './dropdown'
import { Checkbox, CheckboxField } from './checkbox'
import { Label } from './fieldset'
import { Button } from './button'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/16/solid'
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/20/solid'
import { NORMALIZED_TYPE_ORDER, type NormalizedItemType } from '../utils/normalizeGameData'
import type { FilterState, GroupByOption, RequirementFilter, RarityFilter, SortField, DisplayMode } from './FilterControls'

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

const requirementOptions: Array<{
	value: RequirementFilter
	label: string
}> = [
	{ value: 'quests', label: 'Quest Items' },
	{ value: 'hideout', label: 'Hideout Items' },
	{ value: 'projects', label: 'Project Items' },
	{ value: 'safe', label: 'Safe to Salvage' },
]

const rarityOptions: Array<{
	value: RarityFilter
	label: string
	color: string
}> = [
	{ value: 'common', label: 'Common', color: 'text-zinc-400' },
	{ value: 'uncommon', label: 'Uncommon', color: 'text-green-400' },
	{ value: 'rare', label: 'Rare', color: 'text-blue-400' },
	{ value: 'legendary', label: 'Legendary', color: 'text-orange-400' },
]

const sortFieldOptions: Array<{ value: SortField; label: string }> = [
	{ value: 'name', label: 'Name' },
	{ value: 'type', label: 'Type' },
	{ value: 'value', label: 'Value' },
]

export function ItemToolbar({ filters, onFilterChange, itemCount, filteredCount }: ItemToolbarProps) {
	const handleGroupByChange = (value: GroupByOption) => {
		onFilterChange({ ...filters, groupBy: value })
	}

	const handleRequirementToggle = (value: RequirementFilter) => {
		const newRequirements = filters.requirements.includes(value)
			? filters.requirements.filter(r => r !== value)
			: [...filters.requirements, value]
		onFilterChange({ ...filters, requirements: newRequirements })
	}

	const handleRarityToggle = (value: RarityFilter) => {
		const newRarities = filters.rarities.includes(value)
			? filters.rarities.filter(r => r !== value)
			: [...filters.rarities, value]
		onFilterChange({ ...filters, rarities: newRarities })
	}

	const handleCategoryToggle = (value: NormalizedItemType) => {
		const newCategories = filters.categories.includes(value)
			? filters.categories.filter(c => c !== value)
			: [...filters.categories, value]
		onFilterChange({ ...filters, categories: newCategories })
	}

	const handleSortFieldChange = (value: SortField) => {
		onFilterChange({ ...filters, sortField: value })
	}

	const toggleSortDirection = () => {
		onFilterChange({ ...filters, sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' })
	}

	const handleDisplayModeChange = (mode: DisplayMode) => {
		onFilterChange({ ...filters, displayMode: mode })
	}

	const clearAllFilters = () => {
		onFilterChange({
			groupBy: 'none',
			requirements: [],
			rarities: [],
			categories: [],
			sortField: 'name',
			sortDirection: 'asc',
			displayMode: filters.displayMode,
		})
	}

	const selectedGroupBy = groupByOptions.find(opt => opt.value === filters.groupBy) || groupByOptions[0]
	const selectedSortField = sortFieldOptions.find(opt => opt.value === filters.sortField) || sortFieldOptions[0]
	const hasActiveFilters = filters.requirements.length > 0 || filters.rarities.length > 0 || filters.categories.length > 0
	const activeFilterCount = filters.requirements.length + filters.rarities.length + filters.categories.length

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
				<DropdownMenu className="w-[600px]">
					<div className="col-span-full grid grid-cols-3 gap-4 p-3">
						{/* Requirement Filters */}
						<div>
							<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Requirement
							</div>
							{requirementOptions.map(option => (
								<CheckboxField key={option.value}>
									<Checkbox
										checked={filters.requirements.includes(option.value)}
										onChange={() => handleRequirementToggle(option.value)}
									/>
									<Label>{option.label}</Label>
								</CheckboxField>
							))}
						</div>

						{/* Rarity Filters */}
						<div>
							<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Rarity
							</div>
							{rarityOptions.map(option => (
								<CheckboxField key={option.value}>
									<Checkbox
										checked={filters.rarities.includes(option.value)}
										onChange={() => handleRarityToggle(option.value)}
									/>
									<Label className={option.color}>{option.label}</Label>
								</CheckboxField>
							))}
						</div>

						{/* Category Filters */}
						<div>
							<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
								Category
							</div>
							{NORMALIZED_TYPE_ORDER.map(category => (
								<CheckboxField key={category}>
									<Checkbox
										checked={filters.categories.includes(category)}
										onChange={() => handleCategoryToggle(category)}
									/>
									<Label>{category}</Label>
								</CheckboxField>
							))}
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
					<span className="text-zinc-400">Sort:</span> {selectedSortField.label}
				</DropdownButton>
				<DropdownMenu>
					{sortFieldOptions.map(option => (
						<DropdownItem key={option.value} onClick={() => handleSortFieldChange(option.value)}>
							{option.label}
						</DropdownItem>
					))}
				</DropdownMenu>
			</Dropdown>

			{/* Sort Direction Toggle */}
			<Button outline onClick={toggleSortDirection}>
				{filters.sortDirection === 'asc' ? (
					<ArrowUpIcon className="size-4" />
				) : (
					<ArrowDownIcon className="size-4" />
				)}
			</Button>

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

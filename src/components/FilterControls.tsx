/**
 * FilterControls Component
 * Provides filtering and grouping controls for the item list
 */

import { Listbox, ListboxLabel, ListboxOption } from './listbox'
import { Checkbox, CheckboxField, CheckboxGroup } from './checkbox'
import { Label, Description, Fieldset, Legend, Field } from './fieldset'
import { Text } from './text'

import type { NormalizedItemType } from '../utils/normalizeGameData'

export type GroupByOption = 'none' | 'requirement' | 'rarity' | 'type'
export type RequirementFilter = 'quests' | 'hideout' | 'projects' | 'safe'
export type RarityFilter = 'common' | 'uncommon' | 'rare' | 'legendary'
export type SortField = 'name' | 'type' | 'value'
export type SortDirection = 'asc' | 'desc'
export type DisplayMode = 'grid' | 'list'

export interface FilterState {
	groupBy: GroupByOption
	requirements: RequirementFilter[]
	rarities: RarityFilter[]
	categories: NormalizedItemType[]
	sortField: SortField
	sortDirection: SortDirection
	displayMode: DisplayMode
}

interface FilterControlsProps {
	filters: FilterState
	onFilterChange: (filters: FilterState) => void
}

const groupByOptions: Array<{ value: GroupByOption; label: string }> = [
	{ value: 'none', label: 'No Grouping' },
	{ value: 'requirement', label: 'Group by Requirement Type' },
	{ value: 'rarity', label: 'Group by Rarity' },
	{ value: 'type', label: 'Group by Item Type' },
]

const requirementOptions: Array<{
	value: RequirementFilter
	label: string
	description: string
}> = [
	{
		value: 'quests',
		label: 'Quest Items',
		description: 'Items needed for quest completion',
	},
	{
		value: 'hideout',
		label: 'Hideout Items',
		description: 'Items needed for hideout module upgrades',
	},
	{
		value: 'projects',
		label: 'Project Items',
		description: 'Items needed for expedition projects',
	},
	{
		value: 'safe',
		label: 'Safe to Salvage',
		description: 'Items not required for progression',
	},
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

/**
 * FilterControls provides UI for filtering and grouping items
 */
export function FilterControls({ filters, onFilterChange }: FilterControlsProps) {
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

	const selectedGroupBy =
		groupByOptions.find(opt => opt.value === filters.groupBy) || groupByOptions[0]

	return (
		<div className="space-y-6">
			{/* Group By Selector */}
			<Field>
				<Label>Group Items By</Label>
				<Listbox value={filters.groupBy} onChange={handleGroupByChange} aria-label="Group items by">
					<ListboxLabel>{selectedGroupBy.label}</ListboxLabel>
					{groupByOptions.map(option => (
						<ListboxOption key={option.value} value={option.value}>
							<ListboxLabel>{option.label}</ListboxLabel>
						</ListboxOption>
					))}
				</Listbox>
			</Field>

			{/* Requirement Filter */}
			<Fieldset>
				<Legend>Filter by Requirement</Legend>
				<Text className="mt-1 text-sm text-zinc-400">Show only items matching these criteria</Text>
				<CheckboxGroup className="mt-4">
					{requirementOptions.map(option => (
						<CheckboxField key={option.value}>
							<Checkbox
								checked={filters.requirements.includes(option.value)}
								onChange={() => handleRequirementToggle(option.value)}
							/>
							<Label>{option.label}</Label>
							<Description>{option.description}</Description>
						</CheckboxField>
					))}
				</CheckboxGroup>
			</Fieldset>

			{/* Rarity Filter */}
			<Fieldset>
				<Legend>Filter by Rarity</Legend>
				<CheckboxGroup className="mt-4">
					{rarityOptions.map(option => (
						<CheckboxField key={option.value}>
							<Checkbox
								checked={filters.rarities.includes(option.value)}
								onChange={() => handleRarityToggle(option.value)}
							/>
							<Label className={option.color}>{option.label}</Label>
						</CheckboxField>
					))}
				</CheckboxGroup>
			</Fieldset>
		</div>
	)
}

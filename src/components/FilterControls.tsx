/**
 * FilterControls Types
 * Type definitions for filtering and grouping controls
 */

import type { FilterMode } from './TriStateCheckbox'

export type GroupByOption = 'none' | 'requirement' | 'rarity' | 'type'
export type RarityFilter = 'common' | 'uncommon' | 'rare' | 'legendary'
export type SortField = 'name' | 'type' | 'rarity' | 'value'
export type SortDirection = 'asc' | 'desc'
export type DisplayMode = 'grid' | 'list'

export interface MetaFilters {
	// Requirements
	required: FilterMode
	quests: FilterMode
	hideout: FilterMode
	projects: FilterMode
	// Crafting/Materials
	craftable: FilterMode
	ingredient: FilterMode
	recyclable: FilterMode
	reclaimed: FilterMode
}

export interface RarityFilters {
	common: FilterMode
	uncommon: FilterMode
	rare: FilterMode
	legendary: FilterMode
	epic: FilterMode
}

export interface CategoryFilters {
	Augments: FilterMode
	Shields: FilterMode
	Weapons: FilterMode
	Ammunition: FilterMode
	'Weapon Mods': FilterMode
	'Quick Use': FilterMode
	Keys: FilterMode
	'Crafting Materials': FilterMode
	Misc: FilterMode
}

export interface FilterState {
	groupBy: GroupByOption
	metaFilters: MetaFilters
	rarityFilters: RarityFilters
	categoryFilters: CategoryFilters
	sortField: SortField
	sortDirection: SortDirection
	displayMode: DisplayMode
	showDetails: boolean
}

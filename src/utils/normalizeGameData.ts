/**
 * Data Normalization Utilities
 * Transforms raw game data into our application's format
 */

import type { Item } from '../data/types'

/**
 * Normalized item types matching the game's inventory categories
 */
export type NormalizedItemType =
	| 'Augments'
	| 'Shields'
	| 'Weapons'
	| 'Ammunition'
	| 'Weapon Mods'
	| 'Quick Use'
	| 'Keys'
	| 'Crafting Materials'
	| 'Misc'

/**
 * Mapping from raw item types to normalized categories
 */
const RAW_TYPE_TO_NORMALIZED: Record<string, NormalizedItemType> = {
	// Augments
	Augment: 'Augments',

	// Shields
	Shield: 'Shields',

	// Weapons
	'Assault Rifle': 'Weapons',
	'Battle Rifle': 'Weapons',
	'Hand Cannon': 'Weapons',
	LMG: 'Weapons',
	Pistol: 'Weapons',
	Shotgun: 'Weapons',
	Weapon: 'Weapons',

	// Ammunition
	Ammunition: 'Ammunition',

	// Weapon Mods
	Modification: 'Weapon Mods',

	// Quick Use
	'Quick Use': 'Quick Use',

	// Keys
	Key: 'Keys',

	// Crafting Materials
	'Basic Material': 'Crafting Materials',
	Material: 'Crafting Materials',
	'Refined Material': 'Crafting Materials',
	'Topside Material': 'Crafting Materials',
	Nature: 'Crafting Materials',
	Recyclable: 'Crafting Materials',

	// Misc
	'Backpack Charm': 'Misc',
	Blueprint: 'Misc',
	Cosmetic: 'Misc',
	Misc: 'Misc',
	Outfit: 'Misc',
	Trinket: 'Misc',
}

/**
 * Ordered list of normalized types (matches game inventory order)
 */
export const NORMALIZED_TYPE_ORDER: NormalizedItemType[] = [
	'Augments',
	'Shields',
	'Weapons',
	'Ammunition',
	'Weapon Mods',
	'Quick Use',
	'Keys',
	'Crafting Materials',
	'Misc',
]

/**
 * Normalize a single item's type
 */
function normalizeItemType(rawType: string): NormalizedItemType {
	return RAW_TYPE_TO_NORMALIZED[rawType] || 'Misc'
}

/**
 * Normalize items array by adding category field while preserving original type
 */
export function normalizeItems(items: Item[]): Item[] {
	return items.map(item => ({
		...item,
		category: normalizeItemType(item.type),
	}))
}

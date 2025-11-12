/**
 * Meta-groups for item types matching the game's inventory categories
 */

export type MetaGroup =
	| 'Augments'
	| 'Shields'
	| 'Weapons'
	| 'Ammunition'
	| 'Weapon Mods'
	| 'Quick Use'
	| 'Keys'
	| 'Crafting Materials'
	| 'Misc'

export const TYPE_TO_META_GROUP: Record<string, MetaGroup> = {
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

export function getItemMetaGroup(itemType: string): MetaGroup {
	return TYPE_TO_META_GROUP[itemType] || 'Misc'
}

export const META_GROUP_ORDER: MetaGroup[] = [
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

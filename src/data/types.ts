/**
 * Type definitions for ARC Raiders game data
 * Based on arcraiders-data repository schema
 */

// ============================================================================
// Utility Types (DRY - reusable across all data structures)
// ============================================================================

/**
 * Multilingual text with language codes as keys
 * Example: { en: "English", es: "Spanish", fr: "French" }
 */
export type LocalizedText = Record<string, string>

/**
 * Single item requirement entry (used in arrays)
 * Example: { itemId: "metal_parts", quantity: 10 }
 */
export interface ItemRequirementEntry {
	itemId: string
	quantity: number
}

/**
 * Item requirement mapping (itemId -> quantity)
 * Used internally for aggregation
 * Example: { metal_parts: 10, wires: 5 }
 */
export type ItemRequirements = Record<string, number>

/**
 * Category requirement mapping (categoryName -> value)
 * Example: { "Combat Items": 250000, "Survival Items": 100000 }
 */
export type CategoryRequirements = Record<string, number>

/**
 * Base interface for entities with multilingual names
 */
export interface LocalizedEntity {
	id: string
	name: LocalizedText
}

// ============================================================================
// Game Data Types
// ============================================================================

/**
 * Item - Represents an in-game item
 */
export interface Item {
	id: string
	name: LocalizedText
	description?: LocalizedText
	type: string
	category?: string // Normalized category (e.g., "Weapons", "Crafting Materials") - added during data normalization
	rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
	value?: number
	weightKg?: number
	stackSize?: number
	imageFilename?: string

	// Optional crafting/recycling fields
	recyclesInto?: ItemRequirements
	salvagesInto?: ItemRequirements
	recipe?: ItemRequirements
	craftBench?: string | string[]
	foundIn?: string
	effects?: Record<string, LocalizedText>
	tip?: string
	_note?: string
}

/**
 * Quest - Represents a mission/quest
 */
export interface Quest {
	id: string
	trader: string
	name: LocalizedText
	objectives: LocalizedText[]
	xp: number

	// Optional fields
	description?: LocalizedText
	updatedAt?: string
	grantedItemIds?: ItemRequirementEntry[]
	requiredItemIds?: ItemRequirementEntry[]
	rewardItemIds?: ItemRequirementEntry[]
	previousQuestIds?: string[]
	nextQuestIds?: string[]
}

/**
 * HideoutModuleLevel - Represents a single level of a hideout module
 */
export interface HideoutModuleLevel {
	level: number
	requirementItemIds: ItemRequirementEntry[]
	otherRequirements?: string[]
	description?: string
}

/**
 * HideoutModule - Represents a craftable/upgradeable hideout station
 */
export interface HideoutModule {
	id: string
	name: LocalizedText
	maxLevel: number
	levels: HideoutModuleLevel[]
}

/**
 * ProjectPhase - Represents a single phase of a project
 */
export interface ProjectPhase {
	phase: number
	name: LocalizedText
	description?: LocalizedText
	requirementItemIds?: ItemRequirementEntry[]
	requirementCategories?: CategoryRequirements
}

/**
 * Project - Represents an expedition or long-term project
 */
export interface Project {
	id: string
	name: LocalizedText
	description: LocalizedText
	phases: ProjectPhase[]
}

/**
 * SkillNode - Represents a node in the skill tree
 */
export interface SkillNode {
	id: string
	category: 'CONDITIONING' | 'MOBILITY' | 'SURVIVAL'
	isMajor: boolean
	maxPoints: number
	name: LocalizedText
	description: LocalizedText
	impactedSkill: string
	position: { x: number; y: number }
	iconName: string

	// Optional fields
	prerequisiteNodeIds?: string[]
	knownValue?: unknown[]
}

/**
 * Aggregate data structures for analysis
 */

// Item priority for keep/salvage decisions
export type ItemPriority = 'Critical' | 'Needed' | 'Optional' | 'Safe to Salvage'

// Item with calculated requirement data
export interface ItemWithRequirements extends Item {
	totalNeeded: number
	neededForQuests: number
	neededForHideout: number
	neededForProjects: number
	priority: ItemPriority
	valuePerWeight: number
}

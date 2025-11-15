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
 * Component relationship entry (from API)
 * Used in usedIn and recycleFrom arrays
 */
export interface ComponentRelationship {
	quantity: number
	item?: {
		id: string
		name: string
		rarity: string
		item_type: string
	}
	component?: {
		id: string
		name: string
		rarity: string
		item_type: string
	}
}

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
	recipe?: ItemRequirements
	craftBench?: string | string[]
	foundIn?: string
	effects?: Record<string, LocalizedText>
	tip?: string
	_note?: string

	// New fields from API
	workbench?: string
	loadout_slots?: string[]
	sources?: string[]
	locations?: string[]
	loot_area?: string
	stat_block?: Record<string, unknown>

	// Component relationships (from API with includeComponents=true)
	usedIn?: ComponentRelationship[]
	recycleFrom?: ComponentRelationship[]

	// Trader information (processed from traders data)
	traderInfo?: {
		traderName: string
		price: number
		currency: 'Seeds' | 'Creds'
	}
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
 * ARC - Represents an ARC enemy/unit
 */
export interface ARC {
	id: string
	name: string
	description?: string
	icon?: string
	image?: string
	created_at?: string
	updated_at?: string
}

/**
 * TraderItem - Represents an item sold by a trader
 */
export interface TraderItem {
	id: string
	name: string
	icon?: string
	value?: number
	rarity: string
	item_type: string
	description?: string
	trader_price?: number | null
}

/**
 * Trader data structure - Maps trader names to their inventory
 */
export type TradersData = Record<string, TraderItem[]>

/**
 * GameData - Container for all game data
 */
export interface GameData {
	items: Item[]
	quests: Quest[]
	hideoutModules: HideoutModule[]
	projects: Project[]
	arcs?: ARC[]
	traders?: TradersData
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

// ============================================================================
// Progress Tracking Types
// ============================================================================

/**
 * Quest completion tracking
 */
export interface QuestProgress {
	questId: string
	completed: boolean
	completedAt: string | null
}

/**
 * Hideout module level completion tracking
 */
export interface HideoutProgress {
	moduleId: string
	level: number
	completed: boolean
	completedAt: string | null
}

/**
 * Project phase completion tracking
 */
export interface ProjectProgress {
	projectId: string
	phase: number
	completed: boolean
	completedAt: string | null
}

/**
 * Game progress state - persisted to localStorage
 */
export interface GameProgress {
	quests: Record<string, QuestProgress>
	hideout: Record<string, HideoutProgress>
	projects: Record<string, ProjectProgress>
	version: number
}

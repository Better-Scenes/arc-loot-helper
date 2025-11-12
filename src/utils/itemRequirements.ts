/**
 * Item Requirement Aggregator
 * Calculates total item requirements across quests, hideout modules, and projects
 */

import type { Quest, HideoutModule, Project, ItemRequirements } from '../data/types'

/**
 * Aggregate item requirements from quest data
 * Sums up all requiredItemIds from all quests
 */
export function aggregateQuestRequirements(quests: Quest[]): ItemRequirements {
	const aggregated: ItemRequirements = {}

	for (const quest of quests) {
		if (!quest.requiredItemIds) continue

		for (const entry of quest.requiredItemIds) {
			aggregated[entry.itemId] = (aggregated[entry.itemId] || 0) + entry.quantity
		}
	}

	return aggregated
}

/**
 * Aggregate item requirements from hideout module data
 * Sums up all requirementItemIds from all module levels
 */
export function aggregateHideoutRequirements(modules: HideoutModule[]): ItemRequirements {
	const aggregated: ItemRequirements = {}

	for (const module of modules) {
		for (const level of module.levels) {
			for (const entry of level.requirementItemIds) {
				aggregated[entry.itemId] = (aggregated[entry.itemId] || 0) + entry.quantity
			}
		}
	}

	return aggregated
}

/**
 * Aggregate item requirements from project data
 * Sums up all requirementItemIds from all project phases
 *
 * Note: Category-based requirements (requirementCategories) cannot be
 * converted to exact item quantities without additional logic, so they
 * are currently ignored. This applies to Project Phase 5 which uses
 * value-based category requirements.
 */
export function aggregateProjectRequirements(projects: Project[]): ItemRequirements {
	const aggregated: ItemRequirements = {}

	for (const project of projects) {
		for (const phase of project.phases) {
			// Handle item-based requirements
			if (phase.requirementItemIds) {
				for (const entry of phase.requirementItemIds) {
					aggregated[entry.itemId] = (aggregated[entry.itemId] || 0) + entry.quantity
				}
			}

			// Note: phase.requirementCategories is not handled here
			// It would require additional logic to convert category-value requirements
			// to specific item quantities, which is out of scope for this aggregator
		}
	}

	return aggregated
}

/**
 * Calculate total item requirements across all data sources
 * Aggregates requirements from quests, hideout modules, and projects
 *
 * @param quests - Array of quest data
 * @param modules - Array of hideout module data
 * @param projects - Array of project data
 * @returns Aggregated item requirements (itemId -> total quantity)
 */
export function calculateItemRequirements(
	quests: Quest[],
	modules: HideoutModule[],
	projects: Project[]
): ItemRequirements {
	const questReqs = aggregateQuestRequirements(quests)
	const hideoutReqs = aggregateHideoutRequirements(modules)
	const projectReqs = aggregateProjectRequirements(projects)

	// Merge all requirements
	const totalRequirements: ItemRequirements = {}

	// Helper function to add requirements
	const addRequirements = (reqs: ItemRequirements) => {
		for (const [itemId, quantity] of Object.entries(reqs)) {
			totalRequirements[itemId] = (totalRequirements[itemId] || 0) + quantity
		}
	}

	addRequirements(questReqs)
	addRequirements(hideoutReqs)
	addRequirements(projectReqs)

	return totalRequirements
}

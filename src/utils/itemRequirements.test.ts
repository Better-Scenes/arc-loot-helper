/**
 * Tests for Item Requirement Aggregator
 * Following TDD: RED phase - write failing tests first
 */

import { describe, it, expect } from 'vitest'
import type { Quest, HideoutModule, Project } from '../data/types'
import {
	calculateItemRequirements,
	aggregateQuestRequirements,
	aggregateHideoutRequirements,
	aggregateProjectRequirements,
} from './itemRequirements'

describe('Item Requirement Aggregator', () => {
	// Sample test data
	const mockQuests: Quest[] = [
		{
			id: 'quest1',
			trader: 'TestTrader',
			name: { en: 'Test Quest 1' },
			objectives: [{ en: 'Objective 1' }],
			xp: 100,
			requiredItemIds: [
				{ itemId: 'item1', quantity: 5 },
				{ itemId: 'item2', quantity: 3 },
			],
		},
		{
			id: 'quest2',
			trader: 'TestTrader',
			name: { en: 'Test Quest 2' },
			objectives: [{ en: 'Objective 2' }],
			xp: 200,
			requiredItemIds: [
				{ itemId: 'item1', quantity: 2 },
				{ itemId: 'item3', quantity: 10 },
			],
		},
		{
			id: 'quest3',
			trader: 'TestTrader',
			name: { en: 'Test Quest 3' },
			objectives: [{ en: 'Objective 3' }],
			xp: 150,
			// No requirements
		},
	]

	const mockHideoutModules: HideoutModule[] = [
		{
			id: 'module1',
			name: { en: 'Test Module 1' },
			maxLevel: 3,
			levels: [
				{
					level: 1,
					requirementItemIds: [
						{ itemId: 'item1', quantity: 10 },
						{ itemId: 'item4', quantity: 5 },
					],
				},
				{
					level: 2,
					requirementItemIds: [
						{ itemId: 'item1', quantity: 20 },
						{ itemId: 'item4', quantity: 10 },
					],
				},
				{
					level: 3,
					requirementItemIds: [
						{ itemId: 'item1', quantity: 30 },
						{ itemId: 'item5', quantity: 15 },
					],
				},
			],
		},
		{
			id: 'module2',
			name: { en: 'Test Module 2' },
			maxLevel: 2,
			levels: [
				{ level: 1, requirementItemIds: [{ itemId: 'item2', quantity: 8 }] },
				{
					level: 2,
					requirementItemIds: [
						{ itemId: 'item2', quantity: 12 },
						{ itemId: 'item3', quantity: 6 },
					],
				},
			],
		},
	]

	const mockProjects: Project[] = [
		{
			id: 'project1',
			name: { en: 'Test Project 1' },
			description: { en: 'Test Description' },
			phases: [
				{
					phase: 1,
					name: { en: 'Phase 1' },
					requirementItemIds: [
						{ itemId: 'item1', quantity: 50 },
						{ itemId: 'item6', quantity: 25 },
					],
				},
				{
					phase: 2,
					name: { en: 'Phase 2' },
					requirementItemIds: [{ itemId: 'item3', quantity: 30 }],
				},
				{ phase: 3, name: { en: 'Phase 3' } }, // No requirements
			],
		},
	]

	describe('aggregateQuestRequirements', () => {
		it('should aggregate item requirements from multiple quests', () => {
			const result = aggregateQuestRequirements(mockQuests)

			// item1: 5 (quest1) + 2 (quest2) = 7
			expect(result.item1).toBe(7)

			// item2: 3 (quest1) = 3
			expect(result.item2).toBe(3)

			// item3: 10 (quest2) = 10
			expect(result.item3).toBe(10)
		})

		it('should handle quests with no requirements', () => {
			const result = aggregateQuestRequirements([mockQuests[2]])
			expect(Object.keys(result).length).toBe(0)
		})

		it('should handle empty quest array', () => {
			const result = aggregateQuestRequirements([])
			expect(result).toEqual({})
		})

		it('should ignore undefined requiredItemIds', () => {
			const questsWithUndefined: Quest[] = [
				{
					id: 'quest',
					trader: 'Trader',
					name: { en: 'Quest' },
					objectives: [{ en: 'Objective' }],
					xp: 100,
					requiredItemIds: undefined,
				},
			]
			const result = aggregateQuestRequirements(questsWithUndefined)
			expect(result).toEqual({})
		})
	})

	describe('aggregateHideoutRequirements', () => {
		it('should aggregate requirements from all module levels', () => {
			const result = aggregateHideoutRequirements(mockHideoutModules)

			// item1: 10 + 20 + 30 = 60
			expect(result.item1).toBe(60)

			// item2: 8 + 12 = 20
			expect(result.item2).toBe(20)

			// item3: 6
			expect(result.item3).toBe(6)

			// item4: 5 + 10 = 15
			expect(result.item4).toBe(15)

			// item5: 15
			expect(result.item5).toBe(15)
		})

		it('should handle empty hideout module array', () => {
			const result = aggregateHideoutRequirements([])
			expect(result).toEqual({})
		})

		it('should handle modules with empty level arrays', () => {
			const emptyModule: HideoutModule[] = [
				{
					id: 'empty',
					name: { en: 'Empty' },
					maxLevel: 0,
					levels: [],
				},
			]
			const result = aggregateHideoutRequirements(emptyModule)
			expect(result).toEqual({})
		})
	})

	describe('aggregateProjectRequirements', () => {
		it('should aggregate requirements from all project phases', () => {
			const result = aggregateProjectRequirements(mockProjects)

			// item1: 50
			expect(result.item1).toBe(50)

			// item3: 30
			expect(result.item3).toBe(30)

			// item6: 25
			expect(result.item6).toBe(25)
		})

		it('should handle phases with no requirementItemIds', () => {
			const projectWithEmptyPhase: Project[] = [
				{
					id: 'project',
					name: { en: 'Project' },
					description: { en: 'Description' },
					phases: [{ phase: 1, name: { en: 'Phase 1' } }],
				},
			]
			const result = aggregateProjectRequirements(projectWithEmptyPhase)
			expect(result).toEqual({})
		})

		it('should handle empty project array', () => {
			const result = aggregateProjectRequirements([])
			expect(result).toEqual({})
		})

		it('should handle category-based requirements by resolving item IDs', () => {
			// Phase 5 of real project uses requirementCategories instead of requirementItemIds
			// This requires looking up items by category and summing their values
			const projectWithCategories: Project[] = [
				{
					id: 'expedition',
					name: { en: 'Expedition' },
					description: { en: 'Description' },
					phases: [
						{
							phase: 5,
							name: { en: 'Phase 5' },
							requirementCategories: {
								'Combat Items': 250000,
								'Survival Items': 100000,
							},
						},
					],
				},
			]

			const result = aggregateProjectRequirements(projectWithCategories)

			// For category-based requirements, we can't determine exact item quantities
			// This should either return a special indicator or calculate based on value/item ratio
			// For now, we'll test that it returns an empty object since we can't determine exact items
			expect(result).toEqual({})
		})
	})

	describe('calculateItemRequirements', () => {
		it('should aggregate requirements from all sources', () => {
			const result = calculateItemRequirements(mockQuests, mockHideoutModules, mockProjects)

			// item1: 7 (quests) + 60 (hideout) + 50 (projects) = 117
			expect(result.item1).toBe(117)

			// item2: 3 (quests) + 20 (hideout) = 23
			expect(result.item2).toBe(23)

			// item3: 10 (quests) + 6 (hideout) + 30 (projects) = 46
			expect(result.item3).toBe(46)

			// item4: 15 (hideout only)
			expect(result.item4).toBe(15)

			// item5: 15 (hideout only)
			expect(result.item5).toBe(15)

			// item6: 25 (projects only)
			expect(result.item6).toBe(25)
		})

		it('should handle empty data arrays', () => {
			const result = calculateItemRequirements([], [], [])
			expect(result).toEqual({})
		})

		it('should return correct total count of unique items needed', () => {
			const result = calculateItemRequirements(mockQuests, mockHideoutModules, mockProjects)
			const uniqueItems = Object.keys(result)

			// Should have 6 unique items (item1-6)
			expect(uniqueItems.length).toBe(6)
		})
	})
})

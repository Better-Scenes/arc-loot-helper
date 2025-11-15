import { describe, it, expect } from 'vitest'
import { calculateCompletedRequirements } from '../itemRequirements'
import type { GameProgress, Quest, HideoutModule, Project } from '../../data/types'

describe('itemRequirements - Completed Calculations', () => {
	const mockProgress: GameProgress = {
		quests: {
			'quest-001': { questId: 'quest-001', completed: true, completedAt: '2025-01-01' },
			'quest-002': { questId: 'quest-002', completed: true, completedAt: '2025-01-02' },
		},
		hideout: {},
		projects: {},
		version: 1,
	}

	const mockQuests: Quest[] = [
		{
			id: 'quest-001',
			trader: 'Trader1',
			name: { en: 'Quest 1' },
			objectives: [{ en: 'Do thing' }],
			xp: 100,
			requiredItemIds: [
				{ itemId: 'metal-parts', quantity: 10 },
				{ itemId: 'spring', quantity: 5 },
			],
		},
		{
			id: 'quest-002',
			trader: 'Trader1',
			name: { en: 'Quest 2' },
			objectives: [{ en: 'Do thing' }],
			xp: 100,
			requiredItemIds: [{ itemId: 'metal-parts', quantity: 20 }],
		},
		{
			id: 'quest-003',
			trader: 'Trader1',
			name: { en: 'Quest 3 (incomplete)' },
			objectives: [{ en: 'Do thing' }],
			xp: 100,
			requiredItemIds: [{ itemId: 'metal-parts', quantity: 100 }],
		},
	]

	it('should calculate requirements for completed quests only', () => {
		const completed = calculateCompletedRequirements(mockProgress, mockQuests, [], [])

		// Quest 1 + Quest 2 only (Quest 3 not completed)
		expect(completed['metal-parts']).toBe(30) // 10 + 20
		expect(completed['spring']).toBe(5)
		expect(completed['not-exists']).toBeUndefined()
	})

	it('should return empty object when no quests completed', () => {
		const emptyProgress: GameProgress = {
			quests: {},
			hideout: {},
			projects: {},
			version: 1,
		}

		const completed = calculateCompletedRequirements(emptyProgress, mockQuests, [], [])

		expect(Object.keys(completed)).toHaveLength(0)
	})

	it('should handle quests without required items', () => {
		const questsWithoutItems: Quest[] = [
			{
				id: 'quest-001',
				trader: 'Trader1',
				name: { en: 'Quest 1' },
				objectives: [{ en: 'Do thing' }],
				xp: 100,
				// No requiredItemIds
			},
		]

		const progress: GameProgress = {
			quests: { 'quest-001': { questId: 'quest-001', completed: true, completedAt: '2025-01-01' } },
			hideout: {},
			projects: {},
			version: 1,
		}

		expect(() => calculateCompletedRequirements(progress, questsWithoutItems, [], [])).not.toThrow()
		const completed = calculateCompletedRequirements(progress, questsWithoutItems, [], [])
		expect(Object.keys(completed)).toHaveLength(0)
	})
})

describe('itemRequirements - Hideout Completion', () => {
	it('should calculate completed hideout level requirements', () => {
		const progress: GameProgress = {
			quests: {},
			hideout: {
				'scrappy-1': { moduleId: 'scrappy', level: 1, completed: true, completedAt: '2025-01-01' },
				'scrappy-2': { moduleId: 'scrappy', level: 2, completed: true, completedAt: '2025-01-02' },
				// scrappy-3 not completed
			},
			projects: {},
			version: 1,
		}

		const modules: HideoutModule[] = [
			{
				id: 'scrappy',
				name: { en: 'Scrappy' },
				maxLevel: 3,
				levels: [
					{ level: 1, requirementItemIds: [{ itemId: 'dog-collar', quantity: 1 }] },
					{ level: 2, requirementItemIds: [{ itemId: 'lemon', quantity: 3 }] },
					{ level: 3, requirementItemIds: [{ itemId: 'metal-parts', quantity: 50 }] },
				],
			},
		]

		const completed = calculateCompletedRequirements(progress, [], modules, [])

		expect(completed['dog-collar']).toBe(1)
		expect(completed['lemon']).toBe(3)
		expect(completed['metal-parts']).toBeUndefined() // Level 3 not completed
	})
})

describe('itemRequirements - Project Completion', () => {
	it('should calculate completed project phase requirements', () => {
		const progress: GameProgress = {
			quests: {},
			hideout: {},
			projects: {
				'expedition_project-1': {
					projectId: 'expedition_project',
					phase: 1,
					completed: true,
					completedAt: '2025-01-01',
				},
				// Phase 2 not completed
			},
			version: 1,
		}

		const projects: Project[] = [
			{
				id: 'expedition_project',
				name: { en: 'Expedition' },
				description: { en: 'Project' },
				phases: [
					{
						phase: 1,
						name: { en: 'Phase 1' },
						requirementItemIds: [{ itemId: 'metal-parts', quantity: 150 }],
					},
					{
						phase: 2,
						name: { en: 'Phase 2' },
						requirementItemIds: [{ itemId: 'spring', quantity: 200 }],
					},
				],
			},
		]

		const completed = calculateCompletedRequirements(progress, [], [], projects)

		expect(completed['metal-parts']).toBe(150)
		expect(completed['spring']).toBeUndefined() // Phase 2 not completed
	})
})

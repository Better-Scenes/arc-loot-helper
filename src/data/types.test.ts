import { describe, it, expect } from 'vitest'
import type { Item, Quest, HideoutModule, Project, SkillNode, LocalizedText } from './types'

describe('Data Types', () => {
	describe('LocalizedText', () => {
		it('should allow string key-value pairs', () => {
			const localized: LocalizedText = {
				en: 'English',
				es: 'Spanish',
				fr: 'French',
			}
			expect(localized.en).toBe('English')
		})
	})

	describe('Item', () => {
		it('should allow valid Item object with all required fields', () => {
			const item: Item = {
				id: 'metal_parts',
				name: { en: 'Metal Parts' },
				description: { en: 'Basic crafting material' },
				type: 'Basic Material',
				rarity: 'Common',
				value: 10,
				weightKg: 0.5,
				stackSize: 50,
				imageFilename: 'metal_parts.png',
			}
			expect(item.id).toBe('metal_parts')
			expect(item.name.en).toBe('Metal Parts')
		})

		it('should allow optional fields', () => {
			const item: Item = {
				id: 'weapon',
				name: { en: 'Weapon' },
				description: { en: 'A weapon' },
				type: 'Weapon',
				rarity: 'Rare',
				value: 100,
				weightKg: 2.5,
				stackSize: 1,
				imageFilename: 'weapon.png',
				recyclesInto: { metal_parts: 5 },
				recipe: { metal_parts: 10, wires: 5 },
				craftBench: 'Gunsmith',
				foundIn: 'Topside',
				effects: { healing: { en: '10 HP' } },
			}
			expect(item.recipe).toBeDefined()
			expect(item.recyclesInto?.metal_parts).toBe(5)
		})
	})

	describe('Quest', () => {
		it('should allow valid Quest object', () => {
			const quest: Quest = {
				id: 'quest_1',
				trader: 'Vendor',
				name: { en: 'First Quest' },
				objectives: [{ en: 'Collect 10 items' }],
				xp: 100,
			}
			expect(quest.id).toBe('quest_1')
			expect(quest.objectives[0].en).toBe('Collect 10 items')
		})

		it('should allow quest with item requirements and rewards', () => {
			const quest: Quest = {
				id: 'quest_2',
				trader: 'Vendor',
				name: { en: 'Second Quest' },
				objectives: [{ en: 'Objective' }],
				xp: 200,
				requiredItemIds: [{ itemId: 'metal_parts', quantity: 10 }],
				rewardItemIds: [{ itemId: 'weapon', quantity: 1 }],
				grantedItemIds: [{ itemId: 'ammo', quantity: 50 }],
				previousQuestIds: ['quest_1'],
				nextQuestIds: ['quest_3'],
			}
			expect(quest.requiredItemIds?.[0]?.quantity).toBe(10)
			expect(quest.previousQuestIds).toEqual(['quest_1'])
		})
	})

	describe('HideoutModule', () => {
		it('should allow valid HideoutModule object', () => {
			const module: HideoutModule = {
				id: 'workbench',
				name: { en: 'Workbench' },
				maxLevel: 5,
				levels: [
					{
						level: 1,
						requirementItemIds: [{ itemId: 'metal_parts', quantity: 10 }],
					},
					{
						level: 2,
						requirementItemIds: [
							{ itemId: 'metal_parts', quantity: 20 },
							{ itemId: 'wires', quantity: 5 },
						],
						otherRequirements: ['1000 Coins'],
					},
				],
			}
			expect(module.maxLevel).toBe(5)
			expect(module.levels).toHaveLength(2)
			expect(module.levels[0].requirementItemIds[0]?.quantity).toBe(10)
		})
	})

	describe('Project', () => {
		it('should allow valid Project object with phases', () => {
			const project: Project = {
				id: 'expedition_project',
				name: { en: 'Expedition' },
				description: { en: 'Complete the expedition' },
				phases: [
					{
						phase: 1,
						name: { en: 'Phase 1' },
						requirementItemIds: [{ itemId: 'metal_parts', quantity: 100 }],
					},
					{
						phase: 2,
						name: { en: 'Phase 2' },
						requirementCategories: {
							'Combat Items': 250000,
							'Survival Items': 100000,
						},
					},
				],
			}
			expect(project.phases).toHaveLength(2)
			expect(project.phases[0].requirementItemIds?.[0]?.quantity).toBe(100)
		})
	})

	describe('SkillNode', () => {
		it('should allow valid SkillNode object', () => {
			const node: SkillNode = {
				id: 'cond_1',
				category: 'CONDITIONING',
				isMajor: false,
				maxPoints: 3,
				name: { en: 'Stamina Boost' },
				description: { en: 'Increases stamina' },
				impactedSkill: 'Stamina',
				position: { x: 100, y: 200 },
				iconName: 'stamina.png',
			}
			expect(node.category).toBe('CONDITIONING')
			expect(node.position.x).toBe(100)
		})

		it('should allow optional prerequisite nodes', () => {
			const node: SkillNode = {
				id: 'cond_2',
				category: 'MOBILITY',
				isMajor: true,
				maxPoints: 1,
				name: { en: 'Sprint' },
				description: { en: 'Sprint faster' },
				impactedSkill: 'Movement Speed',
				position: { x: 150, y: 250 },
				iconName: 'sprint.png',
				prerequisiteNodeIds: ['cond_1'],
			}
			expect(node.prerequisiteNodeIds).toEqual(['cond_1'])
		})
	})
})

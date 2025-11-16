import { describe, it, expect, beforeEach } from 'vitest'
import { useRemainingRequirementsStore } from '../remainingRequirementsStore'
import type { GameData, GameProgress } from '../../data/types'

describe('remainingRequirementsStore - Initialization', () => {
	beforeEach(() => {
		// Reset store
		useRemainingRequirementsStore.setState({ remaining: null })
	})

	it('should initialize with null remaining', () => {
		const { remaining } = useRemainingRequirementsStore.getState()
		expect(remaining).toBeNull()
	})

	it('should have calculate method', () => {
		const { calculate } = useRemainingRequirementsStore.getState()
		expect(typeof calculate).toBe('function')
	})

	it('should have getQuantityNeeded selector', () => {
		const { getQuantityNeeded } = useRemainingRequirementsStore.getState()
		expect(typeof getQuantityNeeded).toBe('function')
	})
})

describe('remainingRequirementsStore - Calculation', () => {
	const mockGameData: GameData = {
		items: [],
		quests: [
			{
				id: 'quest-001',
				trader: 'Trader1',
				name: { en: 'Quest 1' },
				objectives: [{ en: 'Do thing' }],
				xp: 100,
				requiredItemIds: [{ itemId: 'metal-parts', quantity: 100 }],
			},
			{
				id: 'quest-002',
				trader: 'Trader1',
				name: { en: 'Quest 2' },
				objectives: [{ en: 'Do thing' }],
				xp: 100,
				requiredItemIds: [{ itemId: 'metal-parts', quantity: 50 }],
			},
		],
		hideoutModules: [],
		projects: [],
		traders: { traders: [] },
	}

	const mockProgress: GameProgress = {
		quests: {
			'quest-001': { questId: 'quest-001', completed: true, completedAt: '2025-01-01' },
		},
		hideout: {},
		projects: {},
		version: 1,
	}

	beforeEach(() => {
		useRemainingRequirementsStore.setState({ remaining: null })
	})

	it('should calculate remaining requirements', () => {
		const { calculate } = useRemainingRequirementsStore.getState()

		calculate(mockGameData, mockProgress)

		const { remaining } = useRemainingRequirementsStore.getState()

		// Total: 150 (quest-001: 100 + quest-002: 50)
		// Completed: 100 (quest-001 completed)
		// Remaining: 50
		expect(remaining).toBeDefined()
		expect(remaining!['metal-parts']).toBe(50)
	})

	it('should return null when gameData is null', () => {
		const { calculate } = useRemainingRequirementsStore.getState()

		calculate(null, mockProgress)

		const { remaining } = useRemainingRequirementsStore.getState()
		expect(remaining).toBeNull()
	})

	it('should handle no completed progress', () => {
		const emptyProgress: GameProgress = {
			quests: {},
			hideout: {},
			projects: {},
			version: 1,
		}

		const { calculate } = useRemainingRequirementsStore.getState()
		calculate(mockGameData, emptyProgress)

		const { remaining } = useRemainingRequirementsStore.getState()
		expect(remaining!['metal-parts']).toBe(150) // Nothing completed
	})
})

describe('remainingRequirementsStore - Selectors', () => {
	it('should return quantity needed for specific item', () => {
		useRemainingRequirementsStore.setState({
			remaining: {
				'metal-parts': 75,
				spring: 20,
			},
		})

		const { getQuantityNeeded } = useRemainingRequirementsStore.getState()

		expect(getQuantityNeeded('metal-parts')).toBe(75)
		expect(getQuantityNeeded('spring')).toBe(20)
		expect(getQuantityNeeded('not-exists')).toBe(0)
	})

	it('should return 0 when remaining is null', () => {
		useRemainingRequirementsStore.setState({ remaining: null })

		const { getQuantityNeeded } = useRemainingRequirementsStore.getState()

		expect(getQuantityNeeded('metal-parts')).toBe(0)
	})
})

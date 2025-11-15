import { describe, it, expect, beforeEach } from 'vitest'
import { useProgressStore } from '../progressStore'

describe('progressStore - Quest Completion', () => {
	beforeEach(() => {
		// Clear store and localStorage before each test
		localStorage.clear()
		useProgressStore.getState().reset()
	})

	it('should mark a quest as completed', () => {
		const { completeQuest } = useProgressStore.getState()

		completeQuest('quest-001')

		const { progress } = useProgressStore.getState()
		expect(progress.quests['quest-001']).toBeDefined()
		expect(progress.quests['quest-001'].completed).toBe(true)
		expect(progress.quests['quest-001'].completedAt).toBeTruthy()
	})

	it('should not have quest before completion', () => {
		const { progress } = useProgressStore.getState()

		expect(progress.quests['quest-001']).toBeUndefined()
	})
})

describe('progressStore - Persistence', () => {
	beforeEach(() => {
		localStorage.clear()
		useProgressStore.getState().reset()
	})

	it('should persist quest completion to localStorage', () => {
		const { completeQuest } = useProgressStore.getState()

		completeQuest('quest-001')

		const stored = localStorage.getItem('arc-loot-helper-progress')
		expect(stored).toBeTruthy()

		const parsed = JSON.parse(stored!)
		expect(parsed.state.progress.quests['quest-001'].completed).toBe(true)
	})

	it('should maintain correct localStorage structure', () => {
		const { completeQuest } = useProgressStore.getState()

		completeQuest('quest-001')
		completeQuest('quest-002')

		const stored = localStorage.getItem('arc-loot-helper-progress')
		expect(stored).toBeTruthy()

		const parsed = JSON.parse(stored!)
		// Verify structure matches what Zustand persist expects
		expect(parsed.state).toBeDefined()
		expect(parsed.state.progress).toBeDefined()
		expect(parsed.state.progress.quests).toBeDefined()
		expect(parsed.state.progress.hideout).toBeDefined()
		expect(parsed.state.progress.projects).toBeDefined()
		expect(parsed.state.progress.version).toBe(1)

		// Verify quest data is preserved
		expect(Object.keys(parsed.state.progress.quests)).toHaveLength(2)
		expect(parsed.state.progress.quests['quest-001'].completed).toBe(true)
		expect(parsed.state.progress.quests['quest-002'].completed).toBe(true)
	})
})

describe('progressStore - Queries', () => {
	beforeEach(() => {
		localStorage.clear()
		useProgressStore.getState().reset()
	})

	it('should return true if quest is completed', () => {
		const { completeQuest, isQuestCompleted } = useProgressStore.getState()

		completeQuest('quest-001')

		expect(isQuestCompleted('quest-001')).toBe(true)
	})

	it('should return false if quest is not completed', () => {
		const { isQuestCompleted } = useProgressStore.getState()

		expect(isQuestCompleted('quest-999')).toBe(false)
	})

	it('should return false for uncompleted quest', () => {
		const { completeQuest, isQuestCompleted } = useProgressStore.getState()

		completeQuest('quest-001')

		expect(isQuestCompleted('quest-001')).toBe(true)
		expect(isQuestCompleted('quest-002')).toBe(false)
	})
})

describe('progressStore - Uncomplete', () => {
	beforeEach(() => {
		localStorage.clear()
		useProgressStore.getState().reset()
	})

	it('should uncomplete a quest', () => {
		const { completeQuest, uncompleteQuest, isQuestCompleted } = useProgressStore.getState()

		completeQuest('quest-001')
		expect(isQuestCompleted('quest-001')).toBe(true)

		uncompleteQuest('quest-001')

		expect(isQuestCompleted('quest-001')).toBe(false)
	})

	it('should remove quest from progress when uncompleted', () => {
		const { completeQuest, uncompleteQuest } = useProgressStore.getState()

		completeQuest('quest-001')
		uncompleteQuest('quest-001')

		const { progress } = useProgressStore.getState()
		expect(progress.quests['quest-001']).toBeUndefined()
	})

	it('should handle uncompleting non-existent quest', () => {
		const { uncompleteQuest, isQuestCompleted } = useProgressStore.getState()

		expect(() => uncompleteQuest('quest-999')).not.toThrow()
		expect(isQuestCompleted('quest-999')).toBe(false)
	})

	it('should only uncomplete specified quest', () => {
		const { completeQuest, uncompleteQuest, isQuestCompleted } = useProgressStore.getState()

		completeQuest('quest-001')
		completeQuest('quest-002')
		completeQuest('quest-003')

		uncompleteQuest('quest-002')

		expect(isQuestCompleted('quest-001')).toBe(true)
		expect(isQuestCompleted('quest-002')).toBe(false)
		expect(isQuestCompleted('quest-003')).toBe(true)
	})
})

describe('progressStore - Input Validation & Edge Cases', () => {
	beforeEach(() => {
		localStorage.clear()
		useProgressStore.getState().reset()
	})

	it('should handle empty string quest ID gracefully', () => {
		const { completeQuest, isQuestCompleted } = useProgressStore.getState()

		expect(() => completeQuest('')).not.toThrow()
		expect(isQuestCompleted('')).toBe(false)
	})

	it('should handle null quest ID gracefully', () => {
		const { completeQuest, isQuestCompleted } = useProgressStore.getState()

		expect(() => completeQuest(null as any)).not.toThrow()
		expect(() => isQuestCompleted(null as any)).not.toThrow()
		expect(isQuestCompleted(null as any)).toBe(false)
	})

	it('should handle undefined quest ID gracefully', () => {
		const { completeQuest, isQuestCompleted } = useProgressStore.getState()

		expect(() => completeQuest(undefined as any)).not.toThrow()
		expect(() => isQuestCompleted(undefined as any)).not.toThrow()
		expect(isQuestCompleted(undefined as any)).toBe(false)
	})

	it('should handle completing the same quest multiple times', () => {
		const { completeQuest, progress } = useProgressStore.getState()

		completeQuest('quest-001')
		const { progress: progress1 } = useProgressStore.getState()
		const firstTimestamp = progress1.quests['quest-001'].completedAt

		// Wait a tiny bit then complete again
		completeQuest('quest-001')
		const { progress: progress2 } = useProgressStore.getState()
		const secondTimestamp = progress2.quests['quest-001'].completedAt

		// Should still be completed and timestamp should be updated
		expect(progress2.quests['quest-001'].completed).toBe(true)
		// Note: timestamps might be the same if execution is too fast, so we just verify it exists
		expect(secondTimestamp).toBeTruthy()
	})

	it('should handle special characters in quest IDs', () => {
		const { completeQuest, isQuestCompleted } = useProgressStore.getState()
		const specialIds = ['quest-with-dashes', 'quest_with_underscores', 'quest.with.dots', 'quest:with:colons']

		specialIds.forEach((id) => {
			completeQuest(id)
			expect(isQuestCompleted(id)).toBe(true)
		})
	})

	it('should handle very long quest IDs', () => {
		const { completeQuest, isQuestCompleted } = useProgressStore.getState()
		const longId = 'a'.repeat(1000)

		expect(() => completeQuest(longId)).not.toThrow()
		expect(isQuestCompleted(longId)).toBe(true)
	})
})

describe('progressStore - Hideout Level Completion', () => {
	beforeEach(() => {
		localStorage.clear()
		useProgressStore.getState().reset()
	})

	it('should mark hideout level as completed', () => {
		const { completeHideoutLevel } = useProgressStore.getState()

		completeHideoutLevel('gunsmith', 3)

		const { progress } = useProgressStore.getState()
		expect(progress.hideout['gunsmith-3']).toBeDefined()
		expect(progress.hideout['gunsmith-3'].completed).toBe(true)
		expect(progress.hideout['gunsmith-3'].completedAt).toBeTruthy()
		expect(progress.hideout['gunsmith-3'].moduleId).toBe('gunsmith')
		expect(progress.hideout['gunsmith-3'].level).toBe(3)
	})

	it('should check if hideout level is completed', () => {
		const { completeHideoutLevel, isHideoutLevelCompleted } = useProgressStore.getState()

		completeHideoutLevel('gunsmith', 3)

		expect(isHideoutLevelCompleted('gunsmith', 3)).toBe(true)
		expect(isHideoutLevelCompleted('gunsmith', 2)).toBe(false)
		expect(isHideoutLevelCompleted('refiner', 1)).toBe(false)
	})

	it('should uncomplete hideout level', () => {
		const { completeHideoutLevel, uncompleteHideoutLevel, isHideoutLevelCompleted } =
			useProgressStore.getState()

		completeHideoutLevel('gunsmith', 3)
		expect(isHideoutLevelCompleted('gunsmith', 3)).toBe(true)

		uncompleteHideoutLevel('gunsmith', 3)

		expect(isHideoutLevelCompleted('gunsmith', 3)).toBe(false)
	})

	it('should handle multiple hideout levels independently', () => {
		const { completeHideoutLevel, isHideoutLevelCompleted } = useProgressStore.getState()

		completeHideoutLevel('gunsmith', 1)
		completeHideoutLevel('gunsmith', 2)
		completeHideoutLevel('refiner', 1)

		expect(isHideoutLevelCompleted('gunsmith', 1)).toBe(true)
		expect(isHideoutLevelCompleted('gunsmith', 2)).toBe(true)
		expect(isHideoutLevelCompleted('gunsmith', 3)).toBe(false)
		expect(isHideoutLevelCompleted('refiner', 1)).toBe(true)
	})

	it('should validate hideout inputs', () => {
		const { completeHideoutLevel, isHideoutLevelCompleted } = useProgressStore.getState()

		expect(() => completeHideoutLevel('', 1)).not.toThrow()
		expect(() => completeHideoutLevel('gunsmith', 0)).not.toThrow()
		expect(() => completeHideoutLevel('gunsmith', -1)).not.toThrow()

		expect(isHideoutLevelCompleted('', 1)).toBe(false)
		expect(isHideoutLevelCompleted('gunsmith', 0)).toBe(false)
	})
})

describe('progressStore - Project Phase Completion', () => {
	beforeEach(() => {
		localStorage.clear()
		useProgressStore.getState().reset()
	})

	it('should mark project phase as completed', () => {
		const { completeProjectPhase } = useProgressStore.getState()

		completeProjectPhase('expedition', 2)

		const { progress } = useProgressStore.getState()
		expect(progress.projects['expedition-2']).toBeDefined()
		expect(progress.projects['expedition-2'].completed).toBe(true)
		expect(progress.projects['expedition-2'].completedAt).toBeTruthy()
		expect(progress.projects['expedition-2'].projectId).toBe('expedition')
		expect(progress.projects['expedition-2'].phase).toBe(2)
	})

	it('should check if project phase is completed', () => {
		const { completeProjectPhase, isProjectPhaseCompleted } = useProgressStore.getState()

		completeProjectPhase('expedition', 2)

		expect(isProjectPhaseCompleted('expedition', 2)).toBe(true)
		expect(isProjectPhaseCompleted('expedition', 1)).toBe(false)
		expect(isProjectPhaseCompleted('other-project', 1)).toBe(false)
	})

	it('should uncomplete project phase', () => {
		const { completeProjectPhase, uncompleteProjectPhase, isProjectPhaseCompleted } =
			useProgressStore.getState()

		completeProjectPhase('expedition', 2)
		expect(isProjectPhaseCompleted('expedition', 2)).toBe(true)

		uncompleteProjectPhase('expedition', 2)

		expect(isProjectPhaseCompleted('expedition', 2)).toBe(false)
	})

	it('should handle multiple project phases independently', () => {
		const { completeProjectPhase, isProjectPhaseCompleted } = useProgressStore.getState()

		completeProjectPhase('expedition', 1)
		completeProjectPhase('expedition', 2)
		completeProjectPhase('expedition', 3)

		expect(isProjectPhaseCompleted('expedition', 1)).toBe(true)
		expect(isProjectPhaseCompleted('expedition', 2)).toBe(true)
		expect(isProjectPhaseCompleted('expedition', 3)).toBe(true)
		expect(isProjectPhaseCompleted('expedition', 4)).toBe(false)
	})

	it('should validate project inputs', () => {
		const { completeProjectPhase, isProjectPhaseCompleted } = useProgressStore.getState()

		expect(() => completeProjectPhase('', 1)).not.toThrow()
		expect(() => completeProjectPhase('expedition', 0)).not.toThrow()
		expect(() => completeProjectPhase('expedition', -1)).not.toThrow()

		expect(isProjectPhaseCompleted('', 1)).toBe(false)
		expect(isProjectPhaseCompleted('expedition', 0)).toBe(false)
	})
})

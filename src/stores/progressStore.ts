import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GameProgress, QuestProgress } from '../data/types'
import { getHideoutKey, getProjectKey } from '../utils/progressKeys'

interface ProgressStore {
	progress: GameProgress
	completeQuest: (questId: string) => void
	uncompleteQuest: (questId: string) => void
	isQuestCompleted: (questId: string) => boolean
	completeHideoutLevel: (moduleId: string, level: number) => void
	uncompleteHideoutLevel: (moduleId: string, level: number) => void
	isHideoutLevelCompleted: (moduleId: string, level: number) => boolean
	completeProjectPhase: (projectId: string, phase: number) => void
	uncompleteProjectPhase: (projectId: string, phase: number) => void
	isProjectPhaseCompleted: (projectId: string, phase: number) => boolean
	reset: () => void
}

const initialState: GameProgress = {
	quests: {},
	hideout: {},
	projects: {},
	version: 1,
}

/**
 * Validates that a quest ID is a non-empty string
 */
const isValidQuestId = (questId: string): boolean => {
	return typeof questId === 'string' && questId.length > 0
}

/**
 * Validates hideout level inputs
 */
const isValidHideoutLevel = (moduleId: string, level: number): boolean => {
	return typeof moduleId === 'string' && moduleId.length > 0 && typeof level === 'number' && level > 0
}

/**
 * Validates project phase inputs
 */
const isValidProjectPhase = (projectId: string, phase: number): boolean => {
	return typeof projectId === 'string' && projectId.length > 0 && typeof phase === 'number' && phase > 0
}

/**
 * Generic helper to create completion action
 * Reduces duplication across quest/hideout/project completion logic
 */
const createCompleteAction = <T extends { completed: boolean; completedAt: string | null }>(
	collectionKey: keyof GameProgress,
	key: string,
	entry: T
) => {
	return (state: { progress: GameProgress }) => ({
		progress: {
			...state.progress,
			[collectionKey]: {
				...state.progress[collectionKey],
				[key]: {
					...entry,
					completed: true,
					completedAt: new Date().toISOString(),
				},
			},
		},
	})
}

/**
 * Generic helper to create uncomplete action
 * Reduces duplication across quest/hideout/project uncomplete logic
 */
const createUncompleteAction = (collectionKey: keyof GameProgress, key: string) => {
	return (state: { progress: GameProgress }) => {
		const collection = state.progress[collectionKey] as Record<string, unknown>
		const { [key]: removed, ...remaining } = collection
		return {
			progress: {
				...state.progress,
				[collectionKey]: remaining,
			},
		}
	}
}

/**
 * Generic helper to check completion status
 * Reduces duplication across quest/hideout/project query logic
 */
const isCompleted = (state: GameProgress, collectionKey: keyof GameProgress, key: string): boolean => {
	const collection = state[collectionKey] as Record<string, { completed?: boolean }>
	return collection[key]?.completed ?? false
}

export const useProgressStore = create<ProgressStore>()(
	persist(
		(set, get) => ({
			progress: initialState,

			completeQuest: (questId) => {
				if (!isValidQuestId(questId)) return
				set(createCompleteAction('quests', questId, { questId, completed: false, completedAt: null }))
			},

			uncompleteQuest: (questId) => {
				if (!isValidQuestId(questId)) return
				set(createUncompleteAction('quests', questId))
			},

			isQuestCompleted: (questId) => {
				if (!isValidQuestId(questId)) return false
				return isCompleted(get().progress, 'quests', questId)
			},

			completeHideoutLevel: (moduleId, level) => {
				if (!isValidHideoutLevel(moduleId, level)) return
				const key = getHideoutKey(moduleId, level)
				set(createCompleteAction('hideout', key, { moduleId, level, completed: false, completedAt: null }))
			},

			uncompleteHideoutLevel: (moduleId, level) => {
				if (!isValidHideoutLevel(moduleId, level)) return
				set(createUncompleteAction('hideout', getHideoutKey(moduleId, level)))
			},

			isHideoutLevelCompleted: (moduleId, level) => {
				if (!isValidHideoutLevel(moduleId, level)) return false
				return isCompleted(get().progress, 'hideout', getHideoutKey(moduleId, level))
			},

			completeProjectPhase: (projectId, phase) => {
				if (!isValidProjectPhase(projectId, phase)) return
				const key = getProjectKey(projectId, phase)
				set(createCompleteAction('projects', key, { projectId, phase, completed: false, completedAt: null }))
			},

			uncompleteProjectPhase: (projectId, phase) => {
				if (!isValidProjectPhase(projectId, phase)) return
				set(createUncompleteAction('projects', getProjectKey(projectId, phase)))
			},

			isProjectPhaseCompleted: (projectId, phase) => {
				if (!isValidProjectPhase(projectId, phase)) return false
				return isCompleted(get().progress, 'projects', getProjectKey(projectId, phase))
			},

			reset: () => set({ progress: initialState }),
		}),
		{
			name: 'arc-loot-helper-progress',
			storage: createJSONStorage(() => localStorage),
		}
	)
)

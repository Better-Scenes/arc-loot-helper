import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GameProgress } from '../data/types'
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

export const useProgressStore = create<ProgressStore>()(
	persist(
		(set, get) => ({
			progress: initialState,

			completeQuest: (questId) => {
				if (!isValidQuestId(questId)) return
				set((state) => ({
					progress: {
						...state.progress,
						quests: {
							...state.progress.quests,
							[questId]: {
								questId,
								completed: true,
								completedAt: new Date().toISOString(),
							},
						},
					},
				}))
			},

			uncompleteQuest: (questId) => {
				if (!isValidQuestId(questId)) return
				set((state) => {
					const { [questId]: removed, ...remainingQuests } = state.progress.quests
					return {
						progress: {
							...state.progress,
							quests: remainingQuests,
						},
					}
				})
			},

			isQuestCompleted: (questId) => {
				if (!isValidQuestId(questId)) return false
				return get().progress.quests[questId]?.completed ?? false
			},

			completeHideoutLevel: (moduleId, level) => {
				if (!isValidHideoutLevel(moduleId, level)) return
				const key = getHideoutKey(moduleId, level)
				set((state) => ({
					progress: {
						...state.progress,
						hideout: {
							...state.progress.hideout,
							[key]: {
								moduleId,
								level,
								completed: true,
								completedAt: new Date().toISOString(),
							},
						},
					},
				}))
			},

			uncompleteHideoutLevel: (moduleId, level) => {
				if (!isValidHideoutLevel(moduleId, level)) return
				const key = getHideoutKey(moduleId, level)
				set((state) => {
					const { [key]: removed, ...remainingHideout } = state.progress.hideout
					return {
						progress: {
							...state.progress,
							hideout: remainingHideout,
						},
					}
				})
			},

			isHideoutLevelCompleted: (moduleId, level) => {
				if (!isValidHideoutLevel(moduleId, level)) return false
				const key = getHideoutKey(moduleId, level)
				return get().progress.hideout[key]?.completed ?? false
			},

			completeProjectPhase: (projectId, phase) => {
				if (!isValidProjectPhase(projectId, phase)) return
				const key = getProjectKey(projectId, phase)
				set((state) => ({
					progress: {
						...state.progress,
						projects: {
							...state.progress.projects,
							[key]: {
								projectId,
								phase,
								completed: true,
								completedAt: new Date().toISOString(),
							},
						},
					},
				}))
			},

			uncompleteProjectPhase: (projectId, phase) => {
				if (!isValidProjectPhase(projectId, phase)) return
				const key = getProjectKey(projectId, phase)
				set((state) => {
					const { [key]: removed, ...remainingProjects } = state.progress.projects
					return {
						progress: {
							...state.progress,
							projects: remainingProjects,
						},
					}
				})
			},

			isProjectPhaseCompleted: (projectId, phase) => {
				if (!isValidProjectPhase(projectId, phase)) return false
				const key = getProjectKey(projectId, phase)
				return get().progress.projects[key]?.completed ?? false
			},

			reset: () => set({ progress: initialState }),
		}),
		{
			name: 'arc-loot-helper-progress',
			storage: createJSONStorage(() => localStorage),
		}
	)
)

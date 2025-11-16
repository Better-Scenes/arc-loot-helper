import { create } from 'zustand'
import type { GameData, GameProgress, ItemRequirements } from '../data/types'
import {
	calculateItemRequirements,
	calculateCompletedRequirements,
	calculateRemainingRequirements,
} from '../utils/itemRequirements'

interface RemainingRequirementsStore {
	remaining: ItemRequirements | null
	calculate: (gameData: GameData | null, progress: GameProgress) => void
	getQuantityNeeded: (itemId: string) => number
}

export const useRemainingRequirementsStore = create<RemainingRequirementsStore>((set, get) => ({
	remaining: null,

	calculate: (gameData, progress) => {
		if (!gameData) {
			set({ remaining: null })
			return
		}

		// Calculate total requirements across all sources
		const total = calculateItemRequirements(
			gameData.quests,
			gameData.hideoutModules,
			gameData.projects
		)

		// Calculate what's been completed
		const completed = calculateCompletedRequirements(
			progress,
			gameData.quests,
			gameData.hideoutModules,
			gameData.projects
		)

		// Calculate what's remaining
		const remaining = calculateRemainingRequirements(total, completed)

		set({ remaining })
	},

	getQuantityNeeded: itemId => {
		return get().remaining?.[itemId] ?? 0
	},
}))

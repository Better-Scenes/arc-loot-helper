/**
 * Custom React Hooks for Loading Game Data
 * Now uses React Context for centralized data management
 */

import { useContext } from 'react'
import { GameDataContext } from '../contexts/GameDataContext'
import type { Item, Quest, HideoutModule, Project, SkillNode } from '../data/types'

/**
 * Hook result structure with loading state and error handling
 */
export interface UseDataResult<T> {
	data: T | null
	loading: boolean
	error: Error | null
}

/**
 * All game data structure
 */
export interface GameData {
	items: Item[]
	quests: Quest[]
	hideoutModules: HideoutModule[]
	projects: Project[]
	skillNodes: SkillNode[]
}

/**
 * Hook to access all game data from context
 */
export function useGameData(): UseDataResult<GameData> {
	const context = useContext(GameDataContext)

	if (!context) {
		throw new Error('useGameData must be used within a GameDataProvider')
	}

	return context
}

/**
 * Hook to access items data from context
 */
export function useItems(): UseDataResult<Item[]> {
	const { data, loading, error } = useGameData()
	return {
		data: data?.items || null,
		loading,
		error,
	}
}

/**
 * Hook to access quests data from context
 */
export function useQuests(): UseDataResult<Quest[]> {
	const { data, loading, error } = useGameData()
	return {
		data: data?.quests || null,
		loading,
		error,
	}
}

/**
 * Hook to access hideout modules data from context
 */
export function useHideoutModules(): UseDataResult<HideoutModule[]> {
	const { data, loading, error } = useGameData()
	return {
		data: data?.hideoutModules || null,
		loading,
		error,
	}
}

/**
 * Hook to access projects data from context
 */
export function useProjects(): UseDataResult<Project[]> {
	const { data, loading, error } = useGameData()
	return {
		data: data?.projects || null,
		loading,
		error,
	}
}

/**
 * Hook to access skill nodes data from context
 */
export function useSkillNodes(): UseDataResult<SkillNode[]> {
	const { data, loading, error } = useGameData()
	return {
		data: data?.skillNodes || null,
		loading,
		error,
	}
}

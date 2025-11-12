/**
 * Custom React Hooks for Loading Game Data
 * Uses traditional useState + useEffect for reliable data fetching
 */

import { useState, useEffect } from 'react'
import type { Item, Quest, HideoutModule, Project, SkillNode } from '../data/types'
import { normalizeItems } from '../utils/normalizeGameData'

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
 * Fetch JSON data from a URL
 */
async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
	}
	return response.json()
}

/**
 * Generic hook for fetching data
 */
function useFetchData<T>(url: string): UseDataResult<T> {
	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		let cancelled = false

		async function loadData() {
			try {
				setLoading(true)
				setError(null)
				const result = await fetchJson<T>(url)

				if (!cancelled) {
					setData(result)
					setLoading(false)
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error(String(err)))
					setLoading(false)
				}
			}
		}

		loadData()

		// Cleanup function to prevent state updates after unmount
		return () => {
			cancelled = true
		}
	}, [url])

	return { data, loading, error }
}

/**
 * Hook to load all game data
 */
export function useGameData(): UseDataResult<GameData> {
	const [data, setData] = useState<GameData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		let cancelled = false

		async function loadAllData() {
			try {
				setLoading(true)
				setError(null)

				// Fetch all data in parallel
				const [rawItems, quests, hideoutModules, projects, skillNodes] = await Promise.all([
					fetchJson<Item[]>('/data/items.json'),
					fetchJson<Quest[]>('/data/quests.json'),
					fetchJson<HideoutModule[]>('/data/hideoutModules.json'),
					fetchJson<Project[]>('/data/projects.json'),
					fetchJson<SkillNode[]>('/data/skillNodes.json'),
				])

				// Normalize items to use game's category types
				const items = normalizeItems(rawItems)

				if (!cancelled) {
					setData({ items, quests, hideoutModules, projects, skillNodes })
					setLoading(false)
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error(String(err)))
					setLoading(false)
				}
			}
		}

		loadAllData()

		return () => {
			cancelled = true
		}
	}, [])

	return { data, loading, error }
}

/**
 * Hook to load items data
 */
export function useItems(): UseDataResult<Item[]> {
	return useFetchData<Item[]>('/data/items.json')
}

/**
 * Hook to load quests data
 */
export function useQuests(): UseDataResult<Quest[]> {
	return useFetchData<Quest[]>('/data/quests.json')
}

/**
 * Hook to load hideout modules data
 */
export function useHideoutModules(): UseDataResult<HideoutModule[]> {
	return useFetchData<HideoutModule[]>('/data/hideoutModules.json')
}

/**
 * Hook to load projects data
 */
export function useProjects(): UseDataResult<Project[]> {
	return useFetchData<Project[]>('/data/projects.json')
}

/**
 * Hook to load skill nodes data
 */
export function useSkillNodes(): UseDataResult<SkillNode[]> {
	return useFetchData<SkillNode[]>('/data/skillNodes.json')
}

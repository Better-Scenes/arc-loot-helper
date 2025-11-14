/**
 * GameDataContext - Centralized game data management
 * Provides all game data through React Context to avoid duplicate fetches
 */

import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Item, Quest, HideoutModule, Project, SkillNode } from '../data/types'
import { normalizeItems } from '../utils/normalizeGameData'

/**
 * Game data structure
 */
export interface GameData {
	items: Item[]
	quests: Quest[]
	hideoutModules: HideoutModule[]
	projects: Project[]
	skillNodes: SkillNode[]
}

/**
 * Context value with loading state and error handling
 */
export interface GameDataContextValue {
	data: GameData | null
	loading: boolean
	error: Error | null
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
 * Create the context with default values
 */
export const GameDataContext = createContext<GameDataContextValue>({
	data: null,
	loading: true,
	error: null,
})

/**
 * Provider component props
 */
interface GameDataProviderProps {
	children: ReactNode
}

/**
 * GameDataProvider - Fetches and provides all game data to child components
 */
export function GameDataProvider({ children }: GameDataProviderProps) {
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

	return (
		<GameDataContext.Provider value={{ data, loading, error }}>
			{children}
		</GameDataContext.Provider>
	)
}

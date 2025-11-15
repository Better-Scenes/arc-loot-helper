import { useEffect } from 'react'
import { useGameData } from './useGameData'
import { useProgressStore } from '../stores/progressStore'
import { useRemainingRequirementsStore } from '../stores/remainingRequirementsStore'

/**
 * Synchronizes remaining requirements store with game data and progress.
 * Call this hook once at the app level to keep derived state in sync.
 *
 * This bridges GameDataContext (server data) and progressStore (client state)
 * to keep remainingRequirementsStore (derived state) up to date.
 *
 * @example
 * ```tsx
 * function App() {
 *   useSyncRemainingRequirements()
 *   return <Routes>...</Routes>
 * }
 * ```
 */
export function useSyncRemainingRequirements(): void {
	const { data } = useGameData()
	const progress = useProgressStore((state) => state.progress)
	const calculate = useRemainingRequirementsStore((state) => state.calculate)

	useEffect(() => {
		calculate(data, progress)
	}, [data, progress, calculate])
}

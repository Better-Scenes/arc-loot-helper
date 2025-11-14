/**
 * Tests for Game Data Hooks
 * Unit tests focused on hook structure and behavior with Context
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { GameDataProvider } from '../contexts/GameDataContext'
import {
	useGameData,
	useItems,
	useQuests,
	useHideoutModules,
	useProjects,
} from './useGameData'

/**
 * Test wrapper that provides the GameDataContext
 */
function wrapper({ children }: { children: ReactNode }) {
	return <GameDataProvider>{children}</GameDataProvider>
}

describe('Game Data Hooks', () => {
	describe('useGameData', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useGameData(), { wrapper })

			// Initially loading
			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useGameData(), { wrapper })

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useItems', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useItems(), { wrapper })

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useItems(), { wrapper })

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useQuests', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useQuests(), { wrapper })

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useQuests(), { wrapper })

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useHideoutModules', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useHideoutModules(), { wrapper })

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useHideoutModules(), { wrapper })

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useProjects', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useProjects(), { wrapper })

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useProjects(), { wrapper })

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})
})

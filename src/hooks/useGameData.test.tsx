/**
 * Tests for Game Data Hooks
 * Unit tests focused on hook structure and behavior
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
	useGameData,
	useItems,
	useQuests,
	useHideoutModules,
	useProjects,
	useSkillNodes,
} from './useGameData'

describe('Game Data Hooks', () => {
	describe('useGameData', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useGameData())

			// Initially loading
			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useGameData())

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useItems', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useItems())

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useItems())

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useQuests', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useQuests())

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useQuests())

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useHideoutModules', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useHideoutModules())

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useHideoutModules())

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useProjects', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useProjects())

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useProjects())

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})

	describe('useSkillNodes', () => {
		it('should initialize with loading state', () => {
			const { result } = renderHook(() => useSkillNodes())

			expect(result.current.loading).toBe(true)
			expect(result.current.error).toBe(null)
			expect(result.current.data).toBe(null)
		})

		it('should return correct structure', () => {
			const { result } = renderHook(() => useSkillNodes())

			expect(result.current).toHaveProperty('data')
			expect(result.current).toHaveProperty('loading')
			expect(result.current).toHaveProperty('error')
		})
	})
})

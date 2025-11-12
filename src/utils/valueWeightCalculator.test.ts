/**
 * Tests for Value/Weight Ratio Calculator
 * Following TDD: RED phase - write failing tests first
 */

import { describe, it, expect } from 'vitest'
import type { Item } from '../data/types'
import { calculateValuePerWeight, calculateValueWeightRatios } from './valueWeightCalculator'

describe('Value/Weight Ratio Calculator', () => {
	const mockItems: Item[] = [
		{
			id: 'item1',
			name: { en: 'Heavy Valuable Item' },
			description: { en: 'Description' },
			type: 'Resource',
			rarity: 'Rare',
			value: 1000,
			weightKg: 10,
			stackSize: 1,
			imageFilename: 'item1.png',
		},
		{
			id: 'item2',
			name: { en: 'Light Valuable Item' },
			description: { en: 'Description' },
			type: 'Resource',
			rarity: 'Uncommon',
			value: 500,
			weightKg: 1,
			stackSize: 10,
			imageFilename: 'item2.png',
		},
		{
			id: 'item3',
			name: { en: 'Zero Weight Item' },
			description: { en: 'Description' },
			type: 'Resource',
			rarity: 'Common',
			value: 100,
			weightKg: 0,
			stackSize: 100,
			imageFilename: 'item3.png',
		},
		{
			id: 'item4',
			name: { en: 'Zero Value Item' },
			description: { en: 'Description' },
			type: 'Resource',
			rarity: 'Common',
			value: 0,
			weightKg: 5,
			stackSize: 50,
			imageFilename: 'item4.png',
		},
		{
			id: 'item5',
			name: { en: 'Zero Value and Weight' },
			description: { en: 'Description' },
			type: 'Resource',
			rarity: 'Common',
			value: 0,
			weightKg: 0,
			stackSize: 1,
			imageFilename: 'item5.png',
		},
	]

	describe('calculateValuePerWeight', () => {
		it('should calculate ratio for normal items', () => {
			const result = calculateValuePerWeight(mockItems[0])
			expect(result).toBe(100) // 1000 / 10 = 100
		})

		it('should calculate ratio for light items', () => {
			const result = calculateValuePerWeight(mockItems[1])
			expect(result).toBe(500) // 500 / 1 = 500
		})

		it('should return Infinity for zero-weight items', () => {
			const result = calculateValuePerWeight(mockItems[2])
			expect(result).toBe(Infinity)
		})

		it('should return 0 for zero-value items', () => {
			const result = calculateValuePerWeight(mockItems[3])
			expect(result).toBe(0) // 0 / 5 = 0
		})

		it('should return 0 for items with both zero value and zero weight', () => {
			const result = calculateValuePerWeight(mockItems[4])
			expect(result).toBe(0)
		})

		it('should handle negative values gracefully', () => {
			const negativeItem: Item = {
				...mockItems[0],
				value: -100,
			}
			const result = calculateValuePerWeight(negativeItem)
			expect(result).toBe(-10) // -100 / 10 = -10
		})
	})

	describe('calculateValueWeightRatios', () => {
		it('should calculate ratios for all items and sort by ratio', () => {
			const result = calculateValueWeightRatios(mockItems)

			expect(result).toHaveLength(5)
			// Results should be sorted by valuePerWeight descending
			// item3 (Infinity) > item2 (500) > item1 (100) > item4/item5 (0)
			expect(result[0]).toEqual({
				itemId: 'item3',
				valuePerWeight: Infinity,
			})
			expect(result[1]).toEqual({
				itemId: 'item2',
				valuePerWeight: 500,
			})
			expect(result[2]).toEqual({
				itemId: 'item1',
				valuePerWeight: 100,
			})
			expect(result[3]).toEqual({
				itemId: 'item4',
				valuePerWeight: 0,
			})
			expect(result[4]).toEqual({
				itemId: 'item5',
				valuePerWeight: 0,
			})
		})

		it('should handle empty array', () => {
			const result = calculateValueWeightRatios([])
			expect(result).toEqual([])
		})

		it('should return results sorted by value/weight ratio (descending)', () => {
			const result = calculateValueWeightRatios(mockItems)

			// Check that items are sorted by valuePerWeight descending
			// item3 (Infinity) > item2 (500) > item1 (100) > item4 (0) > item5 (0)
			expect(result[0].itemId).toBe('item3')
			expect(result[1].itemId).toBe('item2')
			expect(result[2].itemId).toBe('item1')
			// item4 and item5 both have 0, order doesn't matter
		})

		it('should maintain stable sort for equal ratios', () => {
			const equalItems: Item[] = [
				{ ...mockItems[0], id: 'equal1', value: 100, weightKg: 1 },
				{ ...mockItems[0], id: 'equal2', value: 100, weightKg: 1 },
				{ ...mockItems[0], id: 'equal3', value: 100, weightKg: 1 },
			]

			const result = calculateValueWeightRatios(equalItems)

			// All should have same ratio
			expect(result[0].valuePerWeight).toBe(100)
			expect(result[1].valuePerWeight).toBe(100)
			expect(result[2].valuePerWeight).toBe(100)

			// Should maintain original order
			expect(result[0].itemId).toBe('equal1')
			expect(result[1].itemId).toBe('equal2')
			expect(result[2].itemId).toBe('equal3')
		})
	})
})

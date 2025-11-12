/**
 * Value/Weight Ratio Calculator
 * Calculates value-per-weight ratios for items to help with loot prioritization
 */

import type { Item } from '../data/types'

/**
 * Result of value/weight calculation for a single item
 */
export interface ValueWeightRatio {
	itemId: string
	valuePerWeight: number
}

/**
 * Calculate value per weight for a single item
 * Returns Infinity for zero-weight items
 * Returns 0 for zero-value items or if both are zero
 *
 * @param item - The item to calculate ratio for
 * @returns Value per weight ratio
 */
export function calculateValuePerWeight(item: Item): number {
	// Handle undefined values
	const value = item.value ?? 0
	const weight = item.weightKg ?? 0

	// Special case: zero weight but has value -> Infinity (very valuable for carry capacity)
	if (weight === 0 && value > 0) {
		return Infinity
	}

	// Special case: zero value or both zero -> 0
	if (value === 0) {
		return 0
	}

	// Normal case: value / weight
	return value / weight
}

/**
 * Calculate value/weight ratios for all items and return sorted by ratio (descending)
 *
 * @param items - Array of items to calculate ratios for
 * @returns Array of value/weight ratios sorted descending (highest value/weight first)
 */
export function calculateValueWeightRatios(items: Item[]): ValueWeightRatio[] {
	const ratios = items.map(item => ({
		itemId: item.id,
		valuePerWeight: calculateValuePerWeight(item),
	}))

	// Sort by valuePerWeight descending (highest ratio first)
	// Use stable sort to maintain original order for equal values
	return ratios.sort((a, b) => b.valuePerWeight - a.valuePerWeight)
}

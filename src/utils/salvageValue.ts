/**
 * Calculate the total recycle value of recycling an item
 */

import type { Item } from '../data/types'

export interface RecycleValueResult {
	recycleValue: number
	recycleBreakdown: Array<{ itemId: string; quantity: number; value: number; total: number }>
}

/**
 * Calculate recycle value for an item by looking up component values
 * @param item - The item to analyze
 * @param allItems - All items (to look up component values)
 * @returns Recycle value information
 */
export function calculateSalvageValue(
	item: Item,
	allItems: Item[]
): RecycleValueResult | null {
	// If item can't be recycled, return null
	if (!item.recyclesInto) {
		return null
	}

	// Create a lookup map for quick item value access
	const itemValueMap = new Map<string, number>()
	for (const itm of allItems) {
		itemValueMap.set(itm.id, itm.value || 0)
	}

	const result: RecycleValueResult = {
		recycleValue: 0,
		recycleBreakdown: [],
	}

	// Calculate recycle value
	for (const [componentId, quantity] of Object.entries(item.recyclesInto)) {
		const componentValue = itemValueMap.get(componentId) || 0
		const total = componentValue * quantity
		result.recycleValue += total
		result.recycleBreakdown.push({
			itemId: componentId,
			quantity,
			value: componentValue,
			total,
		})
	}

	return result
}

/**
 * Get efficiency percentage (recycle value / item value)
 * @param item - The item
 * @param recycleResult - The recycle calculation result
 * @returns Percentage (0-100+)
 */
export function getSalvageEfficiency(
	item: Item,
	recycleResult: RecycleValueResult | null
): number | null {
	if (!recycleResult || !item.value || item.value === 0) {
		return null
	}

	return (recycleResult.recycleValue / item.value) * 100
}

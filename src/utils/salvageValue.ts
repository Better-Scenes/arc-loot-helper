/**
 * Calculate the total salvage value of recycling an item
 */

import type { Item } from '../data/types'

export interface SalvageValueResult {
	recycleValue: number
	salvageValue: number
	recycleBreakdown: Array<{ itemId: string; quantity: number; value: number; total: number }>
	salvageBreakdown: Array<{ itemId: string; quantity: number; value: number; total: number }>
}

/**
 * Calculate salvage value for an item by looking up component values
 * @param item - The item to analyze
 * @param allItems - All items (to look up component values)
 * @returns Salvage value information
 */
export function calculateSalvageValue(
	item: Item,
	allItems: Item[]
): SalvageValueResult | null {
	// If item can't be recycled or salvaged, return null
	if (!item.recyclesInto && !item.salvagesInto) {
		return null
	}

	// Create a lookup map for quick item value access
	const itemValueMap = new Map<string, number>()
	for (const itm of allItems) {
		itemValueMap.set(itm.id, itm.value || 0)
	}

	const result: SalvageValueResult = {
		recycleValue: 0,
		salvageValue: 0,
		recycleBreakdown: [],
		salvageBreakdown: [],
	}

	// Calculate recycle value
	if (item.recyclesInto) {
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
	}

	// Calculate salvage value
	if (item.salvagesInto) {
		for (const [componentId, quantity] of Object.entries(item.salvagesInto)) {
			const componentValue = itemValueMap.get(componentId) || 0
			const total = componentValue * quantity
			result.salvageValue += total
			result.salvageBreakdown.push({
				itemId: componentId,
				quantity,
				value: componentValue,
				total,
			})
		}
	}

	return result
}

/**
 * Get efficiency percentage (salvage value / item value)
 * @param item - The item
 * @param salvageResult - The salvage calculation result
 * @returns Percentage (0-100+)
 */
export function getSalvageEfficiency(
	item: Item,
	salvageResult: SalvageValueResult | null
): { recycle: number; salvage: number } | null {
	if (!salvageResult || !item.value || item.value === 0) {
		return null
	}

	return {
		recycle: (salvageResult.recycleValue / item.value) * 100,
		salvage: (salvageResult.salvageValue / item.value) * 100,
	}
}

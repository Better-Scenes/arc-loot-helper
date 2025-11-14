/**
 * VirtualizedItemList - Virtualized list for ItemListRows using TanStack Virtual
 * Uses window scrolling for maximum viewport space
 */

import { useRef, useMemo } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { ItemListRow, ItemListHeader } from './ItemListRow'
import { Heading } from './heading'
import { Text } from './text'
import type { Item } from '../data/types'

interface GroupedItems {
	title: string
	items: Item[]
}

interface VirtualizedItemListProps {
	groups: GroupedItems[]
	itemRequirements: Map<
		string,
		{
			total: number
			quests: number
			hideout: number
			projects: number
			sources: Set<'quests' | 'hideout' | 'projects'>
		}
	>
	usedInRecipes: Map<string, Array<{ itemId: string; itemName: string; quantity: number }>>
	recycledFrom: Map<
		string,
		Array<{
			itemId: string
			itemName: string
			recycleQty: number
		}>
	>
	needsGroupKey: boolean
}

type VirtualRow =
	| { type: 'header'; groupTitle: string; itemCount: number }
	| { type: 'tableHeader' }
	| { type: 'item'; item: Item; groupTitle: string }

export function VirtualizedItemList({
	groups,
	itemRequirements,
	usedInRecipes,
	recycledFrom,
	needsGroupKey,
}: VirtualizedItemListProps) {
	const parentRef = useRef<HTMLDivElement>(null)

	// Flatten groups into rows with headers
	const virtualRows = useMemo<VirtualRow[]>(() => {
		const rows: VirtualRow[] = []

		for (const group of groups) {
			// Add group header
			rows.push({
				type: 'header',
				groupTitle: group.title,
				itemCount: group.items.length,
			})

			// Add table header for this group
			rows.push({
				type: 'tableHeader',
			})

			// Add all items in this group
			for (const item of group.items) {
				rows.push({
					type: 'item',
					item,
					groupTitle: group.title,
				})
			}
		}

		return rows
	}, [groups])

	// Create row virtualizer with window scroll and dynamic measurement
	const rowVirtualizer = useWindowVirtualizer({
		count: virtualRows.length,
		estimateSize: () => 60, // Initial estimate, will be measured dynamically
		overscan: 10,
		measureElement:
			typeof window !== 'undefined'
				? element => {
						// Measure the actual element height including margins
						const height = element.getBoundingClientRect().height
						const style = window.getComputedStyle(element)
						const marginTop = parseFloat(style.marginTop)
						const marginBottom = parseFloat(style.marginBottom)
						return height + marginTop + marginBottom
					}
				: undefined,
	})

	// Create a key based on the data to force virtualizer reset when filtering/sorting
	const virtualizerKey = `${groups.length}-${virtualRows.length}`

	return (
		<div ref={parentRef} key={virtualizerKey}>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative',
				}}
			>
				{rowVirtualizer.getVirtualItems().map(virtualRow => {
					const row = virtualRows[virtualRow.index]

					if (row.type === 'header') {
						// Add top margin to headers after the first group for spacing
						const isFirstHeader = virtualRow.index === 0
						return (
							<div
								key={`header-${row.groupTitle}`}
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									transform: `translateY(${virtualRow.start}px)`,
								}}
								className={isFirstHeader ? 'mb-4' : 'mb-4 mt-8'}
							>
								<Heading level={2}>
									{row.groupTitle}
									<Text className="ml-2 inline text-zinc-500">({row.itemCount})</Text>
								</Heading>
							</div>
						)
					}

					if (row.type === 'tableHeader') {
						// Find the group this table header belongs to (previous row should be a header)
						const prevRow = virtualRows[virtualRow.index - 1]
						const groupTitle = prevRow && prevRow.type === 'header'
							? prevRow.groupTitle
							: 'unknown'
						return (
							<div
								key={`table-header-${groupTitle}`}
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<ItemListHeader />
							</div>
						)
					}

					// Render item row
					const req = itemRequirements.get(row.item.id)
					const recipes = usedInRecipes.get(row.item.id)
					const sources = recycledFrom.get(row.item.id)
					const key = needsGroupKey ? `${row.groupTitle}-${row.item.id}` : row.item.id

					// Check if this is the last item in the group
					const isLastInGroup =
						virtualRow.index === virtualRows.length - 1 ||
						virtualRows[virtualRow.index + 1]?.type !== 'item'

					return (
						<div
							key={key}
							data-index={virtualRow.index}
							ref={rowVirtualizer.measureElement}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							<ItemListRow
								item={row.item}
								requirements={req}
								usedInRecipes={recipes}
								recycledFrom={sources}
								isLastInGroup={isLastInGroup}
							/>
						</div>
					)
				})}
			</div>
		</div>
	)
}

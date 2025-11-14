/**
 * VirtualizedItemList - Virtualized list for ItemListRows using TanStack Virtual
 */

import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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

	// Create row virtualizer
	const rowVirtualizer = useVirtualizer({
		count: virtualRows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: index => {
			const row = virtualRows[index]
			if (row.type === 'header') return 60 // Group heading height
			if (row.type === 'tableHeader') return 45 // Table header height
			return 60 // ItemListRow height
		},
		overscan: 10, // Render 10 extra rows above/below viewport
	})

	return (
		<div
			ref={parentRef}
			style={{
				height: 'calc(100vh - 250px)', // Account for header and toolbar
				overflow: 'auto',
			}}
		>
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
						return (
							<div
								key={`header-${row.groupTitle}`}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
								}}
								className="mb-4"
							>
								<Heading level={2}>
									{row.groupTitle}
									<Text className="ml-2 inline text-zinc-500">({row.itemCount})</Text>
								</Heading>
							</div>
						)
					}

					if (row.type === 'tableHeader') {
						return (
							<div
								key={`table-header-${virtualRow.index}`}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: `${virtualRow.size}px`,
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

					return (
						<div
							key={key}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: `${virtualRow.size}px`,
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							<ItemListRow
								item={row.item}
								requirements={req}
								usedInRecipes={recipes}
								recycledFrom={sources}
							/>
						</div>
					)
				})}
			</div>
		</div>
	)
}

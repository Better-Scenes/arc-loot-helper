/**
 * VirtualizedItemGrid - Virtualized grid for ItemCards using TanStack Virtual
 * Chunks items into rows where each row contains multiple columns
 */

import { useRef, useMemo, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ItemCard } from './ItemCard'
import { Heading } from './heading'
import { Text } from './text'
import type { Item } from '../data/types'

interface GroupedItems {
	title: string
	items: Item[]
}

interface VirtualizedItemGridProps {
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
	allItems: Item[]
	itemValueMap: Map<string, number>
	showDetails: boolean
	needsGroupKey: boolean
}

type VirtualRow =
	| { type: 'header'; groupTitle: string; itemCount: number }
	| { type: 'itemRow'; items: Item[]; groupTitle: string }

export function VirtualizedItemGrid({
	groups,
	itemRequirements,
	usedInRecipes,
	recycledFrom,
	allItems,
	itemValueMap,
	showDetails,
	needsGroupKey,
}: VirtualizedItemGridProps) {
	const parentRef = useRef<HTMLDivElement>(null)

	// Track column count based on window width
	const [columnCount, setColumnCount] = useState(() => {
		if (typeof window === 'undefined') return 3
		const width = window.innerWidth
		if (width >= 1024) return 3 // lg breakpoint
		if (width >= 640) return 2 // sm breakpoint
		return 1
	})

	// Update column count on resize
	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth
			if (width >= 1024) setColumnCount(3)
			else if (width >= 640) setColumnCount(2)
			else setColumnCount(1)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Chunk items into rows based on column count
	const virtualRows = useMemo<VirtualRow[]>(() => {
		const rows: VirtualRow[] = []

		for (const group of groups) {
			// Add group header
			rows.push({
				type: 'header',
				groupTitle: group.title,
				itemCount: group.items.length,
			})

			// Chunk items into rows
			for (let i = 0; i < group.items.length; i += columnCount) {
				const rowItems = group.items.slice(i, i + columnCount)
				rows.push({
					type: 'itemRow',
					items: rowItems,
					groupTitle: group.title,
				})
			}
		}

		return rows
	}, [groups, columnCount])

	// Create row virtualizer
	const rowVirtualizer = useVirtualizer({
		count: virtualRows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: index => {
			const row = virtualRows[index]
			if (row.type === 'header') {
				return 60 // Header height
			}
			// Estimate ItemCard height based on showDetails
			return showDetails ? 600 : 400
		},
		overscan: 3, // Render 3 extra rows above/below viewport
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

					// Render item row (grid of cards)
					return (
						<div
							key={`row-${virtualRow.index}`}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: `${virtualRow.size}px`,
								transform: `translateY(${virtualRow.start}px)`,
							}}
							className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
						>
							{row.items.map(item => {
								const req = itemRequirements.get(item.id)
								const recipes = usedInRecipes.get(item.id)
								const sources = recycledFrom.get(item.id)
								const key = needsGroupKey ? `${row.groupTitle}-${item.id}` : item.id

								return (
									<ItemCard
										key={key}
										item={item}
										requirements={req}
										usedInRecipes={recipes}
										recycledFrom={sources}
										allItems={allItems}
										itemValueMap={itemValueMap}
										showDetails={showDetails}
									/>
								)
							})}
						</div>
					)
				})}
			</div>
		</div>
	)
}

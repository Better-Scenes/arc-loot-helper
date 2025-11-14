/**
 * ItemDetailSection Component
 * Reusable component for displaying item detail sections with title and badges
 */

import { Badge } from './badge'

type BadgeColor =
	| 'red'
	| 'orange'
	| 'amber'
	| 'yellow'
	| 'lime'
	| 'green'
	| 'emerald'
	| 'teal'
	| 'cyan'
	| 'sky'
	| 'blue'
	| 'indigo'
	| 'violet'
	| 'purple'
	| 'fuchsia'
	| 'pink'
	| 'rose'
	| 'zinc'

export interface BadgeData {
	key: string
	label: string
	color: BadgeColor
}

interface ItemDetailSectionProps {
	title: string
	badges: BadgeData[]
}

/**
 * Displays a detail section with a title and badges
 */
export function ItemDetailSection({ title, badges }: ItemDetailSectionProps) {
	if (badges.length === 0) {
		return null
	}

	return (
		<div className="mb-3">
			<div className="mb-2 text-xs text-zinc-500">{title}</div>
			<div className="flex flex-wrap gap-2">
				{badges.map(badge => (
					<Badge key={badge.key} color={badge.color}>
						{badge.label}
					</Badge>
				))}
			</div>
		</div>
	)
}

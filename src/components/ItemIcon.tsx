/**
 * ItemIcon Component
 * Displays item image with ARC Raiders game styling
 * Key features:
 * - Rarity-colored border with glow
 * - Internal gradient glow from corner
 * - Corner arc accent that scales with rarity
 */

interface ItemIconProps {
	imageUrl: string
	itemName: string
	rarity?: string
	size?: 'sm' | 'md' | 'lg'
}

/**
 * Get rarity color and styling
 */
function getRarityStyles(rarity: string | undefined): {
	borderClass: string
	glowColor: string
	arcAngle: string
	fillColor: string
} {
	const rarityLower = rarity?.toLowerCase()

	switch (rarityLower) {
		case 'uncommon':
			return {
				borderClass: 'border-uncommon shadow-uncommon/50',
				glowColor: 'from-uncommon/40',
				arcAngle: '35%',
				fillColor: 'fill-uncommon',
			}
		case 'rare':
			return {
				borderClass: 'border-rare shadow-rare/50',
				glowColor: 'from-rare/40',
				arcAngle: '45%',
				fillColor: 'fill-rare',
			}
		case 'epic':
			return {
				borderClass: 'border-epic shadow-epic/60',
				glowColor: 'from-epic/40',
				arcAngle: '55%',
				fillColor: 'fill-epic',
			}
		case 'legendary':
			return {
				borderClass: 'border-legendary shadow-legendary/60',
				glowColor: 'from-legendary/40',
				arcAngle: '65%',
				fillColor: 'fill-legendary',
			}
		default: // common
			return {
				borderClass: 'border-common shadow-common/20',
				glowColor: 'from-common/30',
				arcAngle: '28%',
				fillColor: 'fill-common',
			}
	}
}

export function ItemIcon({ imageUrl, itemName, rarity, size = 'md' }: ItemIconProps) {
	const { borderClass, glowColor, arcAngle, fillColor } = getRarityStyles(rarity)

	const sizeClasses = {
		sm: 'w-16 h-16',
		md: 'w-24 h-24',
		lg: 'w-32 h-32',
	}

	return (
		<div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
			<div
				className={`relative h-full w-full rounded-lg border-2 ${borderClass} shadow-lg overflow-hidden bg-grungy/90`}
			>
				{/* Bottom-left corner arc - solid color wedge that scales with rarity */}
				<svg
					className="absolute bottom-0 left-0"
					style={{
						width: arcAngle,
						height: arcAngle,
					}}
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
				>
					<path
						d="M 0 100 L 0 0 A 100 100 0 0 0 100 100 Z"
						className={fillColor}
					/>
				</svg>

				{/* Internal glow gradient from corner */}
				<div className={`absolute inset-0 bg-gradient-to-br ${glowColor} to-transparent`}></div>

				{/* Item Image */}
				<div className="relative flex h-full w-full items-center justify-center p-2">
					<img
						src={imageUrl}
						alt={itemName}
						className="h-full w-full object-contain drop-shadow-lg"
						onError={e => {
							e.currentTarget.style.display = 'none'
						}}
					/>
				</div>
			</div>
		</div>
	)
}

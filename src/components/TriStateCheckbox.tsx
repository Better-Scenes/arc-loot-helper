/**
 * TriStateCheckbox Component
 * A checkbox that cycles through three states: ignore, include, exclude
 */

import { PlusIcon, MinusIcon } from '@heroicons/react/16/solid'

export type FilterMode = 'ignore' | 'include' | 'exclude'

interface TriStateCheckboxProps {
	label: string
	value: FilterMode
	onChange: (value: FilterMode) => void
	className?: string
}

/**
 * Cycles to the next filter state
 */
function getNextState(current: FilterMode): FilterMode {
	if (current === 'ignore') return 'include'
	if (current === 'include') return 'exclude'
	return 'ignore'
}

/**
 * TriStateCheckbox displays a checkbox that cycles through ignore/include/exclude states
 */
export function TriStateCheckbox({ label, value, onChange, className = '' }: TriStateCheckboxProps) {
	const handleClick = () => {
		onChange(getNextState(value))
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className={`flex items-center gap-2 text-sm transition ${className}`}
		>
			{/* Checkbox visual */}
			<div className="relative flex h-4 w-4 items-center justify-center rounded border">
				{value === 'ignore' && (
					<div className="h-4 w-4 rounded border border-zinc-600 bg-zinc-900" />
				)}
				{value === 'include' && (
					<div className="flex h-4 w-4 items-center justify-center rounded border-2 border-cyan-500 bg-cyan-500/20">
						<PlusIcon className="h-3 w-3 text-cyan-400" />
					</div>
				)}
				{value === 'exclude' && (
					<div className="flex h-4 w-4 items-center justify-center rounded border-2 border-red-500 bg-red-500/20">
						<MinusIcon className="h-3 w-3 text-red-400" />
					</div>
				)}
			</div>

			{/* Label */}
			<span
				className={`${
					value === 'ignore'
						? 'text-zinc-400'
						: value === 'include'
							? 'text-cyan-400 font-medium'
							: 'text-red-400 font-medium line-through'
				}`}
			>
				{value === 'include' && 'Include '}
				{value === 'exclude' && 'Exclude '}
				{label}
			</span>
		</button>
	)
}

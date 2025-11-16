/**
 * CompletionButton Component
 * Button for marking items as complete/incomplete with undo functionality
 */

import { Button } from './button'
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid'

interface CompletionButtonProps {
	isCompleted: boolean
	onToggle: () => void
	disabled?: boolean
}

export function CompletionButton({ isCompleted, onToggle, disabled = false }: CompletionButtonProps) {
	return (
		<Button
			color={isCompleted ? 'green' : 'blue'}
			onClick={onToggle}
			disabled={disabled}
			className="min-w-[140px]"
		>
			{isCompleted ? (
				<>
					<CheckIcon className="h-4 w-4" />
					Completed
				</>
			) : (
				<>Mark Complete</>
			)}
		</Button>
	)
}

// Undo button for reverting completion
export function UncompleteButton({
	onUncomplete,
	disabled = false,
}: {
	onUncomplete: () => void
	disabled?: boolean
}) {
	return (
		<Button outline onClick={onUncomplete} disabled={disabled} className="min-w-[100px]">
			<XMarkIcon className="h-4 w-4" />
			Undo
		</Button>
	)
}

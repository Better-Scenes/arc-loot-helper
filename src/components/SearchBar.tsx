/**
 * SearchBar Component
 * Debounced search input using Catalyst UI Kit
 */

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react'
import { Input, InputGroup } from './input'

interface SearchBarProps {
	onSearch: (query: string) => void
	placeholder?: string
	debounceMs?: number
}

/**
 * SearchBar with debouncing to avoid excessive callbacks
 * @param onSearch - Callback fired after debounce delay with search query
 * @param placeholder - Input placeholder text
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 */
export function SearchBar({
	onSearch,
	placeholder = 'Search items...',
	debounceMs = 300,
}: SearchBarProps) {
	const [query, setQuery] = useState('')

	// Debounce the search callback
	useEffect(() => {
		const timer = setTimeout(() => {
			onSearch(query)
		}, debounceMs)

		return () => clearTimeout(timer)
	}, [query, debounceMs, onSearch])

	const handleClear = () => {
		setQuery('')
	}

	return (
		<div className="relative">
			<InputGroup>
				<MagnifyingGlassIcon data-slot="icon" />
				<Input
					type="search"
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder={placeholder}
					aria-label="Search items"
				/>
				{query && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
						aria-label="Clear search"
					>
						<XMarkIcon className="size-5" />
					</button>
				)}
			</InputGroup>
		</div>
	)
}

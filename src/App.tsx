/**
 * ARC Raiders Loot Helper - Single-Page Application
 * Simplified architecture: One powerful item list view with filtering and grouping
 */

import { ItemList } from './pages/ItemList'
import { Footer } from './components/Footer'

function App() {
	return (
		<div className="min-h-screen bg-zinc-950">
			{/* Simple header - compact */}
			<header className="border-b border-white/10 bg-zinc-900">
				<div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
							<svg
								className="size-5 text-white"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
								/>
							</svg>
						</div>
						<div>
							<h1 className="text-base font-semibold text-white">ARC Raiders Loot Helper</h1>
							<p className="text-xs text-zinc-400">Keep or Salvage? Make informed decisions.</p>
						</div>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<ItemList />
			</main>

			{/* Footer */}
			<Footer />
		</div>
	)
}

export default App

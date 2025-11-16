/**
 * ARC Raiders Loot Helper - Multi-Page Application
 * Simple navigation between Items and Progress Tracker
 */

import { Routes, Route, useLocation } from 'react-router-dom'
import { ItemList } from './pages/ItemList'
import { ProgressTracker } from './pages/ProgressTracker'
import { StackedLayout } from './components/stacked-layout'
import { NavbarSection, NavbarItem } from './components/navbar'
import { useSyncRemainingRequirements } from './hooks/useSyncRemainingRequirements'

function App() {
	const location = useLocation()
	// Sync remaining requirements whenever game data or progress changes
	useSyncRemainingRequirements()

	// Page titles and descriptions
	const pageInfo = {
		'/': {
			title: 'Items',
			description: 'Filter, group and sort items to explore requirements and crafting recipes.',
		},
		'/progress': {
			title: 'Progress Tracker',
			description: 'Track your quest, hideout, and project completion progress',
		},
	}

	const currentPage = pageInfo[location.pathname as keyof typeof pageInfo] || pageInfo['/']

	return (
		<StackedLayout
			navbar={
				<>
					{/* Logo/Title Section */}
					<div className="flex items-center px-2 lg:px-0">
						<div className="shrink-0">
							<div className="flex size-8 items-center justify-center rounded-lg bg-indigo-300 dark:bg-indigo-500">
								<svg
									className="size-5 text-indigo-600 dark:text-white"
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
						</div>
						<div className="ml-3 hidden lg:block">
							<div className="text-base font-semibold text-white">Arc Tools</div>
						</div>
						<div className="hidden lg:ml-10 lg:block">
							<NavbarSection>
								<NavbarItem href="/" current={location.pathname === '/'}>
									Items
								</NavbarItem>
								<NavbarItem href="/progress" current={location.pathname === '/progress'}>
									Progress
								</NavbarItem>
							</NavbarSection>
						</div>
					</div>
				</>
			}
			mobileNav={
				<>
					<NavbarItem href="/" current={location.pathname === '/'}>
						Items
					</NavbarItem>
					<NavbarItem href="/progress" current={location.pathname === '/progress'}>
						Progress
					</NavbarItem>
				</>
			}
			header={
				<>
					<h1 className="text-3xl font-bold tracking-tight text-white">{currentPage.title}</h1>
					<p className="mt-2 text-base text-indigo-200">{currentPage.description}</p>
				</>
			}
		>
			<Routes>
				<Route path="/" element={<ItemList />} />
				<Route path="/progress" element={<ProgressTracker />} />
			</Routes>
		</StackedLayout>
	)
}

export default App

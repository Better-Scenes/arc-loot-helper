/**
 * Main Application Layout using Catalyst UI Kit
 * Provides sidebar navigation and responsive mobile menu
 */

import { HomeIcon, MagnifyingGlassIcon, ArchiveBoxIcon } from '@heroicons/react/20/solid'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarSection } from './sidebar'
import { SidebarLayout } from './sidebar-layout'
import { Navbar, NavbarSection } from './navbar'
import { Footer } from './Footer'

/**
 * Application sidebar with navigation links
 */
function AppSidebar() {
	const location = useLocation()

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-3 px-2">
					<div className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
						<ArchiveBoxIcon className="size-6 text-white" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm/5 font-semibold text-zinc-950 dark:text-white">
							ARC Raiders
						</span>
						<span className="text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
							Loot Helper
						</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarBody>
				<SidebarSection>
					<SidebarItem href="/" current={location.pathname === '/'}>
						<HomeIcon />
						<span>Dashboard</span>
					</SidebarItem>
					<SidebarItem href="/item-browser" current={location.pathname === '/item-browser'}>
						<MagnifyingGlassIcon />
						<span>Item Browser</span>
					</SidebarItem>
					<SidebarItem href="/keep-or-salvage" current={location.pathname === '/keep-or-salvage'}>
						<ArchiveBoxIcon />
						<span>Keep or Salvage</span>
					</SidebarItem>
				</SidebarSection>
			</SidebarBody>
		</Sidebar>
	)
}

/**
 * Mobile navbar content (shown on small screens)
 */
function AppNavbar() {
	return (
		<Navbar>
			<NavbarSection>
				<span className="text-sm/6 font-semibold text-zinc-950 dark:text-white">
					ARC Raiders Loot Helper
				</span>
			</NavbarSection>
		</Navbar>
	)
}

/**
 * Main layout component wrapping all pages
 */
export function Layout() {
	return (
		<SidebarLayout navbar={<AppNavbar />} sidebar={<AppSidebar />}>
			<Outlet />
			<Footer />
		</SidebarLayout>
	)
}

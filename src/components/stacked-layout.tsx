'use client'

import * as Headless from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import React from 'react'

type StackedLayoutProps = React.PropsWithChildren<{
	navbar: React.ReactNode
	/** Mobile menu navigation items */
	mobileNav?: React.ReactNode
	/** Optional header content shown below the navbar on colored background */
	header?: React.ReactNode
	/** Optional className for the colored header section */
	headerClassName?: string
}>

export function StackedLayout({
	navbar,
	mobileNav,
	header,
	headerClassName,
	children,
}: StackedLayoutProps) {
	return (
		<div className="min-h-full">
			{/* Colored header section */}
			<div className={clsx('pb-32', headerClassName || 'bg-indigo-600 dark:bg-indigo-950')}>
				{/* Navbar */}
				<Headless.Disclosure
					as="nav"
					className={clsx(
						'border-b border-indigo-300/25 lg:border-none dark:border-indigo-400/25',
						headerClassName || 'bg-indigo-600 dark:bg-indigo-950'
					)}
				>
					<div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
						<div className="relative flex h-16 items-center justify-between lg:border-b lg:border-indigo-400/25 dark:lg:border-indigo-400/25">
							{navbar}

							{/* Mobile menu button */}
							{mobileNav && (
								<div className="flex lg:hidden">
									<Headless.DisclosureButton
										className={clsx(
											'group relative inline-flex items-center justify-center rounded-md p-2',
											'bg-indigo-600 text-indigo-200 hover:bg-indigo-500/75 hover:text-white',
											'focus:outline-2 focus:outline-offset-2 focus:outline-white',
											'dark:bg-indigo-950 dark:hover:bg-indigo-900/75'
										)}
									>
										<span className="absolute -inset-0.5" />
										<span className="sr-only">Open main menu</span>
										<Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
										<XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
									</Headless.DisclosureButton>
								</div>
							)}
						</div>
					</div>

					{/* Mobile menu panel */}
					{mobileNav && (
						<Headless.DisclosurePanel className="lg:hidden">
							<div className="space-y-1 px-2 pt-2 pb-3">{mobileNav}</div>
						</Headless.DisclosurePanel>
					)}
				</Headless.Disclosure>

				{/* Optional header section */}
				{header && (
					<header className="py-10">
						<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{header}</div>
					</header>
				)}
			</div>

			{/* Main content with negative margin */}
			<main className="-mt-32">
				<div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
					<div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6 dark:bg-zinc-800 dark:shadow-none dark:outline-1 dark:-outline-offset-1 dark:outline-white/10">
						{children}
					</div>
				</div>
			</main>
		</div>
	)
}

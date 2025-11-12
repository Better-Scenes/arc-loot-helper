/**
 * Catalyst Link component integrated with React Router v7
 * Wraps React Router's Link component for client-side navigation
 */

import * as Headless from '@headlessui/react'
import React, { forwardRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'

export const Link = forwardRef(function Link(
	props: { href: string } & React.ComponentPropsWithoutRef<'a'>,
	ref: React.ForwardedRef<HTMLAnchorElement>
) {
	// Convert href prop to 'to' for React Router
	const { href, ...restProps } = props

	return (
		<Headless.DataInteractive>
			<RouterLink {...restProps} to={href} ref={ref} />
		</Headless.DataInteractive>
	)
})

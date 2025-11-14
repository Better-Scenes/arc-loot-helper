/**
 * Profiling utilities for React performance measurement
 */

import type { ProfilerOnRenderCallback } from 'react'

const ENABLE_PROFILING = true // Set to false to disable profiling in production

/**
 * Callback for React Profiler that logs performance data
 * @param id - The profiler ID
 * @param phase - mount or update
 * @param actualDuration - Time spent rendering the committed update
 * @param baseDuration - Estimated time to render the entire subtree without memoization
 * @param startTime - When React began rendering this update
 * @param commitTime - When React committed this update
 */
export const onRenderCallback: ProfilerOnRenderCallback = (
	id,
	phase,
	actualDuration,
	baseDuration,
	_startTime,
	_commitTime
) => {
	if (!ENABLE_PROFILING) return

	// Color code by performance
	const color =
		actualDuration < 16
			? '#22c55e' // Green - good (< 16ms = 60fps)
			: actualDuration < 50
				? '#eab308' // Yellow - acceptable
				: '#ef4444' // Red - slow

	// Log with styling
	console.log(
		`%c⚡ Profiler [${id}] %c${phase}%c ${actualDuration.toFixed(2)}ms %c(base: ${baseDuration.toFixed(2)}ms)`,
		'color: #3b82f6; font-weight: bold',
		`color: ${phase === 'mount' ? '#8b5cf6' : '#f59e0b'}; font-weight: bold`,
		`color: ${color}; font-weight: bold; font-size: 14px`,
		'color: #9ca3af'
	)

	// Warn if slow
	if (actualDuration > 100) {
		console.warn(
			`🐌 Slow render detected in [${id}]: ${actualDuration.toFixed(2)}ms (target: <16ms for 60fps)`
		)
	}

	// Show memoization effectiveness
	if (phase === 'update' && baseDuration > 0) {
		const saved = baseDuration - actualDuration
		const savingsPercent = (saved / baseDuration) * 100
		if (savingsPercent > 10) {
			console.log(
				`%c💾 Memoization saved ${saved.toFixed(2)}ms (${savingsPercent.toFixed(0)}% faster)`,
				'color: #10b981'
			)
		}
	}
}

/**
 * Create a named profiler callback for specific components
 */
export function createProfilerCallback(componentName: string): ProfilerOnRenderCallback {
	return (id, phase, actualDuration, baseDuration, _startTime, _commitTime) => {
		onRenderCallback(
			`${componentName}/${id}`,
			phase,
			actualDuration,
			baseDuration,
			_startTime,
			_commitTime
		)
	}
}

/**
 * Simple performance marker for measuring code blocks
 */
export class PerformanceMarker {
	private startTime: number
	private name: string

	constructor(name: string) {
		this.name = name
		this.startTime = performance.now()
	}

	end() {
		const duration = performance.now() - this.startTime
		console.log(`%c⏱️  ${this.name}: ${duration.toFixed(2)}ms`, 'color: #06b6d4')
		return duration
	}
}

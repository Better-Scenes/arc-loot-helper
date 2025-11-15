/**
 * Shared utilities for creating composite keys used in progress tracking.
 * Ensures consistency between progressStore and requirement calculations.
 */

/**
 * Creates a composite key for hideout module levels
 * @param moduleId - Hideout module ID
 * @param level - Module level (1-based)
 * @returns Composite key in format "moduleId-level"
 */
export function getHideoutKey(moduleId: string, level: number): string {
	return `${moduleId}-${level}`
}

/**
 * Creates a composite key for project phases
 * @param projectId - Project ID
 * @param phase - Project phase number (1-based)
 * @returns Composite key in format "projectId-phase"
 */
export function getProjectKey(projectId: string, phase: number): string {
	return `${projectId}-${phase}`
}

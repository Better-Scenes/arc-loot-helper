/**
 * Projects Fetcher
 * Fetches projects data from RaidTheory GitHub repo
 * and transforms item IDs to match MetaForge naming convention
 */

import https from 'https'

const GITHUB_URL = 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/projects.json'

/**
 * Fetch JSON from URL
 * @param {string} url - URL to fetch
 * @returns {Promise<any>} Parsed JSON
 */
function fetchJSON(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, res => {
				let data = ''

				if (res.statusCode !== 200) {
					reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
					return
				}

				res.on('data', chunk => {
					data += chunk
				})

				res.on('end', () => {
					try {
						resolve(JSON.parse(data))
					} catch (err) {
						reject(new Error(`Failed to parse JSON: ${err.message}`))
					}
				})
			})
			.on('error', reject)
	})
}

/**
 * Manual ID mapping for cases where GitHub and MetaForge use different names
 * GitHub ID -> MetaForge ID
 */
const ID_MAPPING = {
	bastion_cell: 'bastion-part',
	rubber_parts: 'rubber-parts-recipe',
	sentinel_firing_core: 'sentinel-part',
	rocketeer_driver: 'rocketeer-part',
	steel_spring: 'spring',
	wires: 'wires-recipe',
	sensors: 'sensors-recipe',
	// Add more manual mappings here as needed
}

/**
 * Transform item IDs from underscore to hyphen naming
 * GitHub uses: bastion_cell, plastic_parts
 * MetaForge uses: bastion-part, plastic-parts
 *
 * @param {string} itemId - Item ID with underscores
 * @returns {string} Item ID with hyphens
 */
function transformItemId(itemId) {
	// Check manual mapping first
	if (ID_MAPPING[itemId]) {
		return ID_MAPPING[itemId]
	}

	// Default: replace underscores with hyphens
	return itemId.replace(/_/g, '-')
}

/**
 * Transform a project's item IDs in phases
 * @param {Object} project - Project data
 * @returns {Object} Project with transformed IDs
 */
function transformProjectIds(project) {
	return {
		...project,
		phases: project.phases.map(phase => {
			// Phase 5 has a different structure with categories instead of requirementItemIds
			if (phase.requirementCategories) {
				return phase
			}

			// Transform regular phases with requirementItemIds
			return {
				...phase,
				requirementItemIds: phase.requirementItemIds?.map(req => ({
					...req,
					itemId: transformItemId(req.itemId),
				})) || [],
			}
		}),
	}
}

/**
 * Fetch projects data from GitHub
 * @returns {Promise<Array>} Array of projects
 */
export async function fetchProjects() {
	console.log('📦 Fetching projects from GitHub...\n')

	try {
		const projects = await fetchJSON(GITHUB_URL)

		if (!Array.isArray(projects)) {
			throw new Error('Projects data is not an array')
		}

		console.log(`   ✓ Fetched ${projects.length} project(s) from GitHub\n`)

		// Transform all item IDs to match MetaForge naming
		console.log('🔄 Transforming project item IDs to match MetaForge naming...\n')
		const transformedProjects = projects.map(transformProjectIds)

		return transformedProjects
	} catch (error) {
		console.error(`   ✗ Failed to fetch projects: ${error.message}`)
		throw error
	}
}

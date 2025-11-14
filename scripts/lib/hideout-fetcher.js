/**
 * Hideout Module Fetcher
 * Fetches hideout module data from RaidTheory GitHub repo
 * and transforms item IDs to match MetaForge naming convention
 */

import https from 'https'

const GITHUB_BASE = 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/hideout'

const HIDEOUT_MODULES = [
	'scrappy.json',
	'workbench.json',
	'weapon_bench.json',
	'equipment_bench.json',
	'med_station.json',
	'explosives_bench.json',
	'utility_bench.json',
	'refiner.json',
	'stash.json',
]

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
 * Transform a hideout module's item IDs
 * @param {Object} module - Hideout module data
 * @returns {Object} Module with transformed IDs
 */
function transformModuleIds(module) {
	return {
		...module,
		levels: module.levels.map(level => ({
			...level,
			requirementItemIds: level.requirementItemIds.map(req => ({
				...req,
				itemId: transformItemId(req.itemId),
			})),
		})),
	}
}

/**
 * Fetch all hideout modules from GitHub
 * @returns {Promise<Array>} Array of hideout modules
 */
export async function fetchHideoutModules() {
	console.log('📦 Fetching hideout modules from GitHub...\n')

	try {
		// Fetch all module files in parallel
		const modulePromises = HIDEOUT_MODULES.map(filename => fetchJSON(`${GITHUB_BASE}/${filename}`))

		const modules = await Promise.all(modulePromises)

		console.log(`   ✓ Fetched ${modules.length} hideout modules from GitHub\n`)

		// Transform all item IDs to match MetaForge naming
		console.log('🔄 Transforming item IDs to match MetaForge naming...\n')
		const transformedModules = modules.map(transformModuleIds)

		return transformedModules
	} catch (error) {
		console.error(`   ✗ Failed to fetch hideout modules: ${error.message}`)
		throw error
	}
}

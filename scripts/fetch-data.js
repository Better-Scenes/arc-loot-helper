/**
 * API-Only Data Fetcher Script
 * Fetches game data from MetaForge Arc Raiders API
 * Run with: node scripts/fetch-data.js
 */

import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { fetchPaginated, fetchSingle } from './lib/api-client.js'
import { validateItems, validateQuests, validateARCs, validateTraders } from './lib/validators.js'
import { fetchHideoutModules } from './lib/hideout-fetcher.js'
import { fetchProjects } from './lib/projects-fetcher.js'
import { fetchQuestChains } from './lib/quest-fetcher.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OUTPUT_DIR = join(__dirname, '..', 'public', 'data')

/**
 * Ensure directory exists, create if not
 * @param {string} dir - Directory path
 */
async function ensureDir(dir) {
	try {
		await fs.access(dir)
	} catch {
		await fs.mkdir(dir, { recursive: true })
		console.log(`📁 Created directory: ${dir}`)
	}
}

/**
 * Fetch API data
 * @returns {Promise<Object>} API data
 */
async function fetchAPIData() {
	console.log('🌐 Fetching data from MetaForge API...\n')

	try {
		// Fetch all data in parallel
		const [items, quests, arcs, tradersResponse, hideoutModules, projects, questChains] = await Promise.all([
			fetchPaginated('/items', { limit: 100 }, { includeComponents: true }),
			fetchPaginated('/quests', { limit: 50 }),
			fetchPaginated('/arcs', { limit: 50 }),
			fetchSingle('/traders'),
			fetchHideoutModules(),
			fetchProjects(),
			fetchQuestChains(),
		])

		console.log('\n📊 API Data Summary:')
		console.log(`   • Items: ${items.length}`)
		console.log(`   • Quests: ${quests.length}`)
		console.log(`   • Quest Chains: ${questChains.length}`)
		console.log(`   • ARCs: ${arcs.length}`)
		console.log(`   • Traders: ${Object.keys(tradersResponse.data || {}).length} vendors`)
		console.log(`   • Hideout Modules: ${hideoutModules.length}`)
		console.log(`   • Projects: ${projects.length}\n`)

		return {
			items,
			quests,
			questChains,
			arcs,
			traders: tradersResponse.data || {},
			hideoutModules,
			projects,
		}
	} catch (error) {
		console.error('❌ API fetch failed:', error.message)
		throw error
	}
}

/**
 * Validate fetched data
 * @param {Object} apiData - API data to validate
 * @returns {boolean} True if all valid
 */
function validateData(apiData) {
	console.log('🔍 Validating data...\n')

	let allValid = true

	// Validate items
	const itemsResult = validateItems(apiData.items)
	if (!itemsResult.valid) {
		console.error('❌ Items validation failed:')
		itemsResult.errors.slice(0, 5).forEach(err => console.error(`   • ${err}`))
		if (itemsResult.errors.length > 5) {
			console.error(`   ... and ${itemsResult.errors.length - 5} more errors`)
		}
		allValid = false
	} else {
		console.log(`   ✅ Items: ${apiData.items.length} valid`)
	}

	// Validate quests
	const questsResult = validateQuests(apiData.quests)
	if (!questsResult.valid) {
		console.error('❌ Quests validation failed:')
		questsResult.errors.slice(0, 5).forEach(err => console.error(`   • ${err}`))
		allValid = false
	} else {
		console.log(`   ✅ Quests: ${apiData.quests.length} valid`)
	}

	// Validate ARCs
	const arcsResult = validateARCs(apiData.arcs)
	if (!arcsResult.valid) {
		console.error('❌ ARCs validation failed:')
		arcsResult.errors.slice(0, 5).forEach(err => console.error(`   • ${err}`))
		allValid = false
	} else {
		console.log(`   ✅ ARCs: ${apiData.arcs.length} valid`)
	}

	// Validate traders
	const tradersResult = validateTraders(apiData.traders)
	if (!tradersResult.valid) {
		console.error('❌ Traders validation failed:')
		tradersResult.errors.slice(0, 5).forEach(err => console.error(`   • ${err}`))
		allValid = false
	} else {
		const vendorCount = Object.keys(apiData.traders).length
		console.log(`   ✅ Traders: ${vendorCount} vendors valid`)
	}

	console.log('')
	return allValid
}

/**
 * Transform API data to our schema format
 * @param {Object} apiData - Raw API data
 * @returns {Object} Transformed data
 */
function transformData(apiData) {
	console.log('🔄 Transforming data to app schema...\n')

	// Transform items: convert API component arrays to our recipe format
	const items = apiData.items.map(item => {
		const transformed = {
			id: item.id,
			name: { en: item.name },
			description: { en: item.description || '' },
			type: item.item_type,
			rarity: item.rarity || undefined,
			value: item.value || 0,
			weightKg: item.stat_block?.weight || 0,
			stackSize: item.stat_block?.stackSize || 1,
			imageFilename: item.icon || '',

			// Convert component arrays to our recipe format {itemId: quantity}
			recipe: componentsToRecipe(item.components),
			recyclesInto: componentsToRecipe(item.recycle_components),

			// Keep API-specific fields
			workbench: item.workbench,
			loadout_slots: item.loadout_slots,
			sources: item.sources,
			locations: item.locations,
			loot_area: item.loot_area,
			stat_block: item.stat_block,

			// Keep full component relationships
			usedIn: item.used_in,
			recycleFrom: item.recycle_from,
		}

		// Remove undefined values
		Object.keys(transformed).forEach(key => {
			if (transformed[key] === undefined) {
				delete transformed[key]
			}
		})

		return transformed
	})

	// Normalize quest name for matching (lowercase, remove punctuation)
	const normalizeQuestName = (name) => {
		return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
	}

	// Transform quests: merge API data with GitHub chain data
	// Match by quest name since API IDs don't always match GitHub name-based IDs
	// Use normalized names for matching to handle case/punctuation differences
	const questChainByNormalizedName = new Map(
		apiData.questChains.map(chain => [normalizeQuestName(chain.nameEn), chain])
	)

	// Create a map of normalized quest name to API ID for resolving quest chain references
	const normalizedNameToId = new Map(apiData.quests.map(q => [normalizeQuestName(q.name), q.id]))

	const quests = apiData.quests
		// Filter out quests marked for deletion
		.filter(quest => !quest.name.includes('- delete'))
		.map(quest => {
			const chainData = questChainByNormalizedName.get(normalizeQuestName(quest.name))

			const transformed = {
				id: quest.id,
				name: { en: quest.name },
				objectives: Array.isArray(quest.objectives) ? quest.objectives.map(obj => ({ en: obj })) : [],
				xp: quest.xp || 0,
				requiredItemIds: convertQuestRequirements(quest.required_items),
				rewardItemIds: convertQuestRewards(quest.rewards),
				// Add chain data from GitHub
				trader: chainData?.trader,
				// Convert quest names in previousQuestIds back to API IDs (using normalized names)
				previousQuestIds: chainData?.previousQuestIds?.map(name => normalizedNameToId.get(normalizeQuestName(name)) || name),
				nextQuestIds: chainData?.nextQuestIds?.map(name => normalizedNameToId.get(normalizeQuestName(name)) || name),
				updatedAt: chainData?.updatedAt,
			}

			// Remove undefined values
			Object.keys(transformed).forEach(key => {
				if (transformed[key] === undefined) {
					delete transformed[key]
				}
			})

			return transformed
		})

	console.log(`   • Transformed ${items.length} items`)
	console.log(`   • Transformed ${quests.length} quests\n`)

	return {
		items,
		quests,
		arcs: apiData.arcs,
		traders: apiData.traders,
		hideoutModules: apiData.hideoutModules,
		projects: apiData.projects,
	}
}

/**
 * Convert API component array to our recipe format
 * @param {Array} components - API components array
 * @returns {Object|undefined} Recipe object {itemId: quantity}
 */
function componentsToRecipe(components) {
	if (!Array.isArray(components) || components.length === 0) {
		return undefined
	}

	const recipe = {}
	components.forEach(comp => {
		if (comp.component && comp.component.id) {
			recipe[comp.component.id] = comp.quantity || 1
		}
	})

	return Object.keys(recipe).length > 0 ? recipe : undefined
}

/**
 * Convert API quest rewards to our format
 * @param {Array} rewards - API rewards array
 * @returns {Array} Our format [{itemId, quantity}]
 */
function convertQuestRewards(rewards) {
	if (!Array.isArray(rewards) || rewards.length === 0) {
		return []
	}

	return rewards.map(reward => ({
		itemId: reward.item?.id || reward.item_id,
		quantity: parseInt(reward.quantity) || 1,
	}))
}

/**
 * Convert API required items to our format
 * @param {Array} requiredItems - API required_items array
 * @returns {Array} Our format [{itemId, quantity}]
 */
function convertQuestRequirements(requiredItems) {
	if (!Array.isArray(requiredItems) || requiredItems.length === 0) {
		return []
	}

	return requiredItems.map(req => ({
		itemId: req.item?.id || req.item_id || req.id,
		quantity: parseInt(req.quantity) || 1,
	}))
}

/**
 * Save data to files
 * @param {Object} data - Transformed data
 */
async function saveData(data) {
	console.log('💾 Saving data files...\n')

	await ensureDir(OUTPUT_DIR)

	const filesToSave = [
		{ name: 'items.json', data: data.items },
		{ name: 'quests.json', data: data.quests },
		{ name: 'arcs.json', data: data.arcs },
		{ name: 'traders.json', data: data.traders },
		{ name: 'hideoutModules.json', data: data.hideoutModules },
		{ name: 'projects.json', data: data.projects },
	]

	for (const { name, data: fileData } of filesToSave) {
		const outputPath = join(OUTPUT_DIR, name)
		const content = JSON.stringify(fileData, null, 2)
		await fs.writeFile(outputPath, content, 'utf-8')

		const itemCount = Array.isArray(fileData) ? fileData.length : Object.keys(fileData).length
		const sizeKB = (content.length / 1024).toFixed(1)
		console.log(`   ✅ ${name} (${sizeKB}KB, ${itemCount} items)`)
	}

	console.log('')
}

/**
 * Main fetch function
 */
async function fetchData() {
	console.log('🚀 ARC Raiders Data Fetcher (API-Only)\n')
	console.log('─'.repeat(50))
	console.log('')

	const startTime = Date.now()

	try {
		// Fetch from API
		const apiData = await fetchAPIData()

		// Validate
		const isValid = validateData(apiData)
		if (!isValid) {
			throw new Error('Data validation failed')
		}

		// Transform to our schema
		const transformedData = transformData(apiData)

		// Save
		await saveData(transformedData)

		// Success!
		const duration = ((Date.now() - startTime) / 1000).toFixed(1)
		console.log('─'.repeat(50))
		console.log(`\n🎉 Data fetch complete in ${duration}s!`)
		console.log(`   📁 Output: ${OUTPUT_DIR}\n`)
	} catch (error) {
		console.error('\n💥 Fatal error:', error.message)
		console.error('')
		process.exit(1)
	}
}

// Run the fetch
fetchData()

export { fetchData }

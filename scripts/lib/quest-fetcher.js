/**
 * Quest Fetcher
 * Fetches quest chain data from RaidTheory GitHub repo
 * to merge with MetaForge API data
 */

import https from 'https'

const GITHUB_BASE = 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/quests'

// List of all quest files from GitHub
const QUEST_FILES = [
	'a_bad_feeling.json',
	'a_balanced_harvest.json',
	'a_better_use.json',
	'a_first_foothold.json',
	'a_lay_of_the_land.json',
	'a_new_type_of_plant.json',
	'a_reveal_in_ruins.json',
	'a_symbol_of_unification.json',
	'a_warm_place_to_rest.json',
	'after_rain_comes.json',
	'armored_transports.json',
	'back_on_top.json',
	'bees.json',
	'broken_monument.json',
	'building_a_library.json',
	'celestes_journals.json',
	'clearer_skies.json',
	'cold_storage.json',
	'communication_hideout.json',
	'digging_up_dirt.json',
	'doctors_orders.json',
	'dormant_barons.json',
	'down_to_earth.json',
	'echoes_of_victory_ridge.json',
	'espresso.json',
	'eyes_in_the_sky.json',
	'eyes_on_the_prize.json',
	'flickering_threat.json',
	'greasing_her_palms.json',
	'hatch_repairs.json',
	'in_my_image.json',
	'industrial_espionage.json',
	'into_the_fray.json',
	'keeping_the_memory.json',
	'life_of_a_pharmacist.json',
	'lost_in_transmission.json',
	'marked_for_death.json',
	'market_correction.json',
	'medical_merchandise.json',
	'mixed_signals.json',
	'off_the_radar.json',
	'our_presence_up_there.json',
	'out_of_the_shadows.json',
	'picking_up_the_pieces.json',
	'power_out.json',
	'prescriptions_of_the_past.json',
	'reduced_to_rubble.json',
	'safe_passage.json',
	'snap_and_salvage.json',
	'source_of_the_contamination.json',
	'sparks_fly.json',
	'straight_record.json',
	'switching_the_supply.json',
	'the_majors_footlocker.json',
	'the_right_tool.json',
	'the_root_of_the_matter.json',
	'the_trifecta.json',
	'trash_into_treasure.json',
	'tribute_to_toledo.json',
	'turnabout.json',
	'unexpected_initiative.json',
	'untended_garden.json',
	'water_troubles.json',
	'what_goes_around.json',
	'what_we_left_behind.json',
	'with_a_trace.json',
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
				res.on('data', chunk => (data += chunk))
				res.on('end', () => {
					try {
						resolve(JSON.parse(data))
					} catch (err) {
						reject(new Error(`Failed to parse JSON from ${url}: ${err.message}`))
					}
				})
			})
			.on('error', reject)
	})
}

/**
 * Convert GitHub quest item IDs to match MetaForge naming
 * GitHub uses snake_case (metal_parts), MetaForge uses kebab-case (metal-parts)
 * @param {string} itemId - Item ID to transform
 * @returns {string} Transformed item ID
 */
function transformItemId(itemId) {
	return itemId.replace(/_/g, '-')
}

/**
 * Convert GitHub quest ID to MetaForge quest ID format
 * @param {Object} questData - GitHub quest data
 * @returns {string} Quest ID in kebab-case
 */
function getQuestId(questData) {
	// GitHub has internal IDs (ss5), but we want to use the name-based ID
	// Convert quest name to kebab-case
	if (!questData.name || !questData.name.en) {
		throw new Error('Quest missing English name')
	}
	return questData.name.en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * Fetch all quest chain data from GitHub
 * @returns {Promise<Array>} Array of quest chain data
 */
export async function fetchQuestChains() {
	console.log('📦 Fetching quest chains from GitHub...\n')

	try {
		// Fetch all quest files in parallel
		const promises = QUEST_FILES.map(file => {
			const url = `${GITHUB_BASE}/${file}`
			return fetchJSON(url).catch(err => {
				console.warn(`   ⚠️  Failed to fetch ${file}: ${err.message}`)
				return null
			})
		})

		const results = await Promise.all(promises)
		const questChains = results.filter(q => q !== null)

		console.log(`   ✓ Fetched ${questChains.length} quest chains from GitHub\n`)

		// Create a map of GitHub ID to quest name for resolving previousQuestIds and nextQuestIds
		const githubIdToName = new Map(questChains.map(q => [q.id, q.name.en]))

		// Transform to our format
		return questChains.map(quest => {
			const questId = getQuestId(quest)

			return {
				id: questId,
				nameEn: quest.name.en, // Store English name for matching with API
				githubId: quest.id, // Keep original ID for reference
				trader: quest.trader,
				updatedAt: quest.updatedAt,
				previousQuestIds: (quest.previousQuestIds || []).map(id => {
					// Return the quest name instead of generated ID for better matching
					return githubIdToName.get(id) || id
				}),
				nextQuestIds: (quest.nextQuestIds || []).map(id => {
					return githubIdToName.get(id) || id
				}),
			}
		})
	} catch (error) {
		console.error('❌ Failed to fetch quest chains from GitHub:', error.message)
		throw error
	}
}

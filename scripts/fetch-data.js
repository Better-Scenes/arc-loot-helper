/**
 * Data Fetcher Script
 * Fetches game data JSON files from arcraiders-data repository
 * Run with: node scripts/fetch-data.js
 */

import { promises as fs } from 'fs'
import https from 'https'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const BASE_URL = 'https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/'
const FILES = [
	'items.json',
	'quests.json',
	'hideoutModules.json',
	'projects.json',
	'skillNodes.json',
]
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data')

/**
 * Fetch a file from URL using https module
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} - File content
 */
function fetchFile(url) {
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
					resolve(data)
				})
			})
			.on('error', reject)
	})
}

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
 * Main fetch function
 */
async function fetchData() {
	console.log('🚀 Starting data fetch from arcraiders-data repository...\n')

	try {
		// Ensure output directory exists
		await ensureDir(OUTPUT_DIR)

		// Fetch all files
		let successCount = 0
		let failureCount = 0

		for (const file of FILES) {
			const url = `${BASE_URL}${file}`
			const outputPath = join(OUTPUT_DIR, file)

			try {
				console.log(`📥 Fetching ${file}...`)
				const content = await fetchFile(url)

				// Validate JSON
				const parsed = JSON.parse(content)
				const itemCount = Array.isArray(parsed) ? parsed.length : 'N/A'

				// Write to file
				await fs.writeFile(outputPath, content, 'utf-8')

				console.log(
					`   ✅ Saved ${file} (${(content.length / 1024).toFixed(1)}KB, ${itemCount} items)\n`
				)
				successCount++
			} catch (error) {
				console.error(`   ❌ Failed to fetch ${file}:`, error.message, '\n')
				failureCount++
			}
		}

		// Summary
		console.log('─'.repeat(50))
		console.log(`\n📊 Summary:`)
		console.log(`   ✅ Success: ${successCount}/${FILES.length}`)
		console.log(`   ❌ Failed: ${failureCount}/${FILES.length}`)

		if (failureCount > 0) {
			console.log('\n⚠️  Some files failed to fetch. Build may be incomplete.')
			process.exit(1)
		} else {
			console.log('\n🎉 All data fetched successfully!')
		}
	} catch (error) {
		console.error('\n💥 Fatal error:', error)
		process.exit(1)
	}
}

// Run the fetch
fetchData()

export { fetchData, fetchFile, ensureDir }

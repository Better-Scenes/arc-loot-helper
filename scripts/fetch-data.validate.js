/**
 * Tests for data fetcher script
 * Run with: node scripts/fetch-data.test.js
 */

import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data')

async function testDataFetcher() {
	console.log('🧪 Testing data fetcher...\n')

	// Test 1: Output directory should exist
	try {
		await fs.access(OUTPUT_DIR)
		console.log('✅ Test 1: Output directory exists')
	} catch {
		console.log('❌ Test 1 FAILED: Output directory does not exist')
		return false
	}

	// Test 2: All required files should exist
	const requiredFiles = [
		'items.json',
		'quests.json',
		'hideoutModules.json',
		'projects.json',
		'skillNodes.json',
	]

	for (const file of requiredFiles) {
		const filePath = join(OUTPUT_DIR, file)
		try {
			await fs.access(filePath)
			const stats = await fs.stat(filePath)
			if (stats.size === 0) {
				console.log(`❌ Test 2 FAILED: ${file} is empty`)
				return false
			}
			console.log(`✅ Test 2: ${file} exists and has content (${stats.size} bytes)`)
		} catch {
			console.log(`❌ Test 2 FAILED: ${file} does not exist`)
			return false
		}
	}

	// Test 3: Files should contain valid JSON
	for (const file of requiredFiles) {
		const filePath = join(OUTPUT_DIR, file)
		try {
			const content = await fs.readFile(filePath, 'utf-8')
			const data = JSON.parse(content)
			if (Array.isArray(data) && data.length > 0) {
				console.log(`✅ Test 3: ${file} contains valid JSON array with ${data.length} items`)
			} else if (typeof data === 'object') {
				console.log(`✅ Test 3: ${file} contains valid JSON object`)
			} else {
				console.log(`❌ Test 3 FAILED: ${file} has unexpected format`)
				return false
			}
		} catch (error) {
			console.log(`❌ Test 3 FAILED: ${file} contains invalid JSON:`, error.message)
			return false
		}
	}

	console.log('\n🎉 All tests passed!')
	return true
}

testDataFetcher().catch(error => {
	console.error('❌ Test error:', error)
	process.exit(1)
})

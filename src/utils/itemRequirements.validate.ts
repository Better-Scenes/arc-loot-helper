/**
 * Validation script to test item requirements aggregator with real data
 * Run with: npx tsx src/utils/itemRequirements.validate.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import type { Quest, HideoutModule, Project, Item } from '../data/types'
import { calculateItemRequirements } from './itemRequirements'

// Load real game data
const dataDir = join(process.cwd(), 'public', 'data')
const quests: Quest[] = JSON.parse(readFileSync(join(dataDir, 'quests.json'), 'utf-8'))
const hideoutModules: HideoutModule[] = JSON.parse(
	readFileSync(join(dataDir, 'hideoutModules.json'), 'utf-8')
)
const projects: Project[] = JSON.parse(readFileSync(join(dataDir, 'projects.json'), 'utf-8'))
const items: Item[] = JSON.parse(readFileSync(join(dataDir, 'items.json'), 'utf-8'))

console.log('📊 Validating Item Requirements Aggregator with Real Data...\n')
console.log(`Data loaded:`)
console.log(`  - ${quests.length} quests`)
console.log(`  - ${hideoutModules.length} hideout modules`)
console.log(`  - ${projects.length} projects`)
console.log(`  - ${items.length} items\n`)

// Calculate total requirements
const requirements = calculateItemRequirements(quests, hideoutModules, projects)

// Sort by quantity needed (descending)
const sortedRequirements = Object.entries(requirements).sort(([, a], [, b]) => b - a)

console.log(`✅ Aggregation complete!`)
console.log(`   Total unique items needed: ${sortedRequirements.length}\n`)

// Show top 10 most needed items
console.log('🔝 Top 10 Most Needed Items:')
console.log('─'.repeat(60))

for (let i = 0; i < Math.min(10, sortedRequirements.length); i++) {
	const [itemId, quantity] = sortedRequirements[i]
	const item = items.find(it => it.id === itemId)
	const itemName = item ? item.name.en : itemId

	console.log(`${(i + 1).toString().padStart(2)}. ${itemName.padEnd(30)} x ${quantity}`)
}

// Show statistics
console.log('\n📈 Statistics:')
console.log('─'.repeat(60))

const totalQuantity = sortedRequirements.reduce((sum, [, qty]) => sum + qty, 0)
const avgQuantity = totalQuantity / sortedRequirements.length

console.log(`Total items needed (all quantities): ${totalQuantity.toLocaleString()}`)
console.log(`Average quantity per item: ${avgQuantity.toFixed(2)}`)
console.log(`Max quantity needed: ${sortedRequirements[0][1]}`)
console.log(`Min quantity needed: ${sortedRequirements[sortedRequirements.length - 1][1]}`)

// Verify no negative quantities
const negativeItems = sortedRequirements.filter(([, qty]) => qty < 0)
if (negativeItems.length > 0) {
	console.log(`\n❌ ERROR: Found ${negativeItems.length} items with negative quantities!`)
	process.exit(1)
}

console.log('\n✅ Validation passed - all quantities are positive!')

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: [],
		// Set reasonable timeouts
		testTimeout: 10000,
		hookTimeout: 10000,
		teardownTimeout: 5000,
		// Better error handling
		passWithNoTests: false,
		// Coverage configuration (optional)
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'dist/',
				'**/*.config.*',
				'**/*.d.ts',
				'**/types.ts',
				'**/__tests__/**',
			],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})

/**
 * Footer Component
 * Displays legal disclaimer and data source attribution
 */

export function Footer() {
	return (
		<footer className="mt-16 border-t border-white/10 bg-zinc-900/50 py-8">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="space-y-4 text-center text-sm text-zinc-400">
					<p>
						<strong className="text-zinc-300">Legal Disclaimer:</strong> This is an unofficial fan-made
						tool. All game content, assets, and data are the property of{' '}
						<a
							href="https://www.embark-studios.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80 transition-colors"
						>
							Embark Studios
						</a>
						. ARC Raiders™ is a trademark of Embark Studios. This project is not affiliated with, endorsed
						by, or sponsored by Embark Studios.
					</p>
					<p>
						<strong className="text-zinc-300">Data Source:</strong> Game data provided by{' '}
						<a
							href="https://github.com/RaidTheory/arcraiders-data"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80 transition-colors"
						>
							RaidTheory/arcraiders-data
						</a>
						.
					</p>
				</div>
			</div>
		</footer>
	)
}

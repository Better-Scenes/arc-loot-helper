import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { GameDataProvider } from './contexts/GameDataContext'

// Update HTML element classes for proper styling
document.documentElement.classList.add('h-full', 'bg-zinc-100', 'dark:bg-zinc-900')
document.body.classList.add('h-full')

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<GameDataProvider>
				<App />
			</GameDataProvider>
		</BrowserRouter>
	</StrictMode>
)

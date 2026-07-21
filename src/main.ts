import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import './styles.css'

document.addEventListener('click', async (event) => {
	const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
		'a[href]'
	)
	if (!link) return
	const url = new URL(link.href, window.location.href)
	if (!['http:', 'https:'].includes(url.protocol)) return
	if (url.origin === window.location.origin) return
	if (!('__TAURI_INTERNALS__' in window)) return
	event.preventDefault()
	const {openUrl} = await import('@tauri-apps/plugin-opener')
	await openUrl(url.href)
})

const app = createApp(App)

app.use(router)

app.mount('#app')

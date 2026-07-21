<script setup lang="ts">
import {computed} from 'vue'

type IconDefinition = {width: number; height: number; body: string}

const icons: Record<string, IconDefinition> = {
	'tabler:photo-off': {
		width: 24,
		height: 24,
		body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M15 8h.01M7 3h11a3 3 0 0 1 3 3v11m-.856 3.099A3 3 0 0 1 18 21H6a3 3 0 0 1-3-3V6c0-.845.349-1.608.91-2.153"/><path d="m3 16l5-5c.928-.893 2.072-.893 3 0l5 5m.33-3.662c.574-.054 1.155.166 1.67.662l3 3M3 3l18 18"/></g>',
	},
	'tabler:git-branch': {
		width: 24,
		height: 24,
		body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M5 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0m10 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7 8v8m2 2h6a2 2 0 0 0 2-2v-5"/><path d="m14 14l3-3l3 3"/></g>',
	},
	'tabler:external-link': {
		width: 24,
		height: 24,
		body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6m-7 1l9-9m-5 0h5v5"/>',
	},
	'tabler:x': {
		width: 24,
		height: 24,
		body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/>',
	},
	'tabler:arrow-left': {
		width: 24,
		height: 24,
		body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l6 6m-6-6l6-6"/>',
	},
	'tabler:diamond-filled': {
		width: 24,
		height: 24,
		body: '<path fill="currentColor" d="M18 4a1 1 0 0 1 .783.378l.074.108l3 5a1 1 0 0 1-.032 1.078l-.08.103l-8.53 9.533a1.7 1.7 0 0 1-1.215.51c-.4 0-.785-.14-1.11-.417l-.135-.126l-8.5-9.5A1 1 0 0 1 2.083 9.6l.06-.115l3.013-5.022l.064-.09a1 1 0 0 1 .155-.154l.089-.064l.088-.05l.05-.023l.06-.025l.109-.032l.112-.02L6 4zM9.114 7.943a1 1 0 0 0-1.371.343l-.6 1l-.06.116a1 1 0 0 0 .177 1.07l2 2.2l.09.088a1 1 0 0 0 1.323-.02l.087-.09a1 1 0 0 0-.02-1.323l-1.501-1.65l.218-.363l.055-.103a1 1 0 0 0-.398-1.268"/>',
	},
	'tabler:filter': {
		width: 24,
		height: 24,
		body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h16v2.172a2 2 0 0 1-.586 1.414L15 12v7l-6 2v-8.5L4.52 7.572A2 2 0 0 1 4 6.227z"/>',
	},
	'tabler:chevron-left': {
		width: 24,
		height: 24,
		body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 6l-6 6l6 6"/>',
	},
	'tabler:chevron-up': {
		width: 24,
		height: 24,
		body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 15l6-6l6 6"/>',
	},
	'tabler:chevron-down': {
		width: 24,
		height: 24,
		body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6"/>',
	},
	'tabler:chevron-right': {
		width: 24,
		height: 24,
		body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 6l6 6l-6 6"/>',
	},
	'mdi:github': {
		width: 24,
		height: 24,
		body: '<path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>',
	},
	'mdi:coffee': {
		width: 24,
		height: 24,
		body: '<path fill="currentColor" d="M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"/>',
	},
	'mdi:music-note': {
		width: 24,
		height: 24,
		body: '<path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3z"/>',
	},
	'material-symbols:home': {
		width: 24,
		height: 24,
		body: '<path fill="currentColor" d="M4 21V9l8-6l8 6v12h-6v-7h-4v7z"/>',
	},
	'material-symbols:compare': {
		width: 24,
		height: 24,
		body: '<path fill="currentColor" d="M10 23v-2H5q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h5V1h2v22zm-5-5h5v-6zm9 3v-9l5 6V5h-5V3h5q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21z"/>',
	},
	'material-symbols:chat-info-rounded': {
		width: 24,
		height: 24,
		body: '<path fill="currentColor" d="M12 7q.425 0 .713-.288T13 6t-.288-.712T12 5t-.712.288T11 6t.288.713T12 7m.713 7.713Q13 14.425 13 14v-4q0-.425-.288-.712T12 9t-.712.288T11 10v4q0 .425.288.713T12 15t.713-.288M6 18l-2.3 2.3q-.475.475-1.088.213T2 19.575V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18z"/>',
	},
	'material-symbols:search-rounded': {
		width: 24,
		height: 24,
		body: '<path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/>',
	},
}

const props = defineProps<{icon: string}>()
const definition = computed(() => icons[props.icon])
</script>

<template>
	<svg
		v-if="definition"
		xmlns="http://www.w3.org/2000/svg"
		:width="definition.width"
		:height="definition.height"
		:viewBox="`0 0 ${definition.width} ${definition.height}`"
		aria-hidden="true"
		focusable="false"
		role="img"
		v-html="definition.body"
	/>
</template>

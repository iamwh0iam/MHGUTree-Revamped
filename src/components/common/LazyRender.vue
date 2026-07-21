<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch} from 'vue'

const props = withDefaults(
	defineProps<{
		minHeight?: string
		forceVisible?: boolean
	}>(),
	{minHeight: '100px', forceVisible: false}
)

const emit = defineEmits<{revealed: []}>()

const isVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function reveal() {
	if (isVisible.value) return
	isVisible.value = true
	emit('revealed')
	observer?.disconnect()
	observer = null
}

watch(
	() => props.forceVisible,
	(forceVisible) => {
		if (forceVisible) reveal()
	},
	{immediate: true}
)

/** Walk up the DOM to find the nearest scrollable ancestor. */
function findScrollParent(el: HTMLElement): HTMLElement | null {
	let node: HTMLElement | null = el.parentElement
	while (node) {
		const {overflow, overflowX, overflowY} = getComputedStyle(node)
		if (/(auto|scroll)/.test(overflow + overflowX + overflowY)) return node
		node = node.parentElement
	}
	return null
}

onMounted(() => {
	if (isVisible.value) return
	const root = containerRef.value ? findScrollParent(containerRef.value) : null

	observer = new IntersectionObserver(
		(entries) => {
			if (entries?.[0]?.isIntersecting) {
				reveal()
			}
		},
		// Use the scrollable container as root so horizontal scrolling
		// also triggers observation. rootMargin pre-loads clusters just
		// outside the visible area in all directions.
		{root, rootMargin: '400px'}
	)
	if (containerRef.value) {
		observer.observe(containerRef.value)
	}
})

onUnmounted(() => {
	observer?.disconnect()
	observer = null
})
</script>

<template>
	<div ref="containerRef">
		<slot v-if="isVisible" />
		<div v-else :style="{minHeight: props.minHeight}" />
	</div>
</template>

<script setup lang="ts">
import Icon from '@/components/common/AppIcon.vue'
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'

const props = withDefaults(
	defineProps<{
		target?: HTMLElement | null
		horizontal?: boolean
	}>(),
	{horizontal: false}
)

const root = ref<HTMLElement | null>(null)
const showTop = ref(false)
const showStart = ref(false)
let activeTarget: HTMLElement | null = null

function findScrollableAncestor(): HTMLElement | null {
	let current = root.value?.parentElement ?? null
	while (current) {
		const style = getComputedStyle(current)
		if (/(auto|scroll)/.test(`${style.overflow}${style.overflowY}`))
			return current
		current = current.parentElement
	}
	return null
}

function updateVisibility(): void {
	showTop.value = (activeTarget?.scrollTop ?? 0) > 320
	showStart.value = props.horizontal && (activeTarget?.scrollLeft ?? 0) > 240
}

function detach(): void {
	activeTarget?.removeEventListener('scroll', updateVisibility)
	activeTarget = null
}

function attach(): void {
	detach()
	activeTarget =
		props.target === undefined ? findScrollableAncestor() : props.target
	activeTarget?.addEventListener('scroll', updateVisibility, {passive: true})
	updateVisibility()
}

function scrollToPosition(axis: 'top' | 'left'): void {
	if (!activeTarget) return
	const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
	activeTarget.scrollTo({
		top: axis === 'top' ? 0 : activeTarget.scrollTop,
		left: axis === 'left' ? 0 : activeTarget.scrollLeft,
		behavior: smooth ? 'smooth' : 'auto',
	})
}

watch(
	() => props.target,
	async () => {
		await nextTick()
		attach()
	}
)

onMounted(attach)
onBeforeUnmount(detach)
</script>

<template>
	<div
		ref="root"
		class="flex items-center gap-1"
		aria-label="Scroll navigation"
	>
		<button
			v-if="showStart"
			type="button"
			class="grid h-10 w-10 place-items-center rounded-full border border-primary-600 bg-primary-900/95 text-primary-200 shadow-xl backdrop-blur transition hover:bg-primary-700 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-400"
			aria-label="Back to start"
			title="Back to start"
			@click="scrollToPosition('left')"
		>
			<Icon icon="tabler:chevron-left" class="h-5 w-5" />
		</button>
		<button
			v-if="showTop"
			type="button"
			class="grid h-10 w-10 place-items-center rounded-full border border-primary-600 bg-primary-900/95 text-primary-200 shadow-xl backdrop-blur transition hover:bg-primary-700 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-400"
			aria-label="Back to top"
			title="Back to top"
			@click="scrollToPosition('top')"
		>
			<Icon icon="tabler:chevron-up" class="h-5 w-5" />
		</button>
	</div>
</template>

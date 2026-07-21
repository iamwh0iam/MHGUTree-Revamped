<script setup lang="ts">
import Icon from '@/components/common/AppIcon.vue'
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'

const props = withDefaults(
	defineProps<{
		open: boolean
		title: string
		titleId: string
		size?: 'narrow' | 'wide'
	}>(),
	{size: 'wide'}
)
const emit = defineEmits<{close: []}>()
const closeButton = ref<HTMLButtonElement | null>(null)
let returnFocusTo: HTMLElement | null = null

function onWindowKeydown(event: KeyboardEvent): void {
	if (event.key === 'Escape' && props.open) emit('close')
}

watch(
	() => props.open,
	async (open) => {
		if (open) {
			returnFocusTo = document.activeElement as HTMLElement | null
			await nextTick()
			closeButton.value?.focus()
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
			returnFocusTo?.focus()
			returnFocusTo = null
		}
	}
)

onMounted(() => window.addEventListener('keydown', onWindowKeydown))
onBeforeUnmount(() => {
	window.removeEventListener('keydown', onWindowKeydown)
	document.body.style.overflow = ''
})
</script>

<template>
	<Teleport to="body">
		<div v-if="open" class="fixed inset-0 z-50">
			<button
				type="button"
				class="absolute inset-0 h-full w-full bg-black/60"
				:aria-label="`Close ${title} details`"
				@click="emit('close')"
			/>
			<aside
				class="absolute inset-y-0 right-0 flex w-full flex-col border-l border-primary-600 bg-primary-800 shadow-2xl"
				:class="size === 'narrow' ? 'sm:w-[310px]' : 'sm:w-[480px]'"
				role="dialog"
				aria-modal="true"
				:aria-labelledby="titleId"
			>
				<header
					class="flex items-center justify-between gap-3 border-b border-primary-600 px-4 py-3"
				>
					<div class="min-w-0">
						<h2 :id="titleId" class="text-lg font-bold">
							<slot name="title">{{ title }}</slot>
						</h2>
						<slot name="eyebrow" />
					</div>
					<button
						ref="closeButton"
						type="button"
						class="rounded p-1.5 text-primary-300 hover:bg-primary-700 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-400"
						:aria-label="`Close ${title} details`"
						@click="emit('close')"
					>
						<Icon icon="tabler:x" class="h-6 w-6" />
					</button>
				</header>
				<div class="scrollable flex-1 overflow-y-auto px-4 py-5"><slot /></div>
			</aside>
		</div>
	</Teleport>
</template>

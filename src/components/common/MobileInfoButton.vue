<script setup lang="ts">
import {ref, useId} from 'vue'
import Icon from '@/components/common/AppIcon.vue'
import MobileBottomSheet from '@/components/common/MobileBottomSheet.vue'

const props = withDefaults(
	defineProps<{
		title: string
		placement?: 'armor' | 'weapon'
	}>(),
	{placement: 'armor'}
)

const open = ref(false)
const sheet = ref<{
	open: () => Promise<void>
	close: (returnFocus?: boolean) => void
} | null>(null)
const id = useId().replace(/:/g, '')
const panelId = `mobile-info-${id}`
const titleId = `${panelId}-title`

function show(event: MouseEvent): void {
	event.stopPropagation()
	void sheet.value?.open()
}
</script>

<template>
	<button
		type="button"
		class="group absolute -bottom-1 z-20 grid h-10 w-10 place-items-center rounded-md md:hidden"
		:class="props.placement === 'weapon' ? 'right-1' : 'right-0'"
		:aria-label="`Show ${props.title}`"
		aria-haspopup="dialog"
		:aria-expanded="open"
		@click="show"
		@keydown.stop
	>
		<span
			aria-hidden="true"
			class="grid h-6 w-6 place-items-center rounded-md border border-primary-500/60 bg-primary-800/95 text-sm font-bold leading-none text-primary-200 shadow-sm shadow-black/30 transition-colors group-active:bg-primary-600 group-active:text-white"
		>
			i
		</span>
	</button>

	<Teleport to="body">
		<div
			class="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:hidden"
		>
			<MobileBottomSheet
				ref="sheet"
				v-model="open"
				:panel-id="panelId"
				:labelledby="titleId"
				:close-label="`Close ${props.title}`"
				size="content"
			>
				<template #trigger />
				<template #default="{close}">
					<header
						class="flex shrink-0 items-center justify-between gap-3 border-b border-primary-600 px-4 py-2"
					>
						<h2 :id="titleId" class="min-w-0 truncate text-base font-bold">
							{{ props.title }}
						</h2>
						<button
							type="button"
							data-bottom-sheet-autofocus
							class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-primary-300 transition hover:bg-primary-700 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-400"
							:aria-label="`Close ${props.title}`"
							@click="close()"
						>
							<Icon icon="tabler:x" class="h-5 w-5" />
						</button>
					</header>
					<div
						class="scrollable max-h-[calc(100dvh-6rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-none overflow-y-auto overscroll-contain px-4 pb-4 pt-3 text-sm"
					>
						<slot />
					</div>
				</template>
			</MobileBottomSheet>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import {onBeforeUnmount, ref, useId} from 'vue'
import Icon from '@/components/common/AppIcon.vue'
import MobileBottomSheet from '@/components/common/MobileBottomSheet.vue'

const props = withDefaults(
	defineProps<{
		title: string
		placement?: 'armor' | 'weapon'
		teleportTooltip?: boolean
		largeTooltip?: boolean
	}>(),
	{placement: 'armor', teleportTooltip: false, largeTooltip: false}
)

const open = ref(false)
const sheet = ref<{
	open: () => Promise<void>
	close: (returnFocus?: boolean) => void
} | null>(null)
const id = useId().replace(/:/g, '')
const panelId = `mobile-info-${id}`
const tooltipId = `${panelId}-tooltip`
const titleId = `${panelId}-title`
const tooltipAnchor = ref<HTMLButtonElement | null>(null)
const desktopTooltipOpen = ref(false)
const tooltipStyle = ref({top: '0px', right: '0px'})

function updateTooltipPosition(): void {
	const rect = tooltipAnchor.value?.getBoundingClientRect()
	if (!rect) return
	tooltipStyle.value = {
		top: `${rect.bottom + 4}px`,
		right: `${Math.max(8, window.innerWidth - rect.right)}px`,
	}
}

function showDesktopTooltip(): void {
	if (!props.teleportTooltip) return
	updateTooltipPosition()
	desktopTooltipOpen.value = true
	window.addEventListener('resize', updateTooltipPosition)
	window.addEventListener('scroll', updateTooltipPosition, true)
}

function hideDesktopTooltip(): void {
	if (!props.teleportTooltip) return
	desktopTooltipOpen.value = false
	window.removeEventListener('resize', updateTooltipPosition)
	window.removeEventListener('scroll', updateTooltipPosition, true)
}

function show(event: MouseEvent): void {
	event.stopPropagation()
	if (window.matchMedia('(min-width: 768px)').matches) return
	void sheet.value?.open()
}

onBeforeUnmount(hideDesktopTooltip)
</script>

<template>
	<div
		class="group/info absolute bottom-0 z-10 md:z-10 md:hover:z-40 md:focus-within:z-40"
		:class="props.placement === 'weapon' ? 'right-1' : 'right-0'"
		@mouseenter="showDesktopTooltip"
		@mouseleave="hideDesktopTooltip"
		@focusin="showDesktopTooltip"
		@focusout="hideDesktopTooltip"
	>
		<button
			ref="tooltipAnchor"
			type="button"
			class="grid h-10 w-10 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-secondary-400"
			:aria-label="`Show ${props.title}`"
			aria-haspopup="dialog"
			:aria-expanded="open"
			:aria-describedby="tooltipId"
			@click="show"
			@keydown.stop
		>
			<span
				aria-hidden="true"
				class="grid h-6 w-6 place-items-center rounded-md border border-primary-500/60 bg-primary-800/95 text-sm font-bold leading-none text-primary-200 shadow-sm shadow-black/30 transition-colors group-hover/info:border-primary-400 group-hover/info:bg-primary-700 group-hover/info:text-white group-focus-within/info:border-primary-400 group-focus-within/info:bg-primary-700 group-focus-within/info:text-white"
			>
				i
			</span>
		</button>

		<div
			v-if="!props.teleportTooltip"
			:id="tooltipId"
			class="pointer-events-none invisible absolute right-0 top-full mt-1 hidden w-max max-w-[min(24rem,calc(100vw-2rem))] rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-100 opacity-0 shadow-xl transition-opacity md:block md:group-hover/info:visible md:group-hover/info:opacity-100 md:group-focus-within/info:visible md:group-focus-within/info:opacity-100"
		>
			<slot />
		</div>
	</div>

	<Teleport to="body">
		<div
			v-if="props.teleportTooltip && desktopTooltipOpen"
			:id="tooltipId"
			:style="tooltipStyle"
			class="pointer-events-none fixed z-[60] w-max max-w-[min(24rem,calc(100vw-2rem))] rounded-md border border-gray-600 bg-gray-800 text-gray-100 shadow-xl"
			:class="props.largeTooltip ? 'p-3 text-sm' : 'p-2 text-sm'"
		>
			<slot />
		</div>

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

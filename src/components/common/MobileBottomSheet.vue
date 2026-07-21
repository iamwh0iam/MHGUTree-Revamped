<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, ref} from 'vue'

const props = withDefaults(
	defineProps<{
		modelValue: boolean
		panelId: string
		labelledby: string
		closeLabel?: string
		size?: 'content' | 'full'
	}>(),
	{closeLabel: 'Close panel', size: 'full'}
)

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
}>()

const root = ref<HTMLElement | null>(null)
let returnFocusTo: HTMLElement | null = null

async function open(): Promise<void> {
	returnFocusTo = document.activeElement as HTMLElement | null
	emit('update:modelValue', true)
	await nextTick()
	root.value
		?.querySelector<HTMLElement>('[data-bottom-sheet-autofocus]')
		?.focus()
}

function close(returnFocus = true): void {
	emit('update:modelValue', false)
	if (returnFocus) {
		void nextTick(() => {
			if (returnFocusTo?.isConnected) returnFocusTo.focus()
		})
	}
}

function onWindowKeydown(event: KeyboardEvent): void {
	if (event.key !== 'Escape' || !props.modelValue) return
	event.preventDefault()
	event.stopImmediatePropagation()
	close()
}

function trapFocus(event: KeyboardEvent): void {
	if (event.key !== 'Tab') return
	const dialog = event.currentTarget as HTMLElement
	const focusable = Array.from(
		dialog.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
		)
	)
	if (!focusable.length) return
	const first = focusable[0]
	const last = focusable[focusable.length - 1]
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault()
		last?.focus()
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault()
		first?.focus()
	}
}

defineExpose({open, close})

onMounted(() => window.addEventListener('keydown', onWindowKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown))
</script>

<template>
	<div ref="root" class="relative h-14 w-full md:hidden">
		<Transition name="bottom-sheet-trigger">
			<div v-if="!modelValue" class="absolute inset-0">
				<slot name="trigger" :open="open" />
			</div>
		</Transition>

		<Transition name="bottom-sheet-backdrop">
			<button
				v-if="modelValue"
				type="button"
				class="pointer-events-auto fixed inset-0 z-50 bg-black/60"
				:aria-label="closeLabel"
				@click="close()"
			/>
		</Transition>

		<Transition name="bottom-sheet-panel">
			<section
				v-if="modelValue"
				:id="panelId"
				class="pointer-events-auto absolute inset-x-0 bottom-0 z-[60] flex max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-primary-600 bg-primary-800 shadow-2xl"
				:class="props.size === 'content' ? 'h-fit' : 'h-[70dvh]'"
				role="dialog"
				aria-modal="true"
				:aria-labelledby="labelledby"
				@keydown="trapFocus"
			>
				<slot :close="close" />
			</section>
		</Transition>
	</div>
</template>

<style scoped>
.bottom-sheet-panel-enter-active {
	transition:
		opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
		transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	transform-origin: bottom center;
}

.bottom-sheet-panel-leave-active {
	transition:
		opacity 0.15s ease-in,
		transform 0.15s ease-in;
	transform-origin: bottom center;
}

.bottom-sheet-panel-enter-from,
.bottom-sheet-panel-leave-to {
	opacity: 0;
	transform: scale(0.7);
}

.bottom-sheet-trigger-enter-active,
.bottom-sheet-trigger-leave-active {
	transition:
		opacity 0.15s ease,
		transform 0.15s ease;
	transform-origin: bottom center;
}

.bottom-sheet-trigger-enter-from,
.bottom-sheet-trigger-leave-to {
	opacity: 0;
	transform: scale(0.5);
}

.bottom-sheet-backdrop-enter-active,
.bottom-sheet-backdrop-leave-active {
	transition: opacity 0.2s ease;
}

.bottom-sheet-backdrop-enter-from,
.bottom-sheet-backdrop-leave-to {
	opacity: 0;
}
</style>

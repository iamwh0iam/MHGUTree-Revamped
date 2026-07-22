<script setup lang="ts">
import Icon from '@/components/common/AppIcon.vue'
import CatalogResultNavigation from '@/components/common/CatalogResultNavigation.vue'
import {computed, ref, useId} from 'vue'

type SearchOption = {
	id: string | number
	label: string
	secondary?: string
}

const query = defineModel<string>({required: true})
const props = withDefaults(
	defineProps<{
		placeholder: string
		inputLabel: string
		showNavigation?: boolean
		showOptions?: boolean
		activeIndex?: number
		resultCount?: number
		options?: SearchOption[]
	}>(),
	{
		showNavigation: false,
		showOptions: false,
		activeIndex: -1,
		resultCount: 0,
		options: () => [],
	}
)

const emit = defineEmits<{
	next: []
	previous: []
	clear: []
	select: [index: number]
}>()
const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const dropdownOpen = ref(false)
const listboxId = `catalog-search-options-${useId().replace(/:/g, '')}`
const hasOptions = computed(() => props.showNavigation || props.showOptions)

function clear(): void {
	query.value = ''
	dropdownOpen.value = false
	emit('clear')
}

function selectOption(index: number): void {
	dropdownOpen.value = false
	input.value?.blur()
	emit('select', index)
}

function onFocusOut(event: FocusEvent): void {
	if (!root.value?.contains(event.relatedTarget as Node | null))
		dropdownOpen.value = false
}

function onKeydown(event: KeyboardEvent): void {
	if (event.key === 'Escape') {
		event.preventDefault()
		clear()
		return
	}
	if (event.key !== 'Enter' || !props.showNavigation || !query.value.trim())
		return
	event.preventDefault()
	if (event.shiftKey) emit('previous')
	else emit('next')
}
</script>

<template>
	<div
		ref="root"
		role="search"
		class="relative order-first flex w-full min-w-0 flex-nowrap items-center gap-1 md:w-auto"
		@focusin="dropdownOpen = true"
		@focusout="onFocusOut"
	>
		<div class="relative min-w-0 flex-1 md:w-[14.25rem] md:flex-none">
			<Icon
				icon="material-symbols:search-rounded"
				class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-400"
			/>
			<input
				ref="input"
				v-model="query"
				type="text"
				role="searchbox"
				:placeholder="placeholder"
				:aria-label="inputLabel"
				:aria-expanded="hasOptions ? dropdownOpen : undefined"
				:aria-controls="hasOptions ? listboxId : undefined"
				:aria-autocomplete="hasOptions ? 'list' : undefined"
				class="h-11 w-full rounded-full border border-primary-600 bg-primary-800 py-2 pl-10 pr-10 text-base text-white outline-none transition placeholder:text-primary-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 md:text-sm"
				@keydown="onKeydown"
				@input="dropdownOpen = true"
			/>
			<button
				v-if="query"
				type="button"
				:aria-label="`Clear ${inputLabel.toLocaleLowerCase()}`"
				class="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-primary-400 transition-colors hover:bg-primary-700 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-400 md:rounded"
				@click="clear"
			>
				<Icon icon="tabler:x" class="h-4 w-4" />
			</button>
		</div>
		<CatalogResultNavigation
			v-if="showNavigation && query.trim()"
			:active-index="activeIndex"
			:result-count="resultCount"
			@previous="emit('previous')"
			@next="emit('next')"
		/>
		<div
			v-if="hasOptions && query.trim() && dropdownOpen"
			:id="listboxId"
			role="listbox"
			:aria-label="`${inputLabel} results`"
			class="scrollable absolute right-0 top-full z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-md border border-primary-600 bg-primary-900/98 p-1 shadow-2xl backdrop-blur md:left-0 md:right-auto md:w-[min(28rem,calc(100vw-2rem))]"
		>
			<button
				v-for="(option, index) in options"
				:key="option.id"
				type="button"
				role="option"
				:aria-selected="showNavigation && index === activeIndex"
				class="flex w-full items-center justify-between gap-4 rounded px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-secondary-400"
				:class="
					showNavigation && index === activeIndex
						? 'bg-secondary-600/30 text-white'
						: 'text-primary-200 hover:bg-primary-700 hover:text-white'
				"
				@mousedown.prevent
				@click="selectOption(index)"
			>
				<span class="min-w-0 truncate text-sm font-semibold">{{
					option.label
				}}</span>
				<span
					v-if="option.secondary"
					class="shrink-0 text-xs text-primary-400"
					>{{ option.secondary }}</span
				>
			</button>
			<div
				v-if="options.length === 0"
				class="px-3 py-3 text-center text-sm text-primary-400"
			>
				No results
			</div>
		</div>
	</div>
</template>

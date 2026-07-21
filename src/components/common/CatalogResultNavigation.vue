<script setup lang="ts">
import Icon from '@/components/common/AppIcon.vue'

withDefaults(
	defineProps<{
		activeIndex?: number
		resultCount?: number
		resultLabel?: string
		variant?: 'search' | 'floating'
	}>(),
	{
		activeIndex: -1,
		resultCount: 0,
		resultLabel: 'result',
		variant: 'search',
	}
)

const emit = defineEmits<{
	next: []
	previous: []
}>()
</script>

<template>
	<div
		class="flex shrink-0 items-center gap-1"
		:class="
			variant === 'floating'
				? 'h-10 rounded-full bg-accent-600 p-1 shadow-xl'
				: 'h-11 rounded-md border border-primary-600 bg-primary-800 px-1 shadow md:h-auto md:rounded-none md:border-0 md:bg-transparent md:px-0 md:shadow-none'
		"
		role="group"
		:aria-label="`${resultLabel} navigation`"
	>
		<span
			class="min-w-14 whitespace-nowrap text-center text-xs tabular-nums"
			:class="variant === 'floating' ? 'text-white' : 'text-gray-400'"
			aria-live="polite"
		>
			<template v-if="resultCount && activeIndex >= 0"
				>{{ activeIndex + 1 }} / {{ resultCount }}</template
			>
			<template v-else-if="resultCount">{{ resultCount }} results</template>
			<template v-else>0 results</template>
		</span>
		<button
			type="button"
			:aria-label="`Previous ${resultLabel}`"
			class="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors disabled:cursor-default disabled:opacity-30 md:rounded-md"
			:class="
				variant === 'floating'
					? 'text-white hover:bg-accent-500 active:bg-accent-700'
					: 'text-gray-300 hover:bg-primary-700 hover:text-white'
			"
			:disabled="resultCount === 0"
			@click="emit('previous')"
		>
			<Icon icon="tabler:chevron-left" class="h-5 w-5" />
		</button>
		<button
			type="button"
			:aria-label="`Next ${resultLabel}`"
			class="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors disabled:cursor-default disabled:opacity-30 md:rounded-md"
			:class="
				variant === 'floating'
					? 'text-white hover:bg-accent-500 active:bg-accent-700'
					: 'text-gray-300 hover:bg-primary-700 hover:text-white'
			"
			:disabled="resultCount === 0"
			@click="emit('next')"
		>
			<Icon icon="tabler:chevron-right" class="h-5 w-5" />
		</button>
	</div>
</template>

<script setup lang="ts">
import type {ArmorResistances, ResistanceType} from '@/data/armor/types'
import {resolveAssetUrl} from '@/data/assets'

defineProps<{resistances: ArmorResistances; compact?: boolean}>()
const resistanceTypes: {key: ResistanceType; label: string}[] = [
	{key: 'fire', label: 'Fire'},
	{key: 'water', label: 'Water'},
	{key: 'thunder', label: 'Thunder'},
	{key: 'ice', label: 'Ice'},
	{key: 'dragon', label: 'Dragon'},
]
function signed(value: number): string {
	return value > 0 ? `+${value}` : String(value)
}
</script>

<template>
	<div
		:class="compact ? 'flex items-center gap-2' : 'grid grid-cols-5 gap-1.5'"
	>
		<div
			v-for="resistance in resistanceTypes"
			:key="resistance.key"
			class="flex min-w-0 items-center gap-1"
			:class="
				compact
					? 'justify-start'
					: 'justify-center rounded bg-primary-900/45 px-1.5 py-1'
			"
			:title="`${resistance.label} resistance`"
		>
			<img
				:src="resolveAssetUrl(`icons/status/${resistance.key}.png`)"
				:alt="resistance.label"
				class="h-4 w-4 shrink-0"
			/>
			<span
				:class="[
					compact ? 'text-sm leading-none' : 'text-xs font-bold',
					resistances[resistance.key] > 0
						? 'text-green-400'
						: resistances[resistance.key] < 0
							? 'text-red-400'
							: '',
				]"
				>{{ signed(resistances[resistance.key]) }}</span
			>
		</div>
	</div>
</template>

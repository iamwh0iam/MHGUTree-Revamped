<script setup lang="ts">
import Icon from '@/components/common/AppIcon.vue'
import {computed} from 'vue'
import DetailsDrawer from '@/components/common/DetailsDrawer.vue'
import CraftingRecipeList from '@/components/crafting/CraftingRecipeList.vue'
import WeaponTurntable from '@/components/weapon-details/WeaponTurntable.vue'
import {
	isAvailableWeaponVisual,
	type WeaponVisual,
} from '@/data/weapons/visuals'
import type {WeaponTypeKey} from '@/data/weapons/types'

const props = defineProps<{
	visual: WeaponVisual | null
	weaponId: number | null
	weaponName: string
	weaponRarity: number | null
	weaponType: WeaponTypeKey
}>()
const emit = defineEmits<{close: []; showPath: []}>()
const availableVisual = computed(() =>
	props.visual && isAvailableWeaponVisual(props.visual) ? props.visual : null
)
</script>

<template>
	<DetailsDrawer
		:open="visual !== null"
		:title="weaponName"
		title-id="weapon-details-title"
		size="narrow"
		@close="emit('close')"
	>
		<template #title>
			<a
				v-if="visual"
				:href="visual.sourcePage"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex max-w-full items-center gap-1.5 text-secondary-300 transition hover:text-secondary-200 hover:underline"
				:aria-label="`Open ${weaponName} on Kiranico`"
			>
				<span class="truncate">{{ weaponName }}</span>
				<Icon icon="tabler:external-link" class="h-4 w-4 shrink-0" />
			</a>
			<template v-else>{{ weaponName }}</template>
		</template>
		<template #eyebrow>
			<div
				v-if="weaponRarity !== null"
				class="mt-0.5 text-xs font-semibold tracking-wider text-primary-300"
			>
				Rarity {{ weaponRarity }}
			</div>
		</template>

		<div class="flex min-h-full flex-col">
			<WeaponTurntable
				v-if="availableVisual"
				:visual="availableVisual"
				:weapon-name="weaponName"
			/>
			<div
				v-else
				class="mx-auto flex h-[270px] w-[270px] flex-col items-center justify-center gap-2 rounded-lg bg-primary-900 text-primary-500"
			>
				<Icon icon="tabler:photo-off" class="h-7 w-7" />
				<span class="text-xs">weapon model unavailable</span>
			</div>
			<CraftingRecipeList :weapon-id="weaponId" :weapon-type="weaponType" />
			<button
				v-if="weaponId !== null"
				type="button"
				class="mx-auto mt-5 flex w-[270px] items-center justify-center gap-2 rounded-md bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300"
				@click="emit('showPath')"
			>
				<Icon icon="tabler:git-branch" class="h-5 w-5" />
				Focus upgrade tree
			</button>
		</div>
	</DetailsDrawer>
</template>

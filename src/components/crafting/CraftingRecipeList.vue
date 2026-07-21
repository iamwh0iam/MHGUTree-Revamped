<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {
	loadWeaponCrafting,
	type CraftingRecipe,
	type WeaponCrafting,
} from '@/data/weapons/crafting'
import type {WeaponTypeKey} from '@/data/weapons/types'
import CraftingRecipeCard from '@/components/crafting/CraftingRecipeCard.vue'

type DisplayRecipe = CraftingRecipe & {method: 'create' | 'upgrade'}
const props = defineProps<{
	weaponId: number | null
	weaponType: WeaponTypeKey
}>()
const crafting = ref<WeaponCrafting>()
const craftingLoading = ref(false)
const craftingFailed = ref(false)
let craftingRequestId = 0

const displayedRecipes = computed<DisplayRecipe[]>(() => {
	const result: DisplayRecipe[] = []
	if (crafting.value?.create)
		result.push({...crafting.value.create, method: 'create'})
	if (crafting.value?.upgrade)
		result.push({...crafting.value.upgrade, method: 'upgrade'})
	return result
})

watch(
	[() => props.weaponId, () => props.weaponType],
	async ([weaponId]) => {
		const requestId = ++craftingRequestId
		crafting.value = undefined
		craftingFailed.value = false
		craftingLoading.value = weaponId !== null
		if (weaponId === null) return
		try {
			const result = await loadWeaponCrafting(props.weaponType, weaponId)
			if (requestId === craftingRequestId) crafting.value = result
		} catch {
			if (requestId === craftingRequestId) craftingFailed.value = true
		} finally {
			if (requestId === craftingRequestId) craftingLoading.value = false
		}
	},
	{immediate: true}
)
</script>

<template>
	<div
		v-if="craftingLoading"
		class="mx-auto mt-5 w-[270px] rounded-lg border border-primary-600 bg-primary-700/45 px-3 py-2 text-center text-xs text-primary-300"
	>
		Loading crafting data…
	</div>
	<div
		v-else-if="craftingFailed"
		class="mx-auto mt-5 w-[270px] rounded-lg border border-red-800/70 bg-red-950/40 px-3 py-2 text-center text-xs text-red-200"
	>
		Crafting data is unavailable.
	</div>
	<div
		v-else-if="displayedRecipes.length"
		class="mx-auto mt-5 flex w-[270px] flex-col gap-5"
	>
		<CraftingRecipeCard
			v-for="recipe in displayedRecipes"
			:key="recipe.method"
			:title="recipe.method === 'create' ? 'Create' : 'Upgrade'"
			:subtitle="
				recipe.fromWeapon ? `From ${recipe.fromWeapon.name}` : undefined
			"
			:cost="recipe.cost"
			:materials="recipe.materials"
		/>
	</div>
	<div
		v-else
		class="mx-auto mt-5 w-[270px] rounded-lg border border-primary-600 bg-primary-700/45 px-3 py-2 text-center text-xs text-primary-300"
	>
		No crafting data available.
	</div>
</template>

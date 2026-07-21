<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import RAW_DATA from '@/data/weapons/trees/hbg.json'
import WeaponTreeExplorer from '@/components/trees/WeaponTreeExplorer.vue'
import type {TBowgunData, TWeapon, TWeaponCluster} from '@/interfaces/Weapons'
import WeaponItemBowgun from '@/components/trees/WeaponItemBowgun.vue'
import BowgunFilterPanel, {
	weaponHasAmmoType,
	type TWeaponFilter,
} from '@/components/trees/BowgunFilterPanel.vue'

const items = RAW_DATA as unknown as TWeaponCluster<TBowgunData>[]

// ── Filter state ──────────────────────────────────────────────────────────────
const currentFilter = ref<TWeaponFilter>({
	minAtk: 0,
	minDef: 0,
	minAffinity: -100,
	slots: '0+',
	ammoTypes: [],
})

const isFilterActive = computed(() => {
	const f = currentFilter.value
	return (
		f.minAtk > 0 ||
		f.minDef > 0 ||
		f.minAffinity > -100 ||
		f.slots !== '0+' ||
		f.ammoTypes.length > 0
	)
})

function matchesFilter(
	weapon: TWeapon<TBowgunData>,
	f: TWeaponFilter
): boolean {
	if (weapon.data.attack < f.minAtk) return false
	if (weapon.data.defense < f.minDef) return false
	if (Number(weapon.data.affinity) < f.minAffinity) return false

	if (f.slots === '1+' && weapon.data.slots < 1) return false
	if (f.slots === '2+' && weapon.data.slots < 2) return false
	if (f.slots === '3' && weapon.data.slots !== 3) return false

	for (const key of f.ammoTypes) {
		if (
			!weaponHasAmmoType(
				weapon.data.ammo as Record<string, string | string[]>,
				key
			)
		)
			return false
	}

	return true
}

const matchedIds = computed<Set<number> | null>(() => {
	if (!isFilterActive.value) return null
	const set = new Set<number>()
	for (const cluster of items) {
		for (const weapon of cluster.items) {
			if (matchesFilter(weapon, currentFilter.value)) set.add(weapon.id)
		}
	}
	return set
})

const visibleClusters = computed(() => {
	if (!isFilterActive.value || matchedIds.value === null) return items
	return items.filter((cluster) =>
		cluster.items.some((w) => matchedIds.value!.has(w.id))
	)
})

onMounted(() => {
	const values = findUniqueDevRecandRel()
	console.log('Unique Deviation values:', values[0])
	console.log('Unique Recoil values:', values[1])
	console.log('Unique Reload Speed values:', values[2])
})
// Returns 3 array, one for each: Deviation, Recoil, Reload. Each array contains all unique values for those properties.
function findUniqueDevRecandRel() {
	const dev = new Set<string>()
	const rec = new Set<string>()
	const rel = new Set<string>()

	for (const cluster of items) {
		for (const weapon of cluster.items) {
			dev.add(weapon.data.deviation)
			rec.add(weapon.data.recoil)
			rel.add(weapon.data.reload_speed)
		}
	}
	return [Array.from(dev), Array.from(rec), Array.from(rel)]
}
</script>

<template>
	<WeaponTreeExplorer
		:clusters="visibleClusters"
		weapon-type="heavy-bowgun"
		:eligible-ids="matchedIds"
		:filter-active="isFilterActive"
		:node-height="100"
		cluster-margin-class="mb-80"
	>
		<template #default="{item, isSearchPath, isFocusPath}">
			<!-- prettier-ignore -->
			<WeaponItemBowgun :weapon="(item as unknown as TWeapon<TBowgunData>)" :dimmed="!isFocusPath && isFilterActive && !matchedIds?.has(item.id) && !isSearchPath" />
		</template>
		<template #filter>
			<BowgunFilterPanel @update:filter="currentFilter = $event" />
		</template>
	</WeaponTreeExplorer>
</template>

<style scoped></style>

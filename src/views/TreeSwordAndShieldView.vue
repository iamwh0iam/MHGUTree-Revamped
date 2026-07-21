<script lang="ts" setup>
import {ref, computed} from 'vue'
import RAW_DATA from '@/data/weapons/trees/sns.json'
import WeaponTreeExplorer from '@/components/trees/WeaponTreeExplorer.vue'
import type {TMeleeData, TWeapon, TWeaponCluster} from '@/interfaces/Weapons'
import WeaponItemRegular from '@/components/trees/WeaponItemRegular.vue'
import WeaponFilterPanel from '@/components/trees/WeaponFilterPanel.vue'
import type {TWeaponFilter} from '@/components/trees/WeaponFilterPanel.vue'

const items = RAW_DATA as unknown as TWeaponCluster<TMeleeData>[]

// ── Filter state ──────────────────────────────────────────────────────────────
const currentFilter = ref<TWeaponFilter>({
	minAtk: 0,
	minDef: 0,
	minElemAtk: 0,
	minAffinity: -100,
	element: 'any',
	slots: '0+',
	sharpness: 'any',
	shellingType: 'any',
	phialType: 'any',
	notes: [],
})

const isFilterActive = computed(() => {
	const f = currentFilter.value
	return (
		f.minAtk > 0 ||
		f.minDef > 0 ||
		f.minElemAtk > 0 ||
		f.minAffinity > -100 ||
		f.element !== 'any' ||
		f.slots !== '0+' ||
		f.sharpness !== 'any'
	)
})

function matchesFilter(weapon: TWeapon<TMeleeData>, f: TWeaponFilter): boolean {
	if (weapon.data.attack < f.minAtk) return false
	if (weapon.data.defense < f.minDef) return false
	if (weapon.data.element_attack < f.minElemAtk) return false
	if (Number(weapon.data.affinity) < f.minAffinity) return false

	if (f.element !== 'any') {
		if (f.element === 'none') {
			if (weapon.data.element !== '') return false
		} else {
			if (weapon.data.element.toLowerCase() !== f.element) return false
		}
	}

	if (f.slots === '1+' && weapon.data.slots < 1) return false
	if (f.slots === '2+' && weapon.data.slots < 2) return false
	if (f.slots === '3' && weapon.data.slots !== 3) return false

	if (f.sharpness !== 'any') {
		const sharp = weapon.data.sharpness
		if (f.sharpness === 'green+' && sharp[3] === 0) return false
		if (f.sharpness === 'blue+' && sharp[4] === 0) return false
		if (f.sharpness === 'white+' && sharp[5] === 0) return false
		if (f.sharpness === 'purple' && sharp[6] === 0) return false
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
</script>

<template>
	<WeaponTreeExplorer
		:clusters="visibleClusters"
		weapon-type="sword-and-shield"
		:eligible-ids="matchedIds"
		:filter-active="isFilterActive"
	>
		<template #default="{item, isSearchPath, isFocusPath}">
			<!-- prettier-ignore -->
			<WeaponItemRegular :weapon="(item as unknown as TWeapon<TMeleeData>)" :dimmed="!isFocusPath && isFilterActive && !matchedIds?.has(item.id) && !isSearchPath" />
		</template>
		<template #filter>
			<WeaponFilterPanel @update:filter="currentFilter = $event" />
		</template>
	</WeaponTreeExplorer>
</template>

<style scoped></style>

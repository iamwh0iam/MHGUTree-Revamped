import {computed, ref, toValue, watch, type MaybeRefOrGetter} from 'vue'
import type {
	TWeapon,
	TWeaponCluster,
	TWeaponDataAny,
} from '@/interfaces/Weapons'

export type WeaponSearchResult = {
	clusterIndex: number
	weapon: TWeapon<TWeaponDataAny>
}

export function useWeaponTreeSearch(
	clusters: MaybeRefOrGetter<TWeaponCluster<TWeaponDataAny>[]>,
	eligibleIds: MaybeRefOrGetter<ReadonlySet<number> | null>,
	filterActive: MaybeRefOrGetter<boolean> = false
) {
	const query = ref('')
	const activeIndex = ref(-1)

	const normalizedQuery = computed(() => query.value.trim().toLocaleLowerCase())
	const isSearchActive = computed(() => normalizedQuery.value.length > 0)
	const isFilterNavigationActive = computed(
		() =>
			!isSearchActive.value &&
			toValue(filterActive) &&
			toValue(eligibleIds) !== null
	)
	const results = computed<WeaponSearchResult[]>(() => {
		if (!isSearchActive.value && !isFilterNavigationActive.value) return []
		const allowed = toValue(eligibleIds)
		const needle = normalizedQuery.value
		return toValue(clusters).flatMap((cluster, clusterIndex) =>
			cluster.items
				.filter(
					(weapon) =>
						(allowed === null || allowed.has(weapon.id)) &&
						(!isSearchActive.value ||
							weapon.data.name.toLocaleLowerCase().includes(needle))
				)
				.slice()
				.sort((a, b) => a.vDepth - b.vDepth || a.hDepth - b.hDepth)
				.map((weapon) => ({clusterIndex, weapon}))
		)
	})

	watch(
		[normalizedQuery, () => toValue(eligibleIds), results],
		(
			[nextQuery, nextEligibleIds, nextResults],
			[previousQuery, previousEligibleIds, previousResults]
		) => {
			if (
				nextQuery !== previousQuery ||
				nextEligibleIds !== previousEligibleIds ||
				activeIndex.value < 0
			) {
				activeIndex.value = -1
				return
			}
			const activeId = previousResults?.[activeIndex.value]?.weapon.id
			const preservedIndex = nextResults.findIndex(
				(result) => result.weapon.id === activeId
			)
			activeIndex.value = preservedIndex
		}
	)

	const activeResult = computed(() => results.value[activeIndex.value] ?? null)
	const activeWeaponId = computed(() => activeResult.value?.weapon.id ?? null)
	const activeClusterIndex = computed(
		() => activeResult.value?.clusterIndex ?? null
	)
	const activePathIds = computed<ReadonlySet<number>>(() => {
		const result = activeResult.value
		if (!result) return new Set<number>()
		const cluster = toValue(clusters)[result.clusterIndex]
		if (!cluster) return new Set<number>()

		const byId = new Map(cluster.items.map((weapon) => [weapon.id, weapon]))
		const path = new Set<number>()
		let current: TWeapon<TWeaponDataAny> | undefined = result.weapon
		while (current) {
			path.add(current.id)
			current =
				current.parentId === null ? undefined : byId.get(current.parentId)
		}
		return path
	})

	function next() {
		if (results.value.length === 0) return
		activeIndex.value =
			activeIndex.value < 0 ? 0 : (activeIndex.value + 1) % results.value.length
	}

	function previous() {
		if (results.value.length === 0) return
		activeIndex.value =
			activeIndex.value < 0
				? results.value.length - 1
				: (activeIndex.value - 1 + results.value.length) % results.value.length
	}

	function select(index: number) {
		if (index < 0 || index >= results.value.length) return
		activeIndex.value = index
	}

	function clear() {
		query.value = ''
		activeIndex.value = -1
	}

	return {
		query,
		results,
		activeIndex,
		activeWeaponId,
		activeClusterIndex,
		activePathIds,
		isSearchActive,
		isFilterNavigationActive,
		next,
		previous,
		select,
		clear,
	}
}

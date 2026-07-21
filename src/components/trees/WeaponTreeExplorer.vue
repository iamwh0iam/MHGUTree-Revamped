<script setup lang="ts" generic="T extends TWeaponDataAny">
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	provide,
	ref,
	useId,
	watch,
} from 'vue'
import Icon from '@/components/common/AppIcon.vue'
import type {
	TWeapon,
	TWeaponCluster,
	TWeaponDataAny,
} from '@/interfaces/Weapons'
import type {WeaponTypeKey} from '@/data/weapons/types'
import {useWeaponTreeSearch} from '@/composables/useWeaponTreeSearch'
import LazyRender from '@/components/common/LazyRender.vue'
import LoaderSpinner from '@/components/common/LoaderSpinner.vue'
import CatalogSearchBar from '@/components/common/CatalogSearchBar.vue'
import CatalogResultNavigation from '@/components/common/CatalogResultNavigation.vue'
import CatalogStickyToolbar from '@/components/common/CatalogStickyToolbar.vue'
import ScrollNavigationControls from '@/components/common/ScrollNavigationControls.vue'
import WeaponTree from '@/components/trees/WeaponTree.vue'
import WeaponUpgradePath from '@/components/trees/WeaponUpgradePath.vue'
import {weaponTreeContextKey} from '@/components/trees/weaponTreeContext'

const props = withDefaults(
	defineProps<{
		clusters: TWeaponCluster<T>[]
		weaponType: WeaponTypeKey
		eligibleIds?: ReadonlySet<number> | null
		filterActive?: boolean
		nodeWidth?: number
		nodeHeight?: number
		nodeVPadding?: number
		nodeHPadding?: number
		clusterMarginClass?: string
	}>(),
	{
		eligibleIds: null,
		filterActive: false,
		nodeWidth: 230,
		nodeHeight: 80,
		nodeVPadding: 15,
		nodeHPadding: 15,
		clusterMarginClass: 'mb-8',
	}
)

const anyRevealed = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)
const displayMode = ref<'all' | 'final'>('all')
const selectedPath = ref<TWeapon<TWeaponDataAny>[]>([])
const previousScroll = {left: 0, top: 0}
const upgradeSummaryTargetId = `weapon-upgrade-summary-${useId().replace(/:/g, '')}`

const displayedClusters = computed<TWeaponCluster<T>[]>(() => {
	if (displayMode.value === 'all') return props.clusters
	return props.clusters.flatMap((cluster) => {
		const parentIds = new Set(
			cluster.items.flatMap((weapon) =>
				weapon.parentId === null ? [] : [weapon.parentId]
			)
		)
		const items = cluster.items.filter(
			(weapon) =>
				!parentIds.has(weapon.id) &&
				(props.eligibleIds === null || props.eligibleIds.has(weapon.id))
		)
		return items.length ? [{...cluster, items}] : []
	})
})

const isFocusMode = computed(() => selectedPath.value.length > 0)
const focusedWeapon = computed(
	() => selectedPath.value[selectedPath.value.length - 1] ?? null
)
const search = useWeaponTreeSearch(
	() => displayedClusters.value,
	() => props.eligibleIds,
	() => props.filterActive
)

function treeName(cluster: TWeaponCluster<T>): string {
	const visibleId = cluster.items[0]?.id
	const source = props.clusters.find((candidate) =>
		candidate.items.some((item) => item.id === visibleId)
	)
	const root = source?.items.find((item) => item.parentId === null)
	return `${(root ?? cluster.items[0])?.data.name.split(' ')[0] ?? 'Weapon'} Tree`
}

const searchOptions = computed(() =>
	search.results.value.map((result) => {
		const cluster = displayedClusters.value[result.clusterIndex]
		return {
			id: result.weapon.id,
			label: result.weapon.data.name,
			secondary: `${cluster ? treeName(cluster) : 'Weapon Tree'} · Rarity ${result.weapon.data.rarity}`,
		}
	})
)

function showUpgradePath(weapon: TWeapon<TWeaponDataAny>): void {
	const cluster = props.clusters.find((candidate) =>
		candidate.items.some((item) => item.id === weapon.id)
	)
	if (!cluster) return

	const byId = new Map(cluster.items.map((item) => [item.id, item]))
	const path: TWeapon<TWeaponDataAny>[] = []
	let current = byId.get(weapon.id) as TWeapon<TWeaponDataAny> | undefined
	while (current) {
		path.push(current)
		current =
			current.parentId === null
				? undefined
				: (byId.get(current.parentId) as TWeapon<TWeaponDataAny> | undefined)
	}

	if (!isFocusMode.value) {
		previousScroll.left = scrollContainer.value?.scrollLeft ?? 0
		previousScroll.top = scrollContainer.value?.scrollTop ?? 0
	}
	selectedPath.value = path.reverse()
	void nextTick(() => scrollContainer.value?.scrollTo({left: 0, top: 0}))
}

async function closeUpgradePath(): Promise<void> {
	selectedPath.value = []
	await nextTick()
	scrollContainer.value?.scrollTo(previousScroll)
}

function onWindowKeydown(event: KeyboardEvent): void {
	if (
		event.key !== 'Escape' ||
		!isFocusMode.value ||
		(event.target as HTMLElement | null)?.closest('[role="dialog"]')
	)
		return
	event.preventDefault()
	void closeUpgradePath()
}

provide(weaponTreeContextKey, {showUpgradePath})

onMounted(() => window.addEventListener('keydown', onWindowKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown))

watch(search.activeWeaponId, async (weaponId) => {
	if (weaponId === null) return
	await nextTick()
	await nextTick()
	const container = scrollContainer.value
	const node = container?.querySelector<HTMLElement>(
		`[data-weapon-id="${weaponId}"]`
	)
	if (!container || !node) return
	const reduceMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches
	const containerRect = container.getBoundingClientRect()
	const nodeRect = node.getBoundingClientRect()
	const targetLeft =
		container.scrollLeft +
		nodeRect.left -
		containerRect.left -
		(container.clientWidth - nodeRect.width) / 2
	const targetTop =
		container.scrollTop +
		nodeRect.top -
		containerRect.top -
		(container.clientHeight - nodeRect.height) / 2
	container.scrollTo({
		behavior: reduceMotion ? 'auto' : 'smooth',
		left: Math.min(
			Math.max(0, targetLeft),
			Math.max(0, container.scrollWidth - container.clientWidth)
		),
		top: Math.min(
			Math.max(0, targetTop),
			Math.max(0, container.scrollHeight - container.clientHeight)
		),
	})
})
</script>

<template>
	<div class="relative h-full min-h-0">
		<CatalogStickyToolbar overlay mobile-menu-gutter class="md:left-48">
			<template v-if="isFocusMode">
				<button
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary-700 bg-primary-900/90 text-sm font-semibold text-primary-200 shadow-xl backdrop-blur transition hover:bg-primary-700 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-400 md:h-auto md:w-auto md:gap-2 md:rounded-md md:border-0 md:bg-primary-700 md:px-3 md:py-2 md:shadow-none md:backdrop-blur-none md:hover:bg-primary-600"
					aria-label="Back to weapon tree"
					@click="closeUpgradePath"
				>
					<Icon icon="tabler:arrow-left" class="h-5 w-5" />
					<span class="hidden md:inline">Back</span>
				</button>
				<div
					class="flex h-11 min-w-0 flex-1 flex-col justify-center rounded-full border border-primary-700 bg-primary-900/90 px-4 shadow-xl backdrop-blur md:h-auto md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
				>
					<div class="flex min-w-0 items-center justify-between gap-3 md:block">
						<div class="truncate font-semibold">
							{{ focusedWeapon?.data.name }}
						</div>
						<div
							class="shrink-0 text-xs font-semibold tracking-wider text-primary-400 md:hidden"
						>
							Tree
						</div>
					</div>
					<div
						class="hidden text-xs font-semibold tracking-wider text-primary-400 md:block"
					>
						Tree
					</div>
				</div>
			</template>
			<template v-else>
				<CatalogSearchBar
					v-model="search.query.value"
					placeholder="Search weapon…"
					input-label="Search weapon"
					show-navigation
					:active-index="search.activeIndex.value"
					:result-count="search.results.value.length"
					:options="searchOptions"
					@next="search.next"
					@previous="search.previous"
					@select="search.select"
					@clear="search.clear"
				/>
				<div
					class="ml-auto hidden rounded-md bg-primary-900/70 p-1 md:flex"
					role="group"
					aria-label="Weapon tree view"
				>
					<button
						v-for="mode in ['all', 'final'] as const"
						:key="mode"
						type="button"
						class="rounded-sm px-4 py-1.5 text-sm font-semibold capitalize transition focus-visible:outline-2 focus-visible:outline-secondary-400"
						:class="
							displayMode === mode
								? 'bg-secondary-600 text-white shadow'
								: 'text-primary-300 hover:bg-primary-700 hover:text-white'
						"
						:aria-pressed="displayMode === mode"
						@click="displayMode = mode"
					>
						{{ mode }}
					</button>
				</div>
			</template>
		</CatalogStickyToolbar>

		<div
			v-if="isFocusMode"
			:id="upgradeSummaryTargetId"
			class="pointer-events-none fixed bottom-0 left-0 right-0 z-20 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:bottom-12 md:left-48 md:p-8"
		/>

		<div
			class="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center"
		>
			<LoaderSpinner :visible="!anyRevealed && !isFocusMode" />
		</div>

		<div
			ref="scrollContainer"
			class="scrollable h-full overflow-auto px-8 pt-20 md:pt-24"
			:class="
				isFocusMode
					? 'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-[48vh]'
					: 'pb-4'
			"
		>
			<div
				v-if="!isFocusMode && displayedClusters.length === 0"
				class="flex h-48 flex-col items-center justify-center gap-3 text-gray-400"
			>
				<Icon icon="material-symbols:search-rounded" class="text-4xl" />
				<span class="text-base font-medium"
					>No weapons match the current filters.</span
				>
			</div>

			<WeaponUpgradePath
				v-if="isFocusMode"
				:path="selectedPath"
				:weapon-type="weaponType"
				:node-width="nodeWidth"
				:node-height="nodeHeight"
				:node-h-padding="nodeHPadding"
				:node-v-padding="nodeVPadding"
				:summary-target="`#${upgradeSummaryTargetId}`"
			>
				<template #default="{item}">
					<slot :item="item" :is-search-path="false" :is-focus-path="true" />
				</template>
			</WeaponUpgradePath>

			<div
				v-for="(cluster, idx) in isFocusMode ? [] : displayedClusters"
				:key="cluster.items[0]?.id ?? idx"
				:class="clusterMarginClass"
			>
				<LazyRender
					min-height="200px"
					:force-visible="search.activeClusterIndex.value === idx"
					@revealed="anyRevealed = true"
				>
					<div
						class="flex w-full items-center gap-2 rounded bg-gray-800 px-4 text-left"
					>
						<span class="text-lg font-semibold">{{ treeName(cluster) }}</span>
						<span class="pt-1 text-sm text-gray-400">
							{{ cluster.items.length }} Weapons
						</span>
					</div>

					<WeaponTree
						:cluster="cluster"
						:weapon-type="weaponType"
						:display-mode="displayMode === 'final' ? 'final' : 'tree'"
						:node-width="nodeWidth"
						:node-height="nodeHeight"
						:node-v-padding="nodeVPadding"
						:node-h-padding="nodeHPadding"
						:search-active="search.isSearchActive.value"
						:active-result-id="search.activeWeaponId.value"
						:active-path-ids="search.activePathIds.value"
					>
						<template #default="{item}">
							<slot
								:item="item"
								:is-search-path="
									search.isSearchActive.value &&
									search.activePathIds.value.has(item.id)
								"
								:is-focus-path="false"
							/>
						</template>
					</WeaponTree>
				</LazyRender>
			</div>
		</div>

		<div
			v-show="!isFocusMode"
			class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 z-30 flex items-end gap-2 md:bottom-6 md:left-[13rem] md:z-20"
		>
			<slot name="filter" />
			<CatalogResultNavigation
				v-if="search.isFilterNavigationActive.value"
				variant="floating"
				result-label="filtered result"
				:active-index="search.activeIndex.value"
				:result-count="search.results.value.length"
				class="absolute bottom-14 left-0 md:static md:left-auto md:self-center"
				@previous="search.previous"
				@next="search.next"
			/>
			<div
				class="flex h-12 items-center rounded-full border border-primary-600 bg-primary-900/95 p-1 shadow-xl backdrop-blur md:hidden"
				role="group"
				aria-label="Weapon tree view"
			>
				<button
					v-for="mode in ['all', 'final'] as const"
					:key="mode"
					type="button"
					class="h-10 rounded-full px-3 text-sm font-semibold capitalize transition focus-visible:outline-2 focus-visible:outline-secondary-400"
					:class="
						displayMode === mode
							? 'bg-secondary-600 text-white shadow'
							: 'text-primary-300 hover:bg-primary-700 hover:text-white'
					"
					:aria-pressed="displayMode === mode"
					@click="displayMode = mode"
				>
					{{ mode }}
				</button>
			</div>
		</div>
		<ScrollNavigationControls
			:target="scrollContainer"
			horizontal
			class="fixed right-4 z-30"
			:class="
				isFocusMode
					? 'bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6'
					: 'bottom-6'
			"
		/>
	</div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref, useTemplateRef, watch} from 'vue'
import Icon from '@/components/common/AppIcon.vue'
import CatalogSearchBar from '@/components/common/CatalogSearchBar.vue'
import CatalogStickyToolbar from '@/components/common/CatalogStickyToolbar.vue'
import ScrollNavigationControls from '@/components/common/ScrollNavigationControls.vue'
import ArmorRaritySection from '@/components/armor/ArmorRaritySection.vue'
import ArmorDetailsPanel from '@/components/armor/ArmorDetailsPanel.vue'
import ArmorFilterPanel from '@/components/armor/ArmorFilterPanel.vue'
import type {
	ArmorFilter,
	ArmorHunterTypeFilter,
} from '@/components/armor/ArmorFilterPanel.vue'
import {armorSets, loadArmorSet} from '@/data/armor/armor'
import {
	loadArmorVisualManifest,
	type ArmorVisualManifest,
} from '@/data/armor/visuals'
import type {
	ArmorGender,
	ArmorHunterType,
	ArmorRank,
	ArmorSet,
	ArmorSetSummary,
	ResistanceType,
} from '@/data/armor/types'
import {resolveActivatedSkill} from '@/data/skills/skills'

type RarityGroup = {rarity: number; sets: ArmorSetSummary[]}

const hunterType = ref<ArmorHunterTypeFilter>('all')
const gender = ref<ArmorGender>('male')
const detailsGender = ref<ArmorGender>('male')
const searchQuery = ref('')
const activeArmorSearchIndex = ref(-1)
const catalogRoot = useTemplateRef<HTMLElement>('catalogRoot')
const currentFilter = ref<ArmorFilter>({
	ranks: [],
	skills: [],
	minBaseDefense: null,
	minMaxDefense: null,
	resistances: {
		fire: null,
		water: null,
		thunder: null,
		ice: null,
		dragon: null,
	},
	minSlots: 0,
})
const selectedSummary = ref<ArmorSetSummary | null>(null)
const selectedArmor = ref<ArmorSet | null>(null)
const detailsLoading = ref(false)
const detailsFailed = ref(false)
const manifest = ref<ArmorVisualManifest | null>(null)
let detailsRequestId = 0

const hunterOrder: Record<ArmorHunterType, number> = {
	blademaster: 0,
	gunner: 1,
	both: 2,
}
const sortedSets = [...armorSets].sort(
	(left, right) =>
		left.name.localeCompare(right.name) ||
		(left.variantLabel ?? '').localeCompare(right.variantLabel ?? '') ||
		hunterOrder[left.hunterType] - hunterOrder[right.hunterType] ||
		left.id - right.id
)
const resistanceTypes: ResistanceType[] = [
	'fire',
	'water',
	'thunder',
	'ice',
	'dragon',
]
const normalizedSearchQuery = computed(() =>
	searchQuery.value.trim().toLocaleLowerCase()
)

function armorDisplayName(armor: ArmorSetSummary): string {
	return [armor.name, armor.variantLabel].filter(Boolean).join(' ')
}

function armorHunterTypeLabel(armor: ArmorSetSummary): string {
	return armor.hunterType === 'blademaster'
		? 'Blademaster'
		: armor.hunterType === 'gunner'
			? 'Gunner'
			: 'Both'
}

function armorRank(rarity: number): ArmorRank {
	if (rarity <= 4) return 'low'
	if (rarity <= 7) return 'high'
	return 'g'
}

function matchesArmorFilter(
	armor: ArmorSetSummary,
	filter: ArmorFilter
): boolean {
	if (filter.ranks.length && !filter.ranks.includes(armorRank(armor.rarity)))
		return false
	if (
		filter.minBaseDefense !== null &&
		armor.summary.defense.base < filter.minBaseDefense
	)
		return false
	if (
		filter.minMaxDefense !== null &&
		armor.summary.defense.max < filter.minMaxDefense
	)
		return false
	if (armor.summary.slots < filter.minSlots) return false
	if (
		resistanceTypes.some((type) => {
			const minimum = filter.resistances[type]
			return minimum !== null && armor.summary.resistances[type] < minimum
		})
	)
		return false
	return filter.skills.every((selected) => {
		const points = armor.skills.find(
			(skill) => skill.treeId === selected.treeId
		)
		if (!points) return false
		if (selected.kind === 'tree') return true
		return (
			resolveActivatedSkill(points.treeId, points.points)?.threshold ===
			selected.threshold
		)
	})
}

const filteredArmorSets = computed(() =>
	sortedSets.filter(
		(armor) =>
			(hunterType.value === 'all' || armor.hunterType === hunterType.value) &&
			matchesArmorFilter(armor, currentFilter.value)
	)
)
const armorSearchResults = computed(() => {
	if (!normalizedSearchQuery.value) return []
	const needle = normalizedSearchQuery.value
	return filteredArmorSets.value.filter((armor) =>
		armorDisplayName(armor).toLocaleLowerCase().includes(needle)
	)
})
const armorSearchOptions = computed(() =>
	armorSearchResults.value.map((armor) => ({
		id: armor.id,
		label: armorDisplayName(armor),
		secondary: `${armorHunterTypeLabel(armor)} · Rarity ${armor.rarity}`,
	}))
)
const activeArmorSearchResult = computed(
	() => armorSearchResults.value[activeArmorSearchIndex.value] ?? null
)
const activeArmorSearchId = computed(
	() => activeArmorSearchResult.value?.id ?? null
)

const rarityGroups = computed<RarityGroup[]>(() => {
	return Array.from({length: 11}, (_, index) => {
		const rarity = index + 1
		return {
			rarity,
			sets: filteredArmorSets.value.filter((armor) => armor.rarity === rarity),
		}
	}).filter((group) => group.sets.length > 0)
})
const typeOptions: {value: ArmorHunterTypeFilter; label: string}[] = [
	{value: 'all', label: 'All'},
	{value: 'blademaster', label: 'Blademaster'},
	{value: 'gunner', label: 'Gunner'},
	{value: 'both', label: 'Both'},
]

async function openArmor(summary: ArmorSetSummary): Promise<void> {
	const requestId = ++detailsRequestId
	detailsGender.value = gender.value
	selectedSummary.value = summary
	selectedArmor.value = null
	detailsFailed.value = false
	detailsLoading.value = true
	try {
		const armor = await loadArmorSet(summary)
		if (requestId === detailsRequestId) selectedArmor.value = armor
	} catch {
		if (requestId === detailsRequestId) detailsFailed.value = true
	} finally {
		if (requestId === detailsRequestId) detailsLoading.value = false
	}
}

function selectArmorSearchOption(index: number): void {
	if (index < 0 || index >= armorSearchResults.value.length) return
	activeArmorSearchIndex.value = index
}

function nextArmorSearchResult(): void {
	if (armorSearchResults.value.length === 0) return
	activeArmorSearchIndex.value =
		activeArmorSearchIndex.value < 0
			? 0
			: (activeArmorSearchIndex.value + 1) % armorSearchResults.value.length
}

function previousArmorSearchResult(): void {
	if (armorSearchResults.value.length === 0) return
	activeArmorSearchIndex.value =
		activeArmorSearchIndex.value < 0
			? armorSearchResults.value.length - 1
			: (activeArmorSearchIndex.value - 1 + armorSearchResults.value.length) %
				armorSearchResults.value.length
}

function clearArmorSearch(): void {
	activeArmorSearchIndex.value = -1
}

function closeDetails(): void {
	detailsRequestId += 1
	selectedSummary.value = null
	selectedArmor.value = null
	detailsLoading.value = false
	detailsFailed.value = false
}

watch(
	[normalizedSearchQuery, armorSearchResults],
	([nextQuery, nextResults], [previousQuery, previousResults]) => {
		if (nextQuery !== previousQuery || activeArmorSearchIndex.value < 0) {
			activeArmorSearchIndex.value = -1
			return
		}
		const activeId = previousResults?.[activeArmorSearchIndex.value]?.id
		activeArmorSearchIndex.value = nextResults.findIndex(
			(armor) => armor.id === activeId
		)
	}
)

watch(activeArmorSearchId, async (armorId) => {
	if (armorId === null) return
	await nextTick()
	await nextTick()
	const container = catalogRoot.value?.parentElement
	const card = catalogRoot.value?.querySelector<HTMLElement>(
		`[data-armor-id="${armorId}"]`
	)
	if (!container || !card) return
	const reduceMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches
	const containerRect = container.getBoundingClientRect()
	const cardRect = card.getBoundingClientRect()
	const targetTop =
		container.scrollTop +
		cardRect.top -
		containerRect.top -
		(container.clientHeight - cardRect.height) / 2
	container.scrollTo({
		behavior: reduceMotion ? 'auto' : 'smooth',
		top: Math.min(
			Math.max(0, targetTop),
			Math.max(0, container.scrollHeight - container.clientHeight)
		),
	})
})

onMounted(async () => {
	manifest.value = await loadArmorVisualManifest()
})
</script>

<template>
	<main ref="catalogRoot" class="relative z-10 min-h-full">
		<CatalogStickyToolbar mobile-menu-gutter>
			<CatalogSearchBar
				v-model="searchQuery"
				placeholder="Search armor…"
				input-label="Search armor"
				show-navigation
				:active-index="activeArmorSearchIndex"
				:result-count="armorSearchResults.length"
				:options="armorSearchOptions"
				@next="nextArmorSearchResult"
				@previous="previousArmorSearchResult"
				@clear="clearArmorSearch"
				@select="selectArmorSearchOption"
			/>
			<div
				class="hidden flex-wrap gap-2 md:flex"
				role="group"
				aria-label="Hunter type filter"
			>
				<button
					v-for="option in typeOptions"
					:key="option.value"
					type="button"
					class="rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-secondary-400"
					:class="
						hunterType === option.value
							? 'bg-accent-600 text-white'
							: 'bg-primary-700 text-primary-300 hover:bg-primary-600 hover:text-white'
					"
					:aria-pressed="hunterType === option.value"
					@click="hunterType = option.value"
				>
					{{ option.label }}
				</button>
			</div>
			<div
				class="ml-auto hidden rounded-md bg-primary-900/70 p-1 md:flex"
				role="group"
				aria-label="Model gender"
			>
				<button
					v-for="option in ['male', 'female'] as ArmorGender[]"
					:key="option"
					type="button"
					class="rounded-sm px-4 py-1.5 text-sm font-semibold capitalize transition focus-visible:outline-2 focus-visible:outline-secondary-400"
					:class="
						gender === option
							? 'bg-secondary-600 text-white shadow'
							: 'text-primary-300 hover:bg-primary-700 hover:text-white'
					"
					:aria-pressed="gender === option"
					@click="gender = option"
				>
					{{ option }}
				</button>
			</div>
		</CatalogStickyToolbar>

		<div class="mx-auto max-w-7xl px-5 pb-5 sm:px-8 lg:px-12">
			<ArmorRaritySection
				v-for="group in rarityGroups"
				:key="group.rarity"
				:rarity="group.rarity"
				:sets="group.sets"
				:gender="gender"
				:manifest="manifest"
				:preserve-type-columns="hunterType === 'all'"
				:active-armor-id="activeArmorSearchId"
				:reveal="activeArmorSearchResult?.rarity === group.rarity"
				@open="openArmor"
			/>
			<div
				v-if="rarityGroups.length === 0"
				class="flex h-48 flex-col items-center justify-center gap-3 text-gray-400"
			>
				<Icon icon="material-symbols:search-rounded" class="text-4xl" />
				<span class="text-base font-medium">No armor sets match</span>
			</div>
		</div>
		<ScrollNavigationControls class="fixed bottom-6 right-6 z-30" />
	</main>

	<div
		class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 z-30 flex items-end gap-2 md:bottom-6 md:left-[13rem]"
	>
		<ArmorFilterPanel
			v-model:hunter-type="hunterType"
			@update:filter="currentFilter = $event"
		/>
		<div
			class="flex h-12 items-center rounded-full border border-primary-600 bg-primary-900/95 p-1 shadow-xl backdrop-blur md:hidden"
			role="group"
			aria-label="Armor model gender"
		>
			<button
				v-for="option in ['male', 'female'] as ArmorGender[]"
				:key="option"
				type="button"
				class="h-10 rounded-full px-3 text-sm font-semibold capitalize transition focus-visible:outline-2 focus-visible:outline-secondary-400"
				:class="
					gender === option
						? 'bg-secondary-600 text-white shadow'
						: 'text-primary-300 hover:bg-primary-700 hover:text-white'
				"
				:aria-pressed="gender === option"
				@click="gender = option"
			>
				{{ option }}
			</button>
		</div>
	</div>

	<ArmorDetailsPanel
		:summary="selectedSummary"
		:armor="selectedArmor"
		:loading="detailsLoading"
		:failed="detailsFailed"
		:gender="detailsGender"
		:manifest="manifest"
		@update:gender="detailsGender = $event"
		@close="closeDetails"
	/>
</template>

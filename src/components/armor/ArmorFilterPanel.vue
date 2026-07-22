<script setup lang="ts">
import {computed, ref} from 'vue'
import Icon from '@/components/common/AppIcon.vue'
import {skillTrees} from '@/data/skills/skills'
import type {
	ArmorHunterType,
	ArmorRank,
	ResistanceType,
} from '@/data/armor/types'
import {resolveAssetUrl} from '@/data/assets'

export type ArmorHunterTypeFilter = 'all' | ArmorHunterType

export type ArmorSkillFilter =
	| {kind: 'tree'; treeId: number}
	| {kind: 'skill'; treeId: number; threshold: number}

export type ArmorFilter = {
	ranks: ArmorRank[]
	skills: ArmorSkillFilter[]
	minBaseDefense: number | null
	minMaxDefense: number | null
	resistances: Record<ResistanceType, number | null>
	minSlots: number
}

const EMPTY_RESISTANCES: Record<ResistanceType, number | null> = {
	fire: null,
	water: null,
	thunder: null,
	ice: null,
	dragon: null,
}

function defaultFilter(): ArmorFilter {
	return {
		ranks: [],
		skills: [],
		minBaseDefense: null,
		minMaxDefense: null,
		resistances: {...EMPTY_RESISTANCES},
		minSlots: 0,
	}
}

function cloneFilter(filter: ArmorFilter): ArmorFilter {
	return {
		...filter,
		ranks: [...filter.ranks],
		skills: filter.skills.map((skill) => ({...skill})),
		resistances: {...filter.resistances},
	}
}

const props = defineProps<{
	hunterType: ArmorHunterTypeFilter
}>()
const emit = defineEmits<{
	'update:filter': [filter: ArmorFilter]
	'update:hunterType': [hunterType: ArmorHunterTypeFilter]
}>()
const isOpen = ref(false)
const draft = ref(defaultFilter())
const applied = ref(defaultFilter())
const skillSearch = ref('')
const skillSearchFocused = ref(false)

const rankOptions: {value: ArmorRank; label: string}[] = [
	{value: 'low', label: 'Low Rank'},
	{value: 'high', label: 'High Rank'},
	{value: 'g', label: 'G Rank'},
]
const hunterTypeOptions: {value: ArmorHunterTypeFilter; label: string}[] = [
	{value: 'all', label: 'All'},
	{value: 'blademaster', label: 'Blademaster'},
	{value: 'gunner', label: 'Gunner'},
	{value: 'both', label: 'Both'},
]
const resistanceOptions: {key: ResistanceType; label: string}[] = [
	{key: 'fire', label: 'Fire'},
	{key: 'water', label: 'Water'},
	{key: 'thunder', label: 'Thunder'},
	{key: 'ice', label: 'Ice'},
	{key: 'dragon', label: 'Dragon'},
]
const slotOptions = [0, 3, 6, 9, 12, 15]

type SearchOption = ArmorSkillFilter & {
	label: string
	treeName: string
	description?: string
}
const skillSearchResults = computed<SearchOption[]>(() => {
	const query = skillSearch.value.trim().toLocaleLowerCase()
	if (!query) return []
	const options: SearchOption[] = []
	for (const tree of skillTrees) {
		const treeMatches = tree.name.toLocaleLowerCase().includes(query)
		const matchingSkills = tree.skills.filter((skill) =>
			skill.name.toLocaleLowerCase().includes(query)
		)
		if (!treeMatches && matchingSkills.length === 0) continue
		options.push({
			kind: 'tree',
			treeId: tree.id,
			label: tree.name,
			treeName: tree.name,
		})
		for (const skill of treeMatches ? tree.skills : matchingSkills) {
			options.push({
				kind: 'skill',
				treeId: tree.id,
				threshold: skill.threshold,
				label: skill.name,
				treeName: tree.name,
				description: skill.description,
			})
		}
		if (options.length >= 60) break
	}
	return options.slice(0, 60)
})

const activeFilterCount = computed(() => {
	const filter = applied.value
	return (
		(props.hunterType !== 'all' ? 1 : 0) +
		(filter.ranks.length > 0 ? 1 : 0) +
		(filter.skills.length > 0 ? 1 : 0) +
		(filter.minBaseDefense !== null ? 1 : 0) +
		(filter.minMaxDefense !== null ? 1 : 0) +
		Object.values(filter.resistances).filter((value) => value !== null).length +
		(filter.minSlots > 0 ? 1 : 0)
	)
})

function toggleRank(rank: ArmorRank): void {
	draft.value.ranks = draft.value.ranks.includes(rank)
		? draft.value.ranks.filter((value) => value !== rank)
		: [...draft.value.ranks, rank]
}

function updateOptionalNumber(
	key: 'minBaseDefense' | 'minMaxDefense',
	event: Event
): void {
	const value = (event.target as HTMLInputElement).value
	draft.value[key] =
		value === '' ? null : Math.max(0, Math.min(999, Number(value)))
}

function updateResistance(key: ResistanceType, event: Event): void {
	const value = (event.target as HTMLInputElement).value
	draft.value.resistances[key] =
		value === '' ? null : Math.max(-30, Math.min(30, Number(value)))
}

function selectSkill(option: SearchOption): void {
	draft.value.skills = [
		...draft.value.skills.filter((skill) => skill.treeId !== option.treeId),
		option.kind === 'tree'
			? {kind: 'tree', treeId: option.treeId}
			: {kind: 'skill', treeId: option.treeId, threshold: option.threshold},
	]
	skillSearch.value = ''
}

function removeSkill(treeId: number): void {
	draft.value.skills = draft.value.skills.filter(
		(skill) => skill.treeId !== treeId
	)
}

function skillLabel(filter: ArmorSkillFilter): string {
	const tree = skillTrees.find((value) => value.id === filter.treeId)
	if (!tree) return `Unknown skill ${filter.treeId}`
	if (filter.kind === 'tree') return tree.name
	return (
		tree.skills.find((skill) => skill.threshold === filter.threshold)?.name ??
		tree.name
	)
}

function applyFilter(): void {
	applied.value = cloneFilter(draft.value)
	emit('update:filter', cloneFilter(applied.value))
}

function resetFilter(): void {
	draft.value = defaultFilter()
	applied.value = defaultFilter()
	skillSearch.value = ''
	emit('update:hunterType', 'all')
	emit('update:filter', defaultFilter())
}
</script>

<template>
	<div class="relative h-12 w-12">
		<Transition name="fab">
			<button
				v-if="!isOpen"
				type="button"
				aria-label="Open armor filters"
				class="absolute bottom-0 left-0 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-accent-600 shadow-xl transition-colors hover:bg-accent-500 active:bg-accent-700"
				@click="isOpen = true"
			>
				<Icon icon="tabler:filter" class="h-6 w-6 text-white" />
				<span
					v-if="activeFilterCount > 0"
					class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-[10px] font-bold text-black"
					>{{ activeFilterCount }}</span
				>
			</button>
		</Transition>

		<button
			v-if="isOpen"
			type="button"
			class="fixed inset-0 z-0 cursor-default bg-transparent md:hidden"
			aria-label="Close armor filters"
			@click="isOpen = false"
		/>

		<Transition name="panel">
			<div
				v-if="isOpen"
				class="filter-panel-scroll scrollable absolute bottom-0 left-0 z-10 flex max-h-[75vh] w-[min(28rem,calc(100vw-2rem))] flex-col gap-3 overflow-x-hidden overflow-y-auto rounded-2xl border border-primary-600 bg-primary-800 p-4 shadow-2xl"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:filter" class="h-5 w-5 text-accent-400" />
						<span class="text-sm font-semibold">Filters</span>
					</div>
					<button
						type="button"
						aria-label="Close armor filters"
						class="cursor-pointer text-gray-400 transition-colors hover:text-white"
						@click="isOpen = false"
					>
						<Icon icon="tabler:x" class="h-5 w-5" />
					</button>
				</div>

				<div class="h-px bg-primary-600" />
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-medium text-gray-400">Hunter type</span>
					<div class="grid grid-cols-2 gap-1">
						<button
							v-for="option in hunterTypeOptions"
							:key="option.value"
							type="button"
							class="cursor-pointer rounded py-1.5 text-xs font-medium transition-colors"
							:class="
								hunterType === option.value
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:bg-primary-700 hover:text-white'
							"
							:aria-pressed="hunterType === option.value"
							@click="emit('update:hunterType', option.value)"
						>
							{{ option.label }}
						</button>
					</div>
				</div>

				<div class="h-px bg-primary-600" />
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-medium text-gray-400">Rank</span>
					<div class="grid grid-cols-3 gap-1">
						<button
							v-for="option in rankOptions"
							:key="option.value"
							type="button"
							class="cursor-pointer rounded py-1.5 text-xs font-medium transition-colors"
							:class="
								draft.ranks.includes(option.value)
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:bg-primary-700 hover:text-white'
							"
							@click="toggleRank(option.value)"
						>
							{{ option.label }}
						</button>
					</div>
				</div>

				<div class="h-px bg-primary-600" />
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-medium text-gray-400"
						>Activated Skills</span
					>
					<div class="relative">
						<Icon
							icon="material-symbols:search-rounded"
							class="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400"
						/>
						<input
							v-model="skillSearch"
							type="text"
							role="searchbox"
							placeholder="Search skill..."
							class="w-full rounded border border-primary-600 bg-primary-900 py-1.5 pl-8 pr-9 text-sm outline-none focus:border-accent-500"
							@focus="skillSearchFocused = true"
							@blur="skillSearchFocused = false"
						/>
						<button
							v-if="skillSearch"
							type="button"
							aria-label="Clear skill search"
							class="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded text-primary-400 transition hover:bg-primary-700 hover:text-white focus-visible:outline-2 focus-visible:outline-accent-400"
							@mousedown.prevent="skillSearch = ''"
							@click="skillSearch = ''"
						>
							<Icon icon="tabler:x" class="h-4 w-4" />
						</button>
						<div
							v-if="skillSearchFocused && skillSearch.trim()"
							class="scrollable absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded border border-primary-600 bg-primary-900 shadow-xl"
						>
							<button
								v-for="option in skillSearchResults"
								:key="
									option.kind === 'tree'
										? `tree-${option.treeId}`
										: `skill-${option.treeId}-${option.threshold}`
								"
								type="button"
								class="block w-full cursor-pointer px-3 py-2 text-left text-xs hover:bg-primary-700"
								:title="
									option.kind === 'skill' ? option.description : undefined
								"
								@mousedown.prevent="selectSkill(option)"
							>
								<span
									:class="
										option.kind === 'tree'
											? 'font-semibold text-white'
											: 'pl-3 text-primary-200'
									"
									>{{ option.label }}</span
								>
								<span
									v-if="option.kind === 'skill'"
									class="ml-2 text-primary-500"
									>{{ option.threshold > 0 ? '+' : ''
									}}{{ option.threshold }}</span
								>
							</button>
							<div
								v-if="skillSearchResults.length === 0"
								class="px-3 py-2 text-xs text-primary-400"
							>
								No skills found.
							</div>
						</div>
					</div>
					<div v-if="draft.skills.length" class="flex flex-wrap gap-1.5">
						<button
							v-for="skill in draft.skills"
							:key="skill.treeId"
							type="button"
							class="flex cursor-pointer items-center gap-1 rounded bg-primary-600 px-2 py-1 text-xs text-white hover:bg-primary-500"
							@click="removeSkill(skill.treeId)"
						>
							{{ skillLabel(skill) }}
							<Icon icon="tabler:x" class="h-3.5 w-3.5" />
						</button>
					</div>
				</div>

				<div class="h-px bg-primary-600" />
				<div class="flex flex-col gap-1.5">
					<div class="flex items-center gap-2">
						<img
							:src="resolveAssetUrl('icons/def.png')"
							alt=""
							class="h-4 w-4 shrink-0"
						/>
						<span class="text-xs font-medium text-gray-400">Defense</span>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<label class="flex items-center gap-2 text-xs text-gray-400"
							>Base
							<input
								type="number"
								:value="draft.minBaseDefense ?? ''"
								min="0"
								max="999"
								placeholder="≥ 0"
								class="no-spinner min-w-0 flex-1 rounded border border-primary-600 bg-primary-900 px-2 py-1 text-right text-sm text-white outline-none focus:border-accent-500"
								@input="updateOptionalNumber('minBaseDefense', $event)"
							/>
						</label>
						<label class="flex items-center gap-2 text-xs text-gray-400"
							>Max
							<input
								type="number"
								:value="draft.minMaxDefense ?? ''"
								min="0"
								max="999"
								placeholder="≥ 0"
								class="no-spinner min-w-0 flex-1 rounded border border-primary-600 bg-primary-900 px-2 py-1 text-right text-sm text-white outline-none focus:border-accent-500"
								@input="updateOptionalNumber('minMaxDefense', $event)"
							/>
						</label>
					</div>
				</div>

				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-medium text-gray-400"
						>Elemental Resistance</span
					>
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
						<label
							v-for="resistance in resistanceOptions"
							:key="resistance.key"
							class="flex items-center gap-1.5 text-xs text-primary-300"
						>
							<img
								:src="resolveAssetUrl(`icons/status/${resistance.key}.png`)"
								alt=""
								class="h-4 w-4"
							/>
							<span class="min-w-12">{{ resistance.label }}</span>
							<input
								type="number"
								:value="draft.resistances[resistance.key] ?? ''"
								min="-30"
								max="30"
								placeholder="≥ 0"
								class="no-spinner min-w-0 flex-1 rounded border border-primary-600 bg-primary-900 px-2 py-1 text-right text-sm text-white outline-none focus:border-accent-500"
								@input="updateResistance(resistance.key, $event)"
							/>
						</label>
					</div>
				</div>

				<div class="h-px bg-primary-600" />
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-medium text-gray-400">Slots</span>
					<div class="grid grid-cols-6 gap-1">
						<button
							v-for="slots in slotOptions"
							:key="slots"
							type="button"
							class="cursor-pointer rounded py-1 text-xs font-medium transition-colors"
							:class="
								draft.minSlots === slots
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:bg-primary-700 hover:text-white'
							"
							@click="draft.minSlots = slots"
						>
							{{ slots === 15 ? '15' : `${slots}+` }}
						</button>
					</div>
				</div>

				<div class="h-px bg-primary-600" />
				<div class="flex gap-2">
					<button
						type="button"
						class="flex-1 cursor-pointer rounded bg-primary-900 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-primary-700 hover:text-white"
						@click="resetFilter"
					>
						Reset
						<span v-if="activeFilterCount > 0" class="opacity-70"
							>({{ activeFilterCount }})</span
						>
					</button>
					<button
						type="button"
						class="flex-2 cursor-pointer rounded bg-accent-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-500"
						@click="applyFilter"
					>
						Apply
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
.no-spinner {
	-moz-appearance: textfield;
	appearance: textfield;
}
.panel-enter-active {
	transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	transform-origin: bottom left;
}
.panel-leave-active {
	transition: all 0.15s ease-in;
	transform-origin: bottom left;
}
.panel-enter-from,
.panel-leave-to {
	opacity: 0;
	transform: scale(0.7);
}
.fab-enter-active,
.fab-leave-active {
	transition: all 0.15s ease;
}
.fab-enter-from,
.fab-leave-to {
	opacity: 0;
	transform: scale(0.5);
}
</style>

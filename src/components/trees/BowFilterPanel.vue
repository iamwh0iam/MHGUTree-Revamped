<script lang="ts">
export type TCoatingIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type TCoatingDef = {
	index: TCoatingIndex
	label: string
	colorClass: string
}

export const COATING_TYPES: TCoatingDef[] = [
	{index: 0, label: 'Power 1', colorClass: 'text-element-none'},
	{index: 1, label: 'Power 2', colorClass: 'text-element-none'},
	{index: 2, label: 'Elem 1', colorClass: 'text-element-fire'},
	{index: 3, label: 'Elem 2', colorClass: 'text-element-fire'},
	{index: 4, label: 'Close', colorClass: 'text-element-none'},
	{index: 5, label: 'Poison', colorClass: 'text-element-poison'},
	{index: 6, label: 'Paralysis', colorClass: 'text-element-paralysis'},
	{index: 7, label: 'Sleep', colorClass: 'text-element-sleep'},
	{index: 8, label: 'Exhaust', colorClass: 'text-element-sleep'},
	{index: 9, label: 'Blast', colorClass: 'text-element-blastblight'},
]

export type TBowChargeType = 'Rapid' | 'Power' | 'Spread' | 'Heavy'

export const CHARGE_TYPES: {value: TBowChargeType; label: string}[] = [
	{value: 'Rapid', label: 'Rapid'},
	{value: 'Power', label: 'Power'},
	{value: 'Spread', label: 'Spread'},
	{value: 'Heavy', label: 'Heavy'},
]

export type TWeaponFilter = {
	minAtk: number
	minDef: number
	minAffinity: number
	minElemAtk: number
	element: string
	slots: string
	arcShot: string
	coatings: TCoatingIndex[]
	chargeStages: (TBowChargeType | 'any')[]
}

export function makeDefaultFilter(): TWeaponFilter {
	return {
		minAtk: 0,
		minDef: 0,
		minElemAtk: 0,
		minAffinity: -100,
		element: 'any',
		slots: '0+',
		arcShot: 'any',
		coatings: [],
		chargeStages: ['any', 'any', 'any', 'any'],
	}
}
</script>

<script lang="ts" setup>
import {ref, computed} from 'vue'
import {Icon} from '@iconify/vue'

const emit = defineEmits<{
	'update:filter': [filter: TWeaponFilter]
}>()

const isOpen = ref(false)
// draft: what the user is editing inside the panel
const draft = ref<TWeaponFilter>(makeDefaultFilter())
// applied: what's actually driving the filter outside
const applied = ref<TWeaponFilter>(makeDefaultFilter())

function clamp(val: number, min: number, max: number): number {
	if (Number.isNaN(val)) return min
	return Math.max(min, Math.min(max, val))
}

function updateStat(key: 'minAtk' | 'minDef' | 'minElemAtk', event: Event) {
	draft.value[key] = clamp(
		Number((event.target as HTMLInputElement).value),
		0,
		999
	)
}

function updateAffinity(event: Event) {
	draft.value.minAffinity = clamp(
		Number((event.target as HTMLInputElement).value),
		-100,
		100
	)
}

function toggleCoating(index: TCoatingIndex) {
	const idx = draft.value.coatings.indexOf(index)
	if (idx === -1) {
		draft.value.coatings = [...draft.value.coatings, index]
	} else {
		draft.value.coatings = draft.value.coatings.filter((i) => i !== index)
	}
}

function setChargeStage(index: number, value: TBowChargeType | 'any') {
	const stages = [...draft.value.chargeStages]
	stages[index] = value
	draft.value.chargeStages = stages
}

function applyFilter() {
	applied.value = {
		...draft.value,
		coatings: [...draft.value.coatings],
		chargeStages: [...draft.value.chargeStages],
	}
	emit('update:filter', {
		...applied.value,
		coatings: [...applied.value.coatings],
		chargeStages: [...applied.value.chargeStages],
	})
}

function resetFilter() {
	draft.value = makeDefaultFilter()
	applied.value = makeDefaultFilter()
	emit('update:filter', makeDefaultFilter())
}

const activeFilterCount = computed(() => {
	const f = applied.value
	let count = 0
	if (f.minAtk > 0) count++
	if (f.minDef > 0) count++
	if (f.minAffinity > -100) count++
	if (f.minElemAtk > 0) count++
	if (f.slots !== '0+') count++
	if (f.element !== 'any') count++
	if (f.arcShot !== 'any') count++
	if (f.coatings.length > 0) count++
	if (f.chargeStages.some((s) => s !== 'any')) count++
	return count
})

const ALL_ELEMENTS = [
	{value: 'fire', label: 'Fire'},
	{value: 'water', label: 'Water'},
	{value: 'thunder', label: 'Thunder'},
	{value: 'ice', label: 'Ice'},
	{value: 'dragon', label: 'Dragon'},
	{value: 'poison', label: 'Poison'},
	{value: 'sleep', label: 'Sleep'},
	{value: 'paralysis', label: 'Para'},
	{value: 'blastblight', label: 'Blast'},
]

const ARC_SHOT_OPTIONS = ['Focus', 'Blast', 'Wide']
const SLOTS_OPTIONS = ['0+', '1+', '2+', '3']
</script>

<template>
	<div class="relative w-12 h-12">
		<!-- FAB (closed state) -->
		<Transition name="fab">
			<button
				v-if="!isOpen"
				class="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-accent-600 hover:bg-accent-500 active:bg-accent-700 flex items-center justify-center shadow-xl transition-colors cursor-pointer"
				@click="isOpen = true"
			>
				<Icon icon="tabler:filter" class="text-white w-6 h-6" />
				<span
					v-if="activeFilterCount > 0"
					class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-400 text-black text-[10px] font-bold flex items-center justify-center"
				>
					{{ activeFilterCount }}
				</span>
			</button>
		</Transition>

		<!-- Panel (open state) -->
		<Transition name="panel">
			<div
				v-if="isOpen"
				class="absolute bottom-0 left-0 bg-primary-800 border border-primary-600 rounded-2xl shadow-2xl w-96 max-h-[80vh] overflow-y-auto flex flex-col gap-3 p-4"
			>
				<!-- Header -->
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:filter" class="text-accent-400 w-5 h-5" />
						<span class="font-semibold text-sm">Filters</span>
					</div>
					<button
						class="text-gray-400 hover:text-white transition-colors cursor-pointer"
						@click="isOpen = false"
					>
						<Icon icon="tabler:x" class="w-5 h-5" />
					</button>
				</div>

				<div class="h-px bg-primary-600" />

				<!-- Stat filters -->
				<div class="flex flex-col gap-2">
					<!-- ATK -->
					<div class="flex items-center gap-2">
						<img src="/icons/atk.png" alt="Attack" class="w-4 h-4 shrink-0" />
						<span class="text-xs text-gray-400 w-12 shrink-0">Attack</span>
						<div
							class="flex flex-1 min-w-0 bg-primary-900 border border-primary-600 focus-within:border-accent-500 rounded overflow-hidden"
						>
							<span
								class="px-2 py-1 text-sm text-gray-500 border-r border-primary-600 select-none"
								>≥</span
							>
							<input
								type="number"
								:value="draft.minAtk"
								min="0"
								max="999"
								class="no-spinner flex-1 min-w-0 bg-transparent outline-none px-2 py-1 text-sm text-right"
								@input="updateStat('minAtk', $event)"
							/>
						</div>
					</div>
					<!-- DEF -->
					<div class="flex items-center gap-2">
						<img src="/icons/def.png" alt="Defense" class="w-4 h-4 shrink-0" />
						<span class="text-xs text-gray-400 w-12 shrink-0">Defense</span>
						<div
							class="flex flex-1 min-w-0 bg-primary-900 border border-primary-600 focus-within:border-accent-500 rounded overflow-hidden"
						>
							<span
								class="px-2 py-1 text-sm text-gray-500 border-r border-primary-600 select-none"
								>≥</span
							>
							<input
								type="number"
								:value="draft.minDef"
								min="0"
								max="999"
								class="no-spinner flex-1 min-w-0 bg-transparent outline-none px-2 py-1 text-sm text-right"
								@input="updateStat('minDef', $event)"
							/>
						</div>
					</div>
					<!-- ELEM -->
					<div class="flex items-center gap-2">
						<img
							src="/icons/status/paralysis.png"
							alt="Element"
							class="w-4 h-4 shrink-0"
						/>
						<span class="text-xs text-gray-400 w-12 shrink-0">Element</span>
						<div
							class="flex flex-1 min-w-0 bg-primary-900 border border-primary-600 focus-within:border-accent-500 rounded overflow-hidden"
						>
							<span
								class="px-2 py-1 text-sm text-gray-500 border-r border-primary-600 select-none"
								>≥</span
							>
							<input
								type="number"
								:value="draft.minElemAtk"
								min="0"
								max="999"
								class="no-spinner flex-1 min-w-0 bg-transparent outline-none px-2 py-1 text-sm text-right"
								@input="updateStat('minElemAtk', $event)"
							/>
						</div>
					</div>
					<!-- AFF -->
					<div class="flex items-center gap-2">
						<img src="/icons/aff.png" alt="Affinity" class="w-4 h-4 shrink-0" />
						<span class="text-xs text-gray-400 w-12 shrink-0">Affinity</span>
						<div
							class="flex flex-1 min-w-0 bg-primary-900 border border-primary-600 focus-within:border-accent-500 rounded overflow-hidden"
						>
							<span
								class="px-2 py-1 text-sm text-gray-500 border-r border-primary-600 select-none"
								>≥</span
							>
							<input
								type="number"
								:value="draft.minAffinity"
								min="-100"
								max="100"
								class="no-spinner flex-1 min-w-0 bg-transparent outline-none px-2 py-1 text-sm text-right"
								@input="updateAffinity($event)"
							/>
						</div>
					</div>
				</div>

				<div class="h-px bg-primary-600" />

				<!-- Element filter -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs text-gray-400 font-medium">Element</span>
					<div class="flex flex-wrap gap-y-1 gap-x-2">
						<button
							class="px-1 py-1 rounded text-xs transition-colors cursor-pointer"
							:class="
								draft.element === 'any'
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700'
							"
							@click="draft.element = 'any'"
						>
							Any
						</button>
						<button
							class="px-1 py-1 rounded text-xs transition-colors cursor-pointer"
							:class="
								draft.element === 'none'
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700'
							"
							@click="draft.element = 'none'"
						>
							None
						</button>
						<button
							v-for="elem in ALL_ELEMENTS"
							:key="elem.value"
							class="flex items-center gap-1 px-1 py-1 rounded text-xs transition-colors cursor-pointer"
							:class="
								draft.element === elem.value
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700'
							"
							@click="draft.element = elem.value"
						>
							<img
								:src="`/icons/status/${elem.value}.png`"
								:alt="elem.label"
								class="w-3.5 h-3.5"
							/>
							{{ elem.label }}
						</button>
					</div>
				</div>

				<div class="h-px bg-primary-600" />

				<!-- Slots filter -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs text-gray-400 font-medium">Slots</span>
					<div class="flex gap-1">
						<button
							v-for="slot in SLOTS_OPTIONS"
							:key="slot"
							class="flex-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
							:class="
								draft.slots === slot
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700'
							"
							@click="draft.slots = slot"
						>
							{{ slot }}
						</button>
					</div>
				</div>

				<div class="h-px bg-primary-600" />

				<!-- Arc shot filter -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs text-gray-400 font-medium">Arc Shot</span>
					<div class="flex gap-1">
						<button
							class="flex-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
							:class="
								draft.arcShot === 'any'
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700'
							"
							@click="draft.arcShot = 'any'"
						>
							Any
						</button>
						<button
							v-for="shot in ARC_SHOT_OPTIONS"
							:key="shot"
							class="flex-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
							:class="
								draft.arcShot === shot
									? 'bg-accent-600 text-white'
									: 'bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700'
							"
							@click="draft.arcShot = shot"
						>
							{{ shot }}
						</button>
					</div>
				</div>

				<div class="h-px bg-primary-600" />

				<!-- Charge Stages filter -->
				<div class="flex flex-col gap-1.5">
					<div class="flex gap-2">
						<span class="text-xs text-gray-400 font-medium">Charge Stages</span>
						<div
							class="text-xs font-bold text-gray-600 bg-primary-900 py-0 px-1 rounded-full"
						>
							PER STAGE
						</div>
					</div>
					<div class="flex flex-col gap-1">
						<div
							v-for="(stage, i) in draft.chargeStages"
							:key="i"
							class="flex items-center gap-1"
						>
							<span class="text-[10px] text-gray-500 w-12 shrink-0 select-none"
								>Stage {{ i + 1 }}</span
							>
							<div class="flex flex-1 gap-0.5">
								<button
									class="flex-1 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer"
									:class="
										stage === 'any'
											? 'bg-accent-600 text-white'
											: 'bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700'
									"
									@click="setChargeStage(i, 'any')"
								>
									Any
								</button>
								<button
									v-for="ct in CHARGE_TYPES"
									:key="ct.value"
									class="flex-1 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer"
									:class="
										stage === ct.value
											? 'bg-accent-600 text-white'
											: 'bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700'
									"
									@click="setChargeStage(i, ct.value)"
								>
									{{ ct.label }}
								</button>
							</div>
						</div>
					</div>
				</div>

				<div class="h-px bg-primary-600" />

				<!-- Coatings filter -->
				<div class="flex flex-col gap-1.5">
					<div class="flex gap-2">
						<span class="text-xs text-gray-400 font-medium">Coatings</span>
						<div
							class="text-xs font-bold text-gray-600 bg-primary-900 py-0 px-1 rounded-full"
						>
							AND
						</div>
					</div>
					<div class="grid grid-cols-5 gap-1">
						<button
							v-for="coating in COATING_TYPES"
							:key="coating.index"
							class="flex items-center justify-center gap-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
							:class="[
								draft.coatings.includes(coating.index)
									? 'bg-primary-600 ring-1 ring-accent-500'
									: 'bg-primary-900 hover:bg-primary-700',
								coating.colorClass,
							]"
							@click="toggleCoating(coating.index)"
						>
							{{ coating.label }}
						</button>
					</div>
				</div>

				<div class="h-px bg-primary-600" />

				<!-- Footer actions -->
				<div class="flex gap-2">
					<button
						class="flex-1 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-700"
						@click="resetFilter"
					>
						Reset
						<span v-if="activeFilterCount > 0" class="opacity-70"
							>({{ activeFilterCount }})</span
						>
					</button>
					<button
						class="flex-2 py-1.5 px-4 rounded text-xs font-semibold transition-colors cursor-pointer bg-accent-600 hover:bg-accent-500 text-white"
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
/* Hide native number input spinners */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
.no-spinner {
	-moz-appearance: textfield;
	appearance: textfield;
}

/* Panel: expand from bottom-left corner */
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

/* FAB: simple fade + scale */
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

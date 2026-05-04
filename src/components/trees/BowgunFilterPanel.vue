<script lang="ts">
export type TAmmoKey =
	| 'nrm'
	| 'prc'
	| 'pel'
	| 'crg'
	| 'cls'
	| 'rcv'
	| 'psn'
	| 'par'
	| 'sle'
	| 'exh'
	| 'fir'
	| 'wat'
	| 'thn'
	| 'ice'
	| 'dra'

export type TAmmoTypeDef = {
	key: TAmmoKey
	label: string
	colorClass?: string
}

export const AMMO_TYPES: TAmmoTypeDef[] = [
	{key: 'nrm', label: 'Normal', colorClass: 'text-element-none'},
	{key: 'prc', label: 'Pierce', colorClass: 'text-element-none'},
	{key: 'pel', label: 'Pellet', colorClass: 'text-element-none'},
	{key: 'crg', label: 'Crag', colorClass: 'text-element-none'},
	{key: 'cls', label: 'Cluster', colorClass: 'text-element-none'},
	{key: 'rcv', label: 'Recover', colorClass: 'text-green-500'},
	{key: 'psn', label: 'Poison', colorClass: 'text-element-poison'},
	{key: 'par', label: 'Para', colorClass: 'text-element-paralysis'},
	{key: 'sle', label: 'Sleep', colorClass: 'text-element-sleep'},
	{key: 'exh', label: 'Exhaust', colorClass: 'text-element-sleep'},
	{key: 'fir', label: 'Fire', colorClass: 'text-element-fire'},
	{key: 'wat', label: 'Water', colorClass: 'text-element-water'},
	{key: 'thn', label: 'Thunder', colorClass: 'text-element-thunder'},
	{key: 'ice', label: 'Ice', colorClass: 'text-element-ice'},
	{key: 'dra', label: 'Dragon', colorClass: 'text-element-dragon'},
]

export function weaponHasAmmoType(
	ammo: Record<string, string | string[]>,
	key: TAmmoKey
): boolean {
	const val = ammo[key]
	if (val === undefined) return false
	if (Array.isArray(val)) return val.some((v) => v !== '0')
	return val !== '0'
}

export type TWeaponFilter = {
	minAtk: number
	minDef: number
	minAffinity: number
	slots: string
	ammoTypes: TAmmoKey[]
}

export function makeDefaultFilter(): TWeaponFilter {
	return {
		minAtk: 0,
		minDef: 0,
		minAffinity: -100,
		slots: '0+',
		ammoTypes: [],
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

function updateStat(key: 'minAtk' | 'minDef', event: Event) {
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

function toggleAmmoType(key: TAmmoKey) {
	const idx = draft.value.ammoTypes.indexOf(key)
	if (idx === -1) {
		draft.value.ammoTypes = [...draft.value.ammoTypes, key]
	} else {
		draft.value.ammoTypes = draft.value.ammoTypes.filter((k) => k !== key)
	}
}

function applyFilter() {
	applied.value = {...draft.value, ammoTypes: [...draft.value.ammoTypes]}
	emit('update:filter', {
		...applied.value,
		ammoTypes: [...applied.value.ammoTypes],
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
	if (f.slots !== '0+') count++
	if (f.ammoTypes.length > 0) count++
	return count
})

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

				<!-- Ammo type filter -->
				<div class="flex flex-col gap-1.5">
					<div class="flex gap-2">
						<span class="text-xs text-gray-400 font-medium">Ammo Types</span>
						<div
							class="text-xs font-bold text-gray-600 bg-primary-900 py-0 px-1 rounded-full"
						>
							AND
						</div>
					</div>
					<div class="grid grid-cols-5 gap-1">
						<button
							v-for="ammoType in AMMO_TYPES"
							:key="ammoType.key"
							class="flex items-center justify-center gap-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
							:class="[
								draft.ammoTypes.includes(ammoType.key)
									? 'bg-primary-600 ring-1 ring-accent-500'
									: 'bg-primary-900 hover:bg-primary-700',
								ammoType.colorClass,
							]"
							@click="toggleAmmoType(ammoType.key)"
						>
							{{ ammoType.label }}
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

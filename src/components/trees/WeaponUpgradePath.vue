<script setup lang="ts">
import {computed, inject, onMounted, ref, watch} from 'vue'
import type {TWeapon, TWeaponDataAny} from '@/interfaces/Weapons'
import type {WeaponTypeKey} from '@/data/weapons/types'
import {
	getWeaponVisual,
	loadWeaponVisualManifest,
	type WeaponVisual,
	type WeaponVisualManifest,
} from '@/data/weapons/visuals'
import {loadWeaponCrafting, type CraftingRecipe} from '@/data/weapons/crafting'
import type {ResolvedCraftingMaterial} from '@/data/crafting/types'
import CraftingRecipeCard from '@/components/crafting/CraftingRecipeCard.vue'
import Icon from '@/components/common/AppIcon.vue'
import MobileBottomSheet from '@/components/common/MobileBottomSheet.vue'
import WeaponThumbnail from '@/components/weapon-details/WeaponThumbnail.vue'
import WeaponDetailsPanel from '@/components/weapon-details/WeaponDetailsPanel.vue'
import {weaponTreeContextKey} from './weaponTreeContext'

type PathWeapon = TWeapon<TWeaponDataAny>
type PathStep = {
	weapon: PathWeapon
	method: 'create' | 'upgrade'
	recipe?: CraftingRecipe
	failed: boolean
}

const props = withDefaults(
	defineProps<{
		path: PathWeapon[]
		weaponType: WeaponTypeKey
		summaryTarget: string
		nodeWidth?: number
		nodeHeight?: number
		nodeHPadding?: number
		nodeVPadding?: number
	}>(),
	{nodeWidth: 230, nodeHeight: 80, nodeHPadding: 15, nodeVPadding: 15}
)

const manifest = ref<WeaponVisualManifest | null>(null)
const steps = ref<PathStep[]>([])
const loading = ref(false)
const selectedWeapon = ref<PathWeapon | null>(null)
const summaryOpen = ref(false)
const desktopSummaryOpen = ref(true)
const treeContext = inject(weaponTreeContextKey, null)
let requestId = 0

const selectedVisual = computed(() =>
	selectedWeapon.value
		? visualForFamily(selectedWeapon.value.data.family)
		: null
)

const summary = computed(() => {
	const materials = new Map<string, ResolvedCraftingMaterial>()
	let cost = 0
	let incomplete = false

	for (const step of steps.value) {
		if (!step.recipe) {
			incomplete = true
			continue
		}
		cost += step.recipe.cost
		for (const material of step.recipe.materials) {
			const key =
				material.kind === 'item'
					? `item-${material.itemId}`
					: `group-${material.groupId}`
			const current = materials.get(key)
			if (!current) {
				materials.set(key, {...material})
			} else if (current.kind === 'item' && material.kind === 'item') {
				current.quantity += material.quantity
			} else if (current.kind === 'group' && material.kind === 'group') {
				current.points += material.points
			}
		}
	}

	return {materials: [...materials.values()], cost, incomplete}
})

function visualForFamily(family: number): WeaponVisual | undefined {
	return getWeaponVisual(manifest.value, family)
}

function openDetails(weapon: PathWeapon): void {
	if (!visualForFamily(weapon.data.family)) return
	selectedWeapon.value = weapon
}

function onCardKeydown(event: KeyboardEvent, weapon: PathWeapon): void {
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	openDetails(weapon)
}

function focusSelectedPath(): void {
	if (!selectedWeapon.value || !treeContext) return
	const weapon = selectedWeapon.value
	selectedWeapon.value = null
	treeContext.showUpgradePath(weapon)
}

watch(
	[() => props.path, () => props.weaponType],
	async ([path]) => {
		summaryOpen.value = false
		const currentRequest = ++requestId
		loading.value = true
		steps.value = path.map((weapon, index) => ({
			weapon,
			method: index === 0 ? 'create' : 'upgrade',
			failed: false,
		}))

		const loaded = await Promise.all(
			steps.value.map(async (step) => {
				try {
					const crafting = await loadWeaponCrafting(
						props.weaponType,
						step.weapon.id
					)
					return {
						...step,
						recipe:
							step.method === 'create' ? crafting?.create : crafting?.upgrade,
					}
				} catch {
					return {...step, failed: true}
				}
			})
		)

		if (currentRequest !== requestId) return
		steps.value = loaded
		loading.value = false
	},
	{immediate: true}
)

onMounted(async () => {
	manifest.value = await loadWeaponVisualManifest(props.weaponType)
})
</script>

<template>
	<div class="flex min-h-full flex-col gap-5">
		<div class="min-w-0 flex-1 overflow-visible">
			<div
				class="flex min-w-max flex-col items-center pb-4 sm:flex-row sm:items-start sm:pr-8"
			>
				<template v-for="(step, index) in steps" :key="step.weapon.id">
					<div
						class="flex shrink-0 flex-col gap-3"
						:style="{width: `${nodeWidth + nodeHeight}px`}"
					>
						<div
							class="relative rounded-md bg-primary-700 transition"
							:class="{
								'cursor-pointer hover:bg-primary-600': visualForFamily(
									step.weapon.data.family
								),
							}"
							:style="{height: `${nodeHeight}px`}"
							:role="
								visualForFamily(step.weapon.data.family) ? 'button' : undefined
							"
							:tabindex="
								visualForFamily(step.weapon.data.family) ? 0 : undefined
							"
							:data-weapon-id="step.weapon.id"
							@click="openDetails(step.weapon)"
							@keydown="onCardKeydown($event, step.weapon)"
						>
							<div
								class="absolute inset-y-0 left-0"
								:style="{width: `${nodeHeight}px`}"
							>
								<WeaponThumbnail
									:visual="visualForFamily(step.weapon.data.family)"
									:weapon-name="step.weapon.data.name"
								/>
							</div>
							<div
								class="absolute inset-y-0 right-0"
								:style="{width: `${nodeWidth}px`}"
							>
								<slot :item="step.weapon" />
							</div>
						</div>

						<div
							v-if="loading"
							class="rounded-lg border border-primary-600 bg-primary-700/45 px-3 py-4 text-center text-xs text-primary-300"
						>
							Loading recipe…
						</div>
						<CraftingRecipeCard
							v-else-if="step.recipe"
							:title="step.method === 'create' ? 'Create' : 'Upgrade'"
							:subtitle="
								step.recipe.fromWeapon
									? `From ${step.recipe.fromWeapon.name}`
									: undefined
							"
							:cost="step.recipe.cost"
							:materials="step.recipe.materials"
						/>
						<div
							v-else
							class="rounded-lg border px-3 py-4 text-center text-xs"
							:class="
								step.failed
									? 'border-red-800/70 bg-red-950/40 text-red-200'
									: 'border-primary-600 bg-primary-700/45 text-primary-300'
							"
						>
							{{
								step.failed
									? 'Crafting data is unavailable.'
									: 'No recipe available.'
							}}
						</div>
					</div>

					<div
						v-if="index < steps.length - 1"
						class="path-connector shrink-0 rounded-full bg-gray-500"
						:style="{
							'--path-connector-top': `${nodeHeight / 2 - 2}px`,
							'--path-connector-width': `${nodeHPadding * 2}px`,
							'--path-connector-height': `${nodeVPadding * 2}px`,
						}"
					/>
				</template>
			</div>
		</div>

		<Teleport :to="summaryTarget">
			<MobileBottomSheet
				v-model="summaryOpen"
				panel-id="mobile-upgrade-summary"
				labelledby="mobile-upgrade-summary-title"
				close-label="Close upgrade total"
			>
				<template #trigger="{open}">
					<button
						type="button"
						class="pointer-events-auto flex h-full w-full items-center gap-3 rounded-xl border border-primary-600 bg-primary-800/95 px-4 text-left shadow-2xl backdrop-blur transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-400"
						aria-controls="mobile-upgrade-summary"
						:aria-expanded="summaryOpen"
						@click="open"
					>
						<div class="min-w-0 flex-1">
							<div class="flex items-baseline gap-2">
								<span class="font-bold">Total</span>
								<span class="truncate text-xs text-primary-300">
									{{
										loading
											? 'Calculating…'
											: `${summary.materials.length} materials`
									}}
								</span>
							</div>
						</div>
						<span v-if="!loading" class="shrink-0 font-bold text-amber-300">
							{{ summary.cost.toLocaleString() }}z
						</span>
						<Icon
							icon="tabler:chevron-up"
							class="h-5 w-5 shrink-0 text-primary-300"
						/>
					</button>
				</template>

				<template #default="{close}">
					<header
						class="flex shrink-0 items-center justify-between gap-3 px-4 py-2"
					>
						<div class="min-w-0">
							<div class="flex min-w-0 items-baseline gap-2">
								<h2
									id="mobile-upgrade-summary-title"
									class="shrink-0 font-bold"
								>
									Total
								</h2>
								<div class="truncate text-xs text-primary-300">
									{{
										loading
											? 'Calculating…'
											: `${summary.materials.length} materials`
									}}
								</div>
							</div>
						</div>
						<div class="ml-auto font-bold text-amber-300">
							{{ summary.cost.toLocaleString() }}z
						</div>
						<button
							type="button"
							data-bottom-sheet-autofocus
							class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-primary-300 transition-colors hover:bg-primary-700 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-400"
							aria-label="Close upgrade total"
							@click="close()"
						>
							<Icon icon="tabler:x" class="h-5 w-5" />
						</button>
					</header>
					<div
						class="path-summary-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
					>
						<CraftingRecipeCard
							class="rounded-none border-0 bg-transparent p-0"
							title="Required materials"
							:materials="summary.materials"
							hide-header
						/>
						<p
							v-if="!loading && summary.incomplete"
							class="px-3 pb-3 pt-2 text-xs font-medium text-amber-300"
						>
							The total is incomplete because one or more recipes are
							unavailable.
						</p>
					</div>
				</template>
			</MobileBottomSheet>

			<aside
				class="pointer-events-auto mx-auto hidden max-h-[32vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-primary-600 bg-primary-800/95 shadow-2xl backdrop-blur md:flex"
			>
				<button
					type="button"
					class="flex shrink-0 items-center gap-3 bg-transparent px-4 py-2.5 text-left transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-400"
					aria-controls="desktop-upgrade-summary-content"
					:aria-expanded="desktopSummaryOpen"
					@click="desktopSummaryOpen = !desktopSummaryOpen"
				>
					<div class="min-w-0 flex-1">
						<div class="flex items-baseline gap-2">
							<span class="font-bold">Total</span>
							<span class="truncate text-xs text-primary-300">
								{{
									loading
										? 'CalculatingвЂ¦'
										: `${summary.materials.length} materials`
								}}
							</span>
						</div>
					</div>
					<span v-if="!loading" class="shrink-0 font-bold text-amber-300">
						{{ summary.cost.toLocaleString() }}z
					</span>
					<Icon
						:icon="
							desktopSummaryOpen ? 'tabler:chevron-down' : 'tabler:chevron-up'
						"
						class="h-5 w-5 shrink-0 text-primary-300"
					/>
				</button>

				<div
					v-if="desktopSummaryOpen"
					id="desktop-upgrade-summary-content"
					class="path-summary-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
				>
					<CraftingRecipeCard
						class="rounded-none border-0 bg-transparent p-3"
						title="Total"
						:cost="summary.cost"
						:materials="summary.materials"
						:material-columns="3"
						hide-header
					/>
					<p
						v-if="!loading && summary.incomplete"
						class="px-3 pb-3 text-xs font-medium text-amber-300"
					>
						The total is incomplete because one or more recipes are unavailable.
					</p>
				</div>
			</aside>
		</Teleport>
	</div>

	<WeaponDetailsPanel
		:visual="selectedVisual ?? null"
		:weapon-id="selectedWeapon?.id ?? null"
		:weapon-name="selectedWeapon?.data.name ?? ''"
		:weapon-rarity="selectedWeapon?.data.rarity ?? null"
		:weapon-type="weaponType"
		@close="selectedWeapon = null"
		@show-path="focusSelectedPath"
	/>
</template>

<style scoped>
.path-connector {
	height: var(--path-connector-height);
	width: 4px;
}

@media (min-width: 640px) {
	.path-connector {
		margin-top: var(--path-connector-top);
		height: 4px;
		width: var(--path-connector-width);
	}
}

.path-summary-scroll {
	scrollbar-width: thin;
	scrollbar-color: var(--color-secondary-500) transparent;
}

.path-summary-scroll::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.path-summary-scroll::-webkit-scrollbar-track {
	background-color: transparent;
	margin: 4px;
}

.path-summary-scroll::-webkit-scrollbar-thumb {
	min-height: 32px;
	border: 2px solid transparent;
	border-radius: 4px;
	background-color: var(--color-secondary-500);
	background-clip: content-box;
}

.path-summary-scroll::-webkit-scrollbar-button {
	display: none;
	width: 0;
	height: 0;
}
</style>

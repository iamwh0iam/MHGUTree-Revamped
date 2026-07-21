<script setup lang="ts">
import {computed, inject, onMounted, ref} from 'vue'
import type {TWeaponCluster, TWeaponDataAny} from '@/interfaces/Weapons'
import type {WeaponTypeKey} from '@/data/weapons/types'
import {
	getWeaponVisual,
	loadWeaponVisualManifest,
	type WeaponVisual,
	type WeaponVisualManifest,
} from '@/data/weapons/visuals'
import WeaponThumbnail from '@/components/weapon-details/WeaponThumbnail.vue'
import WeaponDetailsPanel from '@/components/weapon-details/WeaponDetailsPanel.vue'
import {weaponTreeContextKey} from '@/components/trees/weaponTreeContext'

interface IProps {
	cluster: TWeaponCluster<TWeaponDataAny>
	weaponType: WeaponTypeKey
	nodeWidth?: number
	nodeHeight?: number
	nodeVPadding?: number
	nodeHPadding?: number
	searchActive?: boolean
	activeResultId?: number | null
	activePathIds?: ReadonlySet<number>
	displayMode?: 'tree' | 'final'
}
const props = withDefaults(defineProps<IProps>(), {
	nodeWidth: 230,
	nodeHeight: 80,
	nodeVPadding: 15,
	nodeHPadding: 15,
	searchActive: false,
	activeResultId: null,
	activePathIds: () => new Set<number>(),
	displayMode: 'tree',
})

// ── Grid constants ────────────────────────────────────────────────────────────

const CONTENT_W = props.nodeWidth
const NODE_H = props.nodeHeight
const NODE_W = CONTENT_W + NODE_H
const H_PAD = props.nodeHPadding
const V_PAD = props.nodeVPadding
const CELL_W = 2 * H_PAD + NODE_W // px per grid column
const CELL_H = 2 * V_PAD + NODE_H // px per grid row

const manifest = ref<WeaponVisualManifest | null>(null)
const selectedVisual = ref<WeaponVisual | null>(null)
const selectedWeaponId = ref<number | null>(null)
const selectedWeaponName = ref('')
const selectedWeaponRarity = ref<number | null>(null)
const selectedItem = ref<
	TWeaponCluster<TWeaponDataAny>['items'][number] | null
>(null)
const treeContext = inject(weaponTreeContextKey, null)

function visualForFamily(family: number): WeaponVisual | undefined {
	return getWeaponVisual(manifest.value, family)
}

function openWeaponDetails(
	item: TWeaponCluster<TWeaponDataAny>['items'][number]
) {
	const visual = visualForFamily(item.data.family)
	if (!visual) return
	selectedVisual.value = visual
	selectedWeaponId.value = item.id
	selectedWeaponName.value = item.data.name
	selectedWeaponRarity.value = item.data.rarity
	selectedItem.value = item
}

function showSelectedPath() {
	if (!selectedItem.value || !treeContext) return
	selectedVisual.value = null
	treeContext.showUpgradePath(selectedItem.value)
}

function onNodeKeydown(
	event: KeyboardEvent,
	item: TWeaponCluster<TWeaponDataAny>['items'][number]
) {
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	openWeaponDetails(item)
}

onMounted(async () => {
	manifest.value = await loadWeaponVisualManifest(props.weaponType)
})

// ── Position helpers (shared by SVG lines and HTML nodes) ─────────────────────
const nodeLeft = (h: number) => h * CELL_W + H_PAD
const nodeRight = (h: number) => h * CELL_W + H_PAD + NODE_W
const nodeTop = (v: number) => v * CELL_H + V_PAD
const nodeMidY = (v: number) => v * CELL_H + CELL_H / 2
const gateX = (h: number) => (h + 1) * CELL_W

// ── Canvas / container size ───────────────────────────────────────────────────
const displayItems = computed(() => props.cluster.items)
const displayPosition = computed(() => {
	const positions = new Map<number, {h: number; v: number}>()
	displayItems.value.forEach((item, index) =>
		positions.set(
			item.id,
			props.displayMode === 'final'
				? {h: 0, v: index}
				: {h: item.hDepth, v: item.vDepth}
		)
	)
	return positions
})
const totalWidth = computed(() => {
	if (!displayItems.value.length) return 0
	const maxH = Math.max(
		...Array.from(displayPosition.value.values(), (position) => position.h)
	)
	return nodeRight(maxH) + H_PAD
})
const totalHeight = computed(() => {
	if (!displayItems.value.length) return 0
	const maxV = Math.max(
		...Array.from(displayPosition.value.values(), (position) => position.v)
	)
	return nodeTop(maxV) + NODE_H + V_PAD
})

// ── Fast position lookup by id ────────────────────────────────────────────────
const posById = computed(() => {
	const m = new Map<number, {h: number; v: number}>()
	for (const item of displayItems.value) {
		m.set(item.id, displayPosition.value.get(item.id)!)
	}
	return m
})

// ── SVG connector paths ───────────────────────────────────────────────────────
const connections = computed(() =>
	props.displayMode === 'final'
		? []
		: props.cluster.items
				.filter((item) => item.parentId !== null)
				.map((item) => {
					const p = posById.value.get(item.parentId!)!
					const c = posById.value.get(item.id)!
					const px = nodeRight(p.h)
					const py = nodeMidY(p.v)
					const cx = nodeLeft(c.h)
					const cy = nodeMidY(c.v)
					const gate = gateX(p.h)
					return {
						childId: item.id,
						parentId: item.parentId!,
						d:
							py === cy
								? `M ${px} ${py} H ${cx}`
								: `M ${px} ${py} H ${gate} V ${cy} H ${cx}`,
					}
				})
)

function connectionIsOnActivePath(connection: {
	childId: number
	parentId: number
}) {
	return (
		props.activePathIds.has(connection.childId) &&
		props.activePathIds.has(connection.parentId)
	)
}
</script>

<template>
	<div
		class="relative"
		:style="{width: `${totalWidth}px`, height: `${totalHeight}px`}"
	>
		<!-- ── SVG connector layer (behind nodes, no pointer events) ──────── -->
		<svg
			class="absolute inset-0 pointer-events-none"
			:width="totalWidth"
			:height="totalHeight"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g fill="none" stroke-width="4" stroke-linecap="round">
				<path
					v-for="connection in connections"
					:key="`conn-${connection.childId}`"
					:d="connection.d"
					class="transition-all duration-200"
					:class="{
						'stroke-blue-400':
							searchActive && connectionIsOnActivePath(connection),
						'stroke-gray-500 opacity-20':
							searchActive && !connectionIsOnActivePath(connection),
						'stroke-gray-500': !searchActive,
					}"
				/>
			</g>
		</svg>

		<!-- ── HTML weapon node cards ─────────────────────────────────────── -->
		<div
			v-for="item in displayItems"
			:key="item.id"
			class="absolute rounded-md bg-primary-700 transition-all duration-200"
			:data-weapon-id="item.id"
			:style="{
				left: `${nodeLeft(displayPosition.get(item.id)!.h)}px`,
				top: `${nodeTop(displayPosition.get(item.id)!.v)}px`,
				width: `${NODE_W}px`,
				height: `${NODE_H}px`,
			}"
			:role="visualForFamily(item.data.family) ? 'button' : undefined"
			:tabindex="visualForFamily(item.data.family) ? 0 : undefined"
			:aria-disabled="visualForFamily(item.data.family) ? undefined : true"
			:aria-label="
				visualForFamily(item.data.family)
					? `Open ${item.data.name} details`
					: undefined
			"
			:class="{
				'cursor-pointer focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-400':
					visualForFamily(item.data.family),
				'opacity-20': searchActive && !activePathIds.has(item.id),
				'ring-1 ring-blue-400/70':
					searchActive &&
					activePathIds.has(item.id) &&
					activeResultId !== item.id,
				'ring-2 ring-green-400 shadow-lg shadow-green-500/30':
					activeResultId === item.id,
			}"
			@click="openWeaponDetails(item)"
			@keydown="onNodeKeydown($event, item)"
		>
			<div class="absolute inset-y-0 left-0" :style="{width: `${NODE_H}px`}">
				<WeaponThumbnail
					:visual="visualForFamily(item.data.family)"
					:weapon-name="item.data.name"
				/>
			</div>
			<div
				class="absolute inset-y-0 right-0"
				:style="{width: `${CONTENT_W}px`}"
			>
				<slot :item="item"> </slot>
			</div>
		</div>
	</div>

	<WeaponDetailsPanel
		:visual="selectedVisual"
		:weapon-id="selectedWeaponId"
		:weapon-name="selectedWeaponName"
		:weapon-rarity="selectedWeaponRarity"
		:weapon-type="weaponType"
		@close="selectedVisual = null"
		@show-path="showSelectedPath"
	/>
</template>

<style scoped></style>

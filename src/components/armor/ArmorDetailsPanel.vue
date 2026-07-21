<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import Icon from '@/components/common/AppIcon.vue'
import DetailsDrawer from '@/components/common/DetailsDrawer.vue'
import SpriteTurntable from '@/components/common/SpriteTurntable.vue'
import SlotPips from '@/components/common/SlotPips.vue'
import CraftingRecipeCard from '@/components/crafting/CraftingRecipeCard.vue'
import ArmorResistanceList from './ArmorResistanceList.vue'
import {resolveArmorPartIconUrl, resolveArmorRecipes} from '@/data/armor/armor'
import {
	getArmorVisual,
	isAvailableArmorVisual,
	resolveArmorVisualUrl,
	type ArmorVisual,
	type ArmorVisualManifest,
} from '@/data/armor/visuals'
import type {
	ArmorGender,
	ArmorPiece,
	ArmorSet,
	ArmorSetSummary,
	ResolvedArmorRecipe,
} from '@/data/armor/types'
import {getSkillTreeName, resolveActivatedSkill} from '@/data/skills/skills'
import {resolveAssetUrl} from '@/data/assets'
import MobileInfoButton from '@/components/common/MobileInfoButton.vue'

const props = defineProps<{
	summary: ArmorSetSummary | null
	armor: ArmorSet | null
	loading: boolean
	failed: boolean
	gender: ArmorGender
	manifest: ArmorVisualManifest | null
}>()
const emit = defineEmits<{close: []; 'update:gender': [gender: ArmorGender]}>()
const selectedPieceIds = ref<Set<number>>(new Set())
const recipe = ref<ResolvedArmorRecipe>()
const recipeLoading = ref(false)
const recipeFailed = ref(false)
let recipeRequestId = 0

const hunterTypeLabel = computed(() =>
	props.summary?.hunterType === 'blademaster'
		? 'Blademaster'
		: props.summary?.hunterType === 'gunner'
			? 'Gunner'
			: 'Both'
)
const displayName = computed(() =>
	[props.summary?.name, props.summary?.variantLabel].filter(Boolean).join(' ')
)
const allPiecesSelected = computed(
	() =>
		(props.armor?.pieces.length ?? 0) > 0 &&
		selectedPieceIds.value.size === props.armor?.pieces.length
)
const recipePieces = computed(() => {
	const pieces = props.armor?.pieces ?? []
	if (selectedPieceIds.value.size === 0 || allPiecesSelected.value)
		return pieces
	return pieces.filter((piece) => selectedPieceIds.value.has(piece.id))
})
const recipeSubtitle = computed(() => {
	if (selectedPieceIds.value.size === 0 || allPiecesSelected.value) return 'All'
	return recipePieces.value.map((piece) => piece.name).join(', ')
})
const visual = computed<ArmorVisual | undefined>(() =>
	props.summary
		? getArmorVisual(props.manifest, props.summary.id, props.gender)
		: undefined
)
const availableVisual = computed(() =>
	isAvailableArmorVisual(visual.value) ? visual.value : undefined
)
const resolvedArmorSkills = computed(() =>
	(props.armor?.skills ?? []).map((skill) => ({
		...skill,
		name: getSkillTreeName(skill.treeId),
		activatedSkill: resolveActivatedSkill(skill.treeId, skill.points),
	}))
)

watch(
	() => props.summary?.id,
	() => {
		selectedPieceIds.value = new Set()
	},
	{immediate: true}
)

watch(
	recipePieces,
	async (pieces) => {
		const requestId = ++recipeRequestId
		recipe.value = undefined
		recipeFailed.value = false
		recipeLoading.value = pieces.length > 0
		if (!pieces.length) return
		try {
			const result = await resolveArmorRecipes(pieces)
			if (requestId === recipeRequestId) recipe.value = result
		} catch {
			if (requestId === recipeRequestId) recipeFailed.value = true
		} finally {
			if (requestId === recipeRequestId) recipeLoading.value = false
		}
	},
	{immediate: true}
)

function signed(value: number): string {
	return value > 0 ? `+${value}` : String(value)
}

function togglePiece(pieceId: number): void {
	const selected = new Set(selectedPieceIds.value)
	if (selected.has(pieceId)) selected.delete(pieceId)
	else selected.add(pieceId)
	selectedPieceIds.value = selected
}

function onDetailsClick(event: MouseEvent): void {
	if (!(event.target instanceof Element)) return
	if (event.target.closest('[data-armor-piece], a')) return
	selectedPieceIds.value = new Set()
}
</script>

<template>
	<DetailsDrawer
		:open="summary !== null"
		:title="displayName"
		title-id="armor-details-title"
		@close="emit('close')"
	>
		<template #title>
			<a
				v-if="visual?.sourcePage"
				:href="visual.sourcePage"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex max-w-full items-center gap-1.5 text-secondary-300 transition hover:text-secondary-200 hover:underline"
				:aria-label="`Open ${displayName} on Kiranico`"
			>
				<span class="truncate">{{ displayName }}</span>
				<Icon icon="tabler:external-link" class="h-4 w-4 shrink-0" />
			</a>
			<template v-else>{{ displayName }}</template>
		</template>
		<template #eyebrow>
			<div
				v-if="summary"
				class="mt-0.5 text-xs font-semibold tracking-wider text-primary-300"
			>
				Rarity {{ summary.rarity }} · {{ hunterTypeLabel }}
			</div>
		</template>

		<div
			v-if="loading"
			class="flex min-h-64 items-center justify-center text-sm text-primary-300"
		>
			Loading armor details…
		</div>
		<div
			v-else-if="failed"
			class="rounded-lg border border-red-800 bg-red-950/40 px-4 py-5 text-center text-sm text-red-200"
		>
			Armor details are unavailable.
		</div>
		<div
			v-else-if="armor"
			class="flex min-h-full flex-col gap-5"
			@click="onDetailsClick"
		>
			<div
				class="flex justify-center rounded-lg bg-primary-900/55 p-1"
				role="group"
				aria-label="Armor model gender"
			>
				<button
					v-for="option in ['male', 'female'] as ArmorGender[]"
					:key="option"
					type="button"
					class="flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize transition focus-visible:outline-2 focus-visible:outline-secondary-400"
					:class="
						gender === option
							? 'bg-secondary-600 text-white shadow'
							: 'text-primary-300 hover:bg-primary-700 hover:text-white'
					"
					:aria-pressed="gender === option"
					@click="emit('update:gender', option)"
				>
					{{ option }}
				</button>
			</div>

			<SpriteTurntable
				v-if="availableVisual"
				:turntable-url="resolveArmorVisualUrl(availableVisual.turntable)"
				:thumbnail-url="resolveArmorVisualUrl(availableVisual.thumbnail)"
				:name="`${displayName} ${hunterTypeLabel} ${gender}`"
			/>
			<div
				v-else
				class="mx-auto flex h-[270px] w-[270px] flex-col items-center justify-center gap-2 rounded-lg bg-primary-900 text-primary-500"
			>
				<Icon icon="tabler:photo-off" class="h-7 w-7" />
				<span class="text-xs">{{ gender }} model unavailable</span>
			</div>

			<section>
				<h3
					class="mb-2 text-sm font-bold uppercase tracking-wider text-primary-300"
				>
					Skills
				</h3>
				<div class="grid gap-2 sm:grid-cols-3">
					<div
						v-for="(skill, skillIndex) in resolvedArmorSkills"
						:key="skill.treeId"
						class="group relative min-h-16 rounded-lg border px-3 py-2 hover:z-10 md:min-h-0"
						:class="
							skill.activatedSkill
								? skill.points < 0
									? 'border-red-600 bg-secondary-950/35'
									: 'border-secondary-600 bg-secondary-950/35'
								: 'border-primary-600 bg-primary-700/35'
						"
					>
						<div class="flex items-center justify-between gap-2 text-sm">
							<span class="truncate font-semibold">{{ skill.name }}</span>
							<b
								:class="skill.points > 0 ? 'text-emerald-300' : 'text-red-300'"
								>{{ signed(skill.points) }}</b
							>
						</div>
						<div
							v-if="skill.activatedSkill"
							class="mt-1 text-xs font-semibold"
							:class="skill.points < 0 ? 'text-red-300' : 'text-secondary-300'"
						>
							{{ skill.activatedSkill.name }}
						</div>
						<div v-else class="mt-1 text-xs text-primary-400">
							Not activated
						</div>
						<div
							v-if="skill.activatedSkill"
							class="pointer-events-none invisible absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-gray-600 bg-gray-800 p-2 text-xs text-gray-100 opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100 sm:w-64"
							:class="{
								'sm:left-0 sm:right-auto': skillIndex % 3 === 0,
								'sm:left-1/2 sm:right-auto sm:-translate-x-1/2':
									skillIndex % 3 === 1,
								'sm:left-auto sm:right-0': skillIndex % 3 === 2,
							}"
						>
							{{ skill.activatedSkill.description }}
						</div>
						<MobileInfoButton
							v-if="skill.activatedSkill"
							:title="skill.activatedSkill.name"
						>
							<p class="text-primary-100">
								{{ skill.activatedSkill.description }}
							</p>
						</MobileInfoButton>
					</div>
				</div>
			</section>

			<section>
				<h3
					class="mb-2 text-sm font-bold uppercase tracking-wider text-primary-300"
				>
					Armor pieces
				</h3>
				<div class="flex flex-col gap-2">
					<button
						v-for="piece in armor.pieces"
						:key="piece.id"
						type="button"
						data-armor-piece
						class="flex items-start gap-3 rounded-lg border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-secondary-400"
						:class="
							selectedPieceIds.has(piece.id)
								? 'border-accent-400 bg-accent-950/40'
								: 'border-primary-600 bg-primary-700/35 hover:border-primary-400 hover:bg-primary-700/70'
						"
						:aria-pressed="selectedPieceIds.has(piece.id)"
						@click="togglePiece(piece.id)"
					>
						<span
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-900"
						>
							<img
								:src="resolveArmorPartIconUrl(piece.iconKey)"
								alt=""
								class="h-8 w-8 object-contain"
							/>
						</span>
						<span class="min-w-0 flex-1">
							<span class="flex items-start justify-between gap-3">
								<span class="block min-w-0 truncate text-sm font-semibold">{{
									piece.name
								}}</span>
								<span
									class="flex shrink-0 items-center gap-1 text-xs text-primary-300"
									title="Defense"
								>
									<img
										:src="resolveAssetUrl('icons/def.png')"
										alt="Defense"
										class="h-4 w-4"
									/>
									{{ piece.defense.base }}–{{ piece.defense.max }}
								</span>
							</span>
							<span class="mt-2 flex items-center justify-between gap-3">
								<ArmorResistanceList
									class="min-w-0"
									:resistances="piece.resistances"
									compact
								/>
								<SlotPips class="shrink-0" :count="piece.slots" />
							</span>
							<span class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
								<span
									v-for="skill in piece.skills"
									:key="skill.treeId"
									class="text-xs"
									:title="
										resolvedArmorSkills.find(
											(setSkill) => setSkill.treeId === skill.treeId
										)?.activatedSkill?.description
									"
								>
									<span class="text-primary-300">{{
										getSkillTreeName(skill.treeId)
									}}</span>
									<b
										class="ml-1"
										:class="
											skill.points > 0 ? 'text-emerald-300' : 'text-red-300'
										"
										>{{ signed(skill.points) }}</b
									>
								</span>
								<span
									v-if="!piece.skills.length"
									class="text-xs text-primary-400"
									>No skill points</span
								>
							</span>
						</span>
					</button>
				</div>
			</section>

			<div>
				<div
					v-if="recipeLoading"
					class="rounded-lg border border-primary-600 bg-primary-700/45 px-3 py-3 text-center text-xs text-primary-300"
				>
					Loading recipe…
				</div>
				<div
					v-else-if="recipeFailed"
					class="rounded-lg border border-red-800 bg-red-950/40 px-3 py-3 text-center text-xs text-red-200"
				>
					Recipe unavailable.
				</div>
				<div
					v-else-if="recipe && recipe.coverage.available === 0"
					class="rounded-lg border border-primary-600 bg-primary-700/45 px-3 py-3 text-center text-xs text-primary-300"
				>
					No crafting data available.
				</div>
				<template v-else-if="recipe">
					<div
						v-if="recipe.coverage.available < recipe.coverage.total"
						class="mb-2 text-center text-xs text-primary-300"
					>
						Recipes available for {{ recipe.coverage.available }} of
						{{ recipe.coverage.total }} pieces.
					</div>
					<CraftingRecipeCard
						title="Create"
						:subtitle="recipeSubtitle"
						:materials="recipe.materials"
					/>
				</template>
			</div>
		</div>
	</DetailsDrawer>
</template>

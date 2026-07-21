<script setup lang="ts">
import {computed, ref} from 'vue'
import Icon from '@/components/common/AppIcon.vue'
import MobileInfoButton from '@/components/common/MobileInfoButton.vue'
import VisualThumbnail from '@/components/common/VisualThumbnail.vue'
import ArmorResistanceList from './ArmorResistanceList.vue'
import ArmorSkillSummaryList from './ArmorSkillSummaryList.vue'
import type {ArmorSetSummary} from '@/data/armor/types'
import {resolveArmorVisualUrl, type ArmorVisual} from '@/data/armor/visuals'
import {resolveAssetUrl} from '@/data/assets'
import {
	getSkillTree,
	resolveActivatedSkill,
	type SkillDefinition,
} from '@/data/skills/skills'

const props = withDefaults(
	defineProps<{
		armor: ArmorSetSummary
		visual?: ArmorVisual
		active?: boolean
		dimmed?: boolean
	}>(),
	{active: false, dimmed: false}
)
defineEmits<{open: []}>()

type ArmorSkillDisplay = {
	treeId: number
	treeName: string
	points: number
	activated?: SkillDefinition
	nextThreshold?: number
}

const hovered = ref(false)
const thumbnailUrl = computed(() =>
	props.visual?.thumbnail ? resolveArmorVisualUrl(props.visual.thumbnail) : null
)

function resolveNextThreshold(
	skills: SkillDefinition[],
	points: number
): number | undefined {
	if (points < 0) {
		return skills
			.map((skill) => skill.threshold)
			.filter((threshold) => threshold < points && threshold < 0)
			.sort((left, right) => right - left)[0]
	}

	return skills
		.map((skill) => skill.threshold)
		.filter((threshold) => threshold > points && threshold > 0)
		.sort((left, right) => left - right)[0]
}

const skillDetails = computed<ArmorSkillDisplay[]>(() =>
	props.armor.skills
		.map((skill) => {
			const tree = getSkillTree(skill.treeId)
			const activated = resolveActivatedSkill(skill.treeId, skill.points)
			return {
				treeId: skill.treeId,
				treeName: tree?.name ?? `Unknown skill ${skill.treeId}`,
				points: skill.points,
				activated,
				nextThreshold: activated
					? undefined
					: resolveNextThreshold(tree?.skills ?? [], skill.points),
			}
		})
		.sort(
			(left, right) =>
				Number(Boolean(right.activated)) - Number(Boolean(left.activated))
		)
)
const hunterTypeLabel = computed(() =>
	props.armor.hunterType === 'blademaster'
		? 'Blademaster'
		: props.armor.hunterType === 'gunner'
			? 'Gunner'
			: 'Both'
)
const displayName = computed(() =>
	[props.armor.name, props.armor.variantLabel].filter(Boolean).join(' ')
)
</script>

<template>
	<div
		:data-armor-id="armor.id"
		class="relative h-32 w-full rounded-md transition-opacity duration-200 hover:z-20 md:h-28"
		:class="{
			'z-10 ring-2 ring-secondary-400 ring-offset-2 ring-offset-primary-900':
				active,
			'opacity-20': dimmed,
		}"
		@mouseenter="hovered = true"
		@mouseleave="hovered = false"
	>
		<button
			type="button"
			class="group relative h-full w-full cursor-pointer select-none overflow-hidden rounded-md bg-primary-700 text-left transition-all duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-400"
			:aria-label="`Open ${displayName} ${hunterTypeLabel} details`"
			@click="$emit('open')"
		>
			<div class="h-full pl-28">
				<div class="flex h-full flex-col justify-center px-3 pb-5 pt-1 md:py-1">
					<div class="flex items-center justify-between gap-2">
						<div class="min-w-0 truncate text-sm font-bold tracking-wider">
							{{ displayName }}
							<span
								class="ml-1 text-xs font-semibold tracking-normal text-primary-300"
							>
								{{ hunterTypeLabel }} · {{ armor.pieceNames.length }}/5
							</span>
						</div>
						<span :title="`Rarity ${armor.rarity}`">
							<Icon
								icon="tabler:diamond-filled"
								class="size-4"
								:class="`text-rarity-${armor.rarity}`"
							/>
						</span>
					</div>

					<div class="my-1 flex items-center gap-3">
						<div class="flex items-center" title="Defense">
							<img
								:src="resolveAssetUrl('icons/def.png')"
								alt="Defense"
								class="inline h-4 w-4"
							/>
							<span class="text-sm leading-none">
								{{ armor.summary.defense.base }}–{{ armor.summary.defense.max }}
							</span>
						</div>
						<span
							class="whitespace-nowrap text-xs leading-none text-primary-200"
						>
							Slots {{ armor.summary.slotDistribution.join(' · ') }}
						</span>
					</div>

					<ArmorResistanceList
						:resistances="armor.summary.resistances"
						compact
					/>

					<div class="mt-1 truncate text-xs font-semibold">
						<template
							v-for="(skill, index) in skillDetails"
							:key="skill.treeId"
						>
							<span
								:class="
									skill.activated
										? skill.points < 0
											? 'text-red-300'
											: 'text-secondary-300'
										: 'text-primary-400'
								"
							>
								{{ skill.activated?.name ?? skill.treeName }}</span
							><span
								v-if="index < skillDetails.length - 1"
								class="text-primary-400"
							>
								·
							</span>
						</template>
					</div>
				</div>
			</div>

			<div class="absolute inset-y-0 left-0 w-28 border-r border-primary-600">
				<VisualThumbnail
					class="[&>img]:bg-white"
					:url="thumbnailUrl"
					:name="`${displayName} ${hunterTypeLabel}`"
				/>
			</div>
		</button>
		<MobileInfoButton :title="`${displayName} skills`">
			<ArmorSkillSummaryList :skills="skillDetails" />
		</MobileInfoButton>

		<Transition name="fade">
			<div
				v-if="hovered"
				class="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-[11px] text-gray-100 shadow-xl md:block"
			>
				<ArmorSkillSummaryList :skills="skillDetails" />
			</div>
		</Transition>
	</div>
</template>

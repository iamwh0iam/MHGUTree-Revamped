<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from 'vue'
import ArmorSetCard from './ArmorSetCard.vue'
import {getArmorVisual, type ArmorVisualManifest} from '@/data/armor/visuals'
import type {ArmorGender, ArmorSetSummary} from '@/data/armor/types'

const props = defineProps<{
	rarity: number
	sets: ArmorSetSummary[]
	gender: ArmorGender
	manifest: ArmorVisualManifest | null
	preserveTypeColumns: boolean
	activeArmorId?: number | null
	reveal?: boolean
}>()
const emit = defineEmits<{open: [armor: ArmorSetSummary]}>()
const sectionElement = useTemplateRef<HTMLElement>('section')
const visible = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
	if (props.reveal) {
		visible.value = true
		return
	}
	if (!('IntersectionObserver' in window)) {
		visible.value = true
		return
	}
	observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return
			visible.value = true
			observer?.disconnect()
		},
		{rootMargin: '600px 0px'}
	)
	if (sectionElement.value) observer.observe(sectionElement.value)
})

watch(
	() => props.reveal,
	(reveal) => {
		if (!reveal) return
		visible.value = true
		observer?.disconnect()
	}
)

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
	<section ref="section" class="mt-7" :aria-labelledby="`armor-rare-${rarity}`">
		<h2
			:id="`armor-rare-${rarity}`"
			class="mb-3 flex w-full items-center gap-2 rounded bg-gray-800 text-left"
		>
			<span class="text-lg font-semibold">Rarity {{ rarity }}</span>
			<span class="pt-1 text-sm text-gray-400">{{ sets.length }} sets</span>
		</h2>
		<div
			v-if="visible"
			class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
		>
			<ArmorSetCard
				v-for="armor in sets"
				:key="armor.id"
				:class="{
					'xl:col-start-1':
						preserveTypeColumns && armor.hunterType === 'blademaster',
					'xl:col-start-2':
						preserveTypeColumns && armor.hunterType === 'gunner',
					'md:col-span-2 md:w-[calc(50%_-_0.5rem)] xl:col-span-1 xl:col-start-3 xl:w-full':
						preserveTypeColumns && armor.hunterType === 'both',
				}"
				:armor="armor"
				:visual="getArmorVisual(manifest, armor.id, gender)"
				:active="armor.id === activeArmorId"
				:dimmed="activeArmorId != null && armor.id !== activeArmorId"
				@open="emit('open', armor)"
			/>
		</div>
		<div v-else class="h-32 rounded-md bg-primary-800/20" aria-hidden="true" />
	</section>
</template>

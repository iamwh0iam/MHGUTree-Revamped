<script setup lang="ts">
import SpriteTurntable from '@/components/common/SpriteTurntable.vue'
import {
	resolveWeaponVisualUrl,
	WEAPON_VISUAL_FRAME_COUNT,
	WEAPON_VISUAL_FRAME_SIZE,
	type AvailableWeaponVisual,
} from '@/data/weapons/visuals'

defineProps<{visual: AvailableWeaponVisual; weaponName: string}>()
</script>

<template>
	<SpriteTurntable
		:turntable-url="resolveWeaponVisualUrl(visual.turntable)"
		:thumbnail-url="resolveWeaponVisualUrl(visual.thumbnail)"
		:name="weaponName"
		:frame-size="WEAPON_VISUAL_FRAME_SIZE"
		:frame-count="WEAPON_VISUAL_FRAME_COUNT"
	/>
</template>

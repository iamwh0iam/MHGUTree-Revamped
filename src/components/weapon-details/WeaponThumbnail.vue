<script setup lang="ts">
import VisualThumbnail from '@/components/common/VisualThumbnail.vue'
import {resolveWeaponVisualUrl, type WeaponVisual} from '@/data/weapons/visuals'

defineProps<{visual?: WeaponVisual; weaponName: string}>()
</script>

<template>
	<VisualThumbnail
		class="rounded-l-md border-r border-primary-600"
		:url="visual?.thumbnail ? resolveWeaponVisualUrl(visual.thumbnail) : null"
		:name="weaponName"
	/>
</template>

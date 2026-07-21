<script setup lang="ts">
import Icon from '@/components/common/AppIcon.vue'

defineProps<{url?: string | null; name: string}>()
</script>

<template>
	<div
		class="flex h-full w-full shrink-0 items-center justify-center overflow-hidden bg-primary-900/35 text-primary-500"
		aria-hidden="true"
	>
		<img
			v-if="url"
			:src="url"
			:alt="`${name} preview`"
			class="h-full w-full object-contain"
			loading="lazy"
			decoding="async"
		/>
		<Icon v-else icon="tabler:photo-off" class="h-5 w-5" />
	</div>
</template>

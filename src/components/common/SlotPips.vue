<script setup lang="ts">
defineProps<{count: number}>()
</script>

<template>
	<div
		class="flex gap-[6px]"
		:aria-label="`${count} slots`"
		:title="`Slots: ${count}`"
	>
		<div v-for="index in 3" :key="index" class="h-3.5 w-3.5">
			<div
				v-if="count < index"
				class="h-3.5 w-3.5 rounded-full border-1 border-dotted border-gray-500"
			/>
			<div v-else class="h-3.5 w-3.5 rounded-full bg-gray-300" />
		</div>
	</div>
</template>

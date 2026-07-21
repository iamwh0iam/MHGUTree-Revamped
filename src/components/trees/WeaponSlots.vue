<script lang="ts" setup>
import SlotPips from '@/components/common/SlotPips.vue'

defineProps<{
	slots: number
}>()
</script>

<template>
	<SlotPips :count="slots" />
</template>

<style lang="scss" scoped></style>

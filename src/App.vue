<script setup lang="ts">
import AppMainMenu from './components/navigation/AppMainMenu.vue'
</script>

<template>
	<div
		class="grid h-dvh min-w-screen grid-cols-1 overflow-hidden md:grid-cols-[auto_1fr]"
	>
		<AppMainMenu />
		<div class="scrollable relative h-full min-h-0 min-w-0 overflow-y-auto">
			<img
				src="/background.png"
				alt="Background"
				class="pointer-events-none absolute inset-0 h-full w-full object-fill opacity-25"
			/>
			<RouterView />
		</div>
	</div>
</template>

<style scoped></style>

<script setup lang="ts">
withDefaults(
	defineProps<{
		overlay?: boolean
		mobileMenuGutter?: boolean
		mobileSurface?: boolean
		surface?: boolean
		contentClass?: string
	}>(),
	{
		overlay: false,
		mobileMenuGutter: false,
		mobileSurface: false,
		surface: true,
		contentClass: '',
	}
)
</script>

<template>
	<div
		:class="[
			overlay
				? 'pointer-events-none fixed left-0 right-3 top-3 z-30'
				: 'sticky top-3 z-30',
			mobileMenuGutter ? 'pl-16 pr-4 md:px-4' : 'px-4',
		]"
	>
		<div
			class="pointer-events-auto flex w-full max-w-7xl flex-wrap items-center gap-3 md:mx-0"
			:class="[
				contentClass,
				!surface
					? 'border-0 bg-transparent p-0 shadow-none backdrop-blur-none'
					: mobileMenuGutter
					? mobileSurface
						? 'h-11 rounded-md border border-primary-700 bg-primary-900/90 p-0 shadow-xl backdrop-blur md:h-auto md:px-4 md:py-3'
						: 'border-0 bg-transparent p-0 shadow-none md:rounded-md md:border md:border-primary-700 md:bg-primary-900/90 md:px-4 md:py-3 md:shadow-xl md:backdrop-blur'
					: 'rounded-md border border-primary-700 bg-primary-900/90 px-4 py-3 shadow-xl backdrop-blur',
			]"
		>
			<slot />
		</div>
	</div>
</template>

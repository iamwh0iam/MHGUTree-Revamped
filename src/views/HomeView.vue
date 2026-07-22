<script lang="ts" setup>
import {resolveAssetUrl} from '@/data/assets'

const equipment = [
	{label: 'Sword & Shield', routeName: 'Sword', icon: 'weapon-types/sns.png'},
	{label: 'Dualblades', routeName: 'Dualblades', icon: 'weapon-types/db.png'},
	{label: 'Greatsword', routeName: 'Greatsword', icon: 'weapon-types/gs.png'},
	{label: 'Longsword', routeName: 'Longsword', icon: 'weapon-types/ls.png'},
	{label: 'Hammer', routeName: 'Hammer', icon: 'weapon-types/h.png'},
	{label: 'Hunting Horn', routeName: 'Horn', icon: 'weapon-types/hh.png'},
	{label: 'Lance', routeName: 'Lance', icon: 'weapon-types/l.png'},
	{label: 'Gunlance', routeName: 'Gunlance', icon: 'weapon-types/gl.png'},
	{
		label: 'Chargeblade',
		routeName: 'Chargeblade',
		icon: 'weapon-types/cb.png',
	},
	{label: 'Switch Axe', routeName: 'Switchaxe', icon: 'weapon-types/sa.png'},
	{label: 'Insect Glaive', routeName: 'glaive', icon: 'weapon-types/ig.png'},
	{
		label: 'Light Bowgun',
		routeName: 'Lightbowgun',
		icon: 'weapon-types/lbg.png',
	},
	{
		label: 'Heavy Bowgun',
		routeName: 'Heavybowgun',
		icon: 'weapon-types/hbg.png',
	},
	{label: 'Bow', routeName: 'Bow', icon: 'weapon-types/b.png'},
	{label: 'Armor', routeName: 'Armor', icon: 'armor.png'},
]
</script>

<template>
	<div class="relative z-10 flex h-full min-w-0 flex-col gap-8 overflow-hidden">
		<div
			class="grid h-full min-w-0 place-items-center overflow-x-hidden overflow-y-auto scrollable pb-12 pt-18 md:py-12"
		>
			<div
				class="grid w-full min-w-0 max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(9rem,100%),1fr))] gap-4 px-4 md:grid-cols-2 lg:grid-cols-3"
			>
				<router-link
					v-for="item in equipment"
					:key="item.routeName"
					:to="{name: item.routeName}"
					class="group flex w-full min-w-0 cursor-pointer flex-col items-center gap-3 rounded-xl border border-primary-700 bg-primary-800/70 p-5 backdrop-blur-sm transition-all duration-200 hover:border-accent-500 hover:bg-primary-700/80"
				>
					<img
						:src="resolveAssetUrl(`icons/${item.icon}`)"
						:alt="item.label"
						class="w-12 h-12 group-hover:scale-110 transition-transform duration-200"
					/>
					<span
						class="text-sm font-semibold tracking-wide text-contrast-600 group-hover:text-accent-400 transition-colors text-center leading-tight"
					>
						{{ item.label }}
					</span>
				</router-link>
			</div>
		</div>
	</div>
</template>

<style scoped></style>

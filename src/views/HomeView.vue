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
	<div class="relative z-10 flex flex-col gap-8 h-full overflow-hidden">
		<div
			class="grid place-items-center h-full overflow-y-auto scrollable py-12"
		>
			<div
				class="grid max-md:grid-cols-1 max-lg:grid-cols-2 max-2xl:grid-cols-3 grid-cols-4 gap-4"
			>
				<router-link
					v-for="item in equipment"
					:key="item.routeName"
					:to="{name: item.routeName}"
					class="group bg-primary-800/70 border border-primary-700 rounded-xl p-5 flex flex-col items-center gap-3 hover:bg-primary-700/80 hover:border-accent-500 transition-all duration-200 cursor-pointer backdrop-blur-sm min-w-64"
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

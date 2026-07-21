<script lang="ts" setup>
import type {TWeapon, TMeleeData} from '@/interfaces/Weapons'
import {computed, inject} from 'vue'
import WeaponSharpnessBar from './WeaponSharpnessBar.vue'
import WeaponSlots from './WeaponSlots.vue'
import Icon from '@/components/common/AppIcon.vue'
import {weaponTreeContextKey} from './weaponTreeContext'
import {resolveAssetUrl} from '@/data/assets'

// ── Props ──────────────────────────────────────────────────────────────────
interface IProps {
	weapon: TWeapon<TMeleeData>
	elementStripeClasses?: string
	dimmed?: boolean
	visualPosition?: 'left' | 'right'
}
const props = withDefaults(defineProps<IProps>(), {
	dimmed: false,
	visualPosition: 'right',
})

const stripeColor = computed(() => {
	const elem = props.weapon.data.element || 'none'
	if (elem === 'none') return 'bg-primary-900 hover:bg-primary-900/70'
	return `bg-element-${elem.toLowerCase()}`
})
const rarityColor = computed(() => {
	return `text-rarity-${props.weapon.data.rarity}`
})
const treeContext = inject(weaponTreeContextKey, null)
</script>

<template>
	<div
		class="rounded-md select-none transition-all duration-200 w-full h-full bg-primary-700 relative"
		:class="{'opacity-25': props.dimmed}"
	>
		<!-- Right Element stripe -->
		<div
			class="absolute right-0 inset-y-0 w-1.5 rounded-r-md bg-linear-0"
			:class="props.elementStripeClasses || stripeColor"
		/>

		<!-- Main content -->
		<div
			class="h-full"
			:class="{
				'pl-20': $slots.visual && props.visualPosition === 'left',
				'pr-20': $slots.visual && props.visualPosition === 'right',
			}"
		>
			<div class="flex flex-col justify-center h-full pl-3 pr-3 py-1">
				<!-- Name & Rarity Pip -->
				<div class="flex justify-between items-center">
					<div class="flex min-w-0 items-center gap-1">
						<button
							v-if="treeContext"
							type="button"
							class="grid h-5 w-5 shrink-0 place-items-center rounded text-accent-400 transition hover:bg-primary-600 hover:text-accent-300 focus-visible:outline-2 focus-visible:outline-secondary-400"
							:aria-label="`Focus ${props.weapon.data.name} upgrade tree`"
							:title="`Focus ${props.weapon.data.name} upgrade tree`"
							@click.stop="treeContext.showUpgradePath(props.weapon)"
							@keydown.stop
						>
							<Icon icon="tabler:git-branch" class="h-4 w-4" />
						</button>
						<span class="truncate text-sm font-bold tracking-wider">
							{{ props.weapon.data.name }}
						</span>
					</div>
					<span :title="`Rarity ${props.weapon.data.rarity}`">
						<Icon
							icon="tabler:diamond-filled"
							class="size-4"
							:class="rarityColor"
						/>
					</span>
				</div>

				<!-- Core Stats -->
				<div class="flex gap-2 items-center my-1">
					<!-- Attack -->
					<div class="flex items-center" title="Attack">
						<img
							:src="resolveAssetUrl('icons/atk.png')"
							alt="Attack"
							class="inline w-4 h-4"
						/>
						<span class="text-sm leading-none">{{
							props.weapon.data.attack
						}}</span>
					</div>
					<!-- Defense -->
					<div class="flex items-center" title="Defense">
						<img
							:src="resolveAssetUrl('icons/def.png')"
							alt="Defense"
							class="inline w-4 h-4"
						/>
						<span
							class="text-sm leading-none"
							:class="{
								'text-green-400': props.weapon.data.defense > 0,
							}"
							>{{ props.weapon.data.defense }}</span
						>
					</div>
					<!-- Affinity -->
					<div class="flex items-center" title="Affinity">
						<img
							:src="resolveAssetUrl('icons/aff.png')"
							alt="Affinity"
							class="inline w-4 h-4"
						/>
						<span
							class="text-sm leading-none"
							:class="{
								'text-red-400': props.weapon.data.affinity.startsWith('-'),
								'text-green-400': props.weapon.data.affinity !== '0',
							}"
							>{{ props.weapon.data.affinity }}</span
						>
					</div>
					<!-- Element -->
					<div
						class="flex items-center"
						v-if="props.weapon.data.element"
						:title="props.weapon.data.element"
					>
						<img
							:src="
								resolveAssetUrl(
									`icons/status/${props.weapon.data.element.toLowerCase()}.png`
								)
							"
							:alt="props.weapon.data.element"
							class="inline w-4 h-4"
						/>
						<span class="text-sm leading-none">{{
							props.weapon.data.element_attack
						}}</span>
					</div>

					<slot name="element2"></slot>
				</div>

				<slot name="extras"></slot>

				<!-- Melee sharpness -->
				<div class="flex justify-between items-center">
					<div
						class="rounded-sm p-1 flex flex-col gap-0.5 w-min bg-primary-900"
						title="Sharpness"
					>
						<WeaponSharpnessBar :sharpness="props.weapon.data.sharpness" />
						<WeaponSharpnessBar :sharpness="props.weapon.data.sharpness_plus" />
						<WeaponSharpnessBar
							:sharpness="props.weapon.data.sharpness_plus2"
						/>
					</div>

					<WeaponSlots :slots="props.weapon.data.slots" />
				</div>
			</div>
		</div>

		<div
			v-if="$slots.visual"
			class="absolute inset-y-0"
			:class="props.visualPosition === 'left' ? 'left-0' : 'right-0'"
		>
			<slot name="visual"></slot>
		</div>
	</div>
</template>

<style scoped></style>

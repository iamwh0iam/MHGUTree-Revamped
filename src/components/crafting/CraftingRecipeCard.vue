<script setup lang="ts">
import CraftingMaterialIcon from '@/components/crafting/CraftingMaterialIcon.vue'
import type {ResolvedCraftingMaterial} from '@/data/crafting/types'

withDefaults(
	defineProps<{
		title: string
		materials: ResolvedCraftingMaterial[]
		cost?: number
		subtitle?: string
		materialColumns?: 1 | 3
		hideHeader?: boolean
	}>(),
	{materialColumns: 1, hideHeader: false}
)

function materialLinkAttributes(material: ResolvedCraftingMaterial) {
	return material.kiranicoUrl
		? {href: material.kiranicoUrl, target: '_blank', rel: 'noopener noreferrer'}
		: {}
}
</script>

<template>
	<section
		class="overflow-hidden rounded-lg border border-primary-600 bg-primary-700/45 p-3"
	>
		<div v-if="!hideHeader" class="flex items-start justify-between gap-3">
			<div>
				<div class="text-sm font-bold">{{ title }}</div>
				<div v-if="subtitle" class="mt-0.5 text-xs text-primary-300">
					{{ subtitle }}
				</div>
			</div>
			<div
				v-if="cost !== undefined"
				class="shrink-0 text-sm font-bold text-amber-300"
			>
				{{ cost.toLocaleString() }}z
			</div>
		</div>
		<ul
			:class="[
				hideHeader ? 'mt-0' : 'mt-3',
				materialColumns === 3
					? 'material-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
					: 'divide-y divide-primary-600/70',
			]"
		>
			<li
				v-for="material in materials"
				:key="`${material.kind}-${material.kind === 'item' ? material.itemId : material.groupId}`"
				class="py-2"
				:class="
					materialColumns === 3
						? 'border-b border-primary-600/70'
						: 'first:pt-0 last:pb-0'
				"
			>
				<component
					:is="material.kiranicoUrl ? 'a' : 'div'"
					v-bind="materialLinkAttributes(material)"
					class="group flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-400"
				>
					<span
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary-900"
					>
						<CraftingMaterialIcon
							:icon-key="material.iconKey"
							:color="material.iconColor"
							class="h-6 w-6"
						/>
					</span>
					<span
						class="min-w-0 flex-1 truncate text-sm"
						:class="
							material.kiranicoUrl
								? 'text-emerald-300 group-hover:text-emerald-200 group-hover:underline'
								: ''
						"
						>{{ material.name }}</span
					>
					<span class="text-sm font-bold text-primary-200">{{
						material.kind === 'group'
							? `${material.points} pts`
							: `×${material.quantity}`
					}}</span>
				</component>
			</li>
		</ul>
	</section>
</template>

<style scoped>
.material-grid > li:last-child {
	border-bottom-width: 0;
}

@media (min-width: 640px) {
	.material-grid > li {
		border-right: 1px solid
			color-mix(in srgb, var(--color-primary-600) 70%, transparent);
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.material-grid > li:nth-child(2n + 1) {
		padding-left: 0;
	}

	.material-grid > li:nth-child(2n) {
		border-right: 0;
		padding-right: 0;
	}
}

@media (min-width: 640px) and (max-width: 767.98px) {
	.material-grid > li:nth-child(2n + 1):nth-last-child(-n + 2),
	.material-grid > li:nth-child(2n + 1):nth-last-child(-n + 2) ~ li {
		border-bottom-width: 0;
	}
}

@media (min-width: 768px) {
	.material-grid > li:nth-child(n) {
		border-right: 1px solid
			color-mix(in srgb, var(--color-primary-600) 70%, transparent);
		border-bottom-width: 1px;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.material-grid > li:nth-child(3n + 1) {
		padding-left: 0;
	}

	.material-grid > li:nth-child(3n) {
		border-right: 0;
		padding-right: 0;
	}

	.material-grid > li:nth-child(3n + 1):nth-last-child(-n + 3),
	.material-grid > li:nth-child(3n + 1):nth-last-child(-n + 3) ~ li {
		border-bottom-width: 0;
	}
}
</style>

<script setup lang="ts">
import type {SkillDefinition} from '@/data/skills/skills'

defineProps<{
	skills: {
		treeId: number
		treeName: string
		points: number
		activated?: SkillDefinition
		nextThreshold?: number
	}[]
}>()

function formatPoints(points: number): string {
	return points > 0 ? `+${points}` : String(points)
}
</script>

<template>
	<p v-if="skills.length === 0" class="text-xs text-primary-400">
		No skill points
	</p>
	<div
		v-for="(skill, index) in skills"
		:key="skill.treeId"
		:class="{'mt-2 border-t border-primary-500 pt-2': index > 0}"
	>
		<div class="flex items-baseline">
			<span class="shrink-0 text-sm font-semibold">{{ skill.treeName }}</span>
			<span
				class="ml-auto shrink-0 font-bold"
				:class="skill.points < 0 ? 'text-red-300' : 'text-emerald-300'"
			>
				{{ formatPoints(skill.points)
				}}<template
					v-if="!skill.activated && skill.nextThreshold !== undefined"
				>
					/ {{ skill.nextThreshold }}</template
				>
			</span>
		</div>
		<p
			v-if="skill.activated"
			class="mt-1 text-xs font-semibold"
			:class="skill.points < 0 ? 'text-red-300' : 'text-secondary-300'"
		>
			{{ skill.activated.name }}
		</p>
		<p v-if="skill.activated" class="mt-1 text-xs">
			{{ skill.activated.description }}
		</p>
		<p v-else class="mt-1 text-xs text-primary-400">Not activated</p>
	</div>
</template>

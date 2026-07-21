import skillData from './skill-list.json'

export type SkillDefinition = {
	name: string
	description: string
	threshold: number
}

export type SkillTree = {
	id: number
	name: string
	skills: SkillDefinition[]
}

type SkillCatalog = {schemaVersion: 1; trees: SkillTree[]}
const catalog = skillData as unknown as SkillCatalog

if (catalog.schemaVersion !== 1)
	throw new Error('Unsupported skill-list schema')

export const skillTrees = catalog.trees
export const skillTreeById = new Map(skillTrees.map((tree) => [tree.id, tree]))

export function getSkillTree(treeId: number): SkillTree | undefined {
	return skillTreeById.get(treeId)
}

export function getSkillTreeName(treeId: number): string {
	return getSkillTree(treeId)?.name ?? `Unknown skill ${treeId}`
}

export function resolveActivatedSkill(
	treeId: number,
	points: number
): SkillDefinition | undefined {
	const eligible = getSkillTree(treeId)?.skills.filter(
		(skill) =>
			(skill.threshold > 0 && points >= skill.threshold) ||
			(skill.threshold < 0 && points <= skill.threshold)
	)
	return eligible?.reduce<SkillDefinition | undefined>(
		(selected, skill) =>
			!selected || Math.abs(skill.threshold) > Math.abs(selected.threshold)
				? skill
				: selected,
		undefined
	)
}

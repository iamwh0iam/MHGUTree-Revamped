import type {MaterialGroupDefinition} from '@/data/crafting/types'

export type MaterialGroupIndex = Record<string, MaterialGroupDefinition>

type MaterialGroupModule = {default: MaterialGroupIndex}

let materialGroupIndexPromise: Promise<MaterialGroupIndex> | undefined

export function loadMaterialGroupIndex(): Promise<MaterialGroupIndex> {
	materialGroupIndexPromise ??= import('./material-groups.json').then(
		(module: MaterialGroupModule) => module.default
	)
	return materialGroupIndexPromise
}

import type {WeaponTypeKey} from '@/data/weapons/types'
import {
	loadItemIndex,
	resolveKiranicoUrl,
	type ItemIndex,
} from '@/data/items/items'
import {
	loadMaterialGroupIndex,
	type MaterialGroupIndex,
} from '@/data/crafting/materialGroups'
import type {
	CraftingRecipe,
	ResolvedCraftingMaterial,
	ResolvedCraftingRecipe,
	ResolvedWeaponCrafting,
	WeaponCrafting as StoredWeaponCrafting,
} from '@/data/crafting/types'
export {resolveComponentIconUrl} from '@/data/crafting/assets'

export type {WeaponTypeKey} from '@/data/weapons/types'
export type {
	ResolvedCraftingRecipe as CraftingRecipe,
	ResolvedWeaponCrafting as WeaponCrafting,
} from '@/data/crafting/types'

type WeaponCraftingIndex = Record<string, StoredWeaponCrafting>
type CraftingModule = {default: WeaponCraftingIndex}

const craftingLoaders: Record<WeaponTypeKey, () => Promise<CraftingModule>> = {
	bow: () => import('./recipes/b.json') as Promise<CraftingModule>,
	'charge-blade': () =>
		import('./recipes/cb.json') as Promise<CraftingModule>,
	'dual-blades': () =>
		import('./recipes/db.json') as Promise<CraftingModule>,
	'great-sword': () =>
		import('./recipes/gs.json') as Promise<CraftingModule>,
	gunlance: () => import('./recipes/gl.json') as Promise<CraftingModule>,
	hammer: () => import('./recipes/h.json') as Promise<CraftingModule>,
	'heavy-bowgun': () =>
		import('./recipes/hbg.json') as Promise<CraftingModule>,
	'hunting-horn': () =>
		import('./recipes/hh.json') as Promise<CraftingModule>,
	'insect-glaive': () =>
		import('./recipes/ig.json') as Promise<CraftingModule>,
	lance: () => import('./recipes/l.json') as Promise<CraftingModule>,
	'light-bowgun': () =>
		import('./recipes/lbg.json') as Promise<CraftingModule>,
	'long-sword': () =>
		import('./recipes/ls.json') as Promise<CraftingModule>,
	'switch-axe': () =>
		import('./recipes/sa.json') as Promise<CraftingModule>,
	'sword-and-shield': () =>
		import('./recipes/sns.json') as Promise<CraftingModule>,
}

const craftingCache = new Map<WeaponTypeKey, Promise<WeaponCraftingIndex>>()

function loadCraftingIndex(
	weaponType: WeaponTypeKey
): Promise<WeaponCraftingIndex> {
	const cached = craftingCache.get(weaponType)
	if (cached) return cached

	const pending = craftingLoaders[weaponType]()
		.then((module) => module.default)
		.catch((error: unknown) => {
			craftingCache.delete(weaponType)
			throw error
		})
	craftingCache.set(weaponType, pending)
	return pending
}

export async function loadWeaponCrafting(
	weaponType: WeaponTypeKey,
	weaponId: number
): Promise<ResolvedWeaponCrafting | undefined> {
	const [index, items, groups] = await Promise.all([
		loadCraftingIndex(weaponType),
		loadItemIndex(),
		loadMaterialGroupIndex(),
	])
	const crafting = index[String(weaponId)]
	if (!crafting) return undefined

	return {
		create: crafting.create
			? resolveRecipe(crafting.create, items, groups)
			: undefined,
		upgrade: crafting.upgrade
			? resolveRecipe(crafting.upgrade, items, groups)
			: undefined,
	}
}

function resolveRecipe(
	recipe: CraftingRecipe,
	items: ItemIndex,
	groups: MaterialGroupIndex
): ResolvedCraftingRecipe {
	return {
		...recipe,
		materials: recipe.materials.map<ResolvedCraftingMaterial>((requirement) => {
			if (requirement.kind === 'item') {
				const item = items[String(requirement.itemId)]
				if (!item)
					throw new Error(`Unknown crafting item: ${requirement.itemId}`)
				return {
					...requirement,
					...item,
					kiranicoUrl: resolveKiranicoUrl(item.kiranicoPath),
				}
			}

			const group = groups[String(requirement.groupId)]
			if (!group)
				throw new Error(`Unknown material group: ${requirement.groupId}`)
			return {
				...requirement,
				name: group.name,
				iconKey: group.iconKey,
				iconColor: group.iconColor,
				kiranicoUrl: resolveKiranicoUrl(group.kiranicoPath),
			}
		}),
	}
}

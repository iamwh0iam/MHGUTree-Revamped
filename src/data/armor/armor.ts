import catalogData from './catalog.json'
import genderOverridesData from './gender-overrides.json'
import {loadItemIndex, resolveKiranicoUrl} from '@/data/items/items'
import type {
	ArmorPiece,
	ArmorSet,
	ArmorSetSummary,
	ResolvedArmorRecipe,
} from './types'
import {resolveAssetUrl} from '@/data/assets'

type ArmorCatalog = {schemaVersion: 3; sets: ArmorSetSummary[]}
type ArmorGenderOverrides = Record<string, ArmorSetSummary['genders']>
type ArmorDetailsFile = {
	schemaVersion: 3
	families: Record<string, ArmorPiece[]>
}
type ArmorDetailsModule = {default: unknown}
const catalog = catalogData as unknown as ArmorCatalog
const genderOverrides = genderOverridesData as ArmorGenderOverrides

if (catalog.schemaVersion !== 3)
	throw new Error('Unsupported armor data schema')

export const armorSets = catalog.sets.map((armor) => ({
	...armor,
	genders: genderOverrides[String(armor.id)] ?? armor.genders,
}))

const detailImporters: Record<number, () => Promise<ArmorDetailsModule>> = {
	1: () => import('./details/rare-01.json'),
	2: () => import('./details/rare-02.json'),
	3: () => import('./details/rare-03.json'),
	4: () => import('./details/rare-04.json'),
	5: () => import('./details/rare-05.json'),
	6: () => import('./details/rare-06.json'),
	7: () => import('./details/rare-07.json'),
	8: () => import('./details/rare-08.json'),
	9: () => import('./details/rare-09.json'),
	10: () => import('./details/rare-10.json'),
	11: () => import('./details/rare-11.json'),
}
const detailPromises = new Map<number, Promise<ArmorDetailsFile>>()

function loadArmorDetails(rarity: number): Promise<ArmorDetailsFile> {
	const importer = detailImporters[rarity]
	if (!importer)
		return Promise.reject(new Error(`Invalid armor rarity: ${rarity}`))
	let promise = detailPromises.get(rarity)
	if (!promise) {
		promise = importer().then(({default: value}) => {
			const details = value as ArmorDetailsFile
			if (details.schemaVersion !== 3)
				throw new Error(`Unsupported Rarity ${rarity} armor detail schema`)
			return details
		})
		detailPromises.set(rarity, promise)
	}
	return promise
}

export async function loadArmorSet(
	summary: ArmorSetSummary
): Promise<ArmorSet> {
	const details = await loadArmorDetails(summary.rarity)
	const pieces = details.families[String(summary.id)]
	if (!pieces) throw new Error(`Missing armor details for family ${summary.id}`)
	return {...summary, pieces}
}

export async function resolveArmorRecipe(
	piece: ArmorPiece
): Promise<ResolvedArmorRecipe> {
	return resolveArmorRecipes([piece])
}

export async function resolveArmorRecipes(
	pieces: ArmorPiece[]
): Promise<ResolvedArmorRecipe> {
	const items = await loadItemIndex()
	const availablePieces = pieces.filter((piece) => piece.recipe !== null)
	const requirements = new Map<
		number,
		NonNullable<ArmorPiece['recipe']>['materials'][number]
	>()
	for (const piece of availablePieces) {
		for (const requirement of piece.recipe?.materials ?? []) {
			const existing = requirements.get(requirement.itemId)
			if (existing) {
				existing.quantity += requirement.quantity
				existing.keyMaterial ||= requirement.keyMaterial
			} else {
				requirements.set(requirement.itemId, {...requirement})
			}
		}
	}
	return {
		coverage: {available: availablePieces.length, total: pieces.length},
		materials: [...requirements.values()].map((requirement) => {
			const item = items[String(requirement.itemId)]
			if (!item)
				throw new Error(`Unknown armor crafting item: ${requirement.itemId}`)
			return {
				...requirement,
				...item,
				kiranicoUrl: resolveKiranicoUrl(item.kiranicoPath),
			}
		}),
	}
}

export function resolveArmorPartIconUrl(iconKey: string): string {
	return resolveAssetUrl(`icons/armor-parts/${iconKey.replace(/^\/+/, '')}`)
}

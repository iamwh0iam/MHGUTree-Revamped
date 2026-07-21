import type {ItemRequirement, ResolvedItemMaterial} from '@/data/crafting/types'

export type ArmorHunterType = 'blademaster' | 'gunner' | 'both'
export type ArmorGender = 'male' | 'female'
export type ArmorSlot = 'head' | 'body' | 'arms' | 'waist' | 'legs'
export type ArmorRank = 'low' | 'high' | 'g'
export type ResistanceType = 'fire' | 'water' | 'thunder' | 'ice' | 'dragon'
export type ArmorResistances = Record<ResistanceType, number>

export type DefenseRange = {base: number; max: number}
export type ArmorSkillPoints = {treeId: number; points: number}
export type ArmorSkillTotal = ArmorSkillPoints
export type ArmorRecipe = {materials: ItemRequirement[]}
export type ResolvedArmorRecipe = {
	materials: ResolvedItemMaterial[]
	coverage: {available: number; total: number}
}

export type ArmorPiece = {
	id: number
	slot: ArmorSlot
	name: string
	iconKey: string
	defense: DefenseRange
	resistances: ArmorResistances
	slots: number
	skills: ArmorSkillPoints[]
	recipe: ArmorRecipe | null
}

export type ArmorSetSummary = {
	id: number
	name: string
	variantLabel: string | null
	pieceNames: string[]
	rarity: number
	hunterType: ArmorHunterType
	genders: ArmorGender[]
	summary: {
		defense: DefenseRange
		resistances: ArmorResistances
		slots: number
		slotDistribution: [number, number, number, number, number]
	}
	skills: ArmorSkillTotal[]
}

export type ArmorSet = ArmorSetSummary & {
	pieces: ArmorPiece[]
}

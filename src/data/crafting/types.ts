export type ItemRequirement = {
	kind: 'item'
	itemId: number
	quantity: number
	keyMaterial: boolean
}

export type GroupRequirement = {
	kind: 'group'
	groupId: number
	points: number
}

export type CraftingRequirement = ItemRequirement | GroupRequirement

export type CraftingRecipe = {
	cost: number
	fromWeapon?: {
		id: number
		name: string
	}
	materials: CraftingRequirement[]
}

export type WeaponCrafting = {
	create?: CraftingRecipe
	upgrade?: CraftingRecipe
}

export type MaterialGroupMember = {
	itemId: number
	points: number
}

export type MaterialGroupDefinition = {
	name: string
	iconKey: string
	iconColor: string
	kiranicoPath?: string
	members: MaterialGroupMember[]
}

type ResolvedMaterialBase = {
	name: string
	iconKey: string
	iconColor: string
	kiranicoUrl?: string
}

export type ResolvedItemMaterial = ItemRequirement & ResolvedMaterialBase
export type ResolvedGroupMaterial = GroupRequirement & ResolvedMaterialBase
export type ResolvedCraftingMaterial =
	| ResolvedItemMaterial
	| ResolvedGroupMaterial

export type ResolvedCraftingRecipe = Omit<CraftingRecipe, 'materials'> & {
	materials: ResolvedCraftingMaterial[]
}

export type ResolvedWeaponCrafting = {
	create?: ResolvedCraftingRecipe
	upgrade?: ResolvedCraftingRecipe
}

export const WEAPON_TYPE_KEYS = [
	'bow',
	'charge-blade',
	'dual-blades',
	'great-sword',
	'gunlance',
	'hammer',
	'heavy-bowgun',
	'hunting-horn',
	'insect-glaive',
	'lance',
	'light-bowgun',
	'long-sword',
	'switch-axe',
	'sword-and-shield',
] as const

export type WeaponTypeKey = (typeof WEAPON_TYPE_KEYS)[number]

import type {InjectionKey} from 'vue'
import type {TWeapon, TWeaponDataAny} from '@/interfaces/Weapons'

export type WeaponTreeContext = {
	showUpgradePath: (weapon: TWeapon<TWeaponDataAny>) => void
}

export const weaponTreeContextKey: InjectionKey<WeaponTreeContext> = Symbol(
	'weapon-tree-context'
)

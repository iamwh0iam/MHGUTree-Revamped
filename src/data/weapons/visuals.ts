import type {WeaponTypeKey} from '@/data/weapons/types'
import {resolveAssetUrl} from '@/data/assets'

const KIRANICO_BASE_URL = 'https://mhgu.kiranico.com'

export type WeaponVisual = {
	thumbnail: string | null
	turntable: string | null
	sourcePage: string
}

export type AvailableWeaponVisual = WeaponVisual & {
	thumbnail: string
	turntable: string
}

export const WEAPON_VISUAL_FRAME_SIZE = 270
export const WEAPON_VISUAL_FRAME_COUNT = 15

type WeaponVisualFamily = {model: string; source: string}

export type WeaponVisualManifest = {
	schemaVersion: 2
	weaponType: WeaponTypeKey
	frame: {size: number; count: number}
	families: Record<string, WeaponVisualFamily | null>
}

const manifestCache = new Map<
	WeaponTypeKey,
	Promise<WeaponVisualManifest | null>
>()

function weaponVisualBaseUrl(): string {
	return resolveAssetUrl('models/weapons')
}

function isWeaponVisualFamily(
	value: unknown,
	weaponType: WeaponTypeKey
): value is WeaponVisualFamily {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false
	const visual = value as Partial<WeaponVisualFamily>
	return (
		typeof visual.model === 'string' &&
		new RegExp(`^${weaponType}/[a-z0-9_-]+$`, 'i').test(visual.model) &&
		typeof visual.source === 'string' &&
		/^[0-9a-f]+$/i.test(visual.source)
	)
}

function parseManifest(
	value: unknown,
	weaponType: WeaponTypeKey
): WeaponVisualManifest | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null
	const manifest = value as Partial<WeaponVisualManifest>
	if (
		manifest.schemaVersion !== 2 ||
		manifest.weaponType !== weaponType ||
		manifest.frame?.size !== WEAPON_VISUAL_FRAME_SIZE ||
		manifest.frame.count !== WEAPON_VISUAL_FRAME_COUNT ||
		!manifest.families ||
		typeof manifest.families !== 'object' ||
		Array.isArray(manifest.families)
	)
		return null
	return Object.entries(manifest.families).every(
		([id, visual]) =>
			/^\d+$/.test(id) &&
			(visual === null || isWeaponVisualFamily(visual, weaponType))
	)
		? (manifest as WeaponVisualManifest)
		: null
}

export function isAvailableWeaponVisual(
	visual: WeaponVisual
): visual is AvailableWeaponVisual {
	return visual.thumbnail !== null && visual.turntable !== null
}

export function loadWeaponVisualManifest(
	weaponType: WeaponTypeKey
): Promise<WeaponVisualManifest | null> {
	const cached = manifestCache.get(weaponType)
	if (cached) return cached

	const pending = fetch(`${weaponVisualBaseUrl()}/${weaponType}.json`)
		.then(async (response) =>
			response.ok ? parseManifest(await response.json(), weaponType) : null
		)
		.catch(() => null)
	manifestCache.set(weaponType, pending)
	return pending
}

export function getWeaponVisual(
	manifest: WeaponVisualManifest | null,
	family: number
): WeaponVisual | undefined {
	const visual = manifest?.families[String(family)]
	if (!visual) return visual ?? undefined
	return {
		thumbnail: `thumbnails/${visual.model}.webp`,
		turntable: `turntables/${visual.model}.webp`,
		sourcePage: `${KIRANICO_BASE_URL}/weapon/${visual.source}`,
	}
}

export function resolveWeaponVisualUrl(path: string): string {
	return `${weaponVisualBaseUrl()}/${path.replace(/^\/+/, '')}`
}

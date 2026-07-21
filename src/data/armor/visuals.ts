import type {ArmorGender} from './types'
import {resolveAssetUrl} from '@/data/assets'

const KIRANICO_BASE_URL = 'https://mhgu.kiranico.com'
const ARMOR_FRAME_SIZE = 270
const ARMOR_FRAME_COUNT = 15

export type ArmorVisual = {
	thumbnail: string | null
	turntable: string | null
	sourcePage?: string
}

export type AvailableArmorVisual = ArmorVisual & {
	thumbnail: string
	turntable: string
}

type ArmorVisualFamily = {
	source: string | null
	male?: string
	female?: string
}

export type ArmorVisualManifest = {
	schemaVersion: 3
	kind: 'armor'
	frame: {size: number; count: number}
	families: Record<string, ArmorVisualFamily>
}

let manifestPromise: Promise<ArmorVisualManifest | null> | undefined

function armorVisualBaseUrl(): string {
	return resolveAssetUrl('models/armor')
}

function isModelReference(value: unknown): value is string {
	return typeof value === 'string' && /^\d+\/(?:male|female)$/.test(value)
}

function isArmorVisualFamily(value: unknown): value is ArmorVisualFamily {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false
	const family = value as Partial<ArmorVisualFamily>
	return (
		(family.source === null ||
			(typeof family.source === 'string' &&
				/^[0-9a-f]+$/i.test(family.source))) &&
		(family.male === undefined || isModelReference(family.male)) &&
		(family.female === undefined || isModelReference(family.female))
	)
}

function parseManifest(value: unknown): ArmorVisualManifest | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null
	const manifest = value as Partial<ArmorVisualManifest>
	if (
		manifest.schemaVersion !== 3 ||
		manifest.kind !== 'armor' ||
		manifest.frame?.size !== ARMOR_FRAME_SIZE ||
		manifest.frame.count !== ARMOR_FRAME_COUNT ||
		!manifest.families ||
		typeof manifest.families !== 'object' ||
		Array.isArray(manifest.families)
	)
		return null
	return Object.entries(manifest.families).every(
		([id, family]) => /^\d+$/.test(id) && isArmorVisualFamily(family)
	)
		? (manifest as ArmorVisualManifest)
		: null
}

export function loadArmorVisualManifest(): Promise<ArmorVisualManifest | null> {
	manifestPromise ??= fetch(`${armorVisualBaseUrl()}/index.json`)
		.then(async (response) =>
			response.ok ? parseManifest(await response.json()) : null
		)
		.catch(() => null)
	return manifestPromise
}

export function getArmorVisual(
	manifest: ArmorVisualManifest | null,
	familyId: number,
	gender: ArmorGender
): ArmorVisual | undefined {
	const family = manifest?.families[String(familyId)]
	if (!family) return undefined
	const sourcePage = family.source
		? `${KIRANICO_BASE_URL}/armor/${family.source}`
		: undefined
	const model = family[gender]
	if (!model) return {thumbnail: null, turntable: null, sourcePage}
	return {
		thumbnail: `thumbnails/${model}.webp`,
		turntable: `turntables/${model}.webp`,
		sourcePage,
	}
}

export function isAvailableArmorVisual(
	visual?: ArmorVisual
): visual is AvailableArmorVisual {
	return Boolean(visual?.thumbnail && visual.turntable)
}

export function resolveArmorVisualUrl(path: string): string {
	return `${armorVisualBaseUrl()}/${path.replace(/^\/+/, '')}`
}

export type ItemDefinition = {
	name: string
	iconKey: string
	iconColor: string
	kiranicoPath?: string
}

export type ItemIndex = Record<string, ItemDefinition>

type ItemModule = {default: ItemIndex}

const KIRANICO_BASE_URL = 'https://mhgu.kiranico.com'

let itemIndexPromise: Promise<ItemIndex> | undefined

export function loadItemIndex(): Promise<ItemIndex> {
	itemIndexPromise ??= import('./items.json').then(
		(module: ItemModule) => module.default
	)
	return itemIndexPromise
}

export function resolveKiranicoUrl(path?: string): string | undefined {
	if (!path) return undefined
	if (!path.startsWith('/item/')) {
		throw new Error(`Invalid Kiranico item path: ${path}`)
	}
	return `${KIRANICO_BASE_URL}${path}`
}

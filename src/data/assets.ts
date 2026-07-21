export function resolveAssetUrl(path: string): string {
	const configuredBase = import.meta.env.VITE_ASSET_BASE_URL?.trim()
	const base = (configuredBase || import.meta.env.BASE_URL).replace(/\/+$/, '')
	return `${base}/${path.replace(/^\/+/, '')}`
}

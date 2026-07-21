import {resolveAssetUrl} from '@/data/assets'

export function resolveComponentIconUrl(iconKey: string): string {
	return resolveAssetUrl(`icons/components/${iconKey.replace(/^\/+/, '')}`)
}

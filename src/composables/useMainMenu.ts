import {readonly, ref} from 'vue'

const expanded = ref(false)
const useMainMenu = () => {
	function toggleMenu(to?: boolean) {
		if (to !== undefined) expanded.value = to
		else expanded.value = !expanded.value
	}
	return {expanded: readonly(expanded), toggleMenu}
}
export {useMainMenu}

<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import AppMainMenuLink from './AppMainMenuLink.vue'
import Icon from '@/components/common/AppIcon.vue'
import {useMainMenu} from '@/composables/useMainMenu'

const route = useRoute()
const activeRoute = computed(() => route.name as string)
const {expanded, toggleMenu} = useMainMenu()
const menuButton = ref<HTMLButtonElement | null>(null)
const isMobile = ref(false)
let mobileMedia: MediaQueryList | undefined
let previousBodyOverflow = ''

function closeMenu(returnFocus = false) {
	toggleMenu(false)
	if (returnFocus) void nextTick(() => menuButton.value?.focus())
}

function handleMenuClick(event: MouseEvent) {
	if ((event.target as Element | null)?.closest('a')) closeMenu()
}

function handleKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape' && expanded.value) closeMenu(true)
}

function syncBodyScroll() {
	if (!mobileMedia) return
	document.body.style.overflow =
		expanded.value && isMobile.value ? 'hidden' : previousBodyOverflow
}

function handleMediaChange(event: MediaQueryListEvent) {
	isMobile.value = event.matches
	syncBodyScroll()
}

watch(
	() => route.fullPath,
	() => closeMenu()
)
watch(expanded, syncBodyScroll)

onMounted(() => {
	previousBodyOverflow = document.body.style.overflow
	mobileMedia = window.matchMedia('(max-width: 767.98px)')
	isMobile.value = mobileMedia.matches
	mobileMedia.addEventListener('change', handleMediaChange)
	document.addEventListener('keydown', handleKeydown)
	syncBodyScroll()
})

onBeforeUnmount(() => {
	mobileMedia?.removeEventListener('change', handleMediaChange)
	document.removeEventListener('keydown', handleKeydown)
	document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
	<div class="contents md:relative md:block md:w-48">
		<button
			ref="menuButton"
			type="button"
			class="fixed left-3 top-3 z-40 grid h-11 w-11 place-items-center rounded-full border border-primary-600 bg-primary-900/95 text-contrast-800 shadow-lg backdrop-blur transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 md:hidden"
			aria-label="Open navigation menu"
			aria-controls="main-navigation"
			:aria-expanded="expanded"
			@click="toggleMenu()"
		>
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				class="h-6 w-6 fill-none stroke-current stroke-2"
			>
				<path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>

		<Transition
			enter-active-class="transition-opacity duration-200"
			enter-from-class="opacity-0"
			leave-active-class="transition-opacity duration-200"
			leave-to-class="opacity-0"
		>
			<button
				v-if="expanded"
				type="button"
				class="fixed inset-0 z-40 bg-black/60 md:hidden"
				aria-label="Close navigation menu"
				@click="closeMenu(true)"
			></button>
		</Transition>

		<nav
			id="main-navigation"
			aria-label="Main navigation"
			:aria-hidden="isMobile && !expanded"
			:inert="isMobile && !expanded"
			class="fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] transform transition-transform duration-200 ease-out md:static md:z-auto md:h-full md:w-48 md:translate-x-0"
			:class="expanded ? 'translate-x-0' : '-translate-x-full'"
			@click="handleMenuClick"
		>
			<div
				class="grid h-full w-full grid-rows-[auto_1fr_auto] overflow-x-hidden overflow-y-auto bg-primary-900 py-2 shadow-lg"
				style="transition: width 0.2s ease-out"
			>
				<div class="mb-4 flex items-center justify-between gap-2 px-2">
					<router-link
						:to="{name: 'Home'}"
						class="group flex cursor-pointer select-none items-center gap-2"
					>
						<img src="/favicon.ico" alt="Logo" class="h-8 w-8" />
						<h1
							class="text-lg font-bold tracking-wider transition-colors group-hover:text-accent-400"
						>
							MHGUTree
						</h1>
					</router-link>
					<button
						type="button"
						class="grid h-10 w-10 shrink-0 place-items-center rounded-md text-primary-300 transition-colors hover:bg-primary-800 hover:text-white focus-visible:outline-2 focus-visible:outline-accent-400 md:hidden"
						aria-label="Close navigation menu"
						@click="closeMenu(true)"
					>
						<svg
							viewBox="0 0 24 24"
							aria-hidden="true"
							class="h-6 w-6 fill-none stroke-current stroke-2"
						>
							<path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
						</svg>
					</button>
				</div>
				<div>
					<AppMainMenuLink
						label="Armor"
						image-src="armor.png"
						route-name="Armor"
						:active="activeRoute === 'Armor'"
					/>
					<!-- <AppMainMenuLink
					label="Home"
					icon="material-symbols:home"
					route-name="Home"
					:active="activeRoute === 'Home'"
				/> -->
					<div class="w-full h-px bg-primary-500 mb-2"></div>
					<AppMainMenuLink
						label="Sword & Shield"
						image-src="weapon-types/sns.png"
						route-name="Sword"
						:active="activeRoute === 'Sword'"
					/>
					<AppMainMenuLink
						label="Dualblades"
						image-src="weapon-types/db.png"
						route-name="Dualblades"
						:active="activeRoute === 'Dualblades'"
					/>
					<AppMainMenuLink
						label="Greatsword"
						image-src="weapon-types/gs.png"
						route-name="Greatsword"
						:active="activeRoute === 'Greatsword'"
					/>
					<AppMainMenuLink
						label="Longsword"
						image-src="weapon-types/ls.png"
						route-name="Longsword"
						:active="activeRoute === 'Longsword'"
					/>
					<AppMainMenuLink
						label="Hammer"
						image-src="weapon-types/h.png"
						route-name="Hammer"
						:active="activeRoute === 'Hammer'"
					/>
					<AppMainMenuLink
						label="Hunting Horn"
						image-src="weapon-types/hh.png"
						route-name="Horn"
						:active="activeRoute === 'Horn'"
					/>
					<AppMainMenuLink
						label="Lance"
						image-src="weapon-types/l.png"
						route-name="Lance"
						:active="activeRoute === 'Lance'"
					/>
					<AppMainMenuLink
						label="Gunlance"
						image-src="weapon-types/gl.png"
						route-name="Gunlance"
						:active="activeRoute === 'Gunlance'"
					/>
					<AppMainMenuLink
						label="Chargeblade"
						image-src="weapon-types/cb.png"
						route-name="Chargeblade"
						:active="activeRoute === 'Chargeblade'"
					/>
					<AppMainMenuLink
						label="Switchaxe"
						image-src="weapon-types/sa.png"
						route-name="Switchaxe"
						:active="activeRoute === 'Switchaxe'"
					/>
					<AppMainMenuLink
						label="Insect Glaive"
						image-src="weapon-types/ig.png"
						route-name="glaive"
						:active="activeRoute === 'glaive'"
					/>
					<div class="w-full h-px bg-primary-500 my-2"></div>
					<AppMainMenuLink
						label="Light Bowgun"
						image-src="weapon-types/lbg.png"
						route-name="Lightbowgun"
						:active="activeRoute === 'Lightbowgun'"
					/>
					<AppMainMenuLink
						label="Heavy Bowgun"
						image-src="weapon-types/hbg.png"
						route-name="Heavybowgun"
						:active="activeRoute === 'Heavybowgun'"
					/>
					<AppMainMenuLink
						label="Bow"
						image-src="weapon-types/b.png"
						route-name="Bow"
						:active="activeRoute === 'Bow'"
					/>
				</div>
				<div class="pt-4">
					<AppMainMenuLink
						label="About"
						icon="material-symbols:chat-info-rounded"
						route-name="About"
						:active="activeRoute === 'About'"
					/>
					<div class="flex gap-3 items-center justify-center mt-3">
						<a
							href="https://github.com/MistereoSC/MHGUTree-Revamped"
							target="_blank"
							class="text-primary-400 hover:text-purple-400 transition-colors"
							title="GitHub"
						>
							<Icon icon="mdi:github" class="w-7 h-7" />
						</a>
						<a
							href="https://ko-fi.com/mistereosc"
							target="_blank"
							class="text-primary-400 hover:text-red-300 transition-colors"
							title="Ko-Fi"
						>
							<Icon icon="mdi:coffee" class="w-7 h-7" />
						</a>
					</div>
				</div>
			</div>
		</nav>
	</div>
</template>

<style scoped></style>

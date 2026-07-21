<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'

const props = withDefaults(
	defineProps<{
		turntableUrl: string
		thumbnailUrl: string
		name: string
		frameSize?: number
		frameCount?: number
	}>(),
	{frameSize: 270, frameCount: 15}
)

const currentFrame = ref(0)
const turntableLoaded = ref(false)
const turntableFailed = ref(false)
const zoom = ref(1)
const zoomOffsetX = ref(0)
const zoomOffsetY = ref(0)
const ROTATION_PIXELS_PER_FRAME = 4
const AUTO_ROTATION_INTERVAL_MS = 240
const AUTO_ROTATION_RESUME_DELAY_MS = 500
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_SENSITIVITY = 0.0015
type PointerPosition = {x: number; y: number}
const activePointers = new Map<number, PointerPosition>()
let dragging = false
let lastPointerX = 0
let pendingDragDistance = 0
let suppressSinglePointer = false
let pinchStartDistance = 0
let pinchStartZoom = MIN_ZOOM
let pinchContentX = 0
let pinchContentY = 0
let autoRotationTimer: number | undefined
let autoRotationResumeTimer: number | undefined
let reducedMotionQuery: MediaQueryList | undefined

function normalizeFrame(frame: number): number {
	return (frame + props.frameCount) % props.frameCount
}

function stepFrame(delta: number): void {
	currentFrame.value = normalizeFrame(currentFrame.value + delta)
}

function stopAutoRotation(): void {
	if (autoRotationTimer !== undefined) {
		window.clearInterval(autoRotationTimer)
		autoRotationTimer = undefined
	}
}

function clearAutoRotationResume(): void {
	if (autoRotationResumeTimer !== undefined) {
		window.clearTimeout(autoRotationResumeTimer)
		autoRotationResumeTimer = undefined
	}
}

function startAutoRotation(): void {
	clearAutoRotationResume()
	if (
		autoRotationTimer !== undefined ||
		!turntableLoaded.value ||
		turntableFailed.value ||
		activePointers.size > 0 ||
		reducedMotionQuery?.matches
	)
		return
	autoRotationTimer = window.setInterval(
		() => stepFrame(1),
		AUTO_ROTATION_INTERVAL_MS
	)
}

function pauseAutoRotation(): void {
	stopAutoRotation()
	clearAutoRotationResume()
}

function resumeAutoRotationLater(): void {
	pauseAutoRotation()
	if (activePointers.size > 0 || reducedMotionQuery?.matches) return
	autoRotationResumeTimer = window.setTimeout(
		startAutoRotation,
		AUTO_ROTATION_RESUME_DELAY_MS
	)
}

function onReducedMotionChange(): void {
	if (reducedMotionQuery?.matches) pauseAutoRotation()
	else startAutoRotation()
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

function onWheel(event: WheelEvent): void {
	pauseAutoRotation()
	const viewer = event.currentTarget as HTMLElement
	const rect = viewer.getBoundingClientRect()
	const pointerX = event.clientX - rect.left
	const pointerY = event.clientY - rect.top
	const previousZoom = zoom.value
	const nextZoom = clamp(
		previousZoom * Math.exp(-event.deltaY * ZOOM_SENSITIVITY),
		MIN_ZOOM,
		MAX_ZOOM
	)
	const contentX = (pointerX - zoomOffsetX.value) / previousZoom
	const contentY = (pointerY - zoomOffsetY.value) / previousZoom
	zoomOffsetX.value = clamp(
		pointerX - contentX * nextZoom,
		rect.width * (1 - nextZoom),
		0
	)
	zoomOffsetY.value = clamp(
		pointerY - contentY * nextZoom,
		rect.height * (1 - nextZoom),
		0
	)
	zoom.value = nextZoom
	resumeAutoRotationLater()
}

function startPinch(viewer: HTMLElement): void {
	const [first, second] = [...activePointers.values()]
	if (!first || !second) return
	const rect = viewer.getBoundingClientRect()
	const midpointX = (first.x + second.x) / 2 - rect.left
	const midpointY = (first.y + second.y) / 2 - rect.top
	pinchStartDistance = Math.max(
		1,
		Math.hypot(second.x - first.x, second.y - first.y)
	)
	pinchStartZoom = zoom.value
	pinchContentX = (midpointX - zoomOffsetX.value) / zoom.value
	pinchContentY = (midpointY - zoomOffsetY.value) / zoom.value
	dragging = false
	pendingDragDistance = 0
	suppressSinglePointer = true
}

function updatePinch(viewer: HTMLElement): void {
	const [first, second] = [...activePointers.values()]
	if (!first || !second) return
	const rect = viewer.getBoundingClientRect()
	const midpointX = (first.x + second.x) / 2 - rect.left
	const midpointY = (first.y + second.y) / 2 - rect.top
	const distance = Math.max(
		1,
		Math.hypot(second.x - first.x, second.y - first.y)
	)
	const nextZoom = clamp(
		pinchStartZoom * (distance / pinchStartDistance),
		MIN_ZOOM,
		MAX_ZOOM
	)
	zoomOffsetX.value = clamp(
		midpointX - pinchContentX * nextZoom,
		rect.width * (1 - nextZoom),
		0
	)
	zoomOffsetY.value = clamp(
		midpointY - pinchContentY * nextZoom,
		rect.height * (1 - nextZoom),
		0
	)
	zoom.value = nextZoom
}

function onPointerDown(event: PointerEvent): void {
	if (event.pointerType === 'mouse' && event.button !== 0) return
	event.preventDefault()
	pauseAutoRotation()
	const viewer = event.currentTarget as HTMLElement
	activePointers.set(event.pointerId, {x: event.clientX, y: event.clientY})
	viewer.setPointerCapture(event.pointerId)
	if (activePointers.size >= 2) {
		startPinch(viewer)
		return
	}
	suppressSinglePointer = false
	dragging = true
	lastPointerX = event.clientX
	pendingDragDistance = 0
}

function onPointerMove(event: PointerEvent): void {
	if (!activePointers.has(event.pointerId)) return
	event.preventDefault()
	activePointers.set(event.pointerId, {x: event.clientX, y: event.clientY})
	if (activePointers.size >= 2) {
		updatePinch(event.currentTarget as HTMLElement)
		return
	}
	if (!dragging || suppressSinglePointer) return
	pendingDragDistance += lastPointerX - event.clientX
	lastPointerX = event.clientX
	const frameDelta = Math.trunc(pendingDragDistance / ROTATION_PIXELS_PER_FRAME)
	if (frameDelta === 0) return
	currentFrame.value = normalizeFrame(currentFrame.value + frameDelta)
	pendingDragDistance -= frameDelta * ROTATION_PIXELS_PER_FRAME
}

function onPointerEnd(event: PointerEvent): void {
	const viewer = event.currentTarget as HTMLElement
	activePointers.delete(event.pointerId)
	if (viewer.hasPointerCapture(event.pointerId))
		viewer.releasePointerCapture(event.pointerId)
	if (activePointers.size >= 2) {
		startPinch(viewer)
		return
	}
	dragging = false
	pendingDragDistance = 0
	if (activePointers.size === 0) {
		suppressSinglePointer = false
		resumeAutoRotationLater()
	}
}

function onViewerKeydown(event: KeyboardEvent): void {
	if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
		event.preventDefault()
		pauseAutoRotation()
		stepFrame(event.key === 'ArrowLeft' ? -1 : 1)
		resumeAutoRotationLater()
	}
}

function onTurntableLoad(): void {
	turntableLoaded.value = true
	turntableFailed.value = false
	startAutoRotation()
}

function onTurntableError(): void {
	turntableFailed.value = true
	stopAutoRotation()
}

watch(
	() => props.turntableUrl,
	() => {
		pauseAutoRotation()
		currentFrame.value = 0
		turntableLoaded.value = false
		turntableFailed.value = false
		zoom.value = MIN_ZOOM
		zoomOffsetX.value = 0
		zoomOffsetY.value = 0
		activePointers.clear()
		dragging = false
		pendingDragDistance = 0
		suppressSinglePointer = false
		pinchStartDistance = 0
		pinchStartZoom = MIN_ZOOM
	}
)

onMounted(() => {
	reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
	reducedMotionQuery.addEventListener('change', onReducedMotionChange)
	onReducedMotionChange()
})

onBeforeUnmount(() => {
	pauseAutoRotation()
	reducedMotionQuery?.removeEventListener('change', onReducedMotionChange)
})
</script>

<template>
	<div
		class="relative mx-auto cursor-grab touch-none select-none overflow-hidden rounded-lg bg-primary-900 outline-none ring-secondary-400 active:cursor-grabbing focus-visible:ring-2"
		:style="{width: `${frameSize}px`, height: `${frameSize}px`}"
		tabindex="0"
		role="img"
		:aria-label="`${name} interactive turntable, frame ${currentFrame + 1} of ${frameCount}`"
		@keydown="onViewerKeydown"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerEnd"
		@pointercancel="onPointerEnd"
		@wheel.prevent="onWheel"
		@dragstart.prevent
	>
		<div
			class="absolute inset-0 origin-top-left"
			:style="{
				transform: `translate3d(${zoomOffsetX}px, ${zoomOffsetY}px, 0) scale(${zoom})`,
			}"
		>
			<img
				:src="thumbnailUrl"
				alt=""
				class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain p-5 transition-opacity"
				:class="{'opacity-0': turntableLoaded}"
				:draggable="false"
				aria-hidden="true"
			/>
			<img
				:key="turntableUrl"
				:src="turntableUrl"
				alt=""
				class="pointer-events-none absolute left-0 top-0 max-w-none transition-opacity"
				:class="turntableLoaded ? 'opacity-100' : 'opacity-0'"
				:width="frameSize"
				:height="frameSize * frameCount"
				:style="{transform: `translateY(-${currentFrame * frameSize}px)`}"
				:draggable="false"
				aria-hidden="true"
				@load="onTurntableLoad"
				@error="onTurntableError"
			/>
		</div>
		<div
			v-if="!turntableLoaded && !turntableFailed"
			class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-primary-950/80 px-2 py-1 text-xs text-primary-300"
		>
			Loading turntable…
		</div>
		<div
			v-if="turntableFailed"
			class="absolute inset-x-3 bottom-3 rounded bg-red-950/90 px-3 py-2 text-center text-xs text-red-200"
		>
			Could not load the turntable.
		</div>
	</div>
</template>

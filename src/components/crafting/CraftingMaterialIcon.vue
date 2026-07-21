<script setup lang="ts">
import {computed, useId} from 'vue'
import {resolveComponentIconUrl} from '@/data/crafting/assets'

interface IProps {
	iconKey: string
	color: string
}

const props = defineProps<IProps>()

const filterId = `crafting-material-color-${useId().replace(/:/g, '')}`

function colorSlope(offset: number): number {
	const normalized = props.color.replace(/^#/, '')
	return Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255
}

const redSlope = computed(() => colorSlope(0))
const greenSlope = computed(() => colorSlope(2))
const blueSlope = computed(() => colorSlope(4))
</script>

<template>
	<svg viewBox="0 0 100 100" aria-hidden="true">
		<defs>
			<filter
				:id="filterId"
				x="0"
				y="0"
				width="100%"
				height="100%"
				color-interpolation-filters="sRGB"
			>
				<feComponentTransfer>
					<feFuncR type="linear" :slope="redSlope" />
					<feFuncG type="linear" :slope="greenSlope" />
					<feFuncB type="linear" :slope="blueSlope" />
					<feFuncA type="identity" />
				</feComponentTransfer>
			</filter>
		</defs>
		<image
			:href="resolveComponentIconUrl(iconKey)"
			width="100"
			height="100"
			preserveAspectRatio="xMidYMid meet"
			:filter="`url(#${filterId})`"
		/>
	</svg>
</template>

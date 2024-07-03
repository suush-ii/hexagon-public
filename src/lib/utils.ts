import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatCompactNumber(number: number, compact: boolean = true) {
	return Intl.NumberFormat('en', { notation: compact ? 'compact' : 'standard' }).format(number)
}

type FlyAndScaleParams = {
	y?: number
	x?: number
	start?: number
	duration?: number
}

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node)
	const transform = style.transform === 'none' ? '' : style.transform

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA
		const [minB, maxB] = scaleB

		const percentage = (valueA - minA) / (maxA - minA)
		const valueB = percentage * (maxB - minB) + minB

		return valueB
	}

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str
			return str + `${key}:${style[key]};`
		}, '')
	}

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			})
		},
		easing: cubicOut
	}
}

export function slugify(text: String) {
	return text
		.toString()
		.normalize('NFD') // split an accented letter in the base letter and the acent
		.replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-')
}
// https://gist.github.com/codeguy/6684588?permalink_comment_id=3332719#gistcomment-3332719

export const stateOutlineMap = {
	online: 'outline-blue-500',
	game: 'outline-success',
	studio: 'outline-orange',
	offline: 'outline-muted-foreground/70'
}

export const stateBackgroundMap = {
	online: 'bg-blue-500',
	game: 'bg-success',
	studio: 'bg-orange',
	offline: 'bg-destructive'
}

export const stateTextMap = {
	online: 'text-blue-500',
	game: 'text-success',
	studio: 'text-orange',
	offline: 'text-muted-foreground/70'
}

export function getPageNumber(url: URL, query?: string, count?: number) {
	let page = Number(url.searchParams.get(query ?? 'page') ?? 1)

	if (page < 1) {
		page = 1
	}

	return page
}

export function depluralize(str: string) {
	return str.toLowerCase() === 'pants'
		? str
		: str.toLowerCase() === 'audio'
			? str
			: str.slice(0, -1)
}

import { goto } from '$app/navigation'
import type { LocaleCode } from './locales'

export function changeLocale(locale: LocaleCode, url: URL) {
	setLocaleCookie(locale)

	goto(url, { invalidateAll: true }) // SvelteKit method
}

function setLocaleCookie(locale: LocaleCode) {
	const HUNDRED_YEARS = 60 * 60 * 24 * 365 * 100 // seconds * minutes * hours * days * years
	document.cookie = `locale=${locale}; max-age=${HUNDRED_YEARS}; path=/; samesite=strict`
}

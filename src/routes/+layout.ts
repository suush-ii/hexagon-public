import type { LayoutLoad } from './$types'
import { getSupportedLocale } from '$lib/poly-i18n/locales'
import { getTranslator } from '$lib/poly-i18n'

export const load: LayoutLoad = async ({ data, url: { searchParams } }) => {
	const urlLocale = searchParams.get('lang')
	const locale = getSupportedLocale(urlLocale || data.chosenLocale || data.acceptedLanguage)
	const t = await getTranslator(locale)
	return { locale, t, ...data }
}

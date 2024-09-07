export enum Locales {
	en = 'English',
	es = 'Español',
	pt_br = 'Português (Brasil)',
	ru = 'Русский'
}

export type LocaleCode = keyof typeof Locales

export function getSupportedLocale(userLocale: string | undefined): LocaleCode {
	const locale = Object.keys(Locales).find((supportedLocale) => {
		return userLocale?.includes(supportedLocale)
	}) as LocaleCode | undefined
	return locale || 'en' // 👈 default to English if no match
}

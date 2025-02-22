import { writable, type Writable } from 'svelte/store'
import { dev } from '$app/environment'

export const appName: string = 'Hexagon'
export const s3BucketName: string = appName.toLocaleLowerCase() //+ (dev === true ? 'dev' : '') // TODO: when  prod ready this should prob be enabled but im too lazy to do it rn lel
export const s3Url: string = 'cdn.hexagon.pw' // should be a url where your s3 bucket is accessible
//https://wsrv.nl/docs/ you can use this for resizing etc...
console.log(
	'\u001b[1;33m + ' +
		'Appname equals ' +
		appName +
		'\nUsing s3 bucket... ' +
		s3BucketName +
		"\nYou probably shouldn't paste here... (◕‿◕)" +
		'\u001b[0m'
)
export const currencyName: string = 'Moon'
export const currencyNamePlural: string = 'Moons'
export const pageName = writable()

interface Image {
	url: string
	type: string
	assetid: number
	asset: string
	time: Date
}

export const loadedImages: Writable<Image[]> = writable([])

export function localStorageStore(key: string, initial: string) {
	if (!localStorage) {
		console.log('localStorage not available')
		return writable(initial)
	}

	const value = localStorage.getItem(key)
	const store = writable(value == null ? initial : value)
	store.subscribe((v) => localStorage.setItem(key, v))

	return store
}

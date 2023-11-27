import { writable } from 'svelte/store'
import { dev } from '$app/environment'

export const appName: string = 'Hexagon'
export const s3BucketName: string = appName.toLocaleLowerCase() //+ (dev === true ? 'dev' : '') // TODO: when  prod ready this should prob be enabled but im too lazy to do it rn lel
export const s3Url: string = 'finobe.xyz' // should be a url where your s3 bucket is accessible
//https://wsrv.nl/docs/ you can use this for resizing etc...
console.log(
	'\u001b[1;33m + ' +
		'Appname equals ' +
		appName +
		'\nUsing s3 bucket... ' +
		s3BucketName +
		'\u001b[0m'
)
export const currencyName: string = 'Moon'
export const currencyNamePlural: string = 'Moons'
export const pageName = writable()

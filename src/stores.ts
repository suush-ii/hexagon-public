import { writable } from 'svelte/store';

export const appName: string = 'Hexagon';
export const currencyName: string = "Triangle"
export let pageName = writable();

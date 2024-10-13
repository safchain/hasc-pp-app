import { writable, readonly } from 'svelte/store';

let token = '';

if (typeof localStorage !== 'undefined') {
	token = localStorage.token;
}

export const WritableTokenStore = writable(token);
WritableTokenStore.subscribe((value) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.token = value;
	}
});

export const ReadableTokenStore = readonly(WritableTokenStore);

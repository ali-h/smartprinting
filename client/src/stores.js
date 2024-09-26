import { writable } from 'svelte/store';

export const loading = writable(false);
export const showcontent = writable(false);
export const API_URL = writable('http://192.168.100.2:3000');
export const isLoggedIn = writable(false);
export const name = writable(null);
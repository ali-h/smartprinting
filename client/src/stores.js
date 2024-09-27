import { writable } from 'svelte/store';

export const loading = writable(false);
export const showcontent = writable(false);
export const API_URL = writable('http://192.168.100.2:3000');
export const isLoggedIn = writable(false);
export const name = writable(null);

export const updateTrigger = writable(0);
export const pingTrigger = writable(0);

export function triggerUpdate() {
  updateTrigger.update(n => n + 1);
}

export function triggerPing() {
  pingTrigger.update(n => n + 1);
}

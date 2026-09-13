<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { locales, overwriteGetLocale, type Locale } from '#lib/i18n/generated/runtime.js';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
	let locale = $state<Locale>('en');
	// Match the prerender during hydration, then react to this device's preferred language.
	overwriteGetLocale(() => locale);
	onMount(() => {
		locale =
			navigator.languages
				.map((language) => language.toLowerCase().split('-')[0])
				.find((language): language is Locale =>
					locales.some((supported) => supported === language)
				) ?? 'en';
		document.documentElement.lang = locale;
	});
</script>

{@render children()}

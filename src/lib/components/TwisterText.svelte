<script lang="ts">
	import type { Twister } from '#lib/catalog.ts';
	let { twister }: { twister: Twister } = $props();
	const length = $derived(twister.text.length);
</script>

<p
	lang={twister.language.id}
	class:short={length < 65}
	class:medium={length >= 65 && length < 170}
	class:long={length >= 170 && length < 320}
	class:very-long={length >= 320}
>
	{twister.text}
</p>

<style>
	p {
		margin: auto 0;
		font-weight: 500;
		line-height: 1.48;
		text-align: center;
		white-space: pre-line;
		overflow-wrap: anywhere;
		text-wrap: pretty;
	}
	/* `balance` evens the ragged edges of centred display text. Browsers stop applying it
	   past a handful of lines, so the longer sizes stay on `pretty`. */
	.short,
	.medium {
		text-wrap: balance;
	}
	/* Reciting depends on telling letters apart at a glance, so tracking tightens only as far
	   as the largest sizes need to hold together, and relaxes as the text shrinks. */
	.short {
		font-size: clamp(2rem, 5vw, 3.25rem);
		line-height: 1.3;
		letter-spacing: -0.012em;
	}
	.medium {
		font-size: clamp(1.65rem, 3.6vw, 2.5rem);
		letter-spacing: -0.01em;
	}
	.long {
		font-size: clamp(1.3rem, 2.7vw, 1.85rem);
		letter-spacing: -0.005em;
	}
	.very-long {
		font-size: clamp(1.125rem, 2.2vw, 1.45rem);
		line-height: 1.6;
	}
	@media (max-width: 380px) {
		.short {
			font-size: 1.85rem;
		}
		.medium {
			font-size: 1.5rem;
		}
	}
</style>

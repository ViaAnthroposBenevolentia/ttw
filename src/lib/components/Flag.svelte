<script lang="ts">
	import type { Language } from '#lib/catalog.ts';
	let { language, size = 30 }: { language: Language; size?: number } = $props();
</script>

<span class="flag" style:width={`${size}px`} style:height={`${size}px`} aria-hidden="true">
	<img src={language.flag} alt="" width={size} height={size} draggable="false" />
</span>

<style>
	.flag {
		display: inline-flex;
		flex: none;
		overflow: hidden;
		border-radius: 50%;
		background: #28252d;
		box-shadow: 0 0 0 1px #ffffff20;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>

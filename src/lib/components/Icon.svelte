<script lang="ts">
	type Name =
		| 'arrow-left'
		| 'arrow-right'
		| 'chevron'
		| 'chevron-left'
		| 'chevron-right'
		| 'check'
		| 'star'
		| 'globe'
		| 'speaker'
		| 'stop'
		| 'shuffle';
	let {
		name,
		size = 20,
		filled = false,
		class: className
	}: { name: Name; size?: number; filled?: boolean; class?: string } = $props();
	const paths: Record<Name, string> = {
		'arrow-left': 'M19 12H5m7-7-7 7 7 7',
		'arrow-right': 'M5 12h14m-7-7 7 7-7 7',
		chevron: 'm6 9 6 6 6-6',
		'chevron-left': 'm15 6-6 6 6 6',
		'chevron-right': 'm9 6 6 6-6 6',
		check: 'm5 12 4 4L19 6',
		star: 'm12 3 2.78 5.63L21 9.54l-4.5 4.38 1.06 6.19L12 17.19l-5.56 2.92 1.06-6.19L3 9.54l6.22-.91L12 3Z',
		globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z',
		speaker: 'm11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
		stop: 'M7 7h10v10H7Z',
		shuffle:
			'M3 7h3c5 0 7 10 12 10h3m-4-4 4 4-4 4M3 17h3c2 0 3.5-1.6 5-4M14 9c1.2-1.2 2.4-2 4-2h3m-4-4 4 4-4 4'
	};
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={filled ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width="1.7"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={paths[name]} />
</svg>

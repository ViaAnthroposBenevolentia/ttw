<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { m } from '#lib/i18n/generated/messages.js';
	import type { Twister } from '#lib/catalog.ts';
	import Icon from './Icon.svelte';
	import Flag from './Flag.svelte';
	import TwisterText from './TwisterText.svelte';

	let {
		twister,
		canSpeak,
		speaking,
		onNavigate,
		onSpeak
	}: {
		twister: Twister;
		canSpeak: boolean;
		speaking: boolean;
		onNavigate: (direction: -1 | 1) => void;
		onSpeak: () => void;
	} = $props();

	let layer: HTMLDivElement;
	let nearCard: HTMLDivElement;
	let farCard: HTMLDivElement;
	let textArea: HTMLDivElement;
	let outgoing = $state<{
		twister: Twister;
		direction: number;
		sequence: number;
	} | null>(null);
	let gesture: {
		id: number;
		x: number;
		y: number;
		started: number;
	} | null = null;
	let suppressClick = false;
	let animations: Animation[] = [];
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let sequence = 0;
	const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const stopAnimations = () => {
		for (const animation of animations) animation.cancel();
		animations = [];
	};

	/** Commit immediately so quick repeated taps never lose a navigation action. */
	export const advance = async (direction: -1 | 1) => {
		const nextSequence = ++sequence;
		stopAnimations();
		clearTimeout(timeout);
		outgoing = reducedMotion() ? null : { twister, direction: -direction, sequence: nextSequence };
		onNavigate(direction);
		await tick();
		if (nextSequence !== sequence) return;
		textArea.scrollTop = 0;
		if (!reducedMotion()) {
			const timing = { duration: 300, easing: 'cubic-bezier(.16, 1, .3, 1)' };
			// Each visible layer takes the place of the card immediately ahead of it.
			animations = [
				layer.animate(
					[
						{ transform: 'var(--near-card)', opacity: 1 },
						{ transform: 'none', opacity: 1 }
					],
					timing
				),
				nearCard.animate(
					[
						{ transform: 'var(--far-card)', opacity: 0.65, background: '#211e28' },
						{ transform: 'var(--near-card)', opacity: 1, background: '#27232f' }
					],
					timing
				),
				farCard.animate([{ opacity: 0 }, { opacity: 0.65 }], timing)
			];
		}
		timeout = setTimeout(() => {
			outgoing = null;
		}, 320);
	};

	// Ignore drags and long presses so only deliberate taps activate the card.
	const onPointerDown = (event: PointerEvent) => {
		suppressClick = false;
		if (!event.isPrimary || event.button !== 0) return;
		gesture = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			started: performance.now()
		};
	};
	const onPointerMove = (event: PointerEvent) => {
		if (!gesture || gesture.id !== event.pointerId) return;
		if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 9) {
			suppressClick = true;
		}
	};
	const onPointerUp = (event: PointerEvent) => {
		if (!gesture || gesture.id !== event.pointerId) return;
		onPointerMove(event);
		if (performance.now() - gesture.started > 500) suppressClick = true;
		gesture = null;
	};
	const onPointerCancel = () => {
		suppressClick = true;
		gesture = null;
	};
	const onClick = () => {
		if (suppressClick) {
			suppressClick = false;
			return;
		}
		if (window.getSelection()?.toString()) return;
		void advance(1);
	};
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			void advance(1);
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault();
			textArea.scrollBy({ top: event.key === 'ArrowDown' ? 70 : -70 });
		} else if (event.key === 'PageDown' || event.key === 'PageUp') {
			event.preventDefault();
			textArea.scrollBy({ top: textArea.clientHeight * (event.key === 'PageDown' ? 1 : -1) });
		}
	};

	$effect(() => {
		// A language change can replace the card without going through advance().
		void twister.id;
		if (textArea) textArea.scrollTop = 0;
		gesture = null;
	});
	onDestroy(() => {
		sequence++;
		clearTimeout(timeout);
		stopAnimations();
	});
</script>

<div class="deck-stage">
	<div class="back-card back-card-far" bind:this={farCard} aria-hidden="true"></div>
	<div class="back-card back-card-near" bind:this={nearCard} aria-hidden="true"></div>
	<div class="current-layer" bind:this={layer}>
		<div
			class="card-face"
			role="button"
			tabindex="0"
			aria-describedby="card-help"
			onclick={onClick}
			onkeydown={onKeyDown}
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerCancel}
		>
			<div class="twister-scroll" bind:this={textArea}><TwisterText {twister} /></div>
			<div class="card-language">
				<Flag language={twister.language} size={21} /><span>{twister.language.name}</span>
			</div>
		</div>
		{#if canSpeak}
			<button
				class="speaker"
				class:playing={speaking}
				onclick={onSpeak}
				aria-label={speaking ? m.stop() : m.play()}
				title={speaking ? m.stop() : m.play()}
			>
				<Icon name={speaking ? 'stop' : 'speaker'} size={20} />
			</button>
		{/if}
	</div>
	{#if outgoing}
		{#key outgoing.sequence}
			<div
				class="outgoing card-face"
				aria-hidden="true"
				style:--exit-x={`${outgoing.direction * 115}%`}
				style:--exit-rotation={`${outgoing.direction * 17}deg`}
			>
				<div class="twister-scroll"><TwisterText twister={outgoing.twister} /></div>
				<div class="card-language">
					<Flag language={outgoing.twister.language} size={21} /><span
						>{outgoing.twister.language.name}</span
					>
				</div>
			</div>
		{/key}
	{/if}
</div>
<p id="card-help" class="sr-only">{m.card_help()}</p>

<style>
	.deck-stage {
		--near-card: translateY(10px) scale(0.97) rotate(1deg);
		--far-card: translateY(19px) scale(0.935) rotate(-1.7deg);
		position: relative;
		width: 100%;
		height: 100%;
		isolation: isolate;
	}
	.back-card {
		position: absolute;
		inset: 0;
		border: 1px solid #ffffff09;
		border-radius: var(--card-radius);
		background: #211e28;
		pointer-events: none;
	}
	.back-card-far {
		transform: var(--far-card);
		opacity: 0.65;
	}
	.back-card-near {
		transform: var(--near-card);
		background: #27232f;
	}
	.current-layer {
		position: absolute;
		inset: 0;
	}
	.card-face {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		padding: 70px 46px 27px;
		border-radius: var(--card-radius);
		background: linear-gradient(145deg, #25212d 0%, #201d27 64%, #211e29 100%);
		border: 1px solid #ffffff12;
		box-shadow:
			0 20px 60px #0002,
			inset 0 1px #ffffff03;
		touch-action: manipulation;
		cursor: pointer;
	}
	.card-face:focus-visible {
		outline-offset: 6px;
	}
	.twister-scroll {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior-y: contain;
		scrollbar-width: none;
		padding: 8px 0 24px;
	}
	.twister-scroll::-webkit-scrollbar {
		display: none;
	}
	.card-language {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 9px;
		padding-top: 18px;
		flex: none;
		color: var(--muted);
		font-size: 12px;
		letter-spacing: 0.025em;
	}
	.speaker {
		position: absolute;
		top: 19px;
		right: 20px;
		display: grid;
		place-items: center;
		width: 43px;
		height: 43px;
		border: 1px solid #ffffff10;
		border-radius: 50%;
		color: #b8afc5;
		background: #ffffff03;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.speaker:hover,
	.speaker.playing {
		background: #b8a0ee18;
		color: var(--accent);
		border-color: #b8a0ee30;
	}
	.outgoing {
		pointer-events: none;
		z-index: 3;
		animation: card-exit 0.3s cubic-bezier(0.3, 0.05, 0.7, 0.5) forwards;
	}
	@keyframes card-exit {
		from {
			transform: none;
			opacity: 1;
		}
		to {
			transform: translate(var(--exit-x), 35px) rotate(var(--exit-rotation));
			opacity: 0;
		}
	}
	@media (max-width: 600px) {
		.card-face {
			padding: 66px 27px 23px;
		}
		.speaker {
			right: 16px;
			top: 16px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.outgoing {
			animation: none;
			display: none;
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '#lib/i18n/generated/messages.js';
	import {
		currentTwister,
		move,
		restoreDeck,
		saveDeck,
		toggleLanguage,
		togglePin,
		type Deck
	} from '#lib/deck.ts';
	import type { LanguageId } from '#lib/catalog.ts';
	import { createSpeech } from '#lib/speech.svelte.ts';
	import LanguagePicker from '#lib/components/LanguagePicker.svelte';
	import TwisterCard from '#lib/components/TwisterCard.svelte';
	import Icon from '#lib/components/Icon.svelte';

	let deck = $state<Deck>({ version: 1, selected: [], pinned: [], order: [], index: 0 });
	let ready = $state(false);
	let pickerOpen = $state(false);
	let card: TwisterCard | undefined = $state();
	const current = $derived(currentTwister(deck));
	const speech = createSpeech();

	onMount(() => {
		deck = restoreDeck();
		ready = true;
	});
	$effect(() => {
		if (ready) saveDeck(deck);
	});
	const selectLanguage = (id: LanguageId) => {
		speech.stop();
		deck = toggleLanguage(deck, id);
	};
	const navigate = (direction: -1 | 1) => {
		speech.stop();
		deck = move(deck, direction);
	};
</script>

<svelte:head>
	<title>{m.app_title()}</title>
	<meta name="description" content={m.app_description()} />
</svelte:head>

<div class="app-shell">
	<header class="app-header">
		<div class="brand" aria-label="ttw">
			<span class="wordmark" aria-hidden="true"><span>t</span>tw</span>
		</div>
		{#if ready}
			<LanguagePicker
				selected={deck.selected}
				pinned={deck.pinned}
				bind:open={pickerOpen}
				onSelect={selectLanguage}
				onPin={(id) => {
					deck = togglePin(deck, id);
				}}
			/>
		{/if}
	</header>

	<main class="practice">
		<noscript>{m.no_script()}</noscript>
		<h1 class="sr-only">{m.app_title()}</h1>
		<div class="card-space">
			{#if current}
				<TwisterCard
					bind:this={card}
					twister={current}
					canSpeak={!!speech.voiceFor(current.language)}
					speaking={speech.speaking === current.id}
					onNavigate={navigate}
					onSpeak={() => speech.play(current)}
				/>
			{:else if ready}
				<button
					class="empty-card"
					onclick={() => {
						pickerOpen = true;
					}}
				>
					<span class="empty-symbol"><Icon name="globe" size={36} /></span>
					<span class="empty-title">{m.empty_title()}</span>
					<span class="empty-description">{m.empty_description()}</span>
					<span class="empty-action">{m.empty_action()} <Icon name="arrow-right" size={17} /></span>
				</button>
			{:else}
				<div class="loading-card" role="status">
					<span class="loading-dot"></span><span>{m.loading()}</span>
				</div>
			{/if}
		</div>

		<div class="navigation" class:empty={!current}>
			<button class="nav-button previous" onclick={() => card?.advance(-1)} disabled={!current}>
				<Icon name="chevron-left" size={26} class="nav-chevron" />
				<Icon name="arrow-left" size={18} class="nav-arrow" />
				<span class="nav-label">{m.previous()}</span>
			</button>
			<div class="deck-position">
				<p aria-live="polite" aria-atomic="true">
					<span class="sr-only"
						>{m.position({ current: current ? deck.index + 1 : 0, total: deck.order.length })}</span
					>
					{#if current}
						<span class="sr-only" lang={current.language.id}>{current.text}</span>
					{/if}
					<span aria-hidden="true"
						><span class="current-number">{current ? deck.index + 1 : 0}</span><span
							class="counter-divider">/</span
						>{deck.order.length}</span
					>
				</p>
				<div class="progress-track" aria-hidden="true">
					<span
						style:width={`${deck.order.length ? ((deck.index + 1) / deck.order.length) * 100 : 0}%`}
					></span>
				</div>
			</div>
			<button class="nav-button next" onclick={() => card?.advance(1)} disabled={!current}>
				<span class="nav-label">{m.next()}</span>
				<Icon name="arrow-right" size={18} class="nav-arrow" />
				<Icon name="chevron-right" size={26} class="nav-chevron" />
			</button>
		</div>
	</main>
</div>

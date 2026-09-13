<script lang="ts">
	import { tick } from 'svelte';
	import { languages, type LanguageId } from '#lib/catalog.ts';
	import { m } from '#lib/i18n/generated/messages.js';
	import Flag from './Flag.svelte';
	import Icon from './Icon.svelte';

	let {
		selected,
		pinned,
		open = $bindable(false),
		onSelect,
		onPin
	}: {
		selected: LanguageId[];
		pinned: LanguageId[];
		open?: boolean;
		onSelect: (id: LanguageId) => void;
		onPin: (id: LanguageId) => void;
	} = $props();

	let container: HTMLDivElement;
	let trigger: HTMLButtonElement;
	let panel: HTMLDivElement | undefined = $state();
	const active = $derived(languages.filter(({ id }) => selected.includes(id)));
	const sorted = $derived(
		languages.toSorted(
			(a, b) =>
				Number(pinned.includes(b.id)) - Number(pinned.includes(a.id)) ||
				a.name.localeCompare(b.name, 'en')
		)
	);
	const total = $derived(
		active.reduce((count, language) => count + language.collection.twisters.length, 0)
	);

	const close = (restoreFocus = false) => {
		open = false;
		if (restoreFocus) trigger?.focus();
	};
	const toggle = () => {
		open = !open;
	};
	$effect(() => {
		if (open) void tick().then(() => panel?.querySelector<HTMLInputElement>('input')?.focus());
	});
	const onOutside = (event: Event) => {
		if (open && event.target instanceof Node && !container.contains(event.target)) close();
	};
	const pin = async (id: LanguageId, event: MouseEvent) => {
		const button = event.currentTarget as HTMLButtonElement;
		onPin(id);
		await tick();
		button.focus({ preventScroll: true });
	};
	const onKey = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && open) {
			event.preventDefault();
			event.stopPropagation();
			close(true);
		}
	};
</script>

<svelte:window onpointerdown={onOutside} onfocusin={onOutside} onkeydown={onKey} />

<div class="picker" bind:this={container}>
	<button
		class="picker-trigger"
		bind:this={trigger}
		onclick={toggle}
		aria-label={active.length
			? m.languages_selected({ languages: active.map(({ name }) => name).join(', ') })
			: m.choose_languages()}
		aria-haspopup="dialog"
		aria-expanded={open}
		aria-controls="language-picker"
	>
		<span class="flag-stack">
			{#each active.slice(0, 3) as language, i (language.id)}
				<span class="stack-flag" style:z-index={4 - i}><Flag {language} size={36} /></span>
			{/each}
			{#if active.length > 3}<span class="overflow-count">+{active.length - 3}</span>{/if}
			{#if !active.length}<span class="globe"><Icon name="globe" size={23} /></span>{/if}
		</span>
		<span class:rotated={open} class="chevron"><Icon name="chevron" size={15} /></span>
	</button>

	{#if open}
		<div
			class="picker-panel"
			id="language-picker"
			role="dialog"
			aria-labelledby="picker-title"
			bind:this={panel}
		>
			<div class="picker-heading">
				<h2 id="picker-title">{m.languages()}</h2>
				<span>{m.selected_count({ count: selected.length })}</span>
			</div>
			<div class="language-list">
				{#each sorted as language, i (language.id)}
					<div
						class="language-row"
						class:selected={selected.includes(language.id)}
						class:group-start={i > 0 &&
							!pinned.includes(language.id) &&
							pinned.includes(sorted[i - 1]!.id)}
					>
						<label>
							<Flag {language} size={32} />
							<span class="language-name">{language.name}</span>
							<span
								class="language-count"
								aria-label={m.twister_count({ count: language.collection.twisters.length })}
								>{language.collection.twisters.length}</span
							>
							<span aria-hidden="true"></span>
							<input
								type="checkbox"
								checked={selected.includes(language.id)}
								onchange={() => onSelect(language.id)}
							/>
							<span class="checkbox" aria-hidden="true"><Icon name="check" size={17} /></span>
						</label>
						<button
							class="pin"
							class:pinned={pinned.includes(language.id)}
							aria-label={pinned.includes(language.id)
								? m.unpin_language({ language: language.name })
								: m.pin_language({ language: language.name })}
							aria-pressed={pinned.includes(language.id)}
							onclick={(event) => pin(language.id, event)}
						>
							<Icon name="star" size={20} filled={pinned.includes(language.id)} />
						</button>
					</div>
				{/each}
			</div>
			<div class="picker-footer">
				<Icon name="shuffle" size={15} /><span>{m.deck_count({ count: total })}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.picker {
		position: relative;
		z-index: 20;
	}
	.picker-trigger {
		display: flex;
		align-items: center;
		gap: 11px;
		min-height: 48px;
		padding: 5px 10px 5px 6px;
		border: 1px solid var(--border);
		border-radius: 30px;
		background: var(--surface);
		color: var(--muted);
		transition:
			background 0.2s,
			border-color 0.2s;
	}
	.picker-trigger:hover,
	.picker-trigger[aria-expanded='true'] {
		background: #27242f;
		border-color: #655974;
	}
	.flag-stack {
		display: flex;
		align-items: center;
		padding: 1px;
	}
	.stack-flag {
		display: flex;
		position: relative;
		border: 3px solid var(--surface);
		border-radius: 50%;
	}
	.stack-flag + .stack-flag,
	.overflow-count {
		margin-left: -19px;
	}
	.overflow-count {
		height: 42px;
		min-width: 42px;
		padding-left: 13px;
		padding-right: 4px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: #38313e;
		color: var(--text);
		font-size: 12px;
	}
	.globe {
		width: 42px;
		height: 42px;
		display: grid;
		place-items: center;
	}
	.chevron {
		display: flex;
		transition: transform 0.2s;
	}
	.rotated {
		transform: rotate(180deg);
	}
	.picker-panel {
		position: absolute;
		top: calc(100% + 14px);
		right: 0;
		width: min(374px, calc(100vw - 32px));
		background: #1e1b25;
		border: 1px solid #403947;
		border-radius: 23px;
		box-shadow: 0 24px 70px #0008;
		overflow: hidden;
		animation: reveal 0.16s ease-out;
	}
	.picker-heading {
		padding: 22px 23px 18px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--border);
		gap: 12px;
	}
	h2 {
		font-size: 15px;
		font-weight: 600;
		margin: 0;
	}
	.picker-heading > span {
		font-size: 12px;
		color: var(--muted);
	}
	.language-list {
		padding: 9px;
		max-height: min(390px, 55dvh);
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		scrollbar-color: #514858 transparent;
	}
	.language-row {
		position: relative;
		border-radius: 14px;
	}
	.language-row.selected {
		background: #b8a0ee12;
	}
	.language-row:hover {
		background: #b8a0ee18;
	}
	label {
		display: grid;
		grid-template-columns: 32px minmax(0, 1fr) auto 38px 24px;
		align-items: center;
		gap: 10px;
		padding: 17px 13px;
		cursor: pointer;
	}
	.language-name {
		font-size: 15px;
		font-weight: 550;
	}
	.language-count {
		color: var(--muted);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
	input {
		position: absolute;
		right: 13px;
		width: 24px;
		height: 24px;
		opacity: 0;
		margin: 0;
		cursor: pointer;
	}
	.checkbox {
		grid-column: 5;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border: 1.5px solid #81768c;
		border-radius: 8px;
		color: transparent;
	}
	input:checked + .checkbox {
		background: var(--accent);
		color: #251b37;
		border-color: var(--accent);
	}
	input:focus-visible + .checkbox {
		outline: 2px solid var(--text);
		outline-offset: 4px;
	}
	.pin {
		position: absolute;
		right: 48px;
		top: 50%;
		transform: translateY(-50%);
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 9px;
		color: #978b9f;
	}
	.pin:hover {
		color: #f5c46f;
		background: #f5c46f0c;
	}
	.pin.pinned {
		color: #f5c46f;
	}
	.group-start {
		margin-top: 17px;
	}
	.group-start::before {
		content: '';
		position: absolute;
		top: -9px;
		left: 13px;
		right: 13px;
		height: 1px;
		background: var(--border);
	}
	.picker-footer {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 17px 23px;
		border-top: 1px solid var(--border);
		font-size: 11px;
		color: var(--muted);
	}
	@keyframes reveal {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.picker-panel {
			animation: none;
		}
		.chevron {
			transition: none;
		}
	}
</style>

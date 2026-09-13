import { isLanguageId, languages, twisterById, twisters, type LanguageId } from './catalog';

export type Deck = {
	version: 1;
	selected: LanguageId[];
	pinned: LanguageId[];
	order: string[];
	index: number;
};

const storageKey = 'ttw.deck';

const shuffle = <T>(items: readonly T[]): T[] => {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		// Both indices are within the array; checked indexed access cannot infer that.
		[result[i], result[j]] = [result[j]!, result[i]!];
	}
	return result;
};

const uniqueLanguages = (values: readonly unknown[]): LanguageId[] =>
	languages.filter(({ id }) => values.includes(id)).map(({ id }) => id);

const idsFor = (selected: readonly LanguageId[]) =>
	twisters.filter(({ language }) => selected.includes(language.id)).map(({ id }) => id);

const newDeck = (): Deck => ({
	version: 1,
	selected: ['en'],
	pinned: [],
	order: shuffle(idsFor(['en'])),
	index: 0
});

export const move = (deck: Deck, direction: -1 | 1): Deck => ({
	...deck,
	index: deck.order.length ? (deck.index + direction + deck.order.length) % deck.order.length : 0
});

/** Keep surviving history and the current card; mix additions into the remainder. */
const reconcile = (deck: Deck, selected: LanguageId[]): Deck => {
	const available = new Set(idsFor(selected));
	const order = [...new Set(deck.order)].filter((id) => available.has(id));
	const current = deck.order[deck.index];
	const next = deck.order.slice(deck.index).find((id) => available.has(id)) ?? order[0];
	const index = Math.max(
		0,
		order.indexOf(current && available.has(current) ? current : (next ?? ''))
	);
	const existing = new Set(order);
	const added = [...available].filter((id) => !existing.has(id));
	if (!added.length) return { ...deck, selected, order, index };
	const prefix = order.slice(0, order.length ? index + 1 : 0);
	return {
		...deck,
		selected,
		order: [...prefix, ...shuffle([...order.slice(prefix.length), ...added])],
		index
	};
};

export const toggleLanguage = (deck: Deck, id: LanguageId): Deck =>
	reconcile(
		deck,
		uniqueLanguages(
			deck.selected.includes(id)
				? deck.selected.filter((selected) => selected !== id)
				: [...deck.selected, id]
		)
	);

export const togglePin = (deck: Deck, id: LanguageId): Deck => ({
	...deck,
	pinned: uniqueLanguages(
		deck.pinned.includes(id) ? deck.pinned.filter((pinned) => pinned !== id) : [...deck.pinned, id]
	)
});

export const restoreDeck = (): Deck => {
	try {
		const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
		if (
			!saved ||
			typeof saved !== 'object' ||
			!('version' in saved) ||
			saved.version !== 1 ||
			!('selected' in saved) ||
			!Array.isArray(saved.selected) ||
			!('pinned' in saved) ||
			!Array.isArray(saved.pinned) ||
			!('order' in saved) ||
			!Array.isArray(saved.order) ||
			!saved.order.every((id): id is string => typeof id === 'string') ||
			new Set(saved.order).size !== saved.order.length ||
			!('index' in saved) ||
			typeof saved.index !== 'number' ||
			!Number.isInteger(saved.index)
		) {
			return newDeck();
		}
		const deck: Deck = {
			version: 1,
			selected: uniqueLanguages(saved.selected.filter(isLanguageId)),
			pinned: uniqueLanguages(saved.pinned.filter(isLanguageId)),
			order: saved.order,
			index: Math.min(Math.max(0, saved.index), Math.max(0, saved.order.length - 1))
		};
		return reconcile(deck, deck.selected);
	} catch {
		// Private browsing, a cleared catalog, or invalid storage must not block practice.
		return newDeck();
	}
};

export const saveDeck = (deck: Deck): void => {
	try {
		localStorage.setItem(storageKey, JSON.stringify(deck));
	} catch {
		// The session continues in memory when browser storage is unavailable.
	}
};

export const currentTwister = (deck: Deck) => twisterById.get(deck.order[deck.index] ?? '');

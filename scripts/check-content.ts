import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { languages, twisters, type LanguageId } from '../src/lib/catalog.ts';

const expectedCounts = {
	en: 200,
	kk: 200,
	ru: 200,
	fr: 50,
	nl: 50,
	de: 50,
	es: 50
} satisfies Record<LanguageId, number>;

const normalize = (text: string) =>
	text
		.normalize('NFC')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]/gu, '');

const ids = new Set<string>();

for (const language of languages) {
	const texts = new Set<string>();
	assert.equal(
		language.collection.twisters.length,
		expectedCounts[language.id],
		`${language.name}: unexpected twister count`
	);

	for (const twister of language.collection.twisters) {
		assert.ok(twister.id.startsWith(`${language.id}-`), `Wrong language prefix: ${twister.id}`);
		assert.ok(!ids.has(twister.id), `Duplicate ID: ${twister.id}`);
		assert.ok(
			twister.text.trim() === twister.text && twister.text.length > 5,
			`Empty or untrimmed text: ${twister.id}`
		);
		assert.ok(!texts.has(normalize(twister.text)), `Duplicate text: ${twister.id}`);
		assert.ok(twister.source in language.collection.sources, `Missing source: ${twister.id}`);
		if (language.id === 'kk' || language.id === 'ru')
			assert.ok(!/[a-z]/i.test(twister.text), `Latin letters in Cyrillic text: ${twister.id}`);
		ids.add(twister.id);
		texts.add(normalize(twister.text));
	}
}

const messages = (locale: string): Record<string, string> => {
	const parsed: unknown = JSON.parse(
		readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')
	);

	assert.ok(parsed && typeof parsed === 'object' && !Array.isArray(parsed));

	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(parsed)) {
		assert.ok(typeof value === 'string');
		result[key] = value;
	}

	return result;
};

const english = messages('en');

const placeholders = (value: string) =>
	[...value.matchAll(/\{(\w+)\}/g)]
		.map((match) => match[1] ?? '')
		.toSorted((a, b) => a.localeCompare(b));

for (const { id } of languages) {
	const translated = messages(id);

	assert.deepEqual(
		Object.keys(translated).toSorted(),
		Object.keys(english).toSorted(),
		`${id}: translation keys differ`
	);

	for (const [key, value] of Object.entries(english)) {
		const translation = translated[key];

		assert.ok(
			typeof translation === 'string' && translation.trim(),
			`${id}: empty translation ${key}`
		);
		assert.deepEqual(
			placeholders(translation),
			placeholders(value),
			`${id}: placeholders differ for ${key}`
		);
	}
}

console.log(`${twisters.length} unique twisters; all translations and sources present.`);

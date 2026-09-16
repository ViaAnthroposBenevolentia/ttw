import english from './content/en.json' with { type: 'json' };
import kazakh from './content/kk.json' with { type: 'json' };
import russian from './content/ru.json' with { type: 'json' };
import french from './content/fr.json' with { type: 'json' };
import dutch from './content/nl.json' with { type: 'json' };
import german from './content/de.json' with { type: 'json' };
import spanish from './content/es.json' with { type: 'json' };

export const languages = [
	{ id: 'en', name: 'English', speechLocale: 'en-GB', flag: '/flags/gb.svg', collection: english },
	{ id: 'kk', name: 'Kazakh', speechLocale: 'kk-KZ', flag: '/flags/kz.svg', collection: kazakh },
	{ id: 'ru', name: 'Russian', speechLocale: 'ru-RU', flag: '/flags/ru.svg', collection: russian },
	{ id: 'fr', name: 'French', speechLocale: 'fr-FR', flag: '/flags/fr.svg', collection: french },
	{ id: 'nl', name: 'Dutch', speechLocale: 'nl-NL', flag: '/flags/nl.svg', collection: dutch },
	{ id: 'de', name: 'German', speechLocale: 'de-DE', flag: '/flags/de.svg', collection: german },
	{ id: 'es', name: 'Spanish', speechLocale: 'es-ES', flag: '/flags/es.svg', collection: spanish }
] as const;

export type LanguageId = (typeof languages)[number]['id'];
export type Language = (typeof languages)[number];
export type Twister = { id: string; text: string; language: Language };

export const twisters: Twister[] = languages.flatMap((language) =>
	language.collection.twisters.map(({ id, text }) => ({ id, text, language }))
);
export const twisterById = new Map(twisters.map((twister) => [twister.id, twister]));
export const isLanguageId = (value: unknown): value is LanguageId =>
	languages.some((language) => language.id === value);

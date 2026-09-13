import english from './content/en.json' with { type: 'json' };
import kazakh from './content/kk.json' with { type: 'json' };
import russian from './content/ru.json' with { type: 'json' };

export const languages = [
	{ id: 'en', name: 'English', speechLocale: 'en-GB', flag: '/flags/gb.svg', collection: english },
	{ id: 'kk', name: 'Kazakh', speechLocale: 'kk-KZ', flag: '/flags/kz.svg', collection: kazakh },
	{ id: 'ru', name: 'Russian', speechLocale: 'ru-RU', flag: '/flags/ru.svg', collection: russian }
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

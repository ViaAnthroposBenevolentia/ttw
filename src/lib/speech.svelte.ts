import { onMount } from 'svelte';
import type { Language, Twister } from './catalog';

/** Device voices load asynchronously. Keep one utterance alive and cancel it on navigation. */
export const createSpeech = () => {
	let voices = $state<SpeechSynthesisVoice[]>([]);
	let online = $state(true);
	let speaking = $state<string | null>(null);
	let failedVoices = $state<string[]>([]);
	let utterance: SpeechSynthesisUtterance | undefined;

	const stop = () => {
		if (utterance) {
			utterance = undefined;
			window.speechSynthesis.cancel();
		}
		speaking = null;
	};

	onMount(() => {
		if (!('speechSynthesis' in window)) return stop;
		const refresh = () => {
			online = navigator.onLine;
			voices = window.speechSynthesis.getVoices();
			failedVoices = [];
		};
		const onVisibility = () => {
			if (document.hidden) stop();
		};
		refresh();
		window.speechSynthesis.addEventListener('voiceschanged', refresh);
		window.addEventListener('online', refresh);
		window.addEventListener('offline', refresh);
		window.addEventListener('pagehide', stop);
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			stop();
			window.speechSynthesis.removeEventListener('voiceschanged', refresh);
			window.removeEventListener('online', refresh);
			window.removeEventListener('offline', refresh);
			window.removeEventListener('pagehide', stop);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});

	const voiceFor = (language: Language) => {
		const candidates = voices.filter(
			(voice) =>
				voice.lang.toLowerCase().split(/[-_]/)[0] === language.id &&
				(online || voice.localService) &&
				!failedVoices.includes(voice.voiceURI)
		);
		const score = (voice: SpeechSynthesisVoice) =>
			Number(voice.lang.replace('_', '-').toLowerCase() === language.speechLocale.toLowerCase()) *
				4 +
			Number(voice.localService) * 2 +
			Number(voice.default);
		return candidates.toSorted((a, b) => score(b) - score(a))[0];
	};

	const play = (twister: Twister) => {
		const wasSpeaking = speaking === twister.id;
		stop();
		if (wasSpeaking) return;
		const voice = voiceFor(twister.language);
		if (!voice) return;
		const next = new SpeechSynthesisUtterance(twister.text);
		next.voice = voice;
		next.lang = voice.lang;
		next.rate = 0.9;
		next.addEventListener(
			'end',
			() => {
				if (utterance !== next) return;
				speaking = null;
				utterance = undefined;
			},
			{ once: true }
		);
		next.addEventListener(
			'error',
			(event) => {
				if (utterance !== next) return;
				speaking = null;
				utterance = undefined;
				if (event.error !== 'canceled' && event.error !== 'interrupted') {
					failedVoices = [...failedVoices, voice.voiceURI];
				}
			},
			{ once: true }
		);
		utterance = next;
		speaking = twister.id;
		try {
			window.speechSynthesis.speak(next);
		} catch {
			failedVoices = [...failedVoices, voice.voiceURI];
			stop();
		}
	};

	return {
		voiceFor,
		play,
		stop,
		get speaking() {
			return speaking;
		}
	};
};

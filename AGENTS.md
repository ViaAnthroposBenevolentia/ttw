# ttw

A static tongue-twister practice app. Name comes from 'Tongue Twister' -> 'ttw'.

It presents users with a deck of tongue twisters. Users pronounce them and tap the card or use the navigation controls to get the next twister, and repeat.

Practice languages are independent of the browser-selected UI locale. Speech comes only from device/browser voices; no audio API or backend.

Deck edits preserve the current card and preceding surviving order; newly selected languages are shuffled into the remainder. Previous and Next wrap without reshuffling. Card taps advance; desktop navigation controls stay outside the card.

Run `pnpm fix` for safe fixes and `pnpm check` for the complete read-only gate. Do not add tests without a request.

Content lives in `src/lib/content/`, one JSON file per language. Keep existing IDs stable and add a source reference with new entries. See README.md when changing content or deployment.

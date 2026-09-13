# ttw

A little twist for your tongue. A quiet, dark practice app with 50 established tongue twisters each in English, Kazakh, and Russian.

Tap a card to advance or use the desktop navigation controls. Choose several languages to mix them together, and star the ones you want to keep at the top of the picker. Your deck and preferences stay on your device.

## Run locally

```sh
mise install
pnpm install
pnpm dev
```

For a production preview, including the service worker:

```sh
pnpm build
pnpm preview --host
```

Service workers need HTTPS or localhost; plain HTTP over a phone's LAN connection won't enable offline installation.

## Content and translations

Each JSON file in `src/lib/content` contains `twisters` and a small `sources` lookup. Entries have an ID, text, source key, and optional author. Source links identify collected versions, not necessarily their original authors. Spacing and punctuation have been normalized, and duplicate variants omitted. The collection includes short phrases and longer verses; it isn't ordered by difficulty.

Edit interface copy in `messages/en.json`, `messages/kk.json`, and `messages/ru.json`. Paraglide generates its code during setup/build. Language names in the practice picker deliberately remain in English.

The initial catalog contains 50 entries per language; update the count check in `scripts/check-content.ts` when intentionally expanding it. Add a language to `src/lib/catalog.ts` with its content, flag, and speech locale.

## Speech and offline use

The speaker appears only when the browser reports a voice for the card's language. Voice quality and availability depend on the device. Playback stops when navigating or leaving the app; no recordings, API keys, or audio service are needed.

The first successful service-worker installation caches the app, fonts, flags, translations, and all 150 texts. Speech may still need internet; offline playback uses locally installed voices when available. Browser storage can be cleared or evicted.

Updates install in the background and activate after existing app tabs/windows close. Open the app online once to receive an update, then close and reopen it. No session is interrupted to force an update.

## Deploy to Render

Connect the repository as a Render Blueprint using `render.yaml`. It builds a static site at the domain root and waits for GitHub checks before automatic deployments. The checked-in workflow runs the same gate as local development.

When ready, add `ttw.fun` in Render's custom-domain settings and follow its DNS instructions in Cloudflare. The app needs no runtime environment variables or backend.

## License and credits

Application code and original icon: [MIT](LICENSE), © Chris Kyle.

Flags: [flag-icons](https://github.com/lipis/flag-icons), [MIT notice](static/flags/LICENSE). Typography: [Manrope](https://github.com/sharanda/manrope), [SIL Open Font License](licenses/manrope.txt).

Tongue-twister source references are included with the content. The software license does not replace the rights or attribution of underlying collected texts.

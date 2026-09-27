# Development

## Layout

| File | What it does |
| :-- | :-- |
| `user.css` | The theme. Sections are marked with `/* ---------- Name ---------- */`. |
| `theme.js` | Companion script, injected by Spicetify (`inject_theme_js`). Publishes the cover, colors and playback state on `<html>`, and adds the welcome screen, card tilt, settings panel, Now Playing panel and lyrics. |
| `color.ini` | Spicetify color scheme (`Nebula`). The same palette is also defined in `user.css`. |
| `manifest.json` | Marketplace metadata. |

### State published on `<html>`

| Name | Values |
| :-- | :-- |
| `--np-image`, `--np-ambient`, `--np-ambient-prev` | Current cover, pre-blurred cover, previous cover (cross-fade) |
| `--np-accent`, `--np-c1…c3` | Colors extracted from the cover |
| `data-np-state` | `playing` · `paused` |
| `data-nebula-ready` | Set when the welcome screen ends; panels animate in |
| `data-nebula-style`, `-tone`, `-bg`, `-fx`, `-karaoke` | Current settings |
| `data-nebula-npv`, `data-nebula-lyrics` | Custom Now Playing panel active · full-screen lyrics open |

Settings are stored in `localStorage["nebula:settings"]`.

## Dev loop

Copy the files straight into Spotify's app folder and reload the UI, so there is no need to run `spicetify apply` on every change:

```bash
XPUI="$(spicetify config spotify_path)/Apps/xpui"
cp user.css "$XPUI/user.css"
cp theme.js "$XPUI/extensions/theme.js"
```

Then reload with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> (DevTools enabled with `spicetify enable-devtools`).

## Debugging inside Spotify

Launch Spotify with a debugging port and connect Chrome DevTools or any CDP client:

```bash
spotify --remote-debugging-port=9222
```

- `http://localhost:9222/json` lists the `xpui` page target.
- Use the **Performance** panel (or `Tracing.start` over CDP) to profile.
- The Spotify window must be **visible**: when it is covered or minimized, Chromium stops drawing and traces are meaningless.

## Performance rules

These were measured inside Spotify; please keep them.

1. **No looping `transform` animations by default.** Any running transform animation makes Spotify recompute hundreds of `IntersectionObserver`s every frame. Opacity-only animations are free.
2. **No live full-screen `filter: blur()`.** It re-renders on every frame where anything animates. Blur the cover once in a canvas instead.
3. **Avoid animating `clip-path`, `mask-position` or `background-position`** on anything large; they paint on the main thread every frame.
4. **Don't show `.progress-bar__slider`.** Spotify moves it by animating `left`, which triggers layout every frame.
5. **Keep large translucent layers static.** An opacity animation on the layer under the player tripled GPU load.
6. **`background-clip: text`** only on `inline-block` elements and never inside a `filter`ed ancestor, or Chromium may skip painting it.

Anything that breaks these rules belongs behind a setting (Dynamic background, Extra effects).

## Selectors

Spotify's hashed class names change between versions. Prefer, in order:

1. Stable `main-*`, `Root__*`, `x-*` class names.
2. `data-testid` and `data-encore-id` attributes.
3. Structural selectors with `:has()`.

Hashed classes are used only as progressive enhancement (for example, mirroring Spotify's progress transition) where a mismatch degrades gracefully.

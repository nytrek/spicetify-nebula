// Nebula: companion script for the Nebula Spicetify theme.
// Publishes the current cover/colors/playback state as CSS variables and data
// attributes on <html>, and adds the welcome screen, card tilt, settings and lyrics.
(function nebula() {
  const root = document.documentElement;
  // Loaded late (e.g. by the Marketplace, after the UI is already visible):
  // the welcome then covers the screen itself instead of hiding the panels.
  const lateLoad = performance.now() > 6000;

  const safe = (name, fn) => {
    try { return fn(); } catch (err) { console.warn(`[Nebula] ${name} failed:`, err); }
  };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- Locale ----------
  const spotifyLocale = () => {
    const raw = window.Spicetify?.Locale?.getLocale?.() || root.lang || navigator.language || "en";
    return String(raw).toLowerCase();
  };
  const lang = () => spotifyLocale().split(/[-_]/)[0];

  const GREETINGS = {
    en: ["Good night", "Good morning", "Good afternoon", "Good evening"],
    es: ["Buenas noches", "Buenos días", "Buenas tardes", "Buenas noches"],
    pt: ["Boa noite", "Bom dia", "Boa tarde", "Boa noite"],
    fr: ["Bonne nuit", "Bonjour", "Bon après-midi", "Bonsoir"],
    de: ["Gute Nacht", "Guten Morgen", "Guten Tag", "Guten Abend"],
    it: ["Buonanotte", "Buongiorno", "Buon pomeriggio", "Buonasera"],
    nl: ["Goedenacht", "Goedemorgen", "Goedemiddag", "Goedenavond"],
    sv: ["God natt", "God morgon", "God eftermiddag", "God kväll"],
    pl: ["Dobranoc", "Dzień dobry", "Dzień dobry", "Dobry wieczór"],
    tr: ["İyi geceler", "Günaydın", "Tünaydın", "İyi akşamlar"],
    ru: ["Доброй ночи", "Доброе утро", "Добрый день", "Добрый вечер"],
    uk: ["Доброї ночі", "Доброго ранку", "Добрий день", "Добрий вечір"],
    id: ["Selamat malam", "Selamat pagi", "Selamat siang", "Selamat malam"],
    ja: ["おやすみなさい", "おはようございます", "こんにちは", "こんばんは"],
    ko: ["좋은 밤 되세요", "좋은 아침이에요", "좋은 오후예요", "좋은 저녁이에요"],
    zh: ["晚安", "早上好", "下午好", "晚上好"],
    hi: ["शुभ रात्रि", "सुप्रभात", "नमस्कार", "शुभ संध्या"],
    ar: ["تصبح على خير", "صباح الخير", "مساء الخير", "مساء الخير"],
  };

  const TEXT = {
    en: {
      lyrics: "Lyrics", expand: "Full screen", close: "Close", none: "No lyrics for this song",
      loading: "Loading lyrics…", unsynced: "These lyrics aren't synced", save: "Save to Liked Songs",
      settings: "Nebula settings",
      secLook: "Appearance", secHome: "Home", secBg: "Background", secPanel: "Right panel", secLyrics: "Lyrics",
      style: "Style", styleHint: "Aurora v1: purple glass, violet aurora, gradient titles and a glowing player line.",
      styleNebula: "Nebula", styleAurora: "Aurora v1",
      tone: "Tone", toneHint: "How dark the background and panels are.",
      toneNormal: "Normal", toneDark: "Dark", toneBlack: "OLED",
      welcome: "Welcome", welcomeHint: "A greeting with your name when Spotify opens.",
      calm: "Respect reduced motion", calmHint: "Turn animations off when the system asks for reduced motion.",
      homeHero: "Home header", homeHeroHint: "Your profile photo and greeting at the top of Home.",
      bg: "Background", bgHint: "Dynamic: moving cover, breathing aurora and twinkling stars (like v1).",
      bgStatic: "Static", bgDynamic: "Dynamic",
      meteors: "Shooting stars", meteorsHint: "Now and then a star crosses the screen.",
      fx: "Extra effects", fxHint: "Breathing halo, spinning ring, slow zoom on artist photos.",
      npv: "Now playing", npvHint: "Cover with progress ring, or Spotify's video/canvas when the song has one.",
      npvRing: "Cover + ring", npvVideo: "Video / canvas",
      useLyrics: "Nebula lyrics", useLyricsHint: "Turn off to use Spotify's or another extension's lyrics.",
      panelLyrics: "Lyrics in right panel", panelLyricsHint: "Synced lyrics under the cover.",
      karaoke: "Karaoke", karaokeHint: "How the current line fills up while it's sung.",
      kLetter: "By letter", kWord: "By word", kOff: "Off",
    },
    es: {
      lyrics: "Letras", expand: "Pantalla completa", close: "Cerrar", none: "Esta canción no tiene letra",
      loading: "Cargando letra…", unsynced: "Esta letra no está sincronizada", save: "Guardar en Tus me gusta",
      settings: "Ajustes de Nebula",
      secLook: "Apariencia", secHome: "Inicio", secBg: "Fondo", secPanel: "Panel derecho", secLyrics: "Letras",
      style: "Estilo", styleHint: "Aurora v1: cristal morado, aurora violeta, títulos con degradado y línea brillante en el reproductor.",
      styleNebula: "Nebula", styleAurora: "Aurora v1",
      tone: "Tono", toneHint: "Qué tan oscuros son el fondo y los paneles.",
      toneNormal: "Normal", toneDark: "Oscuro", toneBlack: "OLED",
      welcome: "Bienvenida", welcomeHint: "Un saludo con tu nombre al abrir Spotify.",
      calm: "Respetar movimiento reducido", calmHint: "Desactiva las animaciones si el sistema pide reducir el movimiento.",
      homeHero: "Cabecera de inicio", homeHeroHint: "Tu foto de perfil y un saludo arriba en Inicio.",
      bg: "Fondo", bgHint: "Dinámico: portada en movimiento, aurora que respira y estrellas que titilan (como la v1).",
      bgStatic: "Estático", bgDynamic: "Dinámico",
      meteors: "Estrellas fugaces", meteorsHint: "De vez en cuando una estrella cruza la pantalla.",
      fx: "Efectos extra", fxHint: "Halo que respira, anillo que gira, zoom lento en fotos de artista.",
      npv: "Reproduciendo", npvHint: "Portada con anillo de progreso, o el vídeo/canvas de Spotify si la canción lo tiene.",
      npvRing: "Portada + anillo", npvVideo: "Vídeo / canvas",
      useLyrics: "Letras Nebula", useLyricsHint: "Desactívalo para usar las letras de Spotify u otra extensión.",
      panelLyrics: "Letras en el panel derecho", panelLyricsHint: "Letra sincronizada bajo la portada.",
      karaoke: "Karaoke", karaokeHint: "Cómo se llena la línea actual mientras se canta.",
      kLetter: "Por letra", kWord: "Por palabra", kOff: "Desactivado",
    },
    pt: {
      lyrics: "Letras", expand: "Tela cheia", close: "Fechar", none: "Esta música não tem letra",
      loading: "Carregando letra…", unsynced: "Esta letra não está sincronizada", save: "Salvar em Músicas Curtidas",
      settings: "Ajustes do Nebula",
      secLook: "Aparência", secHome: "Início", secBg: "Fundo", secPanel: "Painel direito", secLyrics: "Letras",
      style: "Estilo", styleHint: "Aurora v1: vidro roxo, aurora violeta, títulos em degradê e linha brilhante no player.",
      styleNebula: "Nebula", styleAurora: "Aurora v1",
      tone: "Tom", toneHint: "O quão escuros são o fundo e os painéis.",
      toneNormal: "Normal", toneDark: "Escuro", toneBlack: "OLED",
      welcome: "Boas-vindas", welcomeHint: "Uma saudação com seu nome ao abrir o Spotify.",
      calm: "Respeitar movimento reduzido", calmHint: "Desliga as animações quando o sistema pede menos movimento.",
      homeHero: "Cabeçalho do início", homeHeroHint: "Sua foto de perfil e uma saudação no topo do Início.",
      bg: "Fundo", bgHint: "Dinâmico: capa em movimento, aurora pulsando e estrelas cintilando (como a v1).",
      bgStatic: "Estático", bgDynamic: "Dinâmico",
      meteors: "Estrelas cadentes", meteorsHint: "De vez em quando uma estrela cruza a tela.",
      fx: "Efeitos extras", fxHint: "Halo pulsando, anel girando, zoom lento nas fotos de artista.",
      npv: "Tocando agora", npvHint: "Capa com anel de progresso, ou o vídeo/canvas do Spotify quando houver.",
      npvRing: "Capa + anel", npvVideo: "Vídeo / canvas",
      useLyrics: "Letras Nebula", useLyricsHint: "Desative para usar as letras do Spotify ou de outra extensão.",
      panelLyrics: "Letras no painel direito", panelLyricsHint: "Letra sincronizada sob a capa.",
      karaoke: "Karaokê", karaokeHint: "Como a linha atual se preenche enquanto é cantada.",
      kLetter: "Por letra", kWord: "Por palavra", kOff: "Desligado",
    },
  };
  const t = (key) => (TEXT[lang()] ?? TEXT.en)[key];

  // ---------- Settings ----------
  const DEFAULTS = {
    style: "nebula",     // "nebula" | "aurora"
    tone: "normal",      // "normal" | "dark" | "black"
    welcome: true,
    homeHero: true,
    bg: "dynamic",       // "static" | "dynamic"
    fx: "full",          // "lite" | "full" (extra effects)
    meteors: true,
    npv: "ring",         // "ring" | "video"
    lyrics: true,        // Nebula lyrics instead of Spotify's
    panelLyrics: true,   // lyrics in the right panel
    karaoke: "letter",   // "letter" | "word" | "off"
    calm: false,         // follow the system "reduce motion" preference
  };
  const settings = (() => {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("nebula:settings") || "{}"); } catch {}
    try { if (localStorage.getItem("nebula:fx") === "full") saved.fx = "full"; } catch {}
    if (saved.karaoke === true) saved.karaoke = "letter";
    if (saved.karaoke === false) saved.karaoke = "off";
    if (saved.fx === "full" && !saved.bg) saved.bg = "dynamic";
    return { ...DEFAULTS, ...saved };
  })();

  const settingListeners = [];
  const saveSetting = (key, value) => {
    settings[key] = value;
    try {
      localStorage.setItem("nebula:settings", JSON.stringify(settings));
      localStorage.removeItem("nebula:fx");
    } catch {}
    applySettings();
    settingListeners.forEach((fn) => fn(key));
  };
  const applySettings = () => {
    root.dataset.nebulaStyle = settings.style;
    root.dataset.nebulaTone = settings.tone;
    root.dataset.nebulaBg = settings.bg;
    root.dataset.nebulaFx = settings.fx;
    root.dataset.nebulaKaraoke = settings.karaoke;
    if (calm()) root.dataset.nebulaCalm = "";
    else delete root.dataset.nebulaCalm;
  };
  // Windows often reports "reduce motion" system-wide, so it only applies when the user opts in.
  function calm() { return settings.calm && reduceMotion.matches; }
  applySettings();
  const fullFx = () => settings.fx === "full" && !calm();

  // ---------- Material 3 shapes ----------
  const SVG_NS = "http://www.w3.org/2000/svg";
  const wavyPath = (cx, cy, r, amp, waves, steps = 240) => {
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const th = -Math.PI / 2 + (i / steps) * Math.PI * 2;
      const rr = r + amp * Math.sin(waves * th);
      d += `${i ? "L" : "M"}${(cx + rr * Math.cos(th)).toFixed(2)} ${(cy + rr * Math.sin(th)).toFixed(2)}`;
    }
    return d + "Z";
  };
  const ring = ({ progress = false } = {}) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.classList.add("nebula-ring");
    const track = document.createElementNS(SVG_NS, "circle");
    Object.entries({ cx: 60, cy: 60, r: 56, class: "nr-track" }).forEach(([k, v]) => track.setAttribute(k, v));
    const wave = document.createElementNS(SVG_NS, "path");
    wave.setAttribute("d", wavyPath(60, 60, 56.5, 1.1, 18));
    wave.setAttribute("pathLength", "100");
    wave.setAttribute("class", progress ? "nr-progress" : "nr-wave");
    svg.append(track, wave);
    return { svg, wave };
  };

  // ---------- Welcome and entrance ----------
  const greeting = () => {
    const lines = GREETINGS[lang()] ?? GREETINGS.en;
    const h = new Date().getHours();
    return lines[h < 5 ? 0 : h < 12 ? 1 : h < 19 ? 2 : 3];
  };

  const displayName = async () => {
    try {
      const user = await Promise.race([
        window.Spicetify?.Platform?.UserAPI?.getUser?.(),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);
      return user?.displayName || user?.username || "";
    } catch {
      return "";
    }
  };

  const welcome = async () => {
    const name = await displayName();
    const el = document.createElement("div");
    el.id = "nebula-welcome";
    if (lateLoad) el.classList.add("is-cover");
    el.lang = spotifyLocale();
    el.dir = "auto";
    el.style.cssText = "position:fixed;inset:0;pointer-events:none";
    el.innerHTML = '<div class="nw-greet"></div><div class="nw-name"></div><div class="nw-wave"></div>';
    el.querySelector(".nw-greet").textContent = greeting();
    el.querySelector(".nw-name").textContent = name || "Nebula";
    document.body.append(el);
    // The UI is hidden only while the welcome is on screen.
    if (!lateLoad) root.dataset.nebulaIntro = "";
    setTimeout(() => { root.dataset.nebulaReady = ""; }, 2200);
    setTimeout(() => { el.remove(); delete root.dataset.nebulaIntro; }, 3000);
  };

  const uiWaitStart = Date.now();
  (function waitForUi() {
    if (!document.querySelector(".Root__main-view") && Date.now() - uiWaitStart < 10000) {
      setTimeout(waitForUi, 100);
      return;
    }
    if (calm() || !settings.welcome) {
      root.dataset.nebulaReady = "";
      return;
    }
    if (document.visibilityState !== "visible") {
      document.addEventListener("visibilitychange", () => requestAnimationFrame(welcome), { once: true });
      return;
    }
    requestAnimationFrame(() => safe("welcome", welcome));
  })();

  // ---------- Shooting stars ----------
  // Only animates while a star is flying: a looping transform animation would keep
  // Spotify's IntersectionObservers busy every frame.
  const launchMeteor = () => {
    const playing = root.dataset.npState !== "paused";
    if (settings.meteors && !calm() && playing && document.visibilityState === "visible") {
      root.dataset.nebulaMeteor = Math.random() < 0.5 ? "a" : "b";
      setTimeout(() => delete root.dataset.nebulaMeteor, 1300);
    }
    const lively = settings.bg === "dynamic" && !calm();
    const wait = lively ? 8000 + Math.random() * 6000 : 20000 + Math.random() * 10000;
    setTimeout(launchMeteor, wait);
  };
  setTimeout(launchMeteor, 8000);

  // ---------- Card tilt ----------
  const CARD = ".main-card-cardContainer, .main-card-card";
  let card = null;
  let art = null;
  let pointer = null;
  let tiltFrame = 0;

  const releaseCard = () => {
    if (!art) return;
    art.classList.remove("nebula-tilt");
    art.style.transform = "";
    art.style.removeProperty("--glare-x");
    art.style.removeProperty("--glare-y");
    art = null;
  };

  // Writes the transform on the artwork only (no variables on the card) at most once per frame.
  const tilt = () => {
    tiltFrame = 0;
    const next = pointer.target.closest?.(CARD) ?? null;
    if (next !== card) {
      releaseCard();
      card = next;
      art = card?.querySelector(".main-cardImage-imageWrapper") ?? null;
      art?.classList.add("nebula-tilt");
    }
    if (!art) return;
    const r = card.getBoundingClientRect();
    const x = (pointer.clientX - r.left) / r.width - 0.5;
    const y = (pointer.clientY - r.top) / r.height - 0.5;
    art.style.transform =
      `perspective(700px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`;
    art.style.setProperty("--glare-x", x.toFixed(3));
    art.style.setProperty("--glare-y", y.toFixed(3));
  };

  document.addEventListener("pointermove", (event) => {
    if (calm()) return;
    pointer = event;
    tiltFrame ||= requestAnimationFrame(tilt);
  }, { passive: true });
  document.addEventListener("pointerleave", () => { releaseCard(); card = null; });

  // ---------- Spicetify-dependent setup ----------
  (function boot() {
    const S = window.Spicetify;
    // Player.data only exists once something has played, so it is not required here.
    // On some platforms this script runs before Spicetify has loaded React and
    // the player, so wait until everything used below exists.
    const ready = S?.Player?.addEventListener && S.Platform && S.CosmosAsync &&
      S.React && S.ReactJSX?.jsx && S.Menu?.Item && S.PopupModal?.display;
    if (!ready) {
      setTimeout(boot, 300);
      return;
    }

    // --- Settings: profile menu entry, plus Ctrl+Alt+N as a fallback
    // Registering before the UI is painted is silently lost, so wait for it.
    (function registerSettings(tries = 0) {
      if (!S.Menu?.Item || !S.PopupModal?.display || !document.querySelector(".Root__main-view")) {
        if (tries < 120) setTimeout(() => registerSettings(tries + 1), 500);
        return;
      }
      try {
        new S.Menu.Item(t("settings"), false, () => openSettings(S)).register();
      } catch (err) {
        if (tries < 120) setTimeout(() => registerSettings(tries + 1), 500);
        else console.warn("[Nebula] settings menu failed:", err);
      }
    })();
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "n" && S.PopupModal?.display) {
        e.preventDefault();
        openSettings(S);
      }
    });

    const setVar = (name, value) => value && root.style.setProperty(name, value);
    // The player getters throw until playback state exists.
    const playerPos = () => { try { return S.Player.getProgress() || 0; } catch { return 0; } };
    const playerDur = () => { try { return S.Player.getDuration() || 0; } catch { return 0; } };

    const toUrl = (uri) =>
      uri?.startsWith("spotify:image:") ? "https://i.scdn.co/image/" + uri.slice(14) : uri || "";

    const imageOf = (item) => {
      const m = item?.metadata ?? {};
      return toUrl(
        m.image_xlarge_url || m.image_large_url || m.image_url ||
        item?.album?.images?.at(-1)?.url || item?.images?.[0]?.url
      );
    };

    const loadImage = (url, cors) => new Promise((resolve, reject) => {
      const img = new Image();
      if (cors) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    // --- Cover, colors and playback state

    // Pre-blurred 64px cover: the browser upscales it smoothly, so the CSS needs no
    // full-screen blur (which would repaint on every animated frame).
    const ambientOf = (img) => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      const brightness = parseFloat(getComputedStyle(root).getPropertyValue("--cover-brightness")) || 0.56;
      ctx.filter = `blur(4px) saturate(1.6) brightness(${brightness})`;
      ctx.drawImage(img, -10, -10, size + 20, size + 20);
      return canvas.toDataURL("image/png");
    };

    let settle = 0;
    // background-image cannot be interpolated: keep the previous cover underneath
    // and fade the new one in with an opacity-only animation.
    const crossfadeTo = (next) => {
      const previous = root.style.getPropertyValue("--np-ambient");
      root.style.setProperty("--np-ambient", next);
      if (!previous || calm()) {
        root.style.setProperty("--np-ambient-prev", next);
        return;
      }
      root.style.setProperty("--np-ambient-prev", previous);
      const target = getComputedStyle(document.body, "::before").opacity;
      document.body.animate([{ opacity: 0 }, { opacity: target }], {
        duration: 1600,
        easing: "ease-in-out",
        pseudoElement: "::before",
      });
      clearTimeout(settle);
      settle = setTimeout(() => root.style.setProperty("--np-ambient-prev", next), 1700);
    };

    let generation = 0;

    async function applyTrack() {
      const item = S.Player.data?.item;
      if (!item) return;
      const current = ++generation;

      const url = imageOf(item);
      if (url) {
        let ambient = "";
        try {
          ambient = ambientOf(await loadImage(url, true));
        } catch {
          try { await loadImage(url, false); } catch {}
        }
        if (current !== generation) return;
        setVar("--np-image", `url("${url}")`);
        if (ambient) {
          crossfadeTo(`url("${ambient}")`);
          root.dataset.npAmbient = "";
        } else {
          delete root.dataset.npAmbient;
        }
      }

      if (!S.colorExtractor) return;
      try {
        const c = await S.colorExtractor(item.uri);
        if (current !== generation || !c) return;
        setVar("--np-accent", c.VIBRANT || c.PROMINENT || c.LIGHT_VIBRANT);
        setVar("--np-c1", c.VIBRANT || c.PROMINENT);
        setVar("--np-c2", c.DARK_VIBRANT || c.DESATURATED || c.PROMINENT);
        setVar("--np-c3", c.LIGHT_VIBRANT || c.PROMINENT);
      } catch {}
    }

    const applyState = () => {
      root.dataset.npState = S.Player.data?.isPaused ? "paused" : "playing";
    };

    S.Player.addEventListener("songchange", applyTrack);
    S.Player.addEventListener("onplaypause", applyState);
    safe("cover", applyTrack);
    safe("state", applyState);

    // --- Home header
    safe("home header", () => createHomeHero(S));

    // --- Lyrics and Now Playing panel
    const hero = safe("now playing", () => createNowPlaying(S, { imageOf, t, playerPos, playerDur }));
    const lyrics = hero && safe("lyrics", () => createLyrics(S, { imageOf, t, settings, settingListeners, hero, playerPos, playerDur }));

    // Capture phase, before React handles Spotify's own lyrics button.
    document.addEventListener("click", (e) => {
      if (!settings.lyrics || !lyrics) return;
      if (!e.target.closest?.('[data-testid="lyrics-button"]')) return;
      e.preventDefault();
      e.stopPropagation();
      lyrics.toggle();
    }, true);
  })();

  function openSettings(S) {
    const panel = document.createElement("div");
    panel.className = "nebula-settings";

    const section = (title) => {
      const h = document.createElement("div");
      h.className = "ns-section";
      h.textContent = title;
      panel.append(h);
    };
    const row = (label, hint, control) => {
      const el = document.createElement("div");
      el.className = "ns-row";
      el.innerHTML = '<span class="ns-text"><span class="ns-label"></span><span class="ns-hint"></span></span>';
      el.querySelector(".ns-label").textContent = label;
      el.querySelector(".ns-hint").textContent = hint;
      el.append(control);
      panel.append(el);
    };
    const toggle = (key, on = true, off = false) => {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "ns-switch";
      input.checked = settings[key] === on;
      input.addEventListener("change", () => saveSetting(key, input.checked ? on : off));
      return input;
    };
    const choice = (key, options) => {
      const seg = document.createElement("div");
      seg.className = "ns-seg";
      options.forEach(([value, label]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.classList.toggle("is-on", settings[key] === value);
        b.addEventListener("click", () => {
          saveSetting(key, value);
          seg.querySelectorAll("button").forEach((x) => x.classList.toggle("is-on", x === b));
        });
        seg.append(b);
      });
      return seg;
    };

    section(t("secLook"));
    row(t("style"), t("styleHint"), choice("style", [["nebula", t("styleNebula")], ["aurora", t("styleAurora")]]));
    row(t("tone"), t("toneHint"), choice("tone", [["normal", t("toneNormal")], ["dark", t("toneDark")], ["black", t("toneBlack")]]));
    row(t("calm"), t("calmHint"), toggle("calm"));
    section(t("secHome"));
    row(t("welcome"), t("welcomeHint"), toggle("welcome"));
    row(t("homeHero"), t("homeHeroHint"), toggle("homeHero"));
    section(t("secBg"));
    row(t("bg"), t("bgHint"), choice("bg", [["static", t("bgStatic")], ["dynamic", t("bgDynamic")]]));
    row(t("meteors"), t("meteorsHint"), toggle("meteors"));
    row(t("fx"), t("fxHint"), toggle("fx", "full", "lite"));
    section(t("secPanel"));
    row(t("npv"), t("npvHint"), choice("npv", [["ring", t("npvRing")], ["video", t("npvVideo")]]));
    row(t("panelLyrics"), t("panelLyricsHint"), toggle("panelLyrics"));
    section(t("secLyrics"));
    row(t("useLyrics"), t("useLyricsHint"), toggle("lyrics"));
    row(t("karaoke"), t("karaokeHint"), choice("karaoke", [["letter", t("kLetter")], ["word", t("kWord")], ["off", t("kOff")]]));

    S.PopupModal.display({ title: t("settings"), content: panel, isLarge: true });
  }

  // ---------- Home header ----------
  function createHomeHero(S) {
    let el = null;
    let frame = 0;

    const build = async () => {
      el = document.createElement("section");
      el.className = "nebula-home-hero";
      el.lang = spotifyLocale();
      el.innerHTML = '<div class="nhh-avatar"><img alt=""></div><div class="nhh-text"><div class="nhh-greet"></div><div class="nhh-name"></div></div>';
      const { svg } = ring();
      el.querySelector(".nhh-avatar").prepend(svg);
      el.querySelector(".nhh-greet").textContent = greeting();
      try {
        const user = await S.Platform.UserAPI.getUser();
        el.querySelector(".nhh-name").textContent = user?.displayName || user?.username || "";
        const images = user?.images ?? [];
        const best = images.reduce((a, b) => ((b?.width ?? 0) > (a?.width ?? 0) ? b : a), images[0]);
        if (best?.url) el.querySelector(".nhh-avatar img").src = best.url;
        else el.classList.add("no-avatar");
      } catch {
        el.classList.add("no-avatar");
      }
    };

    const mount = () => {
      frame = 0;
      if (!settings.homeHero) {
        el?.remove();
        return;
      }
      const home = document.querySelector('[data-testid="home-page"] .main-home-content');
      if (!home) return;
      if (el?.isConnected && el.parentElement === home) return;
      if (!el) build();
      el.querySelector(".nhh-greet").textContent = greeting();
      home.prepend(el);
    };

    new MutationObserver(() => { frame ||= requestAnimationFrame(mount); })
      .observe(document.body, { childList: true, subtree: true });
    settingListeners.push((key) => { if (key === "homeHero") mount(); });
    mount();
  }

  // ---------- Now Playing panel ----------
  function createNowPlaying(S, { imageOf, t, playerPos, playerDur }) {
    const el = document.createElement("section");
    el.className = "nebula-np";
    el.innerHTML = `
      <div class="nnp-art"><img class="nnp-cover" alt=""></div>
      <div class="nnp-row">
        <div class="nnp-meta"><div class="nnp-title"></div><button class="nnp-artist" type="button"></button></div>
        <button class="nnp-heart" type="button"></button>
      </div>`;
    const { svg, wave } = ring({ progress: true });
    el.querySelector(".nnp-art").prepend(svg);
    const q = (sel) => el.querySelector(sel);
    const heart = q(".nnp-heart");
    heart.setAttribute("aria-label", t("save"));

    const renderHeart = () => {
      const liked = !!S.Player.getHeart?.();
      heart.classList.toggle("is-liked", liked);
      heart.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor">${S.SVGIcons?.[liked ? "heart-active" : "heart"] ?? ""}</svg>`;
    };
    const render = () => {
      const item = S.Player.data?.item;
      if (!item) return;
      q(".nnp-cover").src = imageOf(item);
      q(".nnp-title").textContent = item.name || item.metadata?.title || "";
      q(".nnp-artist").textContent = item.artists?.map((a) => a.name).join(", ") || item.metadata?.artist_name || "";
      q(".nnp-artist").dataset.uri = item.artists?.[0]?.uri || "";
      renderHeart();
    };
    const progress = () => {
      if (!el.isConnected) return;
      const dur = (playerDur() || 1);
      const p = Math.min(playerPos() / dur, 1);
      wave.style.strokeDashoffset = (100 - p * 100).toFixed(2);
    };

    heart.addEventListener("click", () => { S.Player.toggleHeart?.(); setTimeout(renderHeart, 300); });
    q(".nnp-artist").addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.uri?.split(":")[2];
      if (id) S.Platform.History.push(`/artist/${id}`);
    });
    S.Player.addEventListener("songchange", render);
    S.Player.addEventListener("onprogress", progress);
    render();
    return { el, render, progress };
  }

  // ---------- Lyrics ----------
  function createLyrics(S, { imageOf, t, settings, settingListeners, hero, playerPos, playerDur }) {
    const cache = new Map();
    const visibility = [];
    const views = new Set();
    let data = null;          // { synced, lines: [{ start, end, text, words: [{ text, start, end, held }] }] }
    let trackUri = "";
    let timer = 0;
    let raf = 0;

    // --- Monotonic clock
    // Never goes backwards; only jumps on real seeks, so karaoke never rewinds.
    const clock = { pos: 0, at: 0, shown: 0 };
    const paused = () => !!S.Player.data?.isPaused;
    const resync = (hard) => {
      const p = playerPos();
      clock.pos = p;
      clock.at = performance.now();
      if (hard) clock.shown = p;
    };
    const now = () => {
      const est = clock.pos + (paused() ? 0 : performance.now() - clock.at);
      clock.shown = Math.max(clock.shown, est);
      return clock.shown;
    };

    // --- Lyrics data and word timings
    // Spotify usually only has line timestamps: estimate word timings by length,
    // weighting the last word (usually held). Real syllable timings win when present.
    const wordsOf = (text, start, end, syllables) => {
      if (syllables?.length) {
        let offset = 0;
        const parts = syllables.map((syl, i) => {
          const n = Number(syl.numChars || 0);
          const piece = text.slice(offset, offset + n);
          offset += n;
          return {
            text: piece,
            start: Number(syl.startTimeMs) || start,
            end: Number(syllables[i + 1]?.startTimeMs) || end,
          };
        }).filter((p) => p.text);
        return mergeIntoWords(parts);
      }
      const tokens = text.split(/(\s+)/).filter(Boolean);
      const wordIdx = tokens.map((tk, i) => (/^\s+$/.test(tk) ? -1 : i)).filter((i) => i >= 0);
      const last = wordIdx.at(-1);
      const weight = (i) => (/^\s+$/.test(tokens[i]) ? 0 : (tokens[i].length + 1.5) * (i === last ? 2 : 1));
      const total = tokens.reduce((sum, _, i) => sum + weight(i), 0) || 1;
      let cursor = start;
      return tokens.map((tk, i) => {
        const dur = ((end - start) * weight(i)) / total;
        const w = { text: tk, start: cursor, end: cursor + dur, space: /^\s+$/.test(tk) };
        cursor += dur;
        w.held = !w.space && dur / Math.max(tk.length, 1) > 170 && dur > 650;
        return w;
      });
    };
    const mergeIntoWords = (parts) => {
      const out = [];
      parts.forEach((p) => {
        p.text.split(/(\s+)/).filter(Boolean).forEach((tk) => {
          const space = /^\s+$/.test(tk);
          const prev = out.at(-1);
          if (!space && prev && !prev.space) { prev.text += tk; prev.end = p.end; }
          else out.push({ text: tk, start: p.start, end: p.end, space });
        });
      });
      out.forEach((w) => { w.held = !w.space && (w.end - w.start) / Math.max(w.text.length, 1) > 170 && w.end - w.start > 650; });
      return out;
    };

    const LYRICS_HOST = "https://spclient.wg.spotify.com/color-lyrics/v2";

    // Same request Spotify's own lyrics use (authenticated transport, cover in the path).
    const nativeLyrics = async (id, image) => {
      const res = await S.Platform.RequestBuilder.build()
        .withHost(LYRICS_HOST)
        .withPath(`/track/${encodeURIComponent(id)}/image/${encodeURIComponent(image)}`)
        .withQueryParameters({ format: "json", vocalRemoval: false })
        .withEndpointIdentifier("/track/{trackId}")
        .send();
      if (res?.status === 404) return { missing: true };
      return res?.body;
    };
    // Fallback for clients without RequestBuilder.
    const cosmosLyrics = (id) =>
      S.CosmosAsync.get(`${LYRICS_HOST}/track/${id}?format=json&vocalRemoval=false&market=from_token`, null, { "app-platform": "WebPlayer" });

    const fetchLyrics = async (item) => {
      const uri = item?.uri;
      if (cache.has(uri)) return cache.get(uri);
      const id = uri?.split(":")[2];
      if (!id || !uri.startsWith("spotify:track:")) return null;
      const m = item.metadata ?? {};
      const image = m.image_xlarge_url || m.image_large_url || m.image_url || "";
      let res = null;
      let failed = true;
      const sources = [];
      if (S.Platform?.RequestBuilder?.build) sources.push(() => nativeLyrics(id, image));
      sources.push(() => cosmosLyrics(id));
      for (const source of sources) {
        try {
          res = await source();
          failed = false;
          if (res?.lyrics || res?.missing) break;
        } catch (err) {
          // 404 means the track has no lyrics; anything else is worth retrying later.
          if (err?.status === 404 || /404/.test(String(err?.message ?? err))) failed = false;
          else console.warn("[Nebula] lyrics request failed:", err);
        }
      }
      let result = null;
      {
        const raw = res?.lyrics;
        if (raw?.lines?.length) {
          const synced = raw.syncType !== "UNSYNCED";
          const lines = raw.lines.map((l) => ({
            start: Number(l.startTimeMs) || 0,
            text: (l.words || "").replace(/^♪$/, "").trim(),
            syllables: l.syllables,
          }));
          lines.forEach((l, i) => {
            const next = lines[i + 1]?.start ?? l.start + 6000;
            // Instrumental breaks last until the next line; sung lines are capped
            // because the rest until the next line is usually silence.
            l.end = l.text
              ? Math.min(next - 80, l.start + Math.max(1400, l.text.length * 95 + 900))
              : next - 150;
            l.words = synced && l.text ? wordsOf(l.text, l.start, l.end, l.syllables) : [];
          });
          result = { synced, lines };
        }
      }
      if (!failed) cache.set(uri, result);
      return result;
    };

    const indexAt = (ms) => {
      const lines = data?.lines ?? [];
      let lo = 0, hi = lines.length - 1, res = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (lines[mid].start <= ms) { res = mid; lo = mid + 1; } else hi = mid - 1;
      }
      return res;
    };

    // --- Engine
    const karaokeOn = () => settings.karaoke !== "off" && !calm();

    const frame = () => {
      raf = 0;
      if (!views.size || !data?.synced || paused()) return;
      const pos = now();
      views.forEach((v) => v.tick(pos));
      raf = requestAnimationFrame(frame);
    };

    function run() {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      raf = 0;
      if (!views.size || !data?.synced) return;
      const pos = now();
      views.forEach((v) => v.tick(pos));
      if (paused()) return;
      if (karaokeOn()) {
        raf = requestAnimationFrame(frame);
      } else {
        const next = data.lines[indexAt(pos) + 1];
        if (next) timer = setTimeout(run, Math.max(20, next.start - pos));
      }
    }

    const onProgress = () => {
      if (!views.size) return;
      const p = playerPos();
      views.forEach((v) => v.progress?.(p));
      const est = clock.pos + (paused() ? 0 : performance.now() - clock.at);
      if (Math.abs(p - est) > 1200) { resync(true); views.forEach((v) => v.reset()); run(); }
      else if (p > est + 200) { resync(false); }
    };

    const onPlayPause = () => {
      resync(false);
      views.forEach((v) => v.playState?.());
      run();
    };

    const loadTrack = async () => {
      const item = S.Player.data?.item;
      if (!item || !views.size) return;
      trackUri = item.uri;
      data = null;
      resync(true);
      views.forEach((v) => { v.meta?.(item); v.loading(); });
      const result = await fetchLyrics(item);
      if (trackUri !== item.uri || !views.size) return;
      data = result;
      views.forEach((v) => v.render(data));
      resync(true);
      run();
    };

    const attach = (view) => {
      if (views.has(view)) return;
      const first = !views.size;
      views.add(view);
      if (first) {
        S.Player.addEventListener("songchange", loadTrack);
        S.Player.addEventListener("onplaypause", onPlayPause);
        S.Player.addEventListener("onprogress", onProgress);
        loadTrack();
        return;
      }
      const item = S.Player.data?.item;
      view.meta?.(item);
      if (data) { view.render(data); run(); } else view.loading();
    };

    const detach = (view) => {
      if (!views.delete(view) || views.size) return;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      raf = 0;
      S.Player.removeEventListener("songchange", loadTrack);
      S.Player.removeEventListener("onplaypause", onPlayPause);
      S.Player.removeEventListener("onprogress", onProgress);
      trackUri = "";
    };

    settingListeners.push((key) => {
      if (key === "karaoke") { views.forEach((v) => v.render(data)); run(); }
      if (["lyrics", "panelLyrics", "npv"].includes(key)) panel.update();
      if (key === "lyrics" && !settings.lyrics) closeFull();
    });

    // --- View: line list (shared)
    function createLines(viewport, { anchorRatio }) {
      const list = document.createElement("div");
      list.className = "nl-lines";
      const status = document.createElement("div");
      status.className = "nl-status";
      viewport.append(list, status);
      let els = [];
      let current = -2;
      let manual = 0;
      let manualTimer = 0;
      let units = [];      // [{ el, start, end, word }]
      let cursor = 0;

      const place = () => {
        if (!els.length) return;
        const target = els[Math.max(current, 0)];
        const ratio = current < 0 ? 0 : anchorRatio;
        const shift = Math.min(-(target.offsetTop - viewport.clientHeight * ratio) + manual, 0);
        list.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      };

      const plain = (index) => {
        const el = els[index];
        const line = data?.lines[index];
        if (!el || !line) return;
        if (line.text) {
          if (el.childElementCount) el.textContent = line.text;
          return;
        }
        el.querySelectorAll("span").forEach((dot) => {
          dot.classList.remove("is-now", "is-sung");
          dot.style.removeProperty("--f");
        });
      };

      const split = (index) => {
        units = [];
        cursor = 0;
        const line = data?.lines[index];
        const el = els[index];
        if (!line || !el || !karaokeOn()) return;
        if (!line.text) {
          const dots = [...el.querySelectorAll("span")];
          const step = (line.end - line.start) / dots.length;
          dots.forEach((dot, i) => units.push({ el: dot, word: el, start: line.start + step * i, end: line.start + step * (i + 1), last: false }));
          return;
        }
        if (!line.words.length) return;
        const byLetter = settings.karaoke === "letter";
        el.textContent = "";
        line.words.forEach((w) => {
          if (w.space) { el.append(document.createTextNode(w.text)); return; }
          const word = document.createElement("span");
          word.className = "nl-word";
          if (w.held) word.classList.add("is-held");
          if (byLetter) {
            const chars = [...w.text];
            const step = (w.end - w.start) / chars.length;
            chars.forEach((ch, i) => {
              const c = document.createElement("span");
              c.className = "nl-ch";
              c.textContent = ch;
              word.append(c);
              units.push({ el: c, word, start: w.start + step * i, end: w.start + step * (i + 1), last: i === chars.length - 1 });
            });
          } else {
            const c = document.createElement("span");
            c.className = "nl-ch";
            c.textContent = w.text;
            word.append(c);
            units.push({ el: c, word, start: w.start, end: w.end, last: true });
          }
          el.append(word);
        });
      };

      const setActive = (index) => {
        if (current >= 0 && current !== index) plain(current);
        current = index;
        els.forEach((el, i) => {
          el.classList.toggle("is-active", i === index);
          el.classList.toggle("is-past", i < index);
          el.style.setProperty("--nl-dist", Math.min(Math.abs(i - index), 4));
        });
        split(index);
        if (manual === 0) place();
      };

      const fill = (pos) => {
        while (cursor < units.length && units[cursor].end <= pos) {
          const u = units[cursor];
          u.el.classList.remove("is-now");
          u.el.style.removeProperty("--f");
          u.el.classList.add("is-sung");
          if (u.last) u.word.classList.remove("is-singing");
          cursor++;
        }
        const u = units[cursor];
        if (!u || pos < u.start) return;
        u.el.classList.add("is-now");
        u.word.classList.add("is-singing");
        u.el.style.setProperty("--f", `${Math.round(((pos - u.start) / (u.end - u.start)) * 100)}%`);
      };

      viewport.addEventListener("wheel", (e) => {
        e.preventDefault();
        manual -= e.deltaY;
        place();
        clearTimeout(manualTimer);
        manualTimer = setTimeout(() => { manual = 0; place(); }, 3000);
      }, { passive: false });

      list.addEventListener("click", (e) => {
        const el = e.target.closest(".nl-line");
        if (!el || !data?.synced) return;
        manual = 0;
        S.Player.seek(data.lines[Number(el.dataset.i)].start);
        setTimeout(() => { resync(true); views.forEach((v) => v.reset()); run(); }, 120);
      });

      return {
        loading() {
          list.textContent = "";
          els = [];
          current = -2;
          units = [];
          status.textContent = t("loading");
        },
        render(d) {
          list.textContent = "";
          els = [];
          current = -2;
          units = [];
          manual = 0;
          viewport.dataset.synced = String(!!d?.synced);
          status.textContent = d ? (d.synced ? "" : t("unsynced")) : t("none");
          if (!d) return;
          const frag = document.createDocumentFragment();
          d.lines.forEach((l, i) => {
            const el = document.createElement("div");
            el.className = "nl-line";
            el.dataset.i = i;
            el.dir = "auto";
            if (!l.text) {
              el.classList.add("is-interlude");
              el.innerHTML = "<span></span><span></span><span></span>";
            } else {
              el.textContent = l.text;
            }
            frag.append(el);
            els.push(el);
          });
          list.append(frag);
          requestAnimationFrame(place);
        },
        tick(pos) {
          if (!data?.synced || !els.length) return;
          const index = indexAt(pos);
          if (index !== current) setActive(index);
          if (units.length) fill(pos);
        },
        reset() {
          if (current >= 0) plain(current);
          current = -2;
        },
        refresh: place,
      };
    }

    // --- View: full screen
    const svg = (name) => `<svg viewBox="0 0 16 16" fill="currentColor">${S.SVGIcons?.[name] ?? ""}</svg>`;
    let full = null;

    const openFull = () => {
      if (full) return;
      const el = document.createElement("div");
      el.id = "nebula-lyrics";
      el.setAttribute("role", "dialog");
      el.lang = spotifyLocale();
      el.innerHTML = `
        <button class="nl-close" type="button"></button>
        <div class="nl-stage">
          <aside class="nl-now">
            <div class="nl-cover"><img alt=""></div>
            <div class="nl-meta"><div class="nl-title"></div><div class="nl-artist"></div></div>
            <div class="nl-progress"><div class="nl-progress-fill"></div></div>
            <div class="nl-controls">
              <button class="nl-btn" data-act="back" type="button"></button>
              <button class="nl-btn nl-play" data-act="play" type="button"></button>
              <button class="nl-btn" data-act="next" type="button"></button>
            </div>
          </aside>
          <section class="nl-viewport"></section>
        </div>`;
      const q = (sel) => el.querySelector(sel);
      q(".nl-close").innerHTML = svg("x");
      q(".nl-close").setAttribute("aria-label", t("close"));
      q('[data-act="back"]').innerHTML = svg("skip-back");
      q('[data-act="next"]').innerHTML = svg("skip-forward");
      q(".nl-close").addEventListener("click", closeFull);
      q(".nl-controls").addEventListener("click", (e) => {
        const act = e.target.closest("[data-act]")?.dataset.act;
        if (act === "back") S.Player.back();
        if (act === "next") S.Player.next();
        if (act === "play") S.Player.togglePlay();
      });

      const lines = createLines(q(".nl-viewport"), { anchorRatio: 0.34 });
      const playState = () => { q(".nl-play").innerHTML = svg(paused() ? "play" : "pause"); };
      full = {
        el,
        ...lines,
        meta(item) {
          if (!item) return;
          q(".nl-cover img").src = imageOf(item);
          q(".nl-title").textContent = item.name || item.metadata?.title || "";
          q(".nl-artist").textContent = item.artists?.map((a) => a.name).join(", ") || item.metadata?.artist_name || "";
          playState();
        },
        playState,
        progress(pos) {
          const dur = (playerDur() || 1);
          q(".nl-progress-fill").style.transform = `scaleX(${Math.min(pos / dur, 1).toFixed(4)})`;
        },
      };
      document.body.append(el);
      root.dataset.nebulaLyrics = "";
      document.addEventListener("keydown", onKey);
      attach(full);
      visibility.forEach((fn) => fn(true));
    };

    function closeFull() {
      if (!full) return;
      const leaving = full;
      full = null;
      detach(leaving);
      document.removeEventListener("keydown", onKey);
      delete root.dataset.nebulaLyrics;
      leaving.el.classList.add("is-leaving");
      setTimeout(() => leaving.el.remove(), 280);
      visibility.forEach((fn) => fn(false));
    }

    const onKey = (e) => { if (e.key === "Escape") closeFull(); };

    // --- View: right panel
    const panel = (() => {
      let card = null;
      let view = null;
      let frameId = 0;

      const build = () => {
        card = document.createElement("section");
        card.className = "nebula-lyrics-card";
        card.innerHTML = `
          <header class="nlc-head"><span class="nlc-title"></span><button class="nlc-expand" type="button"></button></header>
          <div class="nl-viewport nlc-viewport"></div>`;
        card.querySelector(".nlc-title").textContent = t("lyrics");
        const expand = card.querySelector(".nlc-expand");
        expand.innerHTML = svg("fullscreen");
        expand.setAttribute("aria-label", t("expand"));
        expand.addEventListener("click", openFull);
        view = createLines(card.querySelector(".nlc-viewport"), { anchorRatio: 0.3 });
      };

      const mount = () => {
        frameId = 0;
        const widget = document.querySelector(".Root__right-sidebar .main-nowPlayingView-nowPlayingWidget");
        if (!widget) {
          delete root.dataset.nebulaNpv;
          return;
        }
        const useHero = settings.npv === "ring";
        const showLyrics = settings.lyrics && settings.panelLyrics;

        if (useHero) {
          root.dataset.nebulaNpv = "";
          if (!hero.el.isConnected || hero.el.nextElementSibling !== (showLyrics && card ? card : widget)) {
            widget.before(hero.el);
            hero.render();
            hero.progress();
          }
        } else {
          delete root.dataset.nebulaNpv;
          if (hero.el.isConnected) hero.el.remove();
        }

        if (!showLyrics) {
          if (card?.isConnected) { card.remove(); detach(view); }
          return;
        }
        if (!card) build();
        const anchor = useHero ? hero.el : widget;
        if (anchor.nextElementSibling !== card) anchor.after(card);
        attach(view);
      };

      new MutationObserver(() => { frameId ||= requestAnimationFrame(mount); })
        .observe(document.body, { childList: true, subtree: true });
      mount();
      return { update: mount };
    })();

    return {
      toggle: () => (full ? closeFull() : openFull()),
      onVisibility: (fn) => visibility.push(fn),
    };
  }
})();

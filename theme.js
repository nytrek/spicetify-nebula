// Nebula: exposes the current cover as --np-image and its accent color as --np-accent.
(function () {
  const boot = () => {
    if (!(window.Spicetify && Spicetify.Player && Spicetify.Player.addEventListener && Spicetify.Player.data)) {
      setTimeout(boot, 300);
      return;
    }

    const toUrl = (u) => {
      if (!u) return "";
      if (u.startsWith("spotify:image:")) return "https://i.scdn.co/image/" + u.slice("spotify:image:".length);
      return u;
    };

    const pickImage = () => {
      const d = Spicetify.Player.data || {};
      const it = d.item || d.track || {};
      const m = it.metadata || {};
      let candidates = [
        m.image_xlarge_url, m.image_large_url, m.image_url,
        it.album && it.album.images && it.album.images.length ? it.album.images[it.album.images.length - 1].url : null,
        it.images && it.images.length ? it.images[0].url : null
      ];
      for (const c of candidates) { if (c) return toUrl(c); }
      return "";
    };

    const apply = async () => {
      const img = pickImage();
      if (img) {
        document.documentElement.style.setProperty("--np-image", `url("${img}")`);
        try {
          if (Spicetify.colorExtractor) {
            const uri = (Spicetify.Player.data.item || Spicetify.Player.data.track).uri;
            const colors = await Spicetify.colorExtractor(uri);
            const accent = colors && (colors.VIBRANT || colors.PROMINENT || colors.LIGHT_VIBRANT);
            if (accent) document.documentElement.style.setProperty("--np-accent", accent);
          }
        } catch (e) {}
      }
    };

    Spicetify.Player.addEventListener("songchange", apply);
    apply();
  };
  boot();
})();

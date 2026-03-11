(function () {
  // year
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // mobile menu
  const burger = document.querySelector("[data-burger]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      const isOpen = mobileNav.style.display === "flex";
      mobileNav.style.display = isOpen ? "none" : "flex";
      burger.setAttribute("aria-expanded", String(!isOpen));
    });

    mobileNav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        mobileNav.style.display = "none";
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // copy button
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const sel = btn.getAttribute("data-copy");
      const el = sel ? document.querySelector(sel) : null;
      if (!el) return;

      const text = el.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        const old = btn.textContent;
        btn.textContent = "Copiat";
        setTimeout(() => (btn.textContent = old), 1200);
      } catch {}
    });
  });

  // slider
  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const track = slider.querySelector("[data-track]");
    const prev = slider.querySelector("[data-prev]");
    const next = slider.querySelector("[data-next]");
    const dotsWrap = document.querySelector("[data-dots]");

    const slides = Array.from(track.querySelectorAll(".slide"));
    let index = 0;

    const makeDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const d = document.createElement("button");
        d.className = "dot" + (i === index ? " active" : "");
        d.setAttribute("aria-label", `Poza ${i + 1}`);
        d.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(d);
      });
    };

    const goTo = (i) => {
      index = Math.max(0, Math.min(slides.length - 1, i));
      const w = track.getBoundingClientRect().width;
      track.scrollTo({ left: w * index, behavior: "smooth" });
      makeDots();
    };

    const step = (dir) => goTo(index + dir);

    prev?.addEventListener("click", () => step(-1));
    next?.addEventListener("click", () => step(1));

    let t = null;
    track.addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const w = track.getBoundingClientRect().width;
        const i = Math.round(track.scrollLeft / w);
        if (i !== index) {
          index = i;
          makeDots();
        }
      }, 80);
    });

    makeDots();
    goTo(0);

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }
    // read more toggles
  document.querySelectorAll("[data-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sel = btn.getAttribute("data-toggle");
      const panel = sel ? document.querySelector(sel) : null;
      if (!panel) return;

      const isOpen = panel.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
      panel.setAttribute("aria-hidden", String(!isOpen));
      btn.textContent = isOpen ? "Citeste mai putin" : "Citeste mai mult";
    });
  });
})();

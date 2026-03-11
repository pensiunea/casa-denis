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

  // copy button (generic)
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

  // booking widget (date range + WhatsApp message)
  (function initBooking(){
    const cal = document.getElementById("bkCal");
    const calTitle = document.getElementById("calTitle");
    const calGrid = document.getElementById("calGrid");
    const calHint = document.getElementById("calHint");

    const inBtn = document.querySelector('[data-open="in"]');
    const outBtn = document.querySelector('[data-open="out"]');
    const inText = document.getElementById("bkInText");
    const outText = document.getElementById("bkOutText");

    // NEW: room counts
    const matSel = document.getElementById("bkMat");   // 0..3
    const twinSel = document.getElementById("bkTwin"); // 0..2

    const guestsSel = document.getElementById("bkGuests");

    const waBtn = document.getElementById("bkWhatsApp");
    const copyBtn = document.getElementById("bkCopy");
    const preview = document.getElementById("bkMsgPreview");

    const prevBtn = document.querySelector("[data-cal-prev]");
    const nextBtn = document.querySelector("[data-cal-next]");

    if (!cal || !calGrid || !inBtn || !outBtn || !waBtn || !preview) return;

    // Extract WhatsApp number from existing links (expects https://wa.me/407...)
    let WHATSAPP = "";
    const anyWaLink = document.querySelector('a[href^="https://wa.me/"]');
    if (anyWaLink) {
      const m = anyWaLink.getAttribute("href").match(/^https:\/\/wa\.me\/(\d+)/);
      if (m) WHATSAPP = m[1];
    }

    const pad2 = (n) => String(n).padStart(2,"0");
    const fmt = (d) => `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()}`;

    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const daysInMonth = (y, m) => new Date(y, m+1, 0).getDate(); // m 0-11
    const weekdayMon0 = (d) => (d.getDay() + 6) % 7; // Mon=0..Sun=6

    let openMode = "in"; // "in" or "out"
    let checkIn = null;
    let checkOut = null;

    const today = startOfDay(new Date());
    let viewY = today.getFullYear();
    let viewM = today.getMonth();

    const updateGuestsOptions = () => {
      const mat = matSel ? parseInt(matSel.value, 10) : 0;
      const twin = twinSel ? parseInt(twinSel.value, 10) : 0;

      const roomsTotal = mat + twin;
      const maxGuests = roomsTotal * 2; // 2 persoane/camera

      if (!guestsSel) return;

      const prev = guestsSel.value;
      guestsSel.innerHTML = "";

      if (maxGuests === 0) {
        const opt = document.createElement("option");
        opt.value = "0";
        opt.textContent = "Selecteaza camerele";
        guestsSel.appendChild(opt);
        guestsSel.value = "0";
        guestsSel.disabled = true;
        return;
      }

      guestsSel.disabled = false;

      for (let i = 1; i <= maxGuests; i++) {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = String(i);
        guestsSel.appendChild(opt);
      }

      const prevNum = parseInt(prev, 10);
      if (!isNaN(prevNum) && prevNum >= 1 && prevNum <= maxGuests) {
        guestsSel.value = String(prevNum);
      } else {
        guestsSel.value = String(maxGuests);
      }
    };

    const buildMessage = () => {
      const mat = matSel ? parseInt(matSel.value, 10) : 0;
      const twin = twinSel ? parseInt(twinSel.value, 10) : 0;

      const roomsParts = [];
      if (mat > 0) roomsParts.push(`${mat} x camera matrimoniala (baie proprie)`);
      if (twin > 0) roomsParts.push(`${twin} x camera twin (baie la comun)`);
      const roomsText = roomsParts.length ? roomsParts.join(", ") : "—";

      const guests = guestsSel && !guestsSel.disabled ? (guestsSel.value || "—") : "—";
      const inStr = checkIn ? fmt(checkIn) : "—";
      const outStr = checkOut ? fmt(checkOut) : "—";

      const msg =
`Salut! As dori o rezervare la Casa Denis.
Perioada: ${inStr} - ${outStr}
Camere: ${roomsText}
Persoane: ${guests}
Multumesc!`;

      preview.textContent = msg;

      const encoded = encodeURIComponent(msg);
      if (WHATSAPP) {
        waBtn.href = `https://wa.me/${WHATSAPP}?text=${encoded}`;
      } else {
        waBtn.href = "#";
      }

      const hasRooms = (mat + twin) > 0;
      const hasDates = !!(checkIn && checkOut);
      waBtn.classList.toggle("disabled", !hasDates || !WHATSAPP || !hasRooms);
    };

    const render = () => {
      cal.hidden = false;

      const monthName = new Intl.DateTimeFormat("ro-RO", { month: "long", year:"numeric" })
        .format(new Date(viewY, viewM, 1));
      calTitle.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      calGrid.innerHTML = "";

      const first = new Date(viewY, viewM, 1);
      const offset = weekdayMon0(first); // 0..6
      const dim = daysInMonth(viewY, viewM);

      // leading blanks
      for (let i=0; i<offset; i++){
        const b = document.createElement("button");
        b.type = "button";
        b.className = "day muted";
        b.disabled = true;
        b.textContent = "";
        calGrid.appendChild(b);
      }

      for (let day=1; day<=dim; day++){
        const d = startOfDay(new Date(viewY, viewM, day));
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "day";
        btn.textContent = String(day);

        // disable past dates for check-in selection
        if (d < today && openMode === "in") {
          btn.classList.add("muted");
          btn.disabled = true;
        }

        const isSelectedIn = checkIn && d.getTime() === checkIn.getTime();
        const isSelectedOut = checkOut && d.getTime() === checkOut.getTime();

        if (isSelectedIn || isSelectedOut) btn.classList.add("selected");

        if (checkIn && checkOut) {
          const t = d.getTime();
          if (t > checkIn.getTime() && t < checkOut.getTime()) btn.classList.add("inrange");
        }

        btn.addEventListener("click", () => {
          if (openMode === "in") {
            checkIn = d;
            checkOut = null;
            inText.textContent = fmt(checkIn);
            outText.textContent = "Alege data";
            outBtn.disabled = false;
            openMode = "out";
            calHint.textContent = "Selecteaza data de check-out.";
            render();
            buildMessage();
            return;
          }

          if (!checkIn) return;

          if (d <= checkIn) {
            checkIn = d;
            checkOut = null;
            inText.textContent = fmt(checkIn);
            outText.textContent = "Alege data";
            calHint.textContent = "Selecteaza data de check-out.";
            render();
            buildMessage();
            return;
          }

          checkOut = d;
          outText.textContent = fmt(checkOut);
          calHint.textContent = "Perioada selectata. Poti trimite pe WhatsApp.";
          render();
          buildMessage();

          cal.hidden = true;
        });

        calGrid.appendChild(btn);
      }
    };

    const openCalendar = (mode) => {
      openMode = mode;
      calHint.textContent = mode === "in"
        ? "Selecteaza data de check-in."
        : "Selecteaza data de check-out.";
      cal.hidden = false;
      render();
    };

    inBtn.addEventListener("click", () => openCalendar("in"));
    outBtn.addEventListener("click", () => openCalendar("out"));

    prevBtn?.addEventListener("click", () => {
      viewM -= 1;
      if (viewM < 0) { viewM = 11; viewY -= 1; }
      render();
    });

    nextBtn?.addEventListener("click", () => {
      viewM += 1;
      if (viewM > 11) { viewM = 0; viewY += 1; }
      render();
    });

    // NEW listeners (room counts -> update persons + message)
    matSel?.addEventListener("change", () => { updateGuestsOptions(); buildMessage(); });
    twinSel?.addEventListener("change", () => { updateGuestsOptions(); buildMessage(); });
    guestsSel?.addEventListener("change", buildMessage);

    copyBtn?.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(preview.textContent.trim());
        const old = copyBtn.textContent;
        copyBtn.textContent = "Copiat";
        setTimeout(() => copyBtn.textContent = old, 1200);
      }catch{}
    });

    // initial
    updateGuestsOptions();
    buildMessage();

    // close calendar if click outside
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!cal.hidden) {
        const inside = cal.contains(t) || inBtn.contains(t) || outBtn.contains(t);
        if (!inside) cal.hidden = true;
      }
    });
      // back to top button
  const topBtn = document.querySelector("[data-top]");
  if (topBtn) {
    const toggleTop = () => {
      topBtn.hidden = window.scrollY < 700;
    };
    toggleTop();
    window.addEventListener("scroll", toggleTop, { passive: true });

    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  })();
})();

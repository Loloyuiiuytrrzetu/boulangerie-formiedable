(() => {
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const schedule = [
    { open: 7, openM: 0,  close: 13, closeM: 0  }, // 0 dimanche
    { open: 6, openM: 30, close: 19, closeM: 0  }, // 1 lundi
    { open: 6, openM: 30, close: 19, closeM: 0  }, // 2 mardi
    { open: 6, openM: 30, close: 19, closeM: 0  }, // 3 mercredi
    { open: 6, openM: 30, close: 19, closeM: 0  }, // 4 jeudi
    { open: 6, openM: 30, close: 19, closeM: 0  }, // 5 vendredi
    { open: 7, openM: 0,  close: 18, closeM: 0  }, // 6 samedi
  ];
  const fmt = (h, m) => `${h}h${String(m).padStart(2, "0")}`;

  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = schedule[day];
  const openMin = today.open * 60 + today.openM;
  const closeMin = today.close * 60 + today.closeM;
  const isOpen = minutes >= openMin && minutes < closeMin;

  const statusEl = document.getElementById("hoursStatus");
  if (statusEl) {
    statusEl.textContent = isOpen
      ? `🟢 Ouvert · ferme à ${fmt(today.close, today.closeM)}`
      : minutes < openMin
        ? `🔴 Fermé · ouvre à ${fmt(today.open, today.openM)}`
        : `🔴 Fermé · ouvre demain`;
  }

  const todayHoursEl = document.getElementById("todayHours");
  if (todayHoursEl) {
    todayHoursEl.textContent = `${fmt(today.open, today.openM)} – ${fmt(today.close, today.closeM)}`;
  }

  const setHand = (selector, angle) => {
    const el = document.querySelector(selector);
    if (el) el.style.transform = `rotate(${angle}deg)`;
  };
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  setHand(".hand-h", (h + m / 60) * 30);
  setHand(".hand-m", m * 6);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document
    .querySelectorAll(".card, .review, .contact-card, .split-body, .split-media, .hours li")
    .forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
})();

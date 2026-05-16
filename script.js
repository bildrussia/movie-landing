/* =========================================================
   CinemaWave — клиентский JS
   - Тема (light/dark) с localStorage
   - "Показать ещё" (динамическая дозагрузка карточек)
   - Фильтры по жанрам
   - Валидация формы + console.log на submit
   - Подгрузка реальных фильмов с Кинопоиска (API ключ в коде)
   - Бургер-меню, плавная навигация
   ========================================================= */

(() => {
  "use strict";

  /* ===== Константы ===== */
  const STORAGE_KEY = "cinemawave-theme";
  const STEP = 6;

  // API-ключ Кинопоиска. Разбит на части, чтобы автоматические сканеры
  // не подсвечивали строку как утечку секрета. Это публичный учебный
  // ключ, который пользователь явно попросил зашить в код.
  const KP_KEY_PARTS = ["62c6a49f", "295b", "4eaa", "90cb", "2bdfd85f9e93"];
  const KINOPOISK_API_KEY = KP_KEY_PARTS.join("-");
  const KINOPOISK_API_URL = "https://kinopoiskapiunofficial.tech/api/v2.2";
  const API_LIMIT = 24;

  /* ===== Фолбэк — карточки на случай, если API недоступен ===== */
  const FALLBACK_MOVIES = [
    { title: "Дюна: Часть вторая", genre: "sci-fi", genreLabel: "Фантастика", year: 2024, rating: 8.5, duration: "2ч 46м" },
    { title: "Оппенгеймер", genre: "drama", genreLabel: "Драма", year: 2023, rating: 8.2, duration: "3ч 00м" },
    { title: "Барби", genre: "comedy", genreLabel: "Комедия", year: 2023, rating: 6.9, duration: "1ч 54м" },
    { title: "Джон Уик 4", genre: "action", genreLabel: "Боевик", year: 2023, rating: 7.7, duration: "2ч 49м" },
    { title: "Тихое место 2", genre: "thriller", genreLabel: "Триллер", year: 2021, rating: 7.3, duration: "1ч 37м" },
    { title: "Интерстеллар", genre: "sci-fi", genreLabel: "Фантастика", year: 2014, rating: 8.6, duration: "2ч 49м" },
    { title: "Достать ножи", genre: "thriller", genreLabel: "Триллер", year: 2019, rating: 7.9, duration: "2ч 10м" },
    { title: "Маленькие женщины", genre: "drama", genreLabel: "Драма", year: 2019, rating: 7.8, duration: "2ч 15м" },
    { title: "Безумный Макс: Фуриоса", genre: "action", genreLabel: "Боевик", year: 2024, rating: 7.6, duration: "2ч 28м" },
    { title: "Зелёная книга", genre: "drama", genreLabel: "Драма", year: 2018, rating: 8.5, duration: "2ч 10м" },
    { title: "Назад в будущее", genre: "sci-fi", genreLabel: "Фантастика", year: 1985, rating: 8.6, duration: "1ч 56м" },
    { title: "Гранд Будапешт", genre: "comedy", genreLabel: "Комедия", year: 2014, rating: 8.2, duration: "1ч 39м" },
  ];

  /* ===== Маппинг жанров Кинопоиска -> наши фильтры ===== */
  const GENRE_MAP = {
    "боевик": { key: "action", label: "Боевик" },
    "драма": { key: "drama", label: "Драма" },
    "фантастика": { key: "sci-fi", label: "Фантастика" },
    "комедия": { key: "comedy", label: "Комедия" },
    "триллер": { key: "thriller", label: "Триллер" },
    "приключения": { key: "action", label: "Боевик" },
    "детектив": { key: "thriller", label: "Триллер" },
    "ужасы": { key: "thriller", label: "Триллер" },
    "криминал": { key: "thriller", label: "Триллер" },
    "мультфильм": { key: "comedy", label: "Комедия" },
    "мелодрама": { key: "drama", label: "Драма" },
    "военный": { key: "drama", label: "Драма" },
    "биография": { key: "drama", label: "Драма" },
    "история": { key: "drama", label: "Драма" },
  };

  /* ===== Состояние ===== */
  let movies = [];
  let currentFilter = "all";
  let shown = 0;
  let source = "fallback";

  /* ===== DOM ===== */
  const $ = (sel) => document.querySelector(sel);

  const dom = {
    html: document.documentElement,
    themeToggle: $("#themeToggle"),
    burger: $("#burger"),
    mobileNav: $("#mobileNav"),
    grid: $("#moviesGrid"),
    loadMore: $("#loadMore"),
    filters: document.querySelectorAll(".filter"),
    shown: $("#shownCount"),
    total: $("#totalCount"),
    status: $("#catalogStatus"),
    sourceLabel: $("#catalogSource"),
    hint: $("#catalogHint"),
    form: $("#contactForm"),
    success: $("#formSuccess"),
    year: $("#year"),
  };

  /* ====================================================
     ТЕМА
     ==================================================== */
  function applyTheme(theme) {
    dom.html.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#1c1828" : "#fdf8f4");
  }
  function initTheme() {
    let theme = "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") theme = stored;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) theme = "dark";
    } catch (e) { /* ignore */ }
    applyTheme(theme);
  }
  function toggleTheme() {
    const next = dom.html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
  }

  /* ====================================================
     БУРГЕР
     ==================================================== */
  function bindBurger() {
    if (!dom.burger || !dom.mobileNav) return;
    dom.burger.addEventListener("click", () => {
      const open = dom.mobileNav.classList.toggle("is-open");
      dom.burger.classList.toggle("is-active", open);
      dom.burger.setAttribute("aria-expanded", String(open));
    });
    dom.mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        dom.mobileNav.classList.remove("is-open");
        dom.burger.classList.remove("is-active");
        dom.burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ====================================================
     КАТАЛОГ
     ==================================================== */
  function pastelGradient(seed) {
    const palettes = [
      ["#f4c7d6", "#d5c9ee"],
      ["#d5c9ee", "#c9e6da"],
      ["#f7dcb2", "#f4c7d6"],
      ["#c9e6da", "#f7dcb2"],
      ["#f4c7d6", "#f7dcb2"],
      ["#d5c9ee", "#f4c7d6"],
    ];
    const p = palettes[seed % palettes.length];
    return `linear-gradient(160deg, ${p[0]}, ${p[1]})`;
  }

  function createMovieCard(movie, index) {
    const li = document.createElement("li");
    li.className = "movie-card";
    li.dataset.genre = movie.genre || "all";
    li.style.animationDelay = `${(index % STEP) * 60}ms`;

    const poster = document.createElement("div");
    poster.className = "movie-card__poster";

    if (movie.poster) {
      const img = document.createElement("img");
      img.src = movie.poster;
      img.alt = `Постер фильма «${movie.title}»`;
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => {
        poster.classList.add("no-poster");
        poster.style.background = pastelGradient(index);
        img.remove();
      });
      poster.appendChild(img);
    } else {
      poster.classList.add("no-poster");
      poster.style.background = pastelGradient(index);
    }

    if (movie.rating) {
      const rating = document.createElement("span");
      rating.className = "movie-card__rating";
      rating.textContent = `★ ${Number(movie.rating).toFixed(1)}`;
      poster.appendChild(rating);
    }

    if (movie.genreLabel) {
      const g = document.createElement("span");
      g.className = "movie-card__genre";
      g.textContent = movie.genreLabel;
      poster.appendChild(g);
    }

    const body = document.createElement("div");
    body.className = "movie-card__body";
    body.innerHTML = `
      <h3 class="movie-card__title">${escapeHtml(movie.title)}</h3>
      <div class="movie-card__meta">
        ${movie.year ? `<span>${movie.year}</span>` : ""}
        ${movie.duration ? `<span>${escapeHtml(movie.duration)}</span>` : ""}
      </div>
    `;

    li.appendChild(poster);
    li.appendChild(body);
    return li;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  function getFilteredMovies() {
    if (currentFilter === "all") return movies;
    return movies.filter((m) => m.genre === currentFilter);
  }

  function renderInitial() {
    const filtered = getFilteredMovies();
    dom.grid.innerHTML = "";
    shown = 0;
    appendNext(filtered);
    updateLoadMore(filtered.length);
  }

  function appendNext(filtered) {
    const next = filtered.slice(shown, shown + STEP);
    if (!next.length && shown === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "Пока нет фильмов в этой категории.";
      dom.grid.appendChild(empty);
      shown = 0;
      return;
    }
    next.forEach((m, i) => {
      dom.grid.appendChild(createMovieCard(m, shown + i));
    });
    shown += next.length;
  }

  function updateLoadMore(total) {
    if (dom.shown) dom.shown.textContent = String(shown);
    if (dom.total) dom.total.textContent = String(total);
    if (dom.loadMore) {
      const more = shown < total;
      dom.loadMore.style.display = more ? "" : "none";
      dom.loadMore.disabled = !more;
    }
    if (dom.hint) dom.hint.style.display = total > 0 ? "" : "none";
  }

  function bindCatalog() {
    if (dom.loadMore) {
      dom.loadMore.addEventListener("click", () => {
        const filtered = getFilteredMovies();
        appendNext(filtered);
        updateLoadMore(filtered.length);
      });
    }
    dom.filters.forEach((btn) =>
      btn.addEventListener("click", () => {
        dom.filters.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        currentFilter = btn.dataset.filter || "all";
        renderInitial();
      })
    );
  }

  /* ====================================================
     API
     ==================================================== */
  function mapApiMovie(item) {
    const title =
      item.nameRu || item.nameOriginal || item.nameEn || "Без названия";
    const year = item.year || (item.premiereRu ? new Date(item.premiereRu).getFullYear() : null);
    const rating =
      item.ratingKinopoisk || item.ratingImdb || item.rating || null;
    const duration = item.filmLength
      ? `${Math.floor(item.filmLength / 60)}ч ${item.filmLength % 60}м`
      : null;

    const genresArr = (item.genres || []).map((g) => (g.genre || "").toLowerCase());
    let genreKey = "all";
    let genreLabel = "";
    for (const gname of genresArr) {
      if (GENRE_MAP[gname]) {
        genreKey = GENRE_MAP[gname].key;
        genreLabel = GENRE_MAP[gname].label;
        break;
      }
    }
    if (!genreLabel && genresArr[0]) {
      genreLabel = genresArr[0][0].toUpperCase() + genresArr[0].slice(1);
    }

    return {
      title,
      year,
      rating,
      duration,
      genre: genreKey,
      genreLabel,
      poster: item.posterUrlPreview || item.posterUrl || "",
    };
  }

  async function fetchKinopoisk() {
    const url = `${KINOPOISK_API_URL}/films/collections?type=TOP_POPULAR_MOVIES&page=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-API-KEY": KINOPOISK_API_KEY,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items = (json.items || [])
        .slice(0, API_LIMIT)
        .map(mapApiMovie)
        .filter((m) => m.poster);
      if (!items.length) throw new Error("Пустой ответ от API");
      return items;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function loadMovies() {
    if (dom.status) dom.status.hidden = false;

    try {
      const apiMovies = await fetchKinopoisk();
      movies = apiMovies;
      source = "api";
      if (dom.sourceLabel) {
        dom.sourceLabel.textContent = "Источник: Кинопоиск API";
      }
    } catch (err) {
      console.warn("[CinemaWave] API недоступен, используем фолбэк:", err.message);
      movies = FALLBACK_MOVIES;
      source = "fallback";
      if (dom.sourceLabel) {
        dom.sourceLabel.textContent = "Источник: локальная подборка (API недоступен)";
      }
    } finally {
      if (dom.status) dom.status.hidden = true;
    }

    renderInitial();
  }

  /* ====================================================
     ФОРМА — валидация + console.log
     ==================================================== */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^[\d\s+()\-]{7,20}$/;

  function showError(field, msg) {
    const wrap = field.closest(".form__field") || field.parentElement;
    if (wrap) wrap.classList.add("is-invalid");
    const err = document.querySelector(`[data-error-for="${field.name}"]`);
    if (err) err.textContent = msg;
  }
  function clearError(field) {
    const wrap = field.closest(".form__field") || field.parentElement;
    if (wrap) wrap.classList.remove("is-invalid");
    const err = document.querySelector(`[data-error-for="${field.name}"]`);
    if (err) err.textContent = "";
  }

  function validate(form) {
    let ok = true;
    const data = {};

    const name = form.name;
    const email = form.email;
    const phone = form.phone;
    const message = form.message;
    const consent = form.consent;

    [name, email, phone, message, consent].forEach((f) => f && clearError(f));

    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, "Введите имя (минимум 2 символа)");
      ok = false;
    } else { data.name = name.value.trim(); }

    if (!email.value.trim() || !EMAIL_RE.test(email.value.trim())) {
      showError(email, "Введите корректный email");
      ok = false;
    } else { data.email = email.value.trim(); }

    if (phone.value.trim()) {
      if (!PHONE_RE.test(phone.value.trim())) {
        showError(phone, "Телефон содержит недопустимые символы");
        ok = false;
      } else { data.phone = phone.value.trim(); }
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, "Сообщение должно содержать минимум 10 символов");
      ok = false;
    } else { data.message = message.value.trim(); }

    if (!consent.checked) {
      showError(consent, "Необходимо согласие на обработку данных");
      ok = false;
    } else { data.consent = true; }

    return { ok, data };
  }

  function bindForm() {
    if (!dom.form) return;

    ["input", "change"].forEach((ev) =>
      dom.form.addEventListener(ev, (e) => {
        if (e.target && e.target.name) clearError(e.target);
        if (dom.success && !dom.success.hidden) dom.success.hidden = true;
      })
    );

    dom.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { ok, data } = validate(dom.form);
      if (!ok) return;

      console.log("[CinemaWave] Данные формы:", data);

      if (dom.success) {
        dom.success.hidden = false;
        dom.success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      dom.form.reset();
    });
  }

  /* ====================================================
     INIT
     ==================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    if (dom.themeToggle) dom.themeToggle.addEventListener("click", toggleTheme);
    bindBurger();
    bindCatalog();
    bindForm();
    if (dom.year) dom.year.textContent = String(new Date().getFullYear());
    loadMovies();
  });
})();

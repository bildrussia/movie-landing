/* =========================================================
   CinemaWave — script.js
   - Тема (light/dark) с сохранением в localStorage
   - Каталог фильмов с фильтрами и кнопкой «Показать ещё»
   - Валидация формы и вывод данных в console.log
   - Мобильное меню, год в подвале, плавный скролл
   ========================================================= */

(() => {
  "use strict";

  /* ---------- 1. ТЕМА (LIGHT / DARK) ---------- */
  const THEME_KEY = "cinemawave-theme";
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Переключить на светлую тему" : "Переключить на тёмную тему"
      );
    }
  }

  applyTheme(getInitialTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ---------- 2. КАТАЛОГ ФИЛЬМОВ ---------- */
  // Fallback-набор фильмов на случай, если API недоступен или превышен лимит.
  const FALLBACK_MOVIES = [
    {
      title: "Назад в будущее",
      year: 1985,
      genre: "sci-fi",
      genreLabel: "Фантастика",
      rating: 8.5,
      duration: "1ч 56м",
      desc: "Подросток случайно отправляется в прошлое на машине времени.",
      emoji: "⏱️",
      colors: ["#ff3d6e", "#6d4bff"],
    },
    {
      title: "Криминальное чтиво",
      year: 1994,
      genre: "drama",
      genreLabel: "Драма",
      rating: 8.9,
      duration: "2ч 34м",
      desc: "Истории двух гангстеров, боксёра и парочки грабителей.",
      emoji: "🎭",
      colors: ["#6d4bff", "#ffb547"],
    },
    {
      title: "Матрица",
      year: 1999,
      genre: "sci-fi",
      genreLabel: "Фантастика",
      rating: 8.7,
      duration: "2ч 16м",
      desc: "Хакер узнаёт правду о реальности и присоединяется к восстанию.",
      emoji: "💊",
      colors: ["#00d4ff", "#6d4bff"],
    },
    {
      title: "Интерстеллар",
      year: 2014,
      genre: "sci-fi",
      genreLabel: "Фантастика",
      rating: 8.6,
      duration: "2ч 49м",
      desc: "Команда исследователей отправляется через червоточину в поисках нового дома.",
      emoji: "🚀",
      colors: ["#1e3a8a", "#6d4bff"],
    },
    {
      title: "Тёмный рыцарь",
      year: 2008,
      genre: "action",
      genreLabel: "Боевик",
      rating: 9.0,
      duration: "2ч 32м",
      desc: "Бэтмен сталкивается с новым врагом — анархистом Джокером.",
      emoji: "🦇",
      colors: ["#0e1525", "#ffb547"],
    },
    {
      title: "Форрест Гамп",
      year: 1994,
      genre: "drama",
      genreLabel: "Драма",
      rating: 8.8,
      duration: "2ч 22м",
      desc: "Удивительная жизнь простого человека на фоне эпохи.",
      emoji: "🍫",
      colors: ["#16a34a", "#ffb547"],
    },
    {
      title: "Большой Лебовски",
      year: 1998,
      genre: "comedy",
      genreLabel: "Комедия",
      rating: 8.1,
      duration: "1ч 57м",
      desc: "Чувак случайно ввязывается в опасную авантюру с похищением.",
      emoji: "🎳",
      colors: ["#ff6b35", "#6d4bff"],
    },
    {
      title: "Семь",
      year: 1995,
      genre: "thriller",
      genreLabel: "Триллер",
      rating: 8.6,
      duration: "2ч 7м",
      desc: "Два детектива охотятся за маньяком, совершающим убийства по семи грехам.",
      emoji: "🌧️",
      colors: ["#1f2937", "#ef4444"],
    },
    {
      title: "Начало",
      year: 2010,
      genre: "sci-fi",
      genreLabel: "Фантастика",
      rating: 8.8,
      duration: "2ч 28м",
      desc: "Вор крадёт секреты из снов и получает шанс на возвращение домой.",
      emoji: "🌀",
      colors: ["#6d4bff", "#0ea5e9"],
    },
    {
      title: "Гладиатор",
      year: 2000,
      genre: "action",
      genreLabel: "Боевик",
      rating: 8.5,
      duration: "2ч 35м",
      desc: "Преданный генерал становится гладиатором и жаждет мести.",
      emoji: "⚔️",
      colors: ["#92400e", "#ffb547"],
    },
    {
      title: "Шрек",
      year: 2001,
      genre: "comedy",
      genreLabel: "Комедия",
      rating: 7.9,
      duration: "1ч 30м",
      desc: "Зелёный огр отправляется в путешествие, чтобы спасти принцессу.",
      emoji: "🧅",
      colors: ["#16a34a", "#84cc16"],
    },
    {
      title: "Молчание ягнят",
      year: 1991,
      genre: "thriller",
      genreLabel: "Триллер",
      rating: 8.6,
      duration: "1ч 58м",
      desc: "Молодой агент ФБР консультируется с каннибалом для поимки маньяка.",
      emoji: "🦋",
      colors: ["#374151", "#dc2626"],
    },
    {
      title: "Зелёная миля",
      year: 1999,
      genre: "drama",
      genreLabel: "Драма",
      rating: 8.9,
      duration: "3ч 9м",
      desc: "История о необычном заключённом, обладающем удивительным даром.",
      emoji: "💚",
      colors: ["#065f46", "#22c55e"],
    },
    {
      title: "Безумный Макс: Дорога ярости",
      year: 2015,
      genre: "action",
      genreLabel: "Боевик",
      rating: 8.1,
      duration: "2ч 0м",
      desc: "Постапокалиптическая погоня через пустыню на бронированных машинах.",
      emoji: "🔥",
      colors: ["#b45309", "#ef4444"],
    },
    {
      title: "Однажды в Голливуде",
      year: 2019,
      genre: "drama",
      genreLabel: "Драма",
      rating: 7.6,
      duration: "2ч 41м",
      desc: "Стареющий актёр и его дублёр пытаются вернуться на вершину.",
      emoji: "🎬",
      colors: ["#dc2626", "#fbbf24"],
    },
    {
      title: "Тупой и ещё тупее",
      year: 1994,
      genre: "comedy",
      genreLabel: "Комедия",
      rating: 7.3,
      duration: "1ч 47м",
      desc: "Два недотёпы отправляются в путешествие через всю Америку.",
      emoji: "🤪",
      colors: ["#f97316", "#facc15"],
    },
    {
      title: "Прибытие",
      year: 2016,
      genre: "sci-fi",
      genreLabel: "Фантастика",
      rating: 7.9,
      duration: "1ч 56м",
      desc: "Лингвист пытается установить контакт с прилетевшими инопланетянами.",
      emoji: "🛸",
      colors: ["#0f766e", "#a78bfa"],
    },
    {
      title: "Исчезнувшая",
      year: 2014,
      genre: "thriller",
      genreLabel: "Триллер",
      rating: 8.1,
      duration: "2ч 29м",
      desc: "Муж становится главным подозреваемым в исчезновении жены.",
      emoji: "🔍",
      colors: ["#1e293b", "#fbbf24"],
    },
    {
      title: "Властелин колец: Братство кольца",
      year: 2001,
      genre: "action",
      genreLabel: "Боевик",
      rating: 8.9,
      duration: "2ч 58м",
      desc: "Хоббит отправляется уничтожить кольцо власти в огне Мордора.",
      emoji: "💍",
      colors: ["#78350f", "#fbbf24"],
    },
    {
      title: "Маска",
      year: 1994,
      genre: "comedy",
      genreLabel: "Комедия",
      rating: 7.0,
      duration: "1ч 41м",
      desc: "Скромный клерк находит волшебную маску, превращающую его в супергероя.",
      emoji: "🎭",
      colors: ["#16a34a", "#facc15"],
    },
  ];

  const grid = document.getElementById("moviesGrid");
  const loadMoreBtn = document.getElementById("loadMore");
  const filters = document.querySelectorAll(".filter");
  const shownCountEl = document.getElementById("shownCount");
  const totalCountEl = document.getElementById("totalCount");
  const catalogHint = document.getElementById("catalogHint");
  const catalogStatus = document.getElementById("catalogStatus");
  const catalogSource = document.getElementById("catalogSource");

  const STEP = 6;
  let activeFilter = "all";
  let shown = 0;
  let movies = FALLBACK_MOVIES;

  /* ---------- 2a. ИНТЕГРАЦИЯ С API КИНОПОИСКА ---------- */
  // Маппинг русских жанров API к фильтрам сайта
  const GENRE_MAP = {
    "боевик": { key: "action", label: "Боевик" },
    "драма": { key: "drama", label: "Драма" },
    "фантастика": { key: "sci-fi", label: "Фантастика" },
    "фэнтези": { key: "sci-fi", label: "Фантастика" },
    "комедия": { key: "comedy", label: "Комедия" },
    "триллер": { key: "thriller", label: "Триллер" },
    "ужасы": { key: "thriller", label: "Триллер" },
    "детектив": { key: "thriller", label: "Триллер" },
    "криминал": { key: "thriller", label: "Триллер" },
    "приключения": { key: "action", label: "Боевик" },
  };

  function mapApiMovie(item) {
    const genres = (item.genres || []).map((g) => g.genre);
    let mapped = null;
    for (const g of genres) {
      if (GENRE_MAP[g]) {
        mapped = GENRE_MAP[g];
        break;
      }
    }
    if (!mapped) {
      mapped = { key: "drama", label: genres[0] ? genres[0][0].toUpperCase() + genres[0].slice(1) : "Фильм" };
    }
    return {
      title: item.nameRu || item.nameOriginal || item.nameEn || "Без названия",
      year: item.year || "",
      genre: mapped.key,
      genreLabel: mapped.label,
      rating: item.ratingKinopoisk || item.ratingImdb || "—",
      duration: item.type === "TV_SERIES" ? "сериал" : (item.type === "MINI_SERIES" ? "мини-сериал" : ""),
      desc: "",
      poster: item.posterUrlPreview || item.posterUrl || "",
      colors: ["#6d4bff", "#ff3d6e"],
    };
  }

  async function fetchKinopoiskMovies() {
    const cfg = window.CINEMAWAVE_CONFIG;
    if (!cfg || !cfg.USE_API || !cfg.KINOPOISK_API_KEY) {
      throw new Error("API не настроен");
    }
    const url = `${cfg.KINOPOISK_API_URL}/films/collections?type=TOP_POPULAR_MOVIES&page=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-API-KEY": cfg.KINOPOISK_API_KEY,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items = (json.items || [])
        .slice(0, cfg.API_LIMIT || 18)
        .map(mapApiMovie)
        .filter((m) => m.poster); // оставляем только с постерами
      if (!items.length) throw new Error("Пустой ответ от API");
      return items;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function loadMovies() {
    if (catalogStatus) catalogStatus.hidden = false;
    try {
      const apiMovies = await fetchKinopoiskMovies();
      movies = apiMovies;
      if (catalogSource) {
        catalogSource.textContent = "🎬 Данные с API Кинопоиска";
      }
      console.log("[CinemaWave] Загружено фильмов с API:", apiMovies.length);
    } catch (err) {
      console.warn("[CinemaWave] Не удалось загрузить с API, используем fallback:", err.message);
      movies = FALLBACK_MOVIES;
      if (catalogSource) {
        catalogSource.textContent = "📦 Используется локальный набор фильмов";
      }
    } finally {
      if (catalogStatus) catalogStatus.hidden = true;
      renderMovies({ reset: true });
    }
  }

  function getFiltered() {
    return activeFilter === "all"
      ? movies
      : movies.filter((m) => m.genre === activeFilter);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createMovieCard(movie, index) {
    const li = document.createElement("li");
    li.className = "movie-card";
    li.style.animationDelay = `${(index % STEP) * 60}ms`;

    let posterInner;
    if (movie.poster) {
      // Реальный постер с API
      posterInner = `
        <img src="${escapeHtml(movie.poster)}" alt="Постер: ${escapeHtml(movie.title)}" loading="lazy"
             onerror="this.style.display='none';this.parentNode.classList.add('no-poster');" />
      `;
    } else {
      // Fallback: градиент + эмодзи
      const grad = `linear-gradient(160deg, ${movie.colors[0]} 0%, ${movie.colors[1]} 100%)`;
      posterInner = `
        <div class="movie-card__poster-fallback" style="background-image: ${grad};">
          <span class="movie-card__emoji">${movie.emoji || "🎬"}</span>
        </div>
      `;
    }

    const meta = [movie.year, movie.duration].filter(Boolean);
    const metaHtml = meta.map((m) => `<span>${escapeHtml(m)}</span>`).join("");
    const desc = movie.desc ? `<p class="movie-card__desc">${escapeHtml(movie.desc)}</p>` : "";

    li.innerHTML = `
      <div class="movie-card__poster">
        ${posterInner}
        <span class="movie-card__genre">${escapeHtml(movie.genreLabel)}</span>
        <span class="movie-card__rating" aria-label="Рейтинг ${escapeHtml(movie.rating)}">★ ${escapeHtml(movie.rating)}</span>
      </div>
      <div class="movie-card__body">
        <h3 class="movie-card__title">${escapeHtml(movie.title)}</h3>
        <div class="movie-card__meta">${metaHtml}</div>
        ${desc}
      </div>
    `;
    return li;
  }

  function renderMovies({ reset = false } = {}) {
    if (!grid) return;
    const filtered = getFiltered();

    if (reset) {
      grid.innerHTML = "";
      shown = 0;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `<li class="empty">😕 По выбранному жанру фильмов пока нет.</li>`;
      shown = 0;
      updateCounters(0, 0);
      if (loadMoreBtn) loadMoreBtn.hidden = true;
      return;
    }

    const next = filtered.slice(shown, shown + STEP);
    next.forEach((movie, i) => {
      grid.appendChild(createMovieCard(movie, shown + i));
    });
    shown += next.length;

    updateCounters(shown, filtered.length);

    if (loadMoreBtn) {
      loadMoreBtn.hidden = shown >= filtered.length;
    }
  }

  function updateCounters(current, total) {
    if (shownCountEl) shownCountEl.textContent = current;
    if (totalCountEl) totalCountEl.textContent = total;
    if (catalogHint) catalogHint.hidden = total === 0;
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => renderMovies());
  }

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const newFilter = btn.dataset.filter;
      if (newFilter === activeFilter) return;
      activeFilter = newFilter;

      filters.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle("is-active", isActive);
        b.setAttribute("aria-selected", String(isActive));
      });

      renderMovies({ reset: true });
    });
  });

  loadMovies();

  /* ---------- 3. ФОРМА ОБРАТНОЙ СВЯЗИ ---------- */
  const form = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_REGEX = /^[+\d][\d\s()-]{6,}$/;

  function setError(input, message) {
    const field = input.closest(".form__field");
    if (field) field.classList.toggle("is-invalid", Boolean(message));
    const errorEl = document.querySelector(`[data-error-for="${input.id}"]`);
    if (errorEl) errorEl.textContent = message || "";
  }

  function clearError(input) {
    setError(input, "");
  }

  function validateField(input) {
    const value = input.value.trim();

    if (input.id === "name") {
      if (!value) return "Введи имя";
      if (value.length < 2) return "Имя слишком короткое";
      return "";
    }

    if (input.id === "email") {
      if (!value) return "Введи email";
      if (!EMAIL_REGEX.test(value)) return "Введи корректный email";
      return "";
    }

    if (input.id === "phone") {
      if (!value) return ""; // optional
      if (!PHONE_REGEX.test(value)) return "Введи корректный телефон";
      return "";
    }

    if (input.id === "message") {
      if (!value) return "Напиши сообщение";
      if (value.length < 10) return "Сообщение слишком короткое (мин. 10 символов)";
      return "";
    }

    if (input.id === "consent") {
      if (!input.checked) return "Нужно согласие на обработку данных";
      return "";
    }

    return "";
  }

  if (form) {
    // Live-валидация при вводе и потере фокуса
    form.querySelectorAll("input, textarea").forEach((input) => {
      input.addEventListener("blur", () => {
        const message = validateField(input);
        setError(input, message);
      });
      input.addEventListener("input", () => {
        if (input.closest(".form__field")?.classList.contains("is-invalid")) {
          const message = validateField(input);
          setError(input, message);
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fields = ["name", "email", "phone", "message", "consent"];
      let firstInvalid = null;
      let hasError = false;

      fields.forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        const message = validateField(input);
        setError(input, message);
        if (message) {
          hasError = true;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (hasError) {
        if (firstInvalid) firstInvalid.focus();
        console.warn("[CinemaWave] Форма не отправлена — есть ошибки валидации.");
        return;
      }

      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim() || null,
        message: form.message.value.trim(),
        consent: form.consent.checked,
        timestamp: new Date().toISOString(),
      };

      // Главное требование задания — вывод данных в console.log
      console.log("[CinemaWave] Данные формы:", data);

      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      form.reset();

      setTimeout(() => {
        if (formSuccess) formSuccess.hidden = true;
      }, 6000);
    });
  }

  /* ---------- 4. МОБИЛЬНОЕ МЕНЮ ---------- */
  const burger = document.getElementById("burger");
  const mobileNav = document.getElementById("mobileNav");

  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      burger.classList.toggle("is-active", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        burger.classList.remove("is-active");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 5. ГОД В ПОДВАЛЕ ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 6. ПЛАВНОЕ ПОЯВЛЕНИЕ СЕКЦИЙ ---------- */
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document
      .querySelectorAll(".feature-card, .review-card")
      .forEach((el) => observer.observe(el));
  }
})();

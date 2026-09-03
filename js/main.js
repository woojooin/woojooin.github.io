/**
 * Portfolio site interactions
 * - Theme (light / dark) with localStorage + system preference
 * - Language (en / ko) site-wide via localStorage + ?lang= URL
 * - Mobile navigation
 * - Active nav link highlighting
 */

(function () {
  "use strict";

  var STORAGE_THEME = "portfolio-theme";
  var STORAGE_LANG = "portfolio-lang";

  /* ------------------------------------------------------------------------
     Theme
     -------------------------------------------------------------------- */

  function getPreferredTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_THEME);
    } catch (e) {
      /* ignore */
    }
    if (stored === "light" || stored === "dark") return stored;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch (e) {
      /* ignore */
    }
    updateThemeToggle(theme);
  }

  function updateThemeToggle(theme) {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    var next = theme === "dark" ? "light" : "dark";
    var key = next === "dark" ? "a11y.themeToDark" : "a11y.themeToLight";
    var label = t(key);
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
    btn.setAttribute("data-theme-state", theme);
    var labelEl = btn.querySelector("[data-theme-label]");
    if (labelEl) {
      labelEl.textContent = theme === "dark" ? "Light" : "Dark";
    }
  }

  function initTheme() {
    applyTheme(getPreferredTheme());

    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.addEventListener("click", function () {
        var current =
          document.documentElement.getAttribute("data-theme") || "light";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    }

    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function (event) {
        var stored = null;
        try {
          stored = localStorage.getItem(STORAGE_THEME);
        } catch (e) {
          /* ignore */
        }
        if (stored === "light" || stored === "dark") return;
        applyTheme(event.matches ? "dark" : "light");
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ------------------------------------------------------------------------
     i18n
     -------------------------------------------------------------------- */

  function getLangFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var lang = params.get("lang");
      if (lang === "en" || lang === "ko") return lang;
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function getPreferredLang() {
    var fromUrl = getLangFromUrl();
    if (fromUrl) return fromUrl;

    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_LANG);
    } catch (e) {
      /* ignore */
    }
    if (stored === "en" || stored === "ko") return stored;

    var nav = (navigator.language || "").toLowerCase();
    if (nav.indexOf("ko") === 0) return "ko";
    return "en";
  }

  function t(key) {
    var lang = document.documentElement.getAttribute("lang") || "en";
    var dict = (window.PORTFOLIO_I18N && window.PORTFOLIO_I18N[lang]) || {};
    var fallback =
      (window.PORTFOLIO_I18N && window.PORTFOLIO_I18N.en) || {};
    return dict[key] != null
      ? dict[key]
      : fallback[key] != null
        ? fallback[key]
        : key;
  }

  function withLangParam(href, lang) {
    if (!href) return href;
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return href;

    var hash = "";
    var hashIdx = href.indexOf("#");
    if (hashIdx >= 0) {
      hash = href.slice(hashIdx);
      href = href.slice(0, hashIdx);
    }

    var path = href;
    var query = "";
    var qIdx = href.indexOf("?");
    if (qIdx >= 0) {
      path = href.slice(0, qIdx);
      query = href.slice(qIdx + 1);
    }

    var params = new URLSearchParams(query);
    params.set("lang", lang);
    var qs = params.toString();
    return path + (qs ? "?" + qs : "") + hash;
  }

  function syncUrlLang(lang) {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      var next = url.pathname + url.search + url.hash;
      if (next !== window.location.pathname + window.location.search + window.location.hash) {
        history.replaceState(null, "", next);
      }
    } catch (e) {
      /* ignore */
    }
  }

  function syncInternalLinks(lang) {
    document.querySelectorAll("a[href]").forEach(function (anchor) {
      var href = anchor.getAttribute("href");
      if (!href) return;
      if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
      anchor.setAttribute("href", withLangParam(href, lang));
    });
  }

  function applyLang(lang) {
    if (lang !== "en" && lang !== "ko") lang = "en";
    document.documentElement.setAttribute("lang", lang);
    try {
      localStorage.setItem(STORAGE_LANG, lang);
    } catch (e) {
      /* ignore */
    }

    syncUrlLang(lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      el.setAttribute("aria-label", t(key));
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(key);
    });

    /* Document title / meta */
    var projectTitle = document.body.getAttribute("data-project-title");
    var projectId = document.body.getAttribute("data-project-id");
    var titleEl = document.querySelector("title");
    var descEl = document.querySelector('meta[name="description"]');

    if (projectTitle) {
      if (titleEl) {
        titleEl.textContent = t("meta.projectTitle").replace(
          "{title}",
          projectTitle
        );
      }
      if (descEl) {
        var customDesc =
          projectId &&
          t(projectId + ".metaDescription") !== projectId + ".metaDescription"
            ? t(projectId + ".metaDescription")
            : t("meta.projectDescription").replace("{title}", projectTitle);
        descEl.setAttribute("content", customDesc);
      }
    } else {
      if (titleEl) titleEl.textContent = t("meta.title");
      if (descEl) descEl.setAttribute("content", t("meta.description"));
    }

    /* Language toggle UI state */
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", String(isActive));
      btn.classList.toggle("is-active", isActive);
    });

    /* Keep language on next internal navigation */
    syncInternalLinks(lang);

    /* Refresh theme button label in current language */
    updateThemeToggle(
      document.documentElement.getAttribute("data-theme") || "light"
    );
  }

  function initLang() {
    applyLang(getPreferredLang());

    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });

    window.addEventListener("storage", function (event) {
      if (event.key !== STORAGE_LANG) return;
      if (event.newValue === "en" || event.newValue === "ko") {
        applyLang(event.newValue);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Navigation
     -------------------------------------------------------------------- */

  function initNav() {
    var toggle = document.querySelector(".nav__toggle");
    var menu = document.querySelector(".nav__menu");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        menu.classList.toggle("is-open", !expanded);
      });

      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          toggle.setAttribute("aria-expanded", "false");
          menu.classList.remove("is-open");
        });
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && menu.classList.contains("is-open")) {
          toggle.setAttribute("aria-expanded", "false");
          menu.classList.remove("is-open");
          toggle.focus();
        }
      });
    }

    var sectionIds = ["projects", "skills", "about", "contact"];
    var sections = sectionIds
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    var navLinks = document.querySelectorAll('.nav__links a[href*="#"]');

    if (sections.length && navLinks.length && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var id = entry.target.id;
            navLinks.forEach(function (link) {
              var href = link.getAttribute("href") || "";
              var hashIdx = href.indexOf("#");
              var hash = hashIdx >= 0 ? href.slice(hashIdx + 1) : "";
              var isActive = hash === id;
              if (isActive) {
                link.setAttribute("aria-current", "page");
              } else {
                link.removeAttribute("aria-current");
              }
            });
          });
        },
        {
          rootMargin: "-30% 0px -55% 0px",
          threshold: 0,
        }
      );

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  }

  /* Boot ----------------------------------------------------------------- */

  initTheme();
  initLang();
  initNav();
})();

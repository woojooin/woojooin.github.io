/**
 * Project demo video modal
 * - Open via [data-video-open][data-video="<id>"]
 * - Sources come from CATALOG keyed by body[data-project-id]
 * - Tabs switch sources; closing pauses and clears src
 * - Player size matches the video aspect ratio within the viewport
 */
(function () {
  "use strict";

  var CATALOG = {
    officeai: {
      "excel-1": "../videos/office-ai-agent/excel-1.mp4",
      "excel-2": "../videos/office-ai-agent/excel-2.mp4",
      word: "../videos/office-ai-agent/word.mp4",
      powerpoint: "../videos/office-ai-agent/powerpoint.mp4",
    },
    aiwork: {
      "work-1": "../videos/ai-work-agent/sidekick-work%201.mov",
      "work-2": "../videos/ai-work-agent/sidekick-work%202.mov",
    },
  };

  var POSTERS = {
    aiwork: {
      "work-1": "../images/ai-work-agent/screenshot-1.png",
      "work-2": "../images/ai-work-agent/screenshot-2.png",
    },
  };

  function initVideoModal() {
    var modal = document.querySelector("[data-video-modal]");
    if (!modal) return;

    var projectId = document.body.getAttribute("data-project-id");
    var SOURCES = CATALOG[projectId] || {};
    var POSTER_MAP = POSTERS[projectId] || {};
    var DEFAULT_ID = Object.keys(SOURCES)[0];
    var player = modal.querySelector("[data-video-player]");
    var toolbar = modal.querySelector(".video-modal__toolbar");
    var tabs = modal.querySelectorAll("[data-video-tab]");
    var openers = document.querySelectorAll("[data-video-open]");
    var closers = modal.querySelectorAll("[data-video-close]");
    if (!player || !tabs.length || !DEFAULT_ID) return;

    function isOpen() {
      return modal.open || modal.hasAttribute("open");
    }

    function clearFit() {
      player.style.width = "";
      player.style.height = "";
    }

    function fitPlayerToVideo() {
      var vw = player.videoWidth;
      var vh = player.videoHeight;
      if (!vw || !vh) return;

      var toolbarH = toolbar ? toolbar.getBoundingClientRect().height : 40;
      var maxW = Math.max(240, window.innerWidth - 24);
      var maxH = Math.max(180, window.innerHeight - 24 - toolbarH);
      var scale = Math.min(1, maxW / vw, maxH / vh);

      player.style.width = Math.round(vw * scale) + "px";
      player.style.height = Math.round(vh * scale) + "px";
    }

    function setActiveTab(id) {
      tabs.forEach(function (tab) {
        var active = tab.getAttribute("data-video-tab") === id;
        tab.setAttribute("aria-selected", String(active));
        tab.classList.toggle("is-active", active);
      });
    }

    function loadVideo(id, autoplay) {
      var src = SOURCES[id];
      if (!src) return;
      setActiveTab(id);
      var poster = POSTER_MAP[id];
      if (poster) {
        player.setAttribute("poster", poster);
      }
      if (player.getAttribute("src") !== src) {
        player.pause();
        clearFit();
        player.setAttribute("src", src);
        player.load();
      } else {
        fitPlayerToVideo();
      }
      if (autoplay) {
        var playPromise = player.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            /* Autoplay may be blocked; controls remain available. */
          });
        }
      }
    }

    function openModal(id) {
      var videoId = SOURCES[id] ? id : DEFAULT_ID;
      if (typeof modal.showModal === "function") {
        modal.showModal();
      } else {
        modal.setAttribute("open", "");
      }
      document.documentElement.classList.add("is-video-modal-open");
      loadVideo(videoId, true);
    }

    function closeModal() {
      player.pause();
      player.removeAttribute("src");
      clearFit();
      player.load();
      if (typeof modal.close === "function" && modal.open) {
        modal.close();
      } else {
        modal.removeAttribute("open");
      }
      document.documentElement.classList.remove("is-video-modal-open");
    }

    player.addEventListener("loadedmetadata", fitPlayerToVideo);

    window.addEventListener("resize", function () {
      if (isOpen()) fitPlayerToVideo();
    });

    openers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(btn.getAttribute("data-video"));
      });
    });

    closers.forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        loadVideo(tab.getAttribute("data-video-tab"), true);
      });
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });

    modal.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeModal();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (!isOpen()) return;
      closeModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVideoModal);
  } else {
    initVideoModal();
  }
})();

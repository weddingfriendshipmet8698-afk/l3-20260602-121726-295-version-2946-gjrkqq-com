(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (window.__hlsLibraryPromise) {
      return window.__hlsLibraryPromise;
    }
    window.__hlsLibraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("hls.js load failed"));
      };
      document.head.appendChild(script);
    });
    return window.__hlsLibraryPromise;
  }

  function attachNative(video, sourceUrl) {
    if (!video.src) {
      video.src = sourceUrl;
      video.load();
    }
    return Promise.resolve();
  }

  function attachHls(video, sourceUrl) {
    if (video.__hlsReady) {
      return Promise.resolve();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.__hlsReady = true;
      return attachNative(video, sourceUrl);
    }
    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        return new Promise(function (resolve, reject) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          video.__hls = hls;
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.__hlsReady = true;
            resolve();
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error(data.type || "hls error"));
            }
          });
        });
      }
      video.__hlsReady = true;
      return attachNative(video, sourceUrl);
    }).catch(function () {
      video.__hlsReady = true;
      return attachNative(video, sourceUrl);
    });
  }

  function initPlayer(shell) {
    var video = shell.querySelector("video[data-src]");
    var button = shell.querySelector("[data-play-button]");
    if (!video) {
      return;
    }
    var sourceUrl = video.getAttribute("data-src");
    var isStarting = false;

    function startPlayback() {
      if (!sourceUrl || isStarting) {
        return;
      }
      isStarting = true;
      shell.classList.add("is-playing");
      attachHls(video, sourceUrl).then(function () {
        return video.play();
      }).catch(function () {
        shell.classList.remove("is-playing");
      }).finally(function () {
        isStarting = false;
      });
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    video.addEventListener("click", function () {
      if (!video.__hlsReady) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
  });
})();

const players = document.querySelectorAll("[data-player]");

players.forEach((shell) => {
  const video = shell.querySelector("video");
  const button = shell.querySelector("[data-play-button]");
  const streamPath = video ? video.getAttribute("data-stream") : "";
  const mp4Path = video ? video.getAttribute("data-mp4") : "";
  let mounted = false;

  const mountStream = () => {
    if (!video || mounted) {
      return;
    }

    mounted = true;

    if (window.location.protocol === "file:" && mp4Path) {
      video.src = mp4Path;
    } else if (streamPath && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamPath);
      hls.attachMedia(video);
    } else if (streamPath && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamPath;
    } else if (mp4Path) {
      video.src = mp4Path;
    }
  };

  const playVideo = async () => {
    mountStream();
    try {
      await video.play();
      shell.classList.add("is-playing");
    } catch (error) {
      shell.classList.remove("is-playing");
    }
  };

  if (button && video) {
    button.addEventListener("click", playVideo);
    video.addEventListener("play", () => shell.classList.add("is-playing"));
    video.addEventListener("pause", () => shell.classList.remove("is-playing"));
  }
});

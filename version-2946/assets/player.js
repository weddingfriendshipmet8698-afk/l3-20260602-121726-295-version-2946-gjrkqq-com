(() => {
  const frame = document.querySelector(".player-frame");
  if (!frame) return;

  const video = frame.querySelector("video");
  const cover = frame.querySelector(".player-cover");
  const button = frame.querySelector(".play-button");
  const streamUrl = video ? video.getAttribute("data-play") : "";
  let started = false;

  const start = () => {
    if (!video || !streamUrl || started) return;
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    cover?.classList.add("hidden");
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {});
    }
  };

  button?.addEventListener("click", start);
  cover?.addEventListener("click", start);
  video?.addEventListener("click", () => {
    if (!started) start();
  });
})();

(() => {
  const playerBox = document.querySelector('.player-box');
  const video = document.getElementById('moviePlayer');
  const startButton = document.querySelector('.player-start');

  if (!playerBox || !video) {
    return;
  }

  const stream = playerBox.getAttribute('data-stream');
  let hlsInstance = null;
  let attached = false;

  const attachStream = () => {
    if (attached || !stream) {
      return;
    }

    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }
  };

  const playVideo = async () => {
    attachStream();

    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  };

  if (startButton) {
    startButton.addEventListener('click', playVideo);
  }

  playerBox.addEventListener('click', (event) => {
    if (event.target === video) {
      return;
    }

    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', () => {
    playerBox.classList.add('playing');
  });

  video.addEventListener('pause', () => {
    playerBox.classList.remove('playing');
  });

  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });

  attachStream();
})();

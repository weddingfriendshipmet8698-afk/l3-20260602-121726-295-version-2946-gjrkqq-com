function createMoviePlayer(videoId, buttonId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  var hlsInstance = null;
  var ready = false;

  if (!video || !button || !overlay || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function startPlayback() {
    attachSource();
    overlay.classList.add('hidden');
    video.setAttribute('controls', 'controls');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  button.addEventListener('click', startPlayback);
  overlay.addEventListener('click', startPlayback);
  video.addEventListener('play', function () {
    overlay.classList.add('hidden');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

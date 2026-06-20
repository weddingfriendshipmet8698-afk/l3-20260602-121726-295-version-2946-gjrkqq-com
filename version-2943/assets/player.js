(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function showMessage(messageBox, text) {
        if (!messageBox) {
            return;
        }
        messageBox.textContent = text;
        messageBox.hidden = false;
    }

    function initPlayer() {
        var playerCard = document.querySelector('[data-player]');
        var video = document.querySelector('video[data-hls-src]');
        var playButton = document.querySelector('[data-play-button]');
        var messageBox = document.querySelector('[data-player-message]');

        if (!playerCard || !video || !playButton) {
            return;
        }

        var source = video.getAttribute('data-hls-src');
        var hls = null;
        var started = false;

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    showMessage(messageBox, '浏览器阻止了自动播放，请再次点击播放器开始播放。');
                });
            }
        }

        function attachHls() {
            if (!source) {
                showMessage(messageBox, '当前影片没有可用播放源。');
                return;
            }

            playerCard.classList.add('is-playing');

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        showMessage(messageBox, '网络加载异常，正在尝试重新连接播放源。');
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        showMessage(messageBox, '媒体解码异常，正在尝试恢复播放。');
                        hls.recoverMediaError();
                    } else {
                        showMessage(messageBox, '播放源暂时不可用，请稍后重试。');
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
            } else {
                showMessage(messageBox, '当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或 Firefox。');
            }
        }

        playButton.addEventListener('click', function () {
            if (!started) {
                started = true;
                attachHls();
            } else {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(initPlayer);
})();

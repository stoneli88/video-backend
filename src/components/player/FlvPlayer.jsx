import React from 'react';
import flv from 'flv.js';

const FlvPlayer = ({ type, url, mimeCodec, ...props }) => {
  let player = null;
  const { isLive, cors, hasAudio, hasVideo } = props;
	const options = {
    enableWorker: false,
    lazyLoadMaxDuration: 3 * 60,
    seekType: 'range',
  };
  // mimeCodec = `video/mp4; codecs="${mimeCodec.trim()}"`;

  const flv_load_mds = (mediaDataSource) => {
    var videoElement = document.getElementsByName('videoElement')[0];
    if (typeof player !== "undefined") {
      if (player != null) {
        player.unload();
        player.detachMediaElement();
        player.destroy();
        player = null;
      }
      player = flv.createPlayer(mediaDataSource, options);
      player.attachMediaElement(videoElement);
      player.load();
    }
  }

  if (flv.isSupported()) {
    flv_load_mds({
      url,
      type,
      isLive,
      cors,
      hasAudio: hasAudio === undefined ? true : hasAudio,
      hasVideo: hasVideo === undefined ? true : hasVideo
    });
  }

	return flv.isSupported() ? (
		<div className="v-player">
			<video name="videoElement" class="centeredVideo" controls autoplay>
				Your browser is too old which doesn't support HTML5 video.
			</video>
		</div>
	) : (
		<div className="v-native-player">您的浏览器不支持我们的播放器，请更换到最新CHROME浏览器，谢谢。</div>
	);
};

export default FlvPlayer;

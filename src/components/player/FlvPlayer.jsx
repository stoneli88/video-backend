import React from 'react';
import { MediaPlayer } from 'dashjs';

const FlvPlayer = ({ type, mpd, mimeCodec, ...props }) => {
	const supportMediaSource =
		'MediaSource' in window && MediaSource.isTypeSupported(`video/mp4; codecs="${mimeCodec.trim()}"`);

	// Use MediaSource, if not support MediaSource then use origin url.
	const initMediaSource = () => {
		const videoElement = document.getElementsByName('videoElement')[0];
		const player = MediaPlayer().create();

		if (supportMediaSource) {
			player.initialize(videoElement, `http://${mpd}`, true);
		}
	};

	setTimeout(() => {
		initMediaSource();
	}, 1000);

	return supportMediaSource ? (
		<div className="v-player">
			<video name="videoElement" className="centeredVideo" controls autoPlay>
				Your browser is too old which doesn't support HTML5 video.
			</video>
		</div>
	) : (
		<div className="v-native-player">您的浏览器不支持我们的播放器，请更换到最新CHROME浏览器，谢谢。</div>
	);
};

export default FlvPlayer;

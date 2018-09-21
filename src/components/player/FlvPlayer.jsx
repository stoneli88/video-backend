import React from 'react';
import './style.css';
import videojs from 'video.js';

require('@videojs/http-streaming');

const FlvPlayer = ({ mimeCodec, m38uAddr }) => {
	setTimeout(() => {
		const videoElement = document.getElementById('demo-player');
		videoElement && videojs(videoElement);
	}, 500);

	return m38uAddr ? (
		<div className="v-player">
			<video-js id="demo-player" width="1025" height="720" className="video-js vjs-default-skin" controls>
				 <source src={`http://${m38uAddr}`} type="application/x-mpegURL" />
			</video-js>
		</div>
	) : (
		''
	);
};

export default FlvPlayer;

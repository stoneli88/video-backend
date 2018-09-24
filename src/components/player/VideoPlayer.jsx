import React from 'react';
import './style.css';
import videojs from 'video.js';

require('@videojs/http-streaming');

class VideoPlayer extends React.PureComponent {
	constructor(props) {
		super(props);
		this.player = null;
	}

	componentDidMount() {
		if (this.props.m38uAddr !== '') {
			this._initPlayer(this.props);
		}
	}

	componentWillReceiveProps(nextProps) {
		this._initPlayer(nextProps);
	}

	componentWillUnmount() {
		if (this.player) {
			this.player.dispose();
		}
	}

	_initPlayer(props) {
		this.player = videojs(this.videoNode, props, () => {
			this.player.src({
				src: `http://${props.m38uAddr}`,
				type: 'application/x-mpegURL',
				overrideNative: true,
				enableLowInitialPlaylist: true
			});
		});
	}

	render() {
		return (
			<div className="v-player">
				<video
					ref={(node) => (this.videoNode = node)}
					width="1025"
					height="720"
					className="video-js vjs-default-skin"
					controls
				/>
			</div>
		);
	}
}

export default VideoPlayer;

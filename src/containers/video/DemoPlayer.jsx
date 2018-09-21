import React, { Component } from 'react';
import axios from '../../axios';
import FlvPlayer from '../../components/player/FlvPlayer';

class DemoPlayer extends Component {
	constructor() {
		super();
		this.state = {
			m3u8Addr: '',
			mp4info: ''
		};
	}

	componentDidMount() {
		axios.get(`/video/play/${this.props.videoId}`).then((videoInfo) => {
			const { hls } = videoInfo.data.video;
			this.setState({
				m3u8Addr: hls
			});
		});
	}

	render() {
		return <FlvPlayer m38uAddr={this.state.m3u8Addr} />;
	}
}

export default DemoPlayer;

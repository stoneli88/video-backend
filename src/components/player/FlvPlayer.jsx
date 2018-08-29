import React from 'react';

const FlvPlayer = ({ type, url, mpd, mimeCodec, ...props }) => {
	let mediaSource = null;
	let fileType = null;
	let segCheck = null;
	let index = 0; // Segment to get
	let lastTime = 0;
	let segments;
	let bufferUpdated = false;
	let sourceBuffer;
	const supportMediaSource =
		'MediaSource' in window && MediaSource.isTypeSupported(`video/mp4; codecs="${mimeCodec.trim()}"`);

	const timeToDownload = (range, bandwidth) => {
		var vidDur = range.split('-');
		// Time = size * 8 / bitrate
		return (vidDur[1] - vidDur[0]) * 8 / bandwidth;
	};

	// Retrieve parameters from our stored .mpd file
	const _getFileType = (data) => {
		let file,
			rep,
			type,
			codecs,
			width,
			height,
			bandwidth,
			ini,
			initialization,
			segments,
			period,
			vidTempDuration,
			vidDuration,
			segList,
			segDuration;
		try {
			file = data.querySelectorAll('BaseURL')[0].textContent.toString();
			rep = data.querySelectorAll('Representation');
			type = rep[0].getAttribute('mimeType');
			codecs = rep[0].getAttribute('codecs');
			width = rep[0].getAttribute('width');
			height = rep[0].getAttribute('height');
			bandwidth = rep[0].getAttribute('bandwidth');

			ini = data.querySelectorAll('Initialization');
			initialization = ini[0].getAttribute('range');
			segments = data.querySelectorAll('SegmentURL');

			// Get the length of the video per the .mpd file
			//   since the video.duration will always say infinity
			period = data.querySelectorAll('Period');
			vidTempDuration = period[0].getAttribute('duration');
			vidDuration = _parseDuration(vidTempDuration); // display length

			segList = data.querySelectorAll('SegmentList');
			segDuration = segList[0].getAttribute('duration');

			return {
				file,
				rep,
				type,
				codecs,
				width,
				height,
				bandwidth,
				ini,
				initialization,
				segments,
				period,
				vidTempDuration,
				vidDuration,
				segList,
				segDuration
			};
		} catch (er) {
			console.log(er);
			return;
		}
	};

	// Converts mpd time to human time
	const _parseDuration = (pt) => {
		// Parse time from format "PT#H#M##.##S"
		var ptTemp = pt.split('T')[1];
		ptTemp = ptTemp.split('H');
		var hours = ptTemp[0];
		var minutes = ptTemp[1].split('M')[0];
		var seconds = ptTemp[1].split('M')[1].split('S')[0];
		var hundredths = seconds.split('.');
		//  Display the length of video (taken from .mpd file, since video duration is infinate)
		return 'Video length: ' + hours + ':' + pZ(minutes, 2) + ':' + pZ(hundredths[0], 2) + '.' + hundredths[1];
		//  Pad digits with zeros if needed
		function pZ(value, padCount) {
			var tNum = value + '';
			while (tNum.length < padCount) {
				tNum = '0' + tNum;
			}
			return tNum;
		}
	};

	// Set source for mediasource interface.
	const onSourceOpen = () => {
		sourceBuffer = mediaSource.addSourceBuffer(`video/mp4; codecs="${mimeCodec.trim()}"`);

		fetchBuffer(url, (buffer) => {
			sourceBuffer.addEventListener('update', updateFunct, false);
			sourceBuffer.appendBuffer(new Uint8Array(buffer));
		});

		// Get Buffer from video source url.
		function fetchBuffer(url, callback) {
			const xhr = new XMLHttpRequest();
			segCheck = (timeToDownload(fileType.initialization, fileType.bandwidth) * 0.8).toFixed(3);
			xhr.open('get', url);
			xhr.setRequestHeader('Range', 'bytes=' + fileType.initialization);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function() {
				callback(xhr.response);
			};
			xhr.send();
		}
	};

	function updateFunct() {
		const videoElement = document.getElementsByName('videoElement')[0];
		//  This is a one shot function, when init segment finishes loading,
		//    update the buffer flag, call getStarted, and then remove this event.
		bufferUpdated = true;
		playSegment(segments[index].getAttribute('mediaRange').toString(), url);
		videoElement.addEventListener('timeupdate', fileChecks, false);
		sourceBuffer.removeEventListener('update', updateFunct);
		index++;
	}

	//  Get video segments
	function fileChecks() {
		const videoElement = document.getElementsByName('videoElement')[0];
		// If we're ok on the buffer, then continue
		if (bufferUpdated === true) {
			if (index < segments.length) {
				// Loads next segment when time is close to the end of the last loaded segment
				if (videoElement.currentTime - lastTime >= segCheck) {
					playSegment(segments[index].getAttribute('mediaRange').toString(), url);
					lastTime = videoElement.currentTime; // Display current index
					index++;
				}
			} else {
				videoElement.removeEventListener('timeupdate', fileChecks, false);
			}
		}
	}

	//  Play segment plays a byte range (format nnnn-nnnnn) of a media file
	function playSegment(range, url) {
		var xhr = new XMLHttpRequest();
		if (range || url) {
			// Make sure we've got incoming params
			xhr.open('GET', url);
			xhr.setRequestHeader('Range', 'bytes=' + range);
			xhr.send();
			xhr.responseType = 'arraybuffer';
			try {
				xhr.addEventListener(
					'readystatechange',
					function() {
						if (xhr.readyState === xhr.DONE) {
							//wait for video to load
							//  Calculate when to get next segment based on time of current one
							segCheck = (timeToDownload(range) * 0.8).toFixed(3); // Use .8 as fudge factor
							// Add received content to the buffer
							try {
								sourceBuffer.appendBuffer(new Uint8Array(xhr.response));
							} catch (e) {
								console.log('Exception while appending', e);
							}
						}
					},
					false
				);
			} catch (e) {
				console.log(e);
				return; // No value for range
			}
		}
	}

	// Use MediaSource, if not support MediaSource then use origin url.
	const initMediaSource = () => {
		const videoElement = document.getElementsByName('videoElement')[0];

		if (supportMediaSource) {
			mediaSource = new MediaSource();
			mediaSource.addEventListener('sourceopen', onSourceOpen);
			videoElement.src = URL.createObjectURL(mediaSource);
		}
	};

	setTimeout(() => {
    fileType = _getFileType(mpd);
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

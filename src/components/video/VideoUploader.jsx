import React, { Component } from 'react';
import { Modal } from 'antd';
import axios from '../../axios';
import Gallery from '../react-fine-upload/gallery/index';
import FineUploaderTraditional from 'fine-uploader-wrappers';
import '../react-fine-upload/gallery/gallery.css';

// Test file extension.
function hasExtension(fileName, exts) {
	return new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$').test(fileName);
}

// declare a new uploader instance.
const videoUploader = new FineUploaderTraditional({
	options: {
		fileSizeOnSubmit: true,
		autoUpload: true,
		maxConnections: 5,
		chunking: {
			enabled: true,
			partSize: 1000000,
			concurrent: {
				enabled: true
			}
		},
		deleteFile: {
			enabled: true,
			endpoint: 'http://127.0.0.1:8080/api/upload'
		},
		request: {
			endpoint: 'http://127.0.0.1:8080/api/uploads'
		},
		retry: {
			enableAuto: true
		},
		resume: {
			enabled: true
		}
	}
});

class VideoUploader extends Component {
	constructor() {
		super();

		this.state = {
			uuid: ''
		};
		this.uploadFiles = [];
	}

	componentDidMount() {
		videoUploader.on('submit', (id, name) => {
			this.uploadFiles.push({ submittedFile: id, submittedFileName: name });
			return true;
		});
		videoUploader.on('deleteComplete', async (id, reqJSON, isError) => {
			const queue = await axios.delete(`/queue/${this.state.uuid}`);
			this.props.handleFileDelete.apply(this, [ queue ]);
		});
		videoUploader.on('validate', (data, buttonContainer) => {
			if (!hasExtension(data.name, [ 'mp4', 'rm', 'mov', 'wmv', 'webm', 'ogg', 'avi', 'mkv' ])) {
				Modal.error({
					title: '请注意',
					content: '上传文件不符合要求'
				});
				return false;
			}
			// file counts start with 0.
			if (videoUploader.methods.getNetUploads() >= 1) {
				Modal.error({
					title: '请注意',
					content: '目前只允许上传一个文件.'
				});
				return false;
			}
		});
		videoUploader.on('complete', async (id, name, responseJSON) => {
			if (responseJSON && responseJSON.uuid) {
				this.setState({ uuid: responseJSON.uuid[0] });
				this.props.handleFileChange.apply(this, [ name, responseJSON.uuid[0], responseJSON ]);
			}
		});
	}

	render() {
		return <Gallery uploader={videoUploader} />;
	}
}

export default VideoUploader;

// const queueStats = await axios.get('/queue/stats', {
// 	params: {
// 		type: 'waiting',
// 		size: 100
// 	}
// });

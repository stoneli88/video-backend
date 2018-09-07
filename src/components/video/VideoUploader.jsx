import React, { Component } from 'react';
import { Modal } from 'antd';
import axios from '../../axios';
import Gallery from '../react-fine-upload/gallery/index';
import videoUploader from './uploader';
import '../react-fine-upload/gallery/gallery.css';

// Test file extension.
function hasExtension(fileName, exts) {
	return new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$').test(fileName);
}

class VideoUploader extends Component {
	constructor() {
		super();
		this.uploadFiles = [];
	}

	componentDidMount() {
		videoUploader.on('deleteComplete', async (id, reqJSON, isError) => {
			let uuid = null;
			this.uploadFiles.forEach((file) => {
				if (file.cid === id) {
					uuid = id;
				}
			});
			this.uploadFiles = this.uploadFiles.filter((file) => {
				return file.cid !== id;
			});
			const queue = await axios.delete(`/queue/${uuid}`);
			this.props.handleFileDelete.apply(this, [ this.uploadFiles, queue ]);
		});
		videoUploader.on('validate', (data, buttonContainer) => {
			if (!hasExtension(data.name, [ 'mp4', 'rm', 'mov', 'wmv', 'webm', 'ogg', 'avi', 'mkv', 'jpg', 'png' ])) {
				Modal.error({
					title: '请注意',
					content: '上传文件不符合要求'
				});
				return false;
			}
			// file counts start with 0.
			if (videoUploader.methods.getNetUploads() >= 2) {
				Modal.error({
					title: '请注意',
					content: '目前只允许上传一个视频文件和一个封面图片.'
				});
				return false;
			}
		});
		videoUploader.on('complete', async (id, name, responseJSON) => {
			if (responseJSON && responseJSON.uuid) {
				this.uploadFiles.push({ cid: id, submittedFileId: responseJSON.uuid[0], submittedFileName: name });
				this.props.handleFileChange.apply(this, [ name, responseJSON.uuid[0], this.uploadFiles ]);
			}
		});
	}

	render() {
		return <Gallery uploader={videoUploader} />;
	}
}

export { VideoUploader, hasExtension };

// const queueStats = await axios.get('/queue/stats', {
// 	params: {
// 		type: 'waiting',
// 		size: 100
// 	}
// });

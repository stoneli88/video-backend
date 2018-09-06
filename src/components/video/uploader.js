import FineUploaderTraditional from 'fine-uploader-wrappers';
import '../react-fine-upload/gallery/gallery.css';

const UPLOADER_SERVER = "http://127.0.0.1:8080";

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
      endpoint: `${UPLOADER_SERVER}/api/upload`
		},
		request: {
      endpoint: `${UPLOADER_SERVER}/api/uploads`
		},
		retry: {
			enableAuto: true
		},
		resume: {
			enabled: true
		}
	}
});

export default videoUploader;

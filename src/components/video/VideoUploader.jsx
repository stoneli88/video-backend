import React, { Component } from "react";
import Gallery from "../react-fine-upload/gallery/index";
import FineUploaderTraditional from "fine-uploader-wrappers";
import "../react-fine-upload/gallery/gallery.css";

// declare a new uploader instance.
const videoUploader = new FineUploaderTraditional({
  options: {
    fileSizeOnSubmit: true,
    autoUpload: true,
    maxConnections: 5,
    chunking: {
      enabled: true,
      partSize: 2000000,
      concurrent: {
        enabled: true
      }
    },
    deleteFile: {
      enabled: true,
      endpoint: "http://127.0.0.1:8080/api/upload"
    },
    request: {
      endpoint: "http://127.0.0.1:8080/api/uploads"
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
      submittedFile: 0,
      submittedFileName: ""
    };
  }

  componentDidMount() {
    videoUploader.on("submit", (id, name) => {
      this.setState({ submittedFile: id, submittedFileName: name });
      return true;
    });
  }

  render() {
    return <Gallery uploader={videoUploader} />;
  }
}

export default VideoUploader;

import React, { Component } from "react";
import axios from "axios";
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
      partSize: 1000000,
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
    },
    callbacks: {
      onComplete: async function(id, name, responseJSON) {
        const job = await axios.post("http://127.0.0.1:8080/api/new_job", {
          uuid: responseJSON.uuid[0],
          file: name
        });
        // const { data, jobId, success } = job.data;
        // if (success) {
        //   const result = await axios.post("http://127.0.0.1/api/fire_job", {
        //     jobId
        //   });
        // }
      }
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

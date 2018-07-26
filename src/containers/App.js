import React, { Component } from "react";
import "../assets/stylesheets/App.css";

import Button from "antd/lib/button";
import { Layout, Breadcrumb, Icon } from "antd";
import Gallery from "../components/react-fine-upload/gallery/index";
import FineUploaderTraditional from 'fine-uploader-wrappers'

import "../assets/stylesheets/fineupload.css";

const { Header, Content, Footer } = Layout;
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
class App extends Component {
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
    return (
      <div className="App container-root">
        <Layout>
          <Header className="header">
            <div className="logo">后台管理</div>
          </Header>
          <Content style={{ padding: "0 50px" }}>
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
              <Breadcrumb.Item>视频管理</Breadcrumb.Item>
              <Breadcrumb.Item>上传视频</Breadcrumb.Item>
            </Breadcrumb>
            <Layout style={{ padding: "24px 0", background: "#fff" }}>
              <Content style={{ padding: "0 24px", minHeight: 280 }}>
                <Gallery uploader={videoUploader} />
              </Content>
            </Layout>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Video Manager ©2016 Created by Malik
          </Footer>
        </Layout>
      </div>
    );
  }
}

export default App;

import React, { Component } from "react";
// ANTD
import { Layout, Row, Col } from "antd";
import "./style.css";
class Login extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <Layout className="App container-login">
        <Row>
          <Col span={24}>
            <div className="icon"></div>
            <div className=""></div>
            <div className=""></div>
          </Col>
        </Row>
      </Layout>
    );
  }
}

export default Login;

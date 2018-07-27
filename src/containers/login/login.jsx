import React, { Component } from "react";
// ANTD
import { Layout, Breadcrumb } from "antd";
import "./style.css";
class Login extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return <Layout className="App container-login" />;
  }
}

export default Login;

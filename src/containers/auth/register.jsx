import React, { Component } from "react";
// ANTD.
import { Layout, Icon, Form, Input, Button, Checkbox, Tooltip } from "antd";
// Apollo.
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
// Stylesheet.
import "./style.css";

const FormItem = Form.Item;

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`;

class Register extends Component {
  constructor() {
    super();
    this.state = {};
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        this.mutation();
      }
    });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("二次输入的密码不一致，请确认!");
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  _confirm = async data => {
    const { token } = data.signup;
    this._saveUserData(token);
    this.props.history.push(`/`);
  };

  _saveUserData = token => {
    sessionStorage.setItem("AUTH_TOKEN", token);
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

    return (
      <Layout className="App container-login">
        <div span={24} className="login-wrapper">
          <div
            className="icon"
            style={{ fontSize: "96px", textAlign: "center" }}
          >
            <div style={{ fontSize: "32px" }}>Welcome</div>
            <Icon type="user-add" />
          </div>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              {getFieldDecorator("email", {
                rules: [{ required: true, message: "请输入正确的邮件地址!" }]
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="用户名(email)"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator("password", {
                rules: [
                  { required: true, message: "请输入密码!" },
                  {
                    validator: this.validateToNextPassword
                  }
                ]
              })(
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  type="password"
                  placeholder="密码"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator("confirm", {
                rules: [
                  {
                    required: true,
                    message: "请再次输入您的密码!"
                  },
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(
                <Input
                  type="password"
                  onBlur={this.handleConfirmBlur}
                  prefix={
                    <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="确认密码"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator("name", {
                rules: [
                  {
                    required: true,
                    message: "请输入您的昵称!",
                    whitespace: true
                  }
                ]
              })(
                <Input
                  prefix={
                    <Icon type="smile-o" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="请输入您的昵称!"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator("agreement", {
                valuePropName: "checked"
              })(
                <Checkbox>
                  我已经阅读且同意 <a href="">【网站条款】</a>
                </Checkbox>
              )}
            </FormItem>
            <Mutation
              mutation={SIGNUP_MUTATION}
              variables={{
                email: getFieldValue("email"),
                password: getFieldValue("password"),
                name: getFieldValue("name")
              }}
              onCompleted={data => this._confirm(data)}
            >
              {(mutation, { loading, error }) => {
                this.mutation = mutation;
                return (
                  <FormItem>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="register-form-button"
                      style={{ width: "100%" }}
                    >
                      注册
                    </Button>
                    <div className="register-footer">
                      {loading && <p>正在提交请求...</p>}
                      {error && <p>Error :( 服务器开小差了，请稍后再尝试注册!</p>}
                    </div>
                  </FormItem>
                );
              }}
            </Mutation>
          </Form>
        </div>
      </Layout>
    );
  }
}

export default Form.create()(Register);

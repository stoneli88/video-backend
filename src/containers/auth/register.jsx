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
      }
    });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("Two passwords that you enter is inconsistent!");
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
    sessionStorage.setItem(AUTH_TOKEN, token);
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Layout className="App container-login">
        <div span={24} className="login-wrapper">
          <div
            className="icon"
            style={{ fontSize: "96px", textAlign: "center" }}
          >
            <div style={{ fontSize: "32px" }}>Welcome</div>
            <Icon type="user" />
          </div>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              {getFieldDecorator("userName", {
                rules: [{ required: true, message: "请输入用户名!" }]
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
            <FormItem {...formItemLayout} label="确认密码">
              {getFieldDecorator("confirm", {
                rules: [
                  {
                    required: true,
                    message: "Please confirm your password!"
                  },
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={
                <span>
                  昵称&nbsp;
                  <Tooltip title="我们应该怎么称呼你?">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
            >
              {getFieldDecorator("name", {
                rules: [
                  {
                    required: true,
                    message: "请输入您的昵称!",
                    whitespace: true
                  }
                ]
              })(<Input />)}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              {getFieldDecorator("agreement", {
                valuePropName: "checked"
              })(
                <Checkbox>
                  我已经阅读且同意 <a href="">网站条款</a>
                </Checkbox>
              )}
            </FormItem>
            <FormItem>
              <Mutation
                mutation={SIGNUP_MUTATION}
                variables={{ userName, name, password }}
                onCompleted={data => this._confirm(data)}
              />
              {mutation => (
                <Button
                  type="primary"
                  htmlType="submit"
                  className="register-form-button"
                >
                  注册
                </Button>
              )}
            </FormItem>
          </Form>
        </div>
      </Layout>
    );
  }
}

export default Form.create()(Register);

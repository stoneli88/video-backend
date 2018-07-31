import React, { Component } from "react";
// ANTD.
import { Layout, Icon, Form, Input, Button, Checkbox } from "antd";
// Apollo.
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
// Stylesheet.
import "./style.css";

const FormItem = Form.Item;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

class Login extends Component {
  constructor() {
    super();
    this.state = {};
  }

  handleSubmit = (e, login) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        login({
          variables: { email: values.userName, password: values.password }
        });
      }
    });
  };

  _confirm = async data => {
    const { token } = data.login;
    this._saveUserData(token);
    this.props.history.push(`/`);
  };

  _saveUserData = token => {
    sessionStorage.setItem("AUTH_TOKEN", token);
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Mutation mutation={LOGIN_MUTATION} onCompleted={this._confirm}>
        {(login, { loading, error }) => (
          <Layout className="App container-login">
            <div span={24} className="login-wrapper">
              <div
                className="icon"
                style={{ fontSize: "96px", textAlign: "center" }}
              >
                <div style={{ fontSize: "32px" }}>Welcome</div>
                <Icon type="user" />
              </div>
              <Form
                onSubmit={e => this.handleSubmit.apply(this, [e, login])}
                className="login-form"
              >
                <FormItem>
                  {getFieldDecorator("userName", {
                    rules: [{ required: true, message: "请输入用户名!" }]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="user"
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      placeholder="用户名(email)"
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator("password", {
                    rules: [{ required: true, message: "请输入密码!" }]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      type="password"
                      placeholder="密码"
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator("remember", {
                    valuePropName: "checked",
                    initialValue: true
                  })(<Checkbox>记住我</Checkbox>)}
                  <a className="login-form-forgot" href="">
                    忘记密码
                  </a>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    登录
                  </Button>
                  Or <a href="">注册!</a>
                </FormItem>
              </Form>
              <div className="login-footer">
                {loading && <p>Loading...</p>}
                {error && <p>Error :( Please try again</p>}
              </div>
            </div>
          </Layout>
        )}
      </Mutation>
    );
  }
}

export default Form.create()(Login);

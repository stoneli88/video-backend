import React, { Component } from "react";
// ANTD.
import {
  Layout,
  Icon,
  Form,
  Input,
  Button,
  Select,
  notification,
  Alert
} from "antd";
// Apollo.
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
// Upload.
import VideoUploader from "../../components/video/VideoUploader";
// Stylesheet.
import "./style.css";

const FormItem = Form.Item;
const Option = Select.Option;

const QUERY_CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
    }
  }
`;

const VIDEOS_QUERY = gql`
  query VideoQuery(
    $filter: String
    $first: Int
    $skip: Int
    $orderBy: VideoOrderByInput
  ) {
    videos(filter: $filter, first: $first, skip: $skip, orderBy: $orderBy) {
      id
      name
      description
      category {
        id
        name
      }
      owner {
        name
      }
      path
      isEncoded
      createdAt
    }
  }
`;

const CREATE_OR_UPDATE_VIDEO_MUTATION = gql`
  mutation createOrUpdateVideo(
    $id: String
    $name: String
    $description: String
    $category: String
    $isEncoded: String
    $path: String
  ) {
    signup(
      id: $id
      name: $name
      description: $description
      category: $category
      isEncoded: $isEncoded
      path: $path
    ) {
      id
    }
  }
`;

const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 14 }
};

class Video extends Component {
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

  handleFileChange = (uuid, responseJSON) => {
    this.props.form.setFieldsValue({
      uuid
    });
  };

  handleFileDelete = () => {
    this.props.form.setFieldsValue({
      uuid: ""
    });
  };

  componentDidMount() {
    console.log();
  }

  _confirm = async data => {};

  _getQueryVariables = () => {
    const skip = 0;
    const first = 20;
    const orderBy = "createdAt_DESC";
    const filter = JSON.stringify({
      id: this.props.location.search
        ? this.props.location.search.replace("?", "").trim()
        : ""
    });
    return { filter, first, skip, orderBy };
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Query query={VIDEOS_QUERY} variables={this._getQueryVariables()}>
        {({ error, data }) => {
          let videoData =
            data && data.videos && data.videos.length > 0
              ? data.videos[0]
              : undefined;
          if (error) {
            return (
              <Alert
                showIcon
                message={`获取视频信息出错了!`}
                description={`原因:${error}`}
                type="error"
              />
            );
          }
          return videoData ? (
            <Layout className="App container-videoDetails">
              <div
                span={24}
                className="videoDetails-wrapper"
                style={{ backgroundColor: "#fff" }}
              >
                <Form onSubmit={this.handleSubmit} className="video-form">
                  <FormItem {...formItemLayout} label="视频名">
                    {getFieldDecorator("name", {
                      initialValue: `${videoData.name}`,
                      rules: [
                        { required: true, message: "请输入合法的视频地址!" }
                      ]
                    })(<Input placeholder="视频名(不超过50个字)" />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="视频描述">
                    {getFieldDecorator("description", {
                      initialValue: `${videoData.description}`,
                      rules: [{ required: true, message: "请输入视频的描述!" }]
                    })(
                      <Input
                        type="textarea"
                        placeholder="视频描述(不超过255个字)"
                      />
                    )}
                  </FormItem>
                  <Query query={QUERY_CATEGORIES}>
                    {({ data }) => {
                      let categories =
                        data && data.categories && data.categories.length > 0
                          ? data.categories
                          : undefined;
                      return (
                        <FormItem {...formItemLayout} label="分类">
                          {getFieldDecorator("select", {
                            initialValue: `${videoData.category.name}`,
                            rules: [
                              {
                                required: true,
                                message: "请选择视频的种类!"
                              }
                            ]
                          })(
                            <Select placeholder="请选择视频的分类">
                              {categories &&
                                categories.map(category => (
                                  <Option value={category.id} key={category.id}>
                                    {category.name}
                                  </Option>
                                ))}
                            </Select>
                          )}
                        </FormItem>
                      );
                    }}
                  </Query>
                  <div className="ant-row ant-form-item">
                    <div className="ant-col-2 ant-form-item-label">
                      <label
                        htmlFor="name"
                        className="ant-form-item-required"
                        title="上传视频"
                      >
                        上传视频
                      </label>
                    </div>
                    <div className="ant-col-14 ant-form-item-control-wrapper">
                      <VideoUploader
                        handleFileChange={this.handleFileChange}
                        handleFileDelete={this.handleFileDelete}
                      />
                    </div>
                  </div>
                  <FormItem {...formItemLayout} label="视频标识">
                    {getFieldDecorator("uuid", {
                      rules: [
                        { required: true, message: "请确认文件上传是否成功." }
                      ]
                    })(
                      <Input
                        disabled
                        type="text"
                        placeholder="文件标识，上传完成后会显示"
                      />
                    )}
                  </FormItem>
                  <Mutation
                    mutation={CREATE_OR_UPDATE_VIDEO_MUTATION}
                    variables={{
                      name: getFieldValue("name"),
                      description: getFieldValue("description"),
                      category: getFieldValue("category")
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
                            style={{
                              width: "59%",
                              marginLeft: "8%",
                              height: "50px"
                            }}
                          >
                            提交
                          </Button>
                          <div className="register-footer">
                            {loading && <p>正在提交请求...</p>}
                            {error && (
                              <p>Error :( 服务器开小差了，请稍后再尝试注册!</p>
                            )}
                          </div>
                        </FormItem>
                      );
                    }}
                  </Mutation>
                </Form>
              </div>
            </Layout>
          ) : (
            <span />
          );
        }}
      </Query>
    );
  }
}

export default Form.create()(Video);

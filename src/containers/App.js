import React, { Component } from "react";
import { Link } from "react-router-dom";
// ANTD.
import {
  Layout,
  Table,
  Alert,
  notification,
  Tooltip,
  Badge,
  Icon,
  Button,
  Input,
  Select,
  Row,
  Col
} from "antd";
// Date.
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
// Apollo.
import { Query } from "react-apollo";
import gql from "graphql-tag";
// Stylesheet.
import "../assets/stylesheets/App.css";

const Search = Input.Search;
const InputGroup = Input.Group;
const ButtonGroup = Button.Group;
const Option = Select.Option;

const VIDEOS_PER_PAGE = 20;
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
      isEncoded
      createdAt
    }
  }
`;

const columns = [
  {
    title: "名称",
    dataIndex: "name",
    render: (text, record, index) => {
      return (
        <Tooltip title="点击查看视频详情">
          <Link to={{
            pathname: "/video",
            search: `${record.id}`,
          }}>{text}</Link>
        </Tooltip>
      );
    }
  },
  {
    title: "分类",
    className: "column-category",
    dataIndex: "category"
  },
  {
    title: "上传者",
    className: "column-owner",
    dataIndex: "owner"
  },
  {
    title: "上传时间",
    className: "column-createdTime",
    dataIndex: "createdAt",
    render: text => {
      return dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    }
  },
  {
    title: "简述",
    className: "column-owner",
    dataIndex: "description"
  },
  {
    title: "转码状态",
    className: "column-status",
    dataIndex: "isEncoded",
    render: text => {
      let status = {};
      switch (text) {
        case "processing":
          status = (
            <Tooltip title="视频正在等待转码中, 可以手动刷新查看最新状态.">
              <span>
                <Badge status="processing" />转码中
              </span>
            </Tooltip>
          );
          break;
        case "success":
          status = (
            <Tooltip title="视频转码成功了，可以点击预览按钮查看视频.">
              <span>
                <Badge status="success" />转码成功
              </span>
            </Tooltip>
          );
          break;
        case "error":
          status = (
            <Tooltip title="视频转码失败了，点击详情按钮查看失败的原因.">
              <span>
                <Badge status="error" />转码出错
              </span>
            </Tooltip>
          );
          break;
        default:
          status = (
            <Tooltip title="视频尚未上传，请点击视频名称到视频详情页面上传.">
              <span>
                <Badge status="warning" />等待上传
              </span>
            </Tooltip>
          );
          break;
      }
      return status;
    }
  },
  {
    title: "操作",
    key: "operation",
    width: 300,
    render: () => {
      return (
        <ButtonGroup>
          <Button type="danger">
            <Icon type="coffee" />转码
          </Button>
          <Button type="default">
            <Icon type="picture" />截图
          </Button>
          <Button>
            <Icon type="play-circle" />预览
          </Button>
        </ButtonGroup>
      );
    }
  }
];

class App extends Component {
  constructor() {
    super();
    this.state = {
      filter: {}
    };
  }

  _getQueryVariables = () => {
    const page = parseInt(this.props.match.params.page, 10);

    const skip = 0;
    const first = VIDEOS_PER_PAGE;
    const orderBy = "createdAt_DESC";
    return { first, skip, orderBy };
  };

  _getTableColumnData(videos) {
    if (!videos) return [];
    return videos.map(video => {
      return {
        id: video.id,
        name: video.name,
        category: video.category.name,
        owner: video.owner.name,
        createdAt: video.createdAt,
        isEncoded: video.isEncoded,
        description: video.description
      };
    });
  }

  render() {
    return (
      <Layout className="App container-dashboard">
        <Row gutter={24} style={{ margin: "10px 0" }}>
          <Col span={18}>
            <InputGroup compact>
              <Select defaultValue="name">
                <Option value="name">名称</Option>
                <Option value="owner">上传人</Option>
              </Select>
              <Search
                enterButton
                style={{ width: "50%" }}
                placeholder="请输入搜索内容"
              />
            </InputGroup>
          </Col>
          <Col span={6} style={{ textAlign: "right" }}>
            <Tooltip title="上传视频的大小限制在1G以内">
              <Button type="danger" icon="plus" style={{ marginRight: "12px" }}>
                上传视频
              </Button>
            </Tooltip>
            <Tooltip title="手动刷新及时获取消息">
              <Button icon="sync">手动刷新</Button>
            </Tooltip>
          </Col>
        </Row>
        <Query
          query={VIDEOS_QUERY}
          variables={this._getQueryVariables()}
          pollInterval={15000}
          notifyOnNetworkStatusChange
        >
          {({ loading, error, data, refetch, networkStatus }) => {
            if (networkStatus === 4) {
              notification.info({
                message: "提示",
                description: "正在刷新最新视频信息...",
                duration: 2
              });
            }
            if (loading) {
              notification.info({
                message: "提示",
                description: "正在刷新最新视频信息...",
                duration: 2
              });
            }
            if (error)
              return (
                <Alert
                  showIcon
                  message={`获取视频信息出错了!`}
                  description={`原因:${error}`}
                  type="error"
                />
              );
            return (
              <Table
                style={{ margin: "12px" }}
                bordered
                columns={columns}
                dataSource={this._getTableColumnData(data.videos)}
                pagination={{ pageSize: 20 }}
                style={{ background: "#fff" }}
              />
            );
          }}
        </Query>
      </Layout>
    );
  }
}

export default App;

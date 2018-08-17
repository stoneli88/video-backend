import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Axios
import axios from '../../axios';
// ANTD.
import { Layout, Table, Alert, Tooltip, Badge, Icon, Button, Input, Select, Row, Col } from 'antd';
// Date.
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
// Apollo.
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
// Stylesheet.
import '../../assets/stylesheets/App.css';

const Search = Input.Search;
const InputGroup = Input.Group;
const ButtonGroup = Button.Group;
const Option = Select.Option;

const VIDEOS_PER_PAGE = 20;
const VIDEOS_QUERY = gql`
	query VideoQuery($filter: String, $first: Int, $skip: Int, $orderBy: VideoOrderByInput) {
		videos(filter: $filter, first: $first, skip: $skip, orderBy: $orderBy) {
			id
			uuid
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
			updatedAt
		}
	}
`;

const REMOVE_VIDEO = gql`
	mutation RemoveVideo($id: String!) {
		removeVideo(id: $id) {
			id
		}
	}
`;

const UPDATE_VIDEO = gql`
	mutation UpdateVideoMutation($id: String!, $isEncoded: Boolean, $path: String) {
		updateVideo(id: $id, isEncoded: $isEncoded, path: $path) {
			id
		}
	}
`;

const handleCodeVideo = async (record) => {
	try {
		const process = await axios.get(`/queue/stats/${record.uuid}`);
		console.log(process);
	} catch (error) {
		console.log(error);
	}
};

const columns = [
	{
		title: '名称',
		dataIndex: 'name',
		width: 350,
		render: (text, record, index) => {
			return (
				<Tooltip title="点击查看视频详情">
					<Link
						to={{
							pathname: '/video/edit',
							search: `${record.id}`
						}}
					>
						{text}
					</Link>
				</Tooltip>
			);
		}
	},
	{
		title: '分类',
		className: 'column-category',
		dataIndex: 'category',
		width: 100
	},
	{
		title: '上传者',
		className: 'column-owner',
		dataIndex: 'owner',
		width: 100
	},
	{
		title: '上传时间',
		className: 'column-createdTime',
		dataIndex: 'createdAt',
		width: 180,
		render: (text) => {
			return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
		}
	},
	{
		title: '简述',
		className: 'column-owner',
		dataIndex: 'description',
		width: 420
	},
	{
		title: '转码状态',
		className: 'column-status',
		dataIndex: 'isEncoded',
		render: (text, record) => {
			const { uuid, path } = record;
			let status = {};
			if (uuid && !path) {
				status = (
					<Tooltip title="视频已经在转码队列中, 可以手动刷新查看最新状态.">
						<span>
							<Badge status="processing" style={{ width: '16px', height: '16px' }} />已经上传，转码队列中...
						</span>
					</Tooltip>
				);
			}
			if (uuid && path) {
				status = (
					<Tooltip title="视频转码成功了，可以点击预览按钮查看视频.">
						<span>
							<Badge status="success" style={{ width: '16px', height: '16px' }} />转码成功
						</span>
					</Tooltip>
				);
			}
			if (!uuid && !path) {
				status = (
					<Tooltip title="视频尚未上传，请点击视频名称到视频详情页面上传.">
						<span>
							<Badge status="warning" style={{ width: '16px', height: '16px' }} />等待上传
						</span>
					</Tooltip>
				);
			}
			return status;
		}
	},
	{
		title: '操作',
		key: 'operation',
		width: 300,
		render: (text, record) => {
			return (
				<Mutation mutation={UPDATE_VIDEO}>
					{(mutation, { loading, error }) => {
						this.updateVideoMutation = mutation;
						return (
							<ButtonGroup>
								<Button type="default" onClick={() => handleCodeVideo.apply(this, [ record ])}>
									<Icon type="sync" />同步
								</Button>
								<Button type="default">
									<Icon type="picture" />截图
								</Button>
								<Button>
									<Icon type="play-circle" />预览
								</Button>
							</ButtonGroup>
						);
					}}
				</Mutation>
			);
		}
	}
];

class Videos extends PureComponent {
	constructor() {
		super();
		this.state = {
			filter: {},
			selectedRowKeys: []
		};
		this.handleDeleteVideo = this.handleDeleteVideo.bind(this);
	}

	handleDeleteVideo = () => {
		const selectedRowKeys = this.state.selectedRowKeys[0]; // * 暂只能删除一个视频文件
		this.deleteVideoMutation({
			variables: {
				id: this.videos[selectedRowKeys]['id']
			},
			refetchQueries: () => [
				{
					query: VIDEOS_QUERY,
					variables: this._getQueryVariables()
				}
			]
		});
	};

	onSelectChange = (selectedRowKeys) => {
		this.setState({ selectedRowKeys });
	};

	_getQueryVariables = () => {
		// const page = parseInt(this.props.match.params.page, 10);
		const skip = 0;
		const first = VIDEOS_PER_PAGE;
		const orderBy = 'createdAt_DESC';
		return { first, skip, orderBy };
	};

	_getTableColumnData(videos) {
		if (!videos) return [];
		return (this.videos = videos.map((video) => {
			return {
				id: video.id,
				uuid: video.uuid,
				name: video.name,
				path: video.path,
				category: video.category.name,
				owner: video.owner.name,
				createdAt: video.createdAt,
				updateAt: video.updateAt,
				isEncoded: video.isEncoded,
				description: video.description
			};
		}));
	}

	render() {
		const { selectedRowKeys } = this.state;
		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange
		};
		const hasSelected = selectedRowKeys.length > 0 && selectedRowKeys.length < 2;
		return (
			<Layout className="App container-dashboard" style={{ borderRadius: '5px' }}>
				<Row gutter={24} style={{ margin: '10px 0' }}>
					<Col span={18}>
						<InputGroup compact>
							<Select defaultValue="name">
								<Option value="name">名称</Option>
								<Option value="owner">上传人</Option>
							</Select>
							<Search enterButton style={{ width: '50%' }} placeholder="请输入搜索内容" />
						</InputGroup>
					</Col>
					<Col span={6} style={{ textAlign: 'right' }}>
						<Tooltip title="上传视频的大小限制在1G以内">
							<Link
								to={{
									pathname: '/video/new'
								}}
							>
								<Button type="danger" icon="plus" style={{ marginRight: '12px' }}>
									上传视频
								</Button>
							</Link>
						</Tooltip>
						<Tooltip title="手动刷新及时获取消息">
							<Button icon="sync" style={{ marginRight: '12px' }}>
								手动刷新
							</Button>
						</Tooltip>
						<Mutation mutation={REMOVE_VIDEO}>
							{(mutation, { loading, error }) => {
								this.deleteVideoMutation = mutation;
								return (
									<Tooltip title="目前暂不支持删除多个视频">
										<Button icon="delete" disabled={!hasSelected} onClick={this.handleDeleteVideo}>
											删除视频
										</Button>
									</Tooltip>
								);
							}}
						</Mutation>
					</Col>
				</Row>
				<Query query={VIDEOS_QUERY} variables={this._getQueryVariables()} notifyOnNetworkStatusChange>
					{({ error, data }) => {
						if (error)
							return <Alert showIcon message={`获取视频信息出错了!`} description={`原因:${error}`} type="error" />;
						return (
							<Table
								style={{ margin: '12px', background: '#fff', marginTop: '0' }}
								bordered
								rowSelection={rowSelection}
								columns={columns}
								dataSource={this._getTableColumnData(data.videos)}
								pagination={{ pageSize: 20 }}
							/>
						);
					}}
				</Query>
			</Layout>
		);
	}
}

export default Videos;

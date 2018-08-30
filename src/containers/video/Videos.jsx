import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Axios
import axios from '../../axios';
// ANTD.
import { Layout, Table, Alert, Tooltip, Badge, Icon, Button, Input, Select, Row, Col, Modal } from 'antd';
// Date.
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
// Apollo.
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
// Video player.
import FlvPlayer from '../../components/player/FlvPlayer';
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

const handleCodeVideo = async (record, VideosComponent) => {
	try {
		const videoInfo = await axios.get(`/video/play/${record.uuid}`);
		const { mp4info, url, xml } = videoInfo.data.video;
		fetchMPD(xml, (res, resXML) => {
			VideosComponent._openPreviewModal(url, mp4info, res);
		});
	} catch (error) {
		console.log(error);
	}
	function fetchMPD(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('get', `http://${url}`, true);
		xhr.responseType = 'document';
		xhr.overrideMimeType('text/xml');
		xhr.onload = function() {
			callback(xhr.response, xhr.responseXML);
		};
		xhr.send();
	}
};

const makeQueueColumns = (VideosComponent) => {
	return [
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
			width: 520
		},
		{
			title: '转码状态',
			className: 'column-status',
			dataIndex: 'isEncoded',
			render: (text, record) => {
				const { uuid, path, isEncoded } = record;
				let status = {};
				if (uuid && !path) {
					status = (
						<Tooltip title="视频已经在转码队列中, 请耐心等待...">
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
				if (isEncoded === 'ERROR') {
					status = (
						<Tooltip title="视频转码失败，正在重试，最终状态可以在队列中查看.">
							<span>
								<Badge status="warning" style={{ width: '16px', height: '16px' }} />转码失败
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
			width: 200,
			render: (text, record) => {
				return (
					<ButtonGroup>
						<Button type="default" onClick={() => handleCodeVideo.apply(this, [ record, VideosComponent ])}>
							<Icon type="play-circle" />预览
						</Button>
					</ButtonGroup>
				);
			}
		}
	];
};

class Videos extends PureComponent {
	constructor() {
		super();
		this.state = {
			videoType: '',
			videoUrl: '',
			mimeCodec: '',
			videoMDS: null,
			modalVisible: false,
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

	handleModalOk = (e) => {
		this.setState({
			modalVisible: false
		});
	};

	handleModalCancel = (e) => {
		this.setState({
			modalVisible: false
		});
	};

	_openPreviewModal = (url, mp4info, res) => {
		this.setState({
			videoType: 'mp4',
			videoUrl: `http://${url}`,
			mimeCodec: mp4info,
			modalVisible: true,
			videoMDS: res
		});
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
				<Modal
					title="视频预览"
					visible={this.state.modalVisible}
					onOk={this.handleModalOk}
					onCancel={this.handleModalCancel}
				>
					<FlvPlayer
						mpd={this.state.videoMDS}
						type={this.state.videoType}
						url={this.state.videoUrl}
						mimeCodec={this.state.mimeCodec}
						cors={true}
						isLive={false}
					/>
				</Modal>
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
				<Query query={VIDEOS_QUERY} variables={this._getQueryVariables()} pollInterval={500}>
					{({ error, data }) => {
						if (error)
							return <Alert showIcon message={`获取视频信息出错了!`} description={`原因:${error}`} type="error" />;
						return (
							<Table
								style={{ margin: '12px', background: '#fff', marginTop: '0' }}
								bordered
								rowSelection={rowSelection}
								columns={makeQueueColumns.apply(this, [ this ])}
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

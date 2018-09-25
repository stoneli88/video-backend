import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Axios
import axios from '../../axios';
// ANTD.
import { Layout, Table, Alert, Tooltip, Icon, Button, Input, Select, Row, Col, Modal, Spin, Tag, message } from 'antd';
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
			mov_uuid
			cover_uuid
			mov_name
			cover_name
			name
			description
			category {
				id
				name
			}
			owner {
				name
			}
			viewnumber
			likes
			dislikes
			isEncoded
			dynamicRes
			manualRes
			createdAt
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

const handleCreateJob = async (record, VideosComponent, type) => {
	const data = {
		type,
		cover_name: record.cover_name,
		cover_uuid: record.cover_uuid,
		mov_name: record.mov_name,
		mov_uuid: record.mov_uuid,
		video_id: record.id
	};
	try {
		let secondsToGo = 3;
		await axios.post('/queue/create_job', data);
		const modal = Modal.success({
			title: '好消息',
			content: `成功创建了工作流，请耐心等待.(${secondsToGo}后关闭)`
		});
		setInterval(() => {
			secondsToGo -= 1;
			modal.update({
				content: `成功创建了工作流，请耐心等待.(${secondsToGo}后关闭)`
			});
		}, 1000);
		setTimeout(() => modal.destroy(), secondsToGo * 1000);
	} catch (error) {
		console.log(error);
	}
};

const makeQueueColumns = (VideosComponent) => {
	return [
		{
			title: '名称',
			dataIndex: 'name',
			width: 280,
			render: (text, record, index) => {
				const { dynamicRes, manualRes } = record;
				return (
					<div>
						<Tooltip title="点击查看视频详情">
							<Link
								style={{ marginBottom: '8px', display: 'inline-block' }}
								to={{
									pathname: '/video/edit',
									search: `${record.id}`
								}}
							>
								<Icon
									type="youtube"
									theme="filled"
									style={{
										fontSize: '32px',
										color: '#ff4d4f',
										position: 'relative',
										top: '7px',
										left: '-2px'
									}}
								/>
								{text}
							</Link>
						</Tooltip>
						<div>
							{manualRes === 'No' ? (
								<Tag color="#f50">DOWNLOAD未完成</Tag>
							) : (
								<Tag color="#87d068">DOWNLOAD完成</Tag>
							)}
							{dynamicRes === 'No' ? <Tag color="#f50">HLS未完成</Tag> : <Tag color="#87d068">HLS完成</Tag>}
						</div>
					</div>
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
			width: 140,
			render: (text) => {
				return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
			}
		},
		{
			title: '简述',
			className: 'column-owner',
			dataIndex: 'description',
			width: 380
		},
		{
			title: '状态',
			className: 'column-status',
			dataIndex: 'isEncoded',
			align: 'center',
			width: 80,
			render: (text, record) => {
				const { isEncoded } = record;
				let status = {};
				if (isEncoded === 'RUNING') {
					status = (
						<Tooltip title="视频已经在转码队列中.">
							<span>
								<Spin size="large" />
							</span>
						</Tooltip>
					);
				} else if (isEncoded === 'Yes') {
					status = (
						<Tooltip title="视频转码成功了，可以点击预览按钮查看视频.">
							<span>
								<Icon
									style={{ fontSize: '48px', marginLeft: '0' }}
									type="check-circle"
									theme="twoTone"
									twoToneColor="#52c41a"
								/>
							</span>
						</Tooltip>
					);
				} else if (isEncoded === 'ERROR') {
					status = (
						<Tooltip title="视频转码失败，正在重试，最终状态可以在队列中查看.">
							<span>
								<Icon
									style={{ fontSize: '48px', marginLeft: '0' }}
									type="warning"
									theme="twoTone"
									twoToneColor="#eb2f96"
								/>
							</span>
						</Tooltip>
					);
				} else {
					status = (
						<Tooltip title="视频尚未转码，请进行转码操作.">
							<span>
								<Icon style={{ fontSize: '48px', marginLeft: '0' }} type="clock-circle" />
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
			width: 160,
			align: 'center',
			render: (text, record) => {
				const { dynamicRes, manualRes, isEncoded } = record;
				return (
					<ButtonGroup>
						<Tooltip title="生成符合HLS格式的播放源。">
							<Button
								disabled={dynamicRes !== 'No' || isEncoded === 'RUNING' ? true : false}
								type="default"
								onClick={() => handleCreateJob.apply(this, [ record, VideosComponent, 'hls' ])}
							>
								<Icon
									style={{ fontSize: '16px', verticalAlign: '-0.25em' }}
									type="youtube"
									theme="outlined"
								/>
							</Button>
						</Tooltip>
						<Tooltip title="生成符合下载需要的视频源。">
							<Button
								disabled={manualRes !== 'No' || isEncoded === 'RUNING' ? true : false}
								type="default"
								onClick={() => handleCreateJob.apply(this, [ record, VideosComponent, 'download' ])}
							>
								<Icon
									style={{ fontSize: '16px', verticalAlign: '-0.25em' }}
									type="cloud-download"
									theme="outlined"
								/>
							</Button>
						</Tooltip>
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
			mimeCodec: '',
			videoMDS: null,
			modalVisible: false,
			filter: {},
			selectedRowKeys: []
		};
		this.handleDeleteVideo = this.handleDeleteVideo.bind(this);
	}

	handleDeleteVideo = () => {
		const selectedRowKeys = this.state.selectedRowKeys.map((selected) => {
			return axios.delete(`/video/${this.videos[selected]['id']}`);
		});
		const hide = message.loading('正在执行删除视频的操作，请稍等..', 0);
		Promise.all(selectedRowKeys).then(() => {
			hide();
			message.success('删除视频成功!', 2.5);
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
				name: video.name,
				mov_uuid: video.mov_uuid,
				cover_uuid: video.cover_uuid,
				mov_name: video.mov_name,
				cover_name: video.cover_name,
				category: video.category.name,
				owner: video.owner.name,
				createdAt: video.createdAt,
				updateAt: video.updateAt,
				isEncoded: video.isEncoded,
				dynamicRes: video.dynamicRes,
				manualRes: video.manualRes,
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
		const hasSelected = selectedRowKeys.length > 0 && selectedRowKeys.length < 10;
		return (
			<Layout className="App container-dashboard" style={{ borderRadius: '5px' }}>
				<Row gutter={24} style={{ margin: '10px 0' }}>
					<Col span={16}>
						<InputGroup compact>
							<Select defaultValue="name">
								<Option value="name">名称</Option>
								<Option value="owner">上传人</Option>
							</Select>
							<Search enterButton style={{ width: '50%' }} placeholder="请输入搜索内容" />
						</InputGroup>
					</Col>
					<Col span={8} style={{ textAlign: 'right' }}>
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

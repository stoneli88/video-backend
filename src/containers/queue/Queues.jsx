import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Axios
import axios from '../../axios';
// ANTD.
import { Layout, Input, Button, Tooltip, Row, Col, Radio, Table, Icon, Popconfirm, message, Badge } from 'antd';
// Stylesheet.
import './style.css';

const Search = Input.Search;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const handleRemoveJob = async (record, QueueComponent) => {
	try {
		const removed = axios.delete(`/queue/${record.id}`);
		removed.then(() => {
			message.success('删除任务成功');
			QueueComponent._refresh();
		});
	} catch (error) {
		message.error(error, 10);
		console.log(error);
	}
};

const handleRestartJob = async (record) => {
	console.log(record);
};

const makeQueueColumns = (QueueComponent) => {
	return [
		{
			title: 'ID',
			dataIndex: 'id',
			width: 300
		},
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
			title: '创建时间',
			dataIndex: 'created',
			width: 150,
			render: (text, record, index) => {
				return <span>{text}</span>;
			}
		},
		{
			title: '视频分辨率',
			dataIndex: 'size',
			width: 150,
			render: (text, record, index) => {
				return <span>{text}</span>;
			}
		},
		{
			title: '操作',
			key: 'operation',
			width: 300,
			render: (text, record, index) => {
				return (
					<div>
						<Popconfirm
							title="请确认要重新开始这条任务吗?"
							onConfirm={() => handleRestartJob.apply(this, [ record ])}
							okText="确定"
							cancelText="取消"
						>
							<Button type="default" style={{ marginRight: '10px' }}>
								<Icon type="reload" />重试任务
							</Button>
						</Popconfirm>
						<Popconfirm
							title="请确认要删除这条任务吗?"
							onConfirm={() => handleRemoveJob.apply(this, [ record, QueueComponent ])}
							okText="确定"
							cancelText="取消"
						>
							<Button type="danger">
								<Icon type="delete" />终止任务
							</Button>
						</Popconfirm>
					</div>
				);
			}
		}
	];
};

class Queue extends PureComponent {
	constructor() {
		super();
		this.state = {
			queueOverview: {},
			filter: {},
			size: 100,
			queues: []
		};
		this.currentJobStats = 'waiting';
		this.handleJobFilterStatusChange = this.handleJobFilterStatusChange.bind(this);
	}

	async componentDidMount() {
		this._refresh();
	}

	async handleJobFilterStatusChange(e) {
		try {
			this.currentJobStats = e.target.value;
			const queues = await axios.get(`/queue/all/${e.target.value}/${this.state.size}`);
			this.setState({ queues: queues.data.jobs });
		} catch (error) {
			console.log(error);
		}
	}

	async _refresh() {
		try {
			const queueOverview = await axios.get('/queue/overview');
			const queues = await axios.get(`/queue/all/${this.currentJobStats}/${this.state.size}`);
			this.setState({ queues: queues.data.jobs, queueOverview: queueOverview.data.data });
		} catch (error) {
			console.log(error);
		}
	}

	_getTableColumnData() {
		if (!this.state.queues.length) return [];
		return this.state.queues.map((queue) => {
			return {
				id: queue.id,
				name: queue.data.video_name,
				created: queue.data.job_created || '无法获取时间',
				size: queue.data.video_size
			};
		});
	}

	render() {
		return (
			<Layout className="queue container-queue" style={{ borderRadius: '5px' }}>
				<Row gutter={24} style={{ margin: '10px 0' }}>
					<Col span={18}>
						<Search enterButton style={{ width: '50%', marginRight: '12px' }} placeholder="请输入搜索内容" />
						<RadioGroup onChange={this.handleJobFilterStatusChange} defaultValue="waiting">
							<RadioButton value="waiting">
								等待
								<Badge
									showZero
									count={this.state.queueOverview.waiting}
									style={{ backgroundColor: '#52c41a', top: "-2px", left: "10px" }}
								/>
							</RadioButton>
							<RadioButton value="active">
								活动
								<Badge
									showZero
									count={this.state.queueOverview.active}
									style={{ backgroundColor: '#52c41a', top: "-2px", left: "10px" }}
								/>
							</RadioButton>
							<RadioButton value="delayed">
								延迟
								<Badge
									showZero
									count={this.state.queueOverview.delayed}
									style={{ backgroundColor: '#52c41a', top: "-2px", left: "10px" }}
								/>
							</RadioButton>
							<RadioButton value="failed">
								失败
								<Badge
									showZero
									count={this.state.queueOverview.failed}
									style={{ backgroundColor: '#52c41a',top: "-2px", left: "10px" }}
								/>
							</RadioButton>
							<RadioButton value="succeeded">
								成功
								<Badge
									showZero
									count={this.state.queueOverview.succeeded}
									style={{ backgroundColor: '#52c41a', top: "-2px", left: "10px" }}
								/>
							</RadioButton>
						</RadioGroup>
					</Col>
					<Col span={6} style={{ textAlign: 'right' }}>
						<Tooltip title="手动刷新及时获取消息">
							<Button icon="sync" style={{ marginRight: '12px' }}>
								手动刷新
							</Button>
						</Tooltip>
					</Col>
				</Row>
				<Table
					style={{ margin: '12px', background: '#fff', marginTop: '0' }}
					bordered
					columns={makeQueueColumns.apply(this, [ this ])}
					dataSource={this._getTableColumnData()}
					pagination={{ pageSize: 20 }}
				/>
			</Layout>
		);
	}
}

export default Queue;

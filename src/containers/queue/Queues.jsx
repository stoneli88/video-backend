import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Axios
import axios from '../../axios';
// ANTD.
import { Layout, Input, Button, Alert, Modal, Tooltip, Row, Col, Radio, Table } from 'antd';
// Date.
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
// Stylesheet.
import './style.css';

const Search = Input.Search;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const queueColumns = [
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
		title: '工作进度',
		dataIndex: 'progress',
		render: (text, record, index) => {}
	},
	{
		title: '状态',
		dataIndex: 'status',
		width: 350,
		render: (text, record, index) => {}
	}
];

class Queue extends PureComponent {
	constructor() {
		super();
		this.state = {
			filter: {},
      size: 20,
      queues: []
		};
		this.handleJobFilterStatusChange = this.handleJobFilterStatusChange.bind(this);
	}

	async componentDidMount() {
    try {
      const queues = await axios.get(`/queue/all/waiting/${this.state.size}`);
      console.log(queues);
    } catch (error) {
      console.log(error);
    }
	}

	handleJobFilterStatusChange(e) {
		console.log(`radio checked:${e.target.value}`);
	}

	// _getTableColumnData(queues) {
	// 	if (!queues) return [];
	// 	return queues.map((video) => {
	// 		return {
	// 			id: video.id,
	// 			uuid: video.uuid,
	// 			name: video.name,
	// 			path: video.path,
	// 			category: video.category.name,
	// 			owner: video.owner.name,
	// 			createdAt: video.createdAt,
	// 			updateAt: video.updateAt,
	// 			isEncoded: video.isEncoded,
	// 			description: video.description
	// 		};
	// 	});
	// }

	render() {
		return (
			<Layout className="queue container-queue" style={{ borderRadius: '5px' }}>
				<Row gutter={24} style={{ margin: '10px 0' }}>
					<Col span={18}>
						<Search enterButton style={{ width: '50%' }} placeholder="请输入搜索内容" />
						<RadioGroup onChange={this.handleJobFilterStatusChange} defaultValue="waiting">
							<RadioButton value="waiting">等待</RadioButton>
							<RadioButton value="active">活动</RadioButton>
							<RadioButton value="delayed">延迟(出现问题)</RadioButton>
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
				{/* <Table
					style={{ margin: '12px', background: '#fff', marginTop: '0' }}
					bordered
					columns={queueColumns}
					dataSource={this._getTableColumnData(data.videos)}
					pagination={{ pageSize: 20 }}
				/> */}
			</Layout>
		);
	}
}

export default Queue;

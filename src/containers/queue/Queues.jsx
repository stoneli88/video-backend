import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Axios
import axios from '../../axios';
// ANTD.
import { Layout, Input, Button, Tooltip, Row, Col, Radio, Table, Icon } from 'antd';
// Stylesheet.
import './style.css';

const Search = Input.Search;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const handleRemoveJob = record => {
  console.log(record);
}

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
		title: '创建时间',
		dataIndex: 'created',
		width: 150,
		render: (text, record, index) => {
      return (
        <span>{text}</span>
      );
    }
  },
  {
    title: '视频分辨率',
    dataIndex: 'size',
    width: 150,
    render: (text, record, index) => {
      return (
        <span>{text}</span>
      );
    }
  },
  {
    title: '操作',
		key: 'operation',
    width: 300,
    render: (text, record, index) => {
      return (
        <Button type="danger" onClick={() => handleRemoveJob.apply(this, [ record ])}>
          <Icon type="remove" />终止此条任务
        </Button>
      );
    }
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
			this.setState({ queues });
		} catch (error) {
			console.log(error);
		}
	}

	async handleJobFilterStatusChange(e) {
    try {
      const queues = await axios.get(`/queue/all/${e.target.value}/${this.state.size}`);
			this.setState({ queues: queues.data.jobs });
		} catch (error) {
			console.log(error);
		}
	}

	_getTableColumnData() {
		if (!this.state.queues.length) return [];
		return this.state.queues.map(queue => {
			return {
				id: queue.id,
        name: queue.data.video_name,
        created: queue.data.job_created || "无法获取时间",
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
							<RadioButton value="waiting">等待</RadioButton>
							<RadioButton value="active">活动</RadioButton>
							<RadioButton value="delayed">延迟</RadioButton>
              <RadioButton value="failed">失败</RadioButton>
              <RadioButton value="succeeded">成功</RadioButton>
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
					columns={queueColumns}
					dataSource={this._getTableColumnData()}
					pagination={{ pageSize: 20 }}
				/>
			</Layout>
		);
	}
}

export default Queue;

import React, { PureComponent } from 'react';
// Axios
import axios from '../../axios';
// ANTD.
import { Layout, Form, Input, Button, Select, Alert, Modal } from 'antd';
// Apollo.
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
// Upload.
import VideoUploader from '../../components/video/VideoUploader';
// Stylesheet.
import './style.css';

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
		}
	}
`;

const CREATE_VIDEO_MUTATION = gql`
	mutation CreateVideoMutation(
		$uuid: String
		$name: String
		$description: String
		$category: String
		$isEncoded: String
		$path: String
	) {
		createVideo(
			uuid: $uuid
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

const UPDATE_VIDEO_MUTATION = gql`
	mutation UpdateVideoMutation(
		$id: String!
		$uuid: String
		$name: String
		$description: String
		$category: String
		$isEncoded: String
		$path: String
	) {
		updateVideo(
			id: $id
			uuid: $uuid
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

// updateVideo
const formItemLayout = {
	labelCol: { span: 2 },
	wrapperCol: { span: 14 }
};

class Video extends PureComponent {
	constructor() {
		super();
		this.state = {};
		this.uploadedFileName = null;
		this.handleDeleteFile = this.handleDeleteFile.bind(this);
	}

	handleSubmit = (e) => {
		e.preventDefault();
		let variables = {};
		const vid = this.props.location.search ? this.props.location.search.replace('?', '').trim() : '';
		const { getFieldValue } = this.props.form;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (vid !== '') {
					variables = {
						id: vid,
						uuid: getFieldValue('uuid'),
						name: getFieldValue('name'),
						description: getFieldValue('description'),
						category: getFieldValue('category'),
						isEncoded: 'Yes',
						path: getFieldValue('path')
					};
				} else {
					variables = {
						uuid: getFieldValue('uuid'),
						name: getFieldValue('name'),
						description: getFieldValue('description'),
						category: getFieldValue('category'),
						isEncoded: 'No',
						path: ''
					};
				}
				this.mutation({
					variables
				});
			}
		});
	};

	handleFileChange = (name, uuid, responseJSON) => {
		this.uploadedFileName = name;
		this.props.form.setFieldsValue({
			uuid
		});
	};

	// 来自上传控件的回调
	handleFileDelete = () => {
		this.props.form.setFieldsValue({
			uuid: ''
		});
	};

	// 删除已经存在的文件
	// todo: 需要添加删除转码后文件的删除接口.
	handleDeleteFile = (refetch) => {
		const { getFieldValue } = this.props.form;
		const vid = this.props.location.search ? this.props.location.search.replace('?', '').trim() : '';
		axios.delete(`/upload/${getFieldValue('uuid')}`).then(() => {
			Modal.success({
				title: '提醒',
				content: '视频删除成功，现在您可以上传新的视频了。',
				onOk: () => {
					this.mutation({
						refetchQueries: () => [
							{
								query: VIDEOS_QUERY,
								variables: this._getQueryVariables()
							}
						],
						variables: {
							id: vid,
							uuid: '',
							name: getFieldValue('name'),
							description: getFieldValue('description'),
							category: getFieldValue('category'),
							isEncoded: 'No',
							path: ''
						}
					});
				}
			});
		});
	};

	_confirm = async (data, isEdit) => {
		const { getFieldValue } = this.props.form;
		const { createVideo } = data;
		if (isEdit) {
			Modal.success({
				title: '好消息',
				content: '编辑视频成功了.',
				onOk: () => {
					this.props.history.push('/video');
				}
			});
		} else {
			Modal.success({
				title: '好消息',
				content: '创建视频成功了.',
				onOk: async () => {
					const job = await axios.post('/queue/create_job', {
						id: createVideo.id,
						file: this.uploadedFileName || getFieldValue('name'),
						uuid: getFieldValue('uuid')
					});
					const { data, jobId, success } = job.data;
					if (success) {
						this.props.history.push('/video');
					}
				}
			});
		}
	};

	_getQueryVariables = () => {
		const skip = 0;
		const first = 20;
		const orderBy = 'createdAt_DESC';
		const filter = JSON.stringify({
			id: this.props.location.search ? this.props.location.search.replace('?', '').trim() : ''
		});
		return { filter, first, skip, orderBy };
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const videoId = this.props.location.search ? this.props.location.search.replace('?', '').trim() : '';
		return (
			<Query query={VIDEOS_QUERY} variables={this._getQueryVariables()}>
				{({ error, data, refetch }) => {
					let videoData =
						data && data.videos && data.videos.length > 0
							? data.videos[0]
							: {
									uuid: '',
									name: '',
									description: '',
									path: '',
									category: { name: '', id: '' }
								};
					if (error) {
						return <Alert showIcon message={`获取视频信息出错了!`} description={`原因:${error}`} type="error" />;
					}
					return videoData ? (
						<Layout className="App container-videoDetails">
							<div span={24} className="videoDetails-wrapper" style={{ backgroundColor: '#fff' }}>
								<Form onSubmit={this.handleSubmit} className="video-form">
									<FormItem {...formItemLayout} label="视频名">
										{getFieldDecorator('name', {
											initialValue: `${videoData.name}`,
											rules: [ { required: true, message: '请输入合法的视频地址!' } ]
										})(<Input placeholder="视频名(不超过50个字)" />)}
									</FormItem>
									<FormItem {...formItemLayout} label="视频描述">
										{getFieldDecorator('description', {
											initialValue: `${videoData.description}`,
											rules: [ { required: true, message: '请输入视频的描述!' } ]
										})(<Input type="textarea" placeholder="视频描述(不超过255个字)" />)}
									</FormItem>
									<Query query={QUERY_CATEGORIES}>
										{({ data }) => {
											let categories =
												data && data.categories && data.categories.length > 0
													? data.categories
													: undefined;
											return (
												<FormItem {...formItemLayout} label="分类">
													{getFieldDecorator('category', {
														initialValue: `${videoData.category.id}`,
														rules: [
															{
																required: true,
																message: '请选择视频的种类!'
															}
														]
													})(
														<Select placeholder="请选择视频的分类">
															{categories &&
																categories.map((category) => (
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
									{videoData.uuid !== '' && videoData.path !== '' ? (
										<div style={{ marginLeft: '8.4444%', width: '58.4%' }}>
											<Alert
												message="请注意"
												description="您已经上传过视频了且改视频已经转码，您将不能在修改视频源文件。"
												type="warning"
												showIcon
											/>
										</div>
									) : (
										''
									)}
									{videoData.uuid !== '' && videoData.path === '' ? (
										<div style={{ marginLeft: '8.4444%', width: '58.4%' }}>
											<Alert
												message="请注意"
												description="您必须先删除你之前的视频文件然后您就可以上传新的文件。"
												type="info"
												showIcon
											/>
											<Button
												type="danger"
												style={{ width: '100%', margin: '10px 0', height: '40px' }}
												onClick={() => this.handleDeleteFile.apply(this, [ refetch ])}
											>
												我要删除已经上传的视频
											</Button>
										</div>
									) : (
										<div className="ant-row ant-form-item">
											<div className="ant-col-2 ant-form-item-label">
												<label htmlFor="name" className="ant-form-item-required" title="上传视频">
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
									)}
									<FormItem {...formItemLayout} label="视频标识">
										{getFieldDecorator('uuid', {
											initialValue: `${videoData.uuid}`,
											rules: [ { required: true, message: '请确认文件上传是否成功.' } ]
										})(<Input disabled type="text" placeholder="文件标识，上传完成后会显示" />)}
									</FormItem>
									{videoId ? (
										<Mutation
											mutation={UPDATE_VIDEO_MUTATION}
											onCompleted={(data) => this._confirm(data, true)}
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
																width: '59%',
																marginLeft: '8%',
																height: '50px'
															}}
														>
															编辑
														</Button>
														<div className="register-footer">
															{loading && <p>正在提交请求...</p>}
															{error && <p>Error :( 服务器开小差了，请稍后再尝试注册!</p>}
														</div>
													</FormItem>
												);
											}}
										</Mutation>
									) : (
										<Mutation
											mutation={CREATE_VIDEO_MUTATION}
											onCompleted={(data) => this._confirm(data, false)}
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
																width: '59%',
																marginLeft: '8%',
																height: '50px'
															}}
														>
															提交
														</Button>
														<div className="register-footer">
															{loading && <p>正在提交请求...</p>}
															{error && <p>Error :( 服务器开小差了，请稍后再尝试注册!</p>}
														</div>
													</FormItem>
												);
											}}
										</Mutation>
									)}
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
import React, { PureComponent } from 'react';
import axios from '../../axios';
// ANTD.
import { Layout, Form, Input, Button, Select, Alert, Modal } from 'antd';
// Apollo.
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
// Upload.
import { VideoUploader, hasExtension } from '../../components/video/VideoUploader';
import uploader from '../../components/video/uploader';
// Video preview.
import VideoPlayer from '../../components/player/VideoPlayer';
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
			mov_uuid
			cover_uuid
			mov_name
			cover_name
			name
			keyword
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
			dynamicRes
			manualRes
			createdAt
		}
	}
`;

const CREATE_VIDEO_MUTATION = gql`
	mutation CreateVideoMutation(
		$mov_uuid: String!
		$cover_uuid: String!
		$mov_name: String!
		$cover_name: String!
		$name: String
		$description: String
		$category: String
		$keyword: String
	) {
		createVideo(
			mov_uuid: $mov_uuid
			cover_uuid: $cover_uuid
			mov_name: $mov_name
			cover_name: $cover_name
			name: $name
			description: $description
			category: $category
			keyword: $keyword
		) {
			id
		}
	}
`;

const UPDATE_VIDEO_MUTATION = gql`
	mutation UpdateVideoMutation($id: String, $name: String, $description: String, $category: String) {
		updateVideo(id: $id, name: $name, description: $description, category: $category) {
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
		this.state = {
			m3u8Addr: ''
		};
		this.uploadedFiles = [];
	}

	componentDidMount() {
		const videoId = this.props.location.search.replace('?', '').trim()
		uploader.methods.reset();
		axios.get(`/video/play/${videoId}`).then((videoInfo) => {
			const { hls } = videoInfo.data.video;
			this.setState({
				m3u8Addr: hls
			});
		});
	}

	componentWillUnmount() {
		uploader.methods.reset();
	}

	handleSubmit = (e) => {
		e.preventDefault();
		let variables = {};
		const vid = this.props.location.search ? this.props.location.search.replace('?', '').trim() : '';
		const { getFieldValue } = this.props.form;
		this.props.form.validateFields((err, values) => {
			const newFiles = {};
			let uploadedFiles = uploader.methods.getUploads();
			uploadedFiles = uploadedFiles.filter((file) => {
				return file.status === 'upload successful';
			});
			uploadedFiles = uploadedFiles.map((file) => {
				if (hasExtension(file.originalName, [ 'jpg', 'png' ])) {
					newFiles['image_name'] = file.originalName;
					newFiles['img_uuid'] = file.uuid;
				} else {
					newFiles['movie_name'] = file.originalName;
					newFiles['movie_uuid'] = file.uuid;
				}
				return newFiles;
			});
			if (!err) {
				if (vid !== '') {
					variables = {
						id: vid,
						name: getFieldValue('name'),
						description: getFieldValue('description'),
						category: getFieldValue('category')
					};
				} else {
					variables = {
						mov_uuid: newFiles['movie_uuid'],
						cover_uuid: newFiles['img_uuid'],
						mov_name: newFiles['movie_name'],
						cover_name: newFiles['image_name'],
						name: getFieldValue('name'),
						description: getFieldValue('description'),
						category: getFieldValue('category'),
						keyword: getFieldValue('keyword')
					};
				}
				this.mutation({ variables });
			}
		});
	};

	handleFileChange = (name, uuid, totalFiles) => {
		this.uploadedFiles = totalFiles;
		this.props.form.setFieldsValue({
			uuid
		});
	};

	// 来自上传控件的回调
	handleFileDelete = (files, xhr) => {
		this.uploadedFiles = files;
		this.props.form.setFieldsValue({
			uuid: ''
		});
	};

	_confirm = async (data, isEdit) => {
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
					this.props.history.push('/video');
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
									keyword: '',
									hd: true,
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
									<FormItem {...formItemLayout} label="视频关键字">
										{getFieldDecorator('keyword', {
											initialValue: `${videoData.keyword}`,
											rules: [ { required: true, message: '请输入匹配的视频关键字, 已逗号分离开!' } ]
										})(<Input placeholder="请输入匹配的视频关键字, 已逗号分离开!" />)}
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
									{videoData.mov_uuid ? (
										<div style={{ marginLeft: '8.4444%', width: '58.4%' }}>
											<Alert
												message="请注意"
												description="暂不支持编辑已经上传的视频，如果需要，可以删除本条视频，新建一部视频，谢谢。"
												type="info"
												showIcon
											/>
											<div style={{ marginTop: '10px' }}>
												<VideoPlayer m38uAddr={this.state.m3u8Addr} />
											</div>
										</div>
									) : (
										<div className="ant-row ant-form-item">
											<div className="ant-col-2 ant-form-item-label">
												<label htmlFor="name" className="ant-form-item-required" title="上传视频">
													视频和封面图
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
											initialValue: videoData.mov_uuid ? `${videoData.mov_uuid}` : '',
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

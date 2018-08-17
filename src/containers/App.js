import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// ANTD.
import { Layout, Tooltip, Button, Row, Col } from 'antd';
// Stylesheet.
import '../assets/stylesheets/App.css';

class App extends PureComponent {
	render() {
		return (
			<Layout className="App container-dashboard" style={{ borderRadius: '5px' }}>
				<Row gutter={24} style={{ margin: '10px 0' }}>
					<Col span={12}>
						<Tooltip title="查看详细的视频资料">
							<Link
								to={{
									pathname: '/video'
								}}
							>
								<Button
									type="danger"
									icon="play-circle"
									style={{ marginRight: '12px', width: '100%', height: '300px', fontSize: '64px' }}
								>
									视频管理
								</Button>
							</Link>
						</Tooltip>
					</Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<Tooltip title="查看和管理队列">
							<Link
								to={{
									pathname: '/queue'
								}}
							>
								<Button
									type="danger"
									icon="bars"
									style={{ marginRight: '12px', width: '100%', height: '300px', fontSize: '64px' }}
								>
									队列管理
								</Button>
							</Link>
						</Tooltip>
					</Col>
				</Row>
				<Row gutter={24} style={{ margin: '10px 0' }}>
					<Col span={12}>
						<Tooltip title="管理用户">
							<Link
								to={{
									pathname: '/video'
								}}
							>
								<Button
									type="danger"
									icon="user"
									style={{ marginRight: '12px', width: '100%', height: '120px', fontSize: '32px' }}
								>
									用户管理
								</Button>
							</Link>
						</Tooltip>
					</Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<Tooltip title="管理前端网站的主题，板式等.">
							<Link
								to={{
									pathname: '/queue'
								}}
							>
								<Button
									type="danger"
									icon="form"
									style={{ marginRight: '12px', width: '100%', height: '120px', fontSize: '32px' }}
								>
									网站管理
								</Button>
							</Link>
						</Tooltip>
					</Col>
				</Row>
			</Layout>
		);
	}
}

export default App;

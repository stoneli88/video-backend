// React
import React from 'react';
import ReactDOM from 'react-dom';
// React Router
import { Switch, Route, Link, Redirect, BrowserRouter } from 'react-router-dom';
// ANTD
import { Layout, Breadcrumb } from 'antd';
// Apollo
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { getMainDefinition } from 'apollo-utilities';
import { split, ApolloLink, concat } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
// Component
import LoginComponent from './containers/auth/login';
import RegisterComponent from './containers/auth/register';
import registerServiceWorker from './registerServiceWorker';
// Routers
import { routers, breadcrumbNameMap } from './config/routers';

// Component from ANTD
const { Content, Header, Footer } = Layout;

// Here you create the httpLink that will connect your ApolloClient instance with the GraphQL API
const httpLink = createHttpLink({
	uri: 'http://localhost:4000'
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
	uri: `ws://localhost:4000`,
	options: {
		reconnect: true,
		connectionParams: {
			authToken: sessionStorage.getItem('AUTH_TOKEN') || null
		}
	}
});

// Authentication
const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext({
    headers: {
      authorization: sessionStorage.getItem('AUTH_TOKEN') || null,
    } 
  });

  return forward(operation);
})

// Instantiate ApolloClient by passing in the httpLink and a new instance of an InMemoryCache.
const link = split(
	// split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: concat(authMiddleware, link),
  cache: new InMemoryCache()
});

// AAA
const PrivateRoute = ({ ...props }) => {
	const { location } = props;
	let Component;
	let AUTH_TOKEN = sessionStorage.getItem('AUTH_TOKEN');
	const pathSnippets = location.pathname.split('/').filter((i) => i);
	const extraBreadcrumbItems = pathSnippets.map((_, index) => {
		const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
		return (
			<Breadcrumb.Item key={url}>
				<Link to={url}>{breadcrumbNameMap[url]}</Link>
			</Breadcrumb.Item>
		);
	});
	const breadcrumbItems = [
		<Breadcrumb.Item key="home">
			<Link to="/">Home</Link>
		</Breadcrumb.Item>
	].concat(extraBreadcrumbItems);
	if (AUTH_TOKEN) {
		routers.forEach((router) => {
			if (router.path === location.pathname) {
				Component = router.component;
			}
		});
	}
	return (
		<Route
			render={() =>
				AUTH_TOKEN ? (
					<div className="App container-root">
						<Layout>
							<Header className="header">
								<Link to="/" className="ml1 no-underline black">
									<div className="logo">后台管理</div>
								</Link>
							</Header>
							<Content style={{ padding: '0 50px' }}>
								<Breadcrumb style={{ margin: '16px 0' }}>{breadcrumbItems}</Breadcrumb>
								<Layout style={{ padding: '24px 0', background: '#fff' }}>
									<Content style={{ padding: '0 24px', minHeight: 280 }}>
										<Component {...props} />
									</Content>
								</Layout>
							</Content>
							<Footer style={{ textAlign: 'center' }}>Video Manager ©2016 Created by Malik</Footer>
						</Layout>
					</div>
				) : (
					<Redirect to="/login" />
				)}
		/>
	);
};

// Render the root component of your React app
ReactDOM.render(
	<BrowserRouter>
		<ApolloProvider client={client}>
			<Switch>
				<Route path="/login" component={LoginComponent} />
				<Route path="/register" component={RegisterComponent} />
				<Route render={(props) => <PrivateRoute {...props} />} />
			</Switch>
		</ApolloProvider>
	</BrowserRouter>,
	document.getElementById('root')
);

registerServiceWorker();

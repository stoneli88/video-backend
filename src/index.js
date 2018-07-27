// React
import React from "react";
import ReactDOM from "react-dom";
// React Router
import { Router, Route, Redirect, BrowserRouter } from "react-router-dom";
// ANTD
import { Layout, Breadcrumb } from "antd";
// Apollo
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
// Component
import { Header } from "./components/header/Header";
import registerServiceWorker from "./registerServiceWorker";
// Routers
import { routers, breadcrumbNameMap } from "./config/routers";

// Component from ANTD
const { Content, Footer } = Layout;

// Here you create the httpLink that will connect your ApolloClient instance with the GraphQL API
const httpLink = createHttpLink({
  uri: "http://localhost:4466"
});

// Instantiate ApolloClient by passing in the httpLink and a new instance of an InMemoryCache.
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

// AAA
const PrivateRoute = ({ ...props }) => {
  const { location } = props;
  let Component;
  let sessionMetadata = sessionStorage.getItem("MC_SESSION_INFO");
  const pathSnippets = location.pathname.split("/").filter(i => i);
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
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
  if (sessionMetadata && JSON.parse(sessionMetadata).token) {
    routers.forEach(router => {
      if ((router.path = location.pathname)) {
        Component = router.component;
      }
    });
  }
  return (
    <Route
      {...props}
      render={props =>
        sessionMetadata.token !== "" ? (
          <div className="App container-root">
            <Layout>
              <Header className="header">
                <Link to="/" className="ml1 no-underline black">
                  <div className="logo">后台管理</div>
                </Link>
              </Header>
              <Content style={{ padding: "0 50px" }}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                  <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                  <Breadcrumb.Item>视频管理</Breadcrumb.Item>
                  <Breadcrumb.Item>上传视频</Breadcrumb.Item>
                </Breadcrumb>
                <Layout style={{ padding: "24px 0", background: "#fff" }}>
                  <Content style={{ padding: "0 24px", minHeight: 280 }}>
                    <Component {...props} />
                  </Content>
                </Layout>
              </Content>
              <Footer style={{ textAlign: "center" }}>
                Video Manager ©2016 Created by Malik
              </Footer>
            </Layout>
          </div>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

// Render the root component of your React app
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <Router history={history}>
        <Route render={() => <PrivateRoute exact {...props} />} />
      </Router>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

registerServiceWorker();

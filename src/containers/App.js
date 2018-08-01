import React, { Component } from "react";
// ANTD.
import { Layout, Icon, Button, Checkbox } from "antd";
// Apollo.
import { Query } from "react-apollo";
import gql from "graphql-tag";
// Stylesheet.
import "../assets/stylesheets/App.css";

const VIDEOS_PER_PAGE = 20;
const VIDEOS_QUERY = gql`
  query VideoQuery($filter: String, $first: Int, $skip: Int, $orderBy: VideoOrderByInput) {
    videos(filter: $filter, first: $first, skip: $skip, orderBy: $orderBy) {
      id,
      name,
      description,
      category {
        id
        name
      }
      owner {
        id
        name
        email
      }
      createdAt
      }
  }
`;

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  _getQueryVariables = () => {
    const page = parseInt(this.props.match.params.page, 10);

    const skip = 0;
    const first = VIDEOS_PER_PAGE;
    const orderBy = "createdAt_DESC";
    return { first, skip, orderBy };
  };

  render() {
    const authToken = localStorage.getItem("AUTH_TOKEN");

    return (
      <Query
        query={VIDEOS_QUERY}
        variables={this._getQueryVariables()}
        pollInterval={5000}
        notifyOnNetworkStatusChange
      >
        {({ loading, error, data, refetch, networkStatus }) => {
          if (networkStatus === 4) return "Refetching!";
          if (loading) return <div>Fetching</div>;
          if (error) return `Error!: ${error}`;
          return <Layout className="App container-dashboard" />;
        }}
      </Query>
    );
  }
}

export default App;

import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

import { Login, Signup, UserLookup, Transactions } from './pages'

import Cookies from 'js-cookie'
import qs from 'qs'
import has from 'lodash/has'
import axios from 'axios'

const PrivateOnlyRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      const session = Cookies.get('session-id')
      if (session) {
        if(props.location.pathname=='/'){
          return <Redirect
          to={{
            pathname: '/user-lookup',
            state: { from: props.location}
          }}
        />
        }
        return <Component {...props} />
      } else {
        return (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
      }
    }}
  />
)

const PublicOnlyRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      const {
        match: { url }
      } = props
     
      return <Component {...props} />
   
    }}
  />
)


class App extends Component {
  render() {
    return (
      <Router>
        <React.Fragment>
          <PublicOnlyRoute exact path="/login" component={Login} />
          <PublicOnlyRoute exact path="/signup" component={Signup} />
          <PrivateOnlyRoute exact path="/" component={UserLookup} />
          <PrivateOnlyRoute exact path="/user-lookup" component={UserLookup} />
          <PrivateOnlyRoute exact path="/transactions" component={Transactions} />
        </React.Fragment>
      </Router>
    );
  }
}

export default App;


import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import { Login, Signup, UserLookup,Transactions } from './pages'

class App extends Component {
  render() {
    return (
      <Router>
        <React.Fragment>
          <Route exact path="/" component={Login} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/user-lookup" component={UserLookup} />
          <Route exact path="/transactions" component={Transactions} />
        </React.Fragment>
      </Router>
    );
  }
}

export default App;


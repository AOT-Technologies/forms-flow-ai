import { Route, Switch, Redirect } from 'react-router-dom'
import React from 'react'
import List from './List';
import Create from './Create';
import Item from './Item/index'

const user = localStorage.getItem('UserRoles');

const CreateFormRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    user.includes('staff_designer')
      ? <Component {...props} />
      : <Redirect exact to='/' />
  )} />
)

const Form = (props) => (
  <div className="container" id="main">
    <Switch>
      <Route exact path="/" component={List} />
      <CreateFormRoute exact path="/create" component={Create}/>
      {/* <Route exact path="/form/create" component={Create} /> */}
      <Route path="/:formId" component={Item} />
    </Switch>
  </div>
)

export default Form



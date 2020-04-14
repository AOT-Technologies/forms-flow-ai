import { Route, Switch, Redirect } from 'react-router-dom'
import React, { Component } from 'react'
import List from './List';
import Create from './Create';
import Item from './Item/index';
import { STAFF_DESIGNER } from '../../constants/constants';

let user = '';

const CreateFormRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    user.includes(STAFF_DESIGNER)
      ? <Component {...props} />
      : <Redirect exact to='/' />
  )} />
)

class Form extends Component{
  componentDidMount(){
    user = localStorage.getItem('UserRoles');
  }

  render(){
    return(
      <div className="container" id="main">
     <Switch>
       <Route exact path="/form" component={List} />
       <CreateFormRoute exact path="/form/create" component={Create}/>
       <Route path="/form/:formId" component={Item} />
     </Switch>
   </div>
    )
  }
}

export default Form



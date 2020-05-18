import { Route, Switch, Redirect } from 'react-router-dom'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { selectRoot } from 'react-formio'

import List from './List';
import Create from './Create';
import Item from './Item/index';
import { STAFF_DESIGNER } from '../../constants/constants';
import UserService from '../../services/UserService';
import Loading from '../../containers/Loading';
import { setUserAuth } from '../../actions/bpmActions'

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
    UserService.initKeycloak(this.props.store,(err,res)=>{
      this.props.setUserAuth(res.authenticated)
    })
  }

  render(){
    user = this.props.user;
    if(!this.props.isAuthenticated){
      return (
        <Loading/>
        );
      }
    return (
      <div className="container" id="main">
       <Switch>
        <Route exact path="/form" component={List} />
        <CreateFormRoute exact path="/form/create" component={Create} />
        <Route path="/form/:formId" component={Item} />
       </Switch>
      </div>
  )
}
}

const mapStatetoProps = (state) => {
  return {
    user: selectRoot('user', state).roles || [],
    isAuthenticated:state.user.isAuthenticated
  }
}

const mapStateToDispatch = (dispatch) =>{
  return{
    setUserAuth:(value)=>{
      dispatch(setUserAuth(value))
    }
  }
}

export default connect(mapStatetoProps,mapStateToDispatch)(Form);

import React, { Component } from 'react';

import UserService from '../services/UserService'
import { Route, Redirect } from 'react-router-dom';
import Form from './Form';
import Task from './Task';
import { setUserAuth } from '../actions/bpmActions';
import { connect } from 'react-redux';

class PrivateRoute extends Component{
    componentDidMount(){
        UserService.initKeycloak(this.props.store,(err,res)=>{
          this.props.setUserAuth(res.authenticated)
        })
      }

    render(){
        return(
            <div className="container">
                <Route path="/form" component={Form}/>
                <Route path="/task" component={Task}/>
                <Route exact path="/"><Redirect to="/form"/></Route>
            </div>
        )
    }
}

const mapStateToDispatch = (dispatch) =>{
    return{
      setUserAuth:(value)=>{
        dispatch(setUserAuth(value))
      }
    }
  }

export default connect(null,mapStateToDispatch)(PrivateRoute);
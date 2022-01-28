import React, {useEffect} from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { getForm } from 'react-formio'

import UserService from '../services/UserService'
import View from '../components/Form/Item/View'
import NavBar from "../containers/NavBar";
 
const PublicRoute =({store})=>{

    useEffect(()=>{
        console.log('this is working')
        UserService.authenticateAnonymousUser(store)
    },[store])
    return (
          <div className="container">
              <NavBar/>
              <Route exact path="/public/form/:formId" component={View}/>
          </div>
       )
}

 
const mapDispatchToProps = (dispatch,ownProps) => {
    return {
        getForm: (id) => dispatch(getForm('form', id))
    };
};

export default connect(null, mapDispatchToProps)(PublicRoute);

import {Route, Switch, Redirect, useParams} from 'react-router-dom'
import React, {useEffect} from 'react'
import {getForm} from 'react-formio'
import {useDispatch, useSelector} from 'react-redux'

import {STAFF_REVIEWER, CLIENT, STAFF_DESIGNER} from '../../../constants/constants'
import View from './View'
import Edit from './Edit'
import Submission from './Submission/index'
import Preview from './Preview'

const Item = React.memo(()=>{
  const {formId} = useParams();
  const userRoles= useSelector((state) => state.user.roles || []);
  const dispatch= useDispatch();

  useEffect(()=>{
    //TODO add loader
    dispatch(getForm('form', formId));
  },[formId, dispatch]);

  /**
   * Protected route to form submissions
   */
  const SubmissionRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      userRoles.includes(STAFF_REVIEWER) || userRoles.includes(CLIENT)
        ? <Component {...props} />
        : <Redirect exact to='/' />
    )} />
  );
  /**
   * Protected route for form deletion
   */
  const FormActionRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      userRoles.includes(STAFF_DESIGNER)
        ? <Component {...props} />
        : <Redirect exact to='/' />
    )} />
  );

  return (
      <div>
        <Switch>
          <Route exact path="/form/:formId" component={View} />
          <FormActionRoute path="/form/:formId/preview" component={Preview}/>
          <FormActionRoute path="/form/:formId/edit" component={Edit}/>
          <SubmissionRoute path="/form/:formId/submission" component={Submission}/>
        </Switch>
      </div>
    )
});

export default Item;

import {Redirect, Route, Switch} from 'react-router-dom'
import React from 'react'
import {useSelector} from "react-redux";

import List from './List'
import Item from './Item/index'
import {STAFF_REVIEWER} from "../../../../constants/constants";


const Form = React.memo(() => {
  const userRoles= useSelector((state) => state.user.roles || []);
  const showViewSubmissions= useSelector((state) => state.user.showViewSubmissions);

  const ViewSubmissionRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      userRoles.includes(STAFF_REVIEWER)
        ? <Component {...props} />
        : <Redirect exact to='/' />
    )} />
  );
   return (<div>
      <Switch>
        {showViewSubmissions?<ViewSubmissionRoute exact path="/form/:formId/submission" component={List} />:null}
        <Route path="/form/:formId/submission/:submissionId" component={Item} />
      </Switch>
    </div>)
});

export default Form;

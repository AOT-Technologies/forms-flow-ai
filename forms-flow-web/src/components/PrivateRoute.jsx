import React, {useEffect} from "react";
import { Route, Switch, Redirect} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import UserService from "../services/UserService";
import Form from "./Form";
// import Task from "./Task";
import ServiceFlow from "./ServiceFlow"
import { setUserAuth } from "../actions/bpmActions";
import {CLIENT, STAFF_REVIEWER} from "../constants/constants";
import Loading from "../containers/Loading";
import DashboardPage from "./Dashboard";
import InsightsPage from "./Insights";
import Application from "./Application";
import 'semantic-ui-css/semantic.min.css';
import NotFound from "./NotFound";

const PrivateRoute = React.memo((props) => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.user.isAuthenticated);
  const userRoles= useSelector((state) => state.user.roles || []);
  useEffect(()=>{
    if(props.store){
      UserService.initKeycloak(props.store, (err, res) => {
        dispatch(setUserAuth(res.authenticated));
      });
    }
  },[props.store, dispatch]);
  const ReviewerRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        userRoles.includes(STAFF_REVIEWER) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to="/" />
        )
      }
    />
  );
  const ClientReviewerRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        userRoles.includes(STAFF_REVIEWER) || userRoles.includes(CLIENT) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to="/" />
        )
      }
    />
  );
  return (
      <>
        {isAuth ? (
          <>
          <Switch>
            <Route path="/form" component={Form} />
            <Route path="/formflow" component={Form} />
            <ClientReviewerRoute path="/application" component={Application} />
            <ReviewerRoute path="/metrics" component={DashboardPage} />
            <ReviewerRoute path="/task" component={ServiceFlow} />
            <ReviewerRoute path="/insights" component={InsightsPage} />
            <Route exact path="/">
              <Redirect to={userRoles.includes(STAFF_REVIEWER)?'/task':'/form'} />
            </Route>   
            <Route path='/404' exact={true} component={NotFound} /> 
            <Redirect from='*' to='/404' />
           </Switch>           
          </>         
        ) : (
          <Loading />
        )}
      </>
    );
})

export default PrivateRoute;

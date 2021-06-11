import React, {useEffect}from "react";
import { Route, Redirect } from "react-router-dom";
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

const PrivateRoute = React.memo((props) => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.user.isAuthenticated);
  const userRoles=useSelector((state) => state.user.roles || []);

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

  useEffect(()=>{
    if(props.store){
      UserService.initKeycloak(props.store, (err, res) => {
        dispatch(setUserAuth(res.authenticated));
      });
    }
  },[props.store, dispatch]);

  return (
      <>
        {isAuth ? (
          <>
            <Route path="/form" component={Form} />
            <Route path="/formflow" component={Form} />
            <ClientReviewerRoute path="/application" component={Application} />
            <ReviewerRoute path="/metrics" component={DashboardPage} />
            <ReviewerRoute path="/task" component={ServiceFlow} />
           {/* <ReviewerRoute path="/service-flow-task" component={ServiceFlow} />*/}
            <Route exact path="/">
              <Redirect to={userRoles.includes(STAFF_REVIEWER)?'/task':'/form'} />
            </Route>
            <ReviewerRoute path="/insights" component={InsightsPage} />
          </>
        ) : (
          <Loading />
        )}
      </>
    );
})

export default PrivateRoute;

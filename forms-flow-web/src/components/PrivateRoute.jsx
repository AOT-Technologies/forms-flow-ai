import React, {useEffect, Suspense, lazy} from "react";
import {Route, Switch, Redirect, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { BASE_ROUTE, MULTITENANCY_ENABLED } from "../constants/constants";
import UserService from "../services/UserService";
import {setUserAuth} from "../actions/bpmActions";
import {CLIENT, Keycloak_Client, STAFF_REVIEWER} from "../constants/constants";

import Loading from "../containers/Loading";
import NotFound from "./NotFound";
import { setTenantFromId } from "../apiManager/services/tenantServices";


const Form = lazy(() => import('./Form'));
const ServiceFlow = lazy(() => import('./ServiceFlow'));
const DashboardPage = lazy(() => import("./Dashboard"));
const InsightsPage = lazy(() => import("./Insights"));
const Application = lazy(() => import("./Application"));
const Admin = lazy(() => import("./Admin"))

const PrivateRoute = React.memo((props) => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.user.isAuthenticated);
  const userRoles = useSelector((state) => state.user.roles || []);
  // const tenant = useSelector((state) => state.tenants.tenantDetail);
  // const tenantKey = useSelector((state) => state.tenants.tenantId);
  const {tenantId} = useParams()
  const redirecUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantId}/` : `/`
  // useEffect(() => {
  //   if (props.store) {
  //     UserService.initKeycloak(props.store, (err, res) => {
  //       dispatch(setUserAuth(res.authenticated));
  //     });
  //   }
  // }, [props.store, dispatch]);

  useEffect(()=>{    
    if(tenantId){
          sessionStorage.setItem("tenantKey", tenantId)
          dispatch(setTenantFromId(tenantId))
    }else{
      if (props.store) {
            UserService.initKeycloak(props.store, Keycloak_Client, (err, res) => {
              dispatch(setUserAuth(res.authenticated));
          });
      }
    }
  },[props.store,tenantId, dispatch])


  useEffect(()=>{
    if(tenantId){
      let clientId = `${tenantId+"-"+Keycloak_Client}`
      if(UserService.KeycloakData){
        UserService.initKeycloak(props.store, clientId, (err, res) => {
          dispatch(setUserAuth(res.authenticated));
        });
      }else{
        UserService.setKeycloakJson(tenantId,()=>{
          UserService.initKeycloak(props.store, clientId, (err, res) => {
            dispatch(setUserAuth(res.authenticated));
          });
        })
      }
    }
  },[dispatch, tenantId, props.store]);

  const ReviewerRoute = ({component: Component, ...rest}) => (
    <Route
      {...rest}
      render={(props) =>
        userRoles.includes(STAFF_REVIEWER) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to="/"/>
        )
      }
    />
  );

  const ClientReviewerRoute = ({component: Component, ...rest}) => (
    <Route
      {...rest}
      render={(props) =>
        userRoles.includes(STAFF_REVIEWER) || userRoles.includes(CLIENT) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to="/"/>
        )
      }
    />
  );

  return (
    <>
      {isAuth ? (
        <Suspense fallback={<Loading/>}>
          <Switch>
            <Route path={`${BASE_ROUTE}form`} component={Form}/>
            <Route path={`${BASE_ROUTE}admin`} component={Admin}/>
            <Route path={`${BASE_ROUTE}formflow`} component={Form}/>
            <ClientReviewerRoute path={`${BASE_ROUTE}application`} component={Application}/>
            <ReviewerRoute path={`${BASE_ROUTE}metrics`} component={DashboardPage}/>
            <ReviewerRoute path={`${BASE_ROUTE}task`} component={ServiceFlow}/>
            <ReviewerRoute path={`${BASE_ROUTE}insights`} component={InsightsPage}/>
            <Route exact path={BASE_ROUTE}>
              <Redirect to={userRoles.includes(STAFF_REVIEWER) ? `${redirecUrl}task` : `${redirecUrl}form`}/>
            </Route>
            <Route path='/404' exact={true} component={NotFound}/>
            <Redirect from='*' to='/404'/>
          </Switch>
        </Suspense>
      ) : (
        <Loading/>
      )}
    </>
  );
})

export default PrivateRoute;

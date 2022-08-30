import React, { useEffect, Suspense, lazy, useMemo } from "react";
import { Route, Switch, Redirect, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BASE_ROUTE,
  DRAFT_ENABLED,
  MULTITENANCY_ENABLED,
} from "../constants/constants";
import UserService from "../services/UserService";
import { setUserAuth } from "../actions/bpmActions";
import { CLIENT, STAFF_REVIEWER, STAFF_DESIGNER } from "../constants/constants";

import Loading from "../containers/Loading";
import NotFound from "./NotFound";
import { setTenantFromId } from "../apiManager/services/tenantServices";

const Form = lazy(() => import("./Form"));
const ServiceFlow = lazy(() => import("./ServiceFlow"));
const DashboardPage = lazy(() => import("./Dashboard"));
const InsightsPage = lazy(() => import("./Insights"));
const Application = lazy(() => import("./Application"));
const Admin = lazy(() => import("./Admin"));
const Modeller = lazy(() => import("./Modeller")); //BPMN Modeller
const Drafts = lazy(() => import("./Draft"));

const PrivateRoute = React.memo((props) => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.user.isAuthenticated);
  const userRoles = useSelector((state) => state.user.roles || []);
  const { tenantId } = useParams();
  const redirecUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantId}/` : `/`;
  useEffect(() => {
    if (tenantId && props.store) {
      let currentTenant = sessionStorage.getItem("tenantKey");
      if(currentTenant && currentTenant !== tenantId){
        sessionStorage.clear();
        localStorage.clear();
      }
      sessionStorage.setItem("tenantKey", tenantId);
      dispatch(setTenantFromId(tenantId));
      UserService.setKeycloakJson(tenantId, (clientId) => {
        UserService.initKeycloak(props.store, clientId, (err, res) => {
          dispatch(setUserAuth(res.authenticated));
        });
      });
    } else {
      if (props.store) {
        UserService.setKeycloakJson(null, (clientId) => {
          UserService.initKeycloak(props.store, clientId, (err, res) => {
            dispatch(setUserAuth(res.authenticated));
          });
        });
      }
    }
  }, [props.store, tenantId, dispatch]);

  // useMemo prevents unneccessary rerendering caused by the route update.

  const DesignerRoute = useMemo(
    () =>
      ({ component: Component, ...rest }) =>
        (
          <Route
            {...rest}
            render={(props) =>
              userRoles.includes(STAFF_DESIGNER) ? (
                <Component {...props} />
              ) : (
                <Redirect exact to="/404" />
              )
            }
          />
        ),
    [userRoles]
  );

  const ReviewerRoute = useMemo(
    () =>
      ({ component: Component, ...rest }) =>
        (
          <Route
            {...rest}
            render={(props) =>
              userRoles.includes(STAFF_REVIEWER) ? (
                <Component {...props} />
              ) : (
                <Redirect exact to="/404" />
              )
            }
          />
        ),
    [userRoles]
  );

  const ClientReviewerRoute = useMemo(
    () =>
      ({ component: Component, ...rest }) =>
        (
          <Route
            {...rest}
            render={(props) =>
              userRoles.includes(STAFF_REVIEWER) ||
              userRoles.includes(CLIENT) ? (
                <Component {...props} />
              ) : (
                <Redirect exact to="/404" />
              )
            }
          />
        ),
    [userRoles]
  );

  const DraftRoute = useMemo(
    () =>
      ({ component: Component, ...rest }) =>
        (
          <Route
            {...rest}
            render={(props) =>
              DRAFT_ENABLED &&
              (userRoles.includes(STAFF_REVIEWER) ||
                userRoles.includes(CLIENT)) ? (
                <Component {...props} />
              ) : (
                <Redirect exact to="/404" />
              )
            }
          />
        ),
    [userRoles]
  );

  return (
    <>
      {isAuth ? (
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route path={`${BASE_ROUTE}form`} component={Form} />
            <DraftRoute path={`${BASE_ROUTE}draft`} component={Drafts} />
            <DesignerRoute path={`${BASE_ROUTE}admin`} component={Admin} />
            <DesignerRoute path={`${BASE_ROUTE}formflow`} component={Form} />
            <DesignerRoute
              path={`${BASE_ROUTE}processes`}
              component={Modeller}
            />
            <ClientReviewerRoute
              path={`${BASE_ROUTE}application`}
              component={Application}
            />
            <ReviewerRoute
              path={`${BASE_ROUTE}metrics`}
              component={DashboardPage}
            />
            <ReviewerRoute path={`${BASE_ROUTE}task`} component={ServiceFlow} />
            <ReviewerRoute
              path={`${BASE_ROUTE}insights`}
              component={InsightsPage}
            />
            <Route exact path={BASE_ROUTE}>
              <Redirect
                to={
                  userRoles.includes(STAFF_REVIEWER)
                    ? `${redirecUrl}task`
                    : `${redirecUrl}form`
                }
              />
            </Route>
            <Route path="/404" exact={true} component={NotFound} />
            <Redirect from="*" to="/404" />
          </Switch>
        </Suspense>
      ) : (
        <Loading />
      )}
    </>
  );
});

export default PrivateRoute;

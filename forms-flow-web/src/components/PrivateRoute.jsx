/* eslint-disable no-unused-vars */
import React, { useEffect, Suspense, lazy, useMemo, useCallback } from "react";
import { Route, Switch, Redirect, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BASE_ROUTE,
  DRAFT_ENABLED,
  MULTITENANCY_ENABLED,
  KEYCLOAK_AUTH_URL,
  Keycloak_Client,
  KEYCLOAK_REALM,
} from "../constants/constants";
import { KeycloakService, StorageService } from "@formsflow/service";
import {
  setUserAuth,
  setUserRole,
  setUserToken,
  setUserDetails,
} from "../actions/bpmActions";
import { setLanguage } from "../actions/languageSetAction";
import {
  ENABLE_APPLICATIONS_MODULE,
  ENABLE_DASHBOARDS_MODULE,
  ENABLE_FORMS_MODULE,
  ENABLE_PROCESSES_MODULE,
  ENABLE_TASKS_MODULE,
} from "../constants/constants";

import Loading from "../containers/Loading";
import NotFound from "./NotFound";
import {
  setTenantFromId,
  validateTenant,
} from "../apiManager/services/tenantServices";

// Lazy imports is having issues with micro-front-end build

import Form from "./Form";
import ServiceFlow from "./ServiceFlow";
import DashboardPage from "./Dashboard";
import InsightsPage from "./Insights";
import Application from "./Application";
import Modeler from "./Modeler";
import Drafts from "./Draft";
import {
  BPM_API_URL_WITH_VERSION,
  WEB_BASE_URL,
  WEB_BASE_CUSTOM_URL,
  CUSTOM_SUBMISSION_URL,
} from "../apiManager/endpoints/config";
import { AppConfig } from "../config";
import { getFormioRoleIds } from "../apiManager/services/userservices";
import AccessDenied from "./AccessDenied";
import { LANGUAGE } from "../constants/constants";
import  useUserRoles  from "../constants/permissions";

export const kcServiceInstance = (tenantId = null) => {
  return KeycloakService.getInstance(
    KEYCLOAK_AUTH_URL,
    KEYCLOAK_REALM,
    tenantId ? `${tenantId}-${Keycloak_Client}` : Keycloak_Client
  );
};

const setApiBaseUrlToLocalStorage = () => {
  localStorage.setItem("bpmApiUrl", BPM_API_URL_WITH_VERSION);
  localStorage.setItem("formioApiUrl", AppConfig.projectUrl);
  localStorage.setItem("formsflow.ai.url", window.location.origin);
  localStorage.setItem("formsflow.ai.api.url", WEB_BASE_URL);
  localStorage.setItem("customApiUrl", WEB_BASE_CUSTOM_URL);
  localStorage.setItem("customSubmissionUrl", CUSTOM_SUBMISSION_URL);
};

const PrivateRoute = React.memo((props) => {
  const { publish, subscribe, getKcInstance } = props;
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.user.isAuthenticated);
  const userRoles = useSelector((state) => state.user.roles || []);
  const { tenantId } = useParams();
  const redirecUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantId}/` : `/`;
  const selectedLanguage = useSelector((state) => state.user.lang);
  const tenant = useSelector((state) => state.tenants);
  const [authError, setAuthError] = React.useState(false);
  const [kcInstance, setKcInstance] = React.useState(getKcInstance());
  const [tenantValid, setTenantValid] = React.useState(true); // State to track tenant validity

  const {
          admin, 
          createDesigns ,
          createSubmissions ,
          viewDesigns ,
          viewSubmissions ,
          viewTasks,
          manageTasks,
          viewDashboards 
        } = useUserRoles();
  
       const BASE_ROUTE_PATH = (viewTasks || manageTasks)
        ? `${redirecUrl}task`
        : ( createSubmissions || createDesigns || viewDesigns)
        ? `${redirecUrl}form`
        : admin  
        ? `${redirecUrl}admin` 
        : viewSubmissions 
        ? `${redirecUrl}application` 
        : viewDashboards 
        ? `${redirecUrl}metrics` 
        : "/404";
       

  const authenticate = (instance, store) => {
    setKcInstance(instance);
    store.dispatch(
      setUserRole(JSON.parse(StorageService.get(StorageService.User.USER_ROLE)))
    );
    dispatch(setUserAuth(instance.isAuthenticated()));
    store.dispatch(setUserToken(instance.getToken()));
    // Set Cammunda/Formio Base URL
    setApiBaseUrlToLocalStorage();
    // Get formio roles
    store.dispatch(
      getFormioRoleIds((err) => {
        if (err) {
          console.error(err);
        } else {
          store.dispatch(
            setUserDetails(
              JSON.parse(StorageService.get(StorageService.User.USER_DETAILS))
            )
          );
        }
      })
    );
  };

  const keycloakInitialize = useCallback(() => {
    let instance = tenantId ? kcServiceInstance(tenantId) : kcServiceInstance();
    if (props.store) {
      if (kcInstance) {
        authenticate(kcInstance, props.store);
      } else {
        instance.initKeycloak((authenticated) => {
          if (!authenticated) {
            setAuthError(true);
          } else {
            authenticate(instance, props.store);
            publish("FF_AUTH", instance);
          }
        });
      }
    }
  }, [props.store, kcInstance, tenantId]);

  useEffect(() => {
    if (tenantId && MULTITENANCY_ENABLED) {
      validateTenant(tenantId)
        .then((res) => {
          if (!res.data.tenantKeyExist) {
            setTenantValid(false);
          } else {
            setTenantValid(true);

            if (tenantId && props.store) {
              let currentTenant = sessionStorage.getItem("tenantKey");
              if (currentTenant && currentTenant !== tenantId) {
                sessionStorage.clear();
                localStorage.clear();
              }
              sessionStorage.setItem("tenantKey", tenantId);
              dispatch(setTenantFromId(tenantId));
              keycloakInitialize();
            }
          }
        })
        .catch((err) => {
          console.error("Error validating tenant", err);
          setTenantValid(false);
        });
    } else {
      keycloakInitialize();
    }
  }, [tenantId, props.store, dispatch]);

  useEffect(() => {
    if (kcInstance) {
      const lang =
        kcInstance?.userData?.locale ||
        tenant?.tenantData?.details?.locale ||
        selectedLanguage ||
        LANGUAGE;
      dispatch(setLanguage(lang));
    }
  }, [kcInstance, tenant?.tenantData]);

  const DesignerRoute = useMemo(
    () =>
      ({ component: Component, ...rest }) =>
        (
          <Route
            {...rest}
            render={(props) =>
              createDesigns || viewDesigns ? (
                <Component {...props} />
              ) : (
                <AccessDenied userRoles={userRoles} />
              )
            }
          />
        ),
    [userRoles]
  );

  const DashBoardRoute = useMemo(
    () =>
      ({ component: Component, ...rest }) =>
        (
          <Route
            {...rest}
            render={(props) =>
              viewDashboards ? (
                <Component {...props} />
              ) : (
                <AccessDenied userRoles={userRoles} />
              )
            }
          />
        ),
    [userRoles]
  );
  const FormRoute = useMemo(
    () =>
      ({ component: Component, ...rest }) =>
      (
        <Route
          {...rest}
          render={(props) =>
            createDesigns || viewDesigns || createSubmissions || viewSubmissions  ? (
              <Component {...props} />
            ) : (
              <AccessDenied userRoles={userRoles} />
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
              viewTasks || manageTasks || viewDashboards ? (
                <Component {...props} />
              ) : (
                <AccessDenied userRoles={userRoles} />
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
              viewSubmissions ? (
                <Component {...props} />
              ) : (
                <AccessDenied userRoles={userRoles} />
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
              DRAFT_ENABLED && viewSubmissions ? (
                <Component {...props} />
              ) : (
                <AccessDenied userRoles={userRoles} />
              )
            }
          />
        ),
    [userRoles]
  );

  if (!tenantValid) {
    return <NotFound />;
  }

  return (
    <>
      {authError ? (
        <AccessDenied userRoles={userRoles} />
      ) : isAuth ? (
        <Suspense fallback={<Loading />}>
          <Switch>
            {ENABLE_FORMS_MODULE && (
              <FormRoute path={`${BASE_ROUTE}form`} component={Form} />
            )}
            {ENABLE_FORMS_MODULE && (
              <DesignerRoute path={`${BASE_ROUTE}formflow`} component={Form} />
            )}
            {ENABLE_APPLICATIONS_MODULE && (
              <DraftRoute path={`${BASE_ROUTE}draft`} component={Drafts} />
            )}
            {ENABLE_APPLICATIONS_MODULE && (
              <ClientReviewerRoute
                path={`${BASE_ROUTE}application`}
                component={Application}
              />
            )}
            {ENABLE_PROCESSES_MODULE && (
              <DesignerRoute
                path={`${BASE_ROUTE}processes`}
                component={Modeler}
              />
            )}
            {ENABLE_DASHBOARDS_MODULE && (
              <DashBoardRoute
                path={`${BASE_ROUTE}metrics`}
                component={DashboardPage}
              />
            )}
            {ENABLE_DASHBOARDS_MODULE && (
              <DashBoardRoute
                path={`${BASE_ROUTE}insights`}
                component={InsightsPage}
              />
            )}
            {ENABLE_TASKS_MODULE && (
              <ReviewerRoute
                path={`${BASE_ROUTE}task`}
                component={ServiceFlow}
              />
            )}
            <Route exact path={`${redirecUrl}admin`} /> 
            <Route exact path={BASE_ROUTE}>
            {userRoles.length && (
               <Redirect
                 to={BASE_ROUTE_PATH}
                />
               )}
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

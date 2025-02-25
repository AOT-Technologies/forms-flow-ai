/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  Suspense,
  useMemo,
  useCallback
} from "react";
import { Route, Switch, Redirect, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BASE_ROUTE,
  getRoute,
  DRAFT_ENABLED,
  MULTITENANCY_ENABLED,
  KEYCLOAK_AUTH_URL,
  Keycloak_Client,
  KEYCLOAK_REALM,
  ENABLE_APPLICATIONS_MODULE,
  ENABLE_DASHBOARDS_MODULE,
  ENABLE_FORMS_MODULE,
  ENABLE_PROCESSES_MODULE,
  LANGUAGE
} from "../constants/constants";
import { KeycloakService, StorageService } from "@formsflow/service";
import {
  setUserAuth,
  setUserRole,
  setUserToken,
  setUserDetails,
} from "../actions/bpmActions";
import { setLanguage } from "../actions/languageSetAction";

import Loading from "../containers/Loading";
import NotFound from "./NotFound";
import {
  setTenantFromId,
  validateTenant,
} from "../apiManager/services/tenantServices";

// Lazy imports is having issues with micro-front-end build

import SubmitFormRoutes from "./../routes/Submit/Forms";
import DesignFormRoutes from "./../routes/Design/Forms";
// import ServiceFlow from "./ServiceFlow";
import DashboardPage from "./Dashboard";
import InsightsPage from "./Insights";
import Application from "./Application";
import DesignProcessRoutes from "./../routes/Design/Process";
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
import useUserRoles from "../constants/permissions";
import { getUserRoles } from "../apiManager/services/authorizationService"; // Assuming you have a service to get roles
import PropTypes from "prop-types";
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
  const selectedLanguage = useSelector((state) => state.user.lang);
  const tenant = useSelector((state) => state.tenants);
  const [authError, setAuthError] = React.useState(false);
  const [kcInstance, setKcInstance] = React.useState(getKcInstance());
  const [tenantValid, setTenantValid] = React.useState(true); // State to track tenant validity
  const ROUTE_TO = getRoute(tenantId);
  const {
    admin,
    createDesigns,
    createSubmissions,
    viewDesigns,
    viewSubmissions,
    viewDashboards,
  } = useUserRoles();

  const BASE_ROUTE_PATH = (() => { 
    if (createSubmissions) return ROUTE_TO.FORM;
    if (createDesigns || viewDesigns) return ROUTE_TO.FORMFLOW;
    if (admin) return ROUTE_TO.ADMIN;
    if (viewSubmissions) return ROUTE_TO.APPLICATION;
    if (viewDashboards) return ROUTE_TO.METRICS;
    return ROUTE_TO.NOTFOUND;
  })();


  const authenticate = (instance, store) => {
    setKcInstance(instance);
    store.dispatch(
      setUserRole(JSON.parse(StorageService.get(StorageService.User.USER_ROLE)))
    );
    dispatch(setUserAuth(instance.isAuthenticated()));
    store.dispatch(setUserToken(instance.getToken()));
    // Set Cammunda/Formio Base URL
    setApiBaseUrlToLocalStorage();
  
    // Fetch user roles and update the local storage
    getUserRoles()
      .then((res) => {
        if (res) {
          const { data = [] } = res;
          const roles = data.map((role) => role.name);
          localStorage.setItem("allAvailableRoles", JSON.stringify(roles));
        }
      })
      .catch((error) => console.error("Error fetching roles", error));
  
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
            publish("FF_AUTH", instance);
            authenticate(instance, props.store);
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

  const ClientRoute = useMemo(
    () =>
      ({ component: Component, ...rest }) =>
      (
        <Route
          {...rest}
          render={(props) =>
            createSubmissions || viewSubmissions  ? (
              <Component {...props} />
            ) : (
              <AccessDenied userRoles={userRoles} />
            )
          }
        />
      ),
    [userRoles]
  );

  ClientRoute.propTypes = {
    component: PropTypes.elementType.isRequired,
  };

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
              <ClientRoute path={ROUTE_TO.FORM} component={SubmitFormRoutes} />
            )}
            {ENABLE_FORMS_MODULE && (
              <DesignerRoute path={ROUTE_TO.FORMFLOW} component={DesignFormRoutes} />
            )}
            {ENABLE_APPLICATIONS_MODULE && (
              <DraftRoute path={ROUTE_TO.DRAFT} component={Drafts} />
            )}
            {ENABLE_APPLICATIONS_MODULE && (
              <ClientReviewerRoute
                path={ROUTE_TO.APPLICATION}
                component={Application}
              />
            )}
            {ENABLE_PROCESSES_MODULE && (
              <DesignerRoute
                path={ROUTE_TO.SUBFLOW}
                component={DesignProcessRoutes}
              />
            )}
            {ENABLE_PROCESSES_MODULE && (
              <DesignerRoute
                path={ROUTE_TO.DECISIONTABLE}
                component={DesignProcessRoutes}
              />
            )}
            {ENABLE_DASHBOARDS_MODULE && (
              <DashBoardRoute
                path={ROUTE_TO.METRICS}
                component={DashboardPage}
              />
            )}
            {ENABLE_DASHBOARDS_MODULE && (
              <DashBoardRoute
                path={ROUTE_TO.INSIGHTS}
                component={InsightsPage}
              />
            )}
            <Route exact path={ROUTE_TO.ADMIN} /> 
            <Route exact path={BASE_ROUTE}>
              {userRoles.length && <Redirect to={BASE_ROUTE_PATH} />}
            </Route>
            <Route path={ROUTE_TO.NOTFOUND} exact={true} component={NotFound} />
            <Redirect from="*" to={ROUTE_TO.NOTFOUND} />
          </Switch>
        </Suspense>
      ) : (
        <Loading />
      )}
    </>
  );
});

export default PrivateRoute;

import React from "react";
import { Route, Switch } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import List from "./List";
import EditForm from "./FormEditIndex";
import { BASE_ROUTE } from "../../../constants/constants";
import Loading from "../../../containers/Loading";
import AccessDenied from "../../../components/AccessDenied";
import FormPreview from "./FormPreview";

const GenericRoute = ({ component: Component, roles, ...rest }) => {
  const userRoles = useSelector((state) => state.user.roles || []);
  
  return (
    <Route
      {...rest}
      render={(props) => {
        if (roles) {
          // Check for role-based access
          if (roles.some((role) => userRoles.includes(role))) {
            return <Component {...props} />;
          } else {
            return <AccessDenied userRoles={userRoles} />;
          }
        }
        return <Component {...props} />;
      }}
    />
  );
};

// PropTypes validation for the GenericRoute component
GenericRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default React.memo(() => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    // <div data-testid="Form-index">
      <Switch>
        <Route exact path={`${BASE_ROUTE}formflow`} component={List} />
        <GenericRoute
          path={`${BASE_ROUTE}formflow/create`}
          component={EditForm}
          roles={['create_designs', 'view_designs']}
        />
        <GenericRoute
          path={`${BASE_ROUTE}formflow/:formId?/edit`}
          component={EditForm}
          roles={['create_designs', 'view_designs']}
        />
        <GenericRoute
          path={`${BASE_ROUTE}formflow/:formId?/view-edit`}
          component={FormPreview}
        />
      </Switch>
    // </div>
  );
});

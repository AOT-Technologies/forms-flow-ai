import React from "react";
import { Route, Switch } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import SubmitList from "./SubmitList";
import DraftAndSubmissions from "./DraftAndSubmissions";
import SubmitIndex from "./SubmitIndex";
import ViewApplication from "../Submission/SubmissionView";
import { BASE_ROUTE } from "../../../constants/constants";
import Loading from "../../../containers/Loading";
import AccessDenied from "../../../components/AccessDenied";
import ResubmitForm from "../../../routes/Submit/Submission/Item/ResubmitForm";

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
        {/* <Route exact path={`${BASE_ROUTE}forms`} component={List} /> */}
        <Route exact path={`${BASE_ROUTE}form`} component={SubmitList} />
        <GenericRoute
          path={`${BASE_ROUTE}form/:parentFormId?/entries`}
          component={DraftAndSubmissions}
          roles={['create_submissions','view_submissions']}
        />
        <GenericRoute
          path={`${BASE_ROUTE}form/:formId?/submissions/:submissionId/resubmit`}
          component={ResubmitForm}
          roles={['create_submissions']}
        />
        <GenericRoute
          path={`${BASE_ROUTE}form/:formId/`}
          component={SubmitIndex}
        />
        <GenericRoute
          path={`${BASE_ROUTE}submission/:submissionId`}
          component={ViewApplication}
        />
      </Switch>
    // </div>
  );
});

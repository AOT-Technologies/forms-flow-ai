import React from "react";
import { Route, Switch } from "react-router-dom";
import { useSelector } from "react-redux";

import List from "./List";
import Stepper from "./Stepper";
import Item from "./Item/index";
import { BASE_ROUTE } from "../../constants/constants";
import Loading from "../../containers/Loading";
import userRoles from "../../constants/permissions";

const CreateFormRoute = ({ component: Component, createDesigns, viewDesigns, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (createDesigns || viewDesigns) {
        return <Component {...props} />;
      } else {
        return <>Unauthorized</>;
      }
    }}
  />
);


const FormSubmissionRoute = ({ component: Component, createSubmissions, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      createSubmissions ? (
        <Component {...props} />
      ) : (
        <>Unauthorized</>
      )
    }
  />
);

export default React.memo(() => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const {
    createDesigns,
    viewDesigns,
    createSubmissions,
  } = userRoles();

  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    <div data-testid="Form-index">
      <Switch>
        <Route exact path={`${BASE_ROUTE}form`} component={List} />
        <CreateFormRoute
          path={`${BASE_ROUTE}formflow/:formId?/:step?`}
          component={Stepper}
          createDesigns={createDesigns}
          viewDesigns={viewDesigns}
        />
        <FormSubmissionRoute
          path={`${BASE_ROUTE}form/:formId/`}
          component={Item}
          createSubmissions={createSubmissions}
        />
      </Switch>
    </div>
  );
});

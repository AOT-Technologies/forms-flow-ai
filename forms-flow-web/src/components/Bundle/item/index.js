import React, { useEffect }  from "react"; 
import { Route, Switch, Redirect, useParams } from "react-router-dom";
import BundleSubmit from "./BundleSubmit"; 
import {
  BASE_ROUTE, CLIENT, MULTITENANCY_ENABLED, STAFF_REVIEWER,
} from "../../../constants/constants"; 
import { useDispatch, useSelector } from "react-redux";
import { setBundleLoading, setBundleSelectedForms, setBundleSubmissionData } from "../../../actions/bundleActions";
import { getFormProcesses } from "../../../apiManager/services/processServices";
import { clearFormError, clearSubmissionError, setFormFailureErrorData } from "../../../actions/formActions";
import { executeRule } from "../../../apiManager/services/bundleServices";

const Item = React.memo(() => { 
  const { bundleId } = useParams();
  const userRoles = useSelector((state) => state.user.roles || []);
  const tenantKey = useSelector((state) => state?.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setBundleLoading(true));
    dispatch(setBundleSubmissionData({}));
    dispatch(clearFormError("form"));
    dispatch(clearSubmissionError("submission"));
    dispatch(
      getFormProcesses(bundleId, (err, data) => {
        if (err) { 
          dispatch(setFormFailureErrorData("form", err));
          dispatch(setBundleLoading(false));
        } else {
          executeRule({},data.id)
          .then((res) => {
            dispatch(setBundleSelectedForms(res.data));
           })
          .catch((err) => {
           dispatch(setFormFailureErrorData("form", err));
          })
          .finally(() => {
            dispatch(setBundleLoading(false));
          });
        }
      })
    );
  }, [bundleId, dispatch]);

  /**
   * Protected route to form submissions
   */
  const SubmissionRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        userRoles.includes(STAFF_REVIEWER) || userRoles.includes(CLIENT) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to={`${redirectUrl}`} />
        )
      }
    />
  );

  return (
    <div>
      <Switch>
        <SubmissionRoute exact path={`${BASE_ROUTE}bundle/:bundleId`} component={BundleSubmit} />
        <Redirect exact to="/404" />
      </Switch>
    </div>
  );
});

export default Item;

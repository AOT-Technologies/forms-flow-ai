import React, { useEffect, useState } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import Select from "react-select";
import NoData from "./nodashboard";
import { Route, Redirect } from "react-router";
import {
  fetchDashboardDetails,
  fetchUserDashboards,
} from "../../apiManager/services/insightServices";
import {
  setInsightDetailLoader,
} from "../../actions/insightActions";
import LoadingOverlay from "react-loading-overlay";
import Loading from "../../containers/Loading";
import { useTranslation, Translation } from "react-i18next";
import { BASE_ROUTE, MULTITENANCY_ENABLED } from "../../constants/constants";
import { push } from "connected-react-router";
import Head from "../../containers/Head";
import { runCleanup } from "../../actions/insightActions";

const Insights = React.memo((props) => {
  const {
    getDashboardDetail,
    dashboards,
    activeDashboard,
    getDashboards,
    isDashboardListUpdated,
    isDashboardDetailUpdated,
    error,
  } = props;
  const dispatch = useDispatch();
  const [dashboardSelected, setDashboardSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const totalItems = useSelector((state) => state.metrics.totalItems);

  const { t } = useTranslation();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  useEffect(() => {
    getDashboards();
  }, [getDashboards]);

  useEffect(() => {
    if (dashboards.length > 0) {
      let options = dashboards.map((item) => ({
        label: item.resourceDetails.name,
        value: item.resourceId,
      }));
      setDashboardSelected(options[0]);
      setOptions(options);
    }
  }, [dashboards]);
  useEffect(() => {
    if (dashboardSelected) {
      getDashboardDetail(dashboardSelected.value);
    }
  }, [dashboardSelected, getDashboardDetail]);

  useEffect(() => {
    return () => {
      dispatch(runCleanup());
    };
  }, []);

  const headerList = () => {
    return [
      {
        name: "Metrics",
        count: totalItems,
        onClick: () => dispatch(push(`${redirectUrl}metrics`)),
        icon: "line-chart mr-2",
      },
      {
        name: "Insights",
        onClick: () => dispatch(push(`${redirectUrl}insights`)),
        icon: "lightbulb-o mr-2",
      },
    ];
  };
  const NoPublicUrlMessage = () => (
    <div className="h-100 col-12 text-center div-middle">
      <i className="fa fa-tachometer fa-lg" />
      <br></br>
      <br></br>
      <label>
        <Translation>{(t) => t("No Public url found")}</Translation>
      </label>
    </div>
  );

  return (
    <>

      <div className="mb-2">


        <Head items={headerList()} page="Insights"/>


        <div className="d-flex align-items-center flex-md-row flex-colum justify-content-between mt-3"
          data-testid="Insight"
          role="main"
        >
          <h3 className="insight-title" data-testid="Dashboard">
            <i className="fa fa-bars mr-2" />{" "}
            <Translation>{(t) => t("Dashboard")}</Translation>
          </h3>

          <div className="col-6 col-md-3 mb-2">
            {options.length > 0 && (
              <Select

                aria-label="Select Dashboard"
                options={options}
                onChange={setDashboardSelected}
                placeholder={t("Select Dashboard")}
                value={options.find(
                  (element) => element.value == activeDashboard.id
                )}
              />
            )}
          </div>
        </div>

        {options.length > 0 ? (
          <LoadingOverlay
            active={
              !(isDashboardListUpdated || isDashboardDetailUpdated) && !error
            }
            styles={{
              overlay: (base) => ({
                ...base,
                background: "rgba(255, 255, 255)",
              }),
            }}
            className="col-12"
          >

            {activeDashboard.public_url ? (
              <iframe
                title="dashboard"
                style={{
                  width: "100%",
                  height: "auto",
                  overflow: "visible",
                  border: "none",
                  minHeight: "60vh",
                }}
                src={activeDashboard.public_url}
              />
            ) : !isDashboardDetailUpdated ? (
              <div
                style={{
                  position:'absolute',
                  left: '52%',
                  marginTop: '400px',
                  transform: 'translate(-50%, -90%)',
                }}>
                <Loading />
              </div>
            ) : (
              <NoPublicUrlMessage />
            )
            }
          </LoadingOverlay>
        )
          : (
            <NoData />
          )}


      </div>

      <Route path={`${BASE_ROUTE}insights/:notAvailable`}>
        <Redirect exact to="/404" />
      </Route>
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    isInsightLoading: state.insights.isInsightLoading,
    dashboards: state.insights.dashboardsList,
    activeDashboard: state.insights.dashboardDetail,
    isDashboardListUpdated: state.insights.isDashboardListUpdated,
    isDashboardDetailUpdated: state.insights.isDashboardDetailUpdated,
    error: state.insights.error,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getDashboardDetail: (dashboardId) => {
      dispatch(setInsightDetailLoader(true));
      dispatch(fetchDashboardDetails(dashboardId));
    },
    getDashboards: () => {
      dispatch(fetchUserDashboards());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Insights);

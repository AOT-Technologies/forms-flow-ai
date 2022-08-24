import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Select from "react-select";
import NoData from "./nodashboard";
import { Route, Redirect } from "react-router";
import {
  fetchDashboardDetails,
  fetchUserDashboards,
} from "../../apiManager/services/insightServices";
import {
  setInsightDetailLoader,
  setInsightDashboardListLoader,
} from "../../actions/insightActions";
import LoadingOverlay from "react-loading-overlay";
import Loading from "../../containers/Loading";
import { useTranslation, Translation } from "react-i18next";

import { SpinnerSVG } from "../../containers/SpinnerSVG";
import { BASE_ROUTE } from "../../constants/constants";

const Insights = React.memo((props) => {
  const {
    getDashboardDetail,
    dashboards,
    activeDashboard,
    isDashboardLoading,
    getDashboards,
    isDashboardListUpdated,
    isDashboardDetailUpdated,
    error,
  } = props;
  const [dashboardSelected, setDashboardSelected] = useState(null);
  const [options, setOptions] = useState([]);

  const { t } = useTranslation();

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
  if (isDashboardLoading) {
    return <Loading />;
  }
  return (
    <>
      <div className="container mb-4" id="main">
        <div className="insights mb-2">
          <div className="row ">
            <div className="col-12" data-testid="Insight">
              <h1 className="insights-title">
                <i className="fa fa-lightbulb-o fa-lg" aria-hidden="true" />{" "}
                <Translation>{(t) => t("Insights")}</Translation>
              </h1>
              <hr className="line-hr" />
              <div className="col-12">
                <div
                  className="app-title-container mt-3"
                  data-testid="Insight"
                  role="main"
                >
                  <h3 className="insight-title" data-testid="Dashboard">
                    <i className="fa fa-bars mr-1" />{" "}
                    <Translation>{(t) => t("Dashboard")}</Translation>
                  </h3>

                  <div className="col-3 mb-2">
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
              </div>
            </div>
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
              spinner={<SpinnerSVG />}
              className="col-12"
            >
              {options.length > 0 ? (
                activeDashboard.public_url ? (
                  <iframe
                    title="dashboard"
                    style={{
                      width: "100%",
                      height: "auto",
                      overflow: "visible",
                      border: "none",
                      minHeight: "100vh",
                    }}
                    src={activeDashboard.public_url}
                  />
                ) : (
                  !isDashboardDetailUpdated ? <Loading /> : <NoPublicUrlMessage />
                )
              ) : (
                <NoData />
              )}
            </LoadingOverlay>
          </div>
        </div>
      </div>
      <Route path={`${BASE_ROUTE}insights/:notAvailable`}>
        <Redirect exact to="/404" />
      </Route>
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    isDashboardLoading: state.insights.isDashboardLoading,
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
      dispatch(setInsightDashboardListLoader(true));
      dispatch(fetchUserDashboards());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Insights);

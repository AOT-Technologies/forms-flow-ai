import React, { useEffect }  from "react";
import ReactDOM from 'react-dom';
import {connect} from "react-redux";
// import {push} from "connected-react-router";

import { fetchDashboardsList, fetchDashboardDetails} from "../../apiManager/services/insightServices";

const Insights = (props) => {
  const {dashboards, activeDashboard, getDashboardsList } = props;
  useEffect(() => {
    getDashboardsList();
  },[getDashboardsList]);

  console.log(dashboards, activeDashboard);
  return (
    <>
      <div className="insights mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="insights-title">
              <i className="fa fa-lightbulb-o"/> Insights
            </h1>
            <hr className="line-hr"/>
          </div>
          <div className="col-12" >
            <iframe
              style={{
                width: '100%',
                height: 'auto',
                overflow: 'visible',
                border: 'none',
                minHeight: '100vh',
              
              }}
              src="https://bpm2.aot-technologies.com/public/dashboards/TyeHsJLGWiCJWRIwcfRZiGlGWUDeun9JwWWeZnsC?org_slug=default"/>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    isDashboardLoading: state.insights.isDashboardLoading,
    dashboards: state.insights.dashboardsList,
    activeDashboard: state.insights.dashboardDetail
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getDashboardsList: () => dispatch(
      fetchDashboardsList((err, res) => {
        if (!err) {
          console.log(res);
        }
      })
    ),
    getDashboardDetail: (dashboardId) => {
    dispatch(fetchDashboardDetails((err, res) => {
      if (!err) {
        console.log(res);
      }
    }))
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Insights);

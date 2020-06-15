import React, { useEffect }  from "react";
import {connect} from "react-redux";
import Select from 'react-select'
// import {push} from "connected-react-router";

import { fetchDashboardsList, fetchDashboardDetails} from "../../apiManager/services/insightServices";

const Insights = (props) => {
  const {dashboards, activeDashboard, getDashboardsList } = props;
  useEffect(() => {
    getDashboardsList();
  },[getDashboardsList]);

  const options = [
    { value: 'rpas', label: 'RPAS Self Assessment Form' },
  ]
  const handleChange = selectedOption => {
  };
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
          <div className="row col-md-10 mb-2">
              <div className="col-md-2">Select Dashboard</div>
              <div className="col-md-4">
                <Select
                options={options}
                onChange={handleChange}
                className="basic-single"
                />
              </div>
            </div>
          <div className="col-12" >
            <iframe
              title="dashboard"
              style={{
                width: '100%',
                height: 'auto',
                overflow: 'visible',
                border: 'none',
                minHeight: '100vh',

              }}
              src="https://bpm2.aot-technologies.com/public/dashboards/YCdoptdldMmuS4SgHrOUHvtRe1sRoeLCRm2tWUQG?org_slug=default"/>
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

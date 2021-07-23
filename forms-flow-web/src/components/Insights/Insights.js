import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import Select from 'react-select'
import NoData from './nodashboard';

import {fetchDashboardsList, fetchDashboardDetails} from "../../apiManager/services/insightServices";
import {setInsightDetailLoader, setInsightDashboardListLoader} from "../../actions/insightActions";
import LoadingOverlay from "react-loading-overlay";
import Loading from "../../containers/Loading";

const Insights = React.memo((props) => {
  const {getDashboardsList, getDashboardDetail, dashboards, activeDashboard, isInsightLoading, isDashboardLoading} = props;
  const [dashboardSelected, setDashboardSelected] = useState(null);

  useEffect(() => {
    getDashboardsList();
  }, [getDashboardsList]);

  useEffect(()=>{
    if(dashboards.length>0){
      setDashboardSelected(dashboards[0]);
    }
  },[dashboards])
  useEffect(() => {
    if(dashboardSelected){
      getDashboardDetail(dashboardSelected.value);
    }
  }, [dashboardSelected, getDashboardDetail]);

  if (isDashboardLoading) {
    return <Loading />;
  }
  return (
    <>
    <div className="container mb-4" id="main">
      <div className="insights mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="insights-title">
            <i className="fa fa-lightbulb-o fa-lg" aria-hidden="true"/> Insights
            </h1>
            <hr className="line-hr"/>
            <div className="col-12">
              <div className="app-title-container mt-3">
                <h3 className="insight-title">
                  <i className="fa fa-bars mr-1"/> Dashboard
                </h3>

                <div className="col-3 mb-2">
                  <Select
                    options={dashboards}
                    onChange={setDashboardSelected}
                    placeholder='Select Dashboard'
                    value={dashboardSelected}
                  />
                </div>
              </div>
            </div>
          </div>
          <LoadingOverlay active={isInsightLoading} spinner className="col-12">
            {dashboards.length > 0 ?
                <iframe
                  title="dashboard"
                  style={{
                    width: '100%',
                    height: 'auto',
                    overflow: 'visible',
                    border: 'none',
                    minHeight: '100vh',
                  }}
                  src={activeDashboard.public_url}/>
              :
              <NoData/>
            }
          </LoadingOverlay>
        </div>
      </div>
      </div>
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    isDashboardLoading: state.insights.isDashboardLoading,
    isInsightLoading: state.insights.isInsightLoading,
    dashboards: state.insights.dashboardsList,
    activeDashboard: state.insights.dashboardDetail
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getDashboardsList: () => {
      dispatch(setInsightDashboardListLoader(true));
      dispatch(
      fetchDashboardsList()
      )
    },
    getDashboardDetail: (dashboardId) => {
      dispatch(setInsightDetailLoader(true));
      dispatch(fetchDashboardDetails(dashboardId))
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Insights);

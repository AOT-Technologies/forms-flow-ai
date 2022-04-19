import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import Select from 'react-select'
import NoData from './nodashboard';
import { Route, Redirect } from "react-router";
import {fetchDashboardsList, fetchDashboardDetails} from "../../apiManager/services/insightServices";
import {setInsightDetailLoader, setInsightDashboardListLoader} from "../../actions/insightActions";
import LoadingOverlay from "react-loading-overlay";
import Loading from "../../containers/Loading";
import { fetchdashboards } from "../../apiManager/services/dashboardsService";
import { SpinnerSVG } from "../../containers/SpinnerSVG";

const Insights = React.memo((props) => {
  const {getDashboardsList, getDashboardDetail, dashboards, activeDashboard, isInsightLoading, isDashboardLoading,getDashboards,dashboardsFromRedash} = props;
  const [dashboardSelected, setDashboardSelected] = useState(null);

  useEffect(() => {
      getDashboardsList(dashboardsFromRedash);
  }, [getDashboardsList,dashboardsFromRedash]);

  useEffect(()=>{
    getDashboards();
  },[getDashboards])

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

const NoPublicUrlMessage = ()=>(
  <div className="h-100 col-12 text-center div-middle">
      <i className="fa fa-tachometer fa-lg"/>
      <br></br>
      <br></br>
      <label> No Public url found </label>
    </div>
)
  if (isDashboardLoading) {
    return <Loading />;
  }
  return (
    <>
    <div className="container mb-4" id="main">
      <div className="insights mb-2">
        <div className="row ">
          <div className="col-12"  data-testid="Insight">
            <h1 className="insights-title">
            <i className="fa fa-lightbulb-o fa-lg" aria-hidden="true"/> Insights
            </h1>
            <hr className="line-hr"/>
            <div className="col-12">
              <div className="app-title-container mt-3"  data-testid="Insight">
                <h3 className="insight-title" data-testid="Dashboard">
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
          <LoadingOverlay active={isInsightLoading || !activeDashboard.name} styles={{
        overlay: (base) => ({
          ...base,
          background: 'rgba(255, 255, 255)'
        })
      }} spinner={<SpinnerSVG />} className="col-12">
            {dashboards.length > 0 ?
             ( activeDashboard.public_url ? <iframe
                  title="dashboard"
                  style={{
                    width: '100%',
                    height: 'auto',
                    overflow: 'visible',
                    border: 'none',
                    minHeight: '100vh',
                  }}
                  src={activeDashboard.public_url}
                  />:<NoPublicUrlMessage />)
              :
              <NoData/>
            }
          </LoadingOverlay>
        </div>
      </div>
      </div>
      <Route path={"/insights/:notAvailable"}> <Redirect exact to='/404'/></Route>
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    isDashboardLoading: state.insights.isDashboardLoading,
    isInsightLoading: state.insights.isInsightLoading,
    dashboards: state.insights.dashboardsList,
    activeDashboard: state.insights.dashboardDetail,
    dashboardsFromRedash:state.dashboardReducer.dashboards,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getDashboardsList: (dashboardsFromRedash) => {
      dispatch(setInsightDashboardListLoader(true));
      dispatch(
      fetchDashboardsList(dashboardsFromRedash)
      )
    },
    getDashboardDetail: (dashboardId) => {
      dispatch(setInsightDetailLoader(true));
      dispatch(fetchDashboardDetails(dashboardId))
    },
    getDashboards:()=>{
      dispatch(setInsightDashboardListLoader(true)); 
      dispatch(fetchdashboards())
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Insights);

import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import Select from 'react-select'
import NoData from './nodashboard';

import {fetchDashboardsList, fetchDashboardDetails} from "../../apiManager/services/insightServices";

const Insights = (props) => {
  //TODO Remove once API cors fixes
  const options = [
    {
      value: 'dashboard1',
      label: 'RPAS Self Assessment Dashboard',
      "public_url": "https://analytics1.aot-technologies.com/public/dashboards/3REIAWpfBZ9kW1y924BFknB1QGIQLozRedi9E11U?org_slug=default"
    },
    {
      value: 'foi-submissions',
      label: 'FOI Submissions',
      "public_url": "https://analytics1.aot-technologies.com/public/dashboards/H7xv90X2CmpXxJecSCFv1Ca6DrHHptnqaCrpQwv7?org_slug=default"
    }
  ]
  const {getDashboardsList, getDashboardDetail} = props;
  const [dashboardSelected, setDashboardSelected] = useState(options[0]);

  useEffect(() => {
    getDashboardsList();
  }, [getDashboardsList]);

  useEffect(() => {
    getDashboardDetail(dashboardSelected.value);
  }, [dashboardSelected, getDashboardDetail]);

  return (
    <>
      <div className="insights mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="insights-title">
              <i className="fa fa-lightbulb-o"/> Insights
            </h1>
            <hr className="line-hr"/>
            <div className="col-12">
              <div className="app-title-container mt-3">
                <h3 className="insight-title">
                  <i className="fa fa-bars mr-1"/> Dashboard
                </h3>

                <div className="col-3 mb-2">
                  <Select
                    options={options}
                    onChange={setDashboardSelected}
                    placeholder='Select Dashboard'
                    value={dashboardSelected}
                  />
                </div>
              </div>
            </div>
          </div>
          {options.length > 0 ?
            <div className="col-12">
              <iframe
                title="dashboard"
                style={{
                  width: '100%',
                  height: 'auto',
                  overflow: 'visible',
                  border: 'none',
                  minHeight: '100vh',
                }}
                src={dashboardSelected.public_url}/>
            </div>
            :
            <NoData/>
          }
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
      dispatch(fetchDashboardDetails(dashboardId, (err, res) => {
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

import React, { Fragment, useEffect, useState } from "react";
import ApplicationCounter from "./ApplicationCounter";
import { useDispatch, useSelector } from "react-redux";

import StatusChart from "./StatusChart";
import * as metrix from "../../mocks/metrix.json";
import {
  fetchMetrixSubmissionCount,
  fetchMetrixSubmissionStatusCount,
} from "./../../apiManager/services/metrixServices";

import Loading from "../Loading";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import * as moment from "moment";

const Dashboard = () => {
  console.log("metrix", metrix.applicationsMetrix);
  const dispatch = useDispatch();
  const submissionsList = useSelector((state) => state.metrix.submissionsList);
  const submissionsStatusList = useSelector(
    (state) => state.metrix.submissionsStatusList
  );
  const isMetrixLoading = useSelector((state) => state.metrix.isMetrixLoading);
  const isMetrixStatusLoading = useSelector(
    (state) => state.metrix.isMetrixStatusLoading
  );
  const selectedMEtrixId = useSelector(
    (state) => state.metrix.selectedMEtrixId
  );
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  useEffect(() => {
    console.log("inside mount useEffect");
    dispatch(fetchMetrixSubmissionCount());
  }, [dispatch]);

  if (isMetrixLoading) {
    return <Loading />;
  }
  if (submissionsList) {
    // dispatch(fetchMetrixSubmissionStatusCount());
  }
  const getStatusDetails = (id) => {
    console.log("id", id);
    dispatch(fetchMetrixSubmissionStatusCount(id));
  };

  const onSetDateRange = (date) => {
    console.log("date", date);

    const formatedFromDate = moment(date[0]).format("YYYY-MM-DD");
    const formatedToDate = moment(date[0]).format("YYYY-MM-DD");
    console.log("formatedFromDate", formatedFromDate);
    console.log("formatedToDate", formatedToDate);
    setDateRange(date);
  };

  console.log("dateRange", dateRange);
  return (
    <Fragment>
      <div className="dashboard mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="dashboard-title">
              <i className="fa fa-home"></i> Metrics Dashboard
            </h1>
            <hr className="line-hr"></hr>
            <div className="col-12">
              <div className="app-title-container mt-3">
                <h3 className="application-title">
                  <i className="fa fa-bars mr-1"></i> Submissions
                </h3>

                <div>
                  <DateRangePicker
                    onChange={onSetDateRange}
                    value={dateRange}
                    format="y-MM-d"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12">
            <ApplicationCounter
              application={submissionsList[0].applications}
              getStatusDetails={getStatusDetails}
              selectedMEtrixId={selectedMEtrixId}
            />
          </div>
          {/* <div className="col-12 white-box">
            <Counters />
          </div>
          <div className="col-6 white-box">
            <StatusCounters />
          </div> */}
          <div className="col-12">
            {isMetrixStatusLoading ? (
              <Loading />
            ) : (
              <StatusChart submissionsStatusList={submissionsStatusList} />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default Dashboard;

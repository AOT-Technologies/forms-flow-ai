import React, { Fragment, useEffect, useState } from "react";
import ApplicationCounter from "./ApplicationCounter";
import { useDispatch, useSelector } from "react-redux";

import ChartForm from "./ChartForm";
import * as metrix from "../../mocks/metrix.json";
import {
  fetchMetrixSubmissionCount,
  fetchMetrixSubmissionStatusCount,
} from "./../../apiManager/services/metrixServices";
// import Loading from "../../containers/Loading";
import Loading from "../Loading";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";

const Dashboard = (props) => {
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
  const [value, onChange] = useState([new Date(), new Date()]);
  useEffect(() => {
    console.log("inside mount useEffect");
    dispatch(fetchMetrixSubmissionCount());
    return () => {
      console.log("on update");

      return false;
    };
  }, []);
  console.log("submissionsList", submissionsList);
  console.log("isMetrixLoading", isMetrixLoading);
  console.log("selectedMEtrixId", selectedMEtrixId);
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
  const handleSelect = (date) => {
    console.log(date); // native Date object
  };

  console.log("value", value);
  return (
    <Fragment>
      <div className="dashboard mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="dashboard-title">
              <i className="fa fa-home"></i> Metrics Dashboard
            </h1>
            <hr className="line-hr"></hr>
            <div>
              <DateRangePicker
                onChange={onChange}
                value={value}
                format="y-MM-d"
              />
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
              <ChartForm submissionsStatusList={submissionsStatusList} />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default Dashboard;

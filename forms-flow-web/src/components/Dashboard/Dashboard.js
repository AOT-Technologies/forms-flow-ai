import React, { Fragment, useEffect } from "react";
import ApplicationCounter from "./ApplicationCounter";
// import StatusCounters from "./StatusCounters";
import { useDispatch, useSelector } from "react-redux";

import ChartForm from "./ChartForm";
// import Counters from "./Counters";
import * as metrix from "../../mocks/metrix.json";
import {
  fetchMetrixSubmissionCount,
  fetchMetrixSubmissionStatusCount,
} from "./../../apiManager/services/metrixServices";
// import Loading from "../../containers/Loading";
import Loading from "../Loading";

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
  console.log("submissionsStatusList", submissionsStatusList);
  return (
    <Fragment>
      <div className="dashboard mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="dashboard-title">
              <i className="fa fa-home"></i> Metrics Dashboard
            </h1>
            <hr className="line-hr"></hr>
            <div>date</div>
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

import React, { Fragment, useEffect, useState } from "react";
import ApplicationCounter from "./ApplicationCounter";
import { useDispatch, useSelector } from "react-redux";

import StatusChart from "./StatusChart";
import {
  fetchMetrixSubmissionCount,
  fetchMetrixSubmissionStatusCount,
} from "./../../apiManager/services/metrixServices";

import Loading from "../Loading";
import LoadError from "../Error";

import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import * as moment from "moment";

const Dashboard = () => {
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
  const metrixLoadError = useSelector((state) => state.metrix.metrixLoadError);
  const metricsStatusLoadError = useSelector(
    (state) => state.metrix.metricsStatusLoadError
  );

  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const getFormattedDate = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };
  useEffect(() => {
    const fromDate = getFormattedDate(new Date());
    const toDate = getFormattedDate(new Date());
    dispatch(fetchMetrixSubmissionCount(fromDate, toDate));
  }, [dispatch]);

  if (isMetrixLoading) {
    return <Loading />;
  }

  const getStatusDetails = (id) => {
    const fromDate = getFormattedDate(dateRange[0]);
    const toDate = getFormattedDate(dateRange[1]);
    dispatch(fetchMetrixSubmissionStatusCount(id, fromDate, toDate));
  };

  const onSetDateRange = (date) => {
    const fdate = date && date[0] ? date[0] : new Date();
    const tdate = date && date[1] ? date[1] : new Date();
    const fromDate = getFormattedDate(fdate);
    const toDate = getFormattedDate(tdate);

    dispatch(fetchMetrixSubmissionCount(fromDate, toDate));
    setDateRange(date);
  };

  const noOfApplicationsAvailable = submissionsList.length;
  if (metrixLoadError) {
    return (
      <LoadError text="The operation couldn't be completed. Please try after sometime" />
    );
  }
  return (
    <Fragment>
      <div className="dashboard mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="dashboard-title">
              <i className="fa fa-home"></i> Metrics
            </h1>
            <hr className="line-hr"></hr>
            <div className="row ">
              <div className="col-12 col-lg-6 ">
                <h3 className="application-title">
                  <i className="fa fa-bars mr-1"></i> Submissions
                </h3>
              </div>
              <div className="col-12 col-lg-6 d-flex align-items-end flex-lg-column mt-3 mt-lg-0">
                <DateRangePicker
                  onChange={onSetDateRange}
                  value={dateRange}
                  format="y-MM-d"
                />
              </div>
            </div>
          </div>
          <div className="col-12">
            <ApplicationCounter
              application={submissionsList}
              getStatusDetails={getStatusDetails}
              selectedMEtrixId={selectedMEtrixId}
              noOfApplicationsAvailable={noOfApplicationsAvailable}
            />
          </div>
          {metricsStatusLoadError && <LoadError />}
          {noOfApplicationsAvailable > 0 && (
            <div className="col-12">
              {isMetrixStatusLoading ? (
                <Loading />
              ) : (
                <StatusChart submissionsStatusList={submissionsStatusList} />
              )}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default Dashboard;

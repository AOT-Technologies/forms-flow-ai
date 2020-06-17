import React, { Fragment, useEffect, useState } from "react";
import ApplicationCounter from "./ApplicationCounter";
import { useDispatch, useSelector } from "react-redux";

import StatusChart from "./StatusChart";
import {
  fetchMetricsSubmissionCount,
  fetchMetricsSubmissionStatusCount,
} from "./../../apiManager/services/metricsServices";

import Loading from "../Loading";
import LoadError from "../Error";

import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import * as moment from "moment";

const firsDay = moment().format("YYYY-MM-02");
// export const calendarIcon = () => {
//   return <i className="fa fa-pie-chart" aria-hidden="true"></i>;
// };
const Dashboard = () => {
  const dispatch = useDispatch();
  const submissionsList = useSelector((state) => state.metrics.submissionsList);
  const submissionsStatusList = useSelector(
    (state) => state.metrics.submissionsStatusList
  );
  const isMetricsLoading = useSelector(
    (state) => state.metrics.isMetricsLoading
  );
  const isMetricsStatusLoading = useSelector(
    (state) => state.metrics.isMetricsStatusLoading
  );
  const selectedMetricsId = useSelector(
    (state) => state.metrics.selectedMetricsId
  );
  const metricsLoadError = useSelector(
    (state) => state.metrics.metricsLoadError
  );
  const metricsStatusLoadError = useSelector(
    (state) => state.metrics.metricsStatusLoadError
  );

  const [dateRange, setDateRange] = useState([new Date(firsDay), new Date()]);
  const getFormattedDate = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };
  useEffect(() => {
    const fromDate = getFormattedDate(new Date(firsDay));
    const toDate = getFormattedDate(new Date());
    dispatch(fetchMetricsSubmissionCount(fromDate, toDate));
  }, [dispatch]);

  if (isMetricsLoading) {
    return <Loading />;
  }

  const getStatusDetails = (id) => {
    const fromDate = getFormattedDate(dateRange[0]);
    const toDate = getFormattedDate(dateRange[1]);
    dispatch(fetchMetricsSubmissionStatusCount(id, fromDate, toDate));
  };

  const onSetDateRange = (date) => {
    const fdate = date && date[0] ? date[0] : new Date();
    const tdate = date && date[1] ? date[1] : new Date();
    const fromDate = getFormattedDate(fdate);
    const toDate = getFormattedDate(tdate);

    dispatch(fetchMetricsSubmissionCount(fromDate, toDate));
    setDateRange(date);
  };

  const noOfApplicationsAvailable = submissionsList.length;
  if (metricsLoadError) {
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
              <i className="fa fa-pie-chart" aria-hidden="true"></i> Metrics
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
                  calendarIcon={
                    <i className="fa fa-calendar" aria-hidden="true"></i>
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-12">
            <ApplicationCounter
              application={submissionsList}
              getStatusDetails={getStatusDetails}
              selectedMetricsId={selectedMetricsId}
              noOfApplicationsAvailable={noOfApplicationsAvailable}
            />
          </div>
          {metricsStatusLoadError && <LoadError />}
          {noOfApplicationsAvailable > 0 && (
            <div className="col-12">
              {isMetricsStatusLoading ? (
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

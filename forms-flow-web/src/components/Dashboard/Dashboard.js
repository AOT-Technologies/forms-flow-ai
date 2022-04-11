import React, { Fragment, useEffect, useState } from "react";
import ApplicationCounter from "./ApplicationCounter";
import { useDispatch, useSelector } from "react-redux";
import { Route, Redirect } from "react-router";
import StatusChart from "./StatusChart";
import Select from 'react-select';
import {
  fetchMetricsSubmissionCount,
  fetchMetricsSubmissionStatusCount,
} from "./../../apiManager/services/metricsServices";

import Loading from "../../containers/Loading";
import LoadError from "../Error";

import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import moment from "moment";

const firsDay = moment().format("YYYY-MM-01");

const lastDay = moment().endOf("month").format("YYYY-MM-DD");

const Dashboard = React.memo(() => {
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
  const searchOptions = [
    { value: 'created', label: 'Created Date' },
    { value: 'modified', label: 'Modified Date' },
  ];
  const [searchBy, setSearchBy] = useState(searchOptions[0]);
  const [dateRange, setDateRange] = useState([
    moment(firsDay),
    moment(lastDay),
  ]);
  const [showSubmissionData,setSHowSubmissionData]=useState(submissionsList[0])

  const getFormattedDate = (date) => {
    return moment.utc(date).format("YYYY-MM-DDTHH:mm:ssZ").replace("+","%2B")
  };
  useEffect(() => {
    const fromDate = getFormattedDate(dateRange[0]);
    const toDate = getFormattedDate(dateRange[1]);
    dispatch(fetchMetricsSubmissionCount(fromDate, toDate, searchBy.value));
  }, [dispatch,searchBy.value,dateRange]);

  useEffect(()=>{
    setSHowSubmissionData(submissionsList[0])
  },[submissionsList])
  
  const  onChangeInput =(option) => {
    setSearchBy(option);
    
  }

  if (isMetricsLoading) {
    return <Loading />;
  }

  const getStatusDetails = (id) => {
    const fromDate = getFormattedDate(dateRange[0]);
    const toDate = getFormattedDate(dateRange[1]);
    dispatch(fetchMetricsSubmissionStatusCount(id, fromDate, toDate, searchBy.value));
  };

  const onSetDateRange = (date) => {
    
    setDateRange(date);
  };
  
  const noOfApplicationsAvailable = submissionsList?.length || 0;
  if (metricsLoadError) {
    return (
      <LoadError text="The operation couldn't be completed. Please try after sometime" />
    );
  }
  return (
    <Fragment>
      <div className="container mb-4" id="main">
      <div className="dashboard mb-2">
        <div className="row ">
          <div className="col-12">
            <h1 className="dashboard-title">
            <i className="fa fa-pie-chart p-1" />
              {/* <i className="fa fa-pie-chart" aria-hidden="true"/> */}
               Metrics
            </h1>
            <hr className="line-hr"/>
            <div className="row ">
              <div className="col-12 col-lg-4 ">
                <h3 className="application-title">
                  <i className="fa fa-bars mr-1"/> Submissions
                </h3>
              </div>
              <div className="col-12 col-lg-5" title="Search By">
              <div style={{width: '200px',float:"right"}} >
              <Select
                    options={searchOptions}
                    onChange={onChangeInput}
                    placeholder='Select Filter'
                    value={searchBy}
              />
              </div>
              </div>
              <div className="col-12 col-lg-3 d-flex align-items-end flex-lg-column mt-3 mt-lg-0" >
                <DateRangePicker
                  onChange={onSetDateRange}
                  value={dateRange}
                  format="MMM dd, y"
                  rangeDivider=" - "
                  clearIcon={null}
                  calendarIcon={
                    <i className="fa fa-calendar" />
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
              setSHowSubmissionData={setSHowSubmissionData}
            />
          </div>
          {metricsStatusLoadError && <LoadError />}
          {noOfApplicationsAvailable > 0 && (
            <div className="col-12">
              {isMetricsStatusLoading ? (
                <Loading />
              ) : (
                <StatusChart  submissionsStatusList={submissionsStatusList} submissionData={showSubmissionData} />
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      <Route path={"/metrics/:notAvailable"}> <Redirect exact to='/404'/></Route>
    </Fragment>
  );
});

export default Dashboard;

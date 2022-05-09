import React, { Fragment, useEffect, useState } from "react";
import ApplicationCounter from "./ApplicationCounter";
import { useDispatch, useSelector } from "react-redux";
import { Route, Redirect } from "react-router";
import StatusChart from "./StatusChart";
import Select from 'react-select';
import Modal from "react-bootstrap/Modal"
import {
  fetchMetricsSubmissionCount,
  fetchMetricsSubmissionStatusCount,
} from "./../../apiManager/services/metricsServices";
import Pagination from "react-js-pagination";
import Loading from "../../containers/Loading";
import LoadError from "../Error";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import moment from "moment";
import { Translation,useTranslation } from "react-i18next";
import { setMetricsSubmissionLimitChange, setMetricsSubmissionPageChange, setMetricsSubmissionSearch, setMetricsSubmissionSort } from "../../actions/metricsActions";

const firsDay = moment().format("YYYY-MM-01");

const lastDay = moment().endOf("month").format("YYYY-MM-DD");

const Dashboard = React.memo(() => {
  const{t} = useTranslation();
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
  const activePage = useSelector((state) => state.metrics.pagination.page);
  const limit = useSelector((state) => state.metrics.limit);
  const totalItems = useSelector((state) => state.metrics.submissionsFullList.length)
  const pageRange = useSelector((state) => state.metrics.pagination.numPages)
  const sort = useSelector((state) => state.metrics.sort);
  // if ascending sort value is title else -title for this case
  const isAscending =  sort ==='-formName'? false : true;
  const searchOptions = [
    { value: 'created', label: <Translation>{(t)=>t("Created Date")}</Translation> },
    { value: 'modified', label: <Translation>{(t)=>t("Modified Date")}</Translation> },
  ];
  const [searchBy, setSearchBy] = useState(searchOptions[0]);
  const [dateRange, setDateRange] = useState([
    moment(firsDay),
    moment(lastDay),
  ]);
  const [showSubmissionData,setSHowSubmissionData]=useState(submissionsList[0]);
  const [show ,setShow] =useState(false);
  // State to set search text for submission data 
  const [searchSubmissionText,setSearchSubmissionText] = useState('');
  // Function to handle search text
  const handleSearch = (searchText)=>{
    const searchTitle = searchText ? searchText : ''
    setSearchSubmissionText(searchTitle)
    dispatch(setMetricsSubmissionSearch(searchTitle));
  }
  // Function to handle sort for submission data
  const handleSort = ()=>{
   const updatedQuery = {
      sort: `${isAscending?'-':''}formName`,
    }
   dispatch(setMetricsSubmissionSort(updatedQuery.sort || ''));
  }
  // Function to handle page limit change for submission data
  const handleLimitChange = (limit)=>{
    dispatch(setMetricsSubmissionLimitChange(Number(limit)))
  }
  // Function to handle pageination page change for submission data
  const handlePageChange = (pageNumber) =>{
    dispatch(setMetricsSubmissionPageChange(pageNumber))
  }
  const getFormattedDate = (date) => {
    return moment.utc(date).format("YYYY-MM-DDTHH:mm:ssZ").replace("+","%2B");
  };
  useEffect(() => {
    const fromDate = getFormattedDate(dateRange[0]);
    const toDate = getFormattedDate(dateRange[1]);
    dispatch(fetchMetricsSubmissionCount(fromDate, toDate, searchBy.value));
  }, [dispatch,searchBy.value,dateRange]);

  useEffect(()=>{
    setSHowSubmissionData(submissionsList[0]);
  },[submissionsList]);
  
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
    setShow(true)
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
              <Translation>{(t)=>t("Metrics")}</Translation>
            </h1>
            <hr className="line-hr"/>
            <div className="row ">
              <div className="col-12 col-lg-4 ">
                <h2 className="application-title">
                  <i className="fa fa-bars mr-1"/> <Translation>{(t)=>t("Submissions")}</Translation>
                </h2> 
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
                  title="date-picker"
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
            <div className="row mt-2 mx-2">
          <div className="col">
            <div class="input-group">
            <i
            onClick={handleSort}
            className="fa fa-long-arrow-up fa-lg mt-2"
            title="Sort by form name"
            style={{ cursor: 'pointer',opacity: `${isAscending?1:0.5}`}}
          />
          <i
            onClick={handleSort}
            className="fa fa-long-arrow-down fa-lg mt-2 ml-1"
            title="Sort by form name"
            style={{ cursor: 'pointer',opacity: `${isAscending?0.5:1}`}}
          />
              <div class="form-outline ml-3">
                 <input type="search" id="form1" 
                 onChange={(e)=>setSearchSubmissionText(e.target.value)} 
                 value={searchSubmissionText}
                 autoComplete="off"
                 class="form-control" placeholder="search..." 
                 />
              </div>
              {
                searchSubmissionText!=="" && 
                <button type="button" class="btn btn-outline-primary ml-2"
                onClick={()=> handleSearch('')}
              >
               <i class="fa fa-times"></i>
             </button>
              }
             <button type="button" class="btn btn-outline-primary ml-2"
              name="search-button"
              title="Click to search"
              onClick={()=> handleSearch(searchSubmissionText)}
              >
               <i class="fa fa-search"></i>
             </button>
            </div>
          </div>
        </div>
          </div>
          <div className="col-12">
            <ApplicationCounter
              className="dashboard-card"
              application={submissionsList}
              getStatusDetails={getStatusDetails}
              selectedMetricsId={selectedMetricsId}
              noOfApplicationsAvailable={noOfApplicationsAvailable}
              setSHowSubmissionData={setSHowSubmissionData}
            />
          </div>
          {
            submissionsList.length ? (
              <div className=" w-100 p-3 d-flex align-items-center">
                
              <Pagination
                activePage={activePage}
                itemsCountPerPage={limit}
                totalItemsCount={totalItems}
                pageRangeDisplayed={pageRange}
                itemClass="page-item"
                linkClass="page-link"
                onChange={handlePageChange}
              />

            <select onChange={(e)=>handleLimitChange(e.target.value)} className="form-select mx-5 mb-3">
              <option selected>6</option>
              <option value={12}>12</option>
              <option value={30}>30</option>
              <option value={900}>All</option>
            </select>
              </div>
            ):null
          }
          {metricsStatusLoadError && <LoadError />}
          {noOfApplicationsAvailable > 0 && (
            <div className="col-12">
              {isMetricsStatusLoading ? (
                <Loading />
              ) : (
                <Modal
                  show={show}
                  size="lg"
                  onHide={() => setShow(false)}
                  aria-labelledby="example-custom-modal-styling-title"
                   >
                 <Modal.Header closeButton>
                       <Modal.Title id="example-custom-modal-styling-title">
                          {t("Submission Status")}
                       </Modal.Title>
                 </Modal.Header>
                 <Modal.Body>
                    <StatusChart  submissionsStatusList={submissionsStatusList} submissionData={showSubmissionData} />
                  </Modal.Body>
                </Modal>
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

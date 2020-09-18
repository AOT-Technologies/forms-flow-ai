import React, {useEffect} from 'react'

import {useDispatch, useSelector} from 'react-redux'
import { connect } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import LoadingOverlay from "react-loading-overlay";

import {getAllApplications} from "../../apiManager/services/applicationServices";
import {setApplicationListLoader,setUpdateLoader} from "../../actions/applicationActions";
import Loading from "../../containers/Loading";
import Nodata from "./nodata";
import {
  columns,
  getoptions,
  defaultSortedBy,
  TaskSearch,
  clearFilter,
} from "./table";


const ApplicationList = () => {
  const applications = useSelector(state=> state.applications.applicationsList)
  const isApplicationListLoading = useSelector((state) => state.applications.isApplicationListLoading);
  const applicationCount = useSelector((state) => state.applications.applicationCount);
  //const isApplicationUpdating = useSelector(state => state.applications.isApplicationUpdating);
  const dispatch= useDispatch();

 

  useEffect(()=>{
    dispatch(setApplicationListLoader(true))
    dispatch(getAllApplications());
  },[dispatch]);

  if (isApplicationListLoading) {
    return (
      <Loading/>
    );
  }

  const listApplications = (applications) => {
    if (applications.length > 0) {
      console.log('applications in list app >>'+applications.length);
      const data = applications.map((application) => {
        return {
          id: application.id,
          applicationName: application.applicationName,
          applicationStatus: application.applicationStatus,
          formUrl: application.formUrl,
          modified: application.modified,
          submittedBy: 'to do',
          
        };
      });
      console.log("data>>",data)
      return data;
    } 
    else {
      console.log("inside else>>");
      return [];
    }
  };

 

  

  const afterFilter = (newResult, newFilters) => {
    const globalFilterValue=document.getElementById("applicationfilter").value;
    const dropDown = document.getElementById("select-filter-column-applicationStatus");
    for (let i = 0; i <= dropDown.options.length; i++) {
      if(dropDown.options[i]){
        if(globalFilterValue === "Active" ){
          if (dropDown.options[i].selected !== "Active") {
            dropDown.options[i].style.display="none";
          }
        } else {
          dropDown.options[i].style.display="block";
        }
      }
    }
  }

  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-application">
        <label className="lbl-no-application"> No applications found </label>
        <br />
        <label className="lbl-no-application-desc">
          {" "}
          Please change the selected filters to view applications{" "}
        </label>
        <br />
        <label className="lbl-clear" onClick={clearFilter}>
          Clear all filters
        </label>
      </div>
    );
  };

  

  console.log("here to get all Applications data", applications);

  return (
    applicationCount > 0 ? (
      <ToolkitProvider
        keyField="id"
        data={listApplications(applications)}
        columns={columns}
        search
      >
        {(props) => (
            <div className="container">
              <div className="main-header">
                <img src="/clipboard.svg" width="30" height="30" alt="application" />
                <h3 className="application-head">
                  Applications
                  <div className="col-md-1 application-count">({applicationCount})</div>
                </h3>
              </div>
              <br />
              <div>
                <LoadingOverlay
                  active={isApplicationListLoading}
                  spinner
                  text="Loading..."
                >
                  <BootstrapTable
                    loading={isApplicationListLoading}
                    pagination={paginationFactory(getoptions(props.applicationCount))}
                    defaultSorted={defaultSortedBy}
                    {...props.baseProps}
                    noDataIndication={() => getNoDataIndicationContent()}
                    // overlay={ overlayFactory({ spinner: true, styles: { overlay: (base) => ({...base}) } }) }
                  />
                </LoadingOverlay>
              </div>
             
            </div>
          )}
      </ToolkitProvider>
    ) : (
      <Nodata />
    )
   
  )
}

const doLoaderUpdate = () => (dispatch, getState) => {
  let isLoading = getState().applications.isApplicationListLoading;
  if (isLoading) {
    dispatch(getAllApplications());
    dispatch(setApplicationListLoader(false));
  }
}


export default ApplicationList;

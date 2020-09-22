import React, {useEffect} from 'react'

import {useDispatch, useSelector} from 'react-redux'
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import LoadingOverlay from "react-loading-overlay";

import {getAllApplications} from "../../apiManager/services/applicationServices";
import {setApplicationListLoader} from "../../actions/applicationActions";
import Loading from "../../containers/Loading";
import Nodata from "./nodata";
import {
  columns,
  getoptions,
  defaultSortedBy,
} from "./table";


const ApplicationList = () => {
  const applications = useSelector(state=> state.applications.applicationsList)
  const isApplicationListLoading = useSelector((state) => state.applications.isApplicationListLoading);
  const applicationCount = useSelector((state) => state.applications.applicationCount);
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
       {/* <label className="lbl-clear" onClick={clearFilter}>
          Clear all filters
        </label>*/}
      </div>
    );
  };

  return (
    applicationCount > 0 ? (
      <ToolkitProvider
        keyField="id"
        data={applications}
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
                    filter={filterFactory()}
                    pagination={paginationFactory(getoptions(applicationCount))}
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


export default ApplicationList;

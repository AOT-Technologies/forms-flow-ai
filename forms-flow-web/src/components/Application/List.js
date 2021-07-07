import React, {useEffect} from 'react'

import {useDispatch, useSelector} from 'react-redux'
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import LoadingOverlay from "react-loading-overlay";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import {getAllApplications} from "../../apiManager/services/applicationServices";
import {setApplicationListLoader} from "../../actions/applicationActions";
import Loading from "../../containers/Loading";
import Nodata from "./nodata";
import {
  columns,
  getoptions,
  defaultSortedBy,
} from "./table";
import {getUserRolePermission} from "../../helper/user";
import {CLIENT, STAFF_REVIEWER} from "../../constants/constants";
import {CLIENT_EDIT_STATUS} from "../../constants/applicationConstants";


const ApplicationList = React.memo(() => {
  const applications = useSelector(state=> state.applications.applicationsList)
  const isApplicationListLoading = useSelector((state) => state.applications.isApplicationListLoading);
  const applicationCount = useSelector((state) => state.applications.applicationCount);
  const dispatch= useDispatch();
  const userRoles = useSelector((state) => state.user.roles);

  useEffect(()=>{
    dispatch(setApplicationListLoader(true))
    dispatch(getAllApplications());
  },[dispatch]);

  useEffect(()=>{

  },[userRoles]);

  const isClientEdit = (applicationStatus) => {
    if (getUserRolePermission(userRoles, CLIENT)||getUserRolePermission(userRoles, STAFF_REVIEWER)) {
      return CLIENT_EDIT_STATUS.includes(applicationStatus)
    }else {
      return false;
    }
  };

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
  const listApplications = (applications) => {
    return applications.map(application => {
      application.isClientEdit = isClientEdit(application.applicationStatus);
      return application;
    });
  }

  return (
    applicationCount > 0 ? (
      <ToolkitProvider
        bootstrap4
        keyField="id"
        data={listApplications(applications)}
        columns={columns(applications)}
        search
      >
        {(props) => (
            <div className="container">
              <div className="main-header">
                <h3 className="application-head">
                <img className="solid-list-icon" src="/webfonts/fa-solid_list.svg" alt="back"/>
              <span className="application-text">Applications</span>
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
})


export default ApplicationList;

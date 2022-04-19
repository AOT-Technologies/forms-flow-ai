import React, {useEffect,useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { setApplicationListActivePage,setCountPerpage,setApplicationListLoader } from '../../actions/applicationActions';
import {getAllApplications,FilterApplications, getAllApplicationStatus} from "../../apiManager/services/applicationServices";
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
import Alert from 'react-bootstrap/Alert'
import overlayFactory from 'react-bootstrap-table2-overlay';
import { SpinnerSVG } from '../../containers/SpinnerSVG';

export const ApplicationList = React.memo(() => {
  const applications = useSelector(state=>state.applications.applicationsList);
  const countPerPage = useSelector(state=>state.applications.countPerPage);
  const applicationStatus = useSelector(state=>state.applications.applicationStatus);
  const isApplicationListLoading = useSelector(state=>state.applications.isApplicationListLoading);
  const applicationCount = useSelector(state=>state.applications.applicationCount);
  const dispatch= useDispatch();
  const userRoles = useSelector((state) => state.user.roles);
  const page = useSelector(state=>state.applications.activePage);
  const iserror = useSelector(state=>state.applications.iserror);
  const error = useSelector(state=>state.applications.error);
  const [filtermode,setfiltermode] = React.useState(false);

  const [lastModified,setLastModified] = React.useState(null);
  const [isLoading,setIsLoading] = React.useState(false);
  useEffect(()=>{
    setIsLoading(false)
  },[applications])
  useEffect(()=>{
      dispatch(getAllApplicationStatus());
  },[dispatch])

  const useNoRenderRef = (currentValue)=>{
    const ref = useRef(currentValue);
    ref.current = currentValue;
    return ref;
  }

  const countPerPageRef = useNoRenderRef(countPerPage);

  const currentPage = useNoRenderRef(page);

  useEffect(()=>{
    dispatch(getAllApplications(currentPage.current,countPerPageRef.current));
  },[dispatch,currentPage,countPerPageRef])

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
      </div>
    );
  };

  const handlePageChange = (type,newState) => {
    if(type === "filter"){
      setfiltermode(true)
    }
    else if(type==="pagination"){
      if(countPerPage > 5){
        dispatch(setApplicationListLoader(true))
      }else{
        setIsLoading(true)
      }
    }
    dispatch(setCountPerpage(newState.sizePerPage));
    dispatch(FilterApplications(newState));
    dispatch(setApplicationListActivePage(newState.page));
  };

  const listApplications = (applications) => {
    let totalApplications = applications.map(application => {
      application.isClientEdit = isClientEdit(application.applicationStatus);
      return application;
    });
    return totalApplications;
  }
  return (
    applicationCount > 0 || filtermode ? (
      <ToolkitProvider
        bootstrap4
        keyField="id"
        data={listApplications(applications)}
        columns={columns(applicationStatus,lastModified,setLastModified)}
        search
      >
        {(props) => (
            <div className="container">
              <div className="main-header">
                <h3 className="application-head">
                <i className="fa fa-list" aria-hidden="true"/>
              <span className="application-text">Applications</span>
                  <div className="col-md-1 application-count">({applicationCount})</div>
                </h3>
              </div>
              <br />
              <div>
                  <BootstrapTable
                    remote={ { pagination: true, filter: true, sort: true } }
                    loading={isLoading}
                    filter={filterFactory()}
                    pagination={paginationFactory(getoptions(applicationCount,page,countPerPage))}
                    onTableChange={handlePageChange}
                    filterPosition={'top'}
                    {...props.baseProps}
                    noDataIndication={() => !isLoading && getNoDataIndicationContent()}
                    defaultSorted={ defaultSortedBy }
                    overlay={ overlayFactory({ spinner: <SpinnerSVG/>, styles: { overlay: (base) => ({...base,background: 'rgba(255, 255, 255)',height:`${countPerPage > 5 ? '100% !important':'350px !important'}`,top:'65px'}) } }) }
                  />
              </div>
            </div>
          )}
      </ToolkitProvider>
    ) : iserror ? <Alert  variant={"danger"}>
        {error}
        </Alert>:
  (
      <Nodata />
    )

  )
})


export default ApplicationList;


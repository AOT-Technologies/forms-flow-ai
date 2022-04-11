import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import LoadingOverlay from "react-loading-overlay";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import {
  fetchApplicationAuditHistoryList
} from "../../apiManager/services/applicationAuditServices";
import {
  columns_history,
  getoptions,
  defaultSortedBy,
} from "./historyTable";
import Loading from "../../containers/Loading";
import Nodata from '../../components/Nodata';
import {setUpdateHistoryLoader} from "../../actions/taskApplicationHistoryActions";


const HistoryList = React.memo((props) => {
  const dispatch = useDispatch();
  const isHistoryListLoading = useSelector(state => state.taskAppHistory.isHistoryListLoading);
  const appHistory = useSelector(state => state.taskAppHistory.appHistory);
  const applicationId = props.applicationId;

  useEffect(()=>{
    dispatch(setUpdateHistoryLoader(true));
  },[dispatch]);

  useEffect(() => {
    if(applicationId && isHistoryListLoading) {
        dispatch(fetchApplicationAuditHistoryList(applicationId));
    }
  }, [applicationId, isHistoryListLoading, dispatch]);

  if(!applicationId){
    return <Nodata text={"No Application History found"} className={"div-no-application-list text-center"}/>
  }
  if (isHistoryListLoading) {
    return <Loading/>;
  }

  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-task">
        <label className="lbl-no-task"> No History found </label>
        <br/>
      </div>
    );
  };



  return (
    appHistory.length > 0 ? (
      <ToolkitProvider
        keyField="created"
        data={appHistory}
        columns={columns_history}
        search
      >
        {(props) => (
          <div className="container">
            <div className="main-header">
              <h3 className="task-head">
              <i className="fa fa-list" aria-hidden="true"/>
              &nbsp;Application History
              </h3>
            </div>
            <br/>
            <div>
              <LoadingOverlay
                active={isHistoryListLoading}
                spinner
                text="Loading..."
              >
                <BootstrapTable
                  loading={isHistoryListLoading}
                  filter={filterFactory()}
                  pagination={paginationFactory(getoptions(appHistory.length))}
                  defaultSorted={defaultSortedBy}
                  {...props.baseProps}
                  noDataIndication={() => getNoDataIndicationContent()}
                />
              </LoadingOverlay>
            </div>
          </div>
        )}
      </ToolkitProvider>
    ) : (
      <Nodata text={"No Application History found"} className={"div-no-application-list text-center"}/>
    )
  );
});

export default HistoryList;

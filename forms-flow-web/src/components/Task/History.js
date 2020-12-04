import React, {useEffect} from "react";
import { useDispatch, useSelector} from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import LoadingOverlay from "react-loading-overlay";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import {
  fetchApplicatinAuditHistoryList

} from "../../apiManager/services/applicationAuditServices";
import {
  columns_history,
  getoptions,
  defaultSortedBy,
} from "./historyTable";
import Loading from "../../containers/Loading";
import Nodata from "./nodata";
import { setUpdateHistoryLoader } from "../../actions/taskActions";

const HistoryList = () => {
  const dispatch = useDispatch();

  const application_id = useSelector(state => state.tasks.taskDetail.applicationId);
  const isTaskLoading = useSelector(state => state.tasks.isTaskLoading);
  const isHistoryListLoading = useSelector(state => state.tasks.isHistoryListLoading);
  const appHistory = useSelector(state => state.tasks.appHistory);
  const isLoading = useSelector(state => state.tasks.isLoading);

  useEffect(()=>{
    if(isHistoryListLoading || isTaskLoading){
      dispatch(
        fetchApplicatinAuditHistoryList(application_id,(err, res) => {
          if (!err) {
            dispatch(setUpdateHistoryLoader(false));
          }
        })
      )
    }
  },[application_id, isHistoryListLoading, isTaskLoading, dispatch]);

  if (isLoading) {
    return <Loading />;
  }

  const getNoDataIndicationContent = () => {
      return (
        <div className="div-no-task">
          <label className="lbl-no-task"> No tasks found </label>
          <br />
          <label className="lbl-no-task-desc">
            {" "}
            Please change the selected filters to view tasks{" "}
          </label>
          <br />
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
                <i className="fa fa-list-alt" />
                  &nbsp; Application History
                </h3>
               </div>
              <br />
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
        <Nodata />
      )
    );
};

export default HistoryList;

import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";

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
import {setUpdateHistoryLoader} from "../../actions/taskActions";


const HistoryList = () => {
  const dispatch = useDispatch();
  const {applicationId} = useParams();
  const isTaskLoading = useSelector(state => state.tasks.isTaskLoading);
  const isHistoryListLoading = useSelector(state => state.tasks.isHistoryListLoading);
  const appHistory = useSelector(state => state.tasks.appHistory);

  useEffect(() => {
    if (isHistoryListLoading || isTaskLoading) {
      dispatch(
        fetchApplicatinAuditHistoryList(applicationId, (err, res) => {
          if (!err) {
            dispatch(setUpdateHistoryLoader(false));
          }
        })
      )
    }
  }, [applicationId, isHistoryListLoading, isTaskLoading, dispatch]);

  if (isHistoryListLoading) {
    return <Loading/>;
  }

  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-task">
        <label className="lbl-no-task"> No tasks found </label>
        <br/>
        <label className="lbl-no-task-desc">
          {" "}
          Please change the selected filters to view tasks{" "}
        </label>
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
              <i class="fa fa-list-alt" alt="Task" aria-hidden="true"></i>
                Application History
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
      <Nodata/>
    )
  );
};

export default HistoryList;

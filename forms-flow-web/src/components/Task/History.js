import React, { Component } from "react";
import { connect } from "react-redux";
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
  clearFilter,
} from "./historyTable";
import Loading from "../../containers/Loading";
import Nodata from "./nodata";
import { setUpdateLoader } from "../../actions/taskActions";
const appHistory1=[
  {
      "applicationName": "Test 123",
      "applicationStatus": "new",
      "count": 1
  }
]
const List = class extends Component {
  UNSAFE_componentWillMount() {
    this.props.getTasks();
  }
  render() {
    const {
      isLoading,
      appHistory,
      isTaskUpdating,
    } = this.props;
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
          <label className="lbl-clear" onClick={clearFilter}>
            Clear all filters
          </label>
        </div>
      );
    };
    return (
        appHistory1.length > 0 ? (
        <ToolkitProvider
          keyField="id"
          data={appHistory1}
          columns={columns_history}
          search
        >
          {(props) => (
            <div className="container">
              <div className="main-header">
                <img src="/clipboard.svg" width="30" height="30" alt="task" />
                <h3 className="task-head">
                  History
                </h3>
               </div>
              <br />
              <div>
                <LoadingOverlay
                  active={isTaskUpdating}
                  spinner
                  text="Loading..."
                >
                  <BootstrapTable
                    loading={isTaskUpdating}
                    filter={filterFactory()}
                    pagination={paginationFactory(getoptions(props.tasksCount))}
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
    );
  }
};

function doLoaderUpdate() {
  return (dispatch, getState) => {
    let isLoading = getState().tasks.isTaskUpdating;
    if (isLoading) {
      dispatch(fetchApplicatinAuditHistoryList());
      dispatch(setUpdateLoader(false));
    }
  };
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.tasks.isLoading,
    appHistory: state.tasks.appHistory,
    tasksCount: state.tasks.tasksCount,
    userDetail: state.user.userDetail,
    isTaskUpdating: state.tasks.isTaskUpdating,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setLoader: dispatch(doLoaderUpdate),
    getTasks: () =>
      dispatch(
        fetchApplicatinAuditHistoryList((err, res) => {
          if (!err) {
            dispatch(setUpdateLoader(false));
          }
        })
      ),
      };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);

import React, { Component } from "react";
import { connect } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import LoadingOverlay from "react-loading-overlay";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import {
  fetchTaskList,
  claimTask,
  unClaimTask
} from "../../apiManager/services/taskServices";
import {
  columns,
  getoptions,
  defaultSortedBy,
  TaskSearch,
  clearFilter,
} from "./table";
import Loading from "../../containers/Loading";
import Nodata from "./nodata";
import { setUpdateLoader } from "../../actions/taskActions";
import moment from "moment";

const List = class extends Component {
  UNSAFE_componentWillMount() {
    this.props.getTasks();
  }
  render() {
    const {
      isLoading,
      tasks,
      userDetail,
      onClaim,
      onUnclaim,
      isTaskUpdating,
    } = this.props;
    const listTasks = (tasks) => {
      if (tasks.length > 0) {
        const data = tasks.map((task) => {
          return {
            id: task.id,
            applicationId: task.application_id || "--", //to do update to application/submission id
            taskTitle: task.name,
            // taskStatus: task.deleteReason === "completed" ? 'Completed' : task.assignee ? "In-Progress" : "New",//todo update ,
            taskStatus: task.task_status,
            taskAssignee: task.assignee,
            submittedBy: task.submitter_name || "---",
            submissionDate: moment(task.submission_date).format(
              "DD-MMM-YYYY HH:mm:ss"
            ),
            // dueDate: (task.due || "Set due date"),
            form: task.form_name || "---",
            userName: userDetail.preferred_username,
            deleteReason: task.deleteReason,
            assignToMeFn: onClaim,
            unAssignFn: onUnclaim,
          };
        });
        return data;
      } else {
        return [];
      }
    };
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
      // tasksCount > 0 ?
      tasks.length > 0 ? (
        <ToolkitProvider
          keyField="id"
          data={listTasks(tasks)}
          columns={columns}
          search
        >
          {(props) => (
            <div className="container">
              <div className="main-header">
                <img src="/clipboard.svg" width="30" height="30" alt="task" />
                <h3 className="task-head">
                  History
                  {/* <div className="col-md-1 task-count">({tasks.length})</div> */}
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
      dispatch(fetchTaskList());
      dispatch(setUpdateLoader(false));
    }
  };
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.tasks.isLoading,
    tasks: state.tasks.tasksList,
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
        fetchTaskList((err, res) => {
          if (!err) {
            dispatch(setUpdateLoader(false));
          }
        })
      ),
    onClaim: (id, userName, applicationId) => {
      dispatch(setUpdateLoader(true));
      dispatch(
              claimTask(id, userName, (err, res) => {
                if (!err) {
                    dispatch(
                      fetchTaskList((err, res) => {
                        if (!err) {
                          dispatch(setUpdateLoader(false));
                        }
                      })
                    );
                } else {
                  dispatch(setUpdateLoader(false));
                }
              })
            );
    },
    onUnclaim: (id) => {
      dispatch(setUpdateLoader(true));
            dispatch(
              unClaimTask(id, (err, res) => {
                if (!err) {
                  dispatch(
                    fetchTaskList((err, res) => {
                      if (!err) {
                        dispatch(setUpdateLoader(false));
                      }
                    })
                  );
                } else {
                  dispatch(setUpdateLoader(false));
                }
              })
            );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);

import React, {PureComponent} from "react";
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
import {getLocalDateTime} from "../../apiManager/services/formatterService";

const List = class extends PureComponent {
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
            applicationId: task.applicationId || "--", //to do update to application/submission id
            taskTitle: task.name,
            taskStatus: task.status === "completed" ? 'Completed' : "Active",
            taskAssignee: task.assignee,
            submittedBy: task.submitterName || "---",
            submissionDate: getLocalDateTime(task.submissionDate),
            // dueDate: (task.due || "Set due date"),
            form: task.formName || "---",
            userName: userDetail.preferred_username,
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
              <h3 className="task-head">
              <img src="/webfonts/fa-solid_list.svg" alt="back"/>
                &nbsp; Tasks
                  <div className="col-md-1 task-count">({tasks.length})</div>
                </h3>
                <div className="col-md-2 btn-group">
                  <TaskSearch
                    {...props.searchProps}
                    user={this.props.userDetail.preferred_username}
                  />
                </div>
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
                    filter={filterFactory({ afterFilter })}
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

const doLoaderUpdate = () => (dispatch, getState) => {
    let isLoading = getState().tasks.isTaskUpdating;
    if (isLoading) {
      dispatch(fetchTaskList());
      dispatch(setUpdateLoader(false));
    }
}
//TODO change the below logic
const afterFilter = (newResult, newFilters) => {
  const globalFilterValue=document.getElementById("taskfilter").value;
  const dropDown = document.getElementById("select-filter-column-taskStatus");
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

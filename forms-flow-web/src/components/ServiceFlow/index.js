import React, { useCallback, useEffect, useRef, useState } from "react";
import ServiceFlowTaskList from "./list/ServiceTaskList";
import ServiceTaskListView from "./list/ServiceTaskListView";
import ServiceTaskListViewDetails from "./list/ServiceTaskListViewDetails";

import ServiceFlowTaskDetails from "./details/ServiceTaskDetails";
import "./ServiceFlow.scss";
import {
  fetchBPMTaskCount,
  fetchFilterList,
  fetchProcessDefinitionList,
  fetchServiceTaskList,
  getBPMGroups,
  getBPMTaskDetail,
} from "../../apiManager/services/bpmTaskServices";
import { useDispatch, useSelector } from "react-redux";
import { ALL_TASKS } from "./constants/taskConstants";
import {
  reloadTaskFormSubmission,
  setBPMFilterLoader,
  setBPMFiltersAndCount,
  setBPMTaskDetailLoader,
  setFilterListParams,
  setIsAllTaskVariableExpand,
  setSelectedBPMFilter,
  setSelectedTaskID,
} from "../../actions/bpmTaskActions";
// import TaskSortSelectedList from "./list/sort/TaskSortSelectedList";
import SocketIOService from "../../services/SocketIOService";
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import { Route, Redirect, Switch } from "react-router-dom";
import { push, replace } from "connected-react-router";
import { BASE_ROUTE, MULTITENANCY_ENABLED } from "../../constants/constants";
import TaskHead from "../../containers/TaskHead";
import TaskSearchBarView from "./list/search/TaskSearchBarView";

export default React.memo(() => {
  const dispatch = useDispatch();
  const filterList = useSelector((state) => state.bpmTasks.filterList);
  const selectedFilterId = useSelector(
    (state) => state.bpmTasks.selectedFilter?.id || null
  );
  const bpmFiltersList = useSelector((state) => state.bpmTasks.filterList);
  const bpmTaskId = useSelector((state) => state.bpmTasks.taskId);
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const sortParams = useSelector(
    (state) => state.bpmTasks.filterListSortParams
  );
  const searchParams = useSelector(
    (state) => state.bpmTasks.filterListSearchParams
  );
  const listReqParams = useSelector((state) => state.bpmTasks.listReqParams);
  const currentUser = useSelector(
    (state) => state.user?.userDetail?.preferred_username || ""
  );
  const firstResult = useSelector((state) => state.bpmTasks.firstResult);
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const allTaskVariablesExpanded = useSelector(
    (state) => state.bpmTasks.allTaskVariablesExpand
  );
  const selectedFilterIdRef = useRef(selectedFilterId);
  const bpmTaskIdRef = useRef(bpmTaskId);
  const reqDataRef = useRef(reqData);
  const firstResultsRef = useRef(firstResult);
  const taskListRef = useRef(taskList);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const cardView = useSelector((state) => state.bpmTasks.viewType);
  const [expandedTasks, setExpandedTasks] = useState({});
  const redirectUrl = useRef(
    MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/"
  );

  let selectedBPMFilterParams;

  useEffect(() => {
    selectedFilterIdRef.current = selectedFilterId;
    bpmTaskIdRef.current = bpmTaskId;
    reqDataRef.current = reqData;
    firstResultsRef.current = firstResult;
    taskListRef.current = taskList;
    redirectUrl.current = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  });

// This useEffect will render if any changes happens in the depenendencies mentioned in the array and will update filter list params
  useEffect(() => {
    const reqParamData = {
      ...{ sorting: [...sortParams.sorting] },
      ...searchParams,
    };
    selectedBPMFilterParams = bpmFiltersList.find(
      (item) => item.id === selectedFilterId
    );
    if (selectedBPMFilterParams) {
      selectedBPMFilterParams = {
        ...selectedBPMFilterParams,
        criteria: {
          ...selectedBPMFilterParams?.criteria,
          ...reqParamData,
        },
      };
    }
    if (
      !isEqual(selectedBPMFilterParams, listReqParams) &&
      selectedBPMFilterParams
    ) {
      dispatch(setFilterListParams(cloneDeep(selectedBPMFilterParams)));
    }
  }, [selectedFilterId, searchParams, sortParams, dispatch, listReqParams]);

  useEffect(() => {
    dispatch(setBPMFilterLoader(true));
    dispatch(
      fetchFilterList((err, data) => {
        if (data) {
          fetchBPMTaskCount(data)
            .then((res) => {
              dispatch(setBPMFiltersAndCount(res.data));
            })
            .catch((err) => console.error(err))
            .finally(() => {
              dispatch(setBPMFilterLoader(false));
            });
        }
      })
    );
    dispatch(fetchProcessDefinitionList());
  }, [dispatch]);

  useEffect(() => {
    if (filterList?.length) {
      let filterSelected;
      if (filterList.length > 1) {
        filterSelected = filterList?.find(
          (filter) => filter.name === ALL_TASKS
        );
        if (!filterSelected) {
          filterSelected = filterList[0];
        }
      } else {
        filterSelected = filterList[0];
      }
      dispatch(setSelectedBPMFilter(filterSelected));
    }
  }, [filterList?.length]);

  const checkIfTaskIDExistsInList = (list, id) => {
    return list.some((task) => task.id === id);
  };

  const toggleAllTaskVariables = () => {
    const newExpandedState = !allTaskVariablesExpanded;
    const updatedExpandedTasks = {};

    taskList.forEach((task) => {
      if (task?._embedded?.variable?.length > 1) {
        updatedExpandedTasks[task.id] = newExpandedState;
      }
    });
    setExpandedTasks(updatedExpandedTasks);
    dispatch(setIsAllTaskVariableExpand(newExpandedState));
  };

  const SocketIOCallback = useCallback(
    (refreshedTaskId, forceReload, isUpdateEvent) => {
      const reqParamData = {
        ...{ sorting: [...sortParams.sorting] },
        ...searchParams,
      };

      const selectedBPMFilterParams = {
        ...selectedFilter,
        criteria: {
          ...selectedFilter?.criteria,
          ...reqParamData,
        },
      };

      if (forceReload) {
        dispatch(
          fetchServiceTaskList(
            selectedBPMFilterParams,
            refreshedTaskId,
            firstResultsRef.current
          )
        ); //Refreshes the Tasks
        if (bpmTaskIdRef.current && refreshedTaskId === bpmTaskIdRef.current) {
          dispatch(setBPMTaskDetailLoader(true));
          dispatch(setSelectedTaskID(null)); // unSelect the Task Selected
          dispatch(push(`${redirectUrl.current}task/`));
        }
      } else {
        if (selectedFilterIdRef.current) {
          if (isUpdateEvent) {
            /* Check if the taskId exists in the loaded Task List */
            if (
              checkIfTaskIDExistsInList(
                taskListRef.current,
                refreshedTaskId
              ) === true
            ) {
              dispatch(
                fetchServiceTaskList(
                  selectedBPMFilterParams,
                  null,
                  firstResultsRef.current
                )
              ); //Refreshes the Task
            }
          } else {
            dispatch(
              fetchServiceTaskList(
                selectedBPMFilterParams,
                null,
                firstResultsRef.current
              )
            ); //Refreshes the Task
          }
        }
        if (bpmTaskIdRef.current && refreshedTaskId === bpmTaskIdRef.current) {
          //Refreshes task if its selected
          dispatch(
            getBPMTaskDetail(bpmTaskIdRef.current, (err, resTask) => {
              // Should dispatch When task claimed user  is not the logged in User
              if (resTask?.assignee !== currentUser) {
                dispatch(reloadTaskFormSubmission(true));
              }
            })
          );
          dispatch(getBPMGroups(bpmTaskIdRef.current));
        }
      }
    },
    [dispatch, currentUser, selectedFilter, searchParams, sortParams]
  );

  useEffect(() => {
    if (!SocketIOService.isConnected()) {
      SocketIOService.connect((refreshedTaskId, forceReload, isUpdateEvent) =>
        SocketIOCallback(refreshedTaskId, forceReload, isUpdateEvent)
      );
    } else {
      SocketIOService.disconnect();
      SocketIOService.connect((refreshedTaskId, forceReload, isUpdateEvent) =>
        SocketIOCallback(refreshedTaskId, forceReload, isUpdateEvent)
      );
    }
    return () => {
      if (SocketIOService.isConnected()) SocketIOService.disconnect();
    };
  }, [SocketIOCallback, dispatch]);
  //Reset the path when the 'cardView' changes
  useEffect(() => {
    dispatch(replace(`${redirectUrl.current}task`));
  }, [cardView, dispatch]);

  return (
    <div>
      <TaskHead />
      <TaskSearchBarView
              toggleAllTaskVariables={toggleAllTaskVariables}
            />
      {cardView ? (
        <>
          <div className="row mx-0">
           
            <div className="col-12 px-0 col-md-4 col-xl-3">
              <section>
                {/* <header className="d-flex flex-wrap align-items-center p-2 bg-light shadow mb-2">
              <TaskSortSelectedList />
            </header> */}
                <ServiceFlowTaskList 
                  expandedTasks={expandedTasks}
                  setExpandedTasks={setExpandedTasks}/>
              </section>
            </div>
            <div className="col-12 pe-0 ps-md-5 col-md-8 col-xl-9  px-2 pe-md-0 py-5 py-md-0 border ">
              <Switch>
                <Route
                  path={`${BASE_ROUTE}task/:taskId?`}
                  component={ServiceFlowTaskDetails}
                ></Route>
                <Route path={`${BASE_ROUTE}task/:taskId/:notAvailable`}>
                  {" "}
                  <Redirect exact to="/404" />
                </Route>
              </Switch>
            </div>
          </div>
        </>
      ) : (
        <Switch>
          <Route
            exact
            path={`${BASE_ROUTE}task`}
            render={() => (
              <>
                <ServiceTaskListView
                  expandedTasks={expandedTasks}
                  setExpandedTasks={setExpandedTasks}
                />
              </>
            )}
          ></Route>
          <Route
            path={`${BASE_ROUTE}task/:taskId`}
            render={() => (
              <>
                <ServiceTaskListViewDetails />
              </>
            )}
          ></Route>
          <Route path={`${BASE_ROUTE}task/:taskId/:notAvailable`}>
            <Redirect exact to="/404" />
          </Route>
        </Switch>
      )}
    </div>
  );
});

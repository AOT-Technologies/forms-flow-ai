import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TaskSortSelectedList from "../sort/TaskSortSelectedList";
import TaskFilterListViewComponent from "./TaskFilterListViewComponent";
import "./TaskSearchBarListView.scss";
import { setSelectedTaskVariables } from "../../../../actions/bpmTaskActions";

const TaskSearchBarListView = React.memo(({ toggleAllTaskVariables, allTaskVariablesExpanded }) => {
  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );
  const tasksCount = useSelector((state) => state.bpmTasks.tasksCount);
  const [displayFilter, setDisplayFilter] = useState(false);
  const [SortOptions, setSortOptions] = useState(false);
  const [filterParams, setFilterParams] = useState({});
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const dispatch = useDispatch();
  useEffect(() => {
    let taskVaribles = {};
    taskList?.map((eachTask) => {
      eachTask?._embedded?.variable?.map((eachVariable) => {
        if (!(eachVariable.name in taskVaribles) && eachVariable.name != "applicationId")
          taskVaribles[eachVariable.name] = true;
      });
    });
    dispatch(setSelectedTaskVariables(taskVaribles));
  }, [taskList]);

  return (
    <>
      <div className="d-flex justify-content-end filter-sort-bar mt-1">
        <div className="sort-container task-filter-list-view">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setSortOptions(!SortOptions);
              setDisplayFilter(false);
            }}
          >
            Sort by
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              id="arrow-drop-down"
            >
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path d="M7 10l5 5 5-5H7z"></path>
            </svg>
          </button>
          {SortOptions && (
            <div className="clickable shadow border filter-list-view">
              <TaskSortSelectedList />
            </div>
          )}
        </div>
        <div className="Select-Task-Variables task-filter-list-view">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              toggleAllTaskVariables();
              setDisplayFilter(false); 
              setSortOptions(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-columns-gap mr-2"
              viewBox="0 0 16 16"
            >
              <path d="M6 1v3H1V1h5zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm14 12v3h-5v-3h5zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5zM6 8v7H1V8h5zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H1zm14-6v7h-5V1h5zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1h-5z" />
            </svg>
            {allTaskVariablesExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>

        <div className="filter-container-list task-filter-list-view">
          <button
            type="button"
            className="btn btn-outline-secondary "
            onClick={() => {
              setDisplayFilter(true); setSortOptions(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-filter mr-2"
              viewBox="0 0 16 16"
            >
              <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
            </svg>
            Search
          </button>

          {displayFilter && (
            <div className="clickable shadow border filter-list-view m-0 p-0">
              <TaskFilterListViewComponent
                totalTasks={isTaskListLoading ? 0 : tasksCount}
                setDisplayFilter={setDisplayFilter}
                filterParams={filterParams}
                setFilterParams={setFilterParams}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default TaskSearchBarListView;

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TaskSortSelectedList from "../sort/TaskSortSelectedList";
import TaskFilterComponent from "./TaskFilterComponent";
import "./TaskSearchBarListView.scss";
import { setSelectedTaskVariables } from "../../../../actions/bpmTaskActions";

const TaskSearchBarListView = React.memo(() => {
  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );
  const tasksCount = useSelector((state) => state.bpmTasks.tasksCount);

  const [displayFilter, setDisplayFilter] = useState(false);
  const [SortOptions, setSortOptions] = useState(false);
  const [selectTaskVariables, setSelectTaskVariables] = useState(false);
  const selectedTaskVariables = useSelector(
    (state) => state.bpmTasks.selectedTaskVariables
  );
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const dispatch = useDispatch();
  const taskvariable = useSelector(
    (state) => state.bpmTasks.selectedFilter?.properties?.variables || []
  );
  const getLabelOfSelectedVariable =(variable)=>{
    if(variable) return taskvariable.find(item => item?.name === variable)?.label;
   
  }
  useEffect(() => {
    let taskVaribles = {};
    taskList?.map((eachTask) => {
      eachTask?._embedded?.variable?.map((eachVariable) => {
        if (!(eachVariable.name in taskVaribles) && eachVariable.name!="applicationId")
          taskVaribles[eachVariable.name] = true;
      });
    });
    dispatch(setSelectedTaskVariables(taskVaribles));
  }, [taskList]);

  const alterTaskVariableSelection =(eachVariable)=>{
    let taskVaribles = {...selectedTaskVariables };
    taskVaribles[eachVariable] = !selectedTaskVariables[eachVariable]
    dispatch(setSelectedTaskVariables(taskVaribles));
  }
  return (
    <>
      <div className="d-flex justify-content-end filter-sort-bar">
        <div className="sort-container">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setSortOptions(!SortOptions);
              setSelectTaskVariables(false);
              setDisplayFilter(false);
            }}
          >
            Sort by
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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
              <div
                style={{ "text-align": "right" }}
                onClick={() => {
                  setSortOptions(false);
                }}
              >
                <u> close </u>{" "}
              </div>
            </div>
          )}
        </div>
        <div className="Select-Task-Variables">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setSelectTaskVariables(!selectTaskVariables);
              setDisplayFilter(false);
              setSortOptions(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-columns-gap"
              viewBox="0 0 16 16"
            >
              <path d="M6 1v3H1V1h5zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm14 12v3h-5v-3h5zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5zM6 8v7H1V8h5zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H1zm14-6v7h-5V1h5zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1h-5z" />
            </svg>
            Coloums
          </button>
          {selectTaskVariables && (
            <div className="clickable shadow border filter-list-view">
              {selectedTaskVariables &&
                Object?.keys(selectedTaskVariables)?.map((eachVariable) => {
                 return ( 
                 <div class="form-check" key={eachVariable} style={{wordBreak:"break-all"}} >
                 <input onChange={()=>{alterTaskVariableSelection(eachVariable)}} class="form-check-input"  type="checkbox" id={eachVariable} checked={selectedTaskVariables[eachVariable]} />
                 <label className="form-check-label" htmlFor={eachVariable}  >
                 {getLabelOfSelectedVariable(eachVariable)}
                 </label>
               </div>
                 )
                })}

              <div
                style={{ "textAlign": "right" }}
                onClick={() => {
                  setSelectTaskVariables(false);
                }}
              >
                <u> close </u>{" "}
              </div>
            </div>
          )}
        </div>

        <div className="filter-container-list">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setDisplayFilter(!displayFilter);
              setSortOptions(false);
              setSelectTaskVariables(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-filter"
              viewBox="0 0 16 16"
            >
              <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
            </svg>
            Filter
          </button>

          {displayFilter && (
            <div className="clickable shadow border filter-list-view">
              <TaskFilterComponent
                totalTasks={isTaskListLoading ? 0 : tasksCount}
              />
              <div
                style={{ "text-align": "right" }}
                onClick={() => {
                  setDisplayFilter(false);
                }}
              >
                <u> close </u>{" "}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default TaskSearchBarListView;

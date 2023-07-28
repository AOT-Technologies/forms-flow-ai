import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TaskSortSelectedList from "../sort/TaskSortSelectedList";
import TaskFilterComponent from "./TaskFilterComponent";
import "./TaskSearchBarListView.scss";
import { setSelectedTaskVariables } from "../../../../actions/bpmTaskActions";
import { fetchServiceTaskList } from "../../../../apiManager/services/bpmTaskServices";
import {
  setBPMTaskLoader,
} from "../../../../actions/bpmTaskActions";
// import { setFilterListParams } from "../../../../actions/bpmTaskActions";
const TaskSearchBarListView = React.memo(() => {
  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );
  const tasksCount = useSelector((state) => state.bpmTasks.tasksCount);

  const [displayFilter, setDisplayFilter] = useState(false);
  const [SortOptions, setSortOptions] = useState(false);
  const [selectTaskVariables, setSelectTaskVariables] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const [searchTaskInput, setSearchTaskInput] = useState("");

  const selectedTaskVariables = useSelector(
    (state) => state.bpmTasks.selectedTaskVariables
  );
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const firstResult = useSelector((state) => state.bpmTasks.firstResult);
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const dispatch = useDispatch();
  const taskvariable = useSelector(
    (state) => state.bpmTasks.selectedFilter?.properties?.variables || []
  );
  const getLabelOfSelectedVariable = (variable) => {
    if (variable) return taskvariable.find(item => item?.name === variable)?.label;
   
  };
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

  const alterTaskVariableSelection = (eachVariable) => {
    let taskVaribles = { ...selectedTaskVariables };
    taskVaribles[eachVariable] = !selectedTaskVariables[eachVariable];
    dispatch(setSelectedTaskVariables(taskVaribles));
  };
  
  const handleSearchTask = () => {
    if ( searchTaskInput !== "") {
    dispatch(setBPMTaskLoader(true));
    const searchValue = parseInt(searchTaskInput, 10);
    const reqDataparams = {
      sorting: [
        {
          sortBy: "created",
          sortOrder: "desc",
          label: {
            key: null,
            ref: null,
            props: {},
            _owner: null,
            _store: {}
          }
        }
      ],
      processVariables: [
        {
          name: "applicationId",
          operator: "eq",
          value: searchValue 
        }
      ],
      taskVariables: [],
      variableNamesIgnoreCase: false,
      variableValuesIgnoreCase: false
    };
    dispatch(fetchServiceTaskList(selectedFilter.id, firstResult, reqDataparams));
    }
  };
 
  const onClearSearch = () => {
    dispatch(setBPMTaskLoader(true));
    setSearchTaskInput("");
    
    dispatch(fetchServiceTaskList(selectedFilter.id, firstResult, reqData));
    setShowClearButton(false);
    
  };
  return (
    <>
      <div className="d-flex justify-content-end filter-sort-bar mt-1">
        <div className="searchbar-container mr-auto">
          <div className="input-group">
            
            <input
              type="search"
              value={searchTaskInput}
              onChange={(e) => {
                setShowClearButton(true);
                setSearchTaskInput(e.target.value);
                e.target.value === "" && handleSearchTask();
              }}
              className="form-control ml-1"
              placeholder="Search by id"
            />
            {showClearButton && (
              <button
                type="button"
                className="btn btn-outline-primary ml-2"
                onClick={() => onClearSearch()}
              >
                <i className="fa fa-times"></i>
              </button>
            )}
            <button
              type="button"
              className='btn btn-outline-primary ml-2'
              name="search-button"
              title="Click to search"
              onClick={() => handleSearchTask()}

            >
              <i className="fa fa-search" ></i>
            </button>
          </div>
        </div>
        <div className="sort-container task-filter-list-view">
          <button
            type="button"
            style={{ padding: "4px 8px" }}
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
        <div className="Select-Task-Variables task-filter-list-view">
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
              className="bi bi-columns-gap mr-2"
              viewBox="0 0 16 16"
            >
              <path d="M6 1v3H1V1h5zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm14 12v3h-5v-3h5zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5zM6 8v7H1V8h5zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H1zm14-6v7h-5V1h5zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1h-5z" />
            </svg>
            Columns
          </button>
          {selectTaskVariables && (
            <div className="clickable shadow border filter-list-view">
              {selectedTaskVariables &&
                Object?.keys(selectedTaskVariables)?.map((eachVariable) => {
                  return (
                    <div className="form-check pl-0" key={eachVariable} style={{ wordBreak: "break-all" }} >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list mr-2" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                      </svg>
                      <label className="form-check-label mr-4" htmlFor={eachVariable} style={{width :"200px"}} >
                        <strong>{getLabelOfSelectedVariable(eachVariable)}</strong>
                      </label>
                      <input onChange={() => { alterTaskVariableSelection(eachVariable); }} className="form-check-input" type="checkbox" id={eachVariable} checked={selectedTaskVariables[eachVariable]} />

                    </div>
                  );
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

        <div className="filter-container-list task-filter-list-view">
          <button
            type="button"
            className="btn btn-outline-secondary "
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
              className="bi bi-filter mr-2"
              viewBox="0 0 16 16"
            >
              <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
            </svg>
            Filter
          </button>

          {displayFilter && (
            <div className="clickable shadow border filter-list-view">
              <div className="search-filter">
                <div className="form-group">
                  <label htmlFor="assignee">Assignee:</label>
                  <input type="text" id="assignee" className="form-control" placeholder="Assignee" />
                </div>
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date:</label>
                  <input type="date" id="dueDate" className="form-control" placeholder="Due Date" />
                </div>
                <div className="form-group">
                  <label htmlFor="followupDate">Follow-up Date:</label>
                  <input type="date" id="followupDate" className="form-control" placeholder="Follow-up Date" />
                </div>
                <div className="form-group">
                  <label htmlFor="group">Group:</label>
                  <input type="text" id="group" className="form-control" placeholder="Group" />
                </div>
              </div>
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

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TaskSortSelectedList from "../sort/TaskSortSelectedList";
import TaskFilterViewComponent from "./TaskFilterViewComponent";
import "./TaskSearchBarListView.scss";
import { setSelectedTaskVariables } from "../../../../actions/bpmTaskActions";
import { useTranslation } from "react-i18next"; 
import {
  CustomButton,
} from "@formsflow/components";
import PropTypes from 'prop-types';

const TaskSearchBarListView = React.memo(({ toggleAllTaskVariables }) => {
  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );
  const tasksCount = useSelector((state) => state.bpmTasks.tasksCount);
  const [displayFilter, setDisplayFilter] = useState(false);
  const [sortOptions, setSortOptions] = useState(false);
  const [filterParams, setFilterParams] = useState({});
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const allTaskVariablesExpanded = useSelector((state) => state.bpmTasks.allTaskVariablesExpand);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const filterList = useSelector((state) => state.bpmTasks.filtersAndCount);
  const taskFilter = filterList?.find((task)=>task.id === selectedFilter.id );
  const taskFiltercount = taskFilter ? taskFilter.count : 0; //Current Task filter count
  const dispatch = useDispatch();
  const { t } = useTranslation();
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
  
  useEffect(() => {
    //The search fields get clear when switching the filter
    setFilterParams({});
  }, [selectedFilter]);

  return (
    <>
      {taskFiltercount > 0 && <div className="d-flex justify-content-end filter-sort-bar ">
        {
          tasksCount > 0 ? (
          <>
          <div className="sort-container task-filter-list-view">
          <CustomButton
            variant="secondary"
            size="md"
            label={t("Sort by")}
            onClick={() => {
              setSortOptions(!sortOptions);
              setDisplayFilter(false);
            }}
            dataTestId="task-sorby"
            ariaLabel={t("Task Sortby Button")}
            />
          {sortOptions && (
            <div className="clickable shadow border filter-list-view">
              <TaskSortSelectedList />
            </div>
          )}
           </div>
           <div className="Select-Task-Variables task-filter-list-view">
           <CustomButton
            variant="secondary"
            size="md"
            label={allTaskVariablesExpanded ? t("Collapse All") : t("Expand All")}
            onClick={() => {
              toggleAllTaskVariables();
              setDisplayFilter(false); 
              setSortOptions(false);
            }}
            dataTestId="task-expand"
            ariaLabel={t("Task Expand Button")}
            />
           </div>
            </>
          ) : null
        }
        <div className="filter-container-list task-filter-list-view">
        <CustomButton
            variant="secondary"
            size="md"
            label={t("Search")}
            onClick={() => {
              setDisplayFilter(true); setSortOptions(false);
            }}
            dataTestId="task-search"
            ariaLabel={t("Task Search Button")}
            />
          {displayFilter && (
            <div className="clickable shadow border filter-list-view m-0 p-0">
              <TaskFilterViewComponent
                totalTasks={isTaskListLoading ? 0 : tasksCount}
                setDisplayFilter={setDisplayFilter}
                filterParams={filterParams}
                setFilterParams={setFilterParams}
              />
            </div>
          )}
        </div>
      </div>}
    </>
  );
});

TaskSearchBarListView.propTypes = {
  toggleAllTaskVariables: PropTypes.func.isRequired,
};

export default TaskSearchBarListView;

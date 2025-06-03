import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
const TaskVariable = ({ expandedTasks, setExpandedTasks,taskId, variables }) => {
  let variableCount = 0;
  const taskvariable = useSelector(
    (state) => state.bpmTasks.selectedFilter?.variables || []
  );
  const allTaskVariablesExpanded = useSelector((state) => state.bpmTasks.allTaskVariablesExpand);
  const taskList = useSelector((state) => state.bpmTasks.tasksList);

  const vissibleAttributes = useSelector(
    (state) => state.bpmTasks.vissibleAttributes
  );

  useEffect(() => {
    // Initialize expandedTasks based on the initial value of allTaskVariablesExpanded
    const updatedExpandedTasks = {};
    if (allTaskVariablesExpanded) {
      taskList.forEach((task) => {
        updatedExpandedTasks[task.id] = allTaskVariablesExpanded;
      });
    }
    setExpandedTasks(updatedExpandedTasks);
  }, [allTaskVariablesExpanded, taskList]);

  //Toggle the expanded state of TaskVariables in single task
  const handleToggleTaskVariable = (taskId) => {
    setExpandedTasks((prevExpandedTasks) => ({
      ...prevExpandedTasks,
      [taskId]: !prevExpandedTasks[taskId],
    }));
  };

  const filterTaskVariables = (taskvariable)=>{
    if(!vissibleAttributes?.taskVisibleAttributes?.applicationId){
      return taskvariable = taskvariable.filter((item) => item.label !== 'Application Id');
    }
    return taskvariable;
  };

  const filterVariables = (variables)=>{
    if(!vissibleAttributes?.taskVisibleAttributes?.applicationId){
      return variables = variables.filter((item) => item.label !== 'applicationId');
    }
    return variables;
  };


  const rowReturn = (taskItem, data, index) => {  
    return (
      <Col xs={12} lg={6} key={index} className="mb-2">
        <div
          className="text-truncate"
          data-toggle="tooltip"
          data-placement="top"
          title={taskItem.label}
        >
          <span className="fw-bold mb-0 ">   
            {taskItem.label === "Application Id" ? "Submission Id" : taskItem.label}
          </span>
        </div>
        <div className="text-truncate ">
          <span
            data-toggle="tooltip"
            data-placement="top"
            title={data.value.toString()}
          >
            {data.value.toString()}
          </span>
        </div>
      </Col>
    );
  };

  return (
    <>
      <Row className=" mt-3 justify-content-between">
        {taskvariable &&
          filterTaskVariables(taskvariable)?.map((taskItem, index) => {
            const data = filterVariables(variables)?.find(
              (variableItem) => variableItem.name === taskItem.name
            );
            if (data && data.value !== (undefined || null)) {
              if (variableCount < 2) {
                variableCount++;
                return rowReturn(taskItem, data, index);
              } else if (expandedTasks[taskId]) {
                return rowReturn(taskItem, data, index);
              } else {
                return false;
              }
            } else {
              return false;
            }
          })}
      </Row>
      {taskvariable.length > 2 && variables.length > 2 && (
        <Row
          className="justify-content-center text-center"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleTaskVariable(taskId);
          }}
        >
          <i
            className="fa fa-angle-down"
            style={{
              transform: `${expandedTasks[taskId] ? "rotate(180deg)" : "rotate(0deg)"}`,
            }}
            aria-hidden="true"
          />
        </Row>
      )}
    </>
  );
};

export default TaskVariable;

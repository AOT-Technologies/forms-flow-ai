import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
import { getFormattedDateAndTime } from "../../../apiManager/services/formatterService";
const TaskVariable = ({ variables }) => {
  const [showMore, setShowMore] = useState(false);
  const taskvariable = useSelector((state)=>state.bpmTasks.selectedFilter?.properties?.variables||[]);
  const checkVlaueIsDateOrNOt=(value)=>{
    const isValueNumber = isNaN(value)
    if(isValueNumber){
      return getFormattedDateAndTime(value)!=='Invalid Date'?getFormattedDateAndTime(value):value
    }else{
      return value.toString()
    }
  }

  const rowReturn = (taskItem,data,index) => {
    return (
      <Col xs={12} lg={6} key={index} className="mb-2">
        <div className="text-truncate"  data-toggle="tooltip" data-placement="top" title= {taskItem.label} >
        <span style={{ margin: "0px",fontWeight:"bold"}}>
           {taskItem.label}
        </span>
        </div>
        <div className="text-truncate">
          <span
           data-toggle="tooltip" data-placement="top" title={
            checkVlaueIsDateOrNOt(data.value)
          }
          >
           {checkVlaueIsDateOrNOt(data.value)}
          </span>
        </div>
      </Col>
    );
  };

  const matchingVariableItem = (taskItem,index)=>{
    const data = variables.find(variableItem=> variableItem.name===taskItem.name)
    if(data&&data.value!==(undefined || null)){
    return rowReturn(taskItem,data,index) 
    }else{
      return false
    }
  }
  return (
    <>
      <Row className="task-row-3 mt-3 justify-content-between">

        {
          taskvariable&&taskvariable.map((taskItem,index)=>{
            if(index <= 1 && !showMore){
              return matchingVariableItem(taskItem,index)
            }else if(showMore){
              return matchingVariableItem(taskItem,index)
            }else{
              return false;
            }
          })
        }

        {/* {variables.map((item, index) => {
          if (index <= 1 && !showMore && item.value!==undefined) {
            return rowReturn(index, item);
          } else if (showMore && item.value!==(undefined || null) && taskVariableObject[item.name]) {
            return rowReturn(index, item);
          } else {
            return false;
          }
        })} */}
      </Row>
     {
       taskvariable.length> 2 && <Row className="justify-content-center">
       <i
         onClick={(e) => {
           e.stopPropagation();
           setShowMore(!showMore);
         }}
         className="fa fa-angle-down"
         style={{
           transform: `${showMore ? "rotate(180deg)" : "rotate(0deg)"}`,
         }}
         aria-hidden="true"
       />
     </Row>
     }
    </>
  );
};

export default TaskVariable;

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
import { getFormattedDateAndTime } from "../../../apiManager/services/formatterService";
const TaskVariable = ({ variables }) => {
  const [showMore, setShowMore] = useState(false);
  const taskVariableObject = useSelector((state)=>state.bpmTasks.selectedFilterAction)
  const checkVlaueIsDateOrNOt=(value)=>{
    const isValueNumber = isNaN(value)
    if(isValueNumber){
      return getFormattedDateAndTime(value)!=='Invalid Date'?getFormattedDateAndTime(value):value
    }else{
      return value
    }
  }

  const rowReturn = (index, item) => {
    return (
      <Col xs={12} lg={6} key={index} className="mb-2">
        <p style={{ margin: "0px" }}>
          <strong>{taskVariableObject[item.name]}</strong>
        </p>
        <div class="text-truncate">
          <span
           data-toggle="tooltip" data-placement="top" title={
            checkVlaueIsDateOrNOt(item.value)
          }
          >
           {checkVlaueIsDateOrNOt(item.value)}
          </span>
        </div>
      </Col>
    );
  };

  return (
    <>
      <Row className="task-row-3 mt-3 justify-content-between">
        {variables.map((item, index) => {
          if (index <= 1 && !showMore && item.value) {
            return rowReturn(index, item);
          } else if (showMore && item.value) {
            return rowReturn(index, item);
          } else {
            return false;
          }
        })}
      </Row>
     {
       variables.length> 2 && <Row className="justify-content-center">
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

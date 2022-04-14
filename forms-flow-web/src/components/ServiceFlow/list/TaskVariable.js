import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
const TaskVariable = ({ variables }) => {
  const [showMore, setShowMore] = useState(false);
  let variableCount=0;
  const taskvariable = useSelector((state)=>state.bpmTasks.selectedFilter?.properties?.variables||[]);
 

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
           data-toggle="tooltip" data-placement="top" title={data.value.toString()}
          >
           {data.value.toString()}
          </span>
        </div>
      </Col>
    );
  };

  return (
    <>
      <Row className="task-row-3 mt-3 justify-content-between">

        {
          taskvariable&&taskvariable.map((taskItem,index)=>{
            const data = variables.find(variableItem=> variableItem.name===taskItem.name)
            if(data&&data.value!==(undefined || null)){
              if(variableCount<2){
                variableCount++;
                return rowReturn(taskItem,data,index) 
              }else if(showMore){
                return rowReturn(taskItem,data,index) 
              }else{
                return false
              }
            }else{
              return false
            }
          })
        }
      </Row>
     {
       taskvariable.length> 2 && variables.length>2&& <Row className="justify-content-center" 
       onClick={(e) => {
        e.stopPropagation();
        setShowMore(!showMore);
      }}
       >
       <i
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

import React, {useState} from "react";
import {sortingList} from "../constants/taskConstants";
import TaskSort from "./TaskSort";

const TaskSortSelectedList = () => {
  const currentSortList =sortingList;

  const [sortList,updateSortList] = useState(currentSortList);
  const [showSortListDropdown,setShowSortListDropdown] = useState(false);
  const [showSortListDropdownIndex, setShowSortListDropdownIndex] = useState(null);

  const updateSortOrder = (index,sortOrder)=>{
   let updatedSortList = [...sortList];
   updatedSortList[index].sortOrder=sortOrder;
   updateSortList(updatedSortList)
  };

  const showSortList = (index)=>{
    if(index!==showSortListDropdownIndex){
      setShowSortListDropdownIndex(index)
    }else{
      setShowSortListDropdownIndex(null)
    }
  }

 const selectedSortList = () => {
   return sortList.map((sort, index)=>(
     <div className="mr-2">
       <span className="mr-1 font-weight-bold click-element" title="Remove sort">x</span>
       <span className="mr-1 click-element" onClick={()=>showSortList(index)}>
         {sort.label}{showSortListDropdownIndex===index?<TaskSort/>:null}
       </span>
       <span className="click-element">
         {sort.sortOrder==="asc"?<i className="fa fa-angle-up fa-lg font-weight-bold" title="Ascending" onClick={()=>updateSortOrder(index,"desc")}/>:
           <i title="Descending" onClick={()=>updateSortOrder(index,"asc")} className="fa fa-angle-down fa-lg font-weight-bold"/>}
       </span>
     </div>
   ))
  };

  return  (<div className="d-flex flex-wrap">
    {selectedSortList()}
    <div className="ml-1"> <i className="fa fa-plus fa-sm click-element" onClick={()=>setShowSortListDropdown(!showSortListDropdown)}/> {showSortListDropdown?<TaskSort/>:null}</div>
  </div>)
};

export default TaskSortSelectedList;


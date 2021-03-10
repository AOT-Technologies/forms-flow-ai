import React, {useEffect, useRef, useState} from "react";
import {sortingList} from "../constants/taskConstants";
import TaskSort from "./TaskSort";

const TaskSortSelectedList = () => {
  const createNode = useRef();

  const [sortList,updateSortList] = useState([]);
  const [showSortListDropdown,setShowSortListDropdown] = useState(false);
  const [showSortListDropdownIndex, setShowSortListDropdownIndex] = useState(null);

  const handleClick = e => {
    if (createNode.current.contains(e.target)) {
      return;
    };
    // outside click
    setShowSortListDropdown(null);
    setShowSortListDropdownIndex(null);
  };

  const addSort = (sort)=>{
    let updatedSortList = [...sortList];
    updatedSortList.push({...sort});
    updateSortList(updatedSortList);
    setShowSortListDropdown(null);
  }

  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);


  useEffect(() => {
    console.log("sortListChanged", sortList);
  }, [sortList]);

  const updateSortOrder = (index,sortOrder)=>{
   let updatedSortList = [...sortList];
   updatedSortList[index].sortOrder=sortOrder;
   updateSortList(updatedSortList);
  };


  const showSortList = (index)=>{
    if(index!==showSortListDropdownIndex){
      setShowSortListDropdownIndex(index)
    }else{
      setShowSortListDropdownIndex(null)
    }
  }

  const updateSort = (sort,index)=>{
    console.log("update",sortList, sort, index, sortingList);
    let updatedSortList = [...sortList];
    updatedSortList[index].label=sort.label;
    updateSortList(updatedSortList)
    setShowSortListDropdown(null);
    setShowSortListDropdownIndex(null);
  }

  const deleteSort = (sort,index)=>{
    let updatedSortList = [...sortList];
    updatedSortList.splice(index,1);
    updateSortList(updatedSortList)
  }

  const selectedSortList = () => {
   return sortList.map((sort, index)=>(
     <div className="mr-3" key={index}>
       {sortList.length>1 ?<span className="mr-1 font-weight-bold click-element" title="Remove sorting" onClick={()=>deleteSort(sort,index)}>x</span>:null}
       <span className="mr-1 click-element" onClick={()=>showSortList(index)}>
         {sort.label}{showSortListDropdownIndex===index?<TaskSort handleClick={(sortToUpdate)=>updateSort(sortToUpdate,index)} options={sortingList}/>:null}
       </span>
       <span className="click-element">
         {sort.sortOrder==="asc"?<i className="fa fa-angle-up fa-lg font-weight-bold" title="Ascending" onClick={()=>updateSortOrder(index,"desc")}/>:
           <i title="Descending" onClick={()=>updateSortOrder(index,"asc")} className="fa fa-angle-down fa-lg font-weight-bold"/>}
       </span>
     </div>
   ))
  };

  return  (<div className="d-flex flex-wrap" ref={createNode}>
    {selectedSortList()}
    <div className="ml-1">
      <i className="fa fa-plus fa-sm click-element" onClick={()=>setShowSortListDropdown(!showSortListDropdown)} title="Add sorting"/>
     {showSortListDropdown?<TaskSort handleClick={addSort} options={sortingList}/>:null}
    </div>
  </div>)
};

export default TaskSortSelectedList;


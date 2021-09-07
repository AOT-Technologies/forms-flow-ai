import React, {useEffect, useRef, useState} from "react";
import {sortingList} from "../../constants/taskConstants";
import TaskSort from "./TaskSort";
import {useDispatch, useSelector} from "react-redux";
import {setFilterListSortParams} from "../../../../actions/bpmTaskActions";

const getOptions = (options) => {
  const optionsArray = [];
  sortingList.forEach(sortOption=>{
    if(!options.some(option=>option.sortBy===sortOption.sortBy)){
      optionsArray.push({...sortOption})
    }
  });
  return optionsArray;
};


const TaskSortSelectedList = React.memo(() => {
  const createNode = useRef();
  const sortingData = useSelector(state => state.bpmTasks.filterListSortParams.sorting);
  const [sortList,updateSortList] = useState(sortingData);
  const [showSortListDropdown,setShowSortListDropdown] = useState(false);
  const [showSortListDropdownIndex, setShowSortListDropdownIndex] = useState(null);
  const [sortOptions,setSortOptions]=useState([]);
  const dispatch= useDispatch();

  const handleClick = e => {
    if (createNode?.current?.contains(e.target)) {
      return;
    }
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
    setSortOptions(getOptions(sortList));
    dispatch(setFilterListSortParams(sortList));
  }, [sortList, dispatch]);

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
    let updatedSortList = [...sortList];
    updatedSortList[index].label=sort.label;
    updatedSortList[index].sortBy=sort.sortBy;
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
         {sort.label}{showSortListDropdownIndex===index?<TaskSort handleClick={(sortToUpdate)=>updateSort(sortToUpdate,index)} options={sortOptions}/>:null}
       </span>
       <span className="click-element">
         {sort.sortOrder==="asc"?<i className="fa fa-angle-up fa-lg font-weight-bold" title="Ascending" onClick={()=>updateSortOrder(index,"desc")}/>:
           <i className="fa fa-angle-down fa-lg font-weight-bold" dat-title="Descending" onClick={()=>updateSortOrder(index,"asc")} />}
       </span>
     </div>
   ))
  };

  return  (<div className="d-flex flex-wrap" ref={createNode}>
    {selectedSortList()}
    {sortOptions.length?<div className="ml-1">
    <i className="fa fa-plus font-weight-bold"  dat-title="Add sorting" onClick={()=>setShowSortListDropdown(!showSortListDropdown)} />

     {showSortListDropdown?<TaskSort handleClick={addSort} options={sortOptions}/>:null}
    </div>:null}
  </div>)
});

export default TaskSortSelectedList;


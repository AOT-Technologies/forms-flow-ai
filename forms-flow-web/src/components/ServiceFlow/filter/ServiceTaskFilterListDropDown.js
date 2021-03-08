import React /*{useEffect}*/ from "react";
import {NavDropdown} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {setSelectedBPMFilter, setSelectedTaskID} from "../../../actions/bpmTaskActions";
/*import {Link} from "react-router-dom";*/


const ServiceFlowFilterListDropDown = () => {
  const dispatch= useDispatch();
  const filterList = useSelector(state=> state.bpmTasks.filterList);
  const isFilterLoading = useSelector(state=> state.bpmTasks.isFilterLoading);
  const selectedFilter=useSelector(state=>state.bpmTasks.selectedFilter);

  const changeFilterSelection = (filter)=>{
    dispatch(setSelectedBPMFilter(filter));
    dispatch(setSelectedTaskID(null));
  }


  const renderFilterList = () => {
    if (filterList.length) {
      return (
        <>
          {filterList.map((filter,index)=> (
              <NavDropdown.Item className={`clickable ml-1 ${filter?.id === selectedFilter?.id && "selected selected-tag"}` } key={index} onClick={()=>changeFilterSelection(filter)}>
                      {filter?.name} {`(${filter?.itemCount})`}
              </NavDropdown.Item>
            )
          )}
        </>
      )
    } else {
      return (
          <NavDropdown.Item className="not-selected mt-2 ml-1">
            <i className="fa fa-info-circle mr-2 mt-1"/>
            No Filters Found
          </NavDropdown.Item>
      )
    }
  }
  return  <>
    {isFilterLoading? <NavDropdown.Item>Loading...</NavDropdown.Item>: renderFilterList()}
    </>
};

export default ServiceFlowFilterListDropDown;

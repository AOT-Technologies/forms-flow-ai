import React, {useEffect, useState} from "react";
import { ListGroup, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {fetchFilterList} from "../../../apiManager/services/bpmTaskServices";
import {setBPMFilterLoader} from "../../../actions/bpmTaskActions";
import Loading from "../../../containers/Loading";


const ServiceFlowFilterList = () => {
  const dispatch= useDispatch();
  const filterList = useSelector(state=> state.bpmTasks.filterList);
  const isFilterLoading = useSelector(state=> state.bpmTasks.isFilterLoading);
  const [selectedFilter,setSelectedFilter]=useState({});

  useEffect(()=>{
    dispatch(setBPMFilterLoader(true))
    dispatch(fetchFilterList());
  },[dispatch]);

  useEffect(()=>{
    console.log("filters",filterList,isFilterLoading);
    setSelectedFilter(filterList[0]);
  },[filterList,isFilterLoading])

  const renderFilterList = () => {
    if (filterList.length) {
      return (
        <>
          {filterList.map((filter,index)=> (
              <div className={`clickable ml-3 ${filter?.id === selectedFilter?.id && "selected"}` } key={index} onClick={()=>{}}>
                <Row>
                  <div className="col-12">
                    <h4>
                      {filter?.name} {`(${filter?.itemCount})`}
                    </h4>
                  </div>
                </Row>
              </div>
            )
          )}
        </>
      )
    } else {
      return (
          <Row className="not-selected mt-2 ml-3">
            <i className="fa fa-info-circle mr-2 mt-1"/>
            No Filters Found
          </Row>
      )
    }
  }
  return  <>
    <ListGroup as="ul" className="service-task-list">
      {isFilterLoading? <Loading/>: renderFilterList()}
    </ListGroup>
    </>
};

export default ServiceFlowFilterList;

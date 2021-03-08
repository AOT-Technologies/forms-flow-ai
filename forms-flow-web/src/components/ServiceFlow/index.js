import React, {useEffect} from 'react'
import ServiceFlowTaskList from "./ServiceTaskList";
import ServiceFlowTaskDetails from "./details/ServiceTaskDetails";
import {Col, Container, Row} from "react-bootstrap";
import "./ServiceFlow.scss";
import {fetchFilterList, fetchProcessDefinitionList} from "../../apiManager/services/bpmTaskServices";
import {useDispatch, useSelector} from "react-redux";
import {setBPMFilterLoader, setSelectedBPMFilter} from "../../actions/bpmTaskActions";
import {ALL_TASKS} from "./constants/taskConstants";

const ServiceFlow = () => {
  const dispatch= useDispatch();
  const filterList = useSelector(state=> state.bpmTasks.filterList);
  const isFilterLoading = useSelector(state=> state.bpmTasks.isFilterLoading);
  const selectedFilter=useSelector(state=>state.bpmTasks.selectedFilter);

  useEffect(()=>{
    dispatch(setBPMFilterLoader(true));
    dispatch(fetchFilterList());
    dispatch(fetchProcessDefinitionList());
  },[dispatch]);

  useEffect(()=>{
    if(!isFilterLoading && filterList.length && !selectedFilter){
      let filterSelected;
      if(filterList.length>1){
        filterSelected = filterList.find(filter=> filter.name===ALL_TASKS);

       console.log("filter Selected",filterSelected);
        if(!filterSelected){
          filterSelected=filterList[0];
        }
      }else {
        filterSelected = filterList[0];
      }

      dispatch(setSelectedBPMFilter(filterSelected));
    }
  },[filterList,isFilterLoading,selectedFilter,dispatch]);

  return (
    <Container fluid id="main">
      <Row>
        <Col lg={3} xs={12} sm={12} md={4} xl={3}>
          <ServiceFlowTaskList/>
        </Col>
        <Col className="pl-0" lg={9} xs={12} sm={12} md={8} xl={9}>
          <ServiceFlowTaskDetails/>
        </Col>
      </Row>
    </Container>
  )
}

export default ServiceFlow;

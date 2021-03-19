import React, {useEffect} from 'react'
import ServiceFlowTaskList from "./ServiceTaskList";
import ServiceFlowTaskDetails from "./details/ServiceTaskDetails";
import {Col, Container, Row} from "react-bootstrap";
import "./ServiceFlow.scss";
import {fetchFilterList, fetchProcessDefinitionList, fetchUserList} from "../../apiManager/services/bpmTaskServices";
import {useDispatch, useSelector} from "react-redux";
import {setBPMFilterLoader, setSelectedBPMFilter} from "../../actions/bpmTaskActions";
import {ALL_TASKS} from "./constants/taskConstants";
import TaskSortSelectedList from "./filter/TaskSortSelectedList";

const ServiceFlow = () => {
  const dispatch= useDispatch();
  const filterList = useSelector(state=> state.bpmTasks.filterList);
  const isFilterLoading = useSelector(state=> state.bpmTasks.isFilterLoading);
  const selectedFilter=useSelector(state=>state.bpmTasks.selectedFilter);
  const taskList = useSelector(state => state.bpmTasks.tasksList);

  useEffect(()=>{
    dispatch(setBPMFilterLoader(true));
    dispatch(fetchFilterList());
    dispatch(fetchProcessDefinitionList());
    dispatch(fetchUserList());
  },[dispatch]);

  useEffect(()=>{
    if(!isFilterLoading && filterList.length && !selectedFilter){
      let filterSelected;
      if(filterList.length>1){
        filterSelected = filterList.find(filter=> filter.name===ALL_TASKS);
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
    <Container fluid id="main" className="pt-0">
      <Row>
        <Col lg={taskList.length?3:12} xs={12} sm={12} md={4} xl={taskList.length?3:12}>
          <section>
            <header className="task-section-top">
              <TaskSortSelectedList/>
            </header>
            <ServiceFlowTaskList/>
          </section>
        </Col>
        {taskList.length?<Col className="pl-0" lg={9} xs={12} sm={12} md={6} xl={9}>
          <ServiceFlowTaskDetails/>
        </Col>:null}
      </Row>
    </Container>
  )
}

export default ServiceFlow;

import React, {useCallback, useEffect, useRef} from 'react'
import ServiceFlowTaskList from "./list/ServiceTaskList";
import ServiceFlowTaskDetails from "./details/ServiceTaskDetails";
import {Col, Container, Row} from "react-bootstrap";
import "./ServiceFlow.scss";
import {
  fetchFilterList,
  fetchProcessDefinitionList,
  fetchServiceTaskList,
  getBPMGroups, getBPMTaskDetail
} from "../../apiManager/services/bpmTaskServices";
import {useDispatch, useSelector} from "react-redux";
import {ALL_TASKS} from "./constants/taskConstants";
import {
  setBPMFilterLoader,
  setBPMTaskDetailLoader,
  setFilterListParams,
  setSelectedBPMFilter, setSelectedTaskID
} from "../../actions/bpmTaskActions";
import TaskSortSelectedList from "./list/sort/TaskSortSelectedList";
import SocketIOService from "../../services/SocketIOService";
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import {Route} from "react-router-dom";
import {push} from "connected-react-router";

export default React.memo(() => {
  const dispatch= useDispatch();
  const filterList = useSelector(state=> state.bpmTasks.filterList);
  const isFilterLoading = useSelector(state=> state.bpmTasks.isFilterLoading);
  const selectedFilter=useSelector(state=>state.bpmTasks.selectedFilter);
  const selectedFilterId=useSelector(state=>state.bpmTasks.selectedFilter?.id||null);
  const bpmTaskId = useSelector(state => state.bpmTasks.taskId);
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const sortParams = useSelector((state) => state.bpmTasks.filterListSortParams);
  const searchParams = useSelector((state) => state.bpmTasks.filterListSearchParams);
  const listReqParams = useSelector((state) => state.bpmTasks.listReqParams);
  const selectedFilterIdRef=useRef(selectedFilterId);
  const bpmTaskIdRef=useRef(bpmTaskId);
  const reqDataRef=useRef(reqData);

  useEffect(()=>{
    selectedFilterIdRef.current=selectedFilterId;
    bpmTaskIdRef.current=bpmTaskId;
    reqDataRef.current=reqData;
  });

  useEffect(()=>{
    const reqParamData={...{sorting:[...sortParams.sorting]},...searchParams};
    if(!isEqual(reqParamData,listReqParams)){
      dispatch(setFilterListParams(cloneDeep(reqParamData)))
    }
  },[searchParams,sortParams,dispatch,listReqParams])

  useEffect(()=>{
    dispatch(setBPMFilterLoader(true));
    dispatch(fetchFilterList());
    dispatch(fetchProcessDefinitionList());
    // dispatch(fetchUserList());
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

  const SocketIOCallback = useCallback((refreshedTaskId, forceReload) => {
      if(forceReload){
        dispatch(fetchServiceTaskList(selectedFilterIdRef.current, reqDataRef.current)); //Refreshes the Tasks
        if(bpmTaskIdRef.current && refreshedTaskId===bpmTaskIdRef.current){
          dispatch(setBPMTaskDetailLoader(true));
          dispatch(setSelectedTaskID(null)); // unSelect the Task Selected
          dispatch(push(`/task/`));
        }
      } else{
        if(selectedFilterIdRef.current){
          dispatch(fetchServiceTaskList(selectedFilterIdRef.current, reqDataRef.current)); //Refreshes the Task
        }
        if(bpmTaskIdRef.current && refreshedTaskId===bpmTaskIdRef.current) { //Refreshes task if its selected
          dispatch(getBPMTaskDetail(bpmTaskIdRef.current));
          dispatch(getBPMGroups(bpmTaskIdRef.current))
        }
      }
    }
  ,[dispatch]);

  useEffect(()=>{
    if(!SocketIOService.isConnected()){
        SocketIOService.connect((refreshedTaskId, forceReload) => SocketIOCallback(refreshedTaskId, forceReload));
    }else{
        SocketIOService.disconnect();
        SocketIOService.connect((refreshedTaskId, forceReload) => SocketIOCallback(refreshedTaskId, forceReload));
    }
    return ()=>{
      if(SocketIOService.isConnected())
        SocketIOService.disconnect();
    }
  },[SocketIOCallback,dispatch]);


  return (
    <Container fluid id="main" className="pt-0">
      <Row>
        <Col lg={3} xs={12} sm={12} md={4} xl={3}>
          <section>
            <header className="task-section-top">
              <TaskSortSelectedList/>
            </header>
              <ServiceFlowTaskList/>
          </section>
        </Col>
        <Col className="pl-0" lg={9} xs={12} sm={12} md={8} xl={9}>
          <Route path={"/task/:taskId?"}><ServiceFlowTaskDetails/></Route>
          {/*<ServiceFlowTaskDetails/>*/}
        </Col>
      </Row>
    </Container>
  )
});

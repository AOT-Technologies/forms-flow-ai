import React, {useEffect} from 'react'
import ServiceFlowTaskList from "./ServiceTaskList";
import ServiceFlowTaskDetails from "./ServiceTaskDetails";
import {Col, Container, Row} from "react-bootstrap";
import {Route} from "react-router-dom";
import "./ServiceFlow.scss";
import {fetchProcessDefinitionList} from "../../apiManager/services/bpmTaskServices";
import {useDispatch} from "react-redux";

const ServiceFlow = () => {
  const dispatch= useDispatch();

  useEffect(()=>{
    dispatch(fetchProcessDefinitionList());
  },[dispatch]);

  return (
    <Container fluid id="main">
      <Row>
        <Col className="pl-0" lg={4} xs={12} sm={4} md={4} xl={4}>
          <ServiceFlowTaskList/>
        </Col>
        <Col className="pl-0" lg={8} xs={12} sm={8} md={8} xl={8}>
          <Route path={"/task/:bpmTaskId?"}><ServiceFlowTaskDetails/></Route>
        </Col>
      </Row>
    </Container>
  )
}

export default ServiceFlow;

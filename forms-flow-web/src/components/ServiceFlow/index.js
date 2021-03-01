import React, {useEffect} from 'react'
import ServiceFlowTaskList from "./ServiceTaskList";
import ServiceFlowTaskDetails from "./details/ServiceTaskDetails";
import {Col, Container, Row} from "react-bootstrap";
import {Route} from "react-router-dom";
import "./ServiceFlow.scss";
import {fetchProcessDefinitionList} from "../../apiManager/services/bpmTaskServices";
import {useDispatch} from "react-redux";
/*import ServiceFlowFilterList from "./filter/ServiceTaskFilterList";*/

const ServiceFlow = () => {
  const dispatch= useDispatch();

  useEffect(()=>{
    dispatch(fetchProcessDefinitionList());
  },[dispatch]);

  return (
    <Container fluid id="main">
      <Row>
{/*        <Col className="pl-0" lg={2} xs={12} sm={6} md={2} xl={2}>
          <ServiceFlowFilterList/>
        </Col>*/}
        <Col lg={3} xs={12} sm={6} md={4} xl={3}>
          <ServiceFlowTaskList/>
        </Col>
        <Col className="pl-0" lg={9} xs={12} sm={12} md={6} xl={9}>
          <Route path={"/task/:bpmTaskId?"}><ServiceFlowTaskDetails/></Route>
        </Col>
      </Row>
    </Container>
  )
}

export default ServiceFlow;

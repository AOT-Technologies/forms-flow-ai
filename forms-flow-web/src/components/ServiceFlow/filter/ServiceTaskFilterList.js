import React from "react";
import {ListGroup,Row } from "react-bootstrap";
/*import {useDispatch, useSelector} from "react-redux";
import {fetchServiceTaskList} from "../../apiManager/services/bpmTaskServices";
import {setBPMTaskLoader} from "../../actions/bpmTaskActions";
import Loading from "../../containers/Loading";
import {push} from "connected-react-router";
import moment from "moment";
import {
  getProcessDataFromList,
} from "../../apiManager/services/formatterService";
import TaskFilterComponent from "./filter/TaskFilterComponent";*/

const ServiceFlowFilterList = () => {
  return  <>
    <ListGroup as="ul" className="service-task-list">
      <div>
        <Row className="not-selected mt-2 ml-3">
          <i className="fa fa-info-circle mr-2 mt-1"/>
          No Filters Found
        </Row>
      </div>
    </ListGroup>
    </>
};

export default ServiceFlowFilterList;

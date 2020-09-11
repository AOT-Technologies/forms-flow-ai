import React, {useEffect} from "react";
import {Link, useParams} from "react-router-dom";
import {Tabs, Tab} from "react-bootstrap";
import {connect, useDispatch, useSelector} from "react-redux";
import { getSubmission, getForm} from "react-formio";
import Details from "./Details";
import {getTaskDetail} from "../../apiManager/services/taskServices";
import Loading from "../../containers/Loading";
import {setLoader} from "../../actions/taskActions";
import View from "../Form/Item/Submission/Item/View";
import {getProcessStatusList} from "../../apiManager/services/processServices";
import History from './History';

const ViewTask = (props) => {
    const {taskId} = useParams();
    const taskDetail = useSelector(state => state.tasks.taskDetail);
    const isLoading = useSelector(state => state.tasks.isLoading);
    const dispatch = useDispatch();
    const {getTask} = props;
    useEffect(()=>{
      if(taskDetail && taskDetail.id === taskId){
        dispatch(setLoader(false));
      }else{
        getTask(taskId);
      }
    },[taskId, dispatch, taskDetail, getTask])

    if (isLoading) {
      return <Loading/>;
    }
    return (
      <div className="container">
        <div className="main-header">
          <Link to="/task">
            <img src="/back.svg" alt="back"/>
          </Link>
          <span className="ml-3">
            <img src="/clipboard.svg" alt="Task"/>
          </span>
          <h3>
            <span className="task-head-details">Tasks /</span>{" "}
            {`${taskDetail.name}`}
          </h3>
        </div>
        <br/>
        <Tabs id="task-details" defaultActiveKey="details">
          <Tab eventKey="details" title="Details">
            <Details/>
          </Tab>
          <Tab eventKey="form" title="Form">
            <View page="task-detail"/>
          </Tab>
          <Tab eventKey="history" title="Application Audit">
            <History page="task-detail"/>
           </Tab>
        </Tabs>
      </div>
    );
}

const mapDispatchToProps = (dispatch) => {
  return {
    getTask: (id) => {
        dispatch(setLoader(true));
        dispatch(
          getTaskDetail(id, (err, res) => {
            if (!err) {
              if (res.submission_id && res.form_id) { //TODO update this as form and submission ids are not populated now
                dispatch(getForm("form", res.form_id));
                dispatch(
                  getSubmission("submission", res.submission_id, res.form_id)
                );
              }
              dispatch(
                getProcessStatusList(
                  res.processDefinitionKey,
                  res.taskDefinitionKey
                )
              );
            }
          })
        );
    }
  };
};

export default connect(null, mapDispatchToProps)(ViewTask);

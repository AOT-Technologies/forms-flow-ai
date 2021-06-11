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
import {getApplicationById, getApplicationFormDataByAppId} from "../../apiManager/services/applicationServices";
import History from '../Application/ApplicationHistory';
// import ProcessDiagram from "../BPMN/ProcessDiagram";
import ProcessDiagram from "../BPMN/ProcessDiagramHook";
import {getProcessActivities} from "../../apiManager/services/processServices";

const ViewTask = React.memo((props) => {
    const {taskId} = useParams();
    const taskDetail = useSelector(state => state.tasks.taskDetail);
    const applicationProcess = useSelector(state => state.applications.applicationProcess);
    const applicationId = taskDetail.applicationId;
    const isLoading = useSelector(state => state.tasks.isLoading);
    const dispatch = useDispatch();
    const {getTask} = props;
    // const processActivityList = useSelector(state => state.process.processActivityList);
    useEffect(()=>{
      if(taskDetail && taskDetail.id === taskId){
        dispatch(setLoader(false));
      }else{
        getTask(taskId);
      }
      taskDetail.processInstanceId && dispatch(
        getProcessActivities(taskDetail.processInstanceId)
      );
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
{/*          <span className="ml-3">
               <img src="/clipboard.svg" alt="Task"/>
             <i className="fa fa-list-alt" alt="Task"></i>

          </span>*/}
          <h3 className="ml-3">
            <span className="task-head-details"> <img src="/webfonts/fa-solid_list.svg" alt="back"/> Tasks /</span>{" "}
            {`${taskDetail.name}`}
          </h3>
        </div>
        <br/>
        <Tabs id="task-details" defaultActiveKey="details" mountOnEnter>
          <Tab eventKey="details" title="Details">
            <Details/>
          </Tab>
          <Tab eventKey="form" title="Form">
            <View page="task-detail"/>
          </Tab>
          <Tab eventKey="history" title="Application History">
            <History page="task-detail" applicationId={applicationId}/>
          </Tab>
          <Tab eventKey="process-diagram" title="Process Diagram">
            <ProcessDiagram
                process_key={applicationProcess.processKey}
                // markers={processActivityList}
            />
          </Tab>
        </Tabs>
      </div>
    );
})

const mapDispatchToProps = (dispatch) => {
  return {
    getTask: (id) => {
        dispatch(setLoader(true));
        dispatch(
          getTaskDetail(id, (err, res) => {
            if (!err) {
              dispatch(
                getProcessStatusList(
                  res.processDefinitionKey,
                  res.taskDefinitionKey
                )
              );

              dispatch(
                getApplicationFormDataByAppId(res.applicationId)
              );
              dispatch(getApplicationById(res.applicationId,(err,res)=>{
                if (!err) {
                  if (res.submissionId && res.formId) {
                    dispatch(getForm("form", res.formId));
                    dispatch(
                      getSubmission("submission", res.submissionId, res.formId)
                    );
                  }
                }
              }));
            }
          })
        );
    }
  };
};

export default connect(null, mapDispatchToProps)(ViewTask);

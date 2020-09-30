import React, {useEffect} from 'react'
import {Link,useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import startCase from "lodash/startCase";

import {Tabs, Tab} from "react-bootstrap";
import Details from "./Details";
import {getApplicationById,getApplicationFormDataByAppId} from "../../apiManager/services/applicationServices";
import {getProcessActivities} from "../../apiManager/services/processServices";
import Loading from "../../containers/Loading";
import {setApplicationDetailLoader} from "../../actions/applicationActions";
import ProcessDiagram from "../BPMN/ProcessDiagram";
import History from "./History";
import View from "../Form/Item/Submission/Item/View";
import {getForm, getSubmission} from "react-formio";

//import { useDispatch } from 'react-redux'

const ViewApplication = () => {
  const {applicationId} = useParams();
  const applicationDetail = useSelector(state=>state.applications.applicationDetail);
  const isApplicationDetailLoading = useSelector(state=>state.applications.isApplicationDetailLoading);
  const applicationProcess = useSelector(state => state.applications.applicationProcess);
  const dispatch= useDispatch();

  useEffect(()=>{
      dispatch(setApplicationDetailLoader(true));
      dispatch(getApplicationById(applicationId,(err,res)=>{
        if (!err) {
          if (res.submissionId && res.formId) {
            dispatch(getForm("form", res.formId));
            dispatch(
              getSubmission("submission", res.submissionId, res.formId)
            );
          }
          console.log('app detail processInstanceId>>'+res.processInstanceId)
          dispatch(
            getProcessActivities(res.processInstanceId)
          );
        }
      }));
      dispatch(getApplicationFormDataByAppId(applicationId));
  },[applicationId, dispatch]);

  if (isApplicationDetailLoading) {
    return <Loading/>;
  }
  console.log('applicationDetail.process_instance_id >>'+applicationDetail.processInstanceId);


  return (
    <div className="container">
      <div className="main-header">
        <Link to="/application">
          <img src="/back.svg" alt="back"/>
        </Link>
        <span className="ml-3">
          <img src="/clipboard.svg" alt="Task"/>
        </span>
        <h3>
          <span className="application-head-details">Applications /</span>{" "}
          {`${startCase(applicationDetail.applicationName)}`}
        </h3>
      </div>
      <br/>
      <Tabs id="application-details" defaultActiveKey="details">
        <Tab eventKey="details" title="Details">
          <Details application={applicationDetail}/>
        </Tab>
        <Tab eventKey="form" title="Form">
          <View page="application-detail"/>
        </Tab>
        <Tab eventKey="history" title="History">
            <History page="application-detail"/>
        </Tab>
        <Tab eventKey="process-diagram" title="Process Diagram">
        <ProcessDiagram
              process_key={applicationProcess.processKey}
          />
        </Tab>
      </Tabs>
    </div>

  );
}

export default ViewApplication ;
// export default connect(mapStateToProps)(Details);

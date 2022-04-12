import React, {useEffect} from 'react'
import {Link,useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import startCase from "lodash/startCase";

import {Tabs, Tab} from "react-bootstrap";
import Details from "./Details";
import {getApplicationById} from "../../apiManager/services/applicationServices";
import Loading from "../../containers/Loading";
import {setApplicationDetailLoader, setApplicationDetailStatusCode} from "../../actions/applicationActions";
import ProcessDiagram from "../BPMN/ProcessDiagramHook";
import History from "./ApplicationHistory";
import View from "../Form/Item/Submission/Item/View";
import {getForm, getSubmission} from "react-formio";
import NotFound from "../NotFound";

const ViewApplication = React.memo(() => {
  const {applicationId} = useParams();
  const applicationDetail = useSelector(state=>state.applications.applicationDetail);
  const applicationDetailStatusCode = useSelector(state=>state.applications.applicationDetailStatusCode)
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
        }
      }));

      return ()=>{
        dispatch(setApplicationDetailLoader(true));
        dispatch(setApplicationDetailStatusCode(''));
      }
  },[applicationId, dispatch]);

  if (isApplicationDetailLoading) {
    return <Loading/>;
  }

  if(Object.keys(applicationDetail).length===0 && applicationDetailStatusCode===403) {
    return <NotFound errorMessage="Access Denied" errorCode={applicationDetailStatusCode} />
  }

  return (
    <div className="container">
      <div className="main-header">
        <Link to="/application">
        <i className="fa fa-chevron-left fa-lg" />
        </Link>
        <h3 className="ml-3">
          <span className="application-head-details"><i className="fa fa-list-alt" aria-hidden="true"/>&nbsp; Applications /</span>{" "}
          {`${startCase(applicationDetail.applicationName)}`}
        </h3>
      </div>
      <br/>
      <Tabs id="application-details" defaultActiveKey="details" mountOnEnter>
        <Tab eventKey="details" title="Details">
          <Details application={applicationDetail}/>
        </Tab>
        <Tab eventKey="form" title="Form">
          <View page="application-detail"/>
        </Tab>
        <Tab eventKey="history" title="History">
            <History page="application-detail" applicationId={applicationId}/>
        </Tab>
        <Tab eventKey="process-diagram" title="Process Diagram">
            <ProcessDiagram
              process_key={applicationProcess.processKey}
              processInstanceId={applicationDetail.processInstanceId}
            />
        </Tab>
      </Tabs>
    </div>

  );
})

export default ViewApplication;

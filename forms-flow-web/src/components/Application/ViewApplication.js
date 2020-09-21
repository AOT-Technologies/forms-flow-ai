import React, {useEffect} from 'react'
import {Link,useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Tabs, Tab} from "react-bootstrap";
import Details from "./Details";
import {getApplicationById} from "../../apiManager/services/applicationServices";
import Loading from "../../containers/Loading";
import {setApplicationDetailLoader} from "../../actions/applicationActions";

//import { useDispatch } from 'react-redux'

const ViewApplication = () => {
  const {applicationId} = useParams();
  const applicationDetail = useSelector(state=>state.applications.applicationDetail);
  const isApplicationDetailLoading = useSelector(state=>state.applications.isApplicationDetailLoading);
  const dispatch= useDispatch();

  useEffect(()=>{
      dispatch(setApplicationDetailLoader(true));
      dispatch(getApplicationById(applicationId));
  },[applicationId, dispatch]);


  console.log('applicationDetail '+applicationDetail);
  console.log('isApplicationDetailLoading '+isApplicationDetailLoading);


  if (isApplicationDetailLoading) {
    return <Loading/>;
  }

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
          {`${applicationDetail.applicationName}`}
        </h3>
      </div>
      <br/>
      <Tabs id="application-details" defaultActiveKey="details">
        <Tab eventKey="details" title="Details">
          <Details application={applicationDetail}/>
        </Tab>
        {/* <Tab eventKey="history" title="Application History">
          <History page="application-detail"/>
        </Tab> */}
        <Tab eventKey="process-diagram" title="Process Diagram">
          {/* <ProcessDiagram
              process_key={applicationDetail.processKey}
          /> */}
        </Tab>
      </Tabs>
    </div>

  );
}

export default ViewApplication ;
// export default connect(mapStateToProps)(Details);

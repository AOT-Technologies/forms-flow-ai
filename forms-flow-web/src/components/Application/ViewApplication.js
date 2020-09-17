import React, {useEffect} from 'react'
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
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
    dispatch(setApplicationDetailLoader(true))
    dispatch(getApplicationById(applicationId));
    console.log("here to get Application details",applicationId);
  },[applicationId, dispatch]);


  if (isApplicationDetailLoading) {
    return (
      <Loading/>
    );
  }


  console.log("application Detail", applicationDetail); //TODO check request and response
  return (
    <div>TODO application Detail --> {applicationId}</div>
  )
}

export default ViewApplication;

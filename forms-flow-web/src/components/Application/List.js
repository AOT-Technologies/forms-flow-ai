import React, {useEffect} from 'react'

import {useDispatch, useSelector} from 'react-redux'
import {getAllApplications} from "../../apiManager/services/applicationServices";
import {setApplicationListLoader} from "../../actions/applicationActions";
import Loading from "../../containers/Loading";

const ApplicationList = () => {
  const applications = useSelector(state=> state.applications.applicationsList)
  const isApplicationsListLoading = useSelector((state) => state.applications.isApplicationListLoading);
  const dispatch= useDispatch();

  useEffect(()=>{
    dispatch(setApplicationListLoader(true))
    dispatch(getAllApplications());
  },[dispatch]);

  if (isApplicationsListLoading) {
    return (
      <Loading/>
    );
  }

  console.log("here to get all Applications data", applications);

  return (
   <div>TODO application LIst</div>
  )
}

export default ApplicationList;

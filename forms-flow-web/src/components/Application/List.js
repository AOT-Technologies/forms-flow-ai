import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
 
  setApplicationLoading,
} from "../../actions/applicationActions";
import {
  getAllApplications,
  getAllApplicationStatus,
} from "../../apiManager/services/applicationServices";
import Loading from "../../containers/Loading";  
import { 
  DRAFT_ENABLED,
} from "../../constants/constants"; 
import Head from "../../containers/Head";
 import ApplicationTable from "./ApplicationTable";
 import {navigateToSubmitFormsListing, navigateToSubmitFormsDraft, navigateToSubmitFormsApplication} from "../../helper/routerHelper";

export const ApplicationList = React.memo(() => {
 
  const isApplicationListLoading = useSelector(
    (state) => state.applications.isApplicationListLoading
  );
  const sortOrder = useSelector((state) => state.applications?.sortOrder);
  const sortBy = useSelector((state) => state.applications?.sortBy);
  const pageNo = useSelector((state) => state.applications?.activePage);
  const limit = useSelector((state) => state.applications?.countPerPage);
  const searchParams = useSelector((state) => state.applications?.searchParams);
  const dispatch = useDispatch();
   const page = useSelector((state) => state.applications.activePage);
  const userRoles = useSelector((state) => state.user.roles || []);
  const create_submissions = userRoles.includes("create_submissions");
  const tenantId = useSelector((state) => state.tenants?.tenantId);

  useEffect(() => {
    dispatch(getAllApplicationStatus());
  }, [dispatch]);

  useEffect(() => {
    let filterParams = {
      ...searchParams,
      page:pageNo,
      limit:limit,
      sortOrder,
      sortBy
  };
    dispatch(getAllApplications(filterParams,() => {
        dispatch(setApplicationLoading(false));
    }));
  }, [page,limit,sortBy,sortOrder,searchParams]);

 

  if (isApplicationListLoading) {
    return <Loading />;
  } 
  const navigateToSubmitFormsRoute = () => {
    navigateToSubmitFormsListing(dispatch,tenantId);
  };

  const navigateToSubmitFormsDraftRoute = () => {
    navigateToSubmitFormsDraft(dispatch,tenantId);
  };
  const navigateToSubmitFormsApplicationRoute = () => {
    navigateToSubmitFormsApplication(dispatch,tenantId);
  };
  const headerList = () => {
    const headers = [
      {
        name: "Submissions",
        onClick: () => navigateToSubmitFormsApplicationRoute(),
      }
    ];

    if (create_submissions) {
      headers.unshift({
        name: "All Forms",
        onClick: () => navigateToSubmitFormsRoute(),
      });
      headers.push({
        name: "Drafts",
        onClick: () => navigateToSubmitFormsDraftRoute(),
      });
    }

    return headers;
  };

  let headOptions = headerList();


  if (!DRAFT_ENABLED) {
    headOptions.pop();
  }

  return (
    <>
    <Head items={headOptions} page="Submissions" />
    <ApplicationTable/>
    </>
  );
});

export default ApplicationList;

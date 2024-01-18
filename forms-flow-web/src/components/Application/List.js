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
  MULTITENANCY_ENABLED, 
} from "../../constants/constants"; 
 
import Head from "../../containers/Head";
import { push } from "connected-react-router";
 import ApplicationTable from "./ApplicationTable";

export const ApplicationList = React.memo(() => {
 
  const isApplicationListLoading = useSelector(
    (state) => state.applications.isApplicationListLoading
  );
  const sortOrder = useSelector((state) => state.applications?.sortOrder);
  const sortBy = useSelector((state) => state.applications?.sortBy);
  const pageNo = useSelector((state) => state.applications?.activePage);
  const limit = useSelector((state) => state.applications?.countPerPage);
  const totalApplications = useSelector((state) => state.applications?.applicationCount);
  const searchParams = useSelector((state) => state.applications?.searchParams);
  const draftCount = useSelector((state) => state.draft.draftCount);
  const dispatch = useDispatch();
   const page = useSelector((state) => state.applications.activePage);
   const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/"; 
 

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
 

  const headerList = () => {
    return [
      {
        name: "Submissions",
        count: totalApplications,
        onClick: () => dispatch(push(`${redirectUrl}application`)),
        icon: "list",
      },
      {
        name: "Drafts",
        count: draftCount,
        onClick: () => dispatch(push(`${redirectUrl}draft`)),
        icon: "edit",
      },
    ];
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

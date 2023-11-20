/* eslint-disable */
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import {
  setApplicationListActivePage,
  setCountPerpage,
  setApplicationListLoader,
} from "../../actions/applicationActions";
import {
  getAllApplications,
  FilterApplications,
  getAllApplicationStatus,
} from "../../apiManager/services/applicationServices";
import Loading from "../../containers/Loading";
import Nodata from "./nodata";
import { useTranslation } from "react-i18next";
import { columns, getoptions, defaultSortedBy } from "./table";
import { getUserRolePermission } from "../../helper/user";
import {
  CLIENT,
  DRAFT_ENABLED,
  MULTITENANCY_ENABLED,
  STAFF_REVIEWER,
} from "../../constants/constants";
import { CLIENT_EDIT_STATUS } from "../../constants/applicationConstants";
import Alert from "react-bootstrap/Alert";
import { Translation } from "react-i18next";

import overlayFactory from "react-bootstrap-table2-overlay";
import { SpinnerSVG } from "../../containers/SpinnerSVG";
import Head from "../../containers/Head";
import { push } from "connected-react-router";
import isValiResourceId from "../../helper/regExp/validResourceId";
import ApplicationTable from "./ApplicationTable";

export const ApplicationList = React.memo(() => {
  const { t } = useTranslation();
  const applications = useSelector(
    (state) => state.applications.applicationsList
  );
  const countPerPage = useSelector((state) => state.applications.countPerPage);
  const applicationStatus = useSelector(
    (state) => state.applications.applicationStatus
  );
  const isApplicationListLoading = useSelector(
    (state) => state.applications.isApplicationListLoading
  );
  const pageNo = useSelector((state) => state.applications?.activePage);
  const limit = useSelector((state) => state.applications?.countPerPage);
  const totalApplications = useSelector((state) => state.applications?.applicationCount);
  const draftCount = useSelector((state) => state.draft.draftCount);
  const dispatch = useDispatch();
  const userRoles = useSelector((state) => state.user.roles);
  const page = useSelector((state) => state.applications.activePage);
  const iserror = useSelector((state) => state.applications.iserror);
  const error = useSelector((state) => state.applications.error);
  const [filtermode, setfiltermode] = React.useState(false);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [lastModified, setLastModified] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [invalidFilters, setInvalidFilters] = React.useState({});

  useEffect(() => {
    setIsLoading(false);
  }, [applications]);

  useEffect(() => {
    dispatch(getAllApplicationStatus());
  }, [dispatch]);

  useEffect(() => {
    let filterParams = {
      applicationName:null,
      id:null,
      applicationStatus:null,
      page:pageNo,
      limit:limit,
  };
    dispatch(getAllApplications(filterParams));
  }, [page,limit]);

  const isClientEdit = (applicationStatus) => {
    if (
      getUserRolePermission(userRoles, CLIENT) ||
      getUserRolePermission(userRoles, STAFF_REVIEWER)
    ) {
      return CLIENT_EDIT_STATUS.includes(applicationStatus);
    } else {
      return false;
    }
  };

  if (isApplicationListLoading) {
    return <Loading />;
  }
  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-application">
        <label className="lbl-no-application">
          {" "}
          <Translation>{(t) => t("No submissions found")}</Translation>{" "}
        </label>
        <br />
        <label className="lbl-no-application-desc">
          {" "}
          <Translation>
            {(t) =>
              t("Please change the selected filters to view submissions")
            }
          </Translation>
        </label>
        <br />
      </div>
    );
  };
  const validateFilters = (newState) => {
    if (
      newState.filters?.id?.filterVal &&
      !isValiResourceId(newState.filters?.id?.filterVal)
    ) {
      return setInvalidFilters({ ...invalidFilters, APPLICATION_ID: true });
    } else {
      return setInvalidFilters({ ...invalidFilters, APPLICATION_ID: false });
    }
  };

  const handlePageChange = (type, newState) => {
    validateFilters(newState);
    if (type === "filter") {
      setfiltermode(true);
    } else if (type === "pagination") {
      if (countPerPage > 5) {
        dispatch(setApplicationListLoader(true));
      } else {
        setIsLoading(true);
      }
    }
    dispatch(setCountPerpage(newState.sizePerPage));
    // dispatch(FilterApplications(newState));
    dispatch(setApplicationListActivePage(newState.page));
  };

  const listApplications = (applications) => {
    let totalApplications = applications.map((application) => {
      application.isClientEdit = isClientEdit(application.applicationStatus);
      return application;
    });
    return totalApplications;
  };

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

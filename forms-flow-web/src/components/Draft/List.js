/* eslint-disable */

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import Loading from "../../containers/Loading";
import Nodata from "../Application/nodata";
import { useTranslation } from "react-i18next";
import { columns, getoptions } from "./table";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import Alert from "react-bootstrap/Alert";
import { Translation } from "react-i18next";
import overlayFactory from "react-bootstrap-table2-overlay";
import { SpinnerSVG } from "../../containers/SpinnerSVG";
import {
  fetchDrafts,
  FilterDrafts,
} from "../../apiManager/services/draftService";
import Confirm from "../../containers/Confirm";
import Head from "../../containers/Head";
import { push } from "connected-react-router";
import {
  setDraftListLoader,
  setDraftListActivePage,
  setCountPerpage,
  setDraftDelete,
} from "../../actions/draftActions";
import { deleteDraftbyId } from "../../apiManager/services/draftService";
import isValiResourceId from "../../helper/regExp/validResourceId";
import { toast } from "react-toastify";
import { textTruncate } from "../../helper/helper";
import DraftTable from "./DraftTable";

export const DraftList = React.memo(() => {
  const { t } = useTranslation();
  const drafts = useSelector((state) => state.draft.draftList);
  const countPerPage = useSelector((state) => state.draft.countPerPage);
  const draftDelete = useSelector((state) => state.draft?.draftDelete);

  const isDraftListLoading = useSelector(
    (state) => state.draft.isDraftListLoading
  );
  const applicationCount = useSelector(
    (state) => state.applications.applicationCount
  );
  const draftCount = useSelector((state) => state.draft.draftCount);
  const dispatch = useDispatch();
  const page = useSelector((state) => state.draft.activePage);
  const iserror = useSelector(
    (state) => state.draft.draftSubmissionError.error
  );
  const error = useSelector(
    (state) => state.draft.draftSubmissionError.message
  );
  const [filtermode, setfiltermode] = React.useState(false);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [lastModified, setLastModified] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [invalidFilters, setInvalidFilters] = React.useState({});
  let filterParams = {
      draftName: null,
      id: null,
      modified: null,
      page: page,
      limit: countPerPage,
  }

  useEffect(() => {
    setIsLoading(false);
  }, [drafts]);

  const useNoRenderRef = (currentValue) => {
    const ref = useRef(currentValue);
    ref.current = currentValue;
    return ref;
  };

  const countPerPageRef = useNoRenderRef(countPerPage);

  const currentPage = useNoRenderRef(page);

  useEffect(() => {
    dispatch(fetchDrafts(filterParams));
  }, [dispatch, page, countPerPage]);

  const onYes = (e) => {
    e.currentTarget.disabled = true;
    deleteDraftbyId(draftDelete.draftId)
      .then(() => {
        toast.success(t("Draft Deleted Successfully"));
        dispatch(fetchDrafts(filterParams));
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        dispatch(
          setDraftDelete({
            modalOpen: false,
            draftId: null,
            draftName: "",
          })
        );
      });
  };

  const onNo = () => {
    dispatch(
      setDraftDelete({
        modalOpen: false,
        draftId: null,
        draftName: "",
      })
    );
  };
  if (isDraftListLoading) {
    return <Loading />;
  }

  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-application">
        <label className="lbl-no-application">
          {" "}
          <Translation>{(t) => t("No drafts found")}</Translation>{" "}
        </label>
        <br />
        {filtermode && (
          <label className="lbl-no-application-desc">
            {" "}
            <Translation>
              {(t) => t("Please change the selected filters to view drafts")}
            </Translation>
          </label>
        )}
        <br />
      </div>
    );
  };
  const validateFilters = (newState) => {
    if (
      newState.filters?.id?.filterVal &&
      !isValiResourceId(newState.filters?.id?.filterVal)
    ) {
      return setInvalidFilters({ ...invalidFilters, DRAFT_ID: true });
    } else {
      return setInvalidFilters({ ...invalidFilters, DRAFT_ID: false });
    }
  };
  // const handlePageChange = (type, newState) => {
  //   validateFilters(newState);
  //   if (type === "filter") {
  //     setfiltermode(true);
  //   } else if (type === "pagination") {
  //     if (countPerPage > 5) {
  //       dispatch(setDraftListLoader(true));
  //     } else {
  //       setIsLoading(true);
  //     }
  //   }
  //   dispatch(setCountPerpage(newState.sizePerPage));
  //   dispatch(FilterDrafts(newState));
  //   dispatch(setDraftListActivePage(newState.page));
  // };
  const headerList = () => {
    return [
      {
        name: "Submissions",
        count: applicationCount,
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


  const getNoData = () => {
    if (iserror) {
      return <Alert variant={"danger"}>{error}</Alert>;
    } else {
      return <Nodata text={t("No Drafts Found")} />;
    }
  };

  return (
    <>
     <Confirm
            modalOpen={draftDelete.modalOpen}
            message=
            {
            <div>
            {t("Are you sure you wish to delete the draft")}
            <span style={{ fontWeight: "bold" }} > {draftDelete.draftName.includes(' ') ? draftDelete.draftName : textTruncate(50,40,draftDelete.draftName)} </span>
            {t("with ID")} 
            <span style={{fontWeight: "bold"}}> {draftDelete.draftId}</span>?
            </div>
            }
            
            onNo={() => onNo()}
            onYes={onYes}
          />
    <Head items={headOptions} page="Drafts" />
    <DraftTable />
    </>
  );
});

export default DraftList;

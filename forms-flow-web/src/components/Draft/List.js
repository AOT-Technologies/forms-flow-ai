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
import Head from "../../containers/Head";
import { push } from "connected-react-router";
import {
  setDraftListLoader,
  setDraftListActivePage,
  setCountPerpage,
} from "../../actions/draftActions";

export const DraftList = React.memo(() => {
  const { t } = useTranslation();
  const drafts = useSelector((state) => state.draft.draftList);
  const countPerPage = useSelector((state) => state.draft.countPerPage);

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
    dispatch(fetchDrafts(currentPage.current, countPerPageRef.current));
  }, [dispatch, currentPage, countPerPageRef]);

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

  const handlePageChange = (type, newState) => {
    if (type === "filter") {
      setfiltermode(true);
    } else if (type === "pagination") {
      if (countPerPage > 5) {
        dispatch(setDraftListLoader(true));
      } else {
        setIsLoading(true);
      }
    }
    dispatch(setCountPerpage(newState.sizePerPage));
    dispatch(FilterDrafts(newState));
    dispatch(setDraftListActivePage(newState.page));
  };
  const headerList = () => {
    return [
      {
        name: "Applications",
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

  const getNoData = () => {
    if (iserror) {
      return <Alert variant={"danger"}>{error}</Alert>;
    } else {
      return <Nodata text={t("No Drafts Found")} />;
    }
  };

  return (
    <ToolkitProvider
      bootstrap4
      keyField="id"
      data={drafts}
      columns={columns(lastModified, setLastModified, t, redirectUrl)}
      search
    >
      {(props) => (
        <div className="container" role="definition">
          <Head items={headerList()} page="Drafts" />
          <br />
          <div>
            {drafts?.length > 0 || filtermode ? (
              <BootstrapTable
                remote={{ pagination: true, filter: true, sort: true }}
                loading={isLoading}
                filter={filterFactory()}
                pagination={paginationFactory(
                  getoptions(draftCount, page, countPerPage)
                )}
                onTableChange={handlePageChange}
                filterPosition={"top"}
                {...props.baseProps}
                noDataIndication={() =>
                  !isLoading && getNoDataIndicationContent()
                }
                overlay={overlayFactory({
                  spinner: <SpinnerSVG />,
                  styles: {
                    overlay: (base) => ({
                      ...base,
                      background: "rgba(255, 255, 255)",
                      height: `${
                        countPerPage > 5
                          ? "100% !important"
                          : "350px !important"
                      }`,
                      top: "65px",
                    }),
                  },
                })}
              />
            ) : (
              getNoData()
            )}
          </div>
        </div>
      )}
    </ToolkitProvider>
  );
});

export default DraftList;

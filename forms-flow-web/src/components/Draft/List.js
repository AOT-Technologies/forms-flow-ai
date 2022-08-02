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

import Loading from "../../containers/Loading";
import Nodata from "../Nodata";
import { useTranslation } from "react-i18next";
import { columns, getoptions, defaultSortedBy } from "./table";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import Alert from "react-bootstrap/Alert";
import { Translation } from "react-i18next";

import overlayFactory from "react-bootstrap-table2-overlay";
import { SpinnerSVG } from "../../containers/SpinnerSVG";
import { fetchDrafts } from "../../apiManager/services/draftService";

export const DraftList = React.memo(() => {
  const { t } = useTranslation();
  const drafts = useSelector((state) => state.draft.draftList);
  const countPerPage = useSelector((state) => state.draft.countPerPage);

  const isDraftListLoading = useSelector(
    (state) => state.draft.isDraftListLoading
  );
  const draftCount = useSelector((state) => state.draft.draftCount);
  const dispatch = useDispatch();
  const page = useSelector((state) => state.draft.activePage);
  const iserror = useSelector((state) => state.draft.iserror);
  const error = useSelector((state) => state.draft.error);
  // const [filtermode, setfiltermode] = React.useState(false);
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
        <label className="lbl-no-application-desc">
          {" "}
          <Translation>
            {(t) => t("Please change the selected filters to view drafts")}
          </Translation>
        </label>
        <br />
      </div>
    );
  };

  const handlePageChange = (type, newState) => {
    if (type === "filter") {
      //TODO
      // setfiltermode(true);
      console.log("filter");
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

  return drafts.length > 0 ? (
    <ToolkitProvider
      bootstrap4
      keyField="id"
      data={drafts}
      columns={columns(lastModified, setLastModified, t, redirectUrl)}
      search
    >
      {(props) => (
        <div className="container" role="definition">
          <div className="main-header">
            <h3 className="application-head">
              <i
                className="fa fa-list"
                style={{ marginTop: "5px" }}
                aria-hidden="true"
              />
              <span className="application-text">
                <Translation>{(t) => t("Drafts")}</Translation>
              </span>
              <div className="col-md-1 application-count" role="contentinfo">
                ({draftCount})
              </div>
            </h3>
          </div>
          <br />
          <div>
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
              defaultSorted={defaultSortedBy}
              overlay={overlayFactory({
                spinner: <SpinnerSVG />,
                styles: {
                  overlay: (base) => ({
                    ...base,
                    background: "rgba(255, 255, 255)",
                    height: `${
                      countPerPage > 5 ? "100% !important" : "350px !important"
                    }`,
                    top: "65px",
                  }),
                },
              })}
            />
          </div>
        </div>
      )}
    </ToolkitProvider>
  ) : iserror ? (
    <Alert variant={"danger"}>{error}</Alert>
  ) : (
    <Nodata />
  );
});

export default DraftList;

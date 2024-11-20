import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  setBPMFormLimit,
  setBPMFormListPage,
  setBPMFormListSort,
  setBpmFormSearch,
} from "../../../actions/formActions";
import {
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import { Translation } from "react-i18next";
import { sanitize } from "dompurify";
import { TableFooter } from "@formsflow/components";

function ClientTable() {

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = bpmForms?.forms || [];
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const [search, setSearch] = useState(useSelector((state) => state.bpmForms.searchText) || "");
  const isAscending = sortOrder === "asc" ? true : false;

  const searchText = useSelector((state) => state.bpmForms.searchText);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [openIndex, setOpenIndex] = useState(null);

  const pageOptions = [
    { text: "5", value: 5 },
    { text: "25", value: 25 },
    { text: "50", value: 50 },
    { text: "100", value: 100 },
    { text: "All", value: totalForms },
  ];

  const updateSort = (updatedSort) => {
    resetIndex();
    dispatch(setBPMFormListSort(updatedSort));
    dispatch(setBPMFormListPage(1));
  };

  useEffect(() => {
    setSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setBpmFormSearch(""));
    }
  }, [search]);


  const submitNewForm = (formId) => {
    dispatch(push(`${redirectUrl}form/${formId}`));
  };

  const resetIndex = () => {
    if (openIndex !== null) setOpenIndex(null);
  };

  const handlePageChange = (page) => {
    resetIndex();
    dispatch(setBPMFormListPage(page));
  };

  const onSizePerPageChange = (newLimit) => {
    dispatch(setBPMFormLimit(newLimit));
    dispatch(setBPMFormListPage(1));
  };

  const noDataFound = () => {
    return (
      <tbody>
        <tr>
          <td colSpan="3">
            <div
              className="d-flex align-items-center justify-content-center clientForm-table-col flex-column w-100">
              <h3>{t("No forms found")}</h3>
              <p>{t("Please change the selected filters to view Forms")}</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  };

  const extractContent = (htmlContent) => {
    const sanitizedHtml = sanitize(htmlContent);
    const tempElement = document.createElement("div");
    tempElement.innerHTML = sanitizedHtml;

    // Get the text content from the sanitized HTML
    const textContent = tempElement.textContent || tempElement.innerText || "";
    return textContent;
  };


  return (
    <>
      <LoadingOverlay active={searchFormLoading} spinner text={t("Loading...")}>
        <div className="min-height-400">
        <div className="table-responsive" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <table className="table custom-table table-responsive-sm">
            <thead>
              <tr>
                <th className="col-3">
                  <div className="d-flex align-items-center">
                    <span>{t("Form Title")}</span>
                    <span>
                      {isAscending ? (
                        <i 
                          data-testid="form-desc-sort-icon"
                          className="fa fa-sort-alpha-asc ms-2 cursor-pointer fs-16"
                          onClick={() => {
                            updateSort("desc");
                          }}
                          data-toggle="tooltip"
                          title={t("Descending")}>
                        </i>
                      ) : (
                        <i
                          data-testid="form-asc-sort-icon"
                          className="fa fa-sort-alpha-desc ms-2 cursor-pointer fs-16"
                          onClick={() => {
                            updateSort("asc");
                          }}
                          data-toggle="tooltip"
                          title={t("Ascending")}>
                        </i>
                      )}
                    </span>
                  </div>
                </th>
                <th className="col-7">{t("Form Description")}</th>
                <th className="col-2">
                </th>
              </tr>
            </thead>
            {formData?.length ? (
              <tbody>
                {formData.map((e, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td className="col-3">
                        <span
                          data-testid={`form-title-${e._id}`}
                          className="ms-2 mt-2"
                        >
                          {e.title}
                        </span>
                      </td>
                      <td
                        data-testid={`form-description${e._id}`}  className="col-7">
                        {extractContent(e.description)}
                      </td>

                      <td className="col-2">
                        <button
                          data-testid={`form-submit-button-${e._id}`}
                          className="btn btn-primary"
                          onClick={() => submitNewForm(e._id)}
                        >
                          <Translation>{(t) => t("Submit New")}</Translation>
                        </button>
                      </td>
                    </tr>

                    {index === openIndex && (
                      <tr>
                        <td colSpan={10}>
                          <div className="bg-white p-3">
                            <h4>
                              <strong>{t("Form Description")}</strong>
                            </h4>

                            <div
                              className="form-description-p-tag "
                              dangerouslySetInnerHTML={{
                                __html: sanitize(e?.description, {
                                  ADD_ATTR: ["target"],
                                }),
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            ) : !searchFormLoading ? (
              noDataFound()
            ) : (
              null
            )}
          </table>
          </div>
        </div>
      </LoadingOverlay>

      {formData.length ? (
        <table className="table">
          <tfoot>
          <TableFooter
            limit={limit}
            activePage={pageNo}
            totalCount={totalForms}
            handlePageChange={handlePageChange}
            onLimitChange={onSizePerPageChange}
            pageOptions={pageOptions}
          />
          </tfoot>
          
        </table>
      ) : null}
    </>
  );
}

export default ClientTable;

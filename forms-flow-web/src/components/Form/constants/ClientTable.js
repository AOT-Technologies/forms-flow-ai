import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import {
  setBPMFormLimit,
  setBPMFormListPage,
  // setBPMFormListSort,
  setBpmFormSearch,
  setBpmFormSort,
} from "../../../actions/formActions";
import {
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import { useTranslation, Translation } from "react-i18next";
import DOMPurify  from "dompurify";
import { TableFooter } from "@formsflow/components";
import LoadingOverlay from "react-loading-overlay-ts";
import SortableHeader from '../../CustomComponents/SortableHeader';

function ClientTable() {

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = bpmForms?.forms || [];
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const [currentFormSort ,setCurrentFormSort] = useState({
  activeKey: "formName",
  formName: { sortOrder: "asc" },
  });
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const [search, setSearch] = useState(useSelector((state) => state.bpmForms.searchText) || "");

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

  const handleSort = (key) => {
    setCurrentFormSort((prevSort) => {
      const newSortOrder = prevSort[key].sortOrder === "asc" ? "desc" : "asc";
      return {
        ...prevSort,
        activeKey: key,
        [key]: { sortOrder: newSortOrder },
      };
    });
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
  useEffect(() => {
    dispatch(setBpmFormSort(currentFormSort));
  },[currentFormSort,dispatch]);

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
    const sanitizedHtml = DOMPurify.sanitize(htmlContent);
    const tempElement = document.createElement("div");
    tempElement.innerHTML = sanitizedHtml;

    // Get the text content from the sanitized HTML
    const textContent = tempElement.textContent || tempElement.innerText || "";
    return textContent;
  };


  return (

     <LoadingOverlay
        active={searchFormLoading}
        spinner
        text={t("Loading...")}
      >
      <div>
        <div className="table-responsive" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <table className="table custom-table table-responsive-sm">
            <thead>
              <tr>
                <th className="col-3">
                  <SortableHeader
                   columnKey="formName"
                   title="Form Name"
                   currentSort={currentFormSort}
                   handleSort={handleSort}
                   className="d-flex justify-content-start"
                  />
                </th>
                <th className="col-7">{t("Form Description")}</th>
                <th className="col-2"></th>
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
                          className="mt-2"
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
                                __html: DOMPurify.sanitize(e?.description, {
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
            </LoadingOverlay>

  );
}

export default ClientTable;

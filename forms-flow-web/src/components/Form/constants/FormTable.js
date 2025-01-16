import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import {
  setBPMFormLimit,
  setBPMFormListPage,
                   
  setBpmFormSort,
} from "../../../actions/formActions";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import { Translation } from "react-i18next";
import {
  resetFormProcessData
} from "../../../apiManager/services/processServices";
import { HelperServices } from "@formsflow/service";
import { CustomButton,TableFooter ,NoDataFound } from "@formsflow/components";
import userRoles from "../../../constants/permissions";
import SortableHeader from '../../CustomComponents/SortableHeader';

function FormTable() {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = (() => bpmForms.forms)() || [];
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const formsort = useSelector((state) => state.bpmForms.sort);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const isApplicationCountLoading = useSelector((state) => state.process.isApplicationCountLoading);
  const { createDesigns, viewDesigns } = userRoles();
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [currentFormSort ,setCurrentFormSort] = useState(formsort);  

  const pageOptions = [
    {
      text: "5",
      value: 5,
    },
    {
      text: "25",
      value: 25,
    },
    {
      text: "50",
      value: 50,
    },
    {
      text: "100",
      value: 100,
    },
    {
      text: "All",
      value: totalForms,
    },
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
    dispatch(setBpmFormSort(currentFormSort));
  },[currentFormSort,dispatch]);
  
  const viewOrEditForm = (formId, path) => {
    dispatch(resetFormProcessData());
    dispatch(push(`${redirectUrl}formflow/${formId}/${path}`));
  };

  const handlePageChange = (page) => {
    dispatch(setBPMFormListPage(page));
  };

  const onSizePerPageChange = (limit) => {
    dispatch(setBPMFormLimit(limit));
    dispatch(setBPMFormListPage(1));
  };

  const stripHtml = (html) => {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const toggleRow = (index) => {
    setExpandedRowIndex(prevIndex => prevIndex === index ? null : index);
  };


  return (
    <>
      <LoadingOverlay active={searchFormLoading || isApplicationCountLoading} spinner text={t("Loading...")}>
        <div className="min-height-400">
          <div className="custom-tables-wrapper">
            <table className="table custom-tables table-responsive-sm">
              <thead className="table-header">
                <tr>
                  <th className="w-20">
                  <SortableHeader
                   columnKey="formName"
                   title="Form Name"
                   currentSort={currentFormSort}
                   handleSort={handleSort}
                   className="gap-2"
                  />
                  </th>
                  <th className="w-30" scope="col">{t("Description")}</th>
                  <th className="w-13" scope="col">
                  <SortableHeader 
                  columnKey="modified"
                  title="Last Edited"
                  currentSort={currentFormSort}
                  handleSort={handleSort}
                  className="gap-2"
                  />
                  </th>
                  <th className="w-13" scope="col">
                  <SortableHeader 
                    columnKey="visibility"
                    title="Visibility"
                    currentSort={currentFormSort}
                    handleSort={handleSort} 
                    className="gap-2"/>                
                  </th>
                  <th className="w-12" scope="col" colSpan="4">
                    <SortableHeader 
                    columnKey="status"
                    title="Status"
                    currentSort={currentFormSort}
                    handleSort={handleSort} 
                    className="gap-2"/>
                  </th>
                  <th className="w-12" colSpan="4" aria-label="Search Forms by form title"></th>
                </tr>
              </thead>

              {formData?.length ? (
                <tbody>
                  {formData?.map((e, index) => {
                    const isExpanded = expandedRowIndex === index;

                    return (
                      <tr key={index}>
                        <td className="w-20">
                          <div className="d-flex">
                            <span className="text-container">{e.title}</span>
                          </div>
                        </td>
                        <td className="w-30 cursor-pointer">
                          <span className={isExpanded ? "text-container-expand" : "text-container"}
                            onClick={() => toggleRow(index)}>
                            {stripHtml(e.description ? e.description : "")}
                          </span>
                        </td>
                        <td className="w-13">{HelperServices?.getLocaldate(e.modified)}</td>
                        <td className="w-13">{e.anonymous ? t("Public") : t("Private")}</td>
                        <td className="w-12">
                          <span data-testid={`form-status-${e._id}`} className="d-flex align-items-center">
                            {e.status === "active" ? (
                                <span className="status-live"></span>
                            ) : (
                              <span className="status-draft"></span>
                            )}
                            {e.status === "active" ? t("Live") : t("Draft")}
                          </span>
                        </td>
                        <td className="w-12 text-end">
                        {(createDesigns || viewDesigns) && (
                          <CustomButton
                            variant="secondary"
                            size="sm"
                            label={
                              <Translation>
                                {(t) => t(createDesigns ? "Edit" : "View")}
                              </Translation>
                            }
                            onClick={() => viewOrEditForm(e._id, 'edit')}
                            className=""
                            dataTestid={`form-${createDesigns ? 'edit' : 'view'}-button-${e._id}`}
                            ariaLabel={`${createDesigns ? "Edit" : "View"} Form Button`}
                          /> )}
                        </td>
                      </tr>
                    );
                  })}
                    {formData.length ? (
                      <TableFooter
                      limit={limit}
                      activePage={pageNo}
                      totalCount={totalForms}
                      handlePageChange={handlePageChange}
                      onLimitChange={onSizePerPageChange}
                      pageOptions={pageOptions}
                    />
                    ) : (
                      <td colSpan={3}></td>
                    )}
                </tbody>
              ) : !searchFormLoading ? (
                <NoDataFound />
              ) : null}
            </table>
          </div>
        </div>
      </LoadingOverlay>
    </>
  );
}

export default FormTable;

import React, {  useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import {
  setBPMFormLimit,
  setBPMFormListPage,

  setBpmFormSort,
} from "../../../actions/formActions";
import {
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import {
  resetFormProcessData
} from "../../../apiManager/services/processServices";
import { HelperServices } from "@formsflow/service";
import { TableFooter ,NoDataFound, TableSkeleton , V8CustomButton} from "@formsflow/components";
import userRoles from "../../../constants/permissions";
import SortableHeader from '../../CustomComponents/SortableHeader';

function FormTable() {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = (() => bpmForms.forms)() || [];
  const pageNo = useSelector((state) => state.bpmForms.formListPage);
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

  const pageOptions = [
    {
      text: "10",
      value: 10,
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
    const newSortOrder = formsort[key].sortOrder === "asc" ? "desc" : "asc";
  
    // Reset all other columns to default (ascending) except the active one
    const updatedSort = Object.keys(formsort).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === key ? newSortOrder : "asc" };
      return acc;
    }, {});
  
    dispatch(setBpmFormSort({
      ...updatedSort,
      activeKey: key,
    }));
  };
  

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

  if (searchFormLoading || isApplicationCountLoading) {
    return <TableSkeleton columns={5} rows={10} pagination={7} />;
  }

  return (
    <div className="custom-table-wrapper-outter">
      <div className="custom-table-wrapper-inner">
        <table className="table custom-tables">
          <thead className="table-header">
            <tr>
              
              <SortableHeader
                columnKey="formName"
                title="Name"
                currentSort={formsort}
                handleSort={handleSort}
                className="w-20"
              />
              
              <th className="w-30" scope="col">{t("Description")}</th>
              
              <SortableHeader
              columnKey="modified"
              title="Last Edited"
              currentSort={formsort}
              handleSort={handleSort}
              className="w-13"
              />
              
              
              <SortableHeader
                columnKey="visibility"
                title="Visibility"
                currentSort={formsort}
                handleSort={handleSort}
                className="w-13"/>
              
              
                <SortableHeader
                columnKey="status"
                title="Status"
                currentSort={formsort}
                handleSort={handleSort}
                className="w-12"/>
              
              <th className="text-end" aria-label="Search Forms by form title"></th>
            </tr>
          </thead>

          {formData?.length ? (
            <>
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
                          onClick={() => toggleRow(index)}
                          data-testid="description-cell"
                          >
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
                      <td className="text-end">
                      {(createDesigns || viewDesigns) && (
                        <V8CustomButton
                          label={createDesigns ? "Edit" : "View"}
                          onClick={() => viewOrEditForm(e._id, 'edit')}
                          dataTestId={`form-${createDesigns ? 'edit' : 'view'}-button-${e._id}`}
                          ariaLabel={`${createDesigns ? "Edit" : "View"} Form Button`}
                          variant="primary"
                        /> )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          ) : !searchFormLoading ? (
            <tbody className="table-empty">
              <NoDataFound message={t('No forms have been found. Create a new form by clicking the "New Form & Flow" button in the top right.')}/>
            </tbody>
          ) : null}
        </table>
      </div>

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
        <></>
      )}
    </div>
  );
}

export default FormTable;

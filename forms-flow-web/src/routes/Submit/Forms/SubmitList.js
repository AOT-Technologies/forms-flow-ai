import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch, batch } from "react-redux";
import {
  setBPMFormListLoading,
  setClientFormSearch,
  setClientFormListPage,
  setClientFormLimit,
  setClientFormListSort,
} from "../../../actions/formActions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import {
  setFormCheckList,
  setFormSearchLoading,
} from "../../../actions/checkListActions";
import { useTranslation } from "react-i18next";
import ClientTable from "../../../components/Form/constants/ClientTable";
import { CustomSearch ,   
  BreadCrumbs,
} from "@formsflow/components";
import PropTypes from "prop-types";

const SubmitList = React.memo(({ getFormsInit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux Selectors
  const searchText = useSelector((state) => state.bpmForms.clientFormSearch);
  // const tenantId = useSelector((state) => state.tenants?.tenantId);
  // const userRoles = useSelector((state) => state.user.roles || []);
  // const create_submissions = userRoles.includes("create_submissions");

  const pageNo = useSelector((state) => state.bpmForms.submitListPage);
  const limit = useSelector((state) => state.bpmForms.submitFormLimit);
  const formSort = useSelector((state) => state.bpmForms.submitFormSort);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  // Local States
  const [search, setSearch] = useState(searchText || "");

  // Fetch Forms Function - memoized to prevent unnecessary re-renders
  const fetchForms = useCallback(() => {
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList({
      pageNo,
      limit,
      formSort,
      formName: searchText,
      showForOnlyCreateSubmissionUsers: true,
      includeSubmissionsCount: true
    }));
  }, [dispatch, pageNo, limit, formSort, searchText]);


  // Effects
  useEffect(() => {
    setSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setClientFormSearch(""));
    }
  }, [search, dispatch]);
  
  const handleSearch = useCallback(() => {
    // Batch dispatches to prevent duplicate API calls
    batch(() => {
      dispatch(setClientFormSearch(search));
      dispatch(setClientFormListPage(1));
    });
  }, [dispatch, search]);
  const handleClearSearch = useCallback(() => {
    setSearch("");
    dispatch(setClientFormSearch(""));
  }, [dispatch]);

  // Submitter mapping for sort field names
  const submitGridFieldToSortKey = {
    title: "formName",
    submissionsCount: "submissionCount",
    latestSubmission: "latestSubmission",
  };
  const submitSortKeyToGridField = {
    formName: "title",
    submissionCount: "submissionsCount",
    latestSubmission: "latestSubmission",
  };

  // Memoized sort and pagination models
  const submitActiveKey = formSort?.activeKey || "formName";
  const submitActiveField = submitSortKeyToGridField[submitActiveKey] || submitActiveKey;
  const submitActiveOrder = formSort?.[submitActiveKey]?.sortOrder || "asc";
  
  const submitSortModel = useMemo(
    () => [{ field: submitActiveField, sort: submitActiveOrder }],
    [submitActiveField, submitActiveOrder]
  );
  
  const submitPaginationModel = useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );

  // Pagination handler
  const onSubmitPaginationModelChange = useCallback(({ page, pageSize }) => {
    batch(() => {
      if (pageSize !== limit) {
        dispatch(setClientFormLimit(pageSize));
        dispatch(setClientFormListPage(1));
      } else {
        dispatch(setClientFormListPage(page + 1));
      }
    });
  }, [dispatch, limit]);

  // Sort handler
  const handleSubmitSortModelChange = useCallback((modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(formSort || {}).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
      return;
    }
    const mappedKey = submitGridFieldToSortKey[model.field] || model.field;
    const updatedSort = Object.keys(formSort || {}).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? model.sort : "asc" };
      return acc;
    }, {});
    dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
  }, [dispatch, formSort, submitGridFieldToSortKey]);

  // Refresh handler
  const handleSubmitRefresh = useCallback(() => {
    batch(() => {
      dispatch(setBPMFormListLoading(true));
      dispatch(setFormSearchLoading(true));
      dispatch(fetchBPMFormList({
        pageNo,
        limit,
        formSort,
        formName: searchText,
        showForOnlyCreateSubmissionUsers: true,
        includeSubmissionsCount: true
      }));
    });
  }, [dispatch, pageNo, limit, formSort, searchText]);


  useEffect(() => {
    dispatch(setFormCheckList([]));
    dispatch(setBPMFormListLoading(true));
    // if (!create_submissions) {
    //   navigateTo(navigateToSubmitFormsApplication);
    // }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms, getFormsInit]);

    const breadcrumbItems = [
    { id: "submit", label: "Submit" },
  ];

  return (
    <>
      <div className="header-section-1">
          <div className="section-seperation-left">
            <BreadCrumbs 
              items={breadcrumbItems} 
            /> 
          </div>
      </div>

      <div className="header-section-2">
          <div className="section-seperation-left">
                <CustomSearch
                  search={search}
                  setSearch={setSearch}
                  handleSearch={handleSearch}
                  handleClearSearch={handleClearSearch}
                  placeholder={t("Search")}
                  searchLoading={searchFormLoading}
                  title={t("Search")}
                  dataTestId="form-search-input"
                  width="462px"
                />
          </div>
       </div>
      <div className="body-section">
          <ClientTable
            externalSortModel={submitSortModel}
            externalOnSortModelChange={handleSubmitSortModelChange}
            externalPaginationModel={submitPaginationModel}
            externalOnPaginationModelChange={onSubmitPaginationModelChange}
            externalOnRefresh={handleSubmitRefresh}
          />
      </div>
    </>
  );
});

SubmitList.propTypes = {
  getFormsInit: PropTypes.bool,
};

export default SubmitList;

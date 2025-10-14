import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
// import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { fetchApplicationsAndDrafts } from "../../../apiManager/services/applicationServices";
import userRoles from "../../../constants/permissions";
import {
  setApplicationListActivePage,
  setApplicationListSearchParams,
  setApplicationLoading
} from "../../../actions/applicationActions";
import { navigateToNewSubmission, navigateToSubmitFormsListing } from "../../../helper/routerHelper";
import { CustomSearch, BreadCrumbs, V8CustomButton } from "@formsflow/components";
import SubmissionsAndDraftTable from "../../../components/Form/constants/SubmissionsAndDraftTable";
import { useParams } from "react-router-dom";

// SearchBar Component
const SearchBar = ({ search, setSearch, handleSearch, handleClearSearch, searchLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="application-search-box">
      <CustomSearch
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        handleClearSearch={handleClearSearch}
        placeholder={t("Search by ID")}
        searchLoading={searchLoading}
        title={t("Search Form Name and Description")}
        dataTestId="form-search-input"
      />
    </div>
  );
};

SearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleClearSearch: PropTypes.func.isRequired,
  searchLoading: PropTypes.bool.isRequired,
};

// Main Component
const DraftsAndSubmissions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { parentFormId } = useParams();
  const formId = useSelector(
    (state) => state.applications.draftAndSubmissionsList?.formId
  );
  
  // Redux state selectors
  const tenantId = useSelector((state) => state.tenants?.tenantId);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const searchFormLoading = useSelector((state) => state.formCheckList.searchFormLoading);
  const {createSubmissions} = userRoles();
  const {    
    formName,
    activePage: pageNo,
    countPerPage: limit,
    sort: applicationSort
  } = useSelector((state) => state.applications);

  // Local state
  const [search, setSearch] = useState("");
    
  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setApplicationListSearchParams(""));
    }
  }, [search]);

  const handleSearch = () => {
    dispatch(setApplicationListActivePage(1));
  };

  const handleClearSearch = () => setSearch("");

  const fetchSubmissionsAndDrafts = () => {
    dispatch(setApplicationLoading(true));
    dispatch(
      fetchApplicationsAndDrafts({
        pageNo,
        limit,
        applicationSort,
        parentFormId,
        search,
        createdUserSubmissions: true,
        includeDrafts: true,
      })
    );
  };
 
  const submitNewForm = () => {
    navigateToNewSubmission(dispatch, tenantKey, formId);
  };

  const redirectBackToForm = () => {
    navigateToSubmitFormsListing(dispatch, tenantId);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSubmissionsAndDrafts();
  }, [pageNo, limit, applicationSort, search, parentFormId,formId]);
  
  const breadcrumbItems = [
    { id: "submit", label: t("Submit")},
    { label: formName || ""}
  ];

  const handleBreadcrumbClick = (item) => {
  if (item.id === "submit") {
    redirectBackToForm();
  }
  };

  return (
    <>
      <div className="header-section-1">
          <div className="section-seperation-left">
            <BreadCrumbs 
              items={breadcrumbItems} 
              onBreadcrumbClick={handleBreadcrumbClick}
            /> 
          </div>
          <div className="section-seperation-right">
            {createSubmissions && 
            <V8CustomButton
              variant="primary"
              label={t("Create new submission")}
              onClick={submitNewForm}
            />} 
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
                      />
                </div>
             </div>

      {/* Applications-Drafts Table */}
      <div className="body-section">
              <SubmissionsAndDraftTable
        fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
      />
      </div>

    </>
  );
};

export default React.memo(DraftsAndSubmissions);

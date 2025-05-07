import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
// import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { fetchApplicationsAndDrafts } from "../../../apiManager/services/applicationServices";
import {
  setFormSubmissionSort,
  setApplicationListActivePage,
  setApplicationListSearchParams,
  setApplicationLoading
} from "../../../actions/applicationActions";
import { navigateToSubmitFormsListing, navigateToNewSubmission } from "../../../helper/routerHelper";
import { CustomSearch, CustomButton, BackToPrevIcon, ConnectIcon } from "@formsflow/components";
import FilterSortActions from "../../../components/CustomComponents/FilterSortActions";
import SubmissionsAndDraftTable from "../../../components/Form/constants/SubmissionsAndDraftTable";

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
  const { formId } = useParams();

  // Redux state selectors
  const tenantId = useSelector((state) => state.tenants?.tenantId);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const searchFormLoading = useSelector((state) => state.formCheckList.searchFormLoading);

  const {
    draftAndSubmissionsList,
    activePage: pageNo,
    countPerPage: limit,
    searchParams: searchText,
    sort: applicationSort
  } = useSelector((state) => state.applications);

  // Local state
  const [search, setSearch] = useState(searchText || "");
  const [selectedItem, setSelectedItem] = useState("All");
  const [showSortModal, setShowSortModal] = useState(false);

  // Dropdown filter options
  const dropdownItems = [
    { label: t("All"), onClick: () => handleSelection("All"), dataTestId: "all-submissions-button", ariaLabel: "View all submissions" },
    { label: t("Draft"), onClick: () => handleSelection("Draft"), dataTestId: "draft-submissions-button", ariaLabel: "View draft submissions" },
    { label: t("Submissions"), onClick: () => handleSelection("Submissions"), dataTestId: "completed-submissions-button", ariaLabel: "View completed submissions" }
  ];

  // Handlers
  const handleSelection = (label) => setSelectedItem(label);

  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setApplicationListSearchParams(""));
    }
  }, [search]);

  const handleSearch = () => {
    dispatch(setApplicationListSearchParams(search));
    dispatch(setApplicationListActivePage(1));
  };

  const handleClearSearch = () => setSearch("");

  const handleSortApply = (selectedSortOption, selectedSortOrder) => {
    dispatch(
      setFormSubmissionSort({
        ...applicationSort,
        activeKey: selectedSortOption,
        [selectedSortOption]: { sortOrder: selectedSortOrder },
      })
    );
    setShowSortModal(false);
  };

  const fetchSubmissionsAndDrafts = () => {
    dispatch(setApplicationLoading(true));
    dispatch(
      fetchApplicationsAndDrafts({
        pageNo,
        limit,
        applicationSort,
        formId,
        searchText,
        createdUserSubmissions: true,
        onlyDrafts: selectedItem === "Draft",
        includeDrafts: selectedItem === "All",
      })
    );
  };

  const submitNewForm = () => {
    navigateToNewSubmission(dispatch, tenantKey, formId);
  };

  const redirectBackToForm = () => {
    navigateToSubmitFormsListing(dispatch, tenantId);
  };

  // Sync local search state with global searchText
  useEffect(() => setSearch(searchText), [searchText]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSubmissionsAndDrafts();
  }, [pageNo, limit, applicationSort, searchText, selectedItem, formId, applicationSort]);

  return (
    <div>
      {/* Header */}
      <div className="nav-bar">
        <div className="icon-back" onClick={redirectBackToForm}>
          <BackToPrevIcon data-testid="back-to-form-listing" ariaLabel="Back To Form Button" />
        </div>

        <div className="description">
          <p className="text-main">
            {draftAndSubmissionsList?.applications?.[0]?.applicationName || ""}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap">
        <div className="d-md-flex justify-content-start align-items-center button-align">
          <CustomButton
            className="appliation-dropdown"
            isDropdown
            variant="primary"
            size="sm"
            label={t(selectedItem)}
            dropdownItems={dropdownItems}
            data-testid="submission-filter-dropdown"
            aria-label="Submission Filter Dropdown"
          />
          <ConnectIcon />
          <SearchBar
            search={search}
            setSearch={setSearch}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            searchLoading={searchFormLoading}
            data-testid="search-bar"
            aria-label="Search Submissions"
          />
        </div>

        <div className="d-md-flex justify-content-end align-items-center button-align">
          <FilterSortActions
            showSortModal={showSortModal}
            handleSortApply={handleSortApply}
            handleFilterIconClick={() => setShowSortModal(true)}
            handleRefresh={fetchSubmissionsAndDrafts}
            handleSortModalClose={() => setShowSortModal(false)}
            optionSortBy={[
              { value: "id", label: t("Submission Id") },
              { value: "created", label: t("Submitted On") },
              { value: "type", label: t("Type") },
              { value: "modified", label: t("Last Modified") },
              { value: "applicationStatus", label: t("Status") },
            ]}
            defaultSortOption={applicationSort?.activeKey}
            defaultSortOrder={applicationSort?.[applicationSort?.activeKey]?.sortOrder || "asc"}
            filterDataTestId="form-list-filter"
            refreshDataTestId="form-list-refresh"
          />
          <CustomButton
            variant="primary"
            size="sm"
            label={t("New Submission")}
            onClick={submitNewForm}
            dataTestId="create-form-button"
            ariaLabel="Create Form"
          />
        </div>
      </div>

      {/* Applications-Drafts Table */}
      <SubmissionsAndDraftTable
        fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
      />
    </div>
  );
};

export default React.memo(DraftsAndSubmissions);

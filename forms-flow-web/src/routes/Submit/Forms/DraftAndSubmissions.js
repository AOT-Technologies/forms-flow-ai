import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { fetchApplicationsAndDrafts } from "../../../apiManager/services/applicationServices";
import {
  setFormSubmissionSort,
  setApplicationListActivePage,
  setApplicationListSearchParams
} from "../../../actions/applicationActions";
import { navigateToSubmitFormsListing, navigateToNewSubmission } from "../../../helper/routerHelper";
import { CustomSearch, CustomButton, BackToPrevIcon } from "@formsflow/components";
import FilterSortActions from "../../../components/CustomComponents/FilterSortActions";
import SubmissionsAndDraftTable from "../../../components/Form/constants/SubmissionsAndDraftTable";

// SearchBar Component
const SearchBar = ({ search, setSearch, handleSearch, handleClearSearch, searchLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="width-25 search-box">
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
  const searchText = useSelector((state) => state.application?.searchParams);
  const tenantId = useSelector((state) => state.tenants?.tenantId);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const formSort = useSelector((state) => state.applications.sort);
  const searchFormLoading = useSelector((state) => state.formCheckList.searchFormLoading);
  const draftAndSubmissionsList = useSelector((state) =>
    state.applications.draftAndSubmissionsList);
  const pageNo = useSelector((state) => state.applications?.activePage);
  const limit = useSelector((state) => state.applications?.countPerPage);
  const applicationSort = useSelector((state) => state.applications.sort);

  // Local state
  const [search, setSearch] = useState(searchText || "");
  const [selectedItem, setSelectedItem] = useState("All");
  const [showSortModal, setShowSortModal] = useState(false);

  // Dropdown filter options
  const dropdownItems = [
    { label: "All", onClick: () => handleSelection("All"), dataTestId: "all-submissions-button", ariaLabel: "View all submissions" },
    { label: "Draft", onClick: () => handleSelection("Draft"), dataTestId: "draft-submissions-button", ariaLabel: "View draft submissions" },
    { label: "Submissions", onClick: () => handleSelection("Submissions"), dataTestId: "completed-submissions-button", ariaLabel: "View completed submissions" }
  ];

  // Handlers
  const handleSelection = (label) => setSelectedItem(label);

  const handleSearch = () => {
    dispatch(setApplicationListSearchParams(search));
    dispatch(setApplicationListActivePage(1));
  };

  const handleClearSearch = () => setSearch("");

  const handleSortApply = (selectedSortOption, selectedSortOrder) => {
    dispatch(
      setFormSubmissionSort({
        ...formSort,
        activeKey: selectedSortOption,
        [selectedSortOption]: { sortOrder: selectedSortOrder },
      })
    );
    setShowSortModal(false);
  };

  const fetchSubmissionsAndDrafts = () => {
    dispatch(
      fetchApplicationsAndDrafts({
        pageNo,
        limit,
        applicationSort,
        formId,
        formSort,
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
  }, [pageNo, limit, applicationSort, searchText, selectedItem, formId, formSort]);

  return (
    <div>
      {/* Header */}
      <Card className="editor-header">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <BackToPrevIcon onClick={redirectBackToForm} />
              <div className="mx-4 editor-header-text">
                {draftAndSubmissionsList?.applications?.[0]?.applicationName || ""}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Actions */}
      <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap">
        <div className="d-md-flex justify-content-start align-items-center button-align">
          <CustomButton
            isDropdown
            variant="primary"
            size="sm"
            label={t(selectedItem)}
            dropdownItems={dropdownItems}
          />
          +
          <SearchBar
            search={search}
            setSearch={setSearch}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            searchLoading={searchFormLoading}
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
              { value: "submissionId", label: t("Submission Id") },
              { value: "submittedOn", label: t("Submitted On") },
              { value: "type", label: t("Type") },
              { value: "modified", label: t("Last Modified") },
              { value: "status", label: t("status") },
            ]}
            defaultSortOption={formSort?.activeKey}
            defaultSortOrder={formSort?.[formSort?.activeKey]?.sortOrder || "asc"}
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

      {/* Data Table */}
      <SubmissionsAndDraftTable />
    </div>
  );
};

export default React.memo(DraftsAndSubmissions);

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setBPMFormListLoading,
  setClientFormSearch,
  setBPMSubmitListPage,
  setBpmFormSort,
} from "../../../actions/formActions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import {
  setFormCheckList,
  setFormSearchLoading,
} from "../../../actions/checkListActions";
import { useTranslation } from "react-i18next";
import ClientTable from "../../../components/Form/constants/ClientTable";
import { CustomSearch } from "@formsflow/components";
import { navigateToSubmitFormsApplication } from "../../../helper/routerHelper";
import PropTypes from "prop-types";
import FilterSortActions from "../../../components/CustomComponents/FilterSortActions.js";

// Extracted Search Component
const SearchBar = ({ search, setSearch, handleSearch, handleClearSearch, searchLoading }) => {
  const { t } = useTranslation();
  return (
    <div className="width-25 search-box">
      <CustomSearch
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        handleClearSearch={handleClearSearch}
        placeholder={t("Search Form Name and Description")}
        searchLoading={searchLoading}
        title={t("Search Form Name and Description")}
        dataTestId="form-search-input"
      />
    </div>
  );
};

const SubmitList = React.memo(({ getFormsInit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux Selectors
  const searchText = useSelector((state) => state.bpmForms.clientFormSearch);
  const tenantId = useSelector((state) => state.tenants?.tenantId);
  const userRoles = useSelector((state) => state.user.roles || []);
  const create_submissions = userRoles.includes("create_submissions");

  const pageNo = useSelector((state) => state.bpmForms.submitListPage);
  const limit = useSelector((state) => state.bpmForms.submitFormLimit);
  const formSort = useSelector((state) => state.bpmForms.submitFormSort);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  // Local States
  const [search, setSearch] = useState(searchText || "");
  const [showSortModal, setShowSortModal] = useState(false);

  // Sorting Options
  const optionSortBy = [
    { value: "formName", label: t("Form Name") },
    { value: "submissionCount", label: t("Submissions") },
    { value: "modified", label: t("Latest Submission") },


  ];

  // Fetch Forms Function
  const fetchForms = () => {
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList({
      pageNo, 
      limit, 
      formSort, 
      formName: searchText, 
      showForOnlyCreateSubmissionUsers: true, 
      includeSubmissionsCount: true
    }));
  };
  

  // Handle Sorting
  const handleSortApply = (selectedSortOption, selectedSortOrder) => {
    dispatch(setBpmFormSort({
      ...formSort,
      activeKey: selectedSortOption,
      [selectedSortOption]: { sortOrder: selectedSortOrder },
    }));
    setShowSortModal(false);
  };

  // Navigation Handler (Refactored)
  const navigateTo = (routeFunction) => routeFunction(dispatch, tenantId);

  // Effects
  useEffect(() => {
    setSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setClientFormSearch(""));
    }
  }, [search]);
  const handleSearch = () => {
    dispatch(setClientFormSearch(search));
    dispatch(setBPMSubmitListPage(1));
  };
  const handleClearSearch = () => {
    setSearch("");
    dispatch(setClientFormSearch(""));
  };





  useEffect(() => {
    dispatch(setFormCheckList([]));
    dispatch(setBPMFormListLoading(true));
    if (!create_submissions) {
      navigateTo(navigateToSubmitFormsApplication);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [getFormsInit, pageNo, limit, formSort, searchText]);

  return (
    <div>
      <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap">
        <SearchBar
          search={search}
          setSearch={setSearch}
          handleSearch={handleSearch}
          handleClearSearch={handleClearSearch}
          searchLoading={searchFormLoading}
        />
        <div className="d-md-flex justify-content-end align-items-center button-align">
          <FilterSortActions
            showSortModal={showSortModal}
            handleFilterIconClick={() => setShowSortModal(true)}
            handleRefresh={fetchForms}
            handleSortModalClose={() => setShowSortModal(false)}
            handleSortApply={handleSortApply}
            optionSortBy={optionSortBy}
            defaultSortOption={formSort.activeKey}
            defaultSortOrder={formSort[formSort.activeKey]?.sortOrder || "asc"}
            filterDataTestId="form-list-filter"
            filterAriaLabel="Filter the form list"
            refreshDataTestId="form-list-refresh"
            refreshAriaLabel="Refresh the form list"
          />
        </div>
      </div>
      <ClientTable />
    </div>
  );
});

SearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleClearSearch: PropTypes.func.isRequired,
  searchLoading: PropTypes.bool.isRequired,
};

SubmitList.propTypes = {
  getFormsInit: PropTypes.bool,
};

export default SubmitList;

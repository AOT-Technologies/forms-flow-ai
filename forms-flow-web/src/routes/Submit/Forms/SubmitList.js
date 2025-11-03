import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setBPMFormListLoading,
  setClientFormSearch,
  setClientFormListPage,
} from "../../../actions/formActions";
import { setFormCheckList } from "../../../actions/checkListActions";
import { useTranslation } from "react-i18next";
import FormListGrid from "../../../components/Form/FormListGrid";
import { CustomSearch ,   
  BreadCrumbs,
} from "@formsflow/components";
import PropTypes from "prop-types";

// Extracted Search Component
const SearchBar = ({ search, setSearch, handleSearch, handleClearSearch, searchLoading }) => {
  const { t } = useTranslation();
  return (
      <CustomSearch
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        handleClearSearch={handleClearSearch}
        placeholder={t("Search Form Name and Description")}
        searchLoading={searchLoading}
        title={t("Search Form Name and Description")}
        dataTestId="form-search-input"
        width="22rem"
      />
  );
};

const SubmitList = React.memo(({ getFormsInit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux Selectors
  const searchText = useSelector((state) => state.bpmForms.clientFormSearch);
  // const tenantId = useSelector((state) => state.tenants?.tenantId);
  // const userRoles = useSelector((state) => state.user.roles || []);
  // const create_submissions = userRoles.includes("create_submissions");

  
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  // Local States
  const [search, setSearch] = useState(searchText || "");

// Fetch handled by FormListGrid


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
    dispatch(setClientFormListPage(1));
  };
  const handleClearSearch = () => {
    setSearch("");
    dispatch(setClientFormSearch(""));
  };





  useEffect(() => {
    dispatch(setFormCheckList([]));
    dispatch(setBPMFormListLoading(true));
    // if (!create_submissions) {
    //   navigateTo(navigateToSubmitFormsApplication);
    // }
  }, []);

  useEffect(() => {
    // trigger loading indicators; data fetch is in FormListGrid
    dispatch(setBPMFormListLoading(true));
  }, [dispatch, getFormsInit]);


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
                  width="22rem"
                />
          </div>
       </div>
      <div className="body-section">
        <FormListGrid mode="submit" />
      </div>
    </>
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

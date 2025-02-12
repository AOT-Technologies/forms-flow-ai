import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DRAFT_ENABLED } from "../../../constants/constants";
import {
  setBPMFormListLoading,
  setClientFormSearch,
  setBPMSubmitListPage
} from "../../../actions/formActions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import {
  setFormCheckList,
  setFormSearchLoading,
} from "../../../actions/checkListActions";
import { useTranslation } from "react-i18next";
import ClientTable from "../../../components/Form/constants/ClientTable";

import { CustomSearch } from "@formsflow/components";
import Head from "../../../containers/Head";
import {navigateToSubmitFormsListing, navigateToSubmitFormsDraft, navigateToSubmitFormsApplication} from "../../../helper/routerHelper";
import PropTypes from "prop-types";

const SubmitList = React.memo((props) => {
  const { t } = useTranslation();
  const searchText = useSelector((state) => state.bpmForms.clientFormSearch);
  const tenantId = useSelector((state) => state.tenants?.tenantId);
  const [search, setSearch] = useState(searchText || "");
  const userRoles = useSelector((state) => state.user.roles || []);
  const create_submissions = userRoles.includes("create_submissions");
  const dispatch = useDispatch();

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
  const { getFormsInit } = props;

  const pageNo = useSelector((state) => state.bpmForms.submitListPage);
  const limit = useSelector((state) => state.bpmForms.limit);
  const formSort = useSelector((state) => state.bpmForms.sort);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );

  useEffect(() => {
    dispatch(setFormCheckList([]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBPMFormListLoading(true));
    if (!create_submissions) {
      navigateToSubmitFormsApplicationRoute();
    }
  }, []);

  const fetchForms = () => {
    const showForOnlyCreateSubmissionUsers = true;
    const formType = "";
    let filters = [pageNo, limit, formSort, searchText,formType,showForOnlyCreateSubmissionUsers];
    dispatch(setFormSearchLoading(true));
    dispatch(fetchBPMFormList(...filters));
  };

  useEffect(() => {
    fetchForms();
  }, [getFormsInit, dispatch, pageNo, limit, formSort, searchText]);
  
  const navigateToSubmitFormsRoute = () => {
    navigateToSubmitFormsListing(dispatch,tenantId);
  };

  const navigateToSubmitFormsDraftRoute = () => {
    navigateToSubmitFormsDraft(dispatch,tenantId);
  };
  const navigateToSubmitFormsApplicationRoute = () => {
    navigateToSubmitFormsApplication(dispatch,tenantId);
  };

  const headerList = () => {
    const headers = [
      {
        name: "Submissions",
        onClick: () => navigateToSubmitFormsApplicationRoute(),
      },
    ];

    if (create_submissions) {
      headers.unshift({
        name: "All Forms",
        onClick: () => navigateToSubmitFormsRoute(),
      });
      headers.push({
        name: "Drafts",
        onClick: () => navigateToSubmitFormsDraftRoute(),
      });
    }

    return headers;
  };

  let headOptions = headerList();

  if (!DRAFT_ENABLED) {
    headOptions.pop();
  }

  return (
    <div>
      <Head items={headOptions} page="All Forms" />
      <div className="d-md-flex justify-content-between align-items-center pb-3 flex-wrap width-25 search-box">
        <CustomSearch
          search={search}
          setSearch={setSearch}
          handleSearch={handleSearch}
          handleClearSearch={handleClearSearch}
          placeholder={t("Search Form Name and Description")}
          searchLoading={searchFormLoading}
          title={t("Search Form Name and Description")}
          dataTestId="form-search-input"
        />
      </div>
      <ClientTable />
    </div>
  );
});

SubmitList.propTypes = {
  getFormsInit: PropTypes.bool,
};

export default SubmitList;

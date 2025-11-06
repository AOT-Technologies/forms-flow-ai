import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch, batch } from "react-redux";
import {
  setBPMFormListLoading,
  setClientFormSearch,
  setClientFormListPage,
  setClientFormLimit,
  setClientFormListSort,
} from "../../../actions/formActions";
import { setFormCheckList, setFormSearchLoading } from "../../../actions/checkListActions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import { useTranslation } from "react-i18next";
import { WrappedTable } from "@formsflow/components";
import { CustomSearch, BreadCrumbs, V8CustomButton } from "@formsflow/components";
import { HelperServices } from "@formsflow/service";
import PropTypes from "prop-types";
import { navigateToFormEntries } from "../../../helper/routerHelper";

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
        width="462px"
      />
  );
};

const SubmitList = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  // Redux Selectors
  const searchText = useSelector((state) => state.bpmForms.clientFormSearch);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const forms = useSelector((state) => state.bpmForms.forms) || [];
  const totalForms = useSelector((state) => state.bpmForms.totalForms) || 0;
  const pageNo = useSelector((state) => state.bpmForms.submitListPage);
  const limit = useSelector((state) => state.bpmForms.submitFormLimit);
  const formSort = useSelector((state) => state.bpmForms.submitFormSort);
  
  // Local States
  const [search, setSearch] = useState(searchText || "");


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
  }, [dispatch]);

  // Data fetching
  const fetchForms = useCallback(() => {
    dispatch(setFormSearchLoading(true));
    dispatch(
      fetchBPMFormList({
        pageNo,
        limit,
        formSort,
        formName: searchText,
        showForOnlyCreateSubmissionUsers: true,
        includeSubmissionsCount: true,
      })
    );
  }, [dispatch, pageNo, limit, formSort, searchText]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // Column definitions
  const gridFieldToSortKey = useMemo(() => ({
    title: "formName",
    submissionsCount: "submissionCount",
    latestSubmission: "latestSubmission",
  }), []);

  const sortKeyToGridField = useMemo(() => ({
    formName: "title",
    submissionCount: "submissionsCount",
    latestSubmission: "latestSubmission",
  }), []);

  const columns = useMemo(() => {
    const stripHtml = (html) => {
      const doc = new DOMParser().parseFromString(html || "", "text/html");
      return doc.body.textContent || "";
    };
    return [
      {
        field: "title",
        headerName: t("Form Name"),
        flex: 1,
        sortable: true,
        renderCell: (p) => <span title={p.value}>{p.value}</span>,
      },
      {
        field: "description",
        headerName: t("Description"),
        flex: 1,
        sortable: false,
        renderCell: (p) => {
          const text = stripHtml(p.row.description);
          return <span title={text}>{text}</span>;
        },
      },
      {
        field: "submissionsCount",
        headerName: t("Submissions"),
        flex: 1,
        sortable: true,
        renderCell: (p) => <span>{p.value}</span>,
      },
      {
        field: "latestSubmission",
        headerName: t("Latest Submission"),
        flex: 1,
        sortable: true,
        renderCell: (p) => (
          <span title={HelperServices?.getLocaldate(p.row.latestSubmission)}>
            {HelperServices?.getLocaldate(p.row.latestSubmission)}
          </span>
        ),
      },
      {
        field: "actions",
        align: "right",
        flex: 1,
        sortable: false,
        cellClassName: "last-column",
        renderCell: (params) => (
          <V8CustomButton
            label={t("Select")}
            variant="secondary"
            onClick={() => navigateToFormEntries(dispatch, tenantKey, params.row.parentFormId)}
          />
        ),
      },
    ];
  }, [t, dispatch, tenantKey]);

  // Rows mapping
  const rows = useMemo(() => {
    return (forms || []).map((f) => ({ id: f._id, ...f }));
  }, [forms]);

  // Sort model
  const activeKey = formSort?.activeKey || "formName";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = formSort?.[activeKey]?.sortOrder || "asc";
  const sortModel = useMemo(
    () => [{ field: activeField, sort: activeOrder }],
    [activeField, activeOrder]
  );

  // Sort handler
  const handleSortModelChange = useCallback((modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;
    if (!model?.field || !model?.sort) {
      const resetSort = Object.keys(formSort || {}).reduce((acc, key) => {
        acc[key] = { sortOrder: "asc" };
        return acc;
      }, {});
      dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
      return;
    }
    const incomingField = model.field;
    const incomingOrder = model.sort;
    const mappedKey = gridFieldToSortKey[incomingField] || incomingField;
    const updatedSort = Object.keys(formSort || {}).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? incomingOrder : "asc" };
      return acc;
    }, {});
    dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
  }, [dispatch, formSort, gridFieldToSortKey]);

  // Pagination model
  const paginationModel = useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );

  // Pagination handler
  const onPaginationModelChange = useCallback(({ page, pageSize }) => {
    const requestedPage = typeof page === "number" ? page + 1 : pageNo;
    const requestedLimit = typeof pageSize === "number" ? pageSize : limit;
    if (requestedPage === pageNo && requestedLimit === limit) return;
    batch(() => {
      if (requestedLimit !== limit) {
        dispatch(setClientFormLimit(requestedLimit));
        dispatch(setClientFormListPage(1));
      } else if (requestedPage !== pageNo) {
        dispatch(setClientFormListPage(requestedPage));
      }
    });
  }, [dispatch, pageNo, limit]);

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
            <WrappedTable
          columns={columns}
          rows={rows}
          rowCount={totalForms}
          loading={searchFormLoading}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          getRowId={(row) => row.id}
          onRefresh={fetchForms}
        />
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

SubmitList.propTypes = {};

export default SubmitList;

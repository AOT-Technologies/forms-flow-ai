import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setBPMFormListLoading,
  setClientFormSearch,
  setClientFormListPage,
} from "../../../actions/formActions";
import { fetchBPMFormList } from "../../../apiManager/services/bpmFormServices";
import {
  setFormCheckList,
  setFormSearchLoading,
} from "../../../actions/checkListActions";
import { useTranslation } from "react-i18next";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { V8CustomButton, RefreshIcon } from "@formsflow/components";
import { HelperServices } from "@formsflow/service";
import { batch } from "react-redux";
import { setClientFormLimit, setClientFormListSort } from "../../../actions/formActions";
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

  const pageNo = useSelector((state) => state.bpmForms.submitListPage);
  const limit = useSelector((state) => state.bpmForms.submitFormLimit);
  const formSort = useSelector((state) => state.bpmForms.submitFormSort);
  const forms = useSelector((state) => state.bpmForms.forms) || [];
  const totalForms = useSelector((state) => state.bpmForms.totalForms) || 0;
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  // Local States
  const [search, setSearch] = useState(searchText || "");

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
    fetchForms();
  }, [getFormsInit, pageNo, limit, formSort, searchText]);

  // DataGrid columns (mirrors ClientTable)
  const gridFieldToSortKey = {
    title: "formName",
    submissionsCount: "submissionCount",
    latestSubmission: "latestSubmission",
  };

  const sortKeyToGridField = {
    formName: "title",
    submissionCount: "submissionsCount",
    latestSubmission: "latestSubmission",
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return doc.body.textContent || "";
  };

  const columns = [
    {
      field: "title",
      headerName: t("Form Name"),
      flex: 1,
      sortable: true,
      renderCell: (params) => (
        <span title={params.value}>{params.value}</span>
      ),
    },
    {
      field: "description",
      headerName: t("Description"),
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const text = stripHtml(params.row.description);
        return <span title={text}>{text}</span>;
      },
    },
    {
      field: "submissionsCount",
      headerName: t("Submissions"),
      flex: 1,
      sortable: true,
      renderCell: (params) => <span>{params.value}</span>,
    },
    {
      field: "latestSubmission",
      headerName: t("Latest Submission"),
      flex: 1,
      sortable: true,
      renderCell: (params) => (
        <span title={HelperServices?.getLocaldate(params.row.latestSubmission)}>
          {HelperServices?.getLocaldate(params.row.latestSubmission)}
        </span>
      ),
    },
    {
      field: "actions",
      align: "right",
      renderHeader: () => (
        <V8CustomButton
          variant="secondary"
          icon={<RefreshIcon />}
          iconOnly
          onClick={fetchForms}
        />
      ),
      flex: 1,
      sortable: false,
      cellClassName: "last-column",
    },
  ];

  const rows = React.useMemo(() => {
    return (forms || []).map((f) => ({
      id: f._id,
      title: f.title,
      description: f.description,
      submissionsCount: f.submissionsCount,
      latestSubmission: f.latestSubmission,
    }));
  }, [forms]);

  const activeKey = formSort?.activeKey || "formName";
  const activeField = sortKeyToGridField[activeKey] || activeKey;
  const activeOrder = formSort?.[activeKey]?.sortOrder || "asc";

  const sortModel = React.useMemo(
    () => [{ field: activeField, sort: activeOrder }],
    [activeField, activeOrder]
  );

  const handleSortModelChange = (modelArray) => {
    const model = Array.isArray(modelArray) ? modelArray[0] : modelArray;

    if (!model?.field || !model?.sort) {
      // reset to default only if not already default
      const isAlreadyDefault =
        (formSort?.activeKey || "formName") === "formName" &&
        (formSort?.formName?.sortOrder || "asc") === "asc";
      if (!isAlreadyDefault) {
        const resetSort = Object.keys(formSort || {}).reduce((acc, key) => {
          acc[key] = { sortOrder: "asc" };
          return acc;
        }, {});
        dispatch(setClientFormListSort({ ...resetSort, activeKey: "formName" }));
      }
      return;
    }

    const incomingField = model.field;
    const incomingOrder = model.sort;
    const currentActiveKey = formSort?.activeKey || "formName";
    const currentField = sortKeyToGridField[currentActiveKey] || currentActiveKey;
    const currentOrder = formSort?.[currentActiveKey]?.sortOrder || "asc";
    if (incomingField === currentField && incomingOrder === currentOrder) return;

    const mappedKey = gridFieldToSortKey[incomingField] || incomingField;
    const updatedSort = Object.keys(formSort || {}).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === mappedKey ? incomingOrder : "asc" };
      return acc;
    }, {});
    dispatch(setClientFormListSort({ ...updatedSort, activeKey: mappedKey }));
  };

  const paginationModel = React.useMemo(
    () => ({ page: pageNo - 1, pageSize: limit }),
    [pageNo, limit]
  );

  const onPaginationModelChange = ({ page, pageSize }) => {
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
  };

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
        <Paper sx={{ height: { sm: 400, md: 510, lg: 665 }, width: "100%" }}>
          <DataGrid
            columns={columns}
            rows={rows}
            rowCount={totalForms}
            loading={searchFormLoading}
            paginationMode="server"
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            onPaginationModelChange={onPaginationModelChange}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            rowHeight={55}
            disableColumnMenu
            disableRowSelectionOnClick
          />
        </Paper>
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

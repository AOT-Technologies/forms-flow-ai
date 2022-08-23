import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import { useDispatch } from "react-redux";
import ListGroup from "react-bootstrap/ListGroup";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Errors } from "react-formio/lib/components";
import Loading from "../../containers/Loading";
import { connect } from "react-redux";
import { updateAuthorization } from "../../apiManager/services/dashboardsService";
import Popover from "@material-ui/core/Popover";
import { updateDashboardAuthorizationList } from "../../actions/dashboardActions";
import { Translation, useTranslation } from "react-i18next";
import Head from "../../containers/Head";
import { customDropUp } from "../Application/table";

export const InsightDashboard = React.memo((props) => {
  const { dashboardReducer } = props;
  const dispatch = useDispatch();
  const dashboards = dashboardReducer.dashboards;
  const groups = dashboardReducer.groups;
  const isGroupUpdated = dashboardReducer.isGroupUpdated;
  const isDashUpdated = dashboardReducer.isDashUpdated;
  const isloading = dashboardReducer.isloading;
  const isError = dashboardReducer.iserror;
  const error = dashboardReducer.error;
  const authorizations = dashboardReducer.authorizations;
  const authDashBoardList = dashboardReducer.authDashBoards;
  const isAuthRecieved = dashboardReducer.isAuthRecieved;
  const isAuthUpdated = dashboardReducer.isAuthUpdated;

  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [remainingGroups, setRemainingGroups] = useState([]);

  const [activeRow, setActiveRow] = useState(null);
  const [show, setShow] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(5);

  function compare(a, b) {
    if (Number(a.resourceId) < Number(b.resourceId)) {
      return -1;
    }
    if (Number(a.resourceId) > Number(b.resourceId)) {
      return 1;
    }
    return 0;
  }

  const updateAuthList = () => {
    let newList = [...authorizations];
    let authIds = newList.map((item) => Number(item.resourceId));
    for (let item of dashboards) {
      if (!authIds.includes(item.id)) {
        let obj = {
          resourceId: String(item.id),
          resourceDetails: {
            name: item.name,
          },
          roles: [],
        };
        newList.push(obj);
      }
    }
    return newList.sort(compare);
  };

  useEffect(() => {
    if (isDashUpdated && isAuthRecieved && !isAuthUpdated) {
      let authList = updateAuthList();
      dispatch(updateDashboardAuthorizationList(authList));
    }
  }, [isDashUpdated, isAuthRecieved, isAuthUpdated]);

  // handles the add button click event
  const handleClick = (event, rowData) => {
    let approvedGroupIds = rowData.roles;
    let listGroup = groups.filter(
      (item) => approvedGroupIds.includes(item.path) === false
    );
    setActiveRow(rowData);
    setRemainingGroups(listGroup);
    setShow(!show);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setShow(false);
    setAnchorEl(null);
  };

  const id = show ? "simple-popover" : undefined;

  const removeDashboardAuth = (rowData, groupPath) => {
    let dashboard = {
      ...authDashBoardList.find(
        (element) => element.resourceId === rowData.resourceId
      ),
    };
    let modifiedRoles = dashboard.roles.filter((item) => item !== groupPath);
    dashboard.roles = modifiedRoles;
    dispatch(updateAuthorization(dashboard));
  };

  const addDashboardAuth = (data) => {
    let currentRow = { ...activeRow };
    currentRow.roles = [...activeRow.roles, data.path];
    setActiveRow(currentRow);
    setShow(!show);
    dispatch(updateAuthorization(currentRow));
  };

  const columns = [
    {
      dataField: "resourceDetails.name",
      text: <Translation>{(t) => t("Dashboard")}</Translation>,
    },
    {
      dataField: "roles",
      text: <Translation>{(t) => t("Access Groups")}</Translation>,
      formatter: (cell, rowData) => {
        return (
          <div className="d-flex flex-wrap">
            {cell?.map((label, i) => (
              <div key={i} className="chip-element mr-2">
                <span className="chip-label">
                  {label}{" "}
                  <span
                    className="chip-close"
                    data-testid={rowData.resourceDetails.name + label}
                    onClick={() => removeDashboardAuth(rowData, label)}
                  >
                    <i className="fa fa-close"></i>
                  </span>
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      dataField: "resourceId",
      text: <Translation>{(t) => t("Action")}</Translation>,
      formatExtraData: { show, remainingGroups, isGroupUpdated },
      formatter: (cell, rowData, rowIdx, formatExtraData) => {
        let { show, remainingGroups, isGroupUpdated } = formatExtraData;
        return (
          <div>
            <Button
              data-testid={rowIdx}
              onClick={(e) => handleClick(e, rowData)}
              className="btn btn-primary btn-md form-btn pull-left btn-left"
              disabled={!isGroupUpdated}
            >
              <Translation>{(t) => t("Add")}</Translation> <b>+</b>
            </Button>
            <Popover
              data-testid="popup-component"
              id={id}
              open={show}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <ListGroup>
                {remainingGroups.length > 0 ? (
                  remainingGroups.map((item, key) => (
                    <ListGroup.Item
                      key={key}
                      as="button"
                      onClick={() => addDashboardAuth(item)}
                    >
                      {item.path}
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>{`${t(
                    "All groups have access to the dashboard"
                  )}`}</ListGroup.Item>
                )}
              </ListGroup>
            </Popover>
          </div>
        );
      },
    },
  ];

  const getpageList = () => {
    const list = [
      {
        text: "5",
        value: 5,
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
        value: dashboards.length,
      },
    ];
    return list;
  };

  const handleSizeChange = (sizePerPage, page) => {
    setActivePage(page);
    setSizePerPage(sizePerPage);
  };

  const customTotal = (from, to, size) => (
    <span className="react-bootstrap-table-pagination-total" role="main">
      <Translation>{(t) => t("Showing")}</Translation> {from}{" "}
      <Translation>{(t) => t("to")}</Translation> {to}{" "}
      <Translation>{(t) => t("of")}</Translation> {size}{" "}
      <Translation>{(t) => t("Results")}</Translation>
    </span>
  );

  const pagination = paginationFactory({
    showTotal: true,
    align: "left",
    sizePerPageList: getpageList(),
    page: activePage,
    sizePerPage: sizePerPage,
    paginationTotalRenderer: customTotal,
    onPageChange: (page) => setActivePage(page),
    onSizePerPageChange: (size, page) => handleSizeChange(size, page),
    sizePerPageRenderer: customDropUp,
  });

  if (isloading) {
    if (isError) {
      return <Errors errors={error} />;
    }
    return <Loading />;
  }

  const headerList = () => {
    return [
      {
        name: "Dashboard",
        count: dashboards.length,
        icon: "user-circle-o",
      },
    ];
  };

  let headOptions = headerList();
  return (
    <>
      <div className="container" role="definition">
        <Head items={headOptions} page="Dashboard" />
        <br />
        <div>
          {dashboards.length ? (
            <BootstrapTable
              keyField="resourceId"
              data={authDashBoardList}
              columns={columns}
              pagination={pagination}
            />
          ) : (
            <h3 className="text-center">
              <Translation>{(t) => t("No Dashboards Found")}</Translation>
            </h3>
          )}
        </div>
      </div>
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    dashboardReducer: state.dashboardReducer,
  };
};

export default connect(mapStateToProps)(InsightDashboard);

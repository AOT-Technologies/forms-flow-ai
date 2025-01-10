import React from "react";
import { NavDropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedBPMFilter,
  setSelectedTaskID,
  setBPMTaskListActivePage,
} from "../../../actions/bpmTaskActions";
import { Link } from "react-router-dom";
import { useTranslation, Translation } from "react-i18next";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import userRoles from "../../../constants/permissions";

const ServiceFlowFilterListDropDown = React.memo(
  ({ selectFilter, openFilterDrawer }) => {
    const dispatch = useDispatch();
    const filterList = useSelector((state) => state.bpmTasks.filtersAndCount);
    const filterListItems = useSelector((state) => state.bpmTasks.filterList);

    const isFilterLoading = useSelector(
      (state) => state.bpmTasks.isFilterLoading
    );

    const selectedFilter = useSelector(
      (state) => state.bpmTasks.selectedFilter
    );
    const { t } = useTranslation();
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
    const { viewFilters, createFilters, manageAllFilters } = userRoles();

    const changeFilterSelection = (filter) => {
      const selectedFilterItem = filterListItems.find(
        (item) => item.id === filter.id
      );
      dispatch(setSelectedBPMFilter(selectedFilterItem));
      dispatch(setSelectedTaskID(null));
      dispatch(setBPMTaskListActivePage(1));
    };

    const handleFilter = (id, editPermission) => {
      openFilterDrawer(true);
      const selectedFilter = filterListItems.find((item) => item.id === id);
      selectFilter(selectedFilter, editPermission);
    };

    const renderFilterList = () => {
      if (filterList.length) {
        return (
          <>
            {filterList.map((filter, index) => {
              const matchingFilterItem = filterListItems.find(
                (item) => item.id === filter.id
              );
              const editPermission =
                matchingFilterItem && matchingFilterItem.editPermission;
              return (
                <NavDropdown.Item
                  as={Link}
                  to={`${redirectUrl}task`}
                  className={`main-nav nav-item ${
                    filter?.id === selectedFilter?.id ? "active-tab" : ""
                  }`}
                  key={index}
                >
                  <div className="d-flex align-items-center">
                    <span
                      onClick={() => changeFilterSelection(filter)}
                      className="w-100"
                    >
                      {filter?.name} {`(${filter.count || 0})`}
                    </span>
                    <button
                      onClick={() => {
                        handleFilter(
                          filter?.id,
                          (createFilters || manageAllFilters) && editPermission
                        );
                      }}
                      className="btn btn-link"
                    >
                      <i
                        className={`me-1 fa fa-${
                          (createFilters || manageAllFilters) && editPermission
                            ? "pencil"
                            : viewFilters
                            ? `eye`
                            : ""
                        }`}
                      />
                      <Translation>
                        {(t) =>
                          t(
                            (createFilters || manageAllFilters) &&
                              editPermission
                              ? `Edit`
                              : viewFilters
                              ? `View`
                              : ""
                          )
                        }
                      </Translation>
                    </button>
                  </div>
                </NavDropdown.Item>
              );
            })}
          </>
        );
      } else {
        return (
          <NavDropdown.Item className="not-selected mt-2 ms-1">
            <i className="fa fa-info-circle me-2 mt-1" />
            {t("No Filters Found")}
          </NavDropdown.Item>
        );
      }
    };

    return (
      <div className="task-list">
        {isFilterLoading ? (
          <NavDropdown.Item>{t("Loading")}...</NavDropdown.Item>
        ) : (
          renderFilterList()
        )}
      </div>
    );
  }
);

export default ServiceFlowFilterListDropDown;

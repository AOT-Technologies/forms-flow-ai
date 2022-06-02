import React /*{useEffect}*/ from "react";
import { NavDropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedBPMFilter,
  setSelectedTaskID,
} from "../../../actions/bpmTaskActions";
import { Link } from "react-router-dom";
/*import {Link} from "react-router-dom";*/
import { useTranslation } from "react-i18next";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";

const ServiceFlowFilterListDropDown = React.memo(() => {
  const dispatch = useDispatch();
  const filterList = useSelector((state) => state.bpmTasks.filterList);
  const isFilterLoading = useSelector(
    (state) => state.bpmTasks.isFilterLoading
  );
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const { t } = useTranslation();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const changeFilterSelection = (filter) => {
    dispatch(setSelectedBPMFilter(filter));
    dispatch(setSelectedTaskID(null));
  };

  const renderFilterList = () => {
    if (filterList.length) {
      return (
        <>
          {filterList.map((filter, index) => (
            <NavDropdown.Item
              as={Link}
              to={`${redirectUrl}task`}
              className={`main-nav nav-item ${
                filter?.id === selectedFilter?.id ? "active-tab" : ""
              }`}
              key={index}
              onClick={() => changeFilterSelection(filter)}
            >
              {filter?.name} {`(${filter.itemCount || 0})`}
            </NavDropdown.Item>
          ))}
        </>
      );
    } else {
      return (
        <NavDropdown.Item className="not-selected mt-2 ml-1">
          <i className="fa fa-info-circle mr-2 mt-1" />
          {t("No Filters Found")}
        </NavDropdown.Item>
      );
    }
  };
  return (
    <>
      {isFilterLoading ? (
        <NavDropdown.Item>{t("Loading")}...</NavDropdown.Item>
      ) : (
        renderFilterList()
      )}
    </>
  );
});

export default ServiceFlowFilterListDropDown;

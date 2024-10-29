import React from "react";
import { useTranslation } from "react-i18next";
import Pagination from "react-js-pagination";
import { Dropdown } from "react-bootstrap";
import { HelperServices } from "@formsflow/service";
import { CustomButton, DownArrowIcon } from "@formsflow/components";
import PropTypes from "prop-types";

export const ReusableTableRow = ({ item, gotoEdit, buttonLabel }) => {
  const { t } = useTranslation();
  return (
    <tr>
      <td className="w-25">
        <span className="ms-4">{item.name}</span>
      </td>
      <td className="w-20">
        <span>{item.parentProcessKey}</span>
      </td>
      <td className="w-15">{HelperServices?.getLocaldate(item.modified)}</td>
      <td className="w-15">
        <span
          data-testid={`sub-flow-status-${item._id}`}
          className="d-flex align-items-center"
        >
          <span
            className={
              item.status === "active" ? "status-live" : "status-draft"
            }
          ></span>
          {item.status === "active" ? t("Live") : t("Draft")}
        </span>
      </td>
      <td className="w-25">
        <span className="d-flex justify-content-end">
          <CustomButton
            variant="secondary"
            size="sm"
            label={t("Edit")}
            ariaLabel={`Edit ${buttonLabel} Button`}
            onClick={() => gotoEdit(item)}
            dataTestid={`Edit ${buttonLabel} Button`}
          />
        </span>
      </td>
    </tr>
  );
};
ReusableTableRow.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    parentProcessKey: PropTypes.string,
    modified: PropTypes.string,
    status: PropTypes.string,
    _id: PropTypes.string.isRequired,
  }).isRequired,
  gotoEdit: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
};
export const TableFooter = ({
  limit,
  activePage,
  totalCount,
  handlePageChange,
  onLimitChange,
  pageOptions,
}) => {
  const { t } = useTranslation();

  return (
    <tr>
      <td colSpan={3}>
        <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
          <span className="ms-2">
            {t("Showing")} {(limit * activePage) - (limit - 1)} {t("to")}&nbsp;
            {Math.min(limit * activePage, totalCount)} {t("of")}&nbsp;
            {totalCount} {t("results")}
          </span>
        </div>
      </td>
      <td colSpan={3}>
        <div className="d-flex align-items-center justify-content-around">
          <Pagination
            activePage={activePage}
            itemsCountPerPage={limit}
            totalItemsCount={totalCount}
            pageRangeDisplayed={5}
            itemClass="page-item"
            linkClass="page-link"
            onChange={handlePageChange}
          />
        </div>
      </td>
      <td colSpan={3}>
        <div className="d-flex align-items-center justify-content-end">
          <span className="pagination-text">{t("Rows per page")}</span>
          <div className="pagination-dropdown">
            <Dropdown data-testid="page-limit-dropdown">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-basic"
                data-testid="page-limit-dropdown-toggle"
              >
                {limit}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {pageOptions.map((option) => (
                  <Dropdown.Item
                    key={option.value}
                    type="button"
                    data-testid={`page-limit-dropdown-item-${option.value}`}
                    onClick={() => onLimitChange(option.value)}
                  >
                    {option.text}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <DownArrowIcon />
          </div>
        </div>
      </td>
    </tr>
  );
};
TableFooter.propTypes = {
  limit: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
  pageOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
};

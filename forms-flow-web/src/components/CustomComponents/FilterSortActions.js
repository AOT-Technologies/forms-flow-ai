import React from "react";
import { FilterIcon, RefreshIcon, SortModal } from "@formsflow/components";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const FilterSortActions = ({
  showSortModal,
  handleFilterIconClick,
  handleRefresh,
  handleSortModalClose,
  handleSortApply,
  defaultSortOption,
  defaultSortOrder,
  optionSortBy,
  filterDataTestId,
  filterAriaLabel,
  refreshDataTestId,
  refreshAriaLabel,
}) => {
  const { t } = useTranslation();

  // Handle keydown event to trigger click on Enter/Space key press
  const handleKeyDown = (event, handler) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Prevent default behavior for space key
      handler();
    }
  };

  return (
    <>
      <span
        data-testid={filterDataTestId}
        aria-label={filterAriaLabel}
        onClick={handleFilterIconClick}
        tabIndex="0" // Make the element focusable
        onKeyDown={(e) => handleKeyDown(e, handleFilterIconClick)} // Add keyboard interaction
        role="button" // Indicate that it's a clickable element
      >
        <FilterIcon />
      </span>

      <span
        data-testid={refreshDataTestId}
        aria-label={refreshAriaLabel}
        onClick={handleRefresh}
        tabIndex="0" // Make the element focusable
        onKeyDown={(e) => handleKeyDown(e, handleRefresh)} // Add keyboard interaction
        role="button" // Indicate that it's a clickable element
      >
        <RefreshIcon />
      </span>

      {showSortModal && (
        <SortModal
          firstItemLabel={t("Sort By")}
          secondItemLabel={t("In a")}
          showSortModal={showSortModal}
          onClose={handleSortModalClose}
          primaryBtnAction={handleSortApply}
          modalHeader={t("Sort")}
          primaryBtnLabel={t("Sort Results")}
          secondaryBtnLabel={t("Cancel")}
          optionSortBy={optionSortBy}
          optionSortOrder={[
            { value: "asc", label: t("Ascending") },
            { value: "desc", label: t("Descending") },
          ]}
          defaultSortOption={defaultSortOption}
          defaultSortOrder={defaultSortOrder}
          primaryBtndataTestid="apply-sort-button"
          secondaryBtndataTestid="cancel-sort-button"
          primaryBtnariaLabel={t("Apply sorting")}
          secondaryBtnariaLabel={t("Cancel sorting")}
          closedataTestid="close-sort-modal"
        />
      )}
    </>
  );
};

FilterSortActions.propTypes = {
  showSortModal: PropTypes.bool.isRequired,
  handleFilterIconClick: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  handleSortModalClose: PropTypes.func.isRequired,
  handleSortApply: PropTypes.func.isRequired,
  defaultSortOption: PropTypes.string.isRequired,
  defaultSortOrder: PropTypes.string.isRequired,
  optionSortBy: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  filterDataTestId: PropTypes.string.isRequired,
  filterAriaLabel: PropTypes.string.isRequired,
  refreshDataTestId: PropTypes.string.isRequired,
  refreshAriaLabel: PropTypes.string.isRequired,
};

export default FilterSortActions;

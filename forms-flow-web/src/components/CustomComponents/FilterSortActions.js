import React from "react";
import { FilterIcon, RefreshIcon, SortModal } from "@formsflow/components";
import PropTypes from "prop-types";
import { useTranslation  } from "react-i18next";

const FilterSortActions = ({
  showSortModal,
  handleFilterIconClick,
  handleRefresh,
  handleSortModalClose,
  handleSortApply,
  defaultSortOption,
  defaultSortOrder,
  optionSortBy,  // Accept optionSortBy as a prop
}) => {
  const { t } = useTranslation();
  return (
    <>
      <FilterIcon onClick={handleFilterIconClick} />
      <RefreshIcon onClick={handleRefresh} />
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
        />
      )}
    </>
  );
};

// Add propTypes to validate props
FilterSortActions.propTypes = {
  showSortModal: PropTypes.bool.isRequired,
  handleFilterIconClick: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  handleSortModalClose: PropTypes.func.isRequired,
  handleSortApply: PropTypes.func.isRequired,
  defaultSortOption: PropTypes.string.isRequired,
  defaultSortOrder: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired, 
  optionSortBy: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default FilterSortActions;

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation  } from "react-i18next";
import { SortIcon } from "@formsflow/components";
import { StyleServices } from "@formsflow/service";

const SortableHeader = ({ columnKey, title, currentSort, handleSort,className = "" }) => {
    const { t } = useTranslation();
    const sortedOrder = currentSort[columnKey]?.sortOrder; 
    const isSorted = currentSort.activeKey === columnKey;
    const iconColor = isSorted 
    ? StyleServices.getCSSVariable('--ff-primary') 
    : StyleServices.getCSSVariable('--ff-gray-medium-dark');
    const handleKeyDown = (event)=>{
      if (event.key === 'Enter') {  
        handleSort(columnKey);
        }
    };
  
    return (
      <th className={`header-sortable ${className}`}>
        <button
          onClick={() => handleSort(columnKey)}
          onKeyDown={handleKeyDown} 
          aria-pressed={isSorted}
          data-testid = {`${title}-header-btn`}
          aria-label={`${title}-header-btn`}
        >
          <span className="text">{t(title)}</span>
          <span className={sortedOrder === "asc" ? "arrow-up" : "arrow-down"}>
          <SortIcon color={iconColor} dataTestId={`${(title).toLowerCase()}-sort`}/>
        </span>
        </button>
      </th>
    );
  };
  SortableHeader.propTypes = {
    columnKey: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    currentSort: PropTypes.shape({
      activeKey: PropTypes.string.isRequired,
      sortOrder: PropTypes.oneOf(['asc', 'desc']), 
    }).isRequired,
    handleSort: PropTypes.func.isRequired,
    className: PropTypes.string,              
  };

  SortableHeader.defaultProps = {
    className: '',
  };

  export default SortableHeader ;
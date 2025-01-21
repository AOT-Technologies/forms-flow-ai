import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation  } from "react-i18next";
import { SortIcon } from "@formsflow/components";
import { StyleServices } from "@formsflow/service";

const SortableHeader = ({ columnKey, title, currentSort, handleSort,className = "" }) => {
    const { t } = useTranslation();
    const sortedOrder = currentSort[columnKey]?.sortOrder; 
    const isSorted = currentSort[columnKey] !== undefined;
    const handleKeyDown = (event)=>{
      if (event.key === 'Enter') {  
        handleSort(columnKey);
        }
    };
    const grayColor = StyleServices.getCSSVariable('--ff-gray-400');
    return (
      <button
        className={`button-as-div ${className}`}
        onClick={() => handleSort(columnKey)}
        onKeyDown={handleKeyDown} 
        aria-pressed={isSorted}
        data-testid = {`${title}-header-btn`}
        aria-label={`${title}-header-btn`}
      >
        <span className="mt-1">{t(title)}</span>
        <span className={sortedOrder === "asc" ? "arrow-up" : "arrow-down"}>
        <SortIcon color={grayColor}/>
      </span>
      </button>
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
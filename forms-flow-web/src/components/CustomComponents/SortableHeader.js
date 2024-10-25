import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation  } from "react-i18next";

const SortableHeader = ({ columnKey, title, currentSort, handleSort,className }) => {
    const { t } = useTranslation();
    const isSorted = currentSort.sortBy === columnKey;
    const sortedOrder = isSorted ? currentSort.sortOrder : "asc";
    const handleKeyDown = (event)=>{
      if (event.key === 'Enter') {  
        handleSort(columnKey);
        }
    };
    return (
      <div
        className= {`d-flex align-items-center justify-content-between cursor-pointer ${className || ''}`}
        onClick={() => handleSort(columnKey)}
        onKeyDown={handleKeyDown} 
        role="button"
        tabIndex = "0"
        aria-pressed={isSorted}
      >
        <span className="mt-1">{t(title)}</span>
        <span>
          {sortedOrder === "asc" ? (
            <i
            data-testid={`${columnKey}-asc-sort-icon`}
            className="fa fa-arrow-up sort-icon fs-16 ms-2"
            data-toggle="tooltip"
            title={t("Ascending")}
          ></i>
          ) : (
            <i
            data-testid={`${columnKey}-desc-sort-icon`}
            className="fa fa-arrow-down sort-icon fs-16 ms-2"
            data-toggle="tooltip"
            title={t("Descending")}
          ></i>
          )}
        </span>
      </div>
    );
  };
  SortableHeader.propTypes = {
    columnKey: PropTypes.string.isRequired,  
    title: PropTypes.string.isRequired,      
    currentSort: PropTypes.shape({
      sortBy: PropTypes.string,
      sortOrder: PropTypes.string
    }).isRequired,                          
    handleSort: PropTypes.func.isRequired,     
    className: PropTypes.string              
  };

  SortableHeader.defaultProps = {
    className: '',
  };

  export default SortableHeader ;
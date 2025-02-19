import PropTypes from 'prop-types';

export const CustomButton = ({ 
  onClick, 
  label, 
  dataTestId, 
  variant, 
  size, 
  className = "", 
  ariaLabel, 
  disabled = false 
}) => {
  // Create base className and add size and variant if present
  let buttonClass = className;
  
  if (size) {
    buttonClass += ` btn-${size}`;
  }
  
  if (variant) {
    buttonClass += ` btn-${variant}`;
  }

  return (
    
       <button
      onClick={onClick}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      className={buttonClass}
      disabled={disabled}
    >
      {label}
    </button>
   
  );
};


CustomButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  dataTestId: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  disabled: PropTypes.bool
};

const NormalDropdown = ({ 
  limit, 
  onLimitChange, 
  pageOptions, 
  isDropdownOpen, 
  toggleDropdown,
  'data-testid': dataTestId 
}) => {
  return (
    <div className="normal-dropdown" data-testid={dataTestId}>
      <button
        className="dropdown-toggle"
        onClick={toggleDropdown}
        data-testid="page-size-dropdown"
      >
        {limit}
      </button>
      <ul className="dropdown-menu" style={{ display: isDropdownOpen ? 'block' : 'none' }}>
        {pageOptions?.map((option) => (
          <li
            key={option.value}
            data-testid={`page-size-option-${option.value}`}
            onClick={() => {
              onLimitChange(option.value);
              toggleDropdown();
            }}
          >
            {`${option.value} per page`}
          </li>
        ))}
      </ul>
    </div>
  );
};
export const TableFooter = ({
  limit,
  activePage,
  totalCount,
  handlePageChange,
  onLimitChange,
  pageOptions,
  isDropdownOpen,
  toggleDropdown,
  dataTestId="table-footer"
}) => {
  return (
    <tr data-testid={dataTestId}>
      <td colSpan={3}>
        <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
          <span data-testid="items-count">
            Showing {limit * activePage - (limit - 1)} to&nbsp;
            {Math.min(limit * activePage, totalCount)} of&nbsp;
            <span data-testid="total-items">{totalCount}</span>
          </span>
        </div>
      </td>
      <td colSpan={3}>
        <div className="d-flex align-items-center">
          <button data-testid="left-button" onClick={() => handlePageChange(activePage - 1)}>
            <AngleLeftIcon />
          </button>
          <span data-testid="current-page-display">{activePage}</span>
          <button data-testid="right-button" onClick={() => handlePageChange(activePage + 1)}>
            <AngleRightIcon />
          </button>
        </div>
      </td>
      {pageOptions && (
        <td colSpan={3}>
          <div className="d-flex align-items-center justify-content-end">
            <span className="pagination-text">Rows per page</span>
            <div className="pagination-dropdown">
              <NormalDropdown
                data-testid="page-size-select"
                limit={limit}
                onLimitChange={onLimitChange}
                pageOptions={pageOptions}
                isDropdownOpen={isDropdownOpen}
                toggleDropdown={toggleDropdown}
              />
            </div>
          </div>
        </td>
      )}
    </tr>
  );
};


export const CloseIcon = ({ 
  onClick, 
  dataTestId 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="5"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M1.5 1.5L12.5 12.5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12.5 1.5L1.5 12.5"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

CloseIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  dataTestId: PropTypes.string
};

export const AngleLeftIcon = ({
  onClick,
  dataTestId="left-icon"
}) => {
  return (
    <button
      className="left-icon-container"
      onClick={onClick}
      data-testid={dataTestId}
      aria-label="Left Icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="15"
        viewBox="0 0 10 15"
        fill="none"
        onClick={onClick}
      >
        <path
          d="M8.2501 14.0005L1.74951 7.4999L8.24951 0.999901"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>

  );
} 

export const AngleRightIcon = ({
  onClick,
  dataTestId="right-icon"
}) => {
  return (
    <button
      className="right-icon-container"
      onClick={onClick}
      data-testid={dataTestId}
      aria-label="Right Icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="15"
        viewBox="0 0 10 15"
        fill="none"
        onClick={onClick}
      >
        <path
          d="M8.2501 14.0005L1.74951 7.4999L8.24951 0.999901"
          // stroke={props.disabled ? grayColor : color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>

  );
} 

export const DownArrowIcon = ({
  downIconClick,
  downIconDataTestId
}) => {
  return (
    <button
      className="left-icon-container"
      onClick={downIconClick}
      data-testid={downIconDataTestId}
      aria-label="Down Icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="15"
        viewBox="0 0 10 15"
        fill="none"
        onClick={onClick}
      >
        <path
          d="M8.2501 14.0005L1.74951 7.4999L8.24951 0.999901"
          stroke={props.disabled ? grayColor : color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>

  );
}

export const FilterIcon = ({ 
  handleFilterIconClick, 
  filterDataTestId 
}) => {
  return (
    <button
      className="filter-icon-container"
      onClick={handleFilterIconClick}
      data-testid={filterDataTestId}
      aria-label="Filter Icon"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M1.5 1.5L12.5 12.5"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12.5 1.5L1.5 12.5"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};

FilterIcon.propTypes = {
  handleFilterIconClick: PropTypes.func,
  filterDataTestId: PropTypes.string
};

export const RefreshIcon = ({ 
  handleRefresh, 
  refreshDataTestId 
}) => {
  return (
    <button 
      className="refresh-icon-button"
      onClick={handleRefresh}
      data-testid={refreshDataTestId}
      aria-label="Refresh Icon"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M7 1V0C3.14 0 0 3.14 0 7s3.14 7 7 7 7-3.14 7-7c0-1.72-.62-3.29-1.66-4.53L10.53 4.41C11.37 5.55 12 6.77 12 7c0 2.21-1.79 4-4 4s-4-1.79-4-4h1c0 1.66 1.34 3 3 3s3-1.34 3-3c0-.23-.14-.45-.34-.59l-1.86-1.67C9.41 5.71 8.25 5 7 5V4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2h1z"
          fill="#000"
        />
      </svg>
    </button>
  );
};


RefreshIcon.propTypes = {
  handleRefresh: PropTypes.func,
  refreshDataTestId: PropTypes.string
};

export const SortIcon = ({ 
  onClick, 
  dataTestId 
}) => {
  return (
    <button
      className="sort-icon-container"
      onClick={onClick}
      data-testid={dataTestId}
      aria-label="Sort Icon"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M3 6l4 4 4-4"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};



SortIcon.propTypes = {
  onClick: PropTypes.func,
  dataTestId: PropTypes.string
};

export const SortModal = ({
  showSortModal,
  onClose,
  primaryBtnAction,
  secondaryBtnAction,
  secondaryBtnLabel,
  optionSortBy,
  optionSortOrder,
  defaultSortOption,
  defaultSortOrder,
  firstItemLabel,
  secondItemLabel,
  isSaveBtnLoading
}) => {
  const [selectedOption, setSelectedOption] = useState(defaultSortOption);
  const [selectedOrder, setSelectedOrder] = useState(defaultSortOrder);

  return (
    <div data-testid="sort-modal">
      {showSortModal && (
        <div>
          <h1>{modalHeader}</h1>
          <div>
            <label>{firstItemLabel}</label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              {optionSortBy.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>{secondItemLabel}</label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
            >
              {optionSortOrder.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              primaryBtnAction?.(selectedOption, selectedOrder)
            }
            disabled={isSaveBtnLoading || !selectedOption || !selectedOrder}
          >
            {primaryBtnLabel}
          </button>

          <button onClick={secondaryBtnAction}>{secondaryBtnLabel}</button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

SortModal.propTypes = {
  showSortModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  primaryBtnAction: PropTypes.func.isRequired,
  secondaryBtnAction: PropTypes.func.isRequired,
  secondaryBtnLabel: PropTypes.string.isRequired,
  optionSortBy: PropTypes.array.isRequired,
  optionSortOrder: PropTypes.array.isRequired,
  defaultSortOption: PropTypes.string.isRequired,
  defaultSortOrder: PropTypes.string.isRequired,
  firstItemLabel: PropTypes.string.isRequired,
  secondItemLabel: PropTypes.string.isRequired,
  isSaveBtnLoading: PropTypes.bool.isRequired
};

export const FormBuilderModal = ({
  showBuildForm,
  onClose,
  handleChange,
  primaryBtnAction,
  secondaryBtnAction,
  setNameError,
  nameError,
  description,
  modalHeader,
  nameLabel,
  descriptionLabel,
  primaryBtnLabel,
  secondaryBtnLabel,
  placeholderForForm,
  placeholderForDescription,
  buildForm,
  checked,
  isSaveBtnLoading,
  isFormNameValidating
}) => {
  return (
    <div data-testid="form-builder-modal">
      {showBuildForm && (
        <div>
          <h1>{modalHeader}</h1>
          <label>{nameLabel}</label>
          <input
            type="text"
            placeholder={placeholderForForm}
            onChange={(e) => handleChange?.("title", e)}
          />
          <textarea
            placeholder={placeholderForDescription}
            onChange={(e) => handleChange?.("description", e)}
          />
          <button
           onClick={() => primaryBtnAction?.({ title: "mockTitle", description: "mockDesc" })}
            disabled={isSaveBtnLoading || isFormNameValidating}
          >
            {primaryBtnLabel}
          </button>
          <button onClick={secondaryBtnAction}>{secondaryBtnLabel}</button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

FormBuilderModal.propTypes = {
  showBuildForm: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  primaryBtnAction: PropTypes.func.isRequired,
  secondaryBtnAction: PropTypes.func.isRequired,
  setNameError: PropTypes.func.isRequired,
  nameError: PropTypes.bool.isRequired,
  description: PropTypes.string.isRequired,
  modalHeader: PropTypes.string.isRequired,
  nameLabel: PropTypes.string.isRequired,
  descriptionLabel: PropTypes.string.isRequired,
  primaryBtnLabel: PropTypes.string.isRequired,
  secondaryBtnLabel: PropTypes.string.isRequired,
  placeholderForForm: PropTypes.string.isRequired,
  placeholderForDescription: PropTypes.string.isRequired,
  buildForm: PropTypes.bool.isRequired,
  checked: PropTypes.bool.isRequired,
  isSaveBtnLoading: PropTypes.bool.isRequired,
  isFormNameValidating: PropTypes.bool.isRequired
};

export const CustomSearch = ({
  searchLoading,
  handleClearSearch,
  search,
  setSearch,
  handleSearch,
  placeholder = "Search...",
  title = "Search",
  dataTestId
}) => {
  return (
    <div data-testid={dataTestId}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={placeholder}
        title={title}
        aria-label={placeholder}
        data-testid="custom-search-input"
      />
      {search && !searchLoading && (
       <button
  className="d-flex search-box-icon"
  onClick={handleClearSearch}
  data-testid="form-search-clear-button"
  aria-label="Clear search"
>
  Clear
</button>

      )}
      {searchLoading && <div className="search-spinner">Loading...</div>}
    </div>
  );
};

CustomSearch.propTypes = {
  searchLoading: PropTypes.bool.isRequired,
  handleClearSearch: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  dataTestId: PropTypes.string
};

export const ImportModal = ({ showModal, onClose, onImport, isLoading, errorMessage }) => (
  <div>
    {showModal && (
      <div>
        <h1>Mocked ImportModal</h1>
        <button onClick={onClose}>Close</button>
        <button onClick={onImport}>Import</button>
      </div>
    )}
  </div>
);

ImportModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};


export const NoDataFound = () => {
  return (
    <div>
      <span className="no-data-text" data-testid="no-data-found">Nothing is found based on your search query. Please try again.</span>
    </div>
  );
};

NoDataFound.propTypes = {};

NormalDropdown.propTypes = {
  limit: PropTypes.number.isRequired,
  onLimitChange: PropTypes.func.isRequired,
  pageOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string
    })
  ),
  isDropdownOpen: PropTypes.bool.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
  'data-testid': PropTypes.string
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
      label: PropTypes.string
    })
  ),
  isDropdownOpen: PropTypes.bool.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
  dataTestId: PropTypes.string
};

AngleLeftIcon.propTypes = {
  onClick: PropTypes.func,
  dataTestId: PropTypes.string
};

SortIcon.propTypes = {
  onClick: PropTypes.func,
  downIconClick: PropTypes.func,
  disabled: PropTypes.bool,
  dataTestId: PropTypes.string
};



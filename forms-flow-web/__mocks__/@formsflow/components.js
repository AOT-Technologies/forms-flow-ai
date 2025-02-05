//mocked components from MF

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
  return (
    <button
      onClick={onClick}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      className={`${className} ${size ? `btn-${size}` : ''} ${variant ? `btn-${variant}` : ''}`}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export const CloseIcon = ({ 
  onClick, 
  dataTestId,  
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

export const FilterIcon = ({ 
  handleFilterIconClick, 
  filterDataTestId,  
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

export const RefreshIcon = ({ 
  handleRefresh, 
  refreshDataTestId,  
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

export const SortIcon = ({ 
  onClick, 
  dataTestId,  
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
  isSaveBtnLoading,
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
              primaryBtnAction && primaryBtnAction(selectedOption, selectedOrder)
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
    isFormNameValidating,
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
              onChange={(e) => handleChange && handleChange("title", e)}
            />
            <textarea
              placeholder={placeholderForDescription}
              onChange={(e) => handleChange && handleChange("description", e)}
            />
            <button
              onClick={() =>
                primaryBtnAction &&
                primaryBtnAction({ title: "mockTitle", description: "mockDesc" })
              }
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
          <span
            className="d-flex search-box-icon"
            onClick={handleClearSearch}
            data-testid="form-search-clear-button"
          >
            Clear
          </span>
        )}
        {searchLoading && <div className="search-spinner">Loading...</div>}
      </div>
    );
  };
  

  export const  ImportModal =  ({ showModal, onClose, onImport, isLoading, errorMessage }) => (
    <div>
      {showModal && (
        <div>
          <h1>Mocked ImportModal</h1>
          <button onClick={onClose}>Close</button>
          <button onClick={onImport}>Import</button>
        </div>
      )}
    </div>
  )

  export const TableFooter = ({
        limit,
        activePage,
        totalCount,
        handlePageChange,
        onLimitChange,
        pageOptions,
      }) => (
        <tr>
          <td colSpan={3}>
            <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
              <span>Showing {limit * activePage - (limit - 1)} to {Math.min(limit * activePage, totalCount)} of {totalCount}</span>
            </div>
          </td>
          {totalCount > 5 ? (
            <>
              <td colSpan={3}>
                <div className="d-flex align-items-center">
                  <div>Mocked Pagination</div>
                </div>
              </td>
              {pageOptions && (
                <td colSpan={3}>
                  <div className="d-flex align-items-center justify-content-end">
                    <span className="pagination-text">Rows per page</span>
                    <div className="pagination-dropdown">
                      <div>Mocked Dropdown for Limit</div>
                    </div>
                  </div>
                </td>
              )}
            </>
          ) : null}
        </tr>
      ) 

export const NoDataFound = ()=>{
    return (
        <div>
            <span className="no-data-text" data-testid="no-data-found">Nothing is found based on your search query. Please try again.</span>
        </div>
    )
}
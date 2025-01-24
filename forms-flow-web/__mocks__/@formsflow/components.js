export const CustomButton = ({ onClick, label }) => {
    return <button onClick={onClick}>{label}</button>;  
}


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
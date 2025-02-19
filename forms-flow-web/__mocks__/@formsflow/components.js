import PropTypes from 'prop-types';

export const CustomButton = ({ 
  onClick, 
  label = "Edit", 
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
  onClick: PropTypes.func,
  label: PropTypes.any,
  dataTestId: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  disabled: PropTypes.bool
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
      data-testid={dataTestId}
      onClick={onClick}
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
  onClick: PropTypes.func,
  dataTestId: PropTypes.string
};

export const FilterIcon = ({ 
  handleFilterIconClick, 
  filterDataTestId 
}) => {
  return (
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
  onClose: PropTypes.func,
  primaryBtnAction: PropTypes.func,
  secondaryBtnAction: PropTypes.func,
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
  onClose: PropTypes.func,
  handleChange: PropTypes.func,
  primaryBtnAction: PropTypes.func,
  secondaryBtnAction: PropTypes.func,
  setNameError: PropTypes.func,
  nameError: PropTypes.any,
  description: PropTypes.string,
  modalHeader: PropTypes.string,
  nameLabel: PropTypes.string,
  descriptionLabel: PropTypes.string,
  primaryBtnLabel: PropTypes.string,
  secondaryBtnLabel: PropTypes.string,
  placeholderForForm: PropTypes.string,
  placeholderForDescription: PropTypes.string,
  buildForm: PropTypes.bool,
  checked: PropTypes.bool,
  isSaveBtnLoading: PropTypes.bool,
  isFormNameValidating: PropTypes.bool
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
  handleClearSearch: PropTypes.func,
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func,
  handleSearch: PropTypes.func,
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
  onClose: PropTypes.func,
  onImport: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export const TableFooter = ({
  limit,
  activePage,
  totalCount,
  handlePageChange,
  onLimitChange,
  pageOptions
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
);

TableFooter.propTypes = {
  limit: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  pageOptions: PropTypes.array
};

export const NoDataFound = () => {
  return (
    <div>
      <span className="no-data-text" data-testid="no-data-found">Nothing is found based on your search query. Please try again.</span>
    </div>
  );
};

NoDataFound.propTypes = {};


export const ConfirmModal = ({show,
  onClose,
  secondayBtnAction,
  title,
  message,
  messageSecondary = '',
  primaryBtnAction,
  primaryBtnText,
  primaryBtnDisable = false,
  primaryBtndataTestid = 'Confirm-button',
  primaryBtnariaLabel = 'Confirm Button',
  buttonLoading= false,
  secondaryBtnText,
  secondaryBtnDisable = false,
  secondoryBtndataTestid = 'cancel-button',
  secondoryBtnariaLabel = 'Cancel Button',
  secondaryBtnLoading= false}) => {
  return (
    <dialog 
      data-testid="confirm-modal"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
      className="modal"
    >
      <div className="modal-content">
        <header>
          <h2 id="confirm-modal-title" data-testid="modal-title">Title</h2>
          <button data-testid="close-button" aria-label="Close modal">×</button>
        </header>
    
        <div data-testid="modal-body">
          <div id="confirm-modal-message">
            <p data-testid="primary-message">Primary message</p>
            <p data-testid="secondary-message">Secondary message</p>
          </div>
        </div>
    
        <footer>
          <button 
            data-testid="Confirm-button"
            className="primary"
            aria-label="Primary action"
            onClick={primaryBtnAction}
          >
            Primary
          </button>
          <button
            data-testid="secondary-button" 
            className="secondary"
            aria-label="Secondary action"
          >
            Secondary
          </button>
        </footer>
      </div>
    </dialog>
  );
};

ConfirmModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  secondayBtnAction: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  messageSecondary: PropTypes.string,
  primaryBtnAction: PropTypes.func,
  primaryBtnText: PropTypes.string,
  primaryBtnDisable: PropTypes.bool,
  primaryBtndataTestid: PropTypes.string,
  primaryBtnariaLabel: PropTypes.string,
  buttonLoading: PropTypes.bool,
  secondaryBtnText: PropTypes.string,
  secondaryBtnDisable: PropTypes.bool,
  secondoryBtndataTestid: PropTypes.string,
  secondoryBtnariaLabel: PropTypes.string,
  secondaryBtnLoading: PropTypes.bool,
};




export const BackToPrevIcon = ({ color = baseColor, onClick, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="33"
    viewBox="0 0 32 33"
    fill="none"
    onClick={onClick}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M29.9998 16.5C29.9998 16.2348 29.8945 15.9805 29.7069 15.7929C29.5194 15.6054 29.2651 15.5 28.9998 15.5H5.41383L11.7078 9.20804C11.8008 9.11507 11.8746 9.00469 11.9249 8.88321C11.9752 8.76173 12.0011 8.63153 12.0011 8.50004C12.0011 8.36855 11.9752 8.23835 11.9249 8.11688C11.8746 7.9954 11.8008 7.88502 11.7078 7.79204C11.6149 7.69907 11.5045 7.62531 11.383 7.575C11.2615 7.52468 11.1313 7.49878 10.9998 7.49878C10.8683 7.49878 10.7381 7.52468 10.6167 7.575C10.4952 7.62531 10.3848 7.69907 10.2918 7.79204L2.29183 15.792C2.19871 15.8849 2.12482 15.9953 2.07441 16.1168C2.024 16.2383 1.99805 16.3685 1.99805 16.5C1.99805 16.6316 2.024 16.7618 2.07441 16.8833C2.12482 17.0048 2.19871 17.1152 2.29183 17.208L10.2918 25.208C10.3848 25.301 10.4952 25.3748 10.6167 25.4251C10.7381 25.4754 10.8683 25.5013 10.9998 25.5013C11.1313 25.5013 11.2615 25.4754 11.383 25.4251C11.5045 25.3748 11.6149 25.301 11.7078 25.208C11.8008 25.1151 11.8746 25.0047 11.9249 24.8832C11.9752 24.7617 12.0011 24.6315 12.0011 24.5C12.0011 24.3686 11.9752 24.2384 11.9249 24.1169C11.8746 23.9954 11.8008 23.885 11.7078 23.792L5.41383 17.5H28.9998C29.2651 17.5 29.5194 17.3947 29.7069 17.2071C29.8945 17.0196 29.9998 16.7653 29.9998 16.5Z"
      fill="white"
    />
  </svg>
);

BackToPrevIcon.propTypes = {
  color: PropTypes.string,
  onClick: PropTypes.func,
};

export const CustomInfo = () => {
  return <div className={`info-panel`}>
  <div className="d-flex align-items-center">
    <InfoIcon />
    <div className="field-label ms-2">Note</div>
  </div>
  <div className="info-content">Sample content to show</div> 
</div>;
};

CustomInfo.propTypes = {};



export const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="33"
    viewBox="0 0 32 33"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M29.9998 16.5C29.9998 16.2348 29.8945 15.9805 29.7069 15.7929C29.5194 15.6054 29.2651 15.5 28.9998 15.5H5.41383L11.7078 9.20804C11.8008 9.11507 11.8746 9.00469 11.9249 8.88321C11.9752 8.76173 12.0011 8.63153 12.0011 8.50004C12.0011 8.36855 11.9752 8.23835 11.9249 8.11688C11.8746 7.9954 11.8008 7.88502 11.7078 7.79204C11.6149 7.69907 11.5045 7.62531 11.383 7.575C11.2615 7.52468 11.1313 7.49878 10.9998 7.49878C10.8683 7.49878 10.7381 7.52468 10.6167 7.575C10.4952 7.62531 10.3848 7.69907 10.2918 7.79204L2.29183 15.792C2.19871 15.8849 2.12482 15.9953 2.07441 16.1168C2.024 16.2383 1.99805 16.3685 1.99805 16.5C1.99805 16.6316 2.024 16.7618 2.07441 16.8833C2.12482 17.0048 2.19871 17.1152 2.29183 17.208L10.2918 25.208C10.3848 25.301 10.4952 25.3748 10.6167 25.4251C10.7381 25.4754 10.8683 25.5013 10.9998 25.5013C11.1313 25.5013 11.2615 25.4754 11.383 25.4251C11.5045 25.3748 11.6149 25.301 11.7078 25.208C11.8008 25.1151 11.8746 25.0047 11.9249 24.8832C11.9752 24.7617 12.0011 24.6315 12.0011 24.5C12.0011 24.3686 11.9752 24.2384 11.9249 24.1169C11.8746 23.9954 11.8008 23.885 11.7078 23.792L5.41383 17.5H28.9998C29.2651 17.5 29.5194 17.3947 29.7069 17.2071C29.8945 17.0196 29.9998 16.7653 29.9998 16.5Z"
      fill="white"
    />
  </svg>
);

export const FailedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="33"
    viewBox="0 0 32 33"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M29.9998 16.5C29.9998 16.2348 29.8945 15.9805 29.7069 15.7929C29.5194 15.6054 29.2651 15.5 28.9998 15.5H5.41383L11.7078 9.20804C11.8008 9.11507 11.8746 9.00469 11.9249 8.88321C11.9752 8.76173 12.0011 8.63153 12.0011 8.50004C12.0011 8.36855 11.9752 8.23835 11.9249 8.11688C11.8746 7.9954 11.8008 7.88502 11.7078 7.79204C11.6149 7.69907 11.5045 7.62531 11.383 7.575C11.2615 7.52468 11.1313 7.49878 10.9998 7.49878C10.8683 7.49878 10.7381 7.52468 10.6167 7.575C10.4952 7.62531 10.3848 7.69907 10.2918 7.79204L2.29183 15.792C2.19871 15.8849 2.12482 15.9953 2.07441 16.1168C2.024 16.2383 1.99805 16.3685 1.99805 16.5C1.99805 16.6316 2.024 16.7618 2.07441 16.8833C2.12482 17.0048 2.19871 17.1152 2.29183 17.208L10.2918 25.208C10.3848 25.301 10.4952 25.3748 10.6167 25.4251C10.7381 25.4754 10.8683 25.5013 10.9998 25.5013C11.1313 25.5013 11.2615 25.4754 11.383 25.4251C11.5045 25.3748 11.6149 25.301 11.7078 25.208C11.8008 25.1151 11.8746 25.0047 11.9249 24.8832C11.9752 24.7617 12.0011 24.6315 12.0011 24.5C12.0011 24.3686 11.9752 24.2384 11.9249 24.1169C11.8746 23.9954 11.8008 23.885 11.7078 23.792L5.41383 17.5H28.9998C29.2651 17.5 29.5194 17.3947 29.7069 17.2071C29.8945 17.0196 29.9998 16.7653 29.9998 16.5Z"
      fill="white"
    />
  </svg>
);

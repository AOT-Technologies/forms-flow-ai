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

// export const CustomSearch = ({
//   searchLoading,
//   handleClearSearch,
//   search,
//   setSearch,
//   handleSearch,
//   placeholder = "Search...",
//   title = "Search",
//   dataTestId
// }) => {
//   return (
//     <div data-testid={dataTestId}>
//       <input
//         type="text"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//         placeholder={placeholder}
//         title={title}
//         aria-label={placeholder}
//         data-testid="custom-search-input"
//       />
//       {search && !searchLoading && (
//        <button
//   className="d-flex search-box-icon"
//   onClick={handleClearSearch}
//   data-testid="form-search-clear-button"
//   aria-label="Clear search"
// >
//   Clear
// </button>

//       )}
//       {searchLoading && <div className="search-spinner">Loading...</div>}
//     </div>
//   );
// };

// CustomSearch.propTypes = {
//   searchLoading: PropTypes.bool.isRequired,
//   handleClearSearch: PropTypes.func,
//   search: PropTypes.string.isRequired,
//   setSearch: PropTypes.func,
//   handleSearch: PropTypes.func,
//   placeholder: PropTypes.string,
//   title: PropTypes.string,
//   dataTestId: PropTypes.string
// };

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


export const NoDataFound = ({message,dataTestId}) => {
  return (
    <div>
      <span className="no-data-text" data-testid={dataTestId}>{message}</span>
    </div>
  );
};

NoDataFound.propTypes = {}; 


// FlowEdit test
export const HistoryIcon = ({ 
  onClick, 
  dataTestId 
}) => {
  return (
    <button
      className="History-icon-container"
      onClick={onClick}
      data-testid={dataTestId}
      aria-label="History Icon"
    >
       <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill={color}
    {...props}
  >
    <g clipPath="url(#clip0_1459_2724)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 3.49996C6.91935 3.50038 5.86793 3.85089 5.00321 4.499C4.13848 5.14711 3.50701 6.05793 3.20336 7.09504C2.89972 8.13215 2.94025 9.23972 3.31889 10.2519C3.69752 11.264 4.39388 12.1262 5.30366 12.7094C6.21344 13.2926 7.28768 13.5653 8.36546 13.4867C9.44325 13.4082 10.4666 12.9825 11.2822 12.2736C12.0977 11.5646 12.6617 10.6105 12.8895 9.55416C13.1174 8.49781 12.9968 7.39607 12.546 6.41396C12.4969 6.29456 12.4959 6.1608 12.5432 6.04069C12.5906 5.92057 12.6825 5.82341 12.7998 5.76953C12.9171 5.71565 13.0507 5.70924 13.1727 5.75163C13.2946 5.79402 13.3954 5.88193 13.454 5.99696C13.995 7.17555 14.1396 8.49769 13.8661 9.76535C13.5926 11.033 12.9157 12.1779 11.9369 13.0286C10.9581 13.8793 9.73004 14.39 8.43664 14.4841C7.14325 14.5783 5.85416 14.2509 4.76247 13.5509C3.67078 12.8509 2.83526 11.8161 2.38106 10.6014C1.92686 9.38673 1.87843 8.05759 2.24303 6.81308C2.60763 5.56856 3.36563 4.47568 4.40348 3.69812C5.44134 2.92056 6.70318 2.50018 8 2.49996V3.49996Z"
        fill={color}
      />
      <path
        d="M8 4.96596V1.03396C8.00002 0.98646 8.01357 0.939945 8.03907 0.899865C8.06457 0.859785 8.10096 0.827799 8.14398 0.807653C8.187 0.787507 8.23487 0.780035 8.28198 0.786112C8.32909 0.792188 8.3735 0.811562 8.41 0.841964L10.77 2.80796C10.89 2.90796 10.89 3.09196 10.77 3.19196L8.41 5.15796C8.3735 5.18837 8.32909 5.20774 8.28198 5.21382C8.23487 5.21989 8.187 5.21242 8.14398 5.19228C8.10096 5.17213 8.06457 5.14014 8.03907 5.10006C8.01357 5.05998 8.00002 5.01347 8 4.96596Z"
        fill={color}
      />
    </g>
    <defs>
      <clipPath id="clip0_1459_2724">
        <rect
          width="16"
          height="16"
          fill={color}
          transform="translate(0 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
    </button>
  );
};

HistoryIcon.propTypes = {
  onClick: PropTypes.func,
  dataTestId: PropTypes.string
};

export const CurlyBracketsIcon = ({ 
  onClick, 
  dataTestId 
}) => {
  return (
    <button
      className="CurlyBrackets-icon-container"
      onClick={onClick}
      data-testid={dataTestId}
      aria-label="CurlyBrackets Icon"
    >
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="18"
    viewBox="0 0 16 18"
    fill="none"
  >
    <path
      d="M6 1.97852H5C4.44772 1.97852 4 2.42623 4 2.97852V6.52468C4 6.86428 3.82764 7.18068 3.54231 7.36485L1 9.00586L3.5547 10.709C3.8329 10.8945 4 11.2067 4 11.541V14.9785C4 15.5308 4.44772 15.9785 5 15.9785H6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 16.0215L11 16.0215C11.5523 16.0215 12 15.5738 12 15.0215L12 11.4753C12 11.1357 12.1724 10.8193 12.4577 10.6351L15 8.99414L12.4453 7.29101C12.1671 7.10554 12 6.79331 12 6.45896L12 3.02148C12 2.4692 11.5523 2.02148 11 2.02148L10 2.02148"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
    </button>
  );
};


CurlyBracketsIcon.propTypes = {
  onClick: PropTypes.func,
  dataTestId: PropTypes.string
};

export const ConfirmModal = ({
  show,
  onClose,
  handleChange,
  primaryBtnAction,
  secondaryBtnAction,
  modalHeader,
  message,
  messageSecondary = '',
  primaryBtnLabel,
  secondaryBtnLabel,
  primaryBtnDisable = false,
  secondaryBtnDisable = false,
  isPrimaryBtnLoading = false,
  isSecondaryBtnLoading = false,
}) => {
  return (
    <div data-testid="confirm-modal">
      {show && (
        <div>
          <h1>{modalHeader}</h1>
          <p data-testid="confirm-modal-primary-message">{message}</p>
          {messageSecondary && (
            <p data-testid="confirm-modal-secondary-message">{messageSecondary}</p>
          )}
          <button
            onClick={() => primaryBtnAction?.({ message: "mockMessage" })}
            disabled={primaryBtnDisable || isPrimaryBtnLoading}
          >
            {isPrimaryBtnLoading ? 'Loading...' : primaryBtnLabel}
          </button>
          <button
            onClick={secondaryBtnAction}
            disabled={secondaryBtnDisable || isSecondaryBtnLoading}
          >
            {isSecondaryBtnLoading ? 'Loading...' : secondaryBtnLabel}
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};
ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleChange: PropTypes.func,
  primaryBtnAction: PropTypes.func,
  secondaryBtnAction: PropTypes.func,
  modalHeader: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  messageSecondary: PropTypes.string,
  primaryBtnLabel: PropTypes.string.isRequired,
  secondaryBtnLabel: PropTypes.string.isRequired,
  primaryBtnDisable: PropTypes.bool,
  secondaryBtnDisable: PropTypes.bool,
  isPrimaryBtnLoading: PropTypes.bool,
  isSecondaryBtnLoading: PropTypes.bool,
}; 


export const HistoryModal = ({
  show,
  onClose,
  title,
  revertBtnAction,
  loadMoreBtnAction,
  revertBtnText,
  loadMoreBtnText,
  allHistory = [],
  historyCount = 0
}) => {
  return (
    <div data-testid="history-modal">
      {show && (
        <div>
          <h1>{title}</h1>
          <div className="history-content">
            {allHistory.map((entry, index) => (
              <div key={index} className="history-entry">
                <p>Version: {entry.version}</p>
                <p>Last Edited By: {entry.createdBy}</p>
                <button
                  onClick={() => revertBtnAction(entry.version)}
                  data-testid={`revert-button-${index}`}
                >
                  {revertBtnText}
                </button>
              </div>
            ))}
          </div>
          {historyCount > 4 && (
            <button onClick={loadMoreBtnAction} data-testid="load-more-button">
              {loadMoreBtnText}
            </button>
          )}
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

HistoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  revertBtnAction: PropTypes.func.isRequired,
  loadMoreBtnAction: PropTypes.func.isRequired,
  revertBtnText: PropTypes.string.isRequired,
  loadMoreBtnText: PropTypes.string.isRequired,
  allHistory: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string.isRequired,
      createdBy: PropTypes.string.isRequired,
    })
  ),
  historyCount: PropTypes.number,
};

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




export const BackToPrevIcon = ({ onClick, dataTestId, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="33"
    viewBox="0 0 32 33"
    fill="none"
    onClick={onClick}
    data-testid={dataTestId}
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
  dataTestId: PropTypes.string,
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

export const ReusableProcessTableRow = ({ item, buttonLabel, dataTestId="reusable-process-table-row" }) => {
  return (
    <tr data-testid={`process-table-row-${item.processKey}`}>
      <td className="w-25 text-ellipsis text-nowrap">
        <span>{item.name}</span>
      </td>
      <td className="w-20 text-ellipsis text-nowrap">
        <span>{item.processKey}</span>
      </td>
      <td className="w-15">{item.modified || 'N/A'}</td>
      <td className="w-15">
        <span data-testid={`sub-flow-status-${item.processKey}`} className="d-flex align-items-center">
          <span className={item.status === 'Published' ? 'status-live' : 'status-draft'}></span>
          {item.status === 'Published' ? 'Live' : 'Draft'}
        </span>
      </td>
      <td className="w-25">
        <span className="d-flex justify-content-end">
          <button
            className="btn btn-secondary btn-sm"
            aria-label={`Edit ${item.processKey} Button`}
            data-testid={`edit-button-${item.processKey}`}
          >
            Edit
          </button>
        </span>
      </td>
    </tr>
  );
};

ReusableProcessTableRow.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    processKey: PropTypes.string,
    modified: PropTypes.string,
    status: PropTypes.string,
    _id: PropTypes.string.isRequired,
  }).isRequired,
  buttonLabel: PropTypes.string.isRequired,
};

export const BuildModal = ({ show, title, contents }) => {
  return (
    <div
      data-testid="build-modal"
      aria-labelledby="build-modal-title"
      aria-describedby="build-modal-message"
      className={`mock-modal ${show ? "show" : "hide"}`}
    >
      {show && (
        <div className="mock-modal-content">
          <div className="mock-modal-header">
            <h2 id="build-modal-title">{title}</h2>
            <button data-testid="close-modal">X</button>
          </div>
          <div className="mock-modal-body d-flex">
            {contents.map(({ id, heading, body }) => (
              <button
                className="col-md-6 build-contents"
                key={id}
                tabIndex={0}
                aria-label={`Button for ${heading}`}
                data-testid={`button-${id}`}
              >
                <span className="mb-3 content-heading">{heading}</span>
                <span className="content-body">{body}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

BuildModal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  contents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      heading: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
    })
  ).isRequired,
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
    <div data-testid={`${dataTestId}-container`}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder={placeholder}
        title={title}
        aria-label={placeholder}
        data-testid={`${dataTestId}`}
      />
      {search && !searchLoading && (
        <button
          className="d-flex search-box-icon"
          onClick={handleClearSearch}
          data-testid={`${dataTestId}-clear-button`}
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
      {searchLoading && (
        <div className="search-spinner" data-testid={`${dataTestId}-loading`}>
          Loading...
        </div>
      )}
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
  dataTestId: PropTypes.string,
};


export const AngleLeftIcon = ({
  onClick,
  dataTestId="left-icon"
}) => {
  return (
 
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
  );
}

export const AngleRightIcon = ({
  onClick,
  dataTestId="right-icon"
}) => {
  return (

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
              <div key={`${entry.version}-${index}`} className="history-entry">
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


import PropTypes from 'prop-types';


export const ActionModal = ({
  newActionModal,
  onClose,
  CategoryType,
  onAction,
  published,
  isCreate,
  isMigrated,
  diagramType,
}) => {
  return (
    <div data-testid="mock-action-modal">
      <button data-testid="mock-close-btn" onClick={onClose}>Close</button>
      <button data-testid="mock-duplicate-btn" onClick={() => onAction("DUPLICATE")}>
        Duplicate
      </button>
      <p>CategoryType: {CategoryType}</p>
      <p>Published: {published ? "Yes" : "No"}</p>
      <p>DiagramType: {diagramType}</p>
    </div>
  );
};

ActionModal.propTypes = {
    newActionModal: PropTypes.bool,
    onClose: PropTypes.func,
    CategoryType: PropTypes.string,
    onAction: PropTypes.func,
    published: PropTypes.bool,
    isCreate: PropTypes.bool,
    isMigrated: PropTypes.bool, // Adding validation for isMigrated
    diagramType: PropTypes.string,
  };
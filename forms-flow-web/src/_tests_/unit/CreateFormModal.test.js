import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateFormModal from "../../components/Modals/CreateFormModal";
import '@testing-library/jest-dom';
import PropTypes from 'prop-types';  // Ensure PropTypes is imported at the top level

import i18n from 'i18next';
import { initReactI18next } from "react-i18next";

// Add i18n mock configuration before your tests
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translations'],
  defaultNS: 'translations',
  resources: {
    en: {
      translations: {},
    },
  },
});
// Define the CloseIcon component outside the mock
const CloseIconComponent = ({ onClick }) => (
  <button data-testid="modal-close-icon" onClick={onClick}>
    Close
  </button>
);

// Apply prop validation to the CloseIconComponent
CloseIconComponent.propTypes = {
  onClick: PropTypes.func.isRequired,  // Ensure onClick is a required function
};

// Mock the @formsflow/components package and replace CloseIcon with the mocked component
jest.mock("@formsflow/components", () => {
  return {
    CloseIcon: CloseIconComponent, // Use the pre-defined CloseIconComponent here
  };
});

describe("CreateFormModal", () => {
  let onClose, onAction;

  beforeEach(() => {
    onClose = jest.fn();
    onAction = jest.fn();
  });

  test("renders modal with title and close icon", () => {
    render(<CreateFormModal newFormModal={true} onClose={onClose} onAction={onAction} />);
    
    expect(screen.getByText("Add Form")).toBeInTheDocument();
    
    const closeIcon = screen.getByTestId("modal-close-icon");
    expect(closeIcon).toBeInTheDocument();
  });

  test("clicking on the close icon triggers onClose function", () => {
    render(<CreateFormModal newFormModal={true} onClose={onClose} onAction={onAction} />);
    
    // Find the close icon and click it
    const closeIcon = screen.getByTestId("modal-close-icon");
    fireEvent.click(closeIcon);
    
    // Check that the onClose function was called
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("clicking on the 'Build' option triggers onAction with 'BUILD'", () => {
    render(<CreateFormModal newFormModal={true} onClose={onClose} onAction={onAction} />);
    
    // Find the 'Build' option and click it
    const buildOption = screen.getByText("Build");
    fireEvent.click(buildOption);
    
    // Check that onAction was called with the correct argument
    expect(onAction).toHaveBeenCalledWith("BUILD");
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  test("clicking on the 'Import' option triggers onAction with 'IMPORT'", () => {
    render(<CreateFormModal newFormModal={true} onClose={onClose} onAction={onAction} />);
    
    // Find the 'Import' option and click it
    const importOption = screen.getByText("Import");
    fireEvent.click(importOption);
    
    // Check that onAction was called with the correct argument
    expect(onAction).toHaveBeenCalledWith("IMPORT");
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  test("does not render modal when 'newFormModal' is false", () => {
    render(<CreateFormModal newFormModal={false} onClose={onClose} onAction={onAction} />);
    
    // Check that the modal is not rendered
    const modal = screen.queryByRole("dialog");
    expect(modal).toBeNull();
  });
});

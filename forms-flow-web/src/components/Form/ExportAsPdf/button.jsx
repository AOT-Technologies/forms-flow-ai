import React from "react";
import { Button as InternalButton, Spinner } from "react-bootstrap";

export const ButtonState  = {
    Primary : "Primary",
    Loading : "Loading",
  };

export const ExportButton = React.memo(({ buttonState,
    onClick,
    label, labelLoading }) => {
        const isLoading = buttonState === ButtonState.Loading;
        return (
          <div className="d-flex justify-content-center">
            <InternalButton onClick={onClick} variant="primary" size="sm" data-testid="export-pdf-button">
              {!isLoading && (
               <i className="fa fa-print me-2" aria-hidden="true" />
              )}
              {isLoading && (
                <Spinner
                  className="me-2"
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
              {!isLoading && label}
              {isLoading && labelLoading}
            </InternalButton>
          </div>
        );
});
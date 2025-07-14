import React from "react";
import { Button as InternalButton, Spinner } from "react-bootstrap";

export const ButtonState = {
  Primary: "Primary",
  Loading: "Loading",
};

export const ExportButton = React.memo(
  ({
    buttonState,
    onClick,
    label,
    labelLoading,
    icon,
    dataTestId = "",
    variant = "light",
    disabled = false,
  }) => {
    const isLoading = buttonState === ButtonState.Loading;
    return (
      <div className="d-flex justify-content-center">
        <InternalButton
          disabled={disabled}
          onClick={onClick}
          variant={variant}
          size="sm"
          data-testid={dataTestId}
        >
          {!isLoading && icon}
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
  }
);

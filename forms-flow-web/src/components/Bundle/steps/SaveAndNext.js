import React from "react";
import Buttons from "react-bootstrap/Button";
 
import { useTranslation } from "react-i18next";
const SaveNext = React.memo(
  ({
    handleNext,
    submitData,
    handleBack,
    activeStep,
    isLastStep,
  }) => {
 
    const { t } = useTranslation();

    return (
      <>
        <Buttons
          className="mx-2"
          variant="outline-secondary"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          {t("Back")}
        </Buttons>
        <Buttons variant="primary" onClick={isLastStep ? submitData : handleNext}>
          {isLastStep ? t("Save") : t("Next")}
        </Buttons>
      </>
    );
  }
);
export default SaveNext;

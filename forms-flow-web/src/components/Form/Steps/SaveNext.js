import React from "react";
import Button  from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
const SaveNext = React.memo(({ handleNext, handleBack, activeStep, isLastStep, submitData }) => {
  const {t} = useTranslation();
  return (
    <>
      <Button disabled={activeStep === 0} onClick={handleBack}>
        {t("Back")}
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={!isLastStep ? handleNext : submitData}
      >
        {isLastStep ? t("save") : t("next") }
      </Button>
    </>
  );
});
export default SaveNext;

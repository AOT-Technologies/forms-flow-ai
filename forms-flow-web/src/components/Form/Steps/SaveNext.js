import React from "react";
import Button  from "@material-ui/core/Button";
import { Trans } from "react-i18next";
const SaveNext = React.memo(({ handleNext, handleBack, activeStep, isLastStep, submitData }) => {
  return (
    <>
      <Button disabled={activeStep === 0} onClick={handleBack}>
        <Trans>{("Back")}</Trans>
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={!isLastStep ? handleNext : submitData}
      >
        {isLastStep ? "Save" : "Next"}
      </Button>
    </>
  );
});
export default SaveNext;

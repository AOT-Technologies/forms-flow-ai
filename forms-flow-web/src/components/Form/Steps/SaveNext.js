import React from "react";
import Button  from "@material-ui/core/Button";

const SaveNext = React.memo(({ handleNext, handleBack, activeStep, isLastStep, submitData }) => {
  return (
    <>
      <Button disabled={activeStep === 0} onClick={handleBack}>
        Back
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

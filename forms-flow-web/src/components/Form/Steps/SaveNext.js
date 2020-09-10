import React from "react";
import { Button } from "@material-ui/core";

const SaveNext = (props) => {
  const { handleNext, handleBack, activeStep, isLastStep, submitData } = props;

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
};
export default SaveNext;

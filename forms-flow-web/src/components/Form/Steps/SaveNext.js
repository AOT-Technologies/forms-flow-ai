import React from "react";
import { Button } from "@material-ui/core";

const SaveNext = (props) => {
  const { handleNext, handleBack, activeStep, steps } = props;
  console.log("activeStep, steps ", activeStep, steps);
  return (
    <>
      <Button disabled={activeStep === 0} onClick={handleBack}>
        Back
      </Button>
      <Button variant="contained" color="primary" onClick={handleNext}>
        {activeStep === steps - 1 ? "Save" : "Next"}
      </Button>
    </>
  );
};
export default SaveNext;

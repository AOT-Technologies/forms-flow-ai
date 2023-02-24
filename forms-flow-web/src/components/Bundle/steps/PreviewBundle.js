import React from 'react';
import SaveNext from '../SaveAndNext';
const PreviewBundle = ({
    handleNext,
    handleBack,
    activeStep,
    isLastStep,
}) => {
  return (
    <div>
        <div className="d-flex align-items-center justify-content-between">
            <h3>New Form</h3>
            <div>
            <SaveNext
            handleNext={handleNext}
            handleBack={handleBack}
            activeStep={activeStep}
            isLastStep={isLastStep}
            />
            </div>
        </div>
    </div>
  );
};

export default PreviewBundle;
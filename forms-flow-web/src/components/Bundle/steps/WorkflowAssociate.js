import React from 'react';

const WorkflowAssociate = ({handleNext}) => {
  return (
    <div>
        <div className="d-flex justify-content-between align-items-center">
            <h3>WOrkflow</h3>
            <button className="btn btn-primary" onClick={handleNext}>Save & Preview</button>
        </div>
    </div>
  );
};

export default WorkflowAssociate;
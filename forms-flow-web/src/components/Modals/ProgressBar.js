import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ formsUploaded }) => {
    return (
        <div className="progress upload-progress">
            <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={formsUploaded}
                aria-label="upload-status"
                aria-valuemax={100} // Assuming the max value for the progress is 100
                style={{ width: `${formsUploaded}%` }}
            ></div>
        </div>
    );
};

ProgressBar.propTypes = {
    formsUploaded: PropTypes.number.isRequired,
};

export default ProgressBar;

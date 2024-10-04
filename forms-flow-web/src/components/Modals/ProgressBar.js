import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';

const CustomProgressBar = ({ progress }) => {
    return (
        <ProgressBar
            now={progress}
            aria-label="upload-status"
            max={100}
        />
    );
};  

CustomProgressBar.propTypes = {
    progress: PropTypes.number.isRequired,
};

export default CustomProgressBar;

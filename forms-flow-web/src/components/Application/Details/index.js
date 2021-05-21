import React from 'react'
import LoadingOverlay from 'react-loading-overlay';

import ApplicationDetails from './ApplicationDetails'
import {useSelector} from 'react-redux';


const Details = React.memo((props) => {
    const isApplicationDetailLoading = useSelector(state=>state.applications.isApplicationDetailLoading);
    return (
        <LoadingOverlay active={isApplicationDetailLoading} spinner text='Loading...'>
            <div className="row" style={{ marginTop: '26.5px', fontWeight: "500px" }}>
                <div className="col-md-6">
                    <ApplicationDetails application={props.application} />
                </div>
            </div>
        </LoadingOverlay>
    );
})

export default Details;

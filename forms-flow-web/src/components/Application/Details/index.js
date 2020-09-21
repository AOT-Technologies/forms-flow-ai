import React from 'react'
import LoadingOverlay from 'react-loading-overlay';

import ViewApplication from './ViewApplication'
import {useSelector} from 'react-redux';


const Details = (props) => {
    const isApplicationDetailLoading = useSelector(state=>state.applications.isApplicationDetailLoading);
    return (
        <LoadingOverlay active={isApplicationDetailLoading} spinner text='Loading...'>
            <div className="row" style={{ marginTop: '26.5px', fontWeight: "500px" }}>
                <div className="col-md-6">
                    <ViewApplication application={props.application} />
                </div>
            </div>
        </LoadingOverlay>
    );
}

export default Details;

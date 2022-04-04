import React from 'react'
import LoadingOverlay from 'react-loading-overlay';

import ApplicationDetails from './ApplicationDetails'
import {useSelector} from 'react-redux';
import {useTranslation} from "react-i18next";


const Details = React.memo((props) => {
    const {t}=useTranslation();
    const isApplicationDetailLoading = useSelector(state=>state.applications.isApplicationDetailLoading);
    return (
        <LoadingOverlay active={isApplicationDetailLoading} spinner text={t(""Select a task in the list."")}>
            <div className="row" style={{ marginTop: '26.5px', fontWeight: "500px" }}>
                <div className="col-md-6">
                    <ApplicationDetails application={props.application} />
                </div>
            </div>
        </LoadingOverlay>
    );
})

export default Details;

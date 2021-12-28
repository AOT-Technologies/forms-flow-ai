import React from "react";
import { render , screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ApplicationCounter from '../../../components/Dashboard/ApplicationCounter';
import {app,getStatusDetails,selectedMetricsId,appcount} from './Constants';


test('Should render error message if no applications in the selected range',()=>{
    render(<ApplicationCounter
        noOfApplicationsAvailable={appcount}  
    />)
    expect(screen.getByText('No submissions available for the selected date range')).toBeInTheDocument();
})

test('Render ApplicationCounter with props passed', () => {
    render(<ApplicationCounter 
        application={app}
        getStatusDetails={getStatusDetails}
        selectedMetricsId={selectedMetricsId}/>)
    expect(screen.queryAllByText("Form Name")[0]).toBeInTheDocument();
    expect(screen.queryAllByText("Total Submissions")[0]).toBeInTheDocument()
    })

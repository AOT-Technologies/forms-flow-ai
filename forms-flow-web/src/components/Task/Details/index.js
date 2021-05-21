import React from 'react'
import LoadingOverlay from 'react-loading-overlay';

import View from './View'
import Review from './Review';
import { connect } from 'react-redux';


const Details = React.memo((props) => {
    return (
        <LoadingOverlay active={props.isTaskUpdating} spinner text='Loading...'>
            <div className="row" style={{ marginTop: '26.5px', fontWeight: "500px" }}>
                <div className="col-md-6">
                    <View />
                </div>
                <div className="col-md-6">
                    <Review />
                </div>
            </div>
        </LoadingOverlay>
    );
})

const mapStateToProps = (state) =>{
    return{
        isTaskUpdating: state.tasks.isTaskUpdating
    }
}

export default connect(mapStateToProps)(Details);

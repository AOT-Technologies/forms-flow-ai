import React, { Component } from 'react'

import View from './View'
import Review from './Review'

class Details extends Component {

    render() {
        return (
            <div className="row" style={{marginTop:'26.5px'}}>
                <div className="col-md-6">
                    <View/>
                </div>
                <div className="col-md-6">
                    <Review/>
                </div>
            </div>
        )
    }
}

export default Details;
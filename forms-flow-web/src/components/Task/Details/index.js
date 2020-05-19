import React from 'react'

import View from './View'
import Review from './Review';


const Details=()=>{
  return (
            <div className="row" style={{ marginTop: '26.5px',fontWeight:"500px" }}>
                <div className="col-md-6">
                    <View />
                </div>
                <div className="col-md-6">
                    <Review />
                </div>
            </div>
  );
}

export default Details;

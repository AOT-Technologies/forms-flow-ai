import React from 'react';


const NoData = React.memo(() => (
<div className="h-100 col-12 text-center div-middle">
<i className="fa fa-tachometer fa-lg"/>
<br></br>
<br></br>
<label> No dashboard found </label>
    </div>
))

export default NoData;

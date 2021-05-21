import React from 'react';


const NoData = React.memo(() => (
<div className="h-100 col-12 text-center div-middle">
<img src="/no-task-clipboard.svg" width="30" height="30" alt="dashboard"></img>
<br></br>
<br></br>
<label> No dashboard found </label>
    </div>
))

export default NoData;

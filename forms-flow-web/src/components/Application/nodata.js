import React from 'react';

const Nodata = React.memo(() => (
<div className="div-no-application-list text-center">
<img src="/no-task-clipboard.svg" width="30" height="30" alt="task"/>
<br/>
<br/>
<label className="lbl-no-application"> No applications found </label>
<br/>
  {/*  <label className="lbl-no-application-desc"> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </label>
  */}  </div>
))

export default Nodata;

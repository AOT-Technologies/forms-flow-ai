import React from 'react';

const Nodata = React.memo(() => (
<div className="div-no-application-list text-center">
<i className="fa fa-clipboard fa-lg"/>
<br/>
<br/>
<label className="lbl-no-application"> No applications found </label>
<br/>
  {/*  <label className="lbl-no-application-desc"> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do </label>
  */}  </div>
))

export default Nodata;

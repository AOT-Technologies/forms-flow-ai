import React from "react";
import "./loading.scss";

const Loading = React.memo(() => {
  return (
    <div className="row " >
      <div className="col-12">Loading...</div>
    </div>
  );
});
export default Loading;

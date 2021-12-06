import React from "react";
import {SpinnerSVG} from "./SpinnerSVG";

const Loading = React.memo(() => (
  <div data-testid="loading-component" className="loader-container">
    <SpinnerSVG fill='#868e96'/>
  </div>
));
export default Loading;


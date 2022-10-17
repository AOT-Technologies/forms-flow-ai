import React from "react";
import "./loading.scss";

const SavingLoading = ({ saved, text }) => {
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    if (saved) {
      setAnimate(false);
    } else {
      setAnimate(true);
    }
  }, [text, saved]);
  return (
    <div
      className={`d-flex align-items-center justify-content-end px-2 ${
        animate ? "transition-start" : "transition-end"
      }`}
    >
      {saved ? (
        <i className="fa fa-check-circle-o text-success" aria-hidden="true"></i>
      ) : (
        <i className="fa fa-spinner loading-animation" aria-hidden="true"></i>
      )}
      <span className="px-2 text-success">{text}</span>
    </div>
  );
};

export default SavingLoading;

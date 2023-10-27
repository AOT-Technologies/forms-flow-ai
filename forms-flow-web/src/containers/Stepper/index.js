import React from "react";
import "./style.scss";

const Stepper = ({ steps,activeStep,onClick}) => {
  const defaultFunction = () => {};
  return (
    <>
      <div>
        <ol className="fwf-stepper">
          {steps.map((label, index) => (
            <li
              key={index}
              className={`fwf-step ${
                activeStep > index ? "active " : ""
              } ${onClick ? "cursor-pointer " : "cursor-default "}`}
              onClick={onClick || defaultFunction}
            >
              <span
                className={`fwf-step-no ${
                  activeStep >= index ? "active" : ""
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`fwf-step-label ${
                  activeStep >= index ? "active" : ""
                }`}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
};

export default Stepper;

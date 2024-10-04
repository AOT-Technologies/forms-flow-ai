import React from "react";
import "./style.scss";

const Stepper = ({ steps,activeStep,onClick}) => {
  const defaultFunction = () => {};
  return (
    <>
      <div>
        <ol className="ff-stepper">
          {steps.map((label, index) => (
            <li
              key={index}
              className={`ff-step ${
                activeStep > index ? "active " : ""
              } ${onClick ? "cursor-pointer " : "cursor-default "}`}
              onClick={onClick || defaultFunction}
            >
              <span
                className={`ff-step-no ${
                  activeStep >= index ? "active" : ""
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`ff-step-label ${
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

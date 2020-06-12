import React, { Fragment } from "react";
const CardFormCounter = (props) => {
  const { type, title, count, total, width } = props;
  let btnBg = "bg-yellow";
  let textColor = "text-yellow";

  if (type === "new") {
    btnBg = "bg-purple";
    textColor = "text-purple";
  } else if (type === "completed") {
    btnBg = "bg-green";
    textColor = "text-green";
  }
  return (
    <Fragment>
      <div className="card-counter">
        <div className="white-box analytics-info">
          <h3 className="box-title">
            <i
              className={`fa fa-arrow-circle-o-right mr-1 ${textColor}`}
              aria-hidden="true"
            ></i>
            {title}
          </h3>
          <div className="progress progress-md">
            <div
              className={`progress-bar ${btnBg}`}
              role="progressbar"
              style={{ width: "50%" }}
              aria-valuenow="78"
              aria-valuemin="0"
              aria-valuemax="78"
            ></div>
          </div>
          <ul className="list-inline two-part">
            <li>
              <div>
                <div className={`counter  ${textColor} `}>{count}</div>
                {/* <div className="app-title">With Me</div> */}
              </div>
            </li>
            <li className="text-right">
              <i className={`ti-arrow-up ${textColor} `}></i>
              <div className={`counter ${textColor} `}>{total}</div>
              <div className={`app-title ${textColor} `}>Total</div>
            </li>
          </ul>
        </div>
      </div>
    </Fragment>
  );
};
export default CardFormCounter;

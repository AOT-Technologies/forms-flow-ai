import React from "react";
import { Translation } from "react-i18next";

const Head = React.memo((props) => {
  const { items, page } = props;
  return (
    <div className="header-container">
      <div className="main-header">
        {items?.map((item, key) => (
          <div
            key={key}
            className={`head-item ${item.name === page ? "head-active" : ""}`}
          >
            <h3 onClick={item?.onClick} className="application-head">
              <i
                className="fa fa-list"
                style={{ marginTop: "5px" }}
                aria-hidden="true"
              />
              <span className="application-text">
                <Translation>{(t) => t(item?.name)}</Translation>
              </span>
              <div className="col-md-1 application-count" role="contentinfo">
                ({item?.count})
              </div>
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Head;

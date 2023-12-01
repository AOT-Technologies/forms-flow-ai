import React from "react";
import { Translation } from "react-i18next";

const Head = React.memo((props) => {
  const { items = [], page, visibleHr = true, } = props;
  return (
    <div className="header-container">
      <div className="main-header">
        {items?.map?.((item, key) => (
          <div
            onClick={item.onClick}
            key={key}
            className={`head-item ${item.name === page ? "head-active" : ""} ${key > 0 ? 'padding-left-60' : ''}`}
          >
            <h3   className="application-head">
              <i
                className={`fa fa-${item?.icon}`}
                style={{ marginTop: "5px" }}
                aria-hidden="true"
              />
              <span className="application-text ml-2">
                <Translation>{(t) => t(item?.name)}</Translation>
              </span>
              {item?.count ? (
                <div className="application-count" role="contentinfo">
                  ({item?.count})
                </div>
              ) : null}
            </h3>
          </div>
        ))}
      </div>
      {visibleHr && <hr className="head-rule" />}
    </div>
  );
});

export default Head;

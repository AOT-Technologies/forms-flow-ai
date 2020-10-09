import React from "react";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectRoot } from "react-formio";
import { useLocation } from "react-router-dom";

import {CLIENT, STAFF_REVIEWER } from "../constants/constants";
import { getUserRolePermission } from "../helper/user";

import "./styles.scss";

const SideBar = () => {
  const location = useLocation();
  const { pathname } = location;

  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });

  return (
    <header>
      <nav id="sidebar">
        <ul className="list-unstyled components">


          <li className={`${pathname.match(/^\/form/) ? "active" : ""}`}>
            <Link
              to="/form"
              className={`main-nav nav-link ${
                pathname.match(/^\/form/) ? "active-tab" : ""
              }`}
            >
              <i className="fa fa-wpforms" />
              Forms
            </Link>
          </li>
          <li className={`${pathname.match(/^\/application/) ? "active" : ""}`}>
            {getUserRolePermission(userRoles, STAFF_REVIEWER) ||  getUserRolePermission(userRoles, CLIENT)? (
              <Link
                to="/application"
                className={`main-nav nav-link ${
                  pathname.match(/^\/application/) ? "active-tab" : ""
                }`}
              >
                <i className="fa fa-list-alt" />
                Applications
              </Link>
            ) : null}
          </li>
          <li className={`${pathname.match(/^\/task/) ? "active" : ""}`}>
            {getUserRolePermission(userRoles, STAFF_REVIEWER) ? (
              <Link
                to="/task"
                className={`main-nav nav-link ${
                  pathname.match(/^\/task/) ? "active-tab" : ""
                }`}
              >
                <i className="fa fa-list" />
                Tasks
              </Link>
            ) : null}
          </li>
          <li
            className={` ${
              pathname && pathname.match(/^\/metrics/) ? "active" : ""
            }`}
          >
            {getUserRolePermission(userRoles, STAFF_REVIEWER) ? (
              <Link
                data-toggle="collapse"
                aria-expanded="false"
                to="/metrics"
                className={`main-nav nav-link ${
                  pathname.match(/^\/metrics/) ? "active-tab" : ""
                }`}
              >
                <i className="fa fa-pie-chart" aria-hidden="true" />
                Metrics
              </Link>
            ) : null}
          </li>
          <li className={`${pathname.match(/^\/insights/) ? "active" : ""}`}>
            {getUserRolePermission(userRoles, STAFF_REVIEWER) ? (
              <Link
                to="/insights"
                className={`main-nav nav-link ${
                  pathname.match(/^\/insights/) ? "active-tab" : ""
                }`}
              >
                <i className="fa fa-lightbulb-o" />
                Insights
              </Link>
            ) : null}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default SideBar;

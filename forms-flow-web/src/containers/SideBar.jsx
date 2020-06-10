import React from "react";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectRoot } from "react-formio";

import { STAFF_REVIEWER } from "../constants/constants";
import { getUserRoleName, getUserRolePermission } from "../helper/user";

import "./styles.scss";

const SideBar = (props) => {
  const { pathname } = props;
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => {
    return selectRoot("user", state).userDetail;
  });
  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });

  return (
    <header>
      <nav id="sidebar">
        <ul className="list-unstyled components">
          {isAuthenticated && (
            <li className="nav-item nav-profile mt-3">
              <div className="nav-link">
                <div className="profile-image">
                  <img
                    className="img-xs rounded-circle"
                    src="/assets/Images/user.svg"
                    alt="profile"
                  />

                  <div className="dot-indicator bg-success"/>
                </div>
                <div className="text-wrapper">
                  <p className="profile-name">
                    {user.given_name ||
                      user.name ||
                      user.preferred_username ||
                      ""}{" "}
                  </p>
                  <p> {user.email}</p>
                  <p>{getUserRoleName(userRoles)}</p>
                  {/* <p className="designation" onClick={UserService.userLogout}>
                      Logout
                    </p> */}
                </div>
              </div>
            </li>
          )}
          <li className="active">
            <Link
              data-toggle="collapse"
              aria-expanded="false"
              to="/dashboard"
              className={`main-nav nav-link ${
                pathname === "/dashboard" ? "active-tab" : ""
              }`}
            >
              <i className="fa fa-home"></i>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/form"
              className={`main-nav nav-link ${
                pathname === "/form" ? "active-tab" : ""
              }`}
            >
              <img
                className="nav-icons"
                src="/form_white.svg"
                width="22"
                height="22"
                alt="form"
              />
              Forms
            </Link>
          </li>
          <li>
            {getUserRolePermission(userRoles, STAFF_REVIEWER) ? (
              <Link
                to="/task"
                className={`main-nav nav-link ${
                  pathname === "/task" ? "active-tab" : ""
                }`}
              >
                <i className="fa fa-list"></i>
                Tasks
              </Link>
            ) : null}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default SideBar;

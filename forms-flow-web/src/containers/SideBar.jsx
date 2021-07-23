import React from "react";

import { Link } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { selectRoot } from "react-formio";
import { useLocation } from "react-router-dom";

import {CLIENT, STAFF_REVIEWER } from "../constants/constants";
import { getUserRolePermission } from "../helper/user";

import "./styles.scss";
import {toggleMenu} from "../actions/menuActions";

const SideBar = React.memo(() => {
  const location = useLocation();
  const { pathname } = location;
  const dispatch = useDispatch();

  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });
  const isMenuOpen = useSelector((state) => state.menu.isMenuOpen);

  const menuToggle = ()=>{
    dispatch(toggleMenu(false))
  };

  return (
    <div className={isMenuOpen?'open-menu':''}>
      <nav id="sidebar" className={isMenuOpen?'sidebar-container ml-0':'sidebar-container'}>
        {isMenuOpen && <div className="close-menu d-lg-none" onClick={menuToggle}>
          <i className="fa fa-times"/>
        </div>}
        <ul className="list-unstyled components">
          <li className={`${pathname.match(/^\/form/) ? "active" : ""}`} onClick={menuToggle}>
            <Link
              to="/form"
              className={`main-nav nav-link ${
                pathname.match(/^\/form/) ? "active-tab" : ""
              }`}
            >
               {/*<img src="/form.svg" width="30" height="30" alt="form" />*/}
               <i className="fa fa-wpforms" />
              Forms
            </Link>
          </li>
          <li className={`${pathname.match(/^\/application/) ? "active" : ""}`} onClick={menuToggle}>
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
          {/*<li className={`${pathname.match(/^\/task/) ? "active" : ""}`} onClick={menuToggle}>
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
          </li>*/}
          <li className={`${pathname.match(/^\/task/) ? "active" : ""}`} onClick={menuToggle}>
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
            onClick={menuToggle}
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
          <li className={`${pathname.match(/^\/insights/) ? "active" : ""}`} onClick={menuToggle}>
            {getUserRolePermission(userRoles, STAFF_REVIEWER) ? (
              <Link
                to="/insights"
                className={`main-nav nav-link ${
                  pathname.match(/^\/insights/) ? "active-tab" : ""
                }`}
              >
                <i className="fa fa-lightbulb-o"/>
                Insights
              </Link>
            ) : null}
          </li>
        </ul>
      </nav>
    </div>
  );
});

export default SideBar;

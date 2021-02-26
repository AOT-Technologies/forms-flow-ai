import React from "react";
import {Navbar, Dropdown, Container, Nav} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import { selectRoot } from "react-formio";
import UserService from "../services/UserService";
import {getUserRoleName, getUserRolePermission} from "../helper/user";
//import {toggleMenu} from "../actions/menuActions";

import "./styles.scss";
import {CLIENT, STAFF_REVIEWER} from "../constants/constants";

const NavBar = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const location = useLocation();
  const { pathname } = location;
  const user = useSelector((state) => {
      return selectRoot("user", state).userDetail;
    });
  const userRoles = useSelector((state) => {
      return selectRoot("user", state).roles;
  });
/*  const isMenuOpen = useSelector(state=>state.menu.isMenuOpen);*/

  const logout = () => {
      UserService.userLogout();
  }
/*  const menuToggle = ()=>{
   dispatch(toggleMenu(!isMenuOpen))
  };*/
  return (
    <header>
      <Navbar expand="lg" bg="white" className="topheading-border-bottom" fixed="top">
        <Container fluid>
          {/*<Nav className="d-lg-none">
            <div className="mt-1" onClick={menuToggle}>
              <i className="fa fa-bars fa-lg"/>
            </div>
          </Nav>*/}
          <Navbar.Brand className="d-flex">
            <Link to="/">
              <img
                className="img-fluid"
                src="/formsflow.ai_icon.svg"
                width="50"
                height="55"
                alt="Logo"
              />
            </Link>
            <div className="custom-app-name">formsflow.ai</div>
          </Navbar.Brand>
         {/*
           <Navbar.Brand className="d-flex">
            <Link to="/">
                  <img
                    className="img-xs rounded-circle"
                    src="/assets/Images/user.svg"
                    alt="profile"
                  />
            </Link>
          </Navbar.Brand>*/}
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          {isAuthenticated?
            <Navbar.Collapse id="responsive-navbar-nav" className="navbar-nav">
            <Nav className="mr-auto active" >
              <Nav.Link as={Link} to='/form'  className={`main-nav nav-item nav-link ${
                pathname.match(/^\/form/) ? "active-tab" : ""
              }`}><i className="fa fa-wpforms"/> Forms</Nav.Link>

              {getUserRolePermission(userRoles, STAFF_REVIEWER) ||  getUserRolePermission(userRoles, CLIENT) ?
                <Nav.Link as={Link} to='/application'  className={`main-nav nav-item nav-link ${
                  pathname.match(/^\/application/) ? "active-tab" : ""
                }`}><i className="fa fa-list-alt"/> Applications</Nav.Link>
                :
                null}

              {getUserRolePermission(userRoles, STAFF_REVIEWER) ?
                <Nav.Link as={Link} to='/task'  className={`main-nav nav-item nav-link ${
                  pathname.match(/^\/task/) ? "active-tab" : ""
                }`}><i className="fa fa-list"/> Tasks</Nav.Link>
                :
                null}

                {getUserRolePermission(userRoles, STAFF_REVIEWER) ?
                <Nav.Link as={Link} to='/metrics'  className={`main-nav nav-item nav-link ${
                  pathname.match(/^\/metrics/) ? "active-tab" : ""
                }`}><i className="fa fa-pie-chart"/> Metrics</Nav.Link>
                :
                null}

              {getUserRolePermission(userRoles, STAFF_REVIEWER) ?
                <Nav.Link as={Link} to='/insights'  className={`main-nav nav-item nav-link ${
                  pathname.match(/^\/insights/) ? "active-tab" : ""
                }`}><i className="fa fa-lightbulb-o"/> Insights</Nav.Link>
                :
                null}
            </Nav>
            <Nav className="ml-auto">
                  <Dropdown alignRight>
                    <Dropdown.Toggle id="dropdown-basic" as="div">
                   <span className="mr-1">
                      <img
                        className="img-xs rounded-circle"
                        src="/assets/Images/user.svg"
                        alt="profile"
                      />
                    </span>
                      <span className="d-none d-lg-inline-block">
                      {user.name || user.preferred_username || ""}
                  </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item> {user.name || user.preferred_username}<br/>
                        <i className="fa fa-users fa-fw"/>
                        <b>{getUserRoleName(userRoles)}</b></Dropdown.Item>
                      <Dropdown.Divider/>
                      <Dropdown.Item onClick ={logout}><i className="fa fa-sign-out fa-fw"/> Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Nav>
          </Navbar.Collapse>:null}
        </Container>
      </Navbar>
    </header>
  );
}

export default NavBar;

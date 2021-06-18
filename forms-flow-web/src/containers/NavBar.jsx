import React from "react";
import {Navbar, Dropdown, Container, Nav, NavDropdown} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import UserService from "../services/UserService";
import {getUserRoleName, getUserRolePermission} from "../helper/user";

import "./styles.scss";
import {CLIENT, STAFF_REVIEWER, APPLICATION_NAME} from "../constants/constants";
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import {push} from "connected-react-router";

const NavBar = React.memo(() => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const location = useLocation();
  const { pathname } = location;
  const user = useSelector((state) => state.user.userDetail);
  const userRoles = useSelector((state) => state.user.roles);
  const showApplications= useSelector((state) => state.user.showApplications);
  const dispatch = useDispatch();
  const logoPath = "/logo.svg";
  const appName = APPLICATION_NAME;

  const logout = () => {
      dispatch(push(`/`));
      UserService.userLogout();
  }

  const goToTask = () => {
    dispatch(push(`/task`));
  }

  return (
    <header>
      <Navbar expand="lg" bg="white" className="topheading-border-bottom" fixed="top">
        <Container fluid>
          {/*<Nav className="d-lg-none">
            <div className="mt-1" onClick={menuToggle}>
              <i className="fa fa-bars fa-lg"/>
            </div>
          </Nav>*/}
          <Navbar.Brand className="d-flex" >
            <Link to="/">
              <img
                className="img-fluid"
                src={logoPath}
                width="50"
                height="55"
                alt="Logo"
              />
            </Link>
            <div className="custom-app-name">{appName}</div>
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
            <Nav id="main-menu-nav" className="mr-auto active">
              <Nav.Link as={Link} to='/form'  className={`main-nav nav-item ${
                pathname.match(/^\/form/) ? "active-tab" : ""
              }`}>  <img className="header-forms-icon" src="/webfonts/fa-wpforms.svg" alt="back"/> Forms</Nav.Link>

              {showApplications?(getUserRolePermission(userRoles, STAFF_REVIEWER) ||  getUserRolePermission(userRoles, CLIENT)) ?
                (<Nav.Link as={Link} to='/application'  className={`main-nav nav-item ${
                  pathname.match(/^\/application/) ? "active-tab" : ""
                }`}> <img className="applications-icon-header" src="/webfonts/fa-regular_list-alt.svg" alt="back"/> Applications</Nav.Link>)
                :null:
                null}

{/*              {getUserRolePermission(userRoles, STAFF_REVIEWER) ?
                <Nav.Link as={Link} to='/task'  className={`main-nav nav-item ${
                  pathname.match(/^\/task/) ? "active-tab" : ""
                }`}><i className="fa fa-list"/> Tasks</Nav.Link>
                :
                null}*/}

              {getUserRolePermission(userRoles, STAFF_REVIEWER) ?
                <NavDropdown title={<><img className="task-dropdown-icon" src="/webfonts/fa-solid_list.svg" alt="back"/> Tasks</>} id="task-dropdown"
                             className={`main-nav nav-item taskDropdown ${pathname.match(/^\/task/) ? "active-tab-dropdown" : ""}`} onClick={goToTask}>
                  <ServiceFlowFilterListDropDown/>
              </NavDropdown>:null}

              {getUserRolePermission(userRoles, STAFF_REVIEWER) ?<NavDropdown title={<><img className="dasboard-icon-dropdown" src="/webfonts/fa_dashboard.svg" alt="back"/> Dashboards</>}
                                                                              id="dashboard-dropdown"
                                                                              className={`main-nav nav-item ${
                                                                                pathname.match(/^\/metrics/) || pathname.match(/^\/insights/) ? "active-tab-dropdown" : ""
                                                                              }`}>
                <NavDropdown.Item as={Link} to='/metrics' className={`main-nav nav-item ${
                  pathname.match(/^\/metrics/) ? "active-tab" : ""
                }`}><img src="/webfonts/fa_pie-chart.svg" alt="back"/> Metrics</NavDropdown.Item>
                <NavDropdown.Item as={Link} to='/insights' className={`main-nav nav-item ${
                  pathname.match(/^\/insights/) ? "active-tab" : ""
                }`}><img src="/webfonts/fa_lightbulb-o.svg" alt="back"/> Insights</NavDropdown.Item>
              </NavDropdown>:null}
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
                      {user?.name || user?.preferred_username || ""}
                  </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item> {user?.name || user?.preferred_username}<br/>
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
})

export default NavBar;

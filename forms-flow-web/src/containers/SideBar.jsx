import React, { Component } from "react";

import { Link } from "react-router-dom";

import { connect } from "react-redux";
import { selectRoot } from "react-formio";
import { push } from "connected-react-router";

import UserService from "../services/UserService";
import { setUserAuth } from "../actions/bpmActions";
import { STAFF_REVIEWER, STAFF_DESIGNER } from "../constants/constants";
import "./styles.scss";

class NavBar extends Component {
  getUserRole = (userRoles) => {
    let role = "";
    if (userRoles.includes(STAFF_REVIEWER)) {
      role = "REVIEWER";
    } else if (userRoles.includes(STAFF_DESIGNER)) {
      role = "DESIGNER";
    } else {
      role = "CLIENT";
    }
    return role;
  };

  render() {
    const { user, userRoles, isAuthenticated, activePage } = this.props;
    console.log("activePage", activePage);
    return (
      <header>
        {/* <Navbar expand="lg"> */}
        {/* <section className="container"> */}

        <nav id="sidebar">
          {/* <div className="sidebar-header">
            <img
              className="img-fluid d-none d-md-block"
              src="/logo.svg"
              width="177"
              height="44"
              alt="Logo"
            />
            <img
              className="img-fluid d-md-none"
              src="/simple-logo.svg"
              width="63"
              height="44"
              alt="Logo"
            ></img>
            <div className="div-center mt-2">
              <label className="lbl-app-nanme">FormsFlow</label>
              <label className="lbl-app-nanme app-name">.AI</label>
            </div>
          </div> */}

          <ul className="list-unstyled components">
            {isAuthenticated && (
              <li class="nav-item nav-profile mt-3">
                <a href="#" class="nav-link">
                  <div className="profile-image">
                    <img
                      className="img-xs rounded-circle"
                      src="/assets/Images/user.svg"
                      alt="profile image"
                    />

                    <div className="dot-indicator bg-success"></div>
                  </div>
                  <div className="text-wrapper">
                    <p className="profile-name">
                      {user.given_name ||
                        user.name ||
                        user.preferred_username ||
                        ""}{" "}
                    </p>
                    <p className="designation" onClick={UserService.userLogout}>
                      Logout
                    </p>
                  </div>
                </a>
              </li>
            )}
            <li className="active">
              <Link
                data-toggle="collapse"
                aria-expanded="false"
                to="/dashboard"
                className={`main-nav nav-link ${
                  activePage === "dashboard" ? "active-tab" : ""
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
                  activePage === "form" ? "active-tab" : ""
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
              {userRoles && userRoles.includes(STAFF_REVIEWER) ? (
                <Link
                  to="/task"
                  className={`main-nav nav-link ${
                    activePage === "task" ? "active-tab" : ""
                  }`}
                >
                  <i class="fa fa-list"></i>
                  Tasks
                </Link>
              ) : null}
            </li>
          </ul>
        </nav>

        {/* <Navbar.Brand className="d-flex">
                            <img className="img-fluid d-none d-md-block" src="/logo.svg" width="177" height="44" alt="Logo" />
                            <img className="img-fluid d-md-none" src="/simple-logo.svg" width="63" height="44" alt="Logo"></img>
                            <div className="div-center"><label className="lbl-app-nanme">FormsFlow</label><label className="lbl-app-nanme app-name">.AI</label></div>
                      
                            <Nav className="d-md-none custom-profile">
                                <NavDropdown style={{ fontSize: '18px' }} title={<div className="pull-left">
                                    <img className="thumbnail-image"
                                        src="/assets/Images/user.svg"
                                        alt="user pic"
                                    /></div>} className="nav-dropdown" id="basic-nav-dropdown">

                                    <NavDropdown.Header className="nav-user-name">{user.name || user.preferred_username}</NavDropdown.Header>
                                    <NavDropdown.Header className="nav-user-email" title={user.email}>{user.email}</NavDropdown.Header>
                                    <NavDropdown.Header className="nav-user-role">{this.getUserRole(userRoles)}</NavDropdown.Header>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Header className="nav-logout" onClick={UserService.userLogout}>
                                        <img src="/assets/Images/logout.svg" alt="" /><label className="lbl-logout">Logout</label>
                                    </NavDropdown.Header>

                                </NavDropdown>
                            </Nav>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="navbar-dark custom-toggler" />
                        <Navbar.Collapse id="responsive-navbar-nav" className="navbar-nav">
                            <Nav className="mr-auto nav-custom-tab">
                                <Link to="/form" className={`main-nav nav-link ${activePage === 'form' ? "active-tab" : ''}`}>
                                    <img className="nav-icons" src="/form_white.svg" width="22" height="22" alt="form" />
                                    Forms
                                </Link>
                                {userRoles && userRoles.includes(STAFF_REVIEWER) ?
                                    <Link to="/task" className={`main-nav nav-link ${activePage === 'task' ? "active-tab" : ''}`}>
                                        <img className="nav-icons" src="/task_white.svg" width="22" height="22" alt="task" />
                                         Tasks
                                    </Link>
                                    :
                                    null}
                            </Nav>
                        </Navbar.Collapse>
                        <Nav className="d-none d-md-block">
                            {isAuthenticated ?
                                <NavDropdown style={{ fontSize: '18px' }} title={<div className="pull-left">
                                    Hi {user.given_name || user.name || user.preferred_username || ''} &nbsp;
                                    <img className="thumbnail-image"
                                        src="/assets/Images/user.svg"
                                        alt="user pic"
                                    /></div>} className="nav-dropdown" id="basic-nav-dropdown">
                                    <NavDropdown.Item><img className="float-right" src="/assets/Images/user.svg" alt="userimage" /></NavDropdown.Item>
                                    <br></br>
                                    <NavDropdown.Header className="nav-user-name">{user.name || user.preferred_username}</NavDropdown.Header>
                                    <NavDropdown.Header className="nav-user-email" title={user.email}>{user.email}</NavDropdown.Header>
                                    <NavDropdown.Header className="nav-user-role">{this.getUserRole(userRoles)}</NavDropdown.Header>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Header className="nav-logout" onClick={UserService.userLogout}>
                                        <img src="/assets/Images/logout.svg" alt="" /><label className="lbl-logout">Logout</label>
                                    </NavDropdown.Header>
                                </NavDropdown>
                                :
                                <Button variant="link" style={{ color: "white", fontSize: "20px", textDecoration: "none" }} onClick={() => this.props.login()}>
                                    Login
                                </Button>
                            }
                        </Nav>
                    </section> */}
        {/* </Navbar> */}
      </header>
    );
  }
}

const mapStatetoProps = (state) => {
  return {
    userRoles: selectRoot("user", state).roles || [],
    user: selectRoot("user", state).userDetail || [],
    isAuthenticated: state.user.isAuthenticated,
    activePage: selectRoot("user", state).currentPage || "",
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: () => {
      dispatch(push(`/`));
    },
    setUserAuth: (value) => {
      dispatch(setUserAuth(value));
    },
  };
};

export default connect(mapStatetoProps, mapDispatchToProps)(NavBar);

import React from "react";
import {Navbar, Dropdown, Container, Nav} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { selectRoot } from "react-formio";
import UserService from "../services/UserService";
import { getUserRoleName } from "../helper/user";
import {toggleMenu} from "../actions/menuActions";

import "./styles.scss";

const NavBar = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const dispatch = useDispatch();
  const user = useSelector((state) => {
      return selectRoot("user", state).userDetail;
    });
  const userRoles = useSelector((state) => {
      return selectRoot("user", state).roles;
  });
  const isMenuOpen = useSelector(state=>state.menu.isMenuOpen);

  const logout = () => {
      UserService.userLogout();
  }
  const menuToggle = ()=>{
   dispatch(toggleMenu(!isMenuOpen))
  };
  return (
    <header>
      <Navbar expand="lg" bg="white" className="topheading-border-bottom" fixed="top">
        <Container fluid>
          <Nav className="d-lg-none">
            <div className="mt-1" onClick={menuToggle}>
              <i className="fa fa-bars fa-lg"/>
            </div>
          </Nav>
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
            {isAuthenticated ? (
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
              </Dropdown>):
              null}
        </Container>
      </Navbar>
    </header>
  );
}

export default NavBar;

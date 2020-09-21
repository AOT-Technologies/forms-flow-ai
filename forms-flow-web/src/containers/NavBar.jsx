import React from "react";
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import { selectRoot } from "react-formio";
import UserService from "../services/UserService";
import { getUserRoleName } from "../helper/user";

const NavBar = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => {
      return selectRoot("user", state).userDetail;
    });
    const userRoles = useSelector((state) => {
      return selectRoot("user", state).roles;
    });
    const logout = () => {
      UserService.userLogout();
    }
  return (
    <header>
      <Navbar expand="lg" bg="white" className="topheading-border-bottom">
        <section className="container-fluid">
          <Navbar.Brand className="d-flex">
            <Link to="/">
              <img
                className="img-fluid"
                src="/logo.svg"
                width="177"
                height="44"
                alt="Logo"
              />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="responsive-navbar-nav"
            className="navbar-dark custom-toggler"
          />
          <Navbar.Collapse
            id="responsive-navbar-nav"
            className="navbar-nav"
          />
          <Nav className="d-none d-md-block">
            {isAuthenticated ? (
          <>
            <NavDropdown title={user.name || user.preferred_username} id="collasible-nav-dropdown" >
              <NavDropdown.Item href="#"> {user.name || user.preferred_username}<br/>
                <i className="fa fa-users fa-fw"></i><b>{getUserRoleName(userRoles)}</b>
              </NavDropdown.Item>

              <NavDropdown.Divider />
            <NavDropdown.Item href="#" onClick ={logout}><i className="fa fa-sign-out fa-fw"></i> Logout</NavDropdown.Item>
            </NavDropdown>
          </>
            ) : (
              <>

              </>
            )}
          </Nav>
        </section>
      </Navbar>
    </header>
  );
}

export default NavBar;

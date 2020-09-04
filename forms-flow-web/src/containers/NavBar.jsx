import React from "react";
import {Nav, Navbar, Button} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";

import UserService from "../services/UserService";


const NavBar = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
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
                <i
                  className="fa fa-sign-out text-black-50 fa-lg"
                  aria-hidden="true"
                />
                <Button
                  variant="link"
                  style={{
                    color: "#000",
                    fontSize: "20px",
                    textDecoration: "none",
                  }}
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <i className="fa fa-sign-in text-black-50" aria-hidden="true"/>
                <Button
                  variant="link"
                  style={{
                    color: "#000",
                    fontSize: "20px",
                    textDecoration: "none",
                  }}
                  onClick={() => {
                  }}
                >{/*TODO login for public*/}
                  Login
                </Button>
              </>
            )}
          </Nav>
        </section>
      </Navbar>
    </header>
  );
}

export default NavBar;

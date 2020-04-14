import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserService from '../services/UserService';

const NavBar = () => {
    return (
        <header>
            <Navbar className="navbar">
                <section className="container">
                <Navbar.Brand>
                    <img className="img-fluid d-none d-md-block" src="/bcid-logo-rev-en.svg" width="177" height="44" alt="B.C. Government Logo" />
                    <img className="img-fluid d-md-none" src="/bcid-symbol-rev.svg" width="63" height="44" alt="B.C. Government Logo" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav" className="navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link as={Link} to='/' className="nav-item nav-link"><i className="fa fa-home" style={{ fontSize: '20px', color: '#ffff' }}></i></Nav.Link>
                    </Nav>
                    <Nav >
                        <Nav.Link onClick={UserService.userLogout} className="nav-item nav-link" style={{ color: '#ffff' }}><i className="fa fa-power-off" aria-hidden="true"></i> Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                </section>
            </Navbar>
        </header>
    )
};

export default NavBar;

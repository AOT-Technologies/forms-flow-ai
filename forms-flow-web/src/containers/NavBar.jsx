import React from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { selectRoot } from 'react-formio'

import UserService from '../services/UserService';
import { STAFF_REVIEWER, STAFF_DESIGNER, CLIENT } from '../constants/constants';

const getUserRole = (userRoles) => {
    let role = '';
    if (userRoles.includes(STAFF_REVIEWER)) {
        role = "REVIEWER"
    } else if (userRoles.includes(STAFF_DESIGNER)) {
        role = "DESIGNER"
    } else {
        role = "CLIENT"
    }
    return role;
}

const NavBar = (props) => {
    const { user, userRoles } = props;
    return (
        <header>
            <Navbar className="navbar">
                <section className="container">
                    <Navbar.Brand>
                        <img className="img-fluid d-none d-md-block" src="/AOT-logo.png" width="250" alt="AOT Logo" />
                        <img className="img-fluid d-md-none" src="AOT-simple-logo.png" width="40" alt="AOT Logo"></img>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav" className="navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link as={Link} to='/' className="nav-item nav-link"><i className="fa fa-home" style={{ fontSize: '20px', color: '#ffff' }}></i></Nav.Link>
                            {userRoles && userRoles.includes(STAFF_REVIEWER) ?
                                <Nav.Link as={Link} to='/tasks' className="nav-item nav-link"><i className="fa fa-tasks" style={{ fontSize: '15px', color: '#ffff' }}></i></Nav.Link>
                                :
                                null}
                        </Nav>
                        <Nav >
                            <NavDropdown title={`Hi ${user.given_name ? user.given_name : ''}`} className="nav-dropdown" id="basic-nav-dropdown">
                                <li className="nav-item">
                                    <div className="row">
                                        <p className="col-md-8"></p>
                                        <p className="col-md-4 userIcon text-center"><i className="fa fa-user-circle" aria-hidden="true"></i></p>
                                    </div>
                                    <section className="ml-0">
                                        <p className="mb-0">{user.name}</p>
                                        <p className="mb-1" style={{ fontSize: '12px', color: '#807c7c' }}>{user.email}</p>
                                        <p className="mb-0" style={{color:"#003366cf",fontSize:'14px'}}>{getUserRole(userRoles)}</p>
                                    </section>
                                </li>
                                <NavDropdown.Divider />
                                <li onClick={UserService.userLogout} style={{cursor:'pointer'}}><i className="fa fa-sign-out" aria-hidden="true"></i>Logout</li>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </section>
            </Navbar>
        </header>
    )
};

const mapStatetoProps = (state) => {
    return {
        userRoles: selectRoot('user', state).roles || [],
        user: selectRoot('user', state).userDetail || []
    }
}

export default connect(mapStatetoProps)(NavBar);

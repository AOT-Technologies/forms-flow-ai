import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { selectRoot } from 'react-formio'

import UserService from '../services/UserService';
import { STAFF_REVIEWER } from '../constants/constants';

const NavBar = (props) => {
    const userRoles = props.userRoles;
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
                            <Nav.Link onClick={UserService.userLogout} className="nav-item nav-link" style={{ color: '#ffff' }}><i className="fa fa-power-off" aria-hidden="true"></i> Logout</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </section>
            </Navbar>
        </header>
    )
};

const mapStatetoProps = (state) => {
    return {
        userRoles: selectRoot('user', state).roles || []
    }
}

export default connect(mapStatetoProps)(NavBar);

import React, { useEffect } from "react";
import {Navbar, Dropdown, Container, Nav, NavDropdown} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import UserService from "../services/UserService";
import {getUserRoleName, getUserRolePermission, getUserInsightsPermission} from "../helper/user";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {CLIENT, STAFF_REVIEWER, APPLICATION_NAME, STAFF_DESIGNER} from "../constants/constants";
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import {push} from "connected-react-router";
import i18n from "../resourceBundles/i18n";
import { setLanguage } from "../actions/languageSetAction";
import {updateUserlang} from "../apiManager/services/userservices";

const NavBar = React.memo(() => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const location = useLocation();
  const { pathname } = location;
  const user = useSelector((state) => state.user.userDetail);
  const lang = useSelector((state) => state.user.lang);
  const userRoles = useSelector((state) => state.user.roles);
  const showApplications= useSelector((state) => state.user.showApplications);
  const dispatch = useDispatch();
  const logoPath = "/logo.svg";
  const appName = APPLICATION_NAME;
  const {t} = useTranslation();
  const langarr=["en","bg","pt","fr","zh-CN","de"];

  useEffect(()=>{
    i18n.changeLanguage(lang);
  },[lang]);


  const handleOnclick=(selectedLang)=>{
   dispatch(setLanguage(selectedLang))
   dispatch(updateUserlang(selectedLang))
 }
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
              }`}>  <i className="fa fa-wpforms fa-fw fa-lg"/>{t("Forms")}</Nav.Link>
              {(getUserRolePermission(userRoles, STAFF_DESIGNER)) ?
                (<Nav.Link as={Link} to='/admin'  className={`main-nav nav-item ${
                  pathname.match(/^\/admin/) ? "active-tab" : ""

                }`}> <i className="fa fa-user-circle-o fa-lg " />{t("Admin")} </Nav.Link>)



                :null}

              {showApplications?(getUserRolePermission(userRoles, STAFF_REVIEWER) ||  getUserRolePermission(userRoles, CLIENT)) ?
                (<Nav.Link as={Link} to='/application'  className={`main-nav nav-item ${
                  pathname.match(/^\/application/) ? "active-tab" : ""
                }`}> <i className="fa fa-list-alt fa-fw fa-lg " /> {t("Applications")}</Nav.Link>)
                :null:
                null}

{/*              {getUserRolePermission(userRoles, STAFF_REVIEWER) ?
                <Nav.Link as={Link} to='/task'  className={`main-nav nav-item ${
                  pathname.match(/^\/task/) ? "active-tab" : ""
                }`}><i className="fa fa-list"/> Tasks</Nav.Link>
                :
                null}*/}

              {getUserRolePermission(userRoles, STAFF_REVIEWER) ?
                <NavDropdown title={<><i className="fa fa-list fa-lg fa-fw" />{t("Tasks")} </>} id="task-dropdown"
                             className={`main-nav nav-item taskDropdown ${pathname.match(/^\/task/) ? "active-tab-dropdown" : ""}`} onClick={goToTask}>
                  <ServiceFlowFilterListDropDown/>
              </NavDropdown>:null}

              {getUserRolePermission(userRoles, STAFF_REVIEWER) ?<NavDropdown data-testid = "Dashboards" title={<><i className="fa fa-tachometer fa-lg fa-fw"/>{t("Dashboards")}</>}
                                                                              id="dashboard-dropdown"
                                                                              className={`main-nav nav-item ${
                                                                                pathname.match(/^\/metrics/) || pathname.match(/^\/insights/) ? "active-tab-dropdown" : ""
                                                                              }`}>
                <NavDropdown.Item as={Link} to='/metrics' className={`main-nav nav-item ${
                  pathname.match(/^\/metrics/) ? "active-tab" : ""
                }`}><i className="fa fa-pie-chart fa-fw fa-lg"  />{t("Metrics")}</NavDropdown.Item>
               {getUserInsightsPermission() && <NavDropdown.Item as={Link} to='/insights' className={`main-nav nav-item ${
                  pathname.match(/^\/insights/) ? "active-tab" : ""
                }`}><i className="fa fa-lightbulb-o fa-fw fa-lg"/> {t("Insights")}</NavDropdown.Item>}
              </NavDropdown>:null}
            </Nav>
            {
              (langarr.length===1 && langarr[0]==="en") ? null :

             <Nav className="ml-auto">
            <Dropdown alignRight>
                    <Dropdown.Toggle id="dropdown-basic" as="div" style={{cursor: "pointer"}}>
                    <i className="fa fa-globe fa-lg" aria-hidden="true"/> {lang?lang:'LANGUAGE'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu >
                      <Dropdown.Item onClick={()=>{handleOnclick('en')}}> English </Dropdown.Item>
                      <Dropdown.Item onClick={()=>{handleOnclick('zh-CN')}}> 中国人</Dropdown.Item>
                      <Dropdown.Item onClick={()=>{handleOnclick('pt')}}> Português </Dropdown.Item>
                      <Dropdown.Item onClick={()=>{handleOnclick('fr')}}> français </Dropdown.Item>
                      <Dropdown.Item onClick={()=>{handleOnclick('bg')}}> български </Dropdown.Item>
                      <Dropdown.Item onClick={()=>{handleOnclick('de')}}> Deutsch</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
            </Nav>
}
            <Nav className="ml-auto">
                  <Dropdown alignRight>
                    <Dropdown.Toggle id="dropdown-basic" as="div" style={{cursor: "pointer"}}>
                   <span className="mr-1">
                   <i className="fa fa-user fa-lg"/>
                    </span>
                      <span className="d-none d-lg-inline-block">
                      {user?.name || user?.preferred_username || ""}
                  </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item> {user?.name || user?.preferred_username}<br/>
                        <i className="fa fa-users fa-lg fa-fw"/>
                        <b>{getUserRoleName(userRoles)}</b></Dropdown.Item>
                      <Dropdown.Divider/>
                      <Dropdown.Item onClick ={logout}><i className="fa fa-sign-out fa-fw"/> {t("Logout")} </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Nav>
          </Navbar.Collapse>:<Link to="/" className="btn btn-primary">Login</Link>}
        </Container>
      </Navbar>
    </header>
  );
})

export default NavBar;

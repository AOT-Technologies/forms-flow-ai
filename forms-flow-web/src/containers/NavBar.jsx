import React, { useEffect } from "react";
import { Navbar, Dropdown, Container, Nav, NavDropdown } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UserService from "../services/UserService";
import {
  getUserRoleName,
  getUserRolePermission,
  getUserInsightsPermission,
} from "../helper/user";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {
  CLIENT,
  STAFF_REVIEWER,
  APPLICATION_NAME,
  STAFF_DESIGNER,
} from "../constants/constants";
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import { push } from "connected-react-router";
import i18n from "../resourceBundles/i18n";
import { setLanguage } from "../actions/languageSetAction";
import { updateUserlang } from "../apiManager/services/userservices";
import { MULTITENANCY_ENABLED } from "../constants/constants";
import { fetchSelectLanguages } from "../apiManager/services/languageServices";

const NavBar = React.memo(() => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const location = useLocation();
  const { pathname } = location;
  const user = useSelector((state) => state.user.userDetail);
  const lang = useSelector((state) => state.user.lang);
  const userRoles = useSelector((state) => state.user.roles);
  const showApplications = useSelector((state) => state.user.showApplications);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const baseUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const selectLanguages = useSelector((state) => state.user.selectLanguages);
  const dispatch = useDispatch();
  const logoPath = "/logo.svg";
  const appName = APPLICATION_NAME;
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchSelectLanguages());
  }, [dispatch]);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  const handleOnclick = (selectedLang) => {
    dispatch(setLanguage(selectedLang));
    dispatch(updateUserlang(selectedLang));
  };
  const logout = () => {
    dispatch(push(baseUrl));
    UserService.userLogout();
  };

  const goToTask = () => {
    dispatch(push(`${baseUrl}task`));
  };

  return (
    <header>
      <Navbar
        expand="lg"
        bg="white"
        className="topheading-border-bottom"
        fixed="top"
      >
        <Container fluid>
          <Navbar.Brand className="d-flex">
            <Link to={`${baseUrl}`}>
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
          <Navbar.Toggle aria-controls="responsive-navbar-nav " />
          {isAuthenticated ? (
            <Navbar.Collapse id="responsive-navbar-nav" className="navbar-nav">
              <Nav
                id="main-menu-nav"
                className="mr-auto active align-items-lg-center"
              >
                <Nav.Link
                  as={Link}
                  to={`${baseUrl}form`}
                  className={`main-nav nav-item ${
                    pathname.match(/^\/form/) ? "active-tab" : ""
                  }`}
                >
                  <i className="fa fa-wpforms fa-fw fa-lg mr-2" />
                  {t("Forms")}
                </Nav.Link>
                {getUserRolePermission(userRoles, STAFF_DESIGNER) ? (
                  <Nav.Link
                    as={Link}
                    to={`${baseUrl}admin`}
                    className={`main-nav nav-item ${
                      pathname.match(/^\/admin/) ? "active-tab" : ""
                    }`}
                  >
                    <i className="fa fa-user-circle-o fa-lg mr-2" />
                    {t("Admin")}
                  </Nav.Link>
                ) : null}

                {showApplications ? (
                  getUserRolePermission(userRoles, STAFF_REVIEWER) ||
                  getUserRolePermission(userRoles, CLIENT) ? (
                    <Nav.Link
                      as={Link}
                      to={`${baseUrl}application`}
                      className={`main-nav nav-item ${
                        pathname.match(/^\/application/) ? "active-tab" : ""
                      }`}
                    >
                      {" "}
                      <i className="fa fa-list-alt fa-fw fa-lg mr-2" />
                      {t("Applications")}
                    </Nav.Link>
                  ) : null
                ) : null}

                {getUserRolePermission(userRoles, STAFF_REVIEWER) ? (
                  <NavDropdown
                    title={
                      <>
                        <i className="fa fa-list fa-lg fa-fw mr-2" />
                        {t("Tasks")}{" "}
                      </>
                    }
                    id="task-dropdown"
                    className={`main-nav nav-item taskDropdown ${
                      pathname.match(/^\/task/) ? "active-tab-dropdown" : ""
                    }`}
                    onClick={goToTask}
                  >
                    <ServiceFlowFilterListDropDown />
                  </NavDropdown>
                ) : null}

                {getUserRolePermission(userRoles, STAFF_REVIEWER) ? (
                  <NavDropdown
                    data-testid="Dashboards"
                    title={
                      <>
                        <i className="fa fa-tachometer fa-lg fa-fw mr-2" />
                        {t("Dashboards")}
                      </>
                    }
                    id="dashboard-dropdown"
                    className={`main-nav nav-item ${
                      pathname.match(/^\/metrics/) ||
                      pathname.match(/^\/insights/)
                        ? "active-tab-dropdown"
                        : ""
                    }`}
                  >
                    <NavDropdown.Item
                      as={Link}
                      to={`${baseUrl}metrics`}
                      className={`main-nav nav-item ${
                        pathname.match(/^\/metrics/) ? "active-tab" : ""
                      }`}
                    >
                      <i className="fa fa-pie-chart fa-fw fa-lg" />
                      {t("Metrics")}
                    </NavDropdown.Item>
                    {getUserInsightsPermission() && (
                      <NavDropdown.Item
                        as={Link}
                        to={`${baseUrl}insights`}
                        className={`main-nav nav-item ${
                          pathname.match(/^\/insights/) ? "active-tab" : ""
                        }`}
                      >
                        <i className="fa fa-lightbulb-o fa-fw fa-lg" />{" "}
                        {t("Insights")}
                      </NavDropdown.Item>
                    )}
                  </NavDropdown>
                ) : null}
              </Nav>

              <Nav className="ml-lg-auto mr-auto px-lg-0 px-3">
                <Dropdown alignRight>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    as="div"
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fa fa-globe fa-lg" aria-hidden="true" />{" "}
                    {lang ? lang : "LANGUAGE"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {selectLanguages.map((e, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => {
                          handleOnclick(e.name);
                        }}
                      >
                        {e.value}{" "}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>

              <Nav className="ml-lg-auto mr-auto px-lg-0 px-3">
                <Dropdown alignRight>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    as="div"
                    style={{ cursor: "pointer" }}
                  >
                    <span className="mr-1">
                      <i className="fa fa-user fa-lg" />
                    </span>
                    <span className="d-none d-lg-inline-block">
                      {user?.name || user?.preferred_username || ""}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      {" "}
                      {user?.name || user?.preferred_username}
                      <br />
                      <i className="fa fa-users fa-lg fa-fw" />
                      <b>{getUserRoleName(userRoles)}</b>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout}>
                      <i className="fa fa-sign-out fa-fw" /> {t("Logout")}{" "}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Navbar.Collapse>
          ) : (
            <Link to="/" className="btn btn-primary">
              Login
            </Link>
          )}
        </Container>
      </Navbar>
    </header>
  );
});

export default NavBar;

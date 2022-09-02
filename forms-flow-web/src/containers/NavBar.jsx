import React, { useEffect, useMemo } from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UserService from "../services/UserService";
import {
  getUserRoleName,
  getUserRolePermission,
  // TODO : modify insigth permission conditions
  // getUserInsightsPermission,

} from "../helper/user";
import createURLPathMatchExp from "../helper/regExp/pathMatch";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {
  CLIENT,
  STAFF_REVIEWER,
  APPLICATION_NAME,
  STAFF_DESIGNER,
  MULTITENANCY_ENABLED,
} from "../constants/constants";
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import { push } from "connected-react-router";
import i18n from "../resourceBundles/i18n";
import { setLanguage } from "../actions/languageSetAction";
import { updateUserlang } from "../apiManager/services/userservices";

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
  const applicationTitle = useSelector(
    (state) => state.tenants?.tenantData?.details?.applicationTitle
  );
  const baseUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const selectLanguages = useSelector((state) => state.user.selectLanguages);
  const dispatch = useDispatch();
  const logoPath = "/logo.svg";
  const getAppName = useMemo(
    () => () => {
      if (!MULTITENANCY_ENABLED) {
        return APPLICATION_NAME;
      }
      // TODO: Need a propper fallback component prefered a skeleton.
      return applicationTitle || "";
    },
    [MULTITENANCY_ENABLED, applicationTitle]
  );
  const appName = getAppName();
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
                    pathname.match(createURLPathMatchExp("form", baseUrl))
                      ? "active-tab"
                      : ""
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
                      pathname.match(createURLPathMatchExp("admin", baseUrl))
                        ? "active-tab"
                        : ""
                    }`}
                  >
                    <i className="fa fa-user-circle-o fa-lg mr-2" />
                    {t("Admin")}
                  </Nav.Link>
                ) : null}

                {getUserRolePermission(userRoles, STAFF_DESIGNER) ? (
                  <Nav.Link
                    as={Link}
                    to={`${baseUrl}processes`}
                    className={`main-nav nav-item ${
                      pathname.match(createURLPathMatchExp("processes", baseUrl)) 
                        ? "active-tab" 
                        : ""
                    }`}
                  >
                    <i className="fa fa-cogs fa-lg fa-fw mr-2" />
                    {t("Processes")}
                  </Nav.Link>
                ) : null}

                {showApplications ? (
                  getUserRolePermission(userRoles, STAFF_REVIEWER) ||
                  getUserRolePermission(userRoles, CLIENT) ? (
                    <Nav.Link
                      as={Link}
                      to={`${baseUrl}application`}
                      className={`main-nav nav-item ${
                        pathname.match(
                          createURLPathMatchExp("application", baseUrl)
                        )
                          ? "active-tab"
                          : pathname.match(
                              createURLPathMatchExp("draft", baseUrl)
                            )
                          ? "active-tab"
                          : ""
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
                      pathname.match(createURLPathMatchExp("task", baseUrl))
                        ? "active-tab-dropdown"
                        : ""
                    }`}
                    onClick={goToTask}
                  >
                    <ServiceFlowFilterListDropDown />
                  </NavDropdown>
                ) : null}

                {getUserRolePermission(userRoles, STAFF_REVIEWER) ? (

               <Nav.Link
                      as={Link}
                      to={`${baseUrl}metrics`}
                      data-testid="Dashboards"
                      className={`main-nav nav-item ${
                        pathname.match(
                          createURLPathMatchExp("metrics", baseUrl)
                        ) || pathname.match(
                              createURLPathMatchExp("insights", baseUrl)
                            )
                          ? "active-tab"
                          : ""
                      }`}
                    >
                      {" "}
                      <i className="fa fa-tachometer fa-lg fa-fw mr-2" />
                         {t("Dashboards")}
                    </Nav.Link>
                  ) : null}
              </Nav>

              <Nav className="ml-lg-auto mr-auto px-lg-0 px-3">
                {selectLanguages.length === 1 ? (
                  selectLanguages.map((e, i) => {
                    return (
                      <>
                        <i className="fa fa-globe fa-lg mr-1 mt-1" />
                        <h4 key={i}>{e.name}</h4>
                      </>
                    );
                  })
                ) : (
                  <NavDropdown
                    title={
                      <>
                        <i className="fa fa-globe fa-lg mr-2" />
                        {lang ? lang : "LANGUAGE"}
                      </>
                    }
                    id="basic-nav-dropdown"
                  >
                    {selectLanguages.map((e, index) => (
                      <NavDropdown.Item
                        key={index}
                        onClick={() => {
                          handleOnclick(e.name);
                        }}
                      >
                        {e.value}{" "}
                      </NavDropdown.Item>
                    ))}
                  </NavDropdown>
                )}
              </Nav>

              <Nav className="ml-lg-auto mr-auto px-lg-0 px-3">
                <NavDropdown
                  title={
                    <>
                      <i className="fa fa-user fa-lg mr-1" />
                      {user?.name || user?.preferred_username || ""}
                    </>
                  }
                >
                  <NavDropdown.Item>
                    {" "}
                    {user?.name || user?.preferred_username}
                    <br />
                    <i className="fa fa-users fa-lg fa-fw" />
                    <b>{getUserRoleName(userRoles)}</b>
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>
                    <i className="fa fa-sign-out fa-fw" /> {t("Logout")}{" "}
                  </NavDropdown.Item>
                </NavDropdown>
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

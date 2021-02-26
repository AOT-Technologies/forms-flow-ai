import React from "react";
import { Route, Switch } from "react-router-dom";
import {useSelector} from "react-redux";

// import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

/*import SideBar from "../containers/SideBar";*/
import NavBar from "../containers/NavBar";
import Footer from "../components/Footer";

const BaseRouting = ({store}) => {
  const isAuth = useSelector((state) => state.user.isAuthenticated);
  return (
    <>
      {isAuth?<NavBar/>:null}
      <div className="wrapper">
        {/*{isAuth?<SideBar store={store} />:null}*/}
          <div className="container-fluid content main-container">
            <Switch>
              {/* <Route path="/public"><PublicRoute store={store}/></Route> */}
              <Route path="/">
                <PrivateRoute store={store} />
              </Route>
            </Switch>
            {isAuth?<Footer />:null}
          </div>
      </div>
    </>
  );
};


export default BaseRouting;

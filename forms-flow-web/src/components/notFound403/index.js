import React from "react";
import "./pagenotfound.scss";
const PageNotFound403 = React.memo(() => {

    const errorPage = ("Page not Found");
    const errorvalue = ("403");
    
    return (
        <section id="not-found">
        <div id="title">Simple Pure CSS3 • 403 Error Page</div>
        <div className="circles">
         <p>
            {errorvalue}
            <br /> 
            <small>{errorPage}</small>
          </p>
          <span className="circle big" />
          <span className="circle med" />
          <span className="circle small" />
        </div>
      </section>
  
    );
  });
  export default PageNotFound403;

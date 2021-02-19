package org.camunda.bpm.extension.keycloak.showcase.sso;

import java.io.IOException;
import java.util.Enumeration;
import java.util.logging.Logger;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * This class is support CORS for Camunda application
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomCorsFilter implements Filter {

    private final Logger LOGGER = Logger.getLogger(CustomCorsFilter.class.getName());

    @Value("${app.security.origin}")
    private String customAllowOrigin;

    public CustomCorsFilter() {
        LOGGER.info("Initialization of cors filter");
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        response.setHeader("Access-Control-Allow-Origin",getOrigin(request));
        response.setHeader("Access-Control-Allow-Methods","POST, PUT, GET, OPTIONS");
        //response.setHeader("Access-Control-Allow-Headers","access-control-allow-methods, access-control-allow-origin, authorization, Content-Type, Accept, X-Requested-With, Origin, Token, Auth-Token, Email, X-User-Token, X-User-Email");
        response.setHeader("Access-Control-Allow-Headers","*");
        response.setHeader("Access-Control-Max-Age", "3600");

        if("OPTIONS".equalsIgnoreCase(((HttpServletRequest) req).getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }

    private String getOrigin(HttpServletRequest request){
        if(StringUtils.isNotBlank(customAllowOrigin)) {
            return customAllowOrigin;
        }
        for (Enumeration<?> e = request.getHeaderNames(); e.hasMoreElements();) {
            String headerName = (String) e.nextElement();
            if(StringUtils.isNotBlank(headerName) && "ORIGIN".equals(headerName.toUpperCase())) {
                return request.getHeader(headerName);
            }
        }
        LOGGER.info("Leveraging the wildcard : *");
        return "*";
    }

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}
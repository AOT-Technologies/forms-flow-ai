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
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * This class is support CORS for Camunda application
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Component
@Order(SecurityProperties.DEFAULT_FILTER_ORDER)
public class CustomCorsFilter implements Filter {

    @Configuration
    public class CustomCorsFilter extends CorsFilter {

        public CustomCorsFilter(CorsConfigurationSource source) {
            super((CorsConfigurationSource) source);
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
        	response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
            response.addHeader("Access-Control-Allow-Headers",
                    "Access-Control-Allow-Origin, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, authorization");
            response.setHeader("Access-Control-Max-Age", "3600");
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
            	filterChain.doFilter(request, response);
            }
            
        }

    }
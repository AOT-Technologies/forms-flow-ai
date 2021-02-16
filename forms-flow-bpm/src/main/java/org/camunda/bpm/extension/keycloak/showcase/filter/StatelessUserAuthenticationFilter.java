package org.camunda.bpm.extension.keycloak.showcase.filter;

import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.rest.util.EngineUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class StatelessUserAuthenticationFilter implements Filter {

    @Value("${plugin.identity.keycloak.rest.authorityPrefix:ROLE_}")
    private String authorityPrefix;

    @Value("${plugin.identity.keycloak.rest.userNameClaim}")
    String userNameClaim;

    static Logger log = LoggerFactory.getLogger(StatelessUserAuthenticationFilter.class);

    @Override
    public void init(FilterConfig filterConfig) {

        log.info("Init StatelessUserAuthenticationFilter - usernameclaim {}", this.userNameClaim);

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        // Current limitation: Only works for the default engine
        ProcessEngine engine = EngineUtil.lookupProcessEngine("default");

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String username = null;
        boolean apiClient = false;

        // log.info(SecurityContextHolder.getContext().getAuthentication().getClaims().toString());

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof Jwt) {

            Jwt token = (Jwt) principal;
            if (token.getClaims().containsKey(this.userNameClaim)) {
                log.debug("Get username from JWT-Token by claim {}", this.userNameClaim);
                username = token.getClaims().get(this.userNameClaim).toString();
            }
            // get scopes
            if (token.getClaims().containsKey("scope")) {
                List<String> scopes = Arrays.asList(((String) token.getClaims().get("scope")).split(" "));
                if (scopes.contains("camunda-rest-client")) {
                    apiClient = true;
                    // Get groups from JWT

                }
            }
        } else {
            username = principal.toString();
        }

        try {
            engine.getIdentityService().setAuthentication(username, getUserGroups());
            chain.doFilter(request, response);
        } finally {
            clearAuthentication(engine);
        }

    }

    @Override
    public void destroy() {

    }

    private void clearAuthentication(ProcessEngine engine) {
        engine.getIdentityService().clearAuthentication();
    }

    private List<String> getUserGroups() {

        List<String> groupIds = new ArrayList<String>();

        org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();

        groupIds = authentication.getAuthorities().stream().map(res -> res.getAuthority())
                .map(res -> res.substring(this.authorityPrefix.length())) // Strip Prefix
                .collect(Collectors.toList());

        log.info(groupIds.toString());
        return groupIds;

    }

}
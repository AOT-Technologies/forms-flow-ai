package org.camunda.bpm.extension.keycloak.showcase.rest;

import org.camunda.bpm.engine.IdentityService;
import org.camunda.spin.Spin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.oauth2.provider.authentication.OAuth2AuthenticationDetails;

import javax.servlet.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Keycloak Authentication Filter - used for REST API Security.
 */
public class KeycloakAuthenticationFilter implements Filter {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(KeycloakAuthenticationFilter.class);
	
	/** Access to Camunda's IdentityService. */
	private IdentityService identityService;
	
	/**
	 * Creates a new KeycloakAuthenticationFilter.
	 * @param identityService access to Camunda's IdentityService
	 */
	public KeycloakAuthenticationFilter(IdentityService identityService) {
		this.identityService = identityService;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {

        // Get the Bearer Token and extract claims
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2AuthenticationDetails details = (OAuth2AuthenticationDetails) authentication.getDetails();
        String accessToken = details.getTokenValue();
        String claims = JwtHelper.decode(accessToken).getClaims();
        
        // Extract user ID from Token claims -depending on Keycloak Identity Provider configuration
        // String userId = Spin.JSON(claims).prop("sub").stringValue();
        //String userId = Spin.JSON(claims).prop("email").stringValue(); // useEmailAsCamundaUserId = true
         String userId = Spin.JSON(claims).prop("preferred_username").stringValue(); // useUsernameAsCamundaUserId = true
        LOG.debug("Extracted userId from bearer token: {}", userId);

        try {
        	identityService.setAuthentication(userId, getUserGroups(userId));
        	chain.doFilter(request, response);
        } finally {
        	identityService.clearAuthentication();
        }
	}

    /**
     * Queries the groups of a given user.
     * @param userId the user's ID
     * @return list of groups the user belongs to
     */
    private List<String> getUserGroups(String userId){
        List<String> groupIds = new ArrayList<>();
        // query groups using KeycloakIdentityProvider plugin
        identityService.createGroupQuery().groupMember(userId).list()
        	.forEach( g -> groupIds.add(g.getId()));
        return groupIds;
    }

}

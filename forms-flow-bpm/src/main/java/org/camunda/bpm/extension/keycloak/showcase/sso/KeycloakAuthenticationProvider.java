package org.camunda.bpm.extension.keycloak.showcase.sso;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import javax.servlet.http.HttpServletRequest;

import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.rest.security.auth.AuthenticationResult;
import org.camunda.bpm.engine.rest.security.auth.impl.ContainerBasedAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.util.StringUtils;

/**
 * OAuth2 Authentication Provider for usage with Keycloak and
 * KeycloakIdentityProviderPlugin.
 */
public class KeycloakAuthenticationProvider extends ContainerBasedAuthenticationProvider {

    @Override
    public AuthenticationResult extractAuthenticatedUser(HttpServletRequest request, ProcessEngine engine) {

        // Extract authentication details
        OAuth2Authentication authentication = (OAuth2Authentication) SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null) {
            return AuthenticationResult.unsuccessful();
        }
        Authentication userAuthentication = authentication.getUserAuthentication();
        if (userAuthentication == null || userAuthentication.getDetails() == null) {
            return AuthenticationResult.unsuccessful();
        }

        // Extract user ID from Keycloak authentication result - which is part of the
        // requested user info
        @SuppressWarnings("unchecked")
        // String userId = ((HashMap<String, String>)
                // userAuthentication.getDetails()).get("sub");
                // String userId = ((HashMap<String, String>)
                // userAuthentication.getDetails()).get("email"); // useEmailAsCamundaUserId =
                // true
                // String userId = ((HashMap<String, String>)
                // userAuthentication.getDetails()).get("email");
                String userId = ((HashMap<String, String>) userAuthentication.getDetails()).get("preferred_username");
        // useUsernameAsCamundaUserId = true
        if (StringUtils.isEmpty(userId)) {
            return AuthenticationResult.unsuccessful();
        }

        // Authentication successful
        AuthenticationResult authenticationResult = new AuthenticationResult(userId, true);
        authenticationResult.setGroups(getUserGroups(userId, engine));

        return authenticationResult;
    }

    private List<String> getUserGroups(String userId, ProcessEngine engine) {
        List<String> groupIds = new ArrayList<>();
        // query groups using KeycloakIdentityProvider plugin
        engine.getIdentityService().createGroupQuery().groupMember(userId).list().forEach(g -> groupIds.add(g.getId()));
        return groupIds;
    }



}
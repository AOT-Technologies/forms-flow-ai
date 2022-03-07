package org.camunda.bpm.extension.keycloak.sso;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import javax.servlet.http.HttpServletRequest;

import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.rest.security.auth.AuthenticationResult;
import org.camunda.bpm.engine.rest.security.auth.impl.ContainerBasedAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.util.ObjectUtils;

import net.minidev.json.JSONArray;

/**
 * OAuth2 Authentication Provider for usage with Keycloak and
 * KeycloakIdentityProviderPlugin.
 */
public class KeycloakAuthenticationProvider extends ContainerBasedAuthenticationProvider {

	@Override
	public AuthenticationResult extractAuthenticatedUser(HttpServletRequest request, ProcessEngine engine) {

		// Extract authentication details
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (!(authentication instanceof OAuth2AuthenticationToken)
				|| !(authentication.getPrincipal() instanceof OidcUser)) {
			return AuthenticationResult.unsuccessful();
		}

		OidcUser oidcUserPrincipal = (OidcUser) authentication.getPrincipal();

		String userId = oidcUserPrincipal.getName();

		if (ObjectUtils.isEmpty(userId)) {
			return AuthenticationResult.unsuccessful();
		}

		// Authentication successful
		AuthenticationResult authenticationResult = new AuthenticationResult(userId, true);
		authenticationResult.setGroups(getUserGroups(userId, engine, oidcUserPrincipal));

		return authenticationResult;
	}

	private List<String> getUserGroups(String userId, ProcessEngine engine, OidcUser principal) {
		List<String> groupIds = new ArrayList<>();
		// Find groups or roles from the idToken.
		if (principal.getIdToken().containsClaim("groups")) {
			groupIds.addAll(getKeys(principal.getIdToken(), "groups"));
		} else if (principal.getIdToken().containsClaim("roles")) {
			groupIds.addAll(getKeys(principal.getIdToken(), "roles"));
		} else {
			// query groups using KeycloakIdentityProvider plugin
			engine.getIdentityService().createGroupQuery().groupMember(userId).list()
					.forEach(g -> groupIds.add(g.getId()));
		}
		return groupIds;
	}

	private List<String> getKeys(OidcIdToken token, String nodeName) {
		List<String> keys = new ArrayList<>();
		if (token.containsClaim(nodeName)) {
			for (Object key : (JSONArray) token.getClaim(nodeName)) {
				keys.add(key.toString());
			}
		}
		return keys;
	}

}
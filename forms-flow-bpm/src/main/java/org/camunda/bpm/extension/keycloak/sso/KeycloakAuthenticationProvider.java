package org.camunda.bpm.extension.keycloak.sso;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.rest.security.auth.AuthenticationResult;
import org.camunda.bpm.engine.rest.security.auth.impl.ContainerBasedAuthenticationProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.util.ObjectUtils;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import net.minidev.json.JSONArray;

/**
 * Keycloak Authentication Provider.
 * OAuth2 Authentication Provider for usage with Keycloak and
 * KeycloakIdentityProviderPlugin.
 */
public class KeycloakAuthenticationProvider extends ContainerBasedAuthenticationProvider {

	@Value("${plugin.identity.keycloak.enableClientAuth}")
	private boolean enableClientAuth;

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
		if (!enableClientAuth && principal.getIdToken().containsClaim("groups")) {
			groupIds.addAll(getKeys(principal.getIdToken(), "groups"));
		} else if (enableClientAuth && principal.getIdToken().containsClaim("roles")) {
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
			keys  = ((JSONArray) token.getClaim(nodeName)).stream()
					.map(key ->
							StringUtils.contains(key.toString(), "/") ?
							StringUtils.substringAfter(key.toString(), "/") :
							key.toString())
					.collect(Collectors.toList());
		}
		return keys;
	}


}
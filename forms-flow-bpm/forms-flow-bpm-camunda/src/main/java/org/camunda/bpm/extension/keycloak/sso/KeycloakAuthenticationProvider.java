package org.camunda.bpm.extension.keycloak.sso;

import jakarta.servlet.http.HttpServletRequest;
import net.minidev.json.JSONArray;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.rest.security.auth.AuthenticationResult;
import org.camunda.bpm.engine.rest.security.auth.impl.ContainerBasedAuthenticationProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;
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
		
		String tenantKeyAttr = (String) oidcUserPrincipal.getAttributes().get("tenantKey");
		if (tenantKeyAttr != null) {
		    // Create a list with tenantKeyAttr and set it to the authentication result
		    List<String> tenants = Collections.singletonList(tenantKeyAttr);
		    authenticationResult.setTenants(tenants);
		} else {
		    // Handle the case where tenantKeyAttr is null
		    authenticationResult.setTenants(Collections.emptyList());
		}

		return authenticationResult;
	}

	private List<String> getUserGroups(String userId, ProcessEngine engine, OidcUser principal) {
		List<String> groupIds = new ArrayList<>();
		// Find groups or roles from the idToken.
		// TODO Fix this to get the values from here itself, currently in all case if - else if are always FALSE. Fix this
		if (!enableClientAuth && principal.getIdToken().getClaims().containsKey("groups")) {
			groupIds.addAll(getKeys(principal.getIdToken(), "groups"));
		} else if (enableClientAuth && principal.getIdToken().getClaims().containsKey("roles")) {
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
		if (token.getClaims().containsKey(nodeName)) {
			Object claimValue = token.getClaim(nodeName);
			if (claimValue instanceof ArrayList jsonArray) {
				for (Object array : jsonArray) {
					String keyString = array.toString();
					keys.add(StringUtils.contains(keyString, "/") ? StringUtils.substringAfter(keyString, "/") : keyString);
				}
			}
		}
		return keys;
	}
}
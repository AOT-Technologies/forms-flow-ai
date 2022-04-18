package org.camunda.bpm.extension.keycloak.rest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.IdentityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import net.minidev.json.JSONArray;

/**
 * Keycloak Authentication Filter - used for REST API Security.
 */
public class KeycloakAuthenticationFilter implements Filter {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(KeycloakAuthenticationFilter.class);

	/** Access to Camunda's IdentityService. */
	private IdentityService identityService;

	/** Access to the OAuth2 client service. */
	private OAuth2AuthorizedClientService clientService;

	/**
	 * Creates a new KeycloakAuthenticationFilter.
	 * 
	 * @param identityService access to Camunda's IdentityService
	 */
	public KeycloakAuthenticationFilter(IdentityService identityService, OAuth2AuthorizedClientService clientService) {
		this.identityService = identityService;
		this.clientService = clientService;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {

		// Extract user-name-attribute of the JWT / OAuth2 token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String userId = null;
		Map<String, Object> claims;
		if (authentication instanceof JwtAuthenticationToken) {
			userId = ((JwtAuthenticationToken) authentication).getToken().getClaimAsString("preferred_username");
			claims = ((JwtAuthenticationToken) authentication).getToken().getClaims();
		} else if (authentication.getPrincipal() instanceof OidcUser) {
			userId = ((OidcUser) authentication.getPrincipal()).getPreferredUsername();
			claims = ((OidcUser) authentication.getPrincipal()).getClaims();
		} else {
			throw new ServletException("Invalid authentication request token");
		}
		if (StringUtils.isEmpty(userId)) {
			throw new ServletException("Unable to extract user-name-attribute from token");
		}

		LOG.debug("Extracted userId from bearer token: {}", userId);

		try {
			String tenantKey = null;
			List<String> tenantIds = new ArrayList<>();
			if (claims != null && claims.containsKey("tenantKey")) {
				tenantKey = claims.get("tenantKey").toString();
				tenantIds.add(tenantKey);
			}
			identityService.setAuthentication(userId, getUserGroups(userId, claims, tenantKey), tenantIds);
			chain.doFilter(request, response);
		} finally {
			identityService.clearAuthentication();
		}
	}

	/**
	 * Retrieves groups for given userId
	 * 
	 * @param userId
	 * @param claims
	 * @return
	 */
	private List<String> getUserGroups(String userId, Map<String, Object> claims, String tenantKey) {
		List<String> groupIds = new ArrayList<>();
		
		if (claims != null && claims.containsKey("groups")) {
			groupIds.addAll(getKeys(claims, "groups", null));
		} else if (claims != null && claims.containsKey("roles")) { // Treat roles as alternative to groups
			groupIds.addAll(getKeys(claims, "roles", tenantKey));
		} else {
			identityService.createGroupQuery().groupMember(userId).list().forEach(g -> groupIds.add(g.getId()));
		}
		return groupIds;
	}

	private List<String> getKeys(Map<String, Object> claims, String nodeName, String tenantKey) {
		List<String> keys = new ArrayList<>();
		if (claims.containsKey(nodeName)) {
			for (Object key : (JSONArray) claims.get(nodeName)) {
				String keyValue = key.toString();
				keyValue = StringUtils.contains(keyValue, "/") ? StringUtils.substringAfter(keyValue, "/") : keyValue;
				if (tenantKey != null)
					keyValue = tenantKey + "-" + keyValue;
				keys.add(keyValue);
			}
		}
		return keys;
	}

}

package org.camunda.bpm.extension.keycloak.rest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;




/**
 * Keycloak Authentication Filter
 * Used for REST API Security.
 */
public class KeycloakAuthenticationFilter implements Filter {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(KeycloakAuthenticationFilter.class);
	
	private static List<String> HARD_CODED_ROLES = Arrays.asList("create_designs", "view_designs", "create_submissions", "view_submissions", "view_tasks", "manage_tasks", "admin");
	

	private final String userNameAttribute;

	/** Access to Camunda's IdentityService. */
	private IdentityService identityService;

	/** Access to the OAuth2 client service. */
	private OAuth2AuthorizedClientService clientService;

	private boolean enableClientAuth;
	
	
	private boolean enableMultiTenancy;
	
	
	
	/**
	 * Creates a new KeycloakAuthenticationFilter.
	 *
	 * @param identityService access to Camunda's IdentityService
	 */
	public KeycloakAuthenticationFilter(IdentityService identityService, OAuth2AuthorizedClientService clientService, String userNameAttribute, boolean enableClientAuth, boolean enableMultiTenancy) {
		this.identityService = identityService;
		this.clientService = clientService;
		this.userNameAttribute = userNameAttribute;
		this.enableClientAuth = enableClientAuth;
		this.enableMultiTenancy = enableMultiTenancy;
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
			userId = RestAPIBuilderUtil.getUserIdFromJwt(authentication, userNameAttribute);
			claims = ((JwtAuthenticationToken) authentication).getToken().getClaims();
		} else if (authentication.getPrincipal() instanceof OidcUser) {
			userId = ((OidcUser)authentication.getPrincipal()).getPreferredUsername();
			claims = ((OidcUser)authentication.getPrincipal()).getClaims();
		} else {
			throw new ServletException("Invalid authentication request token");
		}
		if (StringUtils.isEmpty(userId)) {
			throw new ServletException("Unable to extract user-name-attribute from token");
		}

		LOG.debug("Extracted userId from bearer token: {}", userId);
		LOG.debug("enableClientAuth--> {}", enableClientAuth);
		LOG.debug("enableMultiTenancy--> {}", enableMultiTenancy);

		try {
			String tenantKey = null;
			List<String> userGroups = null;
			List<String> tenantIds = new ArrayList<>();
			if (claims != null && claims.containsKey("tenantKey")) {
				tenantKey = claims.get("tenantKey").toString();
				tenantIds.add(tenantKey);
				MDC.put("tenantKey", tenantKey);
			}
			userGroups = getUserGroups(userId, claims, tenantKey);
			// Add role claims to match with dynamically created authorization.
			if (claims.containsKey("role")) {
				for (String role : getKeys(claims, "role")) {
					userGroups.add("ROLE_"+role);
				}
			}
			if (tenantKey != null)
				identityService.setAuthentication(userId, userGroups, tenantIds);
			else
				identityService.setAuthentication(userId, userGroups);
			LOG.debug("Roles for user {} : {} ", userId, userGroups);
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
			List<String> groups = getKeys(claims, "groups");
			if (enableMultiTenancy) { // For multi-tenant setup filter out the groups which are not part of the current tenant.
				groups = groups.stream().filter(group -> group.startsWith(tenantKey)).collect(Collectors.toList());
				// For existing setup we may need to use existing camunda-admin role
				List<String> roles =  getKeys(claims, "roles");
				if (roles.indexOf("camunda-admin") >= 0 ) {
					groups.add(tenantKey+"-camunda-admin");
				}
			}
			groupIds.addAll(groups);
		} else if (claims != null && claims.containsKey("roles")) { // Treat roles as alternative to groups
			List<String> groups = getKeys(claims, "roles");
			if (enableClientAuth) { // If client-auth is enabled, means customer cannot create group and is using client roles instead. In this case create each group as role with prefix GROUP_.   
				groups = groups.stream().filter(group -> group.startsWith("GROUP_")).collect(Collectors.toList());
			}
			groupIds.addAll(groups); 
		} else {
			identityService.createGroupQuery().groupMember(userId).list().forEach(g -> groupIds.add(g.getId()));
		}
		// Set the permission roles to match with the authorizations.
		// Iterate the user's roles with HARD_CODED_ROLES, and set the matching ones as groups.
		if (claims != null &&  (claims.containsKey("roles") || claims.containsKey("role") || claims.containsKey("client_roles")) ) {

			List<String> roles = (List<String>) claims.getOrDefault("roles", 
	                  claims.getOrDefault("role", 
	                  claims.getOrDefault("client_roles", Collections.emptyList())));
			for (String role : roles) {
				if (HARD_CODED_ROLES.contains(role)) {
					if (enableMultiTenancy) {
						//groupIds.add(tenantKey+"-"+role); // No need to add tenantKey to the role as ROLE_ prefix is there.
						groupIds.add("ROLE_"+role);
					}else{
						groupIds.add("ROLE_"+role);
					}
				}
		}
		
	}
		return groupIds;
	}


	private List<String> getKeys(Map<String, Object> claims, String nodeName) {
		List<String> keys = new ArrayList<>();
		if (claims.containsKey(nodeName)) {
			for (Object key : (List<String>) claims.get(nodeName)) {
				String keyValue = key.toString();
				keyValue = StringUtils.contains(keyValue, "/") ? StringUtils.substringAfter(keyValue, "/") : keyValue;
				keys.add(keyValue);
			}
		}
		return keys;
	}
	
	

}
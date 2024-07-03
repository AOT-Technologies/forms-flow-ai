package org.camunda.bpm.extension.keycloak.rest;

import java.io.IOException;
import java.util.*;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;

import org.camunda.bpm.engine.IdentityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import net.minidev.json.JSONArray;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.Assert.assertTrue;

/**
 * Keycloak Authentication Filter Test.
 * Test class for KeycloakAuthenticationFilter.
 */
@ExtendWith(SpringExtension.class)
public class KeycloakAuthenticationFilterTest {

	private KeycloakAuthenticationFilter keycloakAuthenticationFilter;

	@Mock
	private IdentityService identityService;

	@Mock
	private OAuth2AuthorizedClientService clientService;

	@Mock
	private Authentication auth;

	@Mock
	private ServletRequest request;

	@Mock
	private ServletResponse response;

	@Mock
	private FilterChain chain;

	/**
	 * This test perform to check the groups and users
	 * This will validate the userId and userGroups
	 */

	@BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
    }
	@Test
	public void doFilterTest() throws IOException, ServletException {
		String userNameAttribute = "test-user";
		boolean enableClientAuth = false;
		boolean enableMultiTenancy = false;
		keycloakAuthenticationFilter = new KeycloakAuthenticationFilter(identityService, clientService, userNameAttribute, enableClientAuth, enableMultiTenancy);
		SecurityContextHolder.getContext().setAuthentication(auth);

		Map<String, Object> claims = new HashMap<>();
		String userId = "User1";
		JSONArray groups = new JSONArray();
		groups.add(new String("/camunda-admin"));
		groups.add(new String("/formsflow/formsflow-reviewer"));
		claims.put("groups", groups);

		OidcUser oidcUser = mock(OidcUser.class);
		when(auth.getPrincipal())
				.thenReturn(oidcUser);
		when(oidcUser.getName())
				.thenReturn(userId);
		when(oidcUser.getPreferredUsername())
			.thenReturn(userId);
		when(oidcUser.getClaims())
				.thenReturn(claims);

		keycloakAuthenticationFilter.doFilter(request, response, chain);
		ArgumentCaptor<String> userIdCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<List> userGroupsCaptor = ArgumentCaptor.forClass(List.class);
		verify(identityService).setAuthentication(userIdCaptor.capture(), userGroupsCaptor.capture());
		List<String> userGroups = new ArrayList<>();
		userGroups.add("camunda-admin");
		userGroups.add("formsflow/formsflow-reviewer");
		assertEquals("User1", userIdCaptor.getValue());
		assertEquals(userGroups, userGroupsCaptor.getValue());
	}
	
	/**
	 * This test perform to check the roels and users
	 * This will validate the userId and user roles
	 */
	@Test
	public void doFilterTestForclientRoles() throws IOException, ServletException {
		String userNameAttribute = "User1";
		boolean enableClientAuth = true;
		boolean enableMultiTenancy = true;
		String tenantKey = "testtenant";
		keycloakAuthenticationFilter = new KeycloakAuthenticationFilter(identityService, clientService, userNameAttribute, enableClientAuth, enableMultiTenancy);
		
		SecurityContextHolder.getContext().setAuthentication(auth);

		Map<String, Object> claims = new HashMap<>();
		String userId = "User1";
		JSONArray groups = new JSONArray();
		groups.add(new String(tenantKey+"-camunda-admin"));
		groups.add(new String(tenantKey+"-formsflow-reviewer"));
		claims.put("groups", groups);
		claims.put("tenantKey", tenantKey);

		OidcUser oidcUser = mock(OidcUser.class);
		when(auth.getPrincipal()).thenReturn(oidcUser);
		when(oidcUser.getName()).thenReturn(userId);
		when(oidcUser.getPreferredUsername()).thenReturn(userId);
		when(oidcUser.getClaims()).thenReturn(claims);

		keycloakAuthenticationFilter.doFilter(request, response, chain);
		
		ArgumentCaptor<String> userIdCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<List> userRolesCaptor = ArgumentCaptor.forClass(List.class);
		ArgumentCaptor<List> userTenanatCaptor = ArgumentCaptor.forClass(List.class);
		verify(identityService).setAuthentication(userIdCaptor.capture(), userRolesCaptor.capture(), userTenanatCaptor.capture());
		assertEquals("User1", userIdCaptor.getValue());
		
		assertTrue(userRolesCaptor.getValue().contains(tenantKey+"-camunda-admin"));
		assertTrue(userRolesCaptor.getValue().contains(tenantKey+"-formsflow-reviewer"));
	}
}

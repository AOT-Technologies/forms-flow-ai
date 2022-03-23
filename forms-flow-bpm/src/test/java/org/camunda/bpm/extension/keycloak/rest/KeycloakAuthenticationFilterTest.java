package org.camunda.bpm.extension.keycloak.rest;

import java.io.IOException;
import java.util.*;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.camunda.bpm.engine.IdentityService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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
 * Keycloak Authentication Filter Test - used for REST API Security.
 * 
 * @author Sneha Suresh
 */
@ExtendWith(SpringExtension.class)
public class KeycloakAuthenticationFilterTest {

	@InjectMocks
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
	@Test
	public void doFilterTest() throws IOException, ServletException {
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
		SecurityContextHolder.getContext().setAuthentication(auth);

		Map<String, Object> claims = new HashMap<>();
		String userId = "User1";
		JSONArray roles = new JSONArray();
		roles.add(new String("camunda-admin"));
		roles.add(new String("formsflow-reviewer"));
		claims.put("roles", roles);

		OidcUser oidcUser = mock(OidcUser.class);
		when(auth.getPrincipal()).thenReturn(oidcUser);
		when(oidcUser.getName()).thenReturn(userId);
		when(oidcUser.getPreferredUsername()).thenReturn(userId);
		when(oidcUser.getClaims()).thenReturn(claims);

		keycloakAuthenticationFilter.doFilter(request, response, chain);
		
		ArgumentCaptor<String> userIdCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<List> userRolesCaptor = ArgumentCaptor.forClass(List.class);
		verify(identityService).setAuthentication(userIdCaptor.capture(), userRolesCaptor.capture());
		assertEquals("User1", userIdCaptor.getValue());
		
		assertTrue(userRolesCaptor.getValue().contains("camunda-admin"));
		assertTrue(userRolesCaptor.getValue().contains("formsflow-reviewer"));
	}
}

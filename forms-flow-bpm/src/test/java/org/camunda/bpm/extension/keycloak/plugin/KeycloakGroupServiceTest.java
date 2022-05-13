package org.camunda.bpm.extension.keycloak.plugin;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;

import org.camunda.bpm.engine.identity.Group;
import org.camunda.bpm.extension.keycloak.CacheableKeycloakGroupQuery;
import org.camunda.bpm.extension.keycloak.KeycloakConfiguration;
import org.camunda.bpm.extension.keycloak.KeycloakContextProvider;
import org.camunda.bpm.extension.keycloak.rest.KeycloakRestTemplate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Keycloak Group Service Test.
 * Test class for KeycloakGroupService.
 */
@ExtendWith(SpringExtension.class)
public class KeycloakGroupServiceTest {

	@Mock
	private KeycloakRestTemplate restTemplate;

	@Mock
	private KeycloakConfiguration configuration;

	@Mock
	private KeycloakContextProvider keycloakContextProvider;

	@Mock
	private CacheableKeycloakGroupQuery cacheableKeycloakGroupQuery;
	

	/**
	 * Test to assert the groups are returned by keycloak group query by default
	 */
	@Test
	public void requestGroupsByUserIdForAuthByGroup() throws IOException, ServletException {
		String kcUrl = "http://localhost/";
		String userId = "test-user";
		CustomConfig customConfig = new CustomConfig(null, false, false, null);
		KeycloakGroupService groupService = new KeycloakGroupService(configuration, restTemplate,
				keycloakContextProvider, customConfig);
		when(cacheableKeycloakGroupQuery.getUserId()).thenReturn(userId);
		when(configuration.getKeycloakAdminUrl()).thenReturn(kcUrl);

		HttpHeaders header = new HttpHeaders();
		header.setContentType(MediaType.APPLICATION_JSON);

		ResponseEntity<String> responseEntity = new ResponseEntity<>(
				"[{'path': 'test-group', 'id': '1', 'name': 'test-group'}]", header, HttpStatus.OK);

		when(restTemplate.exchange(configuration.getKeycloakAdminUrl() + "/users/" + userId + "/groups?max=0",
				HttpMethod.GET, String.class)).thenReturn(responseEntity);

		List<Group> groups = groupService.requestGroupsByUserId(cacheableKeycloakGroupQuery);
		assertEquals(groups.size(), 1);
	}

	/**
	 * Test to assert the groups are returned by keycloak client roles for client
	 * based auth.
	 */
	@Test
	public void requestGroupsByUserIdForAuthByClient() throws IOException, ServletException {
		String kcUrl = "http://localhost/";
		String userId = "test-user";
		String webClientId = "web-client";
		CustomConfig customConfig = new CustomConfig(webClientId, true, false, null);
		KeycloakGroupService groupService = new KeycloakGroupService(configuration, restTemplate,
				keycloakContextProvider, customConfig);
		when(cacheableKeycloakGroupQuery.getUserId()).thenReturn(userId);
		when(configuration.getKeycloakAdminUrl()).thenReturn(kcUrl);

		HttpHeaders header = new HttpHeaders();
		header.setContentType(MediaType.APPLICATION_JSON);

		ResponseEntity<String> clientEntity = new ResponseEntity<>("[{'id': 'client-id'}]", header, HttpStatus.OK);

		when(restTemplate.exchange(configuration.getKeycloakAdminUrl() + "/clients?clientId=" + webClientId,
				HttpMethod.GET, String.class)).thenReturn(clientEntity);

		ResponseEntity<String> clientRoleEntity = new ResponseEntity<>(
				"[{'path': 'test-role', 'id': '1', 'name': 'test-role'}]", header, HttpStatus.OK);

		when(restTemplate.exchange(
				configuration.getKeycloakAdminUrl() + "/users/" + userId + "/role-mappings/clients/client-id",
				HttpMethod.GET, String.class)).thenReturn(clientRoleEntity);

		List<Group> roles = groupService.requestGroupsByUserId(cacheableKeycloakGroupQuery);
		assertEquals(roles.size(), 1);
	}

}

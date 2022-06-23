package org.camunda.bpm.extension.keycloak.plugin;

import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonArray;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonObject;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonObjectAtIndex;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonString;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonStringAtIndex;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.parseAsJsonArray;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.parseAsJsonObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.authorization.Groups;
import org.camunda.bpm.engine.identity.Group;
import org.camunda.bpm.engine.identity.Tenant;
import org.camunda.bpm.engine.impl.identity.IdentityProviderException;
import org.camunda.bpm.engine.impl.persistence.entity.GroupEntity;
import org.camunda.bpm.extension.keycloak.CacheableKeycloakGroupQuery;
import org.camunda.bpm.extension.keycloak.KeycloakConfiguration;
import org.camunda.bpm.extension.keycloak.KeycloakContextProvider;
import org.camunda.bpm.extension.keycloak.KeycloakUserNotFoundException;
import org.camunda.bpm.extension.keycloak.json.JsonException;
import org.camunda.bpm.extension.keycloak.rest.KeycloakRestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

/**
 * Keycloak Group Service.
 * Custom class for Implementation of group queries against Keycloak's REST API.
 */
public class KeycloakGroupService extends org.camunda.bpm.extension.keycloak.KeycloakGroupService {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(KeycloakGroupService.class);

	private String webClientId;
	private boolean enableClientAuth;
	private boolean enableMultiTenancy;
	private TenantService tenantService;

	public KeycloakGroupService(KeycloakConfiguration keycloakConfiguration, KeycloakRestTemplate restTemplate,
			KeycloakContextProvider keycloakContextProvider, CustomConfig config) {
		super(keycloakConfiguration, restTemplate, keycloakContextProvider);
		this.webClientId = config.getWebClientId();
		this.enableClientAuth = config.isEnableClientAuth();
		this.enableMultiTenancy = config.isEnableMultiTenancy();
		if (this.enableMultiTenancy) {
			this.tenantService = new TenantService(restTemplate, keycloakContextProvider, config);
		}
	}

	/**
	 * Requests groups of a specific user.
	 * 
	 * @param query the group query - including a userId criteria
	 * @return list of matching groups
	 */
	public List<Group> requestGroupsByUserId(CacheableKeycloakGroupQuery query) {
		LOG.debug("requestGroupsByUserId >> enableClientAuth value " + enableClientAuth);
		List<Group> userGroups = null;
		if (enableClientAuth) {
			userGroups = this.requestClientRolesByUserId(query);
		} else {
			userGroups = super.requestGroupsByUserId(query);
		}
		return userGroups;
	}
	
	
	public List<Group> requestGroupsWithoutUserId(CacheableKeycloakGroupQuery query) {
		LOG.debug("requestGroupsWithoutUserId >> enableClientAuth value " + enableClientAuth);
		List<Group> roles = null;
		if (enableClientAuth) {
			if (enableMultiTenancy) {
				roles = this.requestAllTenantRoles();
			} else {
				roles = this.requestClientRoles();
			}
		} else {
			roles = super.requestGroupsWithoutUserId(query);
		}
		return roles;
	}
	

	/**
	 * Requests client roles of a specific user.
	 * 
	 * @param query the group query - including a userId criteria
	 * @return list of matching groups
	 */
	public List<Group> requestClientRolesByUserId(CacheableKeycloakGroupQuery query) {
		String userId = query.getUserId();
		LOG.debug("requestClientRolesByUserId >>  " + userId);
		List<Group> roleList = new ArrayList<>();

		try {
			// get Keycloak specific userID
			String keyCloakID;
			String keycloakClientID;
			String clientId = webClientId;
			String tenantKey = null;
			if (this.enableMultiTenancy) {
				//TODO for now only consider the first client's tenant when user is logging into camunda cockpit.
				List<Tenant> tenants = this.tenantService.requestTenantsByUserId(userId);
				if (tenants.size() > 0) {
					LOG.debug("Found tenants for user " + userId);
					tenantKey = tenants.get(0).getId();
					clientId =  tenantKey +"-" + webClientId;
					LOG.debug("Found clientId for user " + userId +" : " + clientId);
				}
			}
			try {
				keyCloakID = getKeycloakUserID(userId);
				keycloakClientID = getKeycloakClientID(clientId);
			} catch (KeycloakUserNotFoundException e) {
				// user not found: empty search result
				return Collections.emptyList();
			}

			// get groups of this user
			ResponseEntity<String> response = restTemplate.exchange(keycloakConfiguration.getKeycloakAdminUrl()
					+ "/users/" + keyCloakID + "/role-mappings/clients/" + keycloakClientID, HttpMethod.GET,
					String.class);
			if (!response.getStatusCode().equals(HttpStatus.OK)) {
				throw new IdentityProviderException(
						"Unable to read user groups from " + keycloakConfiguration.getKeycloakAdminUrl()
								+ ": HTTP status code " + response.getStatusCodeValue());
			}

			JsonArray searchResult = parseAsJsonArray(response.getBody());
			for (int i = 0; i < searchResult.size(); i++) {
				roleList.add(transformRole(getJsonObjectAtIndex(searchResult, i), tenantKey));
			}

		} catch (HttpClientErrorException hcee) {
			// if userID is unknown server answers with HTTP 404 not found
			if (hcee.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
				return Collections.emptyList();
			}
			throw hcee;
		} catch (RestClientException | JsonException rce) {
			throw new IdentityProviderException("Unable to query groups of user " + userId, rce);
		}

		return roleList;
	}
	
	
	
	/**
	 * Requests client roles for all tenants.
	 * 
	 * @param query the group query - including a userId criteria
	 * @return list of matching groups
	 */
	public List<Group> requestAllTenantRoles() {
		LOG.debug("requestAllTenantRoles >>  " );
		List<Group> roleList = new ArrayList<>();

		try {
			ResponseEntity<String> response = this.tenantService.requestTenants(null);
			LOG.info("response.getBody() " + response.getBody());
			JsonObject searchResult = parseAsJsonObject(response.getBody());
			JsonArray tenantsArr = getJsonArray(searchResult, "tenants");
			for (int i = 0; i < tenantsArr.size(); i++) {
				JsonObject tenantObj = getJsonObjectAtIndex(tenantsArr, i);
				LOG.info("tenantObj " + tenantObj);
				JsonArray roles =  getJsonArray(getJsonObject(tenantObj, "details"), "roles");
				LOG.info("roles " + roles);
				String tenantKey = getJsonString(tenantObj, "key");
				LOG.info("tenantKey " + tenantKey);
				for (int j = 0 ; j < roles.size(); j++) {
					roleList.add(transformRole(getJsonObjectAtIndex(roles, j), tenantKey));
				}
			}

		} catch (HttpClientErrorException hcee) {
			// if userID is unknown server answers with HTTP 404 not found
			if (hcee.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
				return Collections.emptyList();
			}
			throw hcee;
		} catch (RestClientException | JsonException rce) {
			throw new IdentityProviderException("Unable to get all tenant roles ", rce);
		}

		return roleList;
	}
	
	
	/**
	 * Requests client roles of a specific user.
	 * 
	 * @param query the group query - including a userId criteria
	 * @return list of matching groups
	 */
	public List<Group> requestClientRoles() {
		LOG.debug("requestClientRoles >>  " );
		List<Group> roleList = new ArrayList<>();

		try {
			// get Keycloak specific userID
			String keycloakClientID;
			try {
				keycloakClientID = getKeycloakClientID(webClientId);
			} catch (KeycloakUserNotFoundException e) {
				// user not found: empty search result
				return Collections.emptyList();
			}

			// get groups of this user
			ResponseEntity<String> response = restTemplate.exchange(keycloakConfiguration.getKeycloakAdminUrl()
					+ "/clients/" + keycloakClientID + "/roles", HttpMethod.GET,
					String.class);
			if (!response.getStatusCode().equals(HttpStatus.OK)) {
				throw new IdentityProviderException(
						"Unable to read user groups from " + keycloakConfiguration.getKeycloakAdminUrl()
								+ ": HTTP status code " + response.getStatusCodeValue());
			}

			JsonArray searchResult = parseAsJsonArray(response.getBody());
			for (int i = 0; i < searchResult.size(); i++) {
				roleList.add(transformRole(getJsonObjectAtIndex(searchResult, i), null));
			}

		} catch (HttpClientErrorException hcee) {
			// if userID is unknown server answers with HTTP 404 not found
			if (hcee.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
				return Collections.emptyList();
			}
			throw hcee;
		} catch (RestClientException | JsonException rce) {
			throw new IdentityProviderException("Unable to query roles for client " + webClientId, rce);
		}

		return roleList;
	}

	/**
	 * Get the group ID of the configured admin group. Enable configuration using
	 * group path as well. This prevents common configuration pitfalls and makes it
	 * consistent to other configuration options like the flag
	 * 'useGroupPathAsCamundaGroupId'.
	 * 
	 * @param configuredAdminGroupName the originally configured admin group name
	 * @return the corresponding keycloak group ID to use: either internal keycloak
	 *         ID or path, depending on config
	 */
	public String getKeycloakAdminGroupId(String configuredAdminGroupName) {
		String groupId = null;
		if (enableClientAuth) {
			groupId = this.getKeycloakAdminClientId(configuredAdminGroupName);
		} else {
			groupId = super.getKeycloakAdminGroupId(configuredAdminGroupName);
		}
		return groupId;
	}

	public String getKeycloakAdminClientId(String configuredAdminGroupName) {
		if (StringUtils.isBlank(getKeycloakAdminClientId(configuredAdminGroupName))) {
			return null;
		}
		return configuredAdminGroupName;
	}

	/**
	 * Gets the Keycloak internal ID of client.
	 * 
	 * @param clientId the client ID
	 * @return the Keycloak internal ID
	 * @throws KeycloakUserNotFoundException in case the user cannot be found
	 * @throws RestClientException           in case of technical errors
	 */
	protected String getKeycloakClientID(String clientId) throws KeycloakUserNotFoundException, RestClientException {
		try {
			ResponseEntity<String> response = restTemplate.exchange(
					keycloakConfiguration.getKeycloakAdminUrl() + "/clients?clientId=" + clientId, HttpMethod.GET,
					String.class);
			JsonArray resultList = parseAsJsonArray(response.getBody());
			JsonObject result = resultList.get(0).getAsJsonObject();
			if (result != null) {
				return getJsonString(result, "id");
			}
			throw new KeycloakUserNotFoundException(clientId + ": Client Not found");
		} catch (JsonException je) {
			throw new KeycloakUserNotFoundException(clientId + ": Client Not found");
		}
	}

	/**
	 * Maps a Keycloak JSON result to a Group object
	 * 
	 * @param result the Keycloak JSON result
	 * @return the Group object
	 * @throws JsonException in case of errors
	 */
	private GroupEntity transformRole(JsonObject result, String prefix) throws JsonException {
		GroupEntity group = new GroupEntity();
		String name = getJsonString(result, "name");
		if (StringUtils.isNotEmpty(prefix)) {
			name = prefix + "-" + name;
		}
		group.setName(name);
		group.setId(name);
		if (isCamundAdmin(result)) {
			group.setType(Groups.GROUP_TYPE_SYSTEM);
		} else {
			group.setType(Groups.GROUP_TYPE_WORKFLOW);
		}
		return group;
	}

	/**
	 * Checks whether a Keycloak JSON result represents a SYSTEM group.
	 * 
	 * @param result the Keycloak JSON result
	 * @return {@code true} in case the result is a SYSTEM group.
	 * @throws JsonException in case of errors
	 */
	private boolean isCamundAdmin(JsonObject result) throws JsonException {

		String name = getJsonString(result, "name");
		LOG.debug("Name from JSON " + name);
		LOG.debug("Administrator Group Name " + keycloakConfiguration.getAdministratorGroupName());
		if (Groups.CAMUNDA_ADMIN.equals(name) || name.equals(keycloakConfiguration.getAdministratorGroupName())) {
			return true;
		}
		try {
			JsonArray types = getJsonArray(getJsonObject(result, "attributes"), "type");
			for (int i = 0; i < types.size(); i++) {
				if (Groups.GROUP_TYPE_SYSTEM.equals(getJsonStringAtIndex(types, i).toUpperCase())) {
					return true;
				}
			}
		} catch (JsonException ex) {
			return false;
		}
		return false;
	}

}

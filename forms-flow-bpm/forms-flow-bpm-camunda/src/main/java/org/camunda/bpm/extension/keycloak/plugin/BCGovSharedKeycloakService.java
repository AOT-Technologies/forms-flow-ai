package org.camunda.bpm.extension.keycloak.plugin;

import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonString;

import java.util.ArrayList;
import java.util.List;

import org.camunda.bpm.engine.authorization.Groups;
import org.camunda.bpm.engine.identity.Group;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.engine.impl.identity.IdentityProviderException;
import org.camunda.bpm.engine.impl.persistence.entity.GroupEntity;
import org.camunda.bpm.engine.impl.persistence.entity.UserEntity;
import org.camunda.bpm.extension.keycloak.CacheableKeycloakGroupQuery;
import org.camunda.bpm.extension.keycloak.CacheableKeycloakUserQuery;
import org.camunda.bpm.extension.keycloak.KeycloakConfiguration;
import org.camunda.bpm.extension.keycloak.KeycloakContextProvider;
import org.camunda.bpm.extension.keycloak.json.JsonException;
import org.camunda.bpm.extension.keycloak.rest.KeycloakRestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


/**
 * Keycloak Group Service. Custom class for Implementation of group queries
 * against Keycloak's REST API.
 */
public class BCGovSharedKeycloakService extends org.camunda.bpm.extension.keycloak.KeycloakGroupService {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(BCGovSharedKeycloakService.class);

	private String cssApiUrl;
	
	private String cssLoginUrl;
	private String cssApiClient;
	private String cssSecret;

	public BCGovSharedKeycloakService(KeycloakConfiguration keycloakConfiguration, KeycloakRestTemplate restTemplate,
			KeycloakContextProvider keycloakContextProvider, CustomConfig config) {
		super(keycloakConfiguration, restTemplate, keycloakContextProvider);
		this.cssApiUrl = config.getCssApiUrl();
		this.cssLoginUrl = config.getCssApiLogin();
		this.cssApiClient = config.getCssApiClient();
		this.cssSecret = config.getCssApiSecret();
	}
	
	private String getAccessToken() {
		MultiValueMap<String, String> tokenRequestMap = new LinkedMultiValueMap<>();
	    tokenRequestMap.add("client_id", cssApiClient);
	    tokenRequestMap.add("client_secret", cssSecret);
	    tokenRequestMap.add("grant_type", "client_credentials");

	    HttpHeaders tokenHeaders = new HttpHeaders();
	    tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
	    HttpEntity<MultiValueMap<String, String>> tokenRequestEntity = new HttpEntity<>(tokenRequestMap, tokenHeaders);

	    ResponseEntity<String> tokenResponse = restTemplate.postForEntity(cssLoginUrl, tokenRequestEntity, String.class);
	    if (!tokenResponse.getStatusCode().equals(HttpStatus.OK)) {
	        throw new IdentityProviderException(
	                "Unable to obtain token from " + cssLoginUrl + ": HTTP status code " + tokenResponse.getStatusCodeValue());
	    }

	    // Parse the token response (assumes JSON response with an "access_token" field)
	    JsonObject tokenJson = JsonParser.parseString(tokenResponse.getBody()).getAsJsonObject();
	    String accessToken = tokenJson.get("access_token").getAsString();
	    return accessToken;
	}

	/**
	 * Here return all the roles user is part of
	 * 
	 * @param query the group query - including a userId criteria
	 * @return list of matching groups
	 */
	public List<Group> requestGroupsByUserId(CacheableKeycloakGroupQuery query) {
		LOG.debug("requestGroupsByUserId >> ");

		// get groups of this user
		String cssUserRolesUrl = cssApiUrl + "/users/" + query.getUserId() + "/roles";
		HttpHeaders headers = new HttpHeaders();
	    headers.setBearerAuth(getAccessToken());
	    HttpEntity<String> requestEntity = new HttpEntity<>(headers);

	    ResponseEntity<String> response = restTemplate.exchange(cssUserRolesUrl, HttpMethod.GET, requestEntity, String.class);
	    if (!response.getStatusCode().equals(HttpStatus.OK)) {
	        throw new IdentityProviderException(
	                "Unable to read roles " + cssUserRolesUrl + ": HTTP status code " + response.getStatusCode().value());
	    }

		List<Group> groupList = processRolesResponse(response);

		return groupList;
	}
	
	/**
	 * Here return all the roles user is part of
	 * 
	 * @param query the group query - including a userId criteria
	 * @return list of matching groups
	 */
	public List<User> requestUsersWithoutGroupId(CacheableKeycloakUserQuery query) {
		List<User> users = new ArrayList<User>();
		// CSS Api doesn't provide a straight forward endpoint to get all users, so hard coding the user with just current user id.
		UserEntity user = new UserEntity();
		user.setId(query.getId());
		users.add(user);
		return users;
	}
	
	private UserEntity transformUser(JsonObject result) throws JsonException {
		UserEntity user = new UserEntity();
		if (keycloakConfiguration.isUseEmailAsCamundaUserId()) {
			user.setId(getJsonString(result, "email"));
		} else if (keycloakConfiguration.isUseUsernameAsCamundaUserId()) {
			user.setId(getJsonString(result, "username"));
		} else {
			user.setId(getJsonString(result, "id"));
		}
		user.setFirstName(getJsonString(result, "firstName"));
		user.setLastName(getJsonString(result, "lastName"));
		if (!StringUtils.hasLength(user.getFirstName()) && !StringUtils.hasLength(user.getLastName())) {
			user.setFirstName(getJsonString(result, "username"));
		}
		user.setEmail(getJsonString(result, "email"));
		return user;
	}
	

	private List<Group> processRolesResponse(ResponseEntity<String> response) {
		List<Group> groupList = new ArrayList<Group>();

		// Parse the response string into a JsonObject
		JsonObject jsonResponse = JsonParser.parseString(response.getBody()).getAsJsonObject();
		// Retrieve the "data" array from the JSON object
		JsonArray searchResult = jsonResponse.getAsJsonArray("data");

		try {
			for (int i = 0; i < searchResult.size(); i++) {
				JsonObject groupJson = searchResult.get(i).getAsJsonObject();
				GroupEntity group = new GroupEntity();
				String name = getJsonString(groupJson, "name");
				group.setId(name);
				group.setName(name);

				if (Groups.CAMUNDA_ADMIN.equals(name)
						|| name.equals(keycloakConfiguration.getAdministratorGroupName())) {
					group.setType(Groups.GROUP_TYPE_SYSTEM);
				} else {
					group.setType(Groups.GROUP_TYPE_WORKFLOW);
				}
				groupList.add(group);
			}
		} catch (JsonException e) {
			LOG.error("Error while processing CSS response" + e);
		}
		return groupList;
	}

	public List<Group> requestGroupsWithoutUserId(CacheableKeycloakGroupQuery query) {
		LOG.debug("requestGroupsWithoutUserId >> ");
		// get groups of this user
		String cssUserRolesUrl = cssApiUrl + "/roles";
		HttpHeaders headers = new HttpHeaders();
	    headers.setBearerAuth(getAccessToken());
	    HttpEntity<String> requestEntity = new HttpEntity<>(headers);
	    ResponseEntity<String> response = restTemplate.exchange(cssUserRolesUrl, HttpMethod.GET, requestEntity, String.class);
		if (!response.getStatusCode().equals(HttpStatus.OK)) {
			throw new IdentityProviderException(
					"Unable to read roles " + cssUserRolesUrl + ": HTTP status code " + response.getStatusCode().value());
		}
		List<Group> groupList = processRolesResponse(response);
		return groupList;
	}

}

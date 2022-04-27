package org.camunda.bpm.extension.keycloak.plugin;

import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonArray;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonObjectAtIndex;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.getJsonString;
import static org.camunda.bpm.extension.keycloak.json.JsonUtil.parseAsJsonObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.identity.Tenant;
import org.camunda.bpm.engine.impl.identity.IdentityProviderException;
import org.camunda.bpm.engine.impl.persistence.entity.TenantEntity;
import org.camunda.bpm.extension.keycloak.KeycloakContextProvider;
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
 * Implementation of tenants queries against Admin Rest API.
 */
public class TenantService {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(TenantService.class);

	protected KeycloakRestTemplate restTemplate;
	protected KeycloakContextProvider keycloakContextProvider;
	private CustomConfig config;

	public TenantService(KeycloakRestTemplate restTemplate, KeycloakContextProvider keycloakContextProvider,
			CustomConfig config) {
		this.restTemplate = restTemplate;
		this.config = config;
		this.keycloakContextProvider = keycloakContextProvider;
	}

	/**
	 * Requests groups of a specific user.
	 * 
	 * @param query the group query - including a userId criteria
	 * @return list of matching groups
	 */
	public List<Tenant> requestTenantsByUserId(String userName) {
		LOG.debug("requestTenantsByUserId >>  " + userName);
		List<Tenant> tenantList = new ArrayList<>();

		try {

			ResponseEntity<String> response = requestTenants(userName);

			JsonObject searchResult = parseAsJsonObject(response.getBody());
			JsonArray tenantsArr = getJsonArray(searchResult, "tenants");
			for (int i = 0; i < tenantsArr.size(); i++) {
				tenantList.add(transformTenant(getJsonObjectAtIndex(tenantsArr, i)));
			}

		} catch (HttpClientErrorException hcee) {
			// if userID is unknown server answers with HTTP 404 not found
			if (hcee.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
				return Collections.emptyList();
			}
			throw hcee;
		} catch (RestClientException | JsonException rce) {
			throw new IdentityProviderException("Unable to query tenants for user " + userName, rce);
		}
		LOG.debug("requestTenantsByUserId <<  " + userName + ": " + tenantList);
		return tenantList;
	}

	public ResponseEntity<String> requestTenants(String userName) {
		// get tenants for this user
		String url = config.getFormsFlowAdminUrl() + "/tenants?limit=" + Integer.MAX_VALUE;
		if (!StringUtils.isEmpty(userName)) {
			url += "&userName=" + userName;
		}

		ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, String.class);
		if (!response.getStatusCode().equals(HttpStatus.OK)) {
			throw new IdentityProviderException(
					"Unable to read Tenants from ADMIN API for the URL " + config.getFormsFlowAdminUrl()
							+ "/tenants?userName=" + userName + ": HTTP status code " + response.getStatusCodeValue());
		}
		return response;
	}

	/**
	 * Maps a Keycloak JSON result to a Group object
	 * 
	 * @param result the Keycloak JSON result
	 * @return the Group object
	 * @throws JsonException in case of errors
	 */
	private Tenant transformTenant(JsonObject result) throws JsonException {
		TenantEntity tenant = new TenantEntity();
		tenant.setId(getJsonString(result, "key"));
		tenant.setName(getJsonString(result, "name"));

		return tenant;
	}

}

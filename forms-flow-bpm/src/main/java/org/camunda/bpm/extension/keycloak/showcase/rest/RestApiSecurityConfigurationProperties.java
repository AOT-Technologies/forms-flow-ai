package org.camunda.bpm.extension.keycloak.showcase.rest;

import javax.validation.constraints.NotEmpty;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Complete Security Configuration Properties for Camunda REST Api.
 */
@Component
@ConfigurationProperties(prefix = "rest.security")
@Validated
public class RestApiSecurityConfigurationProperties {

	/** 
	 * rest.security.enabled:
	 * 
	 * Rest Security is enabled by default. Switch off by setting this flag to {@code false}.
	 */
	@SuppressWarnings("unused")
	private Boolean enabled = true;

	/** 
	 * rest.security.jwk-set-url:
	 * 
	 * JWK Set URL (e.g. https://<keycloak-host:port>/auth/realms/camunda/protocol/openid-connect/certs).
	 */
	@NotEmpty
	private String jwkSetUrl;
	
	/** 
	 * rest.security.required-audience:
	 * 
	 * Required Audience. 
	 */
	@NotEmpty
	private String requiredAudience;

	// ------------------------------------------------------------------------

	/**
	 * @return the jwkSetUrl
	 */
	public String getJwkSetUrl() {
		return jwkSetUrl;
	}

	/**
	 * @param jwkSetUrl the jwkSetUrl to set
	 */
	public void setJwkSetUrl(String jwkSetUrl) {
		this.jwkSetUrl = jwkSetUrl;
	}

	/**
	 * @return the requiredAudience
	 */
	public String getRequiredAudience() {
		return requiredAudience;
	}

	/**
	 * @param requiredAudience the requiredAudience to set
	 */
	public void setRequiredAudience(String requiredAudience) {
		this.requiredAudience = requiredAudience;
	} 

}

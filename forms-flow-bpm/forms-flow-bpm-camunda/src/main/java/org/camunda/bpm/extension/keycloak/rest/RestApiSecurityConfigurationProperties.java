package org.camunda.bpm.extension.keycloak.rest;

import javax.validation.constraints.NotEmpty;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * RestApi Security Configuration Properties.
 * Complete Security Configuration Properties for Camunda REST Api.
 */
@Data
@Component
@Validated
@NoArgsConstructor
@ConfigurationProperties(prefix = "rest.security")
public class RestApiSecurityConfigurationProperties {

	/** 
	 * rest.security.enabled:
	 * 
	 * Rest Security is enabled by default. Switch off by setting this flag to {@code false}.
	 */
	@SuppressWarnings("unused")
	private Boolean enabled = true;

	/** 
	 * rest.security.provider:
	 * 
	 * Client provider eg : Keycloak.
	 */
	@NotEmpty
	private String provider;
	
	/** 
	 * rest.security.required-audience:
	 * 
	 * Required Audience. 
	 */
	@NotEmpty
	private String requiredAudience;
}

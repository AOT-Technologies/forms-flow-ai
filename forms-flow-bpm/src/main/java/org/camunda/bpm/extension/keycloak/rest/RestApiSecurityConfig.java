package org.camunda.bpm.extension.keycloak.rest;

import jakarta.inject.Inject;
import org.camunda.bpm.engine.IdentityService;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;


/**
 * RestApi Security Config.
 * Optional Security Configuration for Camunda REST Api.
 */
@Configuration
@EnableAutoConfiguration
@EnableWebSecurity
//@Order(SecurityProperties.BASIC_AUTH_ORDER - 20)
@ConditionalOnProperty(name = "rest.security.enabled", havingValue = "true", matchIfMissing = true)
public class RestApiSecurityConfig {

	/** Configuration for REST Api security. */
	@Inject
	private RestApiSecurityConfigurationProperties configProps;

	/** Access to Camunda's Identity Service. */
	@Inject
	private IdentityService identityService;

	@Inject
	private ApplicationContext applicationContext;

	/** Access to Spring Security OAuth2 client service. */
	@Inject
	private OAuth2AuthorizedClientService clientService;

	/**
	 * {@inheritDoc}
	 */

	@Bean
	@Order(2)
	public SecurityFilterChain httpSecurityFilterChain(HttpSecurity http, JwtDecoder jwtDecoder) throws Exception {
		String jwkSetUri = applicationContext.getEnvironment().getRequiredProperty(
				"spring.security.oauth2.client.provider." + configProps.getProvider() + ".jwk-set-uri");

		return http
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(
								antMatcher(HttpMethod.OPTIONS,"/engine-rest/**"),
								antMatcher(HttpMethod.OPTIONS,"/engine-rest-ext/**"),
								antMatcher(HttpMethod.OPTIONS, "/forms-flow-bpm-socket/**"),
								antMatcher(HttpMethod.OPTIONS, "/engine-rest/**"),
								antMatcher("/engine-rest-ext/**"))
						.permitAll()
						.anyRequest().authenticated())
				.oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
						.jwt(jwt -> jwt
								.decoder(jwtDecoder)
								.jwkSetUri(jwkSetUri)))
				.build();
	}

	/**
	 * Create a JWT decoder with issuer and audience claim validation.
	 * @return the JWT decoder
	 */
	@Bean
	public JwtDecoder jwtDecoder() {
		String issuerUri = applicationContext.getEnvironment().getRequiredProperty(
				"spring.security.oauth2.client.provider." + configProps.getProvider() + ".issuer-uri");

		NimbusJwtDecoder jwtDecoder = (NimbusJwtDecoder)
				JwtDecoders.fromOidcIssuerLocation(issuerUri);

		OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(configProps.getRequiredAudience());
		OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuerUri);
		OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);

		jwtDecoder.setJwtValidator(withAudience);

		return jwtDecoder;
	}

	/**
	 * Registers the REST Api Keycloak Authentication Filter.
	 * @return filter registration
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Bean
	public FilterRegistrationBean keycloakAuthenticationFilter(){
		FilterRegistrationBean filterRegistration = new FilterRegistrationBean();

		String userNameAttribute = this.applicationContext.getEnvironment().getRequiredProperty(
				"spring.security.oauth2.client.provider." + this.configProps.getProvider() + ".user-name-attribute");

		filterRegistration.setFilter(new KeycloakAuthenticationFilter(identityService, clientService, userNameAttribute));
		filterRegistration.setOrder(102); // make sure the filter is registered after the Spring Security Filter Chain
		filterRegistration.addUrlPatterns("/engine-rest/*");
		filterRegistration.addUrlPatterns("/engine-rest-ext/*");
		return filterRegistration;
	}
}

package org.camunda.bpm.extension.keycloak.sso;

import jakarta.inject.Inject;
import org.camunda.bpm.extension.keycloak.config.KeycloakCockpitConfiguration;
import org.camunda.bpm.extension.keycloak.config.KeycloakConfigurationFilterRegistrationBean;
import org.camunda.bpm.extension.keycloak.rest.AudienceValidator;
import org.camunda.bpm.extension.keycloak.rest.KeycloakAuthenticationFilter;
import org.camunda.bpm.extension.keycloak.rest.RestApiSecurityConfigurationProperties;
import org.camunda.bpm.spring.boot.starter.property.CamundaBpmProperties;
import org.camunda.bpm.webapp.impl.security.auth.ContainerBasedAuthenticationFilter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.context.request.RequestContextListener;
import org.springframework.web.filter.ForwardedHeaderFilter;

import java.util.Collections;

import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import org.camunda.bpm.engine.IdentityService;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;

/**
 * OAuth2 Login Security Config.
 * Camunda Web application SSO configuration for usage with
 * Auth0IdentityProviderPlugin.
 */
@ConditionalOnMissingClass("org.springframework.test.context.junit.jupiter.SpringExtension")
@Configuration
@EnableAutoConfiguration
@EnableWebSecurity
public class OAuth2LoginSecurityConfig  {

	@Inject
	private KeycloakLogoutHandler keycloakLogoutHandler;

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

	@Inject
	private CamundaBpmProperties camundaBpmProperties;

	@Inject
	private KeycloakCockpitConfiguration keycloakCockpitConfiguration;

	@Bean
	@Order(1)
	public SecurityFilterChain httpSecurityFilterChain(HttpSecurity http, JwtDecoder jwtDecoder) throws Exception {
		String jwkSetUri = applicationContext.getEnvironment().getRequiredProperty(
				"spring.security.oauth2.client.provider." + configProps.getProvider() + ".jwk-set-uri");

		return http
				.csrf(AbstractHttpConfigurer::disable)
				.securityMatcher(AntPathRequestMatcher.antMatcher("/engine-rest-ext/**"))
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



	@Bean
	@Order(2)
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.ignoringRequestMatchers(
						antMatcher("/api/**"),
						antMatcher("/camunda/form-builder/**"),
						antMatcher("/actuator/**")))
				.securityMatcher("/app/**", "/oauth2/**", "/login/**")
				.authorizeHttpRequests(authz -> authz
						.requestMatchers(
								antMatcher("/app/**")
						)
						.authenticated()
						.anyRequest()
						.permitAll())
				.oauth2Login(withDefaults())
				.oauth2Client(withDefaults())
				.logout(logout -> logout
						.logoutRequestMatcher(antMatcher("/app/**/logout"))
						.logoutSuccessHandler(keycloakLogoutHandler)
				);
		return http.build();
	}

	/**
	 * Create a JWT decoder with issuer and audience claim validation.
	 * @return the JWT decoder
	 */
	@Bean
	public JwtDecoder jwtDecoder() {
		String issuerUri = applicationContext.getEnvironment().getRequiredProperty(
				"spring.security.oauth2.client.provider." + configProps.getProvider() + ".issuer-uri");

		NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuerUri);

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
		filterRegistration.setOrder(102);
		filterRegistration.addUrlPatterns("/engine-rest/*");
		filterRegistration.addUrlPatterns("/engine-rest-ext/*");
		return filterRegistration;
	}


	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Bean
	public FilterRegistrationBean containerBasedAuthenticationFilter(){

		FilterRegistrationBean filterRegistration = new FilterRegistrationBean();
		filterRegistration.setFilter(new ContainerBasedAuthenticationFilter());
		filterRegistration.setInitParameters(Collections.singletonMap("authentication-provider",
				"org.camunda.bpm.extension.keycloak.sso.KeycloakAuthenticationProvider"));
		filterRegistration.setOrder(101); // make sure the filter is registered after the Spring Security Filter Chain
		filterRegistration.addUrlPatterns("/app/*");
		return filterRegistration;
	}

	@Bean
	public FilterRegistrationBean<ForwardedHeaderFilter> forwardedHeaderFilter() {
		FilterRegistrationBean<ForwardedHeaderFilter> filterRegistrationBean = new FilterRegistrationBean<>();
		filterRegistrationBean.setFilter(new ForwardedHeaderFilter());
		filterRegistrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE);
		return filterRegistrationBean;
	}

	@Bean
	@Order(0)
	public RequestContextListener requestContextListener() {
		return new RequestContextListener();
	}

	@Bean
	public FilterRegistrationBean cockpitConfigurationFilter() {
		return new KeycloakConfigurationFilterRegistrationBean(
				keycloakCockpitConfiguration,
				camundaBpmProperties.getWebapp().getApplicationPath()
		);
	}
}
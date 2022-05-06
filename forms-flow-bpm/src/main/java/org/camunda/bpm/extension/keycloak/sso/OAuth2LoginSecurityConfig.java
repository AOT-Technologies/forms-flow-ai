package org.camunda.bpm.extension.keycloak.sso;

import java.util.Collections;
import java.util.List;

import javax.inject.Inject;

import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.extension.keycloak.rest.RestApiSecurityConfigurationProperties;
import org.camunda.bpm.webapp.impl.security.auth.ContainerBasedAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.context.request.RequestContextListener;
import org.springframework.web.filter.ForwardedHeaderFilter;

import static org.springframework.security.config.Customizer.withDefaults;

/**
 * OAuth2 Login Security Config.
 * Camunda Web application SSO configuration for usage with
 * Auth0IdentityProviderPlugin.
 */
@Configuration
@ConditionalOnMissingClass("org.springframework.test.context.junit.jupiter.SpringExtension")
@Order(SecurityProperties.BASIC_AUTH_ORDER - 10)
public class OAuth2LoginSecurityConfig extends WebSecurityConfigurerAdapter {

	@Inject
	private KeycloakLogoutHandler keycloakLogoutHandler;

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
				.csrf().ignoringAntMatchers("/api/**","/forms-flow-bpm-socket/**","/engine-rest/**","/engine-rest-ext/**","/camunda/engine-rest/**", "/camunda/engine-rest-ext/**", "/camunda/form-builder/**", "/actuator/**")
				.and()
				.antMatcher("/**")
				.authorizeRequests(
						authorizeRequests ->
								authorizeRequests
										.antMatchers("/app/**")
										.authenticated()
										.anyRequest()
										.permitAll()
				)
				.oauth2Login(withDefaults())
				.oauth2Client(withDefaults())
				.logout()
				.logoutRequestMatcher(new AntPathRequestMatcher("/app/**/logout"))
				.logoutSuccessHandler(keycloakLogoutHandler);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Bean
	public FilterRegistrationBean containerBasedAuthenticationFilter() {

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
}

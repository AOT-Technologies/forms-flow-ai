package org.camunda.bpm.extension.keycloak.sso;

import org.camunda.bpm.webapp.impl.security.auth.ContainerBasedAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.context.request.RequestContextListener;
import org.springframework.web.filter.ForwardedHeaderFilter;

import java.util.Collections;

import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

/**
 * OAuth2 Login Security Config.
 * Camunda Web application SSO configuration for usage with
 * Auth0IdentityProviderPlugin.
 */
@Configuration
@ConditionalOnMissingClass("org.springframework.test.context.junit.jupiter.SpringExtension")
@Order(SecurityProperties.BASIC_AUTH_ORDER - 10)
public class OAuth2LoginSecurityConfig  {

	@Autowired
	private KeycloakLogoutHandler keycloakLogoutHandler;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.ignoringRequestMatchers(antMatcher("/api/**"), antMatcher("/forms-flow-bpm-socket/**"), antMatcher("/engine-rest/**"), antMatcher("/engine-rest-ext/**"), antMatcher("/camunda/engine-rest/**"), antMatcher("/camunda/engine-rest-ext/**"), antMatcher("/camunda/form-builder/**"), antMatcher("/actuator/**")))
				.authorizeHttpRequests(
						auth -> auth
								.requestMatchers(antMatcher("/app/**")).authenticated()
								.anyRequest().permitAll()
				)
				.oauth2Login(withDefaults())
				.oauth2Client(withDefaults())
				.logout(logout -> logout
						.logoutRequestMatcher(antMatcher("/app/**/logout"))
						.logoutSuccessHandler(keycloakLogoutHandler)
				);
		return http.build();
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

package org.camunda.bpm.extension.keycloak.showcase.sso;

import java.util.Collections;

import javax.inject.Inject;

import org.camunda.bpm.webapp.impl.security.auth.ContainerBasedAuthenticationFilter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.context.request.RequestContextListener;

/**
 * Camunda Web application SSO configuration for usage with
 * Auth0IdentityProviderPlugin.
 */
@ConditionalOnMissingClass("org.springframework.test.context.junit4.SpringJUnit4ClassRunner")
@Configuration
@EnableOAuth2Sso
@Order(SecurityProperties.BASIC_AUTH_ORDER - 15)
public class WebAppSecurityConfig extends WebSecurityConfigurerAdapter {

		@Inject
		private KeycloakLogoutHandler keycloakLogoutHandler;

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
		.csrf().ignoringAntMatchers("/api/**","/forms-flow-bpm-socket/**","/engine-rest/**","/engine-rest-ext/**","/camunda/engine-rest/**", "/camunda/engine-rest-ext/**", "/camunda/form-builder/**")
				.and()
				.antMatcher("/**")
				.authorizeRequests()
				.antMatchers("/app/**")
				.authenticated()
				.anyRequest()
				.permitAll()
				.and()
				.logout()
				.logoutRequestMatcher(new AntPathRequestMatcher("/app/**/logout"))
				.logoutSuccessHandler(keycloakLogoutHandler)
		;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Bean
	public FilterRegistrationBean containerBasedAuthenticationFilter() {

		FilterRegistrationBean filterRegistration = new FilterRegistrationBean();
		filterRegistration.setFilter(new ContainerBasedAuthenticationFilter());

		filterRegistration.setInitParameters(Collections.singletonMap("authentication-provider",
				"org.camunda.bpm.extension.keycloak.showcase.sso.KeycloakAuthenticationProvider"));
		filterRegistration.setOrder(101); // make sure the filter is registered after the Spring Security Filter Chain
		filterRegistration.addUrlPatterns("/app/*");
		return filterRegistration;
	}


	@Bean
	@Order(0)
	public RequestContextListener requestContextListener() {
		return new RequestContextListener();
	}

	/**
	 * Configures the OAuth2 TokenStore for Redis Cache usage.
	 * 
	 * @param redisConnectionFactory the Redis Connection Factoryf
	 * @return Redis prepared TokenStore
	 */
	/*
	 * Redis Session Cache not yet in use
	 * 
	 * @Bean
	 * 
	 * @Primary public TokenStore tokenStore(RedisConnectionFactory
	 * redisConnectionFactory) { return new RedisTokenStore(redisConnectionFactory);
	 * }
	 */
}

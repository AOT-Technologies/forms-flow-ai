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
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.apache.catalina.Context;
import org.apache.catalina.connector.Connector;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * Camunda Web application SSO configuration for usage with
 * Auth0IdentityProviderPlugin.
 */
@ConditionalOnMissingClass("org.springframework.test.context.junit4.SpringJUnit4ClassRunner")
@Configuration
@EnableOAuth2Sso
@EnableAutoConfiguration(exclude = { DataSourceAutoConfiguration.class,WebMvcAutoConfiguration.class })
@Order(SecurityProperties.BASIC_AUTH_ORDER - 15)
public class WebAppSecurityConfig extends WebSecurityConfigurerAdapter {

		@Inject
		private KeycloakLogoutHandler keycloakLogoutHandler;

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
		.csrf().ignoringAntMatchers("/api/**", "/engine-rest/**", "/camunda/engine-rest/**","/camunda/form-builder/**")
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
        
        @Bean
        public ServletWebServerFactory servletContainer() {
        	TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
            		@Override
            		protected void postProcessContext(Context context) {
                		SecurityConstraint securityConstraint = new SecurityConstraint();
                		securityConstraint.setUserConstraint("CONFIDENTIAL");
                		SecurityCollection collection = new SecurityCollection();
                		collection.addPattern("/*");
                		securityConstraint.addCollection(collection);
                		context.addConstraint(securityConstraint);
            		}
        	};
        	tomcat.addAdditionalTomcatConnectors(getHttpConnector());
        	return tomcat;
       	}

    	private Connector getHttpConnector() {
        	Connector connector = new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
        	connector.setScheme("http");
        	connector.setPort(8080);
       		connector.setSecure(false);
        	connector.setRedirectPort(8081);
        	return connector;
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
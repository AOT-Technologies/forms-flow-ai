package org.camunda.bpm.extension.keycloak.showcase;

import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.authorization.Authorization;
import org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication;
import org.camunda.bpm.spring.boot.starter.event.PostDeployEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client;

import javax.sql.DataSource;
import java.util.Properties;

import static org.camunda.bpm.engine.authorization.Permissions.ALL;
import static org.camunda.bpm.engine.authorization.Authorization.ANY;
import static org.camunda.bpm.engine.authorization.Authorization.AUTH_TYPE_GRANT;
import static org.camunda.bpm.engine.authorization.Authorization.AUTH_TYPE_GLOBAL;

/**
 * The Camunda Showcase Spring Boot application.
 */
@EnableOAuth2Client
@EnableConfigurationProperties
@PropertySource("application.yaml")
@SpringBootApplication(scanBasePackages = {"org.camunda.bpm.extension"})
@EnableProcessApplication("camunda.showcase")
public class CamundaApplication {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(CamundaApplication.class);
	
	/**
	 * Post deployment work.
	 * @param event
	 */
	@EventListener
	public void onPostDeploy(PostDeployEvent event) {
		LOG.info("========================================");
		LOG.info("Successfully started Camunda Showcase");
		LOG.info("Customized by AOT Technologies");
		LOG.info("========================================\n");
		authorizeServiceAccount();
	}
	
	/**
	 * Starts this application.
	 * @param args arguments
	 */
	public static void main(String... args) {
		SpringApplication.run(CamundaApplication.class, args);
	}

	/**
	 * Primary datasource.
	 * This is owned by Camunda.
	 * Note: Bean name should not be changed.
	 * @return
	 */
	@Bean(name="camundaBpmDataSource")
	@ConfigurationProperties("spring.datasource")
	@Primary
	public DataSource camundaBpmDataSource(){
		return DataSourceBuilder.create().build();
	}

	@Bean
	@ConfigurationProperties(prefix = "security.oauth2.client")
	public Properties clientCredentialProperties() {
		return new Properties();
	}

	private static void authorizeServiceAccount() {
		// Add authorization to service account
		LOG.info("Setting authorization for service account...");
		ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
		/* To read about resource type in Camunda, refer to
		   https://docs.camunda.org/manual/latest/user-guide/process-engine/authorization-service/#resources */
		for (int resourceType = 0; resourceType<=17; resourceType++){
			LOG.info("==> Setting resource type " + resourceType);
			AuthorizationService authorizationService = processEngine.getAuthorizationService();
			Authorization auth;
			// If resource is process defination or instance, set GLOBAL; Else, ALLOW
			if (resourceType == 6 || resourceType == 8) {
				auth = authorizationService.createNewAuthorization(AUTH_TYPE_GLOBAL);
				auth.setUserId("*");
			} else {
				auth = authorizationService.createNewAuthorization(AUTH_TYPE_GRANT);
				auth.setUserId("service-account-"+System.getenv("KEYCLOAK_CLIENTID"));
			}
			auth.setResourceType(resourceType);
			auth.setResourceId(ANY);
			auth.addPermission(ALL);
			authorizationService.saveAuthorization(auth);
		}
		LOG.info("Authorization set!\n");
	}
}

package org.camunda.bpm.extension.keycloak.showcase;

import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.authorization.Authorization;
import org.camunda.bpm.engine.authorization.Resource;
import org.camunda.bpm.engine.authorization.Resources;
import org.camunda.bpm.extension.commons.connector.AccessHandlerFactory;
import org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication;
import org.camunda.bpm.spring.boot.starter.event.PostDeployEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
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
//import org.springframework.session.jdbc.config.annotation.SpringSessionDataSource;

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
		LOG.info("========================================\n");
		//authorizeServiceAccount();
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

	/**
	 * Uncomment this method to enable session management in JDBC.
	 *
	 * Session datasource.
	 * Note: Bean name should not be changed.
	 * @return
	 */
	/*@Bean(name="springSessionDataSource")
	@ConfigurationProperties("session.datasource")
	@SpringSessionDataSource
	public DataSource springSessionDataSource(){
		return DataSourceBuilder.create().build();
	}*/


	@Bean("bpmJdbcTemplate")
	public NamedParameterJdbcTemplate bpmJdbcTemplate(@Qualifier("camundaBpmDataSource") DataSource camundaBpmDataSource) {
		return new NamedParameterJdbcTemplate(camundaBpmDataSource);
	}

	@Bean
	@ConfigurationProperties(prefix = "security.oauth2.client")
	public Properties clientCredentialProperties() {
		return new Properties();
	}

	@Bean
	@ConfigurationProperties(prefix = "formsflow.ai")
	public Properties integrationCredentialProperties() {
		return new Properties();
	}

	@Bean("accessHandlerFactory")
	public FactoryBean accessHandlerFactory() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(AccessHandlerFactory.class);
		return factoryBean;
	}


	private static void authorizeServiceAccount() {
		LOG.info("Setting authorization for service account...");
		ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();

		for (int resourceType = 0; resourceType<=17; resourceType++){
			LOG.info(String.format("==> Setting resource type  %d", resourceType));
			Resource resource = null;
			if (resourceType==0) resource = Resources.APPLICATION;
			else if (resourceType==1) resource = Resources.USER;
			else if (resourceType==2) resource = Resources.GROUP;
			else if (resourceType==3) resource = Resources.GROUP_MEMBERSHIP;
			else if (resourceType==4) resource = Resources.AUTHORIZATION;
			else if (resourceType==5) resource = Resources.FILTER;
			else if (resourceType==6) resource = Resources.PROCESS_DEFINITION;
			else if (resourceType==7) resource = Resources.TASK;
			else if (resourceType==8) resource = Resources.PROCESS_INSTANCE;
			else if (resourceType==9) resource = Resources.DEPLOYMENT;
			else if (resourceType==10) resource = Resources.DECISION_DEFINITION;
			else if (resourceType==11) resource = Resources.TENANT;
			else if (resourceType==12) resource = Resources.TENANT_MEMBERSHIP;
			else if (resourceType==13) resource = Resources.BATCH;
			else if (resourceType==14) resource = Resources.DECISION_REQUIREMENTS_DEFINITION;
			else if (resourceType==15) resource = Resources.REPORT;
			else if (resourceType==16) resource = Resources.DASHBOARD;
			else if (resourceType==17) resource = Resources.OPERATION_LOG_CATEGORY;

			AuthorizationService authorizationService = processEngine.getAuthorizationService();
			Authorization auth;
			// If resource is process definition or instance, set GLOBAL; Else, ALLOW
			if (resourceType == 6 || resourceType == 8 || resourceType == 10 || resourceType == 1 || resourceType == 2 || resourceType == 3) {
				if (authorizationService.isUserAuthorized("*", null, ALL, resource, ANY)) continue;
				auth = authorizationService.createNewAuthorization(AUTH_TYPE_GLOBAL);
				auth.setUserId("*");
			} else {
				String userId = "service-account-"+System.getenv("KEYCLOAK_CLIENTID");
				if (authorizationService.isUserAuthorized(userId, null, ALL, resource, ANY)) continue;
				auth = authorizationService.createNewAuthorization(AUTH_TYPE_GRANT);
				auth.setUserId(userId);
			}
			auth.setResourceType(resourceType);
			auth.setResourceId(ANY);
			auth.addPermission(ALL);
			authorizationService.saveAuthorization(auth);
		}
		LOG.info("Authorization set!\n");
	}
}

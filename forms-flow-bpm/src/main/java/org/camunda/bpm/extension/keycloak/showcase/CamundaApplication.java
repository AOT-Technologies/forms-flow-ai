package org.camunda.bpm.extension.keycloak.showcase;

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
		LOG.info("========================================");
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

}

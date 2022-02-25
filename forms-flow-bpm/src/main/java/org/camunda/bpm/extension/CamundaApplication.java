package org.camunda.bpm.extension;

import org.camunda.bpm.extension.commons.connector.AccessHandlerFactory;
import org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.reactive.ReactiveOAuth2ClientAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.PropertySource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;
import java.util.Properties;


/**
 * The Camunda Showcase Spring Boot application.
 */
@EnableConfigurationProperties
@PropertySource("classpath:application.yaml")
@SpringBootApplication(scanBasePackages = {"org.camunda.bpm.extension"}, exclude = ReactiveOAuth2ClientAutoConfiguration.class)
@EnableProcessApplication("camunda.showcase")
public class CamundaApplication {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(CamundaApplication.class);


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


	@Bean("bpmJdbcTemplate")
	public NamedParameterJdbcTemplate bpmJdbcTemplate(@Qualifier("camundaBpmDataSource") DataSource camundaBpmDataSource) {
		return new NamedParameterJdbcTemplate(camundaBpmDataSource);
	}

	@Bean
	@ConfigurationProperties(prefix = "spring.security.oauth2.client")
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
}

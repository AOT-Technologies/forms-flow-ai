package org.camunda.bpm.extension.commons.connector.support;

import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.repository.ProcessDefinitionQuery;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.function.Function;
import java.util.function.Predicate;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test class for FormAccessHandler
 */
@ExtendWith(SpringExtension.class)
class FormAccessHandlerTest {

	@InjectMocks
	private FormAccessHandler formAccessHandler;

	@Mock
	private NamedParameterJdbcTemplate bpmJdbcTemplate;

	@Mock
	private WebClient webClient;

	@Mock
	private Properties integrationCredentialProperties;

	/**
	 * This test perform a positive test over FormAccessHandler
	 * This  will validate the response entity is Success
	 */
	@Test
	public void exchange_happyFlow_withPatch() {
		ProcessEngines processEngines = mock(ProcessEngines.class);
		Map<String, ProcessEngine> processEngineMap = new HashMap<String, ProcessEngine>();
		ProcessEngine processEngine = mock(ProcessEngine.class);
		processEngineMap.put("default", processEngine);
		ReflectionTestUtils.setField(processEngines, "processEngines", processEngineMap);
		ReflectionTestUtils.setField(processEngines, "isInitialized", true);
		RepositoryService repositoryService = mock(RepositoryService.class);
		when(processEngine.getRepositoryService()).thenReturn(repositoryService);
		ProcessDefinitionQuery processDefinitionQuery = mock(ProcessDefinitionQuery.class);
		when(repositoryService.createProcessDefinitionQuery()).thenReturn(processDefinitionQuery);
		when(processDefinitionQuery.latestVersion()).thenReturn(processDefinitionQuery);
		when(processDefinitionQuery.processDefinitionKey(anyString())).thenReturn(processDefinitionQuery);
		ProcessDefinition processDefinition = mock(ProcessDefinition.class);
		when(processDefinitionQuery.singleResult()).thenReturn(processDefinition);
		when(processDefinition.getId()).thenReturn("abcd123");
		when(bpmJdbcTemplate.queryForObject(anyString(), any(MapSqlParameterSource.class), any(Class.class)))
				.thenReturn("adhjsadhajyuyuxyuxyvxucvyxcuvtyatd");
		WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
		when(webClient.patch()).thenReturn(requestBodyUriSpec);
		when(integrationCredentialProperties.getProperty(anyString())).thenReturn("http://localhost:3001");
		when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodyUriSpec);
		WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
		when(requestBodyUriSpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.accept(any(MediaType.class))).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
		when(requestBodyUriSpec.retrieve()).thenReturn(responseSpec);	
		when(responseSpec.onStatus(any(Predicate.class), any(Function.class))).thenReturn(responseSpec);
		when(responseSpec.toEntity(any(Class.class))).thenReturn(Mono.just(new ResponseEntity("", HttpStatus.OK)));
		
		ResponseEntity<String> expected = new ResponseEntity("", HttpStatus.OK);
		ResponseEntity<String> actual = formAccessHandler.exchange("http://localhost:3001", HttpMethod.PATCH, "{}");
		assertEquals(expected, actual);
	}
	
	/**
	 * This test perform with expired token over FormAccessHandler
	 * This  will validate the response entity 404 status
	 */
	@Test
	public void exchange_withPatch_with_tokenExpired() {
		WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
		WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
		when(integrationCredentialProperties.getProperty("formio.security.username")).thenReturn("admin@example.com");
		when(integrationCredentialProperties.getProperty("formio.security.password")).thenReturn("changeme");
		when(integrationCredentialProperties.getProperty("formio.security.accessTokenUri"))
				.thenReturn("http://localhost:3001/login");
		when(webClient.post()).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.bodyValue(any(Map.class))).thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.accept(any(MediaType.class))).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.exchangeToMono(any(Function.class)))
				.thenReturn(Mono.just("adhjsadhajyuyuxyuxyvxucvyxcuvtyatd"));

		when(webClient.patch()).thenReturn(requestBodyUriSpec);
		when(integrationCredentialProperties.getProperty(anyString())).thenReturn("http://localhost:3001");
		when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.accept(any(MediaType.class))).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
		when(requestBodyUriSpec.retrieve()).thenReturn(responseSpec);
		when(responseSpec.onStatus(any(Predicate.class), any(Function.class))).thenReturn(responseSpec);
		when(responseSpec.toEntity(any(Class.class)))
				.thenReturn(Mono.just(new ResponseEntity("Token Expired", HttpStatus.OK)));

		ResponseEntity<String> expected = new ResponseEntity("Token Expired", HttpStatus.valueOf(404));
		ResponseEntity<String> actual = formAccessHandler.exchange("http://localhost:3001", HttpMethod.PATCH, "{}");
		assertEquals(expected, actual);
	}
	
	/**
	 * This test perform a happy flow with any method
	 * This  will validate the response entity status is OK
	 */
	@Test
	public void exchange_happyFlow_withAnyMethod() {
		ProcessEngines processEngines = mock(ProcessEngines.class);
		Map<String, ProcessEngine> processEngineMap = new HashMap<String, ProcessEngine>();
		ProcessEngine processEngine = mock(ProcessEngine.class);
		processEngineMap.put("default", processEngine);
		ReflectionTestUtils.setField(processEngines, "processEngines", processEngineMap);
		ReflectionTestUtils.setField(processEngines, "isInitialized", true);
		RepositoryService repositoryService = mock(RepositoryService.class);
		when(processEngine.getRepositoryService()).thenReturn(repositoryService);
		ProcessDefinitionQuery processDefinitionQuery = mock(ProcessDefinitionQuery.class);
		when(repositoryService.createProcessDefinitionQuery()).thenReturn(processDefinitionQuery);
		when(processDefinitionQuery.latestVersion()).thenReturn(processDefinitionQuery);
		when(processDefinitionQuery.processDefinitionKey(anyString())).thenReturn(processDefinitionQuery);
		ProcessDefinition processDefinition = mock(ProcessDefinition.class);
		when(processDefinitionQuery.singleResult()).thenReturn(processDefinition);
		when(processDefinition.getId()).thenReturn("abcd123");
		when(bpmJdbcTemplate.queryForObject(anyString(), any(MapSqlParameterSource.class), any(Class.class)))
				.thenReturn("adhjsadhajyuyuxyuxyvxucvyxcuvtyatd");

		WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
		when(webClient.method(any(HttpMethod.class))).thenReturn(requestBodyUriSpec);
		when(integrationCredentialProperties.getProperty(anyString())).thenReturn("http://localhost:3001");
		when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodyUriSpec);
		WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
		when(requestBodyUriSpec.body(any(Mono.class), any(Class.class))).thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.accept(any(MediaType.class))).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
		when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
		when(responseSpec.onStatus(any(Predicate.class), any(Function.class))).thenReturn(responseSpec);
		when(responseSpec.toEntity(any(Class.class))).thenReturn(Mono.just(new ResponseEntity("", HttpStatus.OK)));
		
		ResponseEntity<String> expected = new ResponseEntity("", HttpStatus.OK);
		ResponseEntity<String> actual = formAccessHandler.exchange("http://localhost:3001", HttpMethod.GET, "{}");
		assertEquals(expected, actual);
	}
	
	/**
	 * This test perform with no Access Token in DB
	 * This  will validate the response entity status is OK
	 */
	@Test
	public void exchange_withPatch_with_noAccessTokenInDB() {
		WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
		WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
		when(integrationCredentialProperties.getProperty("formio.security.username")).thenReturn("admin@example.com");
		when(integrationCredentialProperties.getProperty("formio.security.password")).thenReturn("changeme");
		when(integrationCredentialProperties.getProperty("formio.security.accessTokenUri"))
				.thenReturn("http://localhost:3001/login");
		when(webClient.post()).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.bodyValue(any(Map.class))).thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.accept(any(MediaType.class))).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.exchangeToMono(any(Function.class)))
				.thenReturn(Mono.just("adhjsadhajyuyuxyuxyvxucvyxcuvtyatd"));

		when(webClient.patch()).thenReturn(requestBodyUriSpec);
		when(integrationCredentialProperties.getProperty(anyString())).thenReturn("http://localhost:3001");
		when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.accept(any(MediaType.class))).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
		when(requestBodyUriSpec.retrieve()).thenReturn(responseSpec);
		when(responseSpec.onStatus(any(Predicate.class), any(Function.class))).thenReturn(responseSpec);
		when(responseSpec.toEntity(any(Class.class))).thenReturn(Mono.just(new ResponseEntity("", HttpStatus.OK)));
		
		ResponseEntity<String> expected = new ResponseEntity("", HttpStatus.OK);
		ResponseEntity<String> actual = formAccessHandler.exchange("http://localhost:3001", HttpMethod.PATCH, "{}");
		assertEquals(expected, actual);
	}

	/**
	 * This test perform with Blank Access Token
	 * This  will validate the response entity is null
	 */
	@Test
	public void exchange_withPatch_andBlankAccessToken() {
		ProcessEngines processEngines = mock(ProcessEngines.class);
		Map<String, ProcessEngine> processEngineMap = new HashMap<String, ProcessEngine>();
		ProcessEngine processEngine = mock(ProcessEngine.class);
		processEngineMap.put("default", processEngine);
		ReflectionTestUtils.setField(processEngines, "processEngines", processEngineMap);
		ReflectionTestUtils.setField(processEngines, "isInitialized", true);
		RepositoryService repositoryService = mock(RepositoryService.class);
		when(processEngine.getRepositoryService()).thenReturn(repositoryService);
		ProcessDefinitionQuery processDefinitionQuery = mock(ProcessDefinitionQuery.class);
		when(repositoryService.createProcessDefinitionQuery()).thenReturn(processDefinitionQuery);
		when(processDefinitionQuery.latestVersion()).thenReturn(processDefinitionQuery);
		when(processDefinitionQuery.processDefinitionKey(anyString())).thenReturn(processDefinitionQuery);
		ProcessDefinition processDefinition = mock(ProcessDefinition.class);
		when(processDefinitionQuery.singleResult()).thenReturn(processDefinition);
		when(processDefinition.getId()).thenReturn("abcd123");
		when(bpmJdbcTemplate.queryForObject(anyString(), any(MapSqlParameterSource.class), any(Class.class)))
				.thenReturn("");
		WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
		when(webClient.patch()).thenReturn(requestBodyUriSpec);
		when(integrationCredentialProperties.getProperty(anyString())).thenReturn("http://localhost:3001");
		when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodyUriSpec);
		WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
		when(requestBodyUriSpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.accept(any(MediaType.class))).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
		when(requestBodyUriSpec.retrieve()).thenReturn(responseSpec);
		when(responseSpec.onStatus(any(Predicate.class), any(Function.class))).thenReturn(responseSpec);
		when(responseSpec.toEntity(any(Class.class))).thenReturn(Mono.just(new ResponseEntity("", HttpStatus.OK)));
		
		ResponseEntity<String> expected = null;
		ResponseEntity<String> actual = formAccessHandler.exchange("http://localhost:3001", HttpMethod.PATCH, "{}");
		assertEquals(expected, actual);
	}

	/**
	 * This test perform with formUrl ends with form
	 * This  will validate the response entity status is OK
	 */
	@Test
	public void exchange_happyFlow_withUrlEndsWithForm() {
		ProcessEngines processEngines = mock(ProcessEngines.class);
		Map<String, ProcessEngine> processEngineMap = new HashMap<String, ProcessEngine>();
		ProcessEngine processEngine = mock(ProcessEngine.class);
		processEngineMap.put("default", processEngine);
		ReflectionTestUtils.setField(processEngines, "processEngines", processEngineMap);
		ReflectionTestUtils.setField(processEngines, "isInitialized", true);
		RepositoryService repositoryService = mock(RepositoryService.class);
		when(processEngine.getRepositoryService()).thenReturn(repositoryService);
		ProcessDefinitionQuery processDefinitionQuery = mock(ProcessDefinitionQuery.class);
		when(repositoryService.createProcessDefinitionQuery()).thenReturn(processDefinitionQuery);
		when(processDefinitionQuery.latestVersion()).thenReturn(processDefinitionQuery);
		when(processDefinitionQuery.processDefinitionKey(anyString())).thenReturn(processDefinitionQuery);
		ProcessDefinition processDefinition = mock(ProcessDefinition.class);
		when(processDefinitionQuery.singleResult()).thenReturn(processDefinition);
		when(processDefinition.getId()).thenReturn("abcd123");
		when(bpmJdbcTemplate.queryForObject(anyString(), any(MapSqlParameterSource.class), any(Class.class)))
				.thenReturn("adhjsadhajyuyuxyuxyvxucvyxcuvtyatd");
		WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
		when(webClient.patch()).thenReturn(requestBodyUriSpec);
		when(integrationCredentialProperties.getProperty(anyString())).thenReturn("http://localhost:3001");
		when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodyUriSpec);
		WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
		when(requestBodyUriSpec.bodyValue(anyString())).thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.accept(any(MediaType.class))).thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString())).thenReturn(requestBodyUriSpec);
		WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
		when(requestBodyUriSpec.retrieve()).thenReturn(responseSpec);
		when(responseSpec.onStatus(any(Predicate.class), any(Function.class))).thenReturn(responseSpec);
		when(responseSpec.toEntity(any(Class.class))).thenReturn(Mono.just(new ResponseEntity("", HttpStatus.OK)));
		
		ResponseEntity<String> expected = new ResponseEntity("", HttpStatus.OK);
		ResponseEntity<String> actual = formAccessHandler.exchange("http://localhost:3001/form/", HttpMethod.PATCH,
				"{}");
		assertEquals(expected, actual);
	}
}

package org.camunda.bpm.extension.commons.connector.support;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Properties;
import java.util.function.Function;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test class for FormTokenAccessHandler
 */
@ExtendWith(SpringExtension.class)
class FormTokenAccessHandlerTest {

	@InjectMocks
	private FormTokenAccessHandler formTokenAccessHandler;

	@Mock
	private Properties integrationCredentialProperties;

	@Mock
	private WebClient unAuthenticatedWebClient;

	/**
	 * This test will validate the Access Token
	 */
	@Test
	public void getAccessToken_happyFlow1(){
		when(integrationCredentialProperties.getProperty("formio.security.username"))
				.thenReturn("admin@example.com");
		when(integrationCredentialProperties.getProperty("formio.security.password"))
				.thenReturn("changeme");
		when(integrationCredentialProperties.getProperty("formio.security.accessTokenUri"))
				.thenReturn("http://localhost:3001/login");
		WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
		when(unAuthenticatedWebClient.post())
				.thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.uri(anyString()))
				.thenReturn(requestBodyUriSpec);
		WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
		when(requestBodyUriSpec.bodyValue(any(Map.class)))
				.thenReturn(requestHeadersSpec);
		when(requestHeadersSpec.accept(any(MediaType.class)))
				.thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString()))
				.thenReturn(requestBodyUriSpec);
		String expected = "abcdeff";
		when(requestBodyUriSpec.exchangeToMono(any(Function.class)))
				.thenReturn(Mono.just("abcdeff"));
		String actual = formTokenAccessHandler.getAccessToken();
		assertEquals(expected, actual);
	}
}
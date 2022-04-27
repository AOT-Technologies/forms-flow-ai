package org.camunda.bpm.extension.commons.connector.support;

import static org.junit.Assert.assertEquals;

import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.function.Consumer;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test class for ApplicationAccessHandler
 */
@ExtendWith(SpringExtension.class)
class ApplicationAccessHandlerTest {

	@InjectMocks
	private ApplicationAccessHandler applicationAccessHandler;

	@Mock
	private WebClient webClient;

	/**
	 * This test perform a positive test over ApplicationAccessHandler
	 * This  will validate the response entity is Success
	 */
	@Test
	public void testExchangeSuccess() {
		final String apiUrl = "http://localhost:5000/api/application/123";
		WebClient.RequestBodyUriSpec  requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
		when(webClient.method(any(HttpMethod.class)))
				.thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.uri(anyString()))
				.thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.attributes(any(Consumer.class)))
				.thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.accept(any(MediaType.class)))
				.thenReturn(requestBodyUriSpec);
		when(requestBodyUriSpec.header(anyString(), anyString()))
				.thenReturn(requestBodyUriSpec);
		WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
		when(requestBodyUriSpec.body(any(Mono.class), any(Class.class)))
				.thenReturn(requestHeadersSpec);
		WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
		when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
		when(responseSpec.onStatus(any(),any())).thenReturn(responseSpec);
		Mono<ResponseEntity<String>> response = Mono.just(ResponseEntity.ok("Success"));
		when(responseSpec.toEntity(String.class))
				.thenReturn(response);

		ResponseEntity<String> data = applicationAccessHandler.exchange(apiUrl, HttpMethod.GET, "{}");
		assertEquals(data.getBody(), "Success");
	}

}


package org.camunda.bpm.extension.commons.connector.support;

import org.camunda.bpm.extension.commons.connector.FormioTokenServiceProvider;
import org.camunda.bpm.extension.commons.connector.auth.FormioContextProvider;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

/**
 * Form Token AccessHandler Test.
 * Test class for FormTokenAccessHandler.
 */
@ExtendWith(SpringExtension.class)
class FormTokenAccessHandlerTest {

	@InjectMocks
	private FormioTokenServiceProvider formioTokenServiceProvider;

	private FormioContextProvider formioContextProvider;

	@Mock
	private Properties integrationCredentialProperties;

	@Mock
	private WebClient webClient;

	//@Test
	public void test_init_config(){
		String email = "admin@example.com";
		String password = "changeme";
		String accessTokenUri = "http://localhost:3001/form/token";
		when(integrationCredentialProperties.getProperty("formio.security.username"))
				.thenReturn(email);
		when(integrationCredentialProperties.getProperty("formio.security.password"))
				.thenReturn(password);
		when(integrationCredentialProperties.getProperty("formio.security.accessTokenUri"))
				.thenReturn(accessTokenUri);
		ReflectionTestUtils.setField(formioTokenServiceProvider, "formioContextProvider", formioContextProvider);
		Assertions.assertNull(ReflectionTestUtils.getField(formioTokenServiceProvider,"formioContextProvider"));
		formioTokenServiceProvider.init();
		Assertions.assertNotNull(ReflectionTestUtils.getField(formioTokenServiceProvider,"formioContextProvider"));
	}

	/**
	 * This test will validate the Access Token
	 */
	//@Test
	public void getAccessToken_happyFlow1(){
		formioContextProvider = mock(FormioContextProvider.class);
		ReflectionTestUtils.setField(formioTokenServiceProvider, "formioContextProvider", formioContextProvider);
		when(formioContextProvider.createFormioRequestAccessToken())
				.thenReturn("aghgdahdgahdasjdsahdjadhaj");
		String expected = "aghgdahdgahdasjdsahdjadhaj";
		String actual = formioTokenServiceProvider.getAccessToken();
		assertEquals(expected, actual);
	}
}

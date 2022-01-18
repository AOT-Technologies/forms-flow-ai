package org.camunda.bpm.extension.hooks.listeners.execution;

import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

/**
 * Test class for FormAccessTokenCacheListener
 */
@ExtendWith(SpringExtension.class)
public class FormAccessTokenCacheListenerTest {

	@InjectMocks
	private FormAccessTokenCacheListener formAccessTokenCacheListener;

	@Mock
	private FormSubmissionService formSubmissionService;

	/**
	 * This test case perform a positive test over notify method in FormAccessTokenCacheListener
	 * This will validate the Test ID and Access Token
	 */
	@Test
	public void get_Token_with_delegateExecution_test() throws IOException {
		DelegateExecution delegateExecution = mock(DelegateExecution.class);
		String accessToken = "543789765427877936383638";
		when(formSubmissionService.getAccessToken()).thenReturn(accessToken);
		ProcessEngine processEngine = mock(ProcessEngine.class);
		when(delegateExecution.getProcessEngine())
				.thenReturn(processEngine);
		RuntimeService runtimeService = mock(RuntimeService.class);
		when(processEngine.getRuntimeService())
				.thenReturn(runtimeService);
		when(delegateExecution.getId())
				.thenReturn("testId");
		formAccessTokenCacheListener.notify(delegateExecution);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		verify(runtimeService)
				.setVariable(captor.capture(), anyString(), captor.capture());
		List<String> captorValues = captor.getAllValues();
		assertEquals("testId", captorValues.get(0));
		assertEquals("543789765427877936383638", captorValues.get(1));
	}

}

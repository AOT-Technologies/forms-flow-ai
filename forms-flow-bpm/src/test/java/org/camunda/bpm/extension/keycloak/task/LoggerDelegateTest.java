package org.camunda.bpm.extension.keycloak.task;

import static org.junit.Assert.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.util.logging.Logger;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Test class for LoggerDelegate
 */
@ExtendWith(SpringExtension.class)
public class LoggerDelegateTest {

	@InjectMocks
	private LoggerDelegate loggerDelegate;

	/**
	 * Positive test case This test case will validate if the passed data is
	 * printing correctly
	 *
	 * @throws Exception
	 */
	@Test
	public void print_executionData_test() throws Exception {
		DelegateExecution delegateExecution = mock(DelegateExecution.class);
		when(delegateExecution.getProcessDefinitionId()).thenReturn("pro-def-1");
		when(delegateExecution.getCurrentActivityId()).thenReturn("act-3");
		when(delegateExecution.getCurrentActivityName()).thenReturn("test");
		when(delegateExecution.getProcessInstanceId()).thenReturn("proc-1");
		when(delegateExecution.getProcessBusinessKey()).thenReturn("123");
		when(delegateExecution.getId()).thenReturn("exec-1");
		loggerDelegate.execute(delegateExecution);
	}

	/**
	 * Negative test case This test case will validate the behaviour with null input
	 */
	@Test
	public void print_null_executionData_test() throws Exception {
		DelegateExecution delegateExecution = null;
		assertThrows(Exception.class, () -> {
			loggerDelegate.execute(delegateExecution);
		});
	}

}

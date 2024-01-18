package org.camunda.bpm.extension.hooks.listeners.task;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Date;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.hooks.listeners.stubs.CustomUserStub;
import org.joda.time.DateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Task Duration Attributes Listener Test.
 * Test class for TaskDurationAttributesListener
 */
@ExtendWith(SpringExtension.class)
public class TaskDurationAttributesListenerTest {

	@InjectMocks
	TaskDurationAttributesListener taskDurationAttributesListener;

	@Mock
	private Expression SLAInDays;

	@Mock
	private DelegateTask delegateTask;

	@Mock
	private DelegateExecution delegateExecution;

	@Captor
	private ArgumentCaptor<DelegateTask> Captor;

	/**
	 * This test case will invoke notify method with SLA 5 days
	 * @throws Exception
	 * This will validate the due date
	 */
	@Test
	public void notify_with_delegateTask_with_SLAIDays() throws Exception {
		when(delegateTask.getExecution()).thenReturn(delegateExecution);
		String startDate = new DateTime().toString();
		when(delegateTask.getExecution().getVariable(anyString()))
				.thenReturn(startDate);
		when(SLAInDays.getValue(delegateTask)).thenReturn(5);
		taskDurationAttributesListener.notify(delegateTask);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Date> dueDateCaptor = ArgumentCaptor.forClass(Date.class);
		verify(delegateExecution, times(2)).setVariable(anyString(), captor.capture());
		verify(delegateTask).setDueDate(dueDateCaptor.capture());
		DateTime expected = new DateTime(captor.getAllValues().get(1));
		CustomUserStub customUserStub = new CustomUserStub();
		DateTime actual = customUserStub.addBusinessDays(new DateTime(startDate),5);
		assertEquals(actual.toDate().toString(), dueDateCaptor.getValue().toString());
		assertEquals(actual, expected);
	}

	/**
	 * This test case will invoke notify method with SLA 3 days by default
	 * This will validate the due date
	 */
	@Test
	public void notify_with_delegateTask_with_SLAIDays_null() {
		when(delegateTask.getExecution()).thenReturn(delegateExecution);
		String startDate = new DateTime().toString();
		when(delegateTask.getExecution().getVariable(anyString()))
				.thenReturn(startDate);
		taskDurationAttributesListener.notify(delegateTask);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Date> dueDateCaptor = ArgumentCaptor.forClass(Date.class);
		verify(delegateExecution, times(2)).setVariable(anyString(), captor.capture());
		verify(delegateTask).setDueDate(dueDateCaptor.capture());
		DateTime expected = new DateTime(captor.getAllValues().get(1));
		CustomUserStub customUserStub = new CustomUserStub();
		DateTime actual = customUserStub.addBusinessDays(new DateTime(startDate),3);
		assertEquals(actual.toDate().toString(), dueDateCaptor.getValue().toString());
		assertEquals(actual, expected);
	}
}

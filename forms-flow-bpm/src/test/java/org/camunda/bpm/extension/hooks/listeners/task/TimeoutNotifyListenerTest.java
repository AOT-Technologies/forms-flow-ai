package org.camunda.bpm.extension.hooks.listeners.task;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.ProcessEngineServices;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.engine.identity.UserQuery;
import org.camunda.bpm.engine.task.IdentityLink;
import org.camunda.bpm.extension.hooks.listeners.stubs.IdentityStub;
import org.camunda.bpm.extension.hooks.listeners.stubs.UserStub;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Timeout Notify Listener Test.
 * Test class for TimeoutNotifyListener
 */
@ExtendWith(SpringExtension.class)
public class TimeoutNotifyListenerTest {

	@InjectMocks
	private TimeoutNotifyListener timeoutNotifyListener;

	@Mock
	private Expression escalationGroup;

	@Mock
	private Expression messageName;

	@Mock
	private Expression currentDate;

	@Mock
	private DelegateTask delegateTask;

	@Mock
	private DelegateExecution delegateExecution;

	@Mock
	private ProcessEngine processEngine;

	@Mock
	private IdentityService identityService;

	@Mock
	private UserQuery user;

	@Mock
	private ProcessEngineServices processEngineServices;

	@Mock
	private RuntimeService runtimeService;

	/**
	 * This test case perform a positive test over notify method in TimeoutNotifyListener
	 *  Assignee is not blank and escalation true. 
	 *  This test will validate the send message.
	 */
	@Test
	public void notify_with_DelegateTask_and_validateAssignee_escalation_assignee_not_blank() throws Exception {
		when(currentDate.getValue(delegateTask))
				.thenReturn("2021-11-01T16:38:34.144+05:30");
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(delegateTask.getExecution().getVariable(anyString()))
				.thenReturn("2021-10-30T16:39:53.041+05:30");
		when(escalationGroup.getValue(delegateTask))
				.thenReturn("someGroup");

		List<User> userList = new ArrayList<>();
		userList.add(new UserStub("1", "John", "Honai", "john.honai@aot-technologies.com", "password"));
		userList.add(new UserStub("2", "Peter", "Scots", "peter.scots@aot-technologies.com", "password"));
		when(delegateExecution.getProcessEngine())
				.thenReturn(processEngine);
		when(processEngine.getIdentityService())
				.thenReturn(identityService);
		UserQuery userQuery = mock(UserQuery.class);
		UserQuery userQuery1 = mock(UserQuery.class);
		when(identityService.createUserQuery())
				.thenReturn(userQuery);
		when(userQuery.memberOfGroup(anyString()))
				.thenReturn(userQuery1);
		when(userQuery1.list())
				.thenReturn(userList);
		User userId = userList.get(0);
		when(delegateTask.getAssignee())
				.thenReturn("assigneeId1");
		when(userQuery.userId(anyString()))
				.thenReturn(user);
		when(userQuery.userId(anyString()).singleResult())
				.thenReturn(userId);
		when(delegateTask.getId())
				.thenReturn("taskId-1");

		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageName.getValue(delegateExecution))
				.thenReturn("Success");
		timeoutNotifyListener.notify(delegateTask);

		ArgumentCaptor<String> messageNameCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Map> messageVariableCaptor = ArgumentCaptor.forClass(Map.class);
		verify(runtimeService).startProcessInstanceByMessage(messageNameCaptor.capture(),
				messageVariableCaptor.capture());
		Map<String, Object> eMessageVariables = new HashMap<>();
		eMessageVariables.put("cc", "john.honai@aot-technologies.com,peter.scots@aot-technologies.com");
		eMessageVariables.put("to", "john.honai@aot-technologies.com");
		eMessageVariables.put("category", "activity_escalation");
		eMessageVariables.put("taskid", "taskId-1");
		assertEquals("Success", messageNameCaptor.getValue());
		assertEquals(eMessageVariables, messageVariableCaptor.getValue());
	}

	/**
	 * This test case perform over notify method in TimeoutNotifyListener
	 * Assignee is blank and escalation true. 
	 * This test will validate the send message.
	 */
	@Test
	public void notify_with_DelegateTask_and_validateAssignee_escalation_and_assignee_blank() throws Exception {
		when(currentDate.getValue(delegateTask))
				.thenReturn("2021-11-01T16:38:34.144+05:30");
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(delegateTask.getExecution().getVariable(anyString()))
				.thenReturn("2021-10-30T16:39:53.041+05:30");
		when(escalationGroup.getValue(delegateTask))
				.thenReturn("someGroup");

		Set<IdentityLink> identityList = new HashSet();
		identityList.add(new IdentityStub("1", "CANDIDATE", "GROUP1", "TASK1", "PROCESS1", "TENANT-1", "Honai"));
		when(delegateTask.getCandidates())
				.thenReturn(identityList);

		List<User> userList = new ArrayList<>();
		userList.add(new UserStub("1", "John", "Honai", "john.honai@aot-technologies.com", "password"));
		userList.add(new UserStub("2", "Peter", "Scots", "peter.scots@aot-technologies.com", "password"));
		when(delegateExecution.getProcessEngine())
				.thenReturn(processEngine);
		when(processEngine.getIdentityService())
				.thenReturn(identityService);
		UserQuery userQuery = mock(UserQuery.class);
		UserQuery userQuery1 = mock(UserQuery.class);
		when(identityService.createUserQuery())
				.thenReturn(userQuery);
		when(userQuery.memberOfGroup(anyString()))
				.thenReturn(userQuery1);
		when(userQuery1.list())
				.thenReturn(userList);
		User userId = userList.get(0);
		when(delegateTask.getAssignee())
				.thenReturn("");
		when(userQuery.userId(anyString()))
				.thenReturn(user);
		when(userQuery.userId(anyString()).singleResult())
				.thenReturn(userId);
		when(delegateTask.getId())
				.thenReturn("taskId-1");
		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageName.getValue(delegateExecution))
				.thenReturn("Success");
		timeoutNotifyListener.notify(delegateTask);

		ArgumentCaptor<String> messageNameCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Map> messageVariableCaptor = ArgumentCaptor.forClass(Map.class);
		verify(runtimeService).startProcessInstanceByMessage(messageNameCaptor.capture(),
				messageVariableCaptor.capture());
		Map<String, Object> eMessageVariables = new HashMap<>();
		eMessageVariables.put("cc", "john.honai@aot-technologies.com,peter.scots@aot-technologies.com");
		eMessageVariables.put("to", "john.honai@aot-technologies.com,peter.scots@aot-technologies.com");
		eMessageVariables.put("category", "activity_escalation");
		eMessageVariables.put("taskid", "taskId-1");
		assertEquals("Success", messageNameCaptor.getValue());
		assertEquals(eMessageVariables, messageVariableCaptor.getValue());
	}

	/**
	 * This test case perform a positive test over notify method in TimeoutNotifyListener
	 * Assignee is not blank and reminder true. 
	 * This test will validate the send message.
	 */
	@Test
	public void notify_with_DelegateTask_and_validateAssignee_reminder_and_assignee_not_blank() throws Exception {
		when(currentDate.getValue(delegateTask))
				.thenReturn("2021-10-30T16:51:29.115+05:30");
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(delegateTask.getExecution().getVariable(anyString()))
				.thenReturn("2021-10-31T16:51:29.183+05:30");
		when(escalationGroup.getValue(delegateTask))
				.thenReturn("someGroup");

		List<User> userList = new ArrayList<>();
		userList.add(new UserStub("1", "John", "Honai", "john.honai@aot-technologies.com", "password"));
		userList.add(new UserStub("2", "Peter", "Scots", "peter.scots@aot-technologies.com", "password"));
		when(delegateExecution.getProcessEngine())
				.thenReturn(processEngine);
		when(processEngine.getIdentityService())
				.thenReturn(identityService);
		UserQuery userQuery = mock(UserQuery.class);
		UserQuery userQuery1 = mock(UserQuery.class);
		when(identityService.createUserQuery())
				.thenReturn(userQuery);
		when(userQuery.memberOfGroup(anyString()))
				.thenReturn(userQuery1);
		when(userQuery1.list())
				.thenReturn(userList);
		User userId = userList.get(0);
		when(delegateTask.getAssignee())
				.thenReturn("assigneeId1");
		when(userQuery.userId(anyString()))
				.thenReturn(user);
		when(userQuery.userId(anyString()).singleResult())
				.thenReturn(userId);
		when(delegateTask.getId())
				.thenReturn("taskId-1");
		
		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageName.getValue(delegateExecution))
				.thenReturn("Success");
		timeoutNotifyListener.notify(delegateTask);

		ArgumentCaptor<String> messageNameCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Map> messageVariableCaptor = ArgumentCaptor.forClass(Map.class);
		verify(runtimeService).startProcessInstanceByMessage(messageNameCaptor.capture(),
				messageVariableCaptor.capture());
		Map<String, Object> eMessageVariables = new HashMap<>();
		eMessageVariables.put("to", "john.honai@aot-technologies.com");
		eMessageVariables.put("category", "activity_reminder");
		eMessageVariables.put("taskid", "taskId-1");
		assertEquals("Success", messageNameCaptor.getValue());
		assertEquals(eMessageVariables, messageVariableCaptor.getValue());
	}

	/**
	 * This test case perform over notify method in TimeoutNotifyListener
	 * Assignee is blank and reminder true. 
	 * This test will validate the send message.
	 */
	@Test
	public void notify_with_DelegateTask_and_validateAssignee_reminder_and_assignee_blank() throws Exception {
		when(currentDate.getValue(delegateTask))
				.thenReturn("2021-10-30T16:51:29.115+05:30");
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(delegateTask.getExecution().getVariable(anyString()))
				.thenReturn("2021-10-31T16:51:29.183+05:30");
		when(escalationGroup.getValue(delegateTask))
				.thenReturn("someGroup");

		Set<IdentityLink> identityList = new HashSet();
		identityList.add(new IdentityStub("1", "CANDIDATE", "GROUP1", "TASK1", "PROCESS1", "TENANT-1", "Honai"));
		when(delegateTask.getCandidates())
				.thenReturn(identityList);

		List<User> userList = new ArrayList<>();
		userList.add(new UserStub("1", "John", "Honai", "john.honai@aot-technologies.com", "password"));
		userList.add(new UserStub("2", "Peter", "Scots", "peter.scots@aot-technologies.com", "password"));
		when(delegateExecution.getProcessEngine())
				.thenReturn(processEngine);
		when(processEngine.getIdentityService())
				.thenReturn(identityService);
		UserQuery userQuery = mock(UserQuery.class);
		UserQuery userQuery1 = mock(UserQuery.class);
		when(identityService.createUserQuery())
				.thenReturn(userQuery);
		when(userQuery.memberOfGroup(anyString()))
				.thenReturn(userQuery1);
		when(userQuery1.list())
				.thenReturn(userList);
		User userId = userList.get(0);
		when(delegateTask.getAssignee())
				.thenReturn("");
		when(userQuery.userId(anyString()))
				.thenReturn(user);
		when(userQuery.userId(anyString()).singleResult())
				.thenReturn(userId);
		when(delegateTask.getId())
				.thenReturn("taskId-1");
		
		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageName.getValue(delegateExecution))
				.thenReturn("Success");
		timeoutNotifyListener.notify(delegateTask);

		ArgumentCaptor<String> messageNameCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Map> messageVariableCaptor = ArgumentCaptor.forClass(Map.class);
		verify(runtimeService).startProcessInstanceByMessage(messageNameCaptor.capture(),
				messageVariableCaptor.capture());
		Map<String, Object> eMessageVariables = new HashMap<>();
		eMessageVariables.put("to", "john.honai@aot-technologies.com,peter.scots@aot-technologies.com");
		eMessageVariables.put("category", "activity_reminder");
		eMessageVariables.put("taskid", "taskId-1");
		assertEquals("Success", messageNameCaptor.getValue());
		assertEquals(eMessageVariables, messageVariableCaptor.getValue());
	}

}

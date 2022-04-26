package org.camunda.bpm.extension.hooks.listeners.task;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Test class for NotifyListener
 */
@ExtendWith(SpringExtension.class)
public class NotifyListenerTest {

	@InjectMocks
	private NotifyListener notifyListener;

	@Mock
	private Expression messageId;

	@Mock
	private Expression category;

	@Mock
	private Expression emailGroups;

	@Mock
	private Expression groupsOnly;

	@Mock
	private DelegateTask delegateTask;

	@Mock
	private DelegateExecution delegateExecution;

	@Mock
	private ProcessEngine processEngine;

	@Mock
	private IdentityService identityService;

	@Mock
	private ProcessEngineServices processEngineServices;

	@Mock
	private RuntimeService runtimeService;

	@BeforeEach
	public void setup() {
		try {
			Field field = notifyListener.getClass().getDeclaredField("objectMapper");
			field.setAccessible(true);
		} catch (NoSuchFieldException e) {
			e.printStackTrace();
		}
		ObjectMapper objectMapper = new ObjectMapper();
		ReflectionTestUtils.setField(this.notifyListener, "objectMapper", objectMapper);
	}

	/**
	 * This test case perform a positive test over notify method in NotifyListener
	 * This test will validate the send message.
	 */
	@Test
	public void invoke_notify_with_delegateTask_with_groupsOnly_Y_and_emailGroups() {
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(groupsOnly.getValue(delegateExecution))
				.thenReturn("Y");
		when(emailGroups.getValue(delegateExecution))
				.thenReturn("[\"forms-flow-designer\",\"forms-flow-clerk\"]");
		when(category.getValue(delegateExecution))
				.thenReturn("test-category");
		when(delegateTask.getId())
				.thenReturn("taskId-1");
		
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
		
		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageId.getValue(delegateExecution))
				.thenReturn("id1");
		notifyListener.notify(delegateTask);

		ArgumentCaptor<String> messageIdCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Map> messageVariableCaptor = ArgumentCaptor.forClass(Map.class);
		verify(runtimeService).startProcessInstanceByMessage(messageIdCaptor.capture(),
				messageVariableCaptor.capture());
		Map<String, Object> eMessageVariables = new HashMap<>();
		eMessageVariables.put("email_to", "john.honai@aot-technologies.com,peter.scots@aot-technologies.com");
		eMessageVariables.put("name", "Team");
		eMessageVariables.put("category", "test-category");
		eMessageVariables.put("taskid", "taskId-1");
		assertEquals("id1", messageIdCaptor.getValue());
		assertEquals(eMessageVariables, messageVariableCaptor.getValue());
	}

	/**
	 * This test case perform a positive test over notify method in NotifyListener
	 * This test will validate the send message.
	 */
	@Test
	public void invoke_notify_with_delegateTask_with_groupsOnly_N_and_emailGroups() {
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(groupsOnly.getValue(delegateExecution))
				.thenReturn("N");
		when(emailGroups.getValue(delegateExecution))
				.thenReturn("[\"forms-flow-designer\",\"forms-flow-clerk\"]");
		when(category.getValue(delegateExecution))
				.thenReturn("test-category");
		when(delegateTask.getId())
				.thenReturn("taskId-1");
		
		Set<IdentityLink> identityList = new HashSet<>();
		identityList.add(new IdentityStub("1", "CANDIDATE", "Honai", "Group1", "task1", "5678986", "tenant1"));
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
		
		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageId.getValue(delegateExecution))
				.thenReturn("id1");
		notifyListener.notify(delegateTask);
		ArgumentCaptor<String> messageIdCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Map> messageVariableCaptor = ArgumentCaptor.forClass(Map.class);
		verify(runtimeService).startProcessInstanceByMessage(messageIdCaptor.capture(),
				messageVariableCaptor.capture());
		Map<String, Object> eMessageVariables = new HashMap<>();
		eMessageVariables.put("email_to", "john.honai@aot-technologies.com,peter.scots@aot-technologies.com");
		eMessageVariables.put("name", "Team");
		eMessageVariables.put("category", "test-category");
		eMessageVariables.put("taskid", "taskId-1");
		assertEquals("id1", messageIdCaptor.getValue());
		assertEquals(eMessageVariables, messageVariableCaptor.getValue());
	}

	/**
	 * This test case perform with empty email groups
	 * GroupOnly is Y 
	 */
	@Test
	public void invoke_notify_with_delegateTask_with_groupsOnly_Y_and_emailGroups_empty() {
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(groupsOnly.getValue(delegateExecution))
				.thenReturn("Y");
		when(emailGroups.getValue(delegateExecution))
				.thenReturn("");
		when(category.getValue(delegateExecution))
				.thenReturn("test-category");
		when(delegateTask.getId())
				.thenReturn("taskId-1");
		
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
		
		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageId.getValue(delegateExecution))
				.thenReturn("id1");
		notifyListener.notify(delegateTask);
		verify(runtimeService, times(0)).startProcessInstanceByMessage(anyString(), any(Map.class));
	}

	/**
	 * This test case perform with empty email groups
	 * GroupOnly is N 
	 * This will validate the send message
	 */
	@Test
	public void invoke_notify_with_delegateTask_with_groupsOnly_N_and_emailGroups_empty() {
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(groupsOnly.getValue(delegateExecution))
				.thenReturn("N");
		when(emailGroups.getValue(delegateExecution))
				.thenReturn("");
		when(category.getValue(delegateExecution))
				.thenReturn("test-category");
		when(delegateTask.getId())
				.thenReturn("taskId-1");

		Set<IdentityLink> identityList = new HashSet<>();
		identityList.add(new IdentityStub("1", "CANDIDATE", "Honai", "Group1", "task1", "5678986", "tenant1"));
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
		
		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageId.getValue(delegateExecution))
				.thenReturn("id1");
		notifyListener.notify(delegateTask);
		verify(runtimeService, times(1)).startProcessInstanceByMessage(anyString(), any(Map.class));

		ArgumentCaptor<String> messageIdCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Map> messageVariableCaptor = ArgumentCaptor.forClass(Map.class);
		verify(runtimeService).startProcessInstanceByMessage(messageIdCaptor.capture(),
				messageVariableCaptor.capture());
		Map<String, Object> eMessageVariables = new HashMap<>();
		eMessageVariables.put("email_to", "john.honai@aot-technologies.com,peter.scots@aot-technologies.com");
		eMessageVariables.put("name", "Team");
		eMessageVariables.put("category", "test-category");
		eMessageVariables.put("taskid", "taskId-1");
		assertEquals("id1", messageIdCaptor.getValue());
		assertEquals(eMessageVariables, messageVariableCaptor.getValue());

	}
	
	/**
	 * Negetive test case. GroupOnly is Y and email groups is not empty
	 * To address is empty
	 */
	@Test
	public void invoke_notify_with_delegateTask_with_groupsOnly_Y_and_emailGroups_with_toAddressempty() {
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(groupsOnly.getValue(delegateExecution))
				.thenReturn("Y");
		when(emailGroups.getValue(delegateExecution))
				.thenReturn("[\"forms-flow-designer\",\"forms-flow-clerk\"]");
		when(category.getValue(delegateExecution))
				.thenReturn("test-category");
		when(delegateTask.getId())
				.thenReturn("taskId-1");

		List<User> userList = new ArrayList<>();
		userList.add(new UserStub("1", "John", "Honai", "", "password"));
		userList.add(new UserStub("2", "Peter", "Scots", "", "password"));
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
		when(userQuery1.list()).thenReturn(userList);

		when(delegateExecution.getProcessEngineServices())
				.thenReturn(processEngineServices);
		when(delegateExecution.getProcessEngineServices().getRuntimeService())
				.thenReturn(runtimeService);
		Map<String, Object> variables = new HashMap<>();
		variables.put("_file", new Object());
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(messageId.getValue(delegateExecution))
				.thenReturn("id1");
		notifyListener.notify(delegateTask);
		verify(runtimeService, times(0)).startProcessInstanceByMessage(anyString(), any(Map.class));
	}

}
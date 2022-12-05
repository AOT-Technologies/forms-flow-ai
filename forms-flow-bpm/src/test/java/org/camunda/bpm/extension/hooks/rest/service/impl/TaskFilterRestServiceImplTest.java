package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.camunda.bpm.engine.task.TaskQuery;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Variant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
public class TaskFilterRestServiceImplTest {

	@InjectMocks
	private TaskFilterRestServiceImpl filterRestServiceImpl;

	@Mock
	private ProcessEngine processEngine;

	@Mock
	private Request request;

	@Mock
	private TaskService taskService;

	@Mock
	private TaskQuery taskQuery;

	@Mock
	private ObjectMapper objectMapper;

	@Mock
	private Variant variant;

	/**
	 * This test case perform a positive test over execute method in FilterRestServiceImpl
	 */
	@Test
	public void execute_filterQuery_jsonList() throws JsonProcessingException {
		TaskQueryDto querydto = mock(TaskQueryDto.class);
		org.camunda.bpm.engine.rest.dto.task.TaskQueryDto taskdto = new org.camunda.bpm.engine.rest.dto.task.TaskQueryDto();
		taskdto.setAssignee("John Honai");
		taskdto.setProcessDefinitionName("Two Step Approval");
		when(querydto.getCriteria()).thenReturn(taskdto);
		when(processEngine.getTaskService())
				.thenReturn(taskService);
		taskQuery.taskAssignee(querydto.getCriteria().getAssignee());
		taskQuery.processDefinitionName(querydto.getCriteria().getProcessDefinitionName());
		when(taskService.createTaskQuery())
				.thenReturn(taskQuery);
		when(request.selectVariant(any()))
				.thenReturn(variant);
		when(variant.getMediaType())
				.thenReturn(MediaType.APPLICATION_JSON_TYPE);
		filterRestServiceImpl.queryList(request, querydto, null, null);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		verify(taskQuery, times(2)).taskAssignee(captor.capture());
		assertEquals("John Honai", captor.getValue());
	}

	/**
	 * This test case perform a positive test over execute method in FilterRestServiceImpl 
	 * This test will execute the query to return hal tasklist
	 */
	@Test
	public void execute_filterQuery_halList() throws JsonProcessingException {
		TaskQueryDto querydto = mock(TaskQueryDto.class);
		org.camunda.bpm.engine.rest.dto.task.TaskQueryDto taskdto = new org.camunda.bpm.engine.rest.dto.task.TaskQueryDto();
		taskdto.setAssignee("John Honai");
		taskdto.setProcessDefinitionName("Two Step Approval");
		when(querydto.getCriteria()).thenReturn(taskdto);
		when(processEngine.getTaskService())
				.thenReturn(taskService);
		taskQuery.taskAssignee(querydto.getCriteria().getAssignee());
		taskQuery.processDefinitionName(querydto.getCriteria().getProcessDefinitionName());
		when(taskService.createTaskQuery())
				.thenReturn(taskQuery);
		when(request.selectVariant(any()))
				.thenReturn(variant);
		when(variant.getMediaType())
				.thenReturn(Hal.APPLICATION_HAL_JSON_TYPE);
		filterRestServiceImpl.queryList(request, querydto, null, null);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		verify(taskQuery, times(2)).processDefinitionName(captor.capture());
		assertEquals("Two Step Approval", captor.getValue());
	}

	/**
	 * This test case will evaluate TaskFilterRestServiceImpl with a negative case
	 * This test case expects a JsonProcessingException 
	 * Expectation will be to fail the case with Runtime Exception
	 * @throws InvalidRequestException
	 */
	@Test
	public void execute_filterQuery_with_invalid_mediatype() throws JsonProcessingException {
		TaskQueryDto querydto = mock(TaskQueryDto.class);
		org.camunda.bpm.engine.rest.dto.task.TaskQueryDto taskdto = new org.camunda.bpm.engine.rest.dto.task.TaskQueryDto();
		taskdto.setAssignee("John Honai");
		taskdto.setProcessDefinitionName("Two Step Approval");
		when(querydto.getCriteria()).thenReturn(taskdto);
		when(processEngine.getTaskService())
				.thenReturn(taskService);
		taskQuery.taskAssignee(querydto.getCriteria().getAssignee());
		taskQuery.processDefinitionName(querydto.getCriteria().getProcessDefinitionName());
		when(taskService.createTaskQuery())
				.thenReturn(taskQuery);
		when(request.selectVariant(any()))
				.thenReturn(variant);
		when(variant.getMediaType())
				.thenReturn(MediaType.APPLICATION_XML_TYPE);
		assertThrows(RuntimeException.class, () -> {
			filterRestServiceImpl.queryList(request, querydto, null, null);
		});
	}
	
	@Test
	public void invoke_filterCount_with_success() throws JsonProcessingException {
		TaskQueryDto querydto = mock(TaskQueryDto.class);
		org.camunda.bpm.engine.rest.dto.task.TaskQueryDto taskdto = new org.camunda.bpm.engine.rest.dto.task.TaskQueryDto();
		taskdto.setAssignee("John Honai");
		taskdto.setProcessDefinitionName("Two Step Approval");
		when(querydto.getCriteria()).thenReturn(taskdto);
		when(processEngine.getTaskService()).thenReturn(taskService);
		taskQuery.taskAssignee(querydto.getCriteria().getAssignee());
		taskQuery.processDefinitionName(querydto.getCriteria().getProcessDefinitionName());
		when(taskQuery.count()).thenReturn(2L);
		when(taskService.createTaskQuery()).thenReturn(taskQuery);
		filterRestServiceImpl.queryCount(querydto);
		verify(taskQuery, times(1)).count();		
	}

}

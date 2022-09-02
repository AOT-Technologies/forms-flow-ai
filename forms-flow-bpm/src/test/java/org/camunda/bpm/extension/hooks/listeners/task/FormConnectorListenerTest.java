package org.camunda.bpm.extension.hooks.listeners.task;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.listeners.data.Application;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.camunda.bpm.model.bpmn.Query;
import org.camunda.bpm.model.bpmn.instance.ExtensionElements;
import org.camunda.bpm.model.bpmn.instance.FlowElement;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperty;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
import static org.mockito.Mockito.*;

/**
 * Form Connector Listener Test.
 * Test class for FormConnectorListener.
 */
@ExtendWith(SpringExtension.class)
public class FormConnectorListenerTest {

	@InjectMocks
	private FormConnectorListener formConnectorListener;

	@Mock
	private Properties integrationCredentialProperties;

	@Mock
	private FormSubmissionService formSubmissionService;

	@Mock
	private Expression fields;

	@Mock
	private Expression copyDataIndicator;

	@Mock
	private DelegateTask delegateTask;

	@Mock
	private DelegateExecution delegateExecution;

	@Mock
	private FlowElement flowElement;

	@Mock
	private ExtensionElements extensionElements;

	@Mock
	private CamundaProperties camundaProperties;

	@Mock
	private CamundaProperty camundaProperty;

	@BeforeEach
	public void setup() {
		try {
			Field field = formConnectorListener.getClass().getDeclaredField("bpmObjectMapper");
			field.setAccessible(true);
		} catch (NoSuchFieldException e) {
			e.printStackTrace();
		}
		ObjectMapper objectMapper = new ObjectMapper();
		ReflectionTestUtils.setField(this.formConnectorListener, "bpmObjectMapper", objectMapper);
	}
	
	/**
	 * This test case perform a positive test over notify method in FormConnectorListener
	 * Copy indicator is Y and formId is not empty
	 * This test will validate the new form Url with submission Id and form Id
	 */
	@Test
	public void invokeNotify_with_createSubmission_with_copyDataIndicator_Y() throws IOException {
		String formUrl = "http://localhost:3001/form/id1/submission";
		String applicationId1 = "63628738293";
		String applicationId2 = "7267864574";
		String json = "[\"applicationId1\",\"applicationId2\"]";
		Map<String, Object> variables = new HashMap<>();
		variables.put(FORM_URL, formUrl);
		variables.put("applicationId1", applicationId1);
		variables.put("applicationId2", applicationId2);
		when(delegateTask.getExecution()).thenReturn(delegateExecution);
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(delegateExecution.getBpmnModelElementInstance())
				.thenReturn(flowElement);
		when(flowElement.getExtensionElements())
				.thenReturn(extensionElements);
		Query elementsQuery = mock(Query.class);
		Query elementsQuery1 = mock(Query.class);
		when(extensionElements.getElementsQuery())
				.thenReturn(elementsQuery);
		when(elementsQuery.filterByType(CamundaProperties.class))
				.thenReturn(elementsQuery1);
		when(elementsQuery1.singleResult())
				.thenReturn(camundaProperties);
		when(camundaProperty.getCamundaValue())
				.thenReturn("TwoStepApproval");
		when(camundaProperty.getCamundaName())
				.thenReturn("formName");
		List<CamundaProperty> camundaPropertyList = new ArrayList<>(Collections.singletonList(camundaProperty));
		when(camundaProperties.getCamundaProperties())
				.thenReturn(camundaPropertyList);
		when(formSubmissionService.getFormIdByName(anyString()))
				.thenReturn("id2");
		when(delegateExecution.getVariables().get(FORM_URL))
				.thenReturn(variables);
		when(fields.getValue(delegateTask))
				.thenReturn(json);
		when(copyDataIndicator.getValue(delegateTask))
				.thenReturn("Y");
		when(formSubmissionService.readSubmission(anyString()))
				.thenReturn("{\"data\": {\"Form1\": \"Complete Submission\", \"Form3\": \"Review Submission\" }}");
		when(formSubmissionService.createSubmission(anyString(), anyString()))
				.thenReturn("submissionid1");
		
		formConnectorListener.notify(delegateTask);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		verify(delegateExecution).setVariable(anyString(), captor.capture());
		assertEquals("http://localhost:3001/form/id2/submission/submissionid1", captor.getValue());
	}
	
	/**
	 * This test case perform a positive test over notify method in FormConnectorListener
	 * Copy indicator is N and formId is not empty
	 * This test will validate the new form Url with submission Id and form Id
	 */
	@Test
	public void invokeNotify_with_createSubmission_with_copyDataIndicator_N() throws IOException {
		String formUrl = "http://localhost:3001/form/id1/submission";
		String applicationId1 = "63628738293";
		String applicationId2 = "7267864574";
		String json = "[\"applicationId1\",\"applicationId2\"]";
		Map<String, Object> variables = new HashMap<>();
		variables.put(FORM_URL, formUrl);
		variables.put("applicationId1", applicationId1);
		variables.put("applicationId2", applicationId2);
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(delegateExecution.getBpmnModelElementInstance())
				.thenReturn(flowElement);
		when(flowElement.getExtensionElements())
				.thenReturn(extensionElements);
		Query elementsQuery = mock(Query.class);
		Query elementsQuery1 = mock(Query.class);
		when(extensionElements.getElementsQuery())
				.thenReturn(elementsQuery);
		when(elementsQuery.filterByType(CamundaProperties.class))
				.thenReturn(elementsQuery1);
		when(elementsQuery1.singleResult())
				.thenReturn(camundaProperties);
		when(camundaProperty.getCamundaValue())
				.thenReturn("TwoStepApproval");
		when(camundaProperty.getCamundaName())
				.thenReturn("formName");
		List<CamundaProperty> camundaPropertyList = new ArrayList<>(Collections.singletonList(camundaProperty));
		when(camundaProperties.getCamundaProperties())
				.thenReturn(camundaPropertyList);
		when(formSubmissionService.getFormIdByName(anyString()))
				.thenReturn("id2");
		when(delegateExecution.getVariables().get(FORM_URL))
				.thenReturn(variables);
		when(fields.getValue(delegateTask)).thenReturn(json);
		when(copyDataIndicator.getValue(delegateTask))
				.thenReturn("");
		when(formSubmissionService.readSubmission(anyString()))
				.thenReturn("{\"data\": {\"Form1\": \"Complete Submission\", \"Form3\": \"Review Submission\" }}");
		formConnectorListener.notify(delegateTask);
		when(formSubmissionService.createSubmission(anyString(), anyString()))
				.thenReturn("submissionid1");
		
		formConnectorListener.notify(delegateTask);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		verify(delegateExecution).setVariable(anyString(), captor.capture());
		assertEquals("http://localhost:3001/form/id2/submission/submissionid1", captor.getValue());
	}

	/**
	 * This test case perform a negetive test over notify method in FormConnectorListener
	 * Copy indicator is Y and formId is empty
	 * This test will validate the behaviour with blank input
	 */
	@Test
	public void invokeNotify_with_createSubmission_with_getFormId_empty() throws IOException {
		String formUrl = "http://localhost:3001/form/id1/submission";
		String applicationId1 = "63628738293";
		String applicationId2 = "7267864574";
		String json = "[\"applicationId1\",\"applicationId2\"]";
		Map<String, Object> variables = new HashMap<>();
		variables.put(FORM_URL, formUrl);
		variables.put("applicationId1", applicationId1);
		variables.put("applicationId2", applicationId2);
		when(delegateTask.getExecution())
				.thenReturn(delegateExecution);
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		when(delegateExecution.getBpmnModelElementInstance())
				.thenReturn(flowElement);
		when(flowElement.getExtensionElements()).thenReturn(extensionElements);
		Query elementsQuery = mock(Query.class);
		Query elementsQuery1 = mock(Query.class);
		when(extensionElements.getElementsQuery())
				.thenReturn(elementsQuery);
		when(elementsQuery.filterByType(CamundaProperties.class))
				.thenReturn(elementsQuery1);
		when(elementsQuery1.singleResult())
				.thenReturn(camundaProperties);
		when(camundaProperty.getCamundaValue())
				.thenReturn("TwoStepApproval");
		when(camundaProperty.getCamundaName())
				.thenReturn("");
		List<CamundaProperty> camundaPropertyList = new ArrayList<>(Collections.singletonList(camundaProperty));
		when(camundaProperties.getCamundaProperties())
				.thenReturn(camundaPropertyList);
		when(formSubmissionService.getFormIdByName(anyString()))
				.thenReturn("id2");
		when(delegateExecution.getVariables().get(FORM_URL))
				.thenReturn(variables);
		when(fields.getValue(delegateTask))
				.thenReturn(json);
		when(copyDataIndicator.getValue(delegateTask))
				.thenReturn("Y");
		when(formSubmissionService.readSubmission(anyString()))
				.thenReturn("{\"data\": {\"Form1\": \"Complete Submission\", \"Form3\": \"Review Submission\" }}");
		formConnectorListener.notify(delegateTask);
		verify(formSubmissionService, times(0))
				.getFormIdByName(anyString());
		when(formSubmissionService.createSubmission(anyString(), anyString()))
				.thenReturn("submissionid1");
		
		formConnectorListener.notify(delegateTask);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		verify(delegateExecution).setVariable(anyString(), captor.capture());
		assertEquals("http://localhost:3001/form/null/submission/submissionid1", captor.getValue());
	}

	/**
	 * This test case will evaluate FormConnectorListener with a negative case
	 * This test case expects a JsonProcessingException
	 * Expectation will be to fail the case with Runtime Exception
	 * @throws IOException
	 */

	@Test
	public void invokeNotify_with_createSubmission_with_JsonProcessingException() throws IOException {
		String json = "[\"applicationId1\",\"applicationId2\"]";
		when(delegateTask.getExecution()).thenReturn(delegateExecution);
		when(delegateExecution.getBpmnModelElementInstance())
				.thenReturn(flowElement);
		when(flowElement.getExtensionElements())
				.thenReturn(extensionElements);
		Query elementsQuery = mock(Query.class);
		Query elementsQuery1 = mock(Query.class);
		when(extensionElements.getElementsQuery())
				.thenReturn(elementsQuery);
		when(elementsQuery.filterByType(CamundaProperties.class))
				.thenReturn(elementsQuery1);
		when(elementsQuery1.singleResult())
				.thenReturn(camundaProperties);
		when(fields.getValue(delegateTask))
				.thenReturn(json);
		when(formSubmissionService.readSubmission(anyString()))
				.thenReturn("{\"data\": {\"Form1\": \"Complete Submission, \"Form3\": \"Review Submission\" }}");

		formConnectorListener.notify(delegateTask);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
		assertThrows(RuntimeException.class, () -> {
			captor.getValue();
		});
	}

	/**
	 * This test case will evaluate FormConnectorListener with a negative case
	 * This test case expects an IOException
	 * Expectation will be to fail the case with Runtime Exception
	 * @throws IOException
	 */

	@Test
	public void invokeNotify_with_createSubmission_with_IOException() throws IOException {
		String json = "[\"applicationId1\",\"applicationId2\"]";
		when(delegateTask.getExecution()).thenReturn(delegateExecution);
		when(delegateExecution.getBpmnModelElementInstance())
				.thenReturn(flowElement);
		when(flowElement.getExtensionElements())
				.thenReturn(extensionElements);
		Query elementsQuery = mock(Query.class);
		Query elementsQuery1 = mock(Query.class);
		when(extensionElements.getElementsQuery())
				.thenReturn(elementsQuery);
		when(elementsQuery.filterByType(CamundaProperties.class))
				.thenReturn(elementsQuery1);
		when(elementsQuery1.singleResult())
				.thenReturn(camundaProperties);
		when(fields.getValue(delegateTask))
				.thenReturn(json);
		when(formSubmissionService.readSubmission(anyString()))
				.thenReturn("{\"data\": {\"Form1\": \"Complete Submission\", \"Form3\": \"Review Submission\" }}");
		when(formSubmissionService.createSubmission(anyString(), anyString()))
				.thenThrow(IOException.class);

		assertThrows(RuntimeException.class, () -> {
			formConnectorListener.notify(delegateTask);
		});
	}
}
package org.camunda.bpm.extension.hooks.listeners.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test class for ExternalSubmissionListener
 */
@ExtendWith(SpringExtension.class)
public class ExternalSubmissionListenerTest {

    @InjectMocks
    private ExternalSubmissionListener externalSubmissionListener;

    @Mock
    private FormSubmissionService formSubmissionService;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    private Expression formName;

    @BeforeEach
    public void setup() {
        try {
            Field field = externalSubmissionListener.getClass().getDeclaredField("objectMapper");
            field.setAccessible(true);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
        ObjectMapper objectMapper = new ObjectMapper();
        ReflectionTestUtils.setField(this.externalSubmissionListener, "objectMapper", objectMapper);
        formName = mock(Expression.class);
    }


    /**
     * This test case will evaluate ExternalSubmissionListener with a positive case
     * Expectation will be to pass the scenario with submissionId validation
     * @throws IOException
     */
    @Test
    public void notify_with_delegateExecution_with_httpStatus_created_with_success() throws IOException {
        String formUrl = "http://localhost:3001";
        DelegateExecution execution = mock(DelegateExecution.class);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("formio.url"))
                .thenReturn(formUrl);
        String data = "TwoStepApproval";
        ReflectionTestUtils.setField(externalSubmissionListener, "formName", this.formName);
        when(this.formName.getValue(execution))
                .thenReturn(data);
        when(formSubmissionService.getFormIdByName(anyString()))
                .thenReturn("test-id1");
        Map<String, Object> variables = new HashMap<>();
        when(execution.getVariables())
                .thenReturn(variables);
        when(formSubmissionService.createFormSubmissionData(any()))
                .thenReturn("{data:{}}");
        when(formSubmissionService.createSubmission(anyString(), anyString()))
                .thenReturn("id1");
        when(execution.getVariable("formUrl"))
                .thenReturn(formUrl);
        when(execution.getProcessInstanceId())
                .thenReturn("instanceId-1");
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), anyString()))
                .thenReturn(new ResponseEntity<>("{\"id\":\"id1\"}",HttpStatus.CREATED));
        externalSubmissionListener.notify(execution);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(execution, times(2)).setVariable(anyString(), captor.capture());
        assertEquals("id1", captor.getValue());
    }

    /**
     * This test case will evaluate ExternalSubmissionListener with a negative case
     * This test case expect the getformurl to fail with ioexception - positive case
     * Expectation will be to fail the case with Runtimeexception
     * @throws IOException
     */
    @Test
    public void notify_with_delegateExecution_with_getFormUrl_with_IOException() throws IOException {

        String formUrl = "http://localhost:3001";
        DelegateExecution execution = mock(DelegateExecution.class);
        Properties properties = mock(Properties.class);
        when(properties.getProperty("formio.url"))
                .thenReturn(formUrl);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        String data = "TwoStepApproval";
        ReflectionTestUtils.setField(externalSubmissionListener, "formName", this.formName);
        when(this.formName.getValue(execution))
                .thenReturn(data);
        doThrow(new IOException("No form found")).when(formSubmissionService)
                .getFormIdByName(anyString());
        assertThrows(RuntimeException.class, () -> {
            externalSubmissionListener.notify(execution);
        });
    }

    /**
     * This test case will evaluate ExternalSubmissionListener with a negative case
     * This test case expect the httpserviceinvoker to return created - positive case
     * But while parsing the response an exception will be thrown
     * Expectation will be to fail the case with Runtimeexception
     * @throws IOException
     */
    @Test
    public void notify_with_delegateExecution_with_httpStatus_created_with_parsingException() throws IOException {
        String formUrl = "http://localhost:3001";
        DelegateExecution execution = mock(DelegateExecution.class);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("formio.url"))
                .thenReturn(formUrl);
        String data = "TwoStepApproval";
        ReflectionTestUtils.setField(externalSubmissionListener, "formName", this.formName);
        when(this.formName.getValue(execution))
                .thenReturn(data);
        when(formSubmissionService.getFormIdByName(anyString()))
                .thenReturn("test-id1");
        Map<String, Object> variables = new HashMap<>();
        when(execution.getVariables())
                .thenReturn(variables);
        when(formSubmissionService.createFormSubmissionData(any()))
                .thenReturn("{data:{}}");
        when(formSubmissionService.createSubmission(anyString(), anyString()))
                .thenReturn("id1");
        when(execution.getVariable("formUrl"))
                .thenReturn(formUrl);
        when(execution.getProcessInstanceId())
                .thenReturn("instanceId-1");
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), anyString()))
                .thenReturn(new ResponseEntity<>("}",HttpStatus.CREATED));
        assertThrows(RuntimeException.class, () -> {
            externalSubmissionListener.notify(execution);
        });
    }

    /**
     * This test case will evaluate ExternalSubmissionListener with a negative case
     * This test case expect the httpserviceinvoker to return internal error
     * and also it will pass during the retry
     * Expectation will be to pass the scenario with submissionId validation
     * @throws IOException
     */
    @Test
    public void notify_with_delegateExecution_with_httpStatus_error_with_retryOnce_with_success() throws IOException {
        String formUrl = "http://localhost:3001";
        DelegateExecution execution = mock(DelegateExecution.class);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("formio.url"))
                .thenReturn(formUrl);
        String data = "TwoStepApproval";
        ReflectionTestUtils.setField(externalSubmissionListener, "formName", this.formName);
        when(this.formName.getValue(execution))
                .thenReturn(data);
        when(formSubmissionService.getFormIdByName(anyString()))
                .thenReturn("test-id1");
        Map<String, Object> variables = new HashMap<>();
        when(execution.getVariables())
                .thenReturn(variables);
        when(formSubmissionService.createFormSubmissionData(any()))
                .thenReturn("{data:{}}");
        when(formSubmissionService.createSubmission(anyString(), anyString()))
                .thenReturn("id1");
        when(execution.getVariable("formUrl"))
                .thenReturn(formUrl);
        when(execution.getProcessInstanceId())
                .thenReturn("instanceId-1");
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), anyString()))
                .thenReturn(new ResponseEntity<>("{\"id\":\"id1\"}",HttpStatus.INTERNAL_SERVER_ERROR))
                .thenReturn(new ResponseEntity<>("{\"id\":\"id1\"}",HttpStatus.CREATED));
        externalSubmissionListener.notify(execution);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(execution, times(2)).setVariable(anyString(), captor.capture());
        assertEquals("id1", captor.getValue());
    }

    /**
     * This test case will evaluate ExternalSubmissionListener with a negative case
     * This test case expect the httpserviceinvoker to return internal error
     * and also it will continue fail during the retry as well
     * Expectation will be to capture a Runtime exception
     * @throws IOException
     */
    @Test
    public void notify_with_delegateExecution_with_httpStatus_error_with_retryOnce_with_fail() throws IOException {
        String formUrl = "http://localhost:3001";
        DelegateExecution execution = mock(DelegateExecution.class);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("formio.url"))
                .thenReturn(formUrl);
        String data = "TwoStepApproval";
        ReflectionTestUtils.setField(externalSubmissionListener, "formName", this.formName);
        when(this.formName.getValue(execution))
                .thenReturn(data);
        when(formSubmissionService.getFormIdByName(anyString()))
                .thenReturn("test-id1");
        Map<String, Object> variables = new HashMap<>();
        when(execution.getVariables())
                .thenReturn(variables);
        when(formSubmissionService.createFormSubmissionData(any()))
                .thenReturn("{data:{}}");
        when(formSubmissionService.createSubmission(anyString(), anyString()))
                .thenReturn("id1");
        when(execution.getVariable("formUrl"))
                .thenReturn(formUrl);
        when(execution.getProcessInstanceId())
                .thenReturn("instanceId-1");
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), anyString()))
                .thenReturn(new ResponseEntity<>("{\"id\":\"id1\"}",HttpStatus.INTERNAL_SERVER_ERROR))
                .thenReturn(new ResponseEntity<>("{\"id\":\"id1\"}",HttpStatus.INTERNAL_SERVER_ERROR));
        assertThrows(RuntimeException.class, () -> {
            externalSubmissionListener.notify(execution);
        });
    }
}

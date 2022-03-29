package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.ParseException;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.listeners.data.FilterInfo;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.junit.Assert;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
/**
 * Test class for FormBPMFilteredDataPipelineListener
 */
@ExtendWith(SpringExtension.class)
public class FormBPMFilteredDataPipelineListenerTest {

    @InjectMocks
    private FormBPMFilteredDataPipelineListener formBPMFilteredDataPipelineListener;

    @Mock
    private FormSubmissionService formSubmissionService;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    @Test
    public void syncFormVariables_with_delegatetask_and_validapi_withdata_test() throws Exception {

        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);

        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty(anyString()))
                .thenReturn("http://localhost:5000/api");
        when(delegateExecution.getVariable("applicationId"))
                .thenReturn(100);

        String data = "{\"taskVariable\": [{\"key\" : \"businessOwner\", \"value\" : \"john\", \"label\" : \"Business Owner\"}], " +
                "\"processName\": \"onestepapproval\",\"processKey\": \"onestepapproval\"}";
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.ok(data));

        String actualFormUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put("formUrl", actualFormUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("businessOwner", "john");
        when(formSubmissionService.retrieveFormValues(actualFormUrl))
                .thenReturn(dataMap);
        formBPMFilteredDataPipelineListener.notify(delegateTask);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(delegateExecution).setVariable(anyString(), captor.capture());
        assertEquals("john", captor.getValue());
    }

    @Test
    public void syncFormVariables_with_delegateExecution_and_validapi_withdata_test() throws Exception {

        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty(anyString()))
                .thenReturn("http://localhost:5000/api");
        when(delegateExecution.getVariable("applicationId"))
                .thenReturn(100);

        String data = "{\"taskVariable\": [{\"key\" : \"businessOwner\", \"value\" : \"john\", \"label\" : \"Business Owner\"}], " +
                "\"processName\": \"onestepapproval\",\"processKey\": \"onestepapproval\"}";
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.ok(data));

        String actualFormUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put("formUrl", actualFormUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("businessOwner", "john");
        when(formSubmissionService.retrieveFormValues(actualFormUrl))
                .thenReturn(dataMap);
        formBPMFilteredDataPipelineListener.notify(delegateExecution);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(delegateExecution).setVariable(anyString(), captor.capture());
        assertEquals("john", captor.getValue());
    }

    @Test
    public void syncFormVariables_with_validapi_and_emptydata_test() throws Exception {

        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);

        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty(anyString()))
                .thenReturn("http://localhost:5000/api");
        when(delegateExecution.getVariable("applicationId"))
                .thenReturn(100);

        String data = "{\"taskVariable\": [], " +
                "\"processName\": \"onestepapproval\",\"processKey\": \"onestepapproval\"}";
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.ok(data));
        formBPMFilteredDataPipelineListener.notify(delegateTask);
    }

    @Test
    public void syncFormVariables_with_validapi_and_parseexception_test() throws Exception {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);

        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty(anyString()))
                .thenReturn("http://localhost:5000/api");
        when(delegateExecution.getVariable("applicationId"))
                .thenReturn(100);

        String data = "{\"taskVariable\", " +
                "\"processName\": \"onestepapproval\",\"processKey\": \"onestepapproval\"}";
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.ok(data));

        String actualFormUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put("formUrl", actualFormUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("businessOwner", "john");
        when(formSubmissionService.retrieveFormValues(actualFormUrl))
                .thenReturn(dataMap);
        assertThrows(RuntimeException.class, () -> {
            formBPMFilteredDataPipelineListener.notify(delegateTask);
        });
    }

    @Test
    public void syncFormVariables_with_500_api_test() throws Exception {

        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);

        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty(anyString()))
                .thenReturn("http://localhost:5000/api");
        when(delegateExecution.getVariable("applicationId"))
                .thenReturn(100);

        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(""));

        assertThrows(RuntimeException.class, () -> {
            formBPMFilteredDataPipelineListener.notify(delegateTask);
        });
    }
}

package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.listeners.data.FilterInfo;
import org.camunda.bpm.extension.hooks.listeners.data.FormProcessMappingData;
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

import java.lang.reflect.Field;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.APPLICATION_ID;

/**
 * FormBPM FilteredData Pipeline Listener Test.
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

    @BeforeEach
    public void setup() {
        try {
            Field field = formSubmissionService.getClass().getDeclaredField("bpmObjectMapper");
            field.setAccessible(true);
            field = formBPMFilteredDataPipelineListener.getClass().getDeclaredField("bpmObjectMapper");
            field.setAccessible(true);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
        ObjectMapper objectMapper = new ObjectMapper();

        ReflectionTestUtils.setField(this.formSubmissionService, "bpmObjectMapper", objectMapper);
        ReflectionTestUtils.setField(this.formBPMFilteredDataPipelineListener, "bpmObjectMapper", objectMapper);
    }

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
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(100);

        FormProcessMappingData formProcessMappingData = new FormProcessMappingData();
        formProcessMappingData.setProcessKey("onestepapproval");
        formProcessMappingData.setProcessKey("onestepapproval");
        formProcessMappingData.setTaskVariable("[{\"key\" : \"businessOwner\", \"defaultLabel\" : \"Business Owner\", \"label\" : \"Business Owner\"}]");
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any(), any()))
                .thenReturn(ResponseEntity.ok(formProcessMappingData));

        String actualFormUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, actualFormUrl);
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
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(100);

        FormProcessMappingData formProcessMappingData = new FormProcessMappingData();
        formProcessMappingData.setProcessKey("onestepapproval");
        formProcessMappingData.setProcessKey("onestepapproval");
        formProcessMappingData.setTaskVariable("[{\"key\" : \"businessOwner\", \"defaultLabel\" : \"Business Owner\", \"label\" : \"Business Owner\"}]");
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any(), any()))
                .thenReturn(ResponseEntity.ok(formProcessMappingData));

        String actualFormUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, actualFormUrl);
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
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(100);

        FormProcessMappingData formProcessMappingData = new FormProcessMappingData();
        formProcessMappingData.setProcessKey("onestepapproval");
        formProcessMappingData.setProcessKey("onestepapproval");
        formProcessMappingData.setTaskVariable("[{\"key\" : \"businessOwner\", \"value\" : \"john\", \"label\" : \"Business Owner\"}]");
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any(), any()))
                .thenReturn(ResponseEntity.ok(formProcessMappingData));
        formBPMFilteredDataPipelineListener.notify(delegateTask);
    }

    @Test
    public void syncFormVariables_with_delegateexecution_and_500_api_test() throws Exception {

        DelegateExecution delegateExecution = mock(DelegateExecution.class);

        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty(anyString()))
                .thenReturn("http://localhost:5000/api");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(100);

        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(""));

        assertThrows(RuntimeException.class, () -> {
            formBPMFilteredDataPipelineListener.notify(delegateExecution);
        });
    }

    @Test
    public void syncFormVariables_with_delegatetask_and_500_api_test() throws Exception {

        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);

        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty(anyString()))
                .thenReturn("http://localhost:5000/api");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(100);

        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(""));

        assertThrows(RuntimeException.class, () -> {
            formBPMFilteredDataPipelineListener.notify(delegateTask);
        });
    }
}

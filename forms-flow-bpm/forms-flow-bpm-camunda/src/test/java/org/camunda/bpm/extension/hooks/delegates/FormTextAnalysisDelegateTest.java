package org.camunda.bpm.extension.hooks.delegates;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.delegates.data.TextSentimentData;
import org.camunda.bpm.extension.hooks.delegates.data.TextSentimentRequest;
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

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Form Text Analysis Delegate Test.
 * Test class for FormTextAnalysisDelegate.
 */

@ExtendWith(SpringExtension.class)
public class FormTextAnalysisDelegateTest {

    @InjectMocks
    private FormTextAnalysisDelegate formTextAnalysisDelegate;

    @Mock
    private FormSubmissionService formSubmissionService;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    @Mock
    private Properties integrationCredentialProperties;

    @Mock
    private DelegateExecution execution;

    @BeforeEach
    public void setup() {
        try {
            Field field = formTextAnalysisDelegate.getClass().getDeclaredField("bpmObjectMapper");
            field.setAccessible(true);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
        ObjectMapper objectMapper = new ObjectMapper();
        ReflectionTestUtils.setField(this.formTextAnalysisDelegate, "bpmObjectMapper", objectMapper);
    }

    /**
     * This test case perform a positive test over execute method in FormTextAnalysisDelegate
     * CustomSubmission is not Enabled
     */
    @Test
    public void formTextAnalysisDelegate_without_customSubmissionEnabled_happyFlow() throws Exception {
        Map<String, Object> variable = new HashMap<>();
        variable.put("formUrl", "http://localhost:3001/submission/id1");
        variable.put("applicationId", 123);
        when(execution.getVariables())
                .thenReturn(variable);
        when(execution.getVariable("formUrl"))
                .thenReturn(variable.get("formUrl"));
        when(execution.getVariable("applicationId"))
                .thenReturn(variable.get("applicationId"));
        when(formSubmissionService.readSubmission(anyString()))
                .thenReturn("{\"data\":{\"formId\":\"123\",\"formName\":\"New Business Licence\"," +
                        "\"description\":{\"type\":\"textAreaWithAnalytics\",\"topics\":[\"t1\",\"t2\"],\"text\":\"test\", \"overallSentiment\":\"positive\"}}}");
        List<TextSentimentData> txtRecords = new ArrayList<>();
        txtRecords.add(new TextSentimentData("description",
                new ArrayList<>(Arrays.asList("t1", "t2")), "test", "positive"));
        TextSentimentRequest textSentimentRequest = new TextSentimentRequest(123, "http://localhost:3001/submission/id1", txtRecords);

        ArgumentCaptor<TextSentimentRequest> captor = ArgumentCaptor.forClass(TextSentimentRequest.class);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.OK);
        when(httpServiceInvoker.getProperties())
                .thenReturn(integrationCredentialProperties);
        when(integrationCredentialProperties.getProperty("analysis.url"))
                .thenReturn("http://localhost:5001");
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(), any())).thenReturn(ResponseEntity.ok(textSentimentRequest));
        when(integrationCredentialProperties.getProperty("forms.enableCustomSubmission"))
                .thenReturn("false");
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(List.class))).thenReturn(new ResponseEntity<>(HttpStatus.OK));
        formTextAnalysisDelegate.execute(execution);
    }

    /**
     * This test case perform a positive test over execute method in FormTextAnalysisDelegate
     * CustomSubmission is Enabled
     */
    @Test
    public void formTextAnalysisDelegate_with_customSubmissionEnabled_happyFlow() throws Exception {
        Map<String, Object> variable = new HashMap<>();
        variable.put("formUrl", "http://localhost:3001/submission/id1");
        variable.put("applicationId", 123);
        when(execution.getVariables())
                .thenReturn(variable);
        when(execution.getVariable("formUrl"))
                .thenReturn(variable.get("formUrl"));
        when(execution.getVariable("applicationId"))
                .thenReturn(variable.get("applicationId"));
        when(formSubmissionService.readSubmission(anyString()))
                .thenReturn("{\"data\":{\"formId\":\"123\",\"formName\":\"New Business Licence\"," +
                        "\"description\":{\"type\":\"textAreaWithAnalytics\",\"topics\":[\"t1\",\"t2\"],\"text\":\"test\", \"overallSentiment\":\"positive\"}}}");
        List<TextSentimentData> txtRecords = new ArrayList<>();
        txtRecords.add(new TextSentimentData("description",
                new ArrayList<>(Arrays.asList("t1", "t2")), "test", "positive"));
        TextSentimentRequest textSentimentRequest = new TextSentimentRequest(123, "http://localhost:3001/submission/id1", txtRecords);

        ArgumentCaptor<TextSentimentRequest> captor = ArgumentCaptor.forClass(TextSentimentRequest.class);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.OK);
        when(httpServiceInvoker.getProperties())
                .thenReturn(integrationCredentialProperties);
        when(integrationCredentialProperties.getProperty("analysis.url"))
                .thenReturn("http://localhost:5001");
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(), any())).thenReturn(ResponseEntity.ok(textSentimentRequest));
        when(integrationCredentialProperties.getProperty("forms.enableCustomSubmission"))
                .thenReturn("true");
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(Map.class))).thenReturn(new ResponseEntity<>(HttpStatus.OK));
        formTextAnalysisDelegate.execute(execution);
    }

    /**
     * This test case perform a test over execute method with empty submission data
     */
    @Test
    public void formTextAnalysisDelegate_with_emptySubmissionData() throws Exception {
        Map<String, Object> variable = new HashMap<>();
        variable.put("formUrl", "http://localhost:3001/submission/id1");
        variable.put("applicationId", 123);
        when(execution.getVariables())
                .thenReturn(variable);
        when(execution.getVariable("formUrl"))
                .thenReturn(variable.get("formUrl"));
        when(execution.getVariable("applicationId"))
                .thenReturn(variable.get("applicationId"));
        when(formSubmissionService.readSubmission(anyString()))
                .thenReturn("{}");
        formTextAnalysisDelegate.execute(execution);
        verify(httpServiceInvoker, times(0)).execute(anyString(), any(HttpMethod.class), any(TextSentimentRequest.class));
    }

    /**
     * This test case perform a test over execute method with Internal Server Error
     * This will handle the runtime Exception
     */
    @Test
    public void formTextAnalysisDelegate_with_500_api_test() throws Exception {
        Map<String, Object> variable = new HashMap<>();
        variable.put("formUrl", "http://localhost:3001/submission/id1");
        variable.put("applicationId", 123);
        when(execution.getVariables())
                .thenReturn(variable);
        when(execution.getVariable("formUrl"))
                .thenReturn(variable.get("formUrl"));
        when(execution.getVariable("applicationId"))
                .thenReturn(variable.get("applicationId"));

        when(formSubmissionService.readSubmission(anyString()))
                .thenReturn("{\"data\":{\"formId\":\"123\",\"formName\":\"New Business Licence\"," +
                        "\"description\":{\"type\":\"textAreaWithAnalytics\",\"topics\":[\"t1\",\"t2\"],\"text\":\"test\", \"overallSentiment\":\"positive\"}}}");
        List<TextSentimentData> txtRecords = new ArrayList<>();
        txtRecords.add(new TextSentimentData("description",
                new ArrayList<>(Arrays.asList("t1", "t2")), "test", "positive"));
        TextSentimentRequest textSentimentRequest = new TextSentimentRequest(123, "http://localhost:3001/submission/id1", txtRecords);
        ArgumentCaptor<TextSentimentRequest> captor = ArgumentCaptor.forClass(TextSentimentRequest.class);

        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.OK);
        when(httpServiceInvoker.getProperties())
                .thenReturn(integrationCredentialProperties);
        when(integrationCredentialProperties.getProperty("analysis.url"))
                .thenReturn("http://localhost:5001");
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(), any())).thenReturn(ResponseEntity.internalServerError().build());
        assertThrows(RuntimeException.class, () -> {
            formTextAnalysisDelegate.execute(execution);
        });
    }

    /**
     * This test case perform a test over execute method in FormTextAnalysisDelegate with null submission data
     * This will handle the runtime Exception
     */
    @Test
    public void formTextAnalysisDelegate_with_nullSubmissionData() throws Exception {
        Map<String, Object> variable = new HashMap<>();
        variable.put("formUrl", "http://localhost:3001/submission/id1");
        variable.put("applicationId", 123);
        when(execution.getVariables())
                .thenReturn(variable);
        when(execution.getVariable("formUrl"))
                .thenReturn(variable.get("formUrl"));
        when(execution.getVariable("applicationId"))
                .thenReturn(variable.get("applicationId"));
        when(formSubmissionService.readSubmission(anyString()))
                .thenReturn(null);
        assertThrows(RuntimeException.class, () -> {
            formTextAnalysisDelegate.execute(execution);
        });
    }
}
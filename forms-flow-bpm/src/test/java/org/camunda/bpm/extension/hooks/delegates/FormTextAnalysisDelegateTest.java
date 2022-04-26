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
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Field;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test class for FormTextAnalysisDelegate
 */
@ExtendWith(SpringExtension.class)
public class FormTextAnalysisDelegateTest {

    @InjectMocks
    private FormTextAnalysisDelegate formTextAnalysisDelegate;

    @Mock
    private FormSubmissionService formSubmissionService;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    @BeforeEach
    public void setup() {
        try {
            Field field = formTextAnalysisDelegate.getClass().getDeclaredField("objectMapper");
            field.setAccessible(true);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
        ObjectMapper objectMapper = new ObjectMapper();
        ReflectionTestUtils.setField(this.formTextAnalysisDelegate, "objectMapper", objectMapper);
    }

    /**
     * This test case perform a positive test over execute method in FormTextAnalysisDelegate
     * This will verify the textSentimentRequest
     */
    @Test
    public void formTextAnalysisDelegate_happyFlow() throws Exception {
        DelegateExecution execution = mock(DelegateExecution.class);
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
                        "\"description\":{\"type\":\"textAreaWithAnalytics\",\"topics\":[\"t1\",\"t2\"],\"text\":\"test\"}}}");
        List<TextSentimentData> txtRecords = new ArrayList<>();
        txtRecords.add(formTextAnalysisDelegate.CreateTextSentimentData("description",
                new ArrayList<>(Arrays.asList("t1","t2")), "test"));
        TextSentimentRequest textSentimentRequest = new TextSentimentRequest(123, "http://localhost:3001/submission/id1",txtRecords);
        ArgumentCaptor<TextSentimentRequest> captor = ArgumentCaptor.forClass(TextSentimentRequest.class);

        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn("http://localhost:5001");
        formTextAnalysisDelegate.execute(execution);
        verify(httpServiceInvoker).execute(anyString(), any(HttpMethod.class),captor.capture());
        assertEquals(textSentimentRequest, captor.getValue());
    }

    /**
     * This test case perform a positive test over execute method in FormTextAnalysisDelegate
     * This will handle the runtime Exception
     */
    @Test
    public void formTextAnalysisDelegate_with_nullSubmissionData() throws Exception {
        DelegateExecution execution = mock(DelegateExecution.class);
        Map<String, Object> variable = new HashMap<>();
        variable.put("formUrl", "http://localhost:3001/submission/id1");
        when(execution.getVariables())
                .thenReturn(variable);
        when(formSubmissionService.readSubmission(anyString()))
                .thenReturn("");
        assertThrows(RuntimeException.class, () -> {
            formTextAnalysisDelegate.execute(execution);
        });
    }

    /**
     * This test case perform a test over execute method with empty submission data
     * This will verify the TextSentimentRequest
     */
    @Test
    public void formTextAnalysisDelegate_with_emptySubmissionData() throws Exception {
        DelegateExecution execution = mock(DelegateExecution.class);
        Map<String, Object> variable = new HashMap<>();
        variable.put("formUrl", "http://localhost:3001/submission/id1");
        when(execution.getVariables())
                .thenReturn(variable);
        when(formSubmissionService.readSubmission(anyString()))
                .thenReturn("{}");
        formTextAnalysisDelegate.execute(execution);
        verify(httpServiceInvoker, times(0)).execute(anyString(), any(HttpMethod.class),any(TextSentimentRequest.class));
    }
}

package org.camunda.bpm.extension.hooks.services;

import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Test class for FormSubmissionService
 */
@ExtendWith(SpringExtension.class)
public class FormSubmissionServiceTest {

    @InjectMocks
    private FormSubmissionService formSubmissionService;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    private static final String formUrl = "http://localhost:3001/form/615d4097163a6c58ae2e7668/submission";

    /**
     * This test case perform a positive test over read submission method
     * This will validate the response
     */
    @Test
    public void readSubmission_happyFlow(){
        String expected = "{data:{}}";
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>(expected, HttpStatus.OK));
        String actual = formSubmissionService.readSubmission(formUrl);
        assertEquals(expected, actual);
    }
    
    /**
     * This test case perform a negative test over read submission method
     * Expecting a runtime Exception
     */
    @Test
    public void readSubmission_with_status_notOK(){
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR));
        assertThrows(RuntimeException.class, () -> {
            formSubmissionService.readSubmission(formUrl);
        });
    }
    
    /**
     * This test case perform a positive test over createRevision method
     * This will validate the response
     */
    @Test
    public void createRevision_happyFlow() throws IOException {
        String expected = "ID1";
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>("{}", HttpStatus.OK))
                .thenReturn(new ResponseEntity<>("{\"_id\":\"ID1\"}", HttpStatus.CREATED));
        String actual = formSubmissionService.createRevision(formUrl);
        assertEquals(expected, actual);
    }
    
    /**
     * This test case perform a negative test over createRevision method
     * This will validate the behavior with null inputs
     */
    @Test
    public void createRevision_with_emptySubmissionData() throws IOException {
        String expected = null;
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>("", HttpStatus.OK));
        String actual = formSubmissionService.createRevision(formUrl);
        assertEquals(expected, actual);
    }

    /**
     * This test case perform a negative test over createRevision method
     * Expecting a runtime Exception
     */
    @Test
    public void createRevision_with_intenalServerError() {
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>("{}", HttpStatus.OK))
                .thenReturn(new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR));
        assertThrows(RuntimeException.class, () -> {
            formSubmissionService.createRevision(formUrl);
        });
    }

    /**
     * This test case perform a positive test over createSubmission method
     * This will validate the response
     */
    @Test
    public void createSubmission_happyFlow() throws IOException {
        String expected = "ID1";
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>("{\"_id\":\"ID1\"}", HttpStatus.CREATED));
        String actual = formSubmissionService.createSubmission(formUrl, "{}");
        assertEquals(expected, actual);
    }
    
    /**
     * This test case perform a negative test over createSubmission method
     * This will validate the response
     */
    @Test
    public void createSubmission_with_internalError() {
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>("{\"_id\":\"ID1\"}", HttpStatus.INTERNAL_SERVER_ERROR));
        assertThrows(RuntimeException.class, () -> {
            formSubmissionService.createSubmission(formUrl, "{}");
        });
    }
    
    /**
     * This test case perform a positive test over getFormIdByName method
     * This will validate the formId
     */
    @Test
    public void getFormIdByName_happyFlow() throws IOException {
        String expected = "ID1";
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>("{\"_id\":\"ID1\"}", HttpStatus.OK));
        String actual = formSubmissionService.getFormIdByName(formUrl);
        assertEquals(expected, actual);
    }
    
    /**
     * This test case perform a negative test over getFormIdByName method
     * This will validate the behavior with null input
     */
    @Test
    public void getFormIdByName_with_intenalServerError() {
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR));
        assertThrows(RuntimeException.class, () -> {
            formSubmissionService.getFormIdByName(formUrl);
        });
    }

    /**
     * This test case perform a positive test over retrieveFormValues method
     * This will validate the formValues
     */
    @Test
    public void retrieveFormValues_happyFlow_withOnlyFile() throws IOException {
        Map<String,Object> expected = new HashMap();
        expected.put("test-filetest_file", Variables.fileValue("test-file.csv")
                .file(new byte[]{})
                .mimeType("csv")
                .create());
        expected.put("test_file_uploadname","test-file.csv");
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>("{\"data\":{\"test_file\":[{" +
                        "\"url\":\"https://test-site/test-file.csv\",\"originalName\":\"test-file.csv\"," +
                        "\"type\":\"csv\"}]}}", HttpStatus.OK));
        Map<String,Object> actual = formSubmissionService.retrieveFormValues(formUrl);
        assertEquals(expected.get("test_file_uploadname"), actual.get("test_file_uploadname"));
    }

    /**
     * This test case perform a positive test over retrieveFormValues method
     * This will validate the response
     */
    @Test
    public void retrieveFormValues_happyFlow_withoutFile() throws IOException {
        Map<String,Object> expected = new HashMap();
        expected.put("url", "https://test-site/test-file.csv");
        expected.put("originalName", "test-file.csv");
        expected.put("type", "csv");
        expected.put("details", null);
        expected.put("isAvailable", true);
        expected.put("count", 123);
        expected.put("countInDouble", 123.343434343);
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any()))
                .thenReturn(new ResponseEntity<>("{\"data\":{" +
                        "\"url\":\"https://test-site/test-file.csv\",\"originalName\":\"test-file.csv\"," +
                        "\"type\":\"csv\",\"details\":null,\"isAvailable\":true,\"count\":123,\"countInDouble\":123.343434343}}", HttpStatus.OK));
        Map<String,Object> actual = formSubmissionService.retrieveFormValues(formUrl);
        assertEquals(expected, actual);
    }

    /**
     * This test case perform a positive test over createFormSubmissionData method
     * This will validate the submission data
     */
    @Test
    public void createFormSubmissionData_happyFlow() throws IOException {
        Map<String,Object> bpmVariables = new HashMap<>();
        String expected = "{\"data\":{\"applicationStatus\":\"New\"}}";
        bpmVariables.put("applicationStatus", "New");
        String actual = formSubmissionService.createFormSubmissionData(bpmVariables);
        assertEquals(expected, actual);
    }
}

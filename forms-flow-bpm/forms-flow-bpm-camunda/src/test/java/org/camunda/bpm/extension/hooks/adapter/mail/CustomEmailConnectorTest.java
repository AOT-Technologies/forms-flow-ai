package org.camunda.bpm.extension.hooks.adapter.mail;

import org.camunda.bpm.extension.hooks.adapter.mail.request.ConnectorRequest;
import org.formsflow.ai.bpm.mail.model.dto.FormsFlowBPMEmailRequestDto;
import org.formsflow.ai.bpm.mail.service.FormsFlowBPMEmailAdapterService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import javax.mail.MessagingException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * CustomEmailConnector Test.
 * Test class for CustomEmailConnector
 */
@ExtendWith(SpringExtension.class)
public class CustomEmailConnectorTest {

    @InjectMocks
    private CustomEmailConnector customEmailConnector;

    @Mock
    private ConnectorRequest connectorRequest;

    @Mock
    private FormsFlowBPMEmailAdapterService formsFlowBPMEmailAdapterService;

    /**
     * Custom Email Connector will be invoked
     * and success
     */
    @Test
    public void invokeCustomEmailConnector_with_success() throws IOException, MessagingException {
        String toAddress = "user.formsflowai@test.com";
        String subject = "Test Email";
        String text = "Hi, This is a message from formsflow.ai";
        Map<String, Object> variables = new HashMap<>();
        variables.put("to", toAddress);
        variables.put("subject", subject);
        variables.put("text", text);
        Mockito.when(connectorRequest.getRequestParameters()).thenReturn(variables);
        Mockito.when(connectorRequest.getText()).thenReturn(text);
        Mockito.when(connectorRequest.getTo()).thenReturn(toAddress);
        Mockito.when(connectorRequest.getSubject()).thenReturn(subject);
        customEmailConnector.execute(connectorRequest);
        ArgumentCaptor<FormsFlowBPMEmailRequestDto> captor = ArgumentCaptor.forClass(FormsFlowBPMEmailRequestDto.class);
        verify(formsFlowBPMEmailAdapterService, times(1)).sendMail(captor.capture());
        assertEquals("Test Email", captor.getValue().getSubject());
    }
}
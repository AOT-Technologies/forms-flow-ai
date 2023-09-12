package org.camunda.bpm.extension.hooks.adapter.mail;

import org.camunda.bpm.extension.hooks.adapter.mail.request.ConnectorRequest;
import org.camunda.bpm.extension.hooks.adapter.response.EmptyResponse;
import org.camunda.bpm.extension.mail.MailConnectorException;
import org.camunda.connect.impl.AbstractConnector;
import org.camunda.connect.spi.ConnectorResponse;
import org.formsflow.ai.bpm.mail.model.dto.FormsFlowBPMEmailRequestDto;
import org.formsflow.ai.bpm.mail.service.FormsFlowBPMEmailAdapterService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.logging.Logger;


public class CustomEmailConnector extends AbstractConnector<ConnectorRequest, EmptyResponse> {

    public static final String CONNECTOR_ID = "camunda-email-connector";
    private final Logger LOGGER = Logger.getLogger(CustomEmailConnector.class.getName());

    @Autowired
    private FormsFlowBPMEmailAdapterService customEmailAdapterService;

    @Autowired
    private FormsFlowBPMEmailRequestDto emailRequestDto;

    public CustomEmailConnector() {
        super(CONNECTOR_ID);
    }

    /**
     * Create a request on the connector.
     *
     * @return the connector-specific request object.
     */
    @Override
    public ConnectorRequest createRequest() {
        return new ConnectorRequest(this);
    }

    /**
     * Execute the request on the connector.
     *
     * @param request the request
     * @return the result.
     */
    @Override
    public ConnectorResponse execute(ConnectorRequest request) {
        try {
            var sendMailCommand = createRequestCommand(request);
            customEmailAdapterService.sendMail(sendMailCommand);

        } catch (Exception e) {
            throw new MailConnectorException("Failed to send mail: " + e.getMessage(), e);
        }

        return new EmptyResponse();
    }

    public FormsFlowBPMEmailRequestDto createRequestCommand(ConnectorRequest request) {
        final String to = request.getTo();
        final String cc = request.getCc();
        final String subject = request.getSubject();
        final String text = request.getText();
        final List<String> attachments = request.getFileNames();
        return new FormsFlowBPMEmailRequestDto(
                to,
                cc,
                subject,
                text,
                attachments
        );
    }
}
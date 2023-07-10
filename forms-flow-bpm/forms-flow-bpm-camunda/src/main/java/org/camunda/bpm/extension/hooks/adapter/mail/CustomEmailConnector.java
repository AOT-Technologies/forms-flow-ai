package org.camunda.bpm.extension.hooks.adapter.mail;

import org.camunda.bpm.extension.hooks.adapter.mail.request.SendMailRequest;
import org.camunda.bpm.extension.hooks.adapter.mail.response.EmptyResponse;
import org.camunda.bpm.extension.mail.MailConnectorException;
import org.camunda.connect.impl.AbstractConnector;
import org.camunda.connect.spi.ConnectorResponse;
import org.formsflow.ai.bpm.mail.service.CustomEmailAdapterService;
import org.springframework.beans.factory.annotation.Autowired;


public class CustomEmailConnector extends AbstractConnector<SendMailRequest, EmptyResponse> {

    public static final String CONNECTOR_ID = "custom-email-send";

    @Autowired
    private CustomEmailAdapterService customEmailAdapterService;

    public CustomEmailConnector( ) {
        super(CONNECTOR_ID);
    }

    /**
     * Create a request on the connector.
     *
     * @return the connector-specific request object.
     */
    @Override
    public SendMailRequest createRequest() {
        return new SendMailRequest(this);
    }

    /**
     * Execute the request on the connector.
     *
     * @param request the request
     * @return the result.
     */
    @Override
    public ConnectorResponse execute(SendMailRequest request) {
        try {
          //  var sendMailCommand = CustomEmailCommand.create(request);
            var sendEmailRequest = request.getEmailDto();
            customEmailAdapterService.sendMail(sendEmailRequest);

        } catch (Exception e) {
            throw new MailConnectorException("Failed to send mail: " + e.getMessage(), e);
        }

        return new EmptyResponse();
    }
}


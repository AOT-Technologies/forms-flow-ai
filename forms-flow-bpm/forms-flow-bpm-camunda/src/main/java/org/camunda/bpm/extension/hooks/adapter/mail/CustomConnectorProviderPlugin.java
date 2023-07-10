package org.camunda.bpm.extension.hooks.adapter.mail;

import org.camunda.connect.spi.Connector;
import org.camunda.connect.spi.ConnectorProvider;
import org.springframework.stereotype.Component;

@Component
public class CustomConnectorProviderPlugin implements ConnectorProvider {
    @Override
    public String getConnectorId() {
        return CustomEmailConnector.CONNECTOR_ID;
    }

    /**
     * Create a new instance of the connector created by this factory.
     */
    @Override
    public Connector<?> createConnectorInstance() {
        return new CustomEmailConnector();
    }

}
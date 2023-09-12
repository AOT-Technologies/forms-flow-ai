package org.camunda.bpm.extension.hooks.adapter.mail;

import org.camunda.bpm.engine.impl.cfg.AbstractProcessEnginePlugin;
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.camunda.bpm.engine.impl.cfg.ProcessEnginePlugin;
import org.camunda.connect.Connectors;

import java.util.logging.Logger;

public class CustomEmailConnectorPlugin extends AbstractProcessEnginePlugin {

    private final Logger LOGGER = Logger.getLogger(CustomEmailConnectorPlugin.class.getName());

    @Override
    public void preInit(ProcessEngineConfigurationImpl processEngineConfiguration) {
        LOGGER.info("Custom Connector Initiated");
        LOGGER.info(Connectors.getAvailableConnectors().toString());
        processEngineConfiguration.getProcessEnginePlugins().add((ProcessEnginePlugin) new CustomConnectorProviderPlugin());
    }

}
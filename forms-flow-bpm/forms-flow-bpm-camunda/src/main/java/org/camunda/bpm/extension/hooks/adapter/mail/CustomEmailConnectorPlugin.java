package org.camunda.bpm.extension.hooks.adapter.mail;

import org.camunda.bpm.engine.impl.cfg.AbstractProcessEnginePlugin;
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.camunda.bpm.engine.impl.cfg.ProcessEnginePlugin;
import org.camunda.connect.Connectors;

public class CustomEmailConnectorPlugin extends AbstractProcessEnginePlugin {

    @Override
    public void preInit(ProcessEngineConfigurationImpl processEngineConfiguration) {
        System.out.println("Initiated");
        System.out.println(Connectors.getAvailableConnectors().toString());
        processEngineConfiguration.getProcessEnginePlugins().add((ProcessEnginePlugin) new CustomConnectorProviderPlugin());
    }

}







package org.camunda.bpm.extension.commons.config;


import org.camunda.bpm.engine.rest.impl.CamundaRestResources;
import org.camunda.bpm.engine.rest.impl.DefaultProcessEngineRestServiceImpl;
import org.camunda.bpm.extension.hooks.rest.impl.FormsFlowProcessEngineRestServiceImpl;
import org.camunda.bpm.spring.boot.starter.rest.CamundaJerseyResourceConfig;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.springframework.stereotype.Component;

import javax.ws.rs.ApplicationPath;

/**
 * Extension to camunda Jersey resources
 */
@Component
@ApplicationPath("/engine-rest-ext")
public class FormsFlowJerseyResourceConfig extends CamundaJerseyResourceConfig {


    protected void registerCamundaRestResources() {
        //Removing so that it won't conflict with the FormsFlowProcessEngineRestServiceImpl extended resources
        CamundaRestResources.getResourceClasses().remove(DefaultProcessEngineRestServiceImpl.class);
        this.registerClasses(CamundaRestResources.getResourceClasses());
        this.registerClasses(CamundaRestResources.getConfigurationClasses());
        this.register(JacksonFeature.class);
    }

    @Override
    public void registerAdditionalResources(){
        this.register(FormsFlowProcessEngineRestServiceImpl.class);
    }
}
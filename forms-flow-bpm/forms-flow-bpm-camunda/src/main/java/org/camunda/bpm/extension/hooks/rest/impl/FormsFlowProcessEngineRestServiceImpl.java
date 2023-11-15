package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.impl.DefaultProcessEngineRestServiceImpl;
import org.camunda.bpm.extension.commons.config.ServiceFinder;
import org.springframework.beans.factory.annotation.Autowired;

import javax.ws.rs.Path;

@Path("")
public class FormsFlowProcessEngineRestServiceImpl extends DefaultProcessEngineRestServiceImpl {

    @Autowired
    private ServiceFinder serviceFinder;

    @Path("/v1")
    public FormsFlowV1RestServiceImpl getFormsFlowV1RestService() {
        return new FormsFlowV1RestServiceImpl(this, serviceFinder);
    }
}

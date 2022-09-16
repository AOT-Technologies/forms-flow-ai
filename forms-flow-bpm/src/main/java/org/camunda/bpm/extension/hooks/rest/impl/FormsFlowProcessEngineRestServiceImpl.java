package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.FetchAndLockRestService;
import org.camunda.bpm.engine.rest.impl.DefaultProcessEngineRestServiceImpl;
import org.camunda.bpm.engine.rest.impl.FetchAndLockRestServiceImpl;
import org.camunda.bpm.extension.commons.config.ServiceFinder;
import org.springframework.beans.factory.annotation.Autowired;

import javax.ws.rs.Path;

@Path("")
public class FormsFlowProcessEngineRestServiceImpl extends DefaultProcessEngineRestServiceImpl {

    @Autowired
    private ServiceFinder serviceFinder;

    @Path("/external-task/fetchAndLock")
    public FetchAndLockRestService fetchAndLock() {
        String rootResourcePath = super.getRelativeEngineUri((String) null).toASCIIString();
        FetchAndLockRestServiceImpl subResource = new FetchAndLockRestServiceImpl((String) null, super.getObjectMapper());
        subResource.setRelativeRootResourceUri(rootResourcePath);
        return subResource;
    }

    @Path("/v1")
    public FormsFlowV1RestServiceImpl getFormsFlowV1RestService() {
        return new FormsFlowV1RestServiceImpl(this, serviceFinder);
    }
}

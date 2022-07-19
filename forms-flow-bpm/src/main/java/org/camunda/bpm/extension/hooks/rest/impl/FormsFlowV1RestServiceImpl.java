package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.impl.DefaultProcessEngineRestServiceImpl;
import org.camunda.bpm.extension.commons.config.ServiceFinder;
import org.camunda.bpm.extension.hooks.rest.*;

import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Produces(MediaType.APPLICATION_JSON)
public class FormsFlowV1RestServiceImpl {

    private final DefaultProcessEngineRestServiceImpl processEngineService;
    private final ServiceFinder serviceFinder;

    public FormsFlowV1RestServiceImpl(DefaultProcessEngineRestServiceImpl processEngineService, ServiceFinder serviceFinder){
        this.processEngineService = processEngineService;
        this.serviceFinder = serviceFinder;
    }

    @Path(ProcessDefinitionRestResource.PATH)
    public ProcessDefinitionRestResource getProcessDefinitionResource(){
        return new ProcessDefinitionRestResourceImpl(processEngineService.getProcessDefinitionService());
    }

    @Path(ProcessInstanceRestResource.PATH)
    public ProcessInstanceRestResource getProcessInstanceResource(){
        return new ProcessInstanceRestResourceImpl(processEngineService.getProcessInstanceService());
    }

    @Path(UserRestResource.PATH)
    public UserRestResource getUserResource(){
        return new UserRestResourceImpl(processEngineService.getUserRestService());
    }

    @Path(TaskRestResource.PATH)
    public TaskRestResource getTaskResource(){
        return new TaskRestResourceImpl(processEngineService.getTaskRestService());
    }

    @Path(AdminRestResource.PATH)
    public AdminRestResource getAdminResource(){
        return new AdminRestResourceImpl(serviceFinder.getAdminRestService());
    }
}

package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.ProcessInstanceRestService;
import org.camunda.bpm.extension.hooks.rest.ProcessInstanceRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.EntityModel;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public class ProcessInstanceRestResourceImpl implements ProcessInstanceRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProcessInstanceRestResourceImpl.class);

    private final ProcessInstanceRestService restService;

    public ProcessInstanceRestResourceImpl(ProcessInstanceRestService processInstanceRestService) {
        this.restService = processInstanceRestService;
    }

    @Override
    public EntityModel<org.camunda.bpm.engine.rest.dto.runtime.ActivityInstanceDto> getActivityInstanceTree(String id) {

        org.camunda.bpm.engine.rest.dto.runtime.ActivityInstanceDto responseEntity = restService.getProcessInstance(id).getActivityInstanceTree();
        return EntityModel.of(responseEntity,
                linkTo(methodOn(ProcessInstanceRestResourceImpl.class).getActivityInstanceTree(id)).withSelfRel());
    }
}

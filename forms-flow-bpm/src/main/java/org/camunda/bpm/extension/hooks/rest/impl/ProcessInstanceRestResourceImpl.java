package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.extension.hooks.rest.ProcessDefinitionRestResource;
import org.camunda.bpm.extension.hooks.rest.ProcessInstanceRestResource;
import org.camunda.bpm.extension.hooks.rest.RestResource;
import org.camunda.bpm.extension.hooks.rest.dto.ActivityInstanceDto;
import org.camunda.bpm.extension.hooks.rest.service.ProcessInstanceRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+ ProcessInstanceRestResource.PATH)
public class ProcessInstanceRestResourceImpl  implements ProcessInstanceRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProcessInstanceRestResourceImpl.class);

    private final ProcessInstanceRestService restService;

    public ProcessInstanceRestResourceImpl(ProcessInstanceRestService processInstanceRestService){
        this.restService = processInstanceRestService;
    }

    @Override
    public EntityModel<ActivityInstanceDto> getActivityInstanceTree(String id) {

        ResponseEntity<ActivityInstanceDto> responseEntity = restService.getActivityInstanceTree(id);
        return EntityModel.of(responseEntity.getBody(),
                linkTo(methodOn(ProcessInstanceRestResourceImpl.class).getActivityInstanceTree(id)).withSelfRel());
    }
}

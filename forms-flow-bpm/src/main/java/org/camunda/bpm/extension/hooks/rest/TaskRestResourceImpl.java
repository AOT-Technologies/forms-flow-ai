package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.CountResultDto;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.ws.rs.core.UriInfo;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+TaskRestResource.PATH)
public class TaskRestResourceImpl implements TaskRestResource{

    @Override
    public CountResultDto getTasksCount(UriInfo uriInfo) {
        return null;
    }
}

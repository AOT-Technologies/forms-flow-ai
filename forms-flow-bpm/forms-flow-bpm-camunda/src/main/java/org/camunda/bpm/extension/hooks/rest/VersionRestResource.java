package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.VersionDto;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Produces(MediaType.APPLICATION_JSON)
public interface VersionRestResource  extends RestResource{

    String PATH = "/version";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<VersionDto> getVersion();
}

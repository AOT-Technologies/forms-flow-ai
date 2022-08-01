package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.DeploymentRestService;
import org.camunda.bpm.engine.rest.dto.repository.DeploymentDto;
import org.camunda.bpm.engine.rest.mapper.MultipartFormData;
import org.camunda.bpm.extension.hooks.rest.DeploymentRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.core.UriInfo;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public class DeploymentRestResourceImpl implements DeploymentRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(FilterRestResourceImpl.class);

    private final DeploymentRestService restService;

    public DeploymentRestResourceImpl(DeploymentRestService deploymentRestService) {
        restService = deploymentRestService;
    }

    @Override
    public EntityModel<DeploymentDto> createDeployment(UriInfo uriInfo, MultipartFormData multipartFormData) {
        DeploymentDto deploymentDto = restService.createDeployment(uriInfo, multipartFormData);
        return EntityModel.of(deploymentDto, linkTo(methodOn(DeploymentRestResourceImpl.class).createDeployment(uriInfo, multipartFormData)).withSelfRel().withSelfRel());
    }
}

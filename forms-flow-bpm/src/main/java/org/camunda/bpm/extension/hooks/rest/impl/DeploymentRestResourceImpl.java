package org.camunda.bpm.extension.hooks.rest.impl;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.camunda.bpm.engine.rest.DeploymentRestService;
import org.camunda.bpm.engine.rest.dto.repository.DeploymentDto;
import org.camunda.bpm.engine.rest.dto.repository.DeploymentResourceDto;
import org.camunda.bpm.engine.rest.mapper.MultipartFormData;
import org.camunda.bpm.extension.hooks.rest.DeploymentRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class DeploymentRestResourceImpl implements DeploymentRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(FilterRestResourceImpl.class);

    private final DeploymentRestService restService;

    public DeploymentRestResourceImpl(DeploymentRestService deploymentRestService) {
        restService = deploymentRestService;
    }

    @Override
    public List<DeploymentDto> getDeployments(UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        return restService.getDeployments(uriInfo, firstResult, maxResults);
    }

    @Override
    public DeploymentDto createDeployment(UriInfo uriInfo, MultipartFormData multipartFormData) {
        return restService.createDeployment(uriInfo, multipartFormData);
    }

    @Override
    public List<DeploymentResourceDto> getDeploymentResources(String id) {
        return restService.getDeployment(id).getDeploymentResources().getDeploymentResources();
    }

    @Override
    public Response getDeploymentResourceData(String id, String resourceId) {
        return restService.getDeployment(id).getDeploymentResources().getDeploymentResourceData(resourceId);
    }

}

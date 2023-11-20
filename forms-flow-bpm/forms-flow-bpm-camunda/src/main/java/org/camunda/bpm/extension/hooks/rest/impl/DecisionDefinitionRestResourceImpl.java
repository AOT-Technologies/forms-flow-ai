package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.DecisionDefinitionRestService;
import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.repository.DecisionDefinitionDiagramDto;
import org.camunda.bpm.engine.rest.dto.repository.DecisionDefinitionDto;
import org.camunda.bpm.extension.hooks.rest.DecisionDefinitionRestResource;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.core.UriInfo;
import java.util.List;
import java.util.logging.Logger;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public class DecisionDefinitionRestResourceImpl implements DecisionDefinitionRestResource {

    private final Logger LOG = Logger.getLogger(DecisionDefinitionRestResourceImpl.class.getName());

    private final DecisionDefinitionRestService restService;

    public DecisionDefinitionRestResourceImpl(org.camunda.bpm.engine.rest.DecisionDefinitionRestService decisionDefinitionRestService) {
        restService = decisionDefinitionRestService;
    }

    @Override
    public List<DecisionDefinitionDto> getDecisionDefinitions(UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        return restService.getDecisionDefinitions(uriInfo, firstResult, maxResults);
    }

    @Override
    public EntityModel<DecisionDefinitionDto> getDecisionDefinition(String key) {
        DecisionDefinitionDto dto = restService.getDecisionDefinitionByKey(key).getDecisionDefinition();
        return EntityModel.of(dto, linkTo(methodOn(DecisionDefinitionRestResourceImpl.class).getDecisionDefinition(key)).withSelfRel());
    }

    @Override
    public EntityModel<DecisionDefinitionDiagramDto> getDecisionDefinitionDmnXml(String tenantId, String key) {
        DecisionDefinitionDiagramDto dto;
        if (tenantId!= null){
            dto =  restService.getDecisionDefinitionByKeyAndTenantId(key, tenantId).getDecisionDefinitionDmnXml();
        }
        else{
            dto =  restService.getDecisionDefinitionByKey(key).getDecisionDefinitionDmnXml();
        }

        return EntityModel.of(dto, linkTo(methodOn(DecisionDefinitionRestResourceImpl.class).getDecisionDefinitionDmnXml(tenantId, key)).withSelfRel());
    }

    @Override
    public CountResultDto getDecisionDefinitionsCount(UriInfo uriInfo){
        return restService.getDecisionDefinitionsCount(uriInfo);
    }
}

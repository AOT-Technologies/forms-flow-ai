package org.camunda.bpm.extension.hooks.rest.impl;

import jakarta.ws.rs.core.UriInfo;
import org.camunda.bpm.engine.rest.DecisionDefinitionRestService;
import org.camunda.bpm.engine.rest.dto.repository.DecisionDefinitionDiagramDto;
import org.camunda.bpm.engine.rest.dto.repository.DecisionDefinitionDto;
import org.camunda.bpm.extension.hooks.rest.DecisionDefinitionRestResource;

import java.util.List;
import java.util.logging.Logger;

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
    public DecisionDefinitionDto getDecisionDefinition(String key) {
        return restService.getDecisionDefinitionByKey(key).getDecisionDefinition();
    }

    @Override
    public DecisionDefinitionDiagramDto getDecisionDefinitionDmnXml(String tenantId, String key) {
        DecisionDefinitionDiagramDto decisionDefinitionDiagramDto;
        if (tenantId!= null){
            decisionDefinitionDiagramDto =  restService.getDecisionDefinitionByKeyAndTenantId(key, tenantId).getDecisionDefinitionDmnXml();
        }
        else{
            decisionDefinitionDiagramDto =  restService.getDecisionDefinitionByKey(key).getDecisionDefinitionDmnXml();
        }

        return decisionDefinitionDiagramDto;
    }
}

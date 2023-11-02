package org.camunda.bpm.extension.hooks.rest.dto;

import java.util.List;

import org.camunda.bpm.engine.rest.dto.VariableQueryParameterDto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskQueryDto {

    private String name;
    private Integer id;
    private String tenant;
    private String status;
    private org.camunda.bpm.engine.rest.dto.task.TaskQueryDto criteria;
    private List<TaskFilterVariableQueryDto> variables;
    private TaskVariableDto taskVisibleAttributes;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

    public String getTenant() {
        return tenant;
    }

    public void setTenant(String tenant) {
        this.tenant = tenant;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public org.camunda.bpm.engine.rest.dto.task.TaskQueryDto getCriteria() {
        return criteria;
    }

    public void setCriteria(org.camunda.bpm.engine.rest.dto.task.TaskQueryDto criteria) {
        this.criteria = criteria;
    }

    public List<TaskFilterVariableQueryDto> getVariables() {
        return variables;
    }

    public void setVariables(List<TaskFilterVariableQueryDto> variables) {
        this.variables = variables;
    }

    public TaskVariableDto getTaskVisibleAttributes() {
        return taskVisibleAttributes;
    }

    public void setTaskVisibleAttributes(TaskVariableDto taskVisibleAttributes) {
        this.taskVisibleAttributes = taskVisibleAttributes;
    }

}
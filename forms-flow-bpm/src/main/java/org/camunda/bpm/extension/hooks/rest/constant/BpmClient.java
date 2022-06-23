package org.camunda.bpm.extension.hooks.rest.constant;

public enum BpmClient {

    CAMUNDA("camunda");

    private String name;

    BpmClient(String name){
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

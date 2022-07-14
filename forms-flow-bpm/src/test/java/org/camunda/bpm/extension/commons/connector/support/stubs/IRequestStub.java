package org.camunda.bpm.extension.commons.connector.support.stubs;

import org.camunda.bpm.extension.commons.ro.req.IRequest;

import java.util.HashMap;
import java.util.Map;

public class IRequestStub implements IRequest {
    Map<String, Object> map = new HashMap<>();

    public IRequestStub() {
        map.put("{abc}","{abc}");
    }

    public Map<String, Object> getMap() {
        return map;
    }
}

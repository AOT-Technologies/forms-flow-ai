package org.camunda.bpm.extension.commons.utils;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by DELL on 09-07-2021.
 */
@Component
public class InMemoryCache {

    private  Map<String, Object> cache = new HashMap<>();

    public Object get(String key) {
        return cache.get(key);
    }

    public void put(String key, Object value) {
        this.cache.put(key, value);
    }
}

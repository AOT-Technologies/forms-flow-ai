package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Created by DELL on 06-08-2021.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application{
    private String applicationStatus;
    private String formUrl;
}

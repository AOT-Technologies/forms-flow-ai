package org.camunda.bpm.extension.hooks.delegates.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TextSentimentData{
    private String elementId;
    private List<String> topics;
    private String text;
}

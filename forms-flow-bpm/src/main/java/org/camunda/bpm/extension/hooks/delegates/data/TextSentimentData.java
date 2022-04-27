package org.camunda.bpm.extension.hooks.delegates.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TextSentimentData{

    public TextSentimentData(String elementId, List<String> topics, String text) {
        this.elementId = elementId;
        this.topics = topics;
        this.text = text;
    }

    private String elementId;
    private List<String> topics;
    private String text;
    private String overallSentiment;
}

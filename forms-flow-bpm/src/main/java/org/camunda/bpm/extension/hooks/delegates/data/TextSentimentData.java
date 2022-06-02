package org.camunda.bpm.extension.hooks.delegates.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Text Sentiment Data.
 * Class for holding Text Sentiment Data.
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
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

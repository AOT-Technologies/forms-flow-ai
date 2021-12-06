package org.camunda.bpm.extension.hooks.delegates.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TextSentimentRequest{
    private Integer applicationId;
    private String formUrl;
    private List<TextSentimentData> data;
}

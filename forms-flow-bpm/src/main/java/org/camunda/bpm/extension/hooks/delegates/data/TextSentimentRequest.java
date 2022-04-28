package org.camunda.bpm.extension.hooks.delegates.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TextSentimentRequest implements IResponse, IRequest, Serializable {

	private static final long serialVersionUID = 1L;

    private Integer applicationId;
    private String formUrl;
    private List<TextSentimentData> data;
}

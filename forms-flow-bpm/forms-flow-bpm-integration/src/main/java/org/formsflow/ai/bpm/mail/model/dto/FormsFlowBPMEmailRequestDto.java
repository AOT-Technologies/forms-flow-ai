package org.formsflow.ai.bpm.mail.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FormsFlowBPMEmailRequestDto {

    private String toRecipients;
    private String ccRecipients;
    private String subject;
    private String body;
    private List<String> attachments;

}
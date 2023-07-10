package org.formsflow.ai.bpm.mail.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomEmailDto {

    private List<String> toRecipients;
    private List<String> ccRecipients;
    private String subject;
    private String body;
    private List<String> attachments;

}

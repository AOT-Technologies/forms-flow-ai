package org.formsflow.ai.bpm.mail.service;


import org.formsflow.ai.bpm.mail.model.dto.FormsFlowBPMEmailRequestDto;

public interface FormsFlowBPMEmailAdapterService {

    public void sendMail(FormsFlowBPMEmailRequestDto dto);

}
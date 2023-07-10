package org.formsflow.ai.bpm.mail.service;


import org.formsflow.ai.bpm.mail.model.dto.CustomEmailDto;

public interface CustomEmailAdapterService {

	public void sendMail(CustomEmailDto dto);

}

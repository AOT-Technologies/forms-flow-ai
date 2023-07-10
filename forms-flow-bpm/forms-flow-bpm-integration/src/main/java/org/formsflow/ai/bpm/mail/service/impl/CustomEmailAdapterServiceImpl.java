package org.formsflow.ai.bpm.mail.service.impl;

import org.formsflow.ai.bpm.mail.model.dto.CustomEmailDto;
import org.formsflow.ai.bpm.mail.service.CustomEmailAdapterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import javax.mail.internet.MimeMessage;
import java.io.File;

@Component
public class CustomEmailAdapterServiceImpl implements CustomEmailAdapterService {

    @Autowired
    private JavaMailSender emailSender;

    @Override
    public void sendMail(CustomEmailDto dto) {
        try {
            MimeMessage message = emailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(dto.getToRecipients().toArray(new String[0]));
            helper.setCc(dto.getCcRecipients().toArray(new String[0]));
            helper.setSubject(dto.getSubject());
            helper.setText(dto.getBody(), true);

            for (String attachment : dto.getAttachments()) {
                File attachmentFile = new File(attachment);
                helper.addAttachment(attachmentFile.getName(), attachmentFile);
            }

            emailSender.send(message);
        } catch (Exception e) {
            // Handle any exceptions or logging here
            e.printStackTrace();
        }
    }
}
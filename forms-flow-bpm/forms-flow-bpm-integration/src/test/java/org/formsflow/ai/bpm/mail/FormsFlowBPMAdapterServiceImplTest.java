package org.formsflow.ai.bpm.mail;

import org.formsflow.ai.bpm.mail.model.dto.FormsFlowBPMEmailRequestDto;
import org.formsflow.ai.bpm.mail.service.impl.FormsFlowBPMAdapterServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

@ExtendWith(SpringExtension.class)
public class FormsFlowBPMAdapterServiceImplTest {

    @Mock
    private MimeMessage message;


    @Test
    public void sendEmail_with_success() throws MessagingException {
        String recipient = "example@test.com";
        String subject = "Test Email";
        FormsFlowBPMEmailRequestDto request = new FormsFlowBPMEmailRequestDto();
        request.setToRecipients(recipient);
        request.setSubject(subject);
        JavaMailSender javaMailSender = Mockito.mock(JavaMailSender.class);
        FormsFlowBPMAdapterServiceImpl emailService = Mockito.mock(FormsFlowBPMAdapterServiceImpl.class);
        ArgumentCaptor<MimeMessage> mimeMessageArgumentCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        Mockito.when(javaMailSender.createMimeMessage()).thenReturn(message);

        emailService.sendMail(request);
        Mockito.doNothing().when(javaMailSender).send(message);
    }
}
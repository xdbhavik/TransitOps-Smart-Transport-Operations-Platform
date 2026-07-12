package com.Transitops.odoo.config;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessagePreparator;

import java.io.InputStream;

@Configuration
public class MailSenderConfig {

    @Bean
    @Primary
    @ConditionalOnProperty(prefix = "app.mail", name = "mode", havingValue = "log", matchIfMissing = true)
    public JavaMailSender loggingMailSender() {
        return new LoggingJavaMailSender();
    }

    @Slf4j
    private static final class LoggingJavaMailSender implements JavaMailSender {

        private final JavaMailSender delegate = new JavaMailSenderImpl();

        @Override
        public MimeMessage createMimeMessage() {
            return delegate.createMimeMessage();
        }

        @Override
        public MimeMessage createMimeMessage(InputStream contentStream) throws MailException {
            return delegate.createMimeMessage(contentStream);
        }

        @Override
        public void send(MimeMessage mimeMessage) throws MailException {
            log.info("License reminder mail send requested via MimeMessage (log mode)");
        }

        @Override
        public void send(MimeMessage... mimeMessages) throws MailException {
            log.info("License reminder mail send requested for {} MimeMessage item(s) (log mode)", mimeMessages.length);
        }

        @Override
        public void send(MimeMessagePreparator mimeMessagePreparator) throws MailException {
            log.info("License reminder mail send requested via MimeMessagePreparator (log mode)");
        }

        @Override
        public void send(MimeMessagePreparator... mimeMessagePreparators) throws MailException {
            log.info("License reminder mail send requested for {} MimeMessagePreparator item(s) (log mode)", mimeMessagePreparators.length);
        }

        @Override
        public void send(SimpleMailMessage simpleMessage) throws MailException {
            log.info("License reminder email log mode -> to={}, subject={}, text={}",
                    String.join(",", simpleMessage.getTo() == null ? new String[0] : simpleMessage.getTo()),
                    simpleMessage.getSubject(),
                    simpleMessage.getText());
        }

        @Override
        public void send(SimpleMailMessage... simpleMessages) throws MailException {
            for (SimpleMailMessage simpleMessage : simpleMessages) {
                send(simpleMessage);
            }
        }
    }
}
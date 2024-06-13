package org.camunda.bpm.extension.commons.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.vault.core.VaultTemplate;
import org.springframework.vault.support.VaultResponse;
import org.springframework.vault.core.VaultKeyValueOperationsSupport.KeyValueBackend;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class VaultConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(VaultConfig.class);

    private static VaultTemplate vaultTemplate;
    private static String vaultPath;
    private static String vaultSecret;

    @Autowired(required = false)
    public void setVaultTemplate(VaultTemplate template) {
        vaultTemplate = template;
    }

    @Value("${spring.cloud.vault.path}")
    public void setVaultPath(String path) {
        vaultPath = path;
    }

    @Value("${spring.cloud.vault.secret}")
    public void setVaultSecret(String secret) {
        vaultSecret = secret;
    }

    public static String getSecret() {
        try {
            VaultResponse vaultResponse = vaultTemplate
                    .opsForKeyValue(vaultPath, KeyValueBackend.KV_2)
                    .get(vaultSecret);

            if (vaultResponse != null && vaultResponse.getData() != null) {
                LOGGER.debug("Fetching vault data from path: {} and Secret: {}", vaultPath, vaultSecret);
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.writeValueAsString(vaultResponse.getData());
            } else {
                LOGGER.debug("No data found for vault for path: {} and secret: {}", vaultPath, vaultSecret);
                return "No data found for secret " + vaultSecret;
            }
        } catch (JsonProcessingException e) {
            LOGGER.error("Error processing JSON: {}", e.getMessage());
            return "Error processing JSON: " + e.getMessage();
        }
    }
}

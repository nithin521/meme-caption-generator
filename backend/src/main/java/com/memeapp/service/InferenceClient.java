package com.memeapp.service;

import com.memeapp.dto.GenerateRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

/**
 * Thin HTTP client for the Python FastAPI inference microservice
 * (see inference-service/main.py).
 */
@Component
public class InferenceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public InferenceClient(RestTemplate restTemplate, @Value("${app.inference.base-url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    @SuppressWarnings("unchecked")
    public List<String> generate(GenerateRequest req) {
        Map<String, Object> body = Map.of(
                "prompt", req.getPrompt(),
                "n", req.getN(),
                "temperature", req.getTemperature(),
                "top_k", req.getTopK(),
                "top_p", req.getTopP(),
                "max_new_tokens", req.getMaxNewTokens(),
                "repetition_penalty", req.getRepetitionPenalty()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(
                    baseUrl + "/generate", entity, Map.class);
            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from inference service");
            }
            return (List<String>) response.get("captions");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Inference service error: " + e.getMessage());
        }
    }

    public String ocr(byte[] fileBytes, String filename, String contentType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(form, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(baseUrl + "/ocr", entity, Map.class);
            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from OCR service");
            }
            return String.valueOf(response.get("text"));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "OCR service error: " + e.getMessage());
        }
    }
}

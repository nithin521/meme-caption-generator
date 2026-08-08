package com.memeapp.controller;

import com.memeapp.dto.CaptionResponse;
import com.memeapp.dto.GenerateRequest;
import com.memeapp.security.AuthenticatedUser;
import com.memeapp.service.CaptionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Upload a meme image -> extract its text via OCR -> optionally feed that
 * text back into the generator as a prompt to produce fresh captions.
 */
@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    private final CaptionService captionService;

    public OcrController(CaptionService captionService) {
        this.captionService = captionService;
    }

    @PostMapping(value = "/extract", consumes = "multipart/form-data")
    public Map<String, String> extractText(@RequestParam("file") MultipartFile file) {
        String text = captionService.uploadAndExtractText(file);
        return Map.of("text", text);
    }

    /**
     * One-shot: upload an image, OCR it, store the image, and generate n
     * new captions using the OCR'd text as the prompt.
     */
    @PostMapping(value = "/generate", consumes = "multipart/form-data")
    public List<CaptionResponse> ocrThenGenerate(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "5") int n,
            @RequestParam(defaultValue = "0.75") double temperature,
            @RequestParam(defaultValue = "40") int topK,
            @RequestParam(defaultValue = "0.90") double topP,
            @RequestParam(defaultValue = "25") int maxNewTokens,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String ocrText = captionService.uploadAndExtractText(file);
        String imageUrl = captionService.storeImage(file);

        GenerateRequest req = new GenerateRequest();
        req.setPrompt(ocrText);
        req.setN(n);
        req.setTemperature(temperature);
        req.setTopK(topK);
        req.setTopP(topP);
        req.setMaxNewTokens(maxNewTokens);

        return captionService.generate(req, principal, imageUrl);
    }
}

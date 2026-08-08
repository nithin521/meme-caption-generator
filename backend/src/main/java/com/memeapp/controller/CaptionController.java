package com.memeapp.controller;

import com.memeapp.dto.CaptionResponse;
import com.memeapp.dto.GenerateRequest;
import com.memeapp.security.AuthenticatedUser;
import com.memeapp.service.CaptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/captions")
public class CaptionController {

    private final CaptionService captionService;

    public CaptionController(CaptionService captionService) {
        this.captionService = captionService;
    }

    /** Generate N new captions using the tunable model params (temperature, top_k, top_p, etc). */
    @PostMapping("/generate")
    public List<CaptionResponse> generate(
            @Valid @RequestBody GenerateRequest req,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return captionService.generate(req, principal, null);
    }

    /** Public, paginated gallery feed. sort=recent|top */
    @GetMapping("/gallery")
    public Page<CaptionResponse> gallery(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "recent") String sort,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return captionService.getGallery(page, size, sort, principal);
    }

    @PostMapping("/{id}/like")
    public CaptionResponse like(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser principal) {
        return captionService.toggleLike(id, principal);
    }

    @PostMapping("/{id}/favorite")
    public Map<String, Boolean> favorite(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser principal) {
        captionService.addFavorite(id, principal);
        return Map.of("favorited", true);
    }

    @DeleteMapping("/{id}/favorite")
    public Map<String, Boolean> unfavorite(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser principal) {
        captionService.removeFavorite(id, principal);
        return Map.of("favorited", false);
    }

    @GetMapping("/favorites")
    public List<CaptionResponse> favorites(@AuthenticationPrincipal AuthenticatedUser principal) {
        return captionService.getFavorites(principal);
    }
}

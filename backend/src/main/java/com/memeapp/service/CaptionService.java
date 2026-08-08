package com.memeapp.service;

import com.memeapp.dto.CaptionResponse;
import com.memeapp.dto.GenerateRequest;
import com.memeapp.model.Caption;
import com.memeapp.model.CaptionLike;
import com.memeapp.model.Favorite;
import com.memeapp.model.User;
import com.memeapp.repository.CaptionLikeRepository;
import com.memeapp.repository.CaptionRepository;
import com.memeapp.repository.FavoriteRepository;
import com.memeapp.repository.UserRepository;
import com.memeapp.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class CaptionService {

    private final CaptionRepository captionRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final CaptionLikeRepository captionLikeRepository;
    private final InferenceClient inferenceClient;
    private final FileStorageService fileStorageService;

    public CaptionService(
            CaptionRepository captionRepository,
            UserRepository userRepository,
            FavoriteRepository favoriteRepository,
            CaptionLikeRepository captionLikeRepository,
            InferenceClient inferenceClient,
            FileStorageService fileStorageService
    ) {
        this.captionRepository = captionRepository;
        this.userRepository = userRepository;
        this.favoriteRepository = favoriteRepository;
        this.captionLikeRepository = captionLikeRepository;
        this.inferenceClient = inferenceClient;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public List<CaptionResponse> generate(GenerateRequest req, AuthenticatedUser principal, String imageUrl) {
        List<String> texts = inferenceClient.generate(req);

        User user = principal == null ? null : userRepository.findById(principal.userId()).orElse(null);

        return texts.stream().map(text -> {
            Caption caption = new Caption();
            caption.setText(text);
            caption.setPrompt(req.getPrompt());
            caption.setImageUrl(imageUrl);
            caption.setCreatedBy(user);
            caption.setTemperature(req.getTemperature());
            caption.setTopK(req.getTopK());
            caption.setTopP(req.getTopP());
            caption.setMaxNewTokens(req.getMaxNewTokens());
            caption.setPublicVisible(req.isSaveToGallery());

            if (req.isSaveToGallery()) {
                captionRepository.save(caption);
            }
            return toResponse(caption, principal);
        }).toList();
    }

    public Page<CaptionResponse> getGallery(int page, int size, String sort, AuthenticatedUser principal) {
        PageRequest pageRequest = PageRequest.of(page, size);

        Page<Caption> captions = "top".equalsIgnoreCase(sort)
                ? captionRepository.findByPublicVisibleTrueOrderByLikeCountDesc(pageRequest)
                : captionRepository.findByPublicVisibleTrueOrderByCreatedAtDesc(pageRequest);

        return captions.map(c -> toResponse(c, principal));
    }

    @Transactional
    public CaptionResponse toggleLike(Long captionId, AuthenticatedUser principal) {
        Caption caption = captionRepository.findById(captionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Caption not found"));

        Optional<CaptionLike> existing = captionLikeRepository.findByUserIdAndCaptionId(principal.userId(), captionId);
        if (existing.isPresent()) {
            captionLikeRepository.delete(existing.get());
            caption.setLikeCount(Math.max(0, caption.getLikeCount() - 1));
        } else {
            User user = userRepository.getReferenceById(principal.userId());
            CaptionLike like = new CaptionLike();
            like.setUser(user);
            like.setCaption(caption);
            captionLikeRepository.save(like);
            caption.setLikeCount(caption.getLikeCount() + 1);
        }
        captionRepository.save(caption);
        return toResponse(caption, principal);
    }

    @Transactional
    public void addFavorite(Long captionId, AuthenticatedUser principal) {
        if (favoriteRepository.findByUserIdAndCaptionId(principal.userId(), captionId).isPresent()) {
            return;
        }
        Caption caption = captionRepository.findById(captionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Caption not found"));
        User user = userRepository.getReferenceById(principal.userId());

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setCaption(caption);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long captionId, AuthenticatedUser principal) {
        favoriteRepository.deleteByUserIdAndCaptionId(principal.userId(), captionId);
    }

    public List<CaptionResponse> getFavorites(AuthenticatedUser principal) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(principal.userId()).stream()
                .map(f -> toResponse(f.getCaption(), principal))
                .toList();
    }

    public String uploadAndExtractText(org.springframework.web.multipart.MultipartFile file) {
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded file");
        }
        return inferenceClient.ocr(bytes, file.getOriginalFilename(), file.getContentType());
    }

    public String storeImage(org.springframework.web.multipart.MultipartFile file) {
        return fileStorageService.store(file);
    }

    private CaptionResponse toResponse(Caption c, AuthenticatedUser principal) {
        boolean liked = false;
        boolean favorited = false;
        if (principal != null) {
            liked = captionLikeRepository.findByUserIdAndCaptionId(principal.userId(), c.getId()).isPresent();
            favorited = favoriteRepository.findByUserIdAndCaptionId(principal.userId(), c.getId()).isPresent();
        }
        return new CaptionResponse(
                c.getId(),
                c.getText(),
                c.getPrompt(),
                c.getImageUrl(),
                c.getCreatedBy() != null ? c.getCreatedBy().getUsername() : "anonymous",
                c.getLikeCount(),
                liked,
                favorited,
                c.getCreatedAt()
        );
    }
}

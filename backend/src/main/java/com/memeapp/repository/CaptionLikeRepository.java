package com.memeapp.repository;

import com.memeapp.model.CaptionLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CaptionLikeRepository extends JpaRepository<CaptionLike, Long> {
    Optional<CaptionLike> findByUserIdAndCaptionId(Long userId, Long captionId);
    void deleteByUserIdAndCaptionId(Long userId, Long captionId);
}

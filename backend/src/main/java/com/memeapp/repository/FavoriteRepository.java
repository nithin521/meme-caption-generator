package com.memeapp.repository;

import com.memeapp.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Favorite> findByUserIdAndCaptionId(Long userId, Long captionId);
    void deleteByUserIdAndCaptionId(Long userId, Long captionId);
}

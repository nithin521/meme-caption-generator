package com.memeapp.repository;

import com.memeapp.model.Caption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaptionRepository extends JpaRepository<Caption, Long> {
    Page<Caption> findByPublicVisibleTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<Caption> findByPublicVisibleTrueOrderByLikeCountDesc(Pageable pageable);
}

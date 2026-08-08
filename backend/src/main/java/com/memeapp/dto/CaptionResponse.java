package com.memeapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class CaptionResponse {
    private Long id;
    private String text;
    private String prompt;
    private String imageUrl;
    private String createdByUsername;
    private long likeCount;
    private boolean likedByCurrentUser;
    private boolean favoritedByCurrentUser;
    private Instant createdAt;
}

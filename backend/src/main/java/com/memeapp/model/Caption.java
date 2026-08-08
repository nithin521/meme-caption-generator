package com.memeapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "captions")
@Getter
@Setter
@NoArgsConstructor
public class Caption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(length = 200)
    private String prompt;

    @Column(length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(nullable = false)
    private long likeCount = 0;

    @Column(nullable = false)
    private boolean publicVisible = true;

    private Double temperature;
    private Integer topK;
    private Double topP;
    private Integer maxNewTokens;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}

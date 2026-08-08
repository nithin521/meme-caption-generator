package com.memeapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "caption_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "caption_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class CaptionLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caption_id")
    private Caption caption;
}

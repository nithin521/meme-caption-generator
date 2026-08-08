-- Reference schema. Spring Boot creates/updates these automatically via
-- spring.jpa.hibernate.ddl-auto=update, but this file is handy for manual
-- provisioning or review.

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS captions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    prompt VARCHAR(200),
    image_url VARCHAR(500),
    created_by BIGINT,
    like_count BIGINT NOT NULL DEFAULT 0,
    public_visible BOOLEAN NOT NULL DEFAULT TRUE,
    temperature DOUBLE,
    top_k INT,
    top_p DOUBLE,
    max_new_tokens INT,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    caption_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uq_user_caption_fav (user_id, caption_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (caption_id) REFERENCES captions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS caption_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    caption_id BIGINT NOT NULL,
    UNIQUE KEY uq_user_caption_like (user_id, caption_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (caption_id) REFERENCES captions(id) ON DELETE CASCADE
);

package com.memeapp.security;

/** Lightweight principal stored in the SecurityContext after JWT validation. */
public record AuthenticatedUser(Long userId, String username) {
}

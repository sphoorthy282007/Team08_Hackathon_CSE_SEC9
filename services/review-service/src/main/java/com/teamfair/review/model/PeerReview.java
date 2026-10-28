package com.teamfair.review.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "peer_reviews")
public class PeerReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long teamId;
    private Long reviewerId;
    private Long revieweeId;
    private Integer rating;
    private String feedback;
    private LocalDateTime submittedAt = LocalDateTime.now();

    public PeerReview() {}
    public PeerReview(Long teamId, Long reviewerId, Long revieweeId, Integer rating, String feedback) {
        this.teamId = teamId;
        this.reviewerId = reviewerId;
        this.revieweeId = revieweeId;
        this.rating = rating;
        this.feedback = feedback;
    }

    public Long getId() { return id; }
    public Long getTeamId() { return teamId; }
    public Long getReviewerId() { return reviewerId; }
    public Long getRevieweeId() { return revieweeId; }
    public Integer getRating() { return rating; }
    public String getFeedback() { return feedback; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}

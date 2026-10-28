package com.teamfair.dispute.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")
public class Dispute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long teamId;
    private Long raisedBy;
    private String title;
    private String description;
    private String status = "OPEN"; // OPEN, UNDER_REVIEW, RESOLVED, REJECTED
    private LocalDateTime createdAt = LocalDateTime.now();

    public Dispute() {}
    public Dispute(Long teamId, Long raisedBy, String title, String description) {
        this.teamId = teamId;
        this.raisedBy = raisedBy;
        this.title = title;
        this.description = description;
    }

    public Long getId() { return id; }
    public Long getTeamId() { return teamId; }
    public Long getRaisedBy() { return raisedBy; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setStatus(String status) { this.status = status; }
}

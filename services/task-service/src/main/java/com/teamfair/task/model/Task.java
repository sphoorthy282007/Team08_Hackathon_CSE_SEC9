package com.teamfair.task.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long teamId;
    private Long assignedTo;
    private String title;
    private String description;
    private String status; // TODO, IN_PROGRESS, COMPLETED
    private String evidenceUrl;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Task() {}
    public Task(Long teamId, Long assignedTo, String title, String description, String status, String evidenceUrl) {
        this.teamId = teamId;
        this.assignedTo = assignedTo;
        this.title = title;
        this.description = description;
        this.status = status;
        this.evidenceUrl = evidenceUrl;
    }

    public Long getId() { return id; }
    public Long getTeamId() { return teamId; }
    public Long getAssignedTo() { return assignedTo; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getEvidenceUrl() { return evidenceUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setStatus(String status) { this.status = status; }
    public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }
}

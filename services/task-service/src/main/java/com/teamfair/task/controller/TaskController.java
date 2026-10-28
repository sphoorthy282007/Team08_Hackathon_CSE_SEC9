package com.teamfair.task.controller;

import com.teamfair.task.model.Task;
import com.teamfair.task.repository.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping("/team/{teamId}")
    public List<Task> getTasksByTeam(@PathVariable Long teamId) {
        return taskRepository.findByTeamId(teamId);
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long id, @RequestBody Task statusUpdate) {
        return taskRepository.findById(id).map(task -> {
            task.setStatus(statusUpdate.getStatus());
            if (statusUpdate.getEvidenceUrl() != null) {
                task.setEvidenceUrl(statusUpdate.getEvidenceUrl());
            }
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }
}

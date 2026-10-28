package com.teamfair.dispute.controller;

import com.teamfair.dispute.model.Dispute;
import com.teamfair.dispute.repository.DisputeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")
public class DisputeController {

    private final DisputeRepository disputeRepository;

    public DisputeController(DisputeRepository disputeRepository) {
        this.disputeRepository = disputeRepository;
    }

    @GetMapping
    public List<Dispute> getAllDisputes() {
        return disputeRepository.findAll();
    }

    @GetMapping("/team/{teamId}")
    public List<Dispute> getDisputesByTeam(@PathVariable Long teamId) {
        return disputeRepository.findByTeamId(teamId);
    }

    @PostMapping
    public Dispute createDispute(@RequestBody Dispute dispute) {
        return disputeRepository.save(dispute);
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Dispute> resolveDispute(@PathVariable Long id, @RequestBody Dispute resolution) {
        return disputeRepository.findById(id).map(dispute -> {
            dispute.setStatus(resolution.getStatus());
            return ResponseEntity.ok(disputeRepository.save(dispute));
        }).orElse(ResponseEntity.notFound().build());
    }
}

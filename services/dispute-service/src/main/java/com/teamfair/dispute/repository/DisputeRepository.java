package com.teamfair.dispute.repository;

import com.teamfair.dispute.model.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByTeamId(Long teamId);
    List<Dispute> findByStatus(String status);
}

package com.teamfair.review.repository;

import com.teamfair.review.model.PeerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<PeerReview, Long> {
    List<PeerReview> findByTeamId(Long teamId);
}

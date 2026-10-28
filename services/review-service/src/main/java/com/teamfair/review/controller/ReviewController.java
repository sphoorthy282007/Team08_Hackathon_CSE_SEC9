package com.teamfair.review.controller;

import com.teamfair.review.model.PeerReview;
import com.teamfair.review.repository.ReviewRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/team/{teamId}")
    public List<PeerReview> getReviewsByTeam(@PathVariable Long teamId) {
        return reviewRepository.findByTeamId(teamId);
    }

    @PostMapping
    public PeerReview submitReview(@RequestBody PeerReview review) {
        return reviewRepository.save(review);
    }
}

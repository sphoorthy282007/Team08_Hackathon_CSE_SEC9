-- TeamFair Database Initialization & Schema Definition

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN'))
);

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    project_title VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    team_id INT NOT NULL,
    assigned_to INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'TODO',
    evidence_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS peer_reviews (
    id SERIAL PRIMARY KEY,
    team_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disputes (
    id SERIAL PRIMARY KEY,
    team_id INT NOT NULL,
    raised_by INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispute_evidence (
    id SERIAL PRIMARY KEY,
    dispute_id INT REFERENCES disputes(id) ON DELETE CASCADE,
    evidence_url TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS dispute_actions (
    id SERIAL PRIMARY KEY,
    dispute_id INT REFERENCES disputes(id) ON DELETE CASCADE,
    faculty_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Clean Real Data
INSERT INTO users (name, email, password_hash, role) VALUES
('Alice Miller', 'alice@teamfair.edu', '$2a$10$e8.Z/yA.k9/x.g98y', 'STUDENT'),
('Bob Smith', 'bob@teamfair.edu', '$2a$10$e8.Z/yA.k9/x.g98y', 'STUDENT'),
('Carol Davis', 'carol@teamfair.edu', '$2a$10$e8.Z/yA.k9/x.g98y', 'STUDENT'),
('Dr. Robert Vance', 'faculty@teamfair.edu', '$2a$10$e8.Z/yA.k9/x.g98y', 'FACULTY');

INSERT INTO teams (team_name, project_title) VALUES
('Team Alpha', 'Microservices Dispute Tracking Platform'),
('Team Beta', 'AI Automated Peer Feedback System');

INSERT INTO team_members (team_id, user_id) VALUES 
(1, 1), (1, 2), (2, 3);

INSERT INTO tasks (team_id, assigned_to, title, description, status, evidence_url) VALUES
(1, 1, 'Architecture & API Gateway Design', 'Set up Spring Cloud Gateway and Eureka Discovery Server', 'COMPLETED', 'https://github.com/teamfair/repo/pull/14'),
(1, 1, 'Dispute Service Implementation', 'Created REST API for student dispute submission', 'COMPLETED', 'https://github.com/teamfair/repo/pull/22'),
(1, 2, 'Database Schema & Integration', 'Configured PostgreSQL schemas and initial JPA mappings', 'IN_PROGRESS', 'https://github.com/teamfair/repo/pull/08');

INSERT INTO peer_reviews (team_id, reviewer_id, reviewee_id, rating, feedback) VALUES
(1, 1, 2, 2, 'Bob missed 2 out of 3 sprint check-ins and backend commits were incomplete prior to milestone review.'),
(1, 2, 1, 5, 'Alice handled the entire Gateway setup, architecture docs, and CI/CD workflow.');

INSERT INTO disputes (team_id, raised_by, title, description, status) VALUES
(1, 1, 'Unequal Workload in Sprint 2 Microservices Integration', 'I completed 80% of backend integration and gateway routes. Requesting fair evaluation review by faculty.', 'OPEN');

INSERT INTO dispute_evidence (dispute_id, evidence_url, description) VALUES
(1, 'https://github.com/teamfair/repo/graphs/contributors', 'Commit graph showing 42 commits by Alice vs 4 commits by Bob.'),
(1, 'https://docs.google.com/document/d/architecture-spec', 'System Architecture Document written entirely by Alice.');

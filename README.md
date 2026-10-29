# 🛡️ TeamFair - Microservices Group Contribution & Dispute Platform

TeamFair is an enterprise-grade microservices web application built to solve student workload contribution disputes in academic group projects. It provides task tracking, transparent peer reviews, evidence-backed dispute submission, and an administrative faculty decision portal with audit logs.

---

## 🏗️ Microservices Architecture Overview

- **Service Discovery**: Netflix Eureka Server (`:8761`)
- **API Gateway**: Spring Cloud Gateway with JWT routing (`:8080`)
- **User Service**: User Authentication, JWT Tokens & Role-Based Access Control (`:8081`)
- **Task Service**: Task Lifecycle, Owner Assignments & Work References (`:8082`)
- **Review Service**: Peer Ratings & Confidential Feedback (`:8083`)
- **Dispute Service**: Evidence-Backed Case Management, Audit Logging & Faculty Actions (`:8084`)
- **Frontend App**: React 18 + Vite + Bootstrap 5 Clean Enterprise Dashboard (`:3000` mapped to container `:5173`)
- **Persistence**: PostgreSQL Database (`:5432`)

---

## 🚀 Step-by-Step Instructions to Run the Project

### ⚡ 1-Click Launchers (Windows .BAT Files)

- **Start Application**: Double-click `START_TEAMFAIR.bat`
  - Verifies dependencies, boots the TeamFair server on `http://localhost:5173`, and automatically opens your browser.
- **Stop Application**: Double-click `STOP_TEAMFAIR.bat`
  - Shuts down the servers and frees ports `5173` and `3000`.

---

### Method 1: Run Entire System with Docker Compose (Single Command)

1. Ensure **Docker Desktop** is open and running on your system.
2. Open terminal in this directory and execute:
   ```bash
   docker-compose up --build
   ```
3. Access services in your browser:
   - **TeamFair Web Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Spring Cloud Gateway**: [http://localhost:8080](http://localhost:8080)
   - **Eureka Discovery Server**: [http://localhost:8761](http://localhost:8761)

---

### Method 2: Running Locally Without Docker

#### Prerequisites
- Java 17+
- Node.js (v18+) & npm
- PostgreSQL database running on `localhost:5432`

1. **Initialize Database**:
   Import `init_schema.sql` into your local PostgreSQL database `teamfair_db`.

2. **Start Service Discovery**:
   ```bash
   cd discovery-server && ./mvnw spring-boot:run
   ```

3. **Start API Gateway & Microservices**:
   Run each in a separate terminal:
   ```bash
   cd gateway && ./mvnw spring-boot:run
   cd services/user-service && ./mvnw spring-boot:run
   cd services/task-service && ./mvnw spring-boot:run
   cd services/review-service && ./mvnw spring-boot:run
   cd services/dispute-service && ./mvnw spring-boot:run
   ```

4. **Start Frontend Application**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🎯 Course Outcome (CO) Verification Checklist
- **CO1 (Architecture & Microservices)**: Independent User, Task, Review, and Dispute Spring Boot REST APIs with clean layered design.
- **CO2 (Security & Observability)**: Spring Security with JWT authentication, RBAC endpoints, and Spring Boot Actuator endpoints (`/actuator/health`).
- **CO3 (Discovery, Routing & DB)**: Netflix Eureka registration, Spring Cloud Gateway routes, PostgreSQL persistence with foreign keys & audit logs.
- **CO4 (Testing, CI/CD & Demo)**: JUnit 5 unit tests, GitHub Actions CI workflow (`.github/workflows/ci-cd.yml`), Docker Compose single-command execution.

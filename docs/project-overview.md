# OGame Task Automation - Project Overview

## Project Summary
A comprehensive task automation solution for the OGame browser game, consisting of:
- **Backend API**: Spring Boot 3 REST API with JWT authentication
- **Frontend**: Angular web application for bot management
- **Bot Scripts**: Tampermonkey userscripts for automated gameplay

## Architecture

### Backend (Spring Boot 3)
- **Framework**: Spring Boot 3.3.x with Java 17
- **Database**: MariaDB production, H2 in-memory for testing
- **Authentication**: JWT tokens with Spring Security
- **API Documentation**: Swagger/OpenAPI 3
- **Build Tool**: Maven

### Key Entities
- `UserAccount`: System users with role-based access
- `Universe`: OGame universe configurations
- `Bot`: Bot instances linked to user accounts and universes
- `Task`: Automated tasks with scheduling and parameters
- `TaskResult`: Execution results and logging

### Database Configuration
- **Production**: MariaDB at 192.168.0.10
- **User**: ogame_user
- **Database**: ogame_automation
- **Connection**: Validated and operational

## Current Status

### ✅ Completed
- [x] Complete Spring Boot backend structure
- [x] All entities, repositories, and services
- [x] JWT authentication system
- [x] Database schema and sample data
- [x] MariaDB connection and validation
- [x] REST API endpoints (Auth + initial Task controller)
- [x] Docker configuration
- [x] API testing and validation
- [x] Git repository initialization

### 🔄 In Progress
- [ ] Git repository setup and initial commit
- [ ] GitHub repository creation

### 📋 Next Steps
1. **Frontend Development**: Angular application
2. **Bot Scripts**: Tampermonkey userscripts
3. **API Expansion**: Additional REST endpoints
4. **Deployment**: Docker containerization
5. **Testing**: Comprehensive test suite

## Development Environment

### Prerequisites
- Java 17
- Maven 3.6+
- MariaDB 10.x
- Node.js (for frontend)
- Docker (optional)

### Running the Backend
```bash
# Using MariaDB profile
mvn spring-boot:run -Dspring-boot.run.profiles=mariadb

# Using H2 in-memory database
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### API Access
- **Base URL**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger-ui.html
- **Authentication**: POST /api/auth/login

## Project Structure
```
ogame-automation/
├── src/main/java/com/ogame/automation/
│   ├── entity/          # JPA entities
│   ├── repository/      # Data repositories
│   ├── service/         # Business logic
│   ├── controller/      # REST controllers
│   ├── config/          # Configuration classes
│   └── dto/             # Data transfer objects
├── src/main/resources/
│   ├── application.yml  # Configuration
│   └── static/          # Static resources
├── docs/                # Documentation
├── docker/              # Docker configurations
└── pom.xml              # Maven configuration
```

## Technology Stack
- **Backend**: Spring Boot 3, Spring Security, Spring Data JPA
- **Database**: MariaDB, H2 (testing)
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Build**: Maven
- **Containerization**: Docker
- **Version Control**: Git

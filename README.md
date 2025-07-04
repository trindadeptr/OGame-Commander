# OGame Task Automation System

A comprehensive multi-component automation solution for the OGame browser game, featuring a Spring Boot backend, Angular frontend, and Tampermonkey bot scripts for automated gameplay.

![Project Status](https://img.shields.io/badge/Status-Backend%20Complete-green)
![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-brightgreen)
![Angular](https://img.shields.io/badge/Angular-17-red)

## 🏗️ Architecture Overview

| Component | Technology Stack | Status | Path |
|-----------|------------------|--------|------|
| **Backend** | Java 17, Spring Boot 3, MariaDB, JWT | ✅ Complete (95%) | `/backend` |
| **Frontend** | Angular 17, TailwindCSS | ❌ Not Started | `/frontend` |
| **Bot Scripts** | Tampermonkey (JavaScript) | ❌ Not Started | `/bot` |
| **Database** | MariaDB 10.x | ✅ Complete | - |
| **Documentation** | Markdown | ✅ Complete | `/docs` |

## 🚀 Quick Start

### Prerequisites

- **Java 17** (Temurin recommended)
- **Maven 3.6+**
- **MariaDB 10.x** 
- **Node.js** (for frontend development)
- **Docker & Docker Compose** (optional)

### Running the Backend

```bash
# Clone the repository
git clone <repository-url>
cd ogame-automation

# Build and run with MariaDB (production)
cd backend
./mvnw clean install
./mvnw spring-boot:run

# Alternative: Run with H2 in-memory database (development)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Using Docker

```bash
# Start MariaDB + Backend services
docker-compose up --build

# Backend will be available at http://localhost:8080
```

## 📋 Core Features

### ✅ Implemented (Backend)
- **JWT Authentication & Authorization** with role-based access (ADMIN/USER)
- **Multi-universe Support** with universe-specific configurations
- **Task Queue System** with states: `CREATED`, `IN_PROGRESS`, `FINISHED`, `ERROR`
- **Bot Registration and Tracking** with automatic status updates
- **Task Result Storage** with full execution history
- **RESTful API** with comprehensive Swagger documentation
- **Database Schema** with proper relationships and constraints
- **Docker Support** for easy deployment
- **CORS Configuration** ready for frontend integration

### 🔄 Task Types (Phase 1)
- `CHECK_ACTIVITY` - Scan planets and moons for activity indicators
- `SPY_PLAYER` - Player espionage tasks (planned)

### 📊 Key Entities
- **UserAccount**: System users with role-based access control
- **Universe**: OGame universe configurations with Discord webhooks
- **Bot**: Bot instances linked to specific universes
- **Task**: Automated tasks with scheduling and parameters
- **TaskResult**: Detailed execution results and logging

## 🔧 API Documentation

### Authentication
```bash
# Login to get JWT token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use token for authenticated requests
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Main Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/auth/login` | Authenticate user | ❌ |
| GET | `/api/tasks` | List tasks (with filters) | ✅ |
| POST | `/api/tasks` | Create new task | ✅ |
| PUT | `/api/tasks/{id}/complete` | Complete task | ✅ |
| GET | `/api/bots` | List bots and status | ✅ |
| GET | `/api/universes` | List universes | ✅ (ADMIN) |
| GET | `/api/users` | Manage users | ✅ (ADMIN) |

**Full API Documentation**: http://localhost:8080/swagger-ui.html

## 🗄️ Database Configuration

### Production (MariaDB)
```properties
Host: 192.168.0.10:3306
Database: ogame_automation
User: ogame_user
Password: [configured]
```

### Development (H2)
```bash
# In-memory database for testing
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Default Admin User
- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
ogame-automation/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/ogame/automation/
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Data repositories
│   │   ├── service/           # Business logic
│   │   ├── controller/        # REST controllers
│   │   ├── config/            # Configuration classes
│   │   ├── security/          # Security components
│   │   └── util/              # Utility classes
│   ├── src/main/resources/
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md
├── frontend/                   # Angular application (planned)
├── bot/                       # Tampermonkey scripts (planned)
├── scripts/                   # Database and utility scripts
│   ├── setup-database.sql    # Complete database initialization
│   └── README.md             # Scripts documentation
├── docs/                      # Project documentation
│   ├── requirements.md        # Full requirements specification
│   ├── auth.md               # Authentication details
│   ├── backend.md            # Backend documentation
│   ├── frontend.md           # Frontend specifications
│   ├── bot.md                # Bot development guide
│   ├── database.md           # Database schema
│   └── PROJECT_PROGRESS.md   # Development progress
├── docker-compose.yml
└── README.md
```

## 🎯 Development Roadmap

### Phase 1: Backend Foundation ✅
- [x] Spring Boot 3 application structure
- [x] JWT authentication system
- [x] Database schema and entities
- [x] REST API endpoints
- [x] Docker configuration
- [x] API documentation
- [x] Testing and validation

### Phase 2: Frontend Development (Next)
- [ ] Angular 17 application setup
- [ ] TailwindCSS styling framework
- [ ] Authentication service with JWT handling
- [ ] Task management interface
- [ ] Bot monitoring dashboard
- [ ] User and universe administration

### Phase 3: Bot Development
- [ ] Tampermonkey script framework
- [ ] OGame game state detection
- [ ] Task execution engine
- [ ] Backend API integration
- [ ] Error handling and recovery

### Phase 4: Production Deployment
- [ ] Environment-specific configurations
- [ ] Monitoring and logging
- [ ] Security hardening
- [ ] Performance optimization

## 🔐 Security Features

- **JWT Token Authentication** with configurable expiration
- **Role-Based Access Control** (ADMIN/USER permissions)
- **Password Encryption** using BCrypt
- **CORS Configuration** for secure frontend integration
- **SQL Injection Protection** via JPA/Hibernate
- **Input Validation** and sanitization

## 🐳 Docker Support

### Development
```bash
# Start only MariaDB
docker-compose up mariadb

# Start full stack
docker-compose up
```

### Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up --build
```

## 📚 Documentation

Detailed documentation is available in the `/docs` folder:

- **[Requirements](docs/requirements.md)** - Complete functional requirements
- **[Backend Guide](docs/backend.md)** - Spring Boot development details
- **[Frontend Specs](docs/frontend.md)** - Angular application specifications
- **[Bot Development](docs/bot.md)** - Tampermonkey script guide
- **[Database Schema](docs/database.md)** - MariaDB configuration
- **[Authentication](docs/auth.md)** - JWT implementation details
- **[Progress Report](docs/PROJECT_PROGRESS.md)** - Current development status

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### API Testing
Use the provided Swagger UI at http://localhost:8080/swagger-ui.html or import the API collection into Postman.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

### Current Issues
- **Circular Reference**: JSON serialization needs `@JsonManagedReference`/`@JsonBackReference` annotations
- **Task Filters**: Advanced filtering implementation pending
- **Discord Integration**: Webhook notification system not yet implemented

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions, issues, or contributions:

1. Check the [documentation](docs/) first
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information
4. Join our Discord server (coming soon)

## 📊 Project Status

**Current Progress: ~40% Complete**

| Component | Progress | Status |
|-----------|----------|--------|
| Backend Core | 95% | ✅ Complete |
| Database Schema | 100% | ✅ Complete |
| Authentication | 100% | ✅ Complete |
| REST API | 80% | ✅ Functional |
| Documentation | 90% | ✅ Complete |
| Docker Setup | 100% | ✅ Complete |
| Frontend | 0% | ❌ Not Started |
| Bot Scripts | 0% | ❌ Not Started |
| Deployment | 0% | ❌ Not Started |

---

**Last Updated**: June 28, 2025  
**Author**: Pedro (with AI assistance)  
**Status**: Backend Phase Complete, Ready for Frontend Development

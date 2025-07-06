# OGame Automation Backend

Spring Boot backend for the OGame Task Automation System.

## Technology Stack

- **Java 21** (Eclipse Temurin)
- **Spring Boot 3.3.0**
- **Spring Security** with JWT authentication
- **Spring Boot Actuator** for health monitoring
- **JPA/Hibernate** for database access
- **MariaDB** database
- **Swagger UI** for API documentation
- **Maven** for build management
- **Docker** with multi-stage builds

## Database Configuration

The application connects to MariaDB with these settings:
- Host: `192.168.0.10:3306`
- Database: `ogame`
- User: `ogame_user`
- Password: `example`

## Running the Application

### Prerequisites

1. Java 21 installed
2. MariaDB running with the database schema applied
3. Database accessible at configured host

### Local Development

```bash
# Build the application
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### Docker

```bash
# From project root directory
docker-compose up --build
```

This will start both MariaDB and the backend application.

### Docker Features

The Dockerfile includes several production-ready features:
- **Multi-stage build** for smaller final image
- **Java 21** (Eclipse Temurin) for both build and runtime
- **Non-root user** for security
- **Health check** using Spring Boot Actuator
- **JVM optimizations** for container environments
- **Dependency caching** for faster builds

## API Documentation

Once the application is running, you can access:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs
- **Health Check**: http://localhost:8080/actuator/health

## Authentication

### Default Admin User

The application creates a default admin user:
- Username: `admin`
- Password: `thisisjustanexamplepassword`

Note: change this password when app is in production!

### Login Process

1. POST to `/api/auth/login` with credentials
2. Receive JWT token in response
3. Include token in Authorization header: `Bearer <token>`

## Main Endpoints

### Authentication
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/auth/login` | Authenticate user | ❌ |

### Task Management
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/tasks` | List tasks (with pagination) | ✅ |
| POST | `/api/tasks` | Create new task | ✅ |
| GET | `/api/tasks/{id}` | Get task details | ✅ |
| GET | `/api/tasks/status/{status}` | Get tasks by status | ✅ |
| GET | `/api/tasks/universe/{universeId}` | Get tasks by universe | ✅ |
| GET | `/api/tasks/universe/{universeId}/available` | Get available tasks for bots | ✅ |
| PUT | `/api/tasks/{id}/assign` | Assign task to bot | ✅ |
| PUT | `/api/tasks/{id}/complete` | Complete task with results | ✅ |
| DELETE | `/api/tasks/{id}` | Delete task | ✅ (ADMIN) |

### Bot Management
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/bots` | List all bots | ✅ |
| GET | `/api/bots/{id}` | Get bot by ID | ✅ |
| GET | `/api/bots/uuid/{uuid}` | Get bot by UUID | ✅ |
| GET | `/api/bots/universe/{universeId}` | Get bots by universe | ✅ |
| POST | `/api/bots` | Create new bot | ✅ (ADMIN) |
| PUT | `/api/bots/{id}` | Update bot | ✅ (ADMIN) |
| PUT | `/api/bots/{id}/heartbeat` | Update bot heartbeat | ✅ |
| PUT | `/api/bots/uuid/{uuid}/heartbeat` | Update bot heartbeat by UUID | ✅ |
| DELETE | `/api/bots/{id}` | Delete bot | ✅ (ADMIN) |

### Universe Management
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/universes` | List universes | ✅ |
| GET | `/api/universes/{id}` | Get universe by ID | ✅ |
| POST | `/api/universes` | Create universe | ✅ (ADMIN) |
| PUT | `/api/universes/{id}` | Update universe | ✅ (ADMIN) |
| DELETE | `/api/universes/{id}` | Delete universe | ✅ (ADMIN) |

### User Management
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/users` | List users | ✅ (ADMIN) |
| GET | `/api/users/{id}` | Get user by ID | ✅ (ADMIN) |
| POST | `/api/users` | Create user | ✅ (ADMIN) |
| PUT | `/api/users/{id}` | Update user | ✅ (ADMIN) |
| DELETE | `/api/users/{id}` | Delete user | ✅ (ADMIN) |

## Project Structure

```
src/main/java/com/ogame/automation/
├── entity/           # JPA entities
├── repository/       # Spring Data repositories
├── service/          # Business logic
├── controller/       # REST controllers
├── auth/            # JWT authentication
└── config/          # Spring configuration
```

## Features Implemented

✅ **Core Infrastructure**
- JWT Authentication & Authorization with role-based access control
- User management with ADMIN/USER roles
- Multi-universe support with Discord webhook integration
- Comprehensive REST API with Swagger documentation
- CORS configuration for frontend integration
- Docker support with MariaDB

✅ **Task Management System**
- Complete task lifecycle management (CREATED → IN_PROGRESS → FINISHED/ERROR)
- Task queue with filtering and pagination
- Task assignment to bots by UUID
- Task completion with detailed result storage
- Support for recurring tasks with configurable intervals
- Automatic task rescheduling for recurring tasks

✅ **Bot Management**
- Bot registration and tracking with UUIDs
- Bot heartbeat monitoring and status tracking
- Bot-to-universe association
- Stale task detection and auto-recovery (30-minute timeout)

✅ **Advanced Features**
- Discord webhook notifications for task events
- Scheduled background processes for task management
- Data initialization with default admin user
- Comprehensive service layer with business logic
- Complete repository layer with custom queries

✅ **Operational Features**
- Automatic cleanup of stale in-progress tasks
- Recurring task processing (every minute)
- Daily cleanup scheduler (placeholder for data archival)
- Error handling and graceful degradation

## Task Types Supported

- `CHECK_ACTIVITY` - Monitor player activity
- `SPY_PLAYER` - Spy on specific players

## Next Steps

The backend is **production-ready** and supports:

### 🚀 **Ready for Integration**
1. **Frontend Integration** - All endpoints documented and tested
2. **Bot (Tampermonkey) Integration** - Complete bot lifecycle API
3. **Discord Notifications** - Webhook integration implemented

### 🛠️ **Future Enhancements**
1. **Additional Task Types** - Extend the TaskType enum and add parameters
2. **Advanced Scheduling** - Cron-based scheduling for complex patterns
3. **Performance Monitoring** - Task execution metrics and reporting
4. **Data Archival** - Implement the cleanup service for old task data
5. **Rate Limiting** - Add API rate limiting for bot endpoints
6. **Caching** - Redis integration for improved performance

## API Usage Examples

### Creating a Task
```json
POST /api/tasks
{
  "type": "SPY_PLAYER",
  "universeId": 1,
  "playerName": "TargetPlayer",
  "parameters": "{\"coordinates\": \"1:234:5\"}",
  "recurrenceMinutes": 60
}
```

### Bot Workflow
1. **Register/Update Bot Heartbeat:**
   ```
   PUT /api/bots/uuid/{bot-uuid}/heartbeat
   ```

2. **Get Available Tasks:**
   ```
   GET /api/tasks/universe/{universe-id}/available
   ```

3. **Assign Task to Bot:**
   ```json
   PUT /api/tasks/{task-id}/assign
   {
     "botUuid": "your-bot-uuid"
   }
   ```

4. **Complete Task:**
   ```json
   PUT /api/tasks/{task-id}/complete
   {
     "success": true,
     "result": "{\"spyReport\": \"...\", \"timestamp\": \"...\"}",
     "errorMessage": null,
     "executionTimeMs": 2500
   }
   ```

### Discord Webhook Payload Example
```json
{
  "embeds": [{
    "title": "OGame Task Completed",
    "color": 3066993,
    "fields": [
      {"name": "Status", "value": "✅ SUCCESS", "inline": true},
      {"name": "Task Type", "value": "SPY_PLAYER", "inline": true},
      {"name": "Universe", "value": "Universe 1", "inline": true}
    ]
  }]
}
```
